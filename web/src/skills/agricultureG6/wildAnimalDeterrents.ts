import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./g6AgShared";

// KICD Grade 6 Agriculture C.4 "Conserving Wild Animals" names six physical deterrents — mesh
// fences, thorny fences, safe traps, innovative lights, innovative sounds, and deflectors — all
// six are implemented below. The source PCI ("Protection of biodiversity against extinction by
// deterring animals without killing them") is an explicit, important framing baked into the
// evaluate branch: a deterrent is the correct response to a wild-animal problem precisely
// because it protects biodiversity, never pest elimination.

type DeterrentId = "mesh-fence" | "thorny-fence" | "trap" | "light" | "sound" | "deflector";

const DETERRENTS: { id: DeterrentId; label: string; description: string }[] = [
  { id: "mesh-fence", label: "Mesh fence", description: "A physical barrier built from wire mesh stretched between sturdy posts around a field or enclosure" },
  { id: "thorny-fence", label: "Thorny fence", description: "A barrier made from thorny branches or thorny living plants, such as sisal or euphorbia, along a boundary" },
  { id: "trap", label: "Safe trap", description: "A humane, cage-type trap that catches a problem animal alive so it can be relocated unharmed" },
  { id: "light", label: "Innovative light", description: "Flashing or moving lights, often solar-powered, that startle nocturnal wild animals approaching at night" },
  { id: "sound", label: "Innovative sound", description: "Devices such as bells, radios or motion-activated alarms that startle animals away with unfamiliar noise" },
  { id: "deflector", label: "Deflector", description: "An object or structure, such as reflective strips or scarecrow-like figures, that redirects an approaching animal's attention or path" },
];

function deterrentOf(id: DeterrentId) {
  return DETERRENTS.find((d) => d.id === id)!;
}

// ---- Fact bank: 36 facts (6 per deterrent) — feeds categorize and fill-blank branches, well
// above the Grade-6 30-item pool floor. ----
const DETERRENT_FACTS: { text: string; type: DeterrentId }[] = [
  // mesh-fence
  { text: "A physical barrier built from wire mesh stretched between sturdy posts around a field or enclosure", type: "mesh-fence" },
  { text: "Set up by fixing posts firmly and burying the base of the mesh slightly so animals cannot dig underneath", type: "mesh-fence" },
  { text: "Works well against animals that try to push through or dig under a boundary", type: "mesh-fence" },
  { text: "Needs regular checking for gaps or damage, since a broken section defeats the whole barrier", type: "mesh-fence" },
  { text: "A good choice where the same crop is at risk from the same animals every season, since it is a lasting structure", type: "mesh-fence" },
  { text: "Blocks an animal's path completely without harming it at all", type: "mesh-fence" },
  // thorny-fence
  { text: "A barrier made from thorny branches or thorny living plants such as sisal or euphorbia", type: "thorny-fence" },
  { text: "Established by planting a dense line of thorny shrubs, or by cutting and stacking thorny branches along a boundary", type: "thorny-fence" },
  { text: "Discourages animals from pushing through because of the pain the thorns cause on contact", type: "thorny-fence" },
  { text: "A living thorny hedge grows thicker and more effective over time, unlike a cut-branch barrier which needs replacing", type: "thorny-fence" },
  { text: "A low-cost option where thorny plants are already locally available", type: "thorny-fence" },
  { text: "Turns animals away without any serious harm beyond a light scratch, unlike a trap or weapon", type: "thorny-fence" },
  // trap
  { text: "A humane, cage-type trap designed to catch a problem animal alive without harming it", type: "trap" },
  { text: "Set by baiting the trap with food at a spot the animal regularly visits, then checking it often", type: "trap" },
  { text: "Once an animal is caught, it should be released unharmed, far from the farm, not killed", type: "trap" },
  { text: "Chosen when one specific, identifiable animal is repeatedly causing damage", type: "trap" },
  { text: "Must be checked frequently so a trapped animal is not left stressed or injured for long periods", type: "trap" },
  { text: "Reflects the value of conserving wild animals, since the goal is safe removal, not killing", type: "trap" },
  // light
  { text: "Flashing or moving lights, often solar-powered, set up to startle nocturnal wild animals approaching at night", type: "light" },
  { text: "Installed at intervals around a field or enclosure, angled so their brightness and movement catch an approaching animal's attention", type: "light" },
  { text: "Especially useful against animals that are most active at night, since many deterrents work only in daylight", type: "light" },
  { text: "Solar lights need little maintenance once installed, since they charge automatically during the day", type: "light" },
  { text: "Can lose effectiveness over time if animals become used to a light that never changes pattern or position", type: "light" },
  { text: "Scares animals away using light alone, without any physical contact or harm to the animal", type: "light" },
  // sound
  { text: "Devices or methods that produce sudden or unfamiliar noises to scare wild animals away", type: "sound" },
  { text: "Set up using bells, radios, or motion-activated alarms positioned around a field or enclosure", type: "sound" },
  { text: "Works especially well combined with another deterrent, such as lights, for animals active at night", type: "sound" },
  { text: "Can lose effectiveness if the same sound is used for too long and animals stop reacting to it", type: "sound" },
  { text: "Should be loud enough to startle the animal but not so constant that it disturbs the family or neighbours", type: "sound" },
  { text: "Startles animals into retreating without physically harming them at all", type: "sound" },
  // deflector
  { text: "An object or structure that redirects an approaching animal's attention or path away from crops or animals", type: "deflector" },
  { text: "Set up using reflective strips, old CDs, or scarecrow-like figures that move and catch light", type: "deflector" },
  { text: "Works by confusing or startling the animal from a distance, before it even reaches the crop", type: "deflector" },
  { text: "Needs to be moved or changed occasionally, since animals can get used to a deflector that never changes", type: "deflector" },
  { text: "A low-cost option that reuses simple household materials like old CDs or reflective strips", type: "deflector" },
  { text: "Redirects the animal's movement rather than harming or trapping it", type: "deflector" },
];

