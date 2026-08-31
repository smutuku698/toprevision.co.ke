import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 2.4.1-2 Nomino za Wingi na Vitenzi-jina (Huduma ya Kwanza).
// Ona curriculum-reference/grade-5/kiswahili.json.

const NOMINO_WINGI = [
  "chumvi", "sukari", "maji", "uji", "mafuta", "manukato", "unga", "mchele", "maziwa", "asali",
] as const;

const VITENZIJINA: { neno: string; maana: string }[] = [
  { neno: "kusoma", maana: "kutazama na kuelewa maandishi" },
  { neno: "kucheka", maana: "kuonyesha furaha kwa sauti" },
  { neno: "kula", maana: "kutafuna na kumeza chakula" },
  { neno: "kulia", maana: "kutoa machozi kwa huzuni au maumivu" },
  { neno: "kuandika", maana: "kuweka maneno kwenye karatasi" },
  { neno: "kucheza", maana: "kushiriki mchezo au burudani" },
  { neno: "kulala", maana: "kupumzika macho yakiwa yamefumba" },
  { neno: "kuruka", maana: "kujiondoa ardhini kwa muda kwa nguvu" },
  { neno: "kuimba", maana: "kutoa sauti ya nyimbo" },
  { neno: "kupika", maana: "kuandaa chakula kwa moto" },
  { neno: "kuoga", maana: "kujisafisha mwili kwa maji" },
  { neno: "kuamka", maana: "kuacha usingizi na kuinuka" },
];

const SENTENSI_JAZA: { jibu: string; before: string; after: string }[] = [
  { jibu: "chumvi", before: "Mama aliweka ", after: " kidogo kwenye supu." },
  { jibu: "sukari", before: "Tafadhali nipe ", after: " kwa chai yangu." },
  { jibu: "maji", before: "Tulikunywa ", after: " baridi baada ya mchezo." },
  { jibu: "uji", before: "Kila asubuhi tunakunywa ", after: " wa mahindi." },
  { jibu: "mafuta", before: "Sufuria ilijazwa ", after: " ya kupikia." },
  { jibu: "unga", before: "Duka lilikuwa limeuza ", after: " wote wa ngano." },
  { jibu: "maziwa", before: "Ng'ombe wetu hutupatia ", after: " safi kila siku." },
  { jibu: "kusoma", before: "Mtoto anapenda ", after: " vitabu vya hadithi." },
  { jibu: "kucheka", before: "Watoto walianza ", after: " walipoona mchezo huo." },
  { jibu: "kuandika", before: "Mwalimu alitufundisha ", after: " insha nzuri." },
  { jibu: "kuimba", before: "Kwaya ilijitayarisha ", after: " wimbo mpya." },
  { jibu: "kuoga", before: "Kabla ya kulala, mtoto alienda ", after: "." },
];

export const nominoZaWingiNaVitenzijina: Skill = {
  id: "g5-ksw-sarufi-nomino-wingi-vitenzijina",
  code: "SA.2",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Nomino za Wingi na Vitenzi-jina (Huduma ya Kwanza)",
  description: "Tambua na utumie nomino za wingi (mfano: chumvi, maji) na vitenzi-jina (mfano: kusoma, kula) katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-aina", "oanisha-kitenzijina", "panga-aina", "jaza-neno", "panga-shughuli"] as const);

    if (branch === "tambua-aina") {
      const chagua = randChoice(rng, [
        ...NOMINO_WINGI.map((n) => ({ neno: n, wingi: true })),
        ...VITENZIJINA.map((v) => ({ neno: v.neno, wingi: false })),
      ]);
      const choices = shuffle(rng, ["Nomino ya Wingi", "Kitenzi-jina"]);
      const sahihi = chagua.wingi ? "Nomino ya Wingi" : "Kitenzi-jina";
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "aina ya neno")} Neno: "${chagua.neno}".`,
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "row",
        hint: chagua.wingi ? "Nomino za wingi hutaja vitu visivyo na umoja mahususi." : "Vitenzi-jina huanza kwa 'ku-' na hutaja jina la kitendo.",
        explanation: `"${chagua.neno}" ni ${sahihi.toLowerCase()}.`,
      };
    }

    if (branch === "oanisha-kitenzijina") {
      const chosen = shuffle(rng, VITENZIJINA).slice(0, 4);
      const tokens = chosen.map((v, i) => ({ id: `${i}`, label: v.neno }));
      const targets = shuffle(rng, chosen).map((v) => ({ id: `${chosen.indexOf(v)}`, label: v.maana }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_v, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "kitenzi-jina na maana yake"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria ni kitendo gani kinachofanywa.",
        explanation: chosen.map((v) => `"${v.neno}" humaanisha ${v.maana}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const wingi = shuffle(rng, NOMINO_WINGI).slice(0, 4).map((n) => ({ id: n, label: n, bucket: "WINGI" }));
      const vitenzi = shuffle(rng, VITENZIJINA).slice(0, 4).map((v) => ({ id: v.neno, label: v.neno, bucket: "KITENZIJINA" }));
      const items = shuffle(rng, [...wingi, ...vitenzi]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo neno ni nomino ya wingi au kitenzi-jina"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "WINGI", label: "Nomino ya Wingi" },
          { id: "KITENZIJINA", label: "Kitenzi-jina" },
        ],
        correctBucket,
        hint: "Vitenzi-jina huanza na 'ku-'; nomino za wingi hazina umoja mahususi.",
        explanation: "Nomino za wingi hutaja vitu visivyohesabika kimoja kimoja; vitenzi-jina hutaja majina ya vitendo.",
      };
    }

    if (branch === "jaza-neno") {
      const s = randChoice(rng, SENTENSI_JAZA);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: s.before,
        after: s.after,
        correctAnswer: s.jibu,
        inputMode: "text",
        hint: s.jibu.startsWith("ku") ? "Neno linalokosekana ni kitenzi-jina." : "Neno linalokosekana ni nomino ya wingi.",
        explanation: `Sentensi kamili: "${s.before}${s.jibu}${s.after}"`,
      };
    }

    const ratiba = shuffle(rng, ["kuamka", "kuoga", "kula", "kusoma", "kucheza", "kulala"]).slice(0, 5);
    const items = ratiba.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    const mpangilioSahihi = ["kuamka", "kuoga", "kula", "kusoma", "kucheza", "kulala"].filter((w) => ratiba.includes(w));
    const correctOrder = mpangilioSahihi.map((w) => items.find((i) => i.label === w)!.id);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "vitenzi-jina hivi kulingana na ratiba ya kawaida ya siku"),
      instruction: "Bofya vitenzi-jina kwa mpangilio wa ratiba ya siku.",
      items: shuffle(rng, items),
      correctOrder,
      hint: "Fikiria shughuli za kawaida za siku kutoka asubuhi hadi jioni.",
      explanation: `Mpangilio wa ratiba: ${mpangilioSahihi.join(", ")}.`,
    };
  },
};
