import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES, KENYAN_PLACES } from "./writingSharedA";

// Source: curriculum-reference/grade-6/english.json, Writing strand, sub-strand "1.4.1 Guided
// Writing — Fill in Forms (Child Labour)". learningExperiences: "Discuss different types of
// forms filled before; search for and download sample forms from the internet; fill
// basic/personal/'why' details on a form; design a form with basic/personal/why details in
// small groups." The three field categories (basic / personal / "why") come verbatim from that
// text and are used as the fixed categorize/click-match buckets below.

type Category = "basic" | "personal" | "why";

const CATEGORY_LABEL: Record<Category, string> = {
  basic: "Basic details",
  personal: "Personal details",
  why: "'Why' details",
};

const FIELDS: { field: string; category: Category }[] = [
  // Basic details (12)
  { field: "Full name", category: "basic" },
  { field: "First name", category: "basic" },
  { field: "Surname", category: "basic" },
  { field: "Age", category: "basic" },
  { field: "Date of birth", category: "basic" },
  { field: "Gender", category: "basic" },
  { field: "Class or grade", category: "basic" },
  { field: "Nationality", category: "basic" },
  { field: "Religion", category: "basic" },
  { field: "Admission number", category: "basic" },
  { field: "Birth certificate number", category: "basic" },
  { field: "School name", category: "basic" },
  // Personal details (12)
  { field: "Home address", category: "personal" },
  { field: "Postal address (P.O. Box)", category: "personal" },
  { field: "County of residence", category: "personal" },
  { field: "Sub-county", category: "personal" },
  { field: "Telephone or mobile number", category: "personal" },
  { field: "Email address", category: "personal" },
  { field: "Parent's or guardian's name", category: "personal" },
  { field: "Parent's or guardian's occupation", category: "personal" },
  { field: "Parent's or guardian's phone number", category: "personal" },
  { field: "Next of kin", category: "personal" },
  { field: "Emergency contact number", category: "personal" },
  { field: "Nearest landmark", category: "personal" },
  // "Why" details — reason/purpose (12)
  { field: "Reason for the application", category: "why" },
  { field: "Purpose of the visit", category: "why" },
  { field: "Reason for the absence", category: "why" },
  { field: "Reason for requesting leave", category: "why" },
  { field: "Medical condition to note", category: "why" },
  { field: "Reason for joining the club", category: "why" },
  { field: "Reason for the school trip", category: "why" },
  { field: "Reason for the request or loan", category: "why" },
  { field: "Special needs to note", category: "why" },
  { field: "Reason for the late arrival", category: "why" },
  { field: "Reason for the transfer", category: "why" },
  { field: "Reason for the declaration (why signing confirms the details are true)", category: "why" },
];

const CORRECT_FILL_EXAMPLES: { field: string; context: string; correct: string; wrongs: string[] }[] = [
  {
    field: "Date of birth", context: "School Admission Form", correct: "14/03/2014",
    wrongs: ["Class 5", "fourteen years old", "March"],
  },
  {
    field: "Full name", context: "Library Membership Form", correct: "Wanjiru Achieng Kamau",
    wrongs: ["Wanja", "W.A.K.", "Girl"],
  },
  {
    field: "Telephone number", context: "School Trip Permission Form", correct: "0712 345 678",
    wrongs: ["Call my mum", "Yes", "0712"],
  },
  {
    field: "Age", context: "Sports Day Registration Form", correct: "12",
    wrongs: ["Standard 6", "Young", "Born in 2013"],
  },
  {
    field: "Parent's signature", context: "School Admission Form", correct: "(the parent's own handwritten signature)",
    wrongs: ["Signed by a friend of the family", "Left blank", "Typed name only, no signature"],
  },
  {
    field: "Email address", context: "Talent Show Registration Form", correct: "wanjiru.kamau@gmail.com",
    wrongs: ["wanjirukamau", "My email", "0723456789"],
  },
  {
    field: "Home address", context: "New Pupil Registration Form", correct: "P.O. Box 214, Kericho",
    wrongs: ["Near the big mango tree", "Kenya", "I live with my aunt"],
  },
  {
    field: "Reason for joining the club", context: "Football Club Registration Form",
    correct: "I want to improve my football skills and play in the school team.",
    wrongs: ["My friend is joining too", "Nothing", "Because"],
  },
  {
    field: "Parent's occupation", context: "School Admission Form", correct: "Farmer",
    wrongs: ["Nairobi", "0712345678", "Very busy"],
  },
  {
    field: "Next of kin", context: "Class Health/Medical Form", correct: "Aunt Naliaka, 0798765432",
    wrongs: ["Myself", "Not sure", "My best friend at school"],
  },
  {
    field: "Purpose of visit", context: "Visitor's Form", correct: "To deliver school fees for my daughter.",
    wrongs: ["Just passing by", "I don't know", "See you later"],
  },
  {
    field: "Reason for absence", context: "Class attendance form",
    correct: "I was unwell with a fever and stayed home to rest.",
    wrongs: ["I felt like resting", "None", "Football match"],
  },
];

