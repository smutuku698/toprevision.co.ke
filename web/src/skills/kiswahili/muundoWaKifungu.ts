import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Mfumo = "sequence" | "cause-effect" | "compare-contrast" | "problem-solution" | "descriptive";

const LABELS: Record<Mfumo, string> = {
  sequence: "Mfuatano wa matukio (hatua kwa hatua)",
  "cause-effect": "Sababu na Tokeo",
  "compare-contrast": "Kulinganisha na Kutofautisha",
  "problem-solution": "Tatizo na Suluhisho",
  descriptive: "Maelezo (maelezo ya kina)",
};

const ISHARA: Record<Mfumo, string> = {
  sequence: "Hutumia maneno ya mfuatano kama 'kwanza', 'kisha', 'mwishowe'",
  "cause-effect": "Hutumia maneno kama 'kwa sababu', 'matokeo yake' kuunganisha tukio na chanzo chake",
  "compare-contrast": "Hutumia maneno kama 'tofauti na', 'zote mbili' kuonyesha ufanano na tofauti",
  "problem-solution": "Hueleza tatizo kwanza, kisha suluhisho lililotekelezwa",
  descriptive: "Hutumia maelezo ya hisia kuchora picha, bila kufuata mfuatano wa matukio",
};

const AYA: { text: string; mfumo: Mfumo; sababu: string }[] = [
  {
    text: "Kwanza, loweka maharagwe kwenye maji usiku kucha. Kisha, mwaga maji hayo na suuza maharagwe. Baadaye, yaweke kwenye sufuria na maji safi na uyachemshe hadi yalainike. Mwishowe, ongeza chumvi na viungo unavyopenda kabla ya kuyahudumia.",
    mfumo: "sequence",
    sababu: "Kifungu kinatumia maneno ya mfuatano kama 'kwanza', 'kisha', 'baadaye' na 'mwishowe' kuonyesha hatua kwa mpangilio.",
  },
  {
    text: "Kwa sababu mto ulifurika kingo zake, mashamba yaliyo karibu yalifurikwa na mazao mengi yaliharibika. Matokeo yake, familia kadhaa zilipoteza chanzo chao kikuu cha mapato msimu huo.",
    mfumo: "cause-effect",
    sababu: "Kifungu kinaonyesha jinsi tukio moja ('mto kufurika') lilivyosababisha tukio jingine ('mashamba kuharibika'), kwa maneno kama 'kwa sababu' na 'matokeo yake'.",
  },
  {
    text: "Tofauti na paneli za jua, ambazo zinahitaji jua moja kwa moja ili kuzalisha umeme, mitambo ya upepo inaweza kuzalisha nguvu mchana na usiku ikiwa kuna upepo. Hata hivyo, teknolojia zote mbili huchukuliwa kuwa endelevu na rafiki wa mazingira.",
    mfumo: "compare-contrast",
    sababu: "Kifungu kinaonyesha ufanano na tofauti kati ya paneli za jua na mitambo ya upepo, kwa maneno kama 'tofauti na' na 'zote mbili'.",
  },
  {
    text: "Wanafunzi wengi walikuwa wakichelewa shuleni kwa sababu basi pekee lilikuwa limejaa abiria kupita kiasi. Chama cha wazazi kiliamua kuajiri basi la pili na kurekebisha ratiba ya kuwachukua wanafunzi, jambo lililotatua tatizo hilo ndani ya wiki mbili.",
    mfumo: "problem-solution",
    sababu: "Kifungu kinaeleza kwanza tatizo (msongamano wa basi, kuchelewa) kisha suluhisho lililotekelezwa.",
  },
  {
    text: "Jengo la zamani la soko lina paa la bati lililochakaa na milango mikubwa ya mbao inayolia inapofunguliwa. Ndani yake, safu za vibanda vya rangi mbalimbali huuza kila kitu kutoka embe mabichi hadi vikapu vilivyosukwa kwa mikono, na harufu ya mahindi yaliyochomwa hujaa hewani.",
    mfumo: "descriptive",
    sababu: "Kifungu kinatumia maelezo ya hisia — vitu vinavyoonekana na harufu — badala ya kueleza matukio kwa mfuatano au sababu.",
  },
  {
    text: "Wajitolea walianza kwa kuondoa nyasi zilizokuwa zimeota kando ya kisima. Baada ya hapo, walirekebisha mpini wa pampu uliokuwa umevunjika. Mara pampu ilipoanza kufanya kazi, walijenga uzio mdogo kuzuia wanyama.",
    mfumo: "sequence",
    sababu: "Kifungu kinaeleza hatua kwa mpangilio wa wakati, kwa maneno kama 'walianza', 'baada ya hapo', na 'mara'.",
  },
  {
    text: "Kwa kuwa bei ya unga wa mahindi iliongezeka kwa kasi, familia nyingi zilianza kununua vifurushi vidogo mara kwa mara. Hivyo basi, baadhi ya wafanyabiashara walianza kuweka akiba ya vifurushi vya kilo moja badala ya vile vya kilo mbili vilivyozoeleka.",
    mfumo: "cause-effect",
    sababu: "Kifungu kinaunganisha sababu ('bei kuongezeka') na matokeo yake ('familia kununua vifurushi vidogo', 'wafanyabiashara kubadili akiba'), kupitia maneno 'kwa kuwa' na 'hivyo basi'.",
  },
  {
    text: "Maktaba ya shule na kituo kipya cha kujifunza kidijitali vyote hutoa mahali tulivu pa kusoma. Hata hivyo, maktaba ina vitabu vilivyochapishwa pekee, huku kituo cha kidijitali kikitoa mtandao na kompyuta za utafiti.",
    mfumo: "compare-contrast",
    sababu: "Kifungu kinalinganisha maeneo mawili, kikionyesha yanayofanana ('vyote hutoa mahali tulivu') na yanayotofautiana ('vitabu' dhidi ya 'mtandao na kompyuta').",
  },
  {
    text: "Takataka zilikuwa zikirundikana kando ya uzio wa shule kwa wiki kadhaa, zikivutia inzi na kusababisha harufu mbaya. Baraza la wanafunzi liliandaa siku ya usafi na kuweka mapipa zaidi ya taka kuzunguka eneo hilo, na eneo la uzio limebaki safi tangu wakati huo.",
    mfumo: "problem-solution",
    sababu: "Kifungu kinaeleza tatizo (takataka, inzi, harufu) kisha suluhisho lililofanywa na baraza la wanafunzi.",
  },
  {
    text: "Mbuyu wa zamani katikati ya kijiji una shina zito, la kijivu, lenye upana wa kutosha kushikwa mikono na watoto watano, na matawi yake yametanda kama mwavuli mkubwa unaotoa kivuli kwa yeyote anayepita.",
    mfumo: "descriptive",
    sababu: "Kifungu kinatumia maelezo ya kina kuhusu jinsi mti unavyoonekana, badala ya kusimulia mfuatano wa matukio.",
  },
];

