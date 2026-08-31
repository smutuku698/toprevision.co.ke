import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 1.1 "String Musical Instruments and Drawing" — the
// visual-art (drawing) half. The music/craft half of this same sub-strand ships separately as
// stringInstruments.ts (C.1), per curriculum-reference/grade-6/creative-arts.json's split note.
// Source content: identify pictures drawn using stippling technique; draw a still-life
// composition of any two string musical instruments using stippling with emphasis on
// overlapping, balance of forms, and tone/texture.

const OTHER_TECHNIQUES = ["Cross-hatching", "Continuous shading with a soft pencil", "Blending with a smudging tool", "Contour line drawing"] as const;

const TERMS: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  {
    id: "stippling",
    label: "Stippling",
    meaning: "Building up tone and texture using many small dots instead of lines or shading",
    blank: { before: "Building up tone and texture using many small dots is called ", after: ".", correctAnswer: "stippling" },
  },
  {
    id: "overlapping",
    label: "Overlapping",
    meaning: "Placing one object partly in front of another so it looks nearer to the viewer",
    blank: { before: "Placing one object partly in front of another to show it is closer is called ", after: ".", correctAnswer: "overlapping" },
  },
  {
    id: "balance-of-forms",
    label: "Balance of forms",
    meaning: "Arranging shapes in a composition so no single part feels too heavy or empty",
    blank: { before: "Arranging shapes so no part of a composition feels too heavy or empty is called ", after: ".", correctAnswer: "balance of forms", acceptedAnswers: ["balance of forms", "balance"] },
  },
  {
    id: "tone",
    label: "Tone",
    meaning: "How light or dark an area of a drawing appears",
    blank: { before: "How light or dark an area of a drawing appears is called its ", after: ".", correctAnswer: "tone" },
  },
  {
    id: "texture",
    label: "Texture",
    meaning: "The surface quality a drawing suggests, such as smooth, rough, or grainy",
    blank: { before: "The surface quality a drawing suggests, such as rough or smooth, is called its ", after: ".", correctAnswer: "texture" },
  },
  {
    id: "dot-density",
    label: "Dot density",
    meaning: "How closely packed the dots are — denser dots read as darker tone",
    blank: { before: "How closely packed stippled dots are, which controls how dark a tone reads, is called dot ", after: ".", correctAnswer: "density" },
  },
  {
    id: "light-source",
    label: "Light source",
    meaning: "The direction light comes from in a composition, which decides where shadows fall",
    blank: { before: "The direction light comes from in a composition, which decides where shadows fall, is called the ", after: ".", correctAnswer: "light source" },
  },
  {
    id: "still-life",
    label: "Still life",
    meaning: "A drawing of arranged objects, such as two string instruments, that do not move",
    blank: { before: "A drawing of arranged objects that do not move, such as two instruments placed together, is called a ", after: ".", correctAnswer: "still life" },
  },
];

