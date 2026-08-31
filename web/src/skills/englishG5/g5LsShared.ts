import { randChoice, shuffle } from "@/lib/rng";
import type { Question } from "@/lib/types";
import type { RNG } from "@/lib/rng";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, mcFromCluster } from "./g5EngShared";

// Shared helpers for the Grade 5 English "Listening and Speaking" strand — a cross-theme bank of
// example words for every target sound named in the design, plus reusable branch builders for
// "which word has this sound" (mc), sound-word fill, and sound sorting. Each L&S skill layers its own
// sub-strand-specific focus (intonation, polite phrases, proverbs, non-verbal cues, etc.) on top.
// See curriculum-reference/grade-5/english.json.

export type SoundEntry = { sound: string; word: string };

export const SOUND_BANK: SoundEntry[] = [
  // 1.1 Child Rights — /ʌ/ and /ɑː/
  { sound: "/ʌ/", word: "punish" }, { sound: "/ʌ/", word: "duties" }, { sound: "/ʌ/", word: "must" }, { sound: "/ʌ/", word: "hunt" }, { sound: "/ʌ/", word: "cup" }, { sound: "/ʌ/", word: "shut" },
  { sound: "/ɑː/", word: "harm" }, { sound: "/ɑː/", word: "card" }, { sound: "/ɑː/", word: "far" }, { sound: "/ɑː/", word: "arm" }, { sound: "/ɑː/", word: "part" }, { sound: "/ɑː/", word: "guard" },
  // 2.1 National Celebrations — /p/ and /b/
  { sound: "/p/", word: "parade" }, { sound: "/p/", word: "patriotic" }, { sound: "/p/", word: "pin" }, { sound: "/p/", word: "cap" }, { sound: "/p/", word: "pen" }, { sound: "/p/", word: "rope" },
  { sound: "/b/", word: "banner" }, { sound: "/b/", word: "bell" }, { sound: "/b/", word: "cab" }, { sound: "/b/", word: "big" }, { sound: "/b/", word: "rob" }, { sound: "/b/", word: "ribbon" },
  // 3.1 Etiquette — /ɔɪ/
  { sound: "/ɔɪ/", word: "polite" }, { sound: "/ɔɪ/", word: "enjoy" }, { sound: "/ɔɪ/", word: "boil" }, { sound: "/ɔɪ/", word: "voice" }, { sound: "/ɔɪ/", word: "spoil" }, { sound: "/ɔɪ/", word: "join" },
  // 4.1 & 12.1 Road Accidents / Pollution — /t/ and /d/
  { sound: "/t/", word: "traffic" }, { sound: "/t/", word: "seat" }, { sound: "/t/", word: "time" }, { sound: "/t/", word: "mat" }, { sound: "/t/", word: "test" }, { sound: "/t/", word: "boat" },
  { sound: "/d/", word: "danger" }, { sound: "/d/", word: "road" }, { sound: "/d/", word: "day" }, { sound: "/d/", word: "mad" }, { sound: "/d/", word: "desk" }, { sound: "/d/", word: "bead" },
  // 5.1 Traditional Foods — /e/
  { sound: "/e/", word: "recipe" }, { sound: "/e/", word: "healthy" }, { sound: "/e/", word: "bread" }, { sound: "/e/", word: "egg" }, { sound: "/e/", word: "bed" }, { sound: "/e/", word: "friend" },
  // 6.1 Jobs & 12.1 Pollution — /f/ and /v/
  { sound: "/f/", word: "farmer" }, { sound: "/f/", word: "fan" }, { sound: "/f/", word: "leaf" }, { sound: "/f/", word: "fun" }, { sound: "/f/", word: "safe" }, { sound: "/f/", word: "phone" },
  { sound: "/v/", word: "vet" }, { sound: "/v/", word: "van" }, { sound: "/v/", word: "give" }, { sound: "/v/", word: "voice" }, { sound: "/v/", word: "seven" }, { sound: "/v/", word: "leave" },
  // 7.1 Technology — /ə/, /ɪə/, /eɪ/
  { sound: "/ə/", word: "computer" }, { sound: "/ə/", word: "about" }, { sound: "/ə/", word: "again" }, { sound: "/ə/", word: "camera" }, { sound: "/ə/", word: "banana" }, { sound: "/ə/", word: "teacher" },
  { sound: "/ɪə/", word: "near" }, { sound: "/ɪə/", word: "clear" }, { sound: "/ɪə/", word: "hear" }, { sound: "/ɪə/", word: "year" }, { sound: "/ɪə/", word: "appear" }, { sound: "/ɪə/", word: "engineer" },
  { sound: "/eɪ/", word: "email" }, { sound: "/eɪ/", word: "play" }, { sound: "/eɪ/", word: "wait" }, { sound: "/eɪ/", word: "make" }, { sound: "/eɪ/", word: "day" }, { sound: "/eɪ/", word: "train" },
  // 8.1 The Farm — /k/ and /g/
  { sound: "/k/", word: "coffee" }, { sound: "/k/", word: "acre" }, { sound: "/k/", word: "cane" }, { sound: "/k/", word: "cat" }, { sound: "/k/", word: "school" }, { sound: "/k/", word: "back" },
  { sound: "/g/", word: "granary" }, { sound: "/g/", word: "grain" }, { sound: "/g/", word: "goat" }, { sound: "/g/", word: "bag" }, { sound: "/g/", word: "green" }, { sound: "/g/", word: "dig" },
  // 9.1 Communicable Diseases — /h/
  { sound: "/h/", word: "hygiene" }, { sound: "/h/", word: "health" }, { sound: "/h/", word: "hand" }, { sound: "/h/", word: "hot" }, { sound: "/h/", word: "behind" }, { sound: "/h/", word: "ahead" },
  // 10.1 Leisure — /s/ and /z/
  { sound: "/s/", word: "sport" }, { sound: "/s/", word: "skate" }, { sound: "/s/", word: "bus" }, { sound: "/s/", word: "sun" }, { sound: "/s/", word: "pass" }, { sound: "/s/", word: "race" },
  { sound: "/z/", word: "zone" }, { sound: "/z/", word: "buzz" }, { sound: "/z/", word: "prize" }, { sound: "/z/", word: "zoo" }, { sound: "/z/", word: "rose" }, { sound: "/z/", word: "lazy" },
  // 11.1 Sports — /aɪ/
  { sound: "/aɪ/", word: "prize" }, { sound: "/aɪ/", word: "cycle" }, { sound: "/aɪ/", word: "time" }, { sound: "/aɪ/", word: "high" }, { sound: "/aɪ/", word: "try" }, { sound: "/aɪ/", word: "line" },
  // 13.1 Money — /m/, /n/, /ŋ/
  { sound: "/m/", word: "money" }, { sound: "/m/", word: "manager" }, { sound: "/m/", word: "sum" }, { sound: "/m/", word: "mat" }, { sound: "/m/", word: "team" }, { sound: "/m/", word: "climb" },
  { sound: "/n/", word: "note" }, { sound: "/n/", word: "loan" }, { sound: "/n/", word: "nine" }, { sound: "/n/", word: "sun" }, { sound: "/n/", word: "pen" }, { sound: "/n/", word: "know" },
  { sound: "/ŋ/", word: "banking" }, { sound: "/ŋ/", word: "saving" }, { sound: "/ŋ/", word: "ring" }, { sound: "/ŋ/", word: "song" }, { sound: "/ŋ/", word: "long" }, { sound: "/ŋ/", word: "strong" },
];

