import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames } from "./sharedG10";

// KICD Grade 10 Music and Dance, sub-strand 1.6 "Music Notation Software" — the one sub-strand
// across the whole design where digital-literacy/software mechanics genuinely ARE the graded
// content (Strand 1.0 rubric grades "Navigate software", "Transcribe music", "Save music files"
// as three separate sub-skills). Content: navigating software (opening, keying, playback, saving,
// editing), transcribing scales/melodies/intervals/two-part harmony, and saving in midi/print/
// audio formats — all named items implemented below.
//
// No VisualSpec represents a notation-software interface or a saved-file icon, so this skill is
// entirely text/scenario based — a deliberate, documented skip, not an oversight.

interface NavAction {
  id: string;
  label: string;
  def: string;
}

const NAV_ACTIONS: NavAction[] = [
  { id: "opening", label: "Opening", def: "Opening the software or a saved file to begin or continue working on a composition" },
  { id: "keying", label: "Keying in", def: "Keying in music by entering notes, rests, and other symbols onto the stave" },
  { id: "playback", label: "Playing back", def: "Playing back the entered music to hear how it actually sounds" },
  { id: "saving", label: "Saving", def: "Saving the file so the work is not lost and can be reopened later" },
  { id: "editing", label: "Editing", def: "Editing keyed-in music by correcting, moving, or changing notes and symbols already entered" },
];

interface FormatFact {
  text: string;
  format: "midi" | "print" | "audio";
}

const FORMAT_FACTS: FormatFact[] = [
  { text: "Stores the actual note, timing, and dynamics data, so other notation software can open and continue editing it", format: "midi" },
  { text: "Lets a piece keyed in on one computer be reopened and edited note-by-note on a different computer", format: "midi" },
  { text: "Does not contain a finished, playable recording — it needs software to interpret the stored note data before it can be heard", format: "midi" },
  { text: "The preferred format for sharing a composition with someone who needs to keep editing the actual notes", format: "midi" },
  { text: "Preserves the notated score exactly as laid out, ready for musicians to read and perform from", format: "print" },
  { text: "Best exported when the goal is a page others can print out or read directly, not edit or play back", format: "print" },
  { text: "Cannot be listened to directly — it is a page of notation, not a sound file", format: "print" },
  { text: "The right choice when sheet music needs to be handed to a choir or ensemble to sight-read", format: "print" },
  { text: "A recorded sound file that can be played back on any music player, phone, or speaker", format: "audio" },
  { text: "Cannot be edited as notation any more — the individual notes are no longer separately adjustable once exported this way", format: "audio" },
  { text: "The right choice for sharing a finished piece with a general audience who just want to listen", format: "audio" },
  { text: "Captures the actual sound of a performance or playback, not the underlying notation", format: "audio" },
];

// The design's own Suggested Learning Experiences bullet order for 1.6, condensed into an
// ordering task (per SKILL-QUALITY-STANDARDS.md's sanctioned technique).
const PROCESS_STEPS = [
  { id: "watch", label: "Watch demos of various music notation software to compare them" },
  { id: "discuss", label: "Discuss notation software and mobile apps used for music notation" },
  { id: "navigate", label: "Navigate the chosen software to view its notation tools" },
  { id: "key", label: "Key in the music using the note-entry tool" },
  { id: "edit", label: "Edit the keyed-in music to correct or refine it" },
  { id: "save", label: "Save and convert the finished file to midi, print, and audio formats" },
  { id: "share", label: "Share, play back, and appraise the finished music" },
];

