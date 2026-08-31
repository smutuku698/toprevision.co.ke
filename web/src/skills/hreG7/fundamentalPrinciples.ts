import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, neighbour, place, worshipPlace, type ScenarioMC } from "./shared";

// KICD Grade 7 HRE, Strand 3.0 → Sub-strand 3.1 "Fundamental Principles" (14 lessons).
//
// Source reading of the sub-strand bullet list: "Principles of the four faiths / Pranidaya
// (compassion) / Purusharth (hard work) / Jain — Nonviolence (Ahimsa), Non-stealing (Astey) / Sikh
// Dharma — Compassion (Daya) / Humility (Nimrata)". Pranidaya and Purusharth sit under the general
// "principles of the four faiths" heading; Ahimsa and Astey are marked Jain; Daya and Nimrata are
// marked Sikh. All SIX named principles are implemented. (The outcomes and rubric say "the four
// selected Principles" while the bullets name six — a discrepancy in the source. Covering six
// cannot fail a rubric that grades four; dropping two named items could.)
//
// Deliberate omission: the design names NO Buddhist principle in this sub-strand, even though its
// first bullet is headed "principles of the four faiths". No Buddhist principle is invented here —
// Buddhist practice is covered where the design actually places it, in sub-strand 4.1.
//
// The design's own gloss is treated as binding: Purusharth is taught as hard work / self-effort at
// this grade, NOT as the classical four aims of life (dharma, artha, kama, moksha).
//
// Visual scope: declined — see curriculum-reference/grade-7/hindu-religious-education.json →
// visualCoverageDecision.

const MEANING_MATCH_PROMPTS = [
  "Match each Principle of Dharma to its meaning.",
  "Pair each principle with the meaning that fits it.",
  "Connect each Principle of Dharma to its correct meaning.",
  "Link each principle below to what it means.",
  "Match each term to the meaning that fits it.",
  "Choose the correct meaning for each Principle of Dharma.",
];

const TRADITION_SORT_PROMPTS = [
  "Sort each Principle of Dharma by how the Grade 7 design names it — as a Jain principle, a Sikh principle, or a principle named for the four faiths together.",
  "Group each Principle of Dharma by the tradition the Grade 7 design assigns it to.",
  "Sort these principles into Jain, Sikh, or named-for-the-four-faiths.",
  "Decide how the design names each principle — Jain, Sikh, or for the four faiths together — and sort it there.",
  "Place each Principle of Dharma into the category the design gives it.",
  "Categorise each principle by the tradition it is named under in the design.",
];

const PRACTICE_SORT_PROMPTS = [
  "Sort each action by the Principle of Dharma it puts into practice.",
  "Group these actions under the Principle of Dharma each one demonstrates.",
  "Decide which Principle of Dharma each action shows, and sort it there.",
  "Sort each real-life action into the principle it is putting into practice.",
  "Place each action under the principle it demonstrates.",
  "Read each action and sort it under the matching Principle of Dharma.",
];

const PROJECT_ORDER_PROMPTS = (p: string) => [
  `An HRE club in ${p} is planning its term's work on the Principles of Dharma, following the order the Grade 7 design suggests. Arrange the stages in that order.`,
  `Put these stages of an HRE club's term project in ${p} into the order the Grade 7 design suggests.`,
  `Sequence these project stages, planned by an HRE club in ${p}, as the design lays them out.`,
  `Arrange the stages of this Principles-of-Dharma project near ${p} in the design's suggested order.`,
  `Order these stages the way the Grade 7 design suggests an HRE club in ${p} should carry them out.`,
  `Sort these project stages from an HRE club in ${p} into the sequence the design recommends.`,
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
];

