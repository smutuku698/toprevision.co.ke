import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const DIALOGUE_FEATURES: { feature: string; description: string }[] = [
  { feature: "Speaker labels", description: "Showing clearly who is speaking at each turn, for example by naming the character" },
  { feature: "Natural exchange", description: "A back-and-forth conversation that flows naturally between the characters" },
  { feature: "Clear characters", description: "Distinct characters whose feelings and opinions come through their word choice" },
  { feature: "Setting or context", description: "A clear time, place, or situation in which the dialogue takes place" },
  { feature: "Purposeful topic", description: "A conversation that stays focused on a clear topic, such as environmental conservation" },
  { feature: "Realistic language", description: "Words and expressions that suit how the characters would naturally speak" },
  { feature: "Punctuation for speech", description: "Correct use of quotation marks or a new line for each speaker's turn" },
  { feature: "Resolution or point", description: "A conversation that reaches some kind of conclusion, agreement, or realisation" },
  { feature: "Imaginative content", description: "Original, creative ideas rather than a copy of an existing dialogue" },
  { feature: "Peer-reviewed structure", description: "A dialogue whose structure has been outlined and reviewed with peers before writing" },
  { feature: "Role-play readiness", description: "A dialogue written so that it can be performed aloud by two or more people" },
  { feature: "Respectful exchange", description: "A tone of respectful conversation, even when the characters disagree" },
];

const WRITING_PRACTICES: { text: string; bucket: string }[] = [
  { text: "Clearly labelling which character is speaking at each turn", bucket: "Good dialogue writing practice" },
  { text: "Giving each character a distinct way of speaking that fits their personality", bucket: "Good dialogue writing practice" },
  { text: "Setting the dialogue within a clear situation, such as two friends discussing river pollution", bucket: "Good dialogue writing practice" },
  { text: "Using quotation marks or a new line to separate each speaker's turn", bucket: "Good dialogue writing practice" },
  { text: "Ending the dialogue with a resolution or realisation about environmental conservation", bucket: "Good dialogue writing practice" },
  { text: "Reviewing the dialogue's structure with peers before writing the full version", bucket: "Good dialogue writing practice" },
  { text: "Writing pages of dialogue with no indication of who is speaking", bucket: "Poor dialogue writing practice" },
  { text: "Making every character speak in exactly the same way, with no personality", bucket: "Poor dialogue writing practice" },
  { text: "Copying a dialogue found online instead of composing an original one", bucket: "Poor dialogue writing practice" },
  { text: "Leaving the dialogue with no clear ending or point", bucket: "Poor dialogue writing practice" },
  { text: "Skipping peer review because the draft already feels good enough", bucket: "Poor dialogue writing practice" },
  { text: "Straying from environmental conservation into unrelated events with no connection back", bucket: "Poor dialogue writing practice" },
];

