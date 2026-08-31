import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, orderPrompt, fillBlankPrompt } from "./g5AgShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Agriculture, sub-strand 3.1 Good Grooming Practices — the 2 named aspects (dressing and
// etiquette) appropriate to different occasions/activities. See curriculum-reference/grade-5/agriculture.json.

const OCCASIONS = [
  { id: "school", label: "Going to school", dressing: "A clean, properly ironed school uniform", etiquette: "Greeting teachers and peers politely, arriving on time" },
  { id: "sports", label: "Playing sports", dressing: "Comfortable, appropriate sportswear and shoes", etiquette: "Playing fairly, congratulating opponents, following the rules" },
  { id: "worship", label: "Attending a place of worship", dressing: "Neat, modest, respectful clothing", etiquette: "Being quiet and respectful, following the customs of the place" },
  { id: "farmwork", label: "Doing farm or garden work", dressing: "Old, sturdy clothing that can get dirty, with appropriate footwear", etiquette: "Working carefully and safely, respecting shared tools and space" },
  { id: "visit", label: "Visiting an elder's or a guest's home", dressing: "Clean, presentable, respectful clothing", etiquette: "Greeting properly, waiting to be offered a seat, speaking politely" },
  { id: "ceremony", label: "Attending a formal ceremony or celebration", dressing: "Smart, formal or best clothing kept for special occasions", etiquette: "Behaving respectfully, following the programme, not being disruptive" },
] as const;

const GROOMING_PRACTICES = [
  { text: "Bathing regularly and keeping the body clean", good: true },
  { text: "Wearing clean clothes suited to the day's activity", good: true },
  { text: "Combing hair neatly before leaving the house", good: true },
  { text: "Trimming and keeping fingernails clean", good: true },
  { text: "Greeting people politely and speaking respectfully", good: true },
  { text: "Wearing the same unwashed clothes for many days in a row", good: false },
  { text: "Wearing sportswear to a formal ceremony", good: false },
  { text: "Interrupting adults rudely while they are speaking", good: false },
  { text: "Ignoring greetings from elders or visitors", good: false },
] as const;

const READY_STEPS = [
  { id: "g1", label: "Consider what occasion or activity is coming up" },
  { id: "g2", label: "Choose clothing that suits that occasion" },
  { id: "g3", label: "Bathe and groom the body (hair, nails, general cleanliness)" },
  { id: "g4", label: "Put on the chosen clean clothing neatly" },
  { id: "g5", label: "Practise the etiquette appropriate to the occasion" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is invited to a formal wedding ceremony and wears old, dirty farm clothes instead of smart clothing. What good grooming practice is being ignored?`,
      correct: "Dressing appropriately for the occasion",
      wrong: ["Nothing is wrong; any clothing suits every occasion equally", "Etiquette, since clothing choice has nothing to do with etiquette", "This has no connection to good grooming at all"],
      explanation: "Good grooming includes dressing appropriately for the specific occasion — old farm clothes are unsuited to a formal ceremony.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} greets a visiting elder politely, offers them a seat, and speaks respectfully throughout the visit. What aspect of good grooming is being shown?`,
    correct: "Etiquette",
    wrong: ["Dressing", "Neither aspect — this is unrelated to good grooming", "Both aspects equally, with dressing being the main one"],
    explanation: "Polite, respectful behaviour toward a guest is etiquette — one of the two named aspects of good grooming alongside dressing.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} wears comfortable sportswear and proper sports shoes for a football match at school. Why is this appropriate?`,
      correct: "Sportswear suits the physical activity of playing sports, unlike formal or delicate clothing",
      wrong: ["Any clothing is equally suitable for playing sports", "Formal clothing would actually work better for sports", "Clothing choice has no connection to the activity being done"],
      explanation: "Good grooming involves choosing clothing suited to the specific activity — sportswear is appropriate and practical for playing sports.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} wears the same unwashed uniform for an entire week without washing it. What good grooming principle is being neglected?`,
    correct: "Keeping clothing clean as a daily health habit",
    wrong: ["Nothing is being neglected, since uniforms never need washing", "This shows excellent good grooming practice", "Clothing cleanliness has no connection to good grooming"],
    explanation: "Wearing clean clothes is a basic good grooming habit — repeatedly wearing unwashed clothing goes against this.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} interrupts an adult rudely while they are speaking during a family gathering. What does this show about ${who}'s etiquette?`,
      correct: "Poor etiquette, since interrupting rudely is disrespectful",
      wrong: ["Excellent etiquette, since speaking up quickly is always polite", "This has nothing to do with etiquette at all", "Good etiquette, as long as the interruption is brief"],
      explanation: "Interrupting others rudely is a sign of poor etiquette — good grooming includes respectful, polite behaviour toward others.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} prepares for a day of garden work by choosing old but clean clothes that can get dirty, rather than a school uniform. Why is this a sensible grooming choice?`,
    correct: "It suits the activity, protecting better clothing while still being clean and appropriate",
    wrong: ["It is never sensible to wear old clothes for any activity", "School uniforms are always the best choice for garden work", "Clothing choice makes no difference for farm work"],
    explanation: "Choosing sturdy, appropriate clothing for a messy activity like garden work — while still keeping it clean — reflects good grooming judgement.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} keeps fingernails trimmed and clean, and combs their hair neatly every morning before school. What benefit does this daily habit bring, according to this sub-strand?`,
      correct: "It promotes personal hygiene and health as a daily habit",
      wrong: ["It has no real benefit at all", "It is only about appearance, with no connection to hygiene", "This habit is unrelated to health"],
      explanation: "This sub-strand explicitly frames good grooming as a daily health habit that promotes personal hygiene, not just appearance.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} dresses modestly and behaves quietly and respectfully when attending a religious service. Which two aspects of good grooming are both being demonstrated here?`,
    correct: "Both dressing (modest clothing) and etiquette (quiet, respectful behaviour)",
    wrong: ["Only dressing, since behaviour is unrelated to grooming", "Only etiquette, since clothing is unrelated to grooming", "Neither aspect is being shown here"],
    explanation: "Modest dress and respectful behaviour together demonstrate both named aspects of good grooming — dressing and etiquette — matched to the occasion.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} models different ways of dressing and behaving for different activities during a class activity in ${place(rng)}. Why does the class practise this rather than learning just one fixed way to dress and behave?`,
      correct: "Because appropriate dressing and etiquette change depending on the occasion or activity",
      wrong: ["Because there is actually only one correct way to dress and behave for everything", "Because dressing and etiquette have nothing to do with each other", "Because this practice has no real educational purpose"],
      explanation: "The sub-strand explicitly covers dressing and etiquette 'for different occasions' — appropriate grooming changes with the activity, which is why practising variety matters.",
    };
  },
  (rng) => ({
    prompt: `A family in ${place(rng)} teaches their children to bathe daily, wear clean clothes, and greet people respectfully, even when no special occasion is happening. What does this show about good grooming?`,
    correct: "Good grooming is a daily habit, not something practised only for special occasions",
    wrong: ["Good grooming only matters for special occasions, never daily life", "There is no real benefit to daily grooming habits", "Grooming habits should only be taught to adults, not children"],
    explanation: "This sub-strand frames good grooming as a daily health habit — practised every day, not reserved only for special occasions.",
  }),
];

