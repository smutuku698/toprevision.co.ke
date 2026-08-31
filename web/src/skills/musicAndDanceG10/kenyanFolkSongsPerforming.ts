import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames } from "./sharedG10";

// KICD Grade 10 Music and Dance, sub-strand 2.1 "Kenyan Folk Songs" — the performance-practice
// angle (selecting, choosing, and performing folk songs), NOT the critical-appreciation angle,
// which is a separate, differently-scoped sub-strand (3.1, same name, analyzing performance media/
// elements of music/expressive devices — built elsewhere). Content: characteristics of Kenyan folk
// songs, solo vs group format, choice factors (gender, age, occasion, costumes/props/artefacts),
// and all 8 named performance aspects (singing tone and diction, idiom, synchrony, transitions,
// instrumentation, projection, expressiveness, etiquette) — a hard content floor per the JSON.
//
// One branch uses the existing `string-instrument-diagram` VisualSpec for the "Instrumentation"
// performance aspect — a genuine fit, since instrumentation is explicitly named as one of the 8
// performance aspects and Kenyan folk song accompaniment on instruments (fiddle/lyre/harp — 2.3's
// own content) is real, curriculum-sanctioned material for this sub-strand's performing angle.

interface PerformanceAspect {
  id: string;
  label: string;
  def: string;
}

const ASPECTS: PerformanceAspect[] = [
  { id: "singing", label: "Singing (tone and diction)", def: "Producing a clear, appropriate vocal tone and pronouncing the words distinctly so the audience understands the text" },
  { id: "idiom", label: "Idiom", def: "Performing in the stylistic character and conventions specific to the folk song's community of origin" },
  { id: "synchrony", label: "Synchrony", def: "Keeping voices, movement, and any instruments precisely together in time with each other" },
  { id: "transitions", label: "Transitions", def: "Moving smoothly between sections, verses, or changes within the performance without disrupting its flow" },
  { id: "instrumentation", label: "Instrumentation", def: "Selecting and playing the appropriate accompanying instruments for the folk song" },
  { id: "projection", label: "Projection", def: "Producing enough vocal or instrumental volume and clarity to reach the whole audience" },
  { id: "expressiveness", label: "Expressiveness", def: "Conveying the song's mood, emotion, and meaning through dynamics, facial expression, and delivery" },
  { id: "etiquette", label: "Etiquette", def: "Following the accepted standards of respectful conduct before, during, and after a performance" },
];

type ChoiceCategory = "gender" | "age" | "occasion" | "costumes-props-artefacts";

const CHOICE_LABEL: Record<ChoiceCategory, string> = {
  gender: "Gender",
  age: "Age",
  occasion: "Occasion",
  "costumes-props-artefacts": "Costumes, props and artefacts",
};

interface ChoiceFact {
  text: string;
  category: ChoiceCategory;
}

const CHOICE_FACTS: ChoiceFact[] = [
  { text: "Some Kenyan folk songs are traditionally performed only by women, such as certain lullabies or work songs", category: "gender" },
  { text: "Some Kenyan folk songs are traditionally performed only by men, such as certain warrior or hunting songs", category: "gender" },
  { text: "The gender associated with a folk song can shape its themes, vocal range, and typical performers", category: "gender" },
  { text: "Some folk songs are specifically composed for or performed by children, such as play songs and counting rhymes", category: "age" },
  { text: "Some folk songs are performed by elders, carrying deeper cultural or ceremonial significance", category: "age" },
  { text: "Age can determine who is considered appropriate to lead or perform a particular folk song", category: "age" },
  { text: "Certain folk songs are performed only during specific ceremonies, such as weddings, initiation, or harvest celebrations", category: "occasion" },
  { text: "Work songs are performed during communal labour, such as planting, weeding, or herding", category: "occasion" },
  { text: "Some folk songs are performed specifically for mourning or funeral occasions", category: "occasion" },
  { text: "Traditional costumes for a folk song performance often reflect the specific community's cultural dress", category: "costumes-props-artefacts" },
  { text: "Props and artefacts, such as gourds, beaded ornaments, or traditional tools, can support a folk song's story or occasion", category: "costumes-props-artefacts" },
  { text: "The choice of costumes, props, and artefacts should match the folk song's community, occasion, and theme", category: "costumes-props-artefacts" },
];

