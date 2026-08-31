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
    "each statement about talents into the bucket for what it best matches.",
    "these facts about God-given talents under the correct heading.",
    "each statement below by whether it is a kind of talent or a value that nurtures one.",
    "each fact into the bucket for talent example or nurturing value.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each talent or gift to the way it is best used to serve others.",
    "each value below with why it helps someone nurture their talent.",
    "each idea about talents to the evidence or example that supports it.",
    "each term to the explanation of why it matters for using talents well.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about talents and abilities.",
    "the correct missing word.",
  ],
);

// Kinds of God-given talents named/implied by the sub-strand's outcomes (music, sports, teaching,
// craftsmanship, leadership, art) paired with the value most needed to nurture each — grounded in the
// sub-strand's named values (Responsibility, Unity) and the general "nurture talent" outcome, not invented.
const TALENT_VALUE: { term: string; evidence: string }[] = [
  { term: "Craftsmanship", evidence: "Like Bezalel, a person skilled with their hands needs regular practice and discipline to keep improving" },
  { term: "Music", evidence: "A talented singer or instrumentalist needs humility so their gift is used to bless others, not just to be praised" },
  { term: "Sports", evidence: "An athlete needs responsibility to train consistently instead of relying only on natural ability" },
  { term: "Teaching", evidence: "Someone gifted at explaining things needs patience to help others understand, especially those who learn slowly" },
  { term: "Leadership", evidence: "A natural leader needs unity so they guide the group together rather than only pleasing themselves" },
  { term: "Art", evidence: "A gifted artist needs perseverance to keep creating even when a piece of work does not turn out well at first" },
  { term: "Public speaking", evidence: "Someone who speaks confidently needs honesty so their words are used to encourage, not to mislead" },
  { term: "Craft with tools", evidence: "A skilled builder or tailor needs carefulness so their work is safe and reliable for the people who use it" },
  { term: "Helping others", evidence: "Someone gifted at caring for people needs kindness to keep serving even when it is not convenient" },
  { term: "Organising", evidence: "A person gifted at planning needs cooperation so their organising skill benefits the whole group, not just themselves" },
];

