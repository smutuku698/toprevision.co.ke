import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CHARACTERISTICS = [
  { id: "speed", label: "Speed", def: "Performs tasks in a very short time" },
  { id: "accuracy", label: "Accuracy", def: "Produces error-free results if given correct data and instructions" },
  { id: "versatility", label: "Versatility", def: "Can be used to perform many different types of tasks" },
  { id: "reliability", label: "Reliability", def: "Can be depended on to work consistently without failure" },
  { id: "diligence", label: "Diligence", def: "Does not get tired and can work for long periods without losing accuracy" },
  { id: "storage", label: "Storage", def: "Can keep large amounts of data for later retrieval" },
  { id: "consistency", label: "Consistency", def: "Produces the same result every time for the same input" },
  { id: "automation", label: "Automation", def: "Can carry out a set of instructions on its own once programmed" },
  { id: "connectivity", label: "Connectivity", def: "Can connect to networks to share data and communicate with other devices" },
  { id: "multitasking", label: "Multitasking", def: "Can run several programs or processes at the same time" },
] as const;

const SIZE_EXAMPLES = [
  { text: "A smartphone used to browse the internet", bucket: "micro" },
  { text: "A laptop used for schoolwork", bucket: "micro" },
  { text: "A desktop computer in a cyber cafe", bucket: "micro" },
  { text: "A tablet used to read e-books", bucket: "micro" },
  { text: "A bank's central computer processing thousands of transactions at once", bucket: "mainframe" },
  { text: "A hospital's computer that stores the records of every department", bucket: "mainframe" },
  { text: "A national tax authority's computer processing millions of taxpayer records", bucket: "mainframe" },
  { text: "A weather agency's computer used to forecast the weather for a whole country", bucket: "super" },
  { text: "A research institute's computer used to model climate change over decades", bucket: "super" },
  { text: "A space agency's computer used to calculate a rocket's exact launch trajectory", bucket: "super" },
] as const;

const SIZE_LABELS: Record<string, string> = {
  micro: "Microcomputer",
  mainframe: "Mainframe computer",
  super: "Supercomputer",
};

const SIZE_ORDER = ["super", "mainframe", "micro"] as const;
const SIZE_ORDER_LABELS = SIZE_ORDER.map((id) => SIZE_LABELS[id]);

const DATA_VS_INFO = [
  { text: "23, 19, 25, 30", answer: "data", note: "These are raw, unprocessed figures with no meaning attached — this is data." },
  { text: "The average temperature this week was 24°C", answer: "information", note: "This is data that has been processed into a meaningful statement — this is information." },
  { text: "A list of every learner's raw test scores with no names attached", answer: "data", note: "Unprocessed, unorganised figures are data." },
  { text: "Grade 7B scored the highest average mark in the school", answer: "information", note: "A processed, meaningful conclusion drawn from data is information." },
  { text: "A raw list of daily rainfall readings in millimetres for one month", answer: "data", note: "Unprocessed raw readings, with no conclusion drawn, are data." },
  { text: "This month had the heaviest rainfall of the year", answer: "information", note: "A meaningful conclusion drawn by processing raw readings is information." },
  { text: "A spreadsheet column of unlabelled numbers with no explanation", answer: "data", note: "Numbers with no context or meaning attached are data." },
  { text: "The shop's best-selling item last week was bread", answer: "information", note: "A meaningful, processed conclusion drawn from sales figures is information." },
] as const;

const FUNCTIONALITY_TYPES = [
  {
    id: "digital",
    label: "Digital computer",
    def: "Processes data as discrete numbers (0s and 1s); used in most modern computers such as laptops and smartphones",
  },
  {
    id: "analog",
    label: "Analog computer",
    def: "Processes continuously changing physical quantities such as speed, temperature or pressure",
  },
  {
    id: "hybrid",
    label: "Hybrid computer",
    def: "Combines both digital and analog features, such as equipment that monitors a patient's continuous vital signs and displays a digital readout",
  },
] as const;

