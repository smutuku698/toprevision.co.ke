import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Kundi = "bidii" | "ushirikiano" | "kumaliza";

const KUNDI_LABEL: Record<Kundi, string> = {
  bidii: "Kuhusu Bidii",
  ushirikiano: "Kuhusu Ushirikiano",
  kumaliza: "Kuhusu Kumaliza Kazi",
};

const NAHAU: { neno: string; maana: string; kundi: Kundi }[] = [
  // Bidii — kuhusu kufanya kazi kwa juhudi
  { neno: "chapa kazi", maana: "kufanya kazi kwa bidii na kujituma", kundi: "bidii" },
  { neno: "vunja jasho", maana: "kufanya kazi kwa bidii sana hadi kutokwa jasho jingi", kundi: "bidii" },
  { neno: "toa jasho", maana: "kujitolea kikamilifu katika kazi ngumu", kundi: "bidii" },
  { neno: "kaza buti", maana: "kujiandaa kikamilifu kwa kazi ngumu iliyo mbele", kundi: "bidii" },
  { neno: "tia bidii", maana: "kujitahidi sana kutimiza jambo fulani", kundi: "bidii" },
  { neno: "shika kazi", maana: "kuanza kufanya kazi kwa dhati bila kuchelewa", kundi: "bidii" },
  { neno: "piga msasa", maana: "kufanya kazi kwa umakini mkubwa hadi ikamilike vizuri sana", kundi: "bidii" },
  { neno: "jitolea roho na moyo", maana: "kufanya kazi kwa moyo wote bila kinyongo", kundi: "bidii" },
  { neno: "simama kidete", maana: "kusimama imara bila kukata tamaa unapokabiliwa na ugumu", kundi: "bidii" },
  { neno: "tia fora", maana: "kuwazidi wenzako kwa bidii na ufanisi", kundi: "bidii" },
  { neno: "fyeka njia", maana: "kuwa wa kwanza kuvumilia ugumu ili wengine wafuate kwa urahisi", kundi: "bidii" },
  { neno: "piga jeki", maana: "kujitahidi kuinua au kuboresha hali fulani", kundi: "bidii" },
  // Ushirikiano — kuhusu kufanya kazi kwa pamoja
  { neno: "changa bia", maana: "kuchangia pamoja rasilimali kwa lengo moja", kundi: "ushirikiano" },
  { neno: "sema kwa sauti moja", maana: "kukubaliana na kutoa msimamo mmoja kama kikundi", kundi: "ushirikiano" },
  { neno: "weka bega kwa bega", maana: "kushirikiana kwa karibu bila ubaguzi wowote", kundi: "ushirikiano" },
  { neno: "kunyoosha mkono", maana: "kumsaidia mwenzako aliye na shida", kundi: "ushirikiano" },
  { neno: "weka mikono pamoja", maana: "kushirikiana kwa dhati kutimiza jambo moja", kundi: "ushirikiano" },
  { neno: "shikana mikono", maana: "kuungana kwa nguvu na dhamira moja", kundi: "ushirikiano" },
  { neno: "jenga daraja", maana: "kuunganisha watu waliokuwa na tofauti", kundi: "ushirikiano" },
  { neno: "tia mkono", maana: "kushiriki au kuchangia katika kazi ya pamoja", kundi: "ushirikiano" },
  { neno: "shika hatamu", maana: "kuongoza kikundi katika kazi ya pamoja", kundi: "ushirikiano" },
  { neno: "piga ramani pamoja", maana: "kupanga mkakati wa pamoja kabla ya kuanza kazi", kundi: "ushirikiano" },
  { neno: "fanya itifaki", maana: "kufuata taratibu na heshima za kikundi au ofisi", kundi: "ushirikiano" },
  { neno: "toa mchango", maana: "kuchangia kwa hali na mali katika jambo la pamoja", kundi: "ushirikiano" },
  // Kumaliza kazi — kuhusu kuhitimisha shughuli
  { neno: "kunja jamvi", maana: "kumaliza au kufunga shughuli iliyokuwa ikiendelea", kundi: "kumaliza" },
  { neno: "maliza kibarua", maana: "kukamilisha kazi uliyopewa kikamilifu", kundi: "kumaliza" },
  { neno: "funga pazia", maana: "kuhitimisha shughuli au tukio fulani", kundi: "kumaliza" },
  { neno: "tua mzigo", maana: "kumaliza jukumu zito ulilokuwa nalo", kundi: "kumaliza" },
  { neno: "funga safari", maana: "kukamilisha hatua ya mwisho ya mradi au shughuli", kundi: "kumaliza" },
  { neno: "piga mstari wa mwisho", maana: "kukamilisha kazi kwa ukamilifu wote", kundi: "kumaliza" },
  { neno: "fikisha ukingoni", maana: "kukaribia mwisho wa kazi na kuikamilisha", kundi: "kumaliza" },
  { neno: "weka kalamu chini", maana: "kumaliza kazi ya kuandika au mradi", kundi: "kumaliza" },
  { neno: "maliza zamu", maana: "kumaliza muda wa kazi uliopangiwa kwa siku hiyo", kundi: "kumaliza" },
  { neno: "funga kitabu", maana: "kuhitimisha jambo fulani kabisa bila kulirudia tena", kundi: "kumaliza" },
];

