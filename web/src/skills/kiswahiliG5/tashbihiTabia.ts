import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Kudhibiti Itikadi za Kidini na za Kijamii, mada ndogo 1.10
// Tashbihi — tashbihi za tabia kama "mjanja kama sungura", pamoja na tashbihi nyingine za tabia
// zinazofahamika sana katika Kiswahili. Ona curriculum-reference/grade-5/kiswahili.json.

type Aina = "njema" | "mbaya";

const TASHBIHI: { kiini: string; kifananishi: string; tabia: string; aina: Aina }[] = [
  { kiini: "mjanja", kifananishi: "sungura", tabia: "ujanja/akili", aina: "njema" },
  { kiini: "mwoga", kifananishi: "sungura", tabia: "uoga", aina: "mbaya" },
  { kiini: "mkaidi", kifananishi: "punda", tabia: "ukaidi", aina: "mbaya" },
  { kiini: "mvumilivu", kifananishi: "ngamia", tabia: "uvumilivu", aina: "njema" },
  { kiini: "mwerevu", kifananishi: "mbweha", tabia: "uerevu", aina: "njema" },
  { kiini: "mkali", kifananishi: "simba", tabia: "ukali", aina: "mbaya" },
  { kiini: "mpole", kifananishi: "kondoo", tabia: "upole", aina: "njema" },
  { kiini: "mwepesi", kifananishi: "chui", tabia: "wepesi", aina: "njema" },
  { kiini: "mchapakazi", kifananishi: "nyuki", tabia: "uchapakazi", aina: "njema" },
];

export const tashbihiTabia: Skill = {
  id: "g5-ksw-kz-tashbihi-tabia",
  code: "KZ.10",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Tashbihi — Tabia (Kudhibiti Itikadi za Kidini na za Kijamii)",
  description: "Tambua na utumie tashbihi za tabia katika sentensi mbalimbali.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-tabia", "oanisha-tabia", "panga-aina", "jaza-tashbihi", "panga-tashbihi"] as const);

    if (branch === "tambua-tabia") {
      const t = randChoice(rng, TASHBIHI);
      const makosa = shuffle(rng, TASHBIHI.filter((x) => x.tabia !== t.tabia)).slice(0, 3).map((x) => x.tabia);
      const choices = shuffle(rng, [t.tabia, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "tabia inayoelezwa na tashbihi hii")} "${t.kiini} kama ${t.kifananishi}".`,
        choices,
        correctIndex: choices.indexOf(t.tabia),
        layout: "row",
        hint: `Fikiria sifa maarufu ya ${t.kifananishi} katika hadithi za Kiswahili.`,
        explanation: `Tashbihi "${t.kiini} kama ${t.kifananishi}" inaelezea tabia ya ${t.tabia}.`,
      };
    }

    if (branch === "oanisha-tabia") {
      const chosen = shuffle(rng, TASHBIHI).slice(0, 6);
      const tokens = chosen.map((t, i) => ({ id: `${i}`, label: `${t.kiini} kama ${t.kifananishi}` }));
      const targets = shuffle(rng, chosen).map((t) => ({ id: `${chosen.indexOf(t)}`, label: t.tabia }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_t, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "tashbihi na tabia inayolingana nayo"),
        tokens,
        targets,
        correctMap,
        hint: "Kila tashbihi inalinganisha mtu na kiumbe chenye sifa maalum.",
        explanation: chosen.map((t) => `"${t.kiini} kama ${t.kifananishi}" inaelezea tabia ya ${t.tabia}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const njemaChagua = shuffle(rng, TASHBIHI.filter((t) => t.aina === "njema")).slice(0, 3).map((t) => ({ id: t.kiini, label: `${t.kiini} kama ${t.kifananishi}`, bucket: "njema" }));
      const mbayaChagua = shuffle(rng, TASHBIHI.filter((t) => t.aina === "mbaya")).slice(0, 3).map((t) => ({ id: t.kiini, label: `${t.kiini} kama ${t.kifananishi}`, bucket: "mbaya" }));
      const items = shuffle(rng, [...njemaChagua, ...mbayaChagua]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo tashbihi inaelezea tabia njema au tabia mbaya"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "njema", label: "Tabia Njema" },
          { id: "mbaya", label: "Tabia Mbaya" },
        ],
        correctBucket,
        hint: "Fikiria kama tabia inayoelezwa inafaa kuigwa au la.",
        explanation: "Kila tashbihi imewekwa kulingana na iwapo inaelezea tabia njema au tabia mbaya.",
      };
    }

    if (branch === "jaza-tashbihi") {
      const t = randChoice(rng, TASHBIHI);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: `${t.kiini} kama `,
        after: "",
        correctAnswer: t.kifananishi,
        inputMode: "text",
        hint: `Tashbihi hii inaelezea tabia ya ${t.tabia}.`,
        explanation: `Tashbihi kamili: "${t.kiini} kama ${t.kifananishi}" — inaelezea ${t.tabia}.`,
      };
    }

    const t = randChoice(rng, TASHBIHI);
    const kamili = `${t.kiini} kama ${t.kifananishi}`;
    const maneno = kamili.split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "maneno ili kuunda tashbihi sahihi ya tabia"),
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Tashbihi hii inaelezea tabia ya ${t.tabia}.`,
      explanation: `Tashbihi sahihi: "${kamili}"`,
    };
  },
};
