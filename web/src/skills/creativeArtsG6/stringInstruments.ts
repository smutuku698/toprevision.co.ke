import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { place, name, buildScenarioChoices } from "./g6CasShared";
import type { ScenarioMC } from "./g6CasShared";

// KICD Grade 6 Creative Arts, sub-strand 1.1 "String Musical Instruments and Drawing" — the
// music/craft half (identification, parts/functions, care, and making a fiddle from recyclables).
// The stippling-drawing half of this same sub-strand ships separately as stipplingDrawing.ts (C.2),
// per curriculum-reference/grade-6/creative-arts.json's split note — two genuinely distinct
// techniques named in one sub-strand.
//
// Instrument set: only real, documented Kenyan indigenous string instruments across different
// communities are named, per the brief's "responsibly research" instruction — nyatiti and orutu
// (Luo), litungu (Luhya), obokano (Gusii/Kisii), zeze (coastal Mijikenda/Swahili). No instrument
// name is invented; each is well documented in Kenyan ethnomusicology sources.

const INSTRUMENTS = [
  { id: "nyatiti", label: "Nyatiti", community: "Luo", method: "plucked" as const },
  { id: "orutu", label: "Orutu", community: "Luo", method: "bowed" as const },
  { id: "litungu", label: "Litungu", community: "Luhya", method: "plucked" as const },
  { id: "obokano", label: "Obokano", community: "Gusii (Kisii)", method: "plucked" as const },
  { id: "zeze", label: "Zeze", community: "Mijikenda and Swahili (coastal)", method: "plucked" as const },
] as const;

// Verbatim-style content facts, each uniquely identifying one instrument — 12 facts across 5
// instruments (well past the 10-fact combined floor for a categorize/click-match pool).
const INSTRUMENT_FACTS = [
  { text: "This eight-stringed lyre has a bowl-shaped wooden body and is plucked while the player sits with the instrument tilted against their body", id: "nyatiti" },
  { text: "This instrument is strongly associated with the Luo community around Lake Victoria, and its style influenced later benga guitar music", id: "nyatiti" },
  { text: "A player of this instrument often wears metal rings on their toes to add a rhythmic jingling sound while playing", id: "nyatiti" },
  { text: "This is the only one of these five instruments played with a bow instead of being plucked", id: "orutu" },
  { text: "This fiddle has just a single string, and its small resonator was traditionally made from a tin can or a gourd", id: "orutu" },
  { text: "This eight-stringed bowl lyre is plucked by Luhya musicians, and its resonator is traditionally covered with stretched animal skin", id: "litungu" },
  { text: "This instrument is often played at community celebrations and traditional dances among the Luhya community of western Kenya", id: "litungu" },
  { text: "This is the largest and lowest-pitched of the Kenyan bowl lyres named here, plucked by Gusii (Kisii) musicians", id: "obokano" },
  { text: "This instrument is traditionally played at important community events such as storytelling sessions and ceremonies among the Gusii community", id: "obokano" },
  { text: "Unlike the bowl-shaped lyres, this instrument has a flat, box-shaped body", id: "zeze" },
  { text: "This plucked instrument is played by Mijikenda and Swahili communities along the Kenyan coast", id: "zeze" },
  { text: "This instrument's box-shaped body is sometimes paired with a small attached resonator to help project its sound further", id: "zeze" },
] as const;

const PARTS = [
  { id: "body", label: "Body (resonator)", xPercent: 25, yPercent: 60, fn: "The body (resonator) is the hollow chamber that amplifies the strings' vibration into a loud, full sound" },
  { id: "neck", label: "Neck", xPercent: 50, yPercent: 28, fn: "The neck is the long arm the player's fingers press against to change the pitch of each string" },
  { id: "strings", label: "Strings", xPercent: 50, yPercent: 55, fn: "The strings vibrate when plucked or bowed, producing the instrument's actual sound" },
  { id: "tuning-pegs", label: "Tuning pegs", xPercent: 50, yPercent: 8, fn: "The tuning pegs are turned to tighten or loosen a string, raising or lowering its pitch" },
  { id: "bridge", label: "Bridge", xPercent: 50, yPercent: 77, fn: "The bridge lifts the strings off the body and transfers their vibration into the resonator" },
  { id: "bow", label: "Bow", xPercent: 79, yPercent: 20, fn: "The bow is drawn across a string to make it vibrate continuously — used to play a bowed instrument like the orutu" },
] as const;

