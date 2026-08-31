import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The step-by-step sequence of Wudhu (intention -> hands -> mouth -> nose -> face -> arms ->
// head -> feet) is explicit, curriculum-endorsed sequential content, not an invented order.
const ORDER_PROMPTS = [
  "Arrange these steps of Wudhu (ablution) in the correct order.",
  "Put these steps of Wudhu into the order they are performed.",
  "Sequence these steps of Wudhu correctly, from first to last.",
  "Order these steps of Wudhu as they are actually performed.",
  "Sort these steps of Wudhu into the order they occur.",
  "Arrange these steps of Wudhu in the order a Muslim performs them.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which kind of purity it describes: Hadath Asghar, Hadath Akbar, or Tayammum.",
  "Group each statement under Hadath Asghar, Hadath Akbar, or Tayammum.",
  "Decide whether each statement is about Hadath Asghar, Hadath Akbar, or Tayammum, and sort it there.",
  "Sort each fact into the correct category: Hadath Asghar, Hadath Akbar, or Tayammum.",
  "Place each statement under the type of impurity or purification it describes.",
  "Read each statement and sort it under Hadath Asghar, Hadath Akbar, or Tayammum.",
];

const MATCH_PROMPTS = [
  "Match each term about Twahara to its meaning.",
  "Pair each term about Twahara with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term about Twahara to the definition that fits it.",
  "Choose the correct meaning for each term about Twahara.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word or term.",
  "Which word or term completes this sentence?",
  "Complete the sentence with the correct word or term.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const WUDHU_STEPS = [
  { id: "niyyah", label: "Make niyyah (intention) to perform Wudhu" },
  { id: "hands", label: "Wash both hands up to the wrists" },
  { id: "mouth", label: "Rinse the mouth with water" },
  { id: "nose", label: "Sniff water into the nose and blow it out" },
  { id: "face", label: "Wash the face from the hairline to the chin, ear to ear" },
  { id: "arms", label: "Wash the arms up to and including the elbows" },
  { id: "head", label: "Wipe (make masah of) the head with wet hands" },
  { id: "feet", label: "Wash the feet up to and including the ankles" },
];

interface TopicFact {
  text: string;
  topic: "asghar" | "akbar" | "tayammum";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  asghar: "About Hadath Asghar (minor ritual impurity)",
  akbar: "About Hadath Akbar (major ritual impurity)",
  tayammum: "About Tayammum (dry ablution)",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Hadath Asghar is a minor state of ritual impurity", topic: "asghar" },
  { text: "Using the toilet is one everyday cause of Hadath Asghar", topic: "asghar" },
  { text: "Passing gas is one everyday cause of Hadath Asghar", topic: "asghar" },
  { text: "Falling into a deep sleep can cause Hadath Asghar", topic: "asghar" },
  { text: "Hadath Akbar is a more significant state of ritual impurity than Hadath Asghar", topic: "akbar" },
  { text: "Hadath Akbar is removed by Ghusl (a full-body ritual wash), not by Wudhu alone", topic: "akbar" },
  { text: "Removing Hadath Akbar requires washing water over the entire body", topic: "akbar" },
  { text: "Ghusl can also be performed as an extra, non-obligatory (sunnah) act, such as before Friday prayers or Eid", topic: "akbar" },
  { text: "Tayammum is performed using clean earth, sand, or dust instead of water", topic: "tayammum" },
  { text: "Tayammum is allowed when clean water is unavailable", topic: "tayammum" },
  { text: "Tayammum is also allowed when using water would cause harm, such as during illness", topic: "tayammum" },
  { text: "Tayammum involves patting the hands on a clean surface, then wiping the face and hands", topic: "tayammum" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Twahara", meaning: "Ritual purity — the required condition before acts of worship like prayer (swalah)" },
  { term: "Hadath Asghar", meaning: "Minor ritual impurity caused by everyday things like using the toilet or passing gas, removed by Wudhu" },
  { term: "Hadath Akbar", meaning: "A more significant state of ritual impurity that requires Ghusl rather than Wudhu alone" },
  { term: "Wudhu", meaning: "The step-by-step ablution — washing the hands, mouth, nose, face, arms, head, and feet — that removes Hadath Asghar" },
  { term: "Ghusl", meaning: "A full-body ritual wash that removes Hadath Akbar, or is performed as an extra sunnah act on special occasions" },
  { term: "Tayammum", meaning: "Dry ablution using clean earth, sand, or dust, performed when water is unavailable or would cause harm" },
  { term: "Niyyah", meaning: "The intention made at the very start of Wudhu, before any washing begins" },
  { term: "Sunnah Ghusl", meaning: "An extra, non-obligatory ritual bath performed on occasions like before Friday prayers or before Eid" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a Grade 6 learner in ${place(rng)}, uses the toilet just before it is time for swalah (prayer). What must ${who} do before praying?`,
      correct: "Perform Wudhu, since using the toilet causes Hadath Asghar (minor ritual impurity)",
      wrong: [
        "Perform Ghusl, since using the toilet always causes Hadath Akbar",
        "Nothing extra is needed, since Twahara only matters before Friday prayers",
        "Perform Tayammum, since dry ablution is the normal method any time before prayer",
      ],
      explanation: "Using the toilet causes Hadath Asghar, the minor ritual impurity — this is removed with Wudhu, not Ghusl or Tayammum, which are for other situations.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} falls into a deep sleep during the school lunch break in ${place(rng)}, then wakes up close to prayer time. What should ${who} do first before praying?`,
      correct: "Perform Wudhu again, since falling into a deep sleep can cause Hadath Asghar",
      wrong: [
        "Pray immediately without Wudhu, since only night-time sleep affects purity",
        "Perform Ghusl, since any sleep automatically causes Hadath Akbar",
        "Do nothing, since Wudhu performed earlier that morning is always enough for the rest of the day",
      ],
      explanation: "Falling into a deep sleep is one of the everyday causes of Hadath Asghar, so Wudhu must be repeated before the next prayer, regardless of what time of day it happens.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is herding cattle far from any river or well in ${place(rng)} during a dry season, and it is time to pray with no clean water nearby. What should ${who} do?`,
      correct: "Perform Tayammum using clean earth, sand, or dust, since clean water is unavailable",
      wrong: [
        "Skip the prayer entirely, since Wudhu is the only valid way to prepare for prayer",
        "Perform Wudhu using any nearby dirty water instead",
        "Wait until returning home hours later, even if it means missing the prayer time",
      ],
      explanation: "Tayammum is the alternative Islam provides exactly for situations like this, when clean water genuinely cannot be found.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} has a doctor's advice to keep a wound dry and avoid water contact while recovering from an injury, and it is time to pray. What is the appropriate action, according to the ruling on Tayammum?`,
      correct: "Perform Tayammum, since using water would cause harm during recovery",
      wrong: [
        "Perform Wudhu regardless, since medical advice does not apply to acts of worship",
        "Delay praying indefinitely until the injury fully heals",
        "Perform Ghusl instead of Wudhu, since any injury requires the greater purification",
      ],
      explanation: "Tayammum is allowed not only when water is unavailable, but also when using water would cause harm, such as during recovery from an injury.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} prepares for Jumuah (Friday prayers) in ${place(rng)} by taking a full bath, even though only Wudhu was strictly required that day. What kind of act is this?`,
      correct: "A sunnah (recommended, non-obligatory) Ghusl performed as an extra act before Friday prayers",
      wrong: [
        "An obligatory Ghusl required of every Muslim every Friday",
        "A wasted effort, since Ghusl only counts when removing Hadath Akbar",
        "A form of Tayammum, since both involve preparing the body before prayer",
      ],
      explanation: "Ghusl can be performed as an extra, non-obligatory (sunnah) act on occasions like before Friday prayers, in addition to whenever it is obligatory.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} claims that since fetching water from the tap outside is tiring, Tayammum can be used instead any day, even though clean water is available close by. Evaluate this reasoning.`,
      correct: "Flawed — Tayammum is only for when water is genuinely unavailable or would cause harm, not simply inconvenient to fetch",
      wrong: [
        "Sound — convenience is a valid enough reason to use Tayammum instead of Wudhu",
        "Sound — Tayammum can always replace Wudhu once a person prefers it",
        "Flawed — Tayammum should never be used even when water is truly unavailable",
      ],
      explanation: "Tayammum applies specifically when water is unavailable or would cause harm — mere inconvenience of fetching water does not meet either condition.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is memorising Wudhu and wonders whether the feet can be washed before the hands are washed at the very start. What is the correct answer?`,
      correct: "No — Wudhu follows a specific order, beginning with the hands and ending with the feet",
      wrong: [
        "Yes — the steps of Wudhu can be performed in any order the person prefers",
        "Yes — but only the order of the last two steps can be swapped",
        "No — but only because starting with the feet is considered impure, not because of order itself",
      ],
      explanation: "Wudhu is performed in a specific sequence — beginning with the intention and hands, and ending with washing the feet — not in any order the person chooses.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} insists that Wudhu alone is always enough to remove any state of ritual impurity, including Hadath Akbar. What is the flaw in this claim?`,
      correct: "Hadath Akbar, the more significant state of impurity, requires Ghusl (a full-body wash), which Wudhu alone cannot fulfil",
      wrong: [
        "There is no flaw — Wudhu is always sufficient for every state of impurity",
        "Ghusl is only needed for Tayammum, never for Hadath Akbar",
        "Hadath Akbar does not require any purification at all before prayer",
      ],
      explanation: "Hadath Akbar is a more significant state of ritual impurity that specifically requires Ghusl — Wudhu alone is not sufficient to remove it.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} washes their hands with soap before eating lunch at school in ${place(rng)}. Does this count as Wudhu for their next prayer?`,
      correct: "No — ordinary handwashing for hygiene is not the same as Wudhu, which is a specific act performed with intention (niyyah) for worship",
      wrong: [
        "Yes — any handwashing during the day automatically counts as Wudhu",
        "Yes — as long as soap was used, it satisfies the requirement for prayer",
        "No — but only because Wudhu requires washing with cold water specifically",
      ],
      explanation: "Wudhu is a specific act of worship performed with intention and a fixed set of steps — ordinary handwashing for hygiene, without that intention and sequence, does not fulfil it.",
    };
  },
];

export const twahara: Skill = {
  id: "g6-ire-da-twahara",
  code: "DA.1",
  subjectId: "ire",
  strandId: "g6-ire-devotional",
  grade: 6,
  title: "Twahara (Purity)",
  description: "Ritual purity before worship: Hadath Asghar and Hadath Akbar, the steps of Wudhu, Ghusl, and Tayammum as an alternative when water is unavailable or harmful.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, WUDHU_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from intention to washing the feet.",
        items,
        correctOrder: WUDHU_STEPS.map((s) => s.id),
        hint: "Wudhu begins with the intention and hands, and ends with washing the feet.",
        explanation: WUDHU_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const asghar = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "asghar")).slice(0, 3);
      const akbar = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "akbar")).slice(0, 3);
      const tayammum = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "tayammum")).slice(0, 3);
      const chosen = shuffle(rng, [...asghar, ...akbar, ...tayammum]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["asghar", "akbar", "tayammum"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about minor impurity removed by Wudhu, some about major impurity removed by Ghusl, and some about dry ablution.",
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
        hint: "Think about whether each term names a state of impurity or a way of purifying.",
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
        hint: "Think about whether the situation calls for Wudhu, Ghusl, or Tayammum.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Twahara means ritual", after: ", required before acts of worship like prayer.", answer: "purity", accepted: ["purity"] },
      { before: "Hadath", after: "is the minor state of ritual impurity removed by Wudhu.", answer: "Asghar", accepted: ["asghar"] },
      { before: "Hadath", after: "is the more significant state of ritual impurity removed by Ghusl.", answer: "Akbar", accepted: ["akbar"] },
      { before: "", after: "requires a full-body ritual wash to remove Hadath Akbar.", answer: "Ghusl", accepted: ["ghusl"] },
      { before: "", after: "is dry ablution, performed using clean earth, sand, or dust.", answer: "Tayammum", accepted: ["tayammum"] },
      { before: "The first step of Wudhu is making", after: "(intention).", answer: "niyyah", accepted: ["niyyah", "niyya"] },
      { before: "During Wudhu, the arms are washed up to and including the", after: ".", answer: "elbows", accepted: ["elbows"] },
      { before: "During Wudhu, the head is wiped, an act known as", after: ".", answer: "masah", accepted: ["masah"] },
      { before: "During Wudhu, the feet are washed up to and including the", after: ".", answer: "ankles", accepted: ["ankles"] },
      { before: "Tayammum is allowed when clean water is unavailable, or when using water would", after: ".", answer: "cause harm", accepted: ["cause harm", "harm"] },
      { before: "Ghusl can be performed as an extra, non-obligatory act known as", after: "Ghusl, such as before Friday prayers.", answer: "sunnah", accepted: ["sunnah"] },
      { before: "Using the toilet and passing gas are everyday causes of Hadath", after: ".", answer: "Asghar", accepted: ["asghar"] },
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
      hint: "Recall the steps of Wudhu and the difference between Hadath Asghar, Hadath Akbar, and Tayammum.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`.trim(),
    };
  },
};
