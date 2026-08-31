import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Kiswahili, Kusoma (KS), mada 1.2.1 — usomaji wa ufahamu ukitumia msamiati wa viungo vya ndani
// vya mwili (moyo, mapafu, ini, kibofu, wengu, figo, ubongo, mifupa, mishipa) pamoja na kazi zake za msingi.
// Orodha imepanuliwa kidogo (tumbo, utumbo, ngozi) ili kutoa mkusanyiko mpana zaidi wa mazoezi ya kweli ya
// Kiswahili katika kategoria hiyo hiyo, bila kupoteza uhalisia wa kisayansi.

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka",
  "Otieno", "Wanjiru", "Achieng", "Kamau", "Njeri", "Wafula", "Cherono", "Musyoka", "Akinyi", "Kiptoo",
  "Wambui", "Salim", "Nyambura", "Odhiambo", "Rono", "Atieno", "Mumbi", "Hassan",
] as const;

const KENYAN_PLACES = [
  "Nyeri", "Nakuru", "Kisumu", "Eldoret", "Machakos", "Kitale", "Kericho", "Kakamega", "Bungoma", "Meru",
  "Embu", "Kitui", "Narok", "Kajiado", "Homa Bay", "Kilifi", "Kwale", "Garissa", "Isiolo", "Baringo",
] as const;

function name(rng: RNG): string {
  return randChoice(rng, KENYAN_NAMES);
}
function place(rng: RNG): string {
  return randChoice(rng, KENYAN_PLACES);
}

interface Organ {
  id: string;
  jina: string;
  kazi: string;
  afya: string;
  mfumo: string;
}

const SYSTEMS: { id: string; label: string }[] = [
  { id: "mzunguko", label: "Mfumo wa Mzunguko wa Damu" },
  { id: "upumuaji", label: "Mfumo wa Upumuaji" },
  { id: "kusaga", label: "Mfumo wa Kusaga Chakula" },
  { id: "mkojo", label: "Mfumo wa Mkojo" },
  { id: "fahamu", label: "Mfumo wa Fahamu" },
  { id: "mifupa-mfumo", label: "Mfumo wa Mifupa" },
  { id: "kinga", label: "Mfumo wa Kinga ya Mwili" },
];
const SYSTEM_LABEL: Record<string, string> = Object.fromEntries(SYSTEMS.map((s) => [s.id, s.label]));

const ORGANS: Organ[] = [
  { id: "moyo", jina: "moyo", kazi: "Husukuma damu kwenda sehemu zote za mwili.", afya: "Kufanya mazoezi ya mwili mara kwa mara huusaidia moyo kuwa na nguvu.", mfumo: "mzunguko" },
  { id: "mapafu", jina: "mapafu", kazi: "Husaidia mwili kuvuta hewa safi (oksijeni) na kutoa hewa chafu (kaboni dayoksaidi).", afya: "Kutovuta moshi wa sigara huulinda mapafu dhidi ya magonjwa.", mfumo: "upumuaji" },
  { id: "ini", jina: "ini", kazi: "Husafisha sumu mwilini na kusaidia katika umeng'enyaji wa chakula.", afya: "Kunywa pombe kupita kiasi kunaweza kudhuru ini.", mfumo: "kusaga" },
  { id: "kibofu", jina: "kibofu", kazi: "Huhifadhi mkojo kabla ya kutolewa nje ya mwili.", afya: "Kunywa maji ya kutosha husaidia kibofu kufanya kazi vizuri.", mfumo: "mkojo" },
  { id: "wengu", jina: "wengu", kazi: "Huchuja damu na kuiondolea chembe chembe za damu zilizochakaa.", afya: "Wengu wenye afya husaidia mwili kupambana na maambukizi.", mfumo: "kinga" },
  { id: "figo", jina: "figo", kazi: "Huchuja uchafu na maji ya ziada kutoka kwenye damu na kutengeneza mkojo.", afya: "Kunywa maji ya kutosha kila siku husaidia figo kufanya kazi vizuri.", mfumo: "mkojo" },
  { id: "ubongo", jina: "ubongo", kazi: "Hudhibiti mawazo, kumbukumbu, na matendo ya mwili wote.", afya: "Kulala vya kutosha na kusoma huimarisha ubongo.", mfumo: "fahamu" },
  { id: "mifupa", jina: "mifupa", kazi: "Hutoa nguvu na umbo la mwili, na kulinda viungo vya ndani.", afya: "Kunywa maziwa na kula vyakula vyenye kalisi huimarisha mifupa.", mfumo: "mifupa-mfumo" },
  { id: "mishipa", jina: "mishipa", kazi: "Husafirisha damu kutoka moyoni kwenda sehemu zote za mwili na kuirudisha moyoni.", afya: "Mazoezi ya mwili husaidia mishipa ya damu kubaki na afya.", mfumo: "mzunguko" },
  { id: "tumbo", jina: "tumbo", kazi: "Husaga chakula kwa kutumia asidi na kukiandaa kwa umeng'enyaji zaidi.", afya: "Kula milo midogo mara kwa mara ni bora kwa afya ya tumbo.", mfumo: "kusaga" },
  { id: "utumbo", jina: "utumbo", kazi: "Husaidia kunyonya virutubisho kutoka kwa chakula kilichosagwa na kuviingiza kwenye damu.", afya: "Kula vyakula vyenye nyuzinyuzi kama mboga huimarisha afya ya utumbo.", mfumo: "kusaga" },
  { id: "ngozi", jina: "ngozi", kazi: "Hufunika na kulinda viungo vya ndani vya mwili, na kudhibiti joto la mwili.", afya: "Kunywa maji ya kutosha na kuoga husaidia ngozi kubaki na afya.", mfumo: "kinga" },
];
const ORGAN_BY_ID: Record<string, Organ> = Object.fromEntries(ORGANS.map((o) => [o.id, o]));

