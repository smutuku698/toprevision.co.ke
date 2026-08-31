import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const FORMAT_ELEMENTS: { id: string; label: string; description: string }[] = [
  { id: "heading", label: "Heading/title", description: "A short, bold title stating what the notice or poster is about" },
  { id: "message", label: "Key message", description: "The essential information — what, where, and when — stated clearly" },
  { id: "cta", label: "Call-to-action", description: "What the reader should do next, e.g. 'Visit today!' or 'Book your tickets now'" },
  { id: "contact", label: "Contact/date information", description: "Who to contact, and the relevant date(s), venue, or deadline" },
];

const SAMPLES: { text: string; missing: string }[] = [
  {
    text: "VISIT LAKE NAKURU NATIONAL PARK\nHome to thousands of flamingos and a thriving rhino sanctuary.\nBook your safari adventure today!",
    missing: "contact",
  },
  {
    text: "FORT JESUS, MOMBASA — GUIDED HISTORICAL TOURS\nExplore 16th-century Portuguese architecture and coastal history.\nOpen daily 8am-5pm. Call the visitor centre on 041-222-3344.",
    missing: "cta",
  },
  {
    text: "Discover underground caves, towering cliffs, and geothermal springs on a guided walk or cycle through the gorge.\nPlan your adventure this weekend!\nHell's Gate National Park, Naivasha. Gates open 6am-6pm.",
    missing: "heading",
  },
  {
    text: "MAASAI MARA GAME RESERVE\nCome witness nature's greatest spectacle!\nFor bookings, call 0700-XXX-XXX.",
    missing: "message",
  },
];

const DIFF_SCENARIOS: { description: string; correct: "notice" | "poster"; why: string }[] = [
  {
    description: "A short, text-only announcement pinned on the staff noticeboard saying the Nairobi National Park gate will close early on Friday for maintenance.",
    correct: "notice",
    why: "It's brief, purely informational, and meant for people who already check that noticeboard — not to attract new visitors.",
  },
  {
    description: "A large, colourful illustrated design with bold lettering and a picture of a lion, displayed at the matatu stage to attract tourists to visit Nairobi National Park.",
    correct: "poster",
    why: "It's highly visual and persuasive, designed to catch the eye of people from a distance and draw in new visitors.",
  },
  {
    description: "A plain, typed announcement telling tour guides at Fort Jesus about a new safety procedure to follow from Monday.",
    correct: "notice",
    why: "It's a brief, factual announcement aimed at people who already work there, with no need for eye-catching visuals.",
  },
  {
    description: "A vivid, illustrated design advertising an upcoming cultural festival at Bomas of Kenya, displayed on billboards around the city to draw in the public.",
    correct: "poster",
    why: "It's designed with strong visuals to promote an event and persuade the general public to attend.",
  },
];

const ISSUES: { issue: string; format: "notice" | "poster" }[] = [
  { issue: "Informing staff that the museum will be closed for stocktaking next Monday", format: "notice" },
  { issue: "Advertising a new zipline attraction at Kereita Forest to attract weekend visitors", format: "poster" },
  { issue: "Announcing a change in Fort Jesus's opening hours during the low season", format: "notice" },
  { issue: "Promoting an upcoming cultural festival at Bomas of Kenya to the general public", format: "poster" },
  { issue: "Reminding tour guides about a new safety procedure at Hell's Gate", format: "notice" },
  { issue: "Encouraging school groups to visit the Nairobi Snake Park during the holidays", format: "poster" },
];

const CTA_FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "Come and", after: "the natural wonders of Hell's Gate National Park this weekend!", correctAnswer: "explore", acceptedAnswers: ["explore", "discover"] },
  { before: "Don't miss the chance to", after: "the great wildebeest migration at the Maasai Mara!", correctAnswer: "witness", acceptedAnswers: ["witness", "see"] },
  { before: "", after: "your tickets now for the Fort Jesus guided tour!", correctAnswer: "book", acceptedAnswers: ["book", "reserve"] },
];

export const functionalWritingNoticesPosters: Skill = {
  id: "g7-eng-w-functional-writing-notices-posters",
  code: "W.15",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Functional Writing: Notices and Posters",
  description: "Outline the format of notices and posters about Kenyan tourist attraction sites, and distinguish when each format is the better choice.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "mc-missing", "mc-diff", "categorize", "fill"] as const);
    const hint = "A notice is brief and purely informational. A poster is highly visual and persuasive, designed to attract attention from a distance and encourage action.";

    if (branch === "match") {
      const tokens = shuffle(rng, FORMAT_ELEMENTS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FORMAT_ELEMENTS.map((f) => ({ id: f.id, label: f.description })));
      const correctMap: Record<string, string> = {};
      for (const f of FORMAT_ELEMENTS) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each format element of a notice or poster to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: FORMAT_ELEMENTS.map((f) => `${f.label}: ${f.description}.`).join(" "),
      };
    }

    if (branch === "mc-missing") {
      const entry = randChoice(rng, SAMPLES);
      const missingLabel = FORMAT_ELEMENTS.find((f) => f.id === entry.missing)!.label;
      const choices = shuffle(rng, FORMAT_ELEMENTS.map((f) => f.label));
      return {
        kind: "multiple-choice",
        prompt: "Read this notice/poster excerpt about a Kenyan tourist attraction. Which format element is missing from it?",
        passage: entry.text,
        choices,
        correctIndex: choices.indexOf(missingLabel),
        layout: "list",
        hint: "Check whether it has all four elements: a heading, the key message, a call-to-action, and contact/date information.",
        explanation: `This excerpt is missing its ${missingLabel.toLowerCase()}.`,
      };
    }

    if (branch === "mc-diff") {
      const entry = randChoice(rng, DIFF_SCENARIOS);
      const choices = shuffle(rng, ["Notice", "Poster"]);
      const correctLabel = entry.correct === "notice" ? "Notice" : "Poster";
      return {
        kind: "multiple-choice",
        prompt: `${entry.description} Is this a notice or a poster?`,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "row",
        hint,
        explanation: `This is a ${correctLabel.toLowerCase()} — ${entry.why}`,
      };
    }

    if (branch === "categorize") {
      const notices = shuffle(rng, ISSUES.filter((i) => i.format === "notice")).slice(0, 3);
      const posters = shuffle(rng, ISSUES.filter((i) => i.format === "poster")).slice(0, 3);
      const chosen = shuffle(rng, [...notices, ...posters]);
      const items = chosen.map((i, idx) => ({ id: `i${idx}`, label: i.issue }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((i, idx) => (correctBucket[`i${idx}`] = i.format));
      return {
        kind: "categorize",
        prompt: "Sort each purpose by whether a Notice or a Poster is the more appropriate format for communicating it.",
        items,
        buckets: [
          { id: "notice", label: "Notice" },
          { id: "poster", label: "Poster" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((i) => `"${i.issue}" is better communicated with a ${i.format}.`).join(" "),
      };
    }

    const entry = randChoice(rng, CTA_FILL_ITEMS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete this tourist-poster call-to-action.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint: "A call-to-action tells the reader exactly what to do next, using an inviting, active verb.",
      explanation: `The complete call-to-action reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
    };
  },
};
