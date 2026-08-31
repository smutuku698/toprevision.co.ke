import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The surah's own verse-by-verse flow (Q.93:1-11) is explicit, curriculum-endorsed sequential
// content, not an invented order: two opening oaths, a reassurance, two promises, three reminders
// of past favour, then three closing commands.
const ORDER_PROMPTS = [
  "Arrange the parts of Surah Ad-Dhuha (Q.93:1-11) in the order they appear.",
  "Put these parts of Surah Ad-Dhuha into the order they appear.",
  "Sequence these parts of Surah Ad-Dhuha correctly, from first to last.",
  "Order these parts of Surah Ad-Dhuha as they appear in the surah.",
  "Sort these parts of Surah Ad-Dhuha into the order they occur.",
  "Arrange these moments of Surah Ad-Dhuha in the order they appear.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of Surah Ad-Dhuha it describes.",
  "Group each statement under the part of Surah Ad-Dhuha it describes.",
  "Decide which part of Surah Ad-Dhuha each statement describes, and sort it there.",
  "Sort each fact into the part of Surah Ad-Dhuha it belongs to.",
  "Place each statement under the part of the surah it describes.",
  "Read each statement and sort it under the matching part of Surah Ad-Dhuha.",
];

const MATCH_PROMPTS = [
  "Match each term from Surah Ad-Dhuha to its meaning.",
  "Pair each term from Surah Ad-Dhuha with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term from Surah Ad-Dhuha to the definition that fits it.",
  "Choose the correct meaning for each term from Surah Ad-Dhuha.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const DUHA_SEQUENCE = [
  { id: "oath-duha", label: "Allah swears by the morning brightness (Ad-Duha)" },
  { id: "oath-layl", label: "Allah swears by the night when it covers with darkness" },
  { id: "reassure", label: "Allah reassures the Prophet (S.A.W.) that He has not forsaken him nor is displeased with him" },
  { id: "hereafter", label: "Allah promises the Hereafter is better for him than this world" },
  { id: "pleased", label: "Allah promises He will give him so much that he will be pleased" },
  { id: "orphan-favour", label: "Allah reminds him: did He not find him an orphan and give him refuge?" },
  { id: "guide-favour", label: "Allah reminds him: did He not find him lost/unguided and guide him?" },
  { id: "need-favour", label: "Allah reminds him: did He not find him in need and enrich him?" },
  { id: "no-oppress", label: "Allah commands him: do not oppress (repel) the orphan" },
  { id: "no-repel", label: "Allah commands him: do not repel the one who asks" },
];

