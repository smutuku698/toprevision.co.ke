import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Ndege wa Porini, mada ndogo 1.8 Visawe — kila kikundi cha
// visawe kina maneno matatu yenye maana sawa (nyumbani/mastakimu/chengo; barabara/tariki/baraste;
// jitimai/huzuni/simanzi ni ya moja kwa moja kutoka muundo wa somo), yakiongezwa vikundi vingine vya
// visawe vinavyofahamika. Ona curriculum-reference/grade-5/kiswahili.json.

const VISAWE_GROUPS: { maneno: [string, string, string]; maana: string; sentensi: (neno: string) => string }[] = [
  { maneno: ["nyumbani", "mastakimu", "chengo"], maana: "mahali pa kuishi", sentensi: (n) => `Baada ya shule, alirudi ${n} moja kwa moja.` },
  { maneno: ["barabara", "tariki", "baraste"], maana: "njia kubwa ya magari", sentensi: (n) => `Magari mengi yalikuwa yakipita kwenye ${n} ile.` },
  { maneno: ["jitimai", "huzuni", "simanzi"], maana: "hali ya kusikitika sana", sentensi: (n) => `Uso wake ulionyesha ${n} baada ya kupoteza kitabu chake.` },
  { maneno: ["rafiki", "mwenzangu", "sahibu"], maana: "mtu unayeshirikiana naye kwa ukaribu", sentensi: (n) => `Nilimwalika ${n} wangu kwenye sherehe yangu.` },
  { maneno: ["haraka", "mbio", "kasi"], maana: "hali ya kwenda kwa upesi", sentensi: (n) => `Alikimbia kwa ${n} ili asichelewe shuleni.` },
  { maneno: ["mtoto", "mwana", "kitoto"], maana: "mtu mdogo wa umri", sentensi: (n) => `Aliona ${n} mmoja akicheza uwanjani.` },
  { maneno: ["chakula", "mlo", "msosi"], maana: "kitu cha kula", sentensi: (n) => `Tuliandaa ${n} mtamu kwa wageni wetu.` },
];

const HATUA_ZA_KISAWE = [
  { id: "1", label: "Soma sentensi na ubaini neno unalotaka kubadilisha." },
  { id: "2", label: "Fungua kamusi au kamusi ya visawe." },
  { id: "3", label: "Tafuta neno hilo kwa mpangilio wa alfabeti." },
  { id: "4", label: "Chagua kisawe kinachofaa muktadha wa sentensi." },
  { id: "5", label: "Badilisha neno la awali na kisawe ulichochagua." },
];

export const visawe: Skill = {
  id: "g5-ksw-kz-visawe",
  code: "KZ.8",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Visawe (Ndege wa Porini)",
  description: "Tambua na utumie maneno matatu yenye maana sawa (visawe) katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-kisawe", "oanisha-kisawe", "panga-kikundi", "jaza-kisawe", "panga-utafutaji"] as const);

    if (branch === "chagua-kisawe") {
      const g = randChoice(rng, VISAWE_GROUPS);
      const neno = randChoice(rng, g.maneno);
      const sahihi = g.maneno.filter((n) => n !== neno);
      const correct = randChoice(rng, sahihi);
      const wengine = VISAWE_GROUPS.filter((x) => x !== g).flatMap((x) => x.maneno);
      const makosa = shuffle(rng, wengine).slice(0, 3);
      const choices = shuffle(rng, [correct, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, `kisawe (neno lenye maana sawa) cha neno "${neno}" katika sentensi hii`)} "${g.sentensi(neno)}"`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "row",
        hint: `Neno "${neno}" linamaanisha "${g.maana}".`,
        explanation: `"${neno}", "${g.maneno[0]}", "${g.maneno[1]}" na "${g.maneno[2]}" ni visawe — vyote vinamaanisha "${g.maana}".`,
      };
    }

    if (branch === "oanisha-kisawe") {
      const chosen = shuffle(rng, VISAWE_GROUPS).slice(0, 6);
      const tokens = chosen.map((g, i) => ({ id: `${i}`, label: g.maneno[0] }));
      const targets = shuffle(rng, chosen).map((g) => ({ id: `${chosen.indexOf(g)}`, label: g.maneno[1] }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_g, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno na kisawe chake"),
        tokens,
        targets,
        correctMap,
        hint: "Kila jozi ina maneno mawili yenye maana sawa.",
        explanation: chosen.map((g) => `"${g.maneno[0]}" na "${g.maneno[1]}" ni visawe vinavyomaanisha "${g.maana}".`).join(" "),
      };
    }

    if (branch === "panga-kikundi") {
      const vikundi = shuffle(rng, VISAWE_GROUPS).slice(0, 3);
      const items = vikundi.flatMap((g) => g.maneno.map((n) => ({ id: n, label: n, bucket: g.maana })));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kikundi cha visawe kinachofaa kila neno"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: vikundi.map((g) => ({ id: g.maana, label: g.maana })),
        correctBucket,
        hint: "Maneno matatu katika kila kikundi yana maana moja.",
        explanation: "Kila neno limewekwa katika kikundi cha visawe vyenye maana moja.",
      };
    }

    if (branch === "jaza-kisawe") {
      const g = randChoice(rng, VISAWE_GROUPS);
      const asili = randChoice(rng, g.maneno);
      const wengine = g.maneno.filter((n) => n !== asili);
      const [sahihi1, sahihi2] = wengine;
      const sentensi = g.sentensi(asili);
      const idx = sentensi.indexOf(asili);
      const before = sentensi.slice(0, idx);
      const after = sentensi.slice(idx + asili.length);
      return {
        kind: "fill-blank",
        prompt: `${kamilishaPrompt(rng)} Badilisha neno "${asili}" na kisawe chake.`,
        before,
        after,
        correctAnswer: sahihi1,
        acceptedAnswers: [sahihi2],
        inputMode: "text",
        hint: `Neno "${asili}" linamaanisha "${g.maana}".`,
        explanation: `"${sahihi1}" na "${sahihi2}" ni visawe vya "${asili}" — vyote vinamaanisha "${g.maana}".`,
      };
    }

    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kutafuta kisawe cha neno kwa kutumia kamusi"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: shuffle(rng, HATUA_ZA_KISAWE),
      correctOrder: HATUA_ZA_KISAWE.map((h) => h.id),
      hint: "Fikiria hatua unazochukua unapotafuta kisawe cha neno kwenye kamusi.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_KISAWE.map((h) => h.label).join(" → "),
    };
  },
};
