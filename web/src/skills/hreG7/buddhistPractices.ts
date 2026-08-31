import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, neighbour, place, type ScenarioMC } from "./shared";

// KICD Grade 7 HRE, Strand 4.0 → Sub-strand 4.1 "Buddhist Practices" (15 lessons).
// All SEVEN practices the design lists are implemented: Buddha Vandana, Tisarana, Panchasila, Puja,
// Samatha (the design spells it "Samantha"), Vipassana, and Metta meditation with sharing of merits.
//
// The Core Competencies box names "Self-efficacy and Critical thinking", so per RIGOR-STANDARDS.md
// an Analyze/Evaluate-tier branch is REQUIRED here — see EVALUATE_TEMPLATES below.
//
// Content sensitivity: the third precept (kamesu micchacara) is rendered for Grade 7 as "wrong
// conduct in relationships", the phrasing used in school-level teaching, rather than in adult terms.
// Offerings are described as reminders and marks of respect — Buddhist teaching does not hold that
// the Buddha consumes them — because misdescribing that is the most common error learners meet.
//
// Visual scope: declined — see curriculum-reference/grade-7/hindu-religious-education.json →
// visualCoverageDecision.

const PRACTICE_ORDER_PROMPTS = [
  "Arrange the Buddhist daily scheduled practices in the order the Grade 7 design sets them out.",
  "Put these Buddhist daily practices into the order the design lists them.",
  "Sequence the seven daily scheduled practices as the design sets them out.",
  "Order these Buddhist practices as they are followed each day.",
  "Sort these daily practices into the sequence the design gives them.",
  "Arrange these Buddhist observances in the order they are carried out.",
];

const PRECEPT_ORDER_PROMPTS = [
  "Arrange the five precepts of the Panchasila in their usual order.",
  "Put the five precepts of the Panchasila into their usual order.",
  "Sequence the five precepts as they are traditionally listed.",
  "Order these five precepts from the first to the fifth.",
  "Sort these Panchasila precepts into their traditional order.",
  "Arrange the five training rules in the order they are usually recited.",
];

const PURPOSE_MATCH_PROMPTS = [
  "Match each Buddhist practice to what it actually does.",
  "Pair each practice with what it involves.",
  "Connect each Buddhist practice to its purpose.",
  "Link each practice below to what it actually does.",
  "Match each practice to its correct purpose.",
  "Choose the correct purpose for each Buddhist practice.",
];

const GEM_MATCH_PROMPTS = [
  "In Tisarana, refuge is taken in the Triple Gem. Match each of the three to what it refers to.",
  "In Tisarana, refuge is taken in the Triple Gem. Pair each of the three with what it refers to.",
  "Match each part of the Triple Gem to what it refers to.",
  "Connect each of the three refuges to its meaning.",
  "Link each element of the Triple Gem to what it stands for.",
  "Choose the correct meaning for each part of the Triple Gem.",
];

const FACT_SORT_PROMPTS = [
  "Sort each description under the Buddhist practice it belongs to.",
  "Group these descriptions under the practice each one belongs to.",
  "Decide which Buddhist practice each description matches, and sort it there.",
  "Sort each fact into the correct Buddhist practice.",
  "Place each description under the practice it belongs to.",
  "Read each fact and sort it under the matching practice.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
];

const PRACTICES = [
  {
    id: "vandana",
    label: "Buddha Vandana",
    english: "Paying homage to the Buddha",
    purpose: "Showing respect and gratitude to the Buddha as the teacher, usually by bowing and reciting words of homage",
  },
  {
    id: "tisarana",
    label: "Tisarana",
    english: "Taking refuge in the Triple Gem",
    purpose: "Declaring the Buddha, the Dhamma and the Sangha as the three things one turns to for guidance and safety",
  },
  {
    id: "panchasila",
    label: "Panchasila",
    english: "Taking the five precepts",
    purpose: "Undertaking five training rules that guide daily conduct towards others and oneself",
  },
  {
    id: "puja",
    label: "Puja",
    english: "Offerings",
    purpose: "Offering flowers, lights and incense before the shrine as marks of respect and reminders of the teaching",
  },
  {
    id: "samatha",
    label: "Samatha",
    english: "Tranquillity meditation",
    purpose: "Calming and steadying a restless mind, commonly by resting attention on the breath",
  },
  {
    id: "vipassana",
    label: "Vipassana",
    english: "Insight meditation",
    purpose: "Looking closely at experience to see things as they really are, rather than as we wish them to be",
  },
  {
    id: "metta",
    label: "Metta and sharing of merits",
    english: "Loving-kindness meditation and sharing merit",
    purpose: "Radiating goodwill to all beings, then wishing that the good of the practice be shared with them",
  },
] as const;

