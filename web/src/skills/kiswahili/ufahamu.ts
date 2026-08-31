import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface SwaliUfahamu {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface Kifungu {
  text: string;
  maswali: SwaliUfahamu[];
}

const VIFUNGU: Kifungu[] = [
  {
    text: "Wanafunzi wa Shule ya Upili ya Mlima Kenya walipanda miti mia tatu kando ya mto uliopo karibu na shule yao Jumamosi iliyopita. Mwalimu mkuu alieleza kuwa miti hiyo itasaidia kuzuia mmomonyoko wa udongo na kutoa kivuli kwa wanafunzi watakaokuja baadaye. Baadhi ya wanafunzi walichimba mashimo huku wengine wakibeba maji kutoka kisimani. Kufikia adhuhuri, kikundi kizima kilikuwa kimechoka lakini kikiwa na furaha kwa yale waliyoyatimiza.",
    maswali: [
      {
        prompt: "Kifungu hiki kinahusu nini hasa?",
        choices: [
          "Wanafunzi kupanda miti ili kulinda mazingira ya shule yao",
          "Mwalimu mkuu akieleza kuhusu mmomonyoko wa udongo pekee",
          "Wanafunzi wakichimba kisima kipya",
          "Shindano baina ya wanafunzi kuhusu nani atapanda miti mingi zaidi",
        ],
        correctIndex: 0,
        explanation: "Kifungu kinaeleza tukio la wanafunzi kupanda miti ili kuzuia mmomonyoko na kutoa kivuli — hiyo ndiyo dhamira kuu, si maelezo mengine.",
      },
      {
        prompt: "Kulingana na kifungu, kwa nini wanafunzi walipanda miti?",
        choices: [
          "Ili kuzuia mmomonyoko wa udongo na kutoa kivuli",
          "Ili kushinda shindano la shule",
          "Kwa sababu kisima kilikuwa kimeharibika",
          "Ili kuuza miti hiyo baadaye",
        ],
        correctIndex: 0,
        explanation: "Kifungu kinasema mwalimu mkuu alieleza kuwa miti \"itasaidia kuzuia mmomonyoko wa udongo na kutoa kivuli\".",
      },
      {
        prompt: "Neno 'kutimiza' katika kifungu lina maana gani?",
        choices: ["kukamilisha au kufanikisha jambo", "kushindwa kufanya jambo", "kusahau jambo", "kuahirisha jambo"],
        correctIndex: 0,
        explanation: "Wanafunzi walikuwa na furaha kwa yale \"waliyoyatimiza\" — yaani walichokifanikisha au kukikamilisha.",
      },
    ],
  },
  {
    text: "Kila Jumatano, mama yake Naliaka huuza mboga sokoni. Naliaka huamka mapema kumsaidia mama yake kupanga nyanya, vitunguu na sukuma wiki mezani. Wateja mara nyingi hujadiliana bei, na Naliaka amejifunza kuhesabu chenji haraka akilini mwake. Ijapokuwa kazi hiyo huchosha, Naliaka hufurahia kukutana na watu tofauti na kusikia hadithi zao. Anatumaini siku moja atasoma biashara ili amsaidie mama yake kukuza duka lao.",
    maswali: [
      {
        prompt: "Kifungu hiki kinahusu nini hasa?",
        choices: [
          "Naliaka akimsaidia mama yake sokoni huku akiwa na ndoto ya siku zijazo",
          "Soko linalouza nyanya na vitunguu pekee",
          "Naliaka akikataa kumsaidia mama yake Jumatano",
          "Wateja wasiojadiliana bei kamwe",
        ],
        correctIndex: 0,
        explanation: "Kifungu kinafuatilia jukumu la Naliaka sokoni na tumaini lake la kusoma biashara ili kukuza duka la mama yake — hiyo ndiyo dhamira kuu.",
      },
      {
        prompt: "Naliaka amejifunza ujuzi gani kutokana na kusaidia sokoni?",
        choices: ["Kuhesabu chenji haraka akilini mwake", "Kulima mboga", "Kuendesha gari la kusambaza bidhaa", "Kuzungumza lugha ya kigeni"],
        correctIndex: 0,
        explanation: "Kifungu kinasema Naliaka \"amejifunza kuhesabu chenji haraka akilini mwake\" kutokana na kushughulikia wateja.",
      },
      {
        prompt: "Kifungu kinaonyesha nini kuhusu matarajio ya Naliaka?",
        choices: [
          "Anataka kusoma biashara na kukuza duka la mama yake",
          "Anataka kuacha kabisa kumsaidia mama yake",
          "Hapendi kukutana na watu wapya",
          "Anataka kuwa mwalimu",
        ],
        correctIndex: 0,
        explanation: "Sentensi ya mwisho inasema anatumaini \"atasoma biashara ili amsaidie mama yake kukuza duka lao\".",
      },
    ],
  },
  {
    text: "Wakati wa kiangazi kirefu, vijiji vingi katika eneo hilo vilikumbwa na uhaba wa maji safi. Visima vilipungua maji, na familia zililazimika kutembea umbali mrefu kufuata maji kutoka mito michache iliyokuwa bado inatiririka. Kikundi cha vijana wa eneo hilo kiliamua kufundisha kaya jinsi ya kuvuna maji ya mvua kwa kutumia mifereji rahisi na matangi ya kuhifadhi maji. Ndani ya miezi michache, familia nyingi zilikuwa na chanzo cha kutegemewa cha maji hata wakati mvua zilipokuwa hazitabiriki. Wazee wa kijiji waliwasifu vijana hao kwa ubunifu wao.",
    maswali: [
      {
        prompt: "Kifungu hiki kinahusu nini hasa?",
        choices: [
          "Kikundi cha vijana kikisaidia wanakijiji kukabiliana na uhaba wa maji kupitia uvunaji wa maji ya mvua",
          "Wazee wakilalamikia vijana wa kijiji",
          "Maelezo ya jinsi visima vinavyochimbwa",
          "Familia zikihama kutoka kijijini kwa sababu ya ukame",
        ],
        correctIndex: 0,
        explanation: "Tukio kuu la kifungu ni vijana kufundisha uvunaji wa maji ya mvua ili kutatua uhaba wa maji.",
      },
      {
        prompt: "Vijana walifundisha kaya njia gani ya kupata maji?",
        choices: [
          "Kuvuna maji ya mvua kwa mifereji na matangi",
          "Kuchimba visima vipya",
          "Kutembea umbali mrefu zaidi kufuata maji",
          "Kununua maji kutoka kijiji kingine",
        ],
        correctIndex: 0,
        explanation: "Kifungu kinasema kikundi cha vijana \"kiliamua kufundisha kaya jinsi ya kuvuna maji ya mvua kwa kutumia mifereji rahisi na matangi\".",
      },
      {
        prompt: "Neno 'ubunifu' katika kifungu lina maana gani?",
        choices: [
          "uwezo wa kutafuta njia mpya na za busara za kutatua tatizo",
          "uvivu na kukosa bidii",
          "utajiri wa mali",
          "kuchanganyikiwa kuhusu la kufanya",
        ],
        correctIndex: 0,
        explanation: "Wazee waliwasifu vijana kwa kutatua tatizo kwa njia mpya na ya busara — hiyo ndiyo maana ya \"ubunifu\".",
      },
    ],
  },
  {
    text: "Huduma ya pesa za simu imebadilisha jinsi watu nchini Kenya wanavyofanya biashara. Mwenye duka mdogo mjini anaweza sasa kupokea malipo papo hapo kutoka simu ya mteja badala ya kushughulikia pesa taslimu. Wakulima hutumia pesa za simu kulipia mbolea na kupokea malipo ya mazao yao bila kusafiri hadi benki. Hata watoto wadogo wanaotumwa kazi wanaweza kutumiwa nauli ya basi kwa sekunde chache. Ingawa baadhi ya wazee bado hupendelea pesa taslimu, wengi wanakubali kuwa pesa za simu zimefanya miamala kuwa ya haraka na salama zaidi.",
    maswali: [
      {
        prompt: "Kifungu hiki kinahusu nini hasa?",
        choices: [
          "Jinsi pesa za simu zilivyofanya miamala kuwa ya haraka na rahisi nchini Kenya",
          "Kwa nini maduka madogo yanakataa pesa taslimu",
          "Historia ya benki nchini Kenya",
          "Jinsi watoto wanavyotumia nauli ya basi",
        ],
        correctIndex: 0,
        explanation: "Mifano yote katika kifungu — wenye maduka, wakulima, watoto — inaonyesha jinsi pesa za simu zilivyoharakisha miamala.",
      },
      {
        prompt: "Kulingana na kifungu, wakulima hunufaikaje na pesa za simu?",
        choices: [
          "Hulipia mbolea na kupokea malipo ya mazao bila kusafiri benki",
          "Hupata mbolea bila malipo",
          "Hawahitaji tena kuuza mazao yao",
          "Hutumia pesa za simu wakati wa mavuno pekee",
        ],
        correctIndex: 0,
        explanation: "Kifungu kinasema wakulima \"hutumia pesa za simu kulipia mbolea na kupokea malipo ya mazao yao bila kusafiri hadi benki\".",
      },
      {
        prompt: "Kifungu kinadokeza nini kuhusu mtazamo wa wazee kuhusu pesa za simu?",
        choices: [
          "Baadhi wanabaki waangalifu na bado wanapendelea pesa taslimu",
          "Wote wanakataa kabisa kutumia simu",
          "Ndio waliovumbua mfumo wa pesa za simu",
          "Wanapenda pesa za simu kuliko kila mtu mwingine",
        ],
        correctIndex: 0,
        explanation: "Kifungu kinasema \"baadhi ya wazee bado hupendelea pesa taslimu\", jambo linaloonyesha uangalifu zaidi, si ukataaji kamili.",
      },
    ],
  },
];

const KWELI_UONGO: { text: string; kweli: boolean }[][] = [
  [
    { text: "Wanafunzi walipanda miti kando ya mto.", kweli: true },
    { text: "Mwalimu mkuu alisema miti itasaidia kuzuia mmomonyoko wa udongo.", kweli: true },
    { text: "Wanafunzi walipanda miti ndani ya darasa.", kweli: false },
    { text: "Shughuli hiyo ilikuwa ya mara moja tu, haitarudiwa tena.", kweli: false },
  ],
  [
    { text: "Naliaka humsaidia mama yake sokoni kila Jumatano.", kweli: true },
    { text: "Naliaka anatumaini kusoma biashara siku moja.", kweli: true },
    { text: "Naliaka huuza mboga kila siku ya wiki.", kweli: false },
    { text: "Naliaka hapendi kukutana na watu sokoni.", kweli: false },
  ],
  [
    { text: "Kikundi cha vijana kiliwafundisha wanakijiji kuvuna maji ya mvua.", kweli: true },
    { text: "Familia zilitumia mifereji na matangi kuhifadhi maji.", kweli: true },
    { text: "Kijiji kilichimba visima vipya kutatua tatizo la maji.", kweli: false },
    { text: "Wazee waliwalaumu vijana kwa wazo lao.", kweli: false },
  ],
  [
    { text: "Wakulima hutumia pesa za simu kulipia mbolea.", kweli: true },
    { text: "Pesa za simu zimefanya miamala kuwa ya haraka zaidi.", kweli: true },
    { text: "Wazee wote wanakataa kabisa kutumia pesa za simu.", kweli: false },
    { text: "Maduka hayawezi kupokea malipo kupitia simu.", kweli: false },
  ],
];

export const ufahamu: Skill = {
  id: "kis-r-ufahamu",
  code: "U.1",
  subjectId: "kiswahili",
  strandId: "kis-ufahamu",
  grade: 9,
  title: "Ufahamu wa kifungu",
  description: "Soma kifungu kifupi na ujibu maswali kuhusu jambo kuu, undani, na maana za maneno.",
  generate(rng) {
    const index = Math.floor(rng() * VIFUNGU.length);
    const kifungu = VIFUNGU[index];
    const hint = "Soma tena kifungu na utafute sentensi inayohusiana moja kwa moja na swali.";

    if (rng() < 0.4) {
      const kauli = KWELI_UONGO[index];
      const items = kauli.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.kweli ? "Kweli" : "Uongo" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: kifungu.text,
        prompt: "Panga kila kauli kama Kweli au Uongo, kulingana na kifungu.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Kweli", label: "Kweli" },
          { id: "Uongo", label: "Uongo" },
        ],
        correctBucket,
        hint: "Soma kifungu tena na uangalie kwa makini kila kauli dhidi ya yale kifungu kinasema.",
        explanation: kauli.map((s) => `"${s.text}" ni ${s.kweli ? "kweli" : "uongo"} kulingana na kifungu.`).join(" "),
      };
    }

    const swali = randChoice(rng, kifungu.maswali);
    const correctText = swali.choices[swali.correctIndex];
    const choices = shuffle(rng, swali.choices);

    return {
      kind: "multiple-choice",
      passage: kifungu.text,
      prompt: swali.prompt,
      choices,
      correctIndex: choices.indexOf(correctText),
      layout: "list",
      hint,
      explanation: swali.explanation,
    };
  },
};
