import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ordinals = ["first", "second", "third", "fourth", "fifth and last"];

const STAGES = [
  { id: "views", label: "Collecting views from citizens on what they want in the constitution" },
  { id: "drafting", label: "Drafting the constitution based on the views collected" },
  { id: "debate", label: "Debating and reviewing the draft in parliament and public forums" },
  { id: "referendum", label: "Putting the final draft to citizens in a referendum" },
  { id: "promulgation", label: "Promulgation — officially signing the constitution into law" },
];

const ROLES: { text: string; who: "parliament" | "citizens" }[] = [
  { text: "Debating and reviewing the draft constitution in parliamentary sessions", who: "parliament" },
  { text: "Enacting laws needed to implement the new constitution once it is in force", who: "parliament" },
  { text: "Representing constituents' concerns and proposals during constitutional debate", who: "parliament" },
  { text: "Ratifying and formally passing the final constitutional bill", who: "parliament" },
  { text: "Submitting views and memoranda on what should be included in the constitution", who: "citizens" },
  { text: "Voting to approve or reject the draft constitution in a referendum", who: "citizens" },
  { text: "Taking part in civic education to understand the proposed constitution", who: "citizens" },
  { text: "Monitoring and holding leaders accountable for implementing the constitution", who: "citizens" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Constitution", meaning: "The supreme law of the land, which establishes how a country is governed" },
  { term: "Referendum", meaning: "A direct vote by citizens on a specific question, such as approving a new constitution" },
  { term: "Promulgation", meaning: "The formal act of officially bringing a constitution or law into force" },
  { term: "Sovereignty", meaning: "Supreme authority over a country, which Kenya's constitution says belongs to the people" },
  { term: "Devolution", meaning: "The transfer of power and resources from the national government to county governments" },
  { term: "Preamble", meaning: "The opening statement of the constitution, declaring its purpose and values" },
  { term: "Amendment", meaning: "A formal change made to the constitution through a defined legal process" },
  { term: "Bill of Rights", meaning: "The chapter of the constitution setting out fundamental rights and freedoms" },
  { term: "Public participation", meaning: "The process of involving citizens' views when making laws and decisions" },
  { term: "Supremacy of the Constitution", meaning: "The principle that the constitution is the highest law, and all other laws must conform to it" },
] as const;

const WHY_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Why is public participation important during Kenya's constitution-making process?",
    choices: ["It ensures the constitution reflects the values and needs of the people it governs", "It is only a formality with no real effect on the final document", "It replaces the need for parliament to debate the draft", "It is required only for amendments, not the original constitution"],
    correctIndex: 0,
    explanation: "Public participation ensures the constitution reflects the actual values and needs of citizens, not just those in government.",
  },
  {
    prompt: "Why does a new constitution need to be put to a referendum rather than only passed by parliament?",
    choices: ["Because the constitution belongs to the people, so their direct approval gives it full legitimacy", "Because parliament is not allowed to discuss constitutional matters", "Because referenda are faster than parliamentary debate", "Because the President cannot approve a constitution alone"],
    correctIndex: 0,
    explanation: "Since sovereignty belongs to the people, a referendum gives citizens direct say in approving the document that will govern them, giving it full legitimacy.",
  },
  {
    prompt: "What does it mean to 'desire to defend and promote' the Constitution of Kenya?",
    choices: ["Valuing the constitution enough to protect it from being violated or wrongly changed", "Believing the constitution can never be legally amended", "Supporting only the parts of the constitution that benefit you personally", "Leaving constitutional matters entirely to lawyers and judges"],
    correctIndex: 0,
    explanation: "Defending and promoting the constitution means valuing it enough to protect it from violation while still respecting the lawful process for amendment.",
  },
  {
    prompt: "A learner says the constitution, once promulgated, can never be changed again. Is this correct?",
    choices: ["No — a constitution can be changed through the formal amendment process", "Yes — a constitution is permanently fixed forever", "Yes — only a new independence can change a constitution", "No — but only the President may change it alone"],
    correctIndex: 0,
    explanation: "A constitution can be changed through a formal amendment process, which itself usually requires public participation and, for some changes, a referendum.",
  },
] as const;

export const constitutionOfKenya: Skill = {
  id: "ss-pdg-constitution",
  code: "PDG.1",
  subjectId: "social-studies",
  strandId: "ss-pdg",
  grade: 9,
  title: "The Constitution of Kenya",
  description: "Order the stages of the constitution-making process in Kenya.",
  generate(rng) {
    const hint = "Citizens are consulted first, then a draft is written, debated, put to a referendum, and finally signed into law.";
    const branch = randChoice(rng, ["stage-mc", "order", "roles", "terms", "fill-blank", "why"] as const);

    if (branch === "roles") {
      const chosen = shuffle(rng, ROLES).slice(0, 6);
      const items = chosen.map((r, i) => ({ id: `r${i}`, label: r.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((r, i) => (correctBucket[`r${i}`] = r.who));
      return {
        kind: "categorize",
        prompt: "Sort each activity by whether it is mainly a role of parliament or a role of citizens in constitution-making.",
        items,
        buckets: [
          { id: "parliament", label: "Role of parliament" },
          { id: "citizens", label: "Role of citizens" },
        ],
        correctBucket,
        hint: "Parliament debates and passes the constitutional bill; citizens give views, vote in the referendum, and hold leaders accountable.",
        explanation: chosen.map((r) => `"${r.text}" is a role of ${r.who}.`).join(" "),
      };
    }

    if (branch === "terms") {
      const chosen = shuffle(rng, TERMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: "Match each constitutional term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "These terms describe how Kenya's constitution is made, changed, and put into practice.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const t = randChoice(rng, TERMS);
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence: "${t.meaning}" is the definition of the term ___.`,
        before: "",
        after: "",
        correctAnswer: t.term,
        acceptedAnswers: [t.term.toLowerCase()],
        inputMode: "text",
        hint: "Think about the constitutional vocabulary used to describe how Kenya is governed.",
        explanation: `${t.term} — ${t.meaning.toLowerCase()}.`,
      };
    }

    if (branch === "why") {
      const q = randChoice(rng, WHY_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint: "Think about legitimacy, sovereignty, and why citizens' voices matter in constitution-making.",
        explanation: q.explanation,
      };
    }

    if (branch === "stage-mc") {
      const index = Math.floor(rng() * STAGES.length);
      const target = STAGES[index];
      const choices = shuffle(rng, STAGES.map((s) => s.label));

      return {
        kind: "multiple-choice",
        prompt: `Which stage comes ${ordinals[index]} in Kenya's constitution-making process?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: STAGES.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    const shuffled = shuffle(rng, STAGES);
    return {
      kind: "ordering",
      prompt: "Arrange these stages of Kenya's constitution-making process in the correct order.",
      instruction: "Drag to put the stages in order, from gathering citizen views to promulgation.",
      items: shuffled.map((s) => ({ id: s.id, label: s.label })),
      correctOrder: STAGES.map((s) => s.id),
      hint,
      explanation: STAGES.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
    };
  },
};