const FIDDLE_STEPS = [
  { id: "f1", label: "Gather recyclable materials for the body, neck, strings and tuning pegs (e.g. a tin or plastic container, a stick, wire or string, bottle caps)" },
  { id: "f2", label: "Plan and sketch the fiddle's shape before starting to build it" },
  { id: "f3", label: "Prepare and safely cut the body material to form the resonator, observing safety with cutting tools" },
  { id: "f4", label: "Fix the neck firmly to the body" },
  { id: "f5", label: "Attach the tuning pegs near the top of the neck" },
  { id: "f6", label: "Stretch and tie the strings from the tuning pegs down to the base of the body" },
  { id: "f7", label: "Tune the strings and test the sound, adjusting the tuning pegs as needed" },
] as const;

const CARE_FACTS = [
  { text: "Storing a string instrument in a dry place helps prevent its wooden body from warping or cracking", isTrue: true },
  { text: "Wiping the strings after playing helps remove sweat and dirt that could cause them to corrode", isTrue: true },
  { text: "Loosening the strings slightly before long-term storage can help reduce constant tension on the neck and body", isTrue: true },
  { text: "Leaving a string instrument in direct sunlight all day helps keep it dry and protects the wood", isTrue: false },
  { text: "It is safe to store a string instrument in a very damp room, because moisture makes the wood stronger", isTrue: false },
  { text: "Carrying an instrument by its neck with a firm, supportive grip helps prevent it from being dropped", isTrue: true },
  { text: "Tuning pegs should always be turned as hard as possible to keep the strings permanently in tune", isTrue: false },
  { text: "Keeping an instrument away from young children who might handle it roughly helps protect it from damage", isTrue: true },
  { text: "Cleaning dust off the body with a soft, dry cloth helps keep the instrument looking and sounding its best", isTrue: true },
  { text: "A cracked or damaged resonator body will not affect how the instrument sounds, only how it looks", isTrue: false },
  { text: "Placing an instrument in a padded bag or case for transport helps protect it from knocks and scratches", isTrue: true },
  { text: "New strings never need retuning once they are first fitted onto the instrument", isTrue: false },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is playing a nyatiti at a school concert in ${place(rng)} when a string keeps sounding flat and out of tune. Which part should ${who} adjust to fix the pitch?`,
      correct: "The tuning pegs — turning them tightens or loosens the string to correct its pitch",
      wrong: [
        "The bridge — moving it changes how loudly the instrument plays, not its pitch",
        "The body — reshaping it would only change the instrument's tone, not fix one flat string",
        "The bow — a nyatiti is plucked, so a bow would not help tune a string",
      ],
      explanation: "Turning a tuning peg tightens or loosens its string, raising or lowering the pitch. The bridge, body and bow all affect the sound in other ways, but none of them corrects pitch the way the tuning pegs do.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} notices that the strings on a school orutu in ${place(rng)} keep slipping loose overnight, going out of tune by the next lesson. Which part is most likely not gripping the strings firmly enough?`,
    correct: "The tuning pegs — if they are worn or loose-fitting, they slowly unwind and let the string go slack",
    wrong: [
      "The bridge — a loose bridge would make the instrument fall apart, not just go out of tune",
      "The neck — a warped neck changes playing comfort, not overnight tuning",
      "The body — the resonator's shape does not affect how tightly a string is held",
    ],
    explanation: "Tuning pegs must grip firmly to hold a string's tension. If they are worn or loose, they slowly unwind overnight, letting the string go flat — the bridge, neck and body do not hold string tension the way the pegs do.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is choosing which of five indigenous string instruments to feature at a ${place(rng)} school cultural day, and wants one that is played with a bow rather than plucked. Which instrument should ${who} choose?`,
      correct: "Orutu",
      wrong: ["Nyatiti", "Litungu", "Obokano"],
      explanation: "The orutu is unique among these five instruments in being played with a bow — nyatiti, litungu and obokano are all plucked.",
    };
  },
  (rng) => ({
    prompt: `A cultural resource centre near ${place(rng)} displays an eight-stringed bowl lyre that is noticeably larger and deeper-toned than the others, plucked by Gusii musicians. Which instrument is this?`,
    correct: "Obokano",
    wrong: ["Litungu", "Nyatiti", "Zeze"],
    explanation: "The obokano is the largest and lowest-pitched of the Kenyan bowl lyres named here, and it is played by Gusii (Kisii) musicians — litungu and nyatiti are smaller bowl lyres from other communities, and zeze has a box-shaped body, not a bowl shape.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} packs a school string instrument into a bag after a rehearsal in ${place(rng)} by grabbing the thin wooden arm running up from the body. What part is ${who} holding, and why does it need a firm, supportive grip?`,
      correct: "The neck — it is where the player's fingers press the strings, and a careless grip can twist or crack it",
      wrong: [
        "The bridge — but the bridge is a small piece resting on the body, not something you would carry the instrument by",
        "The bow — but a plucked instrument like this one is not played with a bow at all",
        "The tuning pegs — but gripping only the pegs would not support the rest of the instrument's weight",
      ],
      explanation: "The neck is the long arm the player's fingers press against, and it needs a firm, supportive grip when carried because careless handling can twist or crack it.",
    };
  },
  (rng) => ({
    prompt: `Before storing a school's string instruments for the holidays, a teacher in ${place(rng)} asks the class why loosening the strings slightly is a good idea. What is the best reason?`,
    correct: "It reduces the constant tension pulling on the neck and body, lowering the risk of warping or cracking over time",
    wrong: [
      "It permanently changes the instrument's pitch to a lower note",
      "It makes the wood absorb moisture faster, which protects it",
      "It has no real effect and is done only out of habit",
    ],
    explanation: "Constant string tension can slowly warp or crack an instrument's neck and body over a long storage period, so loosening the strings slightly reduces that strain — it does not permanently change the instrument's pitch.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked why indigenous string instruments such as the nyatiti and litungu are still taught in ${place(rng)} schools today, even though many students also learn modern instruments. What is the best answer?`,
      correct: "They carry each community's cultural identity and musical knowledge, passing it on to the next generation",
      wrong: [
        "They are easier to build than any modern instrument",
        "They are the only instruments allowed in Kenyan music exams",
        "They produce louder sound than modern instruments",
      ],
      explanation: "Indigenous string instruments carry each community's cultural identity, stories and musical knowledge — teaching them passes that heritage on to the next generation, which is why they remain valued alongside modern instruments.",
    };
  },
  (rng) => ({
    prompt: `A visitor to a cultural centre near ${place(rng)} sees a plucked, box-bodied string instrument, quite different in shape from the bowl-shaped lyres nearby, and is told it comes from coastal communities. Which instrument is this?`,
    correct: "Zeze",
    wrong: ["Nyatiti", "Obokano", "Litungu"],
    explanation: "The zeze has a flat, box-shaped body — unlike the bowl-shaped lyres (nyatiti, obokano, litungu) — and is played by Mijikenda and Swahili communities along the Kenyan coast.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} spills a little water near a display of school string instruments in ${place(rng)} and quickly wipes them dry. Why is drying them promptly the right response, rather than leaving them to air-dry slowly in a closed cupboard?`,
      correct: "Dampness left on wood can cause it to swell, warp, or grow mould over time",
      wrong: [
        "Water actually strengthens wood, so drying it quickly is unnecessary",
        "Wet strings tune more accurately, so this is actually helpful",
        "Wood is not affected by water at all, so either approach works equally well",
      ],
      explanation: "Dampness left sitting on an instrument's wood can cause swelling, warping, or mould over time, so wiping it dry promptly protects the instrument — wood is very much affected by moisture.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s class in ${place(rng)} builds fiddles from recyclable materials, observing safety throughout the activity. Why is "observing safety" specifically emphasised for this activity?`,
    correct: "Because making a fiddle involves cutting and shaping materials, and tools used carelessly can cause injury",
    wrong: [
      "Because playing any string instrument is physically dangerous",
      "Because recyclable materials are toxic to touch",
      "Because only a teacher is allowed to hold the finished fiddle",
    ],
    explanation: "Making a fiddle involves cutting, shaping and assembling materials with tools, so safety is emphasised to prevent injury during those steps — the finished instrument itself is not dangerous to play or hold.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} removes the small dark block sitting under the strings on a school fiddle in ${place(rng)} and finds the sound becomes very faint. What was this part doing?`,
      correct: "The bridge — it lifts the strings off the body and passes their vibration into the resonator, making the sound louder",
      wrong: [
        "The tuning pegs — but those only set the pitch, not the loudness",
        "The neck — but the neck is only where fingers press the strings",
        "The bow — but this instrument does not use a bow at all",
      ],
      explanation: "The bridge holds the strings up off the body and transfers their vibration into the hollow resonator, which is what makes the sound loud and full — without it, the sound becomes very faint.",
    };
  },
];

