import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type MadaVidokezo = { mada: string; vidokezo: string[]; hafailiVidokezo: string[] };

const MADA_NA_VIDOKEZO: MadaVidokezo[] = [
  {
    mada: "Umuhimu wa Elimu Katika Jamii",
    vidokezo: [
      "Elimu humwezesha mtu kupata kazi nzuri na kujitegemea kimaisha",
      "Elimu husaidia kupunguza ujinga na imani potovu jamii",
      "Watu waliosoma huweza kuchangia maendeleo ya taifa kwa ujuzi wao",
    ],
    hafailiVidokezo: [
      "Bei ya nauli ya matatu imepanda mjini wiki hii",
      "Mchezo wa mpira wa miguu ulioandaliwa jana ulikuwa wa kufurahisha",
      "Wafanyabiashara wa soko kuu waliongeza bei za nyanya",
    ],
  },
  {
    mada: "Athari za Uchafuzi wa Mazingira",
    vidokezo: [
      "Utupaji taka ovyo huchafua mito na vyanzo vya maji safi",
      "Moshi kutoka viwandani huchafua hewa na kusababisha magonjwa",
      "Ukataji miti holela husababisha mmomonyoko wa udongo",
    ],
    hafailiVidokezo: [
      "Wanafunzi walifurahia mchezo wa kuigiza shuleni",
      "Bei ya mafuta ya taa imeshuka mwezi huu",
      "Shule yetu ilishinda mashindano ya muziki mwaka jana",
    ],
  },
  {
    mada: "Faida za Michezo Shuleni",
    vidokezo: [
      "Michezo husaidia wanafunzi kudumisha afya bora ya mwili",
      "Michezo hufunza ushirikiano na kazi ya pamoja miongoni mwa wanafunzi",
      "Michezo huwapa wanafunzi nafasi ya kuonyesha vipaji vyao",
    ],
    hafailiVidokezo: [
      "Maktaba ya shule ina vitabu vingi vya hadithi",
      "Mvua ilinyesha sana mwezi wa Aprili mwaka huu",
      "Mwalimu mkuu alitembelea ofisi ya elimu wilayani",
    ],
  },
];

const HATUA_KUANDIKA_INSHA = [
  { id: "chagua", label: "Chagua mada na ujumbe unaotaka kuuwasilisha kupitia insha" },
  { id: "vidokezo", label: "Andika vidokezo vinavyolingana na mada na ujumbe huo" },
  { id: "panga", label: "Panga vidokezo kwa mfuatano wa kimantiki — utangulizi, kati, hitimisho" },
  { id: "andika", label: "Andika insha kamili ukizingatia vidokezo vilivyopangwa" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Vidokezo ni muhimu kwa nini kabla ya kuandika insha ya kubuni?",
    sahihi: "Huongoza mawazo ya mwandishi ili insha ibaki na mfuatano mzuri na isipotoke kutoka mada",
    makosa: [
      "Huifanya insha kuwa ndefu zaidi bila sababu",
      "Huondoa haja ya kuwa na mada kabisa",
      "Hutumika tu insha inapokuwa fupi",
    ],
  },
  {
    swali: "Wazo lifuatalo lingefaa kama kidokezo cha mada 'Umuhimu wa Maji Safi': lipi kati ya haya?",
    sahihi: "Maji safi hupunguza magonjwa yatokanayo na maji machafu kama kipindupindu",
    makosa: [
      "Bei ya matunda imepanda sokoni wiki hii",
      "Timu ya mpira ilishinda ligi ya shule mwaka jana",
      "Mvua kubwa ilisababisha barabara kuharibika",
    ],
  },
  {
    swali: "Baada ya kuchagua mada na kuandaa vidokezo, hatua inayofuata ni ipi?",
    sahihi: "Kupanga vidokezo hivyo kwa mfuatano wa kimantiki kabla ya kuandika insha kamili",
    makosa: [
      "Kuchapisha insha bila kusoma tena",
      "Kufuta vidokezo vyote na kuanza upya",
      "Kuuliza rafiki aandike insha badala yako",
    ],
  },
  {
    swali: "Mwanafunzi anaandika insha yenye mada 'Faida za Kusoma Vitabu' lakini anaingiza kidokezo kuhusu bei ya mafuta ya taa. Tatizo ni lipi?",
    sahihi: "Kidokezo hicho hakiwiani na mada, hivyo kinapotosha ujumbe wa insha",
    makosa: [
      "Hakuna tatizo, vidokezo vyote vinafaa katika insha yoyote",
      "Tatizo ni kwamba kidokezo hicho ni kifupi mno",
      "Tatizo ni kwamba kidokezo hicho hakina kitenzi",
    ],
  },
];

