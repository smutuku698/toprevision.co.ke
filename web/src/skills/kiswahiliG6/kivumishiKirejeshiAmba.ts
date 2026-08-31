import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// SA.6 — Kivumishi Kirejeshi (amba-): relative-clause marker agreeing with noun class.
// Source note: the design PDF's own "Mpangilio wa Mada" table mislabels sub-mada 2.4.3 "Kivumishi Kielezi",
// but the actual page content is entirely about the relative kivumishi amba- (ambaye/ambao/ambacho/ambalo n.k.) —
// trusting the page content over the table label per the source's own resolved inconsistency note.
interface Amba {
  nomino: string;
  ngeli: string;
  fomu: string;
}

const AMBA: Amba[] = [
  { nomino: "Mgeni", ngeli: "A-WA (umoja)", fomu: "ambaye" },
  { nomino: "Mwalimu", ngeli: "A-WA (umoja)", fomu: "ambaye" },
  { nomino: "Rafiki", ngeli: "A-WA (umoja)", fomu: "ambaye" },
  { nomino: "Mwizi", ngeli: "A-WA (umoja)", fomu: "ambaye" },
  { nomino: "Wageni", ngeli: "A-WA (wingi)", fomu: "ambao" },
  { nomino: "Walimu", ngeli: "A-WA (wingi)", fomu: "ambao" },
  { nomino: "Marafiki", ngeli: "A-WA (wingi)", fomu: "ambao" },
  { nomino: "Mlango", ngeli: "U (umoja)", fomu: "ambao" },
  { nomino: "Mti", ngeli: "U (umoja)", fomu: "ambao" },
  { nomino: "Mkate", ngeli: "U (umoja)", fomu: "ambao" },
  { nomino: "Milango", ngeli: "I (wingi)", fomu: "ambayo" },
  { nomino: "Miti", ngeli: "I (wingi)", fomu: "ambayo" },
  { nomino: "Mikono", ngeli: "I (wingi)", fomu: "ambayo" },
  { nomino: "Kiatu", ngeli: "KI (umoja)", fomu: "ambacho" },
  { nomino: "Kitabu", ngeli: "KI (umoja)", fomu: "ambacho" },
  { nomino: "Kiti", ngeli: "KI (umoja)", fomu: "ambacho" },
  { nomino: "Kikombe", ngeli: "KI (umoja)", fomu: "ambacho" },
  { nomino: "Viatu", ngeli: "VI (wingi)", fomu: "ambavyo" },
  { nomino: "Vitabu", ngeli: "VI (wingi)", fomu: "ambavyo" },
  { nomino: "Viti", ngeli: "VI (wingi)", fomu: "ambavyo" },
  { nomino: "Tunda", ngeli: "LI (umoja)", fomu: "ambalo" },
  { nomino: "Gari", ngeli: "LI (umoja)", fomu: "ambalo" },
  { nomino: "Jicho", ngeli: "LI (umoja)", fomu: "ambalo" },
  { nomino: "Matunda", ngeli: "YA (wingi)", fomu: "ambayo" },
  { nomino: "Magari", ngeli: "YA (wingi)", fomu: "ambayo" },
  { nomino: "Macho", ngeli: "YA (wingi)", fomu: "ambayo" },
  { nomino: "Nyumba", ngeli: "N (umoja)", fomu: "ambayo" },
  { nomino: "Safari", ngeli: "N (umoja)", fomu: "ambayo" },
  { nomino: "Barabara", ngeli: "N (umoja)", fomu: "ambayo" },
  { nomino: "Nguo", ngeli: "N (wingi)", fomu: "ambazo" },
  { nomino: "Ndizi", ngeli: "N (wingi)", fomu: "ambazo" },
  { nomino: "Kalamu", ngeli: "N (wingi)", fomu: "ambazo" },
  { nomino: "Sahani", ngeli: "N (wingi)", fomu: "ambazo" },
];

const FOMU_ZOTE = ["ambaye", "ambao", "ambayo", "ambalo", "ambacho", "ambavyo", "ambazo"];

const MAJINA = ["Wanjiku", "Kamau", "Achieng", "Otieno", "Chebet", "Kiplagat", "Amina", "Hassan", "Mumbi", "Njoroge"];
const MAHALI = ["Kisumu", "Nakuru", "Machakos", "Eldoret", "Mombasa", "Nyeri", "Kitale", "Garissa", "Kericho", "Kakamega"];

function jaza(s: string, name: string, place: string): string {
  return s.replace(/\{NAME\}/g, name).replace(/\{PLACE\}/g, place);
}

interface JazaAmba {
  before: string;
  after: string;
  sahihi: string;
  makosa: string[];
  ngeli: string;
}

