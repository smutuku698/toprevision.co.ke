import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./sharedG10";

// KICD Grade 10 Music and Dance, Strand 3.0 Critical Appreciation, sub-strand 3.1 "Kenyan Folk
// Songs" (curriculum-reference/grade-10/music-and-dance.json, strands[2].subStrands[0]).
// IMPORTANT: Strand 2.0 also has a sub-strand literally named "Kenyan Folk Songs" (2.1) — that one
// is about SELECTING and PERFORMING a folk song (built by a different agent). This 3.1 skill is
// the Critical Appreciation angle: examining/analysing/evaluating a folk song *performance* from
// the outside — media, style, elements of music, expressive devices — never "how do you perform
// it." The sub-strand's own outcome verbs (examine, analyse, evaluate) run noticeably higher than
// a typical Remember/Understand sub-strand, so this file leans Analyze-tier for its scenario
// branches rather than bare recall.
// No dedicated VisualSpec exists for folk-song performance media/elements/expressive devices (the
// closest Grade 6 Creative Arts visuals — music-note, sol-fa-ladder, string-instrument-diagram —
// are staff-notation/instrument-part diagrams, not a fit for "which element of music is changing
// in this described performance"), so no branch uses a visual. This is a deliberate, documented
// skip per the precedent in agricultureG6/rearingSmallDomesticAnimals.ts, not an oversight.

interface ScenarioFact {
  situation: string;
  correct: string;
  wrong: string[];
}

// ---- Elements of music: the 9 named in the design (hard floor, all 9). ----
const ELEMENTS = [
  { id: "structure", label: "Structure", definition: "How the song's sections are organised and arranged — for example a verse/refrain or call-and-response form" },
  { id: "rhythm", label: "Rhythm", definition: "The pattern of long, short, strong and weak beats that gives the song its pulse" },
  { id: "melody", label: "Melody/tune", definition: "The sequence of pitches sung one after another that forms the recognisable tune" },
  { id: "pitch", label: "Pitch", definition: "How high or low an individual note sounds" },
  { id: "tempo", label: "Tempo", definition: "How fast or slow the music moves" },
  { id: "tone-colour", label: "Tone colour (timbre)", definition: "The distinctive quality of a voice or instrument's sound that lets you tell it apart from another" },
  { id: "texture", label: "Texture", definition: "How many musical layers or parts are sounding together, from a single thin line to many thick layers" },
  { id: "harmony", label: "Harmony", definition: "How different pitches or parts combine together at the same time to support the melody" },
  { id: "volume", label: "Volume/intensity", definition: "How loud or soft the music is at a given moment" },
] as const;

const ELEMENT_MATCH_PROMPTS = [
  "Match each element of music to its definition.",
  "Pair each element of music with the description that explains it.",
  "Connect each element to its correct meaning.",
  "Match each musical element to the explanation that fits it.",
  "Link each element of music to the description that describes it.",
  "Match each element below to the statement that defines it.",
  "Work out which definition belongs to which element, then match them up.",
  "Pair each element of music with its correct meaning.",
  "For each element below, find the definition that explains it.",
  "Match each term to the explanation of what it involves.",
  "Which definition goes with which element? Match them correctly.",
  "Line up each element of music with what it actually means.",
  "Connect each musical term to its correct definition.",
  "Match these elements of music to their definitions below.",
  "Figure out what each element means, then match it to its definition.",
  "Pair up every element with the statement that correctly describes it.",
  "Match each item on the left to the element it describes on the right.",
  "Sort out which definition belongs to which element, by matching them.",
  "Correctly match every element of music to the definition that fits it.",
  "Match each element of music to what a listener would notice about it.",
];

// ---- Performance styles: solo, call-response, choral (hard floor, all 3). 12 illustrative facts
// (4 per style) feeding a categorize branch that samples a strictly-smaller subset per draw. ----
type StyleId = "solo" | "call-response" | "choral";
const STYLES: { id: StyleId; label: string }[] = [
  { id: "solo", label: "Solo" },
  { id: "call-response", label: "Call-response" },
  { id: "choral", label: "Choral" },
];

