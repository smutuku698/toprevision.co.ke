import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FLIPBOOK_STEPS: { id: string; label: string }[] = [
  { id: "sequence", label: "Sequence the character's movement across images" },
  { id: "position", label: "Position the objects on subsequent pages" },
  { id: "craft", label: "Apply craftsmanship in the use of materials and tools" },
  { id: "collate", label: "Collate the papers in order" },
  { id: "bind", label: "Bind the papers using string or stapling" },
  { id: "flick", label: "Manipulate the flip book, flicking at speed to animate the story" },
];

const CATEGORIZE_ITEMS: { label: string; bucket: string; reason: string }[] = [
  { label: "Use of voice", bucket: "technique", reason: "Use of voice is a named storytelling technique." },
  { label: "Use of body", bucket: "technique", reason: "Use of body is a named storytelling technique." },
  { label: "Use of songs", bucket: "technique", reason: "Use of songs is a named storytelling technique." },
  { label: "Audience involvement", bucket: "technique", reason: "Audience involvement is a named storytelling technique." },
  { label: "Props", bucket: "technique", reason: "Props are a named storytelling technique." },
  { label: "Costumes", bucket: "technique", reason: "Costumes are a named storytelling technique." },
  { label: "Beginning", bucket: "structure", reason: "Beginning is one of the 3 parts of story structure." },
  { label: "Middle", bucket: "structure", reason: "Middle is one of the 3 parts of story structure." },
  { label: "End", bucket: "structure", reason: "End is one of the 3 parts of story structure." },
  { label: "Sequencing images", bucket: "flipbook", reason: "Sequencing images is part of creating a flip book animation." },
  { label: "Positioning objects on pages", bucket: "flipbook", reason: "Positioning objects on subsequent pages is part of creating a flip book animation." },
  { label: "Binding the papers", bucket: "flipbook", reason: "Binding the papers is part of finishing a flip book animation." },
];

const BUCKET_LABEL: Record<string, string> = {
  technique: "Storytelling technique",
  structure: "Part of story structure",
  flipbook: "Flip book animation step",
};

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  { q: "A narrator changes their tone and volume to make different characters sound distinct. Which storytelling technique is this?", correct: "Use of voice", distractors: ["Use of body", "Props", "Costumes"] },
  { q: "A narrator uses gestures, facial expressions, and movement to act out part of the story. Which storytelling technique is this?", correct: "Use of body", distractors: ["Use of voice", "Use of songs", "Audience involvement"] },
  { q: "A narrator pauses the story to ask the audience a question and get them to respond. Which storytelling technique is this?", correct: "Audience involvement", distractors: ["Use of body", "Use of songs", "Costumes"] },
  { q: "A narrator wears clothing that matches a character in the story to make the performance more convincing. Which storytelling technique is this?", correct: "Costumes", distractors: ["Props", "Use of voice", "Use of songs"] },
  { q: "A narrator holds a physical object, like a stick representing a spear, to support the story being told. Which storytelling technique is this?", correct: "Props", distractors: ["Costumes", "Use of body", "Audience involvement"] },
  { q: "A narrator breaks into a short tune at a key moment to add emotion to the story. Which storytelling technique is this?", correct: "Use of songs", distractors: ["Use of voice", "Props", "Use of body"] },
  { q: "Which part of a story introduces the setting and characters before the main action starts?", correct: "The beginning", distractors: ["The middle", "The end", "The follow through"] },
  { q: "Which part of a story usually contains the main conflict or rising action?", correct: "The middle", distractors: ["The beginning", "The end", "Audience involvement"] },
  { q: "Which part of a story resolves the conflict and closes the narrative?", correct: "The end", distractors: ["The beginning", "The middle", "Use of songs"] },
  { q: "What should a flip book's drawings focus on to animate a moving character correctly?", correct: "Sequencing the images and positioning objects consistently on each subsequent page", distractors: ["Using a different character in every single page", "Drawing only the very first and very last page", "Colouring each page a different background colour"] },
  { q: "Why is craftsmanship important when finishing a flip book animation?", correct: "It affects how neatly the materials, collating, and binding come together for a smooth flick-through", distractors: ["Craftsmanship only matters for the story's plot, not the physical book", "Craftsmanship has no effect on how the animation looks", "Craftsmanship is only judged after the story is performed live"] },
];