interface TopicFact {
  text: string;
  topic: "opening" | "favours" | "commands";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  opening: "Opening oaths, reassurance and promises",
  favours: "Reminders of Allah's past favours",
  commands: "The surah's closing commands",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Allah swears by the morning brightness and the still night", topic: "opening" },
  { text: "Allah reassures the Prophet (S.A.W.) that He has not forsaken him nor is displeased with him", topic: "opening" },
  { text: "The Hereafter is described as better for the Prophet (S.A.W.) than this world", topic: "opening" },
  { text: "Allah promises to give the Prophet (S.A.W.) so much that he will be pleased", topic: "opening" },
  { text: "Allah found the Prophet (S.A.W.) an orphan and gave him refuge", topic: "favours" },
  { text: "Allah found the Prophet (S.A.W.) lost/unguided and guided him", topic: "favours" },
  { text: "Allah found the Prophet (S.A.W.) in need and enriched him", topic: "favours" },
  { text: "These reminders show that every stage of the Prophet's (S.A.W.) early life was cared for by Allah", topic: "favours" },
  { text: "The surah commands: do not oppress the orphan", topic: "commands" },
  { text: "The surah commands: do not repel (turn away) the one who asks", topic: "commands" },
  { text: "The surah commands: speak of and proclaim Allah's favour", topic: "commands" },
  { text: "The commands connect directly back to the favours Allah showed the Prophet (S.A.W.) himself", topic: "commands" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Ad-Duha", meaning: "The morning brightness — what Allah swears by at the start of the surah, and the surah's name" },
  { term: "The still night (in this surah)", meaning: "The second thing Allah swears by, the night when it settles and covers with darkness" },
  { term: "Yateem (orphan)", meaning: "The vulnerable person the Prophet (S.A.W.) himself once was, and whom Muslims are commanded not to oppress" },
  { term: "The one who asks", meaning: "The beggar or needy person named in the surah's command not to be turned away" },
  { term: "The Hereafter (Al-Akhirah)", meaning: "The life after this world, described in the surah as better than this world" },
  { term: "Allah's favour", meaning: "The blessing that the surah's final command tells a Muslim to speak of and proclaim, not hide" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 7 learner in ${place(rng)}, has a classmate who is an orphan and is often left out of group work. Applying the teaching of Surah Ad-Dhuha, what should the learner do?`,
    correct: "Treat the orphan classmate with special care and never take advantage of or exclude them",
    wrong: [
      "Avoid the orphan classmate, since caring for orphans is only the government's responsibility",
      "Include the orphan sometimes, but only when there is a clear benefit to the group",
      "Ignore the surah's command, since it was addressed only to the Prophet (S.A.W.), not to ordinary Muslims",
    ],
    explanation: "Surah Ad-Dhuha's command not to oppress the orphan is a direct instruction for every Muslim's daily conduct, not a rule limited to the Prophet (S.A.W.) alone.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sees a beggar asking for help outside a market in ${place(rng)}. Applying Surah Ad-Dhuha, what is the correct response?`,
      correct: "Respond kindly and do not turn the beggar away harshly, since the surah commands not to repel the one who asks",
      wrong: [
        "Ignore the beggar completely, since this command only applies during Ramadan",
        "Turn the beggar away if they ask more than once",
        "Give help only after the beggar proves beyond doubt that they deserve it",
      ],
      explanation: "The surah's command not to repel the one who asks is about a Muslim's everyday response to those in need, not a seasonal or conditional rule.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reflects on the reminder that Allah found the Prophet (S.A.W.) an orphan and gave him refuge. What lesson does this reminder teach about how Muslims should treat vulnerable people?`,
    correct: "Allah cares for the vulnerable, and those who have received Allah's care should extend the same care to others in similar situations",
    wrong: [
      "It means only the Prophet's (S.A.W.) own orphanhood matters, with no lesson for other Muslims",
      "It suggests being an orphan is a punishment sent from Allah",
      "It means orphans should be left alone out of respect for their private grief",
    ],
    explanation: "The reminder of Allah's care for the orphaned Prophet (S.A.W.) is meant to shape how believers who have themselves been cared for should treat others who are vulnerable.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `After a good harvest, ${who}'s family in ${place(rng)} discusses whether to talk about their success. Applying the surah's final command to "speak of and proclaim Allah's favour," what should they do?`,
      correct: "Openly speak of and attribute the success to Allah's favour, as a form of gratitude",
      wrong: [
        "Credit only their own hard work and leave Allah's role unmentioned",
        "Keep the blessing completely secret, since praising Allah aloud is unnecessary",
        "Only mention the blessing if someone asks directly, otherwise stay silent",
      ],
      explanation: "The surah's closing command is to speak of Allah's favour, not to take sole credit or stay silent about it — this is gratitude expressed outwardly.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} fails an important exam and feels devastated. Applying the surah's teaching that "the Hereafter is better for you than this world," how should this shape their outlook?`,
    correct: "Stay patient and hopeful, trusting that reward with Allah in the Hereafter outweighs any single present-day setback",
    wrong: [
      "Stop putting in effort in this life, since only the Hereafter matters",
      "Assume the failed exam proves Allah is displeased with them",
      "Conclude that no success in this life has any value at all",
    ],
    explanation: "The promise that the Hereafter is better is meant to give perspective and patience during hardship, not to be read as Allah's displeasure or an excuse to stop trying.",
  }),
  (rng) => ({
    prompt: `${name(rng)} once felt without direction before a mentor helped them find purpose and structure in their studies. Which of the three favours Allah reminds the Prophet (S.A.W.) of in the surah does this situation parallel?`,
    correct: "The favour of guidance — Allah found the Prophet (S.A.W.) lost/unguided and guided him, just as guidance can turn confusion into direction",
    wrong: [
      "The favour of wealth — this reminder is only about material need",
      "The favour of refuge from orphanhood — being guided has nothing to do with feeling lost",
      "None of the three favours named in the surah relate to this situation",
    ],
    explanation: "The second reminder — Allah finding him lost/unguided and guiding him — is specifically about direction and guidance, matching the mentor situation.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that since Allah "found him in need and enriched him," Muslims should focus only on becoming wealthy and ignore this reminder as a call to gratitude and generosity. Evaluate this reasoning.`,
    correct: "Flawed — the reminder of being enriched calls for gratitude and generosity toward others in need, not a licence to hoard wealth",
    wrong: [
      "Sound — this reminder means wealth accumulation is the whole point of the surah",
      "Sound — since Allah enriched the Prophet (S.A.W.), wealth matters more than character in Islam",
      "Flawed — the reminder means every Muslim is automatically guaranteed wealth",
    ],
    explanation: "Recalling that Allah enriched the Prophet (S.A.W.) from need is meant to inspire gratitude and generosity, not to justify chasing wealth for its own sake.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A teacher in ${place(rng)} asks ${who}'s group to dramatise Surah Ad-Dhuha's teaching on orphans. Which scene best reflects the command not to oppress the orphan?`,
      correct: "A guardian handling an orphaned relative's needs and property fairly, without exploiting them",
      wrong: [
        "A guardian using an orphan's inheritance money to buy personal items",
        "A guardian ignoring an orphan's schooling needs because it is expensive",
        "A guardian who feels sorry for an orphan but never actually helps them",
      ],
      explanation: "Fair, responsible care of an orphan's needs and property is exactly what \"do not oppress the orphan\" calls for — the other options each describe a form of oppression or neglect.",
    };
  },
  (rng) => ({
    prompt: `A classmate keeps asking ${name(rng)} in ${place(rng)} for help with the same math problem. Applying the surah's spirit of "not repelling the one who asks," what should the classmate's response be?`,
    correct: "Be patient and help again, rather than showing annoyance and turning the classmate away",
    wrong: [
      "Tell the classmate to stop asking, since one explanation should be enough",
      "Only help if the classmate offers something in return",
      "Redirect all responsibility to the teacher and refuse to engage at all",
    ],
    explanation: "The command not to repel the one who asks extends beyond begging for money — it models patience with anyone who genuinely asks for help.",
  }),
  (rng) => {
    const who = name(rng);
    return {
    prompt: `${who} volunteers extensively at a local mosque in ${place(rng)} for months without any public recognition. Applying the surah's promise that Allah "will give him so much that he will be pleased," how should this shape ${who}'s outlook?`,
    correct: "Trust that Allah's reward may come later, and in greater measure than any immediate human recognition",
    wrong: [
      "Stop volunteering, since rewards should be immediate to be worthwhile",
      "Assume the promise applies only to prophets, not to ordinary Muslims doing good deeds",
      "Conclude that recognition from people is the only kind of reward that matters",
    ],
    explanation: "The promise of being 'pleased' points to Allah's own reward, which is not bound to immediate, visible recognition from other people.",
    };
  },
];

