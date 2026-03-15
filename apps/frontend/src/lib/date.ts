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
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      if (
        trimmed.length <= 10 &&
        !trimmed.includes("T") &&
        !trimmed.includes(":")
      ) {
        // Handle YYYY-MM-DD or DD-MM-YYYY
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
          normalizedInput = `${trimmed}T00:00:00+05:30`;
        } else if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
          const [d, m, y] = trimmed.split("-");
          normalizedInput = `${y}-${m}-${d}T00:00:00+05:30`;
        }
      }
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

export function formatDateTime(
  dateInput: string | number | Date | null | undefined,
): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";

    const dateStr = formatDate(date);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${dateStr} ${hours}:${minutes}`;
  } catch {
    return "";
  }
}
