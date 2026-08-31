import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PARTS: { part: string; description: string }[] = [
  { part: "Sender's address", description: "Where the letter writer lives, written at the top of the letter" },
  { part: "Date", description: "The day the letter was written, placed just below the sender's address" },
  { part: "Salutation", description: "The friendly greeting to the reader, e.g. 'Dear Cucu,'" },
  { part: "Body", description: "The main message — news, feelings, or questions shared with the reader" },
  { part: "Complimentary close", description: "A warm closing phrase before the signature, e.g. 'Your loving grandson,'" },
  { part: "Signature", description: "The writer's first name, signed at the very end" },
];

const SALUTATIONS_CLOSINGS: { text: string; type: "friendly" | "formal" }[] = [
  { text: "Dear Mum,", type: "friendly" },
  { text: "Dear Cucu,", type: "friendly" },
  { text: "Hi Otieno,", type: "friendly" },
  { text: "Dear Uncle Musa,", type: "friendly" },
  { text: "Your loving daughter,", type: "friendly" },
  { text: "With love,", type: "friendly" },
  { text: "Your cousin,", type: "friendly" },
  { text: "See you soon,", type: "friendly" },
  { text: "Dear Sir,", type: "formal" },
  { text: "Dear Madam,", type: "formal" },
  { text: "Dear Dr. Kamau,", type: "formal" },
  { text: "To Whom It May Concern,", type: "formal" },
  { text: "Yours faithfully,", type: "formal" },
  { text: "Yours sincerely,", type: "formal" },
  { text: "Yours truly,", type: "formal" },
];

const SAMPLE_LETTERS: { excerpt: string; missingPart: string }[] = [
  {
    excerpt:
      "P.O. Box 214, Kericho\n14th March 2026\n\nDear Aunt Naliaka,\n\nI hope you and the family are doing well. I am writing to tell you that I passed my end-of-term exams and came second in my class!\n\nWanjiru",
    missingPart: "Complimentary close",
  },
  {
    excerpt:
      "14th April 2026\n\nDear Baba,\n\nThank you for the school fees you sent last month. I have been working hard on my studies and I miss you very much.\n\nYour loving son,\nOtieno",
    missingPart: "Sender's address",
  },
  {
    excerpt:
      "45 Riverside Road, Nyeri\n\nDear Cucu,\n\nI hope this letter finds you well. We had a wonderful family gathering last weekend, and everyone talked about your delicious mukimo.\n\nWith love,\nWanjiku",
    missingPart: "Date",
  },
  {
    excerpt:
      "78 Lake View Estate, Kisumu\n21st July 2026\n\nDear Cousin Brian,\n\nGuess what — our team won the inter-school football tournament last Friday! I scored the winning goal in the final match.\n\nYour cousin,",
    missingPart: "Signature",
  },
];

export const friendlyLetters: Skill = {
  id: "g7-eng-w-friendly-letters",
  code: "W.5",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Functional Writing: Friendly Letters",
  description: "Identify the parts and correct order of a friendly letter to family, and recognise friendly versus formal salutations and closings.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "match", "categorize", "mc-missing"] as const);
    const hint = "A friendly letter gives the sender's address and date, greets the reader warmly, shares the message in the body, then closes with a warm phrase and signature.";

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the parts of a friendly letter to a family member in the correct order.",
        instruction: "Click the parts in the order they should appear, from top to bottom.",
        items: shuffle(rng, PARTS.map((p) => ({ id: p.part, label: p.part }))),
        correctOrder: PARTS.map((p) => p.part),
        hint,
        explanation: `The correct order is: ${PARTS.map((p) => p.part).join(" → ")}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, PARTS.map((p) => ({ id: p.part, label: p.part })));
      const targets = shuffle(rng, PARTS.map((p) => ({ id: p.part, label: p.description })));
      const correctMap: Record<string, string> = {};
      for (const p of PARTS) correctMap[p.part] = p.part;
      return {
        kind: "click-match",
        prompt: "Match each part of a friendly letter to what it contains.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: PARTS.map((p) => `${p.part} — ${p.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const friendly = shuffle(rng, SALUTATIONS_CLOSINGS.filter((s) => s.type === "friendly")).slice(0, 3);
      const formal = shuffle(rng, SALUTATIONS_CLOSINGS.filter((s) => s.type === "formal")).slice(0, 3);
      const items = shuffle(rng, [...friendly, ...formal]).map((s, i) => ({ id: `s${i}`, label: s.text, type: s.type }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.type;
      return {
        kind: "categorize",
        prompt: "Sort each salutation or closing into Friendly letter or Formal letter.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "friendly", label: "Friendly letter" },
          { id: "formal", label: "Formal letter" },
        ],
        correctBucket,
        hint: "A friendly letter greets and closes warmly, by first name or family title. A formal letter uses a title and surname, or a formal close like 'Yours faithfully'.",
        explanation: `Friendly: ${friendly.map((f) => f.text).join(" / ")}. Formal: ${formal.map((f) => f.text).join(" / ")}.`,
      };
    }

    const entry = randChoice(rng, SAMPLE_LETTERS);
    const otherParts = shuffle(rng, PARTS.map((p) => p.part).filter((p) => p !== entry.missingPart)).slice(0, 3);
    const choices = shuffle(rng, [entry.missingPart, ...otherParts]);
    return {
      kind: "multiple-choice",
      prompt: "Read this friendly letter excerpt. Which part of the letter is missing?",
      passage: entry.excerpt,
      choices,
      correctIndex: choices.indexOf(entry.missingPart),
      layout: "list",
      hint: "Check whether the letter has all six parts: sender's address, date, salutation, body, complimentary close, and signature.",
      explanation: `The letter is missing its ${entry.missingPart.toLowerCase()}.`,
    };
  },
};
