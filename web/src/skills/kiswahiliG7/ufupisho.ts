import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Aya {
  text: string;
  habariKuuSahihi: string;
  habariKuuPotovu: string[];
  muhtasariSahihi: string;
  muhtasariPotovu: string[];
  vipengele: { id: string; label: string }[]; // in correct summary order
  kategoria: { label: string; kuu: boolean }[];
}

const AYA_LIST: Aya[] = [
  {
    text: "Kila mwaka, Kenya hupoteza maeneo makubwa ya misitu kutokana na ukataji miti hovyo kwa ajili ya mkaa na mbao. Upotevu huu wa misitu huathiri mzunguko wa mvua na kusababisha ukame katika baadhi ya maeneo. Serikali kwa kushirikiana na mashirika ya kiraia imeanzisha kampeni za kupanda miti milioni kadhaa kila mwaka ili kurejesha uoto wa asili. Wananchi wanahimizwa kupanda mti mmoja kila wanapokata mmoja, ili kudumisha uwiano wa mazingira.",
    habariKuuSahihi: "Kenya inakabiliwa na upotevu wa misitu na inajaribu kurejesha uoto kupitia kampeni za kupanda miti.",
    habariKuuPotovu: [
      "Kenya haina misitu yoyote iliyobaki.",
      "Wananchi wote wamekatazwa kukata miti kabisa.",
      "Mvua nchini Kenya haihusiani na misitu kwa vyovyote.",
    ],
    muhtasariSahihi: "Ukataji miti hovyo unaathiri mvua na kusababisha ukame, hivyo Kenya inaendesha kampeni za kupanda miti kurejesha misitu.",
    muhtasariPotovu: [
      "Kenya inahimiza wananchi kukata miti zaidi kila mwaka.",
      "Ukame nchini Kenya hausababishwi na chochote kinachohusiana na miti.",
      "Serikali imeamua kuacha kabisa kushughulikia suala la misitu.",
    ],
    vipengele: [
      { id: "p1", label: "Kenya inapoteza misitu kutokana na ukataji miti hovyo" },
      { id: "p2", label: "Upotevu wa misitu huathiri mvua na kusababisha ukame" },
      { id: "p3", label: "Serikali na mashirika wameanzisha kampeni za kupanda miti" },
      { id: "p4", label: "Wananchi wanahimizwa kupanda mti kila wanapokata mmoja" },
    ],
    kategoria: [
      { label: "Kenya inapoteza misitu kwa ukataji hovyo", kuu: true },
      { label: "Upotevu wa misitu huathiri mvua na kusababisha ukame", kuu: true },
      { label: "Kampeni za kupanda miti zimeanzishwa kurejesha uoto", kuu: true },
      { label: "Wanafunzi wa shule za msingi walipanda maua ya rangi shuleni", kuu: false },
      { label: "Bei ya mbao imepanda maradufu mwaka huu sokoni", kuu: false },
    ],
  },
  {
    text: "Huduma za pesa za simu kama M-Pesa zimebadilisha jinsi Wakenya wanavyofanya biashara na kutuma pesa. Badala ya kusafiri umbali mrefu kupeleka pesa kwa jamaa vijijini, mtu anaweza kutuma pesa kwa dakika chache tu kwa kutumia simu yake. Hata hivyo, baadhi ya watumiaji hupoteza pesa zao kwa walaghai wanaowadanganya kupitia simu wakijifanya ni wafanyakazi wa kampuni za simu. Wataalamu wanashauri watumiaji kutoshiriki nambari zao za siri (PIN) na mtu yeyote, hata akijidai ni afisa wa kampuni.",
    habariKuuSahihi: "Pesa za simu zimerahisisha utumaji wa pesa lakini pia zimeleta hatari ya ulaghai.",
    habariKuuPotovu: [
      "Hakuna mtu anayetumia pesa za simu nchini Kenya.",
      "Pesa za simu ni salama kabisa bila hatari yoyote.",
      "Wataalamu wanapendekeza watumiaji waache kutumia simu kabisa.",
    ],
    muhtasariSahihi: "M-Pesa imerahisisha utumaji wa pesa, lakini watumiaji wanapaswa kuwa waangalifu wasidanganywe na walaghai kutoa PIN zao.",
    muhtasariPotovu: [
      "M-Pesa haina uhusiano wowote na utumaji wa pesa.",
      "Watumiaji wanashauriwa kutoa PIN zao kwa mtu yeyote anayeuliza.",
      "Ulaghai kupitia simu haujawahi kutokea nchini Kenya.",
    ],
    vipengele: [
      { id: "p1", label: "Pesa za simu kama M-Pesa zimerahisisha kutuma pesa haraka" },
      { id: "p2", label: "Watu hawahitaji tena kusafiri umbali mrefu kupeleka pesa" },
      { id: "p3", label: "Baadhi ya walaghai hudanganya watumiaji kupitia simu" },
      { id: "p4", label: "Wataalamu wanashauri watumiaji wasitoe PIN yao kwa mtu yeyote" },
    ],
    kategoria: [
      { label: "M-Pesa imerahisisha utumaji wa pesa kwa dakika chache", kuu: true },
      { label: "Watu hawahitaji tena kusafiri umbali mrefu kupeleka pesa", kuu: true },
      { label: "Walaghai hudanganya watumiaji kupitia simu wakijifanya ni wafanyakazi", kuu: true },
      { label: "Simu za bei nafuu zimeuzwa sana mwaka huu sokoni", kuu: false },
      { label: "Kampuni za simu zilianzishwa miaka mia moja iliyopita", kuu: false },
    ],
  },
  {
    text: "Wanafunzi wengi wa shule za upili hukesha usiku wakisoma au kutumia simu, wakiamini kuwa hilo huwasaidia kufaulu zaidi. Hata hivyo, wataalamu wa afya wanasema kukosa usingizi wa kutosha huathiri uwezo wa ubongo kukumbuka mambo yaliyosomwa. Kijana wa umri wa miaka kumi na tatu hadi kumi na tisa anahitaji angalau saa nane za usingizi kila usiku ili mwili na akili vifanye kazi vizuri. Wazazi na walimu wanashauriwa kuwasaidia vijana kupanga ratiba nzuri ya kulala na kuamka.",
    habariKuuSahihi: "Usingizi wa kutosha ni muhimu kwa vijana kufaulu masomoni, hivyo hawapaswi kukesha bila sababu.",
    habariKuuPotovu: [
      "Vijana wote wanapaswa kukesha kila usiku ili wafaulu zaidi.",
      "Usingizi hauhusiani kabisa na uwezo wa kukumbuka mambo.",
      "Wazazi hawana jukumu lolote katika usingizi wa watoto wao.",
    ],
    muhtasariSahihi: "Kukosa usingizi wa kutosha huathiri ukumbukaji wa vijana, hivyo wanahitaji angalau saa nane za usingizi na msaada wa wazazi kupanga ratiba.",
    muhtasariPotovu: [
      "Kukesha usiku wote ndiyo njia bora ya kufaulu mtihani.",
      "Vijana hawahitaji usingizi wowote maalum kila siku.",
      "Ubongo hauhitaji kupumzika baada ya masomo.",
    ],
    vipengele: [
      { id: "p1", label: "Wanafunzi wengi hukesha wakiamini itawasaidia kufaulu" },
      { id: "p2", label: "Kukosa usingizi huathiri uwezo wa kukumbuka yaliyosomwa" },
      { id: "p3", label: "Vijana wanahitaji angalau saa nane za usingizi kila usiku" },
      { id: "p4", label: "Wazazi na walimu wanashauriwa kuwasaidia kupanga ratiba ya kulala" },
    ],
    kategoria: [
      { label: "Wanafunzi wengi hukesha wakiamini itawasaidia kufaulu", kuu: true },
      { label: "Kukosa usingizi huathiri uwezo wa ubongo kukumbuka", kuu: true },
      { label: "Vijana wanahitaji angalau saa nane za usingizi kila usiku", kuu: true },
      { label: "Shule nyingi huanza masomo saa moja na nusu asubuhi", kuu: false },
      { label: "Baadhi ya wanafunzi hupenda kucheza mpira jioni", kuu: false },
    ],
  },
];

