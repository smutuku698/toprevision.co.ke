import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  TRUE_FALSE_PROMPTS,
  FILL_BLANK_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 3.0 Appreciation in Creative Arts, sub-strand 3.1
// "Analysis of Creative Arts works" (15 lessons).
//
// Mined verbatim: showcase artworks in a school gallery for critique (gallery walk
// considering type of art, materials, media and aesthetic); discuss a Kenyan folk dance
// using appropriate terminologies (components — community, occasion, participants, songs,
// body movement, formations, instruments, costumes, body adornment, ornament); discuss the
// East African Community Anthem — message, values, occasion and etiquette in performance;
// participate in ball games and athletics and appreciate the sports performances with focus
// on fair play and observance of the code of conduct (sportsmanship). Key inquiry: why is it
// important to showcase Creative Arts works? Core competencies: Communication and
// collaboration; Digital literacy; Citizenship; Learning to learn. Links: Integrated Science
// (manipulating digital devices for e-galleries); Indigenous languages (folk-dance songs).
// PCI: Analytical and creative thinking — so this skill carries Analyse/Evaluate-tier
// branches, per RIGOR-STANDARDS.md.
//
// Visual coverage: no gallery or anthem VisualSpec exists in the shared set; building one is
// out of scope for this pass. Recorded so the omission is deliberate.

const GALLERY_ASPECTS = [
  { id: "type", label: "Type of art", desc: "What kind of work it is — a drawing, painting, mosaic, card, puppet, decorated fabric or ornament" },
  { id: "materials", label: "Materials", desc: "What the work is physically made of — paper, fabric, wood, beads, banana fibre" },
  { id: "media", label: "Media", desc: "What was used to make the marks or colour — crayon, paint, dye, ink" },
  { id: "aesthetic", label: "Aesthetic", desc: "How pleasing the work looks — its colour, balance, texture and neatness" },
] as const;

const ANTHEM_ASPECTS = [
  { id: "message", label: "Message", desc: "It asks for the East African Community to be protected and blessed, and calls East Africans to live in unity, peace and love" },
  { id: "values", label: "Values", desc: "Unity, peace, love, cooperation and loyalty to the East African Community" },
  { id: "occasion", label: "Occasion", desc: "Sung at East African Community events, regional summits, and school and sports functions" },
  { id: "etiquette", label: "Etiquette in performance", desc: "Stand upright and still, stay silent, stop other activities, remove head coverings, and do not clap during it" },
] as const;

const SPORTSMANSHIP_FACTS = [
  { text: "Shaking hands with the other team before and after the game", fair: true },
  { text: "Accepting the referee's decision even when you disagree", fair: true },
  { text: "Congratulating the winners after losing a match", fair: true },
  { text: "Helping up an opponent who has fallen", fair: true },
  { text: "Playing by the rules and not cheating", fair: true },
  { text: "Trying your best for the whole game", fair: true },
  { text: "Arguing with and shouting at the umpire", fair: false },
  { text: "Gloating and mocking the other team after winning", fair: false },
  { text: "Tripping an opponent when the referee is not looking", fair: false },
  { text: "Sulking and refusing to play on after conceding a point", fair: false },
  { text: "Using rude or abusive language towards opponents", fair: false },
  { text: "Deliberately wasting time to stop the other team playing", fair: false },
] as const;

const DANCE_TERMS = [
  { id: "community", label: "Community of origin", desc: "The Kenyan people the dance belongs to" },
  { id: "occasion", label: "Occasion", desc: "The event the dance is performed for — a wedding, funeral, harvest or ceremony" },
  { id: "participants", label: "Participants", desc: "The soloist, chorus, instrumentalists and dancers who perform it" },
  { id: "formations", label: "Formations", desc: "The group shapes and floor pathways the dancers make" },
  { id: "adornment", label: "Body adornment", desc: "Decoration on the dancers' skin, such as paint or patterns" },
  { id: "ornament", label: "Ornaments", desc: "Worn decorative items such as beadwork and headgear" },
] as const;

