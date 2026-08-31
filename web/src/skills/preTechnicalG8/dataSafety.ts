import { randChoice, randInt, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const THREATS = [
  { id: "virus", label: "Computer virus", definition: "A malicious program that copies itself and spreads between devices, often corrupting or deleting data" },
  { id: "unauthorised", label: "Unauthorised access", definition: "Someone who is not permitted viewing, changing, or stealing data on a device" },
  { id: "phishing", label: "Phishing", definition: "A trick, often by fake email or message, that gets a user to reveal passwords or personal information" },
  { id: "hardware-loss", label: "Loss or theft of the device", definition: "Losing a laptop or phone means anyone who finds it may access the data stored on it" },
] as const;

const PROTECTION_METHODS = [
  { id: "password", label: "Strong passwords", definition: "A password that is long, hard to guess, and not reused across accounts" },
  { id: "antivirus", label: "Antivirus scanning", definition: "Software that detects and removes malicious programs before they damage data" },
  { id: "backup", label: "Backing up data", definition: "Keeping a separate copy of data so it can be recovered if the original is lost or damaged" },
  { id: "updates", label: "Regular software updates", definition: "Installing the latest updates to fix security weaknesses that attackers could exploit" },
] as const;

const PRACTICE_ITEMS = [
  { text: "Using the same simple password like '12345' for every account", bucket: "risky" },
  { text: "Clicking a link in an unexpected email asking you to 'confirm' your bank details", bucket: "risky" },
  { text: "Leaving a laptop unlocked and unattended in a public place", bucket: "risky" },
  { text: "Sharing your device password with a stranger who asks to 'borrow' it", bucket: "risky" },
  { text: "Running a full antivirus scan regularly and keeping it updated", bucket: "safe" },
  { text: "Backing up important files to a separate drive or cloud storage", bucket: "safe" },
  { text: "Locking a device with a passcode or fingerprint when stepping away", bucket: "safe" },
  { text: "Installing the latest security updates as soon as they are available", bucket: "safe" },
] as const;

const BUCKET_LABEL: Record<string, string> = { risky: "Puts data at risk", safe: "Helps keep data safe" };

const SCENARIOS = [
  { text: "You receive an email from an unknown sender urging you to click a link and enter your password immediately", action: "Do not click the link — verify the sender through another channel and delete or report suspicious emails" },
  { text: "Your computer has started running slowly and showing unexpected pop-up messages", action: "Run a full antivirus scan to check for and remove any malicious programs" },
  { text: "You are about to leave your device in a shared office space", action: "Lock the device with a password or passcode so no one else can access it while you are away" },
  { text: "You just finished an important school project on your laptop", action: "Save a backup copy of the file to a separate drive or cloud storage in case the laptop is lost or damaged" },
] as const;

const SETUP_STEPS = [
  { id: "choose", label: "Choose a long password that mixes letters, numbers, and symbols" },
  { id: "unique", label: "Make sure it is not reused from any other account" },
  { id: "store", label: "Store or remember it securely, without writing it somewhere others can see" },
  { id: "change", label: "Change it immediately if you suspect it may have been seen by someone else" },
];

export const dataSafety: Skill = {
  id: "g8-pt-f-data-safety",
  code: "F.2",
  subjectId: "pre-technical",
  strandId: "g8-pt-foundations",
  grade: 8,
  title: "Data Safety",
  description: "The importance of data in an electronic device, threats to that data, and ways of protecting and securing it.",
  generate(rng) {
    const branch = randChoice(rng, ["threat-match", "protection-match", "practice-sort", "scenario", "password-order"] as const);

    if (branch === "threat-match") {
      const tokens = shuffle(rng, THREATS.map((t) => ({ id: t.id, label: t.label })));
      const targets = shuffle(rng, THREATS.map((t) => ({ id: t.id, label: t.definition })));
      const correctMap: Record<string, string> = {};
      for (const t of THREATS) correctMap[t.id] = t.id;
      return {
        kind: "click-match",
        prompt: "Match each threat to data in an electronic device to what it actually is.",
        tokens,
        targets,
        correctMap,
        hint: "Some threats are programs, some are people, and some are simply losing the device itself.",
        explanation: THREATS.map((t) => `${t.label}: ${t.definition}.`).join(" "),
      };
    }

    if (branch === "protection-match") {
      const method = randChoice(rng, PROTECTION_METHODS);
      const others = PROTECTION_METHODS.filter((m) => m.id !== method.id).map((m) => m.label);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, method.label, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `Which way of protecting data is described as: "${method.definition}"?`,
        choices,
        correctIndex,
        hint: "Match the description to the method's specific purpose.",
        explanation: `${method.label}: ${method.definition}.`,
      };
    }

    if (branch === "practice-sort") {
      const chosen = shuffle(rng, PRACTICE_ITEMS).slice(0, randInt(rng, 5, 7));
      const buckets = Array.from(new Set(chosen.map((c) => c.bucket))).map((b) => ({ id: b, label: BUCKET_LABEL[b] }));
      const items = chosen.map((c, i) => ({ id: `p${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`p${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each everyday practice into whether it puts data at risk, or helps keep it safe.",
        items,
        buckets,
        correctBucket,
        hint: "Safe practices control who can access a device and its data; risky practices open the door to attackers or accidental loss.",
        explanation: chosen.map((c) => `"${c.text}" — ${BUCKET_LABEL[c.bucket].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scenario") {
      const s = randChoice(rng, SCENARIOS);
      const others = SCENARIOS.filter((x) => x.action !== s.action).map((x) => x.action);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, s.action, others, 3);
      return {
        kind: "multiple-choice",
        prompt: `${s.text}. What is the best way to protect the data in this situation?`,
        choices,
        correctIndex,
        hint: "Think about which specific data-safety practice directly addresses this situation.",
        explanation: s.action,
      };
    }

    // password-order
    const items = shuffle(rng, SETUP_STEPS);
    return {
      kind: "ordering",
      prompt: "Arrange the steps for setting up and maintaining a secure password.",
      instruction: "Click them in order.",
      items,
      correctOrder: SETUP_STEPS.map((s) => s.id),
      hint: "First choose it carefully, then make sure it's unique, keep it secure, and change it if it's ever exposed.",
      explanation: SETUP_STEPS.map((s) => s.label).join(" → "),
    };
  },
};
