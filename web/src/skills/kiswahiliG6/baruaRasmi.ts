import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

type Kipengele = "anwani-ya-mwandishi" | "anwani-ya-mpokeaji" | "mtajo" | "mada" | "mwili" | "hitimisho" | "sahihi";

const KIPENGELE_MAELEZO: Record<Kipengele, string> = {
  "anwani-ya-mwandishi": "anwani ya mwandishi (jina, sanduku la posta, tarehe) — huandikwa juu kulia",
  "anwani-ya-mpokeaji": "anwani ya mpokeaji (cheo, sanduku la posta) — huandikwa chini ya anwani ya mwandishi, kushoto",
  mtajo: "mtajo (Mpendwa/Ndugu...) huanzisha barua kwa heshima",
  mada: "mada ya barua huonyesha kwa ufupi lengu la barua",
  mwili: "mwili wa barua huelezea kwa kina ujumbe wa mwandishi, aya moja kwa kila wazo",
  hitimisho: "hitimisho hufunga barua kwa maneno ya heshima (Wako mtiifu/Wako)",
  sahihi: "sahihi na jina la mwandishi huja mwishoni kabisa mwa barua",
};

const MIFANO: { sentensi: string; kipengele: Kipengele }[] = [
  { sentensi: "S.L.P 123, Nakuru\n12 Machi 2026", kipengele: "anwani-ya-mwandishi" },
  { sentensi: "S.L.P 456, Kisumu\n5 Aprili 2026", kipengele: "anwani-ya-mwandishi" },
  { sentensi: "Mwalimu Mkuu, Shule ya Msingi Kericho, S.L.P 789, Kericho", kipengele: "anwani-ya-mpokeaji" },
  { sentensi: "Mkurugenzi, Idara ya Elimu, S.L.P 321, Nyeri", kipengele: "anwani-ya-mpokeaji" },
  { sentensi: "Mpendwa Mwalimu,", kipengele: "mtajo" },
  { sentensi: "Ndugu Mkurugenzi,", kipengele: "mtajo" },
  { sentensi: "YAH: OMBI LA KUJIUNGA NA KLABU YA MAZINGIRA", kipengele: "mada" },
  { sentensi: "YAH: OMBI LA MSAMAHA KUHUSU USHURU", kipengele: "mada" },
  { sentensi: "Naomba kujiunga na klabu ya skauti shuleni ili kukuza ujuzi wangu wa uongozi.", kipengele: "mwili" },
  { sentensi: "Ninaomba radhi kwa kutolipa ushuru kwa wakati kutokana na dharura ya kifamilia.", kipengele: "mwili" },
  { sentensi: "Nina hamu kubwa ya kujifunza kuhusu kilimo na uhifadhi wa mazingira.", kipengele: "mwili" },
  { sentensi: "Ninaahidi kuwa nitawajibika ipasavyo iwapo ombi langu litakubaliwa.", kipengele: "mwili" },
  { sentensi: "Wako mtiifu,", kipengele: "hitimisho" },
  { sentensi: "Wako katika elimu,", kipengele: "hitimisho" },
  { sentensi: "Otieno Owino", kipengele: "sahihi" },
  { sentensi: "Amina Hassan", kipengele: "sahihi" },
];

const MPANGILIO_WA_BARUA: Kipengele[] = ["anwani-ya-mwandishi", "anwani-ya-mpokeaji", "mtajo", "mada", "mwili", "hitimisho", "sahihi"];

const MAJINA_KIPENGELE: Record<Kipengele, string> = {
  "anwani-ya-mwandishi": "Anwani ya Mwandishi",
  "anwani-ya-mpokeaji": "Anwani ya Mpokeaji",
  mtajo: "Mtajo",
  mada: "Mada",
  mwili: "Mwili",
  hitimisho: "Hitimisho",
  sahihi: "Sahihi",
};

