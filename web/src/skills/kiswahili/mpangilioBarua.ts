import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const BARUA_ITEMS: { id: string; label: string }[] = [
  { id: "anwani", label: "Anwani ya mwandishi" },
  { id: "tarehe", label: "Tarehe" },
  { id: "mtajo", label: "Mtajo (salamu, k.m. 'Bwana/Bibi,')" },
  { id: "utangulizi", label: "Aya ya utangulizi — eleza kusudi la barua" },
  { id: "hitimisho", label: "Aya ya hitimisho — wito wa kuchukua hatua" },
  { id: "kimalizio", label: "Kimalizio na sahihi" },
];

const BARUA_PEPE_ITEMS: { id: string; label: string }[] = [
  { id: "mada", label: "Mada ya barua pepe" },
  { id: "mtajo", label: "Mtajo (salamu)" },
  { id: "utangulizi", label: "Aya ya utangulizi — eleza kusudi la barua" },
  { id: "hitimisho", label: "Aya ya hitimisho — wito wa kuchukua hatua" },
  { id: "kimalizio", label: "Kimalizio na jina" },
];

export const mpangilioBarua: Skill = {
  id: "kis-w-mpangilio-barua",
  code: "I.1",
  subjectId: "kiswahili",
  strandId: "kis-insha",
  grade: 9,
  title: "Panga sehemu za barua rasmi",
  description: "Panga sehemu za barua rasmi au barua pepe rasmi kwa mpangilio sahihi.",
  generate(rng) {
    const aina = randChoice(rng, ["barua", "barua-pepe"] as const);
    const items = aina === "barua" ? BARUA_ITEMS : BARUA_PEPE_ITEMS;
    const correctOrder = items.map((i) => i.id);
    const jinaAina = aina === "barua" ? "barua rasmi" : "barua pepe rasmi";
    const hint = aina === "barua" ? "Barua huanza na anwani ya mwandishi, na kumalizika na sahihi." : "Barua pepe huanza na mada, na kumalizika na jina.";
    const explanation = `Mpangilio sahihi wa ${jinaAina} ni: ${items.map((i) => i.label).join(" → ")}.`;
    const ordinals = ["kwanza", "pili", "tatu", "nne", "tano", "sita na mwisho"];

    if (rng() < 0.5) {
      const index = Math.floor(rng() * items.length);
      const target = items[index];
      const choices = shuffle(rng, items.map((i) => i.label));

      return {
        kind: "multiple-choice",
        prompt: `Ni sehemu gani inayokuja ya ${ordinals[index]} katika ${jinaAina}?`,
        choices,
        correctIndex: choices.indexOf(target.label),
        layout: "list",
        hint,
        explanation,
      };
    }

    return {
      kind: "ordering",
      prompt: `Panga sehemu za ${jinaAina} kwa mpangilio sahihi.`,
      instruction: "Bofya sehemu kwa mpangilio zinavyopaswa kutokea, kutoka juu hadi chini.",
      items: shuffle(rng, items),
      correctOrder,
      hint,
      explanation,
    };
  },
};
