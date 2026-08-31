import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const NARRATIVE_FEATURES: { feature: string; description: string }[] = [
  { feature: "Title", description: "A short heading that captures what the narrative is about" },
  { feature: "Setting", description: "Where and when the events in the narrative take place" },
  { feature: "Characters", description: "The people, or animals, that the narrative is about" },
  { feature: "Plot", description: "The sequence of events that make up the story" },
  { feature: "Chronological order", description: "Arranging events in the order in which they actually happened" },
  { feature: "Climax", description: "The most exciting or important turning point in the story" },
  { feature: "Resolution", description: "How the events of the narrative are settled or concluded" },
  { feature: "Point of view", description: "Whether the narrative is told using \"I\" or as an outside observer" },
  { feature: "Dialogue", description: "Words spoken between characters in the narrative" },
  { feature: "Descriptive language", description: "Vivid words and phrases that help the reader picture the events" },
  { feature: "Theme or lesson", description: "The underlying message or lesson the narrative communicates" },
  { feature: "Conclusion", description: "The final part of the narrative that wraps up the events" },
];

const NARRATIVE_EXCERPTS: { text: string; bucket: string }[] = [
  { text: "The story begins on a cool morning during the school's cultural diversity week in Machakos.", bucket: "Setting" },
  { text: "The narrative is set at a community hall decorated with flags from different ethnic groups.", bucket: "Setting" },
  { text: "Wanjiru and her pen pal Nasirumbi are the two main characters in the narrative.", bucket: "Characters" },
  { text: "An elder from a neighbouring community appears midway through the story to share a proverb.", bucket: "Characters" },
  { text: "At first, Wanjiru feels shy about trying food from a culture different from her own.", bucket: "Plot event" },
  { text: "The two friends decide to exchange traditional songs from their own communities.", bucket: "Plot event" },
  { text: "\"Would you like to learn my community's greeting?\" Nasirumbi asked.", bucket: "Dialogue" },
  { text: "\"I never knew your community celebrated the harvest this way,\" Wanjiru said.", bucket: "Dialogue" },
  { text: "Just as the two communities were about to perform separately, the children suggested performing together instead.", bucket: "Climax" },
  { text: "The moment the mixed cultural performance began, the whole hall fell silent in surprise.", bucket: "Climax" },
  { text: "By the end of the day, the two communities agreed to hold the cultural exhibition together every year.", bucket: "Resolution" },
  { text: "The story ends with Wanjiru and Nasirumbi promising to keep learning about each other's cultures.", bucket: "Resolution" },
];

