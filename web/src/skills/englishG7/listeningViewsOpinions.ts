import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TRICKSTER_PASSAGE =
  "Long ago, Hare and Hyena lived near the same river. One evening, Hare wore a beautiful necklace of red and white beads, given to him by his grandmother, and a soft leather cloak dyed with ochre. Hyena stared and said, \"That cloak looks ridiculous, Hare! Beads are only for weddings, not for an ordinary evening walk.\" Hare replied calmly, \"In my view, our traditional beads and ochre cloaks tell the story of who we are, and I feel proud to wear them any day.\" Hyena, jealous, sneaked to Hare's hut that night and stole the cloak. In the morning, Hare noticed it missing and, together with the village elders, followed muddy footprints straight to Hyena's den. The elders decided Hyena must return the cloak and apologise. From that day, Hyena never dared mock traditional dress again, for he had learned that stolen pride never fits well.";

const OPINION_STARTERS: { phrase: string; function: string }[] = [
  { phrase: "I believe...", function: "A common way to state a personal conviction confidently" },
  { phrase: "In my view...", function: "A slightly formal way to introduce a personal opinion, often used in discussions or debates" },
  { phrase: "I feel that...", function: "Expresses an opinion based on emotion or instinct rather than proven facts" },
  { phrase: "Personally, I think...", function: "Emphasises that the view is your own, which others may not share" },
  { phrase: "It seems to me that...", function: "A cautious way to offer an opinion without sounding too certain" },
  { phrase: "As far as I'm concerned...", function: "A strong, personal way to state where you stand on an issue" },
];

const FACT_OPINION_ITEMS: { text: string; type: "fact" | "opinion" }[] = [
  { text: "Hare wore a necklace of red and white beads.", type: "fact" },
  { text: "Beads are only for weddings, not for an ordinary evening walk.", type: "opinion" },
  { text: "Hyena stole the cloak that night.", type: "fact" },
  { text: "Traditional beads and ochre cloaks tell the story of who we are.", type: "opinion" },
  { text: "The elders followed muddy footprints to Hyena's den.", type: "fact" },
  { text: "Stolen pride never fits well.", type: "opinion" },
  { text: "Many Kenyan communities use beadwork to mark important life stages, such as marriage.", type: "fact" },
  { text: "Traditional fashion looks better than modern clothing.", type: "opinion" },
];

const VIEWPOINT_ITEMS: { quote: string; speaker: string; distractors: string[] }[] = [
  {
    quote: "That cloak looks ridiculous, Hare! Beads are only for weddings, not for an ordinary evening walk.",
    speaker: "Hyena",
    distractors: ["Hare", "the village elders", "the narrator"],
  },
  {
    quote: "In my view, our traditional beads and ochre cloaks tell the story of who we are, and I feel proud to wear them any day.",
    speaker: "Hare",
    distractors: ["Hyena", "the village elders", "the narrator"],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "", after: ", the leso is one of the most respectful garments a woman can wear to a wedding.", correctAnswer: "In my view", acceptedAnswers: ["I believe", "Personally, I think", "I feel that"] },
  { before: "", after: " every teenager should learn how to wear the kitenge with pride.", correctAnswer: "I feel that", acceptedAnswers: ["I believe", "In my view", "Personally, I think"] },
  { before: "Hare said calmly, \"", after: " our traditional beads and ochre cloaks tell the story of who we are.\"", correctAnswer: "In my view", acceptedAnswers: ["I believe", "I feel that", "Personally, I think"] },
  { before: "", after: ", modern fashion is slowly replacing our traditional attire in towns.", correctAnswer: "It seems to me that", acceptedAnswers: ["I believe", "I feel that"] },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is it important to express one's own views and opinions in a conversation or discussion?",
    correct: "It allows a person to contribute their own perspective and be understood, an important lifelong communication skill",
    distractors: ["It is only useful for people who disagree with everyone else", "Opinions are less important than facts, so they should rarely be shared", "It makes a discussion longer without adding any value"],
  },
  {
    q: "What is the main difference between a fact and an opinion in a spoken or written text?",
    correct: "A fact can be checked and proven true, while an opinion expresses a personal belief, feeling, or judgement",
    distractors: ["A fact is always longer than an opinion", "An opinion is always false", "There is no real difference between a fact and an opinion"],
  },
  {
    q: "Why might two people describe the same traditional garment very differently, as Hare and Hyena did in the story?",
    correct: "Because each speaker is sharing a personal opinion, shaped by their own attitude, rather than stating a proven fact",
    distractors: ["Because one of them must be lying about what they saw", "Because traditional garments change their appearance depending on who looks at them", "Because opinions cannot be different between two people"],
  },
];

export const listeningViewsOpinions: Skill = {
  id: "g7-eng-ls-listening-views-opinions",
  code: "LS.12",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Listening: Expressing Views and Opinions",
  description: "List and use expressions for stating views and opinions, distinguish fact from opinion in a text, and appreciate expressing one's opinion as a lifelong communication skill.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "fill", "viewpoint", "concept"] as const);
    const hint = "An opinion expresses what someone believes or feels, often introduced by phrases like \"I believe\" or \"In my view\" — a fact can be checked and proven true.";

    if (branch === "categorize") {
      const chosen = shuffle(rng, FACT_OPINION_ITEMS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.type));
      return {
        kind: "categorize",
        prompt: "Sort each statement about traditional fashion into Fact or Opinion.",
        passage: TRICKSTER_PASSAGE,
        items,
        buckets: [
          { id: "fact", label: "Fact" },
          { id: "opinion", label: "Opinion" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((f) => `"${f.text}" is a${f.type === "opinion" ? "n" : ""} ${f.type}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, OPINION_STARTERS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((o) => ({ id: o.phrase, label: o.phrase })));
      const targets = shuffle(rng, chosen.map((o) => ({ id: o.phrase, label: o.function })));
      const correctMap: Record<string, string> = {};
      for (const o of chosen) correctMap[o.phrase] = o.phrase;
      return {
        kind: "click-match",
        prompt: "Match each opinion-expressing phrase to what it signals to the listener.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((o) => `"${o.phrase}" — ${o.function.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in a phrase that shows this is the speaker's own opinion.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `A phrase such as "${entry.correctAnswer}" signals that what follows is a personal opinion, not a proven fact.`,
      };
    }

    if (branch === "viewpoint") {
      const entry = randChoice(rng, VIEWPOINT_ITEMS);
      const choices = shuffle(rng, [entry.speaker, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `In the passage, whose opinion is expressed in the line: "${entry.quote}"?`,
        passage: TRICKSTER_PASSAGE,
        choices,
        correctIndex: choices.indexOf(entry.speaker),
        layout: "list",
        hint: "Check who is speaking in the passage right before this quoted line.",
        explanation: `This line expresses ${entry.speaker}'s opinion, since it is ${entry.speaker} who says it in the passage.`,
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
