import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import { name, place, sortPrompt, matchPrompt, identifyPrompt, orderPrompt, fillBlankPrompt } from "./g5SciShared";
import type { Skill } from "@/lib/types";

// KICD Grade 5 Science & Technology, sub-strand 1.2 Vertebrates — general characteristics of vertebrates, the
// five main groups (mammals, birds, reptiles, fish, amphibians; structural features only), and their
// importance in the environment. NOTE: the design's own Summary of Strands table mistakenly labels this
// "Invertebrates", but the full sub-strand text, outcomes and rubric all say Vertebrates — see the JSON's
// scopeNotes. See curriculum-reference/grade-5/science-and-technology.json.

const GROUPS = [
  { id: "mammal", label: "Mammal", trait: "Usually has fur or hair covering its body and feeds its young on milk" },
  { id: "bird", label: "Bird", trait: "Has feathers, a beak, and two wings, and almost always lays eggs" },
  { id: "reptile", label: "Reptile", trait: "Has dry, scaly skin and lays eggs with a leathery or hard shell" },
  { id: "fish", label: "Fish", trait: "Has scales and fins, breathes using gills, and lives its whole life in water" },
  { id: "amphibian", label: "Amphibian", trait: "Has smooth, moist skin and typically lives part of its life in water and part on land" },
] as const;

const ANIMAL_GROUPS: { animal: string; group: (typeof GROUPS)[number]["id"] }[] = [
  { animal: "Cow", group: "mammal" },
  { animal: "Goat", group: "mammal" },
  { animal: "Elephant", group: "mammal" },
  { animal: "Giraffe", group: "mammal" },
  { animal: "Rabbit", group: "mammal" },
  { animal: "Chicken", group: "bird" },
  { animal: "Ostrich", group: "bird" },
  { animal: "Weaver bird", group: "bird" },
  { animal: "Dove", group: "bird" },
  { animal: "Crocodile", group: "reptile" },
  { animal: "Monitor lizard", group: "reptile" },
  { animal: "Chameleon", group: "reptile" },
  { animal: "Tortoise", group: "reptile" },
  { animal: "Tilapia", group: "fish" },
  { animal: "Catfish", group: "fish" },
  { animal: "Nile perch", group: "fish" },
  { animal: "Frog", group: "amphibian" },
  { animal: "Toad", group: "amphibian" },
];

const IMPORTANCE_FACTS = [
  { text: "Cattle and goats provide meat and milk for many Kenyan families", category: "food" },
  { text: "Chickens are kept for both eggs and meat", category: "food" },
  { text: "Fish farming provides an important source of protein in many communities", category: "food" },
  { text: "Dogs and cats are commonly kept as companions and for security in homes", category: "companionship" },
  { text: "Oxen and donkeys are used to pull ploughs and carts, helping with farm work", category: "labour" },
  { text: "Wildlife such as elephants, giraffes and lions attract tourists, earning Kenya income", category: "tourism" },
  { text: "National parks protecting vertebrates create jobs for guides, rangers and hotel staff", category: "tourism" },
  { text: "Insect-eating birds and frogs help control pest populations that would otherwise damage crops", category: "pest-control" },
  { text: "Selling livestock such as cattle and goats is a major source of income for many farmers", category: "economy" },
  { text: "Sheep provide wool that is used to make clothing", category: "economy" },
  { text: "Vertebrates such as fish and birds are part of food chains that keep an ecosystem balanced", category: "ecology" },
  { text: "Frogs help control the numbers of mosquitoes and other insects near water sources", category: "pest-control" },
] as const;

