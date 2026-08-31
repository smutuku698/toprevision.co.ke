import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const EXPOSITORY_FEATURES: { feature: string; description: string }[] = [
  { feature: "Informative purpose", description: "Written mainly to explain, describe, or give information about a topic" },
  { feature: "Introduction", description: "An opening part that introduces the topic to the reader" },
  { feature: "Body paragraphs", description: "Middle paragraphs that explain the topic point by point, each built around one main idea" },
  { feature: "Conclusion", description: "A closing part that sums up the information given" },
  { feature: "Topic sentence", description: "The sentence at the start of a paragraph stating its main point" },
  { feature: "Factual content", description: "Content based on facts and information, not on imagined events or feelings" },
  { feature: "Logical organisation", description: "Ideas arranged in a clear, sensible order so the reader can follow them" },
  { feature: "Linking words", description: "Words such as 'firstly', 'in addition', and 'finally' that connect ideas smoothly" },
  { feature: "Objective tone", description: "A tone that presents information plainly, without inserting personal opinions" },
  { feature: "Clear title", description: "A title that tells the reader exactly what the composition explains" },
  { feature: "Focus on the topic", description: "Writing that stays focused on explaining the subject, not on the writer's personal experience" },
];

const COMPOSITION_ITEMS: { text: string; bucket: string }[] = [
  { text: "Farmers grow crops such as maize and vegetables, and also keep animals such as cattle for various uses.", bucket: "Feature of an expository composition" },
  { text: "Firstly, a farm needs fertile soil; secondly, it needs a reliable water source; finally, it needs proper tools.", bucket: "Feature of an expository composition" },
  { text: "This composition explains the different farm tools used and what each one is used for.", bucket: "Feature of an expository composition" },
  { text: "In conclusion, a farm depends on healthy soil, enough water, and good tools to produce food.", bucket: "Feature of an expository composition" },
  { text: "Cattle on a farm are usually kept for milk, meat, and sometimes for ploughing the land.", bucket: "Feature of an expository composition" },
  { text: "This paragraph explains why farmers rotate their crops every planting season.", bucket: "Feature of an expository composition" },
  { text: "One sunny morning, I ran to the farm and found my grandmother feeding the chickens, laughing as they scattered around her feet.", bucket: "Feature of a narrative, not expository" },
  { text: "\"Come quickly!\" shouted Wanjiru, as the goat broke free and dashed toward the maize field.", bucket: "Feature of a narrative, not expository" },
  { text: "I felt so happy the day our cow gave birth to a healthy calf under the old mango tree.", bucket: "Feature of a narrative, not expository" },
  { text: "Once upon a time, a clever hare tricked a lazy farmer out of his harvest.", bucket: "Feature of a narrative, not expository" },
  { text: "The old farmer smiled quietly, remembering the harvests of his childhood.", bucket: "Feature of a narrative, not expository" },
  { text: "Yesterday, thunder roared and lightning flashed just as we finished herding the cattle home.", bucket: "Feature of a narrative, not expository" },
];

