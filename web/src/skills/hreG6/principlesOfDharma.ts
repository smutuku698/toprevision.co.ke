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
    "the ten Paramitas (virtues) in their traditional listed order.",
    "these Paramitas into the order they are traditionally listed.",
    "the ten Paramitas from the first to the tenth.",
    "these Paramitas into their correct traditional order.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by whether it defines a Paramita or describes how Jataka stories teach the Paramitas.",
    "these facts under the correct heading.",
    "each fact below by whether it is a virtue's meaning or a fact about Scriptural stories.",
    "each fact into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each Paramita to its meaning.",
    "each Paramita below with what it means.",
    "each Paramita to the explanation that fits it.",
    "each Paramita to the virtue it names.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Principles of Dharma.",
    "the correct missing word.",
  ],
);

// The ten Paramitas (perfections), in their traditional listed order in Theravada Buddhist teaching —
// genuine, curriculum-adjacent content directly matching this sub-strand's "primary virtues from
// Buddhist stories" framing, since Jataka tales are traditionally organised around demonstrating them.
const PARAMITAS = [
  { id: "d1", label: "Dana — generosity" },
  { id: "d2", label: "Sila — moral conduct" },
  { id: "d3", label: "Nekkhamma — renunciation" },
  { id: "d4", label: "Panna — wisdom" },
  { id: "d5", label: "Viriya — effort" },
  { id: "d6", label: "Khanti — patience" },
  { id: "d7", label: "Sacca — truthfulness" },
  { id: "d8", label: "Adhitthana — determination" },
  { id: "d9", label: "Metta — loving-kindness" },
  { id: "d10", label: "Upekkha — equanimity" },
];

