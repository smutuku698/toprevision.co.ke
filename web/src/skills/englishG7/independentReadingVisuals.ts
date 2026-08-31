import { randChoice, randInt, sampleDistinctInts, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VISUAL_PURPOSES: { visual: string; purpose: string }[] = [
  { visual: "Bar chart", purpose: "Comparing the number of trees planted or trees lost across different forest blocks" },
  { visual: "Line graph", purpose: "Showing how forest cover has changed over a period of years" },
  { visual: "Pie chart", purpose: "Showing how a whole forest area is divided into different proportions, such as tree species" },
  { visual: "Map", purpose: "Showing where different forests and conservation areas are located" },
  { visual: "Diagram", purpose: "Showing the parts of a tree or a forest ecosystem and how they connect" },
  { visual: "Photograph", purpose: "Showing the real appearance, mood, or condition of a forest at a glance" },
];

const FOREST_BLOCKS = ["Kakamega Forest", "Mau Forest", "Aberdare Forest", "Cherangany Hills", "Mt. Kenya Forest", "Karura Forest"] as const;
const TREE_SPECIES = ["cedar", "bamboo", "podo", "mahogany"] as const;
const YEARS = ["2020", "2021", "2022", "2023", "2024"] as const;

const VISUAL_CATEGORY_ITEMS: { desc: string; category: string }[] = [
  { desc: "A bar chart comparing how many tree seedlings were planted in five forest blocks", category: "Comparing categories" },
  { desc: "A line graph showing a forest's percentage cover each year from 2020 to 2024", category: "Showing change over time" },
  { desc: "A map showing the boundaries and access roads around a gazetted forest", category: "Showing location" },
  { desc: "A labelled diagram showing the layers of a forest, from the forest floor to the canopy", category: "Showing parts or structure" },
  { desc: "A pie chart showing what proportion of a forest is covered by each tree species", category: "Organising proportions" },
  { desc: "A photograph of a bare, deforested hillside next to a healthy, forested one", category: "Showing mood or condition" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why might a reader look at a bar chart of tree-planting numbers before reading the full conservation report?",
    correct: "It gives a quick, at-a-glance comparison that helps the reader predict what facts the written report will explain in more detail",
    distractors: [
      "A bar chart always replaces the need to read the report at all",
      "Bar charts can only show information about money, never about trees",
      "A bar chart is included only to make the page look more colourful",
    ],
  },
  {
    q: "A reader sees a photograph of a bare hillside next to an article about deforestation and guesses the article will explain why the hillside lost its trees. Which comprehension strategy is this reader using?",
    correct: "Predicting — using clues in the visual to anticipate what the text will be about",
    distractors: [
      "Summarising — restating everything the whole article says in one sentence",
      "Skimming — reading only the very first word of the article",
      "Editing — correcting mistakes found in the photograph itself",
    ],
  },
  {
    q: "Why are visuals such as photographs and diagrams important in a written text about forest conservation?",
    correct: "They help convey information, mood, and relationships that words alone might take much longer to explain",
    distractors: [
      "Visuals are only ever included to fill empty space on a page",
      "Visuals replace the need for a reader to understand any of the words",
      "Visuals are important only in fictional stories, never in factual reports",
    ],
  },
  {
    q: "What type of information can a labelled diagram of a forest ecosystem convey that a bar chart usually cannot?",
    correct: "It can show how the different parts of the ecosystem, such as trees, soil, and wildlife, relate to and depend on each other",
    distractors: [
      "It can show exact yearly rainfall totals more accurately than any other visual",
      "It can compare numeric counts across categories better than a bar chart",
      "A diagram can never convey any information that a bar chart cannot",
    ],
  },
  {
    q: "Why is it important for a learner to interpret visuals carefully, rather than skipping over them, when reading about natural resources?",
    correct: "Visuals often carry key facts, trends, or relationships that are central to understanding the full text",
    distractors: [
      "Visuals are decorative only and never affect a reader's understanding",
      "Skipping visuals always makes reading comprehension faster and more accurate",
      "Visuals matter only in mathematics textbooks, not in reading texts",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "A chart that uses bars of different heights to compare amounts across categories is called a ", after: " chart.", correctAnswer: "bar" },
  { before: "A chart divided into slices to show how a whole is split into proportions is called a ", after: " chart.", correctAnswer: "pie" },
  { before: "A visual that uses a line to show how something changes over a period of time is called a line ", after: ".", correctAnswer: "graph" },
  { before: "Using clues in a visual to guess what a written text will be about is a comprehension strategy called ", after: ".", correctAnswer: "predicting" },
];

export const independentReadingVisuals: Skill = {
  id: "g7-eng-r-independent-reading-visuals",
  code: "R.7",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Independent Reading: Interpreting Visuals",
  description: "Identify the types of information conveyed by visuals and interpret bar charts, line graphs, and pie charts about forests and natural resources for comprehension.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "barchart", "linegraph", "piechart", "categorize", "concept", "fill"] as const);
    const hint = "Ask yourself what kind of information the visual is designed to show — a comparison, a trend over time, a proportion, or a location.";

    if (branch === "match") {
      const chosen = shuffle(rng, VISUAL_PURPOSES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.visual, label: v.visual })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.visual, label: v.purpose })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.visual] = v.visual;
      return {
        kind: "click-match",
        prompt: "Match each type of visual to what it is best used for.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((v) => `${v.visual} — ${v.purpose.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "barchart") {
      const species = randChoice(rng, TREE_SPECIES);
      const chosenBlocks = shuffle(rng, [...FOREST_BLOCKS]).slice(0, 4);
      const counts = sampleDistinctInts(rng, 50, 500, 4);
      const data = chosenBlocks.map((label, i) => ({ label, value: counts[i] }));
      const maxIdx = counts.indexOf(Math.max(...counts));
      const minIdx = counts.indexOf(Math.min(...counts));
      const askMax = rng() < 0.5;
      const askedIdx = askMax ? maxIdx : minIdx;
      const correct = chosenBlocks[askedIdx];
      const distractors = chosenBlocks.filter((_, i) => i !== askedIdx);
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `A conservation report includes a bar chart showing how many ${species} seedlings were planted in each forest block during last year's tree-planting exercise. According to the chart, which forest block planted the ${askMax ? "most" : "fewest"} ${species} seedlings?`,
        visual: { type: "bar-chart", data },
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Compare the height of each bar — the bar chart lets you compare counts across forest blocks at a glance.",
        explanation: `${correct} recorded the ${askMax ? "highest" : "lowest"} count of ${species} seedlings planted (${counts[askedIdx]}), connecting the bar chart directly to the written report.`,
      };
    }

    if (branch === "linegraph") {
      const block = randChoice(rng, FOREST_BLOCKS);
      const base = randInt(rng, 30, 45);
      const deltas = shuffle(rng, [2, 4, 6, 9]).slice(0, 4);
      const values = [base];
      for (const d of deltas) values.push(values[values.length - 1] + d);
      const points = YEARS.map((label, i) => ({ label, value: values[i] }));
      const maxDeltaIdx = deltas.indexOf(Math.max(...deltas));
      const fromYear = YEARS[maxDeltaIdx];
      const toYear = YEARS[maxDeltaIdx + 1];
      const askIncrease = rng() < 0.7;

      if (askIncrease) {
        const yearPairs = YEARS.slice(0, 4).map((y, i) => `${y}-${YEARS[i + 1]}`);
        const correct = `${fromYear}-${toYear}`;
        const distractors = yearPairs.filter((p) => p !== correct);
        const choices = shuffle(rng, [correct, ...shuffle(rng, distractors).slice(0, 3)]);
        return {
          kind: "multiple-choice",
          prompt: `A conservation report includes a line graph tracking ${block}'s percentage forest cover from 2020 to 2024. Between which two consecutive years did the forest cover increase the most?`,
          visual: { type: "line-graph", points },
          choices,
          correctIndex: choices.indexOf(correct),
          layout: "list",
          hint: "Look for the steepest upward slope between two neighbouring points on the line graph.",
          explanation: `Forest cover rose from ${values[maxDeltaIdx]}% in ${fromYear} to ${values[maxDeltaIdx + 1]}% in ${toYear}, an increase of ${deltas[maxDeltaIdx]} percentage points — the steepest rise on the graph.`,
        };
      }

      const lastYear = YEARS[YEARS.length - 1];
      const lastValue = values[values.length - 1];
      return {
        kind: "fill-blank",
        prompt: "Read the line graph and complete the sentence.",
        before: `According to the line graph, ${block}'s forest cover reached `,
        after: `% by the year ${lastYear}.`,
        correctAnswer: String(lastValue),
        inputMode: "numeric",
        visual: { type: "line-graph", points },
        hint: "Find the point on the graph directly above the final year and read its value.",
        explanation: `The line graph's last point, at ${lastYear}, sits at ${lastValue}% — connecting the visual directly to a fact the written report would state.`,
      };
    }

    if (branch === "piechart") {
      const block = randChoice(rng, FOREST_BLOCKS);
      const chosenSpecies = shuffle(rng, [...TREE_SPECIES]).slice(0, 4);
      const values = shuffle(rng, [40, 30, 20, 10]);
      const slices = chosenSpecies.map((label, i) => ({ label, value: values[i] }));
      const maxIdx = values.indexOf(Math.max(...values));
      const minIdx = values.indexOf(Math.min(...values));
      const askMax = rng() < 0.5;
      const askedIdx = askMax ? maxIdx : minIdx;
      const correct = chosenSpecies[askedIdx];
      const distractors = chosenSpecies.filter((_, i) => i !== askedIdx);
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `A survey of ${block} includes a pie chart showing what proportion of the forest's trees belong to each species. Which species makes up the ${askMax ? "LARGEST" : "SMALLEST"} share of the forest, according to the chart?`,
        visual: { type: "pie-chart", slices },
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: `The ${askMax ? "largest" : "smallest"} slice of a pie chart represents the ${askMax ? "largest" : "smallest"} share of the whole.`,
        explanation: `${correct} makes up ${values[askedIdx]}% of the forest's trees, the ${askMax ? "largest" : "smallest"} share shown in the pie chart.`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VISUAL_CATEGORY_ITEMS).slice(0, 5);
      const categories = Array.from(new Set(chosen.map((c) => c.category)));
      const buckets = categories.map((c) => ({ id: c, label: c }));
      const items = chosen.map((c, i) => ({ id: `v${i}`, label: c.desc }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`v${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: "Sort each visual by what it mainly helps a reader do.",
        items,
        buckets,
        correctBucket,
        hint: "Ask: does this visual compare amounts, show change over time, show proportions, show a location, show structure, or show mood?",
        explanation: chosen.map((c) => `"${c.desc}" mainly helps with: ${c.category.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "concept") {
      const entry = randChoice(rng, CONCEPT_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint,
        explanation: `The correct answer is "${entry.correct}".`,
      };
    }

    const entry = randChoice(rng, FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete the sentence about visuals.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
    };
  },
};
