import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

interface CountryFact {
  country: string;
  status: "landlocked" | "coastal";
  hemisphere: "north" | "south" | "both";
  size: "largest" | "smallest" | "mid";
  fact: string;
}

const COUNTRIES: readonly CountryFact[] = [
  { country: "Kenya", status: "coastal", hemisphere: "both", size: "mid", fact: "the Equator passes through Kenya, and Kenya has a coastline on the Indian Ocean" },
  { country: "Uganda", status: "landlocked", hemisphere: "both", size: "mid", fact: "Uganda is landlocked and borders Lake Victoria, Africa's largest lake" },
  { country: "Tanzania", status: "coastal", hemisphere: "south", size: "largest", fact: "Tanzania is the largest of the eight Eastern African countries by land area and lies entirely south of the Equator" },
  { country: "Rwanda", status: "landlocked", hemisphere: "south", size: "smallest", fact: "Rwanda is landlocked and one of the smallest of the eight countries, known as the 'land of a thousand hills'" },
  { country: "Burundi", status: "landlocked", hemisphere: "south", size: "smallest", fact: "Burundi is landlocked, one of the smallest of the eight countries, and borders Lake Tanganyika" },
  { country: "South Sudan", status: "landlocked", hemisphere: "north", size: "mid", fact: "South Sudan is landlocked and lies north of the Equator" },
  { country: "Somalia", status: "coastal", hemisphere: "both", size: "mid", fact: "Somalia has the longest coastline of any mainland African country" },
  { country: "Ethiopia", status: "landlocked", hemisphere: "north", size: "mid", fact: "Ethiopia is landlocked and lies almost entirely north of the Equator, on a high plateau" },
] as const;

const LANDLOCKED = COUNTRIES.filter((c) => c.status === "landlocked");
const COASTAL = COUNTRIES.filter((c) => c.status === "coastal");

function statusMc(rng: () => number): ScenarioMC {
  const wantLandlocked = rng() > 0.5;
  const pool = wantLandlocked ? LANDLOCKED : COASTAL;
  const target = randChoice(rng, pool);
  const wrongPool = wantLandlocked ? COASTAL : LANDLOCKED;
  const prompts = [
    `Which of these Eastern African countries is ${wantLandlocked ? "landlocked (has no coastline)" : "coastal (has a coastline)"}?`,
    `A learner is describing Eastern African countries by their access to the sea. Which country ${wantLandlocked ? "has no direct access to the sea" : "has direct access to the sea"}?`,
    `Which country in the list ${wantLandlocked ? "is completely surrounded by land, with no coastline" : "borders an ocean"}?`,
  ];
  return {
    prompt: randChoice(rng, prompts),
    correct: target.country,
    wrong: shuffle(rng, wrongPool.map((c) => c.country)).slice(0, 3),
    explanation: `${target.country} is ${target.status === "landlocked" ? "landlocked" : "coastal"} — ${target.fact}.`,
  };
}

function sizeMc(rng: () => number): ScenarioMC {
  const wantLargest = rng() > 0.5;
  const target = wantLargest ? COUNTRIES.find((c) => c.size === "largest")! : randChoice(rng, COUNTRIES.filter((c) => c.size === "smallest"));
  const others = shuffle(rng, COUNTRIES.filter((c) => c.country !== target.country).map((c) => c.country)).slice(0, 3);
  return {
    prompt: wantLargest
      ? "Which of these eight Eastern African countries has the largest land area?"
      : "Which of these eight Eastern African countries is one of the smallest by land area?",
    correct: target.country,
    wrong: others,
    explanation: `${target.fact}.`,
  };
}

function equatorMc(rng: () => number): ScenarioMC {
  const options = [
    { correct: "Kenya", note: "the Equator (0° latitude) runs directly through central Kenya" },
    { correct: "Tanzania", note: "Tanzania lies entirely south of the Equator" },
    { correct: "Ethiopia", note: "Ethiopia lies almost entirely north of the Equator" },
  ];
  const chosen = randChoice(rng, options);
  const templates = [
    `Which country does the Equator (0° latitude) pass directly through?`,
    `A ship captain sailing along 0° latitude near Eastern Africa would cross which country?`,
  ];
  if (chosen.correct === "Kenya") {
    return { prompt: randChoice(rng, templates), correct: "Kenya", wrong: ["Rwanda", "South Sudan", "Somalia"], explanation: chosen.note + "." };
  }
  return {
    prompt: `Which statement about latitude is correct?`,
    correct: `${chosen.correct} lies ${chosen.correct === "Tanzania" ? "south" : "north"} of the Equator`,
    wrong: [
      `${chosen.correct} lies exactly on the Equator`,
      `${chosen.correct} lies ${chosen.correct === "Tanzania" ? "north" : "south"} of the Equator`,
      `Latitude cannot be used to describe ${chosen.correct}'s position`,
    ],
    explanation: chosen.note + ".",
  };
}

