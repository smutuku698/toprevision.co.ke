import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina, mahali } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Insha ya Masimulizi (Huduma ya Kwanza)" — kisa
// kuhusu jinsi ya kutoa huduma ya kwanza barabarani, urefu si chini ya maneno 150. Muundo: mwanzo, kati,
// mwisho. Ona curriculum-reference/grade-5/kiswahili.json.

type Sehemu = "mwanzo" | "kati" | "mwisho";

const SEHEMU_MAELEZO: Record<Sehemu, string> = {
  mwanzo: "mwanzo huanzisha wahusika na mandhari ya kisa kabla ya tukio kuu kutokea",
  kati: "kati huelezea tatizo/tukio kuu na hatua zinazochukuliwa kulitatua",
  mwisho: "mwisho hufunga kisa kwa matokeo au fundisho la mwisho",
};

const SENTENSI_MFANO: { sentensi: string; sehemu: Sehemu }[] = [
  { sentensi: "Ilikuwa asubuhi ya Jumatatu wakati Baraka alipokuwa akitembea kando ya barabara kuelekea shuleni.", sehemu: "mwanzo" },
  { sentensi: "Wanafunzi kadhaa walikuwa wakisubiri basi kwenye kituo karibu na Nakuru.", sehemu: "mwanzo" },
  { sentensi: "Jua lilikuwa limechomoza vizuri wakati magari yalipoanza kupita barabarani.", sehemu: "mwanzo" },
  { sentensi: "Siku hiyo, Chiku alikuwa akienda sokoni pamoja na mama yake.", sehemu: "mwanzo" },
  { sentensi: "Ni siku ya Jumamosi, na watu wengi walikuwa wakitembea barabarani Kisumu.", sehemu: "mwanzo" },
  { sentensi: "Ghafla, pikipiki iligongana na baiskeli karibu na kona ya barabara.", sehemu: "kati" },
  { sentensi: "Mwendesha baiskeli alianguka chini na kujeruhiwa mkononi.", sehemu: "kati" },
  { sentensi: "Baraka alikimbia haraka kumsaidia mwathiriwa aliyeanguka.", sehemu: "kati" },
  { sentensi: "Alimwambia mwathiriwa asogee kando ili magari mengine yasimuathiri.", sehemu: "kati" },
  { sentensi: "Alitumia kitambaa safi kuzuia damu isiendelee kutoka jerahani.", sehemu: "kati" },
  { sentensi: "Aliita huduma ya dharura ili gari la wagonjwa lije haraka.", sehemu: "kati" },
  { sentensi: "Watu wengine walikusanyika kumtuliza mwathiriwa huku wakingoja msaada.", sehemu: "kati" },
  { sentensi: "Baada ya dakika chache, gari la wagonjwa liliwasili na kumchukua mwathiriwa.", sehemu: "mwisho" },
  { sentensi: "Mwathiriwa alipelekwa hospitalini na kupata matibabu zaidi.", sehemu: "mwisho" },
  { sentensi: "Baraka alisifiwa na wote kwa ujasiri na maarifa yake ya huduma ya kwanza.", sehemu: "mwisho" },
  { sentensi: "Tukio hilo liliwafunza wote umuhimu wa kujua huduma ya kwanza.", sehemu: "mwisho" },
  { sentensi: "Mwathiriwa alipona haraka kutokana na msaada wa awali aliopewa.", sehemu: "mwisho" },
];

type Kipengele = "mwanzo" | "kati" | "mwisho" | "wahusika" | "mandhari" | "tatizo" | "suluhisho";

const KIPENGELE_JINA: Record<Kipengele, string> = {
  mwanzo: "Mwanzo",
  kati: "Kati",
  mwisho: "Mwisho",
  wahusika: "Wahusika",
  mandhari: "Mandhari",
  tatizo: "Tatizo",
  suluhisho: "Suluhisho",
};

const KIPENGELE_MAELEZO: Record<Kipengele, string> = {
  mwanzo: "sehemu ya kwanza inayoanzisha wahusika na mandhari ya kisa",
  kati: "sehemu inayoeleza tatizo kuu na hatua zinazochukuliwa",
  mwisho: "sehemu inayofunga kisa kwa matokeo au fundisho",
  wahusika: "watu wanaohusika katika kisa, k.m. dereva, mwathiriwa, msaidizi",
  mandhari: "mahali na wakati kisa kinapotokea, k.m. barabarani, asubuhi",
  tatizo: "changamoto kuu inayotokea katika kisa, k.m. ajali barabarani",
  suluhisho: "jinsi tatizo lilivyotatuliwa, k.m. kutoa huduma ya kwanza",
};

const KIPENGELE_WOTE = Object.keys(KIPENGELE_JINA) as Kipengele[];

const MAKOSA: string[] = [
  "Ndege waliruka juu ya bahari wakitafuta chakula.",
  "Mwalimu alifundisha somo la hesabu darasani.",
  "Timu yetu ilishinda mechi ya mpira wa miguu jana.",
  "Mvua kubwa ilinyesha usiku kucha kijijini.",
  "Watoto walicheza mpira wa kikapu uwanjani.",
  "Duka la mama lilifungwa mapema jioni hiyo.",
];

