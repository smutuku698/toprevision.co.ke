import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, name, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Weather and Climate". Elements of weather are a
// closed list of exactly 4 (rainfall, wind, temperature, cloud cover). Climatic regions are standard,
// well-known Kenyan geography consistent with this scope. No map widget exists, so branches are text/fact
// based, never "click the map".

const ELEMENTS = [
  { id: "rainfall", label: "Rainfall", note: "how much rain falls in an area" },
  { id: "wind", label: "Wind", note: "how strongly and in which direction the air moves" },
  { id: "temperature", label: "Temperature", note: "how hot or cold the air is" },
  { id: "cloud-cover", label: "Cloud cover", note: "how much of the sky is covered by clouds" },
] as const;

type RegionId = "coastal" | "arid" | "highland-wet" | "highland-cool";

interface Region {
  id: RegionId;
  label: string;
  description: string;
}

const REGIONS: readonly Region[] = [
  { id: "coastal", label: "The hot and humid coastal region", description: "found along Kenya's Indian Ocean coast, with high temperatures and high humidity all year" },
  { id: "arid", label: "The hot and dry (arid/semi-arid) region", description: "found in much of northern and eastern Kenya, with very little and unreliable rainfall" },
  { id: "highland-wet", label: "The warm and wet highlands", description: "found in parts of central and western Kenya, with moderate temperatures and reliable rainfall" },
  { id: "highland-cool", label: "The cool highlands around Mount Kenya", description: "found on high mountain slopes, with cool to cold temperatures and, at the very top, frost" },
] as const;

const WEATHER_VS_CLIMATE = [
  { id: "s1", label: "It rained heavily in Nakuru this afternoon.", type: "weather" as const },
  { id: "s2", label: "It was very windy in Kisumu this morning.", type: "weather" as const },
  { id: "s3", label: "Today's temperature in Nairobi reached 24°C.", type: "weather" as const },
  { id: "s4", label: "The sky over Meru was cloudy all day today.", type: "weather" as const },
  { id: "s5", label: "The coastal region of Kenya is generally hot and humid throughout the year.", type: "climate" as const },
  { id: "s6", label: "Northern Kenya has been dry for most of the last thirty years.", type: "climate" as const },
  { id: "s7", label: "The highlands around Mount Kenya are usually cool, year after year.", type: "climate" as const },
  { id: "s8", label: "Over many years, the coast has had reliably high rainfall.", type: "climate" as const },
] as const;

const RESPONSE_STEPS = [
  { id: "r1", label: "Check the weather forecast" },
  { id: "r2", label: "Dress and prepare appropriately" },
  { id: "r3", label: "Inform family members" },
  { id: "r4", label: "Proceed safely" },
] as const;

export const weatherAndClimate: Skill = {
  id: "g5-ss-env-weather-and-climate",
  code: "E.4",
  subjectId: "social-studies",
  strandId: "g5-ss-environments",
  grade: 5,
  title: "Weather and Climate",
  description: "Identifying the elements of weather, telling weather apart from climate, and describing Kenya's main climatic regions.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const el = randChoice(rng, ELEMENTS);
      const others = shuffle(rng, ELEMENTS.filter((e) => e.id !== el.id)).slice(0, 3);
      const choices = shuffle(rng, [el.label, ...others.map((o) => o.label)]);
      return {
        kind: "multiple-choice",
        prompt: identifyPrompt(rng, `element of weather: it describes ${el.note}`),
        choices,
        correctIndex: choices.indexOf(el.label),
        hint: "The four elements of weather are rainfall, wind, temperature and cloud cover.",
        explanation: `${el.label} describes ${el.note}, so it is an element of weather.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, [...REGIONS]);
      const tokens = chosen.map((r) => ({ id: r.id, label: r.label }));
      const targets = shuffle(rng, chosen).map((r) => ({ id: r.id, label: r.description.charAt(0).toUpperCase() + r.description.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "climatic region of Kenya to its description"),
        tokens,
        targets,
        correctMap,
        hint: "Think about temperature and rainfall in each part of Kenya.",
        explanation: chosen.map((r) => `${r.label} is ${r.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, [...WEATHER_VS_CLIMATE]).slice(0, 6);
      const items = chosen.map((s) => ({ id: s.id, label: s.label }));
      const buckets = [
        { id: "weather", label: "Weather (short-term, day-to-day)" },
        { id: "climate", label: "Climate (long-term pattern)" },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s) => (correctBucket[s.id] = s.type));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it describes weather or climate"),
        items,
        buckets,
        correctBucket,
        hint: "Weather is what is happening right now or today; climate is the usual pattern over many years.",
        explanation: chosen.map((s) => `"${s.label}" describes ${s.type}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const n = name(rng);
      const templates = [
        () => ({ before: "The four elements of weather are rainfall, wind, temperature and", after: ".", correct: "cloud cover" }),
        () => ({ before: "The day-to-day condition of the atmosphere, such as today's rain or sunshine, is called the", after: ".", correct: "weather" }),
        () => ({ before: "The usual, long-term pattern of weather in an area over many years is called the", after: ".", correct: "climate" }),
        () => ({ before: "Kenya's coastal region has a hot and", after: "climate.", correct: "humid" }),
        () => ({ before: "Much of northern Kenya has a hot and", after: "climate, with very little rainfall.", correct: "dry" }),
        () => ({ before: `${n} notices it is very windy today — wind is one of the four elements of`, after: ".", correct: "weather" }),
        () => ({ before: "How hot or cold the air is called the", after: ".", correct: "temperature" }),
        () => ({ before: "How much of the sky is covered by clouds is called the", after: ".", correct: "cloud cover" }),
        () => ({ before: "The highlands around Mount Kenya generally have a", after: "climate.", correct: "cool" }),
        () => ({ before: "How much rain falls in an area is called the", after: ".", correct: "rainfall" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the four elements of weather and Kenya's main climatic regions.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    // ordering — sensible steps for responding to extreme/forecast weather.
    const items = shuffle(rng, RESPONSE_STEPS).map((r) => ({ id: r.id, label: r.label }));
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps for responding well to a weather forecast"),
      items,
      correctOrder: RESPONSE_STEPS.map((r) => r.id),
      instruction: "First step first.",
      hint: "Find out the forecast before you decide how to prepare, and prepare before you go out.",
      explanation: `A sensible order: ${RESPONSE_STEPS.map((r) => r.label).join(" → ")}.`,
    };
  },
};
