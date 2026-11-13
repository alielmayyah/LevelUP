/** Whole years between a birth date and `now`, in UTC like the API's dates. */
export function ageOn(birthIso: string, now: Date): number {
  const b = new Date(birthIso);
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const m = now.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) age--;
  return age;
}
