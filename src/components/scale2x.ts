/**
 * Doubles an icon's resolution with Scale2x: each pixel becomes four, and where
 * two neighbours of the same color meet at a corner, that corner is filled in.
 * Diagonals and curves come out smooth instead of as 12-pixel stairs, while
 * straight edges and line weights stay exactly as drawn.
 */
export function scale2x(rows: readonly string[]): string[] {
  const at = (x: number, y: number, fallback: string) => rows[y]?.[x] ?? fallback;
  const out: string[] = [];
  rows.forEach((row, y) => {
    let top = '';
    let bottom = '';
    [...row].forEach((p, x) => {
      const a = at(x, y - 1, p); // above
      const b = at(x + 1, y, p); // right
      const c = at(x - 1, y, p); // left
      const d = at(x, y + 1, p); // below
      top += (c === a && c !== d && a !== b ? a : p) + (a === b && a !== c && b !== d ? b : p);
      bottom += (d === c && d !== b && c !== a ? c : p) + (b === d && b !== a && d !== c ? d : p);
    });
    out.push(top, bottom);
  });
  return out;
}

/** The grid every icon is drawn at: 12- and 24-grid art is doubled with Scale2x until it reaches it. */
export const DETAIL = 96;

/** An icon's rows at DETAIL × DETAIL. */
export function detailed(rows: readonly string[]): readonly string[] {
  let out = rows;
  while (out.length < DETAIL) out = scale2x(out);
  return out;
}
