import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const NOBEL_PERSONALITIES = [
  { name: "Wangari Maathai", action: "Founded the Green Belt Movement, planting millions of trees to fight deforestation and empower women in Kenya" },
  { name: "Nelson Mandela", action: "Led the struggle to end apartheid in South Africa and became the country's first democratically elected president" },
  { name: "Malala Yousafzai", action: "Survived an attack for advocating girls' right to education and became a global campaigner for it" },
  { name: "Desmond Tutu", action: "Led South Africa's Truth and Reconciliation Commission to heal divisions after apartheid" },
] as const;

const CITIZEN_QUALITIES = [
  { text: "Respecting people from different cultures, religions, and nationalities", bucket: "global-citizen" },
  { text: "Taking responsibility for protecting the environment for future generations", bucket: "global-citizen" },
  { text: "Volunteering time to help solve a problem in your local community", bucket: "global-citizen" },
  { text: "Staying informed about issues affecting people beyond your own country", bucket: "global-citizen" },
  { text: "Refusing to work with or listen to anyone from a different community", bucket: "not-global-citizen" },
  { text: "Caring only about problems that affect you personally, and no one else", bucket: "not-global-citizen" },
] as const;

const BUCKET_LABEL: Record<string, string> = { "global-citizen": "A quality of a global citizen", "not-global-citizen": "Not a quality of a global citizen" };

const COEXISTENCE_FACTORS = [
  "Regional cooperation through bodies like the East African Community, which promotes trade between neighbouring countries",
  "Sharing a common trade language, such as Kiswahili, across much of East Africa",
  "Cultural exchange through shared music, sport, and tourism between African countries",
  "Cross-border peace agreements that help resolve conflicts between neighbouring communities",
] as const;

export const citizenship: Skill = {
  id: "g8-ss-pdg-citizenship",
  code: "PDG.3",
  subjectId: "social-studies",
  strandId: "g8-ss-pdg",
  grade: 8,
  title: "Citizenship",
  description: "Qualities of a global citizen, how Nobel Prize nominees responded to injustice, factors for harmonious coexistence in East Africa and Africa, and social entrepreneurship.",
  generate(rng) {
    const branch = randChoice(rng, ["nobel-match", "quality-classify", "green-belt-recall", "coexistence"] as const);

    if (branch === "nobel-match") {
      const tokens = shuffle(rng, NOBEL_PERSONALITIES.map((p) => ({ id: p.name, label: p.name })));
      const targets = shuffle(rng, NOBEL_PERSONALITIES.map((p) => ({ id: p.name, label: p.action })));
      const correctMap: Record<string, string> = {};
      for (const p of NOBEL_PERSONALITIES) correctMap[p.name] = p.name;
      return {
        kind: "click-match",
        prompt: "Match each personality to how they responded to injustice or inequality in their society.",
        tokens,
        targets,
        correctMap,
        hint: "Each of these people is known worldwide for standing up against a specific injustice.",
        explanation: NOBEL_PERSONALITIES.map((p) => `${p.name}: ${p.action}.`).join(" "),
      };
    }

    if (branch === "quality-classify") {
      const chosen = shuffle(rng, CITIZEN_QUALITIES).slice(0, 5);
      const buckets = Array.from(new Set(chosen.map((q) => q.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((q, i) => ({ id: `q${i}`, label: q.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((q, i) => (correctBucket[`q${i}`] = q.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement into whether it is a quality of a global citizen in an interconnected society.",
        items,
        buckets,
        correctBucket,
        hint: "A global citizen looks outward — respecting others and taking responsibility beyond just themselves.",
        explanation: chosen.map((q) => `"${q.text}" — ${BUCKET_LABEL[q.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "green-belt-recall") {
      return {
        kind: "fill-blank",
        prompt: "Wangari Maathai founded a movement that planted millions of trees across Kenya and empowered women, for which she won the Nobel Peace Prize in 2004.",
        before: "This movement is called the",
        after: "Movement.",
        correctAnswer: "Green Belt",
        acceptedAnswers: ["green belt", "greenbelt"],
        inputMode: "text",
        hint: "It is named after the belt of trees it aimed to plant across the country.",
        explanation: "The Green Belt Movement, founded by Wangari Maathai in 1977, has planted tens of millions of trees and shows social entrepreneurship and empathy in responding to environmental injustice.",
      };
    }

    // coexistence
    const correct = randChoice(rng, COEXISTENCE_FACTORS);
    const others = COEXISTENCE_FACTORS.filter((f) => f !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "Which of these genuinely promotes harmonious coexistence among citizens in East Africa and Africa?",
      choices,
      correctIndex,
      hint: "Think about what brings neighbouring countries and communities closer together, rather than dividing them.",
      explanation: `${correct} — this is a genuine factor that promotes harmonious coexistence across the region.`,
    };
  },
};
