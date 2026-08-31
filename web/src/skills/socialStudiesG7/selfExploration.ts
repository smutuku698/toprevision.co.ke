import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CLASSIFY_ITEMS = [
  { text: "Being skilled at solving arithmetic problems quickly", bucket: "ability" },
  { text: "Having a talent for singing and composing songs", bucket: "ability" },
  { text: "Being naturally good at persuading and leading a group of classmates", bucket: "ability" },
  { text: "Having a natural talent for fixing machines and gadgets", bucket: "ability" },
  { text: "Believing that honesty matters more than winning an argument", bucket: "value" },
  { text: "Holding respect for elders as an important guiding principle", bucket: "value" },
  { text: "Believing that hard work is more important than shortcuts", bucket: "value" },
  { text: "Believing that keeping a promise matters even when it is inconvenient", bucket: "value" },
  { text: "Feeling a burst of joy after passing a difficult exam", bucket: "emotion" },
  { text: "Feeling afraid before speaking in front of the whole school", bucket: "emotion" },
  { text: "Feeling angry after a friend breaks a promise", bucket: "emotion" },
  { text: "Feeling embarrassed after making a mistake in front of classmates", bucket: "emotion" },
] as const;

const BUCKET_LABEL: Record<string, string> = {
  ability: "Personal ability or interest",
  value: "Personal value",
  emotion: "Emotion",
};

const ABILITY_PATHWAY = [
  { ability: "Strong at mathematics and logical problem-solving", pathway: "Engineering or accounting" },
  { ability: "Talented in drawing, painting, and design", pathway: "Art and design" },
  { ability: "Skilled at communicating and persuading others", pathway: "Law or public relations" },
  { ability: "Caring and patient when helping people who are unwell", pathway: "Nursing or medicine" },
  { ability: "Enjoys growing crops and understanding soil and weather", pathway: "Agriculture" },
  { ability: "Skilled with tools and enjoys repairing machines by hand", pathway: "Technical and engineering trades" },
  { ability: "Has a sharp memory for numbers and enjoys managing money", pathway: "Accounting or banking" },
  { ability: "Loves telling stories and writing imaginative pieces", pathway: "Journalism or creative writing" },
  { ability: "Enjoys performing, singing, or dancing in front of an audience", pathway: "Performing arts" },
  { ability: "Curious about how the human body works", pathway: "Medicine or veterinary science" },
  { ability: "Enjoys cooking and experimenting with different recipes", pathway: "Hospitality and culinary arts" },
] as const;

const KENYAN_PLACES = [
  "Kisumu",
  "Machakos",
  "Kapsabet",
  "Bungoma",
  "Nyeri",
  "Nakuru",
  "Kericho",
  "Kilifi",
  "Eldoret",
  "Meru",
  "Kajiado",
  "Garissa",
] as const;

const KENYAN_NAMES = [
  "Achieng",
  "Mutua",
  "Chebet",
  "Wafula",
  "Njeri",
  "Otieno",
  "Kerubo",
  "Wanjiru",
  "Barasa",
  "Naliaka",
  "Kiptoo",
  "Amina",
] as const;

