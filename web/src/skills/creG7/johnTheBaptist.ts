import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the events of John the Baptist's birth and early ministry in the correct order.",
  "Put these events from John the Baptist's story into order.",
  "Sequence these events of John's birth and ministry correctly.",
  "Arrange these moments from John the Baptist's life in order.",
  "Order these events the way they happened in John's story.",
  "Sort these events into the order they happened in Luke's account of John.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as being about John the Baptist's birth, or about his message and ministry.",
  "Decide whether each statement is about John's birth or his ministry, and sort it there.",
  "Group these statements under John's birth or his message and ministry.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for birth or ministry.",
  "Read each statement and sort it under birth or message and ministry.",
];

const MATCH_PROMPTS = [
  "Match each term to its meaning.",
  "Pair each term below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each term to the statement that explains it.",
  "Link each term below to its correct definition.",
  "Match each term to the description that fits it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about John the Baptist with the right word.",
];

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "An angel announces to Zechariah that his elderly wife Elizabeth will bear a son (Luke 1:5-25)" },
  { id: "n2", label: "Elizabeth conceives, and Zechariah remains unable to speak because he doubted the angel" },
  { id: "n3", label: "Elizabeth gives birth to a son, whom relatives assume will be named after Zechariah" },
  { id: "n4", label: "Zechariah insists the child be named John, and he regains his speech (Luke 1:57-66)" },
  { id: "n5", label: "John grows up and begins preaching repentance in the wilderness" },
  { id: "n6", label: "John points to Jesus as 'the Lamb of God who takes away the sin of the world' (John 1:29)" },
];

const BIRTH_FACTS = [
  "An angel appeared to Zechariah in the temple to announce John's birth",
  "Zechariah doubted the angel's message and was struck unable to speak",
  "Elizabeth, who was thought unable to have children, conceived in her old age",
  "Relatives and neighbours expected the baby to be named after his father, Zechariah",
  "Zechariah wrote 'His name is John' on a tablet, and his speech was immediately restored",
] as const;

const MESSAGE_FACTS = [
  "John called the crowds to repentance, warning them not to rely only on their ancestry",
  "John taught that a person with two coats should share with someone who has none",
  "John told tax collectors not to collect more money than they were authorised to",
  "John told soldiers not to extort money and to be content with their wages",
  "John described Jesus as one who would baptise people with the Holy Spirit and fire (Luke 3:16)",
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "Precursor", meaning: "Someone who comes before and prepares the way for another" },
  { term: "Lamb of God", meaning: "John's description of Jesus in John 1:29, pointing to Him taking away the sin of the world" },
  { term: "Repentance", meaning: "Turning away from wrongdoing and back towards God" },
  { term: "Baptism", meaning: "A washing with water symbolising repentance and, for John, pointing forward to Jesus" },
  { term: "Fruit of repentance", meaning: "Visible changes in behaviour, such as honesty and generosity, that show genuine repentance" },
  { term: "Contentment", meaning: "Being satisfied with what one has, as John told soldiers to be with their wages" },
  { term: "Zechariah", meaning: "John the Baptist's father, a priest who doubted the angel's announcement" },
  { term: "Elizabeth", meaning: "John the Baptist's mother, who conceived in her old age" },
  { term: "Wilderness", meaning: "The remote area where John preached and baptised people" },
  { term: "Winnowing fork", meaning: "An image John used (Luke 3:17) for the Messiah separating genuine faith from empty profession" },
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
      prompt: `${who} in ${place(rng)} has two school uniforms while a classmate has none. Which teaching of John the Baptist (Luke 3:11) applies most directly?`,
      correct: "Whoever has two coats should share with the one who has none",
      wrong: ["Tax collectors should not collect more than what is appointed to them", "Soldiers should be content with their wages", "Produce fruit in keeping with repentance in a general sense only"],
      explanation: "Luke 3:11 records John's specific instruction to share extra clothing with someone who has none — directly applicable to sharing a spare uniform with a classmate.",
    };
  },
  (rng) => ({
    prompt: `A market vendor in ${place(rng)}, inspired by John's teaching to tax collectors, decides never to overcharge customers beyond a fair price. Which of John's teachings does this reflect?`,
    correct: "Tax collectors were told not to collect more money than they were authorised to (Luke 3:13)",
    wrong: ["Soldiers were told to be content with their wages", "Whoever has two coats should share with someone who has none", "John described Jesus as baptising with the Holy Spirit and fire"],
    explanation: "John's instruction to tax collectors — not to collect more than authorised — is the same principle of fair, honest dealing that applies to a vendor pricing goods fairly.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a security guard in ${place(rng)}, is offered a bribe to look the other way but refuses and stays satisfied with an honest wage. Which teaching of John the Baptist does this reflect?`,
      correct: "Soldiers were told not to extort money and to be content with their wages (Luke 3:14)",
      wrong: ["Whoever has two coats should share with someone who has none", "Tax collectors should not collect more than what is appointed", "John described Jesus using the image of a winnowing fork"],
      explanation: "John told soldiers specifically not to extort money and to be content with their wages — a principle a security guard refusing a bribe directly reflects.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims to have repented but continues cheating and hoarding without any change in behaviour. What would John the Baptist say is missing?`,
    correct: "'Fruit in keeping with repentance' — visible changes in behaviour that show genuine repentance (Luke 3:8)",
    wrong: ["Nothing is missing, since repentance requires no change in behaviour", "John taught that only public confession matters, not behaviour", "John taught that repentance is impossible for anyone to achieve"],
    explanation: "John explicitly called people to 'produce fruit in keeping with repentance' — genuine repentance shows itself through changed, visible behaviour, not words alone.",
  }),
  (rng) => ({
    prompt: `${name(rng)} reads that John described Jesus in John 1:29 as 'the Lamb of God who takes away the sin of the world.' What does this title point to?`,
    correct: "Jesus' role in taking away sin, connecting Him to Old Testament sacrifice",
    wrong: ["Jesus literally being a farm animal", "A minor, unimportant title with no real meaning", "John's own role as the one who takes away sin"],
    explanation: "'Lamb of God' connects Jesus to the Old Testament practice of sacrifice, pointing to His role in taking away the sin of the world — a central description of His mission.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why Zechariah could not speak after the angel's announcement, according to Luke 1:5-25. What was the reason?`,
    correct: "Zechariah doubted the angel's message that Elizabeth would bear a son",
    wrong: ["Zechariah was born unable to speak", "Zechariah chose silence as a form of fasting", "The angel never explained any reason for the silence"],
    explanation: "Luke 1:20 records that Zechariah's silence was a direct result of his doubt about the angel's announcement — resolved only once he obediently named the child John.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what happened immediately after Zechariah insisted on naming the child John, according to Luke 1:57-66. What was it?`,
    correct: "Zechariah's speech was immediately restored",
    wrong: ["Zechariah lost his ability to speak permanently", "Elizabeth lost her ability to speak instead", "Nothing changed at all after the naming"],
    explanation: "Luke 1:64 records that as soon as Zechariah obediently confirmed the child's name as John, his speech returned immediately.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} explains why John the Baptist is called a 'precursor' to the Messiah. What does this term mean in this context?`,
    correct: "John came before Jesus and prepared the way for His ministry",
    wrong: ["John was born long after Jesus had already died", "John and Jesus never had any connection to one another", "'Precursor' means John replaced Jesus permanently"],
    explanation: "A precursor is someone who comes before and prepares the way for another — John's ministry of calling people to repentance directly prepared the way for Jesus' arrival.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is warned about ignoring John's call to genuine repentance, remembering his image of the winnowing fork (Luke 3:17). What does this image warn about?`,
    correct: "A separation between genuine faith, shown through changed behaviour, and empty profession",
    wrong: ["A literal farming tool with no spiritual meaning at all", "A promise that everyone will be treated exactly the same regardless of their choices", "A reference to John's own occupation as a farmer"],
    explanation: "The winnowing fork image pictures a separation — like sorting wheat from chaff — between genuine repentant faith and empty profession, reinforcing John's call for real change, not just words.",
  }),
];

