import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Das Krankenhaus liegt auf der Hauptstraße.", meaning: "The hospital is on the main road." },
  { phrase: "Die Kirche liegt hinter dem Markt.", meaning: "The church is behind the market." },
  { phrase: "Die Schule ist ein Kilometer entfernt.", meaning: "The school is one kilometer away." },
  { phrase: "Geh geradeaus.", meaning: "Go straight ahead." },
  { phrase: "Bieg rechts ab.", meaning: "Turn right." },
  { phrase: "Bieg links ab.", meaning: "Turn left." },
];

const SORT_ITEMS: { label: string; bucket: "place" | "direction" }[] = [
  { label: "das Krankenhaus", bucket: "place" },
  { label: "die Kirche", bucket: "place" },
  { label: "die Schule", bucket: "place" },
  { label: "der Markt", bucket: "place" },
  { label: "nach rechts", bucket: "direction" },
  { label: "nach links", bucket: "direction" },
  { label: "geradeaus", bucket: "direction" },
];

export const directionsSpeaking: Skill = {
  id: "de-ls-directions",
  code: "LS.9",
  subjectId: "german",
  strandId: "de-listening-speaking",
  grade: 9,
  title: "Getting around: direction and location",
  description: "Match German direction expressions to their meaning, and sort places from direction words.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const place = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "place")).slice(0, 3);
      const direction = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "direction"));
      const items = shuffle(rng, [...place, ...direction]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.label] = it.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each word as a Place (Ort) or a Direction (Richtung).",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "place", label: "Place" },
          { id: "direction", label: "Direction" },
        ],
        correctBucket,
        hint: "Places are things you go to; directions are how you get there.",
        explanation: `Place: ${place.map((f) => f.label).join(" / ")}. Direction: ${direction.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each German direction expression to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'liegt' means 'is located' — look at where each place is described as being.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
