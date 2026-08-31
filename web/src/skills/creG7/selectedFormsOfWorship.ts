import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ORDER_PROMPTS = [
  "Arrange the petitions of the Lord's Prayer (Matthew 6:9-13) in their correct order.",
  "Put these lines of the Lord's Prayer into their correct order.",
  "Sequence the petitions of the Lord's Prayer correctly.",
  "Arrange these parts of the Lord's Prayer in order.",
  "Order the lines of the Lord's Prayer as Jesus taught them.",
  "Sort these petitions into the order they appear in the Lord's Prayer.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement as being about praise and thanksgiving, or about prayer and fasting.",
  "Decide whether each statement is about praise or prayer/fasting, and sort it there.",
  "Group these statements under praise and thanksgiving, or prayer and fasting.",
  "Sort each statement below into the correct form of worship.",
  "Place each statement into the bucket for praise or prayer and fasting.",
  "Read each statement and sort it under the correct form of worship.",
];

const MATCH_PROMPTS = [
  "Match each term to its meaning.",
  "Pair each term below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each term to the statement that explains it.",
  "Link each term below to its correct definition.",
  "Match each term to the description that fits it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about worship with the right word.",
];

const LORDS_PRAYER_ORDER = [
  { id: "l1", label: "'Our Father in heaven, hallowed be your name'" },
  { id: "l2", label: "'Your kingdom come, your will be done, on earth as it is in heaven'" },
  { id: "l3", label: "'Give us today our daily bread'" },
  { id: "l4", label: "'Forgive us our debts, as we also have forgiven our debtors'" },
  { id: "l5", label: "'Lead us not into temptation, but deliver us from the evil one'" },
];

const PRAISE_FACTS = [
  "Miriam led the women in a song of praise after crossing the Red Sea (Exodus 15:20-21)",
  "Psalm 30:11-12 speaks of mourning turned into dancing, so the heart may sing praises without ceasing",
  "Psalm 96:1-2 calls people to sing a new song to the Lord and proclaim His salvation",
  "Psalm 150:1-5 calls for praising God with trumpet, harp, lyre, tambourine, dancing, and cymbals",
  "Ephesians 5:19 encourages speaking to one another with psalms, hymns, and spiritual songs",
] as const;