// Talent examples split by rough category, used for the categorize branch (musical/physical/creative vs.
// service/leadership talents) — a natural grouping supported by the outcome "discuss how they use their
// God-given talents and abilities," not an invented taxonomy.
const TALENT_FACTS: { text: string; group: "expressive" | "service" }[] = [
  { text: "Singing well in the school or church choir", group: "expressive" },
  { text: "Playing football, athletics, or another sport skilfully", group: "expressive" },
  { text: "Drawing, painting, or making craft items", group: "expressive" },
  { text: "Playing a musical instrument such as a drum or guitar", group: "expressive" },
  { text: "Dancing or performing in a school drama", group: "expressive" },
  { text: "Writing stories, poems, or songs", group: "expressive" },
  { text: "Teaching or explaining a topic clearly to classmates", group: "service" },
  { text: "Leading a class group or a club at school", group: "service" },
  { text: "Being skilled at fixing or building things with your hands", group: "service" },
  { text: "Organising activities so a group works well together", group: "service" },
  { text: "Caring for younger children or people who are unwell", group: "service" },
  { text: "Encouraging and comforting friends who are discouraged", group: "service" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads Exodus 31:3, where God fills Bezalel "with the Spirit of God, with wisdom, with understanding, with knowledge and with all kinds of skills" to build the tabernacle. What does this verse teach about where Bezalel's skill came from?`,
    correct: "His craftsmanship skill was a gift from God, not something he achieved alone",
    wrong: [
      "Bezalel taught himself every skill without any help from God",
      "Only priests were allowed to receive skills from God",
      "Bezalel's skill only counted once the tabernacle was fully built",
    ],
    explanation: "Exodus 31:3 explicitly says God filled Bezalel with skill for his craftsmanship work — a clear biblical example of a talent that comes from God.",
  }),
  (rng) => ({
    prompt: `In CRE class in ${place(rng)}, ${name(rng)} is asked why God chose to fill Bezalel with skill specifically to build the tabernacle rather than for Bezalel's own benefit. What does this show about the purpose of talents?`,
    correct: "God-given talents are meant to be used to serve others and honour God, not just for personal gain",
    wrong: [
      "Talents are only meaningful if they make the person famous",
      "Bezalel's skill was wasted because it was only used once",
      "God only gives useful talents to people who are already important",
    ],
    explanation: "Bezalel's skill was given so he could serve the whole community by building the tabernacle — a model for using any talent to serve others.",
  }),
  (rng) => ({
    prompt: `${name(rng)} reads Romans 12:4, which says the body has many parts, and the parts do not all have the same function. How does this verse relate to different people's talents?`,
    correct: "Just as the body has many different parts with different functions, God gives different people different gifts to serve their community",
    wrong: [
      "It means only one talent in the whole community actually matters",
      "It means everyone in a community should try to have the exact same talent",
      "It means talents given by God are all identical in every person",
    ],
    explanation: "Romans 12:4 uses the image of one body with many differently-functioning parts to teach that God gives people different gifts that work together.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is naturally gifted at singing but keeps it a secret and never sings in church or school because ${who} does not want to stand out. Based on Romans 12:4's teaching about gifts, what is the better response?`,
      correct: "Use the gift within the community, since it is meant to function together with others' gifts",
      wrong: [
        "Keep the gift hidden forever so no one else can benefit from it",
        "Only use the gift once a person becomes a famous musician",
        "Ask God to take the gift away since it causes attention",
      ],
      explanation: "Romans 12:4-5's picture of one body with many parts working together teaches that a gift is meant to be used within and for the community, not hidden.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is excellent at football but refuses to practise, believing the talent alone will always be enough to win matches. Which value from the CRE lesson on talents is ${who} missing?`,
      correct: "Responsibility — nurturing a talent requires consistent effort and discipline, not relying on natural ability alone",
      wrong: [
        "Unity — practising alone has nothing to do with teamwork values",
        "Talents never need any nurturing once God gives them",
        "Skipping practice is fine as long as the talent is strong enough",
      ],
      explanation: "The lesson's core value of responsibility teaches that nurturing a God-given talent takes disciplined effort, not just relying on raw ability.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} is very good at drawing and starts boasting that they are better than everyone else in class, refusing to help classmates who are struggling. What is the biblical response to this attitude, based on the lesson on talents?`,
    correct: "A talent should be used with humility to help others, not to boast or look down on people",
    wrong: [
      "Boasting about a talent is fine as long as the talent is genuine",
      "A talented person should stop using their gift around less-skilled classmates",
      "Talents are only valuable when other people are impressed by them",
    ],
    explanation: "Biblical teaching on talents (Exodus 31:3, Romans 12:4) emphasises serving others with a gift, and values like humility are needed to keep pride from taking over.",
  }),
  (rng) => ({
    prompt: `In ${place(rng)}, a class leader named ${name(rng)} uses their gift for organising to make sure every group member gets a turn to contribute during a group project. Which value does this best demonstrate?`,
    correct: "Unity — the talent is used so the whole group works well together",
    wrong: [
      "Isolation — organising for a group is the opposite of working alone",
      "Competition — this scenario is about cooperation, not rivalry",
      "Indifference — indifference would mean ignoring the group's needs",
    ],
    explanation: "Using an organising gift to help the whole group participate reflects the value of unity — the talent serves the community, not just one person.",
  }),
  (rng) => ({
    prompt: `${name(rng)} believes that only adults can have talents, and that children in ${place(rng)} are too young for God to have given them any abilities yet. Is this belief consistent with what CRE teaches about talents?`,
    correct: "No — the lesson teaches that God gives talents and abilities to people of all ages, including children, to be discovered and nurtured",
    wrong: [
      "Yes — God only distributes talents once a person turns eighteen",
      "Yes — children's talents do not count as real gifts from God",
      "No — but only very rare children ever receive any talent at all",
    ],
    explanation: "The lesson's outcome of discussing how learners use their own God-given talents assumes children already have real, God-given abilities worth nurturing now.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is skilled at teaching younger learners but stops helping because no one gives them any reward for it. What does Romans 12:4's picture of the body suggest about ${who}'s reasoning?`,
      correct: "Each gift functions for the good of the whole group, so it should be used even without a reward",
      wrong: [
        "Every gift should stop being used the moment it goes unrewarded",
        "Teaching gifts are less important than gifts that earn recognition",
        "Romans 12:4 teaches that gifts are only for people who are paid",
      ],
      explanation: "Romans 12:4's body analogy shows each part functioning for the good of the whole — a gift like teaching is meant to serve others regardless of reward.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know which specific tabernacle-building skill God is described as filling Bezalel with in Exodus 31:3. What kind of skill was it?`,
    correct: "Craftsmanship — skill for making things with his hands, including artistic and metal/wood work",
    wrong: [
      "Skill in preaching sermons to large crowds",
      "Skill in leading a nation's army into battle",
      "Skill in writing new books of the Bible",
    ],
    explanation: "Exodus 31:3 describes God filling Bezalel with skill, ability and knowledge in all kinds of craftsmanship to build the tabernacle.",
  }),
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, guided by ${name(rng)}, decides that only the learner with the "best" talent deserves encouragement, while others should stop trying. How does Romans 12:4 correct this idea?`,
    correct: "Every gift has a different function, and all of them are needed for the community to work well, not just the most impressive one",
    wrong: [
      "Romans 12:4 agrees that only the most impressive gift deserves encouragement",
      "Romans 12:4 says only one person in a community may have a real gift",
      "Romans 12:4 teaches that gifts should be ranked from best to worst",
    ],
    explanation: "Romans 12:4 pictures many different parts of one body, each with its own function — no single gift is dismissed as unimportant.",
  }),
];

export const myPurpose: Skill = {
  id: "g6-cre-cn-my-purpose",
  code: "CN.1",
  subjectId: "cre",
  strandId: "g6-cre-creation",
  grade: 6,
  title: "My Purpose (Talents and Abilities)",
  description: "God-given talents and abilities, biblical teaching from Exodus 31:3 and Romans 12:4, and the values needed to nurture and use talents to serve others.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (talent examples, nurturing values,
    // and the two named Bible texts), so `ordering` is deliberately skipped — 4 kinds is the honest cap here.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const expressive = shuffle(rng, TALENT_FACTS.filter((f) => f.group === "expressive")).slice(0, 4);
      const service = shuffle(rng, TALENT_FACTS.filter((f) => f.group === "service")).slice(0, 4);
      const chosen = shuffle(rng, [...expressive, ...service]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "expressive", label: "Creative / performance talent" },
          { id: "service", label: "Leadership / service talent" },
        ],
        correctBucket,
        hint: "Creative talents are usually performed or expressed; leadership and service talents usually help organise or care for others directly.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "expressive" ? "creative/performance talent" : "leadership/service talent"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TALENT_VALUE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.term })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.evidence })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.term] = a.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about the value a person needs to keep growing and rightly using each kind of talent.",
        explanation: chosen.map((a) => `${a.term} — ${a.evidence.toLowerCase()}.`).join(" "),
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
        hint: "Think about what Exodus 31:3 and Romans 12:4 teach about where talents come from and how they should be used.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Exodus 31:3 says God filled Bezalel with the Spirit of God, wisdom, understanding, knowledge, and all kinds of", after: ".", answer: "skills", accepted: ["skills", "skill"] },
      { before: "God gave Bezalel craftsmanship skill in order to help build the", after: ".", answer: "tabernacle", accepted: ["tabernacle"] },
      { before: "Romans 12:4 teaches that the body has many parts, and the parts do not all have the same", after: ".", answer: "function", accepted: ["function", "functions"] },
      { before: "According to Romans 12:4, different people are given different", after: "to serve their community.", answer: "gifts", accepted: ["gifts", "talents", "abilities"] },
      { before: "A God-given talent is meant to be used to serve", after: ", not just for personal pride.", answer: "others", accepted: ["others"] },
      { before: "The value of", after: "helps a person keep practising and improving a God-given talent.", answer: "responsibility", accepted: ["responsibility"] },
      { before: "The value of", after: "helps a talented person work well together with a group instead of only pleasing themselves.", answer: "unity", accepted: ["unity"] },
      { before: "Bezalel's talent was for", after: ", meaning skilled work done with the hands.", answer: "craftsmanship", accepted: ["craftsmanship"] },
      { before: "A talented singer needs the value of", after: "so their gift blesses others instead of feeding pride.", answer: "humility", accepted: ["humility"] },
      { before: "Romans 12:4 compares believers with different gifts to the many parts of one", after: ".", answer: "body", accepted: ["body"] },
      { before: "Nurturing a talent well requires regular practice and", after: ", not relying on natural ability alone.", answer: "discipline", accepted: ["discipline"] },
      { before: "The key inquiry question for this lesson asks how you use your God-given talents and", after: ".", answer: "abilities", accepted: ["abilities"] },
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
      hint: "Think about Exodus 31:3, Romans 12:4, and the values needed to nurture a talent.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
