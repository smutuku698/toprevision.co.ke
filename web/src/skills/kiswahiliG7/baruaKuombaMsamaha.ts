import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE: { id: string; label: string; maelezo: string }[] = [
  { id: "anwanimwandishi", label: "Anwani ya mwandishi na tarehe", maelezo: "Anwani ya posta ya mwandishi na tarehe, kwenye kona ya juu kulia" },
  { id: "anwanimpokeaji", label: "Anwani ya mpokeaji", maelezo: "Jina na cheo cha mpokeaji pamoja na anwani yake, kushoto kabla ya mtajo — kipengele kisichokuwepo katika barua ya kirafiki" },
  { id: "mtajorasmi", label: "Mtajo rasmi", maelezo: "Salamu rasmi kama 'Mheshimiwa Mwalimu Mkuu,' badala ya mtajo wa kirafiki" },
  { id: "utangulizi", label: "Aya ya utangulizi", maelezo: "Kueleza kusudi la barua — kuomba radhi kwa dhati kuhusu jambo mahususi" },
  { id: "kiini", label: "Aya ya kiini", maelezo: "Maelezo ya kina kuhusu kosa lililotendwa na sababu zake, bila kujitetea kupita kiasi" },
  { id: "hitimisho", label: "Aya ya hitimisho", maelezo: "Kuomba radhi tena na kuahidi hatua za kurekebisha jambo hilo" },
  { id: "kimalizio", label: "Kimalizio rasmi", maelezo: "Maneno rasmi ya mwisho kama 'Wako mtiifu,' yakifuatiwa na jina kamili la mwandishi" },
];

const LUGHA_RASMI = [
  "Ninaandika barua hii kwa nia ya kuomba radhi kwa dhati kwa kuchelewa kufika shuleni wiki iliyopita.",
  "Ninatambua kosa langu na naomba unisamehe kwa usumbufu niliousababisha.",
  "Naahidi kutorudia kosa hili tena na kuzingatia sheria za shule ipasavyo.",
  "Natumaini utakubali ombi langu la radhi na kuendelea kunipa fursa ya kujirekebisha.",
];

const LUGHA_KIRAFIKI_ISIYOFAA = [
  "Samahani sana kaka, sitarudia tena, tafadhali!",
  "Pole sana rafiki, nilikosea, lakini tuendelee kama kawaida sawa?",
  "Radhi tu bro, ilikuwa bahati mbaya, sawa?",
  "Sorry sana, sitafanya hivyo tena, promise!",
];

const MISTATILI: { mkosaji: string; sababu: string; mpokeaji: string }[] = [
  { mkosaji: "Mwanafunzi", sababu: "kuchelewa kufika shuleni mara kadhaa wiki iliyopita", mpokeaji: "Mwalimu Mkuu" },
  { mkosaji: "Mzazi", sababu: "kuchelewesha malipo ya karo ya muhula", mpokeaji: "Mhasibu wa shule" },
  { mkosaji: "Kiongozi wa darasa", sababu: "kushindwa kuwasilisha ripoti ya mkutano wa darasa kwa wakati", mpokeaji: "Mwalimu wa darasa" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Barua rasmi ya kuomba msamaha huandikwa lini hasa?",
    sahihi: "Mtu anapotaka kuomba radhi rasmi kwa mtu mwenye mamlaka au wadhifa fulani kuhusu kosa alilotenda",
    makosa: [
      "Mtu anapotaka kumkaribisha rafiki kwenye sherehe",
      "Mtu anapotaka kutoa taarifa ya matukio ya hivi karibuni",
      "Mtu anapotaka kumshukuru rafiki kwa msaada aliopewa",
    ],
  },
  {
    swali: "Kipengele gani kinapatikana katika barua rasmi ya kuomba msamaha lakini hakipo katika barua ya kirafiki?",
    sahihi: "Anwani ya mpokeaji, ikiwa na jina na cheo chake, kabla ya mtajo",
    makosa: [
      "Anwani ya mwandishi na tarehe",
      "Aya ya kiini yenye maelezo",
      "Jina la mwandishi mwishoni",
    ],
  },
  {
    swali: "Aya ya kiini katika barua rasmi ya kuomba msamaha inapaswa kuwa na nini?",
    sahihi: "Maelezo ya kina kuhusu kosa lililotendwa na sababu zake, bila kujitetea kupita kiasi",
    makosa: [
      "Orodha ya mafanikio ya awali ya mwandishi",
      "Maelezo ya matukio yasiyohusiana na kosa",
      "Malalamiko dhidi ya mpokeaji wa barua",
    ],
  },
  {
    swali: "Ni ipi kati ya sentensi zifuatazo inayofaa zaidi lugha rasmi ya barua ya kuomba msamaha kwa mwalimu mkuu?",
    sahihi: "Ninatambua kosa langu na naomba unisamehe kwa usumbufu niliousababisha.",
    makosa: [
      "Samahani sana kaka, sitarudia tena, tafadhali!",
      "Radhi tu bro, ilikuwa bahati mbaya, sawa?",
      "Sorry sana, sitafanya hivyo tena, promise!",
    ],
  },
];