const MAJINA = ["Amina", "Baraka", "Chebet", "Dennis", "Esther", "Fatuma", "Grace", "Hassan", "Imani", "Kioko", "Lilian", "Mwangi", "Naliaka", "Otieno", "Peris", "Rehema", "Salim", "Wanjiku"];
const MAENEO = ["Kisumu", "Nakuru", "Eldoret", "Machakos", "Nyeri", "Mombasa", "Kakamega", "Garissa", "Kericho", "Meru", "Kitui", "Bungoma", "Narok"];

const NAHAU_MUKTADHA: { neno: string; build: (name: string, place: string) => { before: string; after: string } }[] = [
  { neno: "chapa kazi", build: (_n, place) => ({ before: `Mkufunzi wa mpira huko ${place} huwaambia wachezaji wake watumie msemo wa`, after: "wanapotaka kuwahimiza kufanya bidii kabla ya mechi kuu." }) },
  { neno: "vunja jasho", build: (_n, place) => ({ before: `Wakulima wa ${place} waliokuwa wakivuna mahindi mchana kutwa walisema wanastahili sifa ya nahau`, after: "kwa jinsi walivyofanya kazi bila kupumzika." }) },
  { neno: "toa jasho", build: (_n, place) => ({ before: `Baada ya mazoezi magumu ya riadha, kocha wa shule ya ${place} aliwapongeza wanariadha kwa nahau`, after: "kwani walijitolea kikamilifu." }) },
  { neno: "kaza buti", build: (name) => ({ before: `Wiki moja kabla ya mtihani wa kitaifa, mwalimu alimwambia ${name} ni wakati wa`, after: "— yaani kujiandaa vizuri kwa yale yaliyo mbele." }) },
  { neno: "tia bidii", build: (name) => ({ before: `${name} alishauriwa na mwalimu wake wa hesabu atumie msemo wa`, after: "badala ya kukata tamaa kila anapokosea." }) },
  { neno: "shika kazi", build: (name) => ({ before: `Siku ya kwanza ya mradi wa shule, kiongozi wa kikundi, ${name}, aliwaambia wenzake ni wakati wa`, after: "bila kuchelewesha zaidi." }) },
  { neno: "piga msasa", build: (name, place) => ({ before: `Fundi seremala wa ${place}, ${name}, anajulikana kwa kutumia nahau`, after: "anapomaliza kazi kwa umakini na ustadi wa hali ya juu." }) },
  { neno: "jitolea roho na moyo", build: (name, place) => ({ before: `Watu wa kijiji cha ${place} walimsifu ${name} kwa nahau`, after: "alipojitolea kusaidia ujenzi wa shule bila malipo." }) },
  { neno: "simama kidete", build: (_n, place) => ({ before: `Licha ya matatizo mengi ya kifedha, mfanyibiashara mmoja wa ${place} alionyesha nahau`, after: "na hatimaye biashara yake ikafanikiwa." }) },
  { neno: "tia fora", build: (name) => ({ before: `Mwanafunzi ${name} alizidi wenzake katika mtihani wa mwisho wa muhula, jambo lililoelezwa kwa nahau`, after: "na walimu wake." }) },
  { neno: "fyeka njia", build: (name, place) => ({ before: `Kiongozi wa kwanza kuanzisha mradi wa maji kijijini ${place}, ${name}, alisifiwa kwa nahau`, after: "kwani wengine walimfuata kwa urahisi baadaye." }) },
  { neno: "changa bia", build: (_n, place) => ({ before: `Wazazi wa ${place} walichangisha pesa kwa haraka kusaidia jirani aliyeugua, tendo lililoitwa nahau`, after: "na wenyeji wa eneo hilo." }) },
  { neno: "sema kwa sauti moja", build: (_n, place) => ({ before: `Wazee wa baraza la ${place} walikubaliana kwa pamoja bila mizozo, hali iliyoelezwa kwa nahau`, after: "kuhusu mradi wa barabara." }) },
  { neno: "weka bega kwa bega", build: (name, place) => ({ before: `Wanafunzi wa darasa la sita ${place} walifanya kazi ya usafi wa shule pamoja bila mtu kuachwa nyuma, jambo lililoelezwa kwa nahau`, after: `na mwalimu mkuu, ${name}.` }) },
];

