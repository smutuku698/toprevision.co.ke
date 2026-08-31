import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POEM_A = {
  title: "Mount Longonot Speaks",
  text:
    "I have watched the valley since before your grandmother's birth,\nMy shoulders green with forest, my belly full of earth.\nEach dawn I greet the climbers who puff up my old back,\nI groan a little louder on their heaviest track.\n\nI keep my secrets quiet, deep within my crater bowl,\nAnd share my view for free with every weary soul.\nCome walk upon my ridges, but leave no litter behind,\nFor a mountain, like a person, remembers what it finds.",
};

const POEM_B = {
  title: "The Old Lighthouse of Ras Point",
  text:
    "I stood alone on Ras Point through a hundred stormy years,\nMy single eye kept blinking through the sailors' fears.\nI never sleep, I never rest, I never leave my post,\nI've guided home more wanderers than I could ever boast.\n\nSome say I am just old stone, a tower cold and bare,\nBut ask the fishing families who still know I care.\nI'll keep my lonely watch until my final light goes dim,\nA quiet friend to travellers who trust my steady beam.",
};

const STANZA_ORDER_A = [
  { id: "a1", label: "I keep my secrets quiet, deep within my crater bowl," },
  { id: "a2", label: "And share my view for free with every weary soul." },
  { id: "a3", label: "Come walk upon my ridges, but leave no litter behind," },
  { id: "a4", label: "For a mountain, like a person, remembers what it finds." },
];

const STANZA_ORDER_B = [
  { id: "b1", label: "I stood alone on Ras Point through a hundred stormy years," },
  { id: "b2", label: "My single eye kept blinking through the sailors' fears." },
  { id: "b3", label: "I never sleep, I never rest, I never leave my post," },
  { id: "b4", label: "I've guided home more wanderers than I could ever boast." },
];

const RHYME_FILLS = [
  { poem: POEM_A, before: "I keep my secrets quiet, deep within my crater bowl,\nAnd share my view for free with every weary", after: ".", correctAnswer: "soul" },
  { poem: POEM_B, before: "I stood alone on Ras Point through a hundred stormy years,\nMy single eye kept blinking through the sailors'", after: ".", correctAnswer: "fears" },
];

const CHARACTER_QUESTIONS: { poem: typeof POEM_A; q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    poem: POEM_A,
    q: "What inanimate object is given human-like qualities (a 'voice') in this poem?",
    correct: "Mount Longonot, a mountain",
    distractors: ["A river flowing through a valley", "A climber's walking stick", "A weary soul visiting the crater"],
    explanation: "The title and first-person voice throughout ('I have watched the valley... my belly full of earth') show the mountain itself is speaking as if it were a person.",
  },
  {
    poem: POEM_B,
    q: "What inanimate object is given human-like qualities (a 'voice') in this poem?",
    correct: "The lighthouse at Ras Point",
    distractors: ["A ship lost at sea", "A fisherman's boat", "The ocean itself"],
    explanation: "The poem's title and lines like 'My single eye kept blinking' and 'I never sleep' give the lighthouse human senses and habits, as if it were speaking.",
  },
];

const TRAIT_QUESTIONS: { poem: typeof POEM_A; q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    poem: POEM_A,
    q: "What trait does the mountain describe itself as having, based on the poem?",
    correct: "Patient and watchful, having observed the valley for generations",
    distractors: ["Impatient and quick to anger at climbers", "Fearful of the climbers who visit", "Uninterested in the people around it"],
    explanation: "The line 'I have watched the valley since before your grandmother's birth' shows the mountain as patient and watchful over a very long time.",
  },
  {
    poem: POEM_B,
    q: "What trait does the lighthouse describe itself as having, based on the poem?",
    correct: "Loyal and dependable, always at its post guiding others",
    distractors: ["Careless about the sailors it should guide", "Eager to abandon its post during storms", "Indifferent to the fishing families nearby"],
    explanation: "The lines 'I never sleep, I never rest, I never leave my post' and 'I've guided home more wanderers' show loyalty and dependability.",
  },
];

