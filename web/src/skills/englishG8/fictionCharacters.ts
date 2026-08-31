import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Character {
  name: string;
  description: string;
}

interface TraitActionItem {
  text: string;
  isTrait: boolean; // true = a trait word, false = an action phrase from the story
}

interface EventItem {
  id: string;
  label: string;
}

interface Excerpt {
  title: string;
  text: string;
  characters: Character[];
  traitActionItems: TraitActionItem[];
  events: EventItem[];
  whoDidWhat: { q: string; correct: string; distractors: string[] };
}

const EXCERPTS: Excerpt[] = [
  {
    title: "The Girl Who Stopped the Fire",
    text: "When smoke rose behind the maize fields, most people in Kiptere village ran toward their homes to save their belongings. Twelve-year-old Amina ran the other way — straight to the school bell, ringing it until her arms ached. Neighbours came running, and Amina quickly organised them into a line to pass buckets of water from the river to the fire's edge. By evening, the flames were out, and only a small patch of maize had burned. Baba Juma, the respected village elder, later said that if Amina had not acted so quickly, the fire could have reached every home in Kiptere.",
    characters: [
      { name: "Amina", description: "The twelve-year-old who rang the school bell and organised the bucket line to fight the fire" },
      { name: "Baba Juma", description: "The respected elder who credited Amina with saving the village" },
    ],
    traitActionItems: [
      { text: "Brave", isTrait: true },
      { text: "Quick-thinking", isTrait: true },
      { text: "Ran to the school bell and rang it until her arms ached", isTrait: false },
      { text: "Organised neighbours into a line to pass buckets of water", isTrait: false },
    ],
    events: [
      { id: "e1", label: "Smoke rises behind the maize fields" },
      { id: "e2", label: "Amina runs to the school bell and rings it" },
      { id: "e3", label: "Neighbours organise into a line, passing buckets of water" },
      { id: "e4", label: "The flames are put out by evening" },
    ],
    whoDidWhat: {
      q: "Who organised the neighbours into a line to fight the fire?",
      correct: "Amina",
      distractors: ["Baba Juma", "The maize farmers", "The school head teacher"],
    },
  },
  {
    title: "The Boy Who Rebuilt the Well",
    text: "For three months, the only well in Sokoni sub-location produced nothing but a trickle of muddy water. Families walked two hours each way to fetch clean water from the next village. Sixteen-year-old Otieno, who had watched his uncle repair machines at the market, offered to look at the well's old pump. Elders doubted a boy could fix what two technicians had failed to repair, but Otieno studied the pump for days, cleaned out a blocked pipe, and replaced a worn washer he made himself from spare rubber. When clean water finally gushed out, the whole sub-location gathered to celebrate, and people began calling him 'Otieno the Engineer.'",
    characters: [
      { name: "Otieno", description: "The sixteen-year-old who studied and repaired the broken well pump himself" },
      { name: "The elders", description: "The villagers who doubted a boy could fix what two technicians had failed to repair" },
    ],
    traitActionItems: [
      { text: "Resourceful", isTrait: true },
      { text: "Persistent", isTrait: true },
      { text: "Studied the pump for days and cleaned out a blocked pipe", isTrait: false },
      { text: "Made a new washer himself from spare rubber", isTrait: false },
    ],
    events: [
      { id: "e1", label: "The well produces only muddy water and families must walk far for water" },
      { id: "e2", label: "Otieno offers to examine the old pump despite the elders' doubt" },
      { id: "e3", label: "Otieno studies the pump, cleans the pipe, and makes a new washer" },
      { id: "e4", label: "Clean water gushes out and the sub-location celebrates" },
    ],
    whoDidWhat: {
      q: "Who fixed the broken well pump in Sokoni sub-location?",
      correct: "Otieno",
      distractors: ["The two technicians", "The village elders", "Otieno's uncle"],
    },
  },
  {
    title: "The Chief Who Chose Peace",
    text: "Two clans in Mwangaza had quarrelled for years over grazing land, and some young men were already sharpening spears. Chief Nasirian called both sides to a meeting under the fig tree and listened, without interrupting, as each elder explained their grievance for nearly two hours. Instead of favouring her own clan, Nasirian proposed a rotation system so that both herds could graze the disputed land in different seasons. Some grumbled at first, but within a year, the rotation was working so well that the two clans held a joint harvest festival. People still say Nasirian's patience saved Mwangaza from war.",
    characters: [
      { name: "Chief Nasirian", description: "The chief who listened patiently and proposed a fair grazing rotation to end the dispute" },
      { name: "The young men", description: "Those who were already sharpening spears before the chief intervened" },
    ],
    traitActionItems: [
      { text: "Patient", isTrait: true },
      { text: "Fair", isTrait: true },
      { text: "Listened without interrupting for nearly two hours", isTrait: false },
      { text: "Proposed a rotation system instead of favouring her own clan", isTrait: false },
    ],
    events: [
      { id: "e1", label: "Two clans quarrel for years over grazing land" },
      { id: "e2", label: "Chief Nasirian calls both sides to a meeting under the fig tree" },
      { id: "e3", label: "She proposes a rotation system for grazing the disputed land" },
      { id: "e4", label: "The clans hold a joint harvest festival within a year" },
    ],
    whoDidWhat: {
      q: "Who proposed the rotation system that ended the grazing dispute?",
      correct: "Chief Nasirian",
      distractors: ["The young men", "One of the quarrelling elders", "A visiting government officer"],
    },
  },
];