const STYLE_FACTS: { text: string; style: StyleId }[] = [
  { text: "One voice carries the entire song from beginning to end with no other singers joining in", style: "solo" },
  { text: "A single performer sings both the introduction and every verse of the folk song alone", style: "solo" },
  { text: "There is only one vocal line throughout; no group response or second part is heard", style: "solo" },
  { text: "The soloist alone controls the pacing, ornamentation and phrasing of the whole song", style: "solo" },
  { text: "A leader sings a short phrase, and a group of singers answers with a fixed repeating phrase right after", style: "call-response" },
  { text: "The soloist's line changes with each repetition, but the group's short answering phrase always stays the same", style: "call-response" },
  { text: "A leader initiates each new line, and the chorus of participants immediately echoes or answers it", style: "call-response" },
  { text: "The performance alternates between one voice singing a call and many voices singing the same short response", style: "call-response" },
  { text: "A whole group of singers performs the same melody and words together throughout, with no alternating solo lines", style: "choral" },
  { text: "Multiple voices sing the verses together as a unified group from start to finish", style: "choral" },
  { text: "There's no soloist leading calls; the entire group sings every line in unison together", style: "choral" },
  { text: "All performers sing the same words and tune simultaneously as one combined group voice", style: "choral" },
];

const STYLE_PROMPTS = [
  "Sort each performance description by the folk song style it illustrates.",
  "Classify each statement below by performance style: solo, call-response, or choral.",
  "Decide which performance style each description fits, and sort it there.",
  "Sort each fact into the correct folk song performance style.",
  "Place each description into the bucket for the style it illustrates.",
  "Read each statement and sort it under the matching performance style.",
  "Work out which style each description is about, then sort it there.",
  "Group each performance description by the style it belongs to.",
  "Organize these descriptions into the correct performance style.",
  "Which style does each description illustrate? Sort it accordingly.",
  "Sort each statement below into solo, call-response, or choral.",
  "Drop each description into the performance style it's really describing.",
  "Group each statement with the style it correctly illustrates.",
  "Decide where each description fits among the three performance styles.",
  "Sort these descriptions into their correct performance-style groups.",
  "For each description, work out the style it illustrates and sort it in.",
  "Place these statements under the performance style each one matches.",
  "Sort each description correctly among the three performance styles.",
  "Read each statement and file it under the right performance style.",
  "Assign each description to the performance style it best illustrates.",
];

// ---- Performance media: vocal, vocal-and-instrumental (hard floor, both). 10 fill-blank facts. ----
const MEDIA_FACTS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "A recording captures only the human voices of a group singing a folk song, with no drum, lyre or other instrument heard at any point — this performance medium is ", after: ".", correctAnswer: "vocal", acceptedAnswers: ["vocal", "vocal only", "vocal alone"] },
  { before: "During a wedding celebration, the guests sing every verse of a folk song a cappella, with no instrumental accompaniment at any point — the performance medium here is ", after: ".", correctAnswer: "vocal", acceptedAnswers: ["vocal", "vocal only", "vocal alone"] },
  { before: "A soloist performs an unaccompanied lullaby, relying only on the voice with no instruments joining in — this is an example of the ", after: " performance medium.", correctAnswer: "vocal", acceptedAnswers: ["vocal", "vocal only", "vocal alone"] },
  { before: "Throughout an entire recorded performance, only singing is heard — never a drum beat, a plucked string, or any other instrument — making the medium ", after: ".", correctAnswer: "vocal", acceptedAnswers: ["vocal", "vocal only", "vocal alone"] },
  { before: "A group performs a folk song relying solely on their voices for melody, rhythm and harmony, with no instrumental support of any kind — the medium used is ", after: ".", correctAnswer: "vocal", acceptedAnswers: ["vocal", "vocal only", "vocal alone"] },
  { before: "A folk song performance features singers accompanied throughout by a drum keeping the beat and a lyre outlining the melody — this performance medium is ", after: ".", correctAnswer: "vocal and instrumental", acceptedAnswers: ["vocal and instrumental", "vocal-and-instrumental"] },
  { before: "As the chorus sings, a nyatiti player plucks an accompanying line underneath the voices — this combination is an example of the ", after: " performance medium.", correctAnswer: "vocal and instrumental", acceptedAnswers: ["vocal and instrumental", "vocal-and-instrumental"] },
  { before: "During a harvest festival, singers are joined throughout by drummers and a flute player — the medium here is best described as ", after: ".", correctAnswer: "vocal and instrumental", acceptedAnswers: ["vocal and instrumental", "vocal-and-instrumental"] },
  { before: "A soloist sings while a group of instrumentalists provide rhythmic and melodic accompaniment on drums and string instruments — this is the ", after: " performance medium.", correctAnswer: "vocal and instrumental", acceptedAnswers: ["vocal and instrumental", "vocal-and-instrumental"] },
  { before: "A recorded folk song layers singing voices together with a shaker, a drum and a fiddle playing throughout — the medium is ", after: ".", correctAnswer: "vocal and instrumental", acceptedAnswers: ["vocal and instrumental", "vocal-and-instrumental"] },
];

