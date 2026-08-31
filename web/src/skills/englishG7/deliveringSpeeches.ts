import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type SpeechPart = "opening" | "body" | "closing";

const SPEECH_SENTENCES: { text: string; part: SpeechPart }[] = [
  { text: "Good afternoon, honoured guests, teachers, and fellow pupils. I stand before you today to open our school's annual music festival.", part: "opening" },
  { text: "This festival brings together singers, drummers, and instrumentalists from every class to celebrate the music of our communities.", part: "opening" },
  { text: "Our choir has spent the past three months rehearsing traditional songs from across Kenya, from benga rhythms to coastal taarab melodies.", part: "body" },
  { text: "Each performance you will see today represents hours of dedication, from the youngest first-grade dancers to our senior brass band.", part: "body" },
  { text: "Music teaches us patience, teamwork, and pride in our heritage, values that reach far beyond this stage.", part: "body" },
  { text: "In closing, I thank every performer, teacher, and parent who made today possible, and I now declare this music festival officially open.", part: "closing" },
  { text: "Let us give a warm round of applause to welcome our first performers to the stage.", part: "closing" },
];

const FORMAL_TECHNIQUES: { name: string; effect: string }[] = [
  { name: "Formal greeting", effect: "Respectfully addresses everyone present, from the most senior guest to the audience" },
  { name: "Clear purpose statement", effect: "Tells the audience immediately why the speaker is standing up to speak" },
  { name: "Rhetorical question", effect: "Makes the audience pause and think, without expecting a spoken answer" },
  { name: "Repetition for emphasis", effect: "Repeats a key word or phrase so the audience remembers the speaker's main point" },
  { name: "Formal register", effect: "Uses polite, standard vocabulary and full sentences instead of slang or shortened forms" },
  { name: "Vote of thanks", effect: "Formally thanks the people who made an event possible near the end of a speech" },
];

const REGISTER_PAIRS: { text: string; register: "formal" | "informal" }[] = [
  { text: "Good afternoon, honoured guests and fellow pupils.", register: "formal" },
  { text: "Hey everyone, thanks for coming, I guess.", register: "informal" },
  { text: "I would like to extend my sincere gratitude to our music teacher.", register: "formal" },
  { text: "Big shout out to our music teacher, she's the best.", register: "informal" },
  { text: "It is my honour to declare this music festival officially open.", register: "formal" },
  { text: "Okay, so, let's just get this festival started already.", register: "informal" },
  { text: "On behalf of the school, I sincerely thank every performer for their dedication.", register: "formal" },
  { text: "Yeah, thanks a bunch to everyone who showed up and did stuff.", register: "informal" },
];

const ORDER_STEPS = [
  { id: "audience", label: "Identify the occasion, the audience, and the purpose of the speech" },
  { id: "outline", label: "Outline the speech into an opening, a body, and a closing" },
  { id: "draft", label: "Draft the speech using formal, respectful language suited to the occasion" },
  { id: "rehearse", label: "Rehearse the speech aloud, checking its length and formal tone" },
  { id: "deliver", label: "Deliver the speech clearly and confidently to the audience" },
];

