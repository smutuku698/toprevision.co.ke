import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// SA.4 — Vivumishi vya Idadi (quantity adjectives): numerals 1-5 agree with noun class; 6+ and "kadhaa" are invariant;
// "chache"/"nyingi" (vague quantity) also agree with noun class.
type Aina = "kamili" | "isiyo-wazi";

interface Idadi {
  nomino: string;
  ngeli: string;
  fomu: string;
  namba: string; // e.g. "1", "5", "many"
  aina: Aina;
}

const IDADI: Idadi[] = [
  // moja (1) — singular classes
  { nomino: "Mtoto", ngeli: "A-WA", fomu: "mmoja", namba: "1", aina: "kamili" },
  { nomino: "Mti", ngeli: "U", fomu: "mmoja", namba: "1", aina: "kamili" },
  { nomino: "Kitabu", ngeli: "KI", fomu: "kimoja", namba: "1", aina: "kamili" },
  { nomino: "Tunda", ngeli: "LI", fomu: "moja", namba: "1", aina: "kamili" },
  { nomino: "Nyumba", ngeli: "N", fomu: "moja", namba: "1", aina: "kamili" },
  // wili (2) — plural classes
  { nomino: "Watoto", ngeli: "A-WA", fomu: "wawili", namba: "2", aina: "kamili" },
  { nomino: "Miti", ngeli: "I", fomu: "miwili", namba: "2", aina: "kamili" },
  { nomino: "Vitabu", ngeli: "VI", fomu: "viwili", namba: "2", aina: "kamili" },
  { nomino: "Matunda", ngeli: "YA", fomu: "mawili", namba: "2", aina: "kamili" },
  { nomino: "Nyumba", ngeli: "N", fomu: "mbili", namba: "2", aina: "kamili" },
  // tatu (3)
  { nomino: "Watoto", ngeli: "A-WA", fomu: "watatu", namba: "3", aina: "kamili" },
  { nomino: "Miti", ngeli: "I", fomu: "mitatu", namba: "3", aina: "kamili" },
  { nomino: "Vitabu", ngeli: "VI", fomu: "vitatu", namba: "3", aina: "kamili" },
  { nomino: "Matunda", ngeli: "YA", fomu: "matatu", namba: "3", aina: "kamili" },
  { nomino: "Nyumba", ngeli: "N", fomu: "tatu", namba: "3", aina: "kamili" },
  // nne (4)
  { nomino: "Watoto", ngeli: "A-WA", fomu: "wanne", namba: "4", aina: "kamili" },
  { nomino: "Miti", ngeli: "I", fomu: "minne", namba: "4", aina: "kamili" },
  { nomino: "Vitabu", ngeli: "VI", fomu: "vinne", namba: "4", aina: "kamili" },
  { nomino: "Matunda", ngeli: "YA", fomu: "manne", namba: "4", aina: "kamili" },
  { nomino: "Nyumba", ngeli: "N", fomu: "nne", namba: "4", aina: "kamili" },
  // tano (5)
  { nomino: "Watoto", ngeli: "A-WA", fomu: "watano", namba: "5", aina: "kamili" },
  { nomino: "Miti", ngeli: "I", fomu: "mitano", namba: "5", aina: "kamili" },
  { nomino: "Vitabu", ngeli: "VI", fomu: "vitano", namba: "5", aina: "kamili" },
  { nomino: "Matunda", ngeli: "YA", fomu: "matano", namba: "5", aina: "kamili" },
  { nomino: "Nyumba", ngeli: "N", fomu: "tano", namba: "5", aina: "kamili" },
  // invariant numbers (6, 7, 8, 9, 10, 20) — same form for all classes
  { nomino: "Watoto", ngeli: "A-WA", fomu: "sita", namba: "6", aina: "kamili" },
  { nomino: "Vitabu", ngeli: "VI", fomu: "sita", namba: "6", aina: "kamili" },
  { nomino: "Siku", ngeli: "N", fomu: "saba", namba: "7", aina: "kamili" },
  { nomino: "Miti", ngeli: "I", fomu: "saba", namba: "7", aina: "kamili" },
  { nomino: "Wanafunzi", ngeli: "A-WA", fomu: "nane", namba: "8", aina: "kamili" },
  { nomino: "Vitabu", ngeli: "VI", fomu: "nane", namba: "8", aina: "kamili" },
  { nomino: "Miaka", ngeli: "I", fomu: "tisa", namba: "9", aina: "kamili" },
  { nomino: "Nyumba", ngeli: "N", fomu: "tisa", namba: "9", aina: "kamili" },
  { nomino: "Wiki", ngeli: "N", fomu: "kumi", namba: "10", aina: "kamili" },
  { nomino: "Matunda", ngeli: "YA", fomu: "kumi", namba: "10", aina: "kamili" },
  { nomino: "Wanafunzi", ngeli: "A-WA", fomu: "ishirini", namba: "20", aina: "kamili" },
  { nomino: "Siku", ngeli: "N", fomu: "ishirini", namba: "20", aina: "kamili" },
  // chache (few) — class-agreeing vague quantity
  { nomino: "Watoto", ngeli: "A-WA", fomu: "wachache", namba: "chache", aina: "isiyo-wazi" },
  { nomino: "Miti", ngeli: "I", fomu: "michache", namba: "chache", aina: "isiyo-wazi" },
  { nomino: "Vitabu", ngeli: "VI", fomu: "vichache", namba: "chache", aina: "isiyo-wazi" },
  { nomino: "Matunda", ngeli: "YA", fomu: "machache", namba: "chache", aina: "isiyo-wazi" },
  { nomino: "Nyumba", ngeli: "N", fomu: "chache", namba: "chache", aina: "isiyo-wazi" },
  // nyingi (many) — class-agreeing vague quantity
  { nomino: "Watoto", ngeli: "A-WA", fomu: "wengi", namba: "nyingi", aina: "isiyo-wazi" },
  { nomino: "Miti", ngeli: "I", fomu: "mingi", namba: "nyingi", aina: "isiyo-wazi" },
  { nomino: "Vitabu", ngeli: "VI", fomu: "vingi", namba: "nyingi", aina: "isiyo-wazi" },
  { nomino: "Matunda", ngeli: "YA", fomu: "mengi", namba: "nyingi", aina: "isiyo-wazi" },
  { nomino: "Nyumba", ngeli: "N", fomu: "nyingi", namba: "nyingi", aina: "isiyo-wazi" },
  // kadhaa (several) — invariant vague quantity
  { nomino: "Vitabu", ngeli: "VI", fomu: "kadhaa", namba: "kadhaa", aina: "isiyo-wazi" },
  { nomino: "Watu", ngeli: "A-WA", fomu: "kadhaa", namba: "kadhaa", aina: "isiyo-wazi" },
];

