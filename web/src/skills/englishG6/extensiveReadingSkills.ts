import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, cap } from "./readingShared";

// Merges 4 near-identical "Extensive Reading" sub-strands (Child Labour, Our Tourist Attractions,
// Technology: Scientific Innovations, Money - Trade) per curriculum-reference/grade-6/english.json's
// buildPlan.consolidationRationale — same mechanic (select/skim/scan/read for information/pleasure,
// use reference materials, judge suitability), different theme flavour each time.
type Theme = "Child Labour" | "Our Tourist Attractions" | "Technology: Scientific Innovations" | "Money - Trade";
const THEMES: Theme[] = ["Child Labour", "Our Tourist Attractions", "Technology: Scientific Innovations", "Money - Trade"];

type MaterialItem = { title: string; theme: Theme; suitableFor: "research" | "pleasure" | "both" };
// 30+ reading-material examples across the 4 themes — the theme's own "select appropriate reading
// materials" and "judge suitability" outcomes.
const MATERIALS: MaterialItem[] = [
  { title: "\"Children's Rights in Kenya\" (newspaper article)", theme: "Child Labour", suitableFor: "research" },
  { title: "\"The Brave Street Boy\" (adventure story)", theme: "Child Labour", suitableFor: "pleasure" },
  { title: "A children's-court case-study booklet", theme: "Child Labour", suitableFor: "research" },
  { title: "\"How Orphanages Help Children\" (magazine feature)", theme: "Child Labour", suitableFor: "both" },
  { title: "A comic strip about a runaway house help finding help", theme: "Child Labour", suitableFor: "pleasure" },
  { title: "A UNICEF pamphlet on child labour laws", theme: "Child Labour", suitableFor: "research" },
  { title: "\"Kenya's Seven Wonders\" (travel magazine)", theme: "Our Tourist Attractions", suitableFor: "both" },
  { title: "A national park visitor's brochure", theme: "Our Tourist Attractions", suitableFor: "research" },
  { title: "\"My Safari Adventure\" (short story)", theme: "Our Tourist Attractions", suitableFor: "pleasure" },
  { title: "A guidebook on the Big Five animals", theme: "Our Tourist Attractions", suitableFor: "research" },
  { title: "A poem about the beauty of Lake Nakuru", theme: "Our Tourist Attractions", suitableFor: "pleasure" },
  { title: "A tour company's price list and itinerary", theme: "Our Tourist Attractions", suitableFor: "research" },
  { title: "\"Kenyan Inventors to Watch\" (online article)", theme: "Technology: Scientific Innovations", suitableFor: "both" },
  { title: "A science-fair project report on solar irrigation", theme: "Technology: Scientific Innovations", suitableFor: "research" },
  { title: "\"The Robot Who Learned to Dance\" (short story)", theme: "Technology: Scientific Innovations", suitableFor: "pleasure" },
  { title: "A computer-science textbook chapter on coding basics", theme: "Technology: Scientific Innovations", suitableFor: "research" },
  { title: "A comic about a young engineer building a satellite model", theme: "Technology: Scientific Innovations", suitableFor: "pleasure" },
  { title: "An encyclopedia entry on space exploration", theme: "Technology: Scientific Innovations", suitableFor: "research" },
  { title: "\"How Markets Set Prices\" (business magazine article)", theme: "Money - Trade", suitableFor: "research" },
  { title: "\"The Clever Young Trader\" (story)", theme: "Money - Trade", suitableFor: "pleasure" },
  { title: "A newspaper business-section report on foreign exchange", theme: "Money - Trade", suitableFor: "research" },
  { title: "A comic strip about a hawker's busy market day", theme: "Money - Trade", suitableFor: "pleasure" },
  { title: "A pamphlet explaining how to open a savings account", theme: "Money - Trade", suitableFor: "research" },
  { title: "\"From Barter to Banknotes\" (history-of-trade booklet)", theme: "Money - Trade", suitableFor: "both" },
];

// Skimming/scanning skill statements — the theme's own "skim for gist, scan for specific details" mechanic.
const SKIM_SCAN: { skill: "skim" | "scan"; description: string }[] = [
  { skill: "skim", description: "reading quickly through a whole text to get the general idea" },
  { skill: "scan", description: "looking quickly through a text to find one specific piece of information" },
  { skill: "skim", description: "glancing over the title, headings and first sentences to understand the topic" },
  { skill: "scan", description: "running your eyes down a page looking only for a date or a name" },
  { skill: "skim", description: "reading the introduction and conclusion quickly to grasp the main idea" },
  { skill: "scan", description: "checking a table of contents to find which page a topic starts on" },
];

