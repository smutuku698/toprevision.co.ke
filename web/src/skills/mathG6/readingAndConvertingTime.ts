import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "./mathUtils";
import type { Skill } from "@/lib/types";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
function to12(h: number): { hour12: number; ampm: "a.m." | "p.m." } {
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour12, ampm: h < 12 ? "a.m." : "p.m." };
}
function format12(h: number, m: number): string {
  const { hour12, ampm } = to12(h);
  return `${hour12}:${pad2(m)} ${ampm}`;
}
function format24(h: number, m: number): string {
  return `${pad2(h)}:${pad2(m)}`;
}

// 32 distinct daily-life Kenyan events, each with an unambiguous 24-hour time
// (hours 1-23, never exactly 0 or 12, to keep a.m./p.m. reasoning simple at this grade).
const EVENTS = [
  { h: 6, m: 0, event: "waking up on a school morning" },
  { h: 6, m: 15, event: "brushing teeth before school" },
  { h: 7, m: 0, event: "having breakfast" },
  { h: 7, m: 30, event: "leaving home for school" },
  { h: 8, m: 0, event: "the first lesson starting at school" },
  { h: 10, m: 30, event: "the mid-morning break at school" },
  { h: 13, m: 0, event: "the lunch break at school" },
  { h: 15, m: 0, event: "afternoon games and sports at school" },
  { h: 16, m: 0, event: "school closing for the day" },
  { h: 16, m: 30, event: "arriving back home from school" },
  { h: 17, m: 30, event: "doing homework in the evening" },
  { h: 18, m: 30, event: "evening family prayers" },
  { h: 19, m: 30, event: "having supper" },
  { h: 21, m: 0, event: "watching the evening news" },
  { h: 21, m: 30, event: "going to bed" },
  { h: 6, m: 0, event: "the local market opening" },
  { h: 6, m: 45, event: "a matatu leaving the stage" },
  { h: 5, m: 30, event: "milking the cows on the farm" },
  { h: 9, m: 0, event: "a Sunday church service starting" },
  { h: 15, m: 0, event: "a local football match kicking off" },
  { h: 20, m: 0, event: "a shop closing for the day" },
  { h: 9, m: 0, event: "the bank opening" },
  { h: 12, m: 30, event: "lunch at a restaurant in town" },
  { h: 14, m: 0, event: "a wedding ceremony starting" },
  { h: 19, m: 0, event: "a music concert starting" },
  { h: 22, m: 0, event: "a night bus departing" },
  { h: 8, m: 30, event: "a doctor's clinic opening" },
  { h: 6, m: 30, event: "a farmers' market starting" },
  { h: 5, m: 0, event: "a radio morning show starting" },
  { h: 20, m: 30, event: "an evening TV drama starting" },
  { h: 11, m: 0, event: "a mid-morning tea break at a workplace" },
  { h: 18, m: 0, event: "evening chores on the farm at sunset" },
] as const;

