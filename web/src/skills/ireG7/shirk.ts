import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// No `ordering` branch: types, manifestations, and effects of shirk are a classification and a
// set of consequences, not a curriculum-stated sequence — a 5th QuestionKind is not manufactured here.

const CATEGORIZE_TYPE_PROMPTS = [
  "Sort each example as major shirk or minor shirk.",
  "Group each example under major shirk or minor shirk.",
  "Decide whether each example is major shirk or minor shirk, and sort it there.",
  "Sort each example into the correct category: major shirk, or minor shirk.",
  "Place each example into the right bucket — major shirk, or minor shirk.",
  "Categorise each example as major shirk or minor shirk.",
];

const CATEGORIZE_TOPIC_PROMPTS = [
  "Sort each statement as describing how shirk is manifested, or an effect of shirk.",
  "Group each statement under a manifestation of shirk, or an effect of shirk.",
  "Decide whether each statement is a manifestation or an effect of shirk, and sort it there.",
  "Sort each statement into the correct category: manifestation, or effect.",
  "Place each statement into the right bucket — a manifestation, or an effect of shirk.",
  "Categorise each statement as a manifestation or an effect of shirk.",
];

const MATCH_PROMPTS = [
  "Match each term about shirk to its meaning.",
  "Pair each term about shirk with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term about shirk to the definition that fits it.",
  "Choose the correct meaning for each term about shirk.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

interface ShirkExample {
  example: string;
  type: "major" | "minor";
}
const TYPE_LABEL: Record<ShirkExample["type"], string> = {
  major: "Shirk al-Akbar (major shirk)",
  minor: "Shirk al-Asghar (minor shirk)",
};
const SHIRK_EXAMPLES: ShirkExample[] = [
  { example: "Directly worshipping an idol or statue instead of Allah", type: "major" },
  { example: "Believing another being shares Allah's power to create or control the universe", type: "major" },
  { example: "Praying to a deceased person for help, believing they can grant requests independently of Allah", type: "major" },
  { example: "Rejecting Allah's oneness entirely and worshipping multiple gods", type: "major" },
  { example: "Praying visibly and energetically only when others are watching, to be praised (riya)", type: "minor" },
  { example: "Swearing an oath by something other than Allah, such as by one's own honour", type: "minor" },
  { example: "Wearing an amulet or charm believed to bring protection on its own, apart from Allah", type: "minor" },
  { example: "Consulting a fortune-teller for guidance about the future", type: "minor" },
  { example: "Performing a good deed mainly to be seen and admired rather than for Allah's sake", type: "minor" },
];

interface TopicFact {
  text: string;
  topic: "manifestation" | "effect";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  manifestation: "How shirk is manifested",
  effect: "An effect of shirk",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "Worshipping idols instead of, or alongside, Allah", topic: "manifestation" },
  { text: "Believing charms or amulets protect a person independently of Allah", topic: "manifestation" },
  { text: "Seeking guidance from fortune-tellers about the future", topic: "manifestation" },
  { text: "Performing good deeds mainly to be praised by others, rather than for Allah's sake", topic: "manifestation" },
  { text: "Swearing an oath by something or someone other than Allah", topic: "manifestation" },
  { text: "It can nullify the reward of a good deed when the shirk involved is major", topic: "effect" },
  { text: "It weakens the sincerity of a Muslim's worship", topic: "effect" },
  { text: "It is described as the one sin Allah does not forgive if a person dies upon it unrepentant", topic: "effect" },
  { text: "It damages a Muslim's relationship and trust with Allah", topic: "effect" },
  { text: "It can lead a person to place their trust in powerless objects or people instead of Allah", topic: "effect" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Shirk", meaning: "Associating partners with Allah in worship or belief" },
  { term: "Shirk al-Akbar", meaning: "Major shirk — directly worshipping or believing in a power equal to Allah" },
  { term: "Shirk al-Asghar", meaning: "Minor shirk — subtler acts like showing off in worship or excessive reliance on charms" },
  { term: "Riya", meaning: "Showing off in worship or good deeds to be seen and praised by others" },
  { term: "Unforgivable if unrepented", meaning: "How Islamic teaching describes dying upon major shirk without repentance" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} prays with unusual energy and volume only when classmates are nearby, but prays quickly and half-heartedly when alone. What does this behaviour illustrate?`,
    correct: "Riya (showing off in worship) — a form of minor shirk, since the worship is being directed partly toward being seen rather than solely toward Allah",
    wrong: ["Full sincerity, since praying at all is what matters regardless of who is watching", "Major shirk, since any change in behaviour when others are present counts as worshipping another god", "No connection to shirk at all, since prayer style naturally varies"],
    explanation: "Changing how one worships based on who is watching, to gain praise, is riya — a recognised form of minor shirk that undermines sincerity even though the outward act (praying) continues.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} wears a charm bought from a roadside seller in ${place(rng)}, believing it alone protects against harm, separate from Allah's will. Which type of shirk does this best illustrate?`,
      correct: "Shirk al-Asghar (minor shirk) — relying on the charm's own power for protection, apart from Allah",
      wrong: ["Shirk al-Akbar (major shirk) — this level requires directly worshipping the charm as a god", "No shirk at all, since wearing an object is not itself an act of worship", "Tawheed — this actually reflects belief in Allah's oneness, not a departure from it"],
      explanation: "Believing an object like a charm has independent protective power, separate from Allah, is the kind of subtler reliance classified as minor shirk, not the outright worship that defines major shirk.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} openly bows before a statue believed to control the harvest, asking it directly for rain. Which type of shirk is this?`,
    correct: "Shirk al-Akbar (major shirk) — directly worshipping something other than Allah",
    wrong: ["Shirk al-Asghar (minor shirk) — this level only covers subtler acts like showing off", "This is not shirk, since it concerns farming rather than formal religion", "Tawheed — worship directed at a specific object for a specific need is a valid form of Tawheed"],
    explanation: "Directly worshipping and petitioning an idol is the clearest form of major shirk — associating a created object with Allah's own power and right to worship.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that minor shirk is 'basically harmless' since it does not involve worshipping an idol. Evaluate this reasoning.`,
    correct: "Flawed — minor shirk still weakens sincerity in worship and can damage a Muslim's relationship with Allah, even without idol worship",
    wrong: ["Sound — only major shirk carries any real spiritual consequence", "Sound — minor shirk is simply a cultural custom with no religious weight", "Flawed — but only because minor shirk is actually worse than major shirk"],
    explanation: "Even without idol worship, minor shirk weakens sincerity and damages a believer's relationship with Allah — it is a real spiritual harm, not a harmless custom.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} visits a fortune-teller before an important decision, trusting the prediction over sound planning and prayer. What effect of shirk does this risk?`,
    correct: "Placing trust in a powerless source instead of Allah, which is one of the recognised effects of shirk",
    wrong: ["No real effect, since fortune-telling is simply a form of entertainment", "It strengthens Tawheed, since seeking any guidance shows humility", "It only affects the fortune-teller, not the person seeking the prediction"],
    explanation: "Turning to a fortune-teller for guidance places trust in a source with no real power over the future — exactly the misplaced trust that shirk's effects warn against.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} performs a large public act of charity mainly hoping to be praised on social media, though he also genuinely wants to help. How should this mixed motive be understood in light of shirk?`,
      correct: "The desire to be praised introduces an element of riya (minor shirk), even though some genuine intention to help is also present",
      wrong: ["It is entirely free of shirk, since some sincere intention to help is present", "It is major shirk, since publicising a good deed is itself equivalent to idol worship", "Mixed motives have no bearing on shirk at all, only fully public acts do"],
      explanation: "Riya can exist alongside genuine intention — seeking praise as part of the motive is enough to introduce minor shirk into an otherwise good deed.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} claims that avoiding idol worship is the only requirement for staying entirely free of shirk. What is the flaw in this view?`,
    correct: "It overlooks minor shirk — subtler acts like showing off in worship or relying on charms can also compromise sincerity, even without idol worship",
    wrong: ["There is no flaw — avoiding idols is genuinely the only requirement", "The flaw is that idol worship is not actually a form of shirk at all", "Minor shirk does not exist as a real category in Islamic teaching"],
    explanation: "Avoiding idol worship addresses only major shirk — minor shirk covers subtler behaviours like riya and reliance on charms, which also need to be guarded against.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} swears an oath 'by my father's honour' during an argument, rather than swearing by Allah. What does Islamic teaching say about this practice?`,
    correct: "It is classified as a form of minor shirk, since swearing by something other than Allah misplaces the reverence due to Him alone",
    wrong: ["It is fully acceptable, since honour is a respected value in many cultures", "It is major shirk, equal in severity to worshipping an idol", "It has no connection to shirk, since it is simply a figure of speech"],
    explanation: "Swearing an oath by anything other than Allah is a recognised form of minor shirk — it directs the reverence proper to Allah toward something else, even in ordinary speech.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says a person who dies having committed only minor shirk, without repentance, faces the exact same outcome as someone who died committing major shirk. Is this accurate?`,
    correct: "No — Islamic teaching specifically describes major shirk, if unrepented at death, as the one unforgivable sin, a severity not automatically applied the same way to minor shirk",
    wrong: ["Yes — both are treated identically in every respect", "No — but only because minor shirk is treated more severely than major shirk", "Yes — but only because neither type has any real consequence"],
    explanation: "It is major shirk that Islamic teaching specifically names as unforgivable if died upon unrepented — minor shirk is still a serious spiritual harm, but is not equated with that specific severity.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} says the effects of shirk are 'only spiritual,' with no bearing on how a person actually lives. Evaluate this claim.`,
    correct: "Flawed — shirk's effects include weakened sincerity and misplaced trust, both of which shape real daily decisions and relationships, not just abstract spirituality",
    wrong: ["Sound — shirk's effects are entirely abstract, with zero practical impact", "Sound — shirk only matters in the Hereafter, never during daily life", "Flawed — but only because shirk has no effects on sincerity whatsoever"],
    explanation: "Shirk's effects — weakened sincerity, misplaced trust in powerless sources — show up in real daily choices and relationships, not only in an abstract, purely spiritual sense.",
  }),
];

