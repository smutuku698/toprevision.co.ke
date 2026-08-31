import { randChoice, shuffle } from "@/lib/rng";
import type { Skill, VisualSpec } from "@/lib/types";

type Picha = {
  maelezo: string;
  visual?: VisualSpec;
  anwaniSahihi: string;
  anwaniMbaya: string[];
  sentensiDhahiri: string;
  sentensiHafifu: string[];
  matukioSahihi: { id: string; label: string }[];
};

const PICHA: Picha[] = [
  {
    maelezo:
      "Picha inaonyesha soko la Gikomba lenye watu wengi, muuzaji wa matunda akiwa na embe na machungwa mengi kwenye meza yake, huku mvua ikinyesha kidogo na wanunuzi wakijikinga kwa miavuli.",
    visual: { type: "icon-set", icon: "apple", count: 5, color: "#dc2626" },
    anwaniSahihi: "Biashara Sokoni Wakati wa Mvua",
    anwaniMbaya: ["Safari ya Kwenda Shuleni", "Mchezo wa Mpira Uwanjani", "Sherehe ya Kuzaliwa Nyumbani"],
    sentensiDhahiri: "Matone ya mvua yalinyesha juu ya milima ya machungwa, huku muuzaji akiyafunika haraka kwa turubai.",
    sentensiHafifu: [
      "Kulikuwa na matunda sokoni.",
      "Mvua ilinyesha kidogo.",
      "Watu walikuwa sokoni wakinunua vitu.",
    ],
    matukioSahihi: [
      { id: "1", label: "Muuzaji anaona mawingu meusi yanaanza kufunika anga juu ya soko" },
      { id: "2", label: "Mvua inaanza kunyesha taratibu juu ya meza za matunda" },
      { id: "3", label: "Muuzaji anafunika embe na machungwa kwa turubai haraka" },
      { id: "4", label: "Wanunuzi wanafungua miavuli na kuendelea kununua chini ya mvua" },
    ],
  },
  {
    maelezo:
      "Picha inaonyesha darasa la wanafunzi wa Shule ya Msingi Mwangaza wakisoma kimya, mwalimu ameshika kitabu mbele ya ubao, na wanafunzi wana vitabu na penseli juu ya madawati yao.",
    visual: { type: "icon-set", icon: "pencil", count: 6, color: "#f59e0b" },
    anwaniSahihi: "Somo la Asubuhi Darasani",
    anwaniMbaya: ["Michezo ya Likizo", "Sherehe ya Mavuno Kijijini", "Safari ya Kuvua Samaki"],
    sentensiDhahiri: "Kalamu za penseli zilitembea kwa kasi juu ya madaftari huku wanafunzi wakiandika kwa umakini mkubwa.",
    sentensiHafifu: [
      "Wanafunzi walikuwa darasani.",
      "Mwalimu alikuwa na kitabu.",
      "Kulikuwa na madawati darasani.",
    ],
    matukioSahihi: [
      { id: "1", label: "Mwalimu anaingia darasani akiwa na kitabu cha somo" },
      { id: "2", label: "Wanafunzi wanafungua vitabu vyao na kushika penseli" },
      { id: "3", label: "Mwalimu anaandika mada ya somo ubaoni" },
      { id: "4", label: "Wanafunzi wananakili maelezo kwa umakini kimya kimya" },
    ],
  },
  {
    maelezo:
      "Picha inaonyesha uwanja wa michezo wa Shule ya Upili Nakuru, wachezaji wawili wa timu tofauti wakikimbiza mpira, huku wanafunzi wengine wakiwa uwanjani wakishangilia kando ya uwanja.",
    anwaniSahihi: "Mechi Kali Uwanjani",
    anwaniMbaya: ["Karamu ya Chakula Nyumbani", "Ziara ya Maktaba Kuu", "Mafunzo ya Kuogelea Ziwani"],
    sentensiDhahiri: "Mchezaji alipiga mbio kwa kasi ya umeme akiuchezea mpira huku shabiki wakipiga kelele za shangwe.",
    sentensiHafifu: [
      "Wachezaji walikuwa uwanjani.",
      "Watu walishangilia.",
      "Kulikuwa na mpira uwanjani.",
    ],
    matukioSahihi: [
      { id: "1", label: "Timu mbili zinajipanga uwanjani kabla ya mechi kuanza" },
      { id: "2", label: "Mwamuzi anapiga mluzi kuashiria mechi imeanza" },
      { id: "3", label: "Wachezaji wanakimbiza mpira huku mashabiki wakishangilia" },
      { id: "4", label: "Timu moja inafunga goli na wachezaji wake wanasherehekea" },
    ],
  },
];

