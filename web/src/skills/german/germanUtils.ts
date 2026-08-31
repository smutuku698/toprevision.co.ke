/** Folds German umlauts/ß to their ASCII digraphs (ä->ae, ö->oe, ü->ue, ß->ss) so typed answers without a German keyboard still validate. */
export function foldUmlauts(s: string): string {
  return s
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss");
}

/** Accepted-answers list for a fill-blank correct answer: the umlaut form plus a folded ASCII fallback if they differ. */
export function umlautAccepted(answer: string): string[] | undefined {
  const folded = foldUmlauts(answer);
  return folded !== answer ? [folded] : undefined;
}
