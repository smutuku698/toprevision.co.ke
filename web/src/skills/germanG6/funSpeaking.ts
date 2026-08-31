import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { SPORT_VOCAB, name, place, umlautAccepted } from "./shared";

// LS.5 Fun and Enjoyment (sports and games) — oral activity vocabulary practised through matching,
// sorting, fill-in, an ordered activity-planning dialogue, situational reasoning, and a dedicated
// gern/nicht gern contrast drill (Ich spiele gern Fußball / Ich spiele nicht gern Fußball) since the
// design specifically calls out expressing likes and dislikes with this grammatical pattern.

const MATCH_OPENERS = ["Match each German activity", "Pair every activity phrase", "Connect each vocabulary item", "Link each phrase below", "Match the German term", "Join each activity word"];
const MATCH_CLOSERS = ["to its correct English meaning.", "with what it means in English.", "to its English translation.", "to the right meaning.", "to what it means."];

const CATEGORIZE_OPENERS = ["Sort each activity", "Group these German activities", "Classify each activity", "Decide where each activity belongs", "Organise the activities below", "Put each activity"];
const CATEGORIZE_CLOSERS = ["into the correct category.", "by which group it belongs to.", "into the right group.", "according to its category.", "the way it should be grouped."];

const FILL_OPENERS = ["Fill in the missing German word", "Complete the sentence with the right German word", "Work out the missing German word", "Type the correct German phrase", "Supply the missing German word", "Complete this phrase correctly"];
const FILL_CLOSERS = ["to finish the sentence.", "so the sentence is correct.", "that fits the meaning.", "based on the meaning given."];

const ORDER_OPENERS = ["Put these lines", "Arrange the plan", "Order the sentences", "Sequence this activity chat", "Rearrange the pieces", "Organise the lines"];
const ORDER_CLOSERS = ["in the correct order.", "so they make sense.", "the way they would naturally be said.", "into a sensible sequence.", "in a logical order."];

const SCENARIO_PROMPT_POOL = [
  "What is happening in this situation?",
  "Read the situation and choose what fits.",
  "Work out what is being expressed here.",
  "Choose the phrase that matches the situation.",
  "What is this person doing?",
  "Pick the correct description of this moment.",
  "Decide what fits this scene.",
  "What is being said here?",
  "Which description matches what was said?",
  "Choose what best explains this exchange.",
  "What is really going on in this exchange?",
  "Work out the purpose of what was said.",
];

const GERN_PROMPT_POOL = [
  "Which sentence correctly expresses this?",
  "Choose the sentence that says this correctly in German.",
  "Pick the correctly formed German sentence.",
  "Which option is grammatically correct?",
  "Select the sentence that matches this feeling.",
  "What is the correct way to say this in German?",
  "Which sentence uses 'gern' the right way?",
  "Choose the sentence a German speaker would actually say.",
  "Which sentence correctly shows a like or dislike?",
  "Pick the option without a grammar mistake.",
  "Which sentence puts 'gern' in the right place?",
  "Select the sentence that means exactly this.",
];

type Bucket = "Sport" | "Hobby or indoor activity";

const CATEGORY_ITEMS: { word: string; bucket: Bucket }[] = [
  { word: "Fußball spielen", bucket: "Sport" },
  { word: "schwimmen", bucket: "Sport" },
  { word: "laufen", bucket: "Sport" },
  { word: "Rad fahren", bucket: "Sport" },
  { word: "Basketball spielen", bucket: "Sport" },
  { word: "springen", bucket: "Sport" },
  { word: "klettern", bucket: "Sport" },
  { word: "Volleyball spielen", bucket: "Sport" },
  { word: "lesen", bucket: "Hobby or indoor activity" },
  { word: "tanzen", bucket: "Hobby or indoor activity" },
  { word: "singen", bucket: "Hobby or indoor activity" },
  { word: "malen", bucket: "Hobby or indoor activity" },
  { word: "Schach spielen", bucket: "Hobby or indoor activity" },
  { word: "Musik hören", bucket: "Hobby or indoor activity" },
  { word: "spazieren gehen", bucket: "Hobby or indoor activity" },
  { word: "Karten spielen", bucket: "Hobby or indoor activity" },
];

