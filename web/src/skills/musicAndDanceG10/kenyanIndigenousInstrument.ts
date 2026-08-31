import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, cap, type ScenarioMC } from "./sharedG10";

// KICD Grade 10 Music and Dance 2.3 "Kenyan Indigenous Musical Instrument (Solo Performer)" names
// exactly 6 instrument categories: fiddle, lyre, harp, flute, drum or drum set, and barred and
// spoked instruments — the design names no specific instrument brands, so this file reasons about
// real Kenyan indigenous instruments that plausibly fall in each category (per the task brief):
// fiddle -> orutu (Luo bowed one-string fiddle); lyre -> nyatiti (Luo 8-string lyre) and litungu
// (Luhya lyre); flute -> chivoti (Mijikenda bamboo flute); drum -> isukuti (Luhya drum); barred ->
// silimba (Bukusu/Luhya wooden xylophone); spoked -> a Kenyan thumb piano (lamellophone, tongues
// plucked by the thumbs). "Harp" is described functionally rather than pinned to one specific
// ethnic-community name, since the author is not confident enough in a single traditional Kenyan
// harp name to assert it as fact — safer to describe the category accurately than to fabricate
// specificity the source design itself doesn't provide. No VisualSpec in types.ts fits a specific
// Kenyan indigenous instrument (string-instrument-diagram draws a Western bow instrument; no
// nyatiti/isukuti/silimba shape exists) — a deliberate, documented skip, not an oversight.

type CategoryId = "fiddle" | "lyre" | "harp" | "flute" | "drum" | "barred-spoked";

const CATEGORIES: { id: CategoryId; label: string; definition: string }[] = [
  { id: "fiddle", label: "Fiddle", definition: "A bowed, usually single-stringed instrument — such as the Luo orutu — played by drawing a bow across a tensioned string to make it vibrate" },
  { id: "lyre", label: "Lyre", definition: "A stringed instrument with strings stretched from a yoke over a bowl-shaped resonator — such as the Luo nyatiti or the Luhya litungu — plucked with the fingers" },
  { id: "harp", label: "Harp", definition: "A stringed instrument with strings of different lengths stretched across an open frame, plucked directly by both hands" },
  { id: "flute", label: "Flute", definition: "A wind instrument — such as the Mijikenda chivoti — played by blowing air across or into an opening while the fingers cover and uncover holes to change pitch" },
  { id: "drum", label: "Drum or drum set", definition: "A percussion instrument with a stretched skin membrane — such as the Luhya isukuti — struck by hand or stick to produce sound" },
  { id: "barred-spoked", label: "Barred and spoked instruments", definition: "Barred instruments (such as the Bukusu silimba xylophone) have tuned wooden or metal bars struck with beaters; spoked instruments (such as a Kenyan thumb piano) have metal or bamboo tongues fixed at one end and plucked by the thumbs" },
];

function categoryOf(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id)!;
}

