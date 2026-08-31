import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 7.0 Learning Through Technology, sub-strand 7.4 Mechanics of Writing:
// Punctuation — commas and double quotation marks. See curriculum-reference/grade-5/english.json.

type CommaRule = "list" | "intro" | "address" | "speech" | "clauses";
const RULE_LABEL: Record<CommaRule, string> = {
  list: "separating items in a list",
  intro: "after an introductory word or phrase",
  address: "before or after a name when speaking to someone",
  speech: "between spoken words and 'she said' / 'he said'",
  clauses: "marking a short pause between two clauses",
};

// Each: the correctly punctuated sentence, the word that is followed by the (first) comma, the rule.
const COMMA_TPL: { sentence: string; beforeComma: string; rule: CommaRule }[] = [
  { sentence: "We downloaded photos, videos and songs onto the tablet.", beforeComma: "photos", rule: "list" },
  { sentence: "First, log in with your own password.", beforeComma: "First", rule: "intro" },
  { sentence: "Please close the browser, Amina, before you shut down.", beforeComma: "browser", rule: "address" },
  { sentence: "\"I have saved the file,\" said the teacher.", beforeComma: "file", rule: "speech" },
  { sentence: "The screen was frozen, so we restarted the laptop.", beforeComma: "frozen", rule: "clauses" },
  { sentence: "The pack contained a charger, a cable and a case.", beforeComma: "charger", rule: "list" },
  { sentence: "After the lesson, we uploaded our work to the class folder.", beforeComma: "lesson", rule: "intro" },
  { sentence: "Can you help me, Baraka, to connect the projector?", beforeComma: "me", rule: "address" },
  { sentence: "\"The internet is slow today,\" complained Wanjiru.", beforeComma: "today", rule: "speech" },
  { sentence: "The bundle ran out, so we finished the research offline.", beforeComma: "out", rule: "clauses" },
  { sentence: "We searched for maps, charts and diagrams for the project.", beforeComma: "maps", rule: "list" },
  { sentence: "Finally, we logged out and switched off the devices.", beforeComma: "Finally", rule: "intro" },
];

// Direct-speech sentences to (re)assemble with quotation marks correctly.
const SPEECH_TPL: { words: string; speaker: string }[] = [
  { words: "My tablet will not boot", speaker: "said Otieno" },
  { words: "Remember to log out", speaker: "the teacher reminded us" },
  { words: "I found three good websites", speaker: "Nasimiyu announced" },
  { words: "The file is too big to attach", speaker: "explained Mwangi" },
  { words: "Please charge the laptops tonight", speaker: "asked the head teacher" },
  { words: "This browser is much faster", speaker: "said Chebet" },
];

