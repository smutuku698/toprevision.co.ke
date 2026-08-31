import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PARTS: { part: string; description: string }[] = [
  { part: "Sender's address", description: "Where the letter writer can be reached" },
  { part: "Date", description: "When the letter was written" },
  { part: "Salutation", description: "The greeting to the person being apologised to, e.g. 'Dear Kevin,'" },
  { part: "Opening", description: "Acknowledges what went wrong straight away" },
  { part: "Explanation", description: "Briefly explains what happened, without making excuses" },
  { part: "Apology statement", description: "Clearly says sorry and offers to make amends" },
  { part: "Closing", description: "A complimentary close and signature, e.g. 'Your friend, Amina'" },
];

const SCENARIOS: { context: string; best: string; distractors: string[] }[] = [
  {
    context: "You forgot your best friend's birthday party.",
    best: "I'm so sorry I missed your birthday party — I know how much you were looking forward to celebrating with everyone.",
    distractors: ["It's not really my fault I forgot your party.", "Parties aren't that important anyway.", "I heard the party happened, cool."],
  },
  {
    context: "You accidentally broke your friend's borrowed bicycle.",
    best: "I want to apologise for damaging your bicycle while I was borrowing it — I should have been more careful.",
    distractors: ["The bicycle was already a bit old, so it's not a big deal.", "Bicycles break sometimes, that's normal.", "I'm sure you have another bicycle anyway."],
  },
  {
    context: "You spread a rumour about a classmate that turned out to be false.",
    best: "I'm truly sorry for spreading that rumour about you — it was wrong of me and I should not have done it.",
    distractors: ["Everyone was talking about it, not just me.", "It was just a joke, you shouldn't be upset.", "I only repeated what I heard, so it's not really my fault."],
  },
];

export const apologyLetters: Skill = {
  id: "g8-eng-w-apology-letters",
  code: "W.5",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Functional Writing: Apology Letters",
  description: "Identify the parts of a letter of apology and recognise well-worded apologies for a given peer situation.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "match", "categorize", "mc"] as const);
    const hint = "A letter of apology gives the address and date, greets the reader, admits the mistake, briefly explains, says sorry sincerely, and closes warmly.";

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the parts of a letter of apology in the correct order.",
        instruction: "Click the parts in the order they should appear, from top to bottom.",
        items: shuffle(rng, PARTS.map((p) => ({ id: p.part, label: p.part }))),
        correctOrder: PARTS.map((p) => p.part),
        hint,
        explanation: `The correct order is: ${PARTS.map((p) => p.part).join(" → ")}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, PARTS.map((p) => ({ id: p.part, label: p.part })));
      const targets = shuffle(rng, PARTS.map((p) => ({ id: p.part, label: p.description })));
      const correctMap: Record<string, string> = {};
      for (const p of PARTS) correctMap[p.part] = p.part;
      return {
        kind: "click-match",
        prompt: "Match each part of a letter of apology to what it contains.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: PARTS.map((p) => `${p.part} — ${p.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIOS).slice(0, 3);
      const items = shuffle(
        rng,
        chosen.flatMap((s, i) => [
          { id: `good${i}`, label: s.best, bucket: "good" },
          { id: `poor${i}`, label: randChoice(rng, s.distractors), bucket: "poor" },
        ])
      );
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each phrase into Good apology phrasing or Poor apology phrasing.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "good", label: "Good apology phrasing" },
          { id: "poor", label: "Poor apology phrasing" },
        ],
        correctBucket,
        hint: "A good apology clearly admits the mistake and takes responsibility. Poor phrasing makes excuses, blames others, or downplays the harm caused.",
        explanation: items.map((it) => `"${it.label}" is ${it.bucket === "good" ? "a good, sincere apology" : "poor phrasing — it makes excuses or shifts blame"}.`).join(" "),
      };
    }

    const entry = randChoice(rng, SCENARIOS);
    const choices = shuffle(rng, [entry.best, randChoice(rng, entry.distractors)]);
    return {
      kind: "multiple-choice",
      prompt: `Situation: ${entry.context} Which opening line is the best-worded apology?`,
      choices,
      correctIndex: choices.indexOf(entry.best),
      layout: "list",
      hint: "The best apology takes responsibility clearly and sincerely, without excuses or blame.",
      explanation: `"${entry.best}" is the best-worded apology — it clearly admits the mistake and takes responsibility.`,
    };
  },
};