const CLUSTER_GROUPS: string[][] = [
  ["moyo", "mapafu", "mishipa"],
  ["ini", "tumbo", "utumbo", "figo", "kibofu", "wengu"],
  ["mifupa", "ngozi"],
];
function clusterMates(id: string): string[] {
  const group = CLUSTER_GROUPS.find((g) => g.includes(id));
  if (group) return group.filter((g) => g !== id);
  return ORGANS.map((o) => o.id).filter((g) => g !== id);
}

interface OrderSet {
  title: string;
  steps: { id: string; label: string }[];
}
const ORDER_SETS: OrderSet[] = [
  {
    title: "Panga hatua za mzunguko wa hewa unapopumua.",
    steps: [
      { id: "u1", label: "Hewa huingia mwilini kupitia puani" },
      { id: "u2", label: "Hewa hupita kwenye koo" },
      { id: "u3", label: "Hewa hufika kwenye mapafu" },
      { id: "u4", label: "Oksijeni huingia kwenye damu kupitia mapafu" },
      { id: "u5", label: "Kaboni dayoksaidi hutolewa nje ya mwili kupitia mapafu na pua" },
    ],
  },
  {
    title: "Panga hatua za mzunguko wa damu mwilini.",
    steps: [
      { id: "m1", label: "Moyo husukuma damu kuingia kwenye mishipa" },
      { id: "m2", label: "Damu husafiri kupitia mishipa kwenda sehemu zote za mwili" },
      { id: "m3", label: "Damu hufikisha oksijeni na virutubisho kwa chembe za mwili" },
      { id: "m4", label: "Damu isiyo na oksijeni hurudi moyoni" },
      { id: "m5", label: "Damu husafishwa na kupata oksijeni upya mapafuni" },
    ],
  },
  {
    title: "Panga hatua za figo kuchuja damu na kutengeneza mkojo.",
    steps: [
      { id: "f1", label: "Damu yenye uchafu huingia kwenye figo" },
      { id: "f2", label: "Figo huchuja uchafu na maji ya ziada kutoka kwenye damu" },
      { id: "f3", label: "Mkojo hutengenezwa kutokana na uchafu uliochujwa" },
      { id: "f4", label: "Mkojo hupita kwenye mirija kuelekea kibofuni" },
      { id: "f5", label: "Kibofu huhifadhi mkojo hadi utakapotolewa nje ya mwili" },
    ],
  },
  {
    title: "Panga hatua za ini kuchuja sumu mwilini.",
    steps: [
      { id: "i1", label: "Chakula au kinywaji chenye sumu huingia mwilini" },
      { id: "i2", label: "Damu hubeba dutu hiyo kwenda kwenye ini" },
      { id: "i3", label: "Ini huchuja sumu kutoka kwenye damu" },
      { id: "i4", label: "Ini hubadilisha sumu kuwa dutu isiyo hatari" },
      { id: "i5", label: "Mwili huondoa uchafu huo kupitia mkojo au haja kubwa" },
    ],
  },
  {
    title: "Panga hatua za wengu kuchuja damu ya zamani.",
    steps: [
      { id: "w1", label: "Damu iliyochakaa hupita kwenye wengu" },
      { id: "w2", label: "Wengu hutenganisha chembe za damu zilizochakaa" },
      { id: "w3", label: "Wengu huhifadhi chembe nyeupe za damu zenye afya kwa matumizi ya baadaye" },
      { id: "w4", label: "Mwili huondoa mabaki ya chembe za damu zilizochakaa" },
    ],
  },
];

