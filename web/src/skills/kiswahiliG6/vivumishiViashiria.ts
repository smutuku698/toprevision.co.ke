import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// SA.2 — Vivumishi Viashiria (demonstrative adjectives): full paradigm across noun sub-classes x 3 proximity levels.
type Proximity = "karibu" | "kati" | "mbali";

const PROXIMITY_LABEL: Record<Proximity, string> = { karibu: "Karibu (near speaker)", kati: "Kati (near listener)", mbali: "Mbali (far from both)" };
const PROXIMITY_MAELEZO: Record<Proximity, string> = {
  karibu: "kwa kitu kilicho karibu na msemaji",
  kati: "kwa kitu kilicho karibu kidogo na msikilizaji, si karibu sana na msemaji",
  mbali: "kwa kitu kilicho mbali na msemaji na msikilizaji wote",
};

interface Kiashiria {
  nomino: string;
  ngeli: string;
  karibu: string;
  kati: string;
  mbali: string;
}

const VIASHIRIA: Kiashiria[] = [
  { nomino: "Mtoto", ngeli: "A-WA (umoja)", karibu: "huyu", kati: "huyo", mbali: "yule" },
  { nomino: "Watoto", ngeli: "A-WA (wingi)", karibu: "hawa", kati: "hao", mbali: "wale" },
  { nomino: "Mti", ngeli: "U (umoja)", karibu: "huu", kati: "huo", mbali: "ule" },
  { nomino: "Mkono", ngeli: "U (umoja)", karibu: "huu", kati: "huo", mbali: "ule" },
  { nomino: "Miti", ngeli: "I (wingi)", karibu: "hii", kati: "hiyo", mbali: "ile" },
  { nomino: "Kitabu", ngeli: "KI (umoja)", karibu: "hiki", kati: "hicho", mbali: "kile" },
  { nomino: "Kiti", ngeli: "KI (umoja)", karibu: "hiki", kati: "hicho", mbali: "kile" },
  { nomino: "Vitabu", ngeli: "VI (wingi)", karibu: "hivi", kati: "hivyo", mbali: "vile" },
  { nomino: "Tunda", ngeli: "LI (umoja)", karibu: "hili", kati: "hilo", mbali: "lile" },
  { nomino: "Matunda", ngeli: "YA (wingi)", karibu: "haya", kati: "hayo", mbali: "yale" },
  { nomino: "Nyumba", ngeli: "N (umoja)", karibu: "hii", kati: "hiyo", mbali: "ile" },
  { nomino: "Nguo", ngeli: "N (wingi)", karibu: "hizi", kati: "hizo", mbali: "zile" },
];

const MAJINA = ["Wanjiku", "Kamau", "Achieng", "Otieno", "Chebet", "Kiplagat", "Amina", "Hassan", "Mumbi", "Njoroge"];
const MAHALI = ["Kisumu", "Nakuru", "Machakos", "Eldoret", "Mombasa", "Nyeri", "Kitale", "Garissa", "Kericho", "Kakamega"];

function jaza(s: string, name: string, place: string): string {
  return s.replace(/\{NAME\}/g, name).replace(/\{PLACE\}/g, place);
}

interface JazaViashiria {
  before: string;
  after: string;
  nomino: string;
  proximity: Proximity;
  sahihi: string;
  makosa: string[];
}

