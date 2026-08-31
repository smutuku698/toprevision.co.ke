import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_ERA_PROMPTS = [
  "Match each period in history to how the Qur'an was preserved at that time.",
  "Pair each historical period with how the Qur'an was preserved then.",
  "Connect each period below to how the Qur'an was preserved in it.",
  "Match each era to the method of preservation used in it.",
  "Link each period to how the Qur'an was preserved during it.",
  "Choose the correct method of preservation for each historical period.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each method of preserving the Qur'an as used since the Prophet's time, or as a modern method.",
  "Group each method of preservation as used since the Prophet's time, or as a modern method.",
  "Decide whether each method has been used since the Prophet's time or is a modern method, and sort it there.",
  "Sort each method into the correct category: since the Prophet's time, or modern.",
  "Place each method into the right bucket — since the Prophet's time, or modern.",
  "Categorise each method of preservation as used since the Prophet's time, or modern.",
];

const ORDER_PROMPTS = [
  "Arrange the history of the Qur'an's preservation in the correct order, from earliest to most recent.",
  "Put the history of the Qur'an's preservation into the correct order, earliest to most recent.",
  "Sequence the history of the Qur'an's preservation correctly.",
  "Order these stages of the Qur'an's preservation from earliest to most recent.",
  "Sort these stages of the Qur'an's preservation into their correct order.",
  "Arrange these moments in the Qur'an's preservation history in order.",
];

const FILL_PROMPTS = [
  "Fill in the missing term.",
  "Which term completes this sentence?",
  "Complete the sentence with the correct term.",
  "Work out the missing term below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which term belongs in the blank?",
];

const ERA_METHODS: { era: string; method: string }[] = [
  { era: "During the time of the Prophet (S.A.W.)", method: "Companions memorised the Qur'an (Hifz) and wrote verses on available materials such as palm leaves, animal bones, and flat stones" },
  { era: "During the caliphate of Abubakar (R.A.)", method: "The scattered written verses were gathered and compiled into a single manuscript (mus'haf) for the first time" },
  { era: "During the caliphate of Uthman (R.A.)", method: "One standard written copy of the Qur'an was produced and official copies were sent to major Muslim cities" },
  { era: "In the present day", method: "The Qur'an is preserved through printing, audio recordings, and digital or app-based copies, alongside continued memorisation" },
];

const METHOD_LIST = [
  { id: "hifz", label: "Hifz (memorisation)", bucket: "since-prophet" },
  { id: "oral", label: "Oral transmission from teacher to student", bucket: "since-prophet" },
  { id: "leaves", label: "Writing verses on palm leaves and animal bones", bucket: "since-prophet" },
  { id: "printing", label: "Printing the Qur'an in book form", bucket: "modern" },
  { id: "audio", label: "Audio recordings of recitation", bucket: "modern" },
  { id: "apps", label: "Digital Qur'an apps on phones and computers", bucket: "modern" },
] as const;
const BUCKET_LABEL: Record<string, string> = { "since-prophet": "Used since the Prophet's time", modern: "A modern method of preservation" };

const HISTORY_STEPS = [
  { id: "prophet-era", label: "The Prophet's companions memorise the Qur'an and write it on available materials" },
  { id: "abubakar", label: "Abubakar (R.A.) orders the scattered verses to be compiled into a single written manuscript" },
  { id: "uthman", label: "Uthman (R.A.) standardises one official copy and sends copies to major cities" },
  { id: "present", label: "The Qur'an is preserved today through printing, audio recording, and digital apps" },
];

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to preserve the Qur'an accurately?",
    correct: "To safeguard its authenticity so it remains unchanged as a guide for mankind",
    distractors: ["So that only scholars are allowed to read it", "To make it available in only one country", "So it can be rewritten every century"],
  },
  {
    q: "Which of these is a way Muslims preserve the Qur'an today?",
    correct: "Digital and app-based copies, alongside printing and audio recording",
    distractors: ["Passing it down only as a spoken story with no fixed text", "Translating it and destroying the Arabic original", "Keeping only one physical copy in the world"],
  },
  {
    q: "What role did memorisation (Hifz) play in preserving the Qur'an during the Prophet's time?",
    correct: "It allowed companions to carry the exact wording of the Qur'an in their hearts, alongside what was written down",
    distractors: ["It replaced the need to ever write the Qur'an down", "It was only practised after printing was invented", "It was discouraged because writing was considered more reliable"],
  },
  {
    q: "What is one way a student can personally take part in preserving the Qur'an today?",
    correct: "By reciting and memorising chapters or verses of the Qur'an",
    distractors: ["By changing the wording to make it easier to remember", "By only reading translations and never the Arabic text", "By avoiding recitation until adulthood"],
  },
];

export const modesOfPreservation: Skill = {
  id: "g8-ire-qu-modes-of-preservation",
  code: "QU.1",
  subjectId: "ire",
  strandId: "g8-ire-qu",
  grade: 8,
  title: "Modes of Preservation of the Qur'an",
  description: "How the Qur'an was preserved during the Prophet's time, the Rightly Guided Caliphs, and today.",
  generate(rng) {
    const branch = randChoice(rng, ["match-era", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match-era") {
      const tokens = shuffle(rng, ERA_METHODS.map((e) => ({ id: e.era, label: e.era })));
      const targets = shuffle(rng, ERA_METHODS.map((e) => ({ id: e.era, label: e.method })));
      const correctMap: Record<string, string> = {};
      for (const e of ERA_METHODS) correctMap[e.era] = e.era;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_ERA_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The methods moved from memorisation and writing on available materials, to compiling one manuscript, to standardising it, to today's printed and digital copies.",
        explanation: ERA_METHODS.map((e) => `${e.era} — ${e.method.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, METHOD_LIST).slice(0, 5);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((c) => ({ id: c.id, label: c.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Memorisation and hand-writing go back to the Prophet's time; printing, audio, and apps are recent technology.",
        explanation: chosen.map((c) => `"${c.label}" — ${BUCKET_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HISTORY_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: HISTORY_STEPS.map((s) => s.id),
        hint: "It moved from memorising and writing on available materials, to compiling one manuscript, to standardising it, and finally to today's technology.",
        explanation: HISTORY_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "The practice of memorising the entire Qur'an by heart is known as",
        after: ".",
        correctAnswer: "Hifz",
        acceptedAnswers: ["hifdh", "hifz al-quran"],
        inputMode: "text",
        hint: "This Arabic word literally means 'preservation' or 'safeguarding'.",
        explanation: "Memorising the Qur'an by heart is called Hifz — a practice that has preserved its wording unchanged since the Prophet's time.",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "The Qur'an has been preserved through memorisation, writing, compilation, and — today — printing and digital technology.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
