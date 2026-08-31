import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events that prepared Moses for leadership in the correct order.",
  "Put these events in Moses' preparation for leadership into order.",
  "Sequence these events that prepared Moses to lead.",
  "Arrange the stages of Moses' preparation for leadership correctly.",
  "Order these events from Moses' life leading up to the Exodus.",
  "Sort these events into the order they happened in Moses' story.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as a role Moses played during the Exodus or a leadership quality he showed.",
  "Decide whether each statement is a role or a quality, and sort it there.",
  "Group these statements under a role Moses played or a leadership quality he showed.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for role or quality.",
  "Read each statement and sort it under role or quality.",
];

const MATCH_PROMPTS = [
  "Match each leadership quality to the example of Moses that shows it.",
  "Pair each quality below with the example that demonstrates it.",
  "Connect each leadership quality to the moment from Moses' story that shows it.",
  "Match each quality to the example that fits it.",
  "Link each leadership quality to the evidence from Moses' life.",
  "Match each quality to the statement that shows Moses displaying it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact about Moses.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact with the right word.",
];

const PREPARATION_SEQUENCE = [
  { id: "p1", label: "Moses sees the suffering of his people while living in Pharaoh's household (Exodus 2:11-13)" },
  { id: "p2", label: "Moses flees to Midian and becomes a shepherd after killing an Egyptian" },
  { id: "p3", label: "God calls Moses through the burning bush (Exodus 3:1-2)" },
  { id: "p4", label: "Moses raises doubts about his own ability, and God reassures him (Exodus 3:11-12, 6:12)" },
  { id: "p5", label: "Moses returns to Egypt to lead his people out of slavery" },
];

const ROLES = [
  "Leading the Israelites out of slavery in Egypt",
  "Commanding the Israelites to stand firm and stretching his hand over the Red Sea (Exodus 14:13-16, 21)",
  "Turning the bitter water at Marah sweet for the people to drink (Exodus 15:22-25)",
  "Taking Jethro's advice and appointing capable leaders to help judge the people (Exodus 18:5-10, 17-24)",
  "Teaching the people God's statutes and laws (Deuteronomy 4:1-3, 5, 6)",
  "Interceding in prayer for the Israelites before God",
  "Organising the people into manageable groups under appointed leaders",
  "Communicating God's instructions to Pharaoh on behalf of the Israelites",
  "Settling disputes among the people before delegating that responsibility",
  "Renewing the people's covenant relationship with God",
] as const;