const PORTFOLIO_STEPS = [
  { id: "p1", label: "Search print and non-print material for the general characteristics of vertebrates" },
  { id: "p2", label: "Explore the school compound and nearby environment to observe vertebrates" },
  { id: "p3", label: "Discuss with peers the characteristics of different vertebrate groups" },
  { id: "p4", label: "Study the main characteristics that separate one group from another" },
  { id: "p5", label: "Put together a portfolio of the different vertebrate groups found in the locality" },
] as const;

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finds an animal near a pond in ${place(rng)} with smooth, moist skin, and notices it lays its eggs in the water while also spending time on land. Which vertebrate group does this animal most likely belong to?`,
      correct: "Amphibian",
      wrong: ["Fish", "Reptile", "Bird"],
      explanation: "Smooth, moist skin combined with living part of its life in water and part on land is the classic sign of an amphibian, such as a frog.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} keeps oxen specifically to pull a plough when preparing land for planting. Which importance of vertebrates does this best show?`,
    correct: "Vertebrates providing labour to help with farm work",
    wrong: ["Vertebrates providing income from tourism only", "Vertebrates used only as pets", "Vertebrates used only for their eggs"],
    explanation: "Oxen pulling a plough is a clear example of vertebrates being used for labour, distinct from food, tourism or companionship.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} examines an animal in ${place(rng)} covered in dry, scaly skin that lays leathery-shelled eggs on a sandy riverbank. What vertebrate group is this animal in?`,
      correct: "Reptile",
      wrong: ["Amphibian", "Mammal", "Bird"],
      explanation: "Dry, scaly skin and leathery-shelled eggs are structural features of reptiles, such as a crocodile.",
    };
  },
  (rng) => ({
    prompt: `A safari lodge near ${place(rng)} employs local guides and rangers because tourists travel there to see elephants, giraffes and lions in the wild. Which importance of vertebrates does this depend on?`,
    correct: "Vertebrates attracting tourism, which creates jobs and income",
    wrong: ["Vertebrates providing wool for clothing", "Vertebrates being used only as farm labour", "Vertebrates having no economic importance"],
    explanation: "Wildlife tourism, built around vertebrates such as elephants and lions, is a major source of jobs and income in many parts of Kenya.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} observes an animal in a fish pond in ${place(rng)} that breathes using gills and never leaves the water its entire life. Which vertebrate group is this?`,
      correct: "Fish",
      wrong: ["Amphibian", "Reptile", "Mammal"],
      explanation: "Breathing through gills and living entirely in water throughout its life are structural features unique to fish among vertebrates.",
    };
  },
  (rng) => ({
    prompt: `A farmer in ${place(rng)} notices that a field with many insect-eating birds has fewer crop-damaging insects than a nearby field with very few birds. What does this suggest about the importance of vertebrates here?`,
    correct: "The birds are helping control pest insect populations that would otherwise damage the crops",
    wrong: ["Birds have no effect on insect populations in a field", "The birds are actually attracting more pest insects to the field", "Insect numbers are unrelated to how many birds visit a field"],
    explanation: "Insect-eating birds are a natural form of pest control, reducing the number of crop-damaging insects in a field.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sets up camera traps in a forest near ${place(rng)} for a school project and photographs an animal with feathers and a beak building a nest in a tree. What vertebrate group is this?`,
      correct: "Bird",
      wrong: ["Reptile", "Mammal", "Fish"],
      explanation: "Feathers and a beak are structural features unique to birds among vertebrates.",
    };
  },
  (rng) => ({
    prompt: `A household in ${place(rng)} sells three goats at the local livestock market to raise money for school fees. Which importance of vertebrates does this best show?`,
    correct: "Vertebrates as a source of income through the sale of livestock",
    wrong: ["Vertebrates used only for pest control", "Vertebrates providing labour by pulling ploughs", "Vertebrates used only for companionship"],
    explanation: "Selling livestock such as goats for money is an economic importance of vertebrates, separate from their use as food or labour.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} compares two animals in ${place(rng)}: one feeds its young on milk and has fur, while the other hatches from a leathery egg and has dry scales. Which group does the milk-feeding, furry animal belong to?`,
      correct: "Mammal",
      wrong: ["Reptile", "Amphibian", "Fish"],
      explanation: "Feeding young on milk and having fur are structural features that define mammals among vertebrate groups.",
    };
  },
  (rng) => ({
    prompt: `A pond near a school in ${place(rng)} has many frogs, and teachers notice far fewer mosquitoes breeding there compared to a pond without frogs. What is the likely explanation?`,
    correct: "Frogs help control mosquito numbers by feeding on them and their larvae near water",
    wrong: ["Frogs have no effect on mosquito populations", "Frogs attract more mosquitoes to breed in the pond", "Mosquito numbers are unrelated to the presence of frogs"],
    explanation: "Amphibians such as frogs feed on insects including mosquitoes, helping to naturally control their numbers near water sources.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} keeps a dog at home in ${place(rng)} mainly for company and to help guard the compound at night. Which importance of vertebrates does this represent?`,
      correct: "Vertebrates providing companionship and security",
      wrong: ["Vertebrates providing wool for clothing", "Vertebrates used only for tourism", "Vertebrates used only as food"],
      explanation: "Keeping an animal such as a dog for company and security is a companionship-related importance of vertebrates.",
    };
  },
  (rng) => ({
    prompt: `A shepherd in ${place(rng)} shears wool from a flock of sheep once a year to sell to a textile trader. Which importance of vertebrates does this depend on?`,
    correct: "Vertebrates as a source of raw material (wool) for the economy",
    wrong: ["Vertebrates as a source of pest control only", "Vertebrates used only for tourism", "Vertebrates having no importance to the economy"],
    explanation: "Sheep provide wool, a raw material sold for income — an economic importance of vertebrates beyond meat and milk.",
  }),
];