const FIELD_CLUES: { clue: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { clue: "On a school admission form, the field that records how old a pupil is asks for the pupil's", correctAnswer: "age" },
  { clue: "On a school admission form, the field that records where a pupil lives asks for the pupil's", correctAnswer: "address", acceptedAnswers: ["home address"] },
  { clue: "The field a parent fills so the school can reach them quickly asks for their", correctAnswer: "phone", acceptedAnswers: ["telephone", "mobile", "contact"] },
  { clue: "The field that tells the school which class or grade a pupil is in asks for the pupil's", correctAnswer: "class", acceptedAnswers: ["grade"] },
  { clue: "The field that explains why someone wants to join a club asks for their", correctAnswer: "reason", acceptedAnswers: ["reason for joining"] },
  { clue: "The field that records a pupil's exact day, month and year of birth asks for their", correctAnswer: "date of birth", acceptedAnswers: ["birth date", "dob"] },
  { clue: "The field that names a trusted relative to contact in an emergency asks for the", correctAnswer: "next of kin" },
  { clue: "The field where the form-filler confirms the information is true and signs their name is the", correctAnswer: "signature" },
  { clue: "The field that records a parent's job asks for their", correctAnswer: "occupation", acceptedAnswers: ["job"] },
  { clue: "The field that records which county a family lives in asks for the county of", correctAnswer: "residence" },
  { clue: "The field explaining what a visitor has come to do at school asks for the", correctAnswer: "purpose", acceptedAnswers: ["reason", "purpose of visit"] },
  { clue: "The field recording a health condition the school should know about asks for a", correctAnswer: "medical condition", acceptedAnswers: ["medical"] },
];

