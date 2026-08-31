import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, place, worshipPlace, type ScenarioMC } from "./shared";

// KICD Grade 7 HRE, Strand 4.0 → Sub-strand 4.2 "Places of Worship" (16 lessons).
// The design names one festival per faith — Durga Pooja (Sanatan/Vedic), Ayambil (Jain), Vesak
// (Buddhist), GurPurab (Sikh) — and outcome (c) explicitly asks learners to "acknowledge
// commonalities" across all four, which is its own outcome, not a bonus. The rubric grades outlining
// the festival practices "SYSTEMATICALLY" (exceeding) vs "without the correct order" (approaching),
// so this skill carries a genuine ordering branch, not just recall.
//
// Visual scope: declined — see curriculum-reference/grade-7/hindu-religious-education.json →
// visualCoverageDecision. No respectful generated-SVG primitive exists for festival imagery.

const GURPURAB_ORDER_PROMPTS = [
  "Arrange GurPurab's practices in the order the celebrations unfold.",
  "Put GurPurab's practices into the order they happen.",
  "Sequence these GurPurab practices correctly, from first to last.",
  "Order these GurPurab celebrations as they actually unfold.",
  "Sort these steps of GurPurab into the order they occur.",
  "Arrange these GurPurab traditions in the order they take place.",
];

const DURGA_ORDER_PROMPTS = [
  "Arrange Durga Pooja's practices in the order they unfold.",
  "Put Durga Pooja's practices into the order they happen.",
  "Sequence these Durga Pooja practices correctly, from first to last.",
  "Order these Durga Pooja celebrations as they actually unfold.",
  "Sort these steps of Durga Pooja into the order they occur.",
  "Arrange these Durga Pooja traditions in the order they take place.",
];

const MEANING_MATCH_PROMPTS = [
  "Match each festival to what it celebrates.",
  "Pair each festival with what it celebrates.",
  "Connect each festival below to what it marks.",
  "Link each festival to the meaning behind it.",
  "Match each festival to its correct meaning.",
  "Choose what each festival celebrates.",
];

const FACT_SORT_PROMPTS = [
  "Sort each description under the festival it describes.",
  "Group these descriptions under the festival each one belongs to.",
  "Decide which festival each description matches, and sort it there.",
  "Sort each fact into the correct festival.",
  "Place each description under the festival it belongs to.",
  "Read each fact and sort it under the matching festival.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
];

const FESTIVALS = [
  {
    id: "durga",
    label: "Durga Pooja",
    tradition: "Sanatan/Vedic",
    meaning: "Celebrates the goddess Durga's victory over the buffalo-demon Mahishasura — the triumph of good over evil",
  },
  {
    id: "ayambil",
    label: "Ayambil",
    tradition: "Jain",
    meaning: "A period of austerity in which a simple, spice-free meal is eaten once a day, as an act of self-discipline and purification",
  },
  {
    id: "vesak",
    label: "Vesak",
    tradition: "Buddhist",
    meaning:
      "Marks three events believed to have happened on the same full-moon day of the Buddha's life: his birth, his enlightenment and his passing",
  },
  {
    id: "gurpurab",
    label: "GurPurab",
    tradition: "Sikh",
    meaning: "Celebrates the anniversaries of the Sikh Gurus, most widely observed for Guru Nanak Dev Ji's birthday",
  },
] as const;

// 16 facts across the four festivals — comfortably past the 10-fact floor.
const FESTIVAL_FACTS: { text: string; festival: string }[] = [
  { text: "An idol of the goddess is decorated and worshipped in a pandal for several days", festival: "durga" },
  { text: "The festival ends with Vijayadashami, when the idol is immersed (visarjan) in water", festival: "durga" },
  { text: "Cultural performances and community feasting mark the festival days", festival: "durga" },
  { text: "Named for a demon whose defeat by the goddess it commemorates", festival: "durga" },
  { text: "Only plain boiled food, without spices, oil or dairy, is eaten once a day", festival: "ayambil" },
  { text: "Observed especially during the nine-day Ayambil Oli, dedicated to the Navpad", festival: "ayambil" },
  { text: "Restraint of the senses is practised alongside the simple diet", festival: "ayambil" },
  { text: "An act of austerity (tapasya) rather than a day of feasting", festival: "ayambil" },
  { text: "Devotees visit the vihara to meditate and listen to the Buddha's teachings", festival: "vesak" },
  { text: "Lotus flowers, candles and incense are offered before the shrine", festival: "vesak" },
  { text: "Acts of charity are performed and caged birds are released as a symbol of freedom", festival: "vesak" },
  { text: "Called the 'triple blessed day' because it marks birth, enlightenment and passing together", festival: "vesak" },
  { text: "An Akhand Path — an unbroken reading of the Guru Granth Sahib — is completed over about 48 hours", festival: "gurpurab" },
  { text: "A Nagar Kirtan procession moves through the streets with hymn-singing", festival: "gurpurab" },
  { text: "Kirtan and Katha are held in the gurdwara before langar, the community meal, is shared", festival: "gurpurab" },
  { text: "Langar at the close of the day is open to absolutely everyone present, of any faith", festival: "gurpurab" },
];