export const readingAndConvertingTime: Skill = {
  id: "g6-math-m-reading-converting-time",
  code: "M.10",
  subjectId: "math",
  strandId: "g6-math-measurement",
  grade: 6,
  title: "Reading time and converting 12h/24h",
  description: "Read a.m./p.m. time from a clock, and convert between the 12-hour and 24-hour clock systems.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "clock-reading-mc",
        "24h-to-12h-mc",
        "12h-to-24h-fill",
        "classical-convert-fill",
        "click-match",
        "categorize-ampm",
        "order-events",
      ] as const
    );

    if (branch === "clock-reading-mc") {
      const ev = randChoice(rng, EVENTS);
      const correct = format12(ev.h, ev.m);
      const { hour12, ampm } = to12(ev.h);
      const oppositeAmpm = ampm === "a.m." ? "p.m." : "a.m.";
      const wrongHour = hour12 === 12 ? 11 : hour12 + 1;
      const wrongMinute = (ev.m + 15) % 60;
      const wrong = [`${hour12}:${pad2(ev.m)} ${oppositeAmpm}`, `${wrongHour}:${pad2(ev.m)} ${ampm}`, `${hour12}:${pad2(wrongMinute)} ${ampm}`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `It is time for ${ev.event}. What time does the clock show?`,
        visual: { type: "clock", hour: ev.h, minute: ev.m },
        choices,
        correctIndex,
        layout: "list",
        hint: "Read the hour and minute hands, and use the event to decide whether it's a.m. or p.m.",
        explanation: `${ev.event[0].toUpperCase()}${ev.event.slice(1)} happens at ${correct}. (Getting the a.m./p.m. the wrong way round, or misreading the hour or minute hand, gives the wrong options.)`,
      };
    }

    if (branch === "24h-to-12h-mc") {
      const ev = randChoice(rng, EVENTS);
      const time24 = format24(ev.h, ev.m);
      const correct = format12(ev.h, ev.m);
      const { hour12, ampm } = to12(ev.h);
      const oppositeAmpm = ampm === "a.m." ? "p.m." : "a.m.";
      const wrongHour = hour12 === 12 ? 11 : hour12 + 1;
      const wrong = [`${hour12}:${pad2(ev.m)} ${oppositeAmpm}`, `${wrongHour}:${pad2(ev.m)} ${ampm}`, `${pad2(ev.h)}:${pad2(ev.m)} ${ampm}`];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: `${time24} on the 24-hour clock is the time for ${ev.event}. Write this in 12-hour a.m./p.m. format.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "If the 24-hour time is 13:00 or later, subtract 12 to get the 12-hour clock hour, and it is p.m.",
        explanation: `${time24} = ${correct}. ${ev.h >= 12 ? `Since ${ev.h} is 13 or more, subtract 12 to get ${hour12}, and it is p.m.` : `Since ${ev.h} is before 12, the hour stays ${hour12} and it is a.m.`}`,
      };
    }

    if (branch === "12h-to-24h-fill") {
      const ev = randChoice(rng, EVENTS);
      const correct = format24(ev.h, ev.m);
      const time12 = format12(ev.h, ev.m);
      return {
        kind: "fill-blank",
        prompt: `${time12} is the time for ${ev.event}. Convert this to the 24-hour clock system (write it as HH:MM).`,
        before: "",
        after: "",
        correctAnswer: correct,
        acceptedAnswers: [correct, correct.replace(":", ""), correct.replace(/^0/, "")],
        inputMode: "text",
        hint: "If the time is p.m. and not 12 p.m., add 12 to the hour. Keep the hour as two digits.",
        explanation: `${time12} → add 12 to the hour if it's p.m. (and not already 12), giving ${correct} on the 24-hour clock.`,
      };
    }

    if (branch === "classical-convert-fill") {
      const h = randInt(rng, 1, 23);
      const m = randChoice(rng, [0, 15, 30, 45] as const);
      const correct = format24(h, m);
      const time12 = format12(h, m);
      return {
        kind: "fill-blank",
        prompt: `Convert ${time12} to the 24-hour clock system (write it as HH:MM).`,
        before: "",
        after: "",
        correctAnswer: correct,
        acceptedAnswers: [correct, correct.replace(":", ""), correct.replace(/^0/, "")],
        inputMode: "text",
        hint: "If the time is p.m. and not 12 p.m., add 12 to the hour.",
        explanation: `${time12} = ${correct} on the 24-hour clock.`,
      };
    }

    if (branch === "click-match") {
      const chosen = pickDistinctEvents(rng, 4);
      const tokens = shuffle(rng, chosen.map((ev, i) => ({ id: `e${i}`, label: format12(ev.h, ev.m) })));
      const targets = shuffle(rng, chosen.map((ev, i) => ({ id: `e${i}`, label: format24(ev.h, ev.m) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`e${i}`] = `e${i}`));
      return {
        kind: "click-match",
        prompt: "Match each 12-hour time to its 24-hour clock equivalent.",
        tokens,
        targets,
        correctMap,
        hint: "Add 12 to any p.m. hour (except 12 p.m. itself) to get the 24-hour time.",
        explanation: chosen.map((ev) => `${format12(ev.h, ev.m)} = ${format24(ev.h, ev.m)}`).join("; ") + ".",
      };
    }

    if (branch === "categorize-ampm") {
      const chosen = shuffle(rng, [...EVENTS]).slice(0, 7);
      const items = chosen.map((ev, i) => ({ id: `e${i}`, label: `${ev.event} (${format24(ev.h, ev.m)})` }));
      const buckets = [
        { id: "am", label: "a.m." },
        { id: "pm", label: "p.m." },
      ];
      const correctBucket: Record<string, string> = {};
      chosen.forEach((ev, i) => (correctBucket[`e${i}`] = ev.h < 12 ? "am" : "pm"));
      return {
        kind: "categorize",
        prompt: "Sort each event by whether it happens in the a.m. or the p.m., based on its 24-hour time.",
        items,
        buckets,
        correctBucket,
        hint: "24-hour times from 00:00 up to (but not including) 12:00 are a.m.; from 12:00 onward are p.m.",
        explanation: chosen.map((ev) => `${format24(ev.h, ev.m)} (${ev.event}) is ${ev.h < 12 ? "a.m." : "p.m."}`).join("; ") + ".",
      };
    }

    // order-events
    const chosen = pickDistinctEvents(rng, 4);
    const items = chosen.map((ev, i) => ({ id: `e${i}`, label: `${ev.event} (${format12(ev.h, ev.m)})` }));
    const sortedIdx = chosen.map((_, i) => i).sort((a, b) => (chosen[a].h * 60 + chosen[a].m) - (chosen[b].h * 60 + chosen[b].m));
    return {
      kind: "ordering",
      prompt: "Arrange these events in the order they happen during the day, earliest first.",
      instruction: "Click them in order, earliest first.",
      items: shuffle(rng, items),
      correctOrder: sortedIdx.map((i) => `e${i}`),
      hint: "Convert every time to the 24-hour clock to compare them easily.",
      explanation: `In order: ${sortedIdx.map((i) => `${chosen[i].event} at ${format24(chosen[i].h, chosen[i].m)}`).join(", ")}.`,
    };
  },
};

function pickDistinctEvents(rng: RNG, count: number) {
  const pool = shuffle(rng, [...EVENTS]);
  const seen = new Set<string>();
  const result: (typeof EVENTS)[number][] = [];
  for (const ev of pool) {
    const key = `${ev.h}:${ev.m}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(ev);
    }
    if (result.length === count) break;
  }
  return result;
}
