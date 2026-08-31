import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, place, sortPrompt, matchPrompt, fillBlankPrompt } from "./g5IreShared";

// KICD Grade 5 IRE — 6.1 Etiquette of Islamic Wedding Celebrations.
// Source names 4 explicit etiquette points to sort Islamic-vs-unislamic against: appropriate dressing,
// gender separation, avoiding Israaf (extravagance), and avoiding music. No sequence/order of wedding
// events is stated anywhere in the source, so an `ordering` branch would have to invent a sequence the
// curriculum never gives — deliberately excluded per SKILL-QUALITY-STANDARDS.md's "never invent an order
// the curriculum doesn't state." No VisualSpec exists for wedding content either, ruling out `hotspot`.
// That leaves 4 genuinely content-supported kinds (categorize, click-match, multiple-choice, fill-blank) —
// the documented floor case per SKILL-QUALITY-STANDARDS.md.

interface EtiquetteFact {
  text: string;
  bucket: "islamic" | "unislamic";
}
const BUCKET_LABEL: Record<EtiquetteFact["bucket"], string> = {
  islamic: "Islamic etiquette",
  unislamic: "Unislamic practice",
};

const ISLAMIC_FACTS: EtiquetteFact[] = [
  { text: "The bride and groom's families make sure guests dress modestly and appropriately for the celebration", bucket: "islamic" },
  { text: "Men and women are seated or gathered in separate areas during the celebration", bucket: "islamic" },
  { text: "The families spend moderately on the celebration, avoiding wasteful extravagance (Israaf)", bucket: "islamic" },
  { text: "The celebration is held without loud music or musical instruments, keeping it simple and respectful", bucket: "islamic" },
  { text: "Guests offer sincere dua (supplication) and blessings for the new couple", bucket: "islamic" },
  { text: "The wedding feast (walima) is shared generously with guests without unnecessary waste", bucket: "islamic" },
];
const UNISLAMIC_FACTS: EtiquetteFact[] = [
  { text: "Some guests wear revealing or flashy clothing meant to draw attention rather than to dress modestly", bucket: "unislamic" },
  { text: "Men and women mix freely together with no separation during the celebration", bucket: "unislamic" },
  { text: "A family spends far beyond its means, wasting money on unnecessary decorations just to impress others", bucket: "unislamic" },
  { text: "Loud music and dancing with instruments take over the celebration", bucket: "unislamic" },
  { text: "Guests spend the celebration gossiping and comparing families' wealth instead of offering sincere blessings", bucket: "unislamic" },
  { text: "Huge amounts of food are prepared and thrown away uneaten just so the family appears generous", bucket: "unislamic" },
];

