import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// mada 8.2.1 / 9.2.1 (Afya ya Akili): kusoma kwa ufahamu vifungu vifupi kuhusu hisia, mfadhaiko na
// njia za kukabiliana nao — msamiati, wazo kuu, na hatua za kujitunza. Maudhui yanaegemea kwa
// kuzungumza na watu wanaoaminika, kupumzika na michezo — bila kutumia lugha ya kimatibabu.

interface Kifungu {
  text: string;
  wazoKuuSahihi: string;
  wazoKuuPotovu: string[];
  msamiati: { neno: string; maana: string }[];
  matumizi: { neno: string; before: string; after: string };
}

const VIFUNGU: Kifungu[] = [
  {
    text: "Akinyi alikuwa na wasiwasi kuhusu mtihani wa hisabati uliokaribia. Kila alipofikiria mtihani huo, alihisi mfadhaiko mkubwa moyoni. Siku moja, aliamua kumweleza mwalimu wake jinsi alivyokuwa akihisi. Mwalimu alimsikiliza kwa makini na kumpa faraja, akimwambia arudie masomo kidogo kidogo kila siku badala ya kukariri kila kitu usiku mmoja. Baada ya kuzungumza na mwalimu, Akinyi alihisi utulivu zaidi. Jioni hiyo, alicheza netiboli na marafiki zake ili kupumzisha akili yake.",
    wazoKuuSahihi: "Akinyi alishinda wasiwasi wake wa mtihani kwa kuzungumza na mwalimu na kupumzisha akili kwa michezo.",
    wazoKuuPotovu: [
      "Akinyi aliamua kuacha kabisa kusoma kwa sababu ya wasiwasi wake.",
      "Mwalimu alimkasirikia Akinyi kwa kuwa na wasiwasi wa mtihani.",
      "Akinyi alicheza netiboli badala ya kuandika mtihani wake.",
    ],
    msamiati: [
      { neno: "wasiwasi", maana: "hisia ya hofu au mashaka kuhusu jambo litakalotokea" },
      { neno: "mfadhaiko", maana: "shinikizo la kihisia linalosababishwa na changamoto za maisha" },
      { neno: "faraja", maana: "hisia ya utulivu inayopatikana baada ya kusaidiwa au kutiwa moyo" },
    ],
    matumizi: { neno: "faraja", before: "Baada ya kuzungumza na mzazi wangu, nilipata", after: "kubwa moyoni." },
  },
  {
    text: "Kevin alihisi huzuni baada ya wazazi wake kugombana usiku uliopita. Hakupenda kuzungumza na mtu yeyote shuleni na alionekana mnyonge kuliko kawaida. Rafiki yake wa karibu alimwuliza kama kuna jambo linalomsumbua. Kevin alimweleza kila kitu, na rafiki yake alimsikiliza bila kumhukumu. Baadaye, Kevin alizungumza pia na babu yake, ambaye alimhakikishia kuwa mambo yangetengemaa. Kevin alihisi faraja kubwa baada ya kuzungumza na watu wawili aliowaamini, na aliweza kucheza mpira wa miguu jioni hiyo akiwa na furaha zaidi.",
    wazoKuuSahihi: "Kevin alipata faraja kwa kuzungumza na rafiki na babu yake baada ya kuhisi huzuni.",
    wazoKuuPotovu: [
      "Kevin aliamua kutozungumza na mtu yeyote kuhusu hisia zake.",
      "Rafiki wa Kevin alimhukumu kwa kuwa na huzuni.",
      "Wazazi wa Kevin walimpiga kwa sababu ya huzuni yake.",
    ],
    msamiati: [
      { neno: "huzuni", maana: "hisia ya majonzi au kutokuwa na furaha" },
      { neno: "kuaminiana", maana: "hali ya watu wawili kuwa na uhakika kila mmoja atamsaidia mwenzake bila hila" },
      { neno: "kutengemaa", maana: "kurudi katika hali njema au ya kawaida baada ya changamoto" },
    ],
    matumizi: { neno: "kuaminiana", before: "Rafiki wa kweli ni yule tunaoshirikiana naye kwa", after: "bila kificho." },
  },
  {
    text: "Wanafunzi wa Shule ya Msingi Kericho walijifunza kuhusu afya ya akili wikendi iliyopita. Mwalimu wao aliwaeleza kuwa ni kawaida kuhisi hisia mbalimbali kama furaha, hasira au huzuni, na kwamba hisia hizo si mbaya. Aliwaonyesha jinsi ya kufanya mazoezi ya kupumua polepole wanapohisi wasiwasi. Pia aliwahimiza kuzungumza na mzazi au mwalimu wanapohisi mzigo mkubwa wa hisia, badala ya kujitenga na wenzao. Wanafunzi walifurahia somo hilo na waliahidi kutumia mazoezi ya kupumua wanapohisi msongo wa mawazo.",
    wazoKuuSahihi: "Wanafunzi wa Kericho walijifunza kuwa hisia zote ni za kawaida na jinsi ya kukabiliana nazo kwa mazoezi ya kupumua na kuzungumza na watu wanaowaamini.",
    wazoKuuPotovu: [
      "Mwalimu aliwaambia wanafunzi kuwa hisia za hasira na huzuni ni mbaya na hazipaswi kutokea kamwe.",
      "Wanafunzi walifundishwa kujitenga na wenzao wanapohisi msongo wa mawazo.",
      "Somo hilo lilihusu tu michezo ya darasani, si hisia za wanafunzi.",
    ],
    msamiati: [
      { neno: "msongo wa mawazo", maana: "hali ya kuhisi shinikizo kubwa la kifikira kutokana na mambo mengi ya kufikiria" },
      { neno: "mazoezi ya kupumua", maana: "kuvuta na kutoa pumzi polepole kwa lengo la kutuliza akili" },
      { neno: "kujitenga", maana: "kujiweka mbali na watu wengine kwa muda mrefu" },
    ],
    matumizi: { neno: "mazoezi ya kupumua", before: "Mwalimu alituonyesha jinsi ya kufanya", after: "ili kutuliza akili zetu." },
  },
  {
    text: "Fatuma alihamia shule mpya jijini Mombasa na mwanzoni alihisi upweke kwa sababu hakuwa na marafiki. Alikosa hamu ya kucheza wakati wa mapumziko na mara nyingi alikaa peke yake. Mwalimu wake alimgundua na kumwuliza jinsi alivyokuwa akihisi. Fatuma alieleza hisia zake kwa uwazi. Mwalimu alimtambulisha kwa kikundi cha wanafunzi wanaopenda muziki, na Fatuma alijiunga na klabu ya muziki shuleni. Baada ya wiki mbili, Fatuma alikuwa na marafiki wapya na alihisi furaha na faraja shuleni.",
    wazoKuuSahihi: "Fatuma alishinda upweke wake shuleni mpya kwa kueleza hisia zake na kujiunga na klabu ya muziki.",
    wazoKuuPotovu: [
      "Fatuma aliendelea kukaa peke yake hadi mwisho wa hadithi bila kupata marafiki.",
      "Mwalimu alimwacha Fatuma peke yake bila kumsaidia.",
      "Fatuma alihamishwa tena shule nyingine kwa sababu ya upweke wake.",
    ],
    msamiati: [
      { neno: "upweke", maana: "hisia ya kutokuwa na mtu wa kushirikiana naye" },
      { neno: "kujiunga", maana: "kuwa mwanachama wa kikundi au shughuli fulani" },
      { neno: "kutambua hisia", maana: "kufahamu kwa uwazi jinsi unavyohisi kihisia kwa wakati fulani" },
    ],
    matumizi: { neno: "upweke", before: "Mtoto aliyehamia shule mpya mara nyingi huhisi", after: "mwanzoni." },
  },
];

