import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const INSTRUMENTS: { name: string; measures: string; sheltered: boolean; icon: "thermometer" | "rain-gauge" | "barometer" | "anemometer" | "wind-vane" | "hygrometer" | "sunshine-recorder" }[] = [
  { name: "Thermometer", measures: "temperature", sheltered: true, icon: "thermometer" },
  { name: "Rain gauge", measures: "the amount of rainfall", sheltered: false, icon: "rain-gauge" },
  { name: "Barometer", measures: "atmospheric (air) pressure", sheltered: true, icon: "barometer" },
  { name: "Anemometer", measures: "wind speed", sheltered: false, icon: "anemometer" },
  { name: "Wind vane", measures: "wind direction", sheltered: false, icon: "wind-vane" },
  { name: "Hygrometer", measures: "humidity — the amount of moisture in the air", sheltered: true, icon: "hygrometer" },
  { name: "Sunshine recorder", measures: "the number of hours of sunshine", sheltered: false, icon: "sunshine-recorder" },
];

const FILL_BLANK_TEMPLATES = [
  { before: "A white, louvred box that shelters instruments like the thermometer from direct sun and rain is called a ", after: " screen.", correctAnswer: "Stevenson", accepted: ["stevenson"], explanation: "A Stevenson screen is a white, louvred box that shelters instruments like the thermometer from direct sun and rain." },
  { before: "The scientific study of weather and atmospheric conditions is called ", after: ".", correctAnswer: "meteorology", accepted: ["meteorology"], explanation: "Meteorology is the scientific study of weather and atmospheric conditions." },
  { before: "Water that falls from the atmosphere as rain, hail, or snow is called ", after: ".", correctAnswer: "precipitation", accepted: ["precipitation"], explanation: "Precipitation is water that falls from the atmosphere as rain, hail, or snow." },
  { before: "The amount of moisture (water vapour) present in the air is called ", after: ".", correctAnswer: "humidity", accepted: ["humidity"], explanation: "Humidity is the amount of moisture present in the air, measured by a hygrometer." },
  { before: "A prediction of future weather conditions based on collected data is called a weather ", after: ".", correctAnswer: "forecast", accepted: ["forecast"], explanation: "A weather forecast is a prediction of future weather conditions, based on data collected from weather instruments." },
] as const;

const OBSERVATION_STEPS = [
  { id: "temp", label: "Read the thermometer to record the day's temperature" },
  { id: "rain", label: "Check the rain gauge and record the day's rainfall" },
  { id: "wind", label: "Read wind speed and direction from the anemometer and wind vane" },
  { id: "pressure", label: "Note the atmospheric pressure from the barometer" },
  { id: "log", label: "Record all the readings in the weather station's daily log" },
] as const;

export const weatherInstruments: Skill = {
  id: "ss-e-weather-instruments",
  code: "E.1",
  subjectId: "social-studies",
  strandId: "ss-extra-practice",
  grade: 9,
  title: "Weather instruments",
  description: "Match each weather instrument to what it measures.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "recall", "shelter", "fill-blank", "order", "identify-visual"] as const);

    if (branch === "identify-visual") {
      const target = randChoice(rng, INSTRUMENTS);
      const distractors = shuffle(rng, INSTRUMENTS.filter((i) => i.name !== target.name)).slice(0, 3);
      const choices = shuffle(rng, [target, ...distractors]);

      return {
        kind: "multiple-choice",
        prompt: "What does this weather instrument measure?",
        visual: { type: "weather-instrument", instrument: target.icon },
        choices: choices.map((c) => c.measures),
        correctIndex: choices.findIndex((c) => c.name === target.name),
        layout: "list",
        hint: "Look carefully at the shape of the instrument shown — each weather instrument has a distinctive design suited to what it measures.",
        explanation: `This is a ${target.name.toLowerCase()}. It measures ${target.measures}.`,
      };
    }

    if (branch === "shelter") {
      const chosen = shuffle(rng, INSTRUMENTS);
      const items = chosen.map((i) => ({ id: i.name, label: i.name }));
      const correctBucket: Record<string, string> = {};
      for (const i of chosen) correctBucket[i.name] = i.sheltered ? "sheltered" : "open";
      return {
        kind: "categorize",
        prompt: "Sort each weather instrument by where it is placed at a weather station.",
        items,
        buckets: [
          { id: "sheltered", label: "Sheltered from direct sun and rain (e.g. in a Stevenson screen)" },
          { id: "open", label: "Placed in the open air" },
        ],
        correctBucket,
        hint: "Instruments measuring temperature-sensitive readings are shielded; instruments measuring rain, wind, and sunshine need direct exposure.",
        explanation: chosen.map((i) => `${i.name} is ${i.sheltered ? "sheltered from direct sun and rain" : "placed in the open air"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about weather and weather instruments.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe weather stations and weather data.",
        explanation: fb.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, OBSERVATION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange these steps of a daily weather observation routine in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: OBSERVATION_STEPS.map((s) => s.id),
        hint: "This order moves through temperature, rainfall, wind, and pressure before the readings are all logged.",
        explanation: OBSERVATION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, INSTRUMENTS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.measures, icon: { type: "weather-instrument" as const, instrument: t.icon } })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;

      return {
        kind: "click-match",
        prompt: "Match each weather instrument to what it measures.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what each instrument is designed to detect in the atmosphere.",
        explanation: chosen.map((t) => `A ${t.name.toLowerCase()} measures ${t.measures}.`).join(" "),
      };
    }

    const target = randChoice(rng, INSTRUMENTS);
    const distractors = shuffle(rng, INSTRUMENTS.filter((i) => i.name !== target.name)).slice(0, 3);
    const choices = shuffle(rng, [target, ...distractors]);

    return {
      kind: "multiple-choice",
      prompt: `Which instrument measures ${target.measures}?`,
      choices: choices.map((c) => c.name),
      correctIndex: choices.findIndex((c) => c.name === target.name),
      hint: "Think about what each instrument is designed to detect in the atmosphere.",
      explanation: `A ${target.name.toLowerCase()} measures ${target.measures}.`,
    };
  },
};
