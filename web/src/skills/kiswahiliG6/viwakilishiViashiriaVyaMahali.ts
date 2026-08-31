import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type LocativeKey = "hapa" | "hapo" | "pale" | "huku" | "huko" | "kule";

const LOCATIVES: {
  id: LocativeKey;
  ukaribu: "karibu" | "kati" | "mbali";
  aina: "mahali maalum" | "mwelekeo/upande";
  maelezo: string;
}[] = [
  { id: "hapa", ukaribu: "karibu", aina: "mahali maalum", maelezo: "mahali maalum palipo karibu sana na msemaji" },
  { id: "huku", ukaribu: "karibu", aina: "mwelekeo/upande", maelezo: "upande/mwelekeo ulio karibu sana na msemaji" },
  { id: "hapo", ukaribu: "kati", aina: "mahali maalum", maelezo: "mahali maalum panapojulikana, umbali wa kati" },
  { id: "huko", ukaribu: "kati", aina: "mwelekeo/upande", maelezo: "upande/mwelekeo unaojulikana, umbali wa kati" },
  { id: "pale", ukaribu: "mbali", aina: "mahali maalum", maelezo: "mahali maalum palipo mbali lakini panapoonekana" },
  { id: "kule", ukaribu: "mbali", aina: "mwelekeo/upande", maelezo: "upande/mwelekeo ulio mbali sana na msemaji" },
];

