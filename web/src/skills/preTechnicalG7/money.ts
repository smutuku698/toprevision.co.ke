import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const COIN_VALUES = [1, 5, 10, 20] as const;
const NOTE_VALUES = [50, 100, 200, 500, 1000] as const;
const ALL_VALUES = [...COIN_VALUES, ...NOTE_VALUES];

const CHARACTERISTICS = [
  { id: "portability", label: "Portability", meaning: "Money is easy to carry around" },
  { id: "durability", label: "Durability", meaning: "Money does not wear out or get damaged easily" },
  { id: "divisibility", label: "Divisibility", meaning: "Money can be broken into smaller units for exact change" },
  { id: "acceptability", label: "Acceptability", meaning: "Money is widely accepted by everyone as payment" },
] as const;

const USE_VS_CHARACTERISTIC = [
  { text: "Buying goods at a market", bucket: "use" },
  { text: "Saving cash for future use", bucket: "use" },
  { text: "Comparing which of two items costs more", bucket: "use" },
  { text: "Borrowing money now and repaying it later", bucket: "use" },
  { text: "Paying a worker's wage at the end of the month", bucket: "use" },
  { text: "Setting a price for a good or service", bucket: "use" },
  { text: "Can be divided into coins of different value for exact change", bucket: "characteristic" },
  { text: "Is light and easy to carry around in a pocket", bucket: "characteristic" },
  { text: "Does not wear out quickly with everyday use", bucket: "characteristic" },
  { text: "Is accepted by everyone as a form of payment", bucket: "characteristic" },
  { text: "Keeps roughly the same value from one transaction to the next", bucket: "characteristic" },
  { text: "Can be counted out in exact, uniform units", bucket: "characteristic" },
] as const;

const SECURITY_QUESTIONS = [
  {
    prompt: "Which of these is a security feature found on genuine Kenyan banknotes, used to detect fakes?",
    correct: "A watermark that becomes visible when the note is held up to the light",
    wrong: ["A printed price tag on the note", "A barcode that must be scanned by a shopkeeper", "A hand-written serial number added by the bank teller"],
    explanation: "A watermark visible when held up to the light is a genuine security feature; raised print, security threads and holograms are others.",
  },
  {
    prompt: "Why do genuine Kenyan banknotes have security features such as watermarks and security threads?",
    correct: "To make it possible to tell a genuine note apart from a fake one",
    wrong: ["To make the notes more colourful", "To show which bank printed the note", "To make the notes lighter to carry"],
    explanation: "Security features exist so that people can check whether a note is genuine and detect counterfeit (fake) money.",
  },
  {
    prompt: "A shopkeeper feels a raised, textured print on part of a banknote when running a finger over it. What is this security feature for?",
    correct: "It lets a person verify a note's authenticity by touch, which is harder for a counterfeiter to copy accurately",
    wrong: ["It is only there to make the note more comfortable to hold", "It shows how many times the note has been used", "It has no real security purpose"],
    explanation: "Raised (intaglio) print is a genuine security feature — its texture is difficult to reproduce accurately, so checking it by touch helps detect fakes.",
  },
  {
    prompt: "A customer tilts a banknote and sees the colour of a printed number appear to shift. What does this security feature help with?",
    correct: "Colour-shifting ink is very difficult to counterfeit, so it helps confirm the note is genuine",
    wrong: ["It only shows the note's serial number", "It shows which year the note was printed", "It has no connection to detecting fake notes"],
    explanation: "Colour-shifting ink changes appearance depending on the viewing angle — a genuine feature that is hard for counterfeiters to reproduce.",
  },
  {
    prompt: "Why should someone always check a banknote's security features before accepting it as payment for an expensive item?",
    correct: "To avoid accepting a counterfeit note and losing money on a fake",
    wrong: ["It is not actually necessary to check at all", "Only banks are ever affected by counterfeit notes", "Checking security features is only required for coins"],
    explanation: "Anyone can be handed a counterfeit note, so checking security features before accepting payment protects against a real financial loss.",
  },
] as const;

