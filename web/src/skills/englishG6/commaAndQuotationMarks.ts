import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Source: curriculum-reference/grade-6/english.json, Writing strand, sub-strand "7.4.1 Mechanics
// of Writing — Punctuation: Comma and Double Quotation Marks (Technology: Scientific
// Innovations)". learningExperiences: "Identify sentences using the comma/double quotation
// marks; recite a poem on scientific innovations attending to punctuation; listen to an oral
// presentation and answer questions; use substitution tables; construct and punctuate sentences
// with peers; create a poster/PowerPoint...; write from dictation and punctuate correctly."
// Sentences below use the theme's own Listening & Speaking vocabulary (engineer, laboratory,
// satellite, rocket, device, invent, etc.) from L&S 7.1.1, same theme.

type RuleType = "list" | "compound" | "introductory" | "direct-address" | "quote-tag";

const RULE_TYPES: { id: RuleType; label: string; description: string; example: string }[] = [
  { id: "list", label: "Separating items in a list", description: "A comma separates each item in a series of three or more", example: "The lab needed beakers, gloves, and goggles." },
  { id: "compound", label: "Joining two complete sentences", description: "A comma comes before a joining word (and, but, so, or, yet, for) that links two complete sentences", example: "The device was small, but it worked perfectly." },
  { id: "introductory", label: "Setting off an introductory word or phrase", description: "A comma follows a word or phrase that comes before the main sentence", example: "Finally, the satellite reached its orbit." },
  { id: "direct-address", label: "Setting off the name of the person spoken to", description: "A comma separates the name of the person being addressed from the rest of the sentence", example: "Doctor, please check this new device." },
  { id: "quote-tag", label: "Linking a quotation to its speech tag", description: "A comma connects a direct quotation to words like 'said' or 'asked'", example: "\"The signal is weak,\" reported the technician." },
];

const SENTENCES: { text: string; type: RuleType }[] = [
  { text: "The engineer packed a hammer, screwdriver, wire, and torch.", type: "list" },
  { text: "Before the launch, the team checked the fuel, the engine, the wiring, and the parachute.", type: "list" },
  { text: "The laboratory needed new beakers, gloves, goggles, and chemicals.", type: "list" },
  { text: "The app can send messages, make calls, take photos, and play music.", type: "list" },
  { text: "The architect drew the walls, the windows, the roof, and the doors.", type: "list" },
  { text: "The satellite carried cameras, sensors, batteries, and solar panels.", type: "list" },
  { text: "The scientist tested the rocket, and it launched successfully.", type: "compound" },
  { text: "The device was small, but it worked perfectly.", type: "compound" },
  { text: "The engineer fixed the wiring, so the lights came back on.", type: "compound" },
  { text: "The signal was weak, yet the call still connected.", type: "compound" },
  { text: "The robot could clean the floor, or it could water the plants.", type: "compound" },
  { text: "The laboratory was locked, for the experiment was still cooling.", type: "compound" },
  { text: "Finally, the satellite reached its orbit.", type: "introductory" },
  { text: "In the laboratory, the technician mixed two chemicals carefully.", type: "introductory" },
  { text: "After months of testing, the new app was released.", type: "introductory" },
  { text: "Excited, the pupils watched the robot move for the first time.", type: "introductory" },
  { text: "Without warning, the machine switched itself off.", type: "introductory" },
  { text: "During the demonstration, the engineer explained how the device worked.", type: "introductory" },
  { text: "Doctor, please check this new device.", type: "direct-address" },
  { text: "Engineer, the wiring seems loose here.", type: "direct-address" },
  { text: "Pupils, watch carefully how the circuit lights up.", type: "direct-address" },
  { text: "Mwalimu, may I ask how satellites stay in orbit?", type: "direct-address" },
  { text: "Class, today we will build a simple electronic circuit.", type: "direct-address" },
  { text: "Sir, the robot has stopped moving.", type: "direct-address" },
  { text: '"The device is ready," said the engineer.', type: "quote-tag" },
  { text: '"The signal is weak," reported the technician.', type: "quote-tag" },
  { text: '"How does the satellite stay in orbit?" asked the pupil.', type: "quote-tag" },
  { text: '"This invention will save time," the scientist explained.', type: "quote-tag" },
  { text: '"Watch closely," said the teacher, "as the circuit lights up."', type: "quote-tag" },
  { text: '"The rocket has launched!" shouted the crowd.', type: "quote-tag" },
];