const PRINCIPLES = [
  {
    id: "pranidaya",
    label: "Pranidaya",
    english: "Compassion for all living beings",
    tradition: "Named for the four faiths",
    meaning: "Feeling for the suffering of every living creature — 'prani' means a living being and 'daya' means compassion",
  },
  {
    id: "purusharth",
    label: "Purusharth",
    english: "Hard work",
    tradition: "Named for the four faiths",
    meaning: "Personal effort and diligence — shaping your life by your own honest work rather than waiting on luck or fate",
  },
  {
    id: "ahimsa",
    label: "Ahimsa",
    english: "Non-violence (Jain)",
    tradition: "Jain",
    meaning: "Causing no harm to any living being by thought, word or deed — the first and greatest of the Jain vows",
  },
  {
    id: "astey",
    label: "Astey",
    english: "Non-stealing (Jain)",
    tradition: "Jain",
    meaning: "Taking nothing that has not been freely given, including credit, time and more than one's fair share",
  },
  {
    id: "daya",
    label: "Daya",
    english: "Compassion (Sikh)",
    tradition: "Sikh",
    meaning: "Active mercy that moves a person to relieve suffering — one of the virtues Sikh Dharma asks a person to build",
  },
  {
    id: "nimrata",
    label: "Nimrata",
    english: "Humility (Sikh)",
    tradition: "Sikh",
    meaning: "Freedom from ego and self-importance, which makes genuine service (seva) of others possible",
  },
] as const;

// Buckets for the "which principle is being practised" sort. Pranidaya and Daya are combined into
// one bucket on purpose: both mean compassion, and asking a learner to split real situations
// between two words for the same virtue would be unfair rather than rigorous.
const PRACTICE_BUCKETS = [
  { id: "compassion", label: "Compassion (Pranidaya / Daya)" },
  { id: "ahimsa", label: "Ahimsa — non-violence" },
  { id: "astey", label: "Astey — non-stealing" },
  { id: "nimrata", label: "Nimrata — humility" },
  { id: "purusharth", label: "Purusharth — hard work" },
] as const;

// 20 real situations across the five practice buckets — twice the 10-item floor.
const PRACTICE_ITEMS: { text: string; bucket: string }[] = [
  { text: "Stopping at a road crash to comfort an injured survivor and call for help", bucket: "compassion" },
  { text: "Visiting a home for the elderly every month and sitting with residents who have no visitors", bucket: "compassion" },
  { text: "Carrying water and shade to an injured stray dog until help arrives", bucket: "compassion" },
  { text: "Giving your own umbrella to a classmate who has a long walk home in the rain", bucket: "compassion" },
  { text: "Refusing to join classmates who are throwing stones at a stray animal", bucket: "ahimsa" },
  { text: "Choosing a meal at a school function that did not require an animal to be killed", bucket: "ahimsa" },
  { text: "Answering an insult calmly instead of insulting back, so that no one is wounded by words", bucket: "ahimsa" },
  { text: "Carefully carrying an insect out of the classroom rather than crushing it", bucket: "ahimsa" },
  { text: "Handing in a wallet found at the matatu stage instead of keeping the money", bucket: "astey" },
  { text: "Refusing to copy a classmate's answers during an examination", bucket: "astey" },
  { text: "Naming the writer whose words you quoted in your project instead of passing them off as your own", bucket: "astey" },
  { text: "Taking only your fair share of the food at a community meal so that everyone is served", bucket: "astey" },
  { text: "Accepting a correction from a younger classmate without arguing or making excuses", bucket: "nimrata" },
  { text: "Quietly tidying the shoe racks at the place of worship without telling anyone you did it", bucket: "nimrata" },
  { text: "Letting another group member present the work, even though you did most of it", bucket: "nimrata" },
  { text: "Apologising first after a quarrel, without waiting to be asked", bucket: "nimrata" },
  { text: "Waking early to revise steadily instead of hoping for luck on the examination day", bucket: "purusharth" },
  { text: "Repeating a failed experiment carefully rather than blaming bad fortune for the result", bucket: "purusharth" },
  { text: "Saving a little each month over a term to buy the materials a project needs", bucket: "purusharth" },
  { text: "Practising a difficult recitation daily for weeks until it is finally accurate", bucket: "purusharth" },
];

// The design's own Suggested Learning Experiences, in the order it lists them. Per
// SKILL-QUALITY-STANDARDS.md, a design's learning-experience bullet order is itself a suggested
// teaching sequence and is a legitimate ordering source — this is not an invented order.
const PROJECT_STAGES = [
  "Make a game on the fundamental principles of Dharma out of locally available materials, such as a snakes-and-ladders board or a word puzzle",
  "Discuss with peers why compassion matters to survivors of road crashes, and how the principles apply to them",
  "Dramatize the Scriptural stories built on the fundamental principles of Dharma",
  "Visit animal shelters, homes for the elderly and orphanages to put the principles into practice",
  "Visit places of worship and interview a resource person about how the principles are applied",
  "Peer-teach the lessons drawn from the Scriptural stories to classmates who need extra support",
] as const;

