import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const READING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Vocabulary bank", description: "A personal collection of new words gathered while reading texts on a theme" },
  { skill: "Context inference", description: "Working out a word's meaning from clues in nearby sentences" },
  { skill: "Dictionary check", description: "Confirming a word's meaning using the dictionary" },
  { skill: "Thesaurus use", description: "Finding synonyms and opposites of a word using a thesaurus" },
  { skill: "Sentence construction", description: "Using a newly learnt word correctly in a sentence of your own" },
  { skill: "Emerging issue", description: "A new or developing concern picked out from a newspaper or magazine article" },
  { skill: "Safety precaution", description: "A step taken to stay safe while using a digital device for research" },
  { skill: "Peer sharing", description: "Discussing inferred word meanings with classmates" },
  { skill: "Extensive reading", description: "Reading widely from both digital and print texts on a theme" },
  { skill: "Civic responsibility", description: "Being aware of and engaged with issues affecting the nation" },
];

const WORD_PAIRS: { text: string; bucket: string }[] = [
  { text: '"unity" and "togetherness"', bucket: "Synonym pair" },
  { text: '"patriot" and "nationalist"', bucket: "Synonym pair" },
  { text: '"responsibility" and "duty"', bucket: "Synonym pair" },
  { text: '"communities" and "societies"', bucket: "Synonym pair" },
  { text: '"love" and "affection"', bucket: "Synonym pair" },
  { text: '"cohesion" and "solidarity"', bucket: "Synonym pair" },
  { text: '"love" and "hate"', bucket: "Antonym pair" },
  { text: '"unity" and "division"', bucket: "Antonym pair" },
  { text: '"responsibility" and "carelessness"', bucket: "Antonym pair" },
  { text: '"loyalty" and "betrayal"', bucket: "Antonym pair" },
  { text: '"cohesion" and "disunity"', bucket: "Antonym pair" },
  { text: '"construction" and "destruction"', bucket: "Antonym pair" },
];