function nenoById(neno: string) {
  return NAHAU.find((n) => n.neno === neno)!;
}

export const nahauKaziNaUshirikiano: Skill = {
  id: "g6-ksw-kz-nahau-kazi-na-ushirikiano",
  code: "KZ.6",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Nahau za Kazi na Ushirikiano",
  description: "Tambua na utumie nahau zinazohusiana na bidii, ushirikiano, na kumaliza kazi katika muktadha sahihi.",
  generate(rng) {
    const branch = randChoice(rng, ["maana-nahau", "oanisha-nahau", "panga-kundi", "tumia-nahau", "panga-maneno"] as const);

    if (branch === "maana-nahau") {
      const entry = randChoice(rng, NAHAU);
      const wenzaKundi = NAHAU.filter((n) => n.kundi === entry.kundi && n.neno !== entry.neno);
      const distractors = shuffle(rng, wenzaKundi)
        .slice(0, 3)
        .map((n) => n.maana);
      const choices = shuffle(rng, [entry.maana, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Nahau "${entry.neno}" ina maana gani?`,
        choices,
        correctIndex: choices.indexOf(entry.maana),
        layout: "list",
        hint: `Nahau hii iko katika kundi la nahau ${KUNDI_LABEL[entry.kundi].toLowerCase()}.`,
        explanation: `"${entry.neno}" maana yake ni: ${entry.maana}.`,
      };
    }

    if (branch === "oanisha-nahau") {
      const chosen = shuffle(rng, NAHAU).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((n) => ({ id: n.neno, label: n.neno })));
      const targets = shuffle(rng, chosen.map((n) => ({ id: n.neno, label: n.maana })));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.neno] = n.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila nahau na maana yake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kile kinachotokea kihalisi katika nahau ili kupata maana yake ya kificho.",
        explanation: chosen.map((n) => `"${n.neno}" — ${n.maana}.`).join(" "),
      };
    }

    if (branch === "panga-kundi") {
      const bidii = shuffle(rng, NAHAU.filter((n) => n.kundi === "bidii")).slice(0, 2);
      const ushirikiano = shuffle(rng, NAHAU.filter((n) => n.kundi === "ushirikiano")).slice(0, 2);
      const kumaliza = shuffle(rng, NAHAU.filter((n) => n.kundi === "kumaliza")).slice(0, 2);
      const chosen = [...bidii, ...ushirikiano, ...kumaliza];
      const items = shuffle(rng, chosen.map((n) => ({ id: n.neno, label: n.neno })));
      const correctBucket: Record<string, string> = {};
      for (const n of chosen) correctBucket[n.neno] = n.kundi;
      return {
        kind: "categorize",
        prompt: "Panga kila nahau katika kundi linalofaa: Bidii, Ushirikiano, au Kumaliza Kazi.",
        items,
        buckets: [
          { id: "bidii", label: KUNDI_LABEL.bidii },
          { id: "ushirikiano", label: KUNDI_LABEL.ushirikiano },
          { id: "kumaliza", label: KUNDI_LABEL.kumaliza },
        ],
        correctBucket,
        hint: "Jiulize: nahau hii inahusu kufanya kazi kwa juhudi, kufanya kazi pamoja na wengine, au kuhitimisha shughuli?",
        explanation: chosen.map((n) => `"${n.neno}" ni nahau ${KUNDI_LABEL[n.kundi].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "tumia-nahau") {
      const template = randChoice(rng, NAHAU_MUKTADHA);
      const entry = nenoById(template.neno);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAENEO);
      const { before, after } = template.build(name, place);
      return {
        kind: "fill-blank",
        prompt: "Soma muktadha kisha jaza pengo kwa nahau inayofaa zaidi.",
        before,
        after,
        correctAnswer: entry.neno,
        inputMode: "text",
        hint: `Nahau hii ina maana ya: ${entry.maana}.`,
        explanation: `Nahau sahihi ni "${entry.neno}" — ${entry.maana}.`,
      };
    }

    const entry = randChoice(rng, NAHAU);
    const words = entry.neno.split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kwa mpangilio sahihi ili kuunda nahau.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Nahau hii ina maana ya: ${entry.maana}.`,
      explanation: `Nahau sahihi ni: "${entry.neno}" — ${entry.maana}.`,
    };
  },
};
