import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const FEATURES = [
  { text: "Requires two people who each want exactly what the other person has", bucket: "barter" },
  { text: "Has no common way to measure how much one item is worth compared to another", bucket: "barter" },
  { text: "Goods can be hard to divide, such as trading part of a live goat", bucket: "barter" },
  { text: "Goods being traded may perish or spoil before a suitable trading partner is found", bucket: "barter" },
  { text: "Allows a person to store value now and use it to buy something later", bucket: "money" },
  { text: "Provides a common measure of value that makes comparing prices easy", bucket: "money" },
  { text: "Can be exchanged for any good or service without needing a matching want", bucket: "money" },
  { text: "Is easy to carry around compared to bulky goods such as sacks of grain", bucket: "money" },
  { text: "Can be divided into smaller units to pay an exact price", bucket: "money" },
  { text: "Is widely accepted by strangers, not just people within one community", bucket: "money" },
] as const;

const BUCKET_LABEL: Record<string, string> = {
  barter: "A feature of barter trade",
  money: "A feature of currency/money trade",
};

const INTRO_FACTORS = [
  "The difficulty of finding someone who wanted exactly what you had to offer in barter trade",
  "The growth of long-distance trade, which needed a portable and widely accepted medium of exchange",
  "The need for a way to store wealth that would not spoil or die, unlike livestock or crops",
  "Contact with other trading civilisations that already used coins and other currency",
  "The need for a common measure of value to compare the worth of very different goods",
  "The growth of towns and markets, where trading with strangers made matching wants unreliable",
  "The convenience of dividing currency into smaller units to pay an exact price",
] as const;

const IMPACTS = [
  "It made trade faster and easier because buyers and sellers no longer needed matching wants",
  "It allowed people to save wealth for future use instead of it perishing like crops or livestock",
  "It made it possible to compare the value of very different goods using one common measure",
  "It encouraged specialisation, since people could sell what they produced and buy what they needed",
  "It made long-distance trade more practical, since currency was easier to carry than bulky goods",
  "It allowed markets to grow beyond people who already knew and trusted each other",
  "It made taxation and record-keeping easier, since values could be expressed in one common unit",
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "Barter trade", meaning: "The direct exchange of one good or service for another, without using money" },
  { term: "Currency", meaning: "Money in general use as a medium of exchange, such as coins and banknotes" },
  { term: "Medium of exchange", meaning: "Anything widely accepted in trade for goods and services" },
  { term: "Double coincidence of wants", meaning: "The barter problem of needing two people who each want exactly what the other has" },
  { term: "Store of value", meaning: "The ability of money to be saved now and used to buy something of similar worth later" },
  { term: "Unit of account", meaning: "A common measure that lets the value of very different goods be compared" },
  { term: "Commodity money", meaning: "Valued goods, such as cowrie shells or salt, once used as an early medium of exchange" },
  { term: "Legal tender", meaning: "Currency that must, by law, be accepted as payment for a debt" },
] as const;

const MONEY_EVOLUTION_STEPS = [
  { id: "barter", label: "Barter trade — goods exchanged directly for other goods" },
  { id: "commodity", label: "Commodity money — valued goods like cowrie shells, salt, or livestock used as a medium of exchange" },
  { id: "coins", label: "Metal coins — introduced through contact with other trading civilisations" },
  { id: "paper", label: "Paper currency (banknotes) — lighter and easier to carry than coins in bulk" },
  { id: "electronic", label: "Electronic and mobile money — digital payments such as mobile money transfers" },
] as const;

