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
  IDENTIFY_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 2.0 Performing and Displaying, sub-strand 2.2 "Fabric
// Decoration" (10 lessons).
//
// Mined verbatim: Materials (dyes, tying materials, cotton fabric, dye fasteners); Tie and
// dye (circles); Appliqué. Learning experiences: prepare the dye bath (primary colour) using
// dyes, water and fasteners; tie the fabric in varied ways using circle techniques; dye in
// one colour, untie and iron; decorate with appliqué focusing on contrast of the surface and
// pasted fabrics (colour/patterns) using stitching or pasting; neaten by trimming and
// ironing. Key inquiry: why is fabric decoration important? What are the sources of natural
// dyes? Core competencies: Digital literacy; Creativity and imagination. Link to other
// learning area: Agriculture.
//
// Visual coverage: no tie-and-dye or appliqué VisualSpec exists in the shared set; building
// one is out of scope for this pass. Recorded so the omission is deliberate.

const TECH_FACTS = [
  { text: "The fabric is bound tightly in circles with string before it goes into the dye", id: "tie-dye" },
  { text: "The tied areas resist the dye and stay pale, leaving ring patterns", id: "tie-dye" },
  { text: "The whole cloth is dyed one colour, then untied and ironed", id: "tie-dye" },
  { text: "Shapes are cut from one fabric and fixed onto a different background fabric", id: "applique" },
  { text: "The pieces are attached by stitching them down or pasting them with adhesive", id: "applique" },
  { text: "The pasted shapes are chosen to contrast in colour or pattern with the background", id: "applique" },
  { text: "Loose threads and edges are trimmed and the work is ironed flat to neaten it", id: "applique" },
  { text: "Rubber bands or string are used to make the resist areas", id: "tie-dye" },
] as const;

const DYE_SOURCE_FACTS = [
  { text: "Turmeric root (gives yellow)", natural: true },
  { text: "Onion skins (give yellow-brown)", natural: true },
  { text: "Tea or coffee (give brown)", natural: true },
  { text: "Hibiscus or marigold flowers", natural: true },
  { text: "Tree bark and roots", natural: true },
  { text: "Beetroot (gives pink-red)", natural: true },
  { text: "A packet of factory-made powder dye", natural: false },
  { text: "Synthetic fabric colour bought in a bottle", natural: false },
  { text: "Charcoal or soot (gives grey-black)", natural: true },
  { text: "Chemical clothing dye made in a factory", natural: false },
] as const;

const MATERIALS = [
  { id: "dye", label: "Dye", job: "Adds the colour to the fabric" },
  { id: "tying-material", label: "Tying material (string, rubber bands)", job: "Binds parts of the fabric so the dye cannot reach them, making the resist pattern" },
  { id: "fastener", label: "Dye fastener (fixative, e.g. salt)", job: "Fixes the colour into the fibres so it does not wash out or fade quickly" },
  { id: "cotton", label: "Cotton fabric", job: "The plain natural-fibre base cloth that takes the dye well and is decorated" },
  { id: "needle-thread", label: "Needle and thread (or adhesive)", job: "Attaches the cut appliqué shapes onto the background fabric" },
] as const;

const TIEDYE_STEPS = [
  { id: "d1", label: "Collect the materials — cotton fabric, dye, water, tying string and a fastener" },
  { id: "d2", label: "Prepare the dye bath by mixing the dye (a primary colour) with water and the fastener" },
  { id: "d3", label: "Tie the fabric tightly in circles with string or rubber bands" },
  { id: "d4", label: "Wet the tied fabric and lower it into the dye bath" },
  { id: "d5", label: "Leave it in the one-colour dye for the right length of time" },
  { id: "d6", label: "Lift it out, rinse off the extra dye, and untie the string" },
  { id: "d7", label: "Dry the fabric, then iron it flat" },
] as const;

const APPLIQUE_STEPS = [
  { id: "p1", label: "Choose a background fabric and fabric of a contrasting colour or pattern for the shapes" },
  { id: "p2", label: "Draw and cut out the shapes from the contrasting fabric" },
  { id: "p3", label: "Arrange the cut shapes on the background to plan the design" },
  { id: "p4", label: "Attach the shapes by stitching them down or pasting them with adhesive" },
  { id: "p5", label: "Trim any loose threads and untidy edges" },
  { id: "p6", label: "Iron the finished piece flat to neaten it" },
] as const;