const FILL_BLANK_TEMPLATES = [
  { before: "The Luo string instrument that is an eight-stringed bowl lyre, plucked with the fingers, is called the ", after: ".", correctAnswer: "nyatiti" },
  { before: "The only one of these five instruments played with a bow instead of being plucked is the ", after: ".", correctAnswer: "orutu" },
  { before: "The eight-stringed bowl lyre plucked by Luhya musicians, with a skin-covered resonator, is called the ", after: ".", correctAnswer: "litungu" },
  { before: "The largest and lowest-pitched of the Kenyan bowl lyres, plucked by Gusii (Kisii) musicians, is called the ", after: ".", correctAnswer: "obokano" },
  { before: "The box-bodied plucked string instrument played by coastal Mijikenda and Swahili communities is called the ", after: ".", correctAnswer: "zeze" },
  { before: "The part of a string instrument that is turned to tighten or loosen a string and change its pitch is called the ", after: ".", correctAnswer: "tuning peg", acceptedAnswers: ["tuning peg", "tuning pegs"] },
  { before: "The long arm of a string instrument that the player's fingers press to change pitch is called the ", after: ".", correctAnswer: "neck" },
  { before: "The hollow chamber of a string instrument that amplifies the strings' vibration into sound is called the ", after: " (resonator).", correctAnswer: "body", acceptedAnswers: ["body", "resonator"] },
  { before: "The small piece that lifts the strings off the body and transfers their vibration into the resonator is called the ", after: ".", correctAnswer: "bridge" },
  { before: "A tool drawn across a string to make it vibrate continuously, used to play instruments such as the orutu, is called a ", after: ".", correctAnswer: "bow" },
  { before: "Loosening an instrument's strings before long storage helps reduce the ", after: " pulling on its neck and body.", correctAnswer: "tension" },
  { before: "String instruments should be stored in a ", after: " place, away from direct sunlight and dampness, to protect their wood.", correctAnswer: "dry" },
] as const;