const READING_STEPS: { id: string; label: string }[] = [
  { id: "read", label: "Read digital and print texts and identify vocabulary related to patriotism and road construction and maintenance" },
  { id: "bank", label: "Create a personal vocabulary bank of the new words picked" },
  { id: "infer", label: "Work collaboratively to infer the meaning of words from context and share with peers" },
  { id: "dictionary", label: "Use the dictionary to find out the meaning of the words" },
  { id: "thesaurus", label: "Work jointly with peers to use a thesaurus and the dictionary to find synonyms and opposites of the words" },
  { id: "sentence", label: "Construct sentences using the vocabulary" },
  { id: "issues", label: "Read articles from newspapers and magazines then pick out emerging issues related to the theme" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "A personal collection of new words gathered while reading texts on a theme is called a vocabulary", after: ".", answer: "bank" },
  { before: "Working out a word's meaning from clues in the surrounding sentences is called using context", after: ".", answer: "clues" },
  { before: "After guessing a word's meaning from context, checking it against a reference book of definitions is called using a", after: ".", answer: "dictionary" },
  { before: "A reference book used to find synonyms and opposites of a word is called a", after: ".", answer: "thesaurus" },
  { before: "A word that means nearly the same as another word is called a", after: ".", answer: "synonym" },
  { before: "A word that means the opposite of another word is called an", after: ".", answer: "antonym" },
  { before: "A new or developing concern picked out from a newspaper or magazine article is called an emerging", after: ".", answer: "issue" },
  { before: "Being aware of and engaged with issues affecting the nation is called civic", after: ".", answer: "responsibility" },
  { before: "Reading widely from both digital and print sources on a theme is called", after: "reading.", answer: "extensive" },
  { before: "The opposite of unity, where communities are divided rather than working together, is called", after: ".", answer: "disunity" },
  { before: "Sharing thesaurus and dictionary resources fairly with classmates while researching shows social", after: ".", answer: "justice" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} reads an article about road construction and meets the unfamiliar word "cohesion" used to describe communities living together. What should ${who} do first?`,
      correct: "Try to work out the meaning from context clues, then confirm it in a dictionary",
      wrong: ["Skip the word since it is not the main topic", "Guess a meaning at random and move on", "Wait for the teacher to explain every unfamiliar word"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While building a vocabulary bank in ${where}, ${who} wants both a synonym and the opposite of the word "unity". Which reference tool is built specifically for this?`,
      correct: "A thesaurus, which lists synonyms and opposites of a word",
      wrong: ["A dictionary only, since it never lists related words", "An atlas, since the word relates to communities", "No reference tool is needed for this kind of word"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} and classmates in ${where} read two newspaper articles about patriotism and road maintenance, then discuss what new concerns are raised in the articles. What are they doing?`,
      correct: "Picking out emerging issues related to the theme",
      wrong: ["Copying the articles word for word into their notebooks", "Ignoring the articles since they are not part of the set text", "Rewriting the headlines only, without reading further"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is researching patriotism vocabulary online and considers posting personal details, such as a home address, in a public comment section to ask for help. What should ${who} do?`,
      correct: "Avoid sharing personal information online and follow safety precautions while researching",
      wrong: ["Share the details, since it will help get a faster reply", "Post the details only if the website looks official", "Ask a stranger online to keep the details private"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} has only one dictionary and one thesaurus to share while researching patriotism vocabulary. What is the fairest way to use these resources?`,
      correct: "Take turns sharing the dictionary and thesaurus equitably among group members",
      wrong: ["Let the fastest reader keep both books for the whole lesson", "Each learner should buy their own instead of sharing", "Only the group leader should be allowed to use them"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} learns the word "patriot" from a text, then writes a completely new sentence describing a local leader as a patriot. What skill is ${who} practising?`,
      correct: "Constructing an original sentence using newly learnt vocabulary",
      wrong: ["Copying the sentence where the word first appeared", "Memorising the word's spelling without using it", "Avoiding the new word in future writing"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} infers that "cohesion" probably means communities working closely together, based on the sentences around it, then checks a dictionary to be sure. What has ${who} correctly combined?`,
      correct: "Context inference with dictionary confirmation",
      wrong: ["Guessing with no evidence at all", "Thesaurus use only, without reading the passage", "Reading for entertainment rather than information"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} reads only the headline of an article about road maintenance in ${where} and then confidently states what the emerging issue is, without reading the rest of the article. What is the risk?`,
      correct: `${who} may misunderstand the emerging issue by not reading enough of the article`,
      wrong: ["There is no risk, since headlines always explain the full issue", "Reading further would only repeat the headline", "Emerging issues are never explained in the article body"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} reads only print newspapers for the patriotism theme and refuses to check any digital sources. What learning experience is ${who} missing out on?`,
      correct: "Extensive reading from both digital and print texts on the theme",
      wrong: ["Reading is unnecessary once one source is used", "Print texts alone always give the fullest picture", "Digital sources are never appropriate for this theme"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After reading several articles on patriotism in ${where}, ${who} tells classmates about a growing concern over road safety mentioned in more than one article. What civic value is ${who} showing?`,
      correct: "Civic responsibility, by staying informed and engaging with issues affecting the nation",
      wrong: ["Curiosity with no connection to the theme", "A private hobby unrelated to reading for information", "Avoidance of the theme's vocabulary"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} finds the word "loyalty" in a text and wants a word that means the opposite, to use when discussing what patriotism is not. Which word fits?`,
      correct: '"Betrayal", since it is an antonym — a word meaning the opposite of loyalty',
      wrong: ['"Devotion", since it means nearly the same as loyalty', '"Duty", since it is unrelated to loyalty\'s meaning', "There is no opposite for this word"],
    };
  },
];

export const patriotismReading: Skill = {
  id: "g7-il-r-patriotism",
  code: "R.9",
  subjectId: "indigenous-language",
  strandId: "g7-il-reading",
  grade: 7,
  title: "Patriotism: reading for information",
  description: "Build a personal vocabulary collection using context, the dictionary, and a thesaurus, and pick out emerging issues from articles on patriotism and road maintenance.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A dictionary confirms a word's meaning. A thesaurus finds synonyms and opposites. Emerging issues come from reading whole articles, not just headlines.";

    if (branch === "match") {
      const chosen = shuffle(rng, READING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each reading-for-information skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, WORD_PAIRS).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Use a thesaurus mindset: sort each word pair as a synonym pair (nearly the same meaning) or an antonym pair (opposite meaning).",
        items,
        buckets,
        correctBucket,
        hint: "A synonym means nearly the same; an antonym means the opposite.",
        explanation: chosen.map((c) => `${c.text} — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, READING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of reading for information on the patriotism theme in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: READING_STEPS.map((s) => s.id),
        hint: "Start by reading and picking vocabulary, then bank it, infer meaning, confirm with the dictionary, use a thesaurus, build sentences, and finally pick out emerging issues.",
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
