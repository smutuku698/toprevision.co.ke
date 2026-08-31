import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Kiswahili, Kusoma (KS), mada 2.2.1 — matumizi ya kamusi kutambua tahajia (jinsi sahihi ya
// kuandika neno), ngeli (kundi la nomino), aina za maneno (nomino, kivumishi, kitenzi, kielezi) na maana ya
// neno. Mfano wa msamiati wa michezo uliopo kwenye muundo wa somo (kambumbu, gori, hoki, Jugwe) umewekwa hapa
// kama mifano ya maneno yanayohitaji kutafutwa kamusini — bila kubuni maana mahususi ambayo si ya uhakika;
// yanaelezwa kwa ujumla kama istilahi za michezo/mchezo wa jadi.

type Aina = "nomino" | "kivumishi" | "kitenzi" | "kielezi";
const AINA_LABEL: Record<Aina, string> = {
  nomino: "Nomino",
  kivumishi: "Kivumishi",
  kitenzi: "Kitenzi",
  kielezi: "Kielezi",
};

interface WordEntry {
  neno: string;
  aina: Aina;
  ngeli?: string;
  maana: string;
}

const NOMINO: WordEntry[] = [
  { neno: "mtoto", aina: "nomino", ngeli: "A-WA", maana: "mtu mdogo kwa umri, kabla ya kuwa mtu mzima" },
  { neno: "mwalimu", aina: "nomino", ngeli: "A-WA", maana: "mtu anayefundisha wanafunzi shuleni" },
  { neno: "rafiki", aina: "nomino", ngeli: "A-WA", maana: "mtu unayeshirikiana naye kwa urafiki na kumwamini" },
  { neno: "kitabu", aina: "nomino", ngeli: "KI-VI", maana: "karatasi zilizoandikwa habari na kufungwa pamoja kwa ajili ya kusoma" },
  { neno: "kiti", aina: "nomino", ngeli: "KI-VI", maana: "samani ya kukalia yenye miguu na mgongo" },
  { neno: "mti", aina: "nomino", ngeli: "U-I", maana: "mmea mkubwa wenye shina, matawi na majani" },
  { neno: "mkono", aina: "nomino", ngeli: "U-I", maana: "kiungo cha mwili kinachotumika kushika vitu" },
  { neno: "tunda", aina: "nomino", ngeli: "LI-YA", maana: "kizazi cha mmea kinacholiwa, mfano embe au chungwa" },
  { neno: "jicho", aina: "nomino", ngeli: "LI-YA", maana: "kiungo cha mwili kinachotumika kuona" },
  { neno: "ndege", aina: "nomino", ngeli: "N-N", maana: "mnyama mwenye mabawa anayeweza kuruka angani" },
  { neno: "ng'ombe", aina: "nomino", ngeli: "N-N", maana: "mnyama mkubwa wa kufugwa anayetoa maziwa na nyama" },
  { neno: "ukweli", aina: "nomino", ngeli: "U-U", maana: "hali ya jambo kuwa la kweli, si uongo" },
  { neno: "mahali", aina: "nomino", ngeli: "PA-KU-MU", maana: "sehemu au eneo fulani" },
  { neno: "maji", aina: "nomino", ngeli: "YA-YA", maana: "kimiminika kisicho na rangi kinachotumika kunywa na kuosha" },
];

const VIVUMISHI: WordEntry[] = [
  { neno: "zuri", aina: "kivumishi", maana: "mzizi wa kivumishi kinachoeleza sifa nzuri au inayopendeza ya kitu au mtu" },
  { neno: "kubwa", aina: "kivumishi", maana: "mzizi wa kivumishi kinachoeleza ukubwa wa kitu" },
  { neno: "dogo", aina: "kivumishi", maana: "mzizi wa kivumishi kinachoeleza udogo wa kitu" },
  { neno: "refu", aina: "kivumishi", maana: "mzizi wa kivumishi kinachoeleza urefu wa kitu au mtu" },
  { neno: "fupi", aina: "kivumishi", maana: "mzizi wa kivumishi kinachoeleza ufupi wa kitu au mtu" },
  { neno: "eusi", aina: "kivumishi", maana: "mzizi wa kivumishi kinachoeleza rangi nyeusi ya kitu" },
  { neno: "pya", aina: "kivumishi", maana: "mzizi wa kivumishi kinachoeleza kuwa kitu ni kipya, hakijatumika" },
];

const VITENZI: WordEntry[] = [
  { neno: "kusoma", aina: "kitenzi", maana: "kitendo cha kutazama na kuelewa maneno yaliyoandikwa" },
  { neno: "kuandika", aina: "kitenzi", maana: "kitendo cha kuweka maneno kwenye karatasi au skrini kwa herufi" },
  { neno: "kucheza", aina: "kitenzi", maana: "kitendo cha kushiriki mchezo au kufurahia jambo" },
  { neno: "kula", aina: "kitenzi", maana: "kitendo cha kuweka chakula mdomoni na kukimeza" },
  { neno: "kunywa", aina: "kitenzi", maana: "kitendo cha kumeza kimiminika kama maji" },
  { neno: "kukimbia", aina: "kitenzi", maana: "kitendo cha kwenda kwa mwendo wa kasi kwa miguu" },
  { neno: "kuimba", aina: "kitenzi", maana: "kitendo cha kutoa sauti ya nyimbo" },
  { neno: "kuchora", aina: "kitenzi", maana: "kitendo cha kutengeneza picha kwa kalamu au rangi" },
];

const VIELEZI: WordEntry[] = [
  { neno: "haraka", aina: "kielezi", maana: "hueleza kuwa kitendo kilifanyika kwa kasi" },
  { neno: "polepole", aina: "kielezi", maana: "hueleza kuwa kitendo kilifanyika kwa mwendo wa taratibu" },
  { neno: "jana", aina: "kielezi", maana: "hueleza wakati uliopita, siku moja kabla ya leo" },
  { neno: "kesho", aina: "kielezi", maana: "hueleza wakati ujao, siku moja baada ya leo" },
  { neno: "vizuri", aina: "kielezi", maana: "hueleza jinsi kitendo kilivyofanyika kwa ubora" },
  { neno: "sana", aina: "kielezi", maana: "hueleza kiwango kikubwa cha jambo" },
];

const ISTILAHI_MICHEZO: WordEntry[] = [
  { neno: "kambumbu", aina: "nomino", maana: "istilahi ya mchezo/mchezo wa jadi — inafaa kutafutwa kwenye kamusi ili kupata maana kamili na matumizi yake" },
  { neno: "gori", aina: "nomino", maana: "istilahi ya mchezo/mchezo wa jadi — inafaa kutafutwa kwenye kamusi ili kupata maana kamili na matumizi yake" },
  { neno: "hoki", aina: "nomino", maana: "istilahi ya mchezo unaochezwa na timu mbili — inafaa kutafutwa kwenye kamusi ili kupata maana kamili na matumizi yake" },
  { neno: "jugwe", aina: "nomino", maana: "istilahi ya mchezo/mchezo wa jadi — inafaa kutafutwa kwenye kamusi ili kupata maana kamili na matumizi yake" },
];

const WORD_ENTRIES: WordEntry[] = [...NOMINO, ...VIVUMISHI, ...VITENZI, ...VIELEZI, ...ISTILAHI_MICHEZO];
// Sports-vocabulary terms are deliberately excluded from BY_AINA: their "maana" is an intentionally generic
// gloss (we're not certain of the exact definition — see comment at top of file), so several of them share
// near-identical text and would produce duplicate/ambiguous multiple-choice options if drawn as distractors
// against each other in the "maana-mc" branch below. They're still used correctly elsewhere (SCENARIO_APPLY,
// alpha-order via WORD_ENTRIES) where identical maana text doesn't matter.
const BY_AINA: Record<Aina, WordEntry[]> = {
  nomino: NOMINO,
  kivumishi: VIVUMISHI,
  kitenzi: VITENZI,
  kielezi: VIELEZI,
};

const FILL_BLANKS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Neno linalomaanisha 'mtu anayefundisha wanafunzi shuleni' ni ", after: ".", correctAnswer: "mwalimu" },
  { before: "Neno linaloeleza kitendo cha kutazama na kuelewa maneno yaliyoandikwa ni ", after: ".", correctAnswer: "kusoma" },
  { before: "Kivumishi kinachoeleza kuwa kitu ni kikubwa ni ", after: ".", correctAnswer: "kubwa" },
  { before: "Neno linaloeleza wakati uliopita, yaani siku moja kabla ya leo, ni ", after: ".", correctAnswer: "jana" },
  { before: "Nomino inayomaanisha 'mmea mkubwa wenye shina, matawi na majani' ni ", after: ".", correctAnswer: "mti" },
  { before: "Kitenzi kinachomaanisha 'kumeza kimiminika kama maji' ni ", after: ".", correctAnswer: "kunywa" },
  { before: "Neno linalomaanisha 'mnyama mwenye mabawa anayeweza kuruka angani' ni ", after: ".", correctAnswer: "ndege" },
  { before: "Kielezi kinachoeleza kuwa kitendo kilifanyika kwa kasi ni ", after: ".", correctAnswer: "haraka" },
  { before: "Nomino inayomaanisha 'hali ya jambo kuwa la kweli, si uongo' ni ", after: ".", correctAnswer: "ukweli" },
  { before: "Kitenzi kinachomaanisha 'kutengeneza picha kwa kalamu au rangi' ni ", after: ".", correctAnswer: "kuchora" },
  { before: "Kivumishi kinachoeleza rangi nyeusi ya kitu ni ", after: ".", correctAnswer: "eusi" },
  { before: "Kitabu cha kutafuta maana, tahajia, ngeli na aina za maneno huitwa ", after: ".", correctAnswer: "kamusi" },
];