const MASWALI_UJUMLA: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Anwani ya insha inayotokana na picha inapaswa kuwa na sifa gani?",
    sahihi: "Ioane moja kwa moja na kile kinachoonekana au kinachotokea katika picha",
    makosa: [
      "Iwe ndefu na yenye maneno magumu",
      "Isihusiane na picha kabisa ili kumshangaza msomaji",
      "Iandikwe kwa lugha ya Kiingereza pekee",
    ],
  },
  {
    swali: "Kwa nini ni muhimu kutoa maelezo dhahiri (yanayogusa hisia) kuhusu matukio katika picha badala ya maelezo ya juu juu?",
    sahihi: "Husaidia msomaji kuona na kuhisi picha hiyo akilini mwake kana kwamba yupo pale",
    makosa: [
      "Huifanya insha kuwa fupi zaidi",
      "Huepusha haja ya kuwa na anwani",
      "Hupunguza idadi ya wahusika wanaotajwa",
    ],
  },
  {
    swali: "Baada ya kutazama picha na kuandaa anwani, hatua muhimu inayofuata katika kuandika insha ya picha ni ipi?",
    sahihi: "Kutoa maelezo dhahiri ya kila sehemu muhimu ya picha kabla ya kusimulia kisa kamili",
    makosa: [
      "Kuruka moja kwa moja kwenye hitimisho la kisa",
      "Kufuta anwani na kuchagua nyingine",
      "Kuandika kisa bila kutazama picha tena",
    ],
  },
];