const MFUATANO: { id: string; label: string }[] = [
  { id: "1", label: "Baraka alikuwa akitembea kando ya barabara asubuhi." },
  { id: "2", label: "Ghafla, pikipiki iligongana na baiskeli karibu naye." },
  { id: "3", label: "Baraka alikimbia kumsaidia mwendesha baiskeli aliyejeruhiwa." },
  { id: "4", label: "Alitumia kitambaa safi kuzuia damu na kuita huduma ya dharura." },
  { id: "5", label: "Gari la wagonjwa liliwasili na kumpeleka mwathiriwa hospitalini." },
];

export const inshaYaMasimuliziHudumaYaKwanza: Skill = {
  id: "g5-ksw-ka-insha-ya-masimulizi-huduma-ya-kwanza",
  code: "KA.2",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Insha ya Masimulizi (Huduma ya Kwanza)",
  description: "Tambua muundo wa insha ya masimulizi kuhusu huduma ya kwanza barabarani, kisha uandike kwa kanuni zifaazo.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-sehemu", "oanisha-kipengele", "panga-uhusiano", "jaza-tukio", "panga-mfuatano"] as const);

    if (branch === "tambua-sehemu") {
      const s = randChoice(rng, SENTENSI_MFANO);
      const wote: Sehemu[] = ["mwanzo", "kati", "mwisho"];
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "sehemu ya kisa inayolingana na sentensi hii")} "${s.sentensi}"`,
        choices: choices.map((c) => KIPENGELE_JINA[c]),
        correctIndex: choices.indexOf(s.sehemu),
        layout: "row",
        hint: SEHEMU_MAELEZO[s.sehemu],
        explanation: `Sentensi hii iko katika sehemu ya ${s.sehemu} — ${SEHEMU_MAELEZO[s.sehemu]}.`,
      };
    }

    if (branch === "oanisha-kipengele") {
      const chosen = shuffle(rng, KIPENGELE_WOTE).slice(0, 5);
      const tokens = chosen.map((k) => ({ id: k, label: KIPENGELE_JINA[k] }));
      const targets = shuffle(rng, chosen).map((k) => ({ id: k, label: KIPENGELE_MAELEZO[k] }));
      const correctMap: Record<string, string> = {};
      for (const k of chosen) correctMap[k] = k;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "kipengele cha insha ya masimulizi na dhima yake"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria muundo wa kisa: nani, wapi, tatizo lipi, na suluhisho gani.",
        explanation: chosen.map((k) => `${KIPENGELE_JINA[k]}: ${KIPENGELE_MAELEZO[k]}.`).join(" "),
      };
    }

    if (branch === "panga-uhusiano") {
      const sahihi = shuffle(rng, SENTENSI_MFANO).slice(0, 4);
      const makosa = shuffle(rng, MAKOSA).slice(0, 4);
      const items = shuffle(rng, [
        ...sahihi.map((s, i) => ({ id: `s${i}-${s.sentensi}`, label: s.sentensi, bucket: "sahihi" })),
        ...makosa.map((m, i) => ({ id: `m${i}-${m}`, label: m, bucket: "makosa" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo sentensi inahusiana na kisa cha huduma ya kwanza barabarani au la"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sahihi", label: "Inahusiana na Kisa" },
          { id: "makosa", label: "Haihusiani (Nje ya Mada)" },
        ],
        correctBucket,
        hint: "Kisa hiki kinazungumzia ajali barabarani na huduma ya kwanza, si mada nyingine.",
        explanation:
          sahihi.map((s) => `"${s.sentensi}" inahusiana na kisa cha huduma ya kwanza.`).join(" ") +
          " " +
          makosa.map((m) => `"${m}" haihusiani na kisa hicho.`).join(" "),
      };
    }

    if (branch === "jaza-tukio") {
      const j = jina(rng);
      const m = mahali(rng);
      const TEMPLATES = [
        { before: `${j} alikuwa akitembea barabarani ${m} wakati alipoona ajali. Alimsaidia mwathiriwa kwa kutoa "`, after: `".`, jibu: "huduma ya kwanza" },
        { before: `Baada ya ajali, ${j} alitumia kitambaa safi kuzuia "`, after: `" isiendelee kutoka jerahani.`, jibu: "damu" },
        { before: `${j} aliita huduma ya "`, after: `" ili gari la wagonjwa lije haraka.`, jibu: "dharura" },
        { before: `Sehemu ya kwanza ya kisa, inayoitwa "`, after: `", huanzisha wahusika na mandhari.`, jibu: "mwanzo" },
        { before: `Sehemu inayoeleza tatizo kuu la kisa huitwa "`, after: `".`, jibu: "kati" },
        { before: `Baada ya mwathiriwa kupelekwa hospitalini, kisa kinafikia sehemu ya "`, after: `".`, jibu: "mwisho" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria msamiati wa huduma ya kwanza na muundo wa kisa: mwanzo, kati, mwisho.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "sentensi za kisa cha huduma ya kwanza barabarani"),
      instruction: "Bofya sentensi kwa mpangilio sahihi wa kisa.",
      items: shuffle(rng, MFUATANO),
      correctOrder: MFUATANO.map((m) => m.id),
      hint: "Fikiria mfuatano wa matukio: kabla ya ajali, wakati wa ajali, na baada ya msaada kutolewa.",
      explanation: "Mpangilio sahihi: " + MFUATANO.map((m) => m.label).join(" → "),
    };
  },
};