// ---- Sound-production + cultural-idiom fact pool: 14 facts across the 6 categories, feeds
// categorize (subset sliced per generation) and reasoning. ----
const FACTS: { text: string; category: CategoryId }[] = [
  { text: "Sound is produced by drawing a bow across a tensioned string, causing it to vibrate", category: "fiddle" },
  { text: "The orutu produces a sustained, droning melodic line that accompanies solo or group Luo singing", category: "fiddle" },
  { text: "Sound is produced by plucking strings stretched from a yoke over a bowl-shaped resonator", category: "lyre" },
  { text: "The nyatiti accompanies sung storytelling and social-commentary songs in Luo tradition, often at social gatherings", category: "lyre" },
  { text: "The litungu accompanies solo sung praise or narrative songs among Luhya and other Western Kenya communities", category: "lyre" },
  { text: "Sound is produced by plucking strings of different lengths stretched across an open frame, with no fretboard", category: "harp" },
  { text: "Each string on a harp-family instrument is a fixed length, so pitch is set by string length rather than by pressing down on a fretboard", category: "harp" },
  { text: "Sound is produced by blowing a stream of air across or into an opening, setting up vibration inside a tube", category: "flute" },
  { text: "The chivoti is traditionally played by Mijikenda herders and performed at coastal community celebrations", category: "flute" },
  { text: "Sound is produced by striking a stretched skin membrane, which vibrates and resonates inside a hollow body", category: "drum" },
  { text: "The isukuti provides driving rhythmic accompaniment for the Luhya isukuti dance, performed at celebrations such as weddings and initiation ceremonies", category: "drum" },
  { text: "On a barred instrument, sound is produced by striking tuned wooden or metal bars with beaters", category: "barred-spoked" },
  { text: "The silimba provides melodic accompaniment for celebratory Luhya dance music", category: "barred-spoked" },
  { text: "On a spoked instrument, sound is produced by plucking flexible metal or bamboo tongues fixed at one end, often played solo for personal or reflective accompaniment", category: "barred-spoked" },
];

const CATEGORY_MATCH_PROMPTS = [
  "Match each instrument category to what it means.",
  "Pair each of the six instrument categories with its correct description.",
  "Connect each category to the description that explains it.",
  "Match each term below to how that kind of instrument actually works.",
  "Which description fits which instrument category? Match them correctly.",
  "Work out how each instrument category produces sound, then match it up.",
  "Pair each category with the statement that describes it.",
  "Link each of the six categories to its correct explanation.",
  "Match each instrument category to the description of how it works.",
  "For each category below, find the description that explains it.",
  "Match every category on the left to its meaning on the right.",
  "Sort out which description belongs to which category, by matching them.",
  "Correctly match every category to the description that fits it.",
  "Match each of the six categories to how a performer produces sound on it.",
  "Line up each instrument category with what it actually means.",
  "Work out which meaning goes with which category, then match them.",
  "Match the six categories to their correct descriptions below.",
  "Figure out what each category means, then match it to the right term.",
  "Pair up every category with the statement that correctly describes it.",
  "Match each instrument category to its definition.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each fact by the instrument category it describes.",
  "Group these facts under the correct instrument category.",
  "Decide which category each fact below belongs to, and sort it there.",
  "Sort each statement into the category it best fits.",
  "Place each fact into the correct instrument-category bucket.",
  "Read each fact and sort it under the category it matches.",
  "Work out which category each fact is about, then sort it there.",
  "Classify each fact by the instrument category it belongs to.",
  "Organize these facts into their correct category.",
  "Which category does each fact describe? Sort it accordingly.",
  "Sort each statement below into fiddle, lyre, harp, flute, drum, or barred-and-spoked.",
  "Drop each fact into the category it's really about.",
  "Group each statement with the category it correctly belongs to.",
  "Decide where each fact fits among the six instrument categories.",
  "Sort these facts into their correct instrument-category groups.",
  "For each fact, work out its category and sort it in.",
  "Place these statements under the category each one matches.",
  "Sort each fact correctly among the six instrument categories.",
  "Read each statement and file it under the right category.",
  "Assign each fact to the instrument category it best describes.",
] as const;

