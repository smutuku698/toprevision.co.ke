import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, hotspotPrompt, fillBlankPrompt } from "./g5SciShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Science & Technology, sub-strand 1.3 The Human Breathing System — parts and functions (nose,
// trachea, lungs, diaphragm) and symptoms/prevention of 5 named conditions (common colds, coughs, COVID-19,
// allergy, asthma). See curriculum-reference/grade-5/science-and-technology.json.

const PARTS = [
  { id: "nose", label: "Nose", func: "Filters, warms and moistens the air as it enters the body" },
  { id: "trachea", label: "Trachea", func: "Carries air down from the throat into the lungs" },
  { id: "lungs", label: "Lungs", func: "Exchange oxygen and carbon dioxide between the air and the blood" },
  { id: "diaphragm", label: "Diaphragm", func: "A muscle below the lungs that contracts and relaxes to help pull air in and push it out" },
] as const;

const CONDITIONS = [
  {
    id: "cold",
    label: "Common cold",
    symptoms: "a runny or blocked nose, sneezing, and a mild fever",
    prevention: "washing hands often, avoiding close contact with people who are sick, and covering the mouth when sneezing",
  },
  {
    id: "cough",
    label: "Cough",
    symptoms: "repeated coughing, a sore or scratchy throat, and mild chest discomfort",
    prevention: "staying warm, avoiding dust and smoke, and drinking warm fluids",
  },
  {
    id: "covid",
    label: "COVID-19",
    symptoms: "fever, a dry cough, difficulty breathing, and loss of taste or smell",
    prevention: "wearing a mask in crowded places, washing hands regularly, keeping distance from sick people, and getting vaccinated",
  },
  {
    id: "allergy",
    label: "Allergy",
    symptoms: "sneezing, itchy or watery eyes, and a runny nose triggered by dust, pollen or certain foods",
    prevention: "avoiding known triggers, keeping the home and classroom clean and dust-free, and taking prescribed medicine",
  },
  {
    id: "asthma",
    label: "Asthma",
    symptoms: "wheezing, shortness of breath, and a tight feeling in the chest",
    prevention: "avoiding triggers such as dust and smoke, using a prescribed inhaler, and being careful with cold air or hard exercise",
  },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} starts sneezing repeatedly and gets a runny, blocked nose after playing near a dusty field, but has no fever. What is ${who} most likely experiencing?`,
      correct: "An allergy triggered by dust",
      wrong: ["COVID-19, since sneezing always means COVID-19", "Asthma, since a runny nose is asthma's main symptom", "Nothing to be concerned about at all, since these symptoms mean nothing"],
      explanation: "Sneezing, itchy or watery eyes and a runny nose triggered by dust are classic symptoms of an allergy, not COVID-19 or asthma.",
    };
  },
  (rng) => ({
    prompt: `A teacher in ${place(rng)} reminds learners to cover their mouths when sneezing and to wash their hands often during a season when many learners have runny noses and mild fevers. Which condition is this advice mainly aimed at preventing the spread of?`,
    correct: "Common cold",
    wrong: ["Asthma", "Allergy", "None of these — hand washing has no effect on breathing-system conditions"],
    explanation: "Covering the mouth when sneezing and washing hands are key prevention steps for the common cold, which spreads easily between people.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} starts wheezing and feels a tight chest after running hard during a football match on a cold morning. What condition do these symptoms suggest?`,
      correct: "Asthma",
      wrong: ["Common cold", "COVID-19", "Allergy"],
      explanation: "Wheezing, shortness of breath and chest tightness — especially triggered by exercise or cold air — are classic symptoms of asthma.",
    };
  },
  (rng) => ({
    prompt: `A clinic in ${place(rng)} advises patients with a fever, dry cough, and loss of taste and smell to isolate themselves and wear a mask around others. Which condition matches these symptoms and precautions?`,
    correct: "COVID-19",
    wrong: ["Common cold", "Asthma", "Allergy"],
    explanation: "Fever, dry cough, difficulty breathing and loss of taste or smell together are characteristic of COVID-19, which spreads through close contact.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} develops a sore throat and keeps coughing repeatedly after walking through smoky air near a roadside charcoal seller. What is the most fitting advice for ${who}?`,
      correct: "Stay warm, avoid further smoke and dust exposure, and drink warm fluids",
      wrong: ["Get vaccinated immediately, since coughing always means COVID-19", "Ignore it completely, since coughing never needs any care", "Run vigorously to clear the lungs faster"],
      explanation: "A cough caused by irritation such as smoke is best eased by avoiding further exposure, staying warm and drinking warm fluids.",
    };
  },
  (rng) => ({
    prompt: `A learner with known asthma in ${place(rng)} always carries a prescribed inhaler and avoids playing in very dusty areas. What is this an example of?`,
    correct: "Taking prevention steps to manage and avoid asthma triggers",
    wrong: ["Treating an allergy rather than asthma", "A precaution against catching COVID-19", "An unnecessary habit with no real health benefit"],
    explanation: "Carrying a prescribed inhaler and avoiding dust are recommended prevention steps for someone managing asthma.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} breathes in through the nose while walking on a cold, dusty morning. What is the nose doing to the air before it reaches the lungs?`,
      correct: "Filtering, warming and moistening the air",
      wrong: ["Cooling the air down to match the outside temperature", "Adding extra oxygen directly into the incoming air", "Removing all moisture from the incoming air"],
      explanation: "The nose's job is to filter out dust, and warm and moisten the incoming air before it travels further into the breathing system.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} takes a deep breath, and a dome-shaped muscle below the lungs pulls downward to let more air in. Which part of the breathing system is doing this?`,
    correct: "Diaphragm",
    wrong: ["Trachea", "Nose", "Lungs"],
    explanation: "The diaphragm is the muscle below the lungs that contracts (pulling downward) to help draw air into the lungs.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A doctor in ${place(rng)} explains to ${who} that after air passes the nose, it travels down a tube in the neck before reaching the lungs. Which part is the doctor describing?`,
      correct: "Trachea",
      wrong: ["Diaphragm", "Nose", "Lungs"],
      explanation: "The trachea (windpipe) is the tube that carries air from the throat down into the lungs.",
    };
  },
  (rng) => ({
    prompt: `A school health talk in ${place(rng)} explains that oxygen breathed in eventually passes into the blood, while carbon dioxide passes out of the blood to be breathed out. Where does this exchange happen?`,
    correct: "In the lungs",
    wrong: ["In the nose", "In the trachea", "In the diaphragm"],
    explanation: "The exchange of oxygen and carbon dioxide between air and blood happens in the lungs.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} develops itchy, watery eyes and a runny nose every time a neighbour's cat visits, but has no fever or cough. What does this pattern most likely suggest?`,
      correct: "An allergy, since the symptoms are triggered by a specific cause (the cat) rather than illness spreading between people",
      wrong: ["COVID-19, since any runny nose always means COVID-19", "Asthma, since itchy eyes are asthma's defining symptom", "A common cold, since colds are always triggered by animals"],
      explanation: "Symptoms that appear only around a specific trigger, without fever, point to an allergy rather than an infectious condition like a cold or COVID-19.",
    };
  },
  (rng) => ({
    prompt: `A clinic in ${place(rng)} recommends that patients avoid smoke and dust and keep their environment clean to reduce breathing-system flare-ups. Which two conditions would this advice help prevent or manage?`,
    correct: "Asthma and allergies",
    wrong: ["Only COVID-19", "Only the common cold", "None of the named conditions"],
    explanation: "Avoiding dust and smoke and keeping the environment clean is prevention advice that applies to both asthma and allergy triggers.",
  }),
];