const VOCAB_CLUSTERS = {
  hisia: [
    { neno: "mfadhaiko", maana: "shinikizo la kihisia linalosababishwa na changamoto za maisha" },
    { neno: "wasiwasi", maana: "hisia ya hofu au mashaka kuhusu jambo litakalotokea" },
    { neno: "huzuni", maana: "hisia ya majonzi au kutokuwa na furaha" },
    { neno: "hasira", maana: "hisia kali ya kutoridhika inayotokea jambo linapoenda kinyume na matarajio" },
    { neno: "furaha", maana: "hisia ya uradhi na raha moyoni" },
    { neno: "utulivu", maana: "hali ya akili kuwa shwari bila msukosuko" },
  ],
  vitendo: [
    { neno: "kupumzika", maana: "kuachana na shughuli kwa muda ili mwili na akili virejeshe nguvu" },
    { neno: "michezo", maana: "shughuli kama mpira au netiboli zinazosaidia kupunguza mfadhaiko" },
    { neno: "kuzungumza", maana: "kueleza kwa maneno hisia au mawazo yako kwa mtu mwingine" },
    { neno: "mazoezi ya kupumua", maana: "kuvuta na kutoa pumzi polepole ili kutuliza akili" },
    { neno: "kulala vizuri", maana: "kupata usingizi wa kutosha ili mwili na akili vipumzike vyema" },
  ],
  msaada: [
    { neno: "faraja", maana: "hisia ya utulivu inayopatikana baada ya kusaidiwa au kutiwa moyo" },
    { neno: "kuaminiana", maana: "hali ya watu wawili kuwa na uhakika kila mmoja atamsaidia mwenzake" },
    { neno: "kujiamini", maana: "uwezo wa mtu kuamini nafsi yake na vipawa vyake" },
    { neno: "msongo wa mawazo", maana: "hali ya kuhisi shinikizo kubwa la kifikira kutokana na mambo mengi" },
  ],
};

