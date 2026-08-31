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
    "the events of Peter and John's arrest in the correct order.",
    "these events from Acts 4:1-13 into the order they happened.",
    "these moments from the story of Peter and John in order.",
    "these events the way they happened at the temple.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the arrest or about Peter's bold reply.",
    "these facts about Peter and John under the correct bucket.",
    "each fact below by which part of the story it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about Peter and John's story with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Peter and John.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Peter and John are teaching the people at the temple about Jesus' resurrection" },
  { id: "n2", label: "The priests, the temple guard captain, and the Sadducees come and seize Peter and John" },
  { id: "n3", label: "Peter and John are put in jail because it is already evening" },
  { id: "n4", label: "The next day, the rulers, elders and teachers of the law meet in Jerusalem" },
  { id: "n5", label: "Peter and John are brought before them and asked, \"By what power or what name did you do this?\"" },
  { id: "n6", label: "Peter, filled with the Holy Spirit, answers boldly and speaks about Jesus Christ" },
  { id: "n7", label: "Peter declares that salvation is found in no one else, for there is no other name given by which people must be saved (Acts 4:12)" },
  { id: "n8", label: "The rulers see the courage of Peter and John and realise they had been with Jesus" },
  { id: "n9", label: "Because the healed man is standing there with them, the rulers have nothing to say against them and let them go" },
];

