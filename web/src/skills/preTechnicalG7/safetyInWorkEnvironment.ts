import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const KENYAN_PLACES = [
  "Kamukunji, Nairobi",
  "Gikomba, Nairobi",
  "Kisumu",
  "Eldoret",
  "Nakuru",
  "Mombasa",
  "Kitengela",
  "Thika",
  "Nyeri",
  "Kitale",
  "Machakos",
  "Kericho",
] as const;

const KENYAN_NAMES = [
  "Amina",
  "Baraka",
  "Chebet",
  "Denis",
  "Fatuma",
  "Juma",
  "Kevin",
  "Lilian",
  "Mwangi",
  "Naliaka",
  "Otieno",
  "Wanjiru",
] as const;

function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}
function name(rng: RNG) {
  return randChoice(rng, KENYAN_NAMES);
}

const PPE_ITEMS = [
  { id: "goggles", label: "Goggles", protects: "Protects the eyes from flying chips, sparks and dust" },
  { id: "gloves", label: "Gloves", protects: "Protects the hands from cuts, heat and sharp materials" },
  { id: "boots", label: "Safety boots", protects: "Protects the feet from falling objects and sharp materials" },
  { id: "overalls", label: "Overalls", protects: "Protects the body and clothing from dirt, sparks and moving machine parts" },
] as const;

const THREAT_ITEMS = [
  { text: "A loose electrical cable lying across the workshop floor", bucket: "physical" },
  { text: "A pile of sharp offcuts of metal left on the workbench", bucket: "physical" },
  { text: "Working near an open flame without a fire extinguisher nearby", bucket: "physical" },
  { text: "Poor lighting that makes it hard to see moving machine parts", bucket: "physical" },
  { text: "Someone sending you threatening or abusive messages online", bucket: "online" },
  { text: "A stranger pretending to be your teacher to get your password", bucket: "online" },
  { text: "A message with a link asking you to 'confirm' your account details", bucket: "online" },
  { text: "Accepting a friend request from someone you have never met", bucket: "online" },
  { text: "A laptop stolen from an unlocked classroom store", bucket: "device" },
  { text: "A computer damaged after floodwater got into the room", bucket: "device" },
  { text: "A hard disk that suddenly fails and cannot be read", bucket: "device" },
] as const;

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

