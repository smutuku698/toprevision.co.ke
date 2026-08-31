import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// mada 6.2.1: kusoma kwa kina mchezo wa kuigiza — wahusika, mazungumzo, maelekezo — kwa mfano wa
// hati kuhusu wanyama wa majini (kiboko, samaki, mamba, chura, kasa) na wengine wanaowaongezea.

type Makazi = "baridi" | "chumvi" | "wote";

interface Mnyama {
  jina: string;
  maelezo: string;
  makazi: Makazi;
}

const WANYAMA: Mnyama[] = [
  { jina: "Kiboko", maelezo: "mnyama mkubwa mwenye ngozi nzito anayeishi majini na nchi kavu, hutoka usiku kula majani ufukoni", makazi: "baridi" },
  { jina: "Mamba", maelezo: "mwindaji mkali mwenye meno makali anayeishi majini na nchi kavu, hutaga mayai ufukoni mwa mto", makazi: "baridi" },
  { jina: "Chura", maelezo: "mnyama mdogo anayeishi majini akiwa kiluwiluwi kisha nchi kavu akiwa mkubwa, huruka kwa miguu yenye nguvu", makazi: "baridi" },
  { jina: "Kambare", maelezo: "samaki mwenye ndevu ndefu anayeishi mtoni au ziwani, hutafuta chakula usiku chini ya matope", makazi: "baridi" },
  { jina: "Papa", maelezo: "mwindaji mkali wa baharini mwenye meno mengi makali na mwili mrefu wenye nguvu", makazi: "chumvi" },
  { jina: "Pomboo", maelezo: "mamalia wa baharini mwenye akili nyingi, hupumua kwa mapafu na huogelea kwa makundi", makazi: "chumvi" },
  { jina: "Nyangumi", maelezo: "mamalia mkubwa zaidi baharini, hupumua kwa mapafu na hutoa maji kwa tundu lililo juu ya kichwa", makazi: "chumvi" },
  { jina: "Kaa", maelezo: "mnyama mdogo wa ukingoni mwa bahari mwenye miguu minane na makucha mawili, hutembea kwa kando", makazi: "chumvi" },
  { jina: "Samaki", maelezo: "mnyama mwenye mapezi na magamba anayepumua kwa matamvua, hupatikana mtoni, ziwani na baharini", makazi: "wote" },
  { jina: "Kasa", maelezo: "mnyama mwenye gamba gumu mgongoni, baadhi huishi baharini na wengine huishi mito na maziwa", makazi: "wote" },
];

const AINA_LABELS: Record<Makazi, string> = {
  baridi: "Maji Baridi (mto/ziwa)",
  chumvi: "Maji ya Chumvi (bahari)",
  wote: "Wote Wawili",
};

interface Kipengele {
  neno: string;
  maana: string;
}

const VIPENGELE: Kipengele[] = [
  { neno: "wahusika", maana: "watu au wanyama wanaoshiriki katika hadithi ya mchezo wa kuigiza" },
  { neno: "mazungumzo", maana: "maneno wanayosema wahusika wakizungumza wao kwa wao katika mchezo" },
  { neno: "maelekezo", maana: "maagizo yanayoelezea vitendo, mienendo au mandhari, kwa kawaida yakiwa ndani ya mabano" },
];

interface Sehemu {
  matini: string;
  aina: "wahusika" | "mazungumzo" | "maelekezo";
}

