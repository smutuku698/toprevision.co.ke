import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, neighbour, place, type ScenarioMC } from "./shared";

// KICD Grade 7 HRE, Strand 2.0 → Sub-strand 2.1 "Scriptural texts" (14 lessons).
// Four texts are named, one per faith, and the rubric grades distinguishing ALL FOUR (three only
// reaches "approaching expectations") — so every branch below draws on all four, never a subset of
// two or three. KICD's transliterations ("Uttradhyan Sutra", "Suittanipata") are used in
// learner-facing text, with the more common spellings noted in explanations where it helps.
//
// Visual scope: declined — no scriptural or devotional primitive exists in Assests-svg/ or in
// VisualSpec, and rendering sacred texts as generated cartoon SVG would be inappropriate.
// See curriculum-reference/grade-7/hindu-religious-education.json → visualCoverageDecision.

const SHANTI_ORDER_PROMPTS = [
  "The Shanti Mantra of Yajur Ved 36.17 calls down peace over creation in a set order. Arrange these parts of creation as the mantra names them.",
  "Put these parts of creation into the order the Shanti Mantra of Yajur Ved 36.17 names them.",
  "The Shanti Mantra names these parts of creation in a set sequence. Arrange them correctly.",
  "Sequence these parts of creation as Yajur Ved 36.17 lists them.",
  "Arrange these domains of peace in the order the Shanti Mantra recites them.",
  "Sort these parts of creation into the order the mantra itself follows.",
];

const HARIKESHI_ORDER_PROMPTS = [
  "Arrange the events of the Harikeshi Bala account (Uttradhyan Sutra, Chapter 12) in the order they happened.",
  "Put the events of the Harikeshi Bala account into the order they occurred.",
  "Sequence these events from Uttradhyan Sutra Chapter 12, the Harikeshi Bala account, correctly.",
  "Order these moments from the story of Harikeshi Bala as they actually happened.",
  "Arrange these steps of the Harikeshi Bala narrative from first to last.",
  "Sort the events of Harikeshi Bala's story into the order they took place.",
];

const SOURCE_SORT_PROMPTS = [
  "Sort each statement under the Scriptural text it belongs to.",
  "Group these statements under the Scriptural text each one describes.",
  "Decide which set Scriptural text each statement belongs to, and sort it there.",
  "Sort each fact into the correct Scriptural text.",
  "Place each statement under the text it belongs to.",
  "Read each fact and sort it under the matching Scriptural text.",
];

const TRADITION_MATCH_PROMPTS = [
  "Match each of the four set Scriptural texts to its faith tradition.",
  "Pair each Scriptural text with its faith tradition.",
  "Connect each of the four set texts to the tradition it comes from.",
  "Link each Scriptural text below to its faith tradition.",
  "Match each text to the faith tradition it belongs to.",
  "Choose the correct faith tradition for each Scriptural text.",
];

const TEACHING_MATCH_PROMPTS = [
  "Match each set Scriptural text to the way it promotes peace and harmony.",
  "Pair each Scriptural text with how it promotes peace and harmony.",
  "Connect each text to the way it teaches peace and harmony.",
  "Link each Scriptural text below to its approach to peace and harmony.",
  "Match each text to the teaching that shows how it promotes peace.",
  "Choose the correct peace-and-harmony teaching for each Scriptural text.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
];

const TEXTS = [
  {
    id: "yajur",
    label: "Yajur Ved — Shanti Mantra (Ch. 36, 17)",
    short: "Shanti Mantra",
    tradition: "Sanatan/Vedic",
    teaching: "Peace is called down on every part of creation — sky, earth, waters, plants and trees — not on people alone",
  },
  {
    id: "uttradhyan",
    label: "Uttradhyan Sutra, Chapters 11 and 12",
    short: "Uttradhyan Sutra",
    tradition: "Jain",
    teaching: "Honour belongs to the disciplined and the learned, and a person's worth comes from their deeds, never from their birth",
  },
  {
    id: "suttanipata",
    label: "Suittanipata (Sutta Nipata)",
    short: "Suittanipata",
    tradition: "Buddhist",
    teaching: "Boundless loving-kindness (metta) is to be radiated to every living being, as a mother guards her only child",
  },
  {
    id: "sukhmani",
    label: "Sukhmani Sahib, Ashtpadis 1-8",
    short: "Sukhmani Sahib",
    tradition: "Sikh",
    teaching: "Peace of mind grows from remembering God's Name (Simran), from humility, and from the company of the holy",
  },
] as const;

