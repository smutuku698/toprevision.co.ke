import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SCHOOL_VOCAB, name, place } from "./shared";

// Sub-strand 1.3 Attentive Listening: Simple Instructions — Theme: My Surrounding.
// Content: vocabulary on facilities in school, simple instructions, words with nunation (tanween),
// and a "simon says"-style language game giving/responding to instructions.

const TANWEEN_QUESTIONS: { sign: string; question: string; correct: string; distractors: string[]; explanation: string }[] = [
  { sign: "fathatan", question: "Which tanween (nunation) sign adds an '-an' sound at the end of a word?", correct: "fathatan", distractors: ["kasratan", "dammatan"], explanation: "fathatan is a doubled fatha, adding an '-an' ending sound." },
  { sign: "fathatan", question: "A doubled fatha at the end of a word is called?", correct: "fathatan", distractors: ["kasratan", "dammatan"], explanation: "That doubled sign is 'fathatan' (an '-an' sound)." },
  { sign: "kasratan", question: "Which tanween (nunation) sign adds an '-in' sound at the end of a word?", correct: "kasratan", distractors: ["fathatan", "dammatan"], explanation: "kasratan is a doubled kasra, adding an '-in' ending sound." },
  { sign: "kasratan", question: "A doubled kasra at the end of a word is called?", correct: "kasratan", distractors: ["fathatan", "dammatan"], explanation: "That doubled sign is 'kasratan' (an '-in' sound)." },
  { sign: "dammatan", question: "Which tanween (nunation) sign adds an '-un' sound at the end of a word?", correct: "dammatan", distractors: ["fathatan", "kasratan"], explanation: "dammatan is a doubled damma, adding an '-un' ending sound." },
  { sign: "dammatan", question: "A doubled damma at the end of a word is called?", correct: "dammatan", distractors: ["fathatan", "kasratan"], explanation: "That doubled sign is 'dammatan' (an '-un' sound)." },
  { sign: "fathatan", question: "Tanween signs are 'doubled' versions of which three basic signs?", correct: "fatha, kasra, and damma", distractors: ["only fatha", "sukun and fatha", "only damma"], explanation: "The three tanween forms are the doubled versions of fatha, kasra, and damma." },
  { sign: "kasratan", question: "Which nunation sign is used with words ending in an '-in' sound, like an indefinite noun?", correct: "kasratan", distractors: ["fathatan", "dammatan"], explanation: "kasratan gives the '-in' ending sound." },
  { sign: "dammatan", question: "Which nunation sign is used with words ending in an '-un' sound?", correct: "dammatan", distractors: ["fathatan", "kasratan"], explanation: "dammatan gives the '-un' ending sound." },
  { sign: "fathatan", question: "Which nunation sign is used with words ending in an '-an' sound?", correct: "fathatan", distractors: ["kasratan", "dammatan"], explanation: "fathatan gives the '-an' ending sound." },
];

