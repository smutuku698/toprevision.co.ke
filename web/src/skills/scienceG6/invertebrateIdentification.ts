import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Science & Technology, sub-strand 1.2 Invertebrates — identification, safety precautions and
// general characteristics half of the sub-strand (the economic-importance half is a separate, deeper skill:
// invertebrateImportance.ts — see CURRICULUM-MINING-GUIDE.md's "branch into smaller skills" pattern). The
// design names 6 invertebrate groups (insects; spiders/ticks/mites; millipedes/centipedes; snails/slugs;
// worms; sea invertebrates — octopus, starfish, crabs); scientific names are explicitly excluded. 2026-08-16
// content-depth audit found ticks and mites were only ever mentioned bundled inside the "spiders, ticks and
// mites" group label, never given their own identification branch/visual — fixed by adding both as standalone
// INVERTEBRATES entries with a dedicated `tick`/`mite` VisualSpec kind (see types.ts, Visual.tsx).

const INVERTEBRATES = [
  { id: "insect", visual: "insect", label: "Insect", group: "Insects", feature: "Has 6 legs and a body divided into three parts: head, thorax and abdomen", example: "housefly, grasshopper, ant" },
  { id: "spider", visual: "spider", label: "Spider", group: "Spiders, ticks and mites", feature: "Has 8 legs and a body divided into two parts, with no antennae", example: "garden spider" },
  { id: "tick", visual: "tick", label: "Tick", group: "Spiders, ticks and mites", feature: "Has 8 legs like a spider, but a single fused oval body that attaches to an animal's or person's skin to feed on blood", example: "a tick found on a dog or cow after time outdoors" },
  { id: "mite", visual: "mite", label: "Mite", group: "Spiders, ticks and mites", feature: "An even smaller relative of the spider and tick, with 8 legs, often too tiny to see clearly without a magnifying lens", example: "mites found on stored grain or in household dust" },
  { id: "millipede-centipede", visual: "millipede-centipede", label: "Millipede or centipede", group: "Millipedes and centipedes", feature: "Has a long, segmented body with many pairs of legs, one segment after another", example: "millipede curling up when touched" },
  { id: "snail-slug", visual: "snail-slug", label: "Snail", group: "Snails and slugs", feature: "Has a soft body and two feelers, and (unlike a slug) carries a coiled shell on its back", example: "garden snail" },
  { id: "worm", visual: "worm", label: "Earthworm", group: "Worms", feature: "Has a long, soft, segmented tube-shaped body with no legs", example: "earthworm in moist soil" },
  { id: "crab", visual: "crab", label: "Crab", group: "Sea invertebrates", feature: "Has a hard shell, ten legs and a pair of large pincer claws", example: "shore crab" },
  { id: "starfish", visual: "starfish", label: "Starfish", group: "Sea invertebrates", feature: "Has a flat, star-shaped body, usually with five arms", example: "starfish on a rocky shore" },
  { id: "octopus", visual: "octopus", label: "Octopus", group: "Sea invertebrates", feature: "Has a soft, rounded body and eight long tentacles", example: "octopus hiding among rocks" },
] as const;

const CHARACTERISTIC_FACTS = [
  { text: "Has no backbone inside its body", group: "all" },
  { text: "Has 6 legs and 3 body parts", group: "insect" },
  { text: "Has 8 legs and a two-part body, with no antennae", group: "spider" },
  { text: "Has 8 legs but a single fused oval body, and attaches to skin to feed on blood", group: "tick" },
  { text: "Is closely related to spiders and ticks, but is often too tiny to see clearly without magnification", group: "mite" },
  { text: "Has a long, segmented body with many pairs of legs", group: "millipede-centipede" },
  { text: "Curls into a tight coil when touched, as a defence", group: "millipede-centipede" },
  { text: "Carries a hard, coiled shell on its back", group: "snail-slug" },
  { text: "Has two feelers used to sense its surroundings", group: "snail-slug" },
  { text: "Leaves a trail of slime as it moves", group: "snail-slug" },
  { text: "Has a soft, tube-like, segmented body with no legs at all", group: "worm" },
  { text: "Helps loosen and aerate soil as it burrows through it", group: "worm" },
  { text: "Has ten legs, including a pair of large pincer claws", group: "crab" },
  { text: "Has a hard outer shell that protects its soft body", group: "crab" },
  { text: "Has a flat, star-shaped body, usually with five arms", group: "starfish" },
  { text: "Can regrow an arm if one is lost", group: "starfish" },
  { text: "Has eight long, flexible tentacles with suckers", group: "octopus" },
  { text: "Can change the colour of its skin to hide from predators", group: "octopus" },
] as const;