function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}
function name(rng: RNG) {
  return randChoice(rng, KENYAN_NAMES);
}

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const EMOTION_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels angry because her younger brother accidentally tore a page out of her homework book. What is the healthiest way for ${who} to manage this anger?`,
      correct: "Take a few deep breaths, calmly explain how she feels, and ask her brother to be more careful next time",
      wrong: [
        "Shout at her brother and refuse to speak to him for the rest of the day",
        "Ignore the feeling completely and pretend she is not angry at all",
        "Tear one of her brother's books to make him feel the same way",
      ],
      explanation: "Calmly naming the feeling and explaining it deals with anger without hurting anyone. Shouting, pretending not to feel it, or retaliating are unhealthy ways of managing anger.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels afraid because he has to present a project in front of the whole class tomorrow. What is the healthiest way for ${who} to manage this fear?`,
      correct: "Practise the presentation beforehand and talk to his teacher about his worry",
      wrong: [
        "Skip school on the day of the presentation to avoid the feeling completely",
        "Ask a classmate to present on his behalf without telling the teacher",
        "Stay awake worrying all night instead of preparing anything",
      ],
      explanation: "Preparing and talking to a trusted adult manages fear constructively. Avoiding the situation entirely, dodging responsibility, or worrying without acting does not resolve the fear.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels happy after being selected to join the school athletics team. What is the healthiest way for ${who} to manage this happiness?`,
      correct: "Share the good news with family and keep training with humility",
      wrong: [
        "Mock other classmates who were not selected for the team",
        "Stop training completely since the hard part is already over",
        "Boast constantly and refuse to help teammates improve",
      ],
      explanation: "Sharing joy while staying humble and continuing to work hard is a healthy response. Mocking others, becoming complacent, or boasting can damage relationships and progress.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels love and gratitude toward the grandmother who raised him. What is the healthiest way for ${who} to manage and express this emotion?`,
      correct: "Express appreciation through kind actions and spending quality time with her",
      wrong: [
        "Assume she already knows and never show or say any appreciation at all",
        "Wait until a special occasion, such as a birthday, before ever showing any care",
        "Feel the emotion privately but avoid saying anything so it does not seem weak",
      ],
      explanation: "Expressing love through actions and words strengthens the relationship. Keeping the feeling entirely to yourself does not let the other person feel valued.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels sad because a close friend is moving to another town at the end of term. What is the healthiest way for ${who} to manage this sadness?`,
      correct: "Talk about the feeling with someone she trusts and plan how to stay in touch with her friend",
      wrong: [
        "Pretend she does not care so that she does not have to feel sad",
        "Avoid her friend for the rest of the term to make the goodbye easier",
        "Blame her friend's family for causing the sadness",
      ],
      explanation: "Talking through sadness and planning to stay connected processes the emotion in a healthy way. Pretending, avoiding, or blaming others does not help the feeling pass.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels jealous because a close friend won a prize that he had also worked hard for. What is the healthiest way for ${who} to manage this jealousy?`,
      correct: "Congratulate his friend honestly, then reflect on what he can improve for next time",
      wrong: [
        "Spread rumours that his friend did not deserve the prize",
        "Refuse to speak to his friend until the feeling goes away on its own",
        "Pretend he did not want the prize in the first place instead of dealing with the feeling",
      ],
      explanation: "Acknowledging jealousy honestly, congratulating the other person, and reflecting on self-improvement turns the emotion into something useful. Undermining the friend or refusing to communicate damages the relationship.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels worried in the weeks leading up to the national examinations. What is the healthiest way for ${who} to manage this worry?`,
      correct: "Make a realistic revision timetable and talk to a teacher or parent about the worry",
      wrong: [
        "Stay up very late every night cramming without any rest or plan",
        "Avoid thinking about the exams at all until the day they begin",
        "Compare herself constantly to classmates to see who is more worried",
      ],
      explanation: "Planning, resting, and talking to a trusted adult manages exam worry constructively. Cramming without rest, total avoidance, or constant comparison usually makes worry worse.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels proud after helping organise a successful harambee for a classmate's medical bill. What is the healthiest way for ${who} to manage this pride?`,
      correct: "Acknowledge the achievement, thank everyone who helped, and stay ready to support future efforts",
      wrong: [
        "Take all the credit for the harambee even though many people helped",
        "Downplay the achievement completely and refuse to feel any satisfaction",
        "Use the success to look down on classmates who did not contribute",
      ],
      explanation: "Healthy pride acknowledges the achievement while recognising others' contributions. Taking sole credit or looking down on others turns a healthy emotion into an unhealthy one.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels disappointed after his football team loses an important match despite playing well. What is the healthiest way for ${who} to manage this disappointment?`,
      correct: "Accept the loss, discuss what the team can improve, and encourage teammates for the next match",
      wrong: [
        "Blame one teammate loudly in front of everyone for losing the match",
        "Quit the team immediately without discussing the loss with anyone",
        "Refuse to practise again because the loss feels too painful to think about",
      ],
      explanation: "Accepting a setback and focusing on improvement is a healthy way to manage disappointment. Blaming others or quitting does not help the team or the learner grow.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, feels excited about going on her first school trip outside the county. What is the healthiest way for ${who} to manage this excitement?`,
      correct: "Channel the excitement into preparing well and following the trip's safety instructions",
      wrong: [
        "Ignore all the teacher's instructions because the excitement feels more important",
        "Stay awake the whole night before, too excited to rest or prepare properly",
        "Pressure other classmates to feel exactly as excited as she does",
      ],
      explanation: "Healthy excitement is channelled into preparation and following guidance, not into ignoring instructions or losing rest. Emotions are best managed when they support good decisions, not replace them.",
    };
  },
];

