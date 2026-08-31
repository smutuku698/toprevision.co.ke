import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  FILL_BLANK_PROMPTS,
  IDENTIFY_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.3 "Kenyan
// Folk Dance" (12 lessons).
//
// Mined verbatim: Background of the dance (name, community of origin, performers — soloist,
// chorus/response, instrumentalist, dancers; occasion); Components of a dance (songs,
// costumes, body movements, adornment, ornaments, formations, props and instruments);
// Performance components (songs, body movements, formations and patterns, instruments,
// costumes, body adornment, ornaments, props, safety and etiquette). Discuss the social and
// economic roles of folk dance; make a beadwork ornament (one-way technique) considering
// colour variation and bead size. Key inquiry: why is it necessary to perform a folk dance?
// How do the components contribute to its performance? Core competencies: Communication and
// collaboration; Creativity and Imagination; Citizenship. Link to other learning area:
// Indigenous languages (dance songs are performed in indigenous languages).
//
// Dances named are real, well-documented Kenyan folk dances across different communities.
// Visual coverage: no folk-dance or beadwork VisualSpec exists in the shared set; building
// one is out of scope for this pass. Recorded so the omission is deliberate.

const DANCES = [
  { id: "isukuti", label: "Isukuti", community: "Luhya", feature: "danced to the fast beat of the isukuti drums at births, weddings, funerals and harvest celebrations" },
  { id: "kilumi", label: "Kilumi", community: "Kamba", feature: "a drum dance led by women, performed at healing and thanksgiving ceremonies" },
  { id: "mwomboko", label: "Mwomboko", community: "Kikuyu", feature: "a couples' social dance stepped to an accordion and a metal ring shaker (karing'aring'a)" },
  { id: "chakacha", label: "Chakacha", community: "Mijikenda and Swahili (coastal)", feature: "a coastal celebration dance, especially at weddings, with swaying hip movements" },
  { id: "adumu", label: "Adumu", community: "Maasai", feature: "the warriors' jumping dance, where men leap straight up as high as they can during ceremonies" },
] as const;

const DANCE_FACTS = [
  { text: "Danced to the isukuti drums by the Luhya at births, weddings and harvest", id: "isukuti" },
  { text: "A Kamba drum dance led by women at healing and thanksgiving ceremonies", id: "kilumi" },
  { text: "A Kikuyu couples' dance stepped to an accordion and a karing'aring'a ring shaker", id: "mwomboko" },
  { text: "A coastal wedding celebration dance with swaying hip movements", id: "chakacha" },
  { text: "The Maasai dance in which warriors leap straight upward as high as they can", id: "adumu" },
  { text: "Its name comes from the drums that drive its fast rhythm", id: "isukuti" },
  { text: "Performed by Mijikenda and Swahili communities along the Kenyan coast", id: "chakacha" },
  { text: "A vertical jumping contest is at the heart of this Maasai ceremony dance", id: "adumu" },
  { text: "A social dance that spread among the Kikuyu, danced in pairs", id: "mwomboko" },
  { text: "Kamba women use large drums to call the community together for this dance", id: "kilumi" },
] as const;

const PERFORMERS = [
  { id: "soloist", label: "Soloist", role: "Leads the singing and calls out each line for the others to answer" },
  { id: "chorus", label: "Chorus / response", role: "Answers the soloist's call, singing the response part together" },
  { id: "instrumentalist", label: "Instrumentalist", role: "Plays the drums or other instruments and keeps the rhythm steady" },
  { id: "dancers", label: "Dancers", role: "Perform the body movements, formations and patterns of the dance" },
] as const;

const COMPONENTS = [
  { id: "songs", label: "Songs", desc: "The sung words and melodies that carry the dance's message" },
  { id: "costumes", label: "Costumes", desc: "The special clothing worn by the performers" },
  { id: "body-movements", label: "Body movements", desc: "The steps, gestures and actions the dancers make" },
  { id: "adornment", label: "Body adornment", desc: "Decoration applied to the body itself, such as paint or patterns on the skin" },
  { id: "ornaments", label: "Ornaments", desc: "Worn decorative items such as beaded necklaces, bangles and headgear" },
  { id: "formations", label: "Formations and patterns", desc: "The shapes the dancers form and the pathways they trace on the ground" },
  { id: "props", label: "Props", desc: "Objects the dancers carry, such as sticks, shields, gourds or fly whisks" },
  { id: "instruments", label: "Instruments", desc: "The drums, shakers and other instruments that provide the music" },
  { id: "etiquette", label: "Safety and etiquette", desc: "Dancing safely and behaving respectfully, taking gender-appropriate roles" },
] as const;

