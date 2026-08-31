import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// This sub-strand's content (4 unordered categories + 9 unordered relationship
// dimensions, no natural sequence, no spatial/numeric angle) genuinely supports only
// 4 QuestionKinds (categorize, multiple-choice, click-match, fill-blank) — a 5th kind
// (ordering/number-line/hotspot) would require inventing a sequence or diagram the
// curriculum doesn't provide, so it is deliberately not forced here.

// 4 categories of Creative Arts and Sports, illustrated with real activities (the
// design's own SLOs only name the 4 categories — these example activities are a
// reasonable, non-invented elaboration used purely to build a sortable pool).
const ACTIVITIES: { label: string; bucket: string }[] = [
  { label: "Painting a landscape", bucket: "visual" },
  { label: "Carving a sculpture from wood", bucket: "visual" },
  { label: "Weaving a basket", bucket: "visual" },
  { label: "Block-printing a pattern on fabric", bucket: "visual" },
  { label: "Singing in a choir", bucket: "music" },
  { label: "Playing a descant recorder", bucket: "music" },
  { label: "Performing a folk dance", bucket: "music" },
  { label: "Composing a rhythmic pattern", bucket: "music" },
  { label: "Performing a scripted play", bucket: "drama" },
  { label: "Narrating a story to an audience", bucket: "drama" },
  { label: "Making a flip-book animation", bucket: "drama" },
  { label: "Playing a handball match", bucket: "sports" },
  { label: "Throwing a javelin", bucket: "sports" },
  { label: "Swimming a backstroke lap", bucket: "sports" },
  { label: "Playing a football match", bucket: "sports" },
];

const BUCKET_LABEL: Record<string, string> = {
  visual: "Visual Arts",
  music: "Music and Dance",
  drama: "Drama and Film",
  sports: "Sports",
};

// The 9 named relationship dimensions between the categories, each turned into an
// Apply-tier scenario (why does dimension X matter for this pair of activities?).
const RELATIONSHIP_SCENARIOS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "A football team and a choir both need every member doing their part for the group to succeed. Which relationship dimension does this show?",
    correct: "Team effort — both activities depend on the group working together, not just one person",
    distractors: ["Attire — both require the same uniform", "Competition — both are always scored by judges", "Audience — both must always be performed indoors"],
  },
  {
    q: "A javelin thrower wears sports kit while a stage actor wears a costume suited to their character. Which relationship dimension explains this difference?",
    correct: "Attire — each category has clothing suited to its own function and performance",
    distractors: ["Theme — attire is decided by the theme of the school term", "Team effort — attire always shows how many people are in a group", "Execution — attire changes how many rules a game has"],
  },
  {
    q: "A folk song performance and a football match both draw spectators who react to what they see and hear. Which relationship dimension is this?",
    correct: "Audience — both categories are shaped by the people watching and their reactions",
    distractors: ["Functions — an audience always changes the purpose of an activity", "Presentation — an audience is only relevant to Visual Arts", "Competition — every audience member is a judge scoring the performance"],
  },
  {
    q: "A painting is judged on how it is arranged and displayed, while a play is judged on how it is staged and acted out. Which relationship dimension links these two ideas?",
    correct: "Presentation — how a work is shown or staged affects how it is experienced",
    distractors: ["Themes — presentation always means picking a story topic", "Competition — presentation only matters when there is a prize", "Functions — presentation decides whether an activity is useful"],
  },
  {
    q: "Netball and handball are both structured around rules for scoring points, while carving a javelin is not. Which relationship dimension is being compared here?",
    correct: "Competition — some Creative Arts and Sports activities involve competitive scoring, others do not",
    distractors: ["Visual — competition is only about how something looks", "Attire — competition always requires a special costume", "Team effort — competition means only individuals can take part"],
  },
  {
    q: "A mural artist and a swimmer both physically move their bodies to complete their activity, even though the movements look very different. Which relationship dimension does this compare?",
    correct: "Execution — every category requires the performer's body to actually carry out the activity",
    distractors: ["Theme — execution is about choosing what story to tell", "Audience — execution only matters if people are watching", "Functions — execution decides who wins a competition"],
  },
  {
    q: "A sculpture and a dance performance can both explore the same idea, such as unity, even though one is still and one moves. Which relationship dimension is this?",
    correct: "Themes — different categories can express the same underlying idea or message",
    distractors: ["Visual — themes only apply to things you can see", "Attire — themes are decided by what clothing is available", "Competition — themes only exist in scored activities"],
  },
  {
    q: "A painting hung in a classroom and a folk song sung at a wedding both serve a specific role in people's lives beyond entertainment. Which relationship dimension does this describe?",
    correct: "Functions — every category serves purposes in society, not just entertainment",
    distractors: ["Execution — functions describe how fast an activity is performed", "Attire — functions are decided by what costume is worn", "Audience — functions only exist when an activity is judged"],
  },
  {
    q: "A colourful mural and a brightly lit stage set both rely on what the eye can take in. Which relationship dimension connects these two examples?",
    correct: "Visual — many categories, not just Visual Arts, depend on what can be seen",
    distractors: ["Team effort — visual elements only matter in group activities", "Functions — visual elements decide the purpose of an activity", "Competition — visual elements are only judged in art competitions"],
  },
  {
    q: "A handball team passing the ball to set up a goal, and a group of dancers moving in formation, both rely on more than one performer. Which relationship dimension is shared here?",
    correct: "Team effort — both examples need coordinated contribution from more than one person",
    distractors: ["Theme — team effort is about choosing a story idea", "Attire — team effort means everyone must wear identical clothing", "Visual — team effort only matters in categories that can be seen"],
  },
];

