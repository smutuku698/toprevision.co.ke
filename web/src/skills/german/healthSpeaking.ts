import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PHRASES: { phrase: string; meaning: string }[] = [
  { phrase: "Ich bin krank.", meaning: "I am sick." },
  { phrase: "Ich habe Kopfschmerzen.", meaning: "I have a headache." },
  { phrase: "Ich gehe zum Arzt.", meaning: "I am going to the doctor." },
  { phrase: "Ich gehe ins Krankenhaus.", meaning: "I am going to the hospital." },
  { phrase: "Meine Hand tut mir weh.", meaning: "My hand hurts." },
  { phrase: "Ich habe Schmerzen am Hals.", meaning: "I have pain in my throat." },
];

const SORT_ITEMS: { label: string; bucket: "symptom" | "action" }[] = [
  { label: "Ich bin krank.", bucket: "symptom" },
  { label: "Ich habe Kopfschmerzen.", bucket: "symptom" },
  { label: "Meine Hand tut mir weh.", bucket: "symptom" },
  { label: "Ich habe Schmerzen am Hals.", bucket: "symptom" },
  { label: "Ich gehe zum Arzt.", bucket: "action" },
  { label: "Ich gehe ins Krankenhaus.", bucket: "action" },
];

export const healthSpeaking: Skill = {
  id: "de-ls-health",
  code: "LS.7",
  subjectId: "german",
  strandId: "de-listening-speaking",
  grade: 9,
  title: "My body: at the doctor's",
  description: "Match German illness expressions to their meaning, and sort symptoms from actions taken when sick.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize"] as const);

    if (branch === "categorize") {
      const symptom = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "symptom")).slice(0, 3);
      const action = shuffle(rng, SORT_ITEMS.filter((s) => s.bucket === "action"));
      const items = shuffle(rng, [...symptom, ...action]);
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.label] = it.bucket;

      return {
        kind: "categorize",
        prompt: "Sort each phrase as a Symptom or an Action taken when sick.",
        items: items.map((it) => ({ id: it.label, label: it.label })),
        buckets: [
          { id: "symptom", label: "Symptom" },
          { id: "action", label: "Action" },
        ],
        correctBucket,
        hint: "A symptom describes how you feel; an action describes where you go for help.",
        explanation: `Symptom: ${symptom.map((f) => f.label).join(" / ")}. Action: ${action.map((f) => f.label).join(" / ")}.`,
      };
    }

    const chosen = shuffle(rng, PHRASES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.phrase })));
    const targets = shuffle(rng, chosen.map((p) => ({ id: p.phrase, label: p.meaning })));
    const correctMap: Record<string, string> = {};
    for (const p of chosen) correctMap[p.phrase] = p.phrase;

    return {
      kind: "click-match",
      prompt: "Match each German illness expression to its English meaning.",
      tokens,
      targets,
      correctMap,
      hint: "'weh tun' means 'to hurt' — look at which body part it's attached to.",
      explanation: chosen.map((p) => `"${p.phrase}" means "${p.meaning}".`).join(" "),
    };
  },
};
