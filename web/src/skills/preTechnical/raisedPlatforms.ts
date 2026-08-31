import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PLATFORMS: { name: string; use: string }[] = [
  { name: "Ladder", use: "a portable set of rungs used to reach high places, like changing a bulb or painting a wall" },
  { name: "Trestle", use: "a frame used with a platform to create a raised, stable working surface" },
  { name: "Steps", use: "a short flight of raised levels used to reach objects slightly above normal reach" },
  { name: "Stand", use: "a fixed support that raises a person or object to a working height" },
  { name: "Mobile raised platform", use: "a wheeled platform that can be moved and raised to work at height" },
  { name: "Work bench", use: "a raised, sturdy table used for holding work while it is being made or repaired" },
  { name: "Ramp", use: "a sloped surface connecting two different height levels" },
];

export const raisedPlatforms: Skill = {
  id: "pt-f-raised-platforms",
  code: "F.1",
  subjectId: "pre-technical",
  strandId: "pt-foundations",
  grade: 9,
  title: "Types of raised platforms",
  description: "Match each type of raised platform to how it is used.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify"] as const);

    if (branch === "identify") {
      const pool = shuffle(rng, PLATFORMS);
      const correct = pool[0];
      const choices = shuffle(rng, pool.slice(0, 4).map((p) => p.name));

      return {
        kind: "multiple-choice",
        prompt: `Which raised platform is best described as ${correct.use}?`,
        choices,
        correctIndex: choices.indexOf(correct.name),
        layout: "list",
        hint: "Think about the shape and stability of each platform and what task it best suits.",
        explanation: `${correct.name} is ${correct.use}.`,
      };
    }

    const chosen = shuffle(rng, PLATFORMS).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.name })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.name, label: p.use })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.name] = p.name;

    return {
      kind: "click-match",
      prompt: "Match each raised platform to how it is used.",
      tokens,
      targets,
      correctMap,
      hint: "Think about the shape and stability of each platform and what task it best suits.",
      explanation: chosen.map((p) => `${p.name} — ${p.use}.`).join(" "),
    };
  },
};
