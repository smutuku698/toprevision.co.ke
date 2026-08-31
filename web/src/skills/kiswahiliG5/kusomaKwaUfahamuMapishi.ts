import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.1 Kusoma kwa Ufahamu — Mapishi. Msamiati: vyakula, viungo vya
// kupikia, njia za kupika, vifaa vya kupikia. Ona curriculum-reference/grade-5/kiswahili.json.

type Kategoria = "vyakula" | "viungo" | "njia" | "vifaa";

const KATEGORIA_LABELS: Record<Kategoria, string> = {
  vyakula: "Vyakula",
  viungo: "Viungo vya Kupikia",
  njia: "Njia za Kupika",
  vifaa: "Vifaa vya Kupikia",
};
const KATEGORIA4: Kategoria[] = ["vyakula", "viungo", "njia", "vifaa"];

const MSAMIATI: { neno: string; kategoria: Kategoria }[] = [
  { neno: "wali", kategoria: "vyakula" },
  { neno: "ugali", kategoria: "vyakula" },
  { neno: "chapati", kategoria: "vyakula" },
  { neno: "maharagwe", kategoria: "vyakula" },
  { neno: "mkate", kategoria: "vyakula" },
  { neno: "uji", kategoria: "vyakula" },
  { neno: "mahindi", kategoria: "vyakula" },
  { neno: "chumvi", kategoria: "viungo" },
  { neno: "pilipili", kategoria: "viungo" },
  { neno: "tangawizi", kategoria: "viungo" },
  { neno: "kitunguu", kategoria: "viungo" },
  { neno: "kitunguu saumu", kategoria: "viungo" },
  { neno: "hiliki", kategoria: "viungo" },
  { neno: "mdalasini", kategoria: "viungo" },
  { neno: "giligilani", kategoria: "viungo" },
  { neno: "kuchemsha", kategoria: "njia" },
  { neno: "kukaanga", kategoria: "njia" },
  { neno: "kuoka", kategoria: "njia" },
  { neno: "kuchoma", kategoria: "njia" },
  { neno: "kukaushia", kategoria: "njia" },
  { neno: "sufuria", kategoria: "vifaa" },
  { neno: "kijiko", kategoria: "vifaa" },
  { neno: "jiko", kategoria: "vifaa" },
  { neno: "bakuli", kategoria: "vifaa" },
  { neno: "kisu", kategoria: "vifaa" },
  { neno: "ubao wa kukatia", kategoria: "vifaa" },
  { neno: "chungu", kategoria: "vifaa" },
];

const SENTENZA: { neno: string; sentensi: string }[] = [
  { neno: "wali", sentensi: "Mama alipika wali kwa chakula cha mchana." },
  { neno: "ugali", sentensi: "Baba anapenda kula ugali na maharagwe jioni." },
  { neno: "chapati", sentensi: "Dada alioka chapati tamu asubuhi." },
  { neno: "tangawizi", sentensi: "Bibi aliongeza tangawizi kwenye chai ili ionje vizuri." },
  { neno: "kitunguu", sentensi: "Mpishi alikatakata kitunguu kabla ya kukaanga nyama." },
  { neno: "kuchemsha", sentensi: "Ni muhimu kuchemsha maji kabla ya kutengeneza chai." },
  { neno: "sufuria", sentensi: "Weka mchele kwenye sufuria safi kabla ya kupika." },
  { neno: "jiko", sentensi: "Mama aliwasha jiko ili apike chakula cha jioni." },
];

const MICHAKATO: { jina: string; hatua: string[] }[] = [
  {
    jina: "kupika ugali",
    hatua: [
      "Chemsha maji kwenye sufuria.",
      "Mimina unga kidogo kidogo huku ukikoroga.",
      "Koroga hadi mchanganyiko uwe mzito.",
      "Ipua na uache ugali upoe kidogo kabla ya kuuweka sahanini.",
    ],
  },
  {
    jina: "kutengeneza chai",
    hatua: [
      "Mimina maji kwenye sufuria na uyachemshe.",
      "Ongeza majani ya chai na tangawizi.",
      "Mimina maziwa na sukari kiasi.",
      "Chuja chai na uimimine kwenye kikombe.",
    ],
  },
  {
    jina: "kupika wali",
    hatua: [
      "Osha mchele kwa maji safi.",
      "Weka mchele kwenye sufuria yenye maji na chumvi.",
      "Funika sufuria na uache uchemke.",
      "Punguza moto hadi wali uive na maji yakauke.",
    ],
  },
];

export const kusomaKwaUfahamuMapishi: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-ufahamu-mapishi",
  code: "KS.1",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Ufahamu (Mapishi)",
  description: "Tambua msamiati wa mapishi (vyakula, viungo, njia za kupika, vifaa) na usome kwa ufahamu kuhusu mapishi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-kategoria", "oanisha-kategoria", "panga-kategoria", "jaza-mapishi", "panga-hatua"] as const);

    if (branch === "tambua-kategoria") {
      const neno = randChoice(rng, MSAMIATI);
      const choices = shuffle(rng, KATEGORIA4.map((k) => KATEGORIA_LABELS[k]));
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "kategoria ya neno hili la mapishi")} Neno: "${neno.neno}".`,
        choices,
        correctIndex: choices.indexOf(KATEGORIA_LABELS[neno.kategoria]),
        layout: "row",
        hint: "Fikiria: je, ni chakula, kiungo, njia ya kupika au chombo?",
        explanation: `"${neno.neno}" ni ${KATEGORIA_LABELS[neno.kategoria].toLowerCase()}.`,
      };
    }

    if (branch === "oanisha-kategoria") {
      const chosen = KATEGORIA4.map((k) => randChoice(rng, MSAMIATI.filter((m) => m.kategoria === k)));
      const tokens = shuffle(rng, chosen).map((m) => ({ id: m.neno, label: m.neno }));
      const targets = shuffle(rng, KATEGORIA4).map((k) => ({ id: k, label: KATEGORIA_LABELS[k] }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.neno] = m.kategoria;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno la mapishi na kategoria yake sahihi"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kama neno ni chakula, kiungo, njia ya kupika au chombo.",
        explanation: chosen.map((m) => `"${m.neno}" ni ${KATEGORIA_LABELS[m.kategoria].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga-kategoria") {
      const items = shuffle(rng, MSAMIATI).slice(0, 8);
      const correctBucket: Record<string, string> = {};
      for (const m of items) correctBucket[m.neno] = m.kategoria;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama neno ni chakula, kiungo, njia ya kupika au chombo (vifaa)"),
        items: items.map((m) => ({ id: m.neno, label: m.neno })),
        buckets: KATEGORIA4.map((k) => ({ id: k, label: KATEGORIA_LABELS[k] })),
        correctBucket,
        hint: "Zingatia maana ya kila neno kabla ya kulipanga.",
        explanation: items.map((m) => `"${m.neno}" ni ${KATEGORIA_LABELS[m.kategoria].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "jaza-mapishi") {
      const s = randChoice(rng, SENTENZA);
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
        hint: "Fikiria neno la mapishi linalofaa hapa.",
        explanation: `Sentensi kamili: "${s.sentensi}"`,
      };
    }

    const mchakato = randChoice(rng, MICHAKATO);
    const items = mchakato.hatua.map((h, i) => ({ id: `${i}-${mchakato.jina}`, label: h }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, `hatua za ${mchakato.jina}`),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria ni hatua gani inayofanyika kwanza mpishi anapoanza kazi.",
      explanation: `Mpangilio sahihi wa ${mchakato.jina}: ${mchakato.hatua.join(" ")}`,
    };
  },
};
