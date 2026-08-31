import { randChoice, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, g6SsPlace, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const CLAN_FUNCTIONS = [
  { id: "identity", label: "Giving identity", description: "gives its members a shared sense of who they are and where they belong" },
  { id: "support", label: "Mutual support", description: "provides members with social and economic help in times of need" },
  { id: "marriage", label: "Regulating marriage", description: "guides who may marry whom, since members traditionally marry outside their own clan" },
  { id: "dispute", label: "Resolving disputes", description: "helps settle disagreements between its members peacefully" },
  { id: "land", label: "Land stewardship", description: "helps look after shared land and resources for its members" },
] as const;

const AGE_SET_ROLES = [
  { role: "Children", detail: "learn skills and values from older members of the community before being initiated" },
  { role: "Newly initiated members", detail: "are welcomed into an age-set together and begin taking on early responsibilities" },
  { role: "Young adults", detail: "take on active duties such as defending or providing for the community" },
  { role: "Elders", detail: "take on the role of advising, guiding, and making decisions for the community" },
] as const;

function clanFunctionMc(rng: () => number): ScenarioMC {
  const f = randChoice(rng, CLAN_FUNCTIONS);
  const others = shuffle(rng, CLAN_FUNCTIONS.filter((o) => o.id !== f.id)).slice(0, 3);
  const place = g6SsPlace(rng);
  return {
    prompt: `In traditional African society near ${place}, a clan ${f.description}. Which function of a clan does this describe?`,
    correct: f.label,
    wrong: others.map((o) => o.label),
    explanation: `A clan's function of "${f.label.toLowerCase()}" means it ${f.description}.`,
  };
}

function ageSetMc(rng: () => number): ScenarioMC {
  const a = randChoice(rng, AGE_SET_ROLES);
  const others = shuffle(rng, AGE_SET_ROLES.filter((o) => o.role !== a.role)).slice(0, 3);
  return {
    prompt: `In an age-set system, which group ${a.detail}?`,
    correct: a.role,
    wrong: others.map((o) => o.role),
    explanation: `${a.role} ${a.detail}.`,
  };
}

export const cultureAndSocialOrganisation: Skill = {
  id: "g6-ss-ppl-culture-and-social-organisation",
  code: "P.3",
  subjectId: "social-studies",
  strandId: "g6-ss-people",
  grade: 6,
  title: "Culture and social organisation",
  description: "Age-groups and age-sets, the functions of a clan, and aspects of African traditional culture worth preserving.",
  generate(rng) {
    const branch = randChoice(rng, ["clan-mc", "ageset-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "clan-mc" || branch === "ageset-mc") {
      const q = branch === "clan-mc" ? clanFunctionMc(rng) : ageSetMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about what role a clan or an age-group plays in traditional society.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "A group of people initiated into adulthood around the same time, who move through life stages together, forms an age-", after: ".", correct: "set" }),
        () => ({ before: "In traditional African society, elders are usually responsible for advising and making", after: "for the community.", correct: "decisions" }),
        () => ({ before: `${name} learns that a clan's members traditionally marry outside their own clan, a practice that regulates`, after: ".", correct: "marriage" }),
        () => ({ before: "A clan gives its members a shared sense of", after: ", showing who they are and where they belong.", correct: "identity" }),
        () => ({ before: "When clan members help each other in times of need, this shows the clan's role of mutual", after: ".", correct: "support" }),
        () => ({ before: "A clan can help settle disagreements between its own members, a role called resolving", after: ".", correct: "disputes" }),
        () => ({ before: "Proverbs, oral history, and traditional ceremonies are examples of aspects of culture worth", after: ".", correct: "preserving" }),
        () => ({ before: "Passing on knowledge from elders to younger generations helps keep traditional culture", after: ".", correct: "alive" }),
        () => ({ before: "A community's respect for its elders' wisdom and experience is a positive cultural", after: "worth upholding.", correct: "value" }),
        () => ({ before: "Cooperating and working together as a community, sometimes called communal cooperation, is a traditional", after: "worth preserving.", correct: "value" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about culture and social organisation.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall what age-sets and clans are for.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...CLAN_FUNCTIONS]);
      const tokens = chosen.map((f) => ({ id: f.id, label: f.label }));
      const targets = shuffle(rng, chosen).map((f) => ({ id: f.id, label: `A clan ${f.description}` }));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each function of a clan to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Think about identity, support, marriage, disputes, and land.",
        explanation: chosen.map((f) => `${f.label}: a clan ${f.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      // Evaluate branch — "identify aspects of African traditional culture that ought to be preserved" is an
      // affective/evaluative outcome, so this branch requires judging whether a described item is a cultural
      // value worth preserving, not bare recall.
      const items = [
        { id: "c1", label: "Elders passing down proverbs and oral history to younger generations", bucket: "preserve" },
        { id: "c2", label: "A community coming together to help a family rebuild after a hardship (harambee spirit)", bucket: "preserve" },
        { id: "c3", label: "Respecting the wisdom and guidance of elders when making community decisions", bucket: "preserve" },
        { id: "c4", label: "Traditional dances and ceremonies that mark important community occasions", bucket: "preserve" },
        { id: "c5", label: "Choosing a phone's screen brightness setting", bucket: "not-a-cultural-practice" },
        { id: "c6", label: "Deciding which bus route to take to school", bucket: "not-a-cultural-practice" },
        { id: "c7", label: "A shop's opening and closing hours", bucket: "not-a-cultural-practice" },
      ] as const;
      const chosen = shuffle(rng, items).slice(0, 6);
      const it = chosen.map((c) => ({ id: c.id, label: c.label }));
      const buckets = [
        { id: "preserve", label: "A traditional cultural value worth preserving" },
        { id: "not-a-cultural-practice", label: "Not a traditional cultural practice" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c) => (correctBucket[c.id] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Decide whether each description is a traditional cultural value worth preserving.",
        items: it,
        buckets,
        correctBucket,
        hint: "A cultural value worth preserving connects people, passes down knowledge, or strengthens community bonds.",
        explanation: chosen.map((c) => `"${c.label}" is ${c.bucket === "preserve" ? "a traditional cultural value worth preserving" : "not a traditional cultural practice"}.`).join(" "),
      };
    }

    // ordering — the genuine life-stage progression through an age-set system.
    const items = shuffle(rng, AGE_SET_ROLES.map((a) => ({ id: a.role, label: `${a.role}: ${a.detail}` })));
    return {
      kind: "ordering",
      prompt: "Arrange these life stages of an age-set system in the correct order, from earliest to latest.",
      items,
      correctOrder: AGE_SET_ROLES.map((a) => a.role),
      instruction: "Earliest stage first.",
      hint: "A person is a child before being initiated, and becomes an elder only after passing through the earlier stages.",
      explanation: `The typical progression is: ${AGE_SET_ROLES.map((a) => a.role).join(" → ")}.`,
    };
  },
};