export const surahAdDuha: Skill = {
  id: "g7-ire-qu-surah-ad-duha",
  code: "QU.2",
  subjectId: "ire",
  strandId: "g7-ire-quran",
  grade: 7,
  title: "Surah Ad-Dhuha",
  description: "The meaning and teachings of Surah Ad-Dhuha (Q.93:1-11): reassurance, the Hereafter, Allah's past favours, and the closing commands on orphans, the needy, and Allah's bounties.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, DUHA_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the opening oaths to the closing commands.",
        items,
        correctOrder: DUHA_SEQUENCE.map((d) => d.id),
        hint: "It opens with two oaths, then reassurance and promises, then three reminders of Allah's favour, then two closing commands.",
        explanation: DUHA_SEQUENCE.map((d) => d.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const opening = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "opening")).slice(0, 3);
      const favours = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "favours")).slice(0, 3);
      const commands = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "commands")).slice(0, 3);
      const chosen = shuffle(rng, [...opening, ...favours, ...commands]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["opening", "favours", "commands"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are the opening oaths/promises, some are reminders of past favour, and some are the closing commands.",
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
        hint: "Think about what each term refers to in the surah's opening oaths, favours, or closing commands.",
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
        hint: "Think about which teaching of Surah Ad-Dhuha the situation is actually applying.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Surah Ad-Dhuha swears by the morning brightness and the still", after: ".", answer: "night", accepted: ["night"] },
      { before: "Allah reassures the Prophet (S.A.W.) that He has not forsaken him nor is", after: "with him.", answer: "displeased", accepted: ["displeased"] },
      { before: "The surah promises that the", after: "is better for the Prophet (S.A.W.) than this world.", answer: "Hereafter", accepted: ["hereafter"] },
      { before: "Allah promises to give the Prophet (S.A.W.) so much that he will be", after: ".", answer: "pleased", accepted: ["pleased"] },
      { before: "Allah reminds the Prophet (S.A.W.) that He found him an", after: "and gave him refuge.", answer: "orphan", accepted: ["orphan"] },
      { before: "Allah reminds the Prophet (S.A.W.) that He found him lost and", after: "him.", answer: "guided", accepted: ["guided"] },
      { before: "Allah reminds the Prophet (S.A.W.) that He found him in need and", after: "him.", answer: "enriched", accepted: ["enriched"] },
      { before: "The surah commands the Prophet (S.A.W.) not to", after: "the orphan.", answer: "oppress", accepted: ["oppress", "repel"] },
      { before: "The surah commands the Prophet (S.A.W.) not to repel the one who", after: ".", answer: "asks", accepted: ["asks"] },
      { before: "The surah's final command is to speak of and", after: "Allah's favour.", answer: "proclaim", accepted: ["proclaim"] },
      { before: "Surah Ad-Dhuha is chapter number", after: "of the Qur'an.", answer: "93", accepted: ["93"] },
      { before: "Surah Ad-Dhuha has", after: "verses in total.", answer: "11", accepted: ["11", "eleven"] },
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
      hint: "Recall the reminders and commands of Surah Ad-Dhuha.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
