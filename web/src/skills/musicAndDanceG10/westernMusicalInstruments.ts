import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, cap, type ScenarioMC } from "./sharedG10";

// KICD Grade 10 Music and Dance 2.4 "Western Musical Instruments (Solo Performer)" names 5
// instrument families (strings, brass, woodwind, percussion, piano/organ — hard floor) and 6
// playing techniques (tonguing, bowing, picking, strumming, plucking, striking — hard floor).
// Per the design and the task brief: tonguing maps to woodwind AND brass; bowing/picking/
// strumming/plucking all map to strings; striking maps to percussion AND piano/organ — so the
// technique-to-family categorize branch below uses 3 composite buckets ("Strings",
// "Woodwind or Brass", "Percussion or Piano/Organ") rather than forcing a false 1:1 mapping onto
// all 5 families. types.ts's "string-instrument-diagram" VisualSpec (body/neck/strings/bow/
// tuning-pegs/bridge highlight) genuinely fits this sub-strand's "structure and parts" content —
// used below for a Recognition-tier visual branch. No visual exists for brass/woodwind/percussion/
// piano parts, so those families are covered through text-based branches only, not a visual gap.

type FamilyId = "strings" | "brass" | "woodwind" | "percussion" | "piano-organ";

const FAMILIES: { id: FamilyId; label: string; definition: string }[] = [
  { id: "strings", label: "Strings", definition: "Instruments that produce sound from vibrating strings, played by bowing, plucking, picking, or strumming — such as the violin, guitar and cello" },
  { id: "brass", label: "Brass", definition: "Instruments made of coiled metal tubing that produce sound from the player's lips buzzing into a mouthpiece — such as the trumpet and trombone" },
  { id: "woodwind", label: "Woodwind", definition: "Instruments that produce sound by blowing air across or into an opening or reed, with finger holes or keys to change pitch — such as the flute and clarinet" },
  { id: "percussion", label: "Percussion", definition: "Instruments that produce sound by being struck, shaken, or scraped — such as drums, cymbals and the xylophone" },
  { id: "piano-organ", label: "Piano/organ", definition: "Keyboard instruments where pressing a key causes a hammer to strike a tensioned string (piano) or air to flow through a pipe (organ)" },
];

function familyOf(id: FamilyId) {
  return FAMILIES.find((f) => f.id === id)!;
}

type TechniqueId = "tonguing" | "bowing" | "picking" | "strumming" | "plucking" | "striking";

const TECHNIQUES: { id: TechniqueId; label: string; definition: string; bucket: "strings" | "wind" | "perc-piano" }[] = [
  { id: "tonguing", label: "Tonguing", definition: "Using the tongue to start, stop, or separate notes clearly on a wind instrument — used on both woodwind and brass instruments", bucket: "wind" },
  { id: "bowing", label: "Bowing", definition: "Drawing a bow across a string to make it vibrate — the primary technique on strings-family instruments like the violin", bucket: "strings" },
  { id: "picking", label: "Picking", definition: "Plucking individual strings one at a time, often with a plectrum (pick) — common on strings-family instruments like the guitar", bucket: "strings" },
  { id: "strumming", label: "Strumming", definition: "Sweeping across several strings at once with the fingers or a plectrum to sound a chord — common on strings-family instruments like the guitar", bucket: "strings" },
  { id: "plucking", label: "Plucking", definition: "Pulling a string with the finger and releasing it to make it vibrate — used on strings-family instruments such as the guitar, harp, or double bass", bucket: "strings" },
  { id: "striking", label: "Striking", definition: "Hitting an instrument's surface directly to produce sound — used on percussion instruments and on the piano, where a hammer strikes a string", bucket: "perc-piano" },
];

const TECH_BUCKET_LABEL: Record<"strings" | "wind" | "perc-piano", string> = {
  strings: "Strings",
  wind: "Woodwind or Brass",
  "perc-piano": "Percussion or Piano/Organ",
};

