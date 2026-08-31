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
    "the opening words of the Sikh Mool Mantar in their correct order.",
    "these words of the Mool Mantar into the order they appear in the Guru Granth Sahib ji.",
    "the Mool Mantar's opening phrases from first to last.",
    "these Mool Mantar words into their correct starting sequence.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it describes the Sikh or the Buddhist concept of creation.",
    "these statements under the correct faith.",
    "each statement below by whether it is a Sikh or a Buddhist teaching.",
    "each statement into the bucket for Sikh teaching or Buddhist teaching.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each term below with what it means.",
    "each term to the explanation that fits it.",
    "each term to its correct meaning in Sikh or Buddhist teaching.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about creation in Buddh and Sikh faiths.",
    "the correct missing word.",
  ],
);

// The Mool Mantar's opening words, in the fixed order they appear at the start of the Guru Granth
// Sahib ji — a genuine, curriculum-endorsed sequence, not an invented one.
const MOOL_MANTAR = [
  { id: "m1", label: "Ik Onkar — There is One God" },
  { id: "m2", label: "Satnam — Whose Name is Truth" },
  { id: "m3", label: "Karta Purakh — The Creator" },
  { id: "m4", label: "Nirbhau — Without Fear" },
  { id: "m5", label: "Nirvair — Without Hatred" },
  { id: "m6", label: "Akal Moorat — Timeless Form" },
  { id: "m7", label: "Ajuni — Beyond Birth" },
  { id: "m8", label: "Saibhang — Self-Existent" },
  { id: "m9", label: "Gur Prasad — Realised by the Guru's Grace" },
];

