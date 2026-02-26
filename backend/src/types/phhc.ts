import { z } from 'zod';

export interface FetchCaseInput {

    case_type: string;
    case_no: string;
    case_year: number;
}

export interface PartyDetail {
    sr_no: number;
    pet_res: string; // "P" or "R"
    partyname: string;
    address: string | null;
    email: string | null;
    mobile: string | null;
    age: number | null;
    sex: string | null;
}

export interface CaseResponse {
    pet_name: string | null;
    res_name: string | null;
    pet_adv_name: string | null;
    res_adv_name: string | null;
    cnr_no: string | null;
    filling_no: string | null;
    reg_date: string | null;
    bench_name: string | null;
    listing_or_proposal_date: string | null;
    disposal_date: string | null;
    disposal_type: string | null;
    category: number | null;
    cat_desc: string | null;
    case_no: string;
    case_year: number;
    case_type: string;
    status: { status_desc: string } | null;
    district: { name: string } | null;
    establishments: { name: string } | null;
    petitionerDetails: PartyDetail[] | null;
    respondentDetails: PartyDetail[] | null;
    [key: string]: unknown;
}

export interface HearingItem {
    cl_date: string;
    bench_code: number | null;
    bench_type: string | null;
    sr_no: number | null;
    cl_type: string | null;
    hearing_status: string | null;
    court_no: string | null;
    benchDetails: {
        bench_name: string | null;
    } | null;
}

export interface HearingResponse {
    data: HearingItem[];
}

export interface OrderItem {
    orderdate: string;
    order_type: string | null;
    bench_name: string | null;
    bench_code: number | null;
    pdfname: string | null;
    order: string | null;
}

export interface ObjectionResponse {
    totalCount: number;
    data: Record<string, unknown>[];
}

export const VALID_CASE_TYPES = [
    'CWP', 'CRM-M', 'CR', 'RSA', 'CRR', 'CRA-S', 'FAO', 'CM', 'CRM', 'ARB',
    'ARB-DC', 'ARB-ICA', 'CA', 'CA-CWP', 'CA-MISC', 'CACP', 'CAPP', 'CCEC',
    'CCES', 'CEA', 'CEC', 'CEGC', 'CESR', 'CLAIM', 'CM-INCOMP', 'CMA', 'CMM',
    'CO', 'CO-COM', 'COA', 'COCP', 'COMM-PET-M', 'CP', 'CP-MISC', 'CR-COM',
    'CRA', 'CRA-AD', 'CRA-AS', 'CRA-D', 'CRACP', 'CREF', 'CRM-A',
    'CRM-CLT-OJ', 'CRM-W', 'CROCP', 'CRR(F)', 'CRREF', 'CRWP', 'CS', 'CS-OS',
    'CUSAP', 'CWP-COM', 'CWP-PIL', 'DP', 'EA', 'EDC', 'EDREF', 'EFA',
    'EFA-COM', 'EP', 'EP-COM', 'ESA', 'FAO(FC)', 'FAO-C', 'FAO-CARB',
    'FAO-COM', 'FAO-ICA', 'FAO-M', 'FEMA-APPL', 'FORM-8A', 'GCR', 'GSTA',
    'GSTR', 'GTA', 'GTC', 'GTR', 'GVATR', 'INCOMP', 'INTTA', 'IOIN', 'ITA',
    'ITC', 'ITR', 'LPA', 'LR', 'MATRF', 'MRC', 'O&M', 'OLR', 'PBPT-APPL',
    'PBT', 'PMLA-APPL', 'PVR', 'RA', 'RA-CA', 'RA-CP', 'RA-CR', 'RA-CW',
    'RA-LP', 'RA-RF', 'RA-RS', 'RCRWP', 'RERA-APPL', 'RFA', 'RFA-COM', 'RP',
    'SA', 'SAO', 'SAO(FS)', 'SDR', 'STA', 'STC', 'STR', 'TA', 'TA-COM', 'TC',
    'TCRM', 'TEST', 'UVA', 'UVR', 'VATAP', 'VATCASE', 'VATREF', 'WTA', 'WTC',
    'WTR', 'XOBJ', 'XOBJC', 'XOBJL', 'XOBJR', 'XOBJS',
] as const;

export const fetchCaseSchema = z.object({
    case_type: z.enum(VALID_CASE_TYPES, {
        message: 'Invalid case type',
    }),
    case_no: z.string().min(1, 'Case number is required'),
    case_year: z.number().int().min(1900).max(2100),
});