const TERM_DESCRIPTIONS: { term: string; meaning: string }[] = [
  { term: "Appropriate dressing", meaning: "Wearing modest clothing that covers properly, instead of clothing meant to show off" },
  { term: "Gender separation", meaning: "Men and women being seated or gathered in separate areas during the celebration" },
  { term: "Avoiding Israaf", meaning: "Not spending or serving food and decorations excessively beyond what is needed" },
  { term: "Avoiding music", meaning: "Not using musical instruments or loud music, keeping the celebration simple" },
  { term: "Immodest dressing", meaning: "Wearing revealing or flashy clothing meant to draw attention, against the etiquette" },
  { term: "Mixing of genders", meaning: "Men and women mixing freely with no separation at all, against the etiquette" },
  { term: "Extravagant spending", meaning: "Spending far beyond what is needed just to impress other people" },
  { term: "Loud music and dancing", meaning: "Music and dancing with instruments taking over the celebration, against the etiquette" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is helping plan a sister's wedding in ${place(rng)}. The family wants to hire a band with loud music and instruments to entertain guests. Does this fit Islamic wedding etiquette?`,
      correct: "No — Islamic wedding etiquette calls for avoiding loud music and instruments, keeping the celebration simple and respectful",
      wrong: [
        "Yes — any kind of music is allowed at a wedding as long as guests enjoy it",
        "No — but only religious songs are the problem, any other music is fine",
        "Yes — a walima (wedding feast) actually requires musical entertainment",
      ],
      explanation: "Avoiding music and instruments is one of the etiquette points named for Islamic wedding celebrations — enjoying the occasion doesn't require loud music.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} is organising a wedding and decides to seat men and women together in one hall with no separation. Evaluate this decision against Islamic wedding etiquette.`,
      correct: "It does not fit the etiquette — Islamic wedding celebrations call for gender separation",
      wrong: [
        "It fits perfectly — gender separation is not part of wedding etiquette at all",
        "It fits, as long as the hall is large enough for everyone to be comfortable",
        "It does not fit, but only because the hall itself was too small",
      ],
      explanation: "Gender separation is one of the named etiquette points for Islamic wedding celebrations — seating everyone together with no separation goes against it.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s family in ${place(rng)} wants to impress guests, so they spend far beyond their budget on decorations and prepare far more food than needed, most of which goes to waste. What Islamic principle does this go against?`,
    correct: "Israaf — Islam teaches moderation in spending and discourages wastefulness",
    wrong: [
      "Nothing — spending generously is always encouraged no matter how much is wasted",
      "The rule against mixing genders, since decorations and food are unrelated to that",
      "Nothing — Israaf only applies to spending on clothing, not decorations or food",
    ],
    explanation: "Overspending to impress others and wasting food is exactly what Israaf (extravagance) means — Islamic wedding etiquette calls for moderation instead.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} attends a wedding in ${place(rng)} where guests dress modestly, men and women sit in separate sections, and the celebration has no loud music — just simple recitation and blessings. How would you describe this celebration?`,
      correct: "It closely follows Islamic wedding etiquette",
      wrong: [
        "It fails Islamic etiquette, since a celebration must always include music to be joyful",
        "It fails Islamic etiquette, since men and women should always be seated together",
        "It is unrelated to Islamic etiquette, since etiquette only concerns spending, not seating or music",
      ],
      explanation: "Modest dressing, gender separation, moderate spending, and avoiding music are exactly the etiquette points named for Islamic wedding celebrations.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s cousin insists that spending as much money as possible on a wedding shows how much you love the couple, no matter how wasteful it is. Is this reasoning sound?`,
    correct: "No — Islam discourages Israaf (extravagance); love and celebration can be shown without wasteful spending",
    wrong: [
      "Yes — the more money wasted at a wedding, the more Islamic the celebration is",
      "Yes — Israaf only applies to weddings with fewer than a hundred guests",
      "No — but only because spending money on a wedding is forbidden altogether",
    ],
    explanation: "Islamic wedding etiquette calls for avoiding Israaf — moderate, sincere celebration is what matters, not how much money is spent or wasted.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `At a wedding in ${place(rng)}, ${who} notices the family avoided extravagant decorations, dressed modestly, and kept genders separated — but played loud music with dancing at the end. Does this fully meet Islamic wedding etiquette?`,
      correct: "No — even though most points were observed, the loud music and dancing still go against the etiquette",
      wrong: [
        "Yes — since most of the etiquette points were followed, the music does not matter",
        "Yes — music is only a problem if it happens at the very start of the celebration",
        "No — but only because dressing modestly and music cannot both happen at one wedding",
      ],
      explanation: "Avoiding music and instruments is one of the four named etiquette points — meeting the other three does not cancel out this one being missed.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} argues that Islamic wedding etiquette is only about keeping the guest list small, and that extravagant décor and music don't matter as long as few people attend. Evaluate this claim.`,
    correct: "Flawed — etiquette is about avoiding Israaf, music, mixed seating, and immodest dress, regardless of how many guests attend",
    wrong: [
      "Sound — a small guest list automatically makes any wedding etiquette-compliant",
      "Sound — dressing, seating, and music rules only apply once a wedding has many guests",
      "Flawed — actually, etiquette is only about the size of the guest list, nothing else",
    ],
    explanation: "The number of guests has nothing to do with the named etiquette points — appropriate dressing, gender separation, avoiding Israaf, and avoiding music apply regardless of guest-list size.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} wants a joyful wedding celebration without going against Islamic etiquette. Which combination of choices best fits?`,
      correct: "Modest dressing, separate seating for men and women, moderate spending, and no loud music or instruments",
      wrong: [
        "Modest dressing and no music, but men and women seated together",
        "Separate seating and moderate spending, but with loud music and dancing",
        "Loud music, mixed seating, and lavish spending, as long as guests dress modestly",
      ],
      explanation: "All four etiquette points — dressing, separation, avoiding Israaf, and avoiding music — need to be observed together, not just some of them.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} believes gender separation at weddings is just an old custom with no real connection to Islamic teaching, so it can be safely ignored. Is this correct?`,
    correct: "No — gender separation is one of the etiquette points explicitly named for Islamic wedding celebrations",
    wrong: [
      "Yes — it is purely cultural and has nothing to do with Islamic wedding etiquette",
      "Yes — gender separation only matters at the mosque, never at a wedding",
      "No — but it is actually less important than the choice of wedding venue",
    ],
    explanation: "Gender separation is named directly alongside appropriate dressing, avoiding Israaf, and avoiding music as part of Islamic wedding etiquette.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked by a friend why some Muslim weddings avoid loud music while others still have it. What is the best response, based on Islamic wedding etiquette?`,
      correct: "Islamic wedding etiquette calls for avoiding loud music and instruments, though how closely families follow this varies",
      wrong: [
        "Music is required at every Islamic wedding, so any wedding without it is doing something wrong",
        "Music has nothing to do with Islamic wedding etiquette at all, either way",
        "Avoiding music only applies to weddings held during the day, never in the evening",
      ],
      explanation: "Avoiding music is a named Islamic wedding etiquette point, but not every family observes every point equally closely — the guidance itself stays the same.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s uncle in ${place(rng)} spends generously on the walima (wedding feast) but makes sure guests can eat comfortably without any food being wasted. Is this in line with Islamic teaching?`,
    correct: "Yes — generosity at a walima is encouraged, as long as it avoids Israaf (waste)",
    wrong: [
      "No — any spending on a wedding feast at all counts as Israaf",
      "No — generosity is only acceptable if the food is never fully eaten",
      "Yes — but only because a walima is not actually part of Islamic wedding etiquette",
    ],
    explanation: "Generosity and avoiding Israaf are not opposites — a walima can be generous and still avoid the wastefulness that Israaf describes.",
  }),
];