// Analyze/Evaluate-tier: each wrong option has exactly one specific, nameable error (comma
// splice, extra/misplaced comma, missing opening or closing quotation mark, missing comma before
// a closing quotation mark) — a curated confusable cluster, not an arbitrary distractor pool.
const CORRECT_VS_INCORRECT: { correct: string; wrongs: string[] }[] = [
  {
    correct: "The engineer tested the device, and it worked perfectly.",
    wrongs: [
      "The engineer tested the device, it worked perfectly.",
      "The engineer tested the device and, it worked perfectly.",
      "The engineer tested the device and it worked, perfectly.",
    ],
  },
  {
    correct: '"The device is ready," said the engineer.',
    wrongs: [
      '"The device is ready, said the engineer.',
      'The device is ready," said the engineer."',
      '"The device is ready" said the engineer.',
    ],
  },
  {
    correct: "Finally, the satellite reached its orbit.",
    wrongs: [
      "Finally the satellite reached its orbit.",
      "Finally, the satellite, reached its orbit.",
      "Finally the, satellite reached its orbit.",
    ],
  },
  {
    correct: "The lab needed beakers, gloves, and goggles.",
    wrongs: [
      "The lab needed beakers gloves and goggles.",
      "The lab needed beakers, gloves and, goggles.",
      "The lab needed, beakers, gloves, and goggles.",
    ],
  },
  {
    correct: '"How does the satellite stay in orbit?" asked the pupil.',
    wrongs: [
      'How does the satellite stay in orbit?" asked the pupil.',
      '"How does the satellite stay in orbit? asked the pupil."',
      '"How does the satellite stay in orbit" asked the pupil?',
    ],
  },
  {
    correct: "Doctor, please check this new device.",
    wrongs: [
      "Doctor please check this new device.",
      "Doctor, please, check this new device.",
      "Doctor please, check this new device.",
    ],
  },
  {
    correct: "The signal was weak, but the call still connected.",
    wrongs: [
      "The signal was weak, the call still connected.",
      "The signal was weak but, the call still connected.",
      "The signal, was weak, but the call still connected.",
    ],
  },
  {
    correct: '"Watch closely," said the teacher, "as the circuit lights up."',
    wrongs: [
      '"Watch closely, said the teacher, as the circuit lights up."',
      '"Watch closely," said the teacher, as the circuit lights up.',
      'Watch closely," said the teacher, "as the circuit lights up."',
    ],
  },
  {
    correct: "After months of testing, the new app was released.",
    wrongs: [
      "After months of testing the new app was released.",
      "After months, of testing, the new app was released.",
      "After months of testing the new, app was released.",
    ],
  },
  {
    correct: "The robot could clean the floor, or it could water the plants.",
    wrongs: [
      "The robot could clean the floor, it could water the plants.",
      "The robot could clean the floor or, it could water the plants.",
      "The robot could clean the floor, or it could water, the plants.",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "The lab needed beakers", after: " gloves, and goggles.", correctAnswer: "," },
  { before: "Finally", after: " the satellite reached its orbit.", correctAnswer: "," },
  { before: "The engineer tested the device", after: " and it worked perfectly.", correctAnswer: "," },
  { before: "Doctor", after: " please check this new device.", correctAnswer: "," },
  { before: "The signal was weak", after: " but the call still connected.", correctAnswer: "," },
  { before: "In the laboratory", after: " the technician mixed two chemicals carefully.", correctAnswer: "," },
  { before: "The engineer said, ", after: 'The device is ready."', correctAnswer: '"' },
  { before: '"The device is ready,', after: ' said the engineer.', correctAnswer: '"' },
  { before: "The scientist explained, ", after: 'This invention will save time."', correctAnswer: '"' },
  { before: "Class", after: " today we will build a simple electronic circuit.", correctAnswer: "," },
  { before: "The robot could clean the floor", after: " or it could water the plants.", correctAnswer: "," },
  { before: '"Watch closely,', after: ' said the teacher, "as the circuit lights up."', correctAnswer: '"' },
];

// A grounded procedural sequence for the mechanical rule "use the comma and double quotation
// marks correctly" when writing a sentence with a direct quotation — not an invented ordering,
// but the step-by-step application of the rule itself.
const QUOTE_STEPS: { id: string; label: string }[] = [
  { id: "words", label: "Write down the exact words the speaker says" },
  { id: "open-quote", label: "Put an opening double quotation mark before the speaker's first word" },
  { id: "close-quote", label: "Put a closing double quotation mark after the speaker's last word" },
  { id: "comma", label: "Add a comma just inside the closing quotation mark, before the speech tag" },
  { id: "tag", label: "Add the speech tag, such as 'said the engineer'" },
  { id: "fullstop", label: "End the whole sentence with a full stop after the speech tag" },
];

export const commaAndQuotationMarks: Skill = {
  id: "g6-eng-writing-comma-quotation-marks",
  code: "W.6",
  subjectId: "english",
  strandId: "g6-eng-writing",
  grade: 6,
  title: "Comma and Double Quotation Marks",
  description: "Identify and correctly use the comma (in lists, compound sentences, introductions, direct address, and quotations) and double quotation marks (around a speaker's exact words) in science- and technology-themed sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-correct", "categorize", "click-match", "fill-blank", "order"] as const);
    const hint = "Use a comma to separate list items, join two complete sentences with a conjunction, set off an introductory phrase or a name being addressed, and to link a quotation to its speech tag. Use double quotation marks to enclose a speaker's exact words.";

    if (branch === "mc-correct") {
      const entry = randChoice(rng, CORRECT_VS_INCORRECT);
      const choices = shuffle(rng, [entry.correct, ...entry.wrongs]);
      return {
        kind: "multiple-choice",
        prompt: "Which version of this sentence uses the comma and quotation marks correctly?",
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check for a comma splice (two sentences joined with only a comma), a missing quotation mark, or an extra/misplaced comma.",
        explanation: `The correctly punctuated sentence is: ${entry.correct}`,
      };
    }

    if (branch === "categorize") {
      const types: RuleType[] = ["list", "compound", "introductory", "direct-address", "quote-tag"];
      const chosenTypes = shuffle(rng, types).slice(0, 3);
      const chosen = shuffle(rng, chosenTypes.flatMap((t) => shuffle(rng, SENTENCES.filter((s) => s.type === t)).slice(0, 2)));
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.type));
      return {
        kind: "categorize",
        prompt: "Sort each sentence by which comma or quotation-mark rule it demonstrates.",
        items,
        buckets: chosenTypes.map((t) => ({ id: t, label: RULE_TYPES.find((r) => r.id === t)!.label })),
        correctBucket,
        hint,
        explanation: chosen.map((s) => `"${s.text}" — ${RULE_TYPES.find((r) => r.id === s.type)!.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "click-match") {
      const tokens = shuffle(rng, RULE_TYPES.map((r) => ({ id: r.id, label: r.label })));
      const targets = shuffle(rng, RULE_TYPES.map((r) => ({ id: r.id, label: `${r.description} — e.g. "${r.example}"` })));
      const correctMap: Record<string, string> = {};
      for (const r of RULE_TYPES) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: "Match each punctuation rule to its description and example.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: RULE_TYPES.map((r) => `${r.label}: ${r.description} — "${r.example}"`).join(" "),
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the steps for correctly punctuating a sentence that reports a speaker's exact words.",
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, QUOTE_STEPS.map((s) => ({ id: s.id, label: s.label }))),
        correctOrder: QUOTE_STEPS.map((s) => s.id),
        hint: 'For example: "The device is ready," said the engineer.',
        explanation: QUOTE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing punctuation mark (a comma or a double quotation mark).",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The complete sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
