import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

// No shared sequence exists across these 4 distinct scriptures from 4 different faiths (unlike a single
// narrative's events), so this skill uses categorize/match/reasoning/fill-blank — 4 kinds with a
// documented reason, per SKILL-QUALITY-STANDARDS.md's allowance for a genuine content-shape limit.
const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by which Scripture it describes.",
    "these facts under the correct Scripture.",
    "each fact below by which Scripture it belongs to.",
    "each fact into the bucket for the Scripture it describes.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each term below with what it means.",
    "each term to the explanation that fits it.",
    "each term to the Scripture or idea it relates to.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Scriptures.",
    "the correct missing word.",
  ],
);

interface ScriptureFact { text: string; scripture: "gita" | "uttradhayaan" | "sutta" | "granth" }
const SCRIPTURE_LABEL: Record<ScriptureFact["scripture"], string> = {
  gita: "Bhagwad Gita (Sanatan/Vedic)",
  uttradhayaan: "Uttradhayaan Sutra, Ch. 13-18 (Jain)",
  sutta: "Sutta Pitaka (Buddhist)",
  granth: "Sri Guru Granth Sahib ji (Sikh)",
};
const SCRIPTURE_FACTS: ScriptureFact[] = [
  { text: "Part of the Mahabharata epic, presented as a dialogue between Prince Arjuna and Lord Krishna on the battlefield of Kurukshetra", scripture: "gita" },
  { text: "Teaches performing one's duty (dharma) without attachment to the results of action", scripture: "gita" },
  { text: "Describes selfless action (karma yoga), devotion (bhakti yoga), and knowledge (jnana yoga) as paths toward spiritual growth", scripture: "gita" },
  { text: "A key Jain scripture traditionally linked to the final teachings of Lord Mahavira", scripture: "uttradhayaan" },
  { text: "Chapters 13 to 18 use parables and stories to teach detachment and renunciation", scripture: "uttradhayaan" },
  { text: "Describes the qualities of a virtuous, disciplined person", scripture: "uttradhayaan" },
  { text: "Part of the Tipitaka, the collection of Buddhist scriptures, and its name means 'basket of discourses'", scripture: "sutta" },
  { text: "Records sermons and teachings given directly by the Buddha", scripture: "sutta" },
  { text: "Organised into five collections called Nikayas", scripture: "sutta" },
  { text: "Treated in Sikhism as the eternal, living Guru", scripture: "granth" },
  { text: "Contains hymns (Shabads) composed by Sikh Gurus and by saints of other faiths, such as Kabir and Farid", scripture: "granth" },
  { text: "Arranged according to Raags, or musical measures", scripture: "granth" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Bhagwad Gita", meaning: "The Sanatan/Vedic scripture presented as a dialogue between Arjuna and Krishna" },
  { term: "Uttradhayaan Sutra", meaning: "The Jain scripture linked to the final teachings of Lord Mahavira" },
  { term: "Sutta Pitaka", meaning: "The Buddhist scripture recording sermons and teachings of the Buddha" },
  { term: "Sri Guru Granth Sahib ji", meaning: "The Sikh scripture treated as the eternal, living Guru" },
  { term: "Karma yoga", meaning: "The path of selfless action taught in the Bhagwad Gita" },
  { term: "Kurukshetra", meaning: "The battlefield where the Bhagwad Gita's dialogue takes place" },
  { term: "Mahavira", meaning: "The Jain teacher whose final sermons the Uttradhayaan Sutra is linked to" },
  { term: "Tipitaka", meaning: "The larger collection of Buddhist scriptures that the Sutta Pitaka belongs to" },
  { term: "Shabad", meaning: "A hymn found within Sri Guru Granth Sahib ji" },
  { term: "Raag", meaning: "A musical measure used to arrange the hymns of Sri Guru Granth Sahib ji" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is anxious about whether an effort at school will succeed, and a teacher reminds them of the Bhagwad Gita's teaching. What is the most fitting advice?`,
    correct: "Focus on doing one's duty sincerely, without being overly attached to the outcome",
    wrong: [
      "Avoid the effort altogether, since outcomes cannot be influenced at all",
      "Focus only on the outcome, since the effort itself does not matter",
      "Wait for someone else to complete the task instead",
    ],
    explanation: "The Bhagwad Gita's central teaching is performing one's duty without attachment to the results — encouraging sincere effort while releasing anxious attachment to the outcome.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know which Scripture describes selfless action, devotion, and knowledge as three paths to spiritual growth. Which is it?`,
    correct: "The Bhagwad Gita",
    wrong: ["The Uttradhayaan Sutra", "The Sutta Pitaka", "Sri Guru Granth Sahib ji"],
    explanation: "The Bhagwad Gita specifically describes karma yoga (selfless action), bhakti yoga (devotion), and jnana yoga (knowledge) as three paths toward spiritual growth.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads parables about renunciation and detachment and is told they come from chapters 13 to 18 of a Jain scripture linked to Lord Mahavira's final teachings. Which Scripture is being described?`,
    correct: "The Uttradhayaan Sutra",
    wrong: ["The Bhagwad Gita", "The Sutta Pitaka", "Sri Guru Granth Sahib ji"],
    explanation: "The Uttradhayaan Sutra, specifically chapters 13-18, is the Jain scripture that uses parables to teach detachment and renunciation, linked to Lord Mahavira's final teachings.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} learns that a Scripture's name literally means 'basket of discourses' and records the Buddha's own sermons. Which Scripture is this?`,
      correct: "The Sutta Pitaka",
      wrong: ["The Bhagwad Gita", "The Uttradhayaan Sutra", "Sri Guru Granth Sahib ji"],
      explanation: "'Sutta Pitaka' translates to 'basket of discourses' and specifically records sermons and teachings given directly by the Buddha.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why Sri Guru Granth Sahib ji is treated differently from how other Scriptures are typically treated. What is the best answer?`,
    correct: "It is treated in Sikhism as the eternal, living Guru, rather than only as a written text",
    wrong: [
      "It is treated purely as a historical record with no ongoing spiritual role",
      "It is treated exactly the same as the Bhagwad Gita in every respect",
      "It is treated as less important than the other three Scriptures in this lesson",
    ],
    explanation: "Sri Guru Granth Sahib ji holds a distinctive place in Sikhism as the eternal, living Guru — a status that goes beyond how a text is typically treated.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices that Sri Guru Granth Sahib ji includes hymns by non-Sikh saints such as Kabir and Farid, and assumes this must be a mistake. Is this assumption correct?`,
    correct: "No — Sri Guru Granth Sahib ji genuinely includes hymns (Shabads) composed by saints of other faiths alongside the Sikh Gurus",
    wrong: [
      "Yes — only hymns composed by Sikh Gurus are actually included",
      "Yes — Kabir and Farid were themselves Sikh Gurus",
      "No — but only because Kabir and Farid's hymns were removed in a later edition",
    ],
    explanation: "Sri Guru Granth Sahib ji deliberately includes Shabads from saints of other faiths, such as Kabir and Farid, alongside those of the Sikh Gurus — this is a genuine, intentional feature, not an error.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that since the Bhagwad Gita, Uttradhayaan Sutra, Sutta Pitaka, and Sri Guru Granth Sahib ji come from four different faiths, they cannot share any common purpose. Evaluate this claim.`,
    correct: "Flawed — despite coming from different faiths, all four Scriptures share the common purpose of teaching moral values that foster social harmony",
    wrong: [
      "Sound — Scriptures from different faiths can never share a common teaching purpose",
      "Sound — only Scriptures from the exact same faith can be meaningfully compared",
      "Flawed — but only because all four Scriptures actually belong to a single faith",
    ],
    explanation: "This sub-strand's whole purpose is showing how all four Scriptures, despite belonging to different faiths, share the common purpose of teaching moral values for social harmony.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked how Scriptural stories contribute to instilling moral values, per this lesson's key inquiry question. What is the best answer?`,
      correct: "They use narratives, dialogues, or hymns to make moral teachings memorable and applicable to daily life",
      wrong: [
        "Scriptural stories have no real connection to instilling moral values",
        "Only Scriptures written as direct rules, with no narrative, can teach moral values",
        "Moral values can only be learnt outside of any Scripture",
      ],
      explanation: "Whether through a dialogue (the Gita), a parable (the Uttradhayaan Sutra), a recorded sermon (the Sutta Pitaka), or a hymn (Sri Guru Granth Sahib ji), Scriptural stories make moral teachings memorable and applicable.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know which larger collection the Sutta Pitaka belongs to. What is the correct answer?`,
    correct: "The Tipitaka, the collection of Buddhist scriptures",
    wrong: [
      "The Mahabharata, the epic containing the Bhagwad Gita",
      "Sri Guru Granth Sahib ji, arranged according to Raags",
      "The Uttradhayaan Sutra, linked to Lord Mahavira's final teachings",
    ],
    explanation: "The Sutta Pitaka is one part of the Tipitaka, the wider collection of Buddhist scriptures — it is not part of the Mahabharata, Sri Guru Granth Sahib ji, or the Uttradhayaan Sutra.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that the Bhagwad Gita's setting on a battlefield means its teaching is really about warfare rather than moral values. Is this an accurate understanding?`,
    correct: "No — despite its battlefield setting, its central teaching is about performing one's duty without attachment to results, a moral and spiritual lesson",
    wrong: [
      "Yes — the entire Bhagwad Gita is a manual purely about battlefield strategy",
      "Yes — the dialogue between Arjuna and Krishna focuses only on weapons",
      "No — but only because the Bhagwad Gita is not actually set on a battlefield",
    ],
    explanation: "Although set on the battlefield of Kurukshetra, the Bhagwad Gita's dialogue between Arjuna and Krishna centres on the moral and spiritual teaching of duty without attachment to outcomes.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why appreciating the teaching of Scriptures matters for spiritual growth, based on this lesson's aim. What is the best response?`,
    correct: "Because each Scripture offers guidance that, when applied, supports moral development and social harmony",
    wrong: [
      "Because memorising Scripture names is the only goal of this lesson",
      "Because Scriptures from other faiths should be dismissed rather than appreciated",
      "Because appreciating Scriptures has no connection to applying moral values in daily life",
    ],
    explanation: "This sub-strand's own aim is appreciating the teaching of Scriptures for enhancing moral values — the point is applying their guidance to daily life, not merely naming them.",
  }),
];

