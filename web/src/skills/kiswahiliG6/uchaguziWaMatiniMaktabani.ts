import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// mada 7.2.1 (Majanga) + mada 9.2.1 (Afya ya Akili), zimeunganishwa: uchaguzi wa matini maktabani —
// kuzingatia umri, ukubwa wa maandishi na ujumbe unaotakiwa — pamoja na msamiati wa majanga.

const MAJINA = [
  "Amani", "Brenda", "Cheruiyot", "Diana", "Emmanuel", "Faith", "Gideon", "Halima",
  "Irene", "Juma", "Kevin", "Lilian", "Moraa", "Naliaka", "Otieno", "Peter",
  "Quinter", "Rehema", "Salim", "Tabitha",
];

const MAENEO = [
  "Kericho", "Nakuru", "Kisumu", "Machakos", "Eldoret", "Mombasa", "Nyeri",
  "Garissa", "Kitale", "Kakamega", "Kajiado", "Meru",
];

type Aina = "vitabu" | "magazeti" | "majarida";

interface Matini {
  jina: string;
  aina: Aina;
}

const MATINI: Matini[] = [
  { jina: "Kitabu cha hadithi za kubuni", aina: "vitabu" },
  { jina: "Kitabu cha kiada cha hisabati", aina: "vitabu" },
  { jina: "Kamusi (kitabu cha marejeleo)", aina: "vitabu" },
  { jina: "Ensaiklopidia ya wanyama", aina: "vitabu" },
  { jina: "Riwaya fupi", aina: "vitabu" },
  { jina: "Kitabu cha ushairi", aina: "vitabu" },
  { jina: "Kitabu cha wasifu wa shujaa", aina: "vitabu" },
  { jina: "Gazeti la kila siku la habari", aina: "magazeti" },
  { jina: "Gazeti la michezo la wikendi", aina: "magazeti" },
  { jina: "Gazeti la matangazo ya biashara", aina: "magazeti" },
  { jina: "Jarida la watoto lenye hadithi na michoro", aina: "majarida" },
  { jina: "Jarida la sayansi na teknolojia", aina: "majarida" },
  { jina: "Jarida la mitindo na maisha", aina: "majarida" },
  { jina: "Jarida la afya na lishe", aina: "majarida" },
];

const AINA_LABELS: Record<Aina, string> = { vitabu: "Vitabu", magazeti: "Magazeti", majarida: "Majarida" };

type Sababu = "hewa" | "jiolojia" | "afya";

interface Janga {
  neno: string;
  maana: string;
  sababu: Sababu;
}

const MAJANGA: Janga[] = [
  { neno: "Mafuriko", maana: "maji mengi yanayofurika baada ya mvua kubwa na kufunika maeneo makavu", sababu: "hewa" },
  { neno: "Ukame", maana: "kipindi kirefu cha ukosefu wa mvua kinachosababisha uhaba wa maji na chakula", sababu: "hewa" },
  { neno: "Kimbunga", maana: "upepo mkali sana unaozunguka na kuweza kubomoa nyumba na miti", sababu: "hewa" },
  { neno: "Moto wa mwituni", maana: "moto unaowaka bila kudhibitiwa msituni au nyasini, mara nyingi wakati wa kiangazi", sababu: "hewa" },
  { neno: "Mitetemeko ya ardhi", maana: "mtikisiko wa ghafla wa ardhi unaosababishwa na msukosuko chini ya uso wa dunia", sababu: "jiolojia" },
  { neno: "Maporomoko ya ardhi", maana: "udongo, mawe au miamba kuanguka ghafla mlimani au genge, mara nyingi baada ya mvua kubwa", sababu: "jiolojia" },
  { neno: "Mmomonyoko wa udongo", maana: "udongo wa juu kuondolewa taratibu na maji au upepo, na kuacha ardhi isiyo na rutuba", sababu: "jiolojia" },
  { neno: "Mlipuko wa volkano", maana: "mwamba ulioyeyuka na gesi kutoka ndani ya dunia kutoka kwa ghafla juu ya uso", sababu: "jiolojia" },
  { neno: "Mkurupuko wa kipindupindu", maana: "ugonjwa unaosambaa kwa haraka kutokana na maji au chakula kilichochafuliwa", sababu: "afya" },
  { neno: "Mkurupuko wa malaria", maana: "ugonjwa unaosambaa kwa haraka kupitia mbu katika msimu wa mvua", sababu: "afya" },
  { neno: "Mkurupuko wa homa ya matumbo", maana: "ugonjwa unaosambaa kwa haraka kutokana na usafi hafifu wa maji na chakula", sababu: "afya" },
  { neno: "Mkurupuko wa surua", maana: "ugonjwa wa kuambukiza unaosambaa kwa haraka miongoni mwa watoto wasiochanjwa", sababu: "afya" },
];