const MEDIA_PROMPTS = [
  "Which performance medium is being described?",
  "Identify the performance medium in this scenario.",
  "Which performance medium fits this description?",
  "Work out the performance medium being used here.",
  "Fill in the performance medium this description matches.",
  "Name the performance medium at work in this scenario.",
  "This description matches which performance medium?",
  "Complete the sentence with the correct performance medium.",
  "Which of the two performance media does this describe?",
  "Determine the performance medium used in this performance.",
  "What performance medium is this an example of?",
  "Read the scenario and name the performance medium.",
  "This is an example of which performance medium?",
  "Which performance medium — vocal, or vocal and instrumental — fits here?",
  "Fill in the blank with the matching performance medium.",
  "Work out and fill in the correct performance medium.",
  "Which performance medium does this folk song example use?",
  "Identify whether this is vocal, or vocal and instrumental.",
  "Name the correct performance medium for this description.",
  "Which performance medium best matches what's described?",
];

// ---- Elements of music, Analyze-tier: 9 curated scenarios (one per element) x 24 frames
// (6 openers x 4 closers) = 216 templates. Each element's wrong answers are drawn only from other
// elements it is commonly confused with (pitch vs tempo vs volume; texture vs harmony vs tone
// colour; rhythm vs tempo), never an unrelated draw. ----
const ELEMENT_FACTS: ScenarioFact[] = [
  {
    situation: "a folk song performance clearly divides into a soloist's opening verse, a full-group refrain, then that same verse-refrain pattern repeating three more times",
    correct: "Structure — how the song's sections are organised and arranged",
    wrong: ["Texture — how many layers are sounding together", "Rhythm — the pattern of strong and weak beats", "Harmony — how different pitches combine together"],
  },
  {
    situation: "as the drummers play, the audience claps along to a repeating pattern of strong and weak beats that stays exactly the same even as the melody and loudness change",
    correct: "Rhythm — the pattern of long, short, strong and weak beats that gives the song its pulse",
    wrong: ["Tempo — how fast or slow the music moves", "Structure — how the song's sections are arranged", "Volume/intensity — how loud or soft the music is"],
  },
  {
    situation: "listeners can recognise the exact same rising-and-falling tune of a particular folk song, no matter which soloist performs it or how they ornament individual notes",
    correct: "Melody/tune — the sequence of pitches forming the recognisable tune",
    wrong: ["Pitch — how high or low a single note sounds", "Harmony — how different parts combine at the same time", "Tone colour — the distinctive quality of a voice's sound"],
  },
  {
    situation: "a soloist's voice rises noticeably higher just before the chorus enters, while the speed, loudness and vocal quality of the singing all stay exactly the same",
    correct: "Pitch — how high or low a note sounds",
    wrong: ["Tempo — how fast or slow the music moves", "Volume/intensity — how loud or soft the music is", "Tone colour — the distinctive quality of the voice's sound"],
  },
  {
    situation: "the chorus of a folk song is performed noticeably faster during the celebratory closing section than it was during the calm opening verse",
    correct: "Tempo — how fast or slow the music moves",
    wrong: ["Rhythm — the pattern of strong and weak beats", "Volume/intensity — how loud or soft the music is", "Pitch — how high or low the notes sound"],
  },
  {
    situation: "a listener can tell whether it is the elder soloist or the younger group leader singing a call, purely from the distinctive character of each voice, even when both sing the exact same pitch, rhythm and words",
    correct: "Tone colour (timbre) — the distinctive quality of a voice or instrument's sound",
    wrong: ["Pitch — how high or low the note sounds", "Volume/intensity — how loud or soft the singing is", "Texture — how many parts are sounding together"],
  },
  {
    situation: "a folk song opens with a single voice alone, then more singers and instruments join in one by one until many parts are all sounding together at once",
    correct: "Texture — how many musical layers or parts are sounding together",
    wrong: ["Harmony — how pitches combine to support the melody", "Structure — how the song's sections are arranged", "Tone colour — the distinctive quality of a sound"],
  },
  {
    situation: "as the chorus sings the main tune, a second group of singers adds a lower line of notes underneath that blends pleasingly with it throughout",
    correct: "Harmony — how different pitches or parts combine together to support the melody",
    wrong: ["Texture — how many layers are sounding together", "Melody — the sequence of pitches forming the tune", "Structure — how the song's sections are arranged"],
  },
  {
    situation: "the group's singing swells from a hushed near-whisper to a loud, full-voiced climax as the performance approaches the song's most urgent message",
    correct: "Volume/intensity — how loud or soft the music is at a given moment",
    wrong: ["Tempo — how fast or slow the music moves", "Tone colour — the distinctive quality of the voices", "Pitch — how high or low the notes sound"],
  },
];

