import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MBINU: { id: string; jina: string; maelezo: string }[] = [
  { id: "tashbiha", jina: "Tashbiha", maelezo: "Kulinganisha vitu viwili tofauti kwa kutumia 'kama' au 'mfano wa'" },
  { id: "tashihisi", jina: "Tashihisi", maelezo: "Kukipa kitu kisicho na uhai sifa za binadamu" },
  { id: "mubalagha", jina: "Mubalagha", maelezo: "Kutia chumvi jambo ili kusisitiza hisia au tukio" },
  { id: "takriri", jina: "Takriri", maelezo: "Kurudia neno au kifungu cha maneno ili kusisitiza wazo" },
];

const MIFANO_MBINU: { sentensi: string; mbinu: string }[] = [
  { sentensi: "Kelele za mvua zilikuwa kama ngoma kubwa ikipigwa angani", mbinu: "tashbiha" },
  { sentensi: "Upepo ulipita ukiimba nyimbo za huzuni kati ya miti", mbinu: "tashihisi" },
  { sentensi: "Alikimbia haraka kiasi cha kuzidi upepo wenyewe", mbinu: "mubalagha" },
  { sentensi: "Alilia, akalia, akalia hadi machozi yakamwishia", mbinu: "takriri" },
  { sentensi: "Macho yake yalikuwa kama nyota mbili zinazomulika gizani", mbinu: "tashbiha" },
  { sentensi: "Mti ule mkongwe ulisimama kwa fahari ukitabasamu kwa jua", mbinu: "tashihisi" },
];

const HATUA_MANDHARI = [
  { id: "chagua", label: "Chagua mahali na wakati tukio litakapofanyika" },
  { id: "hisi", label: "Tumia hisi (kuona, kusikia, kunusa) kuelezea mazingira" },
  { id: "unganisha", label: "Unganisha mandhari na tukio kuu la hadithi" },
  { id: "hakiki", label: "Hakiki kuwa maelezo ya mandhari yanaendana na tukio zima" },
];

const EXCERPT = "Jua kali lilichoma ngozi kama moto uwakao. Miti ilisimama kimya, ikitazama tukio kwa huzuni, huku Kamau akikimbia kwa kasi ya umeme kuelekea nyumbani.";

const MASWALI: { swali: string; sahihi: string; makosa: string[] }[] = [
  {
    swali: "Mbinu za lugha huchangia vipi katika insha ya masimulizi?",
    sahihi: "Huifanya hadithi ivutie zaidi na kujenga taswira wazi akilini mwa msomaji",
    makosa: [
      "Huifanya insha kuwa ndefu bila sababu",
      "Huondoa haja ya kuwa na wahusika",
      "Huifanya lugha kuwa ngumu kueleweka kabisa",
    ],
  },
  {
    swali: "Wahusika bora katika insha ya masimulizi hujengwaje?",
    sahihi: "Kwa kuonyesha matendo, mazungumzo na tabia zao kwa njia inayobainika wazi",
    makosa: [
      "Kwa kutaja majina yao pekee bila maelezo",
      "Kwa kuwaacha bila kuwahusisha na tukio",
      "Kwa kuwapa sifa zinazofanana wote",
    ],
  },
  {
    swali: `Soma sentensi hii: "${EXCERPT}" Ni mbinu gani ya lugha inayoonekana katika "miti ilisimama kimya, ikitazama tukio kwa huzuni"?`,
    sahihi: "Tashihisi, kwa sababu miti imepewa uwezo wa kuona na kuhisi huzuni kama binadamu",
    makosa: [
      "Tashbiha, kwa sababu inalinganisha miti na binadamu kwa 'kama'",
      "Mubalagha, kwa sababu inatia chumvi ukubwa wa miti",
      "Takriri, kwa sababu neno 'miti' limerudiwa",
    ],
  },
  {
    swali: `Katika sentensi "Kamau akikimbia kwa kasi ya umeme kuelekea nyumbani", mbinu iliyotumika ni ipi?`,
    sahihi: "Tashbiha, kwa sababu mwendo wake unalinganishwa na kasi ya umeme",
    makosa: [
      "Tashihisi, kwa sababu Kamau amepewa sifa za kibinadamu",
      "Takriri, kwa sababu neno 'kasi' limerudiwa mara mbili",
      "Hakuna mbinu yoyote iliyotumika hapa",
    ],
  },
];

export const inshaMasimuliziMbinuWahusikaMandhari: Skill = {
  id: "g8-ksw-ka-masimulizi-mbinu-wahusika",
  code: "KA.4",
  subjectId: "kiswahili",
  strandId: "g8-ksw-ka",
  grade: 8,
  title: "Insha za Kubuni: Masimulizi (Mbinu za Lugha, Wahusika na Mandhari)",
  description: "Tambua na tumia mbinu za lugha, ujenzi wa wahusika na mandhari katika insha ya masimulizi.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "mc"] as const);

    if (branch === "match") {
      const tokens = shuffle(rng, MBINU.map((m) => ({ id: m.id, label: m.maelezo })));
      const targets = shuffle(rng, MBINU.map((m) => ({ id: m.id, label: m.jina })));
      const correctMap: Record<string, string> = {};
      for (const m of MBINU) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila mbinu ya lugha na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Tashbiha hulinganisha kwa 'kama'; tashihisi hupa uhai; mubalagha hutia chumvi; takriri hurudia.",
        explanation: MBINU.map((m) => `${m.jina} — ${m.maelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, MIFANO_MBINU).slice(0, 4);
      const bucketIds = Array.from(new Set(chosen.map((c) => c.mbinu)));
      const buckets = bucketIds.map((id) => ({ id, label: MBINU.find((m) => m.id === id)!.jina }));
      const items = chosen.map((c, i) => ({ id: `s${i}`, label: c.sentensi }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`s${i}`] = c.mbinu));
      return {
        kind: "categorize",
        prompt: "Panga kila sentensi kulingana na mbinu ya lugha inayotumika ndani yake.",
        items,
        buckets,
        correctBucket,
        hint: "Angalia kama sentensi inalinganisha kwa 'kama', inapa uhai kitu, inatia chumvi, au inarudia neno.",
        explanation: chosen.map((c) => `"${c.sentensi}" — ${MBINU.find((m) => m.id === c.mbinu)!.jina}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, HATUA_MANDHARI);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kujenga taswira ya mandhari katika insha ya masimulizi.",
        instruction: "Bofya kwa mpangilio sahihi.",
        items,
        correctOrder: HATUA_MANDHARI.map((h) => h.id),
        hint: "Anza kwa kuchagua mahali na wakati, kisha tumia hisi, unganisha na tukio, na uhakiki.",
        explanation: HATUA_MANDHARI.map((h) => h.label).join(" → "),
      };
    }

    const entry = randChoice(rng, MASWALI);
    const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
    return {
      kind: "multiple-choice",
      prompt: entry.swali,
      choices,
      correctIndex: choices.indexOf(entry.sahihi),
      layout: "list",
      hint: "Zingatia mbinu za lugha, jinsi wahusika wanavyojengwa, na mandhari ya tukio.",
      explanation: `Jibu sahihi ni: "${entry.sahihi}".`,
    };
  },
};