const DEVICE_QUESTIONS: { poem: typeof POEM_A; q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    poem: POEM_A,
    q: "Which poetic device is used when the mountain is described as having 'shoulders' and a 'belly'?",
    correct: "Personification — giving a non-human thing human body parts and feelings",
    distractors: ["Rhyme — matching sounds at line ends", "A refrain — a repeated line", "A stanza break — a gap between groups of lines"],
    explanation: "Giving the mountain 'shoulders' and a 'belly,' and having it speak and 'groan,' is personification: describing something non-human as if it were human.",
  },
  {
    poem: POEM_B,
    q: "Why does the poet use personification to describe the lighthouse?",
    correct: "It helps readers connect emotionally to the lighthouse's role of care and reliability, as if it were a devoted friend",
    distractors: ["It makes the poem harder to understand on purpose", "It proves the lighthouse is literally alive", "It has no real purpose in the poem"],
    explanation: "By giving the lighthouse feelings ('a quiet friend to travellers') and dedication, the poet makes its role of guiding sailors feel more personal and appreciated than a plain description would.",
  },
];

export const poetryInanimateCharacters: Skill = {
  id: "g8-eng-r-poetry-inanimate-characters",
  code: "R.16",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Poetry - Inanimate Characters",
  description: "Identify inanimate characters in a poem, describe their traits, and appreciate the role personification plays in poetry.",
  generate(rng) {
    const branch = randChoice(rng, ["character", "trait", "device", "match", "order", "fill"] as const);
    const hint = "An inanimate character is a non-living thing given human qualities like a voice, feelings, or a body.";

    if (branch === "character") {
      const entry = randChoice(rng, CHARACTER_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: entry.poem.text,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "trait") {
      const entry = randChoice(rng, TRAIT_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: entry.poem.text,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "device") {
      const entry = randChoice(rng, DEVICE_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: entry.poem.text,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: entry.explanation,
      };
    }

    if (branch === "order") {
      const useA = rng() < 0.5;
      const stanza = useA ? STANZA_ORDER_A : STANZA_ORDER_B;
      const poem = useA ? POEM_A : POEM_B;
      const items = shuffle(rng, stanza);
      return {
        kind: "ordering",
        prompt: `Arrange the lines of the second stanza of "${poem.title}" in the correct order.`,
        instruction: "Click them in order.",
        items,
        correctOrder: stanza.map((s) => s.id),
        hint: "Read each line and think about which idea would naturally come first, and which lines rhyme at the end of pairs.",
        explanation: stanza.map((s) => s.label).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, RHYME_FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing rhyming word to complete the line.",
        passage: entry.poem.text,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look at the poem above and find the word that completes the rhyme.",
        explanation: `The full line reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const poem = randChoice(rng, [POEM_A, POEM_B]);
    const pairs =
      poem === POEM_A
        ? [
            { phrase: "\"My shoulders green with forest\"", trait: "Given a body, like a person" },
            { phrase: "\"I groan a little louder\"", trait: "Given a human sound of effort" },
            { phrase: "\"I keep my secrets quiet\"", trait: "Given human discretion" },
            { phrase: "\"leave no litter behind... remembers what it finds\"", trait: "Given human memory" },
          ]
        : [
            { phrase: "\"My single eye kept blinking\"", trait: "Given a human eye" },
            { phrase: "\"I never sleep, I never rest\"", trait: "Given human habits like sleeping" },
            { phrase: "\"a quiet friend to travellers\"", trait: "Given the human role of a friend" },
            { phrase: "\"ask the fishing families who still know I care\"", trait: "Given human care and feeling" },
        ];
    const tokens = shuffle(rng, pairs.map((p, i) => ({ id: `p${i}`, label: p.phrase })));
    const targets = shuffle(rng, pairs.map((p, i) => ({ id: `p${i}`, label: p.trait })));
    const correctMap: Record<string, string> = {};
    pairs.forEach((_, i) => (correctMap[`p${i}`] = `p${i}`));
    return {
      kind: "click-match",
      prompt: `Match each line from "${poem.title}" to the human quality it gives the inanimate character.`,
      passage: poem.text,
      tokens,
      targets,
      correctMap,
      hint,
      explanation: pairs.map((p) => `${p.phrase} — ${p.trait.toLowerCase()}.`).join(" "),
    };
  },
};
