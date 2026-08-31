// Shared Kenyan-context name/place pools reused across the g6-eng-writing skill files W.1-W.6.
// A parallel agent builds W.7-W.11 with its own writingSharedB.ts — minor duplication between
// the two shared files is expected and fine (same precedent as this project's Grade 6
// Agriculture round), since they are built by independent parallel agents.

export const KENYAN_NAMES: string[] = [
  "Wanjiru", "Otieno", "Amina", "Kiptoo", "Nasimiyu", "Mwangi", "Chebet", "Njeri",
  "Kamau", "Akinyi", "Wafula", "Naliaka", "Mutiso", "Cherono", "Odhiambo", "Wangari",
  "Kilonzo", "Nyambura", "Barasa", "Auma", "Rotich", "Achieng", "Kiplagat", "Mumbi",
  "Simiyu", "Wekesa", "Chepkoech", "Onyango", "Wairimu", "Korir", "Muthoni", "Juma",
  "Halima", "Kipchoge", "Adhiambo", "Mercy", "Dennis", "Faith", "Steven", "Grace",
];

export const KENYAN_PLACES: string[] = [
  "Kericho", "Nyeri", "Kisumu", "Nakuru", "Eldoret", "Mombasa", "Nairobi", "Kitale",
  "Machakos", "Kakamega", "Meru", "Embu", "Garissa", "Kisii", "Nyahururu", "Naivasha",
  "Bungoma", "Voi", "Malindi", "Lamu", "Thika", "Kiambu", "Isiolo", "Homa Bay",
  "Migori", "Narok", "Kajiado", "Kilifi", "Nanyuki", "Nyamira",
];

/** Capitalise the first letter of a word/name. */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