const SEHEMU_ZA_HATI: Sehemu[] = [
  { matini: "KIBOKO:", aina: "wahusika" },
  { matini: "SAMAKI:", aina: "wahusika" },
  { matini: "MAMBA:", aina: "wahusika" },
  { matini: "CHURA:", aina: "wahusika" },
  { matini: "KASA:", aina: "wahusika" },
  { matini: "PAPA:", aina: "wahusika" },
  { matini: "POMBOO:", aina: "wahusika" },
  { matini: "\"Habari za asubuhi, rafiki yangu?\"", aina: "mazungumzo" },
  { matini: "\"Leo maji ni baridi sana, twende tukaogelee!\"", aina: "mazungumzo" },
  { matini: "\"Nimemwona mvuvi karibu na ufuo, tujihadhari.\"", aina: "mazungumzo" },
  { matini: "\"Asante kwa kunisaidia kutafuta chakula.\"", aina: "mazungumzo" },
  { matini: "\"Twende tukacheze karibu na miamba.\"", aina: "mazungumzo" },
  { matini: "\"Nashukuru kwa ushauri wako.\"", aina: "mazungumzo" },
  { matini: "\"Tuwe waangalifu, mamba anakuja!\"", aina: "mazungumzo" },
  { matini: "(Kiboko anatoka majini polepole na kuelekea nyasini)", aina: "maelekezo" },
  { matini: "(Samaki anaogelea kwa haraka kuzunguka mwamba)", aina: "maelekezo" },
  { matini: "(Mamba anajificha chini ya maji akisubiri mawindo)", aina: "maelekezo" },
  { matini: "(Chura anaruka kutoka jani moja hadi jingine)", aina: "maelekezo" },
  { matini: "(Kasa anatembea taratibu ufukoni)", aina: "maelekezo" },
  { matini: "(Wanyama wote wanatazamana kwa mshangao)", aina: "maelekezo" },
  { matini: "(Sauti ya mawimbi ya bahari inasikika mbali)", aina: "maelekezo" },
];

interface Tukio {
  jina: string;
  matukio: { id: string; label: string }[];
}

const MATUKIO_YA_HATI: Tukio[] = [
  {
    jina: "hatari",
    matukio: [
      { id: "e1", label: "Kiboko anatoka majini na kuwasalimu wanyama wenzake" },
      { id: "e2", label: "Samaki anamweleza Kiboko kuhusu mvuvi aliyemwona karibu" },
      { id: "e3", label: "Mamba anashauri wanyama wote wajifiche chini ya maji" },
      { id: "e4", label: "Chura anaruka haraka kuelekea nyasini kujificha" },
      { id: "e5", label: "Kasa anawaongoza wanyama wote mahali salama" },
    ],
  },
  {
    jina: "sherehe",
    matukio: [
      { id: "e1", label: "Pomboo anatangaza kuwa mvua ya kwanza imenyesha" },
      { id: "e2", label: "Papa anawaita samaki wote kwenye mkusanyiko baharini" },
      { id: "e3", label: "Nyangumi anaimba wimbo wa furaha kuashiria sherehe" },
      { id: "e4", label: "Kaa anatayarisha mahali pa sherehe ukingoni mwa bahari" },
      { id: "e5", label: "Wanyama wote wanacheza na kufurahia mvua mpya" },
    ],
  },
];

interface FillTpl {
  before: string;
  after: string;
  correctAnswer: string;
  explanation: string;
}