// The nine domains of peace, in the order Yajur Ved 36.17 itself names them. This is an explicit
// textual sequence in the set text, not an order invented for the sake of an ordering branch.
const SHANTI_DOMAINS = [
  "the heavens (dyauh)",
  "the space between heaven and earth (antariksham)",
  "the earth (prithivi)",
  "the waters (apah)",
  "the herbs and healing plants (oshadhayah)",
  "the trees and forests (vanaspatayah)",
  "all the divine powers (vishwedevah)",
  "Brahman, the all-pervading (brahma)",
  "everything that exists (sarvam)",
] as const;

// Uttradhyan Sutra Chapter 12 (Harikeshiya) — the narrative sequence of the set chapter.
const HARIKESHI_STEPS = [
  "Harikeshi Bala is born into a family that his society treated as the lowest of all",
  "He renounces worldly life and becomes a monk, keeping severe austerity and self-control",
  "While begging for food, he comes to a place where brahmins are performing a fire sacrifice",
  "The brahmins insult him because of his birth and drive him away from the sacrifice",
  "A heavenly being (yaksha) devoted to the monk comes to his defence",
  "The brahmins relent and ask him what a true sacrifice really is",
  "He teaches that true sacrifice is austerity, self-control and non-violence, and that worth comes from a person's deeds, not their birth",
] as const;

// 16 facts across the four texts — well past the 10-fact floor for categorize/click-match pools.
const TEXT_FACTS: { text: string; source: string }[] = [
  { text: "Calls down peace on the heavens, the sky, the earth and the waters", source: "yajur" },
  { text: "Prays for peace on the herbs, the plants and the trees, making the environment part of peace", source: "yajur" },
  { text: "Closes by asking that peace itself become peace, and that it come to the one praying", source: "yajur" },
  { text: "Ends with 'Om shantih shantih shantih' — the word for peace repeated three times", source: "yajur" },
  { text: "Teaches that a person is judged by their deeds and conduct, never by the family they were born into", source: "uttradhyan" },
  { text: "Tells of Harikeshi Bala, a monk insulted at a fire sacrifice because of his birth", source: "uttradhyan" },
  { text: "Teaches that true sacrifice is austerity, self-control and non-violence rather than outward ritual", source: "uttradhyan" },
  { text: "Chapter 11 honours the truly learned and warns against pride, anger and carelessness in a student", source: "uttradhyan" },
  { text: "Asks the practitioner to radiate goodwill towards all beings — seen and unseen, near and far", source: "suttanipata" },
  { text: "Compares boundless loving-kindness to the way a mother would protect her only child", source: "suttanipata" },
  { text: "Is one of the oldest Buddhist collections, a set of teachings preserved in verse", source: "suttanipata" },
  { text: "Uses metta — loving-kindness — as the answer to hostility from others", source: "suttanipata" },
  { text: "Was composed by Guru Arjan Dev Ji and is found in the Guru Granth Sahib", source: "sukhmani" },
  { text: "Its name means the consoler, or peace, of the mind", source: "sukhmani" },
  { text: "Teaches that remembering God's Name (Simran) brings peace and removes fear", source: "sukhmani" },
  { text: "Praises humility and the company of the holy (sadh sangat) as the way to inner peace", source: "sukhmani" },
];