const IMPORTANCE_TF = [
  { text: "Fabric decoration turns plain cloth into something attractive and personal", isTrue: true },
  { text: "Decorated fabrics can be sold, so the skill can earn an income", isTrue: true },
  { text: "Tie and dye and appliqué let people express ideas, patterns and culture on cloth", isTrue: true },
  { text: "Using recyclable fabric to decorate reduces waste", isTrue: true },
  { text: "A dye fastener helps the colour last through many washes", isTrue: true },
  { text: "Fabric decoration has no use and is never done outside a lesson", isTrue: false },
  { text: "Natural dyes can only come from a factory", isTrue: false },
  { text: "In tie and dye, the tied parts come out the darkest because the string pulls in dye", isTrue: false },
  { text: "Appliqué shapes look best when they are the exact same colour as the background", isTrue: false },
  { text: "Ironing the finished fabric helps set the design and gives a neat surface", isTrue: true },
  { text: "Tying the fabric loosely gives the sharpest circle pattern", isTrue: false },
  { text: "Cotton, a natural plant fibre, absorbs dye well", isTrue: true },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} makes a tie and dye cloth but skips the fastener when mixing the dye bath. What is the likely result after the cloth is washed?`,
      correct: "The colour fades or washes out, because the fastener is what fixes the dye into the fibres",
      wrong: [
        "The colour turns permanently black no matter which dye was used",
        "The cloth shrinks to half its size",
        "Nothing changes; a fastener makes no difference to a finished cloth",
      ],
      explanation: "A dye fastener (fixative, such as salt) bonds the dye to the fabric fibres so it resists washing and light. Without it, much of the colour rinses away.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} ties the fabric only loosely before dyeing and gets blurry, faint rings instead of clear circles. What went wrong?`,
    correct: "The bindings must be tight — tight ties stop the dye seeping in, giving sharp pale circles",
    wrong: [
      "The dye bath was too cold; tightness of the tie does not matter",
      "The fabric should have been dyed before it was tied",
      "Loose ties give the sharpest pattern; the dye was the problem",
    ],
    explanation: "In tie and dye, the tied areas resist the dye and stay pale. If the string is loose, dye seeps under it and the circles come out blurred.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} does an appliqué design using dark green shapes on a dark green background. The shapes are hard to see. Which idea from the sub-strand was missed?`,
      correct: "Contrast — the pasted shapes should contrast in colour or pattern with the background so they stand out",
      wrong: [
        "The shapes should always be sewn, never pasted",
        "Appliqué shapes must be exactly the same colour as the background",
        "The background should have been dyed in circles first",
      ],
      explanation: "Appliqué in this sub-strand emphasises contrast of the surface and the pasted fabrics in colour or pattern; matching colours make the design disappear.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s class in ${place(rng)} wants a natural dye rather than a factory powder. Which of these is a source of natural dye?`,
    correct: "Onion skins, which give a yellow-brown colour",
    wrong: [
      "A sealed packet of synthetic powder dye",
      "A bottle of factory-made fabric colour",
      "Bleach, which removes colour rather than adding it",
    ],
    explanation: "Natural dyes come from plants and other natural materials — onion skins, turmeric, tea, tree bark, flowers, charcoal. Factory powders and bottled colours are artificial.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why fabric decoration is a useful skill to learn. Which answer is best?`,
      correct: "It makes plain cloth attractive, lets people express ideas and culture, and can be sold to earn an income",
      wrong: [
        "It is only useful for passing a Creative Arts test",
        "It has no purpose outside the classroom",
        "It is done only to use up old dye",
      ],
      explanation: "Fabric decoration adds value and beauty to cloth, is a form of cultural and personal expression, and is a marketable skill — which is why the sub-strand asks why it is important.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} dyes a tied cloth, then irons it while still soaking wet and dripping. Why wait until it is dry before ironing?`,
    correct: "Ironing is done after drying to set the design and give a neat, flat surface; a soaking cloth cannot be pressed properly",
    wrong: [
      "Ironing a wet cloth adds a second colour automatically",
      "A wet cloth should never be dyed in the first place",
      "Ironing order makes no difference to the result",
    ],
    explanation: "The tie and dye sequence is dye, rinse, untie, dry, then iron. Ironing sets and neatens the dry cloth; a wet cloth just steams and stays creased.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} chooses cloth for tie and dye and picks plain white cotton rather than shiny synthetic cloth. Why is cotton a good choice?`,
      correct: "Cotton is a natural plant fibre that absorbs dye well, so the colour takes evenly and deeply",
      wrong: [
        "Cotton cannot be tied, so the pattern is automatic",
        "Cotton needs no fastener because it never fades",
        "Cotton is chosen only because it is the cheapest cloth",
      ],
      explanation: "Cotton is a natural fibre that takes up water-based dye readily, giving strong, even colour. Many synthetics resist dye and come out patchy.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} studies where dyes and fibres come from for fabric decoration. Which subject does the design link this sub-strand to?`,
    correct: "Agriculture — studying materials and techniques of fabric decoration, including dye and fibre sources",
    wrong: [
      "Mathematics — because circles are geometric",
      "It links to no other subject",
      "Music — because tie and dye has a rhythm",
    ],
    explanation: "The design links this sub-strand to Agriculture: learners study the materials of fabric decoration, including where natural dyes and fibres come from.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} attaches appliqué shapes but leaves loose threads hanging and does not press the work. What two finishing steps were skipped?`,
      correct: "Trimming the loose threads and untidy edges, and ironing the piece flat to neaten it",
      wrong: [
        "Tying the shapes in circles and dyeing them",
        "Adding a fastener and rinsing the shapes",
        "Cutting the background fabric smaller than the shapes",
      ],
      explanation: "Appliqué is neatened by trimming loose threads and rough edges and then ironing the piece flat — the two finishing steps this sub-strand names.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} mixes the dye bath and adds salt as a fastener. What is the fastener actually doing in the process?`,
    correct: "Helping the dye bond to the cotton fibres so the colour stays fixed and does not wash out",
    wrong: [
      "Making the water boil faster",
      "Changing the dye from a primary to a secondary colour",
      "Softening the string used to tie the fabric",
    ],
    explanation: "A fastener (fixative) such as salt helps the dye molecules attach firmly to the fibres, fixing the colour so it lasts through washing and wear.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "The fabric decoration technique in which cloth is bound tightly in circles before being dyed one colour is called tie and ", after: ".", correctAnswer: "dye" },
  { before: "The fabric decoration technique in which cut shapes are stitched or pasted onto a background fabric is called ", after: ".", correctAnswer: "appliqué", acceptedAnswers: ["appliqué", "applique"] },
  { before: "In tie and dye, the tied areas resist the dye and come out ", after: " than the rest of the cloth.", correctAnswer: "paler", acceptedAnswers: ["paler", "lighter"] },
  { before: "The material added to a dye bath to fix the colour so it does not wash out is called a dye ", after: ".", correctAnswer: "fastener", acceptedAnswers: ["fastener", "fixative", "mordant"] },
  { before: "A common household dye fastener for cotton is ", after: ".", correctAnswer: "salt" },
  { before: "The plain natural-fibre cloth used as the base for decoration in this sub-strand is ", after: " fabric.", correctAnswer: "cotton" },
  { before: "Turmeric, onion skins, tea and tree bark are all sources of ", after: " dye.", correctAnswer: "natural" },
  { before: "In appliqué, the pasted shapes should ", after: " with the background in colour or pattern so they stand out.", correctAnswer: "contrast" },
  { before: "In tie and dye, the fabric is bound with string or rubber bands into ", after: " shapes.", correctAnswer: "circles", acceptedAnswers: ["circles", "circle"] },
  { before: "After dyeing, the cloth is rinsed, untied, dried and then ", after: " flat to neaten it.", correctAnswer: "ironed", acceptedAnswers: ["ironed", "iron"] },
  { before: "Appliqué shapes are attached by stitching them down or ", after: " them with adhesive.", correctAnswer: "pasting", acceptedAnswers: ["pasting", "gluing"] },
  { before: "The dye bath is made by mixing dye, water and a ", after: ".", correctAnswer: "fastener", acceptedAnswers: ["fastener", "fixative"] },
] as const;

