import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, expandScenarios, buildScenarioChoices, combineFrames, cap } from "./sharedG10";

// KICD Grade 10 Music and Dance, Strand 2.0 Performing, sub-strand 2.5 "Contemporary Dance from
// Kenya" (curriculum-reference/grade-10/music-and-dance.json, strands[1].subStrands[4]). Named
// content floors: 5 basic performing skills (posture, alignment, balance, coordination, control),
// 5 performance techniques (controlled leg work, floor work, improvisation, fall and recovery,
// movement and release), 7 contemporary-dance features (storyline, use of body in space,
// improvisation, styles from other genres, music, costume, décor), and 9 named Kenyan popular-
// music genres as choreography source material (rhumba, benga, genge, hip-hop, Kenyan rock,
// genge tone, taarab, rap, kapuka). "Improvisation" is genuinely named in BOTH the features list
// and the techniques list — kept as two distinct illustrative facts below (a spontaneous-in-the-
// moment framing for the feature, a rehearsed-skill framing for the technique), not merged, since
// the design lists it twice for a reason (it functions differently at the choreography-design
// stage vs. the performer-training stage). Also carries the road-safety PCI (risky road
// behaviours) shared with sub-strand 1.7. No dedicated VisualSpec exists for dance
// features/techniques/genres, so no branch uses a visual — a deliberate, documented skip per the
// precedent in agricultureG6/rearingSmallDomesticAnimals.ts.

const BASIC_SKILLS = [
  { id: "posture", label: "Posture", definition: "Holding the body in a controlled, well-aligned position while dancing" },
  { id: "alignment", label: "Alignment", definition: "Keeping the body's parts correctly positioned relative to each other during movement" },
  { id: "balance", label: "Balance", definition: "Maintaining stability while the body is still, moving, or on one point of support" },
  { id: "coordination", label: "Coordination", definition: "Moving different body parts together smoothly and in the right timing" },
  { id: "control", label: "Control", definition: "Governing the speed, force, and precision of a movement deliberately" },
] as const;

const TECHNIQUES = [
  { id: "controlled-leg-work", label: "Controlled leg work", definition: "Deliberately governed leg movements — kicks, extensions, and steps performed with precision" },
  { id: "floor-work", label: "Floor work", definition: "Movement performed on or close to the floor, such as rolling, sliding, or crawling" },
  { id: "improvisation-technique", label: "Improvisation (as a rehearsed technique)", definition: "A trained skill of generating movement spontaneously within a performance, practiced like any other technique" },
  { id: "fall-and-recovery", label: "Fall and recovery", definition: "Deliberately lowering the body toward the floor and then rising back up with control" },
  { id: "movement-and-release", label: "Movement and release", definition: "Alternating between tension held in the body and a controlled release of that tension" },
] as const;

const SKILL_TECHNIQUE_MATCH_PROMPTS = [
  "Match each basic performing skill or technique to its definition.",
  "Pair each item below with the description that explains it.",
  "Connect each skill or technique to its correct meaning.",
  "Match each item to what it describes.",
  "For each item below, choose its matching meaning.",
  "Line up each skill or technique with its correct meaning.",
  "Which meaning goes with which item? Match them correctly.",
  "Pair up every item with its correct definition.",
  "Match each concept on the left to its meaning on the right.",
  "Work out what each item means, then match it correctly.",
  "Sort out which meaning belongs to which item, by matching them.",
  "Correctly match every item to the meaning that fits it.",
  "Match each performing skill or technique below to its definition.",
  "Connect each of these items to what it actually means.",
  "Pair each item with the description that explains it.",
  "Match the items to their meanings below.",
  "Figure out what each item means, then match it up.",
  "Which definition matches which item? Match them.",
  "Match each item on the left to the term it defines on the right.",
  "Match each performing concept to its correct explanation.",
];

