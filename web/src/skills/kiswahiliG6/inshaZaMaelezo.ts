import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;
const KENYAN_PLACES = [
  "Kisumu", "Nakuru", "Machakos", "Kericho", "Nyeri", "Kitale", "Malindi",
  "Garissa", "Meru", "Bungoma", "Kakamega", "Naivasha", "Voi", "Kilifi",
] as const;

const JOZI_SENTENSI: { wazi: string; hafifu: string; mada: string }[] = [
  { wazi: "Wingu jeusi lililojaa mvua lilifunika anga lote, huku radi ikinguruma kwa mbali.", hafifu: "Kulikuwa na wingu angani.", mada: "hali ya hewa" },
  { wazi: "Maji ya kahawia yalimwagika kwa kasi barabarani, yakisomba udongo na mawe madogo.", hafifu: "Kulikuwa na mafuriko.", mada: "majanga" },
  { wazi: "Ardhi ilitikisika kwa ghafla, vitu vikaanguka mezani na watu wakakimbilia nje wakiwa na hofu.", hafifu: "Kulikuwa na tetemeko la ardhi.", mada: "majanga" },
  { wazi: "Bendera ya taifa iliyopepea kwa fahari juu ya mlingoti ilionyesha rangi nyeusi, nyekundu, kijani na nyeupe.", hafifu: "Bendera ilikuwa juu.", mada: "mshikamano wa kitaifa" },
  { wazi: "Watu wa jamii mbalimbali walikutana pamoja wakiimba na kucheza kwa furaha katika sherehe ya kitaifa.", hafifu: "Kulikuwa na sherehe.", mada: "mshikamano wa kitaifa" },
  { wazi: "Barabara ilijaa magari yaliyokwama, huku mvumo wa vipepeo vya magari ukisikika kila mahali baada ya ajali.", hafifu: "Kulikuwa na ajali barabarani.", mada: "ajali" },
  { wazi: "Nchi yetu ina milima mirefu yenye kilele chenye theluji, mabonde mazuri, na mito mikubwa inayotiririka kwa upole.", hafifu: "Nchi yetu ina milima.", mada: "nchi yetu" },
  { wazi: "Watu walisimama kimya, vichwa vikiwa vimeinama, huku moyoni wakiwa na msongo wa mawazo baada ya tukio la kusikitisha.", hafifu: "Watu walikuwa na huzuni.", mada: "msongo wa mawazo" },
];

const HALI_ZA_MAJANGA = [
  { neno: "mmomonyoko wa udongo", maelezo: "udongo unapoondolewa taratibu na maji au upepo, ukiacha ardhi tupu" },
  { neno: "mafuriko", maelezo: "maji mengi yanayofurika na kufunika ardhi kavu, mara nyingi baada ya mvua kubwa" },
  { neno: "mitetemeko ya ardhi", maelezo: "mtikisiko wa ghafla wa ardhi unaotokana na mabadiliko chini ya uso wa dunia" },
  { neno: "kipindupindu", maelezo: "ugonjwa unaosambaa kwa haraka kutokana na maji au chakula kilichochafuliwa" },
];

const HATUA_ZA_UANDISHI = [
  { id: "1", label: "Chagua mada ya insha ya maelezo" },
  { id: "2", label: "Jadili vidokezo vinavyofaa mada hiyo" },
  { id: "3", label: "Chagua vivumishi na vielezi vitakavyotoa picha dhahiri" },
  { id: "4", label: "Andika rasimu ya kwanza" },
  { id: "5", label: "Hakiki na sahihisha kabla ya nakala safi" },
];

export const inshaZaMaelezo: Skill = {
  id: "g6-ksw-ka-insha-za-maelezo",
  code: "KA.5",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ka",
  grade: 6,
  title: "Insha za Maelezo",
  description: "Tambua sentensi zenye maelezo dhahiri na wazi, na uzitofautishe na sentensi hafifu.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-bora", "oanisha-jozi", "panga-ubora", "jaza-maelezo", "panga-hatua"] as const);

    if (branch === "chagua-bora") {
      const j = randChoice(rng, JOZI_SENTENSI);
      const choices = shuffle(rng, [j.wazi, j.hafifu]);
      return {
        kind: "multiple-choice",
        prompt: `Ni sentensi ipi inayotoa maelezo dhahiri na wazi zaidi kuhusu ${j.mada}?`,
        choices,
        correctIndex: choices.indexOf(j.wazi),
        layout: "list",
        hint: "Fikiria ni sentensi ipi inayotumia maelezo mengi zaidi ya kimahsusi (rangi, sauti, hisia).",
        explanation: `Sentensi bora ni: "${j.wazi}" — ina maelezo mengi zaidi ya kimahsusi kuliko sentensi hafifu "${j.hafifu}".`,
      };
    }

    if (branch === "oanisha-jozi") {
      const chosen = shuffle(rng, HALI_ZA_MAJANGA);
      const tokens = chosen.map((h) => ({ id: h.neno, label: h.neno }));
      const targets = shuffle(rng, chosen).map((h) => ({ id: h.neno, label: h.maelezo }));
      const correctMap: Record<string, string> = {};
      for (const h of chosen) correctMap[h.neno] = h.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila neno la janga na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kwa makini kuhusu kila aina ya janga.",
        explanation: chosen.map((h) => `"${h.neno}": ${h.maelezo}.`).join(" "),
      };
    }

    if (branch === "panga-ubora") {
      const chosen = shuffle(rng, JOZI_SENTENSI).slice(0, 3);
      const items = chosen.flatMap((j) => [
        { id: `${j.mada}-wazi`, label: j.wazi, bucket: "wazi" },
        { id: `${j.mada}-hafifu`, label: j.hafifu, bucket: "hafifu" },
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi: je, ni maelezo wazi/dhahiri au hafifu?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "wazi", label: "Maelezo Wazi/Dhahiri" },
          { id: "hafifu", label: "Maelezo Hafifu" },
        ],
        correctBucket,
        hint: "Maelezo wazi hutumia maneno mengi ya kimahsusi kuliko sentensi fupi za jumla.",
        explanation: "Sentensi ndefu zenye maelezo ya kimahsusi ni wazi/dhahiri; sentensi fupi za jumla ni hafifu.",
      };
    }

    if (branch === "jaza-maelezo") {
      const h = randChoice(rng, HALI_ZA_MAJANGA);
      const jina = randChoice(rng, KENYAN_NAMES);
      const mahali = randChoice(rng, KENYAN_PLACES);
      return {
        kind: "fill-blank",
        prompt: `${jina} wa ${mahali} anaandika insha ya maelezo kuhusu majanga. Kamilisha sentensi.`,
        before: `${jina} alieleza kuwa "`,
        after: `" ni janga linalotokea ${mahali} mara kwa mara.`,
        correctAnswer: h.neno,
        inputMode: "text",
        hint: h.maelezo,
        explanation: `Sentensi kamili: "${jina} alieleza kuwa \\"${h.neno}\\" ni janga linalotokea ${mahali} mara kwa mara." — ${h.maelezo}.`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_UANDISHI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kuandika insha ya maelezo kwa mpangilio sahihi.",
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_UANDISHI.map((h) => h.id),
      hint: "Fikiria mchakato wa uandishi kutoka kuchagua mada hadi nakala safi.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_UANDISHI.map((h) => h.label).join(" → "),
    };
  },
};
