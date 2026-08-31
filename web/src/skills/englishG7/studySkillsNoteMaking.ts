import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MUSIC_PASSAGES: {
  id: string;
  heading: string;
  text: string;
  mainIdea: string;
  supportingPoints: string[];
  keyword: string;
}[] = [
  {
    id: "benga",
    heading: "Benga Music",
    text: "Benga music began among the Luo community around Lake Victoria in the 1950s. Musicians play the guitar to imitate the sound of the traditional nyatiti lyre. The music features fast guitar riffs and a strong dance beat. Today, benga remains one of Kenya's most recognisable music styles.",
    mainIdea: "Benga is a distinctive Kenyan music style that grew out of the Luo community's traditional sound.",
    supportingPoints: [
      "It began among the Luo community around Lake Victoria in the 1950s.",
      "Guitarists imitate the sound of the traditional nyatiti lyre.",
      "It features fast guitar riffs and a strong dance beat.",
    ],
    keyword: "benga",
  },
  {
    id: "careers",
    heading: "Careers in Music",
    text: "A career in music is not limited to performing on stage. Sound engineers mix and balance audio during recordings and live shows. Music teachers pass on both instrumental skills and music theory to learners in schools. Instrument makers craft traditional pieces such as the nyatiti and the orutu by hand. Each career supports the music industry in its own way.",
    mainIdea: "There are many different careers within the music industry beyond performing.",
    supportingPoints: [
      "Sound engineers mix and balance audio during recordings and live shows.",
      "Music teachers pass on instrumental skills and music theory to learners.",
      "Instrument makers craft traditional pieces such as the nyatiti and orutu by hand.",
    ],
    keyword: "music careers",
  },
  {
    id: "gospel",
    heading: "The Growth of Gospel Music",
    text: "Gospel music has grown rapidly in Kenya over the past two decades. Church choirs now perform alongside professional bands using modern instruments. Gospel artists frequently top the local music charts and fill stadiums for concerts. Radio stations dedicate entire programmes to playing gospel hits throughout the week.",
    mainIdea: "Gospel music has become a major and popular part of Kenya's music scene.",
    supportingPoints: [
      "Church choirs now perform alongside professional bands using modern instruments.",
      "Gospel artists frequently top the local music charts and fill stadiums.",
      "Radio stations dedicate entire programmes to gospel hits.",
    ],
    keyword: "gospel music",
  },
  {
    id: "taarab",
    heading: "Taarab Music of the Coast",
    text: "Taarab music developed along the Kenyan coast, blending Swahili poetry with Arabic, Indian, and African musical influences. Singers perform elaborate love poems over an orchestra of instruments such as the oud and violin. Taarab is traditionally played at weddings and other coastal celebrations. The genre remains closely tied to Swahili culture and language.",
    mainIdea: "Taarab is a coastal music genre that blends Swahili poetry with several cultural influences.",
    supportingPoints: [
      "It blends Swahili poetry with Arabic, Indian, and African musical influences.",
      "Singers perform elaborate love poems over an orchestra including the oud and violin.",
      "It is traditionally played at weddings and coastal celebrations.",
    ],
    keyword: "taarab",
  },
];