// ---- Categorize: 17 illustrative facts across 3 buckets (feature / basic skill / performance
// technique) — sliced to a 10-of-17 subset each draw. "Improvisation" appears once per bucket
// as two DIFFERENT illustrative sentences (deliberate, per the top-of-file note), not a repeat. ----
type Bucket = "feature" | "skill" | "technique";
const BUCKET_LABEL: Record<Bucket, string> = { feature: "Contemporary dance feature", skill: "Basic performing skill", technique: "Performance technique" };
const CLASSIFY_FACTS: { text: string; bucket: Bucket }[] = [
  { text: "The choreography follows a clear storyline the audience can follow from start to finish", bucket: "feature" },
  { text: "A dancer uses the full space of the stage, moving in different directions and levels", bucket: "feature" },
  { text: "A choreographer leaves moments in the piece for movements invented spontaneously, not fully pre-set", bucket: "feature" },
  { text: "The routine borrows movement vocabulary from hip-hop even though it is built mainly around traditional Kenyan steps", bucket: "feature" },
  { text: "The music chosen for the piece directly shapes its tempo and mood", bucket: "feature" },
  { text: "The costume design supports the story the dance is telling", bucket: "feature" },
  { text: "The décor and staging are chosen to reinforce the piece's theme", bucket: "feature" },
  { text: "A dancer keeps their spine and shoulders in a controlled, well-aligned position throughout a routine", bucket: "skill" },
  { text: "A dancer keeps their hips, knees, and ankles correctly positioned relative to each other during a turn", bucket: "skill" },
  { text: "A dancer holds a stable position on one foot without wobbling", bucket: "skill" },
  { text: "A dancer moves their arms and legs together smoothly in the right timing during a combination", bucket: "skill" },
  { text: "A dancer governs the speed and force of a movement deliberately rather than letting it happen carelessly", bucket: "skill" },
  { text: "A dancer performs a precisely governed kick and extension as part of a rehearsed leg-work sequence", bucket: "technique" },
  { text: "A dancer rolls and slides across the floor as part of a rehearsed sequence", bucket: "technique" },
  { text: "A dancer practices generating movement spontaneously as a specific, rehearsed performance skill, alongside floor work and controlled leg work", bucket: "technique" },
  { text: "A dancer lowers their body toward the floor with control and then rises back up smoothly", bucket: "technique" },
  { text: "A dancer alternates between holding tension in the body and releasing it in a controlled way", bucket: "technique" },
];

const CLASSIFY_PROMPTS = [
  "Sort each fact by whether it describes a dance feature, a basic performing skill, or a performance technique.",
  "Group these facts under feature, skill, or technique.",
  "Decide which category each fact below belongs to, and sort it there.",
  "Sort each statement into the category it best fits.",
  "Place each fact into the correct bucket: feature, skill, or technique.",
  "Read each fact and sort it under the matching category.",
  "Work out which category each fact is about, then sort it there.",
  "Classify each fact by the category it belongs to.",
  "Organize these facts into the correct category.",
  "Which category does each fact describe? Sort it accordingly.",
  "Sort each statement below into feature, skill, or technique.",
  "Drop each fact into the category it's really about.",
  "Group each statement with the category it correctly belongs to.",
  "Decide where each fact fits among the three categories.",
  "Sort these facts into their correct category groups.",
  "For each fact, work out the category it belongs to and sort it in.",
  "Place these statements under the category each one matches.",
  "Sort each fact correctly among the three categories.",
  "Read each statement and file it under the right category.",
  "Assign each fact to the category it best describes.",
];

