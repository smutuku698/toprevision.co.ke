import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const TAARIFA_HEWA =
  "Taarifa ya hali ya hewa: Leo jijini Nairobi, kutakuwa na jua kali asubuhi, lakini mawingu meusi yanatarajiwa kujitokeza alasiri huku mvua ndogo ikinyesha kati ya saa nane na saa kumi. Wakazi wanashauriwa kubeba mwavuli wanapotoka nyumbani baada ya adhuhuri.";

const TANGAZO_SAFARI =
  "Wanafunzi wa Gredi ya Saba, Shule ya Msingi Kericho, watasafiri kwenda Hifadhi ya Maasai Mara Ijumaa hii. Basi litaondoka saa mbili asubuhi kutoka uwanja wa shule, na wanafunzi wanatakiwa kuwahi kabla ya saa moja na nusu.";

const TANGAZO_MNADA =
  "Kijiji cha Matuu kitafanya mnada wa mifugo Jumamosi ijayo. Wafugaji wanaalikwa kuleta ng'ombe, mbuzi, na kondoo wao kuanzia saa tatu asubuhi hadi mchana, kisha mnada utafungwa saa saba.";

const MSAMIATI: { neno: string; maana: string }[] = [
  { neno: "mwavuli", maana: "kifaa cha kujikinga na mvua au jua" },
  { neno: "mnada", maana: "mahali au tukio la kuuza mifugo au bidhaa kwa mnadi" },
  { neno: "hifadhi", maana: "eneo lililotengwa kulinda wanyamapori" },
  { neno: "kutabiri", maana: "kukisia kitakachotokea kabla hakijatokea" },
];

const KWELI_SIO_KWELI = [
  { text: "Mvua inatarajiwa kunyesha Nairobi alasiri.", isTrue: true },
  { text: "Wanafunzi wa Kericho watasafiri Jumatatu.", isTrue: false },
  { text: "Mnada wa Matuu utafanyika Jumamosi.", isTrue: true },
  { text: "Basi la wanafunzi litaondoka saa nane mchana.", isTrue: false },
];

const HATUA_KUTABIRI = [
  { id: "kichwa", label: "Zingatia kichwa au anwani ya taarifa unayosikiliza" },
  { id: "vidokezo", label: "Tambua vidokezo vilivyotolewa, kama toni ya mzungumzaji" },
  { id: "unganisha", label: "Unganisha vidokezo hivyo na ujuzi wako wa awali" },
  { id: "tabiri", label: "Tabiri kitakachotokea au atakachofanya mhusika" },
  { id: "thibitisha", label: "Thibitisha utabiri wako unaposikiliza sehemu inayofuata" },
];

