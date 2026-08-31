import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.11 Kusoma kwa Ufasaha (Uwekezaji). Vipengele vya ufasaha: matamshi
// bora, kasi (maneno 75/dakika — juu zaidi kuliko KS.3's 70/dakika, ukuaji wa ufasaha), sauti, ishara;
// msamiati wa uwekezaji. Ona curriculum-reference/grade-5/kiswahili.json.

type Kipengele = "matamshi" | "kasi" | "sauti" | "ishara";

const VIPENGELE: { id: Kipengele; jina: string }[] = [
  { id: "matamshi", jina: "Matamshi Bora" },
  { id: "kasi", jina: "Kasi Ifaayo (maneno 75 kwa dakika)" },
  { id: "sauti", jina: "Kiwango cha Sauti na Kiimbo" },
  { id: "ishara", jina: "Ishara za Uso na Mikono" },
];

const TABIA: { tabia: string; kipengele: Kipengele }[] = [
  { tabia: "Alitamka kila neno la kifungu kwa usahihi na uwazi.", kipengele: "matamshi" },
  { tabia: "Alisoma karibu maneno 75 kwa dakika bila kuharakisha.", kipengele: "kasi" },
  { tabia: "Aliinua sauti alipofikia sehemu muhimu ya kifungu.", kipengele: "sauti" },
  { tabia: "Alionyesha uso wa furaha alipofikia habari njema.", kipengele: "ishara" },
  { tabia: "Alitamka maneno magumu bila kubabaika.", kipengele: "matamshi" },
  { tabia: "Alisoma kwa mwendo mzuri, si haraka wala polepole.", kipengele: "kasi" },
  { tabia: "Alishusha sauti alipofikia sehemu ya kusikitisha.", kipengele: "sauti" },
  { tabia: "Alitumia mikono yake kuonyesha maana ya kifungu.", kipengele: "ishara" },
  { tabia: "Alitamka herufi zote kwa uwazi bila kumeza sauti.", kipengele: "matamshi" },
  { tabia: "Aliendana na kasi ifaayo ya maneno 75 kwa dakika.", kipengele: "kasi" },
];

const UWEKEZAJI: { neno: string; maana: string }[] = [
  { neno: "akiba", maana: "pesa anazoweka mtu pembeni kwa matumizi ya baadaye" },
  { neno: "benki", maana: "taasisi inayotunza pesa za watu na kutoa mikopo" },
  { neno: "faida", maana: "ongezeko la thamani au pesa baada ya biashara au uwekezaji" },
  { neno: "hasara", maana: "upungufu wa pesa au thamani baada ya biashara kutofaulu" },
  { neno: "mtaji", maana: "pesa au rasilimali ya kuanzia biashara" },
  { neno: "biashara", maana: "shughuli ya kuuza na kununua bidhaa au huduma" },
  { neno: "uwekezaji", maana: "kitendo cha kuweka pesa au rasilimali ili kupata faida baadaye" },
  { neno: "riba", maana: "kiasi cha ziada kinacholipwa au kupokelewa kwa kutumia pesa za mtu mwingine" },
];

const MATOKEO: { tukio: string; hali: "faida" | "hasara" }[] = [
  { tukio: "Mfanyabiashara aliuza bidhaa zote kwa bei nzuri na kupata pesa zaidi ya mtaji wake.", hali: "faida" },
  { tukio: "Akiba yake benki iliongezeka kwa riba baada ya mwaka mmoja.", hali: "faida" },
  { tukio: "Biashara yake ilikua na kupata wateja wengi zaidi.", hali: "faida" },
  { tukio: "Alipata faida baada ya kuuza mazao yake sokoni kwa bei nzuri.", hali: "faida" },
  { tukio: "Uwekezaji wake katika kuku ulimletea mapato mazuri.", hali: "faida" },
  { tukio: "Mfanyabiashara alipoteza mtaji wake wote baada ya bidhaa kuharibika.", hali: "hasara" },
  { tukio: "Alilazimika kuuza bidhaa kwa bei ya chini kuliko alivyonunulia.", hali: "hasara" },
  { tukio: "Biashara yake ilifungwa kwa sababu ya kukosa wateja.", hali: "hasara" },
  { tukio: "Alipoteza pesa nyingi baada ya uwekezaji kushindwa.", hali: "hasara" },
  { tukio: "Mazao yake yaliharibika kabla ya kuuzwa sokoni, akapata hasara.", hali: "hasara" },
];

const SENTENZA: { neno: string; sentensi: string }[] = [
  { neno: "akiba", sentensi: "Ni vizuri kuweka akiba kila mwezi kwa ajili ya dharura." },
  { neno: "benki", sentensi: "Aliweka pesa zake zote benki ili zisipotee." },
  { neno: "faida", sentensi: "Mfanyabiashara alipata faida kubwa baada ya kuuza mazao yake." },
  { neno: "hasara", sentensi: "Alipata hasara baada ya bidhaa zake kuharibika." },
  { neno: "mtaji", sentensi: "Alianzisha biashara yake kwa mtaji mdogo." },
  { neno: "biashara", sentensi: "Baba anaendesha biashara ya kuuza nguo mjini." },
  { neno: "uwekezaji", sentensi: "Uwekezaji mzuri huhitaji mipango makini." },
  { neno: "riba", sentensi: "Benki hulipa riba kwa watu wanaoweka akiba zao." },
];

