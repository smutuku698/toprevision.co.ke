import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

// 4.1(a)-(c): building a frequency table from raw data, pictographs (icon-count × key-value),
// and "piling" — physically stacking objects to represent counts, the same maths as a
// pictograph in a different real-world framing. 32 distinct "what is being counted" Kenyan
// contexts — over the 30+ floor for this round. The icon-set VisualSpec only renders a small
// fixed icon set (apple/ball/coin/cube/book/pencil), so every context maps to the closest one.
const CONTEXTS = [
  { subject: "books donated to a school library", icon: "book", unit: "books" },
  { subject: "exercise books bought for a new school term", icon: "book", unit: "exercise books" },
  { subject: "novels borrowed from a mobile library each week", icon: "book", unit: "novels" },
  { subject: "attendance registers marked present each day", icon: "book", unit: "learners" },
  { subject: "storybooks read by a class during a reading week", icon: "book", unit: "storybooks" },
  { subject: "mangoes harvested from a farm each week", icon: "apple", unit: "mangoes" },
  { subject: "oranges sold at a market stall each day", icon: "apple", unit: "oranges" },
  { subject: "avocados picked from a farm's trees", icon: "apple", unit: "avocados" },
  { subject: "tomatoes sold by a greengrocer each day", icon: "apple", unit: "tomatoes" },
  { subject: "bananas loaded onto a lorry for market", icon: "apple", unit: "bunches of bananas" },
  { subject: "eggs collected from a poultry farm each day", icon: "apple", unit: "eggs" },
  { subject: "footballs owned by a school's sports department", icon: "ball", unit: "footballs" },
  { subject: "goals scored by a football team this season", icon: "ball", unit: "goals" },
  { subject: "tennis balls used during a sports tournament", icon: "ball", unit: "tennis balls" },
  { subject: "netballs issued to a girls' team", icon: "ball", unit: "netballs" },
  { subject: "fifty-shilling coins saved in a class piggy bank", icon: "coin", unit: "coins" },
  { subject: "shillings collected for a school trip", icon: "coin", unit: "shillings" },
  { subject: "bus fares collected by a matatu conductor each trip", icon: "coin", unit: "fares" },
  { subject: "coins donated during a church harvest", icon: "coin", unit: "coins" },
  { subject: "sales made by a shopkeeper each day", icon: "coin", unit: "sales" },
  { subject: "matatus passing a bus stage each hour", icon: "coin", unit: "matatus" },
  { subject: "wooden blocks used in a nursery classroom", icon: "cube", unit: "blocks" },
  { subject: "sugar cubes used to sweeten tea at a school canteen", icon: "cube", unit: "sugar cubes" },
  { subject: "parcels delivered by a courier each day", icon: "cube", unit: "parcels" },
  { subject: "bricks laid by a builder each hour", icon: "cube", unit: "bricks" },
  { subject: "cartons of milk delivered to a shop each day", icon: "cube", unit: "cartons" },
  { subject: "jerrycans of water sold by a water vendor each day", icon: "cube", unit: "jerrycans" },
  { subject: "pencils distributed to a new class", icon: "pencil", unit: "pencils" },
  { subject: "crayons given out in a kindergarten class", icon: "pencil", unit: "crayons" },
  { subject: "rulers issued to a mathematics class", icon: "pencil", unit: "rulers" },
  { subject: "chalk sticks used by a teacher each week", icon: "pencil", unit: "chalk sticks" },
  { subject: "patients seen at a rural clinic each day", icon: "book", unit: "patients" },
] as const;

// Fixed small vocabulary of data-handling terms — not a content pool, so it stays under 30.
const TERM_PAIRS = [
  { term: "Frequency", meaning: "How many times a value appears in the data" },
  { term: "Frequency table", meaning: "A table listing each value alongside how often it occurs" },
  { term: "Pictograph", meaning: "A graph that uses repeated icons/pictures to show quantities" },
  { term: "Key (scale)", meaning: "A note showing what one icon or pile item represents" },
  { term: "Piling", meaning: "Representing data by physically stacking objects into piles" },
] as const;

