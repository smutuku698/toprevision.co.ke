import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const TRADITIONAL_FORMS = [
  { text: "A person captured during inter-community conflict was kept to work for the victors", form: "War captivity" },
  { text: "A person unable to repay a debt worked for the lender until the debt was cleared", form: "Debt bondage" },
  { text: "A person found guilty of a serious offence was made to serve the wronged family as punishment", form: "Punishment for wrongdoing" },
] as const;

const TRADE_FACTORS = [
  "Demand for labour on plantations and in households across Arabia, Persia, and India",
  "Existing trade networks along the East African coast that traders extended to include human beings",
  "Political instability and conflict inland, which produced captives who were then trafficked to the coast",
  "The profitability of trading enslaved people alongside ivory, gold, and other coastal exports",
  "The role of coastal trading towns such as Zanzibar as major markets for enslaved people",
  "The involvement of some inland communities and traders in capturing and supplying captives",
  "Weak or absent central authority in some inland regions, making raiding easier to carry out",
  "Growing demand for household servants and labourers in trading centres along the coast",
] as const;

const EXTENT_FACTS = [
  { text: "The East African coast, including areas of present-day Kenya, was a key source region", correct: true },
  { text: "Captives were marched from the interior toward coastal towns such as Mombasa and Zanzibar", correct: true },
  { text: "From the coast, routes carried enslaved people across the Indian Ocean to Arabia, Persia, and India", correct: true },
  { text: "The Indian Ocean slave trade mainly involved routes across the Atlantic Ocean to the Americas", correct: false },
  { text: "Zanzibar became one of the largest slave markets on the East African coast", correct: true },
  { text: "The Indian Ocean slave trade had no connection at all to inland regions of East Africa", correct: false },
  { text: "Captives were sometimes forced to carry ivory on the long march to the coast", correct: true },
  { text: "The Indian Ocean slave trade ended before it ever reached present-day Kenya", correct: false },
  { text: "Coastal towns such as Mombasa and Zanzibar served as major departure points for the trade routes", correct: true },
  { text: "The Indian Ocean slave trade was organised entirely by a single East African kingdom acting alone", correct: false },
] as const;

const DIGNITY_REASONS = [
  "Every human being has inherent worth that must never be treated as property to be bought or sold",
  "Understanding this history helps a society commit to protecting human rights today",
  "Remembering this history honours the suffering of those affected and helps prevent it from repeating",
  "It teaches that peace and justice depend on respecting the freedom and dignity of every person",
  "It helps learners recognise and reject modern forms of exploitation and forced labour",
  "It builds empathy by helping learners understand the lasting impact of historical injustice",
  "It reinforces the constitutional principle that every Kenyan is equal in dignity and rights",
  "It encourages learners to stand up against discrimination and mistreatment of others today",
] as const;

