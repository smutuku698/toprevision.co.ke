import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ELEMENT_INSTRUMENTS = [
  { element: "Temperature", instrument: "Thermometer" },
  { element: "Rainfall", instrument: "Rain gauge" },
  { element: "Wind direction", instrument: "Wind vane" },
  { element: "Wind speed", instrument: "Anemometer / windsock" },
  { element: "Humidity", instrument: "Hygrometer" },
  { element: "Sunshine", instrument: "Sunshine recorder" },
] as const;

const ROAD_SAFETY_STATEMENTS = [
  { text: "Heavy rainfall can reduce a driver's visibility and make roads slippery", bucket: "affects" },
  { text: "Strong winds can blow dust, debris, or even light vehicles off course", bucket: "affects" },
  { text: "Thick fog and low cloud can reduce how far ahead a driver can see", bucket: "affects" },
  { text: "Lightning and strong winds during a storm can startle drivers and damage vehicles", bucket: "affects" },
  { text: "The exact humidity percentage recorded at a weather station a driver has never visited", bucket: "not-affects" },
  { text: "Yesterday's weather in a town the driver is not travelling to today", bucket: "not-affects" },
  { text: "The specific brand name of the thermometer used at the local weather station", bucket: "not-affects" },
  { text: "The number of weather stations located in a different country", bucket: "not-affects" },
  { text: "Icy or waterlogged roads make braking distances longer and tyres lose grip", bucket: "affects" },
  { text: "The exact date a weather station's rain gauge was last repainted", bucket: "not-affects" },
] as const;

const BUCKET_LABEL: Record<string, string> = { affects: "Affects road safety", "not-affects": "Does not directly affect road safety" };

const CONDITIONS = [
  {
    condition: "rainy" as const,
    scenario: "Heavy rain is forecast for this afternoon",
    action: "Reduce speed, keep a safe following distance, and switch on headlights for visibility",
  },
  {
    condition: "stormy" as const,
    scenario: "A thunderstorm with strong winds is expected",
    action: "Avoid unnecessary travel until the storm passes, and pull over safely if caught in it while driving",
  },
  {
    condition: "sunny" as const,
    scenario: "Bright, glaring sunshine is expected, especially near sunrise and sunset",
    action: "Wear sunglasses or use the sun visor, and watch for glare that can block your view of other road users",
  },
  {
    condition: "cloudy" as const,
    scenario: "Overcast, cloudy skies are expected with a chance of light drizzle later",
    action: "Drive at a moderate speed and stay alert, since cloudy conditions can change quickly into rain",
  },
] as const;

const SAFETY_RANK: Record<string, number> = { cloudy: 1, sunny: 2, rainy: 3, stormy: 4 };

const LOCALITIES = ["Kericho", "Kakamega", "Kilifi", "Machakos", "Nakuru", "Kisumu", "Nyeri", "Garissa", "Kajiado", "Bungoma"] as const;
const DRIVER_ROLES = [
  { role: "matatu driver", name: "Otieno" },
  { role: "boda boda rider", name: "Wanjiku" },
  { role: "bus driver", name: "Mutua" },
  { role: "truck driver", name: "Chebet" },
] as const;

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The scientific study of weather and atmospheric conditions is called ", after: ".", correctAnswer: "meteorology", accepted: ["meteorology"], explanation: "Meteorology is the scientific study of weather and atmospheric conditions." },
  { before: "Water that falls from the sky as rain, hail, or other forms is called ", after: ".", correctAnswer: "precipitation", accepted: ["precipitation"], explanation: "Precipitation is water that falls from the sky in forms such as rain or hail." },
  { before: "The amount of moisture present in the air is called ", after: ".", correctAnswer: "humidity", accepted: ["humidity"], explanation: "Humidity is the amount of moisture present in the air, measured by a hygrometer." },
  { before: "How far a driver can clearly see ahead on the road is called ", after: ".", correctAnswer: "visibility", accepted: ["visibility"], explanation: "Visibility is how far a driver can clearly see ahead, which weather like fog or heavy rain can reduce." },
  { before: "A prediction of future weather conditions, used to plan travel safely, is called a weather ", after: ".", correctAnswer: "forecast", accepted: ["forecast"], explanation: "A weather forecast is a prediction of future weather conditions, useful for planning safe travel." },
  { before: "A place equipped with instruments to record weather data is called a weather ", after: ".", correctAnswer: "station", accepted: ["station"], explanation: "A weather station is a place equipped with instruments, such as thermometers and rain gauges, to record weather data." },
] as const;

