import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VERBS: { root: string; kitenzi: string; kitu: string }[] = [
  { root: "soma", kitenzi: "kusoma", kitu: "kitabu" },
  { root: "cheza", kitenzi: "kucheza", kitu: "mpira" },
  { root: "pika", kitenzi: "kupika", kitu: "chakula" },
  { root: "imba", kitenzi: "kuimba", kitu: "wimbo" },
  { root: "andika", kitenzi: "kuandika", kitu: "barua" },
];

const SUBJECTS = [
  { kiwakilishi: "Mimi", kiambishi: "ni" },
  { kiwakilishi: "Yeye", kiambishi: "a" },
  { kiwakilishi: "Sisi", kiambishi: "tu" },
  { kiwakilishi: "Wao", kiambishi: "wa" },
];

const TIME_CLUES = [
  { clue: "Jana,", wakati: "past" as const },
  { clue: "Wiki iliyopita,", wakati: "past" as const },
  { clue: "Sasa hivi,", wakati: "sasa" as const },
  { clue: "Kesho,", wakati: "ujao" as const },
  { clue: "Mwaka ujao,", wakati: "ujao" as const },
  { clue: "Tayari,", wakati: "timilifu" as const },
];

const TENSE_MARKERS: Record<(typeof TIME_CLUES)[number]["wakati"], string> = {
  past: "li",
  sasa: "na",
  ujao: "ta",
  timilifu: "me",
};

const TENSE_INFO: Record<(typeof TIME_CLUES)[number]["wakati"], { jina: string; sababu: string }> = {
  past: { jina: "wakati uliopita (kiambishi -li-)", sababu: "tukio limekwisha tokea" },
  sasa: { jina: "wakati wa sasa (kiambishi -na-)", sababu: "tukio linaendelea au hufanyika sasa hivi" },
  ujao: { jina: "wakati ujao (kiambishi -ta-)", sababu: "tukio litatokea baadaye" },
  timilifu: { jina: "wakati timilifu (kiambishi -me-)", sababu: "tukio limekwisha kamilika" },
};

export const nyakati: Skill = {
  id: "kis-g-nyakati",
  code: "S.2",
  subjectId: "kiswahili",
  strandId: "kis-sarufi",
  grade: 9,
  title: "Chagua wakati sahihi wa kitenzi",
  description: "Chagua umbo la kitenzi linalolingana na kiashiria cha wakati katika sentensi.",
  generate(rng) {
    const verb = randChoice(rng, VERBS);
    const timeClue = randChoice(rng, TIME_CLUES);
    const subject = randChoice(rng, SUBJECTS);

    const forms = Object.fromEntries(
      (Object.entries(TENSE_MARKERS) as [keyof typeof TENSE_MARKERS, string][]).map(([wakati, kiambishi]) => [
        wakati,
        `${subject.kiambishi}${kiambishi}${verb.root}`,
      ])
    ) as Record<keyof typeof TENSE_MARKERS, string>;

    const correct = forms[timeClue.wakati];
    const info = TENSE_INFO[timeClue.wakati];
    const clueWord = timeClue.clue.replace(/,$/, "");
    const hint = `"${clueWord}" kinaonyesha wakati gani wa kitendo?`;
    const explanation = `"${clueWord}" kinaonyesha ${info.jina} kwa sababu ${info.sababu}, hivyo umbo sahihi ni "${correct}".`;

    if (rng() < 0.5) {
      return {
        kind: "fill-blank",
        prompt: `Kamilisha sentensi kwa umbo sahihi la kitenzi. (${verb.kitenzi})`,
        before: `${timeClue.clue} ${subject.kiwakilishi}`,
        after: `${verb.kitu}.`,
        correctAnswer: correct,
        inputMode: "text",
        hint,
        explanation,
      };
    }

    const distractors = (Object.keys(forms) as (keyof typeof forms)[])
      .filter((k) => k !== timeClue.wakati)
      .map((k) => forms[k]);
    const choices = shuffle(rng, [correct, ...distractors]);

    return {
      kind: "multiple-choice",
      prompt: `${timeClue.clue} ${subject.kiwakilishi} ___ (${verb.kitenzi}) ${verb.kitu}.`,
      choices,
      correctIndex: choices.indexOf(correct),
      layout: "row",
      hint,
      explanation,
    };
  },
};