const ROLE_FACTS = [
  { text: "It entertains the community and brings people together", role: "social" },
  { text: "It passes on the community's history, values and stories to the young", role: "social" },
  { text: "It marks life events such as births, weddings and funerals", role: "social" },
  { text: "It builds pride and a sense of shared identity", role: "social" },
  { text: "It is used in courtship, helping young people meet", role: "social" },
  { text: "Performers are paid to dance at festivals and public events", role: "economic" },
  { text: "It draws tourists, who spend money in the area", role: "economic" },
  { text: "Costumes, ornaments and instruments are made and sold", role: "economic" },
  { text: "Dance groups win prize money in competitions", role: "economic" },
  { text: "It creates work for drum makers, bead workers and costume makers", role: "economic" },
] as const;

const BEAD_STEPS = [
  { id: "b1", label: "Gather a strong string and a supply of beads from available materials" },
  { id: "b2", label: "Sort the beads by colour and by size" },
  { id: "b3", label: "Plan the colour pattern the ornament will follow" },
  { id: "b4", label: "Thread the beads onto the string one way, following the planned pattern" },
  { id: "b5", label: "Hold it up to check the length fits where it will be worn" },
  { id: "b6", label: "Tie or fasten the two ends so the beads cannot slip off" },
  { id: "b7", label: "Wear the finished ornament to enhance the folk dance performance" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why a community bothers to keep performing its folk dances. Which answer is best?`,
      correct: "The dances entertain, mark important events, and pass the community's history and values to the next generation",
      wrong: [
        "The dances are performed only so the group can win money",
        "The dances have no purpose and are done out of habit",
        "The dances are performed only when tourists are watching",
      ],
      explanation: "Folk dance has social roles — entertainment, marking life events, teaching history and values, building identity — as well as economic ones. It is not done only for money or tourists.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} watches a dance where one singer calls a line and the whole group sings back. What are these two performer roles?`,
    correct: "A soloist (who calls each line) and the chorus or response (who answer it together)",
    wrong: [
      "An instrumentalist and a dancer",
      "Two soloists taking turns, with no chorus",
      "A conductor and an audience",
    ],
    explanation: "Call-and-response singing uses a soloist to lead each line and a chorus (response) to answer. Instrumentalists play the music and dancers perform the movements.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} removes the drums from an isukuti performance to "keep it simple". How does this affect the dance?`,
      correct: "The dance loses its driving rhythm — the drums are the instrument component that sets the tempo the dancers move to",
      wrong: [
        "Nothing changes; drums are only decoration",
        "The dancers move faster without the noise",
        "The soloist can no longer sing without drums",
      ],
      explanation: "Instruments are a component of a folk dance: in isukuti the drums provide the rhythm the whole dance is built on, so removing them takes away the beat the dancers and singers rely on.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} threads a beaded necklace for a dance, choosing several colours and varying the bead sizes in a repeating pattern. Which technique and choices does this match?`,
    correct: "The one-way beading technique, with attention to colour variation and bead size",
    wrong: [
      "Tie and dye, with attention to circle size",
      "Appliqué, with attention to fabric contrast",
      "Cross-hatching, with attention to line spacing",
    ],
    explanation: "The ornament is made with the one-way beading technique — threading beads in one direction — considering colour variation and bead size, exactly as this sub-strand describes.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s group in ${place(rng)} performs a folk dance and sings the songs in the community's own indigenous language. Which subject does the design link this to?`,
      correct: "Indigenous languages — the dance songs are performed in indigenous languages",
      wrong: [
        "Mathematics — because the dancers count steps",
        "It links to no other subject",
        "Science — because singing uses breath",
      ],
      explanation: "The design links this sub-strand to Indigenous languages: the songs of a Kenyan folk dance are sung in the community's indigenous language.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} joins a group dance where everyone circles, then splits into two lines, then weaves between each other. What component of the dance is this?`,
    correct: "Formations and patterns — the shapes the dancers form and the pathways they trace",
    wrong: [
      "Costumes — the clothing worn",
      "Adornment — decoration on the body",
      "Props — objects the dancers carry",
    ],
    explanation: "Circling, forming lines and weaving are formations and patterns — one of the named components of a folk dance, describing the group shapes and floor pathways.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `During a fast dance in ${place(rng)}, ${who} swings a carried stick without checking who is nearby. Which performance component is being ignored?`,
      correct: "Safety and etiquette — dancing safely and with respect for the others around you",
      wrong: [
        "Songs — the words being sung",
        "Instruments — the drums and shakers",
        "Body adornment — decoration on the skin",
      ],
      explanation: "Safety and etiquette is a performance component: dancers must handle props carefully, stay aware of others, and behave respectfully during the dance.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says painting patterns onto the skin and wearing a beaded headdress are the same component. Is that right?`,
    correct: "No — painting the skin is body adornment; the beaded headdress is an ornament (a worn decorative item)",
    wrong: [
      "Yes — anything that decorates a dancer is called a costume",
      "Yes — both are called props",
      "No — both are actually formations",
    ],
    explanation: "Adornment is decoration applied to the body itself (paint, patterns); ornaments are worn items such as beadwork necklaces, bangles and headgear. They are separate components.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is told a folk dance has an economic role in the community, not only a social one. Which of these is an economic role?`,
      correct: "Dance groups earn fees performing at events and festivals, and costume and instrument makers earn from supplying them",
      wrong: [
        "It teaches children the community's stories",
        "It brings neighbours together for entertainment",
        "It marks a wedding or a funeral",
      ],
      explanation: "Economic roles involve earning income — performance fees, tourism, competition prizes, and work for costume, bead and drum makers. Teaching stories and marking events are social roles.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} needs to identify a dance from its background details: it belongs to the Maasai and its main feature is warriors leaping straight up as high as they can. Which dance is it?`,
    correct: "Adumu",
    wrong: ["Isukuti", "Chakacha", "Kilumi"],
    explanation: "Adumu is the Maasai warriors' jumping dance. Isukuti is a Luhya drum dance, chakacha is a coastal wedding dance, and kilumi is a Kamba women's drum dance.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sorts beads before threading an ornament, keeping the large and small beads separate. Why does bead size matter to the finished ornament?`,
      correct: "Varying bead size deliberately creates rhythm and texture in the pattern; mixing them at random can make it look untidy",
      wrong: [
        "Larger beads are the only ones that hold dye",
        "Bead size decides which community the dancer belongs to",
        "Size makes no difference; only colour matters",
      ],
      explanation: "This sub-strand asks learners to consider colour variation and bead size when making the ornament, because both are design choices that shape how the finished piece looks.",
    };
  },
];