interface AwarenessTemplate {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const SELF_AWARENESS_TEMPLATES: ((rng: RNG) => AwarenessTemplate)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, is naturally gifted at persuading classmates and enjoys leading group discussions, but keeps choosing subjects that do not use this ability at all. What would being self-aware of this personal ability help ${who} do?`,
      correct: "Recognise the ability and consider subjects or pathways, such as law or public relations, that build on it",
      wrong: [
        "Ignore the ability since it has nothing to do with school subjects at all",
        "Assume the ability cannot be developed further through practice",
        "Focus only on emotions and ignore personal abilities entirely",
      ],
      explanation: "Self-awareness of a personal ability helps a learner choose subjects and pathways that genuinely match their strengths, rather than picking options at random.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, in ${place(rng)}, strongly values honesty but finds herself under pressure from friends to cheat during a test. What would strong self-awareness of her personal values help ${who} do in this moment?`,
      correct: "Recognise that cheating conflicts with her value of honesty and make a decision that matches that value",
      wrong: [
        "Go along with the group even though it clashes with her own beliefs",
        "Decide that values only matter outside of school, not during tests",
        "Wait for a teacher to decide for her instead of using her own judgement",
      ],
      explanation: "A person guided by clear self-awareness of their values makes consistent decisions, even under peer pressure, instead of being pulled along by what others are doing.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, keeps feeling anxious before every test but has never stopped to think about why. What would developing self-awareness of this emotion help ${who} do?`,
      correct: "Notice the pattern, understand what triggers the anxiety, and find healthy ways to manage it",
      wrong: [
        "Suppress the feeling completely so it is never thought about again",
        "Assume nothing can be done about emotions and simply accept the anxiety forever",
        "Blame teachers for causing the emotion instead of understanding it",
      ],
      explanation: "Recognising and understanding an emotion is the first step to managing it in a healthy way — a person who is unaware of their emotional patterns cannot address them.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, in ${place(rng)}, is choosing subjects for the next school level and is unsure what to pick. A guidance teacher asks ${who} to first list personal abilities, interests, and values. Why does the teacher suggest this step first?`,
      correct: "Because knowing your own abilities, interests, and values helps you choose subjects and a future career that truly fit you",
      wrong: [
        "Because subject choice has nothing to do with personal abilities or values at all",
        "Because teachers are required to ask this question regardless of its usefulness",
        "Because knowing your values guarantees you will get the highest grades",
      ],
      explanation: "Reflecting on abilities, interests, and values before choosing subjects helps a learner make a choice that actually matches who they are, rather than an arbitrary one.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, often feels frustrated in class but has never noticed that it always happens right before group presentations. What personal insight is ${who} missing?`,
      correct: "That the frustration is actually a sign of anxiety about presenting, not about the group itself",
      wrong: [
        "That frustration is a value, not an emotion, and cannot be understood",
        `That the frustration means ${who} should avoid all group work permanently`,
        "That noticing patterns in emotions is not something a learner can do",
      ],
      explanation: "Self-awareness includes noticing patterns in when an emotion arises, which often reveals its real underlying cause — here, presenting, not the group itself.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, in ${place(rng)}, values hard work highly and feels proud whenever a task is done well, whether or not anyone is watching. How does this show a strong sense of self-awareness?`,
      correct: `${who} recognises the personal value guiding the behaviour, rather than acting only for other people's approval`,
      wrong: [
        `It shows ${who} does not actually have any personal values at all`,
        "It shows that personal values change randomly from day to day",
        `It shows ${who} is only motivated by praise from others`,
      ],
      explanation: "A self-aware person can name the value driving their behaviour and act consistently with it, even without external praise.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, is naturally talented at drawing and design but has never told anyone, including a guidance teacher, about this interest. What is the risk of this lack of self-awareness being shared?`,
      correct: `${who} may miss out on subjects, clubs, or pathways in art and design that could build on this talent`,
      wrong: [
        "There is no risk, because talents develop fully on their own without any guidance",
        "The risk only applies to values, not to abilities or talents",
        "Sharing a talent with a teacher always guarantees immediate success",
      ],
      explanation: "Recognising and communicating a personal talent opens the door to opportunities — clubs, subjects, mentors — that help develop it further.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, in ${place(rng)}, values fairness deeply and feels a strong sense of anger whenever classmates are treated unequally. What does connecting this emotion to the underlying value help ${who} do?`,
      correct: "Understand that the anger is rooted in a value of fairness, and channel it into constructive action, such as speaking up respectfully",
      wrong: [
        "Realise that emotions and values are completely unrelated to each other",
        "Conclude that anger should always be suppressed regardless of its cause",
        "Decide that only teachers are allowed to notice unfair treatment",
      ],
      explanation: "Self-awareness often means seeing how a value (fairness) and an emotion (anger) are connected — this insight helps a learner respond constructively rather than just react.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, is confident, caring, and patient, and often helps sick or struggling classmates without being asked. A career counsellor suggests nursing or medicine. What personal insight likely led to this suggestion?`,
      correct: `${who}'s natural ability and interest in caring for others matches the demands of a caregiving profession`,
      wrong: [
        `The counsellor chose the pathway randomly, without considering ${who}'s abilities`,
        "Nursing and medicine are the only careers available to caring learners",
        "Career counsellors only consider grades, never abilities or interests",
      ],
      explanation: "Guidance counsellors match suggested pathways to a learner's demonstrated abilities and interests — here, caring for others naturally points toward caregiving professions.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, in ${place(rng)}, feels a strong sense of belonging and pride whenever taking part in community clean-up projects. What does noticing this feeling help ${who} understand about personal values?`,
      correct: `That ${who} likely holds a value around community service or responsibility, which this activity satisfies`,
      wrong: [
        `That the feeling is random and reveals nothing about ${who}'s values`,
        "That values can only be understood through school subjects, not community activities",
        "That pride is always an unhealthy emotion to be avoided",
      ],
      explanation: "Noticing which activities consistently bring a positive feeling, like pride or belonging, is a practical way to discover a personal value in action.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a learner in ${place(rng)}, is quick with numbers and enjoys managing the class treasury for a school club, but has never considered this as a strength worth building on. What would self-awareness help ${who} realise?`,
      correct: "That this numerical ability could point toward pathways such as accounting, banking, or business",
      wrong: [
        "That managing money for a club has no connection to future career choices",
        "That numerical ability is only useful for passing mathematics exams",
        "That personal abilities only matter once secondary school is complete",
      ],
      explanation: "Recognising a demonstrated ability, such as managing money well, is exactly the kind of self-knowledge that helps a learner see connections to future study and career pathways.",
    };
  },
];

