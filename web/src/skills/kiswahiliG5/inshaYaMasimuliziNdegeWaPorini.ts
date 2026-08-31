import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Insha za Masimulizi (Ndege wa Porini)" — mada:
// tukio linalohusiana na ndege wa porini, urefu si chini ya maneno 150. Msamiati: chiriku, kasuku, tai,
// korongo, mwewe, kanga. Muundo: mwanzo, kati, mwisho. Ona curriculum-reference/grade-5/kiswahili.json.

type Sehemu = "mwanzo" | "kati" | "mwisho";

const SEHEMU_JINA: Record<Sehemu, string> = { mwanzo: "Mwanzo", kati: "Kati", mwisho: "Mwisho" };

const SEHEMU_MAELEZO: Record<Sehemu, string> = {
  mwanzo: "mwanzo huanzisha wahusika na mandhari ya kisa cha ndege wa porini",
  kati: "kati huelezea tukio kuu linalowahusu ndege hao",
  mwisho: "mwisho hufunga kisa kwa matokeo ya tukio",
};

const SENTENSI_MFANO: { sentensi: string; sehemu: Sehemu }[] = [
  { sentensi: "Asubuhi moja, mwewe aliruka juu ya shamba la kuku akitafuta mawindo.", sehemu: "mwanzo" },
  { sentensi: "Kasuku wa Baraka alikuwa akiimba kwenye kizimba chake jioni hiyo.", sehemu: "mwanzo" },
  { sentensi: "Tai aliyekuwa akiruka juu ya mlima aliona sungura akikimbia chini.", sehemu: "mwanzo" },
  { sentensi: "Kundi la korongo lilikuwa likitembea kando ya ziwa likitafuta samaki.", sehemu: "mwanzo" },
  { sentensi: "Chiriku wadogo walikuwa wakiruka kutoka tawi hadi tawi msituni.", sehemu: "mwanzo" },
  { sentensi: "Mwewe alishuka ghafla na kumnyakua kifaranga mmoja wa kuku.", sehemu: "kati" },
  { sentensi: "Wanakijiji walipiga kelele kumfukuza mwewe asiwadhuru vifaranga wengine.", sehemu: "kati" },
  { sentensi: "Kasuku alifungua mlango wa kizimba chake baada ya kuiga sauti ya ufunguo.", sehemu: "kati" },
  { sentensi: "Baraka alishangaa alipomkosa kasuku wake kizimbani.", sehemu: "kati" },
  { sentensi: "Tai aliruka chini haraka kumkamata sungura kwa makucha yake makali.", sehemu: "kati" },
  { sentensi: "Korongo mmoja alitumia mdomo wake mrefu kuchimba samaki kwenye tope.", sehemu: "kati" },
  { sentensi: "Kanga walikimbia kwa haraka walipoona mbwa mwitu akikaribia.", sehemu: "kati" },
  { sentensi: "Hatimaye, wanakijiji walimfukuza mwewe na vifaranga vilivyobaki vikawa salama.", sehemu: "mwisho" },
  { sentensi: "Baraka alimtafuta kasuku wake hadi akamkuta juu ya mti jirani.", sehemu: "mwisho" },
  { sentensi: "Tai alirudi kiotani na sungura aliyemkamata kwa ajili ya chakula.", sehemu: "mwisho" },
  { sentensi: "Korongo aliondoka ziwani baada ya kupata samaki wa kutosha.", sehemu: "mwisho" },
  { sentensi: "Kanga walijificha msituni hadi hatari ilipopita.", sehemu: "mwisho" },
];

const NDEGE: { jina: string; sifa: string }[] = [
  { jina: "Chiriku", sifa: "ndege mdogo mwenye sauti nzuri ya kuimba" },
  { jina: "Kasuku", sifa: "anaweza kuiga sauti za binadamu anapofunzwa" },
  { jina: "Tai", sifa: "ndege mkubwa mwenye macho makali sana ya kuwinda" },
  { jina: "Korongo", sifa: "ana shingo ndefu na miguu mirefu ya kumsaidia kuvua samaki" },
  { jina: "Mwewe", sifa: "huwinda vifaranga vya kuku akiwa hewani" },
  { jina: "Kanga", sifa: "ana manyoya yenye madoa meupe mengi mwilini" },
];

