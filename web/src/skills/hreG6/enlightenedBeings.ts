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
    "these events from the life of Raja Ram Mohan Rai in the order they happened.",
    "these moments from Raja Ram Mohan Rai's life into the order they occurred.",
    "these events from Raja Ram Mohan Rai's life from first to last.",
    "these events as they happened in Raja Ram Mohan Rai's life.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by which Enlightened Being it describes.",
    "these facts under the correct Enlightened Being.",
    "each fact below by whose contribution it describes.",
    "each fact into the bucket for the Enlightened Being it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each term below with what it means.",
    "each term to the explanation that fits it.",
    "each term to the Enlightened Being or idea it relates to.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the Enlightened Beings.",
    "the correct missing word.",
  ],
);

// Raja Ram Mohan Rai's documented biography, in its real historical order — genuine sequential content,
// not invented, matching the precedent of ordering a real narrative (e.g. Ibrahim's story in IRE G6).
const RAM_MOHAN_RAI_SEQUENCE = [
  { id: "r1", label: "Raja Ram Mohan Rai is born in Bengal in 1772 and studies Persian, Arabic, Sanskrit, and later English" },
  { id: "r2", label: "He translates the Vedas and Upanishads to make their teachings more widely accessible" },
  { id: "r3", label: "He founds the Brahmo Sabha (later Brahmo Samaj) in 1828, a reform movement within Sanatan/Vedic tradition" },
  { id: "r4", label: "His campaign against Sati (widow immolation) contributes to it being formally banned in 1829" },
  { id: "r5", label: "He travels to England, among the first Indians to do so, to represent Indian interests" },
  { id: "r6", label: "He dies in Bristol, England, in 1833" },
];

