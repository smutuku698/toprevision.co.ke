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

const ICT_TOOLS = [
  { id: "email", label: "Email", use: "Sending formal written messages and documents that can be kept as a record" },
  { id: "mobile-phone", label: "Mobile phone", use: "Quick voice calls or text messages, especially when travelling" },
  { id: "video-conferencing", label: "Video conferencing tool", use: "Holding a face-to-face meeting with people who are far away" },
  { id: "social-networking", label: "Social networking site", use: "Sharing updates and reaching a large audience quickly" },
  { id: "online-collaboration", label: "Online collaboration tool", use: "Letting several people edit the same document together at the same time" },
] as const;

const INTERNET_ITEMS = [
  { text: "Communicating instantly with a supplier in another county", bucket: "benefit" },
  { text: "Finding information quickly to solve a work problem", bucket: "benefit" },
  { text: "Working together with colleagues in different towns on the same document", bucket: "benefit" },
  { text: "Reaching many customers at once through social media", bucket: "benefit" },
  { text: "A slow or unreliable network interrupting an important video call", bucket: "challenge" },
  { text: "The cost of buying internet data bundles regularly", bucket: "challenge" },
  { text: "Being exposed to online threats such as phishing or hacking", bucket: "challenge" },
  { text: "Getting distracted by unrelated content while working online", bucket: "challenge" },
] as const;

interface ToolScenario {
  text: string;
  correct: string;
}

// 12 rng-varied Scenario+Hook templates (RIGOR-STANDARDS.md) — roughly 2-3 per ICT tool — so the
// Apply-tier "which tool is most suitable" branch draws well beyond the original 5 fixed scenarios.
const TOOL_SCENARIO_TEMPLATES: ((rng: RNG) => ToolScenario)[] = [
  (rng) => ({ text: `A team spread across ${place(rng)} and two other counties needs to discuss a project face-to-face without travelling.`, correct: "video-conferencing" }),
  (rng) => ({ text: `A manager in ${place(rng)} needs to send a formal letter with an attached report that can be kept as a record.`, correct: "email" }),
  (rng) => ({ text: `Three colleagues working from different towns, including ${place(rng)}, need to edit the same budget spreadsheet at the same time.`, correct: "online-collaboration" }),
  (rng) => {
    const who = name(rng);
    return { text: `${who}, a supervisor visiting a site in ${place(rng)}, is out of the office and needs to make a quick call to check on urgent progress.`, correct: "mobile-phone" };
  },
  (rng) => ({ text: `A small business in ${place(rng)} wants to reach many potential customers quickly with a new product announcement.`, correct: "social-networking" }),
  (rng) => {
    const who = name(rng);
    return { text: `${who}, a job applicant in ${place(rng)}, needs to send a CV and cover letter to an employer with proof that it was sent.`, correct: "email" };
  },
  (rng) => {
    const who = name(rng);
    return { text: `${who}, a matatu driver operating out of ${place(rng)}, needs to quickly tell the conductor by voice about a sudden change of route.`, correct: "mobile-phone" };
  },
  (rng) => ({ text: `A company based in ${place(rng)} wants to interview a job candidate who lives in another county, without either side travelling.`, correct: "video-conferencing" }),
  (rng) => {
    const who = name(rng);
    return { text: `${who} runs a small tailoring business in ${place(rng)} and wants to show off new designs to as many potential customers as possible today.`, correct: "social-networking" };
  },
  (rng) => ({ text: `Three teachers at different schools around ${place(rng)} need to jointly draft the same lesson-plan document, editing it together in real time.`, correct: "online-collaboration" }),
  (rng) => {
    const who = name(rng);
    return { text: `${who}, a supplier based in ${place(rng)}, needs to send an official invoice to a customer that both sides can keep on file.`, correct: "email" };
  },
  (rng) => {
    const who = name(rng);
    return { text: `${who} is walking through a busy market in ${place(rng)} and needs to quickly warn a colleague, by voice, about a sudden price change.`, correct: "mobile-phone" };
  },
];

