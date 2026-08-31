import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";

const VALUE_LABEL: Record<string, string> = {
  patriotism: "Patriotism",
  unity: "National unity",
  devolution: "Sharing and devolution of power",
  "rule-of-law": "Rule of law",
  equity: "Equity",
  dignity: "Human dignity",
  transparency: "Transparency and accountability",
  integrity: "Integrity",
  "non-discrimination": "Non-discrimination and protection of the marginalised",
};

const VALUE_SCENARIOS = [
  { text: "Otieno stands and sings the national anthem with pride during the school parade in Kisumu.", value: "patriotism" },
  { text: "Kerubo defends Kenya's flag from being disrespected during an inter-school competition in Kisii.", value: "patriotism" },
  { text: "Students from different communities at a school in Nakuru work together to clean up their local river.", value: "unity" },
  { text: "Families from different ethnic communities in Eldoret organise a joint harvest festival.", value: "unity" },
  { text: "The Kakamega county government uses devolved funds to build a new health centre in a rural ward.", value: "devolution" },
  { text: "A Bungoma county assembly debates how to share revenue between different sub-counties.", value: "devolution" },
  { text: "Wanjiku reports a matatu driver who was overloading passengers to the traffic police.", value: "rule-of-law" },
  { text: "Mwangi pays the correct fine after being found guilty of a traffic offence in Nyeri.", value: "rule-of-law" },
  { text: "The national government builds more schools in Turkana, a marginalised area, to close the gap with other counties.", value: "equity" },
  { text: "Bursary funds in Garissa are given first to the neediest students rather than shared equally regardless of need.", value: "equity" },
  { text: "Mutua greets an elderly neighbour with respect and helps her carry her shopping in Machakos.", value: "dignity" },
  { text: "A nurse in Kilifi treats every patient with courtesy, regardless of their background.", value: "dignity" },
  { text: "A Kajiado county official publishes a report showing exactly how bursary funds were spent.", value: "transparency" },
  { text: "A Kericho sub-county office displays its budget on a public notice board for residents to see.", value: "transparency" },
  { text: "Chebet returns extra change she was mistakenly given at a shop in Eldoret.", value: "integrity" },
  { text: "A clerk in Meru refuses a bribe offered to speed up processing of an ID card.", value: "integrity" },
  { text: "A school in Garissa admits pupils from different ethnic communities and treats them all equally.", value: "non-discrimination" },
  { text: "A Kisumu employer hires a qualified candidate living with a disability for an office job.", value: "non-discrimination" },
] as const;

const VALUE_EXAMPLES = [
  { value: "patriotism", example: "Standing to attention and singing the national anthem at a public event" },
  { value: "unity", example: "Communities from different regions cooperating on a shared community project" },
  { value: "devolution", example: "A county government using its own budget to build local roads and clinics" },
  { value: "rule-of-law", example: "A citizen following the outcome of a fair court ruling, even when they disagree with it" },
  { value: "equity", example: "Giving extra support to a marginalised area so it can catch up with the rest of the country" },
  { value: "dignity", example: "Treating every person, including the elderly and people with disabilities, with respect" },
  { value: "transparency", example: "A county government publishing how public money was spent" },
  { value: "integrity", example: "A leader declining a bribe and doing their duties honestly" },
  { value: "non-discrimination", example: "Treating people fairly regardless of their ethnic community, gender, or religion" },
] as const;

const WHY_CONSTITUTION_STATEMENTS = [
  "It is the supreme law of the land that guides how the country is governed and protects the rights of citizens",
  "It is a collection of traditional stories passed down within communities",
  "It is a list of public holidays observed only by government employees",
  "It is a manual explaining how to conduct international trade agreements",
] as const;
const WHY_CONSTITUTION_CORRECT = WHY_CONSTITUTION_STATEMENTS[0];

