import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 4.0 Road Accidents - Prevention, sub-strand 4.2 Intensive Reading:
// Comprehension — Visuals. Focus: list and interpret illustrations, posters, signs, maps and mnemonics;
// make predictions from visuals; factual and inferential questions.
// See curriculum-reference/grade-5/english.json.

const SIGNS: { sign: string; meaning: string }[] = [
  { sign: "a red octagon with the word STOP", meaning: "Stop completely, then go only when it is safe" },
  { sign: "a red triangle with a person walking", meaning: "Warning: a pedestrian crossing is ahead" },
  { sign: "a red triangle with two children", meaning: "Warning: a school is ahead; drive slowly" },
  { sign: "a red circle with the number 50", meaning: "The speed limit is 50 km/h" },
  { sign: "a red circle with two cars and one crossed out", meaning: "No overtaking" },
  { sign: "a red triangle with a bump shape", meaning: "Warning: a bump (speed hump) is ahead" },
  { sign: "a blue circle with a white arrow curving round", meaning: "A roundabout is ahead; give way to traffic already on it" },
  { sign: "a red triangle with a sharp bend line", meaning: "Warning: a sharp bend is ahead" },
];

const VISUAL_TYPES: { type: string; desc: string }[] = [
  { type: "road sign", desc: "a symbol beside the road that gives a rule or a warning" },
  { type: "map", desc: "a drawing from above that shows how places and roads are laid out" },
  { type: "poster", desc: "a large printed sheet with a picture and a short message" },
  { type: "illustration", desc: "a drawing that shows what a scene or event looks like" },
  { type: "mnemonic", desc: "a picture or phrase that helps you remember something, like 'STOP, LOOK, LISTEN'" },
  { type: "chart", desc: "a picture that shows numbers or steps in an organised way" },
];

const PICS: { desc: string; predict: string; wrong: string[] }[] = [
  {
    desc: "A picture shows a ball rolling into the road and a small child running after it. A matatu is coming round the corner.",
    predict: "The child could be hit; someone should shout a warning and the child should stop at the kerb.",
    wrong: ["The matatu will turn into a bicycle.", "The ball will roll back on its own and nothing will happen.", "The child will safely fly over the road."],
  },
  {
    desc: "A poster shows a pedestrian standing at a zebra crossing, looking right, then left, then right again, with a car slowing down.",
    predict: "The pedestrian will cross safely once the car has stopped.",
    wrong: ["The car will speed up and not stop.", "The pedestrian will run across without looking.", "The zebra crossing will disappear."],
  },
  {
    desc: "An illustration shows two boys on one bicycle at night with no lights, riding in the middle of the road.",
    predict: "This is dangerous; a driver may not see them. They should use lights, ride at the side, and one at a time.",
    wrong: ["Nothing is wrong; riding two on a bicycle at night is safe.", "The road will light up by itself.", "The boys will grow wings."],
  },
];

export const readingVisuals: Skill = {
  id: "g5-eng-reading-visuals",
  code: "R.4",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Reading and Interpreting Visuals",
  description: "Interpret road signs, posters, maps, illustrations and mnemonics about road safety, and make predictions from what a visual shows.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-sign", "fill-type", "sort-type", "match-sign", "order-pic", "reason-predict"] as const);

    if (branch === "mc-sign") {
      const s = randChoice(rng, SIGNS);
      const wrong = shuffle(rng, SIGNS.filter((x) => x.sign !== s.sign)).slice(0, 3).map((x) => x.meaning);
      const { choices, correctIndex } = mcFromCluster(rng, s.meaning, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "what this road sign means")}\nThe sign is ${s.sign}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "A triangle usually warns of danger ahead; a red circle usually forbids something or gives a limit; an octagon means stop.",
        explanation: `The sign means: ${s.meaning}.`,
      };
    }

    if (branch === "fill-type") {
      const v = randChoice(rng, VISUAL_TYPES);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the type of visual described"),
        before: `A visual that is ${v.desc} is called a `,
        after: ".",
        correctAnswer: v.type,
        acceptedAnswers: [v.type],
        inputMode: "text",
        hint: "The types are: road sign, map, poster, illustration, mnemonic, chart.",
        explanation: `That is a ${v.type} — ${v.desc}.`,
      };
    }

    if (branch === "sort-type") {
      const pool = shuffle(rng, VISUAL_TYPES).slice(0, 5);
      const items = pool.map((v, i) => ({ id: `v${i}`, label: v.desc }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((v, i) => (correctBucket[`v${i}`] = v.type));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which type of visual each description is"),
        items,
        buckets: pool.map((v) => ({ id: v.type, label: v.type })),
        correctBucket,
        hint: "Ask what job the visual does: give a rule, show a layout, carry a message, show a scene, help you remember, or show numbers.",
        explanation: pool.map((v) => `${v.type}: ${v.desc}`).join("  "),
      };
    }

    if (branch === "match-sign") {
      const pool = shuffle(rng, SIGNS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((s) => ({ id: s.sign, label: s.sign })));
      const targets = shuffle(rng, pool.map((s) => ({ id: s.sign, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      pool.forEach((s) => (correctMap[s.sign] = s.sign));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "road sign to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Use the shape and colour of the sign as your first clue.",
        explanation: pool.map((s) => `${s.sign} → ${s.meaning}`).join("  "),
      };
    }

    if (branch === "order-pic") {
      const strips = [
        ["A child stands on the pavement holding an adult's hand.", "They stop at the kerb and look right, left, then right again.", "When the road is clear, they walk straight across, still looking.", "They reach the other pavement safely."],
        ["A cyclist checks that the bicycle has working lights and brakes.", "She puts on a bright jacket and a helmet.", "She rides on the left, well away from the centre of the road.", "She signals with her arm before turning."],
      ];
      const s = randChoice(rng, strips);
      const items = s.map((t, i) => ({ id: `p${i}`, label: t }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the pictures of this road-safety sequence"),
        instruction: "Click the pictures in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: "Follow the safe steps from start to finish.",
        explanation: `Correct order: ${s.map((t, i) => `${i + 1}. ${t}`).join("  ")}`,
      };
    }

    // reason — predict from a visual
    const pic = randChoice(rng, PICS);
    const { choices, correctIndex } = mcFromCluster(rng, pic.predict, pic.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, pic.desc, "Using the visual, what should we predict or advise?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Read the visual like a story: what is about to happen, and what would keep everyone safe?",
      explanation: pic.predict,
    };
  },
};
