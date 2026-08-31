import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// 11 distinct sources, 8 natural + 3 manufactured/stored (pool-size floor: categorize fact pools need 10+).
const SOURCES = [
  { name: "Hydro-electric power (e.g. the Seven Forks dams on the Tana River)", type: "natural" },
  { name: "Geothermal power (e.g. steam from underground at Olkaria)", type: "natural" },
  { name: "Solar power (sunlight)", type: "natural" },
  { name: "Wind power (moving air turning turbines)", type: "natural" },
  { name: "Fossil fuels (coal, petroleum)", type: "natural" },
  { name: "Biomass (burning plant or animal waste)", type: "natural" },
  { name: "Nuclear power (energy released from uranium in a reactor)", type: "natural" },
  { name: "Tidal/wave power (energy from moving ocean water)", type: "natural" },
  { name: "Dry cell batteries (used in torches and remote controls)", type: "manufactured" },
  { name: "Rechargeable batteries (used in phones and power banks)", type: "manufactured" },
  { name: "Car (lead-acid) batteries", type: "manufactured" },
] as const;

// 10 distinct appliance/safety pairs (pool-size floor: click-match fact pools need 10+).
const APPLIANCE_SAFETY = [
  { appliance: "Electric iron box", safety: "Unplug it after use and never leave it switched on unattended, as it can scorch fabric or start a fire." },
  { appliance: "Electric kettle", safety: "Never overfill it above the marked line, and keep it away from touching water sources." },
  { appliance: "Electric fan", safety: "Keep the blades covered by a guard so fingers cannot reach the moving blades." },
  { appliance: "Television", safety: "Never touch its plug or switch with wet hands, since water conducts electricity." },
  { appliance: "Electric cooker", safety: "Turn it off at the socket when not in use to avoid it overheating unattended." },
  { appliance: "Phone charger", safety: "Unplug it once the phone is fully charged, and never use one with a frayed or damaged cable." },
  { appliance: "Electric heater", safety: "Keep it away from curtains, papers or anything flammable, and never leave it running unattended overnight." },
  { appliance: "Refrigerator", safety: "Avoid touching it with wet hands and check the plug and socket regularly, since dampness near the compressor is a shock risk." },
  { appliance: "Radio/music system", safety: "Keep liquids away from it and unplug it during a lightning storm." },
  { appliance: "Washing machine", safety: "Ensure it is properly earthed and never operate it with wet hands, since water and electricity together increase shock risk." },
] as const;

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma",
  "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru",
] as const;

const KENYAN_PLACES = [
  "Kisumu", "Eldoret", "Nakuru", "Kitengela", "Thika", "Nyeri",
  "Kitale", "Machakos", "Mombasa", "Meru", "Kericho", "Kakamega",
] as const;

function name(rng: RNG) {
  return randChoice(rng, KENYAN_NAMES);
}
function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