const QUALITIES: { term: string; example: string }[] = [
  { term: "Humility", example: "Moses doubted he was capable of leading and relied on God rather than his own ability" },
  { term: "Obedience to God", example: "Moses obeyed God's call at the burning bush, even though the task felt overwhelming" },
  { term: "Delegation", example: "Moses took Jethro's advice and appointed capable leaders to help judge the people" },
  { term: "Courage", example: "Moses confronted Pharaoh and led the Israelites out of slavery despite great danger" },
  { term: "Perseverance", example: "Moses kept leading the Israelites through decades of hardship in the wilderness" },
  { term: "Willingness to seek advice", example: "Moses listened to Jethro's suggestion instead of insisting on judging every dispute alone" },
  { term: "Faithfulness", example: "Moses remained committed to God's instructions throughout the Exodus journey" },
  { term: "Servant leadership", example: "Moses interceded in prayer for the very people who often complained against him" },
  { term: "Wise decision-making", example: "Moses organised the people into manageable groups so disputes could be judged fairly and efficiently" },
  { term: "Boldness", example: "Moses spoke God's instructions directly to Pharaoh despite Pharaoh's power" },
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
      prompt: `${who}, newly elected class prefect in ${place(rng)}, is overwhelmed by handling every single dispute alone. Which of Moses' leadership qualities from Exodus 18 would help most here?`,
      correct: "Delegation — sharing responsibility with trustworthy classmates instead of handling everything alone",
      wrong: ["Boldness — confronting Pharaoh has nothing to do with sharing classroom duties", "Humility — humility alone does not solve the problem of too much work", "Faithfulness — faithfulness is about commitment, not delegating tasks"],
      explanation: "Just as Jethro advised Moses to appoint capable leaders to share the load, a prefect overwhelmed with disputes can delegate responsibility to trustworthy classmates.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is offered a leadership role but feels unqualified and afraid of failing. What does Moses' response at the burning bush (Exodus 3:11-12) model for this situation?`,
    correct: "Bringing honest doubts to God while still trusting Him enough to obey the call",
    wrong: ["Refusing any leadership role permanently out of fear", "Pretending to feel fully confident even when genuinely afraid", "Accepting the role only if guaranteed instant success"],
    explanation: "Moses honestly expressed his doubts to God, yet still obeyed the call — a model of humble, honest leadership rather than false confidence or outright refusal.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s school in ${place(rng)} is choosing student council leaders. Which quality, modelled by Moses, best signals a leader of integrity worth choosing?`,
      correct: "A track record of faithfulness and honesty in small responsibilities already given to them",
      wrong: ["Being the loudest or most popular candidate during campaigns", "Promising rewards to whoever votes for them", "Having no prior experience with any responsibility at all"],
      explanation: "Choosing leaders of integrity means looking for demonstrated faithfulness and honesty, not popularity or empty promises — the same trustworthiness Moses showed throughout the Exodus.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} notices that Moses kept leading the Israelites through decades of hardship in the wilderness without giving up. Which leadership quality does this best show?`,
    correct: "Perseverance — continuing to lead faithfully despite prolonged difficulty",
    wrong: ["Delegation — perseverance is about persistence, not sharing tasks", "Boldness — this is about endurance over time, not confronting danger", "Wise decision-making — this is specifically about not giving up, not making good choices"],
    explanation: "Moses' willingness to keep leading through many years of hardship in the wilderness is a clear example of perseverance.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked which event shows Moses providing for the Israelites' practical needs during the Exodus. Which is it?`,
    correct: "Turning the bitter water at Marah sweet so the people could drink (Exodus 15:22-25)",
    wrong: ["Receiving advice from Jethro about appointing leaders", "Speaking to Pharaoh about releasing the Israelites", "Doubting his own ability at the burning bush"],
    explanation: "At Marah, Moses turned bitter, undrinkable water sweet, directly meeting the people's urgent practical need for water.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that a good leader should never accept advice from anyone else. What does Moses' example with Jethro (Exodus 18:17-24) teach about this view?`,
    correct: "Good leaders remain open to wise advice, even from others, rather than insisting on doing everything alone",
    wrong: ["Moses refused Jethro's advice completely and continued judging every dispute alone", "Accepting advice is always a sign of weak leadership", "Jethro's advice made things harder for Moses, not easier"],
    explanation: "Moses accepted Jethro's advice to delegate judging responsibilities, showing that willingness to seek and accept wise counsel strengthens leadership rather than weakening it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why choosing leaders of integrity matters for a stable community or government. What is the strongest reason, reflecting Moses' example?`,
      correct: "Leaders of integrity are more likely to serve others faithfully rather than misuse their position for personal gain",
      wrong: ["Integrity in a leader has no real effect on how a community is governed", "Leaders of integrity always win every decision without disagreement", "Choosing leaders of integrity matters only in religious settings, not government"],
      explanation: "Leaders of integrity, like Moses, are more likely to serve the people faithfully rather than exploit their position — a foundation for stable, trustworthy leadership anywhere.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what role Moses played at the Red Sea, according to Exodus 14:13-16 and 21. What was it?`,
    correct: "He commanded the Israelites to stand firm and stretched his hand over the sea",
    wrong: ["He remained in Egypt while the Israelites crossed alone", "He appointed judges to help the people cross", "He turned the sea water sweet for the people to drink"],
    explanation: "At the Red Sea, Moses commanded the people to stand firm and, at God's instruction, stretched his hand over the sea so it parted for them to cross.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Moses did after receiving God's statutes and laws, according to Deuteronomy 4:1-3, 5, 6. What was his role?`,
    correct: "He taught the people God's statutes and laws so they could follow them",
    wrong: ["He kept the laws secret from the people", "He ignored the laws once he received them", "He delegated the task of receiving the laws to Aaron instead"],
    explanation: "Moses' role after receiving God's laws was to teach them to the people, so the whole community could understand and follow them.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is choosing between two candidates for a church youth leadership role: one who is confident but has a history of dishonesty, and one who is quieter but consistently trustworthy. Reflecting Moses' example, which matters more?`,
    correct: "Trustworthiness and integrity matter more than confidence alone for responsible leadership",
    wrong: ["Confidence alone is always the most important quality in a leader", "A history of dishonesty has no bearing on future leadership", "Neither trustworthiness nor confidence matters for leadership roles"],
    explanation: "Moses' leadership was built on faithfulness and obedience to God, not outward confidence — choosing leaders of integrity means valuing trustworthiness over confident appearance alone.",
  }),
];

