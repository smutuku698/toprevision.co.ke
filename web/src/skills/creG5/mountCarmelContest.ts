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
    "the events of the Mount Carmel contest in the correct order.",
    "these events from 1 Kings 18:22-39 into the order they happened.",
    "these moments from Elijah's contest with the prophets of Baal in order.",
    "these events the way they happened on Mount Carmel.",
  ],
);

const CATEGORIZE_PROMPTS = composePrompts(
  ["Sort", "Group", "Classify", "Arrange", "Place"],
  [
    "each statement by whether it is about the prophets of Baal or about Elijah and the true God.",
    "these facts about the Mount Carmel contest under the correct bucket.",
    "each fact below by which part of the contest it describes.",
    "each statement into the bucket it belongs to.",
  ],
);

const MATCH_PROMPTS = composePrompts(
  ["Match", "Pair", "Connect", "Link", "Match up"],
  [
    "each term or phrase below with its correct meaning.",
    "each idea about the Mount Carmel contest with its explanation.",
    "each term to the description that fits it.",
    "each term or phrase to the statement that explains it.",
  ],
);

const FILL_PROMPTS = composePrompts(
  ["Fill in", "Complete", "Work out", "Type in", "Read the sentence and fill in"],
  [
    "the missing word below.",
    "the blank with the correct word.",
    "the word that finishes this fact about Mount Carmel.",
    "the correct missing word.",
  ],
);

const NARRATIVE_SEQUENCE = [
  { id: "n1", label: "Elijah proposes a contest: two bulls prepared as offerings, but no fire lit — whichever god answers by fire is the true God" },
  { id: "n2", label: "The prophets of Baal prepare their bull and call on Baal from morning until noon, but there is no answer" },
  { id: "n3", label: "Elijah mocks them, suggesting maybe Baal is deep in thought, busy, travelling or sleeping" },
  { id: "n4", label: "The prophets of Baal shout louder and cut themselves, but still there is no answer, no voice, no one paying attention" },
  { id: "n5", label: "Elijah repairs the altar of the Lord, using twelve stones for the twelve tribes of Israel" },
  { id: "n6", label: "Elijah digs a trench around the altar and arranges the wood and the cut-up bull on it" },
  { id: "n7", label: "Elijah has water poured on the offering and wood three times, until the water fills the trench" },
  { id: "n8", label: "Elijah prays to the Lord to show the people that He is God" },
  { id: "n9", label: "Fire falls from heaven and consumes the sacrifice, the wood, the stones, the soil, and even licks up the water in the trench" },
  { id: "n10", label: "The people fall prostrate and cry out, \"The Lord—he is God! The Lord—he is God!\"" },
];

interface EventFact { text: string; group: "baal" | "elijah" }
const EVENT_FACTS: EventFact[] = [
  { text: "The prophets of Baal called on their god from morning until noon with no answer", group: "baal" },
  { text: "The prophets of Baal shouted louder and cut themselves, but there was still no response", group: "baal" },
  { text: "There was no voice, no one answered, and no one paid attention to Baal's prophets", group: "baal" },
  { text: "Elijah mocked the prophets of Baal, suggesting their god might be sleeping or busy", group: "baal" },
  { text: "Elijah repaired the altar of the Lord using twelve stones for the twelve tribes of Israel", group: "elijah" },
  { text: "Elijah dug a trench around the altar before the offering was placed on it", group: "elijah" },
  { text: "Elijah had water poured on the offering three times until it filled the trench", group: "elijah" },
  { text: "Elijah prayed simply, asking the Lord to show the people that He is God", group: "elijah" },
  { text: "Fire fell from heaven and consumed the sacrifice, the wood, the stones and even the water", group: "elijah" },
  { text: "The people fell prostrate and declared that the Lord is God", group: "elijah" },
  { text: "The contest was designed so that the god who answered by fire would be proven the true God", group: "elijah" },
  { text: "Elijah stood as the only prophet of the Lord facing 450 prophets of Baal", group: "elijah" },
];