const SELF_AWARENESS_STEPS = [
  { id: "notice", label: "Notice and reflect on your natural abilities, interests, values, and emotions" },
  { id: "patterns", label: "Identify patterns — which abilities keep showing up, which values guide your choices" },
  { id: "compare", label: "Compare this self-knowledge with the options available, such as subjects or careers" },
  { id: "apply", label: "Apply what you have learned about yourself when making real decisions" },
] as const;

const FILL_BLANK_TEMPLATES = [
  {
    before: "A belief that guides a person's behaviour and decisions, such as honesty or respect for elders, is called a personal ",
    after: ".",
    correctAnswer: "value",
    accepted: ["value", "values"],
    explanation: "A personal value is a belief, such as honesty or respect, that guides how a person behaves and makes decisions.",
  },
  {
    before: "A natural talent or skill, such as being good at mathematics or singing, is called a personal ",
    after: ".",
    correctAnswer: "ability",
    accepted: ["ability", "talent", "interest"],
    explanation: "A personal ability is a natural talent or skill a person has, such as a talent for mathematics, music, or leadership.",
  },
  {
    before: "A strong feeling such as joy, fear, anger, or love is called an ",
    after: ".",
    correctAnswer: "emotion",
    accepted: ["emotion", "feeling"],
    explanation: "An emotion is a strong feeling, such as joy, fear, anger, or love, that a person experiences in response to a situation.",
  },
  {
    before: "Developing a person's mind, body, emotions, and values together, rather than academic knowledge alone, is called ",
    after: " development.",
    correctAnswer: "holistic",
    accepted: ["holistic"],
    explanation: "Holistic development means growing in every area of life — mind, body, emotions, and values — not just academically.",
  },
  {
    before: "The process of understanding your own abilities, values, and emotions is called self-",
    after: ".",
    correctAnswer: "awareness",
    accepted: ["awareness"],
    explanation: "Self-awareness is understanding your own abilities, values, and emotions, which helps guide better decisions.",
  },
  {
    before: "The emotion someone feels when something wonderful happens, such as being selected for a team, is called ",
    after: ".",
    correctAnswer: "happiness",
    accepted: ["happiness", "joy"],
    explanation: "Happiness (or joy) is the emotion felt when something good happens, such as a personal achievement or good news.",
  },
  {
    before: "The emotion someone feels when facing something threatening or worrying, such as speaking in public, is called ",
    after: ".",
    correctAnswer: "fear",
    accepted: ["fear"],
    explanation: "Fear is the emotion felt when facing something worrying or threatening, such as an unfamiliar or high-pressure situation.",
  },
  {
    before: "The emotion someone feels when treated unfairly or wronged, such as when a promise is broken, is called ",
    after: ".",
    correctAnswer: "anger",
    accepted: ["anger"],
    explanation: "Anger is the emotion felt in response to being wronged or treated unfairly.",
  },
  {
    before: "The emotion of deep care and closeness toward another person, such as a parent or grandparent, is called ",
    after: ".",
    correctAnswer: "love",
    accepted: ["love"],
    explanation: "Love is the emotion of deep care, closeness, and affection toward another person.",
  },
  {
    before: "Explaining calmly how you feel instead of shouting or reacting harshly is an example of a ",
    after: " way to manage an emotion.",
    correctAnswer: "healthy",
    accepted: ["healthy", "positive"],
    explanation: "Calm, respectful communication is a healthy way of managing an emotion, unlike shouting or lashing out.",
  },
  {
    before: "Choosing subjects and careers that genuinely match a learner's true abilities and interests is a benefit of self-",
    after: ".",
    correctAnswer: "awareness",
    accepted: ["awareness"],
    explanation: "Self-awareness of one's own abilities and interests helps a learner make subject and career choices that truly fit them.",
  },
] as const;