export const fictionCharacters: Skill = {
  id: "g8-eng-r-fiction-characters",
  code: "R.17",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Extensive Reading: Grade Appropriate Fiction Materials - Characters",
  description: "Identify characters in short fiction excerpts about African heroes and heroines, and describe their traits using evidence from the text.",
  generate(rng) {
    const excerpt = randChoice(rng, EXCERPTS);
    const branch = randChoice(rng, ["match", "categorize", "order", "mc-who", "mc-trait"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, excerpt.characters.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, excerpt.characters.map((c) => ({ id: c.name, label: c.description })));
      const correctMap: Record<string, string> = {};
      for (const c of excerpt.characters) correctMap[c.name] = c.name;
      return {
        kind: "click-match",
        passage: excerpt.text,
        prompt: `Match each character in "${excerpt.title}" to their description.`,
        tokens,
        targets,
        correctMap,
        hint: "Look for what each character does and how others react to them in the story.",
        explanation: excerpt.characters.map((c) => `${c.name} — ${c.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = shuffle(rng, excerpt.traitActionItems).map((c, i) => ({ id: `t${i}`, label: c.text, isTrait: c.isTrait }));
      const correctBucket: Record<string, string> = {};
      items.forEach((c) => (correctBucket[c.id] = c.isTrait ? "trait" : "action"));
      return {
        kind: "categorize",
        passage: excerpt.text,
        prompt: "Sort each item into Trait (a word describing character) or Action (something the character did).",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "trait", label: "Trait" },
          { id: "action", label: "Action" },
        ],
        correctBucket,
        hint: "A trait is a single describing word, like 'brave'; an action is something the character actually did in the story.",
        explanation: items.map((c) => `"${c.label}" is a${c.isTrait ? " trait" : "n action"}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, excerpt.events);
      return {
        kind: "ordering",
        prompt: `Arrange the events of "${excerpt.title}" in the correct order.`,
        instruction: "Click them in order.",
        passage: excerpt.text,
        items,
        correctOrder: excerpt.events.map((e) => e.id),
        hint: "Follow how the problem develops and is finally resolved in the story.",
        explanation: excerpt.events.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "mc-who") {
      const choices = shuffle(rng, [excerpt.whoDidWhat.correct, ...excerpt.whoDidWhat.distractors]);
      return {
        kind: "multiple-choice",
        passage: excerpt.text,
        prompt: excerpt.whoDidWhat.q,
        choices,
        correctIndex: choices.indexOf(excerpt.whoDidWhat.correct),
        layout: "list",
        hint: "Reread the passage and find who is described as performing this specific action.",
        explanation: `The correct answer is "${excerpt.whoDidWhat.correct}".`,
      };
    }

    const mainChar = excerpt.characters[0];
    const traitWords = excerpt.traitActionItems.filter((t) => t.isTrait).map((t) => t.text);
    const correctTrait = randChoice(rng, traitWords);
    const otherExcerptTraits = EXCERPTS.filter((e) => e !== excerpt)
      .flatMap((e) => e.traitActionItems.filter((t) => t.isTrait).map((t) => t.text));
    const distractors = shuffle(rng, Array.from(new Set(otherExcerptTraits))).slice(0, 3);
    const choices = shuffle(rng, [correctTrait, ...distractors]);
    return {
      kind: "multiple-choice",
      passage: excerpt.text,
      prompt: `Based on the passage, which trait best describes ${mainChar.name}?`,
      choices,
      correctIndex: choices.indexOf(correctTrait),
      layout: "list",
      hint: "Look at what the character does in the story, then choose the single word that best sums up that quality.",
      explanation: `"${correctTrait}" best describes ${mainChar.name}, shown by their actions in the passage: ${mainChar.description.toLowerCase()}.`,
    };
  },
};