const SHOWCASE_TF = [
  { text: "Showing artworks in a gallery lets others see, enjoy and learn from the work", isTrue: true },
  { text: "A gallery gives the artist useful feedback through critique", isTrue: true },
  { text: "Displaying work builds the artist's confidence and pride", isTrue: true },
  { text: "A school gallery shares the class's ideas with the whole school community", isTrue: true },
  { text: "Artworks on display should be spaced out safely, not crammed together", isTrue: true },
  { text: "Critique should be fair and about the work, not a personal attack on the artist", isTrue: true },
  { text: "There is no reason to show artwork to anyone once it is finished", isTrue: false },
  { text: "Good critique means only saying the work is bad, with no reasons", isTrue: false },
  { text: "A gallery walk means walking past without looking or discussing", isTrue: false },
  { text: "When discussing a folk dance, using the correct terms (formations, adornment, participants) makes the discussion clear", isTrue: true },
  { text: "During the East African Community Anthem, it is fine to keep chatting and moving about", isTrue: false },
  { text: "You should stand still and silent while the East African Community Anthem is performed", isTrue: true },
] as const;

const GALLERY_STEPS = [
  { id: "y1", label: "Prepare the display areas around the school with peers, using available resources" },
  { id: "y2", label: "Mount and arrange the portfolio artworks with safe, even spacing" },
  { id: "y3", label: "Take a gallery walk, looking closely at each work" },
  { id: "y4", label: "Discuss each work using the terms type of art, materials, media and aesthetic" },
  { id: "y5", label: "Give and receive fair critique, keeping comments about the work" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked the key inquiry question: why is it important to showcase Creative Arts works? Which answer is best?`,
      correct: "It lets others see and enjoy the work, gives the artist feedback through critique, and builds confidence and pride",
      wrong: [
        "It is only done to fill empty wall space in the school",
        "It is a way to hide the work from the rest of the school",
        "There is no real reason; work is shown only because the timetable says so",
      ],
      explanation: "Showcasing shares ideas with the community, invites useful critique, and builds the artist's confidence — the reasons this sub-strand asks learners to display and discuss their work.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `At a school gallery in ${place(rng)}, ${who} tells a classmate "your mosaic is rubbish and so are you". Is this fair critique, and why?`,
      correct: "No — fair critique comments on the work with reasons (e.g. the spacing or colour), never attacks the person",
      wrong: [
        "Yes — any strong opinion counts as critique",
        "Yes — critique should always be about the artist, not the work",
        "No — but only because the classmate might get upset, not because it is unfair",
      ],
      explanation: "Critique should be fair and specific, about choices in the work (materials, media, aesthetic), and respectful of the artist. A personal insult is not critique.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} loses a close rounders match, then walks over and congratulates the winning team. How would you describe this?`,
    correct: "Good sportsmanship — accepting the result gracefully and respecting the opponents",
    wrong: [
      "Poor sportsmanship — a loser should never speak to the winners",
      "Cheating — congratulating the winners breaks the rules",
      "It has nothing to do with sportsmanship",
    ],
    explanation: "Fair play and the code of conduct include accepting winning and losing gracefully; congratulating the winners after a loss is a clear sign of good sportsmanship.",
  }),
  (rng) => ({
    prompt: `During a football game in ${place(rng)}, ${name(rng)} disagrees with the referee and then trips an opponent while the referee looks away. Which parts of the code of conduct are broken?`,
    correct: "Respecting the referee's decision and playing without cheating or foul play",
    wrong: [
      "Only the rule about wearing the correct kit",
      "None — the referee did not see it, so nothing was broken",
      "Only the rule about arriving on time",
    ],
    explanation: "The code of conduct requires accepting officials' decisions and playing fairly. Arguing with the referee and deliberately tripping an opponent break both, whether or not the referee sees it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s class in ${place(rng)} stands to perform the East African Community Anthem. Which behaviour shows the correct etiquette?`,
      correct: "Standing upright and still, silent, with head coverings removed, until the anthem ends",
      wrong: [
        "Clapping and cheering all the way through it",
        "Sitting down and chatting quietly with a friend",
        "Walking around to find a better place to stand",
      ],
      explanation: "Anthem etiquette is to stand at attention, stay silent and still, stop other activities, and remove hats — showing respect for the East African Community.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} discusses a Kenyan folk dance and says "the people in a circle who make different shapes are the... um... the shapes". Which correct term should be used?`,
    correct: "Formations — the group shapes and floor pathways the dancers make",
    wrong: [
      "Ornaments — the worn decorative items",
      "Occasion — the event the dance is for",
      "Media — what marks were made with",
    ],
    explanation: "Discussing a folk dance with appropriate terminology means using words like formations, participants, adornment and occasion. The group shapes the dancers form are the formations.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} uses a tablet to explore an e-gallery of artworks from around the world for the analysis lesson. Which subject does the design link this to?`,
      correct: "Integrated Science — manipulating digital devices when exploring e-galleries",
      wrong: [
        "Kiswahili — because the artworks have Kiswahili titles",
        "It links to no other subject",
        "Agriculture — because some artworks show farms",
      ],
      explanation: "The design links this sub-strand to Integrated Science: learners manipulate digital devices to explore e-galleries for analysis.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is on a gallery walk and describes a classmate's work as "a mosaic, made from banana fibre and paper, pasted on a painted board, with neat even spacing". Which four things has ${name(rng)} covered?`,
    correct: "Type of art, materials, media, and aesthetic",
    wrong: [
      "Message, values, occasion, and etiquette",
      "Community, participants, formations, and ornaments",
      "Endurance, agility, balance, and coordination",
    ],
    explanation: "A gallery-walk discussion considers the type of art (mosaic), the materials (banana fibre, paper), the media (paste, paint on the board), and the aesthetic (neat, even spacing).",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sings the East African Community Anthem and is asked what its message is. Which answer is closest?`,
      correct: "It asks for the East African Community to be protected and blessed, and calls East Africans to live in unity, peace and love",
      wrong: [
        "It lists the rules of football and rounders",
        "It describes how to carve a rounders bat",
        "It is only about one country, not the whole community",
      ],
      explanation: "The anthem's message is a prayer for the East African Community's protection and blessing and a call for unity, peace, love and cooperation across the region.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} helps hang the class artworks and pushes them all tightly together to fit more on the wall. Why is even spacing better for a gallery?`,
    correct: "Spaced-out works are safer to move around and each one can be seen and discussed clearly on its own",
    wrong: [
      "Crammed works look more valuable",
      "Spacing is only about using less glue",
      "It makes no difference how the works are arranged",
    ],
    explanation: "The design notes arranging artworks with appropriate spacing during display, both for safety (people moving around) and so each work can be appreciated in its own right.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} performs a folk-dance song in the community's indigenous language during the analysis lesson. Which subject does the design link this to?`,
      correct: "Indigenous languages — the speaking skill is enhanced through performing folk-dance songs in indigenous languages",
      wrong: [
        "Mathematics — because the song has a beat count",
        "It links to no other subject",
        "Pre-Technical Studies — because the dance uses props",
      ],
      explanation: "The design links this sub-strand to Indigenous languages: performing folk-dance songs in indigenous languages develops the learner's speaking skill.",
    };
  },
];

