import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt, fmt } from "./mathUtils";
import { BUDGET_ITEM_POOL, SAVING_WISELY_FACTS, name, place } from "./measurementContexts";
import type { Skill } from "@/lib/types";

export const budgetingAndSaving: Skill = {
  id: "g5-math-m-budgeting-saving",
  code: "M.11",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Budgeting and saving wisely",
  description: "Explain what a budget is, prepare a small budget of up to 5 items, and identify factors for saving money wisely.",
  generate(rng) {
    const branch = randChoice(rng, ["what-is-budget-mc", "budget-total", "budget-missing-item-mc", "saving-match", "saving-categorize"] as const);

    if (branch === "what-is-budget-mc") {
      const correct = "A plan for how money will be spent or saved, listing items and their costs ahead of time";
      const wrong = [
        "A record of money already spent, written after the shopping is done",
        "A bank's rule for how much a customer must save every month",
        "A government form used only for paying taxes",
      ];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      const prompts = [
        "What is a budget?",
        "Which statement best describes what a budget is?",
        "A budget is best described as which of the following?",
        "Choose the best definition of a budget.",
        "Which of these correctly explains what a budget means?",
        "What does the term 'budget' mean?",
        "Select the best description of a budget.",
        "Which answer correctly defines a budget?",
        "How would you best describe a budget?",
        "Which of these is the correct meaning of a budget?",
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "list",
        hint: "A budget is made BEFORE spending, not a record made afterward.",
        explanation: "A budget is a plan made in advance, listing items to be bought and their costs. A record made after spending is different (that's a receipt or expense record), and a budget isn't a bank rule or a tax form.",
      };
    }

    if (branch === "budget-total") {
      const count = randInt(rng, 3, 5);
      const items = shuffle(rng, [...BUDGET_ITEM_POOL]).slice(0, count);
      const prices = items.map((it) => randInt(rng, it.priceRange[0], it.priceRange[1]));
      const total = prices.reduce((a, b) => a + b, 0);
      const person = name(rng);
      const p = place(rng);
      const list = items.map((it, i) => `${it.item} (KES ${prices[i]})`).join(", ");
      const openers = [
        `${person} is preparing a shopping budget in ${p} with these ${count} items: ${list}.`,
        `${person}, shopping in ${p}, plans to buy: ${list}.`,
        `A budget prepared by ${person} in ${p} lists: ${list}.`,
        `${person} draws up a budget for ${p} market day, listing: ${list}.`,
      ];
      const closers = [" What is the total budget?", " Find the total cost of the budget.", " How much does the whole budget come to?", " What is the total amount needed?"];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers),
        before: "Total budget = KES",
        after: "",
        correctAnswer: String(total),
        inputMode: "numeric",
        hint: "Add up the cost of every item in the budget.",
        explanation: `${items.map((it, i) => `KES ${prices[i]}`).join(" + ")} = KES ${fmt(total)}.`,
      };
    }

    if (branch === "budget-missing-item-mc") {
      const count = randInt(rng, 3, 4);
      const items = shuffle(rng, [...BUDGET_ITEM_POOL]).slice(0, count + 1);
      const prices = items.map((it) => randInt(rng, it.priceRange[0], it.priceRange[1]));
      const total = prices.reduce((a, b) => a + b, 0);
      const missingIdx = count;
      const knownTotal = total - prices[missingIdx];
      const known = items.slice(0, count).map((it, i) => `${it.item} (KES ${prices[i]})`).join(", ");
      const wrongTotal = knownTotal + prices[missingIdx];
      const wrongHalf = Math.round(prices[missingIdx] / 2);
      const wrongDouble = prices[missingIdx] * 2;
      const candidates = [...new Set([wrongTotal, wrongHalf, wrongDouble])].filter((v) => v !== prices[missingIdx] && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, `KES ${prices[missingIdx]}`, candidates.map((v) => `KES ${v}`), Math.min(3, candidates.length));
      const person = name(rng);
      const p = place(rng);
      const prompts = [
        `${person}'s budget in ${p} totals KES ${fmt(total)}. It includes: ${known}, plus one more item: ${items[missingIdx].item}. What did ${items[missingIdx].item} cost?`,
        `A budget of KES ${fmt(total)} prepared by ${person} in ${p} includes ${known} and ${items[missingIdx].item}. Find the cost of ${items[missingIdx].item}.`,
        `${person}'s shopping budget in ${p} adds up to KES ${fmt(total)}, covering ${known} and ${items[missingIdx].item}. What was the price of ${items[missingIdx].item}?`,
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "row",
        hint: "Add up the known items, then subtract that total from the overall budget total.",
        explanation: `Known items total KES ${fmt(knownTotal)}. KES ${fmt(total)} − KES ${fmt(knownTotal)} = KES ${prices[missingIdx]} for ${items[missingIdx].item}.`,
      };
    }

    if (branch === "saving-match") {
      const chosen = shuffle(rng, [...SAVING_WISELY_FACTS]).slice(0, 4);
      const tokens = chosen.map((f, i) => ({ id: `f${i}`, label: f.factor }));
      const targets = shuffle(rng, chosen.map((f, i) => ({ id: `r${i}`, label: f.reason })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`r${i}`] = `f${i}`));
      const prompts = [
        "Match each saving habit to why it matters.",
        "Pair each factor for saving wisely with its reason.",
        "Match each saving tip to its explanation.",
        "Connect each way of saving wisely to its purpose.",
        "Match each saving factor to why it helps.",
        "Pair each habit with the reason it is useful for saving.",
        "Match each saving-money factor to its correct reason.",
        "Link each saving strategy to why it's wise.",
        "Match every saving habit to its correct reason.",
        "Connect each way of saving with its explanation.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Think about what problem each saving habit solves.",
        explanation: chosen.map((f) => `${f.factor}: ${f.reason}`).join("; ") + ".",
      };
    }

    // saving-categorize: sort actions as helps saving wisely, or does not.
    const goodActions = [
      "Setting aside a fixed amount every week",
      "Comparing prices at two shops before buying",
      "Writing down a savings goal",
      "Keeping savings in a bank account",
      "Planning for emergencies before they happen",
      "Tracking how much has been saved so far",
    ];
    const badActions = [
      "Spending on wants before covering needs",
      "Buying items without comparing prices",
      "Keeping money loose at home with no plan",
      "Ignoring how much has already been spent",
      "Saving only whatever happens to be left over, with no goal",
      "Spending all pocket money as soon as it's received",
    ];
    const chosenGood = shuffle(rng, goodActions).slice(0, 3);
    const chosenBad = shuffle(rng, badActions).slice(0, 3);
    const all = shuffle(rng, [...chosenGood.map((a) => ({ label: a, wise: true })), ...chosenBad.map((a) => ({ label: a, wise: false }))]);
    const items = all.map((a, i) => ({ id: `a${i}`, label: a.label }));
    const buckets = [
      { id: "wise", label: "Helps you save money wisely" },
      { id: "not-wise", label: "Makes it harder to save wisely" },
    ];
    const correctBucket: Record<string, string> = {};
    all.forEach((a, i) => (correctBucket[`a${i}`] = a.wise ? "wise" : "not-wise"));
    const catPrompts = [
      "Sort each action by whether it helps you save money wisely.",
      "Group each habit as helping saving, or not.",
      "Classify each action: helps saving wisely, or works against it.",
      "Sort these actions into 'helps saving' and 'does not help saving'.",
      "Decide whether each habit is wise for saving, then sort it.",
      "Sort each action by whether it supports good saving habits.",
      "Group these actions by whether they support wise saving.",
      "Classify each habit by whether it helps reach a savings goal.",
      "Sort each action based on whether it is a wise money habit.",
      "Which actions help with saving wisely? Sort them all.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Wise saving habits involve planning ahead and comparing options; unwise ones involve spending without a plan.",
      explanation: all.map((a) => `"${a.label}" ${a.wise ? "helps" : "does not help"} saving wisely`).join("; ") + ".",
    };
  },
};