interface SoftwareFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: SoftwareFact[] = [
  {
    situation: "has finished keying in an 8-bar melody and wants a version other musicians can open and print out on paper",
    correct: "Export the file in a print (score) format, since that preserves the notated score for reading and performing from paper",
    wrong: [
      "Export the file as a MIDI file, since MIDI is always the correct choice for printing a score",
      "Export the file as an audio file, since audio files can be printed directly",
      "Delete the original notation file, since a printed copy does not need it",
    ],
  },
  {
    situation: "wants to send a finished composition to a friend so the friend can open it in their own notation software and keep editing the notes",
    correct: "Save the file as MIDI, since MIDI stores the actual note and timing data that other notation software can open and edit",
    wrong: [
      "Save the file as audio, since audio files can be re-edited as notation once opened",
      "Save the file as print, since a printed score is always editable in software",
      "There is no way to share a file that can still be edited",
    ],
  },
  {
    situation: "wants to upload a recording of the finished piece to a school event page so anyone can listen, even without notation software",
    correct: "Export the file as audio, since audio can be played back by anyone on any device without needing notation software",
    wrong: [
      "Export the file as MIDI, since MIDI always plays automatically on any device",
      "Export the file as print, since a printed page can be listened to once scanned",
      "Record it separately with a different device instead of exporting from the software",
    ],
  },
  {
    situation: "opens the notation software for the first time and is unsure which tool lets them start entering notes onto a blank score",
    correct: "Look for the keying-in (note-entry) tool, since that is how notes are placed onto the stave",
    wrong: [
      "Use the playback tool, since it plays existing music rather than entering new notes",
      "Use the saving tool, since it only stores the file and does not add notes",
      "Close the software and use manuscript paper instead",
    ],
  },
  {
    situation: "has entered the wrong note in bar 3 of a melody and needs to fix it before saving the file",
    correct: "Use the editing tools to select and correct the wrong note before saving",
    wrong: [
      "Save the file first, since editing is impossible after notes have been keyed in",
      "Delete the whole file and start again from bar 1",
      "Re-open the file after saving and hope the note corrects itself",
    ],
  },
  {
    situation: "wants to hear how a melody they just keyed in actually sounds before deciding whether to edit it further",
    correct: "Use the playback tool to listen to the keyed-in melody",
    wrong: [
      "Use the saving tool, since saving a file also plays it automatically",
      "Use the print/export tool, since exporting a page also produces sound",
      "Sing it aloud instead, since notation software cannot play music back",
    ],
  },
  {
    situation: "is asked to transcribe a major scale into the notation software",
    correct: "Key in each note of the scale in order, using the software's note-entry tool",
    wrong: [
      "Record it as audio only, since scales cannot be notated in software",
      "Print a blank page and write the scale by hand instead of using the software",
      "Transcription only works for melodies, never for scales",
    ],
  },
  {
    situation: "is asked to transcribe a finished two-part harmony into the notation software",
    correct: "Key in both parts — the melody and the second part — so the software displays and can play back both together",
    wrong: [
      "Key in only the top part, since software cannot notate two parts at the same time",
      "Print each part separately without ever opening the software",
      "Two-part harmony can only be recorded as audio, never notated in software",
    ],
  },
  {
    situation: "wants to check whether an interval they wrote sounds consonant or dissonant before finalising the composition",
    correct: "Use the playback tool to listen to the interval, in addition to checking it visually on the stave",
    wrong: [
      "Rely only on saving the file, since saving automatically checks whether intervals are consonant",
      "Ignore playback entirely, since visual notation alone is always enough to judge a sound",
      "Delete the interval and start the whole piece over",
    ],
  },
  {
    situation: "has finished editing a composition and now wants a version that keeps the note and timing data for playback or further editing in different software later",
    correct: "Save the file as MIDI, since MIDI preserves the note and timing data for other software to play back or edit",
    wrong: [
      "Save the file only as print, since PDFs also store note-timing data for editing",
      "Save the file only as audio, since audio files can be re-edited as notation later",
      "There is no format that preserves note data for later use",
    ],
  },
];

