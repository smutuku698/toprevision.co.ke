import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// KICD Grade 7 Pre-Technical MAT.2 names exactly three metallic materials — steel, aluminium,
// copper — so the metal pool itself stays fixed at three. Repetitive practice sessions come from
// too few *facts and scenarios* about those three metals, not from too few metals, so this file's
// pools are deliberately wide and Kenyan-localized rather than wider on the metal list itself.

const METALS = [
  {
    id: "steel",
    label: "Steel",
    material: "steel" as const,
    property: "Strongly magnetic and very strong",
    use: "Constructing building frames and making hand tools",
    density: 2, // mid-weight of the three (~7.8 g/cm3) — lighter than copper, heavier than aluminium
  },
  {
    id: "aluminium",
    label: "Aluminium",
    material: "aluminium" as const,
    property: "Very lightweight and resistant to rusting",
    use: "Making aircraft bodies and drink cans",
    density: 1, // lightest of the three (~2.7 g/cm3)
  },
  {
    id: "copper",
    label: "Copper",
    material: "copper" as const,
    property: "Reddish-brown and an excellent conductor of electricity",
    use: "Making electrical wiring and water pipes",
    density: 3, // heaviest of the three (~8.9 g/cm3)
  },
] as const;

const PROPERTY_FACTS = [
  { text: "Strongly attracted to a magnet because of its iron content", metal: "steel" },
  { text: "Commonly used to reinforce concrete because of its strength", metal: "steel" },
  { text: "A weaker conductor of heat and electricity than aluminium or copper", metal: "steel" },
  { text: "Rusts and forms reddish-brown flakes if left exposed to moisture without paint or galvanising", metal: "steel" },
  { text: "The strongest of the three metals, which is why it is used for tools, gates and building frames", metal: "steel" },
  { text: "Very light in weight compared to steel and copper", metal: "aluminium" },
  { text: "Resists rusting because it forms its own protective oxide layer", metal: "aluminium" },
  { text: "Conducts heat well, which is why it is used for cooking pots and pans", metal: "aluminium" },
  { text: "Silvery-grey in colour and often used for window frames and roofing sheets", metal: "aluminium" },
  { text: "Used in overhead power lines because it is much lighter than copper, even though it conducts electricity less well", metal: "aluminium" },
  { text: "Has a reddish-brown appearance when new", metal: "copper" },
  { text: "Conducts electricity better than steel or aluminium", metal: "copper" },
  { text: "Conducts both heat and electricity extremely well — better than the other two metals", metal: "copper" },
  { text: "Turns green (forms a patina) after long exposure to air and moisture", metal: "copper" },
  { text: "Heavier than both steel and aluminium", metal: "copper" },
] as const;

const REAL_WORLD_ITEMS = [
  { id: "wire", label: "Electrical wiring inside a house", metal: "copper" },
  { id: "pipe", label: "Water supply pipe", metal: "copper" },
  { id: "panel", label: "Aircraft body panel", metal: "aluminium" },
  { id: "can", label: "Drink can", metal: "aluminium" },
  { id: "frame", label: "Window frame in a humid area", metal: "aluminium" },
  { id: "sufuria", label: "Everyday cooking sufuria", metal: "aluminium" },
  { id: "rebar", label: "Reinforcement bar inside concrete", metal: "steel" },
  { id: "spanner", label: "Spanner (wrench) head", metal: "steel" },
  { id: "gate", label: "Welded security gate", metal: "steel" },
  { id: "nail", label: "Roofing nail", metal: "steel" },
] as const;

const KENYAN_PLACES = [
  "Kamukunji, Nairobi",
  "Gikomba, Nairobi",
  "Kariokor, Nairobi",
  "Kisumu",
  "Eldoret",
  "Nakuru",
  "Mombasa",
  "Kitengela",
  "Thika",
  "Nyeri",
  "Kitale",
  "Machakos",
] as const;