interface DharmaFact { text: string; kind: "meaning" | "story" }
const DHARMA_FACTS: DharmaFact[] = [
  { text: "Dana means generosity — the practice of giving without expecting anything in return", kind: "meaning" },
  { text: "Khanti means patience — bearing hardship and difficulty without anger", kind: "meaning" },
  { text: "Metta means loving-kindness — wishing well-being for all living beings", kind: "meaning" },
  { text: "Sacca means truthfulness — being honest in speech and action", kind: "meaning" },
  { text: "Panna means wisdom — understanding the true nature of things", kind: "meaning" },
  { text: "Jataka tales are stories of the Buddha's previous lives, each often demonstrating one Paramita (virtue)", kind: "story" },
  { text: "The story of Prince Vessantara giving away his possessions is used to illustrate extreme generosity (Dana)", kind: "story" },
  { text: "Discourses on Principles of Dharma are often narrated and then performed as skits in class to help learners remember them", kind: "story" },
  { text: "Dramatising Scriptural stories based on the Principles of Dharma helps learners interpret their relevance to daily life", kind: "story" },
  { text: "Downloading information on virtues for righteousness using digital devices is one way learners research the Principles of Dharma", kind: "story" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Dana", meaning: "Generosity — giving without expecting anything in return" },
  { term: "Sila", meaning: "Moral conduct — living according to ethical discipline" },
  { term: "Nekkhamma", meaning: "Renunciation — letting go of attachment to worldly pleasures" },
  { term: "Panna", meaning: "Wisdom — understanding the true nature of things" },
  { term: "Viriya", meaning: "Effort — diligent, energetic striving toward what is right" },
  { term: "Khanti", meaning: "Patience — bearing hardship and difficulty without anger" },
  { term: "Sacca", meaning: "Truthfulness — being honest in speech and action" },
  { term: "Adhitthana", meaning: "Determination — firm resolve to see a worthy goal through" },
  { term: "Metta", meaning: "Loving-kindness — wishing well-being for all living beings" },
  { term: "Upekkha", meaning: "Equanimity — calm acceptance, without being shaken by outcomes" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} shares lunch with a classmate who forgot theirs, without expecting anything back. Which Paramita does this best demonstrate?`,
    correct: "Dana — generosity",
    wrong: ["Khanti — patience", "Sacca — truthfulness", "Upekkha — equanimity"],
    explanation: "Giving without expecting anything in return is precisely what Dana, the Paramita of generosity, describes.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} stays calm and does not lash out after being unfairly blamed for something, choosing to wait patiently for the truth to come out. Which Paramita is this?`,
    correct: "Khanti — patience",
    wrong: ["Dana — generosity", "Viriya — effort", "Adhitthana — determination"],
    explanation: "Bearing hardship or unfair treatment without anger is exactly what Khanti, the Paramita of patience, describes.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} tells the truth about a mistake even though a lie would have been easier. Which Paramita does this reflect?`,
    correct: "Sacca — truthfulness",
    wrong: ["Sila — moral conduct", "Metta — loving-kindness", "Nekkhamma — renunciation"],
    explanation: "Being honest in speech even when it is difficult is exactly what Sacca, the Paramita of truthfulness, describes — Sila is broader moral conduct in general, not honesty specifically.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps studying hard for an exam despite finding the subject difficult, refusing to give up. Which Paramita best matches this effort?`,
      correct: "Viriya — effort",
      wrong: ["Upekkha — equanimity", "Panna — wisdom", "Dana — generosity"],
      explanation: "Diligent, energetic striving despite difficulty is exactly what Viriya, the Paramita of effort, describes.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wishes well-being not only for friends but also for a rival classmate. Which Paramita is this?`,
    correct: "Metta — loving-kindness",
    wrong: ["Sacca — truthfulness", "Sila — moral conduct", "Nekkhamma — renunciation"],
    explanation: "Wishing well-being for all living beings, including someone who is not a friend, is exactly what Metta, the Paramita of loving-kindness, describes.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} accepts a disappointing exam result calmly, neither becoming bitter nor overly proud when results vary, and continues working steadily. Which Paramita fits best?`,
    correct: "Upekkha — equanimity",
    wrong: ["Khanti — patience", "Viriya — effort", "Adhitthana — determination"],
    explanation: "Remaining calm and accepting outcomes without being shaken, whether good or disappointing, is exactly what Upekkha, the Paramita of equanimity, describes.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} commits firmly to finishing a difficult community service project despite setbacks, resolving not to abandon it. Which Paramita is this?`,
      correct: "Adhitthana — determination",
      wrong: ["Nekkhamma — renunciation", "Dana — generosity", "Sacca — truthfulness"],
      explanation: "A firm resolve to see a worthy goal through despite setbacks is exactly what Adhitthana, the Paramita of determination, describes.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that the story of Prince Vessantara giving away his possessions is only about the danger of owning too much property. What is the intended lesson instead?`,
    correct: "It illustrates extreme generosity (Dana), not a warning against ownership itself",
    wrong: [
      "It illustrates the Paramita of patience (Khanti) rather than generosity",
      "It teaches that giving away possessions is always wrong",
      "It has no connection to any of the ten Paramitas",
    ],
    explanation: "The story of Prince Vessantara is specifically used in Buddhist teaching to illustrate the Paramita of Dana (generosity), not as a warning about property ownership.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that Nekkhamma and Dana describe exactly the same virtue. Evaluate this claim.`,
    correct: "Flawed — Nekkhamma is renunciation, letting go of attachment to worldly pleasures, while Dana is generosity, the act of giving to others",
    wrong: [
      "Sound — both terms describe an identical Paramita",
      "Sound — Nekkhamma is actually the Paramita for truthfulness",
      "Flawed — but only because Dana is not one of the ten Paramitas",
    ],
    explanation: "Nekkhamma (renunciation) and Dana (generosity) are two distinct Paramitas among the ten, describing different virtues even though both involve letting go of self-interest in different ways.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why it is important to observe virtues for righteousness, per this lesson's key inquiry question. What is the best answer?`,
    correct: "Observing virtues like the Paramitas builds good character and helps a person live rightly with others",
    wrong: [
      "Observing virtues matters only for monks, not for ordinary learners",
      "Virtues have no real connection to how a person treats others",
      "Observing virtues is important only when someone is watching",
    ],
    explanation: "This lesson's own aim is describing and upholding virtues for righteousness — building good character that shapes how a person treats others, not only when observed.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked how Principles of Dharma can be applied in classroom situations, per this lesson's key inquiry question. Which is the best example?`,
      correct: "Practising patience (Khanti) and truthfulness (Sacca) during group activities and discussions",
      wrong: [
        "Ignoring all classroom rules since Principles of Dharma only apply outside school",
        "Applying Principles of Dharma only during a single lesson on Buddhism",
        "Avoiding group activities entirely to prevent needing to apply any virtue",
      ],
      explanation: "This lesson's own key inquiry question about applying Principles of Dharma in classroom situations is best answered by practising virtues like patience and truthfulness during everyday classroom activities.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says wisdom (Panna) simply means knowing many facts. Is this an accurate understanding of the Paramita?`,
    correct: "No — Panna specifically means understanding the true nature of things, which is deeper than simply knowing many facts",
    wrong: [
      "Yes — Panna is defined purely as the ability to memorise information",
      "Yes — Panna and Viriya describe exactly the same Paramita",
      "No — but only because Panna is not actually one of the ten Paramitas",
    ],
    explanation: "Panna refers to a deeper understanding of the true nature of things, not merely the memorisation of facts — a distinction worth noting when interpreting this Paramita.",
  }),
];

