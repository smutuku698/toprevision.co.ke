import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PASSAGES: {
  passage: string;
  main: { q: string; correct: string; distractors: string[] };
  detail: { q: string; correct: string; distractors: string[] };
  vocab: { q: string; correct: string; distractors: string[] };
}[] = [
  {
    passage:
      "Every evening, thick black smoke rises from the factory near Mto Moja estate. The smoke drifts over the rooftops and settles on washing lines, leaving a grey film on clothes. Many residents have started covering their noses with cloth whenever the wind blows from that direction.",
    main: {
      q: "What is the main idea of this passage?",
      correct: "Smoke from a nearby factory is polluting the air in Mto Moja estate",
      distractors: ["Residents of Mto Moja enjoy collecting soot", "The factory near Mto Moja has stopped working", "People in Mto Moja like wearing cloth over their faces"],
    },
    detail: {
      q: "According to the passage, what do residents do when the wind blows from the factory's direction?",
      correct: "They cover their noses with cloth",
      distractors: ["They shut down the factory", "They wash their clothes more often than usual", "They move out of the estate"],
    },
    vocab: {
      q: "In the passage, what does the word \"drifts\" most likely mean?",
      correct: "moves slowly through the air",
      distractors: ["falls straight down heavily", "disappears instantly", "turns a bright colour"],
    },
  },
  {
    passage:
      "The women who fetch water from the Kadogo River say it has changed. Where the water was once clear, it is now cloudy and smells of chemicals. Fishermen report catching fewer fish each week, and some say the fish they catch look unhealthy. A nearby tannery began discharging waste into the river six months ago.",
    main: {
      q: "What is the main idea of this passage?",
      correct: "The Kadogo River has become polluted, likely because of waste from a nearby tannery",
      distractors: ["The Kadogo River has completely dried up", "Fishermen have stopped fishing in the river altogether", "The tannery near the river closed down six months ago"],
    },
    detail: {
      q: "According to the passage, when did the tannery begin discharging waste into the river?",
      correct: "Six months ago",
      distractors: ["One week ago", "Six years ago", "It has always discharged waste there"],
    },
    vocab: {
      q: "In the passage, what does the word \"discharging\" mean?",
      correct: "releasing or letting out",
      distractors: ["storing safely", "purifying completely", "measuring carefully"],
    },
  },
  {
    passage:
      "Along the beach, plastic bottles and bags pile up after every high tide. Turtles sometimes mistake floating plastic bags for jellyfish and swallow them, which can make the animals sick or even kill them. Conservation groups now organise monthly clean-up days to clear the litter before it washes further out to sea.",
    main: {
      q: "What is the main idea of this passage?",
      correct: "Plastic waste on the beach is harming marine animals like turtles",
      distractors: ["Turtles enjoy eating plastic bags", "The beach has never had a litter problem", "Conservation groups have stopped their clean-up efforts"],
    },
    detail: {
      q: "According to the passage, what do conservation groups do to address the litter?",
      correct: "They organise monthly clean-up days",
      distractors: ["They ban all tourists from the beach", "They release more turtles into the sea", "They build a wall around the beach"],
    },
    vocab: {
      q: "In the passage, what does the word \"litter\" mean?",
      correct: "scattered rubbish or waste",
      distractors: ["baby turtles", "clean sand", "fishing boats"],
    },
  },
];

const CAUSE_EFFECT_PAIRS: { cause: string; effect: string }[] = [
  { cause: "Factories release smoke into the air", effect: "People develop breathing problems" },
  { cause: "Plastic bags are dumped into rivers", effect: "Fish and other aquatic animals die" },
  { cause: "Farmers overuse chemical fertilisers", effect: "Nearby water sources become contaminated" },
  { cause: "Vehicles burn fuel while stuck in traffic", effect: "Air quality in the town worsens" },
  { cause: "A tannery discharges untreated waste into a river", effect: "The river water turns cloudy and smells of chemicals" },
];

const CAUSE_SIGNALS = ["because", "since", "due to", "as", "owing to"];
const EFFECT_SIGNALS = ["as a result", "therefore", "consequently", "so", "which is why"];

const SIGNAL_FILL_ITEMS = [
  { before: "Plastic waste blocks the drains,", after: "flooding occurs during heavy rains.", correctAnswer: "so", acceptedAnswers: ["therefore", "which is why"] },
  { before: "The river turned cloudy", after: "the tannery began dumping waste into it.", correctAnswer: "because", acceptedAnswers: ["since", "as"] },
  { before: "Fishermen are catching fewer fish", after: "of the pollution in the river.", correctAnswer: "because", acceptedAnswers: [] },
  { before: "The factory has been releasing smoke for months;", after: ", many residents now cover their faces outdoors.", correctAnswer: "as a result", acceptedAnswers: ["consequently", "therefore"] },
];

export const listeningComprehensionCauseEffect: Skill = {
  id: "g8-eng-ls-listening-comprehension-cause-effect",
  code: "LS.3",
  subjectId: "english",
  strandId: "g8-eng-listening-speaking",
  grade: 8,
  title: "Listening Comprehension: Cause and Effect",
  description: "Find the main idea, pick out specific details, and infer word meanings in cause-and-effect texts about pollution.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "mc", "match", "categorize", "fill"] as const);
    const hint = "Listen for what happened (the effect) and why it happened (the cause), and use the surrounding sentence to work out unfamiliar words.";

    if (branch === "mc") {
      const p = randChoice(rng, PASSAGES);
      const qType = randChoice(rng, ["main", "detail", "vocab"] as const);
      const set = p[qType];
      const choices = shuffle(rng, [set.correct, ...set.distractors]);
      return {
        kind: "multiple-choice",
        prompt: set.q,
        passage: p.passage,
        choices,
        correctIndex: choices.indexOf(set.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${set.correct}".`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, CAUSE_EFFECT_PAIRS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.cause, label: c.cause })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.cause, label: c.effect })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.cause] = c.cause;
      return {
        kind: "click-match",
        prompt: "Match each cause about pollution to its effect.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((c) => `"${c.cause}" causes "${c.effect.toLowerCase()}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const causes = shuffle(rng, CAUSE_SIGNALS).slice(0, 3);
      const effects = shuffle(rng, EFFECT_SIGNALS).slice(0, 3);
      const items = shuffle(rng, [
        ...causes.map((label) => ({ id: label, label, bucket: "cause" })),
        ...effects.map((label) => ({ id: label, label, bucket: "effect" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort each word or phrase by whether it signals a cause or an effect.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "cause", label: "Signals a cause" },
          { id: "effect", label: "Signals an effect" },
        ],
        correctBucket,
        hint: "Cause signals introduce the reason something happened; effect signals introduce the result.",
        explanation: `Cause signals: ${causes.join(" / ")}. Effect signals: ${effects.join(" / ")}.`,
      };
    }

    const entry = randChoice(rng, SIGNAL_FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing cause-and-effect signal word or phrase.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers.length ? entry.acceptedAnswers : undefined,
      inputMode: "text",
      hint,
      explanation: `The completed sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
    };
  },
};
