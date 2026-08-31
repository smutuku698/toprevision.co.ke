import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 1 "Ceremonies and Festivals", sub-strand 1.1.1
// "Attentive Listening" (LS.1): vocabulary building + introduction to adverbs. English-medium
// per the shared.ts scope note (KICD's own design is generic/English-medium here).

/** Combine a small "opener" pool with a small "closer" pool into a larger, still-grammatical
 * prompt pool (e.g. 5 x 4 = 20) — cheaper to author/review than 20 independent sentences, per
 * the project's prompt-stem-pool standard. Every opener here reads naturally with every closer. */
function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface VocabEntry { word: string; meaning: string; group: string }

const VOCAB: VocabEntry[] = [
  { word: "gather", meaning: "to come together as a group in one place", group: "Ceremony actions" },
  { word: "dancers", meaning: "people who perform dance moves, often at a ceremony", group: "People at the ceremony" },
  { word: "elders", meaning: "older, respected members of the community", group: "People at the ceremony" },
  { word: "gifts", meaning: "presents given to someone, especially to mark an occasion", group: "Ceremony objects and clothing" },
  { word: "decoration", meaning: "items used to make a place look attractive for an event", group: "Ceremony objects and clothing" },
  { word: "parade", meaning: "an organised public procession, often celebrating something", group: "Ceremony actions" },
  { word: "celebrate", meaning: "to mark an important occasion with enjoyable activities", group: "Ceremony actions" },
  { word: "anniversary", meaning: "the date on which an event happened in a previous year", group: "Ceremony ideas" },
  { word: "cheer", meaning: "to shout with approval or encouragement", group: "Ceremony actions" },
  { word: "tradition", meaning: "a custom or belief passed down through generations", group: "Ceremony ideas" },
  { word: "attire", meaning: "clothing worn, especially for a special occasion", group: "Ceremony objects and clothing" },
  { word: "instruments", meaning: "tools used to produce music", group: "Ceremony objects and clothing" },
  { word: "soloists", meaning: "performers who perform alone, without a group", group: "People at the ceremony" },
  { word: "style", meaning: "a particular way of doing or presenting something", group: "Ceremony ideas" },
];

interface AdverbEntry { adverb: string; meaning: string }

const ADVERBS: AdverbEntry[] = [
  { adverb: "joyfully", meaning: "in a happy, delighted way" },
  { adverb: "loudly", meaning: "with a strong, high volume of sound" },
  { adverb: "gracefully", meaning: "in a smooth, elegant way" },
  { adverb: "traditionally", meaning: "according to custom, the way it has always been done" },
  { adverb: "enthusiastically", meaning: "with great excitement and eagerness" },
  { adverb: "rhythmically", meaning: "in a steady, patterned beat" },
  { adverb: "proudly", meaning: "with a feeling of pleasure and dignity" },
  { adverb: "colourfully", meaning: "in a bright, vividly decorated way" },
  { adverb: "respectfully", meaning: "in a way that shows honour and regard for others" },
  { adverb: "energetically", meaning: "with great vigour and liveliness" },
  { adverb: "warmly", meaning: "in a friendly, welcoming way" },
  { adverb: "skilfully", meaning: "with great skill and expertise" },
];

