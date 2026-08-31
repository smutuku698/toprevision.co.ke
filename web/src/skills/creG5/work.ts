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

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "these steps of a stewardship project in the order they should happen.",
    "these steps of caring for a school or home project in order.",
    "these stages of nurturing a project until harvest in the correct order.",
    "these steps the way a good steward of God's creation would follow them.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is a cause or an effect of child labour.",
    "these facts about child labour under the correct heading.",
    "each fact below by whether it leads to child labour or results from it.",
    "each statement into the bucket for cause or effect of child labour.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term below with its correct meaning.",
    "each idea about work and stewardship with its explanation.",
    "each term to the description that fits it.",
    "each term or verse to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about work and stewardship.",
    "the correct missing word.",
  ],
);

// The sub-strand's own learning experiences describe a genuine process sequence: "come up with different
// projects at school or home e.g. plant trees/vegetables, rear chicken and nurture the projects until they
// get results/harvest" — a real order of stewardship steps grounded directly in Genesis 2:15, not invented.
const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Choose a project such as planting vegetables or rearing chickens, as an act of good stewardship of God's creation (Genesis 2:15)" },
  { id: "n2", label: "Prepare the ground or shelter, then plant the seeds or bring in the chicks" },
  { id: "n3", label: "Water and weed the growing plants, or feed and clean up after the chickens, regularly" },
  { id: "n4", label: "Protect the project from pests, disease or danger, checking on it often" },
  { id: "n5", label: "Wait patiently and keep caring for the project as it grows over the following weeks" },
  { id: "n6", label: "Harvest the vegetables, or raise the chickens to maturity, as the result of faithful stewardship" },
];

