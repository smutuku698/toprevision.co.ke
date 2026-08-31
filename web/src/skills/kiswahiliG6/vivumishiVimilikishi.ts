import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// SA.3 — Vivumishi Vimilikishi (possessive adjectives): -angu/-ako/-ake/-etu/-enu/-ao across noun classes.
interface Nafsi {
  stem: string;
  nafsi: string;
}

const NAFSI: Nafsi[] = [
  { stem: "angu", nafsi: "mimi (nafsi ya kwanza umoja)" },
  { stem: "ako", nafsi: "wewe (nafsi ya pili umoja)" },
  { stem: "ake", nafsi: "yeye (nafsi ya tatu umoja)" },
  { stem: "etu", nafsi: "sisi (nafsi ya kwanza wingi)" },
  { stem: "enu", nafsi: "nyinyi (nafsi ya pili wingi)" },
  { stem: "ao", nafsi: "wao (nafsi ya tatu wingi)" },
];

interface Ngeli {
  ngeli: string;
  kiambishi: string;
  nomino: string;
}

const NGELI_LIST: Ngeli[] = [
  { ngeli: "A-WA (umoja)", kiambishi: "w", nomino: "Mtoto" },
  { ngeli: "A-WA (wingi)", kiambishi: "w", nomino: "Watoto" },
  { ngeli: "U (umoja)", kiambishi: "w", nomino: "Mti" },
  { ngeli: "I (wingi)", kiambishi: "y", nomino: "Miti" },
  { ngeli: "KI (umoja)", kiambishi: "ch", nomino: "Kitabu" },
  { ngeli: "VI (wingi)", kiambishi: "vy", nomino: "Vitabu" },
  { ngeli: "LI (umoja)", kiambishi: "l", nomino: "Tunda" },
  { ngeli: "YA (wingi)", kiambishi: "y", nomino: "Matunda" },
  { ngeli: "N (umoja)", kiambishi: "y", nomino: "Nyumba" },
  { ngeli: "N (wingi)", kiambishi: "z", nomino: "Nguo" },
];

interface Mchanganyiko {
  nomino: string;
  ngeli: string;
  nafsi: string;
  fomu: string; // full possessive form, e.g. "changu"
}

const MICHANGANYIKO: Mchanganyiko[] = NGELI_LIST.flatMap((n) =>
  NAFSI.map((p) => ({ nomino: n.nomino, ngeli: n.ngeli, nafsi: p.nafsi, fomu: `${n.kiambishi}${p.stem}` }))
);

const MAJINA = ["Wanjiku", "Kamau", "Achieng", "Otieno", "Chebet", "Kiplagat", "Amina", "Hassan", "Mumbi", "Njoroge"];
const MAHALI = ["Kisumu", "Nakuru", "Machakos", "Eldoret", "Mombasa", "Nyeri", "Kitale", "Garissa", "Kericho", "Kakamega"];

function jaza(s: string, name: string, place: string): string {
  return s.replace(/\{NAME\}/g, name).replace(/\{PLACE\}/g, place);
}

interface JazaMilikishi {
  before: string; // ends right at the noun-class prefix, e.g. "Kitabu ch"
  after: string;
  sahihi: string; // stem only, e.g. "angu"
  makosa: string[]; // stems or full wrong-prefix forms
  ngeli: string;
  nafsi: string;
}

