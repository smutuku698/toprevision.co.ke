import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, name, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "The Built Environments" — a closed list of exactly
// 4 named categories (Museums, Monuments, Cultural centres, Historical buildings). Conservation actions are
// standard, age-appropriate practices consistent with this scope.

type CategoryId = "museum" | "monument" | "cultural-centre" | "historical-building";

interface Category {
  id: CategoryId;
  label: string;
  purpose: string;
  example: string;
}

const CATEGORIES: readonly Category[] = [
  { id: "museum", label: "Museums", purpose: "preserve artefacts and objects from the past so people can learn about history", example: "a building displaying old tools, pottery and clothing from long ago" },
  { id: "monument", label: "Monuments", purpose: "commemorate an important person or event so it is remembered", example: "a statue or structure built to honour a national hero" },
  { id: "cultural-centre", label: "Cultural centres", purpose: "showcase living traditions, dances, crafts and customs of a community", example: "a place where visitors watch traditional dances and see local crafts being made" },
  { id: "historical-building", label: "Historical buildings", purpose: "show the architecture and history of an earlier time, still standing today", example: "an old fort, church or house built many years ago that still stands" },
] as const;

const CONSERVE_ACTIONS = [
  { id: "c1", label: "Avoiding littering around a historical site", helps: true },
  { id: "c2", label: "Visiting and supporting local museums and monuments", helps: true },
  { id: "c3", label: "Reporting damage to the relevant authorities", helps: true },
  { id: "c4", label: "Teaching others why a heritage site is important", helps: true },
  { id: "c5", label: "Following the guide's rules when visiting a cultural centre", helps: true },
  { id: "c6", label: "Writing graffiti on the walls of a historical building", helps: false },
  { id: "c7", label: "Removing artefacts from a museum to keep at home", helps: false },
  { id: "c8", label: "Damaging a monument while playing nearby", helps: false },
  { id: "c9", label: "Ignoring signs warning visitors not to touch exhibits", helps: false },
  { id: "c10", label: "Dumping waste near a historic building", helps: false },
] as const;

const VISIT_STEPS = [
  { id: "v1", label: "Plan the visit and get permission" },
  { id: "v2", label: "Travel to the site" },
  { id: "v3", label: "Observe and learn from what is there" },
  { id: "v4", label: "Write a report or share findings with the class" },
] as const;

export const theBuiltEnvironments: Skill = {
  id: "g5-ss-env-the-built-environments",
  code: "E.5",
  subjectId: "social-studies",
  strandId: "g5-ss-environments",
  grade: 5,
  title: "The Built Environments",
  description: "Identifying museums, monuments, cultural centres and historical buildings, and how to help conserve them.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const c = randChoice(rng, CATEGORIES);
      const others = shuffle(rng, CATEGORIES.filter((o) => o.id !== c.id)).slice(0, 3);
      const choices = shuffle(rng, [c.label, ...others.map((o) => o.label)]);
      return {
        kind: "multiple-choice",
        prompt: identifyPrompt(rng, `built environment: ${c.example}`),
        choices,
        correctIndex: choices.indexOf(c.label),
        hint: "Think about whether it preserves objects, honours a person/event, showcases living traditions, or is an old standing building.",
        explanation: `${c.example.charAt(0).toUpperCase() + c.example.slice(1)} is an example of ${c.label.toLowerCase()}, which ${c.purpose}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...CATEGORIES]);
      const tokens = chosen.map((c) => ({ id: c.id, label: c.label }));
      const targets = shuffle(rng, chosen).map((c) => ({ id: c.id, label: c.purpose.charAt(0).toUpperCase() + c.purpose.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "type of built environment to its purpose"),
        tokens,
        targets,
        correctMap,
        hint: "Each of the four categories serves a different purpose.",
        explanation: chosen.map((c) => `${c.label} ${c.purpose}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...CONSERVE_ACTIONS]).slice(0, 6);
      const items = chosen.map((a) => ({ id: a.id, label: a.label }));
      const buckets = [
        { id: "helps", label: "Helps conserve it" },
        { id: "harms", label: "Harms/damages it" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a) => (correctBucket[a.id] = a.helps ? "helps" : "harms"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it helps conserve or harms a historic built environment"),
        items,
        buckets,
        correctBucket,
        hint: "Actions that protect, respect or report problems help conserve; actions that damage or remove things harm.",
        explanation: chosen.map((a) => `"${a.label}" ${a.helps ? "helps conserve" : "harms"} a historic built environment.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const n = name(rng);
      const templates = [
        () => ({ before: "A building that preserves artefacts and objects from the past for people to learn about is called a", after: ".", correct: "museum" }),
        () => ({ before: "A statue or structure built to honour an important person or event is called a", after: ".", correct: "monument" }),
        () => ({ before: "A place that showcases living traditions, dances and crafts of a community is called a", after: ".", correct: "cultural centre" }),
        () => ({ before: "An old fort, church or house still standing today is an example of a", after: ".", correct: "historical building" }),
        () => ({ before: `${n} visits an old building displaying tools and pottery from long ago — this is a`, after: ".", correct: "museum" }),
        () => ({ before: "One way to help conserve a historic site is to avoid", after: "around it.", correct: "littering" }),
        () => ({ before: "If you see damage at a heritage site, you should", after: "it to the relevant authorities.", correct: "report" }),
        () => ({ before: "Teaching others why a heritage site matters helps", after: "it for the future.", correct: "conserve" }),
        () => ({ before: "Writing on the walls of a historical building, called", after: ", damages it.", correct: "graffiti" }),
        () => ({ before: `${n} watches traditional dances and sees crafts being made at a`, after: ".", correct: "cultural centre" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the four categories of built environment and how to conserve them.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    // ordering — steps of a class visit to a historic built environment.
    const items = shuffle(rng, VISIT_STEPS).map((v) => ({ id: v.id, label: v.label }));
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "the steps of a class visit to a historic built environment"),
      items,
      correctOrder: VISIT_STEPS.map((v) => v.id),
      instruction: "First step first.",
      hint: "Plan before you travel, and observe before you can report on what you found.",
      explanation: `A sensible order for a class visit: ${VISIT_STEPS.map((v) => v.label).join(" → ")}.`,
    };
  },
};
