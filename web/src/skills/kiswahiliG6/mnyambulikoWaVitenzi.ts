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

type Aina = "kutendeana" | "kutendesha" | "kutendua";

const AINA_MAELEZO: Record<Aina, string> = {
  kutendeana: "hali ya kutendeana huonyesha watu wawili au zaidi wakifanyiana jambo (kiambishi -an-)",
  kutendesha: "hali ya kutendesha huonyesha kumfanya/kumruhusu mtu mwingine kutenda jambo (kiambishi -ish-/-esh-)",
  kutendua: "hali ya kutendua huonyesha kubatilisha/kurudisha nyuma tendo lililokwisha fanyika (kiambishi -u-/-o-)",
};

const VITENZI: { mzizi: string; nyambulisho: string; aina: Aina; maana: string }[] = [
  { mzizi: "penda", nyambulisho: "pendana", aina: "kutendeana", maana: "kupendana" },
  { mzizi: "saidia", nyambulisho: "saidiana", aina: "kutendeana", maana: "kusaidiana" },
  { mzizi: "ona", nyambulisho: "onana", aina: "kutendeana", maana: "kuonana" },
  { mzizi: "salimia", nyambulisho: "salimiana", aina: "kutendeana", maana: "kusalimiana" },
  { mzizi: "gusa", nyambulisho: "gusana", aina: "kutendeana", maana: "kugusana" },
  { mzizi: "chukia", nyambulisho: "chukiana", aina: "kutendeana", maana: "kuchukiana" },
  { mzizi: "heshimu", nyambulisho: "heshimiana", aina: "kutendeana", maana: "kuheshimiana" },
  { mzizi: "andika", nyambulisho: "andikiana", aina: "kutendeana", maana: "kuandikiana" },
  { mzizi: "ambia", nyambulisho: "ambiana", aina: "kutendeana", maana: "kuambiana" },
  { mzizi: "elewa", nyambulisho: "elewana", aina: "kutendeana", maana: "kuelewana" },
  { mzizi: "fahamu", nyambulisho: "fahamiana", aina: "kutendeana", maana: "kufahamiana" },
  { mzizi: "piga", nyambulisho: "pigana", aina: "kutendeana", maana: "kupigana" },
  { mzizi: "soma", nyambulisho: "somesha", aina: "kutendesha", maana: "kufundisha kwa kumfanya mtu asome" },
  { mzizi: "la", nyambulisho: "lisha", aina: "kutendesha", maana: "kumfanya mtu/mnyama ale" },
  { mzizi: "jua", nyambulisho: "julisha", aina: "kutendesha", maana: "kumfanya mtu ajue" },
  { mzizi: "fika", nyambulisho: "fikisha", aina: "kutendesha", maana: "kumfanya kitu/mtu afike" },
  { mzizi: "amka", nyambulisho: "amsha", aina: "kutendesha", maana: "kumfanya mtu aamke" },
  { mzizi: "pita", nyambulisho: "pitisha", aina: "kutendesha", maana: "kukifanya kitu kipite" },
  { mzizi: "cheka", nyambulisho: "chekesha", aina: "kutendesha", maana: "kumfanya mtu acheke" },
  { mzizi: "anguka", nyambulisho: "angusha", aina: "kutendesha", maana: "kukifanya kitu kianguke" },
  { mzizi: "ingia", nyambulisho: "ingiza", aina: "kutendesha", maana: "kukifanya kitu kiingie" },
  { mzizi: "kimbia", nyambulisho: "kimbiza", aina: "kutendesha", maana: "kumfanya mtu akimbie (kufukuza)" },
  { mzizi: "simama", nyambulisho: "simamisha", aina: "kutendesha", maana: "kukifanya kitu kisimame" },
  { mzizi: "enda", nyambulisho: "endesha", aina: "kutendesha", maana: "kukifanya kitu kiende (kuendesha)" },
  { mzizi: "funga", nyambulisho: "fungua", aina: "kutendua", maana: "kubatilisha kufunga" },
  { mzizi: "vaa", nyambulisho: "vua", aina: "kutendua", maana: "kubatilisha kuvaa" },
  { mzizi: "ziba", nyambulisho: "zibua", aina: "kutendua", maana: "kubatilisha kuziba" },
  { mzizi: "chimba", nyambulisho: "chimbua", aina: "kutendua", maana: "kuchimba tena/kufukua" },
  { mzizi: "panga", nyambulisho: "pangua", aina: "kutendua", maana: "kubatilisha mpangilio" },
  { mzizi: "fumba", nyambulisho: "fumbua", aina: "kutendua", maana: "kubatilisha kufumba" },
  { mzizi: "tega", nyambulisho: "tegua", aina: "kutendua", maana: "kubatilisha mtego uliotegwa" },
  { mzizi: "kunja", nyambulisho: "kunjua", aina: "kutendua", maana: "kubatilisha kukunja" },
];

function distractors(rng: ReturnType<typeof import("@/lib/rng").makeRng>, correct: string, aina: Aina): string[] {
  const wengine = VITENZI.filter((v) => v.aina !== aina && v.nyambulisho !== correct);
  return shuffle(rng, wengine).slice(0, 3).map((v) => v.nyambulisho);
}