const SABABU_LABELS: Record<Sababu, string> = {
  hewa: "Hali ya Hewa",
  jiolojia: "Kijiolojia",
  afya: "Kiafya",
};

interface FillTpl {
  before: string;
  after: string;
  correctAnswer: string;
  explanation: string;
}

const FILL_TEMPLATES: FillTpl[] = [
  {
    before: "Kigezo cha kuzingatia rika la msomaji ili kitabu kiwe na maudhui na lugha zinazofaa, huitwa",
    after: ".",
    correctAnswer: "umri",
    explanation: "Umri wa msomaji huamua kama maudhui na lugha ya kitabu yanafaa hatua yake ya kimaendeleo.",
  },
  {
    before: "Kabla ya kuchagua kitabu maktabani, ni muhimu kuzingatia",
    after: "wa msomaji ili maudhui yafae.",
    correctAnswer: "umri",
    explanation: "Kigezo cha umri huhakikisha maudhui ya kitabu yanafaa rika la msomaji.",
  },
  {
    before: "Kigezo cha kuangalia kama herufi za kitabu ni kubwa vya kutosha kusomeka kirahisi huitwa",
    after: "wa maandishi.",
    correctAnswer: "ukubwa",
    explanation: "Ukubwa wa maandishi huathiri jinsi kitabu kinavyosomeka kirahisi, hasa kwa wenye tatizo la kuona.",
  },
  {
    before: "Msomaji mwenye matatizo ya kuona anapaswa kuzingatia",
    after: "wa herufi kabla ya kuchagua kitabu.",
    correctAnswer: "ukubwa",
    explanation: "Ukubwa wa maandishi ni kigezo muhimu kwa wasomaji wenye changamoto za kuona.",
  },
  {
    before: "Kigezo cha kuzingatia lengo au habari anayoitafuta msomaji kabla ya kuchagua kitabu huitwa",
    after: "unaotakiwa.",
    correctAnswer: "ujumbe",
    explanation: "Ujumbe unaotakiwa ni lengo au habari mahususi anayoitafuta msomaji.",
  },
  {
    before: "Kabla ya kuchagua kitabu, msomaji anapaswa kujiuliza ni",
    after: "gani anaoutafuta.",
    correctAnswer: "ujumbe",
    explanation: "Kufahamu ujumbe unaotakiwa humwongoza msomaji kuchagua matini inayolingana na lengo lake.",
  },
  {
    before: "Kitabu chenye habari za kila siku kama matukio na siasa huitwa",
    after: ".",
    correctAnswer: "gazeti",
    explanation: "Gazeti huchapishwa kila siku au mara kwa mara likiwa na habari za matukio ya sasa.",
  },
  {
    before: "Machapisho yanayotoka mara kwa mara yenye makala maalum kama sayansi au mitindo huitwa",
    after: ".",
    correctAnswer: "jarida",
    explanation: "Jarida huchapishwa mara kwa mara (kwa mfano kila mwezi) na huzingatia mada mahususi.",
  },
  {
    before: "Chapisho lenye kurasa nyingi, jalada gumu au laini, lenye hadithi au maelezo marefu huitwa",
    after: ".",
    correctAnswer: "kitabu",
    explanation: "Kitabu ni chapisho lenye kurasa nyingi zenye maudhui marefu zaidi kuliko gazeti au jarida.",
  },
  {
    before: "Sehemu ya nyuma ya kitabu yenye maelezo mafupi kuhusu maudhui yake huitwa",
    after: "ya jalada.",
    correctAnswer: "muhtasari",
    explanation: "Muhtasari wa jalada humsaidia msomaji kufahamu kwa haraka kitabu kinahusu nini kabla ya kukisoma.",
  },
];