export const selfExploration: Skill = {
  id: "g7-ss-spd-self-exploration",
  code: "SPD.1",
  subjectId: "social-studies",
  strandId: "g7-ss-spd",
  grade: 7,
  title: "Self-exploration",
  description: "Personal abilities, interests, and values for holistic development, and healthy ways of managing emotions such as happiness, love, fear, and anger.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["classify", "pathway-match", "emotion-scenario", "awareness-reason", "steps-order", "fill-blank"] as const
    );

    if (branch === "classify") {
      const chosen = shuffle(rng, CLASSIFY_ITEMS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement as a personal ability/interest, a personal value, or an emotion.",
        items,
        buckets,
        correctBucket,
        hint: "An ability is a skill, a value is a belief that guides behaviour, and an emotion is a feeling.",
        explanation: chosen.map((c) => `"${c.text}" — ${BUCKET_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "pathway-match") {
      const chosen = shuffle(rng, [...ABILITY_PATHWAY]).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `p${i}`, label: a.ability })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `p${i}`, label: a.pathway })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((a, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: "Match each personal ability or interest to a career pathway it could influence.",
        tokens,
        targets,
        correctMap,
        hint: "Think about which working world naturally needs that specific ability.",
        explanation: chosen.map((a) => `${a.ability} → ${a.pathway}.`).join(" "),
      };
    }

    if (branch === "emotion-scenario") {
      const q = randChoice(rng, EMOTION_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "A healthy response deals with the emotion without hurting yourself or others.",
        explanation: q.explanation,
      };
    }

    if (branch === "awareness-reason") {
      const q = randChoice(rng, SELF_AWARENESS_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about how noticing your own abilities, values, or emotions leads to a better decision.",
        explanation: q.explanation,
      };
    }

    if (branch === "steps-order") {
      const items = shuffle(rng, SELF_AWARENESS_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps of building self-awareness of your abilities, values, and emotions in a sensible order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: SELF_AWARENESS_STEPS.map((s) => s.id),
        hint: "You must first notice things about yourself before you can find patterns, compare options, and apply the insight.",
        explanation: SELF_AWARENESS_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    // fill-blank
    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the vocabulary used to describe abilities, values, and emotions.",
      explanation: fb.explanation,
    };
  },
};
