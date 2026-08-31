import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, fillBlankPrompt } from "./g5SciShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Science & Technology, sub-strand 3.2 Sound Energy — 3 named sources of sound (vibrating air,
// vibrating strings, vibrating drums), movement of sound (all directions, echo/reflection), effects of loud
// sound, and the role of sound and sound pollution. See curriculum-reference/grade-5/science-and-technology.json.

const SOUND_SOURCES = [
  { id: "vibrating-air", label: "Vibrating air", examples: ["A whistle being blown", "A flute being played", "Someone blowing across the top of a bottle"] },
  { id: "vibrating-strings", label: "Vibrating strings", examples: ["A guitar string being plucked", "A violin string being played with a bow", "A rubber band being stretched and plucked"] },
  { id: "vibrating-drums", label: "Vibrating drums/membranes", examples: ["A drum skin being struck", "A talking drum being tapped", "A stretched membrane being hit"] },
] as const;

const ECHO_LOCATIONS = ["a wall", "a cliff", "a large hall", "a forest", "a valley", "between tall buildings"] as const;

const ECHO_PROMPTS = [
  "Where would you be most likely to hear a clear echo?",
  "Which of these places would produce the clearest echo?",
  "An echo is most likely to be heard near which of these?",
  "In which place would a shout most likely bounce back as an echo?",
  "Which location below would reflect sound back as an echo?",
  "Where is a loud sound most likely to echo back to you?",
  "Pick the place where you'd most clearly hear your own echo.",
  "Which of these spots is best for hearing an echo?",
  "A clear echo would most likely happen in which of these places?",
  "Where would sound most likely bounce back and be heard again?",
  "Which location gives sound a hard surface to reflect off, causing an echo?",
  "At which of these places would you expect to hear an echo?",
] as const;

const LOUD_SOUND_EFFECTS = [
  { text: "Very loud sound over time can damage a person's hearing", category: "health" },
  { text: "Sudden loud noise can startle people and animals", category: "health" },
  { text: "Constant loud sound can make it hard to concentrate or sleep", category: "health" },
  { text: "Loud sound can cause stress and headaches in people exposed to it often", category: "health" },
  { text: "Loud construction or traffic noise can disturb an entire neighbourhood", category: "community" },
  { text: "Loud music played late at night can disturb neighbours' sleep and rest", category: "community" },
  { text: "Loud noise near farms can frighten and stress livestock", category: "community" },
  { text: "Governments can set rules limiting how loud certain activities may be in public areas", category: "community" },
] as const;

