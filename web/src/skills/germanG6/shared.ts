// Shared content pools for Grade 6 German (Upper Primary, basic/foundational A1-target register).
// Mined from grade-6-curriculum-desings/GRADE-6-GERMAN-Curriculum-Designs.pdf — see
// curriculum-reference/grade-6/german.json for the full sourcing record. Informal "du"-form
// throughout (the source never drills formal "Sie"). Vocabulary items follow the source's own z.B.
// example phrases where given, expanded with standard, safe A1-level German vocabulary to reach the
// pool-size floor established by frenchG6/arabicG6 (12-16 items per theme, not the stricter 30+ floor
// tied specifically to Grade 6 Math/Science).

import type { RNG } from "@/lib/rng";
import { randChoice } from "@/lib/rng";

// ---- Kenyan localization pools (for Scenario+Hook Apply-tier branches) ----------------------------

export const NAMES = [
  "Amina", "Brian", "Chebet", "Dennis", "Faith", "Gideon", "Halima", "Ian",
  "Joyce", "Kevin", "Lilian", "Mohammed", "Naomi", "Otieno", "Peris", "Wanjiru",
] as const;

export const PLACES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Malindi", "Nyeri", "Kitale"] as const;

export function name(rng: RNG): string {
  return randChoice(rng, NAMES);
}
export function place(rng: RNG): string {
  return randChoice(rng, PLACES);
}

/** Folds German umlauts/ß to their ASCII digraph forms (ä→ae, ö→oe, ü→ue, ß→ss) so typed answers without a German keyboard still validate. */
export function foldUmlauts(s: string): string {
  return s
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue");
}

/** Accepted-answers list for a fill-blank correct answer: the umlaut form plus a digraph fallback if they differ. */
export function umlautAccepted(answer: string): string[] | undefined {
  const folded = foldUmlauts(answer);
  return folded !== answer ? [folded] : undefined;
}

// ---- Theme 1: Greetings and Introduction -------------------------------------------------------------

export const GREETING_VOCAB: { word: string; meaning: string }[] = [
  { word: "Hallo", meaning: "hello" },
  { word: "Guten Morgen", meaning: "good morning" },
  { word: "Guten Tag", meaning: "good day" },
  { word: "Guten Abend", meaning: "good evening" },
  { word: "Tschüss", meaning: "bye" },
  { word: "Auf Wiedersehen", meaning: "goodbye" },
  { word: "Wie heißt du?", meaning: "what is your name?" },
  { word: "Ich heiße...", meaning: "my name is..." },
  { word: "Wie alt bist du?", meaning: "how old are you?" },
  { word: "Ich bin ... Jahre alt", meaning: "I am ... years old" },
  { word: "Wie geht es dir?", meaning: "how are you?" },
  { word: "Mir geht es gut", meaning: "I am doing well" },
  { word: "Danke", meaning: "thank you" },
  { word: "Bitte", meaning: "please / you're welcome" },
  { word: "Freut mich", meaning: "nice to meet you" },
  { word: "Bis bald", meaning: "see you soon" },
] as const;

// ---- Theme 2: Family (nuclear family) + numbers 20-100 -----------------------------------------------

export const FAMILY_VOCAB: { word: string; meaning: string }[] = [
  { word: "der Vater", meaning: "father" },
  { word: "die Mutter", meaning: "mother" },
  { word: "der Bruder", meaning: "brother" },
  { word: "die Schwester", meaning: "sister" },
  { word: "der Sohn", meaning: "son" },
  { word: "die Tochter", meaning: "daughter" },
  { word: "der Großvater", meaning: "grandfather" },
  { word: "die Großmutter", meaning: "grandmother" },
  { word: "der Onkel", meaning: "uncle" },
  { word: "die Tante", meaning: "aunt" },
  { word: "der Cousin", meaning: "male cousin" },
  { word: "die Cousine", meaning: "female cousin" },
  { word: "die Familie", meaning: "family" },
  { word: "die Eltern", meaning: "parents" },
  { word: "die Geschwister", meaning: "siblings" },
  { word: "das Baby", meaning: "baby" },
] as const;

export const NUMBERS: { num: number; word: string }[] = [
  { num: 10, word: "zehn" },
  { num: 20, word: "zwanzig" },
  { num: 30, word: "dreißig" },
  { num: 40, word: "vierzig" },
  { num: 50, word: "fünfzig" },
  { num: 60, word: "sechzig" },
  { num: 70, word: "siebzig" },
  { num: 80, word: "achtzig" },
  { num: 90, word: "neunzig" },
  { num: 100, word: "hundert" },
  { num: 25, word: "fünfundzwanzig" },
  { num: 33, word: "dreiunddreißig" },
  { num: 47, word: "siebenundvierzig" },
  { num: 58, word: "achtundfünfzig" },
  { num: 64, word: "vierundsechzig" },
  { num: 72, word: "zweiundsiebzig" },
] as const;

