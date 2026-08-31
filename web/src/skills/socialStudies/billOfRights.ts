import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const RIGHTS: { name: string; meaning: string; category: "civil-political" | "economic-social" | "group" }[] = [
  { name: "Right to life", meaning: "Every person has the right to life, and it may not be taken away arbitrarily", category: "civil-political" },
  { name: "Right to human dignity", meaning: "Every person's dignity must be respected and protected", category: "civil-political" },
  { name: "Freedom of expression", meaning: "Every person may seek, receive, and share information and ideas", category: "civil-political" },
  { name: "Freedom of association", meaning: "Every person has the right to form or join groups, including political parties", category: "civil-political" },
  { name: "Right to a fair hearing", meaning: "Every person has the right to have any dispute resolved by a fair and public hearing", category: "civil-political" },
  { name: "Right to education", meaning: "Every person has the right to access education", category: "economic-social" },
  { name: "Right to health care", meaning: "Every person has the right to the highest attainable standard of health, including health care services", category: "economic-social" },
  { name: "Right to housing", meaning: "Every person has the right to accessible and adequate housing", category: "economic-social" },
  { name: "Right to clean water", meaning: "Every person has the right to clean and safe water in adequate quantities", category: "economic-social" },
  { name: "Right to social security", meaning: "Every person has the right to social security, especially if unable to support themselves", category: "economic-social" },
  { name: "Rights of the elderly", meaning: "Older members of society have the right to live in dignity, respect, and freedom from abuse", category: "group" },
  { name: "Rights of refugees", meaning: "Refugees have the right to protection and fair treatment even outside their home country", category: "group" },
  { name: "Rights of migrants", meaning: "Migrants have the right to fair treatment and protection, regardless of their origin", category: "group" },
] as const;
const CATEGORY_LABEL: Record<string, string> = {
  "civil-political": "A civil or political right",
  "economic-social": "An economic or social right",
  group: "A group right for a special/vulnerable group",
};

const SPECIAL_GROUPS_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which of these is named as a 'special group' needing particular protection under Kenya's Bill of Rights, alongside the elderly and refugees?",
    choices: ["Migrants", "Business owners", "Athletes", "Tourists"],
    correctIndex: 0,
    explanation: "The Bill of Rights recognises the elderly, refugees, and migrants as special groups who may need extra protection to access their rights equally.",
  },
  {
    prompt: "Why does Kenya's Bill of Rights give special attention to groups like the elderly, refugees, and migrants?",
    choices: ["Because they can face extra barriers to accessing their rights, so extra protection promotes fairness", "Because they have fewer rights than other citizens", "Because the constitution excludes them from voting", "Because they are not considered citizens"],
    correctIndex: 0,
    explanation: "Special groups can face extra challenges (language, mobility, legal status) that make it harder to access rights equally — the Bill of Rights addresses this to promote social justice and inclusivity.",
  },
  {
    prompt: "A learner says refugees living in Kenya have no rights under Kenya's Bill of Rights because they are not citizens. Is this correct?",
    choices: ["No — refugees are a recognised special group with rights that must be protected", "Yes — the Bill of Rights only protects Kenyan citizens", "Yes — refugees only gain rights after ten years of residence", "No — refugees have more rights than citizens"],
    correctIndex: 0,
    explanation: "Refugees are explicitly recognised as a special group under Kenya's Bill of Rights, entitled to protection and fair treatment, not excluded from it.",
  },
  {
    prompt: "An elderly person in a community is denied a fair hearing because others assume they are too old to understand the matter. Which value from the Bill of Rights does this violate?",
    choices: ["Respect for human dignity and equal access to a fair hearing", "Freedom of association", "Right to clean water", "Freedom of movement"],
    correctIndex: 0,
    explanation: "Denying someone a fair hearing because of their age disregards their dignity and their right to have disputes resolved fairly, regardless of age.",
  },
  {
    prompt: "What does it mean to 'cultivate empathy and solidarity' with special groups, as the Bill of Rights encourages?",
    choices: ["Understanding their challenges and actively supporting their equal access to rights", "Giving special groups fewer responsibilities than other citizens", "Avoiding contact with special groups to prevent conflict", "Expecting special groups to solve their own challenges without support"],
    correctIndex: 0,
    explanation: "Empathy and solidarity mean understanding the extra barriers special groups face and actively supporting fair, equal access to their rights — not avoidance or reduced responsibility.",
  },
  {
    prompt: "A migrant worker is paid less than local workers for the same job, purely because of their migrant status. What does this represent?",
    choices: ["A violation of the migrant's right to fair and equal treatment", "A normal business practice with no rights implications", "An issue that only affects the employer, not the migrant's rights", "A right the constitution does not protect at all"],
    correctIndex: 0,
    explanation: "Paying a person less purely because of migrant status is unequal treatment and disregards their protected right to fair treatment.",
  },
  {
    prompt: "Which best describes why 'assertiveness' matters when standing up for human rights, as the sub-strand emphasises?",
    choices: ["It lets a person confidently claim their rights while still respecting others' rights", "It means demanding rights aggressively regardless of others", "It means staying silent to avoid conflict over rights", "It only applies to lawyers and judges, not ordinary citizens"],
    correctIndex: 0,
    explanation: "Assertiveness means confidently and respectfully claiming one's own rights — not aggression, and not silence.",
  },
] as const;