// ---- Genre + technique/skill fill-blank pool (12 templates). ----
const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[]; explanation: string }[] = [
  { before: "A fast-paced Kenyan genre with syncopated guitar and bass lines driving energetic footwork is called ", after: ".", correctAnswer: "benga", acceptedAnswers: ["benga"], explanation: "Benga is the fast-paced Kenyan genre known for its syncopated guitar and bass-driven energetic footwork." },
  { before: "A Swahili-coast genre blending Arabic, Indian, and African influences, associated with flowing, swaying movement, is called ", after: ".", correctAnswer: "taarab", acceptedAnswers: ["taarab"], explanation: "Taarab is the Swahili-coast genre blending Arabic, Indian, and African influences." },
  { before: "The smooth, Congolese-influenced guitar dance style popular in Kenyan social dance is called ", after: ".", correctAnswer: "rhumba", acceptedAnswers: ["rhumba"], explanation: "Rhumba is the smooth, Congolese-influenced guitar dance style named in this sub-strand's genre list." },
  { before: "The fast, dance-oriented Kenyan pop genre especially popular in the early 2000s is called ", after: ".", correctAnswer: "kapuka", acceptedAnswers: ["kapuka"], explanation: "Kapuka is the fast, dance-oriented Kenyan pop genre popular in the early 2000s." },
  { before: "The Kenyan hip-hop-influenced urban genre performed mostly in Sheng is called ", after: ".", correctAnswer: "genge", acceptedAnswers: ["genge"], explanation: "Genge is the Kenyan hip-hop-influenced urban genre performed mostly in Sheng." },
  { before: "The more melodic, singing-led offshoot of genge is known as ", after: ".", correctAnswer: "genge tone", acceptedAnswers: ["genge tone"], explanation: "Genge tone is named separately in the design as a distinct, more melodic offshoot of genge." },
  { before: "Deliberately lowering the body toward the floor and rising back up with control is the technique of ", after: ".", correctAnswer: "fall and recovery", acceptedAnswers: ["fall and recovery"], explanation: "Fall and recovery is the named technique of controlled lowering and rising." },
  { before: "Movement performed on or close to the floor, such as rolling or sliding, is called ", after: ".", correctAnswer: "floor work", acceptedAnswers: ["floor work"], explanation: "Floor work is movement performed on or close to the floor." },
  { before: "Alternating between held tension in the body and a controlled release of it is called ", after: ".", correctAnswer: "movement and release", acceptedAnswers: ["movement and release"], explanation: "Movement and release describes alternating tension and controlled release in the body." },
  { before: "Maintaining stability while still, moving, or on one point of support is the basic performing skill of ", after: ".", correctAnswer: "balance", acceptedAnswers: ["balance"], explanation: "Balance is the basic performing skill of maintaining stability." },
  { before: "Moving different body parts together smoothly and in the right timing is the basic performing skill of ", after: ".", correctAnswer: "coordination", acceptedAnswers: ["coordination"], explanation: "Coordination is the basic performing skill of moving body parts together smoothly and in time." },
  { before: "Keeping the body's parts correctly positioned relative to each other during movement is the basic performing skill of ", after: ".", correctAnswer: "alignment", acceptedAnswers: ["alignment"], explanation: "Alignment is the basic performing skill of keeping body parts correctly positioned relative to each other." },
];

const FILL_BLANK_PROMPTS = [
  "Fill in the blank.",
  "Complete the sentence.",
  "Fill in the missing word or phrase.",
  "Complete this sentence correctly.",
  "Work out the missing term and fill it in.",
  "What word or phrase completes this sentence?",
  "Fill in the correct term below.",
  "Complete the statement with the correct term.",
  "Which term belongs in the blank?",
  "Fill in the gap correctly.",
  "Work out what belongs in the blank.",
  "Complete the sentence with the right term.",
  "What is missing from this sentence?",
  "Fill in the blank with the correct term.",
  "Finish the sentence correctly.",
  "Which term correctly fills this blank?",
  "Complete this statement.",
  "Work out the correct term for the blank.",
  "Fill in the missing term below.",
  "What term correctly completes this sentence?",
];

