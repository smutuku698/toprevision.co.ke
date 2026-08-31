import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STORY =
  "Zawadi had sewn her own school-holiday dresses since she was ten, teaching herself from torn fashion magazines and her grandmother's old patterns. Her best friend Melissa followed every trend on her phone, buying whatever the influencers wore that week, even if it did not suit her. Their tailor neighbour, Mzee Otunga, had stitched clothes in the same small shop for thirty years and grumbled that \"fashion these days changes faster than the weather.\" When the school announced a design competition, Melissa entered a copy of a trending outfit she had seen online, confident it would impress the judges. Zawadi instead designed an original dress using leftover fabric scraps, inspired by the kitenge patterns Mzee Otunga had shown her. On competition day, the judges praised Zawadi's dress for its originality and skillful stitching, while Melissa's copied design blended in with three other nearly identical outfits. Melissa was disappointed but admitted, watching Zawadi accept the trophy, that copying a trend was easier than creating something truly her own.";

const CHARACTERS: { name: string; description: string }[] = [
  { name: "Zawadi", description: "The self-taught seamstress who designed an original dress from fabric scraps" },
  { name: "Melissa", description: "Zawadi's best friend who copies trending outfits from influencers online" },
  { name: "Mzee Otunga", description: "The tailor neighbour who has stitched clothes in his shop for thirty years" },
];

const ACTION_ITEMS: { text: string; character: string }[] = [
  { text: "Sewed her own school-holiday dresses since age ten", character: "Zawadi" },
  { text: "Designed an original dress from leftover fabric scraps", character: "Zawadi" },
  { text: "Followed every trend seen from influencers on her phone", character: "Melissa" },
  { text: "Entered a copy of a trending outfit into the competition", character: "Melissa" },
  { text: "Stitched clothes in the same small shop for thirty years", character: "Mzee Otunga" },
  { text: "Showed Zawadi kitenge patterns that inspired her design", character: "Mzee Otunga" },
];

const FILL_ITEMS = [
  { before: "Zawadi had sewn her own school-holiday dresses since she was ten, teaching herself from torn fashion magazines and her grandmother's old", after: ".", correctAnswer: "patterns" },
  { before: "Their tailor neighbour, Mzee Otunga, had stitched clothes in the same small shop for thirty years and grumbled that \"fashion these days changes faster than the", after: ".\"", correctAnswer: "weather" },
  { before: "On competition day, the judges praised Zawadi's dress for its originality and skillful", after: ".", correctAnswer: "stitching" },
];

const IDENTIFY_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Who won the school's design competition?",
    correct: "Zawadi",
    distractors: ["Melissa", "Mzee Otunga", "One of the judges"],
    explanation: "The passage says 'the judges praised Zawadi's dress for its originality and skillful stitching,' while Melissa's design blended in with copies.",
  },
  {
    q: "Who has run a tailoring shop in the same location for thirty years?",
    correct: "Mzee Otunga",
    distractors: ["Zawadi", "Melissa", "An unnamed influencer"],
    explanation: "The passage introduces 'their tailor neighbour, Mzee Otunga, had stitched clothes in the same small shop for thirty years.'",
  },
];

const TRAIT_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "What does Zawadi's choice to design an original dress, rather than copy a trend, reveal about her character?",
    correct: "She values creativity and originality over simply following what is popular",
    distractors: ["She dislikes fashion and design entirely", "She is jealous of Melissa's phone", "She wanted to make Melissa feel bad"],
    explanation: "Choosing to design 'an original dress using leftover fabric scraps' inspired by traditional patterns, instead of copying a trend, shows Zawadi values creativity — a trait shown through her action rather than stated directly.",
  },
  {
    q: "What does Melissa's final comment about copying being 'easier' suggest about her at the end of the story?",
    correct: "She is beginning to recognise the value of originality, even though she chose the easier path",
    distractors: ["She still believes copying trends is always the best choice", "She refuses to accept that Zawadi's dress was better", "She plans to quit fashion design permanently"],
    explanation: "Melissa's admission, watching Zawadi accept the trophy, shows a shift in her thinking — an inference about her growing self-awareness, not something the story states as a simple fact.",
  },
];

const PARAGRAPH_QUESTIONS: { q: string; correct: string; distractors: string[]; explanation: string }[] = [
  {
    q: "Which short paragraph is best supported by evidence from the story about Zawadi?",
    correct: "Zawadi is a creative, self-taught seamstress. She learned to sew from old magazines and her grandmother's patterns, and she chose to design an original dress from fabric scraps rather than copy a trend, winning the competition for her originality.",
    distractors: [
      "Zawadi bought her competition dress online and copied a design she saw an influencer wearing, which the judges did not like.",
      "Zawadi has never sewn anything before and only entered the competition because Melissa forced her to join.",
      "Zawadi dislikes Mzee Otunga and never learned anything from him about fashion or patterns.",
    ],
    explanation: "Every detail in the correct paragraph matches the story directly: self-taught from magazines and her grandmother's patterns, an original design from fabric scraps, and winning for originality. The other paragraphs contradict details stated in the passage.",
  },
  {
    q: "Which short paragraph is best supported by evidence from the story about Melissa?",
    correct: "Melissa follows fashion trends closely, often buying whatever influencers wear online. For the competition, she copied a trending outfit rather than designing something original, and her entry blended in with similar copies.",
    distractors: [
      "Melissa designed a completely original outfit using traditional kitenge patterns and won first place.",
      "Melissa has run her own tailoring shop for thirty years and taught Zawadi everything she knows.",
      "Melissa refused to enter the competition at all because she disliked fashion.",
    ],
    explanation: "The correct paragraph matches the story: Melissa 'followed every trend on her phone' and 'entered a copy of a trending outfit,' which 'blended in with three other nearly identical outfits.' The other paragraphs contradict these facts.",
  },
];

export const shortStoryCharactersFashion: Skill = {
  id: "g8-eng-r-short-story-characters-fashion",
  code: "R.24",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Short Story - Characters (Class Reader)",
  description: "Identify characters in a short story, describe their traits with evidence, and acknowledge the role of characters in stories.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "identify", "trait", "paragraph", "categorize", "fill"] as const);
    const hint = "Look for evidence in the text — what a character does and says — to support a description of who they are.";

    if (branch === "match") {
      const tokens = shuffle(rng, CHARACTERS.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, CHARACTERS.map((c) => ({ id: c.name, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of CHARACTERS) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        prompt: "Match each character in the story to their description.",
        passage: STORY,
        tokens,
        targets,
        correctMap,
        hint,
        explanation: CHARACTERS.map((c) => `${c.name} — ${c.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "identify") {
      const entry = randChoice(rng, IDENTIFY_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "row",
        hint: "Reread the passage to find who is described in this way.",
        explanation: entry.explanation,
      };
    }

    if (branch === "paragraph") {
      const entry = randChoice(rng, PARAGRAPH_QUESTIONS);
      const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: entry.q,
        passage: STORY,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check each paragraph's claims against what the story actually says — the best one has no contradictions.",
        explanation: entry.explanation,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ACTION_ITEMS);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.character));
      return {
        kind: "categorize",
        prompt: "Sort each action by which character did it.",
        passage: STORY,
        items,
        buckets: CHARACTERS.map((c) => ({ id: c.name, label: c.name })),
        correctBucket,
        hint,
        explanation: chosen.map((a) => `"${a.text}" — done by ${a.character}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word from the story.",
        passage: STORY,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: "Look for the exact word in the passage above.",
        explanation: `The passage reads: "${entry.before} ${entry.correctAnswer}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, TRAIT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      passage: STORY,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: entry.explanation,
    };
  },
};
