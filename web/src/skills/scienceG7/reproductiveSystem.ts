import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

interface ReproPart {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
  fn: string;
}

const MALE_PARTS: ReproPart[] = [
  { id: "testis", label: "Testis", xPercent: 25.6, yPercent: 70.6, fn: "Produces sperm (the male sex cells) and the hormone testosterone." },
  { id: "penis", label: "Penis", xPercent: 72.2, yPercent: 58.8, fn: "The external organ through which sperm and urine leave the male body." },
  { id: "urethra-m", label: "Urethra", xPercent: 72.2, yPercent: 65.9, fn: "The tube inside the penis that carries sperm and urine out of the body." },
];

const FEMALE_PARTS: ReproPart[] = [
  { id: "ovary", label: "Ovary", xPercent: 10, yPercent: 37.6, fn: "Produces eggs (the female sex cells) and hormones such as oestrogen." },
  { id: "oviduct", label: "Oviduct (fallopian tube)", xPercent: 22.2, yPercent: 24.7, fn: "Carries the egg from the ovary towards the uterus — fertilisation usually happens here." },
  { id: "uterus", label: "Uterus (womb)", xPercent: 50, yPercent: 26.5, fn: "The organ where a fertilised egg implants and a baby develops during pregnancy." },
  { id: "cervix", label: "Cervix", xPercent: 50, yPercent: 47.1, fn: "The narrow neck connecting the uterus to the vagina." },
  { id: "vagina", label: "Vagina", xPercent: 50, yPercent: 70.6, fn: "The muscular canal (birth canal) leading from the cervix to the outside of the body." },
];

const ADOLESCENCE_ITEMS = [
  { text: "Growth of body hair in new places", bucket: "physical" },
  { text: "A boy's voice becoming deeper", bucket: "physical" },
  { text: "A girl beginning to menstruate", bucket: "physical" },
  { text: "A sudden growth spurt in height", bucket: "physical" },
  { text: "Broadening of a boy's shoulders and chest", bucket: "physical" },
  { text: "Development of breasts in a girl", bucket: "physical" },
  { text: "Increased activity of skin oil glands, sometimes causing acne", bucket: "physical" },
  { text: "Wanting more independence from parents or guardians", bucket: "social" },
  { text: "Feeling shy or self-conscious about body changes", bucket: "social" },
  { text: "Experiencing stronger emotions or mood swings", bucket: "social" },
  { text: "Placing more importance on friendships with peers", bucket: "social" },
  { text: "Becoming more curious about romantic relationships", bucket: "social" },
] as const;

const KNOWLEDGE_QUESTIONS = [
  {
    prompt: "Why is it helpful for a learner going through adolescence to talk to a trusted adult about the changes they notice?",
    correct: "It helps them understand that the changes are normal and get guidance on how to cope with them.",
    wrong: ["It stops the changes from happening.", "It has no real benefit.", "It is only useful for adults, not learners."],
    explanation: "Talking to a trusted parent, guardian or counsellor helps a learner understand that physical, social and emotional changes during adolescence are a normal part of growing up, and gives them guidance for coping well.",
  },
  {
    prompt: "Which of these is a healthy way to manage the emotional ups and downs of adolescence?",
    correct: "Talking about how you feel with a trusted parent, guardian or counsellor.",
    wrong: ["Keeping every feeling completely hidden from everyone.", "Avoiding all friends and family members.", "Ignoring the changes and hoping they disappear."],
    explanation: "Sharing feelings with someone trustworthy is a healthy coping strategy — it is far more effective than hiding emotions or withdrawing from others.",
  },
  {
    prompt: "A learner notices their voice cracking and changing pitch during adolescence. What is the best way to understand this?",
    correct: "It is a normal physical change caused by hormones, and it settles down as the body adjusts.",
    wrong: ["It is a sign of illness that needs urgent treatment.", "It means the learner is developing more slowly than normal.", "It only happens to learners who are unwell."],
    explanation: "Voice changes during adolescence are a normal hormonal effect on the growing voice box — not a sign of illness or slow development.",
  },
  {
    prompt: "Why do adolescents often experience sudden mood swings that they did not have as younger children?",
    correct: "Hormonal changes during adolescence affect emotions, alongside the many physical and social changes happening at once.",
    wrong: ["It means something is seriously wrong with them.", "It only happens to learners who do not study enough.", "Mood swings have no real biological cause."],
    explanation: "Adolescence involves genuine hormonal shifts that affect emotions, on top of physical and social changes — understanding this helps a learner (and those around them) respond with patience, not alarm.",
  },
  {
    prompt: "A learner feels embarrassed about their changing body and starts avoiding physical education lessons. What is the most helpful response?",
    correct: "Reassure them that body changes during adolescence are normal and encourage them to talk to a trusted adult if the feeling continues.",
    wrong: ["Tell them to just stop worrying about it and say nothing further.", "Agree that they should avoid all physical activity from now on.", "Ignore the issue since it will resolve on its own without any support."],
    explanation: "Self-consciousness about body changes is common during adolescence — acknowledging it as normal and offering ongoing support helps far more than dismissing or ignoring it.",
  },
  {
    prompt: "Why might a learner start valuing friendships with peers more than they did in earlier childhood?",
    correct: "Building independence and identity outside the family is a normal social change of adolescence.",
    wrong: ["It means they no longer care about their family at all.", "It only happens to learners with behavioural problems.", "It has no connection to the changes of adolescence."],
    explanation: "Seeking more independence and peer connection is a normal, expected social change during adolescence, not a sign of rejecting family.",
  },
  {
    prompt: "A girl begins menstruating for the first time and feels anxious about it. What is the most helpful first step?",
    correct: "Talk to a trusted adult, such as a parent, guardian or school counsellor, who can explain what to expect and how to manage it.",
    wrong: ["Hide it from everyone and try to manage alone.", "Assume something is medically wrong and panic.", "Wait several months before telling anyone."],
    explanation: "Menstruation is a normal part of physical development — a trusted adult can explain what to expect and provide practical guidance, which reduces anxiety far more than hiding it.",
  },
] as const;

