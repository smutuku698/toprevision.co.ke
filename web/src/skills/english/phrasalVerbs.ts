import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASAL_VERBS: { verb: string; meaning: string; sentence: string }[] = [
  { verb: "give up", meaning: "to stop trying", sentence: "After two failed attempts, she still refused to ___." },
  { verb: "look after", meaning: "to take care of someone or something", sentence: "Could you ___ my dog this weekend?" },
  { verb: "take off", meaning: "(a plane) to leave the ground", sentence: "The pilot announced the plane was about to ___." },
  { verb: "put off", meaning: "to postpone something", sentence: "We had to ___ the sports day because of the rain." },
  { verb: "turn down", meaning: "to refuse or reject an offer", sentence: "He chose to ___ the scholarship offer." },
  { verb: "break down", meaning: "to stop working suddenly (a machine)", sentence: "Our old van tends to ___ on long journeys." },
  { verb: "call off", meaning: "to cancel", sentence: "The organizers decided to ___ the event." },
  { verb: "carry on", meaning: "to continue", sentence: "Despite the noise, the teacher told us to ___ with our work." },
  { verb: "look forward to", meaning: "to feel excited about something in the future", sentence: "The whole class is starting to ___ the trip." },
  { verb: "hand in", meaning: "to submit", sentence: "Remember to ___ your assignment before Friday." },
  { verb: "run into", meaning: "to meet by chance", sentence: "I didn't expect to ___ my old friend at the market." },
  { verb: "set up", meaning: "to establish or arrange", sentence: "The students plan to ___ a reading club." },
  { verb: "work out", meaning: "to solve or calculate", sentence: "It took her a while to ___ the answer." },
  { verb: "get along with", meaning: "to have a friendly relationship with", sentence: "My new deskmate is easy to ___." },
  { verb: "come across", meaning: "to find unexpectedly", sentence: "While cleaning, I happened to ___ my old diary." },
];

export const phrasalVerbs: Skill = {
  id: "eng-g-phrasal-verbs",
  code: "G.4",
  subjectId: "english",
  strandId: "eng-grammar",
  grade: 9,
  title: "Phrasal verbs in context",
  description: "Choose the phrasal verb that matches a given meaning and completes the sentence.",
  generate(rng) {
    const hint = "Read the sentence with each choice in place — only one matches the given meaning.";

    if (rng() < 0.4) {
      const chosen = shuffle(rng, PHRASAL_VERBS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.verb, label: p.verb })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.verb, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.verb] = p.verb;

      return {
        kind: "click-match",
        prompt: "Match each phrasal verb to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((p) => `"${p.verb}" — ${p.meaning}.`).join(" "),
      };
    }

    const entry = randChoice(rng, PHRASAL_VERBS);
    const distractorPool = PHRASAL_VERBS.filter((p) => p.verb !== entry.verb);
    const distractors = shuffle(rng, distractorPool)
      .slice(0, 3)
      .map((d) => d.verb);
    const choices = shuffle(rng, [entry.verb, ...distractors]);

    return {
      kind: "multiple-choice",
      prompt: `Choose the phrasal verb that means "${entry.meaning}" and completes this sentence: "${entry.sentence}"`,
      choices,
      correctIndex: choices.indexOf(entry.verb),
      layout: "list",
      hint,
      explanation: `"${entry.verb}" means "${entry.meaning}", so the sentence reads: "${entry.sentence.replace("___", entry.verb)}"`,
    };
  },
};