const INSTRUCTION_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `The teacher in ${p} says "ijlis" to ${n}. What should ${n} do?`,
    correct: "sit down",
    distractors: ["stand up", "open the door", "listen quietly"],
    explanation: `"ijlis" is an instruction meaning "sit down".`,
  }),
  (n, p) => ({
    prompt: `The teacher in ${p} says "qif" to ${n}. What should ${n} do?`,
    correct: "stand up",
    distractors: ["sit down", "close the door", "write"],
    explanation: `"qif" is an instruction meaning "stand up".`,
  }),
  (n, p) => ({
    prompt: `${n} hears "iftah al-baab" during a "simon says" game in ${p}. What is ${n} told to do?`,
    correct: "open the door",
    distractors: ["close the door", "sit down", "read aloud"],
    explanation: `"iftah al-baab" means "open the door".`,
  }),
  (n, p) => ({
    prompt: `${n} hears "ighliq al-baab" in ${p}. What is ${n} told to do?`,
    correct: "close the door",
    distractors: ["open the door", "stand up", "listen"],
    explanation: `"ighliq al-baab" means "close the door".`,
  }),
  (n, p) => ({
    prompt: `The teacher tells ${n} "istami'" during a lesson in ${p}. What should ${n} do?`,
    correct: "listen",
    distractors: ["write", "read aloud", "stand up"],
    explanation: `"istami'" means "listen".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} is told "unzur ila al-sabbura." What should ${n} do?`,
    correct: "look at the blackboard",
    distractors: ["go to the office", "sit down", "close the door"],
    explanation: `"unzur ila al-sabbura" means "look at the blackboard".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} is told "iktub." What should ${n} do?`,
    correct: "write",
    distractors: ["read aloud", "listen", "stand up"],
    explanation: `"iktub" means "write".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} is told "iqra'." What should ${n} do?`,
    correct: "read",
    distractors: ["write", "sit down", "open the door"],
    explanation: `"iqra'" means "read".`,
  }),
  (n, p) => ({
    prompt: `During the "simon says" game in ${p}, ${n} is told "ta'ala huna." What should ${n} do?`,
    correct: "come here",
    distractors: ["go there", "sit down", "stand still"],
    explanation: `"ta'ala huna" means "come here".`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} is told "idhhab ila al-maktaba." Where should ${n} go?`,
    correct: "the library",
    distractors: ["the office", "the playground", "the dining hall"],
    explanation: `"idhhab ila al-maktaba" means "go to the library".`,
  }),
];

const CATEGORY_LOCATION: { word: string; where: "Indoor" | "Outdoor" }[] = [
  { word: "fasl", where: "Indoor" },
  { word: "maktab", where: "Indoor" },
  { word: "maktaba", where: "Indoor" },
  { word: "mat'am", where: "Indoor" },
  { word: "hammam", where: "Indoor" },
  { word: "mamarr", where: "Indoor" },
  { word: "ghurfat al-mu'allimeen", where: "Indoor" },
  { word: "mal'ab", where: "Outdoor" },
  { word: "hadiqa", where: "Outdoor" },
  { word: "bawwaba", where: "Outdoor" },
];

const ROUTINE_SEQUENCES: { steps: string[] }[] = [
  { steps: ["iftah al-baab (open the door)", "idhhab ila al-fasl (go to the classroom)", "ijlis (sit down)", "istami' (listen)"] },
  { steps: ["ta'ala huna (come here)", "unzur ila al-sabbura (look at the blackboard)", "iktub (write)", "iqra' (read)"] },
  { steps: ["qif (stand up)", "idhhab ila al-maktaba (go to the library)", "ikhtar kitaban (choose a book)", "ijlis wa iqra' (sit and read)"] },
  { steps: ["istami' (listen)", "iftah al-baab (open the door)", "idhhab ila al-mal'ab (go to the playground)", "il'ab (play)"] },
  { steps: ["ijlis (sit down)", "istami' (listen)", "iktub (write)", "ighliq al-kitab (close the book)"] },
];

export const surroundingSpeaking: Skill = {
  id: "g6-ar-ls-surrounding",
  code: "LS.3",
  subjectId: "arabic",
  strandId: "g6-ar-listening-speaking",
  grade: 6,
  title: "Attentive listening: simple instructions (my surrounding)",
  description: "Practise recognising tanween (nunation) signs, respond to simple Arabic instructions about school facilities, and sort school locations.",
  generate(rng) {
    const branch = randChoice(rng, ["tanween", "instruction", "match", "categorize", "ordering"] as const);

    if (branch === "tanween") {
      const q = randChoice(rng, TANWEEN_QUESTIONS);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.question,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "row",
        hint: "fathatan = '-an', kasratan = '-in', dammatan = '-un' — each is a doubled version of a basic sign.",
        explanation: q.explanation,
      };
    }

    if (branch === "instruction") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, INSTRUCTION_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Think about what action each Arabic instruction word describes.",
        explanation: q.explanation,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SCHOOL_VOCAB).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.word })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.word, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.word] = p.word;
      return {
        kind: "click-match",
        prompt: randChoice(rng, [
          "Match each school-facility word to its meaning.",
          "Match the spoken word to the school facility it names.",
          "Which meaning goes with which facility word?",
          "Pair each school word with its correct meaning.",
          "Match each word you hear to its school-facility meaning.",
        ]),
        tokens,
        targets,
        correctMap,
        hint: "Say each word aloud to yourself before matching it.",
        explanation: chosen.map((p) => `"${p.word}" means "${p.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen2 = shuffle(rng, CATEGORY_LOCATION).slice(0, 7);
      const items = chosen2.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen2.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.where));
      return {
        kind: "categorize",
        prompt: randChoice(rng, [
          "Sort each school facility: Indoor, or Outdoor?",
          "Group these school facilities by indoor vs outdoor.",
          "Which location type does each facility belong to?",
          "Sort each facility word into the correct category.",
          "Classify each school facility below.",
        ]),
        items: shuffle(rng, items),
        buckets: [
          { id: "Indoor", label: "Indoor facility" },
          { id: "Outdoor", label: "Outdoor facility" },
        ],
        correctBucket,
        hint: "Classrooms, offices, and the library are indoor; playgrounds and gardens are outdoor.",
        explanation: chosen2.map((c) => `"${c.word}" is ${c.where === "Indoor" ? "an indoor" : "an outdoor"} facility.`).join(" "),
      };
    }

    const set = randChoice(rng, ROUTINE_SEQUENCES);
    const items = shuffle(rng, set.steps.map((s, i) => ({ id: `${i}-${s}`, label: s })));
    return {
      kind: "ordering",
      prompt: randChoice(rng, [
        "Put these classroom instructions in the order you would follow them.",
        "Arrange this instruction routine in the correct order.",
        "Sequence these instructions as they would naturally happen.",
        "Order these instructions correctly.",
        "Which order makes sense for this instruction routine?",
      ]),
      instruction: "Click the instructions in the order you would follow them.",
      items,
      correctOrder: set.steps.map((s, i) => `${i}-${s}`),
      hint: "Think about a normal classroom routine, step by step.",
      explanation: `A natural order is:\n${set.steps.join("\n")}`,
    };
  },
};
