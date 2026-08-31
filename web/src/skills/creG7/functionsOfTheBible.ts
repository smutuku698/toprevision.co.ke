import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// BI.1 "Functions of the Bible" has no natural sequence, spatial layout, or numeric
// quantity in its source content (unordered lists of functions, growth areas, and services)
// — so this skill genuinely supports only 4 QuestionKinds (multiple-choice, categorize,
// click-match, fill-blank), following the same documented-cap pattern as
// creativeArtsSportsG7/introduction.ts.

const MATCH_PROMPTS = [
  "Match each term to its meaning.",
  "Pair each term below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each term to the statement that explains it.",
  "Link each term below to its correct definition.",
  "Match each term to the description that fits it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each example by the area of holistic growth it shows the Bible supporting.",
  "Decide which area of growth each example shows, and sort it there.",
  "Group these examples under the area of holistic growth they show.",
  "Sort each example below into the correct area of growth.",
  "Place each example into the bucket for the area of growth it shows.",
  "Read each example and sort it under the area of growth it best fits.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about the Bible's functions with the right word.",
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Teaching", meaning: "One of the four functions in 2 Timothy 3:16 — instructing believers in truth" },
  { term: "Rebuking", meaning: "One of the four functions in 2 Timothy 3:16 — pointing out wrong belief or behaviour" },
  { term: "Correcting", meaning: "One of the four functions in 2 Timothy 3:16 — showing the way back to what is right" },
  { term: "Training in righteousness", meaning: "One of the four functions in 2 Timothy 3:16 — equipping believers to live rightly" },
  { term: "God-breathed", meaning: "2 Timothy 3:16 describes Scripture this way, showing it comes from God Himself" },
  { term: "Living and active", meaning: "Hebrews 4:12 describes the word of God this way" },
  { term: "Sharper than a sword", meaning: "Hebrews 4:12's picture of how deeply the word of God can penetrate" },
  { term: "Discerns thoughts and intentions", meaning: "Hebrews 4:12 says the word of God can judge the thoughts and intentions of the heart" },
  { term: "Evangelism", meaning: "Using the Bible's message to spread the Good News to others" },
  { term: "Equipped for every good work", meaning: "2 Timothy 3:17's description of what the Bible's functions ultimately prepare a believer for" },
];

interface GrowthItem { text: string; area: "spiritual" | "moral" | "social" | "emotional" | "intellectual" }
const GROWTH_ITEMS: GrowthItem[] = [
  { text: "Praying and worshipping regularly, guided by Scripture", area: "spiritual" },
  { text: "Reading the Psalms to draw closer to God in daily devotion", area: "spiritual" },
  { text: "Confessing wrongdoing and choosing to live by Biblical values", area: "moral" },
  { text: "Refusing to cheat in an exam because of Biblical teaching on honesty", area: "moral" },
  { text: "Resolving a disagreement with a classmate peacefully, guided by Scripture", area: "social" },
  { text: "Serving others in the community, inspired by Biblical teaching on love", area: "social" },
  { text: "Finding comfort in a Bible passage after the loss of a loved one", area: "emotional" },
  { text: "Reading Scripture that brings peace during a time of anxiety", area: "emotional" },
  { text: "Studying and reasoning through what a Bible passage teaches", area: "intellectual" },
  { text: "Using Proverbs to think through and guide a practical decision", area: "intellectual" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s Sunday school teacher in ${place(rng)} uses a Bible passage to help learners understand a new truth about God's character for the first time. Which of the four functions from 2 Timothy 3:16 is this?`,
      correct: "Teaching",
      wrong: ["Rebuking", "Correcting", "Training in righteousness"],
      explanation: "Teaching, per 2 Timothy 3:16, is instructing believers in truth — introducing a new understanding, rather than pointing out a wrong belief or fixing behaviour.",
    };
  },
  (rng) => ({
    prompt: `A pastor in ${place(rng)} reads a Bible passage that directly points out that a common practice in the congregation is wrong. Which of the four functions from 2 Timothy 3:16 is this?`,
    correct: "Rebuking",
    wrong: ["Teaching", "Correcting", "Training in righteousness"],
    explanation: "Rebuking is pointing out wrong belief or behaviour directly — different from teaching (introducing truth) or correcting (showing the way back).",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)}, after being shown a wrongdoing, reads Scripture that shows the specific steps to make things right and change course. Which of the four functions from 2 Timothy 3:16 is this?`,
    correct: "Correcting",
    wrong: ["Teaching", "Rebuking", "Training in righteousness"],
    explanation: "Correcting is showing the way back to what is right after a wrong has been pointed out — moving beyond simply identifying the problem.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} practises daily Scripture study specifically to build the habits and character needed to live rightly going forward. Which of the four functions from 2 Timothy 3:16 is this?`,
    correct: "Training in righteousness",
    wrong: ["Teaching", "Rebuking", "Correcting"],
    explanation: "Training in righteousness is the ongoing equipping to live rightly — building lasting character, not just addressing a single incident.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} finds deep comfort and peace by reading the Psalms during a difficult and anxious time. Which area of holistic growth does this best show the Bible supporting?`,
      correct: "Emotional growth",
      wrong: ["Intellectual growth", "Social growth", "Moral growth"],
      explanation: "Finding comfort and peace during anxiety is an emotional benefit of Scripture, distinct from intellectual understanding, social relationships, or moral behaviour.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} carefully studies a Bible passage, reasoning through what it means and how its parts fit together. Which area of holistic growth does this best show?`,
    correct: "Intellectual growth",
    wrong: ["Emotional growth", "Social growth", "Spiritual growth"],
    explanation: "Careful study and reasoning through Scripture's meaning develops intellectual growth — engaging the mind, distinct from emotional comfort or spiritual devotion.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} uses Biblical teaching on love and service to help resolve a conflict between two classmates. Which area of holistic growth does this best show?`,
    correct: "Social growth",
    wrong: ["Spiritual growth", "Emotional growth", "Intellectual growth"],
    explanation: "Applying Scripture to build peaceful relationships and resolve conflict reflects social growth — how a person relates to others, not primarily their inner emotional or intellectual life.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} refuses to cheat during an exam because of what the Bible teaches about honesty. Which area of holistic growth does this best show?`,
    correct: "Moral growth",
    wrong: ["Social growth", "Intellectual growth", "Emotional growth"],
    explanation: "Choosing honest behaviour because of Scripture's teaching reflects moral growth — the development of right character and conduct.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is inspired by the Bible's message to start volunteering weekly at a children's home. Which of the Bible's functions does this best show inspiring in Christians today?`,
      correct: "Inspiring different forms of service within the local community",
      wrong: ["Rebuking wrongdoing directly and immediately", "Correcting a specific past mistake", "Discerning the thoughts of others without any action"],
      explanation: "The Bible's message inspires many forms of Christian service in the local community, such as volunteering — a real-life outworking of what Scripture teaches.",
    };
  },
  () => ({
    prompt: `Hebrews 4:12 describes the word of God as able to discern the thoughts and intentions of the heart. What does this best illustrate about Scripture?`,
    correct: "The Bible can reveal a person's true motives, not just their outward actions",
    wrong: ["The Bible can only address a person's outward behaviour, never their inner motives", "This verse is only about physical objects, not people's hearts at all", "This verse means the Bible cannot be understood by ordinary readers"],
    explanation: "Hebrews 4:12 pictures Scripture as able to see beneath outward behaviour to a person's real thoughts and motives, which is part of why it is described as 'living and active.'",
  }),
];

