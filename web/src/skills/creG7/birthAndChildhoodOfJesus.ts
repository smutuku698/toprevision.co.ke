import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of Jesus' birth and childhood in the correct order.",
  "Put these events from Jesus' birth and childhood into order.",
  "Sequence these events of Jesus' early life correctly.",
  "Arrange these moments from Jesus' birth and childhood in order.",
  "Order these events the way they happened in Luke's account.",
  "Sort these events into the order they happened in Jesus' early life.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which part of Jesus' early life it describes.",
  "Decide which part of Jesus' early life each statement describes, and sort it there.",
  "Group these statements under birth, dedication, or the temple visit at twelve.",
  "Sort each statement below into the correct stage of Jesus' early life.",
  "Place each statement into the bucket for the stage it belongs to.",
  "Read each statement and sort it under the correct part of Jesus' childhood.",
];

const MATCH_PROMPTS = [
  "Match each term or person to its meaning.",
  "Pair each term or person below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each term or person to the statement that explains it.",
  "Link each term below to its correct definition.",
  "Match each term or person to the description that fits it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about Jesus' birth and childhood with the right word.",
];

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "An angel announces to Mary that she will conceive and give birth to Jesus (Luke 1:26-38)" },
  { id: "n2", label: "Mary and Joseph travel to Bethlehem for a census (Luke 2:1-5)" },
  { id: "n3", label: "Jesus is born and laid in a manger because there was no room at the inn (Luke 2:6-7)" },
  { id: "n4", label: "An angel announces the birth to shepherds, who go to see the baby (Luke 2:8-20)" },
  { id: "n5", label: "Jesus is presented and dedicated at the temple, where Simeon and Anna recognise Him (Luke 2:22-38)" },
  { id: "n6", label: "At twelve years old, Jesus is found in the temple listening to and questioning the teachers (Luke 2:41-52)" },
];