export function wordsFor(sound: string): string[] {
  return SOUND_BANK.filter((e) => e.sound === sound).map((e) => e.word);
}
export function wordsNotFor(sound: string): string[] {
  return Array.from(new Set(SOUND_BANK.filter((e) => e.sound !== sound).map((e) => e.word)));
}

/** MC: "which word has the sound X?" — correct is a word with the sound, distractors are words without it. */
export function whichWordBranch(rng: RNG, sounds: string[]): Question {
  const sound = randChoice(rng, sounds);
  const correct = randChoice(rng, wordsFor(sound));
  const wrong = shuffle(rng, wordsNotFor(sound)).slice(0, 3);
  const { choices, correctIndex } = mcFromCluster(rng, correct, wrong, 3);
  return {
    kind: "multiple-choice",
    prompt: `${choosePrompt(rng, `the word that has the sound ${sound}`)}`,
    choices,
    correctIndex,
    layout: "row",
    hint: `Say each word slowly and listen for the ${sound} sound.`,
    explanation: `"${correct}" contains the sound ${sound}. The other words do not.`,
  } as Question;
}

/** categorize: sort words into "has sound A" vs "has sound B" (two target sounds). */
export function sortTwoSoundsBranch(rng: RNG, soundA: string, soundB: string): Question {
  const a = shuffle(rng, wordsFor(soundA)).slice(0, 3);
  const b = shuffle(rng, wordsFor(soundB)).slice(0, 3);
  const items = shuffle(rng, [
    ...a.map((w, i) => ({ id: `a${i}`, label: w, k: "a" })),
    ...b.map((w, i) => ({ id: `b${i}`, label: w, k: "b" })),
  ]);
  const correctBucket: Record<string, string> = {};
  items.forEach((it) => (correctBucket[it.id] = it.k));
  return {
    kind: "categorize",
    prompt: sortPrompt(rng, `whether each word has the sound ${soundA} or ${soundB}`),
    items: items.map(({ id, label }) => ({ id, label })),
    buckets: [
      { id: "a", label: `Has ${soundA}` },
      { id: "b", label: `Has ${soundB}` },
    ],
    correctBucket,
    hint: "Say each word aloud and listen carefully to the vowel or consonant sound.",
    explanation: `${soundA}: ${a.join(", ")}. ${soundB}: ${b.join(", ")}.`,
  } as Question;
}

/** fill: type a word from the theme that contains the target sound (accept any bank word for that sound). */
export function soundFillBranch(rng: RNG, sound: string, themeWord: string): Question {
  const accepted = wordsFor(sound);
  const example = randChoice(rng, accepted);
  return {
    kind: "fill-blank",
    prompt: fillPrompt(rng, `a word that contains the sound ${sound} (for example, one like "${themeWord}")`),
    before: `A word with the sound ${sound}: `,
    after: "",
    correctAnswer: example,
    acceptedAnswers: accepted,
    inputMode: "text",
    hint: `Think of any word where you can hear ${sound}.`,
    explanation: `Words with ${sound} include: ${accepted.slice(0, 6).join(", ")}.`,
  } as Question;
}

export { randChoice, shuffle, matchPrompt };