// ---- Structure facts pool (12+): parts, tuning, family-classification quirks — feeds categorize. ----
const STRUCTURE_FACTS: { text: string; family: FamilyId }[] = [
  { text: "The violin is tuned by turning pegs at its scroll to adjust string tension", family: "strings" },
  { text: "A guitar's six strings are tuned individually using tuning machines (keys) at the headstock", family: "strings" },
  { text: "The hollow wooden body of a violin amplifies the vibration of its strings", family: "strings" },
  { text: "A trumpet's pitch is changed mainly by pressing valves that reroute air through extra tubing", family: "brass" },
  { text: "A trombone changes pitch by sliding a section of tubing in and out rather than using valves", family: "brass" },
  { text: "A trumpet's bell is the flared opening at the end of the tubing where sound projects outward", family: "brass" },
  { text: "A flute is a woodwind instrument even though it has no reed, because air is blown directly across an edge", family: "woodwind" },
  { text: "A clarinet produces sound using a single reed that vibrates against the mouthpiece when air is blown", family: "woodwind" },
  { text: "A saxophone is made of brass metal but is classified as a woodwind instrument because it uses a single reed", family: "woodwind" },
  { text: "A xylophone belongs to the percussion family because its bars are struck with beaters", family: "percussion" },
  { text: "Cymbals belong to the percussion family because they are struck or clashed together to produce sound", family: "percussion" },
  { text: "A drum set combines several percussion instruments — such as a snare drum, bass drum, and cymbals — played by one performer", family: "percussion" },
  { text: "A piano is tuned by adjusting the tension of its internal strings, which are struck by hammers when keys are pressed", family: "piano-organ" },
  { text: "An organ produces sound by forcing air through pipes of different lengths, controlled by its keys", family: "piano-organ" },
];

const STRUCTURE_PARTS = [
  { id: "body", label: "Body", note: "The hollow chamber that amplifies the vibration of the strings" },
  { id: "neck", label: "Neck", note: "The narrow part the player's hand slides along to change pitch" },
  { id: "strings", label: "Strings", note: "The vibrating strings that produce the instrument's pitch" },
  { id: "bow", label: "Bow", note: "The horsehair-strung stick drawn across the strings to make them vibrate" },
  { id: "tuning-pegs", label: "Tuning pegs", note: "Turned to adjust string tension and correct the pitch" },
  { id: "bridge", label: "Bridge", note: "Supports the strings above the body and transmits their vibration to it" },
] as const;

const FAMILY_MATCH_PROMPTS = [
  "Match each instrument family to its correct description.",
  "Pair each of the five instrument families with its correct meaning.",
  "Connect each family to the description that explains it.",
  "Match each family below to how instruments in it produce sound.",
  "Which description fits which family? Match them correctly.",
  "Work out how each family produces sound, then match it up.",
  "Pair each family with the statement that describes it.",
  "Link each of the five families to its correct explanation.",
  "Match each family to the description of how it works.",
  "For each family below, find the description that explains it.",
  "Match every family on the left to its meaning on the right.",
  "Sort out which description belongs to which family, by matching them.",
  "Correctly match every family to the description that fits it.",
  "Match each of the five families to how a performer produces sound in it.",
  "Line up each instrument family with what it actually means.",
  "Work out which meaning goes with which family, then match them.",
  "Match the five families to their correct descriptions below.",
  "Figure out what each family means, then match it to the right term.",
  "Pair up every family with the statement that correctly describes it.",
  "Match each instrument family to its definition.",
] as const;

const TECHNIQUE_MATCH_PROMPTS = [
  "Match each playing technique to its correct meaning.",
  "Pair each of the six playing techniques with its correct description.",
  "Connect each technique to the description that explains it.",
  "Match each technique below to what a performer actually does.",
  "Which description fits which technique? Match them correctly.",
  "Work out what each technique involves, then match it up.",
  "Pair each technique with the statement that describes it.",
  "Link each of the six techniques to its correct explanation.",
  "Match each technique to the description of how it is done.",
  "For each technique below, find the description that explains it.",
  "Match every technique on the left to its meaning on the right.",
  "Sort out which description belongs to which technique, by matching them.",
  "Correctly match every technique to the description that fits it.",
  "Match each of the six techniques to what a performer is doing when using it.",
  "Line up each playing technique with what it actually means.",
  "Work out which meaning goes with which technique, then match them.",
  "Match the six techniques to their correct descriptions below.",
  "Figure out what each technique means, then match it to the right term.",
  "Pair up every technique with the statement that correctly describes it.",
  "Match each playing technique to its definition.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each fact by the instrument family it describes.",
  "Group these facts under the correct instrument family.",
  "Decide which family each fact below belongs to, and sort it there.",
  "Sort each statement into the family it best fits.",
  "Place each fact into the correct instrument-family bucket.",
  "Read each fact and sort it under the family it matches.",
  "Work out which family each fact is about, then sort it there.",
  "Classify each fact by the instrument family it belongs to.",
  "Organize these facts into their correct family.",
  "Which family does each fact describe? Sort it accordingly.",
  "Sort each statement below into strings, brass, woodwind, percussion, or piano/organ.",
  "Drop each fact into the family it's really about.",
  "Group each statement with the family it correctly belongs to.",
  "Decide where each fact fits among the five instrument families.",
  "Sort these facts into their correct instrument-family groups.",
  "For each fact, work out its family and sort it in.",
  "Place these statements under the family each one matches.",
  "Sort each fact correctly among the five instrument families.",
  "Read each statement and file it under the right family.",
  "Assign each fact to the instrument family it best describes.",
] as const;

