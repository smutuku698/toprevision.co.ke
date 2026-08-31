import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No `ordering` branch: the two selected Hadith are independent teachings (intention; choice of
// friends), not a stated sequence — a 5th QuestionKind is not manufactured here.

const HADITH_TEXTS = {
  intention: {
    narrator: "Umar bin Khattab (R.A.)",
    source: "Bukhari and Muslim",
    text: "I heard the Prophet (S.A.W.) say, actions are judged by intentions and everyone will get what was intended. So, the one whose hijrah was to Allah and His Messenger, then his hijrah was to Allah and His Messenger. The one whose hijrah was for the world to gain from it, or a woman to marry, then his hijrah was to what he made hijrah for.",
  },
  friends: {
    narrator: "Abu Musa (R.A.)",
    source: "Bukhari and Muslim",
    text: "The example of a good companion (who sits with you) in comparison with a bad one, is like that of the musk seller and the blacksmith's bellows (or furnace); from the first you would either buy musk or enjoy its good smell while the bellows would either burn your clothes or your house, or you get a bad nasty smell thereof.",
  },
} as const;

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which selected Hadith it belongs to.",
  "Group each statement under the selected Hadith it belongs to.",
  "Decide which selected Hadith each statement belongs to, and sort it there.",
  "Sort each statement into the correct Hadith it belongs to.",
  "Place each statement under the Hadith it belongs to.",
  "Read each statement and sort it under the matching selected Hadith.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word or name.",
  "Which word or name completes this sentence?",
  "Complete the sentence with the correct word or name.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

interface TopicFact {
  text: string;
  topic: "intention" | "friends";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  intention: "About the Hadith on intention",
  friends: "About the Hadith on choice of friends",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Actions are judged by the intention behind them, not just their outward form", topic: "intention" },
  { text: "A person whose migration (hijrah) was purely for Allah and His Messenger is rewarded for that intention", topic: "intention" },
  { text: "A person whose migration was really for worldly gain only receives what he intended, not spiritual reward", topic: "intention" },
  { text: "Two people can perform the exact same outward act with very different rewards, based on intention alone", topic: "intention" },
  { text: "The Hadith is narrated by Umar bin Khattab (R.A.)", topic: "intention" },
  { text: "A good companion is compared to a musk seller — you either buy musk or at least enjoy the pleasant smell", topic: "friends" },
  { text: "A bad companion is compared to a blacksmith's bellows — you risk burnt clothes, a burnt house, or at least a bad smell", topic: "friends" },
  { text: "Even sitting near a bad companion carries a real risk of harm, just from proximity", topic: "friends" },
  { text: "A good companion can benefit you even without directly intending to, just as being near musk leaves a pleasant scent", topic: "friends" },
  { text: "The Hadith is narrated by Abu Musa (R.A.)", topic: "friends" },
  { text: "Both selected Hadith are recorded in Bukhari and Muslim", topic: "intention" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `Two learners in ${place(rng)} both donate the same amount to a school harambee. ${name(rng)} gives it sincerely to help, while a classmate gives it only to be praised publicly. According to the Hadith on intention, are their rewards equal?`,
    correct: "No — since actions are judged by intentions, the sincere giver earns spiritual reward while the one seeking praise gets only what he intended: praise, not reward from Allah",
    wrong: ["Yes — since the outward act (the donation) is identical, the reward must be identical", "No — but only because the amount donated actually differed between them", "Yes — intention has no bearing on reward according to this Hadith"],
    explanation: "The Hadith teaches that identical outward acts can carry very different value depending on intention — sincerity for Allah versus seeking praise changes what is actually earned.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} spends time regularly with a friend known for honesty and good manners. Applying the musk-seller/bellows analogy, what is the likely effect of this friendship?`,
      correct: `Like being near a musk seller, ${who} is likely to pick up positive habits or benefit from the friend's good character, even without directly trying`,
      wrong: ["No effect at all — the analogy only applies to buying actual perfume", "It guarantees harm, since any close friendship eventually causes damage", "The analogy shows friendship never influences a person's character either way"],
      explanation: "The Hadith compares a good companion to a musk seller — closeness to them tends to leave a positive influence, just as standing near musk leaves a pleasant scent, even without a direct transaction.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps close company with peers who frequently cheat and lie, insisting personally that he would 'never do the same.' What does the bellows analogy suggest about this situation?`,
    correct: "Even without directly copying the bad behaviour, staying close to it carries a real risk of harm — like standing near a blacksmith's bellows risks burnt clothes or a bad smell",
    wrong: ["There is no risk at all, since he has personally decided never to cheat or lie", "The analogy only applies if he actively participates in the cheating", "The Hadith says proximity to bad company always guarantees direct harm, with no other possible outcome"],
    explanation: "The bellows analogy warns that mere closeness to harmful influence carries risk — burnt clothes, a burnt house, or at minimum a bad smell — even without directly adopting the behaviour.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that the Hadith on intention means outward actions do not matter at all, only what is in the heart. Evaluate this reasoning.`,
    correct: "Flawed — the Hadith shows intention determines the value/reward of an action, not that the action itself is unnecessary; both the deed and the intention behind it matter",
    wrong: ["Sound — outward actions are completely irrelevant according to this Hadith", "Sound — the Hadith explicitly says deeds should be abandoned entirely", "Flawed — but only because intention actually has no role at all"],
    explanation: "The Hadith addresses how an action is judged (by its intention), not whether the action itself is needed — both the deed and the sincerity behind it remain necessary.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is choosing between two study groups: one known for supporting each other's growth, another known for gossip and shortcuts on assignments. Using the two selected Hadith together, what is the wisest choice and why?`,
      correct: "Join the supportive group, since both good intention behind the choice and the influence of good companionship (the musk-seller comparison) point toward growth rather than harm",
      wrong: ["Either group is equally fine, since intention alone determines the outcome regardless of company kept", "Join the group with shortcuts, since it will not affect personal character at all", "Neither Hadith has any relevance to choosing between the two groups"],
      explanation: `The intention Hadith reminds ${who} to choose for the right reason (genuine growth, not convenience), while the friends Hadith reminds them that the company itself shapes influence — together they point clearly toward the supportive group.`,
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} migrated to a new town saying it was 'for Allah's sake,' but was really only chasing a better-paying job. According to the Hadith on intention, what does he actually receive?`,
    correct: "Only what he truly intended — the worldly gain he was seeking, not the spiritual reward of a migration made purely for Allah",
    wrong: ["The full spiritual reward, since he claimed it was for Allah's sake", "No outcome at all, since dishonest intentions cancel any result", "Double reward, since both spiritual and worldly motives were present"],
    explanation: "The Hadith states plainly that a person whose migration was really for worldly gain receives what he made it for — the worldly gain, not the spiritual reward of sincere intention.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says a person's character is shaped entirely by their own choices, and the people around them have no real influence at all. How does the Hadith on choice of friends respond to this view?`,
    correct: "It challenges this view directly — the musk-seller and bellows comparison shows that the company one keeps genuinely shapes outcomes, for better or worse",
    wrong: ["It fully agrees — the Hadith says companionship has no effect on a person", "It is unrelated to this question, since the Hadith only discusses buying and selling", "It says only bad companions have influence, while good companions have none"],
    explanation: "The Hadith's whole point is that companionship has real influence, illustrated through both the positive (musk seller) and negative (bellows) comparisons — company is not neutral.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the Hadith on choice of friends only warns against bad friends, with nothing positive to say about good ones. Is this an accurate reading?`,
    correct: "No — the Hadith gives both a positive comparison (a musk seller, whose company can bring benefit or a pleasant smell) and a negative one (a blacksmith's bellows, which risks harm)",
    wrong: ["Yes — the Hadith is entirely a warning with no positive comparison at all", "Yes — the musk seller comparison is actually about bad company, not good", "No — but only because the Hadith never mentions any comparison at all"],
    explanation: "The Hadith explicitly gives two comparisons — a musk seller for a good companion, and a blacksmith's bellows for a bad one — covering both positive and negative influence.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that as long as an action looks religious on the outside, its reward is guaranteed regardless of the reason behind it. Which selected Hadith directly challenges this claim, and how?`,
    correct: "The Hadith on intention — it teaches that actions are judged by the intention behind them, not by their outward appearance alone",
    wrong: ["The Hadith on choice of friends — it only discusses companionship, not the appearance of actions", "Neither Hadith addresses this claim in any way", "Both Hadith actually support this claim, since outward acts are described as most important"],
    explanation: "The Hadith on intention states plainly that actions are judged by intentions — an outwardly religious-looking act with the wrong underlying intention does not earn the reward this claim assumes.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants one practical lesson to apply from the two selected Hadith together. Which is the best combined lesson?`,
    correct: "Examine your own intentions honestly before acting, and choose companions carefully, since both what drives you and who surrounds you shape the outcome",
    wrong: ["Focus only on choosing good friends, since intention never actually matters", "Focus only on intention, since the company kept has no real effect on a person", "Neither Hadith offers any practical lesson for daily life"],
    explanation: "Together, the two Hadith teach that both an honest inner intention and careful choice of companionship shape a Muslim's outcomes — neither factor alone tells the whole story.",
  }),
];

