import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const ATTRIBUTES = [
  { text: "Listening carefully to a classmate's opinion before responding", bucket: "desirable" },
  { text: "Being honest even when the truth is uncomfortable", bucket: "desirable" },
  { text: "Showing empathy toward a classmate from a different community", bucket: "desirable" },
  { text: "Being willing to compromise during a disagreement", bucket: "desirable" },
  { text: "Being patient with someone who communicates differently from you", bucket: "desirable" },
  { text: "Mocking a classmate's accent or way of speaking", bucket: "undesirable" },
  { text: "Refusing to work with classmates from a different ethnic group", bucket: "undesirable" },
  { text: "Interrupting others and refusing to consider their point of view", bucket: "undesirable" },
  { text: "Spreading rumours about a classmate from another community", bucket: "undesirable" },
  { text: "Excluding a classmate from group activities because of their background", bucket: "undesirable" },
] as const;

const BUCKET_LABEL: Record<string, string> = { desirable: "Desirable personality attribute", undesirable: "Undesirable personality attribute" };

const INTERPERSONAL_SKILLS = [
  { skill: "Effective communication", description: "Clearly expressing your own ideas while genuinely listening to understand others" },
  { skill: "Negotiation skills", description: "Working with someone who disagrees with you to reach an outcome both sides can accept" },
  { skill: "Assertiveness", description: "Confidently stating your own needs and boundaries without being aggressive or rude" },
  { skill: "Empathy", description: "Recognising and genuinely caring about what another person is feeling" },
] as const;

const DIVERSITY_FACTORS = [
  "Ethnicity, since Kenya has over 40 different ethnic communities with distinct languages and customs",
  "Religion, since Kenyans practise Christianity, Islam, Hinduism, and traditional beliefs, among others",
  "Socio-economic background, since families differ in income, occupation, and living conditions",
  "Ability, since some members of society live with physical, sensory, or learning disabilities",
  "Gender, since men and women may have different experiences and roles in society",
  "Age, since children, youth, and the elderly bring different perspectives and needs",
  "Language, since Kenya has dozens of mother tongues alongside Kiswahili and English",
  "Geographic origin, since people from different counties bring different customs and lifestyles",
] as const;

const RESOLVE_STEPS = [
  { id: "listen", label: "Listen calmly to understand the other person's point of view" },
  { id: "empathise", label: "Try to see the situation from their cultural or personal perspective" },
  { id: "communicate", label: "Communicate your own perspective clearly and respectfully" },
  { id: "agree", label: "Negotiate and agree on a way forward that respects both people" },
];

const SCHOOL_SCENARIOS = [
  {
    situation: "In a Nairobi classroom, Wanjiru and Fatuma disagree over which language to use during a group presentation, since they come from different communities.",
    best: "They calmly discuss the disagreement, listen to each other's reasons, and agree on a fair compromise",
    poor: "Wanjiru insists on her own way and refuses to let Fatuma explain her reasoning",
  },
  {
    situation: "In a Nairobi school, Otieno notices that Chebet, who uses a wheelchair, is left out of a football game during break time.",
    best: "Otieno suggests an inclusive game that everyone, including Chebet, can join and enjoy",
    poor: "Otieno ignores the situation and continues playing as if nothing is wrong",
  },
  {
    situation: "In a Mombasa school, a new pupil who recently moved from another county speaks with an unfamiliar accent, and some classmates start imitating it to make others laugh.",
    best: "A classmate politely asks the others to stop and welcomes the new pupil warmly",
    poor: "The rest of the class joins in imitating the accent along with the others",
  },
  {
    situation: "In a Kisumu school, Achieng and Barasa are assigned to the same project group but hold very different religious beliefs, which comes up during a discussion.",
    best: "They agree to focus on the project and respectfully set aside the disagreement about beliefs",
    poor: "Achieng insists Barasa's beliefs are wrong and refuses to continue working with him",
  },
  {
    situation: "In an Eldoret school, a group of boys refuses to let a capable girl lead their science project group, saying leadership is 'not for girls.'",
    best: "A teacher steps in to explain that leadership ability has nothing to do with gender, and the group elects the most capable leader",
    poor: "The boys are allowed to exclude her from leading without anyone addressing it",
  },
  {
    situation: "In a Nakuru school, a pupil from a wealthier family teases a classmate for wearing an old, mended school uniform.",
    best: "Other classmates speak up to say the teasing is unkind and stand with the pupil being teased",
    poor: "Other classmates laugh along with the teasing instead of stepping in",
  },
] as const;

export const diversityInterpersonalRelationships: Skill = {
  id: "g7-ss-pr-diversity-interpersonal-relationships",
  code: "PR.5",
  strandId: "g7-ss-pr",
  subjectId: "social-studies",
  grade: 7,
  title: "Diversity and interpersonal relationships",
  description: "Factors that determine human diversity in society, interpersonal skills for healthy interaction in a multicultural society, and desirable versus undesirable personality attributes.",
  generate(rng) {
    const branch = randChoice(rng, ["classify", "skill-match", "factor", "resolve-order", "scenario"] as const);

    if (branch === "classify") {
      const chosen = shuffle(rng, ATTRIBUTES).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((a) => a.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each personality attribute as desirable or undesirable for healthy relationships in a multicultural society.",
        items,
        buckets,
        correctBucket,
        hint: "Desirable attributes build trust and respect; undesirable attributes damage relationships.",
        explanation: chosen.map((a) => `"${a.text}" — ${BUCKET_LABEL[a.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "skill-match") {
      const tokens = shuffle(rng, INTERPERSONAL_SKILLS.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, INTERPERSONAL_SKILLS.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of INTERPERSONAL_SKILLS) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each interpersonal skill to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Each skill supports healthy interaction in a different specific way.",
        explanation: INTERPERSONAL_SKILLS.map((s) => `${s.skill}: ${s.description}.`).join(" "),
      };
    }

    if (branch === "factor") {
      const correct = randChoice(rng, DIVERSITY_FACTORS);
      const others = DIVERSITY_FACTORS.filter((f) => f !== correct);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, others, 3);
      return {
        kind: "multiple-choice",
        prompt: "Which of these is a factor that determines human diversity in Kenyan society?",
        choices,
        correctIndex,
        hint: "Think about ethnicity, religion, language, gender, ability, and socio-economic background.",
        explanation: `${correct} — this is one of the factors that determines human diversity in society.`,
      };
    }

    if (branch === "resolve-order") {
      const items = shuffle(rng, RESOLVE_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps for resolving a diversity-related misunderstanding using empathy and communication, in the correct order.",
        instruction: "Drag to reorder from first step to last step.",
        items,
        correctOrder: RESOLVE_STEPS.map((s) => s.id),
        hint: "You must first listen and understand before you can empathise, communicate your own view, and agree on a solution.",
        explanation: RESOLVE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    // scenario
    const s = randChoice(rng, SCHOOL_SCENARIOS);
    const choices = shuffle(rng, [s.best, s.poor]);
    return {
      kind: "multiple-choice",
      prompt: `${s.situation} What is the best response?`,
      choices,
      correctIndex: choices.indexOf(s.best),
      hint: "The best response uses empathy, communication, and respect for the other person.",
      explanation: `${s.best} — this response uses healthy interpersonal skills to handle the situation well.`,
    };
  },
};
