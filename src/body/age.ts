/** Whole years old on the UTC calendar, using the date of birth returned by the API. */
export function ageOn(birthDate: Date, at: Date): number {
  const years = at.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    at.getUTCMonth() < birthDate.getUTCMonth() ||
    (at.getUTCMonth() === birthDate.getUTCMonth() && at.getUTCDate() < birthDate.getUTCDate());
  return beforeBirthday ? years - 1 : years;
}