// The design's own listed order, which is also the order these practices are observed in: homage,
// then refuge, then precepts, then offerings, then the meditations, closing with metta and the
// sharing of merits.
const PRACTICE_ORDER = ["vandana", "tisarana", "panchasila", "puja", "samatha", "vipassana", "metta"] as const;

// The five precepts in their canonical order — a second genuine sequence for the ordering branch.
const PANCHASILA = [
  "To refrain from harming living beings",
  "To refrain from taking what is not given",
  "To refrain from wrong conduct in relationships",
  "To refrain from false speech",
  "To refrain from drinks and drugs that cloud the mind",
] as const;

const TRIPLE_GEM = [
  { id: "buddha", label: "Buddha", meaning: "The teacher who found the way and showed it to others" },
  { id: "dhamma", label: "Dhamma", meaning: "The teaching itself — the path that is to be walked" },
  { id: "sangha", label: "Sangha", meaning: "The community that keeps the teaching alive and practises it together" },
] as const;

// 21 facts across the seven practices — comfortably past the 10-fact floor.
const PRACTICE_FACTS: { text: string; practice: string }[] = [
  { text: "Bowing before the shrine as a mark of respect and gratitude to the teacher", practice: "vandana" },
  { text: "Reciting words of homage to the Blessed One, the Worthy One, the Perfectly Self-Enlightened One", practice: "vandana" },
  { text: "Expressing thanks to the one who found the path and made it known to others", practice: "vandana" },
  { text: "Declaring 'I go to the Buddha for refuge' and repeating it for the Dhamma and the Sangha", practice: "tisarana" },
  { text: "Naming the three things a Buddhist turns to for guidance — teacher, teaching and community", practice: "tisarana" },
  { text: "Undertaken again each time the Triple Gem is remembered, not once for life only", practice: "tisarana" },
  { text: "Undertaking not to harm living beings and not to take what is not given", practice: "panchasila" },
  { text: "Undertaking to refrain from false speech and from drinks and drugs that cloud the mind", practice: "panchasila" },
  { text: "Five training rules that shape everyday behaviour rather than beliefs", practice: "panchasila" },
  { text: "Offering flowers before the shrine, which fade and so recall that all things change", practice: "puja" },
  { text: "Lighting a lamp before the shrine as a reminder that wisdom drives out ignorance", practice: "puja" },
  { text: "Offering incense, whose fragrance spreads outward like the influence of a virtuous life", practice: "puja" },
  { text: "Resting attention gently on the breath so a restless mind settles", practice: "samatha" },
  { text: "Practised to steady and calm the mind before deeper reflection", practice: "samatha" },
  { text: "The tranquillity side of meditation, aimed at concentration rather than analysis", practice: "samatha" },
  { text: "Observing experience closely in order to see things as they really are", practice: "vipassana" },
  { text: "Insight into impermanence — the fact that nothing observed stays the same", practice: "vipassana" },
  { text: "The investigating side of meditation, which examines rather than simply calms", practice: "vipassana" },
  { text: "Wishing well first to oneself, then to loved ones, then to strangers, then to difficult people, then to all beings", practice: "metta" },
  { text: "Radiating goodwill deliberately, including towards those one finds hard to like", practice: "metta" },
  { text: "Closing a practice by wishing that its good be shared with all beings, including departed relatives", practice: "metta" },
];

