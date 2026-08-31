import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 10.0 Leisure Time Activities, sub-strand 10.4 Creative Writing:
// Descriptive Composition (120-160 words). Tested as knowledge ABOUT describing well.
// See curriculum-reference/grade-5/english.json.

type Sense = "sight" | "sound" | "smell" | "taste" | "touch";
const SENSE_DETAILS: { text: string; sense: Sense }[] = [
  { text: "the bright yellow kite dipping and rising against the blue sky", sense: "sight" },
  { text: "the steady thud of the football against the wall", sense: "sound" },
  { text: "the smoky smell of roasting maize drifting across the park", sense: "smell" },
  { text: "the sweet, cold taste of the sliced watermelon", sense: "taste" },
  { text: "the rough bark of the tree under my hands as I climbed", sense: "touch" },
  { text: "the players' red and white jerseys shining in the afternoon light", sense: "sight" },
  { text: "the crowd's roar rolling round the field like thunder", sense: "sound" },
  { text: "the dusty, dry smell of the running track", sense: "smell" },
  { text: "the salty tang of the roasted groundnuts", sense: "taste" },
  { text: "the warm, gritty sand slipping between my toes", sense: "touch" },
];

// show vs tell
const SHOW_TELL: { tell: string; show: string }[] = [
  { tell: "The park was nice.", show: "Tall jacaranda trees lined the path, their purple flowers scattered like confetti on the grass." },
  { tell: "The race was exciting.", show: "The runners burst from the line, arms pumping, while the crowd leapt to its feet." },
  { tell: "The food smelled good.", show: "The scent of frying samosas and sweet mandazi pulled us straight towards the stall." },
  { tell: "It was cold at the pool.", show: "Goosebumps prickled my arms and my teeth chattered before I even reached the water." },
  { tell: "The garden was pretty.", show: "Marigolds and roses crowded the beds, and a bee hummed from flower to flower." },
];

const CRITERIA: { name: string; checks: string }[] = [
  { name: "Choice of words", checks: "are the words precise and interesting, not vague like 'nice' or 'good'?" },
  { name: "Creativity", checks: "does the writer use fresh comparisons and their own way of seeing things?" },
  { name: "Relevance to theme", checks: "does every sentence describe the topic and stay on it?" },
  { name: "Logical flow", checks: "do the details follow a sensible order, so the reader can picture the scene?" },
];

export const descriptiveComposition: Skill = {
  id: "g5-eng-writing-descriptive-composition",
  code: "W.10",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Descriptive Composition",
  description: "Use the five senses and precise words to describe a scene, tell 'showing' from 'telling', and judge a description against choice of words, creativity, relevance and flow.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-show", "fill-sense", "sort-sense", "match-criteria", "order-flow", "reason"] as const);

    if (branch === "mc-show") {
      const st = randChoice(rng, SHOW_TELL);
      const { choices, correctIndex } = mcFromCluster(rng, st.show, [st.tell, ...shuffle(rng, SHOW_TELL.filter((x) => x.tell !== st.tell)).slice(0, 2).map((x) => x.tell)], 3);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the sentence that DESCRIBES the scene (shows, not tells)")}\nA weak version says: "${st.tell}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: "'Showing' gives the reader details to picture. 'Telling' just states an opinion like 'nice' or 'exciting'.",
        explanation: `"${st.show}" shows the scene with details. "${st.tell}" only tells the reader what to think.`,
      };
    }

    if (branch === "fill-sense") {
      const d = randChoice(rng, SENSE_DETAILS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the sense this detail uses — sight, sound, smell, taste or touch"),
        before: `"${d.text}"\nThis detail appeals to the sense of `,
        after: ".",
        correctAnswer: d.sense,
        acceptedAnswers: [d.sense, d.sense === "sight" ? "seeing" : d.sense === "sound" ? "hearing" : d.sense],
        inputMode: "text",
        hint: "Ask which body part takes in this detail: eyes, ears, nose, tongue or skin.",
        explanation: `This detail uses ${d.sense} — ${d.sense === "sight" ? "what you see" : d.sense === "sound" ? "what you hear" : d.sense === "smell" ? "what you smell" : d.sense === "taste" ? "what you taste" : "what you feel by touch"}.`,
      };
    }

    if (branch === "sort-sense") {
      const pool = shuffle(rng, SENSE_DETAILS).slice(0, 6);
      const items = pool.map((d, i) => ({ id: `d${i}`, label: d.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((d, i) => (correctBucket[`d${i}`] = d.sense));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which sense each description detail uses"),
        items,
        buckets: [
          { id: "sight", label: "Sight" },
          { id: "sound", label: "Sound" },
          { id: "smell", label: "Smell" },
          { id: "taste", label: "Taste" },
          { id: "touch", label: "Touch" },
        ],
        correctBucket,
        hint: "Colours and shapes = sight; noises = sound; scents = smell; flavours = taste; textures and temperature = touch.",
        explanation: "Good descriptive writing uses details from several senses so the reader can fully imagine the scene.",
      };
    }

    if (branch === "match-criteria") {
      const pool = shuffle(rng, CRITERIA).slice(0, 4);
      const tokens = shuffle(rng, pool.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, pool.map((c) => ({ id: c.name, label: c.checks })));
      const correctMap: Record<string, string> = {};
      pool.forEach((c) => (correctMap[c.name] = c.name));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "critique criterion to what it checks"),
        tokens,
        targets,
        correctMap,
        hint: "These are the four things to look for when judging a description.",
        explanation: pool.map((c) => `${c.name}: ${c.checks}`).join("  "),
      };
    }

    if (branch === "order-flow") {
      const scenes = [
        ["As I walked into the park,", "the wide green field opened up in front of me,", "and in the far corner a group of children flew their kites."],
        ["From the gate I could see the whole swimming pool,", "then I noticed the diving board at the deep end,", "and finally the small footbath right beside my feet."],
        ["The market stall caught my eye first,", "then the trays of golden mandazi on the counter,", "and last the single fly circling above them."],
      ];
      const sc = randChoice(rng, scenes);
      const items = sc.map((t, i) => ({ id: `p${i}`, label: t }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the description from the widest view to the closest detail"),
        instruction: "Click the parts in a logical order (wide view first, close detail last).",
        items: shuffle(rng, items),
        correctOrder: ["p0", "p1", "p2"],
        hint: "A description often moves from the big picture to the small details, so the reader can build the scene up.",
        explanation: `Logical order:\n1. ${sc[0]}\n2. ${sc[1]}\n3. ${sc[2]}`,
      };
    }

    // reason — Evaluate: a description is weak on ONE criterion; which one, and how to fix it?
    const c = randChoice(rng, CRITERIA);
    const weakExamples: Record<string, string> = {
      "Choice of words": "It was a nice day and the park was good and the game was fun.",
      "Creativity": "The sky was blue. The grass was green. The ball was round. The trees were tall.",
      "Relevance to theme": "The park had many trees. My favourite food is rice. There were children on the swings.",
      "Logical flow": "A child cried near the exit. The gate was far away. Someone scored a goal. The grass was wet in the morning.",
    };
    const { choices, correctIndex } = mcFromCluster(rng, c.name, shuffle(rng, CRITERIA.filter((x) => x.name !== c.name)).slice(0, 3).map((x) => x.name), 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `A pupil's description of a day at the park reads: "${weakExamples[c.name]}"`, "Which part of the writing most needs improving?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Look for the single biggest weakness: vague words, no imagination, off-topic sentences, or jumbled order.",
      explanation: `The weakest part is "${c.name}" — ${c.checks}`,
    };
  },
};
