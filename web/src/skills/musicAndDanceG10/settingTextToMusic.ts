import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./sharedG10";

// KICD Grade 10 Music and Dance, Strand 1.0, sub-strand 1.4 "Setting Text to Music"
// (curriculum-reference/grade-10/music-and-dance.json, strands[0].subStrands[3]). Process
// concepts: syllabic division, accents (strong/weak), natural speech inflection/intonation,
// rhythm, time signature, cadential points, pitch; structural rules: two lines of text at 8
// syllables per phrase, downbeat/upbeat (anacrusis) as melody starting points; and — a hard,
// named content floor — 5 Kiswahili text topics the design explicitly names: regulation for
// road users (designated crossing points, PPE), financial literacy (self financial management),
// waste management, drug and substance abuse, and healthy relationships. No dedicated VisualSpec
// exists for text-setting/syllabic content, so no branch uses a visual — a deliberate, documented
// skip per the precedent in agricultureG6/rearingSmallDomesticAnimals.ts.

// ---- Process-concept vocabulary (14 terms) — feeds click-match, sliced to an 8-of-14 subset. ----
const TERMS: { id: string; label: string; meaning: string }[] = [
  { id: "syllabic-division", label: "Syllabic division", meaning: "Splitting words into their syllables so each syllable can be given its own note or pitch" },
  { id: "strong-accent", label: "Strong accent", meaning: "The stressed syllable of a word, usually placed on a stronger beat of the bar" },
  { id: "weak-accent", label: "Weak accent", meaning: "An unstressed syllable of a word, usually placed on a weaker beat of the bar" },
  { id: "speech-inflection", label: "Natural speech inflection", meaning: "The natural rise and fall in pitch a word or phrase carries when spoken aloud" },
  { id: "intonation", label: "Intonation", meaning: "The overall pattern of pitch rising and falling across a spoken phrase or sentence" },
  { id: "rhythm", label: "Rhythm", meaning: "The pattern of note durations chosen to match the natural timing of the spoken text" },
  { id: "time-signature", label: "Time signature", meaning: "The chosen metre that the text's rhythm and accents are fitted into" },
  { id: "cadential-point", label: "Cadential point", meaning: "A point in the melody where a musical phrase comes to a natural rest or pause" },
  { id: "pitch", label: "Pitch", meaning: "The specific note assigned to a syllable of text" },
  { id: "downbeat-start", label: "Downbeat start", meaning: "A melody that begins exactly on the first, strong beat of the bar" },
  { id: "anacrusis", label: "Upbeat (anacrusis)", meaning: "One or more notes that begin a melody before the first strong beat of the bar" },
  { id: "word-painting", label: "Word painting", meaning: "Choosing a melodic shape that reflects the meaning of the word being set, such as a rising line for the word 'rise'" },
  { id: "melodic-contour", label: "Melodic contour", meaning: "The overall shape traced by a melody's pitches moving up and down" },
  { id: "8-syllable-phrase", label: "8-syllable phrase", meaning: "The phrase length this sub-strand's two lines of text are each built to — 8 syllables per line" },
];

const TERM_MATCH_PROMPTS = [
  "Match each text-setting term to its correct meaning.",
  "Pair each term below with the meaning that fits it.",
  "Connect each term to its correct definition.",
  "Match each term to what it describes.",
  "For each term below, choose its matching meaning.",
  "Line up each term with its correct meaning.",
  "Which meaning goes with which term? Match them correctly.",
  "Pair up every term with its correct definition.",
  "Match each concept on the left to its meaning on the right.",
  "Work out what each term means, then match it correctly.",
  "Sort out which meaning belongs to which term, by matching them.",
  "Correctly match every term to the meaning that fits it.",
  "Match each text-setting term below to its definition.",
  "Connect each of these terms to what it actually means.",
  "Pair each term with the description that explains it.",
  "Match the terms to their meanings below.",
  "Figure out what each term means, then match it up.",
  "Which definition matches which term? Match them.",
  "Match each item on the left to the term it defines on the right.",
  "Match each text-setting concept to its correct explanation.",
];

