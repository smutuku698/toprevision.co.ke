import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// SA.5 — Vivumishi Viulizi (interrogative adjectives): -pi? agrees with noun class; gani? is invariant.
type Aina = "-pi" | "gani";

interface Kiulizi {
  nomino: string;
  ngeli: string;
  fomu: string;
  aina: Aina;
}

const VIULIZI: Kiulizi[] = [
  // -pi? paradigm
  { nomino: "Mtu", ngeli: "A-WA (umoja)", fomu: "yupi", aina: "-pi" },
  { nomino: "Mwanafunzi", ngeli: "A-WA (umoja)", fomu: "yupi", aina: "-pi" },
  { nomino: "Watu", ngeli: "A-WA (wingi)", fomu: "wepi", aina: "-pi" },
  { nomino: "Wanafunzi", ngeli: "A-WA (wingi)", fomu: "wepi", aina: "-pi" },
  { nomino: "Mti", ngeli: "U (umoja)", fomu: "upi", aina: "-pi" },
  { nomino: "Mkono", ngeli: "U (umoja)", fomu: "upi", aina: "-pi" },
  { nomino: "Miti", ngeli: "I (wingi)", fomu: "ipi", aina: "-pi" },
  { nomino: "Mikono", ngeli: "I (wingi)", fomu: "ipi", aina: "-pi" },
  { nomino: "Kitabu", ngeli: "KI (umoja)", fomu: "kipi", aina: "-pi" },
  { nomino: "Kiti", ngeli: "KI (umoja)", fomu: "kipi", aina: "-pi" },
  { nomino: "Vitabu", ngeli: "VI (wingi)", fomu: "vipi", aina: "-pi" },
  { nomino: "Viti", ngeli: "VI (wingi)", fomu: "vipi", aina: "-pi" },
  { nomino: "Tunda", ngeli: "LI (umoja)", fomu: "lipi", aina: "-pi" },
  { nomino: "Jicho", ngeli: "LI (umoja)", fomu: "lipi", aina: "-pi" },
  { nomino: "Matunda", ngeli: "YA (wingi)", fomu: "yapi", aina: "-pi" },
  { nomino: "Macho", ngeli: "YA (wingi)", fomu: "yapi", aina: "-pi" },
  { nomino: "Nyumba", ngeli: "N (umoja)", fomu: "ipi", aina: "-pi" },
  { nomino: "Safari", ngeli: "N (umoja)", fomu: "ipi", aina: "-pi" },
  { nomino: "Nguo", ngeli: "N (wingi)", fomu: "zipi", aina: "-pi" },
  { nomino: "Kalamu", ngeli: "N (wingi)", fomu: "zipi", aina: "-pi" },
  // gani? — invariant, follows any noun class directly
  { nomino: "Mtu", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Kitabu", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Nyumba", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Tunda", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Mti", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Nguo", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Chakula", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Mchezo", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Rangi", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Wanyama", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Ndege", ngeli: "yoyote", fomu: "gani", aina: "gani" },
  { nomino: "Samaki", ngeli: "yoyote", fomu: "gani", aina: "gani" },
];

const AINA_LABEL: Record<Aina, string> = { "-pi": "-pi? (hubadilika kutegemea ngeli)", gani: "gani? (haibadiliki kamwe)" };

const PI_FOMU_ZOTE = ["yupi", "wepi", "upi", "ipi", "kipi", "vipi", "lipi", "yapi", "zipi"];

const MAJINA = ["Wanjiku", "Kamau", "Achieng", "Otieno", "Chebet", "Kiplagat", "Amina", "Hassan", "Mumbi", "Njoroge"];
const MAHALI = ["Kisumu", "Nakuru", "Machakos", "Eldoret", "Mombasa", "Nyeri", "Kitale", "Garissa", "Kericho", "Kakamega"];

function jaza(s: string, name: string, place: string): string {
  return s.replace(/\{NAME\}/g, name).replace(/\{PLACE\}/g, place);
}

interface JazaKiulizi {
  before: string;
  after: string;
  sahihi: string;
  makosa: string[];
  ngeli: string;
}

