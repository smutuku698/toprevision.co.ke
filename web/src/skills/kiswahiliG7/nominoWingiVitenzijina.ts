import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const UMOJA_WINGI: { umoja: string; wingi: string }[] = [
  { umoja: "mtoto", wingi: "watoto" },
  { umoja: "mwalimu", wingi: "walimu" },
  { umoja: "mtu", wingi: "watu" },
  { umoja: "mti", wingi: "miti" },
  { umoja: "mkono", wingi: "mikono" },
  { umoja: "kitabu", wingi: "vitabu" },
  { umoja: "kiti", wingi: "viti" },
  { umoja: "kikombe", wingi: "vikombe" },
];

const VITENZI_JINA: { kitenzi: string; nomino: string }[] = [
  { kitenzi: "kusoma", nomino: "usomaji" },
  { kitenzi: "kucheza", nomino: "uchezaji" },
  { kitenzi: "kuandika", nomino: "uandishi" },
  { kitenzi: "kupika", nomino: "upishi" },
  { kitenzi: "kuimba", nomino: "uimbaji" },
  { kitenzi: "kufundisha", nomino: "ufundishaji" },
];

const HATUA_UTOKANAJI = [
  { id: "mzizi", label: "Chukua mzizi wa kitenzi (mfano: -imb- kutoka 'kuimba')" },
  { id: "awali", label: "Ongeza kiambishi awali 'u' mwanzoni mwa mzizi" },
  { id: "tamati", label: "Ongeza kiambishi tamati kinachofaa (mfano: -aji, -i)" },
  { id: "hakiki", label: "Hakiki kuwa nomino mpya iliyopatikana ina maana sahihi" },
];

export const nominoWingiVitenzijina: Skill = {
  id: "g7-ksw-sarufi-nomino-wingi-vitenzi-jina",
  code: "SA.2",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Nomino za Wingi na za Vitenzi-jina",
  description: "Badilisha nomino kutoka umoja hadi wingi, na uunde nomino za vitenzi-jina kutokana na vitenzi.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["oanisha-wingi", "panga-umoja-wingi", "chagua-wingi", "jaza-wingi", "oanisha-vitenzijina", "jaza-vitenzijina", "hatua-utokanaji"] as const,
    );

    if (branch === "oanisha-wingi") {
      const chosen = shuffle(rng, UMOJA_WINGI).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.umoja, label: p.umoja })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.umoja, label: p.wingi })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.umoja] = p.umoja;
      return {
        kind: "click-match",
        prompt: "Oanisha kila nomino ya umoja na wingi wake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Zingatia jinsi kiambishi awali cha nomino kinavyobadilika kutoka umoja hadi wingi.",
        explanation: chosen.map((p) => `Wingi wa "${p.umoja}" ni "${p.wingi}".`).join(" "),
      };
    }

    if (branch === "panga-umoja-wingi") {
      const chosen = shuffle(rng, UMOJA_WINGI).slice(0, 4);
      const items = chosen.flatMap((p) => [
        { id: `u-${p.umoja}`, label: p.umoja, bucket: "Umoja" },
        { id: `w-${p.wingi}`, label: p.wingi, bucket: "Wingi" },
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila nomino kama Umoja au Wingi.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Umoja", label: "Umoja" },
          { id: "Wingi", label: "Wingi" },
        ],
        correctBucket,
        hint: "Nomino za wingi mara nyingi huanza na 'wa-', 'mi-', au 'vi-' badala ya 'm-' au 'ki-'.",
        explanation: chosen.map((p) => `"${p.umoja}" ni umoja; "${p.wingi}" ni wingi wake.`).join(" "),
      };
    }

    if (branch === "chagua-wingi") {
      const entry = randChoice(rng, UMOJA_WINGI);
      const distractors = shuffle(rng, UMOJA_WINGI.filter((p) => p.umoja !== entry.umoja).map((p) => p.wingi)).slice(0, 3);
      const choices = shuffle(rng, [entry.wingi, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Wingi wa nomino "${entry.umoja}" ni upi?`,
        choices,
        correctIndex: choices.indexOf(entry.wingi),
        layout: "grid",
        hint: "Fikiria kiambishi awali kinachofaa kwa aina ya nomino hii.",
        explanation: `Wingi wa "${entry.umoja}" ni "${entry.wingi}".`,
      };
    }

    if (branch === "jaza-wingi") {
      const entry = randChoice(rng, UMOJA_WINGI);
      return {
        kind: "fill-blank",
        prompt: "Andika wingi sahihi wa nomino iliyotolewa.",
        before: `Wingi wa "${entry.umoja}" ni`,
        after: ".",
        correctAnswer: entry.wingi,
        inputMode: "text",
        hint: "Badilisha kiambishi awali cha nomino ili kupata wingi wake.",
        explanation: `Wingi wa "${entry.umoja}" ni "${entry.wingi}".`,
      };
    }

    if (branch === "oanisha-vitenzijina") {
      const chosen = shuffle(rng, VITENZI_JINA).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.kitenzi, label: p.kitenzi })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.kitenzi, label: p.nomino })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.kitenzi] = p.kitenzi;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kitenzi na nomino ya vitenzi-jina inayotokana nayo.",
        tokens,
        targets,
        correctMap,
        hint: "Nomino ya vitenzi-jina hutokana na kitenzi lakini huwa na kiambishi awali 'u-'.",
        explanation: chosen.map((p) => `Kutoka "${p.kitenzi}" hupatikana nomino "${p.nomino}".`).join(" "),
      };
    }

    if (branch === "jaza-vitenzijina") {
      const entry = randChoice(rng, VITENZI_JINA);
      return {
        kind: "fill-blank",
        prompt: "Andika nomino ya vitenzi-jina inayotokana na kitenzi kilichotolewa.",
        before: `Nomino inayotokana na kitenzi "${entry.kitenzi}" ni`,
        after: ".",
        correctAnswer: entry.nomino,
        inputMode: "text",
        hint: "Ongeza kiambishi awali 'u-' na kiambishi tamati kinachofaa mzizi wa kitenzi.",
        explanation: `Kutoka "${entry.kitenzi}" hupatikana nomino "${entry.nomino}".`,
      };
    }

    const items = shuffle(rng, HATUA_UTOKANAJI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kuunda nomino ya vitenzi-jina kutokana na kitenzi kwa mpangilio unaofaa.",
      instruction: "Bofya kwa mpangilio sahihi kuanzia mwanzo hadi mwisho.",
      items,
      correctOrder: HATUA_UTOKANAJI.map((h) => h.id),
      hint: "Anza na mzizi wa kitenzi, kisha ongeza viambishi vifaavyo, na hatimaye hakiki neno jipya.",
      explanation: HATUA_UTOKANAJI.map((h) => h.label).join(" → "),
    };
  },
};
