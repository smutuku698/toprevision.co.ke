import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, place, type ScenarioMC } from "./shared";

// KICD Grade 7 HRE, Strand 6.0 → Sub-strand 6.1 "Religious Ceremonies" (15 lessons).
// Source discrepancy, resolved per curriculum-reference/grade-7/hindu-religious-education.json:
// the sub-strand bullet list names FOUR ceremonies (Jatkaram, Naamkaran, Sikh naming ceremony,
// Dastar Bandhan) while the outcomes/rubric text says "the three selected religious ceremonies".
// Resolution: all four named bullets are implemented — covering four cannot fail a rubric graded on
// three, whereas dropping a named item risks a real omission.
//
// Visual scope: declined — see curriculum-reference/grade-7/hindu-religious-education.json →
// visualCoverageDecision.

const MEANING_MATCH_PROMPTS = [
  "Match each religious ceremony to what it involves.",
  "Pair each ceremony with what it involves.",
  "Connect each religious ceremony to its correct description.",
  "Link each ceremony below to what it involves.",
  "Match each ceremony to its meaning.",
  "Choose the correct description for each religious ceremony.",
];

const TRADITION_SORT_PROMPTS = [
  "Sort each ceremony under the tradition it belongs to.",
  "Group each ceremony under the tradition it comes from.",
  "Sort these ceremonies by faith tradition.",
  "Decide which tradition each ceremony belongs to, and sort it there.",
  "Place each ceremony into the correct tradition.",
  "Categorise each ceremony by the tradition it belongs to.",
];

const FACT_SORT_PROMPTS = [
  "Sort each description under the ceremony it describes.",
  "Group these descriptions under the ceremony each one belongs to.",
  "Decide which ceremony each description matches, and sort it there.",
  "Sort each fact into the correct ceremony.",
  "Place each description under the ceremony it belongs to.",
  "Read each fact and sort it under the matching ceremony.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
];

const CEREMONIES = [
  {
    id: "jatkaram",
    label: "Jatkaram",
    tradition: "Sanatan/Vedic",
    stage: "Birth",
    meaning:
      "The birth ceremony performed shortly after a baby is born, welcoming the new life with prayers and traditional rites",
  },
  {
    id: "naamkaran",
    label: "Naamkaran",
    tradition: "Sanatan/Vedic",
    stage: "Naming",
    meaning: "The formal naming ceremony, held some days after birth, in which the family and priest choose and bless the baby's name",
  },
  {
    id: "sikh-naming",
    label: "Sikh naming ceremony",
    tradition: "Sikh",
    stage: "Naming",
    meaning:
      "Held at the gurdwara; the Guru Granth Sahib is opened at random and the baby is given a name beginning with the first letter of the first word on that page",
  },
  {
    id: "dastar-bandhan",
    label: "Dastar Bandhan (tying the turban)",
    tradition: "Sikh",
    stage: "Coming-of-age",
    meaning: "A ceremony in which a young Sikh is formally tied their first turban, marking a step into greater responsibility and identity",
  },
] as const;