const PRAYER_FASTING_FACTS = [
  "Jesus fasted for forty days and nights in the wilderness (Luke 4:1-2)",
  "The church at Antioch fasted and prayed before sending out Paul and Barnabas (Acts 13:1-3)",
  "Jesus taught His disciples the Lord's Prayer as a model for prayer (Matthew 6:9-13)",
  "1 Thessalonians 5:16-18 instructs believers to rejoice always, pray continually, and give thanks in all circumstances",
  "Matthew 6:16 warns against looking sombre when fasting, so as not to show off to others",
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "Praise", meaning: "Expressing honour and admiration for God's greatness" },
  { term: "Thanksgiving", meaning: "Expressing gratitude to God for what He has done" },
  { term: "Prayer", meaning: "Communicating with God, including asking, thanking, and listening" },
  { term: "Fasting", meaning: "Deliberately going without food (or another need) to focus on prayer and seeking God" },
  { term: "Miriam's song", meaning: "A song of praise led by Miriam after the Israelites crossed the Red Sea" },
  { term: "The Lord's Prayer", meaning: "The model prayer Jesus taught His disciples in Matthew 6:9-13" },
  { term: "Sincerity in fasting", meaning: "Matthew 6:16's teaching to fast without drawing attention to oneself for show" },
  { term: "Continual prayer", meaning: "1 Thessalonians 5:17's instruction to pray without ceasing" },
  { term: "Corporate fasting", meaning: "A group of believers fasting together, as the church at Antioch did in Acts 13" },
  { term: "Worship", meaning: "Honouring and adoring God through praise, prayer, and other spiritual acts" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} deliberately looks sad and tells everyone at school that they are fasting so people will notice. What does Matthew 6:16 say about this approach?`,
      correct: "Fasting should not be done to draw attention to oneself for show",
      wrong: ["Fasting is only genuine when everyone around notices it", "Matthew 6:16 says fasting must always be announced publicly", "Looking visibly sombre is the correct way to fast, according to Jesus"],
      explanation: "Matthew 6:16 specifically warns against looking sombre to show others one is fasting — sincerity, not public display, is what Jesus taught.",
    };
  },
  (rng) => ({
    prompt: `A church group in ${place(rng)}, before sending out missionaries, spends a day fasting and praying together as a congregation. Which Bible account does this reflect?`,
    correct: "The church at Antioch fasting and praying before sending out Paul and Barnabas (Acts 13:1-3)",
    wrong: ["Jesus fasting alone for forty days in the wilderness", "Miriam's song of praise after crossing the Red Sea", "Psalm 150's call to praise God with musical instruments"],
    explanation: "Acts 13:1-3 records the church at Antioch fasting and praying together before commissioning Paul and Barnabas for missionary work — the model for corporate fasting before a significant task.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} uses drums, clapping, and dancing during a church service to honour God. Which Bible passage most directly supports this form of worship?`,
      correct: "Psalm 150:1-5, which calls for praising God with instruments, dancing, and cymbals",
      wrong: ["Matthew 6:9-13, the model of the Lord's Prayer", "Luke 4:1-2, Jesus' forty days of fasting", "1 Thessalonians 5:16-18, praying continually"],
      explanation: "Psalm 150 explicitly calls for praising God with a range of instruments and dancing, directly supporting expressive musical worship.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} teaches younger learners in ${place(rng)} the Lord's Prayer as a model for how to structure their own prayers. Which part of the prayer asks God to meet a daily, practical need?`,
    correct: "'Give us today our daily bread'",
    wrong: ["'Our Father in heaven, hallowed be your name'", "'Your kingdom come, your will be done'", "'Lead us not into temptation'"],
    explanation: "'Give us today our daily bread' is the petition asking God to meet a daily, practical need, distinct from praising God's name or asking for spiritual protection.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps giving thanks to God even during a difficult, stressful week at school. Which Bible instruction does this reflect?`,
    correct: "1 Thessalonians 5:16-18's instruction to give thanks in all circumstances",
    wrong: ["Matthew 6:16's teaching about not showing off while fasting", "Exodus 15:20-21's account of Miriam's song", "Acts 13:1-3's account of the church fasting before a mission"],
    explanation: "1 Thessalonians 5:16-18 specifically instructs believers to give thanks in all circumstances — even difficult ones — which is what continuing to give thanks during a stressful week reflects.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} composes a new worship song for their church choir instead of only singing older, familiar hymns. Which Bible passage encourages this kind of fresh praise?`,
      correct: "Psalm 96:1-2, which calls people to sing a new song to the Lord",
      wrong: ["Matthew 6:9-13, the Lord's Prayer", "Luke 4:1-2, Jesus' fasting in the wilderness", "Matthew 6:16, teaching on sincerity in fasting"],
      explanation: "Psalm 96:1-2 specifically calls for singing a new song to the Lord, encouraging fresh expressions of praise rather than only repeating older ones.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} forgives a friend who wronged them, remembering a specific line from the Lord's Prayer. Which line is it?`,
    correct: "'Forgive us our debts, as we also have forgiven our debtors'",
    wrong: ["'Our Father in heaven, hallowed be your name'", "'Give us today our daily bread'", "'Your kingdom come, your will be done'"],
    explanation: "The Lord's Prayer directly links being forgiven to forgiving others — a line that speaks specifically to a situation of forgiving someone who has wronged you.",
  }),
  (rng) => ({
    prompt: `${name(rng)} explains that Jesus fasted for forty days and nights before beginning His public ministry (Luke 4:1-2). What does this example show about fasting?`,
    correct: "Fasting can be a time of spiritual preparation and focus before an important task",
    wrong: ["Fasting has no connection to spiritual preparation at all", "Jesus fasted only because food was unavailable in the wilderness", "Fasting for forty days is a requirement for every Christian before any task"],
    explanation: "Jesus' forty days of fasting before His public ministry shows fasting as a time of spiritual preparation and focus — a pattern echoed later by the church in Acts 13.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why worship includes both praise/thanksgiving and prayer/fasting as distinct forms. What best explains why both matter?`,
    correct: "Praise and thanksgiving honour God for who He is and what He has done, while prayer and fasting seek God's guidance and presence more deeply",
    wrong: ["Praise and prayer are exactly the same thing with no real difference", "Only one of the two forms is ever necessary for genuine worship", "Prayer and fasting are only meant for church leaders, not ordinary believers"],
    explanation: "Praise and thanksgiving express honour and gratitude to God, while prayer and fasting are ways of seeking His guidance and drawing closer to Him — different, complementary forms of worship.",
  }),
];

