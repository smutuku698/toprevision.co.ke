import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const PRESENTATION_SKILLS: { skill: string; description: string }[] = [
  { skill: "Selecting a sub-topic", description: "Choosing a specific, focused angle on the theme before preparing a talk" },
  { skill: "Knowing your audience", description: "Considering what listeners already know about the topic" },
  { skill: "Organising key points", description: "Arranging ideas in a logical, easy-to-follow order" },
  { skill: "Rehearsing beforehand", description: "Practising the talk to check timing and flow before presenting" },
  { skill: "Voice clarity and pace", description: "Speaking loudly and slowly enough for everyone to follow" },
  { skill: "Eye contact", description: "Looking at the audience rather than only reading from notes" },
  { skill: "Handling questions confidently", description: "Responding calmly and clearly during a question and answer session" },
  { skill: "Respecting diverse opinions", description: "Listening respectfully to different viewpoints raised during the Q&A" },
  { skill: "Honesty in delivery", description: "Presenting well-researched, truthful content rather than exaggerated claims" },
  { skill: "Recording for review", description: "Capturing the presentation on a digital device so it can be reviewed later" },
  { skill: "Accepting peer feedback", description: "Using classmates' constructive comments to improve future presentations" },
  { skill: "Digital portfolio organisation", description: "Keeping recorded presentations organised in one place for later reference" },
];

const PREP_ISSUES: { text: string; bucket: string }[] = [
  { text: "Selecting a focused sub-topic, such as the roads example, before researching", bucket: "Before a presentation" },
  { text: "Organising key points into a logical order", bucket: "Before a presentation" },
  { text: "Rehearsing the talk to check its timing", bucket: "Before a presentation" },
  { text: "Preparing brief note cards or an outline", bucket: "Before a presentation" },
  { text: "Considering what the audience already knows about the topic", bucket: "Before a presentation" },
  { text: "Deciding which real examples, such as road agencies, to include", bucket: "Before a presentation" },
  { text: "Making eye contact with the audience", bucket: "During a presentation" },
  { text: "Speaking clearly at a steady, controlled pace", bucket: "During a presentation" },
  { text: "Watching the time remaining while speaking", bucket: "During a presentation" },
  { text: "Staying focused on the selected sub-topic", bucket: "During a presentation" },
  { text: "Answering audience questions calmly in the Q&A session", bucket: "During a presentation" },
  { text: "Adjusting tone and pace if the audience looks confused", bucket: "During a presentation" },
];

