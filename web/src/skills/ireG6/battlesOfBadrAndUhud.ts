import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// The Badr-then-Uhud narrative is standard, well-established Islamic history taught in every
// Islamic Studies curriculum: a clear chronological sequence of cause and consequence (Badr's
// against-the-odds victory, then Uhud's discipline-broken setback a year later), not an invented
// order — this justifies the "ordering" branch below.

const ORDER_PROMPTS = [
  "Arrange the events of the battles of Badr and Uhud in the order they happened.",
  "Put these events of the battles of Badr and Uhud into the correct order.",
  "Sequence these events from Badr and Uhud correctly, from first to last.",
  "Order these events as they actually happened at Badr and then Uhud.",
  "Sort these events into the order they occurred.",
  "Arrange these moments from the battles of Badr and Uhud in the order they took place.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each statement by whether it is about Badr, Uhud, or the lessons learnt from both.",
  "Group each statement under Badr, Uhud, or the lessons the battles teach.",
  "Decide whether each statement is about Badr, Uhud, or the lessons learnt, and sort it there.",
  "Sort each fact into the correct category: Badr, Uhud, or lessons learnt.",
  "Place each statement under the part of this history it describes.",
  "Read each statement and sort it under Badr, Uhud, or the lessons learnt from both.",
];

const MATCH_PROMPTS = [
  "Match each term from the battles of Badr and Uhud to its meaning.",
  "Pair each term below with its meaning.",
  "Connect each term below to what it means.",
  "Match each term to its correct meaning.",
  "Link each term from Badr and Uhud to the definition that fits it.",
  "Choose the correct meaning for each term from this history.",
];

const FILL_BLANK_PROMPTS = [
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
  "Which word belongs in the blank?",
];

const BATTLE_SEQUENCE = [
  { id: "prepare", label: "Quraysh and Muslims prepare to meet at Badr" },
  { id: "trust", label: "Muslims, though far fewer, trust in Allah's help" },
  { id: "badr-victory", label: "Muslims win a decisive victory at Badr" },
  { id: "uhud-meet", label: "A year later, Muslims meet the Quraysh again at Uhud" },
  { id: "early-advantage", label: "Muslims gain an early advantage in the battle" },
  { id: "archers-leave", label: "Archers leave their assigned position on the hill to collect spoils" },
  { id: "cavalry-outflank", label: "Makkan cavalry outflanks the Muslim forces" },
  { id: "setback", label: "The battle turns into a serious setback for the Muslims" },
];

interface TopicFact {
  text: string;
  topic: "badr" | "uhud" | "lessons";
}
const TOPIC_LABEL: Record<TopicFact["topic"], string> = {
  badr: "About the Battle of Badr",
  uhud: "About the Battle of Uhud",
  lessons: "Lessons learnt from both battles",
};
const TOPIC_FACTS: TopicFact[] = [
  { text: "The Battle of Badr, in 624 CE (2 AH), was the first major battle between the Muslims of Madinah and the Quraysh of Makkah", topic: "badr" },
  { text: "The Muslim force at Badr is traditionally said to have numbered around 313, poorly equipped compared to the Quraysh", topic: "badr" },
  { text: "The Quraysh force at Badr was much larger, numbering around 1,000", topic: "badr" },
  { text: "Despite being greatly outnumbered, the Muslims won a decisive victory at Badr", topic: "badr" },
  { text: "The Battle of Uhud took place a year after Badr, in 625 CE (3 AH)", topic: "uhud" },
  { text: "Early in the Battle of Uhud, the Muslims had the advantage", topic: "uhud" },
  { text: "A group of archers stationed on a hill were instructed to hold their position no matter what happened", topic: "uhud" },
  { text: "Believing the battle was already won, the archers left their position to gather war spoils", topic: "uhud" },
  { text: "The Makkan cavalry took advantage of the undefended hill and outflanked the Muslim forces, turning apparent victory into a serious setback", topic: "uhud" },
  { text: "Badr shows that true victory comes from Allah's help and the believers' reliance on Him, not merely from numbers or equipment", topic: "lessons" },
  { text: "Uhud shows the serious consequences of disobeying clear instructions and being distracted by worldly gain at a critical moment", topic: "lessons" },
  { text: "Both battles teach that facing hardship and setbacks with patience and continued reliance on Allah is part of a believer's test", topic: "lessons" },
];

