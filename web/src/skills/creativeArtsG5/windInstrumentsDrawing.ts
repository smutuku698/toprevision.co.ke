import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import {
  place,
  name,
  buildScenarioChoices,
  pickPrompt,
  SORT_PROMPTS,
  MATCH_PROMPTS,
  ORDER_PROMPTS,
  TRUE_FALSE_PROMPTS,
  FILL_BLANK_PROMPTS,
  IDENTIFY_PROMPTS,
} from "./g5CasShared";
import type { ScenarioMC } from "./g5CasShared";

// KICD Grade 5 Creative Arts, Strand 1.0 Creating and Executing, sub-strand 1.1
// "Wind Musical Instruments (Drawing)" (15 lessons).
//
// Sub-strand bullets mined verbatim: Identifying (name, community, method of playing);
// Role of parts; Care — handling, hygiene and storage; Texture — cross-hatching; Crayon
// etching. Key inquiry: importance of indigenous wind instruments in Kenyan communities;
// why it is necessary to care for and maintain a wind instrument. Core competencies:
// Creativity and Imagination; Communication and collaboration. Link to other learning
// area: Social Studies (knowledge of indigenous communities).
//
// Instrument set: only real, documented Kenyan indigenous wind instruments across
// different communities are named (per the "responsibly research / view real instruments"
// instruction) — nzumari and chivoti (coastal Mijikenda/Swahili), coro (Kalenjin), oporo
// (Luo), nyanga panpipes (Kuria). No instrument name is invented.
//
// Visual coverage: the shared VisualSpec set (web/src/lib/types.ts) has no wind-instrument
// diagram and no crayon-etching/cross-hatching swatch; building one is out of scope for
// this pass (matching the other Grade 5/6 Creative Arts skills, which use only the few
// registered visual types). Recorded here so the omission is a deliberate call, not an
// oversight.

const INSTRUMENTS = [
  { id: "nzumari", label: "Nzumari", community: "Swahili (coastal)", method: "blown through a double reed" as const },
  { id: "chivoti", label: "Chivoti", community: "Mijikenda (coastal)", method: "blown across a side hole (transverse flute)" as const },
  { id: "coro", label: "Coro", community: "Kalenjin", method: "blown at the end of an animal horn" as const },
  { id: "oporo", label: "Oporo", community: "Luo", method: "blown through a side hole in an animal horn" as const },
  { id: "nyanga", label: "Nyanga", community: "Kuria", method: "blown across the open tops of a set of bamboo pipes" as const },
] as const;

// 12 uniquely-identifying facts across 5 instruments — well past the 10-fact combined floor
// for a categorize / click-match pool.
const INSTRUMENT_FACTS = [
  { text: "This coastal instrument has a loud, buzzing tone made by a small double reed that vibrates when the player blows into it", id: "nzumari" },
  { text: "This instrument is often played at Swahili weddings and celebrations along the Kenyan coast, leading the music with a piercing sound", id: "nzumari" },
  { text: "The player of this instrument uses circular breathing to keep the sound going without an obvious pause for breath", id: "nzumari" },
  { text: "This is a bamboo flute held sideways, and the player blows across a hole near one end rather than into the tube", id: "chivoti" },
  { text: "This Mijikenda flute has finger holes along its length that the player covers and uncovers to change the notes", id: "chivoti" },
  { text: "This instrument is a single curved animal horn from Kalenjin communities, blown at the narrow open end to make a deep call", id: "coro" },
  { text: "This horn was traditionally used to send signals across the hills or to gather people for a meeting or ceremony", id: "coro" },
  { text: "This Luo horn is blown through a hole cut in its side rather than at the tip", id: "oporo" },
  { text: "This instrument is often heard in Luo dance music, adding short repeated blasts over the drums", id: "oporo" },
  { text: "This instrument is not one tube but a row of bamboo pipes of different lengths tied together, each pipe sounding one fixed note", id: "nyanga" },
  { text: "Kuria players of this instrument stand in a group and each blow their own pipes in turn so the notes join into one melody", id: "nyanga" },
  { text: "Because each pipe of this instrument is a different length, the longer pipes give lower notes and the shorter pipes give higher notes", id: "nyanga" },
] as const;