const ORDER_PROMPTS = [
  "Arrange the stages of preparing a Western solo instrument performance in order.",
  "Put these preparation stages into a sensible order.",
  "Sequence the stages of getting a Western solo instrument ready to perform.",
  "Arrange these actions into the order a careful performer would follow them.",
  "Order these stages the way a Grade 10 music student should carry them out.",
  "Sort these steps into the order they should happen when preparing to perform.",
  "Put these stages in the order a responsible performer would do them.",
  "Work out the sensible order for these preparation stages.",
  "Arrange these stages into a logical preparation sequence.",
  "Which order should these stages happen in? Arrange them correctly.",
  "Build a sensible preparation sequence by ordering these stages correctly.",
  "Sequence a performer's stages in the order they should be done.",
  "Order these actions the way they'd happen in a well-planned preparation process.",
  "Arrange the stages of preparing a solo instrument performance, in the right order.",
  "Put these stages into the order a careful performer would complete them.",
  "Sequence these steps to build a sensible preparation process.",
  "Work out the correct order for preparing and performing on an instrument.",
  "Arrange these stages as a performer would carry them out.",
  "Order the stages below the way a sensible preparation process would run.",
  "Sequence these preparation stages correctly, from first to last.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the sentence with the correct term.",
  "Fill in the missing term.",
  "Which term completes this sentence correctly?",
  "Work out the term that belongs in the blank.",
  "Name the term this sentence is describing.",
  "Identify the missing term below.",
  "Which word fits this description?",
  "Fill in the blank with the correct term.",
  "This sentence is describing which term?",
  "Complete this definition with the correct term.",
  "Work out and fill in the correct term.",
  "Which term matches the description given?",
  "Fill in the term being defined here.",
  "Name the correct term for this description.",
  "Which term best completes this sentence?",
  "Identify the term described in this sentence.",
  "Complete the sentence below with the right term.",
  "Fill in the missing word.",
  "Work out which term this description points to.",
  "Which term fits the blank in this sentence?",
] as const;

const STRUCTURE_PROMPTS = [
  "Identify the highlighted part of this Western string instrument.",
  "Which part of the instrument is highlighted?",
  "Name the highlighted part below.",
  "What is the highlighted part of this instrument called?",
  "Work out which part is highlighted here.",
  "Identify the part shown highlighted on this instrument.",
  "Which of these parts is highlighted in the diagram?",
  "Name the part of the instrument that is highlighted.",
  "What is this highlighted part called?",
  "Identify this instrument part.",
  "Which part of a strings-family instrument is shown highlighted?",
  "Work out and name the highlighted part.",
  "This diagram highlights which part of the instrument?",
  "Identify the labelled part on this string instrument.",
  "Name the correct term for the highlighted part shown.",
  "Which part is this diagram drawing attention to?",
  "Identify what the highlight is pointing to on this instrument.",
  "What part of the instrument does the highlight show?",
  "Work out which instrument part has been highlighted.",
  "Name the highlighted instrument part correctly.",
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A family of instruments that produce sound from vibrating strings, played by bowing, plucking, picking or strumming, is the ", after: " family.", correctAnswer: "strings", acceptedAnswers: ["strings"] },
  { before: "A family of instruments made of coiled metal tubing that produce sound from the player's buzzing lips is the ", after: " family.", correctAnswer: "brass", acceptedAnswers: ["brass"] },
  { before: "A family of instruments that produce sound by blowing air across or into an opening or reed is the ", after: " family.", correctAnswer: "woodwind", acceptedAnswers: ["woodwind"] },
  { before: "A family of instruments that produce sound by being struck, shaken, or scraped is the ", after: " family.", correctAnswer: "percussion", acceptedAnswers: ["percussion"] },
  { before: "A keyboard family where a key press causes a hammer to strike a string, or air to flow through a pipe, is the ", after: " family.", correctAnswer: "piano/organ", acceptedAnswers: ["piano/organ", "piano", "organ", "piano and organ"] },
  { before: "Using the tongue to start, stop, or separate notes clearly on a wind instrument is called ", after: ".", correctAnswer: "tonguing", acceptedAnswers: ["tonguing"] },
  { before: "Drawing a bow across a string to make it vibrate is called ", after: ".", correctAnswer: "bowing", acceptedAnswers: ["bowing"] },
  { before: "Plucking individual strings one at a time, often with a plectrum, is called ", after: ".", correctAnswer: "picking", acceptedAnswers: ["picking"] },
  { before: "Sweeping across several strings at once to sound a chord is called ", after: ".", correctAnswer: "strumming", acceptedAnswers: ["strumming"] },
  { before: "Pulling a string with a finger and releasing it to make it vibrate is called ", after: ".", correctAnswer: "plucking", acceptedAnswers: ["plucking"] },
  { before: "Hitting an instrument's surface directly to produce sound is called ", after: ".", correctAnswer: "striking", acceptedAnswers: ["striking"] },
  { before: "A saxophone is made of brass metal but is classified as a ", after: " instrument because it uses a single reed.", correctAnswer: "woodwind", acceptedAnswers: ["woodwind"] },
] as const;