// ---- Kiswahili topic facts (15 facts, 3 per topic) — feeds categorize, sliced to a 10-of-15 subset. ----
type Topic = "road-safety" | "financial-literacy" | "waste-management" | "drug-abuse" | "healthy-relationships";
const TOPIC_LABEL: Record<Topic, string> = {
  "road-safety": "Regulation for road users",
  "financial-literacy": "Financial literacy",
  "waste-management": "Waste management",
  "drug-abuse": "Drug and substance abuse",
  "healthy-relationships": "Healthy relationships",
};
const TOPIC_FACTS: { text: string; topic: Topic }[] = [
  { text: "Kiswahili lyrics urging pedestrians to cross only at designated crossing points", topic: "road-safety" },
  { text: "A composed song reminding boda boda riders to wear a helmet as personal protective equipment", topic: "road-safety" },
  { text: "Text set to music warning drivers against overtaking near a designated pedestrian crossing", topic: "road-safety" },
  { text: "Kiswahili text encouraging listeners to save a portion of their income every month", topic: "financial-literacy" },
  { text: "A song's lyrics explaining the importance of budgeting personal money wisely", topic: "financial-literacy" },
  { text: "Text set to music warning against reckless borrowing without a repayment plan", topic: "financial-literacy" },
  { text: "Kiswahili lyrics encouraging households to separate and recycle their waste", topic: "waste-management" },
  { text: "A composed song discouraging littering in public spaces within the community", topic: "waste-management" },
  { text: "Text set to music explaining the dangers of burning plastic waste openly", topic: "waste-management" },
  { text: "Kiswahili text warning young people against the dangers of substance abuse", topic: "drug-abuse" },
  { text: "A song's lyrics encouraging peers to say no to offers of alcohol at a young age", topic: "drug-abuse" },
  { text: "Text set to music describing the health consequences of drug addiction", topic: "drug-abuse" },
  { text: "Kiswahili lyrics encouraging respectful, honest communication between friends", topic: "healthy-relationships" },
  { text: "A composed song about recognising and avoiding an unhealthy or abusive relationship", topic: "healthy-relationships" },
  { text: "Text set to music celebrating trust and mutual respect within a family", topic: "healthy-relationships" },
];

const CATEGORIZE_PROMPTS = [
  "Sort each piece of text by the pertinent issue it addresses.",
  "Group these lyric ideas under the issue they raise.",
  "Decide which issue each piece of text below addresses, and sort it there.",
  "Sort each statement into the issue it best fits.",
  "Place each piece of text into the bucket for the issue it raises.",
  "Read each piece of text and sort it under the matching issue.",
  "Work out which issue each piece of text is about, then sort it there.",
  "Classify each lyric idea by the issue it belongs to.",
  "Organize these pieces of text into the correct issue.",
  "Which issue does each piece of text address? Sort it accordingly.",
  "Sort each statement below by pertinent and contemporary issue.",
  "Drop each piece of text into the issue it's really about.",
  "Group each statement with the issue it correctly addresses.",
  "Decide where each piece of text fits among the five issues.",
  "Sort these pieces of text into their correct issue groups.",
  "For each piece of text, work out the issue it belongs to and sort it in.",
  "Place these statements under the issue each one matches.",
  "Sort each piece of text correctly among the five named issues.",
  "Read each statement and file it under the right issue.",
  "Assign each piece of text to the issue it best addresses.",
];

// ---- Ordering pool: text-to-music process, condensed directly from the design's own Suggested
// Learning Experiences bullet order. ----
const PROCESS_STEPS = [
  { id: "discuss-process", label: "Discuss the process involved in setting text in Kiswahili to music" },
  { id: "read-accents", label: "Read the Kiswahili words to establish the accents, natural speech inflections, and intonation" },
  { id: "select-text", label: "Select text in Kiswahili on a pertinent and contemporary issue" },
  { id: "recite-text", label: "Recite the text to establish the text-melody relationships" },
  { id: "choose-time-sig", label: "Choose an appropriate time signature and identify cadential points and phrases" },
  { id: "add-pitches", label: "Add appropriate pitches to the syllables, paying attention to word painting and melodic contour" },
  { id: "write-notation", label: "Write the composed music in staff notation" },
  { id: "perform-record", label: "Organize a concert, perform the song, then record and save the music" },
];