const GURPURAB_SEQUENCE = [
  { id: "s1", label: "The Akhand Path — an unbroken reading of the Guru Granth Sahib — begins, about two days before" },
  { id: "s2", label: "A Nagar Kirtan procession moves through the streets with hymn-singing" },
  { id: "s3", label: "Kirtan and Katha (hymns and discourse) are held in the gurdwara" },
  { id: "s4", label: "Langar, the free community meal, is shared with everyone present" },
] as const;

const DURGA_SEQUENCE = [
  { id: "d1", label: "The idol of the goddess Durga is installed and unveiled in the pandal" },
  { id: "d2", label: "Daily worship, prayers and cultural performances continue over several days" },
  { id: "d3", label: "Vijayadashami arrives, marking the goddess's victory" },
  { id: "d4", label: "The idol is carried out and immersed (visarjan) in a river or lake" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} watches an idol of a goddess being immersed in a river at the close of several days of worship and feasting. Which festival is this?`,
    correct: "Durga Pooja — closing with the immersion (visarjan) of the goddess's idol on Vijayadashami",
    wrong: [
      "Vesak — which marks the Buddha's birth, enlightenment and passing, not an idol immersion",
      "Ayambil — which is a period of simple eating, not an immersion ceremony",
      "GurPurab — which centres on scripture reading and a community meal, not an idol",
    ],
    explanation: "Immersing the goddess's idol on the final day is the distinctive close of Durga Pooja among these four festivals.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} eats only plain, boiled food without any spices or oil, once a day, for nine days dedicated to the Navpad. Which observance is this?`,
    correct: "Ayambil — the period of simple, spice-free eating observed especially during the nine-day Ayambil Oli",
    wrong: [
      "GurPurab — which centres on scripture and processions, not a plain diet",
      "Vesak — which involves offerings and charity, not a nine-day simple diet",
      "Durga Pooja — which involves feasting, the opposite of Ayambil's simple diet",
    ],
    explanation: "A plain, spice-free meal eaten once a day over the nine days of the Navpad is specifically Ayambil.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} visits the vihara in ${place(rng)} on a full-moon day and hears that this single day marks the Buddha's birth, his enlightenment, and his passing, all at once. Which festival is being observed?`,
      correct: "Vesak — the 'triple blessed day' marking all three events on the same full-moon day",
      wrong: [
        "GurPurab — which marks a Sikh Guru's birth or martyrdom, not the Buddha's life",
        "Durga Pooja — which marks a goddess's victory, not the Buddha's life",
        "Ayambil — which is a period of austerity, not a day marking three life events",
      ],
      explanation: "Only Vesak marks three events of the Buddha's life falling on the same day — its well-known 'triple blessed day' feature.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s family in ${place(rng)} joins a Nagar Kirtan procession through the streets, then shares a free community meal open to everyone at the gurdwara. Which festival is this?`,
    correct: "GurPurab — marked by a Nagar Kirtan procession and closing with langar, the community meal",
    wrong: [
      "Vesak — observed at a vihara with meditation and offerings, not a gurdwara procession",
      "Ayambil — a period of simple eating, not a street procession and shared meal",
      "Durga Pooja — closes with an idol immersion, not a langar meal",
    ],
    explanation: "The Nagar Kirtan procession and the langar meal at a gurdwara are specific to GurPurab.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices lotus flowers, candles and incense placed before a shrine, and hears that caged birds will later be released as a sign of freedom. Which festival matches this?`,
      correct: "Vesak — marked by offerings of lotus flowers, candles and incense, and acts of charity such as releasing caged birds",
      wrong: [
        "Durga Pooja — marked by idol worship and immersion, not bird release",
        "GurPurab — marked by scripture reading and a shared meal, not offerings before a shrine",
        "Ayambil — a period of simple eating with no shrine offerings involved",
      ],
      explanation: "Offerings before a shrine and the symbolic release of caged birds are practices specifically described for Vesak.",
    };
  },
  (rng) => ({
    prompt: `A relative tells ${name(rng)} that an unbroken reading of a scripture, completed over roughly two days, always precedes this festival's main celebrations. Which festival does this describe?`,
    correct: "GurPurab — preceded by an Akhand Path, an unbroken reading of the Guru Granth Sahib over about 48 hours",
    wrong: [
      "Vesak — which does not involve a multi-day unbroken scripture reading",
      "Durga Pooja — which centres on idol worship, not an unbroken scripture reading",
      "Ayambil — which is defined by diet, not a scripture reading",
    ],
    explanation: "The Akhand Path, an unbroken 48-hour reading of the Guru Granth Sahib, is the practice that precedes GurPurab's main celebrations.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} explains that this festival is named directly after the demon whose defeat it commemorates. Which festival is ${who} describing?`,
      correct: "Durga Pooja — commemorating the goddess Durga's defeat of the buffalo-demon Mahishasura",
      wrong: [
        "GurPurab — named after the Sikh Gurus, not a defeated demon",
        "Vesak — named after the month in which it falls, not a demon",
        "Ayambil — the name of a diet practice, not linked to any demon",
      ],
      explanation: "Durga Pooja's story centres on the goddess's victory over Mahishasura — good over evil is its defining theme.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} tells classmates in ${place(rng)} that this is an act of austerity rather than a day of feasting or celebration. Which of the four festivals is the odd one out in this way?`,
    correct: "Ayambil — a period of simple, restrained eating, unlike the feasting or offerings of the other three",
    wrong: [
      "Durga Pooja — which involves feasting during its days of worship",
      "Vesak — which involves offerings and celebration, not restraint of diet",
      "GurPurab — which involves a shared community feast (langar)",
    ],
    explanation: "Ayambil stands apart from the other three because it is defined by restraint and simplicity, not celebration or feasting.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s neighbour in ${place(rng)} says the goddess honoured in this festival is worshipped for several days before the idol is finally carried to a river. Which festival is this?`,
      correct: "Durga Pooja — worship continues over several days before the idol's immersion",
      wrong: [
        "Ayambil — which involves no idol at all",
        "GurPurab — which involves scripture and procession, not an idol carried to a river",
        "Vesak — which involves shrine offerings, not an idol immersion",
      ],
      explanation: "Multi-day worship of a goddess's idol, closing with its immersion in water, is distinctive to Durga Pooja.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says this festival's central practice is simply what is (and is not) eaten, rather than any procession, offering, or idol. Which festival fits?`,
    correct: "Ayambil — its central practice is the plain, once-a-day meal itself",
    wrong: [
      "GurPurab — centred on a procession, scripture reading and shared meal",
      "Vesak — centred on shrine offerings and charity",
      "Durga Pooja — centred on an idol and its worship",
    ],
    explanation: "Ayambil is unique among the four for being defined by diet and restraint rather than a procession, offering or idol.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} visits ${worshipPlace(rng)} in ${place(rng)} and is told that everyone present, regardless of their own faith, is welcome to share the meal being served. Which festival's practice is being described?`,
      correct: "GurPurab — langar, the community meal shared at the close of the celebrations, is open to everyone present",
      wrong: [
        "Vesak — its acts of charity do not centre on a shared open meal for all visitors",
        "Ayambil — a restricted, simple diet, not an open communal meal",
        "Durga Pooja — its feasting is part of community celebration, not a langar-style meal open to all regardless of faith",
      ],
      explanation: "Langar, served openly to anyone present regardless of faith, is the practice specifically associated with GurPurab.",
    };
  },
];

