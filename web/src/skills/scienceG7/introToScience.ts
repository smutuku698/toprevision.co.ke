import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const COMPONENTS = [
  { id: "si", label: "Scientific Investigation", desc: "Using tools, safety rules and measurement skills to carry out fair experiments" },
  { id: "mec", label: "Mixtures, Elements and Compounds", desc: "How substances combine, separate and react with each other" },
  { id: "lte", label: "Living Things and their Environment", desc: "How the human body, other organisms and the environment work and interact" },
  { id: "fe", label: "Force and Energy", desc: "How electricity, magnetism, movement and energy behave" },
] as const;

const DAILY_LIFE_ITEMS = [
  { text: "A nurse in Kisumu checks a patient's temperature and prescribes the right dose of medicine", bucket: "health" },
  { text: "A clinical officer explains why hand-washing with soap prevents the spread of disease", bucket: "health" },
  { text: "A public health officer in Kilifi tests drinking water for contamination", bucket: "health" },
  { text: "A farmer in Nakuru tests soil pH before planting maize to know which fertiliser to add", bucket: "agriculture" },
  { text: "An agricultural extension officer advises on the best method to store harvested grain", bucket: "agriculture" },
  { text: "A veterinary officer in Kericho vaccinates dairy cattle against disease", bucket: "agriculture" },
  { text: "An engineer at a Mombasa textile mill controls machines that spin cotton into thread", bucket: "industry" },
  { text: "A technician at a Nairobi factory checks that packaged juice meets safety standards", bucket: "industry" },
  { text: "A quality-control officer at a Thika cement plant tests samples for strength", bucket: "industry" },
  { text: "A pilot uses instruments to monitor altitude, fuel and weather during a flight to Kisumu", bucket: "transport" },
  { text: "A mechanic diagnoses why a matatu engine is overheating on the Nairobi–Nakuru highway", bucket: "transport" },
  { text: "A ship's engineer at Mombasa port monitors fuel levels and engine performance", bucket: "transport" },
] as const;

const CAREER_QUESTIONS = [
  {
    prompt: "Why is it useful to learn about careers linked to Integrated Science while still in Junior School?",
    correct: "It helps a learner make an informed choice of pathway (such as STEM) at Senior School.",
    wrong: [
      "It guarantees a learner will become a doctor.",
      "It replaces the need to study any other subject.",
      "It has no connection to choices made later in school.",
    ],
    explanation: "Learning about science-related careers early helps a learner see how the subject connects to real pathways, so they can make an informed choice of pathway (e.g. STEM) at Senior School.",
  },
  {
    prompt: "Which of these is a career opportunity that builds directly on skills learned in Integrated Science?",
    correct: "Laboratory technologist",
    wrong: ["Graphic designer", "Radio presenter", "Fashion tailor"],
    explanation: "A laboratory technologist uses scientific investigation skills — measuring, observing and following safety procedures — that are first introduced in Integrated Science.",
  },
  {
    prompt: "A learner wants to know which branch of Integrated Science to focus on for a career in engineering. Which component should they explore most?",
    correct: "Force and Energy",
    wrong: ["Mixtures, Elements and Compounds", "Living Things and their Environment", "Scientific Investigation only"],
    explanation: "Force and Energy covers electricity, magnetism and mechanics — the foundations most directly connected to engineering careers.",
  },
  {
    prompt: "A learner interested in becoming a doctor or nurse wants to know which component of Integrated Science is most directly useful. Which should they focus on?",
    correct: "Living Things and their Environment",
    wrong: ["Force and Energy", "Mixtures, Elements and Compounds only", "Scientific Investigation only"],
    explanation: "Living Things and their Environment covers how the human body works — the foundation most directly connected to medical careers, though all components support scientific reasoning.",
  },
  {
    prompt: "A learner interested in becoming a food scientist or pharmacist wants to know which component of Integrated Science is most directly useful. Which should they focus on?",
    correct: "Mixtures, Elements and Compounds",
    wrong: ["Force and Energy", "Living Things and their Environment only", "Scientific Investigation only"],
    explanation: "Mixtures, Elements and Compounds covers how substances combine and react — the foundation most directly connected to food science and pharmacy.",
  },
  {
    prompt: "Which career is most closely built on skills from the Force and Energy component of Integrated Science?",
    correct: "Electrician",
    wrong: ["Fashion tailor", "Radio presenter", "Farmer"],
    explanation: "An electrician works directly with electricity and circuits, skills first introduced in the Force and Energy component.",
  },
  {
    prompt: "Which career is most closely built on skills from the Mixtures, Elements and Compounds component of Integrated Science?",
    correct: "Pharmacist",
    wrong: ["Pilot", "Graphic designer", "Accountant"],
    explanation: "A pharmacist works with how substances combine, dissolve and react — skills first introduced in the Mixtures, Elements and Compounds component.",
  },
  {
    prompt: "Which career is most closely built on skills from the Living Things and their Environment component of Integrated Science?",
    correct: "Environmental conservationist",
    wrong: ["Electrician", "Radio presenter", "Accountant"],
    explanation: "An environmental conservationist studies how living things interact with their environment — skills first introduced in the Living Things and their Environment component.",
  },
  {
    prompt: "A learner is unsure which STEM career to aim for and wants to keep several science-related options open at Senior School. What is the most useful approach in Junior School?",
    correct: "Build strong, broad skills across all four components of Integrated Science, not just one.",
    wrong: [
      "Focus only on the component linked to one specific career from the start.",
      "Skip Integrated Science entirely and focus only on languages.",
      "Wait until Senior School to start learning any science at all.",
    ],
    explanation: "Many STEM careers draw on more than one component of Integrated Science, so building broad foundational skills in Junior School keeps more pathway options genuinely open.",
  },
  {
    prompt: "Which of these is a real Kenyan example of a career that uses skills built directly in the Scientific Investigation component of Integrated Science?",
    correct: "A quality-control officer testing products in a factory laboratory",
    wrong: ["A radio presenter reading the news", "A fashion tailor sewing school uniforms", "A matatu driver on a city route"],
    explanation: "A quality-control officer relies on measurement, observation and following safe testing procedures — skills built directly in the Scientific Investigation component.",
  },
] as const;