// ---- Ordering: choreography process, condensed directly from the design's own Suggested
// Learning Experiences bullet order. ----
const PROCESS_STEPS = [
  { id: "watch-discuss", label: "Watch real or virtual contemporary dance performances and discuss their features" },
  { id: "brainstorm", label: "Brainstorm an idea on risk awareness and management on road use for a dance story" },
  { id: "milestones", label: "Create milestones for the contemporary dance story" },
  { id: "basic-skills", label: "Demonstrate basic performance skills in a dance routine" },
  { id: "select-styles", label: "Select suitable contemporary dance techniques and styles from Kenyan popular music genres" },
  { id: "block-movement", label: "Block dance movements and patterns for effective use of time, space, action, and energy" },
  { id: "select-music-costume", label: "Select and use appropriate music, costumes, props, and make-up for the routine" },
  { id: "rehearse-perform", label: "Rehearse and perform the dance routine in a troupe, to tell a story to an audience" },
];

const ORDERING_PROMPTS = [
  "Arrange these steps of creating a contemporary dance routine in the correct order.",
  "Put these choreography steps into a sensible order.",
  "Sequence the steps of creating and performing a contemporary dance routine correctly.",
  "Arrange these actions into the order a troupe would actually follow them.",
  "Order these steps the way a troupe creating a dance routine should carry them out.",
  "Sort these steps into the order they should happen when creating a dance routine.",
  "Put these steps in the order a troupe would follow to create and perform a routine.",
  "Work out the sensible order for these choreography tasks.",
  "Arrange these tasks into a logical choreography process.",
  "Which order should these steps happen in? Arrange them correctly.",
  "Build a sensible process by ordering these choreography steps correctly.",
  "Sequence a troupe's choreography tasks in the order they should be done.",
  "Order these actions the way they'd happen when creating a contemporary dance routine.",
  "Arrange the steps of creating a dance routine, in the right order.",
  "Put these tasks into the order a troupe would complete them.",
  "Sequence these steps to build a sensible choreography process.",
  "Work out the correct order for creating, rehearsing, and performing a dance routine.",
  "Arrange these steps as a troupe would carry them out.",
  "Order the tasks below the way the choreography process actually runs.",
  "Sequence these steps correctly, from first to last.",
];

// ---- Reasoning (Apply/Analyze/Evaluate) pool: 12 situations x 24 frames (6 openers x 4 closers)
// = 288 templates. Includes the road-safety PCI shared with 1.7 (over-speeding, racing, running
// on the road, jay-walking, looting from crashed vehicles) and genre/technique application. ----
interface DanceFact {
  situation: string;
  correct: string;
  wrong: string[];
}