const NUMBER_FACTS = [
  {
    prompt: "Mark how many precepts make up the Panchasila.",
    min: 0,
    max: 10,
    value: 5,
    hint: "The name itself carries the number — 'pancha'.",
    explanation: "Panchasila is the five precepts: no harming living beings, no taking what is not given, no wrong conduct in relationships, no false speech, and no drinks or drugs that cloud the mind.",
  },
  {
    prompt: "Mark how many refuges are taken in the Tisarana.",
    min: 0,
    max: 8,
    value: 3,
    hint: "'Ti' in Tisarana carries the number, and the Triple Gem has the same count.",
    explanation: "Tisarana is three refuges — the Buddha, the Dhamma and the Sangha, together called the Triple Gem.",
  },
  {
    prompt: "Mark how many Buddhist daily scheduled practices the Grade 7 design lists.",
    min: 0,
    max: 12,
    value: 7,
    hint: "Count them: homage, refuge, precepts, offerings, and the meditations that follow.",
    explanation: "The design lists seven: Buddha Vandana, Tisarana, Panchasila, Puja, Samatha, Vipassana, and Metta meditation with the sharing of merits.",
  },
  {
    prompt: "Mark how many times the words of homage to the Buddha are traditionally recited at the start of devotions.",
    min: 0,
    max: 8,
    value: 3,
    hint: "The same number as the refuges taken straight afterwards.",
    explanation: "The homage is traditionally recited three times, after which the three refuges of the Tisarana are taken.",
  },
  {
    prompt: "Vipassana looks into the marks that all changing things share — impermanence, unsatisfactoriness and non-self. Mark how many marks that is.",
    min: 0,
    max: 8,
    value: 3,
    hint: "Count the three named in the question.",
    explanation: "Vipassana is insight into three marks of existence: impermanence (anicca), unsatisfactoriness (dukkha) and non-self (anatta).",
  },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} arrives at the vihara in ${place(rng)} for the morning devotions and finds the assembly already reciting words of respect and gratitude to the Buddha before anything else begins. Which of the daily scheduled practices is this?`,
      correct: "Buddha Vandana — paying homage to the Buddha",
      wrong: [
        "Tisarana — taking refuge in the Triple Gem",
        "Puja — making offerings before the shrine",
        "Panchasila — taking the five precepts",
      ],
      explanation:
        "Vandana is the homage that opens devotions. Tisarana follows it and is a declaration of refuge rather than of respect; Puja involves offering flowers, lights or incense; Panchasila is undertaking the five training rules.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Before a school examination in ${place(rng)}, ${who} cannot stop her thoughts racing. Her teacher tells her to sit still and rest her attention gently on her breathing until the mind settles. Which practice is this?`,
      correct: "Samatha — tranquillity meditation, which calms and steadies a restless mind",
      wrong: [
        "Vipassana — insight meditation, which examines experience to see things as they really are",
        "Metta — loving-kindness meditation, which radiates goodwill towards all beings",
        "Buddha Vandana — paying homage to the Buddha",
      ],
      explanation:
        "Calming a scattered mind by resting on the breath is Samatha. Vipassana investigates rather than calms, and metta directs goodwill outwards to beings rather than settling one's own attention.",
    };
  },
  (rng) => {
    const who = name(rng);
    const other = neighbour(rng);
    return {
      prompt: `${who} finds it hard to forgive ${other} after a quarrel in ${place(rng)}. In her practice she wishes herself well, then her family, then people she barely knows, and finally ${other}. Which practice is she doing?`,
      correct: "Metta meditation — deliberately radiating goodwill outwards, including towards a person she finds difficult",
      wrong: [
        "Samatha meditation — calming a restless mind on the breath",
        "Vipassana meditation — observing experience to see it as it really is",
        "Puja — offering flowers, lights and incense at the shrine",
      ],
      explanation:
        "The widening circle from oneself out to a difficult person is the structure of metta practice. Samatha would settle her attention without directing goodwill at anyone, and Vipassana would examine the quarrel rather than send goodwill.",
    };
  },
  (rng) => ({
    prompt: `A visitor to the vihara in ${place(rng)} watches flowers being offered before the shrine and asks ${name(rng)} whether the Buddha eats or uses the offerings. What is the correct explanation?`,
    correct: "No — the offerings are marks of respect and reminders of the teaching; the flowers fade, which recalls that all things change",
    wrong: [
      "Yes — the offerings are food and drink placed there for the Buddha to receive",
      "No — the offerings are payments made in exchange for blessings",
      "No — the offerings are simply decorations with no meaning attached to them",
    ],
    explanation:
      "Puja expresses respect and teaches: fading flowers recall impermanence, a lamp recalls wisdom driving out ignorance, and incense recalls virtue spreading outward. They are neither food for the Buddha, nor payment, nor mere decoration.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is offered a chance to copy from a neighbour during a test in ${place(rng)}, and refuses. Which of the five precepts is she keeping?`,
      correct: "The precept to refrain from taking what is not given",
      wrong: [
        "The precept to refrain from harming living beings",
        "The precept to refrain from false speech",
        "The precept to refrain from drinks and drugs that cloud the mind",
      ],
      explanation:
        "Marks obtained by copying were never given to her, so this is the second precept. False speech would cover lying about the result afterwards, which is a different act from taking the answers.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} watches her own irritation rise and fade during a long queue in ${place(rng)}, noticing that the feeling does not last and that she is not obliged to act on it. Which practice does this describe?`,
      correct: "Vipassana — insight meditation, seeing directly that experience keeps changing",
      wrong: [
        "Samatha — tranquillity meditation, calming the mind on the breath",
        "Panchasila — undertaking the five precepts",
        "Tisarana — taking refuge in the Triple Gem",
      ],
      explanation:
        "Observing a feeling arise, change and pass is insight into impermanence, which is Vipassana. Samatha would aim only at settling the mind, not at seeing how the experience behaves.",
    };
  },
  (rng) => {
    return {
      prompt: `At the close of a group practice in ${place(rng)}, the assembly wishes that whatever good has come from the session be shared with all beings, including their departed relatives. What is this called?`,
      correct: "Sharing of merits, which traditionally closes metta practice",
      wrong: [
        "Tisarana, the taking of the three refuges",
        "Puja, the offering of flowers and lights",
        "Buddha Vandana, the paying of homage",
      ],
      explanation:
        "Sharing of merits is the closing act the design pairs with metta meditation. Refuge, offerings and homage all come earlier in the sequence and do not involve dedicating the good of the practice to others.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} is tabulating the daily practices for a class presentation in ${place(rng)} and needs one column that separates the two kinds of meditation correctly. Which description is right?`,
    correct: "Samatha calms and concentrates the mind; Vipassana investigates experience to see it as it really is",
    wrong: [
      "Samatha investigates experience; Vipassana calms and concentrates the mind",
      "Samatha is done by monks only; Vipassana is done by lay people only",
      "Samatha is done in the morning and Vipassana only at night",
    ],
    explanation:
      "The two are distinguished by what they do, not by who does them or when: tranquillity versus insight. Both are open to monastics and lay people alike, at any time of day.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A new learner at the vihara in ${place(rng)} asks ${who} what the Triple Gem actually refers to. Which answer is correct?`,
      correct: "The Buddha, the Dhamma and the Sangha — the teacher, the teaching and the community",
      wrong: [
        "The three kinds of meditation practised at the vihara",
        "Flowers, lights and incense, the three usual offerings",
        "The first three of the five precepts",
      ],
      explanation:
        "The Triple Gem is the Buddha, the Dhamma and the Sangha, and Tisarana takes refuge in each. Offerings do come in threes and there are precepts and meditations too — which is exactly why the three are so often confused.",
    };
  },
  (rng) => ({
    prompt: `A group in ${place(rng)} is preparing a chart on how the daily practices benefit society, one of this sub-strand's own key inquiry questions. Which pairing of practice and social benefit is best supported?`,
    correct: "Panchasila — a community where people do not harm, steal, deceive or act under intoxication is safer for everybody in it",
    wrong: [
      "Puja — offering flowers makes crops grow better in the surrounding area",
      "Samatha — a calm mind guarantees that a person will become wealthy",
      "Tisarana — reciting the refuges protects a household from all illness",
    ],
    explanation:
      "The five precepts are conduct rules, so their benefit shows up directly in how safe a community is. The other three options claim material or magical results that the practices themselves do not promise.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked to explain why the five precepts are described as training rules rather than as commands imposed from outside. Which explanation is best?`,
      correct: "Because the practitioner voluntarily undertakes them as training for their own conduct, and renews that undertaking each time",
      wrong: [
        "Because breaking them carries no consequences at all for anybody",
        "Because they apply only inside the vihara and not in daily life",
        "Because only monks are expected to keep them",
      ],
      explanation:
        "The precepts are undertaken by the practitioner and renewed, which is why 'training rules' fits. That is not the same as saying they have no consequences, that they stop at the vihara door, or that lay people are exempt.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `In the vihara in ${place(rng)}, ${who} notices that homage is paid before refuge is taken, and that refuge comes before the precepts. What does this order express?`,
      correct: "Respect is offered to the teacher first, then the teacher, teaching and community are accepted as guides, and only then are the training rules undertaken",
      wrong: [
        "The precepts are the least important of the three and so come last",
        "The order is fixed only so that the ceremony finishes on time",
        "Refuge must come after the precepts, but the vihara reverses it for visitors",
      ],
      explanation:
        "The sequence builds: homage, then refuge in the Triple Gem, then the undertaking of the precepts that follow from it. Coming last does not mark the precepts as unimportant, and the order is not about timekeeping.",
    };
  },
];