const VOCAB_ALL = [...VOCAB_CLUSTERS.hisia, ...VOCAB_CLUSTERS.vitendo, ...VOCAB_CLUSTERS.msaada];

interface HaliMoja {
  label: string;
  bucket: "njema" | "msaada";
}

const HALI: HaliMoja[] = [
  { label: "Kuzungumza na mzazi kuhusu hisia zako", bucket: "njema" },
  { label: "Kucheza michezo na marafiki baada ya siku ngumu", bucket: "njema" },
  { label: "Kupumzika baada ya kazi ngumu shuleni", bucket: "njema" },
  { label: "Kulala saa za kutosha usiku", bucket: "njema" },
  { label: "Kufanya mazoezi ya kupumua ukiwa na wasiwasi", bucket: "njema" },
  { label: "Kushiriki katika shughuli unazozipenda kama muziki au sanaa", bucket: "njema" },
  { label: "Kula chakula bora mara kwa mara", bucket: "njema" },
  { label: "Kuzungumza na mwalimu kuhusu tatizo shuleni", bucket: "njema" },
  { label: "Kujitenga na marafiki kwa wiki nyingi bila sababu", bucket: "msaada" },
  { label: "Kulia mara kwa mara bila sababu dhahiri", bucket: "msaada" },
  { label: "Kukosa hamu ya kucheza michezo unayoipenda", bucket: "msaada" },
  { label: "Kukosa usingizi kwa siku nyingi mfululizo", bucket: "msaada" },
  { label: "Kutokula vizuri kwa muda mrefu", bucket: "msaada" },
  { label: "Kuhisi huzuni kubwa isiyoisha kwa wiki nyingi", bucket: "msaada" },
  { label: "Kuogopa kwenda shuleni bila sababu dhahiri", bucket: "msaada" },
];

interface FillTpl {
  before: string;
  after: string;
  correctAnswer: string;
  explanation: string;
}

