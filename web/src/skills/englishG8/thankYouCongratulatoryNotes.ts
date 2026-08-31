import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ELEMENTS: { id: string; label: string; description: string }[] = [
  { id: "greeting", label: "Greeting", description: "Addresses the person by name, e.g. 'Dear Naliaka,'" },
  { id: "reason", label: "Specific reason", description: "Names exactly what you are thankful for or congratulating them on" },
  { id: "warmth", label: "Warm, personal detail", description: "Adds a personal touch, such as how it made you feel" },
  { id: "closing", label: "Closing", description: "A friendly sign-off and your name, e.g. 'Warmly, Brian'" },
];

const PHRASE_ITEMS: { text: string; type: "thanks" | "congrats" }[] = [
  { text: "Thank you so much for the extra art lessons after school.", type: "thanks" },
  { text: "I am truly grateful for the time you spent teaching me to paint.", type: "thanks" },
  { text: "I really appreciate your patience while I learned to mix colours.", type: "thanks" },
  { text: "Congratulations on winning first place in the art competition!", type: "congrats" },
  { text: "Well done on completing such an amazing sculpture project.", type: "congrats" },
  { text: "I am so proud of you for having your artwork displayed at the gallery.", type: "congrats" },
];

const CRITIQUE_SCENARIOS: { occasion: string; good: string; bad: string; why: string }[] = [
  {
    occasion: "thanking your art mentor for extra lessons",
    good: "Thank you so much for the extra art lessons after school — I finally understand how to mix colours properly. I really appreciate your patience.",
    bad: "Thanks for stuff. See you around.",
    why: "The good note names exactly what the mentor did and how it helped, while the vague note gives no specific reason and feels careless.",
  },
  {
    occasion: "congratulating a friend on winning an art competition",
    good: "Congratulations on winning first place in the art competition! Your painting of the sunset was stunning — you worked so hard for this.",
    bad: "Congrats on the art thing, I guess it was fine.",
    why: "The good note is specific and warm, while the other sounds unenthusiastic and vague — it does not fit the joy of celebrating someone's achievement.",
  },
];

export const thankYouCongratulatoryNotes: Skill = {
  id: "g8-eng-w-thank-you-congratulatory-notes",
  code: "W.10",
  subjectId: "english",
  strandId: "g8-eng-writing",
  grade: 8,
  title: "Functional Writing: Thank You and Congratulatory Notes",
  description: "Recognise the layout and elements of thank-you and congratulatory notes, and critique them for relevance and warmth.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "match", "categorize", "critique"] as const);
    const hint = "Both notes greet the person, name a specific reason, add a warm personal touch, and close with a friendly sign-off.";

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the elements of a thank-you or congratulatory note in the order they should appear.",
        instruction: "Click the elements in order, from top to bottom.",
        items: shuffle(rng, ELEMENTS.map((e) => ({ id: e.id, label: e.label }))),
        correctOrder: ELEMENTS.map((e) => e.id),
        hint,
        explanation: ELEMENTS.map((e) => `${e.label} — ${e.description.toLowerCase()}`).join(" → "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, ELEMENTS.map((e) => ({ id: e.id, label: e.label })));
      const targets = shuffle(rng, ELEMENTS.map((e) => ({ id: e.id, label: e.description })));
      const correctMap: Record<string, string> = {};
      for (const e of ELEMENTS) correctMap[e.id] = e.id;
      return {
        kind: "click-match",
        prompt: "Match each element of a thank-you or congratulatory note to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: ELEMENTS.map((e) => `${e.label}: ${e.description}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const thanks = shuffle(rng, PHRASE_ITEMS.filter((p) => p.type === "thanks")).slice(0, 3);
      const congrats = shuffle(rng, PHRASE_ITEMS.filter((p) => p.type === "congrats")).slice(0, 3);
      const items = shuffle(rng, [...thanks, ...congrats]).map((p, i) => ({ id: `p${i}`, label: p.text, type: p.type }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.type;
      return {
        kind: "categorize",
        prompt: "Sort each phrase into Thank-you note or Congratulatory note.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "thanks", label: "Thank-you note" },
          { id: "congrats", label: "Congratulatory note" },
        ],
        correctBucket,
        hint: "A thank-you note expresses gratitude for something given or done. A congratulatory note celebrates someone's achievement or success.",
        explanation: `Thank-you: ${thanks.map((t) => t.text).join(" / ")}. Congratulatory: ${congrats.map((c) => c.text).join(" / ")}.`,
      };
    }

    const entry = randChoice(rng, CRITIQUE_SCENARIOS);
    const choices = shuffle(rng, [entry.good, entry.bad]);
    return {
      kind: "multiple-choice",
      prompt: `Which note is the better, more specific way of ${entry.occasion}?`,
      choices,
      correctIndex: choices.indexOf(entry.good),
      layout: "list",
      hint: "A strong note names specific details, not just vague, generic words.",
      explanation: entry.why,
    };
  },
};