const AINA_LABEL: Record<Aina, string> = { kamili: "Idadi Kamili (namba dhahiri)", "isiyo-wazi": "Idadi Isiyo Wazi (chache/nyingi/kadhaa)" };

const NAMBA_MAANA: { namba: string; maana: string }[] = [
  { namba: "1", maana: "moja" },
  { namba: "2", maana: "wili" },
  { namba: "3", maana: "tatu" },
  { namba: "4", maana: "nne" },
  { namba: "5", maana: "tano" },
  { namba: "6", maana: "sita" },
];

const MAJINA = ["Wanjiku", "Kamau", "Achieng", "Otieno", "Chebet", "Kiplagat", "Amina", "Hassan", "Mumbi", "Njoroge"];
const MAHALI = ["Kisumu", "Nakuru", "Machakos", "Eldoret", "Mombasa", "Nyeri", "Kitale", "Garissa", "Kericho", "Kakamega"];

function jaza(s: string, name: string, place: string): string {
  return s.replace(/\{NAME\}/g, name).replace(/\{PLACE\}/g, place);
}

interface JazaIdadi {
  before: string;
  after: string;
  sahihi: string;
  makosa: string[];
  namba: string;
  ngeli: string;
}

const JAZA_TEMPLATES: JazaIdadi[] = [
  { before: "{NAME} alinunua machungwa", after: " sokoni {PLACE} kwa ajili ya wageni.", sahihi: "matano", makosa: ["mitano", "watano", "manne"], namba: "5", ngeli: "YA" },
  { before: "Wanafunzi", after: " wa shule ya {PLACE} walishinda mashindano ya insha.", sahihi: "watatu", makosa: ["wanne", "vitatu", "mitatu"], namba: "3", ngeli: "A-WA" },
  { before: "{NAME} ana miti", after: " ya maembe nyuma ya nyumba yake {PLACE}.", sahihi: "miwili", makosa: ["wawili", "viwili", "mawili"], namba: "2", ngeli: "I" },
  { before: "Duka la {NAME} lina vitabu", after: " tu vilivyobaki {PLACE}.", sahihi: "vichache", makosa: ["wachache", "michache", "machache"], namba: "chache", ngeli: "VI" },
  { before: "Sokoni {PLACE}, kuna wafanyabiashara", after: " wanaouza mahindi.", sahihi: "wengi", makosa: ["mingi", "vingi", "mengi"], namba: "nyingi", ngeli: "A-WA" },
  { before: "Mtini kwa {NAME}, kulikuwa na tunda", after: " zuri lililoiva {PLACE}.", sahihi: "moja", makosa: ["mmoja", "kimoja", "mawili"], namba: "1", ngeli: "LI" },
  { before: "Wageni", after: " walifika nyumbani kwa {NAME} jioni hii {PLACE}.", sahihi: "kumi", makosa: ["tisa", "ishirini", "nane"], namba: "10", ngeli: "N" },
  { before: "{NAME} alisoma vitabu", after: " wiki hii shuleni {PLACE}.", sahihi: "vinne", makosa: ["wanne", "manne", "minne"], namba: "4", ngeli: "VI" },
  { before: "Kuna nyumba", after: " katika kitongoji cha {NAME} kule {PLACE}.", sahihi: "nyingi", makosa: ["wengi", "mingi", "vingi"], namba: "nyingi", ngeli: "N" },
  { before: "{NAME} alifuga ng'ombe", after: " shambani mwake {PLACE}.", sahihi: "kadhaa", makosa: ["chache", "wachache", "machache"], namba: "kadhaa", ngeli: "N" },
  { before: "Wanafunzi wa darasa la sita walifaulu mtihani; kati yao, wasichana", after: " walipata alama za juu {PLACE}.", sahihi: "watano", makosa: ["mitano", "vitano", "matano"], namba: "5", ngeli: "A-WA" },
  { before: "{NAME} alichukua siku", after: " kupumzika baada ya mtihani {PLACE}.", sahihi: "saba", makosa: ["sita", "nane", "tisa"], namba: "7", ngeli: "N" },
];

