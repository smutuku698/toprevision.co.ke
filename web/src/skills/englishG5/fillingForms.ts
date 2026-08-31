import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, place, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 1.0 Child Rights and Responsibilities, sub-strand 1.4 Functional Writing:
// Filling Forms. See curriculum-reference/grade-5/english.json.

type Section = "personal" | "school" | "guardian" | "other";
const SECTION_LABEL: Record<Section, string> = {
  personal: "Personal information",
  school: "School information",
  guardian: "Parent / guardian details",
  other: "Other details (religion, county, sport, hobby)",
};

const FIELDS: { label: string; section: Section; example: () => string; wrongKinds: string[] }[] = [
  { label: "Full name", section: "personal", example: () => `${name(() => 0.3)} ${name(() => 0.7)}`, wrongKinds: ["Grade 5", "0722 000 111", "Football"] },
  { label: "Date of birth", section: "personal", example: () => "14 March 2015", wrongKinds: ["Wanjiru Kamau", "Kisumu Primary", "Christian"] },
  { label: "Age", section: "personal", example: () => "10 years", wrongKinds: ["14 March 2015", "Grade 5", "Nakuru"] },
  { label: "Gender", section: "personal", example: () => "Female", wrongKinds: ["10 years", "Kenyan", "Swimming"] },
  { label: "Nationality", section: "personal", example: () => "Kenyan", wrongKinds: ["Female", "Grade 5", "0733 456 789"] },
  { label: "Admission number", section: "school", example: () => "5127", wrongKinds: ["10 years", "Kenyan", "Reading"] },
  { label: "Grade / Class", section: "school", example: () => "Grade 5", wrongKinds: ["5127", "Kenyan", "14 March 2015"] },
  { label: "Name of school", section: "school", example: () => `${place(() => 0.5)} Primary School`, wrongKinds: ["Grade 5", "Female", "Athletics"] },
  { label: "Parent / guardian name", section: "guardian", example: () => `${name(() => 0.2)} ${name(() => 0.9)}`, wrongKinds: ["Grade 5", "10 years", "Chess"] },
  { label: "Parent's phone number", section: "guardian", example: () => "0722 345 678", wrongKinds: ["Kenyan", "Grade 5", "14 March 2015"] },
  { label: "Parent's occupation", section: "guardian", example: () => "Teacher", wrongKinds: ["0722 345 678", "Grade 5", "Kenyan"] },
  { label: "County / sub-county", section: "other", example: () => place(() => 0.4), wrongKinds: ["Grade 5", "10 years", "Female"] },
  { label: "Religion", section: "other", example: () => "Muslim", wrongKinds: ["Grade 5", "Kenyan", "0722 345 678"] },
  { label: "Favourite sport", section: "other", example: () => "Volleyball", wrongKinds: ["10 years", "Kisumu", "Kenyan"] },
  { label: "Hobby", section: "other", example: () => "Drawing", wrongKinds: ["Grade 5", "Female", "14 March 2015"] },
];

const RULES: { rule: string; scenario: string }[] = [
  { rule: "Write in BLOCK (capital) letters where the form asks for them", scenario: "wrote his name in small joined-up writing where the form said 'IN BLOCK LETTERS'" },
  { rule: "Put a tick in the correct box, not a word", scenario: "wrote the word 'yes' across a row of tick boxes" },
  { rule: "Write 'N/A' when a field does not apply to you — never leave it blank", scenario: "left the 'Middle name' line completely empty" },
  { rule: "Keep your writing inside the box or on the line", scenario: "let her long address spill over into the next field" },
  { rule: "Use the date format the form shows (day / month / year)", scenario: "wrote the date as just '14' with no month or year" },
  { rule: "Check every field is filled before you hand the form in", scenario: "forgot to fill in the 'County' field before submitting" },
];