// Role of the parts of a wind instrument in sound production.
const PARTS = [
  { id: "mouthpiece", label: "Mouthpiece / blowing hole", role: "This is where the player's breath enters the instrument and first sets the air moving" },
  { id: "reed", label: "Reed", role: "A thin strip that vibrates rapidly when air passes it, and that vibration is what makes the sound in a reed instrument like the nzumari" },
  { id: "air-column", label: "Air column (the air inside the tube)", role: "The column of air inside the tube vibrates to produce the note — a longer air column gives a lower note, a shorter one a higher note" },
  { id: "finger-holes", label: "Finger holes", role: "Opening or closing these changes how long the vibrating air column is, so it changes the pitch of the note" },
  { id: "bell", label: "Bell / open end", role: "The open end where the sound waves leave the instrument and are projected out to the listeners" },
  { id: "body", label: "Body / tube", role: "The hollow tube that holds and shapes the vibrating air column; a crack or blockage here spoils the tone" },
] as const;

// Cross-hatching vs crayon etching — the two drawing techniques named in this sub-strand.
const TECHNIQUE_FACTS = [
  { text: "You draw one set of parallel lines, then a second set crossing them at an angle", technique: "cross-hatching" },
  { text: "Adding more layers of crossing lines, or drawing them closer together, makes an area look darker", technique: "cross-hatching" },
  { text: "It is a way of shading with lines that also suggests the rough or smooth feel (texture) of a surface", technique: "cross-hatching" },
  { text: "It can be done with an ordinary pencil, pen or crayon and needs no scratching tool", technique: "cross-hatching" },
  { text: "Spacing the crossing lines far apart keeps an area looking light", technique: "cross-hatching" },
  { text: "It builds tone gradually, one layer of lines at a time", technique: "cross-hatching" },
  { text: "First you colour the paper heavily with bright wax crayons", technique: "crayon-etching" },
  { text: "Next you cover the whole coloured surface with a thick layer of black crayon", technique: "crayon-etching" },
  { text: "You then scratch your drawing through the black layer with a sharp tool to reveal the bright colour underneath", technique: "crayon-etching" },
  { text: "The finished picture shows bright lines and shapes on a black background", technique: "crayon-etching" },
  { text: "A nail, a used pen, a comb or a pointed stick can all be used as the scratching tool", technique: "crayon-etching" },
  { text: "The bright base colours must be pressed on hard, or the black layer will not scratch away cleanly", technique: "crayon-etching" },
] as const;

const CARE_FACTS = [
  { text: "Blowing the moisture out of a flute after playing helps stop it smelling or rotting inside", isTrue: true },
  { text: "Wiping the mouthpiece before another person plays the instrument helps stop germs spreading", isTrue: true },
  { text: "Storing a bamboo flute in a dry place, away from direct sun, helps stop it cracking", isTrue: true },
  { text: "Keeping the instrument in a cloth bag or case protects it from knocks and dust", isTrue: true },
  { text: "Leaving a wooden or bamboo wind instrument in the hot sun all afternoon keeps it in good condition", isTrue: false },
  { text: "It is fine to share a mouthpiece without cleaning it, because breath cannot carry germs", isTrue: false },
  { text: "A cracked reed can simply be blown harder and will still give a clear sound", isTrue: false },
  { text: "Leaving an instrument lying on the floor where people walk risks it being stepped on and broken", isTrue: true },
  { text: "Handling the instrument gently and not forcing the finger holes keeps them from chipping", isTrue: true },
  { text: "Storing a horn in a very damp corner makes it stronger over time", isTrue: false },
  { text: "Draining and drying the instrument before storing it stops mould growing inside the tube", isTrue: true },
  { text: "Dropping a wind instrument does no harm as long as it still looks the same on the outside", isTrue: false },
] as const;

