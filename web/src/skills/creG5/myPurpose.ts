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
    "the events of the parable of the talents in the order they happened.",
    "these events from Matthew 25:14-30 into the order they happened.",
    "these moments from the parable of the talents in order.",
    "these events the way they happened, from the master leaving to his return.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it describes a talent used well or a talent buried in fear.",
    "these facts about the parable of the talents under the correct heading.",
    "each fact below by which kind of servant it describes.",
    "each statement into the bucket for how the talent was treated.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term below with its correct meaning.",
    "each idea about talents and purpose with its explanation.",
    "each term to the description that fits it.",
    "each term or verse to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about talents and purpose.",
    "the correct missing word.",
  ],
);

// The parable of the talents (Matthew 25:14-30) has a clear narrative sequence: a master entrusts talents
// before a journey, two servants trade and grow theirs, one buries his out of fear, and the master returns
// to settle accounts — a genuine story sequence, unlike some Creation sub-strands.
const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "A master calls his three servants together before going on a long journey (Matthew 25:14)" },
  { id: "n2", label: "He entrusts five talents to the first servant, two to the second, and one to the third, each according to his ability (Matthew 25:15)" },
  { id: "n3", label: "The servant with five talents goes at once and trades with them, gaining five more talents (Matthew 25:16)" },
  { id: "n4", label: "The servant with two talents also trades and gains two more talents (Matthew 25:17)" },
  { id: "n5", label: "The servant with one talent goes and digs a hole in the ground and hides his master's money (Matthew 25:18)" },
  { id: "n6", label: "After a long time, the master returns and settles accounts with his three servants (Matthew 25:19)" },
  { id: "n7", label: "The master praises the first two servants as \"good and faithful\" and gives them more responsibility (Matthew 25:21, 23)" },
  { id: "n8", label: "The master rebukes the third servant as \"wicked and lazy\" and takes away his one talent (Matthew 25:26-28)" },
];

