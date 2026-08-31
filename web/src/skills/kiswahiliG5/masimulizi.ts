import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Uwekezaji, mada ndogo 1.11 Masimulizi — kusimulia tungo kwa
// kuzingatia mada (Jinsi ya kuwekeza na faida za uwekezaji), ubunifu na usanifu wa lugha, pamoja na
// matumizi ya ishara za mwili (uso, mikono, mabega, macho, sauti, mwendo) kuimarisha masimulizi.
// Ona curriculum-reference/grade-5/kiswahili.json.

const ISHARA: { ishara: string; maelezo: string; muktadha: string }[] = [
  { ishara: "uso", maelezo: "kuonyesha hisia kama furaha au huzuni kupitia sura ya uso", muktadha: "Msimulizi anataka kuonyesha kwamba mhusika alikuwa na huzuni kubwa." },
  { ishara: "mikono", maelezo: "kuonyesha vitendo au ukubwa wa kitu kwa kutumia mikono", muktadha: "Msimulizi anataka kuonyesha jinsi samaki aliyevuliwa alivyokuwa mkubwa." },
  { ishara: "mabega", maelezo: "kuonyesha mshangao au kutojali kwa kuinua mabega", muktadha: "Msimulizi anataka kuonyesha kwamba mhusika alishangaa na hakujua la kufanya." },
  { ishara: "macho", maelezo: "kuvuta usikivu wa wasikilizaji kwa kutazamana nao machoni", muktadha: "Msimulizi anataka kuvuta usikivu wa wasikilizaji wote darasani." },
  { ishara: "sauti", maelezo: "kubadilisha toni ya sauti kuonyesha msisimko au utulivu", muktadha: "Msimulizi anataka kuonyesha kwamba tukio lililotokea lilikuwa la kutisha sana." },
  { ishara: "mwendo", maelezo: "kutembea au kusogea jukwaani kuonyesha mwendo wa hadithi", muktadha: "Msimulizi anataka kuonyesha kwamba mhusika alikuwa akikimbia kwa haraka." },
];

const VIPENGELE_MASIMULIZI_MAZURI = [
  { neno: "ubunifu", ni: true },
  { neno: "mada", ni: true },
  { neno: "usanifu wa lugha", ni: true },
  { neno: "ishara za mwili", ni: true },
  { neno: "kuchora picha ubaoni", ni: false },
  { neno: "kuimba wimbo wa taifa", ni: false },
  { neno: "kucheza mpira wa miguu", ni: false },
  { neno: "kupika chakula jikoni", ni: false },
];

const UWEKEZAJI_MSAMIATI: { neno: string; maana: string }[] = [
  { neno: "uwekezaji", maana: "kuweka fedha au rasilimali ili kupata faida baadaye" },
  { neno: "faida", maana: "ziada inayopatikana baada ya kuwekeza au kufanya biashara" },
  { neno: "mtaji", maana: "fedha ya awali inayotumika kuanzisha biashara au uwekezaji" },
  { neno: "akiba", maana: "fedha iliyowekwa kando kwa matumizi ya baadaye" },
  { neno: "hasara", maana: "upungufu unaotokea badala ya faida katika biashara" },
  { neno: "riba", maana: "ziada ya fedha inayolipwa juu ya mkopo au akiba benki" },
  { neno: "soko", maana: "mahali panapouzwa na kununuliwa bidhaa" },
  { neno: "biashara", maana: "shughuli ya kuuza na kununua ili kupata faida" },
];

const HATUA_ZA_MASIMULIZI = [
  { id: "1", label: "Anza kwa utangulizi unaovutia usikivu wa wasikilizaji." },
  { id: "2", label: "Eleza tukio kuu la hadithi kwa mpangilio." },
  { id: "3", label: "Tumia ishara za mwili kuimarisha ujumbe wako." },
  { id: "4", label: "Fikia kilele cha hadithi kwa msisimko." },
  { id: "5", label: "Malizia kwa hitimisho linaloacha funzo kwa wasikilizaji." },
];

