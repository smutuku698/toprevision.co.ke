import { randChoice } from "@/lib/rng";
import type { RNG } from "@/lib/rng";

// Shared helpers for KICD Grade 5 Kiswahili skills — majina/mahali ya Kikenya pamoja na vitendaji vya
// kuunda maswali kutoka kwenye hazina ndogo za maneno (frame pools), ili kila tawi lifikie kiwango cha
// chini cha maneno 10+ (lengo 20+) yaliyowekwa katika root CLAUDE.md, bila kuandika sentensi 20 kamili
// kwa kila tawi.

export const KENYAN_PLACES = [
  "Kisumu", "Nakuru", "Machakos", "Kericho", "Nyeri", "Kitale", "Malindi",
  "Garissa", "Meru", "Bungoma", "Kakamega", "Naivasha", "Voi", "Kilifi",
] as const;

export const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

export function mahali(rng: RNG): string { return randChoice(rng, KENYAN_PLACES); }
export function jina(rng: RNG): string { return randChoice(rng, KENYAN_NAMES); }

const PANGA_FRAMES: ((nini: string) => string)[] = [
  (n) => `Panga kila kitu kulingana na ${n}.`,
  (n) => `Amua ${n} kwa kila kitu, kisha ukipange.`,
  (n) => `Weka vitu hivi katika makundi kulingana na ${n}.`,
  (n) => `Kwa kila kitu, tambua ${n}, kisha ukipange.`,
  (n) => `Panga vitu vifuatavyo kulingana na ${n}.`,
  (n) => `Chunguza kila kitu na ukipange kulingana na ${n}.`,
  (n) => `Gawa vitu hivi katika makundi kwa kuzingatia ${n}.`,
  (n) => `Vipi vinapaswa kupangwa vipi? Zingatia ${n}.`,
  (n) => `Weka kila kitu kwenye kundi linalofaa kulingana na ${n}.`,
  (n) => `Tambua ${n} cha kila kitu, kisha ukipange.`,
  (n) => `Kagua kila kitu na ukiweke kwenye kundi sahihi kulingana na ${n}.`,
  (n) => `Panga hivi vitu katika vikundi, ukizingatia ${n}.`,
];
/** Tunga swali la tawi la "categorize" kutoka kwenye hazina ya sentensi + jambo la kuzingatia. */
export function pangaPrompt(rng: RNG, nini: string): string { return randChoice(rng, PANGA_FRAMES)(nini); }

const OANISHA_FRAMES: ((nini: string) => string)[] = [
  (n) => `Oanisha kila ${n}.`,
  (n) => `Unganisha kila ${n}.`,
  (n) => `Linganisha kila ${n}.`,
  (n) => `Pata mwenzake kila ${n}.`,
  (n) => `Chagua kinachooana na kila ${n}.`,
  (n) => `Oanisha vitu hivi: ${n}.`,
  (n) => `Fanya kazi ya kuoanisha kila ${n}.`,
  (n) => `Chunguza kisha uoanishe kila ${n}.`,
  (n) => `Weka pamoja kila ${n} unaolingana.`,
  (n) => `Tambua na uoanishe kila ${n}.`,
  (n) => `Pangilia kila ${n} pamoja na mwenzake sahihi.`,
  (n) => `Fanya jozi sahihi za kila ${n}.`,
];
export function oanishaPrompt(rng: RNG, nini: string): string { return randChoice(rng, OANISHA_FRAMES)(nini); }

const PANGA_MPANGILIO_FRAMES: ((nini: string) => string)[] = [
  (n) => `Panga ${n} kwa mpangilio sahihi.`,
  (n) => `Weka ${n} katika mpangilio unaofaa.`,
  (n) => `Rekebisha mpangilio wa ${n}.`,
  (n) => `Panga upya ${n} kwa mfuatano sahihi.`,
  (n) => `Fuatanisha ${n} ipasavyo.`,
  (n) => `Weka ${n} kwa mfuatano wake sahihi.`,
  (n) => `Panga ${n} kutoka mwanzo hadi mwisho.`,
  (n) => `Rejesha ${n} kwenye mpangilio sahihi.`,
  (n) => `Sahihisha mpangilio wa ${n}.`,
  (n) => `Panga ${n} kwa utaratibu unaofaa.`,
  (n) => `Buruta ${n} kwenye mfuatano sahihi.`,
  (n) => `Weka sawa mpangilio wa ${n}.`,
];
export function mpangilioPrompt(rng: RNG, nini: string): string { return randChoice(rng, PANGA_MPANGILIO_FRAMES)(nini); }

const TAMBUA_FRAMES: ((nini: string) => string)[] = [
  (n) => `Tambua ${n}.`,
  (n) => `Ni ${n} gani hii?`,
  (n) => `Chagua ${n} sahihi.`,
  (n) => `Bainisha ${n}.`,
  (n) => `Ni ${n} gani inayoonyeshwa hapa?`,
  (n) => `Taja ${n} hii.`,
  (n) => `Chunguza kisha utambue ${n}.`,
  (n) => `Ainisha ${n} ifaayo.`,
  (n) => `Amua ${n} sahihi.`,
  (n) => `Onyesha ${n} sahihi.`,
  (n) => `Fahamu ${n} hii ni ipi.`,
  (n) => `Gundua ${n} sahihi.`,
];
export function tambuaPrompt(rng: RNG, nini: string): string { return randChoice(rng, TAMBUA_FRAMES)(nini); }

export const KAMILISHA_PROMPTS = [
  "Kamilisha sentensi hii.",
  "Jaza nafasi iliyoachwa wazi.",
  "Ni neno lipi linalokamilisha sentensi hii?",
  "Maliza sentensi hii kwa neno sahihi.",
  "Jaza pengo katika sentensi hii.",
  "Chagua neno linalofaa kujaza nafasi hii.",
  "Kamilisha kauli hii.",
  "Ni neno gani linalokosekana?",
  "Jaza sentensi hii kwa usahihi.",
  "Toa neno sahihi la kujaza nafasi hii.",
  "Kamilisha kifungu hiki.",
  "Ni neno lipi linalofaa hapa?",
] as const;
export function kamilishaPrompt(rng: RNG): string { return randChoice(rng, KAMILISHA_PROMPTS); }
