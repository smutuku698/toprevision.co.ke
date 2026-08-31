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
    "these phases of the moon in the order they occur, starting from Amavasya (No Moon Day).",
    "these moon phases into the order they occur in one lunar cycle.",
    "these phases of the moon from Amavasya to the next Amavasya.",
    "these moon phases into their correct order in the lunar cycle.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each fact by whether it is about a festival from another faith or an Indian traditional calendar day.",
    "these facts under the correct heading.",
    "each fact below by whether it describes Christmas/Eid-ul-Fitr or Sankranti/Amavasya/Purnima.",
    "each fact into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term to its meaning.",
    "each term below with what it means.",
    "each term to the explanation that fits it.",
    "each term to the festival or calendar day it relates to.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Utsav (Festivals).",
    "the correct missing word.",
  ],
);

// The standard 8 phases of one real lunar cycle, in their correct astronomical order, starting from
// Amavasya (No Moon Day) — genuine content directly tied to this sub-strand's own "use search engines to
// understand different phases of the moon" learning experience, not an invented sequence.
const MOON_PHASES = [
  { id: "m1", label: "New Moon (Amavasya) — the moon is not visible from Earth" },
  { id: "m2", label: "Waxing Crescent — a thin sliver of the moon becomes visible and grows" },
  { id: "m3", label: "First Quarter — half of the moon's face is illuminated and growing" },
  { id: "m4", label: "Waxing Gibbous — more than half is illuminated and still growing" },
  { id: "m5", label: "Full Moon (Purnima) — the entire face of the moon is illuminated" },
  { id: "m6", label: "Waning Gibbous — more than half is illuminated and shrinking" },
  { id: "m7", label: "Last Quarter — half of the moon's face is illuminated and shrinking" },
  { id: "m8", label: "Waning Crescent — a thin sliver remains before the cycle returns to New Moon" },
];

