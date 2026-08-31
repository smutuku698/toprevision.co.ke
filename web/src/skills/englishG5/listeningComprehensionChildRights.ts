import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, sortTwoSoundsBranch, soundFillBranch } from "./g5LsShared";
import { choosePrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 1.0 Child Rights and Responsibilities, sub-strand 1.1 Listening
// Comprehension. Focus: recognise sounds /ʌ/ and /ɑː/, use theme words/phrases, listen for the main idea
// and specific details, adopt attentive listening. See curriculum-reference/grade-5/english.json.

const ORAL_TEXT = `Listen: "Every child has the right to go to school. Children also have duties. At home, they can keep their room tidy, help fetch water, and care for younger ones. Rights and duties go together. A child who is protected and cared for grows up ready to protect and care for others."`;

const DETAIL_Q: { q: string; answer: string; wrong: string[] }[] = [
  { q: "According to the text, what right does every child have?", answer: "to go to school", wrong: ["to stay up late", "to skip all chores", "to travel alone"] },
  { q: "Name one duty the text mentions.", answer: "keep their room tidy", wrong: ["cook every meal", "pay the rent", "drive the car"] },
  { q: "What does the text say goes together?", answer: "rights and duties", wrong: ["school and sleep", "water and food", "games and prizes"] },
];
const MAIN_IDEA = {
  answer: "Children have both rights and responsibilities, and the two belong together.",
  wrong: ["Children should only think about their rights.", "Fetching water is the most important duty.", "School is not important for children."],
};

const ATTENTIVE: { behaviour: string; good: boolean }[] = [
  { behaviour: "looking at the speaker and nodding", good: true },
  { behaviour: "taking short notes of the key points", good: true },
  { behaviour: "sitting up and facing the speaker", good: true },
  { behaviour: "asking a sensible question at the end", good: true },
  { behaviour: "staring out of the window and yawning", good: false },
  { behaviour: "talking to a friend while the speaker talks", good: false },
  { behaviour: "interrupting before the speaker finishes", good: false },
  { behaviour: "playing with a pencil and looking down", good: false },
];

export const listeningComprehensionChildRights: Skill = {
  id: "g5-eng-ls-listening-comprehension-child-rights",
  code: "LS.1",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Listening Comprehension: Sounds /ʌ/ and /ɑː/; Main Idea and Details",
  description: "Recognise the sounds /ʌ/ and /ɑː/ in words, listen to a short spoken text for its main idea and specific details, and show attentive-listening behaviour.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-sort", "detail-mc", "attentive-sort", "attentive-match", "main-idea"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/ʌ/", "/ɑː/"]);
    if (branch === "sound-sort") {
      return rng() < 0.5 ? sortTwoSoundsBranch(rng, "/ʌ/", "/ɑː/") : soundFillBranch(rng, randChoice(rng, ["/ʌ/", "/ɑː/"]), "duties");
    }

    if (branch === "detail-mc") {
      const d = randChoice(rng, DETAIL_Q);
      const { choices, correctIndex } = mcFromCluster(rng, d.answer, d.wrong, 3);
      return {
        kind: "multiple-choice",
        passage: ORAL_TEXT,
        prompt: `${choosePrompt(rng, "the answer from what you heard")} ${d.q}`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Listen (read) again for the exact detail — it is stated in the text.",
        explanation: `The text says: ${d.answer}.`,
      };
    }

    if (branch === "attentive-sort") {
      const pool = shuffle(rng, ATTENTIVE).slice(0, 6);
      const items = pool.map((a, i) => ({ id: `a${i}`, label: a.behaviour }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((a, i) => (correctBucket[`a${i}`] = a.good ? "good" : "poor"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each behaviour shows attentive listening"),
        items,
        buckets: [
          { id: "good", label: "Attentive listening" },
          { id: "poor", label: "Not listening well" },
        ],
        correctBucket,
        hint: "An attentive listener faces the speaker, keeps still, follows the meaning and waits for their turn.",
        explanation: "Attentive listening: eye contact, sitting still, note-taking, waiting to speak. Poor listening: fidgeting, chatting, interrupting, looking away.",
      };
    }

    if (branch === "attentive-match") {
      const rows = [
        { behaviour: "Making eye contact", why: "shows the speaker you are following" },
        { behaviour: "Taking short notes", why: "helps you remember the key points" },
        { behaviour: "Waiting until the speaker pauses", why: "lets you ask a question without interrupting" },
        { behaviour: "Nodding now and then", why: "shows you understand" },
        { behaviour: "Facing the speaker", why: "helps you hear clearly and stay focused" },
      ];
      const pool = shuffle(rng, rows).slice(0, 5);
      const tokens = shuffle(rng, pool.map((r) => ({ id: r.behaviour, label: r.behaviour })));
      const targets = shuffle(rng, pool.map((r) => ({ id: r.behaviour, label: r.why })));
      const correctMap: Record<string, string> = {};
      pool.forEach((r) => (correctMap[r.behaviour] = r.behaviour));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "listening behaviour to why it helps"),
        tokens,
        targets,
        correctMap,
        hint: "Each good habit has a reason behind it.",
        explanation: pool.map((r) => `${r.behaviour}: ${r.why}`).join("  "),
      };
    }

    // main-idea (as an mc / ordering pick)
    if (rng() < 0.5) {
      const { choices, correctIndex } = mcFromCluster(rng, MAIN_IDEA.answer, MAIN_IDEA.wrong, 3);
      return {
        kind: "multiple-choice",
        passage: ORAL_TEXT,
        prompt: scenarioPrompt(rng, "A friend asks what the talk was mainly about.", "Which answer gives the MAIN idea?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "The main idea covers the whole talk, not one small detail.",
        explanation: `The main idea: ${MAIN_IDEA.answer}`,
      };
    }
    const steps = [
      { id: "s1", label: "Every child has the right to go to school." },
      { id: "s2", label: "Children also have duties, like keeping their room tidy." },
      { id: "s3", label: "Rights and duties go together." },
      { id: "s4", label: "A cared-for child grows up ready to care for others." },
    ];
    return {
      kind: "ordering",
      passage: ORAL_TEXT,
      prompt: orderPrompt(rng, "the ideas in the order the speaker said them"),
      instruction: "Click the ideas in the correct order.",
      items: shuffle(rng, steps),
      correctOrder: ["s1", "s2", "s3", "s4"],
      hint: "Follow the talk from beginning to end.",
      explanation: "The speaker moves from rights, to duties, to the two going together, to the result.",
    };
  },
};