// ---- Theme 3: My Surroundings (school facilities) ------------------------------------------------------

export const SCHOOL_VOCAB: { word: string; meaning: string }[] = [
  { word: "die Schule", meaning: "school" },
  { word: "die Bibliothek", meaning: "library" },
  { word: "das Klassenzimmer", meaning: "classroom" },
  { word: "der Sportplatz", meaning: "sports field" },
  { word: "das Lehrerzimmer", meaning: "staffroom" },
  { word: "das Klo", meaning: "toilet" },
  { word: "die Kantine", meaning: "canteen" },
  { word: "das Büro", meaning: "office" },
  { word: "der Spielplatz", meaning: "playground" },
  { word: "der Flur", meaning: "corridor" },
  { word: "das Tor", meaning: "gate" },
  { word: "der Garten", meaning: "garden" },
  { word: "die Tafel", meaning: "blackboard" },
  { word: "das Labor", meaning: "laboratory" },
  { word: "die Halle", meaning: "hall" },
  { word: "der Computerraum", meaning: "computer room" },
] as const;

export const SCHOOL_FACILITY_FUNCTIONS: { word: string; function: string }[] = [
  { word: "die Bibliothek", function: "lesen (reading)" },
  { word: "der Sportplatz", function: "spielen/Fußball (playing football)" },
  { word: "die Kantine", function: "essen (eating)" },
  { word: "das Klassenzimmer", function: "lernen (learning)" },
  { word: "das Labor", function: "experimentieren (doing experiments)" },
  { word: "der Spielplatz", function: "spielen (playing)" },
] as const;

// ---- Theme 4: Time (months of the year, holidays) --------------------------------------------------

export const MONTHS: { word: string; meaning: string; order: number }[] = [
  { word: "Januar", meaning: "January", order: 1 },
  { word: "Februar", meaning: "February", order: 2 },
  { word: "März", meaning: "March", order: 3 },
  { word: "April", meaning: "April", order: 4 },
  { word: "Mai", meaning: "May", order: 5 },
  { word: "Juni", meaning: "June", order: 6 },
  { word: "Juli", meaning: "July", order: 7 },
  { word: "August", meaning: "August", order: 8 },
  { word: "September", meaning: "September", order: 9 },
  { word: "Oktober", meaning: "October", order: 10 },
  { word: "November", meaning: "November", order: 11 },
  { word: "Dezember", meaning: "December", order: 12 },
] as const;

export const HOLIDAY_VOCAB: { word: string; meaning: string }[] = [
  { word: "Weihnachten", meaning: "Christmas" },
  { word: "Ostern", meaning: "Easter" },
  { word: "Schulferien", meaning: "school holidays" },
  { word: "Osterferien", meaning: "Easter holidays" },
  { word: "Sommerferien", meaning: "summer holidays" },
  { word: "Weihnachtsferien", meaning: "Christmas holidays" },
  { word: "Neujahr", meaning: "New Year" },
  { word: "der Geburtstag", meaning: "birthday" },
] as const;

// ---- Theme 5: Fun and Enjoyment (sports and games, gern/nicht gern) -----------------------------------

export const SPORT_VOCAB: { word: string; meaning: string }[] = [
  { word: "Fußball spielen", meaning: "to play football" },
  { word: "schwimmen", meaning: "to swim" },
  { word: "lesen", meaning: "to read" },
  { word: "laufen", meaning: "to run" },
  { word: "tanzen", meaning: "to dance" },
  { word: "singen", meaning: "to sing" },
  { word: "malen", meaning: "to paint" },
  { word: "Rad fahren", meaning: "to cycle" },
  { word: "Basketball spielen", meaning: "to play basketball" },
  { word: "Schach spielen", meaning: "to play chess" },
  { word: "springen", meaning: "to jump" },
  { word: "klettern", meaning: "to climb" },
  { word: "Volleyball spielen", meaning: "to play volleyball" },
  { word: "Musik hören", meaning: "to listen to music" },
  { word: "spazieren gehen", meaning: "to go for a walk" },
  { word: "Karten spielen", meaning: "to play cards" },
] as const;

// ---- Theme 6: Food and Drinks (food preferences) --------------------------------------------------------

