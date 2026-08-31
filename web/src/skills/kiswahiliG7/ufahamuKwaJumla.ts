import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface Kifungu {
  text: string;
  matukio: string[];
  mahususi: { prompt: string; choices: string[]; correctIndex: number; explanation: string };
  msamiati: { neno: string; maana: string }[];
  kauli: { text: string; kweli: boolean }[];
  muhtasariSahihi: string;
  muhtasariPotovu: string[];
  matumizi: { neno: string; before: string; after: string };
}

const VIFUNGU: Kifungu[] = [
  {
    text: "Kila asubuhi kabla ya shule, Brian humchotea maji mama yake kutoka kisima cha jamii kilicho umbali wa kilomita moja kutoka nyumbani kwao kijijini Kitui. Kwanza, huchukua ndoo mbili na kutembea hadi kisimani akiwa bado giza kidogo. Kisha, husubiri zamu yake kwani wanakijiji wengi pia huchota maji wakati huo huo. Baadaye, hujaza ndoo zake mbili na kuanza safari ya kurudi nyumbani akiwa amebeba uzito huo mgongoni. Mwishoni, kabla ya kwenda shuleni, humwachia mama maji ya kutosha kwa mahitaji ya siku hiyo.",
    matukio: [
      "Kuchukua ndoo mbili na kutembea hadi kisimani",
      "Kusubiri zamu ya kuchota maji kisimani",
      "Kujaza ndoo na kuanza safari ya kurudi nyumbani",
      "Kumwachia mama maji ya kutosha kabla ya shule",
    ],
    mahususi: {
      prompt: "Kisima cha jamii kiko umbali gani kutoka nyumbani kwa Brian?",
      choices: ["Kilomita moja", "Kilomita tano", "Mita mia tano", "Kilomita kumi"],
      correctIndex: 0,
      explanation: "Kifungu kinasema kisima \"kilicho umbali wa kilomita moja kutoka nyumbani kwao\".",
    },
    msamiati: [
      { neno: "kisima", maana: "shimo refu chenye maji yanayotumiwa na jamii" },
      { neno: "zamu", maana: "nafasi ya kila mtu kufanya jambo kwa mfuatano" },
      { neno: "kubeba", maana: "kuchukua uzito wa kitu kwa mkono, kichwa au mgongoni" },
    ],
    kauli: [
      { text: "Brian huchota maji kabla ya shule.", kweli: true },
      { text: "Anatumia ndoo tatu kila siku.", kweli: false },
      { text: "Kisima hicho hutumiwa na wanakijiji wengine pia.", kweli: true },
      { text: "Brian hapeleki maji yoyote nyumbani.", kweli: false },
    ],
    muhtasariSahihi: "Brian huchota maji kisimani kila asubuhi kabla ya shule ili kumsaidia mama yake.",
    muhtasariPotovu: [
      "Brian huchota maji jioni pekee bila kumsaidia mama yake.",
      "Kisima cha jamii kiko karibu sana na nyumba yao, mita kumi tu.",
      "Brian huacha kabisa kuchota maji akienda shule.",
    ],
    matumizi: { neno: "zamu", before: "Kila mwanakijiji anapaswa kusubiri", after: "yake kabla ya kuchota maji." },
  },
  {
    text: "Wanakijiji wa Kericho waliamua kujenga maktaba ndogo katika kijiji chao ili wanafunzi wapate mahali pa kusoma vitabu baada ya shule. Kwanza, walichanga pesa kutoka kwa kila familia kununua matofali na mabati. Kisha, vijana wa kijiji walijitolea kujenga jengo hilo wikendi tatu mfululizo. Baadaye, walipata wafadhili waliochangia vitabu na viti kutoka mji wa Kisumu. Mwishoni, maktaba hiyo ilifunguliwa rasmi na chifu wa eneo hilo, na sasa wanafunzi zaidi ya mia moja huitumia kila wiki.",
    matukio: [
      "Kuchanga pesa kununua matofali na mabati",
      "Vijana kujitolea kujenga jengo wikendi tatu mfululizo",
      "Kupata wafadhili wa vitabu na viti kutoka Kisumu",
      "Chifu kufungua maktaba rasmi",
    ],
    mahususi: {
      prompt: "Vijana wa kijiji walichukua muda gani kujenga jengo la maktaba?",
      choices: ["Wikendi tatu mfululizo", "Siku moja tu", "Mwaka mzima", "Wiki sita"],
      correctIndex: 0,
      explanation: "Kifungu kinasema vijana \"walijitolea kujenga jengo hilo wikendi tatu mfululizo\".",
    },
    msamiati: [
      { neno: "kuchanga", maana: "kukusanya pesa au vitu kutoka kwa watu wengi kwa lengo moja" },
      { neno: "kujitolea", maana: "kufanya kazi kwa hiari bila malipo" },
      { neno: "wafadhili", maana: "watu au mashirika yanayotoa msaada wa pesa au vitu" },
    ],
    kauli: [
      { text: "Maktaba ilijengwa Kericho.", kweli: true },
      { text: "Wafadhili walitoka mji wa Kisumu.", kweli: true },
      { text: "Vitabu vilinunuliwa na chifu peke yake.", kweli: false },
      { text: "Zaidi ya wanafunzi mia moja huitumia maktaba kila wiki.", kweli: true },
    ],
    muhtasariSahihi: "Wanakijiji wa Kericho walichanga pesa na kujitolea kujenga maktaba iliyofunguliwa rasmi na chifu.",
    muhtasariPotovu: [
      "Wanakijiji walinunua maktaba iliyokamilika kutoka mji mwingine.",
      "Hakuna aliyejitolea kusaidia kujenga maktaba hiyo.",
      "Maktaba hiyo ilijengwa na serikali kuu peke yake.",
    ],
    matumizi: { neno: "wafadhili", before: "Shule nyingi hutegemea", after: "kupata vitabu na samani." },
  },
  {
    text: "Juma, mvulana wa miaka kumi na miwili anayeishi karibu na Ziwa Victoria mjini Kisumu, alikuwa akiogopa maji tangu utotoni. Wiki iliyopita, mjomba wake alimwahidi kumfunza kuogelea kando ya ziwa hilo kila jioni baada ya shule. Kwanza, mjomba alimfunza jinsi ya kuelea juu ya maji bila kuogopa. Kisha, walijizoeza kuchapa maji kwa miguu huku akijishikilia ukingoni. Baadaye, Juma alianza kuogelea umbali mfupi peke yake huku mjomba akimwangalia kwa karibu. Mwishoni, baada ya wiki mbili za mazoezi, Juma aliogelea hadi ufuoni bila msaada wa mtu yeyote.",
    matukio: [
      "Mjomba kumfunza Juma kuelea juu ya maji",
      "Kujizoeza kuchapa maji kwa miguu ukingoni",
      "Juma kuogelea umbali mfupi akiangaliwa na mjomba",
      "Juma kuogelea hadi ufuoni bila msaada",
    ],
    mahususi: {
      prompt: "Nani alimfunza Juma kuogelea?",
      choices: ["Mjomba wake", "Mwalimu wa shule", "Kocha wa mji", "Baba yake"],
      correctIndex: 0,
      explanation: "Kifungu kinasema \"mjomba wake alimwahidi kumfunza kuogelea\".",
    },
    msamiati: [
      { neno: "kuelea", maana: "kubaki juu ya uso wa maji bila kuzama" },
      { neno: "kuchapa maji", maana: "kupiga miguu kwa nguvu ndani ya maji wakati wa kuogelea" },
      { neno: "ufuoni", maana: "sehemu ya nchi kavu iliyo karibu na ukingo wa ziwa au bahari" },
    ],
    kauli: [
      { text: "Juma anaishi karibu na Ziwa Victoria.", kweli: true },
      { text: "Mjomba alimfunza kuogelea asubuhi.", kweli: false },
      { text: "Juma aliogelea hadi ufuoni peke yake baada ya wiki mbili.", kweli: true },
      { text: "Juma hakuogopa maji hata kidogo tangu mwanzo.", kweli: false },
    ],
    muhtasariSahihi: "Mjomba wa Juma alimfunza kuogelea kando ya Ziwa Victoria, na baada ya wiki mbili, Juma aliweza kuogelea peke yake.",
    muhtasariPotovu: [
      "Juma alijifunza kuogelea peke yake bila msaada wa yeyote.",
      "Juma aliendelea kuogopa maji hadi mwisho wa hadithi.",
      "Mjomba wa Juma alimfundisha kuvua samaki, si kuogelea.",
    ],
    matumizi: { neno: "kuelea", before: "Mtoto mdogo alijifunza", after: "juu ya maji kabla ya kuogelea." },
  },
];

