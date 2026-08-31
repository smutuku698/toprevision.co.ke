import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const HADITHI_KANINI =
  "Fikiria hadithi ifuatayo: Kanini ni msichana anayeishi na shangazi yake baada ya wazazi wake kufariki. Kila jioni, badala ya kupumzika, Kanini humsaidia shangazi yake kuuza vitumbua sokoni bila kulalamika, hata anapochoka. Siku moja, mteja alimrudishia pesa za ziada alizompa kimakosa, na Kanini alimweleza ukweli badala ya kuzichukua. Shangazi yake humwambia mara kwa mara, 'Wewe ni baraka kwangu, mwanangu,' akionyesha jinsi anavyomthamini Kanini kwa moyo wake mzuri.";

const HADITHI_BARAKA =
  "Fikiria hadithi nyingine: Baraka ni kijana mwenye kiburi anayewadharau wenzake wanaotoka familia maskini shuleni. Siku moja, gari lake linaharibika njiani, na anasaidiwa na Otieno, mmoja wa wanafunzi ambao huwa anawadharau, bila Otieno kumtaka malipo au shukrani. Tukio hilo linamfanya Baraka atambue kosa lake na kuanza kuwaheshimu wenzake wote bila kujali hali zao za kifamilia.";

interface Swali {
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
  passage: string;
}

const MASWALI: Swali[] = [
  {
    prompt: "Kutokana na matendo ya Kanini katika hadithi, ni sifa ipi inayomfaa zaidi?",
    correct: "Mkweli na mchapakazi",
    distractors: ["Mvivu na mlalamikaji", "Mwongo na mchoyo", "Mwenye kiburi"],
    explanation: "Kanini humsaidia shangazi yake bila kulalamika (mchapakazi) na anamweleza mteja ukweli kuhusu pesa za ziada (mkweli).",
    passage: HADITHI_KANINI,
  },
  {
    prompt: "Uhusiano kati ya Kanini na shangazi yake ni upi?",
    correct: "Uhusiano wa upendo na shukrani kati ya mlezi na mtoto",
    distractors: [
      "Uhusiano wa uadui na chuki",
      "Uhusiano wa kibiashara pekee bila hisia",
      "Hawajuani kabisa",
    ],
    explanation: "Shangazi humwita Kanini 'baraka' na kumthamini, jambo linaloonyesha uhusiano wa upendo kati ya mlezi na mtoto aliyeachwa yatima.",
    passage: HADITHI_KANINI,
  },
  {
    prompt: "Ni funzo lipi tunalopata kutokana na matendo ya Kanini?",
    correct: "Ukweli na uchapakazi huleta heshima na upendo",
    distractors: [
      "Ni bora kuchukua chochote kinachopatikana bila kuuliza",
      "Kufanya kazi kwa bidii hakuna maana yoyote",
      "Watoto yatima hawawezi kufanikiwa kamwe",
    ],
    explanation: "Kwa kurejesha pesa za ziada na kufanya kazi bila kulalamika, Kanini anaonyesha jinsi ukweli na uchapakazi vinavyoleta heshima na upendo.",
    passage: HADITHI_KANINI,
  },
  {
    prompt: "Kutokana na tabia yake mwanzoni mwa hadithi, ni sifa ipi inayomfaa Baraka?",
    correct: "Mwenye kiburi na anayedharau wenzake",
    distractors: ["Mnyenyekevu na mkarimu", "Mwoga na mkimya", "Mzembe wa masomo"],
    explanation: "Baraka anaelezwa kuwa \"kijana mwenye kiburi anayewadharau wenzake wanaotoka familia maskini\".",
    passage: HADITHI_BARAKA,
  },
  {
    prompt: "Uhusiano kati ya Baraka na Otieno unabadilikaje katika hadithi?",
    correct: "Unabadilika kutoka dharau hadi heshima baada ya tukio la ukarimu",
    distractors: [
      "Unabaki wa uadui hadi mwisho wa hadithi",
      "Haubadiliki kwa vyovyote",
      "Unabadilika kutoka urafiki hadi uadui",
    ],
    explanation: "Baraka awali alimdharau Otieno, lakini baada ya Otieno kumsaidia bila malipo, Baraka anaanza kumheshimu.",
    passage: HADITHI_BARAKA,
  },
  {
    prompt: "Ni funzo lipi tunalopata kutokana na matendo ya Otieno kumsaidia Baraka?",
    correct: "Hatupaswi kuwahukumu watu kwa hali zao za kifamilia; wema hauhitaji malipo",
    distractors: [
      "Ni bora kusaidia watu wanaokuheshimu pekee",
      "Msaada unapaswa kutolewa kwa malipo kila wakati",
      "Watu wenye kiburi hawabadiliki kamwe",
    ],
    explanation: "Otieno anamsaidia Baraka bila kutaka malipo licha ya kudharauliwa naye, jambo linaloonyesha wema hauhitaji malipo wala kujali hali ya mtu.",
    passage: HADITHI_BARAKA,
  },
];

