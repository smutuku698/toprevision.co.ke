import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, sortTwoSoundsBranch } from "./g5LsShared";
import { fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 13.0 Money - Savings and Banking, sub-strand 13.1 Pronunciation and
// Vocabulary — Intensive Listening (dialogue containing similes). Focus: sounds /m/, /n/, /ŋ/; digraphs
// and consonant clusters; identify and use similes; interpret a speaker's feelings.
// See curriculum-reference/grade-5/english.json.

const DIGRAPHS = [
  { word: "cash", digraph: "sh" }, { word: "cheque", digraph: "ch" }, { word: "bank", digraph: "nk" },
  { word: "thrift", digraph: "th" }, { word: "phone", digraph: "ph" }, { word: "banking", digraph: "ng" },
  { word: "shilling", digraph: "sh" }, { word: "change", digraph: "ch" },
];
const CLUSTERS = [
  { word: "strong", cluster: "str" }, { word: "spend", cluster: "sp" }, { word: "credit", cluster: "cr" },
  { word: "branch", cluster: "br" }, { word: "trust", cluster: "tr" }, { word: "plan", cluster: "pl" },
  { word: "small", cluster: "sm" }, { word: "start", cluster: "st" },
];

const SIMILES: { simile: string; meaning: string }[] = [
  { simile: "as cheap as dirt", meaning: "costing very little" },
  { simile: "as good as gold", meaning: "very well behaved or very reliable" },
  { simile: "as safe as houses", meaning: "completely safe" },
  { simile: "as poor as a church mouse", meaning: "having almost no money" },
  { simile: "spending like water", meaning: "spending money carelessly and fast" },
  { simile: "saving every penny", meaning: "being very careful with money" },
];

export const intensiveListeningSimiles: Skill = {
  id: "g5-eng-ls-intensive-listening-similes",
  code: "LS.13",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Intensive Listening: Sounds /m/, /n/, /ŋ/, Digraphs, Clusters and Similes",
  description: "Recognise the sounds /m/, /n/ and /ŋ/, pick out consonant digraphs and clusters in words about money, and identify similes and their meanings in a dialogue.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-sort", "digraph-cluster-sort", "simile-fill", "simile-match", "reason"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/m/", "/n/", "/ŋ/"]);
    if (branch === "sound-sort") return sortTwoSoundsBranch(rng, "/n/", "/ŋ/");

    if (branch === "digraph-cluster-sort") {
      const dg = shuffle(rng, DIGRAPHS).slice(0, 3).map((d, i) => ({ id: `d${i}`, label: d.word, k: "digraph" }));
      const cl = shuffle(rng, CLUSTERS).slice(0, 3).map((c, i) => ({ id: `c${i}`, label: c.word, k: "cluster" }));
      const items = shuffle(rng, [...dg, ...cl]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.k));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each word has a consonant DIGRAPH (two letters, one new sound) or a consonant CLUSTER (each letter still sounded)"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "digraph", label: "Digraph (sh, ch, th, ph, ng — one sound)" },
          { id: "cluster", label: "Cluster (str, sp, cr, br — sounds blended)" },
        ],
        correctBucket,
        hint: "In a digraph, two letters make ONE brand-new sound. In a cluster, you can still hear each consonant.",
        explanation: "Digraphs: cash (sh), cheque (ch), phone (ph), banking (ng). Clusters: strong (str), spend (sp), credit (cr), branch (br).",
      };
    }

    if (branch === "simile-fill") {
      const s = randChoice(rng, SIMILES);
      const words = s.simile.split(" ");
      const idx = words.length - 1;
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the missing word in the simile (meaning: "${s.meaning}")`),
        before: `"${words.slice(0, idx).join(" ")} `,
        after: `"`,
        correctAnswer: words[idx].replace(/[.,]/g, ""),
        acceptedAnswers: [words[idx].replace(/[.,]/g, "")],
        inputMode: "text",
        hint: `The whole simile means: ${s.meaning}.`,
        explanation: `The simile is "${s.simile}".`,
      };
    }

    if (branch === "simile-match") {
      const pool = shuffle(rng, SIMILES).slice(0, 5);
      const tokens = shuffle(rng, pool.map((s) => ({ id: s.simile, label: s.simile })));
      const targets = shuffle(rng, pool.map((s) => ({ id: s.simile, label: s.meaning })));
      const correctMap: Record<string, string> = {};
      pool.forEach((s) => (correctMap[s.simile] = s.simile));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "simile to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "A simile compares two things — work out what the comparison is really saying.",
        explanation: pool.map((s) => `"${s.simile}" = ${s.meaning}`).join("  "),
      };
    }

    // reason (mc or ordering)
    if (rng() < 0.5) {
      const s = randChoice(rng, SIMILES);
      const wrong = shuffle(rng, SIMILES.filter((x) => x.simile !== s.simile)).slice(0, 3).map((x) => x.meaning);
      const { choices, correctIndex } = mcFromCluster(rng, s.meaning, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `In a dialogue at the bank, someone says: "He is ${s.simile.startsWith("as") ? s.simile : s.simile}."`, "What does the simile mean?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about the picture the simile paints, then say it plainly.",
        explanation: `"${s.simile}" means ${s.meaning}.`,
      };
    }
    const d = randChoice(rng, DIGRAPHS);
    const items = d.word.split("").map((ch, i) => ({ id: `${i}-${ch}`, label: ch }));
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, `the letters to spell "${d.word}" (it contains the digraph "${d.digraph}")`),
      instruction: "Click the letters in the correct order.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `The two letters "${d.digraph}" stay together and make one sound.`,
      explanation: `The word is "${d.word}" — the digraph "${d.digraph}" makes a single sound.`,
    };
  },
};