const ORDERING_PROMPTS = [
  "Arrange these steps of setting Kiswahili text to music in the correct order.",
  "Put these text-setting steps into a sensible order.",
  "Sequence the steps of setting text to music correctly.",
  "Arrange these actions into the order a composer would actually follow them.",
  "Order these steps the way a learner setting text to music should carry them out.",
  "Sort these steps into the order they should happen when setting text to music.",
  "Put these steps in the order a composer would follow to set text to music.",
  "Work out the sensible order for these text-setting tasks.",
  "Arrange these tasks into a logical text-setting process.",
  "Which order should these steps happen in? Arrange them correctly.",
  "Build a sensible process by ordering these text-setting steps correctly.",
  "Sequence a composer's text-setting tasks in the order they should be done.",
  "Order these actions the way they'd happen when setting Kiswahili text to music.",
  "Arrange the steps of setting text to music, in the right order.",
  "Put these tasks into the order a composer would complete them.",
  "Sequence these steps to build a sensible text-setting process.",
  "Work out the correct order for setting, performing, and sharing a text-based song.",
  "Arrange these steps as a learner would carry them out in class.",
  "Order the tasks below the way the text-setting process actually runs.",
  "Sequence these steps correctly, from first to last.",
];

// ---- Fill-blank pool (12 templates). ----
const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[]; explanation: string }[] = [
  { before: "Splitting a word into its syllables so each can carry a note is called ", after: ".", correctAnswer: "syllabic division", acceptedAnswers: ["syllabic division"], explanation: "Syllabic division splits words into syllables so each can be assigned its own note or pitch." },
  { before: "A melody that begins with one or more notes before the first strong beat of the bar has an ", after: " start.", correctAnswer: "anacrusis", acceptedAnswers: ["anacrusis", "upbeat"], explanation: "An anacrusis (upbeat) is a note or notes that lead into the melody before the bar's first strong beat." },
  { before: "A melody that begins exactly on the first strong beat of the bar has a ", after: " start.", correctAnswer: "downbeat", acceptedAnswers: ["downbeat"], explanation: "A downbeat start places the first note of the melody directly on the bar's first strong beat." },
  { before: "The design specifies two lines of text, each built to ", after: " syllables per phrase.", correctAnswer: "8", acceptedAnswers: ["8", "eight"], explanation: "This sub-strand's structural rule is two lines of text at 8 syllables per phrase." },
  { before: "A point in a melody where a musical phrase comes to a natural rest is called a ", after: " point.", correctAnswer: "cadential", acceptedAnswers: ["cadential"], explanation: "A cadential point is where a phrase reaches a natural pause or resting place." },
  { before: "Choosing a melodic shape that reflects a word's meaning, such as a rising line for the word 'rise', is called ", after: ".", correctAnswer: "word painting", acceptedAnswers: ["word painting"], explanation: "Word painting shapes the melody to musically illustrate the meaning of the text." },
  { before: "The natural rise and fall in pitch a spoken phrase carries is its ", after: ".", correctAnswer: "intonation", acceptedAnswers: ["intonation"], explanation: "Intonation is the natural pitch pattern of speech, which a composer should reflect when setting text to music." },
  { before: "Stressed syllables of a word are usually placed on a ", after: " beat of the bar.", correctAnswer: "strong", acceptedAnswers: ["strong"], explanation: "A word's stressed (strong-accent) syllable is normally set to a strong beat, matching natural speech emphasis." },
  { before: "Unstressed syllables of a word are usually placed on a ", after: " beat of the bar.", correctAnswer: "weak", acceptedAnswers: ["weak"], explanation: "A word's unstressed (weak-accent) syllable is normally set to a weaker beat, matching natural speech emphasis." },
  { before: "The overall shape traced by a melody's pitches moving up and down is its melodic ", after: ".", correctAnswer: "contour", acceptedAnswers: ["contour"], explanation: "Melodic contour describes the rising-and-falling shape a melody traces over its phrase." },
  { before: "The specific note assigned to a syllable of text is called its ", after: ".", correctAnswer: "pitch", acceptedAnswers: ["pitch"], explanation: "Pitch is the specific note height given to each syllable when setting text to music." },
  { before: "Fitting the text's accents and rhythm into a chosen metre requires selecting an appropriate ", after: ".", correctAnswer: "time signature", acceptedAnswers: ["time signature"], explanation: "The time signature is the metre the text's rhythm and accent pattern must be fitted into." },
];

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence correctly.",
  "Work out the missing word and fill it in.",
  "What word or phrase completes this sentence?",
  "Fill in the correct term below.",
  "Complete the statement with the correct term.",
  "Which term belongs in the blank?",
  "Fill in the gap correctly.",
  "Work out what belongs in the blank.",
  "Complete the sentence with the right term.",
  "What is missing from this sentence?",
  "Fill in the blank with the correct term.",
  "Finish the sentence correctly.",
  "Which term correctly fills this blank?",
  "Complete this statement.",
  "Work out the correct term for the blank.",
  "Fill in the missing term below.",
  "What term correctly completes this sentence?",
];