interface UtsavFact { text: string; group: "other-faiths" | "calendar" }
const UTSAV_FACTS: UtsavFact[] = [
  { text: "Christmas is a Christian festival celebrating the birth of Jesus Christ, observed on 25th December", group: "other-faiths" },
  { text: "Christmas is often marked with singing carols and acts of charity", group: "other-faiths" },
  { text: "Eid-ul-Fitr is an Islamic festival marking the end of the fasting month of Ramadan", group: "other-faiths" },
  { text: "Eid-ul-Fitr is celebrated with special prayers, feasting, and charity", group: "other-faiths" },
  { text: "Sankranti marks the sun's transition into a new zodiac sign and is associated with the harvest season", group: "calendar" },
  { text: "Makar Sankranti, one form of Sankranti, is widely celebrated around mid-January", group: "calendar" },
  { text: "Amavasya is the No Moon Day in the Indian traditional calendar, when the moon is not visible from Earth", group: "calendar" },
  { text: "Amavasya is considered a time for reflection and certain religious observances", group: "calendar" },
  { text: "Purnima is the Full Moon Day in the Indian traditional calendar, considered auspicious for worship and celebration", group: "calendar" },
  { text: "Many festivals connected to significant spiritual events are timed to fall on Purnima", group: "calendar" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Christmas", meaning: "The Christian festival celebrating the birth of Jesus Christ" },
  { term: "Eid-ul-Fitr", meaning: "The Islamic festival marking the end of the fasting month of Ramadan" },
  { term: "Sankranti", meaning: "The Indian calendar day marking the sun's transition into a new zodiac sign" },
  { term: "Amavasya", meaning: "The No Moon Day in the Indian traditional calendar" },
  { term: "Purnima", meaning: "The Full Moon Day in the Indian traditional calendar" },
  { term: "Ramadan", meaning: "The Islamic fasting month that precedes Eid-ul-Fitr" },
  { term: "Carols", meaning: "Songs traditionally sung during the Christmas festival" },
  { term: "Zodiac", meaning: "The astrological sign system relevant to the meaning of Sankranti" },
  { term: "Lunar calendar", meaning: "A calendar based on the phases of the moon, relevant to Amavasya and Purnima" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is invited by a Muslim neighbour to join a celebration marking the end of Ramadan's fasting month. Which festival is being celebrated?`,
    correct: "Eid-ul-Fitr",
    wrong: ["Christmas", "Sankranti", "Amavasya"],
    explanation: "Eid-ul-Fitr specifically marks the end of the fasting month of Ramadan, unlike Christmas, Sankranti, or Amavasya.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why festivals falling on Purnima and Amavasya are considered more auspicious, per this lesson's key inquiry question. What is the best answer?`,
    correct: "These days hold special spiritual significance tied to the moon's phase in the Indian traditional calendar, making them favoured times for worship and celebration",
    wrong: [
      "These days are chosen at random, with no connection to the Indian traditional calendar",
      "These days are considered auspicious only outside of any Indian traditional calendar",
      "These days hold no more significance than any other day of the month",
    ],
    explanation: "Purnima (Full Moon) and Amavasya (No Moon) hold distinct spiritual significance in the Indian traditional calendar, which is why festivals timed to these days are considered especially auspicious.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees carol singing and acts of charity taking place in December. Which festival does this most likely describe?`,
    correct: "Christmas",
    wrong: ["Eid-ul-Fitr", "Sankranti", "Purnima"],
    explanation: "Carol singing and charitable acts in December are characteristic of Christmas, the Christian festival celebrating the birth of Jesus Christ.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants to know which day of the lunar cycle comes right after Amavasya (No Moon Day). Which phase is it?`,
      correct: "Waxing Crescent",
      wrong: ["Full Moon (Purnima)", "Last Quarter", "Waning Gibbous"],
      explanation: "In the lunar cycle, the Waxing Crescent phase directly follows the New Moon (Amavasya), as the moon's visible sliver begins to grow.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} confuses Sankranti with Amavasya, thinking both describe the same event. Is this accurate?`,
    correct: "No — Sankranti marks the sun's transition into a new zodiac sign, while Amavasya is the No Moon Day, a different kind of calendar marker",
    wrong: [
      "Yes — both terms describe the exact same astronomical event",
      "Yes — Sankranti is simply another name for the No Moon Day",
      "No — but only because Amavasya has nothing to do with the moon at all",
    ],
    explanation: "Sankranti (the sun's transition into a new zodiac sign) and Amavasya (No Moon Day) are two distinct markers in the Indian traditional calendar, not the same event.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that since Christmas and Eid-ul-Fitr belong to different faiths from Sanatan/Vedic, Jain, Buddhist, and Sikh traditions, learning about them has no value in this lesson. Evaluate this claim.`,
    correct: "Flawed — this lesson specifically teaches about festivals from other faiths to build social cohesion and appreciation of diversity",
    wrong: [
      "Sound — festivals from other faiths should never be studied in a religious education lesson",
      "Sound — social cohesion has no connection to learning about other faiths' festivals",
      "Flawed — but only because Christmas and Eid-ul-Fitr are not actually festivals from other faiths",
    ],
    explanation: "This sub-strand's own purpose is participating in and appreciating festivals for social cohesion and harmony — including festivals from faiths beyond the four the strand otherwise focuses on.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked how festivals enhance social harmony, per this lesson's key inquiry question. What is the best answer?`,
      correct: "Shared celebration, charity, and participation bring different communities together",
      wrong: [
        "Festivals only ever divide communities from one another",
        "Festivals have no connection to social harmony of any kind",
        "Only festivals from a person's own faith can ever enhance harmony",
      ],
      explanation: "This lesson connects festival participation — such as charity, shared meals, and communal celebration — directly to enhancing social cohesion and harmony.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims the Full Moon (Purnima) and New Moon (Amavasya) are simply two names for the same lunar phase. Is this accurate?`,
    correct: "No — Purnima is when the moon's entire face is illuminated, while Amavasya is when the moon is not visible at all, opposite phases of the lunar cycle",
    wrong: [
      "Yes — both terms describe an identical lunar phase",
      "Yes — Purnima refers to when the moon disappears completely",
      "No — but only because Amavasya actually refers to a fully illuminated moon",
    ],
    explanation: "Purnima (Full Moon) and Amavasya (No Moon) are opposite phases within the same lunar cycle — full illumination versus no visible moon — not the same phase described differently.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why we celebrate festivals at all, per this lesson's key inquiry question. What is the best answer?`,
    correct: "Festivals mark significant spiritual or seasonal events and nurture values of unity, charity, and shared identity",
    wrong: [
      "Festivals exist purely for entertainment, with no deeper significance",
      "Festivals are celebrated only to mark the end of a school term",
      "Festivals have no connection to spiritual growth or social harmony",
    ],
    explanation: "This lesson's own aim links festivals — whether Christmas, Eid-ul-Fitr, or Indian calendar days — to marking significant events and nurturing values like unity and charity.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know which lunar phase comes right before the Full Moon (Purnima). Which phase is it?`,
    correct: "Waxing Gibbous",
    wrong: ["Waning Gibbous", "Last Quarter", "New Moon (Amavasya)"],
    explanation: "The Waxing Gibbous phase, where more than half the moon is illuminated and still growing, comes directly before the Full Moon (Purnima).",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is comparing Sankranti to a harvest celebration in another culture and wonders if this comparison makes sense. Is it reasonable?`,
    correct: "Yes — Sankranti is itself associated with the harvest season in Indian tradition, making such a comparison reasonable",
    wrong: [
      "No — Sankranti has no connection to the harvest season at all",
      "No — Sankranti is exclusively about the fasting month of Ramadan",
      "Yes — but only because Sankranti and Christmas describe an identical celebration",
    ],
    explanation: "Sankranti is specifically associated with the harvest season in Indian tradition, so comparing it to another culture's harvest celebration is a reasonable and accurate comparison.",
  }),
];

export const utsavsFromOtherFaiths: Skill = {
  id: "g6-hre-ut-utsavs-from-other-faiths",
  code: "UT.1",
  subjectId: "hre",
  strandId: "g6-hre-ut",
  grade: 6,
  title: "Utsavs from Other Faiths",
  description: "Two festivals from other faiths — Christmas and Eid-ul-Fitr — and three Indian traditional calendar days observed across the four faiths — Sankranti, Amavasya (No Moon Day), and Purnima (Full Moon Day) — plus the phases of the moon behind Amavasya and Purnima.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, MOON_PHASES);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, starting from the New Moon (Amavasya).",
        items,
        correctOrder: MOON_PHASES.map((m) => m.id),
        hint: "The lunar cycle runs from New Moon through waxing phases to Full Moon, then through waning phases back to New Moon.",
        explanation: MOON_PHASES.map((m) => m.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const other = shuffle(rng, UTSAV_FACTS.filter((f) => f.group === "other-faiths")).slice(0, 3);
      const calendar = shuffle(rng, UTSAV_FACTS.filter((f) => f.group === "calendar")).slice(0, 4);
      const chosen = shuffle(rng, [...other, ...calendar]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "other-faiths", label: "A festival from another faith" },
          { id: "calendar", label: "An Indian traditional calendar day" },
        ],
        correctBucket,
        hint: "Christmas and Eid-ul-Fitr are festivals from other faiths; Sankranti, Amavasya, and Purnima are Indian traditional calendar days.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "other-faiths" ? "a festival from another faith" : "an Indian traditional calendar day"}.`).join(" "),
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
        hint: "Think about which festival or calendar day each term is connected to.",
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
        hint: "Think about which festival, calendar day, or moon phase the scenario is describing.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Christmas celebrates the birth of Jesus Christ, observed on 25th", after: ".", answer: "December", accepted: ["december"] },
      { before: "Eid-ul-Fitr marks the end of the fasting month of", after: ".", answer: "Ramadan", accepted: ["ramadan"] },
      { before: "Sankranti marks the sun's transition into a new", after: "sign.", answer: "zodiac", accepted: ["zodiac"] },
      { before: "Makar Sankranti is widely celebrated around mid-", after: ".", answer: "January", accepted: ["january"] },
      { before: "Amavasya is the No", after: "Day in the Indian traditional calendar.", answer: "Moon", accepted: ["moon"] },
      { before: "Purnima is the Full", after: "Day in the Indian traditional calendar.", answer: "Moon", accepted: ["moon"] },
      { before: "Amavasya is considered a time for", after: "and certain religious observances.", answer: "reflection", accepted: ["reflection"] },
      { before: "Purnima is considered auspicious for worship and", after: ".", answer: "celebration", accepted: ["celebration"] },
      { before: "Christmas is often marked with singing", after: "and acts of charity.", answer: "carols", accepted: ["carols"] },
      { before: "Eid-ul-Fitr is celebrated with special prayers, feasting, and", after: ".", answer: "charity", accepted: ["charity"] },
      { before: "During the New Moon phase, the moon is not visible from", after: ".", answer: "Earth", accepted: ["earth"] },
      { before: "During the Full Moon phase, the entire face of the moon is", after: ".", answer: "illuminated", accepted: ["illuminated"] },
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
      hint: "Recall the two festivals from other faiths and the three Indian traditional calendar days.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
