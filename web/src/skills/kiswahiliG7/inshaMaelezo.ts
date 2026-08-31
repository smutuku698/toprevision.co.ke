import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// ---- 7.3.1: msamiati ufaao — vivumishi na vielezi ---------------------

const VIVUMISHI_VIELEZI: { id: string; term: string; maelezo: string; mfano: string }[] = [
  { id: "kivumishi", term: "Kivumishi", maelezo: "Neno linaloeleza sifa ya nomino, k.m. rangi, ukubwa au umbo", mfano: "gari jekundu" },
  { id: "kielezi", term: "Kielezi", maelezo: "Neno linaloeleza jinsi kitendo kinavyofanyika, wakati au mahali", mfano: "alikimbia haraka" },
];

const MANENO_YA_KUPANGA: { id: string; label: string; bucket: "kivumishi" | "kielezi" }[] = [
  { id: "1", label: "nyumba kubwa", bucket: "kivumishi" },
  { id: "2", label: "mtoto mrembo", bucket: "kivumishi" },
  { id: "3", label: "gari refu", bucket: "kivumishi" },
  { id: "4", label: "alizungumza kwa upole", bucket: "kielezi" },
  { id: "5", label: "alifika mapema", bucket: "kielezi" },
  { id: "6", label: "aliruka kwa nguvu", bucket: "kielezi" },
];

const MASWALI_VIVUMISHI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Kwa nini msamiati wa vivumishi na vielezi ni muhimu katika insha ya maelezo?",
    sahihi: "Husaidia kuchora picha wazi akilini mwa msomaji kuhusu sifa na jinsi mambo yanavyofanyika",
    makosa: [
      "Huifanya insha kuwa fupi zaidi",
      "Huondoa haja ya kuwa na wahusika",
      "Hutumika tu katika insha za maelekezo",
    ],
  },
  {
    swali: "Katika 'Mvulana alicheza kwa ujasiri uwanjani', neno 'kwa ujasiri' ni aina gani ya neno?",
    sahihi: "Kielezi — linaeleza jinsi mvulana alivyocheza",
    makosa: [
      "Kivumishi — kinaeleza sifa ya mvulana",
      "Kitenzi — kinaonyesha kitendo cha mvulana",
      "Nomino — linamtaja mvulana",
    ],
  },
];

// ---- 11.3.1: mpangilio wa mahali vs kiwakati --------------------------

const AYA_MPANGILIO_MAHALI =
  "Chumba cha kulala cha Wanjiku kina rangi ya samawati. Mlangoni pana kabati dogo la vitabu. Katikati ya chumba pana kitanda chenye shuka nyeupe. Kando ya dirisha pana meza ndogo ya kusomea.";

const AYA_MPANGILIO_KIWAKATI =
  "Asubuhi na mapema, Wanjiku aliamka na kutandika kitanda chake. Baadaye alioga na kuvaa sare ya shule. Kisha alikula chakula cha asubuhi haraka. Mwishoni aliondoka kuelekea shuleni akiwa na furaha.";

const MASWALI_MPANGILIO: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: `Soma aya hii: "${AYA_MPANGILIO_MAHALI}" Aya hii imepangwa kwa mpangilio gani?`,
    sahihi: "Mpangilio unaozingatia mahali — maelezo yanafuata sehemu za chumba",
    makosa: [
      "Mpangilio unaozingatia mfuatano wa matukio kiwakati",
      "Mpangilio wa kutoka kwa jumla hadi mahususi bila utaratibu",
      "Mpangilio wa kutoa hoja na kupinga hoja",
    ],
  },
  {
    swali: `Soma aya hii: "${AYA_MPANGILIO_KIWAKATI}" Aya hii imepangwa kwa mpangilio gani?`,
    sahihi: "Mpangilio unaozingatia mfuatano wa matukio kiwakati — kuanzia asubuhi hadi kuelekea shuleni",
    makosa: [
      "Mpangilio unaozingatia mahali pekee",
      "Mpangilio usio na utaratibu wowote",
      "Mpangilio wa kulinganisha vitu viwili",
    ],
  },
  {
    swali: "Insha ya maelezo inayoeleza jinsi chumba kimepangwa hutumia mpangilio gani unaofaa zaidi?",
    sahihi: "Mpangilio unaozingatia mahali, k.m. kutoka mlangoni hadi kwenye dirisha",
    makosa: [
      "Mpangilio wa mfuatano wa matukio kiwakati pekee",
      "Mpangilio usio na muundo wowote",
      "Mpangilio wa kuanzia hitimisho hadi utangulizi",
    ],
  },
];