export const money: Skill = {
  id: "g7-pt-ent-money",
  code: "ENT.2",
  subjectId: "pre-technical",
  strandId: "g7-pt-entrepreneurship",
  grade: 7,
  title: "Money",
  description: "Characteristics of money as a medium of exchange, its uses, the denominations of the Kenyan currency, and its security features.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-currency", "characteristic-match", "use-vs-characteristic", "security", "fill-smallest", "denomination-order"] as const);

    if (branch === "identify-currency") {
      const kind = randChoice(rng, ["coin", "note"] as const);
      const values = kind === "coin" ? COIN_VALUES : NOTE_VALUES;
      const value = randChoice(rng, values);
      const others = values.filter((v) => v !== value);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        `KES ${value}`,
        others.map((v) => `KES ${v}`),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `Which denomination of Kenyan currency ${kind === "coin" ? "coin" : "note"} is shown here?`,
        visual: { type: "kenyan-currency", kind, value },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is the KES ${value} ${kind}.`,
      };
    }

    if (branch === "characteristic-match") {
      const tokens = shuffle(rng, CHARACTERISTICS.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, CHARACTERISTICS.map((c) => ({ id: c.id, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of CHARACTERISTICS) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: "Match each characteristic of money to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about carrying, wearing out, dividing into change, and being accepted.",
        explanation: CHARACTERISTICS.map((c) => `${c.label} — ${c.meaning}.`).join(" "),
      };
    }

    if (branch === "use-vs-characteristic") {
      const chosen = shuffle(rng, USE_VS_CHARACTERISTIC).slice(0, 6);
      const items = chosen.map((u, i) => ({ id: `u${i}`, label: u.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((u, i) => (correctBucket[`u${i}`] = u.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as a use of money or a characteristic of money.",
        items,
        buckets: [
          { id: "use", label: "Use of money" },
          { id: "characteristic", label: "Characteristic of money" },
        ],
        correctBucket,
        hint: "A use is what money lets you DO; a characteristic is a property money HAS.",
        explanation: chosen.map((u) => `"${u.text}" is a ${u.bucket === "use" ? "use" : "characteristic"} of money.`).join(" "),
      };
    }

    if (branch === "security") {
      const q = randChoice(rng, SECURITY_QUESTIONS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        explanation: q.explanation,
      };
    }

    if (branch === "fill-smallest") {
      const useSmallest = randChoice(rng, [true, false]);
      if (useSmallest) {
        return {
          kind: "fill-blank",
          prompt: "Complete the sentence.",
          before: "The smallest coin denomination currently in circulation in Kenya is the ",
          after: " shilling coin.",
          correctAnswer: "1",
          acceptedAnswers: ["1", "one"],
          inputMode: "text",
          hint: "Kenyan coins in circulation are 1, 5, 10 and 20 shillings.",
          explanation: "The 1 shilling coin is the smallest denomination of Kenyan coin currently in circulation.",
        };
      }
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence.",
        before: "Kenyan currency notes currently in circulation include the 50, 100, 200, 500 and ",
        after: " shilling notes.",
        correctAnswer: "1000",
        acceptedAnswers: ["1000", "1,000"],
        inputMode: "numeric",
        hint: "This is the largest Kenyan banknote denomination.",
        explanation: "The 1000 shilling note is the largest Kenyan banknote currently in circulation.",
      };
    }

    const sample = shuffle(rng, ALL_VALUES).slice(0, 4).sort((a, b) => a - b);
    const shuffledForDisplay = shuffle(rng, sample);
    return {
      kind: "ordering",
      prompt: `Arrange these Kenyan currency denominations from smallest to largest: ${shuffledForDisplay.map((v) => `KES ${v}`).join(", ")}.`,
      items: shuffledForDisplay.map((v) => ({ id: String(v), label: `KES ${v}` })),
      correctOrder: sample.map((v) => String(v)),
      instruction: "Drag to arrange from smallest to largest.",
      hint: "Compare the numbers — smaller value comes first.",
      explanation: `From smallest to largest: ${sample.map((v) => `KES ${v}`).join(", ")}.`,
    };
  },
};