export const ufahamuKwaJumla: Skill = {
  id: "g7-ksw-ks-ufahamu-kwa-jumla",
  code: "KS.5",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Kusoma kwa Ufahamu",
  description: "Soma vifungu mbalimbali kisha udondoe habari mahususi, ueleze habari kwa ufupi, na ueleze maana za msamiati kulingana na muktadha.",
  generate(rng) {
    const kifungu = randChoice(rng, VIFUNGU);
    const branch = randChoice(rng, ["mahususi", "ufupi", "msamiati", "kauli", "matumizi", "order"] as const);
    const hint = "Soma kifungu tena kwa makini na utafute sehemu inayohusiana moja kwa moja na swali.";

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
        hint,
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
        hint,
        explanation: kifungu.kauli.map((s) => `"${s.text}" ni ${s.kweli ? "kweli" : "uongo"} kulingana na kifungu.`).join(" "),
      };
    }

    if (branch === "matumizi") {
      return {
        kind: "fill-blank",
        passage: kifungu.text,
        prompt: "Tumia neno ufaalo kutoka kwa msamiati wa kifungu kukamilisha sentensi hii mpya.",
        before: kifungu.matumizi.before,
        after: kifungu.matumizi.after,
        correctAnswer: kifungu.matumizi.neno,
        inputMode: "text",
        hint: "Fikiria maana ya neno kutoka kwa kifungu, kisha ulitumie katika muktadha huu mpya.",
        explanation: `Neno "${kifungu.matumizi.neno}" ndilo linalofaa hapa kwa maana yake kama ilivyotumika katika kifungu.`,
      };
    }

    if (branch === "ufupi") {
      const choices = shuffle(rng, [kifungu.muhtasariSahihi, ...kifungu.muhtasariPotovu]);
      return {
        kind: "multiple-choice",
        passage: kifungu.text,
        prompt: "Ni muhtasari upi unaowakilisha vyema habari za kifungu hiki?",
        choices,
        correctIndex: choices.indexOf(kifungu.muhtasariSahihi),
        layout: "list",
        hint,
        explanation: `Muhtasari bora ni: "${kifungu.muhtasariSahihi}" — unadondoa habari kuu bila maelezo yasiyo ya lazima.`,
      };
    }

    const swali = kifungu.mahususi;
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
