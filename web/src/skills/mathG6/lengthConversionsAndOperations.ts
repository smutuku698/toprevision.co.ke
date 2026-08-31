import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 1 cm = 10 mm.

const KENYAN_PLACES = [
  "Kamukunji, Nairobi", "Gikomba, Nairobi", "Kisumu", "Eldoret", "Nakuru", "Mombasa",
  "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Kericho", "Kakamega", "Nanyuki",
] as const;

function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}
function article(word: string): "A" | "An" {
  return /^[aeiou]/i.test(word) ? "An" : "A";
}
function formatCmMm(cm: number, mm: number): string {
  return `${cm} cm ${mm} mm`;
}
function totalMm(cm: number, mm: number): number {
  return cm * 10 + mm;
}
function fromTotalMm(t: number): { cm: number; mm: number } {
  return { cm: Math.floor(t / 10), mm: t % 10 };
}
function fmtNum(x: number): string {
  return Number.isInteger(x) ? String(x) : x.toFixed(1);
}

// 32 real-world Kenyan measuring contexts — worker + material — feeding the
// add/subtract/multiply/divide word-problem branches.
const CONTEXTS = [
  { worker: "carpenter", material: "a wooden plank" },
  { worker: "tailor", material: "a piece of kitenge fabric" },
  { worker: "electrician", material: "a length of electrical cable" },
  { worker: "plumber", material: "a PVC pipe" },
  { worker: "mason", material: "a steel reinforcement bar" },
  { worker: "welder", material: "a metal rod" },
  { worker: "farmer", material: "a fencing post" },
  { worker: "gardener", material: "a bamboo stake" },
  { worker: "cobbler", material: "a strip of leather" },
  { worker: "tailor", material: "a roll of ribbon for a school uniform" },
  { worker: "builder", material: "a timber beam" },
  { worker: "electrician", material: "a coil of copper wire" },
  { worker: "sign writer", material: "a strip of banner cloth" },
  { worker: "curtain maker", material: "a curtain rail" },
  { worker: "jua kali fundi", material: "the edge of a metal sheet" },
  { worker: "seamstress", material: "an elastic waistband" },
  { worker: "carpenter", material: "a door-frame strip" },
  { worker: "mechanic", material: "a rubber hose" },
  { worker: "tailor", material: "a necktie strip of fabric" },
  { worker: "builder", material: "a skirting board" },
  { worker: "farmer", material: "a rope for tethering a goat" },
  { worker: "fisherman", material: "a fishing line" },
  { worker: "electrician", material: "a trunking strip" },
  { worker: "hardware attendant", material: "a roll of masking tape" },
  { worker: "teacher", material: "a strip of chart paper for the wall display" },
  { worker: "carpenter", material: "a shelf board" },
  { worker: "plumber", material: "a length of copper piping" },
  { worker: "mason", material: "a strip of wire mesh" },
  { worker: "tailor", material: "a waistband for a school skirt" },
  { worker: "builder", material: "a wooden batten" },
  { worker: "electrician", material: "a conduit pipe" },
  { worker: "farmer", material: "a stake for staking tomato plants" },
] as const;

// 32 everyday objects with a defensible typical length, for the real-life estimate branches.
const OBJECT_LENGTHS = [
  { label: "a new HB pencil", cm: 18 },
  { label: "an exercise book (long edge)", cm: 24 },
  { label: "a mobile phone", cm: 15 },
  { label: "a matchbox", cm: 5 },
  { label: "a 30 cm classroom ruler", cm: 30 },
  { label: "a school desk (width)", cm: 60 },
  { label: "a classroom doorway (width)", cm: 80 },
  { label: "a bicycle wheel (diameter)", cm: 66 },
  { label: "an adult's shoe", cm: 27 },
  { label: "a chalkboard duster", cm: 12 },
  { label: "a bar of bathing soap", cm: 8 },
  { label: "a toothbrush", cm: 18 },
  { label: "a textbook (width)", cm: 21 },
  { label: "a table-tennis bat", cm: 25 },
  { label: "a football (diameter)", cm: 22 },
  { label: "a 20-litre jerrycan (height)", cm: 40 },
  { label: "a hoe handle", cm: 100 },
  { label: "a panga (machete) blade", cm: 45 },
  { label: "a broom handle", cm: 120 },
  { label: "a classroom window (height)", cm: 90 },
  { label: "a school bag (height)", cm: 40 },
  { label: "a single mattress (width)", cm: 90 },
  { label: "a matatu seat (width)", cm: 45 },
  { label: "a matatu door (height)", cm: 150 },
  { label: "a cooking sufuria (diameter)", cm: 30 },
  { label: "a laptop (width)", cm: 35 },
  { label: "an A4 sheet of paper (long edge)", cm: 30 },
  { label: "a classroom chalkboard (height)", cm: 120 },
  { label: "a bicycle pedal", cm: 10 },
  { label: "a padlock", cm: 6 },
  { label: "a 500 mL water bottle (height)", cm: 22 },
  { label: "a phone charger cable", cm: 100 },
] as const;

