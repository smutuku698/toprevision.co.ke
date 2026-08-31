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
  matukio: string[];
  mahususi: Swali;
  msamiatiCtx: Swali;
  match: { neno: string; maana: string }[];
  kauli: { text: string; kweli: boolean }[];
}

const VIFUNGU: Kifungu[] = [
  {
    text: "Katika familia ya Bi. Wanjiku, kila mtu husaidiana na kazi za nyumbani bila kujali jinsia. Baba huosha vyombo baada ya chakula cha jioni huku mama akikagua kazi za shule za watoto. Kaka mkubwa hupika chakula cha mchana Jumamosi, huku dada yake akichanja kuni na kutunza bustani. Bi. Wanjiku anaamini kuwa kugawana majukumu bila kujali jinsia huwafanya watoto wake kujifunza ujuzi mbalimbali wa maisha.",
    matukio: [
      "Baba huosha vyombo baada ya chakula cha jioni",
      "Mama hukagua kazi za shule za watoto",
      "Kaka mkubwa hupika chakula cha mchana Jumamosi",
      "Dada yake huchanja kuni na kutunza bustani",
    ],
    mahususi: {
      prompt: "Kulingana na kifungu, kaka mkubwa hufanya kazi gani Jumamosi?",
      choices: ["Hupika chakula cha mchana", "Huosha vyombo baada ya chakula cha jioni", "Hukagua kazi za shule", "Huchanja kuni"],
      correctIndex: 0,
      explanation: "Kifungu kinasema \"kaka mkubwa hupika chakula cha mchana Jumamosi\".",
    },
    msamiatiCtx: {
      prompt: "Neno 'kugawana' katika kifungu lina maana gani?",
      choices: [
        "Kufanya kazi kwa pamoja, kila mmoja akichukua sehemu yake",
        "Kupigana kuhusu kazi",
        "Kukataa kufanya kazi yoyote",
        "Kuuza kitu kwa bei ndogo",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinaeleza jinsi kila mwanafamilia anavyofanya sehemu yake ya kazi — hiyo ndiyo maana ya 'kugawana majukumu'.",
    },
    match: [
      { neno: "kuchanja", maana: "kukata kuni vipande vidogo kwa shoka" },
      { neno: "kukagua", maana: "kuangalia kwa makini ili kuhakikisha usahihi" },
      { neno: "kuamini", maana: "kuwa na uhakika kwamba jambo fulani ni kweli" },
    ],
    kauli: [
      { text: "Baba huosha vyombo baada ya chakula cha jioni.", kweli: true },
      { text: "Dada hupika chakula cha mchana Jumamosi.", kweli: false },
      { text: "Bi. Wanjiku anaamini kugawana majukumu huwafunza watoto ujuzi mbalimbali.", kweli: true },
      { text: "Katika familia hii, ni wanawake pekee wanaofanya kazi za nyumbani.", kweli: false },
    ],
  },
  {
    text: "Katika mji wa Nakuru, kituo cha mafunzo ya ufundi kimeanzisha programu inayowakaribisha wavulana na wasichana kwa usawa. Brian, kijana wa miaka kumi na tano, amejiunga na darasa la upishi ili afahamu jinsi ya kupika vyakula vya aina mbalimbali. Wakati huo huo, Faith amejiunga na darasa la useremala akitaka kujifunza kutengeneza fanicha. Mwalimu wao anasema ujuzi haujawi kuwa na jinsia, na kila mwanafunzi anapaswa kufuata kipaji chake bila woga.",
    matukio: [
      "Kituo cha ufundi kuanzisha programu ya usawa Nakuru",
      "Brian kujiunga na darasa la upishi",
      "Faith kujiunga na darasa la useremala",
      "Mwalimu kusisitiza kuwa ujuzi haujawi kuwa na jinsia",
    ],
    mahususi: {
      prompt: "Faith amejiunga na darasa gani katika kituo hicho?",
      choices: ["Useremala", "Upishi", "Ushonaji", "Ukulima"],
      correctIndex: 0,
      explanation: "Kifungu kinasema \"Faith amejiunga na darasa la useremala akitaka kujifunza kutengeneza fanicha\".",
    },
    msamiatiCtx: {
      prompt: "Neno 'kipaji' katika kifungu lina maana gani?",
      choices: ["Uwezo wa asili wa kufanya jambo fulani vizuri", "Hofu ya kujaribu kitu kipya", "Adhabu ya shuleni", "Pesa za masomo"],
      correctIndex: 0,
      explanation: "Mwalimu anasisitiza kila mwanafunzi afuate 'kipaji chake' — yaani uwezo wake wa asili — bila woga.",
    },
    match: [
      { neno: "kukaribisha", maana: "kualika au kupokea kwa furaha" },
      { neno: "fanicha", maana: "samani kama viti na meza zinazotengenezwa kwa mbao" },
      { neno: "kusisitiza", maana: "kukazia jambo ili lieleweke vizuri" },
    ],
    kauli: [
      { text: "Brian amejiunga na darasa la upishi.", kweli: true },
      { text: "Faith anajifunza kutengeneza fanicha.", kweli: true },
      { text: "Mwalimu anasema wasichana pekee ndio wanaofaa useremala.", kweli: false },
      { text: "Kituo hicho kipo mjini Nakuru.", kweli: true },
    ],
  },
  {
    text: "Zamani, katika kijiji cha Bwana Mwangeka, ilikuwa kawaida kwa wanawake pekee kuchota maji na kuni huku wanaume wakishughulikia mifugo pekee. Hivi karibuni, mtazamo huo umeanza kubadilika. Wanaume wamejiunga na kikundi cha akina mama kuchota maji pamoja, huku wasichana wakianza kufuga mifugo bega kwa bega na wavulana. Wazee wa kijiji hicho wanashuhudia kuwa kubadilika huku kumeleta ushirikiano zaidi katika familia.",
    matukio: [
      "Zamani wanawake pekee walichota maji na kuni",
      "Wanaume walishughulikia mifugo pekee",
      "Mtazamo kuanza kubadilika hivi karibuni",
      "Wanaume kujiunga kuchota maji na wasichana kufuga mifugo",
    ],
    mahususi: {
      prompt: "Zamani, ni nani waliokuwa wakichota maji na kuni pekee kijijini humo?",
      choices: ["Wanawake pekee", "Wanaume pekee", "Watoto pekee", "Wazee pekee"],
      correctIndex: 0,
      explanation: "Kifungu kinasema \"ilikuwa kawaida kwa wanawake pekee kuchota maji na kuni\".",
    },
    msamiatiCtx: {
      prompt: "Neno 'kushuhudia' katika kifungu lina maana gani?",
      choices: [
        "Kuona mwenyewe jambo linalotokea na kulithibitisha",
        "Kukataa kuamini jambo",
        "Kusahau jambo lililotokea",
        "Kuandika hadithi ya kubuni",
      ],
      correctIndex: 0,
      explanation: "Wazee 'wanashuhudia' mabadiliko — yaani wanayaona wenyewe na kuyathibitisha.",
    },
    match: [
      { neno: "kufuga", maana: "kutunza wanyama wa kufugwa kama ng'ombe na mbuzi" },
      { neno: "ushirikiano", maana: "kufanya kazi pamoja kwa umoja" },
      { neno: "kubadilika", maana: "kuwa tofauti na jinsi ilivyokuwa awali" },
    ],
    kauli: [
      { text: "Zamani wanaume pekee walichota maji na kuni.", kweli: false },
      { text: "Wasichana wameanza kufuga mifugo bega kwa bega na wavulana.", kweli: true },
      { text: "Wazee wanasema mabadiliko yameongeza ushirikiano.", kweli: true },
      { text: "Hakuna mabadiliko yoyote yaliyotokea kijijini humo.", kweli: false },
    ],
  },
  {
    text: "Klabu ya Usawa wa Kijinsia katika Shule ya Upili ya Machakos huandaa mijadala kila mwezi kuhusu majukumu ya wanaume na wanawake katika jamii. Mwezi uliopita, wanafunzi walijadili kwa nini baadhi ya wazazi bado huwakatalia wasichana kusoma masomo ya sayansi. Wanafunzi walikubaliana kuwa kila mtoto, awe wa kiume au wa kike, anapaswa kupewa fursa sawa za kusoma somo lolote analopenda. Klabu hiyo ilipanga kutembelea shule za msingi jirani kueneza ujumbe huo.",
    matukio: [
      "Klabu kuandaa mjadala kila mwezi",
      "Wanafunzi kujadili kuhusu wazazi kuwakatalia wasichana masomo ya sayansi",
      "Wanafunzi kukubaliana kila mtoto apewe fursa sawa",
      "Klabu kupanga kutembelea shule za msingi jirani",
    ],
    mahususi: {
      prompt: "Wanafunzi walijadili kuhusu nini mwezi uliopita?",
      choices: [
        "Kwa nini baadhi ya wazazi huwakatalia wasichana kusoma sayansi",
        "Jinsi ya kujenga maktaba mpya",
        "Ratiba ya mitihani ya mwisho wa muhula",
        "Sherehe ya wahitimu",
      ],
      correctIndex: 0,
      explanation: "Kifungu kinasema walijadili \"kwa nini baadhi ya wazazi bado huwakatalia wasichana kusoma masomo ya sayansi\".",
    },
    msamiatiCtx: {
      prompt: "Neno 'kukatalia' katika kifungu lina maana gani?",
      choices: ["Kumzuia mtu kufanya jambo fulani", "Kumtia moyo mtu kufanya jambo", "Kumpa mtu zawadi", "Kumsifu mtu"],
      correctIndex: 0,
      explanation: "Wazazi 'wanaokatalia' wasichana kusoma sayansi wanawazuia kufanya hivyo.",
    },
    match: [
      { neno: "mjadala", maana: "mazungumzo ya wazi kuhusu mada fulani yenye maoni tofauti" },
      { neno: "kueneza", maana: "kusambaza jambo ili lifahamike na watu wengi" },
      { neno: "fursa", maana: "nafasi inayompa mtu uwezekano wa kufanya jambo" },
    ],
    kauli: [
      { text: "Klabu hiyo ipo Shule ya Upili ya Machakos.", kweli: true },
      { text: "Wanafunzi walijadili kuhusu wasichana na masomo ya sayansi.", kweli: true },
      { text: "Wanafunzi walikataa wazo la fursa sawa kwa watoto wote.", kweli: false },
      { text: "Klabu hiyo haina mipango yoyote ya baadaye.", kweli: false },
    ],
  },
];

export const kusomaKwaUfahamu: Skill = {
  id: "g8-ksw-ks-ufahamu",
  code: "KS.5",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ks",
  grade: 8,
  title: "Kusoma kwa Ufahamu",
  description: "Soma kifungu kisha udondoe habari mahususi, ueleze maana za msamiati kulingana na muktadha, na uonyeshe uelewa wako wa habari.",
  generate(rng) {
    const kifungu = randChoice(rng, VIFUNGU);
    const branch = randChoice(rng, ["mahususi", "msamiati-ctx", "match", "kauli", "order"] as const);
    const hint = "Rejelea kifungu tena na utafute sentensi inayohusiana moja kwa moja na swali.";

    if (branch === "order") {
      const items = kifungu.matukio.map((label, i) => ({ id: `e${i}`, label }));
      return {
        kind: "ordering",
        passage: kifungu.text,
        prompt: "Panga mambo yafuatayo jinsi yanavyotajwa katika kifungu.",
        instruction: "Bofya kwa mfuatano sahihi.",
        items: shuffle(rng, items),
        correctOrder: items.map((it) => it.id),
        hint,
        explanation: kifungu.matukio.join(" → "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, kifungu.match.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, kifungu.match.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of kifungu.match) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        passage: kifungu.text,
        prompt: "Oanisha kila neno na maana yake kama linavyotumika katika kifungu.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: kifungu.match.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "kauli") {
      const items = kifungu.kauli.map((s, i) => ({ id: `s${i}`, label: s.text, b: s.kweli ? "Kweli" : "Uongo" }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
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
        hint,
        explanation: kifungu.kauli.map((s) => `"${s.text}" ni ${s.kweli ? "kweli" : "uongo"} kulingana na kifungu.`).join(" "),
      };
    }

    const swali = branch === "msamiati-ctx" ? kifungu.msamiatiCtx : kifungu.mahususi;
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