const PURPOSE_SCENARIOS = [
  { text: "An ATM machine that can only carry out banking transactions", answer: "special", explanation: "It is designed to perform only one specific task (banking), so it is a special-purpose computer." },
  { text: "A laptop used for schoolwork, games, browsing and typing documents", answer: "general", explanation: "It can perform many different types of tasks, so it is a general-purpose computer." },
  { text: "A traffic light control computer that only controls signal timing", answer: "special", explanation: "It is designed to perform only one specific task (controlling signals), so it is a special-purpose computer." },
  { text: "A desktop computer in a cyber cafe used for typing, printing, browsing and design work", answer: "general", explanation: "It can perform many different types of tasks, so it is a general-purpose computer." },
  { text: "A washing machine's built-in computer that only controls the wash cycle", answer: "special", explanation: "It is designed to perform only one specific task (controlling the wash cycle), so it is a special-purpose computer." },
  { text: "A smartphone used for calls, browsing, games, photos and typing notes", answer: "general", explanation: "It can perform many different types of tasks, so it is a general-purpose computer." },
  { text: "A car's engine-control computer that only manages fuel injection and ignition timing", answer: "special", explanation: "It is designed to perform only one specific task (engine control), so it is a special-purpose computer." },
  { text: "A tablet used for reading, drawing, browsing and video calls", answer: "general", explanation: "It can perform many different types of tasks, so it is a general-purpose computer." },
  { text: "A supermarket till that only scans barcodes and calculates the total bill", answer: "special", explanation: "It is designed to perform only one specific task (processing sales), so it is a special-purpose computer." },
  { text: "A weighing scale's built-in computer that only measures and displays weight", answer: "special", explanation: "It is designed to perform only one specific task (measuring weight), so it is a special-purpose computer." },
] as const;

export const computerConcepts: Skill = {
  id: "g7-pt-f-computer-concepts",
  code: "F.3",
  subjectId: "pre-technical",
  strandId: "g7-pt-foundations",
  grade: 7,
  title: "Computer concepts",
  description: "The meaning of computer, data and information; the characteristics of a computer; and classifying computers by size and by purpose.",
  generate(rng) {
    const branch = randChoice(rng, ["characteristic-match", "size-sort", "size-order", "data-vs-info", "purpose", "functionality-match"] as const);

    if (branch === "characteristic-match") {
      const chosen = shuffle(rng, CHARACTERISTICS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.def })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: "Match each characteristic of a computer to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what makes a computer fast, correct, flexible, dependable, tireless, spacious, or predictable.",
        explanation: chosen.map((c) => `${c.label} — ${c.def}.`).join(" "),
      };
    }

    if (branch === "size-sort") {
      const chosen = shuffle(rng, SIZE_EXAMPLES).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example by the class of computer, based on its size and processing power.",
        items,
        buckets: [
          { id: "super", label: "Supercomputer" },
          { id: "mainframe", label: "Mainframe computer" },
          { id: "micro", label: "Microcomputer" },
        ],
        correctBucket,
        hint: "Microcomputers are personal devices, mainframes serve whole organisations, supercomputers handle huge nationwide computations.",
        explanation: chosen.map((s) => `"${s.text}" is an example of a ${SIZE_LABELS[s.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "size-order") {
      const shuffledOrder = shuffle(rng, SIZE_ORDER);
      return {
        kind: "ordering",
        prompt: "Arrange these classes of computers from the most powerful to the least powerful.",
        items: shuffledOrder.map((id) => ({ id, label: SIZE_LABELS[id] })),
        correctOrder: [...SIZE_ORDER],
        instruction: "Drag to arrange from most powerful to least powerful.",
        hint: "Supercomputers handle the heaviest computations; microcomputers are personal, everyday devices.",
        explanation: `From most to least powerful: ${SIZE_ORDER_LABELS.join(", ")}.`,
      };
    }

    if (branch === "data-vs-info") {
      const item = randChoice(rng, DATA_VS_INFO);
      const other = item.answer === "data" ? "information" : "data";
      const choices = shuffle(rng, [item.answer, other]);
      return {
        kind: "multiple-choice",
        prompt: `Is "${item.text}" an example of data or information?`,
        choices: choices.map((c) => c[0].toUpperCase() + c.slice(1)),
        correctIndex: choices.indexOf(item.answer),
        layout: "row",
        explanation: item.note,
      };
    }

    if (branch === "functionality-match") {
      const tokens = shuffle(rng, FUNCTIONALITY_TYPES.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FUNCTIONALITY_TYPES.map((f) => ({ id: f.id, label: f.def })));
      const correctMap: Record<string, string> = {};
      for (const f of FUNCTIONALITY_TYPES) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each class of computer, classified by functionality, to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Digital works with discrete numbers, analog works with continuously changing quantities, hybrid combines both.",
        explanation: FUNCTIONALITY_TYPES.map((f) => `${f.label} — ${f.def}.`).join(" "),
      };
    }

    const item = randChoice(rng, PURPOSE_SCENARIOS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence about this scenario.",
      before: `${item.text}. This is an example of a `,
      after: "-purpose computer.",
      correctAnswer: item.answer,
      acceptedAnswers: [item.answer],
      inputMode: "text",
      hint: "Think about whether the computer performs one specific task, or many different types of tasks.",
      explanation: item.explanation,
    };
  },
};
