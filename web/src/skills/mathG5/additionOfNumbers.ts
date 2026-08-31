import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings, fmt } from "./mathUtils";
import { COUNT_SCENARIO_SUBJECTS, fillPlace, place } from "./contexts";
import type { Skill } from "@/lib/types";

/** Randomly split a total into `parts` non-negative integers, each at least `minPart`, summing to total. */
function splitSum(rng: RNG, total: number, parts: number, minPart = 0): number[] {
  const result: number[] = [];
  let remaining = total - minPart * parts;
  for (let i = 0; i < parts - 1; i++) {
    const take = remaining > 0 ? randInt(rng, 0, remaining) : 0;
    result.push(minPart + take);
    remaining -= take;
  }
  result.push(minPart + Math.max(0, remaining));
  return result;
}

/** Build `numAddends` 6-digit numbers whose column-wise addition never carries (sum of each digit column <= 9). */
function genNoRegroupAddends(rng: RNG, numAddends: 2 | 3): number[] {
  const digitsByAddend: number[][] = Array.from({ length: numAddends }, () => []);
  for (let col = 5; col >= 0; col--) {
    const isLead = col === 5;
    const total = isLead ? randInt(rng, numAddends, 9) : randInt(rng, 0, 9);
    const parts = splitSum(rng, total, numAddends, isLead ? 1 : 0);
    parts.forEach((p, k) => digitsByAddend[k].push(p));
  }
  return digitsByAddend.map((digits) => Number(digits.join("")));
}

function countCarries(a: number, b: number): number {
  let carries = 0;
  let carry = 0;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    const sum = (x % 10) + (y % 10) + carry;
    carry = sum >= 10 ? 1 : 0;
    if (carry) carries++;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return carries;
}

/** Two 6-digit numbers, summing to at most 1,000,000, with at least two carries ("double regrouping"). */
function genDoubleRegroupPair(rng: RNG): { a: number; b: number } {
  for (let attempt = 0; attempt < 60; attempt++) {
    const a = randInt(rng, 100000, 899999);
    const maxB = Math.min(999999, 1000000 - a);
    if (maxB < 100000) continue;
    const b = randInt(rng, 100000, maxB);
    if (countCarries(a, b) >= 2) return { a, b };
  }
  return { a: 234561, b: 345678 }; // guaranteed-valid fallback (well-tested pair with several carries)
}