interface CreationFact { text: string; faith: "sikh" | "buddhist" }
const CREATION_FACTS: CreationFact[] = [
  { text: "The Mool Mantar, the opening verses of the Guru Granth Sahib ji, begins with 'Ik Onkar' — teaching that there is One God who created everything", faith: "sikh" },
  { text: "The Mool Mantar names God 'Karta Purakh', meaning the Creator", faith: "sikh" },
  { text: "Guru Nanak taught that the one Creator, Waheguru, pervades all of creation — nature, humans, and every living thing", faith: "sikh" },
  { text: "Sikh teaching holds that the universe continues to exist and unfold according to God's Hukam (Divine Order)", faith: "sikh" },
  { text: "Sikh teaching describes God as Nirankar (formless), yet still understands God as the Creator of the entire universe", faith: "sikh" },
  { text: "Buddhist teaching describes the universe going through endless cycles of arising and dissolving over vast periods of time called kalpas, rather than one moment of creation", faith: "buddhist" },
  { text: "Buddhism does not centre its teaching on a single Creator God who made the universe once and for all", faith: "buddhist" },
  { text: "Buddhist teaching links how existence continues to karma — the law of cause and effect — rather than to a single act of creation", faith: "buddhist" },
  { text: "Buddhist teaching holds that all conditioned things arise depending on causes and conditions, an idea called dependent origination", faith: "buddhist" },
  { text: "Buddhist teaching focuses less on who created the universe and more on how living beings can end suffering by following the Noble Eightfold Path", faith: "buddhist" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Ik Onkar", meaning: "The opening words of the Sikh Mool Mantar, meaning 'There is One God'" },
  { term: "Karta Purakh", meaning: "The Mool Mantar's name for God as the maker of the universe" },
  { term: "Waheguru", meaning: "The Sikh name for God, understood as the eternal Creator" },
  { term: "Hukam", meaning: "God's Divine Order or Will, through which Sikh teaching says the universe unfolds" },
  { term: "Nirankar", meaning: "The formless being that Sikh teaching still holds to be the Creator of everything" },
  { term: "Mool Mantar", meaning: "The opening verses of the Guru Granth Sahib ji that state Sikh belief about God as Creator" },
  { term: "Kalpa", meaning: "An immense cycle of time in Buddhist teaching describing how the universe arises and dissolves" },
  { term: "Karma", meaning: "The Buddhist law of cause and effect that shapes how existence continues" },
  { term: "Dependent origination", meaning: "The Buddhist teaching that all things arise depending on causes and conditions" },
  { term: "Noble Eightfold Path", meaning: "The Buddhist path focused on ending suffering, not on who created the universe" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} tells classmates that Sikhism and Buddhism teach exactly the same idea about how the universe began. Is this accurate?`,
    correct: "No — Sikh teaching holds that one Creator God made everything, while Buddhist teaching describes endless cycles shaped by karma, without a single Creator",
    wrong: [
      "Yes — both faiths name the exact same Creator God in their scriptures",
      "Yes — neither faith has any teaching about how the universe exists",
      "No — but only Buddhism actually has a concept of creation at all",
    ],
    explanation: "Sikh teaching centres on one Creator God (Ik Onkar, Karta Purakh), while Buddhist teaching describes cycles of arising and dissolving (kalpas) shaped by karma, without a single Creator act.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why the Mool Mantar begins with the words 'Ik Onkar'. What is the best answer?`,
    correct: "To affirm, right from the very first words, that there is One God who is the Creator of everything",
    wrong: [
      "To list the names of several different gods worshipped in Sikhism",
      "To describe the cycles of time that Buddhist teaching discusses",
      "To explain the law of karma rather than any concept of a Creator",
    ],
    explanation: "'Ik Onkar' opens the Mool Mantar precisely to state the core Sikh belief that there is One God, who the following words go on to describe as the Creator (Karta Purakh).",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders why Buddhist teaching does not describe a single day or moment when the world was first created. What is the best explanation?`,
    correct: "Buddhist teaching centres less on a single moment of creation and more on endless cycles of arising and dissolving, shaped by the law of karma",
    wrong: [
      "Buddhist teaching simply forgot to include any ideas about existence",
      "Buddhist teaching agrees completely with the Sikh idea of one Creator God",
      "Buddhist teaching says the universe has always looked exactly as it does now, unchanged",
    ],
    explanation: "Instead of one creation moment, Buddhist teaching describes kalpas — vast cycles of arising and dissolving — governed by cause and effect (karma), not a single Creator's act.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} hears the term 'Waheguru' in a Sikh discourse and the term 'kalpa' in a Buddhist discourse on the same day, but mixes up which faith each term belongs to. Which pairing is correct?`,
      correct: "Waheguru is the Sikh name for God the Creator, while kalpa is the Buddhist term for a vast cycle of time",
      wrong: [
        "Waheguru is the Buddhist term for a cycle of time, while kalpa is the Sikh name for God",
        "Both terms refer to exactly the same idea in both faiths",
        "Waheguru and kalpa are both Buddhist terms with no Sikh equivalent",
      ],
      explanation: "Waheguru names God as Creator in Sikh teaching; kalpa names an immense cycle of arising and dissolving in Buddhist teaching — the two terms belong to different faiths and describe different ideas.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} learns that Guru Nanak taught the one Creator pervades all of creation — nature, humans, and every living thing. What does this best suggest about how a Sikh should treat the natural world?`,
    correct: "With respect and care, since God's presence is understood to be reflected throughout all of creation",
    wrong: [
      "With indifference, since only human beings reflect God's presence",
      "With fear, since nature is described as separate from and opposed to God",
      "With no particular attitude, since this teaching has nothing to do with daily behaviour",
    ],
    explanation: "If the one Creator pervades all of creation, as Guru Nanak taught, this naturally supports treating nature and all living things with respect, since they are understood to reflect God's presence.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that because Buddhist teaching links existence to karma rather than to a Creator, Buddhism must teach that the universe has no order at all. Evaluate this claim.`,
    correct: "Flawed — dependent origination and karma describe an orderly law of cause and effect, just not a single Creator's act",
    wrong: [
      "Sound — karma means there is no order or pattern to how things happen",
      "Sound — Buddhist teaching agrees there is no cause behind anything that happens",
      "Flawed — but only because Buddhism actually does name a single Creator God",
    ],
    explanation: "Karma and dependent origination describe a consistent law of cause and effect governing existence — the absence of a single Creator does not mean the absence of order.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says it is contradictory for Sikh teaching to call God 'Nirankar' (formless) while also calling God 'Karta Purakh' (the Creator). Is this a fair criticism?`,
    correct: "No — Sikh teaching holds that God can be without physical form and still be the active Creator of the universe",
    wrong: [
      "Yes — a formless being cannot be described as a Creator in any teaching",
      "Yes — this shows the Mool Mantar contains a mistake",
      "No — but only because Nirankar and Karta Purakh actually mean the same single word",
    ],
    explanation: "Being formless (Nirankar) and being the Creator (Karta Purakh) are not contradictory in Sikh teaching — God's creative power does not depend on having a physical form.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is disappointed after an exam result and is told to remember God's Hukam (Divine Order). What does applying this Sikh teaching best mean here?`,
      correct: "Accepting the outcome with patience while continuing to act responsibly, trusting it fits within a larger Divine Order",
      wrong: [
        "Refusing to study further, since every outcome is already fixed regardless of effort",
        "Blaming the exam entirely on other people rather than reflecting at all",
        "Ignoring the result completely, since Hukam means personal effort makes no difference at all",
      ],
      explanation: "Hukam teaches trust in God's Divine Order alongside continued responsible effort — it is not a reason to stop trying, but a way to face outcomes with patience.",
    };
  },
  (rng) => ({
    prompt: `During a multi-faith class discussion in ${place(rng)}, ${name(rng)} hears a Sikh classmate and a Buddhist classmate describe creation very differently and starts to argue that one of them must be lying. What is the better response, based on this lesson?`,
    correct: "Recognise that Sikh and Buddhist teachings genuinely differ on the concept of creation, and listen to both with respect",
    wrong: [
      "Insist that only one faith's classmate could possibly be telling the truth",
      "Assume both classmates are equally confused about their own faith's teaching",
      "Refuse to discuss the topic further, since differing beliefs cannot be respected",
    ],
    explanation: "This lesson's own aim is appreciating different concepts of creation for social awareness — Sikh and Buddhist teachings genuinely differ, and both can be understood and respected without either classmate being wrong about their own faith.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims that dependent origination in Buddhist teaching means the universe simply appeared with no explanation at all. Is this an accurate understanding?`,
    correct: "No — dependent origination specifically explains that all things arise depending on causes and conditions, which is itself an explanation",
    wrong: [
      "Yes — dependent origination is a way of saying nothing can be explained",
      "Yes — dependent origination is another Buddhist name for a single Creator God",
      "No — but only because dependent origination applies solely to Sikh teaching",
    ],
    explanation: "Dependent origination is precisely an explanation — it states that everything arises dependent on prior causes and conditions, rather than leaving existence unexplained.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why learning both the Sikh and Buddhist concepts of creation matters, based on this lesson's key inquiry questions. What is the best answer?`,
    correct: "It helps a learner appreciate different concepts of creation and understand how each helps people relate to Paramatma or ultimate reality",
    wrong: [
      "It matters only for learners who personally practise both faiths",
      "It has no real purpose beyond memorising unrelated facts",
      "It matters only because one of the two concepts will later be proven false",
    ],
    explanation: "The lesson's key inquiry questions ask why creation concepts matter and how they help one appreciate Paramatma — understanding both faiths' concepts builds exactly that appreciation and social awareness.",
  }),
];