const IDENTIFY_PROMPTS = [
  "Which instrument matches this description?",
  "Read the description and identify the instrument.",
  "Which of these five Kenyan string instruments fits this description?",
  "Name the indigenous string instrument described here.",
  "Which instrument is being described below?",
  "Use the description to identify the correct instrument.",
] as const;

const FACT_SORT_PROMPTS = [
  "Sort each fact by the instrument it describes.",
  "Which instrument does each fact below describe? Sort them.",
  "Match each description to the correct instrument by sorting.",
  "Read each fact and sort it under the instrument it belongs to.",
  "Sort these facts about Kenyan string instruments by which instrument they describe.",
] as const;

const PARTS_MATCH_PROMPTS = [
  "Match each part of a string instrument to its function.",
  "Pair each instrument part with what it does.",
  "Match each labelled part to the job it performs.",
  "Connect each part of the instrument to its correct function.",
  "For each part below, choose its matching function.",
] as const;

const HOTSPOT_PROMPTS = [
  "Click the pin, then select the name of the labelled part.",
  "Find the labelled part on the diagram and name it.",
  "Click the marked pin, then identify that part of the instrument.",
  "Which part is marked on this fiddle diagram? Click the pin first.",
  "Identify the part indicated by the pin on the diagram.",
] as const;

const CARE_PROMPTS = [
  "Sort each statement about caring for a string instrument as true or false.",
  "Decide whether each care statement below is true or false.",
  "Which of these statements about handling and storing instruments are true?",
  "Read each care tip and sort it as true or false.",
  "Some of these care statements are correct and some are not — sort each one.",
] as const;

const STEPS_PROMPTS = [
  "Put the steps of making a fiddle from recyclable materials in the correct order.",
  "Arrange these fiddle-making steps in the right order.",
  "Place these steps for building a recyclable-materials fiddle in order.",
  "Order the steps for making a fiddle, from first to last.",
  "Sort these fiddle-making steps into the correct sequence.",
] as const;

const COMMUNITY_PROMPTS = [
  "Which community is the {instrument} played by?",
  "The {instrument} is traditionally played by which community?",
  "Identify the community associated with the {instrument}.",
  "Which community traditionally plays the {instrument}?",
  "Name the community the {instrument} comes from.",
] as const;

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Complete this sentence about string instruments.",
  "Fill in the blank below.",
  "Complete the sentence with the correct word.",
] as const;