const SCENARIO_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A matatu and a boda-boda collide near ${who}'s home in ${place(rng)}. Bystanders crowd round to film the injured rider on their phones. ${who} instead kneels beside him, keeps him still, shades him from the sun and calls for help. Which Principle of Dharma is ${who} practising?`,
      correct: "Pranidaya / Daya — compassion that moves a person to act to relieve another's suffering",
      wrong: [
        "Astey — non-stealing, since he is not taking anything from the injured rider",
        "Purusharth — hard work, since helping requires effort",
        "Nimrata — humility, since he knelt down on the road",
      ],
      explanation:
        "Compassion is the principle that turns pity into action for someone who is suffering — the very case the design names when it asks learners to discuss compassion towards road crash survivors. The wrong options each latch onto a surface detail (not taking, effort, kneeling) rather than what actually drives the act.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finds a wallet with two thousand shillings at a stage in ${place(rng)}. Nobody saw her pick it up. She hands it to the stage supervisor with the money untouched. Which Principle of Dharma is she practising?`,
      correct: "Astey — non-stealing, which means taking nothing that has not been freely given",
      wrong: [
        "Ahimsa — non-violence, since she did not hurt anybody",
        "Nimrata — humility, since she did not boast about her decision",
        "Purusharth — hard work, since she went out of her way to return it",
      ],
      explanation:
        "Astey covers exactly this: property that was never given to her is not hers to keep, whether or not anyone is watching. Not hurting anyone and not boasting are true of the situation, but neither is what makes the act right.",
    };
  },
  (rng) => {
    const who = name(rng);
    const friend = neighbour(rng);
    return {
      prompt: `${who}'s group project in ${place(rng)} wins the class prize. ${who} did most of the work, but she asks ${friend}, the quietest member, to present it and thanks the whole group by name. Which Principle of Dharma is she practising?`,
      correct: "Nimrata — humility, which sets aside self-importance so others can be raised up",
      wrong: [
        "Astey — non-stealing, since she did not take anyone else's work",
        "Pranidaya — compassion, since she felt sorry for the quiet member",
        "Purusharth — hard work, since she did most of the project",
      ],
      explanation:
        "Handing over the credit she could have claimed is humility (Nimrata) — freedom from ego. Pity is not the driver here, and although she did work hard, hard work is not what the final decision demonstrates.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} fails a science test and says his family's bad luck is to blame. His teacher points him to a Principle of Dharma instead: study a fixed hour each evening, ask for help early, and repeat the practice questions until they are right. Which principle is the teacher applying?`,
    correct: "Purusharth — hard work and self-effort, rather than leaving one's life to luck or fate",
    wrong: [
      "Nimrata — humility, since he must admit he failed",
      "Daya — compassion, since the teacher is being kind to him",
      "Astey — non-stealing, since he must not copy from others",
    ],
    explanation:
      "Purusharth is the principle that a person's own steady effort shapes their life. The teacher's kindness and the learner's need for humility are real, but the actual remedy prescribed — sustained personal effort — is Purusharth.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Some boys near ${place(rng)} are throwing stones at a stray dog for fun. ${who} steps in, stops them, and later brings the dog water. Which two Principles of Dharma is ${who} showing, in that order?`,
      correct: "Ahimsa first — stopping harm being done — then Pranidaya, compassion in caring for the animal",
      wrong: [
        "Purusharth first, then Astey",
        "Nimrata first, then Purusharth",
        "Astey first, then Ahimsa",
      ],
      explanation:
        "Preventing harm to a living being is Ahimsa; going on to relieve the animal's suffering is Pranidaya, compassion for all living creatures. Hard work, non-stealing and humility are not what either half of this act demonstrates.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `In an examination hall in ${place(rng)}, ${who} realises she has revised the wrong topic. Her friend slides an answer sheet towards her. She refuses it and answers what she can. Which Principle of Dharma is she keeping?`,
      correct: "Astey — non-stealing, because marks taken through copied answers were never hers to take",
      wrong: [
        "Ahimsa — non-violence, since refusing does not hurt her friend",
        "Purusharth — hard work, since she had already revised",
        "Daya — compassion, since she is protecting her friend from trouble",
      ],
      explanation:
        "Astey extends past property to anything not freely and rightly given — including marks and credit. She had revised, but the decision in front of her is about taking what is not hers, not about effort already spent.",
    };
  },
  (rng) => ({
    prompt: `An HRE club in ${place(rng)} is designing a snakes-and-ladders board on the Principles of Dharma. Which pairing of squares best reflects the principles correctly?`,
    correct: "A ladder for 'returned a lost phone to its owner' and a snake for 'kept the change a shopkeeper gave you by mistake'",
    wrong: [
      "A ladder for 'kept quiet when you saw someone bullied' and a snake for 'told a teacher about bullying'",
      "A ladder for 'blamed bad luck for a poor grade' and a snake for 'revised every evening for a month'",
      "A ladder for 'boasted about your donation' and a snake for 'gave quietly without telling anyone'",
    ],
    explanation:
      "Returning lost property is Astey and keeping what is not yours breaks it, so the ladder and snake are the right way round. Each wrong option inverts a principle — rewarding silence over bullying, luck over Purusharth, or boasting over Nimrata.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s class visits ${worshipPlace(rng)} in ${place(rng)} and is given a task: interview a resource person about how one principle is lived out every day, not just believed. Which question best fits that task?`,
      correct: "\"What does this community actually do each week that puts compassion into practice, and who benefits?\"",
      wrong: [
        "\"How many people attend here on a normal day?\"",
        "\"Which of the four faiths do you think has the best principles?\"",
        "\"When was this building put up, and who paid for it?\"",
      ],
      explanation:
        "The outcome is to gain insight into the APPLICATION of the Principles of Dharma, so the question must ask what is done and for whom. Attendance and building history are facts about the place, and asking which faith is best contradicts the subject's aim of mutual respect.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} tells the class that Purusharth means simply accepting whatever life brings, because everything is already decided. Which correction is right?`,
      correct: "Purusharth means the opposite — it is personal effort and hard work, the belief that your own honest striving shapes what your life becomes",
      wrong: [
        "Purusharth means giving away wealth to those who have less",
        "Purusharth means never harming any living being by thought, word or deed",
        "Purusharth means keeping silent about your own achievements",
      ],
      explanation:
        "The design glosses Purusharth as hard work — self-effort rather than resignation. Giving to others, harming nothing, and staying quiet about achievements describe charity, Ahimsa and Nimrata respectively.",
    };
  },
  (rng) => ({
    prompt: `A class in ${place(rng)} is preparing a drama of Tirthankar Neminath freeing the animals gathered for his wedding feast. Which Principle of Dharma should the drama put at its centre?`,
    correct: "Ahimsa — non-violence, refusing harm to living beings even at great personal cost",
    wrong: [
      "Astey — non-stealing, since the animals belonged to someone else",
      "Purusharth — hard work, since arranging a wedding takes great effort",
      "Nimrata — humility, since a prince lowered himself to speak to a charioteer",
    ],
    explanation:
      "The whole point of the episode is refusing violence to living beings and paying the price for it personally — Ahimsa. Ownership of the animals, the effort of the wedding and speaking to the charioteer are incidental details, not the principle the story is built on.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s club in ${place(rng)} plans a single visit to an orphanage on a public holiday, with photographs for social media. A member proposes instead a quiet monthly visit over the whole term, with no photographs. Which plan better matches how this sub-strand asks learners to practise the principles, and why?`,
      correct: "The monthly visit — the design asks learners to visit orphanages, elderly homes and animal shelters to PRACTISE the principles, and Nimrata makes the absence of publicity a strength, not a loss",
      wrong: [
        "The single publicised visit, because more people will be inspired to help when they see the photographs",
        "The single publicised visit, because one well-organised day gives more help than several small ones",
        "Neither, because charity work belongs outside HRE lessons",
      ],
      explanation:
        "Practising a principle means sustained action, and humility (Nimrata) counts publicity as no part of the good done. The design lists these visits among its own learning experiences, so the work is squarely inside HRE, not outside it.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} argues that compassion (Pranidaya) and non-violence (Ahimsa) are the same principle under two names. Which explanation of the difference is best?`,
      correct: "Ahimsa is refusing to cause harm; Pranidaya goes further and moves you to relieve harm that someone or something is already suffering",
      wrong: [
        "They are identical, and the two words exist only because two different faiths use them",
        "Ahimsa applies only to animals, while Pranidaya applies only to people",
        "Ahimsa is a Sikh principle and Pranidaya is a Jain one",
      ],
      explanation:
        "Not throwing the stone is Ahimsa; carrying water to the injured dog afterwards is Pranidaya. Both cover people and animals alike, and the design lists Ahimsa as Jain while Pranidaya sits under the principles named for the four faiths.",
    };
  },
];

