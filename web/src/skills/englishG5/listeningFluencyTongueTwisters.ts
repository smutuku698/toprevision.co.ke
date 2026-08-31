import type { Skill } from "@/lib/types";
import { randChoice, shuffle } from "@/lib/rng";
import { whichWordBranch, soundFillBranch } from "./g5LsShared";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 11.0 Sports - Appreciating Talents, sub-strand 11.1 Pronunciation and
// Vocabulary — Listening Fluency. Focus: target sound /aɪ/, tongue twisters, interpret a speaker's
// emotions and feelings during oral presentations, listen for words with /aɪ/.
// See curriculum-reference/grade-5/english.json.

const TONGUE_TWISTERS = [
  "Five fine finalists filed by the finish line.",
  "The bright kite flew high in the wide sky.",
  "Nine tired cyclists tried the tight mountain trail.",
  "My mighty rival smiled a shy, sly smile.",
  "The wild crowd cried, 'Try, try, don't slide!'",
];

const EMOTIONS: { line: string; feeling: string }[] = [
  { line: "\"I can't believe it — we won! WE WON!\" she cried, jumping up and down.", feeling: "overjoyed" },
  { line: "\"So close... one more point and it was ours,\" he said, shaking his head slowly.", feeling: "disappointed" },
  { line: "\"My hands are shaking. What if I drop the baton?\" she whispered before the relay.", feeling: "anxious" },
  { line: "\"I trained every morning for a year, and it paid off,\" he said, standing tall on the podium.", feeling: "proud" },
  { line: "\"That was not a fair call by the referee,\" he muttered, frowning.", feeling: "annoyed" },
  { line: "\"Win or lose, I just love being on the track,\" she said with a relaxed grin.", feeling: "content" },
];

export const listeningFluencyTongueTwisters: Skill = {
  id: "g5-eng-ls-listening-fluency-tongue-twisters",
  code: "LS.11",
  subjectId: "english",
  strandId: "g5-eng-listening-speaking",
  grade: 5,
  title: "Listening Fluency: Sound /aɪ/, Tongue Twisters and Emotions",
  description: "Recognise the sound /aɪ/, pick out /aɪ/ words in tongue twisters, and interpret a speaker's emotions during an oral presentation about sports.",
  generate(rng) {
    const branch = randChoice(rng, ["sound-mc", "sound-fill", "twister-order", "twister-count", "emotion-mc", "emotion-match", "reason"] as const);

    if (branch === "sound-mc") return whichWordBranch(rng, ["/aɪ/"]);
    if (branch === "sound-fill") return soundFillBranch(rng, "/aɪ/", "prize");

    if (branch === "twister-order") {
      const t = randChoice(rng, TONGUE_TWISTERS);
      const words = t.replace(/[.,]/g, "").split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make this tongue twister"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: "Read it aloud slowly — the repeated sounds help you feel the order.",
        explanation: `Tongue twister: "${t}"`,
      };
    }

    if (branch === "twister-count") {
      const t = randChoice(rng, TONGUE_TWISTERS);
      // count words with /aɪ/ (rough: contains 'i' making the long-i sound in these hand-picked lines)
      const aiWords = t.replace(/[.,']/g, "").split(" ").filter((w) => /^(five|fine|finalists|filed|finish|line|bright|kite|high|wide|sky|nine|tired|cyclists|tried|tight|mountain|trail|my|mighty|rival|smiled|shy|sly|smile|wild|cried|try|slide)$/i.test(w));
      const correct = String(aiWords.length);
      const nums = [correct, String(aiWords.length + 1), String(Math.max(0, aiWords.length - 1)), String(aiWords.length + 2)];
      const { choices, correctIndex } = mcFromCluster(rng, correct, nums.slice(1), 3);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "how many words in this tongue twister have the /aɪ/ sound")}\n"${t}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Say the tongue twister slowly and tap each time you hear the long /aɪ/ ('eye') sound.",
        explanation: `${correct} words have /aɪ/: ${aiWords.join(", ")}.`,
      };
    }

    if (branch === "emotion-mc") {
      const e = randChoice(rng, EMOTIONS);
      const wrong = shuffle(rng, EMOTIONS.filter((x) => x.feeling !== e.feeling)).slice(0, 3).map((x) => x.feeling);
      const { choices, correctIndex } = mcFromCluster(rng, e.feeling, wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, `After the match, an athlete says: ${e.line}`, "How does the athlete feel?"),
        choices,
        correctIndex,
        layout: "row",
        hint: "Use the words and the described actions together.",
        explanation: `The athlete feels ${e.feeling}.`,
      };
    }

    if (branch === "emotion-match") {
      const pool = shuffle(rng, EMOTIONS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((e, i) => ({ id: `p${i}`, label: e.line })));
      const targets = shuffle(rng, pool.map((e, i) => ({ id: `p${i}`, label: e.feeling })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_e, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "spoken line to the feeling behind it"),
        tokens,
        targets,
        correctMap,
        hint: "Match volume, word choice and body language to the feeling.",
        explanation: pool.map((e) => `${e.line} → ${e.feeling}`).join("  "),
      };
    }

    // reason (fill or sort)
    if (rng() < 0.5) {
      const e = randChoice(rng, EMOTIONS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "one word for how the speaker feels"),
        before: `"${e.line}"\nFeeling: `,
        after: "",
        correctAnswer: e.feeling,
        acceptedAnswers: [e.feeling],
        inputMode: "text",
        hint: "One feeling word.",
        explanation: `The speaker feels ${e.feeling}.`,
      };
    }
    const pool = shuffle(rng, EMOTIONS).slice(0, 6);
    const items = pool.map((e, i) => ({ id: `e${i}`, label: e.line }));
    const correctBucket: Record<string, string> = {};
    pool.forEach((e, i) => (correctBucket[`e${i}`] = ["overjoyed", "proud", "content"].includes(e.feeling) ? "positive" : "negative"));
    return {
      kind: "categorize",
      prompt: sortPrompt(rng, "whether the speaker's feeling is positive or negative"),
      items,
      buckets: [
        { id: "positive", label: "Positive feeling" },
        { id: "negative", label: "Negative feeling" },
      ],
      correctBucket,
      hint: "Winning, pride and calm are positive; losing, worry and anger are negative.",
      explanation: "A good listener notices the speaker's feeling from tone, words and body language.",
    };
  },
};
