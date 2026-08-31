import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const STRANDS = [
  { id: "foundations", label: "Foundations of Pre-Technical Studies", desc: "Introducing the subject, safety in the work environment, and computer concepts" },
  { id: "communication", label: "Communication", desc: "Fundamentals of communication, introduction to technical drawing, and plane geometry" },
  { id: "materials", label: "Materials for Production", desc: "Economic resources, metallic materials, and non-metallic materials" },
  { id: "tools", label: "Tools and Production", desc: "Measuring and marking out tools, and production of goods and services" },
  { id: "entrepreneurship", label: "Entrepreneurship", desc: "Introduction to entrepreneurship, money, and financial goals" },
] as const;

const STRAND_ORDER = STRANDS.map((s) => s.label);

const SCENARIOS = [
  { text: "Repairing a wooden stool at home using a hammer and nails", bucket: "technical" },
  { text: "Measuring and cutting a metal sheet to the correct size", bucket: "technical" },
  { text: "Following safety rules when using a saw in the workshop", bucket: "technical" },
  { text: "Keeping a record of income and expenses for a small shop", bucket: "business" },
  { text: "Calculating the profit made from selling vegetables at a market", bucket: "business" },
  { text: "Drawing up a simple budget before starting a small poultry business", bucket: "business" },
  { text: "Typing and saving a document on a laptop", bucket: "computer" },
  { text: "Using a spreadsheet to organise a list of customers", bucket: "computer" },
  { text: "Searching the internet for information on a school project", bucket: "computer" },
] as const;

const CAREER_LINKS = [
  { career: "Engineer or building technician", link: "Skills in technical drawing, materials and tools from Pre-Technical Studies" },
  { career: "Entrepreneur or shopkeeper", link: "Skills in money management and entrepreneurship from Pre-Technical Studies" },
  { career: "ICT technician or programmer", link: "Skills in computer concepts from Pre-Technical Studies" },
  { career: "Artisan (fundi) such as a welder or carpenter", link: "Skills in using and caring for tools from Pre-Technical Studies" },
] as const;

const ROLE_QUESTIONS = [
  {
    prompt: "Which learning area did Pre-Technical Studies build on from Upper Primary School?",
    correct: "Science and Technology",
    wrong: ["Kiswahili", "Creative Arts", "Religious Education"],
    explanation: "Pre-Technical Studies is an integrated learning area that builds on the competencies acquired in Science and Technology at Upper Primary School.",
  },
  {
    prompt: "Which of these best explains why Pre-Technical Studies is important in day-to-day life?",
    correct: "It equips learners with practical skills for making and using tools, materials, technology and money",
    wrong: ["It only teaches learners how to memorise historical dates", "It replaces the need to learn Mathematics", "It is only useful for learners who plan to travel abroad"],
    explanation: "Pre-Technical Studies develops practical, everyday skills — using tools and materials, communicating with ICT, and managing money — that are useful in day-to-day life, not just in a classroom.",
  },
  {
    prompt: "Which National Goal of Education is Pre-Technical Studies most closely anchored on?",
    correct: "Providing learners with the necessary skills and attitudes for industrial development",
    wrong: ["Promoting international consciousness towards other nations", "Fostering nationalism and patriotism", "Promoting sound moral and religious values"],
    explanation: "Pre-Technical Studies is anchored on National Goal of Education No. 2, which promotes the social, economic, technological and industrial needs for national development.",
  },
] as const;