// 5-stage preparation sequence, condensed directly from the design's own Suggested Learning
// Experiences bullet order for 2.4.
const PREP_STEPS = [
  { id: "observe", label: "Observe pictures or real instruments and identify various parts and their role in producing sound" },
  { id: "tune", label: "Tune, or explain the tuning of, the selected Western solo instrument" },
  { id: "schedule", label: "Prepare a rehearsal schedule for practising previously learnt techniques" },
  { id: "practice", label: "Practice playing techniques specific to the selected instrument" },
  { id: "perform", label: "Play a variety of solo pieces on the instrument during a school function" },
] as const;

// ---- Apply-tier reasoning pool: 12 situation facts x (6 openers x 4 closers = 24 frames) ≈ 280+ templates ----
interface ReasonFact { situation: string; correct: string; wrong: string[]; explanation: string }

const REASON_FACTS: ReasonFact[] = [
  {
    situation: "a violinist draws a bow steadily across a string during a slow, sustained passage",
    correct: "This is bowing — the primary strings-family technique for sustaining a note",
    wrong: [
      "This is plucking, since it is still a strings-family technique",
      "This is tonguing, since the note is sustained",
      "This is striking, since force is used to start the sound",
    ],
    explanation: "Drawing a bow across a string is specifically bowing, distinct from plucking (pulling and releasing a string) — tonguing is a wind-instrument technique and striking hits a surface directly, neither of which applies here.",
  },
  {
    situation: "a guitarist sweeps across all six strings at once with a plectrum to sound a full chord",
    correct: "This is strumming — sweeping across several strings at once to sound a chord",
    wrong: [
      "This is picking, since a single string is what picking uses",
      "This is bowing, since a tool is drawn across the strings",
      "This is tonguing, since chords need separated notes",
    ],
    explanation: "Strumming specifically means sweeping across multiple strings at once for a chord — picking is one string at a time, bowing uses a bow (not a plectrum) drawn across a string, and tonguing is a wind technique unrelated to strings.",
  },
  {
    situation: "a guitarist plays a melody by plucking one string at a time with a plectrum",
    correct: "This is picking — plucking individual strings one at a time, often with a plectrum",
    wrong: [
      "This is strumming, since several strings are being played",
      "This is bowing, since the technique involves a tool",
      "This is striking, since the plectrum hits the string",
    ],
    explanation: "Picking specifically means one string at a time, unlike strumming (several strings at once) — bowing requires an actual bow, and this is not classified as striking even though the plectrum makes brief contact.",
  },
  {
    situation: "a harpist pulls a single string with a finger and releases it to let it vibrate freely",
    correct: "This is plucking — pulling a string with the finger and releasing it to make it vibrate",
    wrong: [
      "This is bowing, since a harp is a strings-family instrument",
      "This is tonguing, since it produces a single clear note",
      "This is striking, since the finger makes contact with the string",
    ],
    explanation: "Plucking is defined by pulling and releasing a string with the finger — bowing requires an actual bow, which harps do not use, and tonguing only applies to wind instruments.",
  },
  {
    situation: "a trumpeter uses quick tongue movements to clearly separate a fast run of repeated notes",
    correct: "This is tonguing — used on both woodwind and brass instruments to start, stop, or separate notes",
    wrong: [
      "This is bowing, since the notes are separated clearly",
      "This is plucking, since individual notes are being articulated",
      "This is striking, since force is used to start each note",
    ],
    explanation: "Tonguing is the wind-instrument technique for articulating and separating notes with the tongue — bowing and plucking are strings-family techniques, and striking involves hitting a surface, which a trumpet has none of.",
  },
  {
    situation: "a percussionist strikes a snare drum with sticks during a march",
    correct: "This is striking — hitting an instrument's surface directly to produce sound",
    wrong: [
      "This is tonguing, since the rhythm is fast and repeated",
      "This is bowing, since a stick is used like a bow",
      "This is plucking, since the drumstick makes contact and lifts away",
    ],
    explanation: "Striking is specifically hitting a surface directly — tonguing only applies to wind instruments, bowing requires drawing across a string (not hitting), and plucking is a strings-family technique unrelated to a drum's skin.",
  },
  {
    situation: "a saxophone player explains that although their instrument is made of brass metal, it produces sound using a single reed",
    correct: "The saxophone is classified as a woodwind instrument, because family classification is based on how sound is produced (a reed), not the metal it is made from",
    wrong: [
      "The saxophone is classified as a brass instrument, since it is made of brass metal",
      "The saxophone is classified as a percussion instrument, since it is played by pressing keys",
      "The saxophone is classified as a strings instrument, since it has a body that resonates",
    ],
    explanation: "Instrument family is determined by how sound is actually produced — a vibrating reed means woodwind — not by the material an instrument is built from, which is why a metal saxophone is still a woodwind, not a brass instrument.",
  },
  {
    situation: "a trombonist changes pitch mid-phrase by sliding a section of tubing in and out, without pressing any valves",
    correct: "The trombone is a brass instrument — pitch is changed here by sliding tubing, one of the two main ways brass instruments alter their length",
    wrong: [
      "The trombone is a woodwind instrument, since it uses finger control to change pitch",
      "The trombone is a percussion instrument, since sliding involves physical movement",
      "The trombone is a strings instrument, since it has a long tube-like body",
    ],
    explanation: "Sliding tubing to change pitch is a brass-family mechanism (the trombone's slide, as opposed to a trumpet's valves) — it is not a woodwind, percussion, or strings technique.",
  },
  {
    situation: "a pianist presses a key, causing a felt-covered hammer inside the instrument to strike a tensioned string",
    correct: "The piano belongs to the piano/organ (keyboard) family, even though a string is struck inside it",
    wrong: [
      "The piano belongs to the strings family, since a string is what actually vibrates",
      "The piano belongs to the percussion family, since a hammer strikes something",
      "The piano belongs to the woodwind family, since keys are pressed to play it",
    ],
    explanation: "Even though a piano's hammer strikes a string, it is classified as a keyboard (piano/organ) instrument because the player interacts with it through keys, not by bowing, plucking, or striking the string directly.",
  },
  {
    situation: "an organist presses a key that forces air through a pipe of a particular length, producing a sustained tone",
    correct: "The organ belongs to the piano/organ (keyboard) family, even though air moving through a pipe is what produces the sound",
    wrong: [
      "The organ belongs to the woodwind family, since air is blown through it",
      "The organ belongs to the brass family, since it produces a sustained tone",
      "The organ belongs to the percussion family, since keys are struck to play it",
    ],
    explanation: "Although air through a pipe is the actual sound-producing mechanism (similar in principle to a woodwind), the organ is classified as a keyboard instrument because it is played and controlled through keys, the same as a piano.",
  },
  {
    situation: "a violin student is shown the hollow wooden chamber underneath the strings that amplifies their vibration, and asked to name that part",
    correct: "This is the body of the violin",
    wrong: [
      "This is the neck of the violin",
      "This is the bridge of the violin",
      "This is the bow of the violin",
    ],
    explanation: "The body is the hollow resonating chamber that amplifies string vibration — the neck is the narrow part the hand slides along, the bridge supports the strings above the body, and the bow is a separate tool drawn across the strings.",
  },
  {
    situation: "a cellist wants to correct a string that sounds slightly flat, and tries changing where their finger presses on the fingerboard instead of adjusting the tuning pegs",
    correct: "This will not correctly tune the instrument — tuning requires adjusting string tension via the pegs or fine tuners, not finger position on the fingerboard",
    wrong: [
      "Changing finger position on the fingerboard does correctly tune a string instrument",
      "Tuning only matters for wind instruments, not strings",
      "The cellist should blow air across the strings to tune them",
    ],
    explanation: "Finger position on the fingerboard changes which note is sounded during playing, but it does not correct a string's underlying tuning — that requires adjusting the string's actual tension at the pegs (or fine tuners), which is what tuning means.",
  },
];

