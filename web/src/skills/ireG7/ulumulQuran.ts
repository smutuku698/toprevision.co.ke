import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// Narrative sequence of the first revelation at cave Hira — explicit curriculum-endorsed
// content ("search and watch videos on the first incident at cave Hira and narrate"), not an invented order.
const ORDER_PROMPTS = [
  "Arrange the events of the first revelation at cave Hira in the correct order.",
  "Put these events of the first revelation at cave Hira into the correct order.",
  "Sequence the events of the cave Hira revelation correctly, from first to last.",
  "Order these events from the first revelation as they actually happened.",
  "Sort these events of the cave Hira account into the order they occurred.",
  "Arrange these moments from the first revelation in the order they took place.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which aspect of the Qur'an's revelation it describes.",
  "Group each statement under the aspect of the Qur'an's revelation it describes.",
  "Decide which aspect of the revelation each statement describes, and sort it there.",
  "Sort each fact into the aspect of the Qur'an's revelation it belongs to.",
  "Place each statement under the aspect it describes.",
  "Read each statement and sort it under the matching aspect of the revelation.",
];

const MATCH_PROMPTS = [
  "Match each term about the Qur'an's revelation to its meaning.",
  "Pair each term with the meaning that fits it.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term to the definition that fits it.",
  "Choose the correct meaning for each term about the revelation.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word or term.",
  "Which word or term completes this sentence?",
  "Complete the sentence with the correct word or term.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const HIRA_STEPS = [
  { id: "retreat", label: "The Prophet (S.A.W.), troubled by the ways of his society, retreats often to cave Hira to reflect" },
  { id: "angel", label: "While in the cave, Angel Jibril appears to him for the first time" },
  { id: "iqra", label: "Jibril commands him to 'Iqra' (Read/Recite); he replies that he cannot read, and is embraced tightly three times" },
  { id: "verses", label: "Jibril recites the first verses of Surah Al-Alaq (Q.96:1-5), and the Prophet repeats them" },
  { id: "trembling", label: "The Prophet returns home trembling and asks his wife Khadijah to cover him" },
  { id: "khadijah", label: "Khadijah reassures him and takes him to her cousin Waraqah bin Nawfal, a learned man" },
  { id: "waraqah", label: "Waraqah confirms that what came to him is the same revelation sent to earlier prophets like Musa" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Wahyu", meaning: "Revelation — the message Allah communicated to the Prophet (S.A.W.) through Angel Jibril" },
  { term: "Iqra", meaning: "The first word revealed, meaning 'Read' or 'Recite'" },
  { term: "Cave Hira", meaning: "The cave near Makkah where the Prophet (S.A.W.) used to retreat, and where the first revelation came" },
  { term: "Khadijah (R.A.)", meaning: "The Prophet's wife, who reassured and comforted him after the first revelation" },
  { term: "Waraqah bin Nawfal", meaning: "A learned relative of Khadijah who confirmed that the Prophet (S.A.W.) had received true prophethood" },
  { term: "Surah Al-Alaq", meaning: "The chapter whose opening verses (Q.96:1-5) were the first ever revealed" },
  { term: "Laylatul Qadr", meaning: "The Night of Decree, in Ramadan, on which the Qur'an's revelation began" },
  { term: "Bayt al-Izzah", meaning: "The place in the lowest heaven to which the whole Qur'an was sent down before its gradual revelation to the Prophet" },
  { term: "23 years", meaning: "The span of time over which the Qur'an was revealed to the Prophet (S.A.W.) in portions" },
  { term: "Angel Jibril", meaning: "The angel entrusted by Allah to deliver the revelation to the Prophet (S.A.W.)" },
];

interface TopicFact {
  text: string;
  topic: "hira" | "portions" | "importance";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  hira: "About the first revelation at cave Hira",
  portions: "About why the Qur'an was revealed in portions",
  importance: "About the Qur'an's importance in daily life",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "The Prophet (S.A.W.) was 40 years old when the first revelation came", topic: "hira" },
  { text: "The first revelation came during the month of Ramadan", topic: "hira" },
  { text: "The Prophet (S.A.W.) was frightened and unsure of what had happened to him at first", topic: "hira" },
  { text: "Khadijah (R.A.) was the first person to believe in the Prophet's message", topic: "hira" },
  { text: "Gradual revelation made it easier for the early Muslim community to implement new laws step by step", topic: "portions" },
  { text: "Revelation in portions strengthened the Prophet's (S.A.W.) heart to face opposition over 23 years", topic: "portions" },
  { text: "Many verses were revealed in response to specific events and questions the early Muslims faced", topic: "portions" },
  { text: "Revealing the Qur'an gradually made it easier for the companions to memorise it", topic: "portions" },
  { text: "The Qur'an guides a Muslim's daily conduct, worship, and dealings with others", topic: "importance" },
  { text: "The Qur'an is a source of comfort and spiritual nourishment in times of difficulty", topic: "importance" },
  { text: "The Qur'an is the primary source of Sharia (Islamic law) for Muslims", topic: "importance" },
  { text: "The Qur'an has remained unchanged in its original Arabic wording since it was revealed", topic: "importance" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 7 learner in ${place(rng)}, learns that Islamic law on alcohol was revealed in stages rather than banned outright in one verse. What is the best reason gradual revelation worked this way?`,
    correct: "It allowed the early community time to gradually change deep-rooted habits, making the new law easier to accept and practise",
    wrong: ["It shows the Qur'an was incomplete when first revealed", "It means the law on alcohol was never fully clarified", "It was only a temporary rule meant to be reversed later"],
    explanation: "Gradual revelation eased implementation — deeply rooted habits like alcohol use were changed step by step, rather than demanding an instant, difficult shift.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} explains to a classmate in ${place(rng)} that some Qur'anic verses were revealed to directly answer questions the early Muslims were asking at the time. What does this show about the revelation?`,
      correct: "It was responsive to real events and needs, not delivered as one disconnected block with no context",
      wrong: ["It means the Qur'an contradicts itself from verse to verse", "It shows the companions wrote the Qur'an themselves", "It proves the Qur'an has no fixed, unchanging meaning"],
      explanation: "Many verses responded to specific events and questions (asbab al-nuzul) — this made the guidance directly relevant to the community's real, lived situations.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why the Prophet (S.A.W.) used to retreat to cave Hira before receiving revelation. What is the most accurate reason?`,
    correct: "He was troubled by the state of his society and went there to reflect, away from the distractions of daily life",
    wrong: ["He was hiding from people who wanted to harm him", "He was instructed by other prophets to live there permanently", "He went there to trade goods away from the marketplace"],
    explanation: "Before prophethood, he retreated to cave Hira to reflect on the moral condition of his society, seeking solitude for contemplation.",
  }),
  (rng) => ({
    prompt: `After the first revelation, ${name(rng)} recalls that the Prophet (S.A.W.) went home trembling and Khadijah (R.A.) comforted him. What does her response teach about how a Muslim should support someone facing something overwhelming?`,
    correct: "Offer reassurance and practical support, rather than dismissing their fear or leaving them to face it alone",
    wrong: ["Tell them their fear is not real and should be ignored", "Wait for them to fully calm down alone before offering any help", "Point out that they should have expected the situation"],
    explanation: "Khadijah's calm reassurance and practical steps (covering him, then seeking Waraqah's confirmation) model supportive, active care in a moment of distress.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that the Qur'an being revealed over 23 years, rather than all at once, made it harder for the companions to learn. Is this reasoning sound?`,
    correct: "No — gradual revelation actually made memorisation and understanding easier, spreading the content across many years",
    wrong: ["Yes — a single, one-time revelation would always be simpler to memorise", "Yes — gradual revelation confused the companions about what to follow", "No — the companions never needed to memorise the Qur'an at all"],
    explanation: "Spreading revelation over 23 years, rather than all at once, made the volume of content manageable for memorisation and gradual application.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, researching for a class presentation in ${place(rng)}, wants one piece of evidence that the Qur'an guides a Muslim's daily life today, not just history. Which is the strongest example?`,
      correct: "Muslims consult the Qur'an's teachings when deciding how to worship, treat others, and conduct daily affairs",
      wrong: ["The Qur'an is only studied by religious scholars, not ordinary Muslims", "The Qur'an's guidance stopped applying after the Prophet's (S.A.W.) death", "The Qur'an only contains historical stories with no present-day relevance"],
      explanation: "The Qur'an remains a living guide — Muslims turn to it for worship, conduct, and daily decisions, not merely as a historical record.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} is asked why Waraqah bin Nawfal's confirmation mattered so much to the Prophet (S.A.W.) after the first revelation. What is the best explanation?`,
    correct: "Waraqah was a learned man familiar with earlier scriptures, so his recognition of the revelation as genuine prophethood reassured the Prophet (S.A.W.)",
    wrong: ["Waraqah was the only person allowed to hear about the revelation", "Waraqah's opinion had no real significance in the account", "Waraqah rejected the revelation, which discouraged the Prophet (S.A.W.)"],
    explanation: "Waraqah's knowledge of earlier revealed scriptures let him recognise the experience as matching true prophethood, which reassured the Prophet (S.A.W.).",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the Qur'an's guidance can be ignored once a Muslim has memorised its verses. What is the flaw in this thinking?`,
    correct: "Memorisation alone does not fulfil the purpose of guidance — the Qur'an must also be understood and applied in daily life",
    wrong: ["There is no flaw — memorisation is the Qur'an's only real purpose", "The Qur'an's guidance was only meant for the Prophet's (S.A.W.) own lifetime", "Applying the Qur'an is optional once a Muslim reaches adulthood"],
    explanation: "The Qur'an's purpose is guidance for living, not memorisation alone — its verses call for understanding and practical daily application.",
  }),
  (rng) => ({
    prompt: `${name(rng)} explains that the first revealed verses (Surah Al-Alaq 1-5) command 'Iqra' (Read). Why is this a fitting first message for a Prophet who would later deliver a complete written scripture?`,
    correct: "It highlights the importance of seeking knowledge as the foundation for everything that would follow",
    wrong: ["It shows the Qur'an is only meant for people who can already read fluently", "It has no real connection to the rest of the Qur'an's message", "It means reading is more important in Islam than any other form of worship"],
    explanation: "Opening with a command to 'Read/Recite' establishes the central importance of seeking knowledge, a theme that runs through the rest of the Qur'an.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to explain why the Qur'an is described as a 'mercy to mankind' rather than only a book of rules. What best supports this description?`,
    correct: "It offers comfort, guidance out of confusion, and a path to a better life, not just a list of commands to obey",
    wrong: ["It only contains punishments for wrongdoing, with no comfort at all", "It was written to benefit only the Prophet (S.A.W.) personally", "It replaced the need for kindness between people entirely"],
    explanation: "The Qur'an is called a mercy because it provides comfort, direction, and a path toward a better life — guidance, not merely a set of rules.",
  }),
];

