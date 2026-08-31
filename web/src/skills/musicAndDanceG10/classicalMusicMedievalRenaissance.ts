import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./sharedG10";

// KICD Grade 10 Music and Dance, Strand 3.0 Critical Appreciation, sub-strand 3.2 "Classical Music
// (Medieval and Renaissance)" (curriculum-reference/grade-10/music-and-dance.json,
// strands[2].subStrands[1]). Two periods (Medieval, Renaissance); Medieval genres — plain song,
// organum, motet (hard floor, all 3); Renaissance genres — motet, madrigal, mass, toccata, canzona
// (hard floor, all 5). "Motet" is deliberately listed in BOTH period genre lists — a real,
// curriculum-sanctioned point (the genre evolves across both periods), used below as the basis for
// a dedicated Comparison-angle branch contrasting the Medieval motet against the Renaissance motet.
// The design's "aurally identify" outcome has no audio in this engine, so it is approximated
// honestly the way other skills in this codebase handle it: a described listening scenario the
// learner reasons from, not an actual audio clip — never claimed as literal audio identification.
// No dedicated VisualSpec exists for Medieval/Renaissance genres or periods (no notation/staff
// visual in this engine's type list fits a genre-identification question), so no branch uses a
// visual — a deliberate, documented skip per the precedent in
// agricultureG6/rearingSmallDomesticAnimals.ts, not an oversight.

interface ScenarioFact {
  situation: string;
  correct: string;
  wrong: string[];
}

type PeriodId = "medieval" | "renaissance";

const GENRES = [
  { id: "plain-song", label: "Plain song (Gregorian chant)", period: "medieval" as PeriodId, characteristic: "Unaccompanied, single-line (monophonic) chant with free, unmetered rhythm, sung in Latin during Medieval church worship" },
  { id: "organum", label: "Organum", period: "medieval" as PeriodId, characteristic: "The earliest form of polyphony — a second voice added moving alongside a plain chant melody, developed in the Medieval church" },
  { id: "motet-medieval", label: "Motet (Medieval)", period: "medieval" as PeriodId, characteristic: "A polyphonic sacred vocal piece built from a chant, sometimes layering different Latin texts sung at once in different voices" },
  { id: "motet-renaissance", label: "Motet (Renaissance)", period: "renaissance" as PeriodId, characteristic: "A polyphonic sacred vocal piece in Latin, using smoother, more balanced imitative polyphony than its Medieval ancestor, with all voices typically sharing one text" },
  { id: "madrigal", label: "Madrigal", period: "renaissance" as PeriodId, characteristic: "A secular vocal piece for several voices, set to vernacular (non-Latin) love poetry, often using vivid word-painting" },
  { id: "mass", label: "Mass", period: "renaissance" as PeriodId, characteristic: "A large-scale sacred choral setting of the Latin liturgical mass texts, sung polyphonically, usually unaccompanied" },
  { id: "toccata", label: "Toccata", period: "renaissance" as PeriodId, characteristic: "A virtuosic instrumental keyboard piece, free in form, written to display the performer's technique" },
  { id: "canzona", label: "Canzona", period: "renaissance" as PeriodId, characteristic: "A lively, rhythmic instrumental piece for keyboard or ensemble, built from short imitative sections, descended from the vocal chanson" },
] as const;

const GENRE_MATCH_PROMPTS = [
  "Match each genre to its characteristics.",
  "Pair each genre with the description that explains it.",
  "Connect each genre to its correct characteristics.",
  "Match each genre below to the explanation that fits it.",
  "Link each genre to the description that describes it.",
  "Match each genre to the statement that defines it.",
  "Work out which description belongs to which genre, then match them up.",
  "Pair each genre with its correct characteristics.",
  "For each genre below, find the description that explains it.",
  "Match each genre to the explanation of what it involves.",
  "Which description goes with which genre? Match them correctly.",
  "Line up each genre with what actually characterises it.",
  "Connect each genre to its correct description.",
  "Match these genres to their characteristics below.",
  "Figure out what characterises each genre, then match it up.",
  "Pair up every genre with the statement that correctly describes it.",
  "Match each item on the left to the genre it describes on the right.",
  "Sort out which description belongs to which genre, by matching them.",
  "Correctly match every genre to the characteristic that fits it.",
  "Match each genre to what a listener would notice about it.",
];

