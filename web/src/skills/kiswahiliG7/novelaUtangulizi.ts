import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const ISTILAHI: { neno: string; maana: string }[] = [
  { neno: "Riwaya", maana: "Kazi ndefu ya kubuni yenye wahusika wengi, visa vingi na maudhui mengi, huchapishwa kama kitabu kikubwa" },
  { neno: "Novela", maana: "Kazi ya kubuni iliyo fupi kuliko riwaya lakini ndefu kuliko hadithi fupi, yenye wahusika na maudhui machache" },
  { neno: "Hadithi Fupi", maana: "Kazi fupi ya kubuni inayosimuliwa kwa muda mfupi, mara nyingi ikizingatia tukio moja tu" },
  { neno: "Tamthilia", maana: "Kazi ya kubuni inayoandikwa kwa njia ya majibizano ili itendwe jukwaani" },
  { neno: "Shairi", maana: "Kazi ya kifasihi inayotumia lugha ya mizani na vina kueleza hisia au ujumbe" },
];

const SIFA: { label: string; ni: "novela" | "riwaya" }[] = [
  { label: "Ina wahusika wachache ikilinganishwa na kazi ndefu zaidi", ni: "novela" },
  { label: "Huzingatia maudhui machache, mara nyingi mawili au matatu", ni: "novela" },
  { label: "Inaweza kusomwa kwa muda mfupi zaidi", ni: "novela" },
  { label: "Kwa kawaida huzingatia tukio au wazo moja kuu linaloendeshwa na wahusika wachache", ni: "novela" },
  { label: "Ina wahusika wengi na visa vingi vinavyofumbatana", ni: "riwaya" },
  { label: "Huwa na maudhui mengi yanayochunguza pande nyingi za maisha", ni: "riwaya" },
  { label: "Huchapishwa mara nyingi kama kitabu kikubwa chenye sura nyingi sana", ni: "riwaya" },
  { label: "Huhitaji muda mrefu zaidi kuisoma yote kutokana na urefu wake", ni: "riwaya" },
];

const URUFU_ITEMS = [
  { id: "u1", label: "Hadithi Fupi" },
  { id: "u2", label: "Novela" },
  { id: "u3", label: "Riwaya" },
];

interface Swali {
  prompt: string;
  correct: string;
  distractors: string[];
  explanation: string;
  passage?: string;
}

const KAZI_MFANO = "Fikiria kitabu kifuatacho: kina wahusika wanne tu, kinazungumzia maudhui mawili — elimu na umaskini — na kina kurasa sitini pekee, kikieleza jinsi mvulana mmoja anavyofaulu masomo licha ya changamoto za kifedha za familia yake.";

const MASWALI: Swali[] = [
  {
    prompt: "Novela ni nini?",
    correct: "Kazi ya kubuni iliyo fupi kuliko riwaya lakini ndefu kuliko hadithi fupi, yenye wahusika na maudhui machache",
    distractors: [
      "Kazi ndefu yenye wahusika wengi na visa vingi vinavyofumbatana",
      "Kazi inayoandikwa kwa njia ya majibizano ili itendwe jukwaani",
      "Kazi ya kifasihi inayotumia lugha ya mizani na vina",
    ],
    explanation: "Novela ni utanzu wa fasihi andishi ulio kati ya hadithi fupi na riwaya kwa urefu, wenye wahusika na maudhui machache.",
  },
  {
    prompt: "Tofauti kuu kati ya novela na riwaya ni ipi?",
    correct: "Novela ina wahusika na maudhui machache zaidi kuliko riwaya",
    distractors: [
      "Novela haina wahusika wowote",
      "Riwaya huandikwa kwa ushairi pekee",
      "Novela huandikwa kwa lugha ya Kiingereza pekee",
    ],
    explanation: "Novela hujikita katika wahusika wachache na maudhui machache, ilhali riwaya huchunguza wahusika wengi na maudhui mengi zaidi.",
  },
  {
    prompt: "Kipi kati ya vifuatavyo ni utanzu wa fasihi andishi unaoandikwa kwa njia ya majibizano ili utendwe jukwaani?",
    correct: "Tamthilia",
    distractors: ["Novela", "Riwaya", "Hadithi Fupi"],
    explanation: "Tamthilia ndiyo utanzu unaoandikwa kwa mazungumzo ya wahusika kwa lengo la kutendwa jukwaani, tofauti na novela au riwaya.",
  },
  {
    prompt: "Kutokana na maelezo haya, kazi hii ina uwezekano mkubwa wa kuwa ya aina gani?",
    correct: "Novela",
    distractors: ["Riwaya", "Tamthilia", "Shairi"],
    explanation: "Wahusika wachache (wanne), maudhui machache (mawili) na urefu mfupi (kurasa sitini) ni sifa za novela, si za riwaya iliyo ndefu na yenye wahusika wengi.",
    passage: KAZI_MFANO,
  },
];

