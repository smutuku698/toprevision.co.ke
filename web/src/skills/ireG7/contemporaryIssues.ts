import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// Rights of women, and HIV/AIDS + COVID-19 transmission and prevention, have no curriculum-stated sequence and
// no numeric/spatial content, so this branches across 4 QuestionKinds (categorize, click-match, multiple-choice,
// fill-blank) rather than 5 — the SKILL-QUALITY-STANDARDS.md floor case where a 5th kind (ordering/hotspot/
// number-line) would have to be invented rather than drawn from real content. Confirmed no relevant visual
// exists in Assests-svg/ either. HIV/AIDS content is kept clinical and brief, matching the tone of a Kenyan
// health-education textbook — never descriptive — per the curriculum's own framing.

const CATEGORIZE_PROMPTS = [
  "Sort each statement by which contemporary issue it describes.",
  "Group each statement under the contemporary issue it describes.",
  "Decide which contemporary issue each statement describes, and sort it there.",
  "Sort each fact into the contemporary issue it belongs to.",
  "Place each statement under the issue it describes.",
  "Read each statement and sort it under the matching contemporary issue.",
];

const MATCH_PROMPTS = [
  "Match each term to its meaning.",
  "Pair each term with its correct meaning.",
  "Connect each term below to what it means.",
  "Match each term to the meaning that fits it.",
  "Link each term with the correct definition.",
  "Choose the correct meaning for each term below.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

type IssueTopic = "rights" | "transmission" | "prevention";
interface IssueFact {
  text: string;
  topic: IssueTopic;
}
const TOPIC_LABEL: Record<IssueTopic, string> = {
  rights: "Rights of women in Islam",
  transmission: "Modes of transmission (HIV/AIDS and COVID-19)",
  prevention: "Remedies and prevention (HIV/AIDS and COVID-19)",
};
const ISSUE_FACTS: IssueFact[] = [
  { text: "A woman has the right to pursue education and seek knowledge", topic: "rights" },
  { text: "A woman has the right to own and inherit property", topic: "rights" },
  { text: "A woman has the right to choose her own spouse — her consent is required", topic: "rights" },
  { text: "A woman has the right to work and earn a living independently", topic: "rights" },
  { text: "A woman has the right to fair and kind treatment", topic: "rights" },
  { text: "HIV can be transmitted through contact with infected blood, such as unsafe blood transfusions", topic: "transmission" },
  { text: "HIV can be transmitted by sharing unsterilized needles or other sharp instruments", topic: "transmission" },
  { text: "HIV can pass from a mother to her child during pregnancy, birth, or breastfeeding", topic: "transmission" },
  { text: "HIV can be transmitted through unprotected sexual contact", topic: "transmission" },
  { text: "COVID-19 spreads through respiratory droplets released when an infected person coughs or sneezes", topic: "transmission" },
  { text: "COVID-19 can spread through close contact with an infected person", topic: "transmission" },
  { text: "COVID-19 can spread by touching a contaminated surface and then touching the face", topic: "transmission" },
  { text: "Abstinence helps prevent the sexual transmission of HIV", topic: "prevention" },
  { text: "Avoiding the sharing of needles helps prevent the transmission of HIV", topic: "prevention" },
  { text: "Using screened (tested) blood for transfusions helps prevent the transmission of HIV", topic: "prevention" },
  { text: "A person living with HIV should adhere to ARVs (antiretrovirals) and regular medical care", topic: "prevention" },
  { text: "Avoiding stigma and discrimination supports people living with HIV", topic: "prevention" },
  { text: "Regular hand hygiene helps prevent the spread of COVID-19", topic: "prevention" },
  { text: "Wearing a mask helps prevent the spread of COVID-19", topic: "prevention" },
  { text: "Vaccination helps protect against COVID-19", topic: "prevention" },
  { text: "Avoiding crowded spaces when unwell helps prevent the spread of COVID-19", topic: "prevention" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Right to inherit property", meaning: "A woman's Islamic right to receive a share of inheritance, not be excluded from it" },
  { term: "Right to choose a spouse", meaning: "A woman's right to give free consent in choosing who she marries" },
  { term: "Right to seek knowledge", meaning: "A woman's right to pursue education throughout her life" },
  { term: "Mother-to-child transmission", meaning: "HIV passing from an infected mother to her child during pregnancy, birth, or breastfeeding" },
  { term: "ARVs (antiretrovirals)", meaning: "Medication that helps a person living with HIV manage the virus and stay healthy" },
  { term: "Abstinence", meaning: "Choosing not to engage in behaviour that risks sexual transmission of HIV" },
  { term: "Respiratory droplets", meaning: "Tiny particles released when an infected person coughs or sneezes, which can spread COVID-19" },
  { term: "Stigma", meaning: "Unfair, discriminatory treatment of a person living with HIV, which Muslims are called to avoid" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

// Female-only subset, for templates whose scenario text uses "she/her" pronouns (e.g. pregnancy) — using the
// full mixed-gender KENYAN_NAMES pool there would produce a name/pronoun mismatch (caught by sampling).
const KENYAN_FEMALE_NAMES = ["Amina", "Halima", "Zainab", "Fatuma", "Khadija", "Mariam"] as const;
function femaleName(rng: RNG) { return randChoice(rng, KENYAN_FEMALE_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `A father in ${place(rng)} plans to leave his estate only to his sons, saying his daughters have no claim to it. Is this in line with the rights of women in Islam?`,
    correct: "No — Islam grants women the right to own and inherit property, and excluding daughters entirely violates that right",
    wrong: [
      "Yes — only sons are entitled to inherit in Islam",
      "Yes — daughters may only receive property as a wedding gift, never as inheritance",
      "No — but only if the father has no sons at all",
    ],
    explanation: "The right to own and inherit property is one of the named rights of women in Islam — completely excluding daughters from inheritance goes against this right.",
  }),
  (rng) => ({
    prompt: `${femaleName(rng)}'s guardian arranges a marriage for her without ever asking for her opinion or agreement. Does this respect the rights of women in Islam?`,
    correct: "No — a woman has the right to choose her own spouse, and her consent is required for a valid marriage",
    wrong: [
      "Yes — a guardian's decision is always final, regardless of the woman's wishes",
      "Yes — consent only matters for the groom, not the bride",
      "No — but the objection is only valid before an engagement is announced",
    ],
    explanation: "A woman's right to choose her spouse, including giving free consent, is one of her named rights — a guardian arranging marriage without her agreement violates it.",
  }),
  (rng) => ({
    prompt: `${femaleName(rng)} in ${place(rng)} wants to start a small tailoring business, but a relative insists that Islam forbids women from earning their own income. Is the relative correct?`,
    correct: "No — women have the right to work and earn a living independently in Islam",
    wrong: [
      "Yes — a woman may only handle money that her husband or father gives her",
      "Yes — women may work only in family businesses, never independently",
      "No — but only if she first obtains her husband's or father's permission for every transaction",
    ],
    explanation: "Islam recognises a woman's right to work and earn independently — this is a named right, not something that requires special exception to exercise.",
  }),
  (rng) => ({
    prompt: `A clinic in ${place(rng)} reuses needles between patients due to a shortage of new ones. What health risk does this practice create?`,
    correct: "It creates a risk of HIV transmission, since sharing unsterilized needles or sharp instruments is a known mode of transmission",
    wrong: [
      "It creates a risk of COVID-19 transmission specifically, not HIV",
      "It creates no real health risk as long as the needles look clean",
      "It only creates a risk if the patients are already unwell",
    ],
    explanation: "Sharing unsterilized needles or sharp instruments is a named mode of HIV transmission — reusing needles between patients creates exactly this risk.",
  }),
  (rng) => {
    const who = femaleName(rng);
    return {
      prompt: `${who}, who is living with HIV and pregnant, asks her doctor in ${place(rng)} how she can protect her baby from also being infected. What is the most accurate advice based on remedies for the spread of HIV?`,
      correct: "With consistent ARV adherence and proper medical care, the risk of mother-to-child transmission can be greatly reduced",
      wrong: [
        "Nothing can be done — mother-to-child transmission cannot be reduced at all",
        "She should stop all medical care until after the baby is born",
        "The risk only applies during breastfeeding, so pregnancy itself carries no risk",
      ],
      explanation: "Adherence to ARVs and regular medical care is a named remedy that can significantly reduce the risk of mother-to-child HIV transmission during pregnancy, birth, or breastfeeding.",
    };
  },
  (rng) => ({
    prompt: `On a crowded matatu in ${place(rng)}, a passenger is coughing frequently and appears unwell. What is the most appropriate COVID-19 precaution for the other passengers, based on how COVID-19 spreads?`,
    correct: "Practise good hand hygiene, consider wearing a mask, and avoid unnecessary close contact, since COVID-19 spreads through respiratory droplets and close contact",
    wrong: [
      "No precaution is needed, since COVID-19 only spreads through direct blood contact",
      "Only the unwell passenger needs to take precautions; others are not at risk",
      "Precautions are unnecessary once a person has been vaccinated even once",
    ],
    explanation: "COVID-19 spreads through respiratory droplets from coughing and sneezing and through close contact — hand hygiene, masks, and avoiding close contact are appropriate precautions in this situation.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A classmate tells ${who} in ${place(rng)} that students should avoid sitting near or sharing books with a schoolmate whose parent is living with HIV, out of fear of "catching it" through everyday contact. Is this fear well-founded?`,
      correct: "No — HIV is not spread through everyday contact such as sharing a classroom or books, and this kind of avoidance is stigma, which Islam calls Muslims to avoid",
      wrong: [
        "Yes — HIV spreads easily through any casual contact, so avoidance is wise",
        "Yes, but only if the schoolmate shares food with others",
        "No, but avoiding shared items is still recommended just in case",
      ],
      explanation: "HIV is not transmitted through casual, everyday contact — this fear reflects stigma rather than an actual mode of transmission, and avoiding discrimination against people living with HIV is part of a compassionate response.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} claims that once a person is vaccinated against COVID-19, they no longer need to follow any other precaution. Is this claim accurate?`,
    correct: "No — vaccination helps protect against COVID-19, but hand hygiene, masks, and avoiding crowded spaces when unwell remain useful additional precautions",
    wrong: [
      "Yes — vaccination alone removes any need for other precautions",
      "No — vaccination actually has no protective effect against COVID-19",
      "Yes, but only for people who have never had COVID-19 before",
    ],
    explanation: "Vaccination is one named remedy for COVID-19, but it works alongside other measures such as hand hygiene, masks, and avoiding crowded spaces when unwell, not as a complete replacement for them.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is comparing how HIV and COVID-19 typically spread. Which statement correctly distinguishes the two?`,
    correct: "COVID-19 commonly spreads through respiratory droplets and close contact, while HIV spreads through contact with infected blood, mother-to-child transmission, or unprotected sexual contact",
    wrong: [
      "Both HIV and COVID-19 spread in exactly the same ways, with no real differences",
      "HIV spreads through coughing and sneezing, while COVID-19 spreads through blood contact",
      "Neither HIV nor COVID-19 can be transmitted from one person to another",
    ],
    explanation: "HIV and COVID-19 spread through different modes — COVID-19 mainly through respiratory droplets and close contact, HIV through infected blood, mother-to-child transmission, or unprotected sexual contact.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says that because a woman in Islam has the right to work and own property, she therefore has no responsibilities toward her family at all. Is this reasoning sound?`,
    correct: "No — having these rights does not remove a woman's role and responsibilities in the family; rights and responsibilities exist alongside each other",
    wrong: [
      "Yes — rights and family responsibilities cannot exist together",
      "Yes — once a woman works, she is exempt from all family life",
      "No — but only because working women rarely have any rights at all",
    ],
    explanation: "A woman's rights to work, own property, and seek education exist alongside her role in family life — one does not cancel out the other.",
  }),
];

export const contemporaryIssues: Skill = {
  id: "g7-ire-mu-contemporary-issues",
  code: "MU.3",
  subjectId: "ire",
  strandId: "g7-ire-muamalat",
  grade: 7,
  title: "Contemporary issues",
  description: "The rights of women in Islam, and the modes of transmission and remedies for the spread of HIV and AIDS and COVID-19.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const rights = shuffle(rng, ISSUE_FACTS.filter((f) => f.topic === "rights")).slice(0, 4);
      const transmission = shuffle(rng, ISSUE_FACTS.filter((f) => f.topic === "transmission")).slice(0, 4);
      const prevention = shuffle(rng, ISSUE_FACTS.filter((f) => f.topic === "prevention")).slice(0, 4);
      const chosen = shuffle(rng, [...rights, ...transmission, ...prevention]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["rights", "transmission", "prevention"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Ask whether the statement is about a woman's rights, how HIV/COVID-19 spread, or how to prevent them.",
        explanation: chosen.map((f) => `"${f.text}" — ${TOPIC_LABEL[f.topic].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERM_MEANINGS).slice(0, 5);
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
        hint: "Think about whether the term relates to a woman's rights or to HIV/AIDS and COVID-19.",
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
        hint: "Think about what Islam actually says about this right, or what is actually known about how HIV/COVID-19 spread and can be prevented.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In Islam, a woman has the right to own and", after: "property.", answer: "inherit", accepted: ["inherit"] },
      { before: "A woman's", after: "is required before she can be validly married to a spouse.", answer: "consent", accepted: ["consent"] },
      { before: "Women have the right to pursue", after: "throughout their lives.", answer: "education", accepted: ["education", "knowledge"] },
      { before: "Women have the right to work and earn a living", after: ".", answer: "independently", accepted: ["independently"] },
      { before: "HIV can be transmitted through contact with infected", after: ", such as through unsafe blood transfusions.", answer: "blood", accepted: ["blood"] },
      { before: "Sharing unsterilized", after: "or sharp instruments can transmit HIV.", answer: "needles", accepted: ["needles"] },
      { before: "HIV can pass from a mother to her child during pregnancy, birth, or", after: ".", answer: "breastfeeding", accepted: ["breastfeeding"] },
      { before: "COVID-19 spreads mainly through respiratory", after: "released when an infected person coughs or sneezes.", answer: "droplets", accepted: ["droplets"] },
      { before: "A named remedy that helps protect a person against COVID-19 by preparing the immune system is", after: ".", answer: "vaccination", accepted: ["vaccination"] },
      { before: "A person living with HIV should adhere to", after: "(antiretroviral) treatment and regular medical care.", answer: "ARVs", accepted: ["arvs", "arv", "antiretrovirals"] },
      { before: "Avoiding", after: "against people living with HIV is an important part of a compassionate response.", answer: "stigma", accepted: ["stigma", "discrimination"] },
      { before: "Choosing", after: "is a named way to help prevent the sexual transmission of HIV.", answer: "abstinence", accepted: ["abstinence"] },
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
      hint: "Recall the rights of women in Islam, and the modes of transmission and remedies for HIV/AIDS and COVID-19.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