const ASSERTIVE_STEPS = [
  { id: "identify", label: "Identify which right has been affected and how" },
  { id: "seek-info", label: "Seek accurate information or advice (e.g. from a teacher, elder, or the Kenya National Commission on Human Rights)" },
  { id: "raise", label: "Raise the concern calmly and assertively with the relevant person or authority" },
  { id: "redress", label: "Seek formal redress (mediation, a fair hearing, or the courts) if the matter is unresolved" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The chapter of Kenya's Constitution that sets out fundamental rights and freedoms is called the ", after: ".", correctAnswer: "Bill of Rights", accepted: ["bill of rights"], explanation: "Chapter Four of Kenya's Constitution is the Bill of Rights, setting out the fundamental rights and freedoms of every person." },
  { before: "Every person's inherent worth, which the Bill of Rights says must be respected and protected, is called human ", after: ".", correctAnswer: "dignity", accepted: ["dignity"], explanation: "Human dignity is every person's inherent worth, which the Bill of Rights requires to be respected and protected." },
  { before: "The right that allows a person to seek, receive, and share information and ideas freely is freedom of ", after: ".", correctAnswer: "expression", accepted: ["expression"], explanation: "Freedom of expression protects a person's ability to seek, receive, and share information and ideas." },
  { before: "The right that allows people to form or join groups, including political parties, is freedom of ", after: ".", correctAnswer: "association", accepted: ["association"], explanation: "Freedom of association protects the right to form or join groups, including political parties and trade unions." },
  { before: "Resolving a dispute through an open, impartial process is protected by the right to a fair ", after: ".", correctAnswer: "hearing", accepted: ["hearing", "trial"], explanation: "The right to a fair hearing guarantees that disputes are resolved through a fair and public process." },
  { before: "Groups such as the elderly, refugees, and migrants, who may need extra protection to access their rights, are called ", after: " groups.", correctAnswer: "special", accepted: ["special"], explanation: "Special groups (the elderly, refugees, and migrants) may face extra barriers, so the Bill of Rights gives them particular attention." },
  { before: "Confidently and respectfully claiming your own rights, without being aggressive, is called being ", after: ".", correctAnswer: "assertive", accepted: ["assertive", "assertiveness"], explanation: "Assertiveness means confidently and respectfully standing up for your rights, distinct from aggression or silence." },
  { before: "Understanding and sharing the challenges faced by special groups, so as to support them, is called ", after: ".", correctAnswer: "empathy", accepted: ["empathy"], explanation: "Empathy is understanding and sharing the challenges special groups face, which builds solidarity and support for their rights." },
  { before: "The right that guarantees every person access to the highest attainable standard of health care is the right to ", after: ".", correctAnswer: "health care", accepted: ["health care", "healthcare", "health"], explanation: "The right to health care guarantees access to the highest attainable standard of health, including health services." },
  { before: "The right that guarantees every person accessible and adequate shelter is the right to ", after: ".", correctAnswer: "housing", accepted: ["housing"], explanation: "The right to housing guarantees every person accessible and adequate housing." },
] as const;

export const billOfRights: Skill = {
  id: "ss-pdg-bill-of-rights",
  code: "PDG.3",
  subjectId: "social-studies",
  strandId: "ss-pdg",
  grade: 9,
  title: "Kenya's Bill of Rights",
  description: "Rights in Kenya's Bill of Rights, and the special groups it protects.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "groups", "classify", "fill-blank", "assert-order"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, RIGHTS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.name, label: r.name })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.name, label: r.meaning })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.name] = r.name;

      return {
        kind: "click-match",
        prompt: "Match each right to what it means.",
        tokens,
        targets,
        correctMap,
        hint: "Kenya's Bill of Rights protects a wide range of civil, political, and social rights.",
        explanation: chosen.map((r) => `${r.name} — ${r.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "groups") {
      const q = randChoice(rng, SPECIAL_GROUPS_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint: "Think about fairness, dignity, and equal access to rights, especially for groups facing extra barriers.",
        explanation: q.explanation,
      };
    }

    if (branch === "classify") {
      const chosen = shuffle(rng, RIGHTS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((r) => r.category))).map((c) => ({ id: c, label: CATEGORY_LABEL[c] }));
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: r.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.category));
      return {
        kind: "categorize",
        prompt: "Sort each right by the kind of right it is.",
        items,
        buckets,
        correctBucket,
        hint: "Civil/political rights protect participation and freedom; economic/social rights protect basic living standards; group rights protect specific vulnerable groups.",
        explanation: chosen.map((r) => `${r.name} — ${CATEGORY_LABEL[r.category].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "assert-order") {
      const items = shuffle(rng, ASSERTIVE_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for assertively standing up for a right that has been denied, in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: ASSERTIVE_STEPS.map((s) => s.id),
        hint: "Understand the issue first, then seek information, then raise it calmly, and only escalate to formal redress if needed.",
        explanation: ASSERTIVE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence about Kenya's Bill of Rights.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the vocabulary used to describe rights, dignity, and standing up for oneself.",
      explanation: fb.explanation,
    };
  },
};
