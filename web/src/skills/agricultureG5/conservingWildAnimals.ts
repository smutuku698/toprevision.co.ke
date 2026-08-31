import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt, evaluateCloser } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 1.3 Conserving Wild Animals — safe ways of repelling SMALL wild animals
// (smoke, smell repellant, "or any other" safe method) to avoid property damage, while appreciating the
// importance of living better with wild animals rather than harming them. See
// curriculum-reference/grade-5/agriculture.json — source explicitly scopes to small wild animals, not large
// dangerous wildlife.

const REPELLENT_METHODS = [
  { id: "smoke", label: "Smoke", explanation: "Burning suitable material to produce smoke that many small animals avoid" },
  { id: "smell", label: "Smell repellent", explanation: "Using a strong smell (such as chilli or garlic mixtures) that discourages animals without harming them" },
  { id: "noise", label: "Noise-making", explanation: "Making sudden or repeated noise, such as banging tins, to startle animals away" },
  { id: "barrier", label: "Physical barrier", explanation: "Using a fence, mesh or other barrier to physically keep small animals out of an area" },
] as const;

const NUISANCE_SCENARIOS = [
  { id: "monkeys", animal: "monkeys", problem: "raiding a maize garden every morning", bestMethod: "Noise-making — loud, sudden sound to scare a bold, alert animal away" },
  { id: "mongooses", animal: "mongooses", problem: "stealing eggs from the chicken coop at night", bestMethod: "A physical barrier — securing the coop so the animal cannot get in at all" },
  { id: "birds", animal: "wild birds", problem: "eating newly sown grain seeds from the field", bestMethod: "Noise-making — a scarecrow or repeated sound to keep birds from landing" },
  { id: "squirrels", animal: "squirrels", problem: "damaging stored maize in the granary", bestMethod: "A physical barrier — sealing the granary so it cannot be entered" },
  { id: "porcupines", animal: "porcupines", problem: "digging up planted sweet potato tubers at night", bestMethod: "A smell repellent — a strong odour around the bed to discourage digging" },
  { id: "hares", animal: "hares", problem: "eating young vegetable seedlings in a kitchen garden", bestMethod: "A physical barrier — mesh or fencing low enough to block a small animal" },
] as const;

const PRACTICE_SAFETY = [
  { text: "Lighting a small, controlled fire at a safe distance to produce smoke near a garden", isSafe: true },
  { text: "Spraying a home-made chilli-and-water mixture around crops to deter animals", isSafe: true },
  { text: "Banging tins or making loud noise to scare animals away from a field", isSafe: true },
  { text: "Building a simple fence or mesh barrier around a vulnerable garden bed", isSafe: true },
  { text: "Setting out poisoned food to kill any animal that comes near the crops", isSafe: false },
  { text: "Setting a cruel trap intended to seriously injure any animal that triggers it", isSafe: false },
  { text: "Hunting and killing wild animals simply for coming near a garden", isSafe: false },
  { text: "Burning down a large area of natural habitat to drive animals away permanently", isSafe: false },
] as const;

