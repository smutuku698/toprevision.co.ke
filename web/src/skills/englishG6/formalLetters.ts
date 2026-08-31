import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES } from "./writingSharedA";

// Source: curriculum-reference/grade-6/english.json, Writing strand, sub-strand "4.4.1
// Functional Writing — Formal Letter (Emergency Rescue Services)". learningExperiences:
// "Identify formal-letter components from a sample; search/download sample formal letters; plan
// and write a formal invitation letter; proofread and correct; display/upload/share via
// email/WhatsApp; write an invitation letter to a County NTSA Officer/Red Cross/St. John
// Ambulance representative requesting a talk on emergency response." The three named recipients
// (NTSA, Red Cross, St. John Ambulance) are used as the scenario framing below, each given
// several distinct letter contents/missing parts rather than one copy-pasted example.

const PARTS: { part: string; description: string }[] = [
  { part: "Sender's address", description: "The writer's own address, written at the top of the letter" },
  { part: "Date", description: "The day the letter was written, placed just below the sender's address" },
  { part: "Recipient's address", description: "The name, title and address of the person or office the letter is written to" },
  { part: "Salutation", description: "The formal greeting to the reader, e.g. 'Dear Sir/Madam,' or 'Dear Mr. Kiptoo,'" },
  { part: "Subject heading", description: "A short line stating what the letter is about, e.g. 'RE: INVITATION TO A TALK ON EMERGENCY RESPONSE'" },
  { part: "Body", description: "The main message — the request, information, or invitation, organised in clear paragraphs" },
  { part: "Complimentary close", description: "A formal closing phrase before the signature, e.g. 'Yours faithfully,' or 'Yours sincerely,'" },
  { part: "Signature", description: "The writer's name (and role, where relevant), signed at the very end" },
];

const FORMAL_PHRASES: string[] = [
  "I am writing to request...",
  "I would be grateful if...",
  "Yours faithfully,",
  "Dear Sir/Madam,",
  "I look forward to your favourable response.",
  "Please do not hesitate to contact me.",
  "I would like to bring to your attention...",
  "Kindly confirm your availability.",
  "Yours sincerely,",
  "On behalf of our class, I would like to invite you...",
];

const INFORMAL_PHRASES: string[] = [
  "Hey there!",
  "Thanks a lot!",
  "See you soon,",
  "Dear Mum,",
  "Can't wait to hear from you!",
  "Write back soon!",
  "Hope you're doing great!",
  "Take care,",
  "Say hi to everyone for me!",
  "Love,",
];

type Recipient = { org: string; role: string };
const RECIPIENTS: Recipient[] = [
  { org: "County NTSA Officer", role: "road safety and emergency response" },
  { org: "Kenya Red Cross Society representative", role: "first aid and disaster response" },
  { org: "St. John Ambulance representative", role: "emergency response and basic first aid" },
];