const FILL_BLANK_TEMPLATES = [
  { before: "Showing finished artworks in a school gallery so others can see them and give feedback is called ", after: " the work.", correctAnswer: "showcasing", acceptedAnswers: ["showcasing", "displaying", "exhibiting"] },
  { before: "Fair, helpful comment on an artwork — about the work, not the artist — is called ", after: ".", correctAnswer: "critique" },
  { before: "On a gallery walk, learners discuss the type of art, the materials, the media, and the ", after: " of each work.", correctAnswer: "aesthetic" },
  { before: "What an artwork is physically made of — paper, fabric, wood, beads — is its ", after: ".", correctAnswer: "materials", acceptedAnswers: ["materials", "material"] },
  { before: "What was used to make the marks or colour — crayon, paint, dye, ink — is the ", after: ".", correctAnswer: "media", acceptedAnswers: ["media", "medium"] },
  { before: "The anthem of the regional bloc that Kenya belongs to, sung in Kiswahili, is the East African ", after: " Anthem.", correctAnswer: "Community" },
  { before: "The values carried by the East African Community Anthem include unity, peace and ", after: ".", correctAnswer: "love" },
  { before: "During the East African Community Anthem you should stand still and stay ", after: ".", correctAnswer: "silent", acceptedAnswers: ["silent", "quiet"] },
  { before: "Playing by the rules, respecting the referee and accepting the result gracefully is called ", after: ".", correctAnswer: "sportsmanship", acceptedAnswers: ["sportsmanship", "fair play"] },
  { before: "The group shapes and floor pathways dancers make in a folk dance are called ", after: ".", correctAnswer: "formations", acceptedAnswers: ["formations", "formation"] },
  { before: "The soloist, chorus, instrumentalists and dancers of a folk dance are together called the ", after: ".", correctAnswer: "participants" },
  { before: "Artworks in a gallery should be arranged with appropriate ", after: " so each can be seen and people can move safely.", correctAnswer: "spacing" },
] as const;