// before ends without a space so before+sahihi forms one word (e.g. "Kitabu ch"+"angu" = "Kitabu changu")
const JAZA_TEMPLATES: JazaMilikishi[] = [
  { before: "{NAME} ni rafiki wangu. Kitabu ch", after: " kiko mfukoni mwake.", sahihi: "ake", makosa: ["ako", "etu", "ao"], ngeli: "KI (umoja)", nafsi: "yeye" },
  { before: "Huyu ni mtoto w", after: " — nilimzaa mwenyewe kule {PLACE}.", sahihi: "angu", makosa: ["ako", "wenu", "yangu"], ngeli: "A-WA (umoja)", nafsi: "mimi" },
  { before: "{NAME} na mimi tulipanda miti hii. Miti y", after: " inakua vizuri {PLACE}.", sahihi: "etu", makosa: ["yako", "yao", "wetu"], ngeli: "I (wingi)", nafsi: "sisi" },
  { before: "{NAME}, hivi ni vitabu vy", after: " ulivyoviacha darasani.", sahihi: "ako", makosa: ["vyangu", "vyao", "wako"], ngeli: "VI (wingi)", nafsi: "wewe" },
  { before: "Wanafunzi wa {PLACE} walileta tunda l", after: " shuleni kwa ajili ya sherehe.", sahihi: "ao", makosa: ["langu", "letu", "yao"], ngeli: "LI (umoja)", nafsi: "wao" },
  { before: "Watoto, hebu kuseni matunda y", after: " mliyoyavuna leo {PLACE}.", sahihi: "enu", makosa: ["yangu", "yao", "chenu"], ngeli: "YA (wingi)", nafsi: "nyinyi" },
  { before: "{NAME} anaishi karibu nasi. Nyumba y", after: " iko {PLACE}.", sahihi: "ake", makosa: ["yangu", "yetu", "chake"], ngeli: "N (umoja)", nafsi: "yeye" },
  { before: "Nguo z", after: " zilianikwa jua na mimi asubuhi {PLACE}.", sahihi: "angu", makosa: ["zako", "zetu", "yangu"], ngeli: "N (wingi)", nafsi: "mimi" },
  { before: "{NAME}, mti w", after: " uliopandwa na wewe umekua sana.", sahihi: "ako", makosa: ["wangu", "wetu", "yako"], ngeli: "U (umoja)", nafsi: "wewe" },
  { before: "Watoto w", after: " wa {PLACE} wamefaulu mtihani.", sahihi: "etu", makosa: ["wangu", "wako", "yetu"], ngeli: "A-WA (wingi)", nafsi: "sisi" },
  { before: "Wanafunzi wale wana vitabu vy", after: " mkobani.", sahihi: "ao", makosa: ["vyangu", "vyetu", "wao"], ngeli: "VI (wingi)", nafsi: "wao" },
  { before: "Walimu, kitabu ch", after: " kiko mezani {PLACE}.", sahihi: "enu", makosa: ["changu", "chao", "wenu"], ngeli: "KI (umoja)", nafsi: "nyinyi" },
];

