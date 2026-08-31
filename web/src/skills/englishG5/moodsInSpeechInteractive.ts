import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, sortTwoSoundsBranch } from "./g5LsShared";
import { fillPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 10.0 Leisure Time Activities, sub-strand 10.1 Pronunciation and Vocabulary:
// Interactive Listening — Choral verse; Conversation Narrative. Focus: sounds /s/ and /z/, identify
// different moods in a narrative or choral verse, interrupt politely, listen interactively.
// See curriculum-reference/grade-5/english.json.

const MOODS: { text: string; mood: string }[] = [
  { text: "\"We're going to the lake! Grab your things — hurry!\" the whole group shouted, laughing.", mood: "excited" },
  { text: "\"The rain has ruined the picnic,\" she murmured, staring at the grey sky.", mood: "disappointed" },
  { text: "\"Shh... listen. Do you hear the birds? Isn't it lovely here?\" he whispered.", mood: "calm / peaceful" },
  { text: "\"Who took my football? Someone had better own up,\" he snapped.", mood: "angry" },
  { text: "\"I'm not sure I can dive from that height,\" she said, biting her lip.", mood: "nervous / afraid" },
  { text: "\"I finally reached the top of the hill — look at that view!\" she beamed.", mood: "proud / triumphant" },
];

const CHORAL = [
  { line: "Slowly, slowly, up the hill,", mood: "gentle, unhurried" },
  { line: "Faster, faster, down we spill!", mood: "lively, energetic" },
  { line: "Sit and rest beside the stream,", mood: "restful, quiet" },
  { line: "Free as birds — or so it seems.", mood: "joyful, light" },
];

export const moodsInSpeechInteractive: Skill = {
  id: "g5-eng-ls-moods-in-speech-interactive",
  code: "LS.10",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Interactive Listening: Moods in a Narrative or Choral Verse",
  description: "Recognise the sounds /s/ and /z/, identify the mood in what a speaker says or in a line of a choral verse, and interrupt a conversation politely.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-sort", "mood-mc", "mood-match", "choral-match", "reason"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/s/", "/z/"]);
    if (branch === "sound-sort") return sortTwoSoundsBranch(rng, "/s/", "/z/");

    if (branch === "mood-mc") {
      const m = randChoice(rng, MOODS);
      const wrong = shuffle(rng, MOODS.filter((x) => x.mood !== m.mood)).slice(0, 3).map((x) => x.mood);
      const { choices, correctIndex } = mcFromCluster(rng, m.mood, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `In a story, a character says: ${m.text}`, "What is the mood here?"),
        choices,
        correctIndex,
        layout: "row",
        hint: "Use the words, the punctuation, and the described actions together.",
        explanation: `The mood is ${m.mood}.`,
      };
    }

    if (branch === "mood-match") {
      const pool = shuffle(rng, MOODS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((m, i) => ({ id: `p${i}`, label: m.text })));
      const targets = shuffle(rng, pool.map((m, i) => ({ id: `p${i}`, label: m.mood })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_m, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "spoken line to its mood"),
        tokens,
        targets,
        correctMap,
        hint: "Listen for shouting, whispering, snapping, murmuring — each carries a mood.",
        explanation: pool.map((m) => `${m.text} → ${m.mood}`).join("  "),
      };
    }

    if (branch === "choral-match") {
      const tokens = shuffle(rng, CHORAL.map((c) => ({ id: c.line, label: c.line })));
      const targets = shuffle(rng, CHORAL.map((c) => ({ id: c.line, label: c.mood })));
      const correctMap: Record<string, string> = {};
      CHORAL.forEach((c) => (correctMap[c.line] = c.line));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "line of the choral verse to how it should be said"),
        tokens,
        targets,
        correctMap,
        hint: "Some lines should be said slowly and softly, others fast and loud.",
        explanation: CHORAL.map((c) => `"${c.line}" → ${c.mood}`).join("  "),
      };
    }

    // reason (fill or ordering)
    if (rng() < 0.5) {
      const m = randChoice(rng, MOODS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "one word for the mood of this line"),
        before: `"${m.text}"\nMood: `,
        after: "",
        correctAnswer: m.mood.split(" ")[0].replace("/", ""),
        acceptedAnswers: m.mood.split(/[ /]+/).filter(Boolean),
        inputMode: "text",
        hint: "Give a single feeling word.",
        explanation: `The mood is ${m.mood}.`,
      };
    }
    const steps = [
      { id: "s1", label: "Listen carefully to the whole line or turn" },
      { id: "s2", label: "Wait for the speaker to pause" },
      { id: "s3", label: "Say 'Excuse me, may I come in here?'" },
      { id: "s4", label: "Add your point, then let the speaker continue" },
    ];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "the steps to join a conversation politely during a group discussion"),
      instruction: "Click the steps in the correct order.",
      items: shuffle(rng, steps),
      correctOrder: ["s1", "s2", "s3", "s4"],
      hint: "Listen, wait for a pause, ask to come in, then speak briefly.",
      explanation: "Listen → wait for a pause → ask politely to come in → make your point and hand back the turn.",
    };
  },
};
