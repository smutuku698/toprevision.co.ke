import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Pool-size floor: item/name/place pools are kept wide (10+) and threaded through the
// form-expression scenarios so the same operation category doesn't read as the same
// sentence every time it's drawn (RIGOR-STANDARDS.md "Minimum pool-size floor").
const ITEM_WORDS = [
  "apples", "exercise books", "mangoes", "bags of maize", "goats", "chairs",
  "oranges", "loaves of bread", "sacks of charcoal", "tomatoes", "eggs", "bicycles",
] as const;

const KENYAN_NAMES = [
  "Wanjiku", "Otieno", "Amina", "Baraka", "Chebet", "Denis",
  "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka",
] as const;

const KENYAN_PLACES = [
  "Kisumu", "Eldoret", "Nakuru", "Mombasa", "Nyeri", "Machakos",
  "Kitale", "Thika", "Kericho", "Malindi", "Nyahururu", "Garissa",
] as const;

function who(rng: RNG) {
  return randChoice(rng, KENYAN_NAMES);
}
function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}

/**
 * Builds one phrase-to-expression pair per operation family (add/subtract/multiply/
 * divide), picking one of 3 paraphrases within each family via rng. This both
 * guarantees the 3 tokens shown in any one click-match round always map to distinct
 * expressions (no duplicate-target ambiguity) and gives a combined pool of 12 distinct
 * phrase texts across sessions (RIGOR-STANDARDS.md pool-size floor: 10+ for a
 * click-match fact pool).
 */
type PhrasePair = { phrase: string; expr: string };
function buildPhrasePairs(rng: RNG, varLetter: string, k: number): PhrasePair[] {
  return [
    {
      phrase: randChoice(rng, [`${k} more than ${varLetter}`, `${varLetter} increased by ${k}`, `the sum of ${varLetter} and ${k}`]),
      expr: `${varLetter} + ${k}`,
    },
    {
      phrase: randChoice(rng, [`${k} less than ${varLetter}`, `${varLetter} decreased by ${k}`, `${k} subtracted from ${varLetter}`]),
      expr: `${varLetter} - ${k}`,
    },
    {
      phrase: randChoice(rng, [`${varLetter} multiplied by ${k}`, `${k} times ${varLetter}`, `the product of ${varLetter} and ${k}`]),
      expr: `${k}${varLetter}`,
    },
    {
      phrase: randChoice(rng, [`${varLetter} shared equally among ${k} people`, `${varLetter} divided by ${k}`, `the quotient of ${varLetter} and ${k}`]),
      expr: `${varLetter}/${k}`,
    },
  ];
}

