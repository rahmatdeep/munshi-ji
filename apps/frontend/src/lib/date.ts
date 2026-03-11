export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(
  dateInput: string | number | Date | null | undefined,
): string {
  if (!dateInput) return "";
  try {
    let normalizedInput = dateInput;
    if (typeof dateInput === "string" && dateInput.length <= 10 && !dateInput.includes("T")) {
      normalizedInput = `${dateInput}T00:00:00+05:30`;
    }
    const date = new Date(normalizedInput as string | number | Date);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate().toString().padStart(2, "0");
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch {
    return "";
  }
}