const EVALUATE_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `Two learners in ${place(rng)} present their findings on the daily practices. ${name(rng)} concludes that meditation is the only practice that matters and that the rest are just ceremony. Judge this conclusion against the seven practices as the design sets them out.`,
    correct: "It is unsound — homage, refuge, precepts and offerings shape conduct and intention, which is the ground the two meditations are built on",
    wrong: [
      "It is sound — only meditation changes the mind, so the other practices are optional decoration",
      "It is sound — the design lists meditation last, which shows it is the only goal",
      "It is neither — the design gives no reason to rank any practice at all",
    ],
    explanation:
      "The seven practices work together: the precepts settle conduct, refuge sets direction, and the meditations build on both. Coming last in a list marks sequence, not sole importance — and the design does present the seven as a connected daily schedule.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} claims that keeping the Panchasila is easy because it is simply a list of things not to do. Judge this claim.`,
      correct: "It understates them — each precept is a training rule renewed daily, and keeping them under pressure (in an exam, an argument, or a crowd) is exactly where the difficulty lies",
      wrong: [
        "It is correct — rules phrased as 'do not' require no effort to follow",
        "It is correct — the precepts apply only during formal devotions, which are short",
        "It is incorrect, because the precepts are commands rather than training rules",
      ],
      explanation:
        "'Refrain from' phrasing does not make a rule easy: refusing to copy in a test or to answer an insult in kind takes real effort. The precepts also apply throughout daily life, and they remain voluntary training rules rather than imposed commands.",
    };
  },
  (rng) => ({
    prompt: `A class in ${place(rng)} plans a visit to the vihara. One group wants to photograph everything freely for their presentation; another says they must ask permission first and follow the vihara's instructions on where photography is allowed. Which approach is right, and why?`,
    correct: "Ask permission and follow the instructions — the design itself specifies recording 'with permission', and respect for a place of worship is part of what is being learnt",
    wrong: [
      "Photograph freely, because the class needs evidence for the presentation",
      "Photograph freely, because a place of worship is a public building",
      "Take no photographs at all, because recording anything at a place of worship is forbidden",
    ],
    explanation:
      "The design's own learning experience says to record a video or take photographs with permission. Neither photographing without asking nor refusing to record anything matches that — the point is asking and abiding by the answer.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} argues that metta meditation is pointless towards someone who has wronged you, because wishing them well changes nothing for them. Judge this argument.`,
      correct: "It misses the practice's purpose — metta is training the practitioner's own mind out of hostility, and the change it aims at is in the one practising",
      wrong: [
        "It is sound — a practice that does not change the other person achieves nothing",
        "It is sound — metta is meant only for people who already treat you well",
        "It is unsound, because metta is guaranteed to make the other person apologise",
      ],
      explanation:
        "Metta is cultivated deliberately towards difficult people precisely because that is where hostility grows. The argument judges it by an effect it never claimed — and the opposite claim, that it forces an apology, is equally wrong.",
    };
  },
  (rng) => ({
    prompt: `Two tables are proposed for a presentation in ${place(rng)}. Table A lists the seven practices with their Pali names only. Table B lists each practice, what is actually done, and one benefit a person or community gains from it. Which better meets this sub-strand's outcomes, and why?`,
    correct: "Table B — the outcomes ask learners to examine the practices and illustrate their observance in daily life, and the key inquiry question asks how they benefit society",
    wrong: [
      "Table A — correct terminology is the whole of what this sub-strand assesses",
      "Table A — a shorter table is easier for classmates to read at a glance",
      "Neither — tables cannot show religious practices",
    ],
    explanation:
      "The design asks for a tabulated presentation of findings on the practices and their benefits, so a table of names alone stops short of the outcome. Terminology matters, but it is a part of the task rather than the whole of it.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} says that because Samatha and Vipassana are both meditation, a person can simply pick whichever they prefer and ignore the other entirely. Judge this against what each one does.`,
      correct: "It is a weak conclusion — they do different jobs, since a mind too restless to settle cannot observe clearly, and calm without insight leaves nothing understood",
      wrong: [
        "It is a strong conclusion — the two are identical apart from their names",
        "It is a strong conclusion — Vipassana replaces Samatha entirely once learnt",
        "It is weak, because only one of the two is a genuine Buddhist practice",
      ],
      explanation:
        "Tranquillity steadies the mind and insight examines what the steadied mind can then see — complementary, not interchangeable. Both are genuine practices named in the design.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} concludes from watching one morning at the vihara that Buddhist practice is mainly about ceremonies performed in a special building. Judge this conclusion.`,
    correct: "It is too narrow — the precepts, metta and both meditations are carried into ordinary daily life, which is what 'daily scheduled practices' means",
    wrong: [
      "It is accurate — all seven practices require a shrine and cannot be done elsewhere",
      "It is accurate — practice outside a place of worship earns no merit",
      "It is too narrow, because the ceremonies are actually performed at home only",
    ],
    explanation:
      "The design's own outcome is to illustrate and practise these observances in DAILY LIFE. Refraining from false speech, calming the mind or radiating metta needs no shrine — and the vihara observances are real too, so replacing one extreme with another is no better.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} proposes explaining Puja to the class as "paying the Buddha so that he grants requests". Judge this explanation before it is presented.`,
      correct: "It should be corrected — offerings are respect and reminders, and describing them as payment for favours misrepresents the practice to the whole class",
      wrong: [
        "It should be presented — it is a simple explanation that classmates will remember easily",
        "It should be presented — every religion's offerings work as an exchange for blessings",
        "It should be corrected, because offerings are actually food for the monks",
      ],
      explanation:
        "Flowers, lights and incense are offered as marks of respect and as reminders of impermanence, wisdom and virtue — not as payment. Memorability does not justify teaching classmates something inaccurate about another person's practice.",
    };
  },
  (rng) => ({
    prompt: `A group in ${place(rng)} disagrees about whether keeping a daily schedule matters, since the same practices could be done whenever one feels like it. Which judgement is better supported?`,
    correct: "A regular schedule matters — the design calls these 'daily scheduled practices', and a practice done only when one feels like it is least likely to happen on the days it is needed most",
    wrong: [
      "It makes no difference — sincerity is all that counts, and timing is irrelevant",
      "A schedule matters only for monks, since lay people have work and school",
      "A schedule matters because practices lose their effect if done at the wrong hour",
    ],
    explanation:
      "The regularity is in the design's own name for them. Sincerity and regularity are not in competition — and the case for a schedule is about reliability, not about particular hours being magically effective.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `After the visit, ${who}'s group in ${place(rng)} must choose one finding to lead their presentation on how meditation practices impact a person's life. Which finding is best supported by what the practices actually do?`,
      correct: "Regular Samatha steadies attention, and Vipassana turns that steadiness into clearer understanding of one's own reactions",
      wrong: [
        "Meditation removes all difficulties from a person's life permanently",
        "Meditation replaces the need to keep the five precepts",
        "Meditation is effective only for people who were already calm before starting",
      ],
      explanation:
        "The claim has to match what the practices set out to do: calm attention, then clearer seeing. Removing all difficulty, replacing conduct rules, or working only for the already-calm are all claims the practices do not make.",
    };
  },
];

