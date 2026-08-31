import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, sortTwoSoundsBranch, soundFillBranch } from "./g5LsShared";
import { sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 7.0 Learning Through Technology, sub-strand 7.1 Pronunciation and
// Vocabulary — Interactive Listening. Focus: sound /ə/ and diphthongs /ɪə/, /eɪ/; interrupt a
// conversation politely; use words and non-verbal cues to express moods; listen interactively.
// See curriculum-reference/grade-5/english.json.

const POLITE_INTERRUPT = [
  "Excuse me, may I add something?",
  "Sorry to interrupt, but...",
  "If I may say something here...",
  "Can I come in on that point?",
  "Pardon me for jumping in, but...",
  "May I ask a quick question?",
];
const RUDE_INTERRUPT = [
  "No, you're wrong, listen to me.",
  "Stop talking, it's my turn.",
  "Whatever. Anyway...",
  "That's boring, let me talk.",
];

const MOODS: { line: string; mood: string }[] = [
  { line: "\"At last, the video is loading!\" (grinning, leaning forward)", mood: "relieved / pleased" },
  { line: "\"The bundle is finished again,\" (sighing, shoulders dropping)", mood: "frustrated" },
  { line: "\"Wait — is that how you save a file? Show me!\" (eyes wide, sitting up)", mood: "curious / eager" },
  { line: "\"I don't think I can do this on my own,\" (voice low, looking away)", mood: "unsure / worried" },
  { line: "\"I fixed the password by myself!\" (chin up, smiling)", mood: "proud" },
];

export const interactiveListeningInterruptions: Skill = {
  id: "g5-eng-ls-interactive-listening-interruptions",
  code: "LS.7",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Interactive Listening: Polite Interruptions and Moods",
  description: "Recognise the sound /ə/ and diphthongs /ɪə/ and /eɪ/, interrupt a conversation politely, and read a speaker's mood from words and non-verbal cues.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-alt", "interrupt-sort", "interrupt-mc", "mood-match", "reason"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/ə/", "/ɪə/", "/eɪ/"]);
    if (branch === "sound-alt") return rng() < 0.5 ? sortTwoSoundsBranch(rng, "/ɪə/", "/eɪ/") : soundFillBranch(rng, randChoice(rng, ["/ə/", "/ɪə/", "/eɪ/"]), "email");

    if (branch === "interrupt-sort") {
      const p = shuffle(rng, POLITE_INTERRUPT).slice(0, 3).map((t, i) => ({ id: `p${i}`, label: t, k: "polite" }));
      const r = shuffle(rng, RUDE_INTERRUPT).slice(0, 3).map((t, i) => ({ id: `r${i}`, label: t, k: "rude" }));
      const items = shuffle(rng, [...p, ...r]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.k));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each way of joining a conversation is polite or rude"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "polite", label: "Polite interruption" },
          { id: "rude", label: "Rude interruption" },
        ],
        correctBucket,
        hint: "A polite interruption says 'excuse me' or 'sorry to interrupt' and asks to come in. A rude one talks over the other person.",
        explanation: "Polite: 'Excuse me, may I add something?'. Rude: 'Stop talking, it's my turn.'",
      };
    }

    if (branch === "interrupt-mc") {
      const correct = randChoice(rng, POLITE_INTERRUPT);
      const { choices, correctIndex } = mcFromCluster(rng, correct, shuffle(rng, RUDE_INTERRUPT).slice(0, 3), 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, "Two friends are talking about how to attach a file, and you have a useful idea.", "How do you politely join in?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Wait for a small pause, then ask to come in before you speak.",
        explanation: `"${correct}" lets you join without cutting the speaker off rudely.`,
      };
    }

    if (branch === "mood-match") {
      const pool = shuffle(rng, MOODS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((m, i) => ({ id: `p${i}`, label: m.line })));
      const targets = shuffle(rng, pool.map((m, i) => ({ id: `p${i}`, label: m.mood })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_m, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "spoken line and body language to the mood"),
        tokens,
        targets,
        correctMap,
        hint: "Use the words and the actions in brackets together.",
        explanation: pool.map((m) => `${m.line} → ${m.mood}`).join("  "),
      };
    }

    // reason / ordering
    if (rng() < 0.5) {
      const m = randChoice(rng, MOODS);
      const wrong = shuffle(rng, MOODS.filter((x) => x.mood !== m.mood)).slice(0, 3).map((x) => x.mood);
      const { choices, correctIndex } = mcFromCluster(rng, m.mood, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `A classmate says: ${m.line}`, "What mood is the classmate in?"),
        choices,
        correctIndex,
        layout: "row",
        hint: "Read the tone of the words and the body language together.",
        explanation: `The classmate sounds ${m.mood}.`,
      };
    }
    const steps = [
      { id: "s1", label: "Listen fully until the speaker reaches a natural pause" },
      { id: "s2", label: "Say a polite phrase, such as 'Excuse me, may I add something?'" },
      { id: "s3", label: "Make your point briefly" },
      { id: "s4", label: "Hand the turn back to the other speaker" },
    ];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "the steps for interrupting a conversation politely"),
      instruction: "Click the steps in the correct order.",
      items: shuffle(rng, steps),
      correctOrder: ["s1", "s2", "s3", "s4"],
      hint: "Listen, ask to come in, speak briefly, give the turn back.",
      explanation: "Wait for a pause → use a polite phrase → make your point briefly → return the turn.",
    };
  },
};
