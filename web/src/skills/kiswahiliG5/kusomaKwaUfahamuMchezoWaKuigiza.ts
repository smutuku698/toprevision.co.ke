import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.8 Kusoma kwa Ufahamu — Mchezo wa Kuigiza (Ndege wa Porini). Msamiati
// wa ndege (verbatim kutoka muundo wa kimaudhui): chiriku, kasuku, tai, korongo, mwewe, kanga. Hazina hii
// imeachwa kwa maneno sita ya msingi pekee (chini ya kiwango cha 10+) kwa kufuata maagizo ya kuepuka
// kubuni majina ya ndege yasiyo na uhakika; muktadha wa sentensi/mchezo umebadilishwa ili kuleta tofauti.
// Ona curriculum-reference/grade-5/kiswahili.json.

const NDEGE: { neno: string; maelezo: string; mwindaji: boolean }[] = [
  { neno: "chiriku", maelezo: "ndege mdogo mwenye rangi za kuvutia, hupenda kuiga sauti", mwindaji: false },
  { neno: "kasuku", maelezo: "ndege mwenye uwezo wa kuiga sauti za binadamu", mwindaji: false },
  { neno: "tai", maelezo: "ndege mkubwa mwenye macho makali, huwinda wanyama wadogo angani", mwindaji: true },
  { neno: "korongo", maelezo: "ndege mwenye shingo ndefu, hupatikana karibu na maji", mwindaji: false },
  { neno: "mwewe", maelezo: "ndege mwindaji anayeshuka haraka kunasa mawindo yake", mwindaji: true },
  { neno: "kanga", maelezo: "ndege mwenye madoa meupe mwilini, hupatikana nyasini", mwindaji: false },
];

const SENTENZA: { neno: string; sentensi: string }[] = [
  { neno: "tai", sentensi: "MSIMULIZI: Ghafla, tai alishuka kutoka angani kuwinda sungura." },
  { neno: "kasuku", sentensi: "JUMA: Tazama! Kasuku wetu anaweza kuongea kama binadamu!" },
  { neno: "korongo", sentensi: "AMINA: Nimemwona korongo mrefu akisimama kando ya mto." },
  { neno: "mwewe", sentensi: "MSIMULIZI: Mwewe aliruka juu kutafuta mawindo yake." },
  { neno: "chiriku", sentensi: "BARAKA: Chiriku wangu anapenda kuimba asubuhi." },
  { neno: "kanga", sentensi: "MSIMULIZI: Kundi la kanga lilikimbia lilipoona mbwa." },
];

const MICHEZO: string[][] = [
  [
    "MSIMULIZI: Asubuhi moja, wanyama wa porini walikutana msituni.",
    "TAI: Leo hewa ni nzuri kwa kuruka juu angani.",
    "KASUKU: Mimi ninapenda kuzungumza na marafiki zangu wote.",
    "MSIMULIZI: Ndege wote waliishi kwa amani msituni mwao.",
  ],
  [
    "MSIMULIZI: Jioni moja, korongo alitembea kando ya mto.",
    "KORONGO: Ninatafuta samaki kwa ajili ya chakula cha jioni.",
    "MWEWE: Mimi pia ninawinda angani ili nipate chakula.",
    "MSIMULIZI: Kila ndege alipata riziki yake kwa njia yake.",
  ],
];

export const kusomaKwaUfahamuMchezoWaKuigiza: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-ufahamu-mchezo-wa-kuigiza",
  code: "KS.8",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Ufahamu — Mchezo wa Kuigiza (Ndege wa Porini)",
  description: "Tambua msamiati wa ndege wa porini na usome mchezo mfupi wa kuigiza kwa ufasaha.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-ndege", "oanisha-ndege", "panga-mwindaji", "jaza-mchezo", "panga-mchezo"] as const);

    if (branch === "tambua-ndege") {
      const n = randChoice(rng, NDEGE);
      const choices = shuffle(rng, NDEGE.map((x) => x.neno));
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "ndege anayelingana na maelezo haya")} Maelezo: ${n.maelezo}.`,
        choices,
        correctIndex: choices.indexOf(n.neno),
        layout: "row",
        hint: "Fikiria tabia au sifa maalum ya kila ndege.",
        explanation: `"${n.neno}" ni ${n.maelezo}.`,
      };
    }

    if (branch === "oanisha-ndege") {
      const chosen = shuffle(rng, NDEGE).slice(0, 5);
      const tokens = chosen.map((n) => ({ id: n.neno, label: n.neno }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.neno, label: n.maelezo }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.neno] = n.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "jina la ndege na sifa au tabia yake"),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Soma sifa kwa makini kabla ya kuoanisha na ndege wake.",
        explanation: chosen.map((n) => `"${n.neno}" ni ${n.maelezo}.`).join(" "),
      };
    }

    if (branch === "panga-mwindaji") {
      const items = shuffle(rng, NDEGE).map((n, i) => ({ id: `${i}-${n.neno}`, label: n.neno }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) {
        const found = NDEGE.find((n) => n.neno === it.label)!;
        correctBucket[it.id] = found.mwindaji ? "mwindaji" : "siyompwindaji";
      }
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama ndege huyu ni mwindaji (huwinda wanyama wengine) au la"),
        items,
        buckets: [
          { id: "mwindaji", label: "Ndege wa Mawindo" },
          { id: "siyompwindaji", label: "Si Ndege wa Mawindo" },
        ],
        correctBucket,
        hint: "Fikiria kama ndege huyu huwinda wanyama wengine kwa chakula.",
        explanation: NDEGE.map((n) => `"${n.neno}" ${n.mwindaji ? "ni" : "si"} ndege wa mawindo.`).join(" "),
      };
    }

    if (branch === "jaza-mchezo") {
      const s = randChoice(rng, SENTENZA);
      const maneno = s.sentensi.split(" ");
      const idx = randChoice(
        rng,
        maneno.map((_w, i) => i).filter((i) => maneno[i].toLowerCase().replace(/[.,!?]/g, "") === s.neno.toLowerCase())
      );
      const before = maneno.slice(0, idx).join(" ") + (idx > 0 ? " " : "");
      const after = maneno[idx].slice(s.neno.length) + " " + maneno.slice(idx + 1).join(" ");
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before,
        after: after.trimEnd(),
        correctAnswer: s.neno,
        inputMode: "text",
        hint: "Fikiria jina la ndege linalofaa katika mstari huu wa mchezo.",
        explanation: `Mstari kamili: "${s.sentensi}"`,
      };
    }

    const mchezo = randChoice(rng, MICHEZO);
    const items = mchezo.map((m, i) => ({ id: `${i}-mstari`, label: m }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "mistari hii ya mchezo wa kuigiza kwa mpangilio sahihi"),
      instruction: "Bofya mistari kwa mpangilio sahihi wa mchezo.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria ni mstari upi unaofaa kuanza mchezo.",
      explanation: `Mpangilio sahihi wa mchezo: ${mchezo.join(" ")}`,
    };
  },
};
