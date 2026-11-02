/*
 * Class sets for the app's data tables. Rows are separated by 1px rules; below 640px a table
 * becomes two-line rows: identity and the key figure on line 1, the rest grey on line 2.
 */
export const TABLE = "w-full border-collapse text-sm tabular-nums max-sm:block";
export const THEAD = "max-sm:hidden";
export const TBODY = "max-sm:block";
export const TH = "h-9 px-3 text-left text-xs font-normal whitespace-nowrap text-muted-foreground first:pl-0 last:pr-0";
export const TR =
  "border-t border-rule first:border-border max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:items-center max-sm:gap-x-3 max-sm:py-3";
export const TD = "px-3 py-3.5 align-middle first:pl-0 last:pr-0 max-sm:block max-sm:p-0";
/** A cell that only shows on wider screens; its content moves to the LINE2 cell on a phone. */
export const WIDE = "max-sm:hidden";
/** The grey second line on a phone; hidden on wider screens. */
export const LINE2 = "hidden text-[13px] leading-[18px] text-muted-foreground max-sm:col-start-1 max-sm:row-start-2 max-sm:mt-1 max-sm:block";
/** A trailing actions cell that stays on the right of both phone lines. */
export const ACTIONS = "text-right max-sm:col-start-2 max-sm:row-span-2 max-sm:row-start-1";
