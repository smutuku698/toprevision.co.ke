import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, Strand 3.0 Appreciation in Creative Arts, sub-strand 3.1 "Analysis
// of Creative Arts works" (kept as one skill, matching the Grade 7/8 Creative Arts and Sports
// precedent of a single "analysis.ts" file for the whole Appreciation strand, despite covering
// three genuinely distinct components). Source content: create a catalogue of exhibited artworks
// (artist's name, type of artwork, media/material); discuss the use of the seven named elements
// of music — pitch, melody, rhythm, dynamics, tempo, texture (monophonic and homophonic), and
// structure (AB, ABA) — and messages/values in songs; participate in and appreciate sporting
// events (Football, Athletics, Volleyball, Rounders, Gymnastics, Swimming) with a focus on fair
// play and code of conduct. Core competencies name "Critical thinking and problem solving" — at
// least one Analyze/Evaluate branch is required, not just definitional recall of the 7 terms.

const ELEMENTS: { id: string; label: string; meaning: string; blank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] } }[] = [
  { id: "pitch", label: "Pitch", meaning: "How high or low a sound is", blank: { before: "How high or low a sound is called its ", after: ".", correctAnswer: "pitch" } },
  { id: "melody", label: "Melody", meaning: "A sequence of single notes that forms a recognisable tune", blank: { before: "A sequence of single notes that forms a recognisable tune is called the ", after: ".", correctAnswer: "melody" } },
  { id: "rhythm", label: "Rhythm", meaning: "The pattern of long and short beats in music", blank: { before: "The pattern of long and short beats in music is called its ", after: ".", correctAnswer: "rhythm" } },
  { id: "dynamics", label: "Dynamics", meaning: "How loud or soft music is played", blank: { before: "How loud or soft music is played is called its ", after: ".", correctAnswer: "dynamics" } },
  { id: "tempo", label: "Tempo", meaning: "How fast or slow music is played", blank: { before: "How fast or slow music is played is called its ", after: ".", correctAnswer: "tempo" } },
  { id: "monophonic", label: "Monophonic texture", meaning: "A single melodic line with no other supporting parts", blank: { before: "A single melodic line with no other supporting parts has a ", after: " texture.", correctAnswer: "monophonic" } },
  { id: "homophonic", label: "Homophonic texture", meaning: "A main melody supported by chords or harmony parts moving together", blank: { before: "A main melody supported by chords or harmony parts moving together has a ", after: " texture.", correctAnswer: "homophonic" } },
  { id: "ab", label: "AB structure", meaning: "A song form with two different sections, one after the other", blank: { before: "A song form with two different sections, one after the other, is called ", after: " structure.", correctAnswer: "AB" } },
  { id: "aba", label: "ABA structure", meaning: "A song form that returns to its first section after a contrasting middle section", blank: { before: "A song form that returns to its first section after a contrasting middle section is called ", after: " structure.", correctAnswer: "ABA" } },
];