const FILL_BLANKS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Kiungo kinachosukuma damu kwenda sehemu zote za mwili kinaitwa ", after: ".", correctAnswer: "moyo" },
  { before: "Viungo vinavyosaidia mwili kuvuta hewa safi na kutoa hewa chafu huitwa ", after: ".", correctAnswer: "mapafu" },
  { before: "Kiungo kinachosafisha sumu mwilini na kusaidia umeng'enyaji wa chakula ni ", after: ".", correctAnswer: "ini" },
  { before: "Kiungo kinachohifadhi mkojo kabla ya kutolewa nje ya mwili kinaitwa ", after: ".", correctAnswer: "kibofu" },
  { before: "Kiungo kinachochuja damu na kuiondolea chembe zilizochakaa ni ", after: ".", correctAnswer: "wengu" },
  { before: "Viungo vinavyochuja uchafu kutoka kwenye damu na kutengeneza mkojo huitwa ", after: ".", correctAnswer: "figo" },
  { before: "Kiungo kinachodhibiti mawazo na kumbukumbu za binadamu kinaitwa ", after: ".", correctAnswer: "ubongo" },
  { before: "Kiungo kinachotoa nguvu na umbo la mwili, na kulinda viungo vya ndani, ni ", after: ".", correctAnswer: "mifupa" },
  { before: "Vyombo vinavyosafirisha damu kutoka moyoni kwenda sehemu zote za mwili huitwa ", after: " za damu.", correctAnswer: "mishipa" },
  { before: "Kiungo kinachosaga chakula kwa kutumia asidi kinaitwa ", after: ".", correctAnswer: "tumbo" },
  { before: "Sehemu inayonyonya virutubisho kutoka kwa chakula kilichosagwa inaitwa ", after: ".", correctAnswer: "utumbo" },
  { before: "Kiungo kinachofunika na kulinda mwili wa ndani, na kudhibiti joto la mwili, ni ", after: ".", correctAnswer: "ngozi" },
];

