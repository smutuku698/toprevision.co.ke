import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Kuandika kwa Tarakilishi (Mapambo)" — sehemu za
// tarakilishi zinazotumika kupigia chapa (kipanya, kiwambo/mulishi, n.k.), msamiati wa mapambo kama hazina
// tofauti ya kulinganisha, na kuhifadhi/kuhariri kazi kidijitali. Ona curriculum-reference/grade-5/kiswahili.json.

const TARAKILISHI: { neno: string; maelezo: string }[] = [
  { neno: "Kipanya", maelezo: "kifaa cha kuelekeza kishale na kubofya kwenye skrini ya tarakilishi" },
  { neno: "Kiwambo (Mulishi)", maelezo: "kifaa chenye vitufe vya kuandika herufi na namba kwenye tarakilishi" },
  { neno: "Skrini", maelezo: "sehemu inayoonyesha maandishi na picha za kazi unayofanya" },
  { neno: "CPU (Kitengo cha Uchakataji)", maelezo: "sehemu inayochakata data na kuendesha programu za tarakilishi" },
  { neno: "Printa", maelezo: "kifaa kinachochapisha maandishi au picha kwenye karatasi" },
  { neno: "Spika", maelezo: "kifaa kinachotoa sauti kutoka kwa tarakilishi" },
];

const MAPAMBO: string[] = ["Herini", "Vipuli", "Pete", "Kipini", "Bangili", "Shanga", "Taji", "Kugesi", "Hina"];

const HATUA_ZA_KUANDIKA = [
  { id: "1", label: "Fungua programu ya kuandikia (k.m. Neno)" },
  { id: "2", label: "Andika maandishi yako kwa kutumia kiwambo" },
  { id: "3", label: "Hakiki tahajia na uakifishaji wa maandishi" },
  { id: "4", label: "Hifadhi kazi yako kwenye faili" },
  { id: "5", label: "Funga programu baada ya kuhifadhi" },
];

export const kuandikaKwaTarakilishi: Skill = {
  id: "g5-ksw-ka-kuandika-kwa-tarakilishi",
  code: "KA.3",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Kuandika kwa Tarakilishi (Mapambo)",
  description: "Tambua sehemu za tarakilishi zinazotumika kupigia chapa na uzitofautishe na msamiati wa mapambo.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-sehemu", "oanisha-kazi", "panga-aina", "jaza-kazi", "panga-hatua"] as const);

    if (branch === "tambua-sehemu") {
      const t = randChoice(rng, TARAKILISHI);
      const choices = shuffle(rng, TARAKILISHI).slice(0, 4);
      if (!choices.includes(t)) choices[0] = t;
      const shuffledChoices = shuffle(rng, choices);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "sehemu ya tarakilishi inayolingana na kazi hii")} "${t.maelezo}".`,
        choices: shuffledChoices.map((c) => c.neno),
        correctIndex: shuffledChoices.indexOf(t),
        layout: "list",
        hint: "Fikiria kazi ya kila sehemu ya tarakilishi.",
        explanation: `${t.neno} — ${t.maelezo}.`,
      };
    }

    if (branch === "oanisha-kazi") {
      const chosen = shuffle(rng, TARAKILISHI).slice(0, 5);
      const tokens = chosen.map((t, i) => ({ id: `${i}`, label: t.neno }));
      const targets = shuffle(rng, chosen).map((t) => ({ id: `${chosen.indexOf(t)}`, label: t.maelezo }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_t, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "sehemu ya tarakilishi na kazi yake"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria unachotumia kuandika, kuelekeza, kuona, kuchapisha au kusikia sauti.",
        explanation: chosen.map((t) => `${t.neno}: ${t.maelezo}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const tarak = shuffle(rng, TARAKILISHI).slice(0, 4);
      const mapambo = shuffle(rng, MAPAMBO).slice(0, 4);
      const items = shuffle(rng, [
        ...tarak.map((t, i) => ({ id: `t${i}-${t.neno}`, label: t.neno, bucket: "tarakilishi" })),
        ...mapambo.map((m, i) => ({ id: `m${i}-${m}`, label: m, bucket: "mapambo" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo neno ni sehemu ya tarakilishi au ni mapambo"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "tarakilishi", label: "Sehemu ya Tarakilishi" },
          { id: "mapambo", label: "Sio Sehemu ya Tarakilishi (Mapambo)" },
        ],
        correctBucket,
        hint: "Sehemu za tarakilishi husaidia kuandika/kuonyesha kazi; mapambo huvaliwa mwilini.",
        explanation:
          tarak.map((t) => `${t.neno} ni sehemu ya tarakilishi.`).join(" ") +
          " " +
          mapambo.map((m) => `${m} ni aina ya mapambo, sio sehemu ya tarakilishi.`).join(" "),
      };
    }

    if (branch === "jaza-kazi") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `${j} anaandika insha kwa tarakilishi. Ili asipoteze kazi yake, anapaswa "`, after: `" kazi yake mara kwa mara.`, jibu: "kuhifadhi" },
        { before: `${j} na rafiki yake wanaweza "`, after: `" hati moja pamoja wakiwa mtandaoni.`, jibu: "kuhariri" },
        { before: `Kifaa kinachotumika kuandika herufi kwenye tarakilishi cha ${j} kinaitwa "`, after: `".`, jibu: "kiwambo" },
        { before: `Kifaa kinachotumika kuelekeza kishale kwenye skrini ya ${j} kinaitwa "`, after: `".`, jibu: "kipanya" },
        { before: `Sehemu inayoonyesha maandishi na picha za kazi ya ${j} inaitwa "`, after: `".`, jibu: "skrini" },
        { before: `Kifaa kinachochapisha kazi ya ${j} kwenye karatasi kinaitwa "`, after: `".`, jibu: "printa" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria sehemu za tarakilishi na umuhimu wa kuhifadhi kazi mara kwa mara.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_KUANDIKA);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kuandika na kuhifadhi hati kwa tarakilishi"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_KUANDIKA.map((h) => h.id),
      hint: "Fikiria mchakato kutoka kufungua programu hadi kufunga baada ya kuhifadhi.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_KUANDIKA.map((h) => h.label).join(" → "),
    };
  },
};