interface EventFact { text: string; result: "usedWell" | "buriedInFear" }
const EVENT_FACTS: EventFact[] = [
  { text: "The servant given five talents traded them at once and gained five more talents", result: "usedWell" },
  { text: "The servant given two talents also traded them and gained two more talents", result: "usedWell" },
  { text: "The master called the first two servants \"good and faithful\" for what they did with their talents", result: "usedWell" },
  { text: "Both faithful servants were given even more responsibility as a reward", result: "usedWell" },
  { text: "The five-talent and two-talent servants were both praised equally, even though their talents were different in number", result: "usedWell" },
  { text: "Using a talent actively, even a smaller one, pleased the master in the parable", result: "usedWell" },
  { text: "The servant given one talent dug a hole in the ground and hid his master's money", result: "buriedInFear" },
  { text: "This servant was afraid of his master and did nothing useful with what he was given", result: "buriedInFear" },
  { text: "The master called this servant \"wicked and lazy\" for failing to use his talent", result: "buriedInFear" },
  { text: "The one talent was taken away from this servant and given to the servant who now had ten", result: "buriedInFear" },
  { text: "Fear of failure caused the third servant to waste the opportunity he was given", result: "buriedInFear" },
  { text: "The parable warns that even a small talent is worth using, not hiding out of fear", result: "buriedInFear" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Jeremiah 29:11", meaning: "The verse that reminds us God has good plans to give us hope and a future" },
  { term: "The Parable of the Talents", meaning: "Jesus' story in Matthew 25:14-30 about three servants and how they used what their master gave them" },
  { term: "James 1:17", meaning: "The verse that teaches every good and perfect gift comes down from God, the giver of all good things" },
  { term: "1 Peter 4:10", meaning: "The verse that teaches each person should use whatever gift they have received to serve others" },
  { term: "The five-talent servant", meaning: "The servant in the parable who traded his five talents and gained five more" },
  { term: "The one-talent servant", meaning: "The servant in the parable who buried his talent in the ground out of fear" },
  { term: "A purposeful life", meaning: "A life lived by discovering and using the talents, gifts and abilities God has given you" },
  { term: "Nurturing a talent", meaning: "Practising and developing a gift regularly instead of letting it go to waste" },
  { term: "A school talent show", meaning: "An activity where learners can practise and display gifts such as singing, drawing or public speaking" },
  { term: "A church youth choir", meaning: "A place where a learner can nurture a musical talent while serving the church" },
  { term: "A home chore rota", meaning: "A place at home where a learner can nurture organising or caregiving abilities" },
  { term: "Stewardship of a gift", meaning: "Taking responsibility to grow and rightly use a talent instead of hiding or wasting it" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Mwangi", "Adhiambo", "Kiplagat", "Nasimiyu", "Barasa", "Njoki", "Kimutai", "Auma", "Rotich"] as const;
const KENYAN_PLACES = ["Thika", "Bungoma", "Machakos", "Eldoret", "Lodwar", "Meru", "Kisii", "Mombasa", "Nakuru", "Kajiado", "Webuye", "Kitale"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} asks why the master in Matthew 25:14-30 gave different numbers of talents to each servant, "each according to his ability." What does this detail teach about God's gifts?`,
    correct: "God gives different people different gifts suited to them, not identical gifts to everyone",
    wrong: [
      "The master made a mistake and should have given everyone the same amount",
      "Only the servant with five talents actually mattered to the master",
      "A servant given fewer talents was being punished before the story even began",
    ],
    explanation: "The master gave gifts \"according to his ability,\" showing God gives people different gifts suited to them — not identical gifts, and not a punishment for receiving fewer.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} points out that the servant with two talents was praised exactly the same way as the servant with five talents. What lesson does this teach about using a smaller gift?`,
    correct: "Faithfully using a smaller gift is valued by God just as much as using a bigger one",
    wrong: [
      "Only the servant with the most talents deserved any praise at all",
      "The two-talent servant was secretly disappointing the master",
      "Talents only count if there are at least five of them",
    ],
    explanation: "The master gave the exact same praise, \"good and faithful servant,\" to both the five-talent and two-talent servants — faithfulness with what you have matters more than the size of the gift.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is naturally good at drawing but never practises, saying the talent will always be there whenever needed. Based on the one-talent servant's mistake in the parable, what is the risk in ${who}'s thinking?`,
      correct: "Like the servant who buried his talent, refusing to use and develop a gift can cause it to be wasted",
      wrong: [
        "There is no risk, since talents never need any practice once received",
        "The parable teaches that talents grow automatically without any effort",
        "Only servants in Bible stories need to worry about wasting a gift",
      ],
      explanation: "The one-talent servant lost even the talent he was given because he did nothing with it — the parable warns that neglecting a gift, not just misusing it, is itself a failure.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads Jeremiah 29:11, "plans to prosper you and not to harm you, plans to give you hope and a future," after failing a test in ${place(rng)}. How does this verse relate to knowing one's purpose?`,
    correct: "It reminds a person that God already has a good purpose for their life, even after a setback",
    wrong: [
      "It means every plan a person makes for themselves will always succeed without effort",
      "It promises that no one will ever face a difficult day again",
      "It only applies to adults who already know their exact career",
    ],
    explanation: "Jeremiah 29:11 reassures that God has good plans and hope for a person's life — a foundation for confidently discovering and living out one's purpose, even after setbacks.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} reads James 1:17, which says every good and perfect gift comes down from God. A classmate insists that being good at football is "just something you're born with, nothing to do with God." How does James 1:17 respond to this claim?`,
    correct: "James 1:17 teaches that every good gift, including natural ability, ultimately comes from God",
    wrong: [
      "James 1:17 agrees that talents have nothing to do with God at all",
      "James 1:17 only talks about spiritual gifts, never physical ones like sports",
      "James 1:17 says only gifts received as an adult come from God",
    ],
    explanation: "James 1:17 states plainly that every good and perfect gift comes down from God — including natural abilities like sporting talent, not only gifts a person receives later in life.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, who sings well, reads 1 Peter 4:10, "each of you should use whatever gift you have received to serve others." ${who} currently only sings for personal enjoyment at home and never shares the gift. What does 1 Peter 4:10 suggest ${who} should consider?`,
      correct: "Using the gift to serve others, such as singing in the church choir, not only enjoying it privately",
      wrong: [
        "Stopping singing altogether since it was never meant to be enjoyed personally",
        "Waiting until becoming a professional musician before ever singing for others",
        "Keeping the gift completely private forever, since sharing it is optional",
      ],
      explanation: "1 Peter 4:10 teaches that a gift is meant to be used \"to serve others,\" so a hidden or purely private talent is not yet fulfilling its full purpose.",
    };
  },
  (rng) => ({
    prompt: `A class in ${place(rng)}, led by ${name(rng)}, is asked what the master in the parable did to the one talent after taking it from the fearful servant. What happened to it?`,
    correct: "It was given to the servant who already had ten talents, since he had proven faithful with what he was given",
    wrong: [
      "The talent was simply destroyed so no one could ever use it",
      "It was buried permanently, the same way the fearful servant had buried it",
      "The master kept it for himself and gave nothing further to any servant",
    ],
    explanation: "Matthew 25:28 records that the one talent was taken from the fearful servant and given to the servant who had ten — the one who had proven most faithful with what he was given.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is skilled at organising events but only volunteers when there is a school talent show to be seen. What value, based on the lesson on nurturing talents, is missing from this attitude?`,
    correct: "Responsibility — a talent should be nurtured through consistent activities, not only used when it brings attention",
    wrong: [
      "Unity — organising events has nothing to do with cooperation as a value",
      "There is no value missing, since occasional use of a talent is always enough",
      "Talents only need to be used once a year to count as nurtured",
    ],
    explanation: "The lesson's outcome of participating in different activities to nurture a talent points to consistent responsibility, not just occasional, attention-seeking use of a gift.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} believes knowing your talents, gifts and abilities does not matter much, since "things will work out anyway." Based on the key inquiry question of this lesson, why is it actually important to know your talents?`,
      correct: "Knowing your talents helps you live a purposeful life and nurture the gifts God has given you on purpose, not by accident",
      wrong: [
        "It is not important, since talents appear automatically without needing to be identified",
        "Knowing your talents is only useful for winning school competitions",
        "It only matters for adults who have already chosen a career",
      ],
      explanation: "The lesson's key inquiry question, \"Why is it important to know your talents, gifts and abilities?\", is answered by the outcome of living a purposeful, intentional life rather than leaving gifts undiscovered.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} writes 1 Peter 4:10 on a flash card for class, but a classmate says the verse is only meant for church leaders such as pastors. Is this reading of 1 Peter 4:10 correct?`,
    correct: "No — the verse says \"each of you,\" meaning every believer, including learners, has a gift meant to serve others",
    wrong: [
      "Yes — only ordained church leaders are described as receiving any gift at all",
      "Yes — the verse specifically names pastors as the only intended audience",
      "No — but only adults over a certain age are included in \"each of you\"",
    ],
    explanation: "1 Peter 4:10 opens with \"each of you,\" addressing every believer, not only church leaders — every learner has a gift meant to be used to serve others.",
  }),
  (rng) => ({
    prompt: `${name(rng)} explains to a younger sibling in ${place(rng)} why the master in the parable was angry specifically at the one-talent servant, and not simply because he ended up with less money than the others. What was the master's real complaint?`,
    correct: "The servant did nothing at all with what he was given, out of fear, rather than making any effort to use it",
    wrong: [
      "The master was angry only because the servant received the smallest number of talents",
      "The master was upset that the servant tried to trade but failed at it",
      "The master was disappointed that the servant gave the talent away to someone else",
    ],
    explanation: "Matthew 25:26 shows the master's complaint was laziness and fear, not the small size of the gift — the servant made no effort at all, unlike the other two who acted.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps saying, "I don't have any real talent," while quietly being the person everyone in the class goes to for comfort when they are sad. Based on this lesson, what might ${who} be overlooking?`,
      correct: "Comforting and caring for others is itself a real, God-given gift, even if it looks different from performance talents like singing or sport",
      wrong: [
        `${who} is right, since only performance skills such as singing or sport count as talents`,
        "Caring for others is a talent, but only if it is done in front of a large audience",
        "Talents can only be recognised by teachers, never noticed by the person themselves",
      ],
      explanation: "1 Peter 4:10's \"whatever gift\" is broad — service and caregiving abilities are genuine talents, not only performance skills, even when the person carrying them does not recognise it.",
    };
  },
];

