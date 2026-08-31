import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";

const COLONIAL_POWERS = [
  { power: "Britain", regions: ["Kenya", "Uganda", "Nigeria", "the Gold Coast (present-day Ghana)"] },
  { power: "France", regions: ["Senegal", "Ivory Coast", "Madagascar", "Niger"] },
  { power: "Belgium", regions: ["the Congo (Belgian Congo)", "Rwanda", "Burundi"] },
  { power: "Germany", regions: ["Tanganyika (German East Africa)", "Namibia (German South-West Africa)", "Cameroon"] },
  { power: "Italy", regions: ["Libya", "Italian Somaliland", "Eritrea"] },
  { power: "Portugal", regions: ["Mozambique", "Angola"] },
  { power: "Spain", regions: ["Western Sahara (Spanish Sahara)", "Equatorial Guinea"] },
] as const;

const BERLIN_CONFERENCE_STATEMENTS = [
  "A meeting of European powers held to agree on rules for dividing up Africa among themselves",
  "A meeting of African kings held to agree on how to resist European conquest",
  "A trade agreement between Kenya and Uganda to share railway revenue",
  "A peace treaty signed to end fighting between Britain and France in Egypt",
] as const;
const BERLIN_CONFERENCE_CORRECT = BERLIN_CONFERENCE_STATEMENTS[0];

const FILL_BLANK_FACTS = [
  {
    before: "The Berlin Conference, which set out the rules European powers followed when claiming territory in Africa, was held in the year ",
    after: "-1885.",
    answer: "1884",
  },
  {
    before: "The Battle of Adwa, where Ethiopian forces defeated an invading Italian army and preserved Ethiopian independence, was fought in ",
    after: ".",
    answer: "1896",
  },
  {
    before: "The two African countries that were never fully colonized during the Scramble for Africa were Ethiopia and ",
    after: ".",
    answer: "Liberia",
  },
  {
    before: "The period during which European powers competed to seize and divide up African territory is commonly called the Scramble for ",
    after: ".",
    answer: "Africa",
  },
  {
    before: "The rapid-firing weapon that gave European armies a major military advantage during the conquest of Africa was the ",
    after: " gun.",
    answer: "Maxim",
  },
  {
    before: "The Nandi community's prolonged armed resistance against British colonial rule in East Africa lasted for over a ",
    after: " before being suppressed.",
    answer: "decade",
  },
  {
    before: "European powers justified colonial expansion partly by claiming to bring civilisation, Christianity, and ",
    after: " to Africa — three ideas often summarised as the '3 Cs'.",
    answer: "commerce",
  },
  {
    before: "The document that came out of the 1884-1885 Berlin Conference set out the rule that a European power had to show 'effective ",
    after: "' of a territory to claim it.",
    answer: "occupation",
  },
] as const;

const SCRAMBLE_STATEMENTS = [
  { text: "European powers divided Africa among themselves without consulting African communities.", trueOfScramble: true },
  { text: "The Berlin Conference set out rules for how European powers could claim African territory.", trueOfScramble: true },
  { text: "European armies used superior weapons, such as the Maxim gun, to conquer African communities.", trueOfScramble: true },
  { text: "Communities such as the Nandi and the Hehe resisted colonial conquest by force of arms.", trueOfScramble: true },
  { text: "Missionaries and colonial administrators often worked together to extend European influence.", trueOfScramble: true },
  { text: "African leaders were invited to the Berlin Conference to represent their communities.", trueOfScramble: false },
  { text: "Ethiopia was successfully colonized by Italy after the Battle of Adwa in 1896.", trueOfScramble: false },
  { text: "The Berlin Conference of 1884-1885 was held in Addis Ababa.", trueOfScramble: false },
  { text: "Every African community immediately accepted European rule without any resistance.", trueOfScramble: false },
  { text: "The Scramble for Africa took place after most African countries had already gained independence.", trueOfScramble: false },
] as const;

export const politicalDevelopmentAfrica: Skill = {
  id: "g7-ss-pdg-political-development-africa",
  code: "PDG.1",
  subjectId: "social-studies",
  strandId: "g7-ss-pdg",
  grade: 7,
  title: "Political development in Africa",
  description: "The Scramble for and Partition of Africa, the Berlin Conference of 1884-1885, and the political organisation of African communities up to 1900.",
  generate(rng) {
    const branch = randChoice(rng, ["power-region-match", "berlin-conference-mc", "scramble-classify", "berlin-year-fill"] as const);

    if (branch === "power-region-match") {
      const chosenPowers = shuffle(rng, COLONIAL_POWERS).slice(0, 5);
      const pairs = chosenPowers.map((p) => ({ power: p.power, region: randChoice(rng, p.regions) }));
      const tokens = shuffle(rng, pairs.map((p) => ({ id: p.power, label: p.power })));
      const targets = shuffle(rng, pairs.map((p) => ({ id: p.power, label: p.region })));
      const correctMap: Record<string, string> = {};
      for (const p of pairs) correctMap[p.power] = p.power;
      return {
        kind: "click-match",
        prompt: "Match each European power to a region or country it colonized during the Scramble for and Partition of Africa.",
        tokens,
        targets,
        correctMap,
        hint: "Think about which European country ruled Kenya, and which ruled the Congo.",
        explanation: pairs.map((p) => `${p.power} colonized ${p.region}.`).join(" "),
      };
    }

    if (branch === "berlin-conference-mc") {
      const { choices, correctIndex } = buildChoicesFromStrings(rng, BERLIN_CONFERENCE_CORRECT, BERLIN_CONFERENCE_STATEMENTS, 3);
      return {
        kind: "multiple-choice",
        prompt: "What was the Berlin Conference of 1884-1885?",
        choices,
        correctIndex,
        hint: "African communities were not represented at this meeting.",
        explanation: `The Berlin Conference of 1884-1885 was ${BERLIN_CONFERENCE_CORRECT.toLowerCase()}. No African community sent a representative to the meeting.`,
      };
    }

    if (branch === "scramble-classify") {
      const trueOnes = shuffle(rng, SCRAMBLE_STATEMENTS.filter((s) => s.trueOfScramble)).slice(0, 3);
      const falseOnes = shuffle(rng, SCRAMBLE_STATEMENTS.filter((s) => !s.trueOfScramble)).slice(0, 3);
      const chosen = shuffle(rng, [...trueOnes, ...falseOnes]);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.trueOfScramble ? "true" : "false"));
      return {
        kind: "categorize",
        prompt: "Sort each statement into whether it is true or not true of the Scramble for and Partition of Africa.",
        items,
        buckets: [
          { id: "true", label: "True of the Scramble for Africa" },
          { id: "false", label: "Not true of the Scramble for Africa" },
        ],
        correctBucket,
        hint: "Remember: African communities did not take part in the Berlin Conference, and some communities resisted colonial rule.",
        explanation: chosen.map((s) => `"${s.text}" is ${s.trueOfScramble ? "true" : "not true"}.`).join(" "),
      };
    }

    // berlin-year-fill
    const f = randChoice(rng, FILL_BLANK_FACTS);
    return {
      kind: "fill-blank",
      prompt: "Complete the fact about the partition of Africa.",
      before: f.before,
      after: f.after,
      correctAnswer: f.answer,
      acceptedAnswers: [f.answer, f.answer.toLowerCase()],
      inputMode: "text",
      hint: "Think about what you know of the Scramble for and Partition of Africa.",
      explanation: `${f.before}${f.answer}${f.after}`,
    };
  },
};