export const muundoWaKifungu: Skill = {
  id: "kis-r-muundo",
  code: "U.2",
  subjectId: "kiswahili",
  strandId: "kis-ufahamu",
  grade: 9,
  title: "Tambua muundo wa kifungu",
  description: "Soma aya fupi na utambue mfumo wake: mfuatano, sababu na tokeo, kulinganisha, tatizo na suluhisho, au maelezo.",
  generate(rng) {
    const hint = "Tafuta maneno ya kuashiria — maneno ya wakati, sababu/tokeo, ulinganisho, au maelezo ya hisia.";

    if (rng() < 0.4) {
      const mifumo = Object.keys(LABELS) as Mfumo[];
      const tokens = shuffle(rng, mifumo.map((m) => ({ id: m, label: LABELS[m] })));
      const targets = shuffle(rng, mifumo.map((m) => ({ id: m, label: ISHARA[m] })));
      const correctMap: Record<string, string> = {};
      for (const m of mifumo) correctMap[m] = m;

      return {
        kind: "click-match",
        prompt: "Oanisha kila muundo wa aya na ishara yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: mifumo.map((m) => `${LABELS[m]} — ${ISHARA[m]}.`).join(" "),
      };
    }

    const entry = randChoice(rng, AYA);
    const correctLabel = LABELS[entry.mfumo];
    const choices = shuffle(rng, Object.values(LABELS));

    return {
      kind: "multiple-choice",
      passage: entry.text,
      prompt: "Aya hii imepangwa kwa mfumo gani?",
      choices,
      correctIndex: choices.indexOf(correctLabel),
      layout: "list",
      hint,
      explanation: entry.sababu,
    };
  },
};
