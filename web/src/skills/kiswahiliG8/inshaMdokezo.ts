import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const AINA_MDOKEZO: { id: string; jina: string; maelezo: string }[] = [
  { id: "masimulizi", jina: "Mdokezo wa masimulizi", maelezo: "Vidokezo vinavyoongoza mwandishi kutunga hadithi kwa mfuatano wa matukio" },
  { id: "maelezo", jina: "Mdokezo wa maelezo", maelezo: "Vidokezo vinavyoongoza mwandishi kueleza sifa za kitu au mahali" },
  { id: "methali", jina: "Mdokezo wa methali", maelezo: "Insha inayotungwa kutokana na methali au msemo uliopewa" },
  { id: "mazungumzo", jina: "Mdokezo wa mazungumzo", maelezo: "Vidokezo vinavyoongoza mwandishi kutunga mazungumzo kati ya wahusika" },
];

const VIGEZO_SAHIHI = [
  "Kuzingatia kila mdokezo ulioorodheshwa bila kuruka hata mmoja",
  "Kupanga mawazo kufuatana na mfuatano wa vidokezo vilivyotolewa",
  "Kuhitimisha insha kwa kuzingatia mdokezo wa mwisho",
  "Kutumia lugha inayoendana na aina ya mdokezo uliopewa",
];

const VIGEZO_SI_SAHIHI = [
  "Kupuuza baadhi ya vidokezo vilivyotolewa",
  "Kuandika kwa mfuatano tofauti na vidokezo bila sababu",
  "Kumalizia insha ghafla bila kuzingatia mdokezo wa mwisho",
  "Kutumia lugha isiyoendana na aina ya mdokezo uliopewa",
];

const HATUA_MDOKEZO = [
  { id: "soma", label: "Soma vidokezo vyote kwa makini kabla ya kuanza kuandika" },
  { id: "elewa", label: "Elewa aina ya mdokezo na maagizo yaliyotolewa" },
  { id: "panga", label: "Panga mawazo yako kufuatana na mfuatano wa vidokezo" },
  { id: "andika", label: "Andika insha ukizingatia kila mdokezo ulioorodheshwa" },
  { id: "hitimisha", label: "Hitimisha insha ukizingatia mdokezo wa mwisho" },
];

const MDOKEZO_MFANO = ["...Ghafla mlango ulifunguka...", "...Sauti kubwa ilisikika nje...", "...Hakuna aliyetarajia kile kilichofuata..."];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Insha ya mdokezo ni nini?",
    sahihi: "Insha inayoandikwa kwa kuzingatia vidokezo au sehemu za maneno alizopewa mwandishi",
    makosa: [
      "Insha inayoandikwa bila mpangilio wowote",
      "Insha inayozungumzia mada yoyote apendayo mwandishi",
      "Insha inayotolewa kama zawadi kwa mwandishi bora",
    ],
  },
  {
    swali: "Ni ipi kati ya hizi ni aina ya insha ya mdokezo?",
    sahihi: "Mdokezo wa methali, unaotungwa kutokana na methali iliyopewa",
    makosa: [
      "Barua rasmi ya kuomba kazi",
      "Ripoti ya mkutano wa shule",
      "Tangazo la kutafuta mnyama aliyepotea",
    ],
  },
  {
    swali: `Mwanafunzi alipewa mdokezo "${MDOKEZO_MFANO[0]}" kama sehemu ya kwanza ya insha yake, lakini akaandika hadithi isiyohusiana na mlango kufunguka. Je, alizingatia sheria za insha ya mdokezo?`,
    sahihi: "Hapana, kwa sababu hakuzingatia mdokezo aliopewa kama msingi wa hadithi yake",
    makosa: [
      "Ndiyo, kwa sababu hadithi yake ilikuwa ya kuvutia",
      "Ndiyo, kwa sababu urefu wa insha ulikuwa sahihi",
      "Hapana, kwa sababu hakutumia lugha rasmi",
    ],
  },
  {
    swali: "Kwa nini ni muhimu kusoma vidokezo vyote kabla ya kuanza kuandika insha ya mdokezo?",
    sahihi: "Ili kuelewa mfuatano na maagizo yote kabla ya kupanga mawazo",
    makosa: [
      "Ili kujua urefu wa insha mapema",
      "Ili kuepuka kutumia lugha rasmi",
      "Ili kubaini idadi ya aya zitakazoandikwa pekee",
    ],
  },
];

export const inshaMdokezo: Skill = {
  id: "g8-ksw-ka-mdokezo",
  code: "KA.6",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ka",
  grade: 8,
  title: "Insha za Kubuni: Mdokezo",
  description: "Bainisha aina na vipengele vya insha ya mdokezo, na uandike ukizingatia vidokezo vyote.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, AINA_MDOKEZO.map((a) => ({ id: a.id, label: a.maelezo })));
      const targets = shuffle(rng, AINA_MDOKEZO.map((a) => ({ id: a.id, label: a.jina })));
      const correctMap: Record<string, string> = {};
      for (const a of AINA_MDOKEZO) correctMap[a.id] = a.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila aina ya insha ya mdokezo na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Kuna mdokezo wa masimulizi, maelezo, methali, na mazungumzo.",
        explanation: AINA_MDOKEZO.map((a) => `${a.jina} — ${a.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const sahihi = shuffle(rng, VIGEZO_SAHIHI).slice(0, 3);
      const siSahihi = shuffle(rng, VIGEZO_SI_SAHIHI).slice(0, 3);
      const items = shuffle(rng, [
        ...sahihi.map((label) => ({ id: label, label, bucket: "sahihi" })),
        ...siSahihi.map((label) => ({ id: label, label, bucket: "sisahihi" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga vigezo hivi kulingana na kama ni vizuri au si vizuri kuzingatia wakati wa kuandika insha ya mdokezo.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sahihi", label: "Vigezo Vizuri" },
          { id: "sisahihi", label: "Vigezo Visivyofaa" },
        ],
        correctBucket,
        hint: "Insha bora ya mdokezo huzingatia kila kidokezo kwa mfuatano sahihi.",
        explanation: `Vizuri: ${sahihi.join(" / ")}. Visivyofaa: ${siSahihi.join(" / ")}.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HATUA_MDOKEZO);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kuandika insha ya mdokezo kwa mpangilio unaofaa.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_MDOKEZO.map((h) => h.id),
        hint: "Anza kwa kusoma vidokezo vyote, kisha panga mawazo, andika, na hitimisha.",
        explanation: HATUA_MDOKEZO.map((h) => h.label).join(" → "),
      };
    }

    const entry = randChoice(rng, MASWALI);
    const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
    return {
      kind: "multiple-choice",
      prompt: entry.swali,
      choices,
      correctIndex: choices.indexOf(entry.sahihi),
      layout: "list",
      hint: "Insha ya mdokezo hujengwa kutokana na vidokezo vilivyotolewa, vinavyopaswa kuzingatiwa vyote.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