const ORDER_PROMPTS = [
  "Arrange the stages of learning a Kenyan indigenous instrument in the correct order.",
  "Put these learning stages into a sensible order.",
  "Sequence the stages of learning to play a chosen indigenous instrument.",
  "Arrange these actions into the order a careful learner would follow them.",
  "Order these stages the way a Grade 10 music student should carry them out.",
  "Sort these steps into the order they should happen when learning an instrument.",
  "Put these stages in the order a responsible learner would do them.",
  "Work out the sensible order for these instrument-learning stages.",
  "Arrange these stages into a logical learning sequence.",
  "Which order should these stages happen in? Arrange them correctly.",
  "Build a sensible learning sequence by ordering these stages correctly.",
  "Sequence a learner's stages in the order they should be done.",
  "Order these actions the way they'd happen in a well-planned learning process.",
  "Arrange the stages of mastering an instrument, in the right order.",
  "Put these stages into the order a careful learner would complete them.",
  "Sequence these steps to build a sensible instrument-learning process.",
  "Work out the correct order for learning and performing on an instrument.",
  "Arrange these stages as a learner would carry them out.",
  "Order the stages below the way a sensible learning process would run.",
  "Sequence these learning stages correctly, from first to last.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the sentence with the correct term.",
  "Fill in the missing term.",
  "Which term completes this sentence correctly?",
  "Work out the term that belongs in the blank.",
  "Name the term this sentence is describing.",
  "Identify the missing term below.",
  "Which word fits this description?",
  "Fill in the blank with the correct term.",
  "This sentence is describing which term?",
  "Complete this definition with the correct term.",
  "Work out and fill in the correct term.",
  "Which term matches the description given?",
  "Fill in the term being defined here.",
  "Name the correct term for this description.",
  "Which term best completes this sentence?",
  "Identify the term described in this sentence.",
  "Complete the sentence below with the right term.",
  "Fill in the missing word.",
  "Work out which term this description points to.",
  "Which term fits the blank in this sentence?",
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A Kenyan indigenous instrument played by drawing a bow across a tensioned string, such as the orutu, belongs to the ", after: " category.", correctAnswer: "fiddle", acceptedAnswers: ["fiddle"] },
  { before: "An instrument with strings stretched from a yoke over a bowl-shaped resonator, such as the nyatiti or litungu, belongs to the ", after: " category.", correctAnswer: "lyre", acceptedAnswers: ["lyre"] },
  { before: "An instrument with strings of different lengths stretched across an open frame, plucked directly by hand, belongs to the ", after: " category.", correctAnswer: "harp", acceptedAnswers: ["harp"] },
  { before: "A wind instrument played by blowing air across or into an opening while covering holes with the fingers, such as the chivoti, belongs to the ", after: " category.", correctAnswer: "flute", acceptedAnswers: ["flute"] },
  { before: "A percussion instrument with a stretched skin membrane struck by hand or stick, such as the isukuti, is a ", after: ".", correctAnswer: "drum", acceptedAnswers: ["drum", "drum or drum set"] },
  { before: "Wooden or metal bars struck with beaters to produce pitched notes, such as on the silimba, describes a ", after: " instrument.", correctAnswer: "barred", acceptedAnswers: ["barred"] },
  { before: "Metal or bamboo tongues fixed at one end and plucked by the thumbs describes a ", after: " instrument.", correctAnswer: "spoked", acceptedAnswers: ["spoked"] },
  { before: "Adjusting the tension of a string, drum skin, or plucked tongue to correct its pitch before playing is called ", after: " the instrument.", correctAnswer: "tuning", acceptedAnswers: ["tuning"] },
  { before: "Playing tunes and rhythms in the traditional style specifically associated with a chosen instrument's community is playing in its cultural ", after: ".", correctAnswer: "idiom", acceptedAnswers: ["idiom"] },
  { before: "Storing an instrument away from excess moisture and heat, and replacing worn strings or skins, are examples of ", after: " an instrument.", correctAnswer: "maintaining", acceptedAnswers: ["maintaining", "maintenance"] },
  { before: "Drawing a bow across a string to make it vibrate is the playing technique used on the ", after: ".", correctAnswer: "fiddle", acceptedAnswers: ["fiddle", "orutu"] },
  { before: "Plucking strings stretched over a bowl-shaped resonator with the fingers is the playing technique used on the ", after: ".", correctAnswer: "lyre", acceptedAnswers: ["lyre", "nyatiti", "litungu"] },
] as const;