const WRITING_STEPS: { id: string; label: string }[] = [
  { id: "mention", label: "Work jointly with peers to mention the features of expository texts" },
  { id: "collect", label: "Team up to collect sample expository compositions from print and non-print sources" },
  { id: "read", label: "Read the sample expository compositions collected" },
  { id: "write", label: "Write simple expository compositions based on the farm theme" },
  { id: "review", label: "Read their compositions aloud for peer review" },
  { id: "display", label: "Display well-written compositions on the class language corner for a gallery walk" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "Writing that mainly explains or gives information about a topic is called", after: "writing.", answer: "expository" },
  { before: "The opening part of a composition that introduces the topic to the reader is called the", after: ".", answer: "introduction" },
  { before: "The sentence that states the main point of a paragraph is called the", after: "sentence.", answer: "topic" },
  { before: "The closing part of a composition that sums up the information given is called the", after: ".", answer: "conclusion" },
  { before: "Words such as 'firstly' and 'finally' that connect ideas smoothly in a composition are called", after: "words.", answer: "linking" },
  { before: "Content based on facts rather than imagined events or feelings is described as", after: ".", answer: "factual" },
  { before: "The activity where learners read each other's compositions and give feedback is called peer", after: ".", answer: "review" },
  { before: "A public display of finished written work for others to read, such as on a classroom wall, is called a gallery", after: ".", answer: "walk" },
  { before: "Arranging ideas in a clear, sensible order so a reader can follow them is called logical", after: ".", answer: "organisation", accepted: ["organization"] },
  { before: "A part of the classroom set aside to display finished written work is called the language", after: ".", answer: "corner" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked to write a composition explaining how farmers care for cattle, but instead writes a story about a day spent at grandmother's farm, full of dialogue and personal feelings. What has ${who} done wrong?`,
      correct: "Written a narrative instead of an expository composition — expository writing explains information rather than telling a personal story",
      wrong: ["Used too many linking words in the composition", "Made the composition too short", "Included a conclusion, which expository writing does not allow"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s composition about farm tools in ${where} has an introduction, several body paragraphs on different tools, and a conclusion. What has ${who} shown understanding of?`,
      correct: "The features and structure of an expository composition",
      wrong: ["The features of a fable", "The rules of a private letter", "The structure of a transcription"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} collects sample expository compositions about farming from both a textbook and a newspaper. Why is collecting from print and non-print sources useful before writing?`,
      correct: "To see real examples of expository features before attempting to write one themselves",
      wrong: ["To copy a composition word for word instead of writing their own", "Because expository writing cannot be learnt from a textbook alone", "To avoid having to write a composition at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} reads a composition draft aloud to a partner in ${where}, who suggests where the explanation is unclear. What is this activity called?`,
      correct: "Peer review, used to improve a composition before it is finished",
      wrong: ["Skimming, used to find the main idea of a passage", "Transcription, used to write down spoken words exactly", "Scanning, used to find one specific word"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} begins a body paragraph with "Firstly, farmers must prepare the soil before planting." What does this sentence show?`,
      correct: "A topic sentence stating the paragraph's main point, using a linking word to show order",
      wrong: ["A conclusion summing up the whole composition", "A personal opinion with no factual basis", "The composition's title"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s composition in ${where} jumps between talking about cattle, then vegetables, then back to cattle, with no clear order connecting the ideas. What is missing from the composition?`,
      correct: "Logical organisation of the ideas",
      wrong: ["A title, since titles are optional", "Any factual content at all", "A single topic sentence"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s class in ${where} displays finished farm-themed compositions on the language corner for other learners to read. What is this activity called?`,
      correct: "A class gallery walk, so classmates can read and appreciate each other's writing",
      wrong: ["A readers' theatre, performed aloud for an audience", "A comprehension exercise done individually", "A vocabulary bank built from a listening text"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is unsure whether to write "I think cattle are the best farm animals" in an expository composition about farm animals. What should ${who} do?`,
      correct: "Leave out personal opinions and stick to facts, since expository writing should stay objective",
      wrong: ["Include the opinion, since expository writing is about personal views", "Replace the whole composition with only opinions", "Remove all facts and keep only opinions"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} finishes a composition about the farm in ${where} without writing any closing paragraph. What has ${who} left out, and why does it matter?`,
      correct: "A conclusion — without it, the composition never sums up the information for the reader",
      wrong: ["An introduction, since every composition needs one at the end", "A title, since compositions never need one at the start", "Linking words, which only belong in a conclusion"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Before beginning a farm-themed composition in ${where}, ${who} is asked why writing is a key aspect of communication. What is the best answer?`,
      correct: "Writing lets information and ideas be shared clearly with others, even when they are not present to listen",
      wrong: ["Writing is only useful for entertainment, never for sharing facts", "Writing matters only when speaking is not allowed", "Writing cannot communicate information as well as speech can"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} titles a composition "The Farm" but never states within it which specific aspect — tools, animals, or crops — it actually explains, leaving readers unsure of its focus. What is the problem?`,
      correct: "The composition lacks a clear introduction stating exactly what topic it will explain",
      wrong: ["The title is too long and should be shortened", "The composition has too many body paragraphs", "The composition uses too many linking words"],
    };
  },
];

export const farmExpositoryWriting: Skill = {
  id: "g7-il-w-the-farm",
  code: "W.6",
  subjectId: "indigenous-language",
  strandId: "g7-il-writing",
  grade: 7,
  title: "The farm: expository composition writing",
  description: "Identify the features of expository texts and create a creative, coherent expository composition about the farm.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "An expository composition explains a topic with facts, organised into an introduction, body paragraphs, and a conclusion.";

    if (branch === "match") {
      const chosen = shuffle(rng, EXPOSITORY_FEATURES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.feature, label: f.feature })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.feature, label: f.description })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.feature] = f.feature;
      return {
        kind: "click-match",
        prompt: "Match each feature of an expository composition to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((f) => `${f.feature} — ${f.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, COMPOSITION_ITEMS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each sentence as belonging in an expository composition or in a narrative instead.",
        items,
        buckets,
        correctBucket,
        hint: "Expository writing explains facts plainly. Narrative writing tells a personal story with feelings, dialogue, or imagined events.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, WRITING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of learning to write an expository composition about the farm in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: WRITING_STEPS.map((s) => s.id),
        hint: "Start by mentioning features, then collect and read samples, write, review with peers, and finally display the finished work.",
        explanation: WRITING_STEPS.map((s) => s.label).join(" → "),
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
