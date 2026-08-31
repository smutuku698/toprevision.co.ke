import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Language Groups in Kenya" — 3 named groups
// (Nilotes, Bantu, Cushites). Example communities are standard, well-known Kenyan geography/civics
// knowledge consistent with this sub-strand's scope. See curriculum-reference/grade-5/social-studies.json.

type Group = "Bantu" | "Nilotes" | "Cushites";

const COMMUNITIES: { community: string; group: Group }[] = [
  { community: "Kikuyu", group: "Bantu" },
  { community: "Luhya", group: "Bantu" },
  { community: "Kamba", group: "Bantu" },
  { community: "Meru", group: "Bantu" },
  { community: "Mijikenda", group: "Bantu" },
  { community: "Luo", group: "Nilotes" },
  { community: "Kalenjin", group: "Nilotes" },
  { community: "Maasai", group: "Nilotes" },
  { community: "Turkana", group: "Nilotes" },
  { community: "Samburu", group: "Nilotes" },
  { community: "Somali", group: "Cushites" },
  { community: "Borana", group: "Cushites" },
  { community: "Rendille", group: "Cushites" },
  { community: "Orma", group: "Cushites" },
];

const GROUP_FACTS: Record<Group, string> = {
  Bantu: "the largest language group in Kenya by number of communities",
  Nilotes: "a language group that includes pastoralist and agro-pastoralist communities across Kenya",
  Cushites: "a language group found mainly in north-eastern Kenya",
};

export const languageGroupsInKenya: Skill = {
  id: "g5-ss-people-language-groups-in-kenya",
  code: "P.1",
  subjectId: "social-studies",
  strandId: "g5-ss-people",
  grade: 5,
  title: "Language Groups in Kenya",
  description: "Identifying Kenya's three main language groups — Bantu, Nilotes, Cushites — and the benefits of their interdependence.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const c = randChoice(rng, COMMUNITIES);
      const groups: Group[] = ["Bantu", "Nilotes", "Cushites"];
      const choices = shuffle(rng, groups);
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "language group")} Community: "${c.community}".`,
        choices,
        correctIndex: choices.indexOf(c.group),
        hint: `${c.group} is ${GROUP_FACTS[c.group]}.`,
        explanation: `The ${c.community} belong to the ${c.group} language group.`,
      };
    }

    if (branch === "click-match") {
      const groups: Group[] = ["Bantu", "Nilotes", "Cushites"];
      const chosen = groups.map((g) => randChoice(rng, COMMUNITIES.filter((c) => c.group === g)));
      const tokens = chosen.map((c) => ({ id: c.group, label: c.community }));
      const targets = shuffle(rng, chosen).map((c) => ({ id: c.group, label: c.group }));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.group] = c.group;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "community to its language group"),
        tokens,
        targets,
        correctMap,
        hint: "Recall which group each example community belongs to.",
        explanation: chosen.map((c) => `The ${c.community} belong to the ${c.group} language group.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const bantu = shuffle(rng, COMMUNITIES.filter((c) => c.group === "Bantu")).slice(0, 3);
      const nilotes = shuffle(rng, COMMUNITIES.filter((c) => c.group === "Nilotes")).slice(0, 3);
      const cushites = shuffle(rng, COMMUNITIES.filter((c) => c.group === "Cushites")).slice(0, 3);
      const items = shuffle(rng, [...bantu, ...nilotes, ...cushites]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.community] = item.group;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which language group each community belongs to"),
        items: items.map((c) => ({ id: c.community, label: c.community })),
        buckets: [
          { id: "Bantu", label: "Bantu" },
          { id: "Nilotes", label: "Nilotes" },
          { id: "Cushites", label: "Cushites" },
        ],
        correctBucket,
        hint: "Recall the example communities for each language group.",
        explanation: items.map((c) => `The ${c.community} belong to the ${c.group} language group.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const c = randChoice(rng, COMMUNITIES);
      const templates = [
        () => ({ before: `The ${c.community} belong to Kenya's`, after: "language group.", correct: c.group }),
        () => ({ before: "Kenya's largest language group by number of communities is the", after: ".", correct: "Bantu" }),
        () => ({ before: "Different language groups in Kenya depend on each other through trade and", after: ".", correct: "intermarriage" }),
        () => ({ before: "Language groups that share resources and skills show a benefit called", after: ".", correct: "interdependence" }),
        () => ({ before: "A language group found mainly in north-eastern Kenya is the", after: ".", correct: "Cushites" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the 3 language groups: Bantu, Nilotes, Cushites.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "meet", label: "Communities from different language groups meet" },
      { id: "trade", label: "They trade and share skills" },
      { id: "relate", label: "They build relationships through marriage and friendship" },
      { id: "benefit", label: "The whole nation benefits from their interdependence" },
    ]);
    const correctOrder = ["meet", "trade", "relate", "benefit"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps showing how interdependence between language groups benefits the nation"),
      instruction: "Arrange the steps in a sensible order.",
      items: steps,
      correctOrder,
      hint: "Interaction usually starts with meeting, and ends with shared national benefit.",
      explanation: "Communities meet, trade and share skills, build relationships, and the whole nation benefits.",
    };
  },
};
