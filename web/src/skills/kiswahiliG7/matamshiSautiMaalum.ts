import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const DH_WORDS: { neno: string; maana: string }[] = [
  { neno: "dhambi", maana: "kosa dhidi ya sheria za dini au maadili" },
  { neno: "dhahabu", maana: "chuma cha thamani cha rangi ya manjano" },
  { neno: "dhoruba", maana: "upepo mkali unaoambatana na mvua" },
  { neno: "udhu", maana: "unawaji unaofanywa kabla ya swala" },
];

const TH_WORDS: { neno: string; maana: string }[] = [
  { neno: "thamani", maana: "kiwango cha umuhimu au bei ya kitu" },
  { neno: "thelathini", maana: "namba 30" },
  { neno: "theluji", maana: "mvua nyeupe inayoganda kama barafu" },
];

const SENTENSI_DH_TH: { sentensi: string; sahihi: string; makosa: string[] }[] = [
  { sentensi: "Bibi Amina alinunua pete ya ___ sokoni Kisumu.", sahihi: "dhahabu", makosa: ["thamani", "theluji", "dhoruba"] },
  { sentensi: "Mvuvi alishindwa kutoka baharini kwa sababu ya ___ kali.", sahihi: "dhoruba", makosa: ["dhambi", "thelathini", "thamani"] },
  { sentensi: "Elimu ina ___ kubwa katika maisha ya kila mwanafunzi.", sahihi: "thamani", makosa: ["dhahabu", "udhu", "theluji"] },
  { sentensi: "Darasa lina wanafunzi ___ na watano.", sahihi: "thelathini", makosa: ["dhambi", "dhoruba", "udhu"] },
];

const D_ND_SENTENSI: { before: string; after: string; sahihi: string }[] = [
  { before: "Shati lake jeupe lina", after: " jeusi mkononi.", sahihi: "doa" },
  { before: "Wazazi wake walifunga", after: " kanisani mwaka jana.", sahihi: "ndoa" },
  { before: "Bidhaa hiyo ilikuwa ya kiwango", after: ", hivyo haikudumu.", sahihi: "duni" },
  { before: "Juma na Otieno ni", after: " wa kambo wanaoishi Kericho.", sahihi: "ndugu" },
];

const JOZI_SAUTI: { jozi: string; sahihi: boolean }[] = [
  { jozi: "doa / ndoa", sahihi: true },
  { jozi: "duni / nduni", sahihi: true },
  { jozi: "dugu / ndugu", sahihi: true },
  { jozi: "mbwa / paka", sahihi: false },
  { jozi: "shule / soko", sahihi: false },
  { jozi: "kalamu / kitabu", sahihi: false },
];

const HATUA_MAZOEZI = [
  { id: "tazama", label: "Tazama mdomo wa mwalimu unavyotamka sauti hiyo" },
  { id: "sikiliza", label: "Sikiliza mfano wa neno linalotumia sauti hiyo" },
  { id: "rudia", label: "Rudia kutamka neno lenyewe mara kadhaa" },
  { id: "tumia", label: "Tumia neno hilo katika sentensi kamili" },
  { id: "hakiki", label: "Hakiki matamshi yako na mwenzako au mwalimu" },
];

export const matamshiSautiMaalum: Skill = {
  id: "g7-ksw-kz-matamshi-sauti-maalum",
  code: "KZ.2",
  subjectId: "kiswahili",
  strandId: "g7-ksw-kz",
  grade: 7,
  title: "Matamshi ya Sauti Maalum: /dh/, /th/, /d/, /nd/",
  description: "Tambua, tofautisha, na utumie ipasavyo maneno yenye sauti /dh/, /th/, /d/, na /nd/.",
  generate(rng) {
    const branch = randChoice(rng, ["panga-dh-th", "oanisha-maana", "sentensi-dh-th", "sentensi-d-nd", "jozi-sahihi", "hatua-mazoezi"] as const);

    if (branch === "panga-dh-th") {
      const dh = shuffle(rng, DH_WORDS).slice(0, 3);
      const th = shuffle(rng, TH_WORDS).slice(0, 3);
      const items = shuffle(rng, [
        ...dh.map((w) => ({ id: w.neno, label: w.neno, bucket: "dh" })),
        ...th.map((w) => ({ id: w.neno, label: w.neno, bucket: "th" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila neno katika kundi la sauti /dh/ au sauti /th/.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "dh", label: "Sauti /dh/" },
          { id: "th", label: "Sauti /th/" },
        ],
        correctBucket,
        hint: "Sikiliza herufi mbili za mwanzo za kila neno kwa makini.",
        explanation: `Sauti /dh/: ${dh.map((w) => w.neno).join(", ")}. Sauti /th/: ${th.map((w) => w.neno).join(", ")}.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, [...DH_WORDS, ...TH_WORDS]).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((w) => ({ id: w.neno, label: w.neno })));
      const targets = shuffle(rng, chosen.map((w) => ({ id: w.neno, label: w.maana })));
      const correctMap: Record<string, string> = {};
      for (const w of chosen) correctMap[w.neno] = w.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila neno na maana yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria muktadha ambao kila neno hutumika.",
        explanation: chosen.map((w) => `"${w.neno}" humaanisha "${w.maana}".`).join(" "),
      };
    }

    if (branch === "sentensi-dh-th") {
      const entry = randChoice(rng, SENTENSI_DH_TH);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Chagua neno linalokamilisha sentensi ipasavyo: "${entry.sentensi}"`,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Zingatia maana ya sentensi nzima kabla ya kuchagua neno.",
        explanation: `Neno sahihi ni "${entry.sahihi}": "${entry.sentensi.replace("___", entry.sahihi)}"`,
      };
    }

    if (branch === "sentensi-d-nd") {
      const entry = randChoice(rng, D_ND_SENTENSI);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.sahihi,
        inputMode: "text",
        hint: "Sauti /d/ na /nd/ hutofautisha maana ya maneno haya kabisa — soma sentensi nzima kwa makini.",
        explanation: `Neno sahihi ni "${entry.sahihi}": "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    if (branch === "jozi-sahihi") {
      const jozi = shuffle(rng, JOZI_SAUTI).slice(0, 4);
      const items = jozi.map((j, i) => ({ id: `j${i}`, label: j.jozi, bucket: j.sahihi ? "sahihi" : "sikuwa" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila jozi ya maneno kulingana na kama inaonyesha tofauti ya sauti /d/ na /nd/ pekee au la.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "sahihi", label: "Inatofautiana kwa /d/ na /nd/ pekee" },
          { id: "sikuwa", label: "Haihusiani na /d/ na /nd/" },
        ],
        correctBucket,
        hint: "Angalia kama maneno mawili katika jozi yanafanana isipokuwa herufi 'n' ya ziada.",
        explanation: jozi.map((j) => `"${j.jozi}" ${j.sahihi ? "ni jozi inayotofautiana kwa /d/ na /nd/" : "si mfano wa tofauti ya /d/ na /nd/"}.`).join(" "),
      };
    }

    const items = shuffle(rng, HATUA_MAZOEZI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kujifunza matamshi bora ya sauti maalum kwa mpangilio unaofaa.",
      instruction: "Bofya kwa mpangilio sahihi kuanzia mwanzo hadi mwisho.",
      items,
      correctOrder: HATUA_MAZOEZI.map((h) => h.id),
      hint: "Kwanza tazama na sikiliza, kisha jaribu mwenyewe, na hatimaye hakiki matamshi yako.",
      explanation: HATUA_MAZOEZI.map((h) => h.label).join(" → "),
    };
  },
};