const REASON_FACTS: DanceFact[] = [
  {
    situation: "a troupe wants to build a 3-5-minute contemporary dance story warning against jay-walking and running on the road, and starts by brainstorming milestones for the story before choosing any movement",
    correct: "This follows the expected process well — brainstorming and creating milestones for the road-safety story comes before blocking movement and choosing choreography",
    wrong: [
      "This is backwards — movement should always be blocked before any story idea is discussed",
      "This is unnecessary, since a road-safety theme does not require any story planning",
      "This step should be skipped entirely, since the routine should be improvised entirely on the day of performance",
    ],
  },
  {
    situation: "a choreographer selects benga's syncopated, energetic guitar-and-bass feel specifically to match a fast-paced, urgent section of a road-safety dance story about over-speeding",
    correct: "This is an appropriate choice — benga's fast, syncopated feel suits a scene depicting urgency and speed",
    wrong: [
      "This is inappropriate, since benga is only ever used for slow, calm sections of a routine",
      "This is inappropriate, since taarab must always be used for any road-safety theme",
      "The genre choice has no effect on how a scene reads to an audience",
    ],
  },
  {
    situation: "a dancer performs a controlled lowering of the body toward the floor, then rises back up smoothly as part of a routine depicting the aftermath of a road crash",
    correct: "This uses fall and recovery correctly — a controlled descent followed by a controlled rise",
    wrong: [
      "This uses floor work, since any movement near the floor counts as floor work",
      "This uses movement and release, since falling always counts as a release of tension",
      "This is an error, since fall and recovery should never be used in a story-based routine",
    ],
  },
  {
    situation: "a dancer holds their spine and shoulders in a controlled, well-aligned position throughout a fast combination of steps",
    correct: "This demonstrates posture — holding the body in a controlled, well-aligned position while dancing",
    wrong: [
      "This demonstrates balance, since any controlled body position counts as balance",
      "This demonstrates coordination, since posture and coordination are the same skill",
      "This demonstrates a performance technique, not a basic performing skill",
    ],
  },
  {
    situation: "a choreographer blocks a routine so dancers use different levels and directions of the stage, matching the design's named element of using body in space",
    correct: "This correctly applies the contemporary dance feature of using body in space",
    wrong: [
      "This applies floor work instead, since using different levels always counts as floor work",
      "This applies improvisation, since varying stage position is always spontaneous",
      "Using body in space is not a recognised feature of contemporary dance",
    ],
  },
  {
    situation: "a troupe rehearses a section where a dancer deliberately generates new movement spontaneously as a trained part of their performance, distinct from the pre-set choreography",
    correct: "This is the technique of improvisation being used as a rehearsed performance skill, not the same as leaving open space for spontaneity at the choreography-design stage",
    wrong: [
      "This cannot be improvisation, since improvisation only applies when designing the choreography, never during a rehearsed performance",
      "This is floor work, since all spontaneous movement counts as floor work",
      "This is fall and recovery, since spontaneous movement always involves falling",
    ],
  },
  {
    situation: "a choreographer selects costumes and décor that reinforce a road-safety story about the dangers of looting from a crashed vehicle",
    correct: "This is appropriate — costume and décor choices should support and reinforce the theme of the dance story",
    wrong: [
      "Costume and décor have no connection to a dance's storyline or theme",
      "Costumes should always be chosen independently of the story being told",
      "Décor is only relevant for dances with no storyline at all",
    ],
  },
  {
    situation: "a dancer moves their arms and legs together smoothly and in the correct timing while executing a combination drawn from hip-hop-influenced choreography",
    correct: "This demonstrates coordination — moving different body parts together smoothly and in the right timing",
    wrong: [
      "This demonstrates control, since coordination and control describe the same thing",
      "This demonstrates alignment, since any smooth movement counts as alignment",
      "This demonstrates a genre choice, not a basic performing skill",
    ],
  },
  {
    situation: "a troupe selects taarab's flowing, swaying character for a calm, reflective section of a road-safety dance story, after a fast benga-influenced opening",
    correct: "This is a thoughtful genre choice — contrasting benga's energy with taarab's flowing character can mark a clear shift in the story's mood",
    wrong: [
      "This is inappropriate, since only one genre may ever be used within a single routine",
      "This is inappropriate, since taarab cannot be used for any theme involving road safety",
      "Genre choice has no bearing on how a story's mood is conveyed to an audience",
    ],
  },
  {
    situation: "a troupe performs their finished contemporary dance routine live for a school audience, having rehearsed the blocked movement, chosen music, and selected costumes beforehand",
    correct: "This matches the expected process well — rehearsing and then performing the routine for an audience is the final step after milestones, movement, music, and costumes are set",
    wrong: [
      "Performing for an audience is unnecessary once rehearsal is complete",
      "The routine should be performed before any rehearsal takes place",
      "An audience is only appropriate for routines with no storyline",
    ],
  },
  {
    situation: "a choreographer builds a routine drawing movement vocabulary from hip-hop while keeping the overall structure rooted in Kenyan popular music styles",
    correct: "This reflects the contemporary dance feature of borrowing styles from other genres, blended with a Kenyan popular-music foundation",
    wrong: [
      "This is not allowed, since contemporary dance must use only one genre's movement vocabulary",
      "This is floor work, since blending genres always involves movement near the floor",
      "This has nothing to do with any recognised feature of contemporary dance",
    ],
  },
  {
    situation: "a dancer governs the exact speed and force of a leg extension deliberately, rather than letting the movement happen carelessly, during a section requiring precise, controlled leg work",
    correct: "This demonstrates the basic performing skill of control, applied specifically through the technique of controlled leg work",
    wrong: [
      "This demonstrates balance only, since any deliberate movement counts as balance",
      "This demonstrates floor work, since leg movements are always classified as floor work",
      "Control is not a recognised basic performing skill in contemporary dance",
    ],
  },
];