// ---- Period-level illustrative facts (distinct from the genre-name pool above) — 12 facts (6 per
// period) feeding a categorize branch that samples a strictly-smaller subset per draw. ----
const PERIOD_FACTS: { text: string; period: PeriodId }[] = [
  { text: "A piece for solo unaccompanied voice, sung with free, unmetered rhythm in Latin, as part of church liturgy", period: "medieval" },
  { text: "Two voices moving together for the first time, one added above or below a familiar chant melody", period: "medieval" },
  { text: "Different Latin texts are layered simultaneously in different voices over a chant-based melody", period: "medieval" },
  { text: "Music built almost entirely around single-line, unaccompanied chant with no fixed metre", period: "medieval" },
  { text: "Among the earliest recorded attempts at combining more than one melodic line at once in Western church music", period: "medieval" },
  { text: "A sacred vocal work whose polyphony still sounds relatively sparse and stark compared to later styles", period: "medieval" },
  { text: "Several voices weave smooth, imitative polyphonic lines that sound balanced and consonant together", period: "renaissance" },
  { text: "A secular piece set to vernacular love poetry, using vivid word-painting to match the meaning of the text", period: "renaissance" },
  { text: "A large-scale choral setting of the full Latin mass texts, sung by an unaccompanied choir", period: "renaissance" },
  { text: "A virtuosic keyboard piece written mainly to show off the performer's technical skill", period: "renaissance" },
  { text: "A lively instrumental piece built from short imitative sections, descended from vocal song forms", period: "renaissance" },
  { text: "Music noted for richer, more balanced harmony than the sparser sound of earlier church music", period: "renaissance" },
];

const PERIOD_PROMPTS = [
  "Sort each description by the period it characterises: Medieval or Renaissance.",
  "Classify each statement below by period.",
  "Decide which period each description fits, and sort it there.",
  "Sort each fact into the correct historical period.",
  "Place each description into the bucket for the period it illustrates.",
  "Read each statement and sort it under the matching period.",
  "Work out which period each description is about, then sort it there.",
  "Group each description by the period it belongs to.",
  "Organize these descriptions into the correct period.",
  "Which period does each description illustrate? Sort it accordingly.",
  "Sort each statement below into Medieval or Renaissance.",
  "Drop each description into the period it's really describing.",
  "Group each statement with the period it correctly illustrates.",
  "Decide where each description fits between the two periods.",
  "Sort these descriptions into their correct period groups.",
  "For each description, work out the period it illustrates and sort it in.",
  "Place these statements under the period each one matches.",
  "Sort each description correctly between Medieval and Renaissance.",
  "Read each statement and file it under the right period.",
  "Assign each description to the period it best illustrates.",
];

// ---- Apply-tier "aural identification," approximated as a described listening scenario: 8 facts
// (one per genre) x 20 frames (5 openers x 4 closers) = 160 templates. ----
const GENRE_ID_FACTS: ScenarioFact[] = [
  { situation: "a single unaccompanied voice chants a Latin text with no fixed metre, sounding completely monophonic throughout", correct: "Plain song (Gregorian chant)", wrong: ["Organum", "Motet (Medieval)", "Motet (Renaissance)"] },
  { situation: "a second voice has been added moving alongside a familiar chant melody, in what still sounds like an early, simple form of two-part singing", correct: "Organum", wrong: ["Plain song (Gregorian chant)", "Motet (Medieval)", "Motet (Renaissance)"] },
  { situation: "two different Latin texts are being sung at once by different voices, layered over what sounds like an older chant melody underneath", correct: "Motet (Medieval)", wrong: ["Organum", "Motet (Renaissance)", "Plain song (Gregorian chant)"] },
  { situation: "several voices share one Latin text, entering one after another in smooth, balanced, consonant-sounding polyphony", correct: "Motet (Renaissance)", wrong: ["Motet (Medieval)", "Madrigal", "Mass"] },
  { situation: "several voices sing vernacular love poetry, not Latin, with the music vividly illustrating specific words in the text", correct: "Madrigal", wrong: ["Motet (Renaissance)", "Mass", "Canzona"] },
  { situation: "an unaccompanied choir sings a large-scale, multi-movement setting of the full Latin liturgical mass text", correct: "Mass", wrong: ["Madrigal", "Motet (Renaissance)", "Motet (Medieval)"] },
  { situation: "a solo keyboard player performs a free-form, technically dazzling piece that seems designed to show off virtuosity rather than tell a story", correct: "Toccata", wrong: ["Canzona", "Madrigal", "Mass"] },
  { situation: "an instrumental ensemble plays a lively, rhythmic piece built from short imitative sections, clearly descended from a vocal song form", correct: "Canzona", wrong: ["Toccata", "Madrigal", "Mass"] },
];

