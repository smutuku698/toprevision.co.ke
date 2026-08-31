import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the events of the healing of the bleeding woman in the correct order.",
    "these events from Luke 8:43-48 into the order they happened.",
    "these moments from the healing of the bleeding woman in order.",
    "these events the way they happened in the crowd around Jesus.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the woman's faith or Jesus' response.",
    "these facts about the healing under the correct bucket.",
    "each fact below by which part of the miracle it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the bleeding woman with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the healing.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "A woman who had been bleeding for twelve years, unable to be healed by anyone, comes into the crowd following Jesus" },
  { id: "n2", label: "She believes that if she can only touch the edge of Jesus' cloak, she will be healed" },
  { id: "n3", label: "She touches the edge of his cloak from behind, in the middle of the crowd" },
  { id: "n4", label: "Immediately, her bleeding stops" },
  { id: "n5", label: "Jesus feels that power has gone out from him and asks who touched him" },
  { id: "n6", label: "The woman, trembling, comes forward and explains why she touched him and how she was instantly healed" },
  { id: "n7", label: "Jesus tells her, \"Daughter, your faith has healed you. Go in peace\"" },
];

interface EventFact { text: string; group: "faith" | "response" }
const EVENT_FACTS: EventFact[] = [
  { text: "The woman had been subject to bleeding for twelve long years", group: "faith" },
  { text: "No one had been able to heal her, despite her long suffering", group: "faith" },
  { text: "She believed that touching even the edge of Jesus' cloak would be enough to heal her", group: "faith" },
  { text: "She approached Jesus quietly from behind, in the middle of a large crowd", group: "faith" },
  { text: "She touched only the fringe of his cloak, not Jesus himself directly", group: "faith" },
  { text: "She came forward trembling to confess what she had done, even though it was frightening", group: "faith" },
  { text: "Jesus felt that power had gone out from him the moment she touched his cloak", group: "response" },
  { text: "Jesus asked who had touched him, even though a whole crowd was pressing around him", group: "response" },
  { text: "Jesus did not rebuke the woman for touching him without asking first", group: "response" },
  { text: "Jesus called her \"Daughter,\" showing tenderness and acceptance", group: "response" },
  { text: "Jesus told her that her faith had healed her", group: "response" },
  { text: "Jesus sent her away in peace, fully healed", group: "response" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Twelve years", meaning: "How long the woman had suffered from bleeding before meeting Jesus" },
  { term: "The edge of his cloak", meaning: "The small part of Jesus that the woman touched to be healed" },
  { term: "\"Who touched me?\"", meaning: "Jesus' question after feeling power go out from him" },
  { term: "\"Daughter\"", meaning: "The tender name Jesus used to address the woman" },
  { term: "\"Your faith has healed you\"", meaning: "Jesus' words explaining why the woman was healed" },
  { term: "\"Go in peace\"", meaning: "Jesus' final words sending the woman away, fully restored" },
  { term: "Trembling", meaning: "How the woman felt as she came forward to explain herself" },
  { term: "Power going out", meaning: "What Jesus felt happen the instant the woman touched his cloak" },
  { term: "Persistent faith", meaning: "The value the woman showed by seeking healing despite years of failed attempts" },
  { term: "Public hospital care", meaning: "A modern way government helps sick people access treatment" },
  { term: "Church health ministry", meaning: "A modern way the church supports and prays for the sick" },
  { term: "Free medical camps", meaning: "A modern example of the church or government reaching sick people who cannot afford care" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Anyango", "Boaz", "Consolata", "Diana", "Elkana", "Farhiya", "Gakuru", "Hesbon", "Ivy", "Jecinta", "Kiplangat", "Lameck"] as const;
const KENYAN_PLACES = ["Muranga", "Kabras", "Ndhiwa", "Litein", "Kajulu", "Kilungu", "Mukurweini", "Kwale", "Nandi Hills", "Kacheliba", "Kericho Town", "Runyenjes"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} has been struggling with a long illness and is close to losing hope of ever being helped. Which detail of the bleeding woman's story would most encourage her?`,
    correct: "The woman had suffered for twelve years and failed to find healing elsewhere, yet was healed the instant she reached out to Jesus in faith",
    wrong: [
      "The woman only asked her family to pray for her without ever approaching Jesus herself",
      "The woman waited quietly for Jesus to notice her before doing anything at all",
      "The woman needed a formal appointment with Jesus before he would help her",
    ],
    explanation: "Despite twelve years of failed healing, the woman was healed the instant she reached out in faith, showing that persistent faith can be rewarded even after a long struggle.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders why the woman touched just the edge of Jesus' cloak instead of asking him directly for help. What is the most likely reason?`,
    correct: "She believed even that small act of faith would be enough, while quietly avoiding the shame of publicly announcing her condition",
    wrong: [
      "She was trying to secretly take something from Jesus' clothing",
      "She did not really believe Jesus could heal her, so she was only testing him",
      "She had been told by religious leaders that this specific ritual was required",
    ],
    explanation: "The woman's quiet touch reflects strong faith combined with the wish to avoid public attention to a condition that would have been embarrassing to explain openly.",
  }),
  (rng) => ({
    prompt: `${name(rng)} asks why Jesus stopped and asked "who touched me?" even though a whole crowd was pressing against him. What is the best reason?`,
    correct: "So the woman could openly testify to her healing and receive personal reassurance rather than slipping away unnoticed",
    wrong: [
      "Because he was angry that someone had touched him without permission",
      "Because he wanted to publicly shame the woman for touching him",
      "Because he needed to identify her in order to charge a fee for the healing",
    ],
    explanation: "Jesus drew the woman out not to embarrass her, but to publicly affirm her faith and give her personal reassurance and peace.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what it shows that Jesus called the woman "Daughter." What does this detail reveal?`,
    correct: "Warmth, acceptance and dignity — Jesus treated her personally, not just as another face in the crowd",
    wrong: [
      "That she was literally his biological daughter",
      "That he was scolding her, as a parent might scold a disobedient child",
      "That he was dismissing her as unimportant to him",
    ],
    explanation: "Calling her \"Daughter\" was a tender, personal address showing acceptance and dignity, not correction or dismissal.",
  }),
  (rng) => ({
    prompt: `${name(rng)} hears a classmate claim that "the woman's healing came from a magic power in Jesus' cloak." Is this an accurate description of what happened?`,
    correct: "No — Jesus himself said her faith healed her; the cloak had no power of its own, only her faith in Jesus mattered",
    wrong: [
      "Yes — the cloak itself had healing powers separate from Jesus",
      "Yes — any piece of clothing from a holy person heals automatically",
      "No — nothing actually happened, since the healing was only symbolic",
    ],
    explanation: "Jesus explicitly credited her faith, not the cloak itself, with her healing: \"Your faith has healed you.\"",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} prays quietly for healing without telling anyone, much like the woman's initial quiet approach to Jesus. Does the story suggest faith must always stay completely private?`,
    correct: "Not necessarily — the woman approached quietly, but Jesus drew her out to openly share her testimony, showing that acknowledging what God has done also matters",
    wrong: [
      "Yes — faith must always be kept a complete secret forever",
      "Yes — faith only counts if it is announced publicly before it is even answered",
      "No — Jesus was upset that she had prayed quietly at all",
    ],
    explanation: "While the woman's approach began quietly, Jesus gently brought her forward to publicly acknowledge her healing — showing space for both private faith and open testimony.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked which value the woman's persistence across twelve years of failed healing best shows. What is it?`,
    correct: "Persistent, patient faith even after repeated setbacks and disappointment",
    wrong: [
      "Stubbornness that ignored good advice from others",
      "Carelessness about her own health and wellbeing",
      "Impatience that led her to give up trying quickly",
    ],
    explanation: "Continuing to seek healing after twelve years of failed attempts, rather than giving up, shows persistent, patient faith.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} thinks about how a hospital visit and prayer could both help a sick person today. Based on this miracle's lesson, which is the better view?`,
    correct: "Seeking medical or government health care and having faith in God's power are not opposites — both can support someone's recovery",
    wrong: [
      "Only prayer matters, so hospitals and clinics are unnecessary",
      "Only hospitals matter, so prayer has no place in healing",
      "Medical care and prayer must never be combined in any situation",
    ],
    explanation: "This miracle highlights faith and God's healing power, but CRE teaches this alongside, not instead of, practical care such as hospitals and government health services.",
  }),
  (rng) => ({
    prompt: `${name(rng)}'s community in ${place(rng)} organises a free medical camp for people who cannot afford treatment. Which value from the bleeding woman's story does this community action best reflect?`,
    correct: "Compassion and practical care for the suffering, in the spirit of Jesus caring for the sick and needy",
    wrong: [
      "Competition among health workers for public recognition",
      "Profit-making from people's sickness and vulnerability",
      "Indifference to whether people are actually able to access care",
    ],
    explanation: "Free medical camps reflect the same compassion for the suffering that Jesus showed the bleeding woman, made practical for a modern community.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked what happened the very instant the woman touched Jesus' cloak. What is correct?`,
    correct: "Her bleeding stopped immediately, and Jesus felt power go out from him",
    wrong: [
      "Nothing happened until Jesus later prayed over her privately",
      "The healing only took effect the following morning",
      "The crowd immediately celebrated the miracle before Jesus even noticed",
    ],
    explanation: "Luke 8:44-46 records that her bleeding stopped immediately, and Jesus felt power go out from him at that same instant.",
  }),
];