export const myPurpose: Skill = {
  id: "g5-cre-cn-my-purpose",
  code: "CN.1",
  subjectId: "cre",
  strandId: "g5-cre-creation",
  grade: 5,
  title: "My Purpose (Talents and Abilities)",
  description: "God's purpose for every person's life, the parable of the talents (Matthew 25:14-30), and the biblical teaching in Jeremiah 29:11, James 1:17 and 1 Peter 4:10 on discovering and nurturing God-given talents, gifts and abilities.",
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
        hint: "Start with the master entrusting talents before his journey, and end with him settling accounts on his return.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const usedWell = shuffle(rng, EVENT_FACTS.filter((f) => f.result === "usedWell")).slice(0, 4);
      const buried = shuffle(rng, EVENT_FACTS.filter((f) => f.result === "buriedInFear")).slice(0, 4);
      const chosen = shuffle(rng, [...usedWell, ...buried]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.result));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "usedWell", label: "Talent used well" },
          { id: "buriedInFear", label: "Talent buried in fear" },
        ],
        correctBucket,
        hint: "Two servants traded and grew their talents; one servant hid his out of fear and did nothing with it.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.result === "usedWell" ? "talent used well" : "talent buried in fear"}.`).join(" "),
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
        hint: "Think about the parable of the talents and what Jeremiah 29:11, James 1:17 and 1 Peter 4:10 each teach.",
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
        hint: "Think about the parable of the talents and how Jeremiah 29:11, James 1:17 and 1 Peter 4:10 apply to using a gift.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "In the parable of the talents, the master gave five, two and one talents to his servants, each according to his", after: ".", answer: "ability", accepted: ["ability"] },
      { before: "The servant given five talents traded them and gained five", after: ".", answer: "more", accepted: ["more", "additional talents"] },
      { before: "The servant given one talent dug a hole and", after: "his master's money.", answer: "hid", accepted: ["hid", "buried"] },
      { before: "The master called the faithful servants \"good and", after: "servant.\"", answer: "faithful", accepted: ["faithful"] },
      { before: "Jeremiah 29:11 says God has plans to prosper us and give us hope and a", after: ".", answer: "future", accepted: ["future"] },
      { before: "James 1:17 teaches that every good and perfect gift comes down from", after: ".", answer: "God", accepted: ["god"] },
      { before: "1 Peter 4:10 teaches that each person should use their gift to", after: "others.", answer: "serve", accepted: ["serve"] },
      { before: "The parable of the talents is found in the Gospel of", after: ", chapter 25.", answer: "Matthew", accepted: ["matthew"] },
      { before: "The one-talent servant lost even his talent because he acted out of", after: "instead of faith.", answer: "fear", accepted: ["fear"] },
      { before: "Knowing your talents, gifts and abilities helps you live a", after: "life.", answer: "purposeful", accepted: ["purposeful"] },
      { before: "Nurturing a talent means giving it regular", after: "so it keeps growing.", answer: "practice", accepted: ["practice", "attention"] },
      { before: "A talent, gift or ability can be nurtured at home, school, and in", after: ".", answer: "church", accepted: ["church"] },
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
      hint: "Think about the parable of the talents, Jeremiah 29:11, James 1:17 and 1 Peter 4:10.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
