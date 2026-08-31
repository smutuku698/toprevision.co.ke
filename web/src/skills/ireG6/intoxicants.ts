import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No natural fixed sequence exists for this sub-strand, so the ordering branch uses a
// curriculum-reasonable real-world sequence: steps for curbing the use of intoxicants,
// following the sub-strand's own suggested learning experiences.
const ORDER_PROMPTS = [
  "Arrange these steps for curbing the use of intoxicants in a sensible order.",
  "Put these steps for preventing intoxicant use into a sensible order.",
  "Sequence these steps for curbing intoxicants, from first to last.",
  "Order these steps for helping a community avoid intoxicants.",
  "Sort these steps for curbing intoxicant use into a sensible order.",
  "Arrange these prevention steps in a sensible order.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of this sub-strand it describes.",
  "Group each statement under the aspect it describes.",
  "Decide which aspect each statement describes, and sort it there.",
  "Sort each fact into the aspect of intoxicants it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect.",
];

const MATCH_PROMPTS = [
  "Match each term about intoxicants to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about intoxicants.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const PREVENTION_STEPS = [
  { id: "education", label: "Learn about and understand the real dangers of intoxicants" },
  { id: "role-models", label: "Look to positive role models and mentors for guidance" },
  { id: "avoid-pressure", label: "Recognise and avoid situations involving peer pressure to try intoxicants" },
  { id: "alternatives", label: "Engage in productive alternative activities, such as sports, clubs, or work" },
  { id: "support", label: "Seek family and community support if faced with pressure or temptation" },
];

interface TopicFact {
  text: string;
  topic: "what-are-they" | "effects" | "prevention";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  "what-are-they": "What intoxicants are",
  effects: "Effects of intoxicants",
  prevention: "Ways of curbing intoxicant use",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Intoxicants are substances that impair the mind, such as alcohol and drugs", topic: "what-are-they" },
  { text: "Islam prohibits the use of intoxicants", topic: "what-are-they" },
  { text: "Intoxicants are considered harmful regardless of the amount used", topic: "what-are-they" },
  { text: "Intoxicants can cause harm to physical and mental health", topic: "effects" },
  { text: "Intoxicant use can damage family relationships", topic: "effects" },
  { text: "Intoxicants can lead to poor decision-making and accidents", topic: "effects" },
  { text: "Intoxicant use can cause financial hardship for a person and their family", topic: "effects" },
  { text: "Intoxicant use can harm broader community wellbeing and safety", topic: "effects" },
  { text: "Education and awareness about the dangers of intoxicants helps prevent their use", topic: "prevention" },
  { text: "Positive role models and mentorship can help someone avoid intoxicants", topic: "prevention" },
  { text: "Engaging in productive activities like sports or clubs is a way to curb intoxicant use", topic: "prevention" },
  { text: "Family and community support help a person resist pressure to use intoxicants", topic: "prevention" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Intoxicant", meaning: "A substance that impairs the mind, such as alcohol or drugs" },
  { term: "Substance abuse", meaning: "The harmful, repeated use of intoxicants" },
  { term: "Peer pressure", meaning: "Influence from friends or classmates that can lead someone toward trying intoxicants" },
  { term: "Role model", meaning: "A person whose positive example helps others avoid harmful behaviour like intoxicant use" },
  { term: "Awareness", meaning: "Understanding the real dangers of intoxicants, a key prevention method" },
  { term: "Alternative activity", meaning: "A productive activity, like sport or clubs, used to fill time instead of risky behaviour" },
  { term: "Community support", meaning: "Help from family and community that strengthens a person's ability to resist pressure" },
  { term: "Wellbeing", meaning: "A person's overall health and safety, which Islam's prohibition of intoxicants aims to protect" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, is invited by older students to try a substance "just once, to see what it's like." What is the best response, applying Islamic teaching on intoxicants?`,
      correct: "Decline firmly and avoid the situation, since even trying an intoxicant once carries real risk and goes against Islamic teaching",
      wrong: [
        "Agree, since trying something only once causes no real harm",
        "Agree only if no adult finds out about it",
        "Wait to decide until seeing whether the older students seem to enjoy it",
      ],
      explanation: "Islamic teaching prohibits intoxicants because of the real risks they carry — declining firmly, even under pressure to try 'just once,' is the appropriate response.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices a classmate seems to be under pressure from older peers to try something harmful, and feels unsure whether to say anything. What would be the most supportive response?`,
      correct: "Encourage the classmate to resist the pressure and, if appropriate, involve a trusted adult for support",
      wrong: [
        "Stay silent, since peer pressure situations are not the concern of other learners",
        "Join in with the pressure to avoid standing out from the group",
        "Wait to see what happens before doing anything at all",
      ],
      explanation: "Supporting a friend facing peer pressure toward intoxicants — including involving trusted adults when appropriate — reflects the community-support approach to prevention.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} spends free time after school playing football with a local club instead of hanging around with a group known to experiment with harmful substances. What prevention strategy does this reflect?`,
    correct: "Engaging in a productive alternative activity that reduces exposure to risky situations",
    wrong: [
      "Avoiding exercise, since football has nothing to do with intoxicant prevention",
      "A strategy unrelated to prevention, since only direct warnings work",
      "A punishment for past behaviour, rather than a prevention strategy",
    ],
    explanation: "Choosing a productive activity like sport, instead of spending time in a risky environment, is a genuine, practical way to curb the temptation to use intoxicants.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} argues that since only adults are legally affected by alcohol laws, this topic has nothing to do with a Grade 6 learner. Evaluate this reasoning.`,
      correct: "Flawed — understanding the dangers of intoxicants and building good prevention habits now is valuable well before adulthood, especially given peer pressure risks",
      wrong: [
        "Sound — children face no risk of encountering pressure related to intoxicants",
        "Sound — awareness of these dangers should only begin in adulthood",
        "Flawed — but only because the law technically applies to children too",
      ],
      explanation: "Awareness and prevention habits built early — recognising peer pressure, choosing positive activities — genuinely protect a learner well before legal adulthood is relevant.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} says the only effective way to curb intoxicant use is punishment after the fact, with no value in education or role models beforehand. Is this reasoning sound?`,
    correct: "No — education, positive role models, and productive alternatives are all effective prevention strategies before any harm occurs",
    wrong: [
      "Yes — prevention strategies like education have no real effect on behaviour",
      "Yes — role models and alternative activities play no part in preventing intoxicant use",
      "No — but only punishment and education matter, not role models or activities",
    ],
    explanation: "Multiple prevention strategies — awareness, positive role models, productive alternatives, and community support — work together, not punishment alone after harm has already occurred.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why Islam's prohibition of intoxicants focuses on protecting more than just the individual person. What is the best explanation?`,
      correct: "Because intoxicant use can also harm families, relationships, and the wider community's safety and wellbeing, not just the individual",
      wrong: [
        "Because the prohibition actually has no connection to anyone besides the individual",
        "Because families and communities are never affected by an individual's choices",
        "Because Islam's teaching on this topic is concerned only with legal penalties",
      ],
      explanation: "The effects of intoxicant use — damaged relationships, financial hardship, community harm — extend well beyond the individual, which is part of why Islam's prohibition is framed broadly.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} believes that once someone starts using an intoxicant, there is no point in seeking help since the harm is already done. Evaluate this belief.`,
    correct: "Flawed — support, positive role models, and community help remain valuable at any stage in helping someone move away from harmful use",
    wrong: [
      "Sound — once harm begins, seeking support has no further value",
      "Sound — Islamic teaching offers no path back after any mistake",
      "Flawed — but only because punishment is the sole remaining option",
    ],
    explanation: "Support and positive influence remain genuinely valuable at any stage — this belief wrongly assumes help only matters before any harmful use has begun.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} tells a friend, "Islam only cares about big, dramatic sins, not everyday choices like avoiding harmful substances." Is this an accurate view of Islamic teaching on intoxicants?`,
    correct: "No — Islam treats avoiding intoxicants as a serious, everyday responsibility, directly protecting a person's mind, health, family, and community",
    wrong: [
      "Yes — everyday choices about intoxicants have no religious significance at all",
      "Yes — Islamic teaching only addresses this topic for adults in extreme cases",
      "No — but Islamic teaching actually permits intoxicant use in most situations",
    ],
    explanation: "Islam's prohibition of intoxicants is a serious, everyday matter — protecting mind, health, family, and community — not a minor or occasional concern.",
  }),
];

