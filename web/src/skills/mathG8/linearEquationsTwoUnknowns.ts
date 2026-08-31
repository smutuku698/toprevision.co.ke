import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

function eqText(a: number, b: number, c: number): string {
  const bTerm = b === 1 ? "+ y" : b === -1 ? "- y" : b > 0 ? `+ ${b}y` : `- ${Math.abs(b)}y`;
  return `${a}x ${bTerm} = ${c}`;
}

function solvedSystem(rng: import("@/lib/rng").RNG) {
  const a1 = randInt(rng, 1, 9);
  const b1 = randInt(rng, 1, 9);
  let a2 = randInt(rng, 1, 9);
  let b2 = randInt(rng, 1, 9);
  while (a1 * b2 - a2 * b1 === 0) {
    a2 = randInt(rng, 1, 9);
    b2 = randInt(rng, 1, 9);
  }
  const x = randInt(rng, -9, 12);
  const y = randInt(rng, -9, 12);
  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;
  return { a1, b1, c1, a2, b2, c2, x, y };
}

export const linearEquationsTwoUnknowns: Skill = {
  id: "g8-math-a-linear-equations-two-unknowns",
  code: "A.2",
  subjectId: "math",
  strandId: "g8-math-algebra",
  grade: 8,
  title: "Linear equations in two unknowns",
  description: "Form and solve simultaneous linear equations in two unknowns by substitution and elimination, and apply them in real life.",
  generate(rng) {
    const branch = randChoice(rng, ["solve", "form", "order-steps", "match-solution"] as const);

    if (branch === "solve") {
      const { a1, b1, c1, a2, b2, c2, x, y } = solvedSystem(rng);
      const method = randChoice(rng, ["substitution", "elimination"] as const);
      const askX = rng() < 0.5;
      const answer = askX ? x : y;
      // Genuine worked elimination, using the same algebra a student would do:
      // scale by the other equation's y-coefficient to match, then subtract.
      const scaled1X = a1 * b2;
      const scaled2X = a2 * b1;
      const scaledC1 = c1 * b2;
      const scaledC2 = c2 * b1;
      const xCoefDiff = scaled1X - scaled2X;
      const cDiff = scaledC1 - scaledC2;
      const explanation =
        method === "substitution"
          ? `From equation 1: $${eqText(a1, b1, c1)}$, so $y = \\dfrac{${c1} - ${a1}x}{${b1}}$. Substituting this into equation 2 ($${eqText(a2, b2, c2)}$) and solving gives $x = ${x}$; substituting back gives $y = ${y}$.`
          : `Multiply equation 1 by ${b2} and equation 2 by ${b1} so the y-coefficients match: $${scaled1X}x + ${b1 * b2}y = ${scaledC1}$ and $${scaled2X}x + ${b1 * b2}y = ${scaledC2}$. Subtracting eliminates y: $${xCoefDiff}x = ${cDiff}$, so $x = ${x}$. Substituting $x = ${x}$ back into equation 1 gives $y = ${y}$.`;
      return {
        kind: "fill-blank",
        prompt: `Solve the simultaneous equations using ${method}:\nEquation 1: $${eqText(a1, b1, c1)}$\nEquation 2: $${eqText(a2, b2, c2)}$\n\nWhat is the value of ${askX ? "x" : "y"}?`,
        before: `${askX ? "x" : "y"} =`,
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint:
          method === "substitution"
            ? "Make one variable the subject of one equation, then substitute it into the other equation."
            : "Multiply one or both equations so a variable's coefficients match, then add or subtract to eliminate it.",
        explanation,
      };
    }

    if (branch === "form") {
      // p1/b1 and p2/b2 are drawn from disjoint ranges so the two purchases can
      // never collide, and p_i is always different from b_i within a purchase —
      // this keeps every distractor (which swaps/negates these numbers) textually
      // distinct from the correct answer and from each other.
      const p1 = randInt(rng, 4, 7);
      const b1 = randInt(rng, 1, 3);
      const p2 = randInt(rng, 1, 3);
      const b2 = randInt(rng, 4, 7);
      const priceA = randInt(rng, 25, 120);
      const priceB = randInt(rng, 20, 95);
      const total1 = p1 * priceA + b1 * priceB;
      let total2 = p2 * priceA + b2 * priceB;
      if (total2 === total1) total2 += 1;
      const correct = `${p1}x + ${b1}y = ${total1}  and  ${p2}x + ${b2}y = ${total2}`;
      const wrongOptions = [
        `${b1}x + ${p1}y = ${total1}  and  ${b2}x + ${p2}y = ${total2}`,
        `${p1}x + ${b1}y = ${total2}  and  ${p2}x + ${b2}y = ${total1}`,
        `${p1}x - ${b1}y = ${total1}  and  ${p2}x - ${b2}y = ${total2}`,
      ];
      const choices = shuffle(rng, [correct, ...Array.from(new Set(wrongOptions.filter((o) => o !== correct)))]);
      return {
        kind: "multiple-choice",
        prompt: `A shop sells pens at KES x each and notebooks at KES y each. ${p1} pens and ${b1} notebooks cost KES ${total1} in total. ${p2} pens and ${b2} notebooks cost KES ${total2} in total. Which pair of equations represents this situation?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "The number of pens is the coefficient of x, and the number of notebooks is the coefficient of y, on each side of the total cost.",
        explanation: `First purchase: ${p1} pens + ${b1} notebooks = KES ${total1}, so $${p1}x + ${b1}y = ${total1}$. Second purchase: ${p2} pens + ${b2} notebooks = KES ${total2}, so $${p2}x + ${b2}y = ${total2}$.`,
      };
    }

    if (branch === "order-steps") {
      const steps = [
        { id: "s1", label: "Multiply one or both equations so a variable's coefficients match (or are opposites)" },
        { id: "s2", label: "Add or subtract the equations to eliminate that variable" },
        { id: "s3", label: "Solve the resulting one-variable equation" },
        { id: "s4", label: "Substitute the value back into an original equation to find the other variable" },
      ];
      return {
        kind: "ordering",
        prompt: "Put the steps of solving simultaneous equations by elimination in the correct order.",
        instruction: "Click the steps in order.",
        items: shuffle(rng, steps),
        correctOrder: steps.map((s) => s.id),
        hint: "You first prepare the equations, then eliminate, then solve, then go back for the second variable.",
        explanation: "The elimination method: (1) match coefficients, (2) eliminate a variable, (3) solve for the remaining variable, (4) substitute back to find the other variable.",
      };
    }

    // match-solution
    const count = randChoice(rng, [3, 4] as const);
    const systems: ReturnType<typeof solvedSystem>[] = [];
    const seenSolutions = new Set<string>();
    while (systems.length < count) {
      const s = solvedSystem(rng);
      const key = `${s.x},${s.y}`;
      if (!seenSolutions.has(key)) {
        seenSolutions.add(key);
        systems.push(s);
      }
    }
    const tokens = systems.map((s, i) => ({
      id: `sys${i}`,
      label: `${eqText(s.a1, s.b1, s.c1)}, ${eqText(s.a2, s.b2, s.c2)}`,
    }));
    const targets = shuffle(rng, systems.map((s, i) => ({ id: `sol${i}`, label: `x = ${s.x}, y = ${s.y}` })));
    const correctMap: Record<string, string> = {};
    systems.forEach((_, i) => (correctMap[`sol${i}`] = `sys${i}`));
    return {
      kind: "click-match",
      prompt: "Match each pair of simultaneous equations to its solution.",
      tokens: shuffle(rng, tokens),
      targets,
      correctMap,
      hint: "Solve each system by substitution or elimination.",
      explanation: systems.map((s) => `${eqText(s.a1, s.b1, s.c1)}, ${eqText(s.a2, s.b2, s.c2)} → x = ${s.x}, y = ${s.y}`).join("; ") + ".",
    };
  },
};