export const baruaRasmi: Skill = {
  id: "g6-ksw-ka-barua-rasmi",
  code: "KA.4",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ka",
  grade: 6,
  title: "Barua Rasmi",
  description: "Tambua vipengele vya barua rasmi na uvipange kwa mpangilio sahihi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-kipengele", "oanisha-maelezo", "panga-kipengele", "jaza-sehemu", "panga-mpangilio"] as const);

    if (branch === "tambua-kipengele") {
      const m = randChoice(rng, MIFANO);
      const choices = shuffle(rng, MPANGILIO_WA_BARUA).slice(0, 4);
      if (!choices.includes(m.kipengele)) choices[0] = m.kipengele;
      const shuffledChoices = shuffle(rng, choices);
      return {
        kind: "multiple-choice",
        prompt: `"${m.sentensi}" ni kipengele gani cha barua rasmi?`,
        choices: shuffledChoices.map((c) => MAJINA_KIPENGELE[c]),
        correctIndex: shuffledChoices.indexOf(m.kipengele),
        layout: "list",
        hint: KIPENGELE_MAELEZO[m.kipengele],
        explanation: `Hii ni ${MAJINA_KIPENGELE[m.kipengele]} — ${KIPENGELE_MAELEZO[m.kipengele]}.`,
      };
    }

    if (branch === "oanisha-maelezo") {
      const chosen = shuffle(rng, MPANGILIO_WA_BARUA).slice(0, 5);
      const tokens = chosen.map((k) => ({ id: k, label: MAJINA_KIPENGELE[k] }));
      const targets = shuffle(rng, chosen).map((k) => ({ id: k, label: KIPENGELE_MAELEZO[k] }));
      const correctMap: Record<string, string> = {};
      for (const k of chosen) correctMap[k] = k;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha barua rasmi na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria mpangilio wa barua rasmi kutoka juu hadi chini.",
        explanation: chosen.map((k) => `${MAJINA_KIPENGELE[k]}: ${KIPENGELE_MAELEZO[k]}.`).join(" "),
      };
    }

    if (branch === "panga-kipengele") {
      const chosen = shuffle(rng, MIFANO).slice(0, 6);
      const items = chosen.map((m, i) => ({ id: `${i}-${m.sentensi}`, label: m.sentensi, bucket: m.kipengele }));
      const buckets = Array.from(new Set(chosen.map((c) => c.kipengele))).map((k) => ({ id: k, label: MAJINA_KIPENGELE[k] }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga mifano hii kulingana na kipengele cha barua rasmi kinachofaa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets,
        correctBucket,
        hint: "Fikiria ni sehemu gani ya barua ambapo maandishi haya yangeonekana.",
        explanation: chosen.map((m) => `"${m.sentensi}" ni sehemu ya ${MAJINA_KIPENGELE[m.kipengele]}.`).join(" "),
      };
    }

    if (branch === "jaza-sehemu") {
      const jina = randChoice(rng, KENYAN_NAMES);
      const TEMPLATES = [
        { before: `${jina} anaandika barua rasmi. Baada ya anwani ya mpokeaji, sehemu inayofuata ni "`, after: `".`, jibu: "mtajo" },
        { before: `${jina} anamaliza barua rasmi kwa sehemu ya "`, after: `" kisha sahihi yake.`, jibu: "hitimisho" },
        { before: `Kabla ya mwili wa barua, ${jina} anaandika "`, after: `" ili kuonyesha lengo la barua.`, jibu: "mada" },
        { before: `Sehemu ya kwanza kabisa ya barua rasmi ya ${jina} ni "`, after: `".`, jibu: "anwani ya mwandishi" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu muundo wa barua rasmi.",
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria mpangilio: anwani ya mwandishi, anwani ya mpokeaji, mtajo, mada, mwili, hitimisho, sahihi.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const items = MPANGILIO_WA_BARUA.map((k) => ({ id: k, label: MAJINA_KIPENGELE[k] }));
    return {
      kind: "ordering",
      prompt: "Panga vipengele hivi vya barua rasmi kwa mpangilio sahihi kutoka juu hadi chini.",
      instruction: "Bofya vipengele kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: MPANGILIO_WA_BARUA,
      hint: "Barua rasmi huanza na anwani ya mwandishi na kuishia na sahihi.",
      explanation: "Mpangilio sahihi: " + MPANGILIO_WA_BARUA.map((k) => MAJINA_KIPENGELE[k]).join(" → "),
    };
  },
};
