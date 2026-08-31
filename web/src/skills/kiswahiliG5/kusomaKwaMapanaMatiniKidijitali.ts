import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.4 Kusoma kwa Mapana — Matini ya Kidijitali (Saa na Majira). Msamiati
// wa saa: kasoro dakika, saa kamili, saa na dakika. Msamiati wa nyakati za siku: alfajiri, macheo, asubuhi,
// adhuhuri, thenashara, alasiri, machweo. Usalama mtandaoni (LAZIMA): kutoa habari kwa mwalimu/mzazi endapo
// mtu asiyemjua atawasiliana naye mtandaoni. Ona curriculum-reference/grade-5/kiswahili.json.

const NYAKATI: { neno: string; saa: string }[] = [
  { neno: "alfajiri", saa: "karibu saa kumi na moja usiku (5:00 asubuhi na mapema)" },
  { neno: "macheo", saa: "saa kumi na mbili asubuhi (6:00), jua likichomoza" },
  { neno: "asubuhi", saa: "kati ya saa moja na saa nne asubuhi (7:00-10:00)" },
  { neno: "adhuhuri", saa: "saa sita mchana (12:00 mchana)" },
  { neno: "thenashara", saa: "saa sita mchana hasa (12:00 adhuhuri)" },
  { neno: "alasiri", saa: "kati ya saa tisa na saa kumi na moja mchana (3:00-5:00)" },
  { neno: "machweo", saa: "saa kumi na mbili jioni (6:00), jua likizama" },
];

const SAA_AINA: { jina: string; mfano: string; maelezo: string }[] = [
  { jina: "Saa Kamili", mfano: "saa tatu kamili", maelezo: "saa inapokuwa sawasawa bila dakika za ziada" },
  { jina: "Saa na Dakika", mfano: "saa tatu na dakika kumi", maelezo: "saa inapokuwa na dakika kadhaa baada ya saa kamili" },
  { jina: "Kasoro Dakika", mfano: "saa tatu kasoro dakika kumi", maelezo: "dakika chache kabla ya saa inayofuata" },
];

const USALAMA: { tabia: string; hali: "salama" | "hatari" }[] = [
  { tabia: "Kumwambia mwalimu endapo mtu asiyemjua atawasiliana naye mtandaoni.", hali: "salama" },
  { tabia: "Kutumia tovuti alizoruhusiwa na mwalimu au mzazi pekee.", hali: "salama" },
  { tabia: "Kumwomba mzazi ruhusa kabla ya kutembelea tovuti mpya.", hali: "salama" },
  { tabia: "Kufunga kompyuta na kumwambia mzazi mtu akimtumia ujumbe wa ajabu.", hali: "salama" },
  { tabia: "Kutoa taarifa kwa mzazi endapo ataona jambo linalomtia wasiwasi mtandaoni.", hali: "salama" },
  { tabia: "Kumjibu mtu asiyemfahamu anayemtumia ujumbe mtandaoni bila kumwambia mzazi.", hali: "hatari" },
  { tabia: "Kutoa jina lake kamili na anwani ya nyumbani kwa mgeni mtandaoni.", hali: "hatari" },
  { tabia: "Kukubali kukutana na mtu aliyekutana naye mtandaoni pekee yake.", hali: "hatari" },
  { tabia: "Kubofya viungo visivyojulikana bila kumuuliza mtu mzima.", hali: "hatari" },
  { tabia: "Kuficha kutoka kwa wazazi ujumbe wa ajabu aliopokea mtandaoni.", hali: "hatari" },
];

const SENTENZA: { neno: string; sentensi: string }[] = [
  { neno: "alfajiri", sentensi: "Wakulima waliamka alfajiri kwenda shambani." },
  { neno: "macheo", sentensi: "Tuliona macheo mazuri ya jua ufukoni." },
  { neno: "asubuhi", sentensi: "Watoto huenda shuleni asubuhi kila siku." },
  { neno: "adhuhuri", sentensi: "Tulikula chakula cha adhuhuri saa sita mchana." },
  { neno: "alasiri", sentensi: "Timu ilifanya mazoezi ya mpira alasiri." },
  { neno: "machweo", sentensi: "Tulikaa ufukoni kutazama machweo ya jua." },
];

