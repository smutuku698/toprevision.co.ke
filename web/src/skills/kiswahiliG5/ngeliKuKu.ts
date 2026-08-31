import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 7.4.1 Ngeli ya KU-KU (Elimu ya Mazingira).
// Ona curriculum-reference/grade-5/kiswahili.json.

const NOMINO_KUKU: { neno: string; maana: string }[] = [
  { neno: "kupika", maana: "kuandaa chakula kwa moto" },
  { neno: "kufyeka", maana: "kukata majani/vichaka kwa kisu au panga" },
  { neno: "kuzuru", maana: "kutembelea mahali au mtu" },
  { neno: "kukariri", maana: "kusoma tena na tena ili kukumbuka" },
  { neno: "kufua", maana: "kuosha nguo kwa maji na sabuni" },
  { neno: "kupanda", maana: "kuweka mche au mbegu ardhini" },
  { neno: "kuvuna", maana: "kukusanya mazao yaliyokomaa" },
  { neno: "kusafisha", maana: "kuondoa uchafu mahali" },
  { neno: "kulima", maana: "kutayarisha ardhi kwa kilimo" },
  { neno: "kuchimba", maana: "kutoboa ardhi kwa jembe au sepetu" },
];

const MPANGILIO_MAZINGIRA = ["kufyeka", "kulima", "kupanda", "kuvuna"] as const;

const SENTENSI_JAZA: { neno: string; before: string; after: string }[] = [
  { neno: "kupika", before: "Mama alianza ", after: " chakula cha jioni." },
  { neno: "kufyeka", before: "Wakulima walikuwa wakikamilisha ", after: " shamba lote." },
  { neno: "kuzuru", before: "Tulipanga ", after: " babu wikendi hii." },
  { neno: "kukariri", before: "Mwanafunzi alifurahia ", after: " shairi lake." },
  { neno: "kufua", before: "Kila Jumamosi mama huenda ", after: " nguo." },
  { neno: "kupanda", before: "Shule ilipanga siku ya ", after: " miti." },
  { neno: "kuvuna", before: "Wakulima walifurahi wakati wa ", after: " mahindi." },
  { neno: "kusafisha", before: "Wanafunzi walishiriki ", after: " darasa lao." },
  { neno: "kulima", before: "Baba alienda shambani ", after: " asubuhi na mapema." },
  { neno: "kuchimba", before: "Walipanga ", after: " kisima kipya." },
];

export const ngeliKuKu: Skill = {
  id: "g5-ksw-sarufi-ngeli-ku-ku",
  code: "SA.8",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Ngeli ya KU-KU (Elimu ya Mazingira)",
  description: "Tambua nomino za ngeli ya KU-KU (vitenzi-jina kama kupika, kufyeka, kuzuru) na uzitumie katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-maana", "oanisha-maana", "panga-mazingira", "jaza-neno", "panga-shughuli"] as const);

    if (branch === "tambua-maana") {
      const n = randChoice(rng, NOMINO_KUKU);
      const wote = shuffle(rng, NOMINO_KUKU.map((x) => x.maana));
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "maana sahihi")} Neno la ngeli ya KU-KU: "${n.neno}".`,
        choices: wote,
        correctIndex: wote.indexOf(n.maana),
        layout: "list",
        hint: "Nomino za ngeli ya KU-KU huanza kwa 'ku-' na hutaja jina la kitendo.",
        explanation: `"${n.neno}" humaanisha ${n.maana}.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, NOMINO_KUKU).slice(0, 4);
      const tokens = chosen.map((n) => ({ id: n.neno, label: n.neno }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.neno, label: n.maana }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.neno] = n.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "nomino ya ngeli ya KU-KU na maana yake"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria ni kitendo gani kinachofanywa mazingirani.",
        explanation: chosen.map((n) => `"${n.neno}" humaanisha ${n.maana}.`).join(" "),
      };
    }

    if (branch === "panga-mazingira") {
      const kuku = shuffle(rng, NOMINO_KUKU.filter((n) => ["kupika", "kukariri", "kuzuru", "kusafisha"].includes(n.neno))).slice(0, 4).map((n) => ({ id: n.neno, label: n.neno, bucket: "SIO_MAZINGIRA" }));
      const mazingira = shuffle(rng, NOMINO_KUKU.filter((n) => MPANGILIO_MAZINGIRA.includes(n.neno as (typeof MPANGILIO_MAZINGIRA)[number]))).map((n) => ({ id: n.neno, label: n.neno, bucket: "MAZINGIRA" }));
      const items = shuffle(rng, [...kuku, ...mazingira]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo neno linahusu shughuli za shambani/mazingira au shughuli nyingine"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "MAZINGIRA", label: "Shughuli za Shamba/Mazingira" },
          { id: "SIO_MAZINGIRA", label: "Shughuli Nyingine" },
        ],
        correctBucket,
        hint: "Shughuli za shambani ni kama kufyeka, kulima, kupanda na kuvuna.",
        explanation: "Kufyeka, kulima, kupanda na kuvuna ni shughuli za shambani; kupika, kukariri, kuzuru na kusafisha ni shughuli nyingine za kila siku.",
      };
    }

    if (branch === "jaza-neno") {
      const s = randChoice(rng, SENTENSI_JAZA);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: s.before,
        after: s.after,
        correctAnswer: s.neno,
        inputMode: "text",
        hint: "Neno linalokosekana ni kitenzi-jina cha ngeli ya KU-KU.",
        explanation: `Sentensi kamili: "${s.before}${s.neno}${s.after}"`,
      };
    }

    const items = MPANGILIO_MAZINGIRA.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "shughuli hizi za shamba kwa mpangilio sahihi wa msimu wa kilimo"),
      instruction: "Bofya shughuli kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria hatua za kilimo kutoka kuandaa shamba hadi kuvuna.",
      explanation: `Mpangilio sahihi: ${MPANGILIO_MAZINGIRA.join(", ")}.`,
    };
  },
};
