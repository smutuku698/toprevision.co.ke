import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Elimu ya Mazingira, mada ndogo 1.7 Nahau — nahau za usafi na
// mazingira: "kuangua kucha" na "kupenga kamasi" (vya usafi wa mwili), pamoja na nahau nyingine
// zinazofahamika za Kiswahili zilizowekwa katika muktadha wa usafi/mazingira. Idadi ya nahau imewekwa
// kwa uangalifu (6, si 10+) ili kuepuka kutunga nahau zisizo za kweli — utofauti unapatikana kupitia
// mifano mingi ya sentensi kwa kila nahau badala ya kuongeza idadi ya nahau. Ona
// curriculum-reference/grade-5/kiswahili.json.

type Aina = "usafi" | "mazingira";

const NAHAU: { nahau: string; maana: string; aina: Aina; mfano: string[] }[] = [
  {
    nahau: "kuangua kucha",
    maana: "kujikata kucha zilizoota ili kuwa msafi",
    aina: "usafi",
    mfano: ["Amina aliangua kucha zake kabla ya kwenda shuleni.", "Mwalimu alituambia tuangue kucha ili tuwe wasafi darasani."],
  },
  {
    nahau: "kupenga kamasi",
    maana: "kujisafisha pua inayotoa makamasi",
    aina: "usafi",
    mfano: ["Mtoto alipenga kamasi kabla ya kula chakula.", "Ni muhimu kupenga kamasi na kutupa kitambaa mahali safi."],
  },
  {
    nahau: "kufumba macho",
    maana: "kupuuza jambo baya kwa makusudi",
    aina: "mazingira",
    mfano: ["Baadhi ya watu hufumba macho wanapoona wenzao wakitupa taka ovyo.", "Usifumbe macho unapoona mazingira yakichafuliwa karibu na nyumba yako."],
  },
  {
    nahau: "kupiga moyo konde",
    maana: "kujitia moyo kufanya jambo gumu",
    aina: "mazingira",
    mfano: ["Wanakijiji walipiga moyo konde na kusafisha mto uliojaa taka.", "Tulipiga moyo konde kuokota takataka zote shambani."],
  },
  {
    nahau: "kufyeka njia",
    maana: "kusafisha njia iliyofunikwa na magugu",
    aina: "mazingira",
    mfano: ["Wavulana walifyeka njia iliyofunikwa na magugu kuelekea shuleni.", "Baba alifyeka njia karibu na nyumba ili mazingira yawe safi."],
  },
  {
    nahau: "kuosha macho",
    maana: "kufurahia kuona kitu kizuri, kama mazingira masafi",
    aina: "mazingira",
    mfano: ["Bustani ile safi iliniosha macho nilipopita karibu nayo.", "Tuliosha macho kwa kuona ufuo safi wa bahari."],
  },
];

const HATUA_ZA_USAFI = [
  { id: "1", label: "Chukua chombo cha kuokotea taka." },
  { id: "2", label: "Okota taka zilizotapakaa uwanjani." },
  { id: "3", label: "Fyeka magugu yaliyofunika njia." },
  { id: "4", label: "Tupa taka mahali maalum pa kutupia." },
  { id: "5", label: "Osha mikono baada ya kazi ya usafi." },
];

export const nahauUsafiMazingira: Skill = {
  id: "g5-ksw-kz-nahau-usafi-mazingira",
  code: "KZ.7",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Nahau — Usafi na Mazingira (Elimu ya Mazingira)",
  description: "Tambua na utumie nahau za usafi na mazingira katika mawasiliano.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-maana", "oanisha-maana", "panga-aina", "jaza-nahau", "panga-usafi"] as const);

    if (branch === "tambua-maana") {
      const n = randChoice(rng, NAHAU);
      const makosa = shuffle(rng, NAHAU.filter((x) => x.nahau !== n.nahau)).slice(0, 3).map((x) => x.maana);
      const choices = shuffle(rng, [n.maana, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "maana sahihi ya nahau hii")} "${n.nahau}".`,
        choices,
        correctIndex: choices.indexOf(n.maana),
        layout: "list",
        hint: "Nahau haina maana ya moja kwa moja; fikiria maana yake ya ndani.",
        explanation: `Nahau "${n.nahau}" ina maana: ${n.maana}.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, NAHAU).slice(0, 5);
      const tokens = chosen.map((n, i) => ({ id: `${i}`, label: n.nahau }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: `${chosen.indexOf(n)}`, label: n.maana }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_n, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "nahau na maana yake sahihi"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kila nahau kama msemo maalum wenye maana ya ndani.",
        explanation: chosen.map((n) => `"${n.nahau}" ina maana: ${n.maana}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const sentensiZote = NAHAU.flatMap((n) => n.mfano.map((s, i) => ({ id: `${n.nahau}-${i}`, label: s, bucket: n.aina })));
      const items = shuffle(rng, sentensiZote).slice(0, 7);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo sentensi inahusu usafi wa mwili au usafi wa mazingira"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "usafi", label: "Usafi wa Mwili" },
          { id: "mazingira", label: "Usafi wa Mazingira" },
        ],
        correctBucket,
        hint: "Baadhi ya sentensi zinahusu usafi wa mwili wa mtu, zingine zinahusu mazingira yanayomzunguka.",
        explanation: "Kila sentensi imewekwa kulingana na iwapo nahau yake inahusu usafi wa mwili au wa mazingira.",
      };
    }

    if (branch === "jaza-nahau") {
      const n = randChoice(rng, NAHAU);
      const sentensi = randChoice(rng, n.mfano);
      const idx = sentensi.toLowerCase().indexOf(n.nahau.toLowerCase());
      const before = idx >= 0 ? sentensi.slice(0, idx) : "";
      const after = idx >= 0 ? sentensi.slice(idx + n.nahau.length) : "";
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before,
        after,
        correctAnswer: n.nahau,
        inputMode: "text",
        hint: `Nahau hii ina maana: ${n.maana}.`,
        explanation: `Sentensi kamili: "${sentensi}"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_USAFI);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za usafi wa mazingira kwa mpangilio unaofaa"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_USAFI.map((h) => h.id),
      hint: "Fikiria unavyoanza kazi ya usafi hadi unavyoimaliza.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_USAFI.map((h) => h.label).join(" → "),
    };
  },
};
