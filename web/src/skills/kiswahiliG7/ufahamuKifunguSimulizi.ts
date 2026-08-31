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
  nenoKujaza: { before: string; after: string; neno: string };
}

const VIFUNGU: Kifungu[] = [
  {
    text: "Kila Jumamosi, Amina humsaidia bibi yake, Mama Fatuma, kuuza mandazi katika soko la Gikomba. Asubuhi moja, mteja mmoja alinunua mandazi matano na kumpa Amina noti ya elfu moja, kisha akaondoka haraka bila kusubiri chenji yake. Kwanza, Amina alimwita mteja huyo kwa sauti, lakini alikuwa ameshapotea kwenye msongamano wa watu. Kisha, aliweka pesa za chenji pembeni akisubiri mteja arudi. Baadaye, alipomaliza mauzo ya siku hiyo, aliuliza wafanyabiashara wa jirani kama wamemwona mteja huyo. Mwishoni, mteja alirudi jioni akitafuta chenji yake, na Amina alimkabidhi pesa zote bila kupunguza senti moja.",
    matukio: [
      "Mteja kununua mandazi na kutoa noti ya elfu moja kisha kuondoka haraka",
      "Amina kumwita mteja kwa sauti bila mafanikio",
      "Kuweka chenji pembeni akisubiri mteja arudi",
      "Kumkabidhi mteja chenji yake yote jioni",
    ],
    mahususi: {
      prompt: "Amina alifanya nini na chenji ya mteja aliyeondoka haraka?",
      choices: [
        "Aliiweka pembeni akisubiri mteja arudi",
        "Aliitumia kununua chakula chake mwenyewe",
        "Alimpa mfanyabiashara mwingine",
        "Aliificha nyumbani kwa bibi yake",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinasema Amina \"aliweka pesa za chenji pembeni akisubiri mteja arudi\".",
    },
    tabiri: {
      prompt: "Kutokana na tabia ya Amina ya kutunza chenji na kuirejesha, ni nini kinachoweza kutokea kwa biashara ya bibi yake siku za usoni?",
      choices: [
        "Wateja wataendelea kuiamini na kununua kwa bibi yake Mama Fatuma",
        "Wateja wataacha kabisa kununua mandazi hapo",
        "Soko litafungwa na mamlaka",
        "Bei ya mandazi itapanda maradufu",
      ],
      correctIndex: 0,
      explanation: "Uaminifu wa Amina wa kurejesha chenji yote bila kupunguza senti moja huimarisha imani ya wateja kwa biashara hiyo.",
    },
    msamiati: [
      { neno: "msongamano", maana: "hali ya watu au vitu vingi kukusanyika mahali pamoja" },
      { neno: "kukabidhi", maana: "kumpa mtu kitu rasmi mikononi mwake" },
      { neno: "chenji", maana: "pesa za ziada anazorudishiwa mnunuzi baada ya kulipa zaidi ya bei" },
    ],
    kauli: [
      { text: "Amina humsaidia bibi yake kuuza mandazi kila Jumamosi.", kweli: true },
      { text: "Mteja alisubiri chenji yake papo hapo.", kweli: false },
      { text: "Amina aliuliza wafanyabiashara wa jirani kuhusu mteja.", kweli: true },
      { text: "Amina aliamua kutumia pesa za chenji mwenyewe.", kweli: false },
    ],
    nenoKujaza: { before: "Pesa za ziada anazorudishiwa mnunuzi baada ya kulipa zaidi ya bei huitwa", after: ".", neno: "chenji" },
  },
  {
    text: "Timu ya netiboli ya Shule ya Upili ya Naivasha ilifanya mazoezi kwa miezi mitatu kabla ya mashindano ya kaunti yaliyofanyika Nakuru. Kwanza, kocha aliwapanga wachezaji vikundi vidogo kulingana na nafasi zao uwanjani. Kisha, walifanya mazoezi ya kupokea na kupitisha mpira kwa haraka bila kuudondosha. Baadaye, siku moja kabla ya mashindano, walicheza mchezo wa kirafiki dhidi ya shule jirani ili kujipima. Mwishoni, siku ya mashindano ilipowadia, timu ilishinda fainali kwa alama 24 dhidi ya 19 na kuchukua kombe la kwanza kwa shule hiyo.",
    matukio: [
      "Kocha kuwapanga wachezaji vikundi kulingana na nafasi zao",
      "Kufanya mazoezi ya kupokea na kupitisha mpira kwa haraka",
      "Kucheza mchezo wa kirafiki dhidi ya shule jirani",
      "Kushinda fainali na kuchukua kombe la kwanza",
    ],
    mahususi: {
      prompt: "Timu ilifanya nini siku moja kabla ya mashindano?",
      choices: [
        "Walicheza mchezo wa kirafiki dhidi ya shule jirani",
        "Walipumzika nyumbani bila mazoezi",
        "Walibadilisha kocha wao",
        "Walisafiri kwenda jiji la Mombasa",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinasema \"siku moja kabla ya mashindano, walicheza mchezo wa kirafiki dhidi ya shule jirani ili kujipima\".",
    },
    tabiri: {
      prompt: "Kwa kuzingatia ushindi huo wa kwanza kwa shule, ni nini kinachoweza kutarajiwa msimu ujao?",
      choices: [
        "Wanafunzi wengi zaidi wanaweza kuvutiwa kujiunga na timu ya netiboli",
        "Shule itafunga klabu ya michezo",
        "Wachezaji wote watahamishiwa shule nyingine",
        "Mashindano ya kaunti yatafutwa kabisa",
      ],
      correctIndex: 0,
      explanation: "Ushindi wa kwanza wa aina hiyo mara nyingi huvutia wanafunzi wengine kupenda kujiunga na timu iliyofanikiwa.",
    },
    msamiati: [
      { neno: "kujipima", maana: "kujaribu uwezo wako dhidi ya mpinzani kabla ya tukio kuu" },
      { neno: "kuudondosha", maana: "kuuacha mpira au kitu kianguke chini bila kukusudia" },
      { neno: "kombe", maana: "zawadi ya ushindi inayotolewa kwa timu au mtu bora" },
    ],
    kauli: [
      { text: "Timu ilifanya mazoezi kwa miezi mitatu.", kweli: true },
      { text: "Mashindano yalifanyika mjini Nakuru.", kweli: true },
      { text: "Timu ilishinda fainali kwa alama sawa.", kweli: false },
      { text: "Kocha hakuwapanga wachezaji vikundi vyovyote.", kweli: false },
    ],
    nenoKujaza: { before: "Zawadi ya ushindi inayotolewa kwa timu bora huitwa", after: ".", neno: "kombe" },
  },
  {
    text: "Familia ya Chebet huishi katika shamba dogo karibu na mji wa Kitale, mahali panapofaa kwa kilimo cha mahindi. Wiki iliyopita, wakati wa msimu wa mavuno, familia nzima iliamka mapema kuvuna shamba lao kabla mvua isije ikaharibu mazao. Kwanza, baba na wavulana walikata mabua ya mahindi kwa mapanga. Kisha, mama na wasichana walichuma magunzi na kuyaweka kwenye vikapu. Baadaye, walibeba magunzi hayo hadi banda la kuhifadhia nafaka karibu na nyumba yao. Mwishoni, jioni hiyo, familia iliketi pamoja kubagua mahindi mazuri kwa ajili ya kuuza sokoni na mabaya kwa ajili ya chakula cha mifugo.",
    matukio: [
      "Baba na wavulana kukata mabua ya mahindi kwa mapanga",
      "Mama na wasichana kuchuma magunzi na kuyaweka vikapuni",
      "Kubeba magunzi hadi banda la kuhifadhia nafaka",
      "Familia kuketi pamoja kubagua mahindi jioni",
    ],
    mahususi: {
      prompt: "Kwa nini familia ya Chebet iliamka mapema kuvuna shamba lao?",
      choices: [
        "Ili kuvuna kabla mvua isije ikaharibu mazao",
        "Ili kuuza shamba lao haraka",
        "Ili kuwakaribisha wageni waliokuwa wakija",
        "Ili kuepuka kulipa kodi ya shamba",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinasema waliamka mapema \"kuvuna shamba lao kabla mvua isije ikaharibu mazao\".",
    },
    tabiri: {
      prompt: "Kutokana na jinsi familia ilivyobagua mahindi mazuri na mabaya, ni nini kinachoweza kutokea baadaye?",
      choices: [
        "Watauza mahindi mazuri sokoni na kutumia mabaya kulisha mifugo yao",
        "Watatupa mahindi yote bila matumizi",
        "Watawapa majirani mahindi yote bure",
        "Hawatavuna tena msimu ujao",
      ],
      correctIndex: 0,
      explanation: "Kwa vile walibagua mahindi \"kwa ajili ya kuuza sokoni na mabaya kwa ajili ya chakula cha mifugo\", hayo ndiyo matumizi yanayotarajiwa.",
    },
    msamiati: [
      { neno: "magunzi", maana: "vibonge vya mahindi vyenye punje kabla ya kupurwa" },
      { neno: "kubagua", maana: "kutenganisha vitu kulingana na ubora au aina" },
      { neno: "banda", maana: "jengo dogo la kuhifadhia nafaka au mifugo" },
    ],
    kauli: [
      { text: "Familia ya Chebet inaishi karibu na Kitale.", kweli: true },
      { text: "Waliuza mahindi yote bila kubagua.", kweli: false },
      { text: "Mama na wasichana walichuma magunzi.", kweli: true },
      { text: "Baba na wavulana ndio waliobeba magunzi peke yao hadi bandani.", kweli: false },
    ],
    nenoKujaza: { before: "Vibonge vya mahindi vyenye punje kabla ya kupurwa huitwa", after: ".", neno: "magunzi" },
  },
];

export const ufahamuKifunguSimulizi: Skill = {
  id: "g7-ksw-ks-ufahamu-kifungu-simulizi",
  code: "KS.1",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Ufahamu wa Kifungu cha Simulizi",
  description: "Soma hadithi fupi kisha udondoe habari mahususi, upange matukio, ufanye utabiri na ufasiri, na ueleze maana za msamiati.",
  generate(rng) {
    const kifungu = randChoice(rng, VIFUNGU);
    const branch = randChoice(rng, ["order", "msamiati", "kauli", "fill", "mahususi", "tabiri"] as const);
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

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        passage: kifungu.text,
        prompt: "Kamilisha sentensi kwa neno linalotokana na msamiati wa kifungu.",
        before: kifungu.nenoKujaza.before,
        after: kifungu.nenoKujaza.after,
        correctAnswer: kifungu.nenoKujaza.neno,
        inputMode: "text",
        hint: hintUjumla,
        explanation: `Neno "${kifungu.nenoKujaza.neno}" ndilo linalofaa hapa kama linavyotumika katika kifungu.`,
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