export const vivumishiVyaIdadi: Skill = {
  id: "g6-ksw-sarufi-vivumishi-vya-idadi",
  code: "SA.4",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Vivumishi vya Idadi",
  description: "Tambua na utumie vivumishi vya idadi (moja, ishirini, chache, nyingi n.k.) kutaja idadi ya vitu kwa upatanisho sahihi wa kisarufi.",
  generate(rng) {
    const branch = randChoice(rng, ["fomu-sahihi", "oanisha-namba", "panga-aina", "jaza-idadi", "sentensi-ununuzi", "panga-sentensi"] as const);

    if (branch === "fomu-sahihi") {
      const combo = randChoice(rng, IDADI);
      const sameNamba = Array.from(new Set(IDADI.filter((i) => i.namba === combo.namba && i.fomu !== combo.fomu).map((i) => i.fomu)));
      let distractors = shuffle(rng, sameNamba).slice(0, 3);
      if (distractors.length < 3) {
        const otherNamba = shuffle(rng, IDADI.filter((i) => i.namba !== combo.namba && i.fomu !== combo.fomu).map((i) => i.fomu));
        distractors = Array.from(new Set([...distractors, ...otherNamba])).slice(0, 3);
      }
      const choices = shuffle(rng, [combo.fomu, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `"${combo.nomino}" ni ngeli ya ${combo.ngeli}. Ni kivumishi cha idadi kipi sahihi kuonyesha "${combo.namba}"?`,
        choices,
        correctIndex: choices.indexOf(combo.fomu),
        layout: "grid",
        hint: ["1", "2", "3", "4", "5"].includes(combo.namba) || ["chache", "nyingi"].includes(combo.namba)
          ? "Namba/idadi hii hubadilika kutegemea ngeli ya nomino."
          : "Namba hii haibadiliki — hubaki fomu ile ile katika ngeli zote.",
        explanation: `"${combo.nomino} ${combo.fomu}" ni sahihi kwa ngeli ${combo.ngeli}.`,
      };
    }

    if (branch === "oanisha-namba") {
      const chosen = shuffle(rng, NAMBA_MAANA).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((n) => ({ id: n.namba, label: n.namba })));
      const targets = shuffle(rng, chosen.map((n) => ({ id: n.namba, label: n.maana })));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.namba] = n.namba;
      return {
        kind: "click-match",
        prompt: "Oanisha kila tarakimu na neno lake sahihi la Kiswahili.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi tarakimu za 1-6 zinavyotamkwa kwa Kiswahili.",
        explanation: chosen.map((n) => `"${n.namba}" ni "${n.maana}".`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const kamili = shuffle(rng, IDADI.filter((i) => i.aina === "kamili")).slice(0, 5);
      const isiyoWazi = shuffle(rng, IDADI.filter((i) => i.aina === "isiyo-wazi")).slice(0, 5);
      const chosen = [...kamili, ...isiyoWazi];
      const items = chosen.map((i) => ({ id: `${i.nomino}-${i.fomu}-${i.namba}`, label: `${i.nomino} ${i.fomu}` }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((i, idx) => {
        correctBucket[items[idx].id] = i.aina;
      });
      return {
        kind: "categorize",
        prompt: "Panga kila kifungu kama Idadi Kamili (namba dhahiri) au Idadi Isiyo Wazi (chache/nyingi/kadhaa).",
        items: shuffle(rng, items),
        buckets: (["kamili", "isiyo-wazi"] as const).map((a) => ({ id: a, label: AINA_LABEL[a] })),
        correctBucket,
        hint: "Idadi kamili hutaja namba dhahiri; idadi isiyo wazi haitaji namba kamili.",
        explanation: chosen.map((i) => `"${i.nomino} ${i.fomu}" ni ${AINA_LABEL[i.aina]}.`).join(" "),
      };
    }

    if (branch === "jaza-idadi") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kivumishi cha idadi sahihi.",
        before: jaza(t.before, name, place),
        after: jaza(t.after, name, place),
        correctAnswer: t.sahihi,
        inputMode: "text",
        hint: `Nomino ni ya ngeli ${t.ngeli}, na idadi inayotajwa ni "${t.namba}".`,
        explanation: `Sentensi kamili ni: "${jaza(t.before, name, place)} ${t.sahihi}${jaza(t.after, name, place)}"`,
      };
    }

    if (branch === "sentensi-ununuzi") {
      const t = randChoice(rng, JAZA_TEMPLATES);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAHALI);
      const before = jaza(t.before, name, place);
      const after = jaza(t.after, name, place);
      const choices = shuffle(rng, [t.sahihi, ...t.makosa]).map((form) => `${before} ${form}${after}`);
      const correctSentensi = `${before} ${t.sahihi}${after}`;
      return {
        kind: "multiple-choice",
        prompt: "Chagua sentensi yenye idadi sahihi kuhusiana na muktadha wa ununuzi/uhesabuji.",
        choices,
        correctIndex: choices.indexOf(correctSentensi),
        layout: "list",
        hint: `Nomino inayohesabiwa ni ya ngeli ${t.ngeli}.`,
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
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye kivumishi cha idadi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Idadi "${t.namba}" hutumika na ngeli ${t.ngeli}.`,
      explanation: `Sentensi sahihi ni: "${kamili}."`,
    };
  },
};