export const inshaPicha: Skill = {
  id: "g7-ksw-ka-insha-picha",
  code: "KA.6",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ka",
  grade: 7,
  title: "Insha za Kubuni: Kutokana na Picha",
  description: "Buni anwani ifaayo, toa maelezo dhahiri kuhusu matukio katika picha, na uandike kisa chenye mfuatano wa matukio unaofaa.",
  generate(rng) {
    const branch = randChoice(rng, ["anwaniMc", "sentensiCategorize", "matukioOrder", "matchDhahiri", "fillMaelezo", "mcUjumla"] as const);

    if (branch === "anwaniMc") {
      const picha = randChoice(rng, PICHA);
      const choices = shuffle(rng, [picha.anwaniSahihi, ...picha.anwaniMbaya]);
      return {
        kind: "multiple-choice",
        prompt: `Soma maelezo ya picha hii: "${picha.maelezo}" Ni anwani ipi inayooana zaidi na kisa hiki?`,
        choices,
        correctIndex: choices.indexOf(picha.anwaniSahihi),
        layout: "list",
        visual: picha.visual,
        hint: "Anwani nzuri huakisi kile kinachotokea katika picha kwa ufupi na uwazi.",
        explanation: `Anwani ifaayo ni "${picha.anwaniSahihi}" kwa sababu inaoana moja kwa moja na matukio yaliyoelezwa katika picha.`,
      };
    }

    if (branch === "sentensiCategorize") {
      const picha = randChoice(rng, PICHA);
      const hafifu = shuffle(rng, picha.sentensiHafifu).slice(0, 2);
      const items = shuffle(rng, [
        { id: "dhahiri", label: picha.sentensiDhahiri, bucket: "dhahiri" },
        ...hafifu.map((label, i) => ({ id: `hafifu-${i}`, label, bucket: "hafifu" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: `Kwa picha inayoonyesha: "${picha.maelezo}" Panga sentensi hizi kulingana na kama zinatoa maelezo dhahiri (yenye undani) au maelezo hafifu (ya juu juu).`,
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "dhahiri", label: "Maelezo Dhahiri" },
          { id: "hafifu", label: "Maelezo Hafifu" },
        ],
        correctBucket,
        visual: picha.visual,
        hint: "Maelezo dhahiri huchora picha wazi akilini kwa kutumia undani, si taarifa fupi za jumla.",
        explanation: `Maelezo dhahiri: "${picha.sentensiDhahiri}". Maelezo hafifu ni ya jumla mno kutoa picha kamili.`,
      };
    }

    if (branch === "matukioOrder") {
      const picha = randChoice(rng, PICHA);
      const items = shuffle(rng, picha.matukioSahihi);
      return {
        kind: "ordering",
        prompt: `Picha inaonyesha: "${picha.maelezo}" Panga matukio yafuatayo kwa mfuatano unaofaa kujenga kisa kinachotokana na picha hii.`,
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: picha.matukioSahihi.map((m) => m.id),
        visual: picha.visual,
        hint: "Fikiria ni nini kingetokea kwanza, kisha nini, hadi mwisho wa kisa.",
        explanation: picha.matukioSahihi.map((m) => m.label).join(" → "),
      };
    }

    if (branch === "matchDhahiri") {
      const picha = randChoice(rng, PICHA);
      const pairs = [
        { id: "anwani", left: "Anwani ifaayo", right: picha.anwaniSahihi },
        { id: "dhahiri", left: "Maelezo dhahiri", right: picha.sentensiDhahiri },
        { id: "tukio1", left: "Tukio la kwanza la kisa", right: picha.matukioSahihi[0].label },
        { id: "tukiompya", left: "Tukio la mwisho la kisa", right: picha.matukioSahihi[picha.matukioSahihi.length - 1].label },
      ];
      const tokens = shuffle(rng, pairs.map((p) => ({ id: p.id, label: p.right })));
      const targets = shuffle(rng, pairs.map((p) => ({ id: p.id, label: p.left })));
      const correctMap: Record<string, string> = {};
      for (const p of pairs) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: `Picha inaonyesha: "${picha.maelezo}" Oanisha kila kipengele cha insha ya picha na sehemu yake ifaayo kutoka kwenye picha hii.`,
        tokens,
        targets,
        correctMap,
        visual: picha.visual,
        hint: "Zingatia jinsi anwani, maelezo dhahiri na matukio yanavyotokana moja kwa moja na picha.",
        explanation: pairs.map((p) => `${p.left} — "${p.right}".`).join(" "),
      };
    }

    if (branch === "fillMaelezo") {
      const picha = randChoice(rng, PICHA);
      const maneno = picha.sentensiDhahiri.split(" ");
      const kati = Math.floor(maneno.length / 2);
      const kabla = maneno.slice(0, kati).join(" ");
      const nenoLililokosekana = maneno[kati];
      const baada = maneno.slice(kati + 1).join(" ");
      return {
        kind: "fill-blank",
        prompt: `Picha inaonyesha: "${picha.maelezo}" Kamilisha neno linalokosekana katika sentensi hii yenye maelezo dhahiri.`,
        before: kabla,
        after: ` ${baada}`,
        correctAnswer: nenoLililokosekana,
        inputMode: "text",
        visual: picha.visual,
        hint: "Fikiria neno linalofanya sentensi ieleze picha kwa undani zaidi.",
        explanation: `Sentensi kamili yenye maelezo dhahiri ni: "${picha.sentensiDhahiri}".`,
      };
    }

    const entry = randChoice(rng, MASWALI_UJUMLA);
    const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
    return {
      kind: "multiple-choice",
      prompt: entry.swali,
      choices,
      correctIndex: choices.indexOf(entry.sahihi),
      layout: "list",
      hint: "Zingatia anwani ifaayo, maelezo dhahiri na mfuatano wa matukio katika insha ya picha.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
