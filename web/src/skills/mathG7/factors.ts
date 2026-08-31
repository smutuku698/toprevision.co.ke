import { gcd, randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_PLACES = [
  "Kisumu", "Eldoret", "Nakuru", "Mombasa", "Nyeri", "Machakos",
  "Kitale", "Thika", "Kericho", "Malindi", "Nyahururu", "Garissa",
] as const;

function primeFactorize(n: number): number[] {
  const factors: number[] = [];
  let x = n;
  for (let d = 2; d * d <= x; d++) {
    while (x % d === 0) {
      factors.push(d);
      x /= d;
    }
  }
  if (x > 1) factors.push(x);
  return factors;
}

function powerForm(factors: number[]): string {
  const counts = new Map<number, number>();
  for (const f of factors) counts.set(f, (counts.get(f) ?? 0) + 1);
  return [...counts.entries()].map(([base, exp]) => (exp > 1 ? `${base}^{${exp}}` : `${base}`)).join(" \\times ");
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

const DIVISORS = [2, 3, 4, 5, 6, 8, 9, 10, 11] as const;

const REAL_LIFE_LCM = [
  { subject: "Two buses leave the {PLACE} stage together. Bus A returns every {A} minutes, Bus B returns every {B} minutes. After how many minutes will they next leave the stage together?", key: "next-together" },
  { subject: "A baker in {PLACE} wants to pack biscuits into bags of {A} or bags of {B} with none left over either way. What is the smallest number of biscuits that works for both bag sizes?", key: "smallest-number" },
  { subject: "Two water pumps at a {PLACE} borehole switch on together. Pump A switches on every {A} minutes, Pump B every {B} minutes. After how many minutes will they next switch on at the same time?", key: "next-together" },
  { subject: "A trader in {PLACE} wants to arrange mangoes into rows of {A} or rows of {B} with none left over either way. What is the smallest number of mangoes that works for both row sizes?", key: "smallest-number" },
  { subject: "Two traffic lights on a {PLACE} road turn green together. One cycles every {A} seconds, the other every {B} seconds. After how many seconds will they next turn green at the same time?", key: "next-together" },
  { subject: "A tailor in {PLACE} wants to cut fabric into pieces of {A} cm or {B} cm with none left over from a single roll either way. What is the shortest roll length that works for both piece sizes?", key: "smallest-number" },
  { subject: "Two farmers near {PLACE} irrigate their plots together today. One irrigates every {A} days, the other every {B} days. After how many days will they next irrigate on the same day?", key: "next-together" },
  { subject: "A school in {PLACE} wants to seat pupils into rows of {A} or rows of {B} with none left over either way. What is the smallest number of pupils that works for both row sizes?", key: "smallest-number" },
  { subject: "Two boda-boda riders in {PLACE} start their shift together. One takes a break every {A} minutes, the other every {B} minutes. After how many minutes will they next take a break at the same time?", key: "next-together" },
  { subject: "A shopkeeper in {PLACE} wants to pack sweets into packets of {A} or packets of {B} with none left over either way. What is the smallest number of sweets that works for both packet sizes?", key: "smallest-number" },
] as const;

export const factors: Skill = {
  id: "g7-math-n-factors",
  code: "N.2",
  subjectId: "math",
  strandId: "g7-math-numbers",
  grade: 7,
  title: "Factors",
  description: "Test divisibility by 2–11, express composite numbers as a product of prime factors, and find the GCD and LCM by the factor method, including real-life applications.",
  generate(rng) {
    const branch = randChoice(rng, ["divisibility", "prime-factors", "gcd-lcm", "gcd-lcm-word", "sort-divisible", "lcm-steps", "match-prime-factors"] as const);

    if (branch === "divisibility") {
      const n = randInt(rng, 100, 999);
      const d = randChoice(rng, DIVISORS);
      const divisible = n % d === 0;
      return {
        kind: "multiple-choice",
        prompt: `Is ${n} divisible by ${d}?`,
        choices: ["Yes", "No"],
        correctIndex: divisible ? 0 : 1,
        layout: "row",
        hint: d === 2 ? "Check the last digit — is it even?" : d === 5 ? "Check the last digit — is it 0 or 5?" : d === 3 || d === 9 ? "Add up all the digits, then check that sum." : `Divide ${n} by ${d} and check for a remainder.`,
        explanation: `${n} ${divisible ? "divides exactly" : "does not divide exactly"} by ${d} (${n} ÷ ${d} = ${(n / d).toFixed(2)}).`,
      };
    }

    if (branch === "prime-factors") {
      const n = randChoice(rng, [72, 84, 96, 108, 120, 126, 132, 140, 144, 150, 168, 180, 196, 210, 220] as const);
      const factors = primeFactorize(n).sort((a, b) => a - b);
      return {
        kind: "fill-blank",
        prompt: `Express ${n} as a product of its prime factors, in power form (e.g. "2^3 x 3").`,
        before: `${n} =`,
        after: "",
        correctAnswer: powerForm(factors),
        acceptedAnswers: [factors.join(" x "), factors.join(" × ")],
        inputMode: "text",
        hint: "Keep dividing by the smallest prime number that fits, until only 1 is left.",
        explanation: `${n} = ${factors.join(" × ")}, written in power form as $${powerForm(factors)}$.`,
      };
    }

    if (branch === "gcd-lcm") {
      const a = randInt(rng, 12, 90);
      const b = randInt(rng, 12, 90);
      const askGcd = rng() < 0.5;
      const answer = askGcd ? gcd(a, b) : lcm(a, b);
      return {
        kind: "fill-blank",
        prompt: `Find the ${askGcd ? "Greatest Common Divisor (GCD)" : "Least Common Multiple (LCM)"} of ${a} and ${b}, using the factor method.`,
        before: `${askGcd ? "GCD" : "LCM"} =`,
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: askGcd ? "List the factors of both numbers and find the largest one they share." : "The GCD × LCM of two numbers always equals their product.",
        explanation: askGcd
          ? `The GCD of ${a} and ${b} is ${answer}.`
          : `GCD(${a}, ${b}) = ${gcd(a, b)}. Since GCD × LCM = ${a} × ${b} = ${a * b}, LCM $= ${a * b} \\div ${gcd(a, b)} = ${answer}$.`,
      };
    }

    if (branch === "gcd-lcm-word") {
      const A = randChoice(rng, [8, 10, 12, 15, 18, 20] as const);
      const B = randChoice(rng, [6, 9, 14, 16, 21, 24] as const);
      const tpl = randChoice(rng, REAL_LIFE_LCM);
      const answer = lcm(A, B);
      return {
        kind: "fill-blank",
        prompt: tpl.subject.replace(/\{A\}/g, String(A)).replace(/\{B\}/g, String(B)).replace(/\{PLACE\}/g, randChoice(rng, KENYAN_PLACES)),
        before: "Answer =",
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: "This situation asks for the smallest number that both values divide into evenly — the LCM.",
        explanation: `LCM(${A}, ${B}) = ${answer}, using the factor method: GCD(${A}, ${B}) = ${gcd(A, B)}, so LCM $= (${A} \\times ${B}) \\div ${gcd(A, B)} = ${answer}$.`,
      };
    }

    if (branch === "sort-divisible") {
      const d = randChoice(rng, [3, 4, 5, 6, 9] as const);
      const pool = new Set<number>();
      while (pool.size < 6) pool.add(randInt(rng, 30, 300));
      const numbers = [...pool];
      const items = numbers.map((n) => ({ id: String(n), label: String(n) }));
      const buckets = [
        { id: "yes", label: `Divisible by ${d}` },
        { id: "no", label: `Not divisible by ${d}` },
      ];
      const correctBucket: Record<string, string> = {};
      for (const n of numbers) correctBucket[String(n)] = n % d === 0 ? "yes" : "no";
      return {
        kind: "categorize",
        prompt: `Sort each number by whether it is divisible by ${d}.`,
        items,
        buckets,
        correctBucket,
        hint: `Use the divisibility rule for ${d}, or divide directly and check for a remainder.`,
        explanation: numbers.map((n) => `${n} is ${n % d === 0 ? "" : "not "}divisible by ${d}`).join("; ") + ".",
      };
    }

    if (branch === "match-prime-factors") {
      const pool = [72, 84, 96, 108, 120, 126, 132, 140, 144, 150, 168, 180, 196, 210, 220] as const;
      const chosen = shuffle(rng, [...pool]).slice(0, 4);
      const tokens = chosen.map((n) => ({ id: String(n), label: String(n) }));
      const targets = shuffle(rng, chosen.map((n) => ({ id: `f${n}`, label: `$${powerForm(primeFactorize(n).sort((a, b) => a - b))}$` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((n) => (correctMap[`f${n}`] = String(n)));
      return {
        kind: "click-match",
        prompt: "Match each number to its prime factorisation, written in power form.",
        tokens,
        targets,
        correctMap,
        hint: "Keep dividing each number by the smallest prime that fits, until only 1 is left.",
        explanation: chosen.map((n) => `${n} = ${powerForm(primeFactorize(n).sort((a, b) => a - b))}.`).join(" "),
      };
    }

    // lcm-steps: order the steps of the factor method for finding LCM
    const steps = [
      { id: "s1", label: "Write each number as a product of its prime factors" },
      { id: "s2", label: "List every prime factor that appears in either number" },
      { id: "s3", label: "For each prime, take the highest power it appears with in either number" },
      { id: "s4", label: "Multiply those highest powers together to get the LCM" },
    ];
    return {
      kind: "ordering",
      prompt: "Put these steps of the factor method for finding the LCM of two numbers in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      hint: "You always start by breaking each number down into prime factors.",
      explanation: "Factor method for LCM: (1) prime-factorize each number, (2) list all primes involved, (3) take the highest power of each prime, (4) multiply those powers together.",
    };
  },
};