export const goodGroomingPractices: Skill = {
  id: "g5-ag-hygiene-good-grooming-practices",
  code: "HP.1",
  subjectId: "agriculture-nutrition",
  strandId: "g5-ag-hygiene",
  grade: 5,
  title: "Good grooming practices",
  description: "Good grooming as a daily health habit, focused on the two named aspects — appropriate dressing and etiquette — for different occasions and activities.",
  generate(rng) {
    const branch = randChoice(rng, ["occasion-dressing-match", "practice-categorize", "getting-ready-order", "reasoning", "fill-blank"] as const);

    if (branch === "occasion-dressing-match") {
      const chosen = shuffle(rng, OCCASIONS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((o) => ({ id: o.id, label: o.label })));
      const targets = shuffle(rng, chosen.map((o) => ({ id: o.id, label: o.dressing })));
      const correctMap: Record<string, string> = {};
      for (const o of chosen) correctMap[o.id] = o.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "occasion or activity to the dressing that best suits it"),
        tokens,
        targets,
        correctMap,
        hint: "Think about what kind of clothing genuinely fits each activity — practicality, formality and respect.",
        explanation: chosen.map((o) => `${o.label} → ${o.dressing}.`).join(" "),
      };
    }

    if (branch === "practice-categorize") {
      const chosen = shuffle(rng, GROOMING_PRACTICES).slice(0, 7);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.good ? "good" : "poor"));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether it is good grooming practice or poor grooming practice"),
        items,
        buckets: [
          { id: "good", label: "Good grooming practice" },
          { id: "poor", label: "Poor grooming practice" },
        ],
        correctBucket,
        hint: "Think about cleanliness, appropriate dressing, and respectful behaviour.",
        explanation: chosen.map((p) => `"${p.text}" is ${p.good ? "good" : "poor"} grooming practice.`).join(" "),
      };
    }

    if (branch === "getting-ready-order") {
      const shuffled = shuffle(rng, READY_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of getting ready appropriately for an occasion"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: READY_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Think about the occasion first, then get clean and dressed, then apply the right etiquette.",
        explanation: "Correct order: " + READY_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "The two named aspects of good grooming are dressing and ", after: ".", correctAnswer: "etiquette" },
      { before: "Good grooming is described as a daily ", after: " habit.", correctAnswer: "health" },
      { before: "Choosing clothing that suits the occasion is part of good ", after: ".", correctAnswer: "dressing" },
      { before: "Greeting people politely and behaving respectfully is part of good ", after: ".", correctAnswer: "etiquette" },
      { before: "Wearing sportswear is most appropriate when ", after: ".", correctAnswer: "playing sports", alsoAccept: ["doing sports", "exercising"] },
      { before: "Wearing smart or formal clothing suits a ", after: " occasion.", correctAnswer: "formal" },
      { before: "Interrupting people rudely while they speak is a sign of poor ", after: ".", correctAnswer: "etiquette" },
      { before: "Bathing regularly and wearing clean clothes are basic ", after: " habits.", correctAnswer: "grooming" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    const alsoAccept: readonly string[] = "alsoAccept" in fb ? fb.alsoAccept : [];
    return {
      kind: "fill-blank",
      prompt: fillBlankPrompt(rng),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer, ...alsoAccept],
      inputMode: "text",
      hint: "Think about dressing and etiquette suited to different occasions.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
