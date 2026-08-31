import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place } from "./shared";

// Grade 6 Indigenous Languages — Theme 4 "Peer Influence", sub-strand 4.2.1
// "Reading Comprehension" (R.4): reading strategies — prediction, visualizing.

function withEach(openers: string[], closers: string[]): string[] {
  const out: string[] = [];
  for (const o of openers) for (const c of closers) out.push(`${o} ${c}`);
  return out;
}

interface ConceptEntry { concept: string; meaning: string }

const CONCEPTS: ConceptEntry[] = [
  { concept: "prediction", meaning: "guessing what will happen next in a text, based on clues already given" },
  { concept: "visualizing", meaning: "forming a mental picture of what a text describes" },
  { concept: "clue", meaning: "a hint in the text that helps a reader predict or understand something" },
  { concept: "inference", meaning: "a conclusion reached using clues, not stated directly in the text" },
  { concept: "context", meaning: "the surrounding words or situation that help explain a word's meaning" },
  { concept: "title", meaning: "the name of a text, which often hints at its topic" },
  { concept: "mental image", meaning: "a picture formed in the mind while reading, without seeing an actual picture" },
  { concept: "confirm", meaning: "to check whether a prediction made earlier turned out to be correct" },
  { concept: "revise", meaning: "to change a prediction after learning new information from the text" },
  { concept: "cover", meaning: "the outside page of a book, which often shows images related to the story" },
];

interface VisualizeEntry { sentence: string; image: string }

const VISUALIZE: VisualizeEntry[] = [
  { sentence: "The two friends whispered secretly behind the classroom door.", image: "Two students leaning close together, talking quietly, partly hidden by a door" },
  { sentence: "He nervously twisted the hem of his shirt while his friends waited for an answer.", image: "A boy fidgeting with his shirt, looking anxious, with friends standing around him" },
  { sentence: "She walked confidently past the group, ignoring their teasing.", image: "A girl walking with her head held high, with peers behind her" },
  { sentence: "The clique huddled together, laughing loudly at someone across the yard.", image: "A tight group of friends laughing together, pointing across the yard" },
  { sentence: "He hesitated at the doorway, unsure whether to join the risky dare.", image: "A boy pausing uncertainly at a doorway" },
  { sentence: "Her mentor placed a reassuring hand on her shoulder.", image: "An older person gently resting a hand on a younger person's shoulder" },
  { sentence: "The younger learners copied everything the older boys did.", image: "A group of younger students imitating older boys' actions" },
  { sentence: "She slipped the note quietly into her friend's bag without anyone noticing.", image: "A girl carefully placing a folded note into a bag, glancing around" },
  { sentence: "The room fell silent as the teacher asked who had broken the rule.", image: "A quiet classroom, students avoiding eye contact" },
  { sentence: "He proudly refused the dare and walked away with his head held high.", image: "A boy walking away confidently, leaving a group behind" },
];

interface PredictionEntry { statement: string; type: string }

const PREDICTIONS: PredictionEntry[] = [
  { statement: "A boy hesitates at a risky dare, so a reader predicts he might refuse it, since he already looks unsure.", type: "Good prediction" },
  { statement: "A mentor comforts a worried learner, so a reader predicts the mentor will give unrelated cooking instructions.", type: "Poor prediction" },
  { statement: "A clique laughs at someone, so a reader predicts the story may explore how it feels to be left out.", type: "Good prediction" },
  { statement: "Two friends whisper secretly behind a door, so a reader predicts a plot twist about space travel.", type: "Poor prediction" },
  { statement: "A character walks confidently past teasing peers, so a reader predicts she may stand up for herself later.", type: "Good prediction" },
  { statement: "A note is slipped quietly into a bag, so a reader predicts the note might reveal a secret or message.", type: "Good prediction" },
  { statement: "A classroom goes silent when a rule is broken, so a reader predicts someone will admit what happened.", type: "Good prediction" },
  { statement: "A boy fidgets nervously, so a reader predicts the passage is actually about farm tools.", type: "Poor prediction" },
  { statement: "Younger learners copy older boys, so a reader predicts the story explores peer influence and imitation.", type: "Good prediction" },
  { statement: "A boy walks away from a dare confidently, so a reader predicts an unrelated ending about a football match.", type: "Poor prediction" },
];