// Fixed 4-step procedure — a procedural sequence, not a content pool.
const FREQUENCY_STEPS = [
  { id: "s1", label: "Collect the raw data" },
  { id: "s2", label: "List every distinct value that appears" },
  { id: "s3", label: "Tally how many times each value occurs" },
  { id: "s4", label: "Write the tally counts as frequencies in the table" },
] as const;

export const frequencyTablesAndPictographs: Skill = {
  id: "g6-math-d-frequency-pictographs",
  code: "D.1",
  subjectId: "math",
  strandId: "g6-math-data",
  grade: 6,
  title: "Frequency tables and pictographs",
  description: "Build a frequency table from raw data, represent data using pictographs and physical piling, and interpret them in both directions.",
  generate(rng) {
    const branch = randChoice(rng, ["frequency-table", "pictograph", "piling", "half-icon", "term-match", "classify-scale", "table-steps"] as const);

    if (branch === "frequency-table") {
      const ctx = randChoice(rng, CONTEXTS);
      const values = Array.from({ length: 15 }, () => randInt(rng, 1, 5));
      const freq = new Map<number, number>();
      for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
      const target = randInt(rng, 1, 5);
      const answer = freq.get(target) ?? 0;
      return {
        kind: "fill-blank",
        prompt: `This raw data shows ${ctx.subject}, recorded from 15 households: ${values.join(", ")}. Using a frequency distribution table, how many times does the value ${target} appear?`,
        before: "Frequency =",
        after: "",
        correctAnswer: String(answer),
        inputMode: "numeric",
        hint: "Count how many times the value appears in the list.",
        explanation: `The value ${target} appears ${answer} time${answer === 1 ? "" : "s"} in the data, so its frequency is ${answer}.`,
      };
    }

    if (branch === "pictograph") {
      const ctx = randChoice(rng, CONTEXTS);
      const keyValue = randChoice(rng, [2, 5, 10, 20] as const);
      const iconCount = randInt(rng, 3, 8);
      const total = keyValue * iconCount;
      const askTotal = rng() < 0.55;
      if (askTotal) {
        return {
          kind: "fill-blank",
          prompt: `A pictograph shows ${ctx.subject}, where each icon represents ${keyValue} ${ctx.unit}. The pictograph below shows ${iconCount} icons. Find the total number of ${ctx.unit}.`,
          visual: { type: "icon-set", icon: ctx.icon, count: iconCount, color: "#0ea5e9" },
          before: `Total ${ctx.unit} =`,
          after: "",
          correctAnswer: String(total),
          inputMode: "numeric",
          hint: "Multiply the number of icons by the value each icon represents.",
          explanation: `${iconCount} icons × ${keyValue} ${ctx.unit} each = ${total} ${ctx.unit}.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `A pictograph shows ${ctx.subject}, where each icon represents ${keyValue} ${ctx.unit}. There were ${total} ${ctx.unit} in total. How many icons should be drawn?`,
        before: "Number of icons =",
        after: "",
        correctAnswer: String(iconCount),
        inputMode: "numeric",
        hint: "Divide the total by the value each icon represents.",
        explanation: `${total} ÷ ${keyValue} = ${iconCount} icons.`,
      };
    }

    if (branch === "piling") {
      const ctx = randChoice(rng, CONTEXTS);
      const keyValue = randChoice(rng, [2, 3, 5, 10] as const);
      const pileCount = randInt(rng, 3, 9);
      const total = keyValue * pileCount;
      const askTotal = rng() < 0.55;
      if (askTotal) {
        return {
          kind: "fill-blank",
          prompt: `To show ${ctx.subject}, a class stacks bottle tops into equal piles, where each bottle top in a pile represents ${keyValue} ${ctx.unit}. If there are ${pileCount} bottle tops piled up, find the total number of ${ctx.unit} represented.`,
          visual: { type: "icon-set", icon: "cube", count: pileCount, color: "#7c3aed" },
          before: `Total ${ctx.unit} =`,
          after: "",
          correctAnswer: String(total),
          inputMode: "numeric",
          hint: "Multiply the number of piled objects by the value each object represents.",
          explanation: `${pileCount} × ${keyValue} ${ctx.unit} each = ${total} ${ctx.unit}.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `To show ${ctx.subject}, a class stacks bottle tops so that each one represents ${keyValue} ${ctx.unit}. There were ${total} ${ctx.unit} in total. How many bottle tops should be piled up?`,
        before: "Number of bottle tops =",
        after: "",
        correctAnswer: String(pileCount),
        inputMode: "numeric",
        hint: "Divide the total by the value each piled object represents.",
        explanation: `${total} ÷ ${keyValue} = ${pileCount} bottle tops.`,
      };
    }

    if (branch === "half-icon") {
      const ctx = randChoice(rng, CONTEXTS);
      const keyValue = randChoice(rng, [4, 6, 10, 20] as const);
      const halfValue = keyValue / 2;
      const wholeIcons = randInt(rng, 2, 6);
      const total = wholeIcons * keyValue + halfValue;
      const correct = `${wholeIcons} whole icons and 1 half icon`;
      const wrong = [`${wholeIcons + 1} whole icons`, `${wholeIcons} whole icons only`, `${wholeIcons} whole icons and 1 quarter icon`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `A pictograph's key says 1 icon = ${keyValue} ${ctx.unit}, showing ${ctx.subject}. To show a total of ${total} ${ctx.unit}, what should be drawn?`,
        choices,
        correctIndex,
        layout: "list",
        hint: `${total} ÷ ${keyValue} does not divide evenly — work out how many whole icons fit, then what fraction of an icon represents the remainder.`,
        explanation: `${wholeIcons} × ${keyValue} = ${wholeIcons * keyValue}, leaving ${halfValue} — exactly half of ${keyValue} — so you draw ${wholeIcons} whole icons plus one half icon.`,
      };
    }

    if (branch === "term-match") {
      const chosen = shuffle(rng, TERM_PAIRS).slice(0, 4);
      const tokens = chosen.map((p, i) => ({ id: `t${i}`, label: p.term }));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `m${i}`, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`m${i}`] = `t${i}`));
      return {
        kind: "click-match",
        prompt: "Match each data-handling term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each term describes: counting, a table, a picture-based graph, or a stacking method.",
        explanation: chosen.map((p) => `${p.term}: ${p.meaning}`).join("; ") + ".",
      };
    }

    if (branch === "classify-scale") {
      const keyValue = randChoice(rng, [2, 4, 5, 10] as const);
      const items = Array.from({ length: 5 }, () => {
        const total = randInt(rng, 5, 60) * randInt(rng, 1, 3);
        return { total, remainder: total % keyValue };
      });
      const dedup = items.filter((it, i) => items.findIndex((o) => o.total === it.total) === i);
      const finalItems = dedup.map((it, i) => ({ id: `s${i}`, label: `Total = ${it.total}` }));
      const buckets = [
        { id: "whole", label: "Draws a whole number of icons" },
        { id: "part", label: "Needs a part (fraction) of an icon" },
      ];
      const correctBucket: Record<string, string> = {};
      dedup.forEach((it, i) => (correctBucket[`s${i}`] = it.remainder === 0 ? "whole" : "part"));
      return {
        kind: "categorize",
        prompt: `A pictograph's key is 1 icon = ${keyValue} items. Sort each total by whether it needs a whole number of icons, or part of an icon.`,
        items: finalItems,
        buckets,
        correctBucket,
        hint: `Divide each total by ${keyValue} — if it divides evenly, no partial icon is needed.`,
        explanation: dedup.map((it) => `${it.total} ÷ ${keyValue} ${it.remainder === 0 ? "divides evenly" : `leaves a remainder of ${it.remainder}`}`).join("; ") + ".",
      };
    }

    // table-steps: order the steps for building a frequency distribution table
    return {
      kind: "ordering",
      prompt: "Put these steps for building a frequency distribution table from raw data in the correct order.",
      instruction: "Click the steps in order.",
      items: shuffle(rng, FREQUENCY_STEPS),
      correctOrder: FREQUENCY_STEPS.map((s) => s.id),
      hint: "You must have the raw data and know the distinct values before you can tally them.",
      explanation: "Steps: (1) collect the raw data, (2) list distinct values, (3) tally occurrences, (4) record as frequencies.",
    };
  },
};
