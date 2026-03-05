/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FileText,
  Calendar,
  Hash,
  CheckCircle,
  Briefcase,
  Search,
  ChevronRight,
} from "lucide-react";
import type { FullPHHCCaseData } from "../../../backend/src/types/phhc";
import { formatDate } from "../lib/date";

interface CaseViewProps {
  caseData: FullPHHCCaseData | any;
  caseType?: string;
  caseNo?: string;
  caseYear?: string;
  children?: React.ReactNode;
}

export default function CaseView({
  caseData,
  caseType,
  caseNo,
  caseYear,
  children,
}: CaseViewProps) {
  if (!caseData) return null;

  // --------------------------------------------------------------------------
  // Normalize Data for Both Sources
  //
  // Source 1 (Search API): /api/cases/fetch
  //   Returns: FullPHHCCaseData -> { caseData: CaseResponse, hearingData: {...}, ... }
  //
  // Source 2 (DB API): /api/cases/:id
  //   Returns: Prisma Case Model -> { pName, rName, hearings: [...], parties: [...] }
  // --------------------------------------------------------------------------

  // Check if it's the raw PHHC format (Source 1)
  const isRawPHHC = !!caseData.caseData;
  const rawCore = isRawPHHC ? caseData.caseData : null;

  // Normalized Fields
  const dispCaseType = caseData.caseType || rawCore?.case_type || caseType;
  const dispCaseNo = caseData.caseNo || rawCore?.case_no || caseNo;
  const dispCaseYear = caseData.caseYear || rawCore?.case_year || caseYear;

  const status = caseData.status || rawCore?.status?.status_desc;

  const petName =
    caseData.petName ||
    caseData.parties?.[0]?.petName ||
    rawCore?.pet_name ||
    rawCore?.petitionerDetails?.[0]?.partyname ||
    "Petitioner";
  const resName =
    caseData.resName ||
    caseData.parties?.[0]?.resName ||
    rawCore?.res_name ||
    rawCore?.respondentDetails?.[0]?.partyname ||
    "Respondent";

  const regDate = caseData.regDate || rawCore?.reg_date;
  const nextListingDate =
    caseData.nextListingDate || rawCore?.listing_or_proposal_date;
  const disposalDate = caseData.disposalDate || rawCore?.disposal_date;

  const cnrNo = caseData.cnrNo || rawCore?.cnr_no || "N/A";
  const diaryNo =
    caseData.filingNo ||
    caseData.rawData?.caseResponse?.case_diary_no ||
    rawCore?.filling_no ||
    "N/A";

  const categoryDesc =
    caseData.categoryDesc?.trim() ||
    rawCore?.cat_desc?.trim() ||
    "Not specified";
  const district =
    caseData.district || rawCore?.district?.name?.trim() || "Not specified";

  const petAdvName =
    caseData.petAdvName || rawCore?.pet_adv_name || "Not specified";
  const resAdvName =
    caseData.resAdvName || rawCore?.res_adv_name || "Not specified";
  const benchName =
    caseData.benchName || rawCore?.bench_name || "Not specified";

  // Normalize Arrays
  const hearings = isRawPHHC
    ? (caseData.hearingData?.data || []).map((h: any) => ({
        hearingDate: h.cl_date,
        listType: h.cl_type,
        srNo: h.sr_no,
        benchName: h.benchDetails?.bench_name || "Unknown Bench",
      }))
    : caseData.hearings || [];

  const orders = isRawPHHC
    ? (caseData.ordersData || []).map((o: any) => ({
        orderDate: o.orderdate,
        orderType: o.order_type,
        benchName: o.bench_name,
        pdfUrl: o.order,
      }))
    : caseData.orders || [];

  const relatedCases =
    caseData.relatedData ||
    caseData.rawData?.relatedData ||
    caseData.rawData?.caseResponse?.relatedData ||
    [];

  console.log("relatedCases", relatedCases);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="glass-card rounded-3xl p-8 md:p-10 shadow-5">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1.5 rounded-lg text-xs font-black tracking-widest bg-(--secondary)/20 text-(--primary) border border-(--secondary)/30 shadow-sm">
                {dispCaseType} - {dispCaseNo} / {dispCaseYear}
              </span>
              {status && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-(--primary) text-(--primary-fg) shadow-sm">
                  <CheckCircle className="w-3 h-3" />
                  {status}
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-5xl font-serif-logo font-bold text-(--foreground) leading-tight mb-2">
              {petName}
            </h2>
            <p className="text-(--secondary) italic text-xl md:text-2xl font-serif-logo my-1">
              versus
            </p>
            <h2 className="text-3xl md:text-5xl font-serif-logo font-bold text-(--foreground) leading-tight">
              {resName}
            </h2>
          </div>

          <div className="flex items-center self-start mt-2">{children}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 pt-8 border-t border-(--muted)/30">
          {/* Meta Group 1 */}
          <div className="space-y-4">
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Registration Date
              </p>
              <p className="text-sm font-semibold text-(--foreground)">
                {regDate ? formatDate(regDate) : "Not specified"}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Next Listing Date
              </p>
              <p className="text-sm font-semibold text-(--foreground)">
                {nextListingDate ? formatDate(nextListingDate) : "Not required"}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" /> Status
              </p>
              <p className="text-sm font-semibold text-(--foreground) leading-tight">
                {status || "Not specified"}{" "}
                {disposalDate && (
                  <span className="text-xs text-(--secondary) block mt-1">
                    on {formatDate(disposalDate)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Meta Group 2 */}
          <div className="space-y-4">
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <Hash className="w-3 h-3" /> CNR / Diary No
              </p>
              <div className="text-sm font-semibold text-(--foreground)">
                <span className="font-mono block truncate" title={cnrNo}>
                  {cnrNo}
                </span>
                <span className="text-xs text-(--secondary) block mt-1">
                  Diary: {diaryNo}
                </span>
              </div>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Category
              </p>
              <p className="text-sm font-semibold text-(--foreground) leading-snug">
                {categoryDesc}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <Search className="w-3 h-3" /> District
              </p>
              <p className="text-sm font-semibold text-(--foreground)">
                {district}
              </p>
            </div>
          </div>

          {/* Meta Group 3 */}
          <div className="space-y-4">
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold mb-1">
                Petitioner Counsel
              </p>
              <p className="text-sm font-semibold text-(--foreground)">
                {petAdvName}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold mb-1">
                Respondent Counsel
              </p>
              <p className="text-sm font-semibold text-(--foreground)">
                {resAdvName}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold mb-1">
                Bench Info
              </p>
              <p className="text-xs font-semibold text-(--foreground) leading-snug">
                {benchName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings, Judgments & Related Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {hearings.length > 0 && (
          <div className="glass-card rounded-3xl p-6 h-full">
            <h3 className="text-sm uppercase tracking-widest font-bold text-(--secondary) mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Case Listing Details
            </h3>
            <div className="overflow-x-auto rounded-xl border border-(--muted)/30 bg-white/30 hidden-scrollbar">
              <table className="w-full text-left text-xs text-(--foreground)">
                <thead className="bg-white/50 border-b border-(--muted)/30 whitespace-nowrap">
                  <tr>
                    <th className="px-4 py-3 font-bold text-(--secondary) uppercase tracking-wider">
                      Cause List Date
                    </th>
                    <th className="px-4 py-3 font-bold text-(--secondary) uppercase tracking-wider">
                      Type / Sr No
                    </th>
                    <th className="px-4 py-3 font-bold text-(--secondary) uppercase tracking-wider">
                      Bench
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hearings.map((h: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-(--muted)/20 last:border-0 hover:bg-white/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {h.hearingDate ? formatDate(h.hearingDate) : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {h.listType} : {h.srNo}
                      </td>
                      <td
                        className="px-4 py-3 max-w-50 truncate"
                        title={h.benchName}
                      >
                        {h.benchName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {orders.length > 0 && (
          <div className="glass-card rounded-3xl p-6 h-full">
            <h3 className="text-sm uppercase tracking-widest font-bold text-(--secondary) mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Judgment Details
            </h3>
            <div className="overflow-x-auto rounded-xl border border-(--muted)/30 bg-white/30 hidden-scrollbar">
              <table className="w-full text-left text-xs text-(--foreground)">
                <thead className="bg-white/50 border-b border-(--muted)/30 whitespace-nowrap">
                  <tr>
                    <th className="px-4 py-3 font-bold text-(--secondary) uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-4 py-3 font-bold text-(--secondary) uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 font-bold text-(--secondary) uppercase tracking-wider">
                      Bench
                    </th>
                    <th className="px-4 py-3 font-bold text-(--secondary) uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-(--muted)/20 last:border-0 hover:bg-white/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {o.orderDate ? formatDate(o.orderDate) : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {o.orderType === "F" ? "Final Order" : o.orderType}
                      </td>
                      <td
                        className="px-4 py-3 max-w-50 truncate"
                        title={o.benchName}
                      >
                        {o.benchName}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {o.pdfUrl ? (
                          <a
                            href={o.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-(--primary)/10 text-(--primary) hover:bg-(--primary) hover:text-(--primary-fg) transition-colors font-semibold"
                            title="View PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {relatedCases.length > 0 && (
          <div className="glass-card rounded-3xl p-6 h-full md:col-span-2">
            <h3 className="text-sm uppercase tracking-widest font-bold text-(--secondary) mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> Related Cases (Connected)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedCases.map((rc: any, i: number) => {
                const doc = rc.case_documents || {};
                return (
                  <div
                    key={i}
                    className="bg-white/40 p-4 rounded-2xl border border-white/50 hover:bg-white/60 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black tracking-widest bg-(--secondary)/10 text-(--primary) px-2 py-0.5 rounded-md">
                        {doc.case_type || "N/A"}-{doc.case_no}/{doc.case_year}
                      </span>
                      <span className="text-[10px] font-bold text-(--secondary) opacity-60">
                        {doc.cnr_no || "No CNR"}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-(--foreground) line-clamp-2 mb-3 leading-snug">
                      {doc.partyname ||
                        `${doc.pet_name || "Petitioner"} vs ${doc.res_name || "Respondent"}`}
                    </h4>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-(--muted)/20">
                      <span className="text-[10px] font-mono text-(--secondary)">
                        Diary: {doc.case_diary_no}
                      </span>
                      <button
                        onClick={() => {
                          window.open(
                            `/search?type=${doc.case_type}&no=${doc.case_no}&year=${doc.case_year}`,
                            "_blank",
                          );
                        }}
                        className="text-[10px] font-bold text-(--primary) flex items-center gap-1 hover:underline underline-offset-2"
                      >
                        Search <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <details className="group glass-card rounded-3xl mb-12">
        <summary className="px-8 py-5 text-sm font-bold text-(--foreground) cursor-pointer select-none transition-colors flex items-center outline-none">
          <FileText className="w-4 h-4 mr-3 text-(--secondary)" />
          View Complete Raw Payload
          <ChevronRight className="w-4 h-4 ml-auto text-(--secondary) transform transition-transform group-open:rotate-90" />
        </summary>
        <div className="p-8 pt-0 overflow-x-auto border-t border-(--muted)/20">
          <pre className="text-xs text-(--foreground) font-mono leading-relaxed bg-white/40 p-6 rounded-2xl shadow-inner wrap-break-word whitespace-pre-wrap mt-6">
            {JSON.stringify(caseData, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}