const NUMBER_FACTS = [
  {
    prompt: "Mark the chapter of the Yajur Ved that contains the Shanti Mantra studied in Grade 7.",
    min: 30,
    max: 40,
    value: 36,
    hint: "The design cites it as 'Ch. 36, 17'.",
    explanation: "The Shanti Mantra studied in this sub-strand is Yajur Ved chapter 36, verse 17.",
  },
  {
    prompt: "Within Yajur Ved chapter 36, mark the verse number of the Shanti Mantra.",
    min: 10,
    max: 25,
    value: 17,
    hint: "The design cites it as 'Ch. 36, 17' — the second number is the verse.",
    explanation: "The Shanti Mantra is verse 17 of chapter 36 of the Yajur Ved.",
  },
  {
    prompt: "Mark how many Ashtpadis of Sukhmani Sahib are studied in Grade 7.",
    min: 0,
    max: 24,
    value: 8,
    hint: "The design sets 'Sukhmani Sahib 1-8 Ashtpadi (Summary)'.",
    explanation: "Grade 7 studies a summary of Ashtpadis 1 to 8 of Sukhmani Sahib — eight of the twenty-four in the whole composition.",
  },
  {
    prompt: "Mark the chapter of the Uttradhyan Sutra that tells the story of Harikeshi Bala.",
    min: 5,
    max: 20,
    value: 12,
    hint: "Of the two chapters set for Grade 7, it is the later one.",
    explanation: "Chapter 12 of the Uttradhyan Sutra tells of Harikeshi Bala and teaches that worth comes from deeds, not birth.",
  },
  {
    prompt: "Mark the chapter of the Uttradhyan Sutra that honours the truly learned and warns against pride in a student.",
    min: 5,
    max: 20,
    value: 11,
    hint: "Of the two chapters set for Grade 7, it is the earlier one.",
    explanation: "Chapter 11 of the Uttradhyan Sutra honours the genuinely learned and warns that pride, anger and carelessness spoil a student's learning.",
  },
  {
    prompt: "Mark how many pauris (stanzas) make up each Ashtpadi of Sukhmani Sahib.",
    min: 0,
    max: 16,
    value: 8,
    hint: "The name 'Ashtpadi' itself carries the number.",
    explanation: "'Ashtpadi' means a composition of eight parts — each Ashtpadi of Sukhmani Sahib has eight pauris.",
  },
] as const;