const ELEMENT_OPENERS: ((rng: RNG, fact: ScenarioFact) => string)[] = [
  (rng, fact) => `A group performing a Kenyan folk song near ${place(rng)} is being critically analysed, and ${fact.situation}`,
  (rng, fact) => `${name(rng)} is listening closely to a recorded Kenyan folk song and notices that ${fact.situation}`,
  (rng, fact) => `During a folk song performance in ${place(rng)}, ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `A music critic reviewing a folk song performance near ${place(rng)} observes that ${fact.situation}`,
  (rng, fact) => `${name(rng)}, examining a Kenyan folk song performance, notices that ${fact.situation}`,
];

const ELEMENT_CLOSERS = [
  "Which element of music is most clearly changing here?",
  "Which element of music does this best illustrate?",
  "Which element of music is being described?",
  "Which element of music should a critic point to here?",
];

const ELEMENT_FRAMES = combineFrames(ELEMENT_OPENERS, ELEMENT_CLOSERS);
const ELEMENT_TEMPLATES = expandScenarios(ELEMENT_FACTS, ELEMENT_FRAMES);

// ---- Expressive elements: vocal ornaments, gestures (hard floor, both). 10 curated scenarios
// (5 ornament, 5 gesture) x 20 frames (5 openers x 4 closers) = 200 templates. Analyze/Evaluate
// tier — the learner interprets what the device is doing, not just recall its name. ----
const EXPRESSIVE_FACTS: ScenarioFact[] = [
  {
    situation: "during a soloist's line, they add a quick decorative slide between two notes right before the group's response begins",
    correct: "This is a vocal ornament — decorative embellishment added to enrich the line and signal the coming transition",
    wrong: ["This is a change in tempo, since the soloist appears to sing faster", "This is a change in texture, since more voices are about to join", "This is a change in harmony, since a new supporting part is being added"],
  },
  {
    situation: "a soloist adds a rapid, rippling flourish on a single held syllable right at the climax of the song's message",
    correct: "This is a vocal ornament — a decorative flourish used to emphasise an important moment in the message",
    wrong: ["This is an increase in volume/intensity, since the singer is simply projecting more", "This is a change in pitch register, since the note is simply higher", "This is a change in the song's structure, marking a new section"],
  },
  {
    situation: "a performer's voice wavers slightly and intensifies on the very last held note of the song",
    correct: "This is a vocal ornament — a sustained, wavering embellishment used to intensify the emotion at the song's climax",
    wrong: ["This is simply the singer's tempo slowing down", "This is a change in the performance medium, from vocal to vocal and instrumental", "This is a shift in the song's harmony"],
  },
  {
    situation: "a soloist consistently adds a short grace note just before each main sung note, in a way that marks their own individual style",
    correct: "This is a vocal ornament — a personal embellishment that gives the singer's performance its individual expressive stamp",
    wrong: ["This is a difference in the song's rhythm pattern", "This is a difference in performance style, from solo to call-response", "This is a difference in the song's structure"],
  },
  {
    situation: "a soloist slides their pitch smoothly downward at the very end of a phrase, marking the close of each verse",
    correct: "This is a vocal ornament — a closing slide used to mark the end of a phrase expressively",
    wrong: ["This is simply a drop in volume/intensity", "This is a change in the performance medium", "This is a change in tone colour"],
  },
  {
    situation: "while singing, a performer sweeps an open hand outward toward the audience at the exact moment they deliver the folk song's central message",
    correct: "This is a gesture — a physical movement used to visually reinforce and draw attention to the meaning of the words",
    wrong: ["This is a vocal ornament, since it changes how a note sounds", "This is a change in the song's tempo", "This is a change in texture, since it looks like more is happening"],
  },
  {
    situation: "a soloist mimics the motion of digging or sowing with their hands while singing about farming work",
    correct: "This is a gesture — a physical movement that visually depicts the song's subject matter",
    wrong: ["This is a vocal ornament decorating the melody", "This is a shift in the song's harmony", "This is a change in the song's structure"],
  },
  {
    situation: "while singing a line honouring the community's elders, a performer turns and gestures directly toward where the elders are seated",
    correct: "This is a gesture — used to physically direct the message of the song toward its intended audience",
    wrong: ["This is a change in performance style, from choral to solo", "This is a vocal ornament affecting pitch", "This is a change in the song's tempo"],
  },
  {
    situation: "a performer sways their body rhythmically in time with the drum pattern while singing, mirroring the beat visually",
    correct: "This is a gesture — a physical movement that visually reinforces the rhythm for the audience and other performers",
    wrong: ["This is a vocal ornament, since it decorates a note", "This is a change in the song's harmony", "This is a change in the performance medium"],
  },
  {
    situation: "at a protest-themed folk song's key line, a performer raises a clenched fist while singing",
    correct: "This is a gesture — a physical movement used to visually emphasise the song's call-to-action message",
    wrong: ["This is a vocal ornament decorating the final note", "This is a change in tone colour", "This is a change in the song's structure"],
  },
];

const EXPRESSIVE_OPENERS: ((rng: RNG, fact: ScenarioFact) => string)[] = [
  (rng, fact) => `While critically appreciating a Kenyan folk song performance near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)} is analysing a folk song performance and observes that ${fact.situation}`,
  (rng, fact) => `In a folk song performance in ${place(rng)}, ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `A critic reviewing a Kenyan folk song near ${place(rng)} notes that ${fact.situation}`,
];