const FILL_BLANKS: { before: string; after: string; answers: string[]; explanation: string }[] = [
  { before: "Changing tone and volume to make different characters sound distinct is called use of ___.", after: "", answers: ["voice", "Voice"], explanation: "Use of voice makes different characters sound distinct." },
  { before: "Using gestures, facial expressions, and movement to act out part of a story is called use of ___.", after: "", answers: ["body", "Body"], explanation: "Use of body acts out part of a story." },
  { before: "Pausing a story to ask the audience a question is a technique called ___ involvement.", after: "", answers: ["audience", "Audience"], explanation: "Audience involvement draws listeners into the story." },
  { before: "Wearing clothing that matches a character to make a performance more convincing uses ___.", after: "", answers: ["costumes", "Costumes"], explanation: "Costumes make a performance more convincing." },
  { before: "Holding a physical object, like a stick representing a spear, to support a story is called using ___.", after: "", answers: ["props", "Props"], explanation: "Props support a story physically." },
  { before: "The part of a story that introduces the setting and characters is called the ___.", after: "", answers: ["beginning", "Beginning"], explanation: "The beginning introduces setting and characters." },
  { before: "The part of a story that usually contains the main conflict or rising action is called the ___.", after: "", answers: ["middle", "Middle"], explanation: "The middle contains the main conflict or rising action." },
  { before: "The part of a story that resolves the conflict and closes the narrative is called the ___.", after: "", answers: ["end", "End"], explanation: "The end resolves the conflict." },
  { before: "In a flip book animation, drawing a character moving consistently across pages is called ___ the images.", after: "", answers: ["sequencing", "Sequencing"], explanation: "Sequencing arranges the images to show movement." },
  { before: "Joining a flip book's pages together with string or staples is called ___ the papers.", after: "", answers: ["binding", "Binding"], explanation: "Binding joins the flip book's pages together." },
];

const MATCH_PROMPTS = [
  "Match each item to its correct description.",
  "Pair each item below with its correct description.",
  "Match each item to what it describes.",
  "Connect each item to its correct description.",
  "For each item below, choose its matching description.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about storytelling.",
  "Fill in the blank with the correct word.",
] as const;

const ORDER_PROMPTS = [
  "Arrange these steps of creating a flip book animation in the order they happen.",
  "Put these flip book animation steps in the order they occur.",
  "Order these steps, from first to last.",
  "Sort these flip book steps into the correct sequence.",
  "Place these flip book steps in the order you would follow them.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each item into the correct storytelling category.",
  "Which storytelling category does each item below belong to? Sort them.",
  "Classify each item into its correct storytelling category.",
  "Decide which category each item fits, and sort it.",
  "Sort these items by the storytelling category they belong to.",
] as const;

export const storytelling: Skill = {
  id: "g7-cas-storytelling",
  code: "C.7",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-creating-performing",
  grade: 7,
  title: "Storytelling",
  description: "Storytelling techniques, the beginning-middle-end structure of a short story, and creating a flip book animation.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "mc", "match", "fill-blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, CATEGORIZE_ITEMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.label, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.label, label: c.reason })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.label] = c.label;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Techniques are how a story is performed; structure parts are when events happen; flip book steps are the craft process.",
        explanation: chosen.map((c) => c.reason).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const f = randChoice(rng, FILL_BLANKS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: f.before,
        after: f.after,
        correctAnswer: f.answers[0],
        acceptedAnswers: f.answers,
        inputMode: "text",
        hint: "Think about whether this is a storytelling technique, a story structure part, or a flip-book step.",
        explanation: f.explanation,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, FLIPBOOK_STEPS),
        correctOrder: FLIPBOOK_STEPS.map((s) => s.id),
        hint: "First plan the drawn sequence, then finish the physical book, then animate it by flicking through.",
        explanation: `A flip book animation is created in this order: ${FLIPBOOK_STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    if (branch === "categorize") {
      const techPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "technique")).slice(0, 4);
      const structPicks = CATEGORIZE_ITEMS.filter((c) => c.bucket === "structure");
      const flipPicks = shuffle(rng, CATEGORIZE_ITEMS.filter((c) => c.bucket === "flipbook")).slice(0, 2);
      const items = shuffle(rng, [...techPicks, ...structPicks, ...flipPicks]);
      const correctBucket: Record<string, string> = {};
      for (const c of items) correctBucket[c.label] = c.bucket;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((c) => ({ id: c.label, label: c.label })),
        buckets: (["technique", "structure", "flipbook"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Techniques are how a story is performed; structure parts are when events happen in the story; flip book steps are the craft process.",
        explanation: items.map((c) => c.reason).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "Match the described action to the specific storytelling technique, story part, or flip-book step it demonstrates.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