const SAMPLE_LETTERS: { excerpt: string; missingPart: string }[] = [
  {
    excerpt: "P.O. Box 45, Nakuru\n14th May 2026\n\nThe County NTSA Officer,\nP.O. Box 112, Nakuru\n\nDear Sir/Madam,\n\nRE: INVITATION TO A TALK ON EMERGENCY RESPONSE\n\nOn behalf of Green Valley Primary School, I would like to invite you to address our Grade 6 class on road safety and emergency response on 20th May 2026.\n\nJane Wanjiru\nClass Captain",
    missingPart: "Complimentary close",
  },
  {
    excerpt: "21st June 2026\n\nThe Branch Coordinator,\nKenya Red Cross Society,\nP.O. Box 88, Kisumu\n\nDear Sir/Madam,\n\nRE: INVITATION TO A FIRST AID TALK\n\nWe would be grateful if you could send a representative to teach our class basic first aid on 2nd July 2026.\n\nYours faithfully,\n\nOtieno Barasa\nClass Captain",
    missingPart: "Sender's address",
  },
  {
    excerpt: "P.O. Box 67, Eldoret\n\nThe Coordinator,\nSt. John Ambulance,\nP.O. Box 34, Eldoret\n\nDear Sir/Madam,\n\nRE: INVITATION TO AN EMERGENCY RESPONSE TALK\n\nOur class would like to learn how to respond to accidents safely. Kindly send a representative to speak to us.\n\nYours faithfully,\n\nAmina Hassan\nClass Captain",
    missingPart: "Date",
  },
  {
    excerpt: "P.O. Box 90, Thika\n9th March 2026\n\nThe County NTSA Officer,\nP.O. Box 15, Thika\n\nRE: INVITATION TO A ROAD SAFETY TALK\n\nWe kindly request that you visit our school to teach us about safe road crossing.\n\nYours faithfully,\n\nKevin Mutiso\nClass Captain",
    missingPart: "Salutation",
  },
  {
    excerpt: "P.O. Box 5, Nyeri\n11th April 2026\n\nThe Branch Coordinator,\nKenya Red Cross Society,\nP.O. Box 21, Nyeri\n\nDear Sir/Madam,\n\nOur class would be grateful if a representative could teach us how to respond to common school accidents.\n\nYours faithfully,\n\nGrace Nyambura\nClass Captain",
    missingPart: "Subject heading",
  },
  {
    excerpt: "P.O. Box 30, Machakos\n5th July 2026\n\nDear Sir/Madam,\n\nRE: REQUEST FOR AN EMERGENCY RESPONSE DEMONSTRATION\n\nWe would appreciate a visit from your organisation to demonstrate basic first aid to our class.\n\nYours faithfully,\n\nDennis Kilonzo\nClass Captain",
    missingPart: "Recipient's address",
  },
  {
    excerpt: "P.O. Box 12, Kericho\n2nd August 2026\n\nThe County NTSA Officer,\nP.O. Box 9, Kericho\n\nDear Sir/Madam,\n\nRE: INVITATION TO A TALK ON PEDESTRIAN SAFETY\n\nWe kindly invite you to speak to our Grade 6 class about pedestrian safety near school zones on 15th August 2026.\n\nYours faithfully,",
    missingPart: "Signature",
  },
  {
    excerpt: "P.O. Box 41, Kitale\n17th September 2026\n\nThe Branch Coordinator,\nKenya Red Cross Society,\nP.O. Box 60, Kitale\n\nDear Sir/Madam,\n\nRE: INVITATION TO A DISASTER PREPAREDNESS TALK\n\nYours faithfully,\n\nFaith Chebet\nClass Captain",
    missingPart: "Body",
  },
  {
    excerpt: "P.O. Box 25, Voi\n3rd October 2026\n\nThe Coordinator,\nSt. John Ambulance,\nP.O. Box 18, Voi\n\nDear Sir/Madam,\n\nRE: INVITATION TO A FIRST AID DEMONSTRATION\n\nWe would be grateful if a representative could demonstrate basic first aid to our Grade 6 class on 12th October 2026.\n\nSteven Wafula\nClass Captain",
    missingPart: "Complimentary close",
  },
  {
    excerpt: "6th November 2026\n\nThe County NTSA Officer,\nP.O. Box 3, Nyahururu\n\nDear Sir/Madam,\n\nRE: INVITATION TO A TALK ON HELMET SAFETY\n\nOur class would like to learn about the importance of wearing helmets while cycling. Kindly send a representative to address us on 18th November 2026.\n\nYours faithfully,\n\nMercy Naliaka\nClass Captain",
    missingPart: "Sender's address",
  },
];

// A real, specific grammar rule (not an arbitrary distractor): "Dear Sir/Madam," pairs with
// "Yours faithfully,"; a named salutation ("Dear Mr./Mrs./Dr. Surname,") pairs with
// "Yours sincerely,". The wrong option in each direction is the other rule's close — a genuine,
// nameable mix-up, not a random pick.
const TITLES = ["Mr.", "Mrs.", "Dr.", "Prof.", "Rev.", "Hon."];

