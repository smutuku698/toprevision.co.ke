import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// JC.1 "Prophecies about the Messiah" has no natural sequence, spatial layout, or numeric
// quantity in its source content (unordered prophecy texts and their fulfilment) — so this
// skill genuinely supports only 4 QuestionKinds (multiple-choice, categorize, click-match,
// fill-blank), following the same documented-cap pattern as
// creativeArtsSportsG7/introduction.ts.

const CATEGORIZE_PROMPTS = [
  "Sort each statement as an Old Testament prophecy about the Messiah, or its New Testament fulfilment.",
  "Decide whether each statement is a prophecy or its fulfilment, and sort it there.",
  "Group these statements under Old Testament prophecy or New Testament fulfilment.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for prophecy or fulfilment.",
  "Read each statement and sort it under prophecy or fulfilment.",
];

const MATCH_PROMPTS = [
  "Match each term or title to its meaning.",
  "Pair each term or title below with its correct meaning.",
  "Connect each term or title to the meaning it fits.",
  "Match each title to the statement that explains it.",
  "Link each term or title below to its correct definition.",
  "Match each term to the description that fits it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about the Messiah's prophecies with the right word.",
];

const PROPHECY_FACTS = [
  { text: "A virgin will conceive and give birth to a son, and will call him Immanuel (Isaiah 7:14)", type: "prophecy" },
  { text: "A child is born, a son is given, and the government will be on his shoulders (Isaiah 9:6)", type: "prophecy" },
  { text: "He will be called Wonderful Counsellor, Mighty God, Everlasting Father, Prince of Peace (Isaiah 9:6)", type: "prophecy" },
  { text: "A righteous Branch will reign as king and be called 'The LORD Our Righteousness' (Jeremiah 23:5-6)", type: "prophecy" },
  { text: "Of the increase of his government and peace there will be no end (Isaiah 9:7)", type: "prophecy" },
  { text: "An angel appears to Mary and tells her she will conceive and give birth to a son named Jesus (Luke 1:26-38)", type: "fulfilment" },
  { text: "Joseph is told in a dream that Mary's child is conceived through the Holy Spirit (Matthew 1:18-23)", type: "fulfilment" },
  { text: "The angel tells Joseph to name the child Jesus, 'for he will save his people from their sins' (Matthew 1:21)", type: "fulfilment" },
  { text: "Matthew explicitly links Jesus' virgin birth to Isaiah's prophecy of Immanuel (Matthew 1:22-23)", type: "fulfilment" },
  { text: "Mary is told her son will be given the throne of his father David and reign forever (Luke 1:32-33)", type: "fulfilment" },
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "Prophecy", meaning: "A message, often about the future, revealing what God has said or will do" },
  { term: "Messiah", meaning: "The promised anointed one and deliverer sent by God" },
  { term: "Immanuel", meaning: "A name meaning 'God with us', given in Isaiah's prophecy" },
  { term: "Wonderful Counsellor", meaning: "One of the Messiah's titles in Isaiah 9:6, describing His wise guidance" },
  { term: "Mighty God", meaning: "One of the Messiah's titles in Isaiah 9:6, describing His divine power" },
  { term: "Everlasting Father", meaning: "One of the Messiah's titles in Isaiah 9:6, describing His eternal, fatherly care" },
  { term: "Prince of Peace", meaning: "One of the Messiah's titles in Isaiah 9:6, describing the peace His reign brings" },
  { term: "The LORD Our Righteousness", meaning: "The name given to the righteous Branch-King in Jeremiah 23:5-6" },
  { term: "Fulfilment", meaning: "The event in which a prophecy's promise actually comes to pass" },
  { term: "Annunciation", meaning: "The announcement to Mary that she would conceive and give birth to Jesus" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} reads Isaiah 7:14's prophecy of a virgin conceiving a son called Immanuel, then reads Matthew 1:18-23. What does Matthew's account show?`,
      correct: "Matthew explicitly connects Mary's virgin conception of Jesus to the fulfilment of Isaiah's prophecy",
      wrong: ["Matthew shows the prophecy was never actually fulfilled", "Matthew never mentions Isaiah's prophecy at all", "Matthew describes a completely unrelated prophecy fulfilled by someone else"],
      explanation: "Matthew 1:22-23 directly quotes Isaiah 7:14 and states that Jesus' virgin birth fulfils it, linking the Old Testament prophecy to its New Testament fulfilment.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what the name 'Immanuel' means, and why it matters for understanding who the Messiah is. What is the correct answer?`,
    correct: "'Immanuel' means 'God with us,' pointing to the Messiah's divine presence among people",
    wrong: ["'Immanuel' simply means 'a great king is coming'", "'Immanuel' is just a common name with no special meaning", "'Immanuel' means 'the end of all prophecy'"],
    explanation: "'Immanuel' means 'God with us' — a name that points directly to the Messiah's identity as God present among His people, not merely a royal title.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked which title from Isaiah 9:6 best describes the peace that the Messiah's reign brings. Which title is it?`,
      correct: "Prince of Peace",
      wrong: ["Wonderful Counsellor", "Mighty God", "Everlasting Father"],
      explanation: "'Prince of Peace' is the title in Isaiah 9:6 that specifically describes the peace the Messiah's reign brings, distinct from the other three titles.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked which title from Isaiah 9:6 specifically points to the Messiah's divine power. Which title is it?`,
    correct: "Mighty God",
    wrong: ["Wonderful Counsellor", "Everlasting Father", "Prince of Peace"],
    explanation: "'Mighty God' is the title that specifically points to the Messiah's divine power, distinct from His wisdom (Counsellor), fatherly care (Everlasting Father), or peace (Prince of Peace).",
  }),
  (rng) => ({
    prompt: `${name(rng)} is comparing Jeremiah 23:5-6's prophecy with Luke 1:32-33's account of the angel's message to Mary. What connection does this show?`,
    correct: "Both point to the Messiah reigning as king, fulfilling the promise of a righteous Branch on David's throne",
    wrong: ["The two passages describe completely unrelated events with no connection", "Jeremiah's prophecy was fulfilled by someone other than Jesus", "Luke's account contradicts Jeremiah's prophecy entirely"],
    explanation: "Jeremiah 23:5-6 promises a righteous Branch who will reign as king, and Luke 1:32-33 shows the angel telling Mary that her son will be given David's throne and reign forever — a clear prophecy-fulfilment link.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} explains that a 'prophecy' is not the same as a random guess about the future. What makes a Biblical prophecy different?`,
    correct: "A prophecy is a message revealing what God has said or will do, not a guess",
    wrong: ["A prophecy is simply any old story written a long time ago", "A prophecy is a rule that applies only to the person who first said it", "A prophecy and a guess about the future are exactly the same thing"],
    explanation: "Biblical prophecy is understood as a God-given message revealing what He will do, which is why its fulfilment centuries later in Jesus' birth carries such significance.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why it matters that both Isaiah and Jeremiah, writing centuries before Jesus' birth, described details that later matched His life. What does this best show?`,
    correct: "It shows that the events of Jesus' birth were part of God's plan announced long in advance",
    wrong: ["It shows that Isaiah and Jeremiah met each other and copied one another's writing", "It shows that the prophecies were written after Jesus was already born", "It has no real significance for understanding who Jesus is"],
    explanation: "The fact that prophecies written centuries before Jesus' birth describe details later fulfilled in His life is part of why Christians see His birth as part of God's long-announced plan.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what the angel told Joseph about the meaning of the name 'Jesus' in Matthew 1:21. What was it?`,
    correct: "'He will save his people from their sins'",
    wrong: ["'He will become a great earthly king only'", "'He will build a new temple in Jerusalem'", "'He will never grow up to be an adult'"],
    explanation: "Matthew 1:21 records that the angel told Joseph to name the child Jesus, 'for he will save his people from their sins,' connecting His name directly to His saving mission.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked which term describes the moment when a prophecy's promise actually comes to pass. What is the correct term?`,
    correct: "Fulfilment",
    wrong: ["Annunciation", "Prophecy", "Messiah"],
    explanation: "'Fulfilment' is the term for when a prophecy's promise actually comes to pass — the annunciation to Mary is one specific event that becomes part of that fulfilment.",
  }),
];

