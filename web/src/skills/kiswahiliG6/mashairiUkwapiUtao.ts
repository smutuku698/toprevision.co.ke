import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// mada 5.2.1: istilahi za muundo wa shairi la kimapokeo — ukwapi, utao, tathnia, tathlitha, tarbia.

interface Mstari {
  ukwapi: string;
  utao: string;
  mada: string;
}

const MISTARI: Mstari[] = [
  { ukwapi: "Elimu ni taa yangu", utao: "huniangazia njia", mada: "elimu" },
  { ukwapi: "Mvua ikinyesha sana", utao: "mimea yastawi vema", mada: "kilimo" },
  { ukwapi: "Mwanafunzi mwenye bidii", utao: "hufaulu mtihanini", mada: "bidii" },
  { ukwapi: "Ukweli daima washinda", utao: "uongo huwa dhaifu", mada: "maadili" },
  { ukwapi: "Jua huchomoza mashariki", utao: "na kutua magharibi", mada: "mazingira" },
  { ukwapi: "Mkulima wa Nakuru", utao: "hulima shamba lake", mada: "kilimo" },
  { ukwapi: "Watoto wa shule ya msingi", utao: "husoma kwa bidii", mada: "elimu" },
  { ukwapi: "Nchi yetu ya Kenya", utao: "ina milima na mabonde", mada: "nchi" },
  { ukwapi: "Rafiki wa kweli hukusaidia", utao: "hata wakati wa shida", mada: "urafiki" },
  { ukwapi: "Samaki wa Ziwa Victoria", utao: "huvuliwa na wavuvi", mada: "uvuvi" },
  { ukwapi: "Mchezaji hodari wa mpira", utao: "hufanya mazoezi kila siku", mada: "michezo" },
  { ukwapi: "Nyumba iliyojengwa imara", utao: "haiwezi kuanguka upesi", mada: "ujenzi" },
  { ukwapi: "Mama humpenda mwanawe", utao: "kwa moyo wake wote", mada: "familia" },
  { ukwapi: "Ndege wa angani huruka", utao: "kutafuta chakula chao", mada: "wanyamapori" },
  { ukwapi: "Bidii ni ufunguo", utao: "wa mafanikio maishani", mada: "maadili" },
];

interface Ubeti {
  aina: "tathnia" | "tathlitha" | "tarbia";
  mistari: string[];
  mada: string;
}

const BETI: Ubeti[] = [
  { aina: "tathnia", mada: "elimu", mistari: ["Elimu ni mwanga watanguliao,", "hutuongoza njiani tuendako."] },
  { aina: "tathnia", mada: "mazingira", mistari: ["Mvua ni baraka kwa nchi yetu,", "hulisha mimea na wanyama wetu."] },
  { aina: "tathnia", mada: "familia", mistari: ["Mtoto mtiifu huwapa wazazi furaha,", "na baraka humfuata kila mahali."] },
  { aina: "tathnia", mada: "maadili", mistari: ["Kazi ngumu haiogopeshi shujaa,", "mwishoni huja ushindi na thawabu."] },
  { aina: "tathlitha", mada: "mazingira", mistari: ["Jua huchomoza mashariki kila siku,", "hutupasha joto na mwanga wa uzuri,", "na hutua magharibi bila shaka."] },
  { aina: "tathlitha", mada: "kilimo", mistari: ["Mkulima hulima shamba lake kwa bidii,", "hupanda mbegu akitarajia mavuno,", "na huvuna matunda ya jasho lake."] },
  { aina: "tathlitha", mada: "urafiki", mistari: ["Rafiki wa kweli husimama nawe,", "hata wakati mambo yakiwa magumu,", "na hukusaidia bila kuchoka."] },
  { aina: "tathlitha", mada: "elimu", mistari: ["Watoto wa shule huamka mapema,", "huvaa sare zao kwa haraka,", "kisha huenda shuleni kwa furaha."] },
  { aina: "tarbia", mada: "nchi", mistari: ["Kenya ni nchi yenye utajiri mkubwa,", "ina milima, mabonde na tambarare,", "ina wanyama na mimea ya ajabu,", "tunaipenda na kuithamini sana."] },
  { aina: "tarbia", mada: "elimu", mistari: ["Elimu ni ufunguo wa maisha bora,", "huleta nuru katika akili za watu,", "hufungua milango ya fursa nyingi,", "kila mtoto anastahili kuipata."] },
  { aina: "tarbia", mada: "umoja", mistari: ["Umoja ni nguvu kwa jamii yoyote,", "watu wakisaidiana hufanikiwa,", "migogoro hupungua na amani hutawala,", "maendeleo huja kwa kasi zaidi."] },
  { aina: "tarbia", mada: "uvuvi", mistari: ["Mvuvi wa Ziwa Naivasha huamka alfajiri,", "huchukua nyavu zake kuelekea ziwani,", "huvua samaki kwa uvumilivu mkubwa,", "na kuwauza sokoni kupata riziki."] },
];

