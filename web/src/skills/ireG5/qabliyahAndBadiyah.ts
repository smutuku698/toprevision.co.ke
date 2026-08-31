import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, place, sortPrompt, matchPrompt, fillBlankPrompt, identifyPrompt } from "./g5IreShared";

// 4.2 Sunnah (Optional) Prayers — Qabliyah and Ba'diyah. Standard, generally-taught sunnah
// muakkadah raka'at counts: Fajr 2 qabliyah; Dhuhr 4 qabliyah + 2 ba'diyah; Asr none; Maghrib
// 2 ba'diyah; Isha 2 ba'diyah (total 12 raka'at/day). Mathematics is the linked learning area
// per the source ("counting the number of Qabliya and Ba'diyah in each fardh prayer and their
// daily total, relating to addition") so number-line and fill-blank branches carry that angle.

interface PrayerSunnah { prayer: string; qabliyah: number; badiyah: number; desc: string }
const PRAYER_SUNNAH: PrayerSunnah[] = [
  { prayer: "Fajr", qabliyah: 2, badiyah: 0, desc: "2 raka'at qabliyah, no ba'diyah" },
  { prayer: "Dhuhr", qabliyah: 4, badiyah: 2, desc: "4 raka'at qabliyah, 2 raka'at ba'diyah" },
  { prayer: "Asr", qabliyah: 0, badiyah: 0, desc: "No qabliyah or ba'diyah sunnah muakkadah" },
  { prayer: "Maghrib", qabliyah: 0, badiyah: 2, desc: "No qabliyah, 2 raka'at ba'diyah" },
  { prayer: "Isha", qabliyah: 0, badiyah: 2, desc: "No qabliyah, 2 raka'at ba'diyah" },
];

interface GroupedFact { text: string; group: "fajr" | "dhuhr" | "maghrib-isha" | "asr" }
const GROUP_LABEL: Record<GroupedFact["group"], string> = {
  fajr: "Fajr", dhuhr: "Dhuhr", "maghrib-isha": "Maghrib and Isha", asr: "Asr",
};
const GROUPED_FACTS: GroupedFact[] = [
  { text: "This prayer has 2 raka'at of qabliyah sunnah and no ba'diyah sunnah", group: "fajr" },
  { text: "This dawn prayer's sunnah is prayed only before the fardh, not after", group: "fajr" },
  { text: "The Prophet (S.A.W.) was known never to miss the 2 raka'at qabliyah of this prayer", group: "fajr" },
  { text: "This prayer has both qabliyah (4 raka'at) and ba'diyah (2 raka'at) sunnah", group: "dhuhr" },
  { text: "This midday prayer carries the largest number of qabliyah raka'at among the five", group: "dhuhr" },
  { text: "This prayer's sunnah muakkadah totals 6 raka'at — 4 before and 2 after", group: "dhuhr" },
  { text: "Both these evening prayers share 2 raka'at of ba'diyah sunnah each, and no qabliyah", group: "maghrib-isha" },
  { text: "These two prayers are only followed by sunnah, never preceded by it", group: "maghrib-isha" },
  { text: "Together these two prayers contribute 4 raka'at of ba'diyah sunnah to the daily total", group: "maghrib-isha" },
  { text: "This afternoon prayer has no qabliyah or ba'diyah sunnah muakkadah at all", group: "asr" },
  { text: "Only the fardh raka'at are prayed for this prayer, with no attached sunnah", group: "asr" },
  { text: "Despite being one of the five daily prayers, no sunnah muakkadah is attached to this one", group: "asr" },
];