// ---- Reasoning (Apply/Evaluate) pool: 12 situations x 24 frames (6 openers x 4 closers)
// = 288 templates. Grounded in the design's 5 named Kiswahili topics and the "Citizenship"
// core competency (community sensitization through composed music). ----
interface TextFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: TextFact[] = [
  {
    situation: "a learner sets a Kiswahili phrase warning pedestrians to use designated crossing points, but places the word's naturally strong syllable on the weakest beat of the bar",
    correct: "This is a text-setting error — a word's naturally stressed syllable should be placed on a strong beat so the natural speech accent is not distorted",
    wrong: [
      "This is correct, since accent placement does not matter once a message is important enough",
      "This is correct, since strong syllables should always fall on weak beats for variety",
      "This is an error only because the topic is about road safety, not because of the accent placement",
    ],
  },
  {
    situation: "a composer chooses to set a two-line Kiswahili text about saving money wisely, keeping each line to exactly 8 syllables as required",
    correct: "This follows the sub-strand's structural rule correctly — two lines of text at 8 syllables per phrase",
    wrong: [
      "This is incorrect, since each line should contain exactly 4 syllables, not 8",
      "This is incorrect, since only one line of text is allowed under this rule",
      "This is correct only if the topic is about financial literacy specifically",
    ],
  },
  {
    situation: "a melody set to a Kiswahili phrase about avoiding drug and substance abuse begins with two short notes before the bar's first strong beat",
    correct: "This melody begins with an anacrusis (upbeat) — notes that lead in before the bar's first strong beat",
    wrong: [
      "This melody begins on a downbeat, since all melodies with text must start on beat one",
      "This is an error, since a melody may never begin before the first strong beat of a bar",
      "This is an error specific to Kiswahili text, which must always start on the downbeat",
    ],
  },
  {
    situation: "while setting a Kiswahili line about wearing personal protective equipment on the road, a learner ignores the natural rise and fall of the spoken phrase entirely and assigns pitches at random",
    correct: "This misses an important part of the process — natural speech inflection and intonation should guide how pitches are assigned to the syllables",
    wrong: [
      "This is fine, since pitch assignment has nothing to do with how the text is naturally spoken",
      "This is fine, since intonation only matters for songs about financial literacy",
      "This is an error only because road-safety topics require a fixed melody shape",
    ],
  },
  {
    situation: "a learner chooses a rising melodic line specifically for the word 'ongezeka' (increase) in a Kiswahili phrase about growing personal savings",
    correct: "This is a good use of word painting — the rising melodic shape reflects the meaning of the word 'increase'",
    wrong: [
      "This is incorrect, since word painting should never be used with Kiswahili text",
      "This is incorrect, since melodic shape must never reflect a word's meaning",
      "This is correct, but only because the topic happens to be financial literacy",
    ],
  },
  {
    situation: "a composer sets a two-line Kiswahili text about waste management but never identifies a cadential point anywhere in either phrase",
    correct: "This is incomplete — a cadential point gives each phrase a natural resting place, which the process explicitly calls for",
    wrong: [
      "Cadential points are optional and only apply to religious or ceremonial texts",
      "Cadential points only matter in phrases about healthy relationships",
      "A phrase should never come to a rest, so this omission is not an error",
    ],
  },
  {
    situation: "a learner selects Kiswahili text about healthy relationships and organizes a school concert to perform the finished, notated song for the local community",
    correct: "This matches the sub-strand's expected process well — selecting text, composing, notating, and performing for a wider audience are all part of setting text to music",
    wrong: [
      "Performing for a community audience is unnecessary once the music is notated",
      "Only performing for classmates counts; a community audience is not part of this process",
      "Notating the music is unnecessary once a performance has been arranged",
    ],
  },
  {
    situation: "a learner records their finished, performed Kiswahili song in a digital portfolio, saving both audio and notated versions",
    correct: "This is good practice — recording and saving the composed music in a digital or physical portfolio is part of the process",
    wrong: [
      "Recording the performance serves no purpose once the concert is over",
      "Only the audio recording should be kept; the notated version is unnecessary",
      "Digital portfolios are only appropriate for songs about waste management",
    ],
  },
  {
    situation: "a learner sets Kiswahili text about drug and substance abuse to a time signature and note values without first identifying the phrase's cadential points",
    correct: "The process is out of order — cadential points and phrases should be identified as the time signature and note values are chosen, not skipped",
    wrong: [
      "The order does not matter, since cadential points can be added at any stage or skipped entirely",
      "This is correct practice for topics about substance abuse specifically",
      "Cadential points only apply after a melody is fully composed, never before",
    ],
  },
  {
    situation: "a learner sets a Kiswahili phrase about respecting road-crossing regulations, matching each syllable's natural stress to the strong and weak beats of a chosen time signature",
    correct: "This reflects the process well — fitting the text's natural accents to the strong and weak beats of the chosen time signature is exactly what good text-setting requires",
    wrong: [
      "This is unnecessary, since natural word stress has no relationship to a bar's strong and weak beats",
      "This only matters for texts about financial literacy",
      "Matching stress to strong/weak beats should be avoided, since it limits melodic creativity",
    ],
  },
  {
    situation: "a learner composing a song about healthy relationships wants their message to genuinely sensitize their local community, not just satisfy a classroom assignment",
    correct: "This reflects the sub-strand's citizenship-focused intent well — using composed Kiswahili text on a pertinent issue to sensitize the wider community is an explicit part of the design",
    wrong: [
      "Community sensitization is not a goal of this sub-strand at all",
      "This is only relevant for songs about waste management, not healthy relationships",
      "A composed song can only sensitize a community if it avoids naming the issue directly",
    ],
  },
  {
    situation: "a learner sets two lines of Kiswahili text about waste management, but writes the second phrase with 12 syllables instead of matching the first phrase's 8",
    correct: "This breaks the sub-strand's structural rule — both lines of text should be built to 8 syllables per phrase, not just the first one",
    wrong: [
      "This is fine, since only the first phrase needs to follow the 8-syllable rule",
      "This is fine, since syllable count is only relevant for road-safety topics",
      "This is fine, since the rule only applies to phrases about financial literacy",
    ],
  },
];