const NOTE_FORMAT_TERMS: { term: string; description: string }[] = [
  { term: "Heading", description: "Names the overall topic of the whole text being read" },
  { term: "Subheading", description: "Names a smaller section within the topic, grouping related points together" },
  { term: "Main point", description: "States a key idea that the text develops in a section" },
  { term: "Supporting point", description: "Gives extra detail, an example, or evidence that backs up a main point" },
  { term: "Keyword", description: "A short, important word that captures an idea without writing a full sentence" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why is note-making described as closely related to effective reading?",
    correct: "Making notes forces a reader to identify main points, which deepens understanding of the text",
    distractors: [
      "Note-making has nothing to do with how well a reader understands a text",
      "Note-making is only useful after a text has already been forgotten",
      "Note-making replaces the need to read the text at all",
    ],
  },
  {
    q: "What is the main purpose of using keywords instead of full sentences when making notes?",
    correct: "Keywords let a reader record an idea briefly, saving time while still capturing the meaning",
    distractors: [
      "Keywords make notes longer and harder to review later",
      "Keywords replace the need to ever read the original text again",
      "Keywords are only used when writing an examination essay",
    ],
  },
  {
    q: "Njeri is reading a long passage about careers in music for a class assignment. She wants to make useful notes she can revise from later. What should she do first?",
    correct: "Identify the topic and main points before noting down supporting details",
    distractors: [
      "Copy the entire passage word for word into her notebook",
      "Write down only the least important details from the passage",
      "Skip making notes and try to memorise the whole passage instead",
    ],
  },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "A", after: "names the overall topic of a text you are reading.", correctAnswer: "heading" },
  { before: "When making notes, a", after: "is a brief word or phrase, not a full sentence.", correctAnswer: "keyword" },
  { before: "A", after: "gives extra detail or an example that backs up a main point.", correctAnswer: "supporting point" },
  { before: "A", after: "names a smaller section within a topic, grouping related points together.", correctAnswer: "subheading" },
];

const ORDER_STEPS = [
  { id: "read", label: "Read the whole text once to understand its overall topic" },
  { id: "heading", label: "Write a heading that names the topic" },
  { id: "main", label: "Identify the main points and note them under subheadings" },
  { id: "support", label: "Add supporting points or keywords beneath each main point" },
  { id: "review", label: "Review your notes against the original text for accuracy" },
];

export const studySkillsNoteMaking: Skill = {
  id: "g7-eng-r-study-skills-note-making",
  code: "R.10",
  subjectId: "english",
  strandId: "g7-eng-reading",
  grade: 7,
  title: "Study Skills: Note Making",
  description: "Identify main and supporting points in texts about music, make notes using a clear format, and relate note-making to effective reading.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "heading", "fill", "order", "concept"] as const);
    const hint = "Good notes have a heading for the topic, main points for key ideas, and supporting points or keywords for the details.";

    if (branch === "match") {
      const tokens = shuffle(rng, NOTE_FORMAT_TERMS.map((f) => ({ id: f.term, label: f.term })));
      const targets = shuffle(rng, NOTE_FORMAT_TERMS.map((f) => ({ id: f.term, label: f.description })));
      const correctMap: Record<string, string> = {};
      for (const f of NOTE_FORMAT_TERMS) correctMap[f.term] = f.term;
      return {
        kind: "click-match",
        prompt: "Match each note-making term to what it means.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: NOTE_FORMAT_TERMS.map((f) => `${f.term} — ${f.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const passage = randChoice(rng, MUSIC_PASSAGES);
      const items = shuffle(rng, [
        { id: "main", label: passage.mainIdea },
        ...passage.supportingPoints.map((p, i) => ({ id: `s${i}`, label: p })),
      ]);
      const correctBucket: Record<string, string> = { main: "main" };
      passage.supportingPoints.forEach((_, i) => (correctBucket[`s${i}`] = "support"));
      return {
        kind: "categorize",
        prompt: "Sort each sentence from this passage into Main point or Supporting point.",
        passage: passage.text,
        items,
        buckets: [
          { id: "main", label: "Main point" },
          { id: "support", label: "Supporting point" },
        ],
        correctBucket,
        hint,
        explanation: `"${passage.mainIdea}" is the main point. The other sentences give supporting detail that backs it up.`,
      };
    }

    if (branch === "heading") {
      const passage = randChoice(rng, MUSIC_PASSAGES);
      const otherHeadings = shuffle(rng, MUSIC_PASSAGES.filter((p) => p.id !== passage.id)).slice(0, 3).map((p) => p.heading);
      const choices = shuffle(rng, [passage.heading, ...otherHeadings]);
      return {
        kind: "multiple-choice",
        prompt: "Which heading best fits this passage, if you were making notes from it?",
        passage: passage.text,
        choices,
        correctIndex: choices.indexOf(passage.heading),
        layout: "list",
        hint,
        explanation: `"${passage.heading}" fits because it names the overall topic that every sentence in the passage relates to.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing note-making term.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `The sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for making notes from a written text, in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Start by understanding the whole topic, then work down to main points and their supporting details.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