const JAZA_TEMPLATES: JazaKiulizi[] = [
  { before: "{NAME} ana vitabu vingi mkobani. Anataka kitabu", after: " cha kusoma leo {PLACE}?", sahihi: "kipi", makosa: ["upi", "lipi", "vipi"], ngeli: "KI" },
  { before: "{PLACE}, kuna wanafunzi wengi wanaosubiri. Mwalimu anauliza: mwanafunzi", after: " aliyemaliza kazi kwanza?", sahihi: "yupi", makosa: ["upi", "kipi", "wepi"], ngeli: "A-WA (umoja)" },
  { before: "Miti mingi imepandwa shuleni {PLACE}. Mti", after: " uliopandwa na {NAME} mwaka jana?", sahihi: "upi", makosa: ["kipi", "ipi", "lipi"], ngeli: "U" },
  { before: "{NAME} ana macho mawili yanayouma. Jicho", after: " linaloumwa zaidi?", sahihi: "lipi", makosa: ["kipi", "upi", "yapi"], ngeli: "LI" },
  { before: "Sokoni {PLACE} kuna nguo nyingi za rangi mbalimbali. Nguo", after: " ulizozinunua {NAME}?", sahihi: "zipi", makosa: ["vipi", "ipi", "yapi"], ngeli: "N (wingi)" },
  { before: "{NAME} ana matunda mengi kikapuni. Ungependa tunda", after: " — embe au chungwa?", sahihi: "gani", makosa: ["lipi", "yapi", "kipi"], ngeli: "yoyote" },
  { before: "Duka la {PLACE} lina vitabu vya masomo mengi. Unataka kitabu", after: " cha hesabu au sayansi?", sahihi: "gani", makosa: ["kipi", "vipi", "upi"], ngeli: "yoyote" },
  { before: "{NAME} ana miti miwili ya matunda shambani {PLACE}. Mti", after: " unaozaa embe?", sahihi: "upi", makosa: ["ipi", "kipi", "lipi"], ngeli: "U" },
  { before: "Wanyama wengi wako kwenye zoo {PLACE}. {NAME} anauliza: mnyama", after: " mkubwa kuliko wote?", sahihi: "gani", makosa: ["yupi", "wepi", "ipi"], ngeli: "yoyote" },
  { before: "Vitabu viwili viko mezani kwa {NAME}. Kitabu", after: " ni chako, hiki au kile?", sahihi: "kipi", makosa: ["upi", "vipi", "lipi"], ngeli: "KI" },
  { before: "Safari mbili zimepangwa wiki hii kwa {NAME}. Safari", after: " utakayoichagua, ya {PLACE} au ya jijini?", sahihi: "zipi", makosa: ["ipi", "vipi", "yapi"], ngeli: "N (wingi)" },
  { before: "Wageni wengi walifika nyumbani kwa {NAME} {PLACE}. Ni wageni", after: " waliochelewa zaidi?", sahihi: "wepi", makosa: ["yupi", "vipi", "zipi"], ngeli: "A-WA (wingi)" },
];

