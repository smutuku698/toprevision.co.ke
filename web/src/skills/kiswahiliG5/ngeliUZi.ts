import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 5.4.1 Ngeli ya U-ZI (Kukabiliana na Umaskini).
// Ona curriculum-reference/grade-5/kiswahili.json.

const NOMINO_UZI: { umoja: string; wingi: string }[] = [
  { umoja: "ufagio", wingi: "fagio" },
  { umoja: "ukurasa", wingi: "kurasa" },
  { umoja: "uzi", wingi: "nyuzi" },
  { umoja: "ukucha", wingi: "kucha" },
  { umoja: "upande", wingi: "pande" },
  { umoja: "ukuta", wingi: "kuta" },
];

const NOMINO_NJE_YA_UZI: { neno: string }[] = [
  { neno: "mtoto" },
  { neno: "kiti" },
  { neno: "jicho" },
  { neno: "nguo" },
];

const SENTENSI_UZI: { umoja: string; wingi: string; sentensiUmoja: string; sentensiWingi: string }[] = [
  { umoja: "ufagio", wingi: "fagio", sentensiUmoja: "Huu ni ufagio mpya wa darasa.", sentensiWingi: "Haya ni fagio mapya ya darasa." },
  { umoja: "ukurasa", wingi: "kurasa", sentensiUmoja: "Ukurasa huu umeraruka.", sentensiWingi: "Kurasa hizi zimeraruka." },
  { umoja: "uzi", wingi: "nyuzi", sentensiUmoja: "Uzi huu ni mrefu.", sentensiWingi: "Nyuzi hizi ni ndefu." },
  { umoja: "ukucha", wingi: "kucha", sentensiUmoja: "Ukucha wake umevunjika.", sentensiWingi: "Kucha zake zimevunjika." },
  { umoja: "upande", wingi: "pande", sentensiUmoja: "Upande huu wa barabara ni salama.", sentensiWingi: "Pande hizi za barabara ni salama." },
  { umoja: "ukuta", wingi: "kuta", sentensiUmoja: "Ukuta huu ni mrefu.", sentensiWingi: "Kuta hizi ni ndefu." },
];

export const ngeliUZi: Skill = {
  id: "g5-ksw-sarufi-ngeli-u-zi",
  code: "SA.6",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Ngeli ya U-ZI (Kukabiliana na Umaskini)",
  description: "Tambua viambishi vipatanishi vya ngeli ya U-ZI (mfano: ufagio-fagio, ukurasa-kurasa) katika umoja na wingi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-wingi", "oanisha-umoja-wingi", "panga-ngeli", "jaza-kiambishi", "panga-badiliko"] as const);

    if (branch === "tambua-wingi") {
      const n = randChoice(rng, NOMINO_UZI);
      const wote = shuffle(rng, NOMINO_UZI.map((x) => x.wingi));
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "wingi sahihi wa nomino hii")} "${n.umoja}"`,
        choices: wote,
        correctIndex: wote.indexOf(n.wingi),
        layout: "list",
        hint: "Nomino za ngeli ya U-ZI hubadilisha 'u-' kuwa hakuna kiambishi (mzizi tu) wingini.",
        explanation: `Wingi wa "${n.umoja}" ni "${n.wingi}".`,
      };
    }

    if (branch === "oanisha-umoja-wingi") {
      const chosen = shuffle(rng, NOMINO_UZI).slice(0, 4);
      const tokens = chosen.map((n) => ({ id: n.umoja, label: n.umoja }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.umoja, label: n.wingi }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.umoja] = n.umoja;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "nomino ya ngeli ya U-ZI umojani na wingi wake"),
        tokens,
        targets,
        correctMap,
        hint: "Ondoa 'u-' mwanzoni kupata wingi.",
        explanation: chosen.map((n) => `"${n.umoja}" wingi wake ni "${n.wingi}".`).join(" "),
      };
    }

    if (branch === "panga-ngeli") {
      const uzi = shuffle(rng, NOMINO_UZI).slice(0, 4).map((n) => ({ id: n.umoja, label: n.umoja, bucket: "UZI" }));
      const nje = shuffle(rng, NOMINO_NJE_YA_UZI).slice(0, 4).map((n) => ({ id: n.neno, label: n.neno, bucket: "NYINGINE" }));
      const items = shuffle(rng, [...uzi, ...nje]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo nomino ni ya ngeli ya U-ZI au ngeli nyingine"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "UZI", label: "Ngeli ya U-ZI" },
          { id: "NYINGINE", label: "Ngeli Nyingine" },
        ],
        correctBucket,
        hint: "Nomino za U-ZI huanza kwa 'u-' umojani na kuipoteza wingini.",
        explanation: "Nomino za ngeli ya U-ZI ni pamoja na ufagio, ukurasa, uzi, ukucha, upande na ukuta.",
      };
    }

    if (branch === "jaza-kiambishi") {
      const s = randChoice(rng, SENTENSI_UZI);
      const wingi = randChoice(rng, [true, false]);
      const sentensi = wingi ? s.sentensiWingi : s.sentensiUmoja;
      const jibu = wingi ? s.wingi : s.umoja;
      const idx = sentensi.toLowerCase().indexOf(jibu.toLowerCase());
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: sentensi.slice(0, idx),
        after: sentensi.slice(idx + jibu.length),
        correctAnswer: sentensi.slice(idx, idx + jibu.length),
        inputMode: "text",
        hint: wingi ? "Hii ni hali ya wingi." : "Hii ni hali ya umoja.",
        explanation: `Sentensi kamili: "${sentensi}"`,
      };
    }

    const n = randChoice(rng, NOMINO_UZI);
    const items = [
      { id: "umoja", label: n.umoja },
      { id: "wingi", label: n.wingi },
    ];
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, `hali ya nomino "${n.umoja}" kutoka umoja kwenda wingi`),
      instruction: "Bofya hali kwa mpangilio: umoja kisha wingi.",
      items: shuffle(rng, items),
      correctOrder: ["umoja", "wingi"],
      hint: "Umoja huja kabla ya wingi.",
      explanation: `Umoja: "${n.umoja}". Wingi: "${n.wingi}".`,
    };
  },
};
