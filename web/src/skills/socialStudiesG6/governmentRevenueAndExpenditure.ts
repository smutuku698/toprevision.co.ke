import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildScenarioChoices, g6SsName, type ScenarioMC } from "@/skills/socialStudiesG6/g6SsShared";
import type { Skill } from "@/lib/types";

const REVENUE_SOURCES = [
  { name: "Income tax (PAYE)", description: "a tax deducted from the salaries and wages that employees earn" },
  { name: "Value Added Tax (VAT)", description: "a tax added to the price of most goods and services people buy" },
  { name: "Customs duty", description: "a tax charged on goods imported into the country from abroad" },
  { name: "Excise duty", description: "a tax charged on specific goods such as fuel, alcohol, and cigarettes" },
  { name: "Licences and permits", description: "fees charged for permission to operate a business or activity" },
] as const;

const EXPENDITURE = [
  { item: "Building and maintaining national highways such as the SGR", level: "national" },
  { item: "Funding the country's defence forces", level: "national" },
  { item: "Managing the country's foreign affairs and embassies", level: "national" },
  { item: "Maintaining local roads within a county", level: "county" },
  { item: "Running county-level health facilities and clinics", level: "county" },
  { item: "Managing local markets within a county", level: "county" },
  { item: "Funding county water projects", level: "county" },
] as const;

function makeBudgetData(rng: () => number) {
  const education = randInt(rng, 20, 30);
  const health = randInt(rng, 12, 20);
  const infrastructure = randInt(rng, 15, 25);
  const security = randInt(rng, 8, 15);
  const other = Math.max(100 - education - health - infrastructure - security, 5);
  // Overlapping randInt ranges can coincidentally produce equal percentages across sectors, which would
  // make two multiple-choice options read identically (e.g. "22%" and "22%") — nudge any duplicate up by
  // 1 until every value is distinct, keeping the chart honest without materially changing the proportions.
  const seen = new Set<number>();
  const values = [education, health, infrastructure, security, other].map((v) => {
    let x = v;
    while (seen.has(x)) x += 1;
    seen.add(x);
    return x;
  });
  const labels = ["Education", "Health", "Infrastructure", "Security", "Other"];
  return labels.map((label, i) => ({ label, value: values[i] }));
}

function sourceMc(rng: () => number): ScenarioMC {
  const s = randChoice(rng, REVENUE_SOURCES);
  const others = shuffle(rng, REVENUE_SOURCES.filter((o) => o.name !== s.name)).slice(0, 3);
  const name = g6SsName(rng);
  return {
    prompt: `${name} learns about ${s.description}. Which source of government revenue is this?`,
    correct: s.name,
    wrong: others.map((o) => o.name),
    explanation: `${s.name} is ${s.description}.`,
  };
}

function levelMc(rng: () => number): ScenarioMC {
  const wantNational = rng() > 0.5;
  const pool = EXPENDITURE.filter((e) => e.level === (wantNational ? "national" : "county"));
  const target = randChoice(rng, pool);
  const wrongPool = EXPENDITURE.filter((e) => e.level !== target.level);
  return {
    prompt: wantNational ? "Which of these is an example of national government spending?" : "Which of these is an example of county government spending?",
    correct: target.item,
    wrong: shuffle(rng, wrongPool.map((e) => e.item)).slice(0, 3),
    explanation: `${target.item} is an example of ${target.level} government spending.`,
  };
}