export const stringInstruments: Skill = {
  id: "g6-cas-string-instruments",
  code: "C.1",
  subjectId: "creative-arts-sports",
  strandId: "g6-cas-creating-executing",
  grade: 6,
  title: "String instruments",
  description: "Identifying indigenous Kenyan string instruments (nyatiti, orutu, litungu, obokano, zeze) by community and playing method; naming the parts of a string instrument and their functions; caring for and storing an instrument; and making a fiddle from recyclable materials.",
  generate(rng) {
    const branch = randChoice(
      rng,
      [
        "identify-instrument",
        "instrument-fact-sort",
        "parts-function-match",
        "parts-hotspot",
        "care-categorize",
        "fiddle-steps",
        "reasoning",
        "fill-blank",
      ] as const
    );

    if (branch === "identify-instrument") {
      const sub = randChoice(rng, ["by-community-method", "by-community-only"] as const);
      const target = randChoice(rng, INSTRUMENTS);
      if (sub === "by-community-method") {
        const { choices, correctIndex } = buildChoicesFromStrings(
          rng,
          target.label,
          INSTRUMENTS.filter((i) => i.id !== target.id).map((i) => i.label),
          3
        );
        return {
          kind: "multiple-choice",
          prompt: `${randChoice(rng, IDENTIFY_PROMPTS)} Played by the ${target.community} community, this instrument is ${target.method}.`,
          choices,
          correctIndex,
          layout: "list",
          hint: "Match the community and playing method to the correct instrument.",
          explanation: `This describes the ${target.label} — played by the ${target.community} community and ${target.method}.`,
        };
      }
      const matches = INSTRUMENTS.filter((i) => i.community === target.community);
      const others = INSTRUMENTS.filter((i) => i.community !== target.community).map((i) => i.community);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, target.community, others, 3);
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, COMMUNITY_PROMPTS).replace("{instrument}", target.label),
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about which community each instrument is traditionally associated with.",
        explanation: `The ${target.label} is played by the ${target.community} community.${matches.length > 1 ? ` The ${matches.map((m) => m.label).join(" and ")} share this community.` : ""}`,
      };
    }

    if (branch === "instrument-fact-sort") {
      const chosen = shuffle(rng, INSTRUMENT_FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `if${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`if${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FACT_SORT_PROMPTS),
        items,
        buckets: INSTRUMENTS.map((i) => ({ id: i.id, label: i.label })),
        correctBucket,
        hint: "Look for the community named, the playing method (plucked or bowed), and the shape of the body (bowl vs box).",
        explanation: chosen.map((f) => `"${f.text}" describes the ${INSTRUMENTS.find((i) => i.id === f.id)!.label}.`).join(" "),
      };
    }

    if (branch === "parts-function-match") {
      const chosen = shuffle(rng, PARTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.fn })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p) => (correctMap[p.id] = p.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, PARTS_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each part physically does when the instrument is played.",
        explanation: chosen.map((p) => `${p.label} — ${p.fn}.`).join(" "),
      };
    }

    if (branch === "parts-hotspot") {
      const target = randChoice(rng, PARTS);
      const otherLabels = PARTS.filter((p) => p.id !== target.id).map((p) => p.label);
      const choices = shuffle(rng, [target.label, ...shuffle(rng, otherLabels).slice(0, 3)]);
      return {
        kind: "hotspot",
        prompt: randChoice(rng, HOTSPOT_PROMPTS),
        diagram: { type: "string-instrument-diagram" },
        spots: PARTS.map(({ id, xPercent, yPercent, label }) => ({ id, xPercent, yPercent, label })),
        askId: target.id,
        choices,
        correctLabel: target.label,
        hint: "Think about where each part sits: pegs near the top, neck below them, strings running down, body and bridge lower down.",
        explanation: `${target.label} — ${target.fn}.`,
      };
    }

    if (branch === "care-categorize") {
      const chosen = shuffle(rng, CARE_FACTS).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `c${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`c${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CARE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "Good care means keeping an instrument dry, clean, gently handled, and supported — not overtightened, soaked, or left in the sun.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
      };
    }

    if (branch === "fiddle-steps") {
      const shuffled = shuffle(rng, FIDDLE_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, STEPS_PROMPTS),
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: FIDDLE_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Gather materials and plan first, build the body and neck, then add pegs and strings, and tune last.",
        explanation: "Correct order: " + FIDDLE_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return { kind: "multiple-choice", prompt: q.prompt, choices, correctIndex, layout: "list", hint: "Think about what each part does, or what the instrument's community, method, and shape tell you.", explanation: q.explanation };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const accepted = "acceptedAnswers" in fb && fb.acceptedAnswers ? fb.acceptedAnswers : [fb.correctAnswer];
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...accepted],
      inputMode: "text",
      hint: "Think about the instrument names, their communities, and the parts of a string instrument.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