interface EventFact { text: string; kind: "cause" | "effect" }
const EVENT_FACTS: EventFact[] = [
  { text: "Poverty at home forces some children to work for money instead of attending school", kind: "cause" },
  { text: "Some parents or guardians lack awareness about children's rights", kind: "cause" },
  { text: "Broken families or lack of parental care can leave a child unsupported and forced to fend for themselves", kind: "cause" },
  { text: "High school fees or lack of access to free education pushes some children into work", kind: "cause" },
  { text: "Some cultural beliefs undervalue a child's education compared to earning money", kind: "cause" },
  { text: "Some employers seek cheap labour and exploit vulnerable children", kind: "cause" },
  { text: "Children forced into work miss out on school and fall behind in their education", kind: "effect" },
  { text: "Child labour can expose children to dangerous work and serious injuries", kind: "effect" },
  { text: "Long working hours leave a child exhausted with no time to rest or play", kind: "effect" },
  { text: "Child labour denies a child their right to a normal, healthy childhood", kind: "effect" },
  { text: "Children in child labour may suffer abuse or exploitation by employers", kind: "effect" },
  { text: "Child labour can trap a child in a cycle of poverty that continues into adulthood", kind: "effect" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Genesis 1:26", meaning: "The verse where God gives human beings responsibility to rule over the fish, birds, and every living creature" },
  { term: "Genesis 2:15", meaning: "The verse where God places the man in the garden of Eden to work it and take care of it" },
  { term: "Stewardship", meaning: "Taking good care of something that belongs to someone else, such as God's creation" },
  { term: "A role at home", meaning: "A responsibility such as sweeping, washing dishes, or feeding animals that a learner carries out for the family" },
  { term: "A role at school", meaning: "A responsibility such as keeping the classroom clean or watering the school garden" },
  { term: "A role at church", meaning: "A responsibility such as ushering, singing in the choir, or arranging chairs before a service" },
  { term: "Child labour", meaning: "Work that is too heavy, dangerous, or long for a child's age, denying them school and rest" },
  { term: "An age-appropriate chore", meaning: "A task suited to a child's age and strength, such as making a bed or feeding chickens" },
  { term: "Childline Kenya (116)", meaning: "A toll-free helpline a child can call to report abuse, including forced child labour" },
  { term: "A trusted teacher", meaning: "An adult at school a child can report to if forced into child labour" },
  { term: "A chief or children's officer", meaning: "A local authority a child or family can report a child labour case to" },
  { term: "An environmental project", meaning: "An activity such as planting trees or vegetables that shows stewardship of God's creation" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Mumbi", "Owino", "Chepkoech", "Kariuki", "Nafula", "Kiplimo", "Waweru", "Achola", "Sang", "Wafula", "Njeri", "Odera"] as const;
const KENYAN_PLACES = ["Nyeri", "Busia", "Kericho", "Kitengela", "Marsabit", "Siaya", "Kabarnet", "Mtwapa", "Kerugoya", "Iten", "Rongo", "Limuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads Genesis 1:26, where God gives human beings responsibility over the fish, birds, and every living creature. What does this verse teach about why people work?`,
    correct: "Work is a God-given responsibility to care for and manage creation, not just a way to earn money",
    wrong: [
      "Genesis 1:26 teaches that work only began as a punishment for sin",
      "Genesis 1:26 says only certain people have any responsibility over creation",
      "Genesis 1:26 has nothing to do with why people work today",
    ],
    explanation: "Genesis 1:26 gives human beings responsibility over creation from the very beginning — work and care for creation is a God-given purpose, not only a way of earning an income.",
  }),
  (rng) => ({
    prompt: `${name(rng)} plants a small vegetable garden at school in ${place(rng)} and waters it every day, weeding it carefully until harvest. Which Bible verse best describes this kind of responsibility?`,
    correct: "Genesis 2:15, where God places the man in the garden to work it and take care of it",
    wrong: [
      "Genesis 3:1-11, which describes the fall of man",
      "Jeremiah 29:11, about God's plans to prosper a person",
      "1 Peter 4:10, about serving others with a gift",
    ],
    explanation: "Genesis 2:15 shows God placing the first man in the garden specifically to work it and take care of it — a model for the daily responsibility of caring for a project like a garden.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked to sweep the compound and feed the family chickens every morning before school. What is this an example of?`,
      correct: "An age-appropriate chore that helps a young person practise responsibility at home",
      wrong: [
        "Child labour, since any daily chore before school is automatically harmful",
        "A punishment, since chores are only given to children who misbehave",
        "Work that only adults should ever be responsible for",
      ],
      explanation: "A short, manageable daily chore like sweeping and feeding chickens is age-appropriate work that builds responsibility, unlike child labour, which involves heavy, dangerous or excessive work.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is forced by an employer to work more than ten hours a day on a farm instead of attending school. Which best explains why this situation is called child labour?`,
    correct: "The work is excessive and denies the child their right to education and rest, unlike age-appropriate chores",
    wrong: [
      "It is child labour only because farm work specifically is always forbidden for children",
      "It is not child labour, since the child is at least being paid for the work",
      "It is child labour only if the employer is a stranger rather than a relative",
    ],
    explanation: "Child labour is defined by work that is excessive, dangerous, or that denies a child school and rest — not simply by the type of work or who the employer is.",
  }),
  (rng) => ({
    prompt: `A family in ${place(rng)}, guided by ${name(rng)}'s parents, cannot afford school fees, so their child is sent to work at a market stall all day instead of attending class. Which cause of child labour does this scenario best illustrate?`,
    correct: "Poverty and lack of access to affordable education",
    wrong: [
      "An employer specifically targeting the family out of cruelty",
      "The child's own personal choice to avoid attending school",
      "A cultural festival requiring the child's temporary absence",
    ],
    explanation: "Poverty and the high cost of education are named causes of child labour today — families under financial pressure may feel forced to send a child to work instead of school.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is being forced into heavy work by a relative and does not know who to tell. Based on the lesson on work, who could ${who} report this to?`,
      correct: "A trusted teacher, a chief or children's officer, or Childline Kenya on 116",
      wrong: [
        "No one, since the lesson teaches that child labour cases can never be reported",
        "Only a police officer, since teachers and chiefs are not able to help with this",
        "Another child at school, since adults should never be told about family matters",
      ],
      explanation: "The lesson names several people and services a child can report to if forced into child labour, including a trusted teacher, a chief or children's officer, and the Childline Kenya helpline (116).",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps her class garden project nurtured week after week, saying "it takes patience, but the harvest will come." Which value from Genesis 2:15's teaching on work does this best reflect?`,
    correct: "Good stewardship — caring consistently for what has been entrusted, not giving up before the results come",
    wrong: [
      "Impatience — waiting for a harvest has nothing to do with steady care",
      "Carelessness about the project, since watching it grow requires no real effort",
      "Competition with other classes over whose garden grows fastest",
    ],
    explanation: "Genesis 2:15's call to work and take care of creation is reflected in patient, consistent stewardship of a project until it produces results — exactly what a well-tended garden requires.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that only adults have any responsibilities from God, and that children have no role to play at home, school or church. Is this consistent with the lesson on work?`,
    correct: "No — the lesson teaches that learners also have real roles to play at home, school and church, suited to their age",
    wrong: [
      "Yes — Genesis 1:26 and 2:15 only ever address adults, never children",
      "Yes — children should wait until adulthood before taking on any role",
      "No — but only children who attend church have any role at all",
    ],
    explanation: "The lesson's outcome of outlining roles at home, school and church assumes learners already have real, age-appropriate responsibilities now, not only once they become adults.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices litter building up near the school garden and organises classmates to clean it up and protect the young plants from goats. What does this action demonstrate?`,
      correct: "Good stewardship of the environment, caring for what God has provided as Genesis 2:15 teaches",
      wrong: [
        "Wasted effort, since caring for a school environment is not a real responsibility",
        "Child labour, since any unpaid group task at school counts as child labour",
        "Disobedience, since cleaning without being specifically told to is against the rules",
      ],
      explanation: "Taking initiative to protect a shared project, like a school garden, from harm reflects the Genesis 2:15 call to work the land and take care of it — genuine, willing stewardship.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} compares two situations: a ten-year-old washing the family car on Saturday morning, and a ten-year-old working twelve-hour shifts at a quarry instead of going to school. What is the key difference between the two?`,
    correct: "One is an age-appropriate chore suited to the child's ability; the other is excessive, dangerous work that denies schooling",
    wrong: [
      "There is no real difference, since both situations count equally as child labour",
      "The difference is only about which day of the week the work happens on",
      "The difference is only about which family member gives the instruction",
    ],
    explanation: "Age-appropriate chores are manageable and do not interfere with school or safety; child labour, like the quarry example, is excessive and dangerous and denies a child's right to education.",
  }),
  (rng) => ({
    prompt: `A community group in ${place(rng)}, formed by ${name(rng)}, decides to plant trees along a riverbank as a school project and returns monthly to check on the seedlings. What responsibility from the Creation story does this best model?`,
    correct: "The responsibility God gave human beings to rule over and care for creation, as in Genesis 1:26",
    wrong: [
      "The responsibility to avoid all contact with the natural environment",
      "A responsibility that only applies to trained foresters, not ordinary learners",
      "A one-time task that does not need any ongoing care once completed",
    ],
    explanation: "Genesis 1:26 gives human beings responsibility over creation, including the environment — a planted-and-monitored tree project is a direct, practical way of living out that responsibility.",
  }),
];

export const work: Skill = {
  id: "g5-cre-cn-work",
  code: "CN.2",
  subjectId: "cre",
  strandId: "g5-cre-creation",
  grade: 5,
  title: "Work",
  description: "Human responsibilities given by God in Genesis 1:26 and Genesis 2:15, good stewardship of creation, roles at home, school and church, the causes and effects of child labour, who to report to, and age-appropriate chores.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, NARRATIVE_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: NARRATIVE_SEQUENCE.map((n) => n.id),
        hint: "Start with choosing the project, and end with the harvest — good stewardship, as in Genesis 2:15, takes patient, ongoing care.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const causes = shuffle(rng, EVENT_FACTS.filter((f) => f.kind === "cause")).slice(0, 4);
      const effects = shuffle(rng, EVENT_FACTS.filter((f) => f.kind === "effect")).slice(0, 4);
      const chosen = shuffle(rng, [...causes, ...effects]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "cause", label: "Cause of child labour" },
          { id: "effect", label: "Effect of child labour" },
        ],
        correctBucket,
        hint: "A cause is a reason child labour happens; an effect is a harmful result once a child is forced into it.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "cause" ? "cause of child labour" : "effect of child labour"}.`).join(" "),
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
        hint: "Think about Genesis 1:26, Genesis 2:15, roles at home, school and church, and who to report child labour to.",
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
        hint: "Think about Genesis 1:26, Genesis 2:15, and the difference between age-appropriate chores and child labour.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Genesis 1:26 gives human beings responsibility to rule over the fish, birds, and every living", after: ".", answer: "creature", accepted: ["creature", "creatures"] },
      { before: "Genesis 2:15 says God placed the man in the garden to work it and take", after: "of it.", answer: "care", accepted: ["care"] },
      { before: "Taking good care of something that belongs to God, such as creation, is called", after: ".", answer: "stewardship", accepted: ["stewardship"] },
      { before: "Work that is too heavy, dangerous, or long for a child's age is called child", after: ".", answer: "labour", accepted: ["labour", "labor"] },
      { before: "A chore suited to a child's age and strength is called an age-", after: "chore.", answer: "appropriate", accepted: ["appropriate"] },
      { before: "One cause of child labour today is", after: "at home, forcing children to work instead of attending school.", answer: "poverty", accepted: ["poverty"] },
      { before: "One effect of child labour is that children miss out on", after: "and fall behind.", answer: "school", accepted: ["school", "education"] },
      { before: "A child forced into child labour can call Childline Kenya on the toll-free number", after: ".", answer: "116", accepted: ["116"] },
      { before: "A child facing forced labour can report the matter to a trusted teacher, a chief, or a children's", after: ".", answer: "officer", accepted: ["officer"] },
      { before: "Learners can nurture a project such as planting vegetables or rearing chicken until they get", after: ".", answer: "results", accepted: ["results", "harvest"] },
      { before: "Every learner has responsibilities to carry out at home, school and", after: ".", answer: "church", accepted: ["church"] },
      { before: "Work is, according to Genesis, a responsibility given to human beings by", after: ", not merely a way to earn money.", answer: "God", accepted: ["god"] },
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
      hint: "Think about Genesis 1:26, Genesis 2:15, stewardship, and the causes and effects of child labour.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
