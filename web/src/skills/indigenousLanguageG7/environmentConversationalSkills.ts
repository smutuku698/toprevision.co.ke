import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const CONVERSATION_SKILLS: { skill: string; description: string }[] = [
  { skill: "Greeting the other person", description: "A common way to begin a conversation that shows friendliness" },
  { skill: "Asking how the other person is doing", description: "Opens a conversation politely by showing interest in the listener" },
  { skill: "Introducing yourself to a stranger", description: "Lets the other person know who they are speaking to" },
  { skill: "Stating the topic or reason for talking", description: "Begins a conversation by making its purpose clear" },
  { skill: "Thanking the other person for their time", description: "A common way to end a conversation politely" },
  { skill: "Saying goodbye", description: "Signals that the conversation is coming to a close" },
  { skill: "Summarising what was agreed or discussed", description: "Ends a conversation by confirming what both sides understood" },
  { skill: "Taking turns to speak", description: "Shows respect for the other speaker during a conversation" },
  { skill: "Listening without interrupting", description: "Allows the other speaker to finish their point before responding" },
  { skill: "Maintaining eye contact", description: "Shows attentiveness during a face-to-face conversation" },
  { skill: "Joining or starting an environmental club", description: "Shows initiative in engaging in practical environmental conservation" },
  { skill: "Using respectful language with strangers", description: "Keeps a conversation with someone new polite and comfortable" },
];

const PHRASES: { text: string; bucket: string }[] = [
  { text: "Good morning, how are you?", bucket: "Beginning a conversation" },
  { text: "Excuse me, may I talk to you for a moment?", bucket: "Beginning a conversation" },
  { text: "Hello, my name is Kip. What's yours?", bucket: "Beginning a conversation" },
  { text: "Hi there, do you have a minute to talk?", bucket: "Beginning a conversation" },
  { text: "Good afternoon, I hope you are well.", bucket: "Beginning a conversation" },
  { text: "Excuse me, I'd like to ask you something about the river.", bucket: "Beginning a conversation" },
  { text: "Thank you for your time, it was good talking to you.", bucket: "Ending a conversation" },
  { text: "It was nice talking to you, take care.", bucket: "Ending a conversation" },
  { text: "I have to go now, goodbye.", bucket: "Ending a conversation" },
  { text: "See you later, take care of yourself.", bucket: "Ending a conversation" },
  { text: "Let's talk again soon, bye for now.", bucket: "Ending a conversation" },
  { text: "Thanks again for the information, see you around.", bucket: "Ending a conversation" },
];