const GENERAL_PROCESS_STEPS = [
  { id: "identify", label: "Identify which wild animal is causing damage, and note its behaviour (for example, active at night or during the day)" },
  { id: "search", label: "Search for information on physical deterrents suited to that animal and the local area" },
  { id: "select", label: "Select a deterrent applicable to the local context and available materials" },
  { id: "gather", label: "Gather the materials needed to establish the chosen deterrent" },
  { id: "establish", label: "Establish (set up) the deterrent around the crop field or animal enclosure" },
  { id: "monitor", label: "Monitor its effectiveness regularly and adjust or combine deterrents if animals start ignoring it" },
];

// ---- Reasoning (Apply) pool: 12 situation facts x 3 frames = 36 templates. ----
const SITUATION_FACTS: { text: string; type: DeterrentId }[] = [
  { text: "wild pigs keep pushing under a low farm boundary at night to dig up root crops", type: "mesh-fence" },
  { text: "porcupines have been digging under a garden's boundary at night to reach root vegetables", type: "mesh-fence" },
  { text: "baboons repeatedly try to force their way through gaps in a field's boundary during the day", type: "thorny-fence" },
  { text: "a troop of monkeys keeps pushing through gaps in a hedge to reach a vegetable garden during the day", type: "thorny-fence" },
  { text: "a farmer near a forest reserve wants an affordable deterrent using materials already available locally, like sisal plants", type: "thorny-fence" },
  { text: "a single leopard has been identified repeatedly attacking a farmer's goats at night and needs to be removed safely without being harmed", type: "trap" },
  { text: "a hyena has been identified as the one repeatedly killing a farmer's goats and the community wants it removed unharmed and relocated", type: "trap" },
  { text: "wild animals have been approaching a chicken coop after dark, when there is no moonlight", type: "light" },
  { text: "an area with frequent night-time raids by wild pigs has no electricity, but a family owns a solar-powered lamp", type: "light" },
  { text: "elephants have been raiding a maize field at night and a community wants an affordable way to startle them from a distance", type: "sound" },
  { text: "birds keep landing on a fruit orchard and pecking at ripening fruit during the day", type: "deflector" },
  { text: "a family wants a deterrent that reuses old household materials like unused CDs and does not need any construction", type: "deflector" },
];

