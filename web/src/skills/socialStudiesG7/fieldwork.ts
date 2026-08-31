import { randChoice, randInt, roundTo, sampleDistinctInts, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const METHODS = [
  { method: "Observation", desc: "Watching and recording what happens directly at the fieldwork site, without asking anyone questions" },
  { method: "Questionnaire", desc: "A set of written questions given to respondents to read and fill in themselves" },
  { method: "Interview", desc: "Asking questions directly to a respondent, face-to-face or by phone, and recording their answers" },
  { method: "Focus group discussion", desc: "Gathering a small group of people together to discuss a topic and share their views" },
] as const;

const CHALLENGE_BUCKETS: Record<string, string> = {
  trust: "Explain the purpose of the study and assure respondents of confidentiality",
  planning: "Plan the fieldwork carefully in advance, including timing and logistics",
  language: "Use simple, clear language, translating questions if necessary",
  safety: "Ensure proper safety measures and obtain permission before visiting the site",
};

const CHALLENGES = [
  { text: "Some respondents refuse to answer questions", bucket: "trust" },
  { text: "Respondents are suspicious about why the data is being collected", bucket: "trust" },
  { text: "Respondents worry their answers might be shared with people they know", bucket: "trust" },
  { text: "Unpredictable weather disrupts the planned visit", bucket: "planning" },
  { text: "There is not enough time to reach all the respondents", bucket: "planning" },
  { text: "The team arrives without a clear schedule for the day", bucket: "planning" },
  { text: "Some respondents do not understand certain questions", bucket: "language" },
  { text: "There is a language barrier between the researcher and a respondent", bucket: "language" },
  { text: "Technical terms in the questionnaire confuse respondents", bucket: "language" },
  { text: "There are safety risks at the fieldwork site", bucket: "safety" },
  { text: "Local authorities have not been informed about the fieldwork visit", bucket: "safety" },
  { text: "The fieldwork site is in an area with poor road access or security concerns", bucket: "safety" },
] as const;

const VALUE_REASONS = [
  "It provides first-hand, accurate information based on real observation rather than guesswork",
  "It allows learners to apply classroom knowledge to real, local situations",
  "It helps identify real problems in the community that may need solutions",
  "It develops practical skills such as planning, communication, and data analysis",
  "It builds confidence in interacting with and interviewing people outside the classroom",
  "It gives learners a more accurate picture of an issue than secondhand accounts alone",
  "It exposes learners to real community concerns that textbooks alone may not capture",
  "It strengthens teamwork skills, since fieldwork is usually planned and carried out in groups",
] as const;

const ROAD_SEGMENTS = ["the Kericho-Kisumu road", "the Mombasa-Nairobi highway near Machakos", "a busy junction in Nakuru town", "the Eldoret-Kitale road near Bungoma", "a school crossing point in Nyeri"] as const;

function generateAccidentData(rng: () => number) {
  const n = 5;
  const modeValue = randInt(rng, 1, 6);
  const modeCount = randInt(rng, 2, 3);
  const otherCount = n - modeCount;
  const others = sampleDistinctInts(rng, 0, 7, otherCount, [modeValue]);
  const values = shuffle(rng, [...Array(modeCount).fill(modeValue), ...others]);
  return values as number[];
}

export const fieldwork: Skill = {
  id: "g7-ss-nhbe-fieldwork",
  code: "NHBE.6",
  subjectId: "social-studies",
  strandId: "g7-ss-nhbe",
  grade: 7,
  title: "Fieldwork",
  description: "Methods of data collection used in fieldwork, using mean, median and mode to analyse fieldwork data, solutions to fieldwork challenges, and the value of fieldwork.",
  generate(rng) {
    const branch = randChoice(rng, ["methods", "challenges", "data-analysis", "value"] as const);

    if (branch === "methods") {
      const chosen = shuffle(rng, [...METHODS]);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.method, label: m.method })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.method, label: m.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((m) => (correctMap[m.method] = m.method));
      return {
        kind: "click-match",
        prompt: "Match each method of collecting fieldwork data to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Some methods involve asking people directly, some involve watching, and some involve written responses or group discussion.",
        explanation: chosen.map((m) => `${m.method}: ${m.desc}.`).join(" "),
      };
    }

    if (branch === "challenges") {
      const bucketIds = Object.keys(CHALLENGE_BUCKETS);
      const chosenBuckets = shuffle(rng, bucketIds).slice(0, 3);
      const pool = CHALLENGES.filter((c) => chosenBuckets.includes(c.bucket));
      const chosen = shuffle(rng, pool).slice(0, 6);
      const buckets = chosenBuckets.map((b) => ({ id: b, label: CHALLENGE_BUCKETS[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each challenge likely to be faced during fieldwork into the best solution for it.",
        items,
        buckets,
        correctBucket,
        hint: "Match the type of problem (trust, planning, language, or safety) to the solution that directly addresses it.",
        explanation: chosen.map((c) => `"${c.text}" — best solved by: ${CHALLENGE_BUCKETS[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "data-analysis") {
      const values = generateAccidentData(rng);
      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = roundTo(sum / values.length, 1);
      const median = sorted[Math.floor(sorted.length / 2)];
      const counts = new Map<number, number>();
      for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
      let mode = values[0];
      let modeFreq = 0;
      for (const [v, freq] of counts) {
        if (freq > modeFreq) {
          mode = v;
          modeFreq = freq;
        }
      }
      const measure = randChoice(rng, ["mean", "median", "mode"] as const);
      const segment = randChoice(rng, ROAD_SEGMENTS);
      const days = values.map((v, i) => ({ label: `Day ${i + 1}`, value: v }));
      const dataText = values.map((v, i) => `Day ${i + 1}: ${v}`).join(", ");

      if (measure === "mean") {
        return {
          kind: "fill-blank",
          prompt: `Working with an NTSA officer, learners recorded the number of road accidents over 5 days along ${segment}: ${dataText}.`,
          visual: { type: "bar-chart", data: days },
          before: "The mean (average) number of accidents per day is",
          after: "",
          correctAnswer: String(mean),
          inputMode: "numeric",
          hint: "Mean = total number of accidents ÷ number of days.",
          explanation: `Sum = ${values.join(" + ")} = ${sum}. Mean = ${sum} \\div ${values.length} = ${mean}.`,
        };
      }
      if (measure === "median") {
        return {
          kind: "fill-blank",
          prompt: `Working with an NTSA officer, learners recorded the number of road accidents over 5 days along ${segment}: ${dataText}.`,
          visual: { type: "bar-chart", data: days },
          before: "The median (middle value when arranged in order) number of accidents is",
          after: "",
          correctAnswer: String(median),
          inputMode: "numeric",
          hint: "Arrange the values from smallest to largest, then find the middle value.",
          explanation: `Arranged in order: ${sorted.join(", ")}. The middle value is ${median}, so the median is ${median}.`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: `Working with an NTSA officer, learners recorded the number of road accidents over 5 days along ${segment}: ${dataText}.`,
        visual: { type: "bar-chart", data: days },
        before: "The mode (most frequently occurring value) number of accidents is",
        after: "",
        correctAnswer: String(mode),
        inputMode: "numeric",
        hint: "Find which number of accidents was recorded on the most days.",
        explanation: `${mode} accidents was recorded on ${modeFreq} of the 5 days — more often than any other value — so the mode is ${mode}.`,
      };
    }

    // value
    const correct = randChoice(rng, VALUE_REASONS);
    const others = VALUE_REASONS.filter((r) => r !== correct);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
    return {
      kind: "multiple-choice",
      prompt: "Why is fieldwork important in Social Studies?",
      choices,
      correctIndex,
      hint: "Think about what learners gain from collecting real data themselves rather than only reading about a topic.",
      explanation: `${correct} — this is a key value of conducting fieldwork.`,
    };
  },
};
