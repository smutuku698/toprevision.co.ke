import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No `ordering` branch: significance and ways of showing belief in Tawheed are a set of
// related facts, not a curriculum-stated sequence — a 5th QuestionKind is not manufactured here.

const CATEGORIZE_PROMPTS = [
  "Sort each statement as describing the significance of Tawheed, or a way of showing belief in it.",
  "Group each statement under significance of Tawheed, or a way of showing belief in it.",
  "Decide whether each statement is about the significance of Tawheed or a way of showing belief in it, and sort it there.",
  "Sort each statement into the correct category: significance of Tawheed, or showing belief in it.",
  "Place each statement into the right bucket — significance, or a way of showing belief.",
  "Categorise each statement as significance of Tawheed or a way of showing belief.",
];

const MATCH_PROMPTS = [
  "Match each term about Tawheed to its meaning.",
  "Pair each term about Tawheed with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term about Tawheed to the definition that fits it.",
  "Choose the correct meaning for each term about Tawheed.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

interface TopicFact {
  text: string;
  topic: "significance" | "showing-belief";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  significance: "About the significance of Tawheed",
  "showing-belief": "About ways of showing belief in Tawheed",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Tawheed is the belief in the oneness of Allah, the basis of the entire Islamic faith", topic: "significance" },
  { text: "Believing in Tawheed frees the heart from fear of anything or anyone besides Allah", topic: "significance" },
  { text: "Tawheed gives a Muslim a clear purpose and direction in life", topic: "significance" },
  { text: "Tawheed unites all acts of worship toward a single source, rather than dividing devotion", topic: "significance" },
  { text: "A firm belief in Tawheed brings peace of mind, since ultimate control rests with Allah alone", topic: "significance" },
  { text: "Worshipping Allah alone, with no partners, is a direct way of showing belief in Tawheed", topic: "showing-belief" },
  { text: "Seeking help only from Allah, rather than relying on charms or superstition, shows belief in Tawheed", topic: "showing-belief" },
  { text: "Trusting in Allah's decree (Qadar) during hardship shows belief in Tawheed", topic: "showing-belief" },
  { text: "Thanking Allah alone for blessings received, rather than crediting luck or objects, shows belief in Tawheed", topic: "showing-belief" },
  { text: "Avoiding reliance on fortune-tellers or lucky charms for protection shows belief in Tawheed", topic: "showing-belief" },
  { text: "Turning to Allah alone in prayer during times of difficulty shows belief in Tawheed", topic: "showing-belief" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Tawheed", meaning: "Belief in the oneness of Allah — the foundation of Islamic faith" },
  { term: "Freedom from fear", meaning: "One significance of Tawheed — the heart is freed from fearing anything besides Allah" },
  { term: "Unified worship", meaning: "One significance of Tawheed — all acts of worship are directed to a single source" },
  { term: "Worshipping Allah alone", meaning: "A direct way of showing belief in Tawheed in daily practice" },
  { term: "Trusting Allah's decree", meaning: "Showing belief in Tawheed by accepting Qadar during hardship" },
  { term: "Avoiding charms/fortune-tellers", meaning: "A way of showing belief in Tawheed by rejecting reliance on anything besides Allah" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is anxious before an exam and turns only to Allah in prayer, rather than to a lucky charm a classmate suggested. What does this choice demonstrate?`,
    correct: "A practical demonstration of belief in Tawheed — trusting Allah alone rather than relying on an object believed to bring luck",
    wrong: ["Nothing significant — the choice between prayer and a charm has no connection to Tawheed", "A sign of weak faith, since seeking any form of comfort during anxiety is discouraged", "A rejection of Tawheed, since prayer alone cannot address a real exam outcome"],
    explanation: "Turning to Allah alone instead of a lucky charm is exactly the kind of daily choice that shows belief in Tawheed — rejecting reliance on anything believed to have independent power.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `After a difficult harvest season in ${place(rng)}, ${who} accepts the outcome calmly, believing it was Allah's decree, and continues working hard the following season. How does this reflect Tawheed?`,
      correct: "It shows trust in Allah's decree (Qadar), a direct way of showing belief in Tawheed, without abandoning effort or responsibility",
      wrong: ["It shows the opposite of Tawheed, since accepting hardship calmly means giving up on effort entirely", "It has no connection to Tawheed, since Qadar is a separate, unrelated pillar", "It shows weak faith, since a true believer should never accept a difficult outcome"],
      explanation: "Trusting Allah's decree while still working hard afterward shows Tawheed in practice — acceptance of Qadar does not mean abandoning responsibility or effort.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} argues that believing in Tawheed only matters for what happens in the Hereafter, with no real effect on daily peace of mind. Evaluate this claim.`,
    correct: "Flawed — Tawheed brings peace of mind now, since a believer trusts that ultimate control over all things rests with Allah alone, easing daily anxiety",
    wrong: ["Sound — Tawheed has no bearing on a person's mindset in this life at all", "Sound — peace of mind comes only from external circumstances, never from belief", "Flawed — but only because Tawheed actually has no connection to the Hereafter either"],
    explanation: "Tawheed's significance includes present peace of mind, not only reward in the Hereafter — trusting that Allah alone holds ultimate control eases daily anxiety.",
  }),
  (rng) => ({
    prompt: `${name(rng)} credits 'good luck' rather than Allah whenever something good happens, while still praying regularly. Does this fully align with Tawheed?`,
    correct: "No — Tawheed calls for crediting Allah alone for blessings received; attributing good outcomes to luck contradicts that belief even if prayer continues",
    wrong: ["Yes — praying regularly is the only requirement of Tawheed, regardless of what one credits blessings to", "Yes — luck and Allah's will are considered the same thing in Islamic belief", "No — but only because praying regularly is itself discouraged in Islam"],
    explanation: "Tawheed requires crediting Allah alone for blessings — attributing good fortune to 'luck' instead undermines that belief, even alongside regular prayer.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says that a Muslim can worship Allah while also occasionally seeking a fortune-teller's advice 'just to be safe.' What is the flaw in this reasoning?`,
    correct: "It contradicts Tawheed — seeking guidance from a fortune-teller implies trust in a source of power besides Allah, undermining belief in His oneness",
    wrong: ["There is no flaw — combining both practices is fully compatible with Tawheed", "The flaw is only that fortune-tellers are unreliable, not that the practice conflicts with belief", "Tawheed only concerns formal worship, not everyday choices like this"],
    explanation: "Avoiding reliance on fortune-tellers is explicitly part of showing belief in Tawheed — seeking their guidance implies trust in a power besides Allah, which contradicts it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} explains to a younger sibling in ${place(rng)} why Muslims direct every act of worship — prayer, fasting, charity — toward Allah alone rather than dividing devotion. What is the best explanation?`,
      correct: "Tawheed unites all worship toward one source; directing devotion elsewhere would contradict the very foundation of the faith",
      wrong: ["There is no real reason — it is simply a cultural tradition with no deeper meaning", "Worship can be divided among multiple sources without any conflict with Islamic teaching", "Unifying worship is only a modern practice, not connected to Tawheed at all"],
      explanation: "Tawheed's significance includes unifying all worship toward a single source — dividing devotion elsewhere would directly conflict with the foundation of Islamic belief.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says fear of the future can never be reduced by religious belief. How would a Muslim who understands Tawheed respond?`,
    correct: "Tawheed frees the heart from fear of anything besides Allah, offering real reassurance since ultimate control belongs to Him alone",
    wrong: ["A Muslim would agree completely — religious belief has no effect on fear", "Tawheed actually increases fear, since it emphasises accountability before Allah", "Tawheed only addresses fear of the Hereafter, never fear about worldly matters"],
    explanation: "One of Tawheed's central significances is freeing the heart from fear of anything besides Allah — a real, practical source of reassurance in daily life.",
  }),
  (rng) => ({
    prompt: `${name(rng)} keeps a protective amulet 'just in case,' while insisting he still fully believes only Allah has real power. Is this consistent with showing belief in Tawheed?`,
    correct: "No — relying on an amulet for protection, even alongside stated belief, is inconsistent with Tawheed, which calls for seeking protection from Allah alone",
    wrong: ["Yes — stated belief is all that matters, regardless of what objects a person also relies on", "Yes — amulets are considered a form of worship directed at Allah in Islamic teaching", "No — but only because amulets are expensive, not because of any belief conflict"],
    explanation: "Genuine Tawheed requires that reliance for protection rests with Allah alone — keeping an amulet 'just in case' reveals a real inconsistency, regardless of stated belief.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says Tawheed is 'just a belief to recite,' with no bearing on daily decisions. Evaluate this view against the ways of showing belief in Tawheed.`,
    correct: "Flawed — Tawheed is meant to be lived out through daily choices, like worshipping Allah alone, trusting His decree, and avoiding reliance on charms or fortune-tellers",
    wrong: ["Sound — Tawheed is purely a verbal statement with no connection to daily choices", "Sound — daily decisions have no relevance to matters of Islamic faith", "Flawed — but only because Tawheed applies exclusively to worship rituals, not any other choices"],
    explanation: "Showing belief in Tawheed is explicitly about daily practice — worship, trust in Allah's decree, and avoiding reliance on anything besides Him — not a belief recited and set aside.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees a friend struggling with fear about the future and reminds them that Allah alone controls all outcomes, encouraging trust rather than panic. Which significance of Tawheed does this advice draw on?`,
    correct: "Freedom from fear of anything besides Allah, since trusting His control over outcomes eases anxiety",
    wrong: ["Unified worship, since the advice has nothing to do with directing worship toward Allah", "This advice has no connection to Tawheed at all", "Tawheed's significance is unrelated to how a Muslim handles fear or anxiety"],
    explanation: "Reminding someone that Allah alone controls outcomes draws directly on Tawheed's significance of freeing the heart from fear of anything besides Him.",
  }),
];

export const significanceOfTawheed: Skill = {
  id: "g7-ire-pi-tawheed",
  code: "PI.1",
  subjectId: "ire",
  strandId: "g7-ire-iman",
  grade: 7,
  title: "Significance of Tawheed",
  description: "The significance of Tawheed (belief in the oneness of Allah) and the ways a Muslim shows belief in Tawheed in daily life.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize") {
      const significance = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "significance")).slice(0, 5);
      const showing = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "showing-belief")).slice(0, 5);
      const chosen = shuffle(rng, [...significance, ...showing]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["significance", "showing-belief"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Significance statements explain why Tawheed matters; ways of showing belief describe practical daily actions.",
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
        hint: "Think about whether the term names Tawheed itself, why it matters, or how it is shown in practice.",
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
        hint: "Think about whether the choice in the scenario reflects trusting Allah alone or relying on something else.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Tawheed is the belief in the", after: "of Allah.", answer: "oneness", accepted: ["oneness"] },
      { before: "Tawheed is the very basis of the Islamic", after: ".", answer: "faith", accepted: ["faith"] },
      { before: "Believing in Tawheed frees the heart from", after: "of anything besides Allah.", answer: "fear", accepted: ["fear"] },
      { before: "Tawheed unites all acts of", after: "toward one single source.", answer: "worship", accepted: ["worship"] },
      { before: "Trusting in Allah's decree is called", after: ".", answer: "Qadar", accepted: ["qadar"] },
      { before: "Worshipping Allah", after: ", with no partners, shows belief in Tawheed.", answer: "alone", accepted: ["alone"] },
      { before: "A believer with strong Tawheed avoids relying on", after: "or fortune-tellers.", answer: "charms", accepted: ["charms", "amulets"] },
      { before: "A believer with strong Tawheed thanks", after: "alone for blessings received.", answer: "Allah", accepted: ["allah"] },
      { before: "Belief in Tawheed gives a Muslim clear purpose and", after: "in life.", answer: "direction", accepted: ["direction"] },
      { before: "Tawheed brings peace of mind since ultimate", after: "rests with Allah alone.", answer: "control", accepted: ["control"] },
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
      hint: "Recall the significance of Tawheed and the ways it is shown in daily life.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
