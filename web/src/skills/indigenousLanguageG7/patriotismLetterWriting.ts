import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const LETTER_PARTS: { part: string; description: string }[] = [
  { part: "Sender's address", description: "Your own address, written at the top of the letter" },
  { part: "Date", description: "The day the letter is written, placed below the sender's address" },
  { part: "Recipient's address", description: "The address of the person or institution the letter is sent to" },
  { part: "Salutation", description: "The greeting that opens the letter, such as \"Dear Sir/Madam\"" },
  { part: "Subject heading", description: "A short line stating what the letter is about, such as \"Re: Request for Library Membership\"" },
  { part: "Opening paragraph", description: "States the purpose of the letter clearly at the start" },
  { part: "Body paragraph", description: "Gives details and reasons supporting the request" },
  { part: "Closing paragraph", description: "Politely restates the request and thanks the reader" },
  { part: "Complimentary close", description: "The polite sign-off, such as \"Yours faithfully\"" },
  { part: "Signature", description: "The sender's name written or typed at the end" },
  { part: "Enclosures note", description: "A note listing any documents attached, if applicable" },
];

const LETTER_PRACTICES: { text: string; bucket: string }[] = [
  { text: "Reading sample formal letters before writing your own", bucket: "Good practice" },
  { text: "Working with peers to identify the features of a letter of request", bucket: "Good practice" },
  { text: "Making short notes on findings before writing", bucket: "Good practice" },
  { text: "Including the sender's address and date at the top", bucket: "Good practice" },
  { text: "Stating the purpose of the request clearly in the opening", bucket: "Good practice" },
  { text: "Peer reviewing the letter for feedback before finalising it", bucket: "Good practice" },
  { text: "Typing the finished letter on a digital device", bucket: "Good practice" },
  { text: "Organising the typed letter in the class digital portfolio", bucket: "Good practice" },
  { text: "Using a polite salutation and complimentary close", bucket: "Good practice" },
  { text: "Giving honest, constructive feedback during peer review", bucket: "Good practice" },
  { text: "Skipping the sender's address and date entirely", bucket: "Poor practice" },
  { text: "Leaving out the reason for the request in the body", bucket: "Poor practice" },
  { text: "Using rude or demanding language instead of a polite request", bucket: "Poor practice" },
  { text: "Submitting the letter without any peer review", bucket: "Poor practice" },
  { text: "Forgetting to sign the letter at the end", bucket: "Poor practice" },
  { text: "Copying a classmate's letter instead of writing your own", bucket: "Poor practice" },
];