const MISTILAHI: { neno: string; label: string; maana: string; idadiMistari?: number }[] = [
  { neno: "ukwapi", label: "Ukwapi", maana: "sehemu ya kwanza (nusu ya kwanza) ya mstari mmoja wa shairi, kabla ya kituo cha kati" },
  { neno: "utao", label: "Utao", maana: "sehemu ya pili (nusu ya pili) ya mstari mmoja wa shairi, baada ya kituo cha kati" },
  { neno: "tathnia", label: "Tathnia", maana: "aina ya ubeti wa shairi wenye mistari miwili tu", idadiMistari: 2 },
  { neno: "tathlitha", label: "Tathlitha", maana: "aina ya ubeti wa shairi wenye mistari mitatu", idadiMistari: 3 },
  { neno: "tarbia", label: "Tarbia", maana: "aina ya ubeti wa shairi wenye mistari minne", idadiMistari: 4 },
];

interface FillTpl {
  before: string;
  after: string;
  correctAnswer: string;
  explanation: string;
}

const FILL_TEMPLATES: FillTpl[] = [
  {
    before: "Sehemu ya kwanza ya mstari wa shairi, kabla ya kituo cha kati, huitwa",
    after: ".",
    correctAnswer: "ukwapi",
    explanation: "Ukwapi ni nusu ya kwanza ya mstari wa shairi, kabla ya kituo/mpumuo wa kati.",
  },
  {
    before: "Katika mstari mmoja wa shairi, nusu ya kwanza huitwa",
    after: "wakati nusu ya pili huitwa utao.",
    correctAnswer: "ukwapi",
    explanation: "Mstari wa shairi hugawanyika sehemu mbili — ukwapi (nusu ya kwanza) na utao (nusu ya pili).",
  },
  {
    before: "Sehemu ya pili ya mstari wa shairi, baada ya kituo cha kati, huitwa",
    after: ".",
    correctAnswer: "utao",
    explanation: "Utao ni nusu ya pili ya mstari wa shairi, baada ya kituo/mpumuo wa kati.",
  },
  {
    before: "Katika mstari wa shairi wenye vipande viwili, kipande cha mwisho huitwa",
    after: ".",
    correctAnswer: "utao",
    explanation: "Kipande cha mwisho cha mstari (baada ya ukwapi) ni utao.",
  },
  {
    before: "Ubeti wa shairi wenye mistari miwili tu huitwa",
    after: ".",
    correctAnswer: "tathnia",
    explanation: "Tathnia ni ubeti wenye mistari miwili pekee.",
  },
  {
    before: "Jina la ubeti unaoundwa na mistari miwili pekee ni",
    after: ".",
    correctAnswer: "tathnia",
    explanation: "Ubeti wa mistari miwili huitwa tathnia — idadi ndogo zaidi ya mistari kati ya beti hizi tatu.",
  },
  {
    before: "Ubeti wa shairi wenye mistari mitatu huitwa",
    after: ".",
    correctAnswer: "tathlitha",
    explanation: "Tathlitha ni ubeti wenye mistari mitatu.",
  },
  {
    before: "Jina la ubeti unaoundwa na mistari mitatu ni",
    after: ".",
    correctAnswer: "tathlitha",
    explanation: "Ubeti wa mistari mitatu huitwa tathlitha — kati ya tathnia (miwili) na tarbia (minne).",
  },
  {
    before: "Ubeti wa shairi wenye mistari minne huitwa",
    after: ".",
    correctAnswer: "tarbia",
    explanation: "Tarbia ni ubeti wenye mistari minne.",
  },
  {
    before: "Jina la ubeti unaoundwa na mistari minne ni",
    after: ".",
    correctAnswer: "tarbia",
    explanation: "Ubeti wa mistari minne huitwa tarbia — mkubwa zaidi kati ya beti hizi tatu.",
  },
];

const ORDER_PROMPTS = [
  "Panga aina hizi tatu za beti kwa mfuatano wa kuongezeka kwa idadi ya mistari, kuanzia ndogo zaidi.",
  "Aina hizi tatu za ubeti zina idadi tofauti za mistari. Zipange kutoka yenye mistari michache zaidi hadi mingi zaidi.",
];