const REASONING_OPENERS: ((rng: RNG, fact: TextFact) => string)[] = [
  (rng, fact) => `${name(rng)}, a Grade 10 learner near ${place(rng)}, is setting Kiswahili text to music, where ${fact.situation}`,
  (rng, fact) => `During a composition lesson near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)} is working on a text-setting assignment, and ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `While reviewing a classmate's composition near ${place(rng)}, ${name(rng)} notices that ${fact.situation}`,
  (rng, fact) => `In a music workshop at a school near ${place(rng)}, ${fact.situation}`,
];

const REASONING_CLOSERS = ["Is this correct?", "What is the correct judgement here?", "Is this correctly done?", "Which conclusion is correct?"];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);
const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

export const settingTextToMusic: Skill = {
  id: "g10-mad-setting-text-to-music",
  code: "1.4",
  subjectId: "music-and-dance",
  strandId: "g10-mad-foundations",
  grade: 10,
  title: "Setting Text to Music",
  description: "The process of setting Kiswahili text to music — syllabic division, accents, natural speech inflection, rhythm, time signature, cadential points, pitch, downbeat/upbeat starts — using text on road safety, financial literacy, waste management, drug and substance abuse, and healthy relationships.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill-blank", "reasoning"] as const);
    const hint = "Good text-setting follows natural speech: strong syllables on strong beats, weak syllables on weak beats, with pitch and rhythm shaped by the words themselves.";

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 8);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, TERM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, TOPIC_FACTS).slice(0, 10);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["road-safety", "financial-literacy", "waste-management", "drug-abuse", "healthy-relationships"] as Topic[]).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "The five named issues are road-user regulation, financial literacy, waste management, drug and substance abuse, and healthy relationships.",
        explanation: chosen.map((f) => `"${f.text}" addresses ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const shuffled = shuffle(rng, PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDERING_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STEPS.map((s) => s.id),
        hint: "Discussion and reading come first, text selection and reciting come next, then the technical composing steps, then performing and recording.",
        explanation: PROCESS_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: fb.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: fb.explanation,
      };
    }

    const q = randChoice(rng, REASONING_TEMPLATES)(rng);
    const { choices, correctIndex } = buildScenarioChoices(rng, q);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      hint: "Check whether the described choice follows the text-setting process: natural accents matched to strong/weak beats, correct phrase length, and a clear cadential point.",
      explanation: q.explanation,
    };
  },
};
