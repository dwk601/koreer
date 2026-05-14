/**
 * Canonical source list and display helpers.
 *
 * The upstream `koreaJobApiV2` returns source identifiers as plain lowercase
 * strings (e.g. `"linkedin"`, `"heykorean"`). We map every known scraper to
 * a polished display label and fall back to a pretty-cased version of the
 * raw id for forward compatibility — so a newly added scraper still shows
 * up reasonably even before this list is updated.
 *
 * Keep this list in sync with `etl/scrapers/spider_*.py`. As of 2026-05-14
 * the active scrapers are:
 *   gtksa, heykorean, indeed, jobkoreausa, koreadaily, linkedin,
 *   radiokorea, workingus, wowseattle
 */
export const SOURCE_LABEL: Record<string, string> = {
  gtksa: "GTKSA",
  heykorean: "HeyKorean",
  indeed: "Indeed",
  jobkoreausa: "JobKoreaUSA",
  koreadaily: "Korea Daily",
  linkedin: "LinkedIn",
  radiokorea: "Radio Korea",
  workingus: "WorkingUS",
  wowseattle: "Wow Seattle",
};

/**
 * Display label for a source id, with a graceful fallback for ids the
 * frontend hasn't been taught about yet. The fallback capitalises the
 * first letter so a raw `"newsource"` reads as `"Newsource"` instead of
 * leaking the lowercase id.
 */
export function formatSourceLabel(value: string): string {
  if (value in SOURCE_LABEL) return SOURCE_LABEL[value];
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