// A general procedure implied by the sub-strand's own outcomes/learning experiences (identify → watch/listen to
// guidance → innovate/choose a method → apply it → discuss/appreciate importance) — condensed for an ordering branch.
const REPEL_PROCEDURE_STEPS = [
  { id: "r1", label: "Identify which small wild animal is damaging property and how" },
  { id: "r2", label: "Watch a video clip or listen to a resource person about safe repelling methods" },
  { id: "r3", label: "Choose or innovate a safe method suited to that animal, such as smoke, smell, noise or a barrier" },
  { id: "r4", label: "Prepare the materials needed and apply the method near the affected area" },
  { id: "r5", label: "Check whether the method is working and adjust it if the animal is still causing damage" },
  { id: "r6", label: "Discuss with peers the importance of living better with wild animals" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const s = randChoice(rng, NUISANCE_SCENARIOS);
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps finding ${s.animal} ${s.problem}, and wants a safe way to stop this without harming the animals. Which named method could ${who} try?`,
      correct: "A safe method such as smoke or a smell repellent",
      wrong: ["Poisoning food to kill any animal that comes near", "Hunting and killing the animals responsible", "Doing nothing, since nothing can safely be done"],
      explanation: "The curriculum names smoke and smell repellents as safe ways to repel small wild animals without harming them.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} chooses to spray a home-made chilli-and-water mixture around a vegetable garden rather than setting a poisoned trap. Why is this the better choice?`,
    correct: "It safely deters animals using smell, without killing or seriously harming them",
    wrong: ["It is not actually effective at all, so the choice makes no difference", "Poisoning is always the safer and more responsible option", "Chilli spray attracts more animals rather than deterring them"],
    explanation: "A smell repellent like a chilli mixture discourages animals safely, matching the sub-strand's emphasis on safe, non-harmful methods.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} lights a small, carefully controlled fire a safe distance from a garden to produce smoke, keeping monkeys away from the crops. What must ${who} be especially careful about?`,
      correct: "Keeping the fire small, controlled and at a safe distance so it does not spread or cause a hazard",
      wrong: ["Nothing — an uncontrolled fire of any size is equally safe", "Making the fire as large as possible for the strongest effect", "Lighting the fire as close to the crops as possible"],
      explanation: "Using smoke as a repellent must still be done safely — a controlled, safely-distanced fire, not a large uncontrolled one.",
    };
  },
  (rng) => ({
    prompt: `A community elder in ${place(rng)} teaches children to appreciate wild animals in the area rather than simply trying to eliminate every animal that comes near a farm. What value does this reflect?`,
    correct: "Living better with wild animals and appreciating their importance in the environment",
    wrong: ["The idea that wild animals should always be feared and avoided entirely", "The belief that wild animals have no importance in the environment", "The idea that farms and wild animals can never coexist at all"],
    explanation: "This sub-strand emphasises appreciating the importance of living better with wild animals, not eliminating them entirely.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices wild birds eating newly planted seeds from a field every morning. What safe repelling method, beyond smoke or smell, could also work here?`,
      correct: "Making noise, such as banging tins, to startle the birds away",
      wrong: ["Poisoning the seeds so any bird that eats them is harmed", "Setting fire to the entire field to drive birds away permanently", "Nothing else can ever work besides smoke and smell repellents"],
      explanation: "The curriculum allows 'smoke, smell repellant or any other' safe method — noise-making is a reasonable additional safe method for repelling birds.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} builds a simple mesh barrier around a vulnerable vegetable bed instead of using smoke or smell repellents. Is this still in keeping with the sub-strand's approach to conserving wild animals?`,
    correct: "Yes, since a physical barrier keeps animals out safely without harming them, just like smoke or smell repellents",
    wrong: ["No, only smoke and smell repellents count as acceptable methods", "No, because barriers always harm animals that try to cross them", "No, because barriers are never effective against small animals"],
    explanation: "Any safe method that protects property without harming animals fits the sub-strand's goal — a physical barrier is a reasonable extension of 'or any other' safe method.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} finds porcupine holes where sweet potato tubers used to be planted, damaged overnight. What should ${who} avoid doing, based on this sub-strand's guidance?`,
      correct: "Avoid setting cruel traps or poison meant to seriously harm or kill the porcupines",
      wrong: ["Avoid using any repellent method at all, even safe ones", "Avoid protecting the crop in any way", "Avoid discussing the problem with anyone else"],
      explanation: "The sub-strand's guidance is specifically about SAFE ways of repelling animals — cruel traps or poison go against this, even though a real nuisance exists.",
    };
  },
  (rng) => ({
    prompt: `A resource person visiting a school in ${place(rng)} explains that repelling animals safely (rather than killing them) benefits the whole community over time. What is the best explanation for this?`,
    correct: "Wild animal populations remain healthy and balanced in the environment, which benefits everyone long-term",
    wrong: ["Killing animals always benefits the environment more than repelling them", "Wild animal numbers have no real effect on the environment either way", "Safe repelling only benefits the individual farmer, never the wider community"],
    explanation: "Conserving wild animal populations (rather than eliminating them) supports a healthier, more balanced environment, which is the sub-strand's underlying value.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} innovates a new way of scaring hares away from young seedlings in ${place(rng)}, using an old radio playing sound intermittently near the garden. Is this consistent with the design's own guidance on repelling small wild animals?`,
      correct: "Yes, it is a safe, non-harmful method the design's 'or any other' phrase allows learners to innovate",
      wrong: ["No, only the two named methods (smoke and smell) are ever allowed", "No, because sound has no realistic effect on hares at all", "No, because this method would definitely harm the hares"],
      explanation: "The design explicitly invites learners to 'innovate safe ways' beyond the two named methods, as long as the method is safe and does not harm the animals.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} destroys a large area of natural bushland near their farm, hoping to permanently drive away all wild animals nearby. How does this compare to the sub-strand's recommended approach?`,
    correct: "It goes against the recommended approach, which favours safe, targeted repelling methods over destroying habitat",
    wrong: ["It matches the recommended approach exactly", "Destroying habitat is always the safest way to protect crops", "The sub-strand has no guidance relevant to this situation"],
    explanation: "Destroying habitat is neither a safe, targeted repelling method nor consistent with appreciating and living better with wild animals — it contradicts this sub-strand's values.",
  }),
];

