import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// Pool-size floor (RIGOR-STANDARDS.md): word-to-equation previously had exactly one
// fixed scenario template (boda-boda fare) with only the numbers varying — the same
// thin-pool pattern flagged in factors.ts's REAL_LIFE_LCM. These pools give it 10+
// distinct real-life contexts, plus a place/actor pool layered on top for extra variety.
const KENYAN_PLACES = [
  "Kisumu", "Eldoret", "Nakuru", "Mombasa", "Nyeri", "Machakos",
  "Kitale", "Thika", "Kericho", "Malindi", "Nyahururu", "Garissa",
] as const;

const KENYAN_NAMES = [
  "Wanjiku", "Otieno", "Amina", "Baraka", "Chebet", "Denis",
  "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka",
] as const;

function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}
function who(rng: RNG) {
  return randChoice(rng, KENYAN_NAMES);
}

interface WordEquation {
  prompt: string;
  correctEq: string;
  wrong: string[];
}

const WORD_EQUATION_TEMPLATES: ((rng: RNG) => WordEquation)[] = [
  (rng) => {
    const a = randInt(rng, 3, 9);
    const b = randInt(rng, 20, 90);
    const x = randInt(rng, 15, 60);
    const rhs = a * x + b;
    return {
      prompt: `A boda-boda rider in ${place(rng)} charges KES ${a} per kilometre plus a fixed KES ${b} booking fee. A trip cost KES ${rhs} in total. Which equation lets you find the distance travelled, x (in km)?`,
      correctEq: `${a}x + ${b} = ${rhs}`,
      wrong: [`${a}x - ${b} = ${rhs}`, `${b}x + ${a} = ${rhs}`, `${a}x + ${b} = ${x}`],
    };
  },
  (rng) => {
    const a = randInt(rng, 2, 8);
    const b = randInt(rng, 30, 80);
    const x = randInt(rng, 5, 25);
    const rhs = a * x + b;
    return {
      prompt: `A matatu in ${place(rng)} charges a base fare of KES ${b} plus KES ${a} for every extra kilometre beyond the town boundary. A passenger paid KES ${rhs} in total for x extra kilometres. Which equation models this?`,
      correctEq: `${a}x + ${b} = ${rhs}`,
      wrong: [`${b}x + ${a} = ${rhs}`, `${a}x - ${b} = ${rhs}`, `${a}(x + ${b}) = ${rhs}`],
    };
  },
  (rng) => {
    const a = randInt(rng, 20, 60);
    const b = randInt(rng, 30, 100);
    const x = randInt(rng, 4, 15);
    const rhs = a * x + b;
    return {
      prompt: `${who(rng)} sells water in ${place(rng)}. Each jerrican costs KES ${a}, and she also charges a fixed KES ${b} delivery fee. A customer's total bill was KES ${rhs} for x jerricans. Which equation gives x?`,
      correctEq: `${a}x + ${b} = ${rhs}`,
      wrong: [`${a}x - ${b} = ${rhs}`, `${b}x + ${a} = ${rhs}`, `${a}x + ${b} = ${x}`],
    };
  },
  (rng) => {
    const a = randInt(rng, 15, 50);
    const b = randInt(rng, 50, 200);
    const x = randInt(rng, 2, 10);
    const rhs = a * x + b;
    return {
      prompt: `A mobile shop in ${place(rng)} charges KES ${a} per gigabyte of data plus a fixed KES ${b} activation fee. ${who(rng)} paid KES ${rhs} in total for x gigabytes. Which equation models this?`,
      correctEq: `${a}x + ${b} = ${rhs}`,
      wrong: [`${a}x - ${b} = ${rhs}`, `${b}x + ${a} = ${rhs}`, `${a}(x + ${b}) = ${rhs}`],
    };
  },
  (rng) => {
    const a = randInt(rng, 50, 150);
    const b = randInt(rng, 100, 400);
    const x = randInt(rng, 2, 8);
    const rhs = a * x + b;
    return {
      prompt: `A tailor in ${place(rng)} charges KES ${a} per metre of fabric plus a fixed KES ${b} tailoring fee. ${who(rng)}'s dress cost KES ${rhs} in total for x metres of fabric. Which equation gives x?`,
      correctEq: `${a}x + ${b} = ${rhs}`,
      wrong: [`${a}x - ${b} = ${rhs}`, `${b}x + ${a} = ${rhs}`, `${a}x + ${b} = ${x}`],
    };
  },
  (rng) => {
    const a = randInt(rng, 20, 60);
    const b = randInt(rng, 500, 2000);
    const x = randInt(rng, 10, 50);
    const rhs = a * x + b;
    return {
      prompt: `An events company in ${place(rng)} hires out chairs at KES ${a} each plus a fixed KES ${b} tent fee. ${who(rng)} paid KES ${rhs} in total to hire x chairs and the tent. Which equation models this?`,
      correctEq: `${a}x + ${b} = ${rhs}`,
      wrong: [`${a}x - ${b} = ${rhs}`, `${b}x + ${a} = ${rhs}`, `${a}(x + ${b}) = ${rhs}`],
    };
  },
  (rng) => {
    const a = randInt(rng, 5, 20);
    const b = randInt(rng, 400, 900);
    const x = randInt(rng, 3, 15);
    const rhs = b - a * x;
    return {
      prompt: `${who(rng)}, a trader in ${place(rng)}, started the day with KES ${b} in her cash box. She then bought x sacks of charcoal at KES ${a} each. At the end of the morning she had KES ${rhs} left. Which equation gives x?`,
      correctEq: `${b} - ${a}x = ${rhs}`,
      wrong: [`${a}x - ${b} = ${rhs}`, `${b} + ${a}x = ${rhs}`, `${a}x - ${b} = ${x}`],
    };
  },
  (rng) => {
    const a = randInt(rng, 10, 40);
    const b = randInt(rng, 500, 1500);
    const x = randInt(rng, 5, 20);
    const rhs = b - a * x;
    return {
      prompt: `A water tank in ${place(rng)} starts with ${b} litres. A farmer draws off x days of irrigation water at ${a} litres per day, leaving ${rhs} litres. Which equation gives x?`,
      correctEq: `${b} - ${a}x = ${rhs}`,
      wrong: [`${a}x - ${b} = ${rhs}`, `${b} + ${a}x = ${rhs}`, `${a}x - ${b} = ${x}`],
    };
  },
  (rng) => {
    const a = randInt(rng, 6, 12);
    const b = randInt(rng, 10, 40);
    const x = randInt(rng, 10, 30);
    const rhs = a * x - b;
    return {
      prompt: `A carpenter in ${place(rng)} charges KES ${a} per hour of work but gives regular customers a fixed KES ${b} discount. ${who(rng)}'s total bill for x hours of work was KES ${rhs}. Which equation gives x?`,
      correctEq: `${a}x - ${b} = ${rhs}`,
      wrong: [`${a}x + ${b} = ${rhs}`, `${b}x - ${a} = ${rhs}`, `${a}x - ${b} = ${x}`],
    };
  },
  (rng) => {
    const a = randInt(rng, 20, 100);
    const b = randInt(rng, 200, 1000);
    const x = randInt(rng, 5, 30);
    const rhs = a * x + b;
    return {
      prompt: `Each of x students at a school in ${place(rng)} contributes KES ${a} towards a trip, and the school adds a fixed KES ${b} sponsorship. The total collected was KES ${rhs}. Which equation models this?`,
      correctEq: `${a}x + ${b} = ${rhs}`,
      wrong: [`${a}x - ${b} = ${rhs}`, `${b}x + ${a} = ${rhs}`, `${a}(x + ${b}) = ${rhs}`],
    };
  },
];

