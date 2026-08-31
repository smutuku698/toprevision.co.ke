import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

const VYEO: { neno: string; kikoa: string; maelezo: string }[] = [
  { neno: "shehe", kikoa: "dini", maelezo: "kiongozi wa dini ya Kiislamu mwenye elimu ya sheria za dini" },
  { neno: "kasisi", kikoa: "dini", maelezo: "kiongozi wa dini ya Kikristo katika kanisa" },
  { neno: "padre", kikoa: "dini", maelezo: "kasisi wa Kanisa Katoliki" },
  { neno: "mwadhini", kikoa: "dini", maelezo: "mtu anayetoa mwito wa sala msikitini" },
  { neno: "mtawa", kikoa: "dini", maelezo: "mtu aliyejitolea maisha yake kwa dini akiishi kwa unyenyekevu" },
  { neno: "askofu", kikoa: "dini", maelezo: "kiongozi mkuu wa dayosisi katika Kanisa" },
  { neno: "sheikh", kikoa: "dini", maelezo: "mwalimu mkuu wa dini ya Kiislamu" },
  { neno: "mheshimiwa", kikoa: "serikali", maelezo: "kiongozi wa kisiasa aliyechaguliwa, kama mbunge au diwani" },
  { neno: "rais", kikoa: "serikali", maelezo: "kiongozi mkuu wa nchi" },
  { neno: "gavana", kikoa: "serikali", maelezo: "kiongozi mkuu wa kaunti" },
  { neno: "waziri", kikoa: "serikali", maelezo: "kiongozi wa wizara katika serikali" },
  { neno: "hakimu", kikoa: "serikali", maelezo: "afisa wa mahakama anayesikiliza kesi" },
  { neno: "afisa", kikoa: "serikali", maelezo: "mtu anayefanya kazi ya kiutawala serikalini" },
  { neno: "chifu", kikoa: "serikali", maelezo: "kiongozi wa eneo la mtaa/lokeshni" },
  { neno: "mzee", kikoa: "jamii", maelezo: "mtu mkubwa wa umri anayeheshimiwa jamii" },
  { neno: "mama", kikoa: "familia", maelezo: "kiongozi wa nyumbani, mzazi wa kike" },
  { neno: "baba", kikoa: "familia", maelezo: "kiongozi wa nyumbani, mzazi wa kiume" },
  { neno: "babu", kikoa: "familia", maelezo: "baba wa baba au mama" },
  { neno: "nyanya", kikoa: "familia", maelezo: "mama wa baba au mama" },
  { neno: "mkubwa", kikoa: "jamii", maelezo: "mtu mwenye cheo cha juu mahali pa kazi" },
  { neno: "daktari", kikoa: "taaluma", maelezo: "mtaalamu wa afya anayetibu wagonjwa" },
  { neno: "mwalimu", kikoa: "taaluma", maelezo: "mtaalamu anayefundisha shuleni" },
  { neno: "profesa", kikoa: "taaluma", maelezo: "msomi mkuu katika chuo kikuu" },
  { neno: "mwenyekiti", kikoa: "jamii", maelezo: "kiongozi wa mkutano au kikundi" },
  { neno: "katibu", kikoa: "jamii", maelezo: "mtu anayeandika kumbukumbu za kikundi/mkutano" },
  { neno: "mtemi", kikoa: "utamaduni", maelezo: "kiongozi wa kimila katika baadhi ya jamii" },
  { neno: "mfalme", kikoa: "utamaduni", maelezo: "kiongozi mkuu wa kifalme" },
  { neno: "malkia", kikoa: "utamaduni", maelezo: "kiongozi mkuu wa kike wa kifalme" },
  { neno: "kanali", kikoa: "usalama", maelezo: "afisa mkuu wa jeshi" },
  { neno: "kamishna", kikoa: "usalama", maelezo: "afisa mkuu wa polisi au idara ya serikali" },
];