// ---- 13.3.1: kuelezea mtu (sura, tabia, matendo) -----------------------

type MtuMaelezo = { jina: string; kivumishiSahihi: string; kivumishiMbaya: string[]; sentensiTabia: string };

const WATU_MAELEZO: MtuMaelezo[] = [
  {
    jina: "Bibi Nyaboke",
    kivumishiSahihi: "mchangamfu na mkarimu",
    kivumishiMbaya: ["mfupi na mzito", "mrefu na mwembamba", "mwepesi wa hasira"],
    sentensiTabia: "Bibi Nyaboke huwakaribisha wageni wote kwa tabasamu na huwapa chakula bila kusita.",
  },
  {
    jina: "Mwalimu Kamau",
    kivumishiSahihi: "mvumilivu na mwenye busara",
    kivumishiMbaya: ["mfupi na mnene", "mweusi na mrefu", "mwenye macho ya bluu"],
    sentensiTabia: "Mwalimu Kamau huwaeleza wanafunzi masomo mara kadhaa bila kuchoka hadi wote waelewe.",
  },
];

const MASWALI_MTU: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Wakati wa kuandika insha ya maelezo inayodhihirisha sifa za mtu, mwandishi anapaswa kuzingatia nini?",
    sahihi: "Sura ya nje, tabia, na matendo ya mtu huyo yanayodhihirisha tabia hiyo",
    makosa: [
      "Historia nzima ya nasaba ya mtu huyo pekee",
      "Bei ya nguo anazovaa mtu huyo",
      "Ratiba yake ya kazi ya kila saa",
    ],
  },
  {
    swali: `Soma sentensi hii: "${WATU_MAELEZO[0].sentensiTabia}" Sentensi hii inadhihirisha tabia gani ya Bibi Nyaboke?`,
    sahihi: "Ukarimu na uchangamfu wake kwa wageni",
    makosa: ["Ukali na hasira yake", "Uvivu wake kazini", "Ubahili wake kwa jamaa"],
  },
];

