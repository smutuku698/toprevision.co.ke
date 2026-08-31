import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// Theme 6 (Jobs and Occupation - Work Ethics) "Intensive Reading — Dialogue" sub-strand. Uses the
// `passage` field to show a short original dialogue and asks comprehension questions about it.

type DialoguePassage = {
  title: string;
  passage: string;
  directQ: string;
  directAnswer: string;
  directWrong: string[];
  inferentialQ: string;
  inferentialAnswer: string;
  inferentialWrong: string[];
};

const DIALOGUES: DialoguePassage[] = [
  {
    title: "The Late Delivery",
    passage: `SUPERVISOR: You're late again this week, Otieno. This is the third time.\nOTIENO: I'm sorry. My bicycle had a flat tyre this morning.\nSUPERVISOR: I understand accidents happen, but being reliable matters here.\nOTIENO: You're right. I'll leave home earlier from tomorrow, and I'll fix the tyre tonight.\nSUPERVISOR: Good. I appreciate you taking responsibility instead of making excuses.`,
    directQ: "Why was Otieno late for work?",
    directAnswer: "His bicycle had a flat tyre.",
    directWrong: ["He overslept.", "He was sick.", "He missed the bus."],
    inferentialQ: "What can you infer about Otieno's work ethic from how he responds to his supervisor?",
    inferentialAnswer: "He takes responsibility for his mistakes rather than making excuses.",
    inferentialWrong: ["He does not care about being late.", "He blames the supervisor for the problem.", "He plans to quit his job."],
  },
  {
    title: "An Honest Mistake",
    passage: `MANAGER: Chebet, the cash register is short by five hundred shillings today.\nCHEBET: I noticed that too. I gave a customer too much change by mistake.\nMANAGER: Did you correct it?\nCHEBET: I called the customer back and she returned the extra money. I've recorded it in the log.\nMANAGER: That's exactly the kind of honesty I expect from my staff.`,
    directQ: "Why was the cash register short by five hundred shillings?",
    directAnswer: "Chebet gave a customer too much change by mistake.",
    directWrong: ["Someone stole the money.", "The register was broken.", "The manager miscounted."],
    inferentialQ: "What value does the manager praise Chebet for?",
    inferentialAnswer: "Honesty and integrity in correcting her own mistake.",
    inferentialWrong: ["Her ability to work quickly.", "Her skill at counting money.", "Her friendliness with customers."],
  },
  {
    title: "Teamwork at the Workshop",
    passage: `KAMAU: The machine broke down again. We'll never finish the order by Friday alone.\nWANJIRU: Let's not give up. If we split the tasks between the whole team, we can still make it.\nKAMAU: You're right. I'll fix the machine while you organise the materials.\nWANJIRU: Good. If we go the extra mile today, we'll still hand in a quality order on time.`,
    directQ: "What problem do Kamau and Wanjiru face at the workshop?",
    directAnswer: "The machine broke down and the order might not be finished by Friday.",
    directWrong: ["They ran out of raw materials.", "A customer cancelled the order.", "They forgot the delivery address."],
    inferentialQ: "What can you infer about Wanjiru's attitude towards the setback?",
    inferentialAnswer: "She stays positive and looks for a practical solution instead of giving up.",
    inferentialWrong: ["She wants to abandon the order completely.", "She blames Kamau for the breakdown.", "She is not concerned about the deadline."],
  },
  {
    title: "A Co-worker's Request",
    passage: `NJERI: Could you cover my shift tomorrow? I have a family emergency.\nMUTISO: Of course. I know you'd do the same for me.\nNJERI: Thank you so much. I really appreciate it.\nMUTISO: No problem — that's what co-workers are for. Just let me know if you need anything else.`,
    directQ: "Why does Njeri ask Mutiso for help?",
    directAnswer: "She has a family emergency and needs someone to cover her shift.",
    directWrong: ["She wants a day off to travel.", "She forgot her work schedule.", "She wants to switch jobs."],
    inferentialQ: "What does Mutiso's response suggest about the relationship between co-workers here?",
    inferentialAnswer: "The co-workers support each other and value teamwork.",
    inferentialWrong: ["The co-workers dislike each other.", "Mutiso is being forced to help.", "The workplace has strict rules against helping others."],
  },
];

export const readingDialogueTexts: Skill = {
  id: "g6-eng-reading-dialogue",
  code: "R.4",
  subjectId: "english",
  strandId: "g6-eng-reading",
  grade: 6,
  title: "Reading Dialogue Texts",
  description: "Make connections between events in a dialogue and prior experience, infer meaning from context, and answer direct and inferential questions about work-ethics themed dialogues.",
  generate(rng) {
    const branch = randChoice(rng, ["direct-question", "inferential-question", "speaker-mc", "sequence-ordering"] as const);

    if (branch === "direct-question") {
      const d = randChoice(rng, DIALOGUES);
      const choices = shuffle(rng, [d.directAnswer, ...d.directWrong]);
      return {
        kind: "multiple-choice",
        prompt: d.directQ,
        passage: d.passage,
        choices,
        correctIndex: choices.indexOf(d.directAnswer),
        layout: "list",
        hint: "The answer is stated directly by one of the speakers.",
        explanation: `The dialogue directly shows: ${d.directAnswer}`,
      };
    }

    if (branch === "inferential-question") {
      const d = randChoice(rng, DIALOGUES);
      const choices = shuffle(rng, [d.inferentialAnswer, ...d.inferentialWrong]);
      return {
        kind: "multiple-choice",
        prompt: d.inferentialQ,
        passage: d.passage,
        choices,
        correctIndex: choices.indexOf(d.inferentialAnswer),
        layout: "list",
        hint: "This isn't said directly — reason from how the speakers act and respond.",
        explanation: `Based on how the speakers act in the dialogue, ${d.inferentialAnswer.charAt(0).toLowerCase() + d.inferentialAnswer.slice(1)}`,
      };
    }

    if (branch === "speaker-mc") {
      const d = randChoice(rng, DIALOGUES);
      const lines = d.passage.split("\n");
      const line = randChoice(rng, lines);
      const speaker = line.split(":")[0];
      const otherSpeakers = Array.from(new Set(lines.map((l) => l.split(":")[0]))).filter((s) => s !== speaker);
      const distractors = shuffle(rng, otherSpeakers).slice(0, Math.min(3, otherSpeakers.length));
      const choices = shuffle(rng, [speaker, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `In this dialogue, who says: "${line.split(":").slice(1).join(":").trim()}"?`,
        passage: d.passage,
        choices,
        correctIndex: choices.indexOf(speaker),
        layout: "row",
        hint: "Look at who speaks each line in the dialogue.",
        explanation: `${speaker} says this line.`,
      };
    }

    const d = randChoice(rng, DIALOGUES);
    const lines = d.passage.split("\n").map((l, i) => ({ id: `l-${i}`, label: l }));
    return {
      kind: "ordering",
      prompt: `Arrange these lines from "${d.title}" in the order they were spoken.`,
      instruction: "Click the lines in the correct order.",
      items: shuffle(rng, lines),
      correctOrder: lines.map((l) => l.id),
      hint: "Follow the natural flow of the conversation — a question or statement usually comes before its response.",
      explanation: `The correct order follows the dialogue as written: ${d.passage.replace(/\n/g, " / ")}`,
    };
  },
};
