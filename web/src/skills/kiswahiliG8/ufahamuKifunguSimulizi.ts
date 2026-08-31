import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Swali {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface Kifungu {
  text: string;
  matukio: string[]; // in correct chronological order
  mahususi: Swali;
  tabiri: Swali;
  msamiati: { neno: string; maana: string }[];
  kauli: { text: string; kweli: boolean }[];
}

const VIFUNGU: Kifungu[] = [
  {
    text: "Jumamosi asubuhi, wanafunzi wa Shule ya Msingi Kanga walikutana uwanjani mbele ya soko la mtaa wao wakiwa na ndoo, ufagio na mifuko ya taka. Kwanza, walipiga mstari wa kuokota chupa za plastiki zilizotapakaa karibu na vibanda. Kisha, wakafagia sehemu za barabarani zilizojaa vumbi na mabaki ya mboga. Baadaye, waliweka taka zote kwenye mifuko na kuzipeleka pale lori la manispaa lilipokuwa likisubiri. Mwishoni, wafanyabiashara wa sokoni waliwashukuru wanafunzi hao na kuwapa maji ya kunywa kwa shukrani.",
    matukio: [
      "Kuokota chupa za plastiki zilizotapakaa",
      "Kufagia barabara zenye vumbi na mabaki ya mboga",
      "Kuweka taka kwenye mifuko na kuzipeleka lori la manispaa",
      "Wafanyabiashara kuwashukuru na kuwapa maji ya kunywa",
    ],
    mahususi: {
      prompt: "Wanafunzi walipeleka taka wapi baada ya kuzikusanya?",
      choices: [
        "Kwenye lori la manispaa lililokuwa likisubiri",
        "Kwenye mto uliokuwa karibu",
        "Nyumbani kwa mwalimu mkuu",
        "Kwenye shimo lililochimbwa sokoni",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinasema waliweka taka kwenye mifuko na \"kuzipeleka pale lori la manispaa lilipokuwa likisubiri\".",
    },
    tabiri: {
      prompt: "Kutokana na jinsi wafanyabiashara walivyowashukuru wanafunzi, ni nini kinachoweza kutokea siku za usoni?",
      choices: [
        "Huenda wafanyabiashara wakawaalika wanafunzi kusaidia tena",
        "Wafanyabiashara watafunga vibanda vyao kabisa",
        "Wanafunzi watapigwa marufuku kuingia sokoni",
        "Soko litahamishwa kwenda mji mwingine",
      ],
      correctIndex: 0,
      explanation: "Shukrani na maji waliyopewa wanafunzi zinaonyesha uhusiano mzuri unaoweza kuendelea kati yao na wafanyabiashara.",
    },
    msamiati: [
      { neno: "kutapakaa", maana: "kusambaa hovyo mahali pengi" },
      { neno: "shukrani", maana: "hisia za kufurahi na kumshukuru mtu kwa jambo alilofanya" },
      { neno: "kusubiri", maana: "kungoja jambo fulani litokee" },
    ],
    kauli: [
      { text: "Wanafunzi walikutana sokoni Jumamosi asubuhi.", kweli: true },
      { text: "Walifagia sehemu za barabara zenye vumbi.", kweli: true },
      { text: "Waliokota chupa za plastiki mwishoni kabisa, baada ya kila kitu kingine.", kweli: false },
      { text: "Wafanyabiashara waliwafukuza wanafunzi sokoni.", kweli: false },
    ],
  },
  {
    text: "Kila mwisho wa muhula, wanachama wa klabu ya mazingira katika Shule ya Upili ya Bonde walitembelea stendi ya matatu iliyo karibu na shule kusaidia usafi. Kwanza, waliwahoji madereva na makondakta kuhusu mahali taka nyingi hukusanyika. Kisha, waligawana majukumu: baadhi wakiokota makopo na mifuko ya plastiki, wengine wakisafisha madimbwi ya maji machafu kando ya barabara. Baadaye, walibandika mabango yaliyoandikwa 'Tupa Taka Mahali Pake' kwenye nguzo za stendi. Mwishoni, msimamizi wa stendi aliahidi kuweka mapipa zaidi ya taka ili kudumisha usafi huo.",
    matukio: [
      "Kuwahoji madereva na makondakta kuhusu mahali taka hukusanyika",
      "Kugawana majukumu ya kuokota taka na kusafisha madimbwi",
      "Kubandika mabango ya 'Tupa Taka Mahali Pake'",
      "Msimamizi kuahidi kuweka mapipa zaidi ya taka",
    ],
    mahususi: {
      prompt: "Wanachama wa klabu walifanya nini kabla ya kuanza kazi ya usafi?",
      choices: [
        "Waliwahoji madereva na makondakta kuhusu mahali taka hukusanyika",
        "Walijenga uzio mpya stendi",
        "Waliuza mabango kwa wafanyabiashara",
        "Walifunga stendi kwa siku moja",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinaeleza kuwa \"kwanza, waliwahoji madereva na makondakta kuhusu mahali taka nyingi hukusanyika\" kabla ya kuanza kazi.",
    },
    tabiri: {
      prompt: "Kwa kuzingatia ahadi ya msimamizi wa stendi, ni nini kinachoweza kutarajiwa baadaye?",
      choices: [
        "Stendi itakuwa na mapipa zaidi na kubaki safi zaidi",
        "Stendi itafungwa kabisa",
        "Idadi ya madereva itapungua",
        "Wanachama hawataruhusiwa tena kutembelea stendi",
      ],
      correctIndex: 0,
      explanation: "Msimamizi aliahidi \"kuweka mapipa zaidi ya taka ili kudumisha usafi huo\", jambo linaloashiria mabadiliko chanya yajayo.",
    },
    msamiati: [
      { neno: "kudumisha", maana: "kuendeleza jambo liendelee kuwa katika hali njema" },
      { neno: "kuhoji", maana: "kuuliza maswali ili kupata habari" },
      { neno: "kubandika", maana: "kuweka au kunata kitu mahali ili kionekane" },
    ],
    kauli: [
      { text: "Klabu ya mazingira ilitembelea stendi mwisho wa muhula.", kweli: true },
      { text: "Walibandika mabango ya kutupa taka mahali pake.", kweli: true },
      { text: "Waliokota taka bila kuwahoji dereva yeyote.", kweli: false },
      { text: "Msimamizi alikataa kabisa kusaidia klabu hiyo.", kweli: false },
    ],
  },
  {
    text: "Familia ya Bwana Otieno huishi karibu na Mto Yala, mahali ambapo wakazi wengi hutupa taka bila uangalifu. Wiki iliyopita, Bwana Otieno aliwaita majirani zake kwa mkutano mfupi kando ya mto. Kwanza, walijadili jinsi taka zinavyoziba mkondo wa maji na kusababisha mafuriko. Kisha, walipanga zamu za kusafisha ukingo wa mto kila Jumamosi. Baadaye, vijana walijitolea kutengeneza mabango yenye ujumbe wa kuhifadhi mto. Mwishoni, chifu wa eneo hilo aliahidi kuwaunga mkono kwa kuwapatia zana za usafi.",
    matukio: [
      "Bwana Otieno kuita mkutano wa majirani kando ya mto",
      "Kujadili jinsi taka zinavyoziba mkondo wa mto",
      "Kupanga zamu za kusafisha ukingo wa mto kila Jumamosi",
      "Chifu kuahidi kuwapatia zana za usafi",
    ],
    mahususi: {
      prompt: "Kwa nini Bwana Otieno aliwaita majirani zake kwa mkutano?",
      choices: [
        "Kujadili jinsi taka zinavyoziba mkondo wa mto na kusababisha mafuriko",
        "Kuwakaribisha kwenye harusi",
        "Kuuza kiwanja kando ya mto",
        "Kuwaomba wahame eneo hilo",
      ],
      correctIndex: 0,
      explanation: "Mkutano ulifanywa ili \"kujadili jinsi taka zinavyoziba mkondo wa maji na kusababisha mafuriko\".",
    },
    tabiri: {
      prompt: "Kutokana na ahadi ya chifu kuwapa zana za usafi, ni matokeo gani yanayoweza kutarajiwa?",
      choices: [
        "Zoezi la kusafisha mto litakuwa rahisi zaidi kuendelezwa",
        "Mto utafungwa kabisa kwa matumizi",
        "Familia zote zitahama eneo hilo",
        "Bei ya zana za usafi itapanda sana",
      ],
      correctIndex: 0,
      explanation: "Kupatiwa zana za usafi kunawezesha wakazi kuendelea na zamu zao za kusafisha mto kwa urahisi zaidi.",
    },
    msamiati: [
      { neno: "kuziba", maana: "kuzuia kitu kisipite au kisitiririke" },
      { neno: "kuunga mkono", maana: "kusaidia au kukubaliana na jambo fulani" },
      { neno: "kujitolea", maana: "kufanya jambo kwa hiari bila kulazimishwa au kulipwa" },
    ],
    kauli: [
      { text: "Familia ya Bwana Otieno huishi karibu na Mto Yala.", kweli: true },
      { text: "Walipanga kusafisha mto kila Jumamosi.", kweli: true },
      { text: "Chifu alikataa kabisa kuwasaidia wakazi.", kweli: false },
      { text: "Mkutano ulifanyika ndani ya nyumba ya Bwana Otieno.", kweli: false },
    ],
  },
  {
    text: "Timu ya mpira ya Shule ya Msingi Amani ilishinda mchezo wa mwisho wa msimu, lakini walipofika uwanjani wiki iliyofuata kwa mazoezi, walikuta chupa na makaratasi yametapakaa kila mahali baada ya mashabiki kufurika wikendi iliyopita. Kwanza, kapteni wa timu aliwaomba wenzake wachelewe mazoezi kidogo ili wasafishe uwanja. Kisha, wachezaji waligawanyika makundi manne, kila kundi likishughulikia kona moja ya uwanja. Baadaye, walikusanya taka zote kwenye pipa kubwa lililopo nje ya lango. Mwishoni, walicheza mazoezi yao kwenye uwanja safi na kuahidiana kufanya usafi huo mara kwa mara.",
    matukio: [
      "Kukuta uwanja umejaa taka baada ya mashabiki kufurika",
      "Kapteni kuomba wachelewe mazoezi ili wasafishe uwanja",
      "Kugawanyika makundi manne kusafisha kila kona ya uwanja",
      "Kucheza mazoezi kwenye uwanja safi na kuahidiana kuendelea",
    ],
    mahususi: {
      prompt: "Kwa nini uwanja ulikuwa umejaa taka wiki hiyo?",
      choices: [
        "Kwa sababu mashabiki walifurika wikendi iliyopita na kuacha taka",
        "Kwa sababu mvua kubwa ilinyesha wiki hiyo",
        "Kwa sababu wachezaji walitupa taka wenyewe wakati wa mazoezi",
        "Kwa sababu shule ilikuwa imefungwa kwa mwezi mzima",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinasema taka zilitapakaa \"baada ya mashabiki kufurika wikendi iliyopita\".",
    },
    tabiri: {
      prompt: "Kwa kuzingatia ahadi ya wachezaji ya kufanya usafi mara kwa mara, ni nini kinachoweza kutarajiwa msimu ujao?",
      choices: [
        "Uwanja utabaki safi zaidi kutokana na mazoea mapya ya timu",
        "Timu itaacha kucheza kabisa uwanjani",
        "Mashabiki hawataruhusiwa tena kuja kutazama",
        "Uwanja utafungwa kudumu",
      ],
      correctIndex: 0,
      explanation: "Kwa kuwa waliahidiana kufanya usafi mara kwa mara, ni jambo la kutarajiwa uwanja utaendelea kuwa safi zaidi.",
    },
    msamiati: [
      { neno: "kufurika", maana: "kujaa watu wengi kupita kiasi mahali fulani" },
      { neno: "kugawanyika", maana: "kujitenga katika makundi madogo madogo" },
      { neno: "kuahidiana", maana: "kuwekeana ahadi wao kwa wao" },
    ],
    kauli: [
      { text: "Timu ilishinda mchezo wa mwisho wa msimu.", kweli: true },
      { text: "Wachezaji waligawanyika makundi manne kusafisha uwanja.", kweli: true },
      { text: "Wachezaji walikataa kusafisha uwanja na kuondoka nyumbani.", kweli: false },
      { text: "Taka zilikusanywa kwenye pipa lililo nje ya lango.", kweli: true },
    ],
  },
];

export const ufahamuKifunguSimulizi: Skill = {
  id: "g8-ksw-ks-ufahamu-simulizi",
  code: "KS.1",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ks",
  grade: 8,
  title: "Ufahamu wa Kifungu cha Simulizi",
  description: "Soma hadithi fupi kisha udondoe habari mahususi, upange matukio, ufanye utabiri na ufasiri, na ueleze maana za msamiati.",
  generate(rng) {
    const kifungu = randChoice(rng, VIFUNGU);
    const branch = randChoice(rng, ["mahususi", "order", "tabiri", "msamiati", "kauli"] as const);
    const hintUjumla = "Soma kifungu tena kwa makini na utafute sehemu inayohusiana moja kwa moja na swali.";

    if (branch === "order") {
      const items = kifungu.matukio.map((label, i) => ({ id: `e${i}`, label }));
      return {
        kind: "ordering",
        passage: kifungu.text,
        prompt: "Panga matukio yafuatayo jinsi yalivyotokea katika kifungu.",
        instruction: "Bofya matukio kwa mfuatano sahihi.",
        items: shuffle(rng, items),
        correctOrder: items.map((it) => it.id),
        hint: "Fuatilia maneno ya mfuatano kama 'kwanza', 'kisha', 'baadaye' na 'mwishoni'.",
        explanation: kifungu.matukio.join(" → "),
      };
    }

    if (branch === "msamiati") {
      const tokens = shuffle(rng, kifungu.msamiati.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, kifungu.msamiati.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of kifungu.msamiati) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        passage: kifungu.text,
        prompt: "Oanisha kila neno na maana yake kama linavyotumika katika kifungu.",
        tokens,
        targets,
        correctMap,
        hint: hintUjumla,
        explanation: kifungu.msamiati.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "kauli") {
      const items = kifungu.kauli.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.kweli ? "Kweli" : "Uongo" }));
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
        hint: hintUjumla,
        explanation: kifungu.kauli.map((s) => `"${s.text}" ni ${s.kweli ? "kweli" : "uongo"} kulingana na kifungu.`).join(" "),
      };
    }

    const swali = branch === "tabiri" ? kifungu.tabiri : kifungu.mahususi;
    const correctText = swali.choices[swali.correctIndex];
    const choices = shuffle(rng, swali.choices);
    return {
      kind: "multiple-choice",
      passage: kifungu.text,
      prompt: swali.prompt,
      choices,
      correctIndex: choices.indexOf(correctText),
      layout: "list",
      hint: hintUjumla,
      explanation: swali.explanation,
    };
  },
};
