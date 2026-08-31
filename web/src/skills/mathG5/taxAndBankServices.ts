import { randChoice, shuffle } from "@/lib/rng";
import { buildChoicesFromStrings, composePrompt } from "./mathUtils";
import { BANK_SERVICE_FACTS } from "./measurementContexts";
import type { Skill } from "@/lib/types";

const TAX_IMPORTANCE_FACTS = [
  { point: "Building and maintaining roads", detail: "so people and goods can travel safely between places" },
  { point: "Paying teachers and running public schools", detail: "so children across the country can access education" },
  { point: "Running public hospitals and clinics", detail: "so people can access healthcare" },
  { point: "Paying salaries of public workers", detail: "such as police officers, who keep communities safe" },
  { point: "Providing clean water and electricity infrastructure", detail: "so households and businesses can access basic services" },
  { point: "Funding disaster relief", detail: "so the government can help communities after floods, drought or other emergencies" },
  { point: "Supporting county and national government services", detail: "so public offices can operate for everyone's benefit" },
  { point: "Building public markets and bus stages", detail: "so traders and travellers have safe places to do business" },
] as const;

export const taxAndBankServices: Skill = {
  id: "g5-math-m-tax-bank-services",
  code: "M.12",
  subjectId: "math",
  strandId: "g5-math-measurement",
  grade: 5,
  title: "Tax and bank services",
  description: "Explain what tax is and why it matters to the government, and identify services provided by banks.",
  generate(rng) {
    const branch = randChoice(rng, ["what-is-tax-mc", "why-tax-mc", "bank-service-match", "bank-service-mc", "bank-service-categorize", "term-fill-blank"] as const);

    if (branch === "what-is-tax-mc") {
      const correct = "Money that people and businesses pay to the government, used to fund public services";
      const wrong = [
        "Money a bank pays to a customer for keeping savings in an account",
        "A fee a shop charges customers for buying too little",
        "Money the government gives directly to every household each month",
      ];
      const { choices, correctIndex } = buildChoicesFromStrings(rng, correct, wrong, 3);
      const prompts = [
        "What is tax?",
        "Which statement best describes what tax is?",
        "Tax is best described as which of the following?",
        "Choose the best definition of tax.",
        "Which of these correctly explains what tax means?",
        "What does the term 'tax' mean?",
        "Select the best description of tax.",
        "Which answer correctly defines tax?",
        "How would you best describe tax?",
        "Which of these is the correct meaning of tax?",
      ];
      return {
        kind: "multiple-choice",
        prompt: randChoice(rng, prompts),
        choices,
        correctIndex,
        layout: "list",
        hint: "Tax flows FROM people and businesses TO the government — not the other way round, and it's not a bank product.",
        explanation: "Tax is money paid by people and businesses to the government to fund public services. It is not bank interest, a shop penalty, or a direct government handout — those are different concepts entirely.",
      };
    }

    if (branch === "why-tax-mc") {
      const chosen = randChoice(rng, TAX_IMPORTANCE_FACTS);
      const otherReasons = TAX_IMPORTANCE_FACTS.filter((f) => f.point !== chosen.point);
      const wrong = shuffle(rng, [...otherReasons]).slice(0, 3).map((f) => f.point);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, chosen.point, wrong, 3);
      const openers = [
        `Tax revenue is used by the government for many things, ${chosen.detail}.`,
        `Governments use tax money for a range of public needs, including ${chosen.detail}.`,
        `One reason tax matters is ${chosen.detail}.`,
      ];
      const closers = [" Which of these is a way tax revenue is typically used?", " Which is a genuine use of tax money?", " Which option correctly describes a use of tax revenue?", " Which of these does tax revenue typically pay for?"];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "list",
        hint: "Tax funds shared public services that benefit the whole community, not private individual purchases.",
        explanation: `${chosen.point} — ${chosen.detail}. This is one of the genuine public purposes tax revenue funds.`,
      };
    }

    if (branch === "bank-service-match") {
      const chosen = shuffle(rng, [...BANK_SERVICE_FACTS]).slice(0, 5);
      const tokens = chosen.map((f, i) => ({ id: `f${i}`, label: f.term }));
      const targets = shuffle(rng, chosen.map((f, i) => ({ id: `r${i}`, label: f.meaning })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`r${i}`] = `f${i}`));
      const prompts = [
        "Match each bank term to its meaning.",
        "Pair each banking service with its correct meaning.",
        "Match each bank service to what it does.",
        "Connect each banking term to its explanation.",
        "Match each bank service term to its meaning.",
        "Pair each term with its correct banking meaning.",
        "Match each banking word to its correct definition.",
        "Link each bank service to its correct meaning.",
        "Match every banking term to its explanation.",
        "Connect each bank term with its meaning.",
      ];
      return {
        kind: "click-match",
        prompt: randChoice(rng, prompts),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each banking word describes a bank doing.",
        explanation: chosen.map((f) => `${f.term}: ${f.meaning}`).join("; ") + ".",
      };
    }

    if (branch === "bank-service-mc") {
      const chosen = randChoice(rng, BANK_SERVICE_FACTS);
      const others = BANK_SERVICE_FACTS.filter((f) => f.term !== chosen.term);
      const wrong = shuffle(rng, [...others]).slice(0, 3).map((f) => f.meaning);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, chosen.meaning, wrong, 3);
      const openers = [
        `A bank offers a service called "${chosen.term}".`,
        `One of the services a bank provides is "${chosen.term}".`,
        `"${chosen.term}" is a service offered at many banks.`,
        `A customer asks about the bank's "${chosen.term}" service.`,
      ];
      const closers = [" What does this service mean?", " Which of these correctly explains this service?", " What is this service?", " Choose the correct meaning of this service."];
      return {
        kind: "multiple-choice",
        prompt: composePrompt(rng, openers, closers),
        choices,
        correctIndex,
        layout: "list",
        hint: "Match the term to exactly what a bank does for that specific service — not a different, similar-sounding one.",
        explanation: `"${chosen.term}" means: ${chosen.meaning}. The other options describe different bank services.`,
      };
    }

    if (branch === "term-fill-blank") {
      const chosen = randChoice(rng, BANK_SERVICE_FACTS);
      const openers = [
        `${chosen.meaning[0].toUpperCase()}${chosen.meaning.slice(1)} — what is this bank service called?`,
        `Fill in the term: ${chosen.meaning[0].toUpperCase()}${chosen.meaning.slice(1)} is called ___.`,
        `A bank service described as "${chosen.meaning}" is called what?`,
        `Name this bank service: ${chosen.meaning}.`,
      ];
      const closers = ["", "Fill in the missing term.", "What word completes this?", "Give the correct term."];
      return {
        kind: "fill-blank",
        prompt: composePrompt(rng, openers, closers).trim(),
        before: "",
        after: "",
        correctAnswer: chosen.term.toLowerCase(),
        acceptedAnswers: [chosen.term.toLowerCase(), chosen.term],
        inputMode: "text",
        hint: "This is one of the standard bank service terms — think about what a bank does for a customer here.",
        explanation: `${chosen.meaning[0].toUpperCase()}${chosen.meaning.slice(1)} — this bank service is called "${chosen.term}".`,
      };
    }

    // bank-service-categorize: sort activities as a bank service, or not something a bank does.
    const bankThings = ["Keeping a customer's money safe", "Lending money to a customer as a loan", "Allowing a customer to withdraw cash", "Accepting money deposits", "Storing valuable documents safely"];
    const notBankThings = ["Selling groceries to customers", "Fixing a customer's car", "Teaching students in a classroom", "Delivering parcels to homes", "Treating patients at a clinic"];
    const chosenBank = shuffle(rng, bankThings).slice(0, 3);
    const chosenNot = shuffle(rng, notBankThings).slice(0, 3);
    const all = shuffle(rng, [...chosenBank.map((a) => ({ label: a, isBank: true })), ...chosenNot.map((a) => ({ label: a, isBank: false }))]);
    const items = all.map((a, i) => ({ id: `a${i}`, label: a.label }));
    const buckets = [
      { id: "bank", label: "A service banks provide" },
      { id: "not-bank", label: "Not a bank service" },
    ];
    const correctBucket: Record<string, string> = {};
    all.forEach((a, i) => (correctBucket[`a${i}`] = a.isBank ? "bank" : "not-bank"));
    const catPrompts = [
      "Sort each activity by whether it is a service banks provide.",
      "Group each activity as a bank service, or not.",
      "Classify each activity: bank service, or not a bank service.",
      "Sort these activities into 'bank service' and 'not a bank service'.",
      "Decide whether each activity is something a bank does, then sort it.",
      "Sort each activity by whether a bank typically offers it.",
      "Group these activities by whether banks provide them.",
      "Classify each activity by whether it happens at a bank.",
      "Sort each activity based on whether it's a banking service.",
      "Which activities are bank services? Sort them all.",
    ];
    return {
      kind: "categorize",
      prompt: randChoice(rng, catPrompts),
      items,
      buckets,
      correctBucket,
      hint: "Bank services involve money, safe custody, or financial transactions — not everyday activities from other trades.",
      explanation: all.map((a) => `"${a.label}" ${a.isBank ? "is" : "is not"} a bank service`).join("; ") + ".",
    };
  },
};
