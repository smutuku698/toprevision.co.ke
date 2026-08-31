import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement about friendship as wise companionship or a warning sign of bad influence.",
    "these facts about friends into wise companionship or a warning sign.",
    "each statement below by whether it is about wise companionship or a warning sign of bad influence.",
    "each fact into the bucket for wise companionship or a warning sign of bad influence.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term about friendship to its meaning.",
    "each idea below with what it means for choosing good friends.",
    "each term about friendship to the explanation that fits it.",
    "each term to the explanation of why it matters for friendship formation.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about friendship.",
    "the correct missing word.",
  ],
);

interface FriendFact {
  text: string;
  kind: "wise" | "warning";
}

// 1 Corinthians 15:33, Proverbs 13:20-21, Proverbs 16:28-29 — the three key texts named in this sub-strand.
const FRIEND_FACTS: FriendFact[] = [
  { text: "Proverbs 13:20 says whoever walks with the wise becomes wise", kind: "wise" },
  { text: "Proverbs 13:21 says prosperity rewards the righteous", kind: "wise" },
  { text: "Walking closely with wise, morally upright friends helps a person grow wiser too", kind: "wise" },
  { text: "Good friends encourage each other toward honesty and doing what is right", kind: "wise" },
  { text: "A trustworthy friend keeps their word and can be relied on over time", kind: "wise" },
  { text: "A good friend celebrates another's success instead of feeling jealous", kind: "wise" },
  { text: "1 Corinthians 15:33 warns that bad company corrupts good character", kind: "warning" },
  { text: "Proverbs 13:20 warns that a companion of fools suffers harm", kind: "warning" },
  { text: "Proverbs 13:21 warns that misfortune pursues sinners", kind: "warning" },
  { text: "Proverbs 16:28 warns that a perverse person stirs up conflict", kind: "warning" },
  { text: "Proverbs 16:28 warns that a gossip separates close friends", kind: "warning" },
  { text: "Proverbs 16:29 warns that a violent person entices a neighbour and leads them down a path that is not good", kind: "warning" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "1 Corinthians 15:33", meaning: "Warns that bad company corrupts good character" },
  { term: "Proverbs 13:20-21", meaning: "Teaches that walking with the wise makes a person wise, while a companion of fools suffers harm" },
  { term: "Proverbs 16:28-29", meaning: "Warns against gossip, conflict-stirring, and being led down a bad path by a violent friend" },
  { term: "Gossip", meaning: "Spreading rumours or private information about others, which Proverbs 16:28 says separates close friends" },
  { term: "Peer pressure", meaning: "Feeling pushed by friends or classmates to act in a certain way" },
  { term: "Negative peer influence", meaning: "Pressure from companions that pushes someone toward harmful or wrong choices" },
  { term: "Loyalty", meaning: "A good friend's quality of staying committed and dependable over time" },
  { term: "Honesty in friendship", meaning: "A good friend telling the truth, even when it is hard to hear" },
  { term: "Corrupted character", meaning: "What 1 Corinthians 15:33 warns can happen when someone keeps bad company" },
  { term: "Encouragement toward good", meaning: "A quality of a good friend, who pushes a person toward right choices rather than wrong ones" },
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
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} starts spending time with a group of classmates who often skip homework and encourage others to do the same. After a few weeks, ${who} also stops doing homework. Which Bible teaching best explains what happened?`,
      correct: "1 Corinthians 15:33 — bad company corrupts good character",
      wrong: [
        "Proverbs 16:29 — a violent person leads a neighbour down a bad path (this is about violence, not homework habits)",
        "Proverbs 13:21 — prosperity rewards the righteous",
        "None of the texts relate to peer influence on habits",
      ],
      explanation: "1 Corinthians 15:33 directly warns that bad company corrupts good character — spending time with classmates who skip homework gradually pulled the person's own habits down.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps close friends who study hard, are honest, and encourage each other to do well in school. According to Proverbs 13:20, what is likely to happen to ${name(rng)} over time?`,
    correct: "They are likely to become wiser themselves, since whoever walks with the wise becomes wise",
    wrong: [
      "They will suffer harm, since companions of fools suffer harm",
      "Nothing will change, since friends never influence a person's character",
      "They will become less wise, since studying too much is discouraged",
    ],
    explanation: "Proverbs 13:20 teaches that whoever walks with the wise becomes wise — spending time with hardworking, honest friends tends to shape a person in that same direction.",
  }),
  (rng) => ({
    prompt: `A learner in ${place(rng)} keeps telling other classmates private secrets that a friend shared with them in confidence. Which Bible warning from Proverbs 16:28-29 does this describe?`,
    correct: "A gossip separates close friends",
    wrong: [
      "A perverse person stirs up conflict through violence",
      "Whoever walks with the wise becomes wise",
      "Misfortune pursues sinners",
    ],
    explanation: "Proverbs 16:28 specifically warns that a gossip separates close friends — sharing someone's private secrets is exactly the kind of gossip this verse warns against.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} has a friend who frequently starts arguments and turns small disagreements into big fights among the group. Which warning from Proverbs 16:28-29 fits this friend's behaviour?`,
      correct: "A perverse person stirs up conflict",
      wrong: ["Whoever walks with the wise becomes wise", "A gossip separates close friends", "Prosperity rewards the righteous"],
      explanation: "Proverbs 16:28 warns that a perverse person stirs up conflict — a friend who constantly turns disagreements into fights matches this specific warning.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is invited by a new friend to try something risky and dangerous that the friend insists is "no big deal." Which warning from Proverbs 16:29 applies most directly here?`,
    correct: "A violent person entices a neighbour and leads them down a path that is not good",
    wrong: [
      "A companion of fools suffers harm only if caught by an adult",
      "Whoever walks with the wise becomes wise regardless of the activity",
      "Bad company only matters for adults, not young people",
    ],
    explanation: "Proverbs 16:29 warns that a violent or reckless person entices others and leads them down a path that is not good — being pressured into something risky by a friend matches this warning directly.",
  }),
  (rng) => ({
    prompt: `${name(rng)} chooses friends carefully, avoiding those who mock good behaviour, and instead spends time with classmates who are honest and hardworking. What is this an example of?`,
    correct: "Applying Proverbs 13:20-21 by choosing companions who lead toward wisdom, not harm",
    wrong: [
      "Ignoring biblical teaching on friendship entirely",
      "Following Proverbs 16:28's warning about gossip specifically",
      "An example that has nothing to do with any of the three key texts",
    ],
    explanation: "Deliberately choosing wise, hardworking companions over those who mock good behaviour is a direct, practical application of Proverbs 13:20-21's teaching on companionship.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices that ever since joining a certain friend group, they have started lying to their parents and skipping chores. What should ${who} recognise about this friend group, based on 1 Corinthians 15:33?`,
      correct: "This is a real example of bad company corrupting good character, and it is worth reconsidering the friendships",
      wrong: [
        "This has nothing to do with the friend group and is simply a personal choice unrelated to influence",
        "1 Corinthians 15:33 only applies to adults, not young people in school",
        "Lying and skipping chores are unrelated to the idea of corrupted character",
      ],
      explanation: "1 Corinthians 15:33's warning that bad company corrupts good character is exactly what this situation shows — new, harmful habits appearing after joining a certain friend group.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what quality to look for first when choosing a close friend, according to CRE's teaching on friendship formation. What is the best answer?`,
    correct: "Whether the person is morally upright and encourages good, honest behaviour",
    wrong: [
      "Whether the person is the most popular learner in class",
      "Whether the person always agrees with everything said to them",
      "Whether the person can provide the most exciting entertainment",
    ],
    explanation: "This sub-strand's outcome is to desire friends who are morally upright — popularity, constant agreement, and entertainment value are not the biblical measure of a good friend.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is pressured by classmates to cheat on a test, being told "everyone does it, you'll be left behind otherwise." What is the wisest response, based on this sub-strand's teaching on avoiding negative peer influence?`,
    correct: "Refuse the pressure and seek out friends who support honest, responsible choices instead",
    wrong: [
      "Go along with it since resisting peer pressure is never realistic",
      "Report the entire class to avoid making any personal decision",
      "Cheat only once, since a single instance does not count as bad influence",
    ],
    explanation: "Resisting negative peer influence and choosing morally upright friends is exactly the response this sub-strand's outcomes call for — not going along with pressure or making excuses.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that as long as a friend is fun to be around, their honesty or influence on behaviour does not matter. How would Proverbs 13:20-21 respond to this view?`,
    correct: "It disagrees — walking with the wise brings wisdom, while a companion of fools brings harm, so a friend's character matters greatly",
    wrong: [
      "Proverbs 13:20-21 agrees that a friend's character does not matter, only how fun they are",
      "Proverbs 13:20-21 only discusses friendships between adults, not young people",
      "Proverbs 13:20-21 says wisdom and harm depend only on luck, not on choice of friends",
    ],
    explanation: "Proverbs 13:20-21 directly ties a companion's character to real consequences — wisdom from wise friends, harm from foolish ones — so character matters far more than how entertaining a friend is.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why CRE teaches learners to desire morally upright friends specifically, rather than just any friends. What is the best reason?`,
    correct: "Because the character of one's companions genuinely shapes one's own character, for better or worse",
    wrong: [
      "Because morally upright friends are simply easier to find than others",
      "Because CRE teaches that friendships have no real effect on a person's behaviour",
      "Because only morally upright people are capable of being friends at all",
    ],
    explanation: "1 Corinthians 15:33 and Proverbs 13:20-21 both teach that a companion's character rubs off on a person over time — this is why CRE emphasises choosing morally upright friends deliberately.",
  }),
];

