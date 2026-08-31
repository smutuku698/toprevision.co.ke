import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, name, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Elements of a Map" — a closed list of exactly
// 5 named elements (Title, Frame, Scale, Compass, Key). No map-drawing widget exists in this app, so every
// branch is text/fact-based (identify/match/sort/fill-blank/order the elements), never "click on the map".

type ElementId = "title" | "frame" | "scale" | "compass" | "key";

interface MapElement {
  id: ElementId;
  label: string;
  meaning: string;
  job: string; // a short description of what job it does, used in "which element does this?" questions
  step: number; // order of use when reading a map: 1 = title, 2 = key, 3 = compass, 4 = scale
}

const ELEMENTS: readonly MapElement[] = [
  { id: "title", label: "Title", meaning: "tells you what the map is about", job: "tells the reader what the map shows, usually written at the top", step: 1 },
  { id: "frame", label: "Frame", meaning: "the border line drawn around the whole map", job: "marks the boundary/edge of the mapped area with a border line", step: 5 },
  { id: "scale", label: "Scale", meaning: "shows the relationship between distance on the map and real distance on the ground", job: "lets you work out real-ground distance from map distance", step: 4 },
  { id: "compass", label: "Compass", meaning: "shows direction — north, south, east and west", job: "shows which way is north, south, east and west on the map", step: 3 },
  { id: "key", label: "Key (legend)", meaning: "explains what the symbols and colours on the map mean", job: "explains the meaning of the symbols and colours used on the map", step: 2 },
] as const;

// Reading-order sequence: title -> key -> compass -> scale (frame is a fixed border, not a "reading step").
const READING_ORDER: readonly MapElement[] = [ELEMENTS[0], ELEMENTS[4], ELEMENTS[3], ELEMENTS[2]];

export const elementsOfAMap: Skill = {
  id: "g5-ss-env-elements-of-a-map",
  code: "E.1",
  subjectId: "social-studies",
  strandId: "g5-ss-environments",
  grade: 5,
  title: "Elements of a Map",
  description: "Identifying the five elements of a map — title, frame, scale, compass and key — and what each one shows.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const el = randChoice(rng, ELEMENTS);
      const others = shuffle(rng, ELEMENTS.filter((e) => e.id !== el.id)).slice(0, 3);
      const choices = shuffle(rng, [el.label, ...others.map((o) => o.label)]);
      return {
        kind: "multiple-choice",
        prompt: identifyPrompt(rng, `map element: it ${el.job}`),
        choices,
        correctIndex: choices.indexOf(el.label),
        hint: "Think about what job each of the five map elements does.",
        explanation: `The ${el.label} is the element that ${el.job}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...ELEMENTS]);
      const tokens = chosen.map((e) => ({ id: e.id, label: e.label }));
      const targets = shuffle(rng, chosen).map((e) => ({ id: e.id, label: e.meaning.charAt(0).toUpperCase() + e.meaning.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const e of chosen) correctMap[e.id] = e.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "map element to what it means"),
        tokens,
        targets,
        correctMap,
        hint: "Each of the five map elements does a different job.",
        explanation: chosen.map((e) => `${e.label}: ${e.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const statements = [
        { id: "s1", label: "This tells you what the whole map is showing you.", el: "title" as ElementId },
        { id: "s2", label: "This border line shows where the mapped area ends.", el: "frame" as ElementId },
        { id: "s3", label: "This helps you turn map distance into real ground distance.", el: "scale" as ElementId },
        { id: "s4", label: "This shows you which direction is north on the map.", el: "compass" as ElementId },
        { id: "s5", label: "This explains what each symbol and colour on the map stands for.", el: "key" as ElementId },
        { id: "s6", label: "A learner reads this first to find out the map's subject.", el: "title" as ElementId },
        { id: "s7", label: "A learner checks this to avoid confusing east with west.", el: "compass" as ElementId },
        { id: "s8", label: "A learner checks this to know what a small blue square symbol means.", el: "key" as ElementId },
      ] as const;
      const chosen = shuffle(rng, statements).slice(0, 6);
      const items = chosen.map((s) => ({ id: s.id, label: s.label }));
      const usedIds = Array.from(new Set(chosen.map((s) => s.el)));
      const buckets = usedIds.map((id) => ({ id, label: ELEMENTS.find((e) => e.id === id)!.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s) => (correctBucket[s.id] = s.el));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which map element it describes"),
        items,
        buckets,
        correctBucket,
        hint: "Match each statement to the map element whose job it describes.",
        explanation: chosen.map((s) => `"${s.label}" describes the ${ELEMENTS.find((e) => e.id === s.el)!.label}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const n = name(rng);
      const templates = [
        () => ({ before: "The map element that tells you what the map is about is the", after: ".", correct: "title" }),
        () => ({ before: "The border line drawn around the edge of a map is called the", after: ".", correct: "frame" }),
        () => ({ before: "To work out the real distance on the ground from a distance on the map, you use the", after: ".", correct: "scale" }),
        () => ({ before: "To find out which direction is north on a map, you look at the", after: ".", correct: "compass" }),
        () => ({ before: "The part of a map that explains what each symbol and colour means is called the", after: ".", correct: "key" }),
        () => ({ before: `${n} wants to know what the map's symbols mean, so ${n} checks the`, after: ".", correct: "key" }),
        () => ({ before: `${n} wants to know which way is east, so ${n} looks at the map's`, after: ".", correct: "compass" }),
        () => ({ before: "A map's key is also sometimes called a", after: ".", correct: "legend" }),
        () => ({ before: "Before reading any other part of a map, it helps to first read the", after: ", to know what the map shows.", correct: "title" }),
        () => ({ before: "There are five main elements of a map: title, frame, scale, compass and", after: ".", correct: "key" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the five elements of a map: title, frame, scale, compass and key.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    // ordering — the natural order of reading/using a map's elements: title -> key -> compass -> scale.
    const items = shuffle(rng, READING_ORDER).map((e) => ({ id: e.id, label: e.label }));
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "the steps of correctly reading a map, using its elements"),
      items,
      correctOrder: READING_ORDER.map((e) => e.id),
      instruction: "First step first.",
      hint: "First find out what the map shows, then understand its symbols, then find direction, then measure distance.",
      explanation: `A good order for reading a map: ${READING_ORDER.map((e) => e.label).join(" → ")}.`,
    };
  },
};