const FILL_BLANK_TEMPLATES = [
  {
    before: "The principle of ",
    after: " means compassion for all living beings — 'prani' meaning a living being and 'daya' meaning compassion.",
    correctAnswer: "Pranidaya",
    acceptedAnswers: ["pranidaya", "prani daya", "prani-daya"],
    hint: "The design glosses it simply as 'compassion'.",
    explanation: "Pranidaya is compassion extended to every living creature, not to human beings alone.",
  },
  {
    before: "The principle of ",
    after: " means hard work — shaping your life through your own honest effort rather than waiting on luck.",
    correctAnswer: "Purusharth",
    acceptedAnswers: ["purusharth", "purushartha"],
    hint: "The design glosses it as 'hard work'.",
    explanation: "Purusharth is self-effort: steady personal work is what shapes a life, rather than fate or fortune.",
  },
  {
    before: "The Jain principle of ",
    after: " means non-violence — causing no harm to any living being by thought, word or deed.",
    correctAnswer: "Ahimsa",
    acceptedAnswers: ["ahimsa"],
    hint: "It is the first and greatest of the Jain vows.",
    explanation: "Ahimsa forbids harm in thought and speech as well as action, which is why harsh words also break it.",
  },
  {
    before: "The Jain principle of ",
    after: " means non-stealing — taking nothing that has not been freely given.",
    correctAnswer: "Astey",
    acceptedAnswers: ["astey", "asteya"],
    hint: "It covers marks, credit and time as well as property.",
    explanation: "Astey rules out copying in examinations and keeping found property just as firmly as it rules out theft.",
  },
  {
    before: "The Sikh principle of ",
    after: " means compassion — the active mercy that moves a person to relieve another's suffering.",
    correctAnswer: "Daya",
    acceptedAnswers: ["daya", "dayaa"],
    hint: "It is the Sikh term the design pairs with compassion.",
    explanation: "Daya is compassion that acts, and Sikh Dharma counts it among the virtues a person is to build.",
  },
  {
    before: "The Sikh principle of ",
    after: " means humility — freedom from ego, which makes genuine service of others possible.",
    correctAnswer: "Nimrata",
    acceptedAnswers: ["nimrata", "nimarta"],
    hint: "It is the opposite of pride and self-importance.",
    explanation: "Nimrata clears away self-importance so that seva — selfless service — can be offered without seeking credit.",
  },
  {
    before: "Ahimsa is broken not only by striking someone, but also by harming them through ",
    after: " — which is why cruel speech counts as violence.",
    correctAnswer: "words",
    acceptedAnswers: ["words", "word", "speech"],
    hint: "Thought, word and deed are all covered.",
    explanation: "Because Ahimsa covers thought, word and deed, insults and mockery break it as surely as a blow does.",
  },
  {
    before: "Copying a classmate's answers in an examination breaks the principle of ",
    after: ", because the marks were never freely given.",
    correctAnswer: "Astey",
    acceptedAnswers: ["astey", "asteya", "non-stealing"],
    hint: "The principle of non-stealing reaches beyond property.",
    explanation: "Astey applies to anything taken that was not rightly given — marks, credit and another person's words included.",
  },
  {
    before: "Tirthankar Neminath's decision to free the animals penned for his wedding feast is the clearest example of the principle of ",
    after: ".",
    correctAnswer: "Ahimsa",
    acceptedAnswers: ["ahimsa", "non-violence", "nonviolence"],
    hint: "He refused harm to living beings even though it cost him his marriage.",
    explanation: "Neminath's story is the sub-strand's model of Ahimsa: refusing violence to living beings and accepting the personal cost of doing so.",
  },
  {
    before: "Guru Har Rai Ji giving rare medicine to the son of a ruler whose family had persecuted the Sikhs is an example of the Sikh principle of ",
    after: ".",
    correctAnswer: "Daya",
    acceptedAnswers: ["daya", "compassion"],
    hint: "The principle of active mercy towards those who are suffering.",
    explanation: "Daya moved the Guru to heal a suffering person without first asking whether that person's family deserved help.",
  },
  {
    before: "The design asks learners to discuss the importance of compassion towards survivors of ",
    after: " crashes, showing that these principles apply to everyday emergencies.",
    correctAnswer: "road",
    acceptedAnswers: ["road", "road traffic", "traffic"],
    hint: "The design names this real-world situation itself.",
    explanation: "Road crash survivors are the design's own named context for practising compassion — a real emergency, not a hypothetical one.",
  },
  {
    before: "Quietly tidying the place of worship without telling anybody you did it is an example of the principle of ",
    after: ".",
    correctAnswer: "Nimrata",
    acceptedAnswers: ["nimrata", "humility"],
    hint: "The principle that leaves out any wish for credit.",
    explanation: "Nimrata — humility — is what allows service to be offered for its own sake rather than for recognition.",
  },
] as const;

