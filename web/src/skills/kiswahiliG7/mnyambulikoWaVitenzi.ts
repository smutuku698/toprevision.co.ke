import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VITENZI: { tenda: string; tendea: string; tendwa: string; sentensiTendwa: string }[] = [
  { tenda: "kusoma", tendea: "kusomea", tendwa: "kusomwa", sentensiTendwa: "Kitabu hicho kilisomwa jana." },
  { tenda: "kuandika", tendea: "kuandikia", tendwa: "kuandikwa", sentensiTendwa: "Barua ile iliandikwa haraka." },
  { tenda: "kupika", tendea: "kupikia", tendwa: "kupikwa", sentensiTendwa: "Chakula kile kilipikwa vizuri." },
  { tenda: "kufungua", tendea: "kufungulia", tendwa: "kufunguliwa", sentensiTendwa: "Mlango ule ulifunguliwa asubuhi." },
  { tenda: "kuuza", tendea: "kuuzia", tendwa: "kuuzwa", sentensiTendwa: "Nguo hizo ziliuzwa sokoni." },
  { tenda: "kuosha", tendea: "kuoshea", tendwa: "kuoshwa", sentensiTendwa: "Vyombo vile vilioshwa jioni." },
];

const SENTENSI_KAULI: { sentensi: string; kauli: "Kutenda" | "Kutendea" | "Kutendwa" }[] = [
  { sentensi: "Amina anasoma kitabu chake.", kauli: "Kutenda" },
  { sentensi: "Amina anamsomea mdogo wake hadithi.", kauli: "Kutendea" },
  { sentensi: "Kitabu hicho kinasomwa na wanafunzi wote.", kauli: "Kutendwa" },
  { sentensi: "Mama anapika ugali.", kauli: "Kutenda" },
  { sentensi: "Mama anampikia mgeni chakula maalum.", kauli: "Kutendea" },
  { sentensi: "Ugali ulipikwa jikoni asubuhi.", kauli: "Kutendwa" },
];

export const mnyambulikoWaVitenzi: Skill = {
  id: "g7-ksw-sarufi-mnyambuliko-wa-vitenzi",
  code: "SA.7",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Mnyambuliko wa Vitenzi: Kutenda, Kutendea, Kutendwa",
  description: "Badilisha vitenzi kutoka kauli ya kutenda hadi kutendea na kutendwa, na utambue kauli inayotumika katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha-tendea", "panga-kauli", "chagua-tendwa", "jaza-tendwa", "tambua-kauli", "panga-sentensi-tendwa"] as const);

    if (branch === "oanisha-tendea") {
      const chosen = shuffle(rng, VITENZI).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.tenda, label: v.tenda })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.tenda, label: v.tendea })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.tenda] = v.tenda;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kitenzi cha kutenda na umbo lake la kutendea (kufanyia mwingine).",
        tokens,
        targets,
        correctMap,
        hint: "Umbo la kutendea huongeza kiambishi tamati '-i-' au '-e-' kabla ya mwisho wa kitenzi.",
        explanation: chosen.map((v) => `"${v.tenda}" hubadilika kuwa "${v.tendea}" katika kauli ya kutendea.`).join(" "),
      };
    }

    if (branch === "panga-kauli") {
      const items = SENTENSI_KAULI.map((s, i) => ({ id: `s${i}`, label: s.sentensi, bucket: s.kauli }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila sentensi kulingana na kauli ya kitenzi kinachotumika: Kutenda, Kutendea, au Kutendwa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Kutenda", label: "Kutenda" },
          { id: "Kutendea", label: "Kutendea" },
          { id: "Kutendwa", label: "Kutendwa" },
        ],
        correctBucket,
        hint: "Kutenda ni tendo la kawaida; kutendea ni tendo linalofanyiwa mtu mwingine; kutendwa ni tendo linalompata mtu/kitu.",
        explanation: SENTENSI_KAULI.map((s) => `"${s.sentensi}" iko katika kauli ya ${s.kauli}.`).join(" "),
      };
    }

    if (branch === "chagua-tendwa") {
      const entry = randChoice(rng, VITENZI);
      const distractors = shuffle(rng, VITENZI.filter((v) => v.tenda !== entry.tenda).map((v) => v.tendwa)).slice(0, 3);
      const choices = shuffle(rng, [entry.tendwa, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Umbo la kauli ya kutendwa la kitenzi "${entry.tenda}" ni lipi?`,
        choices,
        correctIndex: choices.indexOf(entry.tendwa),
        layout: "grid",
        hint: "Umbo la kutendwa huonyesha kwamba tendo linampata au linamfikia mhusika, si kwamba yeye anatenda.",
        explanation: `Umbo la kutendwa la "${entry.tenda}" ni "${entry.tendwa}".`,
      };
    }

    if (branch === "jaza-tendwa") {
      const entry = randChoice(rng, VITENZI);
      return {
        kind: "fill-blank",
        prompt: "Andika umbo la kauli ya kutendwa la kitenzi kilichotolewa.",
        before: `Umbo la kutendwa la "${entry.tenda}" ni`,
        after: ".",
        correctAnswer: entry.tendwa,
        inputMode: "text",
        hint: "Ongeza kiambishi tamati '-wa' au '-liwa/-lewa' kwenye mzizi wa kitenzi.",
        explanation: `Umbo la kutendwa la "${entry.tenda}" ni "${entry.tendwa}".`,
      };
    }

    if (branch === "tambua-kauli") {
      const entry = randChoice(rng, SENTENSI_KAULI);
      const kauliZote: ("Kutenda" | "Kutendea" | "Kutendwa")[] = ["Kutenda", "Kutendea", "Kutendwa"];
      const choices = shuffle(rng, kauliZote);
      return {
        kind: "multiple-choice",
        prompt: `Sentensi "${entry.sentensi}" iko katika kauli gani?`,
        choices,
        correctIndex: choices.indexOf(entry.kauli),
        layout: "row",
        hint: "Zingatia iwapo mhusika anatenda tendo lenyewe, anatendea mwingine, au tendo linamfikia yeye.",
        explanation: `Sentensi hii iko katika kauli ya ${entry.kauli}.`,
      };
    }

    const entry = randChoice(rng, VITENZI);
    const words = entry.sentensiTendwa.replace(".", "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: `Panga maneno haya kuunda sentensi sahihi ya kauli ya kutendwa kwa kutumia kitenzi "${entry.tenda}".`,
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Umbo la kutendwa la "${entry.tenda}" ni "${entry.tendwa}".`,
      explanation: `Sentensi sahihi ni: "${entry.sentensiTendwa}"`,
    };
  },
};
