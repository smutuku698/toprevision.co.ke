import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill, VisualSpec } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  FILL_BLANK_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.5 "Descant
// Recorder" (13 lessons).
//
// Mined verbatim: Notes B A G C1 D1; Playing techniques — fingering, breath control,
// tonguing, tone quality. Learning experiences: use the baroque fingering chart for C1 and
// D1; play notes B A G C1 D1 and simple melodies on them with appropriate techniques;
// create a random repeat pattern based on the notes B A G C1 D1 using a stencil, printed in
// contrasting colours by dabbing/spraying and mounted for display. Key inquiry: how is a
// good tone produced on the descant recorder? Core competencies: Digital literacy;
// Communication and Collaboration. Link to other learning area: English (feedback language).
//
// Visual coverage: uses the registered { type: "recorder-fingering" } VisualSpec for the
// notes B A G C1 D1. No stencil-pattern VisualSpec exists; that omission is a deliberate
// scope call for this pass.

const NOTES = [
  { id: "G", label: "G", pitchOrder: 1, note: "G" as const },
  { id: "A", label: "A", pitchOrder: 2, note: "A" as const },
  { id: "B", label: "B", pitchOrder: 3, note: "B" as const },
  { id: "C1", label: "C¹ (high C)", pitchOrder: 4, note: "C1" as const },
  { id: "D1", label: "D¹ (high D)", pitchOrder: 5, note: "D1" as const },
] as const;

const TECHNIQUES = [
  { id: "fingering", label: "Fingering", desc: "Covering the correct holes fully and firmly for each note, as shown on the baroque fingering chart" },
  { id: "breath-control", label: "Breath control", desc: "Blowing gently and steadily — enough air for a full sound but not so hard the note squeaks or jumps up" },
  { id: "tonguing", label: "Tonguing", desc: "Starting each note with a light touch of the tongue, as if saying 'du', so the notes are cleanly separated" },
  { id: "tone-quality", label: "Tone quality", desc: "The overall sound produced — a good tone is clear, warm and steady, not breathy, squeaky or forced" },
] as const;

const TECH_FACTS = [
  { text: "Covering every hole completely so no air leaks out", id: "fingering" },
  { text: "Following the baroque chart to know which holes to close for C¹ and D¹", id: "fingering" },
  { text: "Keeping the finger pads flat and pressing just firmly enough to seal the holes", id: "fingering" },
  { text: "Blowing a slow, even stream of air rather than a sudden hard puff", id: "breath-control" },
  { text: "Using a little more air for the higher notes but never forcing them", id: "breath-control" },
  { text: "Saying 'du' or 'too' softly at the start of each note", id: "tonguing" },
  { text: "Separating repeated notes so they do not slur into one long sound", id: "tonguing" },
  { text: "Aiming for a clear, warm, steady sound with no hiss or squeak", id: "tone-quality" },
  { text: "Judging whether the note sounds pleasant and even from start to finish", id: "tone-quality" },
  { text: "A breathy, airy sound means this needs work", id: "tone-quality" },
] as const;

