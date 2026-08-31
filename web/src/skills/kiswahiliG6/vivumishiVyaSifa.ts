import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// SA.1 — Vivumishi vya Sifa (quality/descriptive adjectives).
// Noun-class agreement: A-WA (watu), U-I (mimea/vitu virefu), KI-VI (vitu), LI-YA (matunda n.k.), N (nyumba n.k.)
type Ngeli = "A-WA" | "U-I" | "KI-VI" | "LI-YA" | "N";

const NGELI_MAELEZO: Record<Ngeli, string> = {
  "A-WA": "ngeli ya watu — huchukua kiambishi 'm-' umoja na 'wa-' wingi (mfano: mtoto mzuri, watoto wazuri)",
  "U-I": "ngeli ya mimea/vitu — huchukua kiambishi 'm-' umoja na 'mi-' wingi (mfano: mti mzuri, miti mizuri)",
  "KI-VI": "ngeli ya vitu — huchukua kiambishi 'ki-' umoja na 'vi-' wingi (mfano: kitabu kizuri, vitabu vizuri)",
  "LI-YA": "ngeli ya matunda/viungo — huchukua kiambishi tupu umoja na 'ma-' wingi (mfano: tunda zuri, matunda mazuri)",
  N: "ngeli ya N — kwa kawaida hubaki bila kiambishi au huchukua 'n-' (mfano: nyumba nzuri, njia ndefu)",
};

const MIZIZI_MAANA: { mzizi: string; maana: string }[] = [
  { mzizi: "zuri", maana: "-zuri (nzuri, la kupendeza)" },
  { mzizi: "baya", maana: "-baya (lisilo zuri)" },
  { mzizi: "refu", maana: "-refu (lenye urefu mkubwa)" },
  { mzizi: "fupi", maana: "-fupi (lisilo na urefu)" },
  { mzizi: "kubwa", maana: "-kubwa (lenye ukubwa)" },
  { mzizi: "dogo", maana: "-dogo (lisilo kubwa)" },
  { mzizi: "nono", maana: "-nono (lenye mnofu mwingi, nene)" },
  { mzizi: "embamba", maana: "-embamba (lisilo na unene)" },
  { mzizi: "gumu", maana: "-gumu (lisiloweza kuinama/kukatika kwa urahisi)" },
  { mzizi: "laini", maana: "-laini (lisilo gumu, laini kuguswa)" },
  { mzizi: "changa", maana: "-changa (chenye umri mdogo)" },
  { mzizi: "kongwe", maana: "-kongwe (chenye umri mkubwa/cha zamani)" },
  { mzizi: "pana", maana: "-pana (chenye upana mkubwa)" },
];

interface Mchanganyiko {
  nomino: string;
  ngeli: Ngeli;
  kivumishi: string;
  mzizi: string;
}

