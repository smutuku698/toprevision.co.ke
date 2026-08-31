import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Maadili, mada ndogo 1.6 Ushairi — kukariri shairi kwa
// kuzingatia matamshi na mahadhi, na kuelewa msamiati wa maadili: haki, usawa, heshima, uwajibikaji,
// pamoja na msamiati mwingine wa maadili unaoendana. Ona curriculum-reference/grade-5/kiswahili.json.

type Aina = "binafsi" | "kijamii";

const MAADILI: { neno: string; maana: string; aina: Aina }[] = [
  { neno: "haki", maana: "kutendewa au kutenda kwa usawa na ukweli", aina: "kijamii" },
  { neno: "usawa", maana: "kutokuwa na ubaguzi; kila mtu kupata fursa sawa", aina: "kijamii" },
  { neno: "heshima", maana: "kumthamini na kumjali mtu mwingine", aina: "kijamii" },
  { neno: "uwajibikaji", maana: "kutimiza wajibu wako ipasavyo", aina: "binafsi" },
  { neno: "uadilifu", maana: "kuwa mwaminifu na mwenye maadili mema", aina: "binafsi" },
  { neno: "uaminifu", maana: "kutokudanganya; kusema ukweli daima", aina: "binafsi" },
  { neno: "unyenyekevu", maana: "kutokuwa na kiburi; kujishusha mbele ya wengine", aina: "binafsi" },
  { neno: "ukarimu", maana: "kuwa tayari kutoa na kusaidia wengine", aina: "kijamii" },
  { neno: "uvumilivu", maana: "kustahimili magumu bila kukata tamaa", aina: "binafsi" },
  { neno: "umoja", maana: "kuwa pamoja na kushirikiana kama jamii", aina: "kijamii" },
  { neno: "upendo", maana: "kumjali na kumpenda mwenzako kwa dhati", aina: "kijamii" },
  { neno: "uwazi", maana: "kutokuficha ukweli; kuwa dhahiri katika matendo", aina: "kijamii" },
];

const HATUA_ZA_KUKARIRI = [
  { id: "1", label: "Soma shairi zima kwa makini kwanza." },
  { id: "2", label: "Elewa maana ya kila neno gumu lililotumika." },
  { id: "3", label: "Kariri ubeti mmoja kwa wakati mmoja." },
  { id: "4", label: "Zingatia matamshi na mahadhi unapokariri." },
  { id: "5", label: "Simama mbele ya wenzako na uwasilishe shairi kwa ujasiri." },
];

export const ushairiMaadili: Skill = {
  id: "g5-ksw-kz-ushairi-maadili",
  code: "KZ.6",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Ushairi — Maadili (Maadili)",
  description: "Elewa msamiati wa maadili unaotumika katika ushairi na uukariri kwa matamshi na mahadhi bora.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-maana", "oanisha-maana", "panga-aina", "jaza-maana", "panga-kukariri"] as const);

    if (branch === "tambua-maana") {
      const m = randChoice(rng, MAADILI);
      const makosa = shuffle(rng, MAADILI.filter((x) => x.neno !== m.neno)).slice(0, 3).map((x) => x.maana);
      const choices = shuffle(rng, [m.maana, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "maana sahihi ya neno hili la maadili")} "${m.neno}".`,
        choices,
        correctIndex: choices.indexOf(m.maana),
        layout: "list",
        hint: "Fikiria tabia inayohusiana na neno hili katika maisha ya kila siku.",
        explanation: `Neno "${m.neno}" linamaanisha: ${m.maana}.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, MAADILI).slice(0, 7);
      const tokens = chosen.map((m, i) => ({ id: `${i}`, label: m.neno }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: `${chosen.indexOf(m)}`, label: m.maana }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_m, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno la maadili na maana yake sahihi"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi kila neno linavyoonekana katika matendo ya watu.",
        explanation: chosen.map((m) => `"${m.neno}" inamaanisha: ${m.maana}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const binafsiChagua = shuffle(rng, MAADILI.filter((m) => m.aina === "binafsi")).slice(0, 3).map((m) => ({ id: m.neno, label: m.neno, bucket: "binafsi" }));
      const kijamiiChagua = shuffle(rng, MAADILI.filter((m) => m.aina === "kijamii")).slice(0, 3).map((m) => ({ id: m.neno, label: m.neno, bucket: "kijamii" }));
      const items = shuffle(rng, [...binafsiChagua, ...kijamiiChagua]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo neno la maadili linahusu tabia ya mtu binafsi au uhusiano wa kijamii"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "binafsi", label: "Tabia Njema Binafsi" },
          { id: "kijamii", label: "Tabia Njema za Kijamii" },
        ],
        correctBucket,
        hint: "Baadhi ya maadili yanaonekana kwa mtu mwenyewe, mengine yanaonekana katika uhusiano na wengine.",
        explanation: "Kila neno la maadili limewekwa kulingana na iwapo linahusu tabia ya mtu binafsi au uhusiano wake na jamii.",
      };
    }

    if (branch === "jaza-maana") {
      const m = randChoice(rng, MAADILI);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: "Katika shairi la maadili, neno ",
        after: ` linamaanisha ${m.maana}.`,
        correctAnswer: m.neno,
        inputMode: "text",
        hint: "Fikiria tabia njema inayoelezwa katika ufafanuzi huu.",
        explanation: `Neno "${m.neno}" linamaanisha: ${m.maana}.`,
      };
    }

    const chosen = shuffle(rng, HATUA_ZA_KUKARIRI);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kukariri shairi la maadili kwa usahihi"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: chosen,
      correctOrder: HATUA_ZA_KUKARIRI.map((h) => h.id),
      hint: "Fikiria unavyoanza kujifunza shairi jipya hadi unapoliwasilisha mbele ya wenzako.",
      explanation: "Mpangilio sahihi: " + HATUA_ZA_KUKARIRI.map((h) => h.label).join(" → "),
    };
  },
};
