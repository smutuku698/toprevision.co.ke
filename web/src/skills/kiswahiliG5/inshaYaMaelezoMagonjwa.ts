import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Insha ya Maelezo (Magonjwa)" — vigezo 6
// (verbatim): ujumbe, tahajia, anwani, muundo, mtindo, mapambo ya lugha (methali, nahau, tashbihi,
// istiari). Mada: kujikinga na magonjwa / umuhimu wa usafi. Ona curriculum-reference/grade-5/kiswahili.json.

type Kigezo = "ujumbe" | "tahajia" | "anwani" | "muundo" | "mtindo" | "mapambo-ya-lugha";

const KIGEZO_JINA: Record<Kigezo, string> = {
  ujumbe: "Ujumbe",
  tahajia: "Tahajia",
  anwani: "Anwani",
  muundo: "Muundo",
  mtindo: "Mtindo",
  "mapambo-ya-lugha": "Mapambo ya Lugha",
};

const KIGEZO_MAELEZO: Record<Kigezo, string> = {
  ujumbe: "lengo/maudhui makuu ya insha yanapaswa kueleweka wazi",
  tahajia: "uandishi sahihi wa maneno bila makosa ya kuandika",
  anwani: "kichwa kinachoonyesha mada ya insha kwa ufupi",
  muundo: "mpangilio wa insha (mwanzo, kati, mwisho au kichwa, mwili, hitimisho)",
  mtindo: "jinsi lugha inavyotumika kuvutia na kumshirikisha msomaji",
  "mapambo-ya-lugha": "matumizi ya methali, nahau, tashbihi na istiari kuboresha maandishi",
};

const KIGEZO_WOTE = Object.keys(KIGEZO_JINA) as Kigezo[];

const SENARIO: { maelezo: string; kigezo: Kigezo }[] = [
  { maelezo: "Insha ya mwanafunzi ilielezea wazi jinsi ya kujikinga na magonjwa — ujumbe ulikuwa dhahiri.", kigezo: "ujumbe" },
  { maelezo: "Msomaji hakuweza kuelewa lengo la insha kwa sababu mawazo yalikuwa yamechanganyika.", kigezo: "ujumbe" },
  { maelezo: "Insha ilishughulikia mada moja tu kwa uwazi kutoka mwanzo hadi mwisho.", kigezo: "ujumbe" },
  { maelezo: "Mwanafunzi aliandika neno 'ugojwa' badala ya 'ugonjwa' — hitilafu ya kuandika.", kigezo: "tahajia" },
  { maelezo: "Maneno yote katika insha yaliandikwa kwa usahihi bila makosa ya kuandika.", kigezo: "tahajia" },
  { maelezo: "Neno 'kuzuya' badala ya 'kuzuia' ni mfano wa kosa la kuandika.", kigezo: "tahajia" },
  { maelezo: "Insha ilikuwa na kichwa 'Jinsi ya Kujikinga na Magonjwa' kinachoeleza mada wazi.", kigezo: "anwani" },
  { maelezo: "Insha haikuwa na kichwa chochote mwanzoni mwa ukurasa.", kigezo: "anwani" },
  { maelezo: "Kichwa cha insha kilikuwa kifupi na cha kuvutia kuhusu usafi.", kigezo: "anwani" },
  { maelezo: "Insha ilikuwa na mwanzo, kati na mwisho ulioeleweka vizuri.", kigezo: "muundo" },
  { maelezo: "Aya za insha hazikuwa na mpangilio mzuri, mawazo yalirukaruka.", kigezo: "muundo" },
  { maelezo: "Insha ilifuata muundo sahihi: kichwa, mwili, hitimisho.", kigezo: "muundo" },
  { maelezo: "Mwandishi alitumia lugha ya kuvutia iliyomfanya msomaji aendelee kusoma.", kigezo: "mtindo" },
  { maelezo: "Lugha iliyotumika ilikuwa kavu na isiyovutia msomaji.", kigezo: "mtindo" },
  { maelezo: "Mtindo wa uandishi ulikuwa rahisi kueleweka na wenye mvuto.", kigezo: "mtindo" },
  { maelezo: "Mwandishi alitumia methali 'Haraka haraka haina baraka' kuonya kuhusu kuchukua dawa ovyo.", kigezo: "mapambo-ya-lugha" },
  { maelezo: "Sentensi 'Ugonjwa ulimshambulia kama simba mwenye njaa' ni mfano wa tashbihi.", kigezo: "mapambo-ya-lugha" },
  { maelezo: "Insha haikuwa na methali wala nahau yoyote, ilikuwa lugha tambarare.", kigezo: "mapambo-ya-lugha" },
];

const MAPAMBO_YA_LUGHA: string[] = [
  "Kinga ni bora kuliko tiba.",
  "Usafi ni nusu ya afya.",
  "Ugonjwa ulimshambulia kama simba mwenye njaa.",
  "Alikuwa na afya kama farasi kabla ya kuugua.",
  "Homa ilimla mwili wake taratibu.",
  "Maradhi yalimeza nguvu zake zote.",
];

const LUGHA_TAMBARARE: string[] = [
  "Ni muhimu kunawa mikono kabla ya kula chakula.",
  "Watu wanapaswa kupata chanjo ili kuzuia magonjwa.",
  "Kunywa maji safi husaidia kuepuka magonjwa ya tumbo.",
  "Usafi wa mazingira husaidia kupunguza magonjwa.",
  "Daktari alimpa mgonjwa dawa za kutosha.",
  "Shule ilifundisha wanafunzi kuhusu umuhimu wa usafi.",
];

