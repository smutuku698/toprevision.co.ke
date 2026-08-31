import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KAWAIDA = [
  "Mambo vipi?",
  "Sawa sawa, tuonane baadaye.",
  "Asante sana bro!",
  "Nitachelewa kidogo.",
  "Uko aje?",
  "Tuonane!",
  "Poa sana hiyo!",
  "Usijali!",
  "Nipigie tu.",
  "Baadaye tuongee.",
];

const RASMI = [
  "Mpendwa Bwana/Bibi,",
  "Ningeshukuru sana ukiniisaidia.",
  "Asante sana kwa msaada wako.",
  "Nasikitika kukujulisha kuwa sitaweza kuhudhuria.",
  "Ninatarajia jibu lako.",
  "Usisite kuwasiliana nami.",
  "Wako mtiifu,",
  "Ninaandika ili kuuliza kuhusu huduma zenu.",
  "Tafadhali thibitisha upatikanaji wako.",
  "Ninathamini uangalifu wako wa haraka kuhusu jambo hili.",
];

export const rasmiKawaida: Skill = {
  id: "kis-w-rasmi-kawaida",
  code: "I.2",
  subjectId: "kiswahili",
  strandId: "kis-insha",
  grade: 9,
  title: "Lugha rasmi dhidi ya lugha ya kawaida",
  description: "Panga misemo katika makundi mawili: lugha rasmi (barua, barua pepe) na lugha ya kawaida (mazungumzo na marafiki).",
  generate(rng) {
    const hint = "Lugha rasmi haitumii lahaja za mtaani — hutumiwa katika barua na mawasiliano ya kiofisi.";

    if (rng() < 0.5) {
      const pool = [
        ...RASMI.map((label) => ({ label, category: "Lugha Rasmi" })),
        ...KAWAIDA.map((label) => ({ label, category: "Lugha ya Kawaida" })),
      ];
      const target = randChoice(rng, pool);
      const choices = shuffle(rng, ["Lugha Rasmi", "Lugha ya Kawaida"]);

      return {
        kind: "multiple-choice",
        prompt: `Je, huu ni msemo wa lugha rasmi au lugha ya kawaida: "${target.label}"?`,
        choices,
        correctIndex: choices.indexOf(target.category),
        layout: "row",
        hint,
        explanation: `"${target.label}" ni ${target.category}.`,
      };
    }

    const rasmi = shuffle(rng, RASMI).slice(0, 3);
    const kawaida = shuffle(rng, KAWAIDA).slice(0, 3);
    const items = shuffle(rng, [
      ...rasmi.map((label) => ({ id: label, label, bucket: "rasmi" })),
      ...kawaida.map((label) => ({ id: label, label, bucket: "kawaida" })),
    ]);

    const correctBucket: Record<string, string> = {};
    for (const item of items) correctBucket[item.id] = item.bucket;

    return {
      kind: "categorize",
      prompt: "Panga kila msemo katika kundi la Lugha Rasmi au Lugha ya Kawaida.",
      items: items.map(({ id, label }) => ({ id, label })),
      buckets: [
        { id: "rasmi", label: "Lugha Rasmi" },
        { id: "kawaida", label: "Lugha ya Kawaida" },
      ],
      correctBucket,
      hint: "Lugha rasmi haitumii lahaja za mtaani — hutumiwa katika barua na mawasiliano ya kiofisi.",
      explanation: `Rasmi: ${rasmi.join(" / ")}. Kawaida: ${kawaida.join(" / ")}.`,
    };
  },
};