// 7-step learning sequence, condensed directly from the design's own Suggested Learning
// Experiences bullet order for 2.3.
const LEARNING_STEPS = [
  { id: "listen", label: "Listen to or watch performances involving Kenyan indigenous musical instruments to determine how sound is produced" },
  { id: "familiarise", label: "Familiarise with the selected instrument to identify its parts and handling" },
  { id: "search", label: "Search responsibly for videos, or interact with resource persons, to learn tuning, playing, and maintaining techniques" },
  { id: "practice-tuning", label: "Practice the tuning techniques of the instrument" },
  { id: "rehearse", label: "Rehearse playing the instrument to master the playing techniques" },
  { id: "perform", label: "Play tunes or rhythmic patterns from the cultural idiom of the chosen instrument before an audience" },
  { id: "record", label: "Record and share the music for feedback and upload it to a digital portfolio" },
] as const;

// ---- Apply-tier reasoning pool: 12 situation facts x (6 openers x 4 closers = 24 frames) ≈ 280+ templates ----
interface ReasonFact { situation: string; correct: string; wrong: string[]; explanation: string }

const REASON_FACTS: ReasonFact[] = [
  {
    situation: "a music student draws a bow across the single string of an orutu during a lesson",
    correct: "The student is using a fiddle-family playing technique — bowing — to make the string vibrate",
    wrong: [
      "The student is using a lyre-family plucking technique",
      "The student is using a barred-instrument striking technique",
      "The student is using a spoked-instrument plucking technique",
    ],
    explanation: "Drawing a bow across a tensioned string is specifically the fiddle-family playing technique — lyres and harps are plucked, barred instruments are struck, and spoked instruments are plucked at flexible tongues, not bowed.",
  },
  {
    situation: "a performer plucks strings stretched from a yoke over a bowl-shaped resonator on a nyatiti",
    correct: "This is a lyre — its strings run from a yoke over a bowl-shaped resonator and are plucked",
    wrong: [
      "This is a fiddle, since it is a stringed instrument played by hand",
      "This is a harp, since the strings are plucked",
      "This is a barred instrument, since it is struck to produce sound",
    ],
    explanation: "A lyre is specifically defined by strings running from a yoke over a bowl-shaped resonator — a fiddle is bowed rather than plucked, a harp's strings are stretched across an open frame rather than a resonator, and the nyatiti is never struck.",
  },
  {
    situation: "a performer strikes tuned wooden bars with beaters on a silimba, producing a melodic pattern",
    correct: "This is a barred instrument — sound is produced by striking tuned bars with beaters",
    wrong: [
      "This is a spoked instrument, since spoked instruments also produce pitched notes",
      "This is a drum, since striking always means a drum",
      "This is a lyre, since it is a wooden instrument",
    ],
    explanation: "Barred instruments like the silimba are struck with beaters on tuned bars — spoked instruments are plucked at flexible tongues instead, drums are struck skin membranes rather than solid bars, and lyres are plucked strings.",
  },
  {
    situation: "a performer plucks the short metal tongues of a Kenyan thumb piano softly with both thumbs",
    correct: "This is a spoked instrument — sound is produced by plucking flexible tongues fixed at one end",
    wrong: [
      "This is a barred instrument, since it also produces pitched notes",
      "This is a harp, since strings are plucked with the fingers",
      "This is a fiddle, since a bow is being used",
    ],
    explanation: "A spoked instrument's tongues are plucked and fixed at one end, unlike a barred instrument's separate struck bars, a harp's stretched strings, or a fiddle's bowed string.",
  },
  {
    situation: "a Mijikenda herder blows across the mouth hole of a chivoti while covering and uncovering finger holes to change the pitch",
    correct: "This is a flute — sound is produced by blowing air across an opening while fingers change pitch",
    wrong: [
      "This is a fiddle, since it is a single small instrument",
      "This is a drum, since it is played by an individual performer",
      "This is a lyre, since it accompanies solo performance",
    ],
    explanation: "A flute like the chivoti produces sound by blowing air across an opening while fingers cover holes to change pitch — a completely different sound-production method from bowing (fiddle), striking a membrane (drum), or plucking strings (lyre).",
  },
  {
    situation: "a performer strikes the stretched skin of an isukuti with their hands during a Luhya celebration dance",
    correct: "This is a drum — sound is produced by striking a stretched skin membrane",
    wrong: [
      "This is a barred instrument, since it is struck to produce sound",
      "This is a flute, since it is used for a celebration dance",
      "This is a fiddle, since it is played with the hands",
    ],
    explanation: "A drum like the isukuti is defined by a struck, stretched skin membrane — a barred instrument is struck solid tuned bars instead, not skin, and neither a flute nor a fiddle is struck at all.",
  },
  {
    situation: "before a performance, a lyre player notices one string sounds flat and adjusts the string's tension until the pitch is correct",
    correct: "This is tuning the instrument",
    wrong: [
      "This is maintaining the instrument",
      "This is playing in the instrument's cultural idiom",
      "This is a sound-production technique unrelated to pitch",
    ],
    explanation: "Adjusting a string's tension to correct its pitch before playing is specifically tuning — maintenance is about the instrument's physical upkeep over time, and cultural idiom is about the style of music played, not pitch correction.",
  },
  {
    situation: "after a performance, a drum owner stores the isukuti in a dry place away from direct sun and checks the skin for wear, replacing it when needed",
    correct: "This is maintaining the instrument",
    wrong: [
      "This is tuning the instrument",
      "This is playing in the instrument's cultural idiom",
      "This is a sound-production technique",
    ],
    explanation: "Storing an instrument properly and replacing worn parts is maintenance — tuning is specifically about correcting pitch, and cultural idiom is about performance style, not upkeep.",
  },
  {
    situation: "a nyatiti player performs a sung storytelling piece with social commentary, in the traditional style associated with Luo musicians",
    correct: "This is playing in the instrument's cultural idiom",
    wrong: [
      "This is tuning the instrument",
      "This is a sound-production technique",
      "This is maintaining the instrument",
    ],
    explanation: "Performing tunes and a style specifically associated with the instrument's community tradition is playing in its cultural idiom — tuning is about pitch correction and maintenance is about physical upkeep, neither of which this describes.",
  },
  {
    situation: "an isukuti drum is left out in direct sun and rain for several weeks, and its skin becomes loose and cracked",
    correct: "Poor maintenance — prolonged exposure to sun and rain — has damaged the drum skin, showing why proper storage and care matter",
    wrong: [
      "Drum skins naturally loosen and crack over time regardless of how they are stored",
      "Sun and rain exposure always improves a drum's tone",
      "This shows the drum needed re-tuning rather than proper storage",
    ],
    explanation: "Sun and rain damage a drum's skin because the material dries, stretches and cracks under repeated exposure — this is a maintenance failure, not a natural or inevitable outcome, and re-tuning cannot repair physical skin damage.",
  },
  {
    situation: "a spoked thumb-piano tongue is repeatedly plucked too hard near its very tip during a rehearsal, and it eventually snaps",
    correct: "The tongue was damaged by rough handling, showing why gentle, controlled plucking is part of correctly maintaining and playing a spoked instrument",
    wrong: [
      "The tongue snapped because the instrument was tuned incorrectly",
      "Spoked instruments cannot be damaged by plucking, however hard",
      "This shows the instrument needed to be played with a bow instead",
    ],
    explanation: "Rough, excessive force when plucking a flexible spoked tongue can snap it — this is a playing-technique and maintenance issue, not a tuning problem, and spoked instruments are never bowed.",
  },
  {
    situation: "a learner confuses a silimba (barred) with a Kenyan thumb piano (spoked) because both instruments are played with the hands and produce pitched notes",
    correct: "The silimba's bars are struck with beaters, while a thumb piano's tongues are plucked by the thumbs — different sound-production methods within the same broad category",
    wrong: [
      "Both instruments are actually played by bowing, not by hand",
      "Both instruments are struck exactly the same way, with no real difference",
      "Only the thumb piano produces pitched notes; the silimba does not",
    ],
    explanation: "'Barred' and 'spoked' are grouped as one named category in the design, but they use genuinely different sound-production methods — striking tuned bars versus plucking flexible tongues — and both produce pitched, tuned notes.",
  },
];