const TERM_MEANINGS: { term: string; meaning: string }[] = [
  { term: "Badr", meaning: "The place near Madinah where the first major battle between the Muslims and the Quraysh took place, in 624 CE" },
  { term: "Uhud", meaning: "The place near Madinah where the second major battle took place, a year after Badr" },
  { term: "The 313", meaning: "The traditional number of the small, poorly-equipped Muslim force at the Battle of Badr" },
  { term: "The Quraysh", meaning: "The tribe of Makkah that fought against the early Muslims at both Badr and Uhud" },
  { term: "The archers at Uhud", meaning: "The group stationed on a hill who were instructed to hold their position no matter what happened" },
  { term: "War spoils", meaning: "The goods left behind by a retreating army, which distracted the archers from their post at Uhud" },
  { term: "Makkan cavalry", meaning: "The mounted force that outflanked the Muslims at Uhud once the archers' hill was left undefended" },
  { term: "Allah's help", meaning: "What the Qur'an credits for the Muslims' victory at Badr, not numbers or equipment" },
  { term: "2 AH", meaning: "The Islamic calendar year in which the Battle of Badr took place" },
  { term: "3 AH", meaning: "The Islamic calendar year in which the Battle of Uhud took place" },
];

const KENYAN_NAMES = ["Amina", "Yusuf", "Halima", "Ibrahim", "Zainab", "Hassan", "Fatuma", "Omar", "Khadija", "Ridhwan", "Mariam", "Suleiman"] as const;
const KENYAN_PLACES = ["Mombasa", "Garissa", "Malindi", "Lamu", "Wajir", "Isiolo", "Nairobi", "Kwale", "Eastleigh", "Marsabit", "Mandera", "Kisumu"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `${name(rng)}, a Grade 6 learner in ${place(rng)}, is part of a small quiz team facing a much larger, better-prepared team in a competition. Recalling the lesson of the Battle of Badr, what should the team believe about their chances?`,
    correct: "That trusting in Allah's help and giving their sincere best effort matters more than simply having fewer members than the other team",
    wrong: [
      "That a smaller team can never succeed no matter how well prepared they are",
      "That team size is the only factor that decides who wins a competition",
      "That there is no point preparing seriously, since the outcome depends on luck alone",
    ],
    explanation: "At Badr, a small, poorly-equipped Muslim force still won decisively — the Qur'an credits Allah's help, not numbers or equipment, teaching that effort and reliance on Allah matter regardless of size.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is assigned to watch the school gate during a fundraising event in ${place(rng)} and told firmly to stay there until closing time, no matter what happens elsewhere. Midway through, exciting music starts in the school hall, tempting ${who} to leave the gate unattended. Applying the lesson of the archers at Uhud, what should ${who} do?`,
      correct: "Stay at the assigned post exactly as instructed, since leaving it — even for something exciting — can create a serious problem",
      wrong: [
        "Leave briefly since the event already seems to be going well",
        "Leave the post because the entertainment is more rewarding at that moment",
        "Ask an unauthorised friend to secretly take over, so no one notices the gate is unattended",
      ],
      explanation: "The archers at Uhud left a critical post after being told to hold it no matter what happened, and that single decision turned an advantage into a setback — the same discipline applies to any assigned duty.",
    };
  },
  (rng) => ({
    prompt: `During a class cleanup exercise in ${place(rng)}, ${name(rng)} is assigned to clear litter near the school gate while classmates elsewhere are praised for filling bags fastest. Seeing others already being celebrated, ${name(rng)} considers abandoning the gate area to join the more visible group. What does the lesson of Uhud suggest?`,
    correct: "Complete the assigned task fully, since leaving an assigned duty for a more rewarding-looking opportunity can cause real harm",
    wrong: [
      "Join the more visible group immediately, since recognition matters more than the original task",
      "Abandon the gate area since the cleanup already looks mostly finished",
      "Ask someone to falsely report the gate area as done, so the learner can join the other group",
    ],
    explanation: "Just as the archers left their post believing the battle was already won, abandoning an assigned task before it is truly finished — chasing something more rewarding-looking — is exactly the mistake Uhud warns against.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family runs a small shop in ${place(rng)} with far fewer resources than a large new shop nearby. Recalling how the outnumbered Muslims triumphed at Badr through reliance on Allah and sincere effort, what attitude should the family have?`,
      correct: "Continue working with sincerity, patience, and trust in Allah, rather than assuming success only comes from having more resources",
      wrong: [
        "Close the shop immediately, since success is impossible without more resources than competitors",
        "Copy every decision of the larger shop exactly, since size alone guarantees success",
        "Stop making any effort at all and wait for the outcome to be decided by chance",
      ],
      explanation: "Badr shows that having fewer resources does not decide the outcome — sincere effort and reliance on Allah's help do, which is exactly the attitude a smaller business should hold onto.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s debate team is clearly leading a school competition in ${place(rng)} with one round left. Some teammates suggest relaxing their preparation since victory already looks certain. Applying the lesson of Uhud, what is the wisest response?`,
    correct: "Stay disciplined and fully prepared until the very end, since relaxing too soon — as happened at Uhud — can turn an apparent win into a loss",
    wrong: [
      "Agree to relax, since a clear lead in a competition can never be reversed",
      "Stop preparing altogether, since the outcome no longer depends on effort",
      "Let only the weakest teammates handle the final round, since it no longer matters",
    ],
    explanation: "At Uhud, an early advantage was lost precisely because discipline was relaxed too soon — the same risk applies to relaxing preparation before a competition is truly over.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A teacher in ${place(rng)} instructs ${who}'s group to keep stirring a science experiment continuously until told to stop, warning that stopping early will spoil the results. Partway through, the mixture looks finished, so some members want to stop early. Applying the lesson of the archers at Uhud, what should the group do?`,
      correct: "Continue following the clear instruction exactly as given, since something looking finished is not the same as being told to stop",
      wrong: [
        "Stop immediately once the mixture looks ready, regardless of the instruction given",
        "Let each member decide individually whether the instruction still applies",
        "Assume instructions given at the start of an activity stop mattering once the activity looks complete",
      ],
      explanation: "The archers at Uhud judged for themselves that the battle looked won and left their post — the very mistake this scenario mirrors; a clear instruction should be followed until it is actually lifted.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} works hard on a school project in ${place(rng)}, but a setback beyond their control results in a lower grade than expected. Drawing on the lessons of Badr and Uhud together, what is the appropriate response?`,
    correct: "Respond with patience, learn from what went wrong, and continue relying on Allah rather than giving up entirely",
    wrong: [
      "Give up on the subject completely, since one setback proves further effort is pointless",
      "Blame only bad luck and refuse to reflect on what could be improved",
      "Assume the setback means Allah's help is no longer available at all",
    ],
    explanation: "Badr and Uhud together teach that both victory and setback are part of a believer's test — the right response to hardship is patience, reflection, and continued reliance on Allah, not despair.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s school football team, with barely enough players to fill the pitch, is drawn against a school with a much larger, deeper squad in ${place(rng)}. Recalling the outcome at Badr, what best reflects the correct attitude before the match?`,
      correct: "Prepare sincerely, trust in Allah's help, and understand that a larger squad does not guarantee the outcome",
      wrong: [
        "Forfeit the match immediately, since a smaller squad cannot possibly compete",
        "Assume the bigger squad's size alone decides the result before the match is even played",
        "Refuse to train seriously, since the outcome is already determined by team size",
      ],
      explanation: "Badr's outnumbered Muslim force still won decisively, showing that a larger opposing force does not by itself decide the outcome — sincere preparation and trust in Allah matter too.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `At a school harambee in ${place(rng)}, ${who} is stationed to record donations at a table and told not to leave until the event officially closes. Midway through, a nearby stall starts giving out free snacks and other students rush over. Applying the lesson of the archers leaving their post for war spoils at Uhud, what should ${who} do?`,
      correct: "Remain at the table recording donations as instructed, resisting the pull of the tempting distraction nearby",
      wrong: [
        "Leave the table for the snacks, since a short absence surely will not matter",
        "Leave the table permanently once the crowd near the snack stall grows larger",
        "Ask to be excused from the duty altogether because something more appealing appeared",
      ],
      explanation: "The archers at Uhud were drawn away from a critical post by the pull of spoils — resisting a similar tempting distraction while on duty is precisely the lesson this history teaches.",
    };
  },
];

