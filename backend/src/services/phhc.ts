import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';


const PHHC_API_BASE = 'https://livedb9010.digitalls.in';

const HEADERS = {
    'Origin': 'https://new.phhc.gov.in',
    'Referer': 'https://new.phhc.gov.in/',
    'Accept': 'application/json',
};

import {
    FetchCaseInput,
    CaseResponse,
    HearingResponse,
    OrderItem,
    ObjectionResponse,
    PartyDetail,
    HearingItem,
    FullPHHCCaseData
} from '../types/phhc';

/**
 * Fetches JSON from a PHHC API endpoint with standard headers.
 */
async function phhcFetch<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
        throw new Error(`PHHC API error: ${res.status} ${res.statusText} for ${url}`);
    }
    return res.json() as Promise<T>;
}


// ─── Main service functions ──────────────────────────────────────

/**
 * Only fetches data from PHHC APIs. Does NOT touch the database.
 */
export async function fetchPHHCCase(input: FetchCaseInput): Promise<FullPHHCCaseData | null> {
    const { case_type, case_no, case_year } = input;

    // 1. Fetch all 5 endpoints in parallel
    const [caseData, hearingData, ordersData, objectionsData, appealData] = await Promise.all([
        phhcFetch<CaseResponse>(
            `${PHHC_API_BASE}/cis_filing/public/getCase?case_no=${case_no}&case_type=${case_type}&case_year=${case_year}`
        ),
        phhcFetch<HearingResponse>(
            `${PHHC_API_BASE}/case_listing_detail/public/search?case_no=${case_no}&case_year=${case_year}&case_type=${case_type}`
        ),
        phhcFetch<OrderItem[]>(
            `${PHHC_API_BASE}/cis_filing/public/judgmentDetails/${case_no}/${case_year}/${case_type}?skip=0&limit=1000`
        ),
        phhcFetch<ObjectionResponse>(
            `${PHHC_API_BASE}/public/case-objections?case_no=${case_no}&case_year=${case_year}&case_type=${case_type}&skip=0&limit=200`
        ),
        phhcFetch<unknown[]>(
            `${PHHC_API_BASE}/cis_filing/public/fetchDetailsOfAppeal?pcase_no=${case_no}&pcase_year=${case_year}&pcase_type=${case_type}`
        ),
    ]);

    // Check if case exists on PHHC (caseData is usually present but maybe empty?)
    // Based on previous code, if caseData exists we proceed. 
    // Usually caseData.cnr_no or similar would be missing if not found.
    if (!caseData || !caseData.case_no) {
        return null;
    }

    return {
        caseData,
        hearingData,
        ordersData,
        objectionsData,
        appealData,
    };
}

/**
 * Persists the already-fetched PHHC data into the database.
 */
