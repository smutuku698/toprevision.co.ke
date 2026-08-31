import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const CATEGORIZE_PROMPTS = [
  "Sort each action as responsible use of social media or misuse of social media.",
  "Decide whether each action is responsible use or misuse, and sort it there.",
  "Group these actions under responsible use or misuse of social media.",
  "Sort each action below into the correct category.",
  "Place each action into the bucket for responsible use or misuse.",
  "Read each action and sort it under responsible use or misuse of social media.",
];

const MATCH_PROMPTS = [
  "Match each term to its meaning.",
  "Pair each term below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each term to the statement that explains it.",
  "Link each term below to its correct definition.",
  "Match each term to the description that fits it.",
];

const ORDER_PROMPTS = [
  "Arrange the steps for responding to cyberbullying in the correct order.",
  "Put these steps for responding to cyberbullying into order.",
  "Sequence these steps for handling cyberbullying correctly.",
  "Arrange these steps for dealing with cyberbullying in order.",
  "Order the steps for responding to online bullying.",
  "Sort these steps into the order they should be followed when facing cyberbullying.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about social media use with the right word.",
];

const RESPONSIBLE_USE = [
  "Setting strict privacy settings so only trusted people can see one's posts",
  "Refusing to share personal information, like a home address, with online strangers",
  "Verifying information before sharing or reposting it",
  "Setting a fixed daily time limit for social media use",
  "Communicating respectfully, even when disagreeing with someone online",
  "Reporting a message from a stranger who asks to meet in person",
  "Thinking carefully before posting anything, since it can be seen by many people",
  "Choosing to follow accounts that share positive, uplifting content",
] as const;

const MISUSE = [
  "Posting hurtful comments or messages to bully another person online",
  "Spreading a rumour or unverified claim without checking if it is true",
  "Spending so much time online that schoolwork and sleep are neglected",
  "Sharing a friend's private photo or message without their permission",
  "Chatting privately and agreeing to meet an online stranger in person",
  "Comparing oneself constantly to other people's curated online posts",
  "Copying someone else's schoolwork found online and submitting it as one's own",
  "Sharing inappropriate content that could embarrass oneself or others later",
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "Cyberbullying", meaning: "Using digital platforms to repeatedly harass, threaten, or humiliate someone" },
  { term: "Privacy settings", meaning: "Controls that limit who can see a person's posts and information online" },
  { term: "Digital footprint", meaning: "The lasting trail of information a person leaves behind through online activity" },
  { term: "Netiquette", meaning: "Rules of polite, respectful behaviour when communicating online" },
  { term: "Misinformation", meaning: "False or inaccurate information spread, whether or not intentionally" },
  { term: "Screen time", meaning: "The amount of time a person spends using a phone, computer, or other screen" },
  { term: "Online stranger", meaning: "Someone a person has only ever interacted with over the internet, not in person" },
  { term: "Self-awareness", meaning: "Understanding one's own feelings and reactions, including to social media" },
  { term: "Discernment", meaning: "The ability to judge well what is true, wise, or safe online" },
  { term: "Integrity online", meaning: "Being honest and consistent in one's online behaviour, even when unseen" },
];

