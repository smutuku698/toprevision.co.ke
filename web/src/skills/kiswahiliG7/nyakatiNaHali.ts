import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Nyakati = "Uliopo" | "Uliopita" | "Ujao" | "Uliopita Hali ya Kuendelea" | "Ujao Hali ya Kuendelea";

const NYAKATI_MFANO: { nyakati: Nyakati; sentensi: string }[] = [
  { nyakati: "Uliopo", sentensi: "Juma anasoma kitabu darasani." },
  { nyakati: "Uliopita", sentensi: "Juma alisoma kitabu jana usiku." },
  { nyakati: "Ujao", sentensi: "Juma atasoma kitabu kesho." },
  { nyakati: "Uliopita Hali ya Kuendelea", sentensi: "Juma alikuwa akisoma kitabu wakati mwalimu alipoingia." },
  { nyakati: "Ujao Hali ya Kuendelea", sentensi: "Juma atakuwa akisoma kitabu saa hii kesho." },
];

const VITENZI_KWA_NYAKATI: { nyakati: Nyakati; kitenzi: string }[] = [
  { nyakati: "Uliopo", kitenzi: "anacheza" },
  { nyakati: "Uliopita", kitenzi: "alicheza" },
  { nyakati: "Ujao", kitenzi: "atacheza" },
  { nyakati: "Uliopita Hali ya Kuendelea", kitenzi: "alikuwa akicheza" },
  { nyakati: "Ujao Hali ya Kuendelea", kitenzi: "atakuwa akicheza" },
];

const MABADILISHO: { kwanza: string; nyakatiKwanza: Nyakati; lengwa: Nyakati; before: string; after: string; jibu: string; kamili: string }[] = [
  {
    kwanza: "Amina anaandika barua sasa hivi.",
    nyakatiKwanza: "Uliopo",
    lengwa: "Ujao",
    before: "Amina",
    after: " barua kesho.",
    jibu: "ataandika",
    kamili: "Amina ataandika barua kesho.",
  },
  {
    kwanza: "Otieno alipika chakula jana.",
    nyakatiKwanza: "Uliopita",
    lengwa: "Uliopo",
    before: "Otieno",
    after: " chakula sasa hivi.",
    jibu: "anapika",
    kamili: "Otieno anapika chakula sasa hivi.",
  },
  {
    kwanza: "Wanafunzi watacheza mpira kesho.",
    nyakatiKwanza: "Ujao",
    lengwa: "Uliopita",
    before: "Wanafunzi",
    after: " mpira jana.",
    jibu: "walicheza",
    kamili: "Wanafunzi walicheza mpira jana.",
  },
];

const HADITHI_MTIRIRIKO = [
  { id: "kabla", label: "Baraka alikuwa akifanya kazi shambani kabla ya jua kuchomoza.", nyakati: "Uliopita Hali ya Kuendelea" as Nyakati },
  { id: "sasa", label: "Baraka anafanya kazi shambani sasa hivi.", nyakati: "Uliopo" as Nyakati },
  { id: "baadaye", label: "Baraka atakuwa akifanya kazi shambani saa hii kesho.", nyakati: "Ujao Hali ya Kuendelea" as Nyakati },
];

