import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.7 Kusoma kwa Mapana — Matini ya Kujichagulia (Elimu ya Mazingira).
// Aina za matini: vitabu, magazeti, majarida. Ona curriculum-reference/grade-5/kiswahili.json.

type Aina = "vitabu" | "magazeti" | "majarida";
const AINA_LABEL: Record<Aina, string> = { vitabu: "Kitabu", magazeti: "Gazeti", majarida: "Jarida" };
const AINA3: Aina[] = ["vitabu", "magazeti", "majarida"];

const MATINI: { aina: Aina; mfano: string }[] = [
  { aina: "vitabu", mfano: "Kitabu kuhusu uhifadhi wa misitu" },
  { aina: "vitabu", mfano: "Kitabu cha hadithi za wanyamapori" },
  { aina: "vitabu", mfano: "Kitabu cha sayansi ya mazingira" },
  { aina: "vitabu", mfano: "Kitabu kuhusu mabadiliko ya tabianchi" },
  { aina: "magazeti", mfano: "Gazeti lenye habari za uchafuzi wa mazingira" },
  { aina: "magazeti", mfano: "Gazeti la kila siku lenye safu ya mazingira" },
  { aina: "magazeti", mfano: "Gazeti kuhusu ukame na mvua" },
  { aina: "magazeti", mfano: "Gazeti la kitaifa lenye habari za upandaji miti" },
  { aina: "majarida", mfano: "Jarida la kila mwezi kuhusu uhifadhi wa wanyama" },
  { aina: "majarida", mfano: "Jarida la kilimo na mazingira" },
  { aina: "majarida", mfano: "Jarida la kisayansi kuhusu mazingira" },
  { aina: "majarida", mfano: "Jarida la watoto kuhusu utunzaji wa mazingira" },
];

const SENTENZA: { neno: string; sentensi: string }[] = [
  { neno: "kitabu", sentensi: "Alisoma kitabu kizuri kuhusu uhifadhi wa misitu." },
  { neno: "gazeti", sentensi: "Baba alinunua gazeti lenye habari za uchafuzi wa mazingira." },
  { neno: "jarida", sentensi: "Mwalimu aliazima jarida la kila mwezi kuhusu wanyamapori." },
  { neno: "vitabu", sentensi: "Maktabani kuna vitabu vingi kuhusu mabadiliko ya tabianchi." },
  { neno: "magazeti", sentensi: "Watu wengi husoma magazeti kupata habari za mazingira." },
  { neno: "majarida", sentensi: "Wanafunzi walisoma majarida ya kisayansi kuhusu mazingira." },
];

const MICHAKATO: string[][] = [
  [
    "Chagua matini unayopenda kuhusu mazingira.",
    "Soma matini kwa makini kuelewa ujumbe wake.",
    "Andika mambo muhimu uliyojifunza.",
    "Toa muhtasari mfupi wa matini kwa maneno yako.",
  ],
  [
    "Tembelea maktaba au tovuti salama kutafuta matini.",
    "Angalia kichwa na picha kuona kama inahusu mazingira.",
    "Soma sehemu ya kwanza kuamua kama inafaa.",
    "Maliza kusoma matini yote na uandike hoja kuu.",
  ],
];

export const kusomaKwaMapanaMatiniKujichaguliaMazingira: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-mapana-matini-kujichagulia-mazingira",
  code: "KS.7",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Mapana — Matini ya Kujichagulia (Elimu ya Mazingira)",
  description: "Tambua aina za matini (vitabu, magazeti, majarida) zinazohusu elimu ya mazingira.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-aina", "oanisha-mfano", "panga-aina", "jaza-matini", "panga-hatua"] as const);

    if (branch === "tambua-aina") {
      const m = randChoice(rng, MATINI);
      const choices = shuffle(rng, AINA3.map((a) => AINA_LABEL[a]));
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "aina ya matini inayolingana na mfano huu")} Mfano: "${m.mfano}".`,
        choices,
        correctIndex: choices.indexOf(AINA_LABEL[m.aina]),
        layout: "row",
        hint: "Fikiria kama chanzo hiki ni kitabu, gazeti au jarida.",
        explanation: `"${m.mfano}" ni mfano wa ${AINA_LABEL[m.aina].toLowerCase()}.`,
      };
    }

    if (branch === "oanisha-mfano") {
      const chosen = AINA3.map((a) => randChoice(rng, MATINI.filter((m) => m.aina === a)));
      const tokens = chosen.map((m) => ({ id: m.aina, label: m.mfano }));
      const targets = shuffle(rng, AINA3).map((a) => ({ id: a, label: AINA_LABEL[a] }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.aina] = m.aina;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "mfano wa matini na aina yake"),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Fikiria kama mfano huu ni kitabu, gazeti au jarida.",
        explanation: chosen.map((m) => `"${m.mfano}" ni mfano wa ${AINA_LABEL[m.aina].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const items = shuffle(rng, MATINI).slice(0, 9).map((m, i) => ({ id: `${i}-${m.mfano}`, label: m.mfano }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) {
        const found = MATINI.find((m) => m.mfano === it.label)!;
        correctBucket[it.id] = found.aina;
      }
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama mada hii ya mazingira ingepatikana kwenye kitabu, gazeti au jarida"),
        items,
        buckets: AINA3.map((a) => ({ id: a, label: AINA_LABEL[a] })),
        correctBucket,
        hint: "Fikiria urefu na aina ya habari — je, ni kitabu, gazeti au jarida?",
        explanation: items.map((it) => `"${it.label}" ni mfano wa ${AINA_LABEL[correctBucket[it.id] as Aina].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "jaza-matini") {
      const s = randChoice(rng, SENTENZA);
      const maneno = s.sentensi.replace(".", "").split(" ");
      const idx = randChoice(
        rng,
        maneno.map((_w, i) => i).filter((i) => maneno[i].toLowerCase() === s.neno.toLowerCase())
      );
      const before = maneno.slice(0, idx).join(" ") + (idx > 0 ? " " : "");
      const after = " " + maneno.slice(idx + 1).join(" ") + ".";
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before,
        after,
        correctAnswer: s.neno,
        inputMode: "text",
        hint: "Fikiria aina ya matini inayofaa hapa.",
        explanation: `Sentensi kamili: "${s.sentensi}"`,
      };
    }

    const hatua = randChoice(rng, MICHAKATO);
    const items = hatua.map((h, i) => ({ id: `${i}-hatua`, label: h }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kuchagua na kutoa muhtasari wa matini ya mazingira"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria hatua ya kwanza kabla ya kuandika muhtasari.",
      explanation: `Mpangilio sahihi: ${hatua.join(" ")}`,
    };
  },
};