export const vivumishiVimilikishi: Skill = {
  id: "g6-ksw-sarufi-vivumishi-vimilikishi",
  code: "SA.3",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Vivumishi Vimilikishi",
  description: "Tambua na utumie vivumishi vimilikishi (-angu, -ako, -ake, -etu, -enu, -ao) kuonyesha umiliki kutegemea ngeli ya nomino na mtu anayemiliki.",
  generate(rng) {
    const branch = randChoice(rng, ["fomu-sahihi", "oanisha-nafsi", "panga-mmiliki", "jaza-milikishi", "sentensi-umiliki", "panga-sentensi"] as const);

    if (branch === "fomu-sahihi") {
      const combo = randChoice(rng, MICHANGANYIKO);
      const sawaNgeli = shuffle(rng, MICHANGANYIKO.filter((m) => m.ngeli === combo.ngeli && m.fomu !== combo.fomu)).slice(0, 2);
      const wrongClass = randChoice(rng, MICHANGANYIKO.filter((m) => m.ngeli !== combo.ngeli && m.nafsi === combo.nafsi && m.fomu !== combo.fomu));
      const distractors = Array.from(new Set([...sawaNgeli.map((m) => m.fomu), wrongClass.fomu])).slice(0, 3);
      const choices = shuffle(rng, [combo.fomu, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `"${combo.nomino}" (ngeli ${combo.ngeli}) ni mali ya "${combo.nafsi.split(" (")[0]}". Ni kivumishi kimilikishi kipi sahihi?`,
        choices,
        correctIndex: choices.indexOf(combo.fomu),
        layout: "grid",
        hint: `Nafsi "${combo.nafsi}" hutumia mzizi tofauti na kiambishi cha ngeli ya nomino huchanganyika nao.`,
        explanation: `"${combo.nomino} ${combo.fomu}" ni sahihi: ngeli ${combo.ngeli} + nafsi ya "${combo.nafsi.split(" (")[0]}".`,
      };
    }

    if (branch === "oanisha-nafsi") {
      const ngeli = randChoice(rng, NGELI_LIST);
      const chosen = shuffle(rng, NAFSI).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p) => ({ id: p.stem, label: p.nafsi.split(" (")[0] })));
      const targets = shuffle(rng, chosen.map((p) => ({ id: p.stem, label: `${ngeli.kiambishi}${p.stem}` })));
      const correctMap: Record<string, string> = {};
      for (const p of chosen) correctMap[p.stem] = p.stem;
      return {
        kind: "click-match",
        prompt: `Oanisha kila nafsi na kivumishi kimilikishi chake sahihi kwa "${ngeli.nomino}" (ngeli ${ngeli.ngeli}).`,
        tokens,
        targets,
        correctMap,
        hint: "Kila nafsi (mimi/wewe/yeye/sisi/nyinyi/wao) ina mzizi wake maalum.",
        explanation: chosen.map((p) => `"${ngeli.nomino} ${ngeli.kiambishi}${p.stem}" ni ya "${p.nafsi.split(" (")[0]}".`).join(" "),
      };
    }

    if (branch === "panga-mmiliki") {
      const chosenNafsi = shuffle(rng, NAFSI).slice(0, 5);
      const items = chosenNafsi.map((p) => {
        const ngeli = randChoice(rng, NGELI_LIST);
        return { id: `${ngeli.nomino}-${p.stem}`, label: `${ngeli.nomino} ${ngeli.kiambishi}${p.stem}`, bucket: p.stem };
      });
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kifungu cha umilikishi kulingana na nafsi (mmiliki) inayoonyeshwa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: chosenNafsi.map((p) => ({ id: p.stem, label: p.nafsi.split(" (")[0] })),
        correctBucket,
        hint: "Angalia mzizi wa mwisho wa kivumishi kimilikishi (angu/ako/ake/etu/enu/ao).",
        explanation: items.map((i) => `"${i.label}" ni ya "${NAFSI.find((p) => p.stem === i.bucket)?.nafsi.split(" (")[0]}".`).join(" "),
      };
    }

    if (branch === "jaza-milikishi") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha neno na sentensi kwa mzizi sahihi wa kivumishi kimilikishi.",
        before: jaza(t.before, name, place),
        after: jaza(t.after, name, place),
        correctAnswer: t.sahihi,
        inputMode: "text",
        hint: `Nomino ni ya ngeli ${t.ngeli}, na mmiliki ni "${t.nafsi}".`,
        explanation: `Neno kamili ni "${jaza(t.before, name, place)}${t.sahihi}" — sentensi: "${jaza(t.before, name, place)}${t.sahihi}${jaza(t.after, name, place)}"`,
      };
    }

    if (branch === "sentensi-umiliki") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      const before = jaza(t.before, name, place);
      const after = jaza(t.after, name, place);
      const choices = shuffle(rng, [t.sahihi, ...t.makosa]).map((stem) => `${before}${stem}${after}`);
      const correctSentensi = `${before}${t.sahihi}${after}`;
      return {
        kind: "multiple-choice",
        prompt: `Chagua sentensi sahihi inayoonyesha kuwa kitu ni mali ya "${t.nafsi}".`,
        choices,
        correctIndex: choices.indexOf(correctSentensi),
        layout: "list",
        hint: `Nomino ni ya ngeli ${t.ngeli} — kila ngeli ina kiambishi chake tofauti.`,
        explanation: `Sentensi sahihi ni: "${correctSentensi}"`,
      };
    }

    const t = randChoice(rng, JAZA_TEMPLATES);
    const name = randChoice(rng, MAJINA);
    const place = randChoice(rng, MAHALI);
    const kamili = jaza(`${t.before}${t.sahihi}${t.after}`, name, place).replace(/\.$/, "");
    const words = kamili.split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye kivumishi kimilikishi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Nomino ya kwanza ni ya ngeli ${t.ngeli}; mmiliki ni "${t.nafsi}".`,
      explanation: `Sentensi sahihi ni: "${kamili}."`,
    };
  },
};
