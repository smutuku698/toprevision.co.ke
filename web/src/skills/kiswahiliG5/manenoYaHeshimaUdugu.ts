import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Saa na Majira, mada ndogo 1.4 Maneno ya Heshima na Adabu —
// maneno ya heshima yanayohusiana na udugu (bwana, bibi, ndugu, binti, mama, mama mkubwa, mama mdogo,
// mjomba) yakiongezwa maneno mengine ya udugu yanayoendana na muktadha huohuo.
// Ona curriculum-reference/grade-5/kiswahili.json.

type Kizazi = "wazazi wa wazazi" | "wazazi na wajomba" | "kizazi kimoja" | "watoto na wajukuu";

const UDUGU: { neno: string; maana: string; kizazi: Kizazi }[] = [
  { neno: "bwana", maana: "neno la heshima kwa mwanamume mzima, kama mume", kizazi: "kizazi kimoja" },
  { neno: "bibi", maana: "neno la heshima kwa mwanamke mzima, kama mke", kizazi: "kizazi kimoja" },
  { neno: "ndugu", maana: "mtu wa familia moja, kaka au dada", kizazi: "kizazi kimoja" },
  { neno: "binti", maana: "mtoto wa kike", kizazi: "watoto na wajukuu" },
  { neno: "mama", maana: "mzazi wa kike", kizazi: "wazazi na wajomba" },
  { neno: "mama mkubwa", maana: "dada mkubwa wa mama, anayeheshimiwa kama mama", kizazi: "wazazi na wajomba" },
  { neno: "mama mdogo", maana: "dada mdogo wa mama, anayeheshimiwa kama mama", kizazi: "wazazi na wajomba" },
  { neno: "mjomba", maana: "kaka wa mama", kizazi: "wazazi na wajomba" },
  { neno: "baba", maana: "mzazi wa kiume", kizazi: "wazazi na wajomba" },
  { neno: "baba mkubwa", maana: "kaka mkubwa wa baba", kizazi: "wazazi na wajomba" },
  { neno: "baba mdogo", maana: "kaka mdogo wa baba", kizazi: "wazazi na wajomba" },
  { neno: "shangazi", maana: "dada wa baba", kizazi: "wazazi na wajomba" },
  { neno: "babu", maana: "baba wa baba au wa mama", kizazi: "wazazi wa wazazi" },
  { neno: "nyanya", maana: "mama wa baba au wa mama", kizazi: "wazazi wa wazazi" },
  { neno: "kaka", maana: "ndugu wa kiume mkubwa", kizazi: "kizazi kimoja" },
  { neno: "dada", maana: "ndugu wa kike mkubwa", kizazi: "kizazi kimoja" },
  { neno: "mke", maana: "mwanamke aliyeolewa na mwanamume", kizazi: "kizazi kimoja" },
  { neno: "mume", maana: "mwanamume aliyeoa mwanamke", kizazi: "kizazi kimoja" },
  { neno: "mjukuu", maana: "mtoto wa mtoto wako", kizazi: "watoto na wajukuu" },
  { neno: "mkwe", maana: "ndugu wa mume au wa mke", kizazi: "kizazi kimoja" },
];

const KIZAZI_LABELS: Record<Kizazi, string> = {
  "wazazi wa wazazi": "Wazazi wa Wazazi",
  "wazazi na wajomba": "Wazazi na Ndugu Zao",
  "kizazi kimoja": "Kizazi Kimoja",
  "watoto na wajukuu": "Watoto na Wajukuu",
};

export const manenoYaHeshimaUdugu: Skill = {
  id: "g5-ksw-kz-maneno-ya-heshima-udugu",
  code: "KZ.4",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Maneno ya Heshima na Adabu — Udugu (Saa na Majira)",
  description: "Tambua na utumie maneno ya heshima yanayohusiana na udugu katika mazungumzo.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-neno", "oanisha-maana", "panga-kizazi", "jaza-maana", "panga-mazungumzo"] as const);

    if (branch === "tambua-neno") {
      const u = randChoice(rng, UDUGU);
      const makosa = shuffle(rng, UDUGU.filter((x) => x.neno !== u.neno)).slice(0, 3).map((x) => x.neno);
      const choices = shuffle(rng, [u.neno, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "neno la heshima linalolingana na maelezo haya")} "${u.maana}".`,
        choices,
        correctIndex: choices.indexOf(u.neno),
        layout: "row",
        hint: "Fikiria uhusiano wa kifamilia unaoelezwa.",
        explanation: `Neno "${u.neno}" linamaanisha "${u.maana}".`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, UDUGU).slice(0, 6);
      const tokens = chosen.map((u, i) => ({ id: `${i}`, label: u.neno }));
      const targets = shuffle(rng, chosen).map((u) => ({ id: `${chosen.indexOf(u)}`, label: u.maana }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_u, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno la udugu na maana yake sahihi"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria nafasi ya kila mtu katika familia.",
        explanation: chosen.map((u) => `"${u.neno}" inamaanisha "${u.maana}".`).join(" "),
      };
    }

    if (branch === "panga-kizazi") {
      const vikundi = shuffle(rng, Object.keys(KIZAZI_LABELS) as Kizazi[]).slice(0, 3);
      const items = vikundi.flatMap((k) =>
        shuffle(rng, UDUGU.filter((u) => u.kizazi === k)).slice(0, 2).map((u) => ({ id: u.neno, label: u.neno, bucket: k }))
      );
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kizazi cha familia kinachohusika na kila neno"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: vikundi.map((k) => ({ id: k, label: KIZAZI_LABELS[k] })),
        correctBucket,
        hint: "Fikiria mtu huyu ni wa kizazi gani ukilinganisha na wewe.",
        explanation: "Kila neno la udugu limewekwa katika kizazi kinachokifaa katika familia.",
      };
    }

    if (branch === "jaza-maana") {
      const u = randChoice(rng, UDUGU);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: "Katika mazungumzo ya heshima, neno ",
        after: ` linamaanisha ${u.maana}.`,
        correctAnswer: u.neno,
        inputMode: "text",
        hint: "Neno hili hutumika kumtaja mtu huyu wa familia kwa heshima.",
        explanation: `Neno "${u.neno}" linamaanisha "${u.maana}".`,
      };
    }

    const u = randChoice(rng, UDUGU);
    const j1 = jina(rng);
    const kamili = `${j1} alimsalimu ${u.neno} wake kwa heshima kubwa asubuhi hii`;
    const maneno = kamili.split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "maneno ili kuunda sentensi sahihi ya mazungumzo ya heshima"),
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Neno "${u.neno}" ni la heshima linalotumika kumtaja mtu huyu wa familia.`,
      explanation: `Mpangilio sahihi: "${kamili}"`,
    };
  },
};
