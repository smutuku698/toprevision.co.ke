import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, sortTwoSoundsBranch } from "./g5LsShared";
import { fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 8.0 The Farm-Cash Crops, sub-strand 8.1 Pronunciation and Vocabulary —
// Oral Narrative Featuring Proverbs and Sayings. Focus: sounds /k/ and /g/, list proverbs and sayings,
// use them appropriately in oral communication. See curriculum-reference/grade-5/english.json.

const PROVERBS: { proverb: string; meaning: string; fits: string }[] = [
  { proverb: "Unity is strength", meaning: "people are stronger when they work together", fits: "the cooperative members pool their coffee and get a better price than any one farmer alone" },
  { proverb: "The early bird catches the worm", meaning: "those who start early get the best chance", fits: "the farmer who reaches the market at dawn sells out before the crowds arrive" },
  { proverb: "A bad workman quarrels with his tools", meaning: "unskilled people blame their equipment for poor work", fits: "the labourer with crooked rows says the hoe is the wrong shape" },
  { proverb: "Make hay while the sun shines", meaning: "use a good opportunity while it lasts", fits: "the family harvests all the dry wheat before the rains begin" },
  { proverb: "Many hands make light work", meaning: "a job is easier when many people help", fits: "the whole village turns out to weed the school garden in one morning" },
  { proverb: "Do not count your chickens before they hatch", meaning: "do not depend on something before it happens", fits: "the farmer plans how to spend money from a crop that is not yet harvested" },
];
const SAYINGS: { saying: string; meaning: string }[] = [
  { saying: "little by little", meaning: "slowly, in small steps" },
  { saying: "hand in hand", meaning: "closely together; at the same time" },
  { saying: "rain or shine", meaning: "whatever the weather; no matter what" },
  { saying: "from dawn to dusk", meaning: "all day long" },
];

export const proverbsSayings: Skill = {
  id: "g5-eng-ls-proverbs-sayings",
  code: "LS.8",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Proverbs and Sayings; Sounds /k/ and /g/",
  description: "Recognise the sounds /k/ and /g/, explain the meaning of common proverbs and sayings, and choose the proverb that fits a farm situation.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-sort", "fit-mc", "meaning-fill", "match-meaning", "order"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/k/", "/g/"]);
    if (branch === "sound-sort") return sortTwoSoundsBranch(rng, "/k/", "/g/");

    if (branch === "fit-mc") {
      const p = randChoice(rng, PROVERBS);
      const wrong = shuffle(rng, PROVERBS.filter((x) => x.proverb !== p.proverb)).slice(0, 3).map((x) => x.proverb);
      const { choices, correctIndex } = mcFromCluster(rng, p.proverb, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `On the farm, ${p.fits}.`, "Which proverb fits this situation?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Match what happens in the situation to the lesson each proverb teaches.",
        explanation: `"${p.proverb}" — it means ${p.meaning}, which is what the situation shows.`,
      };
    }

    if (branch === "meaning-fill") {
      const p = randChoice(rng, PROVERBS);
      const words = p.proverb.split(" ");
      const idx = words.length - 1;
      const answer = words[idx].replace(/[.,]/g, "");
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the missing word in the proverb (meaning: "${p.meaning}")`),
        before: `"${words.slice(0, idx).join(" ")} `,
        after: `"`,
        correctAnswer: answer,
        acceptedAnswers: [answer, answer.toLowerCase()],
        inputMode: "text",
        hint: `The whole proverb means: ${p.meaning}.`,
        explanation: `The proverb is "${p.proverb}".`,
      };
    }

    if (branch === "match-meaning") {
      const useProverbs = rng() < 0.5;
      const pool: { text: string; meaning: string }[] = useProverbs
        ? shuffle(rng, PROVERBS).slice(0, 5).map((p) => ({ text: p.proverb, meaning: p.meaning }))
        : shuffle(rng, SAYINGS).slice(0, 4).map((s) => ({ text: s.saying, meaning: s.meaning }));
      const tokens = shuffle(rng, pool.map((x) => ({ id: x.text, label: x.text })));
      const targets = shuffle(rng, pool.map((x) => ({ id: x.text, label: x.meaning })));
      const correctMap: Record<string, string> = {};
      pool.forEach((x) => (correctMap[x.text] = x.text));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, `${useProverbs ? "proverb" : "saying"} to its meaning`),
        tokens,
        targets,
        correctMap,
        hint: "Say each one, then explain it in plain words.",
        explanation: pool.map((x) => `"${x.text}" = ${x.meaning}`).join("  "),
      };
    }

    // sort or order
    if (rng() < 0.5) {
      const provs = shuffle(rng, PROVERBS).slice(0, 3).map((p, i) => ({ id: `p${i}`, label: p.proverb, k: "proverb" }));
      const says = shuffle(rng, SAYINGS).slice(0, 3).map((s, i) => ({ id: `s${i}`, label: s.saying, k: "saying" }));
      const items = shuffle(rng, [...provs, ...says]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.k));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each is a full proverb or a short saying"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "proverb", label: "Proverb (a full sentence with a lesson)" },
          { id: "saying", label: "Saying (a short set phrase)" },
        ],
        correctBucket,
        hint: "A proverb is a whole sentence that teaches a lesson. A saying is a short fixed phrase used inside a sentence.",
        explanation: "Proverb: 'Unity is strength.' Saying: 'little by little', 'rain or shine'.",
      };
    }
    const p = randChoice(rng, PROVERBS);
    const words = p.proverb.split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, `the words to make a proverb (meaning: "${p.meaning}")`),
      instruction: "Click the words in the correct order.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `The proverb means: ${p.meaning}.`,
      explanation: `Proverb: "${p.proverb}"`,
    };
  },
};