const OPENERS: ((rng: RNG, fact: ReasonFact) => string)[] = [
  (rng, fact) => `${name(rng)} is learning a Kenyan indigenous instrument at a school in ${place(rng)}, where ${fact.situation}`,
  (rng, fact) => `During a music lesson at a school in ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)}, a Grade 10 music student, is practising a solo instrument, and ${fact.situation}`,
  (rng, fact) => `At a cultural performance in ${place(rng)}, ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `${name(rng)}'s music teacher points out that ${fact.situation}`,
];

const CLOSERS = [
  "What does this describe?",
  "Which conclusion best fits this situation?",
  "What is being demonstrated here?",
  "What should you conclude from this?",
] as const;

/** Compose openers x closers with a fact-specific explanation (not sharedG10.combineFrames's
 * default of reusing the bare correct answer), so wrong answers get their misconception named. */
function makeFrames(): ((rng: RNG, fact: ReasonFact) => ScenarioMC)[] {
  const frames: ((rng: RNG, fact: ReasonFact) => ScenarioMC)[] = [];
  for (const opener of OPENERS) {
    for (const closer of CLOSERS) {
      frames.push((rng, fact) => ({
        prompt: `${opener(rng, fact)}. ${closer}`,
        correct: fact.correct,
        wrong: fact.wrong,
        explanation: fact.explanation,
      }));
    }
  }
  return frames;
}