export const battlesOfBadrAndUhud: Skill = {
  id: "g6-ire-hi-badr-and-uhud",
  code: "HI.1",
  subjectId: "ire",
  strandId: "g6-ire-history",
  grade: 6,
  title: "The Battles of Badr and Uhud",
  description: "The Battle of Badr (624 CE/2 AH) and the Battle of Uhud (625 CE/3 AH): their causes, sequence of events, and the lessons Muslims learn from both.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "reasoning", "fill-blank"] as const);

    if (branch === "order") {
      const items = shuffle(rng, BATTLE_SEQUENCE);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order, from the preparations at Badr to the setback at Uhud.",
        items,
        correctOrder: BATTLE_SEQUENCE.map((s) => s.id),
        hint: "Badr comes first and ends in a decisive Muslim victory; Uhud follows a year later and ends in a setback caused by the archers leaving their post.",
        explanation: BATTLE_SEQUENCE.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const badr = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "badr")).slice(0, 3);
      const uhud = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "uhud")).slice(0, 3);
      const lessons = shuffle(rng, TOPIC_FACTS.filter((f) => f.topic === "lessons")).slice(0, 3);
      const chosen = shuffle(rng, [...badr, ...uhud, ...lessons]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.topic));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: (["badr", "uhud", "lessons"] as const).map((t) => ({ id: t, label: TOPIC_LABEL[t] })),
        correctBucket,
        hint: "Some statements are about what happened at Badr, some about what happened at Uhud, and some are the lessons drawn from both.",
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
        hint: "Think about who or what each term refers to in the accounts of Badr and Uhud.",
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
        hint: "Think about which lesson from Badr or Uhud the situation is actually applying.",
        explanation: q.explanation,
      };
    }

    const facts = [
      { before: "The Battle of Badr took place in the Islamic year", after: "AH (624 CE).", answer: "2", accepted: ["2", "two", "2 ah"] },
      { before: "The Muslim force at Badr is traditionally said to have numbered around", after: "fighters.", answer: "313", accepted: ["313"] },
      { before: "The tribe that fought against the Muslims at both Badr and Uhud was the", after: ".", answer: "Quraysh", accepted: ["quraysh"] },
      { before: "At Badr, despite being far fewer in number, the Muslims won a", after: "victory.", answer: "decisive", accepted: ["decisive"] },
      { before: "The Battle of Uhud took place", after: "after the Battle of Badr.", answer: "a year", accepted: ["a year", "one year", "1 year"] },
      { before: "At Uhud, a group of", after: "were stationed on a hill to guard the Muslim position.", answer: "archers", accepted: ["archers"] },
      { before: "The archers were instructed to hold their position no matter what", after: ".", answer: "happened", accepted: ["happened"] },
      { before: "Believing the battle was already won, the archers left their post to gather", after: ".", answer: "spoils", accepted: ["spoils", "war spoils"] },
      { before: "Once the hill was left undefended, the Makkan", after: "outflanked the Muslim forces.", answer: "cavalry", accepted: ["cavalry"] },
      { before: "What began as a Muslim advantage at Uhud turned into a serious", after: "for the Muslims.", answer: "setback", accepted: ["setback"] },
      { before: "The Qur'an teaches that victory at Badr came from Allah's help, not merely from", after: "or equipment.", answer: "numbers", accepted: ["numbers"] },
      { before: "Both battles teach believers to face hardship with patience and continued reliance on", after: ".", answer: "Allah", accepted: ["allah"] },
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
      hint: "Recall the sequence of events at Badr and at Uhud, and the lessons drawn from both.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
