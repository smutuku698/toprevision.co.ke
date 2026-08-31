import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.3 Kusoma kwa Ufasaha (Mapambo). Vipengele vya ufasaha: matamshi bora,
// kasi (maneno 70/dakika), sauti/kiimbo, ishara za uso na mikono; msamiati wa mapambo kutoka Kuandika.
// Ona curriculum-reference/grade-5/kiswahili.json.

type Kipengele = "matamshi" | "kasi" | "sauti" | "ishara";

const VIPENGELE: { id: Kipengele; jina: string }[] = [
  { id: "matamshi", jina: "Matamshi Bora" },
  { id: "kasi", jina: "Kasi Ifaayo (maneno 70 kwa dakika)" },
  { id: "sauti", jina: "Kiwango cha Sauti na Kiimbo" },
  { id: "ishara", jina: "Ishara za Uso na Mikono" },
];

const TABIA: { tabia: string; kipengele: Kipengele }[] = [
  { tabia: "Alitamka kila neno kwa usahihi bila kukwama.", kipengele: "matamshi" },
  { tabia: "Alisoma maneno kwa mwendo mzuri, asiharakishe wala kukawia.", kipengele: "kasi" },
  { tabia: "Aliinua sauti alipofika sehemu ya kusisimua ya hadithi.", kipengele: "sauti" },
  { tabia: "Alionyesha tabasamu alipomsomea mtoto habari za furaha.", kipengele: "ishara" },
  { tabia: "Alisoma sentensi ngumu bila kubabaika matamshi.", kipengele: "matamshi" },
  { tabia: "Alisoma karibu maneno 70 kwa dakika bila kuharakisha.", kipengele: "kasi" },
  { tabia: "Alishusha sauti alipofikia sehemu ya huzuni ya hadithi.", kipengele: "sauti" },
  { tabia: "Aliinua mkono wake kuonyesha mshangao alipokuwa akisoma.", kipengele: "ishara" },
  { tabia: "Alitamka herufi zote kwa uwazi bila kumeza sauti.", kipengele: "matamshi" },
  { tabia: "Hakusoma haraka mno wala polepole mno, aliendana na hadhira.", kipengele: "kasi" },
];

const HAIFAI: string[] = [
  "Alisoma kwa sauti ya chini mno hivi kwamba hakuna aliyemsikia.",
  "Alisoma haraka sana hadi maneno yakachanganyika.",
  "Alikwama kila neno la tatu bila sababu.",
  "Aliusoma uso wake ukiwa mtupu bila hisia zozote.",
  "Alitamka maneno vibaya hivi kwamba maana ilibadilika.",
  "Alisoma polepole mno hata wasikilizaji wakachoka.",
];

const MAPAMBO: string[] = ["herini", "vipuli", "pete", "kipini", "bangili", "shanga", "taji", "hina"];
const SENTENZA_MAPAMBO: { neno: string; sentensi: string }[] = [
  { neno: "herini", sentensi: "Amina alivaa herini nzuri za dhahabu sikioni." },
  { neno: "vipuli", sentensi: "Bibi alinunua vipuli vya fedha kwa ajili ya harusi." },
  { neno: "pete", sentensi: "Mama alivaa pete ya thamani kidoleni." },
  { neno: "kipini", sentensi: "Dada alifunga kipini shingoni kabla ya sherehe." },
  { neno: "bangili", sentensi: "Fatuma alivaa bangili nzuri mkononi." },
  { neno: "shanga", sentensi: "Msichana alipamba nywele zake kwa shanga za rangi." },
  { neno: "taji", sentensi: "Malkia alivaa taji la kifahari kichwani." },
  { neno: "hina", sentensi: "Wanawake walipaka hina mikononi kwa ajili ya sherehe." },
];

const MICHAKATO: string[][] = [
  [
    "Angalia kifungu kwanza kuelewa maudhui yake.",
    "Tamka kila neno kwa usahihi na uwazi.",
    "Soma kwa kasi ifaayo, si haraka wala polepole.",
    "Tumia kiimbo na ishara za uso kuonyesha hisia za kifungu.",
  ],
  [
    "Chagua kifungu unachotaka kusoma.",
    "Fanya mazoezi ya kusoma kifungu peke yako kwanza.",
    "Simama mahali panapoonekana na kila mtu.",
    "Soma kwa sauti ukizingatia matamshi, kasi, sauti na ishara.",
  ],
];