const DENSITY_SCENARIOS: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} is stippling the shadowed underside of a fiddle's body in a still-life drawing in ${place(rng)}. Which dot density best shows this shadowed area?`,
    correct: "Dense, closely packed dots, which read as a dark tone",
    wrong: ["Sparse, widely spaced dots, which read as a light tone", "No dots at all, leaving the paper blank", "Dots of exactly the same spacing everywhere in the drawing"],
    explanation: "Densely packed dots blend together and read as a dark tone, which is right for a shadowed area — sparse dots or blank paper would look light, not shadowed.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is stippling the brightly lit top edge of an orutu's neck in a still-life drawing in ${place(rng)}. Which dot density is most appropriate here?`,
    correct: "Sparse, widely spaced dots, which read as a light tone",
    wrong: ["Dense, closely packed dots, which read as a dark tone", "Dots arranged in straight lines instead of scattered", "The same density used for the shadowed areas of the drawing"],
    explanation: "A brightly lit area needs a light tone, which sparse, widely spaced dots create — dense dots would wrongly darken a highlight.",
  }),
  (rng) => ({
    prompt: `In a still-life stippling of two instruments in ${place(rng)}, ${name(rng)} wants a smooth gradient from dark shadow to bright highlight across one instrument's body. How should the dot density change across that area?`,
    correct: "Gradually decrease the dot density from dense (shadow) to sparse (highlight)",
    wrong: ["Keep the dot density exactly the same across the whole area", "Switch suddenly from very dense to completely blank with no in-between", "Increase the dot density evenly in every direction regardless of the light source"],
    explanation: "A smooth tonal gradient is created by gradually changing dot density — dense near the shadow, sparse near the highlight — not by keeping density constant or switching abruptly.",
  }),
  (rng) => ({
    prompt: `${name(rng)} finishes a stippled still life of two string instruments in ${place(rng)} but the drawing looks flat, with no sense of which instrument is nearer the viewer. What technique is likely missing?`,
    correct: "Overlapping — placing one instrument partly in front of the other to show depth",
    wrong: ["Using only one dot density throughout the drawing", "Drawing the instruments the same size", "Choosing a light source"],
    explanation: "Overlapping — placing one instrument partly in front of the other — is what tells the viewer which object is nearer, giving the composition a sense of depth.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s still-life composition in ${place(rng)} places both instruments crowded into one corner, leaving the rest of the page empty. What principle has been ignored?`,
    correct: "Balance of forms — arranging shapes so no part of the composition feels too heavy or empty",
    wrong: ["Stippling — the dots themselves are still being used correctly", "Tone — light and dark areas can still be shown in a corner", "Overlapping — the instruments can still overlap while crowded in a corner"],
    explanation: "Balance of forms is about how shapes are spread across a composition, not how they are shaded — crowding everything into one corner leaves the rest of the page feeling empty and unbalanced.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is deciding where the light source should come from before starting a stippled still life of two instruments in ${place(rng)}. Why does this decision need to be made first?`,
    correct: "It decides where the shadows and highlights will fall, which controls where dense and sparse dots go",
    wrong: ["It decides how many instruments can be drawn", "It decides which instrument is drawn larger", "It has no effect on the stippling technique"],
    explanation: "The light source determines where shadows and highlights fall in the composition, which is exactly what dot density (dense for shadow, sparse for highlight) is used to represent.",
  }),
  (rng) => ({
    prompt: `${name(rng)} compares a stippled drawing to one shaded with continuous pencil strokes in ${place(rng)}'s art class. What is the key difference between the two techniques?`,
    correct: "Stippling builds tone from many separate dots, while shading uses continuous strokes or smudged pencil marks",
    wrong: ["Stippling can only be done in colour, never in pencil", "Shading cannot show overlapping objects, but stippling can", "Stippling and shading are actually the same technique with different names"],
    explanation: "Stippling is specifically defined by using many small dots to build tone, unlike continuous-stroke or smudged shading, which are different techniques entirely.",
  }),
  (rng) => ({
    prompt: `${name(rng)} wants the wooden body of one instrument to look rough and grainy in a stippled drawing in ${place(rng)}, while the strings look smooth. How can dot placement show this texture difference?`,
    correct: "Use irregular, unevenly spaced dots for the rough wood and small, evenly spaced dots for the smooth strings",
    wrong: ["Use identical dot spacing everywhere, since texture cannot be shown with dots", "Only use texture on the strings, and leave the wood completely blank", "Draw the wood using straight lines instead of dots"],
    explanation: "Varying how regular or irregular the dot placement is (not just how dense it is) can suggest different textures — irregular dots suggest a rough surface, evenly spaced small dots suggest a smooth one.",
  }),
];

const STEPS = [
  { id: "s1", label: "Sketch the outline of the two instruments, planning their positions on the page" },
  { id: "s2", label: "Decide where the light source comes from" },
  { id: "s3", label: "Arrange the two instruments so one overlaps the other, showing which is nearer" },
  { id: "s4", label: "Apply dense, closely packed dots to the shadowed areas" },
  { id: "s5", label: "Apply sparse, widely spaced dots to the brightly lit areas" },
  { id: "s6", label: "Step back and check the balance of forms across the whole composition" },
] as const;