const EXPRESSIVE_CLOSERS = [
  "How should this expressive device be interpreted?",
  "What is this expressive device actually doing here?",
  "Which interpretation of this expressive device is correct?",
  "What does this expressive device communicate here?",
];

const EXPRESSIVE_FRAMES = combineFrames(EXPRESSIVE_OPENERS, EXPRESSIVE_CLOSERS);
const EXPRESSIVE_TEMPLATES = expandScenarios(EXPRESSIVE_FACTS, EXPRESSIVE_FRAMES);

// ---- Call-response structure ordering — grounded directly in the definitional structure of the
// call-response performance style itself (not an invented curriculum fact). ----
const CALL_RESPONSE_STEPS = [
  { id: "call1", label: "The soloist opens with the first call phrase, setting the theme of the song" },
  { id: "response1", label: "The group answers immediately with the fixed response phrase" },
  { id: "call2", label: "The soloist sings a new or varied call line, continuing the story or message" },
  { id: "response2", label: "The group repeats the same response phrase again" },
  { id: "close", label: "The soloist and group bring the song to a close, typically ending on the group's response" },
];

const CALL_RESPONSE_PROMPTS = [
  "Arrange these events of a call-and-response folk song performance in the order they happen.",
  "Put these moments of a call-response performance into the correct order.",
  "Sequence the stages of a typical call-and-response folk song correctly.",
  "Arrange these performance moments into the order a listener would hear them.",
  "Order these events the way a call-and-response performance actually unfolds.",
  "Sort these moments into the order they occur during the performance.",
  "Put these performance events in the order they happen in a call-response song.",
  "Work out the correct order of these call-and-response performance moments.",
  "Arrange these events into a logical call-response performance sequence.",
  "Which order do these performance moments happen in? Arrange them correctly.",
  "Build the correct performance sequence by ordering these events.",
  "Sequence a call-and-response performance's key moments in the order they occur.",
  "Order these events the way they'd unfold in a genuine performance.",
  "Arrange the stages of a call-and-response performance, in the right order.",
  "Put these performance moments into the order a listener would experience them.",
  "Sequence these events to build the correct call-response performance order.",
  "Work out the correct order for these call-and-response performance events.",
  "Arrange these moments as they'd occur during the actual performance.",
  "Order the events below the way a real call-response performance would run.",
  "Sequence these performance moments correctly, from first to last.",
];