export const healingOfTheBleedingWoman: Skill = {
  id: "g6-cre-jc-healing-of-the-bleeding-woman",
  code: "JC.4",
  subjectId: "cre",
  strandId: "g6-cre-jesus",
  grade: 6,
  title: "Miracle of Healing — Faith in God (The Bleeding Woman)",
  description: "The healing of the woman who had suffered bleeding for twelve years (Luke 8:43-48), her persistent faith, and modern ways the church and government help the sick.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, NARRATIVE_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: NARRATIVE_SEQUENCE.map((n) => n.id),
        hint: "Start with the woman coming into the crowd, and end with Jesus sending her away in peace.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const faith = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "faith")).slice(0, 4);
      const response = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "response")).slice(0, 4);
      const chosen = shuffle(rng, [...faith, ...response]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "faith", label: "The woman's faith" },
          { id: "response", label: "Jesus' response" },
        ],
        correctBucket,
        hint: "The woman's faith includes her belief and actions; Jesus' response includes what he felt, said, and did.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "faith" ? "the woman's faith" : "Jesus' response"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
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
        hint: "Think about the woman's twelve years of suffering, her quiet act of faith, and Jesus' tender response.",
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
        hint: "Think about the woman's persistent faith, her quiet approach, and how Jesus responded to her.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The woman had suffered from bleeding for", after: "before she met Jesus.", answer: "twelve years", accepted: ["twelve years", "12 years"] },
      { before: "She believed that touching just the", after: "of Jesus' cloak would be enough to heal her.", answer: "edge", accepted: ["edge", "fringe", "hem"] },
      { before: "As soon as she touched his cloak, her bleeding", after: ".", answer: "stopped", accepted: ["stopped"] },
      { before: "Jesus felt that", after: "had gone out from him the moment she touched him.", answer: "power", accepted: ["power"] },
      { before: "Jesus asked who had", after: "him, even though a crowd was pressing around.", answer: "touched", accepted: ["touched"] },
      { before: "Trembling, the woman came forward and told Jesus the whole", after: ".", answer: "truth", accepted: ["truth"] },
      { before: "Jesus called her", after: ", showing tenderness rather than anger.", answer: "daughter", accepted: ["daughter"] },
      { before: "Jesus told her that her", after: "had healed her.", answer: "faith", accepted: ["faith"] },
      { before: "Jesus' final words to her were, \"Go in", after: ".\"", answer: "peace", accepted: ["peace"] },
      { before: "This healing is recorded in the Gospel of", after: ", chapter 8.", answer: "Luke", accepted: ["luke"] },
      { before: "Today, sick people can also be helped through public", after: "care provided by the government.", answer: "hospital", accepted: ["hospital", "health"] },
      { before: "The church also supports the sick today through prayer and health", after: ".", answer: "ministry", accepted: ["ministry", "chaplaincy"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the woman's twelve years of suffering, her quiet act of faith, and Jesus' response.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