const JAZA_TEMPLATES: JazaAmba[] = [
  { before: "{NAME} anamjua mgeni", after: " aliyefika jana {PLACE}.", sahihi: "ambaye", makosa: ["ambao", "ambacho", "ambayo"], ngeli: "A-WA (umoja)" },
  { before: "Mlango", after: " uko mlangoni mwa nyumba ya {NAME} umefunguliwa {PLACE}.", sahihi: "ambao", makosa: ["ambaye", "ambavyo", "ambazo"], ngeli: "U (umoja)" },
  { before: "{NAME} alinunua kiatu", after: " kilikuwa ghali sokoni {PLACE}.", sahihi: "ambacho", makosa: ["ambao", "ambalo", "ambavyo"], ngeli: "KI (umoja)" },
  { before: "Tunda", after: " liliiva kwanza lilichukuliwa na {NAME} {PLACE}.", sahihi: "ambalo", makosa: ["ambayo", "ambao", "ambacho"], ngeli: "LI (umoja)" },
  { before: "Vitabu", after: " vilisomwa na wanafunzi wa {PLACE} vilikuwa vizuri.", sahihi: "ambavyo", makosa: ["ambacho", "ambazo", "ambayo"], ngeli: "VI (wingi)" },
  { before: "Miti", after: " ilipandwa na {NAME} shuleni imekua sana {PLACE}.", sahihi: "ambayo", makosa: ["ambao", "ambazo", "ambalo"], ngeli: "I (wingi)" },
  { before: "Nyumba ya {NAME}", after: " iko karibu na shule ilijengwa mwaka huu {PLACE}.", sahihi: "ambayo", makosa: ["ambao", "ambazo", "ambaye"], ngeli: "N (umoja)" },
  { before: "Nguo", after: " zilinunuliwa na {NAME} ni nzuri sana {PLACE}.", sahihi: "ambazo", makosa: ["ambavyo", "ambayo", "ambao"], ngeli: "N (wingi)" },
  { before: "Wageni", after: " walifika kwa {NAME} jana ni wa {PLACE}.", sahihi: "ambao", makosa: ["ambaye", "ambavyo", "ambazo"], ngeli: "A-WA (wingi)" },
  { before: "Matunda", after: " yaliuzwa na {NAME} sokoni {PLACE} yalikuwa mabichi.", sahihi: "ambayo", makosa: ["ambalo", "ambao", "ambavyo"], ngeli: "YA (wingi)" },
  { before: "{NAME} ana kikombe", after: " alichokipata zawadi {PLACE}.", sahihi: "ambacho", makosa: ["ambavyo", "ambao", "ambalo"], ngeli: "KI (umoja)" },
  { before: "Sahani", after: " zilizotumika karamuni ya {NAME} zilioshwa {PLACE}.", sahihi: "ambazo", makosa: ["ambavyo", "ambayo", "ambao"], ngeli: "N (wingi)" },
];

interface Unganisho {
  sentensi1: string;
  sentensi2: string;
  kamili: string;
  ngeli: string;
}

const MIUNGANO: Unganisho[] = [
  { sentensi1: "Mtu yule alikuja shuleni.", sentensi2: "Mtu yule ni mwalimu wetu.", kamili: "Mtu ambaye alikuja shuleni ni mwalimu wetu", ngeli: "A-WA (umoja)" },
  { sentensi1: "Mlango ule uliharibika jana.", sentensi2: "Mlango ule ni wa darasa letu.", kamili: "Mlango ambao uliharibika jana ni wa darasa letu", ngeli: "U (umoja)" },
  { sentensi1: "Kitabu kile kilipotea wiki iliyopita.", sentensi2: "Kitabu kile ni cha {NAME}.", kamili: "Kitabu ambacho kilipotea wiki iliyopita ni cha {NAME}", ngeli: "KI (umoja)" },
  { sentensi1: "Tunda lile liliiva kwanza mtini.", sentensi2: "Tunda lile lilikuwa tamu sana.", kamili: "Tunda ambalo liliiva kwanza mtini lilikuwa tamu sana", ngeli: "LI (umoja)" },
  { sentensi1: "Vitabu vile vilinunuliwa jana.", sentensi2: "Vitabu vile ni vipya.", kamili: "Vitabu ambavyo vilinunuliwa jana ni vipya", ngeli: "VI (wingi)" },
  { sentensi1: "Miti ile ilipandwa mwaka jana.", sentensi2: "Miti ile imekua sana.", kamili: "Miti ambayo ilipandwa mwaka jana imekua sana", ngeli: "I (wingi)" },
  { sentensi1: "Nyumba ile iliungua moto.", sentensi2: "Nyumba ile ilikuwa ya {NAME}.", kamili: "Nyumba ambayo iliungua moto ilikuwa ya {NAME}", ngeli: "N (umoja)" },
  { sentensi1: "Nguo zile zilioshwa asubuhi.", sentensi2: "Nguo zile bado ni chafu.", kamili: "Nguo ambazo zilioshwa asubuhi bado ni chafu", ngeli: "N (wingi)" },
  { sentensi1: "Watoto wale walicheza uwanjani {PLACE}.", sentensi2: "Watoto wale ni wa {PLACE}.", kamili: "Watoto ambao walicheza uwanjani {PLACE} ni wa {PLACE}", ngeli: "A-WA (wingi)" },
  { sentensi1: "Matunda yale yaliiva mapema.", sentensi2: "Matunda yale yaliliwa haraka.", kamili: "Matunda ambayo yaliiva mapema yaliliwa haraka", ngeli: "YA (wingi)" },
];