const FILL_TEMPLATES: { before: string; after: string; correct: string }[] = [
  { before: "'To play football' in German is ", after: ".", correct: "Fußball spielen" },
  { before: "'To swim' in German is ", after: ".", correct: "schwimmen" },
  { before: "'To read' in German is ", after: ".", correct: "lesen" },
  { before: "'To run' in German is ", after: ".", correct: "laufen" },
  { before: "'To dance' in German is ", after: ".", correct: "tanzen" },
  { before: "'To sing' in German is ", after: ".", correct: "singen" },
  { before: "'To paint' in German is ", after: ".", correct: "malen" },
  { before: "'To cycle' in German is ", after: ".", correct: "Rad fahren" },
  { before: "'To play chess' in German is ", after: ".", correct: "Schach spielen" },
  { before: "'To climb' in German is ", after: ".", correct: "klettern" },
  { before: "'To listen to music' in German is ", after: ".", correct: "Musik hören" },
  { before: "'To go for a walk' in German is ", after: ".", correct: "spazieren gehen" },
];

const ORDER_SETS: { lines: string[] }[] = [
  { lines: ["Was machst du gern? (what do you like doing?)", "Ich spiele gern Fußball. (I like playing football)", "Und ich lese gern. (and I like reading)", "Wollen wir zusammen spielen? (shall we play together?)"] },
  { lines: ["Schwimmst du gern? (do you like swimming?)", "Ja, ich schwimme sehr gern. (yes, I like swimming a lot)", "Ich schwimme nicht so gern. (I don't like swimming that much)", "Dann spielen wir lieber Schach. (then let's play chess instead)"] },
  { lines: ["Was ist dein Hobby? (what is your hobby?)", "Ich male gern. (I like painting)", "Ich singe auch gern. (I also like singing)", "Das klingt schön! (that sounds nice!)"] },
  { lines: ["Spielst du gern Basketball? (do you like playing basketball?)", "Nein, ich spiele nicht gern Basketball. (no, I don't like playing basketball)", "Ich spiele lieber Volleyball. (I prefer playing volleyball)", "Gut, dann spielen wir Volleyball. (good, then let's play volleyball)"] },
  { lines: ["Am Wochenende gehe ich gern spazieren. (on the weekend I like going for a walk)", "Danach höre ich gern Musik. (after that I like listening to music)", "Manchmal spiele ich Karten. (sometimes I play cards)", "Das ist ein schönes Wochenende. (that's a nice weekend)"] },
];

