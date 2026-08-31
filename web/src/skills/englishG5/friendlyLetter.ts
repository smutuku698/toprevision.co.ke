import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 4.0 Road Accidents - Prevention, sub-strand 4.4 Functional Writing:
// Friendly Letter — a reply to a friendly letter. See curriculum-reference/grade-5/english.json.

type Part = "address" | "date" | "salutation" | "introduction" | "body" | "conclusion" | "close" | "signature";
const PART_LABEL: Record<Part, string> = {
  address: "Sender's address (top right)",
  date: "Date (below the address)",
  salutation: "Salutation / greeting",
  introduction: "Introduction (first paragraph)",
  body: "Body (main news)",
  conclusion: "Conclusion (last paragraph)",
  close: "Complimentary close",
  signature: "Sender's name",
};
const PART_ORDER: Part[] = ["address", "date", "salutation", "introduction", "body", "conclusion", "close", "signature"];

function exampleFor(part: Part, rng: () => number): string {
  const p = place(rng), n = name(rng);
  switch (part) {
    case "address": return `P.O. Box 45\n${p}`;
    case "date": return "3rd June 2026";
    case "salutation": return `Dear ${n},`;
    case "introduction": return "Thank you for your letter. I was glad to hear that you are safe after the accident near your school.";
    case "body": return "Since then, our class has learned about road signs, the pedestrian crossing and why we must never rush across the highway.";
    case "conclusion": return "Do write back soon and tell me how the road-safety club is going.";
    case "close": return "Your friend,";
    case "signature": return n;
  }
}

const FORMAL_VS_FRIENDLY: { text: string; friendly: boolean }[] = [
  { text: "Dear Amina,", friendly: true },
  { text: "Dear Sir/Madam,", friendly: false },
  { text: "Your friend,", friendly: true },
  { text: "Yours faithfully,", friendly: false },
  { text: "I hope you're well and that the bruise has healed!", friendly: true },
  { text: "I am writing to formally report the matter.", friendly: false },
  { text: "Write back soon — I can't wait to hear your news.", friendly: true },
  { text: "I look forward to your response at your earliest convenience.", friendly: false },
  { text: "Love,", friendly: true },
  { text: "Yours sincerely,", friendly: false },
];

