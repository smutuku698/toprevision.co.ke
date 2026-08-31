import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const LISTENING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Broken telephone game", description: "Passing a whispered message along a line of classmates to practise attentive listening" },
  { skill: "Listening for the main idea", description: "Identifying what a story or passage on safety at home is mainly about" },
  { skill: "Discussing key ideas", description: "Talking through the important points found in a listened-to story or passage" },
  { skill: "Identifying verbs", description: "Recognising words that denote actions within the story or passage" },
  { skill: "Composing a song", description: "Working with peers to turn ideas from the theme into a song and singing it together" },
  { skill: "Answering questions orally", description: "Responding out loud to questions asked about the song or passage" },
  { skill: "Debating importance", description: "Giving reasons for and against a statement on safety at home" },
  { skill: "Responding to aural questions", description: "Answering questions about a story or passage based on what was heard, not read" },
  { skill: "Realising the value of attentive listening", description: "Understanding why careful listening helps you stay safe at home" },
  { skill: "Avoiding distractions while listening", description: "Focusing fully on the speaker so no safety information is missed" },
  { skill: "Watching an audio-visual story", description: "Following both the sound and images of a video to understand its message" },
  { skill: "Taking turns to speak", description: "Practising communication and collaboration during a themed discussion" },
];

const SAFETY_WORDS: { text: string; bucket: string }[] = [
  { text: "care (to care for a young sibling)", bucket: "Verb (denotes an action)" },
  { text: "bites (a dog bites without warning)", bucket: "Verb (denotes an action)" },
  { text: "scratch (to scratch an insect bite)", bucket: "Verb (denotes an action)" },
  { text: "heal (a wound will heal with proper care)", bucket: "Verb (denotes an action)" },
  { text: "protect (parents protect children from danger)", bucket: "Verb (denotes an action)" },
  { text: "report (report any electrical fault at once)", bucket: "Verb (denotes an action)" },
  { text: "home (the house where a family lives)", bucket: "Not a verb (a noun or descriptive word)" },
  { text: "accident (an unplanned event that causes injury)", bucket: "Not a verb (a noun or descriptive word)" },
  { text: "emergency (a sudden situation needing urgent action)", bucket: "Not a verb (a noun or descriptive word)" },
  { text: "electricity (the power that runs lights and appliances)", bucket: "Not a verb (a noun or descriptive word)" },
  { text: "wounds (injuries to the skin that need care)", bucket: "Not a verb (a noun or descriptive word)" },
  { text: "safe (free from danger or risk)", bucket: "Not a verb (a noun or descriptive word)" },
];

