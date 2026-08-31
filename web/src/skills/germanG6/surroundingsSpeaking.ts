import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SCHOOL_FACILITY_FUNCTIONS, SCHOOL_VOCAB, name, place, umlautAccepted } from "./shared";

// LS.3 My Surroundings (My School) — oral school-facility vocabulary practised through matching,
// sorting, fill-in, a school-tour ordering task, situational reasoning, and the "lesen - Bibliothek;
// spielen/Fußball - Sportplatz" oral matching-game pattern linking an activity to the facility it happens in.

const MATCH_OPENERS = ["Match each German word", "Pair every school word", "Connect each vocabulary item", "Link each word below", "Match the German term", "Join each school word"];
const MATCH_CLOSERS = ["to its correct English meaning.", "with what it means in English.", "to its English translation.", "to the right meaning.", "to what it means."];

const CATEGORIZE_OPENERS = ["Sort each school word", "Group these German words", "Classify each place", "Decide where each word belongs", "Organise the words below", "Put each school word"];
const CATEGORIZE_CLOSERS = ["into the correct category.", "by which group it belongs to.", "into the right group.", "according to its category.", "the way it should be grouped."];

const FILL_OPENERS = ["Fill in the missing German word", "Complete the sentence with the right German word", "Work out the missing German word", "Type the correct German word", "Supply the missing German word", "Complete this phrase correctly"];
const FILL_CLOSERS = ["to finish the sentence.", "so the sentence is correct.", "that fits the meaning.", "based on the meaning given."];

const ORDER_OPENERS = ["Put these lines", "Arrange the tour", "Order the sentences", "Sequence this school tour", "Rearrange the pieces", "Organise the lines"];
const ORDER_CLOSERS = ["in the correct order.", "so they make sense.", "the way they would naturally be said.", "into a sensible sequence.", "in a logical order."];

const SCENARIO_PROMPT_POOL = [
  "What is happening in this situation?",
  "Read the situation and choose what fits.",
  "Work out what is being expressed here.",
  "Choose the phrase that matches the situation.",
  "Where should this person go?",
  "Pick the correct description of this moment.",
  "Decide what fits this scene.",
  "What is being said or needed here?",
  "Which place matches what was said?",
  "Choose what best explains this exchange.",
  "What is really going on here?",
  "Work out the purpose of what was said.",
];

const FUNCTION_OPENERS = ["Match each activity", "Pair every activity word", "Connect each action", "Link each activity below", "Match the activity", "Join each action word"];
const FUNCTION_CLOSERS = ["to the school place where it happens.", "with the place it happens in.", "to the correct school facility.", "to where you would do it.", "to the right place."];

type Bucket = "Learning space" | "Outdoor or recreation" | "Facility or room";