export const mnyambulikoWaVitenzi: Skill = {
  id: "g6-ksw-sarufi-mnyambuliko-wa-vitenzi",
  code: "SA.15",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Mnyambuliko wa Vitenzi (Kutendeana, Kutendesha, Kutendua)",
  description: "Tambua na utumie vitenzi katika hali ya kutendeana, kutendesha na kutendua.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-nyambulisho", "oanisha-maana", "panga-aina", "jaza-sentensi", "hali-halisi"] as const);

    if (branch === "chagua-nyambulisho") {
      const v = randChoice(rng, VITENZI);
      const makosa = distractors(rng, v.nyambulisho, v.aina);
      const choices = shuffle(rng, [v.nyambulisho, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Ni upi umbo la ${v.aina} la kitenzi "${v.mzizi}"?`,
        choices,
        correctIndex: choices.indexOf(v.nyambulisho),
        layout: "row",
        hint: AINA_MAELEZO[v.aina],
        explanation: `"${v.mzizi}" katika hali ya ${v.aina} huwa "${v.nyambulisho}" — ${v.maana}.`,
      };
    }

    if (branch === "oanisha-maana") {
      const aina = randChoice(rng, ["kutendeana", "kutendesha", "kutendua"] as const);
      const chosen = shuffle(rng, VITENZI.filter((v) => v.aina === aina)).slice(0, 6);
      const tokens = chosen.map((v) => ({ id: v.mzizi, label: v.nyambulisho }));
      const targets = shuffle(rng, chosen).map((v) => ({ id: v.mzizi, label: v.maana }));
      const correctMap: Record<string, string> = {};
      for (const v of chosen) correctMap[v.mzizi] = v.mzizi;
      return {
        kind: "click-match",
        prompt: `Oanisha kila kitenzi cha hali ya ${aina} na maana yake.`,
        tokens,
        targets,
        correctMap,
        hint: AINA_MAELEZO[aina],
        explanation: chosen.map((v) => `"${v.nyambulisho}" maana yake ni ${v.maana}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const chosen = shuffle(rng, VITENZI).slice(0, 6);
      const items = chosen.map((v) => ({ id: v.mzizi, label: v.nyambulisho, bucket: v.aina }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga vitenzi hivi kulingana na aina ya mnyambuliko wake.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "kutendeana", label: "Kutendeana" },
          { id: "kutendesha", label: "Kutendesha" },
          { id: "kutendua", label: "Kutendua" },
        ],
        correctBucket,
        hint: "Tazama kiambishi mwishoni mwa kitenzi: -an- (kutendeana), -ish-/-esh- (kutendesha), -u-/-o- (kutendua).",
        explanation: chosen.map((v) => `"${v.nyambulisho}" ni hali ya ${v.aina}.`).join(" "),
      };
    }

    if (branch === "jaza-sentensi") {
      const v = randChoice(rng, VITENZI);
      const jina1 = randChoice(rng, KENYAN_NAMES);
      const jina2 = randChoice(rng, KENYAN_NAMES.filter((n) => n !== jina1));
      const mahali = randChoice(rng, KENYAN_PLACES);
      const TEMPLATES: Record<Aina, { before: string; after: string }[]> = {
        kutendeana: [
          { before: `${jina1} na ${jina2} wa ${mahali} wanajua `, after: " vizuri sana." },
          { before: `Kila siku ${jina1} na ${jina2} hupenda `, after: " baada ya shule." },
          { before: `Watoto wa ${mahali} walikuwa `, after: " tangu utotoni." },
        ],
        kutendesha: [
          { before: `Mwalimu wa ${mahali} alimwomba ${jina1} `, after: ` wenzake somo hilo.` },
          { before: `${jina1} alimsaidia ${jina2} `, after: " kazi ile mapema." },
          { before: `Wazazi wa ${mahali} huwafanya watoto wao `, after: " kila asubuhi." },
        ],
        kutendua: [
          { before: `${jina1} alikuwa amelifunga sanduku, kisha akalifua`, after: `.`,},
          { before: `${jina1} wa ${mahali} alianza `, after: " mlango uliokuwa umefungwa." },
          { before: `Baada ya safari, ${jina1} alianza `, after: " begi lake." },
        ],
      };
      const t = randChoice(rng, TEMPLATES[v.aina]);
      return {
        kind: "fill-blank",
        prompt: `Kamilisha sentensi kwa kitenzi cha hali ya ${v.aina}.`,
        before: t.before,
        after: t.after,
        correctAnswer: v.nyambulisho,
        inputMode: "text",
        hint: AINA_MAELEZO[v.aina],
        explanation: `Sentensi kamili: "${t.before}${v.nyambulisho}${t.after}" — ${v.maana}.`,
      };
    }

    const v = randChoice(rng, VITENZI);
    const jina1 = randChoice(rng, KENYAN_NAMES);
    const jina2 = randChoice(rng, KENYAN_NAMES.filter((n) => n !== jina1));
    const mahali = randChoice(rng, KENYAN_PLACES);
    const kamili = `${jina1} na ${jina2} wa ${mahali} wanajua ${v.nyambulisho} vizuri.`;
    const maneno = kamili.replace(".", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: `Panga maneno haya kuunda sentensi sahihi yenye kitenzi cha hali ya ${v.aina}.`,
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: AINA_MAELEZO[v.aina],
      explanation: `Sentensi sahihi ni: "${kamili}" — "${v.nyambulisho}" ni hali ya ${v.aina}: ${v.maana}.`,
    };
  },
};
