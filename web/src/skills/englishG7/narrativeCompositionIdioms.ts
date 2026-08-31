import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const IDIOMS: {
  idiom: string;
  meaning: string;
  example: string;
  fillBefore: string;
  fillAfter: string;
  situation: string;
  group: "task-size" | "behaviour";
}[] = [
  {
    idiom: "bite off more than you can chew",
    meaning: "To take on more responsibility than you can handle",
    example: "If you agree to cover three accident sites alone tonight, you might bite off more than you can chew.",
    fillBefore: "If you agree to cover three accident sites alone tonight, you might",
    fillAfter: ".",
    situation: "A volunteer paramedic takes on far more emergency cases than she can realistically handle in one night.",
    group: "task-size",
  },
  {
    idiom: "own up to something",
    meaning: "To admit responsibility for a mistake or wrongdoing",
    example: "After the crash, the driver had to own up to something and accept the consequences.",
    fillBefore: "After the crash, the driver had to",
    fillAfter: "and accept the consequences.",
    situation: "A driver who caused a crash finally admits he was at fault instead of hiding it.",
    group: "behaviour",
  },
  {
    idiom: "have a lot on your plate",
    meaning: "To have many tasks or responsibilities to deal with at once",
    example: "As the only two nurses on duty with three crash victims arriving at once, you were about to have a lot on your plate that night.",
    fillBefore: "As the only two nurses on duty with three crash victims arriving at once, you were about to",
    fillAfter: "that night.",
    situation: "An emergency team must handle several urgent crash victims at the same time.",
    group: "task-size",
  },
  {
    idiom: "call it a day",
    meaning: "To stop working on something, usually because enough has been done for now",
    example: "Once the last ambulance had left the crash scene, the traffic police decided to call it a day.",
    fillBefore: "Once the last ambulance had left the crash scene, the traffic police decided to",
    fillAfter: ".",
    situation: "The traffic police decide to stop working because the crash scene has finally been cleared.",
    group: "behaviour",
  },
  {
    idiom: "a piece of cake",
    meaning: "Something very easy to do",
    example: "For the experienced rescue team, freeing the trapped driver from the wreckage was a piece of cake.",
    fillBefore: "For the experienced rescue team, freeing the trapped driver from the wreckage was",
    fillAfter: ".",
    situation: "A skilled rescue team frees a trapped driver from a wrecked car with almost no difficulty.",
    group: "task-size",
  },
  {
    idiom: "hold your tongue",
    meaning: "To stay silent and not say something, even when you want to",
    example: "Even if you're furious at a reckless driver, it's wise to hold your tongue until the police arrive.",
    fillBefore: "Even if you're furious at a reckless driver, it's wise to",
    fillAfter: "until the police arrive.",
    situation: "A furious witness decides not to say anything until the police arrive at the scene.",
    group: "behaviour",
  },
];

const MISUSE_PAIRS: { idiom: string; correct: string; incorrect: string }[] = [
  {
    idiom: "a piece of cake",
    correct: "The mechanic said fixing the flat tyre was a piece of cake because it took him only two minutes.",
    incorrect: "The mechanic said fixing the crashed car's engine was a piece of cake because it was so badly damaged and took three days to repair.",
  },
  {
    idiom: "bite off more than you can chew",
    correct: "The new traffic officer bit off more than he could chew when he agreed to direct traffic at three accident sites at once.",
    incorrect: "The experienced traffic officer bit off more than he could chew when he calmly and easily directed traffic at a single, minor accident.",
  },
  {
    idiom: "own up to something",
    correct: "The driver owned up to causing the crash instead of blaming the other car.",
    incorrect: "The driver owned up to causing the crash by insisting loudly that it was entirely the other car's fault.",
  },
  {
    idiom: "call it a day",
    correct: "After clearing the wreckage from the highway, the rescue team called it a day and headed home.",
    incorrect: "In the middle of rescuing the trapped passengers, the team suddenly called it a day and kept working through the night.",
  },
];

