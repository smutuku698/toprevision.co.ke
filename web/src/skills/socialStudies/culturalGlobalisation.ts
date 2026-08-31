import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ELEMENTS: { name: string; note: string }[] = [
  { name: "Music genres (e.g. Afrobeats, Benga)", note: "African music styles now enjoyed and performed by audiences worldwide" },
  { name: "Cuisine", note: "African dishes and ingredients that have spread and gained global popularity" },
  { name: "Fashion and textiles", note: "African prints and designs, like Kitenge and Ankara, worn internationally" },
  { name: "Storytelling and oral traditions", note: "African folktales and proverbs shared and studied around the world" },
  { name: "Sports", note: "African athletes and sporting traditions gaining global recognition" },
  { name: "Dance styles", note: "African dance forms performed and taught in studios and festivals across the world" },
  { name: "Visual art and sculpture", note: "African art styles exhibited in galleries and influencing artists internationally" },
  { name: "Film and cinema (e.g. Nollywood)", note: "African film industries reaching audiences on streaming platforms worldwide" },
  { name: "Traditional games", note: "African games such as Bao/Mancala variants played and studied in many countries" },
  { name: "Languages and proverbs", note: "African words and proverbs adopted or referenced in global popular culture" },
];

const QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Which factor has most helped spread African cultural elements globally in recent decades?",
    choices: ["Media, technology, and international travel/trade", "The disappearance of local languages", "A decrease in international trade", "Reduced use of the internet"],
    correctIndex: 0,
    explanation: "Media, digital technology, tourism, and trade have made it far easier for African music, fashion, food, and stories to reach global audiences.",
  },
  {
    prompt: "How can preserving African cultural practices support responsible global citizenship?",
    choices: ["It keeps cultural identity strong while still engaging respectfully with other cultures", "It requires rejecting all foreign cultural influence", "It has no connection to how people interact globally", "It only matters for tourism income"],
    correctIndex: 0,
    explanation: "Preserving cultural identity while engaging respectfully with the wider world helps people contribute to a shared global community without losing what makes their culture unique.",
  },
  {
    prompt: "Which African value is often highlighted as promoting a sense of common humanity globally?",
    choices: ["Ubuntu (\"I am because we are\") — communal responsibility for one another", "Strict individualism above all else", "Isolation from neighbouring communities", "Competition without cooperation"],
    correctIndex: 0,
    explanation: "Ubuntu emphasises that a person's humanity is bound up with others' — a value widely cited as an African contribution to global ideas of common humanity.",
  },
  {
    prompt: "A learner believes that cultural globalisation means African culture should be replaced by foreign trends. Is this correct?",
    choices: ["No — cultural globalisation is about African culture reaching and influencing the world, not being replaced", "Yes — globalisation always erases the original culture", "Yes — but only for younger generations", "No — but African culture should stay completely isolated instead"],
    correctIndex: 0,
    explanation: "Cultural globalisation is about African cultural elements gaining recognition and exchange globally — it is not about erasing African culture in favour of foreign trends.",
  },
  {
    prompt: "Why is mutual respect between cultures important for healthy global interconnectedness?",
    choices: ["It allows cultures to learn from and enrich each other without one dominating or erasing another", "It means every culture must become identical", "It is only relevant to international diplomats", "It prevents any cultural exchange from happening"],
    correctIndex: 0,
    explanation: "Mutual respect allows cultures to exchange and learn from each other fairly, without one culture dominating or erasing another.",
  },
  {
    prompt: "A local textile pattern becomes commercially mass-produced abroad without crediting or benefiting the community that created it. What issue does this raise?",
    choices: ["It raises concerns about fair recognition and benefit-sharing in cultural exchange", "It has no effect on the original community at all", "It automatically counts as preserving the culture", "It only affects fashion companies, not communities"],
    correctIndex: 0,
    explanation: "When cultural elements are used commercially without crediting or benefiting the originating community, it raises real concerns about fairness in cultural exchange.",
  },
];

const PRESERVATION_ITEMS: { text: string; bucket: "strategy" | "risk" }[] = [
  { text: "Teaching indigenous languages and oral traditions to younger generations", bucket: "strategy" },
  { text: "Documenting and archiving cultural practices in writing, audio, or video", bucket: "strategy" },
  { text: "Celebrating cultural festivals and heritage days publicly", bucket: "strategy" },
  { text: "Protecting cultural sites and artefacts through heritage laws", bucket: "strategy" },
  { text: "Sharing cultural practices respectfully with a global audience through digital platforms", bucket: "strategy" },
  { text: "Involving youth in cultural clubs and traditional ceremonies", bucket: "strategy" },
  { text: "Younger generations losing interest in traditional practices in favour of foreign trends", bucket: "risk" },
  { text: "Local languages declining as global languages dominate media and education", bucket: "risk" },
  { text: "Traditional crafts losing economic viability against cheaper mass-produced imports", bucket: "risk" },
  { text: "Cultural practices being commercialised in ways that strip away their original meaning", bucket: "risk" },
  { text: "Communities having little say or benefit when their cultural elements are used commercially abroad", bucket: "risk" },
];