const STENCIL_STEPS = [
  { id: "s1", label: "Cut a stencil shape for each of the notes B A G C¹ D¹" },
  { id: "s2", label: "Plan a random repeat layout of the note shapes on the paper" },
  { id: "s3", label: "Mix two or more contrasting colours" },
  { id: "s4", label: "Hold each stencil down and dab or spray colour through the openings" },
  { id: "s5", label: "Lift the stencil carefully and repeat across the paper to build the pattern" },
  { id: "s6", label: "Leave the print to dry, then mount it for display" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked the key inquiry question: how is a good tone produced on the descant recorder? Which answer is best?`,
      correct: "By covering the holes fully, blowing a steady gentle stream of air, and tonguing each note lightly",
      wrong: [
        "By blowing as hard as possible so the sound is loud",
        "By keeping all the holes half-covered at all times",
        "By never using the tongue and slurring every note together",
      ],
      explanation: "A good tone comes from correct fingering (holes sealed), controlled gentle breath, and light tonguing. Blowing hard makes the recorder squeak; half-covered holes and no tonguing spoil the sound.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s recorder in ${place(rng)} squeaks up into a high, sharp squeal every time they try to play B. Which technique is the most likely cause?`,
    correct: "Breath control — blowing too hard forces the note to jump and squeal; a gentler, steadier air stream fixes it",
    wrong: [
      "Tonguing — but tonguing only starts the note, it does not cause a squeal",
      "Tone quality — but that is the result, not the cause",
      "The colour of the recorder — the material has no effect on squealing",
    ],
    explanation: "Over-blowing is the usual cause of a squeal: too much air pushes the note up. Easing off to a steady, gentle stream (breath control) brings the note back.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} plays three B's in a row but they run together into one long wobbly sound. Which technique needs work?`,
      correct: "Tonguing — lightly saying 'du' at the start of each note separates repeated notes cleanly",
      wrong: [
        "Fingering — but the fingering for repeated B's does not change",
        "Breath control — but the notes are separating that is the issue, not the air",
        "Tone quality — but that describes the sound, not how to separate the notes",
      ],
      explanation: "Repeated notes are separated by tonguing each one — a light 'du' or 'too'. Without tonguing they slur into a single continuous sound.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} gets a weak, airy, hissing sound on G with lots of breath noise. What is most likely wrong?`,
    correct: "A hole is not fully covered, so air is leaking — the fingering needs to seal every hole",
    wrong: [
      "The note is being tongued too clearly",
      "The player is using too little spit",
      "The recorder is in the wrong colour of light",
    ],
    explanation: "A breathy, leaking sound on a low note usually means a finger is not sealing its hole. Pressing the pads flat to cover the holes completely clears the tone.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is learning C¹ and D¹ and checks a chart that shows exactly which holes to cover. What is this chart called?`,
      correct: "The baroque fingering chart",
      wrong: [
        "The colour wheel",
        "The sol-fa ladder",
        "The assessment rubric",
      ],
      explanation: "The baroque fingering chart shows the hole pattern for each note on a baroque-fingered descant recorder, including C¹ and D¹.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} gives a classmate feedback on their recorder playing after a performance in ${place(rng)}. Which subject does the design link this feedback to?`,
    correct: "English — using English as the language of communication when giving feedback on performances",
    wrong: [
      "Mathematics — because the notes are counted",
      "It links to no other subject",
      "Agriculture — because recorders can be made from bamboo",
    ],
    explanation: "The design links this sub-strand to English: learners use English to communicate feedback on their peers' melodies played on the recorder.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} plays a melody built on G A B C¹ D¹ and rushes the air on the higher notes, blasting them. How should the higher notes be played instead?`,
      correct: "With a little more air than the low notes, but still a controlled, steady stream — not a blast",
      wrong: [
        "With the hardest possible puff, since high notes need force",
        "With less air than the low notes",
        "With no air at all, just fast fingers",
      ],
      explanation: "Higher notes need slightly firmer breath support than low notes, but it must stay steady and controlled. Blasting them makes them squeak or go sharp.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} makes a random repeat pattern from stencils of the notes B A G C¹ D¹ and prints it in pale grey on white paper. The pattern barely shows. What should change?`,
    correct: "Use contrasting colours — a colour that stands out clearly against the paper",
    wrong: [
      "Use a bigger recorder",
      "Print the pattern in the exact colour of the paper",
      "Skip the stencils and draw the notes freehand",
    ],
    explanation: "The stencil pattern is meant to be printed in contrasting colours so the repeated note shapes stand out and the mounted pattern reads clearly.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} lists the notes B A G C¹ D¹ from lowest pitch to highest. Which order is correct?`,
      correct: "G, A, B, C¹, D¹",
      wrong: ["B, A, G, C¹, D¹", "D¹, C¹, B, A, G", "A, G, B, D¹, C¹"],
      explanation: "In pitch order from lowest to highest, the five notes are G, A, B, then C¹ (high C) and D¹ (high D) in the next octave.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} plays with a lovely clear steady sound, no hiss and no squeak. Which playing technique is ${name(rng)} demonstrating well?`,
    correct: "Tone quality — a clear, warm, steady sound is exactly what good tone quality means",
    wrong: [
      "Only fingering — a clean sound has nothing to do with tone quality",
      "Only tonguing — tone quality is about how notes are started",
      "Breath control has no link to the sound produced",
    ],
    explanation: "Tone quality is the overall sound the player produces. A clear, warm, steady sound with no hiss or squeak is good tone quality, and it results from good fingering, breath and tonguing together.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "The five recorder notes learnt in Grade 5, from lowest to highest, are G A B C¹ and ", after: ".", correctAnswer: "D1", acceptedAnswers: ["D1", "D¹", "d1", "high d", "d"] },
  { before: "Covering the correct holes fully and firmly for each note is the playing technique called ", after: ".", correctAnswer: "fingering" },
  { before: "Blowing a gentle, steady stream of air, not a hard puff, is the technique called breath ", after: ".", correctAnswer: "control" },
  { before: "Starting each note with a light touch of the tongue, as if saying 'du', is called ", after: ".", correctAnswer: "tonguing" },
  { before: "The clear, warm, steady sound a player aims for on the recorder is called good tone ", after: ".", correctAnswer: "quality" },
  { before: "The chart that shows which holes to cover for each note, including C¹ and D¹, is the ", after: " fingering chart.", correctAnswer: "baroque" },
  { before: "If a recorder squeaks into a high squeal, the player is most likely blowing too ", after: ".", correctAnswer: "hard" },
  { before: "If repeated notes slur into one long sound, the player needs to use ", after: " to separate them.", correctAnswer: "tonguing" },
  { before: "A weak, airy, hissing sound usually means a hole is not fully ", after: ".", correctAnswer: "covered" },
  { before: "The note printed as C¹ on the recorder is the high ", after: ".", correctAnswer: "C", acceptedAnswers: ["C", "c", "high c"] },
  { before: "In pitch order, the lowest of the five notes B A G C¹ D¹ is ", after: ".", correctAnswer: "G", acceptedAnswers: ["G", "g"] },
  { before: "A random repeat pattern of note shapes is printed with a stencil in ", after: " colours so it shows up clearly.", correctAnswer: "contrasting", acceptedAnswers: ["contrasting", "contrast"] },
] as const;

const FINGERING_PROMPTS = [
  "Which note does this recorder fingering play?",
  "Look at the fingering diagram — which note is it?",
  "Read the recorder fingering: which note does it produce?",
  "Which of these notes matches this fingering?",
  "Name the note shown by this fingering pattern.",
  "This fingering plays which note?",
  "Identify the recorder note from its fingering.",
  "Which note is fingered like this?",
  "The holes shown covered give which note?",
  "Choose the note this fingering diagram shows.",
] as const;

const PITCH_LINE_PROMPTS = [
  "In pitch order (G = 1, lowest, to D¹ = 5, highest), which number is this note?",
  "Where does this note sit in pitch order, from G (1) to D¹ (5)?",
  "Mark this note's place in pitch order (G = 1, D¹ = 5).",
  "Counting G as 1 and D¹ as 5, which number is this note?",
  "Which pitch-order number does this note have (G lowest = 1)?",
  "Place the marker at this note's pitch-order position (1 to 5).",
  "How high is this note in the set G A B C¹ D¹? Mark its position.",
  "Give this note's rank by pitch, with G as 1 and D¹ as 5.",
  "Show this note's pitch order on the line (G = 1).",
  "Which step of the pitch order, 1 to 5, is this note?",
] as const;

export const descantRecorder: Skill = {
  id: "g5-cas-descant-recorder",
  code: "P.5",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-performing-displaying",
  grade: 5,
  title: "Descant recorder",
  description:
    "Playing the notes B A G C¹ D¹ on the descant recorder using the baroque fingering chart; the playing techniques fingering, breath control, tonguing and tone quality, and how a good tone is produced; and making a random repeat pattern from note-shaped stencils.",
  generate(rng) {
    const branch = randChoice(rng, [
      "fingering-recognition",
      "pitch-order-line",
      "pitch-order-sort",
      "technique-match",
      "technique-fact-sort",
      "stencil-order",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "fingering-recognition") {
      const target = randChoice(rng, NOTES);
      const visual: VisualSpec = { type: "recorder-fingering", note: target.note };
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        NOTES.filter((n) => n.id !== target.id).map((n) => n.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: pickPrompt(rng, FINGERING_PROMPTS),
        choices,
        correctIndex,
        layout: "row",
        visual,
        hint: "The five notes are G, A, B (lower) and C¹, D¹ (the next octave up).",
        explanation: `This fingering plays ${target.label}.`,
      };
    }

    if (branch === "pitch-order-line") {
      const target = randChoice(rng, NOTES);
      return {
        kind: "number-line",
        prompt: `${pickPrompt(rng, PITCH_LINE_PROMPTS)}  Note: ${target.label}`,
        min: 1,
        max: 5,
        step: 1,
        correctValue: target.pitchOrder,
        mode: "point",
        hint: "Lowest to highest: G (1), A (2), B (3), C¹ (4), D¹ (5).",
        explanation: `${target.label} is pitch-order position ${target.pitchOrder} (G=1, A=2, B=3, C¹=4, D¹=5).`,
      };
    }

    if (branch === "pitch-order-sort") {
      const dir = randChoice(rng, ["up", "down"] as const);
      const ordered = dir === "up" ? NOTES.map((n) => n.label) : [...NOTES].reverse().map((n) => n.label);
      const items = shuffle(rng, NOTES.map((n) => ({ id: n.id, label: n.label })));
      const correctOrder = dir === "up" ? NOTES.map((n) => n.id) : [...NOTES].reverse().map((n) => n.id);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (the notes B A G C¹ D¹ by pitch, ${dir === "up" ? "lowest first" : "highest first"})`,
        items,
        correctOrder,
        instruction: "Drag to arrange the notes by pitch.",
        hint: "From lowest: G, A, B, C¹, D¹.",
        explanation: `Correct order: ${ordered.join(" → ")}.`,
      };
    }

    if (branch === "technique-match") {
      const chosen = shuffle(rng, TECHNIQUES);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Fingering = the holes; breath control = the air; tonguing = starting each note; tone quality = the overall sound.",
        explanation: chosen.map((t) => `${t.label} — ${t.desc}.`).join(" "),
      };
    }

    if (branch === "technique-fact-sort") {
      const chosen = shuffle(rng, TECH_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `tf${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`tf${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: TECHNIQUES.map((t) => ({ id: t.id, label: t.label })),
        correctBucket,
        hint: "Is it about covering holes (fingering), the air stream (breath control), starting the note (tonguing), or the sound itself (tone quality)?",
        explanation: chosen
          .map((f) => `"${f.text}" — ${TECHNIQUES.find((t) => t.id === f.id)!.label}.`)
          .join(" "),
      };
    }

    if (branch === "stencil-order") {
      const shuffled = shuffle(rng, STENCIL_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (making a random repeat pattern from note-shaped stencils)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: STENCIL_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Cut the stencils, plan the random layout, mix contrasting colours, dab or spray through, repeat across the paper, then dry and mount.",
        explanation: "Correct order: " + STENCIL_STEPS.map((s) => s.label).join(" → ") + ".",
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
        hint: "Match the fault to the technique: squeal = too much breath; slurred notes = no tonguing; airy = a hole not covered; and remember a good tone needs all three together.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const accepted = "acceptedAnswers" in fb && fb.acceptedAnswers ? fb.acceptedAnswers : [fb.correctAnswer];
    return {
      kind: "fill-blank",
      prompt: pickPrompt(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...accepted],
      inputMode: "text",
      hint: "Think about the notes G A B C¹ D¹ and the four techniques: fingering, breath control, tonguing and tone quality.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