// Combined term<->meaning pool (4 categories + 9 relationship dimensions = 13 facts)
// feeding both the click-match branch and the fill-blank branch.
const TERM_MEANINGS: { id: string; label: string; meaning: string; blankSentence: string; answers: string[] }[] = [
  { id: "visual-arts", label: "Visual Arts", meaning: "The category including painting, sculpture, and weaving", blankSentence: "The category of Creative Arts and Sports that includes painting, sculpture, and weaving is called ___.", answers: ["Visual Arts", "visual arts"] },
  { id: "music-dance", label: "Music and Dance", meaning: "The category including singing, playing instruments, and folk dance", blankSentence: "The category of Creative Arts and Sports that includes singing and folk dance is called Music and ___.", answers: ["Dance", "dance"] },
  { id: "drama-film", label: "Drama and Film", meaning: "The category including performing plays and narrating stories", blankSentence: "The category of Creative Arts and Sports that includes performing plays and narrating stories is called Drama and ___.", answers: ["Film", "film"] },
  { id: "sports", label: "Sports", meaning: "The category including football, handball, and swimming", blankSentence: "The category of Creative Arts and Sports that includes football, handball, and swimming is called ___.", answers: ["Sports", "sports"] },
  { id: "functions", label: "Functions", meaning: "Serves a purpose in society beyond entertainment", blankSentence: "The relationship dimension describing how an activity serves a purpose in society is called ___.", answers: ["functions", "Functions"] },
  { id: "execution", label: "Execution", meaning: "Requires the performer's body to actually carry out the activity", blankSentence: "The relationship dimension describing how the body physically carries out an activity is called ___.", answers: ["execution", "Execution"] },
  { id: "visual-dim", label: "Visual", meaning: "Depends on what the eye can see", blankSentence: "The relationship dimension describing what can be seen in an activity is called ___.", answers: ["visual", "Visual"] },
  { id: "presentation", label: "Presentation", meaning: "How a work is staged or shown", blankSentence: "The relationship dimension describing how a work is staged or shown is called ___.", answers: ["presentation", "Presentation"] },
  { id: "competition", label: "Competition", meaning: "Involves scored, rule-based activity", blankSentence: "The relationship dimension describing scored, rule-based activity is called ___.", answers: ["competition", "Competition"] },
  { id: "audience", label: "Audience", meaning: "The people watching and reacting to a performance", blankSentence: "The relationship dimension describing the people watching and reacting to a performance is called the ___.", answers: ["audience", "Audience"] },
  { id: "attire", label: "Attire", meaning: "Clothing suited to an activity's function", blankSentence: "The relationship dimension describing clothing suited to an activity's function is called ___.", answers: ["attire", "Attire"] },
  { id: "themes-dim", label: "Themes", meaning: "A shared central idea expressed across categories", blankSentence: "The relationship dimension describing a shared central idea across categories is called ___.", answers: ["themes", "Themes", "theme", "Theme"] },
  { id: "team-effort", label: "Team effort", meaning: "Coordinated contribution from more than one person", blankSentence: "The relationship dimension describing coordinated contribution from more than one person is called ___ ___.", answers: ["team effort", "Team effort"] },
];