const DEFINITIONS = [
  { before: "Pre-Technical Studies is an integrated learning area comprising Business, Computer and ", after: " Studies.", answer: "Technical", accepted: ["Technical"] },
  { before: "The strand of Pre-Technical Studies that covers Economic Resources, Metallic Materials and Non-Metallic Materials is called Materials for ", after: ".", answer: "Production", accepted: ["Production"] },
  { before: "The strand of Pre-Technical Studies that covers safety, computer concepts and an introduction to the subject is called Foundations of Pre-Technical ", after: ".", answer: "Studies", accepted: ["Studies"] },
  { before: "The strand of Pre-Technical Studies that covers Fundamentals of Communication, Introduction to Drawing and Plane Geometry is called ", after: ".", answer: "Communication", accepted: ["Communication"] },
  { before: "The strand of Pre-Technical Studies that covers Introduction to Entrepreneurship, Money and Financial Goals is called ", after: ".", answer: "Entrepreneurship", accepted: ["Entrepreneurship"] },
  { before: "The strand of Pre-Technical Studies that covers Measuring and Marking Out Tools, and Production of Goods and Services is called Tools and ", after: ".", answer: "Production", accepted: ["Production"] },
  { before: "Pre-Technical Studies builds on the competencies learners already acquired in Science and ", after: " at Upper Primary School.", answer: "Technology", accepted: ["Technology"] },
  { before: "Grade 7 Pre-Technical Studies as a subject is organised into ", after: " strands.", answer: "five", accepted: ["five", "5"] },
  { before: "Pre-Technical Studies is anchored on National Goal of Education number ", after: ", which addresses industrial and technological development.", answer: "2", accepted: ["2", "two"] },
  { before: "An artisan (fundi) such as a welder or carpenter depends most on skills from the Tools and ", after: " strand of Pre-Technical Studies.", answer: "Production", accepted: ["Production"] },
  { before: "An ICT technician or programmer depends most on skills from the Computer Concepts sub-strand, part of the ", after: " strand of Pre-Technical Studies.", answer: "Foundations", accepted: ["Foundations"] },
] as const;

export const introToPreTechnical: Skill = {
  id: "g7-pt-f-intro-to-pre-technical",
  code: "F.1",
  subjectId: "pre-technical",
  strandId: "g7-pt-foundations",
  grade: 7,
  title: "Introduction to Pre-Technical Studies",
  description: "The components of Pre-Technical Studies as a learning area, its five strands, the role it plays in day-to-day life, and how it connects to career development.",
  generate(rng) {
    const branch = randChoice(rng, ["scenario-sort", "career-match", "strand-order", "role-knowledge", "definition-fill"] as const);

    if (branch === "scenario-sort") {
      const chosen = shuffle(rng, SCENARIOS).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each everyday activity by the component of Pre-Technical Studies it mainly relates to: Business, Computer, or Technical.",
        items,
        buckets: [
          { id: "business", label: "Business" },
          { id: "computer", label: "Computer" },
          { id: "technical", label: "Technical" },
        ],
        correctBucket,
        hint: "Business relates to money and records, Computer relates to ICT devices, Technical relates to tools and materials.",
        explanation: chosen.map((s) => `"${s.text}" mainly relates to the ${s.bucket} component.`).join(" "),
      };
    }

    if (branch === "career-match") {
      const tokens = shuffle(rng, CAREER_LINKS.map((c) => ({ id: c.career, label: c.career })));
      const targets = shuffle(rng, CAREER_LINKS.map((c) => ({ id: c.career, label: c.link })));
      const correctMap: Record<string, string> = {};
      for (const c of CAREER_LINKS) correctMap[c.career] = c.career;
      return {
        kind: "click-match",
        prompt: "Match each career pathway to the Pre-Technical Studies skills that best prepare a learner for it.",
        tokens,
        targets,
        correctMap,
        hint: "Think about which strand of Pre-Technical Studies each career depends on most.",
        explanation: CAREER_LINKS.map((c) => `${c.career} — ${c.link}.`).join(" "),
      };
    }

    if (branch === "strand-order") {
      const shuffledStrands = shuffle(rng, STRANDS);
      return {
        kind: "ordering",
        prompt: "Arrange the strands of Grade 7 Pre-Technical Studies in the order they appear in the curriculum design, from first to last.",
        items: shuffledStrands.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: STRANDS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "The subject begins with the Foundations strand and ends with Entrepreneurship.",
        explanation: `The correct order is: ${STRAND_ORDER.join(", ")}.`,
      };
    }

    if (branch === "role-knowledge") {
      const q = randChoice(rng, ROLE_QUESTIONS);
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

    const d = randChoice(rng, DEFINITIONS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: d.before,
      after: d.after,
      correctAnswer: d.answer,
      acceptedAnswers: [...d.accepted],
      inputMode: "text",
      hint: "Think about the five strands and three components of Pre-Technical Studies.",
      explanation: `${d.before}${d.answer}${d.after}`,
    };
  },
};
