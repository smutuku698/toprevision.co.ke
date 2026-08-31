import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SUBJECTS = ["The athlete", "The coach", "The referee", "The gymnast", "The trainer", "The swimmer", "The runner", "The judges", "The spectators", "The officials"];
const PLURAL_SUBJECTS = new Set(["The judges", "The spectators", "The officials"]);

const VERBS: { base: string; past: string }[] = [
  { base: "award", past: "awarded" },
  { base: "praise", past: "praised" },
  { base: "film", past: "filmed" },
  { base: "judge", past: "judged" },
  { base: "time", past: "timed" },
  { base: "announce", past: "announced" },
  { base: "record", past: "recorded" },
  { base: "photograph", past: "photographed" },
  { base: "interview", past: "interviewed" },
  { base: "celebrate", past: "celebrated" },
];
const OBJECTS = ["the gold medal", "the trophy", "the world record", "the final score", "the relay race", "the medal ceremony", "the closing ceremony", "the winning goal", "the marathon route", "the athletes' uniforms"];

const PASSIVE_RULE =
  "In the passive voice, the object of the active sentence becomes the subject, and we add a form of 'to be' + the past participle, followed by 'by' + the original subject.";

const ACTIVE_PASSIVE_PAIRS: { id: string; active: string; passive: string }[] = [
  { id: "p1", active: "The judges awarded the gold medal.", passive: "The gold medal was awarded by the judges." },
  { id: "p2", active: "The crowd cheered the runners.", passive: "The runners were cheered by the crowd." },
  { id: "p3", active: "The coach praised the young gymnast.", passive: "The young gymnast was praised by the coach." },
  { id: "p4", active: "The cameras filmed the closing ceremony.", passive: "The closing ceremony was filmed by the cameras." },
  { id: "p5", active: "The officials recorded the final scores.", passive: "The final scores were recorded by the officials." },
  { id: "p6", active: "The referee disqualified the swimmer.", passive: "The swimmer was disqualified by the referee." },
];

const VOICE_SENTENCES: { text: string; voice: "active" | "passive" }[] = [
  { text: "The athlete broke the world record.", voice: "active" },
  { text: "The world record was broken by the athlete.", voice: "passive" },
  { text: "The spectators filled the stadium.", voice: "active" },
  { text: "The stadium was filled by the spectators.", voice: "passive" },
  { text: "The trainer timed every lap carefully.", voice: "active" },
  { text: "Every lap was timed carefully by the trainer.", voice: "passive" },
  { text: "The organisers announced the results.", voice: "active" },
  { text: "The results were announced by the organisers.", voice: "passive" },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "Why should one use a variety of sentence types, including active and passive voice?",
    correct: "To keep writing interesting and to choose whether the doer or the receiver of the action is more important",
    distractors: [
      "Because passive voice is always grammatically wrong",
      "Because active voice can never be used in formal writing",
      "Variety in sentence type has no real effect on communication",
    ],
  },
  {
    q: "How can one tell the doer of an action in an active sentence?",
    correct: "The doer is the subject, placed before the verb",
    distractors: [
      "The doer always appears after the word 'by'",
      "The doer is never mentioned in an active sentence",
      "The doer is always the last word in the sentence",
    ],
  },
  {
    q: "How can one tell the doer of an action in a passive sentence?",
    correct: "The doer usually appears after the word 'by', at the end of the sentence",
    distractors: [
      "The doer is always the subject of the sentence",
      "The doer is never included in a passive sentence",
      "The doer appears immediately after the main verb with no preposition",
    ],
  },
  {
    q: "In passive voice, what happens to the object of the original active sentence?",
    correct: "It becomes the subject of the passive sentence",
    distractors: [
      "It is removed from the sentence completely",
      "It stays in exactly the same position",
      "It becomes the main verb of the sentence",
    ],
  },
];