const CATEGORY_ITEMS: { word: string; bucket: Bucket }[] = [
  { word: "die Bibliothek", bucket: "Learning space" },
  { word: "das Klassenzimmer", bucket: "Learning space" },
  { word: "das Labor", bucket: "Learning space" },
  { word: "der Computerraum", bucket: "Learning space" },
  { word: "die Tafel", bucket: "Learning space" },
  { word: "der Sportplatz", bucket: "Outdoor or recreation" },
  { word: "der Spielplatz", bucket: "Outdoor or recreation" },
  { word: "der Garten", bucket: "Outdoor or recreation" },
  { word: "das Tor", bucket: "Outdoor or recreation" },
  { word: "die Schule", bucket: "Facility or room" },
  { word: "das Lehrerzimmer", bucket: "Facility or room" },
  { word: "das Klo", bucket: "Facility or room" },
  { word: "die Kantine", bucket: "Facility or room" },
  { word: "das Büro", bucket: "Facility or room" },
  { word: "der Flur", bucket: "Facility or room" },
  { word: "die Halle", bucket: "Facility or room" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'School' in German is ", after: ".", correct: "die Schule" },
  { before: "'Library' in German is ", after: ".", correct: "die Bibliothek" },
  { before: "'Classroom' in German is ", after: ".", correct: "das Klassenzimmer" },
  { before: "'Sports field' in German is ", after: ".", correct: "der Sportplatz" },
  { before: "'Staffroom' in German is ", after: ".", correct: "das Lehrerzimmer" },
  { before: "'Toilet' in German is ", after: ".", correct: "das Klo" },
  { before: "'Canteen' in German is ", after: ".", correct: "die Kantine" },
  { before: "'Office' in German is ", after: ".", correct: "das Büro" },
  { before: "'Playground' in German is ", after: ".", correct: "der Spielplatz" },
  { before: "'Corridor' in German is ", after: ".", correct: "der Flur" },
  { before: "'Laboratory' in German is ", after: ".", correct: "das Labor" },
  { before: "'Computer room' in German is ", after: ".", correct: "der Computerraum" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["Das ist die Schule. (this is the school)", "Hier ist das Klassenzimmer. (here is the classroom)", "Dort ist die Bibliothek. (there is the library)", "Und das ist der Sportplatz. (and this is the sports field)"] },
  { lines: ["Wir gehen durch das Tor. (we go through the gate)", "Dann sehen wir den Flur. (then we see the corridor)", "Links ist das Büro. (on the left is the office)", "Rechts ist das Lehrerzimmer. (on the right is the staffroom)"] },
  { lines: ["Zuerst das Klassenzimmer. (first the classroom)", "Dann das Labor. (then the laboratory)", "Danach der Computerraum. (after that the computer room)", "Zuletzt die Bibliothek. (last the library)"] },
  { lines: ["Wir essen in der Kantine. (we eat in the canteen)", "Wir spielen auf dem Spielplatz. (we play in the playground)", "Wir lernen im Klassenzimmer. (we learn in the classroom)", "Wir lesen in der Bibliothek. (we read in the library)"] },
  { lines: ["Das ist der Garten. (this is the garden)", "Neben dem Garten ist die Halle. (next to the garden is the hall)", "Hinter der Halle ist der Sportplatz. (behind the hall is the sports field)", "Und dort ist das Klo. (and there is the toilet)"] },
];

const EXTRA_FUNCTIONS: { word: string; function: string }[] = [
  { word: "das Büro", function: "arbeiten (working)" },
  { word: "der Garten", function: "pflanzen (planting)" },
  { word: "die Halle", function: "versammeln (gathering)" },
  { word: "der Computerraum", function: "tippen (typing)" },
];
const ALL_FUNCTIONS = [...SCHOOL_FACILITY_FUNCTIONS, ...EXTRA_FUNCTIONS];

const SCENARIO_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} at school in ${p} wants to read a book quietly. Where should ${n} go?`,
    correct: "die Bibliothek",
    distractors: ["der Sportplatz", "die Kantine", "das Klo"],
    explanation: `"die Bibliothek" (library) is where reading happens — "der Sportplatz" is for sports, not reading.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} wants to play football at break time. Where should ${n} go?`,
    correct: "der Sportplatz",
    distractors: ["die Bibliothek", "das Büro", "das Lehrerzimmer"],
    explanation: `"der Sportplatz" (sports field) is used for playing football — the library and office are for other purposes.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} is hungry and wants lunch. Where should ${n} go?`,
    correct: "die Kantine",
    distractors: ["das Labor", "der Computerraum", "die Tafel"],
    explanation: `"die Kantine" (canteen) is where food is eaten — not the laboratory or computer room.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} needs to do a science experiment. Where should ${n} go?`,
    correct: "das Labor",
    distractors: ["der Spielplatz", "die Kantine", "das Klo"],
    explanation: `"das Labor" (laboratory) is where experiments happen — not the playground or canteen.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} has a question and wants to find a teacher between lessons. Where should ${n} go?`,
    correct: "das Lehrerzimmer",
    distractors: ["das Klo", "der Garten", "der Flur"],
    explanation: `"das Lehrerzimmer" (staffroom) is where teachers gather — not the toilet or garden.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} wants to use a computer for typing class notes. Where should ${n} go?`,
    correct: "der Computerraum",
    distractors: ["die Bibliothek", "das Tor", "die Halle"],
    explanation: `"der Computerraum" (computer room) has computers for typing — the library has books, not computers, in this school.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} arrives at school and walks through the school entrance. What is ${n} passing through?`,
    correct: "das Tor",
    distractors: ["der Flur", "die Halle", "das Büro"],
    explanation: `"das Tor" (gate) is the entrance — "der Flur" (corridor) is an inside passage, not the entrance.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} needs to hand in a form to the school administration. Where should ${n} go?`,
    correct: "das Büro",
    distractors: ["der Sportplatz", "der Spielplatz", "die Kantine"],
    explanation: `"das Büro" (office) is where administrative matters are handled.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} wants to relax and play with friends during break, not do sport. Where should ${n} go?`,
    correct: "der Spielplatz",
    distractors: ["der Sportplatz", "das Labor", "das Lehrerzimmer"],
    explanation: `"der Spielplatz" (playground) is for general play — "der Sportplatz" (sports field) is specifically for sport.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} sees the teacher writing notes at the front of class. What is the teacher using?`,
    correct: "die Tafel",
    distractors: ["das Klo", "der Garten", "das Tor"],
    explanation: `"die Tafel" (blackboard) is what a teacher writes on in front of the class.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} walks between classrooms to get to the next lesson. What is ${n} walking through?`,
    correct: "der Flur",
    distractors: ["die Halle", "der Garten", "das Klo"],
    explanation: `"der Flur" (corridor) connects rooms inside the building — "die Halle" (hall) is a large single room, not a passage.`,
  }),
];

export const surroundingsSpeaking: Skill = {
  id: "g6-de-ls-surroundings",
  code: "LS.3",
  subjectId: "german",
  strandId: "g6-de-listening-speaking",
  grade: 6,
  title: "My Surroundings (My School)",
  description: "Speak and recognise German school-facility vocabulary — matching, sorting, fill-in, an ordered school tour, reasoning about which facility fits a need, and the oral activity-to-facility matching game (lesen - Bibliothek; spielen/Fußball - Sportplatz).",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario", "function"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, SCHOOL_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.word })));
      const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((v, i) => (correctMap[`${i}-${v.word}`] = `${i}-${v.word}`));
      return {
        kind: "click-match",
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Think about what you would find or do in each place.",
        explanation: chosen.map((v) => `"${v.word}" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORY_ITEMS).slice(0, 7);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Learning space", label: "Learning space" },
          { id: "Outdoor or recreation", label: "Outdoor or recreation" },
          { id: "Facility or room", label: "Facility or room" },
        ],
        correctBucket,
        hint: "Learning spaces are for study, outdoor/recreation spaces are for play, other rooms serve a specific service.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Remember the article (der/die/das) that goes with this school word.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "Follow the tour logically from one place to the next.",
        explanation: `A natural order is:\n${set.lines.join("\n")}`,
      };
    }

    if (branch === "scenario") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, SCENARIO_TEMPLATES);
      const q = tmpl(n, p);
      const choices = shuffle(rng, [q.correct, ...q.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, SCENARIO_PROMPT_POOL)} ${q.prompt}`,
        choices,
        correctIndex: choices.indexOf(q.correct),
        layout: "list",
        hint: "Match the need described to the facility that actually serves that need.",
        explanation: q.explanation,
      };
    }

    const chosen = shuffle(rng, ALL_FUNCTIONS).slice(0, 5);
    const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.function}`, label: v.function })));
    const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.function}`, label: v.word })));
    const correctMap: Record<string, string> = {};
    chosen.forEach((v, i) => (correctMap[`${i}-${v.function}`] = `${i}-${v.function}`));
    return {
      kind: "click-match",
      prompt: `${randChoice(rng, FUNCTION_OPENERS)} ${randChoice(rng, FUNCTION_CLOSERS)}`,
      tokens,
      targets,
      correctMap,
      hint: "Think: where would you actually do this activity at school?",
      explanation: chosen.map((v) => `You would ${v.function} at "${v.word}".`).join(" "),
    };
  },
};
