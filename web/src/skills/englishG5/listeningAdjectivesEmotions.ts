import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, soundFillBranch } from "./g5LsShared";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 5.0 Traditional Foods, sub-strand 5.1 Listening Comprehension — Sounds;
// Adjectives. Focus: sound /e/, use adjectives to describe foods orally, display varied emotions and
// feelings during an oral presentation. See curriculum-reference/grade-5/english.json.

const FOOD_ADJ: { food: string; adj: string; kind: "taste" | "texture"; wrong: string[] }[] = [
  { food: "ripe mango", adj: "sweet", kind: "taste", wrong: ["bitter", "sour", "salty"] },
  { food: "fresh chapati", adj: "soft", kind: "texture", wrong: ["stale", "hard", "burnt"] },
  { food: "hot pilau", adj: "spicy", kind: "taste", wrong: ["bland", "cold", "raw"] },
  { food: "boiled arrow root", adj: "starchy", kind: "texture", wrong: ["fizzy", "crunchy", "creamy"] },
  { food: "roasted maize", adj: "smoky", kind: "taste", wrong: ["watery", "sugary", "slimy"] },
  { food: "sour milk", adj: "tangy", kind: "taste", wrong: ["sweet", "dry", "crispy"] },
  { food: "githeri", adj: "filling", kind: "texture", wrong: ["light", "empty", "sharp"] },
  { food: "wild berries", adj: "juicy", kind: "texture", wrong: ["dusty", "chalky", "stiff"] },
];

const EMOTIONS: { line: string; feeling: string }[] = [
  { line: "\"This is the BEST ugali I have ever tasted!\" she said, eyes shining.", feeling: "excited / delighted" },
  { line: "\"I... I have never cooked for so many people before,\" he mumbled, looking down.", feeling: "nervous" },
  { line: "\"We always ate this together when Grandmother was alive,\" she said quietly, blinking.", feeling: "sad / wistful" },
  { line: "\"Taste it — go on! You will love it!\" he grinned, pushing the plate forward.", feeling: "enthusiastic" },
  { line: "\"Our community's food deserves respect,\" she said firmly, standing tall.", feeling: "proud" },
];

export const listeningAdjectivesEmotions: Skill = {
  id: "g5-eng-ls-listening-adjectives-emotions",
  code: "LS.5",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Listening: Sound /e/, Describing Food, and Showing Feelings",
  description: "Recognise the sound /e/, choose adjectives that describe traditional foods, and read the emotion in a speaker's words during an oral presentation.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-fill", "adj-mc", "adj-fill", "adj-sort", "emotion-match", "reason"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/e/"]);
    if (branch === "sound-fill") return soundFillBranch(rng, "/e/", "recipe");

    if (branch === "adj-sort") {
      const pool = shuffle(rng, FOOD_ADJ).slice(0, 6);
      const items = pool.map((f, i) => ({ id: `f${i}`, label: f.adj }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each adjective describes a TASTE or a TEXTURE"),
        items,
        buckets: [
          { id: "taste", label: "Taste (how it tastes)" },
          { id: "texture", label: "Texture (how it feels in the mouth)" },
        ],
        correctBucket,
        hint: "Taste words: sweet, spicy, tangy, smoky. Texture words: soft, starchy, juicy, filling.",
        explanation: "Some adjectives describe taste (sweet, spicy), others describe texture (soft, crunchy, juicy).",
      };
    }

    if (branch === "adj-mc") {
      const f = randChoice(rng, FOOD_ADJ);
      const { choices, correctIndex } = mcFromCluster(rng, f.adj, f.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, `the adjective that best describes "${f.food}"`)}`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Think about how the food really tastes or feels in the mouth.",
        explanation: `"${f.adj}" describes ${f.food} well. The other words describe different tastes or textures.`,
      };
    }

    if (branch === "adj-fill") {
      const f = randChoice(rng, FOOD_ADJ);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "an adjective that describes this food"),
        before: `The ${f.food} was `,
        after: ".",
        correctAnswer: f.adj,
        acceptedAnswers: [f.adj],
        inputMode: "text",
        hint: "An adjective describes a noun — here, how the food tastes or feels.",
        explanation: `A good adjective here is "${f.adj}".`,
      };
    }

    if (branch === "emotion-match") {
      const pool = shuffle(rng, EMOTIONS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((e, i) => ({ id: `p${i}`, label: e.line })));
      const targets = shuffle(rng, pool.map((e, i) => ({ id: `p${i}`, label: e.feeling })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_e, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "spoken line to the feeling behind it"),
        tokens,
        targets,
        correctMap,
        hint: "Listen for volume, choice of words, and the actions described alongside the speech.",
        explanation: pool.map((e) => `${e.line} → ${e.feeling}`).join("  "),
      };
    }

    // reason / ordering
    if (rng() < 0.5) {
      const e = randChoice(rng, EMOTIONS);
      const wrong = shuffle(rng, EMOTIONS.filter((x) => x.feeling !== e.feeling)).slice(0, 3).map((x) => x.feeling);
      const { choices, correctIndex } = mcFromCluster(rng, e.feeling, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `During a talk about traditional foods, a speaker says: ${e.line}`, "What feeling is the speaker showing?"),
        choices,
        correctIndex,
        layout: "row",
        hint: "The words AND the described actions together show the feeling.",
        explanation: `The speaker sounds ${e.feeling}.`,
      };
    }
    const items = [
      { id: "s1", label: "Choose a food from your community" },
      { id: "s2", label: "List adjectives for its taste, smell and texture" },
      { id: "s3", label: "Practise saying the description with feeling" },
      { id: "s4", label: "Present it to the class, showing enthusiasm" },
    ];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "the steps for preparing a short spoken description of a food"),
      instruction: "Click the steps in a sensible order.",
      items: shuffle(rng, items),
      correctOrder: ["s1", "s2", "s3", "s4"],
      hint: "Pick the food, gather describing words, rehearse with feeling, then present.",
      explanation: "Choose the food → list adjectives → practise with expression → present with feeling.",
    };
  },
};