interface EventFact { text: string; stage: "birth" | "dedication" | "temple" }
const EVENT_FACTS: EventFact[] = [
  { text: "Mary and Joseph travelled to Bethlehem because of a census ordered by the Roman authorities", stage: "birth" },
  { text: "Jesus was laid in a manger because there was no room in the inn", stage: "birth" },
  { text: "An angel announced the good news of Jesus' birth to shepherds in the fields", stage: "birth" },
  { text: "The shepherds went and found Mary, Joseph, and the baby, then spread the news about Him", stage: "birth" },
  { text: "Simeon, a righteous man, recognised Jesus as the promised Messiah at the temple", stage: "dedication" },
  { text: "Anna, a prophetess, gave thanks to God and spoke about the child to others", stage: "dedication" },
  { text: "Mary and Joseph presented Jesus at the temple according to the Law of Moses", stage: "dedication" },
  { text: "At twelve years old, Jesus stayed behind in Jerusalem without His parents' knowledge", stage: "temple" },
  { text: "Mary and Joseph found Jesus in the temple, listening to and asking the teachers questions", stage: "temple" },
  { text: "Jesus told His parents He had to be about His Father's business", stage: "temple" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Census", meaning: "An official count of the population, the reason Mary and Joseph travelled to Bethlehem" },
  { term: "Manger", meaning: "A feeding trough for animals, used as Jesus' first bed" },
  { term: "Simeon", meaning: "A righteous man who had been promised he would see the Messiah before he died" },
  { term: "Anna", meaning: "An elderly prophetess who gave thanks to God and spoke about the child Jesus" },
  { term: "Dedication", meaning: "Presenting a child to God, as Mary and Joseph did with Jesus at the temple" },
  { term: "Bethlehem", meaning: "The town where Jesus was born, fulfilling prophecy" },
  { term: "Swaddling clothes", meaning: "Strips of cloth used to wrap a newborn baby, as Mary wrapped Jesus" },
  { term: "'About my Father's business'", meaning: "What the twelve-year-old Jesus told His parents when found in the temple" },
  { term: "Wisdom", meaning: "What Luke 2:52 says Jesus grew in, along with stature and favour with God and people" },
  { term: "Annunciation", meaning: "The angel's announcement to Mary that she would give birth to Jesus" },
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
      prompt: `${who} in ${place(rng)} notices that Jesus, though the Son of God, was born in a humble manger rather than a palace. What value does this best teach?`,
      correct: "Humility — greatness does not depend on wealth or a grand setting",
      wrong: ["Wealth — true value always requires a grand setting", "Fear — the manger shows Jesus' family was afraid of others", "Ambition — the setting shows a desire for status"],
      explanation: "Jesus' humble birth in a manger, rather than a palace, models humility — showing that true significance does not depend on wealth or status.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads that Mary responded to the angel's announcement with 'I am the Lord's servant... may your word to me be fulfilled' (Luke 1:38). What value does this show?`,
    correct: "Obedience and trust in God, even when the news was unexpected and difficult",
    wrong: ["Doubt and refusal to accept God's plan", "Indifference towards what God was asking of her", "Anger at being given such a difficult task"],
    explanation: "Mary's response shows obedience and trust in God despite the unexpected and difficult nature of the angel's news — a value CRE encourages learners to emulate.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} dedicates their newborn baby in church, presenting the child to God and thanking Him publicly. Which event from Jesus' childhood does this modern practice most closely reflect?`,
      correct: "Mary and Joseph presenting Jesus at the temple according to the Law of Moses (Luke 2:22-38)",
      wrong: ["Jesus being found in the temple at twelve years old", "The angel's announcement to Mary in Luke 1:26-38", "The shepherds visiting the newborn Jesus"],
      explanation: "The temple dedication of Jesus, where He was presented to God according to the Law, is the direct Biblical basis reflected in the modern church practice of dedicating a baby.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s parents in ${place(rng)} notice their teenager is missing after a family trip and search anxiously before finding them safe. Which detail from Jesus' childhood mirrors this concern for a child's welfare?`,
    correct: "Mary and Joseph anxiously searched for Jesus after realising He had stayed behind in Jerusalem",
    wrong: ["Simeon prophesying over baby Jesus at the temple", "The shepherds spreading news about Jesus' birth", "The angel's announcement to Mary before Jesus was born"],
    explanation: "Luke 2:41-52 records Mary and Joseph's anxious search for the young Jesus after He stayed behind in the temple — a parallel to any parent's concern when a child goes missing.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Jesus was doing when His parents found Him in the temple at age twelve. What was it?`,
    correct: "Listening to the teachers and asking them questions",
    wrong: ["Teaching a large public crowd on his own outside the temple", "Sleeping through the entire visit to Jerusalem", "Arguing loudly with the temple guards"],
    explanation: "Luke 2:46 records that Jesus was found in the temple courts, sitting among the teachers, listening to them and asking questions — a picture of eager, respectful learning.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is diligent about attending classes and asking teachers thoughtful questions to learn more deeply. Which value from Jesus' childhood does this reflect?`,
      correct: "A desire to grow in wisdom and understanding, as Jesus did at the temple",
      wrong: ["Avoiding all questions to appear confident", "Disregarding teachers' guidance entirely", "Preferring not to attend lessons at all"],
      explanation: "Jesus' engagement with the teachers in the temple, asking questions and listening, models eager, respectful learning — a value directly applicable to a diligent learner today.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why the shepherds' response to the angel's announcement matters as an example for Christians today. What is the best answer?`,
    correct: "They responded immediately by going to see Jesus and then spread the news to others, showing prompt obedience and eagerness to share good news",
    wrong: ["They ignored the angel's message completely", "They kept the news of Jesus' birth a complete secret", "They responded only after several years had passed"],
    explanation: "The shepherds went immediately to see Jesus and then spread the news to others — a model of prompt, faithful response and eager sharing of good news.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what Simeon had been promised before Jesus' dedication at the temple, according to Luke 2:25-26. What was it?`,
    correct: "That he would not die before seeing the Messiah",
    wrong: ["That he would become the next high priest", "That he would travel to Bethlehem before Jesus' birth", "That he would live for exactly one more year"],
    explanation: "Luke 2:26 records that Simeon had been promised by the Holy Spirit that he would not die before seeing the Lord's Messiah, which was fulfilled when he saw the infant Jesus at the temple.",
  }),
  (rng) => ({
    prompt: `${name(rng)} explains why Mary and Joseph travelled to Bethlehem just before Jesus was born. What was the reason?`,
    correct: "A census ordered by the Roman authorities required them to register in Bethlehem",
    wrong: ["They were fleeing from King Herod at that exact time", "They were visiting family for a wedding celebration", "They were simply passing through on an unrelated journey"],
    explanation: "Luke 2:1-5 records that a Roman census requiring registration in one's ancestral town brought Mary and Joseph to Bethlehem, where Jesus was born.",
  }),
];

