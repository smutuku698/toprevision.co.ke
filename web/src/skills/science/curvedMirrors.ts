import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const USES: { use: string; mirror: "concave" | "convex" }[] = [
  { use: "Shaving or make-up mirror (magnifies a close-up face)", mirror: "concave" },
  { use: "Dentist's mouth mirror (magnifies teeth)", mirror: "concave" },
  { use: "Solar cooker/concentrator (focuses sunlight to a point)", mirror: "concave" },
  { use: "Car headlamp reflector (focuses light into a beam)", mirror: "concave" },
  { use: "Reflecting telescope mirror", mirror: "concave" },
  { use: "Supermarket security mirror (wide view of aisles)", mirror: "convex" },
  { use: "Car side/driving mirror (wide field of view)", mirror: "convex" },
];

const CHARACTERISTIC_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string; mirrorType: "concave" | "convex" | null }[] = [
  {
    prompt: "A convex mirror always forms what kind of image, no matter where the object is?",
    choices: ["Virtual, upright, and diminished (smaller)", "Real, inverted, and magnified", "Real, upright, and the same size", "Virtual, inverted, and magnified"],
    correctIndex: 0,
    explanation: "A convex mirror curves outward, so it always forms a virtual, upright, and smaller (diminished) image — that's why it gives such a wide field of view.",
    mirrorType: "convex",
  },
  {
    prompt: "When an object is placed very close to a concave mirror (between the mirror and its focal point), what kind of image forms?",
    choices: ["A magnified, upright, virtual image", "A diminished, inverted, real image", "No image forms at all", "A same-size, inverted image"],
    correctIndex: 0,
    explanation: "When the object is closer to a concave mirror than its focal point, the reflected rays diverge behind the mirror, forming a magnified, upright, virtual image — this is how a shaving mirror works.",
    mirrorType: "concave",
  },
  {
    prompt: "Why are convex mirrors used for car side mirrors instead of flat mirrors?",
    choices: ["They show a wider area behind the car in the same size mirror", "They make objects look closer than they really are", "They form real images that can be projected onto a screen", "They are cheaper to manufacture than flat mirrors"],
    correctIndex: 0,
    explanation: "A convex mirror's curve lets it capture a wider field of view than a flat mirror of the same size, helping the driver see more of the road behind.",
    mirrorType: "convex",
  },
  {
    prompt: "Besides concave and convex, which other curved mirror surface is used in devices like satellite dishes and some headlamp reflectors?",
    choices: ["Parabolic mirror", "Cylindrical mirror", "Elliptical mirror", "Spiral mirror"],
    correctIndex: 0,
    explanation: "A parabolic mirror surface precisely focuses parallel rays to a single point (or vice versa), making it ideal for satellite dishes, solar concentrators, and some headlamp reflectors.",
    mirrorType: null,
  },
  {
    prompt: "When an object is placed exactly at the centre of curvature (C) of a concave mirror, what image forms?",
    choices: ["A real, inverted image the same size as the object", "A virtual, upright, magnified image", "No image forms at that position", "A real image twice as large as the object"],
    correctIndex: 0,
    explanation: "An object placed exactly at the centre of curvature (C) produces a real, inverted image that is the same size, also located at C.",
    mirrorType: "concave",
  },
  {
    prompt: "When an object is placed exactly at the focal point (F) of a concave mirror, what happens to the reflected rays?",
    choices: ["They travel parallel to each other, so the image forms at infinity", "They converge exactly back at the object", "They form a virtual image behind the mirror", "No light reflects at all"],
    correctIndex: 0,
    explanation: "An object at the focal point produces reflected rays that travel parallel to one another, so the image effectively forms at infinity.",
    mirrorType: "concave",
  },
];

const IMAGE_TABLE: { position: string; description: string }[] = [
  { position: "Object at infinity", description: "Image forms at F — real, inverted, and highly diminished (point-sized)" },
  { position: "Object beyond C", description: "Image forms between F and C — real, inverted, and diminished" },
  { position: "Object at C", description: "Image forms at C — real, inverted, and the same size as the object" },
  { position: "Object between C and F", description: "Image forms beyond C — real, inverted, and magnified" },
  { position: "Object at F", description: "Reflected rays become parallel — image effectively forms at infinity" },
  { position: "Object between F and the mirror's pole (P)", description: "Image forms behind the mirror — virtual, upright, and magnified" },
];