const FILL_BLANK_TEMPLATES = [
  {
    before: "Paying homage to the Buddha at the start of devotions is called Buddha ",
    after: ".",
    correctAnswer: "Vandana",
    acceptedAnswers: ["vandana", "vandhana"],
    hint: "It is the first of the seven daily scheduled practices.",
    explanation: "Buddha Vandana is the homage — bowing and reciting words of respect and gratitude — that opens the daily practices.",
  },
  {
    before: "Taking refuge in the Buddha, the Dhamma and the Sangha is called ",
    after: ".",
    correctAnswer: "Tisarana",
    acceptedAnswers: ["tisarana", "tisaraṇa", "ti sarana"],
    hint: "'Ti' points to the number of refuges taken.",
    explanation: "Tisarana is the taking of the three refuges — the Buddha, the Dhamma and the Sangha, together called the Triple Gem.",
  },
  {
    before: "The three refuges together — the Buddha, the Dhamma and the Sangha — are known as the ",
    after: " Gem.",
    correctAnswer: "Triple",
    acceptedAnswers: ["triple", "three", "tiratana"],
    hint: "There are three of them.",
    explanation: "The Triple Gem is the teacher (Buddha), the teaching (Dhamma) and the community (Sangha).",
  },
  {
    before: "The five precepts taken as training rules for daily conduct are called the ",
    after: ".",
    correctAnswer: "Panchasila",
    acceptedAnswers: ["panchasila", "pancasila", "pancha sila", "panchsheel"],
    hint: "'Pancha' means five.",
    explanation: "Panchasila is the undertaking of five training rules covering harm, taking what is not given, conduct in relationships, speech and intoxicants.",
  },
  {
    before: "The first of the five precepts is to refrain from ",
    after: " living beings.",
    correctAnswer: "harming",
    acceptedAnswers: ["harming", "harm", "killing", "hurting"],
    hint: "It is the precept closest to the principle of Ahimsa.",
    explanation: "The first precept undertakes not to harm living beings — the conduct rule that most closely matches the principle of non-violence.",
  },
  {
    before: "Offering flowers, lights and incense before the shrine is called ",
    after: ".",
    correctAnswer: "Puja",
    acceptedAnswers: ["puja", "pooja"],
    hint: "The design lists it simply as 'offerings'.",
    explanation: "In Puja the offerings are marks of respect and reminders: fading flowers recall impermanence, a lamp recalls wisdom, incense recalls virtue spreading outward.",
  },
  {
    before: "Flowers are offered at the shrine partly because they fade, which is a reminder that everything is ",
    after: ".",
    correctAnswer: "impermanent",
    acceptedAnswers: ["impermanent", "changing", "temporary", "anicca"],
    hint: "Nothing observed stays the same.",
    explanation: "Fading flowers recall impermanence (anicca) — the same truth Vipassana looks into directly.",
  },
  {
    before: "Tranquillity meditation, which calms and steadies a restless mind, is called ",
    after: ".",
    correctAnswer: "Samatha",
    acceptedAnswers: ["samatha", "samantha", "shamatha"],
    hint: "The design spells it 'Samantha'.",
    explanation: "Samatha is the tranquillity side of meditation, commonly practised by resting attention on the breath.",
  },
  {
    before: "Insight meditation, which looks closely at experience to see things as they really are, is called ",
    after: ".",
    correctAnswer: "Vipassana",
    acceptedAnswers: ["vipassana", "vipasana"],
    hint: "It investigates rather than calms.",
    explanation: "Vipassana is insight meditation, whose subject is the three marks of existence: impermanence, unsatisfactoriness and non-self.",
  },
  {
    before: "The meditation in which goodwill is radiated to oneself, to loved ones, to strangers, to difficult people and finally to all beings is called ",
    after: " meditation.",
    correctAnswer: "Metta",
    acceptedAnswers: ["metta", "maitri", "loving-kindness", "loving kindness"],
    hint: "It is the loving-kindness practice.",
    explanation: "Metta meditation cultivates boundless goodwill, deliberately including people one finds difficult.",
  },
  {
    before: "Wishing at the close of a practice that its good be shared with all beings is called the sharing of ",
    after: ".",
    correctAnswer: "merits",
    acceptedAnswers: ["merits", "merit"],
    hint: "The design pairs it with metta meditation.",
    explanation: "Sharing of merits closes the practice by dedicating whatever good has come from it to all beings, including departed relatives.",
  },
  {
    before: "A Buddhist temple, which the design asks learners to visit to observe the daily scheduled practices, is called a ",
    after: ".",
    correctAnswer: "vihara",
    acceptedAnswers: ["vihara", "vihar", "vihaara"],
    hint: "The design writes it as 'Vihar' and 'Vihara'.",
    explanation: "The vihara is the Buddhist place of worship, where learners are asked to observe the daily scheduled practices for themselves.",
  },
] as const;