export const linearEquations: Skill = {
  id: "g7-math-a-linear-equations",
  code: "A.2",
  subjectId: "math",
  strandId: "g7-math-algebra",
  grade: 7,
  title: "Linear equations",
  description: "Form and solve linear equations in one unknown, and apply them to real-life situations.",
  generate(rng) {
    const branch = randChoice(rng, ["solve", "solve-classical", "word-to-equation", "solve-and-plot", "match-word", "solve-steps"] as const);

    if (branch === "solve") {
      const x = randInt(rng, 2, 20);
      const a = randInt(rng, 2, 9);
      const form = randChoice(rng, ["ax=b", "ax+c=d", "x/a=b"] as const);
      if (form === "ax=b") {
        const b = a * x;
        return {
          kind: "fill-blank",
          prompt: `Solve for x: $${a}x = ${b}$`,
          before: "x =",
          after: "",
          correctAnswer: String(x),
          inputMode: "numeric",
          hint: `Divide both sides by ${a}.`,
          explanation: `$x = ${b} \\div ${a} = ${x}$.`,
        };
      }
      if (form === "ax+c=d") {
        const c = randInt(rng, 1, 15);
        const d = a * x + c;
        return {
          kind: "fill-blank",
          prompt: `Solve for x: $${a}x + ${c} = ${d}$`,
          before: "x =",
          after: "",
          correctAnswer: String(x),
          inputMode: "numeric",
          hint: `Subtract ${c} from both sides, then divide by ${a}.`,
          explanation: `$${a}x = ${d} - ${c} = ${a * x}$, so $x = ${a * x} \\div ${a} = ${x}$.`,
        };
      }
      const solution = x * a;
      return {
        kind: "fill-blank",
        prompt: `Solve for x: $\\frac{x}{${a}} = ${x}$`,
        before: "x =",
        after: "",
        correctAnswer: String(solution),
        inputMode: "numeric",
        hint: `Multiply both sides by ${a}.`,
        explanation: `$x = ${x} \\times ${a} = ${solution}$.`,
      };
    }

    if (branch === "solve-classical") {
      // Classical two-step equation with the unknown on both sides. Pick x and the
      // coefficient difference first, then derive c from them, so the equation is
      // guaranteed to actually solve to x (not just structurally valid).
      const x = randInt(rng, 2, 15);
      const a = randInt(rng, 3, 8);
      const b = randInt(rng, 1, a - 1);
      const c = (a - b) * x;
      const rhs = b * x + c;
      return {
        kind: "fill-blank",
        prompt: `Solve for x: $${a}x = ${b}x + ${c}$`,
        before: "x =",
        after: "",
        correctAnswer: String(x),
        inputMode: "numeric",
        hint: "Collect the x terms on one side first.",
        explanation: `$${a}x - ${b}x = ${c}$ gives $${a - b}x = ${c}$, so $x = ${c} \\div ${a - b} = ${x}$. Check: $${a} \\times ${x} = ${a * x}$ and $${b} \\times ${x} + ${c} = ${rhs}$.`,
      };
    }

    if (branch === "word-to-equation") {
      const q = randChoice(rng, WORD_EQUATION_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correctEq, q.wrong);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => `$${c}$`),
        correctIndex,
        layout: "list",
        hint: "Identify the fixed amount (added or subtracted once) and the amount that scales with x.",
        explanation: `The correct equation is $${q.correctEq}$.`,
      };
    }

    if (branch === "solve-and-plot") {
      const x = randInt(rng, -8, 8);
      const a = randInt(rng, 2, 6);
      const b = a * x;
      return {
        kind: "number-line",
        prompt: `Solve for x: $${a}x = ${b}$, then click its position on the number line.`,
        hint: `Divide both sides by ${a}.`,
        min: -10,
        max: 10,
        step: 1,
        correctValue: x,
        mode: "point",
        explanation: `$x = ${b} \\div ${a} = ${x}$.`,
      };
    }

    if (branch === "match-word") {
      const a1 = randInt(rng, 2, 9);
      const b1 = randInt(rng, 10, 50);
      const a2 = randInt(rng, 2, 9);
      const b2 = randInt(rng, 10, 50);
      const a3 = randInt(rng, 2, 9);
      const b3 = randInt(rng, 10, 50);
      const a4 = randInt(rng, 2, 9);
      const b4 = randInt(rng, 10, 50);
      const a5 = randInt(rng, 2, 9);
      const a6 = randInt(rng, 2, 9);
      const who1 = who(rng);
      const who2 = who(rng);
      const scenarios = [
        { desc: `A market seller in ${place(rng)} has x tomatoes. She adds ${b1} more from a fresh crate. How many tomatoes does she have now?`, eq: `x + ${b1}` },
        { desc: `A water tank contains x litres. ${b2} litres are drawn out for irrigation. How many litres remain?`, eq: `x - ${b2}` },
        { desc: `A shopkeeper in ${place(rng)} arranges x mangoes into ${a1} equal rows. How many mangoes are in each row?`, eq: `x/${a1}` },
        { desc: `A farmer near ${place(rng)} plants ${a2} rows of x seedlings each. How many seedlings in total?`, eq: `${a2}x` },
        { desc: `${who1} had x oranges and sold ${b3} of them at the market. How many oranges are left?`, eq: `x - ${b3}` },
        { desc: `A teacher in ${place(rng)} shares x pencils equally among ${a3} pupils. How many pencils does each pupil get?`, eq: `x/${a3}` },
        { desc: `A baker in ${place(rng)} bakes ${a4} trays with x loaves on each tray. How many loaves in total?`, eq: `${a4}x` },
        { desc: `A matatu had x passengers, and ${b4} more boarded at the next stop. How many passengers are on board now?`, eq: `x + ${b4}` },
        { desc: `${who2} cycles x kilometres every day for ${a5} days. How far does ${who2} cycle in total?`, eq: `${a5}x` },
        { desc: `A cooperative in ${place(rng)} divides x sacks of maize equally among ${a6} farmers. How many sacks does each farmer get?`, eq: `x/${a6}` },
      ];
      const chosen = shuffle(rng, scenarios).slice(0, 4);
      const tokens = chosen.map((s, i) => ({ id: `d${i}`, label: s.desc }));
      const targets = shuffle(rng, chosen.map((s, i) => ({ id: `e${i}`, label: s.eq })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((s, i) => (correctMap[`e${i}`] = `d${i}`));
      return {
        kind: "click-match",
        prompt: "Match each real-life situation to the algebraic expression that represents it.",
        tokens,
        targets,
        correctMap,
        hint: "Look for whether the situation adds, subtracts, multiplies, or divides x.",
        explanation: chosen.map((s) => `"${s.desc}" → ${s.eq}`).join("; ") + ".",
      };
    }

    // solve-steps: order the steps to solve a two-step linear equation
    const steps = [
      { id: "s1", label: "Write down the equation exactly as given" },
      { id: "s2", label: "Add or subtract the same number from both sides to isolate the term with x" },
      { id: "s3", label: "Divide both sides by the coefficient of x" },
      { id: "s4", label: "Check the answer by substituting it back into the original equation" },
    ];
    return {
      kind: "ordering",
      prompt: "Put these steps for solving a two-step linear equation in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      hint: "You isolate the x-term before you divide by its coefficient, and check your answer last.",
      explanation: "Steps: (1) write the equation, (2) add/subtract to isolate the x-term, (3) divide by the coefficient, (4) check by substitution.",
    };
  },
};