// Apply/Evaluate-tier: judging the real-world consequence of an inaccurately filled form.
// Core competency implied by "Advocate the importance of filling forms correctly" is Critical
// thinking and problem solving, so this branch is required, not optional flavour.
const WHY_ACCURATE: {
  build: (name: string) => string;
  correct: string;
  wrongs: string[];
}[] = [
  {
    build: (n) => `${n} wrote an old phone number on the emergency contact field of the class medical form. What is the most likely problem?`,
    correct: "The school may not be able to reach the family quickly in an emergency.",
    wrongs: ["It makes the form look tidier.", "The school will assume there are two contacts.", "It has no real effect since the form is just filed away."],
  },
  {
    build: (n) => `${n} filled 'personal reasons' instead of a real reason on the 'reason for absence' field. Why is this a problem?`,
    correct: "The school cannot tell whether the absence was for a genuine, excusable reason.",
    wrongs: ["Vague answers show respect for privacy, so they are always the best choice.", "It makes the register easier to read.", "The teacher will mark the pupil present anyway."],
  },
  {
    build: (n) => `On the class health form, ${n} left the 'medical condition' field blank despite having a serious allergy. What could go wrong?`,
    correct: "Teachers may not know how to help quickly if the allergy is triggered.",
    wrongs: ["The form will simply be shorter.", "It shows the pupil is brave and independent.", "The school assumes no news is good news, so nothing serious changes."],
  },
  {
    build: (n) => `${n} entered the wrong date of birth on the school admission form. What is the most likely problem?`,
    correct: "The pupil could be placed in the wrong class or age group, or official documents may not match.",
    wrongs: ["It only affects how neat the form looks.", "The school will correct it automatically without asking anyone.", "Dates of birth are not actually checked on admission forms."],
  },
  {
    build: (n) => `${n} used a nickname instead of a full legal name on the library membership form. What is the most likely problem?`,
    correct: "The membership card may not match the pupil's official school records.",
    wrongs: ["Nicknames are always accepted on official records.", "It makes the librarian's job easier.", "It has no effect since the library does not check names."],
  },
  {
    build: (n) => `On the football club registration form, ${n} wrote just 'Because' for the reason for joining. Why is this a problem?`,
    correct: "The coach cannot judge whether the pupil is genuinely interested or place them in the right group.",
    wrongs: ["Short answers are always preferred on forms.", "It saves paper and ink.", "The coach will guess the real reason anyway."],
  },
  {
    build: (n) => `${n} accidentally wrote a phone number in the 'parent's occupation' field. What is the most likely problem?`,
    correct: "The form no longer gives the school accurate information about the family's occupation.",
    wrongs: ["It doesn't matter which field information goes into, as long as it's somewhere on the form.", "The school will move the number to the correct field automatically.", "Occupation fields are rarely read by the school anyway."],
  },
  {
    build: (n) => `${n} wrote the home address on a form as simply 'near the shops'. What is the most likely problem?`,
    correct: "Anyone sent to find the pupil's home may not be able to locate it from that description.",
    wrongs: ["Vague addresses are actually safer for privacy.", "The postman always finds the right house eventually.", "Addresses on forms are only there for decoration."],
  },
  {
    build: (n) => `${n} left the signature section unsigned on a school trip permission form. What is the most likely result?`,
    correct: "The school cannot confirm the parent or guardian actually gave permission, so the pupil may not be allowed to go.",
    wrongs: ["An unsigned form is still valid as long as the rest is filled in.", "A teacher can sign on behalf of the parent instead.", "Signatures are only a formality on permission forms."],
  },
  {
    build: (n) => `On a visitor's form, ${n}'s uncle wrote 'just passing by' for the purpose of visit, even though he had real business at the office. Why is this a problem?`,
    correct: "The school cannot properly record or verify why the visitor is on the compound, which is a safety concern.",
    wrongs: ["Vague answers keep visits quick and simple.", "The security guard will guess the real reason anyway.", "Purpose of visit fields are just a formality with no real use."],
  },
];

const FORM_SECTIONS: { id: string; label: string; description: string }[] = [
  { id: "title", label: "Form title / heading", description: "States the name and purpose of the form, e.g. 'School Admission Form'" },
  { id: "basic", label: "Basic details", description: "Name, age, date of birth, class, and other core identifying details" },
  { id: "personal", label: "Personal details", description: "Address, contact numbers, and family or guardian details" },
  { id: "why", label: "'Why' details", description: "The reason or purpose for filling in the form" },
  { id: "signature", label: "Signature and date", description: "Confirms the given information is true, signed and dated" },
];