const FILL_BLANK_TEMPLATES = [
  { before: "The Luhya folk dance performed to the fast beat of its own drums is called ", after: ".", correctAnswer: "isukuti" },
  { before: "The Maasai dance in which warriors leap straight upward is called ", after: ".", correctAnswer: "adumu" },
  { before: "The performer who leads the singing and calls out each line is the ", after: ".", correctAnswer: "soloist" },
  { before: "The group who answer the soloist's call, singing back together, are the ", after: ".", correctAnswer: "chorus", acceptedAnswers: ["chorus", "response", "chorus/response"] },
  { before: "The performer who plays the drums and keeps the rhythm is the ", after: ".", correctAnswer: "instrumentalist" },
  { before: "The special occasion a folk dance is performed for — a wedding, a funeral, a harvest — is called the ", after: ".", correctAnswer: "occasion" },
  { before: "The shapes the dancers form and the pathways they trace on the ground are the dance's ", after: ".", correctAnswer: "formations", acceptedAnswers: ["formations", "formations and patterns", "patterns"] },
  { before: "Decoration applied to the body itself, such as paint or patterns on the skin, is called body ", after: ".", correctAnswer: "adornment" },
  { before: "Worn decorative items such as beaded necklaces, bangles and headgear are called ", after: ".", correctAnswer: "ornaments", acceptedAnswers: ["ornaments", "ornament"] },
  { before: "Objects the dancers carry, such as sticks, shields or fly whisks, are called ", after: ".", correctAnswer: "props", acceptedAnswers: ["props", "prop"] },
  { before: "Threading beads in a single direction onto a string is the one-", after: " beading technique.", correctAnswer: "way" },
  { before: "Earning performance fees and selling costumes and instruments are the ", after: " roles of a folk dance in the community.", correctAnswer: "economic" },
] as const;

