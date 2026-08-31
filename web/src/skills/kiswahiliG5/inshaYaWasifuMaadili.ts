import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Insha ya Wasifu (Maadili)" — vipengele 3:
// kichwa, mwili, hitimisho. Mifano ya mada (verbatim): "mwanafunzi mwadilifu",
// "mtu aliyeshinda tuzo kwa uadilifu wake". Urefu si chini ya maneno 150. Ona curriculum-reference/grade-5/kiswahili.json.

type Sehemu = "kichwa" | "mwili" | "hitimisho";
type Mada = "mwanafunzi-mwadilifu" | "mshindi-wa-tuzo";

const SEHEMU_JINA: Record<Sehemu, string> = { kichwa: "Kichwa", mwili: "Mwili", hitimisho: "Hitimisho" };

const SEHEMU_MAELEZO: Record<Sehemu, string> = {
  kichwa: "kichwa huonyesha kwa ufupi mada ya insha ya wasifu kuhusu mtu mwadilifu",
  mwili: "mwili huelezea kwa kina matendo na sifa za uadilifu za mtu husika",
  hitimisho: "hitimisho hufunga insha kwa maoni ya mwisho kuhusu mtu huyo",
};

const MADA_JINA: Record<Mada, string> = {
  "mwanafunzi-mwadilifu": "Mwanafunzi Mwadilifu",
  "mshindi-wa-tuzo": "Mtu Aliyeshinda Tuzo kwa Uadilifu",
};

const SENTENSI_MFANO: { sentensi: string; sehemu: Sehemu; mada: Mada }[] = [
  { sentensi: "Mwanafunzi Mwadilifu Nimjuaye", sehemu: "kichwa", mada: "mwanafunzi-mwadilifu" },
  { sentensi: "Shujaa wa Uadilifu Aliyeshinda Tuzo", sehemu: "kichwa", mada: "mshindi-wa-tuzo" },
  { sentensi: "Huwarudishia walimu pesa za ziada wanapokosea kutoa chenji.", sehemu: "mwili", mada: "mwanafunzi-mwadilifu" },
  { sentensi: "Hasemi uwongo hata anapokosea kufanya kazi ya nyumbani.", sehemu: "mwili", mada: "mwanafunzi-mwadilifu" },
  { sentensi: "Huwaonya wenzake wanapotaka kudanganya mtihanini.", sehemu: "mwili", mada: "mwanafunzi-mwadilifu" },
  { sentensi: "Anaheshimu mali za shule na hazichukui bila ruhusa.", sehemu: "mwili", mada: "mwanafunzi-mwadilifu" },
  { sentensi: "Alirudisha mkoba uliopotea wenye pesa nyingi kwa mmiliki wake.", sehemu: "mwili", mada: "mshindi-wa-tuzo" },
  { sentensi: "Alikataa kupokea rushwa aliyopewa ili kupitisha kazi mbaya.", sehemu: "mwili", mada: "mshindi-wa-tuzo" },
  { sentensi: "Alisema ukweli mahakamani hata ilipomgharimu sana.", sehemu: "mwili", mada: "mshindi-wa-tuzo" },
  { sentensi: "Alishinda tuzo ya kitaifa kwa uadilifu wake kazini.", sehemu: "mwili", mada: "mshindi-wa-tuzo" },
  { sentensi: "Kwa jumla, mwanafunzi huyu ni kielelezo bora cha uadilifu shuleni.", sehemu: "hitimisho", mada: "mwanafunzi-mwadilifu" },
  { sentensi: "Ninatarajia kuwa mwadilifu kama yeye siku moja.", sehemu: "hitimisho", mada: "mwanafunzi-mwadilifu" },
  { sentensi: "Ni wazi kuwa uadilifu wake umemfanya apendwe na wote.", sehemu: "hitimisho", mada: "mwanafunzi-mwadilifu" },
  { sentensi: "Kwa kweli, mtu huyu anastahili heshima kwa uadilifu wake.", sehemu: "hitimisho", mada: "mshindi-wa-tuzo" },
  { sentensi: "Tuzo yake ni ushahidi wa umuhimu wa kuwa mwaminifu.", sehemu: "hitimisho", mada: "mshindi-wa-tuzo" },
  { sentensi: "Napenda kila mmoja wetu ajifunze kutoka kwa mfano wake.", sehemu: "hitimisho", mada: "mshindi-wa-tuzo" },
];

