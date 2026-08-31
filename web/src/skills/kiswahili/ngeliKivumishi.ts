import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type NgeliClass = "M-WA" | "M-MI" | "KI-VI" | "JI-MA" | "N-N";

const NOUNS: { sing: string; plural: string; ngeli: NgeliClass }[] = [
  { sing: "mtoto", plural: "watoto", ngeli: "M-WA" },
  { sing: "mwalimu", plural: "walimu", ngeli: "M-WA" },
  { sing: "mtu", plural: "watu", ngeli: "M-WA" },
  { sing: "mgeni", plural: "wageni", ngeli: "M-WA" },
  { sing: "mti", plural: "miti", ngeli: "M-MI" },
  { sing: "mlima", plural: "milima", ngeli: "M-MI" },
  { sing: "mto", plural: "mito", ngeli: "M-MI" },
  { sing: "kitabu", plural: "vitabu", ngeli: "KI-VI" },
  { sing: "kiti", plural: "viti", ngeli: "KI-VI" },
  { sing: "kikombe", plural: "vikombe", ngeli: "KI-VI" },
  { sing: "gari", plural: "magari", ngeli: "JI-MA" },
  { sing: "somo", plural: "masomo", ngeli: "JI-MA" },
  { sing: "duka", plural: "maduka", ngeli: "JI-MA" },
  { sing: "nyumba", plural: "nyumba", ngeli: "N-N" },
  { sing: "shule", plural: "shule", ngeli: "N-N" },
  { sing: "safari", plural: "safari", ngeli: "N-N" },
];

const ADJ_ROOTS: { root: string; maana: string }[] = [
  { root: "kubwa", maana: "kubwa (big)" },
  { root: "dogo", maana: "dogo (small)" },
];

function concordForms(root: string) {
  return {
    m: `m${root}`,
    wa: `wa${root}`,
    mi: `mi${root}`,
    ki: `ki${root}`,
    vi: `vi${root}`,
    bare: root,
    ma: `ma${root}`,
  };
}

function correctFormKey(ngeli: NgeliClass, isPlural: boolean): keyof ReturnType<typeof concordForms> {
  if (ngeli === "M-WA") return isPlural ? "wa" : "m";
  if (ngeli === "M-MI") return isPlural ? "mi" : "m";
  if (ngeli === "KI-VI") return isPlural ? "vi" : "ki";
  if (ngeli === "JI-MA") return isPlural ? "ma" : "bare";
  return "bare"; // N-N: bare in both numbers
}

export const ngeliKivumishi: Skill = {
  id: "kis-g-ngeli-kivumishi",
  code: "S.1",
  subjectId: "kiswahili",
  strandId: "kis-sarufi",
  grade: 9,
  title: "Ngeli na makubaliano ya kivumishi",
  description: "Chagua umbo sahihi la kivumishi kulingana na ngeli ya nomino.",
  generate(rng) {
    const noun = randChoice(rng, NOUNS);
    const adj = randChoice(rng, ADJ_ROOTS);
    const isPlural = rng() < 0.5;
    const nounForm = isPlural ? noun.plural : noun.sing;

    const forms = concordForms(adj.root);
    const correctKey = correctFormKey(noun.ngeli, isPlural);
    const correct = forms[correctKey];
    const hint = `Nomino "${nounForm}" iko katika ngeli ya ${noun.ngeli} — kivumishi lazima kiambatane na ngeli hiyo.`;
    const explanation = `Nomino "${nounForm}" iko katika ngeli ya ${noun.ngeli} (${isPlural ? "wingi" : "umoja"}), hivyo kivumishi "${adj.root}" huchukua kiambishi kinachofaa na kuwa "${correct}": "Nimeona ${nounForm} ${correct}."`;

    if (rng() < 0.5) {
      return {
        kind: "fill-blank",
        prompt: `Kamilisha sentensi kwa kivumishi sahihi. (${adj.maana})`,
        before: `Nimeona ${nounForm}`,
        after: ".",
        correctAnswer: correct,
        inputMode: "text",
        hint,
        explanation,
      };
    }

    const allForms = Array.from(new Set(Object.values(forms)));
    const distractors = shuffle(rng, allForms.filter((f) => f !== correct)).slice(0, 3);
    const choices = shuffle(rng, [correct, ...distractors]);

    return {
      kind: "multiple-choice",
      prompt: `Kamilisha sentensi kwa kivumishi sahihi: "Nimeona ${nounForm} ___." (${adj.maana})`,
      choices,
      correctIndex: choices.indexOf(correct),
      layout: "row",
      hint,
      explanation,
    };
  },
};