export const kusomaKwaUfasahaMapambo: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-ufasaha-mapambo",
  code: "KS.3",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Ufasaha (Mapambo)",
  description: "Tambua vipengele vya kusoma kwa ufasaha (matamshi, kasi, sauti, ishara) na msamiati wa mapambo.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-kipengele", "oanisha-kipengele", "panga-ufasaha", "jaza-mapambo", "panga-hatua"] as const);

    if (branch === "tambua-kipengele") {
      const t = randChoice(rng, TABIA);
      const choices = shuffle(rng, VIPENGELE.map((v) => v.jina));
      const jina = VIPENGELE.find((v) => v.id === t.kipengele)!.jina;
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "kipengele cha ufasaha kinachoonyeshwa na tabia hii ya usomaji")} "${t.tabia}"`,
        choices,
        correctIndex: choices.indexOf(jina),
        layout: "list",
        hint: "Fikiria kama tabia hii inahusu matamshi, kasi, sauti au ishara.",
        explanation: `Tabia hii inaonyesha kipengele cha ${jina.toLowerCase()}.`,
      };
    }

    if (branch === "oanisha-kipengele") {
      const chosen = VIPENGELE.map((v) => randChoice(rng, TABIA.filter((t) => t.kipengele === v.id)));
      const tokens = shuffle(rng, chosen).map((t) => ({ id: t.kipengele, label: t.tabia }));
      const targets = shuffle(rng, VIPENGELE).map((v) => ({ id: v.id, label: v.jina }));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.kipengele] = t.kipengele;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "tabia ya usomaji na kipengele cha ufasaha kinachoonyeshwa"),
        tokens,
        targets,
        correctMap,
        hint: "Soma kila tabia kwa makini kabla ya kuoanisha.",
        explanation: chosen.map((t) => `"${t.tabia}" inaonyesha ${VIPENGELE.find((v) => v.id === t.kipengele)!.jina.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga-ufasaha") {
      const mzuri = shuffle(rng, TABIA).slice(0, 4).map((t) => t.tabia);
      const haufai = shuffle(rng, HAIFAI).slice(0, 4);
      const items = shuffle(rng, [...mzuri, ...haufai]).map((tabia, i) => ({ id: `${i}-tabia`, label: tabia }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = mzuri.includes(it.label) ? "mzuri" : "haufai";
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama tabia ya usomaji ni ufasaha mzuri au haufai"),
        items,
        buckets: [
          { id: "mzuri", label: "Ufasaha Mzuri" },
          { id: "haufai", label: "Haufai" },
        ],
        correctBucket,
        hint: "Fikiria kama tabia hii ingemsaidia msikilizaji kuelewa vizuri.",
        explanation: "Ufasaha mzuri huzingatia matamshi bora, kasi ifaayo, sauti inayofaa na ishara za maana.",
      };
    }

    if (branch === "jaza-mapambo") {
      const s = randChoice(rng, SENTENZA_MAPAMBO);
      const maneno = s.sentensi.replace(".", "").split(" ");
      const idx = randChoice(
        rng,
        maneno.map((_w, i) => i).filter((i) => maneno[i].toLowerCase() === s.neno.toLowerCase())
      );
      const before = maneno.slice(0, idx).join(" ") + (idx > 0 ? " " : "");
      const after = " " + maneno.slice(idx + 1).join(" ") + ".";
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before,
        after,
        correctAnswer: s.neno,
        inputMode: "text",
        hint: `Neno hili ni aina ya pambo, kama ${randChoice(rng, MAPAMBO.filter((m) => m !== s.neno))}.`,
        explanation: `Sentensi kamili: "${s.sentensi}"`,
      };
    }

    const hatua = randChoice(rng, MICHAKATO);
    const items = hatua.map((h, i) => ({ id: `${i}-hatua`, label: h }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kusoma kifungu kwa ufasaha"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria ni hatua gani inayofanyika kabla ya nyingine ukijiandaa kusoma.",
      explanation: `Mpangilio sahihi: ${hatua.join(" ")}`,
    };
  },
};
