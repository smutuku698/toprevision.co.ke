import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the events of the parable of the hidden treasure in the correct order.",
    "these events from Matthew 13:44 into the order they happened.",
    "these moments from the parable of the man in the field in order.",
    "these events the way they happened in the parable.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the hidden treasure or the pearl of great value.",
    "these facts about the two parables under the correct bucket.",
    "each fact below by which parable it belongs to.",
    "each statement into the bucket for the parable it describes.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the hidden treasure and the pearl with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the parable.",
    "the correct missing word.",
  ],
);

// Only the treasure-in-the-field half of the passage (Matthew 13:44) has a genuine multi-step narrative
// sequence; the pearl half (13:45-46) is a short two-beat parallel with no distinct extra steps, so the
// ordering branch is built from the treasure story alone.
const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "A man is working in a field that belongs to someone else" },
  { id: "n2", label: "He discovers a treasure hidden in the field" },
  { id: "n3", label: "In his joy, he hides the treasure again where he found it" },
  { id: "n4", label: "He goes away and sells everything he owns" },
  { id: "n5", label: "He uses the money to buy the field" },
  { id: "n6", label: "The treasure now belongs to him" },
];

interface EventFact { text: string; which: "treasure" | "pearl" }
const EVENT_FACTS: EventFact[] = [
  { text: "A man discovers treasure hidden in a field while working there", which: "treasure" },
  { text: "The field where the treasure is hidden does not belong to the man at first", which: "treasure" },
  { text: "In his joy at finding the treasure, the man hides it again", which: "treasure" },
  { text: "The man sells everything he owns in order to buy the field", which: "treasure" },
  { text: "Buying the whole field is the only way for the man to rightfully own the treasure inside it", which: "treasure" },
  { text: "The man's joy at finding the treasure makes giving up everything else feel worthwhile", which: "treasure" },
  { text: "A merchant is searching for fine pearls as part of his trade", which: "pearl" },
  { text: "The merchant finds one pearl of exceptionally great value", which: "pearl" },
  { text: "Unlike the man in the field, the merchant is actively searching, not stumbling upon it by accident", which: "pearl" },
  { text: "The merchant sells everything he has in order to buy the one valuable pearl", which: "pearl" },
  { text: "The merchant recognises the pearl's worth immediately because he is an expert in his trade", which: "pearl" },
  { text: "Both the man and the merchant give up everything they own for something of far greater value", which: "pearl" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Treasure", meaning: "What the man discovers hidden in a field while working" },
  { term: "The field", meaning: "What the man must buy in order to rightfully own the treasure inside it" },
  { term: "Merchant", meaning: "A trader who is searching for fine pearls when he finds one of great value" },
  { term: "Pearl of great value", meaning: "The one item the merchant sells everything to buy" },
  { term: "\"Sold all he had\"", meaning: "The phrase describing what both the man and the merchant did to obtain what they found" },
  { term: "Joy", meaning: "The emotion the man in the field feels upon discovering the treasure" },
  { term: "The Kingdom of heaven", meaning: "What both the treasure and the pearl represent in these parables" },
  { term: "Searching", meaning: "What the merchant, unlike the man in the field, was actively doing before finding the pearl" },
  { term: "Total commitment", meaning: "The value both parables teach about giving up everything for what matters most" },
  { term: "Discipleship", meaning: "Committing one's whole life to following Christ, as symbolised by \"selling all\" in both parables" },
  { term: "Priorities", meaning: "What these parables ask believers to examine, weighing faith above possessions" },
  { term: "Worth", meaning: "What both stories are ultimately about: recognising the surpassing value of God's kingdom" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Adhiambo", "Bramwel", "Cynthia", "Daudi", "Everlyne", "Felix", "Grace", "Hamisi", "Immaculate", "Job", "Kavata", "Linet"] as const;
const KENYAN_PLACES = ["Karatina", "Malaba", "Kikima", "Sabatia", "Rongai", "Nyanturago", "Kanduyi", "Ugunja", "Ndhiwa Town", "Kajiado Town", "Sultan Hamud", "Iten"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is offered a chance to spend all their savings on something they believe is truly life-changing, but friends think it is reckless. Which detail from the two parables best matches this kind of decision?`,
    correct: "Both the man and the merchant sold everything they owned because they recognised something was worth far more than all their possessions combined",
    wrong: [
      "Both men regretted their decision immediately after making it",
      "Both men were forced to sell their belongings by someone else",
      "Neither man actually went through with the purchase in the end",
    ],
    explanation: "In both parables, the man and the merchant willingly sold everything, unregretfully and by choice, because of the surpassing worth of what they had found.",
  }),
  (rng) => ({
    prompt: `${name(rng)} compares how the two men in these parables found their treasure — one stumbled upon it while working, the other was searching on purpose. What does this difference suggest about finding the Kingdom of God?`,
    correct: "People may come to recognise the value of God's kingdom either unexpectedly or through deliberate searching — both paths are shown as valid",
    wrong: [
      "Only people who actively search for God, like the merchant, can ever find him",
      "Only accidental discovery counts, so deliberately seeking God is pointless",
      "The two stories actually describe exactly the same kind of discovery, with no real difference",
    ],
    explanation: "Placing an accidental discovery alongside a deliberate search suggests both ways of coming to value God's kingdom are genuine and valid.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why the man in the parable hid the treasure again instead of taking it home immediately. What is the most likely reason, based on the story?`,
    correct: "Because the treasure was in someone else's field, so he needed to buy the field first to make it rightfully his",
    wrong: [
      "Because he wanted to secretly take the treasure without ever paying for the field",
      "Because he had forgotten exactly where he found it",
      "Because the treasure was too heavy for him to carry immediately",
    ],
    explanation: "Hiding the treasure again and then buying the field shows the man securing rightful ownership, not attempting to take it dishonestly.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked which value both parables most directly teach about committing to Christ. What is it?`,
    correct: "Total, joyful commitment — giving up everything else because the Kingdom of God is worth more than all of it combined",
    wrong: [
      "Caution — never risking anything for your faith",
      "Balance — giving God only a small, manageable portion of your life",
      "Delay — waiting until later in life to fully commit to God",
    ],
    explanation: "Both parables show total, joyful commitment: selling everything owned for the sake of something recognised as worth far more.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s friend in ${place(rng)} says these parables are "really just about smart investing, not about faith." Is this a fair reading of the parables?`,
    correct: "No — while the stories use money and trade as pictures, Jesus is teaching about the far greater value of the Kingdom of God, not literal financial advice",
    wrong: [
      "Yes — Jesus is only giving practical business advice with no spiritual meaning",
      "Yes — the parables have nothing to do with the Kingdom of God at all",
      "No — the parables are actually warnings against ever buying land or pearls",
    ],
    explanation: "Matthew 13:44-46 uses treasure, a field and a pearl as pictures of the Kingdom of God's surpassing worth, not as literal financial instruction.",
  }),
  (rng) => ({
    prompt: `${name(rng)} notices that both the treasure and the pearl are described as being of great worth. What is this repeated emphasis meant to show?`,
    correct: "That the Kingdom of God is of surpassing, extraordinary worth, greater than anything else a person could own",
    wrong: [
      "That treasure and pearls are literally the most valuable things a person can ever own",
      "That Jesus is comparing the Kingdom of God to ordinary, everyday objects with no special meaning",
      "That the repetition is simply a storytelling mistake with no real purpose",
    ],
    explanation: "Repeating the theme of extraordinary worth across two short parables emphasises just how surpassing the value of God's kingdom is.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what is the key similarity between the man who found the treasure and the merchant who found the pearl. What is it?`,
    correct: "Both recognised something of far greater worth than everything they already owned, and both gave up all they had to obtain it",
    wrong: [
      "Both were professional traders by occupation",
      "Both found their treasure in exactly the same location",
      "Both refused to give up anything in order to keep what they found",
    ],
    explanation: "Despite finding their treasure differently, both men shared the same response: recognising its surpassing worth and giving up everything to obtain it.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s classmate says believing in Jesus should cost a Christian nothing at all. How would these two parables respond to that idea?`,
    correct: "The parables suggest that fully valuing God's kingdom may call for real, costly commitment, giving up whatever competes with it, just as both men gave up everything they owned",
    wrong: [
      "The parables agree completely — faith should never require giving up anything",
      "The parables are only about literal money, so they say nothing about commitment",
      "The parables suggest only wealthy people can ever value God's kingdom",
    ],
    explanation: "Both men's willingness to give up everything models the kind of costly, total commitment these parables suggest genuine faith may call for.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what the man did immediately after discovering the treasure, according to the parable. What was it?`,
    correct: "He hid it again, then went and sold everything he owned",
    wrong: [
      "He told everyone in the town about it right away",
      "He immediately dug up all the treasure and took it home without buying the field",
      "He abandoned the field completely and never returned",
    ],
    explanation: "Matthew 13:44 records the man hiding the treasure again and then going to sell all he had, before buying the field.",
  }),
  (rng) => ({
    prompt: `${name(rng)} wonders why Jesus told two similar parables about the same idea instead of just one. What is the best reason?`,
    correct: "To reinforce the same lesson about the Kingdom's surpassing worth from two different angles, an accidental discovery and a deliberate search",
    wrong: [
      "Because the two parables actually teach two completely unrelated, contradictory lessons",
      "Because Jesus repeated himself by accident",
      "Because the second parable was meant to replace and cancel out the first one",
    ],
    explanation: "Telling both a stumbled-upon discovery and a deliberate search reinforces the same lesson about the kingdom's worth in two complementary ways.",
  }),
];

export const theHiddenTreasure: Skill = {
  id: "g6-cre-jc-the-hidden-treasure",
  code: "JC.6",
  subjectId: "cre",
  strandId: "g6-cre-jesus",
  grade: 6,
  title: "The Parable of the Hidden Treasure",
  description: "The parables of the hidden treasure and the pearl of great value (Matthew 13:44-46), and the lesson that the Kingdom of God is worth giving up everything else for.",
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
        hint: "Start with the man working in the field, and end with the treasure belonging to him.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const treasure = shuffle(rng, EVENT_FACTS.filter((f) => f.which === "treasure")).slice(0, 4);
      const pearl = shuffle(rng, EVENT_FACTS.filter((f) => f.which === "pearl")).slice(0, 4);
      const chosen = shuffle(rng, [...treasure, ...pearl]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.which));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "treasure", label: "The hidden treasure" },
          { id: "pearl", label: "The pearl of great value" },
        ],
        correctBucket,
        hint: "The treasure is found by a man working in a field; the pearl is found by a merchant deliberately searching.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.which === "treasure" ? "the hidden treasure" : "the pearl of great value"}.`).join(" "),
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
        hint: "Think about what each man found, what he gave up, and what both stories teach about the Kingdom of God.",
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
        hint: "Think about what both men gave up, and why the Kingdom of God is compared to something of surpassing worth.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "A man discovers treasure hidden in a field while", after: "there.", answer: "working", accepted: ["working"] },
      { before: "In his joy, the man", after: "the treasure again where he found it.", answer: "hides", accepted: ["hides", "hid"] },
      { before: "To own the treasure rightfully, the man had to buy the whole", after: ".", answer: "field", accepted: ["field"] },
      { before: "The man sold everything he owned in order to buy the field, because of the", after: "he felt at finding the treasure.", answer: "joy", accepted: ["joy"] },
      { before: "In the second parable, a", after: "was searching for fine pearls.", answer: "merchant", accepted: ["merchant"] },
      { before: "The merchant found one pearl of great", after: ".", answer: "value", accepted: ["value", "worth"] },
      { before: "Unlike the man in the field, the merchant was actively", after: "for pearls, not stumbling upon one by accident.", answer: "searching", accepted: ["searching", "looking"] },
      { before: "Just like the man in the field, the merchant sold", after: "he had to buy the one pearl.", answer: "everything", accepted: ["everything", "all"] },
      { before: "Both parables compare something of great worth to the Kingdom of", after: ".", answer: "heaven", accepted: ["heaven", "god"] },
      { before: "These parables are found in the Gospel of Matthew, chapter", after: ".", answer: "13", accepted: ["13", "thirteen"] },
      { before: "Both stories teach that following Christ is worth giving up", after: "else for.", answer: "everything", accepted: ["everything", "all"] },
      { before: "The lesson of both parables is that believers should", after: "their lives to Christ.", answer: "commit", accepted: ["commit", "devote"] },
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
      hint: "Think about the man who found treasure in a field and the merchant who found one pearl of great value.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