const IDENTIFY_TECH_PROMPTS = [
  ...IDENTIFY_PROMPTS,
  "Which fabric decoration technique is described here?",
  "Name the technique described.",
  "Which of these fabric decoration techniques fits the description?",
] as const;

export const fabricDecoration: Skill = {
  id: "g5-cas-fabric-decoration",
  code: "P.2",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-performing-displaying",
  grade: 5,
  title: "Fabric decoration",
  description:
    "The materials for fabric decoration (dyes, tying materials, cotton fabric, dye fasteners); decorating cloth with the tie and dye (circles) technique; decorating cloth with appliqué using contrast and stitching or pasting; and the sources of natural dyes.",
  generate(rng) {
    const branch = randChoice(rng, [
      "identify-technique",
      "technique-sort",
      "dye-source-sort",
      "material-job-match",
      "process-order",
      "importance-tf",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "identify-technique") {
      const isTieDye = rng() < 0.5;
      const target = isTieDye ? "Tie and dye" : "Appliqué";
      const other = isTieDye ? "Appliqué" : "Tie and dye";
      const fact = randChoice(rng, TECH_FACTS.filter((f) => (isTieDye ? f.id === "tie-dye" : f.id === "applique")));
      const choices = shuffle(rng, [target, other]);
      return {
        kind: "multiple-choice",
        prompt: `${pickPrompt(rng, IDENTIFY_TECH_PROMPTS)} ${fact.text}.`,
        choices,
        correctIndex: choices.indexOf(target),
        layout: "row",
        hint: "Tie and dye means binding and dyeing one cloth; appliqué means fixing cut shapes onto a background.",
        explanation: `This describes ${target.toLowerCase()}: ${fact.text.toLowerCase()}.`,
      };
    }

    if (branch === "technique-sort") {
      const chosen = shuffle(rng, TECH_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `t${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`t${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "tie-dye", label: "Tie and dye" },
          { id: "applique", label: "Appliqué" },
        ],
        correctBucket,
        hint: "Tie and dye: bind, dye one colour, untie, iron. Appliqué: cut shapes, contrast, stitch or paste, trim, iron.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.id === "tie-dye" ? "tie and dye" : "appliqué"}.`).join(" "),
      };
    }

    if (branch === "dye-source-sort") {
      const chosen = shuffle(rng, DYE_SOURCE_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `ds${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`ds${i}`] = f.natural ? "natural" : "artificial"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "natural", label: "Natural dye source" },
          { id: "artificial", label: "Artificial (factory-made) dye" },
        ],
        correctBucket,
        hint: "Natural dyes come from plants and natural materials — roots, leaves, flowers, bark, tea, charcoal. Powders and bottled colours from a factory are artificial.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.natural ? "natural" : "artificial"}.`).join(" "),
      };
    }

    if (branch === "material-job-match") {
      const chosen = shuffle(rng, MATERIALS);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.job })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((m) => (correctMap[m.id] = m.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Dye adds colour; tying material makes the resist; the fastener fixes the colour; cotton is the base; a needle and thread or glue attach appliqué shapes.",
        explanation: chosen.map((m) => `${m.label} — ${m.job}.`).join(" "),
      };
    }

    if (branch === "process-order") {
      const useTieDye = rng() < 0.5;
      const steps: readonly { id: string; label: string }[] = useTieDye ? TIEDYE_STEPS : APPLIQUE_STEPS;
      const label = useTieDye ? "tie and dye" : "appliqué";
      const shuffled = shuffle(rng, steps);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (decorating a fabric using ${label})`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: steps.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: useTieDye
          ? "Gather materials, make the dye bath, tie in circles, dip, wait, rinse and untie, then dry and iron."
          : "Choose contrasting fabrics, cut the shapes, arrange, attach by stitching or pasting, trim, then iron.",
        explanation: "Correct order: " + steps.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "importance-tf") {
      const chosen = shuffle(rng, IMPORTANCE_TF).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `i${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`i${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, TRUE_FALSE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "Fabric decoration adds beauty and value, expresses culture, can earn money, and reuses cloth; tight ties, a fastener, contrast, and ironing all matter.",
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
        hint: "Think about what the fastener does, why ties must be tight, why appliqué needs contrast, and which dye sources are natural.",
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
      hint: "Think about tie and dye vs appliqué, the four named materials (dye, tying material, cotton, fastener), and natural dye sources.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