const INSTRUMENT_PARTS = [
  { id: "body", xPercent: 25, yPercent: 60, label: "Body (resonator)", note: "The body amplifies the string's vibration, projecting the sound during a folk song performance" },
  { id: "neck", xPercent: 50, yPercent: 28, label: "Neck", note: "The neck is where the player's fingers press to change pitch while accompanying a folk song" },
  { id: "strings", xPercent: 50, yPercent: 55, label: "Strings", note: "The strings vibrate when plucked or bowed, producing the accompaniment's actual sound" },
  { id: "tuning-pegs", xPercent: 50, yPercent: 8, label: "Tuning pegs", note: "Tuning pegs are adjusted before a performance so the instrument's pitch matches the singers" },
  { id: "bridge", xPercent: 50, yPercent: 77, label: "Bridge", note: "The bridge transfers the strings' vibration into the body for a fuller sound" },
  { id: "bow", xPercent: 79, yPercent: 20, label: "Bow", note: "The bow is drawn across a string to sustain a note on a bowed instrument such as the orutu" },
] as const;

function partOf(id: string) {
  return INSTRUMENT_PARTS.find((p) => p.id === id)!;
}

// The design's own Suggested Learning Experiences bullet order for 2.1, condensed into an
// ordering task (per SKILL-QUALITY-STANDARDS.md's sanctioned technique).
const PROCESS_STEPS = [
  { id: "listen", label: "Listen to or watch Kenyan folk song performances and discuss their characteristics" },
  { id: "select", label: "Select a Kenyan folk song with an appropriate theme and message" },
  { id: "source", label: "Source instruments, costumes, props, artefacts, make-up and décor" },
  { id: "roles", label: "Take up different roles — soloist, instrumentalist, or group singer" },
  { id: "rehearse", label: "Carry out rehearsals, observing rehearsal etiquette and safety procedures" },
  { id: "perform", label: "Perform the Kenyan folk song before an audience, applying the performance aspects" },
  { id: "record", label: "Record and share the performance with peers for feedback" },
];

