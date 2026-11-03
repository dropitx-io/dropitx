const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const intFormat = new Intl.NumberFormat("en-US");
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** A UTC calendar day (YYYY-MM-DD or an ISO time) as "15 Oct". */
export function formatDay(date: string): string {
  return dayFormat.format(new Date(date.length === 10 ? `${date}T00:00:00Z` : date));
}

export function formatInt(value: number): string {
  return intFormat.format(value);
}

/** A ratio as a percentage with one decimal; zero prints "0%". */
export function formatPct(ratio: number): string {
  if (ratio === 0) return "0%";
  return `${(ratio * 100).toFixed(1)}%`;
}

/** An ISO 3166 alpha-2 code as its English name; anything else is shown as given, capitalised. */
export function countryName(code: string): string {
  if (/^[A-Za-z]{2}$/.test(code)) {
    try {
      return regionNames.of(code.toUpperCase()) ?? code;
    } catch {
      return code;
    }
  }
  return code.charAt(0).toUpperCase() + code.slice(1);
}
