import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type SongId = "safiri" | "kisumu" | "manners";

const SONGS: { id: SongId; title: string; lyrics: string; keyIssue: string; wrongIssues: string[] }[] = [
  {
    id: "safiri",
    title: "Safiri Salama",
    lyrics:
      "Fasten your belt before we go,\nRushing the road brings only woe.\nThe matatu is full, no room for more,\nOverloading only opens danger's door.\n\nZebra crossing, watch the sign,\nRed light means stop, not race the line.\nBoda boda rider, wear your helmet tight,\nArriving late beats not arriving at all tonight.",
    keyIssue: "Following road safety rules such as wearing seatbelts and helmets, and not overloading vehicles",
    wrongIssues: ["The beauty of Kenya's national parks", "The importance of eating a balanced diet", "How to plant maize during the rainy season"],
  },
  {
    id: "kisumu",
    title: "Long Road to Kisumu",
    lyrics:
      "From Nairobi to Kisumu we ride,\nTarmac smooth on the highway side.\nBut the murram road near my village home,\nIs full of potholes wherever I roam.\n\nDriver, slow down on the bend,\nPatience brings us safely to the end.\nLong land travel needs a steady hand,\nAnd a driver who knows and loves this land.",
    keyIssue: "Driving patiently and carefully on long journeys, especially on poor road surfaces",
    wrongIssues: ["The history of the railway line in Kenya", "The best foods to pack for a picnic", "How to greet elders politely"],
  },
  {
    id: "manners",
    title: "Matatu Manners",
    lyrics:
      "Queue at the stage, don't push and shove,\nRespect for others is a sign of love.\nPay your fare, don't dodge the cost,\nA matatu run on trust is never lost.\n\nLoud music blaring, hurts the ear,\nA little respect brings travelling cheer.\nGive up your seat for the old and the young,\nKindness on the road is a song well sung.",
    keyIssue: "Showing courtesy and orderliness when travelling on public transport",
    wrongIssues: ["The dangers of overloading a vehicle", "How to repair a punctured tyre", "The correct way to cross a river on foot"],
  },
];

const VOCAB: { word: string; meaning: string }[] = [
  { word: "overloading", meaning: "Carrying more passengers or goods than is safe or legal" },
  { word: "zebra crossing", meaning: "A marked path on the road where pedestrians may safely cross" },
  { word: "tarmac", meaning: "A smooth road surface made of asphalt" },
  { word: "murram", meaning: "A reddish, unpaved gravel road surface common in rural Kenya" },
  { word: "stage", meaning: "A designated bus or matatu stop where passengers wait" },
  { word: "fare", meaning: "The money paid to travel on public transport" },
];

const VOCAB_APPLY: { before: string; after: string; correctAnswer: string; hintWord: string }[] = [
  { before: "The traffic police officer fined the driver for ", after: " the matatu with twenty extra passengers.", correctAnswer: "overloading", hintWord: "overloading" },
  { before: "Pupils were taught to cross the road only at the ", after: " near the school gate.", correctAnswer: "zebra crossing", hintWord: "zebra crossing" },
  { before: "The highway had smooth ", after: ", but the road leading to the village was rough and reddish.", correctAnswer: "tarmac", hintWord: "tarmac" },
  { before: "After heavy rain, the ", after: " road near the farm was full of muddy potholes.", correctAnswer: "murram", hintWord: "murram" },
  { before: "Passengers waited patiently at the matatu ", after: " instead of flagging down vehicles in the middle of the road.", correctAnswer: "stage", hintWord: "stage" },
  { before: "The conductor asked each passenger to pay the correct ", after: " before the matatu left the terminus.", correctAnswer: "fare", hintWord: "fare" },
];

const ISSUE_ITEMS: { text: string; song: SongId }[] = [
  { text: "Wearing a seatbelt before the vehicle moves", song: "safiri" },
  { text: "Wearing a helmet as a boda boda rider", song: "safiri" },
  { text: "Not overloading the matatu with extra passengers", song: "safiri" },
  { text: "Slowing down before a sharp bend", song: "kisumu" },
  { text: "Driving patiently on a murram road full of potholes", song: "kisumu" },
  { text: "Queueing at the stage instead of pushing", song: "manners" },
  { text: "Giving up a seat for an elderly passenger", song: "manners" },
  { text: "Paying the correct fare without dodging", song: "manners" },
];