export const ulumulQuran: Skill = {
  id: "g7-ire-qu-ulumul-quran",
  code: "QU.1",
  subjectId: "ire",
  strandId: "g7-ire-quran",
  grade: 7,
  title: "Ulumul Qur'an",
  description: "The rationale and stages of the Qur'an's revelation, the incident at cave Hira, why it was revealed in portions, and its importance in daily life.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, HIRA_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: HIRA_STEPS.map((s) => s.id),
        hint: "It begins with the Prophet's (S.A.W.) retreat for reflection and ends with Waraqah bin Nawfal confirming the revelation.",
        explanation: HIRA_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const hira = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "hira")).slice(0, 3);
      const portions = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "portions")).slice(0, 3);
      const importance = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "importance")).slice(0, 3);
      const chosen = shuffle(rng, [...hira, ...portions, ...importance]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["hira", "portions", "importance"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about the cave Hira incident itself, some about why revelation came gradually, and some about the Qur'an's role today.",
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
        hint: "Think about who or what each term refers to in the account of the first revelation.",
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
        hint: "Think about what the revelation's timing, setting, or wording was actually meant to achieve.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The first revelation came to the Prophet (S.A.W.) in cave", after: ".", answer: "Hira", accepted: ["hira"] },
      { before: "The first word revealed to the Prophet (S.A.W.) was", after: ", meaning 'Read'.", answer: "Iqra", accepted: ["iqra"] },
      { before: "The angel who delivered the revelation to the Prophet (S.A.W.) was", after: ".", answer: "Jibril", accepted: ["jibril", "gabriel"] },
      { before: "The Prophet's wife who comforted him after the first revelation was", after: ".", answer: "Khadijah", accepted: ["khadijah"] },
      { before: "The learned relative who confirmed the Prophet's (S.A.W.) prophethood was", after: ".", answer: "Waraqah bin Nawfal", accepted: ["waraqah", "waraqah bin nawfal"] },
      { before: "The first verses revealed were the opening of Surah", after: ".", answer: "Al-Alaq", accepted: ["al-alaq", "alaq"] },
      { before: "The Qur'an was revealed over a span of about", after: "years.", answer: "23", accepted: ["23", "twenty-three", "twenty three"] },
      { before: "Revealing the Qur'an gradually made it easier for the community to", after: "new laws.", answer: "implement", accepted: ["implement", "practise", "apply"] },
      { before: "The Qur'an is described as a", after: "to mankind, not just a book of rules.", answer: "mercy", accepted: ["mercy"] },
      { before: "The Prophet (S.A.W.) was", after: "years old when the first revelation came.", answer: "40", accepted: ["40", "forty"] },
      { before: "The Qur'an is the primary source of", after: "for Muslims.", answer: "Sharia", accepted: ["sharia", "islamic law"] },
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
      hint: "Recall the account of the first revelation and why the Qur'an came down gradually.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