const CYBERBULLYING_STEPS = [
  { id: "s1", label: "Do not respond to or retaliate against the bullying message" },
  { id: "s2", label: "Save evidence, such as a screenshot, of the bullying" },
  { id: "s3", label: "Block the person sending the bullying messages" },
  { id: "s4", label: "Report the bullying to the platform" },
  { id: "s5", label: "Tell a trusted parent, guardian, or teacher what happened" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} receives a series of mean, repeated messages from a classmate on a group chat. What is this an example of?`,
      correct: "Cyberbullying — using a digital platform to repeatedly harass or humiliate someone",
      wrong: ["Netiquette — a term for polite online behaviour, not harassment", "Digital footprint — a term for one's lasting online activity trail", "Discernment — a term for judging what is wise or safe online"],
      explanation: "Repeated, hurtful messages sent to harass or humiliate someone through a digital platform is cyberbullying, distinct from unrelated terms like netiquette or digital footprint.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} sees an unverified, alarming claim being shared rapidly in a WhatsApp group and reposts it without checking if it is true. What is the responsible alternative?`,
    correct: "Verifying the information before sharing or reposting it",
    wrong: ["Sharing it to as many groups as possible immediately", "Assuming anything shared quickly must be true", "Deleting the phone's messaging app entirely"],
    explanation: "Responsible social media use means verifying information before sharing it, rather than spreading unverified claims that could be misinformation.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is chatting with someone they only know online, who asks to meet up in person alone. What is the responsible response?`,
      correct: "Refuse the meeting and report the request to a trusted adult",
      wrong: ["Agree to meet immediately without telling anyone", "Share their home address to make the meeting easier", "Ignore the request but continue the private chat as before"],
      explanation: "Agreeing to meet an online stranger alone is a serious safety risk; the responsible response is to refuse and involve a trusted adult, not to continue engaging privately.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} receives a bullying message online and, according to CRE's guidance on responding to cyberbullying, is deciding what to do first. What should come first?`,
    correct: "Not responding to or retaliating against the bullying message",
    wrong: ["Reporting it to the platform, which comes after saving evidence", "Telling a trusted adult, which comes after the earlier steps", "Blocking the person, which comes after not retaliating first"],
    explanation: "The recommended first step is to avoid responding or retaliating, which prevents the situation from escalating before the other steps — saving evidence, blocking, reporting, and telling a trusted adult — follow.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices they feel constantly unhappy after comparing their life to other people's carefully edited social media posts. What life skill would help ${name(rng)} most here?`,
    correct: "Self-awareness — understanding one's own feelings and reactions to what is seen online",
    wrong: ["Netiquette — this is about polite behaviour, not managing one's own feelings", "Digital footprint — this is about one's own lasting online trail, not comparison", "Privacy settings — these control visibility, not emotional reactions"],
    explanation: "Recognising and understanding one's own emotional reaction to curated online content is self-awareness — a key skill for navigating social media in a healthy way.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} sets a fixed time limit each day for using social media so it does not interfere with schoolwork or sleep. Which value does this reflect?`,
      correct: "Responsible time management around screen time",
      wrong: ["Cyberbullying prevention specifically, unrelated to time limits", "Digital footprint reduction, which is about content left behind, not time spent", "Netiquette, which is about polite communication rather than time limits"],
      explanation: "Setting a fixed daily limit on social media use is a specific example of responsible time management, distinct from unrelated concepts like netiquette or digital footprint.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} posts a private photo of a friend without asking permission first, embarrassing the friend publicly. What kind of behaviour is this?`,
    correct: "Misuse of social media — sharing someone's private content without their permission",
    wrong: ["Responsible use, since sharing content is always acceptable", "Netiquette, since it follows normal online etiquette", "Digital footprint, a term describing one's own online activity trail"],
    explanation: "Sharing someone else's private photo without their consent is a misuse of social media that can seriously harm another person, not an example of responsible or polite online behaviour.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} continues behaving honestly and kindly online, even in private chats where no one from school can see. What does this reflect?`,
    correct: "Integrity online — being honest and consistent in behaviour, even when unseen",
    wrong: ["Cyberbullying, which is the opposite of honest, kind behaviour", "Misinformation, which is about spreading false information", "Screen time, which refers only to the amount of time spent online"],
    explanation: "Behaving honestly and kindly online even when no one from school is watching reflects integrity — consistent character regardless of who is observing.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked what a 'digital footprint' means, in the context of responsible social media use. What is the correct meaning?`,
    correct: "The lasting trail of information a person leaves behind through their online activity",
    wrong: ["A type of shoe advertisement commonly seen on social media", "A setting that instantly deletes all of a person's online posts", "A term unrelated to how a person behaves online"],
    explanation: "A 'digital footprint' refers to the lasting trail of information — posts, comments, photos — a person leaves behind online, which is part of why thinking before posting matters.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} judges carefully whether a viral online post seems trustworthy before believing or sharing it. Which skill is ${name(rng)} using?`,
    correct: "Discernment — judging well what is true, wise, or safe online",
    wrong: ["Cyberbullying, which describes harassment, not judgment", "Screen time, which refers only to time spent online", "Privacy settings, which control visibility, not judgment of content"],
    explanation: "Carefully judging whether online content seems trustworthy before believing or sharing it is discernment — a key skill for navigating misinformation.",
  }),
];

export const socialMedia: Skill = {
  id: "g7-cre-cl-social-media",
  code: "CL.5",
  subjectId: "cre",
  strandId: "g7-cre-living",
  grade: 7,
  title: "Social Media",
  description: "Responsible and irresponsible use of social media, how to respond to cyberbullying, and values and life skills needed to use social media safely and responsibly.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "match", "reasoning", "order", "fill-blank"] as const);

    if (branch === "categorize") {
      const good = shuffle(rng, RESPONSIBLE_USE).slice(0, 4);
      const bad = shuffle(rng, MISUSE).slice(0, 4);
      const chosen = shuffle(rng, [...good.map((t) => ({ text: t, good: true })), ...bad.map((t) => ({ text: t, good: false }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.good ? "responsible" : "misuse"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "responsible", label: "Responsible use" },
          { id: "misuse", label: "Misuse" },
        ],
        correctBucket,
        hint: "Responsible use protects privacy, respects others, and manages time well; misuse harms others or oneself.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.good ? "responsible use" : "misuse"}.`).join(" "),
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
        hint: "Think about the terms used to describe safe, responsible use of social media.",
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
        hint: "Think about what responsible use of social media looks like in this situation.",
        explanation: q.explanation,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, CYBERBULLYING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDER_PROMPTS),
        instruction: "Click them in order.",
        items,
        correctOrder: CYBERBULLYING_STEPS.map((s) => s.id),
        hint: "Start by not retaliating and end by telling a trusted adult what happened.",
        explanation: CYBERBULLYING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const facts = [
      { before: "Using a digital platform to repeatedly harass or humiliate someone is called", after: ".", answer: "cyberbullying", accepted: ["cyberbullying"] },
      { before: "Controls that limit who can see a person's posts online are called", after: "settings.", answer: "privacy", accepted: ["privacy"] },
      { before: "The lasting trail of information a person leaves behind online is called a digital", after: ".", answer: "footprint", accepted: ["footprint"] },
      { before: "Rules of polite, respectful behaviour when communicating online are called", after: ".", answer: "netiquette", accepted: ["netiquette"] },
      { before: "False or inaccurate information spread online is called", after: ".", answer: "misinformation", accepted: ["misinformation"] },
      { before: "The ability to judge well what is true, wise, or safe online is called", after: ".", answer: "discernment", accepted: ["discernment"] },
      { before: "The amount of time a person spends using a phone or computer screen is called", after: ".", answer: "screen time", accepted: ["screen time"] },
      { before: "The first step when facing cyberbullying is to avoid responding or", after: "against the message.", answer: "retaliating", accepted: ["retaliating"] },
      { before: "After not retaliating, a person facing cyberbullying should save evidence such as a", after: ".", answer: "screenshot", accepted: ["screenshot"] },
      { before: "Being honest and consistent in one's online behaviour, even when unseen, is called", after: "online.", answer: "integrity", accepted: ["integrity"] },
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
      hint: "Think about responsible use of social media and how to respond to cyberbullying.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