// 12 rng-varied Scenario+Hook templates (RIGOR-STANDARDS.md) covering all three threat buckets
// (physical, online, device) plus PPE, so the "scenario" Apply-tier branch draws on the sub-strand's
// full breadth rather than repeating the same 2-3 fixed scenarios every session.
const SCENARIO_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, receives a friend request from someone unknown, who then asks for the computer lab's password. What is this an example of?`,
      correct: "Impersonation or phishing, an online threat",
      wrong: ["A physical safety threat", "A hardware failure", "A normal, safe online interaction"],
      explanation: "A stranger asking for a password after pretending to be trustworthy is impersonation/phishing — an online threat, not a physical one.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} keeps posting unkind, threatening messages about a classmate on social media. What online threat is this?`,
    correct: "Cyberbullying",
    wrong: ["Hardware failure", "A natural disaster", "A physical safety threat"],
    explanation: "Repeatedly posting unkind or threatening messages about someone online is cyberbullying.",
  }),
  (rng) => ({
    prompt: `A workshop in ${place(rng)} floods during heavy rain, damaging several computers. What type of threat to digital devices is this?`,
    correct: "A physical threat to digital devices (natural disaster)",
    wrong: ["Cyberbullying", "Phishing", "Impersonation"],
    explanation: "Floods, fire and other natural disasters are physical threats to digital devices, separate from online threats like phishing or cyberbullying.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is working in a workshop in ${place(rng)} and notices a loose electrical cable lying across the floor near the workbenches. What kind of threat is this?`,
      correct: "A physical safety threat",
      wrong: ["An online threat", "A device threat only, not a safety threat", "Not a threat, since the cable is not switched on"],
      explanation: "A loose cable across a walkway can trip a worker or cause electric shock — a direct physical safety threat, whether or not it is switched on.",
    };
  },
  (rng) => ({
    prompt: `A workbench in a ${place(rng)} workshop has a pile of sharp metal offcuts left lying on it. What kind of threat does this create?`,
    correct: "A physical safety threat",
    wrong: ["An online threat", "A phishing threat", "No real threat, since the offcuts are just scrap"],
    explanation: "Sharp offcuts left within reach can cut a worker — a physical safety threat that should be cleared away or stored safely.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is welding near an open flame in a ${place(rng)} workshop that has no fire extinguisher nearby. What kind of threat does this situation create?`,
      correct: "A physical safety threat",
      wrong: ["An online threat", "A device threat only", "No threat, since welding always involves flame"],
      explanation: "Working near an open flame without fire-fighting equipment nearby is a physical safety threat — a small spark could start a fire with no way to control it.",
    };
  },
  (rng) => ({
    prompt: `Poor lighting in a workshop in ${place(rng)} makes it hard for workers to see moving machine parts clearly. What kind of threat is this?`,
    correct: "A physical safety threat",
    wrong: ["An online threat", "A hardware failure", "Not a threat, since the machine still works normally"],
    explanation: "Poor lighting that hides moving parts increases the risk of injury — a physical safety threat, even though the machine itself is working fine.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} receives a message with a link asking to 'confirm' their account details. What should ${who} recognise this as?`,
      correct: "A phishing attempt, an online threat",
      wrong: ["A physical safety threat", "A device threat", "A normal, safe request"],
      explanation: "A message with a link asking you to 'confirm' account details is a classic phishing attempt — an online threat, not a safe request.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} accepts a friend request from someone they have never met, who then starts asking personal questions. What kind of threat could this lead to?`,
    correct: "An online threat, such as impersonation or scamming",
    wrong: ["A physical safety threat", "A hardware failure", "A natural disaster"],
    explanation: "Accepting requests from strangers opens the door to online threats like impersonation or scams — it is not a physical or device-related risk.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s laptop is stolen from an unlocked classroom store in ${place(rng)}. What kind of threat is this?`,
      correct: "A physical threat to digital devices (theft)",
      wrong: ["An online threat", "Cyberbullying", "Phishing"],
      explanation: "Theft of a device due to poor physical security is a physical threat to digital devices, separate from online threats like phishing or cyberbullying.",
    };
  },
  (rng) => ({
    prompt: `A computer in ${place(rng)} suddenly develops a hard disk failure and cannot be read. What kind of threat to digital devices does this show?`,
    correct: "A physical threat to digital devices (hardware failure)",
    wrong: ["An online threat", "Cyberbullying", "Impersonation"],
    explanation: "A hard disk failure is a physical/hardware threat to a digital device, not an online threat — regular backups help protect against losing the data it held.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is operating a drilling machine in a ${place(rng)} workshop while wearing loose clothing that is not tucked in. What kind of threat does this create?`,
      correct: "A physical safety threat",
      wrong: ["An online threat", "A device threat", "No threat, since the clothing is not made of metal"],
      explanation: "Loose clothing near moving machine parts can get caught and pull a worker in — a physical safety threat that PPE like overalls is designed to reduce.",
    };
  },
];

const RESPONSE_STEPS = [
  { id: "no-click", label: "Do not click the link or open the attachment" },
  { id: "no-share", label: "Do not share any password or personal details" },
  { id: "tell-adult", label: "Tell a trusted adult or teacher about the message" },
  { id: "block-report", label: "Block or report the sender's account" },
] as const;