export const fillingForms: Skill = {
  id: "g5-eng-writing-filling-forms",
  code: "W.1",
  subjectId: "english",
  strandId: "g5-eng-writing",
  grade: 5,
  title: "Filling Forms",
  description: "Record the right information in each field of a form (personal, school, guardian and other details) and follow the rules for filling forms neatly and correctly.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-field", "fill-section", "sort-section", "match", "order-steps", "reason-rule"] as const);

    if (branch === "mc-field") {
      const f = randChoice(rng, FIELDS);
      const { choices, correctIndex } = mcFromCluster(rng, f.example(), f.wrongKinds, 3);
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the entry that belongs in this field")}\nField: "${f.label}"`,
        choices,
        correctIndex,
        layout: "list",
        hint: `Ask: what does "${f.label}" ask for?`,
        explanation: `"${choices[correctIndex]}" fits the field "${f.label}". The wrong choices belong in other fields.`,
      };
    }

    if (branch === "fill-section") {
      const f = randChoice(rng, FIELDS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, `the section this field belongs in — write "personal", "school", "guardian" or "other"`),
        before: `The field "${f.label}" goes in the `,
        after: " section.",
        correctAnswer: f.section,
        acceptedAnswers: [f.section, SECTION_LABEL[f.section].toLowerCase()],
        inputMode: "text",
        hint: "Personal = about you. School = about your class/admission. Guardian = about your parent. Other = religion, county, sport, hobby.",
        explanation: `"${f.label}" belongs in the "${SECTION_LABEL[f.section]}" section.`,
      };
    }

    if (branch === "sort-section") {
      const pool = shuffle(rng, FIELDS).slice(0, 8);
      const items = pool.map((f, i) => ({ id: `f${i}`, label: f.label }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`f${i}`] = f.section));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which section of a form each field belongs to"),
        items,
        buckets: [
          { id: "personal", label: "Personal information" },
          { id: "school", label: "School information" },
          { id: "guardian", label: "Parent / guardian details" },
          { id: "other", label: "Other (religion, county, sport, hobby)" },
        ],
        correctBucket,
        hint: "Group fields by who or what they describe.",
        explanation: "Personal: name, DOB, age, gender, nationality. School: admission number, grade, school name. Guardian: parent name, phone, occupation. Other: county, religion, favourite sport, hobby.",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, FIELDS).slice(0, 5);
      const tokens = shuffle(rng, pool.map((f, i) => ({ id: `p${i}`, label: f.label })));
      const targets = shuffle(rng, pool.map((f, i) => ({ id: `p${i}`, label: f.example() })));
      const correctMap: Record<string, string> = {};
      pool.forEach((_f, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "form field to a correct example entry"),
        tokens,
        targets,
        correctMap,
        hint: "Read each field label and picture what a real answer would look like.",
        explanation: pool.map((f) => `${f.label}: e.g. ${f.example()}`).join("  "),
      };
    }

    if (branch === "order-steps") {
      const steps = [
        { id: "read", label: "Read the whole form first" },
        { id: "gather", label: "Gather the information you need (birth certificate, admission number)" },
        { id: "fill", label: "Fill each field in the correct format (BLOCK letters, ticks, dates)" },
        { id: "check", label: "Check that no field is left blank; write N/A where a field does not apply" },
        { id: "sign", label: "Sign and date the form" },
      ];
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the steps for filling a form correctly"),
        instruction: "Click the steps in the correct order.",
        items: shuffle(rng, steps),
        correctOrder: ["read", "gather", "fill", "check", "sign"],
        hint: "Read before you write; check before you sign.",
        explanation: "Read the form → gather the details → fill each field correctly → check nothing is blank → sign and date.",
      };
    }

    // reason — Evaluate: a pupil made a form-filling mistake. Which rule fixes it?
    const r = randChoice(rng, RULES);
    const wrong = shuffle(rng, RULES.filter((x) => x.rule !== r.rule)).slice(0, 3).map((x) => x.rule);
    const { choices, correctIndex } = mcFromCluster(rng, r.rule, wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, `${name(rng)} ${r.scenario}.`, "Which form-filling rule should they follow?"),
      choices,
      correctIndex,
      layout: "list",
      hint: "Match the mistake to the rule that would have prevented it.",
      explanation: `The rule is: ${r.rule}.`,
    };
  },
};