export const friendshipFormation: Skill = {
  id: "g6-cre-cl-friendship",
  code: "CL.1",
  subjectId: "cre",
  strandId: "g6-cre-living",
  grade: 6,
  title: "Friendship Formation",
  description: "Biblical teachings on friendship from 1 Corinthians 15:33 and Proverbs 13:20-21, 16:28-29, and how to choose morally upright friends and resist negative peer influence.",
  generate(rng) {
    // No genuine narrative sequence exists in this sub-strand's content (Bible warnings/teachings and a key
    // inquiry question, not a step-by-step process), so `ordering` is deliberately skipped — 4 kinds is the
    // honest cap here, matching the precedent in inspiredWordOfGod.ts.
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const wise = shuffle(rng, FRIEND_FACTS.filter((f) => f.kind === "wise")).slice(0, 4);
      const warning = shuffle(rng, FRIEND_FACTS.filter((f) => f.kind === "warning")).slice(0, 4);
      const chosen = shuffle(rng, [...wise, ...warning]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "wise", label: "Wise companionship" },
          { id: "warning", label: "Warning sign of bad influence" },
        ],
        correctBucket,
        hint: "1 Corinthians 15:33 and Proverbs 13:20-21, 16:28-29 both praise wise companions and warn against harmful ones.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "wise" ? "wise companionship" : "a warning sign of bad influence"}.`).join(" "),
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
        hint: "Think about what each term or Bible reference means for choosing good friends.",
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
        hint: "Think about 1 Corinthians 15:33 and Proverbs 13:20-21, 16:28-29, and what makes a friend wise or harmful.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "1 Corinthians 15:33 warns that bad company corrupts good", after: ".", answer: "character", accepted: ["character"] },
      { before: "Proverbs 13:20 says whoever walks with the wise becomes", after: ".", answer: "wise", accepted: ["wise"] },
      { before: "Proverbs 13:20 warns that a companion of fools suffers", after: ".", answer: "harm", accepted: ["harm"] },
      { before: "Proverbs 13:21 says misfortune pursues", after: ", but prosperity rewards the righteous.", answer: "sinners", accepted: ["sinners"] },
      { before: "Proverbs 16:28 warns that a perverse person stirs up", after: ".", answer: "conflict", accepted: ["conflict"] },
      { before: "Proverbs 16:28 warns that a", after: "separates close friends.", answer: "gossip", accepted: ["gossip"] },
      { before: "Proverbs 16:29 warns that a violent person entices a", after: "and leads them down a bad path.", answer: "neighbour", accepted: ["neighbour", "neighbor"] },
      { before: "A good friend keeps their word and can be", after: "on over time.", answer: "relied", accepted: ["relied"] },
      { before: "Feeling pushed by classmates to act a certain way is called peer", after: ".", answer: "pressure", accepted: ["pressure"] },
      { before: "This sub-strand's values are responsibility and", after: ".", answer: "love", accepted: ["love"] },
      { before: "A good friend encourages honesty and doing what is", after: ".", answer: "right", accepted: ["right"] },
      { before: "Spreading rumours or private information about others is called", after: ".", answer: "gossip", accepted: ["gossip"] },
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
      hint: "Think about 1 Corinthians 15:33 and Proverbs 13:20-21, 16:28-29 on choosing good friends.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