const LISTENING_STEPS: { id: string; label: string }[] = [
  { id: "telephone", label: "Team up to play the 'broken telephone' game to practise attentive listening" },
  { id: "story", label: "Listen to an oral or watch an audio-visual story or passage on the theme of safety at home" },
  { id: "discuss", label: "Discuss the various key ideas from the story or passage" },
  { id: "verbs", label: "Identify words that denote actions (verbs) from the story or passage" },
  { id: "song", label: "Team up to compose a song on the theme and sing with peers" },
  { id: "answer", label: "Answer questions from the song orally" },
  { id: "debate", label: "Debate the importance of safety at home" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "A sudden, unplanned event that causes injury is called an", after: ".", answer: "accident" },
  { before: "A serious, sudden situation that needs urgent action is called an", after: ".", answer: "emergency" },
  { before: "The power source used to run lights and appliances at home is called", after: ".", answer: "electricity" },
  { before: "Injuries to the skin that need care and time to close up are called", after: ".", answer: "wounds" },
  { before: "When a wound closes up and gets better over time, we say it will", after: ".", answer: "heal" },
  { before: "To rub or scrape the skin, often because of an itch or an insect bite, is to", after: ".", answer: "scratch" },
  { before: "When something is free from danger or risk, we say it is", after: ".", answer: "safe" },
  { before: "Looking after someone, especially a young child, is called giving", after: ".", answer: "care" },
  { before: "Words that denote actions, like 'run' or 'heal', are called", after: ".", answer: "verbs" },
  { before: "The main points discussed after listening to a story or passage are called the key", after: ".", answer: "ideas" },
  { before: "A game where a whispered message is passed along a line of classmates to practise attentive listening is called", after: ".", answer: "broken telephone", accepted: ["the broken telephone game"] },
  { before: "Realising why it matters to listen carefully during a safety lesson shows an understanding of the importance of listening", after: ".", answer: "attentively", accepted: ["carefully"] },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While listening to an audio-visual story on safety at home in ${where}, ${who} correctly says the main idea is "always take care around electricity and sharp objects at home," rather than repeating one small detail mentioned only once. What has ${who} demonstrated?`,
      correct: "Listening for the overall main idea of a passage, not just a single detail",
      wrong: ["Listening only for one specific detail mentioned once", "Guessing the topic without listening at all", "Copying the narrator's exact words instead of understanding them"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} listens to the sentence "Careful children switch off the lights before sleeping" and is asked to identify the verb (the word that denotes an action). Which word should ${who} choose?`,
      correct: "switch off — it names the action being done",
      wrong: ["careful — it describes the children, not an action", "children — it names who is acting, not the action itself", "lights — it names a thing, not an action"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After listening to a safety-at-home passage in ${where}, ${who} is asked what caused the accident described. What is the best way to answer?`,
      correct: "Answer based only on what the passage actually said, not on a guess",
      wrong: ["Guess an answer that sounds reasonable", "Answer using something read in an unrelated book", "Skip the question since it was not the main idea"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Before listening to the safety-at-home story, ${who}'s class in ${where} plays the "broken telephone" game, passing a whispered message along a line of classmates. Why is this game useful practice?`,
      correct: "It trains learners to listen attentively so a message is not distorted as it passes along",
      wrong: ["It has no connection to listening skills", "It tests how loudly learners can speak", "It replaces the need to listen to the actual story afterward"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After discussing the key ideas of a safety-at-home passage, ${who}'s group in ${where} composes a short song about the theme and performs it for the class. What does this activity mainly build, alongside communication?`,
      correct: "Creativity and imagination, by turning the passage's ideas into a song",
      wrong: ["Only physical fitness, unrelated to the passage", "The ability to memorise the passage word for word", "A skill unrelated to the theme of safety at home"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During a class debate on "is it important to observe safety at home" in ${where}, ${who} prepares reasons in advance and listens carefully to opposing points before responding. What value is ${who} showing?`,
      correct: "Responsibility, by diligently preparing for and taking part in the debate",
      wrong: ["Carelessness, by not listening to the other side", "Indifference, since debates do not require preparation", "Impatience, by interrupting other speakers"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While an audio-visual story about safety at home plays in ${where}, ${who} keeps chatting with a neighbour instead of watching and listening. What is the likely result?`,
      correct: `${who} will miss key safety information needed to answer questions afterward`,
      wrong: ["It will not affect understanding since the video can always be replayed", "It will help remember more details than usual", "It will make the story finish faster"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked why it matters to listen attentively during a safety-at-home lesson, more than during an unrelated lesson. What is the best reason?`,
      correct: "Missing safety information could mean not knowing how to prevent or respond to a real accident or emergency",
      wrong: ["It does not matter, since safety lessons are rarely tested", "Attentive listening only matters for entertainment, not safety", "Safety information can always be looked up later instead of listened to"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After singing a composed song about safety at home, ${who}'s class in ${where} answers oral questions about the song's content. What should the answers be based on?`,
      correct: "What the song actually said, recalled from listening carefully",
      wrong: ["Whatever sounds like a reasonable safety tip", "Information from a completely different song", "Guesses made without having listened to the song"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} discusses the key ideas from a listened-to passage on safety at home, and one member insists the passage was "about a boy named Juma" rather than about staying safe from electrical hazards. What has that member confused?`,
      correct: "A minor detail (a character's name) with the passage's actual main idea",
      wrong: ["The verb used in the passage with a noun", "A direct question with an inferential one", "The song's tune with its lyrics"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `In ${where}, ${who} listens to the instruction "Report any electrical fault to an adult immediately" and must pick out the verb. Which word is it?`,
      correct: "Report — it denotes the action being instructed",
      wrong: ["Electrical — it describes the fault, not an action", "Fault — it names a thing, not an action", "Immediately — it tells when, not what action to do"],
    };
  },
];

export const safetyAttentiveListening: Skill = {
  id: "g7-il-ls-safety-home",
  code: "LS.3",
  subjectId: "indigenous-language",
  strandId: "g7-il-listening-speaking",
  grade: 7,
  title: "Safety at home: attentive listening",
  description: "Listen attentively to pick out main ideas and verbs from a passage on safety at home, respond to questions from an aural text, and value listening for safety information.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen for the overall main idea first, then pick out details and action words (verbs) as you listen.";

    if (branch === "match") {
      const chosen = shuffle(rng, LISTENING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each attentive listening activity to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SAFETY_WORDS).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each safety-at-home word as a verb (denotes an action) or not a verb.",
        items,
        buckets,
        correctBucket,
        hint: "Ask yourself: does the word name something being done, or does it name a thing, place, or state?",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LISTENING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of the attentive listening lesson on safety at home in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: LISTENING_STEPS.map((s) => s.id),
        hint: "Start with the broken telephone game, then listen to the story, discuss it, find verbs, compose and sing a song, answer questions, and finally debate.",
        explanation: LISTENING_STEPS.map((s) => s.label).join(" → "),
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