export const scripturesAndMoralValues: Skill = {
  id: "g6-hre-sc-scriptures-and-moral-values",
  code: "SC.1",
  subjectId: "hre",
  strandId: "g6-hre-sc",
  grade: 6,
  title: "Scriptures and Moral Values",
  description: "Four selected Scriptures — the Bhagwad Gita, the Uttradhayaan Sutra (Ch. 13-18), the Sutta Pitaka, and Sri Guru Granth Sahib ji — and the moral values each teaches.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const scriptures: ScriptureFact["scripture"][] = ["gita", "uttradhayaan", "sutta", "granth"];
      const chosen = shuffle(rng, scriptures.flatMap((s) => shuffle(rng, SCRIPTURE_FACTS.filter((f) => f.scripture === s)).slice(0, 2)));
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.scripture));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: scriptures.map((s) => ({ id: s, label: SCRIPTURE_LABEL[s] })),
        correctBucket,
        hint: "Think about which faith's Scripture each fact describes.",
        explanation: chosen.map((f) => `"${f.text}" — ${SCRIPTURE_LABEL[f.scripture]}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.term })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.term] = a.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which Scripture or idea each term belongs to.",
        explanation: chosen.map((a) => `${a.term} — ${a.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Think about which of the four Scriptures the scenario or fact is describing.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Bhagwad Gita is a dialogue between Prince Arjuna and Lord", after: ".", answer: "Krishna", accepted: ["krishna"] },
      { before: "The Bhagwad Gita's dialogue takes place on the battlefield of", after: ".", answer: "Kurukshetra", accepted: ["kurukshetra"] },
      { before: "The Bhagwad Gita teaches performing one's duty without attachment to the", after: "of action.", answer: "results", accepted: ["results"] },
      { before: "The Uttradhayaan Sutra is linked to the final teachings of Lord", after: ".", answer: "Mahavira", accepted: ["mahavira"] },
      { before: "Chapters 13 to 18 of the Uttradhayaan Sutra use parables to teach detachment and", after: ".", answer: "renunciation", accepted: ["renunciation"] },
      { before: "The Sutta Pitaka's name means 'basket of", after: "'.", answer: "discourses", accepted: ["discourses"] },
      { before: "The Sutta Pitaka is part of the", after: ", the collection of Buddhist scriptures.", answer: "Tipitaka", accepted: ["tipitaka"] },
      { before: "The Sutta Pitaka is organised into five collections called", after: ".", answer: "Nikayas", accepted: ["nikayas", "nikaya"] },
      { before: "Sri Guru Granth Sahib ji is treated in Sikhism as the eternal, living", after: ".", answer: "Guru", accepted: ["guru"] },
      { before: "Sri Guru Granth Sahib ji contains hymns called", after: ".", answer: "Shabads", accepted: ["shabads", "shabad"] },
      { before: "Sri Guru Granth Sahib ji includes hymns from saints such as Kabir and", after: ".", answer: "Farid", accepted: ["farid"] },
      { before: "Sri Guru Granth Sahib ji is arranged according to", after: ", or musical measures.", answer: "Raags", accepted: ["raags", "raag"] },
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
      hint: "Recall which of the four Scriptures this fact belongs to.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