const WHY_FORMAL: { build: (name: string, recipient: Recipient) => string; correct: string; wrongs: string[] }[] = [
  {
    build: (n, r) => `${n} writes a letter inviting the ${r.org} to school and starts it with "Hey there!" instead of "Dear Sir/Madam,". Why is this a problem?`,
    correct: "A formal letter to an official should use a formal, respectful greeting, not a casual one.",
    wrongs: ["It is not a problem — any greeting is fine as long as the letter is polite in tone.", "It only matters if the recipient is older than the writer.", "Casual greetings are always preferred because they save time."],
  },
  {
    build: (n, r) => `${n} forgets to include the recipient's address when writing to the ${r.org}. Why does this matter?`,
    correct: "Without the recipient's address, the letter is not properly addressed to the office being written to.",
    wrongs: ["It doesn't matter, since the address is only decoration on a formal letter.", "The post office will add it automatically.", "It only matters for letters sent by email, not printed ones."],
  },
  {
    build: (n, r) => `${n} leaves out the subject heading (e.g. 'RE: INVITATION TO...') in a letter to the ${r.org}. Why is this a problem?`,
    correct: "Without a subject heading, the reader cannot tell what the letter is about at a glance.",
    wrongs: ["Subject headings are optional decorations with no real purpose.", "The recipient will always read the whole letter first, so it makes no difference.", "It only matters in letters longer than one page."],
  },
  {
    build: (n, r) => `${n} opens a letter to the ${r.org} with "Dear Sir/Madam," but ends it with "Yours sincerely,". Why is this a problem?`,
    correct: "The opening and closing do not match — 'Dear Sir/Madam,' should be closed with 'Yours faithfully,'.",
    wrongs: ["Any complimentary close works with any salutation.", "It is only a problem if the letter is typed rather than handwritten.", "'Yours sincerely,' is always more polite, so it is the safer choice."],
  },
  {
    build: (n, r) => `${n}'s letter to the ${r.org} never states the actual date or time of the proposed talk. Why is this a problem?`,
    correct: "The recipient cannot confirm their availability without a specific date and time.",
    wrongs: ["The recipient will simply choose a date that suits them, so it doesn't matter.", "Dates are only needed in letters about payments.", "It is fine, since the school can always call to arrange the date later instead."],
  },
  {
    build: (n, r) => `${n} writes the whole body of a letter to the ${r.org} as one long paragraph with the address, request, and thanks all jammed together. Why is this a problem?`,
    correct: "It is harder for a busy official to read and respond to quickly when the ideas are not organised into clear paragraphs.",
    wrongs: ["Longer paragraphs always look more formal and impressive.", "It only matters if the letter is longer than 200 words.", "Formal letters are not expected to be organised into paragraphs at all."],
  },
  {
    build: (n, r) => `${n} forgets to sign or print a name at the end of the letter to the ${r.org}. Why is this a problem?`,
    correct: "The recipient cannot tell who sent the request or how to reply to it.",
    wrongs: ["It is not a problem, since the school's stamp is enough on its own.", "Signatures are only required on letters about money.", "The postmark on the envelope already identifies the sender."],
  },
  {
    build: (n, r) => `${n} uses slang like "it'll be lit!" to describe the planned talk in a letter to the ${r.org}. Why is this a problem?`,
    correct: "Slang is inappropriate, informal language for a formal request to an official.",
    wrongs: ["Slang makes the letter sound more enthusiastic, which officials prefer.", "It is only a problem in letters written in a language other than English.", "It is fine as long as the rest of the letter is formal."],
  },
  {
    build: (n, r) => `${n} sends the letter to the ${r.org} without proofreading, leaving spelling mistakes in the recipient's title. Why is this a problem?`,
    correct: "It looks careless and may come across as disrespectful to the recipient.",
    wrongs: ["Spelling mistakes in a formal letter are always ignored by adults.", "It only matters if the mistake is in the sender's own name.", "Handwritten letters are not expected to be proofread."],
  },
  {
    build: (n, r) => `${n} forgets to mention which school or class is making the request in a letter to the ${r.org}. Why is this a problem?`,
    correct: "The recipient has no way to know who is inviting them or where to go for the talk.",
    wrongs: ["The recipient can simply guess based on the letter's address.", "It only matters for letters requesting money.", "Schools are always assumed by default, so it doesn't need stating."],
  },
];

