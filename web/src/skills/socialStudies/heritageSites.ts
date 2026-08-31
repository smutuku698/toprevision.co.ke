import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const SITES: { name: string; fact: string; country: string; type: "natural" | "cultural"; inscribed: number }[] = [
  { name: "Rock-Hewn Churches", fact: "Churches in Lalibela, Ethiopia, carved directly out of solid volcanic rock in the 12th and 13th centuries", country: "Ethiopia", type: "cultural", inscribed: 1978 },
  { name: "Vallée de Mai Nature Reserve", fact: "A palm forest reserve on Praslin Island, Seychelles, home to the giant coco de mer palm", country: "Seychelles", type: "natural", inscribed: 1983 },
  { name: "Serengeti National Park", fact: "A vast savanna park in Tanzania, famous for the annual wildebeest migration", country: "Tanzania", type: "natural", inscribed: 1981 },
  { name: "Robben Island", fact: "An island off Cape Town, South Africa, where Nelson Mandela was imprisoned during apartheid", country: "South Africa", type: "cultural", inscribed: 1999 },
  { name: "Victoria Falls", fact: "A massive waterfall on the Zambezi River, on the border of Zambia and Zimbabwe", country: "Zambia and Zimbabwe", type: "natural", inscribed: 1989 },
];

const TYPE_LABEL: Record<string, string> = {
  natural: "A natural heritage site (recognised for its landscape, wildlife, or geology)",
  cultural: "A cultural heritage site (recognised for its human history or built heritage)",
};

const CONSERVATION_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "Why is it important to conserve Africa's World Heritage Sites?",
    choices: ["They hold unique natural or cultural value that, once lost, cannot be replaced", "They have no real importance beyond attracting tourists", "They are only valuable to the country that owns them", "They need no protection once named a World Heritage Site"],
    correctIndex: 0,
    explanation: "World Heritage Sites hold unique natural or cultural value for all of humanity — once destroyed, that value is lost permanently.",
  },
  {
    prompt: "Which of these is a genuine threat that can face World Heritage Sites like Serengeti or Victoria Falls?",
    choices: ["Uncontrolled tourism, poaching, and nearby development pressure", "Too many conservation laws protecting them", "Excessive rainfall in every single year", "A shortage of tourists visiting at all"],
    correctIndex: 0,
    explanation: "Uncontrolled tourism, poaching, and pressure from nearby development are real threats that can damage natural heritage sites over time.",
  },
  {
    prompt: "How does involving local communities help conserve a heritage site like Robben Island or the Lalibela churches?",
    choices: ["Communities who benefit from and understand a site's value are more likely to help protect it", "Communities have no role in protecting heritage sites", "It only matters for natural sites, not cultural ones", "It removes the need for any government regulation"],
    correctIndex: 0,
    explanation: "When local communities understand and benefit from a heritage site, they are more likely to actively help protect it from damage or neglect.",
  },
  {
    prompt: "What does UNESCO World Heritage status mainly signal about a site?",
    choices: ["It has outstanding natural or cultural value recognised as important to all of humanity", "It is the property of the United Nations", "It can no longer be visited by tourists", "It has no scientific or historical importance"],
    correctIndex: 0,
    explanation: "UNESCO World Heritage status recognises a site's outstanding natural or cultural value to humanity as a whole, not ownership by any single body.",
  },
];

export const heritageSites: Skill = {
  id: "ss-nhbe-heritage-sites",
  code: "NHBE.5",
  subjectId: "social-studies",
  strandId: "ss-nhbe",
  grade: 9,
  title: "World heritage sites in Africa",
  description: "Match each African World Heritage Site to a fact about it.",
  generate(rng) {
    const hint = "Each of these sites is recognised by UNESCO for its unique natural or cultural value.";
    const branch = randChoice(rng, ["which-site", "match", "type", "country", "year-order", "conservation"] as const);

    if (branch === "type") {
      const chosen = shuffle(rng, SITES);
      const items = chosen.map((s) => ({ id: s.name, label: s.name }));
      const correctBucket: Record<string, string> = {};
      for (const s of chosen) correctBucket[s.name] = s.type;
      return {
        kind: "categorize",
        prompt: "Sort each World Heritage Site as a natural or a cultural heritage site.",
        items,
        buckets: [
          { id: "natural", label: "Natural heritage site" },
          { id: "cultural", label: "Cultural heritage site" },
        ],
        correctBucket,
        hint: "Natural sites are recognised for landscapes/wildlife/geology; cultural sites are recognised for human history or built heritage.",
        explanation: chosen.map((s) => `${s.name} is ${TYPE_LABEL[s.type].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "country") {
      const target = randChoice(rng, SITES);
      return {
        kind: "fill-blank",
        prompt: `Complete the sentence: ${target.name} is located in ___.`,
        before: "",
        after: "",
        correctAnswer: target.country,
        acceptedAnswers: [target.country.toLowerCase()],
        inputMode: "text",
        hint: "Think about which African country or countries this World Heritage Site is found in.",
        explanation: `${target.name} is located in ${target.country}.`,
      };
    }

    if (branch === "year-order") {
      const count = randChoice(rng, [4, 5] as const);
      const selected = shuffle(rng, SITES).slice(0, count);
      const correctOrder = [...selected].sort((a, b) => a.inscribed - b.inscribed).map((s) => s.name);
      return {
        kind: "ordering",
        prompt: "Arrange these World Heritage Sites from earliest to most recent year they were inscribed on the UNESCO World Heritage List.",
        instruction: "Drag to reorder from earliest to most recent.",
        items: shuffle(rng, selected.map((s) => ({ id: s.name, label: `${s.name} (${s.country})` }))),
        correctOrder,
        hint: "Think about when each site was formally recognised by UNESCO.",
        explanation: correctOrder.map((name) => { const s = SITES.find((x) => x.name === name)!; return `${s.inscribed} — ${s.name}.`; }).join(" "),
      };
    }

    if (branch === "conservation") {
      const q = randChoice(rng, CONSERVATION_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint: "Think about why these sites matter, what threatens them, and how communities can help protect them.",
        explanation: q.explanation,
      };
    }

    if (branch === "which-site") {
      const target = randChoice(rng, SITES);
      const distractors = shuffle(rng, SITES.filter((s) => s.name !== target.name)).slice(0, 3);
      const choices = shuffle(rng, [target.name, ...distractors.map((d) => d.name)]);

      return {
        kind: "multiple-choice",
        prompt: `Which World Heritage Site: "${target.fact}"?`,
        choices,
        correctIndex: choices.indexOf(target.name),
        layout: "list",
        hint,
        explanation: `${target.name} — ${target.fact.toLowerCase()}.`,
      };
    }

    const chosen = shuffle(rng, SITES).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.name })));
    const targets = shuffle(rng, chosen.map((s) => ({ id: s.name, label: s.fact })));
    const correctMap: Record<string, string> = {};
    for (const s of chosen) correctMap[s.name] = s.name;

    return {
      kind: "click-match",
      prompt: "Match each World Heritage Site to a fact about it.",
      tokens,
      targets,
      correctMap,
      hint: "Each of these sites is recognised by UNESCO for its unique natural or cultural value.",
      explanation: chosen.map((s) => `${s.name} — ${s.fact.toLowerCase()}.`).join(" "),
    };
  },
};