const ORDER_ITEMS = ["alfajiri", "macheo", "asubuhi", "thenashara", "alasiri", "machweo", "jioni", "usiku"];

export const kusomaKwaMapanaMatiniKidijitali: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-mapana-matini-kidijitali",
  code: "KS.4",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Mapana — Matini ya Kidijitali (Saa na Majira)",
  description: "Tambua msamiati wa saa na nyakati za siku katika matini ya kidijitali, na hatua za kiusalama mtandaoni.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-muda", "oanisha-nyakati", "panga-usalama", "jaza-nyakati", "panga-nyakati"] as const);

    if (branch === "tambua-muda") {
      const jamii = randChoice(rng, ["nyakati", "saa"] as const);
      if (jamii === "nyakati") {
        const n = randChoice(rng, NYAKATI);
        const choices = shuffle(rng, NYAKATI.map((x) => x.neno));
        return {
          kind: "multiple-choice",
          prompt: `${tambuaPrompt(rng, "neno la nyakati za siku linalofaa muda huu")} Muda: ${n.saa}.`,
          choices,
          correctIndex: choices.indexOf(n.neno),
          layout: "row",
          hint: "Fikiria ni sehemu gani ya siku ambayo saa hiyo hutokea.",
          explanation: `"${n.neno}" ni muda unaokaribiana na ${n.saa}.`,
        };
      }
      const s = randChoice(rng, SAA_AINA);
      const choices = shuffle(rng, SAA_AINA.map((x) => x.jina));
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "aina ya usemi wa saa inayolingana na mfano huu")} Mfano: "${s.mfano}" — ${s.maelezo}.`,
        choices,
        correctIndex: choices.indexOf(s.jina),
        layout: "list",
        hint: "Zingatia kama saa ni sawasawa, ina dakika za ziada, au kasoro dakika chache.",
        explanation: `"${s.mfano}" ni mfano wa ${s.jina.toLowerCase()}: ${s.maelezo}.`,
      };
    }

    if (branch === "oanisha-nyakati") {
      const chosen = shuffle(rng, NYAKATI).slice(0, 4);
      const tokens = chosen.map((n) => ({ id: n.neno, label: n.neno }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.neno, label: n.saa }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.neno] = n.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno la nyakati za siku na saa inayolingana nalo"),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Fikiria muda wa siku unaohusiana na kila neno.",
        explanation: chosen.map((n) => `"${n.neno}" ni karibu ${n.saa}.`).join(" "),
      };
    }

    if (branch === "panga-usalama") {
      const items = shuffle(rng, USALAMA).slice(0, 8).map((u, i) => ({ id: `${i}-usalama`, label: u.tabia }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) {
        const found = USALAMA.find((u) => u.tabia === it.label)!;
        correctBucket[it.id] = found.hali;
      }
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama tabia hii mtandaoni ni salama au hatari"),
        items,
        buckets: [
          { id: "salama", label: "Salama" },
          { id: "hatari", label: "Hatari — Mwambie Mtu Mzima" },
        ],
        correctBucket,
        hint: "Kumbuka: ukipata ujumbe kutoka kwa mtu usiyemjua mtandaoni, mwambie mwalimu au mzazi mara moja.",
        explanation: "Ni hatari kuzungumza na wageni mtandaoni au kutoa taarifa zako; ni salama kumwambia mwalimu au mzazi mara moja.",
      };
    }

    if (branch === "jaza-nyakati") {
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
        hint: "Fikiria neno la nyakati za siku linalofaa hapa.",
        explanation: `Sentensi kamili: "${s.sentensi}"`,
      };
    }

    const items = ORDER_ITEMS.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "nyakati za siku kuanzia alfajiri hadi usiku"),
      instruction: "Bofya nyakati kwa mpangilio wa siku.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Anza na muda wa mapema kabisa asubuhi.",
      explanation: `Mpangilio sahihi wa siku: ${ORDER_ITEMS.join(", ")}.`,
    };
  },
};