export const intoxicants: Skill = {
  id: "g6-ire-ak-intoxicants",
  code: "AK.3",
  subjectId: "ire",
  strandId: "g6-ire-akhlaq",
  grade: 6,
  title: "Prohibitions in Islam — Intoxicants",
  description: "Islam's prohibition of intoxicants: their effects on health, family, and community, and practical ways of curbing their use.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, PREVENTION_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in a sensible order for curbing intoxicant use.",
        items,
        correctOrder: PREVENTION_STEPS.map((s) => s.id),
        hint: "Prevention starts with understanding the dangers and builds toward productive alternatives and support.",
        explanation: PREVENTION_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const whatAreThey = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "what-are-they")).slice(0, 3);
      const effects = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "effects")).slice(0, 3);
      const prevention = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "prevention")).slice(0, 3);
      const chosen = shuffle(rng, [...whatAreThey, ...effects, ...prevention]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["what-are-they", "effects", "prevention"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about what intoxicants are, some about their effects, and some about curbing their use.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 5);
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
        hint: "Think about what each term refers to in the prevention of intoxicant use.",
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
        hint: "Think about what a responsible, prevention-focused response to the situation looks like.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Intoxicants are substances that impair the", after: ".", answer: "mind", accepted: ["mind"] },
      { before: "Islam", after: "the use of intoxicants.", answer: "prohibits", accepted: ["prohibits"] },
      { before: "Intoxicants can cause harm to physical and mental", after: ".", answer: "health", accepted: ["health"] },
      { before: "Intoxicant use can lead to poor decision-making and", after: ".", answer: "accidents", accepted: ["accidents"] },
      { before: "Education and", after: "about the dangers of intoxicants help prevent their use.", answer: "awareness", accepted: ["awareness"] },
      { before: "Positive", after: "and mentorship can help someone avoid intoxicants.", answer: "role models", accepted: ["role models"] },
      { before: "Engaging in productive alternative", after: "helps curb intoxicant use.", answer: "activities", accepted: ["activities"] },
      { before: "Intoxicant use can damage", after: "relationships.", answer: "family", accepted: ["family"] },
      { before: "Family and community", after: "help a person resist pressure to use intoxicants.", answer: "support", accepted: ["support"] },
      { before: "Intoxicants can harm broader community wellbeing and", after: ".", answer: "safety", accepted: ["safety"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall what intoxicants are, their effects, and ways of curbing their use.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