const HATUA_ZA_KUHAKIKI = [
  { id: "1", label: "Soma insha tena ili kuhakikisha ujumbe umeeleweka" },
  { id: "2", label: "Hakiki anwani inaonyesha mada kwa ufupi" },
  { id: "3", label: "Angalia muundo wa insha (mwanzo, kati, mwisho)" },
  { id: "4", label: "Sahihisha makosa ya tahajia" },
  { id: "5", label: "Boresha mtindo wa lugha uwe wa kuvutia" },
  { id: "6", label: "Ongeza mapambo ya lugha kama methali au tashbihi inapofaa" },
];

export const inshaYaMaelezoMagonjwa: Skill = {
  id: "g5-ksw-ka-insha-ya-maelezo-magonjwa",
  code: "KA.9",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Insha ya Maelezo (Magonjwa)",
  description: "Tambua vigezo vya kuzingatia katika insha ya maelezo kuhusu magonjwa na uandike kwa mtindo ufaao.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-kigezo", "oanisha-kigezo", "panga-mapambo", "jaza-kinga", "panga-uhakiki"] as const);

    if (branch === "tambua-kigezo") {
      const s = randChoice(rng, SENARIO);
      const choices = shuffle(rng, KIGEZO_WOTE).slice(0, 4);
      if (!choices.includes(s.kigezo)) choices[0] = s.kigezo;
      const shuffledChoices = shuffle(rng, choices);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "kigezo cha insha kinachohusiana na hali hii")} "${s.maelezo}"`,
        choices: shuffledChoices.map((c) => KIGEZO_JINA[c]),
        correctIndex: shuffledChoices.indexOf(s.kigezo),
        layout: "list",
        hint: KIGEZO_MAELEZO[s.kigezo],
        explanation: `Hali hii inahusiana na kigezo cha ${KIGEZO_JINA[s.kigezo]} — ${KIGEZO_MAELEZO[s.kigezo]}.`,
      };
    }

    if (branch === "oanisha-kigezo") {
      const chosen = shuffle(rng, KIGEZO_WOTE).slice(0, 5);
      const tokens = chosen.map((k) => ({ id: k, label: KIGEZO_JINA[k] }));
      const targets = shuffle(rng, chosen).map((k) => ({ id: k, label: KIGEZO_MAELEZO[k] }));
      const correctMap: Record<string, string> = {};
      for (const k of chosen) correctMap[k] = k;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "kigezo cha insha ya maelezo na maelezo yake"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria vigezo sita vya insha bora: ujumbe, tahajia, anwani, muundo, mtindo, mapambo ya lugha.",
        explanation: chosen.map((k) => `${KIGEZO_JINA[k]}: ${KIGEZO_MAELEZO[k]}.`).join(" "),
      };
    }

    if (branch === "panga-mapambo") {
      const mapambo = shuffle(rng, MAPAMBO_YA_LUGHA).slice(0, 4);
      const tambarare = shuffle(rng, LUGHA_TAMBARARE).slice(0, 4);
      const items = shuffle(rng, [
        ...mapambo.map((s, i) => ({ id: `p${i}-${s}`, label: s, bucket: "mapambo" })),
        ...tambarare.map((s, i) => ({ id: `t${i}-${s}`, label: s, bucket: "tambarare" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo sentensi ina mapambo ya lugha (methali/tashbihi/istiari) au lugha tambarare"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "mapambo", label: "Ina Mapambo ya Lugha" },
          { id: "tambarare", label: "Lugha Tambarare (Bila Mapambo)" },
        ],
        correctBucket,
        hint: "Mapambo ya lugha hutumia methali, nahau, tashbihi au istiari badala ya maelezo ya moja kwa moja.",
        explanation:
          mapambo.map((s) => `"${s}" ina mapambo ya lugha.`).join(" ") +
          " " +
          tambarare.map((s) => `"${s}" ni lugha tambarare, bila mapambo.`).join(" "),
      };
    }

    if (branch === "jaza-kinga") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `${j} anaandika insha kuhusu magonjwa. Ni muhimu kunawa "`, after: `" kabla ya kula ili kuzuia magonjwa.`, jibu: "mikono" },
        { before: `Insha nzuri ya maelezo lazima iwe na "`, after: `" inayoeleweka wazi kuhusu kinga ya magonjwa.`, jibu: "ujumbe" },
        { before: `${j} alitumia methali inayosema "Kinga ni bora kuliko `, after: `" katika insha yake.`, jibu: "tiba" },
        { before: `Kuandika bila makosa ya kuandika kunaonyesha "`, after: `" nzuri.`, jibu: "tahajia" },
        { before: `Insha ya maelezo yenye mwanzo, kati na mwisho ina "`, after: `" mzuri.`, jibu: "muundo" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria msamiati wa kujikinga na magonjwa pamoja na vigezo vya insha bora.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_KUHAKIKI);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kuhakiki insha ya maelezo kabla ya kuiwasilisha"),
      instruction: "Bofya hatua kwa mpangilio unaofaa.",
      items: chosen,
      correctOrder: HATUA_ZA_KUHAKIKI.map((h) => h.id),
      hint: "Anza na ujumbe na muundo kwa ujumla, kisha maelezo madogo kama tahajia na mtindo.",
      explanation: "Mpangilio unaofaa: " + HATUA_ZA_KUHAKIKI.map((h) => h.label).join(" → "),
    };
  },
};