// 14 facts across the four ceremonies — past the 10-fact floor.
const CEREMONY_FACTS: { text: string; ceremony: string }[] = [
  { text: "Performed shortly after birth, welcoming the new life with prayers and traditional rites", ceremony: "jatkaram" },
  { text: "One of the earliest rites performed for a Sanatan/Vedic child", ceremony: "jatkaram" },
  { text: "Marks the very first ceremony a Sanatan/Vedic family performs for their baby", ceremony: "jatkaram" },
  { text: "Held some days after birth, once the family and priest are ready", ceremony: "naamkaran" },
  { text: "The family and priest choose and bless the baby's name", ceremony: "naamkaran" },
  { text: "Comes after Jatkaram in a Sanatan/Vedic child's early ceremonies", ceremony: "naamkaran" },
  { text: "Performed at the gurdwara, before the Guru Granth Sahib", ceremony: "sikh-naming" },
  { text: "The scripture is opened at random to choose the first letter of the baby's name", ceremony: "sikh-naming" },
  { text: "Connects a Sikh child's identity to the scripture from their earliest days", ceremony: "sikh-naming" },
  { text: "Performed years after birth, not in infancy", ceremony: "dastar-bandhan" },
  { text: "A young Sikh is formally tied their first turban", ceremony: "dastar-bandhan" },
  { text: "Marks a step into greater responsibility and identity, not simply a birth rite", ceremony: "dastar-bandhan" },
  { text: "Comes later in childhood, after the Sikh naming ceremony", ceremony: "dastar-bandhan" },
  { text: "A visible marker of growing into a fuller Sikh identity", ceremony: "dastar-bandhan" },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} performs prayers and traditional rites for their new baby just days after the birth. Which ceremony is this?`,
      correct: "Jatkaram — the Sanatan/Vedic birth ceremony performed shortly after a baby is born",
      wrong: [
        "Naamkaran — which is the later naming ceremony, not the first rite after birth",
        "Dastar Bandhan — which happens years later, not shortly after birth",
        "Sikh naming ceremony — which belongs to the Sikh tradition, not this family's",
      ],
      explanation: "Jatkaram is the birth ceremony performed shortly after birth — the earliest of the Sanatan/Vedic rites described here.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A priest and ${who}'s family in ${place(rng)} gather some days after the baby's birth to formally choose and bless the child's name. Which ceremony is this?`,
      correct: "Naamkaran — the formal naming ceremony held some days after birth",
      wrong: [
        "Jatkaram — the birth ceremony performed immediately, not the later naming",
        "Sikh naming ceremony — which involves opening the Guru Granth Sahib, not a priest choosing a name directly",
        "Dastar Bandhan — a turban-tying ceremony, not a naming ceremony",
      ],
      explanation: "Naamkaran is specifically the formal naming ceremony, distinct from the earlier birth ceremony, Jatkaram.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `At the gurdwara in ${place(rng)}, the Guru Granth Sahib is opened at random and ${who}'s baby is given a name starting with the first letter on that page. Which ceremony is this?`,
      correct: "The Sikh naming ceremony — the Guru Granth Sahib is opened at random to choose the name's first letter",
      wrong: [
        "Naamkaran — the Sanatan/Vedic naming ceremony, which does not use the Guru Granth Sahib",
        "Dastar Bandhan — a turban-tying ceremony for an older child, not a naming ceremony",
        "Jatkaram — the Sanatan/Vedic birth ceremony, not the Sikh naming ceremony",
      ],
      explanation: "Opening the Guru Granth Sahib at random to select a name's first letter is specific to the Sikh naming ceremony.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Years after his naming ceremony, ${who} is formally tied his first turban at the gurdwara in ${place(rng)}, marking his growing responsibility. Which ceremony is this?`,
      correct: "Dastar Bandhan — the ceremony in which a young Sikh is formally tied their first turban",
      wrong: [
        "Sikh naming ceremony — which happens in infancy, not years later",
        "Jatkaram — a Sanatan/Vedic birth ceremony, not a Sikh coming-of-age rite",
        "Naamkaran — a naming ceremony, not a turban-tying ceremony",
      ],
      explanation: "Dastar Bandhan is the later ceremony of formally tying a young Sikh's first turban, marking a step into greater responsibility.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is comparing Jatkaram and the Sikh naming ceremony for a class chart in ${place(rng)} and needs one genuine similarity between them. Which is correct?`,
      correct: "Both take place close to a child's birth, though they belong to different traditions and involve different rites",
      wrong: [
        "Both involve opening the Guru Granth Sahib at random",
        "Both are performed years after birth, in later childhood",
        "Both are ceremonies of tying a turban",
      ],
      explanation: "Jatkaram and the Sikh naming ceremony are both performed close to birth, even though their specific rites differ — Jatkaram is Sanatan/Vedic prayers and rites, the Sikh naming ceremony centres on the Guru Granth Sahib.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} explains to a classmate in ${place(rng)} why Dastar Bandhan is different in kind from the other three ceremonies in this sub-strand. What is the best explanation?`,
      correct: "The other three all happen close to birth, while Dastar Bandhan happens years later, in childhood, marking growth rather than arrival",
      wrong: [
        "Dastar Bandhan is the only one of the four that takes place at a gurdwara",
        "Dastar Bandhan is the only one of the four connected to the Sikh tradition",
        "Dastar Bandhan is the only one of the four that involves a family gathering",
      ],
      explanation: "Dastar Bandhan stands apart by timing, not by tradition or location — it happens later in childhood, marking a step into responsibility, unlike the birth-and-naming rites of the other three.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} asks why a Sanatan/Vedic family performs two separate ceremonies — Jatkaram and then Naamkaran — instead of just one. What is the best explanation?`,
      correct: "Jatkaram welcomes the new life shortly after birth, while Naamkaran is the separate, later ceremony where the name itself is formally chosen and blessed",
      wrong: [
        "The two ceremonies are actually identical and are simply performed twice for good luck",
        "Jatkaram is only performed if the baby is born unwell",
        "Naamkaran replaces Jatkaram entirely in most families",
      ],
      explanation: "Jatkaram and Naamkaran serve two distinct purposes at two different times — welcoming the child, then formally naming the child — rather than being the same rite repeated.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} interprets the significance of Jatkaram for a class presentation in ${place(rng)}. Which interpretation best matches what the ceremony actually does?`,
    correct: "It formally welcomes a new life into the family and community through prayer, close to the moment of birth",
    wrong: [
      "It formally hands over parenting responsibility to the priest",
      "It replaces the need for a later naming ceremony",
      "It is performed only if the family can afford a large celebration",
    ],
    explanation: "Jatkaram's significance is welcoming the new life with prayer and traditional rites — it neither replaces Naamkaran nor transfers parental responsibility.",
  }),
  (rng) => ({
    prompt: `${name(rng)} interprets the significance of Dastar Bandhan for a class presentation in ${place(rng)}. Which interpretation best matches what the ceremony actually marks?`,
    correct: "It marks a young Sikh's step into greater responsibility and a fuller sense of identity, formally recognised by the community",
    wrong: [
      "It marks the exact same milestone as the Sikh naming ceremony, only performed twice",
      "It has no connection to identity and is purely a practical way of covering the hair",
      "It is optional and carries no recognised significance in the community",
    ],
    explanation: "Dastar Bandhan's significance is in what it marks — growing responsibility and identity — not merely a practical head-covering, and it is a distinct milestone from the earlier naming ceremony.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sorts the four ceremonies into two traditions for a class chart in ${place(rng)}. Which pairing is correct?`,
      correct: "Sanatan/Vedic: Jatkaram and Naamkaran. Sikh: the Sikh naming ceremony and Dastar Bandhan",
      wrong: [
        "Sanatan/Vedic: Jatkaram and Dastar Bandhan. Sikh: Naamkaran and the Sikh naming ceremony",
        "Sanatan/Vedic: all four ceremonies. Sikh: none",
        "Sikh: all four ceremonies. Sanatan/Vedic: none",
      ],
      explanation: "Jatkaram and Naamkaran are Sanatan/Vedic; the Sikh naming ceremony and Dastar Bandhan are Sikh — two ceremonies from each of the two traditions named in this sub-strand.",
    };
  },
];