const MATCH_PROMPTS = [
  "Match each category or relationship dimension to its correct meaning.",
  "Pair each term below with its correct meaning.",
  "Match each term to what it describes.",
  "Connect each category or dimension to its correct meaning.",
  "For each term below, choose its matching meaning.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about Creative Arts and Sports.",
  "Fill in the blank with the correct word.",
] as const;

const CATEGORIZE_PROMPTS = [
  "Sort each activity into the category of Creative Arts and Sports it belongs to.",
  "Which category does each activity below belong to? Sort them.",
  "Classify each activity into its correct category.",
  "Decide which category each activity fits, and sort it.",
  "Sort these activities by the category they belong to.",
] as const;

export const introduction: Skill = {
  id: "g7-cas-introduction",
  code: "F.1",
  subjectId: "creative-arts-sports",
  strandId: "g7-cas-foundations",
  grade: 7,
  title: "Introduction to Creative Arts and Sports",
  description: "The four categories of Creative Arts and Sports — Visual Arts, Music and Dance, Drama and Film, Sports — and how they relate to each other.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "relationship", "match", "fill-blank"] as const);

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The 4 categories name a type of activity; the 9 relationship dimensions describe how categories connect to each other.",
        explanation: chosen.map((t) => `${t.label}: ${t.meaning}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const t = randChoice(rng, TERM_MEANINGS);
      const idx = t.blankSentence.indexOf("___");
      const before = t.blankSentence.slice(0, idx);
      const after = t.blankSentence.slice(idx + 3);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before,
        after,
        correctAnswer: t.answers[0],
        acceptedAnswers: t.answers,
        inputMode: "text",
        hint: "Think about which category or relationship dimension the sentence is describing.",
        explanation: `${t.label}: ${t.meaning}.`,
      };
    }

    if (branch === "categorize") {
      const picks: { label: string; bucket: string }[] = [];
      for (const bucket of ["visual", "music", "drama", "sports"]) {
        picks.push(...shuffle(rng, ACTIVITIES.filter((a) => a.bucket === bucket)).slice(0, 3));
      }
      const items = shuffle(rng, picks);
      const correctBucket: Record<string, string> = {};
      for (const a of items) correctBucket[a.label] = a.bucket;

      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items: items.map((a) => ({ id: a.label, label: a.label })),
        buckets: (["visual", "music", "drama", "sports"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Visual Arts is made or displayed to be seen; Music and Dance is heard and moved to; Drama and Film tells a story through performance; Sports is competitive physical activity.",
        explanation: items.map((a) => `"${a.label}" belongs to ${BUCKET_LABEL[a.bucket]}.`).join(" "),
      };
    }

    const q = randChoice(rng, RELATIONSHIP_SCENARIOS);
    const choices = shuffle(rng, [q.correct, ...q.distractors]);
    return {
      kind: "multiple-choice",
      prompt: q.q,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint: "The categories of Creative Arts and Sports are related through functions, execution, visual elements, presentation, competition, audience, attire, themes, and team effort.",
      explanation: `The correct answer is "${q.correct}".`,
    };
  },
};