// Crayon etching, in the teaching order the design's own Suggested Learning Experiences imply.
const ETCHING_STEPS = [
  { id: "e1", label: "Plan the composition — sketch the two musical instruments you will draw" },
  { id: "e2", label: "Colour the whole paper heavily with patches of bright wax crayon" },
  { id: "e3", label: "Cover the entire coloured surface with a thick, even layer of black crayon" },
  { id: "e4", label: "Scratch the outlines of the two instruments through the black layer with a sharp tool" },
  { id: "e5", label: "Scratch cross-hatching into the shapes to build up texture and tone" },
  { id: "e6", label: "Wipe off the loose crayon crumbs, then display the finished etching and talk about it" },
] as const;

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s chivoti flute in ${place(rng)} plays every note about the same, but one note comes out much lower than the others. Which part is doing the job of setting each note's pitch?`,
      correct: "The finger holes — covering or uncovering them changes the length of the vibrating air column, which changes the pitch",
      wrong: [
        "The bell — the open end only projects the sound outward, it does not choose the note",
        "The mouthpiece — it lets breath in but does not by itself pick which note sounds",
        "The outside surface of the tube — the outside of the flute has no effect on pitch",
      ],
      explanation: "On a flute, opening and closing finger holes shortens or lengthens the vibrating air column, and that is what changes the pitch. The mouthpiece admits air, the bell projects the sound, and the outer surface plays no part.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} plays a nzumari and notices the sound only appears once air rushes past the small thin strip at the top. What is that strip called, and what is it doing?`,
    correct: "The reed — it vibrates very fast as air passes it, and that vibration is what actually produces the sound",
    wrong: [
      "The bell — but the bell is the open far end, not a strip at the mouthpiece",
      "The air column — but the air column is the air inside the whole tube, not a thin strip",
      "A finger hole — but a finger hole is an opening in the side, not something air rushes past to start the sound",
    ],
    explanation: "In a reed instrument like the nzumari, the reed is a thin strip that vibrates rapidly as breath passes it; that vibration sets the air column going and creates the sound.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `After a lesson in ${place(rng)}, ${who} wants to store a shared bamboo flute until next week. Which is the best thing to do first?`,
      correct: "Blow out and dry the moisture inside, then wipe the mouthpiece, before putting it away in a dry place",
      wrong: [
        "Put it away straight away while still damp inside, to save time",
        "Leave it out on the windowsill in the sun so the damp dries by itself",
        "Wrap it tightly in a wet cloth so the bamboo does not dry out too much",
      ],
      explanation: "Moisture left inside a flute can make it smell or grow mould, and a shared mouthpiece should be wiped for hygiene. Direct sun can crack bamboo, and a wet cloth would keep it damp — so draining, wiping, and storing it dry is best.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s class in ${place(rng)} is naming a wind instrument by its community and how it is played: it belongs to the Kuria and is a row of bamboo pipes, each pipe giving one fixed note. Which instrument is it?`,
    correct: "Nyanga",
    wrong: ["Chivoti", "Nzumari", "Coro"],
    explanation: "The nyanga is a Kuria set of bamboo panpipes, each pipe tuned to one note. The chivoti is a single side-blown flute, the nzumari is a coastal reed instrument, and the coro is a Kalenjin horn.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is shading a drawing of a coro horn and wants the shadowed side to look darker without changing pencil. How does cross-hatching let ${who} do this?`,
      correct: "By adding more layers of crossing lines and drawing them closer together, so the area reads as darker",
      wrong: [
        "By pressing so hard the paper tears, which is the only way to darken it",
        "By rubbing the lines with a finger until they smudge into a flat grey",
        "By leaving the crossing lines far apart, which makes the area look darker",
      ],
      explanation: "Cross-hatching builds tone with layers of crossing lines: more layers and tighter spacing look darker, wider spacing looks lighter. Smudging is a different technique, and tearing the paper is never the aim.",
    };
  },
  (rng) => ({
    prompt: `In ${place(rng)}, ${name(rng)} has covered bright crayon with a thick black layer and now scratches a drawing through it. Why must the bright base colours have been pressed on really hard?`,
    correct: "If the base colours are thin, the black layer will not scratch off cleanly to reveal bright colour underneath",
    wrong: [
      "So the paper becomes heavy enough to stand up on its own",
      "So the black layer sticks permanently and can never be scratched",
      "Hard pressing is not needed; a light wash of colour works just as well",
    ],
    explanation: "Crayon etching only works if there is a solid, waxy layer of bright colour under the black; a thin base lets the black smear instead of lifting away, so the scratched lines look muddy rather than bright.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} is asked why indigenous wind instruments such as the oporo and nyanga still matter to Kenyan communities today. What is the best answer?`,
      correct: "They carry each community's music, history and identity, and pass that heritage on to the next generation",
      wrong: [
        "They are the loudest instruments ever made, louder than any drum",
        "They are the only instruments allowed to be played in Kenya",
        "They are worth keeping only because they are hard to build",
      ],
      explanation: "Indigenous wind instruments hold each community's musical knowledge, ceremonies and identity; teaching and playing them keeps that heritage alive, which is why they remain valued.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s coro horn in ${place(rng)} has a small split running along its side, and now the tone comes out weak and airy. Which part's problem best explains the weak sound?`,
    correct: "The body / tube — a crack lets air leak out instead of vibrating inside, so the tone weakens",
    wrong: [
      "The finger holes — but a horn like the coro has no finger holes to go wrong",
      "The reed — but the coro is a lip-blown horn with no reed",
      "The player's breath — a split in the horn is a fault in the instrument, not the breathing",
    ],
    explanation: "The body of a wind instrument must hold the air column so it can vibrate. A crack lets air escape, so less air vibrates and the tone becomes weak and breathy — the coro has neither finger holes nor a reed.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} identifies a coastal instrument by its playing method: it is held sideways and the player blows across a hole near one end. Which instrument is this?`,
      correct: "Chivoti",
      wrong: ["Nzumari", "Oporo", "Nyanga"],
      explanation: "The chivoti is a transverse (side-blown) bamboo flute — held sideways, blown across a hole. The nzumari is blown through a reed, the oporo through a hole in a horn, and the nyanga is a set of pipes blown across their tops.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)}'s group in ${place(rng)} is deciding which subject helps them work out which community each wind instrument belongs to. Which learning area does the design link this to?`,
    correct: "Social Studies — using knowledge of Kenya's indigenous communities",
    wrong: [
      "Mathematics — because instruments are counted before a lesson",
      "It links to no other subject at all",
      "Science — because air is involved in playing them",
    ],
    explanation: "The design links this sub-strand to Social Studies: learners use what they know about Kenya's indigenous communities to identify which community a wind instrument comes from.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} in ${place(rng)} plays a nyanga pipe set and finds the longest pipe gives the lowest note. Why does the longest pipe sound lowest?`,
      correct: "A longer pipe holds a longer air column, and a longer vibrating air column produces a lower note",
      wrong: [
        "The longest pipe is simply blown the softest, which lowers the note",
        "Longer pipes are always made of heavier bamboo, and weight sets the pitch",
        "The length of a pipe has nothing to do with its note",
      ],
      explanation: "Pitch on a wind instrument depends on the length of the vibrating air column: a longer pipe means a longer air column and a lower note, which is why panpipes are cut to different lengths.",
    };
  },
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} keeps a class chivoti in a padded bag and always drains it after playing, but a classmate leaves theirs on the bench in the sun. Whose habit protects the instrument, and why?`,
    correct: "The padded-bag-and-drain habit — it keeps the bamboo dry and shielded from heat and knocks, which prevents cracks and mould",
    wrong: [
      "The sun-on-the-bench habit — heat and light are the best way to keep bamboo healthy",
      "Neither matters, because bamboo instruments never crack or grow mould",
      "Both are equally good, since where an instrument is stored makes no difference",
    ],
    explanation: "Bamboo cracks in strong heat and grows mould when left damp, and an instrument left on a bench is easily knocked. Draining it and storing it in a padded bag away from the sun is the habit that protects it.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  { before: "The coastal wind instrument with a loud, buzzing tone made by a vibrating double reed is called the ", after: ".", correctAnswer: "nzumari" },
  { before: "The Mijikenda bamboo flute that is held sideways and blown across a hole near one end is called the ", after: ".", correctAnswer: "chivoti" },
  { before: "The Kalenjin wind instrument made from a curved animal horn and blown at its narrow end is called the ", after: ".", correctAnswer: "coro" },
  { before: "The Luo horn that is blown through a hole cut in its side is called the ", after: ".", correctAnswer: "oporo" },
  { before: "The Kuria instrument made of a row of bamboo pipes of different lengths, each giving one note, is called the ", after: ".", correctAnswer: "nyanga" },
  { before: "The thin strip that vibrates when air passes it and produces the sound in a nzumari is called the ", after: ".", correctAnswer: "reed" },
  { before: "Opening and closing the ", after: " on a flute changes the length of the vibrating air column and so changes the pitch.", correctAnswer: "finger holes", acceptedAnswers: ["finger holes", "finger hole", "holes"] },
  { before: "On a wind instrument, a longer vibrating air column produces a note that is ", after: " in pitch.", correctAnswer: "lower" },
  { before: "The shading technique of drawing one set of parallel lines and then a second set crossing them at an angle is called ", after: ".", correctAnswer: "cross-hatching", acceptedAnswers: ["cross-hatching", "crosshatching", "cross hatching"] },
  { before: "In crayon etching you first colour the paper with bright wax crayon, then cover it with a thick layer of ", after: " crayon.", correctAnswer: "black" },
  { before: "In crayon etching, the final drawing is made by ", after: " through the black layer with a sharp tool.", correctAnswer: "scratching", acceptedAnswers: ["scratching", "etching", "scraping"] },
  { before: "Blowing the moisture out of a flute and wiping its mouthpiece after playing are examples of caring for its ", after: " and hygiene.", correctAnswer: "cleanliness", acceptedAnswers: ["cleanliness", "hygiene", "cleaning"] },
] as const;

const IDENTIFY_INSTRUMENT_PROMPTS = [
  ...IDENTIFY_PROMPTS,
  "Which Kenyan wind instrument fits this description?",
  "Name the indigenous wind instrument described here.",
  "Which of these five wind instruments is being described?",
] as const;

const COMMUNITY_PROMPTS = [
  "Which community does the {instrument} come from?",
  "The {instrument} is traditionally played by which community?",
  "Identify the community associated with the {instrument}.",
  "Which Kenyan community plays the {instrument}?",
  "Name the community the {instrument} belongs to.",
  "From which community does the {instrument} come?",
  "The {instrument} is an instrument of which community?",
  "Which community's music uses the {instrument}?",
  "Choose the community linked to the {instrument}.",
  "Whose traditional instrument is the {instrument}?",
] as const;

export const windInstrumentsDrawing: Skill = {
  id: "g5-cas-wind-instruments-drawing",
  code: "C.1",
  subjectId: "creative-arts-sports",
  strandId: "g5-cas-creating-executing",
  grade: 5,
  title: "Wind instruments and drawing",
  description:
    "Identifying indigenous Kenyan wind instruments (nzumari, chivoti, coro, oporo, nyanga) by community and playing method; the role of the parts of a wind instrument in sound production; caring for a wind instrument (handling, hygiene, storage); and the cross-hatching and crayon-etching drawing techniques.",
  generate(rng) {
    const branch = randChoice(rng, [
      "identify-instrument",
      "community-of-instrument",
      "instrument-fact-sort",
      "method-sort",
      "part-role-match",
      "technique-sort",
      "etching-order",
      "care-tf",
      "reasoning",
      "fill-blank",
    ] as const);

    if (branch === "identify-instrument") {
      const target = randChoice(rng, INSTRUMENTS);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.label,
        INSTRUMENTS.filter((i) => i.id !== target.id).map((i) => i.label),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: `${pickPrompt(rng, IDENTIFY_INSTRUMENT_PROMPTS)} Played by the ${target.community} community, it is ${target.method}.`,
        choices,
        correctIndex,
        layout: "list",
        hint: "Match both the community and the way the instrument is played.",
        explanation: `This is the ${target.label} — a ${target.community} instrument, ${target.method}.`,
      };
    }

    if (branch === "community-of-instrument") {
      const target = randChoice(rng, INSTRUMENTS);
      const { choices, correctIndex } = buildChoicesFromStrings(
        rng,
        target.community,
        INSTRUMENTS.filter((i) => i.community !== target.community).map((i) => i.community),
        3
      );
      return {
        kind: "multiple-choice",
        prompt: pickPrompt(rng, COMMUNITY_PROMPTS).replace("{instrument}", target.label),
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about which Kenyan community each instrument belongs to.",
        explanation: `The ${target.label} comes from the ${target.community} community.`,
      };
    }

    if (branch === "instrument-fact-sort") {
      const chosen = shuffle(rng, INSTRUMENT_FACTS).slice(0, 6);
      const items = chosen.map((f, i) => ({ id: `if${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`if${i}`] = f.id));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: INSTRUMENTS.map((i) => ({ id: i.id, label: i.label })),
        correctBucket,
        hint: "Look for the community named, the material (bamboo, animal horn), and how the instrument is blown.",
        explanation: chosen
          .map((f) => `"${f.text}" describes the ${INSTRUMENTS.find((i) => i.id === f.id)!.label}.`)
          .join(" "),
      };
    }

    if (branch === "method-sort") {
      const chosen = shuffle(rng, INSTRUMENTS);
      const items = chosen.map((i) => ({ id: i.id, label: i.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((i) => (correctBucket[i.id] = i.method.includes("reed") ? "reed" : i.method.includes("side") ? "side-blown" : i.method.includes("end") ? "end-blown" : "panpipe"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "reed", label: "Blown through a reed" },
          { id: "side-blown", label: "Blown across / through a side hole" },
          { id: "end-blown", label: "Blown at the end" },
          { id: "panpipe", label: "Set of pipes blown across the top" },
        ],
        correctBucket,
        hint: "The nzumari has a reed; the chivoti and oporo use a side hole; the coro is blown at its end; the nyanga is a row of pipes.",
        explanation: chosen.map((i) => `${i.label}: ${i.method}.`).join(" "),
      };
    }

    if (branch === "part-role-match") {
      const chosen = shuffle(rng, PARTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.id, label: p.role })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p) => (correctMap[p.id] = p.id));
      return {
        kind: "click-match",
        prompt: pickPrompt(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each part does to the moving air: let it in, make it vibrate, set the pitch, or send the sound out.",
        explanation: chosen.map((p) => `${p.label} — ${p.role}.`).join(" "),
      };
    }

    if (branch === "technique-sort") {
      const chosen = shuffle(rng, TECHNIQUE_FACTS).slice(0, 8);
      const items = chosen.map((f, i) => ({ id: `t${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`t${i}`] = f.technique));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, SORT_PROMPTS),
        items,
        buckets: [
          { id: "cross-hatching", label: "Cross-hatching" },
          { id: "crayon-etching", label: "Crayon etching" },
        ],
        correctBucket,
        hint: "Cross-hatching is shading with crossing lines and needs no scratching tool; crayon etching means scratching a picture through a black layer over bright colour.",
        explanation: chosen
          .map((f) => `"${f.text}" describes ${f.technique === "cross-hatching" ? "cross-hatching" : "crayon etching"}.`)
          .join(" "),
      };
    }

    if (branch === "etching-order") {
      const shuffled = shuffle(rng, ETCHING_STEPS);
      return {
        kind: "ordering",
        prompt: `${pickPrompt(rng, ORDER_PROMPTS)} (making a crayon etching of two instruments)`,
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: ETCHING_STEPS.map((s) => s.id),
        instruction: "Drag to arrange from first to last.",
        hint: "Plan first, lay down bright colour, cover it with black, then scratch the drawing and its texture, and display last.",
        explanation: "Correct order: " + ETCHING_STEPS.map((s) => s.label).join(" → ") + ".",
      };
    }

    if (branch === "care-tf") {
      const chosen = shuffle(rng, CARE_FACTS).slice(0, 7);
      const items = chosen.map((f, i) => ({ id: `c${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`c${i}`] = f.isTrue ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: pickPrompt(rng, TRUE_FALSE_PROMPTS),
        items,
        buckets: [
          { id: "true", label: "True" },
          { id: "false", label: "False" },
        ],
        correctBucket,
        hint: "Good care keeps a wind instrument drained, dry, clean, gently handled and shielded from sun and knocks.",
        explanation: chosen.map((f) => `"${f.text}" is ${f.isTrue ? "true" : "false"}.`).join(" "),
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
        hint: "Think about what each part does to the air, how pitch depends on air-column length, and what keeps an instrument safe.",
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    const accepted = "acceptedAnswers" in fb && fb.acceptedAnswers ? fb.acceptedAnswers : [fb.correctAnswer];
    return {
      kind: "fill-blank",
      prompt: pickPrompt(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...accepted],
      inputMode: "text",
      hint: "Think about the instrument names, the parts of a wind instrument, and the two drawing techniques.",
      explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
    };
  },
};