const PRESENTATION_STEPS: { id: string; label: string }[] = [
  { id: "watch", label: "Watch a recorded presentation and list the key points discussed" },
  { id: "brainstorm", label: "Brainstorm with peers the issues to consider before and during a presentation" },
  { id: "select", label: "Select a sub-topic on patriotism, such as the role of the Kenya Roads Board and Kenya Rural Roads Authority in road construction and maintenance" },
  { id: "contest", label: "Conduct a public speaking contest to present a short talk on the topic selected" },
  { id: "record", label: "Collaborate with peers to record the presentations" },
  { id: "portfolio", label: "Organise the recorded presentations in a digital portfolio" },
  { id: "qa", label: "Engage the presenter in a question and answer session on the topic presented" },
  { id: "review", label: "Peer review each other's presentation for improvement" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The government agency responsible for funding the construction and maintenance of classified roads is the Kenya Roads", after: ".", answer: "Board" },
  { before: "The government agency responsible for the construction and maintenance of rural roads is the Kenya Rural Roads", after: ".", answer: "Authority" },
  { before: "A gathering where learners take turns giving short talks and are judged on delivery is called a public speaking", after: ".", answer: "contest" },
  { before: "Choosing a specific, focused angle on a broad theme before preparing a talk is called selecting a", after: ".", answer: "sub-topic", accepted: ["subtopic"] },
  { before: "A session in which the audience asks the presenter about the topic just presented is called a question and", after: "session.", answer: "answer" },
  { before: "Reviewing a classmate's presentation and suggesting ways to improve it is called", after: "review.", answer: "peer" },
  { before: "Keeping recorded presentations organised in one place for later reference is called a digital", after: ".", answer: "portfolio" },
  { before: "A person who loves and is loyal to their country is called a", after: ".", answer: "patriot" },
  { before: "Working together as different communities to build a united nation shows national", after: ".", answer: "unity", accepted: ["cohesion"] },
  { before: "Being answerable for completing a task, such as preparing a presentation well, is called", after: ".", answer: "responsibility" },
  { before: "Speaking loudly and slowly enough for the whole audience to follow is important for voice", after: ".", answer: "clarity" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked to prepare a short talk on patriotism but starts researching without narrowing down to a specific angle, such as the role of road agencies. What has ${who} skipped?`,
      correct: "Selecting a focused sub-topic before preparing the talk",
      wrong: ["Rehearsing the talk out loud", "Recording the presentation on a digital device", "Organising the presentation in a digital portfolio"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Before the public speaking contest in ${where}, ${who} practises the talk several times to check whether it fits within the time allowed. What is this an example of?`,
      correct: "Rehearsing beforehand to check timing and flow",
      wrong: ["Memorising the talk word for word so nothing can be understood if forgotten", "Recording the talk instead of practising it", "Skipping preparation since the contest is informal"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During the contest in ${where}, ${who} reads directly from a full script without looking up at the audience even once. What presentation issue does this show?`,
      correct: "A lack of eye contact, which can make the audience lose interest",
      wrong: ["Excellent time management", "Strong handling of audience questions", "Good use of a digital portfolio"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} is preparing a talk on the Kenya Roads Board and Kenya Rural Roads Authority for a class in ${where}, but does not think about how much the audience already knows about these agencies. What has ${who} overlooked?`,
      correct: "Considering what the audience already knows about the topic",
      wrong: ["Choosing which sub-topic to research", "Recording the presentation for the portfolio", "Rehearsing the talk's timing"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After presenting in ${where}, ${who} is asked a question about road maintenance that was not covered in the talk. What is the best way for ${who} to respond?`,
      correct: "Answer calmly and honestly, admitting if the specific detail was not researched",
      wrong: ["Refuse to answer any question not already in the notes", "Make up an answer that sounds convincing", "End the presentation immediately to avoid the question"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s classmates in ${where} record every presentation from the public speaking contest and save the files together. Why is this step useful?`,
      correct: "It builds a digital portfolio the class can review and learn from later",
      wrong: ["It replaces the need to actually present live", "It is only useful if the presenter forgets what was said", "It removes the need for peer review afterward"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During the Q&A session in ${where}, a classmate raises a viewpoint on road maintenance that differs from ${who}'s own opinion. What should ${who} do?`,
      correct: "Listen respectfully to the differing viewpoint, even while disagreeing",
      wrong: ["Dismiss the opinion immediately as wrong", "Refuse to continue the Q&A session", "Interrupt the classmate before they finish speaking"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} exaggerates the achievements of a road agency during a presentation to sound more impressive than the researched facts support. What value has ${who} failed to show?`,
      correct: "Honesty in delivery, since the content should be well-researched and truthful",
      wrong: ["Digital literacy, since the talk was still recorded", "Time management, since the talk still fit the schedule", "Respect for diverse opinions, since no one interrupted"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After the contest in ${where}, ${who} receives written feedback from classmates on how the presentation could be improved next time. What should ${who} do with this feedback?`,
      correct: "Use the constructive comments to improve future presentations",
      wrong: ["Ignore it since the presentation is already finished", "Argue with every comment received", "Delete the feedback along with the recording"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} organises key points about road construction and maintenance into a clear beginning, middle, and end before the contest. What presentation skill is this?`,
      correct: "Organising key points into a logical, easy-to-follow order",
      wrong: ["Recording the presentation for later review", "Handling questions during the Q&A session", "Selecting a sub-topic on patriotism"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} mumbles quickly through a talk in ${where}, and several classmates in the back cannot follow what is being said. What has ${who} neglected?`,
      correct: "Speaking clearly, loudly, and at a steady pace so everyone can follow",
      wrong: ["Choosing an appropriate sub-topic", "Organising a digital portfolio of recordings", "Considering audience opinions during Q&A"],
    };
  },
];

export const patriotismPresentationSkills: Skill = {
  id: "g7-il-ls-patriotism",
  code: "LS.9",
  subjectId: "indigenous-language",
  strandId: "g7-il-listening-speaking",
  grade: 7,
  title: "Patriotism: presentation skills",
  description: "Outline the issues to consider when preparing and giving a short talk on patriotism, such as the role of road agencies, and appreciate good presentation skills.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Think about what a presenter must do before speaking (choosing a focused sub-topic, organising points, rehearsing) and while speaking (eye contact, pace, handling questions).";

    if (branch === "match") {
      const chosen = shuffle(rng, PRESENTATION_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each presentation skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, PREP_ISSUES).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each issue as something to consider before a presentation, or during a presentation.",
        items,
        buckets,
        correctBucket,
        hint: "Preparation issues happen while planning; delivery issues happen while you are actually speaking to the audience.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, PRESENTATION_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of preparing and presenting a short talk on patriotism in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: PRESENTATION_STEPS.map((s) => s.id),
        hint: "Start by watching a sample and brainstorming issues, then select a sub-topic, present, record, organise the portfolio, take questions, and finally peer review.",
        explanation: PRESENTATION_STEPS.map((s) => s.label).join(" → "),
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