// Leg counts used only for the ordering branch below — each value is unambiguous and countable (unlike
// millipedes/centipedes, whose leg count varies too much by species to give a single fair answer).
const LEG_COUNT_ORDER = [
  { id: "worm", label: "Earthworm", legs: 0 },
  { id: "insect", label: "Insect", legs: 6 },
  { id: "spider", label: "Spider", legs: 8 },
  { id: "crab", label: "Crab", legs: 10 },
] as const;

const SAFETY_SCENARIOS = [
  { desc: "A learner picks up an unfamiliar spider bare-handed to look at it closely.", isSafe: false, why: "Some spiders can bite; unfamiliar invertebrates should be observed without handling them directly, or handled only with guidance and appropriate care." },
  { desc: "A learner uses a stick or leaf to gently move a millipede for closer observation instead of touching it with bare hands.", isSafe: true, why: "Using a tool to observe an invertebrate avoids direct skin contact, which is safer for both the learner and the animal." },
  { desc: "A learner squeezes a snail's shell tightly to see how strong it is.", isSafe: false, why: "Handling invertebrates roughly can injure or kill them; observation should be gentle and respectful of the animal's welfare." },
  { desc: "After handling invertebrates during a nature walk, a learner washes their hands with soap before eating lunch.", isSafe: true, why: "Washing hands after touching animals removes germs and reduces the risk of illness, especially before eating." },
  { desc: "A learner disturbs a tick found on a dog and picks it off with bare fingers without any protection.", isSafe: false, why: "Ticks and mites can carry disease-causing organisms; they should be removed carefully using appropriate tools, not bare fingers." },
  { desc: "A learner returns invertebrates found during an outdoor activity to the same place they were found, rather than keeping them.", isSafe: true, why: "Returning wild invertebrates to their natural habitat protects the animals and keeps the local ecosystem undisturbed." },
] as const;

const KENYAN_PLACES = ["Kisii", "Nyahururu", "Voi", "Kericho", "Garissa", "Malindi", "Nanyuki", "Homa Bay", "Naivasha", "Kapenguria", "Wote", "Isiolo"] as const;
const KENYAN_NAMES = ["Wanjiku", "Omondi", "Amani", "Ruth", "Salim", "Neema", "Kelvin", "Atieno", "Musa", "Faith", "Dennis", "Zawadi"] as const;
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }

interface ScenarioMC { prompt: string; correct: string; wrong: string[]; explanation: string }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finds an animal in the school garden in ${place(rng)} with a long, segmented body, no legs, and a soft, moist skin, burrowing through wet soil. What invertebrate is this?`,
      correct: "Earthworm",
      wrong: ["Millipede", "Snail", "Spider"],
      explanation: "A soft, segmented, legless body burrowing through moist soil is the classic identifying feature of an earthworm.",
    };
  },
  (rng) => ({
    prompt: `While exploring the shoreline near ${place(rng)}, ${name(rng)} counts the legs on an animal and finds exactly 8, with no antennae and a two-part body. What group does it belong to?`,
    correct: "Spiders, ticks and mites",
    wrong: ["Insects", "Millipedes and centipedes", "Sea invertebrates"],
    explanation: "Eight legs, no antennae and a two-part body are the identifying features of the spiders, ticks and mites group.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sees two similar-looking creatures near ${place(rng)}: one moves slowly leaving a slime trail and carries a coiled shell, the other looks similar but has no shell at all. What are these two animals?`,
      correct: "A snail (with a shell) and a slug (without a shell)",
      wrong: ["Two different kinds of worms", "A spider and a tick", "A millipede and a centipede"],
      explanation: "Snails and slugs are close relatives — the key difference is that a snail carries a coiled shell on its back, while a slug does not.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} touches a long, brown, many-legged animal in ${place(rng)} and it immediately curls into a tight spiral. Which invertebrate behaves this way?`,
    correct: "Millipede",
    wrong: ["Centipede (which usually runs away fast instead)", "Earthworm", "Crab"],
    explanation: "Millipedes are known for curling into a tight coil as a defence when disturbed, unlike the faster-moving centipede.",
  }),
  (rng) => ({
    prompt: `A fisherman near ${place(rng)} pulls up a net containing an animal with a hard shell, ten legs, and a pair of large pincer claws. Which sea invertebrate is this?`,
    correct: "Crab",
    wrong: ["Starfish", "Octopus", "Snail"],
    explanation: "Ten legs including a pair of pincer claws, protected by a hard shell, are the identifying features of a crab.",
  }),
  (rng) => ({
    prompt: `${name(rng)} finds a flat, star-shaped animal with five arms lying among rocks near the ${place(rng)} coast. If one arm were damaged, what could this invertebrate do?`,
    correct: "Slowly regrow the lost arm over time",
    wrong: ["Grow a completely new body from the lost arm within seconds", "Never survive the injury", "Change into a crab"],
    explanation: "Starfish have the remarkable ability to slowly regrow a lost arm — one of their distinguishing characteristics.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} watches an eight-armed sea creature near ${place(rng)} change colour to blend in with the rocks around it. What invertebrate is ${who} watching?`,
      correct: "Octopus",
      wrong: ["Starfish", "Crab", "Snail"],
      explanation: "An octopus has eight tentacles and can change its skin colour to camouflage itself from predators.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} counts 6 legs and notices the body is divided into a head, thorax and abdomen on an animal resting on a leaf. What group does this animal belong to?`,
    correct: "Insects",
    wrong: ["Spiders, ticks and mites", "Millipedes and centipedes", "Sea invertebrates"],
    explanation: "Six legs and a three-part body (head, thorax, abdomen) are the identifying features of insects.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is asked to safely observe a wild spider found near ${place(rng)} without touching it directly. What is the safest way to do this?`,
    correct: "Observe it from a distance, or gently guide it with a stick or leaf if it needs to be moved",
    wrong: ["Pick it up firmly with bare hands to get a closer look", "Trap it in a closed fist to feel it move", "Poke it repeatedly with a bare finger to test if it bites"],
    explanation: "Unfamiliar invertebrates like spiders should be observed from a distance or moved with a tool, not handled directly with bare hands.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is comparing a millipede and a centipede found in a garden in ${place(rng)}. Both have many legs and a long segmented body. What group do they share?`,
      correct: "Millipedes and centipedes",
      wrong: ["Insects", "Worms", "Sea invertebrates"],
      explanation: "Millipedes and centipedes form their own named group of invertebrates with long, segmented, many-legged bodies.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family dog returns from a walk near ${place(rng)} with a small, oval, 8-legged creature firmly attached to its skin, feeding on its blood. What is this creature?`,
      correct: "Tick",
      wrong: ["Spider", "Mite", "Millipede"],
      explanation: "A tick is a tiny, oval-bodied relative of the spider that attaches itself to an animal's skin to feed on blood — unlike a free-roaming spider, whose body has two clear segments.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Examining stored maize under a magnifying lens in ${place(rng)}, ${who} spots a creature so small it was completely invisible to the naked eye, with a tiny oval body and 8 short legs. What kind of invertebrate is this most likely to be?`,
      correct: "Mite",
      wrong: ["Tick", "Insect", "Worm"],
      explanation: "Mites are extremely small relatives of spiders and ticks, often needing magnification to see clearly, and are commonly found on stored grain or in household dust.",
    };
  },
];