const CONVERSATION_STEPS: { id: string; label: string }[] = [
  { id: "watch", label: "Watch a conversation to identify common ways of beginning and ending a conversation" },
  { id: "view", label: "Use digital devices to view presentations or interviews on environmental conservation" },
  { id: "discuss", label: "Discuss the main issues focused on" },
  { id: "roleplay", label: "Role-play a face-to-face conversation between two strangers while observing etiquette" },
  { id: "pick", label: "Work jointly to pick out the key words and phrases used to begin and end a conversation" },
  { id: "club", label: "Create or join an environmental club to discuss practical ways to engage in environmental conservation" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The surroundings in which people, animals, and plants live is called the", after: ".", answer: "environment" },
  { before: "To protect and take care of something so it is not damaged or wasted means to", after: "it.", answer: "conserve" },
  { before: "The plants, animals, and physical features of the world, not made by humans, are collectively called", after: ".", answer: "nature" },
  { before: "The contamination of the environment with harmful substances is called", after: ".", answer: "pollution" },
  { before: "The clearing away of trees and forests, often for farming or building, is called", after: ".", answer: "deforestation" },
  { before: "Planting new trees in an area that previously had none is called", after: ".", answer: "afforestation" },
  { before: "People who illegally hunt or capture protected wild animals are called", after: ".", answer: "poachers" },
  { before: "Trees that naturally grow in a particular region are called", after: "trees.", answer: "indigenous" },
  { before: "A person you are meeting or speaking to for the first time is called a", after: ".", answer: "stranger" },
  { before: "The accepted rules of polite behaviour observed during a conversation are called", after: ".", answer: "etiquette" },
  { before: "Acting out an imagined conversation or situation with a partner is called a", after: ".", answer: "role-play", accepted: ["roleplay"] },
  { before: "A group formed in school or the community to discuss practical ways to protect the environment is called an environmental", after: ".", answer: "club" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} wants to ask a stranger for directions to the market. ${who} walks up and immediately asks, "Where is the market?" without any greeting. What should ${who} have done first?`,
      correct: "Begin the conversation with a greeting before asking the question",
      wrong: ["Ask the question loudly to get attention faster", "Wait silently until the stranger speaks first", "Ask several questions at once to save time"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After getting help from a stranger in ${where}, ${who} walks away without saying anything at all. What has ${who} left out?`,
      correct: "A polite way of ending the conversation, such as thanking the stranger and saying goodbye",
      wrong: ["Nothing — walking away is always an acceptable way to end a conversation", "An introduction, since one is only needed at the very end of a talk", "A full summary of the entire conversation word for word"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} watches a digital presentation on environmental conservation in ${where} but afterward can only recall the presenter's name, not what was discussed. What did ${who} fail to do?`,
      correct: "Focus on identifying and discussing the main issues raised in the presentation",
      wrong: ["Focus on remembering only the presenter's name, since that is the most important detail", "Watch the presentation again, since names are always hard to remember", "Skip discussing the presentation entirely once it has ended"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During a role-play of a face-to-face conversation between two strangers, ${who} in ${where} keeps interrupting the partner mid-sentence. What etiquette rule is ${who} breaking?`,
      correct: "Taking turns to speak and listening without interrupting",
      wrong: ["The rule that strangers should never speak to one another", "The rule that conversations must always be about the environment", "The rule that only one person may speak throughout the whole conversation"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is asked to pick out the key words and phrases used to begin and end a conversation from a watched clip. What is the best approach?`,
      correct: "Note the specific phrases used at the start and close of the conversation, not the whole clip",
      wrong: ["Write down the entire conversation word for word", "Only note phrases spoken in the middle of the conversation", "Skip this task, since beginnings and endings are not important"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} hears about an environmental club forming at school but decides not to join because "someone else will do it." What value is ${who} failing to show?`,
      correct: "Responsibility — taking a self-driven initiative to engage in environmental conservation",
      wrong: ["Unity, since joining a club is always compulsory for every learner", "Respect, since joining a club is really just a way of greeting others", "Communication, since clubs only ever involve listening to a teacher"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While discussing environmental issues raised in a presentation, ${who} in ${where} dismisses a classmate's opinion without listening to it. What value is missing here?`,
      correct: "Respect — accommodating other learners' opinions during a conversation",
      wrong: ["Responsibility, since a classmate's opinion never needs to be heard", "Unity, since disagreeing with a classmate always shows unity", "Communication, since dismissing an opinion is still a valid form of communication"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} begins a conversation with a stranger in ${where} but never explains why they stopped to talk. What key element of beginning a conversation is missing?`,
      correct: "Making the purpose of the conversation clear to the other person",
      wrong: ["A long introduction describing the speaker's whole life story", "A written transcript of everything that will be said", "A formal invitation card handed to the stranger"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} joins an environmental club, takes part in a tree-planting exercise, and encourages a friend to stop littering. What is ${who} demonstrating?`,
      correct: "Valuing the importance of conserving the environment through everyday action",
      wrong: ["Valuing club membership only, without caring about the environment itself", "Valuing conversation skills but not environmental conservation", "Showing that conservation only matters during club meetings"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} ends a conversation abruptly by walking off mid-sentence while the other person is still speaking. What should ${who} have done instead?`,
      correct: "Waited for a natural pause, then used a polite closing phrase before leaving",
      wrong: ["Interrupted even more firmly in order to leave faster", "Said nothing at all, since walking away is a valid way to end a talk", "Repeated the entire conversation once more before leaving"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} is role-playing a conversation with a stranger and uses very informal slang the stranger does not understand. What etiquette issue does this show?`,
      correct: "Not adjusting language to suit a stranger, unlike how one might speak with a close friend",
      wrong: ["Speaking too quietly for the stranger to hear", "Using too many greetings at the start of the talk", "Ending the conversation too early"],
    };
  },
];

export const environmentConversationalSkills: Skill = {
  id: "g7-il-ls-environment",
  code: "LS.4",
  subjectId: "indigenous-language",
  strandId: "g7-il-listening-speaking",
  grade: 7,
  title: "Environmental conservation: conversational skills",
  description: "Identify common ways of beginning and ending a conversation, take part respectfully in a conversation, and value environmental conservation.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Begin conversations with a greeting and a clear purpose, take turns respectfully, and close politely.";

    if (branch === "match") {
      const chosen = shuffle(rng, CONVERSATION_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each conversational skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, PHRASES).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each phrase as one used to begin a conversation or one used to end a conversation.",
        items,
        buckets,
        correctBucket,
        hint: "Beginning phrases greet or open a talk; ending phrases thank, close, or say goodbye.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, CONVERSATION_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of building conversational skills around environmental conservation in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: CONVERSATION_STEPS.map((s) => s.id),
        hint: "Start by watching a conversation, then view presentations, discuss, role-play, pick out key phrases, then join or start a club.",
        explanation: CONVERSATION_STEPS.map((s) => s.label).join(" → "),
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
