import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 8.0 The Farm-Cash Crops, sub-strand 8.4 Creative Writing:
// Narrative Composition featuring Similes and Proverbs. See curriculum-reference/grade-5/english.json.

const SIMILES: { phrase: string; completion: string; meaning: string }[] = [
  { phrase: "as busy as a ___", completion: "bee", meaning: "working very hard, without stopping" },
  { phrase: "as busy as an ___", completion: "ant", meaning: "always doing something; never idle" },
  { phrase: "as faithful as a ___", completion: "dog", meaning: "very loyal and dependable" },
  { phrase: "as strong as a ___", completion: "horse", meaning: "having a lot of physical strength" },
  { phrase: "as free as a ___", completion: "bird", meaning: "able to do as you please" },
  { phrase: "as proud as a ___", completion: "peacock", meaning: "showing off; very pleased with oneself" },
  { phrase: "as fast as a ___", completion: "hare", meaning: "moving very quickly" },
  { phrase: "as sweet as ___", completion: "honey", meaning: "very pleasant or kind" },
];

const PROVERBS: { proverb: string; meaning: string; fits: string }[] = [
  { proverb: "Unity is strength", meaning: "people achieve more when they work together", fits: "the cooperative members bring in the coffee harvest together, faster than any one farmer could alone" },
  { proverb: "The early bird catches the worm", meaning: "those who start early get the best chance", fits: "the farmer who reaches the market at dawn sells all her produce before the crowds arrive" },
  { proverb: "A bad workman quarrels with his tools", meaning: "people who lack skill blame their equipment for their poor work", fits: "the labourer whose rows are crooked complains that the hoe is the wrong shape" },
  { proverb: "Make hay while the sun shines", meaning: "use a good chance while it lasts", fits: "the family harvests all the dry wheat quickly before the rains come" },
  { proverb: "Charity begins at home", meaning: "help your own family first", fits: "before selling the maize, the farmer sets aside enough to feed his household" },
];

const NEITHER = [
  "The tea plantation covers two hundred acres.",
  "We loaded the sisal onto the cart.",
  "The seedlings were watered every morning.",
  "Coffee is a cash crop grown in the highlands.",
];

export const narrativeSimilesProverbs: Skill = {
  id: "g5-eng-writing-narrative-similes-proverbs",
  code: "W.8",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Narrative Writing with Similes and Proverbs",
  description: "Identify and complete similes (as...as, like) and proverbs, match them to their meanings, and choose the proverb that fits a farm situation.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-fit-proverb", "fill-simile", "sort-type", "match-meaning", "order", "reason"] as const);

    if (branch === "mc-fit-proverb") {
      const pr = randChoice(rng, PROVERBS);
      const { choices, correctIndex } = mcFromCluster(rng, pr.proverb, shuffle(rng, PROVERBS.filter((x) => x.proverb !== pr.proverb)).slice(0, 3).map((x) => x.proverb), 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `On the farm, ${pr.fits}.`, "Which proverb fits this best?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Match what actually happens in the situation to the lesson each proverb teaches.",
        explanation: `"${pr.proverb}" — it means ${pr.meaning}, which is exactly what the situation shows.`,
      };
    }

    if (branch === "fill-simile") {
      const s = randChoice(rng, SIMILES);
      const [before, after] = s.phrase.split("___");
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the word that completes this simile (meaning: ${s.meaning})`),
        before,
        after,
        correctAnswer: s.completion,
        acceptedAnswers: [s.completion],
        inputMode: "text",
        hint: "A simile compares two things using 'as...as' or 'like'. Think of the animal or thing usually used here.",
        explanation: `"${s.phrase.replace("___", s.completion)}" means ${s.meaning}.`,
      };
    }

    if (branch === "sort-type") {
      const sims = shuffle(rng, SIMILES).slice(0, 2).map((s, i) => ({ id: `s${i}`, label: s.phrase.replace("___", s.completion), kind: "simile" }));
      const provs = shuffle(rng, PROVERBS).slice(0, 2).map((p, i) => ({ id: `p${i}`, label: p.proverb, kind: "proverb" }));
      const neith = shuffle(rng, NEITHER).slice(0, 2).map((n, i) => ({ id: `n${i}`, label: n, kind: "neither" }));
      const items = shuffle(rng, [...sims, ...provs, ...neith]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each expression is a simile, a proverb, or plain description"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "simile", label: "Simile (as...as / like)" },
          { id: "proverb", label: "Proverb (a saying with a lesson)" },
          { id: "neither", label: "Plain description" },
        ],
        correctBucket,
        hint: "A simile compares two things. A proverb teaches a general truth. Plain description just states a fact.",
        explanation: "Simile: 'as busy as a bee'. Proverb: 'Unity is strength'. Plain: 'The tea plantation covers two hundred acres.'",
      };
    }

    if (branch === "match-meaning") {
      const useProverbs = rng() < 0.5;
      const pool: { text: string; meaning: string }[] = useProverbs
        ? shuffle(rng, PROVERBS).slice(0, 5).map((p) => ({ text: p.proverb, meaning: p.meaning }))
        : shuffle(rng, SIMILES).slice(0, 5).map((s) => ({ text: s.phrase.replace("___", s.completion), meaning: s.meaning }));
      const tokens = shuffle(rng, pool.map((x) => ({ id: x.text, label: x.text })));
      const targets = shuffle(rng, pool.map((x) => ({ id: x.text, label: x.meaning })));
      const correctMap: Record<string, string> = {};
      pool.forEach((x) => (correctMap[x.text] = x.text));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, `${useProverbs ? "proverb" : "simile"} to its meaning`),
        tokens,
        targets,
        correctMap,
        hint: "Say the expression, then explain it in your own plain words.",
        explanation: pool.map((x) => `"${x.text}" = ${x.meaning}`).join("  "),
      };
    }

    if (branch === "order") {
      const s = randChoice(rng, SIMILES);
      const subj = randChoice(rng, ["The harvest workers", "My grandfather", "The young farmhand", "The cooperative team"]);
      const sentence = `${subj} were ${s.phrase.replace("___", s.completion)} all morning`;
      const words = sentence.split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a sentence that contains a simile"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The simile is "${s.phrase.replace("___", s.completion)}".`,
        explanation: `Correct sentence: "${sentence}."`,
      };
    }

    // reason — Evaluate: which sentence correctly USES a simile (not just mentions animals)?
    const s = randChoice(rng, SIMILES);
    const correct = `The labourer worked ${s.phrase.replace("___", s.completion)}, and the field was cleared by noon.`;
    const wrong = [
      `The labourer worked hard, and a ${s.completion} flew past the field.`,
      `The labourer was ${s.completion} the field by noon.`,
      `The labourer, ${s.completion}, cleared the field by noon.`,
    ];
    const { choices, correctIndex } = mcFromCluster(rng, correct, wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, "A pupil wants to add a simile to a farm story.", "Which sentence uses a simile correctly?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "A simile compares one thing to another using 'as...as' or 'like' — not just naming an animal in the sentence.",
      explanation: `"${correct}" is correct — it compares the worker to something using "as...as". The others just put the word "${s.completion}" in the sentence without making a comparison.`,
    };
  },
};
