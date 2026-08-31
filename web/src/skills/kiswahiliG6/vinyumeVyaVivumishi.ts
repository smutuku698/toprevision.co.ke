import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;
const KENYAN_PLACES = [
  "Kisumu", "Nakuru", "Machakos", "Kericho", "Nyeri", "Kitale", "Malindi",
  "Garissa", "Meru", "Bungoma", "Kakamega", "Naivasha", "Voi", "Kilifi",
] as const;

const JOZI: { a: string; b: string; kikundi: string }[] = [
  { a: "zuri", b: "baya", kikundi: "tabia/hali" },
  { a: "kali", b: "butu", kikundi: "umbo" },
  { a: "refu", b: "fupi", kikundi: "umbo" },
  { a: "kubwa", b: "dogo", kikundi: "umbo" },
  { a: "zito", b: "epesi", kikundi: "uzito" },
  { a: "gumu", b: "laini", kikundi: "umbo" },
  { a: "pana", b: "nyembamba", kikundi: "umbo" },
  { a: "changa", b: "kongwe", kikundi: "umri" },
  { a: "safi", b: "chafu", kikundi: "usafi" },
  { a: "tamu", b: "chungu", kikundi: "ladha" },
  { a: "pya", b: "kuukuu", kikundi: "umri" },
  { a: "nene", b: "konda", kikundi: "uzito" },
  { a: "tajiri", b: "maskini", kikundi: "hali ya kiuchumi" },
  { a: "shupavu", b: "mwoga", kikundi: "tabia/hali" },
  { a: "haraka", b: "polepole", kikundi: "kasi" },
];

function pairText(kikundi: string): string {
  return `kikundi cha ${kikundi}`;
}

export const vinyumeVyaVivumishi: Skill = {
  id: "g6-ksw-sarufi-vinyume-vya-vivumishi",
  code: "SA.16",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Vinyume vya Vivumishi",
  description: "Tambua na utumie vinyume vya vivumishi (mfano: zuri-baya, kali-butu, refu-fupi) katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-kinyume", "oanisha-jozi", "panga-kikundi", "jaza-linganisho", "senario-linganisha"] as const);

    if (branch === "chagua-kinyume") {
      const jozi = randChoice(rng, JOZI);
      const upande = randChoice(rng, ["a", "b"] as const);
      const neno = upande === "a" ? jozi.a : jozi.b;
      const sahihi = upande === "a" ? jozi.b : jozi.a;
      const makosaChanzo = shuffle(
        rng,
        JOZI.filter((j) => j !== jozi).flatMap((j) => [j.a, j.b])
      ).slice(0, 3);
      const choices = shuffle(rng, [sahihi, ...makosaChanzo]);
      return {
        kind: "multiple-choice",
        prompt: `Ni kivumishi kipi ambacho ni kinyume cha "${neno}"?`,
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "row",
        hint: `Fikiria ${pairText(jozi.kikundi)} — kivumishi hiki na kinyume chake vinaelezea pande mbili tofauti za jambo moja.`,
        explanation: `Kinyume cha "${neno}" ni "${sahihi}".`,
      };
    }

    if (branch === "oanisha-jozi") {
      const chosen = shuffle(rng, JOZI).slice(0, 6);
      const tokens = chosen.map((j) => ({ id: j.a, label: j.a }));
      const targets = shuffle(rng, chosen).map((j) => ({ id: j.a, label: j.b }));
      const correctMap: Record<string, string> = {};
      for (const j of chosen) correctMap[j.a] = j.a;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kivumishi na kinyume chake.",
        tokens,
        targets,
        correctMap,
        hint: "Kila jozi inaelezea pande mbili zinazopingana za sifa moja.",
        explanation: chosen.map((j) => `Kinyume cha "${j.a}" ni "${j.b}".`).join(" "),
      };
    }

    if (branch === "panga-kikundi") {
      const vikundiVilivyochaguliwa = shuffle(rng, Array.from(new Set(JOZI.map((j) => j.kikundi)))).slice(0, 3);
      const items = vikundiVilivyochaguliwa.flatMap((kikundi) => {
        const jozi = randChoice(rng, JOZI.filter((j) => j.kikundi === kikundi));
        const upande = randChoice(rng, ["a", "b"] as const);
        return [{ id: `${jozi.a}-${jozi.b}`, label: upande === "a" ? jozi.a : jozi.b, bucket: kikundi }];
      });
      const ziada = shuffle(rng, JOZI.filter((j) => !vikundiVilivyochaguliwa.includes(j.kikundi))).slice(0, 3);
      for (const jozi of ziada) items.push({ id: `${jozi.a}-${jozi.b}`, label: jozi.a, bucket: jozi.kikundi });
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      const buckets = Array.from(new Set(items.map((i) => i.bucket))).map((b) => ({ id: b, label: b }));
      return {
        kind: "categorize",
        prompt: "Panga vivumishi hivi kulingana na kikundi cha sifa kinachoelezea.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets,
        correctBucket,
        hint: "Fikiria ni nini hasa kila kivumishi kinachoelezea kuhusu kitu au mtu.",
        explanation: "Kila kivumishi kimewekwa katika kikundi kinachoelezea aina ya sifa inayohusika.",
      };
    }

    if (branch === "jaza-linganisho") {
      const jozi = randChoice(rng, JOZI);
      const jina1 = randChoice(rng, KENYAN_NAMES);
      const jina2 = randChoice(rng, KENYAN_NAMES.filter((n) => n !== jina1));
      const mahali = randChoice(rng, KENYAN_PLACES);
      const upande = randChoice(rng, ["a", "b"] as const);
      const neno1 = upande === "a" ? jozi.a : jozi.b;
      const neno2 = upande === "a" ? jozi.b : jozi.a;
      const TEMPLATES = [
        { before: `Huko ${mahali}, kiatu cha ${jina1} ni ${neno1}, lakini cha ${jina2} ni `, after: "." },
        { before: `${jina1} ana nyumba ${neno1}, ilhali ${jina2} wa ${mahali} ana nyumba `, after: "." },
        { before: `Katika duka la ${mahali}, tunda hili ni ${neno1} lakini lile ni `, after: "." },
        { before: `${jina1} alisema chai yake ni ${neno1}, lakini ya ${jina2} ni `, after: "." },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa kinyume cha kivumishi kilichotumika mwanzoni.",
        before: t.before,
        after: t.after,
        correctAnswer: neno2,
        inputMode: "text",
        hint: `Unahitaji kinyume cha "${neno1}".`,
        explanation: `Sentensi kamili: "${t.before}${neno2}${t.after}" — kinyume cha "${neno1}" ni "${neno2}".`,
      };
    }

    const jozi = randChoice(rng, JOZI);
    const jina = randChoice(rng, KENYAN_NAMES);
    const mahali = randChoice(rng, KENYAN_PLACES);
    const kamili = `Kiatu cha ${jina} ni ${jozi.a}, lakini cha jirani yake ni ${jozi.b}, wote wakiwa ${mahali}.`;
    const maneno = kamili.replace(".", "").replace(",", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi inayolinganisha vitu viwili vinavyopingana.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `"${jozi.a}" na "${jozi.b}" ni vinyume vya ${pairText(jozi.kikundi)}.`,
      explanation: `Sentensi sahihi ni: "${kamili}"`,
    };
  },
};