export const narrativeCompositionIdioms: Skill = {
  id: "g7-eng-w-narrative-composition-idioms",
  code: "W.13",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Creative Writing: Narrative Composition with Idioms",
  description: "Explain and correctly use idioms such as 'bite off more than you can chew' and 'own up to something' in narrative sentences about road-crash emergency response.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-meaning", "match", "fill", "mc-situation", "mc-misuse", "categorize"] as const);
    const hint = "An idiom's meaning is figurative, not literal — think about the message the whole phrase is used to express.";

    if (branch === "mc-meaning") {
      const entry = randChoice(rng, IDIOMS);
      const distractors = shuffle(rng, IDIOMS.filter((i) => i.idiom !== entry.idiom))
        .slice(0, 3)
        .map((i) => i.meaning);
      const choices = shuffle(rng, [entry.meaning, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `What does the idiom "${entry.idiom}" mean?`,
        choices,
        correctIndex: choices.indexOf(entry.meaning),
        layout: "list",
        hint,
        explanation: `"${entry.idiom}" means: ${entry.meaning}. For example: "${entry.example}"`,
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, IDIOMS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((i) => ({ id: i.idiom, label: i.idiom })));
      const targets = shuffle(rng, chosen.map((i) => ({ id: i.idiom, label: i.meaning })));
      const correctMap: Record<string, string> = {};
      for (const i of chosen) correctMap[i.idiom] = i.idiom;
      return {
        kind: "click-match",
        prompt: "Match each idiom to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((i) => `"${i.idiom}" means: ${i.meaning}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, IDIOMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the idiom that correctly completes this narrative sentence about emergency response during a road crash.",
        before: entry.fillBefore,
        after: entry.fillAfter,
        correctAnswer: entry.idiom,
        acceptedAnswers: [entry.idiom, entry.idiom.charAt(0).toUpperCase() + entry.idiom.slice(1)],
        inputMode: "text",
        hint: `This idiom means: ${entry.meaning}`,
        explanation: `The complete sentence is: "${entry.example}" — "${entry.idiom}" means: ${entry.meaning}`,
      };
    }

    if (branch === "mc-situation") {
      const entry = randChoice(rng, IDIOMS);
      const distractors = shuffle(rng, IDIOMS.filter((i) => i.idiom !== entry.idiom))
        .slice(0, 3)
        .map((i) => i.idiom);
      const choices = shuffle(rng, [entry.idiom, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Which idiom best fits this situation? "${entry.situation}"`,
        choices,
        correctIndex: choices.indexOf(entry.idiom),
        layout: "list",
        hint,
        explanation: `"${entry.idiom}" fits best — it means: ${entry.meaning}`,
      };
    }

    if (branch === "mc-misuse") {
      const entry = randChoice(rng, MISUSE_PAIRS);
      const choices = shuffle(rng, [entry.correct, entry.incorrect]);
      return {
        kind: "multiple-choice",
        prompt: `Which sentence uses the idiom "${entry.idiom}" correctly?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Check whether the idiom's figurative meaning actually matches what is happening in the sentence.",
        explanation: `"${entry.correct}" uses the idiom correctly. The other sentence misapplies the idiom's meaning to a situation it doesn't fit.`,
      };
    }

    const taskSize = shuffle(rng, IDIOMS.filter((i) => i.group === "task-size")).slice(0, 3);
    const behaviour = shuffle(rng, IDIOMS.filter((i) => i.group === "behaviour")).slice(0, 3);
    const items = shuffle(rng, [...taskSize, ...behaviour]).map((i, idx) => ({ id: `i${idx}`, label: i.idiom, group: i.group }));
    const correctBucket: Record<string, string> = {};
    for (const it of items) correctBucket[it.id] = it.group;
    return {
      kind: "categorize",
      prompt: "Sort each idiom into How big or easy a task is or Behaviour and choices.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "task-size", label: "How big or easy a task is" },
        { id: "behaviour", label: "Behaviour and choices" },
      ],
      correctBucket,
      hint: "Some idioms describe how much work or difficulty a task involves. Others describe how a person chooses to act or speak.",
      explanation: `Task size: ${taskSize.map((t) => t.idiom).join(" / ")}. Behaviour: ${behaviour.map((b) => b.idiom).join(" / ")}.`,
    };
  },
};