export const FOOD_VOCAB: { word: string; meaning: string }[] = [
  { word: "das Brot", meaning: "bread" },
  { word: "der Kuchen", meaning: "cake" },
  { word: "die Suppe", meaning: "soup" },
  { word: "der Reis", meaning: "rice" },
  { word: "das Fleisch", meaning: "meat" },
  { word: "der Fisch", meaning: "fish" },
  { word: "das Gemüse", meaning: "vegetables" },
  { word: "das Obst", meaning: "fruit" },
  { word: "die Milch", meaning: "milk" },
  { word: "das Wasser", meaning: "water" },
  { word: "der Tee", meaning: "tea" },
  { word: "die Eier", meaning: "eggs" },
  { word: "der Honig", meaning: "honey" },
  { word: "der Käse", meaning: "cheese" },
  { word: "die Kartoffel", meaning: "potato" },
  { word: "der Saft", meaning: "juice" },
] as const;

export const FLAVOUR_VOCAB: { word: string; meaning: string }[] = [
  { word: "süß", meaning: "sweet" },
  { word: "salzig", meaning: "salty" },
  { word: "sauer", meaning: "sour" },
  { word: "scharf", meaning: "spicy" },
  { word: "schmecken", meaning: "to taste" },
  { word: "lecker", meaning: "delicious" },
] as const;

// ---- Theme 7: My Body (grooming/personal hygiene routine) --------------------------------------------

export const GROOMING_VOCAB: { word: string; meaning: string }[] = [
  { word: "die Zähne putzen", meaning: "to brush one's teeth" },
  { word: "die Haare kämmen", meaning: "to comb one's hair" },
  { word: "die Hände waschen", meaning: "to wash one's hands" },
  { word: "duschen", meaning: "to shower" },
  { word: "sich anziehen", meaning: "to get dressed" },
  { word: "das Gesicht waschen", meaning: "to wash one's face" },
  { word: "die Haare waschen", meaning: "to wash one's hair" },
  { word: "die Nägel schneiden", meaning: "to cut one's nails" },
  { word: "sich kämmen", meaning: "to comb oneself" },
  { word: "aufstehen", meaning: "to get up" },
  { word: "frühstücken", meaning: "to eat breakfast" },
  { word: "schlafen gehen", meaning: "to go to sleep" },
] as const;

// ---- Theme 8: Weather and Environment (weather conditions, Kenya-localized) ---------------------------

export const WEATHER_VOCAB: { word: string; meaning: string }[] = [
  { word: "Es scheint", meaning: "it is shining/sunny" },
  { word: "Es regnet", meaning: "it is raining" },
  { word: "Es ist warm", meaning: "it is warm" },
  { word: "Es ist kalt", meaning: "it is cold" },
  { word: "Es ist windig", meaning: "it is windy" },
  { word: "Es ist wolkig", meaning: "it is cloudy" },
  { word: "Es ist heiß", meaning: "it is hot" },
  { word: "Es ist trocken", meaning: "it is dry" },
  { word: "Es ist neblig", meaning: "it is foggy" },
  { word: "Es donnert", meaning: "it is thundering" },
] as const;

export const WEATHER_PLACES: { place: string; weather: string }[] = [
  { place: "Kisumu", weather: "Es ist warm in Kisumu" },
  { place: "Nyeri", weather: "Es ist kalt in Nyeri" },
  { place: "Mombasa", weather: "Es ist heiß in Mombasa" },
  { place: "Eldoret", weather: "Es ist wolkig in Eldoret" },
] as const;

// ---- Theme 9: Getting Around (position/location vocabulary, school items) -----------------------------

export const POSITION_VOCAB: { word: string; meaning: string }[] = [
  { word: "auf", meaning: "on" },
  { word: "unter", meaning: "under" },
  { word: "hinter", meaning: "behind" },
  { word: "vor", meaning: "in front of" },
  { word: "neben", meaning: "next to" },
  { word: "zwischen", meaning: "between" },
  { word: "in", meaning: "in" },
  { word: "über", meaning: "above" },
] as const;

export const CLASSROOM_ITEMS: { word: string; meaning: string }[] = [
  { word: "das Deutschbuch", meaning: "the German book" },
  { word: "der Stuhl", meaning: "the chair" },
  { word: "der Tisch", meaning: "the table" },
  { word: "die Tafel", meaning: "the blackboard" },
  { word: "die Tasche", meaning: "the bag" },
  { word: "der Stift", meaning: "the pen" },
  { word: "das Heft", meaning: "the exercise book" },
  { word: "die Tür", meaning: "the door" },
  { word: "das Fenster", meaning: "the window" },
  { word: "der Schrank", meaning: "the cupboard" },
] as const;