export const leadershipInIsraelMoses: Skill = {
  id: "g7-cre-bi-leadership-in-israel-moses",
  code: "BI.4",
  subjectId: "cre",
  strandId: "g7-cre-bible",
  grade: 7,
  title: "Leadership in Israel: Moses",
  description: "How God prepared Moses for leadership, the roles Moses played during the Exodus, and leadership qualities to emulate when choosing leaders of integrity today.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, PREPARATION_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: PREPARATION_SEQUENCE.map((p) => p.id),
        hint: "Start with Moses seeing his people's suffering in Egypt and end with him returning to lead them out.",
        explanation: PREPARATION_SEQUENCE.map((p) => p.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const roles = shuffle(rng, ROLES).slice(0, 4);
      const qualities = shuffle(rng, QUALITIES.map((q) => q.term)).slice(0, 4);
      const chosen = shuffle(rng, [...roles.map((r) => ({ text: r, kind: "role" })), ...qualities.map((q) => ({ text: q, kind: "quality" }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "role", label: "A role Moses played" },
          { id: "quality", label: "A leadership quality" },
        ],
        correctBucket,
        hint: "A role is a specific action Moses took; a quality is a character trait he showed.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.kind === "role" ? "a role Moses played" : "a leadership quality"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, QUALITIES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((q) => ({ id: q.term, label: q.term })));
      const targets = shuffle(rng, chosen.map((q) => ({ id: q.term, label: q.example })));
      const correctMap: Record<string, string> = {};
      for (const q of chosen) correctMap[q.term] = q.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about how Moses acted during his call and throughout the Exodus.",
        explanation: chosen.map((q) => `${q.term} — ${q.example.toLowerCase()}.`).join(" "),
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
        hint: "Think about how Moses' example applies to leadership today.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "God called Moses to leadership through the", after: "bush (Exodus 3:1-2).", answer: "burning", accepted: ["burning"] },
      { before: "At Marah, Moses turned the bitter water", after: "so the people could drink it (Exodus 15:22-25).", answer: "sweet", accepted: ["sweet"] },
      { before: "Jethro advised Moses to appoint capable", after: "to help judge the people (Exodus 18).", answer: "leaders", accepted: ["leaders", "judges"] },
      { before: "At the Red Sea, Moses commanded the Israelites to stand", after: "as God made a way through (Exodus 14:13-16).", answer: "firm", accepted: ["firm"] },
      { before: "Moses taught the people God's statutes and", after: "so they could follow them (Deuteronomy 4).", answer: "laws", accepted: ["laws"] },
      { before: "Sharing responsibility with others instead of doing everything alone is called", after: ".", answer: "delegation", accepted: ["delegation"] },
      { before: "Continuing to lead faithfully despite prolonged difficulty is the quality of", after: ".", answer: "perseverance", accepted: ["perseverance"] },
      { before: "Moses fled to Midian and became a", after: "before God called him at the burning bush.", answer: "shepherd", accepted: ["shepherd"] },
      { before: "Doing what is right and staying trustworthy, even when it is difficult, is the quality of", after: ".", answer: "integrity", accepted: ["integrity"] },
      { before: "Moses expressed doubt about his own ability, saying he was of uncircumcised", after: "(Exodus 6:12).", answer: "lips", accepted: ["lips"] },
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
      hint: "Think about how God prepared Moses and the roles he played during the Exodus.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