export const friendlyLetter: Skill = {
  id: "g5-eng-writing-friendly-letter",
  code: "W.4",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Friendly Letter",
  description: "Identify the parts of a friendly letter, put them in the correct order, and use friendly (informal) language when replying to a friend.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-part", "fill-part", "sort-register", "match", "order-parts", "reason-register"] as const);

    if (branch === "mc-part") {
      const part = randChoice(rng, PART_ORDER);
      const ex = exampleFor(part, rng).replace(/\n/g, " / ");
      const wrong = shuffle(rng, PART_ORDER.filter((p) => p !== part)).slice(0, 3).map((p) => PART_LABEL[p]);
      const { choices, correctIndex } = mcFromCluster(rng, PART_LABEL[part], wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the part of a friendly letter this is")}\n"${ex}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about where this line would sit in the letter and what job it does.",
        explanation: `This is the "${PART_LABEL[part]}".`,
      };
    }

    if (branch === "fill-part") {
      const part = randChoice(rng, PART_ORDER.filter((p) => p !== "body" && p !== "introduction" && p !== "conclusion"));
      const desc: Record<string, string> = {
        address: "where the letter is written from",
        date: "the day the letter is written",
        salutation: "the greeting that begins 'Dear ...'",
        close: "the sign-off, such as 'Your friend,'",
        signature: "the writer's name at the very bottom",
      };
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the name of this letter part (one word)"),
        before: `The part that gives ${desc[part]} is called the `,
        after: ".",
        correctAnswer: part === "close" ? "close" : part === "signature" ? "name" : part,
        acceptedAnswers: part === "close" ? ["close", "complimentary close"] : part === "signature" ? ["name", "signature"] : part === "salutation" ? ["salutation", "greeting"] : part === "address" ? ["address"] : ["date"],
        inputMode: "text",
        hint: "The parts are: address, date, salutation, introduction, body, conclusion, close, name.",
        explanation: `It is the ${PART_LABEL[part].toLowerCase()}.`,
      };
    }

    if (branch === "sort-register") {
      const pool = shuffle(rng, FORMAL_VS_FRIENDLY).slice(0, 6);
      const items = pool.map((x, i) => ({ id: `x${i}`, label: x.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((x, i) => (correctBucket[`x${i}`] = x.friendly ? "friendly" : "formal"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each line suits a friendly letter or a formal letter"),
        items,
        buckets: [
          { id: "friendly", label: "Friendly (informal) letter" },
          { id: "formal", label: "Formal letter" },
        ],
        correctBucket,
        hint: "A friendly letter uses first names, contractions and a warm tone. A formal letter is polite, distant and uses full forms.",
        explanation: "Friendly: 'Dear Amina,', 'Your friend,', 'Write back soon!'. Formal: 'Dear Sir/Madam,', 'Yours faithfully,', 'at your earliest convenience'.",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, PART_ORDER).slice(0, 5);
      const tokens = shuffle(rng, pool.map((p) => ({ id: p, label: PART_LABEL[p] })));
      const targets = shuffle(rng, pool.map((p) => ({ id: p, label: exampleFor(p, rng).replace(/\n/g, " / ") })));
      const correctMap: Record<string, string> = {};
      pool.forEach((p) => (correctMap[p] = p));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "letter part to an example of it"),
        tokens,
        targets,
        correctMap,
        hint: "Match by the job each line does in the letter.",
        explanation: pool.map((p) => `${PART_LABEL[p]}: "${exampleFor(p, rng).replace(/\n/g, " / ")}"`).join("  "),
      };
    }

    if (branch === "order-parts") {
      const items = PART_ORDER.map((p) => ({ id: p, label: PART_LABEL[p] }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the parts of a friendly letter from top to bottom"),
        instruction: "Click the parts in the correct order.",
        items: shuffle(rng, items),
        correctOrder: [...PART_ORDER],
        hint: "The address and date come first; the close and name come last.",
        explanation: "Order: sender's address → date → salutation → introduction → body → conclusion → complimentary close → sender's name.",
      };
    }

    // reason — Apply: choose the correct friendly opening/closing for a reply.
    const kind = rng() < 0.5 ? "open" : "close";
    const scen = kind === "open"
      ? {
          s: `${name(rng)} is replying to a letter from a close friend who was in a road accident.`,
          correct: `Dear ${name(rng)},\nThank you for your letter. I was so relieved to hear you are all right.`,
          wrong: [
            `Dear Sir/Madam,\nI am writing with reference to your correspondence.`,
            `To Whom It May Concern,\nI acknowledge receipt of your letter.`,
            `Dear ${name(rng)},\nI wish to formally respond to the matters you raised.`,
          ],
        }
      : {
          s: `${name(rng)} is ending a reply to a close friend.`,
          correct: `Write back soon and tell me all your news.\nYour friend,\n${name(rng)}`,
          wrong: [
            `I look forward to your reply at your earliest convenience.\nYours faithfully,\n${name(rng)}`,
            `Kindly respond in due course.\nYours sincerely,\n${name(rng)}`,
            `Please acknowledge receipt of this letter.\nRegards,\n${name(rng)}`,
          ],
        };
    const { choices, correctIndex } = mcFromCluster(rng, scen.correct, scen.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, scen.s, `Which ${kind === "open" ? "opening" : "ending"} suits a friendly letter?`),
      choices,
      correctIndex,
      layout: "list",
      hint: "A friendly letter to a close friend sounds warm and personal, not stiff and official.",
      explanation: `A friendly letter uses a warm greeting ("Dear <first name>,"), a personal tone, and a close like "Your friend," or "Love," — not formal phrases such as "Yours faithfully" or "at your earliest convenience".`,
    };
  },
};
