import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SENTENCE_TYPES: { text: string; type: "simple" | "compound" | "complex" }[] = [
  { text: "The matatu stopped at the bus stage.", type: "simple" },
  { text: "Boda boda riders wear reflective jackets.", type: "simple" },
  { text: "The SGR train departs from Nairobi every morning.", type: "simple" },
  { text: "Drivers must fasten their seatbelts.", type: "simple" },
  { text: "Heavy traffic delayed the journey.", type: "simple" },
  { text: "The bus was full, but the conductor still let more passengers in.", type: "compound" },
  { text: "We wanted to travel by train, so we booked our tickets early.", type: "compound" },
  { text: "The road was smooth, and the driver increased his speed.", type: "compound" },
  { text: "You can take a matatu, or you can ride a boda boda.", type: "compound" },
  { text: "Because the road was flooded, the bus took a longer route.", type: "complex" },
  { text: "When the traffic lights turned green, the cars moved forward.", type: "complex" },
  { text: "Although the fare had increased, passengers still boarded the matatu.", type: "complex" },
  { text: "The journey was delayed since the highway was under repair.", type: "complex" },
];

const TYPE_LABEL: Record<string, string> = {
  simple: "Simple sentence (one independent clause)",
  compound: "Compound sentence (two independent clauses joined by and/but/or/so)",
  complex: "Complex sentence (an independent clause plus a subordinate clause)",
};

const PICK_SIMPLE_MC: { correct: string; others: string[] }[] = [
  {
    correct: "The conductor collected the bus fare.",
    others: [
      "The conductor collected the fare, and the bus set off.",
      "Because the fare had risen, passengers complained.",
      "The bus was late, so the passengers waited outside.",
    ],
  },
  {
    correct: "The new highway reduced travel time.",
    others: [
      "The highway was widened, but traffic still moved slowly.",
      "Since the highway was widened, journeys became shorter.",
      "The road was repaired, and traffic flowed more freely.",
    ],
  },
  {
    correct: "Traffic police direct vehicles at the roundabout.",
    others: [
      "Although the roundabout was busy, the police managed the flow.",
      "The roundabout was busy, so police were called in.",
      "When traffic builds up, police direct vehicles by hand.",
    ],
  },
  {
    correct: "Long-distance buses stop at designated stages.",
    others: [
      "Buses stop at designated stages, and passengers alight quickly.",
      "Because the journey was long, the bus stopped twice.",
      "The bus stopped at the stage, but few passengers boarded.",
    ],
  },
];

const SUBJECT_PREDICATE: { subject: string; predicate: string }[] = [
  { subject: "The matatu conductor", predicate: "collects the fare." },
  { subject: "Boda boda riders", predicate: "wear reflective jackets." },
  { subject: "The SGR train", predicate: "departs from Nairobi." },
  { subject: "Traffic police", predicate: "direct vehicles at junctions." },
  { subject: "The new highway", predicate: "reduces travel time." },
  { subject: "Long-distance buses", predicate: "stop at designated stages." },
];

const ORDER_ITEMS: { id: string; words: string[] }[] = [
  { id: "brakes", words: ["The", "driver", "checked", "the", "brakes"] },
  { id: "jackets", words: ["Boda", "boda", "riders", "wear", "reflective", "jackets"] },
  { id: "highway", words: ["The", "new", "highway", "reduced", "travel", "time"] },
  { id: "matatu", words: ["Passengers", "boarded", "the", "crowded", "matatu"] },
  { id: "sgr", words: ["The", "SGR", "train", "reaches", "Mombasa", "daily"] },
  { id: "roundabout", words: ["Traffic", "police", "direct", "vehicles", "at", "junctions"] },
];

export const simpleSentences: Skill = {
  id: "g7-eng-g-simple-sentences",
  code: "G.13",
  subjectId: "english",
  strandId: "g7-eng-grammar",
  grade: 7,
  title: "Simple Sentences",
  description: "Identify simple sentences among varied texts and construct simple sentences about land travel.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "type-mc", "pick-simple-mc", "order", "match"] as const);

    if (branch === "categorize") {
      const simplePick = shuffle(rng, SENTENCE_TYPES.filter((s) => s.type === "simple")).slice(0, 2);
      const compoundPick = shuffle(rng, SENTENCE_TYPES.filter((s) => s.type === "compound")).slice(0, 2);
      const complexPick = shuffle(rng, SENTENCE_TYPES.filter((s) => s.type === "complex")).slice(0, 2);
      const chosen = shuffle(rng, [...simplePick, ...compoundPick, ...complexPick]);
      const buckets = [
        { id: "simple", label: TYPE_LABEL.simple },
        { id: "compound", label: TYPE_LABEL.compound },
        { id: "complex", label: TYPE_LABEL.complex },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.type));
      return {
        kind: "categorize",
        prompt: "Sort each sentence as simple, compound, or complex.",
        items,
        buckets,
        correctBucket,
        hint: "A simple sentence has just one independent clause. A compound sentence joins two independent clauses with and/but/or/so. A complex sentence has an independent clause plus a subordinate clause (often starting with because, when, although, or since).",
        explanation: chosen.map((s) => `"${s.text}" is a ${s.type} sentence.`).join(" "),
      };
    }

    if (branch === "type-mc") {
      const entry = randChoice(rng, SENTENCE_TYPES);
      const choices = shuffle(rng, [TYPE_LABEL.simple, TYPE_LABEL.compound, TYPE_LABEL.complex]);
      return {
        kind: "multiple-choice",
        prompt: `What kind of sentence is this? "${entry.text}"`,
        choices,
        correctIndex: choices.indexOf(TYPE_LABEL[entry.type]),
        layout: "list",
        hint: "Count the independent clauses. If there is only one, and no joining word like 'and' or 'because', it is simple.",
        explanation: `"${entry.text}" is a ${entry.type} sentence.`,
      };
    }

    if (branch === "pick-simple-mc") {
      const entry = randChoice(rng, PICK_SIMPLE_MC);
      const choices = shuffle(rng, [entry.correct, ...entry.others]);
      return {
        kind: "multiple-choice",
        prompt: "Which of these is a simple sentence (a single independent clause)?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "A simple sentence has exactly one subject-verb group and no joining words like and, but, so, because, when, or although.",
        explanation: `"${entry.correct}" is the simple sentence — it has one subject and one verb, with no second clause joined onto it. The other options each contain a joining word that adds a second clause.`,
      };
    }

    if (branch === "order") {
      const entry = randChoice(rng, ORDER_ITEMS);
      const tokens = entry.words.map((w, i) => ({ id: `w${i}`, label: w }));
      return {
        kind: "ordering",
        prompt: "Arrange these words to form a correct simple sentence about land travel.",
        instruction: "Click the words in order, from first to last.",
        items: shuffle(rng, tokens),
        correctOrder: tokens.map((t) => t.id),
        hint: "A simple sentence follows subject, then verb, then object or extra detail.",
        explanation: `The correct simple sentence is: "${entry.words.join(" ")}."`,
      };
    }

    const chosen = shuffle(rng, SUBJECT_PREDICATE).slice(0, 6);
    const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.subject })));
    const targets = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.predicate })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((p, i) => (correctMap[`p${i}`] = `p${i}`));
    return {
      kind: "click-match",
      prompt: "Match each subject to the predicate that completes it into a correct simple sentence.",
      tokens,
      targets,
      correctMap,
      hint: "Each pairing should form one complete idea with a single subject and a single verb — no joining words needed.",
      explanation: chosen.map((p) => `"${p.subject} ${p.predicate}" is a correct simple sentence.`).join(" "),
    };
  },
};
