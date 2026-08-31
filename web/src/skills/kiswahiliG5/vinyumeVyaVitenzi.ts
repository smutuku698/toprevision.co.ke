import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 9.4.1 Vinyume vya Vitenzi (Magonjwa).
// Ona curriculum-reference/grade-5/kiswahili.json.

const JOZI_VINYUME: [string, string][] = [
  ["simama", "keti"],
  ["cheka", "lia"],
  ["enda", "rudi"],
  ["anika", "anua"],
  ["fungua", "funga"],
  ["ingia", "toka"],
  ["panda", "shuka"],
  ["jenga", "bomoa"],
  ["chukua", "weka"],
  ["amka", "lala"],
];

const SENTENSI_JAZA: { neno: string; kinyume: string; before: string; after: string }[] = [
  ["simama", "keti", "Mwalimu alimwambia mwanafunzi ", " badala ya kukaa."],
  ["cheka", "lia", "Mtoto alianza ", " badala ya kucheka."],
  ["enda", "rudi", "Baada ya safari, ni lazima ", " nyumbani."],
  ["anika", "anua", "Nguo zikikauka, tunapaswa ku", " zenyewe."],
  ["fungua", "funga", "Kabla ya kutoka, tafadhali ", " mlango."],
  ["ingia", "toka", "Mgonjwa aliambiwa ", " chumbani baada ya matibabu."],
  ["panda", "shuka", "Basi lilipofika, abiria walianza ku", "."],
  ["jenga", "bomoa", "Serikali iliamua ku", " nyumba chakavu."],
  ["chukua", "weka", "Tafadhali ", " kitabu mahali pake baada ya kusoma." ],
  ["amka", "lala", "Baada ya siku ndefu, ni wakati wa ku", "."],
].map(([neno, kinyume, before, after]) => ({ neno, kinyume, before, after }));

export const vinyumeVyaVitenzi: Skill = {
  id: "g5-ksw-sarufi-vinyume-vitenzi",
  code: "SA.10",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Vinyume vya Vitenzi (Magonjwa)",
  description: "Tambua na utumie vinyume vya vitenzi (mfano: simama-keti, cheka-lia) katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-kinyume", "oanisha-jozi", "panga-jozi", "jaza-kinyume", "panga-ratiba"] as const);

    if (branch === "tambua-kinyume") {
      const [a, b] = randChoice(rng, JOZI_VINYUME);
      const neno = randChoice(rng, [a, b]);
      const sahihi = neno === a ? b : a;
      const distractors = shuffle(rng, JOZI_VINYUME.flat().filter((w) => w !== a && w !== b)).slice(0, 3);
      const choices = shuffle(rng, [sahihi, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "kinyume cha kitenzi hiki")} "${neno}"`,
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "row",
        hint: "Fikiria kitendo kinachopingana moja kwa moja na hiki.",
        explanation: `Kinyume cha "${neno}" ni "${sahihi}".`,
      };
    }

    if (branch === "oanisha-jozi") {
      const chosen = shuffle(rng, JOZI_VINYUME).slice(0, 4);
      const tokens = chosen.map(([a], i) => ({ id: `${i}`, label: a }));
      const targets = shuffle(rng, chosen).map(([a, b]) => ({ id: `${chosen.findIndex((p) => p[0] === a)}`, label: b }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_p, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "kitenzi na kinyume chake"),
        tokens,
        targets,
        correctMap,
        hint: "Kila kitenzi kina kinyume kimoja tu katika orodha hii.",
        explanation: chosen.map(([a, b]) => `Kinyume cha "${a}" ni "${b}".`).join(" "),
      };
    }

    if (branch === "panga-jozi") {
      const jozi = shuffle(rng, JOZI_VINYUME).slice(0, 3);
      const items = jozi.flatMap(([a, b], i) => [
        { id: `${i}-a`, label: a, bucket: `J${i}` },
        { id: `${i}-b`, label: b, bucket: `J${i}` },
      ]);
      const shuffled = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const item of shuffled) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "vitenzi hivi katika jozi zake za vinyume"),
        items: shuffled.map(({ id, label }) => ({ id, label })),
        buckets: jozi.map(([a, b], i) => ({ id: `J${i}`, label: `${a} / ${b}` })),
        correctBucket,
        hint: "Weka kila kitenzi pamoja na kinyume chake.",
        explanation: jozi.map(([a, b]) => `"${a}" na "${b}" ni jozi ya vinyume.`).join(" "),
      };
    }

    if (branch === "jaza-kinyume") {
      const s = randChoice(rng, SENTENSI_JAZA);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: s.before,
        after: s.after,
        correctAnswer: s.kinyume,
        inputMode: "text",
        hint: `Neno linalokosekana ni kinyume cha "${s.neno}".`,
        explanation: `Sentensi kamili: "${s.before}${s.kinyume}${s.after}"`,
      };
    }

    const ratiba = shuffle(rng, ["amka", "simama", "enda", "rudi", "lala"]).slice(0, 5);
    const mpangilio = ["amka", "simama", "enda", "rudi", "lala"].filter((w) => ratiba.includes(w));
    const items = ratiba.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    const correctOrder = mpangilio.map((w) => items.find((i) => i.label === w)!.id);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "vitenzi hivi kulingana na ratiba ya kawaida ya siku"),
      instruction: "Bofya vitenzi kwa mpangilio wa ratiba ya siku.",
      items: shuffle(rng, items),
      correctOrder,
      hint: "Fikiria shughuli za siku kutoka asubuhi hadi usiku.",
      explanation: `Mpangilio wa ratiba: ${mpangilio.join(", ")}.`,
    };
  },
};