const COMMONALITY_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} is preparing a class presentation in ${place(rng)} on what Durga Pooja, Ayambil, Vesak and GurPurab all have in common. Which statement is best supported?`,
    correct:
      "Each one marks a significant event or teaching in that faith's own history, and each draws the community together, whether through worship, restraint, offerings or a shared meal",
    wrong: [
      "All four are celebrated on exactly the same calendar date each year",
      "All four require fasting for a full week without exception",
      "All four are observed only by monks, priests or religious leaders, never by ordinary community members",
    ],
    explanation:
      "The four festivals differ in date, practice and faith, but each marks a meaningful event in that tradition and brings the community together in its own way — that shared function, not identical practices, is the real commonality.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that because the four festivals belong to four different faiths, they cannot have anything genuinely in common. Judge this claim.`,
    correct:
      "It is mistaken — despite belonging to different faiths, all four centre a community around a meaningful shared observance, whether an idol, a diet, a shrine visit or a scripture reading",
    wrong: [
      "It is correct — festivals from different faiths never share any real purpose",
      "It is correct — only festivals with the exact same name can be compared",
      "It is mistaken, because all four festivals actually belong to the same single faith",
    ],
    explanation:
      "Belonging to different faiths does not rule out a shared function — bringing a community together around a meaningful observance is common to all four, even though the specific practice differs each time.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices that three of the four festivals involve giving something — feasting, offerings, or a free meal — while one is defined mainly by restraint. Which festival is the exception, and does this weaken the idea that they share something in common?`,
    correct: "Ayambil is the exception, but it still shares the deeper commonality — each festival is a meaningful, community-recognised religious observance",
    wrong: [
      "Ayambil is the exception, and this proves the four festivals share nothing at all",
      "GurPurab is the exception, since langar is not really a form of giving",
      "There is no exception — all four festivals involve identical practices",
    ],
    explanation:
      "Ayambil's restraint looks different on the surface from feasting or offering, but it is just as much a deliberate, meaningful religious observance recognised by its community — the surface practice differs, the underlying commonality does not.",
  }),
];