export const selectedFormsOfWorship: Skill = {
  id: "g7-cre-ch-selected-forms-of-worship",
  code: "CH.1",
  subjectId: "cre",
  strandId: "g7-cre-church",
  grade: 7,
  title: "Selected Forms of Worship",
  description: "Biblical teachings on praise and thanksgiving (Exodus 15:20-21, Psalms 30, 96, 150, Ephesians 5:19) and on prayer and fasting (Luke 4:1-2, Acts 13:1-3, Matthew 6:9-13, 16, 1 Thessalonians 5:16-18).",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, LORDS_PRAYER_ORDER);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: LORDS_PRAYER_ORDER.map((l) => l.id),
        hint: "The prayer begins by honouring God's name and ends by asking for protection from temptation and evil.",
        explanation: LORDS_PRAYER_ORDER.map((l) => l.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const praise = shuffle(rng, PRAISE_FACTS).slice(0, 4);
      const prayer = shuffle(rng, PRAYER_FASTING_FACTS).slice(0, 4);
      const chosen = shuffle(rng, [...praise.map((t) => ({ text: t, kind: "praise" })), ...prayer.map((t) => ({ text: t, kind: "prayer" }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "praise", label: "Praise and thanksgiving" },
          { id: "prayer", label: "Prayer and fasting" },
        ],
        correctBucket,
        hint: "Praise and thanksgiving honour God's greatness; prayer and fasting seek God's presence and guidance.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.kind === "praise" ? "praise and thanksgiving" : "prayer and fasting"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about the different forms of worship — praise, thanksgiving, prayer, and fasting.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about which Bible passage or teaching on worship best fits the situation.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Miriam led the women in a song of praise after crossing the", after: "Sea.", answer: "Red", accepted: ["red"] },
      { before: "Psalm 150 calls for praising God with trumpet, harp, lyre, tambourine, and", after: ".", answer: "dancing", accepted: ["dancing", "cymbals"] },
      { before: "Jesus fasted for forty days and", after: "in the wilderness (Luke 4:1-2).", answer: "nights", accepted: ["nights"] },
      { before: "The church at Antioch fasted and prayed before sending out Paul and", after: "(Acts 13:1-3).", answer: "Barnabas", accepted: ["barnabas"] },
      { before: "1 Thessalonians 5:17 instructs believers to pray", after: ".", answer: "continually", accepted: ["continually"] },
      { before: "Matthew 6:16 warns against looking sombre when fasting, to avoid showing off to", after: ".", answer: "others", accepted: ["others"] },
      { before: "Deliberately going without food to focus on prayer and seeking God is called", after: ".", answer: "fasting", accepted: ["fasting"] },
      { before: "The model prayer Jesus taught His disciples is called the Lord's", after: ".", answer: "Prayer", accepted: ["prayer"] },
      { before: "Expressing gratitude to God for what He has done is called", after: ".", answer: "thanksgiving", accepted: ["thanksgiving"] },
      { before: "Ephesians 5:19 encourages speaking to one another with psalms, hymns, and spiritual", after: ".", answer: "songs", accepted: ["songs"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the Bible passages on praise, thanksgiving, prayer, and fasting.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
