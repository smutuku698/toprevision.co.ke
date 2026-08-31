import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const SMS_FEATURES: { feature: string; description: string }[] = [
  { feature: "Brevity", description: "Keeping the message short and to the point" },
  { feature: "Clear purpose", description: "Making sure the reader understands why the message was sent" },
  { feature: "Correct recipient", description: "Sending the message to the right person" },
  { feature: "Polite tone", description: "Using respectful language, especially with elders or teachers" },
  { feature: "Appropriate abbreviations", description: "Using short forms that the reader will still understand" },
  { feature: "Signature or name", description: "Identifying who the message is from, when needed" },
  { feature: "Proofreading", description: "Checking the message for mistakes before sending it" },
  { feature: "Considerate timing", description: "Sending the message at a reasonable, considerate time" },
  { feature: "Privacy awareness", description: "Not sharing personal information carelessly" },
  { feature: "Digital etiquette", description: "Following accepted good manners when communicating digitally" },
];

const ETIQUETTE_ITEMS: { text: string; bucket: string }[] = [
  { text: "Reading through a message once more before sending it", bucket: "Good digital etiquette" },
  { text: "Using polite language when texting a teacher or elder", bucket: "Good digital etiquette" },
  { text: "Sending a non-urgent message at a reasonable hour", bucket: "Good digital etiquette" },
  { text: "Asking permission before sharing a friend's phone number with someone else", bucket: "Good digital etiquette" },
  { text: "Keeping a message brief and getting straight to the point", bucket: "Good digital etiquette" },
  { text: "Signing off with your name when messaging someone who may not have your number saved", bucket: "Good digital etiquette" },
  { text: "Sending the same message to a classmate over and over within minutes", bucket: "Poor digital etiquette" },
  { text: "Sharing a classmate's personal phone number without asking first", bucket: "Poor digital etiquette" },
  { text: "Sending a non-emergency message very late at night", bucket: "Poor digital etiquette" },
  { text: "Writing an entire message in capital letters to express anger", bucket: "Poor digital etiquette" },
  { text: "Using insulting language in a message to a classmate", bucket: "Poor digital etiquette" },
  { text: "Ignoring a message that clearly asks an urgent question", bucket: "Poor digital etiquette" },
];

const SMS_STEPS: { id: string; label: string }[] = [
  { id: "discuss", label: "Work jointly to talk about the features of an ideal SMS" },
  { id: "write", label: "Write an SMS using a digital device" },
  { id: "review", label: "Peer review another learner's SMS text" },
  { id: "etiquette", label: "Discuss social media etiquette when writing an SMS" },
  { id: "use", label: "Use SMS with etiquette going forward" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "Keeping a text message short and to the point is called", after: ".", answer: "brevity" },
  { before: "Making sure the reader understands why a message was sent is having a clear", after: ".", answer: "purpose" },
  { before: "Checking a message for mistakes before sending it is called", after: ".", answer: "proofreading" },
  { before: "Following accepted good manners when communicating digitally is called digital", after: ".", answer: "etiquette" },
  { before: "Not sharing someone's personal information carelessly shows", after: "awareness.", answer: "privacy" },
  { before: "Sending a message to the correct person means making sure you have the right", after: ".", answer: "recipient" },
  { before: "Using respectful language, especially with elders or teachers, in a text message shows a polite", after: ".", answer: "tone" },
  { before: "Signing a text message with your name helps the reader know who it is", after: ".", answer: "from" },
  { before: "Short forms used in a text message, as long as the reader will still understand them, are called", after: ".", answer: "abbreviations" },
  { before: "Sending a message at a reasonable and considerate time shows good", after: ".", answer: "timing" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} wants to ask a classmate for homework details but sends the message at 11pm on a school night. What has ${who} overlooked?`,
      correct: "Sending the message at a considerate time",
      wrong: ["Using polite language", "Keeping the message brief", "Signing off with a name"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} sends an SMS to a teacher in ${where} written entirely in slang and short forms the teacher may not understand. What etiquette mistake has ${who} made?`,
      correct: "Using abbreviations the reader may not understand, and too informal a tone for a teacher",
      wrong: ["Keeping the message too short", "Sending the message to the wrong person", "Sending the message too early in the day"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} writes an SMS to a friend in ${where} but sends it without rereading it, and it later turns out to contain a mistake that changes its meaning. What step did ${who} skip?`,
      correct: "Proofreading the message before sending it",
      wrong: ["Choosing an appropriate recipient", "Keeping the message brief", "Being polite in tone"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} wants to share a classmate's phone number with another classmate over SMS. What should ${who} do first?`,
      correct: "Ask the classmate for permission before sharing their number",
      wrong: ["Share the number immediately, since it is only a phone number", "Change the number slightly before sharing it", "Share it only with people already trusted, without asking"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} sends a long, unclear SMS to a friend in ${where} that takes several messages to explain a simple request. What could ${who} have done better?`,
      correct: "Kept the message brief and stated its purpose clearly from the start",
      wrong: ["Sent the message even later than planned", "Used more abbreviations without checking they were clear", "Avoided signing the message"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} sends the same reminder message to a classmate five times within ten minutes because there was no reply yet. What etiquette problem does this show?`,
      correct: "Repeatedly sending the same message is inconsiderate and can pressure the recipient",
      wrong: ["It is always acceptable, since reminders are helpful", "It shows good use of brevity", "It shows good proofreading habits"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} texts a classmate in ${where} in all capital letters after a disagreement. How is this likely to be read by the recipient?`,
      correct: "As shouting or anger, since capital letters are often read that way in digital messages",
      wrong: ["As a normal, calm message", "As a sign of politeness", "As a message that is easier to understand"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} means to send a private message to one friend but accidentally sends it to a whole class group instead. What has gone wrong?`,
      correct: "The message was not sent to the correct recipient",
      wrong: ["The message was too brief", "The message used poor abbreviations", "The message was sent at a poor time"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} receives an SMS clearly asking for urgent help but does not reply for two days. What etiquette issue does this show?`,
      correct: "Ignoring a message that clearly needed a timely reply",
      wrong: ["Replying too quickly without thinking", "Being too polite in the reply", "Sharing the message with too many people"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} texts someone in ${where} who may not have ${who}'s number saved, and does not mention who the message is from. What should ${who} have included?`,
      correct: "A signature or name, so the recipient knows who sent the message",
      wrong: ["A longer message with more details", "A message sent at a different time", "More abbreviations"],
    };
  },
];

export const indigenousHomesSmsWriting: Skill = {
  id: "g7-il-w-indigenous-homes",
  code: "W.1",
  subjectId: "indigenous-language",
  strandId: "g7-il-writing",
  grade: 7,
  title: "Indigenous homes: social writing (SMS)",
  description: "Identify the features of a well-written SMS and apply digital etiquette when composing and sending one.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A good SMS is brief, has a clear purpose, goes to the right recipient, and is checked before sending.";

    if (branch === "match") {
      const chosen = shuffle(rng, SMS_FEATURES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.feature, label: s.feature })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.feature, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.feature] = s.feature;
      return {
        kind: "click-match",
        prompt: "Match each feature of a well-written SMS to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.feature} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, ETIQUETTE_ITEMS).slice(0, 6);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `e${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`e${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each behaviour as good or poor digital etiquette.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the behaviour respects the reader's time, feelings, and privacy.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, SMS_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of learning to write an SMS with good etiquette in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: SMS_STEPS.map((s) => s.id),
        hint: "Start by discussing features, then write, review, discuss etiquette, and finally apply it.",
        explanation: SMS_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
    return {
      kind: "multiple-choice",
      prompt: entry.prompt,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