const SCENARIO_TEMPLATES: ((n: string, p: string) => { prompt: string; correct: string; distractors: string[]; explanation: string })[] = [
  (n, p) => ({
    prompt: `${n} in ${p} runs onto the field every break time and says "Ich spiele Fußball." What activity is ${n} describing?`,
    correct: "playing football",
    distractors: ["swimming", "reading", "dancing"],
    explanation: `"Fußball spielen" means "to play football" — a completely different activity from swimming or reading.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} goes to the pool every Saturday and says "Ich schwimme." What is ${n} describing?`,
    correct: "swimming",
    distractors: ["climbing", "singing", "playing chess"],
    explanation: `"schwimmen" means "to swim" — it does not describe climbing, singing, or playing a board game.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} sits quietly with a book every evening and says "Ich lese gern." What does ${n} enjoy?`,
    correct: "reading",
    distractors: ["cycling", "running", "playing volleyball"],
    explanation: `"lesen" means "to read" — the sentence describes an enjoyed quiet activity, not a sport.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} joins a music class and says "Ich singe gern, aber ich tanze nicht gern." What does this reveal?`,
    correct: "${n} likes singing but dislikes dancing",
    distractors: ["${n} likes both singing and dancing", "${n} dislikes both singing and dancing", "${n} likes dancing but dislikes singing"],
    explanation: `"Ich singe gern" (I like singing) is positive, while "ich tanze nicht gern" (I don't like dancing) is negative — the two halves have opposite meanings.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} draws every afternoon and says "Ich male gern." What is ${n} describing?`,
    correct: "painting",
    distractors: ["playing cards", "climbing", "cycling"],
    explanation: `"malen" means "to paint" — none of the other options describe an art activity.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} owns a bicycle and says "Ich fahre gern Rad." What activity does ${n} enjoy?`,
    correct: "cycling",
    distractors: ["climbing", "swimming", "singing"],
    explanation: `"Rad fahren" means "to cycle" — a different physical activity from climbing or swimming.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} plays board games with friends and says "Ich spiele gern Schach." What activity is this?`,
    correct: "playing chess",
    distractors: ["playing cards", "playing football", "playing basketball"],
    explanation: `"Schach spielen" specifically means "to play chess" — "Karten spielen" would mean playing cards instead.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} climbs trees near their home and says "Ich klettere gern." What is being described?`,
    correct: "climbing",
    distractors: ["jumping", "running", "walking"],
    explanation: `"klettern" means "to climb" — "springen" (jumping) and "laufen" (running) describe different movements.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} always has earphones in and says "Ich höre gern Musik." What does ${n} enjoy doing?`,
    correct: "listening to music",
    distractors: ["singing", "playing an instrument", "reading"],
    explanation: `"Musik hören" means "to listen to music" — a different activity from actually singing or playing music.`,
  }),
  (n, p) => ({
    prompt: `${n} in ${p} takes an evening stroll and says "Ich gehe gern spazieren." What is ${n} describing?`,
    correct: "going for a walk",
    distractors: ["running a race", "cycling to school", "playing volleyball"],
    explanation: `"spazieren gehen" means "to go for a walk" — a relaxed activity, unlike running a race.`,
  }),
];

const GERN_TEMPLATES: { activity: string; positive: string; negative: string }[] = [
  { activity: "Fußball spielen", positive: "spiele gern Fußball", negative: "spiele nicht gern Fußball" },
  { activity: "schwimmen", positive: "schwimme gern", negative: "schwimme nicht gern" },
  { activity: "lesen", positive: "lese gern", negative: "lese nicht gern" },
  { activity: "laufen", positive: "laufe gern", negative: "laufe nicht gern" },
  { activity: "tanzen", positive: "tanze gern", negative: "tanze nicht gern" },
  { activity: "singen", positive: "singe gern", negative: "singe nicht gern" },
  { activity: "malen", positive: "male gern", negative: "male nicht gern" },
  { activity: "Rad fahren", positive: "fahre gern Rad", negative: "fahre nicht gern Rad" },
  { activity: "Basketball spielen", positive: "spiele gern Basketball", negative: "spiele nicht gern Basketball" },
  { activity: "Schach spielen", positive: "spiele gern Schach", negative: "spiele nicht gern Schach" },
  { activity: "Musik hören", positive: "höre gern Musik", negative: "höre nicht gern Musik" },
  { activity: "Karten spielen", positive: "spiele gern Karten", negative: "spiele nicht gern Karten" },
];