const DEFINITIONS = [
  {
    before: "The Senior School pathway built on strong foundations in science, technology, engineering and mathematics is called the ",
    after: " pathway.",
    answer: "STEM",
  },
  {
    before: "Integrated Science is taught using an inquiry-based approach built around 5 Es: engagement, exploration, explanation, elaboration and ",
    after: ".",
    answer: "evaluation",
  },
  {
    before: "Integrated Science at Junior School builds on ideas from three older subjects: Biology, Chemistry and ",
    after: ".",
    answer: "Physics",
  },
  {
    before: "A person whose career involves carrying out tests and experiments in a science laboratory has the job title laboratory ",
    after: ".",
    answer: "technologist",
    accepted: ["technologist", "technician"],
  },
  {
    before: "The component of Integrated Science that studies electricity, magnetism, movement and energy is called ",
    after: ".",
    answer: "Force and Energy",
    accepted: ["Force and Energy"],
  },
  {
    before: "The component of Integrated Science that studies how substances combine, separate and react is called ",
    after: ".",
    answer: "Mixtures, Elements and Compounds",
    accepted: ["Mixtures, Elements and Compounds", "Mixtures Elements and Compounds"],
  },
  {
    before: "The component of Integrated Science that studies the human body, other organisms and the environment is called ",
    after: ".",
    answer: "Living Things and their Environment",
    accepted: ["Living Things and their Environment"],
  },
  {
    before: "The component of Integrated Science that develops tool use, safety rules and measurement skills for fair experiments is called ",
    after: ".",
    answer: "Scientific Investigation",
    accepted: ["Scientific Investigation"],
  },
  {
    before: "Integrated Science at Junior School is described as an ",
    after: " learning area, since it combines ideas from several older subjects into one.",
    answer: "integrated",
    accepted: ["integrated"],
  },
  {
    before: "A career that uses science skills to advise farmers on soil, crops and storage methods is called an agricultural ",
    after: " officer.",
    answer: "extension",
    accepted: ["extension"],
  },
] as const;

export const introToScience: Skill = {
  id: "g7-sci-si-intro",
  code: "SI.1",
  subjectId: "science",
  strandId: "g7-sci-si",
  grade: 7,
  title: "Introduction to Integrated Science",
  description: "The components of Integrated Science as a field of study, and why science matters in health, agriculture, industry, transport and careers.",
  generate(rng) {
    const branch = randChoice(rng, ["component-match", "daily-life-sort", "career-knowledge", "definition-fill"] as const);

    if (branch === "component-match") {
      const tokens = shuffle(rng, COMPONENTS.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, COMPONENTS.map((c) => ({ id: c.id, label: c.desc })));
      const correctMap: Record<string, string> = {};
      for (const c of COMPONENTS) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: "Match each component of Integrated Science to what it studies.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each name is built from: mixtures/compounds, living things, force/energy, or investigation itself.",
        explanation: COMPONENTS.map((c) => `${c.label} — ${c.desc}.`).join(" "),
      };
    }

    if (branch === "daily-life-sort") {
      const chosen = shuffle(rng, DAILY_LIFE_ITEMS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `d${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`d${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each example by the area of daily life it shows science being used in.",
        items,
        buckets: [
          { id: "health", label: "Health" },
          { id: "agriculture", label: "Agriculture" },
          { id: "industry", label: "Industry" },
          { id: "transport", label: "Transport" },
        ],
        correctBucket,
        hint: "Look for the setting — a clinic, a farm, a factory, or a vehicle/airport.",
        explanation: chosen.map((c) => `"${c.text}" is an example from ${c.bucket}.`).join(" "),
      };
    }

    if (branch === "career-knowledge") {
      const q = randChoice(rng, CAREER_QUESTIONS);
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
      acceptedAnswers: "accepted" in d ? [...d.accepted] : [d.answer],
      inputMode: "text",
      hint: "Think about what you have learned about Integrated Science as a field of study.",
      explanation: `${d.before}${d.answer}${d.after}`,
    };
  },
};