const SCENARIOS: ((rng: RNG) => { prompt: string; correctId: string; wrongIds: string[]; explanation: string })[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anahisi maumivu makali kifuani na moyo unadunda haraka sana baada ya kukimbia mbio ndefu. Kiungo gani kinahusika zaidi na dalili hizi?`,
      correctId: "moyo",
      wrongIds: ["mapafu", "mishipa", "ubongo"],
      explanation: "Maumivu ya kifua yanayoambatana na kudunda kwa haraka yanahusiana zaidi na moyo, kiungo kinachosukuma damu mwilini.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anakohoa sana na kuhisi ugumu wa kupumua akiwa na homa kali. Kiungo gani kinahusika zaidi na dalili hizi?`,
      correctId: "mapafu",
      wrongIds: ["moyo", "mishipa", "ubongo"],
      explanation: "Ugumu wa kupumua na kikohozi vinaonyesha tatizo la mapafu, kiungo kinachohusika na kuvuta na kutoa hewa.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Daktari alimwambia ${who} kuwa kunywa pombe kupita kiasi kunaweza kudhuru kiungo kinachosafisha sumu mwilini. Ni kiungo gani hicho?`,
      correctId: "ini",
      wrongIds: ["figo", "tumbo", "wengu"],
      explanation: "Ini ndicho kiungo kinachosafisha sumu mwilini na kinaweza kuathirika sana na unywaji wa pombe kupita kiasi.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anahisi maumivu wakati wa kukojoa na kibofu chake kinajaa haraka mara kwa mara. Kiungo gani kina tatizo?`,
      correctId: "kibofu",
      wrongIds: ["figo", "tumbo", "wengu"],
      explanation: "Kibofu ndicho kiungo kinachohifadhi mkojo, na maumivu ya kukojoa yanaonyesha huenda kina tatizo.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Daktari alimwambia ${who} kuwa mwili wake unashindwa kuchuja uchafu vizuri kutoka kwenye damu, hivyo mkojo wake si safi. Kiungo gani kina tatizo?`,
      correctId: "figo",
      wrongIds: ["kibofu", "ini", "wengu"],
      explanation: "Figo ndizo zinazochuja uchafu kutoka kwenye damu na kutengeneza mkojo; tatizo hili linaonyesha figo hazifanyi kazi vizuri.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} aliangushwa wakati wa mchezo na daktari akasema anahitaji kuchunguzwa kwa uangalifu kwa sababu kiungo hiki huchuja damu ya zamani na kiko karibu na tumbo la kushoto. Ni kiungo gani hicho?`,
      correctId: "wengu",
      wrongIds: ["ini", "figo", "tumbo"],
      explanation: "Wengu ndicho kiungo kinachochuja damu ya zamani na kiko karibu na upande wa kushoto wa tumbo.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} alipigwa kichwa wakati wa mchezo na sasa anasahau mambo kwa urahisi na anahisi kizunguzungu. Kiungo gani kinahusika zaidi?`,
      correctId: "ubongo",
      wrongIds: ["moyo", "mifupa", "mishipa"],
      explanation: "Kumbukumbu na usawa wa mwili hudhibitiwa na ubongo, hivyo majeraha ya kichwa huathiri kiungo hicho.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} alianguka kwenye baiskeli na sasa mkono wake una maumivu makali karibu na kiwiko; daktari anadhani kiungo kigumu kilichompa mwili umbo kimeathirika. Ni kiungo gani hicho?`,
      correctId: "mifupa",
      wrongIds: ["ngozi", "mishipa", "moyo"],
      explanation: "Mifupa ndiyo inayotoa nguvu na umbo la mwili; maumivu makali karibu na kiwiko baada ya kuanguka yanahusiana zaidi na mifupa.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} alijikata mkononi na damu ikaanza kutoka nje kupitia kiungo kinachosafirisha damu mwilini. Ni kiungo gani hicho?`,
      correctId: "mishipa",
      wrongIds: ["moyo", "mifupa", "ngozi"],
      explanation: "Mishipa ndiyo vyombo vinavyosafirisha damu mwilini; jeraha linaloweza kutoa damu linahusisha mishipa iliyokatika.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} alipata mchubuko kwenye ngozi baada ya kuanguka baiskelini ${place(rng)}, na daktari alisema kiungo hicho kilikuwa kikimlinda dhidi ya vijidudu. Ni kiungo gani hicho?`,
      correctId: "ngozi",
      wrongIds: ["mifupa", "mishipa", "tumbo"],
      explanation: "Ngozi ndicho kiungo kinachofunika na kulinda mwili wa ndani dhidi ya vijidudu na madhara ya nje.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} alilalamika maumivu ya tumbo baada ya kula chakula kingi haraka sana, na daktari akasema kiungo hiki kinahitaji muda zaidi kusaga chakula. Ni kiungo gani hicho?`,
      correctId: "tumbo",
      wrongIds: ["utumbo", "ini", "figo"],
      explanation: "Tumbo ndicho kiungo kinachosaga chakula kwa kutumia asidi; kula haraka sana kunaweza kukilemea.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} alipatikana na tatizo la kunyonya virutubisho vizuri kutoka kwa chakula alichokula, na daktari akasema kiungo kinachonyonya virutubisho kinahitaji uchunguzi. Ni kiungo gani hicho?`,
      correctId: "utumbo",
      wrongIds: ["tumbo", "ini", "figo"],
      explanation: "Utumbo ndicho kiungo kinachonyonya virutubisho kutoka kwa chakula kilichosagwa na kukiingiza kwenye damu.",
    };
  },
];

