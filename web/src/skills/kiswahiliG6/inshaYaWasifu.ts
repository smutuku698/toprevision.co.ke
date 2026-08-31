import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

type Sehemu = "kichwa" | "mwili" | "hitimisho";

const SEHEMU_MAELEZO: Record<Sehemu, string> = {
  kichwa: "kichwa/anwani cha insha huonyesha kwa ufupi ni nani/kitu gani insha inaelezea",
  mwili: "mwili wa insha huelezea kwa kina sifa, matukio na maelezo kuhusu mtu/kitu husika",
  hitimisho: "hitimisho hufunga insha kwa muhtasari au maoni ya mwisho ya mwandishi",
};

const SENTENSI_MFANO: { sentensi: string; sehemu: Sehemu }[] = [
  { sentensi: "Daktari Nimpendaye", sehemu: "kichwa" },
  { sentensi: "Mwalimu Wangu Ninayemheshimu", sehemu: "kichwa" },
  { sentensi: "Shujaa wa Usawa wa Kijinsia", sehemu: "kichwa" },
  { sentensi: "Kiongozi Ninayemsifu", sehemu: "kichwa" },
  { sentensi: "Alizaliwa mnamo mwaka wa elfu mbili katika kaunti ya Kisumu.", sehemu: "mwili" },
  { sentensi: "Anajulikana kwa uvumilivu na bidii katika kazi yake ya kila siku.", sehemu: "mwili" },
  { sentensi: "Kila siku huamka mapema ili kuhudumia wagonjwa hospitalini.", sehemu: "mwili" },
  { sentensi: "Amewahi kupokea tuzo mbalimbali kutokana na mchango wake katika jamii.", sehemu: "mwili" },
  { sentensi: "Alisoma katika Chuo Kikuu cha Nairobi kabla ya kuanza kazi yake.", sehemu: "mwili" },
  { sentensi: "Sifa zake za uongozi zimewafanya wengi kumtazama kama kielelezo.", sehemu: "mwili" },
  { sentensi: "Anapenda kufundisha watoto kuhusu haki sawa kwa wote.", sehemu: "mwili" },
  { sentensi: "Kwa jumla, ni mtu ninayemwenzi sana kwa mchango wake mkubwa.", sehemu: "hitimisho" },
  { sentensi: "Ninatarajia kuwa kama yeye siku moja nitakapokuwa mkubwa.", sehemu: "hitimisho" },
  { sentensi: "Ni wazi kuwa mtu huyu amechangia pakubwa katika maendeleo ya jamii yetu.", sehemu: "hitimisho" },
  { sentensi: "Napenda kila mwanafunzi ajifunze kutoka kwa mfano wake mzuri.", sehemu: "hitimisho" },
];

const HATUA_ZA_UANDISHI = [
  { id: "1", label: "Chagua mada ya insha ya wasifu" },
  { id: "2", label: "Jadili na kuandika vidokezo kuhusu mtu/kitu husika" },
  { id: "3", label: "Panga mawazo yako kwa mpangilio mzuri" },
  { id: "4", label: "Andika rasimu ya kwanza ya insha" },
  { id: "5", label: "Hakiki na sahihisha makosa ya kisarufi" },
  { id: "6", label: "Andika nakala safi ya mwisho" },
];

export const inshaYaWasifu: Skill = {
  id: "g6-ksw-ka-insha-ya-wasifu",
  code: "KA.1",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ka",
  grade: 6,
  title: "Insha ya Wasifu",
  description: "Tambua vipengele vya muundo wa insha ya wasifu na uipange kwa mpangilio sahihi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-sehemu", "oanisha-maelezo", "panga-sehemu", "jaza-kichwa", "panga-hatua"] as const);

    if (branch === "tambua-sehemu") {
      const s = randChoice(rng, SENTENSI_MFANO);
      const wote: Sehemu[] = ["kichwa", "mwili", "hitimisho"];
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `Sentensi "${s.sentensi}" inafaa kuwa katika sehemu gani ya insha ya wasifu?`,
        choices: choices.map((c) => (c === "kichwa" ? "Kichwa/Anwani" : c === "mwili" ? "Mwili" : "Hitimisho")),
        correctIndex: choices.indexOf(s.sehemu),
        layout: "row",
        hint: SEHEMU_MAELEZO[s.sehemu],
        explanation: `Sentensi hii inafaa katika sehemu ya ${s.sehemu} — ${SEHEMU_MAELEZO[s.sehemu]}.`,
      };
    }

    if (branch === "oanisha-maelezo") {
      const tokens = (["kichwa", "mwili", "hitimisho"] as const).map((s) => ({ id: s, label: s === "kichwa" ? "Kichwa/Anwani" : s === "mwili" ? "Mwili" : "Hitimisho" }));
      const targets = shuffle(rng, ["kichwa", "mwili", "hitimisho"] as const).map((s) => ({ id: s, label: SEHEMU_MAELEZO[s] }));
      const correctMap: Record<string, string> = { kichwa: "kichwa", mwili: "mwili", hitimisho: "hitimisho" };
      return {
        kind: "click-match",
        prompt: "Oanisha kila sehemu ya insha ya wasifu na kazi yake.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria mpangilio wa insha kutoka mwanzo hadi mwisho.",
        explanation: (["kichwa", "mwili", "hitimisho"] as const).map((s) => `${s}: ${SEHEMU_MAELEZO[s]}.`).join(" "),
      };
    }

    if (branch === "panga-sehemu") {
      const chosen = shuffle(rng, SENTENSI_MFANO).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `${i}-${s.sentensi}`, label: s.sentensi, bucket: s.sehemu }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na sehemu ya insha ya wasifu zinazofaa.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "kichwa", label: "Kichwa/Anwani" },
          { id: "mwili", label: "Mwili" },
          { id: "hitimisho", label: "Hitimisho" },
        ],
        correctBucket,
        hint: "Anwani ni fupi na ya kichwa; mwili una maelezo mengi; hitimisho hufunga insha.",
        explanation: chosen.map((s) => `"${s.sentensi}" inafaa katika sehemu ya ${s.sehemu}.`).join(" "),
      };
    }

    if (branch === "jaza-kichwa") {
      const jina = randChoice(rng, KENYAN_NAMES);
      const TEMPLATES = [
        { before: `${jina} anaandika insha kuhusu mtu anayemheshimu. Kichwa kifaacho ni "`, after: `".`, jibu: "Mtu Ninayemheshimu" },
        { before: `${jina} anaandika kuhusu daktari wake. Kichwa kifaacho ni "`, after: `".`, jibu: "Daktari Nimpendaye" },
        { before: `${jina} anaandika insha ya wasifu, na anaanza kwa sehemu ya "`, after: `" kabla ya mwili wa insha.`, jibu: "kichwa" },
        { before: `Baada ya mwili wa insha ya wasifu, ${jina} anapaswa kuandika sehemu ya "`, after: `".`, jibu: "hitimisho" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kuhusu uandishi wa insha ya wasifu.",
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Fikiria muundo wa insha ya wasifu: kichwa, mwili, hitimisho.",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_UANDISHI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kuandika insha ya wasifu kwa mpangilio sahihi.",
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_UANDISHI.map((h) => h.id),
      hint: "Fikiria mchakato wa uandishi kutoka mwanzo hadi mwisho.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_UANDISHI.map((h) => h.label).join(" → "),
    };
  },
};
