import type { Skill } from "@/lib/types";
import { randChoice } from "@/lib/rng";
import { comprehensionBranch, type Passage } from "./g5ReadingShared";
import { scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 6.0 Jobs and Occupations, sub-strand 6.2 Intensive Reading:
// Comprehension Dialogues (about 400 words). Focus: select unfamiliar words, use contextual clues to
// infer meaning, direct and inferential questions, relate to own experience.
// See curriculum-reference/grade-5/english.json.

const PASSAGES: Passage[] = [
  {
    title: "At the Carpenter's Workshop",
    text: "Mueni: \"Uncle, why do you sand the wood so many times?\"\nUncle Wafula: \"To make it smooth. A rough stool gives splinters, and a customer will not come back.\"\nMueni: \"It takes so long, though.\"\nUncle Wafula: \"Patience is part of the tools of this trade. My first teacher used to say, 'A bad workman quarrels with his tools.' If the work is poor, the fault is usually mine, not the plane.\"\nMueni: \"So you never blame the saw?\"\nUncle Wafula: \"Only when it is truly blunt. Then I stop and sharpen it. That is also part of the job.\"",
    factual: [
      { q: "Why does Uncle Wafula sand the wood many times?", answer: "to make it smooth", wrong: ["to make it heavier", "to make it darker", "to make it shorter"] },
      { q: "What did his first teacher used to say?", answer: "A bad workman quarrels with his tools", wrong: ["Measure twice, cut once", "The early bird catches the worm", "Practice makes perfect"] },
      { q: "When does Uncle Wafula blame the saw?", answer: "only when it is truly blunt", wrong: ["every day", "never", "when a customer complains"] },
    ],
    inferential: [
      { q: "What does 'the tools of this trade' include, according to Uncle Wafula?", answer: "patience, not just objects like the plane", wrong: ["only the saw and the plane", "money and a shop", "helpers and customers"] },
      { q: "What kind of worker is Uncle Wafula?", answer: "careful and takes responsibility for his work", wrong: ["lazy and quick to blame others", "in a hurry to finish", "not interested in customers"] },
    ],
    mainIdea: {
      answer: "A carpenter explains that good work needs patience and honesty about your own mistakes.",
      wrong: ["A carpenter teaches a child to use a saw.", "A workshop runs out of wood.", "A customer returns a broken stool."],
    },
    vocab: [
      { word: "smooth", meaning: "having an even surface, with no rough parts", wrong: ["very heavy", "brightly painted", "broken"] },
      { word: "blunt", meaning: "not sharp", wrong: ["very sharp", "brand new", "expensive"] },
    ],
    sequence: [
      "Mueni asks why the wood is sanded so many times.",
      "Uncle Wafula explains that a rough stool loses customers.",
      "He quotes his teacher: 'A bad workman quarrels with his tools.'",
      "He says he only blames the saw when it is truly blunt, then sharpens it.",
    ],
    notInText: ["Uncle Wafula sells the stool to Mueni.", "The workshop catches fire.", "Mueni becomes a carpenter that day."],
  },
  {
    title: "The Nurse and the New Helper",
    text: "Nurse Adhiambo: \"Before you touch any patient, you wash your hands. Every time.\"\nHelper: \"Even if my hands look clean?\"\nNurse Adhiambo: \"Germs are invisible. 'Looks clean' is not the same as 'is clean'. That is the first rule here.\"\nHelper: \"And if we run out of soap?\"\nNurse Adhiambo: \"Then we use the alcohol rub, and we tell the store keeper at once. We never just skip it.\"\nHelper: \"You say that very firmly.\"\nNurse Adhiambo: \"Because a small habit here can stop a big outbreak out there.\"",
    factual: [
      { q: "What must the helper do before touching any patient?", answer: "wash their hands", wrong: ["put on gloves only", "ask the nurse", "record the time"] },
      { q: "What do they use if the soap runs out?", answer: "the alcohol rub", wrong: ["plain water only", "a dry cloth", "nothing"] },
      { q: "Who do they tell if supplies run out?", answer: "the store keeper", wrong: ["the patient", "no one", "the head teacher"] },
    ],
    inferential: [
      { q: "Why does Nurse Adhiambo say 'looks clean' is not 'is clean'?", answer: "germs are too small to see", wrong: ["the light is poor", "hands are always dirty", "the helper has bad eyesight"] },
      { q: "Why does the nurse speak so firmly about hand-washing?", answer: "she knows it can prevent a serious outbreak", wrong: ["she is angry with the helper", "she is in a hurry", "the helper is not listening"] },
    ],
    mainIdea: {
      answer: "A nurse teaches a new helper that strict hand-washing is a small habit that prevents big outbreaks.",
      wrong: ["A clinic runs out of soap and closes.", "A helper refuses to work at the clinic.", "A nurse treats a patient with a fever."],
    },
    vocab: [
      { word: "invisible", meaning: "not able to be seen", wrong: ["very large", "brightly coloured", "easy to hear"] },
      { word: "firmly", meaning: "in a strong, sure way", wrong: ["softly and unsure", "jokingly", "sleepily"] },
    ],
    sequence: [
      "Nurse Adhiambo tells the helper to wash hands before every patient.",
      "The helper asks about hands that look clean.",
      "The nurse explains that germs are invisible.",
      "She says a small habit here can stop a big outbreak.",
    ],
    notInText: ["The helper becomes a nurse.", "A patient argues with the nurse.", "The clinic is by the sea."],
  },
];

const SPEAKER_CLUE = [
  { line: "\"Patience is part of the tools of this trade.\"", tells: "The speaker values careful, unhurried work.", wrong: ["The speaker wants to finish quickly.", "The speaker dislikes their job.", "The speaker has no tools."] },
  { line: "\"A small habit here can stop a big outbreak out there.\"", tells: "The speaker understands how disease spreads and takes prevention seriously.", wrong: ["The speaker is guessing and unsure.", "The speaker thinks outbreaks cannot be stopped.", "The speaker is talking about the weather."] },
  { line: "\"If the work is poor, the fault is usually mine, not the plane.\"", tells: "The speaker takes responsibility instead of blaming their tools.", wrong: ["The speaker blames the tools for everything.", "The speaker never makes mistakes.", "The speaker wants a new plane."] },
];

export const intensiveReadingDialogue: Skill = {
  id: "g5-eng-reading-intensive-dialogue",
  code: "R.6",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Intensive Reading: Comprehension Dialogues",
  description: "Read a workplace dialogue about jobs and occupations, use contextual clues to work out word meanings, and answer direct and inferential questions about the speakers.",
  generate(rng) {
    if (rng() < 0.22) {
      const s = randChoice(rng, SPEAKER_CLUE);
      const { choices, correctIndex } = mcFromCluster(rng, s.tells, s.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `In the dialogue, a speaker says: ${s.line}`, "What does this line tell us about the speaker?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about the attitude or knowledge behind the words, not just the words themselves.",
        explanation: `${s.tells} This is an inference — you work it out from what the speaker chooses to say.`,
      };
    }
    return comprehensionBranch(rng, PASSAGES, "Use the words before and after an unknown word to work out its meaning.");
  },
};
