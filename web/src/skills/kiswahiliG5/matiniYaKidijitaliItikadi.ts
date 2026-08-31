import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.10 Matini ya Kidijitali (Kudhibiti Itikadi za Kidini na za Kijamii).
// Kutambua na kufungua faili, kusakura kwenye tovuti salama; usalama mtandaoni (LAZIMA): kutoa habari kwa
// mwalimu/mzazi endapo mtu asiyemjua atawasiliana naye mtandaoni. Ona curriculum-reference/grade-5/kiswahili.json.

const DIJITALI: { neno: string; maana: string }[] = [
  { neno: "faili", maana: "hati au nyaraka iliyohifadhiwa kwenye kompyuta" },
  { neno: "folda", maana: "mahali pa kuhifadhi faili kadhaa pamoja kwenye kompyuta" },
  { neno: "kufungua", maana: "kitendo cha kuanzisha au kuonyesha faili kwenye skrini" },
  { neno: "kufunga", maana: "kitendo cha kuondoa faili kutoka kwenye skrini baada ya kuitumia" },
  { neno: "kuhifadhi", maana: "kitendo cha kuweka nakala ya kazi yako kwenye kompyuta ili isipotee" },
  { neno: "tovuti", maana: "mahali mtandaoni penye habari au huduma fulani" },
  { neno: "kivinjari", maana: "programu inayotumika kutembelea tovuti mtandaoni" },
  { neno: "kusakura", maana: "kitendo cha kutafuta habari kwenye mtandao" },
];

const USALAMA: { tabia: string; hali: "salama" | "hatari" }[] = [
  { tabia: "Kufungua faili alizopewa na mwalimu pekee.", hali: "salama" },
  { tabia: "Kumwambia mzazi endapo mtu asiyemfahamu atatuma ujumbe wa ajabu.", hali: "salama" },
  { tabia: "Kutumia tovuti salama alizoruhusiwa na mwalimu kutafuta habari.", hali: "salama" },
  { tabia: "Kufunga kompyuta na kutoa taarifa mtu akijaribu kuzungumza naye bila ruhusa.", hali: "salama" },
  { tabia: "Kumuuliza mzazi kabla ya kubofya kiungo kisichojulikana.", hali: "salama" },
  { tabia: "Kufungua faili kutoka kwa mtu asiyemfahamu bila kumwambia mzazi.", hali: "hatari" },
  { tabia: "Kuzungumza kwa siri na mgeni aliyewasiliana naye mtandaoni.", hali: "hatari" },
  { tabia: "Kutoa jina la shule na anwani ya nyumbani kwa mtu asiyemfahamu mtandaoni.", hali: "hatari" },
  { tabia: "Kukubali kukutana na rafiki wa mtandaoni bila ruhusa ya mzazi.", hali: "hatari" },
  { tabia: "Kubofya viungo vya ajabu vinavyoahidi zawadi bila kumuuliza mtu mzima.", hali: "hatari" },
];

const SENTENZA: { neno: string; sentensi: string }[] = [
  { neno: "faili", sentensi: "Mwalimu aliniomba nifungue faili ya kazi yangu." },
  { neno: "folda", sentensi: "Aliweka picha zake zote kwenye folda moja." },
  { neno: "kuhifadhi", sentensi: "Ni muhimu kuhifadhi kazi yako mara kwa mara." },
  { neno: "tovuti", sentensi: "Mwalimu alitupa tovuti salama ya kutafutia habari." },
  { neno: "kivinjari", sentensi: "Alitumia kivinjari kutembelea tovuti ya shule." },
  { neno: "kusakura", sentensi: "Alianza kusakura habari kuhusu mazingira mtandaoni." },
];

const MICHAKATO: string[][] = [
  [
    "Washa kompyuta na usubiri ianze vizuri.",
    "Tafuta folda inayohifadhi faili unayotaka.",
    "Bofya jina la faili mara mbili ili uifungue.",
    "Soma kifungu kilichomo kwenye faili hiyo.",
    "Funga faili baada ya kumaliza kusoma.",
  ],
  [
    "Fungua kivinjari cha mtandao kwa uangalifu.",
    "Ingia kwenye tovuti aliyoruhusu mwalimu.",
    "Sakura habari unayohitaji kwa maneno sahihi.",
    "Soma matokeo na umwambie mwalimu ikiwa una shaka.",
  ],
];

export const matiniYaKidijitaliItikadi: Skill = {
  id: "g5-ksw-ks-matini-ya-kidijitali-itikadi",
  code: "KS.10",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Matini ya Kidijitali (Kudhibiti Itikadi za Kidini na za Kijamii)",
  description: "Tambua msamiati wa kufungua na kuhifadhi faili, na hatua za kiusalama mtandaoni.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-tendo", "oanisha-dijitali", "panga-usalama", "jaza-dijitali", "panga-faili"] as const);

    if (branch === "tambua-tendo") {
      const d = randChoice(rng, DIJITALI);
      const choices = shuffle(rng, DIJITALI.map((x) => x.neno));
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "neno la kidijitali linalofaa maelezo haya")} Maelezo: ${d.maana}.`,
        choices,
        correctIndex: choices.indexOf(d.neno),
        layout: "row",
        hint: "Fikiria kitendo au kitu kinachohusiana na kompyuta au mtandao.",
        explanation: `"${d.neno}" ni ${d.maana}.`,
      };
    }

    if (branch === "oanisha-dijitali") {
      const chosen = shuffle(rng, DIJITALI).slice(0, 5);
      const tokens = chosen.map((d) => ({ id: d.neno, label: d.neno }));
      const targets = shuffle(rng, chosen).map((d) => ({ id: d.neno, label: d.maana }));
      const correctMap: Record<string, string> = {};
      for (const d of chosen) correctMap[d.neno] = d.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno la kidijitali na maana yake"),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Soma maana kwa makini kabla ya kuoanisha na neno lake.",
        explanation: chosen.map((d) => `"${d.neno}" ni ${d.maana}.`).join(" "),
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
        prompt: pangaPrompt(rng, "kama tabia hii ya kutumia kompyuta/mtandao ni salama au hatari"),
        items,
        buckets: [
          { id: "salama", label: "Salama" },
          { id: "hatari", label: "Hatari — Mwambie Mtu Mzima" },
        ],
        correctBucket,
        hint: "Kumbuka: mtu asiyemjua akiwasiliana nawe mtandaoni, mwambie mwalimu au mzazi mara moja.",
        explanation: "Ni hatari kuzungumza na wageni mtandaoni au kufungua faili zisizojulikana; ni salama kumwambia mwalimu au mzazi mara moja.",
      };
    }

    if (branch === "jaza-dijitali") {
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
        hint: "Fikiria neno la kidijitali linalofaa hapa.",
        explanation: `Sentensi kamili: "${s.sentensi}"`,
      };
    }

    const hatua = randChoice(rng, MICHAKATO);
    const items = hatua.map((h, i) => ({ id: `${i}-hatua`, label: h }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kufungua faili ili kusoma kwenye kompyuta"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria hatua ya kwanza kabla ya kufungua faili.",
      explanation: `Mpangilio sahihi: ${hatua.join(" ")}`,
    };
  },
};