export const buddhistPractices: Skill = {
  id: "g7-hre-rp-buddhist-practices",
  code: "RP.1",
  subjectId: "hre",
  strandId: "g7-hre-rp",
  grade: 7,
  title: "Buddhist Practices",
  description:
    "The seven Buddhist daily scheduled practices — Buddha Vandana, Tisarana, Panchasila, Puja, Samatha, Vipassana, and Metta meditation with the sharing of merits — what each one does, and how they are observed in daily life.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["order", "purpose-match", "gem-match", "fact-sort", "reasoning", "evaluate", "counts", "fill-blank"] as const
    );

    if (branch === "order") {
      if (rng() < 0.5) {
        const ordered = PRACTICE_ORDER.map((id) => {
          const p = PRACTICES.find((x) => x.id === id)!;
          return { id: p.id, label: `${p.label} — ${p.english.toLowerCase()}` };
        });
        return {
          kind: "ordering",
          prompt: randChoice(rng, PRACTICE_ORDER_PROMPTS),
          instruction: "Click the practices in order, from first to last.",
          items: shuffle(rng, ordered),
          correctOrder: ordered.map((p) => p.id),
          hint: "Respect is offered first, then refuge is taken, then the training rules; offerings follow, and the meditations close the sequence.",
          explanation: ordered.map((p) => p.label).join(" → "),
        };
      }
      const ordered = PANCHASILA.map((label, i) => ({ id: `pr${i}`, label }));
      return {
        kind: "ordering",
        prompt: randChoice(rng, PRECEPT_ORDER_PROMPTS),
        instruction: "Click the precepts in order, from the first to the fifth.",
        items: shuffle(rng, ordered),
        correctOrder: ordered.map((p) => p.id),
        hint: "They begin with harm to living beings and end with what clouds the mind.",
        explanation: PANCHASILA.map((p, i) => `${i + 1}. ${p}`).join(" "),
      };
    }

    if (branch === "purpose-match") {
      const chosen = shuffle(rng, PRACTICES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.purpose })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, PURPOSE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Watch the two meditations especially: one calms the mind, the other examines experience.",
        explanation: chosen.map((p) => `${p.label} — ${p.purpose.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "gem-match") {
      const tokens = shuffle(rng, TRIPLE_GEM.map((g) => ({ id: g.id, label: g.label })));
      const targets = shuffle(rng, TRIPLE_GEM.map((g) => ({ id: g.id, label: g.meaning })));
      const correctMap: Record<string, string> = {};
      for (const g of TRIPLE_GEM) correctMap[g.id] = g.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, GEM_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Teacher, teaching, community — in that order.",
        explanation: TRIPLE_GEM.map((g) => `${g.label} — ${g.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fact-sort") {
      const chosen = shuffle(rng, PRACTICES).slice(0, 3);
      const pool = shuffle(rng, PRACTICE_FACTS.filter((f) => chosen.some((p) => p.id === f.practice))).slice(0, 9);
      const items = pool.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`f${i}`] = f.practice));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FACT_SORT_PROMPTS),
        items,
        buckets: chosen.map((p) => ({ id: p.id, label: `${p.label} (${p.english.toLowerCase()})` })),
        correctBucket,
        hint: "Ask what is actually being done — bowing, declaring, undertaking, offering, calming, investigating, or sending goodwill.",
        explanation: pool.map((f) => `"${f.text}" — ${PRACTICES.find((p) => p.id === f.practice)!.label}.`).join(" "),
      };
    }

    if (branch === "counts") {
      const q = randChoice(rng, NUMBER_FACTS);
      return {
        kind: "number-line",
        prompt: q.prompt,
        min: q.min,
        max: q.max,
        step: 1,
        correctValue: q.value,
        mode: "point",
        hint: q.hint,
        explanation: q.explanation,
      };
    }

    if (branch === "reasoning" || branch === "evaluate") {
      const q = randChoice(rng, branch === "reasoning" ? REASONING_TEMPLATES : EVALUATE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint:
          branch === "reasoning"
            ? "Every option names a real practice — decide which one the situation actually describes."
            : "Judge the claim against what the practice sets out to do, not against how confident it sounds.",
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
