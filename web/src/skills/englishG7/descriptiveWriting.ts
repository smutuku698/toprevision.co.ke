import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DESCRIPTIVE_PHRASES: { phrase: string; category: "sight" | "sound" | "feeling" }[] = [
  { phrase: "the bright red jerseys weaving across the green pitch", category: "sight" },
  { phrase: "dust rising in clouds behind the sprinters as they rounded the bend", category: "sight" },
  { phrase: "players scattered across the field in their team colours, weaving between defenders", category: "sight" },
  { phrase: "the referee's whistle piercing through the noisy field", category: "sound" },
  { phrase: "the rhythmic thud of the ball against bare feet on the dusty pitch", category: "sound" },
  { phrase: "the sharp crack of the starting gun echoing across the school field", category: "sound" },
  { phrase: "the roar of classmates cheering from the sidelines", category: "sound" },
  { phrase: "her lungs burning and legs trembling as she crossed the finish line", category: "feeling" },
  { phrase: "a wave of pride swelling in his chest as the coach raised his hand in victory", category: "feeling" },
  { phrase: "the sting of the rope against her ankles during the sack race", category: "feeling" },
];

const CATEGORY_INFO: { id: "sight" | "sound" | "feeling"; label: string; description: string }[] = [
  { id: "sight", label: "Sight", description: "Describes what can be seen — colours, movement, and appearance" },
  { id: "sound", label: "Sound", description: "Describes what can be heard — noises, rhythms, and echoes" },
  { id: "feeling", label: "Feeling", description: "Describes physical sensations or emotions felt in the body" },
];

const DETAIL_PAIRS: { plain: string; vivid: string }[] = [
  { plain: "The runner was fast.", vivid: "The runner shot off the line like a coiled spring released, blurring past the others." },
  { plain: "The tug-of-war team was strong.", vivid: "Muscles bulging and feet dug into the dust, the team hauled the rope inch by inch toward victory." },
  { plain: "The crowd was excited.", vivid: "The crowd leapt up, drumming on desks and chanting the team's name as the ball neared the goal." },
  { plain: "The sack race was funny.", vivid: "Competitors toppled over one another in their sacks, wobbling and giggling all the way to the finish line." },
];

const FEATURE_PHRASES: { id: string; label: string; phrase: string }[] = [
  { id: "weather", label: "Weather", phrase: "Dark clouds rolled in just as the final race began, and the first heavy raindrops sent spectators scrambling for cover." },
  { id: "emotion", label: "Emotion", phrase: "Her stomach twisted with nerves as she waited, trembling, for the starting gun to fire." },
  { id: "event", label: "Event", phrase: "The relay baton flew from hand to hand as four runners blurred around the track in perfect rhythm." },
  { id: "character", label: "Character", phrase: "Coach Otieno paced the sideline with his whistle clenched between his teeth, eyes locked on every pass." },
];

const TYPE_EXAMPLES: { descriptive: string; narrative: string; expository: string } = {
  descriptive: "The stadium buzzed with colour — red and gold jerseys, dust rising off the track, and the sharp smell of trampled grass.",
  narrative: "First the whistle blew, then both teams sprinted for the ball, and within minutes the home team had scored.",
  expository: "A sports day usually includes track events like sprints and relays, as well as field events such as long jump.",
};

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "As the final whistle blew, the exhausted but triumphant team collapsed onto the field in pure", after: ".", correctAnswer: "relief", acceptedAnswers: ["relief"] },
  { before: "The gymnast's routine ended with the whole crowd rising in a", after: "ovation.", correctAnswer: "standing", acceptedAnswers: ["standing"] },
  { before: "Dust rose in a thick cloud as the runners thundered past in a blur of", after: ".", correctAnswer: "speed", acceptedAnswers: ["speed"] },
];

export const descriptiveWriting: Skill = {
  id: "g7-eng-w-descriptive-writing",
  code: "W.14",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Descriptive Writing (200-240 words)",
  description: "Identify descriptive words and expressions for people, places, and events at an outdoor sports day, and recognise vivid, sensory description.",
  generate(rng) {
    const branch = randChoice(rng, ["categorize", "mc-vivid", "match", "fill", "mc-type"] as const);
    const hint = "Descriptive writing uses specific, sensory detail — sights, sounds, and feelings — rather than plain, general statements.";

    if (branch === "categorize") {
      const sight = shuffle(rng, DESCRIPTIVE_PHRASES.filter((p) => p.category === "sight")).slice(0, 2);
      const sound = shuffle(rng, DESCRIPTIVE_PHRASES.filter((p) => p.category === "sound")).slice(0, 2);
      const feeling = shuffle(rng, DESCRIPTIVE_PHRASES.filter((p) => p.category === "feeling")).slice(0, 2);
      const chosen = shuffle(rng, [...sight, ...sound, ...feeling]);
      const items = chosen.map((p, i) => ({ id: `d${i}`, label: p.phrase }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((p, i) => (correctBucket[`d${i}`] = p.category));
      return {
        kind: "categorize",
        prompt: "Sort each sports-day phrase by whether it describes a Sight, a Sound, or a Feeling.",
        items,
        buckets: CATEGORY_INFO.map((c) => ({ id: c.id, label: c.label })),
        correctBucket,
        hint,
        explanation: chosen.map((p) => `"${p.phrase}" describes a ${p.category}.`).join(" "),
      };
    }

    if (branch === "mc-vivid") {
      const entry = randChoice(rng, DETAIL_PAIRS);
      const choices = shuffle(rng, [entry.vivid, entry.plain]);
      return {
        kind: "multiple-choice",
        prompt: "Which sentence gives a more vivid, specific description?",
        choices,
        correctIndex: choices.indexOf(entry.vivid),
        layout: "list",
        hint,
        explanation: `"${entry.vivid}" is more vivid — it uses specific, sensory detail, rather than the plain statement "${entry.plain}"`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, FEATURE_PHRASES.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, FEATURE_PHRASES.map((f) => ({ id: f.id, label: f.phrase })));
      const correctMap: Record<string, string> = {};
      for (const f of FEATURE_PHRASES) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: "Match each describable feature of a sports day to a strong descriptive phrase for it.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: FEATURE_PHRASES.map((f) => `${f.label}: "${f.phrase}"`).join(" "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the vivid word that best completes this descriptive sentence about an outdoor sports day.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint: "Think of a specific word that captures the exact feeling or image being described.",
        explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
      };
    }

    const choices = shuffle(rng, [TYPE_EXAMPLES.descriptive, TYPE_EXAMPLES.narrative, TYPE_EXAMPLES.expository]);
    return {
      kind: "multiple-choice",
      prompt: "Which sentence is an example of descriptive writing — painting a picture with sensory detail — rather than narrative (telling what happened) or expository (explaining facts) writing?",
      choices,
      correctIndex: choices.indexOf(TYPE_EXAMPLES.descriptive),
      layout: "list",
      hint: "Descriptive writing focuses on painting a picture with the senses. Narrative writing tells events in sequence. Expository writing explains or informs.",
      explanation: `"${TYPE_EXAMPLES.descriptive}" is descriptive — it paints a picture with sensory detail. "${TYPE_EXAMPLES.narrative}" is narrative (tells what happened in sequence), and "${TYPE_EXAMPLES.expository}" is expository (explains facts).`,
    };
  },
};