export const vivumishiViulizi: Skill = {
  id: "g6-ksw-sarufi-vivumishi-viulizi",
  code: "SA.5",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Vivumishi Viulizi",
  description: "Tambua na utumie vivumishi viulizi (-pi? na gani?) kuuliza maswali kwa usahihi kutegemea ngeli ya nomino.",
  generate(rng) {
    const branch = randChoice(rng, ["fomu-sahihi", "oanisha-nomino", "panga-aina", "jaza-kiulizi", "sentensi-uwazi", "panga-sentensi"] as const);

    if (branch === "fomu-sahihi") {
      const combo = randChoice(rng, VIULIZI.filter((v) => v.aina === "-pi"));
      const distractorPool = PI_FOMU_ZOTE.filter((f) => f !== combo.fomu);
      const distractors = shuffle(rng, distractorPool).slice(0, 3);
      const choices = shuffle(rng, [combo.fomu, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `"${combo.nomino}" ni ngeli ya ${combo.ngeli}. Ni kivumishi kiulizi kipi sahihi cha "-pi?"`,
        choices,
        correctIndex: choices.indexOf(combo.fomu),
        layout: "grid",
        hint: "Kila ngeli ina kiambishi chake maalum kabla ya '-pi'.",
        explanation: `"${combo.nomino} ${combo.fomu}?" ni sahihi kwa ngeli ${combo.ngeli}.`,
      };
    }

    if (branch === "oanisha-nomino") {
      const chosen = shuffle(rng, VIULIZI.filter((v) => v.aina === "-pi")).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((v, i) => ({ id: `${v.nomino}-${i}`, label: v.nomino })));
      const targets = shuffle(rng, chosen.map((v, i) => ({ id: `${v.nomino}-${i}`, label: `${v.fomu}?` })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((v, i) => {
        correctMap[`${v.nomino}-${i}`] = `${v.nomino}-${i}`;
      });
      return {
        kind: "click-match",
        prompt: "Oanisha kila nomino na kivumishi kiulizi '-pi?' chake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Angalia ngeli ya kila nomino kuamua kiambishi cha '-pi'.",
        explanation: chosen.map((v) => `"${v.nomino} ${v.fomu}?" ni sahihi (ngeli ${v.ngeli}).`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const piChosen = shuffle(rng, VIULIZI.filter((v) => v.aina === "-pi")).slice(0, 5);
      const ganiChosen = shuffle(rng, VIULIZI.filter((v) => v.aina === "gani")).slice(0, 5);
      const chosen = [...piChosen, ...ganiChosen];
      const items = chosen.map((v, i) => ({ id: `${v.nomino}-${i}`, label: `${v.nomino} ${v.fomu}?` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((v, i) => {
        correctBucket[items[i].id] = v.aina;
      });
      return {
        kind: "categorize",
        prompt: "Panga kila swali kama linalotumia '-pi?' (hubadilika) au 'gani?' (haibadiliki).",
        items: shuffle(rng, items),
        buckets: (["-pi", "gani"] as const).map((a) => ({ id: a, label: AINA_LABEL[a] })),
        correctBucket,
        hint: "'-pi?' huchagua kati ya vitu maalum vinavyojulikana; 'gani?' huuliza kuhusu aina/sifa.",
        explanation: chosen.map((v) => `"${v.nomino} ${v.fomu}?" ni ${AINA_LABEL[v.aina]}.`).join(" "),
      };
    }

    if (branch === "jaza-kiulizi") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha swali kwa kivumishi kiulizi sahihi.",
        before: jaza(t.before, name, place),
        after: jaza(t.after, name, place),
        correctAnswer: t.sahihi,
        inputMode: "text",
        hint: t.sahihi === "gani" ? "Swali hili linauliza kuhusu aina, si kitu maalum kimoja." : `Nomino ni ya ngeli ${t.ngeli}.`,
        explanation: `Swali kamili ni: "${jaza(t.before, name, place)} ${t.sahihi}${jaza(t.after, name, place)}"`,
      };
    }

    if (branch === "sentensi-uwazi") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      const before = jaza(t.before, name, place);
      const after = jaza(t.after, name, place);
      const choices = shuffle(rng, [t.sahihi, ...t.makosa]).map((form) => `${before} ${form}${after}`);
      const correctSentensi = `${before} ${t.sahihi}${after}`;
      return {
        kind: "multiple-choice",
        prompt: "Hali hii haiko wazi — chagua swali sahihi la kuomba ufafanuzi.",
        choices,
        correctIndex: choices.indexOf(correctSentensi),
        layout: "list",
        hint: t.sahihi === "gani" ? "Unauliza kuhusu aina/sifa, si kuchagua kati ya vitu maalum." : `Nomino inayoulizwa ni ya ngeli ${t.ngeli}.`,
        explanation: `Swali sahihi ni: "${correctSentensi}"`,
      };
    }

    const t = randChoice(rng, JAZA_TEMPLATES);
    const name = randChoice(rng, MAJINA);
    const place = randChoice(rng, MAHALI);
    const kamili = jaza(`${t.before} ${t.sahihi}${t.after}`, name, place).replace(/\?$/, "");
    const words = kamili.split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda swali sahihi lenye kivumishi kiulizi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: t.sahihi === "gani" ? "'gani?' hutumika mwishoni kuhusu aina ya kitu." : `Kiulizi "${t.sahihi}?" hutumika na ngeli ${t.ngeli}.`,
      explanation: `Swali sahihi ni: "${kamili}?"`,
    };
  },
};