export const etiquetteOfIslamicWedding: Skill = {
  id: "g5-ire-mu-wedding-etiquette",
  code: "MU.1",
  subjectId: "ire",
  strandId: "g5-ire-muamalat",
  grade: 5,
  title: "Etiquette of Islamic Wedding Celebrations",
  description: "The etiquette to be observed at Islamic wedding celebrations — appropriate dressing, gender separation, avoiding Israaf (extravagance), and avoiding music — and the unislamic practices that go against them.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const islamicChosen = shuffle(rng, ISLAMIC_FACTS).slice(0, 4);
      const unislamicChosen = shuffle(rng, UNISLAMIC_FACTS).slice(0, 4);
      const chosen = shuffle(rng, [...islamicChosen, ...unislamicChosen]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.bucket));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it describes Islamic wedding etiquette or an unislamic practice"),
        items,
        buckets: (["islamic", "unislamic"] as const).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "Islamic etiquette includes appropriate dressing, gender separation, avoiding Israaf, and avoiding music — anything that goes against those is unislamic.",
        explanation: chosen.map((f) => `"${f.text}" — ${BUCKET_LABEL[f.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_DESCRIPTIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "wedding etiquette term to its description"),
        tokens,
        targets,
        correctMap,
        hint: "Some terms describe Islamic etiquette, and some describe practices that go against it.",
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
        hint: "Think about which of the four named etiquette points (dressing, separation, Israaf, music) applies here.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "One thing Islamic wedding etiquette calls for is appropriate", after: ".", answer: "dressing", accepted: ["dressing", "clothing"] },
      { before: "During an Islamic wedding celebration, men and women should be seated in separate", after: ".", answer: "areas", accepted: ["areas", "sections"] },
      { before: "Wasteful, excessive spending during a wedding celebration is called", after: "in Arabic.", answer: "Israaf", accepted: ["israaf"] },
      { before: "Islamic wedding etiquette calls for avoiding loud", after: "during the celebration.", answer: "music", accepted: ["music"] },
      { before: "The wedding feast that should be shared generously, without waste, is called the", after: ".", answer: "walima", accepted: ["walima"] },
      { before: "An unislamic wedding practice is when men and women", after: "freely with no separation.", answer: "mix", accepted: ["mix", "mingle"] },
      { before: "Spending far beyond what is needed just to impress guests at a wedding is an example of", after: ".", answer: "Israaf", accepted: ["israaf", "extravagance"] },
      { before: "Islamic weddings, observed with proper etiquette, are considered part of the Islamic", after: ".", answer: "heritage", accepted: ["heritage"] },
      { before: "A wedding celebration that avoids Israaf, mixed seating, and loud music follows Islamic", after: ".", answer: "etiquette", accepted: ["etiquette"] },
      { before: "Guests at an Islamic wedding are expected to dress", after: "rather than to show off.", answer: "modestly", accepted: ["modestly", "modest"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall the four named etiquette points for Islamic wedding celebrations and what goes against them.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
