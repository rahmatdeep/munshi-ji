import { Prisma, prisma } from "@repo/db";

const PHHC_API_BASE = "https://livedb9010.digitalls.in";

const HEADERS = {
  Origin: "https://new.phhc.gov.in",
  Referer: "https://new.phhc.gov.in/",
  Accept: "application/json",
};

import {
  FetchCaseInput,
  CaseResponse,
  HearingResponse,
  OrderItem,
  ObjectionResponse,
  PartyDetail,
  HearingItem,
  FullPHHCCaseData,
  RelatedCase,
  LacRecord,
  FirRecord,
  DistrictRecord,
  CopyingRecord,
  ComplaintRecord,
  ImpugnedRecord,
} from "../types/phhc";

/**
 * Fetches JSON from a PHHC API endpoint with standard headers.
 */
async function phhcFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(
      `PHHC API error: ${res.status} ${res.statusText} for ${url}`,
    );
  }
  return res.json() as Promise<T>;
}

/**
 * Safely parses a date string and appends IST offset if missing.
 * Handles YYYY-MM-DD, DD-MM-YYYY, and ISO formats.
 */
export function parseISTDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;

  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // 1. If it already has time/timezone (ISO or similar), parse directly
  if (trimmed.includes("T") || trimmed.includes(":") || (trimmed.includes(" ") && trimmed.length > 10)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  // 2. Handle YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T00:00:00+05:30`);
    return isNaN(d.getTime()) ? null : d;
  }

  // 3. Handle DD-MM-YYYY (Common in Indian Gov sites)
  const ddmmyyyyMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [_, d, m, y] = ddmmyyyyMatch;
    const dObj = new Date(`${y}-${m}-${d}T00:00:00+05:30`);
    return isNaN(dObj.getTime()) ? null : dObj;
  }

  // Fallback
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}


// ─── Main service functions ──────────────────────────────────────

/**
 * Only fetches data from PHHC APIs. Does NOT touch the database.
 * Endpoints are called conditionally based on the boolean flags
 * returned by the getCase response.
 */
export async function fetchPHHCCase(
  input: FetchCaseInput,
): Promise<FullPHHCCaseData | null> {
  const { case_type, case_no, case_year } = input;

  // 1. Fetch main case data first to get the internal ID and flags
  const caseData = await phhcFetch<CaseResponse>(
    `${PHHC_API_BASE}/cis_filing/public/getCase?case_no=${case_no}&case_type=${case_type}&case_year=${case_year}`,
  );

  if (!caseData || !caseData.id || !caseData.case_no) {
    return null;
  }

  const internalId = caseData.id;

  // 2. Build promises — always-called endpoints
  const objectionsPromise = phhcFetch<ObjectionResponse>(
    `${PHHC_API_BASE}/public/case-objections?case_no=${case_no}&case_year=${case_year}&case_type=${case_type}&skip=0&limit=200`,
  ).catch((e) => {
    console.warn("Objections fetch failed:", e.message);
    return null;
  });

  const appealPromise = phhcFetch<unknown[]>(
    `${PHHC_API_BASE}/cis_filing/public/fetchDetailsOfAppeal?pcase_no=${case_no}&pcase_year=${case_year}&pcase_type=${case_type}`,
  ).catch((e) => {
    console.warn("Appeals fetch failed:", e.message);
    return [];
  });

  const mediationPromise = phhcFetch<unknown>(
    `${PHHC_API_BASE}/cis_filing/public/getMediationDetailsByCaseTypeCaseNoAndCaseYear?case_type=${case_type}&case_no=${case_no}&case_year=${case_year}`,
  ).catch((e) => {
    console.warn("Mediation fetch failed:", e.message);
    return null;
  });

  // 3. Conditional endpoints based on flags
  const hearingPromise = caseData.isCaseListingRecord
    ? phhcFetch<HearingResponse>(
        `${PHHC_API_BASE}/case_listing_detail/public/search?case_no=${case_no}&case_year=${case_year}&case_type=${case_type}`,
      ).catch((e) => {
        console.warn("Hearings fetch failed:", e.message);
        return null;
      })
    : Promise.resolve(null);

  const ordersPromise = caseData.isJudgementRecord
    ? phhcFetch<OrderItem[]>(
        `${PHHC_API_BASE}/cis_filing/public/judgmentDetails/${case_no}/${case_year}/${case_type}?skip=0&limit=1000`,
      ).catch((e) => {
        console.warn("Orders fetch failed:", e.message);
        return [] as OrderItem[];
      })
    : Promise.resolve([] as OrderItem[]);

  const relatedPromise = caseData.isRelatedCaseRecord
    ? phhcFetch<RelatedCase[]>(
        `${PHHC_API_BASE}/cis_filing/public/relatedCases?caseDetail_id=${internalId}&limit=1000`,
      ).catch((e) => {
        console.warn("Related cases fetch failed:", e.message);
        return [] as RelatedCase[];
      })
    : Promise.resolve([] as RelatedCase[]);

  const lacPromise = caseData.isLacRecord
    ? phhcFetch<LacRecord>(
        `${PHHC_API_BASE}/cis_filing/public/getLACDetailsbyCaseNoCaseYearCaseDetails?case_no=${case_no}&case_year=${case_year}&case_type=${case_type}`,
      ).catch((e) => {
        console.warn("LAC fetch failed:", e.message);
        return null;
      })
    : Promise.resolve(null);

  const firPromise = caseData.isFirRecord
    ? phhcFetch<FirRecord[]>(
        `${PHHC_API_BASE}/cis_filing/public/FIR/${case_no}/${case_year}/${case_type}`,
      ).catch((e) => {
        console.warn("FIR fetch failed:", e.message);
        return null;
      })
    : Promise.resolve(null);

  const districtPromise = caseData.isDistrictRecord
    ? phhcFetch<DistrictRecord[]>(
        `${PHHC_API_BASE}/lct_dist_web/?case_no=${case_no}&case_year=${case_year}&case_type=${case_type}`,
      ).catch((e) => {
        console.warn("District fetch failed:", e.message);
        return null;
      })
    : Promise.resolve(null);

  const copyingPromise = caseData.isCopyingRecord
    ? phhcFetch<CopyingRecord>(
        `${PHHC_API_BASE}/HC-Copying-Applications-Case-Details-Public/?case_no=${case_no}&case_year=${case_year}&case_type=${case_type}`,
      ).catch((e) => {
        console.warn("Copying fetch failed:", e.message);
        return null;
      })
    : Promise.resolve(null);

  const complaintPromise = caseData.iscomplaintRecord
    ? phhcFetch<ComplaintRecord>(
        `${PHHC_API_BASE}/cis_filing/public/getComplainDetailsByCaseTypeCaseNumber?case_no=${case_no}&case_year=${case_year}&case_type=${case_type}`,
      ).catch((e) => {
        console.warn("Complaint fetch failed:", e.message);
        return null;
      })
    : Promise.resolve(null);

  const impugnedPromise = caseData.isImpugnedRecord
    ? phhcFetch<ImpugnedRecord>(
        `${PHHC_API_BASE}/cis_filing/public/getImpugnedOrderDetails?case_no=${case_no}&case_year=${case_year}&case_type=${case_type}`,
      ).catch((e) => {
        console.warn("Impugned fetch failed:", e.message);
        return null;
      })
    : Promise.resolve(null);

  // 4. Fire all in parallel
  const [
    objectionsData,
    appealData,
    mediationData,
    hearingData,
    ordersData,
    relatedData,
    lacData,
    firData,
    districtData,
    copyingData,
    complaintData,
    impugnedData,
  ] = await Promise.all([
    objectionsPromise,
    appealPromise,
    mediationPromise,
    hearingPromise,
    ordersPromise,
    relatedPromise,
    lacPromise,
    firPromise,
    districtPromise,
    copyingPromise,
    complaintPromise,
    impugnedPromise,
  ]);

  return {
    caseData,
    // Always called
    appealData,
    objectionsData,
    mediationData,
    // Conditional
    hearingData,
    ordersData,
    relatedData,
    lacData,
    firData,
    districtData,
    copyingData,
    complaintData,
    impugnedData,
  };
}