// 12 distinct fill-blank facts spanning PPE, the PPE abbreviation itself, and the three threat
// categories (physical/online/device) — not just 4 near-identical PPE sentences — so this branch
// clears the 10+ template floor with genuinely varied content, not padding.
const FILL_BLANK_TEMPLATES = [
  {
    before: "The piece of protective equipment that protects the eyes from flying chips, sparks and dust is called ",
    after: ".",
    correctAnswer: "goggles",
    acceptedAnswers: ["goggles"],
    hint: "Think about which item of PPE covers the eyes.",
    explanation: "Goggles protect the eyes from flying chips, sparks and dust in a work environment.",
  },
  {
    before: "The piece of protective equipment that protects the hands from cuts, heat and sharp materials is called ",
    after: ".",
    correctAnswer: "gloves",
    acceptedAnswers: ["gloves"],
    hint: "Think about which item of PPE covers the hands.",
    explanation: "Gloves protect the hands from cuts, heat and sharp materials in a work environment.",
  },
  {
    before: "The piece of protective equipment that protects the feet from falling objects and sharp materials is called ",
    after: ".",
    correctAnswer: "safety boots",
    acceptedAnswers: ["safety boots", "boots"],
    hint: "Think about which item of PPE covers the feet.",
    explanation: "Safety boots protect the feet from falling objects and sharp materials in a work environment.",
  },
  {
    before: "The piece of protective equipment that protects the body and clothing from dirt, sparks and moving machine parts is called ",
    after: ".",
    correctAnswer: "overalls",
    acceptedAnswers: ["overalls"],
    hint: "Think about which item of PPE covers the whole body over normal clothing.",
    explanation: "Overalls protect the body and clothing from dirt, sparks and moving machine parts in a work environment.",
  },
  {
    before: "The short form 'PPE', used to describe items like goggles, gloves, boots and overalls, stands for personal protective ",
    after: ".",
    correctAnswer: "equipment",
    acceptedAnswers: ["equipment"],
    hint: "PPE = Personal Protective ___.",
    explanation: "PPE stands for Personal Protective Equipment — items worn to reduce the risk of injury at work.",
  },
  {
    before: "Wearing goggles in a workshop mainly protects a worker's ",
    after: ".",
    correctAnswer: "eyes",
    acceptedAnswers: ["eyes"],
    hint: "Think about flying chips and sparks.",
    explanation: "Goggles are worn to protect the eyes from flying chips, sparks and dust.",
  },
  {
    before: "Wearing safety boots in a workshop mainly protects a worker's ",
    after: ".",
    correctAnswer: "feet",
    acceptedAnswers: ["feet"],
    hint: "Think about falling objects.",
    explanation: "Safety boots are worn to protect the feet from falling objects and sharp materials.",
  },
  {
    before: "A stranger pretending to be a teacher in order to get a learner's password is an example of impersonation, also called ",
    after: ".",
    correctAnswer: "phishing",
    acceptedAnswers: ["phishing"],
    hint: "This word describes tricking someone into giving up private details online.",
    explanation: "Impersonation used to trick someone into giving up private details is commonly called phishing.",
  },
  {
    before: "Repeatedly posting unkind or threatening messages about someone online is called ",
    after: ".",
    correctAnswer: "cyberbullying",
    acceptedAnswers: ["cyberbullying"],
    hint: "This word combines 'cyber' (online) with a familiar playground word.",
    explanation: "Cyberbullying is the online threat of repeatedly posting unkind or threatening messages about someone.",
  },
  {
    before: "A flood or fire that damages a computer, rather than an attack carried out over the internet, is an example of a physical threat to digital ",
    after: ".",
    correctAnswer: "devices",
    acceptedAnswers: ["devices"],
    hint: "This threat damages the hardware itself, not data over the internet.",
    explanation: "Floods, fire and similar disasters are physical threats to digital devices, separate from online threats like phishing.",
  },
  {
    before: "If you receive a suspicious message with a link asking for your password, the safest response is to avoid clicking the link and to tell a trusted ",
    after: ".",
    correctAnswer: "adult",
    acceptedAnswers: ["adult", "teacher"],
    hint: "Who should you report a suspicious online message to?",
    explanation: "The safe response to a suspicious link is to avoid clicking it, not share any details, and tell a trusted adult or teacher.",
  },
  {
    before: "A laptop stolen from an unlocked classroom store is an example of a physical threat to digital devices, specifically ",
    after: ".",
    correctAnswer: "theft",
    acceptedAnswers: ["theft"],
    hint: "What is it called when something is taken without permission?",
    explanation: "A stolen device is a physical threat to digital devices caused by theft, which locking storage rooms helps prevent.",
  },
] as const;