export const analysisOfCreativeArtsWorks: Skill = {
  id: "g5-cas-analysis-of-creative-arts-works",
  code: "A.1",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-appreciation",
  grade: 5,
  title: "Analysis of creative arts works",
  description:
    "Showcasing artworks in a school gallery and giving fair critique (type of art, materials, media, aesthetic); discussing a Kenyan folk dance with correct terminology; the message, values, occasion and performance etiquette of the East African Community Anthem; and fair play and the code of conduct (sportsmanship) in games and athletics.",
  generate(rng) {
    const branch = randChoice(rng, [
      "gallery-aspect-match",
      "gallery-aspect-sort",
      "anthem-aspect-match",
      "sportsmanship-sort",
      "dance-term-match",
      "gallery-order",
      "showcase-tf",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "gallery-aspect-match") {
      const chosen = shuffle(rng, GALLERY_ASPECTS);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((a) => (correctMap[a.id] = a.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Type = what kind of work; materials = what it is made of; media = what made the marks; aesthetic = how pleasing it looks.",
        explanation: chosen.map((a) => `${a.label} — ${a.desc}.`).join(" "),
      };
    }

    if (branch === "gallery-aspect-sort") {
      const examples = [
        { text: "It is a painting", id: "type" },
        { text: "It is a decorated fabric", id: "type" },
        { text: "It is made of banana fibre and recycled paper", id: "materials" },
        { text: "It is made of beads on a string", id: "materials" },
        { text: "It was coloured using dye", id: "media" },
        { text: "It was drawn with crayon", id: "media" },
        { text: "The colours are balanced and the spacing is neat", id: "aesthetic" },
        { text: "It has a pleasing texture and tidy edges", id: "aesthetic" },
      ];
      const chosen = shuffle(rng, examples).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `ga${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`ga${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: GALLERY_ASPECTS.map((a) => ({ id: a.id, label: a.label })),
        correctBucket,
        hint: "Sort each comment by whether it is about the type of art, the materials, the media, or the aesthetic.",
        explanation: chosen
          .map((f) => `"${f.text}" — ${GALLERY_ASPECTS.find((a) => a.id === f.id)!.label}.`)
          .join(" "),
      };
    }

    if (branch === "anthem-aspect-match") {
      const chosen = shuffle(rng, ANTHEM_ASPECTS);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.label })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.id, label: a.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((a) => (correctMap[a.id] = a.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Message = what it says; values = what it stands for; occasion = when it is sung; etiquette = how to behave during it.",
        explanation: chosen.map((a) => `${a.label} — ${a.desc}.`).join(" "),
      };
    }

    if (branch === "sportsmanship-sort") {
      const chosen = shuffle(rng, SPORTSMANSHIP_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `sp${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`sp${i}`] = f.fair ? "fair" : "poor"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "fair", label: "Good sportsmanship" },
          { id: "poor", label: "Poor sportsmanship" },
        ],
        correctBucket,
        hint: "Good sportsmanship: play by the rules, respect the referee and opponents, win and lose gracefully. Poor: arguing, cheating, gloating, sulking, foul language.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.fair ? "good" : "poor"} sportsmanship.`).join(" "),
      };
    }

    if (branch === "dance-term-match") {
      const chosen = shuffle(rng, DANCE_TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.desc })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((t) => (correctMap[t.id] = t.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "These are the correct terms for discussing a Kenyan folk dance in the appreciation lesson.",
        explanation: chosen.map((t) => `${t.label} — ${t.desc}.`).join(" "),
      };
    }

    if (branch === "gallery-order") {
      const shuffled = shuffle(rng, GALLERY_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (setting up and running a school gallery for critique)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: GALLERY_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Prepare the display areas, mount the works with spacing, take a gallery walk, discuss each work by type/materials/media/aesthetic, then give fair critique.",
        explanation: "Correct order: " + GALLERY_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "showcase-tf") {
      const chosen = shuffle(rng, SHOWCASE_TF).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `t${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`t${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, TRUE_FALSE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "Showcasing shares ideas and invites fair critique; a gallery walk means looking and discussing; anthem etiquette means standing still and silent.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
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
        hint: "Judge whether a critique is fair, whether a sports moment shows good sportsmanship, and use the correct terms for the dance and the anthem.",
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
      hint: "Think about the gallery-walk aspects (type, materials, media, aesthetic), the EAC Anthem (message, values, occasion, etiquette), and sportsmanship.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
