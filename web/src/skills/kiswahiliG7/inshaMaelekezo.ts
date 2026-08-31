import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const VIPENGELE: { id: string; label: string; maelezo: string }[] = [
  { id: "anwani", label: "Anwani", maelezo: "Kichwa kinachoeleza kwa ufupi kile kitakachoelekezwa, k.m. 'Jinsi ya Kutoka Shuleni Hadi Nyumbani'" },
  { id: "vifaa", label: "Vifaa/mahitaji", maelezo: "Orodha ya vitu au maarifa yanayohitajika kabla ya kuanza kazi husika" },
  { id: "hatua", label: "Hatua kwa hatua", maelezo: "Maelezo ya kila hatua yakiwa yamepangwa kwa mfuatano unaofuatana" },
  { id: "mfuatano", label: "Maneno ya mfuatano", maelezo: "Maneno kama 'kwanza, kisha, baadaye, mwishoni' yanayoonyesha mpangilio wa hatua" },
  { id: "usahihi", label: "Usahihi wa habari", maelezo: "Maelezo yanayotolewa lazima yawe sahihi na yasiyopotosha msomaji" },
];

type HatuaSeti = { kichwa: string; hatua: { id: string; label: string }[] };

const SETI_ZA_HATUA: HatuaSeti[] = [
  {
    kichwa: "Jinsi ya Kutoka Shuleni Hadi Nyumbani",
    hatua: [
      { id: "toka", label: "Toka geti la shule mara kengele ya kwenda nyumbani ilipogongwa" },
      { id: "njia", label: "Tembea kwa uangalifu ukifuata njia ya miguu iliyowekwa" },
      { id: "barabara", label: "Vuka barabara kuu mahali penye alama ya kuvukia, ukiangalia pande zote mbili" },
      { id: "fika", label: "Fika nyumbani na umjulishe mzazi au mlezi kuwa umewasili salama" },
    ],
  },
  {
    kichwa: "Jinsi ya Kuandaa Chai ya Maziwa",
    hatua: [
      { id: "maji", label: "Weka maji na maziwa kwenye sufuria na uyaweke motoni" },
      { id: "majani", label: "Ongeza majani ya chai na sukari kiasi kinachotakiwa" },
      { id: "chemsha", label: "Acha mchanganyiko uchemke huku ukikoroga mara kwa mara" },
      { id: "chuja", label: "Chuja chai kwenye kikombe na uihudumie ikiwa moto" },
    ],
  },
  {
    kichwa: "Jinsi ya Kuosha Mikono Ipasavyo",
    hatua: [
      { id: "loweka", label: "Loweka mikono kwa maji safi yanayotiririka" },
      { id: "sabuni", label: "Paka sabuni na usugue mikono yote pamoja na vidole kwa sekunde ishirini" },
      { id: "suuza", label: "Suuza mikono vizuri kwa maji safi ili kuondoa sabuni yote" },
      { id: "kausha", label: "Kausha mikono kwa taulo safi au hewa" },
    ],
  },
];

const SIFA_NZURI = [
  "Chimba shimo lenye kina cha sentimita thelathini kabla ya kupanda mche.",
  "Kwanza osha viazi, kisha vikate vipande vidogo kabla ya kuvikaanga.",
  "Vaa glavu za usalama kabla ya kushika kifaa chenye ncha kali.",
  "Hakikisha maji yamechemka kabla ya kuongeza majani ya chai.",
];

const SIFA_MBAYA = [
  "Kwa namna fulani, fanya mambo kadhaa halafu labda utafahamu jinsi ya kuendelea.",
  "Ongeza vitu unavyotaka kwa mpangilio wowote utakaoona unafaa wewe binafsi.",
  "Nilipanda mti wangu jana bila kufuata hatua zozote maalum.",
  "Bustani yetu ina miti mingi mizuri iliyopandwa na babu miaka mingi iliyopita.",
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Insha ya maelekezo ina maana gani hasa?",
    sahihi: "Ni insha inayomwelekeza msomaji jinsi ya kutekeleza jambo fulani kwa hatua zilizopangwa",
    makosa: [
      "Ni insha inayosimulia tukio la kihistoria",
      "Ni insha inayoeleza hisia za mwandishi kuhusu jambo fulani",
      "Ni insha inayotoa maoni kuhusu mada ya kijamii",
    ],
  },
  {
    swali: "Kwa nini maelezo katika insha ya maelekezo yanapaswa kutoka upande mmoja tu (kutoka kwa mwelekezaji kwenda kwa msomaji)?",
    sahihi: "Ili maagizo yabaki wazi, sahihi na yasiyochanganya msomaji anayefuata hatua",
    makosa: [
      "Ili insha iwe fupi iwezekanavyo",
      "Ili kuepuka kutumia maneno ya mfuatano",
      "Ili insha isiwe na anwani",
    ],
  },
  {
    swali: "Kwa nini mpangilio wa hatua wenye mantiki ni muhimu katika insha ya maelekezo?",
    sahihi: "Kwa sababu ukifuata hatua zisizo na mpangilio, mtu anaweza kushindwa kutekeleza kazi ipasavyo au hata kupata madhara",
    makosa: [
      "Kwa sababu huifanya insha kuwa ndefu zaidi",
      "Kwa sababu hufanya insha ionekane ya kishairi",
      "Kwa sababu huepusha matumizi ya vitenzi vya amri",
    ],
  },
  {
    swali: "Aina zipi za insha za maelekezo ni za kawaida katika maisha ya kila siku?",
    sahihi: "Kama vile jinsi ya kupika, jinsi ya kutengeneza kitu, au jinsi ya kufika mahali",
    makosa: [
      "Kama vile insha za kusimulia ndoto za usiku",
      "Kama vile insha za kuelezea hisia za huzuni",
      "Kama vile insha za kubashiri matukio ya baadaye",
    ],
  },
];