const GLOBAL_STEPS = [
  { id: "local", label: "A cultural practice begins and is passed on within a local community" },
  { id: "document", label: "It is documented, performed publicly, or shared through local media" },
  { id: "expose", label: "Tourism, migration, or digital platforms expose it to wider audiences" },
  { id: "adopt", label: "People beyond the community begin adopting or celebrating it" },
  { id: "recognise", label: "It gains lasting global recognition and influence" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The process by which cultural elements spread and gain recognition across the world is called cultural ", after: ".", correctAnswer: "globalisation", accepted: ["globalisation", "globalization"], explanation: "Cultural globalisation is the process by which cultural elements spread and gain recognition worldwide." },
  { before: "The African value emphasising that a person's humanity is bound up with others' is called ", after: ".", correctAnswer: "Ubuntu", accepted: ["ubuntu"], explanation: "Ubuntu (\"I am because we are\") emphasises communal responsibility and shared humanity — a widely cited African contribution to global values." },
  { before: "The sense of belonging to, and identifying with, a particular group's traditions and practices is called cultural ", after: ".", correctAnswer: "identity", accepted: ["identity"], explanation: "Cultural identity is a person's sense of belonging to and identifying with their group's traditions and practices." },
  { before: "Growing connections and relationships between people and cultures across the world is called global ", after: ".", correctAnswer: "interconnectedness", accepted: ["interconnectedness"], explanation: "Interconnectedness describes the growing connections and relationships between people and cultures across the world." },
  { before: "The traditions, practices, and achievements passed down from earlier generations are called cultural ", after: ".", correctAnswer: "heritage", accepted: ["heritage"], explanation: "Cultural heritage is the traditions, practices, and achievements passed down from earlier generations." },
  { before: "Actively sharing and celebrating another culture's practices out of genuine respect is called cultural ", after: ".", correctAnswer: "appreciation", accepted: ["appreciation"], explanation: "Cultural appreciation is genuinely respectful sharing and celebration of another culture's practices, distinct from disrespectful copying." },
  { before: "Seeing yourself as belonging to, and responsible toward, the whole world community is called global ", after: ".", correctAnswer: "citizenship", accepted: ["citizenship"], explanation: "Global citizenship is seeing yourself as belonging to, and responsible toward, the wider world community." },
] as const;

export const culturalGlobalisation: Skill = {
  id: "ss-pdg-cultural-globalisation",
  code: "PDG.4",
  subjectId: "social-studies",
  strandId: "ss-pdg",
  grade: 9,
  title: "Cultural globalisation",
  description: "African cultural elements with global recognition, and how cultural globalisation promotes common humanity.",
  generate(rng) {
    const branch = randChoice(rng, ["elements", "why", "preserve", "fill-blank", "global-order"] as const);

    if (branch === "preserve") {
      const chosen = shuffle(rng, PRESERVATION_ITEMS).slice(0, 6);
      const items = chosen.map((it, i) => ({ id: `p${i}`, label: it.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((it, i) => (correctBucket[`p${i}`] = it.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement: is it a strategy that helps preserve cultural identity, or a risk that cultural globalisation can pose to it?",
        items,
        buckets: [
          { id: "strategy", label: "Helps preserve cultural identity" },
          { id: "risk", label: "A risk to cultural identity" },
        ],
        correctBucket,
        hint: "Strategies actively protect and pass on culture; risks are ways culture can be lost, weakened, or exploited unfairly.",
        explanation: chosen.map((it) => `"${it.text}" is ${it.bucket === "strategy" ? "a strategy that helps preserve cultural identity" : "a risk to cultural identity"}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about cultural globalisation.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe how cultures spread, connect, and are preserved.",
        explanation: fb.explanation,
      };
    }

    if (branch === "global-order") {
      const items = shuffle(rng, GLOBAL_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the stages by which a local cultural practice can gain global recognition, in a sensible order.",
        instruction: "Drag to reorder from the first stage to the last stage.",
        items,
        correctOrder: GLOBAL_STEPS.map((s) => s.id),
        hint: "A practice starts locally, gets documented or shared, is noticed by wider audiences, gets adopted, and finally gains lasting global recognition.",
        explanation: GLOBAL_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "elements") {
      const chosen = shuffle(rng, ELEMENTS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((e) => ({ id: e.name, label: e.name })));
      const targets = shuffle(rng, chosen.map((e) => ({ id: e.name, label: e.note })));
      const correctMap: Record<string, string> = {};
      for (const e of chosen) correctMap[e.name] = e.name;

      return {
        kind: "click-match",
        prompt: "Match each African cultural element to how it has gained global recognition.",
        tokens,
        targets,
        correctMap,
        hint: "Many African cultural elements are now enjoyed by people far beyond the continent.",
        explanation: chosen.map((e) => `${e.name} — ${e.note.toLowerCase()}.`).join(" "),
      };
    }

    const q = randChoice(rng, QUESTIONS);
    const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices: choices.map((c) => c.c),
      correctIndex: choices.findIndex((c) => c.correct),
      hint: "Think about how cultural globalisation involves exchange and recognition, not replacement or erasure.",
      explanation: q.explanation,
    };
  },
};