const LISTENING_STEPS: { id: string; label: string }[] = [
  { id: "listen", label: "Listen to an audio recording or story about a ceremony and pick out vocabulary items based on the theme" },
  { id: "bank", label: "Work together to build a vocabulary bank of the words picked out from the story" },
  { id: "comprehension", label: "Answer comprehension questions about what happened in the story" },
  { id: "spot-adverbs", label: "Identify the adverbs used in the story and discuss what each one describes" },
  { id: "sentences", label: "Construct new sentences using the vocabulary and adverbs learnt" },
  { id: "share", label: "Share the new sentences aloud with the class or group" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "The elders welcomed the visiting guests", after: ", making them feel at home.", answer: "warmly" },
  { before: "The dancers performed the traditional dance", after: ", without missing a single step.", answer: "gracefully" },
  { before: "The crowd cheered", after: " when the soloist began to sing.", answer: "enthusiastically" },
  { before: "The drummers played their instruments", after: ", keeping perfect time together.", answer: "rhythmically" },
  { before: "The family decorated the compound", after: " for the anniversary celebration.", answer: "colourfully" },
  { before: "The young dancers listened to the elders", after: " during the instructions.", answer: "respectfully" },
  { before: "The children in the parade waved their flags", after: ".", answer: "joyfully" },
  { before: "The soloist sang the opening song", after: ", showing years of practice.", answer: "skilfully" },
  { before: "The whole village gathered", after: " to celebrate the anniversary together.", answer: "proudly" },
  { before: "The dancers moved around the arena", after: ", never tiring during the parade.", answer: "energetically" },
  { before: "Visitors greeted the elders", after: " before the ceremony began.", answer: "warmly" },
  { before: "The attire was chosen", after: ", following the customs of past generations.", answer: "traditionally" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} listens to a story about a ceremony in ${where} and hears the sentence "The elders sang the opening song joyfully." Which word tells us HOW the elders sang?`,
      correct: `"joyfully" — it describes the manner of the singing`,
      wrong: [`"elders" — because it is who did the singing`, `"sang" — because it is the main action word`, `"song" — because it is the thing being sung`],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While building a vocabulary bank for a ceremony story heard in ${where}, ${who} is unsure what the word "gather" means. What is the correct meaning?`,
      correct: "To come together as a group in one place",
      wrong: ["To decorate a place for an event", "To give someone a present", "To shout with approval"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} hears a story describe "soloists" performing at a ceremony. What does "soloists" mean here?`,
      correct: "Performers who perform alone, without a group",
      wrong: ["Older, respected members of the community", "People who watch the ceremony from a distance", "Musicians who only play instruments, never sing"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} must sort the word "attire" into the correct group in a vocabulary chart. Which group does it belong to?`,
      correct: "Ceremony objects and clothing",
      wrong: ["People at the ceremony", "Ceremony actions", "Ceremony ideas"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} hears the sentence "The dancers performed gracefully" in a story told in ${where}. A classmate says "gracefully" is a naming word. Is the classmate correct?`,
      correct: `No — "gracefully" is an adverb; it describes how the dancers performed, not a person, place, or thing`,
      wrong: [`Yes — because it comes after the verb "performed"`, `Yes — because it ends in a vowel sound`, `No — because it describes the dancers themselves, not the performing`],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s class in ${where} is told that "anniversary" and "tradition" both belong to the same vocabulary group. Which group is that?`,
      correct: "Ceremony ideas",
      wrong: ["People at the ceremony", "Ceremony objects and clothing", "Ceremony actions"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `In a listening activity in ${where}, ${who} is asked to build a new sentence using the adverb "respectfully" correctly. Which sentence uses it correctly?`,
      correct: `"The children listened to the elders respectfully during the ceremony."`,
      wrong: [`"The elders were very respectfully at the ceremony."`, `"Respectfully is a kind of dance performed at ceremonies."`, `"The children were respectfully to the parade."`],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} hears a story and must decide whether "parade" describes a person or an action. What is "parade" in this context?`,
      correct: "An action — an organised public procession, often celebrating something",
      wrong: ["A person who leads the ceremony", "An item worn during the ceremony", "A feeling shown by the crowd"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While listening keenly to a ceremony story in ${where}, ${who} notices the word "cheer" used twice. What does "cheer" mean here?`,
      correct: "To shout with approval or encouragement",
      wrong: ["To come together as a group in one place", "To dress in traditional attire", "To play a musical instrument"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} disagrees on whether "energetically" describes HOW the dancers moved or WHO moved. What is the correct explanation?`,
      correct: "It describes how the dancers moved — it is an adverb of manner",
      wrong: ["It names who moved, so it is a naming word", "It describes the dancers' clothing", "It names the place where the dancing happened"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} keeps chatting with a deskmate while a ceremony story plays. What is the likely effect on ${who}'s vocabulary bank?`,
      correct: `${who} will likely miss vocabulary words and adverbs needed to answer comprehension questions`,
      wrong: ["There will be no effect, since stories can always be replayed instantly", `It will help ${who} notice more adverbs than usual`, "It will make the listening activity finish sooner"],
    };
  },
];

export const ceremoniesAttentiveListening: Skill = {
  id: "g6-il-ls-ceremonies",
  code: "LS.1",
  subjectId: "indigenous-language",
  strandId: "g6-il-listening-speaking",
  grade: 6,
  title: "Ceremonies and festivals: attentive listening",
  description: "Build vocabulary from stories about ceremonies and festivals, and identify and use adverbs correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen keenly for exactly what a word or adverb describes before answering — check who did something, what happened, and how it happened.";

    if (branch === "match") {
      const MATCH_OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const MATCH_CLOSERS = [
        "each adverb with the meaning that explains it.",
        "each adverb below with its correct meaning.",
        "each ceremony adverb with the phrase that defines it.",
        "each adverb with what it actually describes.",
      ];
      const chosen = shuffle(rng, ADVERBS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.adverb, label: a.adverb })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.adverb, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.adverb] = a.adverb;
      return {
        kind: "click-match",
        prompt: randChoice(rng, withEach(MATCH_OPENERS, MATCH_CLOSERS)),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((a) => `${a.adverb} — ${a.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const CAT_OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CAT_CLOSERS = [
        "each word below into the correct ceremony vocabulary group.",
        "each vocabulary word into the group it belongs to.",
        "each word by whether it names a person, an object, an action, or an idea.",
        "these ceremony words into their correct groups.",
      ];
      const chosen = shuffle(rng, VOCAB).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.group)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, withEach(CAT_OPENERS, CAT_CLOSERS)),
        items,
        buckets,
        correctBucket,
        hint: "Ask yourself: does the word name a person, an object/clothing item, an action, or an idea about ceremonies?",
        explanation: chosen.map((c) => `"${c.word}" — ${c.group.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const ORDER_OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const ORDER_CLOSERS = [
        "the steps of listening to a ceremony story in the correct order.",
        "these listening-activity steps into the order they should happen.",
        "the steps below into a sensible listening sequence.",
        "these steps as they would actually happen during the lesson.",
      ];
      const items = shuffle(rng, LISTENING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, withEach(ORDER_OPENERS, ORDER_CLOSERS)),
        instruction: "Click them in order.",
        items,
        correctOrder: LISTENING_STEPS.map((s) => s.id),
        hint: "Start by listening and picking out vocabulary, then build a bank, answer comprehension questions, spot the adverbs, build new sentences, and finally share them.",
        explanation: LISTENING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const FILL_OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const FILL_CLOSERS = [
        "the adverb that correctly completes this sentence about a ceremony.",
        "the missing adverb below.",
        "the word that tells us how the action happened.",
        "the correct adverb to finish the sentence.",
        "the adverb that best fits the blank.",
      ];
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, withEach(FILL_OPENERS, FILL_CLOSERS)),
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer}${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return {
      kind: "multiple-choice",
      prompt: entry.prompt,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