interface FolkFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: FolkFact[] = [
  {
    situation: "is selecting a Kenyan folk song for a school cultural day and must consider who traditionally performs it and for what occasion",
    correct: "Consider the song's gender, age, and occasion associations, since these choice factors guide who should perform it and when it is appropriate",
    wrong: [
      "Choose any folk song at random, since choice factors do not matter for performance",
      "Only consider the song's melody, ignoring who traditionally performs it",
      "Choice factors only apply to costumes, never to who performs a song",
    ],
  },
  {
    situation: "leads a group performing a folk song where half the group sings one phrase and the other half sings the answering phrase",
    correct: "This is a call-and-response pattern, a common characteristic of many Kenyan folk songs performed in a group format",
    wrong: [
      "This shows the song is actually being performed solo",
      "Call-and-response is not a real characteristic of Kenyan folk songs",
      "This pattern means the performers are out of synchrony",
    ],
  },
  {
    situation: "notices during rehearsal that the group's voices and movements keep drifting apart in timing",
    correct: "The group needs to work on synchrony, keeping voices, movement, and any instruments precisely together in time",
    wrong: [
      "The group needs to work on projection, since timing has nothing to do with volume",
      "The group needs to work on etiquette, since drifting apart in timing is a conduct issue",
      "Drifting timing does not affect the quality of a folk song performance",
    ],
  },
  {
    situation: "performs a folk song so quietly that the back rows of the audience cannot hear the words clearly",
    correct: "The performer needs to improve projection — producing enough vocal volume and clarity to reach the whole audience",
    wrong: [
      "The performer needs to improve idiom, since volume has nothing to do with performance style",
      "The performer needs to improve transitions, since quiet singing is a transition problem",
      "Quiet singing is always acceptable for a folk song performance",
    ],
  },
  {
    situation: "sings the correct words and pitches of a folk song but with a flat, emotionless delivery that does not convey its meaning",
    correct: "The performer needs to work on expressiveness — conveying the song's mood and meaning through dynamics, facial expression, and delivery",
    wrong: [
      "The performer needs to work on instrumentation, since expression relates only to instruments",
      "Correct words and pitches are always enough for a strong folk song performance",
      "The performer needs to work on projection, since expressiveness is really about volume",
    ],
  },
  {
    situation: "moves abruptly and awkwardly from one verse of a folk song into the next, breaking the performance's flow",
    correct: "The performer needs to work on transitions — moving smoothly between sections without disrupting the flow",
    wrong: [
      "The performer needs to work on idiom, since transitions are not a real performance aspect",
      "The performer needs to work on etiquette, since abrupt movement is a conduct issue",
      "Abrupt transitions do not affect how an audience experiences a performance",
    ],
  },
  {
    situation: "performs a folk song using vocal ornaments and phrasing typical of a specific Kenyan community's traditional singing style",
    correct: "This demonstrates idiom — performing in the stylistic character and conventions specific to that community's folk song tradition",
    wrong: [
      "This demonstrates instrumentation, since ornaments relate only to instruments",
      "This demonstrates synchrony, since matching a style just means matching timing",
      "Idiom is not one of the named performance aspects for folk songs",
    ],
  },
  {
    situation: "arrives late to a rehearsal, talks over the group leader, and leaves before the performance debrief is finished",
    correct: "This shows a failure of etiquette — the accepted standards of respectful conduct before, during, and after a performance",
    wrong: [
      "This shows a failure of projection, since etiquette is really about volume",
      "This behaviour has no effect on a group folk song performance",
      "This shows a failure of instrumentation, since it happened during rehearsal",
    ],
  },
  {
    situation: "selects a traditional instrument, such as a drum or a lyre, to accompany a group folk song performance",
    correct: "This is applying instrumentation — selecting and playing appropriate accompanying instruments for the folk song",
    wrong: [
      "This is applying idiom, since instruments are part of a community's style only",
      "This is applying etiquette, since choosing an instrument is a conduct matter",
      "Instrumentation is not one of the named performance aspects for folk songs",
    ],
  },
  {
    situation: "must decide whether to perform a folk song as a solo soloist or gather a full group of singers",
    correct: "Consider the song's traditional format and the occasion, since Kenyan folk songs are performed in both solo and group formats depending on the song and context",
    wrong: [
      "Always choose solo, since Kenyan folk songs are never performed in groups",
      "Always choose group, since Kenyan folk songs are never performed solo",
      "The choice between solo and group format never matters for a folk song performance",
    ],
  },
];

