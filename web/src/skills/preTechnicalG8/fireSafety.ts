import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const TECHNIQUES = [
  { id: "cooling", label: "Cooling", definition: "Lowering the temperature of burning material below its ignition point, usually with water" },
  { id: "smothering", label: "Smothering", definition: "Cutting off the fire's oxygen supply, e.g. with foam, a fire blanket, or sand" },
  { id: "starving", label: "Starving", definition: "Removing the fuel supply, e.g. clearing dry vegetation ahead of a bush fire" },
  { id: "interrupting", label: "Interrupting the chemical reaction", definition: "Breaking the chain reaction of combustion, e.g. with a dry chemical extinguishing agent" },
] as const;

const CAUSE_PREVENTION_ITEMS = [
  { text: "Overloading an electrical socket with too many appliances", bucket: "cause" },
  { text: "Storing petrol or paraffin near a naked flame or cooking jiko", bucket: "cause" },
  { text: "Leaving oily rags piled up in a warm, poorly ventilated store", bucket: "cause" },
  { text: "Faulty wiring left unrepaired in a workshop", bucket: "cause" },
  { text: "Regularly checking electrical wiring and appliances for damage", bucket: "prevention" },
  { text: "Storing flammable substances away from heat sources and naked flames", bucket: "prevention" },
  { text: "Keeping a fire extinguisher serviced and within easy reach", bucket: "prevention" },
  { text: "Clearing dry grass and rubbish away from buildings", bucket: "prevention" },
] as const;

const BUCKET_LABEL: Record<string, string> = { cause: "A cause of fire outbreaks", prevention: "A way of preventing fire outbreaks" };

const SCENARIOS = [
  { text: "Dry grass has caught fire and is spreading toward a homestead", best: "starving", why: "clearing a strip of dry grass ahead of the fire removes its fuel and stops it from spreading" },
  { text: "A pan of cooking oil has caught fire on a jiko", best: "smothering", why: "covering the pan with a lid or damp cloth cuts off the oxygen — water would make an oil fire worse" },
  { text: "A small paper fire has started in a wastebasket", best: "cooling", why: "pouring water on ordinary combustibles like paper lowers the temperature below the point where it can keep burning" },
  { text: "A workshop fire extinguisher uses a dry chemical powder to put out a fire", best: "interrupting", why: "the dry chemical powder breaks the chemical chain reaction that keeps the fire burning" },
] as const;

const RESPONSE_STEPS = [
  { id: "discover", label: "Notice the fire and raise the alarm immediately" },
  { id: "evacuate", label: "Help others evacuate calmly, keeping low if there is smoke" },
  { id: "tackle", label: "If the fire is small and it is safe to do so, use the nearest extinguisher" },
  { id: "call", label: "Call the fire brigade or emergency services and wait at a safe assembly point" },
];

export const fireSafety: Skill = {
  id: "g8-pt-f-fire-safety",
  code: "F.1",
  subjectId: "pre-technical",
  strandId: "g8-pt-foundations",
  grade: 8,
  title: "Fire Safety",
  description: "Causes of fire outbreaks, ways of preventing them, and the firefighting techniques used to extinguish fires in the environment.",
  generate(rng) {
    const branch = randChoice(rng, ["technique-match", "cause-prevention-sort", "scenario", "response-order", "recall"] as const);

    if (branch === "technique-match") {
      const tokens = shuffle(rng, TECHNIQUES.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, TECHNIQUES.map((t) => ({ id: t.id, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of TECHNIQUES) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Match each firefighting technique to what it actually does to put out a fire.",
        tokens,
        targets,
        correctMap,
        hint: "A fire needs heat, fuel, and oxygen — each technique removes one of these, or breaks the reaction itself.",
        explanation: TECHNIQUES.map((t) => `${t.label}: ${t.definition}.`).join(" "),
      };
    }

    if (branch === "cause-prevention-sort") {
      const chosen = shuffle(rng, CAUSE_PREVENTION_ITEMS).slice(0, 6);
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each statement into whether it is a cause of fire outbreaks, or a way of preventing them.",
        items,
        buckets,
        correctBucket,
        hint: "A cause creates a risk of fire starting; a prevention practice removes or manages that risk.",
        explanation: chosen.map((c) => `"${c.text}" — ${BUCKET_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const s = randChoice(rng, SCENARIOS);
      const technique = TECHNIQUES.find((t) => t.id === s.best)!;
      const others = TECHNIQUES.filter((t) => t.id !== s.best).map((t) => t.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, technique.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `${s.text}. Which firefighting technique is most appropriate here?`,
        choices,
        correctIndex,
        hint: "Think about which one of heat, fuel, or oxygen is easiest to remove in this situation.",
        explanation: `${technique.label} is best here because ${s.why}.`,
      };
    }

    if (branch === "response-order") {
      const items = shuffle(rng, RESPONSE_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the correct order of actions to take when you discover a fire in a building.",
        instruction: "Click them in order.",
        items,
        correctOrder: RESPONSE_STEPS.map((s) => s.id),
        hint: "Warn people first, get everyone to safety, only fight a small fire if it is safe, and always call for help.",
        explanation: RESPONSE_STEPS.map((s) => s.label).join(" → "),
      };
    }

    // recall
    const t = randChoice(rng, TECHNIQUES);
    return {
      kind: "fill-blank",
      prompt: `A firefighting technique is defined as: "${t.definition}."`,
      before: "This technique is called",
      after: ".",
      correctAnswer: t.label,
      acceptedAnswers: [t.id],
      inputMode: "text",
      hint: "Think about which part of the fire — heat, fuel, oxygen, or the reaction itself — this description is targeting.",
      explanation: `${t.label}: ${t.definition}.`,
    };
  },
};