const TERMS: { term: string; meaning: string }[] = [
  { term: "1 Kings 18:22-39", meaning: "The Bible passage recording the contest between Elijah and the prophets of Baal" },
  { term: "Mount Carmel", meaning: "The natural feature where the contest between the true God and false gods took place" },
  { term: "Prophets of Baal", meaning: "The 450 prophets who called on a false god and received no answer at all" },
  { term: "False gods", meaning: "Idols like Baal that cannot see, hear, or act, unlike the one true God" },
  { term: "Twelve stones", meaning: "What Elijah used to repair the altar, representing the twelve tribes of Israel" },
  { term: "Trench", meaning: "What Elijah dug around the altar, which later filled with the poured water" },
  { term: "Fire from heaven", meaning: "The sign God sent to prove He alone is the true God" },
  { term: "\"The Lord—he is God!\"", meaning: "What the people cried out after witnessing the fire fall on Elijah's altar" },
  { term: "Idol worship", meaning: "Worshipping false gods or objects instead of the one true God, which this story warns against" },
  { term: "Radicalised groups", meaning: "Modern groups promoting extreme or ungodly beliefs, similar to the false worship this story warns against avoiding" },
  { term: "Elijah", meaning: "The prophet of the Lord who defended the worship of the true God at Mount Carmel" },
  { term: "True worship", meaning: "Honouring the one real God, shown in this story through Elijah's simple prayer and God's powerful answer" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Kiplimo", "Nyaboke", "Otienoh", "Wairimu", "Sang", "Achieng", "Mutuku", "Chebet", "Wafula", "Njuguna", "Amondi", "Kimutai"] as const;
const KENYAN_PLACES = ["Iten", "Kapenguria", "Rongai", "Kakuma", "Voi", "Ugunja", "Kabarnet", "Litein", "Muranga", "Kilifi", "Marsabit", "Kimilili"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is invited by classmates to join a group that promises good luck through charms and rituals unrelated to God. What does the Mount Carmel contest teach ${name(rng)} about such offers?`,
    correct: "True power and help come from the one true God, not from false objects or rituals that cannot truly act, as the prophets of Baal discovered",
    wrong: [
      "Any group offering good luck should be trusted, since it cannot hurt to try",
      "The Mount Carmel story has no lesson relevant to avoiding false practices today",
      "Joining such groups is fine as long as it is kept secret from family",
    ],
    explanation: "The prophets of Baal called on their god for hours and received nothing, while the Lord answered Elijah immediately — showing that only the true God has real power.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} watches classmates get louder and more dramatic trying to convince a teacher of something untrue. What does the behaviour of Baal's prophets suggest about loudness and truth?`,
      correct: "Being loud or dramatic does not make something true — the prophets of Baal shouted and hurt themselves, yet nothing happened because Baal was not real",
      wrong: [
        "The loudest argument in any situation is always the correct one",
        "This story teaches that shouting always brings good results",
        "The behaviour of Baal's prophets has no connection to honesty",
      ],
      explanation: "Despite shouting and even harming themselves, the prophets of Baal received no answer — a reminder that volume and drama do not establish truth.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} reads that Elijah poured water on his offering three times before praying. Why might Elijah have done this before God answered by fire?`,
    correct: "To remove any doubt that the fire came from a trick or a hidden spark — the drenched offering made God's answer unmistakably powerful",
    wrong: [
      "Elijah was simply trying to put out any small existing fire",
      "The water was meant to make the sacrifice heavier for the ceremony",
      "Pouring water had no purpose and was only a random detail",
    ],
    explanation: "Soaking the offering and filling the trench with water removed any possibility of a hidden trick, making God's fire an unmistakable, powerful sign.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} notices Elijah prayed a short, simple prayer compared to the prophets of Baal's hours of shouting. What does this contrast teach about prayer?`,
      correct: "A sincere, simple prayer to the true God is more powerful than loud, desperate calling on something that cannot answer",
      wrong: [
        "Longer prayers always work better than shorter ones",
        "Elijah's short prayer proves prayer itself has no real effect",
        "Volume, not sincerity, is what matters most in prayer",
      ],
      explanation: "Elijah's brief, sincere prayer was immediately answered by fire, while hours of the prophets' loud calling on Baal produced nothing at all.",
    };
  },
  (rng) => ({
    prompt: `A group of learners in ${place(rng)}, led by ${name(rng)}, debates whether it matters which god or belief a person follows, as long as they are sincere. How does Mount Carmel address this debate?`,
    correct: "The story shows sincerity alone is not enough — the object of worship matters, since only the true God could answer by fire",
    wrong: [
      "The story teaches that sincerity alone always guarantees a real answer",
      "Mount Carmel proves that every god or belief is equally true",
      "This story has no relevance to questions about sincerity in belief",
    ],
    explanation: "The prophets of Baal were passionately sincere yet received no answer — the contest demonstrates that the true God, not sincerity alone, is what matters.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} asks why Elijah used exactly twelve stones to repair the altar. What did the twelve stones represent?`,
      correct: "The twelve tribes of Israel, showing the altar was for the God of the whole nation, not just one group",
      wrong: [
        "The twelve stones represented the twelve prophets of Baal",
        "The number twelve had no particular meaning in the story",
        "The stones represented twelve different false gods being rejected",
      ],
      explanation: "Elijah's use of twelve stones for the twelve tribes of Israel emphasised that the altar honoured the one true God of the whole nation.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} believes that after seeing the fire fall, the people who cried "The Lord—he is God!" would never again be tempted by false worship. Does the wider Bible pattern support this idea?`,
    correct: "No — even after seeing powerful proof, people can still drift back toward wrong beliefs, which is why ongoing faithfulness and guarding against idol worship still matters",
    wrong: [
      "Yes — witnessing one miracle permanently guarantees lifelong faithfulness",
      "Yes — the people of Israel never worshipped a false god again after this event",
      "No — but only prophets, never ordinary people, can ever be tempted again",
    ],
    explanation: "This lesson specifically calls for learners to keep avoiding idol worship, cults and radicalised groups today — proof alone does not remove the ongoing need for faithfulness.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wants to know why Elijah proposed a fair contest instead of simply declaring the prophets of Baal wrong. What did the contest's design accomplish?`,
    correct: "It let the people see clear, undeniable evidence for themselves about which God truly has power, rather than only hearing a claim",
    wrong: [
      "The contest was designed to be unfair in Elijah's favour from the start",
      "Elijah proposed the contest simply to waste the prophets of Baal's time",
      "The contest's design had no real purpose in the story",
    ],
    explanation: "By setting a fair test — an offering with no fire, then calling on each god — Elijah let the people witness clear evidence rather than simply asserting a claim.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is pressured to try a fortune-telling app that claims to predict the future using hidden powers. Based on this lesson, what is the wisest response?`,
      correct: "Avoid it and trust in the one true God instead, following the lesson's teaching against idol worship, cults and false practices",
      wrong: [
        "Try it just once, since it is only a phone app and seems harmless",
        "This lesson has nothing relevant to say about modern fortune-telling apps",
        "Encourage friends to try it too, since group participation makes it safer",
      ],
      explanation: "This lesson explicitly teaches listing modern false religions, cults and practices and how to avoid being lured into them, which includes fortune-telling and similar practices.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} asks why the fire from heaven is described as consuming not only the sacrifice and wood but also the stones, the soil, and the water in the trench. What does this detail emphasise?`,
    correct: "The completeness and overwhelming power of God's answer, leaving absolutely no doubt about who the true God is",
    wrong: [
      "The detail is an exaggeration added later and carries no real meaning",
      "It shows the fire was actually weak and barely noticeable",
      "It shows the stones and soil were flammable materials, unrelated to God's power",
    ],
    explanation: "The fire consuming everything — even the stones, soil and water — emphasises the total, unmistakable power of God's answer to Elijah's prayer.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} says standing alone for what is right, like Elijah did against 450 prophets, is too difficult for a young person. How does this lesson respond to that concern?`,
      correct: "The lesson encourages learners to emulate Elijah's courage in worshipping the true God, showing that standing firm, even when outnumbered, is possible with faith",
      wrong: [
        "The lesson agrees that standing alone for what is right is impossible",
        "Elijah's example only applies to adults with religious authority",
        "This lesson discourages learners from ever taking a firm stand on anything",
      ],
      explanation: "The lesson's outcome is for learners to emulate prophet Elijah by worshipping the true God — modeling that courage and faith can help anyone stand firm, even outnumbered.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} wonders whether this ancient contest on a Kenyan-relevant mountain still has meaning for choosing what to believe today. What is the lesson's continuing relevance?`,
    correct: "The core lesson — distinguishing the true God from false gods and idols, and avoiding being lured into ungodly practices — remains directly relevant today",
    wrong: [
      "The lesson only applied to people living in ancient Israel",
      "The story is only about geography and has no spiritual lesson",
      "The contest's outcome has no bearing on modern choices about belief",
    ],
    explanation: "The lesson's own outcomes call for distinguishing true and false gods and avoiding modern idol worship, cults and radicalised groups — a directly present-day application.",
  }),
];