const SONG_TITLE: Record<SongId, string> = { safiri: "Safiri Salama", kisumu: "Long Road to Kisumu", manners: "Matatu Manners" };

const FIRST_VERSE_LINES = [
  { id: "l1", label: "Fasten your belt before we go," },
  { id: "l2", label: "Rushing the road brings only woe." },
  { id: "l3", label: "The matatu is full, no room for more," },
  { id: "l4", label: "Overloading only opens danger's door." },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How can we tell the main message in a song, even without seeing the singer perform it?",
    correct: "By listening attentively to the ideas and words that repeat, and noticing the overall feeling across the verses",
    distractors: ["By reading only the title of the song and nothing else", "By counting how many verses the song has", "By guessing based only on the singer's name"],
  },
  {
    q: "Why is extensive listening, such as listening to several songs about land travel, valuable for communication skills?",
    correct: "It builds vocabulary and understanding by exposing the listener to language used in many different real contexts",
    distractors: ["It is only useful for people who want to become singers", "It has no effect on vocabulary or listening skills", "It works only if the listener already knows every word in the song"],
  },
];

function findSong(id: SongId) {
  return SONGS.find((s) => s.id === id)!;
}

export const extensiveListening: Skill = {
  id: "g7-eng-ls-extensive-listening",
  code: "LS.13",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Extensive Listening: Songs on Land Travel",
  description: "Identify the key issues raised in songs about land travel, listen attentively, and use vocabulary drawn from the songs correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-key-issue", "categorize", "match-vocab", "fill-vocab", "order-verse", "concept"] as const);
    const hint = "Listen for the ideas that repeat across the verses of a song — they usually point to its main message.";

    if (branch === "mc-key-issue") {
      const song = randChoice(rng, SONGS);
      const choices = shuffle(rng, [song.keyIssue, ...song.wrongIssues]);
      return {
        kind: "multiple-choice",
        prompt: `Read the song lyrics below. What is the main issue raised in "${song.title}"?`,
        passage: song.lyrics,
        choices,
        correctIndex: choices.indexOf(song.keyIssue),
        layout: "list",
        hint,
        explanation: `"${song.title}" is mainly about: ${song.keyIssue.toLowerCase()}.`,
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ISSUE_ITEMS).slice(0, 8);
      const items = chosen.map((it, i) => ({ id: `it${i}`, label: it.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((it, i) => (correctBucket[`it${i}`] = it.song));
      return {
        kind: "categorize",
        prompt: "Sort each land-travel habit by which song's theme it best matches.",
        items,
        buckets: (["safiri", "kisumu", "manners"] as SongId[]).map((id) => ({ id, label: SONG_TITLE[id] })),
        correctBucket,
        hint,
        explanation: chosen.map((it) => `"${it.text}" matches "${SONG_TITLE[it.song]}".`).join(" "),
      };
    }

    if (branch === "match-vocab") {
      const chosen = shuffle(rng, VOCAB).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.word })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.word, label: v.meaning })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.word] = v.word;
      return {
        kind: "click-match",
        prompt: "Match each word from the land-travel songs to its meaning.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((v) => `"${v.word}" means: ${v.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill-vocab") {
      const entry = randChoice(rng, VOCAB_APPLY);
      return {
        kind: "fill-blank",
        prompt: "Fill in the vocabulary word from the land-travel songs that best completes this sentence.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        inputMode: "text",
        hint: `This word appears in the land-travel songs and relates to "${entry.hintWord}".`,
        explanation: `The complete sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
      };
    }

    if (branch === "order-verse") {
      const items = shuffle(rng, FIRST_VERSE_LINES);
      return {
        kind: "ordering",
        prompt: "Arrange these lines from the song \"Safiri Salama\" in the order they are sung.",
        instruction: "Click them in order.",
        items,
        correctOrder: FIRST_VERSE_LINES.map((l) => l.id),
        hint: "The verse begins with an instruction about the seatbelt, then explains the danger of rushing and overloading.",
        explanation: FIRST_VERSE_LINES.map((l) => l.label).join(" "),
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