const REASONING_OPENERS: ((rng: RNG, fact: DanceFact) => string)[] = [
  (rng, fact) => `${name(rng)}'s troupe near ${place(rng)} is creating a contemporary dance routine, where ${fact.situation}`,
  (rng, fact) => `During a dance rehearsal near ${place(rng)}, ${fact.situation}`,
  (rng, fact) => `${name(rng)} is choreographing a routine, and ${fact.situation}`,
  (rng, fact) => cap(fact.situation),
  (rng, fact) => `While watching a troupe rehearse near ${place(rng)}, ${name(rng)} notices that ${fact.situation}`,
  (rng, fact) => `In a dance workshop at a school near ${place(rng)}, ${fact.situation}`,
];

const REASONING_CLOSERS = ["Is this correct?", "What is the correct judgement here?", "Is this correctly done?", "Which conclusion is correct?"];

const REASONING_FRAMES = combineFrames(REASONING_OPENERS, REASONING_CLOSERS);
const REASONING_TEMPLATES = expandScenarios(REASON_FACTS, REASONING_FRAMES);

export const contemporaryDanceFromKenya: Skill = {
  id: "g10-mad-contemporary-dance-from-kenya",
  code: "2.5",
  subjectId: "music-and-dance",
  strandId: "g10-mad-performing",
  grade: 10,
  title: "Contemporary Dance from Kenya",
  description: "Features of contemporary dance, basic performing skills (posture, alignment, balance, coordination, control), performance techniques (controlled leg work, floor work, improvisation, fall and recovery, movement and release), choreography based on Kenyan popular music genres, and a dance story theme built on risk awareness and road safety.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "fill-blank", "order", "reasoning"] as const);
    const hint = "Basic performing skills (posture, alignment, balance, coordination, control) are bodily fundamentals; performance techniques (controlled leg work, floor work, improvisation, fall and recovery, movement and release) are trained choreographic tools built on top of them.";

    if (branch === "match") {
      const pool = [...BASIC_SKILLS, ...TECHNIQUES];
      const chosen = shuffle(rng, pool).slice(0, 7);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.id, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, SKILL_TECHNIQUE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((t) => `${t.label}: ${t.definition}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, CLASSIFY_FACTS).slice(0, 10);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.bucket));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CLASSIFY_PROMPTS),
        items,
        buckets: (["feature", "skill", "technique"] as Bucket[]).map((b) => ({ id: b, label: BUCKET_LABEL[b] })),
        correctBucket,
        hint: "A feature describes WHAT the piece includes (story, space, genre-blending); a skill is a bodily fundamental; a technique is a trained choreographic tool.",
        explanation: chosen.map((f) => `"${f.text}" is a ${BUCKET_LABEL[f.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, FILL_BLANK_PROMPTS),
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        acceptedAnswers: fb.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: fb.explanation,
      };
    }

    if (branch === "order") {
      const shuffled = shuffle(rng, PROCESS_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, ORDERING_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: PROCESS_STEPS.map((s) => s.id),
        hint: "Watching and brainstorming come first, then story milestones and basic skills, then genre/style selection and blocking, then music/costume choices, then rehearsal and performance.",
        explanation: PROCESS_STEPS.map((s) => s.label).join(" → "),
      };
    }

    const q = randChoice(rng, REASONING_TEMPLATES)(rng);
    const { choices, correctIndex } = buildScenarioChoices(rng, q);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex,
      layout: "list",
      hint: "Check the described choice against the correct basic skill, technique, or feature definition, and whether it fits the road-safety story it is meant to serve.",
      explanation: q.explanation,
    };
  },
};
