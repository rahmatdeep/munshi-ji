import * as XLSX from "xlsx";

export interface CaseExportData {
  userEmail: string;
  caseType: string;
  caseNo: string;
  caseYear: number;
  petName?: string | null;
  resName?: string | null;
  status?: string | null;
}

/**
 * Generates an Excel buffer for the given case data.
 */
export const generateCasesExcel = (data: CaseExportData[]): Buffer => {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      "User Email": item.userEmail,
      "Case Type": item.caseType,
      "Case Number": item.caseNo,
      "Case Year": item.caseYear,
      Petitioner: item.petName || "N/A",
      Respondent: item.resName || "N/A",
      Status: item.status || "N/A",
    })),
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");

  // Write to buffer
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });
  return excelBuffer;
};