export const funSpeaking: Skill = {
  id: "g6-de-ls-fun",
  code: "LS.5",
  subjectId: "german",
  strandId: "g6-de-listening-speaking",
  grade: 6,
  title: "Fun and Enjoyment (Sports and Games)",
  description: "Speak and recognise German sport/game vocabulary — matching, sorting, fill-in, an ordered activity-planning dialogue, reasoning about what someone enjoys, and a dedicated gern/nicht gern drill to correctly express likes and dislikes.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill", "order", "scenario", "gern"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, SPORT_VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.word })));
      const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${i}-${v.word}`, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((v, i) => (correctMap[`${i}-${v.word}`] = `${i}-${v.word}`));
      return {
        kind: "click-match",
        prompt: `${randChoice(rng, MATCH_OPENERS)} ${randChoice(rng, MATCH_CLOSERS)}`,
        tokens,
        targets,
        correctMap,
        hint: "Look for familiar activity roots — 'spielen' means 'to play'.",
        explanation: chosen.map((v) => `"${v.word}" means "${v.meaning}".`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CATEGORY_ITEMS).slice(0, 7);
      const items = chosen.map((c, i) => ({ id: `${i}-${c.word}`, label: c.word }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`${i}-${c.word}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: `${randChoice(rng, CATEGORIZE_OPENERS)} ${randChoice(rng, CATEGORIZE_CLOSERS)}`,
        items: shuffle(rng, items),
        buckets: [
          { id: "Sport", label: "Sport" },
          { id: "Hobby or indoor activity", label: "Hobby or indoor activity" },
        ],
        correctBucket,
        hint: "Sports usually involve physical exercise or a field/court; hobbies can be calmer or indoors.",
        explanation: chosen.map((c) => `"${c.word}" is a ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const f = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `${randChoice(rng, FILL_OPENERS)} ${randChoice(rng, FILL_CLOSERS)}`,
        before: f.before,
        after: f.after,
        correctAnswer: f.correct,
        acceptedAnswers: umlautAccepted(f.correct),
        inputMode: "text",
        hint: "Think of the infinitive verb phrase for this activity.",
        explanation: `The complete sentence is: "${f.before}${f.correct}${f.after}"`,
      };
    }

    if (branch === "order") {
      const set = randChoice(rng, ORDER_SETS);
      const withIds = set.lines.map((l, i) => ({ id: `${i}-${l}`, label: l }));
      const items = shuffle(rng, withIds);
      return {
        kind: "ordering",
        prompt: `${randChoice(rng, ORDER_OPENERS)} ${randChoice(rng, ORDER_CLOSERS)}`,
        instruction: "Click the lines in the correct order.",
        items,
        correctOrder: withIds.map((w) => w.id),
        hint: "A question about a hobby usually comes before the answer describing it.",
        explanation: `A natural order is:\n${set.lines.join("\n")}`,
      };
    }

    if (branch === "scenario") {
      const n = name(rng);
      const p = place(rng);
      const tmpl = randChoice(rng, SCENARIO_TEMPLATES);
      const q = tmpl(n, p);
      const correct = q.correct.replace(/\$\{n\}/g, n);
      const distractors = q.distractors.map((d) => d.replace(/\$\{n\}/g, n));
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${randChoice(rng, SCENARIO_PROMPT_POOL)} ${q.prompt}`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: "Match the German activity word to what it actually describes.",
        explanation: q.explanation,
      };
    }

    const t = randChoice(rng, GERN_TEMPLATES);
    const positive = randChoice(rng, [true, false]);
    const cue = positive ? "You want to say you LIKE this activity." : "You want to say you DO NOT like this activity.";
    const correct = `Ich ${positive ? t.positive : t.negative}.`;
    const wrongPolarity = `Ich ${positive ? t.negative : t.positive}.`;
    const wrongOrder = positive
      ? `Ich gern ${t.positive.replace(" gern", "")}.`
      : `Ich nicht gern ${t.negative.replace(" nicht gern", "")}.`;
    const droppedGern = `Ich ${(positive ? t.positive : t.negative).replace(" gern", "")}.`;
    const distractors = [wrongPolarity, wrongOrder, droppedGern];
    const choices = shuffle(rng, [correct, ...distractors]);
    return {
      kind: "multiple-choice",
      prompt: `${randChoice(rng, GERN_PROMPT_POOL)} ${cue} (Activity: ${t.activity})`,
      choices,
      correctIndex: choices.indexOf(correct),
      layout: "list",
      hint: "'gern' goes right after the conjugated verb for a like; add 'nicht' before 'gern' for a dislike.",
      explanation: `"${correct}" is correct — "gern" follows the verb to show enjoyment, and "nicht gern" (not "nicht" alone) shows dislike without changing the verb's basic meaning.`,
    };
  },
};