export const humanBreathingSystem: Skill = {
  id: "g5-sci-lte-human-breathing-system",
  code: "LTE.3",
  subjectId: "science",
  strandId: "g5-sci-lte",
  grade: 5,
  title: "The human breathing system",
  description: "Parts and functions of the breathing system (nose, trachea, lungs, diaphragm), and symptoms and prevention of common colds, coughs, COVID-19, allergy and asthma.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["part-hotspot", "part-function-match", "symptom-condition-match", "prevention-categorize", "reasoning", "fill-blank"] as const
    );

    if (branch === "part-hotspot") {
      const spots = [
        { id: "nose", xPercent: 50, yPercent: 8, label: "Nose" },
        { id: "trachea", xPercent: 50, yPercent: 25, label: "Trachea" },
        { id: "lungs", xPercent: 72, yPercent: 68, label: "Lungs" },
        { id: "diaphragm", xPercent: 50, yPercent: 95, label: "Diaphragm" },
      ] as const;
      const target = randChoice(rng, spots);
      const others = spots.filter((s) => s.id !== target.id).map((s) => s.label);
      const choices = shuffle(rng, [target.label, ...others]);
      return {
        kind: "hotspot",
        prompt: hotspotPrompt(rng, "the human breathing system"),
        diagram: { type: "respiratory-system" },
        spots: spots.map((s) => ({ id: s.id, xPercent: s.xPercent, yPercent: s.yPercent, label: s.label })),
        askId: target.id,
        choices,
        correctLabel: target.label,
        hint: "Air travels from the nose, down the trachea, into the lungs, with the diaphragm below.",
        explanation: `The marked spot is the ${target.label.toLowerCase()}.`,
      };
    }

    if (branch === "part-function-match") {
      const tokens = shuffle(rng, PARTS.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PARTS.map((p) => ({ id: p.id, label: p.func })));
      const correctMap: Record<string, string> = {};
      for (const p of PARTS) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "part of the breathing system to its function"),
        tokens,
        targets,
        correctMap,
        hint: "Follow the path air takes: nose, trachea, lungs — with the diaphragm helping the whole process.",
        explanation: PARTS.map((p) => `${p.label} — ${p.func}.`).join(" "),
      };
    }

    if (branch === "symptom-condition-match") {
      const chosen = shuffle(rng, CONDITIONS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.id, label: `Symptoms: ${c.symptoms}` })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "condition to its symptoms"),
        tokens,
        targets,
        correctMap,
        hint: "Think about which symptoms are most specific to each condition.",
        explanation: chosen.map((c) => `${c.label} — ${c.symptoms}.`).join(" "),
      };
    }

    if (branch === "prevention-categorize") {
      const chosen = shuffle(rng, CONDITIONS).slice(0, 4);
      const items = chosen.map((c) => ({ id: c.id, label: c.prevention.charAt(0).toUpperCase() + c.prevention.slice(1) }));
      const shuffledItems = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const c of chosen) correctBucket[c.id] = c.id;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which condition this prevention advice mainly helps against"),
        items: shuffledItems,
        buckets: chosen.map((c) => ({ id: c.id, label: c.label })),
        correctBucket,
        hint: "Match each piece of advice to the condition it's specifically meant to prevent or manage.",
        explanation: chosen.map((c) => `${c.label} prevention: ${c.prevention}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "The part of the breathing system that filters, warms and moistens incoming air is the ", after: ".", correctAnswer: "nose" },
      { before: "Air travels from the throat down to the lungs through a tube called the ", after: ".", correctAnswer: "trachea", alsoAccept: ["windpipe"] },
      { before: "Oxygen and carbon dioxide are exchanged with the blood in the ", after: ".", correctAnswer: "lungs" },
      { before: "The muscle below the lungs that helps pull air in and push it out is the ", after: ".", correctAnswer: "diaphragm" },
      { before: "A runny nose, sneezing and mild fever are common symptoms of the ", after: ".", correctAnswer: "common cold" },
      { before: "Wheezing, shortness of breath and a tight chest are common symptoms of ", after: ".", correctAnswer: "asthma" },
      { before: "Fever, dry cough, difficulty breathing and loss of taste or smell are symptoms of ", after: ".", correctAnswer: "COVID-19" },
      { before: "Sneezing and itchy, watery eyes triggered by dust or pollen are symptoms of an ", after: ".", correctAnswer: "allergy" },
      { before: "Washing hands often and covering the mouth when sneezing helps prevent the spread of a ", after: ".", correctAnswer: "common cold" },
      { before: "A person managing asthma should avoid triggers such as dust and smoke and carry a prescribed ", after: ".", correctAnswer: "inhaler" },
      { before: "Wearing a mask and keeping distance from sick people are key prevention steps against ", after: ".", correctAnswer: "COVID-19" },
      { before: "Drinking warm fluids and staying warm can help ease a ", after: ".", correctAnswer: "cough" },
      { before: "Keeping the classroom clean and dust-free is a prevention step against ", after: ".", correctAnswer: "allergy", alsoAccept: ["allergies"] },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about the parts of the breathing system and the 5 named conditions that affect it.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
