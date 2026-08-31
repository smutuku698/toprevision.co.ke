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
    "the events of the baptism of Jesus Christ in the correct order.",
    "these events from Luke 3:21-22 into the order they happened.",
    "these moments from the baptism of Jesus in order.",
    "these events the way they happened at Jesus' baptism.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is an event at the baptism or its meaning for Christians.",
    "these facts about the baptism of Jesus under the correct bucket.",
    "each fact below by which part of the baptism story it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the baptism of Jesus with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about the baptism of Jesus.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Jesus comes to John along with all the other people to be baptized" },
  { id: "n2", label: "John the Baptist baptizes Jesus in the water" },
  { id: "n3", label: "After being baptized, Jesus is praying" },
  { id: "n4", label: "Heaven is opened above Jesus" },
  { id: "n5", label: "The Holy Spirit descends on Jesus in bodily form, like a dove" },
  { id: "n6", label: "A voice comes from heaven, saying, \"You are my Son, whom I love\"" },
  { id: "n7", label: "The voice from heaven adds, \"With you I am well pleased\"" },
];

interface EventFact { text: string; group: "event" | "meaning" }
const EVENT_FACTS: EventFact[] = [
  { text: "Jesus came to John along with all the other people to be baptized", group: "event" },
  { text: "John baptized Jesus in the water", group: "event" },
  { text: "Jesus prayed after being baptized", group: "event" },
  { text: "Heaven was opened above Jesus", group: "event" },
  { text: "The Holy Spirit descended on Jesus in bodily form, like a dove", group: "event" },
  { text: "A voice from heaven said, \"You are my Son, whom I love; with you I am well pleased\"", group: "event" },
  { text: "Baptism is a sign of obedience for a Christian, following Jesus' own example", group: "meaning" },
  { text: "Jesus' baptism shows humility, since he had no sin but still chose to be baptized with the crowd", group: "meaning" },
  { text: "Baptism marks the beginning of a new life dedicated to serving God", group: "meaning" },
  { text: "The Holy Spirit's presence at Jesus' baptism shows God equips those he calls for ministry", group: "meaning" },
  { text: "The voice affirming Jesus as God's Son shows God's approval and support at the start of his ministry", group: "meaning" },
  { text: "Baptism today is an important step for a Christian to publicly declare their faith", group: "meaning" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Baptism", meaning: "A sign of obedience to God, which Jesus underwent along with all the other people" },
  { term: "Holy Spirit", meaning: "Descended on Jesus in bodily form, like a dove, right after his baptism" },
  { term: "Dove", meaning: "The visible form the Holy Spirit took when descending on Jesus at his baptism" },
  { term: "\"You are my Son, whom I love\"", meaning: "Part of the voice from heaven's declaration about Jesus at his baptism" },
  { term: "Humility", meaning: "The value Jesus showed by being baptized even though he had committed no sin" },
  { term: "Heaven opened", meaning: "The visible sign that occurred just after Jesus was baptized and was praying" },
  { term: "Luke 3:21-22", meaning: "The Bible passage that records the baptism of Jesus Christ" },
  { term: "\"With you I am well pleased\"", meaning: "God's words of approval spoken from heaven at Jesus' baptism" },
  { term: "Sign of obedience", meaning: "One meaning of baptism for a Christian today, following Jesus' example" },
  { term: "New life", meaning: "What baptism marks the beginning of for a believing Christian" },
  { term: "Public declaration", meaning: "One purpose of baptism, showing others that a person has committed to following Christ" },
  { term: "God's approval", meaning: "What the voice from heaven expressed toward Jesus at his baptism" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Achola", "Bosco", "Chepkoech", "Denis", "Esther", "Farouk", "Gakii", "Hadassah", "Ibrahim", "Jelimo", "Kiplangat", "Loise"] as const;
const KENYAN_PLACES = ["Meru", "Busia", "Nanyuki", "Mandera", "Kitale", "Kilifi", "Litein", "Ruaka", "Nyando", "Ol Kalou", "Chuka", "Migori"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a school prefect in ${place(rng)}, refuses to join classmates in a cleaning exercise, saying it is beneath a prefect's position. How does Jesus' example at his baptism challenge this attitude?`,
      correct: "Jesus, though sinless and far greater than anyone else present, still humbly joined ordinary people to be baptized — showing that status does not exempt anyone from humble acts",
      wrong: [
        "Humility taught by Jesus' baptism only applies to religious leaders, not school prefects",
        "Being a prefect rightly exempts a person from humble, everyday tasks",
        "Jesus' baptism has nothing to do with humility, only with forgiveness of sin",
      ],
      explanation: "Jesus' baptism shows humility precisely because he had no sin needing forgiveness, yet still stood among the crowd being baptized — a model against pride in position.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is considering baptism but is worried about what friends will say. Based on the importance of baptism, what is the best encouragement?`,
      correct: "Baptism is an important step of faith and obedience for a Christian, worth taking even if it means facing others' opinions",
      wrong: [
        "Baptism should be delayed until every friend approves of the decision",
        "Baptism is only important for adults, not for young Christians",
        "What friends think should always decide whether someone is baptized",
      ],
      explanation: "The lesson's outcome on the importance of baptism teaches it as a meaningful, faith-based commitment, not something to be decided only by peer approval.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} watches the Holy Spirit descend on Jesus like a dove during a class re-enactment of the baptism story in ${place(rng)}. What is the best explanation of what that moment meant?`,
    correct: "It showed God's presence with Jesus and marked the beginning of Jesus being empowered for his ministry",
    wrong: [
      "It was simply a literal bird that happened to fly near Jesus at that moment",
      "It was an unrelated event with no spiritual meaning for Jesus' ministry",
      "It only symbolised peace, with no connection to Jesus' identity or mission",
    ],
    explanation: "The Holy Spirit descending on Jesus in bodily form, like a dove, right after his baptism, marks God's presence and empowerment as Jesus begins his public ministry.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in a CRE class in ${place(rng)} asks why Jesus needed to be baptized at all, since Jesus had no sin. What is the best answer?`,
    correct: "Jesus was not baptized because he needed forgiveness, but to show humility and identify with the people he came to save",
    wrong: [
      "Jesus needed baptism because he had sinned like everyone else in the crowd",
      "Roman law required every adult, including Jesus, to be baptized",
      "John forced Jesus to be baptized against Jesus' own wishes",
    ],
    explanation: "Jesus had no sin requiring repentance, so his baptism is understood as an act of humility and solidarity with the people, not a need for personal forgiveness.",
  }),
  () => ({
    prompt: `After Jesus was baptized, a voice from heaven called him "my Son, whom I love." What should a Christian being baptized today remember about this moment?`,
    correct: "Baptism today is also an occasion when a believer publicly professes faith and can trust in God's approval of that commitment",
    wrong: [
      "Only Jesus could ever receive any approval or blessing connected with baptism",
      "The voice from heaven means baptism guarantees a person will never face hardship",
      "This moment shows baptism is unimportant for anyone except Jesus himself",
    ],
    explanation: "While the voice from heaven uniquely affirmed Jesus as God's Son, the moment models baptism as a significant, faith-affirming step that still matters for believers today.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes that only priests or pastors truly need to be baptized, not ordinary church members. Does Jesus' baptism alongside "all the other people" support this belief?`,
      correct: "No — Jesus was baptized together with ordinary people, showing baptism is meant for every believer, not only religious leaders",
      wrong: [
        "Yes — Jesus' baptism proves only religious leaders needed to be baptized",
        "Yes — ordinary people in the crowd were baptized only to accompany Jesus, not for their own faith",
        "No — but only wealthy or influential people were expected to be baptized",
      ],
      explanation: "Luke 3:21 records Jesus being baptized 'along with all the other people' — a picture of baptism as something for every believer, not a special class of leaders.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} is asked what event marked the beginning of Jesus' public ministry, empowered by the Holy Spirit. Which event was it?`,
    correct: "Jesus' baptism by John, followed immediately by the Holy Spirit descending on him",
    wrong: [
      "Jesus' birth in Bethlehem, described in a different part of the Gospels",
      "The temptation of Jesus in the wilderness, which happened before his baptism",
      "The Sermon on the Mount, which came much later in his ministry",
    ],
    explanation: "The baptism of Jesus, with the Holy Spirit descending afterward, is understood as the moment marking the start of his public ministry.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} insists that because Jesus was baptized in water in the Bible, every true baptism today must happen in exactly the same type of water source. Is this the right lesson to draw from Luke 3:21-22?`,
      correct: "No — what matters most is the meaning behind baptism, such as obedience and identifying with Christ, not the exact water source used",
      wrong: [
        "Yes — baptism is invalid unless it uses the exact same water source Jesus used",
        "Yes — but only rainwater collected during a storm counts as valid",
        "No — but the type of water used is still more important than the meaning of the act",
      ],
      explanation: "Luke 3:21-22 focuses on what baptism represents — obedience, humility, and God's approval — rather than prescribing one exact type of water source for all time.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Right after being baptized in ${place(rng)}, ${who} tells classmates that being baptized means a person can now never sin again. Based on Jesus' own humility at his baptism, is this correct?`,
      correct: "No — baptism is a sign of committing to follow God humbly, not a claim that a person is now perfect and beyond wrongdoing",
      wrong: [
        "Yes — baptism removes the possibility of ever sinning again",
        "Yes — but only for people baptized as adults, not as children",
        "No — but baptism does mean a person never needs to pray for forgiveness again",
      ],
      explanation: "Jesus' own baptism, done in humility though he had no sin, models baptism as an act of humble obedience — not a guarantee that the baptized person becomes sinless.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A respected church leader in ${place(rng)} refuses to stand in the baptism line with ordinary members, believing it is beneath their position. What does Jesus' example at his own baptism say to ${who}, who witnesses this?`,
      correct: "Jesus' example teaches that everyone, including leaders, should approach acts like baptism with humility, not pride in position",
      wrong: [
        "Jesus' example shows leaders are rightly exempt from humbling themselves",
        "Jesus' baptism has no lesson relevant to how church leaders should behave",
        "Only ordinary members are expected to show humility, not leaders",
      ],
      explanation: "Jesus, though far greater than anyone in the crowd, still humbly joined ordinary people to be baptized — a direct challenge to any leader who feels above humble acts.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in a CRE lesson in ${place(rng)} asks what it means that "heaven was opened" right after Jesus was baptized and praying. What is the best explanation?`,
    correct: "It signals a dramatic, visible sign from God confirming and blessing Jesus at that important moment",
    wrong: [
      "It means the sky physically broke apart into pieces above the crowd",
      "It was an unrelated weather event with no connection to Jesus' baptism",
      "It only symbolised that rain was about to fall on the crowd",
    ],
    explanation: "Heaven being 'opened,' followed by the Holy Spirit descending and the voice speaking, together form a visible, dramatic sign of God's presence and approval at Jesus' baptism.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} already believes in Jesus in their heart but thinks getting baptized is an unnecessary extra step. What does Jesus' own baptism suggest about this view?`,
      correct: "Baptism is an outward, obedient step that follows and shows an inward faith commitment, following Jesus' own example of being baptized",
      wrong: [
        "Baptism is entirely unnecessary once a person believes privately",
        "Baptism only matters for people who have not yet decided to believe",
        "Jesus' baptism proves that outward acts of faith are unimportant",
      ],
      explanation: "Even though Jesus had no need for repentance, he still outwardly submitted to baptism — modelling baptism as a visible step of obedience that follows genuine faith.",
    };
  },
];

export const theBaptismOfJesusChrist: Skill = {
  id: "g5-cre-jc-baptism-of-jesus",
  code: "JC.2",
  subjectId: "cre",
  strandId: "g5-cre-jesus",
  grade: 5,
  title: "The Baptism of Jesus Christ",
  description: "The events of Jesus' baptism (Luke 3:21-22) — heaven opening, the Holy Spirit descending like a dove, and the voice from heaven — and the importance of baptism and humility for a Christian today.",
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
        hint: "Start with Jesus coming to be baptized, and end with the voice from heaven speaking.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const event = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "event")).slice(0, 4);
      const meaning = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "meaning")).slice(0, 4);
      const chosen = shuffle(rng, [...event, ...meaning]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "event", label: "What happened at Jesus' baptism" },
          { id: "meaning", label: "What it means for Christians" },
        ],
        correctBucket,
        hint: "The event bucket describes what actually happened; the meaning bucket describes why it matters for Christians today.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "event" ? "what happened at the baptism" : "what it means for Christians"}.`).join(" "),
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
        hint: "Think about what happened at Jesus' baptism and what it teaches Christians today.",
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
        hint: "Think about Jesus' humility at his baptism and why baptism matters for a Christian.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Jesus came to be baptized along with all the other", after: ".", answer: "people", accepted: ["people"] },
      { before: "John the Baptist baptized Jesus in the", after: ".", answer: "water", accepted: ["water"] },
      { before: "After Jesus was baptized, he was", after: ".", answer: "praying", accepted: ["praying", "prayed"] },
      { before: "As Jesus prayed, heaven was", after: ".", answer: "opened", accepted: ["opened", "open"] },
      { before: "The Holy Spirit descended on Jesus in bodily form, like a", after: ".", answer: "dove", accepted: ["dove"] },
      { before: "A voice from heaven said, \"You are my", after: ", whom I love.\"", answer: "Son", accepted: ["son"] },
      { before: "The voice from heaven said, \"with you I am well", after: ".\"", answer: "pleased", accepted: ["pleased"] },
      { before: "Even though Jesus had no sin, he was baptized to show", after: ".", answer: "humility", accepted: ["humility"] },
      { before: "Baptism is an important step of faith and", after: "for a Christian.", answer: "obedience", accepted: ["obedience"] },
      { before: "Baptism marks the beginning of a Christian's new life dedicated to serving", after: ".", answer: "God", accepted: ["god"] },
      { before: "Christians today are encouraged to be baptized as a public declaration of their", after: ".", answer: "faith", accepted: ["faith"] },
      { before: "The Holy Spirit's presence at Jesus' baptism shows God equips people for", after: ".", answer: "ministry", accepted: ["ministry"] },
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
      hint: "Think about the events at Jesus' baptism and what they mean for a Christian today.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