export const commasQuotationMarks: Skill = {
  id: "g5-eng-writing-commas-quotation-marks",
  code: "W.7",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Punctuation: Commas and Double Quotation Marks",
  description: "Use commas (lists, introductory phrases, direct address, before speech tags, between clauses) and double quotation marks around spoken words.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-punct", "fill-comma", "sort-rule", "match", "order-speech", "reason"] as const);

    if (branch === "mc-punct") {
      const t = randChoice(rng, COMMA_TPL);
      const noComma = t.sentence.replace(/,/g, "");
      const wrongPlace = t.sentence.replace(",", " ,").replace(/,\s?$/, "");
      const doubled = t.sentence.replace(", ", ",, ");
      const { choices, correctIndex } = mcFromCluster(rng, t.sentence, [noComma, wrongPlace.trim() === t.sentence.trim() ? noComma + " " : wrongPlace, doubled], 3);
      return {
        kind: "multiple-choice",
        prompt: choosePrompt(rng, "the sentence that is punctuated correctly"),
        choices,
        correctIndex,
        layout: "list",
        hint: `This sentence needs a comma for ${RULE_LABEL[t.rule]}.`,
        explanation: `Correct: "${t.sentence}" — the comma is used for ${RULE_LABEL[t.rule]}. Leaving it out, misplacing it, or doubling it are all errors.`,
      };
    }

    if (branch === "fill-comma") {
      const t = randChoice(rng, COMMA_TPL);
      const plain = t.sentence.replace(/[",]/g, "");
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the one word in this sentence that should be followed by a comma"),
        before: `Sentence: "${plain}"\nWord followed by a comma: `,
        after: "",
        correctAnswer: t.beforeComma,
        acceptedAnswers: [t.beforeComma, t.beforeComma.toLowerCase()],
        inputMode: "text",
        hint: `The comma here is for ${RULE_LABEL[t.rule]}.`,
        explanation: `"${t.beforeComma}" should be followed by a comma. Correctly punctuated: "${t.sentence}"`,
      };
    }

    if (branch === "sort-rule") {
      const pool = shuffle(rng, COMMA_TPL).slice(0, 6);
      const items = pool.map((t, i) => ({ id: `t${i}`, label: t.sentence }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((t, i) => (correctBucket[`t${i}`] = t.rule));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which comma rule each sentence shows"),
        items,
        buckets: [
          { id: "list", label: "Separating a list" },
          { id: "intro", label: "After an introductory word/phrase" },
          { id: "address", label: "Speaking to someone by name" },
          { id: "speech", label: "Before/after a speech tag" },
          { id: "clauses", label: "A pause between two clauses" },
        ],
        correctBucket,
        hint: "Look at where the comma sits and what it separates.",
        explanation: "Commas separate list items, follow introductory words, set off a name in direct address, join spoken words to 'said', and mark a pause between clauses.",
      };
    }

    if (branch === "match") {
      const rules: CommaRule[] = ["list", "intro", "address", "speech", "clauses"];
      const pool = shuffle(rng, rules).slice(0, 5).map((r) => {
        const ex = COMMA_TPL.find((t) => t.rule === r)!;
        return { r, ex: ex.sentence };
      });
      const tokens = shuffle(rng, pool.map((p) => ({ id: p.r, label: RULE_LABEL[p.r] })));
      const targets = shuffle(rng, pool.map((p) => ({ id: p.r, label: p.ex })));
      const correctMap: Record<string, string> = {};
      pool.forEach((p) => (correctMap[p.r] = p.r));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "comma rule to a sentence that uses it"),
        tokens,
        targets,
        correctMap,
        hint: "Read each sentence and find the job the comma is doing.",
        explanation: pool.map((p) => `${RULE_LABEL[p.r]}: "${p.ex}"`).join("  "),
      };
    }

    if (branch === "order-speech") {
      const s = randChoice(rng, SPEECH_TPL);
      const parts = [
        { id: "open", label: "“" },
        { id: "words", label: s.words },
        { id: "comma", label: ",”" },
        { id: "speaker", label: `${s.speaker}.` },
      ];
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the parts to write this spoken sentence correctly"),
        instruction: "Click the parts in the correct order.",
        items: shuffle(rng, parts),
        correctOrder: ["open", "words", "comma", "speaker"],
        hint: "Open the quotation marks, write the exact words, put a comma before the closing marks, then name the speaker.",
        explanation: `Correct: “${s.words},” ${s.speaker}.`,
      };
    }

    // reason — Apply: which version writes the spoken words correctly?
    const scen = SPEECH_TPL.map((s) => ({
      s: `${name(rng)} wrote down what ${s.speaker.replace(/^(said|explained|asked|announced|the teacher reminded us|the head teacher asked)/, "someone said").trim()}: the words were "${s.words}".`,
      correct: `“${s.words},” ${s.speaker}.`,
      wrong: [
        `${s.words}, ${s.speaker}.`,
        `“${s.words}”, ${s.speaker}.`,
        `“${s.words}, ${s.speaker}.”`,
      ],
    }));
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.correct, sc.wrong);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which version is punctuated correctly?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "The comma goes inside the closing quotation marks, and only the exact spoken words are inside the marks.",
      explanation: `"${sc.correct}" is correct — quotation marks wrap only the spoken words, the comma sits inside the closing marks, and the speaker tag stays outside.`,
    };
  },
};
