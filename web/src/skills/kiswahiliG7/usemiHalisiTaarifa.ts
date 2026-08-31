import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const USEMI: { halisi: string; taarifa: string }[] = [
  { halisi: 'Juma alisema, "Ninafika kesho."', taarifa: "Juma alisema kwamba angefika siku iliyofuata." },
  { halisi: 'Amina alisema, "Ninasoma sasa."', taarifa: "Amina alisema kwamba alikuwa akisoma wakati huo." },
  { halisi: 'Watoto walisema, "Tunacheza mpira."', taarifa: "Watoto walisema kwamba walikuwa wakicheza mpira." },
  { halisi: 'Baba alisema, "Nitakuja jioni."', taarifa: "Baba alisema kwamba angekuja jioni hiyo." },
];

const USEMI_ULIZWA: { halisi: string; taarifa: string }[] = [{ halisi: 'Mwalimu aliuliza, "Umefanya kazi yako?"', taarifa: "Mwalimu aliuliza kama alikuwa amefanya kazi yake." }];

const SIFA: { sentensi: string; aina: "Usemi Halisi" | "Usemi wa Taarifa" }[] = [
  { sentensi: 'Otieno alisema, "Nitashinda mashindano haya."', aina: "Usemi Halisi" },
  { sentensi: "Otieno alisema kwamba angeshinda mashindano hayo.", aina: "Usemi wa Taarifa" },
  { sentensi: 'Halima aliuliza, "Ni saa ngapi sasa?"', aina: "Usemi Halisi" },
  { sentensi: "Halima aliuliza ni saa ngapi wakati huo.", aina: "Usemi wa Taarifa" },
];

const TOFAUTI_MABADILIKO: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: 'Wakati wa kubadilisha "Ninafika kesho" (usemi halisi) kuwa usemi wa taarifa, ni nini kinachobadilika?',
    sahihi: "Kiwakilishi nafsi na wakati wa kitenzi, pamoja na neno la wakati kama 'kesho' hubadilika kulingana na muktadha",
    makosa: [
      "Hakuna kinachobadilika kabisa isipokuwa alama za kunukuu",
      "Maana ya sentensi hubadilika kabisa kuwa tofauti",
      "Ni jina la msemaji pekee linalobadilika",
    ],
  },
];

export const usemiHalisiTaarifa: Skill = {
  id: "g7-ksw-sarufi-usemi-halisi-taarifa",
  code: "SA.11",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Usemi Halisi na Usemi wa Taarifa",
  description: "Badilisha sentensi kutoka usemi halisi kwenda usemi wa taarifa na kinyume chake.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha-usemi", "panga-aina-usemi", "chagua-taarifa", "jaza-taarifa", "tofauti-mabadiliko", "panga-sentensi-taarifa"] as const);

    if (branch === "oanisha-usemi") {
      const chosen = shuffle(rng, USEMI).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((u, i) => ({ id: `h${i}`, label: u.halisi })));
      const targets = shuffle(rng, chosen.map((u, i) => ({ id: `h${i}`, label: u.taarifa })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => {
        correctMap[`h${i}`] = `h${i}`;
      });
      return {
        kind: "click-match",
        prompt: "Oanisha kila sentensi ya usemi halisi na sentensi yake sahihi ya usemi wa taarifa.",
        tokens,
        targets,
        correctMap,
        hint: "Zingatia jinsi kiwakilishi nafsi na wakati wa kitenzi vinavyobadilika.",
        explanation: chosen.map((u) => `"${u.halisi}" hubadilika kuwa "${u.taarifa}".`).join(" "),
      };
    }

    if (branch === "panga-aina-usemi") {
      const chosen = shuffle(rng, SIFA).slice(0, 4);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.sentensi, bucket: s.aina }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila sentensi kama Usemi Halisi au Usemi wa Taarifa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Usemi Halisi", label: "Usemi Halisi" },
          { id: "Usemi wa Taarifa", label: "Usemi wa Taarifa" },
        ],
        correctBucket,
        hint: "Usemi halisi huwa na alama za kunukuu na maneno halisi ya msemaji; usemi wa taarifa huripoti bila alama za kunukuu.",
        explanation: chosen.map((s) => `"${s.sentensi}" ni ${s.aina}.`).join(" "),
      };
    }

    if (branch === "chagua-taarifa") {
      const entry = randChoice(rng, USEMI);
      const distractors = shuffle(rng, USEMI.filter((u) => u.halisi !== entry.halisi).map((u) => u.taarifa)).slice(0, 3);
      const choices = shuffle(rng, [entry.taarifa, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Badilisha sentensi hii kuwa usemi wa taarifa: ${entry.halisi}`,
        choices,
        correctIndex: choices.indexOf(entry.taarifa),
        layout: "list",
        hint: "Kiwakilishi nafsi na wakati wa kitenzi hubadilika unapotumia 'kwamba'.",
        explanation: `Usemi wa taarifa sahihi ni: "${entry.taarifa}"`,
      };
    }

    if (branch === "jaza-taarifa") {
      const entry = randChoice(rng, USEMI_ULIZWA);
      return {
        kind: "fill-blank",
        prompt: `Kamilisha usemi wa taarifa unaotokana na: ${entry.halisi}`,
        before: "Mwalimu aliuliza kama alikuwa",
        after: " kazi yake.",
        correctAnswer: "amefanya",
        inputMode: "text",
        hint: "Maswali katika usemi wa taarifa hutumia 'kama' badala ya 'kwamba'.",
        explanation: `Usemi wa taarifa sahihi ni: "${entry.taarifa}"`,
      };
    }

    if (branch === "tofauti-mabadiliko") {
      const entry = randChoice(rng, TOFAUTI_MABADILIKO);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: entry.swali,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Fikiria vipengele vitatu vinavyobadilika: nafsi, wakati, na maneno ya wakati kama 'kesho' au 'sasa'.",
        explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
      };
    }

    const entry = randChoice(rng, USEMI);
    const words = entry.taarifa.replace(".", "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: `Panga maneno haya kuunda sentensi sahihi ya usemi wa taarifa inayotokana na: ${entry.halisi}`,
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Anza na jina la msemaji, kisha 'alisema kwamba', kisha kitendo alichokieleza.",
      explanation: `Sentensi sahihi ni: "${entry.taarifa}"`,
    };
  },
};