const REASONING_FRAMES: ((rng: RNG, fact: { text: string; type: DeterrentId }) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    const d = deterrentOf(fact.type);
    return {
      prompt: `${who} farms near ${p}, where ${fact.text}. Which physical deterrent is the best choice here?`,
      correct: d.label,
      wrong: DETERRENTS.filter((x) => x.id !== d.id).map((x) => x.label),
      explanation: `${d.label} is the best fit — ${d.description.toLowerCase()}.`,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const d = deterrentOf(fact.type);
    return {
      prompt: `On a shamba near ${p}, ${fact.text}. Which deterrent addresses this situation best?`,
      correct: d.label,
      wrong: DETERRENTS.filter((x) => x.id !== d.id).map((x) => x.label),
      explanation: `${d.label} is the best fit — ${d.description.toLowerCase()}.`,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    const d = deterrentOf(fact.type);
    return {
      prompt: `A resource person visiting ${p} tells ${who} that ${fact.text}. Which deterrent would the resource person most likely recommend?`,
      correct: d.label,
      wrong: DETERRENTS.filter((x) => x.id !== d.id).map((x) => x.label),
      explanation: `${d.label} is the best fit — ${d.description.toLowerCase()}.`,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const d = deterrentOf(fact.type);
    return {
      prompt: `${who} needs to solve a wildlife problem: ${fact.text}. What should ${who} set up?`,
      correct: d.label,
      wrong: DETERRENTS.filter((x) => x.id !== d.id).map((x) => x.label),
      explanation: `${d.label} is the best fit — ${d.description.toLowerCase()}.`,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const d = deterrentOf(fact.type);
    const text = fact.text.charAt(0).toUpperCase() + fact.text.slice(1);
    return {
      prompt: `${text}, near ${p}. Which option would work best without harming the animal?`,
      correct: d.label,
      wrong: DETERRENTS.filter((x) => x.id !== d.id).map((x) => x.label),
      explanation: `${d.label} is the best fit — ${d.description.toLowerCase()}.`,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    const d = deterrentOf(fact.type);
    return {
      prompt: `${who}'s family, living near ${p}, is dealing with a case where ${fact.text}. Which choice fits the problem best?`,
      correct: d.label,
      wrong: DETERRENTS.filter((x) => x.id !== d.id).map((x) => x.label),
      explanation: `${d.label} is the best fit — ${d.description.toLowerCase()}.`,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(SITUATION_FACTS, REASONING_FRAMES);

// ---- Evaluate pool (mandatory per the PCI on protecting biodiversity without killing
// animals): 12 constraint facts x 3 frames = 36 templates. ----
interface BiodiversityFact {
  situation: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const BIODIVERSITY_FACTS: BiodiversityFact[] = [
  {
    situation: "elephants have damaged a section of a farmer's maize field for the third time this season",
    correct: "Work with neighbours and local wildlife officers to establish an appropriate physical deterrent, such as lights or sound, around the field",
    wrong: [
      "Set out poison to kill any elephant that returns to the field",
      "Report the loss but take no further action, since nothing can be done",
      "Hunt and kill the elephant responsible to permanently stop the raids",
    ],
    explanation: "Deterrents like lights or sound protect the crop while keeping the elephant alive, supporting biodiversity — poisoning or killing wildlife is illegal and against the value of conserving wild animals.",
  },
  {
    situation: "a leopard has been identified repeatedly killing a farmer's goats at night",
    correct: "Set a safe cage trap, and once the leopard is caught, contact wildlife authorities to relocate it unharmed",
    wrong: [
      "Set a poison bait to kill the leopard",
      "Set an unsafe trap that could seriously injure the leopard",
      "Kill the leopard immediately using any means available",
    ],
    explanation: "A safe trap followed by proper relocation removes the danger to livestock without harming the leopard, protecting both the farmer's animals and the wild predator.",
  },
  {
    situation: "monkeys keep raiding a family's fruit trees during the day",
    correct: "Set up deflectors like reflective strips or scarecrow figures to discourage the monkeys without harming them",
    wrong: [
      "Trap the monkeys and leave them without food or water",
      "Throw stones or use catapults aimed to injure the monkeys",
      "Cut down the fruit trees so the monkeys have nothing to raid",
    ],
    explanation: "Deflectors redirect the monkeys' attention without harming them; leaving trapped animals uncared for or deliberately injuring them both go against safe, non-lethal deterrence.",
  },
  {
    situation: "wild pigs are digging under a garden fence at night",
    correct: "Bury the base of a mesh fence deeper so the pigs cannot dig under it",
    wrong: [
      "Set traps designed to injure the pigs so they stop coming back",
      "Poison the soil around the garden to discourage the pigs",
      "Set fire to the area where the pigs enter",
    ],
    explanation: "Deepening the buried base of a mesh fence solves the actual problem (digging underneath) without harming the animals; poison and fire are dangerous, indiscriminate, and against safe deterrence.",
  },
  {
    situation: "porcupines have damaged root crops in a community garden for weeks",
    correct: "Combine a properly buried mesh fence with community monitoring to keep porcupines out without harming them",
    wrong: [
      "Hunt down and kill the porcupines to solve the problem quickly",
      "Set illegal poison around the garden",
      "Give up on protecting the root crops entirely",
    ],
    explanation: "A properly installed physical barrier protects the crops while leaving the porcupines unharmed, matching the value of conserving wild animals rather than eliminating them.",
  },
  {
    situation: "a troop of baboons has been raiding crops and a village meeting is deciding how to respond",
    correct: "Discuss with a resource person or wildlife officer and establish a deterrent, such as a thorny fence, suited to the local context",
    wrong: [
      "Organise a hunt to kill as many baboons as possible",
      "Trap the baboons and leave them permanently caged without release",
      "Poison food near the crops to kill any baboon that eats it",
    ],
    explanation: "Consulting a resource person and establishing a suitable deterrent protects crops without harming the baboons; permanent caging and poisoning are both cruel and against safe, non-lethal deterrence.",
  },
  {
    situation: "hyenas have been approaching a homestead's livestock enclosure at night",
    correct: "Install lights or sound deterrents around the enclosure to scare hyenas away safely after dark",
    wrong: [
      "Leave out poisoned meat to kill any hyena that approaches",
      "Set unsupervised traps with no plan to release the animal safely",
      "Ignore the problem since hyenas are wild animals and cannot be deterred",
    ],
    explanation: "Lights or sound safely discourage hyenas at night without harming them; poisoned bait and neglected traps both risk cruelly injuring or killing the animal.",
  },
  {
    situation: "birds are eating seeds from a newly planted field",
    correct: "Use deflectors like moving scarecrow figures or reflective materials to discourage the birds",
    wrong: [
      "Use pesticide-laced seed to kill birds that land on the field",
      "Trap birds and leave them without care",
      "Destroy nearby bird nests to reduce the local bird population",
    ],
    explanation: "Deflectors discourage birds without harming them; poisoning seed and destroying nests both cause direct, unnecessary harm to wildlife.",
  },
  {
    situation: "a community has successfully used a safe trap to catch a problem animal",
    correct: "Release the animal unharmed, far from the farm, as soon as possible after it is caught",
    wrong: [
      "Keep the animal permanently caged as a trophy",
      "Sell the trapped animal instead of releasing it",
      "Leave the animal in the trap indefinitely with no plan to release it",
    ],
    explanation: "A safe trap is only humane if the animal is released unharmed promptly; keeping, selling, or abandoning a trapped animal defeats the whole purpose of using a safe trap.",
  },
  {
    situation: "a farmer wants to protect crops from wild animals while also supporting biodiversity in the area",
    correct: "Choose non-lethal deterrents like fences, lights, sound, or deflectors rather than killing or poisoning wild animals",
    wrong: [
      "Killing problem animals is the fastest way to protect crops, so it should be the first choice",
      "Biodiversity and crop protection cannot both be achieved at the same time",
      "Poisoning is acceptable as long as it only affects one type of animal",
    ],
    explanation: "Non-lethal deterrents let a farmer protect crops and support biodiversity at the same time — killing or poisoning wildlife is neither necessary nor consistent with conserving wild animals.",
  },
  {
    situation: "learners are researching physical deterrents for a class project on conserving wild animals",
    correct: "Physical deterrents such as fences, traps, lights, sound and deflectors are valued because they protect crops and animals without harming wildlife",
    wrong: [
      "Deterrents are only useful when a lethal method is not available",
      "The main purpose of a deterrent is to injure the animal enough that it never returns",
      "Physical deterrents work by permanently removing wild animals from an area through harm",
    ],
    explanation: "The whole point of a physical deterrent is that it works without harming the animal — injuring or permanently removing wildlife through harm is the opposite of what a deterrent is for.",
  },
  {
    situation: "a family is choosing how to protect their goats from wild predators at night",
    correct: "Combine a mesh or thorny fence around the enclosure with lights or sound to deter predators without harming them",
    wrong: [
      "Set out poison near the enclosure to kill any predator that approaches",
      "Leave the goats unprotected since predators cannot really be deterred",
      "Keep a trap set permanently with no plan to check or release any animal caught",
    ],
    explanation: "Combining a physical barrier with lights or sound protects the goats while leaving predators unharmed; poison and unchecked traps both risk cruelly harming wildlife.",
  },
];

const EVALUATE_FRAMES: ((rng: RNG, fact: BiodiversityFact) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who} lives near ${p}, where ${fact.situation}. What is the best response?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    return {
      prompt: `In a community near ${p}, ${fact.situation}. Which response best balances protecting the farm and conserving wild animals?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family is deciding how to respond, given that ${fact.situation}. Which choice is correct?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const p = place(rng);
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, near ${p}. Which choice protects both the farm and the wild animal?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `A wildlife officer visiting ${who} near ${p} learns that ${fact.situation}. What advice should the officer give?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
  (rng, fact) => {
    const who = name(rng);
    return {
      prompt: `${who} wants to do the right thing, knowing that ${fact.situation}. What is the responsible choice?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.explanation,
    };
  },
];

const EVALUATE_TEMPLATES = expandScenarios(BIODIVERSITY_FACTS, EVALUATE_FRAMES);

const IDENTIFY_PROMPTS = [
  "Identify this physical deterrent used to keep wild animals away from crops or domestic animals.",
  "Which physical deterrent is shown here?",
  "Name this method of keeping wild animals away without harming them.",
  "Look at the picture and identify this deterrent.",
  "What kind of wild animal deterrent does this picture show?",
  "Study the image and name this physical deterrent.",
];

const DESCRIPTION_MATCH_PROMPTS = [
  "Match each physical deterrent to its description.",
  "Pair each deterrent with the description that explains it.",
  "Connect each deterrent to the statement that describes it.",
  "Match each deterrent term to its correct meaning.",
  "Link each deterrent to the description that fits it.",
  "Match each deterrent below to its correct explanation.",
];

const CATEGORIZE_PROMPTS = [
  "Sort each fact by the physical deterrent it describes.",
  "Group these facts under the correct deterrent.",
  "Decide which deterrent each fact below relates to, and sort it there.",
  "Sort each statement into the deterrent it best fits.",
  "Place each fact into the bucket for the deterrent it describes.",
  "Read each fact and sort it under the matching deterrent.",
];

const PROCESS_ORDER_PROMPTS = [
  "Arrange the steps for choosing and establishing a physical deterrent in the correct order.",
  "Put these deterrent-setup steps into the correct sequence.",
  "Sequence the steps for choosing and setting up a deterrent correctly.",
  "Arrange these steps in the order a farmer would actually carry them out.",
  "Order these deterrent-setup steps from first to last.",
  "Sort these steps into the order they should happen when dealing with a wild animal problem.",
];

const FILL_BLANK_PROMPTS = [
  "Which physical deterrent does this fact describe?",
  "Name the deterrent this fact is about.",
  "Identify which deterrent this fact fits.",
  "This fact describes which physical deterrent?",
  "Work out which deterrent this fact belongs to.",
  "Which of the six deterrents does this fact describe?",
];

export const wildAnimalDeterrents: Skill = {
  id: "g6-ag-c-wild-animal-deterrents",
  code: "C.4",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-conservation",
  grade: 6,
  title: "Conserving Wild Animals",
  description: "Identifying and establishing physical deterrents — mesh fences, thorny fences, safe traps, innovative lights, innovative sounds and deflectors — that keep wild animals off crops and domestic animals without harming them, protecting biodiversity.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["identify", "description-match", "categorize-facts", "process-order", "reasoning", "evaluate", "fill-blank"] as const
    );
    const hint = "Each deterrent suits a different problem: fences block a path, traps remove one animal safely, lights and sound work at night or from a distance, and deflectors redirect attention.";

    if (branch === "identify") {
      const target = randChoice(rng, DETERRENTS);
      const wrong = shuffle(rng, DETERRENTS.filter((d) => d.id !== target.id)).slice(0, 3).map((d) => d.label);
      const choices = shuffle(rng, [target.label, ...wrong]);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, IDENTIFY_PROMPTS),
        visual: { type: "wildlife-deterrent", kind: target.id },
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation: `This is a ${target.label.toLowerCase()} — ${target.description.toLowerCase()}.`,
      };
    }

    if (branch === "description-match") {
      const tokens = shuffle(rng, DETERRENTS.map((d) => ({ id: d.id, label: d.label })));
      const targets = shuffle(rng, DETERRENTS.map((d) => ({ id: d.id, label: d.description })));
      const correctMap: Record<string, string> = {};
      for (const d of DETERRENTS) correctMap[d.id] = d.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, DESCRIPTION_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: DETERRENTS.map((d) => `${d.label}: ${d.description}.`).join(" "),
      };
    }

    if (branch === "categorize-facts") {
      const chosen = shuffle(rng, DETERRENT_FACTS).slice(0, 12);
      const items = chosen.map((c, i) => ({ id: `f${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`f${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: DETERRENTS.map((d) => ({ id: d.id, label: d.label })),
        correctBucket,
        hint,
        explanation: chosen.map((c) => `"${c.text}" describes the ${deterrentOf(c.type).label.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "process-order") {
      const shuffled = shuffle(rng, GENERAL_PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, PROCESS_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: GENERAL_PROCESS_STEPS.map((s) => s.id),
        hint: "Understand the animal and research options first, then select, gather materials, establish it, and finally monitor.",
        explanation: GENERAL_PROCESS_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    if (branch === "evaluate") {
      const q = randChoice(rng, EVALUATE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "The best response always protects the crop or animal without killing or harming the wild animal — that is the whole point of a deterrent.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, DETERRENT_FACTS);
    const d = deterrentOf(fb.type);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: `"${fb.text}" — this describes the `,
      after: ".",
      correctAnswer: d.label.toLowerCase(),
      acceptedAnswers: [d.label.toLowerCase(), fb.type],
      inputMode: "text",
      hint,
      explanation: `This fact describes the ${d.label.toLowerCase()} — ${d.description.toLowerCase()}.`,
    };
  },
};