export const propheciesAboutTheMessiah: Skill = {
  id: "g7-cre-jc-prophecies-about-the-messiah",
  code: "JC.1",
  subjectId: "cre",
  strandId: "g7-cre-jesus",
  grade: 7,
  title: "Prophecies about the Messiah",
  description: "Old Testament prophecies about the coming Messiah (Isaiah 7:13-14, 9:6-7, Jeremiah 23:5-6) and how they were fulfilled in Jesus Christ (Matthew 1:18-23, Luke 1:26-38).",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const prophecies = shuffle(rng, PROPHECY_FACTS.filter((f) => f.type === "prophecy")).slice(0, 4);
      const fulfilments = shuffle(rng, PROPHECY_FACTS.filter((f) => f.type === "fulfilment")).slice(0, 4);
      const chosen = shuffle(rng, [...prophecies, ...fulfilments]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "prophecy", label: "Old Testament prophecy" },
          { id: "fulfilment", label: "New Testament fulfilment" },
        ],
        correctBucket,
        hint: "The prophecies come from Isaiah and Jeremiah; the fulfilment comes from Matthew and Luke's accounts of Jesus' birth.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.type === "prophecy" ? "Old Testament prophecy" : "New Testament fulfilment"}.`).join(" "),
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
        hint: "Think about the titles given to the Messiah in Isaiah 9:6 and Jeremiah 23:5-6.",
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
        hint: "Think about the Old Testament prophecies and how the New Testament shows them being fulfilled.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Isaiah 7:14 prophesied that a virgin would conceive and call her son", after: ".", answer: "Immanuel", accepted: ["immanuel"] },
      { before: "Immanuel means 'God with", after: "'.", answer: "us", accepted: ["us"] },
      { before: "Isaiah 9:6 says the Messiah will be called Wonderful", after: ".", answer: "Counsellor", accepted: ["counsellor", "counselor"] },
      { before: "Isaiah 9:6 gives the Messiah the title Prince of", after: ".", answer: "Peace", accepted: ["peace"] },
      { before: "Jeremiah 23:5-6 says the righteous Branch will be called 'The LORD Our", after: "'.", answer: "Righteousness", accepted: ["righteousness"] },
      { before: "In Matthew 1:21, the angel said Jesus would", after: "his people from their sins.", answer: "save", accepted: ["save"] },
      { before: "The angel announced Mary's conception of Jesus in an event called the", after: ".", answer: "annunciation", accepted: ["annunciation"] },
      { before: "A message revealing what God has said or will do is called a", after: ".", answer: "prophecy", accepted: ["prophecy"] },
      { before: "The event when a prophecy's promise actually comes to pass is called its", after: ".", answer: "fulfilment", accepted: ["fulfilment", "fulfillment"] },
      { before: "Luke 1:32-33 says Mary's son would be given the throne of his father", after: "and reign forever.", answer: "David", accepted: ["david"] },
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
      hint: "Think about the Old Testament prophecies about the Messiah and their New Testament fulfilment.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