export const functionsOfTheBible: Skill = {
  id: "g7-cre-bi-functions-of-the-bible",
  code: "BI.1",
  subjectId: "cre",
  strandId: "g7-cre-bible",
  grade: 7,
  title: "Functions of the Bible",
  description: "The importance of the Bible today (2 Timothy 3:16-17, Hebrews 4:12), how it promotes holistic growth, and how it inspires different services among Christians.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "reasoning", "fill-blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about 2 Timothy 3:16-17's four functions and Hebrews 4:12's description of the word of God.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen: GrowthItem[] = [];
      for (const area of ["spiritual", "moral", "social", "emotional", "intellectual"] as const) {
        chosen.push(...shuffle(rng, GROWTH_ITEMS.filter((g) => g.area === area)).slice(0, 2));
      }
      const items = shuffle(rng, chosen);
      const correctBucket: Record<string, string> = {};
      for (const g of items) correctBucket[g.text] = g.area;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((g) => ({ id: g.text, label: g.text })),
        buckets: [
          { id: "spiritual", label: "Spiritual" },
          { id: "moral", label: "Moral" },
          { id: "social", label: "Social" },
          { id: "emotional", label: "Emotional" },
          { id: "intellectual", label: "Intellectual" },
        ],
        correctBucket,
        hint: "Think about whether the example is about a person's relationship with God, their conduct, their relationships, their feelings, or their thinking.",
        explanation: items.map((g) => `"${g.text}" — ${g.area} growth.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think carefully about which function of the Bible, or which area of holistic growth, best matches the situation.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "2 Timothy 3:16 says Scripture is", after: "-breathed and useful for teaching, rebuking, correcting, and training in righteousness.", answer: "God", accepted: ["god"] },
      { before: "Hebrews 4:12 says the word of God is living and", after: ", sharper than any double-edged sword.", answer: "active", accepted: ["active"] },
      { before: "According to 2 Timothy 3:17, the goal of Scripture's functions is that a believer may be thoroughly equipped for every good", after: ".", answer: "work", accepted: ["work"] },
      { before: "The four functions of Scripture named in 2 Timothy 3:16 are teaching, rebuking, correcting, and training in", after: ".", answer: "righteousness", accepted: ["righteousness"] },
      { before: "Hebrews 4:12 says the word of God can discern the thoughts and", after: "of the heart.", answer: "intentions", accepted: ["intentions"] },
      { before: "Using the Bible's message to spread the Good News to others is called", after: ".", answer: "evangelism", accepted: ["evangelism"] },
      { before: "Pointing out wrong belief or behaviour directly is called", after: ", one of Scripture's four functions.", answer: "rebuking", accepted: ["rebuking"] },
      { before: "Showing the way back to what is right after a wrong is pointed out is called", after: ".", answer: "correcting", accepted: ["correcting"] },
      { before: "Finding comfort in Scripture during a difficult time is an example of the Bible supporting", after: "growth.", answer: "emotional", accepted: ["emotional"] },
      { before: "Resolving a conflict peacefully, guided by Biblical teaching, is an example of the Bible supporting", after: "growth.", answer: "social", accepted: ["social"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about 2 Timothy 3:16-17 and Hebrews 4:12.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