export const birthAndChildhoodOfJesus: Skill = {
  id: "g7-cre-jc-birth-and-childhood-of-jesus",
  code: "JC.3",
  subjectId: "cre",
  strandId: "g7-cre-jesus",
  grade: 7,
  title: "The Birth and Childhood of Jesus Christ",
  description: "The annunciation and birth of Jesus Christ (Luke 1:26-38, Luke 2:1-20), His dedication at the temple (Luke 2:22-38), and the account of Jesus in the temple at age twelve (Luke 2:41-52).",
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
        hint: "Start with the angel's announcement to Mary and end with Jesus in the temple at age twelve.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const birth = shuffle(rng, EVENT_FACTS.filter((f) => f.stage === "birth")).slice(0, 3);
      const dedication = shuffle(rng, EVENT_FACTS.filter((f) => f.stage === "dedication")).slice(0, 3);
      const templeAtTwelve = shuffle(rng, EVENT_FACTS.filter((f) => f.stage === "temple")).slice(0, 3);
      const chosen = shuffle(rng, [...birth, ...dedication, ...templeAtTwelve]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.stage));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "birth", label: "Jesus' birth (Luke 2:1-20)" },
          { id: "dedication", label: "Jesus' dedication at the temple (Luke 2:22-38)" },
          { id: "temple", label: "Jesus at the temple, age twelve (Luke 2:41-52)" },
        ],
        correctBucket,
        hint: "Birth events happen in Bethlehem; dedication involves Simeon and Anna; the age-twelve account involves the teachers in Jerusalem.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.stage === "birth" ? "Jesus' birth" : f.stage === "dedication" ? "Jesus' dedication at the temple" : "Jesus at the temple, age twelve"}.`).join(" "),
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
        hint: "Think about the people and details involved in Jesus' birth, dedication, and childhood.",
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
        hint: "Think about the values shown in the events of Jesus' birth and childhood.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Mary and Joseph travelled to Bethlehem because of a", after: "ordered by the Roman authorities.", answer: "census", accepted: ["census"] },
      { before: "Jesus was laid in a", after: "because there was no room at the inn.", answer: "manger", accepted: ["manger"] },
      { before: "An angel announced Jesus' birth to", after: "in the fields nearby.", answer: "shepherds", accepted: ["shepherds"] },
      { before: "Simeon had been promised he would not die before seeing the", after: ".", answer: "Messiah", accepted: ["messiah"] },
      { before: "Anna was described as a", after: "who gave thanks to God about the child Jesus.", answer: "prophetess", accepted: ["prophetess"] },
      { before: "At twelve years old, Jesus was found in the temple listening to and questioning the", after: ".", answer: "teachers", accepted: ["teachers"] },
      { before: "Jesus told His parents He had to be about His Father's", after: ".", answer: "business", accepted: ["business"] },
      { before: "Luke 2:52 says Jesus grew in wisdom and stature, and in favour with God and", after: ".", answer: "people", accepted: ["people", "man"] },
      { before: "Presenting a child to God, as Mary and Joseph did with Jesus, is called", after: ".", answer: "dedication", accepted: ["dedication"] },
      { before: "The angel's announcement to Mary that she would give birth to Jesus is called the", after: ".", answer: "annunciation", accepted: ["annunciation"] },
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
      hint: "Think about the events of Jesus' birth, dedication, and childhood.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
