import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES, SOUND_BANK, crossThemeSoundDistractors } from "./lsSharedA";

// Theme 4 vocabulary, verbatim from curriculum-reference/grade-6/english.json (Emergency Rescue Services).
const VOCAB: { word: string; meaning: string }[] = [
  { word: "red cross", meaning: "an international emergency-aid organisation" },
  { word: "ambulance", meaning: "a vehicle for transporting sick or injured people" },
  { word: "emergency", meaning: "a serious, unexpected situation needing urgent action" },
  { word: "flying doctors", meaning: "medical teams that fly to reach patients quickly" },
  { word: "rescue", meaning: "to save someone from danger" },
  { word: "security", meaning: "safety from danger or harm" },
  { word: "epidemic", meaning: "a widespread outbreak of a disease" },
  { word: "amputate", meaning: "to surgically remove a limb" },
  { word: "aid", meaning: "help given in a difficult situation" },
  { word: "stroke", meaning: "a sudden loss of brain function due to blocked blood flow" },
  { word: "unconscious", meaning: "not awake or aware of surroundings" },
  { word: "casualty", meaning: "a person injured or killed in an accident" },
  { word: "oxygen mask", meaning: "a device that supplies oxygen to a patient" },
  { word: "hazard", meaning: "a danger or risk" },
  { word: "precaution", meaning: "an action taken to prevent danger" },
  { word: "critical", meaning: "extremely serious" },
  { word: "escape", meaning: "to get away from danger" },
  { word: "intensive care unit", meaning: "the hospital ward for critically ill patients" },
  { word: "watch out", meaning: "to be careful of danger" },
  { word: "one way", meaning: "a road allowing traffic in only one direction" },
  { word: "two way", meaning: "a road allowing traffic in both directions" },
  { word: "dual carriage way", meaning: "a road with a barrier separating both directions" },
  { word: "guard rails", meaning: "barriers that protect road users from hazards" },
  { word: "culverts", meaning: "tunnels that carry water under a road" },
  { word: "road median", meaning: "the strip separating opposite lanes of traffic" },
  { word: "chevron", meaning: "an arrow-shaped road sign showing a bend" },
  { word: "reflectors", meaning: "devices that reflect light for road visibility at night" },
];

type Expression = { text: string; type: "fixed phrase" | "simile" | "metaphor" | "proverb" | "idiom" | "phrasal verb"; meaning: string };
const EXPRESSIONS: Expression[] = [
  { text: "catch fire", type: "fixed phrase", meaning: "to start burning" },
  { text: "on fire", type: "fixed phrase", meaning: "currently burning" },
  { text: "cause for alarm", type: "fixed phrase", meaning: "a reason to worry" },
  { text: "in time", type: "fixed phrase", meaning: "early enough for something" },
  { text: "lose control", type: "fixed phrase", meaning: "to no longer be in charge of something" },
  { text: "as fast as lightning", type: "simile", meaning: "extremely fast" },
  { text: "as light as a feather", type: "simile", meaning: "extremely light in weight" },
  { text: "as helpless as a baby", type: "simile", meaning: "completely unable to help oneself" },
  { text: "as cunning as a fox", type: "simile", meaning: "very clever in a sly way" },
  { text: "The boy was a fox, he was so cunning", type: "metaphor", meaning: "calling someone a fox to show they are sly and clever" },
  { text: "prevention is better than cure", type: "proverb", meaning: "it is better to stop a problem before it happens" },
  { text: "there is no smoke without fire", type: "proverb", meaning: "a rumour is usually based on some truth" },
  { text: "a stitch in time saves nine", type: "proverb", meaning: "fixing a small problem early prevents a bigger one" },
  { text: "face the music", type: "idiom", meaning: "to accept the consequences of your actions" },
  { text: "play with fire", type: "idiom", meaning: "to take a big risk" },
  { text: "in the nick of time", type: "idiom", meaning: "at the very last possible moment" },
  { text: "get into hot water", type: "idiom", meaning: "to get into trouble" },
  { text: "care for", type: "phrasal verb", meaning: "to look after someone" },
  { text: "put out", type: "phrasal verb", meaning: "to extinguish a fire" },
];

const THEME_SOUNDS = SOUND_BANK.filter((e) => e.theme === "LS.4");