const FILL_TEMPLATES: FillTpl[] = [
  {
    before: "Hali ya mtu kuhisi shinikizo la kihisia kutokana na changamoto za maisha huitwa",
    after: ".",
    correctAnswer: "mfadhaiko",
    explanation: "Mfadhaiko ni shinikizo la kihisia linalosababishwa na changamoto mbalimbali za maisha.",
  },
  {
    before: "Hisia ya utulivu inayopatikana baada ya kuzungumza na mtu unayemwamini huitwa",
    after: ".",
    correctAnswer: "faraja",
    explanation: "Faraja ni hisia ya utulivu tunayopata baada ya kusaidiwa au kutiwa moyo.",
  },
  {
    before: "Kitendo cha kuachana na shughuli kwa muda ili mwili na akili virejeshe nguvu huitwa",
    after: ".",
    correctAnswer: "kupumzika",
    explanation: "Kupumzika humpa mwili na akili nafasi ya kurejesha nguvu baada ya shughuli ngumu.",
  },
  {
    before: "Shughuli kama netiboli au mpira wa miguu zinazosaidia kupunguza mfadhaiko huitwa",
    after: ".",
    correctAnswer: "michezo",
    explanation: "Michezo ni njia nzuri ya kupunguza mfadhaiko na kufurahisha akili.",
  },
  {
    before: "Njia mojawapo bora ya kukabiliana na mfadhaiko ni kuzungumza na mzazi au",
    after: "unayemwamini shuleni.",
    correctAnswer: "mwalimu",
    explanation: "Kuzungumza na mtu mzima unayemwamini, kama mzazi au mwalimu, husaidia kupata faraja.",
  },
  {
    before: "Neno linalomaanisha kuhisi hofu au mashaka kuhusu jambo litakalotokea baadaye huitwa",
    after: ".",
    correctAnswer: "wasiwasi",
    explanation: "Wasiwasi ni hisia ya hofu au mashaka kuhusu jambo ambalo bado halijatokea.",
  },
  {
    before: "Uwezo wa mtu kuamini nafsi yake na vipawa vyake huitwa",
    after: ".",
    correctAnswer: "kujiamini",
    explanation: "Kujiamini humsaidia mtu kukabiliana na changamoto kwa moyo thabiti.",
  },
  {
    before: "Kuvuta na kutoa pumzi polepole ili kutuliza akili wakati wa wasiwasi huitwa mazoezi ya",
    after: ".",
    correctAnswer: "kupumua",
    explanation: "Mazoezi ya kupumua polepole husaidia kutuliza akili wakati wa wasiwasi au mfadhaiko.",
  },
  {
    before: "Hali ya watu wawili kuwa na uhakika kila mmoja atamsaidia mwenzake bila hila huitwa",
    after: ".",
    correctAnswer: "kuaminiana",
    explanation: "Kuaminiana ni msingi wa urafiki na msaada wa kihisia kati ya watu.",
  },
  {
    before: "Kupata usingizi wa kutosha usiku ili mwili na akili vipumzike vyema huitwa kulala",
    after: ".",
    correctAnswer: "vizuri",
    explanation: "Kulala vizuri ni sehemu muhimu ya kutunza afya ya akili na mwili.",
  },
];

const HATUA = [
  { id: "h1", label: "Tambua hisia zako kwa uwazi" },
  { id: "h2", label: "Zungumza na mtu unayemwamini kuhusu hisia hizo" },
  { id: "h3", label: "Fanya jambo la kufurahisha kama mchezo au sanaa" },
  { id: "h4", label: "Pumzika vizuri ili mwili na akili virejeshe nguvu" },
];

