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
    "the events of the healing of the Roman officer's servant in the correct order.",
    "these events from Matthew 8:5-13 into the order they happened.",
    "these moments from the healing of the centurion's servant in order.",
    "these events the way they happened in Capernaum.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the centurion's faith or Jesus' response.",
    "these facts about the healing under the correct bucket.",
    "each fact below by which part of the miracle it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the centurion's servant with its explanation.",
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
  { id: "n1", label: "A Roman centurion comes to Jesus in Capernaum, pleading for his servant, who is paralyzed and suffering terribly" },
  { id: "n2", label: "Jesus offers to go to the centurion's house and heal the servant" },
  { id: "n3", label: "The centurion says he is not worthy to have Jesus come under his roof" },
  { id: "n4", label: "The centurion asks Jesus to simply \"say the word\" and his servant will be healed" },
  { id: "n5", label: "The centurion explains that, as a man under authority himself, he understands how a word of command works" },
  { id: "n6", label: "Jesus is amazed and says he has not found such great faith even in Israel" },
  { id: "n7", label: "Jesus tells the centurion to go, and that it will be done just as he believed" },
  { id: "n8", label: "The servant is healed at that very hour" },
];

interface EventFact { text: string; group: "faith" | "response" }
const EVENT_FACTS: EventFact[] = [
  { text: "The centurion said he was not worthy to have Jesus come under his roof", group: "faith" },
  { text: "The centurion asked Jesus to only \"say the word\" rather than come in person", group: "faith" },
  { text: "The centurion compared his authority over soldiers to Jesus' authority over sickness", group: "faith" },
  { text: "The centurion believed Jesus could heal from a distance, without even seeing the servant", group: "faith" },
  { text: "The centurion, though a Roman official, humbly approached a Jewish teacher for help", group: "faith" },
  { text: "The centurion's servant was lying at home, paralyzed and suffering terribly", group: "faith" },
  { text: "Jesus was amazed at the centurion's faith", group: "response" },
  { text: "Jesus said he had not found such great faith even in Israel", group: "response" },
  { text: "Jesus offered to go to the centurion's house himself to heal the servant", group: "response" },
  { text: "Jesus told the centurion to go, and that it would be done as he had believed", group: "response" },
  { text: "The servant was healed at that very hour, without Jesus ever entering the house", group: "response" },
  { text: "Jesus used the centurion's faith as an example for those following him to see", group: "response" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "Centurion", meaning: "A Roman army officer in charge of about 100 soldiers, who asked Jesus to heal his servant" },
  { term: "Capernaum", meaning: "The town where the Roman officer's servant was healed" },
  { term: "\"Say the word\"", meaning: "The centurion's request, showing he believed Jesus' authority alone was enough" },
  { term: "\"I am not worthy\"", meaning: "The centurion's humble description of himself before Jesus" },
  { term: "Authority", meaning: "The idea the centurion used to explain how Jesus' command could heal from a distance" },
  { term: "Paralyzed", meaning: "The condition of the centurion's servant, described as suffering terribly" },
  { term: "\"I have not found such great faith\"", meaning: "Jesus' amazed response to the centurion" },
  { term: "Remote healing", meaning: "Healing that happens without the healer being physically present, as with the servant" },
  { term: "Praying for the sick", meaning: "A modern way Christians can follow Jesus' example of caring for those who are ill" },
  { term: "Hospital chaplaincy", meaning: "A modern example of the church supporting sick people in a health facility" },
  { term: "Trusting God's power", meaning: "Believing God can act even when we cannot see it happening directly, as the centurion did" },
  { term: "Humility", meaning: "The value shown by a powerful officer approaching Jesus without demanding special treatment" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Abel", "Brenda", "Collins", "Damaris", "Erick", "Faridah", "Grace", "Hosea", "Immaculate", "Japheth", "Kanini", "Lenana"] as const;
const KENYAN_PLACES = ["Sotik", "Molo", "Marsabit", "Kangema", "Rachuonyo", "Mtwapa", "Baringo", "Kimilili", "Gatundu", "Emali", "Kabarnet", "Nyamira"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} has a sick relative in a hospital far away and prays for their healing instead of despairing, since they cannot travel there. Which Bible event does this most resemble?`,
    correct: "The healing of the Roman officer's servant, healed by Jesus' word from a distance",
    wrong: [
      "The raising of Lazarus, who Jesus visited in person",
      "The healing of the bleeding woman, which involved physical touch",
      "The temptations of Jesus in the wilderness",
    ],
    explanation: "The Roman officer's servant was healed remotely, purely by Jesus' word, without Jesus ever entering the house — matching prayer for someone far away.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked why the centurion said he was "not worthy" to have Jesus enter his house. What is the best reason?`,
    correct: "Out of humility, recognising Jesus' authority and holiness compared to himself",
    wrong: [
      "Because his house was too small and dirty for a guest",
      "Because Roman law forbade Jews from entering Roman homes",
      "Because he did not actually want Jesus to heal his servant",
    ],
    explanation: "The centurion's words reflect genuine humility before Jesus' authority, not a practical excuse or a lack of desire for healing.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} explains the centurion's comparison between his own soldiers and Jesus' power. What point was the centurion making?`,
    correct: "Just as his own word of command was obeyed instantly by soldiers, Jesus' word alone was enough to heal without being physically present",
    wrong: [
      "That Jesus needed Roman soldiers to help him perform the healing",
      "That authority only matters in the army, not in matters of faith",
      "That the centurion actually had more authority than Jesus",
    ],
    explanation: "The centurion, a man under authority himself, understood that a word of command is enough — the same logic he applied to Jesus' power to heal.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked what Jesus said made the centurion's faith so remarkable. What did Jesus say?`,
    correct: "That he had not found such great faith even among the people of Israel",
    wrong: [
      "That the centurion had performed the healing himself",
      "That the centurion had donated a large sum to the temple",
      "That the centurion was the first Roman to become a Jew",
    ],
    explanation: "Jesus marvelled that he had not found such great faith even in Israel, God's own chosen people — remarkable praise for a Roman outsider.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} believes a prayer for someone in another town has already been answered, even before hearing any news back. Which value from this miracle does this reflect?`,
    correct: "Faith and trust in God's power even without seeing it happen directly, like the centurion's faith",
    wrong: [
      "Doubt, since believing without proof is always unwise",
      "Superstition, since prayer has no real effect on outcomes",
      "Indifference to whether the prayer is actually answered",
    ],
    explanation: "The centurion's faith did not require seeing the healing happen — he simply trusted Jesus' word, a model of faith without needing visible proof.",
  }),
  (rng) => ({
    prompt: `${name(rng)} visits a sick relative and wonders what role prayer can really play alongside medical care. What does this miracle teach about praying for the sick?`,
    correct: "Prayer, offered in faith, can be a real way of bringing God's healing power into someone's situation",
    wrong: [
      "Prayer only works if the sick person is in the same room as the person praying",
      "Prayer is unnecessary once a doctor is already treating the patient",
      "Prayer should only ever be said by religious leaders, not ordinary believers",
    ],
    explanation: "This miracle shows Jesus healing purely through faith and his word, encouraging believers that prayer for the sick, offered in faith, genuinely matters.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked how far away Jesus was from the servant when the healing actually happened. What is correct?`,
    correct: "Jesus never went to the house — the servant was healed remotely, at that very hour",
    wrong: [
      "Jesus visited the house quietly without the centurion knowing",
      "Jesus sent one of his disciples to go and touch the servant instead",
      "The centurion carried the servant out to meet Jesus on the road",
    ],
    explanation: "Matthew 8:13 records that the servant was healed at that very hour, purely through Jesus' word, without Jesus entering the house at all.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} points out that the centurion was a Roman official, an outsider to the Jewish faith. Why is his strong faith especially notable?`,
    correct: "It shows that faith in Jesus was not limited only to the Jewish people, foreshadowing that his message reaches everyone",
    wrong: [
      "Because Roman officers usually refused to speak to any Jewish teacher",
      "Because Roman soldiers were forbidden from praying to any god",
      "Because it proves Jesus favoured Romans over the people of Israel",
    ],
    explanation: "A Roman centurion showing greater faith than Jesus found in Israel points forward to Jesus' message reaching beyond just the Jewish people.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked what Jesus offered to do first, before the centurion asked him to just say the word. What was it?`,
    correct: "Jesus offered to personally go to the centurion's house to heal the servant",
    wrong: [
      "Jesus initially refused to help until convinced by others",
      "Jesus asked the centurion to bring the servant to him instead",
      "Jesus immediately sent the centurion away without a response",
    ],
    explanation: "Matthew 8:7 records Jesus offering to go and heal the servant in person, before the centurion's reply revealed his remarkable faith.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} has a loved one who is sick far away and cannot be visited immediately. Inspired by this miracle, what should they do?`,
    correct: "Pray in faith for their healing and trust God's power, even without being physically present",
    wrong: [
      "Wait until they can travel there in person before doing anything to help",
      "Assume nothing can be done unless a pastor is physically present",
      "Give up hope, since only Jesus himself could heal in Bible times",
    ],
    explanation: "The centurion's faith, and the servant's remote healing, teach that distance is no barrier to God's power when approached in genuine faith and prayer.",
  }),
];