export const inshaMaelezo: Skill = {
  id: "g7-ksw-ka-insha-maelezo",
  code: "KA.7",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Insha ya Maelezo: Msamiati, Mpangilio na Kuelezea Mtu",
  description: "Tumia vivumishi na vielezi ifaavyo, tambua mpangilio wa mahali na kiwakati, na uelezee sifa za mtu katika insha ya maelezo.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["vivumishiMatch", "vivumishiCategorize", "vivumishiMc", "mpangilioOrder", "mpangilioMc", "mtuFill", "mtuMc"] as const
    );

    if (branch === "vivumishiMatch") {
      const tokens = shuffle(rng, VIVUMISHI_VIELEZI.map((v) => ({ id: v.id, label: `${v.maelezo} — mfano: "${v.mfano}"` })));
      const targets = shuffle(rng, VIVUMISHI_VIELEZI.map((v) => ({ id: v.id, label: v.term })));
      const correctMap: Record<string, string> = {};
      for (const v of VIVUMISHI_VIELEZI) correctMap[v.id] = v.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila aina ya neno na maelezo/mfano wake katika insha ya maelezo.",
        tokens,
        targets,
        correctMap,
        hint: "Kivumishi hueleza sifa ya nomino; kielezi hueleza jinsi kitendo kinavyofanyika.",
        explanation: VIVUMISHI_VIELEZI.map((v) => `${v.term} — ${v.maelezo.toLowerCase()} (mfano: "${v.mfano}").`).join(" "),
      };
    }

    if (branch === "vivumishiCategorize") {
      const items = shuffle(rng, MANENO_YA_KUPANGA);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga maneno haya kulingana na kama ni vivumishi (sifa ya nomino) au vielezi (jinsi kitendo kinavyofanyika).",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "kivumishi", label: "Kivumishi" },
          { id: "kielezi", label: "Kielezi" },
        ],
        correctBucket,
        hint: "Kivumishi kinaambatana na nomino (jina la kitu); kielezi kinaambatana na kitenzi (kitendo).",
        explanation: MANENO_YA_KUPANGA.map((m) => `"${m.label}" ni ${m.bucket === "kivumishi" ? "kivumishi" : "kielezi"}.`).join(" "),
      };
    }

    if (branch === "vivumishiMc") {
      const entry = randChoice(rng, MASWALI_VIVUMISHI);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: entry.swali,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Kivumishi hueleza sifa ya nomino; kielezi hueleza jinsi kitendo kinavyofanyika.",
        explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
      };
    }

    if (branch === "mpangilioOrder") {
      const mahali = AYA_MPANGILIO_MAHALI.split(". ").map((s, i) => ({ id: `p${i}`, label: s.trim().replace(/\.$/, "") + "." }));
      const items = shuffle(rng, mahali);
      return {
        kind: "ordering",
        prompt: "Panga sentensi hizi za kuelezea chumba cha Wanjiku kwa mpangilio sahihi unaozingatia mahali — kuanzia maelezo ya jumla ya chumba, kisha mlangoni, katikati, na mwishoni karibu na dirisha.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: mahali.map((m) => m.id),
        hint: "Mpangilio wa mahali huelekeza jicho la msomaji hatua kwa hatua kutoka sehemu moja hadi nyingine ya chumba.",
        explanation: mahali.map((m) => m.label).join(" → "),
      };
    }

    if (branch === "mpangilioMc") {
      const entry = randChoice(rng, MASWALI_MPANGILIO);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: entry.swali,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Mpangilio wa mahali hufuata sehemu za eneo; mpangilio wa kiwakati hufuata mfuatano wa muda.",
        explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
      };
    }

    if (branch === "mtuFill") {
      const mtu = randChoice(rng, WATU_MAELEZO);
      return {
        kind: "fill-blank",
        prompt: `Kamilisha kivumishi kinachofaa kuelezea tabia ya ${mtu.jina}, kulingana na sentensi: "${mtu.sentensiTabia}"`,
        before: `${mtu.jina} ni mtu`,
        after: ".",
        correctAnswer: mtu.kivumishiSahihi,
        inputMode: "text",
        hint: "Fikiria kuhusu tabia inayodhihirishwa na matendo yaliyoelezwa katika sentensi.",
        explanation: `Kulingana na matendo yaliyoelezwa, ${mtu.jina} ni mtu ${mtu.kivumishiSahihi}.`,
      };
    }

    if (branch === "mtuMc") {
      const entry = randChoice(rng, MASWALI_MTU);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: entry.swali,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Zingatia sura, tabia na matendo ya mtu yanayodhihirisha tabia hiyo.",
        explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
      };
    }

    const mtu = randChoice(rng, WATU_MAELEZO);
    const choices = shuffle(rng, [mtu.kivumishiSahihi, ...mtu.kivumishiMbaya]);
    return {
      kind: "multiple-choice",
      prompt: `Soma sentensi hii: "${mtu.sentensiTabia}" Ni kivumishi kipi kinachofaa zaidi kuelezea tabia ya ${mtu.jina}?`,
      choices,
      correctIndex: choices.indexOf(mtu.kivumishiSahihi),
      layout: "list",
      hint: "Tafuta kivumishi kinacholingana na matendo yaliyoelezwa kwenye sentensi.",
      explanation: `Kulingana na matendo yaliyoelezwa, kivumishi kifaacho ni "${mtu.kivumishiSahihi}".`,
    };
  },
};
