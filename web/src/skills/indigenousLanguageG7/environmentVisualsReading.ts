import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const VISUAL_SKILLS: { skill: string; description: string }[] = [
  { skill: "Studying pictures", description: "Looking closely at a visual to notice details relevant to a theme" },
  { skill: "Inferring implied meaning", description: "Working out a message a visual suggests without it being stated directly" },
  { skill: "Reader's theatre", description: "Reading a text aloud dramatically as a group to bring it to life" },
  { skill: "Personal glossary", description: "A collected list of vocabulary and meanings a learner builds individually" },
  { skill: "Summarising into a picture", description: "Turning written information into a single illustrative image" },
  { skill: "Summarising into a chart", description: "Organising written information into a chart for quick understanding" },
  { skill: "Summarising into a graph", description: "Representing written information as a graph, for example to compare figures" },
  { skill: "Visual portfolio", description: "An organised class collection of visuals gathered on a theme" },
  { skill: "Acknowledging the role of visuals", description: "Recognising that visuals help communicate information effectively" },
  { skill: "Collaborative visual collection", description: "Teaming up with peers to gather and organise visuals" },
  { skill: "Observation-based discussion", description: "Making observations about what a picture shows and discussing them with peers" },
  { skill: "Vocabulary building from visuals", description: "Learning new theme-related words while studying visuals" },
];

const SUMMARY_CHOICES: { text: string; bucket: string }[] = [
  { text: "A passage describing the parts of a tree and their names", bucket: "Picture" },
  { text: "A passage listing the number of trees planted each month for six months", bucket: "Graph" },
  { text: "A passage comparing three categories of pollution and their causes", bucket: "Chart" },
  { text: "A passage describing how a river looks after being polluted", bucket: "Picture" },
  { text: "A passage giving rainfall figures over four years", bucket: "Graph" },
  { text: "A passage sorting animals into categories: mammals, birds, and reptiles", bucket: "Chart" },
  { text: "A passage describing the appearance of an afforestation project site", bucket: "Picture" },
  { text: "A passage showing the increase in deforested land over ten years", bucket: "Graph" },
  { text: "A passage classifying pollutants into air, water, and soil pollution", bucket: "Chart" },
  { text: "A passage describing what a poacher's hidden camp looked like in the forest", bucket: "Picture" },
  { text: "A passage comparing pollution levels measured in three different rivers", bucket: "Graph" },
  { text: "A passage grouping conservation activities into planting, protecting, and cleaning", bucket: "Chart" },
];