interface EventFact { text: string; group: "arrest" | "boldness" }
const EVENT_FACTS: EventFact[] = [
  { text: "Peter and John were teaching the people about Jesus' resurrection at the temple", group: "arrest" },
  { text: "The priests, temple guard captain, and Sadducees seized Peter and John", group: "arrest" },
  { text: "Peter and John were put in jail overnight because it was already evening", group: "arrest" },
  { text: "The rulers, elders and teachers of the law gathered the next day in Jerusalem", group: "arrest" },
  { text: "Peter and John were asked by what power or name they had acted", group: "arrest" },
  { text: "Peter was filled with the Holy Spirit before he spoke", group: "boldness" },
  { text: "Peter spoke about Jesus Christ boldly in front of the rulers", group: "boldness" },
  { text: "Peter declared that salvation is found in no one else but Jesus (Acts 4:12)", group: "boldness" },
  { text: "The rulers were astonished at the courage of Peter and John", group: "boldness" },
  { text: "The rulers realised that Peter and John had been with Jesus", group: "boldness" },
  { text: "The healed man standing with Peter and John gave the rulers nothing to say against them", group: "boldness" },
  { text: "The rulers let Peter and John go because they could not deny what had happened", group: "boldness" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Sadducees", meaning: "A religious group, along with the priests and temple guard captain, who seized Peter and John" },
  { term: "Acts 4:12", meaning: "The verse where Peter declares salvation is found in no other name but Jesus Christ" },
  { term: "Boldness", meaning: "The courage Peter showed when speaking to the rulers, filled with the Holy Spirit" },
  { term: "\"By what power or what name?\"", meaning: "The question the rulers asked Peter and John about their actions" },
  { term: "Holy Spirit", meaning: "Who filled Peter before he answered the rulers boldly" },
  { term: "The healed man", meaning: "The living proof standing beside Peter and John that the rulers could not argue against" },
  { term: "Standing firm in faith", meaning: "Continuing to trust and speak about Jesus even while facing arrest and questioning" },
  { term: "Salvation call", meaning: "The invitation to respond to Jesus as the only source of salvation, as Peter proclaimed" },
  { term: "Temple", meaning: "The place where Peter and John were teaching the people when they were seized" },
  { term: "Elders and teachers of the law", meaning: "Along with the rulers, those who gathered in Jerusalem to question Peter and John" },
  { term: "Jail", meaning: "Where Peter and John were held overnight because it was already evening when they were arrested" },
  { term: "Astonished", meaning: "How the rulers reacted upon seeing the boldness of Peter and John" },
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
    prompt: `${name(rng)} in ${place(rng)} is teased for talking about Jesus at school and is told to stop. How does Peter and John's example in Acts 4 guide ${name(rng)}'s response?`,
    correct: "Stand firm and continue speaking about faith with courage, as Peter and John did even before the rulers",
    wrong: [
      "Stop talking about faith immediately to avoid any conflict",
      "Peter and John's example only applies to church leaders, not ordinary learners",
      "Only argue back angrily instead of speaking respectfully about faith",
    ],
    explanation: "Peter and John, filled with the Holy Spirit, spoke boldly about Jesus even while facing arrest — an example of standing firm in faith under pressure.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wonders why the rulers could not punish Peter and John even though they disagreed with their teaching. Based on Acts 4, why?`,
      correct: "Because the healed man was standing there as living proof, and the rulers had nothing to say against it",
      wrong: [
        "Because the rulers secretly agreed with everything Peter and John taught",
        "Because Roman law made it impossible to arrest anyone in the temple",
        "Because Peter and John bribed the rulers to let them go",
      ],
      explanation: "Acts 4 shows the rulers had nothing to say against Peter and John because the healed man was standing right there as undeniable evidence.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads Acts 4:12, where Peter says salvation is found in no other name. What does this verse teach about how Peter answered the rulers?`,
    correct: "Peter answered directly and boldly, declaring Jesus as the only source of salvation, without softening the message out of fear",
    wrong: [
      "Peter avoided the question entirely to stay safe",
      "Peter agreed that salvation could be found through several different names",
      "Peter only spoke quietly so the rulers would not hear him clearly",
    ],
    explanation: "Acts 4:12 shows Peter's direct, bold declaration that salvation is found in no one else but Jesus Christ, spoken to the very rulers questioning him.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices that the rulers realised Peter and John "had been with Jesus" just by observing their courage. What does this suggest about how faith can be recognised in a person?`,
      correct: "A person's courage and character can reveal that they have genuinely spent time following Jesus, even without them saying so directly",
      wrong: [
        "Courage has no connection at all to a person's faith or character",
        "Only wearing religious clothing shows someone has been with Jesus",
        "The rulers only assumed this because Peter told them directly",
      ],
      explanation: "The rulers observed Peter and John's boldness and concluded they had been with Jesus — showing that lived faith can be visible through a person's character and courage.",
    };
  },
  (rng) => ({
    prompt: `A class prefect in ${place(rng)} named ${name(rng)} is asked to stop mentioning their faith during class discussions, similar to how the rulers commanded Peter and John. What would match Peter and John's response from Acts 4?`,
    correct: "Continue speaking about what they have genuinely seen and experienced, respectfully but without being silenced",
    wrong: [
      "Obey the command immediately and never mention faith again",
      "Peter and John's story has nothing to teach about being told to stay silent",
      "Respond with disrespect toward the person giving the instruction",
    ],
    explanation: "Peter and John, though commanded to stop speaking in Jesus' name, could not help speaking about what they had seen and heard — a model for standing firm respectfully.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} believes that being arrested or questioned for one's faith always means something went wrong. How does Acts 4:1-13 challenge this belief?`,
    correct: "Being questioned for faith can happen even when someone is doing something good, like Peter and John, who had just helped heal a man",
    wrong: [
      "The belief is correct — arrest always proves wrongdoing",
      "Acts 4 shows that faith should always be hidden to avoid any questioning",
      "Peter and John were arrested because they had truly done something wrong",
    ],
    explanation: "Peter and John were arrested for teaching about Jesus' resurrection right after a good deed, showing that facing opposition does not mean someone has done wrong.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says that only trained pastors, not ordinary young Christians, can speak boldly about their faith like Peter did. What does this lesson suggest about that idea?`,
      correct: "Every Christian, not only religious leaders, can be filled with courage to speak about their faith, as this lesson encourages learners to stand firm too",
      wrong: [
        "The idea is correct — only apostles like Peter were ever meant to speak boldly",
        "Boldness in faith is a talent only a few rare people are born with",
        "This lesson only applies to adults, never to learners in school",
      ],
      explanation: "The lesson's outcome is for learners themselves to desire to stand firm in their Christian faith — the same boldness Peter and John showed is a model for every believer.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} points out that the rulers questioned Peter and John right after seeing a miracle happen. What does this show about how people can respond even to clear evidence of God's power?`,
    correct: "Even clear evidence of God's power does not automatically make everyone respond with belief or approval",
    wrong: [
      "Everyone who sees a miracle instantly becomes a believer",
      "The rulers had never heard about the miracle before questioning Peter and John",
      "Clear evidence of God's power always leads to immediate punishment",
    ],
    explanation: "Despite the healed man standing as proof, the rulers still questioned and initially opposed Peter and John — showing that evidence alone does not guarantee belief.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is nervous about defending a classmate who is being unfairly blamed, fearing the class prefect's anger. How does Peter and John's boldness in Acts 4 relate to this situation?`,
      correct: "Their boldness shows that speaking up for what is right, even to an authority figure, can be done with courage and respect",
      wrong: [
        "Peter and John's story only concerns religious topics, never fairness or defending others",
        "Boldness means being rude or disrespectful to authority figures",
        "It is always safer to stay completely silent, regardless of the situation",
      ],
      explanation: "Peter and John modeled speaking boldly and truthfully even to powerful rulers — a pattern that applies whenever courage is needed to stand up for what is right.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why the story specifically mentions that Peter was "filled with the Holy Spirit" right before he answered the rulers. What does this detail emphasise?`,
    correct: "Peter's boldness came from the Holy Spirit's help, not from his own natural courage alone",
    wrong: [
      "The detail is unimportant and adds nothing to the story",
      "It shows Peter had rehearsed his speech many times beforehand",
      "It means only Peter, and never any other believer, could be filled with the Holy Spirit",
    ],
    explanation: "Acts 4:8 specifically notes Peter was filled with the Holy Spirit before speaking, showing his boldness was Spirit-given, a source of strength available to all believers.",
  }),
  (rng) => ({
    prompt: `${name(rng)} says that once someone stands firm in their faith like Peter and John, they will never face any opposition again. Does the story of Acts 4 support this idea?`,
    correct: "No — Peter and John still faced arrest and questioning even while standing firm; boldness does not remove opposition, it helps someone face it",
    wrong: [
      "Yes — Peter and John never faced any trouble again after this event",
      "Yes — true faith always guarantees an easy, trouble-free life",
      "No — but only non-believers ever face opposition of any kind",
    ],
    explanation: "Peter and John were arrested and questioned despite their strong faith — the story shows boldness helps a believer face opposition, not avoid it entirely.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked by a teacher to explain why they believe in Jesus, and feels tempted to give a vague, uncertain answer. What would Peter's example in Acts 4:12 suggest instead?`,
      correct: "Give a clear, confident answer about faith in Jesus, the way Peter clearly declared salvation is found in no other name",
      wrong: [
        "Give a vague answer so as not to seem too confident",
        "Refuse to answer the teacher's question at all",
        "Change the subject entirely rather than address the question",
      ],
      explanation: "Peter's declaration in Acts 4:12 was direct and clear, not vague — a model for answering questions about faith with confidence rather than uncertainty.",
    };
  },
];