const KENYAN_NAMES = [
  "Amina",
  "Baraka",
  "Chebet",
  "Denis",
  "Fatuma",
  "Juma",
  "Kevin",
  "Lilian",
  "Mwangi",
  "Naliaka",
  "Otieno",
  "Wanjiru",
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

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
    prompt: `${who}, an electrician in ${place(rng)}, is wiring a new house. Why does ${who} choose copper wire instead of steel wire?`,
    correct: "Copper is a much better conductor of electricity than steel",
    wrong: [
      "Copper is magnetic and steel is not",
      "Copper is heavier than steel, so it carries more current",
      "Steel cannot be shaped into wires",
    ],
    explanation:
      "Copper conducts electricity far better than steel, which is why it is the standard choice for household wiring. Steel is actually the magnetic one of the two, not copper — weight has nothing to do with how much current a wire can carry.",
    };
  },
  (rng) => ({
    prompt: `An aircraft engineer working near ${place(rng)} is choosing the body-panel material for a small plane. Why is aluminium, rather than steel, normally chosen?`,
    correct: "Aluminium is much lighter than steel, which keeps the aircraft's weight down",
    wrong: [
      "Aluminium is magnetic and steel is not",
      "Aluminium conducts electricity better than copper does",
      "Steel cannot be shaped into sheets",
    ],
    explanation:
      "Aircraft need to be as light as possible, and aluminium is far lighter than steel while still strong enough for the job. Neither aluminium nor steel is a better electrical conductor than copper.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} runs a jua kali workshop in ${place(rng)} making hand tools and gate frames. Why does ${who} prefer steel over aluminium for this work?`,
      correct: "Steel is far stronger and more hard-wearing than aluminium",
      wrong: [
        "Steel is the lightest of the three metals",
        "Steel does not conduct electricity at all",
        "Aluminium rusts more easily than steel",
      ],
      explanation:
        "Steel's strength and hard-wearing nature make it ideal for tools and frames that face heavy daily use. It is actually aluminium that resists rusting better — untreated steel is the one that rusts.",
    };
  },
  (rng) => ({
    prompt: `A steel gate welded in ${place(rng)} starts showing reddish-brown flakes after a rainy season. What is happening, and what should have been done to prevent it?`,
    correct: "The steel is rusting because it was not painted or galvanised to protect it from moisture",
    wrong: [
      "The steel is melting because it got too hot in the sun",
      "The gate is turning green the way copper does when it corrodes",
      "The steel has become magnetic and is now attracting dust",
    ],
    explanation:
      "Steel rusts — forming reddish-brown flakes — when the iron in it reacts with moisture and air. A coat of paint or galvanising forms a barrier that prevents this. Copper corrodes to green, not steel.",
  }),
  (rng) => ({
    prompt: `Old copper roofing sheets in ${place(rng)} have turned green after many years outdoors. What causes this colour change?`,
    correct: "The copper has slowly reacted with air and moisture to form a green patina",
    wrong: [
      "The copper has rusted the way steel does",
      "The copper has become magnetic over time",
      "The copper was painted green by the manufacturer",
    ],
    explanation:
      "Unlike steel, which rusts reddish-brown, copper reacts slowly with air and moisture over many years to form a green surface layer called a patina — it is still copper underneath.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is buying a new sufuria in the ${place(rng)} market and wants one that heats food quickly without being too heavy or too costly. Which metal is the traditional choice, and why?`,
    correct: "Aluminium, because it conducts heat well and is far lighter and cheaper than copper",
    wrong: [
      "Steel, because it is the best conductor of heat of the three metals",
      "Copper, because it is the lightest of the three metals",
      "Aluminium, because it is magnetic, and magnetic metals heat up faster",
    ],
    explanation:
      "Aluminium conducts heat well and is much lighter and cheaper than copper, which is why most everyday sufurias are aluminium — even though copper is technically an even better heat conductor.",
  }),
  (rng) => ({
    prompt: `A scrap-metal dealer in ${place(rng)} runs a magnet over a mixed pile of steel, aluminium and copper offcuts to sort them quickly. Why does this method work?`,
    correct: "Steel contains iron and is attracted to the magnet, while aluminium and copper are not",
    wrong: [
      "All three metals are attracted to a magnet equally",
      "Copper is attracted to the magnet, but steel and aluminium are not",
      "The magnet only works on metals that are reddish-brown in colour",
    ],
    explanation:
      "Steel is magnetic because of its iron content. Aluminium and copper are not attracted to magnets at all, so a simple magnet is a fast, cheap way to pull steel out of mixed scrap.",
  }),
  (rng) => ({
    prompt: `A building contractor in humid ${place(rng)} is choosing window frames for a house near a river. Why might aluminium be chosen over untreated steel?`,
    correct: "Aluminium naturally resists rusting, while untreated steel would rust quickly in the humid conditions",
    wrong: [
      "Aluminium is stronger than steel",
      "Aluminium conducts electricity better, which matters for window frames",
      "Steel is always more expensive than aluminium",
    ],
    explanation:
      "Aluminium forms its own protective oxide layer and resists rusting, which is valuable in humid conditions — untreated steel would need regular repainting to avoid rusting there.",
  }),
  (rng) => ({
    prompt: `${name(rng)} tests three unlabelled metal strips: the first sticks to a magnet, the second is very light and silvery-grey, and the third is reddish-brown and conducts electricity extremely well. Which metal is the second strip?`,
    correct: "Aluminium",
    wrong: ["Steel", "Copper", "None of the three metals studied"],
    explanation:
      "The magnetic strip is steel (it contains iron), the light silvery-grey strip is aluminium, and the reddish-brown, highly conductive strip is copper.",
  }),
  (rng) => ({
    prompt: `A hardware shop in ${place(rng)} is restocking roofing nails. Why are roofing nails almost always made of steel rather than aluminium or copper?`,
    correct: "Steel's strength and hardness let it be driven into wood and hold a roof securely without bending",
    wrong: [
      "Steel is the lightest of the three metals",
      "Steel conducts electricity better than copper",
      "Aluminium cannot be shaped into nails",
    ],
    explanation:
      "Nails need to be driven in without bending and then hold firm under load, which needs steel's hardness and strength — aluminium is far too soft and copper too costly for this job.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} compares a copper coin and a steel coin of the same size at a ${place(rng)} market stall and notices the copper coin feels noticeably heavier. What does this tell ${who} about the two metals?`,
      correct: "Copper is denser (heavier for the same size) than steel",
      wrong: [
        "Copper is magnetic and steel is not",
        "The copper coin must be hollow inside",
        "Steel coins are always smaller than copper coins",
      ],
      explanation:
        "For the same size, copper weighs more than steel because it is denser — this has nothing to do with magnetism or the coins being hollow.",
    };
  },
];