const RAY_DIAGRAM_STEPS = [
  { id: "parallel", label: "Draw a ray from the object parallel to the principal axis; it reflects through the focal point (F)" },
  { id: "through-f", label: "Draw a ray from the object through the focal point (F); it reflects parallel to the principal axis" },
  { id: "through-c", label: "Draw a ray from the object through the centre of curvature (C); it reflects straight back along the same path" },
  { id: "mark", label: "Mark the point where the reflected rays cross (or appear to cross) — that is the position of the image" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A mirror that curves inward, like the inside of a spoon, is called a ", after: " mirror.", correctAnswer: "concave", accepted: ["concave"], explanation: "A concave mirror curves inward, like the inside of a spoon, and can magnify or focus light depending on object position.", mirrorType: "concave" },
  { before: "A mirror that curves outward, like the back of a spoon, is called a ", after: " mirror.", correctAnswer: "convex", accepted: ["convex"], explanation: "A convex mirror curves outward, like the back of a spoon, and always gives a wide, diminished view.", mirrorType: "convex" },
  { before: "The point where parallel rays converge (or appear to diverge from) after reflecting off a curved mirror is called the ", after: " point.", correctAnswer: "focal", accepted: ["focal"], explanation: "The focal point is where parallel rays converge (concave) or appear to diverge from (convex) after reflection.", mirrorType: "concave" },
  { before: "An image that can be projected onto a screen because light rays actually meet there is called a ", after: " image.", correctAnswer: "real", accepted: ["real"], explanation: "A real image forms where light rays actually meet, and can be projected onto a screen — unlike a virtual image.", mirrorType: "concave" },
  { before: "An image that cannot be projected onto a screen, because it only appears to form behind the mirror, is called a ", after: " image.", correctAnswer: "virtual", accepted: ["virtual"], explanation: "A virtual image only appears to form behind the mirror, where light rays do not actually meet, so it cannot be projected onto a screen.", mirrorType: "convex" },
  { before: "The straight line passing through the pole and the centre of curvature of a curved mirror is called the ", after: " axis.", correctAnswer: "principal", accepted: ["principal"], explanation: "The principal axis is the straight line passing through the pole and the centre of curvature of a curved mirror.", mirrorType: "concave" },
] as const;

export const curvedMirrors: Skill = {
  id: "sci-fe-curved-mirrors",
  code: "FE.1",
  subjectId: "science",
  strandId: "sci-fe",
  grade: 9,
  title: "Curved mirrors",
  description: "Concave and convex mirrors, their everyday uses, and the images they form.",
  generate(rng) {
    const branch = randChoice(rng, ["uses", "characteristics", "image-match", "fill-blank", "ray-order"] as const);

    if (branch === "image-match") {
      const chosen = shuffle(rng, IMAGE_TABLE).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.position, label: t.position })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.position, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.position] = t.position;
      return {
        kind: "click-match",
        prompt: "Match each object position in front of a concave mirror to the image it forms.",
        tokens,
        targets,
        correctMap,
        hint: "As the object moves closer to the mirror than the centre of curvature, the image grows larger; once inside the focal point, it becomes virtual and upright.",
        explanation: chosen.map((t) => `${t.position}: ${t.description}.`).join(" "),
        visual: { type: "curved-mirror-diagram", mirrorType: "concave" },
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about curved mirrors.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe curved mirrors and the images they form.",
        explanation: fb.explanation,
        visual: { type: "curved-mirror-diagram", mirrorType: fb.mirrorType },
      };
    }

    if (branch === "ray-order") {
      const items = shuffle(rng, RAY_DIAGRAM_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for drawing a ray diagram to locate the image formed by a concave mirror.",
        instruction: "Drag to reorder the ray-diagram steps in a sensible sequence.",
        items,
        correctOrder: RAY_DIAGRAM_STEPS.map((s) => s.id),
        hint: "Draw the principal rays first (parallel-to-F, through-F-to-parallel, through-C), then find where they cross.",
        explanation: RAY_DIAGRAM_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
        visual: { type: "curved-mirror-diagram", mirrorType: "concave" },
      };
    }

    if (branch === "uses") {
      const chosen = shuffle(rng, USES).slice(0, 5);
      const items = chosen.map((u, i) => ({ id: `u${i}`, label: u.use }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((u, i) => (correctBucket[`u${i}`] = u.mirror));

      return {
        kind: "categorize",
        prompt: "Sort each everyday use by which type of curved mirror it needs.",
        items,
        buckets: [
          { id: "concave", label: "Concave mirror" },
          { id: "convex", label: "Convex mirror" },
        ],
        correctBucket,
        hint: "Concave mirrors magnify close objects and focus light to a point; convex mirrors give a wide field of view.",
        explanation: chosen.map((u) => `${u.use} uses a ${u.mirror} mirror.`).join(" "),
      };
    }

    const q = randChoice(rng, CHARACTERISTIC_QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about how object position relative to F and C changes the size and type of image formed.",
      explanation: q.explanation,
      visual: q.mirrorType ? { type: "curved-mirror-diagram", mirrorType: q.mirrorType } : undefined,
    };
  },
};