export const activePassiveVoice: Skill = {
  id: "g8-eng-g-active-passive-voice",
  code: "G.14",
  subjectId: "english",
  strandId: "g8-eng-grammar",
  grade: 8,
  title: "Sentences: Active and Passive Voice",
  description: "Identify, transform, and construct sentences in the active and passive voice.",
  generate(rng) {
    const branch = randChoice(rng, ["fill", "transform-mc", "match", "categorize", "concept"] as const);

    if (branch === "fill" || branch === "transform-mc") {
      const subject = randChoice(rng, SUBJECTS);
      const verb = randChoice(rng, VERBS);
      const object = randChoice(rng, OBJECTS);
      const isPlural = PLURAL_SUBJECTS.has(subject);
      const be = isPlural ? "were" : "was";

      const activeSentence = `${subject} ${verb.past} ${object}.`;
      const objectCap = object[0].toUpperCase() + object.slice(1);
      const subjectLower = subject.toLowerCase();
      const correctPassive = `${objectCap} ${be} ${verb.past} by ${subjectLower}.`;

      if (branch === "fill") {
        return {
          kind: "fill-blank",
          prompt: `Complete the passive voice sentence for: "${activeSentence}"`,
          before: `${objectCap} `,
          after: ` by ${subjectLower}.`,
          correctAnswer: `${be} ${verb.past}`,
          inputMode: "text",
          hint: "Use a form of 'to be' that matches the new subject, followed by the past participle.",
          explanation: `${PASSIVE_RULE} Here, the object "${object}" becomes the subject "${objectCap}", and the verb becomes "${be} ${verb.past}": "${correctPassive}"`,
        };
      }

      const reverseDirection = rng() < 0.4;

      if (!reverseDirection) {
        const wrong1 = `${objectCap} ${isPlural ? "was" : "were"} ${verb.past} by ${subjectLower}.`; // wrong be-verb agreement
        const wrong2 = `${subject} ${be} ${verb.past} by ${object}.`; // subject/object not swapped
        const wrong3 = `${objectCap} ${be} ${verb.base} by ${subjectLower}.`; // wrong verb form

        const choices = shuffle(rng, [correctPassive, wrong1, wrong2, wrong3]);
        return {
          kind: "multiple-choice",
          prompt: `Rewrite this sentence in the passive voice: "${activeSentence}"`,
          choices,
          correctIndex: choices.indexOf(correctPassive),
          layout: "list",
          hint: "Find the object of the active sentence — it becomes the new subject.",
          explanation: `${PASSIVE_RULE} Here, "${object}" (the object) becomes the subject "${objectCap}", and "${subject}" (the original subject) moves after "by": "${correctPassive}"`,
        };
      }

      const wrongActive1 = `${objectCap} ${verb.past} ${subjectLower}.`; // subject/object left un-swapped
      const wrongActive2 = `${subject} ${verb.base} ${object}.`; // wrong verb tense
      const wrongActive3 = `${subject} ${be} ${verb.past} ${object}.`; // still keeps a "to be" passive form

      const choices = shuffle(rng, [activeSentence, wrongActive1, wrongActive2, wrongActive3]);
      return {
        kind: "multiple-choice",
        prompt: `Rewrite this sentence in the active voice: "${correctPassive}"`,
        choices,
        correctIndex: choices.indexOf(activeSentence),
        layout: "list",
        hint: "Find who is doing the action after 'by' — that becomes the subject of the active sentence.",
        explanation: `${PASSIVE_RULE} To reverse it: the word after "by" ("${subjectLower}") becomes the subject again, and the subject of the passive sentence ("${objectCap}") becomes the object, with the verb changed back to its simple past form: "${activeSentence}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, ACTIVE_PASSIVE_PAIRS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.active })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.passive })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: "Match each active voice sentence to its passive voice equivalent.",
        tokens,
        targets,
        correctMap,
        hint: "Find the object of the active sentence — that word or phrase becomes the subject of the matching passive sentence.",
        explanation: chosen.map((p) => `"${p.active}" ↔ "${p.passive}"`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, VOICE_SENTENCES).slice(0, 6);
      const buckets = [
        { id: "active", label: "Active voice (subject does the action)" },
        { id: "passive", label: "Passive voice (subject receives the action)" },
      ];
      const items = chosen.map((s, i) => ({ id: `v${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`v${i}`] = s.voice));
      return {
        kind: "categorize",
        prompt: "Sort each sentence as active voice or passive voice.",
        items,
        buckets,
        correctBucket,
        hint: "In active voice, the subject performs the action. In passive voice, the subject receives the action, often with 'by' naming the doer.",
        explanation: chosen.map((s) => `"${s.text}" is in the ${s.voice} voice.`).join(" "),
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint: "In active voice, the doer comes first. In passive voice, the receiver comes first and the doer (if named) follows 'by'.",
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
