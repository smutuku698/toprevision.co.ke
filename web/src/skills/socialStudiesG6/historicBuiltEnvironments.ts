import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

type SiteType = "museum" | "monument" | "historical building";

interface Site {
  name: string;
  type: SiteType;
  detail: string;
}

const SITES: readonly Site[] = [
  { name: "the Nairobi National Museum", type: "museum", detail: "houses collections on Kenya's culture, natural history, and archaeology" },
  { name: "the Kisumu Museum", type: "museum", detail: "displays exhibits on the culture and history of communities around Lake Victoria" },
  { name: "the Karen Blixen Museum", type: "museum", detail: "preserves the former farmhouse and grounds of a well-known coffee farm from the colonial era" },
  { name: "the Dedan Kimathi Statue", type: "monument", detail: "honours a leader of Kenya's struggle for independence" },
  { name: "the Uhuru Gardens Monument", type: "monument", detail: "marks the spot where Kenya's independence flag was first raised" },
  { name: "Fort Jesus", type: "historical building", detail: "a fortress built at the Mombasa coast in the 1590s to guard the harbour" },
  { name: "the Gedi Ruins", type: "historical building", detail: "the remains of a Swahili coastal town occupied for several centuries before being abandoned" },
] as const;

const IMPORTANCE = [
  "preserving a record of the past for future generations to learn from",
  "attracting tourists, which brings income into the local economy",
  "strengthening people's sense of national and cultural identity",
  "providing evidence historians and archaeologists use to understand earlier societies",
] as const;

const CONSERVATION: Record<SiteType, string> = {
  museum: "carefully storing and displaying items so they are not damaged by light, heat, or handling",
  monument: "regularly cleaning and repairing the structure so weather does not wear it away",
  "historical building": "restoring damaged walls and structures while keeping the original building materials and design",
};

function importanceMc(rng: () => number): ScenarioMC {
  const correct = randChoice(rng, IMPORTANCE);
  const wrong = ["Replacing the site with a new, modern building", "Charging visitors so much that nobody can ever visit", "Removing all information about who built the site"];
  const name = g6SsName(rng);
  const place = g6SsPlace(rng);
  const prompts = [
    `Why is it important to conserve historic built environments such as museums and monuments?`,
    `${name}, who lives near ${place}, is asked why historic sites matter. What is the best answer?`,
  ];
  return { prompt: randChoice(rng, prompts), correct, wrong, explanation: `Historic built environments matter because of ${correct}.` };
}

function typeMc(rng: () => number): ScenarioMC {
  const site = randChoice(rng, SITES);
  const wrongTypes = (["museum", "monument", "historical building"] as SiteType[]).filter((t) => t !== site.type);
  const label = (t: SiteType) => (t === "historical building" ? "A historical building" : t === "museum" ? "A museum" : "A monument");
  return {
    prompt: `${site.name.replace(/^the /, "")} ${site.detail}. What type of historic built environment is it?`,
    correct: label(site.type),
    wrong: wrongTypes.map(label),
    explanation: `${site.name} is classified as ${label(site.type).toLowerCase()}.`,
  };
}

function conservationMc(rng: () => number): ScenarioMC {
  const site = randChoice(rng, SITES);
  const correctMethod = CONSERVATION[site.type];
  const otherTypes = (["museum", "monument", "historical building"] as SiteType[]).filter((t) => t !== site.type);
  return {
    prompt: `What is the best way to conserve a site like ${site.name}, given that it is ${site.type === "historical building" ? "a historical building" : `a ${site.type}`}?`,
    correct: correctMethod.charAt(0).toUpperCase() + correctMethod.slice(1),
    wrong: otherTypes.map((t) => CONSERVATION[t].charAt(0).toUpperCase() + CONSERVATION[t].slice(1)),
    explanation: `${site.name} is best conserved by ${correctMethod}, since it is ${site.type === "historical building" ? "a historical building" : `a ${site.type}`}.`,
  };
}

