import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, sortTwoSoundsBranch } from "./g5LsShared";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 12.0 Environmental Pollution, sub-strand 12.1 Pronunciation and Vocabulary:
// Speaking Fluency (content from other learning areas); Making a Speech. Focus: sounds /f/ and /v/
// (minimal pairs), speak accurately without hesitation and with expression, use appropriate non-verbal
// cues. See curriculum-reference/grade-5/english.json.

const MINIMAL_PAIRS: { f: string; v: string; meaningF: string; meaningV: string }[] = [
  { f: "fan", v: "van", meaningF: "a thing that moves air to cool you", meaningV: "a large vehicle for carrying goods" },
  { f: "fine", v: "vine", meaningF: "well; of good quality", meaningV: "a climbing plant" },
  { f: "few", v: "view", meaningF: "not many", meaningV: "what you can see from a place" },
  { f: "leaf", v: "leave", meaningF: "a flat green part of a plant", meaningV: "to go away" },
  { f: "safe", v: "save", meaningF: "free from danger", meaningV: "to keep for later" },
  { f: "ferry", v: "very", meaningF: "a boat that carries people across water", meaningV: "to a high degree" },
];

const SPEECH_PARTS = [
  { id: "hook", label: "Opening hook: 'Every plastic bag we drop today is still here in fifty years.'" },
  { id: "topic", label: "State the topic: 'I will talk about how we can reduce pollution at school.'" },
  { id: "points", label: "Two or three clear points, each with an example" },
  { id: "close", label: "Closing: a short call to action — 'Let us start with our own classroom bin.'" },
];

const NONVERBAL = [
  { cue: "stand up straight and face the audience", good: true },
  { cue: "make eye contact around the room", good: true },
  { cue: "use a few hand gestures for the key points", good: true },
  { cue: "pause after an important sentence", good: true },
  { cue: "read the whole speech staring at the paper", good: false },
  { cue: "rock from foot to foot and fiddle with a pen", good: false },
  { cue: "speak in one flat tone with no pauses", good: false },
  { cue: "turn your back to the audience to read a chart", good: false },
];

export const makingASpeech: Skill = {
  id: "g5-eng-ls-making-a-speech",
  code: "LS.12",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Making a Speech: Sounds /f/, /v/ and Delivery",
  description: "Tell apart /f/ and /v/ minimal pairs (fan/van, fine/vine), plan the parts of a short speech about pollution, and use non-verbal cues to speak with confidence and expression.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-sort", "pair-mc", "pair-fill", "pair-match", "speech-order", "nonverbal-sort"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/f/", "/v/"]);
    if (branch === "sound-sort") return sortTwoSoundsBranch(rng, "/f/", "/v/");

    if (branch === "pair-fill") {
      const p = randChoice(rng, MINIMAL_PAIRS);
      const useF = rng() < 0.5;
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the word (starting with ${useF ? "/f/" : "/v/"}) that means "${useF ? p.meaningF : p.meaningV}"`),
        before: "Word: ",
        after: "",
        correctAnswer: useF ? p.f : p.v,
        acceptedAnswers: [useF ? p.f : p.v],
        inputMode: "text",
        hint: `Its minimal pair is "${useF ? p.v : p.f}" — same sounds except the first one.`,
        explanation: `"${useF ? p.f : p.v}" means "${useF ? p.meaningF : p.meaningV}".`,
      };
    }

    if (branch === "pair-mc") {
      const p = randChoice(rng, MINIMAL_PAIRS);
      const useF = rng() < 0.5;
      const correct = useF ? p.f : p.v;
      const meaning = useF ? p.meaningF : p.meaningV;
      const { choices, correctIndex } = mcFromCluster(rng, correct, [useF ? p.v : p.f], 1);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, `the word that means "${meaning}"`)}`,
        choices,
        correctIndex,
        layout: "row",
        hint: "For /f/, your top teeth touch your bottom lip with no voice. For /v/, the same, but with your voice on.",
        explanation: `"${correct}" means "${meaning}". Its minimal pair "${useF ? p.v : p.f}" sounds almost the same but starts with the other sound.`,
      };
    }

    if (branch === "pair-match") {
      const pool = shuffle(rng, MINIMAL_PAIRS).slice(0, 4);
      const rows = pool.flatMap((p) => [
        { id: `${p.f}`, token: p.f, target: p.meaningF },
        { id: `${p.v}`, token: p.v, target: p.meaningV },
      ]);
      const chosen = shuffle(rng, rows).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.id, label: r.token })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.id, label: r.target })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((r) => (correctMap[r.id] = r.id));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "word to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "The /f/ word and the /v/ word of a pair mean completely different things.",
        explanation: pool.map((p) => `${p.f} = ${p.meaningF}; ${p.v} = ${p.meaningV}`).join("  "),
      };
    }

    if (branch === "speech-order") {
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the parts of a short speech about reducing pollution"),
        instruction: "Click the parts in the correct order.",
        items: shuffle(rng, SPEECH_PARTS.map((s) => ({ id: s.id, label: s.label }))),
        correctOrder: ["hook", "topic", "points", "close"],
        hint: "Catch attention, say your topic, give your points, then call the audience to act.",
        explanation: "Opening hook → state the topic → clear points with examples → closing call to action.",
      };
    }

    // nonverbal sort / reason
    if (rng() < 0.5) {
      const pool = shuffle(rng, NONVERBAL).slice(0, 6);
      const items = pool.map((n, i) => ({ id: `n${i}`, label: n.cue }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((n, i) => (correctBucket[`n${i}`] = n.good ? "good" : "poor"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each non-verbal cue helps a speech"),
        items,
        buckets: [
          { id: "good", label: "Helps the speech" },
          { id: "poor", label: "Weakens the speech" },
        ],
        correctBucket,
        hint: "Good cues connect you with the audience; poor cues show nerves or hide your face.",
        explanation: "Good: upright posture, eye contact, purposeful gestures, pauses. Poor: reading down, fidgeting, flat tone, turning away.",
      };
    }
    const n = randChoice(rng, NONVERBAL.filter((x) => !x.good));
    const fix = NONVERBAL.filter((x) => x.good);
    const correct = randChoice(rng, fix).cue;
    const { choices, correctIndex } = mcFromCluster(rng, correct, shuffle(rng, fix.filter((x) => x.cue !== correct)).slice(0, 2).map((x) => x.cue).concat([n.cue]), 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `${name(rng)} is about to give a speech but keeps ${n.cue}.`, "What should they do instead?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Replace the nervous habit with a cue that connects you to the audience.",
      explanation: `A better cue is to ${correct}.`,
    };
  },
};