export const lengthConversionsAndOperations: Skill = {
  id: "g6-math-m-length-conversions-operations",
  code: "M.1",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Length: mm, cm and operations",
  description: "Use the millimetre as a unit of length, convert between cm and mm, and add, subtract, multiply and divide lengths given in cm and mm, in real-life Kenyan contexts.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "convert-cm-to-mm",
        "convert-mm-to-cm",
        "add-lengths",
        "subtract-lengths",
        "multiply-lengths",
        "divide-lengths",
        "classical-mixed",
        "relationship-mc",
        "object-estimate",
        "click-match-totals",
        "order-lengths",
        "categorize-objects",
      ] as const
    );

    if (branch === "convert-cm-to-mm") {
      const cm = randInt(rng, 3, 98);
      const mmVal = cm * 10;
      return {
        kind: "fill-blank",
        prompt: `Convert ${cm} cm to millimetres.`,
        before: "",
        after: "mm",
        correctAnswer: String(mmVal),
        inputMode: "numeric",
        hint: "1 cm = 10 mm, so multiply the number of cm by 10.",
        explanation: `${cm} cm × 10 = ${mmVal} mm.`,
      };
    }

    if (branch === "convert-mm-to-cm") {
      const mmVal = randInt(rng, 20, 987);
      const cmVal = mmVal / 10;
      return {
        kind: "fill-blank",
        prompt: `Convert ${mmVal} mm to centimetres.`,
        before: "",
        after: "cm",
        correctAnswer: fmtNum(cmVal),
        inputMode: "numeric",
        hint: "1 cm = 10 mm, so divide the number of mm by 10.",
        explanation: `${mmVal} mm ÷ 10 = ${fmtNum(cmVal)} cm.`,
      };
    }

    if (branch === "add-lengths") {
      const ctx = randChoice(rng, CONTEXTS);
      const cm1 = randInt(rng, 2, 60);
      const mm1 = randInt(rng, 0, 9);
      const cm2 = randInt(rng, 2, 60);
      const mm2 = randInt(rng, 0, 9);
      const sumMm = totalMm(cm1, mm1) + totalMm(cm2, mm2);
      return {
        kind: "fill-blank",
        prompt: `${article(ctx.worker)} ${ctx.worker} in ${place(rng)} joins two pieces of ${ctx.material}: one measuring ${formatCmMm(cm1, mm1)}, and another measuring ${formatCmMm(cm2, mm2)}. What is the total length? Give your answer in mm.`,
        before: "Total =",
        after: "mm",
        correctAnswer: String(sumMm),
        inputMode: "numeric",
        hint: "Convert each length to mm first (1 cm = 10 mm), then add.",
        explanation: `${formatCmMm(cm1, mm1)} = ${totalMm(cm1, mm1)} mm. ${formatCmMm(cm2, mm2)} = ${totalMm(cm2, mm2)} mm. Total = ${totalMm(cm1, mm1)} + ${totalMm(cm2, mm2)} = ${sumMm} mm.`,
      };
    }

    if (branch === "subtract-lengths") {
      const ctx = randChoice(rng, CONTEXTS);
      const cm1 = randInt(rng, 20, 95);
      const mm1 = randInt(rng, 0, 9);
      const cm2 = randInt(rng, 2, cm1 - 5);
      const mm2 = randInt(rng, 0, 9);
      const t1 = totalMm(cm1, mm1);
      const t2 = totalMm(cm2, mm2);
      const diff = t1 - t2;
      return {
        kind: "fill-blank",
        prompt: `${article(ctx.worker)} ${ctx.worker} in ${place(rng)} has ${ctx.material} measuring ${formatCmMm(cm1, mm1)} and cuts off a piece measuring ${formatCmMm(cm2, mm2)}. What length remains? Give your answer in mm.`,
        before: "Remaining length =",
        after: "mm",
        correctAnswer: String(diff),
        inputMode: "numeric",
        hint: "Convert each length to mm first, then subtract the smaller from the larger.",
        explanation: `${formatCmMm(cm1, mm1)} = ${t1} mm. ${formatCmMm(cm2, mm2)} = ${t2} mm. Remaining = ${t1} - ${t2} = ${diff} mm.`,
      };
    }

    if (branch === "multiply-lengths") {
      const ctx = randChoice(rng, CONTEXTS);
      const cm = randInt(rng, 2, 40);
      const mm = randInt(rng, 0, 9);
      const n = randInt(rng, 3, 9);
      const t = totalMm(cm, mm);
      const product = t * n;
      return {
        kind: "fill-blank",
        prompt: `${article(ctx.worker)} ${ctx.worker} in ${place(rng)} cuts ${n} equal pieces of ${ctx.material}, each ${formatCmMm(cm, mm)} long. What is the total length used? Give your answer in mm.`,
        before: "Total length =",
        after: "mm",
        correctAnswer: String(product),
        inputMode: "numeric",
        hint: "Convert one piece's length to mm, then multiply by the number of pieces.",
        explanation: `${formatCmMm(cm, mm)} = ${t} mm. Total = ${t} × ${n} = ${product} mm.`,
      };
    }

    if (branch === "divide-lengths") {
      const ctx = randChoice(rng, CONTEXTS);
      const n = randInt(rng, 2, 8);
      const pieceCm = randInt(rng, 2, 30);
      const pieceMm = randInt(rng, 0, 9);
      const pieceT = totalMm(pieceCm, pieceMm);
      const totalT = pieceT * n;
      const total = fromTotalMm(totalT);
      return {
        kind: "fill-blank",
        prompt: `${article(ctx.worker)} ${ctx.worker} in ${place(rng)} has ${ctx.material} measuring ${formatCmMm(total.cm, total.mm)} in total and cuts it into ${n} equal pieces. How long is each piece? Give your answer in mm.`,
        before: "Each piece =",
        after: "mm",
        correctAnswer: String(pieceT),
        inputMode: "numeric",
        hint: "Convert the total length to mm first, then divide by the number of pieces.",
        explanation: `${formatCmMm(total.cm, total.mm)} = ${totalT} mm. Each piece = ${totalT} ÷ ${n} = ${pieceT} mm.`,
      };
    }

    if (branch === "classical-mixed") {
      const op = randChoice(rng, ["add", "subtract", "multiply", "divide"] as const);
      if (op === "add") {
        const cm1 = randInt(rng, 3, 70);
        const mm1 = randInt(rng, 0, 9);
        const cm2 = randInt(rng, 3, 70);
        const mm2 = randInt(rng, 0, 9);
        const sum = totalMm(cm1, mm1) + totalMm(cm2, mm2);
        return {
          kind: "fill-blank",
          prompt: `Work out: ${formatCmMm(cm1, mm1)} + ${formatCmMm(cm2, mm2)}. Give your answer in mm.`,
          before: "",
          after: "mm",
          correctAnswer: String(sum),
          inputMode: "numeric",
          hint: "Convert both lengths to mm, then add.",
          explanation: `${formatCmMm(cm1, mm1)} = ${totalMm(cm1, mm1)} mm, ${formatCmMm(cm2, mm2)} = ${totalMm(cm2, mm2)} mm. Sum = ${sum} mm.`,
        };
      }
      if (op === "subtract") {
        const cm1 = randInt(rng, 25, 90);
        const mm1 = randInt(rng, 0, 9);
        const cm2 = randInt(rng, 2, cm1 - 5);
        const mm2 = randInt(rng, 0, 9);
        const diff = totalMm(cm1, mm1) - totalMm(cm2, mm2);
        return {
          kind: "fill-blank",
          prompt: `Work out: ${formatCmMm(cm1, mm1)} − ${formatCmMm(cm2, mm2)}. Give your answer in mm.`,
          before: "",
          after: "mm",
          correctAnswer: String(diff),
          inputMode: "numeric",
          hint: "Convert both lengths to mm, then subtract.",
          explanation: `${formatCmMm(cm1, mm1)} = ${totalMm(cm1, mm1)} mm, ${formatCmMm(cm2, mm2)} = ${totalMm(cm2, mm2)} mm. Difference = ${diff} mm.`,
        };
      }
      if (op === "multiply") {
        const cm = randInt(rng, 2, 35);
        const mm = randInt(rng, 0, 9);
        const n = randInt(rng, 2, 9);
        const product = totalMm(cm, mm) * n;
        return {
          kind: "fill-blank",
          prompt: `Work out: ${formatCmMm(cm, mm)} × ${n}. Give your answer in mm.`,
          before: "",
          after: "mm",
          correctAnswer: String(product),
          inputMode: "numeric",
          hint: "Convert to mm first, then multiply.",
          explanation: `${formatCmMm(cm, mm)} = ${totalMm(cm, mm)} mm. ${totalMm(cm, mm)} × ${n} = ${product} mm.`,
        };
      }
      const n = randInt(rng, 2, 9);
      const pieceCm = randInt(rng, 2, 25);
      const pieceMm = randInt(rng, 0, 9);
      const pieceT = totalMm(pieceCm, pieceMm);
      const total = fromTotalMm(pieceT * n);
      return {
        kind: "fill-blank",
        prompt: `Work out: ${formatCmMm(total.cm, total.mm)} ÷ ${n}. Give your answer in mm.`,
        before: "",
        after: "mm",
        correctAnswer: String(pieceT),
        inputMode: "numeric",
        hint: "Convert to mm first, then divide.",
        explanation: `${formatCmMm(total.cm, total.mm)} = ${pieceT * n} mm. ${pieceT * n} ÷ ${n} = ${pieceT} mm.`,
      };
    }

    if (branch === "relationship-mc") {
      const wrong = ["100", "1", "1000"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, "10", wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: "How many millimetres (mm) make up 1 centimetre (cm)?",
        choices,
        correctIndex,
        layout: "row",
        hint: "This is the basic relationship between cm and mm.",
        explanation: "1 cm = 10 mm. (100 confuses it with the metre-to-cm relationship, and 1000 confuses it with the metre-to-mm relationship.)",
      };
    }

    if (branch === "object-estimate") {
      const target = randChoice(rng, OBJECT_LENGTHS);
      const correct = `about ${target.cm} cm`;
      const wrong = [`about ${roundTenDown(target.cm / 10)} cm`, `about ${target.cm * 10} cm`, `about ${target.cm + 40} cm`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which is the most reasonable length for ${target.label}?`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Picture the object next to a 30 cm ruler to judge its size.",
        explanation: `${target.label[0].toUpperCase()}${target.label.slice(1)} is about ${target.cm} cm long. The other options are off by a factor of 10 or are simply too large.`,
      };
    }

    if (branch === "click-match-totals") {
      const chosen = pickDistinctLengths(rng, 4);
      const tokens = shuffle(rng, chosen.map((l, i) => ({ id: `l${i}`, label: formatCmMm(l.cm, l.mm) })));
      const targets = shuffle(rng, chosen.map((l, i) => ({ id: `l${i}`, label: `${totalMm(l.cm, l.mm)} mm` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`l${i}`] = `l${i}`));
      return {
        kind: "click-match",
        prompt: "Match each length to its equivalent in millimetres.",
        tokens,
        targets,
        correctMap,
        hint: "Multiply the cm part by 10, then add the mm part.",
        explanation: chosen.map((l) => `${formatCmMm(l.cm, l.mm)} = ${totalMm(l.cm, l.mm)} mm`).join("; ") + ".",
      };
    }

    if (branch === "order-lengths") {
      const chosen = pickDistinctLengths(rng, 4);
      const items = chosen.map((l, i) => ({ id: `l${i}`, label: formatCmMm(l.cm, l.mm) }));
      const sortedIdx = chosen.map((_, i) => i).sort((a, b) => totalMm(chosen[a].cm, chosen[a].mm) - totalMm(chosen[b].cm, chosen[b].mm));
      return {
        kind: "ordering",
        prompt: "Arrange these lengths from shortest to longest.",
        instruction: "Click them in order, shortest first.",
        items: shuffle(rng, items),
        correctOrder: sortedIdx.map((i) => `l${i}`),
        hint: "Convert every length to mm before comparing.",
        explanation: `In order: ${sortedIdx.map((i) => `${formatCmMm(chosen[i].cm, chosen[i].mm)} (${totalMm(chosen[i].cm, chosen[i].mm)} mm)`).join(", ")}.`,
      };
    }

    // categorize-objects
    const threshold = randChoice(rng, [20, 30, 50] as const);
    const chosenObjects = shuffle(rng, OBJECT_LENGTHS).slice(0, 6);
    const items = chosenObjects.map((o, i) => ({ id: `o${i}`, label: o.label }));
    const buckets = [
      { id: "under", label: `Shorter than ${threshold} cm` },
      { id: "over", label: `${threshold} cm or longer` },
    ];
    const correctBucket: Record<string, string> = {};
    chosenObjects.forEach((o, i) => (correctBucket[`o${i}`] = o.cm < threshold ? "under" : "over"));
    return {
      kind: "categorize",
      prompt: `Sort each object by whether its typical length is shorter than ${threshold} cm, or ${threshold} cm and longer.`,
      items,
      buckets,
      correctBucket,
      hint: "Think about the real-world size of each object.",
      explanation: chosenObjects.map((o) => `${o.label} is about ${o.cm} cm, which is ${o.cm < threshold ? "shorter than" : "at least"} ${threshold} cm`).join("; ") + ".",
    };
  },
};

function roundTenDown(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function pickDistinctLengths(rng: RNG, count: number): { cm: number; mm: number }[] {
  const seen = new Set<number>();
  const result: { cm: number; mm: number }[] = [];
  while (result.length < count) {
    const cm = randInt(rng, 2, 90);
    const mm = randInt(rng, 0, 9);
    const t = totalMm(cm, mm);
    if (!seen.has(t)) {
      seen.add(t);
      result.push({ cm, mm });
    }
  }
  return result;
}
