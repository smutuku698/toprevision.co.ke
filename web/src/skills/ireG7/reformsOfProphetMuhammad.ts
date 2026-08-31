import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The Jahiliyya-vs-reform contrast is genuine, curriculum-endorsed comparative content ("make a comparative
// analysis between Jahiliyya and post Jahiliyya periods"), but it is a contrast, not a sequence — there is no
// curriculum-stated order of events to justify an "ordering" branch, and no numeric/spatial content for
// hotspot/number-line (confirmed against Assests-svg/). So this branches across 4 QuestionKinds (categorize,
// click-match, multiple-choice, fill-blank) rather than 5, per the SKILL-QUALITY-STANDARDS.md floor case.

const CATEGORIZE_PROMPTS = [
  "Sort each statement as a Jahiliyya-era practice or a reform introduced by Prophet Muhammad (S.A.W.).",
  "Group each statement under a Jahiliyya-era practice or a reform of Prophet Muhammad (S.A.W.).",
  "Decide whether each statement describes a Jahiliyya-era practice or a reform, and sort it there.",
  "Sort each statement into the correct category: Jahiliyya-era practice, or reform.",
  "Place each statement into the right bucket — Jahiliyya-era practice, or reform.",
  "Categorise each statement as a Jahiliyya-era practice or a reform of Prophet Muhammad (S.A.W.).",
];

const MATCH_PROMPTS = [
  "Match each Jahiliyya-era practice to the reform Prophet Muhammad (S.A.W.) introduced to address it.",
  "Pair each Jahiliyya-era practice with the reform that addressed it.",
  "Connect each practice below to the reform that replaced it.",
  "Match each practice to the corresponding reform.",
  "Link each Jahiliyya-era practice to the reform Prophet Muhammad (S.A.W.) introduced.",
  "Choose the correct reform for each Jahiliyya-era practice.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

type Era = "jahiliyya" | "reform";
interface EraFact {
  text: string;
  era: Era;
}
const ERA_LABEL: Record<Era, string> = {
  jahiliyya: "Jahiliyya-era practice (before the reforms)",
  reform: "Reform introduced by Prophet Muhammad (S.A.W.)",
};
const ERA_FACTS: EraFact[] = [
  { text: "Tribal feuds and blood revenge divided Arab society along clan lines", era: "jahiliyya" },
  { text: "Female infants were sometimes buried alive (female infanticide)", era: "jahiliyya" },
  { text: "Women had little or no right to inherit or own property", era: "jahiliyya" },
  { text: "Riba (interest) and exploitative trade practices were widespread and unchecked", era: "jahiliyya" },
  { text: "Idol worship and polytheism (worship of many gods) were the norm", era: "jahiliyya" },
  { text: "There was no unified written law; power rested with tribal strongmen", era: "jahiliyya" },
  { text: "Slaves were treated purely as property, with no protection or rights", era: "jahiliyya" },
  { text: "Brotherhood and unity were established among believers, regardless of tribe, through the Constitution of Madinah", era: "reform" },
  { text: "The Muhajirun (migrants from Makkah) and Ansar (helpers in Madinah) were paired as brothers", era: "reform" },
  { text: "Women were granted the right to inherit and own property", era: "reform" },
  { text: "Riba (interest) was prohibited and fair trade practices were established", era: "reform" },
  { text: "Tawheed — the worship of One God — replaced idol worship and polytheism", era: "reform" },
  { text: "A written constitution (the Constitution of Madinah) and consultative (shura) governance were introduced", era: "reform" },
  { text: "Kind treatment of slaves was commanded, and freeing slaves (manumission) was encouraged as a virtuous act", era: "reform" },
];

// Paired Jahiliyya practice (token) -> the specific reform that replaced it (target), for a comparative click-match.
const ERA_PAIRS: { practice: string; reform: string }[] = [
  { practice: "Tribalism and blood feuds", reform: "Brotherhood and unity via the Constitution of Madinah" },
  { practice: "Female infanticide", reform: "Protection of the right to life for daughters" },
  { practice: "Excluding women from inheritance", reform: "Women granted the right to inherit and own property" },
  { practice: "Unchecked riba and exploitative trade", reform: "Riba prohibited and fair trade practices established" },
  { practice: "Idol worship and polytheism", reform: "Tawheed — worship of One God" },
  { practice: "Rule by tribal strongmen with no unified law", reform: "A written constitution and consultative (shura) governance" },
  { practice: "Slaves treated purely as property", reform: "Kind treatment of slaves and encouragement of manumission" },
];

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `Two students from rival clans in ${place(rng)} refuse to work together on a class project because of old family rivalries. Which reform of Prophet Muhammad (S.A.W.) offers the most relevant lesson here?`,
    correct: "The reform establishing brotherhood and unity among believers, regardless of tribe, through the Constitution of Madinah",
    wrong: [
      "The reform prohibiting riba (interest) in trade",
      "The reform replacing idol worship with Tawheed",
      "The reform commanding kind treatment of slaves",
    ],
    explanation: "The Constitution of Madinah and the pairing of the Muhajirun and Ansar directly addressed tribal division by establishing brotherhood and unity among believers regardless of clan.",
  }),
  (rng) => ({
    prompt: `A family in ${place(rng)} plans to leave their entire estate to their sons only, excluding their daughters completely. Which reform of Prophet Muhammad (S.A.W.) is directly relevant to this situation?`,
    correct: "The reform granting women the right to inherit and own property",
    wrong: [
      "The reform introducing consultative (shura) governance",
      "The reform establishing brotherhood among believers",
      "The reform of a written constitution for Madinah",
    ],
    explanation: "Before the reforms, women had little or no right to inherit; Prophet Muhammad (S.A.W.) reformed this by granting women the right to inherit and own property.",
  }),
  (rng) => ({
    prompt: `${name(rng)}, a trader in ${place(rng)}, lends money to a struggling neighbour but demands repayment of extra money on top as a condition of the loan. Which Jahiliyya-era practice does this resemble, and which reform addresses it?`,
    correct: "It resembles unchecked riba (interest); Prophet Muhammad (S.A.W.) prohibited riba and established fair trade practices",
    wrong: [
      "It resembles idol worship; the reform of Tawheed addresses it",
      "It resembles female infanticide; the protection of daughters' rights addresses it",
      "It resembles rule by tribal strongmen; the written constitution addresses it",
    ],
    explanation: "Charging extra money on a loan as a condition is riba — a widespread Jahiliyya-era practice that Prophet Muhammad (S.A.W.) prohibited as part of his economic reforms.",
  }),
  (rng) => ({
    prompt: `A local leader in ${place(rng)} makes every major decision alone, without consulting anyone else in the community. A classmate says this goes against a lesson from the Prophet's (S.A.W.) reforms. Which reform is being referenced?`,
    correct: "The introduction of a written constitution and consultative (shura) governance, replacing rule by unchecked tribal strongmen",
    wrong: [
      "The reform prohibiting riba in trade",
      "The reform of Tawheed, the worship of One God",
      "The reform pairing the Muhajirun and Ansar as brothers",
    ],
    explanation: "Before the reforms, power rested with tribal strongmen with no unified law; Prophet Muhammad (S.A.W.) introduced the Constitution of Madinah and consultative (shura) governance.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} reads that before Islam, slaves were treated purely as property with no protection or rights. What reform did Prophet Muhammad (S.A.W.) introduce regarding the treatment of slaves?`,
      correct: "He commanded kind treatment of slaves and encouraged freeing slaves (manumission) as a virtuous act",
      wrong: [
        "He made no changes to how slaves were treated",
        "He required that all trade involving slaves continue exactly as before",
        "He ruled that only tribal leaders could ever free a slave",
      ],
      explanation: "Prophet Muhammad (S.A.W.) commanded kind treatment of slaves and encouraged manumission — freeing slaves — as a virtuous act, a direct reform of the Jahiliyya-era treatment of slaves as mere property.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} insists that different objects and idols should be worshipped for different needs, the way some people did before Islam. Which reform directly addresses this claim?`,
    correct: "The reform of Tawheed, which replaced idol worship and polytheism with the worship of One God",
    wrong: [
      "The reform of consultative (shura) governance",
      "The reform granting women inheritance rights",
      "The reform prohibiting riba in trade",
    ],
    explanation: "Tawheed — belief in and worship of One God — was Prophet Muhammad's (S.A.W.) central reform against the idol worship and polytheism of the Jahiliyya period.",
  }),
  (rng) => ({
    prompt: `${name(rng)} claims that Prophet Muhammad's (S.A.W.) reforms only ever addressed religious belief, and had nothing to do with politics or the economy. Is this an accurate description of the reforms?`,
    correct: "No — the reforms spanned socio-religious, political, and economic life, including Tawheed, the Constitution of Madinah, and the prohibition of riba",
    wrong: [
      "Yes — the reforms were entirely limited to matters of religious belief",
      "Yes — political and economic life were left completely unchanged by the reforms",
      "No — but the reforms only ever addressed political matters, not religion or economics",
    ],
    explanation: "The reforms genuinely spanned all three dimensions — socio-religious (Tawheed, brotherhood), political (the Constitution of Madinah, shura), and economic (prohibition of riba, fair trade) — not just one of them.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked to correctly pair a Jahiliyya-era practice with the reform that replaced it. Which pairing is accurate?`,
    correct: "Female infanticide (Jahiliyya) — protection of the right to life for daughters (reform)",
    wrong: [
      "Riba (Jahiliyya) — brotherhood among believers (reform)",
      "Idol worship (Jahiliyya) — the Constitution of Madinah (reform)",
      "Tribal feuds (Jahiliyya) — the prohibition of riba (reform)",
    ],
    explanation: "Each Jahiliyya-era practice was addressed by a specific, matching reform — female infanticide by the protection of daughters' right to life, not by an unrelated reform.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that since the reforms happened long ago in Madinah, they hold no real lesson for communities in ${place(rng)} today. Is this reasoning sound?`,
    correct: "No — lessons such as unity across differences, fair dealing, and just treatment of the vulnerable remain directly applicable today",
    wrong: [
      "Yes — reforms from that period cannot teach anything relevant to modern communities",
      "Yes — only economic reforms like the prohibition of riba still apply today",
      "No — but only the political reforms, like the Constitution of Madinah, still apply",
    ],
    explanation: "The reforms' underlying lessons — unity across tribal or social differences, fair economic dealing, and just treatment of the vulnerable — remain directly applicable beyond their original historical setting.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked why the pairing of the Muhajirun (migrants from Makkah) with the Ansar (helpers in Madinah) as brothers mattered so much as a reform. What is the best explanation?`,
      correct: "It created bonds of unity and mutual support across the two communities, replacing the divisions of tribal loyalty with brotherhood in faith",
      wrong: [
        "It was purely a symbolic ceremony with no real effect on daily life",
        "It only applied to trade agreements between the two groups",
        "It replaced tribal loyalty with loyalty to a single new tribe, not with brotherhood in faith",
      ],
      explanation: "The Muhajirun-Ansar pairing built genuine bonds of unity and mutual support across two different communities, grounded in shared faith rather than tribal loyalty.",
    };
  },
];