export const masimulizi: Skill = {
  id: "g5-ksw-kz-masimulizi",
  code: "KZ.11",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Masimulizi (Uwekezaji)",
  description: "Sikiliza na usimulie tungo kwa kuzingatia mada, ubunifu, usanifu wa lugha na ishara za mwili.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-ishara", "oanisha-ishara", "panga-vipengele", "jaza-msamiati", "panga-hatua"] as const);

    if (branch === "tambua-ishara") {
      const s = randChoice(rng, ISHARA);
      const makosa = shuffle(rng, ISHARA.filter((x) => x.ishara !== s.ishara)).slice(0, 3).map((x) => x.ishara);
      const choices = shuffle(rng, [s.ishara, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "ishara ya mwili inayofaa zaidi katika hali hii")} ${s.muktadha}`,
        choices,
        correctIndex: choices.indexOf(s.ishara),
        layout: "row",
        hint: `Fikiria jinsi ${s.ishara} unavyoweza kuimarisha ujumbe wa msimulizi.`,
        explanation: `Katika hali hii, ${s.ishara} husaidia kwa ${s.maelezo}.`,
      };
    }

    if (branch === "oanisha-ishara") {
      const chosen = shuffle(rng, ISHARA).slice(0, 6);
      const tokens = chosen.map((s, i) => ({ id: `${i}`, label: s.ishara }));
      const targets = shuffle(rng, chosen).map((s) => ({ id: `${chosen.indexOf(s)}`, label: s.maelezo }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_s, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "ishara ya mwili na jinsi inavyoimarisha masimulizi"),
        tokens,
        targets,
        correctMap,
        hint: "Kila ishara ya mwili ina matumizi yake maalum katika kusimulia.",
        explanation: chosen.map((s) => `${s.ishara} husaidia kwa ${s.maelezo}.`).join(" "),
      };
    }

    if (branch === "panga-vipengele") {
      const njema = shuffle(rng, VIPENGELE_MASIMULIZI_MAZURI.filter((v) => v.ni)).slice(0, 4).map((v) => ({ id: v.neno, label: v.neno, bucket: "vipengele" }));
      const siNjema = shuffle(rng, VIPENGELE_MASIMULIZI_MAZURI.filter((v) => !v.ni)).slice(0, 3).map((v) => ({ id: v.neno, label: v.neno, bucket: "sio" }));
      const items = shuffle(rng, [...njema, ...siNjema]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo kipengele hiki ni sehemu ya masimulizi mazuri au la"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "vipengele", label: "Vipengele vya Masimulizi Mazuri" },
          { id: "sio", label: "Si Sehemu ya Masimulizi" },
        ],
        correctBucket,
        hint: "Masimulizi mazuri huzingatia mada, ubunifu, usanifu wa lugha na ishara za mwili.",
        explanation: "Ubunifu, mada, usanifu wa lugha na ishara za mwili ni vipengele muhimu vya masimulizi mazuri.",
      };
    }

    if (branch === "jaza-msamiati") {
      const u = randChoice(rng, UWEKEZAJI_MSAMIATI);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: "Katika mada ya uwekezaji, neno ",
        after: ` linamaanisha ${u.maana}.`,
        correctAnswer: u.neno,
        inputMode: "text",
        hint: "Fikiria msamiati unaotumika mtu anapozungumza kuhusu biashara na fedha.",
        explanation: `Neno "${u.neno}" linamaanisha ${u.maana}.`,
      };
    }

    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kusimulia hadithi kuhusu uwekezaji kwa mpangilio unaofaa"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: shuffle(rng, HATUA_ZA_MASIMULIZI),
      correctOrder: HATUA_ZA_MASIMULIZI.map((h) => h.id),
      hint: "Fikiria jinsi hadithi nzuri inavyoanza, inavyoendelea, na kumalizika.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_MASIMULIZI.map((h) => h.label).join(" → "),
    };
  },
};