export const baruaKuombaMsamaha: Skill = {
  id: "g7-ksw-ka-barua-kuomba-msamaha",
  code: "KA.9",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Barua Rasmi ya Kuomba Msamaha",
  description: "Tambua umuhimu, ujumbe, muundo rasmi na lugha rasmi ifaayo katika barua ya kuomba msamaha.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.maelezo })));
      const targets = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.label })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE) correctMap[v.id] = v.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha barua rasmi ya kuomba msamaha na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Barua rasmi huwa na anwani ya mwandishi NA ya mpokeaji, mtajo rasmi, na kimalizio rasmi — tofauti na barua ya kirafiki.",
        explanation: VIPENGELE.map((v) => `${v.label} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, VIPENGELE);
      return {
        kind: "ordering",
        prompt: "Panga vipengele vya barua rasmi ya kuomba msamaha kwa mpangilio sahihi.",
        instruction: "Bofya kwa mpangilio sahihi, kutoka juu hadi chini.",
        items,
        correctOrder: VIPENGELE.map((v) => v.id),
        hint: "Barua rasmi huanza na anwani ya mwandishi na tarehe, kisha anwani ya mpokeaji, mtajo rasmi, utangulizi, kiini, hitimisho, na kimalizio rasmi.",
        explanation: VIPENGELE.map((v) => v.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const rasmi = shuffle(rng, LUGHA_RASMI).slice(0, 3);
      const kirafiki = shuffle(rng, LUGHA_KIRAFIKI_ISIYOFAA).slice(0, 3);
      const items = shuffle(rng, [
        ...rasmi.map((label) => ({ id: `r-${label}`, label, bucket: "rasmi" })),
        ...kirafiki.map((label) => ({ id: `k-${label}`, label, bucket: "kirafiki" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na kama zinafaa lugha rasmi ya barua ya kuomba msamaha, au ni za kirafiki mno kwa muktadha rasmi.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "rasmi", label: "Lugha Rasmi Inayofaa" },
          { id: "kirafiki", label: "Kirafiki Mno kwa Muktadha Rasmi" },
        ],
        correctBucket,
        hint: "Barua rasmi ya kuomba msamaha hutumia lugha ya heshima na uzito, si maneno ya kawaida ya rafiki.",
        explanation: `Lugha rasmi inayofaa: ${rasmi.join(" / ")}. Kirafiki mno kwa muktadha rasmi: ${kirafiki.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const m = randChoice(rng, MISTATILI);
      return {
        kind: "fill-blank",
        prompt: `${m.mkosaji} anaandika barua rasmi ya kuomba msamaha kwa ${m.mpokeaji} kwa sababu ya ${m.sababu}. Kamilisha mtajo rasmi unaofaa barua hii.`,
        before: "",
        after: ` ${m.mpokeaji},`,
        correctAnswer: "Mheshimiwa",
        inputMode: "text",
        hint: "Mtajo rasmi hutumia neno la heshima kabla ya cheo cha mpokeaji, si jina la kawaida.",
        explanation: `Barua rasmi hutumia mtajo wa heshima kama "Mheshimiwa ${m.mpokeaji}," badala ya mtajo wa kirafiki.`,
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
      hint: "Zingatia ujumbe, muundo rasmi (anwani mbili, mtajo rasmi, kimalizio rasmi) na lugha ya heshima.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