const SIZE_ORDER = ["Tanzania", "Kenya", "Ethiopia", "Somalia", "Uganda", "South Sudan", "Burundi", "Rwanda"] as const;

export const positionAndSize: Skill = {
  id: "g6-ss-env-position-and-size",
  code: "E.1",
  subjectId: "social-studies",
  strandId: "g6-ss-environments",
  grade: 6,
  title: "Position and size of countries in Eastern Africa",
  description: "Locating Eastern African countries, comparing their position and size, and using latitude to describe location.",
  generate(rng) {
    const branch = randChoice(rng, ["status-mc", "size-mc", "equator-mc", "fill-blank", "click-match", "categorize", "ordering"] as const);

    if (branch === "status-mc" || branch === "size-mc" || branch === "equator-mc") {
      const q = branch === "status-mc" ? statusMc(rng) : branch === "size-mc" ? sizeMc(rng) : equatorMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about whether the country touches the ocean, how large it is compared to its neighbours, or where it sits relative to the Equator.",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-blank") {
      const name = g6SsName(rng);
      const templates = [
        () => ({ before: "Tanzania is the", after: "of the eight Eastern African countries in this unit, by land area.", correct: "largest" }),
        () => ({ before: "Rwanda and Burundi are both landlocked and among the", after: "of the eight countries by land area.", correct: "smallest" }),
        () => ({ before: `${name} learns that Uganda has no coastline, which means Uganda is`, after: ".", correct: "landlocked" }),
        () => ({ before: "The imaginary line at 0° latitude that passes through Kenya is called the", after: ".", correct: "Equator" }),
        () => ({ before: "Somalia has the longest", after: "of any mainland African country.", correct: "coastline" }),
        () => ({ before: "A country with a border on the Indian Ocean, such as Kenya or Tanzania, is described as", after: ".", correct: "coastal" }),
        () => ({ before: "Ethiopia lies almost entirely to the", after: "of the Equator.", correct: "north" }),
        () => ({ before: "Tanzania lies almost entirely to the", after: "of the Equator.", correct: "south" }),
        () => ({ before: `${name} finds that South Sudan and Ethiopia share the fact that both are`, after: "(no direct access to the sea).", correct: "landlocked" }),
        () => ({ before: "Lines used to measure a location's position north or south of the Equator are called", after: ".", correct: "latitudes" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about Eastern Africa's countries.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall each country's position, size ranking, and coastline status.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...COUNTRIES]).slice(0, 6);
      const tokens = chosen.map((c) => ({ id: c.country, label: c.country }));
      const targets = shuffle(rng, chosen).map((c) => ({ id: c.country, label: c.fact.charAt(0).toUpperCase() + c.fact.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.country] = c.country;
      return {
        kind: "click-match",
        prompt: "Match each Eastern African country to a fact about its position or size.",
        tokens,
        targets,
        correctMap,
        hint: "Look for the country name mentioned or implied in each fact.",
        explanation: chosen.map((c) => `${c.country}: ${c.fact}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...COUNTRIES]).slice(0, 6);
      const items = chosen.map((c) => ({ id: c.country, label: c.country }));
      const buckets = [
        { id: "landlocked", label: "Landlocked (no coastline)" },
        { id: "coastal", label: "Coastal (has a coastline)" },
      ];
      const correctBucket: Record<string, string> = {};
      for (const c of chosen) correctBucket[c.country] = c.status;
      return {
        kind: "categorize",
        prompt: "Sort each Eastern African country as landlocked or coastal.",
        items,
        buckets,
        correctBucket,
        hint: "A landlocked country has no border touching the sea.",
        explanation: chosen.map((c) => `${c.country} is ${c.status}.`).join(" "),
      };
    }

    // ordering — largest to smallest by land area, a genuine sequence stated by the fact pool.
    const startIdx = randInt(rng, 0, 2);
    const slice = SIZE_ORDER.slice(startIdx, startIdx + 5);
    const items = shuffle(rng, slice).map((c) => ({ id: c, label: c }));
    return {
      kind: "ordering",
      prompt: "Arrange these Eastern African countries from largest to smallest by land area.",
      items,
      correctOrder: [...slice],
      instruction: "Largest first, smallest last.",
      hint: "Tanzania is the largest of the eight; Rwanda and Burundi are among the smallest.",
      explanation: `From largest to smallest: ${slice.join(", ")}.`,
    };
  },
};
