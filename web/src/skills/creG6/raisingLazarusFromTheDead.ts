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
    "the events of the raising of Lazarus in the correct order.",
    "these events from John 11:32-45 into the order they happened.",
    "these moments from the raising of Lazarus in order.",
    "these events the way they happened at Bethany.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the grief before, or the miracle at the tomb.",
    "these facts about Lazarus under the correct bucket.",
    "each fact below by which part of the account it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the raising of Lazarus with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Lazarus.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Lazarus, the brother of Mary and Martha, dies and is placed in a tomb" },
  { id: "n2", label: "By the time Jesus arrives, Lazarus has already been in the tomb for four days" },
  { id: "n3", label: "Mary falls at Jesus' feet, saying that if he had been there, her brother would not have died" },
  { id: "n4", label: "Jesus, deeply moved, weeps" },
  { id: "n5", label: "Jesus goes to the tomb and asks for the stone to be removed" },
  { id: "n6", label: "Martha warns that there will be a bad smell after four days, but Jesus asks her to trust him" },
  { id: "n7", label: "The stone is removed, and Jesus prays aloud, thanking the Father for hearing him" },
  { id: "n8", label: "Jesus calls in a loud voice, \"Lazarus, come out!\"" },
  { id: "n9", label: "Lazarus comes out of the tomb, still wrapped in graveclothes" },
  { id: "n10", label: "Many of the people who witnessed this miracle believe in Jesus" },
];