export const algebraicExpressions: Skill = {
  id: "g7-math-a-algebraic-expressions",
  code: "A.1",
  subjectId: "math",
  strandId: "g7-math-algebra",
  grade: 7,
  title: "Algebraic expressions",
  description: "Form algebraic expressions from real-life situations and statements, and simplify algebraic expressions by collecting like terms.",
  generate(rng) {
    const branch = randChoice(rng, ["form-expression", "simplify", "simplify-classical", "like-terms-sort", "match-phrase", "form-steps"] as const);

    if (branch === "form-expression") {
      const item = randChoice(rng, ITEM_WORDS);
      const extra = randInt(rng, 2, 9);
      const op = randChoice(rng, ["plus", "minus", "times", "divide"] as const);
      let statement: string;
      let expr: string;
      let wrong: string[];
      if (op === "plus") {
        const name1 = who(rng);
        const name2 = who(rng);
        statement = `${name1} has x ${item}. ${name2} has ${extra} more ${item} than ${name1}. Write an expression for the number of ${item} ${name2} has.`;
        expr = `x + ${extra}`;
        wrong = [`x - ${extra}`, `${extra}x`, `x \\times ${extra} + 1`];
      } else if (op === "minus") {
        statement = `A trader in ${place(rng)} has x ${item} in stock. She sells ${extra} of them. Write an expression for the number of ${item} remaining.`;
        expr = `x - ${extra}`;
        wrong = [`x + ${extra}`, `${extra} - x`, `${extra}x`];
      } else if (op === "times") {
        statement = `Each box holds x ${item}. A shop in ${place(rng)} receives ${extra} boxes. Write an expression for the total number of ${item} received.`;
        expr = `${extra}x`;
        wrong = [`x + ${extra}`, `x - ${extra}`, `x \\div ${extra}`];
      } else {
        statement = `${who(rng)} has x ${item} to share equally among ${extra} people in ${place(rng)}. Write an expression for the number of ${item} each person receives.`;
        expr = `x/${extra}`;
        wrong = [`${extra}/x`, `${extra}x`, `x - ${extra}`];
      }
      const { choices, correctIndex } = buildChoicesFromStrings(rng, expr, wrong);
      return {
        kind: "multiple-choice",
        prompt: statement,
        choices: choices.map((c) => `$${c}$`),
        correctIndex,
        layout: "row",
        hint: op === "plus" ? "\"More than\" means adding." : op === "minus" ? "\"Sells\" or \"remaining\" means subtracting." : op === "times" ? "\"Each box holds x, and there are several boxes\" means multiplying." : "\"Shared equally among\" means dividing.",
        explanation: `The correct expression is $${expr}$.`,
      };
    }

    if (branch === "simplify") {
      const a = randInt(rng, 2, 9);
      const b = randInt(rng, 2, 9);
      const c = randInt(rng, 1, 8);
      const useY = rng() < 0.6;
      const exprStr = useY ? `${a}x + ${b}y - ${c}x + ${b}y` : `${a}x + ${c} - ${b}x - ${c}`;
      const simplified = useY ? `${a - b}x + ${2 * b}y` : `${a - b}x`;
      return {
        kind: "fill-blank",
        prompt: `Simplify: $${exprStr}$`,
        before: "Simplified =",
        after: "",
        correctAnswer: simplified.replace(/\\times/g, "").replace(/\s/g, ""),
        acceptedAnswers: [simplified],
        inputMode: "text",
        hint: "Group and combine terms that have exactly the same variable (like terms).",
        explanation: useY ? `Collect x terms: $${a}x - ${b}x = ${a - b}x$. Collect y terms: $${b}y + ${b}y = ${2 * b}y$. Simplified: $${simplified}$.` : `Collect x terms: $${a}x - ${b}x = ${a - b}x$. Collect constants: $${c} - ${c} = 0$. Simplified: $${simplified}$.`,
      };
    }

    if (branch === "simplify-classical") {
      // Classical multi-term expansion + collection, context-free.
      const a = randInt(rng, 2, 8);
      const b = randInt(rng, 2, 7);
      const c = randInt(rng, 1, 9);
      const d = randInt(rng, 1, 9);
      const expanded1 = a * c;
      const expanded2 = a * d;
      const finalCoeff = expanded1 - b;
      return {
        kind: "fill-blank",
        prompt: `Expand and simplify: $${a}(${c}x + ${d}) - ${b}x$`,
        before: "Simplified =",
        after: "",
        correctAnswer: `${finalCoeff}x+${expanded2}`.replace("+-", "-"),
        acceptedAnswers: [`${finalCoeff}x + ${expanded2}`],
        inputMode: "text",
        hint: "First multiply out the bracket, then collect the x terms together.",
        explanation: `$${a}(${c}x + ${d}) = ${expanded1}x + ${expanded2}$. Then $${expanded1}x + ${expanded2} - ${b}x = ${finalCoeff}x + ${expanded2}$.`,
      };
    }

    if (branch === "like-terms-sort") {
      const varLetter = randChoice(rng, ["x", "y", "a", "n"] as const);
      const xTerms = Array.from({ length: 3 }, () => `${randInt(rng, 2, 9)}${varLetter}`);
      const constants = Array.from({ length: 3 }, () => String(randInt(rng, 2, 20)));
      const items = shuffle(rng, [...xTerms.map((t, i) => ({ id: `x${i}`, label: t })), ...constants.map((t, i) => ({ id: `c${i}`, label: t }))]);
      const buckets = [
        { id: "terms", label: `Terms with ${varLetter}` },
        { id: "constants", label: "Constant numbers" },
      ];
      const correctBucket: Record<string, string> = {};
      xTerms.forEach((_, i) => (correctBucket[`x${i}`] = "terms"));
      constants.forEach((_, i) => (correctBucket[`c${i}`] = "constants"));
      return {
        kind: "categorize",
        prompt: `Sort each term as a term containing "${varLetter}" or a constant number.`,
        items,
        buckets,
        correctBucket,
        hint: `A term with ${varLetter} in it changes value depending on ${varLetter}; a constant stays fixed.`,
        explanation: `Terms with ${varLetter}: ${xTerms.join(", ")}. Constants: ${constants.join(", ")}.`,
      };
    }

    if (branch === "match-phrase") {
      const varLetter = randChoice(rng, ["x", "n"] as const);
      const k = randInt(rng, 2, 9);
      const pairs = buildPhrasePairs(rng, varLetter, k);
      const chosen = shuffle(rng, pairs).slice(0, 3);
      const tokens = chosen.map((p, i) => ({ id: `p${i}`, label: p.phrase }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `e${i}`, label: p.expr })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`e${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: "Match each word phrase to the algebraic expression it describes.",
        tokens,
        targets,
        correctMap,
        hint: "Look for key words: \"more than\" adds, \"less than\" subtracts, \"multiplied by\" multiplies, \"shared among\" divides.",
        explanation: chosen.map((p) => `"${p.phrase}" → ${p.expr}`).join("; ") + ".",
      };
    }

    // form-steps: order the steps for turning a real-life situation into an algebraic expression
    const steps = [
      { id: "s1", label: "Read the situation and identify the unknown quantity" },
      { id: "s2", label: "Choose a letter to represent the unknown quantity" },
      { id: "s3", label: "Identify the operation(s) being described (add, subtract, multiply, divide)" },
      { id: "s4", label: "Write the algebraic expression using the letter and the operation(s)" },
    ];
    return {
      kind: "ordering",
      prompt: "Put these steps for turning a real-life situation into an algebraic expression in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      hint: "You must know what the unknown is and what letter represents it before you can write any operations.",
      explanation: "Steps: (1) identify the unknown, (2) choose a letter for it, (3) identify the operation(s), (4) write the full expression.",
    };
  },
};