const MICHANGANYIKO: Mchanganyiko[] = [
  // zuri
  { nomino: "Mwalimu", ngeli: "A-WA", kivumishi: "mzuri", mzizi: "zuri" },
  { nomino: "Walimu", ngeli: "A-WA", kivumishi: "wazuri", mzizi: "zuri" },
  { nomino: "Mti", ngeli: "U-I", kivumishi: "mzuri", mzizi: "zuri" },
  { nomino: "Miti", ngeli: "U-I", kivumishi: "mizuri", mzizi: "zuri" },
  { nomino: "Kitabu", ngeli: "KI-VI", kivumishi: "kizuri", mzizi: "zuri" },
  { nomino: "Vitabu", ngeli: "KI-VI", kivumishi: "vizuri", mzizi: "zuri" },
  { nomino: "Tunda", ngeli: "LI-YA", kivumishi: "zuri", mzizi: "zuri" },
  { nomino: "Matunda", ngeli: "LI-YA", kivumishi: "mazuri", mzizi: "zuri" },
  { nomino: "Nyumba", ngeli: "N", kivumishi: "nzuri", mzizi: "zuri" },
  // baya
  { nomino: "Mwanafunzi", ngeli: "A-WA", kivumishi: "mbaya", mzizi: "baya" },
  { nomino: "Wanafunzi", ngeli: "A-WA", kivumishi: "wabaya", mzizi: "baya" },
  { nomino: "Mto", ngeli: "U-I", kivumishi: "mbaya", mzizi: "baya" },
  { nomino: "Mito", ngeli: "U-I", kivumishi: "mibaya", mzizi: "baya" },
  { nomino: "Kiti", ngeli: "KI-VI", kivumishi: "kibaya", mzizi: "baya" },
  { nomino: "Viti", ngeli: "KI-VI", kivumishi: "vibaya", mzizi: "baya" },
  { nomino: "Jicho", ngeli: "LI-YA", kivumishi: "baya", mzizi: "baya" },
  { nomino: "Macho", ngeli: "LI-YA", kivumishi: "mabaya", mzizi: "baya" },
  { nomino: "Nyumba", ngeli: "N", kivumishi: "mbaya", mzizi: "baya" },
  // refu
  { nomino: "Mvulana", ngeli: "A-WA", kivumishi: "mrefu", mzizi: "refu" },
  { nomino: "Wavulana", ngeli: "A-WA", kivumishi: "warefu", mzizi: "refu" },
  { nomino: "Mti", ngeli: "U-I", kivumishi: "mrefu", mzizi: "refu" },
  { nomino: "Miti", ngeli: "U-I", kivumishi: "mirefu", mzizi: "refu" },
  { nomino: "Kiatu", ngeli: "KI-VI", kivumishi: "kirefu", mzizi: "refu" },
  { nomino: "Viatu", ngeli: "KI-VI", kivumishi: "virefu", mzizi: "refu" },
  { nomino: "Tawi", ngeli: "LI-YA", kivumishi: "refu", mzizi: "refu" },
  { nomino: "Matawi", ngeli: "LI-YA", kivumishi: "marefu", mzizi: "refu" },
  { nomino: "Njia", ngeli: "N", kivumishi: "ndefu", mzizi: "refu" },
  // fupi
  { nomino: "Msichana", ngeli: "A-WA", kivumishi: "mfupi", mzizi: "fupi" },
  { nomino: "Wasichana", ngeli: "A-WA", kivumishi: "wafupi", mzizi: "fupi" },
  { nomino: "Mkono", ngeli: "U-I", kivumishi: "mfupi", mzizi: "fupi" },
  { nomino: "Mikono", ngeli: "U-I", kivumishi: "mifupi", mzizi: "fupi" },
  { nomino: "Kijiko", ngeli: "KI-VI", kivumishi: "kifupi", mzizi: "fupi" },
  { nomino: "Vijiko", ngeli: "KI-VI", kivumishi: "vifupi", mzizi: "fupi" },
  { nomino: "Tawi", ngeli: "LI-YA", kivumishi: "fupi", mzizi: "fupi" },
  { nomino: "Matawi", ngeli: "LI-YA", kivumishi: "mafupi", mzizi: "fupi" },
  { nomino: "Safari", ngeli: "N", kivumishi: "fupi", mzizi: "fupi" },
  // kubwa
  { nomino: "Mtu", ngeli: "A-WA", kivumishi: "mkubwa", mzizi: "kubwa" },
  { nomino: "Watu", ngeli: "A-WA", kivumishi: "wakubwa", mzizi: "kubwa" },
  { nomino: "Kitu", ngeli: "KI-VI", kivumishi: "kikubwa", mzizi: "kubwa" },
  { nomino: "Vitu", ngeli: "KI-VI", kivumishi: "vikubwa", mzizi: "kubwa" },
  { nomino: "Nyumba", ngeli: "N", kivumishi: "kubwa", mzizi: "kubwa" },
  // dogo
  { nomino: "Mtoto", ngeli: "A-WA", kivumishi: "mdogo", mzizi: "dogo" },
  { nomino: "Watoto", ngeli: "A-WA", kivumishi: "wadogo", mzizi: "dogo" },
  { nomino: "Kitu", ngeli: "KI-VI", kivumishi: "kidogo", mzizi: "dogo" },
  { nomino: "Vitu", ngeli: "KI-VI", kivumishi: "vidogo", mzizi: "dogo" },
  { nomino: "Nyumba", ngeli: "N", kivumishi: "ndogo", mzizi: "dogo" },
  // nono
  { nomino: "Mtoto", ngeli: "A-WA", kivumishi: "mnono", mzizi: "nono" },
  { nomino: "Watoto", ngeli: "A-WA", kivumishi: "wanono", mzizi: "nono" },
  // embamba
  { nomino: "Mwanamke", ngeli: "A-WA", kivumishi: "mwembamba", mzizi: "embamba" },
  { nomino: "Wanawake", ngeli: "A-WA", kivumishi: "wembamba", mzizi: "embamba" },
  { nomino: "Kitambaa", ngeli: "KI-VI", kivumishi: "chembamba", mzizi: "embamba" },
  { nomino: "Vitambaa", ngeli: "KI-VI", kivumishi: "vyembamba", mzizi: "embamba" },
  // gumu
  { nomino: "Jiwe", ngeli: "LI-YA", kivumishi: "gumu", mzizi: "gumu" },
  { nomino: "Mawe", ngeli: "LI-YA", kivumishi: "magumu", mzizi: "gumu" },
  { nomino: "Kazi", ngeli: "N", kivumishi: "ngumu", mzizi: "gumu" },
  { nomino: "Kiti", ngeli: "KI-VI", kivumishi: "kigumu", mzizi: "gumu" },
  { nomino: "Viti", ngeli: "KI-VI", kivumishi: "vigumu", mzizi: "gumu" },
  // laini
  { nomino: "Kitambaa", ngeli: "KI-VI", kivumishi: "kilaini", mzizi: "laini" },
  { nomino: "Vitambaa", ngeli: "KI-VI", kivumishi: "vilaini", mzizi: "laini" },
  { nomino: "Nywele", ngeli: "N", kivumishi: "laini", mzizi: "laini" },
  { nomino: "Mtu", ngeli: "A-WA", kivumishi: "mlaini", mzizi: "laini" },
  { nomino: "Watu", ngeli: "A-WA", kivumishi: "walaini", mzizi: "laini" },
  // changa
  { nomino: "Mtoto", ngeli: "A-WA", kivumishi: "mchanga", mzizi: "changa" },
  { nomino: "Watoto", ngeli: "A-WA", kivumishi: "wachanga", mzizi: "changa" },
  { nomino: "Jani", ngeli: "LI-YA", kivumishi: "changa", mzizi: "changa" },
  { nomino: "Majani", ngeli: "LI-YA", kivumishi: "machanga", mzizi: "changa" },
  // kongwe
  { nomino: "Mzee", ngeli: "A-WA", kivumishi: "mkongwe", mzizi: "kongwe" },
  { nomino: "Wazee", ngeli: "A-WA", kivumishi: "wakongwe", mzizi: "kongwe" },
  { nomino: "Mti", ngeli: "U-I", kivumishi: "mkongwe", mzizi: "kongwe" },
  { nomino: "Miti", ngeli: "U-I", kivumishi: "mikongwe", mzizi: "kongwe" },
  // pana
  { nomino: "Mto", ngeli: "U-I", kivumishi: "mpana", mzizi: "pana" },
  { nomino: "Mito", ngeli: "U-I", kivumishi: "mipana", mzizi: "pana" },
  { nomino: "Barabara", ngeli: "N", kivumishi: "pana", mzizi: "pana" },
  { nomino: "Kiwanja", ngeli: "KI-VI", kivumishi: "kipana", mzizi: "pana" },
  { nomino: "Viwanja", ngeli: "KI-VI", kivumishi: "vipana", mzizi: "pana" },
];