// 5 openers x 4 closers = 20 distinct prompt skeletons from 9 authored pieces, per the
// combineFrames technique documented in sharedG10.ts.
const REASONING_OPENERS: ((rng: RNG, fact: FolkFact) => string)[] = [
  (rng, fact) => `${name(rng)}, rehearsing a folk song group near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `In a school music club near ${place(rng)}, ${name(rng)} ${fact.situation}`,
  (rng, fact) => `${name(rng)} ${fact.situation}`,
  (rng, fact) => `While preparing for a cultural day in ${place(rng)}, ${name(rng)} ${fact.situation}`,
  (rng, fact) => `Leading a folk song performance, ${name(rng)} ${fact.situation}`,
];

const REASONING_CLOSERS = [
  "What is the correct conclusion?",
  "What should this tell the performer?",
  "Which choice is correct?",
  "What is the right way to understand this?",
];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);
const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

const CLICK_MATCH_PROMPTS = [
  "Match each performance aspect to its description.",
  "Pair each performance aspect with the description that fits it.",
  "Connect each performance aspect to what it actually means.",
  "Line up each performance aspect with its correct description.",
  "Work out which description belongs to which performance aspect, then match them.",
  "Match each of the eight performance aspects to its description below.",
  "Which description goes with which performance aspect? Match them correctly.",
  "Pair up every performance aspect with the statement that correctly describes it.",
  "Match each aspect on the left to its description on the right.",
  "Sort out which description belongs to which performance aspect, by matching them.",
  "Correctly match every performance aspect to the description that fits it.",
  "Match each aspect to what it means during a folk song performance.",
  "For each performance aspect below, find the description that explains it.",
  "Match each performance aspect to what it means in practice.",
  "Figure out what each aspect describes, then match it to its name.",
  "Connect each performance aspect's name to its correct description.",
  "Match each of the eight aspects to the description that fits.",
  "Pair each performance aspect with its correct explanation.",
  "Work out which aspect matches which description, then link them.",
  "Match every performance aspect below to the description that correctly explains it.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by the choice factor it describes.",
  "Group these facts under the correct choice factor.",
  "Decide which choice factor each fact below belongs to, and sort it there.",
  "Sort each statement into the choice factor it best fits.",
  "Place each fact into the bucket for the choice factor it is describing.",
  "Read each fact and sort it under the matching choice factor.",
  "Work out which choice factor each fact is about, then sort it there.",
  "Classify each fact by the choice factor it belongs to.",
  "Organize these facts into the correct choice-factor group.",
  "Which choice factor does each fact describe? Sort it accordingly.",
  "Sort each statement below into gender, age, occasion, or costumes/props/artefacts.",
  "Drop each fact into the choice factor it's really about.",
  "Group each statement with the choice factor it correctly belongs to.",
  "Decide where each fact fits among the four choice factors.",
  "Sort these facts into their correct choice-factor groups.",
  "For each fact, work out the choice factor it belongs to and sort it in.",
  "Place these statements under the choice factor each one matches.",
  "Sort each fact correctly among the four choice factors.",
  "Read each statement and file it under the right choice factor.",
  "Assign each fact to the choice factor it best describes.",
];

const ORDERING_PROMPTS = [
  "Arrange the steps of preparing a Kenyan folk song performance in the correct order.",
  "Put these folk song performance steps into a sensible order.",
  "Sequence the process of preparing a group folk song performance correctly.",
  "Arrange these actions into the order a careful group would follow them.",
  "Order these steps the way a group should carry them out while preparing a folk song.",
  "Sort these steps into the order they should happen when preparing a folk song performance.",
  "Put these preparation steps in the order a performing group would follow them.",
  "Work out the sensible order for these folk-song performance steps.",
  "Arrange these steps into a logical performance-preparation process.",
  "Which order should these steps happen in? Arrange them correctly.",
  "Build a sensible preparation process by ordering these steps correctly.",
  "Sequence a group's steps in the order they should be carried out.",
  "Order these actions the way they would happen in a well-run folk song rehearsal.",
  "Arrange the steps of preparing a folk song performance, in the right order.",
  "Put these tasks into the order a careful group would complete them.",
  "Sequence these steps to build a performance from start to finish.",
  "Work out the correct order for preparing and performing a folk song.",
  "Arrange these steps as a group would carry them out while preparing for a show.",
  "Order the tasks below the way a sensible preparation process would run.",
  "Sequence these preparation steps correctly, from first to last.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the fact about Kenyan folk song performance.",
  "Fill in the missing term.",
  "Work out the missing word in this folk song fact.",
  "Complete this statement about performing Kenyan folk songs.",
  "Fill in the blank to finish the fact.",
  "Which term completes this sentence correctly?",
  "Name the missing term in this fact about folk song performance.",
  "Complete the sentence with the correct performance term.",
  "Work out and fill in the missing term below.",
  "Which word or phrase finishes this fact correctly?",
  "Fill in the term that correctly completes this statement.",
  "Complete this folk-song performance fact accurately.",
  "What term belongs in the blank below?",
  "Finish the sentence with the correct term.",
  "Fill in the correct performance-aspect or choice-factor name.",
  "Complete the missing term in this folk song fact.",
  "Which term fits correctly in the blank?",
  "Work out the correct word to complete this fact.",
  "Fill in the blank with the correct term.",
  "Complete this fact about performing Kenyan folk songs.",
];

const HOTSPOT_PROMPTS = [
  "Click the part being asked about on this accompanying instrument.",
  "Find and click the labelled part on this folk song instrument.",
  "Click on the correct part of this instrument.",
  "Locate the asked-about part on this accompanying instrument.",
  "Click the part of the instrument described below.",
  "Find the correct part on this string instrument used for accompaniment.",
  "Click the part of the instrument the question is asking about.",
  "Identify and click the correct part on this instrument.",
  "Click where this part is located on the instrument.",
  "Find the labelled part being asked about, then click it.",
  "Click the correct part of this folk song accompaniment instrument.",
  "Locate and click the part named in the question.",
  "Click on the instrument part described here.",
  "Find the part of the instrument this question is about, then click it.",
  "Click the correct location for this part on the instrument.",
  "Identify the part on this instrument and click it.",
  "Click the part of the accompanying instrument that matches the question.",
  "Find and select the correct part on the diagram.",
  "Click the labelled position for this instrument part.",
  "Locate the part on the instrument and click it correctly.",
];

export const kenyanFolkSongsPerforming: Skill = {
  id: "g10-mad-kenyan-folk-songs-performing",
  code: "2.1",
  subjectId: "music-and-dance",
  strandId: "g10-mad-performing",
  grade: 10,
  title: "Kenyan Folk Songs",
  description: "Performing Kenyan folk songs — characteristics, solo vs group format, choice factors (gender, age, occasion, costumes/props/artefacts), and the eight performance aspects: singing (tone and diction), idiom, synchrony, transitions, instrumentation, projection, expressiveness, and etiquette.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["aspect-match", "choice-categorize", "process-order", "reasoning", "instrument-hotspot", "fill-blank"] as const
    );
    const hint = "The eight performance aspects are singing (tone and diction), idiom, synchrony, transitions, instrumentation, projection, expressiveness, and etiquette.";

    if (branch === "aspect-match") {
      const tokens = shuffle(rng, ASPECTS.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, ASPECTS.map((a) => ({ id: a.id, label: a.def })));
      const correctMap: Record<string, string> = {};
      for (const a of ASPECTS) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, CLICK_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: ASPECTS.map((a) => `${a.label}: ${a.def}.`).join(" "),
      };
    }

    if (branch === "choice-categorize") {
      const chosen = shuffle(rng, CHOICE_FACTS).slice(0, 9);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.category));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (Object.keys(CHOICE_LABEL) as ChoiceCategory[]).map((c) => ({ id: c, label: CHOICE_LABEL[c] })),
        correctBucket,
        hint: "The four choice factors are gender, age, occasion, and costumes/props/artefacts.",
        explanation: chosen.map((c) => `"${c.text}" is about ${CHOICE_LABEL[c.category].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "process-order") {
      const shuffled = shuffle(rng, PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDERING_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STEPS.map((s) => s.id),
        hint: "Discuss and select the song first, then source materials, assign roles, rehearse, perform, and finally record and share.",
        explanation: PROCESS_STEPS.map((s) => s.label).join(" → "),
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

    if (branch === "instrument-hotspot") {
      const target = randChoice(rng, INSTRUMENT_PARTS);
      const otherLabels = INSTRUMENT_PARTS.filter((p) => p.id !== target.id).map((p) => p.label);
      const choices = shuffle(rng, [target.label, ...shuffle(rng, otherLabels).slice(0, 3)]);
      return {
        kind: "hotspot",
        prompt: randChoice(rng, HOTSPOT_PROMPTS),
        diagram: { type: "string-instrument-diagram" },
        spots: INSTRUMENT_PARTS.map(({ id, xPercent, yPercent, label }) => ({ id, xPercent, yPercent, label })),
        askId: target.id,
        choices,
        correctLabel: target.label,
        hint: "Instrumentation means selecting and playing the right accompanying instrument correctly — knowing its parts is part of that.",
        explanation: `${target.label} — ${target.note}.`,
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
      explanation: fb.explanation,
    };
  },
};

const FILL_BLANK_TEMPLATES = [
  {
    before: "Producing a clear vocal tone and pronouncing the words distinctly is the performance aspect called singing ",
    after: ".",
    correctAnswer: "tone and diction",
    acceptedAnswers: ["tone and diction", "diction"],
    explanation: "Singing (tone and diction) means producing a clear, appropriate vocal tone and pronouncing the words distinctly.",
  },
  {
    before: "Performing in the stylistic character specific to a folk song's community of origin is the performance aspect called ",
    after: ".",
    correctAnswer: "idiom",
    acceptedAnswers: ["idiom"],
    explanation: "Idiom is performing in the stylistic character and conventions specific to a folk song's community of origin.",
  },
  {
    before: "Keeping voices, movement, and instruments precisely together in time is the performance aspect called ",
    after: ".",
    correctAnswer: "synchrony",
    acceptedAnswers: ["synchrony"],
    explanation: "Synchrony means keeping voices, movement, and any instruments precisely together in time.",
  },
  {
    before: "Moving smoothly between sections or verses without disrupting the flow of a performance is called ",
    after: ".",
    correctAnswer: "transitions",
    acceptedAnswers: ["transitions", "transition"],
    explanation: "Transitions means moving smoothly between sections, verses, or changes within the performance.",
  },
  {
    before: "Selecting and playing the appropriate accompanying instruments for a folk song is the performance aspect called ",
    after: ".",
    correctAnswer: "instrumentation",
    acceptedAnswers: ["instrumentation"],
    explanation: "Instrumentation means selecting and playing the appropriate accompanying instruments for the folk song.",
  },
  {
    before: "Producing enough vocal or instrumental volume to reach the whole audience is the performance aspect called ",
    after: ".",
    correctAnswer: "projection",
    acceptedAnswers: ["projection"],
    explanation: "Projection means producing enough vocal or instrumental volume and clarity to reach the whole audience.",
  },
  {
    before: "Conveying a song's mood and meaning through dynamics, facial expression, and delivery is the performance aspect called ",
    after: ".",
    correctAnswer: "expressiveness",
    acceptedAnswers: ["expressiveness"],
    explanation: "Expressiveness means conveying the song's mood, emotion, and meaning through dynamics, facial expression, and delivery.",
  },
  {
    before: "Following the accepted standards of respectful conduct before, during, and after a performance is called ",
    after: ".",
    correctAnswer: "etiquette",
    acceptedAnswers: ["etiquette"],
    explanation: "Etiquette means following the accepted standards of respectful conduct before, during, and after a performance.",
  },
  {
    before: "A Kenyan folk song performed by a single featured singer, without a group, is performed in ",
    after: " format.",
    correctAnswer: "solo",
    acceptedAnswers: ["solo"],
    explanation: "Kenyan folk songs performed by one featured singer alone are performed in solo format, as opposed to group format.",
  },
  {
    before: "Choice factors for selecting a Kenyan folk song include gender, age, occasion, and ",
    after: ".",
    correctAnswer: "costumes, props and artefacts",
    acceptedAnswers: ["costumes, props and artefacts", "costumes props and artefacts", "costumes, props, and artefacts"],
    explanation: "The named choice factors are gender, age, occasion, and costumes, props and artefacts.",
  },
  {
    before: "A folk song performed by multiple singers together, often with call-and-response, is performed in ",
    after: " format.",
    correctAnswer: "group",
    acceptedAnswers: ["group"],
    explanation: "Folk songs performed by multiple singers, often with call-and-response or synchronized parts, are performed in group format.",
  },
] as const;