export async function storePHHCCase(input: FetchCaseInput, data: FullPHHCCaseData) {
    const { case_type, case_no, case_year } = input;
    const { caseData, hearingData, ordersData, objectionsData, appealData } = data;

    // Upsert the case inside a transaction
    return prisma.$transaction(async (tx) => {
        // Upsert the core case record
        const savedCase = await tx.case.upsert({
            where: {
                caseType_caseNo_caseYear: {
                    caseType: case_type,
                    caseNo: case_no,
                    caseYear: case_year,
                },
            },
            update: {
                cnrNo: caseData.cnr_no,
                filingNo: caseData.filling_no,
                regDate: caseData.reg_date ? new Date(caseData.reg_date) : null,
                petName: caseData.pet_name,
                resName: caseData.res_name,
                petAdvName: caseData.pet_adv_name,
                resAdvName: caseData.res_adv_name,
                benchName: caseData.bench_name,
                status: caseData.status?.status_desc ?? null,
                category: caseData.category?.toString() ?? null,
                categoryDesc: caseData.cat_desc,
                district: caseData.district?.name?.trim() ?? null,
                establishment: caseData.establishments?.name?.trim() ?? null,
                nextListingDate: caseData.listing_or_proposal_date
                    ? new Date(caseData.listing_or_proposal_date)
                    : null,
                disposalDate: caseData.disposal_date
                    ? new Date(caseData.disposal_date)
                    : null,
                disposalType: caseData.disposal_type,
                rawData: {
                    caseResponse: caseData,
                    appealData,
                } as Prisma.InputJsonValue,
            },
            create: {
                caseType: case_type,
                caseNo: case_no,
                caseYear: case_year,
                cnrNo: caseData.cnr_no,
                filingNo: caseData.filling_no,
                regDate: caseData.reg_date ? new Date(caseData.reg_date) : null,
                petName: caseData.pet_name,
                resName: caseData.res_name,
                petAdvName: caseData.pet_adv_name,
                resAdvName: caseData.res_adv_name,
                benchName: caseData.bench_name,
                status: caseData.status?.status_desc ?? null,
                category: caseData.category?.toString() ?? null,
                categoryDesc: caseData.cat_desc,
                district: caseData.district?.name?.trim() ?? null,
                establishment: caseData.establishments?.name?.trim() ?? null,
                nextListingDate: caseData.listing_or_proposal_date
                    ? new Date(caseData.listing_or_proposal_date)
                    : null,
                disposalDate: caseData.disposal_date
                    ? new Date(caseData.disposal_date)
                    : null,
                disposalType: caseData.disposal_type,
                rawData: {
                    caseResponse: caseData,
                    appealData,
                } as Prisma.InputJsonValue,
            },
        });

        const caseId = savedCase.id;

        // ── Parties: delete old & re-create ──────────────────────────
        await tx.caseParty.deleteMany({ where: { caseId } });

        const allParties = [
            ...(caseData.petitionerDetails ?? []).map((p: PartyDetail) => ({
                caseId,
                srNo: p.sr_no ?? 0,
                type: 'P' as const,
                name: p.partyname,
                address: p.address,
                email: p.email,
                mobile: p.mobile,
                age: p.age,
                sex: p.sex,
            })),
            ...(caseData.respondentDetails ?? []).map((p: PartyDetail) => ({
                caseId,
                srNo: p.sr_no ?? 0,
                type: 'R' as const,
                name: p.partyname,
                address: p.address,
                email: p.email,
                mobile: p.mobile,
                age: p.age,
                sex: p.sex,
            })),
        ];

        if (allParties.length > 0) {
            await tx.caseParty.createMany({ data: allParties });
        }

        // ── Hearings: delete old & re-create ─────────────────────────
        await tx.caseHearing.deleteMany({ where: { caseId } });

        const hearings = (hearingData.data ?? []).map((h: HearingItem) => ({
            caseId,
            hearingDate: new Date(h.cl_date),
            benchCode: h.bench_code,
            benchName: h.benchDetails?.bench_name ?? null,
            benchType: h.bench_type,
            srNo: h.sr_no,
            listType: h.cl_type,
            hearingStatus: h.hearing_status,
            courtNo: h.court_no,
        }));

        if (hearings.length > 0) {
            await tx.caseHearing.createMany({ data: hearings });
        }

        // ── Orders: delete old & re-create ───────────────────────────
        await tx.caseOrder.deleteMany({ where: { caseId } });

        const orders = (ordersData ?? []).map((o: OrderItem) => ({
            caseId,
            orderDate: new Date(o.orderdate),
            orderType: o.order_type,
            benchName: o.bench_name,
            benchCode: o.bench_code,
            pdfUrl: o.order,
            pdfName: o.pdfname,
        }));

        if (orders.length > 0) {
            await tx.caseOrder.createMany({ data: orders });
        }

        // ── Objections: delete old & re-create ───────────────────────
        await tx.caseObjection.deleteMany({ where: { caseId } });

        const objections = (objectionsData.data ?? []).map((obj) => ({
            caseId,
            rawData: obj as Prisma.InputJsonValue,
        }));


        if (objections.length > 0) {
            await tx.caseObjection.createMany({ data: objections });
        }

        // Return the full case with relations
        return tx.case.findUnique({
            where: { id: caseId },
            include: {
                parties: true,
                hearings: true,
                orders: true,
                objections: true,
            },
        });
    });
}

/**
 * Legacy wrapper: Fetches and stores PHHC data.
 */
export async function fetchAndStorePHHCCase(input: FetchCaseInput) {
    const data = await fetchPHHCCase(input);
    if (!data) return null;
    return storePHHCCase(input, data);
}