const SCENARIOS: { name: (n: string, p: string) => string; correct: string; wrong: string[] }[] = [
  {
    name: (n, p) => `The ambulance arrived at the accident scene near ${p} within two minutes. Which idiom best describes this?`,
    correct: "in the nick of time",
    wrong: ["face the music", "get into hot water", "play with fire"],
  },
  {
    name: (n) => `${n} ran across a busy dual carriage way without watching for traffic. Which idiom describes this dangerous choice?`,
    correct: "play with fire",
    wrong: ["in the nick of time", "as light as a feather", "as helpless as a baby"],
  },
  {
    name: (n) => `The rescue team moved to reach the casualty as quickly as they possibly could. Which simile shows their speed?`,
    correct: "as fast as lightning",
    wrong: ["as light as a feather", "as cunning as a fox", "as helpless as a baby"],
  },
  {
    name: (n) => `After ignoring the road-safety precautions and causing a crash, ${n} had to explain everything to the police. Which idiom fits ${n}'s situation?`,
    correct: "face the music",
    wrong: ["in the nick of time", "put out", "care for"],
  },
];

export const emergencyRescueStress: Skill = {
  id: "g6-eng-ls-emergency-rescue",
  code: "LS.4",
  subjectId: "english",
  strandId: "g6-eng-listening-speaking",
  grade: 6,
  title: "Emergency Rescue Services — Word Stress",
  description: "Identify words with the sound /ʊə/, distinguish nouns/verbs/adjectives by stress, use emergency-rescue vocabulary correctly, and use similes, a metaphor, proverbs, idioms and phrasal verbs in context.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "vocab-meaning-mc", "vocab-scenario-mc", "idiom-scenario-mc", "vocab-click-match", "vocab-categorize", "expression-fill-blank"] as const);

    if (branch === "sound-mc") {
      const target = randChoice(rng, THEME_SOUNDS);
      const distractors = crossThemeSoundDistractors(rng, target.sound, 3);
      const choices = shuffle(rng, [target.word, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which of these words has the same vowel sound as in "sure" (${target.sound})?`,
        choices,
        correctIndex: choices.indexOf(target.word),
        layout: "row",
        hint: `Say each word aloud and listen for the ${target.sound} sound.`,
        explanation: `"${target.word}" contains the sound ${target.sound}.`,
      };
    }

    if (branch === "vocab-meaning-mc") {
      const item = randChoice(rng, VOCAB);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.meaning, ...distractors.map((d) => d.meaning)]);
      return {
        kind: "multiple-choice",
        prompt: `What does the term "${item.word}" mean?`,
        choices,
        correctIndex: choices.indexOf(item.meaning),
        layout: "list",
        hint: "Think about emergencies, road safety and rescue services.",
        explanation: `"${item.word}" means: ${item.meaning}.`,
      };
    }

    if (branch === "vocab-scenario-mc") {
      const item = randChoice(rng, VOCAB);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const distractors = shuffle(rng, VOCAB.filter((v) => v.word !== item.word)).slice(0, 3);
      const choices = shuffle(rng, [item.word, ...distractors.map((d) => d.word)]);
      return {
        kind: "multiple-choice",
        prompt: `A rescue worker in ${place} tells ${name}: "${item.meaning}." Which term matches this?`,
        choices,
        correctIndex: choices.indexOf(item.word),
        layout: "row",
        hint: "Match the description to the exact term.",
        explanation: `The term is "${item.word}" — it means ${item.meaning}.`,
      };
    }

    if (branch === "idiom-scenario-mc") {
      const scenario = randChoice(rng, SCENARIOS);
      const name = randChoice(rng, KENYAN_NAMES);
      const place = randChoice(rng, KENYAN_PLACES);
      const choices = shuffle(rng, [scenario.correct, ...scenario.wrong]);
      const matched = EXPRESSIONS.find((e) => e.text === scenario.correct)!;
      return {
        kind: "multiple-choice",
        prompt: scenario.name(name, place),
        choices,
        correctIndex: choices.indexOf(scenario.correct),
        layout: "list",
        hint: `Think about what "${scenario.correct}" really means: ${matched.meaning}.`,
        explanation: `"${scenario.correct}" means ${matched.meaning}.`,
      };
    }

    if (branch === "vocab-click-match") {
      const pool = shuffle(rng, VOCAB).slice(0, 6);
      const tokens = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, pool.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of pool) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each emergency-rescue term to its meaning.",
        tokens,
        targets,
        correctMap,
        hint: "Some of these terms describe road features, others describe medical situations.",
        explanation: pool.map((v) => `"${v.word}" means ${v.meaning}.`).join(" "),
      };
    }

    if (branch === "vocab-categorize") {
      const medicalWords = ["ambulance", "epidemic", "amputate", "aid", "stroke", "unconscious", "casualty", "oxygen mask", "intensive care unit"];
      const roadWords = ["one way", "two way", "dual carriage way", "guard rails", "culverts", "road median", "chevron", "reflectors"];
      const pool = shuffle(rng, [
        ...medicalWords.map((w) => ({ id: w, label: w, bucket: "medical" })),
        ...roadWords.map((w) => ({ id: w, label: w, bucket: "road" })),
      ]).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const item of pool) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Sort these emergency-theme terms: is it about MEDICAL CARE, or about ROAD FEATURES/SAFETY?",
        items: pool.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "medical", label: "Medical Care" },
          { id: "road", label: "Road Feature / Safety" },
        ],
        correctBucket,
        hint: "Medical words relate to treating patients; road words name features of a road.",
        explanation: "Medical words: ambulance, epidemic, amputate, aid, stroke, unconscious, casualty, oxygen mask, intensive care unit. Road words: one way, two way, dual carriage way, guard rails, culverts, road median, chevron, reflectors.",
      };
    }

    const t = randChoice(rng, FILL_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: `Complete the sentence using the expression "${t.text}".`,
      before: t.before,
      after: t.after,
      correctAnswer: t.text,
      inputMode: "text",
      hint: `This ${t.type} means: ${t.meaning}.`,
      explanation: `"${t.text}" (${t.type}) means ${t.meaning}.`,
    };
  },
};

// Fill-blank pairs where the surrounding sentence genuinely fits the specific expression it names.
const FILL_TEMPLATES: { text: string; type: string; meaning: string; before: string; after: string }[] = [
  { text: "catch fire", type: "fixed phrase", meaning: "to start burning", before: "The dry grass near the road began to ", after: " after a spark from a passing vehicle." },
  { text: "on fire", type: "fixed phrase", meaning: "currently burning", before: "The neighbours shouted that the house was ", after: "." },
  { text: "cause for alarm", type: "fixed phrase", meaning: "a reason to worry", before: "A small amount of smoke from cooking is normal, but thick black smoke is ", after: "." },
  { text: "in time", type: "fixed phrase", meaning: "early enough for something", before: "The ambulance arrived ", after: " to save the casualty." },
  { text: "lose control", type: "fixed phrase", meaning: "to no longer be in charge of something", before: "The driver swerved on the wet road and began to ", after: " of the vehicle." },
  { text: "as fast as lightning", type: "simile", meaning: "extremely fast", before: "The rescue team reached the scene ", after: "." },
  { text: "as helpless as a baby", type: "simile", meaning: "completely unable to help oneself", before: "After the stroke, the patient felt ", after: "." },
  { text: "as cunning as a fox", type: "simile", meaning: "very clever in a sly way", before: "The suspect who tricked security to escape was described as ", after: "." },
  { text: "prevention is better than cure", type: "proverb", meaning: "it is better to stop a problem before it happens", before: "Wearing a seatbelt every time proves that \"", after: "\"." },
  { text: "there is no smoke without fire", type: "proverb", meaning: "a rumour is usually based on some truth", before: "When people kept talking about the hazard at the culvert, elders said \"", after: "\"." },
  { text: "a stitch in time saves nine", type: "proverb", meaning: "fixing a small problem early prevents a bigger one", before: "Fixing the broken guard rail immediately shows that \"", after: "\"." },
  { text: "face the music", type: "idiom", meaning: "to accept the consequences of your actions", before: "After ignoring the road signs and causing the crash, the driver had to ", after: "." },
  { text: "play with fire", type: "idiom", meaning: "to take a big risk", before: "Overtaking on a dual carriage way bend is like choosing to ", after: "." },
  { text: "in the nick of time", type: "idiom", meaning: "at the very last possible moment", before: "The paramedics reached the unconscious casualty ", after: "." },
  { text: "get into hot water", type: "idiom", meaning: "to get into trouble", before: "Ignoring every road-safety precaution can make a driver ", after: " with the police." },
  { text: "care for", type: "phrasal verb", meaning: "to look after someone", before: "Nurses in the intensive care unit ", after: " critically ill patients around the clock." },
  { text: "put out", type: "phrasal verb", meaning: "to extinguish a fire", before: "The firefighters worked quickly to ", after: " the flames before they spread to the next house." },
];