const MARKET_SCENARIOS = [
  { name: "Mutua", place: "Machakos", good: "two goats", wants: "maize", scenario: "barter" },
  { name: "Wanjiku", place: "Nakuru", good: "a basket of vegetables", wants: "cash", scenario: "money" },
  { name: "Kerubo", place: "Kisii", good: "a basket of bananas", wants: "a tin of millet", scenario: "barter" },
  { name: "Mwangi", place: "Nyeri", good: "coffee beans", wants: "money to pay school fees directly", scenario: "money" },
  { name: "Achieng", place: "Kisumu", good: "fresh fish", wants: "sacks of rice", scenario: "barter" },
  { name: "Barasa", place: "Kakamega", good: "sugarcane", wants: "banknotes and coins", scenario: "money" },
  { name: "Naliaka", place: "Bungoma", good: "chickens", wants: "a sack of beans", scenario: "barter" },
  { name: "Otieno", place: "Kisumu", good: "tilapia fish", wants: "mobile money payment", scenario: "money" },
] as const;

export const mediumOfTrade: Skill = {
  id: "g7-ss-pr-medium-of-trade",
  code: "PR.4",
  subjectId: "social-studies",
  strandId: "g7-ss-pr",
  grade: 7,
  title: "Developments in the medium of trade",
  description: "Comparing barter trade and the use of currency in Africa, factors that led to the introduction of money, its impact, and applying this to local Kenyan market scenarios.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "intro-factor", "impact", "market-scenario", "match", "fill-blank", "evolution-order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each trade and money term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about the problems of barter trade, and the functions money serves instead.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const t = randChoice(rng, TERMS);
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence: "${t.meaning}" is the definition of ___.`,
        before: "",
        after: "",
        correctAnswer: t.term,
        acceptedAnswers: [t.term.toLowerCase()],
        inputMode: "text",
        hint: "Think about the trade and money vocabulary that matches this meaning.",
        explanation: `${t.term} — ${t.meaning.toLowerCase()}.`,
      };
    }

    if (branch === "evolution-order") {
      const items = shuffle(rng, MONEY_EVOLUTION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange these stages in the historical development of trade and money, in order.",
        instruction: "Drag to reorder from the earliest stage to the most recent.",
        items,
        correctOrder: MONEY_EVOLUTION_STEPS.map((s) => s.id),
        hint: "Trade began with direct exchange, moved to valued goods as a medium, then metal coins, then paper currency, and finally digital money.",
        explanation: MONEY_EVOLUTION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "classify") {
      const chosen = shuffle(rng, FEATURES).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((f) => f.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each feature as belonging to barter trade or to currency/money trade.",
        items,
        buckets,
        correctBucket,
        hint: "Barter exchanges goods directly; money uses a common medium of exchange.",
        explanation: chosen.map((f) => `"${f.text}" — ${BUCKET_LABEL[f.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "intro-factor") {
      const correct = randChoice(rng, INTRO_FACTORS);
      const others = INTRO_FACTORS.filter((f) => f !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of these was a factor that led to the introduction of money as a medium of trade in Africa?",
        choices,
        correctIndex,
        hint: "Think about the limitations of barter trade that money helped to solve, such as the double coincidence of wants.",
        explanation: `${correct} — this was one of the factors that led to the introduction of money in Africa.`,
      };
    }

    if (branch === "impact") {
      const correct = randChoice(rng, IMPACTS);
      const others = IMPACTS.filter((i) => i !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "What was one impact of introducing money on trade in Africa?",
        choices,
        correctIndex,
        hint: "Think about speed, storing wealth, comparing value, and specialisation.",
        explanation: `${correct} — this is one of the impacts of introducing money as a medium of trade.`,
      };
    }

    // market-scenario
    const s = randChoice(rng, MARKET_SCENARIOS);
    const label = s.scenario === "barter" ? "Barter trade" : "Currency/money trade";
    const other = s.scenario === "barter" ? "Currency/money trade" : "Barter trade";
    const choices = shuffle(rng, [label, other]);
    return {
      kind: "multiple-choice",
      prompt: `${s.name}, a trader in a ${s.place} market, wants to exchange ${s.good} directly for ${s.wants}. What type of trade is this?`,
      choices,
      correctIndex: choices.indexOf(label),
      hint: "Ask whether goods are being exchanged directly for other goods, or exchanged for cash.",
      explanation: `${s.name} exchanging ${s.good} for ${s.wants} in this way is an example of ${label.toLowerCase()}.`,
    };
  },
};
