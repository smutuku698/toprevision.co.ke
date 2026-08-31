import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Huduma ya Kwanza, mada ndogo 1.2 Maamkuzi na Maagano — aina
// mbalimbali za maamkuzi (salamu) na maagano (kuagana) katika miktadha mbalimbali.
// Ona curriculum-reference/grade-5/kiswahili.json.

const MAAMKUZI: { salamu: string; jibu: string }[] = [
  { salamu: "Shikamoo?", jibu: "Marahaba." },
  { salamu: "Habari za utokako?", jibu: "Njema." },
  { salamu: "Habari za adhuhuri?", jibu: "Nzuri." },
  { salamu: "Habari za jioni?", jibu: "Njema." },
  { salamu: "Hujambo?", jibu: "Sijambo." },
  { salamu: "Hamjambo?", jibu: "Hatujambo." },
  { salamu: "U hali gani?", jibu: "Ni mzima." },
  { salamu: "Mambo?", jibu: "Poa." },
];

const MAAGANO: { agano: string; muktadha: string }[] = [
  { agano: "Lala salama.", muktadha: "unapoenda kulala usiku" },
  { agano: "Safari njema.", muktadha: "mtu anapoondoka safarini" },
  { agano: "Alamsiki.", muktadha: "usiku kabla ya kwenda kulala" },
  { agano: "Kwaheri.", muktadha: "watu wanapoachana" },
  { agano: "Tuonane.", muktadha: "ukitarajia kukutana tena hivi karibuni" },
  { agano: "Mungu akuwe nawe.", muktadha: "unapomtakia mtu baraka safarini" },
  { agano: "Usiku mwema.", muktadha: "jioni kabla ya kila mmoja kwenda kulala" },
];

export const maamkuziNaMaagano: Skill = {
  id: "g5-ksw-kz-maamkuzi-na-maagano",
  code: "KZ.2",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Maamkuzi na Maagano (Huduma ya Kwanza)",
  description: "Tambua na utumie aina mbalimbali za maamkuzi na maagano katika miktadha mbalimbali.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-jibu", "oanisha-jibu", "panga-aina", "jaza-mazungumzo", "panga-mazungumzo"] as const);

    if (branch === "chagua-jibu") {
      const m = randChoice(rng, MAAMKUZI);
      const makosa = shuffle(rng, MAAMKUZI.filter((x) => x.jibu !== m.jibu)).slice(0, 3).map((x) => x.jibu);
      const choices = shuffle(rng, [m.jibu, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "jibu sahihi la salamu hii")} Salamu: "${m.salamu}"`,
        choices,
        correctIndex: choices.indexOf(m.jibu),
        layout: "row",
        hint: "Fikiria jinsi watu wanavyojibiana katika mazungumzo halisi.",
        explanation: `Jibu sahihi la "${m.salamu}" ni "${m.jibu}".`,
      };
    }

    if (branch === "oanisha-jibu") {
      // "Habari za utokako?" na "Habari za jioni?" zote hujibiwa "Njema." — chuja ili kila jibu
      // lisiloonekane katika lengo la maswali liwe la kipekee, kuepuka drop-target zenye lebo sawa.
      const jibuZilizoshughulikiwa = new Set<string>();
      const MAAMKUZI_YA_KIPEKEE = MAAMKUZI.filter((m) => {
        if (jibuZilizoshughulikiwa.has(m.jibu)) return false;
        jibuZilizoshughulikiwa.add(m.jibu);
        return true;
      });
      const chosen = shuffle(rng, MAAMKUZI_YA_KIPEKEE).slice(0, 6);
      const tokens = chosen.map((m, i) => ({ id: `${i}`, label: m.salamu }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: `${chosen.indexOf(m)}`, label: m.jibu }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_m, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "salamu na jibu lake sahihi"),
        tokens,
        targets,
        correctMap,
        hint: "Kila salamu ina jibu lake maalum linalotumika kwa kawaida.",
        explanation: chosen.map((m) => `"${m.salamu}" hujibiwa kwa "${m.jibu}".`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const maamkuziChagua = shuffle(rng, MAAMKUZI).slice(0, 5).map((m, i) => ({ id: `mk-${i}`, label: m.salamu, bucket: "maamkuzi" }));
      const maaganoChagua = shuffle(rng, MAAGANO).slice(0, 5).map((m, i) => ({ id: `mg-${i}`, label: m.agano, bucket: "maagano" }));
      const items = shuffle(rng, [...maamkuziChagua, ...maaganoChagua]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo usemi ni maamkuzi (kukutana) au maagano (kuagana)"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "maamkuzi", label: "Maamkuzi" },
          { id: "maagano", label: "Maagano" },
        ],
        correctBucket,
        hint: "Maamkuzi hutumika watu wanapokutana; maagano hutumika wanapoachana.",
        explanation: "Kila usemi umewekwa kulingana na iwapo unatumika watu wanapokutana au wanapoachana.",
      };
    }

    if (branch === "jaza-mazungumzo") {
      const m = randChoice(rng, MAAMKUZI);
      const j1 = jina(rng);
      const j2Options = ["Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima", "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris"].filter((n) => n !== j1);
      const j2 = randChoice(rng, j2Options);
      return {
        kind: "fill-blank",
        prompt: `${kamilishaPrompt(rng)} ${j1} na ${j2} wanasalimiana.`,
        before: `${j1}: "${m.salamu}"\n${j2}: "`,
        after: `"`,
        correctAnswer: m.jibu,
        inputMode: "text",
        hint: `Fikiria jibu la kawaida kwa "${m.salamu}"`,
        explanation: `Mazungumzo kamili: ${j1}: "${m.salamu}" — ${j2}: "${m.jibu}"`,
      };
    }

    const m = randChoice(rng, MAAMKUZI);
    const j1 = jina(rng);
    const kamili = `${j1} alisema ${m.salamu} mwenzake akajibu ${m.jibu}`;
    const maneno = kamili.split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "maneno ili kuunda mazungumzo sahihi ya maamkuzi"),
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `"${m.salamu}" hufuatwa na jibu "${m.jibu}" katika mazungumzo.`,
      explanation: `Mpangilio sahihi: "${kamili}"`,
    };
  },
};