export const reformsOfProphetMuhammad: Skill = {
  id: "g7-ire-ih-reforms",
  code: "IH.1",
  subjectId: "ire",
  strandId: "g7-ire-heritage",
  grade: 7,
  title: "Reforms introduced by Prophet Muhammad (S.A.W.)",
  description: "The socio-religious, political, and economic reforms introduced by Prophet Muhammad (S.A.W.), contrasted with Jahiliyya-era practices.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const jahiliyya = shuffle(rng, ERA_FACTS.filter((f) => f.era === "jahiliyya")).slice(0, 5);
      const reform = shuffle(rng, ERA_FACTS.filter((f) => f.era === "reform")).slice(0, 5);
      const chosen = shuffle(rng, [...jahiliyya, ...reform]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.era));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["jahiliyya", "reform"] as const).map((e) => ({ id: e, label: ERA_LABEL[e] })),
        correctBucket,
        hint: "Ask whether the statement describes life before the reforms, or a change Prophet Muhammad (S.A.W.) introduced.",
        explanation: chosen.map((f) => `"${f.text}" — ${ERA_LABEL[f.era].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, ERA_PAIRS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.practice, label: p.practice })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.practice, label: p.reform })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.practice] = p.practice;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about which specific reform directly replaced each named Jahiliyya-era practice.",
        explanation: chosen.map((p) => `${p.practice} → ${p.reform}.`).join(" "),
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
        hint: "Think about which specific socio-religious, political, or economic reform the situation actually points to.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In the Jahiliyya period, disputes between tribes were often settled through blood", after: "(revenge).", answer: "revenge", accepted: ["revenge"] },
      { before: "The Prophet (S.A.W.) paired migrants from Makkah, the Muhajirun, with helpers in Madinah, the", after: ", as brothers.", answer: "Ansar", accepted: ["ansar"] },
      { before: "The written document that established unity and law among the diverse communities of Madinah is called the", after: "of Madinah.", answer: "Constitution", accepted: ["constitution"] },
      { before: "Before the reforms, some Arab families practised female", after: ", burying baby girls alive.", answer: "infanticide", accepted: ["infanticide"] },
      { before: "The Prophet (S.A.W.) reformed inheritance law so that", after: "were granted the right to inherit property.", answer: "women", accepted: ["women"] },
      { before: "Prophet Muhammad (S.A.W.) prohibited", after: "(interest) as part of his economic reforms.", answer: "riba", accepted: ["riba"] },
      { before: "The reform of", after: "replaced the polytheism and idol worship of the Jahiliyya period with belief in One God.", answer: "Tawheed", accepted: ["tawheed", "tawhid"] },
      { before: "The Prophet (S.A.W.) introduced consultative governance, known in Arabic as", after: ".", answer: "shura", accepted: ["shura"] },
      { before: "Prophet Muhammad (S.A.W.) commanded kind treatment of slaves and encouraged their", after: "(freeing) as a virtuous act.", answer: "manumission", accepted: ["manumission"] },
      { before: "Before Islam, power in Arabia rested largely with tribal", after: ", with no unified written law.", answer: "strongmen", accepted: ["strongmen", "chiefs", "leaders"] },
      { before: "The period before Islam's reforms is known in Arabic as the", after: "(Age of Ignorance).", answer: "Jahiliyya", accepted: ["jahiliyya"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Recall the socio-religious, political, and economic reforms Prophet Muhammad (S.A.W.) introduced.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