export const vertebrates: Skill = {
  id: "g5-sci-lte-vertebrates",
  code: "LTE.2",
  subjectId: "science",
  strandId: "g5-sci-lte",
  grade: 5,
  title: "Vertebrates",
  description: "General characteristics of vertebrates, the five main groups (mammals, birds, reptiles, fish, amphibians) with their structural features, and the importance of vertebrates in the environment.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["identify-group", "animal-categorize", "trait-match", "importance-categorize", "portfolio-order", "reasoning", "fill-blank"] as const
    );

    if (branch === "identify-group") {
      const target = randChoice(rng, GROUPS);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.label, GROUPS.filter((g) => g.id !== target.id).map((g) => g.label), 3);
      return {
        kind: "multiple-choice",
        prompt: identifyPrompt(rng, "vertebrate group"),
        visual: { type: "vertebrate-group", group: target.id },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This animal is a ${target.label.toLowerCase()}. ${target.trait}.`,
      };
    }

    if (branch === "animal-categorize") {
      const chosenGroups = shuffle(rng, [...GROUPS]).slice(0, 4).map((g) => g.id);
      const pool = ANIMAL_GROUPS.filter((a) => chosenGroups.includes(a.group));
      const chosen = shuffle(rng, pool).slice(0, 8);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.animal }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.group));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which vertebrate group it belongs to"),
        items,
        buckets: chosenGroups.map((id) => ({ id, label: GROUPS.find((g) => g.id === id)!.label })),
        correctBucket,
        hint: "Think about the animal's skin/covering, how it breathes, and how its young are born.",
        explanation: chosen.map((a) => `${a.animal} is a ${GROUPS.find((g) => g.id === a.group)!.label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "trait-match") {
      const tokens = shuffle(rng, GROUPS.map((g) => ({ id: g.id, label: g.label })));
      const targets = shuffle(rng, GROUPS.map((g) => ({ id: g.id, label: g.trait })));
      const correctMap: Record<string, string> = {};
      for (const g of GROUPS) correctMap[g.id] = g.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "vertebrate group to its structural feature"),
        tokens,
        targets,
        correctMap,
        hint: "Think about skin/body covering, how the animal breathes, and how its young are fed or hatched.",
        explanation: GROUPS.map((g) => `${g.label} — ${g.trait}.`).join(" "),
      };
    }

    if (branch === "importance-categorize") {
      const chosen = shuffle(rng, IMPORTANCE_FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `i${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`i${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "the kind of importance of vertebrates it describes"),
        items,
        buckets: [
          { id: "food", label: "Food" },
          { id: "companionship", label: "Companionship" },
          { id: "labour", label: "Labour" },
          { id: "tourism", label: "Tourism" },
          { id: "pest-control", label: "Pest control" },
          { id: "economy", label: "Economy" },
          { id: "ecology", label: "Ecological balance" },
        ],
        correctBucket,
        hint: "Think about whether the fact is about eating, companionship, work, tourists, controlling pests, earning money, or the food chain.",
        explanation: chosen.map((f) => `"${f.text}" is about ${f.category.replace("-", " ")}.`).join(" "),
      };
    }

    if (branch === "portfolio-order") {
      const shuffled = shuffle(rng, PORTFOLIO_STEPS);
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps of building a class portfolio on vertebrates"),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PORTFOLIO_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Research first, then observe locally, then discuss and study, then put the portfolio together.",
        explanation: "Correct order: " + PORTFOLIO_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "An animal covered in fur or hair that feeds its young on milk is a ", after: ".", correctAnswer: "mammal" },
      { before: "An animal with feathers, a beak and two wings is a ", after: ".", correctAnswer: "bird" },
      { before: "An animal with dry, scaly skin that lays leathery-shelled eggs is a ", after: ".", correctAnswer: "reptile" },
      { before: "An animal with scales and fins that breathes using gills is a ", after: ".", correctAnswer: "fish" },
      { before: "An animal with smooth, moist skin that lives part of its life in water and part on land is an ", after: ".", correctAnswer: "amphibian" },
      { before: "Oxen and donkeys help farmers by providing ", after: " to pull ploughs and carts.", correctAnswer: "labour" },
      { before: "Elephants, giraffes and lions attract visitors, an importance of vertebrates known as ", after: ".", correctAnswer: "tourism" },
      { before: "Insect-eating birds and frogs help control ", after: " that would otherwise damage crops.", correctAnswer: "pests", alsoAccept: ["insects"] },
      { before: "Sheep provide wool, which is used to make ", after: ".", correctAnswer: "clothing" },
      { before: "Selling cattle and goats is a source of ", after: " for many Kenyan farmers.", correctAnswer: "income", alsoAccept: ["money"] },
      { before: "Fish farming is an important source of ", after: " in many Kenyan communities.", correctAnswer: "protein", alsoAccept: ["food"] },
      { before: "Chickens are kept for both meat and ", after: ".", correctAnswer: "eggs" },
      { before: "Dogs are commonly kept for company and for guarding the home, an example of ", after: ".", correctAnswer: "companionship" },
      { before: "Vertebrates such as fish and birds form part of food chains that keep an ecosystem in ", after: ".", correctAnswer: "balance" },
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
      hint: "Think about the five vertebrate groups and why vertebrates matter to people and nature.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