export const extensiveReadingSkills: Skill = {
  id: "g6-eng-reading-extensive",
  code: "R.1",
  subjectId: "english",
  strandId: "g6-eng-reading",
  grade: 6,
  title: "Extensive Reading",
  description: "Select appropriate reading materials for research or pleasure, use skimming and scanning strategies, and judge the suitability of reading materials across child labour, tourist attractions, technology and trade themes.",
  generate(rng) {
    const branch = randChoice(rng, ["suitability-mc", "purpose-categorize", "skim-scan-mc", "skim-scan-click-match", "evaluate-mc"] as const);

    if (branch === "suitability-mc") {
      const item = randChoice(rng, MATERIALS.filter((m) => m.suitableFor !== "both"));
      const name = randChoice(rng, KENYAN_NAMES);
      const wantsResearch = rng() > 0.5;
      const isCorrect = wantsResearch ? item.suitableFor === "research" : item.suitableFor === "pleasure";
      const choices = shuffle(rng, ["yes, this is suitable", "no, this is not suitable"]);
      return {
        kind: "multiple-choice",
        prompt: `${name} needs a text for ${wantsResearch ? "a research project on " + item.theme.toLowerCase() : "enjoyable reading in free time"}. Would ${item.title} be suitable?`,
        choices,
        correctIndex: choices.indexOf(isCorrect ? "yes, this is suitable" : "no, this is not suitable"),
        layout: "row",
        hint: `Consider whether this material gives facts and information, or tells an entertaining story.`,
        explanation: `${item.title} is best suited for ${item.suitableFor === "research" ? "research (it gives factual information)" : "pleasure reading (it is a story/creative text)"}, so it ${isCorrect ? "is" : "is not"} suitable for ${wantsResearch ? "a research project" : "enjoyable reading"}.`,
      };
    }

    if (branch === "purpose-categorize") {
      const pool = shuffle(rng, MATERIALS.filter((m) => m.suitableFor !== "both")).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      pool.forEach((m, i) => (correctBucket[`m-${i}`] = m.suitableFor));
      return {
        kind: "categorize",
        prompt: "Sort these reading materials: are they best for RESEARCH (getting information), or PLEASURE (enjoyment)?",
        items: pool.map((m, i) => ({ id: `m-${i}`, label: m.title })),
        buckets: [
          { id: "research", label: "Research" },
          { id: "pleasure", label: "Pleasure" },
        ],
        correctBucket,
        hint: "Research materials give facts; pleasure materials tell stories or entertain.",
        explanation: pool.map((m) => `${m.title} is best for ${m.suitableFor}.`).join(" "),
      };
    }

    if (branch === "skim-scan-mc") {
      const item = randChoice(rng, SKIM_SCAN);
      const choices = shuffle(rng, ["skim", "scan"]);
      return {
        kind: "multiple-choice",
        prompt: `Which reading strategy is being described: "${item.description}"?`,
        choices,
        correctIndex: choices.indexOf(item.skill),
        layout: "row",
        hint: "Skimming is about the general idea; scanning is about finding one specific detail.",
        explanation: `This describes "${item.skill}" — ${item.description}.`,
      };
    }

    if (branch === "skim-scan-click-match") {
      const pool = shuffle(rng, SKIM_SCAN).slice(0, 6);
      const tokens = shuffle(rng, pool.map((s, i) => ({ id: `s-${i}`, label: s.skill })));
      const targets = shuffle(rng, pool.map((s, i) => ({ id: `s-${i}`, label: s.description })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_, i) => (correctMap[`s-${i}`] = `s-${i}`));
      return {
        kind: "click-match",
        prompt: "Match each reading strategy to its correct description.",
        tokens,
        targets,
        correctMap,
        hint: "Skim = fast overview; scan = quick search for one detail.",
        explanation: "Skimming gives the general idea of a whole text; scanning finds one specific detail quickly.",
      };
    }

    const name = randChoice(rng, KENYAN_NAMES);
    const place = randChoice(rng, KENYAN_PLACES);
    const theme = randChoice(rng, THEMES);
    const correctOption = "Preview the title, cover and table of contents to judge if it matches what's needed";
    const choices = shuffle(rng, [
      correctOption,
      "Read every single page from start to finish before deciding",
      "Choose it only because it has a colourful cover",
      "Ask a friend to summarise the whole book instead of looking at it",
    ]);
    return {
      kind: "multiple-choice",
      prompt: `${name} in ${place} is choosing a library book on ${theme.toLowerCase()} for the class library. Which is the BEST first step before deciding whether to read it?`,
      choices,
      correctIndex: choices.indexOf(correctOption),
      layout: "list",
      hint: "Judging suitability comes before committing to reading the whole text.",
      explanation: `Previewing the title, cover and table of contents lets ${cap(name)} judge whether a book on ${theme.toLowerCase()} is relevant and suitable before investing time reading it fully.`,
    };
  },
};
