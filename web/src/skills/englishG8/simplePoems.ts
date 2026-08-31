import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Poem {
  title: string;
  persona: string;
  personaDistractors: string[];
  lines: { id: string; label: string }[];
  repeatedPhrase: string;
  repetitionEffect: string;
  repetitionDistractors: string[];
  paraphrase: string;
  paraphraseDistractors: string[];
  fillLineIndex: number; // index into lines[] that contains the repeated phrase, used for fill-blank
  fillBefore: string;
  fillAfter: string;
  fillAnswer: string;
}

const POEMS: Poem[] = [
  {
    title: "The Tinkerer",
    persona: "A girl who loves building and fixing things",
    personaDistractors: ["A teacher grading science homework", "A shopkeeper selling radios", "A pilot flying over the village"],
    lines: [
      { id: "l1", label: "I am the girl who dreams in gears," },
      { id: "l2", label: "tinkering long after the compound clears." },
      { id: "l3", label: "Wires and bulbs cover my small desk," },
      { id: "l4", label: "a broken radio, a hopeful test." },
      { id: "l5", label: "I build again when the first plan fails," },
      { id: "l6", label: "I build again when the current derails." },
      { id: "l7", label: "One day my lamp will light the whole street—" },
      { id: "l8", label: "I build again, until dream and truth meet." },
    ],
    repeatedPhrase: "I build again",
    repetitionEffect: "It emphasises that the persona keeps trying, without giving up, after every failure",
    repetitionDistractors: ["It shows the persona is bored and wants to stop", "It shows the persona is copying someone else's invention", "It shows the persona has already finished building"],
    paraphrase: "A girl keeps trying to build and fix things, even when her plans fail, hoping to succeed one day",
    paraphraseDistractors: ["A girl gives up on inventing after her first failure", "A girl buys a finished lamp from a shop", "A girl is afraid of using tools and wires"],
    fillLineIndex: 4,
    fillBefore: "I",
    fillAfter: "when the first plan fails,",
    fillAnswer: "build again",
  },
  {
    title: "The Village and the Wire",
    persona: "A young engineer bringing solar power to a village",
    personaDistractors: ["An elder who dislikes new technology", "A trader selling oil lamps", "A child afraid of the dark"],
    lines: [
      { id: "l1", label: "I came with panels strapped to my back," },
      { id: "l2", label: "walking the dusty, familiar track." },
      { id: "l3", label: "Grandmother laughed, 'Sunlight in a box?'" },
      { id: "l4", label: "I smiled and answered, 'watch the clocks.'" },
      { id: "l5", label: "Light returns, light returns at night," },
      { id: "l6", label: "children reading now by steady light." },
      { id: "l7", label: "The old lamp rests, its oil kept dry," },
      { id: "l8", label: "light returns, and no one asks why." },
    ],
    repeatedPhrase: "light returns",
    repetitionEffect: "It highlights how solar power has reliably brought light back to the village every night",
    repetitionDistractors: ["It shows the villagers are confused about electricity", "It shows the panels stopped working after one night", "It shows the persona regrets bringing the panels"],
    paraphrase: "A young engineer installs solar panels in a village, and the reliable light changes how children can study at night",
    paraphraseDistractors: ["An engineer fails to convince the village to try solar power", "A grandmother invents a new kind of lamp herself", "The village decides electricity is too expensive to keep"],
    fillLineIndex: 4,
    fillBefore: "",
    fillAfter: ", light returns at night,",
    fillAnswer: "Light returns",
  },
  {
    title: "The Helper I Was Made to Be",
    persona: "A small robot built to help with chores",
    personaDistractors: ["An engineer who designs robots", "A farmer who dislikes machines", "A shopkeeper selling tin cans"],
    lines: [
      { id: "l1", label: "I was built from tin and code and wire," },
      { id: "l2", label: "shaped by hands that would not tire." },
      { id: "l3", label: "I sweep the floor, I fetch, I carry," },
      { id: "l4", label: "I never rest, I never tarry." },
      { id: "l5", label: "They call me helper, small machine," },
      { id: "l6", label: "I do my work, and stay unseen." },
      { id: "l7", label: "I was built to serve, not to be praised," },
      { id: "l8", label: "I was built to serve, through all my days." },
    ],
    repeatedPhrase: "I was built to serve",
    repetitionEffect: "It stresses the robot's whole purpose is to serve quietly, without expecting praise",
    repetitionDistractors: ["It shows the robot wants to stop working", "It shows the robot was built by mistake", "It shows the robot wants to be famous"],
    paraphrase: "A small robot describes how it was built for the purpose of helping with everyday chores, without needing praise",
    paraphraseDistractors: ["A robot complains that it was never given any tasks to do", "A robot is jealous of the humans who built it", "A robot refuses to do any chores at all"],
    fillLineIndex: 6,
    fillBefore: "I was built to serve, not to be",
    fillAfter: ",",
    fillAnswer: "praised",
  },
];