const ROLE_OF_SOUND_FACTS = [
  { text: "Sound lets people communicate through speaking and listening", category: "communication" },
  { text: "Musical instruments use sound to create music for entertainment", category: "entertainment" },
  { text: "A school bell uses sound to signal when lessons start and end", category: "signalling" },
  { text: "A car horn uses sound to warn other road users of danger", category: "signalling" },
  { text: "An alarm uses sound to alert people to an emergency", category: "signalling" },
  { text: "Birds and other animals use sound calls to communicate with each other", category: "communication" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} shouts near a tall cliff in ${place(rng)} and, a moment later, hears the same shout again coming back. What is this?`,
      correct: "An echo, caused by sound reflecting off the cliff",
      wrong: ["A second, unrelated shout from someone else", "Sound cannot reflect, so this must be an illusion", "Wind repeating the shout's exact words"],
      explanation: "Sound reflects off large, hard surfaces such as a cliff and returns to the listener as an echo — one of the design's named echo locations.",
    };
  },
  (rng) => ({
    prompt: `A speaker plays music in the middle of a school field in ${place(rng)}, and learners standing on every side of the field, including behind it, can all hear the music. What does this show about how sound travels?`,
    correct: "Sound travels outward in all directions from its source",
    wrong: ["Sound only travels forward in a single straight line", "Sound only travels toward the nearest listener", "Sound cannot travel outdoors at all"],
    explanation: "Sound spreads out in all directions from its source, which is why listeners on every side of the field can hear the same speaker.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} plucks a stretched rubber band in ${place(rng)} and hears a soft sound. What is producing this sound?`,
      correct: "The vibrating rubber band (a vibrating string)",
      wrong: ["Vibrating air alone, with no string involved", "A vibrating drum membrane", "The sound has no physical source at all"],
      explanation: "A plucked stretched string, such as a rubber band or guitar string, vibrates rapidly to produce sound — the vibrating strings source.",
    };
  },
  (rng) => ({
    prompt: `A factory near a residential area in ${place(rng)} runs loud machinery both day and night, and nearby residents complain of frequent headaches and trouble sleeping. What effect of loud sound does this best illustrate?`,
    correct: "Loud, constant sound can cause stress, headaches and disturbed sleep",
    wrong: ["Loud sound has no effect on people's health at all", "Loud sound always improves people's sleep quality", "This shows only a positive effect of the factory's operations"],
    explanation: "Constant loud sound is a known cause of stress, headaches and poor sleep — one of the named effects of loud sound on people.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} blows across the open top of an empty glass bottle in ${place(rng)} and produces a low, hollow note. What is vibrating to make this sound?`,
      correct: "The air inside and around the bottle's opening",
      wrong: ["The glass of the bottle itself is vibrating, not the air", "A string inside the bottle is vibrating", "No vibration is involved in this sound"],
      explanation: "Blowing across an opening makes the air inside vibrate, producing sound — the vibrating air source, the same principle as a whistle or flute.",
    };
  },
  (rng) => ({
    prompt: `A talking drum player in ${place(rng)} strikes the drum's stretched skin to produce different notes. What is the main source of the sound?`,
    correct: "The vibrating drum skin (membrane)",
    wrong: ["Vibrating air with no membrane involved", "A vibrating string stretched across the drum", "The wooden drum body alone, without any vibration"],
    explanation: "Striking a drum's stretched skin makes it vibrate rapidly, producing sound — the vibrating drums/membranes source.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} calls out from one side of a narrow valley in ${place(rng)} and hears the call bounce back off the valley walls a moment later. What phenomenon is ${who} experiencing?`,
      correct: "An echo, from sound reflecting off the valley walls",
      wrong: ["A second person hiding in the valley repeating the call", "Sound disappearing and then magically reappearing", "Wind creating an entirely new sound"],
      explanation: "A narrow valley, like a cliff or large hall, has hard surfaces that reflect sound back as an echo.",
    };
  },
  (rng) => ({
    prompt: `A city council in ${place(rng)} sets a rule limiting how loud music can be played in residential areas after 10pm. What effect of loud sound is this rule meant to address?`,
    correct: "Loud sound at night disturbing residents' sleep and rest",
    wrong: ["Loud sound making buildings physically collapse", "Loud sound at night has no real effect on residents", "This rule is unrelated to the effects of loud sound"],
    explanation: "Rules limiting noise at night address the disturbance loud sound causes to people's sleep and rest — part of the community-level effects of loud sound.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} hears a car horn while crossing a road in ${place(rng)} and quickly steps back onto the pavement. What role is sound playing here?`,
      correct: "Sound is being used as a warning signal to alert road users to danger",
      wrong: ["The horn sound has no practical purpose at all", "The horn is being used purely for entertainment", "Sound cannot be used to signal danger"],
      explanation: "A car horn uses sound as a warning signal — one of the named roles of sound in day-to-day life.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} plays a guitar, plucking one string gently and then plucking it much harder. Both times the note has the same pitch, but the harder pluck sounds louder. What best explains this?`,
    correct: "A stronger vibration of the string (from a harder pluck) produces a louder sound, without necessarily changing the pitch",
    wrong: ["Plucking harder always changes which string is vibrating", "Sound volume has no connection to how strongly a string vibrates", "The guitar itself changes shape when plucked harder"],
    explanation: "How strongly a string vibrates affects how loud the resulting sound is — a stronger pluck means a stronger vibration and a louder sound.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices that loud, sudden noises from passing trucks make chickens on a nearby farm scatter and stop laying eggs as often. What effect of loud sound does this show?`,
      correct: "Loud noise can frighten and stress animals, which can affect their behaviour",
      wrong: ["Loud noise always improves animal behaviour and productivity", "Sound has no effect on animals at all", "Only humans, never animals, are affected by loud sound"],
      explanation: "Loud noise can frighten and stress livestock, affecting their behaviour — one of the named community-level effects of loud sound.",
    };
  },
  (rng) => ({
    prompt: `A school in ${place(rng)} rings a bell at the end of every lesson so learners know when to change classes. What role does sound play in this situation?`,
    correct: "Sound is used to signal a specific event — the end of the lesson",
    wrong: ["The bell is used purely for decoration", "Sound cannot be used for signalling at a school", "This use of sound has no real purpose"],
    explanation: "A school bell uses sound as a signal, alerting everyone to an event (the end of the lesson) — the signalling role of sound.",
  }),
];