const OPENERS: ((rng: RNG, fact: ReasonFact) => string)[] = [
  (rng, fact) => `${name(rng)} is practising a Western solo instrument at a school in ${place(rng)}, where ${fact.situation}`,
  (rng, fact) => `During a music lesson at a school in ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)}, a Grade 10 music student, is rehearsing, and ${fact.situation}`,
  (rng, fact) => `At a school function in ${place(rng)}, ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `${name(rng)}'s music teacher points out that ${fact.situation}`,
];

const CLOSERS = [
  "What does this describe?",
  "Which conclusion best fits this situation?",
  "What is being demonstrated here?",
  "What should you conclude from this?",
] as const;

/** Compose openers x closers with a fact-specific explanation (not sharedG10.combineFrames's
 * default of reusing the bare correct answer), so wrong answers get their misconception named. */
function makeFrames(): ((rng: RNG, fact: ReasonFact) => ScenarioMC)[] {
  const frames: ((rng: RNG, fact: ReasonFact) => ScenarioMC)[] = [];
  for (const opener of OPENERS) {
    for (const closer of CLOSERS) {
      frames.push((rng, fact) => ({
        prompt: `${opener(rng, fact)}. ${closer}`,
        correct: fact.correct,
        wrong: fact.wrong,
        explanation: fact.explanation,
      }));
    }
  }
  return frames;
}