const SCENARIO_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s class in ${place(rng)} is planting trees along a dry riverbank and clearing plastic from the water. ${who} is asked which of the four set Scriptural texts most directly supports treating the river and the trees as part of peace. Which text is it?`,
      correct: "The Yajur Ved Shanti Mantra, which calls down peace on the waters, the herbs and the trees, not on people alone",
      wrong: [
        "Sukhmani Sahib, which teaches peace of mind through remembering God's Name",
        "The Suittanipata, which teaches loving-kindness towards all beings",
        "The Uttradhyan Sutra, which teaches that worth comes from deeds, not birth",
      ],
      explanation:
        "The Shanti Mantra names the waters, herbs and trees among the things peace is asked for — the only one of the four set texts that makes the environment itself the subject of peace. The Suittanipata is the closest rival, but its subject is living beings, not waters and plants.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A learner at a school in ${place(rng)} is left out of a group project because of the community his family comes from. ${who} wants to answer this with a Scriptural teaching from the set texts. Which one speaks to it most directly?`,
      correct: "The Uttradhyan Sutra's account of Harikeshi Bala, which teaches that a person's worth comes from their deeds and not from their birth",
      wrong: [
        "The Shanti Mantra, which prays for peace across the whole of creation",
        "Sukhmani Sahib, which teaches that Simran brings peace of mind",
        "The Suittanipata, which compares loving-kindness to a mother guarding her only child",
      ],
      explanation:
        "Harikeshi Bala was insulted at a sacrifice for the family he was born into, and answered that deeds — not birth — decide worth. That is exactly the situation here. The other three teach peace, inner calm and goodwill, but none of them addresses judging someone by their background.",
    };
  },
  (rng) => {
    const who = name(rng);
    const other = neighbour(rng);
    return {
      prompt: `${other} has been unkind to ${who} for weeks. Rather than retaliate, ${who} deliberately wishes ${other} well each morning and keeps treating him decently. Which of the four set texts is ${who} putting into practice?`,
      correct: "The Suittanipata, which teaches radiating boundless loving-kindness (metta) towards every being, including those who are hostile",
      wrong: [
        "The Uttradhyan Sutra, which teaches that true sacrifice is austerity and self-control",
        "The Shanti Mantra, which calls down peace on the heavens, earth and waters",
        "Sukhmani Sahib, which praises the company of the holy",
      ],
      explanation:
        "Deliberately cultivating goodwill towards someone hostile is metta, the Suittanipata's central practice. The Uttradhyan Sutra's teaching on sacrifice is about ritual versus self-control, and the Shanti Mantra is a prayer over creation rather than a practice directed at one person.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} feels anxious before examinations in ${place(rng)} and cannot settle. An elder advises quiet daily remembrance of God's Name and time spent with the sangat. Which of the four set texts is this advice drawn from?`,
      correct: "Sukhmani Sahib, whose very name means the consoler of the mind and which teaches Simran, humility and holy company as the path to peace of mind",
      wrong: [
        "The Suittanipata, which teaches loving-kindness towards all beings",
        "The Uttradhyan Sutra, which honours the disciplined and the learned",
        "The Shanti Mantra, which prays for peace across all of creation",
      ],
      explanation:
        "Sukhmani Sahib addresses exactly this — inner peace through Simran, humility and the sadh sangat. Metta in the Suittanipata is directed outwards at other beings, and the Shanti Mantra is a prayer over creation rather than a remedy for a troubled mind.",
    };
  },
  (rng) => ({
    prompt: `A pupil in ${place(rng)} is very quick at memorising verses but mocks classmates who are slower, and will not be corrected by anyone. Which chapter of the set texts speaks most directly to him?`,
    correct: "Uttradhyan Sutra Chapter 11, which honours the genuinely learned and warns that pride, anger and carelessness spoil a student's learning",
    wrong: [
      "Uttradhyan Sutra Chapter 12, which teaches that worth comes from deeds rather than birth",
      "The Shanti Mantra, which asks for peace in the waters, herbs and trees",
      "Sukhmani Sahib, which teaches that Simran removes fear",
    ],
    explanation:
      "Chapter 11 is about what makes learning worth honouring — discipline and humility — and names pride and refusal of correction as what ruins it. Chapter 12's subject is birth and worth, which is not what is going wrong here.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s group in ${place(rng)} must present one message that all four set Scriptural texts support. Which message is genuinely common to all four?`,
      correct: "Peace and harmony grow out of how we treat others and ourselves, and are the responsibility of every person",
      wrong: [
        "Peace can only be achieved by people who withdraw completely from society",
        "Peace is the responsibility of religious leaders rather than ordinary people",
        "Peace means avoiding anyone who holds different beliefs from your own",
      ],
      explanation:
        "All four set texts were chosen by the design because they promote peace and harmony, and each places the duty on the reader — praying peace over creation, judging by deeds, radiating metta, remembering the Name. None of them recommends withdrawal, delegation to leaders, or avoiding people who differ.",
    };
  },
  (rng) => ({
    prompt: `An HRE class in ${place(rng)} is asked why the Shanti Mantra names the waters, herbs and trees and not only human beings. Which explanation is best?`,
    correct: "Because the mantra treats peace as covering the whole of creation, so human peace cannot be separated from the state of the environment",
    wrong: [
      "Because plants and waters are considered more important than human beings",
      "Because the mantra is used only during farming ceremonies",
      "Because the words were added later and are not part of the original verse",
    ],
    explanation:
      "The verse moves from the heavens through the earth, the waters, the herbs and the trees to everything that exists — a deliberately complete sweep, showing peace as indivisible. It does not rank plants above people, nor is it restricted to farming.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is making a poster in ${place(rng)} that pairs each of the four set texts with the faith tradition it belongs to. Which pairing is correct?`,
      correct: "Suittanipata — Buddhist",
      wrong: ["Sukhmani Sahib — Jain", "Uttradhyan Sutra — Sikh", "Yajur Ved Shanti Mantra — Buddhist"],
      explanation:
        "The four set texts run one per faith: Yajur Ved (Sanatan/Vedic), Uttradhyan Sutra (Jain), Suittanipata (Buddhist) and Sukhmani Sahib (Sikh). The three wrong pairings each swap a text into a neighbouring tradition.",
    };
  },
  (rng) => ({
    prompt: `A drama group in ${place(rng)} is writing a skit on how humankind can be more peaceful. They want a scene where someone is publicly humiliated for their background and responds by teaching the crowd, without violence. Which set text gives them that scene?`,
    correct: "Uttradhyan Sutra Chapter 12, where Harikeshi Bala is insulted at the sacrifice and answers by teaching what true sacrifice is",
    wrong: [
      "Sukhmani Sahib Ashtpadi 1, which praises the remembrance of God's Name",
      "The Shanti Mantra, which lists the parts of creation over which peace is invoked",
      "The Suittanipata's verses on a mother protecting her only child",
    ],
    explanation:
      "Only the Harikeshiya chapter contains that confrontation and its non-violent teaching response. The other three passages are prayers, praises and similes rather than narrative scenes with a crowd.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} says the four set texts must disagree with each other, because they come from four different faiths. Looking at what each one actually teaches about peace, what is the better conclusion?`,
      correct: "They approach peace differently — through creation, through deeds, through goodwill and through remembrance — but all four point learners towards peace and harmony",
      wrong: [
        "They agree completely, and use exactly the same words and images for peace",
        "They disagree, so learners should only study the text from their own tradition",
        "They cannot be compared, because scriptures from different faiths have nothing in common",
      ],
      explanation:
        "The design selected these four precisely as texts that promote peace and harmony. They differ in route and imagery — which is not the same as disagreeing — and comparing them is the whole point of the sub-strand.",
    };
  },
  (rng) => ({
    prompt: `During a community clean-up in ${place(rng)}, an elder recites 'Om shantih shantih shantih' at the close. ${name(rng)} asks why the word is repeated three times. Which answer is correct?`,
    correct: "The threefold repetition asks for peace from every kind of disturbance — from nature, from other beings, and from within oneself",
    wrong: [
      "It is repeated three times because the verse has three lines",
      "It is repeated once for each of the three set texts studied alongside it",
      "It is repeated three times so that the recitation lasts long enough for a ceremony",
    ],
    explanation:
      "The threefold 'shantih' traditionally covers disturbances from natural forces, from other living beings, and from one's own mind and body — a complete request for peace, matching the mantra's sweep across the whole of creation.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s HRE group in ${place(rng)} is recording short videos to share Scriptural messages that foster peace. They want one message a viewer could act on the same day, drawn from the Suittanipata. Which is the best choice?`,
      correct: "Deliberately wish well today to one person you find difficult, in the same spirit as a mother guarding her only child",
      wrong: [
        "Memorise the names of the collections in which the text is preserved",
        "Wait until you feel calm before showing kindness to anyone",
        "Show kindness only to those who have first been kind to you",
      ],
      explanation:
        "Metta is a practice to be extended to all beings, including difficult ones, and the mother-and-child image is the text's own. Memorising collection names is not a practice, and conditioning kindness on the other person's behaviour is exactly what metta sets aside.",
    };
  },
];

