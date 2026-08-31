import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, name, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Location, Position and Size of Kenya". The design
// references Kenya's neighbours and general position without listing all five neighbours by name, so this
// file adds the five real neighbouring countries (standard, well-known geography) plus Kenya's Equator
// crossing, Indian Ocean coastline and approximate land area. No map widget exists, so branches use compass
// direction / true-false facts rather than "click the map".

type Direction = "north" | "south" | "east" | "west" | "northwest";

interface Neighbour {
  country: string;
  direction: Direction;
  fact: string;
}

const NEIGHBOURS: readonly Neighbour[] = [
  { country: "Ethiopia", direction: "north", fact: "Ethiopia lies to the north of Kenya" },
  { country: "Somalia", direction: "east", fact: "Somalia lies to the east of Kenya" },
  { country: "Tanzania", direction: "south", fact: "Tanzania lies to the south of Kenya" },
  { country: "Uganda", direction: "west", fact: "Uganda lies to the west of Kenya" },
  { country: "South Sudan", direction: "northwest", fact: "South Sudan lies to the northwest of Kenya" },
] as const;

const DIRECTION_LABEL: Record<Direction, string> = {
  north: "north",
  south: "south",
  east: "east",
  west: "west",
  northwest: "northwest",
};

const LOCATION_FACTS = [
  { id: "f1", label: "The Equator passes through central Kenya.", correct: true },
  { id: "f2", label: "Kenya has a coastline on the Indian Ocean.", correct: true },
  { id: "f3", label: "Kenya's land area is about 580,000 square kilometres.", correct: true },
  { id: "f4", label: "Kenya borders exactly five countries.", correct: true },
  { id: "f5", label: "Kenya is a landlocked country with no coastline.", correct: false },
  { id: "f6", label: "Kenya lies entirely south of the Equator.", correct: false },
  { id: "f7", label: "Kenya has a coastline on the Atlantic Ocean.", correct: false },
  { id: "f8", label: "Kenya borders Nigeria to the west.", correct: false },
] as const;

const ALPHABETICAL = ["Ethiopia", "Somalia", "South Sudan", "Tanzania", "Uganda"] as const;

export const locationPositionAndSizeOfKenya: Skill = {
  id: "g5-ss-env-location-position-and-size-of-kenya",
  code: "E.2",
  subjectId: "social-studies",
  strandId: "g5-ss-environments",
  grade: 5,
  title: "Location, Position and Size of Kenya",
  description: "Describing Kenya's location, neighbouring countries, position relative to the Equator and coastline, and approximate size.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const n = randChoice(rng, NEIGHBOURS);
      const others = shuffle(rng, NEIGHBOURS.filter((o) => o.country !== n.country)).slice(0, 3);
      const choices = shuffle(rng, [n.country, ...others.map((o) => o.country)]);
      return {
        kind: "multiple-choice",
        prompt: identifyPrompt(rng, `country: it is the one that borders Kenya to the ${DIRECTION_LABEL[n.direction]}`),
        choices,
        correctIndex: choices.indexOf(n.country),
        hint: "Kenya has five neighbouring countries, each in a different direction.",
        explanation: `${n.fact}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...NEIGHBOURS]);
      const tokens = chosen.map((n) => ({ id: n.country, label: n.country }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.country, label: `Borders Kenya to the ${DIRECTION_LABEL[n.direction]}` }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.country] = n.country;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "neighbouring country to the compass direction it borders Kenya from"),
        tokens,
        targets,
        correctMap,
        hint: "Picture Kenya's map: which country sits in which direction around it?",
        explanation: chosen.map((n) => `${n.fact}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...LOCATION_FACTS]).slice(0, 6);
      const items = chosen.map((f) => ({ id: f.id, label: f.label }));
      const buckets = [
        { id: "true", label: "True" },
        { id: "false", label: "False" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f) => (correctBucket[f.id] = f.correct ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is true or false about Kenya's location"),
        items,
        buckets,
        correctBucket,
        hint: "Recall Kenya's real neighbours, its coastline, and where the Equator runs.",
        explanation: chosen.map((f) => `"${f.label}" is ${f.correct ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const n = name(rng);
      const templates = [
        () => ({ before: "Kenya's neighbour to the north is", after: ".", correct: "Ethiopia" }),
        () => ({ before: "Kenya's neighbour to the east is", after: ".", correct: "Somalia" }),
        () => ({ before: "Kenya's neighbour to the south is", after: ".", correct: "Tanzania" }),
        () => ({ before: "Kenya's neighbour to the west is", after: ".", correct: "Uganda" }),
        () => ({ before: "Kenya's neighbour to the northwest is", after: ".", correct: "South Sudan" }),
        () => ({ before: "The imaginary line at 0° latitude that passes through central Kenya is called the", after: ".", correct: "Equator" }),
        () => ({ before: "Kenya has a coastline on the", after: "Ocean.", correct: "Indian" }),
        () => ({ before: "Kenya's land area is about 580,000 square", after: ".", correct: "kilometres" }),
        () => ({ before: `${n} counts Kenya's neighbours on a map and finds there are`, after: "of them.", correct: "five" }),
        () => ({ before: "Kenya is a coastal country, not a landlocked", after: ".", correct: "country" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall Kenya's five neighbours and its position relative to the Equator and the Indian Ocean.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    // ordering — alphabetical, a genuine unambiguous sequence.
    const items = shuffle(rng, ALPHABETICAL).map((c) => ({ id: c, label: c }));
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "Kenya's five neighbouring countries, alphabetically"),
      items,
      correctOrder: [...ALPHABETICAL],
      instruction: "A first, Z last.",
      hint: "Compare the first letters of each country's name.",
      explanation: `In alphabetical order: ${ALPHABETICAL.join(", ")}.`,
    };
  },
};