// 5 openers x 4 closers = 20 distinct prompt skeletons from 9 authored pieces, per the
// combineFrames technique documented in sharedG10.ts.
const REASONING_OPENERS: ((rng: RNG, fact: SoftwareFact) => string)[] = [
  (rng, fact) => `${name(rng)}, working on a school computer near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `In a music technology class near ${place(rng)}, ${name(rng)} ${fact.situation}`,
  (rng, fact) => `${name(rng)} ${fact.situation}`,
  (rng, fact) => `During a notation software lesson in ${place(rng)}, ${name(rng)} ${fact.situation}`,
  (rng, fact) => `While composing at a school computer lab, ${name(rng)} ${fact.situation}`,
];

const REASONING_CLOSERS = [
  "What should they do?",
  "Which choice is correct?",
  "What is the right next step?",
  "What is the correct approach here?",
];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);
const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

const CLICK_MATCH_PROMPTS = [
  "Match each software action to its description.",
  "Pair each action with the description that fits it.",
  "Connect each navigation action to what it actually involves.",
  "Line up each action with its correct description.",
  "Work out which description belongs to which action, then match them.",
  "Match each of the five software actions to its description below.",
  "Which description goes with which action? Match them correctly.",
  "Pair up every action with the statement that correctly describes it.",
  "Match each action on the left to its description on the right.",
  "Sort out which description belongs to which action, by matching them.",
  "Correctly match every action to the description that fits it.",
  "Match each action to what it lets a learner do in the software.",
  "For each action below, find the description that explains it.",
  "Match each software action to what it means in practice.",
  "Figure out what each action does, then match it to its name.",
  "Connect each action name to its correct description.",
  "Match each of the five actions to the description that fits.",
  "Pair each action with its correct explanation.",
  "Work out which action matches which description, then link them.",
  "Match every action below to the description that correctly explains it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by the file format it describes: midi, print, or audio.",
  "Group these facts under the correct saved-file format.",
  "Decide which format each fact below belongs to, and sort it there.",
  "Sort each statement into the format it best fits.",
  "Place each fact into the bucket for the format it is describing.",
  "Read each fact and sort it under the matching format.",
  "Work out which format each fact is about, then sort it there.",
  "Classify each fact by the saved-file format it belongs to.",
  "Organize these facts into the correct format group.",
  "Which format does each fact describe? Sort it accordingly.",
  "Sort each statement below into midi, print, or audio.",
  "Drop each fact into the format it's really about.",
  "Group each statement with the format it correctly belongs to.",
  "Decide where each fact fits among the three saved-file formats.",
  "Sort these facts into their correct format groups.",
  "For each fact, work out the format it belongs to and sort it in.",
  "Place these statements under the format each one matches.",
  "Sort each fact correctly among midi, print, and audio.",
  "Read each statement and file it under the right format.",
  "Assign each fact to the format it best describes.",
];

const ORDERING_PROMPTS = [
  "Arrange the steps of learning and using notation software in the correct order.",
  "Put these notation-software steps into a sensible order.",
  "Sequence the process of composing with notation software correctly.",
  "Arrange these actions into the order a careful learner would follow them.",
  "Order these steps the way a learner should carry them out with notation software.",
  "Sort these steps into the order they should happen when using notation software.",
  "Put these software steps in the order a music student would follow them.",
  "Work out the sensible order for these notation-software steps.",
  "Arrange these steps into a logical composing process.",
  "Which order should these steps happen in? Arrange them correctly.",
  "Build a sensible workflow by ordering these steps correctly.",
  "Sequence a learner's steps in the order they should be carried out.",
  "Order these actions the way they would happen in a well-run software lesson.",
  "Arrange the steps of using notation software, in the right order.",
  "Put these tasks into the order a careful learner would complete them.",
  "Sequence these steps to build a composition from start to finish.",
  "Work out the correct order for composing and sharing music with software.",
  "Arrange these steps as a learner would carry them out during a lesson.",
  "Order the tasks below the way a sensible software workflow would run.",
  "Sequence these steps correctly, from first to last.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the fact about music notation software.",
  "Fill in the missing term.",
  "Work out the missing word in this software fact.",
  "Complete this statement about notation software.",
  "Fill in the blank to finish the fact.",
  "Which term completes this sentence correctly?",
  "Name the missing term in this fact about notation software.",
  "Complete the sentence with the correct software term.",
  "Work out and fill in the missing term below.",
  "Which word or phrase finishes this fact correctly?",
  "Fill in the term that correctly completes this statement.",
  "Complete this notation-software fact accurately.",
  "What term belongs in the blank below?",
  "Finish the sentence with the correct term.",
  "Fill in the correct action or format name.",
  "Complete the missing term in this software fact.",
  "Which term fits correctly in the blank?",
  "Work out the correct word to complete this fact.",
  "Fill in the blank with the correct term.",
  "Complete this fact about notation software use.",
];

const FORMAT_IDENTIFY_PROMPTS = [
  "Which saved-file format does this describe?",
  "Identify the format described here:",
  "Name the file format being described:",
  "Work out which format this is:",
  "Which of the three saving formats fits this description?",
  "Identify this format from its description:",
  "What format is being described below?",
  "Which format matches this?",
  "Name this format correctly:",
  "Work out the format from the description given:",
  "Identify the correct format:",
  "Which format does this description match?",
  "From the description, name the format:",
  "What is this format called?",
  "Identify which of the three formats this is:",
  "Match this description to its correct format name:",
  "Which format is this?",
  "Work out and name the format described:",
  "Name the format that fits this description:",
  "Identify the format from the use described:",
];

const FORMAT_LABEL: Record<FormatFact["format"], string> = { midi: "MIDI", print: "Print", audio: "Audio" };
const FORMAT_WRONG: Record<FormatFact["format"], string[]> = {
  midi: ["Print", "Audio"],
  print: ["MIDI", "Audio"],
  audio: ["MIDI", "Print"],
};

export const musicNotationSoftware: Skill = {
  id: "g10-mad-music-notation-software",
  code: "1.6",
  subjectId: "music-and-dance",
  strandId: "g10-mad-foundations",
  grade: 10,
  title: "Music Notation Software",
  description: "Navigating music notation software (opening, keying in, playback, saving, editing), transcribing scales, melodies, intervals and two-part harmony, and saving finished work in midi, print and audio formats.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["action-match", "format-categorize", "process-order", "reasoning", "format-identify", "fill-blank"] as const
    );
    const hint = "The three saving formats each do a different job: MIDI keeps editable note data, print gives a readable score, and audio is a listenable recording.";

    if (branch === "action-match") {
      const tokens = shuffle(rng, NAV_ACTIONS.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, NAV_ACTIONS.map((a) => ({ id: a.id, label: a.def })));
      const correctMap: Record<string, string> = {};
      for (const a of NAV_ACTIONS) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CLICK_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: NAV_ACTIONS.map((a) => `${a.label}: ${a.def}.`).join(" "),
      };
    }

    if (branch === "format-categorize") {
      const chosen = shuffle(rng, FORMAT_FACTS).slice(0, 8);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.format));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["midi", "print", "audio"] as const).map((f) => ({ id: f, label: FORMAT_LABEL[f] })),
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" describes the ${FORMAT_LABEL[c.format]} format.`).join(" "),
      };
    }

    if (branch === "process-order") {
      const shuffled = shuffle(rng, PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDERING_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STEPS.map((s) => s.id),
        hint: "Compare software, navigate its tools, key in and edit the music, then save/convert and finally share it.",
        explanation: PROCESS_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    if (branch === "format-identify") {
      const f = randChoice(rng, FORMAT_FACTS);
      const q = {
        prompt: `${randChoice(rng, FORMAT_IDENTIFY_PROMPTS)} "${f.text}"`,
        correct: FORMAT_LABEL[f.format],
        wrong: FORMAT_WRONG[f.format],
        explanation: `This describes the ${FORMAT_LABEL[f.format]} format — ${f.text.toLowerCase()}.`,
      };
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.acceptedAnswers],
      inputMode: "text",
      hint,
      explanation: fb.explanation,
    };
  },
};