export const kusikilizaKwaKufasiriNaUfahamu: Skill = {
  id: "g7-ksw-kz-kusikiliza-kwa-kufasiri-na-ufahamu",
  code: "KZ.5",
  subjectId: "kiswahili",
  strandId: "g7-ksw-kz",
  grade: 7,
  title: "Kusikiliza kwa Kufasiri na Ufahamu",
  description: "Sikiliza matini mbalimbali, fasiri ujumbe wake, tabiri kitakachotokea, na ueleze msamiati kimuktadha.",
  generate(rng) {
    const branch = randChoice(rng, ["taarifa-hewa", "tangazo-ufahamu", "oanisha-msamiati", "jaza-msamiati", "kweli-sio-kweli", "hatua-kutabiri"] as const);

    if (branch === "taarifa-hewa") {
      const days = [
        { label: "Asubuhi", condition: "sunny" as const },
        { label: "Alasiri", condition: "rainy" as const },
      ];
      const sahihi = "Kubeba mwavuli baada ya adhuhuri kwa sababu ya mvua inayotarajiwa";
      const makosa = [
        "Kubeba koti nzito kwa sababu ya baridi kali siku nzima",
        "Kutobeba chochote kwa sababu hali ya hewa itakuwa shwari siku nzima",
        "Kubeba miwani ya jua alasiri kwa sababu jua litakuwa kali zaidi",
      ];
      const choices = shuffle(rng, [sahihi, ...makosa]);
      return {
        kind: "multiple-choice",
        passage: TAARIFA_HEWA,
        prompt: "Kwa mujibu wa taarifa hii ya hali ya hewa, ni tahadhari gani inayofaa kuchukuliwa alasiri?",
        visual: { type: "weather", days },
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "list",
        hint: "Fasiri vidokezo vya taarifa — mawingu meusi na mvua ndogo ni ishara ya nini?",
        explanation: `Taarifa inasema mvua itanyesha alasiri, hivyo jibu sahihi ni: "${sahihi}".`,
      };
    }

    if (branch === "tangazo-ufahamu") {
      const passage = randChoice(rng, [TANGAZO_SAFARI, TANGAZO_MNADA]);
      const isSafari = passage === TANGAZO_SAFARI;
      const sahihi = isSafari ? "Wanafunzi wanatakiwa kuwahi kabla ya saa moja na nusu asubuhi" : "Wafugaji wanaalikwa kuleta mifugo kuanzia saa tatu asubuhi";
      const makosa = isSafari
        ? ["Basi litaondoka jioni baada ya masomo", "Safari hiyo ni ya kwenda mjini Kericho", "Wanafunzi hawahitaji kuwahi kwa wakati wowote"]
        : ["Mnada utafanyika Jumapili badala ya Jumamosi", "Mnada utafunguliwa saa saba na kufungwa saa tatu", "Mnada huo ni wa kuuza mazao ya shambani pekee"];
      const choices = shuffle(rng, [sahihi, ...makosa]);
      return {
        kind: "multiple-choice",
        passage,
        prompt: "Ni ujumbe upi sahihi kutokana na tangazo hili?",
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "list",
        hint: "Dondoa habari mahususi kutoka kwenye tangazo — nani, nini, wapi, na lini.",
        explanation: `Jibu sahihi ni: "${sahihi}", kama ilivyoelezwa katika tangazo.`,
      };
    }

    if (branch === "oanisha-msamiati") {
      const chosen = shuffle(rng, MSAMIATI).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila neno na maana yake kulingana na matini uliyosikiliza hapo awali.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria muktadha wa taarifa za hali ya hewa, safari, na mnada.",
        explanation: chosen.map((m) => `"${m.neno}" humaanisha "${m.maana}".`).join(" "),
      };
    }

    if (branch === "jaza-msamiati") {
      const entry = randChoice(rng, MSAMIATI);
      return {
        kind: "fill-blank",
        prompt: "Andika neno linalofaa kukamilisha sentensi.",
        before: `Neno linalomaanisha "${entry.maana}" ni`,
        after: ".",
        correctAnswer: entry.neno,
        inputMode: "text",
        hint: "Rejelea msamiati uliotumika katika taarifa na matangazo uliyosikiliza.",
        explanation: `Neno linalomaanisha "${entry.maana}" ni "${entry.neno}".`,
      };
    }

    if (branch === "kweli-sio-kweli") {
      const items = KWELI_SIO_KWELI.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "Kweli" : "Sio Kweli" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kauli kama Kweli au Sio Kweli, kulingana na taarifa na matangazo uliyosikiliza.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Kweli", label: "Kweli" },
          { id: "Sio Kweli", label: "Sio Kweli" },
        ],
        correctBucket,
        hint: "Rejelea maelezo mahususi ya wakati na tarehe yaliyotolewa.",
        explanation: KWELI_SIO_KWELI.map((s) => `"${s.text}" ni ${s.isTrue ? "kweli" : "sio kweli"}.`).join(" "),
      };
    }

    const items = shuffle(rng, HATUA_KUTABIRI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kutabiri kitakachotokea unaposikiliza matini kwa mpangilio unaofaa.",
      instruction: "Bofya kwa mpangilio sahihi kuanzia mwanzo hadi mwisho.",
      items,
      correctOrder: HATUA_KUTABIRI.map((h) => h.id),
      hint: "Anza kwa kuzingatia vidokezo, kisha unganishe na ujuzi wako, ndipo utabiri.",
      explanation: HATUA_KUTABIRI.map((h) => h.label).join(" → "),
    };
  },
};