export const shirk: Skill = {
  id: "g7-ire-pi-shirk",
  code: "PI.2",
  subjectId: "ire",
  strandId: "g7-ire-iman",
  grade: 7,
  title: "Shirk",
  description: "Types of shirk (major and minor), how shirk is manifested, and its effects on a Muslim's Iman.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize-type", "categorize-topic", "match", "reasoning", "fill-blank"] as const);

    if (branch === "categorize-type") {
      const major = shuffle(rng, SHIRK_EXAMPLES.filter((e) => e.type === "major")).slice(0, 3);
      const minor = shuffle(rng, SHIRK_EXAMPLES.filter((e) => e.type === "minor")).slice(0, 4);
      const chosen = shuffle(rng, [...major, ...minor]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.example }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_TYPE_PROMPTS),
        items,
        buckets: (["major", "minor"] as const).map((t) => ({ id: t, label: TYPE_LABEL[t] })),
        correctBucket,
        hint: "Major shirk is directly worshipping something other than Allah; minor shirk is subtler, like showing off or relying on charms.",
        explanation: chosen.map((f) => `"${f.example}" — ${TYPE_LABEL[f.type].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize-topic") {
      const manifestation = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "manifestation")).slice(0, 5);
      const effect = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "effect")).slice(0, 5);
      const chosen = shuffle(rng, [...manifestation, ...effect]);
      const items = chosen.map((f, i) => ({ id: `g${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`g${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_TOPIC_PROMPTS),
        items,
        buckets: (["manifestation", "effect"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Manifestations are behaviours; effects are the consequences of those behaviours on a Muslim's Iman.",
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
        hint: "Think about whether the term names shirk generally, its two types, or a specific manifestation.",
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
        hint: "Decide whether the behaviour is direct worship of something besides Allah, or a subtler act that still misplaces trust or sincerity.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Shirk means associating", after: "with Allah in worship or belief.", answer: "partners", accepted: ["partners"] },
      { before: "Directly worshipping an idol instead of Allah is called Shirk al-", after: ".", answer: "Akbar", accepted: ["akbar"] },
      { before: "Showing off in worship to be praised by others is called", after: ".", answer: "riya", accepted: ["riya"] },
      { before: "Riya is classified as a form of Shirk al-", after: ".", answer: "Asghar", accepted: ["asghar"] },
      { before: "Swearing an oath by something other than", after: "is a form of minor shirk.", answer: "Allah", accepted: ["allah"] },
      { before: "Believing a charm protects a person on its own is a form of", after: "shirk.", answer: "minor", accepted: ["minor"] },
      { before: "Major shirk, if unrepented at death, is described as the", after: "sin.", answer: "unforgivable", accepted: ["unforgivable"] },
      { before: "Shirk weakens the", after: "of a Muslim's worship.", answer: "sincerity", accepted: ["sincerity"] },
      { before: "Consulting a", after: "for guidance about the future is a manifestation of shirk.", answer: "fortune-teller", accepted: ["fortune-teller", "fortune teller"] },
      { before: "Avoiding shirk protects a Muslim's relationship with", after: ".", answer: "Allah", accepted: ["allah"] },
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
      hint: "Recall the two types of shirk, how it is manifested, and its effects.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