const STRUCTURE_ITEMS: { text: string; category: string }[] = [
  { text: "Written in short lines and stanzas rather than paragraphs", category: "Poem" },
  { text: "Written in full sentences organised into paragraphs", category: "Passage" },
  { text: "Often uses rhyme, rhythm, or repeated lines for effect", category: "Poem" },
  { text: "Organised around topic sentences and supporting details", category: "Passage" },
  { text: "Often speaks through a single voice called the persona", category: "Poem" },
  { text: "Usually explains ideas directly, in ordinary sentence order", category: "Passage" },
];

export const simplePoems: Skill = {
  id: "g8-eng-r-simple-poems",
  code: "R.3",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Simple Poems",
  description: "Identify the persona and repetition in short poems about scientific innovation, explain their meaning, and compare poems to prose passages.",
  generate(rng) {
    const poem = randChoice(rng, POEMS);
    const poemText = poem.lines.map((l) => l.label).join("\n");
    const branch = randChoice(rng, ["order", "persona", "repetition", "paraphrase", "categorize", "fill"] as const);

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        passage: poemText,
        prompt: `Fill in the repeated phrase from "${poem.title}".`,
        before: poem.fillBefore,
        after: poem.fillAfter,
        correctAnswer: poem.fillAnswer,
        inputMode: "text",
        hint: "This exact phrase is repeated elsewhere in the poem above — look for it.",
        explanation: `The poem repeats the phrase "${poem.repeatedPhrase}" — here it completes the line "${poem.fillBefore} ${poem.fillAnswer} ${poem.fillAfter}".`.trim(),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, poem.lines);
      return {
        kind: "ordering",
        prompt: `Arrange the lines of "${poem.title}" in the correct order.`,
        instruction: "Click them in order.",
        items,
        correctOrder: poem.lines.map((l) => l.id),
        hint: "Read each line and think about which idea logically comes first, and which lines rhyme with each other.",
        explanation: poemText,
      };
    }

    if (branch === "persona") {
      const choices = shuffle(rng, [poem.persona, ...poem.personaDistractors]);
      return {
        kind: "multiple-choice",
        passage: poemText,
        prompt: `Who is the persona (the speaker) in "${poem.title}"?`,
        choices,
        correctIndex: choices.indexOf(poem.persona),
        layout: "list",
        hint: "The persona is the voice speaking the poem using 'I' — look at what that voice is doing throughout the poem.",
        explanation: `The persona is "${poem.persona}" — the poem is spoken from this point of view throughout.`,
      };
    }

    if (branch === "repetition") {
      const choices = shuffle(rng, [poem.repetitionEffect, ...poem.repetitionDistractors]);
      return {
        kind: "multiple-choice",
        passage: poemText,
        prompt: `The phrase "${poem.repeatedPhrase}" is repeated in "${poem.title}". What effect does this repetition create?`,
        choices,
        correctIndex: choices.indexOf(poem.repetitionEffect),
        layout: "list",
        hint: "Repetition in a poem usually emphasises an idea the poet wants the reader to remember most.",
        explanation: `Repeating "${poem.repeatedPhrase}" ${poem.repetitionEffect.toLowerCase()}.`,
      };
    }

    if (branch === "paraphrase") {
      const choices = shuffle(rng, [poem.paraphrase, ...poem.paraphraseDistractors]);
      return {
        kind: "multiple-choice",
        passage: poemText,
        prompt: `Which sentence best explains, in your own words, what "${poem.title}" is about?`,
        choices,
        correctIndex: choices.indexOf(poem.paraphrase),
        layout: "list",
        hint: "Paraphrasing means restating the poem's overall meaning in plain, ordinary sentences.",
        explanation: `"${poem.paraphrase}" — this captures the poem's overall meaning without quoting its exact words.`,
      };
    }

    const chosen = shuffle(rng, STRUCTURE_ITEMS);
    const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.category));
    return {
      kind: "categorize",
      prompt: "Sort each feature into whether it describes a Poem or a Passage.",
      items,
      buckets: [
        { id: "Poem", label: "Poem" },
        { id: "Passage", label: "Passage" },
      ],
      correctBucket,
      hint: "A poem is arranged in lines and stanzas and often uses rhythm or repetition; a passage is arranged in sentences and paragraphs.",
      explanation: chosen.map((c) => `"${c.text}" describes a ${c.category}.`).join(" "),
    };
  },
};