const NARRATIVE_STEPS: { id: string; label: string }[] = [
  { id: "narrate", label: "Take turns to narrate accounts of social events that they attended" },
  { id: "outline", label: "Work jointly to outline key features of a narrative from a sample on a chart" },
  { id: "discuss", label: "Discuss the features of a narrative" },
  { id: "compose", label: "Compose a simple narrative about the theme of cultural diversity and read it to peers for review" },
  { id: "portfolio", label: "Keep the narrative created in the portfolio" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The heading that captures what a narrative composition is about is called its", after: ".", answer: "title" },
  { before: "Where and when the events of a narrative take place is called the", after: ".", answer: "setting" },
  { before: "The people or animals that a narrative is about are called its", after: ".", answer: "characters" },
  { before: "The sequence of events that make up a story is called its", after: ".", answer: "plot" },
  { before: "Arranging events in the order in which they actually happened is called", after: "order.", answer: "chronological" },
  { before: "The most exciting or important turning point in a narrative is called the", after: ".", answer: "climax" },
  { before: "How the events of a narrative are settled or concluded is called the", after: ".", answer: "resolution" },
  { before: "Words spoken between characters in a narrative are called", after: ".", answer: "dialogue" },
  { before: "Telling a narrative using \"I\" is writing from the first-person point of", after: ".", answer: "view" },
  { before: "The underlying message or lesson a narrative communicates is called its", after: ".", answer: "theme", accepted: ["lesson", "moral"] },
  { before: "A composed narrative kept together with other written work over time is stored in a", after: ".", answer: "portfolio" },
  { before: "Sharing an account of a real social event you attended, told in the order it happened, is a simple form of", after: "writing.", answer: "narrative" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} narrates a cultural diversity event by jumping straight to the ending, then going back to explain how it started, then to the middle. What feature of a narrative has ${who} left out?`,
      correct: "Chronological order — arranging events in the order they happened",
      wrong: ["Dialogue — words spoken between characters", "Setting — where and when the events happened", "A title for the narrative"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s narrative about a cultural festival in ${where} names the two friends involved and describes what they did, but never says where or when the event took place. What is missing?`,
      correct: "The setting — where and when the events take place",
      wrong: ["The characters — who the narrative is about", "The climax — the most important turning point", "Dialogue — words spoken between characters"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes several paragraphs listing facts about Kenya's different ethnic communities, but never tells a story about specific people or events. What has ${who} mistaken the narrative for?`,
      correct: "An expository composition — a text that explains facts, rather than a narrative that tells a story",
      wrong: ["A narrative that simply uses too much dialogue", "A narrative that is missing only a title", "A narrative that has too clear a chronological order"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s narrative about two communities in ${where} builds up to the moment they decide to hold a cultural celebration together, but the composition stops right there without saying what finally happened. What feature is missing?`,
      correct: "The resolution — how the events of the narrative are settled or concluded",
      wrong: ["The climax — the most exciting turning point", "The setting — where the story takes place", "The characters — who the story is about"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s narrative about a cultural exchange in ${where} never includes any spoken words between the two characters, which makes it feel flat during peer review. What could ${who} add to improve it?`,
      correct: "Dialogue — words spoken between the characters",
      wrong: ["A different setting for the whole story", "A completely different plot", "A shorter title"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During peer review in ${where}, a classmate tells ${who} that the events of the narrative feel confusing and hard to follow. What should ${who} check first?`,
      correct: "Whether the events are arranged in chronological order",
      wrong: ["Whether the narrative has a title at all", "Whether the characters have Kenyan names", "Whether the narrative is written in pencil or pen"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After writing a narrative about attending a cultural celebration in ${where}, ${who} is asked why narratives are a useful channel of communication. What is the best answer?`,
      correct: "A narrative lets the writer share personal experiences and lessons with others in an engaging way",
      wrong: ["Narratives are only useful for entertainment and never communicate real information", "Narratives cannot be understood by anyone outside the writer's own community", "Narratives are less useful than lists of facts for sharing experiences"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While reviewing a classmate's narrative about cultural diversity in ${where}, ${who} only points out mistakes harshly without suggesting how to improve them. What value has ${who} failed to show?`,
      correct: "Respect — giving constructive comments during narrative review",
      wrong: ["Creativity, since harsh comments show imagination", "Self-efficacy, since criticism shows confidence", "Citizenship, since any feedback helps the class"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} finishes writing a narrative about a cultural diversity celebration in ${where} but forgets to give it a short heading before submitting it. What has ${who} left out?`,
      correct: "A title — a short heading that captures what the narrative is about",
      wrong: ["A setting — where and when the events took place", "A resolution — how the events were concluded", "A theme — the underlying lesson of the story"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s narrative about a cultural exchange in ${where} is written using words like "he" and "she" about the two characters, rather than "I". What point of view is this?`,
      correct: "Third-person point of view — told as an outside observer",
      wrong: ["First-person point of view — told using \"I\"", "No point of view at all", "A point of view that changes with every sentence"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After reading the narrative aloud to peers for review, ${who} in ${where} keeps the finished composition together with other written work from the term. Why is this final step useful?`,
      correct: "It preserves the composition in a portfolio so it can be revisited and tracked over time",
      wrong: ["It is unnecessary once the narrative has been read aloud once", "It replaces the need for peer review altogether", "It means the narrative no longer needs a title or setting"],
    };
  },
];

export const culturalDiversityNarrativeWriting: Skill = {
  id: "g7-il-w-cultural-diversity",
  code: "W.5",
  subjectId: "indigenous-language",
  strandId: "g7-il-writing",
  grade: 7,
  title: "Cultural diversity: narrative composition",
  description: "Identify the features of a narrative composition and write a narrative on the theme of cultural diversity as a channel of communication.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A narrative needs a setting, characters, a plot told in chronological order, a climax, and a resolution.";

    if (branch === "match") {
      const chosen = shuffle(rng, NARRATIVE_FEATURES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.feature, label: s.feature })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.feature, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.feature] = s.feature;
      return {
        kind: "click-match",
        prompt: "Match each feature of a narrative composition to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.feature} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, NARRATIVE_EXCERPTS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `n${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`n${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each line from a narrative composition into the feature it represents.",
        items,
        buckets,
        correctBucket,
        hint: "Ask whether the line tells you where/when, who, what happened, spoken words, the turning point, or how things ended.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, NARRATIVE_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of learning to write a narrative composition on cultural diversity in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: NARRATIVE_STEPS.map((s) => s.id),
        hint: "Start by narrating an event you attended, then outline and discuss narrative features, compose the narrative and get peer review, then keep it in the portfolio.",
        explanation: NARRATIVE_STEPS.map((s) => s.label).join(" → "),
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
