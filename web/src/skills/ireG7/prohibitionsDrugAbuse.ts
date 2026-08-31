import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No `ordering` branch: named drugs, effects, rationale, and remedies are related fact sets,
// not a curriculum-stated sequence — a 5th QuestionKind is not manufactured here.

const CATEGORIZE_PROMPTS = [
  "Sort each statement as an effect of drug abuse, the rationale for its prohibition, or a remedy.",
  "Group each statement under an effect, a rationale, or a remedy.",
  "Decide whether each statement is an effect, a rationale, or a remedy, and sort it there.",
  "Sort each statement into the correct category: effect, rationale, or remedy.",
  "Place each statement into the right bucket — effect, rationale, or remedy.",
  "Categorise each statement as an effect of drug abuse, its rationale, or a remedy.",
];

const MATCH_PROMPTS = [
  "Match each term about drug abuse to its meaning.",
  "Pair each term about drug abuse with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term about drug abuse to the definition that fits it.",
  "Choose the correct meaning for each term about drug abuse.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word or term.",
  "Which word or term completes this sentence?",
  "Complete the sentence with the correct word or term.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

interface TopicFact {
  text: string;
  topic: "effect" | "rationale" | "remedy";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  effect: "An effect of drug abuse",
  rationale: "The Islamic rationale for prohibiting drugs",
  remedy: "A remedy for drug abuse",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Drug abuse harms physical and mental health", topic: "effect" },
  { text: "Drug abuse can lead to addiction that is difficult to break", topic: "effect" },
  { text: "Drug abuse often causes poor performance in school or work", topic: "effect" },
  { text: "Drug abuse strains relationships with family members", topic: "effect" },
  { text: "Drug abuse increases the risk of engaging in crime to sustain the habit", topic: "effect" },
  { text: "Drugs impair the sound mind and judgement needed for worship and daily decisions", topic: "rationale" },
  { text: "The body is regarded as an amanah (trust) from Allah that must be protected, not harmed", topic: "rationale" },
  { text: "Loss of self-control from drug use can lead a person into further sin", topic: "rationale" },
  { text: "Protecting the mind and body from harm is part of upholding Islamic moral responsibility", topic: "rationale" },
  { text: "Rehabilitation and treatment can help a person recover from drug abuse", topic: "remedy" },
  { text: "Support from family and community helps a person avoid or overcome drug abuse", topic: "remedy" },
  { text: "Seeking help from a trusted adult or organisation such as NACADA is an effective remedy", topic: "remedy" },
  { text: "Avoiding situations with strong peer pressure around drugs helps prevent abuse before it starts", topic: "remedy" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Bhang", meaning: "A named example of a prohibited drug (cannabis)" },
  { term: "Khat", meaning: "A named example of a prohibited stimulant plant (also known as miraa)" },
  { term: "Amanah", meaning: "A trust — how the body is described in the Islamic rationale for prohibiting drugs" },
  { term: "NACADA", meaning: "An organisation a learner can seek help from regarding drug abuse" },
  { term: "Addiction", meaning: "A difficult-to-break dependency that can result from drug abuse" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

// Recall/Apply-tier templates (facts about effects, rationale, remedies applied to a situation).
const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} starts falling behind in schoolwork and missing assignments after beginning to use bhang regularly with older boys in the neighbourhood. Which effect of drug abuse does this best illustrate?`,
    correct: "Poor performance in school, a well-documented effect of drug abuse",
    wrong: ["Improved focus, since some drugs are believed to help concentration", "No real effect, since falling grades are unrelated to drug use", "Strengthened family relationships, since shared activity with peers builds bonds"],
    explanation: "Declining school performance is a direct, well-documented effect of drug abuse — the scenario traces that specific consequence, not a random unrelated outcome.",
  }),
  (rng) => ({
    prompt: `${name(rng)} explains to a younger sibling in ${place(rng)} why Islam prohibits drugs like heroin and cocaine, beyond just the physical harm. What additional Islamic rationale should be included?`,
    correct: "Drugs impair the sound mind and judgement Islam requires for worship and daily decisions, and the body is regarded as an amanah (trust) from Allah",
    wrong: ["There is no additional rationale beyond physical harm in Islamic teaching", "The rationale is purely about avoiding legal trouble, with no religious basis", "Drugs are prohibited only because they are expensive, not for any moral reason"],
    explanation: "Beyond physical harm, Islamic rationale includes protecting the sound mind needed for worship and honouring the body as an amanah (trust) from Allah.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)}, worried about a friend using khat heavily, decides the best first step is to talk to a trusted adult and consider guidance from an organisation like NACADA. Is this an effective remedy?`,
    correct: "Yes — seeking help from a trusted adult or an organisation such as NACADA is named as an effective remedy for drug abuse",
    wrong: ["No — remedies for drug abuse should never involve outside organisations", "No — the only effective remedy is for the person to simply stop unaided, with no outside help", "Yes — but only because NACADA specifically only handles heroin and cocaine cases"],
    explanation: "Seeking support from a trusted adult or an organisation such as NACADA is explicitly named as an effective remedy for drug abuse.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that since khat is a plant rather than a manufactured drug, it cannot really cause the same kind of harm as heroin or cocaine. Evaluate this reasoning.`,
    correct: "Flawed — khat is named alongside bhang, heroin, and cocaine as an example drug of concern in Islamic teaching, regardless of whether it is plant-based or manufactured",
    wrong: ["Sound — plant-based substances are automatically harmless in any amount", "Sound — only manufactured drugs are ever named as a concern in Islamic teaching", "Flawed — but only because khat is actually more dangerous than heroin"],
    explanation: "Being plant-based does not exempt khat from concern — it is explicitly named alongside bhang, heroin, and cocaine as an example drug covered by this teaching.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices a close friend has started stealing small amounts of money from family members since beginning to use drugs. Which effect of drug abuse does this reflect?`,
      correct: "An increased risk of turning to crime to sustain the habit, a recognised effect of drug abuse",
      wrong: ["Improved family relationships, since increased contact with family members is involved", "No real effect, since stealing is unrelated to drug use in this context", "A sign that the drug use has actually stopped, not continued"],
      explanation: "Turning to theft to sustain a drug habit is a recognised effect of drug abuse — the risk of crime rising alongside dependency.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that once addiction sets in, remedies like rehabilitation or family support 'never actually work.' Evaluate this claim.`,
    correct: "Flawed — rehabilitation, along with support from family and community, is named as a genuine, effective remedy for drug abuse, not a hopeless effort",
    wrong: ["Sound — no remedy has any realistic chance of helping someone recover", "Sound — rehabilitation only works for drugs other than the ones named in this teaching", "Flawed — but only because addiction is not actually a real difficulty to overcome"],
    explanation: "Rehabilitation and family/community support are specifically named as effective remedies for drug abuse, not dismissed as hopeless.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says avoiding drug abuse is purely a matter of willpower, and that avoiding peer-pressure situations makes no real difference. Evaluate this claim.`,
    correct: "Flawed — avoiding situations with strong peer pressure around drugs is itself named as an effective way to prevent abuse before it starts, alongside personal willpower",
    wrong: ["Sound — the situations a person is in have no bearing on drug use at all", "Sound — peer pressure is not a real factor in why people begin using drugs", "Flawed — but only because willpower actually has no role in preventing drug abuse"],
    explanation: "Avoiding peer-pressure situations is explicitly named as a preventive remedy — situational choices matter alongside personal willpower, not instead of it.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that Islam's prohibition of drugs is really just an outdated cultural rule with no deeper reasoning behind it. Evaluate this claim.`,
    correct: "Flawed — the prohibition rests on real reasoning: protecting the sound mind needed for worship and decisions, and honouring the body as an amanah entrusted by Allah",
    wrong: ["Sound — there is genuinely no reasoning behind the prohibition beyond tradition", "Sound — the prohibition only exists because of modern law, not Islamic teaching", "Flawed — but only because the prohibition is actually about avoiding financial cost"],
    explanation: "The Islamic prohibition of drugs is grounded in real rationale — protecting sound judgement for worship and decisions, and safeguarding the body as an amanah from Allah — not an unexplained tradition.",
  }),
  // Genuine Analyze/Evaluate-tier branches, per RIGOR-STANDARDS.md's requirement that a
  // sub-strand naming "Critical thinking and problem solving" as a core competency needs at
  // least one such branch: judging which of several peer-pressure responses is actually effective.
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is offered bhang at a gathering and, instead of arguing, simply says "No thanks, I don't use that" and walks over to join a different group of friends. A classmate says this response was "too weak" and that ${who} should have delivered a long lecture on the dangers of drugs instead. Evaluate which response is actually more effective.`,
      correct: `${who}'s brief, firm refusal followed by leaving the situation is more effective — it avoids prolonged exposure to pressure and does not escalate confrontation`,
      wrong: [
        "The classmate is right — a long lecture is always the most effective response to peer pressure",
        "Neither response matters, since peer pressure cannot realistically be resisted once it begins",
        `${who} should have stayed and kept arguing the point until the group agreed`,
      ],
      explanation: "A short, firm refusal paired with removing oneself from the situation reduces exposure to pressure without escalating conflict — a long lecture can prolong the confrontation and give peer pressure more opportunity to work.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} learns that a friend has been using khat to "stay awake and study longer" before exams. ${who} is deciding between three responses: (a) reporting the friend to the school immediately with no conversation first, (b) quietly talking to the friend, expressing concern, and suggesting they speak to a trusted adult or counsellor together, or (c) saying nothing since it is "not my business." Which response best balances genuine care with an effective remedy?`,
      correct: "Response (b) — approaching the friend directly with concern and guiding them toward a trusted adult or counsellor addresses the problem while preserving trust",
      wrong: [
        "Response (a) — reporting immediately with no conversation first is the most effective option in every case",
        "Response (c) — saying nothing is the safest and most respectful choice",
        "All three responses are equally effective, since the outcome will be the same regardless",
      ],
      explanation: "Directly but gently raising the concern and guiding a friend toward proper support (a trusted adult or counsellor) addresses the real problem while keeping trust intact — silence ignores a real risk, and reporting with no conversation first can damage trust unnecessarily before support is even offered.",
    };
  },
];

