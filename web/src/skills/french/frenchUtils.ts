/** Strips French accents (e.g. e-acute to e, e-grave to e, a-grave to a, c-cedilla to c) so typed answers without a French keyboard still validate. */
export function foldAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Accepted-answers list for a fill-blank correct answer: the accented form plus an unaccented fallback if they differ. */
export function accentAccepted(answer: string): string[] | undefined {
  const folded = foldAccents(answer);
  return folded !== answer ? [folded] : undefined;
}