export const kusomaViungoVyaMwili: Skill = {
  id: "g6-ksw-ks-viungo-vya-mwili",
  code: "KS.1",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ks",
  grade: 6,
  title: "Kusoma kwa Ufahamu: Msamiati wa Viungo vya Mwili",
  description: "Soma kwa ufahamu na ujifunze msamiati wa viungo vya ndani vya mwili (moyo, mapafu, ini, kibofu, wengu, figo, ubongo, mifupa, mishipa) pamoja na kazi zake za msingi na uhusiano wake na afya.",
  generate(rng) {
    const branch = randChoice(rng, ["kazi-match", "mfumo-sort", "kazi-order", "fill", "kazi-mc", "dalili"] as const);
    const hint = "Fikiria kazi ya kila kiungo ndani ya mwili na jinsi inavyohusiana na afya.";

    if (branch === "kazi-match") {
      const chosen = shuffle(rng, ORGANS).slice(0, randInt(rng, 5, 7));
      const tokens = shuffle(rng, chosen.map((o) => ({ id: o.id, label: o.jina })));
      const targets = shuffle(rng, chosen.map((o) => ({ id: o.id, label: o.kazi })));
      const correctMap: Record<string, string> = {};
      for (const o of chosen) correctMap[o.id] = o.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kiungo cha mwili na kazi yake.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((o) => `${o.jina} — ${o.kazi}`).join(" "),
      };
    }

    if (branch === "mfumo-sort") {
      const chosen = shuffle(rng, ORGANS).slice(0, randInt(rng, 7, 10));
      const items = chosen.map((o) => ({ id: o.id, label: o.jina }));
      const correctBucket: Record<string, string> = {};
      const usedSystems = new Set<string>();
      for (const o of chosen) {
        correctBucket[o.id] = o.mfumo;
        usedSystems.add(o.mfumo);
      }
      const buckets = SYSTEMS.filter((s) => usedSystems.has(s.id));
      return {
        kind: "categorize",
        prompt: "Panga kila kiungo cha mwili kulingana na mfumo unaohusika.",
        items: shuffle(rng, items),
        buckets,
        correctBucket,
        hint: "Fikiria kama kiungo kinahusika na kupumua, kusaga chakula, kusukuma damu, kutoa mkojo, kufikiri, au kulinda mwili.",
        explanation: chosen.map((o) => `${o.jina} ni sehemu ya ${SYSTEM_LABEL[o.mfumo]}.`).join(" "),
      };
    }

    if (branch === "kazi-order") {
      const set = randChoice(rng, ORDER_SETS);
      const shuffled = shuffle(rng, set.steps);
      return {
        kind: "ordering",
        prompt: set.title,
        instruction: "Bofya hatua kwa mfuatano sahihi.",
        items: shuffled,
        correctOrder: set.steps.map((s) => s.id),
        hint: "Fikiria jinsi kitu kinavyoingia mwilini na kusindikwa hatua kwa hatua.",
        explanation: set.steps.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const fb = randChoice(rng, FILL_BLANKS);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu viungo vya ndani vya mwili.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
      };
    }

    if (branch === "kazi-mc") {
      const organ = randChoice(rng, ORGANS);
      const mates = shuffle(rng, clusterMates(organ.id)).slice(0, 3);
      const choices = shuffle(rng, [organ.jina, ...mates.map((id) => ORGAN_BY_ID[id].jina)]);
      return {
        kind: "multiple-choice",
        prompt: `Kiungo gani hufanya kazi ifuatayo: "${organ.kazi}"?`,
        choices,
        correctIndex: choices.indexOf(organ.jina),
        layout: "list",
        hint,
        explanation: `${organ.jina.charAt(0).toUpperCase() + organ.jina.slice(1)} — ${organ.kazi}`,
      };
    }

    const scenario = randChoice(rng, SCENARIOS)(rng);
    const correctOrgan = ORGAN_BY_ID[scenario.correctId];
    const choices = shuffle(rng, [correctOrgan.jina, ...scenario.wrongIds.map((id) => ORGAN_BY_ID[id].jina)]);
    return {
      kind: "multiple-choice",
      prompt: scenario.prompt,
      choices,
      correctIndex: choices.indexOf(correctOrgan.jina),
      layout: "list",
      hint: "Fikiria kiungo ambacho dalili hizi zinaelekeza zaidi, si tu eneo la mwili.",
      explanation: scenario.explanation,
    };
  },
};