const JAZA_TEMPLATES: JazaViashiria[] = [
  { before: "{NAME} anamlea mtoto", after: " tangu alipozaliwa {PLACE}.", nomino: "Mtoto", proximity: "karibu", sahihi: "huyu", makosa: ["huyo", "yule", "hiki"] },
  { before: "Wale watoto wanaocheza mbali na {PLACE} ni wa", after: " {NAME}.", nomino: "Watoto", proximity: "mbali", sahihi: "wale", makosa: ["hawa", "hao", "kile"] },
  { before: "Mti", after: " ulioko karibu na shule ya {PLACE} ni wa {NAME}.", nomino: "Mti", proximity: "kati", sahihi: "huo", makosa: ["huu", "ule", "hicho"] },
  { before: "Miti", after: " iliyopandwa na {NAME} mjini {PLACE} inakua vizuri.", nomino: "Miti", proximity: "karibu", sahihi: "hii", makosa: ["hiyo", "ile", "hivi"] },
  { before: "{NAME} alisahau kitabu", after: " alichokiacha nyumbani {PLACE} mbali kabisa.", nomino: "Kitabu", proximity: "mbali", sahihi: "kile", makosa: ["hiki", "hicho", "lile"] },
  { before: "Vitabu", after: " alivyoviuza {NAME} sokoni {PLACE} vilikuwa vipya.", nomino: "Vitabu", proximity: "kati", sahihi: "hivyo", makosa: ["hivi", "vile", "hayo"] },
  { before: "{NAME} anakula tunda", after: " alilolichuma leo {PLACE}.", nomino: "Tunda", proximity: "karibu", sahihi: "hili", makosa: ["hilo", "lile", "hiki"] },
  { before: "Matunda", after: " yaliyoko shambani mbali kutoka {PLACE} ni ya {NAME}.", nomino: "Matunda", proximity: "mbali", sahihi: "yale", makosa: ["haya", "hayo", "vile"] },
  { before: "Nyumba", after: " iliyoko karibu kidogo na duka la {NAME} {PLACE} ni kubwa.", nomino: "Nyumba", proximity: "kati", sahihi: "hiyo", makosa: ["hii", "ile", "hicho"] },
  { before: "{NAME} anafulia nguo", after: " alizozivaa jana {PLACE}.", nomino: "Nguo", proximity: "karibu", sahihi: "hizi", makosa: ["hizo", "zile", "hivi"] },
  { before: "Mkono", after: " alioutumia {NAME} kubeba mzigo mzito {PLACE} uliumia.", nomino: "Mkono", proximity: "mbali", sahihi: "ule", makosa: ["huu", "huo", "kile"] },
  { before: "{NAME} ameketi kwenye kiti", after: " alichokiweka karibu na mlango {PLACE}.", nomino: "Kiti", proximity: "karibu", sahihi: "hiki", makosa: ["hicho", "kile", "hili"] },
];