const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, makeFrames());

export const westernMusicalInstruments: Skill = {
  id: "g10-mad-western-musical-instruments",
  code: "2.4",
  subjectId: "music-and-dance",
  strandId: "g10-mad-performing",
  grade: 10,
  title: "Western Musical Instruments (Solo Performer)",
  description: "The five families of Western musical instruments — strings, brass, woodwind, percussion, and piano/organ — the six playing techniques (tonguing, bowing, picking, strumming, plucking, striking), tuning, and instrument structure/parts.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["family-match", "technique-match", "categorize-facts", "structure-visual", "instrument-order", "reasoning", "fill-blank"] as const
    );
    const hint = "Strings are bowed/picked/strummed/plucked; woodwind and brass use tonguing; percussion and piano/organ use striking.";

    if (branch === "family-match") {
      const tokens = shuffle(rng, FAMILIES.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FAMILIES.map((f) => ({ id: f.id, label: f.definition })));
      const correctMap: Record<string, string> = {};
      for (const f of FAMILIES) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, FAMILY_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: FAMILIES.map((f) => `${f.label}: ${f.definition}.`).join(" "),
      };
    }

    if (branch === "technique-match") {
      const tokens = shuffle(rng, TECHNIQUES.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, TECHNIQUES.map((t) => ({ id: t.id, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of TECHNIQUES) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, TECHNIQUE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: TECHNIQUES.map((t) => `${t.label}: ${t.definition}.`).join(" "),
      };
    }

    if (branch === "categorize-facts") {
      const chosen = shuffle(rng, STRUCTURE_FACTS).slice(0, 9);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.family));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: FAMILIES.map((f) => ({ id: f.id, label: f.label })),
        correctBucket,
        hint,
        explanation: chosen.map((f) => `"${f.text}" is about the ${familyOf(f.family).label} family.`).join(" "),
      };
    }

    if (branch === "structure-visual") {
      const target = randChoice(rng, STRUCTURE_PARTS);
      const others = STRUCTURE_PARTS.filter((p) => p.id !== target.id);
      const choices = shuffle(rng, [target.label, ...shuffle(rng, others).slice(0, 3).map((p) => p.label)]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, STRUCTURE_PROMPTS),
        visual: { type: "string-instrument-diagram", highlight: target.id },
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint: "The highlighted part is drawn brighter than the rest of the instrument.",
        explanation: `This is the ${target.label.toLowerCase()} — ${target.note.toLowerCase()}.`,
      };
    }

    if (branch === "instrument-order") {
      const shuffled = shuffle(rng, PREP_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PREP_STEPS.map((s) => s.id),
        hint: "Start by observing parts and tuning, then schedule rehearsal, practise techniques, and finally perform.",
        explanation: PREP_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.acceptedAnswers],
      inputMode: "text",
      hint,
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`.replace(/\s+/g, " ").trim(),
    };
  },
};