const READING_STEPS: { id: string; label: string }[] = [
  { id: "study", label: "Study the pictures and make observations about environmental conservation" },
  { id: "infer", label: "Infer the implied meaning from a variety of visuals" },
  { id: "theatre", label: "Conduct a reader's theatre to read texts on environmental conservation" },
  { id: "glossary", label: "Create a personal glossary of vocabulary related to environmental conservation" },
  { id: "summarize", label: "Work jointly to summarise information from the text into a visual, such as a picture, chart, or graph" },
  { id: "portfolio", label: "Team up to collect a collection of visuals on the theme and organise them in a class portfolio" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The surroundings in which living things exist is called the", after: ".", answer: "environment" },
  { before: "To protect and take care of something so it lasts is to", after: "it.", answer: "conserve" },
  { before: "Harmful contamination of air, water, or soil is called", after: ".", answer: "pollution" },
  { before: "The large-scale clearing of forests, often for farming or timber, is called", after: ".", answer: "deforestation" },
  { before: "Planting trees in an area that had none before is called", after: ".", answer: "afforestation" },
  { before: "People who illegally hunt protected wild animals are called", after: ".", answer: "poachers" },
  { before: "Trees native to a particular region, not introduced from elsewhere, are called", after: "trees.", answer: "indigenous" },
  { before: "Working out the message a visual suggests, rather than reading a caption that states it directly, is called", after: "the implied meaning.", answer: "inferring", accepted: ["infer"] },
  { before: "A personal collected list of vocabulary and their meanings is called a", after: ".", answer: "glossary" },
  { before: "An organised collection of visuals gathered by a class is stored in a class", after: ".", answer: "portfolio" },
  { before: "A visual that organises categories of information for quick understanding is called a", after: ".", answer: "chart" },
  { before: "A visual that represents numerical or comparative data is called a", after: ".", answer: "graph" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} studies a picture of a polluted river and notices dead fish floating near the dirty water, even though nothing in the picture states this directly. Working out that the pollution is harming wildlife is an example of what skill?`,
      correct: "Inferring the implied meaning of a visual",
      wrong: ["Reading a caption that states the meaning directly", "Copying the picture into a notebook", "Ignoring details shown in the visual"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} must summarise a passage giving monthly rainfall figures into a class visual. Which visual best suits this numerical, month-by-month data?`,
      correct: "A graph, since it best represents numerical data over time",
      wrong: ["A single picture, since numbers are hard to show clearly in one drawing", "A glossary, since it only lists vocabulary and meanings", "The written paragraph copied out word for word"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} wants to summarise a passage comparing three categories of pollution — air, water, and soil. Which visual is most suitable?`,
      correct: "A chart, since it organises distinct categories for quick comparison",
      wrong: ["A graph, since the passage is not about a numerical trend over time", "A picture, since three categories are hard to compare in a single drawing", "A glossary, since the task is not about vocabulary meanings"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} spends a lesson collecting visuals about environmental conservation from magazines and printouts. What should happen with the collected visuals afterward?`,
      correct: "Organise them in a class portfolio for future reference",
      wrong: ["Discard them once each visual has been viewed a single time", "Keep them individually and never combine them with peers' visuals", "Use them only once and never revisit them again"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} sees a picture with a caption stating plainly, "Deforestation has reduced the forest cover," and believes reading this caption counts as inferring implied meaning. Is ${who} correct?`,
      correct: "No — the caption states the meaning directly; inferring means working out a message not directly stated",
      wrong: ["Yes — captions are always examples of inferred meaning", "Yes — any information taken from a picture counts as inference", "No — because pictures with captions cannot be studied at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After comparing a written description of a forest with a picture of the same forest, ${who} in ${where} notices the picture communicates the scene faster than the text did. What does this show about the role of visuals?`,
      correct: "Visuals can communicate information effectively and quickly, alongside written text",
      wrong: ["Visuals always replace the need for written text completely", "Visuals are only useful for decoration, not communication", "Written text always communicates information better than any visual"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While studying visuals on environmental conservation in ${where}, ${who} comes across the unfamiliar word "afforestation" and adds it, with its meaning, to a personal list for later reference. What is ${who} building?`,
      correct: "A personal glossary of vocabulary related to the theme",
      wrong: ["A class portfolio of visuals", "A written passage that summarises a visual", "A chart comparing categories of pollution"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s class in ${where} performs a reader's theatre of a text about environmental conservation, taking on different roles to read it aloud dramatically. What is the main purpose of this activity?`,
      correct: "To bring a written text to life through expressive group reading",
      wrong: ["To memorise the text for a written exam only", "To replace reading the text with acting alone", "To avoid discussing the text's meaning afterward"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} needs to summarise a passage describing the physical appearance of an indigenous tree species for a class visual. Which visual is most appropriate?`,
      correct: "A picture, since it best shows physical appearance",
      wrong: ["A graph, since appearance is not numerical data", "A chart, since appearance is not a set of categories", "A glossary, since the task is not about vocabulary"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is shown a picture of an environmental conservation activity and asked to make observations, but simply says "it's a picture" without describing any details. What has ${who} failed to do?`,
      correct: "Look closely at the visual and note relevant details, not just state that it is a picture",
      wrong: ["Nothing — stating that it is a picture is a sufficient observation", "Describe the picture using only the class glossary", "Summarise the picture into a graph instead of describing it"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} explains to a younger learner that a picture about environmental conservation can be understood even by someone who struggles to read the accompanying text. What is ${who} showing appreciation for?`,
      correct: "The role of visuals in communicating information effectively, even without full reliance on text",
      wrong: ["The idea that visuals are less important than text for communication", "The idea that younger learners should not be shown visuals", "The idea that pictures are only decorative additions to a passage"],
    };
  },
];

export const environmentVisualsReading: Skill = {
  id: "g7-il-r-environment",
  code: "R.4",
  subjectId: "indigenous-language",
  strandId: "g7-il-reading",
  grade: 7,
  title: "Environmental conservation: reading visuals for information",
  description: "Infer implied meaning from visuals, summarise written texts into visuals, and acknowledge the role of visuals in effective communication.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A caption states meaning directly; inferring means working out a message a visual suggests but does not state outright.";

    if (branch === "match") {
      const chosen = shuffle(rng, VISUAL_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each visual-reading skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SUMMARY_CHOICES).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each passage by the type of visual — picture, chart, or graph — that would best summarise it.",
        items,
        buckets,
        correctBucket,
        hint: "Use a picture for appearance, a chart for categories, and a graph for numbers or trends.",
        explanation: chosen.map((c) => `"${c.text}" — best summarised with a ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, READING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of reading for information through visuals on environmental conservation in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: READING_STEPS.map((s) => s.id),
        hint: "Start by studying pictures, then infer meaning, do a reader's theatre, build a glossary, summarise into a visual, then build a portfolio.",
        explanation: READING_STEPS.map((s) => s.label).join(" → "),
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