// Roots with 4+ distinct concord forms — safe pool for "wrong noun-class prefix" distractors.
const MIZIZI_YENYE_UTOFAUTI = ["zuri", "baya", "refu", "fupi", "kubwa", "dogo", "embamba", "gumu", "laini", "changa", "pana"];

const MAJINA = ["Wanjiku", "Kamau", "Achieng", "Otieno", "Chebet", "Kiplagat", "Amina", "Hassan", "Mumbi", "Njoroge"];
const MAHALI = ["Kisumu", "Nakuru", "Machakos", "Eldoret", "Mombasa", "Nyeri", "Kitale", "Garissa", "Kericho", "Kakamega"];

function jaza(s: string, name: string, place: string): string {
  return s.replace(/\{NAME\}/g, name).replace(/\{PLACE\}/g, place);
}

interface JazaKiel {
  before: string;
  after: string;
  sahihi: string;
  makosa: string[];
  ngeli: Ngeli;
  mzizi: string;
}

const JAZA_TEMPLATES: JazaKiel[] = [
  { before: "{NAME} ana mwalimu", after: " anayewafundisha kwa bidii shuleni {PLACE}.", sahihi: "mzuri", makosa: ["wazuri", "mizuri", "kizuri"], ngeli: "A-WA", mzizi: "zuri" },
  { before: "Karibu na shule ya {PLACE}, kuna miti", after: " inayotoa kivuli wakati wa jua.", sahihi: "mirefu", makosa: ["mrefu", "kirefu", "warefu"], ngeli: "U-I", mzizi: "refu" },
  { before: "{NAME} alinunua vitabu", after: " dukani {PLACE} wiki iliyopita.", sahihi: "vizuri", makosa: ["kizuri", "wazuri", "mazuri"], ngeli: "KI-VI", mzizi: "zuri" },
  { before: "Sokoni {PLACE}, {NAME} aliuza matunda", after: " yaliyoiva vizuri.", sahihi: "mazuri", makosa: ["mzuri", "vizuri", "zuri"], ngeli: "LI-YA", mzizi: "zuri" },
  { before: "Nyumba ya {NAME} kule {PLACE} ni", after: " kuliko nyingine zote mtaani.", sahihi: "nzuri", makosa: ["mzuri", "kizuri", "zuri"], ngeli: "N", mzizi: "zuri" },
  { before: "{NAME} anamtunza mtoto", after: " wa dada yake usiku kucha huko {PLACE}.", sahihi: "mchanga", makosa: ["wachanga", "kichanga", "changa"], ngeli: "A-WA", mzizi: "changa" },
  { before: "Barabara kuu kutoka {PLACE} ni", after: " na magari mengi hupita kila siku.", sahihi: "pana", makosa: ["mpana", "kipana", "wapana"], ngeli: "N", mzizi: "pana" },
  { before: "{NAME} aliketi kwenye kiti", after: " cha mbao shuleni {PLACE}.", sahihi: "kigumu", makosa: ["gumu", "magumu", "ngumu"], ngeli: "KI-VI", mzizi: "gumu" },
  { before: "{NAME} alipoteza kitu", after: " sana mfukoni mwake huko {PLACE}.", sahihi: "kidogo", makosa: ["mdogo", "ndogo", "wadogo"], ngeli: "KI-VI", mzizi: "dogo" },
  { before: "{NAME} alinunua kitambaa", after: " sokoni {PLACE} cha kufunga mtoto.", sahihi: "kilaini", makosa: ["laini", "malaini", "walaini"], ngeli: "KI-VI", mzizi: "laini" },
  { before: "Kijijini {PLACE}, anaishi mzee", after: " anayeheshimika sana na {NAME}.", sahihi: "mkongwe", makosa: ["wakongwe", "kikongwe", "kongwe"], ngeli: "A-WA", mzizi: "kongwe" },
  { before: "{NAME} aliokota jani", after: " lililoanguka kutoka mtini huko {PLACE}.", sahihi: "changa", makosa: ["mchanga", "kichanga", "machanga"], ngeli: "LI-YA", mzizi: "changa" },
];