interface KamusiScenario {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}
const KAMUSI_SKILLS = [
  "Tahajia (jinsi sahihi ya kuandika neno)",
  "Ngeli (kundi la nomino katika lugha)",
  "Aina ya neno (nomino, kivumishi, kitenzi au kielezi)",
  "Maana ya neno",
];
const SCENARIO_APPLY: ((rng: RNG) => KamusiScenario)[] = [
  (rng) => {
    const word = randChoice(rng, WORD_ENTRIES);
    return {
      prompt: `Wakati wa kusoma habari za michezo, mwanafunzi mmoja hakuwa na uhakika jinsi ya kuandika neno "${word.neno}" kwa herufi sahihi. Ni ujuzi upi wa kamusi unaomsaidia zaidi?`,
      correct: "Tahajia (jinsi sahihi ya kuandika neno)",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Tahajia (jinsi sahihi ya kuandika neno)"),
      explanation: "Kamusi husaidia mtumiaji kuthibitisha tahajia sahihi ya neno anapokuwa na shaka jinsi ya kuliandika.",
    };
  },
  (rng) => {
    const word = randChoice(rng, NOMINO);
    return {
      prompt: `Mwanafunzi anataka kujua ngeli ya nomino "${word.neno}" ili aitumie vizuri kisarufi. Ni ujuzi upi wa kamusi unaomsaidia zaidi?`,
      correct: "Ngeli (kundi la nomino katika lugha)",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Ngeli (kundi la nomino katika lugha)"),
      explanation: "Kamusi nzuri hutaja ngeli ya kila nomino, jambo linalomsaidia msomaji kuitumia kwa usahihi wa kisarufi.",
    };
  },
  (rng) => {
    const word = randChoice(rng, VIELEZI);
    return {
      prompt: `Mwanafunzi hafahamu kama neno "${word.neno}" ni nomino, kivumishi, kitenzi au kielezi. Ni ujuzi upi wa kamusi unaomsaidia zaidi?`,
      correct: "Aina ya neno (nomino, kivumishi, kitenzi au kielezi)",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Aina ya neno (nomino, kivumishi, kitenzi au kielezi)"),
      explanation: "Kamusi hutaja aina ya neno (aina za maneno) ili msomaji ajue jinsi neno hilo linavyotumika sentensini.",
    };
  },
  (rng) => {
    const word = randChoice(rng, ISTILAHI_MICHEZO);
    return {
      prompt: `Wakati wa kusoma kifungu kuhusu michezo, mwanafunzi alikutana na neno "${word.neno}" ambalo halikufahamu kabisa maana yake. Ni ujuzi upi wa kamusi unaomsaidia zaidi?`,
      correct: "Maana ya neno",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Maana ya neno"),
      explanation: "Kamusi ndicho chombo bora cha kutafuta maana ya neno geni linaloonekana katika kifungu.",
    };
  },
  (rng) => {
    const word = randChoice(rng, VITENZI);
    return {
      prompt: `Mwalimu ${randChoice(rng, ["Bw. Otieno", "Bi. Chebet", "Bw. Mwangi", "Bi. Wanjiru"])} aliwaomba wanafunzi kuandika kitenzi "${word.neno}" katika insha, lakini mmoja wao hakuwa na uhakika wa herufi zake. Ni ujuzi upi wa kamusi unaomsaidia zaidi?`,
      correct: "Tahajia (jinsi sahihi ya kuandika neno)",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Tahajia (jinsi sahihi ya kuandika neno)"),
      explanation: "Kuangalia tahajia sahihi kamusini kunamsaidia mwandishi kuepuka makosa ya kuandika.",
    };
  },
  (rng) => {
    const word = randChoice(rng, NOMINO);
    return {
      prompt: `Wakati wa somo la sarufi, mwanafunzi anahitaji kujua ni vivumishi gani vinavyoambatana kisawe na nomino "${word.neno}" kulingana na ngeli yake. Ni ujuzi upi wa kamusi unaomsaidia kuanzia?`,
      correct: "Ngeli (kundi la nomino katika lugha)",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Ngeli (kundi la nomino katika lugha)"),
      explanation: "Kujua ngeli ya nomino kwanza (kwa msaada wa kamusi) ndiko kunakomwezesha mwanafunzi kuchagua viambishi sahihi vya kivumishi.",
    };
  },
  (rng) => {
    const word = randChoice(rng, VIVUMISHI);
    return {
      prompt: `Mwanafunzi ameandika sentensi na hana uhakika kama neno "${word.neno}" ni kivumishi au kitenzi katika muktadha huo. Ni ujuzi upi wa kamusi unaomsaidia kuthibitisha?`,
      correct: "Aina ya neno (nomino, kivumishi, kitenzi au kielezi)",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Aina ya neno (nomino, kivumishi, kitenzi au kielezi)"),
      explanation: "Kamusi hutaja aina ya neno kwa kila kiingizo, jambo linaloondoa shaka kuhusu jinsi neno linavyotumika.",
    };
  },
  (rng) => {
    const word = randChoice(rng, ISTILAHI_MICHEZO);
    return {
      prompt: `${randChoice(rng, ["Amina", "Kevin", "Chebet", "Otieno"])} alisikia neno "${word.neno}" kwenye redio wakati wa taarifa ya michezo na hakuelewa lilimaanisha nini. Ni ujuzi upi wa kamusi unaomsaidia zaidi?`,
      correct: "Maana ya neno",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Maana ya neno"),
      explanation: "Kutafuta neno geni kamusini humpa msomaji maana yake kamili badala ya kubahatisha.",
    };
  },
  (rng) => {
    const word = randChoice(rng, VITENZI);
    return {
      prompt: `Mwanafunzi anaandika insha na anataka kuthibitisha kama kitenzi "${word.neno}" kimeandikwa kwa herufi sahihi kabla ya kukikabidhi mwalimu. Ni ujuzi upi wa kamusi unaomsaidia zaidi?`,
      correct: "Tahajia (jinsi sahihi ya kuandika neno)",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Tahajia (jinsi sahihi ya kuandika neno)"),
      explanation: "Kuthibitisha tahajia kamusini kabla ya kukabidhi kazi husaidia kuepuka makosa ya kuandika.",
    };
  },
  (rng) => {
    const word = randChoice(rng, NOMINO.filter((w) => w.ngeli === "PA-KU-MU" || w.ngeli === "YA-YA"));
    return {
      prompt: `Mwanafunzi anashangaa kwa nini nomino "${word.neno}" haifuati kanuni za kawaida za wingi kama maneno mengine. Ni ujuzi upi wa kamusi unaomsaidia kuelewa hili?`,
      correct: "Ngeli (kundi la nomino katika lugha)",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Ngeli (kundi la nomino katika lugha)"),
      explanation: "Ngeli ya nomino ndiyo inayoeleza jinsi nomino hiyo inavyobadilika (au isivyobadilika) kutoka umoja kwenda wingi.",
    };
  },
  (rng) => {
    const word = randChoice(rng, VIELEZI);
    return {
      prompt: `Katika kifungu kuhusu safari, mwanafunzi alikutana na neno "${word.neno}" na hakuwa na uhakika kama ni kielezi au kivumishi. Ni ujuzi upi wa kamusi unaomsaidia zaidi kuthibitisha?`,
      correct: "Aina ya neno (nomino, kivumishi, kitenzi au kielezi)",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Aina ya neno (nomino, kivumishi, kitenzi au kielezi)"),
      explanation: "Kamusi hutaja waziwazi aina ya kila neno, jambo linalomsaidia msomaji kutofautisha vielezi na vivumishi.",
    };
  },
  (rng) => {
    const word = randChoice(rng, ISTILAHI_MICHEZO);
    return {
      prompt: `Timu ya shule ilishiriki mchezo uliotajwa kwa jina "${word.neno}" kwenye tangazo la shule, na wanafunzi wengi hawakufahamu ni mchezo wa aina gani. Ni ujuzi upi wa kamusi unaomsaidia zaidi?`,
      correct: "Maana ya neno",
      wrong: KAMUSI_SKILLS.filter((s) => s !== "Maana ya neno"),
      explanation: "Kamusi ndiyo chanzo bora cha kuthibitisha maana ya istilahi mpya kama majina ya michezo yasiyofahamika.",
    };
  },
];

