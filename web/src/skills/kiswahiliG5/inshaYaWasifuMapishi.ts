import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Insha ya Wasifu (Mapishi)" — mfano wa mada
// "Mpishi Nimpendaye", urefu si chini ya maneno 150. Vipengele: anwani, mpangilio wa mawazo, hati safi,
// tahajia, uakifishaji, lugha ya kiubunifu (methali/tashbihi/nahau). Ona curriculum-reference/grade-5/kiswahili.json.

type Sehemu = "anwani" | "mwili" | "hitimisho";

const SEHEMU_MAELEZO: Record<Sehemu, string> = {
  anwani: "anwani/kichwa cha insha huonyesha kwa ufupi mada ya insha, k.m. jina la mpishi anayeelezwa",
  mwili: "mwili wa insha huelezea kwa kina sifa, ustadi na matukio kuhusu mpishi husika",
  hitimisho: "hitimisho hufunga insha kwa muhtasari au maoni ya mwisho ya mwandishi kuhusu mpishi",
};

const SENTENSI_MFANO: { sentensi: string; sehemu: Sehemu }[] = [
  { sentensi: "Mpishi Nimpendaye", sehemu: "anwani" },
  { sentensi: "Mpishi Shupavu wa Familia Yangu", sehemu: "anwani" },
  { sentensi: "Bwana Kamau, Mpishi Bora Ninayemjua", sehemu: "anwani" },
  { sentensi: "Mpishi Anayenifurahisha kwa Vyakula Vitamu", sehemu: "anwani" },
  { sentensi: "Shujaa wa Jikoni Ninayemsifu", sehemu: "anwani" },
  { sentensi: "Alizaliwa mnamo mwaka wa elfu mbili na tano huko Kakamega.", sehemu: "mwili" },
  { sentensi: "Anapika vyakula vitamu kama ugali, sukuma wiki na nyama ya kuchoma.", sehemu: "mwili" },
  { sentensi: "Kila asubuhi huamka mapema ili kuandaa chakula cha familia yetu.", sehemu: "mwili" },
  { sentensi: "Anajulikana kwa usafi na uangalifu anapopika chakula jikoni.", sehemu: "mwili" },
  { sentensi: "Amewahi kufunzwa upishi katika chuo cha mapishi jijini Nairobi.", sehemu: "mwili" },
  { sentensi: "Anapenda kuongeza viungo vipya ili kufanya chakula kiwe kitamu zaidi.", sehemu: "mwili" },
  { sentensi: "Huwasaidia majirani kupika chakula wakati wa sherehe za harusi.", sehemu: "mwili" },
  { sentensi: "Kwa jumla, mpishi huyu ni kielelezo cha bidii na ustadi.", sehemu: "hitimisho" },
  { sentensi: "Ninatarajia kujifunza ustadi wake wa upishi siku moja.", sehemu: "hitimisho" },
  { sentensi: "Ni wazi kuwa mchango wake jikoni umeleta furaha kwa familia yetu.", sehemu: "hitimisho" },
  { sentensi: "Napenda kila mtu ajifunze kutoka kwa bidii yake jikoni.", sehemu: "hitimisho" },
  { sentensi: "Kwa kweli, mpishi huyu anastahili pongezi kwa ustadi wake.", sehemu: "hitimisho" },
];

type Kipengele = "anwani" | "mpangilio-wa-mawazo" | "hati-safi" | "tahajia" | "uakifishaji" | "lugha-ya-kiubunifu";

const KIPENGELE_JINA: Record<Kipengele, string> = {
  anwani: "Anwani",
  "mpangilio-wa-mawazo": "Mpangilio wa Mawazo",
  "hati-safi": "Hati Safi",
  tahajia: "Tahajia",
  uakifishaji: "Uakifishaji",
  "lugha-ya-kiubunifu": "Lugha ya Kiubunifu",
};

const KIPENGELE_MAELEZO: Record<Kipengele, string> = {
  anwani: "kichwa kinachoonyesha mada ya insha kwa ufupi",
  "mpangilio-wa-mawazo": "mawazo yamepangwa kwa mfuatano unaoeleweka, aya kwa aya",
  "hati-safi": "maandishi safi, nadhifu na yanayosomeka kwa urahisi",
  tahajia: "maneno yameandikwa kwa usahihi bila makosa ya kuandika",
  uakifishaji: "alama kama nukta, koma na alama ya swali zimetumika ipasavyo",
  "lugha-ya-kiubunifu": "matumizi ya methali, tashbihi na nahau kuvutia msomaji",
};

const KIPENGELE_WOTE = Object.keys(KIPENGELE_JINA) as Kipengele[];

const MAKOSA: string[] = [
  "Jana niliona mvua ikinyesha sana barabarani.",
  "Paka wangu alikimbia kuzunguka bustani asubuhi.",
  "Nenda haraka! Kuna moto jikoni!",
  "Ninapenda mpira wa miguu zaidi ya vitu vingine.",
  "Shule yetu itafunga kesho kwa sababu ya mvua.",
  "Simba aliwinda swala jangwani jana usiku.",
  "Basi langu liliharibika njiani kuelekea shuleni.",
];