const HATUA_ZA_UANDISHI = [
  { id: "1", label: "Chagua mada ya insha ya wasifu (mtu mwadilifu)" },
  { id: "2", label: "Panga mawazo kuhusu matendo yake ya uadilifu" },
  { id: "3", label: "Andika kichwa cha insha" },
  { id: "4", label: "Andika mwili wa insha kwa undani" },
  { id: "5", label: "Andika hitimisho la insha" },
];

export const inshaYaWasifuMaadili: Skill = {
  id: "g5-ksw-ka-insha-ya-wasifu-maadili",
  code: "KA.6",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Insha ya Wasifu (Maadili)",
  description: "Tambua vipengele vya kimuundo vya insha ya wasifu kuhusu maadili na uandike kwa muundo ufaao.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-sehemu", "oanisha-sehemu", "panga-mada", "jaza-sehemu", "panga-hatua"] as const);

    if (branch === "tambua-sehemu") {
      const s = randChoice(rng, SENTENSI_MFANO);
      const wote: Sehemu[] = ["kichwa", "mwili", "hitimisho"];
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "sehemu ya insha ya wasifu inayolingana na sentensi hii")} "${s.sentensi}"`,
        choices: choices.map((c) => SEHEMU_JINA[c]),
        correctIndex: choices.indexOf(s.sehemu),
        layout: "row",
        hint: SEHEMU_MAELEZO[s.sehemu],
        explanation: `Sentensi hii inafaa katika sehemu ya ${SEHEMU_JINA[s.sehemu]} — ${SEHEMU_MAELEZO[s.sehemu]}.`,
      };
    }

    if (branch === "oanisha-sehemu") {
      const wote: Sehemu[] = ["kichwa", "mwili", "hitimisho"];
      const tokens = wote.map((s) => ({ id: s, label: SEHEMU_JINA[s] }));
      const targets = shuffle(rng, wote).map((s) => ({ id: s, label: SEHEMU_MAELEZO[s] }));
      const correctMap: Record<string, string> = { kichwa: "kichwa", mwili: "mwili", hitimisho: "hitimisho" };
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "sehemu ya insha ya wasifu na dhima yake"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria mpangilio wa insha kutoka mwanzo hadi mwisho.",
        explanation: wote.map((s) => `${SEHEMU_JINA[s]}: ${SEHEMU_MAELEZO[s]}.`).join(" "),
      };
    }

    if (branch === "panga-mada") {
      const chosen = shuffle(rng, SENTENSI_MFANO.filter((s) => s.sehemu === "mwili" || s.sehemu === "hitimisho")).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `${i}-${s.sentensi}`, label: s.sentensi, bucket: s.mada }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "mada ya insha ya wasifu inayolingana na sentensi hii"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "mwanafunzi-mwadilifu", label: MADA_JINA["mwanafunzi-mwadilifu"] },
          { id: "mshindi-wa-tuzo", label: MADA_JINA["mshindi-wa-tuzo"] },
        ],
        correctBucket,
        hint: "Fikiria ni mtu gani anayeelezwa: mwanafunzi shuleni au mshindi wa tuzo kazini.",
        explanation: chosen.map((s) => `"${s.sentensi}" inafaa mada ya ${MADA_JINA[s.mada]}.`).join(" "),
      };
    }

    if (branch === "jaza-sehemu") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `${j} anaandika insha kuhusu mtu mwadilifu. Sehemu ya kwanza anayoiandika ni "`, after: `".`, jibu: "kichwa" },
        { before: `Baada ya kichwa, ${j} anaandika sehemu ya "`, after: `" yenye maelezo ya kina.`, jibu: "mwili" },
        { before: `${j} anafunga insha yake kwa sehemu ya "`, after: `".`, jibu: "hitimisho" },
        { before: `Sehemu inayoonyesha kwa ufupi mada ya insha ya ${j} inaitwa "`, after: `".`, jibu: "kichwa" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria muundo wa insha ya wasifu: kichwa, mwili, hitimisho.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_UANDISHI);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kuandika insha ya wasifu kuhusu mtu mwadilifu"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_UANDISHI.map((h) => h.id),
      hint: "Fikiria mchakato wa uandishi kutoka mwanzo hadi mwisho.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_UANDISHI.map((h) => h.label).join(" → "),
    };
  },
};
