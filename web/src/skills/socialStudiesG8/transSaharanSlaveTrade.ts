import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CAUSES = [
  { text: "Demand for cheap labour in North African and Middle Eastern markets", bucket: "cause" },
  { text: "Wars and raids between African communities that captured prisoners", bucket: "cause" },
  { text: "The existence of established caravan trade routes across the Sahara desert", bucket: "cause" },
  { text: "Debts that some people could not repay, leading to enslavement", bucket: "cause" },
  { text: "Depopulation of some African regions as people were taken away", bucket: "effect" },
  { text: "Breakdown of families and communities left behind", bucket: "effect" },
  { text: "Spread of Islam and Arabic culture along the trade routes into parts of Africa", bucket: "effect" },
  { text: "Growth of some African and North African trading towns that profited from the trade", bucket: "effect" },
] as const;

const ORGANISATION_TERMS = [
  { term: "Caravan routes", meaning: "Long desert paths across the Sahara used to march enslaved people north on foot" },
  { term: "Slave markets", meaning: "Towns where captured people were bought and sold, such as Timbuktu and Zawila" },
  { term: "Middlemen", meaning: "African traders or rulers who captured or bought people to sell to North African traders" },
  { term: "Oases", meaning: "Water sources in the desert where caravans rested during the long journey" },
] as const;

const BUCKET_LABEL: Record<string, string> = { cause: "A factor that led to the Trans-Saharan slave trade", effect: "An effect of the Trans-Saharan slave trade" };

const JOURNEY_STAGES = [
  { id: "capture", label: "People were captured through raids, wars, or debt in African communities" },
  { id: "march", label: "Captives were marched across the Sahara desert along established caravan routes" },
  { id: "oasis", label: "The caravan rested and resupplied with water at desert oases along the way" },
  { id: "market", label: "Survivors were sold to buyers at slave markets in North Africa or the Middle East" },
];

export const transSaharanSlaveTrade: Skill = {
  id: "g8-ss-pr-trans-saharan-slave-trade",
  code: "PR.3",
  subjectId: "social-studies",
  strandId: "g8-ss-pr",
  grade: 8,
  title: "Trans-Saharan slave trade",
  description: "Factors that led to the Trans-Saharan slave trade, how it was organised, and its effects on Africa.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "terms", "journey-order", "effect-focus", "social-justice"] as const);

    if (branch === "classify") {
      const chosen = shuffle(rng, CAUSES).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as a cause or an effect of the Trans-Saharan slave trade.",
        items,
        buckets,
        correctBucket,
        hint: "A cause is something that led to the trade starting; an effect is a result of the trade happening.",
        explanation: chosen.map((c) => `"${c.text}" — ${BUCKET_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "terms") {
      const tokens = shuffle(rng, ORGANISATION_TERMS.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, ORGANISATION_TERMS.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of ORGANISATION_TERMS) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each term about the organisation of the Trans-Saharan slave trade to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about how enslaved people were captured, moved, and sold.",
        explanation: ORGANISATION_TERMS.map((t) => `${t.term}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "journey-order") {
      const items = shuffle(rng, JOURNEY_STAGES);
      return {
        kind: "ordering",
        prompt: "Arrange the stages of the Trans-Saharan slave trade's organisation in the correct order.",
        instruction: "Drag to reorder from what happened first to what happened last.",
        items,
        correctOrder: JOURNEY_STAGES.map((s) => s.id),
        hint: "Think about what had to happen before someone could be sold at a market far from home.",
        explanation: JOURNEY_STAGES.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "effect-focus") {
      const effects = CAUSES.filter((c) => c.bucket === "effect").map((c) => c.text);
      const correct = randChoice(rng, effects);
      const others = effects.filter((e) => e !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of these was a genuine effect of the Trans-Saharan slave trade on Africa?",
        choices,
        correctIndex,
        hint: "Think about the long-term social and cultural impact on communities affected by the trade.",
        explanation: `${correct} — this was a real effect of the Trans-Saharan slave trade.`,
      };
    }

    // social-justice
    const actions = [
      "Speaking out against modern-day human trafficking and forced labour",
      "Supporting laws and organisations that protect vulnerable people from exploitation",
      "Learning from history to recognise and reject discrimination based on ethnicity or origin",
      "Reporting cases of abuse or exploitation to the relevant authorities",
    ] as const;
    const correct = randChoice(rng, actions);
    const others = actions.filter((a) => a !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "Learning about the Trans-Saharan slave trade should inspire which of these actions to promote social justice today?",
      choices,
      correctIndex,
      hint: "Think about how understanding this history connects to preventing exploitation today.",
      explanation: `${correct} — this reflects the value of demonstrating assertiveness in promoting social justice.`,
    };
  },
};