export const additionOfNumbers: Skill = {
  id: "g5-math-n-addition",
  code: "N.5",
  subjectId: "math",
  strandId: "g5-math-numbers",
  grade: 5,
  title: "Adding whole numbers",
  description: "Add up to three 6-digit numbers without regrouping, and up to two 6-digit numbers with double regrouping, with sums not exceeding 1,000,000, in real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["add-no-regroup-classical", "add-no-regroup-real-world", "add-regroup-classical", "add-regroup-mc", "match-sums", "order-sums", "categorize-carry"] as const);

    if (branch === "add-no-regroup-classical") {
      const numAddends = randChoice(rng, [2, 3] as const);
      const addends = genNoRegroupAddends(rng, numAddends);
      const sum = addends.reduce((s, n) => s + n, 0);
      const expr = addends.map(fmt).join(" + ");
      const openers = [
        `Work out $${expr}$.`,
        `Find the sum $${expr}$.`,
        `Add: $${expr}$.`,
        `Calculate $${expr}$.`,
        `What is $${expr}$?`,
        `Add these numbers: $${expr}$.`,
        `Find the total: $${expr}$.`,
        `Work out the total of $${expr}$.`,
        `Add up $${expr}$.`,
        `What do you get when you add $${expr}$?`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, openers),
        before: "Sum =",
        after: "",
        correctAnswer: String(sum),
        inputMode: "numeric",
        hint: "Add each place-value column separately, starting from the ones — no column needs a carry here.",
        explanation: `$${expr} = ${fmt(sum)}$. No column adds to 10 or more, so there is no regrouping.`,
      };
    }

    if (branch === "add-no-regroup-real-world") {
      const [n1, n2] = genNoRegroupAddends(rng, 2);
      const ctx = randChoice(rng, COUNT_SCENARIO_SUBJECTS);
      const subject = fillPlace(ctx, rng);
      const p2 = place(rng);
      const sum = n1 + n2;
      const openers = [
        `In one region, there were ${fmt(n1)} ${subject}. In ${p2}, there were ${fmt(n2)} more.`,
        `A count found ${fmt(n1)} ${subject} in one area, and ${fmt(n2)} more in ${p2}.`,
        `${fmt(n1)} ${subject} were recorded in one place, plus ${fmt(n2)} in ${p2}.`,
        `One region reported ${fmt(n1)} ${subject}, and ${p2} reported ${fmt(n2)}.`,
        `A survey counted ${fmt(n1)} ${subject} in one district, and ${fmt(n2)} in ${p2}.`,
        `Records show ${fmt(n1)} ${subject} in one location and ${fmt(n2)} in ${p2}.`,
        `${fmt(n1)} ${subject} were tallied first, then ${fmt(n2)} more in ${p2}.`,
        `A first count gave ${fmt(n1)} ${subject}; a second count in ${p2} gave ${fmt(n2)}.`,
      ];
      const closers = [
        " What is the combined total?",
        " Find the total number.",
        " How many are there altogether?",
        " Work out the grand total.",
      ];
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, openers)}${randChoice(rng, closers)}`,
        before: "Total =",
        after: "",
        correctAnswer: String(sum),
        inputMode: "numeric",
        hint: "Add the two totals together, column by column.",
        explanation: `${fmt(n1)} + ${fmt(n2)} = ${fmt(sum)}.`,
      };
    }

    if (branch === "add-regroup-classical") {
      const { a, b } = genDoubleRegroupPair(rng);
      const sum = a + b;
      const openers = [
        `Work out $${fmt(a)} + ${fmt(b)}$.`,
        `Find the sum $${fmt(a)} + ${fmt(b)}$.`,
        `Add: $${fmt(a)} + ${fmt(b)}$.`,
        `Calculate $${fmt(a)} + ${fmt(b)}$.`,
        `What is $${fmt(a)} + ${fmt(b)}$?`,
        `Add these two numbers: $${fmt(a)} + ${fmt(b)}$.`,
        `Find the total of $${fmt(a)} + ${fmt(b)}$.`,
        `Work out the sum of ${fmt(a)} and ${fmt(b)}.`,
        `Add ${fmt(a)} and ${fmt(b)} together.`,
        `What do you get when you add ${fmt(a)} and ${fmt(b)}?`,
      ];
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, openers),
        before: "Sum =",
        after: "",
        correctAnswer: String(sum),
        inputMode: "numeric",
        hint: "Add from the ones column. Whenever a column's total reaches 10 or more, carry 1 to the next column.",
        explanation: `$${fmt(a)} + ${fmt(b)} = ${fmt(sum)}$, regrouping (carrying) in at least two columns.`,
      };
    }

    if (branch === "add-regroup-mc") {
      const { a, b } = genDoubleRegroupPair(rng);
      const sum = a + b;
      const noCarrySum = Number(String(a).split("").map((d, i) => (Number(d) + Number(String(b).padStart(6, "0")[i])) % 10).join("")); // forgot-to-carry misconception
      const singleOffSum = sum - 10 ** randInt(rng, 1, 3); // missed one of the carries, off by a power of ten
      const candidates = [...new Set([noCarrySum, singleOffSum, sum + 100])].filter((v) => v !== sum && v > 0);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, fmt(sum), candidates.map(fmt), Math.min(3, candidates.length));
      const openers = [
        `A cooperative collected ${fmt(a)} KES one week and ${fmt(b)} KES the next.`,
        `A warehouse received ${fmt(a)} items, then ${fmt(b)} more items.`,
        `A county recorded ${fmt(a)} residents in one census block and ${fmt(b)} in another.`,
        `A charity raised ${fmt(a)} KES in one drive and ${fmt(b)} KES in a second drive.`,
        `A factory produced ${fmt(a)} units in one month and ${fmt(b)} the next.`,
        `A school fund collected ${fmt(a)} KES this term and ${fmt(b)} KES last term.`,
      ];
      const closers = [
        " What is the combined total?",
        " Find the grand total.",
        " What is the total altogether?",
        " Work out the sum of the two amounts.",
      ];
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, openers)}${randChoice(rng, closers)}`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Watch for columns that add to 10 or more — you must carry 1 to the next column each time.",
        explanation: `${fmt(a)} + ${fmt(b)} = ${fmt(sum)}. Forgetting to carry in a column gives the wrong total ${fmt(noCarrySum)} instead.`,
      };
    }

    if (branch === "match-sums") {
      const seen = new Set<string>();
      const items: { id: string; a: number; b: number; sum: number }[] = [];
      let i = 0;
      while (items.length < 4) {
        const [x, y] = genNoRegroupAddends(rng, 2);
        const key = `${x}-${y}`;
        if (!seen.has(key)) {
          seen.add(key);
          items.push({ id: `e${i}`, a: x, b: y, sum: x + y });
          i++;
        }
      }
      const tokens = items.map((it) => ({ id: it.id, label: `${fmt(it.a)} + ${fmt(it.b)}` }));
      const targets = shuffle(rng, items.map((it) => ({ id: `s-${it.id}`, label: fmt(it.sum) })));
      const correctMap: Record<string, string> = {};
      items.forEach((it) => (correctMap[`s-${it.id}`] = it.id));
      const prompts = [
        "Match each addition to its sum.",
        "Pair each addition expression with its total.",
        "Match each sum expression to its correct answer.",
        "Connect each addition to its result.",
        "Match each pair of numbers to their total.",
        "Pair each addition with the correct sum.",
        "Match each expression to its worked-out sum.",
        "Link each addition to its total.",
        "Match each sum to its correct value.",
        "Connect each addition expression to its answer.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Add each pair column by column.",
        explanation: items.map((it) => `${fmt(it.a)} + ${fmt(it.b)} = ${fmt(it.sum)}`).join("; ") + ".",
      };
    }

    if (branch === "order-sums") {
      const seen = new Set<string>();
      const items: { id: string; a: number; b: number; sum: number }[] = [];
      let i = 0;
      while (items.length < 5) {
        const { a, b } = genDoubleRegroupPair(rng);
        const key = `${a}-${b}`;
        if (!seen.has(key)) {
          seen.add(key);
          items.push({ id: `o${i}`, a, b, sum: a + b });
          i++;
        }
      }
      const sorted = [...items].sort((x, y) => x.sum - y.sum);
      const prompts = [
        "Order these sums from smallest to largest result.",
        "Arrange these additions by their total, smallest first.",
        "Put these sums in order, smallest total first.",
        "Sort these additions by result, from smallest to largest.",
        "Rank these sums from smallest to largest.",
        "Arrange these additions starting with the smallest total.",
        "Order these addition expressions by their sums.",
        "Sequence these sums, smallest result first.",
        "Put these additions in increasing order of total.",
        "Sort these sums by size, smallest to largest.",
      ];
      return {
        kind: "ordering",
        prompt: randChoice(rng, prompts),
        instruction: "Click them in order, smallest sum first.",
        items: shuffle(rng, items).map((it) => ({ id: it.id, label: `${fmt(it.a)} + ${fmt(it.b)}` })),
        correctOrder: sorted.map((it) => it.id),
        hint: "Work out each sum before comparing.",
        explanation: sorted.map((it) => `${fmt(it.a)} + ${fmt(it.b)} = ${fmt(it.sum)}`).join("; ") + ".",
      };
    }

    // categorize-carry: sort addition pairs by whether adding them needs regrouping (a carry) or not.
    const items = Array.from({ length: 6 }, (_, i) => {
      const useCarry = rng() < 0.5;
      if (useCarry) {
        const { a, b } = genDoubleRegroupPair(rng);
        return { id: `c${i}`, a, b, needsCarry: true };
      }
      const [a, b] = genNoRegroupAddends(rng, 2);
      return { id: `c${i}`, a, b, needsCarry: false };
    });
    const buckets = [
      { id: "carry", label: "Needs regrouping (carrying)" },
      { id: "no-carry", label: "No regrouping needed" },
    ];
    const correctBucket: Record<string, string> = {};
    items.forEach((it) => (correctBucket[it.id] = it.needsCarry ? "carry" : "no-carry"));
    const prompts = [
      "Sort each addition by whether it needs regrouping (carrying) or not.",
      "Sort these addition pairs into 'needs carrying' and 'no carrying needed'.",
      "Group each addition by whether any column reaches 10 or more.",
      "Sort each pair of numbers by whether adding them needs a carry.",
      "Classify each addition as needing regrouping or not.",
      "Sort each addition expression by whether it requires carrying.",
      "Group these additions by whether regrouping is needed.",
      "Sort each pair by whether their addition needs a carry in any column.",
      "Decide whether each addition needs regrouping, then sort it.",
      "Sort each addition based on whether carrying is required.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, prompts),
      items: items.map((it) => ({ id: it.id, label: `${fmt(it.a)} + ${fmt(it.b)}` })),
      buckets,
      correctBucket,
      hint: "Check each column from the right: if any column's digits add to 10 or more, regrouping is needed.",
      explanation: items.map((it) => `${fmt(it.a)} + ${fmt(it.b)} ${it.needsCarry ? "needs regrouping" : "needs no regrouping"}`).join("; ") + ".",
    };
  },
};