const HATUA_ZA_UANDISHI = [
  { id: "1", label: "Chagua mada ya insha ya wasifu (k.m. Mpishi Nimpendaye)" },
  { id: "2", label: "Panga mawazo yako kuhusu mpishi huyo" },
  { id: "3", label: "Andika anwani ya insha" },
  { id: "4", label: "Andika mwili wa insha kwa undani" },
  { id: "5", label: "Andika hitimisho la insha" },
  { id: "6", label: "Hakiki tahajia na uakifishaji wa insha yako" },
];

export const inshaYaWasifuMapishi: Skill = {
  id: "g5-ksw-ka-insha-ya-wasifu-mapishi",
  code: "KA.1",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Insha ya Wasifu (Mapishi)",
  description: "Tambua muundo na vipengele vya insha ya wasifu kuhusu mpishi, kisha uandike kwa ubunifu.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-sehemu", "oanisha-kipengele", "panga-usahihi", "jaza-kipengele", "panga-hatua"] as const);

    if (branch === "tambua-sehemu") {
      const s = randChoice(rng, SENTENSI_MFANO);
      const wote: Sehemu[] = ["anwani", "mwili", "hitimisho"];
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "sehemu ya insha ya wasifu inayolingana na sentensi hii")} "${s.sentensi}"`,
        choices: choices.map((c) => (c === "anwani" ? "Anwani" : c === "mwili" ? "Mwili" : "Hitimisho")),
        correctIndex: choices.indexOf(s.sehemu),
        layout: "row",
        hint: SEHEMU_MAELEZO[s.sehemu],
        explanation: `Sentensi hii inafaa katika sehemu ya ${s.sehemu} — ${SEHEMU_MAELEZO[s.sehemu]}.`,
      };
    }

    if (branch === "oanisha-kipengele") {
      const chosen = shuffle(rng, KIPENGELE_WOTE).slice(0, 5);
      const tokens = chosen.map((k) => ({ id: k, label: KIPENGELE_JINA[k] }));
      const targets = shuffle(rng, chosen).map((k) => ({ id: k, label: KIPENGELE_MAELEZO[k] }));
      const correctMap: Record<string, string> = {};
      for (const k of chosen) correctMap[k] = k;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "kipengele cha insha bora ya wasifu na maelezo yake"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria ni kipengele gani kinachohusiana na mada, mpangilio, uandishi au lugha.",
        explanation: chosen.map((k) => `${KIPENGELE_JINA[k]}: ${KIPENGELE_MAELEZO[k]}.`).join(" "),
      };
    }

    if (branch === "panga-usahihi") {
      const sahihi = shuffle(rng, SENTENSI_MFANO).slice(0, 4);
      const makosa = shuffle(rng, MAKOSA).slice(0, 4);
      const items = shuffle(rng, [
        ...sahihi.map((s, i) => ({ id: `s${i}-${s.sentensi}`, label: s.sentensi, bucket: "sahihi" })),
        ...makosa.map((m, i) => ({ id: `m${i}-${m}`, label: m, bucket: "makosa" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo sentensi inafaa katika insha ya wasifu kuhusu mpishi au la"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sahihi", label: "Inafaa katika Insha ya Wasifu" },
          { id: "makosa", label: "Haifai (Nje ya Mada)" },
        ],
        correctBucket,
        hint: "Insha ya wasifu kuhusu mpishi huzungumzia mpishi na kazi yake, si mada nyingine.",
        explanation:
          sahihi.map((s) => `"${s.sentensi}" inafaa kwa sababu inahusu mpishi.`).join(" ") +
          " " +
          makosa.map((m) => `"${m}" haifai kwa sababu haihusiani na mpishi.`).join(" "),
      };
    }

    if (branch === "jaza-kipengele") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `${j} anaandika insha ya wasifu kuhusu mpishi wake. Sehemu ya kwanza anayoiandika ni "`, after: `".`, jibu: "anwani" },
        { before: `Baada ya mwili wa insha, ${j} anaandika sehemu ya "`, after: `" ili kufunga insha.`, jibu: "hitimisho" },
        { before: `Kabla ya kuanza kuandika, ${j} anahitaji kufanya "`, after: `" ili mawazo yasichanganyike.`, jibu: "mpangilio wa mawazo" },
        { before: `Baada ya kumaliza insha, ${j} anasoma tena ili kuangalia makosa ya "`, after: `".`, jibu: "tahajia" },
        { before: `Alama kama nukta na koma huhusiana na "`, after: `" katika insha.`, jibu: "uakifishaji" },
        { before: `Matumizi ya methali na tashbihi katika insha ya ${j} ni mfano wa "`, after: `".`, jibu: "lugha ya kiubunifu" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria vipengele vya insha bora ya wasifu: anwani, mpangilio wa mawazo, hati safi, tahajia, uakifishaji, lugha ya kiubunifu.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_UANDISHI);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kuandika insha ya wasifu kuhusu mpishi"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_UANDISHI.map((h) => h.id),
      hint: "Fikiria mchakato wa uandishi kutoka mwanzo hadi mwisho.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_UANDISHI.map((h) => h.label).join(" → "),
    };
  },
};