export const peterAndJohnInTheTemple: Skill = {
  id: "g5-cre-bi-peter-and-john",
  code: "BI.2",
  subjectId: "cre",
  strandId: "g5-cre-bible",
  grade: 5,
  title: "Peter and John in the Temple",
  description: "The story of Peter and John's arrest and bold testimony before the rulers in the temple (Acts 4:1-5, 7-13), Peter's declaration of salvation in Jesus alone (Acts 4:12), and standing firm in Christian faith.",
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
        hint: "Start with the teaching at the temple, and end with the rulers letting Peter and John go.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const arrest = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "arrest")).slice(0, 4);
      const boldness = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "boldness")).slice(0, 4);
      const chosen = shuffle(rng, [...arrest, ...boldness]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "arrest", label: "The arrest and questioning" },
          { id: "boldness", label: "Peter and John's bold response" },
        ],
        correctBucket,
        hint: "The arrest bucket is about what the rulers did; the boldness bucket is about how Peter and John responded.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "arrest" ? "the arrest and questioning" : "Peter and John's bold response"}.`).join(" "),
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
        hint: "Think about who arrested Peter and John, and what happened when they were questioned.",
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
        hint: "Think about how Peter and John responded to the rulers' questioning in Acts 4.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "Peter and John were teaching the people about Jesus' resurrection at the", after: ".", answer: "temple", accepted: ["temple"] },
      { before: "The priests, temple guard captain, and", after: "seized Peter and John.", answer: "Sadducees", accepted: ["sadducees"] },
      { before: "Peter and John were put in jail because it was already", after: ".", answer: "evening", accepted: ["evening"] },
      { before: "The rulers asked Peter and John, \"By what power or what", after: "did you do this?\"", answer: "name", accepted: ["name"] },
      { before: "Peter answered boldly because he was filled with the", after: ".", answer: "Holy Spirit", accepted: ["holy spirit"] },
      { before: "Acts 4:12 says salvation is found in no other", after: ".", answer: "name", accepted: ["name"] },
      { before: "The rulers realised Peter and John had been", after: "with Jesus.", answer: "with", accepted: ["with"] },
      { before: "The rulers had nothing to say because the healed", after: "was standing there.", answer: "man", accepted: ["man"] },
      { before: "The rulers let Peter and John go because they could not deny what had", after: ".", answer: "happened", accepted: ["happened"] },
      { before: "This story teaches Christians to stand firm in their", after: ".", answer: "faith", accepted: ["faith"] },
      { before: "Peter and John showed that responding to the salvation call means having faith in", after: ".", answer: "God", accepted: ["god"] },
      { before: "This lesson's key inquiry question asks how Peter and John demonstrated", after: "in God.", answer: "faith", accepted: ["faith"] },
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
      hint: "Think about Acts 4:1-13 and how Peter and John responded to being arrested and questioned.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