const GENRE_ID_OPENERS: ((rng: RNG, fact: ScenarioFact) => string)[] = [
  (rng, fact) => `${name(rng)} listens to a recording described in class notes near ${place(rng)}: ${fact.situation}`,
  (rng, fact) => `A listening excerpt is described as follows: ${fact.situation}`,
  (rng, fact) => `During a critical listening exercise near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `${name(rng)} is asked to aurally identify a piece described as: ${fact.situation}`,
];

const GENRE_ID_CLOSERS = [
  "Which genre is this recording?",
  "Which genre does this excerpt belong to?",
  "Which genre is being described here?",
  "Which genre should this be identified as?",
];

const GENRE_ID_FRAMES = combineFrames(GENRE_ID_OPENERS, GENRE_ID_CLOSERS);
const GENRE_ID_TEMPLATES = expandScenarios(GENRE_ID_FACTS, GENRE_ID_FRAMES);

// ---- Comparison branch, sanctioned directly by the design's dual motet listing: 4 comparison
// facts x 20 frames (5 openers x 4 closers) = 80 templates. ----
const MOTET_COMPARISON_FACTS: ScenarioFact[] = [
  {
    situation: "two or three different Latin texts are being sung at the same time by different voices, layered over an older chant melody",
    correct: "The Medieval motet — layering different simultaneous texts over a chant-based melody was typical of its early form",
    wrong: ["The Renaissance motet — which favoured a single shared text sung imitatively by all voices", "A Renaissance madrigal — a secular genre using only one vernacular text", "A Renaissance mass — which sets one shared Latin liturgical text"],
  },
  {
    situation: "all voices share the exact same Latin text, entering one after another in smooth, balanced imitation",
    correct: "The Renaissance motet — sharing a single text across voices in smooth imitative polyphony was its more mature, balanced style",
    wrong: ["The Medieval motet — which often layered several different texts at once rather than sharing one", "Organum — an earlier, simpler two-voice Medieval form", "A Renaissance madrigal — a secular, not sacred, genre"],
  },
  {
    situation: "the harmony sounds sparser and starker, closer to the sound of early church polyphony than to smooth, consonant later harmony",
    correct: "The Medieval motet — its harmony reflects the earlier, less blended stage of polyphony's development",
    wrong: ["The Renaissance motet — known for smoother, more consonant blended harmony", "A Renaissance mass — which also uses the smoother Renaissance harmonic style", "A toccata — an instrumental, not vocal, genre"],
  },
  {
    situation: "this piece belongs to a later stage in the motet's development, generations after Medieval composers first built the genre from chant",
    correct: "The Renaissance motet — the same genre name evolved across both periods, with the Renaissance version coming later and sounding more harmonically mature",
    wrong: ["The Medieval motet — the earlier stage of the genre's development", "A Renaissance madrigal — a different, secular genre entirely", "Organum — the earliest Medieval polyphonic form, not a motet"],
  },
];

const COMPARISON_OPENERS: ((rng: RNG, fact: ScenarioFact) => string)[] = [
  (rng, fact) => `A listener comparing two motets — one Medieval, one Renaissance — near ${place(rng)} hears that ${fact.situation}`,
  (rng, fact) => `${name(rng)} is comparing a Medieval motet with a Renaissance motet and notices that ${fact.situation}`,
  (rng, fact) => `While studying how the motet genre changed over time, a listener notices that ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `A music historian near ${place(rng)} points out that in the excerpt being studied, ${fact.situation}`,
];