const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, makeFrames());

export const kenyanIndigenousInstrument: Skill = {
  id: "g10-mad-kenyan-indigenous-instrument",
  code: "2.3",
  subjectId: "music-and-dance",
  strandId: "g10-mad-performing",
  grade: 10,
  title: "Kenyan Indigenous Musical Instrument (Solo Performer)",
  description: "The six categories of Kenyan indigenous musical instruments — fiddle, lyre, harp, flute, drum or drum set, and barred and spoked instruments — how each produces sound, playing in the instrument's cultural idiom, and tuning, playing and maintaining techniques.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["category-match", "categorize-facts", "learning-order", "reasoning", "fill-blank"] as const
    );
    const hint = "The six categories are fiddle (bowed), lyre (plucked, bowl resonator), harp (plucked, open frame), flute (blown), drum (struck skin), and barred-and-spoked (struck bars or plucked tongues).";

    if (branch === "category-match") {
      const tokens = shuffle(rng, CATEGORIES.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, CATEGORIES.map((c) => ({ id: c.id, label: c.definition })));
      const correctMap: Record<string, string> = {};
      for (const c of CATEGORIES) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CATEGORY_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CATEGORIES.map((c) => `${c.label}: ${c.definition}.`).join(" "),
      };
    }

    if (branch === "categorize-facts") {
      const chosen = shuffle(rng, FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
        correctBucket,
        hint,
        explanation: chosen.map((f) => `"${f.text}" is about the ${categoryOf(f.category).label.toLowerCase()} category.`).join(" "),
      };
    }

    if (branch === "learning-order") {
      const shuffled = shuffle(rng, LEARNING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: LEARNING_STEPS.map((s) => s.id),
        hint: "Start by listening and familiarising, then learn tuning/playing/maintaining, rehearse, perform, and finally record.",
        explanation: LEARNING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.acceptedAnswers],
      inputMode: "text",
      hint,
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`.replace(/\s+/g, " ").trim(),
    };
  },
};