export const healingOfTheRomanOfficersServant: Skill = {
  id: "g6-cre-jc-healing-of-the-roman-officers-servant",
  code: "JC.3",
  subjectId: "cre",
  strandId: "g6-cre-jesus",
  grade: 6,
  title: "Miracles of Jesus Christ — The Roman Officer's Servant",
  description: "The healing of the Roman centurion's servant (Matthew 8:5-13), the centurion's remarkable faith and understanding of authority, and lessons about praying for the sick.",
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
        hint: "Start with the centurion pleading for his servant, and end with the servant healed at that very hour.",
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
          { id: "faith", label: "The centurion's faith" },
          { id: "response", label: "Jesus' response" },
        ],
        correctBucket,
        hint: "The centurion's faith includes his words and beliefs; Jesus' response includes his amazement and the healing itself.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "faith" ? "the centurion's faith" : "Jesus' response"}.`).join(" "),
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
        hint: "Think about the centurion's words, his understanding of authority, and Jesus' reaction to his faith.",
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
        hint: "Think about the centurion's humility, his understanding of authority, and how the miracle happened remotely.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "A Roman", after: "came to Jesus in Capernaum asking him to heal his servant.", answer: "centurion", accepted: ["centurion"] },
      { before: "The centurion's servant was", after: "and suffering terribly at home.", answer: "paralyzed", accepted: ["paralyzed", "paralysed"] },
      { before: "The centurion told Jesus he was not", after: "to have him come under his roof.", answer: "worthy", accepted: ["worthy"] },
      { before: "Instead of asking Jesus to come in person, the centurion asked him to just say the", after: ".", answer: "word", accepted: ["word"] },
      { before: "The centurion compared his own authority over soldiers to Jesus'", after: "over sickness.", answer: "authority", accepted: ["authority"] },
      { before: "Jesus was", after: "at the centurion's great faith.", answer: "amazed", accepted: ["amazed", "astonished"] },
      { before: "Jesus said he had not found such great faith even in", after: ".", answer: "Israel", accepted: ["israel"] },
      { before: "Jesus told the centurion to go, and that it would be done just as he had", after: ".", answer: "believed", accepted: ["believed"] },
      { before: "The servant was healed at that very", after: ", without Jesus entering the house.", answer: "hour", accepted: ["hour"] },
      { before: "This miracle is recorded in the Gospel of", after: ", chapter 8.", answer: "Matthew", accepted: ["matthew"] },
      { before: "Because Jesus healed the servant without seeing him, the miracle is described as a", after: "healing.", answer: "remote", accepted: ["remote", "distance"] },
      { before: "Following Jesus' example, Christians today are encouraged to pray for the", after: ".", answer: "sick", accepted: ["sick"] },
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
      hint: "Think about the centurion's faith, his understanding of authority, and how Jesus healed his servant.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