export const selectedHadith: Skill = {
  id: "g7-ire-ha-selected-hadith",
  code: "HA.2",
  subjectId: "ire",
  strandId: "g7-ire-hadith",
  grade: 7,
  title: "Selected Hadith — Intention and Choice of Friends",
  description: "The Hadith on intention (Umar bin Khattab, R.A.) and the Hadith on choice of friends (Abu Musa, R.A.), both recorded in Bukhari and Muslim, and their lessons for daily life.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "reasoning", "reasoning2", "fill-blank"] as const);

    if (branch === "categorize") {
      const intention = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "intention")).slice(0, 4);
      const friends = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "friends")).slice(0, 4);
      const chosen = shuffle(rng, [...intention, ...friends]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        passage: `Hadith on intention (${HADITH_TEXTS.intention.narrator}, ${HADITH_TEXTS.intention.source}): "${HADITH_TEXTS.intention.text}"\n\nHadith on choice of friends (${HADITH_TEXTS.friends.narrator}, ${HADITH_TEXTS.friends.source}): "${HADITH_TEXTS.friends.text}"`,
        items,
        buckets: (["intention", "friends"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "One Hadith is about how actions are judged; the other is about the influence of a good or bad companion.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning" || branch === "reasoning2") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about whether the situation is really about the reason behind an action, or about the influence of company kept.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Hadith on intention was narrated by", after: ".", answer: "Umar bin Khattab", accepted: ["umar bin khattab", "umar", "umar ibn al-khattab"] },
      { before: "The Hadith on choice of friends was narrated by", after: ".", answer: "Abu Musa", accepted: ["abu musa"] },
      { before: "According to the Hadith on intention,", after: "are judged by intentions.", answer: "actions", accepted: ["actions", "deeds"] },
      { before: "A good companion is compared in the Hadith to a", after: "seller.", answer: "musk", accepted: ["musk"] },
      { before: "A bad companion is compared in the Hadith to a blacksmith's", after: ".", answer: "bellows", accepted: ["bellows", "furnace"] },
      { before: "Sitting near a musk seller means you may either buy musk or enjoy its good", after: ".", answer: "smell", accepted: ["smell"] },
      { before: "Sitting near a blacksmith's bellows risks burnt clothes, a burnt house, or a bad", after: ".", answer: "smell", accepted: ["smell"] },
      { before: "A migration made purely for worldly gain earns only that", after: ", not spiritual reward.", answer: "gain", accepted: ["gain", "worldly gain"] },
      { before: "Both selected Hadith are recorded in Bukhari and", after: ".", answer: "Muslim", accepted: ["muslim"] },
      { before: "Hadith is described as the second source of", after: " and spiritual guidance.", answer: "Islamic law", accepted: ["islamic law", "sharia"] },
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
      hint: "Recall the two selected Hadith and who narrated each one.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
