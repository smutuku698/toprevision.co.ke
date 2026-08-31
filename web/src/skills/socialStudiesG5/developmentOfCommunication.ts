import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "Development of Communication" — 3 named
// traditional forms (Ululations, Drumming, Fire and smoke signals) and 4 named modern forms (Mobile
// phones, Television, Radio, Newspapers). See curriculum-reference/grade-5/social-studies.json.

type Era = "TRADITIONAL" | "MODERN";

const FORMS: { id: string; form: string; era: Era; use: string }[] = [
  { id: "ululations", form: "Ululations", era: "TRADITIONAL", use: "a celebratory sound made by women, used at ceremonies or to spread urgent news quickly" },
  { id: "drumming", form: "Drumming", era: "TRADITIONAL", use: "rhythmic signals that could carry messages over distance, used to call meetings or warn of danger" },
  { id: "firesmoke", form: "Fire and smoke signals", era: "TRADITIONAL", use: "visual signals seen from far away, used to warn of danger or send messages" },
  { id: "mobile", form: "Mobile phones", era: "MODERN", use: "instant voice and text communication with anyone, anywhere" },
  { id: "television", form: "Television", era: "MODERN", use: "shows visual news and entertainment to many people at once" },
  { id: "radio", form: "Radio", era: "MODERN", use: "carries audio news and information to wide areas, including rural areas" },
  { id: "newspaper", form: "Newspapers", era: "MODERN", use: "provides printed news and information that can be kept and re-read" },
];

const INTERNET_SAFETY_TIPS = [
  "only share your phone number with people you and your family trust",
  "tell a trusted adult if a stranger contacts you",
  "never share your home address with someone you don't know",
  "ask a parent or guardian before using a new app or website",
] as const;

export const developmentOfCommunication: Skill = {
  id: "g5-ss-res-development-of-communication",
  code: "R.6",
  subjectId: "social-studies",
  strandId: "g5-ss-resources",
  grade: 5,
  title: "Development of Communication",
  description: "Comparing traditional forms of communication (ululations, drumming, fire and smoke signals) with modern forms (mobile phones, television, radio, newspapers), including internet safety.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const f = randChoice(rng, FORMS);
      const choices = shuffle(rng, ["Traditional form of communication", "Modern form of communication"]);
      const correct = f.era === "TRADITIONAL" ? "Traditional form of communication" : "Modern form of communication";
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "kind of communication")} "${f.form}" — it ${f.use}.`,
        choices,
        correctIndex: choices.indexOf(correct),
        hint: "Traditional forms don't need electricity or technology; modern forms do.",
        explanation: `${f.form} is a ${correct.toLowerCase()}: it ${f.use}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, FORMS).slice(0, 4);
      const tokens = chosen.map((f) => ({ id: f.id, label: f.form }));
      const targets = shuffle(rng, chosen).map((f) => ({ id: f.id, label: f.use.charAt(0).toUpperCase() + f.use.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.id] = f.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "form of communication to its main use"),
        tokens,
        targets,
        correctMap,
        hint: "Recall what each form of communication is used for.",
        explanation: chosen.map((f) => `${f.form}: ${f.use}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const items = FORMS.map((f) => ({ id: f.id, label: f.form }));
      const shuffled = shuffle(rng, items);
      const correctBucket: Record<string, string> = {};
      for (const f of FORMS) correctBucket[f.id] = f.era;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the form of communication is traditional or modern"),
        items: shuffled,
        buckets: [
          { id: "TRADITIONAL", label: "Traditional Form" },
          { id: "MODERN", label: "Modern Form" },
        ],
        correctBucket,
        hint: "Ululations, drumming and fire/smoke signals are traditional; mobile phones, television, radio and newspapers are modern.",
        explanation: FORMS.map((f) => `${f.form} is a ${f.era === "TRADITIONAL" ? "traditional" : "modern"} form of communication.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const tip = randChoice(rng, INTERNET_SAFETY_TIPS);
      const templates = [
        () => ({ before: "A celebratory sound made by women, used to spread urgent news quickly, is called an", after: ".", correct: "ululation" }),
        () => ({ before: "Rhythmic signals used to call meetings or warn of danger over distance is called", after: ".", correct: "drumming" }),
        () => ({ before: "Radio carries audio news and information to wide areas, including", after: "areas.", correct: "rural" }),
        () => ({ before: "Printed news and information that can be kept and re-read is found in", after: ".", correct: "newspapers" }),
        () => ({ before: `To stay safe online, you should`, after: ".", correct: tip }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the 3 traditional and 4 modern forms of communication, and internet safety habits.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const steps = shuffle(rng, [
      { id: "light", label: "A signal fire is lit on a hill" },
      { id: "see", label: "Neighbours in nearby villages see the smoke" },
      { id: "pass", label: "They pass the warning on by drum or ululation" },
      { id: "reach", label: "The message reaches the whole community" },
    ]);
    const correctOrder = ["light", "see", "pass", "reach"];
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these steps showing how a message travelled using traditional forms of communication"),
      instruction: "Arrange the steps in the order the message would travel.",
      items: steps,
      correctOrder,
      hint: "It starts with lighting a signal and ends with the message reaching everyone.",
      explanation: "A traditional message journey: a signal fire is lit, neighbours see the smoke, they pass the warning on by drum or ululation, and the message reaches the whole community.",
    };
  },
};