const MICHAKATO: string[][] = [
  [
    "Weka akiba kutokana na mapato yako.",
    "Panga jinsi utakavyotumia mtaji wako.",
    "Wekeza mtaji wako katika biashara au shughuli unayochagua.",
    "Fuatilia biashara yako mara kwa mara kuhakikisha inafanya vizuri.",
  ],
  [
    "Chagua benki inayoaminika kuweka akiba yako.",
    "Fungua akaunti ya akiba benki.",
    "Weka pesa kidogo kidogo kila mwezi.",
    "Angalia jinsi riba inavyoongeza akiba yako.",
  ],
];

export const kusomaKwaUfasahaUwekezaji: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-ufasaha-uwekezaji",
  code: "KS.11",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Ufasaha (Uwekezaji)",
  description: "Tambua vipengele vya kusoma kwa ufasaha (maneno 75 kwa dakika) na msamiati wa uwekezaji.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-mchanganyiko", "oanisha-uwekezaji", "panga-matokeo", "jaza-uwekezaji", "panga-hatua"] as const);

    if (branch === "tambua-mchanganyiko") {
      const jamii = randChoice(rng, ["ufasaha", "uwekezaji"] as const);
      if (jamii === "ufasaha") {
        const t = randChoice(rng, TABIA);
        const choices = shuffle(rng, VIPENGELE.map((v) => v.jina));
        const jina = VIPENGELE.find((v) => v.id === t.kipengele)!.jina;
        return {
          kind: "multiple-choice",
          prompt: `${tambuaPrompt(rng, "kipengele cha ufasaha kinachoonyeshwa na tabia hii")} "${t.tabia}"`,
          choices,
          correctIndex: choices.indexOf(jina),
          layout: "list",
          hint: "Fikiria kama tabia hii inahusu matamshi, kasi, sauti au ishara.",
          explanation: `Tabia hii inaonyesha kipengele cha ${jina.toLowerCase()}.`,
        };
      }
      const u = randChoice(rng, UWEKEZAJI);
      const wengine = shuffle(rng, UWEKEZAJI.filter((x) => x.neno !== u.neno)).slice(0, 3);
      const choices = shuffle(rng, [u.neno, ...wengine.map((x) => x.neno)]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "neno la uwekezaji linalofaa maelezo haya")} Maelezo: ${u.maana}.`,
        choices,
        correctIndex: choices.indexOf(u.neno),
        layout: "row",
        hint: "Fikiria neno la uwekezaji linaloendana na maelezo hayo.",
        explanation: `"${u.neno}" ni ${u.maana}.`,
      };
    }

    if (branch === "oanisha-uwekezaji") {
      const chosen = shuffle(rng, UWEKEZAJI).slice(0, 5);
      const tokens = chosen.map((u) => ({ id: u.neno, label: u.neno }));
      const targets = shuffle(rng, chosen).map((u) => ({ id: u.neno, label: u.maana }));
      const correctMap: Record<string, string> = {};
      for (const u of chosen) correctMap[u.neno] = u.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno la uwekezaji na maana yake"),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Soma maana kwa makini kabla ya kuoanisha na neno lake.",
        explanation: chosen.map((u) => `"${u.neno}" ni ${u.maana}.`).join(" "),
      };
    }

    if (branch === "panga-matokeo") {
      const items = shuffle(rng, MATOKEO).slice(0, 8).map((m, i) => ({ id: `${i}-tukio`, label: m.tukio }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) {
        const found = MATOKEO.find((m) => m.tukio === it.label)!;
        correctBucket[it.id] = found.hali;
      }
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama tukio hili la kibiashara ni faida au hasara"),
        items,
        buckets: [
          { id: "faida", label: "Faida" },
          { id: "hasara", label: "Hasara" },
        ],
        correctBucket,
        hint: "Fikiria kama tukio hili lilimletea mtu pesa zaidi au alipoteza pesa.",
        explanation: "Faida ni ongezeko la pesa au mafanikio ya biashara; hasara ni upungufu wa pesa au kushindwa kwa biashara.",
      };
    }

    if (branch === "jaza-uwekezaji") {
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
        hint: "Fikiria neno la uwekezaji linalofaa hapa.",
        explanation: `Sentensi kamili: "${s.sentensi}"`,
      };
    }

    const hatua = randChoice(rng, MICHAKATO);
    const items = hatua.map((h, i) => ({ id: `${i}-hatua`, label: h }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kufanya uamuzi mdogo wa uwekezaji"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria hatua ya kwanza kabla ya kuwekeza pesa.",
      explanation: `Mpangilio sahihi: ${hatua.join(" ")}`,
    };
  },
};
