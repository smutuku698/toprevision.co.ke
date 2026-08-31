import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ORIGIN_ACCOUNTS = [
  { text: "A Kikuyu account tells of Gikuyu and Mumbi being placed on Mount Kenya (Kirinyaga) by Ngai as the first parents", type: "traditional" },
  { text: "A Luo account describes the first people being formed and placed near a great lake by a creator spirit", type: "traditional" },
  { text: "A Maasai account tells of Enkai lowering cattle and the first people down from the sky on a rope", type: "traditional" },
  { text: "A Mijikenda account tells of the first ancestors arriving at Shungwaya before settling along the coast", type: "traditional" },
  { text: "An Akamba account describes the first man and woman being created by Mulungu on a mountain", type: "traditional" },
  { text: "The Christian account in the book of Genesis describes God forming Adam from dust and Eve from Adam's rib", type: "religious" },
  { text: "The Islamic account describes Allah creating Adam from clay and then creating Hawa (Eve)", type: "religious" },
  { text: "A Hindu account describes the god Brahma creating the first humans as part of the ordered universe", type: "religious" },
  { text: "The traditional Chinese account describes the goddess Nüwa moulding the first humans from yellow clay", type: "religious" },
  { text: "A traditional Yoruba account describes the god Obatala moulding the first human figures from clay before Olodumare gave them life", type: "religious" },
] as const;

const TYPE_LABEL: Record<string, string> = {
  traditional: "Traditional/community origin story",
  religious: "Religious origin story",
};

const COMMON_THEMES = [
  "A powerful creator figure who intentionally forms the first human beings",
  "Humans being formed from natural elements such as soil, dust, or clay",
  "A first man and a first woman who become the ancestors of all people",
  "A special or sacred place linked to where the first humans appeared",
  "Life or a soul being given to the first humans by the creator figure, not arising on its own",
  "The first humans being formed before any other living creature",
  "A close, ongoing relationship between the creator and the humans who are formed",
  "The account being passed down and retold across many generations",
] as const;

const CREATOR_FILL_BLANKS = [
  { before: "In Kikuyu tradition, Gikuyu and Mumbi were placed on Mount Kenya by the creator known as ", after: ".", correctAnswer: "Ngai", accepted: ["ngai"] },
  { before: "In Maasai tradition, the creator who lowered cattle and the first people down from the sky is called ", after: ".", correctAnswer: "Enkai", accepted: ["enkai"] },
  { before: "In Akamba tradition, the first man and woman were created by ", after: " on a mountain.", correctAnswer: "Mulungu", accepted: ["mulungu"] },
  { before: "In the Christian account in Genesis, God formed the first man from dust and named him ", after: ".", correctAnswer: "Adam", accepted: ["adam"] },
  { before: "In the Islamic account, Allah created the first woman, known as ", after: ".", correctAnswer: "Hawa", accepted: ["hawa"] },
  { before: "In the Hindu account, the god who created the first humans as part of the ordered universe is ", after: ".", correctAnswer: "Brahma", accepted: ["brahma"] },
  { before: "In the traditional Chinese account, the goddess who moulded the first humans from yellow clay is ", after: ".", correctAnswer: "Nüwa", accepted: ["nuwa", "nüwa"] },
  { before: "In Yoruba tradition, the god who moulded the first human figures from clay is ", after: ".", correctAnswer: "Obatala", accepted: ["obatala"] },
] as const;

const DIALOGUE_STEPS = [
  { id: "listen", label: "Listen to understand the other person's account, without interrupting" },
  { id: "ask", label: "Ask respectful, genuine questions rather than mocking or dismissing it" },
  { id: "acknowledge", label: "Acknowledge that the account is meaningful to the person who holds it" },
  { id: "share", label: "Calmly share your own perspective if invited to" },
  { id: "find-themes", label: "Look for common themes rather than focusing only on the differences" },
] as const;

const RESPECT_REASONS = [
  "It allows learners from different communities and faiths to feel that their own beliefs are valued",
  "It reduces conflict and builds unity in a classroom where learners hold different beliefs",
  "It reflects the constitutional value of freedom of religion and belief in Kenya",
  "It helps learners appreciate Kenya's rich diversity of cultures and faiths instead of dismissing them",
  "It models respectful dialogue that learners can carry into other disagreements outside the classroom",
  "It prevents any single community's or faith's account from being taught as the only correct one",
  "It supports peaceful coexistence between neighbouring communities that hold different beliefs",
  "It encourages learners to ask respectful questions about other beliefs rather than mock them",
] as const;

export const humanOrigin: Skill = {
  id: "g7-ss-pr-human-origin",
  code: "PR.1",
  subjectId: "social-studies",
  strandId: "g7-ss-pr",
  grade: 7,
  title: "Human origin",
  description: "Traditional stories of human origin from African communities and religious accounts of the origin of humankind, their common themes, and why respecting different accounts matters for social cohesion.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "theme-match", "common-theme", "respect-reason", "fill-blank", "dialogue-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, CREATOR_FILL_BLANKS);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about an account of human origin.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Recall the name of the creator figure in this specific origin account.",
        explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
      };
    }

    if (branch === "dialogue-order") {
      const items = shuffle(rng, DIALOGUE_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange these steps for respectfully discussing a different account of human origin, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: DIALOGUE_STEPS.map((s) => s.id),
        hint: "Understanding comes before questioning, which comes before acknowledging, sharing, and finally comparing themes.",
        explanation: DIALOGUE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "classify") {
      const chosen = shuffle(rng, ORIGIN_ACCOUNTS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((a) => a.type))).map((t) => ({ id: t, label: TYPE_LABEL[t] }));
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.type));
      return {
        kind: "categorize",
        prompt: "Sort each account of human origin as a traditional/community story or a religious story.",
        items,
        buckets,
        correctBucket,
        hint: "A traditional account comes from a specific African community's own history; a religious account comes from an organised faith's scripture or teaching.",
        explanation: chosen.map((a) => `"${a.text}" — ${TYPE_LABEL[a.type].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "theme-match") {
      const chosen = shuffle(rng, [...ORIGIN_ACCOUNTS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: TYPE_LABEL[a.type] })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `a${i}`, label: a.text })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((a, i) => (correctMap[`a${i}`] = `a${i}`));
      return {
        kind: "click-match",
        prompt: "Match each type of origin account to a real example of it.",
        tokens,
        targets,
        correctMap,
        hint: "Recall whether the example comes from a community's own tradition or from an organised religion.",
        explanation: chosen.map((a) => `${TYPE_LABEL[a.type]}: ${a.text}.`).join(" "),
      };
    }

    if (branch === "common-theme") {
      const correct = randChoice(rng, COMMON_THEMES);
      const others = COMMON_THEMES.filter((t) => t !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of these is a theme commonly found across both traditional and religious stories of human origin?",
        choices,
        correctIndex,
        hint: "Look for an idea about how the first humans appeared that repeats across many different accounts.",
        explanation: `${correct} — this theme appears across many traditional and religious accounts of how humans came to be.`,
      };
    }

    // respect-reason
    const correct = randChoice(rng, RESPECT_REASONS);
    const others = RESPECT_REASONS.filter((r) => r !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "In a diverse Kenyan classroom with learners from different communities and faiths, why does respecting different accounts of human origin matter for social cohesion?",
      choices,
      correctIndex,
      hint: "Think about how learners feel when their own beliefs are acknowledged rather than dismissed.",
      explanation: `${correct} — this is why respecting different origin accounts supports social cohesion.`,
    };
  },
};
