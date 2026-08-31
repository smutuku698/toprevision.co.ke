import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";

const GLOBALISATION_EFFECTS = [
  { text: "Kenyan farmers can now sell avocados to markets in Europe and Asia thanks to improved trade links.", positive: true },
  { text: "Students in Nairobi can take online courses offered by universities in other countries.", positive: true },
  { text: "Mobile money technology developed in Kenya has been adopted and adapted in other countries.", positive: true },
  { text: "Doctors in Kenya can access the latest medical research published anywhere in the world.", positive: true },
  { text: "Some local languages and cultural practices are fading as global media and trends spread.", positive: false },
  { text: "Wealthier countries often benefit more from global trade than poorer countries.", positive: false },
  { text: "Local businesses in small towns like Kitale can struggle to compete with large multinational companies.", positive: false },
  { text: "Ideas and products from outside can sometimes overshadow local traditions and innovations.", positive: false },
  { text: "Kenyan students can access scholarships and job opportunities in other countries more easily than before.", positive: true },
  { text: "A disease outbreak in one country can spread quickly to others because of increased global travel.", positive: false },
] as const;

const EFFECT_LABEL: Record<string, string> = {
  positive: "Positive effect of globalisation",
  negative: "Negative effect or risk of globalisation",
};

const GLOBAL_CITIZEN_QUALITIES = [
  { id: "diversity", label: "Respect for diversity", example: "Akinyi makes friends with classmates from different countries during an international school exchange" },
  { id: "environment", label: "Environmental responsibility", example: "Kiptoo organises a tree-planting exercise in his community to help fight climate change" },
  { id: "informed", label: "Informed and engaged", example: "Njeri follows international news to understand issues affecting people around the world" },
  { id: "empathetic", label: "Empathetic", example: "Wafula contributes to relief efforts for people affected by a natural disaster in another country" },
  { id: "ethical", label: "Ethical", example: "Achieng chooses to buy products from companies that treat their workers fairly" },
] as const;

const INTERDEPENDENCE_STATEMENTS = [
  "Countries rely on each other for trade, technology, and to solve shared global challenges such as climate change",
  "Countries no longer need to trade or cooperate with each other in the modern world",
  "Every country today produces everything it needs entirely on its own, without any outside help",
  "Global challenges such as climate change and disease only ever affect one country at a time",
] as const;
const INTERDEPENDENCE_CORRECT = INTERDEPENDENCE_STATEMENTS[0];

const LOYALTY_FILL_TEMPLATES = [
  { before: "A good global citizen contributes to the international community while still remaining loyal to their own", after: ".", answer: "country", accepted: ["country", "nation", "homeland"] },
  { before: "Being", after: "of other cultures and traditions is an important quality of a responsible global citizen.", answer: "respectful", accepted: ["respectful", "tolerant", "open-minded"] },
  { before: "Countries today are interconnected through trade, technology, and shared global", after: "such as climate change and disease outbreaks.", answer: "challenges", accepted: ["challenges", "issues", "problems"] },
  { before: "The process by which the world's economies, cultures, and societies become more connected is called", after: ".", answer: "globalisation", accepted: ["globalisation", "globalization"] },
  { before: "A responsible global citizen stays informed about", after: "affecting people in other countries, not only their own.", answer: "issues", accepted: ["issues", "events", "news"] },
  { before: "Mobile money technology developed in Kenya being adopted in other countries is an example of Kenya's", after: "on the wider world.", answer: "influence", accepted: ["influence", "impact"] },
  { before: "A person who buys products only from companies that treat workers fairly is showing", after: "as a global citizen.", answer: "ethics", accepted: ["ethics", "ethical behaviour", "ethical behavior"] },
  { before: "Two or more countries relying on each other for trade, resources, or support is called", after: ".", answer: "interdependence", accepted: ["interdependence", "interdependency"] },
] as const;

export const citizenship: Skill = {
  id: "g7-ss-pdg-citizenship",
  code: "PDG.5",
  subjectId: "social-studies",
  strandId: "g7-ss-pdg",
  grade: 7,
  title: "Citizenship",
  description: "Interconnectedness and interdependence among countries, the effects of globalisation, and the qualities of a responsible global citizen who remains loyal to their own country.",
  generate(rng) {
    const branch = randChoice(rng, ["globalisation-classify", "quality-match", "interdependence-mc", "loyalty-fill"] as const);

    if (branch === "globalisation-classify") {
      const positives = shuffle(rng, GLOBALISATION_EFFECTS.filter((e) => e.positive)).slice(0, 3);
      const negatives = shuffle(rng, GLOBALISATION_EFFECTS.filter((e) => !e.positive)).slice(0, 3);
      const chosen = shuffle(rng, [...positives, ...negatives]);
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.positive ? "positive" : "negative"));
      return {
        kind: "categorize",
        prompt: "Sort each statement into a positive effect of globalisation, or a negative effect or risk of globalisation.",
        items,
        buckets: [
          { id: "positive", label: EFFECT_LABEL.positive },
          { id: "negative", label: EFFECT_LABEL.negative },
        ],
        correctBucket,
        hint: "Globalisation opens up trade and technology, but it can also put pressure on local cultures and businesses.",
        explanation: chosen.map((e) => `"${e.text}" — ${e.positive ? EFFECT_LABEL.positive : EFFECT_LABEL.negative}.`).join(" "),
      };
    }

    if (branch === "quality-match") {
      const chosen = shuffle(rng, GLOBAL_CITIZEN_QUALITIES);
      const tokens = shuffle(rng, chosen.map((q) => ({ id: q.id, label: q.label })));
      const targets = shuffle(rng, chosen.map((q) => ({ id: q.id, label: q.example })));
      const correctMap: Record<string, string> = {};
      for (const q of chosen) correctMap[q.id] = q.id;
      return {
        kind: "click-match",
        prompt: "Match each quality of a responsible global citizen to an example of that quality in action.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each quality would look like as a real action someone takes.",
        explanation: chosen.map((q) => `${q.label}: ${q.example}.`).join(" "),
      };
    }

    if (branch === "interdependence-mc") {
      const { choices, correctIndex } = buildChoicesFromStrings(rng, INTERDEPENDENCE_CORRECT, INTERDEPENDENCE_STATEMENTS, 3);
      return {
        kind: "multiple-choice",
        prompt: "Why are countries interconnected and interdependent in the world today?",
        choices,
        correctIndex,
        hint: "Think about trade, technology, and problems that cross national borders, such as climate change.",
        explanation: `Countries are interdependent today because ${INTERDEPENDENCE_CORRECT.toLowerCase()}.`,
      };
    }

    // loyalty-fill
    const t = randChoice(rng, LOYALTY_FILL_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence about being a global citizen while staying loyal to your own country.",
      before: t.before,
      after: t.after,
      correctAnswer: t.answer,
      acceptedAnswers: [...t.accepted],
      inputMode: "text",
      hint: "A global citizen contributes internationally without losing their sense of belonging at home.",
      explanation: `${t.before} ${t.answer}${t.after}`,
    };
  },
};