const RECOGNITION_PROMPTS = ["Which technique is being described?", "Identify the drawing technique.", "Which technique does this describe?", "Read the description and name the technique.", "What is this drawing technique called?"] as const;
const DENSITY_PROMPTS = ["Sort each area by the dot density that suits it.", "Which dot density fits each part of the drawing? Sort them.", "Match each area to light, medium, or dark dot density.", "Sort these drawing areas by density needed.", "Decide the right dot density for each described area."] as const;
const TERM_MATCH_PROMPTS = ["Match each term to its meaning.", "Pair each stippling/composition term with its definition.", "Match each word to what it means in a still-life drawing.", "Connect each term to its correct meaning.", "For each term below, choose its matching meaning."] as const;
const STEPS_PROMPTS = ["Put these steps for a stippled still life in the correct order.", "Arrange the steps of composing a stippled still life.", "Order these steps, from first to last.", "Sort these composition steps into the correct sequence.", "Place these steps in the order you would follow them."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about stippling.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

export const stipplingDrawing: Skill = {
  id: "g6-cas-stippling-drawing",
  code: "C.2",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "Stippling drawing",
  description: "Identifying pictures drawn using the stippling technique, and drawing a still-life composition of two string instruments with emphasis on overlapping, balance of forms, and tone/texture.",
  generate(rng) {
    const branch = randChoice(rng, ["recognition", "density-scenario", "density-categorize", "term-match", "steps-order", "fill-blank"] as const);

    if (branch === "recognition") {
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "Stippling", [...OTHER_TECHNIQUES], 3);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, RECOGNITION_PROMPTS)} A drawing built up entirely from many small dots, denser in shadowed areas and sparser in lit areas.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "The technique is named after the small dots (stipples) it is built from.",
        explanation: "This describes stippling — building tone and texture from many small dots, rather than lines or continuous shading.",
      };
    }

    if (branch === "density-scenario") {
      const q = randChoice(rng, DENSITY_SCENARIOS)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Dense dots read as dark tone; sparse dots read as light tone.",
        explanation: q.explanation,
        visual: { type: "stipple-texture", density: randChoice(rng, ["light", "medium", "dark"] as const) },
      };
    }

    if (branch === "density-categorize") {
      const areas = [
        { id: "a1", label: "The shadowed underside of an instrument's body", density: "dark" },
        { id: "a2", label: "The brightly lit top edge of a neck", density: "light" },
        { id: "a3", label: "A mid-toned area partway between light and shadow", density: "medium" },
        { id: "a4", label: "The darkest crease where two overlapping shapes meet", density: "dark" },
        { id: "a5", label: "A highlight catching direct light on a curved surface", density: "light" },
        { id: "a6", label: "A softly shaded background area, neither bright nor dark", density: "medium" },
      ] as const;
      const items = areas.map((a) => ({ id: a.id, label: a.label }));
      const correctBucket: Record<string, string> = {};
      areas.forEach((a) => (correctBucket[a.id] = a.density));
      return {
        kind: "categorize",
        prompt: randChoice(rng, DENSITY_PROMPTS),
        items,
        buckets: [
          { id: "light", label: "Light density" },
          { id: "medium", label: "Medium density" },
          { id: "dark", label: "Dark density" },
        ],
        correctBucket,
        hint: "Shadows and creases need dense dots; highlights need sparse dots; in-between areas need a moderate density.",
        explanation: areas.map((a) => `"${a.label}" needs ${a.density} density.`).join(" "),
      };
    }

    if (branch === "term-match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each term describes in a stippled still-life drawing.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "steps-order") {
      const shuffled = shuffle(rng, STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Plan the composition first, then decide light and dots last.",
        explanation: "Correct order: " + STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    const t = randChoice(rng, TERMS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: t.blank.before,
      after: t.blank.after,
      correctAnswer: t.blank.correctAnswer,
      acceptedAnswers: t.blank.acceptedAnswers ?? [t.blank.correctAnswer],
      inputMode: "text",
      hint: "Think about stippling, overlapping, balance of forms, tone, and texture.",
      explanation: `${t.label}: ${t.meaning}.`,
    };
  },
};