const UPHOLD_WAYS = [
  { before: "One way citizens uphold and protect the Constitution is by casting their", after: "in every general election.", answer: "vote", accepted: ["vote", "votes"] },
  { before: "Citizens uphold the Constitution when they report cases of", after: "to the relevant authorities instead of taking the law into their own hands.", answer: "corruption", accepted: ["corruption"] },
  { before: "Respecting decisions made by the", after: "helps protect the rule of law set out in the Constitution.", answer: "courts", accepted: ["courts", "court"] },
  { before: "Obeying the", after: "of the country, even when no one is watching, is a basic way of upholding the Constitution.", answer: "laws", accepted: ["laws", "law"] },
  { before: "Taking part in public", after: "on new government policies is a way citizens protect the Constitution's value of participation.", answer: "participation", accepted: ["participation", "forums", "debates"] },
  { before: "Paying", after: "honestly and on time supports the government services the Constitution guarantees to citizens.", answer: "taxes", accepted: ["taxes", "tax"] },
  { before: "Reporting human rights", after: "to the Kenya National Commission on Human Rights helps protect the Constitution's Bill of Rights.", answer: "violations", accepted: ["violations", "abuses"] },
  { before: "Attending public", after: "called by the county government is a way citizens uphold the value of public participation.", answer: "forums", accepted: ["forums", "barazas", "meetings"] },
  { before: "Respecting the results of a free and fair", after: ", even when your preferred candidate loses, upholds constitutional democracy.", answer: "election", accepted: ["election", "elections"] },
  { before: "Treating people from every community with equal", after: " helps uphold the Constitution's value of non-discrimination.", answer: "respect", accepted: ["respect", "dignity"] },
] as const;

export const constitutionOfKenya: Skill = {
  id: "g7-ss-pdg-constitution-of-kenya",
  code: "PDG.2",
  subjectId: "social-studies",
  strandId: "g7-ss-pdg",
  grade: 7,
  title: "The Constitution of Kenya",
  description: "The importance of the Constitution of Kenya, ways of upholding and protecting it, and applying its national values in day-to-day life.",
  generate(rng) {
    const branch = randChoice(rng, ["values-classify", "why-constitution-mc", "value-example-match", "uphold-fill"] as const);

    if (branch === "values-classify") {
      const values = shuffle(rng, Object.keys(VALUE_LABEL)).slice(0, 4);
      const chosen = values.map((v) => randChoice(rng, VALUE_SCENARIOS.filter((s) => s.value === v)));
      const buckets = values.map((v) => ({ id: v, label: VALUE_LABEL[v] }));
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.value));
      return {
        kind: "categorize",
        prompt: "Sort each scenario by the national value from the Constitution of Kenya it demonstrates.",
        items,
        buckets,
        correctBucket,
        hint: "Ask what the person in the scenario is showing: honesty, fairness, respect, or something else?",
        explanation: chosen.map((s) => `"${s.text}" — ${VALUE_LABEL[s.value]}.`).join(" "),
      };
    }

    if (branch === "why-constitution-mc") {
      const { choices, correctIndex } = buildChoicesFromStrings(rng, WHY_CONSTITUTION_CORRECT, WHY_CONSTITUTION_STATEMENTS, 3);
      return {
        kind: "multiple-choice",
        prompt: "Why should a country like Kenya have a constitution?",
        choices,
        correctIndex,
        hint: "Think about what a country's most important law is meant to do.",
        explanation: `A constitution matters because ${WHY_CONSTITUTION_CORRECT.toLowerCase()}.`,
      };
    }

    if (branch === "value-example-match") {
      const chosen = shuffle(rng, VALUE_EXAMPLES).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.value, label: VALUE_LABEL[v.value] })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.value, label: v.example })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.value] = v.value;
      return {
        kind: "click-match",
        prompt: "Match each national value in the Constitution of Kenya to a real-life example of it.",
        tokens,
        targets,
        correctMap,
        hint: "Picture what a person actually does when they live out each value.",
        explanation: chosen.map((v) => `${VALUE_LABEL[v.value]}: ${v.example}.`).join(" "),
      };
    }

    // uphold-fill
    const w = randChoice(rng, UPHOLD_WAYS);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence about upholding and protecting the Constitution.",
      before: w.before,
      after: w.after,
      correctAnswer: w.answer,
      acceptedAnswers: [...w.accepted],
      inputMode: "text",
      hint: "This is something every citizen can do to protect Kenya's Constitution and promote social cohesion.",
      explanation: `${w.before} ${w.answer} ${w.after}`,
    };
  },
};
