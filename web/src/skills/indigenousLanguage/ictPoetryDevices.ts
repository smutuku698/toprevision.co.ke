import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Device = "rhyme" | "metaphor" | "simile" | "repetition";

const DEVICE_LABELS: Record<Device, string> = {
  rhyme: "Rhyme",
  metaphor: "Metaphor",
  simile: "Simile",
  repetition: "Repetition",
};

const DEVICE_CLUES: Record<Device, string> = {
  rhyme: "Line endings share the same sound",
  metaphor: "Directly says one thing IS another, without 'like' or 'as'",
  simile: "Compares two unlike things using 'like' or 'as'",
  repetition: "The same word or phrase is repeated for emphasis",
};

const LINES: { line: string; device: Device; why: string }[] = [
  {
    line: "A weak password is an open door, / left unlocked for a thief to explore.",
    device: "rhyme",
    why: "\"Door\" and \"explore\" share the same ending sound — that matching sound at the end of lines is rhyme.",
  },
  {
    line: "Type it slow, or type it fast, / a strong password is built to last.",
    device: "rhyme",
    why: "\"Fast\" and \"last\" share the same ending sound — that matching sound is rhyme.",
  },
  {
    line: "The internet is a vast ocean of information.",
    device: "metaphor",
    why: "It directly states the internet IS an ocean, without 'like' or 'as' — that direct identification is a metaphor.",
  },
  {
    line: "A computer virus is a silent thief in the machine.",
    device: "metaphor",
    why: "It directly calls a virus a thief, without 'like' or 'as' — a direct comparison like this is a metaphor.",
  },
  {
    line: "A phishing email spreads like wildfire through inboxes.",
    device: "simile",
    why: "It compares the spread of a phishing email to wildfire using the word 'like' — a simile always uses 'like' or 'as'.",
  },
  {
    line: "Her password was as weak as wet paper.",
    device: "simile",
    why: "It compares the password to wet paper using 'as ... as' — that comparison word makes it a simile.",
  },
  {
    line: "Click carefully, click carefully, before you click at all.",
    device: "repetition",
    why: "\"Click carefully\" is repeated for emphasis — repeating the same phrase like this is repetition.",
  },
  {
    line: "Stay safe online, stay safe always, stay safe forever.",
    device: "repetition",
    why: "\"Stay safe\" is repeated across the line for emphasis — that repeated phrase is repetition.",
  },
];

export const ictPoetryDevices: Skill = {
  id: "il-r-ict-poetry-devices",
  code: "R.2",
  subjectId: "indigenous-language",
  strandId: "il-reading",
  grade: 9,
  title: "ICT & cyber security: poetic devices",
  description: "Identify the literary device — rhyme, metaphor, simile, or repetition — used in a line of poetry on the cyber-security theme.",
  generate(rng) {
    const hint = "Look for matching end sounds, comparison words ('like'/'as'), a direct 'is' comparison, or a repeated phrase.";

    if (rng() < 0.4) {
      const devices = Object.keys(DEVICE_LABELS) as Device[];
      const tokens = shuffle(rng, devices.map((d) => ({ id: d, label: DEVICE_LABELS[d] })));
      const targets = shuffle(rng, devices.map((d) => ({ id: d, label: DEVICE_CLUES[d] })));
      const correctMap: Record<string, string> = {};
      for (const d of devices) correctMap[d] = d;

      return {
        kind: "click-match",
        prompt: "Match each poetic device to how it works.",
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