const COMPARISON_CLOSERS = [
  "Which version of the motet does this describe?",
  "Which stage of the motet's development does this best match?",
  "Which is this — the Medieval or the Renaissance motet?",
  "Which of the two motets does this feature best fit?",
];

const COMPARISON_FRAMES = combineFrames(COMPARISON_OPENERS, COMPARISON_CLOSERS);
const COMPARISON_TEMPLATES = expandScenarios(MOTET_COMPARISON_FACTS, COMPARISON_FRAMES);

// ---- Fill-blank: 10 distinct genre-identification templates. ----
const FILL_BLANK_TEMPLATES = [
  { before: "The Medieval genre consisting of unaccompanied, single-line chant sung with free rhythm in church worship is called ", after: ".", correctAnswer: "plain song", acceptedAnswers: ["plain song", "plainsong", "plainchant", "gregorian chant"] },
  { before: "The earliest form of polyphony, where a second voice was added to a plain chant melody, is called ", after: ".", correctAnswer: "organum", acceptedAnswers: ["organum"] },
  { before: "The Medieval polyphonic sacred genre that sometimes layered different Latin texts at once over a chant is the ", after: ".", correctAnswer: "motet", acceptedAnswers: ["motet", "medieval motet"] },
  { before: "The Renaissance sacred vocal genre known for smooth, balanced imitative polyphony sung to one shared Latin text is the ", after: ".", correctAnswer: "motet", acceptedAnswers: ["motet", "renaissance motet"] },
  { before: "The Renaissance secular genre set to vernacular love poetry, often using vivid word-painting, is the ", after: ".", correctAnswer: "madrigal", acceptedAnswers: ["madrigal"] },
  { before: "The large-scale Renaissance choral setting of the full Latin liturgical texts is called the ", after: ".", correctAnswer: "mass", acceptedAnswers: ["mass"] },
  { before: "The virtuosic Renaissance keyboard genre written mainly to show off a performer's technique is the ", after: ".", correctAnswer: "toccata", acceptedAnswers: ["toccata"] },
  { before: "The lively Renaissance instrumental genre built from short imitative sections, descended from vocal song, is the ", after: ".", correctAnswer: "canzona", acceptedAnswers: ["canzona"] },
  { before: "The Medieval genre name for the earliest polyphony, where voices moved together for the first time, is ", after: ".", correctAnswer: "organum", acceptedAnswers: ["organum"] },
  { before: "Of plain song, organum and motet, the genre built by layering multiple Latin texts over a chant melody in the Medieval period is the ", after: ".", correctAnswer: "motet", acceptedAnswers: ["motet", "medieval motet"] },
] as const;

const FILL_BLANK_PROMPTS = [
  "Which genre is being described?",
  "Identify the genre in this description.",
  "Which genre fits this description?",
  "Work out the genre being described here.",
  "Fill in the genre this description matches.",
  "Name the genre described here.",
  "This description matches which genre?",
  "Complete the sentence with the correct genre.",
  "Which genre does this characteristic belong to?",
  "Determine the genre described in this sentence.",
  "What genre is this an example of?",
  "Read the description and name the genre.",
  "This is a characteristic of which genre?",
  "Which genre — Medieval or Renaissance — fits this description?",
  "Fill in the blank with the matching genre.",
  "Work out and fill in the correct genre.",
  "Which genre does this description point to?",
  "Identify the genre from its characteristics.",
  "Name the correct genre for this description.",
  "Which genre best matches what's described?",
];

// ---- Historical-development ordering: plain song predates organum, which predates the fuller
// polyphonic motet, which itself kept evolving from the Medieval into the Renaissance period — a
// standard, uncontroversial music-history sequence, and directly grounded in the design's own
// framing of the motet as a genre that "evolves across both periods." ----
const DEVELOPMENT_STEPS = [
  { id: "plain-song", label: "Plain song (Gregorian chant) — unaccompanied, single-line chant" },
  { id: "organum", label: "Organum — the first polyphony, a second voice added to the chant" },
  { id: "motet-medieval", label: "The Medieval motet — a fuller polyphonic sacred genre built from chant" },
  { id: "motet-renaissance", label: "The Renaissance motet — the same genre evolved into smoother, more balanced imitative polyphony" },
];