const MFUATANO: { id: string; label: string }[] = [
  { id: "1", label: "Asubuhi moja, mwewe aliruka juu ya shamba la kuku akitafuta mawindo." },
  { id: "2", label: "Mwewe alishuka ghafla na kumnyakua kifaranga mmoja wa kuku." },
  { id: "3", label: "Wanakijiji walipiga kelele kumfukuza mwewe." },
  { id: "4", label: "Mwewe aliruka mbali akiwa na hofu ya kelele za watu." },
  { id: "5", label: "Hatimaye, vifaranga vilivyobaki vikawa salama shambani." },
];

export const inshaYaMasimuliziNdegeWaPorini: Skill = {
  id: "g5-ksw-ka-insha-ya-masimulizi-ndege-wa-porini",
  code: "KA.8",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Insha za Masimulizi (Ndege wa Porini)",
  description: "Eleza sifa za insha ya masimulizi kuhusu tukio la ndege wa porini na uandike kwa kanuni zifaazo.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-sehemu", "oanisha-ndege", "panga-sehemu", "jaza-ndege", "panga-mfuatano"] as const);

    if (branch === "tambua-sehemu") {
      const s = randChoice(rng, SENTENSI_MFANO);
      const wote: Sehemu[] = ["mwanzo", "kati", "mwisho"];
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "sehemu ya kisa inayolingana na sentensi hii kuhusu ndege")} "${s.sentensi}"`,
        choices: choices.map((c) => SEHEMU_JINA[c]),
        correctIndex: choices.indexOf(s.sehemu),
        layout: "row",
        hint: SEHEMU_MAELEZO[s.sehemu],
        explanation: `Sentensi hii iko katika sehemu ya ${SEHEMU_JINA[s.sehemu]} — ${SEHEMU_MAELEZO[s.sehemu]}.`,
      };
    }

    if (branch === "oanisha-ndege") {
      const chosen = shuffle(rng, NDEGE).slice(0, 5);
      const tokens = chosen.map((n, i) => ({ id: `${i}`, label: n.jina }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: `${chosen.indexOf(n)}`, label: n.sifa }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_n, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "jina la ndege wa porini na sifa yake unayoweza kutumia katika kisa"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria sifa ya kipekee ya kila ndege.",
        explanation: chosen.map((n) => `${n.jina}: ${n.sifa}.`).join(" "),
      };
    }

    if (branch === "panga-sehemu") {
      const chosen = shuffle(rng, SENTENSI_MFANO).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `${i}-${s.sentensi}`, label: s.sentensi, bucket: s.sehemu }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "sehemu ya kisa (mwanzo, kati au mwisho) inayolingana na sentensi hii"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "mwanzo", label: "Mwanzo" },
          { id: "kati", label: "Kati" },
          { id: "mwisho", label: "Mwisho" },
        ],
        correctBucket,
        hint: "Mwanzo huanzisha, kati huelezea tukio kuu, mwisho hufunga kisa.",
        explanation: chosen.map((s) => `"${s.sentensi}" iko katika sehemu ya ${SEHEMU_JINA[s.sehemu]}.`).join(" "),
      };
    }

    if (branch === "jaza-ndege") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `${j} aliona "`, after: `" akimnyakua kifaranga wa kuku shambani.`, jibu: "mwewe" },
        { before: `"`, after: `" anaweza kuiga sauti za binadamu anapofunzwa vizuri.`, jibu: "Kasuku" },
        { before: `${j} alimwona "`, after: `" akiwinda sungura kutoka juu angani.`, jibu: "tai" },
        { before: `"`, after: `" ana shingo ndefu inayomsaidia kuvua samaki ziwani.`, jibu: "Korongo" },
        { before: `${j} alisikia "`, after: `" wadogo wakiimba kwa sauti nzuri msituni.`, jibu: "chiriku" },
        { before: `"`, after: `" ana manyoya yenye madoa meupe mengi mwilini.`, jibu: "Kanga" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria majina ya ndege wa porini: chiriku, kasuku, tai, korongo, mwewe, kanga.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "sentensi za kisa cha mwewe shambani"),
      instruction: "Bofya sentensi kwa mpangilio sahihi wa kisa.",
      items: shuffle(rng, MFUATANO),
      correctOrder: MFUATANO.map((m) => m.id),
      hint: "Fikiria mfuatano wa matukio: kabla ya shambulio, wakati wa shambulio, na baada yake.",
      explanation: "Mpangilio sahihi: " + MFUATANO.map((m) => m.label).join(" → "),
    };
  },
};