const REASON_TEMPLATES: ((rng: RNG) => { prompt: string; correct: string; wrong: string[]; explanation: string })[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} prays the 4 raka'at qabliyah before Dhuhr, then the fardh, then the 2 raka'at ba'diyah after. How many raka'at of sunnah did ${who} pray around Dhuhr, not counting the fardh?`,
      correct: "6 raka'at — 4 qabliyah plus 2 ba'diyah",
      wrong: ["4 raka'at, since only the qabliyah counts as sunnah", "8 raka'at, since qabliyah and ba'diyah are each counted twice", "2 raka'at, since only the ba'diyah counts as sunnah"],
      explanation: "Dhuhr's sunnah muakkadah is 4 raka'at qabliyah plus 2 raka'at ba'diyah, which adds up to 6 raka'at of sunnah around the fardh prayer.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants to pray every sunnah muakkadah raka'ah in one full day: 2 before Fajr, 4 before and 2 after Dhuhr, 2 after Maghrib, and 2 after Isha. What is the daily total?`,
      correct: "12 raka'at in total",
      wrong: ["10 raka'at in total", "14 raka'at in total", "8 raka'at in total"],
      explanation: "Adding 2 (Fajr) + 4 (Dhuhr qabliyah) + 2 (Dhuhr ba'diyah) + 2 (Maghrib) + 2 (Isha) gives 12 raka'at of sunnah muakkadah across the whole day.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} compares Fajr's qabliyah (2 raka'at) with Dhuhr's qabliyah (4 raka'at). Which fardh prayer has more qabliyah raka'at?`,
      correct: "Dhuhr — 4 raka'at of qabliyah, compared to Fajr's 2",
      wrong: ["Fajr — 2 raka'at is more than 4", "They are equal, both have 4 raka'at", "Neither has any qabliyah at all"],
      explanation: "Dhuhr's qabliyah is 4 raka'at, more than Fajr's 2 raka'at qabliyah — Dhuhr carries the largest qabliyah count among the five daily prayers.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} asks whether Asr has any qabliyah or ba'diyah sunnah muakkadah attached to it, the way Dhuhr does. What is the correct answer?`,
      correct: "No — Asr has no qabliyah or ba'diyah sunnah muakkadah; only its fardh is prayed",
      wrong: ["Yes — Asr has 2 raka'at qabliyah, just like Fajr", "Yes — Asr has both qabliyah and ba'diyah, just like Dhuhr", "Yes — Asr has 4 raka'at ba'diyah, more than any other prayer"],
      explanation: "Among the five daily prayers, Asr is the one with no attached qabliyah or ba'diyah sunnah muakkadah — only its fardh raka'at are prayed.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} prays the 2 raka'at ba'diyah after Maghrib, then later that evening prays the 2 raka'at ba'diyah after Isha. How do these two counts compare?`,
      correct: "They are equal — both Maghrib and Isha have 2 raka'at of ba'diyah sunnah",
      wrong: ["Isha has more ba'diyah than Maghrib", "Maghrib has more ba'diyah than Isha", "Neither prayer actually has any ba'diyah sunnah"],
      explanation: "Maghrib and Isha each carry 2 raka'at of ba'diyah sunnah — an equal count, unlike Dhuhr which also has qabliyah on top.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} claims that sunnah prayers like qabliyah and ba'diyah replace the fardh prayer, so praying them means the fardh can be skipped. Evaluate this claim.`,
      correct: "Flawed — qabliyah and ba'diyah are prayed in addition to the fardh, not as a replacement for it",
      wrong: ["Sound — sunnah prayers make the fardh optional for that prayer", "Sound — only the sunnah needs to be prayed, since it comes with extra reward", "Flawed — actually the fardh replaces the sunnah, not the other way round"],
      explanation: "Sunnah muakkadah prayers such as qabliyah and ba'diyah are performed alongside the obligatory fardh prayer to earn extra reward — they never replace the fardh.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} argues that since Dhuhr has both qabliyah and ba'diyah while Fajr has only qabliyah, Dhuhr must be a more important prayer than Fajr. Is this reasoning sound?`,
      correct: "No — the number of attached sunnah raka'at does not determine which fardh prayer is more important; all five daily prayers are obligatory",
      wrong: ["Yes — more sunnah raka'at always means a more important fardh prayer", "Yes — Fajr becomes optional because it has fewer sunnah raka'at", "No — actually Fajr is more important because it has fewer raka'at overall"],
      explanation: "All five daily fardh prayers are equally obligatory — the number of qabliyah or ba'diyah raka'at attached to a prayer reflects the sunnah of the Prophet (S.A.W.), not the importance of the fardh itself.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wants to identify the "odd one out" among the five daily prayers by which one has zero qabliyah and zero ba'diyah sunnah muakkadah. Which prayer is it?`,
      correct: "Asr",
      wrong: ["Fajr", "Dhuhr", "Maghrib"],
      explanation: "Asr is the only one of the five daily fardh prayers with no qabliyah or ba'diyah sunnah muakkadah attached to it.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} prays 2 raka'at before Fajr's fardh. What is this sunnah prayer correctly called, based on when it is prayed?`,
      correct: "Qabliyah — a sunnah prayed before the fardh",
      wrong: ["Ba'diyah — a sunnah prayed after the fardh", "Witr — an odd-numbered night prayer", "Taraweeh — a Ramadan night prayer"],
      explanation: "A sunnah prayed before a fardh prayer is called qabliyah; one prayed after the fardh is called ba'diyah — the 2 raka'at before Fajr are Fajr's qabliyah.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps a personal log for a week of every sunnah muakkadah raka'ah prayed each day. If ${who} prays consistently, how many raka'at should appear in a single day's log?`,
      correct: "12 raka'at, if every sunnah muakkadah prayer of the day is completed",
      wrong: ["5 raka'at, one for each fardh prayer", "17 raka'at, counting the fardh together with the sunnah", "6 raka'at, counting only Dhuhr's sunnah"],
      explanation: "A full day of sunnah muakkadah — Fajr's 2, Dhuhr's 4+2, Maghrib's 2, and Isha's 2 — totals 12 raka'at, separate from the fardh raka'at.",
    };
  },
];