const FILL_TEMPLATES: FillTpl[] = [
  {
    before: "Maneno anayoyasema mhusika akizungumza na wenzake ndani ya mchezo wa kuigiza huitwa",
    after: ".",
    correctAnswer: "mazungumzo",
    explanation: "Mazungumzo ni maneno wanayosema wahusika wakizungumza wao kwa wao.",
  },
  {
    before: "Maagizo yanayoelezea vitendo au mandhari ya jukwaani, kwa kawaida yakiwa ndani ya mabano, huitwa",
    after: ".",
    correctAnswer: "maelekezo",
    explanation: "Maelekezo huelezea vitendo, mienendo au mandhari — kwa kawaida huandikwa ndani ya mabano.",
  },
  {
    before: "Watu au wanyama wanaoshiriki katika hadithi ya mchezo wa kuigiza huitwa",
    after: ".",
    correctAnswer: "wahusika",
    explanation: "Wahusika ni watu au wanyama wanaoshiriki katika hadithi ya mchezo.",
  },
  {
    before: "(",
    after: "anaogelea kwa haraka kuzunguka mwamba, akimkimbia mwindaji.)",
    correctAnswer: "Samaki",
    explanation: "Sentensi hii ni maelekezo ya jukwaani yanayoelezea kitendo cha Samaki.",
  },
  {
    before: "(",
    after: "anajificha chini ya maji akisubiri mawindo yake.)",
    correctAnswer: "Mamba",
    explanation: "Maelekezo haya yanaelezea kitendo cha Mamba wakati wa kuwinda.",
  },
  {
    before: "(",
    after: "anaruka kutoka jani moja hadi jingine kwa nguvu.)",
    correctAnswer: "Chura",
    explanation: "Maelekezo haya yanaelezea jinsi Chura anavyoruka.",
  },
  {
    before: "(",
    after: "anatembea taratibu ufukoni akitafuta mahali pa kutagia mayai.)",
    correctAnswer: "Kasa",
    explanation: "Maelekezo haya yanaelezea tabia ya Kasa ufukoni.",
  },
  {
    before: "SAMAKI: Asante kwa kunisaidia kutafuta",
    after: "leo.",
    correctAnswer: "chakula",
    explanation: "Katika muktadha huu, Samaki anamshukuru mwenzake kwa msaada wa kutafuta chakula.",
  },
  {
    before: "KASA: Twende tukacheze karibu na",
    after: "kabla jua halijazama.",
    correctAnswer: "miamba",
    explanation: "Neno linalofaa hapa ni 'miamba', mahali wanapopenda kucheza wanyama hao.",
  },
  {
    before: "Mnyama anayeishi majini na nchi kavu, mwenye ngozi nzito na anayekula majani, anaitwa",
    after: ".",
    correctAnswer: "kiboko",
    explanation: "Maelezo haya yanamhusu kiboko — mnyama mkubwa wa majini na nchi kavu anayekula majani.",
  },
  {
    before: "Mnyama wa baharini ambaye ni mamalia, hupumua kwa mapafu na hutoa maji kwa tundu la juu ya kichwa, anaitwa",
    after: ".",
    correctAnswer: "nyangumi",
    explanation: "Maelezo haya yanamhusu nyangumi — mamalia mkubwa zaidi baharini.",
  },
  {
    before: "Mnyama mdogo wa ukingoni mwa bahari mwenye miguu minane na makucha mawili, anayetembea kwa kando, anaitwa",
    after: ".",
    correctAnswer: "kaa",
    explanation: "Maelezo haya yanamhusu kaa, anayejulikana kwa kutembea kwa kando.",
  },
];