const CATALOGUE_FIELDS = [
  { field: "artist-name", example: "Wanjiru Mumbi" },
  { field: "artist-name", example: "Otieno Ochieng" },
  { field: "type", example: "Painting" },
  { field: "type", example: "Sculpture" },
  { field: "type", example: "Woven basket" },
  { field: "media", example: "Watercolour on paper" },
  { field: "media", example: "Carved wood" },
  { field: "media", example: "Clay" },
  { field: "media", example: "Woven sisal fibre" },
  { field: "artist-name", example: "Achieng Auma" },
  { field: "type", example: "Collage" },
  { field: "media", example: "Recycled fabric and paper" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} listens to a song where a single singer performs the entire tune alone, with no other instruments or voices at all. What texture does this song have?`,
      correct: "Monophonic texture — a single melodic line with no supporting parts",
      wrong: [
        "Homophonic texture — homophonic texture requires supporting chords or harmony, which are absent here",
        "AB structure — structure describes sections of a song, not how many parts are playing at once",
        "Dynamics — dynamics describes loudness, not how many melodic lines are present",
      ],
      explanation: "A single melody with nothing supporting it is monophonic texture — homophonic texture would need harmony parts, and structure/dynamics describe different things entirely.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} listens to a choir singing a main tune while other voices hum supporting chords underneath, moving together with the melody. What texture is this?`,
    correct: "Homophonic texture — a main melody supported by chords or harmony parts moving together",
    wrong: [
      "Monophonic texture — monophonic texture has no supporting parts at all",
      "ABA structure — structure describes song sections, not how many parts play together",
      "Tempo — tempo describes speed, not how many parts support the melody",
    ],
    explanation: "A main melody with supporting chords moving together is homophonic texture — monophonic would mean no supporting parts, and structure/tempo describe unrelated aspects of the song.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} analyses a song that opens with a verse (A), moves into a different chorus (B), and then returns to the original verse melody (A) to close. Which structure is this?`,
      correct: "ABA structure — returning to the first section after a contrasting middle section",
      wrong: [
        "AB structure — AB structure does not return to the first section at all",
        "Monophonic texture — texture describes how many melodic parts are present, not song sections",
        "Rhythm — rhythm describes the pattern of beats, not the order of song sections",
      ],
      explanation: "Returning to the opening section after a contrasting middle section is exactly ABA structure — AB structure would end after the second, different section without returning.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} analyses a song with a verse (A) followed by a chorus (B), which then ends without returning to the verse. Which structure is this?`,
    correct: "AB structure — two different sections, one after the other, with no return to the first",
    wrong: [
      "ABA structure — ABA specifically requires a return to the first section, which does not happen here",
      "Homophonic texture — texture describes how many parts play, not the order of sections",
      "Pitch — pitch describes how high or low a sound is, not song structure",
    ],
    explanation: "Two different sections in sequence with no return to the first is AB structure — ABA would require the song to return to its opening section.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} catalogues an exhibited artwork in ${place(rng)}, noting the maker's name, whether it is a painting or sculpture, and what material it is made from. Which three fields does this catalogue cover?`,
      correct: "Artist's name, type of artwork, and media/material",
      wrong: [
        "Only the artist's name — the type and material are not part of a proper catalogue entry",
        "Only the price and the exhibition date, which are not named in the source",
        "Only the type of artwork — the maker's name and material are optional extras",
      ],
      explanation: "The source specifically names artist's name, type of artwork, and media/material as the fields a catalogue entry should indicate — not price/date, and not just one of the three fields alone.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s team loses a football match in ${place(rng)} and the players shake hands respectfully with the winning team, without arguing over the referee's calls. What does this show?`,
    correct: "Fair play and good sportsmanship — accepting the result and respecting the code of conduct",
    wrong: [
      "Poor sportsmanship, since a losing team should always protest the result",
      "Nothing in particular — this behaviour has no connection to the values named in the source",
      "Fair play only applies to the winning team, never the losing team",
    ],
    explanation: "Accepting a result respectfully and shaking hands, rather than arguing with officials, is exactly the fair play and code-of-conduct focus the source names for appreciating sports performances.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} argues loudly with the referee after a Volleyball match, refusing to accept a decision that went against their team. Judged against the sportsmanship focus named in the source, is this acceptable?`,
      correct: "No — the source specifically focuses on fair play and observing the code of conduct, which this behaviour breaks",
      wrong: [
        "Yes — arguing with officials is an expected part of appreciating any sports performance",
        "Yes — but only because Volleyball specifically allows this kind of argument",
        "It cannot be judged either way, since the source gives no guidance on sportsmanship at all",
      ],
      explanation: "The source names fair play and observance of the code of conduct as the specific focus for appreciating sports performances — refusing to accept an official's decision and arguing loudly goes against this, regardless of the sport.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} listens to a song discussing road safety and identifies its central message before discussing how loud, soft, fast, or slow different parts of the song are. Which two elements of music is ${name(rng)} discussing in the second part?`,
    correct: "Dynamics (loud/soft) and tempo (fast/slow)",
    wrong: [
      "Pitch and melody — these describe how high/low a sound is and its tune, not loudness or speed",
      "Structure and texture — these describe song sections and how many parts play, not loudness or speed",
      "Only rhythm — rhythm alone does not cover both loudness and speed",
    ],
    explanation: "Loud/soft directly describes dynamics, and fast/slow directly describes tempo — pitch/melody and structure/texture describe different aspects of a song entirely.",
  }),
];

