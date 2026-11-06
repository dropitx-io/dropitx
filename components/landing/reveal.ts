/** Stagger index for a [data-reveal] element (read by the entrance rules in globals.css). */
export function reveal(i: number): React.CSSProperties {
  return { "--reveal-i": i } as React.CSSProperties;
}