export const soundEnergy: Skill = {
  id: "g5-sci-fe-sound-energy",
  code: "FE.2",
  subjectId: "science",
  strandId: "g5-sci-fe",
  grade: 5,
  title: "Sound energy",
  description: "The three named sources of sound (vibrating air, vibrating strings, vibrating drums), how sound travels and reflects (echo), the effects of loud sound, and the role of sound in day-to-day life.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["source-categorize", "source-match", "echo-location", "loud-sound-categorize", "role-categorize", "reasoning", "fill-blank"] as const
    );

    if (branch === "source-categorize") {
      const pool = SOUND_SOURCES.flatMap((s) => s.examples.map((ex) => ({ id: `${s.id}-${ex}`, label: ex, source: s.id })));
      const chosen = shuffle(rng, pool).slice(0, 8);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.source));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which source of sound it is an example of"),
        items,
        buckets: SOUND_SOURCES.map((s) => ({ id: s.id, label: s.label })),
        correctBucket,
        hint: "Think about what is actually vibrating to make the sound — air, a string, or a drum skin.",
        explanation: chosen.map((c) => `"${c.label}" is an example of ${SOUND_SOURCES.find((s) => s.id === c.source)!.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "source-match") {
      const tokens = shuffle(rng, SOUND_SOURCES.map((s) => ({ id: s.id, label: s.label })));
      const targets = shuffle(rng, SOUND_SOURCES.map((s) => ({ id: s.id, label: randChoice(rng, s.examples) })));
      const correctMap: Record<string, string> = {};
      for (const s of SOUND_SOURCES) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "source of sound to a real example of it"),
        tokens,
        targets,
        correctMap,
        hint: "Think about what is vibrating in each example.",
        explanation: SOUND_SOURCES.map((s) => `${s.label} — for example, ${s.examples[0].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "echo-location") {
      const target = randChoice(rng, ECHO_LOCATIONS);
      const others = ECHO_LOCATIONS.filter((l) => l !== target);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, `Near ${target}`, shuffle(rng, others).slice(0, 3).map((l) => `Near ${l}`), 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, ECHO_PROMPTS),
        choices,
        correctIndex,
        layout: "list",
        explanation: `An echo happens where sound can reflect off a hard, large surface — such as ${target}.`,
      };
    }

    if (branch === "loud-sound-categorize") {
      const chosen = shuffle(rng, LOUD_SOUND_EFFECTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `l${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`l${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is mainly a personal health effect or a wider community effect"),
        items,
        buckets: [
          { id: "health", label: "Personal health" },
          { id: "community", label: "Wider community" },
        ],
        correctBucket,
        hint: "Hearing damage, headaches and stress are personal health effects; disturbing neighbours, livestock and whole areas are community effects.",
        explanation: chosen.map((f) => `"${f.text}" is mainly a ${f.category === "health" ? "personal health" : "wider community"} effect.`).join(" "),
      };
    }

    if (branch === "role-categorize") {
      const chosen = shuffle(rng, ROLE_OF_SOUND_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `r${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`r${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "the role sound is playing in each situation"),
        items,
        buckets: [
          { id: "communication", label: "Communication" },
          { id: "entertainment", label: "Entertainment" },
          { id: "signalling", label: "Signalling/warning" },
        ],
        correctBucket,
        hint: "Think about whether the sound is used to talk/listen, to entertain, or to warn/signal something.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.category}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Sound made by blowing across a bottle or into a whistle comes from vibrating ", after: ".", correctAnswer: "air" },
      { before: "Sound made by plucking a guitar or a rubber band comes from vibrating ", after: ".", correctAnswer: "strings" },
      { before: "Sound made by striking a drum's stretched skin comes from a vibrating ", after: ".", correctAnswer: "membrane", alsoAccept: ["drum", "drum skin"] },
      { before: "Sound travels outward from its source in all ", after: ".", correctAnswer: "directions" },
      { before: "When sound bounces off a hard surface like a cliff and returns to the listener, this is called an ", after: ".", correctAnswer: "echo" },
      { before: "Very loud sound over a long time can damage a person's ", after: ".", correctAnswer: "hearing" },
      { before: "Constant loud noise can make it difficult to concentrate or ", after: ".", correctAnswer: "sleep" },
      { before: "A car horn uses sound to warn other road users, which is an example of sound used for ", after: ".", correctAnswer: "signalling", alsoAccept: ["warning"] },
      { before: "A school bell uses sound to signal the start or end of a ", after: ".", correctAnswer: "lesson" },
      { before: "Governments can set rules to limit how loud sound may be in an area, addressing sound ", after: ".", correctAnswer: "pollution" },
      { before: "Musical instruments use sound mainly for ", after: ".", correctAnswer: "entertainment" },
      { before: "Loud noise can frighten and stress ", after: " such as livestock on a farm.", correctAnswer: "animals" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about the 3 sources of sound, how it travels, and its effects and roles.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