interface EventFact { text: string; group: "grief" | "miracle" }
const EVENT_FACTS: EventFact[] = [
  { text: "Lazarus had already been in the tomb for four days by the time Jesus arrived", group: "grief" },
  { text: "Mary fell at Jesus' feet, saying he could have prevented her brother's death", group: "grief" },
  { text: "Jesus was deeply moved and troubled by the grief around him", group: "grief" },
  { text: "Jesus wept openly at the loss of his friend Lazarus", group: "grief" },
  { text: "Martha warned Jesus that there would be a bad smell after four days in the tomb", group: "grief" },
  { text: "Many people from the town had come to comfort Mary and Martha over their brother's death", group: "grief" },
  { text: "Jesus asked for the stone covering the tomb's entrance to be removed", group: "miracle" },
  { text: "Jesus prayed aloud, thanking the Father for always hearing him", group: "miracle" },
  { text: "Jesus called out in a loud voice, \"Lazarus, come out!\"", group: "miracle" },
  { text: "Lazarus came out of the tomb still wrapped in the cloths used for burial", group: "miracle" },
  { text: "Jesus told those nearby to remove the graveclothes and let Lazarus go free", group: "miracle" },
  { text: "Many people who witnessed the miracle believed in Jesus because of it", group: "miracle" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Four days", meaning: "How long Lazarus had been in the tomb before Jesus arrived" },
  { term: "Mary", meaning: "Lazarus' sister who told Jesus he could have prevented her brother's death" },
  { term: "Martha", meaning: "Lazarus' sister who warned Jesus about the smell before the stone was removed" },
  { term: "\"Lazarus, come out!\"", meaning: "The loud command Jesus gave at the tomb, calling Lazarus back to life" },
  { term: "Graveclothes", meaning: "The burial cloths Lazarus was still wrapped in when he walked out of the tomb" },
  { term: "Jesus wept", meaning: "The short statement in the Bible that shows Jesus' deep emotion at Lazarus' death" },
  { term: "The stone", meaning: "What covered the entrance of the tomb, removed at Jesus' request" },
  { term: "\"Asleep\"", meaning: "The word Jesus used earlier for Lazarus' death, since he was about to reverse it" },
  { term: "Bethany", meaning: "The village where Lazarus, Mary and Martha lived" },
  { term: "Thanksgiving prayer", meaning: "The prayer Jesus said aloud before calling Lazarus, thanking the Father for hearing him" },
  { term: "God's power over death", meaning: "The lesson this miracle teaches about hope in the face of grief" },
  { term: "Comfort in grief", meaning: "A value this miracle teaches Christians today when someone they love dies" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Ambrose", "Beryl", "Chelagat", "Dishon", "Edwin", "Furaha", "Gatwiri", "Halima", "Isaya", "Jelagat", "Kamau", "Leah"] as const;
const KENYAN_PLACES = ["Suna", "Ogembo", "Tigania", "Sigona", "Baringo Town", "Elburgon", "Kapsabet", "Yatta", "Mbita", "Chwele", "Endebess", "Kikuyu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks a CRE teacher why Jesus called Lazarus' death "sleep" before raising him. What is the best explanation?`,
    correct: "Because Jesus was about to reverse Lazarus' death, and sleep is a temporary state you wake up from, showing death has no lasting power over God",
    wrong: [
      "Because Lazarus was not really dead, only unconscious",
      "Because Jesus was confused about what had actually happened to Lazarus",
      "Because \"sleep\" was simply a mistranslation with no real meaning",
    ],
    explanation: "Jesus described Lazarus' death as sleep because, like waking from sleep, he was about to reverse it — a picture of God's power over death, not a claim that Lazarus was merely unconscious.",
  }),
  (rng) => ({
    prompt: `${name(rng)} comforts a grieving relative in ${place(rng)} using the story of Lazarus. What comfort does the raising of Lazarus offer?`,
    correct: "Hope that death is not the final word, because God has power over sickness and death",
    wrong: [
      "A guarantee that every prayer to bring back a dead loved one will be answered the same way",
      "Proof that grief is wrong for a true believer to feel",
      "A reason to avoid attending funerals altogether",
    ],
    explanation: "This miracle offers hope that death does not have the final say under God's power, while Jesus' own weeping shows grief itself is not wrong.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked why Jesus wept, even though he already knew he was about to raise Lazarus. What is the best reason?`,
    correct: "He was genuinely moved by the grief and pain of Mary, Martha and those mourning, showing his full compassion",
    wrong: [
      "Because he had failed to arrive in time and felt guilty",
      "Because he doubted whether the miracle would actually work",
      "Because weeping was a ritual required before performing any miracle",
    ],
    explanation: "Jesus' weeping shows genuine, compassionate grief with those who mourned, even while he knew what he was about to do.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices that Martha warned Jesus about the smell after four days in the tomb. What does Jesus' response to this warning show about faith?`,
    correct: "Jesus asked her to trust him despite the natural evidence pointing to hopelessness, showing that faith sometimes means trusting beyond what seems possible",
    wrong: [
      "That Jesus ignored practical realities out of carelessness",
      "That the smell warning proved the miracle could not really happen",
      "That Martha's warning showed she did not love her brother",
    ],
    explanation: "Jesus' gentle response to Martha's practical warning encouraged her to trust him even when the natural evidence looked hopeless.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked why it matters that Lazarus had been dead four days, not just a few hours. Why is this detail significant?`,
    correct: "It removed any doubt that he was truly dead, making the miracle an unmistakable display of God's power over death itself",
    wrong: [
      "Four days was simply a random detail with no real importance",
      "Jesus deliberately delayed to make the situation unnecessarily difficult",
      "It means Lazarus was only mostly dead, not fully dead",
    ],
    explanation: "Four days removed any doubt that Lazarus was genuinely dead, making his return to life an undeniable display of God's power.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices Jesus prayed aloud, thanking the Father "for always hearing him," before calling Lazarus. Why might Jesus have prayed this way, out loud, in front of the crowd?`,
    correct: "So the people standing there would believe that God sent him, connecting the miracle directly to God's power",
    wrong: [
      "Because Jesus needed the crowd's help to perform the miracle",
      "Because Jesus was unsure whether the miracle would actually work until he prayed",
      "Because public prayer was a legal requirement before performing any miracle",
    ],
    explanation: "John 11:41-42 records Jesus explaining that he prayed aloud so the crowd would believe God had sent him, connecting the miracle to God's power, not his own.",
  }),
  (rng) => ({
    prompt: `${name(rng)} points out that Mary's words to Jesus, "if you had been here...", sound like blame. How does Jesus respond to this?`,
    correct: "With compassion, not anger — he is moved to tears and still proceeds to help her, showing patience with her grief",
    wrong: [
      "He immediately corrects and scolds her for doubting him",
      "He refuses to help because of what she said",
      "He leaves without responding to her at all",
    ],
    explanation: "Jesus responds to Mary's grief-filled words with compassion and tears, not correction, before going on to raise Lazarus.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked what Jesus instructed people to do right after Lazarus walked out of the tomb. What did he say?`,
    correct: "To remove the graveclothes and let Lazarus go free",
    wrong: [
      "To leave the graveclothes on as a permanent reminder of the miracle",
      "To bury Lazarus again immediately for safety",
      "To keep Lazarus inside the tomb until further notice",
    ],
    explanation: "John 11:44 records Jesus telling the people to remove Lazarus' graveclothes and let him go free.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked why many people who witnessed this miracle came to believe in Jesus. What is the best reason?`,
    correct: "Because raising someone who had been dead four days was an undeniable, public display of God's power working through Jesus",
    wrong: [
      "Because Jesus paid the witnesses to say they believed",
      "Because the miracle was later explained away as a trick",
      "Because belief was required by local law in that town",
    ],
    explanation: "The undeniable, public nature of raising a man dead four days convinced many witnesses that Jesus truly acted with God's power.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is struggling with grief after a grandparent's death. Without promising a literal resurrection, what comfort, consistent with this miracle's lesson, can be offered?`,
      correct: "That God has power over life and death, and that grief and mourning are natural even for believers, as shown by Jesus himself weeping",
      wrong: [
        "That grief shows a lack of faith and should be hidden completely",
        "That death is not something to be sad about at all",
        "That only people who die exactly like Lazarus can be comforted by this story",
      ],
      explanation: "The raising of Lazarus offers hope in God's power over death while Jesus' own weeping shows that grief is a natural, valid response even for believers.",
    };
  },
];

export const raisingLazarusFromTheDead: Skill = {
  id: "g6-cre-jc-raising-lazarus-from-the-dead",
  code: "JC.5",
  subjectId: "cre",
  strandId: "g6-cre-jesus",
  grade: 6,
  title: "Raising Lazarus from the Dead",
  description: "The raising of Lazarus after four days in the tomb (John 11:32-45), Jesus' grief and compassion, and the lesson of God's power over sickness and death.",
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
        hint: "Start with Lazarus' death, and end with many people believing in Jesus after the miracle.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const grief = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "grief")).slice(0, 4);
      const miracle = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "miracle")).slice(0, 4);
      const chosen = shuffle(rng, [...grief, ...miracle]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "grief", label: "Grief before the miracle" },
          { id: "miracle", label: "The miracle at the tomb" },
        ],
        correctBucket,
        hint: "Grief facts happen before the tomb is opened; miracle facts happen once Jesus acts at the tomb.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "grief" ? "grief before the miracle" : "the miracle at the tomb"}.`).join(" "),
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
        hint: "Think about the people involved, the sequence at the tomb, and the lesson this miracle teaches.",
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
        hint: "Think about why Jesus wept, why he called death \"sleep,\" and what the miracle teaches about God's power.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "By the time Jesus arrived, Lazarus had already been in the tomb for", after: "days.", answer: "four", accepted: ["four", "4"] },
      { before: "Mary told Jesus that if he had been there, her brother would not have", after: ".", answer: "died", accepted: ["died"] },
      { before: "Jesus was deeply moved and", after: "at the loss of his friend Lazarus.", answer: "wept", accepted: ["wept", "cried"] },
      { before: "Martha warned Jesus there would be a bad", after: "after four days in the tomb.", answer: "smell", accepted: ["smell", "odour", "odor"] },
      { before: "Jesus asked for the", after: "covering the tomb to be removed.", answer: "stone", accepted: ["stone"] },
      { before: "Before calling Lazarus, Jesus prayed aloud, thanking the", after: "for hearing him.", answer: "Father", accepted: ["father"] },
      { before: "Jesus called out in a loud voice, \"Lazarus, come", after: "!\"", answer: "out", accepted: ["out"] },
      { before: "Lazarus came out of the tomb still wrapped in his", after: ".", answer: "graveclothes", accepted: ["graveclothes", "burial cloths"] },
      { before: "Jesus earlier described Lazarus' death as being", after: ", since he was about to reverse it.", answer: "asleep", accepted: ["asleep"] },
      { before: "Lazarus, Mary and Martha lived in the village of", after: ".", answer: "Bethany", accepted: ["bethany"] },
      { before: "Many people who saw this miracle came to believe in", after: ".", answer: "Jesus", accepted: ["jesus"] },
      { before: "This miracle shows that God has power over sickness and", after: ".", answer: "death", accepted: ["death"] },
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
      hint: "Think about Lazarus' four days in the tomb, Jesus' grief, and the miracle at the tomb.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
