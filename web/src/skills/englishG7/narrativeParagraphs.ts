import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const PART_INFO: { id: string; label: string; description: string }[] = [
  { id: "intro", label: "Introduction", description: "Introduces the topic and sets the scene for the reader" },
  { id: "detail", label: "Necessary detail", description: "Gives specific facts or events that support and develop the topic" },
  { id: "conclusion", label: "Conclusion", description: "Wraps up the paragraph, often stating the outcome or result" },
];

const PARAGRAPHS: { id: string; topic: string; intro: string; details: string[]; conclusion: string; odd: string }[] = [
  {
    id: "handwashing",
    topic: "a school handwashing campaign",
    intro: "Last term, our school launched a handwashing campaign to fight the spread of germs.",
    details: [
      "Teachers set up washing stations with soap and clean water outside every classroom.",
      "Prefects reminded students to wash their hands before break time and after using the toilet.",
      "Posters showing the correct handwashing steps were pinned up in every corridor.",
    ],
    conclusion: "Within a month, fewer students were reporting stomach illnesses, showing how much the campaign had helped.",
    odd: "My uncle recently bought a new motorcycle for his shop deliveries.",
  },
  {
    id: "firedrill",
    topic: "a fire safety drill at school",
    intro: "On Monday morning, our school held a surprise fire safety drill to test how quickly we could evacuate.",
    details: [
      "The alarm bell rang loudly and every class filed out in an orderly line.",
      "Teachers counted their students at the assembly point to make sure nobody was left behind.",
      "The security guard demonstrated how to use a fire extinguisher safely.",
    ],
    conclusion: "The head teacher praised us for evacuating calmly in under three minutes.",
    odd: "The school choir will be performing at the county music festival next week.",
  },
  {
    id: "neighbourhoodwatch",
    topic: "a neighbourhood security meeting",
    intro: "Last Saturday, residents of our estate met to discuss how to improve security after a string of break-ins.",
    details: [
      "A local police officer explained how to install stronger locks and motion-sensor lights.",
      "Neighbours agreed to form a watch group that patrols the streets in the evening.",
      "The chairperson suggested installing a CCTV camera at the main gate.",
    ],
    conclusion: "By the end of the meeting, everyone felt more confident that the estate would be safer.",
    odd: "The estate's football team won their match against a rival estate last month.",
  },
  {
    id: "roadsafety",
    topic: "a road safety lesson",
    intro: "During assembly, a traffic police officer visited our school to teach us about road safety.",
    details: [
      "She explained why we should always use the zebra crossing instead of crossing anywhere.",
      "She showed us reflective armbands that make pedestrians visible to drivers at night.",
      "She warned us never to cross the road while looking at a phone.",
    ],
    conclusion: "After the talk, most students promised to be more careful when walking to and from school.",
    odd: "Our school library recently received a donation of new story books.",
  },
];

export const narrativeParagraphs: Skill = {
  id: "g7-eng-w-narrative-paragraphs",
  code: "W.3",
  subjectId: "english",
  strandId: "g7-eng-writing",
  grade: 7,
  title: "Writing Narrative Paragraphs",
  description: "Identify the introduction, necessary detail, and conclusion of a narrative paragraph about hygiene, safety, or security, and compose one with a clear structure.",
  generate(rng) {
    const branch = randChoice(rng, ["part-mc", "order", "odd-mc", "match", "categorize"] as const);
    const hint = "A narrative paragraph opens with an introduction that sets the scene, develops with necessary details that support the topic, and ends with a conclusion.";

    if (branch === "part-mc") {
      const para = randChoice(rng, PARAGRAPHS);
      const partId = randChoice(rng, ["intro", "detail", "conclusion"] as const);
      const sentence = partId === "intro" ? para.intro : partId === "conclusion" ? para.conclusion : randChoice(rng, para.details);
      const label = PART_INFO.find((p) => p.id === partId)!.label;
      const choices = shuffle(rng, PART_INFO.map((p) => p.label));
      return {
        kind: "multiple-choice",
        prompt: `In this narrative paragraph about ${para.topic}, which part does this sentence belong to? "${sentence}"`,
        choices,
        correctIndex: choices.indexOf(label),
        layout: "list",
        hint,
        explanation: `"${sentence}" is the ${label.toLowerCase()} — ${PART_INFO.find((p) => p.id === partId)!.description.toLowerCase()}.`,
      };
    }

    if (branch === "order") {
      const para = randChoice(rng, PARAGRAPHS);
      const sentences = [para.intro, ...para.details, para.conclusion];
      const items = sentences.map((s, i) => ({ id: `s${i}`, label: s }));
      return {
        kind: "ordering",
        prompt: `Arrange these sentences into a well-structured narrative paragraph about ${para.topic}.`,
        instruction: "Click the sentences in order, from first to last.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint,
        explanation: sentences.join(" → "),
      };
    }

    if (branch === "odd-mc") {
      const para = randChoice(rng, PARAGRAPHS);
      const keep = randChoice(rng, para.details);
      const choices = shuffle(rng, [para.intro, keep, para.conclusion, para.odd]);
      return {
        kind: "multiple-choice",
        prompt: `Which sentence does NOT belong in this narrative paragraph about ${para.topic}?`,
        choices,
        correctIndex: choices.indexOf(para.odd),
        layout: "list",
        hint: "The sentence that doesn't belong is about a completely different topic — it breaks the paragraph's unity and flow.",
        explanation: `"${para.odd}" does not belong — it has nothing to do with ${para.topic}, unlike the other sentences, which all build on the same topic.`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, PART_INFO.map((p) => ({ id: p.id, label: p.label })));
      const targets = shuffle(rng, PART_INFO.map((p) => ({ id: p.id, label: p.description })));
      const correctMap: Record<string, string> = {};
      for (const p of PART_INFO) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: "Match each part of a narrative paragraph to what it does.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: PART_INFO.map((p) => `${p.label}: ${p.description}.`).join(" "),
      };
    }

    const para = randChoice(rng, PARAGRAPHS);
    const details = shuffle(rng, para.details).slice(0, 2);
    const chosen = shuffle(rng, [
      { text: para.intro, part: "intro" },
      ...details.map((d) => ({ text: d, part: "detail" })),
      { text: para.conclusion, part: "conclusion" },
    ]);
    const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
    const correctBucket: Record<string, string> = {};
    chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.part));
    return {
      kind: "categorize",
      prompt: `Sort each sentence from this narrative paragraph about ${para.topic} by which part it belongs to.`,
      items,
      buckets: PART_INFO.map((p) => ({ id: p.id, label: p.label })),
      correctBucket,
      hint,
      explanation: chosen.map((c) => `"${c.text}" is the ${PART_INFO.find((p) => p.id === c.part)!.label.toLowerCase()}.`).join(" "),
    };
  },
};