const DEVELOPMENT_PROMPTS = [
  "Arrange these genres in the order they historically developed.",
  "Put these genres into the order they emerged, earliest to latest.",
  "Sequence these genres correctly, from earliest to most recent.",
  "Arrange these genres into the order polyphony actually developed.",
  "Order these genres the way they appeared across music history.",
  "Sort these genres into the order they came into being.",
  "Put these genres in the order composers developed them.",
  "Work out the correct historical order of these genres.",
  "Arrange these genres into a logical historical sequence.",
  "Which order did these genres appear in? Arrange them correctly.",
  "Build the correct historical sequence by ordering these genres.",
  "Sequence these genres in the order they emerged.",
  "Order these genres the way they developed over time.",
  "Arrange the genres below, earliest to latest.",
  "Put these genres into the order in which they were first composed.",
  "Sequence these genres to build the correct historical order.",
  "Work out the correct order for these genres, earliest first.",
  "Arrange these genres as they historically came into use.",
  "Order the genres below the way music history actually unfolded.",
  "Sequence these genres correctly, from earliest to latest.",
];

export const classicalMusicMedievalRenaissance: Skill = {
  id: "g10-mad-classical-music-medieval-renaissance",
  code: "3.2",
  subjectId: "music-and-dance",
  strandId: "g10-mad-appreciation",
  grade: 10,
  title: "Classical Music (Medieval and Renaissance)",
  description: "Describing, aurally identifying and appreciating the characteristics of Medieval genres (plain song, organum, motet) and Renaissance genres (motet, madrigal, mass, toccata, canzona), including how the motet genre evolved across both periods.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["genre-match", "period-categorize", "genre-identify", "motet-comparison", "development-order", "fill-blank"] as const
    );
    const generalHint = "Think about who is performing (voices alone, or instruments), the language and text, and how many independent lines are sounding together.";

    if (branch === "genre-match") {
      const chosen = shuffle(rng, GENRES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((g) => ({ id: g.id, label: g.label })));
      const targets = shuffle(rng, chosen.map((g) => ({ id: g.id, label: g.characteristic })));
      const correctMap: Record<string, string> = {};
      for (const g of chosen) correctMap[g.id] = g.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, GENRE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: generalHint,
        explanation: chosen.map((g) => `${g.label}: ${g.characteristic}.`).join(" "),
      };
    }

    if (branch === "period-categorize") {
      const chosen = shuffle(rng, PERIOD_FACTS).slice(0, 8);
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.period));
      return {
        kind: "categorize",
        prompt: randChoice(rng, PERIOD_PROMPTS),
        items,
        buckets: [
          { id: "medieval", label: "Medieval" },
          { id: "renaissance", label: "Renaissance" },
        ],
        correctBucket,
        hint: "Medieval music tends to sound sparser and starker; Renaissance music tends to sound smoother, more balanced and more consonant.",
        explanation: chosen.map((c) => `"${c.text}" describes the ${c.period === "medieval" ? "Medieval" : "Renaissance"} period.`).join(" "),
      };
    }

    if (branch === "genre-identify") {
      const q = randChoice(rng, GENRE_ID_TEMPLATES)(rng);
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

    if (branch === "motet-comparison") {
      const q = randChoice(rng, COMPARISON_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "The motet genre appears in both periods — the Medieval version and the Renaissance version share a name but not a sound.",
        explanation: q.explanation,
      };
    }

    if (branch === "development-order") {
      const shuffled = shuffle(rng, DEVELOPMENT_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, DEVELOPMENT_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: DEVELOPMENT_STEPS.map((s) => s.id),
        hint: "Polyphony developed gradually: single-line chant came first, then a second voice was added (organum), then fuller polyphonic genres like the motet — which itself kept evolving from the Medieval into the Renaissance period.",
        explanation: DEVELOPMENT_STEPS.map((s) => s.label).join(" → "),
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
      hint: generalHint,
      explanation: fb.before + fb.correctAnswer + fb.after,
    };
  },
};