const CATALOGUE_PROMPTS = ["Sort each example by the catalogue field it belongs to.", "Which catalogue field does each example belong to? Sort them.", "Sort these examples by artist's name, type, or media.", "Classify each example as artist's name, type, or media/material.", "Match each example to its catalogue field by sorting."] as const;
const ELEMENTS_MATCH_PROMPTS = ["Match each element of music to its meaning.", "Pair each element with its definition.", "Match each element to what it means.", "Connect each element to its correct meaning.", "For each element below, choose its matching meaning."] as const;
const STEPS_PROMPTS = ["Put these steps of analysing an artwork in the correct order.", "Arrange the steps for cataloguing and interpreting an artwork.", "Order these steps, from first to last.", "Sort these analysis steps into the correct sequence.", "Place these steps in the order you would follow them."] as const;
const FILL_BLANK_PROMPTS = ["Complete the sentence.", "Fill in the missing word.", "Complete this sentence about analysing creative arts works.", "Fill in the blank below.", "Complete the sentence with the correct word."] as const;

const ANALYSIS_STEPS = [
  { id: "a1", label: "Visit a virtual or actual art establishment for inspiration" },
  { id: "a2", label: "Note the artist's name, type of artwork, and media/material for the catalogue" },
  { id: "a3", label: "Interpret the work — its meaning, technique, and aesthetic" },
  { id: "a4", label: "Reflect on the analysed work for inspiration and mentorship" },
] as const;

export const analysisOfCreativeArtsWorks: Skill = {
  id: "g6-cas-analysis",
  code: "A.1",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-appreciation",
  grade: 6,
  title: "Analysis of Creative Arts works",
  description: "Cataloguing and interpreting exhibited artworks, discussing elements of music (pitch, melody, rhythm, dynamics, tempo, texture, structure) and messages in songs, and appreciating sports performances with a focus on fair play.",
  generate(rng) {
    const branch = randChoice(rng, ["elements-match", "catalogue-categorize", "reasoning", "steps-order", "fill-blank"] as const);

    if (branch === "elements-match") {
      const chosen = shuffle(rng, ELEMENTS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((e) => ({ id: e.id, label: e.label })));
      const targets = shuffle(rng, chosen.map((e) => ({ id: e.id, label: e.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((e) => (correctMap[e.id] = e.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, ELEMENTS_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about pitch, melody, rhythm, dynamics, tempo, texture, and structure.",
        explanation: chosen.map((e) => `${e.label}: ${e.meaning}.`).join(" "),
      };
    }

    if (branch === "catalogue-categorize") {
      const chosen = shuffle(rng, CATALOGUE_FIELDS).slice(0, 8);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.example }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.field));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATALOGUE_PROMPTS),
        items,
        buckets: [
          { id: "artist-name", label: "Artist's name" },
          { id: "type", label: "Type of artwork" },
          { id: "media", label: "Media/material" },
        ],
        correctBucket,
        hint: "A person's name is the artist; a category like painting/sculpture is the type; a material like clay or fabric is the media.",
        explanation: chosen.map((c) => `"${c.example}" belongs to ${c.field === "artist-name" ? "artist's name" : c.field === "type" ? "type of artwork" : "media/material"}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about texture, structure, catalogue fields, and sportsmanship.", explanation: q.explanation };
    }

    if (branch === "steps-order") {
      const shuffled = shuffle(rng, ANALYSIS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: ANALYSIS_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Visit and observe first, record catalogue details, then interpret, and finally reflect.",
        explanation: "Correct order: " + ANALYSIS_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    const e = randChoice(rng, ELEMENTS);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: e.blank.before,
      after: e.blank.after,
      correctAnswer: e.blank.correctAnswer,
      acceptedAnswers: e.blank.acceptedAnswers ?? [e.blank.correctAnswer],
      inputMode: "text",
      hint: "Think about pitch, melody, rhythm, dynamics, tempo, texture, and structure.",
      explanation: `${e.label}: ${e.meaning}.`,
    };
  },
};