export const vivumishiVyaSifa: Skill = {
  id: "g6-ksw-sarufi-vivumishi-vya-sifa",
  code: "SA.1",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Vivumishi vya Sifa",
  description: "Tambua na utumie vivumishi vya sifa (-zuri, -baya, -refu, -fupi, -kubwa n.k.) kwa upatanisho sahihi wa kisarufi kutegemea ngeli ya nomino.",
  generate(rng) {
    const branch = randChoice(rng, ["fomu-sahihi", "oanisha-maana", "panga-ngeli", "jaza-kivumishi", "panga-sentensi"] as const);

    if (branch === "fomu-sahihi") {
      const chaguo = shuffle(rng, MICHANGANYIKO.filter((m) => MIZIZI_YENYE_UTOFAUTI.includes(m.mzizi)));
      const combo = chaguo[0];
      const distractorPool = Array.from(
        new Set(MICHANGANYIKO.filter((m) => m.mzizi === combo.mzizi && m.kivumishi !== combo.kivumishi).map((m) => m.kivumishi))
      );
      const distractors = shuffle(rng, distractorPool).slice(0, 3);
      const choices = shuffle(rng, [combo.kivumishi, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `"${combo.nomino}" ni ngeli ya ${combo.ngeli}. Ni kivumishi kipi chenye upatanisho sahihi cha mzizi "-${combo.mzizi}"?`,
        choices,
        correctIndex: choices.indexOf(combo.kivumishi),
        layout: "grid",
        hint: NGELI_MAELEZO[combo.ngeli],
        explanation: `"${combo.nomino} ${combo.kivumishi}" ni sahihi kwa sababu ${combo.nomino.toLowerCase()} ni ${NGELI_MAELEZO[combo.ngeli]}`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, MIZIZI_MAANA).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.mzizi, label: `-${m.mzizi}` })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.mzizi, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.mzizi] = m.mzizi;
      return {
        kind: "click-match",
        prompt: "Oanisha kila mzizi wa kivumishi cha sifa na maana yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria sifa gani hutajwa na kila mzizi.",
        explanation: chosen.map((m) => `"-${m.mzizi}" ina maana ${m.maana}.`).join(" "),
      };
    }

    if (branch === "panga-ngeli") {
      const ngeliZote: Ngeli[] = ["A-WA", "U-I", "KI-VI", "LI-YA", "N"];
      const chosen = ngeliZote.flatMap((n) => shuffle(rng, MICHANGANYIKO.filter((m) => m.ngeli === n)).slice(0, 2));
      const items = chosen.map((m) => ({ id: `${m.nomino}-${m.kivumishi}`, label: `${m.nomino} ${m.kivumishi}` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((m, i) => {
        correctBucket[items[i].id] = m.ngeli;
      });
      return {
        kind: "categorize",
        prompt: "Panga kila kifungu cha nomino+kivumishi katika ngeli inayolingana.",
        items: shuffle(rng, items),
        buckets: ngeliZote.map((n) => ({ id: n, label: n })),
        correctBucket,
        hint: "Angalia kiambishi kilichoambatanishwa na kivumishi kuamua ngeli.",
        explanation: chosen.map((m) => `"${m.nomino} ${m.kivumishi}" ni ngeli ya ${m.ngeli}.`).join(" "),
      };
    }

    if (branch === "jaza-kivumishi") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kivumishi chenye upatanisho sahihi wa kisarufi.",
        before: jaza(t.before, name, place),
        after: jaza(t.after, name, place),
        correctAnswer: t.sahihi,
        inputMode: "text",
        hint: `Nomino hii ni ya ngeli ${t.ngeli} — ${NGELI_MAELEZO[t.ngeli]}.`,
        explanation: `Sentensi kamili ni: "${jaza(t.before, name, place)} ${t.sahihi}${jaza(t.after, name, place)}"`,
      };
    }

    const t = randChoice(rng, JAZA_TEMPLATES);
    const name = randChoice(rng, MAJINA);
    const place = randChoice(rng, MAHALI);
    const kamili = `${jaza(t.before, name, place)} ${t.sahihi}${jaza(t.after, name, place)}`;
    const maneno = kamili.replace(/[.,]/g, "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye upatanisho wa kivumishi cha sifa.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Nomino inayohusika ni ya ngeli ${t.ngeli} — ${NGELI_MAELEZO[t.ngeli]}.`,
      explanation: `Sentensi sahihi ni: "${kamili}"`,
    };
  },
};
