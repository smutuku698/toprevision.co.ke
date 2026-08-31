import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Device = "simile" | "metaphor" | "personification" | "alliteration" | "onomatopoeia" | "hyperbole";

const DEVICE_LABELS: Record<Device, string> = {
  simile: "Simile",
  metaphor: "Metaphor",
  personification: "Personification",
  alliteration: "Alliteration",
  onomatopoeia: "Onomatopoeia",
  hyperbole: "Hyperbole",
};

const DEVICE_CLUES: Record<Device, string> = {
  simile: "Compares two unlike things using 'like' or 'as'",
  metaphor: "Directly says one thing IS another, without 'like' or 'as'",
  personification: "Gives human qualities or actions to something non-human",
  alliteration: "Repeats the same starting sound across nearby words",
  onomatopoeia: "Uses a word that imitates the actual sound it describes",
  hyperbole: "Uses obvious, extreme exaggeration not meant literally",
};

const LINES: { line: string; device: Device; why: string }[] = [
  {
    line: "The old man's hands were as rough as tree bark.",
    device: "simile",
    why: "It directly compares two unlike things using 'as ... as' — that comparison word is what makes it a simile, not a metaphor.",
  },
  {
    line: "Her voice was like a bell ringing across the valley.",
    device: "simile",
    why: "It compares her voice to a bell using the word 'like' — a simile always uses 'like' or 'as' to compare.",
  },
  {
    line: "The classroom was a zoo during the lunch break.",
    device: "metaphor",
    why: "It describes the classroom as being a zoo directly, without using 'like' or 'as' — that direct comparison is a metaphor.",
  },
  {
    line: "Time is a thief that steals our youth.",
    device: "metaphor",
    why: "It states directly that time IS a thief, without 'like' or 'as' — a direct identification like this is a metaphor.",
  },
  {
    line: "The wind whispered secrets through the maize field.",
    device: "personification",
    why: "The wind (a non-human thing) is given the human action of 'whispering' — giving human qualities to something non-human is personification.",
  },
  {
    line: "The old car groaned as it climbed the hill.",
    device: "personification",
    why: "The car is given the human trait of 'groaning' — describing an object as if it can express itself like a person is personification.",
  },
  {
    line: "The soft sand slipped silently between her toes.",
    device: "alliteration",
    why: "Several nearby words start with the same 's' sound ('soft', 'sand', 'slipped', 'silently') — that repeated starting sound is alliteration.",
  },
  {
    line: "Busy bees buzzed beside the blooming flowers.",
    device: "alliteration",
    why: "Several nearby words start with the same 'b' sound ('busy', 'bees', 'buzzed', 'beside', 'blooming') — that repetition is alliteration.",
  },
  {
    line: "The tin roof went clatter-clatter in the storm.",
    device: "onomatopoeia",
    why: "'Clatter-clatter' is a word that imitates the actual sound it describes — that's onomatopoeia.",
  },
  {
    line: "The bacon sizzled loudly in the hot pan.",
    device: "onomatopoeia",
    why: "'Sizzled' imitates the actual sound the bacon makes — a word that sounds like what it describes is onomatopoeia.",
  },
  {
    line: "I've told you a million times to close the gate!",
    device: "hyperbole",
    why: "'A million times' is an obvious, extreme exaggeration not meant literally — that overstatement for effect is hyperbole.",
  },
  {
    line: "He was so hungry he could eat an entire cow.",
    device: "hyperbole",
    why: "No one can literally eat an entire cow — this extreme exaggeration to emphasize hunger is hyperbole.",
  },
];

export const poetryDevices: Skill = {
  id: "eng-r-poetry",
  code: "R.3",
  subjectId: "english",
  strandId: "eng-reading",
  grade: 9,
  title: "Poetic and figurative language devices",
  description: "Identify the literary device used in a line of poetry: simile, metaphor, personification, alliteration, onomatopoeia, or hyperbole.",
  generate(rng) {
    const hint = "Look for comparison words ('like'/'as'), human qualities given to objects, repeated sounds, sound-imitating words, or extreme exaggeration.";

    if (rng() < 0.4) {
      const devices = Object.keys(DEVICE_LABELS) as Device[];
      const tokens = shuffle(rng, devices.map((d) => ({ id: d, label: DEVICE_LABELS[d] })));
      const targets = shuffle(rng, devices.map((d) => ({ id: d, label: DEVICE_CLUES[d] })));
      const correctMap: Record<string, string> = {};
      for (const d of devices) correctMap[d] = d;

      return {
        kind: "click-match",
        prompt: "Match each literary device to how it works.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: devices.map((d) => `${DEVICE_LABELS[d]} — ${DEVICE_CLUES[d].toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, LINES);
    const correctLabel = DEVICE_LABELS[entry.device];
    const choices = shuffle(rng, Object.values(DEVICE_LABELS));

    return {
      kind: "multiple-choice",
      passage: entry.line,
      prompt: "Which literary device is used in this line?",
      choices,
      correctIndex: choices.indexOf(correctLabel),
      layout: "grid",
      hint,
      explanation: entry.why,
    };
  },
};