interface ReaderScenario {
  build: (name: string, place: string) => string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const READER_SCENARIOS: ReaderScenario[] = [
  {
    build: (name, place) => `${name}, mwenye umri wa miaka 6 kule ${place}, anataka kuanza kupenda kusoma. Ni kitabu gani kinachomfaa zaidi?`,
    correct: "Kitabu chenye picha nyingi na maneno machache",
    distractors: ["Ensaiklopidia yenye maandishi madogo na maelezo marefu", "Gazeti la kila siku la habari za kisiasa", "Jarida la sayansi lenye istilahi ngumu"],
    explanation: "Kwa mtoto wa miaka 6, kigezo cha umri kinahitaji kitabu chenye maudhui na lugha rahisi — picha nyingi na maneno machache.",
  },
  {
    build: (name) => `${name} ana tatizo dogo la kuona na anahitaji kitabu cha kusoma kirahisi bila kuchuja macho. Ni kitabu gani kinachomfaa?`,
    correct: "Kitabu chenye herufi kubwa",
    distractors: ["Kitabu chenye herufi ndogo sana zilizosongamana", "Jarida lenye maandishi madogo yaliyosongamana", "Gazeti lenye safu nyembamba za maandishi madogo"],
    explanation: "Kigezo cha ukubwa wa maandishi ni muhimu hasa kwa msomaji mwenye changamoto ya kuona.",
  },
  {
    build: (name, place) => `${name} anataka kujua matokeo ya mchezo wa mpira uliochezwa jana ${place}. Ni matini gani inayomfaa?`,
    correct: "Gazeti la michezo la siku hiyo",
    distractors: ["Kitabu cha ushairi", "Jarida la mitindo na maisha", "Kamusi (kitabu cha marejeleo)"],
    explanation: "Kwa kuwa ujumbe anaoutafutwa ni habari za mchezo za hivi karibuni, gazeti la michezo ndilo lenye habari za kila siku.",
  },
  {
    build: (name) => `${name}, mwanafunzi wa darasa la sita, anataka kutafuta maana sahihi ya neno gumu alilolisoma darasani. Ni matini gani inayomfaa?`,
    correct: "Kamusi (kitabu cha marejeleo)",
    distractors: ["Riwaya fupi ya kubuni", "Gazeti la matangazo ya biashara", "Jarida la mitindo na maisha"],
    explanation: "Ujumbe anaoutafuta ni maana ya neno — kamusi ni kitabu cha marejeleo kilichoundwa kwa lengo hilo.",
  },
  {
    build: (name) => `${name} anapenda kujifunza mambo mapya ya sayansi na teknolojia kila mwezi. Ni matini gani inayomfaa?`,
    correct: "Jarida la sayansi na teknolojia",
    distractors: ["Gazeti la kila siku la habari", "Kitabu cha hadithi za kubuni", "Kamusi (kitabu cha marejeleo)"],
    explanation: "Jarida la sayansi huchapishwa mara kwa mara na huzingatia hasa mada za sayansi na teknolojia, kulingana na ujumbe anaoutafuta.",
  },
  {
    build: (name, place) => `${name}, kijana mkubwa kule ${place}, anataka kusoma kuhusu maisha ya mtu maarufu aliyefanikiwa. Ni kitabu gani kinachomfaa?`,
    correct: "Kitabu cha wasifu",
    distractors: ["Kitabu cha hadithi za watoto chenye picha nyingi", "Jarida la watoto lenye hadithi na michoro", "Gazeti la matangazo ya biashara"],
    explanation: "Kitabu cha wasifu huelezea maisha halisi ya mtu, kinachofaa ujumbe anaoutafuta msomaji.",
  },
  {
    build: (name) => `${name} anahitaji kitabu cha kujisomea nyumbani kinachofundisha hesabu za darasa lake. Ni kitabu gani kinachomfaa?`,
    correct: "Kitabu cha kiada cha hisabati",
    distractors: ["Riwaya fupi", "Gazeti la michezo la wikendi", "Jarida la mitindo na maisha"],
    explanation: "Kitabu cha kiada ndicho kilichoandikwa mahususi kufundisha somo la darasani analosoma msomaji.",
  },
  {
    build: (name) => `${name} anataka kusoma mashairi mazuri wakati wa mapumziko. Ni kitabu gani kinachomfaa?`,
    correct: "Kitabu cha ushairi",
    distractors: ["Kamusi (kitabu cha marejeleo)", "Gazeti la kila siku la habari", "Jarida la afya na lishe"],
    explanation: "Kitabu cha ushairi ndicho chenye maudhui ya mashairi anayoyatafuta msomaji.",
  },
  {
    build: (name) => `${name} anataka kufahamu magonjwa ya kawaida na jinsi ya kujikinga nayo. Ni matini gani inayomfaa?`,
    correct: "Jarida la afya na lishe",
    distractors: ["Kitabu cha ushairi", "Gazeti la michezo la wikendi", "Riwaya fupi"],
    explanation: "Jarida la afya na lishe huzingatia mada za kiafya, sawa na ujumbe anaoutafuta msomaji.",
  },
  {
    build: (name, place) => `${name}, mtoto mdogo sana kule ${place}, anataka jarida lenye hadithi fupi na michoro ya rangi. Ni matini gani inayomfaa?`,
    correct: "Jarida la watoto lenye hadithi na michoro",
    distractors: ["Ensaiklopidia yenye maandishi mazito", "Gazeti la kila siku la habari za kisiasa", "Kitabu cha wasifu wa shujaa"],
    explanation: "Kwa mtoto mdogo, jarida la watoto lenye hadithi fupi na michoro ndilo linalofaa umri wake.",
  },
];

const HATUA = [
  { id: "h1", label: "Tambua unachotafuta (mada au ujumbe unaotakiwa)" },
  { id: "h2", label: "Angalia jina la kitabu na mwandishi wake" },
  { id: "h3", label: "Soma muhtasari wa jalada kufahamu maudhui" },
  { id: "h4", label: "Angalia ukubwa wa maandishi kulingana na uwezo wako wa kusoma" },
  { id: "h5", label: "Chagua kitabu kifaacho zaidi mahitaji yako" },
];

export const uchaguziWaMatiniMaktabani: Skill = {
  id: "g6-ksw-ks-uchaguzi-wa-matini-maktabani",
  code: "KS.7",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ks",
  grade: 6,
  title: "Kusoma kwa Mapana: Uchaguzi wa Matini Maktabani",
  description: "Jifunze jinsi ya kuchagua matini ifaayo maktabani kwa kuzingatia umri, ukubwa wa maandishi na ujumbe unaotakiwa, pamoja na msamiati wa majanga.",
  generate(rng) {
    const branch = randChoice(rng, ["msomaji", "janga", "categorize", "match", "fill", "order"] as const);
    const hint = "Zingatia vigezo vitatu: umri wa msomaji, ukubwa wa maandishi, na ujumbe (lengo) anaoutafuta.";

    if (branch === "msomaji") {
      const scenario = randChoice(rng, READER_SCENARIOS);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAENEO);
      const choices = shuffle(rng, [scenario.correct, ...scenario.distractors]);
      return {
        kind: "multiple-choice",
        prompt: scenario.build(name, place),
        choices,
        correctIndex: choices.indexOf(scenario.correct),
        layout: "list",
        hint,
        explanation: scenario.explanation,
      };
    }

    if (branch === "janga") {
      const janga = randChoice(rng, MAJANGA);
      const cluster = MAJANGA.filter((j) => j.sababu === janga.sababu && j.neno !== janga.neno);
      const otherCluster = MAJANGA.filter((j) => j.sababu !== janga.sababu && j.neno !== janga.neno);
      const distractors = shuffle(rng, cluster).slice(0, 2);
      while (distractors.length < 3) {
        const pick = randChoice(rng, otherCluster);
        if (!distractors.some((d) => d.neno === pick.neno)) distractors.push(pick);
      }
      const choices = shuffle(rng, [janga.neno, ...distractors.slice(0, 3).map((d) => d.neno)]);
      return {
        kind: "multiple-choice",
        prompt: `Janga hili ni ${janga.maana}. Ni janga gani linaloelezwa hapa?`,
        choices,
        correctIndex: choices.indexOf(janga.neno),
        layout: "list",
        hint: "Fikiria kama chanzo cha janga ni hali ya hewa, jiolojia (chini ya ardhi), au kiafya.",
        explanation: `${janga.neno} ni ${janga.maana}.`,
      };
    }

    if (branch === "categorize") {
      if (rng() < 0.5) {
        const items = MATINI.map((m, i) => ({ id: `m${i}`, label: m.jina, bucket: m.aina }));
        const correctBucket: Record<string, string> = {};
        for (const it of items) correctBucket[it.id] = it.bucket;
        return {
          kind: "categorize",
          prompt: "Panga kila matini maktabani kulingana na aina yake — vitabu, magazeti au majarida.",
          items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
          buckets: [
            { id: "vitabu", label: AINA_LABELS.vitabu },
            { id: "magazeti", label: AINA_LABELS.magazeti },
            { id: "majarida", label: AINA_LABELS.majarida },
          ],
          correctBucket,
          hint: "Vitabu vina kurasa nyingi za maudhui marefu; magazeti hutoka kila siku/wiki na habari za sasa; majarida huzingatia mada mahususi mara kwa mara.",
          explanation: MATINI.map((m) => `"${m.jina}" ni ${AINA_LABELS[m.aina].toLowerCase()}.`).join(" "),
        };
      }
      const items = MAJANGA.map((j, i) => ({ id: `j${i}`, label: j.neno, bucket: j.sababu }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila janga kulingana na chanzo chake — hali ya hewa, kijiolojia au kiafya.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "hewa", label: SABABU_LABELS.hewa },
          { id: "jiolojia", label: SABABU_LABELS.jiolojia },
          { id: "afya", label: SABABU_LABELS.afya },
        ],
        correctBucket,
        hint: "Mafuriko/ukame/kimbunga/moto wa mwituni chanzo chao ni hali ya hewa; mitetemeko/maporomoko/mmomonyoko/volkano ni kijiolojia; mkurupuko wa magonjwa ni kiafya.",
        explanation: MAJANGA.map((j) => `${j.neno} ni janga la ${SABABU_LABELS[j.sababu].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, MAJANGA).slice(0, 8);
      const tokens = shuffle(rng, chosen.map((j) => ({ id: j.neno, label: j.neno })));
      const targets = shuffle(rng, chosen.map((j) => ({ id: j.neno, label: j.maana })));
      const correctMap: Record<string, string> = {};
      for (const j of chosen) correctMap[j.neno] = j.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila janga na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Soma maelezo kwa makini kabla ya kuoanisha na jina la janga.",
        explanation: chosen.map((j) => `${j.neno} — ${j.maana}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const tpl = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu uchaguzi wa matini maktabani.",
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
      prompt: "Panga hatua zifuatazo za kuchagua kitabu kifaacho maktabani.",
      instruction: "Bofya hatua kwa mfuatano sahihi.",
      items: shuffle(rng, HATUA),
      correctOrder: HATUA.map((h) => h.id),
      hint: "Anza kwa kutambua unachotafuta, kisha uchunguze kitabu, kabla ya kukichagua.",
      explanation: HATUA.map((h) => h.label).join(" → "),
    };
  },
};
