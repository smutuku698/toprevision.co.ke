import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 6.0 Jobs and Occupations, sub-strand 6.4 Creative Writing:
// Pictorial Composition (120-160 words) — put pictures in logical order and tell the story with a
// beginning, middle and end. See curriculum-reference/grade-5/english.json.

type Part = "beginning" | "middle" | "end";
const PART_LABEL: Record<Part, string> = {
  beginning: "Beginning — introduces the person, place and what they set out to do",
  middle: "Middle — the main events, including a problem",
  end: "End — how it turns out; a result or feeling",
};

// Four 3-picture job stories. Descriptions are in correct order (beginning, middle, end).
const STORIES: { job: string; pics: [string, string, string] }[] = [
  {
    job: "carpenter",
    pics: [
      "A carpenter measures a plank of wood and marks a line with a pencil.",
      "He saws along the line, but the plank splits near the end.",
      "He glues and clamps the split, and the finished stool stands firm.",
    ],
  },
  {
    job: "hairdresser",
    pics: [
      "A hairdresser welcomes a customer and shows her a book of styles.",
      "Halfway through the braiding, the power goes off and the room darkens.",
      "She moves the chair to the window and finishes the braids in daylight; the customer smiles at the mirror.",
    ],
  },
  {
    job: "gardener",
    pics: [
      "A gardener plants rows of seedlings in a school flower bed.",
      "A stray goat pushes through the fence and starts nibbling the young plants.",
      "The gardener mends the fence and waters the plants; a week later the bed is full of flowers.",
    ],
  },
  {
    job: "baker",
    pics: [
      "A baker mixes dough early in the morning and shapes it into loaves.",
      "The oven temperature drops and the first tray comes out pale and flat.",
      "She raises the heat, bakes a fresh batch, and sells every golden loaf by noon.",
    ],
  },
];

export const pictorialComposition: Skill = {
  id: "g5-eng-writing-pictorial-composition",
  code: "W.6",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Pictorial Composition",
  description: "Arrange a set of pictures in a logical order and match each to the beginning, middle or end of a story about a job or occupation.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-part", "fill-part", "sort-parts", "match", "order-pics", "reason"] as const);
    const story = randChoice(rng, STORIES);
    const parts: Part[] = ["beginning", "middle", "end"];

    if (branch === "mc-part") {
      const idx = randChoice(rng, [0, 1, 2]);
      const correct = PART_LABEL[parts[idx]];
      const wrong = parts.filter((_p, i) => i !== idx).map((pt) => PART_LABEL[pt]);
      const { choices, correctIndex } = mcFromCluster(rng, correct, wrong, 2);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the part of the story this picture shows")}\nPicture: "${story.pics[idx]}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: "The beginning sets things up, the middle has the problem, the end shows the result.",
        explanation: `This picture is the ${parts[idx]} of the story.`,
      };
    }

    if (branch === "fill-part") {
      const idx = randChoice(rng, [0, 1, 2]);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the story part — "beginning", "middle" or "end"`),
        before: `Picture: "${story.pics[idx]}"\nThis is the `,
        after: " of the composition.",
        correctAnswer: parts[idx],
        acceptedAnswers: [parts[idx]],
        inputMode: "text",
        hint: "Does this picture start the story, show the problem, or finish it?",
        explanation: `It is the ${parts[idx]} — ${PART_LABEL[parts[idx]].split("—")[1].trim()}.`,
      };
    }

    if (branch === "sort-parts") {
      const other = randChoice(rng, STORIES.filter((s) => s.job !== story.job));
      const items = shuffle(rng, [
        ...story.pics.map((t, i) => ({ id: `a${i}`, label: t, part: parts[i] })),
        { id: "b0", label: other.pics[0], part: "beginning" as Part },
        { id: "b2", label: other.pics[2], part: "end" as Part },
      ]).slice(0, 5);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.part));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which part of a story each picture belongs to"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "beginning", label: "Beginning" },
          { id: "middle", label: "Middle" },
          { id: "end", label: "End" },
        ],
        correctBucket,
        hint: "A 'beginning' picture introduces someone; a 'middle' picture shows something going wrong; an 'end' picture shows how it finished.",
        explanation: "Each picture in a pictorial composition becomes one part of the story: setting up, the problem, the outcome.",
      };
    }

    if (branch === "match") {
      const pool = STORIES.slice(0, 3);
      const which = randChoice(rng, [0, 1, 2]);
      const tokens = shuffle(rng, pool.map((s) => ({ id: s.job, label: s.pics[which] })));
      const targets = shuffle(rng, pool.map((s) => ({ id: s.job, label: `the ${s.job}'s story` })));
      const correctMap: Record<string, string> = {};
      pool.forEach((s) => (correctMap[s.job] = s.job));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "picture to the job story it belongs to"),
        tokens,
        targets,
        correctMap,
        hint: "Look at the clue in each picture — the tool, the workplace, the task.",
        explanation: pool.map((s) => `"${s.pics[which]}" → the ${s.job}'s story`).join("  "),
      };
    }

    if (branch === "order-pics") {
      const items = story.pics.map((t, i) => ({ id: `p${i}`, label: t }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the pictures to tell the story logically"),
        instruction: "Click the pictures in the correct order.",
        items: shuffle(rng, items),
        correctOrder: ["p0", "p1", "p2"],
        hint: "First the person starts the job, then something goes wrong, then it is put right.",
        explanation: `Correct order:\n1. ${story.pics[0]}\n2. ${story.pics[1]}\n3. ${story.pics[2]}`,
      };
    }

    // reason — Apply: pictures placed in the wrong order; which order is right / what goes wrong?
    const scrambled = [story.pics[2], story.pics[0], story.pics[1]];
    const correct = `${story.pics[0]} → ${story.pics[1]} → ${story.pics[2]}`;
    const wrong = [
      `${scrambled[0]} → ${scrambled[1]} → ${scrambled[2]}`,
      `${story.pics[1]} → ${story.pics[0]} → ${story.pics[2]}`,
      `${story.pics[0]} → ${story.pics[2]} → ${story.pics[1]}`,
    ];
    const { choices, correctIndex } = mcFromCluster(rng, correct, wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `A pupil has three pictures of a ${story.job} but is not sure of the order.`, "Which order tells the story correctly?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "The ending cannot come before the problem; the problem cannot come before the person starts work.",
      explanation: `Correct order: ${correct}. Putting the result first, or the problem before the person starts, makes the story confusing.`,
    };
  },
};