// 10 distinct Apply/Analyze/Evaluate-tier scenario templates (pool-size floor for reasoning multiple-choice branches).
const SAFETY_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  () => ({
    prompt: "Why should you never touch an electrical switch or appliance with wet hands?",
    correct: "Water conducts electricity, so wet hands greatly increase the risk of a dangerous electric shock.",
    wrong: ["Wet hands make switches harder to press.", "It has no effect on safety.", "It only damages the appliance, never the person."],
    explanation: "Water is a good conductor of electricity, so touching a switch or appliance with wet hands sharply increases the risk of a serious electric shock.",
  }),
  () => ({
    prompt: "Why is it unsafe to plug too many appliances into one socket at the same time?",
    correct: "It can overload the circuit, causing the wires to overheat and potentially start a fire.",
    wrong: ["It makes the appliances run faster.", "It saves electricity.", "It has no safety risk at all."],
    explanation: "Overloading a socket draws more current than the wiring is designed for, which can overheat the wires and start a fire.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices a bare, exposed wire hanging from a wall socket at home in ${place(rng)}. What should ${who} do?`,
      correct: "Switch off the power at the mains and inform an adult or an electrician immediately, without touching the wire.",
      wrong: [
        "Touch it briefly to check whether it is live.",
        "Ignore it, since it probably isn't dangerous.",
        "Wrap it in cloth to hide it and continue using the room as normal.",
      ],
      explanation: "A bare wire could be live and cause a serious shock. The safe response is to cut power at the mains and get a qualified person to fix it — never test it by touch, and hiding it with cloth does not remove the danger.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} wants to fly a kite near overhead power lines in ${place(rng)}. Why is this dangerous, even if the kite string never actually touches the wires?`,
      correct: "High-voltage current in overhead lines can arc across a small gap to a nearby conductor, such as a damp kite string, causing a fatal shock without direct contact.",
      wrong: [
        "There is no real danger as long as the kite doesn't touch the wires.",
        "The wires are too high up to matter at all.",
        "Kites are always dangerous near buildings, but not near power lines specifically.",
      ],
      explanation: "High voltage can jump a small air gap to a nearby conductor, especially a wet or damp string — this is why flying kites near overhead power lines is dangerous even without direct contact.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `During a thunderstorm in ${place(rng)}, ${who} unplugs the television and radio at home. Why?`,
      correct: "Lightning can send a sudden power surge through the household wiring, which can damage appliances or start a fire — unplugging protects them.",
      wrong: [
        "Unplugging during a storm mainly saves electricity.",
        "It is done only to avoid boredom during the storm.",
        "Unplugging appliances during a storm has no real safety benefit.",
      ],
      explanation: "A lightning strike near power lines can send a damaging surge of current through household wiring — unplugging sensitive appliances during a storm protects them from this surge.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} notices a frayed, exposed electrical cord on the iron box at home in ${place(rng)}. What is the safest action?`,
      correct: "Stop using it immediately and have the cord repaired or replaced by a qualified person before using it again.",
      wrong: [
        "Cover the exposed part with a bit of tape and keep using it as normal.",
        "Keep using it, since only the plug end of a cord is ever dangerous.",
        "Use it, but only for a few minutes at a time.",
      ],
      explanation: "A frayed cord can expose live wires that shock the user or cause a fire. Ordinary tape is not a safe or permanent fix — a damaged cord needs proper repair or replacement before the appliance is used again.",
    };
  },
  (rng) => ({
    prompt: `Before ${name(rng)} attempts to clean or fix any electrical appliance in ${place(rng)}, why should it always be switched off and unplugged first?`,
    correct: "This removes the risk of electric shock while hands or tools are near or inside parts that would otherwise be live.",
    wrong: [
      "It is done only to save electricity while cleaning.",
      "It is done only to keep the appliance from getting dusty.",
      "It has no real safety purpose, only a tidiness one.",
    ],
    explanation: "An appliance that is still plugged in and switched on can still carry live current to its internal parts — unplugging it first removes the shock risk before hands or tools go near those parts.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} asks why a metal-bodied appliance like a refrigerator or washing machine in ${place(rng)} should be properly earthed. What is the reason?`,
      correct: "Earthing gives a safe path for stray current to flow into the ground if a fault occurs, protecting the user from shock.",
      wrong: [
        "Earthing makes the appliance run faster or more efficiently.",
        "Earthing prevents the appliance's metal casing from rusting.",
        "Earthing has no real safety purpose for a household appliance.",
      ],
      explanation: "If a fault causes the metal casing of an appliance to become live, an earth wire gives that current a safe path to the ground instead of through a person who touches it.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} sees water spilled near a power socket in the kitchen in ${place(rng)}. What should be done before that socket is used again?`,
      correct: "Switch off the power supply to that socket and make sure the area is completely dry before using it again.",
      wrong: [
        "Mop up the water while the socket stays switched on.",
        "Ignore it, since household sockets are waterproof.",
        "Use a hairdryer plugged into the same socket to dry the area quickly.",
      ],
      explanation: "Water near a live socket is a serious shock risk. The power should be switched off first, and the area dried completely, before the socket is used again — sockets are not waterproof.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} learns that the fuse box at home in ${place(rng)} cut off power to one room automatically after a fault. What is the fuse's job in doing this?`,
      correct: "A fuse (or circuit breaker) automatically cuts off the current if it becomes dangerously high, preventing overheating and fire.",
      wrong: [
        "A fuse makes electricity flow faster through the circuit.",
        "A fuse's main job is to save money on the electricity bill.",
        "A fuse has no real function beyond being a switch that is turned on and off by hand.",
      ],
      explanation: "A fuse or circuit breaker is a safety device: if current rises to a dangerous level (such as from a fault or overload), it automatically breaks the circuit, preventing overheating and fire before real damage occurs.",
    };
  },
];