const NUMBER_FACTS = [
  {
    prompt: "Mark how many festivals the Grade 7 design names, one for each of the four faiths.",
    min: 0,
    max: 8,
    value: 4,
    hint: "Sanatan/Vedic, Jain, Buddhist, Sikh — one each.",
    explanation: "The design names four festivals, one per faith: Durga Pooja, Ayambil, Vesak and GurPurab.",
  },
  {
    prompt: "Mark roughly how many hours an Akhand Path takes to complete before GurPurab's main celebrations.",
    min: 0,
    max: 72,
    value: 48,
    hint: "About two days.",
    explanation: "The Akhand Path is an unbroken reading of the Guru Granth Sahib completed over about 48 hours.",
  },
  {
    prompt: "Mark how many events are believed to fall on the same day at Vesak.",
    min: 0,
    max: 6,
    value: 3,
    hint: "Birth, enlightenment, passing.",
    explanation: "Vesak is the 'triple blessed day' — the Buddha's birth, enlightenment and passing are all marked on it.",
  },
  {
    prompt: "Mark how many days the Ayambil Oli observance lasts.",
    min: 0,
    max: 20,
    value: 9,
    hint: "It is dedicated to the Navpad, the nine exalted entities.",
    explanation: "The Ayambil Oli is a nine-day observance dedicated to the Navpad, held twice a year.",
  },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The festival marking the goddess's victory over the buffalo-demon Mahishasura is ", after: ".", correctAnswer: "Durga Pooja", acceptedAnswers: ["durga pooja", "durga puja"], hint: "Sanatan/Vedic.", explanation: "Durga Pooja celebrates the goddess Durga's victory over Mahishasura." },
  { before: "Durga Pooja closes with Vijayadashami, when the goddess's idol is ", after: " in water.", correctAnswer: "immersed", acceptedAnswers: ["immersed", "immersion"], hint: "The Sanskrit term is visarjan.", explanation: "On Vijayadashami the idol is immersed (visarjan) in a river or lake." },
  { before: "Eating only plain, spice-free food once a day, as an act of austerity, is called ", after: ".", correctAnswer: "Ayambil", acceptedAnswers: ["ayambil"], hint: "Jain.", explanation: "Ayambil is the Jain practice of eating a simple, spice-free meal once a day." },
  { before: "The nine-day Jain observance dedicated to the Navpad is called the Ayambil ", after: ".", correctAnswer: "Oli", acceptedAnswers: ["oli"], hint: "It is held twice a year.", explanation: "The Ayambil Oli is a nine-day observance dedicated to the Navpad, the nine exalted entities." },
  { before: "The Buddhist festival marking the Buddha's birth, enlightenment and passing on the same day is ", after: ".", correctAnswer: "Vesak", acceptedAnswers: ["vesak", "wesak"], hint: "It falls on a full-moon day.", explanation: "Vesak marks all three events of the Buddha's life on the same full-moon day." },
  { before: "At Vesak, caged birds are released as a symbol of ", after: ".", correctAnswer: "freedom", acceptedAnswers: ["freedom"], hint: "It mirrors an act of charity.", explanation: "Releasing caged birds at Vesak is a symbolic act of charity representing freedom." },
  { before: "The Sikh festival marking the anniversaries of the Sikh Gurus is called ", after: ".", correctAnswer: "GurPurab", acceptedAnswers: ["gurpurab", "gurpurb"], hint: "Most widely observed for Guru Nanak Dev Ji's birthday.", explanation: "GurPurab celebrates the anniversaries of the Sikh Gurus, most widely Guru Nanak Dev Ji's birthday." },
  { before: "The unbroken, roughly 48-hour reading of the Guru Granth Sahib before GurPurab is called an ", after: ".", correctAnswer: "Akhand Path", acceptedAnswers: ["akhand path"], hint: "'Akhand' means unbroken.", explanation: "The Akhand Path is the unbroken reading of the Guru Granth Sahib completed before GurPurab's celebrations." },
  { before: "The GurPurab procession through the streets with hymn-singing is called ", after: ".", correctAnswer: "Nagar Kirtan", acceptedAnswers: ["nagar kirtan"], hint: "'Nagar' means town or city.", explanation: "Nagar Kirtan is the town procession with hymn-singing that is part of GurPurab." },
  { before: "The free community meal shared at the close of GurPurab, open to everyone present, is called ", after: ".", correctAnswer: "langar", acceptedAnswers: ["langar"], hint: "It is served at the gurdwara.", explanation: "Langar is the free community meal shared at the close of GurPurab, open to all regardless of faith." },
  { before: "Of the four festivals, the one that is an act of austerity rather than a celebration of an event is ", after: ".", correctAnswer: "Ayambil", acceptedAnswers: ["ayambil"], hint: "It is defined by a restrained diet.", explanation: "Ayambil is a period of austerity and restraint, unlike the other three festivals." },
] as const;