const IDENTIFY_DANCE_PROMPTS = [
  ...IDENTIFY_PROMPTS,
  "Which Kenyan folk dance is described here?",
  "Name the folk dance described.",
  "Which of these folk dances fits the description?",
] as const;

export const kenyanFolkDance: Skill = {
  id: "g5-cas-kenyan-folk-dance",
  code: "P.3",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-performing-displaying",
  grade: 5,
  title: "Kenyan folk dance",
  description:
    "The background of a Kenyan folk dance (name, community, occasion, and the soloist, chorus, instrumentalist and dancers); the components of a dance (songs, costumes, body movements, adornment, ornaments, formations, props, instruments, safety and etiquette); the social and economic roles of folk dance; and making a beaded ornament.",
  generate(rng) {
    const branch = randChoice(rng, [
      "identify-dance",
      "dance-fact-sort",
      "performer-match",
      "component-match",
      "role-sort",
      "bead-order",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "identify-dance") {
      const target = randChoice(rng, DANCES);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        DANCES.filter((d) => d.id !== target.id).map((d) => d.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${pickPrompt(rng, IDENTIFY_DANCE_PROMPTS)} It comes from the ${target.community} community and is ${target.feature}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Match both the community of origin and the dance's main feature or occasion.",
        explanation: `This is ${target.label} — a ${target.community} dance, ${target.feature}.`,
      };
    }

    if (branch === "dance-fact-sort") {
      const chosen = shuffle(rng, DANCE_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `df${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`df${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: DANCES.map((d) => ({ id: d.id, label: d.label })),
        correctBucket,
        hint: "Look for the community named, the instruments, and the occasion or signature movement.",
        explanation: chosen
          .map((f) => `"${f.text}" — ${DANCES.find((d) => d.id === f.id)!.label}.`)
          .join(" "),
      };
    }

    if (branch === "performer-match") {
      const chosen = shuffle(rng, PERFORMERS);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.role })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p) => (correctMap[p.id] = p.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "One leads the song, one answers it, one plays the music, and one performs the movements.",
        explanation: chosen.map((p) => `${p.label} — ${p.role}.`).join(" "),
      };
    }

    if (branch === "component-match") {
      const chosen = shuffle(rng, COMPONENTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.id, label: c.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((c) => (correctMap[c.id] = c.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Songs are sung; costumes are worn clothing; adornment is on the skin; ornaments are worn items; formations are group shapes; props are carried; instruments make the music.",
        explanation: chosen.map((c) => `${c.label} — ${c.desc}.`).join(" "),
      };
    }

    if (branch === "role-sort") {
      const chosen = shuffle(rng, ROLE_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `rf${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`rf${i}`] = f.role));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "social", label: "Social role" },
          { id: "economic", label: "Economic role" },
        ],
        correctBucket,
        hint: "Social roles bring people together and pass on culture; economic roles involve earning income.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.role} role.`).join(" "),
      };
    }

    if (branch === "bead-order") {
      const shuffled = shuffle(rng, BEAD_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (making a beaded ornament for a folk dance)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: BEAD_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Gather and sort the beads, plan the colour pattern, thread them one way, check the length, fasten the ends, then wear it.",
        explanation: "Correct order: " + BEAD_STEPS.map((s) => s.label).join(" → ") + ".",
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
        hint: "Think about the performer roles, the named components, the social vs economic roles, and the one-way beading choices.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const accepted = "acceptedAnswers" in fb && fb.acceptedAnswers ? fb.acceptedAnswers : [fb.correctAnswer];
    return {
      kind: "fill-blank",
      prompt: pickPrompt(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...accepted],
      inputMode: "text",
      hint: "Think about the dances and their communities, the four performer roles, the dance components, and the social vs economic roles.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