const EVALUATE_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `A power distribution company near ${place(rng)} is choosing cable material for a long overhead transmission line. Copper conducts electricity better than aluminium — so which metal is actually preferred for long overhead lines, and why?`,
    correct: "Aluminium — despite conducting less well than copper, it is far lighter and cheaper, which matters most over long overhead spans",
    wrong: [
      "Copper — because it is the lightest of the three metals",
      "Steel — because steel conducts electricity better than both copper and aluminium",
      "Aluminium — because it conducts electricity better than copper",
    ],
    explanation:
      "Copper is the better conductor, but aluminium's much lower weight and cost make it the practical choice for long overhead power lines. Better conductivity is not the only thing engineers weigh — weight and cost matter over long distances too.",
  }),
  (rng) => ({
    prompt: `A metalworker in humid, coastal ${place(rng)} must choose between steel and aluminium for a security gate that needs both strength and rust-resistance, and the gate cannot be repainted regularly. Which is the better overall choice, and why?`,
    correct: "Aluminium — although it is less strong than steel, it will not need constant repainting to avoid rust in the humid coastal air",
    wrong: [
      "Steel — because it is always the stronger and therefore better choice, regardless of maintenance",
      "Aluminium — because it is magnetic and steel is not",
      "Steel — because steel naturally resists rusting better than aluminium",
    ],
    explanation:
      "Steel is stronger, but it rusts unless regularly painted or galvanised. Without regular maintenance in a humid coastal area, aluminium's natural rust-resistance can matter more than its lower strength for a job like this.",
  }),
  (rng) => ({
    prompt: `A construction team in ${place(rng)} is building a heavy roof truss that must support a very large structural load. Steel is heavier than aluminium and can rust — yet steel is still chosen. Why?`,
    correct: "Steel's much higher strength lets it support heavy structural loads that aluminium cannot, even though it needs rust protection",
    wrong: [
      "Aluminium is always stronger than steel for structural loads",
      "Steel is actually lighter than aluminium",
      "Aluminium conducts electricity, which matters for a roof truss",
    ],
    explanation:
      "For very heavy structural loads, steel's superior strength usually outweighs its rusting problem, which paint or galvanising can manage. Aluminium is lighter, but is not strong enough for the heaviest structural jobs.",
  }),
  (rng) => ({
    prompt: `A homeowner in humid, coastal ${place(rng)} is choosing roofing sheets. Steel is stronger than aluminium — yet many homeowners in humid coastal areas choose aluminium roofing sheets instead. Why?`,
    correct: "Aluminium resists rusting naturally in humid, salty coastal air, avoiding the frequent repainting untreated steel would need",
    wrong: [
      "Aluminium is stronger than steel",
      "Aluminium conducts electricity better, which matters for a roof",
      "Steel is always more expensive than aluminium",
    ],
    explanation:
      "Aluminium's natural oxide layer resists the humid, salty coastal air far better than untreated steel, which would rust quickly without constant repainting — even though steel is the stronger metal.",
  }),
  (rng) => ({
    prompt: `A bicycle repairer in ${place(rng)} compares steel and aluminium bicycle frames for a delivery cyclist who rides long distances daily. Steel frames are stronger and cheaper — yet many delivery cyclists prefer aluminium frames. Why?`,
    correct: "Aluminium's much lighter weight reduces rider fatigue over long daily distances, which matters more than steel's slightly greater strength for this everyday use",
    wrong: [
      "Aluminium is stronger than steel, so it lasts longer",
      "Steel conducts electricity, which is dangerous for cyclists",
      "Aluminium is magnetic, which helps the frame stay rigid",
    ],
    explanation:
      "For a cyclist covering long distances every day, aluminium's lighter weight reduces fatigue more than steel's extra strength is worth — steel is not magnetic-relevant here, and neither frame carries current.",
  }),
  (rng) => ({
    prompt: `A farmer near ${place(rng)} is choosing a metal stand to hold a heavy, full water tank. Aluminium is lighter and resists rust better than untreated steel — yet the farmer chooses a galvanised steel stand instead. Why?`,
    correct: "A full water tank is extremely heavy, and steel's much greater strength safely supports that load — galvanising protects it from rust instead of switching metals",
    wrong: [
      "Aluminium cannot be shaped into a stand",
      "Steel is a better conductor of electricity, which the stand needs",
      "Aluminium is heavier than steel, so it cannot hold the tank",
    ],
    explanation:
      "Steel's strength is what safely carries a heavy tank's load; galvanising (a zinc coating) solves the rust problem without giving up that strength for the lighter but weaker aluminium.",
  }),
  (rng) => ({
    prompt: `A boat builder in ${place(rng)}, near the ocean, is choosing fittings for a small fishing boat. Steel fittings are cheaper — yet the builder insists on aluminium fittings instead, even paying more. Why?`,
    correct: "Saltwater accelerates steel's rusting badly, while aluminium's natural oxide layer holds up far better against constant saltwater exposure",
    wrong: [
      "Steel is heavier, so it makes the boat float better",
      "Aluminium conducts electricity, which boats need",
      "Steel is not strong enough to be used for boat fittings",
    ],
    explanation:
      "Constant saltwater exposure rusts steel very quickly, so aluminium's natural rust-resistance is worth the extra cost for boat fittings, even though steel is otherwise cheaper.",
  }),
  (rng) => ({
    prompt: `A contractor near ${place(rng)} is wiring a large residential estate and wants to cut costs. Aluminium wire is significantly cheaper than copper wire — yet the contractor still chooses copper for the household wiring. Why?`,
    correct: "Copper conducts electricity more efficiently and handles household wiring loads with less risk of overheating, which outweighs the higher cost for something this critical",
    wrong: [
      "Aluminium is not a real metal, so it cannot be used for wiring",
      "Copper is lighter than aluminium, which matters for wiring",
      "Aluminium is magnetic, which interferes with electrical current",
    ],
    explanation:
      "Copper's superior conductivity makes household wiring safer against overheating, which is worth the higher cost — weight is not the deciding factor for wiring installed inside walls.",
  }),
  (rng) => ({
    prompt: `A recycling dealer in ${place(rng)} pays far more per kilogram for copper scrap than for steel scrap, even though steel is the strongest and most widely used metal. Why is copper scrap worth so much more?`,
    correct: "Copper is more difficult and costly to extract from ore than steel, and it does not corrode as fast as steel, so recovered copper retains high value",
    wrong: [
      "Copper is the most common metal overall, so it fetches a premium",
      "Steel cannot be recycled at all",
      "Copper is magnetic and therefore easier to sort automatically",
    ],
    explanation:
      "Copper is scarcer and costlier to produce from raw ore than steel, and it resists corrosion well, so scrap copper keeps more of its value — copper is not magnetic, so that is not the reason for its price.",
  }),
  (rng) => ({
    prompt: `A restaurant in ${place(rng)} is choosing pots for its kitchen. Copper is a better heat conductor than aluminium — yet most of the restaurant's everyday pots are aluminium, with only a few premium pans in copper. Why?`,
    correct: "Aluminium is far cheaper and lighter than copper, so it is practical for most daily cooking, even though copper heats slightly more evenly",
    wrong: [
      "Aluminium conducts heat better than copper",
      "Copper cannot be shaped into pots",
      "Aluminium is stronger than copper, so it lasts longer in a kitchen",
    ],
    explanation:
      "Copper is technically the better heat conductor of the two, but its high cost and weight make aluminium the practical everyday choice — only a few premium pans justify copper's cost.",
  }),
  (rng) => ({
    prompt: `Engineers building a footbridge near ${place(rng)} need a metal that is both strong and affordable for the main structural beams. Aluminium resists rusting better than steel — yet the engineers choose steel beams, protected with paint, instead. Why?`,
    correct: "Steel's far greater strength-to-cost ratio makes it the practical choice for major structural beams, and painting manages the rust risk",
    wrong: [
      "Aluminium cannot be welded into beams",
      "Steel is lighter than aluminium, which matters for bridges",
      "Aluminium conducts electricity, which is dangerous near water",
    ],
    explanation:
      "Steel is far stronger for its cost than aluminium, which matters most for major structural beams — a coat of paint manages the rust risk far more cheaply than switching the whole structure to aluminium.",
  }),
  (rng) => ({
    prompt: `A community borehole project near ${place(rng)} needs pipework to carry water from the pump to a storage tank over a long distance. Copper resists corrosion very well — yet the project team chooses galvanised steel pipes instead of copper. Why?`,
    correct: "Copper piping over such a long distance would be far too costly, and galvanised steel provides adequate corrosion resistance at a fraction of the price",
    wrong: [
      "Copper cannot carry water",
      "Steel is a better conductor of electricity than copper, which pipes need",
      "Copper is magnetic and would interfere with the pump",
    ],
    explanation:
      "For long pipe runs, copper's cost adds up quickly, so galvanised (zinc-coated) steel is chosen for adequate corrosion resistance at far lower cost — pipes don't need electrical conductivity at all.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  {
    before: "The metallic material that is strongly attracted to a magnet, due to its iron content, is ",
    after: ".",
    correctAnswer: "steel",
    acceptedAnswers: ["steel"],
    hint: "Think about which of steel, aluminium and copper contains iron.",
    explanation: "Steel is made mainly from iron, so it is strongly attracted to a magnet.",
  },
  {
    before: "The metallic material that is the lightest of the three and is commonly used for aircraft bodies is ",
    after: ".",
    correctAnswer: "aluminium",
    acceptedAnswers: ["aluminium", "aluminum"],
    hint: "Think about which metal keeps an aircraft's weight down.",
    explanation: "Aluminium is much lighter than steel and copper, which is why it is used for aircraft bodies and drink cans.",
  },
  {
    before: "The metallic material that conducts both heat and electricity the best of the three is ",
    after: ".",
    correctAnswer: "copper",
    acceptedAnswers: ["copper"],
    hint: "Think about which metal is used for household electrical wiring.",
    explanation: "Copper is the best conductor of heat and electricity of the three metals, which is why it is the standard choice for electrical wiring.",
  },
  {
    before: "The metallic material with a reddish-brown appearance is ",
    after: ".",
    correctAnswer: "copper",
    acceptedAnswers: ["copper"],
    hint: "Think about the colour of new electrical wire or coins.",
    explanation: "Copper has a distinctive reddish-brown colour, unlike the silvery-grey of steel and aluminium.",
  },
  {
    before: "The metallic material that resists rusting by forming its own protective oxide layer is ",
    after: ".",
    correctAnswer: "aluminium",
    acceptedAnswers: ["aluminium", "aluminum"],
    hint: "Think about which metal is used for window frames and roofing sheets in humid areas.",
    explanation: "Aluminium forms a thin, tough oxide layer on its surface that protects it from rusting, unlike untreated steel.",
  },
  {
    before: "The strongest of the three metallic materials, commonly used to reinforce concrete and build gate frames, is ",
    after: ".",
    correctAnswer: "steel",
    acceptedAnswers: ["steel"],
    hint: "Think about which metal is used inside concrete pillars.",
    explanation: "Steel is the strongest and most hard-wearing of the three metals, which is why it is used for tools, gates and building frames.",
  },
  {
    before: "The metallic material that slowly reacts with air and moisture to form a green patina is ",
    after: ".",
    correctAnswer: "copper",
    acceptedAnswers: ["copper"],
    hint: "Think about old copper roofing sheets or statues.",
    explanation: "Unlike steel, which rusts reddish-brown, copper reacts slowly with air and moisture to form a green surface layer called a patina.",
  },
  {
    before: "The metallic material most commonly used to make drink cans, because it is light and easy to shape, is ",
    after: ".",
    correctAnswer: "aluminium",
    acceptedAnswers: ["aluminium", "aluminum"],
    hint: "Think about which metal keeps a drink can light to carry.",
    explanation: "Aluminium's light weight and easy shaping make it the standard material for drink cans.",
  },
  {
    before: "Of the three metallic materials, the heaviest by density is ",
    after: ".",
    correctAnswer: "copper",
    acceptedAnswers: ["copper"],
    hint: "Think about which metal feels heaviest for its size.",
    explanation: "Copper is the densest (heaviest for its size) of the three metals, followed by steel, with aluminium the lightest.",
  },
  {
    before: "The metallic material typically used for spanners, hand tools and welded gates because of its strength is ",
    after: ".",
    correctAnswer: "steel",
    acceptedAnswers: ["steel"],
    hint: "Think about which metal a jua kali workshop uses for tools and gate frames.",
    explanation: "Steel's strength and hard-wearing nature make it the standard choice for hand tools and welded gates.",
  },
  {
    before: "The metallic material chosen for long overhead power transmission lines, mainly because it is much lighter than copper, is ",
    after: ".",
    correctAnswer: "aluminium",
    acceptedAnswers: ["aluminium", "aluminum"],
    hint: "Think about which metal keeps long power cables from being too heavy to support.",
    explanation: "Aluminium conducts electricity slightly less well than copper, but its much lower weight makes it the practical choice for long overhead power lines.",
  },
] as const;