const ISTILAHI: { neno: string; maana: string }[] = [
  { neno: "Ufupisho", maana: "Kitendo cha kupunguza kifungu kirefu kuwa habari fupi inayobeba maana kuu" },
  { neno: "Habari Kuu", maana: "Wazo kuu linalojitokeza katika aya au kifungu" },
  { neno: "Muhtasari", maana: "Maelezo mafupi yanayowasilisha ujumbe mzima wa kifungu kwa sentensi chache" },
  { neno: "Mpangilio wa Habari", maana: "Jinsi mawazo yanavyofuatana kimantiki kutoka mwanzo hadi mwisho" },
];

export const ufupisho: Skill = {
  id: "g7-ksw-ks-ufupisho",
  code: "KS.7",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Ufupisho",
  description: "Tambua habari kuu za aya, chagua muhtasari sahihi wa kifungu kizima, na upange habari kwa mpangilio ufaao.",
  generate(rng) {
    const branch = randChoice(rng, ["habariKuu", "muhtasari", "panga", "fill", "kategoria", "istilahi"] as const);
    const hint = "Habari kuu ni wazo linalotawala aya nzima, si maelezo madogo ya ziada.";

    if (branch === "istilahi") {
      const tokens = shuffle(rng, ISTILAHI.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, ISTILAHI.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of ISTILAHI) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila istilahi ya ufupisho na maana yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: ISTILAHI.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu ufupisho.",
        before: "Kitendo cha kupunguza kifungu kirefu kuwa habari fupi inayobeba maana kuu huitwa",
        after: ".",
        correctAnswer: "ufupisho",
        inputMode: "text",
        hint: "Fikiria neno linaloelezea kufanya kifungu kirefu kiwe kifupi bila kupoteza maana.",
        explanation: "Ufupisho ni kitendo cha kupunguza kifungu kirefu kuwa habari fupi inayobeba maana kuu pekee.",
      };
    }

    const aya = randChoice(rng, AYA_LIST);

    if (branch === "kategoria") {
      const items = aya.kategoria.map((k, i) => ({ id: `k${i}`, label: k.label, b: k.kuu ? "kuu" : "ziada" }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
      return {
        kind: "categorize",
        passage: aya.text,
        prompt: "Panga kila sentensi: je, ni sehemu ya habari kuu ya aya au ni jambo lisilomo katika aya?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "kuu", label: "Yafaa Kuwa Katika Ufupisho" },
          { id: "ziada", label: "Havifai — Hayamo Katika Aya" },
        ],
        correctBucket,
        hint: "Ufupisho mzuri hujumuisha habari zilizomo kwenye aya pekee, si mambo yaliyobuniwa.",
        explanation: aya.kategoria.map((k) => `"${k.label}" ${k.kuu ? "yamo katika aya na yanafaa kuwa katika ufupisho" : "hayamo katika aya, hivyo hayafai kwenye ufupisho"}.`).join(" "),
      };
    }

    if (branch === "panga") {
      const items = shuffle(rng, aya.vipengele);
      return {
        kind: "ordering",
        passage: aya.text,
        prompt: "Panga vipengele vifuatavyo vya ufupisho kwa mpangilio ufaao wa habari kama zinavyojitokeza katika aya.",
        instruction: "Bofya vipengele kwa mfuatano sahihi.",
        items,
        correctOrder: aya.vipengele.map((v) => v.id),
        hint: "Fuata mpangilio wa mawazo kama yanavyojitokeza katika aya, kutoka mwanzo hadi mwisho.",
        explanation: aya.vipengele.map((v) => v.label).join(" → "),
      };
    }

    if (branch === "muhtasari") {
      const choices = shuffle(rng, [aya.muhtasariSahihi, ...aya.muhtasariPotovu]);
      return {
        kind: "multiple-choice",
        passage: aya.text,
        prompt: "Ni muhtasari upi unaowakilisha vyema kifungu hiki kizima?",
        choices,
        correctIndex: choices.indexOf(aya.muhtasariSahihi),
        layout: "list",
        hint,
        explanation: `Muhtasari bora ni: "${aya.muhtasariSahihi}" — unadondoa hoja kuu bila maelezo ya ziada yasiyo ya lazima.`,
      };
    }

    const choices = shuffle(rng, [aya.habariKuuSahihi, ...aya.habariKuuPotovu]);
    return {
      kind: "multiple-choice",
      passage: aya.text,
      prompt: "Ni sentensi ipi inayoeleza vyema habari kuu ya aya hii?",
      choices,
      correctIndex: choices.indexOf(aya.habariKuuSahihi),
      layout: "list",
      hint,
      explanation: `Habari kuu ni: "${aya.habariKuuSahihi}" — hii ndiyo wazo linalotawala aya nzima.`,
    };
  },
};