export const kenyanFolkSongsAppreciation: Skill = {
  id: "g10-mad-kenyan-folk-songs-appreciation",
  code: "3.1",
  subjectId: "music-and-dance",
  strandId: "g10-mad-appreciation",
  grade: 10,
  title: "Kenyan Folk Songs (Critical Appreciation)",
  description: "Examining, analysing and evaluating Kenyan folk song performances — performance media, performance styles, the elements of music, expressive devices, and the message communicated.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["element-match", "style-categorize", "media-fillblank", "element-scenario", "expressive-interpret", "call-response-order"] as const
    );
    const generalHint = "Focus on what you can actually hear or observe changing in the performance, not on the topic in general.";

    if (branch === "element-match") {
      const chosen = shuffle(rng, ELEMENTS).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((e) => ({ id: e.id, label: e.label })));
      const targets = shuffle(rng, chosen.map((e) => ({ id: e.id, label: e.definition })));
      const correctMap: Record<string, string> = {};
      for (const e of chosen) correctMap[e.id] = e.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, ELEMENT_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Elements of music describe what you can hear happening in a performance — pitch, tempo, texture and the rest each describe a different thing.",
        explanation: chosen.map((e) => `${e.label}: ${e.definition}.`).join(" "),
      };
    }

    if (branch === "style-categorize") {
      const chosen = shuffle(rng, STYLE_FACTS).slice(0, 8);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.style));
      return {
        kind: "categorize",
        prompt: randChoice(rng, STYLE_PROMPTS),
        items,
        buckets: STYLES.map((s) => ({ id: s.id, label: s.label })),
        correctBucket,
        hint: "Solo has one voice throughout; call-response alternates a leader's call with a fixed group answer; choral has the whole group singing together.",
        explanation: chosen.map((c) => `"${c.text}" describes the ${STYLES.find((s) => s.id === c.style)!.label.toLowerCase()} style.`).join(" "),
      };
    }

    if (branch === "media-fillblank") {
      const fb = randChoice(rng, MEDIA_FACTS);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, MEDIA_PROMPTS),
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: fb.acceptedAnswers,
        inputMode: "text",
        hint: "Performance media is about what is producing the sound: voices alone, or voices together with instruments.",
        explanation: `This is an example of the "${fb.correctAnswer}" performance medium.`,
      };
    }

    if (branch === "element-scenario") {
      const q = randChoice(rng, ELEMENT_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: generalHint,
        explanation: q.explanation,
      };
    }

    if (branch === "expressive-interpret") {
      const q = randChoice(rng, EXPRESSIVE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Expressive devices are things a performer adds on top of the notes themselves — a vocal ornament decorates the sound; a gesture is a physical movement.",
        explanation: q.explanation,
      };
    }

    const shuffled = shuffle(rng, CALL_RESPONSE_STEPS);
    return {
      kind: "ordering",
      prompt: randChoice(rng, CALL_RESPONSE_PROMPTS),
      instruction: "Click them in order.",
      items: shuffled.map((s) => ({ id: s.id, label: s.label })),
      correctOrder: CALL_RESPONSE_STEPS.map((s) => s.id),
      hint: "In call-response style, the soloist always calls first and the group always responds — that pattern repeats through the song, then it closes.",
      explanation: CALL_RESPONSE_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
