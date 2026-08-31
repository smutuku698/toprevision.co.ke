import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG6/mathUtils";
import type { Skill } from "@/lib/types";

// Compose a larger prompt pool from a small set of openers x closers (per RIGOR-STANDARDS.md's
// "affordable way to reach 20+" technique) instead of hand-authoring every sentence separately.
function composePrompts(openers: readonly string[], closers: readonly string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

const ORDER_PROMPTS = composePrompts(
  ["Arrange", "Put", "Sequence", "Order", "Sort"],
  [
    "the events of Elisha recovering the axe head in the order 2 Kings 6:1-7 describes them.",
    "these events from the axe head story in their correct order.",
    "the events of this story from beginning to end.",
    "these events into the order they happened in 2 Kings 6:1-7.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement into the bucket for the axe head story or an everyday example of trusting God with a small problem.",
    "these statements under the correct heading.",
    "each statement below by whether it is from 2 Kings 6:1-7 or a modern example of trusting God.",
    "each statement into the bucket for the Bible story or a today example.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each idea below to the evidence for it in the axe head story.",
    "each lesson from this story to what the story shows about it.",
    "each idea about faith in God to the evidence that supports it.",
    "each term to the explanation of why it matters in this story.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Elisha and the axe head.",
    "the correct missing word.",
  ],
);

// The explicit sequence of events in 2 Kings 6:1-7 — curriculum-endorsed sequential content, not an
// invented order.
const ELISHA_EVENTS = [
  { id: "e1", label: "A company of prophets tells Elisha their meeting place is too small and they want to build a bigger one by the Jordan" },
  { id: "e2", label: "Elisha agrees to go with the company of prophets to cut timber for the new place" },
  { id: "e3", label: "As one man is cutting a tree, the iron axe head falls into the water, and he cries out because it was borrowed" },
  { id: "e4", label: "Elisha asks the man to show him exactly where the axe head fell" },
  { id: "e5", label: "Elisha cuts a stick and throws it into the water at that spot" },
  { id: "e6", label: "The iron axe head floats to the surface, and the man reaches out and picks it up" },
];

// Story events (2 Kings 6:1-7) vs. modern everyday examples of trusting God with small, ordinary
// problems — grounded in the outcome "exercise faith in God to overcome challenges," not invented content.
const ELISHA_FACTS: { text: string; group: "story" | "today" }[] = [
  { text: "A company of prophets asks Elisha for a bigger place to meet, since their current one is too small", group: "story" },
  { text: "One man's borrowed iron axe head slips off its handle and falls into the Jordan River", group: "story" },
  { text: "The man cries out in distress because the axe head was borrowed, not his own", group: "story" },
  { text: "Elisha asks exactly where the axe head fell before doing anything else", group: "story" },
  { text: "Elisha cuts a stick and throws it into the water at the spot where the axe head sank", group: "story" },
  { text: "The iron axe head floats up, and the man is able to retrieve it himself", group: "story" },
  { text: "A learner who has lost a borrowed pen prays and calmly retraces their steps to find it", group: "today" },
  { text: "A pupil worried about a small, ordinary mistake at school brings it to God in prayer instead of panicking", group: "today" },
  { text: "A family facing a minor but stressful daily problem, like a broken tool, asks God for help finding a solution", group: "today" },
  { text: "A learner who misplaces borrowed school equipment is honest with the owner and asks God for help finding it", group: "today" },
  { text: "Someone facing a small setback at home trusts that God cares about even minor daily struggles", group: "today" },
  { text: "A learner thanks God after finding a solution to a small everyday problem, remembering He was involved", group: "today" },
];

const LESSON_EVIDENCE: { term: string; evidence: string }[] = [
  { term: "God cares about small problems", evidence: "God helped recover a simple borrowed tool, not just solve dramatic crises" },
  { term: "Honesty about borrowed items", evidence: "The man was distressed specifically because the lost axe head was borrowed, not his own" },
  { term: "Asking for help", evidence: "The man immediately told Elisha what had happened instead of hiding the problem" },
  { term: "God's power over nature", evidence: "Making a heavy iron axe head float required power beyond ordinary human ability" },
  { term: "Faith in the impossible", evidence: "Elisha trusted God even for something as ordinary and seemingly impossible as floating iron" },
  { term: "Practical provision", evidence: "God met a very practical, everyday need, not only a spiritual or dramatic one" },
  { term: "Attention to detail", evidence: "Elisha asked exactly where the axe head fell before acting, showing careful attention to the problem" },
  { term: "Community support", evidence: "Elisha was willing to go with the company of prophets and help solve their shared problem" },
  { term: "Trust in God's timing", evidence: "The man's need was met right after he cried out, showing God responds to genuine cries for help" },
  { term: "Gratitude", evidence: "The man could rejoice and give thanks once the axe head floated up and he retrieved it" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amani", "Cherop", "Dennis", "Faith", "Githinji", "Hawa", "Ian", "Jerop", "Kiptoo", "Lydia", "Musyoka", "Nafula"] as const;
const KENYAN_PLACES = ["Nyahururu", "Kakamega", "Voi", "Naivasha", "Isiolo", "Homa Bay", "Kitui", "Garissa", "Malindi", "Ruiru", "Narok", "Embu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads 2 Kings 6:1-7 and notices the man was especially upset because the axe head he lost was borrowed. Why does this detail matter in the story?`,
    correct: "It shows the man felt responsible for something that was not even his own, making the loss feel more serious",
    wrong: [
      "It shows the man did not actually care about losing the axe head at all",
      "It means the story is really about punishment for borrowing tools",
      "Borrowed items are unimportant details that add nothing to the story",
    ],
    explanation: "The man's distress over losing a borrowed axe head highlights his sense of responsibility — a detail that makes God's care for even this small, practical problem more meaningful.",
  }),
  (rng) => ({
    prompt: `In CRE class in ${place(rng)}, ${name(rng)} is asked what Elisha did first after learning the axe head had fallen into the water. What was it?`,
    correct: "He asked the man to show him exactly where it fell",
    wrong: [
      "He immediately scolded the man for losing a borrowed tool",
      "He told the man the axe head could never be recovered",
      "He sent the man away to buy a replacement axe head",
    ],
    explanation: "2 Kings 6:6 records that Elisha first asked where the axe head fell before doing anything else — a careful, attentive first step.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} argues that this miracle only matters because it involves something dramatic and important, not an ordinary tool like an axe head. Is this the right lesson from the story?`,
      correct: "No — the story's power is exactly that God cared about an ordinary, everyday problem, not just dramatic crises",
      wrong: [
        "Yes — the axe head was actually a symbol of royal power, not an ordinary tool",
        "Yes — the story only matters because of the size of the army involved",
        "No — but the lesson only applies to expensive tools, not ordinary ones",
      ],
      explanation: "The story's key lesson is that God cares about small, ordinary, practical problems — recovering a simple borrowed axe head, not a dramatic battle or crisis.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} loses a classmate's borrowed geometry set and feels distressed, just like the man in 2 Kings 6. What is the best response, based on this lesson?`,
    correct: "Be honest about what happened, ask for help, and trust God with even this small, everyday problem",
    wrong: [
      "Hide the loss and hope the classmate never notices",
      "Assume God only cares about big, dramatic problems, not small losses like this",
      "Give up looking for it immediately since it is only a small item",
    ],
    explanation: "Just as the man in 2 Kings 6 was honest about the loss and it was met with God's help through Elisha, this lesson teaches honesty and trust in God even for small, everyday troubles.",
  }),
  (rng) => ({
    prompt: `${name(rng)} points out that making a heavy iron axe head float on water is naturally impossible. What does Elisha's action of throwing a stick into the water at that spot show about faith?`,
    correct: "It shows Elisha trusted God's power to do what was naturally impossible, even for a small practical need",
    wrong: [
      "It shows sticks have a scientific ability to make iron float on their own",
      "It shows the axe head was never actually heavy or made of iron",
      "It shows Elisha doubted whether God would actually help",
    ],
    explanation: "Elisha's simple action of throwing a stick, followed by the axe head floating, points to God's power working through faith — not a natural property of sticks or water.",
  }),
  (rng) => ({
    prompt: `A learner in ${place(rng)} named ${name(rng)} says prayer is only appropriate for major life crises, not small daily struggles like losing a pen. How does the axe head story respond to this idea?`,
    correct: "It shows God is willing to help with small, ordinary, practical problems too, not only major crises",
    wrong: [
      "It agrees that prayer should be reserved only for major crises",
      "It shows the man never prayed or asked for help at all",
      "It has no connection to how people should approach small problems",
    ],
    explanation: "2 Kings 6:1-7 is specifically about a small, practical tool being lost and recovered — a clear example that God cares about ordinary, everyday needs, not only dramatic emergencies.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} claims Elisha solved the problem entirely through his own clever thinking, with no involvement from God at all. Based on 2 Kings 6:1-7, is this an accurate view?`,
    correct: "No — the passage presents the floating axe head as God's power at work through Elisha's faith, not a purely human trick",
    wrong: [
      "Yes — the passage explains it as a purely scientific event with no faith involved",
      "Yes — Elisha explicitly denies any involvement from God in the story",
      "No — but only the prophets, not God, are credited with the miracle",
    ],
    explanation: "The story is understood as a miracle worked through Elisha's faith in God's power, not a clever human trick with no divine involvement.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why the company of prophets wanted to go to the Jordan in the first place, before the axe head incident happened. What was their reason?`,
    correct: "Their current meeting place had become too small for them",
    wrong: [
      "They wanted to escape from an approaching enemy army",
      "Elisha ordered them to abandon their previous meeting place entirely",
      "They needed timber to sell for money, unrelated to their meeting place",
    ],
    explanation: "2 Kings 6:1-2 records that the company of prophets told Elisha their meeting place was too small, so they wanted to build a new one by the Jordan.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says depending on God, based on this lesson, means a person should never take any practical action themselves, like retracing steps to find a lost item. Is this the correct application of the story?`,
    correct: "No — the man told Elisha exactly what happened, and Elisha acted (asking where it fell, then throwing the stick); depending on God works together with practical action, not instead of it",
    wrong: [
      "Yes — practical action shows a lack of faith and should be avoided entirely",
      "Yes — Elisha only prayed silently and took no action of any kind",
      "No — but practical action is more important than depending on God at all",
    ],
    explanation: "In the story, depending on God and taking sensible action (identifying the exact spot, then acting) work together — the lesson is not that action should be avoided.",
  }),
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, guided by ${name(rng)}, debates whether this miracle story teaches that even 'small' problems matter to God. Which is the better conclusion?`,
    correct: "Yes — recovering a simple borrowed tool shows that God pays attention to even small, practical, everyday problems",
    wrong: [
      "No — the story is really about the size of the company of prophets, not the axe head",
      "No — the axe head detail is unimportant and could be left out of the story entirely",
      "Yes — but only because the tool happened to be made of a rare kind of iron",
    ],
    explanation: "The specific, small, practical nature of the lost item — an ordinary axe head, not a treasure or weapon — is exactly what makes this story's lesson about God caring for everyday problems so clear.",
  }),
];

export const elishaRecoversTheAxeHead: Skill = {
  id: "g6-cre-bi-elisha",
  code: "BI.4",
  subjectId: "cre",
  strandId: "g6-cre-bible",
  grade: 6,
  title: "Faith in God — Elisha Recovers the Axe Head",
  description: "The events of 2 Kings 6:1-7, where Elisha helps recover a lost borrowed axe head, and the lesson that God cares about ordinary, everyday problems and deserves our trust.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, ELISHA_EVENTS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the first event to the last.",
        items,
        correctOrder: ELISHA_EVENTS.map((e) => e.id),
        hint: "The prophets ask for a bigger place first, then the axe head is lost while cutting timber, then Elisha asks where it fell and throws a stick, and it floats up last.",
        explanation: ELISHA_EVENTS.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const story = shuffle(rng, ELISHA_FACTS.filter((f) => f.group === "story")).slice(0, 4);
      const today = shuffle(rng, ELISHA_FACTS.filter((f) => f.group === "today")).slice(0, 4);
      const chosen = shuffle(rng, [...story, ...today]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "story", label: "Event from the axe head story" },
          { id: "today", label: "Example of trusting God today" },
        ],
        correctBucket,
        hint: "Story facts describe what happened in 2 Kings 6:1-7; today facts describe modern situations like a lost item or a small daily struggle.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "story" ? "from the axe head story" : "an example of trusting God today"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, LESSON_EVIDENCE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.term })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.term, label: a.evidence })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.term] = a.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each part of the axe head story actually shows or teaches.",
        explanation: chosen.map((a) => `${a.term} — ${a.evidence.toLowerCase()}.`).join(" "),
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
        hint: "Think about the specific events of 2 Kings 6:1-7 and how the lesson applies to small, everyday problems.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "A company of prophets told Elisha their meeting place had become too", after: ".", answer: "small", accepted: ["small"] },
      { before: "The company of prophets wanted to build a new place near the", after: ".", answer: "Jordan", accepted: ["jordan"] },
      { before: "One man's axe head fell into the water because it was only", after: "on its handle.", answer: "borrowed", accepted: ["borrowed"] },
      { before: "The man cried out because the axe head he lost was", after: ", not his own.", answer: "borrowed", accepted: ["borrowed"] },
      { before: "Elisha first asked the man exactly where the axe head had", after: ".", answer: "fallen", accepted: ["fallen", "fell"] },
      { before: "Elisha cut a stick and threw it into the", after: "at that spot.", answer: "water", accepted: ["water"] },
      { before: "After the stick was thrown in, the iron axe head began to", after: ".", answer: "float", accepted: ["float"] },
      { before: "The man was finally able to reach out and", after: "the axe head himself.", answer: "retrieve", accepted: ["retrieve", "pick up"] },
      { before: "This story teaches that God cares about small, ordinary, everyday", after: ", not only dramatic crises.", answer: "problems", accepted: ["problems"] },
      { before: "The key inquiry question for this lesson asks how Elisha", after: "the axe head.", answer: "recovered", accepted: ["recovered"] },
      { before: "The lesson encourages learners to exercise", after: "in God to overcome challenges.", answer: "faith", accepted: ["faith"] },
      { before: "The story is found in 2 Kings, chapter", after: ", verses 1 to 7.", answer: "6", accepted: ["6", "six"] },
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
      hint: "Think about the events of 2 Kings 6:1-7 and what they teach about trusting God with everyday problems.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