export const vivumishiViashiria: Skill = {
  id: "g6-ksw-sarufi-vivumishi-viashiria",
  code: "SA.2",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Vivumishi Viashiria",
  description: "Tambua na utumie vivumishi viashiria (huyu/huyo/yule, hiki/hicho/kile n.k.) kuonyesha umbali wa mtu au kitu kutegemea ngeli ya nomino.",
  generate(rng) {
    const branch = randChoice(rng, ["fomu-sahihi", "panga-ukaribu", "oanisha-kiashiria", "jaza-kiashiria", "sentensi-umbali", "panga-sentensi"] as const);

    if (branch === "fomu-sahihi") {
      const combo = randChoice(rng, VIASHIRIA);
      const proximity = randChoice(rng, ["karibu", "kati", "mbali"] as const);
      const correct = combo[proximity];
      const wrongProximity = (["karibu", "kati", "mbali"] as const).filter((p) => p !== proximity).map((p) => combo[p]);
      const wrongClass = randChoice(rng, VIASHIRIA.filter((v) => v.nomino !== combo.nomino && v[proximity] !== correct))[proximity];
      const choices = shuffle(rng, [correct, ...wrongProximity, wrongClass]);
      return {
        kind: "multiple-choice",
        prompt: `"${combo.nomino}" (ngeli ${combo.ngeli}) iko ${PROXIMITY_LABEL[proximity].split(" (")[0].toLowerCase()} na msemaji. Ni kivumishi kiashiria kipi sahihi?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "grid",
        hint: PROXIMITY_MAELEZO[proximity],
        explanation: `"${combo.nomino} ${correct}" ni sahihi kwa sababu "${combo.nomino}" ni ngeli ${combo.ngeli} na kiko ${proximity}: ${PROXIMITY_MAELEZO[proximity]}.`,
      };
    }

    if (branch === "panga-ukaribu") {
      const chosen = shuffle(rng, VIASHIRIA).slice(0, 4);
      const items = chosen.flatMap((v) => (["karibu", "kati", "mbali"] as const).map((p) => ({ id: `${v.nomino}-${p}`, label: `${v.nomino} ${v[p]}`, bucket: p })));
      const picked = shuffle(rng, items).slice(0, 9);
      const correctBucket: Record<string, string> = {};
      for (const item of picked) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kifungu cha kiashiria kulingana na kiwango cha ukaribu: Karibu, Kati, au Mbali.",
        items: shuffle(rng, picked).map(({ id, label }) => ({ id, label })),
        buckets: (["karibu", "kati", "mbali"] as const).map((p) => ({ id: p, label: PROXIMITY_LABEL[p] })),
        correctBucket,
        hint: "Fikiria umbali kutoka kwa msemaji hadi kwa msikilizaji.",
        explanation: picked.map((i) => `"${i.label}" ni ${PROXIMITY_LABEL[i.bucket as Proximity]}.`).join(" "),
      };
    }

    if (branch === "oanisha-kiashiria") {
      const proximity = randChoice(rng, ["karibu", "kati", "mbali"] as const);
      const chosen = shuffle(rng, VIASHIRIA).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((v) => ({ id: v.nomino, label: v.nomino })));
      const targets = shuffle(rng, chosen.map((v) => ({ id: v.nomino, label: v[proximity] })));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.nomino] = v.nomino;
      return {
        kind: "click-match",
        prompt: `Oanisha kila nomino na kivumishi chake kiashiria sahihi cha "${PROXIMITY_LABEL[proximity]}".`,
        tokens,
        targets,
        correctMap,
        hint: PROXIMITY_MAELEZO[proximity],
        explanation: chosen.map((v) => `"${v.nomino} ${v[proximity]}" ni sahihi (ngeli ${v.ngeli}).`).join(" "),
      };
    }

    if (branch === "jaza-kiashiria") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kivumishi kiashiria sahihi.",
        before: jaza(t.before, name, place),
        after: jaza(t.after, name, place),
        correctAnswer: t.sahihi,
        inputMode: "text",
        hint: `"${t.nomino}" na kiwango cha ukaribu "${t.proximity}" — ${PROXIMITY_MAELEZO[t.proximity]}.`,
        explanation: `Sentensi kamili ni: "${jaza(t.before, name, place)} ${t.sahihi}${jaza(t.after, name, place)}"`,
      };
    }

    if (branch === "sentensi-umbali") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      const before = jaza(t.before, name, place);
      const after = jaza(t.after, name, place);
      const choices = shuffle(rng, [t.sahihi, ...t.makosa]).map((form) => `${before} ${form}${after}`);
      const correctSentensi = `${before} ${t.sahihi}${after}`;
      return {
        kind: "multiple-choice",
        prompt: `Chagua sentensi yenye kivumishi kiashiria sahihi kuonyesha kitu kilicho "${t.proximity}".`,
        choices,
        correctIndex: choices.indexOf(correctSentensi),
        layout: "list",
        hint: PROXIMITY_MAELEZO[t.proximity],
        explanation: `Sentensi sahihi ni: "${correctSentensi}"`,
      };
    }

    const t = randChoice(rng, JAZA_TEMPLATES);
    const name = randChoice(rng, MAJINA);
    const place = randChoice(rng, MAHALI);
    const kamili = jaza(`${t.before} ${t.sahihi}${t.after}`, name, place).replace(/\.$/, "");
    const words = kamili.split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye kivumishi kiashiria.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `"${t.nomino}" hutumia kiashiria "${t.sahihi}" kwa kiwango cha "${t.proximity}".`,
      explanation: `Sentensi sahihi ni: "${kamili}."`,
    };
  },
};