export const nyakatiNaHali: Skill = {
  id: "g7-ksw-sarufi-nyakati-na-hali",
  code: "SA.3",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Nyakati na Hali",
  description: "Tambua na utumie nyakati tano: uliopo, uliopita, ujao, uliopita hali ya kuendelea, na ujao hali ya kuendelea.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha-nyakati", "panga-vitenzi", "saa-nyakati", "badilisha-wakati", "tambua-nyakati", "mtiririko-wakati"] as const);

    if (branch === "oanisha-nyakati") {
      const tokens = shuffle(rng, NYAKATI_MFANO.map((n) => ({ id: n.nyakati, label: n.nyakati })));
      const targets = shuffle(rng, NYAKATI_MFANO.map((n) => ({ id: n.nyakati, label: n.sentensi })));
      const correctMap: Record<string, string> = {};
      for (const n of NYAKATI_MFANO) correctMap[n.nyakati] = n.nyakati;
      return {
        kind: "click-match",
        prompt: "Oanisha kila wakati na sentensi inayolingana nao.",
        tokens,
        targets,
        correctMap,
        hint: "Zingatia kiambishi cha wakati kilicho ndani ya kitenzi: -na-, -li-, -ta-, au muundo wa 'alikuwa/atakuwa aki-'.",
        explanation: NYAKATI_MFANO.map((n) => `Wakati ${n.nyakati}: "${n.sentensi}"`).join(" "),
      };
    }

    if (branch === "panga-vitenzi") {
      const items = VITENZI_KWA_NYAKATI.map((v) => ({ id: v.kitenzi, label: v.kitenzi, bucket: v.nyakati }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kitenzi katika wakati wake sahihi.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Uliopo", label: "Uliopo" },
          { id: "Uliopita", label: "Uliopita" },
          { id: "Ujao", label: "Ujao" },
          { id: "Uliopita Hali ya Kuendelea", label: "Uliopita Hali ya Kuendelea" },
          { id: "Ujao Hali ya Kuendelea", label: "Ujao Hali ya Kuendelea" },
        ],
        correctBucket,
        hint: "Tafuta kiambishi cha wakati katikati ya kitenzi.",
        explanation: VITENZI_KWA_NYAKATI.map((v) => `"${v.kitenzi}" ni wakati ${v.nyakati}.`).join(" "),
      };
    }

    if (branch === "saa-nyakati") {
      const hour = 5 + Math.floor(rng() * 15); // 5..19
      const minute = randChoice(rng, [0, 15, 30, 45]);
      const sahihi = "Halima anaandaa kifungua kinywa sasa hivi";
      const makosa = [
        "Halima aliandaa kifungua kinywa jana",
        "Halima ataandaa kifungua kinywa kesho",
        "Halima alikuwa akiandaa kifungua kinywa wiki iliyopita",
      ];
      const choices = shuffle(rng, [sahihi, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: "Saa iliyoonyeshwa ni 'sasa hivi'. Ni sentensi ipi inayotumia wakati uliopo kueleza kitendo kinachoendelea sasa hivi?",
        visual: { type: "clock", hour, minute },
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "list",
        hint: "Wakati uliopo hutumia kiambishi -na- kuonyesha kitendo kinachotokea sasa hivi.",
        explanation: `Sentensi ya wakati uliopo ni: "${sahihi}" — kiambishi -na- huonyesha kitendo kinachoendelea sasa hivi.`,
      };
    }

    if (branch === "badilisha-wakati") {
      const entry = randChoice(rng, MABADILISHO);
      return {
        kind: "fill-blank",
        prompt: `Badilisha sentensi "${entry.kwanza}" (wakati ${entry.nyakatiKwanza}) iwe wakati ${entry.lengwa}. Andika kitenzi kipya kinachofaa.`,
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.jibu,
        inputMode: "text",
        hint: `Badilisha kiambishi cha wakati ili kupata muundo wa wakati ${entry.lengwa}.`,
        explanation: `Sentensi kamili ni: "${entry.kamili}"`,
      };
    }

    if (branch === "tambua-nyakati") {
      const entry = randChoice(rng, NYAKATI_MFANO);
      const distractors = shuffle(rng, NYAKATI_MFANO.filter((n) => n.nyakati !== entry.nyakati).map((n) => n.nyakati)).slice(0, 3);
      const choices = shuffle(rng, [entry.nyakati, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Sentensi "${entry.sentensi}" iko katika wakati gani?`,
        choices,
        correctIndex: choices.indexOf(entry.nyakati),
        layout: "list",
        hint: "Angalia kiambishi cha wakati kilicho ndani ya kitenzi cha sentensi.",
        explanation: `Sentensi hii iko katika wakati ${entry.nyakati}.`,
      };
    }

    const items = shuffle(rng, HADITHI_MTIRIRIKO);
    return {
      kind: "ordering",
      prompt: "Panga sentensi hizi kufuatana na mtiririko wa wakati (kutoka la awali hadi la baadaye).",
      instruction: "Bofya kwa mpangilio sahihi wa wakati.",
      items,
      correctOrder: HADITHI_MTIRIRIKO.map((h) => h.id),
      hint: "Zingatia nyakati zilizotumika: hali ya kuendelea ya nyuma, wakati uliopo, kisha hali ya kuendelea ya mbeleni.",
      explanation: HADITHI_MTIRIRIKO.map((h) => `${h.label} (${h.nyakati})`).join(" → "),
    };
  },
};