const WRITING_STEPS: { id: string; label: string }[] = [
  { id: "search", label: "Search electronic and library sources for imaginative dialogues" },
  { id: "watch", label: "Watch or read the dialogues and discuss their features" },
  { id: "outline", label: "Work with peers to develop an outline of the structure of a good dialogue on a chart" },
  { id: "write", label: "Write a simple imaginative dialogue on environmental conservation" },
  { id: "share", label: "Share the written dialogues with peers for review" },
  { id: "roleplay", label: "Role play the dialogue with peers in class" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The surroundings in which people, animals, and plants live is called the", after: ".", answer: "environment" },
  { before: "To protect and take care of something so it is not damaged or wasted means to", after: "it.", answer: "conserve" },
  { before: "A written conversation between two or more characters is called a", after: ".", answer: "dialogue" },
  { before: "A dialogue that uses original, creative ideas rather than copying an existing one is called an", after: "dialogue.", answer: "imaginative" },
  { before: "A structured plan showing the parts of a good dialogue, developed on a chart, is called an", after: ".", answer: "outline" },
  { before: "Acting out a written dialogue aloud with peers in class is called a", after: ".", answer: "role-play", accepted: ["roleplay"] },
  { before: "Planting new trees in an area that previously had none is called", after: ".", answer: "afforestation" },
  { before: "The clearing away of trees and forests, often for farming or building, is called", after: ".", answer: "deforestation" },
  { before: "People who illegally hunt or capture protected wild animals are called", after: ".", answer: "poachers" },
  { before: "The contamination of the environment with harmful substances is called", after: ".", answer: "pollution" },
  { before: "Trees that naturally grow in a particular region are called", after: "trees.", answer: "indigenous" },
  { before: "Sharing a written dialogue with classmates so they can give feedback before it is finalised is called", after: ".", answer: "peer review", accepted: ["peer-review"] },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes an imaginative dialogue on environmental conservation as one long paragraph, without showing who is speaking at each turn. What should ${who} do to fix this?`,
      correct: "Ensure each speaker's turn is clearly labelled or given a new line",
      wrong: ["Combine every character's words into a single unlabelled paragraph, since it saves space", "Remove punctuation entirely so the dialogue flows faster", "Write only one character's lines and leave the other's responses to be guessed"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} finds a dialogue online, copies it exactly, and submits it as an imaginative dialogue on environmental conservation. What is missing?`,
      correct: "Original, creative ideas — an imaginative dialogue should be composed, not copied",
      wrong: ["Nothing — copying an existing dialogue is an accepted shortcut", "A longer dialogue, since length is the only requirement", "A dialogue about a completely unrelated topic instead"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `In ${who}'s dialogue about environmental conservation in ${where}, both characters use identical words and the same tone throughout. What feature of a well-written dialogue is missing?`,
      correct: "Distinct characters whose personalities come through their own word choice",
      wrong: ["A setting, since personality has nothing to do with the characters", "Punctuation, since identical speech is really a punctuation issue", "A topic, since the dialogue already focuses on the environment"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} finishes writing a dialogue on environmental conservation and submits it immediately without sharing it with any classmate. What step in the writing process has ${who} skipped?`,
      correct: "Sharing the written dialogue with peers for review before finalising it",
      wrong: ["Searching for sample dialogues, which only happens after writing", "Role-playing the dialogue, which must always happen before writing", "Outlining the dialogue's structure, which is not part of writing a dialogue"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} begins a dialogue about river pollution in ${where}, but by the end the characters are discussing an unrelated football match with no connection back to the environment. What has gone wrong?`,
      correct: "The dialogue has strayed from its purposeful topic of environmental conservation",
      wrong: ["Nothing — dialogues are allowed to discuss anything by the end", "The characters have shown good use of realistic language", "The dialogue has successfully reached a resolution"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Before writing a dialogue on environmental conservation, ${who}'s group in ${where} first develops an outline of the dialogue's structure on a chart. Why is this step useful?`,
      correct: "It gives the writing a clear structure to follow, based on features discussed as a group",
      wrong: ["It replaces the need to actually write the dialogue afterward", "It is only useful for dialogues that will never be performed", "It removes the need to include any characters at all"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s dialogue about environmental conservation in ${where} simply stops mid-conversation, with no agreement, resolution, or realisation reached. What is missing?`,
      correct: "A clear resolution or point that the conversation reaches",
      wrong: ["A setting, since the location was already stated at the start", "Punctuation, since the dialogue already uses quotation marks", "A topic, since environmental conservation was already mentioned"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After writing and reviewing a dialogue on environmental conservation, ${who}'s class in ${where} performs it aloud in pairs. What does this final step help achieve?`,
      correct: "Brings the written dialogue to life and checks that it works when spoken aloud",
      wrong: ["Replaces the need to have written the dialogue at all", "Is only useful if the dialogue has no characters", "Removes the need for the earlier peer review step"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `Before composing an original dialogue, ${who} in ${where} first searches library and electronic sources for sample imaginative dialogues to study. What is the purpose of this step?`,
      correct: "To discuss and understand the features of a well-written dialogue before composing one",
      wrong: ["To find a dialogue to copy directly instead of writing an original one", "To avoid having to write a dialogue at all", "To choose a topic unrelated to environmental conservation"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `In ${who}'s dialogue, two characters in ${where} disagree about how to stop deforestation but continue speaking respectfully and reach a shared plan. What does this dialogue promote?`,
      correct: "Peaceful, respectful exchange even when characters disagree",
      wrong: ["The idea that disagreement should always be avoided in a dialogue", "The idea that characters must always agree from the very first line", "The idea that respectful language becomes unnecessary once characters disagree"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} writes a dialogue between two characters, using quotation marks and a new line for each speaker's turn. What feature of a well-written dialogue has ${who} applied?`,
      correct: "Correct punctuation and formatting to clearly separate each speaker's turn",
      wrong: ["An outline, since punctuation and outlining are the same thing", "A resolution, since punctuation always signals the ending", "Realistic language, since punctuation has nothing to do with formatting"],
    };
  },
];

export const environmentDialogueWriting: Skill = {
  id: "g7-il-w-environment",
  code: "W.4",
  subjectId: "indigenous-language",
  strandId: "g7-il-writing",
  grade: 7,
  title: "Environmental conservation: creative writing (dialogue)",
  description: "Outline the features of a well-written dialogue and compose an imaginative dialogue on environmental conservation.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A good dialogue labels its speakers, gives them distinct voices, stays on topic, and reaches a clear point.";

    if (branch === "match") {
      const chosen = shuffle(rng, DIALOGUE_FEATURES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.feature, label: s.feature })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.feature, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.feature] = s.feature;
      return {
        kind: "click-match",
        prompt: "Match each feature of a well-written dialogue to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.feature} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, WRITING_PRACTICES).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each writing habit as good or poor dialogue writing practice.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the habit helps the reader follow who is speaking, stay on topic, and reach a clear point.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, WRITING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of writing an imaginative dialogue on environmental conservation in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: WRITING_STEPS.map((s) => s.id),
        hint: "Start by searching for samples, then watch/discuss, outline, write, share for review, and finally role play.",
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
