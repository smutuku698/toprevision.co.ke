import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const FERTILISATION_STEPS = [
  { id: "release", label: "An egg is released from the ovary (ovulation)" },
  { id: "travel", label: "The egg travels down the oviduct (fallopian tube)" },
  { id: "fuse", label: "A sperm fuses with the egg in the oviduct, forming a zygote (fertilisation)" },
  { id: "descend", label: "The zygote travels down the oviduct towards the uterus" },
  { id: "implant", label: "The zygote implants itself in the lining of the uterus" },
];

const STI_SYMPTOMS = [
  { sti: "HIV & AIDS", symptom: "Recurrent fevers, significant weight loss, prolonged fatigue, and frequent infections" },
  { sti: "Gonorrhea", symptom: "A burning sensation when urinating and unusual discharge from the genitals" },
  { sti: "Syphilis", symptom: "A painless sore at the site of infection, later followed by a body rash" },
  { sti: "Herpes", symptom: "Painful blisters or sores around the genitals or mouth" },
] as const;

const CYCLE_ITEMS = [
  { text: "Periods that come at unpredictable, irregular times each month", bucket: "challenge" },
  { text: "Heavy or irregular bleeding between expected periods", bucket: "challenge" },
  { text: "Sharp or dull pain (cramps) in the lower abdomen during a period", bucket: "challenge" },
  { text: "Doing regular light exercise to help ease cramps", bucket: "management" },
  { text: "Placing a warm compress or hot water bottle on the abdomen", bucket: "management" },
  { text: "Eating a balanced diet and getting enough rest", bucket: "management" },
  { text: "Tracking cycle dates on a calendar to notice patterns", bucket: "management" },
  { text: "Seeking medical advice if pain is severe or periods are very irregular", bucket: "management" },
] as const;

const KNOWLEDGE_QUESTIONS = [
  { prompt: "A typical menstrual cycle lasts about how many days?", correct: "28 days", wrong: ["7 days", "14 days", "90 days"], explanation: "A typical menstrual cycle is about 28 days, though this varies between individuals." },
  { prompt: "Menstrual bleeding usually occurs at which point in the cycle?", correct: "At the start of the cycle, lasting about 3–7 days", wrong: ["Exactly in the middle of the cycle", "Only once every three months", "Continuously throughout the whole cycle"], explanation: "Menstruation (bleeding) marks the start of a new cycle and typically lasts 3–7 days." },
  { prompt: "Which is an effective way to prevent most sexually transmitted infections (STIs)?", correct: "Abstinence, being faithful to one uninfected partner, or correct and consistent condom use", wrong: ["Only eating a balanced diet", "Taking a warm bath after exposure", "Avoiding cold weather"], explanation: "Abstinence, faithfulness to one uninfected partner, and correct condom use are the main recognised prevention measures for STIs." },
  { prompt: "Why should people avoid sharing sharp objects like razors or needles?", correct: "Because blood on a shared sharp object can transmit infections such as HIV", wrong: ["Because sharp objects wear out faster when shared", "Because it is against school rules", "Sharing sharp objects has no health risk"], explanation: "Blood-to-blood contact through shared sharp objects is a route by which infections like HIV can spread." },
  { prompt: "Why is early testing and treatment important for STIs?", correct: "It helps manage the infection early and reduces the risk of spreading it to others", wrong: ["It has no real benefit", "It is only needed for HIV, not other STIs", "It cures all STIs completely and instantly"], explanation: "Early testing and treatment helps manage infections and reduces the chance of passing them on to others." },
] as const;

export const reproductionInHumans: Skill = {
  id: "g8-sci-lte-reproduction",
  code: "LTE.3",
  subjectId: "science",
  strandId: "g8-sci-lte",
  grade: 8,
  title: "Reproduction in human beings",
  description: "The menstrual cycle and its challenges, fertilisation and implantation, and symptoms and prevention of common STIs.",
  generate(rng) {
    const branch = randChoice(rng, ["fertilisation-order", "sti-match", "cycle-sort", "knowledge"] as const);

    if (branch === "fertilisation-order") {
      const items = shuffle(rng, FERTILISATION_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the stages of fertilisation and implantation in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: FERTILISATION_STEPS.map((s) => s.id),
        hint: "An egg must be released and travel down the oviduct before it can meet a sperm; the resulting zygote then moves to the uterus.",
        explanation: FERTILISATION_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "sti-match") {
      const tokens = shuffle(rng, STI_SYMPTOMS.map((s) => ({ id: s.sti, label: s.sti })));
      const targets = shuffle(rng, STI_SYMPTOMS.map((s) => ({ id: s.sti, label: s.symptom })));
      const correctMap: Record<string, string> = {};
      for (const s of STI_SYMPTOMS) correctMap[s.sti] = s.sti;
      return {
        kind: "click-match",
        prompt: "Match each STI to its symptoms.",
        tokens,
        targets,
        correctMap,
        hint: "Recognising symptoms early helps a person seek medical advice and treatment sooner.",
        explanation: STI_SYMPTOMS.map((s) => `${s.sti}: ${s.symptom}.`).join(" "),
      };
    }

    if (branch === "cycle-sort") {
      const chosen = shuffle(rng, CYCLE_ITEMS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement into a menstrual cycle challenge or a way to manage it.",
        items,
        buckets: [
          { id: "challenge", label: "Challenge" },
          { id: "management", label: "Way to manage it" },
        ],
        correctBucket,
        hint: "A challenge is a problem someone experiences; a management strategy is an action taken to reduce or cope with it.",
        explanation: chosen.map((c) => `"${c.text}" is ${c.bucket === "challenge" ? "a challenge" : "a way to manage a challenge"}.`).join(" "),
      };
    }

    const q = randChoice(rng, KNOWLEDGE_QUESTIONS);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      explanation: q.explanation,
    };
  },
};