export const invertebrateIdentification: Skill = {
  id: "g6-sci-lte-invertebrate-id",
  code: "LTE.2a",
  subjectId: "science",
  strandId: "g6-sci-lte",
  grade: 6,
  title: "Identifying invertebrates",
  description: "Identifying common invertebrates (insects; spiders, ticks and mites individually; millipedes and centipedes; snails and slugs; worms; sea invertebrates — octopus, starfish and crabs), their general characteristics, and safety precautions in handling them.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["identify-invertebrate", "group-description-match", "characteristic-categorize", "leg-count-order", "safety-evaluate", "reasoning", "fill-blank"] as const
    );

    if (branch === "identify-invertebrate") {
      const target = randChoice(rng, INVERTEBRATES);
      // Prefer distractors from the same named group first (e.g. spider/tick/mite; crab/starfish/octopus) —
      // those are genuinely confusable, unlike a random cross-group pick (e.g. starfish as a tick distractor).
      const sameGroup = shuffle(rng, INVERTEBRATES.filter((v) => v.id !== target.id && v.group === target.group).map((v) => v.label));
      const otherGroup = shuffle(rng, INVERTEBRATES.filter((v) => v.id !== target.id && v.group !== target.group).map((v) => v.label));
      const wrongLabels = [...sameGroup, ...otherGroup].slice(0, 3);
      const choices = shuffle(rng, [target.label, ...wrongLabels]);
      const correctIndex = choices.indexOf(target.label);
      const IDENTIFY_PROMPTS = [
        "Identify this invertebrate.",
        "Which invertebrate is shown here?",
        "What is the name of this invertebrate?",
        "Look at this invertebrate. What is it called?",
        "Name this invertebrate.",
      ] as const;
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "invertebrate", kind: target.visual },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is a ${target.label} (${target.group}). ${target.feature}.`,
      };
    }

    if (branch === "group-description-match") {
      const chosen = shuffle(rng, INVERTEBRATES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.id, label: v.label })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.id, label: v.feature })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.id] = v.id;
      const GROUP_MATCH_PROMPTS = [
        "Match each invertebrate to its identifying feature.",
        "Which identifying feature belongs to each invertebrate below? Match them up.",
        "Pair each invertebrate with the feature that identifies it.",
        "Match each invertebrate to how you would recognise it.",
        "Connect each invertebrate with its identifying feature.",
      ] as const;
      return {
        kind: "click-match",
        prompt: randChoice(rng, GROUP_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Count legs, look at the body shape, and think about the shell or skin.",
        explanation: chosen.map((v) => `${v.label} — ${v.feature}.`).join(" "),
      };
    }

    if (branch === "characteristic-categorize") {
      const groups = shuffle(rng, INVERTEBRATES.filter((v) => v.id !== "starfish" || true)).slice(0, 4);
      const facts = shuffle(rng, CHARACTERISTIC_FACTS.filter((f) => f.group !== "all" && groups.some((g) => g.id === f.group))).slice(0, 9);
      const items = facts.map((f, i) => ({ id: `c${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      facts.forEach((f, i) => (correctBucket[`c${i}`] = f.group));
      const CHARACTERISTIC_PROMPTS = [
        "Sort each characteristic by the invertebrate it describes.",
        "Which invertebrate does each characteristic below describe? Sort them.",
        "Decide which invertebrate each characteristic belongs to, then sort it.",
        "Group these characteristics under the invertebrate they describe.",
        "For each characteristic, work out which invertebrate it belongs to.",
      ] as const;
      return {
        kind: "categorize",
        prompt: randChoice(rng, CHARACTERISTIC_PROMPTS),
        items,
        buckets: groups.map((g) => ({ id: g.id, label: g.label })),
        correctBucket,
        hint: "Match leg count, body shape and behaviour to the right animal.",
        explanation: facts.map((f) => `"${f.text}" describes the ${INVERTEBRATES.find((v) => v.id === f.group)!.label}.`).join(" "),
      };
    }

    if (branch === "leg-count-order") {
      const shuffled = shuffle(rng, LEG_COUNT_ORDER);
      const LEG_ORDER_PROMPTS = [
        "Arrange these invertebrates from fewest legs to most legs.",
        "Order these invertebrates by leg count, from fewest to most.",
        "Sort these invertebrates from the fewest legs to the most legs.",
        "Place these invertebrates in order of leg count, lowest to highest.",
        "Rank these invertebrates from fewest legs to most legs.",
      ] as const;
      return {
        kind: "ordering",
        prompt: randChoice(rng, LEG_ORDER_PROMPTS),
        items: shuffled.map((v) => ({ id: v.id, label: v.label })),
        correctOrder: [...LEG_COUNT_ORDER].sort((a, b) => a.legs - b.legs).map((v) => v.id),
        instruction: "Drag to arrange from fewest legs to most legs.",
        hint: "An earthworm has none, an insect has 6, a spider has 8, and a crab has 10.",
        explanation: LEG_COUNT_ORDER.map((v) => `${v.label}: ${v.legs} legs`).join(", ") + ".",
      };
    }

    if (branch === "safety-evaluate") {
      const s = randChoice(rng, SAFETY_SCENARIOS);
      const safeLabel = "Yes, this is a safe precaution";
      const unsafeLabel = "No, this is not a safe precaution";
      const choices = shuffle(rng, [safeLabel, unsafeLabel]);
      const correctLabel = s.isSafe ? safeLabel : unsafeLabel;
      return {
        kind: "multiple-choice",
        prompt: `${s.desc} Is this a safe precaution when handling invertebrates?`,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "list",
        explanation: s.why,
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", explanation: q.explanation };
    }

    const FILL_BLANKS = [
      { before: "An invertebrate with 6 legs and a body divided into head, thorax and abdomen is an ", after: ".", correctAnswer: "insect" },
      { before: "An invertebrate with 8 legs, no antennae, and a two-part body belongs to the group of ", after: ".", correctAnswer: "spiders" },
      { before: "An invertebrate that curls into a tight coil when touched, with a long many-legged body, is a ", after: ".", correctAnswer: "millipede" },
      { before: "Unlike a slug, a snail carries a coiled ", after: " on its back.", correctAnswer: "shell" },
      { before: "A soft, legless, segmented invertebrate that burrows through moist soil is an ", after: ".", correctAnswer: "earthworm" },
      { before: "A sea invertebrate with ten legs and a pair of pincer claws is a ", after: ".", correctAnswer: "crab" },
      { before: "A flat, star-shaped sea invertebrate, usually with five arms, is a ", after: ".", correctAnswer: "starfish" },
      { before: "A sea invertebrate with a soft body and eight tentacles is an ", after: ".", correctAnswer: "octopus" },
      { before: "All invertebrates share the feature of having no ", after: " inside their body.", correctAnswer: "backbone" },
      { before: "Before handling an unfamiliar invertebrate, it is safest to observe it from a ", after: " or use a tool such as a stick.", correctAnswer: "distance" },
      { before: "After handling invertebrates outdoors, learners should always wash their ", after: " before eating.", correctAnswer: "hands" },
      { before: "A starfish that loses an arm is able to slowly ", after: " it over time.", correctAnswer: "regrow" },
      { before: "An octopus can change the colour of its skin to ", after: " itself from predators.", correctAnswer: "hide" },
      { before: "Scientific names for invertebrates are ", after: " at this level of study.", correctAnswer: "not required" },
      { before: "Wild invertebrates found during an activity should be ", after: " to where they were found afterwards.", correctAnswer: "returned" },
      { before: "Ticks and mites should be removed carefully using a tool, not ", after: ", because they can carry disease.", correctAnswer: "bare fingers" },
      { before: "A tiny, oval-bodied relative of the spider that attaches to skin and feeds on blood is a ", after: ".", correctAnswer: "tick" },
      { before: "An even smaller relative of the spider, often too tiny to see without magnification, is a ", after: ".", correctAnswer: "mite" },
    ] as const;

    const fb = randChoice(rng, FILL_BLANKS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [fb.correctAnswer],
      inputMode: "text",
      hint: "Think about the identifying features of each invertebrate group.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