function alphaKey(s: string): string {
  return s.toLowerCase().replace(/'/g, "");
}

export const matumiziYaKamusi: Skill = {
  id: "g6-ksw-ks-matumizi-ya-kamusi",
  code: "KS.2",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ks",
  grade: 6,
  title: "Kusoma kwa Kina: Matumizi ya Kamusi",
  description: "Tumia kamusi kutambua tahajia sahihi, ngeli, aina za maneno (nomino, kivumishi, kitenzi, kielezi) na maana ya maneno mbalimbali, ikiwemo istilahi za michezo.",
  generate(rng) {
    const branch = randChoice(rng, ["maana-mc", "alpha-order", "ngeli-match", "aina-sort", "fill", "kamusi-apply"] as const);
    const hint = "Fikiria ni ujuzi upi wa kamusi (tahajia, ngeli, aina ya neno au maana) unaofaa hapa.";

    if (branch === "maana-mc") {
      const aina = randChoice(rng, ["nomino", "kivumishi", "kitenzi", "kielezi"] as const);
      const pool = BY_AINA[aina];
      const word = randChoice(rng, pool);
      const others = shuffle(rng, pool.filter((w) => w.neno !== word.neno)).slice(0, 3);
      const choices = shuffle(rng, [word.maana, ...others.map((o) => o.maana)]);
      return {
        kind: "multiple-choice",
        prompt: `Kamusi inaeleza kuwa neno "${word.neno}" (${AINA_LABEL[word.aina]}) lina maana gani?`,
        choices,
        correctIndex: choices.indexOf(word.maana),
        layout: "list",
        hint,
        explanation: `"${word.neno}" ina maana ya: ${word.maana}.`,
      };
    }

    if (branch === "alpha-order") {
      const pool = WORD_ENTRIES;
      const count = randInt(rng, 4, 5);
      const chosenWords = shuffle(rng, pool).slice(0, count);
      const sorted = [...chosenWords].sort((a, b) => (alphaKey(a.neno) < alphaKey(b.neno) ? -1 : alphaKey(a.neno) > alphaKey(b.neno) ? 1 : 0));
      const items = chosenWords.map((w, i) => ({ id: `w${i}-${w.neno}`, label: w.neno }));
      const idByNeno: Record<string, string> = {};
      for (const it of items) idByNeno[it.label] = it.id;
      return {
        kind: "ordering",
        prompt: "Panga maneno haya kulingana na mfuatano wa kamusi (alfabeti).",
        instruction: "Bofya maneno kwa mfuatano wa alfabeti, kama ambavyo yangepatikana kamusini.",
        items: shuffle(rng, items),
        correctOrder: sorted.map((w) => idByNeno[w.neno]),
        hint: "Angalia herufi ya kwanza ya kila neno, kisha ya pili ikiwa herufi za kwanza zinafanana.",
        explanation: "Mfuatano wa kamusi: " + sorted.map((w) => w.neno).join(" → ") + ".",
      };
    }

    if (branch === "ngeli-match") {
      const distinctClasses = Array.from(new Set(NOMINO.map((w) => w.ngeli)));
      const classesToUse = shuffle(rng, distinctClasses).slice(0, Math.min(5, distinctClasses.length));
      const chosen = classesToUse.map((cls) => randChoice(rng, NOMINO.filter((w) => w.ngeli === cls)));
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.neno, label: w.neno })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.neno, label: w.ngeli as string })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.neno] = w.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila nomino na ngeli yake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi nomino inavyobadilika kutoka umoja kwenda wingi.",
        explanation: chosen.map((w) => `${w.neno} — ngeli ${w.ngeli}.`).join(" "),
      };
    }

    if (branch === "aina-sort") {
      const perAina = 2;
      const chosen: WordEntry[] = [];
      (["nomino", "kivumishi", "kitenzi", "kielezi"] as const).forEach((a) => {
        chosen.push(...shuffle(rng, BY_AINA[a]).slice(0, perAina));
      });
      const items = shuffle(rng, chosen).map((w, i) => ({ id: `a${i}-${w.neno}`, label: w.neno }));
      const nenoToAina: Record<string, Aina> = {};
      for (const w of chosen) nenoToAina[w.neno] = w.aina;
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = nenoToAina[it.label];
      return {
        kind: "categorize",
        prompt: "Panga kila neno kulingana na aina yake ya neno.",
        items,
        buckets: (["nomino", "kivumishi", "kitenzi", "kielezi"] as const).map((a) => ({ id: a, label: AINA_LABEL[a] })),
        correctBucket,
        hint: "Fikiria kama neno linataja kitu (nomino), linaeleza sifa (kivumishi), linaeleza kitendo (kitenzi), au linaeleza jinsi/wakati/mahali (kielezi).",
        explanation: chosen.map((w) => `"${w.neno}" ni ${AINA_LABEL[w.aina]}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const fb = randChoice(rng, FILL_BLANKS);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha ingizo hili la kikamusi.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
      };
    }

    const q = randChoice(rng, SCENARIO_APPLY)(rng);
    const choices = shuffle(rng, [q.correct, ...q.wrong]);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(q.correct),
      layout: "list",
      hint,
      explanation: q.explanation,
    };
  },
};