const NUMBER_FACTS = [
  {
    prompt: "Mark how many religious ceremonies this sub-strand's bullet list names.",
    min: 0,
    max: 8,
    value: 4,
    hint: "Two Sanatan/Vedic, two Sikh.",
    explanation: "The sub-strand's own bullet list names four ceremonies: Jatkaram, Naamkaran, the Sikh naming ceremony and Dastar Bandhan.",
  },
  {
    prompt: "Mark how many of the four named ceremonies belong to the Sanatan/Vedic tradition.",
    min: 0,
    max: 4,
    value: 2,
    hint: "Jatkaram and Naamkaran.",
    explanation: "Two of the four named ceremonies are Sanatan/Vedic: Jatkaram and Naamkaran.",
  },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "The Sanatan/Vedic birth ceremony performed shortly after a baby is born is called ", after: ".", correctAnswer: "Jatkaram", acceptedAnswers: ["jatkaram", "jatakarma"], hint: "The earliest of the four ceremonies.", explanation: "Jatkaram is the Sanatan/Vedic birth ceremony performed shortly after birth." },
  { before: "The Sanatan/Vedic naming ceremony held some days after birth is called ", after: ".", correctAnswer: "Naamkaran", acceptedAnswers: ["naamkaran", "namkaran", "naamakarana"], hint: "Comes after Jatkaram.", explanation: "Naamkaran is the formal naming ceremony held some days after birth." },
  { before: "At the Sikh naming ceremony, the ", after: " is opened at random to choose the baby's name.", correctAnswer: "Guru Granth Sahib", acceptedAnswers: ["guru granth sahib"], hint: "The Sikh scripture.", explanation: "The Guru Granth Sahib is opened at random, and the baby is named from the first letter on that page." },
  { before: "A young Sikh being formally tied their first turban is a ceremony called ", after: ".", correctAnswer: "Dastar Bandhan", acceptedAnswers: ["dastar bandhan"], hint: "Happens years after the naming ceremony.", explanation: "Dastar Bandhan is the ceremony of formally tying a young Sikh's first turban." },
  { before: "Dastar Bandhan marks a step into greater responsibility and ", after: ".", correctAnswer: "identity", acceptedAnswers: ["identity"], hint: "A fuller sense of who one is becoming.", explanation: "Dastar Bandhan marks a young Sikh's step into greater responsibility and identity." },
  { before: "Of the four named ceremonies, the two that belong to the Sanatan/Vedic tradition are Jatkaram and ", after: ".", correctAnswer: "Naamkaran", acceptedAnswers: ["naamkaran", "namkaran"], hint: "The naming ceremony.", explanation: "Jatkaram and Naamkaran are the two Sanatan/Vedic ceremonies named in this sub-strand." },
  { before: "Of the four named ceremonies, the two that belong to the Sikh tradition are the Sikh naming ceremony and ", after: ".", correctAnswer: "Dastar Bandhan", acceptedAnswers: ["dastar bandhan"], hint: "The turban-tying ceremony.", explanation: "The Sikh naming ceremony and Dastar Bandhan are the two Sikh ceremonies named in this sub-strand." },
  { before: "The ceremony that welcomes a new life shortly after birth, before any name is chosen, is ", after: ".", correctAnswer: "Jatkaram", acceptedAnswers: ["jatkaram"], hint: "Comes before Naamkaran.", explanation: "Jatkaram welcomes the new life shortly after birth, before the later naming ceremony, Naamkaran." },
  { before: "Unlike the other three ceremonies, Dastar Bandhan takes place years after birth, in ", after: ".", correctAnswer: "childhood", acceptedAnswers: ["childhood"], hint: "Not in infancy.", explanation: "Dastar Bandhan is performed years after birth, in childhood, unlike the birth-and-naming rites of the other three ceremonies." },
  { before: "This sub-strand's bullet list names four ceremonies, though the outcomes text refers only to ", after: " selected ceremonies — a discrepancy resolved by covering all four.", correctAnswer: "three", acceptedAnswers: ["three", "3"], hint: "The source itself has this mismatch.", explanation: "The outcomes/rubric text says 'three selected religious ceremonies' while the bullet list names four; all four are covered here since that cannot fail a rubric graded on three." },
] as const;

