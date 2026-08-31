import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATCH_PROMPTS = [
  "Match each Kenyan agency to its role.",
  "Pair each Kenyan agency with its role.",
  "Connect each agency below to its role.",
  "Match each agency to what it does.",
  "Link each Kenyan agency to its correct role.",
  "Choose the correct role for each Kenyan agency.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each Kenyan agency as mainly protecting consumers or mainly regulating finance.",
  "Group each agency under mainly protecting consumers, or mainly regulating finance.",
  "Decide whether each agency mainly protects consumers or regulates finance, and sort it there.",
  "Sort each agency into the correct category: consumer protection, or finance regulation.",
  "Place each agency into the right bucket — consumer protection, or finance.",
  "Categorise each Kenyan agency as mainly protecting consumers or regulating finance.",
];

const RIGHTS_SORT_PROMPTS = [
  "Sort each statement as a human right upheld in Islam, or the role of a Kenyan regulatory agency.",
  "Group each statement under a human right in Islam, or a Kenyan agency's role.",
  "Decide whether each statement is a human right in Islam or an agency's role, and sort it there.",
  "Sort each statement into the correct category: human right, or agency role.",
  "Place each statement into the right bucket — human right, or agency role.",
  "Categorise each statement as a human right in Islam or the role of a Kenyan agency.",
];

const FILL_PROMPTS = [
  "Fill in the missing abbreviation.",
  "Which abbreviation completes this sentence?",
  "Complete the sentence with the correct abbreviation.",
  "Work out the missing abbreviation below.",
  "Fill in the blank with the correct abbreviation.",
  "Which abbreviation belongs in the blank?",
];

const AGENCIES: { abbreviation: string; role: string }[] = [
  { abbreviation: "KEBS", role: "Kenya Bureau of Standards — ensures products and services meet quality standards" },
  { abbreviation: "CAK", role: "Competition Authority of Kenya — promotes fair competition and protects consumers from unfair trade practices" },
  { abbreviation: "CBK", role: "Central Bank of Kenya — regulates banks and the country's currency and monetary policy" },
  { abbreviation: "RBA", role: "Retirement Benefits Authority — regulates and supervises retirement benefits (pension) schemes" },
];

const AGENCY_GROUP_ITEMS = [
  { text: "KEBS", bucket: "consumer" },
  { text: "CAK", bucket: "consumer" },
  { text: "CBK", bucket: "finance" },
  { text: "RBA", bucket: "finance" },
] as const;
const AGENCY_GROUP_LABEL: Record<string, string> = { consumer: "Mainly protects consumers", finance: "Mainly regulates finance" };

const RIGHTS_ITEMS = [
  { text: "The right to life, protected as sacred in Islam", bucket: "human-rights" },
  { text: "The right to justice and fair treatment for all", bucket: "human-rights" },
  { text: "The right to own property lawfully", bucket: "human-rights" },
  { text: "The right to education and seeking knowledge", bucket: "human-rights" },
  { text: "Regulating banks and the national currency", bucket: "agency-role" },
  { text: "Checking that goods sold in the market meet quality standards", bucket: "agency-role" },
] as const;
const RIGHTS_LABEL: Record<string, string> = { "human-rights": "A human right upheld in Islam", "agency-role": "The role of a Kenyan regulatory agency" };

const QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How does Islam uphold human rights?",
    correct: "By protecting life, justice, property, dignity, and freedom of belief for every person",
    distractors: ["By granting rights only to a select few people", "By denying rights to non-Muslims entirely", "By ignoring the wellbeing of the wider community"],
  },
  {
    q: "What does the Kenya Bureau of Standards (KEBS) do?",
    correct: "Ensures that products and services in the market meet required quality standards",
    distractors: ["Regulates the country's currency", "Manages retirement benefit schemes", "Sets religious holidays"],
  },
  {
    q: "What is the role of the Central Bank of Kenya (CBK)?",
    correct: "Regulating banks and the country's currency and monetary policy",
    distractors: ["Protecting consumers from unfair trade practices only", "Setting product quality standards", "Managing pension schemes"],
  },
  {
    q: "How can a Muslim advocate for human rights in the 21st century?",
    correct: "By speaking out against injustice and supporting institutions that protect people's rights",
    distractors: ["By ignoring injustice when it does not affect them personally", "By avoiding any involvement in community or civic life", "By assuming human rights are not part of Islamic teaching"],
  },
];

export const humanRights: Skill = {
  id: "g8-ire-mu-human-rights",
  code: "MU.4",
  subjectId: "ire",
  strandId: "g8-ire-mu",
  grade: 8,
  title: "Human Rights",
  description: "Human rights in Islam and the Kenyan agencies (KEBS, CAK, CBK, RBA) that safeguard consumers and finance.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "rights-sort", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, AGENCIES.map((a) => ({ id: a.abbreviation, label: a.abbreviation })));
      const targets = shuffle(rng, AGENCIES.map((a) => ({ id: a.abbreviation, label: a.role })));
      const correctMap: Record<string, string> = {};
      for (const a of AGENCIES) correctMap[a.abbreviation] = a.abbreviation;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "KEBS and CAK protect consumers; CBK and RBA regulate finance and pensions.",
        explanation: AGENCIES.map((a) => `${a.abbreviation} — ${a.role.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, AGENCY_GROUP_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: AGENCY_GROUP_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "KEBS checks product quality and CAK checks fair trade; CBK and RBA deal with money and pensions.",
        explanation: chosen.map((c) => `${c.text} — ${AGENCY_GROUP_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "rights-sort") {
      const chosen = shuffle(rng, RIGHTS_ITEMS);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: RIGHTS_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `r${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`r${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, RIGHTS_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Human rights are what Islam guarantees a person; agency roles are what a government body does in Kenya today.",
        explanation: chosen.map((c) => `"${c.text}" — ${RIGHTS_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_PROMPTS),
        before: "The Kenyan agency responsible for setting and enforcing quality standards for goods and services is known as",
        after: ".",
        correctAnswer: "KEBS",
        inputMode: "text",
        hint: "This stands for Kenya Bureau of Standards.",
        explanation: "KEBS (Kenya Bureau of Standards) sets and enforces quality standards for goods and services in Kenya.",
      };
    }

    const entry = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Islam upholds human rights, and in Kenya agencies like KEBS, CAK, CBK, and RBA help protect people's rights in trade and finance.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
