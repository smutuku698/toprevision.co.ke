import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring every sentence separately.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by which virtue from the Sermon on the Mount it best shows.",
    "these facts about the Sermon on the Mount under the correct bucket.",
    "each fact below by which virtue it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the Sermon on the Mount with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Sermon on the Mount.",
    "the correct missing word.",
  ],
);

interface VirtueFact { text: string; group: "mercy" | "peace" }
const VIRTUE_FACTS: VirtueFact[] = [
  { text: "Matthew 5:7 says, \"Blessed are the merciful, for they will be shown mercy\"", group: "mercy" },
  { text: "Forgiving a classmate who apologises for a mistake is an act of mercy", group: "mercy" },
  { text: "Being kind to someone who has wronged you shows mercy", group: "mercy" },
  { text: "Choosing not to hold a grudge against someone reflects mercy", group: "mercy" },
  { text: "Matthew 5:8 says, \"Blessed are the pure in heart, for they will see God\"", group: "mercy" },
  { text: "Being honest and sincere, not two-faced, reflects a pure heart", group: "mercy" },
  { text: "Matthew 5:9 says, \"Blessed are the peacemakers, for they will be called children of God\"", group: "peace" },
  { text: "Helping two arguing classmates reach a peaceful solution is peacemaking", group: "peace" },
  { text: "Refusing to spread rumors that could cause conflict promotes peace", group: "peace" },
  { text: "Encouraging teammates to play fairly during an inter-class competition builds peace", group: "peace" },
  { text: "Speaking calmly to calm down an argument between friends is peacemaking", group: "peace" },
  { text: "Choosing cooperation over rivalry during a group activity reflects peacemaking", group: "peace" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Matthew 5:7-9", meaning: "The verses from the Sermon on the Mount naming mercy, purity of heart, and peacemaking" },
  { term: "\"Blessed are the merciful\"", meaning: "The teaching promising mercy to those who show mercy to others" },
  { term: "\"Blessed are the pure in heart\"", meaning: "The teaching promising that the pure in heart will see God" },
  { term: "\"Blessed are the peacemakers\"", meaning: "The teaching promising that peacemakers will be called children of God" },
  { term: "Mercy", meaning: "Showing kindness and forgiveness to someone, even when they have done wrong" },
  { term: "Pure heart", meaning: "Being sincere and honest, without hidden, selfish motives" },
  { term: "Peacemaker", meaning: "Someone who actively works to bring calm and resolve conflict between others" },
  { term: "Harmonious co-existence", meaning: "Living peacefully together, which the Sermon on the Mount's virtues help build" },
  { term: "Interclass competitions", meaning: "A setting this lesson uses to discuss applying the sermon's virtues with peers" },
  { term: "Reflection journal", meaning: "A tool suggested for writing about the meaning of a \"pure heart\"" },
  { term: "The Sermon on the Mount", meaning: "Jesus' well-known teaching, part of which is found in Matthew 5:7-9" },
  { term: "Virtues", meaning: "Good qualities of character, such as mercy, purity of heart and peacemaking, taught in this lesson" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Kiptum", "Nyawira", "Odongo", "Chepngeno", "Barongo", "Wanjala", "Achieng", "Mutiso", "Njeri", "Kiplangat", "Wafula", "Adhiambo"] as const;
const KENYAN_PLACES = ["Molo", "Migori", "Kilifi", "Bomet", "Kabras", "Ndhiwa", "Sabatia", "Marsabit", "Ortum", "Kapenguria", "Rongai", "Chuka"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `During an inter-class football match in ${place(rng)}, ${name(rng)}'s team loses because of an opponent's unintentional foul. Which virtue from the Sermon on the Mount should guide ${name(rng)}'s response?`,
    correct: "Mercy — choosing to forgive the accidental foul rather than holding onto anger",
    wrong: [
      "Revenge — planning to foul an opponent back later",
      "The Sermon on the Mount has nothing to teach about sports matches",
      "Pride — insisting the referee was completely wrong",
    ],
    explanation: "Matthew 5:7 teaches that the merciful will be shown mercy — choosing to forgive an unintentional foul reflects this virtue in a competitive setting.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices two classmates arguing loudly and is tempted to just walk away rather than get involved. What does "blessed are the peacemakers" suggest ${who} should consider instead?`,
      correct: "Try to calmly help the classmates resolve their disagreement, since peacemakers are specifically blessed for this kind of effort",
      wrong: [
        "Join in the argument to support whichever classmate is more popular",
        "The verse about peacemakers only applies to adults, not learners",
        `Encourage the argument to continue since it is not directly ${who}'s problem`,
      ],
      explanation: "Matthew 5:9 blesses peacemakers specifically, encouraging active involvement in calming conflict rather than avoiding it or making it worse.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads Matthew 5:8 and wonders what having a "pure heart" looks like in daily school life. Which behaviour best reflects this virtue?`,
    correct: "Being honest and sincere with classmates, without pretending to be someone else to gain favour",
    wrong: [
      "Being outwardly polite to classmates while secretly plotting against them",
      "Purity of heart only applies to religious leaders, never to learners",
      "Avoiding all classmates to prevent any impure thoughts",
    ],
    explanation: "A pure heart, per Matthew 5:8, is about sincerity and honesty in one's inner motives, not just outward appearances — genuine honesty with classmates reflects it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes that showing mercy to someone who wronged them is a sign of weakness. How does Matthew 5:7 respond to this belief?`,
      correct: "Mercy is presented as a blessed, valued quality, not a weakness — those who show mercy are promised mercy in return",
      wrong: [
        "Matthew 5:7 agrees that mercy is a weakness to avoid",
        "Mercy is only mentioned as something owed to religious leaders",
        "The verse discourages ever forgiving someone who has done wrong",
      ],
      explanation: "Matthew 5:7 presents mercy as something 'blessed,' promising that the merciful will themselves be shown mercy — a positively valued quality, not weakness.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, guided by ${name(rng)}, is preparing rules for fair play during a class competition. Which value from the Sermon on the Mount should shape their rules?`,
    correct: "Peacemaking and mercy, to ensure disagreements during the competition are resolved calmly and fairly",
    wrong: [
      "Winning at any cost, regardless of how classmates are treated",
      "This lesson's virtues have no connection to preparing competition rules",
      "Excluding weaker classmates entirely from participating",
    ],
    explanation: "The lesson connects the sermon's virtues of mercy and peacemaking directly to how learners should relate during inter-class competitions.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} thinks pure-heartedness only means avoiding obviously bad actions, with no deeper meaning. What does Matthew 5:8's promise, "they will see God," suggest about its deeper meaning?`,
      correct: "A pure heart involves inner sincerity and honesty, not just avoiding visible wrongdoing — it shapes a person's relationship with God",
      wrong: [
        "The promise has nothing to do with a person's inner character",
        "A pure heart is only about following outward religious rules",
        "The verse teaches that seeing God has no connection to one's heart at all",
      ],
      explanation: "The promise that the pure in heart 'will see God' points to something deeper than avoiding visible wrongdoing — genuine inner sincerity that shapes one's relationship with God.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why these three virtues — mercy, pure heart, and peacemaking — are grouped together in this part of the Sermon on the Mount. What connects them?`,
    correct: "All three describe an inward character that produces good, harmonious relationships with others",
    wrong: [
      "The three virtues are unrelated and were grouped randomly",
      "They are grouped only because they start with similar sounding words",
      "The three virtues focus entirely on outward rituals, not character",
    ],
    explanation: "Mercy, purity of heart, and peacemaking all describe an inward character quality that shapes how a person treats others, which is why they are grouped together in this teaching.",
  }),
  (rng) => ({
    prompt: `${name(rng)} believes that peacemaking only means staying silent during a conflict to avoid making things worse. Is silence the same as peacemaking according to Matthew 5:9?`,
    correct: "No — peacemaking is an active effort to bring calm and resolution, not simply staying silent or avoiding involvement",
    wrong: [
      "Yes — the verse teaches that silence is the only true form of peacemaking",
      "Yes — getting involved in a conflict is always the wrong approach",
      "No — but only trained mediators, never ordinary learners, can be peacemakers",
    ],
    explanation: "Being called a peacemaker implies actively working toward peace and resolution, not merely staying silent or uninvolved during a conflict.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to write in a reflection journal, as this lesson suggests, about the meaning of a "pure heart." Which idea would fit best?`,
      correct: "Being honest, sincere and consistent in character, whether or not anyone else is watching",
      wrong: [
        "A pure heart means never making any mistakes at all",
        "The reflection should focus only on outward appearances, not inner character",
        "This lesson gives no real guidance on what a pure heart means",
      ],
      explanation: "This lesson's own suggested activity is reflecting on the meaning of a 'pure heart' — sincerity and honest inner character best captures this virtue's meaning.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that showing mercy means a person should never hold anyone accountable for wrongdoing at all. Does Matthew 5:7 support this extreme view?`,
    correct: "No — the lesson focuses on forgiveness and kindness in how a person treats others, not on removing all accountability",
    wrong: [
      "Yes — mercy according to this verse means ignoring wrongdoing completely",
      "Yes — accountability and mercy can never exist together in this teaching",
      "No — but the verse actually teaches the opposite, discouraging any forgiveness",
    ],
    explanation: "Mercy, as taught here, is about forgiveness and kindness in relationships, which is not the same as removing all accountability for wrongdoing.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sees a teammate get unfairly blamed during a class competition and wants to defend them without starting another argument. Which combination of virtues from this lesson applies?`,
      correct: "Peacemaking and mercy together — calmly correcting the unfair blame while still promoting a peaceful resolution",
      wrong: [
        "Only aggressive confrontation reflects the Sermon on the Mount's teaching",
        "Staying completely silent is the only virtue this lesson supports",
        "This situation has no connection to any virtue from the sermon",
      ],
      explanation: "Calmly correcting an unfair situation while working toward resolution reflects both peacemaking and mercy, the virtues highlighted in this lesson.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know how these virtues from Matthew 5 relate to the lesson's key inquiry question about harmonious co-existence. What is the connection?`,
    correct: "Mercy, purity of heart and peacemaking are the very qualities that allow people to live and interact harmoniously with each other",
    wrong: [
      "There is no real connection between these virtues and harmonious living",
      "The virtues actually promote competition and rivalry, not harmony",
      "Harmonious co-existence is unrelated to a person's character or virtues",
    ],
    explanation: "The lesson's key inquiry question directly asks how the Sermon on the Mount fosters harmonious co-existence — these three virtues are exactly what make that possible.",
  }),
];

export const sermonOnTheMount: Skill = {
  id: "g5-cre-jc-sermon-on-the-mount",
  code: "JC.7",
  subjectId: "cre",
  strandId: "g5-cre-jesus",
  grade: 5,
  title: "Sermon on the Mount",
  description: "Virtues taught in the Sermon on the Mount — mercy, purity of heart, and peacemaking (Matthew 5:7-9) — and how applying them fosters harmonious co-existence with others.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (a set of virtues, not a story with
    // events), so "ordering" is deliberately skipped — 4 kinds is the honest cap here.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const mercy = shuffle(rng, VIRTUE_FACTS.filter((f) => f.group === "mercy")).slice(0, 4);
      const peace = shuffle(rng, VIRTUE_FACTS.filter((f) => f.group === "peace")).slice(0, 4);
      const chosen = shuffle(rng, [...mercy, ...peace]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "mercy", label: "Mercy and a pure heart" },
          { id: "peace", label: "Peacemaking" },
        ],
        correctBucket,
        hint: "The mercy bucket is about forgiveness and sincerity; the peace bucket is about resolving conflict.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "mercy" ? "mercy and a pure heart" : "peacemaking"}.`).join(" "),
      };
    }

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
        hint: "Think about what mercy, a pure heart, and peacemaking each mean in Matthew 5:7-9.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Think about how mercy, a pure heart, or peacemaking apply to the situation.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Matthew 5:7 says, \"Blessed are the merciful, for they will be shown", after: ".\"", answer: "mercy", accepted: ["mercy"] },
      { before: "Matthew 5:8 says, \"Blessed are the pure in heart, for they will see", after: ".\"", answer: "God", accepted: ["god"] },
      { before: "Matthew 5:9 says, \"Blessed are the", after: ", for they will be called children of God.\"", answer: "peacemakers", accepted: ["peacemakers"] },
      { before: "Showing forgiveness to someone who wronged you is an act of", after: ".", answer: "mercy", accepted: ["mercy"] },
      { before: "Being honest and sincere reflects a", after: "heart.", answer: "pure", accepted: ["pure"] },
      { before: "Helping resolve a disagreement calmly is an example of", after: ".", answer: "peacemaking", accepted: ["peacemaking"] },
      { before: "This lesson connects these virtues to how learners relate during inter-class", after: ".", answer: "competitions", accepted: ["competitions"] },
      { before: "The Sermon on the Mount teaches virtues that foster harmonious", after: "with others.", answer: "co-existence", accepted: ["co-existence", "coexistence"] },
      { before: "These verses are found in Matthew", after: ":7-9.", answer: "5", accepted: ["5", "five"] },
      { before: "This lesson's key inquiry question asks how the sermon fosters harmonious", after: ".", answer: "co-existence", accepted: ["co-existence", "coexistence"] },
      { before: "Learners are encouraged to apply these virtues in their interaction with", after: ".", answer: "others", accepted: ["others"] },
      { before: "This lesson suggests reflecting in a journal on the meaning of a pure", after: ".", answer: "heart", accepted: ["heart"] },
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
      hint: "Think about Matthew 5:7-9 and the virtues of mercy, a pure heart, and peacemaking.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