const FIX_ITEMS: { desc: string; fix: string; distractors: string[] }[] = [
  {
    desc: "Kevin began his speech opening the music festival by saying, 'Hey guys, thanks for coming, I guess,' to a hall full of guests and teachers.",
    fix: "Formal register",
    distractors: ["Rhetorical question", "Repetition for emphasis", "Vote of thanks"],
  },
  {
    desc: "Amina's speech ended abruptly after the last performance, without ever thanking the teachers and parents who organised the festival.",
    fix: "Vote of thanks",
    distractors: ["Formal greeting", "Clear purpose statement", "Rhetorical question"],
  },
  {
    desc: "Otieno stood up to speak but never explained why he was addressing the audience, leaving guests confused about the speech's purpose.",
    fix: "Clear purpose statement",
    distractors: ["Repetition for emphasis", "Formal register", "Vote of thanks"],
  },
  {
    desc: "Faith wanted her audience to truly remember the word 'unity' as the festival's main message, but she used it only once in her whole speech.",
    fix: "Repetition for emphasis",
    distractors: ["Formal greeting", "Vote of thanks", "Clear purpose statement"],
  },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why does a formal speech, such as one opening a school music festival, usually follow an opening-body-closing structure?",
    correct: "It helps the audience follow the speech logically, from its purpose, to its main content, to a respectful closing",
    distractors: [
      "It has no real benefit and is only followed by tradition",
      "It only matters for written speeches, never spoken ones",
      "It makes the speech longer, which always impresses an audience",
    ],
  },
  {
    q: "How does delivering a speech formally differ from performing an oral narrative for entertainment?",
    correct: "A formal speech uses respectful, standard language suited to an occasion, rather than dramatic voices and gestures for a story",
    distractors: [
      "There is no real difference between the two at all",
      "A formal speech should always use slang to sound friendly",
      "A formal speech never needs to consider its audience",
    ],
  },
  {
    q: "Why might a speaker use a rhetorical question, such as 'Isn't music the language that unites us all?', in a formal speech?",
    correct: "To make the audience pause and reflect on the idea, without expecting them to answer aloud",
    distractors: [
      "Because the speaker genuinely does not know the answer",
      "Rhetorical questions are only used in casual conversation, never speeches",
      "To confuse the audience about what the speech is really about",
    ],
  },
];

export const deliveringSpeeches: Skill = {
  id: "g7-eng-ls-delivering-speeches",
  code: "LS.10",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Public Speaking: Delivering Formal Speeches",
  description: "Identify the structure and formal register of speeches for occasions such as a school music festival, and prepare and deliver a short formal speech confidently.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize-parts", "categorize-register", "match", "order", "scenario", "concept"] as const);
    const hint = "A formal speech greets the audience respectfully, states its purpose clearly, develops its main points, and closes with thanks — all in polite, standard language.";

    if (branch === "categorize-parts") {
      const chosen = shuffle(rng, SPEECH_SENTENCES).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.part));
      return {
        kind: "categorize",
        prompt: "This is part of a sample speech opening a school music festival. Sort each sentence into Opening, Body, or Closing.",
        items,
        buckets: [
          { id: "opening", label: "Opening" },
          { id: "body", label: "Body" },
          { id: "closing", label: "Closing" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((s) => `"${s.text}" belongs in the ${s.part}.`).join(" "),
      };
    }

    if (branch === "categorize-register") {
      const formalItems = shuffle(rng, REGISTER_PAIRS.filter((r) => r.register === "formal")).slice(0, 3);
      const informalItems = shuffle(rng, REGISTER_PAIRS.filter((r) => r.register === "informal")).slice(0, 3);
      const chosen = shuffle(rng, [...formalItems, ...informalItems]);
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: r.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.register));
      return {
        kind: "categorize",
        prompt: "Sort each opening line by whether it uses a Formal or an Informal register.",
        items,
        buckets: [
          { id: "formal", label: "Formal register" },
          { id: "informal", label: "Informal register" },
        ],
        correctBucket,
        hint: "A formal speech avoids slang and shortened phrases, and instead uses polite, complete, respectful language.",
        explanation: chosen.map((r) => `"${r.text}" is written in a ${r.register} register.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, FORMAL_TECHNIQUES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.effect })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: "Match each formal speech technique to the effect it creates for the audience.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((t) => `${t.name} — ${t.effect.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of preparing and delivering a formal speech, such as one opening a music festival, in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Preparation begins with knowing your audience and purpose, moves through outlining and drafting, then rehearsal and delivery.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, FIX_ITEMS);
      const choices = shuffle(rng, [entry.fix, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${entry.desc} Which technique is missing from this speech?`,
        choices,
        correctIndex: choices.indexOf(entry.fix),
        layout: "list",
        hint: "Decide whether the missing quality is about the speech's structure, its register, or its emphasis.",
        explanation: `${entry.fix} is missing here, since the description shows that quality was absent from the speech.`,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