export const formalLetters: Skill = {
  id: "g6-eng-writing-formal-letters",
  code: "W.4",
  subjectId: "english",
  strandId: "g6-eng-writing",
  grade: 6,
  title: "Formal Letters",
  description: "Identify the parts and correct order of a formal invitation letter, match salutations to their correct complimentary close, and judge a formal letter for correctness of language and relevance.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["order", "click-match", "categorize", "mc-missing", "mc-salutation", "mc-why-formal", "fill-blank"] as const
    );
    const hint = "A formal letter gives the sender's and recipient's addresses, the date, a formal salutation, a subject heading, an organised body, a matching complimentary close, and a signature.";

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the parts of a formal invitation letter in the correct order.",
        instruction: "Click the parts in the order they should appear, from top to bottom.",
        items: shuffle(rng, PARTS.map((p) => ({ id: p.part, label: p.part }))),
        correctOrder: PARTS.map((p) => p.part),
        hint,
        explanation: `The correct order is: ${PARTS.map((p) => p.part).join(" → ")}.`,
      };
    }

    if (branch === "click-match") {
      const tokens = shuffle(rng, PARTS.map((p) => ({ id: p.part, label: p.part })));
      const targets = shuffle(rng, PARTS.map((p) => ({ id: p.part, label: p.description })));
      const correctMap: Record<string, string> = {};
      for (const p of PARTS) correctMap[p.part] = p.part;
      return {
        kind: "click-match",
        prompt: "Match each part of a formal letter to what it contains.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: PARTS.map((p) => `${p.part} — ${p.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const formal = shuffle(rng, FORMAL_PHRASES).slice(0, 3);
      const informal = shuffle(rng, INFORMAL_PHRASES).slice(0, 3);
      const items = shuffle(rng, [...formal, ...informal]).map((text, i) => ({ id: `p${i}`, label: text }));
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = formal.includes(it.label) ? "formal" : "informal"));
      return {
        kind: "categorize",
        prompt: "Sort each phrase into Formal letter language or Informal letter language.",
        items,
        buckets: [
          { id: "formal", label: "Formal letter language" },
          { id: "informal", label: "Informal letter language" },
        ],
        correctBucket,
        hint: "Formal language is respectful and businesslike, avoiding slang or overly casual expressions.",
        explanation: `Formal: ${formal.join(" / ")}. Informal: ${informal.join(" / ")}.`,
      };
    }

    if (branch === "mc-missing") {
      const entry = randChoice(rng, SAMPLE_LETTERS);
      const otherParts = shuffle(rng, PARTS.map((p) => p.part).filter((p) => p !== entry.missingPart)).slice(0, 3);
      const choices = shuffle(rng, [entry.missingPart, ...otherParts]);
      return {
        kind: "multiple-choice",
        prompt: "Read this formal letter excerpt. Which part of the letter is missing?",
        passage: entry.excerpt,
        choices,
        correctIndex: choices.indexOf(entry.missingPart),
        layout: "list",
        hint: `Check whether the letter has all its parts: ${PARTS.map((p) => p.part.toLowerCase()).join(", ")}.`,
        explanation: `The letter is missing its ${entry.missingPart.toLowerCase()}.`,
      };
    }

    if (branch === "mc-salutation") {
      const useNamed = rng() > 0.5;
      const surname = randChoice(rng, KENYAN_NAMES);
      const title = randChoice(rng, TITLES);
      const salutation = useNamed ? `Dear ${title} ${surname},` : "Dear Sir/Madam,";
      const correctClose = useNamed ? "Yours sincerely," : "Yours faithfully,";
      const choices = shuffle(rng, ["Yours faithfully,", "Yours sincerely,", "With love,", "See you soon,"]);
      return {
        kind: "multiple-choice",
        prompt: `A formal letter begins "${salutation}". Which complimentary close correctly matches this opening?`,
        choices,
        correctIndex: choices.indexOf(correctClose),
        layout: "row",
        hint: "'Dear Sir/Madam,' (when you don't know the reader's name) pairs with 'Yours faithfully,'. A named salutation like 'Dear Mr. Otieno,' pairs with 'Yours sincerely,'.",
        explanation: useNamed
          ? `Since the letter is addressed to a named person ("${salutation}"), it should close with "Yours sincerely,".`
          : `Since the letter does not name the reader ("${salutation}"), it should close with "Yours faithfully,".`,
      };
    }

    if (branch === "mc-why-formal") {
      const entry = randChoice(rng, WHY_FORMAL);
      const name = randChoice(rng, KENYAN_NAMES);
      const recipient = randChoice(rng, RECIPIENTS);
      const choices = shuffle(rng, [entry.correct, ...entry.wrongs]);
      return {
        kind: "multiple-choice",
        prompt: entry.build(name, recipient),
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about whether the recipient — a busy official — could tell who is writing, why, and what to do next.",
        explanation: entry.correct,
      };
    }

    const recipient = randChoice(rng, RECIPIENTS);
    const FILL_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
      { before: "I am writing to", after: `you to a talk on ${recipient.role} for our class.`, correctAnswer: "invite" },
      { before: "We would be", after: "if you could send a representative to speak to our class.", correctAnswer: "grateful" },
      { before: "We look forward to your favourable", after: ".", correctAnswer: "response", acceptedAnswers: ["reply"] },
      { before: "On", after: "of our class, I would like to invite you to speak to us.", correctAnswer: "behalf" },
      { before: "Please do not hesitate to", after: "me if you have any questions.", correctAnswer: "contact" },
      { before: "We kindly", after: "that you consider visiting our school.", correctAnswer: "request" },
      { before: "I would like to bring to your", after: "our class project on emergency response.", correctAnswer: "attention" },
      { before: "Kindly confirm your", after: "for the proposed date.", correctAnswer: "availability" },
      { before: "A formal letter that begins 'Dear Sir/Madam,' should close with 'Yours", after: ",'.", correctAnswer: "faithfully" },
      { before: "A formal letter addressed to a named person should close with 'Yours", after: ",'.", correctAnswer: "sincerely" },
    ];
    const entry = randChoice(rng, FILL_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete this formal letter phrase.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint,
      explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
    };
  },
};