export const inshaKubuniUjumla: Skill = {
  id: "g7-ksw-ka-insha-kubuni-ujumla",
  code: "KA.3",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Insha za Kubuni: Kuteua Mada na Vidokezo",
  description: "Teua mada na ujumbe wa insha, andaa vidokezo vinavyolingana na mada, na uvipange kwa mfuatano ufaao.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);

    if (branch === "match") {
      const items = [
        { id: "mada", term: "Mada", maelezo: "Kichwa kikuu au anwani inayoelekeza kile insha nzima itakachozungumzia" },
        { id: "ujumbe", term: "Ujumbe wa insha", maelezo: "Wazo kuu au somo la maadili unalotaka msomaji alichukue baada ya kusoma insha" },
        { id: "vidokezo", term: "Vidokezo", maelezo: "Mambo mafupi yanayoongoza mawazo yako kabla ya kuandika insha kamili" },
        { id: "mpangilio", term: "Mpangilio wa vidokezo", maelezo: "Jinsi vidokezo vinavyopangwa kwa mfuatano wa kimantiki — utangulizi, kati, hitimisho" },
      ];
      const tokens = shuffle(rng, items.map((i) => ({ id: i.id, label: i.maelezo })));
      const targets = shuffle(rng, items.map((i) => ({ id: i.id, label: i.term })));
      const correctMap: Record<string, string> = {};
      for (const i of items) correctMap[i.id] = i.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila istilahi ya kupanga insha ya kubuni na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Mada ni kichwa; ujumbe ni wazo kuu; vidokezo huongoza maandishi; mpangilio huvipa mfuatano.",
        explanation: items.map((i) => `${i.term} — ${i.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const entry = randChoice(rng, MADA_NA_VIDOKEZO);
      const yanafaa = shuffle(rng, entry.vidokezo).slice(0, 3);
      const hayafai = shuffle(rng, entry.hafailiVidokezo).slice(0, 3);
      const items = shuffle(rng, [
        ...yanafaa.map((label) => ({ id: `y-${label}`, label, bucket: "yanafaa" })),
        ...hayafai.map((label) => ({ id: `h-${label}`, label, bucket: "hayafai" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: `Mada ya insha ni "${entry.mada}". Panga vidokezo hivi kulingana na kama vinalingana na mada hiyo au la.`,
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "yanafaa", label: "Vinalingana na Mada" },
          { id: "hayafai", label: "Havilingani na Mada" },
        ],
        correctBucket,
        hint: "Kidokezo kinachofaa huhusiana moja kwa moja na mada iliyotolewa.",
        explanation: `Kwa mada "${entry.mada}": vinavyolingana ni ${yanafaa.join(" / ")}. Visivyolingana ni ${hayafai.join(" / ")}.`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HATUA_KUANDIKA_INSHA);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kuandaa na kuandika insha ya kubuni kwa mpangilio sahihi.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_KUANDIKA_INSHA.map((h) => h.id),
        hint: "Anza kwa kuteua mada, andaa vidokezo, vipange, kisha uandike insha kamili.",
        explanation: HATUA_KUANDIKA_INSHA.map((h) => h.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, MADA_NA_VIDOKEZO);
      const kidokezoSahihi = randChoice(rng, entry.vidokezo);
      const maneno = kidokezoSahihi.split(" ");
      const nenoLaKwanza = maneno[0];
      const baki = maneno.slice(1).join(" ");
      return {
        kind: "fill-blank",
        prompt: `Mada ya insha ni "${entry.mada}". Kamilisha neno la kwanza linalokosekana la kidokezo hiki kinacholingana na mada.`,
        before: "",
        after: ` ${baki}.`,
        correctAnswer: nenoLaKwanza,
        inputMode: "text",
        hint: `Fikiria kuhusu mada "${entry.mada}" na kidokezo kinachohusiana nayo moja kwa moja.`,
        explanation: `Kidokezo kamili kinachofaa mada hii ni: "${kidokezoSahihi}".`,
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
      hint: "Zingatia jinsi mada, ujumbe na vidokezo vinavyohusiana katika insha ya kubuni.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