export const kusomaAfyaYaAkili: Skill = {
  id: "g6-ksw-ks-kusoma-afya-ya-akili",
  code: "KS.8",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ks",
  grade: 6,
  title: "Kusoma kwa Ufahamu: Afya ya Akili",
  description: "Soma vifungu vifupi kuhusu hisia na afya ya akili kisha utambue wazo kuu, msamiati wa hisia, na hatua nzuri za kujitunza.",
  generate(rng) {
    const branch = randChoice(rng, ["wazoKuu", "maana", "hali", "match", "fill", "order"] as const);
    const hint = "Fikiria kuhusu hisia zinazotajwa na hatua zinazochukuliwa kuzikabili kwa njia nzuri.";

    if (branch === "wazoKuu") {
      const kifungu = randChoice(rng, VIFUNGU);
      const choices = shuffle(rng, [kifungu.wazoKuuSahihi, ...kifungu.wazoKuuPotovu]);
      return {
        kind: "multiple-choice",
        passage: kifungu.text,
        prompt: "Ni wazo kuu lipi linalowakilisha vyema kifungu hiki?",
        choices,
        correctIndex: choices.indexOf(kifungu.wazoKuuSahihi),
        layout: "list",
        hint,
        explanation: `Wazo kuu ni: "${kifungu.wazoKuuSahihi}" — linadondoa jinsi mhusika alivyokabiliana na hisia zake kwa njia nzuri.`,
      };
    }

    if (branch === "maana") {
      const clusterKeys = Object.keys(VOCAB_CLUSTERS) as (keyof typeof VOCAB_CLUSTERS)[];
      const clusterKey = randChoice(rng, clusterKeys);
      const cluster = VOCAB_CLUSTERS[clusterKey];
      const target = randChoice(rng, cluster);
      const distractorPool = cluster.filter((v) => v.neno !== target.neno);
      const distractors = shuffle(rng, distractorPool).slice(0, Math.min(3, distractorPool.length));
      while (distractors.length < 3) {
        const outside = randChoice(rng, VOCAB_ALL.filter((v) => v.neno !== target.neno && !distractors.includes(v)));
        distractors.push(outside);
      }
      const choices = shuffle(rng, [target.maana, ...distractors.slice(0, 3).map((d) => d.maana)]);
      return {
        kind: "multiple-choice",
        prompt: `Neno "${target.neno}" lina maana gani?`,
        choices,
        correctIndex: choices.indexOf(target.maana),
        layout: "list",
        hint: "Fikiria muktadha wa neno hilo linapotumika kuhusu hisia au afya ya akili.",
        explanation: `${target.neno} — ${target.maana}.`,
      };
    }

    if (branch === "hali") {
      const items = HALI.map((h, i) => ({ id: `h${i}`, label: h.label, bucket: h.bucket }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila hali kama tabia ya afya njema ya akili, au tabia inayoashiria kwamba mtu anahitaji msaada wa mtu mzima anayemwamini.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "njema", label: "Afya Njema ya Akili" },
          { id: "msaada", label: "Inahitaji Msaada wa Mtu Mzima" },
        ],
        correctBucket,
        hint: "Tabia zinazoonyesha kujitunza (kuzungumza, kupumzika, kucheza) ni afya njema. Tabia za kujitenga kwa muda mrefu au kukosa usingizi/chakula ni ishara za kuhitaji msaada.",
        explanation: HALI.map((h) => `"${h.label}" ni ${h.bucket === "njema" ? "tabia ya afya njema ya akili" : "ishara ya kuhitaji msaada wa mtu mzima"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, VOCAB_ALL).slice(0, 8);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.neno, label: v.neno })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.neno, label: v.maana })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.neno] = v.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila neno la hisia/afya ya akili na maana yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((v) => `${v.neno} — ${v.maana}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const usePassage = rng() < 0.4;
      if (usePassage) {
        const kifungu = randChoice(rng, VIFUNGU);
        return {
          kind: "fill-blank",
          passage: kifungu.text,
          prompt: "Tumia neno ufaalo kutoka kwa msamiati wa kifungu kukamilisha sentensi hii mpya.",
          before: kifungu.matumizi.before,
          after: kifungu.matumizi.after,
          correctAnswer: kifungu.matumizi.neno,
          inputMode: "text",
          hint,
          explanation: `Neno "${kifungu.matumizi.neno}" ndilo linalofaa hapa kwa maana yake kama ilivyotumika katika kifungu.`,
        };
      }
      const tpl = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu hisia na afya ya akili.",
        before: tpl.before,
        after: tpl.after,
        correctAnswer: tpl.correctAnswer,
        inputMode: "text",
        hint,
        explanation: tpl.explanation,
      };
    }

    return {
      kind: "ordering",
      prompt: "Panga hatua zifuatazo za kujitunza kihisia kwa mfuatano mzuri unapohisi mzigo wa hisia.",
      instruction: "Bofya hatua kwa mfuatano sahihi.",
      items: shuffle(rng, HATUA),
      correctOrder: HATUA.map((h) => h.id),
      hint: "Anza kwa kutambua unavyohisi, kisha tafuta msaada wa mtu unayemwamini, kabla ya kupumzika.",
      explanation: HATUA.map((h) => h.label).join(" → "),
    };
  },
};