const HAZARD_RESPONSE_STEPS = [
  { id: "no-touch", label: "Do not touch the appliance, socket, or exposed wire" },
  { id: "switch-off", label: "Switch off the power at the mains or socket" },
  { id: "unplug", label: "Unplug the appliance if it is safe to do so" },
  { id: "inform", label: "Inform an adult or a qualified electrician" },
  { id: "wait", label: "Wait until the hazard is properly fixed before using it again" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "A source of energy that can be naturally replenished, such as sunlight or wind, is called ", after: ".", correctAnswer: "renewable", accepted: ["renewable"], explanation: "A renewable energy source, such as sunlight or wind, is naturally replenished and does not run out." },
  { before: "A source of energy that is limited and cannot be quickly replaced, such as fossil fuels, is called ", after: ".", correctAnswer: "non-renewable", accepted: ["non-renewable", "nonrenewable"], explanation: "A non-renewable energy source, such as coal or petroleum, is limited and cannot be quickly replaced." },
  { before: "A safety device that automatically cuts off current if it becomes dangerously high is called a ", after: ".", correctAnswer: "fuse", accepted: ["fuse"], explanation: "A fuse (or circuit breaker) automatically cuts off current if it becomes dangerously high, preventing overheating and fire." },
  { before: "Connecting an appliance's metal casing to the ground, to give stray current a safe path, is called ", after: ".", correctAnswer: "earthing", accepted: ["earthing"], explanation: "Earthing connects an appliance's metal casing to the ground, giving stray current a safe path away from the user." },
  { before: "A material that allows electric current to pass through it easily is called a ", after: ".", correctAnswer: "conductor", accepted: ["conductor"], explanation: "A conductor, such as copper wire or water, allows electric current to pass through it easily." },
  { before: "A material that does not allow electric current to pass through it is called an ", after: ".", correctAnswer: "insulator", accepted: ["insulator"], explanation: "An insulator, such as rubber or plastic, does not allow electric current to pass through it." },
] as const;

export const electricalEnergy: Skill = {
  id: "g7-sci-fe-electrical",
  code: "FE.1",
  subjectId: "science",
  strandId: "g7-sci-fe",
  grade: 7,
  title: "Electrical energy",
  description: "Sources of electricity, how current flows in a simple circuit, common electrical appliances, and safety measures when using them.",
  generate(rng) {
    const branch = randChoice(rng, ["circuit-predict", "source-sort", "appliance-safety-match", "safety-knowledge", "fill-blank", "hazard-order"] as const);

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Complete the sentence about electrical energy.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: [...fb.accepted],
        inputMode: "text",
        hint: "Think about the vocabulary used to describe energy sources, safety devices, and materials.",
        explanation: fb.explanation,
      };
    }

    if (branch === "hazard-order") {
      const items = shuffle(rng, HAZARD_RESPONSE_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps for safely responding to an electrical hazard, such as an exposed wire, in order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: HAZARD_RESPONSE_STEPS.map((s) => s.id),
        hint: "Never touch the hazard first — cut the power, then get help, then wait for a proper fix.",
        explanation: HAZARD_RESPONSE_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    if (branch === "circuit-predict") {
      const closed = randChoice(rng, [true, false]);
      const includeResistor = randChoice(rng, [true, false]);
      const components: ("cell" | "bulb" | "switch" | "resistor")[] = includeResistor
        ? ["cell", "switch", "resistor", "bulb"]
        : ["cell", "switch", "bulb"];
      const correct = closed ? "The bulb lights up." : "The bulb stays off.";
      const choices = shuffle(rng, ["The bulb lights up.", "The bulb stays off.", "The bulb flickers rapidly."]);
      const correctIndex = choices.indexOf(correct);
      return {
        kind: "multiple-choice",
        prompt: `In this circuit, the switch is ${closed ? "closed" : "open"}. What happens to the bulb?`,
        visual: { type: "circuit", components, closed },
        choices,
        correctIndex,
        layout: "list",
        hint: "Current can only flow all the way around a complete (closed) circuit.",
        explanation: closed
          ? "The switch is closed, so the circuit is complete. Current flows all the way round, through the bulb's filament, so it lights up."
          : "The switch is open, leaving a gap in the circuit. Current cannot cross the gap, so no current reaches the bulb and it stays off.",
      };
    }

    if (branch === "source-sort") {
      const chosen = shuffle(rng, SOURCES).slice(0, 6);
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.type));
      return {
        kind: "categorize",
        prompt: "Sort each source of electricity as a natural/environmental source or a manufactured/stored source.",
        items,
        buckets: [
          { id: "natural", label: "Natural/environmental source" },
          { id: "manufactured", label: "Manufactured/stored source" },
        ],
        correctBucket,
        hint: "A natural source produces electricity directly from the environment (sun, wind, water, heat, fuel). A manufactured source stores electrical energy chemically.",
        explanation: chosen.map((c) => `${c.name} is a ${c.type === "natural" ? "natural/environmental" : "manufactured/stored"} source.`).join(" "),
      };
    }

    if (branch === "appliance-safety-match") {
      const chosen = shuffle(rng, APPLIANCE_SAFETY).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `p${i}`, label: a.appliance })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `p${i}`, label: a.safety })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((a, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: "Match each electrical appliance to its key safety measure.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what could go wrong with each appliance if used carelessly.",
        explanation: chosen.map((a) => `${a.appliance}: ${a.safety}`).join(" "),
      };
    }

    const q = randChoice(rng, SAFETY_TEMPLATES)(rng);
    const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      hint: "Think about what makes electricity dangerous, and what step actually removes that danger.",
      explanation: q.explanation,
    };
  },
};