const WAHUSIKA_MATCH: { jina: string; maelezo: string }[] = [
  { jina: "Kanini", maelezo: "Msichana mkweli na mchapakazi anayemsaidia shangazi yake kuuza vitumbua" },
  { jina: "Shangazi", maelezo: "Mlezi mwenye shukrani anayemthamini Kanini kwa moyo wake mzuri" },
  { jina: "Baraka", maelezo: "Kijana mwenye kiburi anayebadilika baada ya kusaidiwa na mwenzake" },
  { jina: "Otieno", maelezo: "Mwanafunzi mkarimu asiyebagua wenzake kutokana na hali zao za kifamilia" },
];

const TABIA_ITEMS: { label: string; njema: boolean }[] = [
  { label: "Kanini kumrudishia mteja pesa za ziada badala ya kuzichukua", njema: true },
  { label: "Kanini kumsaidia shangazi yake kila jioni bila kulalamika", njema: true },
  { label: "Otieno kumsaidia Baraka bila kutaka malipo wala shukrani", njema: true },
  { label: "Baraka kuwadharau wenzake wanaotoka familia maskini", njema: false },
  { label: "Baraka kukataa kuwaheshimu wenzake mwanzoni mwa hadithi", njema: false },
];

const MATUKIO_KANINI = [
  { id: "t1", label: "Kanini humsaidia shangazi yake kuuza vitumbua kila jioni" },
  { id: "t2", label: "Mteja anampa Kanini pesa za ziada kimakosa" },
  { id: "t3", label: "Kanini anamweleza mteja ukweli badala ya kuchukua pesa" },
  { id: "t4", label: "Shangazi anamsifu Kanini kwa moyo wake mzuri" },
];

export const novelaWahusika: Skill = {
  id: "g7-ksw-ks-novela-wahusika",
  code: "KS.10",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Kusoma kwa Kina: Wahusika",
  description: "Tambua wahusika, ujadili sifa zao kutokana na matendo yao, ueleze uhusiano kati yao, na ubaini mafunzo yanayotokana na matendo yao.",
  generate(rng) {
    const branch = randChoice(rng, ["swali", "match", "tabia", "fill", "order"] as const);
    const hint = "Tabia za wahusika hujitokeza kupitia matendo na maneno yao katika hadithi, si maelezo ya moja kwa moja tu.";

    if (branch === "order") {
      const items = shuffle(rng, MATUKIO_KANINI);
      return {
        kind: "ordering",
        passage: HADITHI_KANINI,
        prompt: "Panga matukio ya hadithi ya Kanini jinsi yalivyotokea.",
        instruction: "Bofya matukio kwa mfuatano sahihi.",
        items,
        correctOrder: MATUKIO_KANINI.map((m) => m.id),
        hint: "Fikiria kile kilichotokea kwanza, kisha kilichofuata, hadi mwisho wa hadithi.",
        explanation: MATUKIO_KANINI.map((m) => m.label).join(" → "),
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, WAHUSIKA_MATCH.map((w) => ({ id: w.jina, label: w.jina })));
      const targets = shuffle(rng, WAHUSIKA_MATCH.map((w) => ({ id: w.jina, label: w.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const w of WAHUSIKA_MATCH) correctMap[w.jina] = w.jina;
      return {
        kind: "click-match",
        prompt: "Oanisha kila mhusika na maelezo yanayomfaa kutokana na matendo yake katika hadithi.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: WAHUSIKA_MATCH.map((w) => `${w.jina} — ${w.maelezo}.`).join(" "),
      };
    }

    if (branch === "tabia") {
      const items = TABIA_ITEMS.map((t, i) => ({ id: `tb${i}`, label: t.label, b: t.njema ? "njema" : "mbaya" }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
      return {
        kind: "categorize",
        prompt: "Panga kila tendo kama tabia njema au tabia mbaya ya mhusika.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "njema", label: "Tabia Njema" },
          { id: "mbaya", label: "Tabia Mbaya" },
        ],
        correctBucket,
        hint,
        explanation: TABIA_ITEMS.map((t) => `"${t.label}" ni tabia ${t.njema ? "njema" : "mbaya"}.`).join(" "),
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu wahusika.",
        before: "Mtu anayefanya kazi kwa bidii bila kulalamika huitwa",
        after: ".",
        correctAnswer: "mchapakazi",
        inputMode: "text",
        hint: "Fikiria neno linaloelezea mtu ambaye hachoki kufanya kazi.",
        explanation: "Mchapakazi ni mtu anayefanya kazi kwa bidii na uvumilivu, bila kulalamika.",
      };
    }

    const swali = randChoice(rng, MASWALI);
    const choices = shuffle(rng, [swali.correct, ...swali.distractors]);
    return {
      kind: "multiple-choice",
      passage: swali.passage,
      prompt: swali.prompt,
      choices,
      correctIndex: choices.indexOf(swali.correct),
      layout: "list",
      hint,
      explanation: swali.explanation,
    };
  },
};
