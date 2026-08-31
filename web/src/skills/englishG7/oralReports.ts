import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type ReportPart = "introduction" | "body" | "conclusion";

const REPORT_SENTENCES: { text: string; part: ReportPart }[] = [
  { text: "Good morning, classmates. Today I will report on our class trip to Lake Nakuru National Park, which we visited last Friday.", part: "introduction" },
  { text: "In this report, I will describe what we saw, what we learned, and how the day ended.", part: "introduction" },
  { text: "As soon as we entered the park gate, our guide pointed out a group of white rhinos grazing near the lake shore.", part: "body" },
  { text: "We counted over fifty pink flamingos wading in the shallow water, and our teacher explained why the lake attracts so many birds.", part: "body" },
  { text: "At midday, we climbed Baboon Cliff and looked down at the whole lake stretched out below us.", part: "body" },
  { text: "In conclusion, the trip taught us how important it is to protect wildlife habitats like Lake Nakuru.", part: "conclusion" },
  { text: "I would like to thank our teachers and the park rangers for making the day both safe and educational.", part: "conclusion" },
];

const DELIVERY_TECHNIQUES: { name: string; effect: string }[] = [
  { name: "Clear pronunciation", effect: "Helps the audience understand every word of the report without needing to guess" },
  { name: "Voice projection", effect: "Ensures pupils at the back of the classroom can hear the report clearly" },
  { name: "Tonal variation", effect: "Keeps the audience interested by avoiding a flat, boring voice throughout" },
  { name: "Non-verbal cues", effect: "Uses gestures and facial expressions to add visual interest and emphasise key points" },
  { name: "Visual aids", effect: "Helps the audience picture places or things they have not seen themselves, such as photos or a map" },
  { name: "Eye contact", effect: "Shows confidence and keeps the audience engaged with the speaker" },
];

const ORDER_STEPS = [
  { id: "research", label: "Choose and research the classroom event, gathering facts and details" },
  { id: "organise", label: "Organise your facts into an introduction, body, and conclusion" },
  { id: "write", label: "Write out or note down the key points of your report" },
  { id: "rehearse", label: "Rehearse the report aloud, practising your voice and timing" },
  { id: "deliver", label: "Deliver the report clearly to your audience, using visual aids if available" },
  { id: "respond", label: "Respond politely to any questions from the audience" },
];

const FIX_ITEMS: { desc: string; fix: string; distractors: string[] }[] = [
  { desc: "Wanjiku read her report on the class trip to Fort Jesus directly from a sheet of paper without ever looking up at her classmates.", fix: "Eye contact", distractors: ["Visual aids", "Tonal variation", "Voice projection"] },
  { desc: "Otieno's report on the nature walk at Karura Forest was delivered in a flat, unchanging voice from the first sentence to the last.", fix: "Tonal variation", distractors: ["Eye contact", "Non-verbal cues", "Visual aids"] },
  { desc: "Amina mumbled her report on the trip to Maasai Mara so quietly that pupils at the back of the classroom could not hear the animals she described.", fix: "Voice projection", distractors: ["Non-verbal cues", "Tonal variation", "Eye contact"] },
  { desc: "Brian described the shape of Hell's Gate Gorge in detail but never showed the photos he had brought, so many classmates struggled to picture it.", fix: "Visual aids", distractors: ["Voice projection", "Eye contact", "Clear pronunciation"] },
];

const FILL_ITEMS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "The opening part of an oral report, which states the topic and previews what will be covered, is called the ", after: ".", correctAnswer: "introduction" },
  { before: "The main part of an oral report, which gives full facts, details, and examples, is called the ", after: ".", correctAnswer: "body" },
  { before: "The closing part of an oral report, which summarises the key points, is called the ", after: ".", correctAnswer: "conclusion" },
  { before: "Practising your report aloud before presenting it to the class is called ", after: ".", correctAnswer: "rehearsing", acceptedAnswers: ["rehearsal"] },
];

const CONCEPT_QUESTIONS: { q: string; correct: string; distractors: string[] }[] = [
  {
    q: "How can you make an oral report presentation interesting?",
    correct: "By varying your tone, using clear pronunciation, adding visual aids, and keeping eye contact with the audience",
    distractors: ["By reading every word directly from a script without looking up", "By speaking as quickly as possible to finish before question time", "By using the exact same tone of voice throughout the whole report"],
  },
  {
    q: "Why do good oral reports usually follow an introduction-body-conclusion structure?",
    correct: "It helps the audience follow the report logically, from what it is about, to the key details, to a final summary",
    distractors: ["It has no real benefit and is simply a school rule", "It only matters for written reports, not spoken ones", "It makes the report longer, which impresses the audience more"],
  },
  {
    q: "Why is it valuable to listen attentively when a classmate is presenting an oral report?",
    correct: "It shows respect for the speaker and allows the listener to ask good follow-up questions afterwards",
    distractors: ["It is only necessary if the topic is about something exciting", "Listening to reports has no real value for the listener", "It is polite to look busy with something else while a classmate speaks"],
  },
];

export const oralReports: Skill = {
  id: "g7-eng-ls-oral-reports",
  code: "LS.15",
  subjectId: "english",
  strandId: "g7-eng-listening-speaking",
  grade: 7,
  title: "Oral Reports on Classroom Events",
  description: "Outline the organisation of an oral report, present a report on classroom events, and enjoy delivering and listening to oral reports.",
  generate(rng) {
    const branch = randChoice(rng, ["order", "categorize", "match", "scenario", "fill", "concept"] as const);
    const hint = "A well-organised oral report has an introduction that previews the topic, a body full of details, and a conclusion that sums things up.";

    if (branch === "order") {
      const items = shuffle(rng, ORDER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of preparing and delivering an oral report on a classroom event in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: ORDER_STEPS.map((s) => s.id),
        hint: "Preparation begins with research, moves through organising and writing, then rehearsal, delivery, and finally responding to questions.",
        explanation: ORDER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, REPORT_SENTENCES).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.part));
      return {
        kind: "categorize",
        prompt: "This is part of a sample oral report on a class trip to Lake Nakuru National Park. Sort each sentence into Introduction, Body, or Conclusion.",
        items,
        buckets: [
          { id: "introduction", label: "Introduction" },
          { id: "body", label: "Body" },
          { id: "conclusion", label: "Conclusion" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((s) => `"${s.text}" belongs in the ${s.part}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, DELIVERY_TECHNIQUES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.name, label: t.effect })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: "Match each oral report delivery technique to the effect it creates for the audience.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((t) => `${t.name} — ${t.effect.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const entry = randChoice(rng, FIX_ITEMS);
      const choices = shuffle(rng, [entry.fix, ...entry.distractors]);
      return {
        kind: "multiple-choice",
        prompt: `${entry.desc} Which delivery technique would most improve this report?`,
        choices,
        correctIndex: choices.indexOf(entry.fix),
        layout: "list",
        hint: "Identify what quality is missing from the description — is it the voice, the eye contact, the visuals, or the tone?",
        explanation: `${entry.fix} would fix this weakness, since the description shows that quality was missing from the presentation.`,
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILL_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word to complete the sentence about oral reports.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint,
        explanation: `The complete sentence reads: "${entry.before}${entry.correctAnswer}${entry.after}"`,
      };
    }

    const entry = randChoice(rng, CONCEPT_QUESTIONS);
    const choices = shuffle(rng, [entry.correct, ...entry.distractors]);
    return {
      kind: "multiple-choice",
      prompt: entry.q,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