const IMPORTANCE_QUESTIONS = [
  {
    prompt: "Which of these best explains why effective communication is important in a work environment?",
    correct: "It reduces misunderstandings and mistakes, and improves teamwork",
    wrong: ["It guarantees that no one will ever disagree", "It removes the need for any written records", "It is only useful for managers, not other workers"],
    explanation: "Effective communication reduces misunderstandings and mistakes and helps people work together well as a team.",
  },
  {
    prompt: "Why is it important to use the correct ICT tool for a given communication task?",
    correct: "The right tool makes the message clearer, faster and more suitable for the situation",
    wrong: ["Any tool works exactly the same for every situation", "Using ICT tools is never necessary in a work environment", "The choice of tool has no effect on how well a message is understood"],
    explanation: "Different ICT tools suit different situations — choosing the right one makes communication clearer, faster and more effective.",
  },
] as const;

const COMMUNICATION_STEPS = [
  { id: "understand", label: "Understand exactly what message needs to be sent" },
  { id: "choose-tool", label: "Choose the ICT tool best suited to the message and audience" },
  { id: "send-clearly", label: "Send the message clearly using that tool" },
  { id: "confirm", label: "Confirm that the receiver has understood the message" },
] as const;

const BAR_CHART_TOOLS = [
  { label: "Mobile phone", value: 22 },
  { label: "Email", value: 15 },
  { label: "Video call", value: 9 },
  { label: "Social media", value: 12 },
] as const;

// 11 distinct fill-blank facts spanning ICT tools, internet benefits/challenges, and the steps of
// clear communication — not a single hardcoded sentence (the original bug this floor targets).
const FILL_BLANK_TEMPLATES = [
  {
    before: "The ICT tool best suited to sending a formal written message and documents that can be kept as a record is ",
    after: ".",
    correctAnswer: "email",
    acceptedAnswers: ["email", "an email"],
    hint: "Think about which tool is best for a formal, kept record.",
    explanation: "Email is best suited to sending formal written messages and documents that can be kept as a record.",
  },
  {
    before: "The ICT tool best suited to a quick voice call or text message while travelling is a ",
    after: ".",
    correctAnswer: "mobile phone",
    acceptedAnswers: ["mobile phone", "a mobile phone"],
    hint: "Think about which tool fits in a pocket and works anywhere.",
    explanation: "A mobile phone is best suited to quick voice calls or text messages, especially when travelling.",
  },
  {
    before: "The ICT tool that lets you hold a face-to-face meeting with people who are far away is a ",
    after: " tool.",
    correctAnswer: "video conferencing",
    acceptedAnswers: ["video conferencing", "video conference"],
    hint: "Think about seeing and hearing someone live, without travelling.",
    explanation: "A video conferencing tool lets you hold a face-to-face meeting with people who are far away.",
  },
  {
    before: "The ICT tool best suited to sharing updates and reaching a large audience quickly is a ",
    after: " site.",
    correctAnswer: "social networking",
    acceptedAnswers: ["social networking", "social media"],
    hint: "Think about the tool many businesses use to reach many customers at once.",
    explanation: "A social networking site is best suited to sharing updates and reaching a large audience quickly.",
  },
  {
    before: "The tool that allows several people to edit the same document over the internet at the same time is called an ",
    after: " tool.",
    correctAnswer: "online collaboration",
    acceptedAnswers: ["online collaboration", "collaboration"],
    hint: "Think of tools like shared online documents that many people can edit together.",
    explanation: "An online collaboration tool lets several people work on and edit the same document over the internet at the same time.",
  },
  {
    before: "A slow or unreliable network interrupting an important video call is an example of a ",
    after: " of using the internet for communication.",
    correctAnswer: "challenge",
    acceptedAnswers: ["challenge"],
    hint: "Is this something that helps communication or gets in its way?",
    explanation: "A slow, unreliable network that interrupts a call is a challenge of using the internet for communication.",
  },
  {
    before: "Finding information quickly to solve a work problem is an example of a ",
    after: " of using the internet for communication.",
    correctAnswer: "benefit",
    acceptedAnswers: ["benefit"],
    hint: "Is this something that helps communication or gets in its way?",
    explanation: "Quickly finding information to solve a problem is a benefit of using the internet for communication.",
  },
  {
    before: "The first step of clear communication in a work environment is to ",
    after: " exactly what message needs to be sent.",
    correctAnswer: "understand",
    acceptedAnswers: ["understand"],
    hint: "Before choosing a tool or sending anything, what must you know first?",
    explanation: "The first step of clear communication is to understand exactly what message needs to be sent.",
  },
  {
    before: "After choosing the right ICT tool and sending a message clearly, the final step of clear communication is to ",
    after: " that the receiver has understood the message.",
    correctAnswer: "confirm",
    acceptedAnswers: ["confirm"],
    hint: "How do you know your message actually landed?",
    explanation: "The final step of clear communication is to confirm that the receiver has understood the message.",
  },
  {
    before: "Effective communication in a work environment reduces misunderstandings and mistakes, and improves ",
    after: ".",
    correctAnswer: "teamwork",
    acceptedAnswers: ["teamwork"],
    hint: "What does good communication build among colleagues?",
    explanation: "Effective communication reduces misunderstandings and mistakes and improves teamwork.",
  },
  {
    before: "Choosing the correct ICT tool for a communication task makes the message clearer, faster and more ",
    after: " for the situation.",
    correctAnswer: "suitable",
    acceptedAnswers: ["suitable", "appropriate"],
    hint: "The right tool fits the situation better than the wrong one.",
    explanation: "The right ICT tool makes a message clearer, faster and more suitable for the situation than the wrong tool would.",
  },
] as const;

