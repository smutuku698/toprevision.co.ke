import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TASKS = [
  { id: "wipe-surfaces", label: "Wiping worktops and the cooking area after use", freq: "daily" },
  { id: "wash-dishes", label: "Washing dishes and utensils after every meal", freq: "daily" },
  { id: "sweep-floor", label: "Sweeping the kitchen floor", freq: "daily" },
  { id: "empty-bin", label: "Emptying the kitchen waste bin", freq: "daily" },
  { id: "mop-floor", label: "Mopping and scrubbing the kitchen floor thoroughly", freq: "weekly" },
  { id: "clean-fridge", label: "Cleaning out and wiping down the refrigerator", freq: "weekly" },
  { id: "wash-curtains", label: "Washing kitchen curtains or window coverings", freq: "weekly" },
  { id: "descale-utensils", label: "Descaling cooking pots and removing built-up grease from the cooker", freq: "special" },
  { id: "clean-ceiling", label: "Clearing cobwebs and cleaning the ceiling and walls", freq: "special" },
  { id: "deep-clean-cupboards", label: "Emptying and deep-cleaning storage cupboards", freq: "special" },
] as const;
const FREQ_LABEL: Record<string, string> = { daily: "Daily cleaning task", weekly: "Weekly cleaning task", special: "Special/occasional cleaning task" };

const AGENT_ITEMS = [
  { text: "Dishwashing soap and a sponge, for washing utensils", bucket: "cleaning" },
  { text: "A broom and dustpan, for sweeping the floor", bucket: "tool" },
  { text: "A disinfectant solution, for wiping worktops after handling raw food", bucket: "cleaning" },
  { text: "A mop and bucket, for cleaning the floor", bucket: "tool" },
  { text: "A scrubbing brush, for removing burnt-on food from pots", bucket: "tool" },
  { text: "Detergent powder, for soaking greasy dishes", bucket: "cleaning" },
] as const;
const AGENT_LABEL: Record<string, string> = { cleaning: "A cleaning agent", tool: "A cleaning tool/equipment" };

const DISH_STEPS = [
  { id: "scrape", label: "Scrape leftover food off the plate into the bin" },
  { id: "rinse1", label: "Rinse off loose dirt with water" },
  { id: "wash", label: "Wash with soap and a sponge or brush" },
  { id: "rinse2", label: "Rinse off all the soap thoroughly" },
  { id: "dry", label: "Dry and store the clean dish" },
];

const FREQ_SORT_PROMPTS = [
  "Sort each kitchen cleaning task as daily, weekly, or special/occasional.",
  "Decide how often each task below should happen — daily, weekly, or special — and sort it.",
  "Group these kitchen cleaning tasks under daily, weekly, or special/occasional.",
  "Read each task and sort it into daily, weekly, or special/occasional cleaning.",
  "Sort these cleaning tasks into their correct frequency category.",
  "Place each kitchen task into the right bucket — daily, weekly, or special/occasional.",
];

const AGENT_SORT_PROMPTS = [
  "Sort each item as a cleaning agent (a substance used to clean) or a cleaning tool/equipment.",
  "Decide whether each item below is a cleaning agent or a cleaning tool, and sort it.",
  "Group these items under cleaning agent or cleaning tool/equipment.",
  "Read each item and sort it as a cleaning agent or a piece of cleaning equipment.",
  "Sort these kitchen items into cleaning agent or cleaning tool.",
  "Place each item into the correct bucket — a cleaning agent, or a cleaning tool/equipment.",
];

const CHART_FREQUENCY_PROMPTS = [
  "This chart shows how many times a month a household does each category of kitchen cleaning task. Which category happens least often?",
  "The bar chart shows monthly frequency for each kitchen cleaning category. Which category happens the fewest times?",
  "Look at the chart of cleaning task frequency per month. Which category is done least often?",
  "This chart compares how often daily, weekly, and special kitchen tasks are done each month. Which happens least?",
  "Based on the monthly frequencies shown in the chart, which category of kitchen cleaning is rarest?",
  "The chart shows times-per-month for each cleaning category. Which one occurs least frequently?",
];