export const inshaMaelekezo: Skill = {
  id: "g7-ksw-ka-insha-maelekezo",
  code: "KA.5",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Insha ya Maelekezo: Sifa na Mpangilio wa Hatua",
  description: "Tambua sifa za insha ya maelekezo — usahihi, mpangilio wa kimantiki, lugha sahili — na upange hatua kwa mfuatano ufaao.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "order", "categorize", "fill", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.maelezo })));
      const targets = shuffle(rng, VIPENGELE.map((v) => ({ id: v.id, label: v.label })));
      const correctMap: Record<string, string> = {};
      for (const v of VIPENGELE) correctMap[v.id] = v.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele/sifa ya insha ya maelekezo na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Insha ya maelekezo huwa na anwani, vifaa, hatua kwa hatua, maneno ya mfuatano, na usahihi wa habari.",
        explanation: VIPENGELE.map((v) => `${v.label} — ${v.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const seti = randChoice(rng, SETI_ZA_HATUA);
      const items = shuffle(rng, seti.hatua);
      return {
        kind: "ordering",
        prompt: `Panga hatua za "${seti.kichwa}" kwa mpangilio sahihi.`,
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: seti.hatua.map((h) => h.id),
        hint: "Fikiria ni hatua gani lazima ifanyike kwanza kabla ya nyingine kuweza kufanyika.",
        explanation: seti.hatua.map((h) => h.label).join(" → "),
      };
    }

    if (branch === "categorize") {
      const nzuri = shuffle(rng, SIFA_NZURI).slice(0, 3);
      const mbaya = shuffle(rng, SIFA_MBAYA).slice(0, 3);
      const items = shuffle(rng, [
        ...nzuri.map((label) => ({ id: `n-${label}`, label, bucket: "nzuri" })),
        ...mbaya.map((label) => ({ id: `m-${label}`, label, bucket: "mbaya" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na kama zina sifa nzuri za maelekezo sahihi na wazi, au ni maelekezo hafifu yasiyo na mpangilio.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "nzuri", label: "Maelekezo Sahihi na Wazi" },
          { id: "mbaya", label: "Maelekezo Hafifu/Yasiyo na Mpangilio" },
        ],
        correctBucket,
        hint: "Maelekezo mazuri huwa mahususi, yenye mfuatano wa kimantiki na lugha sahili.",
        explanation: `Maelekezo sahihi: ${nzuri.join(" / ")}. Maelekezo hafifu: ${mbaya.join(" / ")}.`,
      };
    }

    if (branch === "fill") {
      const seti = randChoice(rng, SETI_ZA_HATUA);
      const pili = seti.hatua[1];
      return {
        kind: "fill-blank",
        prompt: `Kamilisha neno la mfuatano linalofaa katika hatua ya pili ya "${seti.kichwa}".`,
        before: "",
        after: ` ${pili.label.charAt(0).toLowerCase()}${pili.label.slice(1)}.`,
        correctAnswer: "Kisha",
        acceptedAnswers: ["Kisha", "Pili"],
        inputMode: "text",
        hint: "Neno hili linaonyesha hatua inayofuata baada ya ile ya kwanza.",
        explanation: "Maneno ya mfuatano kama 'Kisha' huonyesha hatua inayofuata katika mpangilio wa maelekezo.",
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
      hint: "Zingatia usahihi wa habari, mpangilio wa kimantiki na lugha sahili katika insha ya maelekezo.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