const FILL_BLANK_TEMPLATES = [
  {
    before: "Entering notes, rests, and other symbols onto the stave in notation software is called ",
    after: ".",
    correctAnswer: "keying in",
    acceptedAnswers: ["keying in", "keying-in", "keying"],
    explanation: "Keying in is the action of entering notes and symbols onto the stave in notation software.",
  },
  {
    before: "Listening to entered music by having the software play it back is called ",
    after: ".",
    correctAnswer: "playback",
    acceptedAnswers: ["playback", "playing back", "play back"],
    explanation: "Playback lets a learner hear how the keyed-in music actually sounds.",
  },
  {
    before: "Correcting, moving, or changing notes and symbols already keyed in is called ",
    after: ".",
    correctAnswer: "editing",
    acceptedAnswers: ["editing"],
    explanation: "Editing is the action of correcting or changing music that has already been keyed in.",
  },
  {
    before: "Storing a file so the work is not lost and can be reopened later is called ",
    after: ".",
    correctAnswer: "saving",
    acceptedAnswers: ["saving"],
    explanation: "Saving stores the file so the composer's work is not lost and can be reopened later.",
  },
  {
    before: "The saved-file format that stores the actual note and timing data, so other notation software can keep editing it, is ",
    after: ".",
    correctAnswer: "midi",
    acceptedAnswers: ["midi"],
    explanation: "MIDI stores note and timing data, so a piece can be reopened and edited further in other notation software.",
  },
  {
    before: "The saved-file format that preserves the notated score exactly as laid out, ready to read and perform from paper, is ",
    after: ".",
    correctAnswer: "print",
    acceptedAnswers: ["print"],
    explanation: "The print format keeps the score exactly as laid out, ready for musicians to read from paper or screen.",
  },
  {
    before: "The saved-file format that is a recorded sound file, playable on any music player but no longer editable as notation, is ",
    after: ".",
    correctAnswer: "audio",
    acceptedAnswers: ["audio"],
    explanation: "Audio is a recorded sound file — anyone can play it back, but the individual notes are no longer separately editable.",
  },
  {
    before: "When transcribing a major scale into notation software, a learner should ",
    after: " each note of the scale in order.",
    correctAnswer: "key in",
    acceptedAnswers: ["key in", "key", "enter"],
    explanation: "Transcribing a scale means keying in each of its notes, in order, using the note-entry tool.",
  },
  {
    before: "To transcribe a two-part harmony into notation software, a learner should key in ",
    after: " so both are displayed and can be played back together.",
    correctAnswer: "both parts",
    acceptedAnswers: ["both parts", "both", "the melody and the second part"],
    explanation: "Two-part harmony transcription needs both parts keyed in so the software can display and play them back together.",
  },
  {
    before: "Before entering notes for the first time, a learner should first use the software's ",
    after: " tool to begin or continue a composition.",
    correctAnswer: "opening",
    acceptedAnswers: ["opening"],
    explanation: "Opening the software or a saved file is the first step before keying in or editing any music.",
  },
  {
    before: "Sharing a finished piece with a general audience who simply want to listen is best done by exporting to ",
    after: " format.",
    correctAnswer: "audio",
    acceptedAnswers: ["audio"],
    explanation: "Audio format is playable by anyone on any device without needing notation software, making it ideal for general listening.",
  },
] as const;
