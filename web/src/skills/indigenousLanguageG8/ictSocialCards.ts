import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type CardType = "Invitation card" | "Appreciation card" | "Congratulatory card";

const CARD_TYPES: { type: CardType; purpose: string }[] = [
  { type: "Invitation card", purpose: "asks someone to attend an event, such as a wedding or a school function" },
  { type: "Appreciation card", purpose: "thanks someone for help, support, or kindness they showed" },
  { type: "Congratulatory card", purpose: "celebrates someone's achievement or good news" },
];

// Components common to a well-designed card, in a sensible top-to-bottom order.
const CARD_COMPONENTS: { id: string; label: string }[] = [
  { id: "greeting", label: "Greeting — addresses the recipient by name, e.g. 'Dear Amina,'" },
  { id: "message", label: "Main message — matched to its purpose: inviting, thanking, or congratulating" },
  { id: "detail", label: "Supporting detail — e.g. the event's date and venue, or the specific reason for thanks" },
  { id: "closing", label: "Closing — a warm sign-off and the sender's name" },
];

const SCENARIOS: { text: string; type: CardType }[] = [
  { text: "Wanjiku's neighbours helped rebuild her goat shed after the storm, and she wants to thank them", type: "Appreciation card" },
  { text: "The school is holding a netiquette workshop next Friday and wants parents to attend", type: "Invitation card" },
  { text: "Otieno just won the county chess championship and his classmates want to celebrate him", type: "Congratulatory card" },
  { text: "A youth group is opening a new digital-literacy centre and wants community elders to come to the launch", type: "Invitation card" },
  { text: "Amani's teacher guided her through a difficult ICT project, and she wants to show her gratitude", type: "Appreciation card" },
  { text: "Kiptoo passed his coding exam with the top mark in his class", type: "Congratulatory card" },
];

const MC_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "What is the main purpose of an invitation card?",
    correct: "To ask someone to attend an event",
    distractors: ["To thank someone for a gift", "To celebrate someone's achievement", "To report a piece of news"],
  },
  {
    q: "What is the main purpose of an appreciation card?",
    correct: "To thank someone for help, support, or kindness",
    distractors: ["To invite someone to a function", "To ask for information online", "To warn someone about a danger"],
  },
  {
    q: "What is the main purpose of a congratulatory card?",
    correct: "To celebrate someone's achievement or good news",
    distractors: ["To request a meeting", "To apologise for a mistake", "To advertise a product"],
  },
  {
    q: "Why is social writing, such as designing cards, important for communication?",
    correct: "It lets people express feelings like thanks, celebration, or invitation in a thoughtful, lasting way",
    distractors: ["It replaces the need for spoken conversation completely", "It is only useful for businesses, not individuals", "It has no real purpose beyond decoration"],
  },
];

export const ictSocialCards: Skill = {
  id: "g8-il-w-ict",
  code: "W.2",
  subjectId: "indigenous-language",
  strandId: "g8-il-writing",
  grade: 8,
  title: "ICT - Netiquette: Social writing - Cards",
  description: "Identify card components and choose the right type of card — invitation, appreciation, or congratulatory — for a scenario.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-scenario", "match", "categorize", "order", "fill"] as const);

    if (branch === "mc-scenario") {
      const s = randChoice(rng, SCENARIOS);
      const choices = shuffle(rng, CARD_TYPES.map((c) => c.type));
      return {
        kind: "multiple-choice",
        prompt: `${s.text}. Which type of card should be designed?`,
        choices,
        correctIndex: choices.indexOf(s.type),
        layout: "list",
        hint: "Ask whether the situation calls for inviting someone, thanking someone, or celebrating someone.",
        explanation: `A ${s.type.toLowerCase()} fits best, because it ${CARD_TYPES.find((c) => c.type === s.type)!.purpose}.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, CARD_TYPES.map((c) => ({ id: c.type, label: c.type })));
      const targets = shuffle(rng, CARD_TYPES.map((c) => ({ id: c.type, label: c.purpose })));
      const correctMap: Record<string, string> = {};
      for (const c of CARD_TYPES) correctMap[c.type] = c.type;
      return {
        kind: "click-match",
        prompt: "Match each type of card to its purpose.",
        tokens,
        targets,
        correctMap,
        hint: "Each card type matches one purpose: inviting, thanking, or congratulating.",
        explanation: CARD_TYPES.map((c) => `${c.type} — ${c.purpose}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, SCENARIOS).slice(0, 5);
      const buckets = CARD_TYPES.map((c) => ({ id: c.type, label: c.type }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each situation by the type of card it needs.",
        items,
        buckets,
        correctBucket,
        hint: "Decide if the situation is about inviting, thanking, or celebrating someone.",
        explanation: chosen.map((c) => `"${c.text}" — needs a ${c.type.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, CARD_COMPONENTS);
      return {
        kind: "ordering",
        prompt: "Arrange the components of a well-designed card in the order they typically appear.",
        instruction: "Click them in order.",
        items,
        correctOrder: CARD_COMPONENTS.map((c) => c.id),
        hint: "A card usually opens with a greeting, gives the main message, adds a supporting detail, then closes with a sign-off.",
        explanation: CARD_COMPONENTS.map((c) => c.label).join(" → "),
      };
    }

    const entry = randChoice(rng, MC_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "Each card type — invitation, appreciation, congratulatory — serves a distinct social purpose.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