export const weather: Skill = {
  id: "g7-ss-nhbe-weather",
  code: "NHBE.5",
  subjectId: "social-studies",
  strandId: "g7-ss-nhbe",
  grade: 7,
  title: "Weather",
  description: "Elements of weather, instruments used to measure them, the significance of weather to the human environment, and the effects of weather on road safety.",
  generate(rng) {
    const branch = randChoice(rng, ["instruments", "road-safety-sort", "response-mc", "weekly-pattern", "fill-blank", "risk-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about weather.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe weather and its effect on road safety.",
        explanation: fb.explanation,
      };
    }

    if (branch === "risk-order") {
      const labelOf: Record<string, string> = {
        cloudy: "Cloudy — overcast skies, chance of light drizzle",
        sunny: "Sunny — bright, possibly glaring sunshine",
        rainy: "Rainy — heavy rain reducing visibility and grip",
        stormy: "Stormy — thunderstorm with strong winds",
      };
      const items = shuffle(rng, CONDITIONS.map((c) => ({ id: c.condition, label: labelOf[c.condition] })));
      const correctOrder = [...CONDITIONS].sort((a, b) => SAFETY_RANK[a.condition] - SAFETY_RANK[b.condition]).map((c) => c.condition);
      return {
        kind: "ordering",
        prompt: "Arrange these weather conditions from lowest to highest road safety risk.",
        instruction: "Drag to reorder from lowest risk to highest risk.",
        items,
        correctOrder,
        hint: "Cloudy and sunny days are generally safest; rain and storms bring the greatest risk to visibility and vehicle control.",
        explanation: correctOrder.map((c, i) => `${i + 1}. ${labelOf[c]}.`).join(" "),
      };
    }

    if (branch === "instruments") {
      const chosen = shuffle(rng, [...ELEMENT_INSTRUMENTS]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((e) => ({ id: e.element, label: e.element })));
      const targets = shuffle(rng, chosen.map((e) => ({ id: e.element, label: e.instrument })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((e) => (correctMap[e.element] = e.element));
      return {
        kind: "click-match",
        prompt: "Match each element of weather to the instrument used to measure it.",
        tokens,
        targets,
        correctMap,
        hint: "Each weather element — temperature, rainfall, wind, humidity, or sunshine — has its own dedicated measuring instrument.",
        explanation: chosen.map((e) => `${e.element} is measured using a ${e.instrument.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "road-safety-sort") {
      const chosen = shuffle(rng, ROAD_SAFETY_STATEMENTS).slice(0, 6);
      const buckets = [
        { id: "affects", label: BUCKET_LABEL["affects"] },
        { id: "not-affects", label: BUCKET_LABEL["not-affects"] },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement into whether it affects road safety or does not directly affect road safety.",
        items,
        buckets,
        correctBucket,
        hint: "Think about which statements describe weather conditions that a driver would actually experience on the road right now.",
        explanation: chosen.map((s) => `"${s.text}" — ${BUCKET_LABEL[s.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "response-mc") {
      const c = randChoice(rng, CONDITIONS);
      const locality = randChoice(rng, LOCALITIES);
      const driver = randChoice(rng, DRIVER_ROLES);
      const others = CONDITIONS.filter((x) => x.condition !== c.condition).map((x) => x.action);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, c.action, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `${c.scenario} in ${locality}. What should ${driver.name}, a ${driver.role} in the area, do to stay safe on the road?`,
        choices,
        correctIndex,
        hint: "Think about how this specific weather condition affects visibility, road surface, or vehicle control.",
        explanation: `${c.action} — this is the safest response when ${c.scenario.toLowerCase()}.`,
      };
    }

    // weekly-pattern
    const dayCount = randInt(rng, 3, 4);
    const conditions = shuffle(rng, CONDITIONS.map((c) => c.condition)).slice(0, dayCount);
    const startIndex = randInt(rng, 0, WEEKDAYS.length - dayCount);
    const dayLabels = WEEKDAYS.slice(startIndex, startIndex + dayCount);
    const days = dayLabels.map((label, i) => ({ label, condition: conditions[i] }));
    let safestIndex = 0;
    for (let i = 1; i < days.length; i++) if (SAFETY_RANK[days[i].condition] < SAFETY_RANK[days[safestIndex].condition]) safestIndex = i;
    const safestDay = days[safestIndex];
    const { choices, correctIndex } = buildChoicesFromStrings(
      rng,
      safestDay.label,
      dayLabels.filter((d) => d !== safestDay.label),
      dayLabels.length - 1
    );
    return {
      kind: "multiple-choice",
      prompt: "This forecast shows the expected weather condition for each day. Based on weather-related risk alone, which day would be the safest to plan a long road trip?",
      visual: { type: "weather", days },
      choices,
      correctIndex,
      hint: "Rainy and stormy conditions bring the greatest road risk (poor visibility, slippery or windy conditions), while cloudy and sunny days are generally lower risk.",
      explanation: `${safestDay.label} (${safestDay.condition}) carries the lowest weather-related road risk among the days shown.`,
    };
  },
};