const LOCATIVE_MAP: Record<LocativeKey, (typeof LOCATIVES)[number]> = {
  hapa: LOCATIVES[0],
  huku: LOCATIVES[1],
  hapo: LOCATIVES[2],
  huko: LOCATIVES[3],
  pale: LOCATIVES[4],
  kule: LOCATIVES[5],
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const LOCATIVE_EXAMPLES: { id: LocativeKey; before: string; after: string }[] = [
  { id: "hapa", before: "Weka kitabu chako ", after: ", karibu nami." },
  { id: "hapa", before: "", after: " ndipo mahali nilipozaliwa." },
  { id: "hapa", before: "Njoo ", after: " haraka, chakula kimeandaliwa." },
  { id: "hapa", before: "", after: " ni mahali pazuri pa kusoma." },
  { id: "hapa", before: "Simama ", after: " nikupige picha." },
  { id: "hapo", before: "Weka mkoba wako ", after: ", kando ya meza." },
  { id: "hapo", before: "", after: " ndipo mlipokutana jana." },
  { id: "hapo", before: "Kaa ", after: " kidogo, nitarudi punde." },
  { id: "hapo", before: "", after: " ni mahali tulipoacha gari letu." },
  { id: "hapo", before: "Angalia ", after: ", kuna kitu kimeanguka." },
  { id: "pale", before: "Angalia ", after: ", kuna ndege mkubwa angani." },
  { id: "pale", before: "", after: " ndipo mlima unapoanzia." },
  { id: "pale", before: "Nyumba yetu ipo ", after: ", mbali kidogo na barabara." },
  { id: "pale", before: "", after: " ni mahali pa mkutano wa kesho." },
  { id: "pale", before: "Wageni wataketi ", after: ", karibu na jukwaa." },
  { id: "huku", before: "Njoo ", after: ", tucheze mpira pamoja." },
  { id: "huku", before: "", after: " ndiko tunakoishi sisi sote." },
  { id: "huku", before: "Geuka ", after: " upate kuona vizuri." },
  { id: "huku", before: "", after: " ni upande unaopendeza zaidi wa shule." },
  { id: "huku", before: "Vumbi limejaa ", after: " tunakoendesha gari." },
  { id: "huko", before: "Wageni wamesafiri ", after: " wanakotoka." },
  { id: "huko", before: "", after: " ndiko babu yangu alikozaliwa." },
  { id: "huko", before: "Nenda ", after: " ukamsalimie mwalimu." },
  { id: "huko", before: "", after: " ni upande wa magharibi wa mji." },
  { id: "huko", before: "Ndege wamerudi ", after: " msimu huu." },
  { id: "kule", before: "Wafanyakazi wamesafiri ", after: " mashambani." },
  { id: "kule", before: "", after: " ndiko safari yetu ndefu ilikoishia." },
  { id: "kule", before: "Angalia ", after: ", mbali sana upeo wa macho." },
  { id: "kule", before: "", after: " ni mahali ambapo hakuna umeme kabisa." },
  { id: "kule", before: "Wanyama wa porini wanaishi ", after: " msituni." },
];

function fullSentence(item: { id: LocativeKey; before: string; after: string }): string {
  const word = item.before === "" ? cap(item.id) : item.id;
  return `${item.before}${word}${item.after}`;
}

const KENYAN_MAJINA = [
  "Wanjiru", "Otieno", "Amina", "Kiptoo", "Nasimiyu", "Mwangi", "Chebet", "Njeri",
  "Kamau", "Akinyi", "Wafula", "Naliaka", "Mutiso", "Cherono", "Odhiambo", "Wangari",
  "Kilonzo", "Nyambura", "Barasa", "Auma", "Rotich", "Achieng", "Kiplagat", "Mumbi",
];

type ScenarioCategory = { correct: LocativeKey; build: (n: string[]) => string };

const SCENARIOS: ScenarioCategory[] = [
  {
    correct: "hapa",
    build: (n) => `${n[0]} ameweka kalamu yake juu ya meza aliyoketi, mahali anapoweza kuigusa moja kwa moja bila kusogea. Ni kiwakilishi kipi kinachofaa kuelezea mahali hapo?`,
  },
  {
    correct: "hapa",
    build: (n) => `Mwalimu anamwambia ${n[0]} aweke kitabu kwenye sehemu iliyo karibu sana naye, mahali maalum anapoweza kukigusa. Kiwakilishi kipi kinafaa?`,
  },
  {
    correct: "huku",
    build: (n) => `${n[0]} anamwambia rafiki yake ageuke upande alipo yeye, karibu sana na eneo lake. Ni kiwakilishi kipi kinachofaa?`,
  },
  {
    correct: "huku",
    build: (n) => `${n[0]} na ${n[1]} wako uwanjani, na ${n[0]} anaonyesha upande alio nao kwa mkono wake, karibu sana. Kiwakilishi kipi kinafaa?`,
  },
  {
    correct: "hapo",
    build: (n) => `${n[0]} anaonyesha meza iliyoko chumbani, si karibu sana wala mbali, mahali panapojulikana wazi. Kiwakilishi kipi kinafaa?`,
  },
  {
    correct: "hapo",
    build: (n) => `${n[0]} anamkumbusha ${n[1]} kuhusu sehemu maalum walipoacha mkoba, isiyo karibu sana wala mbali sana. Kiwakilishi kipi kinafaa?`,
  },
  {
    correct: "huko",
    build: (n) => `${n[0]} anaeleza upande wa mji anaotoka, usiokuwa karibu sana wala mbali sana na alipo sasa. Kiwakilishi kipi kinafaa?`,
  },
  {
    correct: "huko",
    build: (n) => `${n[0]} anamweleza ${n[1]} kuhusu upande wa shule ambao hawapo sasa, lakini wanaujua vizuri. Kiwakilishi kipi kinafaa?`,
  },
  {
    correct: "pale",
    build: (n) => `${n[0]} anaonyesha mlima unaoonekana mbali sana lakini bado unatambulika wazi machoni. Kiwakilishi kipi kinafaa?`,
  },
  {
    correct: "pale",
    build: (n) => `${n[0]} na ${n[1]} wanaona nyumba maalum mbali kidogo nao lakini inayoonekana wazi. Kiwakilishi kipi kinafaa kuitaja?`,
  },
  {
    correct: "kule",
    build: (n) => `${n[0]} anaeleza safari ndefu kuelekea upande wa mashambani, mbali sana na alipo sasa. Kiwakilishi kipi kinafaa?`,
  },
  {
    correct: "kule",
    build: (n) => `${n[0]} anamweleza ${n[1]} kuhusu upande wa porini ulio mbali sana, usioonekana kabisa kutoka walipo. Kiwakilishi kipi kinafaa?`,
  },
];

const UKARIBU_LABEL: Record<"karibu" | "kati" | "mbali", string> = {
  karibu: "Karibu",
  kati: "Umbali wa Kati",
  mbali: "Mbali",
};

export const viwakilishiViashiriaVyaMahali: Skill = {
  id: "g6-ksw-sarufi-viwakilishi-viashiria-vya-mahali",
  code: "SA.8",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Viwakilishi Viashiria vya Mahali",
  description: "Tambua na tumia viwakilishi viashiria vya mahali (hapa, hapo, pale, huku, huko, kule) kulingana na ukaribu na mwelekeo.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["mc-recall", "click-match", "categorize", "fill-blank", "mc-scenario", "ordering"] as const
    );

    if (branch === "mc-recall") {
      const l = randChoice(rng, LOCATIVES);
      const sibling = LOCATIVES.find((x) => x.ukaribu === l.ukaribu && x.id !== l.id)!;
      const others = shuffle(rng, LOCATIVES.filter((x) => x.id !== l.id && x.id !== sibling.id)).slice(0, 2);
      const choices = shuffle(rng, [l.id, sibling.id, ...others.map((o) => o.id)]);
      return {
        kind: "multiple-choice",
        prompt: `Ni kiwakilishi kipi kiashiria cha mahali kinachoonyesha ${l.maelezo}?`,
        choices,
        correctIndex: choices.indexOf(l.id),
        layout: "row",
        hint: `Fikiria umbali (${l.ukaribu}) na kama ni ${l.aina}.`,
        explanation: `"${l.id}" kinaonyesha ${l.maelezo}.`,
      };
    }

    if (branch === "click-match") {
      const tokens = shuffle(rng, LOCATIVES.map((l) => ({ id: l.id, label: l.id })));
      const targets = shuffle(rng, LOCATIVES.map((l) => ({ id: l.id, label: cap(l.maelezo) })));
      const correctMap: Record<string, string> = {};
      for (const l of LOCATIVES) correctMap[l.id] = l.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kiwakilishi kiashiria cha mahali na maelezo yake sahihi ya umbali/mwelekeo.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kama ni mahali maalum au mwelekeo/upande, na kama ni karibu, kati au mbali.",
        explanation: LOCATIVES.map((l) => `"${l.id}" — ${l.maelezo}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, LOCATIVES.map((l) => ({ id: l.id, label: l.id, bucket: l.ukaribu })));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga viwakilishi hivi viashiria vya mahali kulingana na ukaribu wake: karibu, kati au mbali.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "karibu", label: UKARIBU_LABEL.karibu },
          { id: "kati", label: UKARIBU_LABEL.kati },
          { id: "mbali", label: UKARIBU_LABEL.mbali },
        ],
        correctBucket,
        hint: "'Hapa' na 'huku' ni karibu; 'hapo' na 'huko' ni kati; 'pale' na 'kule' ni mbali.",
        explanation: LOCATIVES.map((l) => `"${l.id}" ni ${UKARIBU_LABEL[l.ukaribu]}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const entry = randChoice(rng, LOCATIVE_EXAMPLES);
      const l = LOCATIVE_MAP[entry.id];
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kiwakilishi kiashiria cha mahali kinachofaa.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.before === "" ? cap(entry.id) : entry.id,
        inputMode: "text",
        hint: `Neno hili linaonyesha ${l.maelezo}.`,
        explanation: `Sentensi kamili ni: "${fullSentence(entry)}"`,
      };
    }

    if (branch === "mc-scenario") {
      const scenario = randChoice(rng, SCENARIOS);
      const names = shuffle(rng, KENYAN_MAJINA).slice(0, 2);
      const choices = shuffle(rng, LOCATIVES.map((l) => l.id));
      const l = LOCATIVE_MAP[scenario.correct];
      return {
        kind: "multiple-choice",
        prompt: scenario.build(names),
        choices,
        correctIndex: choices.indexOf(scenario.correct),
        layout: "row",
        hint: "Fikiria umbali kutoka kwa msemaji, na kama ni mahali maalum au mwelekeo mzima.",
        explanation: `Jibu sahihi ni "${l.id}" kwa sababu kinaonyesha ${l.maelezo}.`,
      };
    }

    const entry = randChoice(rng, LOCATIVE_EXAMPLES);
    const sentence = fullSentence(entry).replace(/[.,]/g, "");
    const words = sentence.split(" ").filter(Boolean);
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye kiwakilishi kiashiria cha mahali.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Neno "${entry.id}" linaonyesha ${LOCATIVE_MAP[entry.id].maelezo}.`,
      explanation: `Sentensi sahihi ni: "${fullSentence(entry)}"`,
    };
  },
};
