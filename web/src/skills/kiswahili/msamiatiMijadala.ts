import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MSAMIATI: { neno: string; maana: string }[] = [
  { neno: "Hoja", maana: "kauli au mada kuu inayojadiliwa katika mjadala" },
  { neno: "Mtetezi", maana: "mzungumzaji anayeunga mkono hoja" },
  { neno: "Mpinzani", maana: "mzungumzaji anayepinga hoja" },
  { neno: "Hoja ya kupinga", maana: "jibu linalopinga au kudhoofisha hoja ya upande mwingine" },
  { neno: "Mwenyekiti", maana: "mtu anayesimamia mjadala na kudumisha utaratibu" },
  { neno: "Mtunza muda", maana: "mtu anayefuatilia na kuashiria muda uliobaki wa kuzungumza" },
  { neno: "Matamshi bora", maana: "kuzungumza kwa uwazi ili kila neno lieleweke" },
  { neno: "Mtazamo wa macho", maana: "kutazama hadhira wakati wa kuzungumza ili kuwavutia" },
  { neno: "Maneno ya kujaza", maana: "sauti au maneno yasiyo na maana kama 'eeh' au 'yaani' yanayotumika wakati wa kufikiria" },
];

export const msamiatiMijadala: Skill = {
  id: "kis-ls-mijadala",
  code: "KZ.1",
  subjectId: "kiswahili",
  strandId: "kis-kusikiliza",
  grade: 9,
  title: "Msamiati wa mijadala na hotuba",
  description: "Oanisha istilahi za mijadala na hotuba na maana zake.",
  generate(rng) {
    const hint = "Fikiria dhima ya kila mtu au neno wakati wa mjadala au hotuba.";

    if (rng() < 0.4) {
      const target = randChoice(rng, MSAMIATI);
      const distractors = shuffle(rng, MSAMIATI.filter((m) => m.neno !== target.neno)).slice(0, 3);
      const choices = shuffle(rng, [target.neno, ...distractors.map((d) => d.neno)]);

      return {
        kind: "multiple-choice",
        prompt: `Ni neno gani lenye maana: "${target.maana}"?`,
        choices,
        correctIndex: choices.indexOf(target.neno),
        layout: "grid",
        hint,
        explanation: `${target.neno} — ${target.maana}.`,
      };
    }

    const chosen = shuffle(rng, MSAMIATI).slice(0, 4);
    const tokens = shuffle(rng, chosen.map((t) => ({ id: t.neno, label: t.neno })));
    const targets = shuffle(rng, chosen.map((t) => ({ id: t.neno, label: t.maana })));
    const correctMap: Record<string, string> = {};
    for (const t of chosen) correctMap[t.neno] = t.neno;

    return {
      kind: "click-match",
      prompt: "Oanisha kila neno na maana yake sahihi.",
      tokens,
      targets,
      correctMap,
      hint: "Fikiria dhima ya kila mtu au neno wakati wa mjadala au hotuba.",
      explanation: chosen.map((t) => `${t.neno} — ${t.maana}.`).join(" "),
    };
  },
};