const DISH_ORDER_PROMPTS = [
  "Arrange the correct order for washing dishes after a meal.",
  "Put these steps for washing dishes into the right order.",
  "Sequence the process of washing dishes after a meal correctly.",
  "Arrange these steps in the order someone should follow to wash dishes.",
  "Order these actions the way a household would carry them out when washing up.",
  "Sort these steps into the order they should happen when washing dishes.",
];

const TASK_RECALL_PROMPTS = [
  (label: string) => `"${label}" is a kitchen cleaning task done how often? (daily / weekly / special)`,
  (label: string) => `How often is "${label}" done — daily, weekly, or special?`,
  (label: string) => `Is "${label}" a daily, weekly, or special/occasional kitchen task?`,
  (label: string) => `Which frequency fits "${label}" — daily, weekly, or special?`,
  (label: string) => `"${label}" — what frequency category does this cleaning task belong to (daily / weekly / special)?`,
];

export const cleaningKitchen: Skill = {
  id: "g8-ag-h-cleaning-kitchen",
  code: "H.1",
  subjectId: "agriculture-nutrition",
  strandId: "g8-ag-hygiene",
  grade: 8,
  title: "Cleaning the Kitchen",
  description: "Routine daily, weekly, and special kitchen cleaning practices, the tools and agents used, and why a clean kitchen matters for healthy living.",
  generate(rng) {
    const branch = randChoice(rng, ["freq-sort", "agent-sort", "chart-frequency", "dish-order", "task-recall"] as const);

    if (branch === "freq-sort") {
      const chosen = shuffle(rng, TASKS).slice(0, randInt(rng, 6, 8));
      const buckets = Array.from(new Set(chosen.map((t) => t.freq))).map((f) => ({ id: f, label: FREQ_LABEL[f] }));
      const items = chosen.map((t) => ({ id: t.id, label: t.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((t) => (correctBucket[t.id] = t.freq));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FREQ_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Daily tasks stop mess building up; weekly tasks go deeper; special tasks happen only occasionally.",
        explanation: chosen.map((t) => `"${t.label}" is a ${t.freq} task.`).join(" "),
      };
    }

    if (branch === "agent-sort") {
      const chosen = shuffle(rng, AGENT_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: AGENT_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, AGENT_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "A cleaning agent is something you apply, like soap or disinfectant; a tool is the equipment you use it with.",
        explanation: chosen.map((c) => `"${c.text}" — ${AGENT_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "chart-frequency") {
      const daily = randInt(rng, 20, 30);
      const weekly = randInt(rng, 3, 7);
      const special = randInt(rng, 1, 3);
      const data = shuffle(rng, [
        { label: "Daily tasks (times/month)", value: daily },
        { label: "Weekly tasks (times/month)", value: weekly },
        { label: "Special tasks (times/month)", value: special },
      ]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, CHART_FREQUENCY_PROMPTS),
        visual: { type: "bar-chart", data },
        choices: ["Daily tasks (times/month)", "Weekly tasks (times/month)", "Special tasks (times/month)"],
        correctIndex: ["Daily tasks (times/month)", "Weekly tasks (times/month)", "Special tasks (times/month)"].indexOf("Special tasks (times/month)"),
        hint: "The shortest bar happens the fewest times per month.",
        explanation: `Special tasks happen only about ${special} times a month, far less often than weekly (${weekly}) or daily (${daily}) tasks — because they involve deeper, less-frequent cleaning like clearing cobwebs or descaling.`,
      };
    }

    if (branch === "dish-order") {
      const items = shuffle(rng, DISH_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, DISH_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: DISH_STEPS.map((s) => s.id),
        hint: "Remove the food first, then wash, then rinse off the soap, then dry.",
        explanation: DISH_STEPS.map((s) => s.label).join(" → "),
      };
    }

    // task-recall
    const t = randChoice(rng, TASKS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, TASK_RECALL_PROMPTS)(t.label),
      before: "This is a",
      after: "task.",
      correctAnswer: t.freq,
      inputMode: "text",
      hint: "Think about how quickly mess builds up if this task is skipped.",
      explanation: `"${t.label}" is a ${t.freq} task.`,
    };
  },
};