export const fillingForms: Skill = {
  id: "g6-eng-writing-filling-forms",
  code: "W.1",
  subjectId: "english",
  strandId: "g6-eng-writing",
  grade: 6,
  title: "Filling in Forms",
  description: "Identify what belongs in basic, personal, and 'why' fields on a form, spot correctly versus incorrectly filled fields, and judge why accurate form-filling matters.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["mc-category", "click-match", "categorize", "mc-correct-fill", "mc-why-accurate", "fill-blank", "order"] as const
    );
    const hint = "Forms usually ask for basic details (who you are), personal details (address and contacts), and 'why' details (the reason for the form) — every field should be filled accurately.";

    if (branch === "mc-category") {
      const entry = randChoice(rng, FIELDS);
      const choices = shuffle(rng, ["basic", "personal", "why"] as Category[]).map((c) => CATEGORY_LABEL[c]);
      return {
        kind: "multiple-choice",
        prompt: `On a form, which category does the field "${entry.field}" belong to?`,
        choices,
        correctIndex: choices.indexOf(CATEGORY_LABEL[entry.category]),
        layout: "row",
        hint,
        explanation: `"${entry.field}" is a ${CATEGORY_LABEL[entry.category].toLowerCase()} field.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, FIELDS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.field, label: f.field })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.field, label: CATEGORY_LABEL[f.category] })));
      const correctMap: Record<string, string> = {};
      for (const f of chosen) correctMap[f.field] = f.field;
      return {
        kind: "click-match",
        prompt: "Match each form field to the category it belongs to.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((f) => `"${f.field}" is a ${CATEGORY_LABEL[f.category].toLowerCase()} field.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const basic = shuffle(rng, FIELDS.filter((f) => f.category === "basic")).slice(0, 2);
      const personal = shuffle(rng, FIELDS.filter((f) => f.category === "personal")).slice(0, 2);
      const why = shuffle(rng, FIELDS.filter((f) => f.category === "why")).slice(0, 2);
      const chosen = shuffle(rng, [...basic, ...personal, ...why]);
      const items = chosen.map((f, i) => ({ id: `f${i}`, label: f.field }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f, i) => (correctBucket[`f${i}`] = f.category));
      return {
        kind: "categorize",
        prompt: "Sort each form field into Basic details, Personal details, or 'Why' details.",
        items,
        buckets: (["basic", "personal", "why"] as Category[]).map((c) => ({ id: c, label: CATEGORY_LABEL[c] })),
        correctBucket,
        hint,
        explanation: chosen.map((f) => `"${f.field}" — ${CATEGORY_LABEL[f.category].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "mc-correct-fill") {
      const entry = randChoice(rng, CORRECT_FILL_EXAMPLES);
      const choices = shuffle(rng, [entry.correct, ...entry.wrongs]);
      return {
        kind: "multiple-choice",
        prompt: `On a ${entry.context}, which entry correctly fills in the "${entry.field}" field?`,
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "The correct entry gives specific, real information in the exact format the field is asking for — not a vague, irrelevant, or wrong-field answer.",
        explanation: `The correct entry is "${entry.correct}" — it gives specific, accurate information in the format the "${entry.field}" field expects. The other options are either vague, irrelevant, or belong to a different field.`,
      };
    }

    if (branch === "mc-why-accurate") {
      const entry = randChoice(rng, WHY_ACCURATE);
      const name = randChoice(rng, KENYAN_NAMES);
      const choices = shuffle(rng, [entry.correct, ...entry.wrongs]);
      return {
        kind: "multiple-choice",
        prompt: entry.build(name),
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what actually happens later if the information on the form is wrong, vague, or missing — not just how the form looks.",
        explanation: `${entry.correct} Filling forms accurately matters because the information is actually used later, not just filed away.`,
      };
    }

    if (branch === "order") {
      return {
        kind: "ordering",
        prompt: "Arrange the sections of a form in the order they typically appear, from top to bottom.",
        instruction: "Click the sections in order.",
        items: shuffle(rng, FORM_SECTIONS.map((s) => ({ id: s.id, label: s.label }))),
        correctOrder: FORM_SECTIONS.map((s) => s.id),
        hint: "A form usually states its purpose first, then asks for basic details, then personal details, then the reason ('why') it is being filled, and ends with a signature.",
        explanation: FORM_SECTIONS.map((s) => `${s.label} — ${s.description}.`).join(" "),
      };
    }

    const entry = randChoice(rng, FIELD_CLUES);
    const place = randChoice(rng, KENYAN_PLACES);
    return {
      kind: "fill-blank",
      prompt: `Fill in the missing word to complete this sentence about forms (e.g. as used by a school in ${place}).`,
      before: entry.clue,
      after: ".",
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint,
      explanation: `The complete sentence reads: "${entry.clue} ${entry.correctAnswer}."`,
    };
  },
};