export const creationBuddhSikh: Skill = {
  id: "g6-hre-cn-creation-buddh-sikh",
  code: "CN.1",
  subjectId: "hre",
  strandId: "g6-hre-cn",
  grade: 6,
  title: "Creation in Buddh and Sikh Faiths",
  description: "The concept of creation in Sikh teaching (Ik Onkar, Karta Purakh, Waheguru, Hukam) and Buddhist teaching (kalpas, karma, dependent origination) — how each faith describes the origin and ongoing existence of the universe.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, MOOL_MANTAR);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the first word of the Mool Mantar to the last.",
        items,
        correctOrder: MOOL_MANTAR.map((m) => m.id),
        hint: "The Mool Mantar opens with 'Ik Onkar' and ends with 'Gur Prasad'.",
        explanation: MOOL_MANTAR.map((m) => m.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const sikh = shuffle(rng, CREATION_FACTS.filter((f) => f.faith === "sikh")).slice(0, 4);
      const buddhist = shuffle(rng, CREATION_FACTS.filter((f) => f.faith === "buddhist")).slice(0, 4);
      const chosen = shuffle(rng, [...sikh, ...buddhist]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.faith));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "sikh", label: "Sikh teaching" },
          { id: "buddhist", label: "Buddhist teaching" },
        ],
        correctBucket,
        hint: "Sikh teaching centres on one Creator God; Buddhist teaching centres on cycles of time and karma.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.faith === "sikh" ? "Sikh teaching" : "Buddhist teaching"}.`).join(" "),
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
        hint: "Think about whether each term belongs to Sikh or Buddhist teaching about creation.",
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
        hint: "Think about how the Sikh and Buddhist concepts of creation actually differ.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Mool Mantar begins with the words 'Ik", after: "', meaning 'There is One God.'", answer: "Onkar", accepted: ["onkar"] },
      { before: "The Mool Mantar names God 'Karta Purakh', meaning the", after: ".", answer: "Creator", accepted: ["creator"] },
      { before: "Guru Nanak taught that the one Creator,", after: ", pervades all of creation.", answer: "Waheguru", accepted: ["waheguru"] },
      { before: "Sikh teaching holds the universe unfolds according to God's", after: ", or Divine Order.", answer: "Hukam", accepted: ["hukam"] },
      { before: "Sikh teaching describes God as", after: ", meaning formless, yet still the Creator.", answer: "Nirankar", accepted: ["nirankar"] },
      { before: "Buddhist teaching describes the universe going through endless cycles called", after: ".", answer: "kalpas", accepted: ["kalpas", "kalpa"] },
      { before: "Buddhism does not centre its teaching on a single", after: "who made the universe once and for all.", answer: "Creator God", accepted: ["creator god", "creator"] },
      { before: "Buddhist teaching links existence to", after: ", the law of cause and effect.", answer: "karma", accepted: ["karma"] },
      { before: "The Buddhist idea that all things arise depending on causes and conditions is called dependent", after: ".", answer: "origination", accepted: ["origination"] },
      { before: "Buddhist teaching focuses on ending suffering by following the Noble", after: "Path.", answer: "Eightfold", accepted: ["eightfold"] },
      { before: "The Mool Mantar is found at the very opening of the Guru Granth", after: "ji.", answer: "Sahib", accepted: ["sahib"] },
      { before: "Unlike Sikh teaching's single Creator, Buddhist teaching centres on cause and effect rather than an act of", after: ".", answer: "creation", accepted: ["creation"] },
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
      hint: "Recall whether the fact is about Sikh teaching (one Creator) or Buddhist teaching (cycles and karma).",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
