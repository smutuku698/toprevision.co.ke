import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.9 Kusoma kwa Mapana — Matini ya Kujichagulia (Magonjwa). Msamiati wa
// afya kwa jumla (dalili, tiba, kinga) unaofaa umri, bila maelezo ya kimatibabu yenye kina.
// Ona curriculum-reference/grade-5/kiswahili.json.

type Aina = "dalili" | "tibakinga";
const MSAMIATI: { neno: string; maana: string; aina: Aina }[] = [
  { neno: "homa", maana: "hali ya mwili kuwa na joto jingi kuliko kawaida", aina: "dalili" },
  { neno: "kikohozi", maana: "kutoa sauti ya kukohoa mara kwa mara kutokana na muwasho wa koo", aina: "dalili" },
  { neno: "maumivu", maana: "hisia ya uchungu mwilini", aina: "dalili" },
  { neno: "kichefuchefu", maana: "hisia ya kutaka kutapika", aina: "dalili" },
  { neno: "uchovu", maana: "hali ya mwili kukosa nguvu", aina: "dalili" },
  { neno: "dawa", maana: "kitu kinachotumiwa kutibu ugonjwa", aina: "tibakinga" },
  { neno: "chanjo", maana: "sindano au dawa inayozuia mtu asipate ugonjwa fulani", aina: "tibakinga" },
  { neno: "daktari", maana: "mtaalamu wa kutibu wagonjwa", aina: "tibakinga" },
  { neno: "hospitali", maana: "mahali panapotolewa matibabu kwa wagonjwa", aina: "tibakinga" },
  { neno: "kinga", maana: "hatua za kuzuia mtu asipate ugonjwa", aina: "tibakinga" },
  { neno: "tiba", maana: "matibabu ya ugonjwa", aina: "tibakinga" },
];

const SENTENZA: { neno: string; sentensi: string }[] = [
  { neno: "homa", sentensi: "Mtoto alikuwa na homa kali usiku." },
  { neno: "kikohozi", sentensi: "Alikuwa na kikohozi kikali kwa siku tatu." },
  { neno: "dawa", sentensi: "Daktari alimpa mgonjwa dawa ya kupunguza maumivu." },
  { neno: "chanjo", sentensi: "Watoto wote walipewa chanjo dhidi ya surua." },
  { neno: "daktari", sentensi: "Mama alimpeleka mtoto kwa daktari alipougua." },
  { neno: "hospitali", sentensi: "Walimpeleka hospitali kwa dharura." },
  { neno: "kinga", sentensi: "Kunawa mikono ni njia bora ya kinga dhidi ya magonjwa." },
  { neno: "tiba", sentensi: "Alipata tiba nzuri baada ya kuonana na daktari." },
  { neno: "uchovu", sentensi: "Alihisi uchovu mkubwa baada ya kazi ngumu." },
  { neno: "maumivu", sentensi: "Alilalamika kuhusu maumivu ya tumbo usiku." },
  { neno: "kichefuchefu", sentensi: "Msichana alihisi kichefuchefu baada ya safari ndefu." },
];

const MICHAKATO: string[][] = [
  [
    "Tambua dalili unazohisi mwilini.",
    "Mwambie mzazi au mwalimu jinsi unavyohisi.",
    "Nenda kumwona daktari kwa uchunguzi.",
    "Tumia dawa ulizopewa na daktari ipasavyo.",
  ],
  [
    "Pima joto la mwili endapo unahisi vibaya.",
    "Pumzika na kunywa maji ya kutosha.",
    "Muone daktari ikiwa hali haiboreshi.",
    "Fuata maelekezo ya daktari kuhusu tiba na kinga.",
  ],
];

export const kusomaKwaMapanaMatiniKujichaguliaMagonjwa: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-mapana-matini-kujichagulia-magonjwa",
  code: "KS.9",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Mapana — Matini ya Kujichagulia (Magonjwa)",
  description: "Tambua msamiati wa afya (dalili, tiba na kinga) katika matini za aina mbalimbali.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-maana", "oanisha-afya", "panga-dalili", "jaza-afya", "panga-hatua"] as const);

    if (branch === "tambua-maana") {
      const m = randChoice(rng, MSAMIATI);
      const wengine = shuffle(rng, MSAMIATI.filter((x) => x.neno !== m.neno)).slice(0, 3);
      const choices = shuffle(rng, [m.maana, ...wengine.map((x) => x.maana)]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "maana sahihi ya neno hili la afya")} Neno: "${m.neno}".`,
        choices,
        correctIndex: choices.indexOf(m.maana),
        layout: "list",
        hint: "Fikiria muktadha wa neno hili linapotumika kuhusu afya.",
        explanation: `"${m.neno}" maana yake ni ${m.maana}.`,
      };
    }

    if (branch === "oanisha-afya") {
      const chosen = shuffle(rng, MSAMIATI).slice(0, 5);
      const tokens = chosen.map((m) => ({ id: m.neno, label: m.neno }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: m.neno, label: m.maana }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno la afya na maana yake"),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Soma maana kwa makini kabla ya kuoanisha na neno lake.",
        explanation: chosen.map((m) => `"${m.neno}" ni ${m.maana}.`).join(" "),
      };
    }

    if (branch === "panga-dalili") {
      const items = shuffle(rng, MSAMIATI).slice(0, 8).map((m, i) => ({ id: `${i}-${m.neno}`, label: m.neno }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) {
        const found = MSAMIATI.find((m) => m.neno === it.label)!;
        correctBucket[it.id] = found.aina;
      }
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama neno hili ni dalili ya ugonjwa au ni njia ya tiba/kinga"),
        items,
        buckets: [
          { id: "dalili", label: "Dalili" },
          { id: "tibakinga", label: "Tiba au Kinga" },
        ],
        correctBucket,
        hint: "Fikiria kama neno hili linaonyesha jinsi mtu anavyojisikia, au njia ya kumsaidia.",
        explanation: MSAMIATI.filter((m) => items.some((it) => it.label === m.neno))
          .map((m) => `"${m.neno}" ni ${m.aina === "dalili" ? "dalili" : "njia ya tiba/kinga"}.`)
          .join(" "),
      };
    }

    if (branch === "jaza-afya") {
      const s = randChoice(rng, SENTENZA);
      const maneno = s.sentensi.replace(".", "").split(" ");
      const idx = randChoice(
        rng,
        maneno.map((_w, i) => i).filter((i) => maneno[i].toLowerCase() === s.neno.toLowerCase())
      );
      const before = maneno.slice(0, idx).join(" ") + (idx > 0 ? " " : "");
      const after = " " + maneno.slice(idx + 1).join(" ") + ".";
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before,
        after,
        correctAnswer: s.neno,
        inputMode: "text",
        hint: "Fikiria neno la afya linalofaa hapa.",
        explanation: `Sentensi kamili: "${s.sentensi}"`,
      };
    }

    const hatua = randChoice(rng, MICHAKATO);
    const items = hatua.map((h, i) => ({ id: `${i}-hatua`, label: h }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kufuata mtu anapohisi mgonjwa"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria hatua ya kwanza mtu anapoanza kuhisi vibaya.",
      explanation: `Mpangilio sahihi: ${hatua.join(" ")}`,
    };
  },
};