export const metallicMaterials: Skill = {
  id: "g7-pt-mat-metallic-materials",
  code: "MAT.2",
  subjectId: "pre-technical",
  strandId: "g7-pt-materials",
  grade: 7,
  title: "Metallic materials",
  description: "Identifying steel, aluminium and copper; their physical properties (magnetism, conductivity, appearance, rusting/corrosion); relating each metal to its use in real Kenyan work settings; and comparing their density.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "identify-metal",
        "property-match",
        "use-match",
        "property-sort",
        "density-order",
        "reasoning",
        "evaluate",
        "categorize-items",
        "fill-blank",
      ] as const
    );

    if (branch === "identify-metal") {
      const target = randChoice(rng, METALS);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        METALS.filter((m) => m.id !== target.id).map((m) => m.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: "Identify this metallic material.",
        visual: { type: "material-swatch", material: target.material },
        choices,
        correctIndex,
        layout: "list",
        explanation: `This is ${target.label}. ${target.property}, and it is used for ${target.use.toLowerCase()}.`,
      };
    }

    if (branch === "property-match") {
      const tokens = shuffle(rng, METALS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, METALS.map((m) => ({ id: m.id, label: m.property })));
      const correctMap: Record<string, string> = {};
      for (const m of METALS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Match each metal to its key physical property.",
        tokens,
        targets,
        correctMap,
        hint: "Think about magnetism, weight, appearance and conductivity.",
        explanation: METALS.map((m) => `${m.label} — ${m.property}.`).join(" "),
      };
    }

    if (branch === "use-match") {
      const tokens = shuffle(rng, METALS.map((m) => ({ id: m.id, label: m.label })));
      const targets = shuffle(rng, METALS.map((m) => ({ id: m.id, label: m.use })));
      const correctMap: Record<string, string> = {};
      for (const m of METALS) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Match each metal to how it is commonly used.",
        tokens,
        targets,
        correctMap,
        hint: "Think about which property of each metal makes it suited to that use.",
        explanation: METALS.map((m) => `${m.label} — ${m.use}.`).join(" "),
      };
    }

    if (branch === "property-sort") {
      const chosen = shuffle(rng, PROPERTY_FACTS).slice(0, 9);
      const items = chosen.map((p, i) => ({ id: `p${i}`, label: p.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`p${i}`] = p.metal));
      return {
        kind: "categorize",
        prompt: "Sort each property fact by the metal it describes: steel, aluminium, or copper.",
        items,
        buckets: METALS.map((m) => ({ id: m.id, label: m.label })),
        correctBucket,
        hint: "Think about magnetism (steel), light weight (aluminium), and conductivity/colour (copper).",
        explanation: chosen.map((p) => `"${p.text}" describes ${METALS.find((m) => m.id === p.metal)!.label}.`).join(" "),
      };
    }

    if (branch === "categorize-items") {
      const chosen = shuffle(rng, REAL_WORLD_ITEMS);
      const items = chosen.map((it) => ({ id: it.id, label: it.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((it) => (correctBucket[it.id] = it.metal));
      return {
        kind: "categorize",
        prompt: "Sort each real-world item by the metal it is most commonly made from.",
        items,
        buckets: METALS.map((m) => ({ id: m.id, label: m.label })),
        correctBucket,
        hint: "Think about which property of steel, aluminium or copper makes each item work well.",
        explanation: chosen
          .map((it) => `${it.label} — ${METALS.find((m) => m.id === it.metal)!.label}.`)
          .join(" "),
      };
    }

    if (branch === "density-order") {
      const shuffled = shuffle(rng, METALS);
      return {
        kind: "ordering",
        prompt: "Arrange these metals from lightest to heaviest by density.",
        items: shuffled.map((m) => ({ id: m.id, label: m.label })),
        correctOrder: [...METALS].sort((a, b) => a.density - b.density).map((m) => m.id),
        instruction: "Drag to arrange from lightest to heaviest.",
        hint: "Aluminium is the lightest of the three; copper is the heaviest.",
        explanation: "By density, from lightest to heaviest: Aluminium, Steel, Copper.",
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
        explanation: q.explanation,
      };
    }

    if (branch === "evaluate") {
      const q = randChoice(rng, EVALUATE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence.",
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
