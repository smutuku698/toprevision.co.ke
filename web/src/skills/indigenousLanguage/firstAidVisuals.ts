import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const STEPS: { id: string; label: string }[] = [
  { id: "check", label: "Check the scene is safe before approaching" },
  { id: "clean", label: "Clean the wound gently with clean water" },
  { id: "cover", label: "Cover the wound with a sterile bandage" },
  { id: "seek", label: "Seek further medical help if the wound is serious" },
];

const CHART_SETS: { title: string; data: { label: string; value: number }[] }[] = [
  {
    title: "cuts and scrapes reported at the school clinic this term",
    data: [
      { label: "Cuts", value: 18 },
      { label: "Sprains", value: 9 },
      { label: "Burns", value: 4 },
      { label: "Nosebleeds", value: 7 },
    ],
  },
  {
    title: "injury types recorded during the sports day first-aid tent",
    data: [
      { label: "Sprains", value: 14 },
      { label: "Cuts", value: 6 },
      { label: "Blisters", value: 11 },
      { label: "Bruises", value: 8 },
    ],
  },
];

export const firstAidVisuals: Skill = {
  id: "il-r-firstaid-visuals",
  code: "R.7",
  subjectId: "indigenous-language",
  strandId: "il-reading",
  grade: 9,
  title: "First aid: reading information from visuals",
  description: "Read information from a chart of injury types and arrange first-aid steps shown in a picture caption, in order.",
  generate(rng) {
    if (rng() < 0.5) {
      return {
        kind: "ordering",
        prompt: "The picture caption below describes treating a minor wound. Arrange the steps in the correct order.",
        instruction: "Click the steps in order, from first to last.",
        items: shuffle(rng, STEPS),
        correctOrder: STEPS.map((s) => s.id),
        hint: "Always make sure the scene is safe before treating a wound, and always finish by deciding whether more help is needed.",
        explanation: `The correct order is: ${STEPS.map((s) => s.label).join(" → ")}.`,
      };
    }

    const chart = randChoice(rng, CHART_SETS);
    const maxEntry = chart.data.reduce((a, b) => (b.value > a.value ? b : a));
    const choices = shuffle(rng, chart.data.map((d) => d.label));

    return {
      kind: "multiple-choice",
      prompt: `This chart shows ${chart.title}. Which type was reported most often?`,
      visual: { type: "bar-chart", data: chart.data },
      choices,
      correctIndex: choices.indexOf(maxEntry.label),
      layout: "row",
      hint: "Look for the tallest bar on the chart.",
      explanation: `"${maxEntry.label}" has the highest value (${maxEntry.value}), so it was reported most often.`,
    };
  },
};