const ROUTE_STEPS = [
  { id: "capture", label: "Captives are taken inland, often due to conflict, raiding, or debt" },
  { id: "march", label: "Captives are marched toward the coast, sometimes forced to also carry ivory" },
  { id: "arrive", label: "Captives arrive at coastal trading towns, such as Mombasa or Zanzibar" },
  { id: "sell", label: "Captives are sold at coastal slave markets" },
  { id: "cross", label: "Captives are transported by sea across the Indian Ocean to Arabia, Persia, or India" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A condition of being forced to work for someone else without freedom is called ", after: ".", correctAnswer: "servitude", accepted: ["servitude"], explanation: "Servitude is a condition of being forced to work for someone else without freedom." },
  { before: "Being forced to work for a lender until a debt is repaid is called debt ", after: ".", correctAnswer: "bondage", accepted: ["bondage"], explanation: "Debt bondage is being forced to work for a lender until a debt is repaid." },
  { before: "The inherent worth and respect every human being is owed is called human ", after: ".", correctAnswer: "dignity", accepted: ["dignity"], explanation: "Human dignity is the inherent worth and respect every person is owed, regardless of circumstance." },
  { before: "The formal ending of slavery and the slave trade is called ", after: ".", correctAnswer: "abolition", accepted: ["abolition"], explanation: "Abolition is the formal ending of slavery and the slave trade." },
  { before: "A person taken and held against their will, such as during conflict, is called a ", after: ".", correctAnswer: "captive", accepted: ["captive"], explanation: "A captive is a person taken and held against their will, such as during a conflict or a raid." },
  { before: "The illegal transporting and trading of people for forced labour or exploitation is called human ", after: ".", correctAnswer: "trafficking", accepted: ["trafficking"], explanation: "Human trafficking is the illegal transporting and trading of people for forced labour or exploitation." },
] as const;

export const slaveryAndServitude: Skill = {
  id: "g7-ss-pr-slavery-and-servitude",
  code: "PR.3",
  subjectId: "social-studies",
  strandId: "g7-ss-pr",
  grade: 7,
  title: "Slavery and servitude",
  description: "Forms of slavery and servitude in traditional African society, factors behind the Indian Ocean slave trade, its geographical extent along the East African coast, and the importance of human dignity.",
  generate(rng) {
    const branch = randChoice(rng, ["form-match", "trade-factor", "extent-check", "dignity-reason", "fill-blank", "route-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about slavery and servitude.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe historical servitude and human dignity.",
        explanation: fb.explanation,
      };
    }

    if (branch === "route-order") {
      const items = shuffle(rng, ROUTE_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the stages of the Indian Ocean slave trade route, from inland capture to crossing the ocean, in order.",
        instruction: "Drag to reorder from the first stage to the last stage.",
        items,
        correctOrder: ROUTE_STEPS.map((s) => s.id),
        hint: "Captives were taken inland first, then marched to the coast, sold there, and finally shipped across the ocean.",
        explanation: ROUTE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "form-match") {
      const tokens = shuffle(rng, TRADITIONAL_FORMS.map((f) => ({ id: f.form, label: f.form })));
      const targets = shuffle(rng, TRADITIONAL_FORMS.map((f) => ({ id: f.form, label: f.text })));
      const correctMap: Record<string, string> = {};
      for (const f of TRADITIONAL_FORMS) correctMap[f.form] = f.form;
      return {
        kind: "click-match",
        prompt: "Match each form of servitude found in traditional African society to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Think about how a person could end up in a position of servitude — through conflict, debt, or punishment.",
        explanation: TRADITIONAL_FORMS.map((f) => `${f.form}: ${f.text}.`).join(" "),
      };
    }

    if (branch === "trade-factor") {
      const correct = randChoice(rng, TRADE_FACTORS);
      const others = TRADE_FACTORS.filter((f) => f !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of these was a factor that led to the development of the Indian Ocean slave trade?",
        choices,
        correctIndex,
        hint: "Think about demand for labour, existing trade routes, and instability in the interior.",
        explanation: `${correct} — this was one of the factors behind the development of the Indian Ocean slave trade.`,
      };
    }

    if (branch === "extent-check") {
      const chosen = shuffle(rng, EXTENT_FACTS).slice(0, 4);
      const buckets = [
        { id: "true", label: "Correctly describes the Indian Ocean slave trade" },
        { id: "false", label: "Does not correctly describe the Indian Ocean slave trade" },
      ];
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.correct ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: "Sort each statement about the Indian Ocean slave trade as correct or incorrect.",
        items,
        buckets,
        correctBucket,
        hint: "The Indian Ocean slave trade moved people from the East African coast across the Indian Ocean, not the Atlantic.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.correct ? "correct" : "incorrect"}.`).join(" "),
      };
    }

    // dignity-reason
    const correct = randChoice(rng, DIGNITY_REASONS);
    const others = DIGNITY_REASONS.filter((r) => r !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "Why is it important to promote human dignity when learning about the history of slavery and servitude?",
      choices,
      correctIndex,
      hint: "Think about the inherent worth of every person and how history teaches us to protect human rights.",
      explanation: `${correct} — this is why promoting human dignity matters when studying this history.`,
    };
  },
};