export const kivumishiKirejeshiAmba: Skill = {
  id: "g6-ksw-sarufi-kivumishi-kirejeshi-amba",
  code: "SA.6",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Kivumishi Kirejeshi (amba-)",
  description: "Tambua na utumie kivumishi kirejeshi amba- (ambaye, ambao, ambacho, ambalo n.k.) kuunganisha vishazi kwa upatanisho sahihi wa kisarufi.",
  generate(rng) {
    const branch = randChoice(rng, ["fomu-sahihi", "oanisha-ngeli", "panga-fomu", "jaza-amba", "unganisha-sentensi"] as const);

    if (branch === "fomu-sahihi") {
      const combo = randChoice(rng, AMBA);
      const distractors = shuffle(rng, FOMU_ZOTE.filter((f) => f !== combo.fomu)).slice(0, 3);
      const choices = shuffle(rng, [combo.fomu, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `"${combo.nomino}" ni ngeli ya ${combo.ngeli}. Ni kivumishi kirejeshi kipi sahihi cha "amba-"?`,
        choices,
        correctIndex: choices.indexOf(combo.fomu),
        layout: "grid",
        hint: "Kila ngeli ina kiambishi chake maalum baada ya 'amba-'.",
        explanation: `"${combo.nomino} ${combo.fomu}" ni sahihi kwa ngeli ${combo.ngeli}.`,
      };
    }

    if (branch === "oanisha-ngeli") {
      const ngeliZote = Array.from(new Set(AMBA.map((a) => a.ngeli)));
      const chosen = shuffle(rng, ngeliZote).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((n) => ({ id: n, label: n })));
      const targets = shuffle(rng, chosen.map((n) => ({ id: n, label: AMBA.find((a) => a.ngeli === n)!.fomu })));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n] = n;
      return {
        kind: "click-match",
        prompt: "Oanisha kila ngeli na kivumishi kirejeshi 'amba-' chake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Angalia kiambishi kinachoambatana na 'amba-' kwa kila ngeli.",
        explanation: chosen.map((n) => `Ngeli ${n} hutumia "${AMBA.find((a) => a.ngeli === n)!.fomu}".`).join(" "),
      };
    }

    if (branch === "panga-fomu") {
      const chosen = FOMU_ZOTE.flatMap((f) => shuffle(rng, AMBA.filter((a) => a.fomu === f)).slice(0, 2));
      const items = chosen.map((a, i) => ({ id: `${a.nomino}-${i}`, label: a.nomino }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => {
        correctBucket[items[i].id] = a.fomu;
      });
      return {
        kind: "categorize",
        prompt: "Panga kila nomino kulingana na fomu sahihi ya 'amba-' inayoihusu.",
        items: shuffle(rng, items),
        buckets: FOMU_ZOTE.map((f) => ({ id: f, label: f })),
        correctBucket,
        hint: "Fikiria ngeli ya kila nomino kabla ya kuamua fomu ya 'amba-'.",
        explanation: chosen.map((a) => `"${a.nomino}" hutumia "${a.fomu}" (ngeli ${a.ngeli}).`).join(" "),
      };
    }

    if (branch === "jaza-amba") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kivumishi kirejeshi 'amba-' sahihi.",
        before: jaza(t.before, name, place),
        after: jaza(t.after, name, place),
        correctAnswer: t.sahihi,
        inputMode: "text",
        hint: `Nomino inayotangulia ni ya ngeli ${t.ngeli}.`,
        explanation: `Sentensi kamili ni: "${jaza(t.before, name, place)} ${t.sahihi}${jaza(t.after, name, place)}"`,
      };
    }

    const m = randChoice(rng, MIUNGANO);
    const name = randChoice(rng, MAJINA);
    const place = randChoice(rng, MAHALI);
    const kamili = jaza(m.kamili, name, place);
    const s1 = jaza(m.sentensi1, name, place);
    const s2 = jaza(m.sentensi2, name, place);
    const words = kamili.split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: `Unganisha sentensi hizi mbili kuwa moja ukitumia 'amba-': "${s1}" na "${s2}". Panga maneno ya sentensi mpya kwa mpangilio sahihi.`,
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Nomino inayorudiwa ni ya ngeli ${m.ngeli}.`,
      explanation: `Sentensi iliyounganishwa sahihi ni: "${kamili}."`,
    };
  },
};