const CARE_QUESTIONS = [
  {
    prompt: "Which of these is the correct way to observe safety in a work environment?",
    correct: "Wearing the correct protective equipment and reporting hazards immediately",
    wrong: ["Ignoring small spills because they are not urgent", "Sharing your online passwords with classmates for convenience", "Working with loose clothing near moving machinery"],
    explanation: "Observing safety means wearing correct protective equipment and reporting hazards straight away, not ignoring them or taking shortcuts.",
  },
  {
    prompt: "What is the best way to safeguard against online threats such as phishing?",
    correct: "Avoid clicking suspicious links and never share personal passwords",
    wrong: ["Accept every friend request to be polite", "Reply to suspicious messages asking for more details", "Use the same simple password everywhere"],
    explanation: "Avoiding suspicious links and never sharing passwords are key ways to safeguard against online threats like phishing.",
  },
] as const;

export const safetyInWorkEnvironment: Skill = {
  id: "g7-pt-f-safety-in-work-environment",
  code: "F.2",
  subjectId: "pre-technical",
  strandId: "g7-pt-foundations",
  grade: 7,
  title: "Safety in the work environment",
  description: "Identifying physical safety threats, online threats, and physical threats to digital devices; personal protective equipment; and safety rules that protect people and data in a work environment.",
  generate(rng) {
    const branch = randChoice(rng, ["threat-sort", "ppe-match", "identify-ppe", "scenario", "response-order", "ppe-fill", "care"] as const);

    if (branch === "threat-sort") {
      const chosen = shuffle(rng, THREAT_ITEMS).slice(0, 6);
      const items = chosen.map((t, i) => ({ id: `t${i}`, label: t.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((t, i) => (correctBucket[`t${i}`] = t.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each situation as a physical safety threat, an online threat, or a physical threat to digital devices.",
        items,
        buckets: [
          { id: "physical", label: "Physical safety threat" },
          { id: "online", label: "Online threat" },
          { id: "device", label: "Physical threat to digital devices" },
        ],
        correctBucket,
        hint: "Physical threats can injure a person directly; online threats happen through the internet; device threats damage or steal the equipment itself.",
        explanation: chosen.map((t) => `"${t.text}" is a ${t.bucket === "physical" ? "physical safety threat" : t.bucket === "online" ? "online threat" : "physical threat to digital devices"}.`).join(" "),
      };
    }

    if (branch === "ppe-match") {
      const tokens = shuffle(rng, PPE_ITEMS.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(
        rng,
        PPE_ITEMS.map((p) => ({ id: p.id, label: p.protects, icon: { type: "ppe-icon" as const, item: p.id } }))
      );
      const correctMap: Record<string, string> = {};
      for (const p of PPE_ITEMS) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: "Match each piece of protective equipment to what it protects.",
        tokens,
        targets,
        correctMap,
        hint: "Think about which part of the body each item covers.",
        explanation: PPE_ITEMS.map((p) => `${p.label} — ${p.protects}.`).join(" "),
      };
    }

    if (branch === "identify-ppe") {
      const target = randChoice(rng, PPE_ITEMS);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        PPE_ITEMS.filter((p) => p.id !== target.id).map((p) => p.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: "Identify this piece of personal protective equipment (PPE).",
        visual: { type: "ppe-icon", item: target.id },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is ${target.label.toLowerCase()}. It ${target.protects.toLowerCase()}.`,
      };
    }

    if (branch === "scenario") {
      const q = randChoice(rng, SCENARIO_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        explanation: q.explanation,
      };
    }

    if (branch === "response-order") {
      const shuffled = shuffle(rng, RESPONSE_STEPS);
      return {
        kind: "ordering",
        prompt: "You receive a suspicious message with a link asking for your password. Arrange the correct response steps, from first to last.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: RESPONSE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Protect yourself first (don't click, don't share), then get help, then stop the sender.",
        explanation: `The correct order is: ${RESPONSE_STEPS.map((s) => s.label).join("; ")}.`,
      };
    }

    if (branch === "ppe-fill") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.acceptedAnswers],
        inputMode: "text",
        hint: fb.hint,
        explanation: fb.explanation,
      };
    }

    const q = randChoice(rng, CARE_QUESTIONS);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      explanation: q.explanation,
    };
  },
};