export const mchezoWaKuigiza: Skill = {
  id: "g6-ksw-ks-mchezo-wa-kuigiza",
  code: "KS.6",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ks",
  grade: 6,
  title: "Kusoma kwa Kina: Mchezo wa Kuigiza",
  description: "Soma hati ya mchezo wa kuigiza kuhusu wanyama wa majini kisha utambue wahusika, mazungumzo na maelekezo, na ujifunze kuhusu wanyama hao na makazi yao.",
  generate(rng) {
    const branch = randChoice(rng, ["kipengele", "mnyama", "mnyama-match", "sehemu-match", "makazi", "fill", "order"] as const);
    const hint = "Wahusika ni wanaozungumza, mazungumzo ni maneno wanayosema, na maelekezo ni maagizo ya vitendo/mandhari, kwa kawaida ndani ya mabano.";

    if (branch === "kipengele") {
      const sehemu = randChoice(rng, SEHEMU_ZA_HATI);
      const ainaLabel: Record<string, string> = { wahusika: "Wahusika", mazungumzo: "Mazungumzo", maelekezo: "Maelekezo" };
      const choices = shuffle(rng, ["Wahusika", "Mazungumzo", "Maelekezo"]);
      const correctText = ainaLabel[sehemu.aina];
      return {
        kind: "multiple-choice",
        prompt: `Katika hati ya mchezo wa kuigiza, sehemu hii — ${sehemu.matini} — ni mfano wa kipengele gani?`,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "row",
        hint,
        explanation: `"${sehemu.matini}" ni mfano wa ${correctText.toLowerCase()} — ${VIPENGELE.find((v) => v.neno === sehemu.aina)!.maana}.`,
      };
    }

    if (branch === "mnyama") {
      const mnyama = randChoice(rng, WANYAMA);
      const cluster = WANYAMA.filter((w) => w.makazi === mnyama.makazi && w.jina !== mnyama.jina);
      const otherCluster = WANYAMA.filter((w) => w.makazi !== mnyama.makazi && w.jina !== mnyama.jina);
      const distractors = shuffle(rng, cluster).slice(0, 2);
      while (distractors.length < 3) {
        const pick = randChoice(rng, otherCluster);
        if (!distractors.includes(pick)) distractors.push(pick);
      }
      const choices = shuffle(rng, [mnyama.jina, ...distractors.slice(0, 3).map((d) => d.jina)]);
      return {
        kind: "multiple-choice",
        prompt: `Mnyama huyu ${mnyama.maelezo}. Ni mnyama gani anayeelezwa hapa?`,
        choices,
        correctIndex: choices.indexOf(mnyama.jina),
        layout: "row",
        hint: "Zingatia makazi na tabia zilizotajwa kwenye maelezo kabla ya kuchagua.",
        explanation: `${mnyama.jina} ${mnyama.maelezo}.`,
      };
    }

    if (branch === "mnyama-match") {
      const chosen = shuffle(rng, WANYAMA).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.jina, label: w.jina })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.jina, label: w.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.jina] = w.jina;
      return {
        kind: "click-match",
        prompt: "Oanisha kila mnyama wa majini na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Zingatia makazi na tabia za kila mnyama zilizotajwa katika maelezo.",
        explanation: chosen.map((w) => `${w.jina} — ${w.maelezo}.`).join(" "),
      };
    }

    if (branch === "sehemu-match") {
      const chosen = shuffle(rng, SEHEMU_ZA_HATI).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.matini, bucket: s.aina }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila sehemu ya hati kama wahusika, mazungumzo au maelekezo.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "wahusika", label: "Wahusika" },
          { id: "mazungumzo", label: "Mazungumzo" },
          { id: "maelekezo", label: "Maelekezo" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((s) => `"${s.matini}" ni ${s.aina}.`).join(" "),
      };
    }

    if (branch === "makazi") {
      const items = WANYAMA.map((w, i) => ({ id: `w${i}`, label: `${w.jina} — ${w.maelezo}`, bucket: w.makazi }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila mnyama wa majini kulingana na makazi yake — maji baridi, maji ya chumvi, au wote wawili.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "baridi", label: AINA_LABELS.baridi },
          { id: "chumvi", label: AINA_LABELS.chumvi },
          { id: "wote", label: AINA_LABELS.wote },
        ],
        correctBucket,
        hint: "Kiboko, mamba, chura na kambare huishi maji baridi; papa, pomboo, nyangumi na kaa huishi maji ya chumvi; samaki na kasa hupatikana katika maji yote mawili.",
        explanation: WANYAMA.map((w) => `${w.jina} huishi ${AINA_LABELS[w.makazi].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const tpl = randChoice(rng, FILL_TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi ifuatayo kutoka kwa hati ya mchezo wa kuigiza au maelezo ya mnyama.",
        before: tpl.before,
        after: tpl.after,
        correctAnswer: tpl.correctAnswer,
        inputMode: "text",
        hint,
        explanation: tpl.explanation,
      };
    }

    const tukio = randChoice(rng, MATUKIO_YA_HATI);
    return {
      kind: "ordering",
      prompt: "Panga matukio yafuatayo ya onyesho fupi la wanyama wa majini kwa mfuatano sahihi.",
      instruction: "Bofya matukio kwa mfuatano yalivyotokea.",
      items: shuffle(rng, tukio.matukio),
      correctOrder: tukio.matukio.map((m) => m.id),
      hint: "Fikiria jinsi tukio moja linavyosababisha lifuatalo katika hadithi.",
      explanation: tukio.matukio.map((m) => m.label).join(" → "),
    };
  },
};