interface FillEntry { before: string; after: string; answer: string }

const FILLS: FillEntry[] = [
  { before: "Before reading further, she used", after: "to guess what would happen next.", answer: "prediction" },
  { before: "He formed a clear picture in his mind by", after: "the scene as he read.", answer: "visualizing" },
  { before: "The title gave her a helpful", after: "about the story's topic.", answer: "clue" },
  { before: "Since the text never said it directly, he made an", after: "based on the clues given.", answer: "inference" },
  { before: "She used the surrounding words, or", after: ", to work out the meaning of the new word.", answer: "context" },
  { before: "After finishing the chapter, he", after: "his earlier prediction and found it was correct.", answer: "confirmed" },
  { before: "New information made her", after: "her earlier prediction.", answer: "revise" },
  { before: "The book", after: "already hinted at what the story would be about.", answer: "cover" },
  { before: "Reading the", after: "helped him guess what the passage was about before he began.", answer: "title" },
  { before: "She built a strong", after: "of the characters as she read the passage.", answer: "mental image" },
];

const STRATEGY_STEPS: { id: string; label: string }[] = [
  { id: "preview", label: "Look at the title and any pictures before reading" },
  { id: "predict", label: "Make a prediction about what the text might be about" },
  { id: "visualize", label: "Read the text, forming mental images of what is described" },
  { id: "check", label: "Check whether your prediction was correct as you read" },
  { id: "revise", label: "Revise your prediction if new information changes it" },
  { id: "confirm", label: "Confirm your final understanding once you finish reading" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads the title "Standing Up to Peer Pressure" before starting the passage. What should ${who} do with it?`, correct: "Use it to predict what the passage will likely be about", wrong: ["Ignore it completely, since titles are never useful", "Assume it has nothing to do with the passage", "Skip the passage since the title already explains everything"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads "He hesitated at the doorway, unsure whether to join the risky dare." What is a well-reasoned prediction based on this clue?`, correct: "He might decide not to join the dare, since he already seems unsure", wrong: ["He will definitely become a professional athlete", "The story will suddenly shift to describe a different country entirely", "Nothing can be predicted from this sentence"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} pictures a girl walking with her head held high while peers tease her from behind. What reading strategy is ${who} using?`, correct: "Visualizing", wrong: ["Predicting", "Confirming", "Revising"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads new information partway through a passage that does not match an earlier prediction. What should ${who} do?`, correct: "Revise the prediction to fit the new information", wrong: ["Ignore the new information completely", "Stop reading the passage immediately", "Assume the passage made a mistake"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who}'s group in ${where} discusses "inference" while reading a peer-influence story. What is an inference?`, correct: "A conclusion reached using clues, not stated directly in the text", wrong: ["A fact stated word for word in the text", "A picture printed on the book's cover", "A guess made with no clues at all"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reads that a clique laughs loudly at someone across the yard. Which is the most reasonable prediction?`, correct: "The story may explore how it feels to be excluded or teased by peers", wrong: ["The story will describe a science experiment in detail", "Nothing in the story relates to peer influence at all", "The laughing has no possible meaning in the story"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} reaches the end of a passage and checks whether an earlier guess about the ending was right. What is this called?`, correct: "Confirming a prediction", wrong: ["Visualizing a scene", "Skimming the passage", "Ignoring the passage"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} makes a prediction that has nothing to do with any clue in the passage. What is the problem?`, correct: "A good prediction should be based on clues in the text, not a random guess", wrong: ["There is no problem — all predictions are equally valid", "Predictions should never be based on clues", "The passage will change to match the prediction"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} uses the words around an unfamiliar term to work out its meaning. What reading skill is ${who} using?`, correct: "Using context to infer meaning", wrong: ["Visualizing an image", "Confirming a prediction", "Reading the title only"] }; },
  (rng) => { const who = name(rng), where = place(rng); return { prompt: `${who} in ${where} skips forming any mental pictures while reading a peer-influence story. What might ${who} lose out on?`, correct: "A clearer, more vivid understanding of the scenes being described", wrong: ["Nothing — visualizing has no effect on understanding", "The ability to read the words at all", "The story's actual printed text"] }; },
];

export const peerInfluenceReadingStrategies: Skill = {
  id: "g6-il-r-peer-influence",
  code: "R.4",
  subjectId: "indigenous-language",
  strandId: "g6-il-reading",
  grade: 6,
  title: "Peer influence: reading comprehension strategies",
  description: "Apply prediction and visualizing as reading strategies to comprehend peer-influence texts.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A good prediction is based on clues in the text; visualizing means forming a mental picture of what is described.";

    if (branch === "match" && randChoice(rng, [true, false])) {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each sentence with the mental image a reader would form.", "each sentence below with what a reader would visualize.", "each sentence with the picture it creates in your mind.", "each sentence with its matching mental image."];
      const chosen = shuffle(rng, VISUALIZE).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a, i) => ({ id: `v${i}`, label: a.sentence })));
      const targets = shuffle(rng, chosen.map((a, i) => ({ id: `v${i}`, label: a.image })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`v${i}`] = `v${i}`));
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `"${a.sentence}" — ${a.image}.`).join(" ") };
    }

    if (branch === "match") {
      const OPENERS = ["Match", "Pair up", "Connect", "Line up", "Correctly match"];
      const CLOSERS = ["each reading-strategy term with its meaning.", "each term below with its correct meaning.", "each strategy term with the phrase that defines it.", "each term with what it actually means."];
      const chosen = shuffle(rng, CONCEPTS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.concept })));
      const targets = shuffle(rng, chosen.map((a) => ({ id: a.concept, label: a.meaning })));
      const correctMap: Record<string, string> = {};
      for (const a of chosen) correctMap[a.concept] = a.concept;
      return { kind: "click-match", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), tokens, targets, correctMap, hint, explanation: chosen.map((a) => `${a.concept} — ${a.meaning}.`).join(" ") };
    }

    if (branch === "categorize") {
      const OPENERS = ["Sort", "Group", "Classify", "Organize", "Place"];
      const CLOSERS = ["each prediction below by whether it is good or poor.", "each statement into the correct prediction-quality group.", "these predictions into their correct groups.", "each prediction by whether it is based on real clues in the text."];
      const chosen = shuffle(rng, PREDICTIONS).slice(0, 8);
      const buckets = [{ id: "Good prediction", label: "Good prediction" }, { id: "Poor prediction", label: "Poor prediction" }];
      const items = chosen.map((c, i) => ({ id: `pr${i}`, label: c.statement }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`pr${i}`] = c.type));
      return { kind: "categorize", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), items, buckets, correctBucket, hint: "Ask: is the prediction actually based on a clue mentioned in the text, or is it a random, unrelated guess?", explanation: chosen.map((c) => `${c.statement} — ${c.type}.`).join(" ") };
    }

    if (branch === "order") {
      const OPENERS = ["Arrange", "Sequence", "Put", "Order", "Work out and arrange"];
      const CLOSERS = ["the steps for using prediction and visualizing in order.", "these reading-strategy steps into the order they should happen.", "the steps below into a sensible sequence.", "these steps as you would actually follow them."];
      const items = shuffle(rng, STRATEGY_STEPS);
      return { kind: "ordering", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), instruction: "Click them in order.", items, correctOrder: STRATEGY_STEPS.map((s) => s.id), hint: "Start by previewing the title, predict, visualize while reading, then check, revise, and confirm.", explanation: STRATEGY_STEPS.map((s) => s.label).join(" → ") };
    }

    if (branch === "fill") {
      const OPENERS = ["Fill in", "Complete the sentence with", "Choose and write", "Supply"];
      const CLOSERS = ["the reading-strategy term that correctly completes this sentence.", "the missing term below.", "the word that best completes this sentence.", "the correct term to finish the sentence.", "the term that best fits the blank."];
      const entry = randChoice(rng, FILLS);
      return { kind: "fill-blank", prompt: randChoice(rng, withEach(OPENERS, CLOSERS)), before: entry.before, after: entry.after, correctAnswer: entry.answer, inputMode: "text", hint, explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim() };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, Array.from(new Set([entry.correct, ...entry.wrong])));
    return { kind: "multiple-choice", prompt: entry.prompt, choices, correctIndex: choices.indexOf(entry.correct), layout: "list", hint, explanation: `The correct answer is "${entry.correct}".` };
  },
};