/**
 * Persists the already-fetched PHHC data into the database.
 */
export async function storePHHCCase(
  input: FetchCaseInput,
  data: FullPHHCCaseData,
) {
  const { case_type, case_no, case_year } = input;
  const {
    caseData,
    hearingData,
    ordersData,
    objectionsData,
    appealData,
    relatedData,
    mediationData,
    lacData,
    firData,
    districtData,
    copyingData,
    complaintData,
    impugnedData,
  } = data;

  const rawData = {
    caseResponse: caseData,
    appealData,
    relatedData,
    mediationData,
    lacData,
    firData,
    districtData,
    copyingData,
    complaintData,
    impugnedData,
  } as unknown as Prisma.InputJsonValue;

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
        cnrNo: caseData.cnr_no?.toString() ?? null,
        filingNo: caseData.filling_no?.toString() ?? null,
        regDate: parseISTDate(caseData.reg_date),
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
        nextListingDate: parseISTDate(caseData.listing_or_proposal_date),
        disposalDate: parseISTDate(caseData.disposal_date),
        disposalType: caseData.disposal_type,
        lastSyncedAt: parseISTDate(new Date().toISOString()),
        rawData,
      },
      create: {
        caseType: case_type,
        caseNo: case_no,
        caseYear: case_year,
        cnrNo: caseData.cnr_no?.toString() ?? null,
        filingNo: caseData.filling_no?.toString() ?? null,
        regDate: parseISTDate(caseData.reg_date),
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
        nextListingDate: parseISTDate(caseData.listing_or_proposal_date),
        disposalDate: parseISTDate(caseData.disposal_date),
        disposalType: caseData.disposal_type,
        lastSyncedAt: parseISTDate(new Date().toISOString()),
        rawData,
      },
    });

    const caseId = savedCase.id;

    // ── Parties: delete old & re-create ──────────────────────────
    await tx.caseParty.deleteMany({ where: { caseId } });

    const allParties = [
      ...(caseData.petitionerDetails ?? []).map((p: PartyDetail) => ({
        caseId,
        srNo: p.sr_no ?? 0,
        type: "P" as const,
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
        type: "R" as const,
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

    const hearings = (hearingData?.data ?? []).map((h: HearingItem) => ({
      caseId,
      hearingDate: parseISTDate(h.cl_date)!,
      benchCode: h.bench_code,
      benchName: h.benchDetails?.bench_name ?? null,
      benchType: h.bench_type,
      srNo: h.sr_no,
      listType: h.cl_type,
      hearingStatus: h.hearing_status,
      courtNo: h.court_no?.toString() ?? null,
    }));

    if (hearings.length > 0) {
      await tx.caseHearing.createMany({ data: hearings });
    }

    // ── Orders: delete old & re-create ───────────────────────────
    await tx.caseOrder.deleteMany({ where: { caseId } });

    const orders = (ordersData ?? []).map((o: OrderItem) => ({
      caseId,
      orderDate: parseISTDate(o.orderdate)!,
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

    const objections = (objectionsData?.data ?? []).map((obj) => ({
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

