import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { g6Name, g6Place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./sharedG6Ag";

// KICD Grade 6 Agriculture P.1 "Crocheting Stitches" (the first half of source sub-strand
// "4.1 Crocheting Stitches", the largest single sub-strand in the whole design at 16 lessons —
// split per the Grade-6 "split into deeper skills" rule; see crochetedHouseholdArticles.ts for
// the second half). The source names exactly two stitches — single and double crochet — as the
// enumerated content pool.

const SINGLE_FACTS = [
  { id: "s1", label: "Produces a short, tight, dense loop" },
  { id: "s2", label: "Makes fabric that is thick and sturdy" },
  { id: "s3", label: "Needs more rows to reach the same height as double crochet" },
  { id: "s4", label: "Works well for items that need to be firm and durable, such as a floor mat" },
  { id: "s5", label: "Has very small gaps between stitches, making a close, solid fabric" },
  { id: "s6", label: "Is often the first stitch a beginner learns because of its simple, repeated motion" },
  { id: "s7", label: "Is a good choice for a cleaning rug that needs to hold its shape under scrubbing" },
  { id: "s8", label: "Grows fabric more slowly per row than double crochet" },
] as const;

const DOUBLE_FACTS = [
  { id: "d1", label: "Produces a taller, more open loop" },
  { id: "d2", label: "Makes fabric that is lighter and more airy" },
  { id: "d3", label: "Reaches the same height in fewer rows than single crochet" },
  { id: "d4", label: "Works well for items where speed and an open, decorative texture matter" },
  { id: "d5", label: "Has larger, more visible gaps between stitches" },
  { id: "d6", label: "Involves an extra yarn-over step before pulling through the loops" },
  { id: "d7", label: "Is a good choice for a lighter surface wiper that does not need to be very dense" },
  { id: "d8", label: "Grows fabric faster per row than single crochet" },
] as const;

const STITCH_STEPS_SINGLE = [
  { id: "s-insert", label: "Insert the hook", detail: "Insert the crochet hook into the next stitch of the row below" },
  { id: "s-yarnover", label: "Yarn over", detail: "Wrap the yarn once over the hook" },
  { id: "s-pull-through-1", label: "Pull through the stitch", detail: "Pull the yarn through the stitch, leaving two loops on the hook" },
  { id: "s-yarnover2", label: "Yarn over again", detail: "Wrap the yarn over the hook a second time" },
  { id: "s-pull-through-2", label: "Pull through both loops", detail: "Pull the yarn through both loops on the hook, completing one single crochet stitch" },
] as const;

const STITCH_STEPS_DOUBLE = [
  { id: "d-yarnover-first", label: "Yarn over first", detail: "Wrap the yarn over the hook before inserting it into the stitch" },
  { id: "d-insert", label: "Insert the hook", detail: "Insert the hook into the next stitch of the row below" },
  { id: "d-yarnover-pull", label: "Yarn over and pull through", detail: "Wrap the yarn over the hook and pull it through the stitch, leaving three loops on the hook" },
  { id: "d-pull-first-two", label: "Pull through the first two loops", detail: "Wrap the yarn over again and pull through the first two loops, leaving two loops on the hook" },
  { id: "d-pull-last-two", label: "Pull through the last two loops", detail: "Wrap the yarn over once more and pull through the remaining two loops, completing one double crochet stitch" },
] as const;

const OBSERVATION_FACTS: { situation: string; correct: string; wrong: string[] }[] = [
  {
    situation: "a mat crocheted entirely in single crochet stitches feels much denser and firmer than one crocheted in double crochet using the same amount of yarn",
    correct: "Single crochet loops are short and tight, packing more stitches into the same space and producing a denser fabric",
    wrong: [
      "Double crochet always produces the denser fabric of the two",
      "The type of stitch used has no effect on how dense the fabric feels",
      "Only the colour of the yarn affects how dense a crocheted item feels",
    ],
  },
  {
    situation: "an article crocheted in double crochet is finished in fewer rows than the same-sized article crocheted in single crochet",
    correct: "Each double crochet stitch is taller than a single crochet stitch, so fewer rows are needed to reach the same height",
    wrong: [
      "Single crochet always finishes faster than double crochet",
      "The number of rows needed has nothing to do with stitch height",
      "Double crochet always uses less yarn overall than single crochet",
    ],
  },
  {
    situation: "a cleaning rug made with single crochet holds up well to repeated scrubbing, while a rug made entirely with double crochet wears through more quickly under the same use",
    correct: "Single crochet's tight, dense structure resists the friction and pulling of scrubbing better than double crochet's more open, airy structure",
    wrong: [
      "Stitch type has no effect on how well an item survives scrubbing",
      "Double crochet is always the sturdier stitch for heavy use",
      "Only the colour of the yarn determines how durable an item is",
    ],
  },
  {
    situation: "a surface wiper crocheted in double crochet feels lighter and more breathable than the same-sized wiper crocheted in single crochet",
    correct: "Double crochet's taller, more open loops leave larger gaps between stitches, making the fabric feel lighter and more airy",
    wrong: [
      "Single crochet always produces a lighter fabric than double crochet",
      "The gaps between stitches have no effect on how a fabric feels",
      "Lightness in a crocheted fabric depends only on the type of yarn used",
    ],
  },
  {
    situation: "a beginner learning to crochet is usually taught single crochet before double crochet",
    correct: "Single crochet's simple, repeated motion is easier to learn first, before adding the extra yarn-over step that double crochet requires",
    wrong: [
      "Double crochet is always taught first because it is the simpler stitch",
      "The order in which stitches are taught has no connection to their difficulty",
      "Both stitches involve exactly the same number of steps, so order does not matter",
    ],
  },
  {
    situation: "a household article that needs to be both durable and finished quickly is often made using a mix of both single and double crochet in different sections",
    correct: "Combining both stitches lets a maker choose density where durability matters most and speed or openness where it matters less",
    wrong: [
      "Mixing stitches in one article is never done in real crocheting",
      "Only single crochet can ever be used in a durable household article",
      "The choice of stitch has no effect on an article's durability or speed to complete",
    ],
  },
  {
    situation: "double crochet involves an extra step compared to single crochet before the loop is completed",
    correct: "Double crochet requires an initial yarn-over before inserting the hook, an extra step single crochet does not have",
    wrong: [
      "Single crochet actually has more steps than double crochet",
      "Both stitches use exactly the same number of steps in exactly the same order",
      "The extra step in double crochet is optional and can always be skipped",
    ],
  },
  {
    situation: "a household budget-conscious family chooses to crochet a floor mat rather than buy one from a shop",
    correct: "Crocheting a usable household article with available yarn and skill saves the cost of purchasing one, a direct financial-literacy benefit of the skill",
    wrong: [
      "Crocheting a mat always costs more than buying one from a shop",
      "Financial savings have no connection to making household articles by hand",
      "Homemade crocheted items are never as useful as shop-bought ones",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: (typeof OBSERVATION_FACTS)[number]) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = g6Name(rng);
    const p = g6Place(rng);
    return {
      prompt: `${who}, crocheting a household article at home in ${p}, notices that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = g6Place(rng);
    return {
      prompt: `In a Creative Arts crocheting lesson near ${p}, learners observe that ${fact.situation}. What explains this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    return {
      prompt: `${who} compares two crocheted samples and notices that ${fact.situation}. What is the best explanation?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    return {
      prompt: `${who} is puzzled to find that ${fact.situation}. What is the reason for this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = g6Place(rng);
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, in a home near ${p}. What causes this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    const p = g6Place(rng);
    return {
      prompt: `While teaching a friend to crochet near ${p}, ${who} points out that ${fact.situation}. What is going on here?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(OBSERVATION_FACTS, REASONING_FRAMES);

const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "The two crochet stitches named in this sub-strand are single crochet and ", after: " crochet.", correctAnswer: "double", acceptedAnswers: ["double"] },
  { before: "Single crochet produces a short, ", after: " loop.", correctAnswer: "tight", acceptedAnswers: ["tight"] },
  { before: "Double crochet produces a taller, more ", after: " loop than single crochet.", correctAnswer: "open", acceptedAnswers: ["open"] },
  { before: "Double crochet requires an extra ", after: " step before the hook is inserted into the stitch.", correctAnswer: "yarn-over", acceptedAnswers: ["yarn-over", "yarn over"] },
  { before: "A tool called a crochet ", after: " is used to pull loops of yarn through each other to form stitches.", correctAnswer: "hook", acceptedAnswers: ["hook"] },
  { before: "Because each double crochet stitch is taller, fewer ", after: " are needed to reach the same height as single crochet.", correctAnswer: "rows", acceptedAnswers: ["rows"] },
  { before: "Single crochet's dense structure makes it well suited to items that need to be ", after: " and durable.", correctAnswer: "firm", acceptedAnswers: ["firm", "sturdy"] },
  { before: "Double crochet's more open structure makes the finished fabric feel lighter and more ", after: ".", correctAnswer: "airy", acceptedAnswers: ["airy"] },
  { before: "Beginners are usually taught single crochet before double crochet because it has a simpler, repeated ", after: ".", correctAnswer: "motion", acceptedAnswers: ["motion"] },
  { before: "A crocheted item's density depends mainly on which ", after: " is used to make it.", correctAnswer: "stitch", acceptedAnswers: ["stitch"] },
  { before: "Learning to crochet stitches is part of the strand called Production ", after: " in Grade 6 Agriculture.", correctAnswer: "Techniques", acceptedAnswers: ["Techniques"] },
  { before: "Crocheting stitches to make household articles is a skill related to artistic skills in ", after: ".", correctAnswer: "Creative Arts", acceptedAnswers: ["Creative Arts"] },
  { before: "A tightly packed row of stitches, with small gaps, is characteristic of ", after: " crochet.", correctAnswer: "single", acceptedAnswers: ["single"] },
  { before: "A row of stitches with larger, visible gaps is characteristic of ", after: " crochet.", correctAnswer: "double", acceptedAnswers: ["double"] },
  { before: "Yarn is wrapped over the hook in a movement called a ", after: ".", correctAnswer: "yarn-over", acceptedAnswers: ["yarn-over", "yarn over"] },
  { before: "In single crochet, after inserting the hook and yarning over once, the yarn is pulled through leaving two ", after: " on the hook.", correctAnswer: "loops", acceptedAnswers: ["loops"] },
  { before: "In double crochet, after the first pull-through, three ", after: " remain on the hook before the next steps.", correctAnswer: "loops", acceptedAnswers: ["loops"] },
  { before: "Producing a household article by hand instead of buying one demonstrates the value named ", after: " in the source curriculum.", correctAnswer: "Integrity", acceptedAnswers: ["Integrity", "integrity"] },
  { before: "Being resourceful and original while crocheting develops the core competency of creativity and ", after: ".", correctAnswer: "imagination", acceptedAnswers: ["imagination"] },
  { before: "Choosing single crochet for a durable item and double crochet for a quicker, lighter one shows understanding of each stitch's ", after: ".", correctAnswer: "properties", acceptedAnswers: ["properties", "strengths"] },
  { before: "The pertinent and contemporary issue linked to crocheting stitches in this sub-strand is financial ", after: ".", correctAnswer: "literacy", acceptedAnswers: ["literacy"] },
  { before: "Double crochet fabric generally grows ", after: " per row than single crochet fabric.", correctAnswer: "faster", acceptedAnswers: ["faster"] },
  { before: "Single crochet fabric generally grows ", after: " per row than double crochet fabric.", correctAnswer: "slower", acceptedAnswers: ["slower"] },
  { before: "A mix of both stitches in one article can balance ", after: " and speed.", correctAnswer: "durability", acceptedAnswers: ["durability"] },
  { before: "The hook is inserted into the next stitch of the row ", after: " when working either stitch.", correctAnswer: "below", acceptedAnswers: ["below"] },
  { before: "A firm, closely packed fabric suits an item that will be used and ", after: " often, such as a floor mat.", correctAnswer: "scrubbed", acceptedAnswers: ["scrubbed", "cleaned"] },
  { before: "Understanding the difference between single and double crochet helps a maker choose the right stitch for the right ", after: ".", correctAnswer: "purpose", acceptedAnswers: ["purpose", "article"] },
  { before: "Crocheting stitches accurately and consistently takes practice and ", after: ".", correctAnswer: "patience", acceptedAnswers: ["patience"] },
  { before: "The final step of completing a double crochet stitch is pulling through the last two ", after: " on the hook.", correctAnswer: "loops", acceptedAnswers: ["loops"] },
  { before: "Learning both named stitches gives a crocheter more ", after: " when planning a new household article.", correctAnswer: "options", acceptedAnswers: ["options", "choices"] },
];

const IDENTIFY_PROMPTS = [
  "Identify this crochet stitch.",
  "Which crochet stitch is shown here?",
  "Name this crochet stitch.",
  "Look at the picture and identify this stitch.",
  "What type of crochet stitch does this picture show?",
  "Study the image and name this stitch.",
];

const PROPERTIES_SORT_PROMPTS = [
  "Sort each description as describing single crochet or double crochet.",
  "Decide whether each description fits single crochet or double crochet, and sort it.",
  "Group these descriptions under the correct stitch type.",
  "Read each description and sort it as single crochet or double crochet.",
  "Place each description into the correct bucket: single crochet or double crochet.",
  "Sort these facts by whether they describe single crochet or double crochet.",
];

const STEPS_MATCH_PROMPT_TEMPLATES = [
  (kind: string) => `Match each step of making a ${kind} crochet stitch to what it involves.`,
  (kind: string) => `Pair each step of a ${kind} crochet stitch with what it actually means to do.`,
  (kind: string) => `Connect each step of making a ${kind} crochet stitch to its description.`,
  (kind: string) => `Match each stage of the ${kind} crochet process to what it involves.`,
  (kind: string) => `Link each ${kind} crochet step to the description that fits it.`,
  (kind: string) => `Match each step below to the correct explanation of the ${kind} crochet stitch.`,
];

const STEPS_ORDER_PROMPT_TEMPLATES = [
  (kind: string) => `Arrange the steps for making one ${kind} crochet stitch in the correct order.`,
  (kind: string) => `Put these steps for a ${kind} crochet stitch into the right sequence.`,
  (kind: string) => `Sequence the steps for making a ${kind} crochet stitch correctly.`,
  (kind: string) => `Arrange these steps in the order a crocheter would actually carry them out for a ${kind} stitch.`,
  (kind: string) => `Order these ${kind} crochet steps from first to last.`,
  (kind: string) => `Sort these steps into the correct order for making one ${kind} crochet stitch.`,
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about crochet stitches.",
  "Fill in the missing word about crochet stitches.",
  "Complete this sentence about single and double crochet.",
  "Supply the missing word in this sentence about crochet stitches.",
  "Fill in the blank to complete the fact about crochet stitches.",
  "Complete the missing word in this statement about crochet stitches.",
];

export const crochetStitches: Skill = {
  id: "g6-ag-p-crochet-stitches",
  code: "P.1",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-production-techniques",
  grade: 6,
  title: "Crocheting Stitches",
  description: "Identifying and making single and double crochet stitches — how each looks and feels, the steps to make each one, and choosing the right stitch for a purpose.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-visual", "properties-sort", "steps-match", "steps-order", "reasoning", "fill-blank"] as const);
    const hint = "Single crochet makes short, tight, dense loops; double crochet makes taller, more open loops that build fabric faster but less densely.";

    if (branch === "identify-visual") {
      const kind = randChoice(rng, ["single", "double"] as const);
      const choices = shuffle(rng, ["Single crochet", "Double crochet"]);
      const correct = kind === "single" ? "Single crochet" : "Double crochet";
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "crochet-stitch", kind },
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint,
        explanation:
          kind === "single"
            ? "This is single crochet — short, tight loops that pack closely together, forming dense, sturdy fabric."
            : "This is double crochet — taller, more open loops that build fabric height faster, forming lighter, airier fabric.",
      };
    }

    if (branch === "properties-sort") {
      const single = shuffle(rng, SINGLE_FACTS).slice(0, 5);
      const double = shuffle(rng, DOUBLE_FACTS).slice(0, 5);
      const chosen = shuffle(rng, [
        ...single.map((f) => ({ ...f, bucket: "single" as const })),
        ...double.map((f) => ({ ...f, bucket: "double" as const })),
      ]);
      const items = chosen.map((c) => ({ id: c.id, label: c.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, PROPERTIES_SORT_PROMPTS),
        items,
        buckets: [
          { id: "single", label: "Single crochet" },
          { id: "double", label: "Double crochet" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.label}" — ${c.bucket === "single" ? "single crochet" : "double crochet"}.`).join(" "),
      };
    }

    if (branch === "steps-match") {
      const kind = randChoice(rng, ["single", "double"] as const);
      const steps: readonly { id: string; label: string; detail: string }[] = kind === "single" ? STITCH_STEPS_SINGLE : STITCH_STEPS_DOUBLE;
      const tokens = shuffle(rng, steps.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, steps.map((s) => ({ id: s.id, label: s.detail })));
      const correctMap: Record<string, string> = {};
      for (const s of steps) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, STEPS_MATCH_PROMPT_TEMPLATES)(kind),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: steps.map((s) => `${s.label}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "steps-order") {
      const kind = randChoice(rng, ["single", "double"] as const);
      const steps: readonly { id: string; label: string; detail: string }[] = kind === "single" ? STITCH_STEPS_SINGLE : STITCH_STEPS_DOUBLE;
      const shuffled = shuffle(rng, steps);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_ORDER_PROMPT_TEMPLATES)(kind),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: steps.map((s) => s.id),
        hint:
          kind === "single"
            ? "Insert the hook first, then yarn over and pull through twice."
            : "Yarn over before inserting the hook, then pull through in stages, two loops at a time.",
        explanation: steps.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: fb.acceptedAnswers,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${fb.before}${fb.correctAnswer}${fb.after}"`,
    };
  },
};