export const fundamentalPrinciples: Skill = {
  id: "g7-hre-pd-fundamental-principles",
  code: "PD.1",
  subjectId: "hre",
  strandId: "g7-hre-pd",
  grade: 7,
  title: "Fundamental Principles of Dharma",
  description:
    "The fundamental Principles of Dharma set for Grade 7 — Pranidaya (compassion), Purusharth (hard work), the Jain principles of Ahimsa and Astey, and the Sikh principles of Daya and Nimrata — with the Scriptural stories and daily situations that show them in practice.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["meaning-match", "tradition-sort", "practice-sort", "scenario", "project-order", "fill-blank"] as const
    );

    if (branch === "meaning-match") {
      const chosen = shuffle(rng, PRINCIPLES).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.meaning })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MEANING_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Two of the six principles mean compassion, but they are named in different traditions — read the whole meaning before matching.",
        explanation: chosen.map((p) => `${p.label} — ${p.meaning}.`).join(" "),
      };
    }

    if (branch === "tradition-sort") {
      const items = shuffle(rng, PRINCIPLES.map((p) => ({ id: p.id, label: `${p.label} (${p.english.replace(/ \((Jain|Sikh)\)$/, "")})` })));
      const buckets = Array.from(new Set(PRINCIPLES.map((p) => p.tradition))).map((t) => ({ id: t, label: t }));
      const correctBucket: Record<string, string> = {};
      for (const p of PRINCIPLES) correctBucket[p.id] = p.tradition;
      return {
        kind: "categorize",
        prompt: randChoice(rng, TRADITION_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "The design marks Ahimsa and Astey as Jain, and Daya and Nimrata as Sikh; the other two sit under the principles of the four faiths.",
        explanation: PRINCIPLES.map((p) => `${p.label} — ${p.tradition}.`).join(" "),
      };
    }

    if (branch === "practice-sort") {
      const buckets = shuffle(rng, PRACTICE_BUCKETS).slice(0, 3);
      const pool = shuffle(rng, PRACTICE_ITEMS.filter((it) => buckets.some((b) => b.id === it.bucket))).slice(0, 9);
      const items = pool.map((it, i) => ({ id: `p${i}`, label: it.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((it, i) => (correctBucket[`p${i}`] = it.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, PRACTICE_SORT_PROMPTS),
        items,
        buckets: buckets.map((b) => ({ id: b.id, label: b.label })),
        correctBucket,
        hint: "Ask what the action is really about: relieving suffering, refusing harm, refusing to take what is not yours, setting ego aside, or steady personal effort.",
        explanation: pool
          .map((it) => `"${it.text}" — ${PRACTICE_BUCKETS.find((b) => b.id === it.bucket)!.label}.`)
          .join(" "),
      };
    }

    if (branch === "project-order") {
      const ordered = PROJECT_STAGES.map((label, i) => ({ id: `st${i}`, label }));
      return {
        kind: "ordering",
        prompt: randChoice(rng, PROJECT_ORDER_PROMPTS(place(rng))),
        instruction: "Click the stages in the order the design suggests, from first to last.",
        items: shuffle(rng, ordered),
        correctOrder: ordered.map((s) => s.id),
        hint: "The design moves from making and discussing, to acting out the stories, then to service visits, then to interviewing a resource person, and finally to teaching others what was learnt.",
        explanation: PROJECT_STAGES.join(" → "),
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
        hint: "Several principles may be true of the situation — pick the one that the key decision actually rests on.",
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
