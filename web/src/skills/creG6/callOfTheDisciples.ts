import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring 20 fully bespoke sentences.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the events of the call of the first disciples in the correct order.",
    "these events from Mark 1:16-20 into the order they happened.",
    "these moments from the call of Simon, Andrew, James and John in order.",
    "these events the way they happened beside the Sea of Galilee.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by which pair of brothers it describes.",
    "these facts about the call of the disciples under the correct pair of brothers.",
    "each fact below by whether it is about Simon and Andrew or James and John.",
    "each statement into the bucket for the brothers it describes.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or person below with its correct meaning.",
    "each idea about the call of the disciples with its explanation.",
    "each term to the description that fits it.",
    "each term or person to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the call of the disciples.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Jesus is walking beside the Sea of Galilee and sees Simon and his brother Andrew casting a net into the water (Mark 1:16)" },
  { id: "n2", label: "Jesus calls out to them, \"Come, follow me, and I will send you out to fish for people\" (Mark 1:17)" },
  { id: "n3", label: "Simon and Andrew immediately leave their net and follow Jesus (Mark 1:18)" },
  { id: "n4", label: "Jesus goes on and sees James and John, sons of Zebedee, in a boat mending their nets (Mark 1:19)" },
  { id: "n5", label: "Jesus calls James and John also" },
  { id: "n6", label: "James and John immediately leave their father Zebedee in the boat with the hired men and follow Jesus (Mark 1:20)" },
];