export const historicBuiltEnvironments: Skill = {
  id: "g6-ss-env-historic-built-environments",
  code: "E.5",
  subjectId: "social-studies",
  strandId: "g6-ss-environments",
  grade: 6,
  title: "Historic built environments in Eastern Africa",
  description: "Identifying museums, monuments, and historical buildings in Eastern Africa, their importance, and how to conserve them.",
  generate(rng) {
    const branch = randChoice(rng, ["importance-mc", "type-mc", "conservation-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "importance-mc" || branch === "type-mc" || branch === "conservation-mc") {
      const q = branch === "importance-mc" ? importanceMc(rng) : branch === "type-mc" ? typeMc(rng) : conservationMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about whether the answer preserves the past or destroys it, and whether the site displays items, honours a person/event, or is itself an old structure.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "A place that stores and displays collections about culture and history, such as the Nairobi National Museum, is a", after: ".", correct: "museum" }),
        () => ({ before: "A statue or structure built to honour a person or event, such as the Dedan Kimathi Statue, is a", after: ".", correct: "monument" }),
        () => ({ before: `${name} visits Fort Jesus, which is an example of a`, after: "because it is itself an old structure that has survived from the past.", correct: "historical building" }),
        () => ({ before: "The Gedi Ruins are the remains of an old Swahili coastal", after: ".", correct: "town" }),
        () => ({ before: "Fort Jesus was built at the Mombasa coast in the", after: "to guard the harbour.", correct: "1590s" }),
        () => ({ before: "Historic built environments are explicitly grouped into three categories: museums, monuments, and historical", after: ".", correct: "buildings" }),
        () => ({ before: "Preserving historic sites helps historians understand", after: "societies.", correct: "earlier" }),
        () => ({ before: "Visiting historic sites and creating a cultural corner in school helps preserve", after: ".", correct: "culture" }),
        () => ({ before: "Historic sites can bring income into the local economy by attracting", after: ".", correct: "tourists" }),
        () => ({ before: "Restoring a historical building means repairing it while keeping its original", after: "and materials.", correct: "design" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about historic built environments in Eastern Africa.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the three categories: museums, monuments, and historical buildings.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...SITES]).slice(0, 6);
      const tokens = chosen.map((s, i) => ({ id: `s${i}`, label: s.name }));
      const targets = shuffle(rng, chosen).map((s) => ({ id: `s${chosen.indexOf(s)}`, label: s.detail.charAt(0).toUpperCase() + s.detail.slice(1) }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`s${i}`] = `s${i}`));
      return {
        kind: "click-match",
        prompt: "Match each historic site to what it is known for.",
        tokens,
        targets,
        correctMap,
        hint: "Read what each site displays, honours, or represents.",
        explanation: chosen.map((s) => `${s.name}: ${s.detail}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...SITES]).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `it${i}`, label: s.name }));
      const bucketTypes = Array.from(new Set(chosen.map((s) => s.type)));
      const label = (t: SiteType) => (t === "historical building" ? "Historical building" : t === "museum" ? "Museum" : "Monument");
      const buckets = bucketTypes.map((t) => ({ id: t, label: label(t) }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`it${i}`] = s.type));
      return {
        kind: "categorize",
        prompt: "Sort each site into museum, monument, or historical building.",
        items,
        buckets,
        correctBucket,
        hint: "A museum displays items; a monument honours a person or event; a historical building is itself an old structure.",
        explanation: chosen.map((s) => `${s.name} is a ${s.type}.`).join(" "),
      };
    }

    // ordering — a general, defensible conservation process sequence.
    const steps = [
      { id: "s1", label: "Document the site's current condition" },
      { id: "s2", label: "Repair or restore any damaged parts" },
      { id: "s3", label: "Give the site legal heritage protection" },
      { id: "s4", label: "Educate the community and visitors about its importance" },
    ];
    return {
      kind: "ordering",
      prompt: "Arrange these steps in a sensible order for conserving a historic built environment.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      instruction: "First step first.",
      hint: "You need to know a site's condition before you can repair it, and it should be protected before you can safely educate visitors about it.",
      explanation: "A sensible conservation order is: document the site's condition, repair damage, secure legal protection, then educate the community and visitors.",
    };
  },
};