export const governmentRevenueAndExpenditure: Skill = {
  id: "g6-ss-gov-government-revenue-and-expenditure",
  code: "G.2",
  subjectId: "social-studies",
  strandId: "g6-ss-governance",
  grade: 6,
  title: "Government revenue and expenditure",
  description: "Sources of government revenue, how national and county governments spend it, and reading a budget allocation chart.",
  generate(rng) {
    const branch = randChoice(rng, ["source-mc", "level-mc", "budget-read", "budget-compare", "budget-order", "fill-blank", "click-match", "categorize"] as const);

    if (branch === "source-mc" || branch === "level-mc") {
      const q = branch === "source-mc" ? sourceMc(rng) : levelMc(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        hint: "Think about where the money comes from, or whether the spending is on a national or local (county) matter.",
        explanation: q.explanation,
      };
    }

    if (branch === "budget-read" || branch === "budget-compare") {
      const data = makeBudgetData(rng);
      if (branch === "budget-read") {
        const idx = randInt(rng, 0, data.length - 1);
        const target = data[idx];
        const others = data.filter((_, i) => i !== idx).map((d) => `${d.value}%`);
        const choices = shuffle(rng, [`${target.value}%`, ...others]);
        return {
          kind: "multiple-choice",
          prompt: `This chart shows a simplified national budget allocation by sector. What percentage of the budget goes to ${target.label.toLowerCase()}?`,
          visual: { type: "pie-chart", slices: data },
          choices,
          correctIndex: choices.indexOf(`${target.value}%`),
          hint: "Find the slice for the requested sector.",
          explanation: `${target.label} receives ${target.value}% of the budget shown.`,
        };
      }
      const highest = data.reduce((a, b) => (b.value > a.value ? b : a));
      const correctText = `${highest.label} receives the largest share of this budget`;
      const others = data.filter((d) => d.label !== highest.label);
      const wrong = shuffle(rng, others).slice(0, 2).map((d) => `${d.label} receives the largest share of this budget`);
      const choices = shuffle(rng, [correctText, ...wrong]);
      return {
        kind: "multiple-choice",
        prompt: "This chart shows a simplified national budget allocation by sector. Which statement about it is correct?",
        visual: { type: "pie-chart", slices: data },
        choices,
        correctIndex: choices.indexOf(correctText),
        hint: "Find the largest slice on the chart.",
        explanation: `${correctText}, at ${highest.value}% of the total budget.`,
      };
    }

    if (branch === "budget-order") {
      const data = makeBudgetData(rng);
      const ranked = [...data].sort((a, b) => b.value - a.value);
      return {
        kind: "ordering",
        prompt: "This chart shows a simplified national budget allocation by sector. Arrange the sectors from the largest share of the budget to the smallest.",
        visual: { type: "pie-chart", slices: data },
        items: shuffle(rng, ranked.map((d) => ({ id: d.label, label: d.label }))),
        correctOrder: ranked.map((d) => d.label),
        instruction: "Largest share first, smallest share last.",
        hint: "Compare the size of each slice on the chart.",
        explanation: `From largest to smallest share: ${ranked.map((d) => `${d.label} (${d.value}%)`).join(", ")}.`,
      };
    }

    if (branch === "fill-blank") {
      const templates = [
        () => ({ before: "A tax deducted from salaries and wages is called income tax, also known as", after: ".", correct: "PAYE" }),
        () => ({ before: "A tax added to the price of most goods and services people buy is called", after: ".", correct: "VAT" }),
        () => ({ before: "A tax charged on goods imported from abroad is called customs", after: ".", correct: "duty" }),
        () => ({ before: "A tax charged on specific goods such as fuel and alcohol is called excise", after: ".", correct: "duty" }),
        () => ({ before: "Fees charged for permission to run a business are called licences and", after: ".", correct: "permits" }),
        () => ({ before: "Funding the country's defence forces is an example of", after: "government spending.", correct: "national" }),
        () => ({ before: "Running local health clinics within a county is an example of", after: "government spending.", correct: "county" }),
        () => ({ before: "Taxes and fees collected by the government are together called government", after: ".", correct: "revenue" }),
        () => ({ before: "Money the government spends on public services and projects is called government", after: ".", correct: "expenditure" }),
        () => ({ before: "Paying taxes helps the government fund services such as schools, hospitals, and", after: ".", correct: "roads" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about government revenue and expenditure.",
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the different revenue sources and levels of government spending.",
        explanation: `${t.before} ${t.correct} ${t.after}`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...REVENUE_SOURCES]);
      const tokens = chosen.map((s) => ({ id: s.name, label: s.name }));
      const targets = shuffle(rng, chosen).map((s) => ({ id: s.name, label: s.description.charAt(0).toUpperCase() + s.description.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.name] = s.name;
      return {
        kind: "click-match",
        prompt: "Match each source of government revenue to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each tax or fee is actually charged on.",
        explanation: chosen.map((s) => `${s.name}: ${s.description}.`).join(" "),
      };
    }

    // categorize — national vs county government spending, the key distinction the rubric rewards.
    const chosen = shuffle(rng, [...EXPENDITURE]).slice(0, 6);
    const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.item }));
    const buckets = [
      { id: "national", label: "National government spending" },
      { id: "county", label: "County government spending" },
    ];
    const correctBucket: Record<string, string> = {};
    chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.level));
    return {
      kind: "categorize",
      prompt: "Sort each item of spending as national or county government spending.",
      items,
      buckets,
      correctBucket,
      hint: "National government handles country-wide matters; county governments handle local matters.",
      explanation: chosen.map((e) => `"${e.item}" is ${e.level} government spending.`).join(" "),
    };
  },
};