export const religiousCeremonies: Skill = {
  id: "g7-hre-sk-religious-ceremonies",
  code: "SK.1",
  subjectId: "hre",
  strandId: "g7-hre-sk",
  grade: 7,
  title: "Religious Ceremonies",
  description:
    "Four religious ceremonies marking birth, naming and coming-of-age across two traditions — Jatkaram and Naamkaran (Sanatan/Vedic), the Sikh naming ceremony and Dastar Bandhan (Sikh) — what each involves and what its significance is.",
  generate(rng) {
    const branch = randChoice(rng, ["meaning-match", "tradition-sort", "fact-sort", "reasoning", "counts", "fill-blank"] as const);

    if (branch === "meaning-match") {
      const tokens = shuffle(rng, CEREMONIES.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, CEREMONIES.map((c) => ({ id: c.id, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of CEREMONIES) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MEANING_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Two are Sanatan/Vedic, two are Sikh — birth, naming, naming, and coming-of-age.",
        explanation: CEREMONIES.map((c) => `${c.label} (${c.tradition}) — ${c.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "tradition-sort") {
      const items = shuffle(rng, CEREMONIES.map((c) => ({ id: c.id, label: `${c.label} — ${c.stage}` })));
      const correctBucket: Record<string, string> = {};
      for (const c of CEREMONIES) correctBucket[c.id] = c.tradition === "Sanatan/Vedic" ? "sanatan" : "sikh";
      return {
        kind: "categorize",
        prompt: randChoice(rng, TRADITION_SORT_PROMPTS),
        items,
        buckets: [
          { id: "sanatan", label: "Sanatan/Vedic" },
          { id: "sikh", label: "Sikh" },
        ],
        correctBucket,
        hint: "Two ceremonies per tradition.",
        explanation: CEREMONIES.map((c) => `${c.label} — ${c.tradition}.`).join(" "),
      };
    }

    if (branch === "fact-sort") {
      const chosen = shuffle(rng, CEREMONIES).slice(0, 3);
      const pool = shuffle(rng, CEREMONY_FACTS.filter((f) => chosen.some((c) => c.id === f.ceremony))).slice(0, 9);
      const items = pool.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`f${i}`] = f.ceremony));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FACT_SORT_PROMPTS),
        items,
        buckets: chosen.map((c) => ({ id: c.id, label: `${c.label} (${c.tradition})` })),
        correctBucket,
        hint: "Ask whose birth, naming or coming-of-age is being marked, and how.",
        explanation: pool.map((f) => `"${f.text}" — ${CEREMONIES.find((c) => c.id === f.ceremony)!.label}.`).join(" "),
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
        hint: "Ask which tradition, which life-stage, and what the ceremony's actual significance is.",
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
        step: 1,
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