export const fundamentalsOfCommunication: Skill = {
  id: "g7-pt-com-fundamentals-of-communication",
  code: "COM.1",
  subjectId: "pre-technical",
  strandId: "g7-pt-communication",
  grade: 7,
  title: "Fundamentals of communication",
  description: "The importance of communication in a work environment, ICT tools used for communication, choosing the right tool for a situation, and the benefits and challenges of the internet.",
  generate(rng) {
    const branch = randChoice(rng, ["internet-sort", "tool-match", "tool-scenario", "importance", "chart-read", "step-order", "fill-tool"] as const);

    if (branch === "internet-sort") {
      const chosen = shuffle(rng, INTERNET_ITEMS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `i${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`i${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as a benefit or a challenge of using the internet for communication in a work environment.",
        items,
        buckets: [
          { id: "benefit", label: "Benefit" },
          { id: "challenge", label: "Challenge" },
        ],
        correctBucket,
        hint: "A benefit makes communication easier or better; a challenge makes it harder or riskier.",
        explanation: chosen.map((c) => `"${c.text}" is a ${c.bucket} of using the internet for communication.`).join(" "),
      };
    }

    if (branch === "tool-match") {
      const chosen = shuffle(rng, ICT_TOOLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.use })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Match each ICT tool used in communication to what it is best suited for.",
        tokens,
        targets,
        correctMap,
        hint: "Think about speed, formality, distance, and how many people need to be reached.",
        explanation: chosen.map((t) => `${t.label} — ${t.use}.`).join(" "),
      };
    }

    if (branch === "tool-scenario") {
      const s = randChoice(rng, TOOL_SCENARIO_TEMPLATES)(rng);
      const correctTool = ICT_TOOLS.find((t) => t.id === s.correct)!;
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        correctTool.label,
        ICT_TOOLS.filter((t) => t.id !== s.correct).map((t) => t.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${s.text} Which ICT tool is most suitable?`,
        choices,
        correctIndex,
        layout: "list",
        explanation: `${correctTool.label} is most suitable — ${correctTool.use.toLowerCase()}.`,
      };
    }

    if (branch === "importance") {
      const q = randChoice(rng, IMPORTANCE_QUESTIONS);
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

    if (branch === "chart-read") {
      const data = shuffle(rng, BAR_CHART_TOOLS);
      const top = [...data].sort((a, b) => b.value - a.value)[0];
      const choices = shuffle(rng, data.map((d) => d.label));
      return {
        kind: "multiple-choice",
        prompt: "This chart shows how many workers in a small workshop use each ICT communication tool most often. Which tool is used by the most workers?",
        visual: { type: "bar-chart", data },
        choices,
        correctIndex: choices.indexOf(top.label),
        layout: "list",
        explanation: `${top.label} is used by the most workers (${top.value}), the tallest bar on the chart.`,
      };
    }

    if (branch === "step-order") {
      const shuffled = shuffle(rng, COMMUNICATION_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of clear communication in a work environment, from first to last.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: COMMUNICATION_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Know the message first, then pick the tool, then send it, then check it landed.",
        explanation: `The correct order is: ${COMMUNICATION_STEPS.map((s) => s.label).join("; ")}.`,
      };
    }

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
  },
};
