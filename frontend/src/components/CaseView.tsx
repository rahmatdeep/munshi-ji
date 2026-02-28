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

interface CaseViewProps {
  caseData: any;
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
  const dispCaseType = caseType || caseData.caseType || rawCore?.case_type;
  const dispCaseNo = caseNo || caseData.caseNo || rawCore?.case_no;
  const dispCaseYear = caseYear || caseData.caseYear || rawCore?.case_year;

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

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="glass-card rounded-3xl p-8 md:p-10 border-white/50 bg-white/40 shadow-xl shadow-(--color-sage)/5">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1.5 rounded-lg text-xs font-black tracking-widest bg-(--color-sage)/20 text-(--primary) border border-(--color-sage)/30 shadow-sm">
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
            <p className="text-(--color-sage) italic text-xl md:text-2xl font-serif-logo my-1">
              versus
            </p>
            <h2 className="text-3xl md:text-5xl font-serif-logo font-bold text-(--foreground) leading-tight">
              {resName}
            </h2>
          </div>

          <div className="flex items-center self-start mt-2">{children}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 pt-8 border-t border-(--color-tan)/30">
          {/* Meta Group 1 */}
          <div className="space-y-4">
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <Briefcase className="w-3 h-3" /> Registration Date
              </p>
              <p className="text-sm font-semibold text-(--foreground)">
                {regDate
                  ? new Date(regDate).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Next Listing Date
              </p>
              <p className="text-sm font-semibold text-(--foreground)">
                {nextListingDate
                  ? new Date(nextListingDate).toLocaleDateString()
                  : "Not required"}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" /> Status
              </p>
              <p className="text-sm font-semibold text-(--foreground) leading-tight">
                {status || "Not specified"}{" "}
                {disposalDate && (
                  <span className="text-xs text-(--color-sage) block mt-1">
                    on {new Date(disposalDate).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Meta Group 2 */}
          <div className="space-y-4">
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <Hash className="w-3 h-3" /> CNR / Diary No
              </p>
              <div className="text-sm font-semibold text-(--foreground)">
                <span className="font-mono block truncate" title={cnrNo}>
                  {cnrNo}
                </span>
                <span className="text-xs text-(--color-sage) block mt-1">
                  Diary: {diaryNo}
                </span>
              </div>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Category
              </p>
              <p className="text-sm font-semibold text-(--foreground) leading-snug">
                {categoryDesc}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
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
              <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1">
                Petitioner Counsel
              </p>
              <p className="text-sm font-semibold text-(--foreground)">
                {petAdvName}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1">
                Respondent Counsel
              </p>
              <p className="text-sm font-semibold text-(--foreground)">
                {resAdvName}
              </p>
            </div>
            <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
              <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1">
                Bench Info
              </p>
              <p className="text-xs font-semibold text-(--foreground) leading-snug">
                {benchName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings & Judgments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 w-full">
        {hearings.length > 0 && (
          <div className="glass-card rounded-3xl p-6 border-white/50 bg-white/40 h-full">
            <h3 className="text-sm uppercase tracking-widest font-bold text-(--color-sage) mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Case Listing Details
            </h3>
            <div className="overflow-x-auto rounded-xl border border-(--color-tan)/30 bg-white/30 hidden-scrollbar">
              <table className="w-full text-left text-xs text-(--foreground)">
                <thead className="bg-white/50 border-b border-(--color-tan)/30 whitespace-nowrap">
                  <tr>
                    <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                      Cause List Date
                    </th>
                    <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                      Type / Sr No
                    </th>
                    <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                      Bench
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hearings.map((h: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-(--color-tan)/20 last:border-0 hover:bg-white/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {h.hearingDate
                          ? new Date(h.hearingDate).toLocaleDateString()
                          : "N/A"}
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
          <div className="glass-card rounded-3xl p-6 border-white/50 bg-white/40 h-full">
            <h3 className="text-sm uppercase tracking-widest font-bold text-(--color-sage) mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Judgment Details
            </h3>
            <div className="overflow-x-auto rounded-xl border border-(--color-tan)/30 bg-white/30 hidden-scrollbar">
              <table className="w-full text-left text-xs text-(--foreground)">
                <thead className="bg-white/50 border-b border-(--color-tan)/30 whitespace-nowrap">
                  <tr>
                    <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                      Bench
                    </th>
                    <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-(--color-tan)/20 last:border-0 hover:bg-white/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {o.orderDate
                          ? new Date(o.orderDate).toLocaleDateString()
                          : "N/A"}
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
      </div>

      <details className="group glass-card rounded-3xl border-white/50 bg-white/20 mb-12">
        <summary className="px-8 py-5 text-sm font-bold text-(--foreground) cursor-pointer select-none transition-colors flex items-center outline-none">
          <FileText className="w-4 h-4 mr-3 text-(--color-sage)" />
          View Complete Raw Payload
          <ChevronRight className="w-4 h-4 ml-auto text-(--color-sage) transform transition-transform group-open:rotate-90" />
        </summary>
        <div className="p-8 pt-0 overflow-x-auto border-t border-(--color-tan)/20">
          <pre className="text-xs text-(--foreground) font-mono leading-relaxed bg-white/40 p-6 rounded-2xl shadow-inner wrap-break-word whitespace-pre-wrap mt-6">
            {JSON.stringify(caseData, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}