export const qabliyahAndBadiyah: Skill = {
  id: "g5-ire-da-qabliyah-and-badiyah",
  code: "DA.2",
  subjectId: "ire",
  strandId: "g5-ire-devotional",
  grade: 5,
  title: "Qabliyah and Ba'diyah",
  description: "Sunnah prayers performed before (qabliyah) and after (ba'diyah) the fardh prayers, and the standard raka'at count for each of the five daily prayers.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "number-line", "fill-blank"] as const);

    if (branch === "categorize") {
      const fajr = shuffle(rng, GROUPED_FACTS.filter((f) => f.group === "fajr")).slice(0, 2);
      const dhuhr = shuffle(rng, GROUPED_FACTS.filter((f) => f.group === "dhuhr")).slice(0, 2);
      const maghribIsha = shuffle(rng, GROUPED_FACTS.filter((f) => f.group === "maghrib-isha")).slice(0, 2);
      const asr = shuffle(rng, GROUPED_FACTS.filter((f) => f.group === "asr")).slice(0, 2);
      const chosen = shuffle(rng, [...fajr, ...dhuhr, ...maghribIsha, ...asr]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which prayer's qabliyah or ba'diyah sunnah it describes"),
        items,
        buckets: (["fajr", "dhuhr", "maghrib-isha", "asr"] as const).map((g) => ({ id: g, label: GROUP_LABEL[g] })),
        correctBucket,
        hint: "Recall which prayers have qabliyah, which have ba'diyah, and which prayer has neither.",
        explanation: chosen.map((f) => `"${f.text}" — ${GROUP_LABEL[f.group]}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, PRAYER_SUNNAH).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.prayer, label: t.prayer })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.prayer, label: t.desc })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.prayer] = t.prayer;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "fardh prayer to its qabliyah and ba'diyah sunnah count"),
        tokens,
        targets,
        correctMap,
        hint: "Recall how many raka'at of qabliyah and ba'diyah go with each fardh prayer.",
        explanation: chosen.map((t) => `${t.prayer} — ${t.desc}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASON_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Add up the qabliyah and ba'diyah raka'at for the prayer(s) involved.",
        explanation: q.explanation,
      };
    }

    if (branch === "number-line") {
      const facts = [
        { what: "How many raka'at of qabliyah are prayed before Fajr?", value: 2, explanation: "Fajr has 2 raka'at of qabliyah, prayed before its fardh." },
        { what: "How many raka'at of qabliyah are prayed before Dhuhr?", value: 4, explanation: "Dhuhr has 4 raka'at of qabliyah, the largest qabliyah count of the five prayers." },
        { what: "How many raka'at of ba'diyah are prayed after Dhuhr?", value: 2, explanation: "Dhuhr has 2 raka'at of ba'diyah, prayed after its fardh." },
        { what: "How many raka'at of qabliyah or ba'diyah does Asr have?", value: 0, explanation: "Asr has no qabliyah or ba'diyah sunnah muakkadah — only its fardh is prayed." },
        { what: "How many raka'at of ba'diyah are prayed after Maghrib?", value: 2, explanation: "Maghrib has 2 raka'at of ba'diyah, prayed after its fardh." },
        { what: "How many raka'at of ba'diyah are prayed after Isha?", value: 2, explanation: "Isha has 2 raka'at of ba'diyah, prayed after its fardh." },
        { what: "How many raka'at of qabliyah does Maghrib have?", value: 0, explanation: "Maghrib has no qabliyah sunnah — its sunnah muakkadah is only the ba'diyah, prayed after the fardh." },
        { what: "What is the combined total of Dhuhr's qabliyah and ba'diyah raka'at?", value: 6, explanation: "Dhuhr's 4 raka'at qabliyah plus 2 raka'at ba'diyah add up to 6." },
        { what: "What is the total number of sunnah muakkadah raka'at across the whole day?", value: 12, explanation: "2 (Fajr) + 4 (Dhuhr qabliyah) + 2 (Dhuhr ba'diyah) + 2 (Maghrib) + 2 (Isha) = 12 raka'at." },
        { what: "How many raka'at of qabliyah does Isha have?", value: 0, explanation: "Isha has no qabliyah sunnah — only ba'diyah, prayed after its fardh." },
      ] as const;
      const f = randChoice(rng, facts);
      return {
        kind: "number-line",
        prompt: identifyPrompt(rng, f.what),
        min: 0,
        max: 12,
        step: 1,
        correctValue: f.value,
        mode: "point",
        hint: "Recall the standard qabliyah/ba'diyah raka'at count for that prayer.",
        explanation: f.explanation,
      };
    }

    const facts = [
      { before: "A sunnah prayer performed before the fardh is called", after: ".", answer: "qabliyah", accepted: ["qabliyah"] },
      { before: "A sunnah prayer performed after the fardh is called", after: ".", answer: "ba'diyah", accepted: ["ba'diyah", "badiyah"] },
      { before: "Dhuhr has", after: "raka'at of qabliyah sunnah.", answer: "4", accepted: ["4", "four"] },
      { before: "Fajr has", after: "raka'at of qabliyah sunnah.", answer: "2", accepted: ["2", "two"] },
      { before: "Dhuhr's ba'diyah sunnah is", after: "raka'at.", answer: "2", accepted: ["2", "two"] },
      { before: "Maghrib's ba'diyah sunnah is", after: "raka'at.", answer: "2", accepted: ["2", "two"] },
      { before: "Isha's ba'diyah sunnah is", after: "raka'at.", answer: "2", accepted: ["2", "two"] },
      { before: "The fardh prayer with no qabliyah or ba'diyah sunnah muakkadah at all is", after: ".", answer: "Asr", accepted: ["asr"] },
      { before: "The total sunnah muakkadah raka'at prayed across a full day is", after: ".", answer: "12", accepted: ["12", "twelve"] },
      { before: "Performing Qabliyah and Ba'diyah earns extra", after: "from Allah, on top of the fardh.", answer: "reward", accepted: ["reward", "rewards", "thawab"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall the standard qabliyah/ba'diyah raka'at counts for the five daily prayers.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
