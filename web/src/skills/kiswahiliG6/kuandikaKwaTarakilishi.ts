import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Umbo = "chapa-koza" | "italiki" | "mstari";

const UMBO_MAELEZO: Record<Umbo, string> = {
  "chapa-koza": "chapa koza (bold) huonyesha maneno muhimu kwa uzito zaidi wa herufi",
  italiki: "italiki (italic) huonyesha maandishi yaliyoinama, mara nyingi kwa majina ya vitabu au msisitizo",
  mstari: "kupigwa mstari chini (underline) huonyesha kusisitiza maneno muhimu au viungo",
};

const MATUMIZI: { sentensi: string; umbo: Umbo }[] = [
  { sentensi: "KUMBUKA: mtihani ni kesho", umbo: "chapa-koza" },
  { sentensi: "Jina la mwandishi wa insha bora", umbo: "chapa-koza" },
  { sentensi: "Onyo muhimu kwa wanafunzi wote", umbo: "chapa-koza" },
  { sentensi: "Neno lenye msisitizo mkubwa", umbo: "chapa-koza" },
  { sentensi: "Kichwa cha habari kwenye gazeti", umbo: "chapa-koza" },
  { sentensi: "Jina la kitabu: Kusadikika", umbo: "italiki" },
  { sentensi: "Neno la kigeni lililotumika kwenye insha", umbo: "italiki" },
  { sentensi: "Jina la filamu iliyotajwa katika mazungumzo", umbo: "italiki" },
  { sentensi: "Sentensi iliyonukuliwa moja kwa moja", umbo: "italiki" },
  { sentensi: "Jina la gazeti lililotajwa kwenye ripoti", umbo: "italiki" },
  { sentensi: "Kiungo (link) cha tovuti muhimu", umbo: "mstari" },
  { sentensi: "Neno gumu linalohitaji ufafanuzi zaidi", umbo: "mstari" },
  { sentensi: "Tarehe muhimu ya mtihani", umbo: "mstari" },
  { sentensi: "Sehemu ya sentensi yenye kosa la kisarufi", umbo: "mstari" },
  { sentensi: "Jina la mtu anayehusika moja kwa moja", umbo: "mstari" },
];

const HATUA_ZA_KUANDIKA = [
  { id: "1", label: "Fungua faili ya uandishi kwenye tarakilishi" },
  { id: "2", label: "Andika maneno unayotaka kutofautisha" },
  { id: "3", label: "Chagua/teua maneno hayo kwa kutumia kipanya" },
  { id: "4", label: "Chagua ishara ya kutofautisha (chapa koza, italiki au mstari)" },
  { id: "5", label: "Hifadhi kazi yako" },
];

export const kuandikaKwaTarakilishi: Skill = {
  id: "g6-ksw-ka-kuandika-kwa-tarakilishi",
  code: "KA.3",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ka",
  grade: 6,
  title: "Kuandika kwa Tarakilishi",
  description: "Tambua na utumie aina mbalimbali za maandishi ya tarakilishi (chapa koza, italiki, mstari) kutofautisha maandishi.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-umbo", "oanisha-maelezo", "panga-matumizi", "jaza-umbo", "panga-hatua"] as const);

    if (branch === "chagua-umbo") {
      const m = randChoice(rng, MATUMIZI);
      const wote: Umbo[] = ["chapa-koza", "italiki", "mstari"];
      const majina: Record<Umbo, string> = { "chapa-koza": "Chapa Koza", italiki: "Italiki", mstari: "Kupigwa Mstari" };
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `Ni umbo lipi la maandishi linalofaa kwa "${m.sentensi}"?`,
        choices: choices.map((c) => majina[c]),
        correctIndex: choices.indexOf(m.umbo),
        layout: "row",
        hint: UMBO_MAELEZO[m.umbo],
        explanation: `Umbo linalofaa ni ${majina[m.umbo]} — ${UMBO_MAELEZO[m.umbo]}.`,
      };
    }

    if (branch === "oanisha-maelezo") {
      const majina: Record<Umbo, string> = { "chapa-koza": "Chapa Koza", italiki: "Italiki", mstari: "Kupigwa Mstari" };
      const tokens = (["chapa-koza", "italiki", "mstari"] as const).map((u) => ({ id: u, label: majina[u] }));
      const targets = shuffle(rng, ["chapa-koza", "italiki", "mstari"] as const).map((u) => ({ id: u, label: UMBO_MAELEZO[u] }));
      const correctMap: Record<string, string> = { "chapa-koza": "chapa-koza", italiki: "italiki", mstari: "mstari" };
      return {
        kind: "click-match",
        prompt: "Oanisha kila umbo la maandishi na matumizi yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria ni lini unatumia kila umbo hili.",
        explanation: (["chapa-koza", "italiki", "mstari"] as const).map((u) => `${majina[u]}: ${UMBO_MAELEZO[u]}.`).join(" "),
      };
    }

    if (branch === "panga-matumizi") {
      const chosen = shuffle(rng, MATUMIZI).slice(0, 6);
      const items = chosen.map((m, i) => ({ id: `${i}-${m.sentensi}`, label: m.sentensi, bucket: m.umbo }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga mifano hii kulingana na umbo la maandishi linalofaa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "chapa-koza", label: "Chapa Koza" },
          { id: "italiki", label: "Italiki" },
          { id: "mstari", label: "Kupigwa Mstari" },
        ],
        correctBucket,
        hint: "Fikiria kusudi la kila mfano — je, ni onyo, jina la kitabu, au kiungo?",
        explanation: chosen.map((m) => `"${m.sentensi}" hufaa umbo la ${m.umbo}.`).join(" "),
      };
    }

    if (branch === "jaza-umbo") {
      const m = randChoice(rng, MATUMIZI);
      const majina: Record<Umbo, string> = { "chapa-koza": "chapa koza", italiki: "italiki", mstari: "kupigwa mstari" };
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu umbo linalofaa la maandishi.",
        before: `Kwa "${m.sentensi}", umbo linalofaa ni "`,
        after: `".`,
        correctAnswer: majina[m.umbo],
        inputMode: "text",
        hint: UMBO_MAELEZO[m.umbo],
        explanation: `Umbo linalofaa ni "${majina[m.umbo]}" — ${UMBO_MAELEZO[m.umbo]}.`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_KUANDIKA);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kutofautisha maandishi kwenye tarakilishi kwa mpangilio sahihi.",
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_KUANDIKA.map((h) => h.id),
      hint: "Fikiria mchakato kutoka kufungua faili hadi kuhifadhi kazi.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_KUANDIKA.map((h) => h.label).join(" → "),
    };
  },
};