export const placesOfWorship: Skill = {
  id: "g7-hre-rp-places-of-worship",
  code: "RP.2",
  subjectId: "hre",
  strandId: "g7-hre-rp",
  grade: 7,
  title: "Places of Worship",
  description:
    "Festivals celebrated at places of worship across the four faiths — Durga Pooja (Sanatan/Vedic), Ayambil (Jain), Vesak (Buddhist) and GurPurab (Sikh) — their practices, their order of observance, and what they share in common.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["gurpurab-order", "durga-order", "meaning-match", "fact-sort", "reasoning", "commonality", "counts", "fill-blank"] as const
    );

    if (branch === "gurpurab-order") {
      const items = shuffle(rng, GURPURAB_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, GURPURAB_ORDER_PROMPTS),
        instruction: "Click them in order, from first to last.",
        items,
        correctOrder: GURPURAB_SEQUENCE.map((s) => s.id),
        hint: "Scripture is read first, then the streets, then the gurdwara, then the shared meal.",
        explanation: GURPURAB_SEQUENCE.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "durga-order") {
      const items = shuffle(rng, DURGA_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, DURGA_ORDER_PROMPTS),
        instruction: "Click them in order, from first to last.",
        items,
        correctOrder: DURGA_SEQUENCE.map((s) => s.id),
        hint: "The idol is set up first and immersed last.",
        explanation: DURGA_SEQUENCE.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "meaning-match") {
      const tokens = shuffle(rng, FESTIVALS.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FESTIVALS.map((f) => ({ id: f.id, label: f.meaning })));
      const correctMap: Record<string, string> = {};
      for (const f of FESTIVALS) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MEANING_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "One festival per faith: Sanatan/Vedic, Jain, Buddhist, Sikh.",
        explanation: FESTIVALS.map((f) => `${f.label} (${f.tradition}) — ${f.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fact-sort") {
      const chosen = shuffle(rng, FESTIVALS).slice(0, 3);
      const pool = shuffle(rng, FESTIVAL_FACTS.filter((f) => chosen.some((c) => c.id === f.festival))).slice(0, 9);
      const items = pool.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`f${i}`] = f.festival));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FACT_SORT_PROMPTS),
        items,
        buckets: chosen.map((f) => ({ id: f.id, label: `${f.label} (${f.tradition})` })),
        correctBucket,
        hint: "Look for the idol, the diet, the shrine offerings, or the procession and meal.",
        explanation: pool.map((f) => `"${f.text}" — ${FESTIVALS.find((x) => x.id === f.festival)!.label}.`).join(" "),
      };
    }

    if (branch === "reasoning" || branch === "commonality") {
      const q = randChoice(rng, branch === "reasoning" ? REASONING_TEMPLATES : COMMONALITY_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint:
          branch === "reasoning"
            ? "Match the specific practice described to the one festival it actually belongs to."
            : "Look past the surface differences for what all four festivals actually achieve for their community.",
        explanation: q.explanation,
      };
    }

    if (branch === "counts") {
      const q = randChoice(rng, NUMBER_FACTS);
      return {
        kind: "number-line",
        prompt: q.prompt,
        min: q.min,
        max: q.max,
        step: q.max > 20 ? 2 : 1,
        correctValue: q.value,
        mode: "point",
        hint: q.hint,
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
      hint: fb.hint,
      explanation: fb.explanation,
    };
  },
};