interface BeingFact { text: string; being: "rammohan" | "atmaram" | "sariputta" | "hargobind" }
const BEING_LABEL: Record<BeingFact["being"], string> = {
  rammohan: "Raja Ram Mohan Rai (Sanatan/Vedic)",
  atmaram: "Atma Ram Ji (Jain)",
  sariputta: "Sariputta (Buddhist)",
  hargobind: "Sri Guru Hargobind Sahib ji (Sikh)",
};
const BEING_FACTS: BeingFact[] = [
  { text: "Founded the Brahmo Sabha, later called the Brahmo Samaj, in 1828 as a movement of reform within Sanatan/Vedic tradition", being: "rammohan" },
  { text: "Campaigned against the practice of Sati, contributing to it being formally banned in 1829", being: "rammohan" },
  { text: "Translated the Vedas and Upanishads to make their teachings more widely accessible", being: "rammohan" },
  { text: "A Jain monk and reformer, popularly honoured as Atmaramji Maharaj", being: "atmaram" },
  { text: "Sent a written essay on Jain philosophy and ethics to the 1893 World's Parliament of Religions in Chicago, since Jain monastic vows forbid crossing the sea", being: "atmaram" },
  { text: "Worked to revive scholarship and interfaith understanding of Jain teachings in the 1800s", being: "atmaram" },
  { text: "Was the chief disciple of Gautama Buddha, renowned for wisdom and clear teaching", being: "sariputta" },
  { text: "Was given the honorific title 'General of the Dharma' because of his skill in teaching the Buddha's message", being: "sariputta" },
  { text: "Helped systematise detailed Buddhist teachings that were later gathered into the Abhidhamma", being: "sariputta" },
  { text: "Introduced the concept of Miri-Piri, wearing two swords to symbolise combined spiritual and temporal authority", being: "hargobind" },
  { text: "Built the Akal Takht in Amritsar as a seat of temporal Sikh authority facing the Golden Temple", being: "hargobind" },
  { text: "Organised the defence of the Sikh community, including time imprisoned before being released with 52 princes", being: "hargobind" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Raja Ram Mohan Rai", meaning: "Sanatan/Vedic reformer who founded the Brahmo Samaj and campaigned against Sati" },
  { term: "Atma Ram Ji", meaning: "Jain monk and reformer, popularly honoured as Atmaramji Maharaj" },
  { term: "Sariputta", meaning: "The Buddha's chief disciple, renowned for wisdom and called 'General of the Dharma'" },
  { term: "Sri Guru Hargobind Sahib ji", meaning: "The Sikh Guru who introduced Miri-Piri and built the Akal Takht" },
  { term: "Brahmo Samaj", meaning: "The reform movement Raja Ram Mohan Rai founded within Sanatan/Vedic tradition" },
  { term: "Sati", meaning: "The practice Raja Ram Mohan Rai campaigned against, formally banned in 1829" },
  { term: "1893 Parliament of Religions", meaning: "The Chicago gathering where Atma Ram Ji's Jain philosophy essay was presented on his behalf" },
  { term: "Miri-Piri", meaning: "The concept of combined spiritual and temporal authority introduced by Guru Hargobind Sahib ji" },
  { term: "Akal Takht", meaning: "The seat of temporal Sikh authority built by Guru Hargobind Sahib ji in Amritsar" },
  { term: "General of the Dharma", meaning: "The honorific title given to Sariputta for his skill in teaching the Buddha's message" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees an unfair tradition being followed in the community just because "it has always been done that way." Applying Raja Ram Mohan Rai's example, what is the best response?`,
    correct: "Question the tradition and work, as he did against Sati, to reform practices that cause harm",
    wrong: [
      "Accept the tradition without question, since old practices should never be examined",
      "Ignore the issue entirely, since reform is only the responsibility of religious leaders",
      "Wait for the tradition to end on its own without taking any action",
    ],
    explanation: "Raja Ram Mohan Rai's campaign against Sati shows that questioning a harmful tradition and working for reform, even when it is long-standing, is a legitimate and valuable response.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to represent their community's beliefs at a conference abroad but faces a personal restriction that prevents travelling there. Which Enlightened Being's example is most relevant here?`,
    correct: "Atma Ram Ji, whose Jain philosophy essay was presented in Chicago on his behalf since his monastic vows forbade sea travel",
    wrong: [
      "Sariputta, who is remembered for his skill in teaching rather than for any travel restriction",
      "Raja Ram Mohan Rai, who personally travelled to England without any restriction",
      "Guru Hargobind Sahib ji, whose story does not involve any travel restriction of this kind",
    ],
    explanation: "Atma Ram Ji could not personally attend the 1893 Parliament of Religions in Chicago because Jain monastic vows forbid crossing the sea, so his essay was presented on his behalf instead.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is known among classmates for explaining difficult lessons so clearly that even struggling students understand them. Which Enlightened Being's reputation does this best resemble?`,
    correct: "Sariputta, honoured as 'General of the Dharma' for his skill in teaching the Buddha's message clearly",
    wrong: [
      "Raja Ram Mohan Rai, remembered mainly for reforming a harmful social practice",
      "Guru Hargobind Sahib ji, remembered mainly for combining spiritual and temporal authority",
      "Atma Ram Ji, remembered mainly for reviving interfaith understanding of Jain teachings",
    ],
    explanation: "Sariputta's defining reputation was his skill in clearly teaching the Buddha's message, earning him the title 'General of the Dharma' — a strong match for a gift for explaining things clearly.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} argues that a good leader should only focus on spiritual matters and never get involved in defending their community. Applying Guru Hargobind Sahib ji's example, is this a fair view?`,
      correct: "No — his introduction of Miri-Piri shows that combining spiritual and temporal (worldly/defensive) responsibility can be an appropriate form of leadership",
      wrong: [
        "Yes — Guru Hargobind Sahib ji avoided all worldly responsibilities throughout his life",
        "Yes — Miri-Piri means a leader should abandon spiritual duties entirely",
        "No — but only because he never faced any threat to his community",
      ],
      explanation: "Guru Hargobind Sahib ji's Miri-Piri — symbolised by two swords — combined spiritual authority with temporal responsibility for defending the community, showing both can belong to one leader.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to classify the four Enlightened Beings' contributions for a class project on inspiration. Which pairing is correct?`,
    correct: "Raja Ram Mohan Rai — social reform; Sariputta — clear teaching; Atma Ram Ji — interfaith scholarship; Guru Hargobind Sahib ji — combined spiritual/temporal leadership",
    wrong: [
      "Raja Ram Mohan Rai — clear teaching; Sariputta — social reform; Atma Ram Ji — combined leadership; Guru Hargobind Sahib ji — interfaith scholarship",
      "All four Enlightened Beings are remembered for exactly the same single contribution",
      "Atma Ram Ji — social reform; Guru Hargobind Sahib ji — clear teaching; the other two have no distinct contribution",
    ],
    explanation: "Each Enlightened Being is remembered for a distinct contribution: Raja Ram Mohan Rai for social reform, Sariputta for clear teaching, Atma Ram Ji for interfaith scholarship, and Guru Hargobind Sahib ji for combining spiritual and temporal leadership.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that since Sariputta lived many centuries before the other three Enlightened Beings, his teachings can have no relevance to social welfare today. Evaluate this claim.`,
    correct: "Flawed — the age of a teaching does not determine its relevance; Sariputta's wisdom and clear teaching remain valued examples regardless of era",
    wrong: [
      "Sound — only recent teachings can ever be relevant to social welfare",
      "Sound — Sariputta's teachings were only meant for people living in his own century",
      "Flawed — but only because Sariputta actually lived after the other three Enlightened Beings",
    ],
    explanation: "The relevance of an Enlightened Being's teaching does not depend on when they lived — Sariputta's example of wisdom and clear teaching remains valuable long after his own era, just as the other three do.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is elected class representative and wonders whether to focus only on organising events or also to speak up when classmates are treated unfairly. Applying Raja Ram Mohan Rai's example, what is the better approach?`,
      correct: "Speak up against unfair treatment as well, following his example of reforming a harmful practice through direct action",
      wrong: [
        "Focus only on organising events, since speaking up about unfairness is never a representative's role",
        "Avoid taking any position on fairness, since neutrality was Raja Ram Mohan Rai's defining trait",
        "Wait until graduating before addressing any unfair treatment",
      ],
      explanation: "Raja Ram Mohan Rai's legacy is defined by actively working to reform an unfair, harmful practice (Sati) rather than staying neutral — a model for using a position of responsibility to address unfairness.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is told that Guru Hargobind Sahib ji built the Akal Takht. What was its purpose?`,
    correct: "It served as a seat of temporal (worldly) Sikh authority, facing the Golden Temple",
    wrong: [
      "It served purely as a place to translate the Vedas and Upanishads",
      "It served as the location where the 1893 Parliament of Religions was held",
      "It served purely as a training ground with no religious or leadership significance",
    ],
    explanation: "The Akal Takht was built by Guru Hargobind Sahib ji specifically as a seat of temporal Sikh authority, standing alongside the Golden Temple's spiritual authority — reflecting his Miri-Piri concept.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that Atma Ram Ji's work only mattered within the Jain community and had no wider effect. Is this an accurate summary?`,
    correct: "No — his essay reaching the 1893 World's Parliament of Religions in Chicago helped build wider interfaith understanding of Jain teachings beyond the Jain community itself",
    wrong: [
      "Yes — his essay was never read by anyone outside his own monastery",
      "Yes — the Parliament of Religions only included Jain participants",
      "No — but only because Atma Ram Ji personally travelled to Chicago to present it",
    ],
    explanation: "Atma Ram Ji's essay being presented at the 1893 World's Parliament of Religions in Chicago extended Jain teachings to a much wider, interfaith international audience, not just the Jain community.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked how the teaching of these four Enlightened Beings contributes to social welfare, per this lesson's key inquiry question. What is the best answer?`,
    correct: "Each modelled a different way of serving others — through reform, teaching, scholarship, or protective leadership — inspiring similar service today",
    wrong: [
      "None of the four Enlightened Beings' teachings relate to social welfare in any way",
      "Only Raja Ram Mohan Rai's work relates to social welfare; the other three focused purely on private worship",
      "Social welfare requires copying exactly one single Enlightened Being's actions rather than drawing lessons from all four",
    ],
    explanation: "This lesson's key inquiry question is answered by seeing that each Enlightened Being modelled a distinct form of service to others — reform, teaching, scholarship, and protective leadership — all contributing to social welfare.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says learning about Enlightened Beings from different faiths is pointless because a Grade 6 learner will only ever practise one faith. Is this a fair conclusion?`,
      correct: "No — appreciating the teachings of Enlightened Beings across faiths builds inspiration and social harmony regardless of which faith a learner practises",
      wrong: [
        "Yes — a learner should only ever study Enlightened Beings from their own faith",
        "Yes — teachings from other faiths cannot inspire anyone outside that faith",
        "No — but only because all four Enlightened Beings actually belonged to the same faith",
      ],
      explanation: "This sub-strand's own aim is appreciating the teachings of the Enlightened Beings to enhance social harmony — a purpose served by learning across faiths, not only within one's own.",
    };
  },
];