export const principlesOfDharma: Skill = {
  id: "g6-hre-pd-principles-of-dharma",
  code: "PD.1",
  subjectId: "hre",
  strandId: "g6-hre-pd",
  grade: 6,
  title: "Virtues and Principles of Dharma in Buddhism",
  description: "The ten Paramitas (perfections) drawn from Buddhist Scriptural and Jataka stories — generosity, moral conduct, renunciation, wisdom, effort, patience, truthfulness, determination, loving-kindness, and equanimity — and how each shapes righteous living.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, PARAMITAS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the 1st Paramita to the 10th.",
        items,
        correctOrder: PARAMITAS.map((p) => p.id),
        hint: "The traditional order runs from Dana (generosity) through to Upekkha (equanimity).",
        explanation: PARAMITAS.map((p) => p.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const meaning = shuffle(rng, DHARMA_FACTS.filter((f) => f.kind === "meaning")).slice(0, 4);
      const story = shuffle(rng, DHARMA_FACTS.filter((f) => f.kind === "story")).slice(0, 4);
      const chosen = shuffle(rng, [...meaning, ...story]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "meaning", label: "Defines what a Paramita means" },
          { id: "story", label: "Describes how Scriptural stories teach virtues" },
        ],
        correctBucket,
        hint: "Some facts define a virtue's meaning; others describe how Jataka or Scriptural stories teach virtues.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.kind === "meaning" ? "defines a Paramita" : "describes Scriptural storytelling"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.term })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.term] = a.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which virtue each Paramita name refers to.",
        explanation: chosen.map((a) => `${a.term} — ${a.meaning.toLowerCase()}.`).join(" "),
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
        hint: "Think about which of the ten Paramitas the scenario is demonstrating.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Dana means generosity — giving without expecting anything in", after: ".", answer: "return", accepted: ["return"] },
      { before: "Sila means moral", after: " — living according to ethical discipline.", answer: "conduct", accepted: ["conduct"] },
      { before: "Nekkhamma means", after: " — letting go of attachment to worldly pleasures.", answer: "renunciation", accepted: ["renunciation"] },
      { before: "Panna means", after: " — understanding the true nature of things.", answer: "wisdom", accepted: ["wisdom"] },
      { before: "Viriya means effort — diligent, energetic", after: "toward what is right.", answer: "striving", accepted: ["striving"] },
      { before: "Khanti means patience — bearing hardship without", after: ".", answer: "anger", accepted: ["anger"] },
      { before: "Sacca means truthfulness — being honest in speech and", after: ".", answer: "action", accepted: ["action"] },
      { before: "Adhitthana means", after: " — firm resolve to see a worthy goal through.", answer: "determination", accepted: ["determination"] },
      { before: "Metta means loving-kindness — wishing well-being for all living", after: ".", answer: "beings", accepted: ["beings"] },
      { before: "Upekkha means", after: " — calm acceptance without being shaken by outcomes.", answer: "equanimity", accepted: ["equanimity"] },
      { before: "Jataka tales are stories of the Buddha's previous", after: ".", answer: "lives", accepted: ["lives"] },
      { before: "The story of Prince Vessantara illustrates extreme", after: "(Dana).", answer: "generosity", accepted: ["generosity"] },
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
      hint: "Recall the meaning of the ten Paramitas.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