interface EventFact { text: string; pair: "simonAndrew" | "jamesJohn" }
const EVENT_FACTS: EventFact[] = [
  { text: "Simon and his brother Andrew were casting a net into the Sea of Galilee when Jesus first saw them", pair: "simonAndrew" },
  { text: "Jesus told Simon and Andrew, \"Come, follow me, and I will send you out to fish for people\"", pair: "simonAndrew" },
  { text: "Simon and Andrew were fishermen working with a net in the water, not yet in a boat", pair: "simonAndrew" },
  { text: "Simon and Andrew left their net at once and followed Jesus", pair: "simonAndrew" },
  { text: "Simon later became known as Peter, one of the leading apostles", pair: "simonAndrew" },
  { text: "Simon and Andrew were the first two disciples Jesus called beside the Sea of Galilee", pair: "simonAndrew" },
  { text: "James and John were the sons of a man named Zebedee", pair: "jamesJohn" },
  { text: "James and John were in a boat mending their nets when Jesus called them", pair: "jamesJohn" },
  { text: "James and John left their father Zebedee in the boat with the hired men", pair: "jamesJohn" },
  { text: "James and John responded immediately, just as Simon and Andrew had done", pair: "jamesJohn" },
  { text: "James and John were called shortly after Simon and Andrew, a little further along the shore", pair: "jamesJohn" },
  { text: "James and John, like Simon and Andrew, left their fishing work behind to follow Jesus", pair: "jamesJohn" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Fishers of people", meaning: "The new purpose Jesus gave Simon and Andrew when He called them to follow Him" },
  { term: "Immediate response", meaning: "Leaving their nets and boat right away instead of delaying, as all four disciples did" },
  { term: "Zebedee", meaning: "The father of James and John, left behind in the boat when his sons followed Jesus" },
  { term: "Sea of Galilee", meaning: "The lake where Jesus first called Simon and Andrew as they were casting their net" },
  { term: "Mending nets", meaning: "What James and John were doing in the boat when Jesus called them" },
  { term: "A CRE teacher", meaning: "A modern example of someone called to serve God by teaching others about Scripture" },
  { term: "A church usher", meaning: "A modern example of someone called to serve God by welcoming and guiding worshippers" },
  { term: "A choir member", meaning: "A modern example of someone called to serve God through music and worship" },
  { term: "A Sunday school teacher", meaning: "A modern example of someone called to serve God by nurturing children's faith" },
  { term: "A community health volunteer", meaning: "A modern example of someone called to serve God by caring for the sick and needy" },
  { term: "Simon (Peter)", meaning: "The disciple called together with his brother Andrew while casting a net" },
  { term: "Hired men", meaning: "The workers left with Zebedee in the boat when James and John followed Jesus" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Achieng", "Bakari", "Cherotich", "Duncan", "Eunice", "Fadhili", "Gitau", "Halima", "Irene", "Joel", "Kelvin", "Loise"] as const;
const KENYAN_PLACES = ["Kericho", "Kilifi", "Nanyuki", "Migori", "Kapenguria", "Ol Kalou", "Chuka", "Mumias", "Ruaraka", "Athi River", "Wote", "Maralal"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked who Jesus called first, beside the Sea of Galilee, in Mark 1:16-20. Who were they?`,
    correct: "Simon and his brother Andrew",
    wrong: [
      "James and John, sons of Zebedee",
      "Peter and John, casting a net together",
      "Zebedee and one of his hired men",
    ],
    explanation: "Mark 1:16 records that Jesus called Simon and his brother Andrew first, as they were casting a net into the Sea of Galilee; James and John were called shortly after.",
  }),
  (rng) => ({
    prompt: `${name(rng)} reads that Simon and Andrew "at once left their nets and followed him" (Mark 1:18). What does the phrase "at once" show about their response?`,
    correct: "They obeyed Jesus' call without delay or hesitation",
    wrong: [
      "They first negotiated better fishing terms with Jesus",
      "They took several days to think it over before deciding",
      "They waited until they had finished that day's fishing first",
    ],
    explanation: "\"At once\" shows Simon and Andrew responded immediately, with no delay or bargaining, once Jesus called them.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices that James and John left their father Zebedee in the boat with the hired men when Jesus called them. What does this detail best show?`,
    correct: "They put following Jesus above their own family business, showing wholehearted commitment",
    wrong: [
      "They had no respect at all for their father's business",
      "Their father Zebedee forced them to leave against their will",
      "They planned to return to fishing after only a short trip with Jesus",
    ],
    explanation: "Leaving Zebedee and the family fishing business behind shows James and John's wholehearted, immediate commitment to following Jesus, not disrespect for their father.",
  }),
  (rng) => ({
    prompt: `${name(rng)} explains to a friend in ${place(rng)} what Jesus meant by telling Simon and Andrew he would make them "fish for people." What is the meaning of this phrase?`,
    correct: "Gathering people to follow God and hear the good news, using their skills for a new purpose",
    wrong: [
      "Teaching people how to catch fish using better nets",
      "Becoming professional net-makers for the local fishing trade",
      "Leading fishing expeditions for other disciples to join",
    ],
    explanation: "\"Fish for people\" is a figure of speech: Jesus was giving Simon and Andrew a new purpose, using their skill and energy to gather people to God rather than fish.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sings in the church choir every week in ${place(rng)}, while a classmate ushers visitors to their seats during service. Based on the call of the disciples, what does this best show about serving God today?`,
      correct: "People are called to serve God in different ways, using their own gifts and roles",
      wrong: [
        "Only people who work as fishermen can be called by God",
        "Everyone must become a full-time preacher to truly serve God",
        "Serving God only counts if it is done exactly the way Simon and Andrew did it",
      ],
      explanation: "Just as Simon, Andrew, James and John were called from their own occupation to serve God, people today are called to serve Him through many different roles and gifts.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked who Jesus called second, right after Simon and Andrew. Who were they?`,
    correct: "James and John, sons of Zebedee",
    wrong: [
      "Simon and Andrew a second time",
      "Matthew and Levi, two tax collectors",
      "Zebedee and a hired man from his boat",
    ],
    explanation: "Mark 1:19-20 records that after calling Simon and Andrew, Jesus went a little further and called James and John, the sons of Zebedee.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} takes on a difficult responsibility at church even though it means giving up free time each week, much like James and John gave up their father's business. Which value does this most reflect?`,
    correct: "Responsibility — committing fully to what God asks, even when it costs something",
    wrong: [
      "Selfishness — putting personal comfort above every other duty",
      "Carelessness about family and other responsibilities",
      "Fear of disappointing other people around them",
    ],
    explanation: "James and John's readiness to leave their father's business for Jesus' call models responsibility: fully committing to God's call even when it comes at a cost.",
  }),
  (rng) => ({
    prompt: `${name(rng)} points out that Jesus called two pairs of brothers — Simon and Andrew, then James and John. Which value does this pairing of brothers highlight?`,
    correct: "Unity — the brothers answered God's call and served together, supporting one another",
    wrong: [
      "Competition between each pair of brothers",
      "Jealousy of one brother toward the other",
      "Independence, since each brother really acted alone",
    ],
    explanation: "Calling brothers in pairs highlights unity: they left their former work and served God together, not competing or acting alone.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} feels called to serve God by becoming a Sunday school teacher rather than a pastor. Based on the lesson of the call of the disciples, is this a legitimate way to serve God?`,
      correct: "Yes — God calls different people to different roles of service, not only to be a pastor",
      wrong: [
        "No — only becoming a pastor counts as truly being called by God",
        "No — only fishermen were ever called by God, as in Mark 1:16-20",
        "No — serving God only happens formally inside a church building",
      ],
      explanation: "The call of the disciples shows God calling ordinary people from their everyday work; today, people are likewise called to serve God through many different roles, not only as a pastor.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked where Jesus was standing when he first called Simon and Andrew. Where was it?`,
    correct: "Beside the Sea of Galilee, watching them cast a net into the water",
    wrong: [
      "In the temple courts in Jerusalem",
      "In a boat already far out at sea",
      "On a mountainside, teaching a large crowd",
    ],
    explanation: "Mark 1:16 records that Jesus was walking beside the Sea of Galilee when he saw Simon and Andrew casting their net, and called them there.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is comparing how Jesus found each pair of brothers. Which detail correctly matches how James and John were found, compared with Simon and Andrew?`,
    correct: "James and John were in a boat mending their nets, while Simon and Andrew were casting a net into the water",
    wrong: [
      "James and John were casting a net into the water, just like Simon and Andrew",
      "Simon and Andrew were mending nets in a boat, just like James and John",
      "Both pairs of brothers were already following another teacher before Jesus called them",
    ],
    explanation: "Mark 1:16-19 gives two distinct details: Simon and Andrew were casting a net in the water, while James and John were in a boat mending their nets.",
  }),
];

export const callOfTheDisciples: Skill = {
  id: "g6-cre-jc-call-of-the-disciples",
  code: "JC.1",
  subjectId: "cre",
  strandId: "g6-cre-jesus",
  grade: 6,
  title: "The Call of the Disciples",
  description: "The call of Simon, Andrew, James and John beside the Sea of Galilee (Mark 1:16-20), their immediate response, and how different people are called to serve God today.",
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
        hint: "Start with Simon and Andrew casting their net, and end with James and John leaving their father in the boat.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const simonAndrew = shuffle(rng, EVENT_FACTS.filter((f) => f.pair === "simonAndrew")).slice(0, 3);
      const jamesJohn = shuffle(rng, EVENT_FACTS.filter((f) => f.pair === "jamesJohn")).slice(0, 3);
      const chosen = shuffle(rng, [...simonAndrew, ...jamesJohn]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.pair));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "simonAndrew", label: "Simon and Andrew" },
          { id: "jamesJohn", label: "James and John" },
        ],
        correctBucket,
        hint: "Simon and Andrew were casting a net in the water; James and John were in a boat mending nets with their father Zebedee.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.pair === "simonAndrew" ? "Simon and Andrew" : "James and John"}.`).join(" "),
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
        hint: "Think about who Jesus called first, how they responded, and how people serve God today.",
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
        hint: "Think about Mark 1:16-20, how immediately the disciples responded, and how people serve God today.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Jesus saw Simon and his brother Andrew casting a net into the Sea of", after: ".", answer: "Galilee", accepted: ["galilee"] },
      { before: "Jesus called out to Simon and Andrew, \"Follow me, and I will send you out to fish for", after: ".\"", answer: "people", accepted: ["people", "men"] },
      { before: "Simon and Andrew immediately left their", after: "and followed Jesus.", answer: "net", accepted: ["net", "nets"] },
      { before: "James and John were sons of a man named", after: ".", answer: "Zebedee", accepted: ["zebedee"] },
      { before: "When Jesus called them, James and John were in a boat mending their", after: ".", answer: "nets", accepted: ["nets", "net"] },
      { before: "James and John left their father Zebedee in the boat along with the", after: ".", answer: "hired men", accepted: ["hired men", "hired workers"] },
      { before: "Simon was later given the name", after: ", meaning \"rock.\"", answer: "Peter", accepted: ["peter"] },
      { before: "The disciples' response to Jesus' call was", after: "— they did not delay.", answer: "immediate", accepted: ["immediate", "immediately"] },
      { before: "Jesus called Simon and Andrew, then went on to call James and", after: ".", answer: "John", accepted: ["john"] },
      { before: "Today, people can serve God in many ways, such as teaching, singing, or ushering, just as the first disciples were called to their own kind of", after: ".", answer: "service", accepted: ["service", "work"] },
      { before: "Mark's Gospel records the call of the first disciples in chapter one, verses", after: " to twenty.", answer: "sixteen", accepted: ["sixteen", "16"] },
      { before: "Simon and Andrew were working as", after: "before Jesus called them to follow Him.", answer: "fishermen", accepted: ["fishermen", "fisherman"] },
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
      hint: "Think about the call of Simon, Andrew, James and John beside the Sea of Galilee.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