const FILL_BLANK_TEMPLATES = [
  {
    before: "The Shanti Mantra studied in Grade 7 comes from the ",
    after: " Ved, chapter 36, verse 17.",
    correctAnswer: "Yajur",
    acceptedAnswers: ["yajur", "yajur ved", "yajurveda", "yajur veda"],
    hint: "It is one of the four Vedas, and the design names it directly.",
    explanation: "The set Shanti Mantra is Yajur Ved 36.17, which calls down peace on every part of creation.",
  },
  {
    before: "The Shanti Mantra prays for peace not only for people but also for the waters, the herbs and the ",
    after: ", making the environment part of peace.",
    correctAnswer: "trees",
    acceptedAnswers: ["trees", "tree", "plants", "vanaspati"],
    hint: "Vanaspatayah — the woody plants of the forest.",
    explanation: "By naming the waters, herbs and trees, the mantra treats peace as covering the whole of creation, not human society alone.",
  },
  {
    before: "The Shanti Mantra closes with the word for peace, '",
    after: "', repeated three times.",
    correctAnswer: "shantih",
    acceptedAnswers: ["shantih", "shanti", "shantihi"],
    hint: "It is the word the mantra itself is named after.",
    explanation: "'Om shantih shantih shantih' closes the mantra — peace asked for against disturbance from nature, from other beings, and from within oneself.",
  },
  {
    before: "The Jain text set for Grade 7 is the Uttradhyan Sutra, chapters 11 and ",
    after: ".",
    correctAnswer: "12",
    acceptedAnswers: ["12", "twelve"],
    hint: "The second of the two chapters tells the story of Harikeshi Bala.",
    explanation: "Chapters 11 and 12 of the Uttradhyan Sutra are set: chapter 11 on honouring the truly learned, chapter 12 on Harikeshi Bala.",
  },
  {
    before: "In Uttradhyan Sutra chapter 12, the monk ",
    after: " is insulted at a fire sacrifice because of the family he was born into.",
    correctAnswer: "Harikeshi Bala",
    acceptedAnswers: ["harikeshi bala", "harikeshi", "harikesi bala", "harikesi"],
    hint: "The chapter is named after him — the Harikeshiya chapter.",
    explanation: "Harikeshi Bala answered the insult by teaching that true sacrifice is austerity, self-control and non-violence, and that worth comes from deeds, not birth.",
  },
  {
    before: "Uttradhyan Sutra chapter 12 teaches that a person's worth comes from their ",
    after: ", not from the family they were born into.",
    correctAnswer: "deeds",
    acceptedAnswers: ["deeds", "actions", "conduct", "karma"],
    hint: "What a person does, rather than where they came from.",
    explanation: "This is the chapter's central teaching on social harmony — conduct, not birth, is what makes a person worthy of honour.",
  },
  {
    before: "The Buddhist text set for Grade 7 is the ",
    after: ", one of the oldest Buddhist collections, preserved in verse.",
    correctAnswer: "Suittanipata",
    acceptedAnswers: ["suittanipata", "sutta nipata", "suttanipata", "sutta-nipata"],
    hint: "The design spells it 'Suittanipata'; it is also written Sutta Nipata.",
    explanation: "The Suittanipata (Sutta Nipata) contains the verses on metta — boundless loving-kindness towards all beings.",
  },
  {
    before: "The Suittanipata compares boundless loving-kindness to the way a ",
    after: " would protect her only child.",
    correctAnswer: "mother",
    acceptedAnswers: ["mother"],
    hint: "The most protective relationship the text could name.",
    explanation: "The image sets the measure of metta: goodwill towards every being as complete as a mother's protection of her only child.",
  },
  {
    before: "The Buddhist word for the boundless loving-kindness taught in the Suittanipata is ",
    after: ".",
    correctAnswer: "metta",
    acceptedAnswers: ["metta", "maitri"],
    hint: "It gives its name to the Metta Sutta.",
    explanation: "Metta is loving-kindness radiated to all beings — seen and unseen, near and far — and is the Suittanipata's answer to hostility.",
  },
  {
    before: "Sukhmani Sahib was composed by Guru ",
    after: " Dev Ji and is found in the Guru Granth Sahib.",
    correctAnswer: "Arjan",
    acceptedAnswers: ["arjan", "arjan dev", "arjun"],
    hint: "The fifth Sikh Guru.",
    explanation: "Guru Arjan Dev Ji composed Sukhmani Sahib, whose name means the consoler, or peace, of the mind.",
  },
  {
    before: "The name Sukhmani Sahib means the peace, or consoler, of the ",
    after: ".",
    correctAnswer: "mind",
    acceptedAnswers: ["mind", "heart"],
    hint: "Sukh means peace or comfort; mani here refers to what is calmed.",
    explanation: "Sukhmani Sahib is recited for peace of mind, which its Ashtpadis link to Simran, humility and the company of the holy.",
  },
  {
    before: "Sukhmani Sahib teaches that peace of mind grows from ",
    after: " — the remembrance of God's Name.",
    correctAnswer: "Simran",
    acceptedAnswers: ["simran", "naam simran", "nam simran"],
    hint: "The practice of continually remembering and repeating the Name.",
    explanation: "Ashtpadis 1-8 dwell on Simran, humility and sadh sangat as the means to inner peace and freedom from fear.",
  },
] as const;

