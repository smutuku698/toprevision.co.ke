import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const WRITING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Brainstorming", description: "Generating many ideas on a theme before writing" },
  { skill: "Writing short notes", description: "Recording key points briefly rather than in full sentences" },
  { skill: "Outlining key points", description: "Listing the main ideas from a text in a structured way" },
  { skill: "Reading source texts", description: "Collaborating to read written or online material on the theme" },
  { skill: "Discussing main points", description: "Talking through what a text's key ideas are with peers" },
  { skill: "Paraphrasing", description: "Restating a text's main issues in your own words for comprehension" },
  { skill: "Word-limit discipline", description: "Keeping a paraphrase within a stated word limit, such as 80 words" },
  { skill: "Peer exchange for review", description: "Swapping written work with a classmate so it can be checked" },
  { skill: "Valuing brevity", description: "Recognising that a short, clear message often communicates more effectively than a long one" },
  { skill: "Digital literacy", description: "Using technology responsibly to read texts from online sources" },
  { skill: "Self-efficacy in brainstorming", description: "Concentrating fully while generating ideas on a theme" },
  { skill: "Teamwork in paraphrasing", description: "Working with peers to jointly paraphrase a text's main points" },
];

const PARAPHRASE_ITEMS: { text: string; bucket: string }[] = [
  { text: "Restating the text's main issues in your own words, using no more than 80 words", bucket: "Good paraphrase practice" },
  { text: "Reading the whole source text carefully before writing the paraphrase", bucket: "Good paraphrase practice" },
  { text: "Keeping the paraphrase brief while still covering the key points", bucket: "Good paraphrase practice" },
  { text: "Discussing the main points with peers before writing them down", bucket: "Good paraphrase practice" },
  { text: "Exchanging the paraphrase with a peer for review before finalising it", bucket: "Good paraphrase practice" },
  { text: "Outlining the key points first, then paraphrasing from the outline", bucket: "Good paraphrase practice" },
  { text: "Copying whole sentences from the source text word for word", bucket: "Poor paraphrase practice" },
  { text: "Writing a paraphrase far longer than the original text, well past 80 words", bucket: "Poor paraphrase practice" },
  { text: "Paraphrasing a text without having read it properly first", bucket: "Poor paraphrase practice" },
  { text: "Adding invented details that were never mentioned in the original text", bucket: "Poor paraphrase practice" },
  { text: "Skipping peer review since the paraphrase already feels finished", bucket: "Poor paraphrase practice" },
  { text: "Leaving out one of the text's actual main points entirely", bucket: "Poor paraphrase practice" },
];

