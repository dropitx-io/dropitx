/** A role or plan value in sentence case for display: "owner" reads "Owner". Legacy roles render the same way. */
export function roleLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