export const scripturalTexts: Skill = {
  id: "g7-hre-sc-scriptural-texts",
  code: "SC.1",
  subjectId: "hre",
  strandId: "g7-hre-sc",
  grade: 7,
  title: "Scriptural Texts",
  description:
    "The four set Scriptural texts that promote peace and harmony — the Yajur Ved Shanti Mantra (Ch. 36, 17), Uttradhyan Sutra chapters 11 and 12, the Suittanipata, and Sukhmani Sahib Ashtpadis 1-8 — and applying their values in daily life.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["order", "source-sort", "tradition-match", "teaching-match", "scenario", "citation", "fill-blank"] as const
    );

    if (branch === "order") {
      // Two genuine textual sequences, and the Shanti Mantra one is windowed so the item set itself
      // varies between draws rather than only being reshuffled.
      if (rng() < 0.5) {
        const span = randInt(rng, 5, SHANTI_DOMAINS.length);
        const start = randInt(rng, 0, SHANTI_DOMAINS.length - span);
        const window = SHANTI_DOMAINS.slice(start, start + span);
        const ordered = window.map((label, i) => ({ id: `d${i}`, label }));
        return {
          kind: "ordering",
          prompt: randChoice(rng, SHANTI_ORDER_PROMPTS),
          instruction: "Click them in the order the mantra names them, from first to last.",
          items: shuffle(rng, ordered),
          correctOrder: ordered.map((d) => d.id),
          hint: "The mantra sweeps downwards from the heavens to the earth, then through the waters and growing things, and finally out to everything that exists.",
          explanation: `In full, the mantra names: ${SHANTI_DOMAINS.join(" → ")}.`,
        };
      }
      const ordered = HARIKESHI_STEPS.map((label, i) => ({ id: `h${i}`, label }));
      return {
        kind: "ordering",
        prompt: randChoice(rng, HARIKESHI_ORDER_PROMPTS),
        instruction: "Click the events in order, from first to last.",
        items: shuffle(rng, ordered),
        correctOrder: ordered.map((h) => h.id),
        hint: "It begins with his birth into a despised family and ends with his teaching on what a true sacrifice is.",
        explanation: HARIKESHI_STEPS.join(" → "),
      };
    }

    if (branch === "source-sort") {
      const pool = shuffle(rng, TEXT_FACTS).slice(0, 8);
      const items = pool.map((f, i) => ({ id: `t${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`t${i}`] = f.source));
      return {
        kind: "categorize",
        prompt: randChoice(rng, SOURCE_SORT_PROMPTS),
        items,
        buckets: TEXTS.map((t) => ({ id: t.id, label: t.short })),
        correctBucket,
        hint: "Peace over creation, worth from deeds, loving-kindness to all beings, peace of mind through the Name — one theme belongs to each text.",
        explanation: pool.map((f) => `"${f.text}" — ${TEXTS.find((t) => t.id === f.source)!.short}.`).join(" "),
      };
    }

    if (branch === "tradition-match") {
      const tokens = shuffle(rng, TEXTS.map((t) => ({ id: t.id, label: t.short })));
      const targets = shuffle(rng, TEXTS.map((t) => ({ id: t.id, label: `${t.tradition} tradition` })));
      const correctMap: Record<string, string> = {};
      for (const t of TEXTS) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, TRADITION_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "The design sets exactly one text per faith — Sanatan/Vedic, Jain, Buddhist and Sikh.",
        explanation: TEXTS.map((t) => `${t.short} — ${t.tradition}.`).join(" "),
      };
    }

    if (branch === "teaching-match") {
      const tokens = shuffle(rng, TEXTS.map((t) => ({ id: t.id, label: t.short })));
      const targets = shuffle(rng, TEXTS.map((t) => ({ id: t.id, label: t.teaching })));
      const correctMap: Record<string, string> = {};
      for (const t of TEXTS) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, TEACHING_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Each text reaches peace by a different route: through creation, through deeds, through goodwill, or through remembrance.",
        explanation: TEXTS.map((t) => `${t.short} — ${t.teaching.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "citation") {
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

    if (branch === "scenario") {
      const q = randChoice(rng, SCENARIO_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "All four options describe something a set text really teaches — choose the one whose teaching fits this particular situation.",
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