const WRITING_STEPS: { id: string; label: string }[] = [
  { id: "brainstorm", label: "Brainstorm ideas on the theme of safety at home" },
  { id: "notes", label: "Write short notes on the theme" },
  { id: "read", label: "Collaborate to read written or online texts on the theme" },
  { id: "discuss", label: "Discuss the main points of the texts on the theme" },
  { id: "paraphrase", label: "Team up with peers to paraphrase the main points from each text (not more than 80 words)" },
  { id: "exchange", label: "Exchange the written work with peers in class for review" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "Restating a text's main issues in your own words, for comprehension, is called", after: ".", answer: "paraphrasing" },
  { before: "Listing the main ideas from a text in a structured way is called", after: "key points.", answer: "outlining" },
  { before: "Generating many ideas about a theme before you start writing is called", after: ".", answer: "brainstorming" },
  { before: "Recording key points briefly rather than in full sentences produces short", after: ".", answer: "notes" },
  { before: "According to the theme's guideline, a paraphrase of a text's main points must not exceed", after: "words.", answer: "80", accepted: ["eighty"] },
  { before: "Recognising that a short, clear message often communicates more effectively than a long one shows the value of", after: ".", answer: "brevity" },
  { before: "Swapping written work with a classmate so it can be checked is called peer", after: ".", answer: "review" },
  { before: "Using technology responsibly to read texts from online sources shows digital", after: ".", answer: "literacy" },
  { before: "Working with peers to jointly paraphrase a text's main points shows the value of", after: ".", answer: "unity", accepted: ["teamwork"] },
  { before: "Talking through what a text's key ideas are with peers, before writing, is called", after: "the main points.", answer: "discussing" },
  { before: "Concentrating fully while generating ideas on a theme, without giving up, shows", after: ".", answer: "self-efficacy", accepted: ["self efficacy"] },
  { before: "Preparing clear, brief information on staying safe at home and reducing emergencies links to", after: "risk reduction.", answer: "disaster" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} paraphrases a safety-at-home text but writes 150 words, well over the class limit. What should ${who} do?`,
      correct: "Trim the paraphrase to keep only the main points and stay within the 80-word limit",
      wrong: ["Keep it as it is, since longer paraphrases are always better", "Extend it even further to show more understanding", "Submit it unchanged, since the word limit only applies to notes, not paraphrases"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} "paraphrases" a safety-at-home text by copying several of its sentences exactly as written. What is wrong with this approach?`,
      correct: "This is copying, not paraphrasing, since paraphrasing means restating ideas in your own words",
      wrong: ["It is an acceptable paraphrase since the topic is safety-related", "It is fine as long as it stays under 80 words", "It is the fastest correct way to paraphrase a text"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Before writing short notes on safety at home, ${who} in ${where} first outlines the text's key points on a chart. Why is outlining first useful?`,
      correct: "Outlining first helps organise which points to include before writing the notes or paraphrase",
      wrong: ["It is unnecessary since notes can be written directly with no plan", "It only helps with very short texts", "It replaces the need to read the text at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} spends several minutes brainstorming ideas about safety at home before writing any notes. Why is this step worthwhile?`,
      correct: "Brainstorming widens the pool of ideas before deciding what is most important to include",
      wrong: ["It wastes time that should be spent writing straight away", "It is only necessary when writing alone, not in a group", "It should be skipped once the theme feels familiar"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} exchanges a paraphrase with a classmate for review, but the classmate only checks the spelling. What is missing from a proper review?`,
      correct: "Checking whether the paraphrase captures the text's key points and stays within the word limit, not spelling alone",
      wrong: ["Nothing, since peer review is only about checking spelling", "The review should focus only on handwriting neatness", "Peer review is unnecessary once a paraphrase is written"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes a very long note for a safety-at-home reminder to be posted at home, instead of a short, brief one. Why might this be a problem?`,
      correct: "A short, clear note communicates faster, which matters especially for a safety message",
      wrong: ["A longer note is always clearer than a short one", "Length has no effect on how quickly a safety message is understood", "Short notes are less trustworthy than long ones"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked to paraphrase an online source on safety at home without reading it fully first. What is the risk of doing this?`,
      correct: "Reading the whole source carefully is needed first, or the paraphrase may miss or misstate its main points",
      wrong: ["There is no risk, as long as the topic seems familiar", "Copying the website's own wording exactly would fix the problem", "Skipping this step saves time without losing accuracy"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked why writing brief notes matters for safety-at-home information, and not just for schoolwork. What is the best reason?`,
      correct: "Brief, clear information can be understood and acted on quickly, which matters during a real emergency",
      wrong: ["Brevity has no real connection to how people respond during an emergency", "Longer explanations are always safer during an emergency", "Short notes are only useful for schoolwork, never for real emergencies"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s team in ${where} divides several safety-at-home texts among its members and later combines their paraphrased main points. Why is this teamwork useful?`,
      correct: "It lets the group divide the reading and pool the main points from several texts efficiently",
      wrong: ["It is unnecessary, since one learner could read every text just as fast alone", "It means every member should write an identical paraphrase", "It removes the need to discuss the main points at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} drops one of the text's actual main points from a paraphrase just to stay under 80 words. Is this the right way to keep the paraphrase brief?`,
      correct: "No — brevity should not come at the cost of leaving out one of the text's actual main points",
      wrong: ["Yes — word count matters more than covering every main point", "Yes — any point can be dropped as long as the limit is met", "Yes — the missing point can simply be added back later without rechecking the text"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes a paraphrase of a safety-at-home text that includes a detail never mentioned in the original passage. What has gone wrong?`,
      correct: "A paraphrase should stick to the text's actual main points, not add invented details",
      wrong: ["Adding extra details always makes a paraphrase better", "It is acceptable as long as the added detail sounds realistic", "Adding details is required to reach the word limit"],
    };
  },
];

export const safetyInformationWriting: Skill = {
  id: "g7-il-w-safety-home",
  code: "W.3",
  subjectId: "indigenous-language",
  strandId: "g7-il-writing",
  grade: 7,
  title: "Safety at home: writing for information",
  description: "Outline key points and paraphrase texts on safety at home in no more than 80 words, valuing brevity in written communication.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Outline the key points first, then paraphrase them in your own words, keeping the whole paraphrase to no more than 80 words.";

    if (branch === "match") {
      const chosen = shuffle(rng, WRITING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each writing-for-information skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, PARAPHRASE_ITEMS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each behaviour as good or poor paraphrase practice.",
        items,
        buckets,
        correctBucket,
        hint: "Good practice restates the text briefly and accurately in your own words, within the word limit.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, WRITING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of writing for information on safety at home in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: WRITING_STEPS.map((s) => s.id),
        hint: "Start by brainstorming, then write short notes, read source texts, discuss main points, paraphrase within 80 words, and finally exchange for review.",
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
