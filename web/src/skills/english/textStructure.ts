import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Pattern = "sequence" | "cause-effect" | "compare-contrast" | "problem-solution" | "descriptive";

const PATTERN_LABELS: Record<Pattern, string> = {
  sequence: "Sequence / chronological order",
  "cause-effect": "Cause and effect",
  "compare-contrast": "Compare and contrast",
  "problem-solution": "Problem and solution",
  descriptive: "Description",
};

const PATTERN_CLUES: Record<Pattern, string> = {
  sequence: "Uses time-order words like 'first', 'next', 'then', 'finally'",
  "cause-effect": "Uses words like 'because', 'as a result', 'consequently' to link an event to what it caused",
  "compare-contrast": "Uses words like 'unlike', 'however', 'both' to show similarities and differences",
  "problem-solution": "Describes a problem, then explains how it was solved",
  descriptive: "Uses vivid sensory details to paint a picture, without telling events in order",
};

const PARAGRAPHS: { text: string; pattern: Pattern; why: string }[] = [
  {
    text: "First, soak the beans in water overnight. Next, drain the water and rinse the beans. Then, place them in a pot with fresh water and boil until soft. Finally, add salt and your preferred spices before serving.",
    pattern: "sequence",
    why: "It uses time-order words like 'first', 'next', 'then', and 'finally' to describe steps in order.",
  },
  {
    text: "Because the river overflowed its banks, the nearby farms were flooded and many crops were destroyed. As a result, several families lost their main source of income for the season.",
    pattern: "cause-effect",
    why: "It shows how one event ('the river overflowed') led directly to another ('farms were flooded'), signaled by 'because' and 'as a result'.",
  },
  {
    text: "Unlike solar panels, which need direct sunlight to generate electricity, wind turbines can produce power both day and night as long as there is wind. However, both technologies are considered renewable and environmentally friendly.",
    pattern: "compare-contrast",
    why: "It points out similarities and differences between solar panels and wind turbines, using words like 'unlike' and 'both'.",
  },
  {
    text: "Many students were arriving late to school because the only bus was overcrowded. The parents' association decided to hire a second bus and adjust the pickup schedule, which solved the overcrowding problem within two weeks.",
    pattern: "problem-solution",
    why: "It first describes a problem (overcrowded bus, late arrivals) and then explains the solution that was put in place.",
  },
  {
    text: "The old market building has a rusty tin roof and wide wooden doors that creak when opened. Inside, rows of colorful stalls sell everything from fresh mangoes to hand-woven baskets, and the smell of roasted maize fills the air.",
    pattern: "descriptive",
    why: "It paints a picture using sensory details — sights and smells — rather than describing events in order or explaining causes.",
  },
  {
    text: "The volunteers began by clearing the overgrown grass around the borehole. After that, they repaired the broken pump handle. Once the pump was working, they built a small fence around it to keep animals away.",
    pattern: "sequence",
    why: "It describes steps in the order they happened, using words like 'began', 'after that', and 'once'.",
  },
  {
    text: "Since the price of maize flour increased sharply, many families started buying smaller packets more often. Consequently, some shopkeepers began stocking more one-kilogram bags instead of the usual two-kilogram bags.",
    pattern: "cause-effect",
    why: "It links a cause ('price increased') to its effects ('families buying smaller packets', 'shopkeepers stocking differently'), signaled by 'since' and 'consequently'.",
  },
  {
    text: "Both the school library and the new digital learning center offer a quiet place to study. However, the library only has printed books, while the digital center provides internet access and computers for research.",
    pattern: "compare-contrast",
    why: "It compares two places, noting what they share ('both offer a quiet place') and how they differ ('printed books' vs 'internet access').",
  },
  {
    text: "Litter had piled up along the school fence for weeks, attracting flies and creating a bad smell. The student council organized a clean-up day and set up more dustbins around the compound, and the fence area has stayed clean ever since.",
    pattern: "problem-solution",
    why: "It describes a problem (litter, flies, smell) and then the solution the student council carried out.",
  },
  {
    text: "The old baobab tree at the center of the village has a thick, grey trunk wide enough for five children to link hands around it, and its branches spread out like a giant umbrella offering shade to anyone who passes by.",
    pattern: "descriptive",
    why: "It uses vivid sensory detail to describe how the tree looks, rather than telling a sequence of events or explaining a cause.",
  },
];

export const textStructure: Skill = {
  id: "eng-r-structure",
  code: "R.2",
  subjectId: "english",
  strandId: "eng-reading",
  grade: 9,
  title: "Identify the text structure",
  description: "Read a short paragraph and identify how it is organized: sequence, cause-effect, compare-contrast, problem-solution, or description.",
  generate(rng) {
    const hint = "Look for signal words — time words, cause/effect words, comparison words, or vivid sensory details.";

    if (rng() < 0.4) {
      const patterns = Object.keys(PATTERN_LABELS) as Pattern[];
      const tokens = shuffle(rng, patterns.map((p) => ({ id: p, label: PATTERN_LABELS[p] })));
      const targets = shuffle(rng, patterns.map((p) => ({ id: p, label: PATTERN_CLUES[p] })));
      const correctMap: Record<string, string> = {};
      for (const p of patterns) correctMap[p] = p;

      return {
        kind: "click-match",
        prompt: "Match each text structure to its signal clue.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: patterns.map((p) => `${PATTERN_LABELS[p]} — ${PATTERN_CLUES[p].toLowerCase()}.`).join(" "),
      };
    }

    const entry = randChoice(rng, PARAGRAPHS);
    const correctLabel = PATTERN_LABELS[entry.pattern];
    const choices = shuffle(rng, Object.values(PATTERN_LABELS));

    return {
      kind: "multiple-choice",
      passage: entry.text,
      prompt: "What is the organizational structure of this paragraph?",
      choices,
      correctIndex: choices.indexOf(correctLabel),
      layout: "list",
      hint,
      explanation: entry.why,
    };
  },
};
