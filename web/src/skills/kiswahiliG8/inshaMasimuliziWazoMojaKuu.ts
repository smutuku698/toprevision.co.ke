import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ISTILAHI: { id: string; term: string; maelezo: string }[] = [
  { id: "wazokuu", term: "Wazo kuu", maelezo: "Jambo moja muhimu ambalo aya nzima inalizungumzia" },
  { id: "sentensielekezi", term: "Sentensi elekezi", maelezo: "Sentensi ya kwanza ya aya inayotambulisha wazo kuu la aya hiyo" },
  { id: "sentensitegemezi", term: "Sentensi tegemezi", maelezo: "Sentensi zinazofuata zinazoongeza maelezo yanayounga mkono wazo kuu" },
  { id: "mshono", term: "Mshono wa aya", maelezo: "Uhusiano unaounganisha aya moja na nyingine ili insha isome vizuri" },
];

const AYA_WAZO_MOJA = [
  "Jua lilipochomoza asubuhi hiyo, Juma aliamka mapema kujiandaa kwenda shambani. Alivaa nguo za kazi, akachukua jembe lake, na kuelekea shambani kwa hamu kubwa ya kuanza kazi ya siku hiyo.",
  "Wanafunzi wa darasa la nane walifurahi sana walipopata habari za safari ya kielimu. Kila mmoja alianza kupanga vitu vya kubeba, huku wengine wakiuliza maswali kuhusu mahali watakapotembelea.",
  "Mvua kubwa ilinyesha usiku ule wa Ijumaa. Maji yalijaa mitaani, nyumba nyingi zikafurika, na wakazi walilazimika kuhamia kwa jamaa zao kwa muda.",
];

const AYA_MAWAZO_MENGI = [
  "Juma aliamka mapema kwenda shambani. Baadaye siku hiyo dada yake alienda sokoni kununua nguo mpya. Jioni, babu yao alisimulia hadithi za zamani kuhusu vita vya ukoo wao.",
  "Wanafunzi walifurahi kupata habari za safari. Mwalimu mkuu pia alitangaza kuwa mtihani wa mwisho wa muhula ungefanyika wiki ijayo, na timu ya mpira ilishinda mchezo wake wa mwisho.",
  "Mvua kubwa ilinyesha usiku huo. Kesho yake, soko kuu lilifunguliwa kama kawaida na wafanyabiashara waliuza bidhaa zao, huku serikali ikizindua mradi mpya wa barabara mjini.",
];

const HATUA_KUANDIKA_AYA = [
  { id: "chagua", label: "Chagua wazo moja kuu unalotaka kulieleza katika aya" },
  { id: "sentensi1", label: "Andika sentensi elekezi inayotambulisha wazo hilo" },
  { id: "ongeza", label: "Ongeza sentensi tegemezi zinazounga mkono na kufafanua wazo hilo" },
  { id: "hitimisha", label: "Hitimisha aya kwa sentensi inayounganisha na aya ifuatayo" },
];

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Kwa nini ni muhimu kila aya ya insha ya masimulizi kuwa na wazo moja kuu?",
    sahihi: "Ili msomaji aelewe kwa urahisi ujumbe unaowasilishwa bila kuchanganyikiwa",
    makosa: [
      "Ili insha iwe ndefu zaidi",
      "Ili kuepuka kutumia sentensi elekezi",
      "Ili kila aya iwe na urefu sawa",
    ],
  },
  {
    swali: "Sentensi elekezi ya aya huwa na jukumu gani?",
    sahihi: "Kutambulisha wazo kuu litakalojadiliwa katika aya hiyo",
    makosa: [
      "Kuhitimisha insha nzima",
      "Kuunganisha insha na kichwa cha habari",
      "Kuorodhesha wahusika wote wa hadithi",
    ],
  },
  {
    swali: `Soma aya hii: "${AYA_WAZO_MOJA[0]}" Je, aya hii ina wazo moja kuu?`,
    sahihi: "Ndiyo, kwa sababu sentensi zote zinahusu maandalizi ya Juma kwenda shambani",
    makosa: [
      "Hapana, kwa sababu inazungumzia mambo matatu tofauti",
      "Hapana, kwa sababu haina sentensi elekezi kabisa",
      "Ndiyo, lakini tu kwa sababu ni fupi",
    ],
  },
  {
    swali: `Soma aya hii: "${AYA_MAWAZO_MENGI[1]}" Tatizo kuu la aya hii ni lipi?`,
    sahihi: "Inachanganya mawazo matatu tofauti badala ya kuzingatia wazo moja kuu",
    makosa: [
      "Haina wahusika wowote",
      "Ni fupi mno kueleweka",
      "Haitumii lugha sahihi ya Kiswahili",
    ],
  },
];

export const inshaMasimuliziWazoMojaKuu: Skill = {
  id: "g8-ksw-ka-masimulizi-wazo-mkuu",
  code: "KA.3",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ka",
  grade: 8,
  title: "Insha za Kubuni: Masimulizi (Wazo Moja Kuu)",
  description: "Bainisha na uandike aya za insha ya masimulizi zinazoendeleza wazo moja kuu.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, ISTILAHI.map((i) => ({ id: i.id, label: i.maelezo })));
      const targets = shuffle(rng, ISTILAHI.map((i) => ({ id: i.id, label: i.term })));
      const correctMap: Record<string, string> = {};
      for (const i of ISTILAHI) correctMap[i.id] = i.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila istilahi ya ujenzi wa aya na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Aya bora huanza na sentensi elekezi, ikafuatwa na sentensi tegemezi zinazounga mkono wazo kuu.",
        explanation: ISTILAHI.map((i) => `${i.term} — ${i.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const idx = randInt(rng, 0, AYA_WAZO_MOJA.length - 1);
      const wazoMoja = AYA_WAZO_MOJA[idx];
      const mawazoMengi = AYA_MAWAZO_MENGI[idx];
      const items = shuffle(rng, [
        { id: "a", label: wazoMoja, bucket: "moja" },
        { id: "b", label: mawazoMengi, bucket: "mengi" },
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga aya hizi mbili kulingana na kama zina wazo moja kuu au mawazo mengi yaliyochanganywa.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "moja", label: "Wazo Moja Kuu" },
          { id: "mengi", label: "Mawazo Mengi Yamechanganywa" },
        ],
        correctBucket,
        hint: "Aya yenye wazo moja kuu huzungumzia jambo moja tu kwa undani, si mambo mengi tofauti.",
        explanation: `Aya yenye wazo moja kuu: "${wazoMoja}". Aya yenye mawazo mengi: "${mawazoMengi}".`,
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HATUA_KUANDIKA_AYA);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kuandika aya yenye wazo moja kuu kwa mpangilio unaofaa.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_KUANDIKA_AYA.map((h) => h.id),
        hint: "Anza kwa kuchagua wazo, kisha andika sentensi elekezi, ongeza maelezo, na hitimisha.",
        explanation: HATUA_KUANDIKA_AYA.map((h) => h.label).join(" → "),
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
      hint: "Kila aya bora ya insha ya masimulizi huzingatia wazo moja kuu pekee.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