export const heshimaAdabuNaVyeo: Skill = {
  id: "g6-ksw-kz-heshima-adabu-na-vyeo",
  code: "KZ.4",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Heshima, Adabu na Vyeo",
  description: "Tambua na utumie maneno ya heshima na vyeo yanayotumika kurejelea watu tofauti katika jamii.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-cheo", "oanisha-maelezo", "panga-kikoa", "jaza-heshima", "panga-utambulisho"] as const);

    if (branch === "chagua-cheo") {
      const v = randChoice(rng, VYEO);
      const makosaKikoa = shuffle(rng, VYEO.filter((x) => x.kikoa === v.kikoa && x.neno !== v.neno)).slice(0, 3).map((x) => x.neno);
      const makosaZiada = shuffle(rng, VYEO.filter((x) => x.neno !== v.neno)).slice(0, 3 - makosaKikoa.length).map((x) => x.neno);
      const choices = shuffle(rng, [v.neno, ...makosaKikoa, ...makosaZiada].slice(0, 4));
      return {
        kind: "multiple-choice",
        prompt: `Ni cheo/heshima kipi kinachomfaa mtu ${v.maelezo}?`,
        choices,
        correctIndex: choices.indexOf(v.neno),
        layout: "row",
        hint: `Fikiria kuhusu watu wa kikoa cha ${v.kikoa}.`,
        explanation: `"${v.neno}" ni cheo cha mtu ${v.maelezo}.`,
      };
    }

    if (branch === "oanisha-maelezo") {
      const chosen = shuffle(rng, VYEO).slice(0, 6);
      const tokens = chosen.map((v) => ({ id: v.neno, label: v.neno }));
      const targets = shuffle(rng, chosen).map((v) => ({ id: v.neno, label: v.maelezo }));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.neno] = v.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila cheo cha heshima na maelezo yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria ni nani anayeitwa kwa cheo hiki.",
        explanation: chosen.map((v) => `"${v.neno}" ni mtu ${v.maelezo}.`).join(" "),
      };
    }

    if (branch === "panga-kikoa") {
      const vikoa = shuffle(rng, Array.from(new Set(VYEO.map((v) => v.kikoa)))).slice(0, 3);
      const items = vikoa.flatMap((kikoa) =>
        shuffle(rng, VYEO.filter((v) => v.kikoa === kikoa)).slice(0, 2).map((v) => ({ id: v.neno, label: v.neno, bucket: kikoa }))
      );
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga vyeo hivi kulingana na kikoa vinachohusika.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: vikoa.map((k) => ({ id: k, label: k })),
        correctBucket,
        hint: "Fikiria ni mahali gani mtu mwenye cheo hiki hufanya kazi/anahusika.",
        explanation: "Kila cheo kimewekwa katika kikoa kinachokifaa.",
      };
    }

    if (branch === "jaza-heshima") {
      const v = randChoice(rng, VYEO);
      const jina = randChoice(rng, KENYAN_NAMES);
      const TEMPLATES = [
        { before: `${jina} alimsalimu kwa heshima akisema: "Hujambo `, after: `?"` },
        { before: `Watu wa kijiji walimheshimu sana `, after: ` wao kwa ushauri wake.` },
        { before: `${jina} alimwita `, after: ` ili kupata msaada wa kiroho.` },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: `Kamilisha sentensi kwa cheo kinachomfaa mtu ${v.maelezo}.`,
        before: t.before,
        after: t.after,
        correctAnswer: v.neno,
        inputMode: "text",
        hint: `Fikiria kikoa cha ${v.kikoa}.`,
        explanation: `Sentensi kamili: "${t.before}${v.neno}${t.after}" — "${v.neno}" ni mtu ${v.maelezo}.`,
      };
    }

    const v = randChoice(rng, VYEO);
    const jina = randChoice(rng, KENYAN_NAMES);
    const kamili = `${jina} alimsalimu ${v.neno} kwa heshima na adabu.`;
    const maneno = kamili.replace(".", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi ya kumsalimu mtu kwa heshima.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `"${v.neno}" ni cheo cha mtu ${v.maelezo}.`,
      explanation: `Sentensi sahihi ni: "${kamili}"`,
    };
  },
};