export const conservingWildAnimals: Skill = {
  id: "g5-ag-conservation-conserving-wild-animals",
  code: "CR.3",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-conservation",
  grade: 5,
  title: "Conserving wild animals",
  description: "Safe ways of repelling small wild animals (smoke, smell repellent, and other safe methods) to protect property, while appreciating the importance of living better with wild animals.",
  generate(rng) {
    const branch = randChoice(rng, ["method-categorize", "scenario-best-method-match", "procedure-order", "scenario-method-mc", "safety-evaluate", "reasoning", "fill-blank"] as const);

    if (branch === "method-categorize") {
      const items = REPELLENT_METHODS.map((m) => ({ id: m.id, label: m.explanation }));
      const correctBucket: Record<string, string> = {};
      for (const m of REPELLENT_METHODS) correctBucket[m.id] = m.id;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which safe repelling method it describes"),
        items: shuffle(rng, items),
        buckets: REPELLENT_METHODS.map((m) => ({ id: m.id, label: m.label })),
        correctBucket,
        hint: "Think about what each method actually uses to discourage the animal — a smell, a sound, a barrier, or smoke.",
        explanation: REPELLENT_METHODS.map((m) => `${m.label} — ${m.explanation}.`).join(" "),
      };
    }

    if (branch === "scenario-best-method-match") {
      const chosen = shuffle(rng, NUISANCE_SCENARIOS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.id, label: `A safe way to stop ${s.animal} from ${s.problem}` })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.id, label: s.bestMethod })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.id] = s.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "nuisance situation to the safe method best suited to it"),
        tokens,
        targets,
        correctMap,
        hint: "Think about whether the animal needs to be startled away, kept out physically, or discouraged by smell.",
        explanation: chosen.map((s) => `For ${s.animal} ${s.problem}: ${s.bestMethod}.`).join(" "),
      };
    }

    if (branch === "procedure-order") {
      const shuffled = shuffle(rng, REPEL_PROCEDURE_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of safely dealing with a small wild animal damaging property"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: REPEL_PROCEDURE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Identify the problem first, learn about safe methods, then choose, apply, and check the method.",
        explanation: "Correct order: " + REPEL_PROCEDURE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "scenario-method-mc") {
      const s = randChoice(rng, NUISANCE_SCENARIOS);
      const who = name(rng);
      const correct = "A safe method such as smoke, a smell repellent, noise, or a barrier — never poison or a cruel trap";
      const wrong = ["Poisoning the animals to kill them", "Setting a trap designed to seriously injure them", "Destroying the animals' natural habitat entirely"];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${who} in ${place(rng)} has a problem with ${s.animal} ${s.problem}. What kind of method should ${who} use to deal with this safely?`,
        choices,
        correctIndex,
        layout: "list",
        explanation: "The sub-strand's guidance is always to use safe methods that don't harm the animal, not to kill or seriously injure it.",
      };
    }

    if (branch === "safety-evaluate") {
      const s = randChoice(rng, PRACTICE_SAFETY);
      const safeLabel = "Yes, this is a safe way to repel wild animals";
      const unsafeLabel = "No, this is not a safe way to repel wild animals";
      const choices = shuffle(rng, [safeLabel, unsafeLabel]);
      const correctLabel = s.isSafe ? safeLabel : unsafeLabel;
      return {
        kind: "multiple-choice",
        prompt: `${s.text}. ${evaluateCloser(rng)}`,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "list",
        explanation: s.isSafe
          ? "This practice discourages animals without seriously harming them — a safe repelling method."
          : "This practice can seriously harm or kill animals, which goes against using safe repelling methods.",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "Burning suitable material to produce a deterrent smell and drying effect that repels animals is called using ", after: ".", correctAnswer: "smoke" },
      { before: "Using a strong odour like chilli or garlic to discourage animals without harming them is called a ", after: ".", correctAnswer: "smell repellent" },
      { before: "The curriculum's guidance is specifically about ", after: " ways of repelling small wild animals.", correctAnswer: "safe" },
      { before: "Poisoning or trapping animals to seriously injure them goes against using ", after: " methods.", correctAnswer: "safe" },
      { before: "This sub-strand emphasises living better with wild animals rather than trying to ", after: " them entirely.", correctAnswer: "eliminate" },
      { before: "Besides smoke and smell repellents, learners are encouraged to ", after: " other safe ways of repelling small animals.", correctAnswer: "innovate" },
      { before: "The sub-strand scopes its safe repelling methods to ", after: " wild animals, not large dangerous wildlife.", correctAnswer: "small" },
      { before: "Making loud noise, such as banging tins, to startle animals away is a safe method beyond smoke and ", after: ".", correctAnswer: "smell repellent" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer],
      inputMode: "text",
      hint: "Think about the two named safe repelling methods and why safety and conservation both matter here.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