const LETTER_STRUCTURE: { id: string; label: string }[] = [
  { id: "address", label: "Sender's address, at the top of the letter" },
  { id: "date", label: "Date, written below the sender's address" },
  { id: "recipientAddress", label: "Recipient's address, such as the library or club's address" },
  { id: "salutation", label: "Salutation, such as \"Dear Sir/Madam\"" },
  { id: "subject", label: "Subject heading stating the letter is about a request for membership" },
  { id: "body", label: "Body paragraph explaining the purpose and reasons for the request" },
  { id: "closing", label: "Closing paragraph politely restating the request" },
  { id: "complimentaryClose", label: "Complimentary close, such as \"Yours faithfully\"" },
  { id: "signature", label: "Signature, with the sender's name" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The greeting that opens a formal letter, such as \"Dear Sir/Madam\", is called the", after: ".", answer: "salutation" },
  { before: "The polite sign-off at the end of a formal letter, such as \"Yours faithfully\", is called the complimentary", after: ".", answer: "close" },
  { before: "A letter written to formally ask for something, such as membership to a library or club, is called a letter of", after: ".", answer: "request" },
  { before: "The sender's own address, written at the top of a formal letter, is called the sender's", after: ".", answer: "address" },
  { before: "Reviewing a classmate's letter and giving honest feedback before it is finalised is called", after: "review.", answer: "peer" },
  { before: "Copying a friend's letter of request instead of writing your own shows a lack of", after: ".", answer: "integrity" },
  { before: "Cooperating with classmates to identify the features of a letter of request shows the value of", after: ".", answer: "unity" },
  { before: "Understanding why formal letters matter for communication is called appreciating the importance of letter", after: ".", answer: "writing" },
  { before: "Saving a typed letter together with classmates' letters in one shared place is called a class digital", after: ".", answer: "portfolio" },
  { before: "The two commonly requested types of membership practised in this sub-strand are library membership and", after: "membership.", answer: "club" },
  { before: "The part of a letter that gives the reasons supporting the request is called the", after: ".", answer: "body" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes to the local library requesting membership but forgets to include a return address or date at the top of the letter. What has ${who} omitted?`,
      correct: "The sender's address and the date, both required parts of a letter of request",
      wrong: ["Nothing, since a letter of request does not need an address", "The recipient's address only, not the sender's", "The greeting and closing, since only the body content matters"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} drafts a letter to the school drama club in ${where} that reads "Give me membership immediately", with no salutation or reason given. What should ${who} do?`,
      correct: "Rewrite it with a polite salutation, a clear reason, and respectful, less demanding language",
      wrong: ["Keep the tone, since it is brief and clear", "Remove the request entirely, since brevity matters most", "Assume the club will understand the tone was meant politely"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} composes a letter requesting library membership but never explains why membership is wanted. What part of the letter is missing?`,
      correct: "The body paragraph, which should give the reasons supporting the request",
      wrong: ["The sender's address, which is unrelated to reasons", "The complimentary close, which comes after the reasons", "Nothing is missing, since reasons are optional"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While peer reviewing a classmate's letter of request for club membership in ${where}, ${who} only checks for spelling mistakes and ignores whether the address, salutation, and closing are present. What has ${who} overlooked in the review?`,
      correct: "Checking that the letter's structural components are present and correctly placed, not just spelling",
      wrong: ["Checking how much effort was put into the letter", "Checking who in the class wrote the letter", "Reading the letter more than once"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} finishes a first draft of a letter requesting library membership and sends it straight to the library without showing it to anyone first. What step has ${who} skipped?`,
      correct: "Peer review for feedback before finalising the letter",
      wrong: ["Typing the letter on a digital device", "Reading sample formal letters", "Making short notes on findings"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} types a letter requesting club membership straight onto a digital device without ever reading a sample formal letter first. What risk does this create?`,
      correct: "The letter may miss expected features or format since no model letter was studied first",
      wrong: ["There is no risk, since sample letters are never useful", "Typing on a device automatically fixes any formatting issues", "Digital portfolios correct missing letter parts automatically"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes a very short, abbreviated message to the club patron requesting membership, similar to an SMS. What is the issue with this approach?`,
      correct: "A letter of request needs a formal structure and complete sentences, unlike a casual SMS",
      wrong: ["Abbreviations are always appropriate in formal letters", "SMS format is required for all letters of request", "Length alone determines whether a letter is formal"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes a complete letter requesting library membership but ends it with just "Bye" instead of a proper sign-off. What is the issue?`,
      correct: "The sign-off is too informal; a formal complimentary close such as \"Yours faithfully\" is needed",
      wrong: ["\"Bye\" is an acceptable complimentary close for any letter", "A complimentary close is optional in a letter of request", "Only the length of the sign-off matters, not its formality"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} wonders why a request for library or club membership needs to be written formally rather than casually. What is the best reason?`,
      correct: "Institutions expect formal, respectful requests to be taken seriously when making a decision",
      wrong: ["It makes no difference to how the request is treated", "Casual tone is always preferred by institutions", "Formality is only required for job applications, not membership requests"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During peer review in ${where}, ${who} tells a classmate a clearly incomplete letter — missing both the salutation and address — is "perfect", just to avoid an awkward conversation. What value has ${who} failed to show?`,
      correct: "Integrity, since honest and constructive feedback actually helps the writer improve the letter",
      wrong: ["Unity, since agreeing with a classmate always shows cooperation", "Digital literacy, since the letter was still reviewed", "Nothing, since the feedback given was still useful"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes a letter requesting club membership but places the recipient's address where the sender's address should go, and the sender's address where the recipient's should go. What mistake is this?`,
      correct: "The sender's and recipient's addresses have been placed in the wrong positions in the letter's layout",
      wrong: ["The letter has no addresses at all", "Address position does not matter in a letter of request", "Only one address is ever needed in a letter of request"],
    };
  },
];

export const patriotismLetterWriting: Skill = {
  id: "g7-il-w-patriotism",
  code: "W.9",
  subjectId: "indigenous-language",
  strandId: "g7-il-writing",
  grade: 7,
  title: "Patriotism: letter of request",
  description: "Outline the components of a letter of request and compose one, such as for library or club membership, appreciating the importance of letter writing.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A letter of request needs a full formal structure: addresses, date, salutation, a clear reason in the body, a polite closing, complimentary close, and signature.";

    if (branch === "match") {
      const chosen = shuffle(rng, LETTER_PARTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.part, label: s.part })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.part, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.part] = s.part;
      return {
        kind: "click-match",
        prompt: "Match each part of a letter of request to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.part} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, LETTER_PRACTICES).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `l${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`l${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each behaviour as good or poor practice when writing a letter of request.",
        items,
        buckets,
        correctBucket,
        hint: "Good practice follows the proper format and process; poor practice skips required parts or steps.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LETTER_STRUCTURE);
      return {
        kind: "ordering",
        prompt: "Arrange the parts of a formal letter of request in the correct order, from top to bottom.",
        instruction: "Click them in order.",
        items,
        correctOrder: LETTER_STRUCTURE.map((s) => s.id),
        hint: "Start with the sender's address and date, then the recipient's address, salutation, subject, body, closing, complimentary close, and finally the signature.",
        explanation: LETTER_STRUCTURE.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
    return {
      kind: "multiple-choice",
      prompt: entry.prompt,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