export const enlightenedBeings: Skill = {
  id: "g6-hre-pa-enlightened-beings",
  code: "PA.1",
  subjectId: "hre",
  strandId: "g6-hre-pa",
  grade: 6,
  title: "Enlightened Beings and Social Welfare",
  description: "Four Enlightened Beings, one from each faith — Raja Ram Mohan Rai (Sanatan/Vedic), Atma Ram Ji (Jain), Sariputta (Buddhist), and Sri Guru Hargobind Sahib ji (Sikh) — and their contributions to social welfare.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, RAM_MOHAN_RAI_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from his early life to his death.",
        items,
        correctOrder: RAM_MOHAN_RAI_SEQUENCE.map((r) => r.id),
        hint: "His life runs from his birth and studies, through founding the Brahmo Sabha and the ban on Sati, to his journey to England and death there.",
        explanation: RAM_MOHAN_RAI_SEQUENCE.map((r) => r.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const beings: BeingFact["being"][] = ["rammohan", "atmaram", "sariputta", "hargobind"];
      const chosen = shuffle(rng, beings.flatMap((b) => shuffle(rng, BEING_FACTS.filter((f) => f.being === b)).slice(0, 2)));
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.being));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: beings.map((b) => ({ id: b, label: BEING_LABEL[b] })),
        correctBucket,
        hint: "Think about which Enlightened Being's life or teaching each fact describes.",
        explanation: chosen.map((f) => `"${f.text}" — ${BEING_LABEL[f.being]}.`).join(" "),
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
        hint: "Think about which Enlightened Being each term is connected to.",
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
        hint: "Think about which Enlightened Being's contribution — reform, teaching, scholarship, or leadership — best fits the situation.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Raja Ram Mohan Rai founded the Brahmo Sabha, later called the Brahmo", after: ", in 1828.", answer: "Samaj", accepted: ["samaj"] },
      { before: "Raja Ram Mohan Rai's campaign contributed to the practice of", after: "being formally banned in 1829.", answer: "Sati", accepted: ["sati"] },
      { before: "Atma Ram Ji is popularly honoured as", after: "Maharaj.", answer: "Atmaramji", accepted: ["atmaramji", "atmaram ji"] },
      { before: "Jain monastic vows forbid crossing the", after: ", so Atma Ram Ji's essay was presented on his behalf in Chicago.", answer: "sea", accepted: ["sea"] },
      { before: "Sariputta was the chief disciple of", after: ", renowned for wisdom.", answer: "Gautama Buddha", accepted: ["gautama buddha", "the buddha", "buddha"] },
      { before: "Sariputta was given the honorific title 'General of the", after: "'.", answer: "Dharma", accepted: ["dharma"] },
      { before: "Guru Hargobind Sahib ji introduced the concept of", after: ", wearing two swords.", answer: "Miri-Piri", accepted: ["miri-piri", "miri piri"] },
      { before: "Guru Hargobind Sahib ji built the", after: "in Amritsar as a seat of temporal Sikh authority.", answer: "Akal Takht", accepted: ["akal takht"] },
      { before: "Raja Ram Mohan Rai died in Bristol,", after: ", in 1833.", answer: "England", accepted: ["england"] },
      { before: "Sariputta helped systematise teachings later gathered into the", after: ".", answer: "Abhidhamma", accepted: ["abhidhamma"] },
      { before: "Atma Ram Ji's essay was presented at the 1893 World's Parliament of Religions in", after: ".", answer: "Chicago", accepted: ["chicago"] },
      { before: "Guru Hargobind Sahib ji was released from imprisonment along with 52", after: ".", answer: "princes", accepted: ["princes"] },
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
      hint: "Recall which of the four Enlightened Beings this fact is about.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