export const novelaUtangulizi: Skill = {
  id: "g7-ksw-ks-novela-utangulizi",
  code: "KS.3",
  subjectId: "kiswahili",
  strandId: "g7-ksw-ks",
  grade: 7,
  title: "Kusoma kwa Kina: Utangulizi wa Novela",
  description: "Eleza maana ya novela kama utanzu wa fasihi andishi na ujadili sifa zake ukilinganisha na riwaya, hadithi fupi na tamthilia.",
  generate(rng) {
    const branch = randChoice(rng, ["istilahi", "sifa", "urefu", "swali", "fill"] as const);
    const hint = "Novela ni fupi kuliko riwaya lakini ndefu kuliko hadithi fupi, na ina wahusika na maudhui machache.";

    if (branch === "istilahi") {
      const tokens = shuffle(rng, ISTILAHI.map((m) => ({ id: m.neno, label: m.neno })));
      const targets = shuffle(rng, ISTILAHI.map((m) => ({ id: m.neno, label: m.maana })));
      const correctMap: Record<string, string> = {};
      for (const m of ISTILAHI) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila utanzu wa fasihi na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: ISTILAHI.map((m) => `${m.neno} — ${m.maana}.`).join(" "),
      };
    }

    if (branch === "sifa") {
      const items = SIFA.map((v, i) => ({ id: `s${i}`, label: v.label, b: v.ni }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = it.b;
      return {
        kind: "categorize",
        prompt: "Panga kila sifa: je, inahusu novela au riwaya zaidi?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "novela", label: "Sifa za Novela" },
          { id: "riwaya", label: "Sifa za Riwaya" },
        ],
        correctBucket,
        hint: "Novela ni fupi na yenye vipengele vichache; riwaya ni ndefu na yenye vipengele vingi.",
        explanation: SIFA.map((v) => `"${v.label}" ni sifa ya ${v.ni === "novela" ? "novela" : "riwaya"}.`).join(" "),
      };
    }

    if (branch === "urefu") {
      return {
        kind: "ordering",
        prompt: "Panga aina hizi za kazi za kubuni kutoka fupi zaidi hadi ndefu zaidi.",
        instruction: "Bofya kazi kwa mfuatano wa urefu, kuanzia iliyo fupi zaidi.",
        items: shuffle(rng, URUFU_ITEMS),
        correctOrder: URUFU_ITEMS.map((u) => u.id),
        hint: "Hadithi fupi ndiyo fupi zaidi, riwaya ndiyo ndefu zaidi, na novela iko katikati.",
        explanation: "Hadithi Fupi → Novela → Riwaya, kwa kuzingatia urefu kutoka fupi zaidi hadi ndefu zaidi.",
      };
    }

    if (branch === "fill") {
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu utanzu wa fasihi andishi.",
        before: "Utanzu wa fasihi andishi ulio na wahusika na maudhui machache, mfupi kuliko riwaya lakini mrefu kuliko hadithi fupi, huitwa",
        after: ".",
        correctAnswer: "novela",
        inputMode: "text",
        hint: "Fikiria utanzu ulioko katikati ya hadithi fupi na riwaya kwa urefu.",
        explanation: "Novela ni utanzu ulio kati ya hadithi fupi na riwaya, wenye wahusika na maudhui machache.",
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