export const mashairiUkwapiUtao: Skill = {
  id: "g6-ksw-ks-mashairi-ukwapi-utao",
  code: "KS.5",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ks",
  grade: 6,
  title: "Kusoma kwa Ufahamu: Mashairi",
  description: "Tambua ukwapi na utao katika mstari wa shairi, na ujue aina za beti — tathnia, tathlitha na tarbia — kulingana na idadi ya mistari.",
  generate(rng) {
    const branch = randChoice(rng, ["ukwapiUtao", "hesabuMistari", "categorize", "match", "fill", "order"] as const);
    const hint = "Kumbuka: ukwapi ni nusu ya kwanza ya mstari, utao ni nusu ya pili; tathnia=mistari 2, tathlitha=mistari 3, tarbia=mistari 4.";

    if (branch === "ukwapiUtao") {
      const mstari = randChoice(rng, MISTARI);
      const showUkwapi = rng() < 0.5;
      const portion = showUkwapi ? mstari.ukwapi : mstari.utao;
      const correctTerm = showUkwapi ? "Ukwapi" : "Utao";
      const otherHalf = showUkwapi ? "Utao" : "Ukwapi";
      const extras = shuffle(rng, MISTILAHI.map((m) => m.label).filter((l) => l !== "Ukwapi" && l !== "Utao")).slice(0, 2);
      const choices = shuffle(rng, [correctTerm, otherHalf, ...extras]);
      return {
        kind: "multiple-choice",
        prompt: `Katika mstari wa shairi "${mstari.ukwapi}, ${mstari.utao}", sehemu "${portion}" inaitwaje?`,
        choices,
        correctIndex: choices.indexOf(correctTerm),
        layout: "list",
        hint,
        explanation: `"${portion}" ni ${showUkwapi ? "nusu ya kwanza (ukwapi)" : "nusu ya pili (utao)"} ya mstari huo. Mstari kamili ni "${mstari.ukwapi}, ${mstari.utao}".`,
      };
    }

    if (branch === "hesabuMistari") {
      const ubeti = randChoice(rng, BETI);
      const ainaLabel = ubeti.aina === "tathnia" ? "Tathnia" : ubeti.aina === "tathlitha" ? "Tathlitha" : "Tarbia";
      const choices = shuffle(rng, ["Tathnia", "Tathlitha", "Tarbia"]);
      const passage = ubeti.mistari.join("\n");
      return {
        kind: "multiple-choice",
        passage,
        prompt: "Soma ubeti huu kisha uhesabu mistari yake. Ni aina gani ya ubeti, kwa kuzingatia idadi ya mistari?",
        choices,
        correctIndex: choices.indexOf(ainaLabel),
        layout: "row",
        hint: "Hesabu mistari ya ubeti: mistari 2=tathnia, mistari 3=tathlitha, mistari 4=tarbia.",
        explanation: `Ubeti huu una mistari ${ubeti.mistari.length}, hivyo ni ${ainaLabel.toLowerCase()}.`,
      };
    }

    if (branch === "categorize") {
      const items = BETI.map((b, i) => ({ id: `b${i}`, label: b.mistari.join(" / "), bucket: b.aina }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila ubeti kulingana na aina yake — tathnia, tathlitha au tarbia — kwa kuzingatia idadi ya mistari.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "tathnia", label: "Tathnia (mistari 2)" },
          { id: "tathlitha", label: "Tathlitha (mistari 3)" },
          { id: "tarbia", label: "Tarbia (mistari 4)" },
        ],
        correctBucket,
        hint,
        explanation: BETI.map((b) => `Ubeti "${b.mistari[0]}" una mistari ${b.mistari.length}, hivyo ni ${b.aina}.`).join(" "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, MISTILAHI.map((m) => ({ id: m.neno, label: m.label })));
      const targets = shuffle(rng, MISTILAHI.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of MISTILAHI) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila istilahi ya muundo wa shairi na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: MISTILAHI.map((m) => `${m.label} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const tpl = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu istilahi za muundo wa shairi.",
        before: tpl.before,
        after: tpl.after,
        correctAnswer: tpl.correctAnswer,
        inputMode: "text",
        hint,
        explanation: tpl.explanation,
      };
    }

    const items = shuffle(
      rng,
      MISTILAHI.filter((m) => m.idadiMistari).map((m) =>
        rng() < 0.5
          ? { id: m.neno, label: `${m.label} — ubeti wenye mistari ${m.idadiMistari}` }
          : { id: m.neno, label: m.label }
      )
    );
    return {
      kind: "ordering",
      prompt: randChoice(rng, ORDER_PROMPTS),
      instruction: "Bofya aina za beti kwa mfuatano sahihi.",
      items,
      correctOrder: ["tathnia", "tathlitha", "tarbia"],
      hint: "Tathnia ina mistari 2, tathlitha ina mistari 3, tarbia ina mistari 4 — panga kutoka ndogo hadi kubwa.",
      explanation: "Tathnia (mistari 2) → Tathlitha (mistari 3) → Tarbia (mistari 4): mfuatano wa kuongezeka kwa idadi ya mistari.",
    };
  },
};
