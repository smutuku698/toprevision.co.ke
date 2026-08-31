import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, sortTwoSoundsBranch, soundFillBranch } from "./g5LsShared";
import { sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 2.0 National Celebrations, sub-strand 2.1 Pronunciation and Vocabulary —
// Listening Comprehension: Dialogue. Focus: sounds /p/ and /b/, interpret a speaker's feelings and
// emotions from non-verbal cues, the importance of non-verbal cues and word choice.
// See curriculum-reference/grade-5/english.json.

const CUES: { cue: string; feeling: string; wrong: string[] }[] = [
  { cue: "She is smiling widely and clapping her hands.", feeling: "happy / excited", wrong: ["angry", "bored", "afraid"] },
  { cue: "He has folded his arms, is frowning and looking away.", feeling: "annoyed / upset", wrong: ["delighted", "relaxed", "surprised"] },
  { cue: "Her eyes are wide, her hand is over her mouth, and she has stepped back.", feeling: "surprised / shocked", wrong: ["sleepy", "proud", "bored"] },
  { cue: "He is slumped in his chair, sighing, staring at the floor.", feeling: "sad / disappointed", wrong: ["thrilled", "cheerful", "eager"] },
  { cue: "She is standing tall, chin up, looking straight at the crowd.", feeling: "confident / proud", wrong: ["frightened", "confused", "tired"] },
  { cue: "He keeps checking the door, tapping his foot, and biting his lip.", feeling: "nervous / worried", wrong: ["calm", "amused", "sleepy"] },
];

const IMPORTANCE: { situation: string; answer: string; wrong: string[] }[] = [
  { situation: "A speaker says the right words but stares at their shoes and mumbles.", answer: "The listeners may not feel the speaker means it, and may stop paying attention.", wrong: ["Nothing changes; only the words matter.", "The listeners will clap louder.", "The speech becomes longer."] },
  { situation: "A pupil reciting a poem on Jamhuri Day looks up, smiles, and uses hand gestures.", answer: "The audience connects with the poem and enjoys it more.", wrong: ["The audience gets confused by the gestures.", "The poem loses its meaning.", "The pupil forgets the words."] },
];

export const pronunciationDialogueNonVerbal: Skill = {
  id: "g5-eng-ls-pronunciation-dialogue-non-verbal",
  code: "LS.2",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Pronunciation /p/, /b/ and Reading Non-Verbal Cues",
  description: "Recognise the sounds /p/ and /b/ in words, and interpret a speaker's feelings from non-verbal cues — face, gestures, posture and eye contact.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-alt", "cue-mc", "cue-match", "cue-sort", "importance"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/p/", "/b/"]);
    if (branch === "sound-alt") return rng() < 0.5 ? sortTwoSoundsBranch(rng, "/p/", "/b/") : soundFillBranch(rng, randChoice(rng, ["/p/", "/b/"]), "parade");

    if (branch === "cue-mc") {
      const c = randChoice(rng, CUES);
      const { choices, correctIndex } = mcFromCluster(rng, c.feeling, c.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, c.cue, "How is the speaker most likely feeling?"),
        choices,
        correctIndex,
        layout: "row",
        hint: "Read the face, the hands and the body all together, not just one clue.",
        explanation: `These non-verbal cues show the speaker is ${c.feeling}.`,
      };
    }

    if (branch === "cue-match") {
      const pool = shuffle(rng, CUES).slice(0, 5);
      const tokens = shuffle(rng, pool.map((c, i) => ({ id: `p${i}`, label: c.cue })));
      const targets = shuffle(rng, pool.map((c, i) => ({ id: `p${i}`, label: c.feeling })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_c, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "set of non-verbal cues to the feeling it shows"),
        tokens,
        targets,
        correctMap,
        hint: "Picture the person and decide what they are feeling.",
        explanation: pool.map((c) => `"${c.cue}" → ${c.feeling}`).join("  "),
      };
    }

    if (branch === "cue-sort") {
      const pool = shuffle(rng, CUES).slice(0, 6);
      const items = pool.map((c, i) => ({ id: `c${i}`, label: c.cue }));
      const buckets = [
        { id: "positive", label: "Positive feeling" },
        { id: "negative", label: "Negative feeling" },
      ];
      const correctBucket: Record<string, string> = {};
      pool.forEach((c, i) => (correctBucket[`c${i}`] = ["happy / excited", "surprised / shocked", "confident / proud"].includes(c.feeling) ? "positive" : "negative"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each set of cues shows a positive or a negative feeling"),
        items,
        buckets,
        correctBucket,
        hint: "Open, upright, smiling body language is usually positive; closed, drooping, tense body language is usually negative.",
        explanation: "Non-verbal cues tell us how a speaker feels even before we hear their words.",
      };
    }

    // importance / ordering
    if (rng() < 0.5) {
      const im = randChoice(rng, IMPORTANCE);
      const { choices, correctIndex } = mcFromCluster(rng, im.answer, im.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, im.situation, "What is the likely effect?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Non-verbal cues and word choice work together — the audience notices when they do not match.",
        explanation: im.answer,
      };
    }
    const steps = [
      { id: "s1", label: "Face the audience and make eye contact" },
      { id: "s2", label: "Speak clearly, and match your tone to the words" },
      { id: "s3", label: "Use hand gestures to show the important points" },
      { id: "s4", label: "Watch the audience's faces and respond to how they react" },
    ];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "the steps a speaker uses non-verbal cues well"),
      instruction: "Click the steps in a sensible order.",
      items: shuffle(rng, steps),
      correctOrder: ["s1", "s2", "s3", "s4"],
      hint: "Connect with the audience first, then support your words, then read the room.",
      explanation: "Good speakers make eye contact, match tone to meaning, gesture for emphasis, and respond to the audience.",
    };
  },
};
