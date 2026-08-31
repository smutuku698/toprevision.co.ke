import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const NATIONAL = [
  "Foreign affairs and international relations",
  "National defence and the Kenya Defence Forces",
  "Immigration and citizenship",
  "National economic policy and planning",
  "Currency and monetary policy",
  "Universities and higher education policy",
];

const COUNTY = [
  "County health services and hospitals",
  "Local county roads and street lighting",
  "County agriculture and livestock extension services",
  "Early childhood education (pre-primary)",
  "County trade licensing and markets",
  "Refuse (garbage) collection and disposal",
];

const REASONS: { fn: string; level: "national" | "county"; reason: string }[] = [
  { fn: "Foreign affairs and international relations", level: "national", reason: "the whole country needs a single, consistent voice in dealing with other nations" },
  { fn: "National defence and the Kenya Defence Forces", level: "national", reason: "the safety and sovereignty of the entire country must be protected uniformly" },
  { fn: "Immigration and citizenship", level: "national", reason: "these are sovereign matters that must be handled consistently for the whole country" },
  { fn: "National economic policy and planning", level: "national", reason: "planning that affects the whole national economy needs central coordination" },
  { fn: "Currency and monetary policy", level: "national", reason: "one common national currency and monetary policy is used across the entire country" },
  { fn: "Universities and higher education policy", level: "national", reason: "national standards for higher education need to apply consistently across the country" },
  { fn: "County health services and hospitals", level: "county", reason: "healthcare needs vary locally and are best managed close to the community" },
  { fn: "Local county roads and street lighting", level: "county", reason: "everyday, local infrastructure is best managed by the government closest to residents" },
  { fn: "County agriculture and livestock extension services", level: "county", reason: "farming conditions vary by region, so support is best delivered locally" },
  { fn: "Early childhood education (pre-primary)", level: "county", reason: "pre-primary education is a local service best coordinated close to families" },
  { fn: "County trade licensing and markets", level: "county", reason: "local trade and markets are best regulated by the government closest to traders" },
  { fn: "Refuse (garbage) collection and disposal", level: "county", reason: "waste management is a daily, local service best handled by county government" },
] as const;

const DELIVERY_STEPS = [
  { id: "budget", label: "The County Assembly approves a budget allocation for the service" },
  { id: "plan", label: "The relevant County Executive Committee plans how to deliver it" },
  { id: "build", label: "Facilities or infrastructure are built and staffed" },
  { id: "operate", label: "The service opens and begins serving residents" },
  { id: "monitor", label: "The county monitors delivery and reports back to residents" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The transfer of power and resources from national government to county governments is called ", after: ".", correctAnswer: "devolution", accepted: ["devolution"], explanation: "Devolution is the transfer of power and resources from the national government to county governments." },
  { before: "The part of Kenya's Constitution that lists which functions belong to national and county governments is the ", after: " Schedule.", correctAnswer: "Fourth", accepted: ["fourth"], explanation: "The Fourth Schedule of the Constitution lists the functions assigned to national and county governments." },
  { before: "The elected leader of a county government's executive is the ", after: ".", correctAnswer: "Governor", accepted: ["governor"], explanation: "The Governor is the elected leader of a county government's executive arm." },
  { before: "The legislative organ that makes laws for a county is the county ", after: ".", correctAnswer: "assembly", accepted: ["assembly"], explanation: "The County Assembly is the legislative organ that makes laws for a county." },
  { before: "Functions that both national and county governments may be responsible for are called ", after: " functions.", correctAnswer: "concurrent", accepted: ["concurrent"], explanation: "Concurrent functions are those that both levels of government may be responsible for, requiring cooperation." },
] as const;

export const nationalCountyFunctions: Skill = {
  id: "ss-h-national-county",
  code: "H.2",
  subjectId: "social-studies",
  strandId: "ss-extra-practice",
  grade: 9,
  title: "National vs. county government functions",
  description: "Sort functions of government into national government and county government responsibilities.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "identify", "match", "fill-blank", "order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, REASONS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((r, i) => ({ id: `r${i}`, label: r.fn })));
      const targets = shuffle(rng, chosen.map((r, i) => ({ id: `r${i}`, label: r.reason.charAt(0).toUpperCase() + r.reason.slice(1) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((r, i) => (correctMap[`r${i}`] = `r${i}`));
      return {
        kind: "click-match",
        prompt: "Match each government function to why it is handled at that level.",
        tokens,
        targets,
        correctMap,
        hint: "National functions need one consistent approach for the whole country; county functions are best handled close to residents.",
        explanation: chosen.map((r) => `${r.fn} — ${r.reason}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about national and county government functions.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe Kenya's devolved system of government.",
        explanation: fb.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, DELIVERY_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps a county government follows to deliver a devolved service, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: DELIVERY_STEPS.map((s) => s.id),
        hint: "Budget approval comes first, then planning, then building and staffing, then opening, and finally ongoing monitoring.",
        explanation: DELIVERY_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "identify") {
      const askNational = rng() < 0.5;
      const correct = randChoice(rng, askNational ? NATIONAL : COUNTY);
      const distractors = shuffle(rng, askNational ? COUNTY : NATIONAL).slice(0, 3);
      const choices = shuffle(rng, [correct, ...distractors]);

      return {
        kind: "multiple-choice",
        prompt: `Which of these is a function of ${askNational ? "national" : "county"} government?`,
        choices,
        correctIndex: choices.indexOf(correct),
        hint: "County government handles local, everyday services; national government handles matters affecting the whole country.",
        explanation: `"${correct}" is a ${askNational ? "national" : "county"} government function.`,
      };
    }

    const national = shuffle(rng, NATIONAL).slice(0, 3);
    const county = shuffle(rng, COUNTY).slice(0, 3);
    const items = shuffle(rng, [
      ...national.map((label) => ({ id: label, label, bucket: "national" })),
      ...county.map((label) => ({ id: label, label, bucket: "county" })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Sort each function into National Government or County Government.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "national", label: "National Government" },
        { id: "county", label: "County Government" },
      ],
      correctBucket,
      hint: "County government handles local, everyday services; national government handles matters affecting the whole country.",
      explanation: `National government: ${national.join(" / ")}. County government: ${county.join(" / ")}.`,
    };
  },
};