export const mountCarmelContest: Skill = {
  id: "g5-cre-bi-mount-carmel",
  code: "BI.6",
  subjectId: "cre",
  strandId: "g5-cre-bible",
  grade: 5,
  title: "Mount Carmel Contest",
  description: "Elijah's contest with the prophets of Baal on Mount Carmel (1 Kings 18:22-39), showing God's power by fire, distinguishing true and false gods, and avoiding idol worship and ungodly groups today.",
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
        hint: "Start with the contest being proposed, and end with the people declaring the Lord is God.",
        explanation: NARRATIVE_SEQUENCE.map((n) => n.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const baal = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "baal")).slice(0, 4);
      const elijah = shuffle(rng, EVENT_FACTS.filter((f) => f.group === "elijah")).slice(0, 4);
      const chosen = shuffle(rng, [...baal, ...elijah]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.group));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "baal", label: "The prophets of Baal" },
          { id: "elijah", label: "Elijah and the true God" },
        ],
        correctBucket,
        hint: "The Baal bucket ends in silence and no answer; the Elijah bucket ends in fire and a clear answer.",
        explanation: chosen.map((f) => `"${f.text}" — ${f.group === "baal" ? "the prophets of Baal" : "Elijah and the true God"}.`).join(" "),
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
        hint: "Think about how Elijah prepared his altar and what happened when he prayed.",
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
        hint: "Think about how the prophets of Baal's calling failed, and how God answered Elijah with fire.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The contest at Mount Carmel was between Elijah and the prophets of", after: ".", answer: "Baal", accepted: ["baal"] },
      { before: "The prophets of Baal called on their god from morning until", after: "with no answer.", answer: "noon", accepted: ["noon"] },
      { before: "Elijah repaired the altar of the Lord using twelve", after: ".", answer: "stones", accepted: ["stones"] },
      { before: "Elijah dug a", after: "around the altar.", answer: "trench", accepted: ["trench"] },
      { before: "Water was poured on the offering three times until it filled the", after: ".", answer: "trench", accepted: ["trench"] },
      { before: "Fire fell from", after: "and consumed the sacrifice.", answer: "heaven", accepted: ["heaven"] },
      { before: "After the fire fell, the people cried, \"The Lord—he is", after: "!\"", answer: "God", accepted: ["god"] },
      { before: "This story teaches Christians to distinguish between true and", after: "gods.", answer: "false", accepted: ["false"] },
      { before: "Elijah's example teaches learners to avoid idol worship and ungodly", after: ".", answer: "groups", accepted: ["groups"] },
      { before: "The twelve stones represented the twelve tribes of", after: ".", answer: "Israel", accepted: ["israel"] },
      { before: "This story is found in 1 Kings", after: ":22-39.", answer: "18", accepted: ["18", "eighteen"] },
      { before: "This lesson's key inquiry question asks how God's power was", after: "in this story.", answer: "demonstrated", accepted: ["demonstrated"] },
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
      hint: "Think about 1 Kings 18:22-39 and how God answered Elijah's prayer with fire from heaven.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