export const prohibitionsDrugAbuse: Skill = {
  id: "g7-ire-ak-drug-abuse",
  code: "AK.3",
  subjectId: "ire",
  strandId: "g7-ire-akhlaq",
  grade: 7,
  title: "Prohibitions in Islam — Drug Abuse",
  description: "The effects of drug abuse, the Islamic rationale for its prohibition, and remedies for drug abuse, including evaluating effective responses to peer pressure.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const effect = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "effect")).slice(0, 4);
      const rationale = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "rationale")).slice(0, 3);
      const remedy = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "remedy")).slice(0, 4);
      const chosen = shuffle(rng, [...effect, ...rationale, ...remedy]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["effect", "rationale", "remedy"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Effects are consequences, rationale is why it's prohibited, and remedies are ways to address or prevent it.",
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
        hint: "Think about whether the term names a specific drug, a consequence, or a source of help.",
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
        hint: "Think about which effect, rationale, or remedy the situation is actually pointing to — and, for peer-pressure scenarios, which response genuinely reduces risk.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: `Named example drugs covered in this teaching include bhang, heroin, cocaine, and`, after: ".", answer: "khat", accepted: ["khat", "miraa"] },
      { before: "Drug abuse often causes poor performance in", after: "or work.", answer: "school", accepted: ["school"] },
      { before: "Drug abuse can lead to", after: "that is difficult to break.", answer: "addiction", accepted: ["addiction"] },
      { before: "Drugs impair the sound", after: "needed for worship and daily decisions.", answer: "mind", accepted: ["mind", "judgement"] },
      { before: "The body is regarded in Islamic teaching as an", after: "(trust) from Allah.", answer: "amanah", accepted: ["amanah"] },
      { before: "Loss of self-control from drug use can lead a person into further", after: ".", answer: "sin", accepted: ["sin"] },
      { before: "A trusted adult or an organisation such as", after: "can help with drug abuse.", answer: "NACADA", accepted: ["nacada"] },
      { before: "Support from family and", after: "helps a person avoid or overcome drug abuse.", answer: "community", accepted: ["community"] },
      { before: "Avoiding situations with strong", after: "helps prevent drug abuse before it starts.", answer: "peer pressure", accepted: ["peer pressure"] },
      { before: "Drug abuse increases the risk of turning to", after: "to sustain the habit.", answer: "crime", accepted: ["crime"] },
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
      hint: "Recall the effects, rationale, and remedies for drug abuse.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