export const reproductiveSystem: Skill = {
  id: "g7-sci-lte-reproductive",
  code: "LTE.1",
  subjectId: "science",
  strandId: "g7-sci-lte",
  grade: 7,
  title: "The human reproductive system",
  description: "Parts and functions of the male and female reproductive systems, and the physical, social and emotional changes of adolescence.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-part", "function-match", "adolescence-sort", "knowledge"] as const);

    if (branch === "identify-part") {
      const sex = randChoice(rng, ["male", "female"] as const);
      const parts = sex === "male" ? MALE_PARTS : FEMALE_PARTS;
      const target = randChoice(rng, parts);
      const otherLabels = parts.filter((p) => p.id !== target.id).map((p) => p.label);
      const decoyPool = (sex === "male" ? FEMALE_PARTS : MALE_PARTS).map((p) => p.label);
      const choices = shuffle(rng, [target.label, ...shuffle(rng, [...otherLabels, ...decoyPool]).slice(0, 3)]);
      return {
        kind: "hotspot",
        prompt: `Click the pin, then name the labelled part of the ${sex} reproductive system.`,
        diagram: { type: "reproductive-system", sex },
        spots: parts.map(({ id, xPercent, yPercent, label }) => ({ id, xPercent, yPercent, label })),
        askId: target.id,
        choices,
        correctLabel: target.label,
        hint: "Think about what job each part does in reproduction.",
        explanation: `${target.label} — ${target.fn}`,
      };
    }

    if (branch === "function-match") {
      const sex = randChoice(rng, ["male", "female"] as const);
      const parts = sex === "male" ? MALE_PARTS : shuffle(rng, [...FEMALE_PARTS]).slice(0, 4);
      const tokens = shuffle(rng, parts.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, parts.map((p) => ({ id: p.id, label: p.fn })));
      const correctMap: Record<string, string> = {};
      for (const p of parts) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: `Match each part of the ${sex} reproductive system to its function.`,
        tokens,
        targets,
        correctMap,
        hint: "Think about producing sex cells, carrying them, or where a baby develops.",
        explanation: parts.map((p) => `${p.label} — ${p.fn}`).join(" "),
      };
    }

    if (branch === "adolescence-sort") {
      const chosen = shuffle(rng, ADOLESCENCE_ITEMS).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `a${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`a${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each change of adolescence as physical, or social/emotional.",
        items,
        buckets: [
          { id: "physical", label: "Physical change" },
          { id: "social", label: "Social/emotional change" },
        ],
        correctBucket,
        hint: "A physical change affects the body; a social/emotional change affects feelings or relationships.",
        explanation: chosen.map((c) => `"${c.text}" is a ${c.bucket === "physical" ? "physical" : "social/emotional"} change.`).join(" "),
      };
    }

    const q = randChoice(rng, KNOWLEDGE_QUESTIONS);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      explanation: q.explanation,
    };
  },
};
