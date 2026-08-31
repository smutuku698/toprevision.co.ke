import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Wildlife and Tourism in Kenya" — 3 named
// categories (Wildlife, Historical Sites, Natural Sceneries), 5 named parks/reserves.
// See curriculum-reference/grade-5/social-studies.json.

const PARKS: { id: string; name: string; type: "PARK" | "RESERVE"; fact: string }[] = [
  { id: "nairobi", name: "Nairobi National Park", type: "PARK", fact: "a national park unique for being within sight of a capital city's skyline" },
  { id: "tsavo", name: "Tsavo National Park", type: "PARK", fact: "one of Kenya's largest national parks, known for its red-dust elephants" },
  { id: "amboseli", name: "Amboseli National Park", type: "PARK", fact: "a national park famous for views of Mount Kilimanjaro and large elephant herds" },
  { id: "maasaimara", name: "Masai Mara National Reserve", type: "RESERVE", fact: "a national reserve famous for the annual wildebeest migration" },
  { id: "kakamega", name: "Kakamega Forest National Reserve", type: "RESERVE", fact: "Kenya's only tropical rainforest, known for unique biodiversity" },
];

const BENEFITS = [
  "earns Kenya foreign exchange",
  "creates jobs for guides, hotel staff and rangers",
  "funds conservation of wildlife and habitats",
  "supports local communities near parks",
  "encourages the building of roads and infrastructure",
  "promotes Kenya's image internationally",
] as const;

export const wildlifeAndTourismInKenya: Skill = {
  id: "g5-ss-res-wildlife-and-tourism-in-kenya",
  code: "R.4",
  subjectId: "social-studies",
  strandId: "g5-ss-resources",
  grade: 5,
  title: "Wildlife and Tourism in Kenya",
  description: "Identifying Kenya's main game reserves and national parks, and the contribution of wildlife and tourism to the economy.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const p = randChoice(rng, PARKS);
      const choices = shuffle(rng, PARKS.map((x) => x.name));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "park or reserve")} It is ${p.fact}.`,
        choices,
        correctIndex: choices.indexOf(p.name),
        hint: "Think about which park or reserve matches this fact.",
        explanation: `${p.name} is ${p.fact}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, PARKS).slice(0, 4);
      const tokens = chosen.map((p) => ({ id: p.id, label: p.name }));
      const targets = shuffle(rng, chosen).map((p) => ({ id: p.id, label: p.fact.charAt(0).toUpperCase() + p.fact.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "park or reserve to a fact about it"),
        tokens,
        targets,
        correctMap,
        hint: "Recall a distinguishing fact about each park or reserve.",
        explanation: chosen.map((p) => `${p.name}: ${p.fact}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = PARKS.map((p) => ({ id: p.id, label: p.name }));
      const shuffled = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const p of PARKS) correctBucket[p.id] = p.type;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is officially a National Park or a National Reserve"),
        items: shuffled,
        buckets: [
          { id: "PARK", label: "National Park" },
          { id: "RESERVE", label: "National Reserve" },
        ],
        correctBucket,
        hint: "Nairobi, Tsavo and Amboseli are National Parks; Masai Mara and Kakamega Forest are National Reserves.",
        explanation: PARKS.map((p) => `${p.name} is a ${p.type === "PARK" ? "National Park" : "National Reserve"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const b = randChoice(rng, BENEFITS);
      const templates = [
        () => ({ before: "Kenya's only tropical rainforest, protected as a reserve, is", after: ".", correct: "Kakamega Forest National Reserve" }),
        () => ({ before: "The reserve famous for the annual wildebeest migration is", after: ".", correct: "Masai Mara National Reserve" }),
        () => ({ before: "A national park famous for views of Mount Kilimanjaro is", after: ".", correct: "Amboseli National Park" }),
        () => ({ before: `One way tourism benefits Kenya's economy is that it`, after: ".", correct: b }),
        () => ({ before: "Land set aside centrally to protect wildlife is called a national", after: ".", correct: "park" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the 5 parks/reserves and their distinguishing features.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "plan", label: "Get permission and plan the trip" },
      { id: "travel", label: "Travel to the park or reserve" },
      { id: "observe", label: "Observe wildlife with a guide" },
      { id: "report", label: "Write a report on what was learned" },
    ]);
    const correctOrder = ["plan", "travel", "observe", "report"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps of a school trip to a national park"),
      instruction: "Arrange the steps in the order they would happen.",
      items: steps,
      correctOrder,
      hint: "It starts with planning and ends with writing a report.",
      explanation: "A school trip: plan and get permission, travel there, observe wildlife with a guide, then write a report.",
    };
  },
};