export const johnTheBaptist: Skill = {
  id: "g7-cre-jc-john-the-baptist",
  code: "JC.2",
  subjectId: "cre",
  strandId: "g7-cre-jesus",
  grade: 7,
  title: "John the Baptist: A Precursor to the Messiah",
  description: "The annunciation and birth of John the Baptist (Luke 1:5-25, 1:57-66), his description of the Messiah (Luke 3:16, John 1:29-30), and his message calling people to repentance (Luke 3:7-18).",
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
        hint: "Start with the angel's announcement to Zechariah and end with John pointing to Jesus as the Lamb of God.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const birth = shuffle(rng, BIRTH_FACTS).slice(0, 4);
      const message = shuffle(rng, MESSAGE_FACTS).slice(0, 4);
      const chosen = shuffle(rng, [...birth.map((t) => ({ text: t, kind: "birth" })), ...message.map((t) => ({ text: t, kind: "message" }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "birth", label: "About John's birth" },
          { id: "message", label: "About John's message and ministry" },
        ],
        correctBucket,
        hint: "Birth events come from Luke 1; the message comes from Luke 3 and John 1.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.kind === "birth" ? "about John's birth" : "about John's message and ministry"}.`).join(" "),
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
        hint: "Think about John the Baptist's family, his ministry, and his message.",
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
        hint: "Think about John's specific instructions in Luke 3:7-18 and what they mean today.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "An angel announced John's birth to his father,", after: ", in the temple.", answer: "Zechariah", accepted: ["zechariah"] },
      { before: "John's mother, who conceived in her old age, was named", after: ".", answer: "Elizabeth", accepted: ["elizabeth"] },
      { before: "Zechariah could not speak until he confirmed the baby's name would be", after: ".", answer: "John", accepted: ["john"] },
      { before: "John described Jesus as the Lamb of God who takes away the", after: "of the world (John 1:29).", answer: "sin", accepted: ["sin"] },
      { before: "John said one more powerful than him would baptise people with the Holy Spirit and", after: "(Luke 3:16).", answer: "fire", accepted: ["fire"] },
      { before: "John told the crowd that whoever has two coats should share with the one who has", after: ".", answer: "none", accepted: ["none"] },
      { before: "John told tax collectors not to collect more than what was", after: "to them.", answer: "appointed", accepted: ["appointed"] },
      { before: "John told soldiers to be", after: "with their wages instead of extorting money.", answer: "content", accepted: ["content"] },
      { before: "Turning away from wrongdoing and back towards God is called", after: ".", answer: "repentance", accepted: ["repentance"] },
      { before: "Someone who comes before and prepares the way for another is called a", after: ".", answer: "precursor", accepted: ["precursor"] },
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
      hint: "Think about John the Baptist's birth, his message, and his description of the Messiah.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
