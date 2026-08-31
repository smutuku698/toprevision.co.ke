import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Mapishi, mada ndogo 1.1.1 Matamshi Bora — sauti zinazokaribiana
// kimatamshi: f/v, s/z, l/r, th/dh. Ona curriculum-reference/grade-5/kiswahili.json.

type Sauti = "f/v" | "s/z" | "l/r" | "th/dh";

const MANENO: { neno: string; sauti: Sauti; upande: string }[] = [
  { neno: "furaha", sauti: "f/v", upande: "f" },
  { neno: "fagio", sauti: "f/v", upande: "f" },
  { neno: "fedha", sauti: "f/v", upande: "f" },
  { neno: "funguo", sauti: "f/v", upande: "f" },
  { neno: "fisi", sauti: "f/v", upande: "f" },
  { neno: "fumbo", sauti: "f/v", upande: "f" },
  { neno: "vazi", sauti: "f/v", upande: "v" },
  { neno: "vitu", sauti: "f/v", upande: "v" },
  { neno: "vuguvugu", sauti: "f/v", upande: "v" },
  { neno: "vuvuzela", sauti: "f/v", upande: "v" },
  { neno: "vumbi", sauti: "f/v", upande: "v" },
  { neno: "vipuli", sauti: "f/v", upande: "v" },
  { neno: "sabuni", sauti: "s/z", upande: "s" },
  { neno: "safari", sauti: "s/z", upande: "s" },
  { neno: "samaki", sauti: "s/z", upande: "s" },
  { neno: "sufuria", sauti: "s/z", upande: "s" },
  { neno: "sanduku", sauti: "s/z", upande: "s" },
  { neno: "sikio", sauti: "s/z", upande: "s" },
  { neno: "zulia", sauti: "s/z", upande: "z" },
  { neno: "zawadi", sauti: "s/z", upande: "z" },
  { neno: "zamu", sauti: "s/z", upande: "z" },
  { neno: "zebra", sauti: "s/z", upande: "z" },
  { neno: "zana", sauti: "s/z", upande: "z" },
  { neno: "zizi", sauti: "s/z", upande: "z" },
  { neno: "lala", sauti: "l/r", upande: "l" },
  { neno: "lango", sauti: "l/r", upande: "l" },
  { neno: "lima", sauti: "l/r", upande: "l" },
  { neno: "limau", sauti: "l/r", upande: "l" },
  { neno: "leso", sauti: "l/r", upande: "l" },
  { neno: "lisha", sauti: "l/r", upande: "l" },
  { neno: "rafiki", sauti: "l/r", upande: "r" },
  { neno: "rangi", sauti: "l/r", upande: "r" },
  { neno: "rudi", sauti: "l/r", upande: "r" },
  { neno: "ruka", sauti: "l/r", upande: "r" },
  { neno: "roho", sauti: "l/r", upande: "r" },
  { neno: "rithi", sauti: "l/r", upande: "r" },
  { neno: "themanini", sauti: "th/dh", upande: "th" },
  { neno: "thelathini", sauti: "th/dh", upande: "th" },
  { neno: "thamani", sauti: "th/dh", upande: "th" },
  { neno: "thibitisha", sauti: "th/dh", upande: "th" },
  { neno: "dhambi", sauti: "th/dh", upande: "dh" },
  { neno: "dhahabu", sauti: "th/dh", upande: "dh" },
  { neno: "dharau", sauti: "th/dh", upande: "dh" },
  { neno: "dhoruba", sauti: "th/dh", upande: "dh" },
];

const VITANZANDIMI: { sauti: Sauti; sentensi: string }[] = [
  { sauti: "f/v", sentensi: "Fisi alifagia vumbi kwa furaha karibu na vazi lake." },
  { sauti: "f/v", sentensi: "Vipuli vyangu vilikuwa vumbini karibu na funguo za fedha." },
  { sauti: "s/z", sentensi: "Samaki wa sokoni walikuwa na zebra kwenye zulia lao safi." },
  { sauti: "s/z", sentensi: "Zawadi ya sabuni ilifungwa kwa zamu na sanduku la sufuria." },
  { sauti: "l/r", sentensi: "Rafiki yangu alilima limau karibu na lango la rangi." },
  { sauti: "l/r", sentensi: "Roho yake ilirudi baada ya kuruka juu ya leso lililolala." },
  { sauti: "th/dh", sentensi: "Thamani ya dhahabu ilithibitisha dhambi ya dharau yake." },
  { sauti: "th/dh", sentensi: "Thelathini na themanini ni namba zinazothibitisha dhoruba." },
];

export const matamshiBora: Skill = {
  id: "g5-ksw-kz-matamshi-bora",
  code: "KZ.1",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Matamshi Bora (f/v, s/z, l/r, th/dh)",
  description: "Tambua na utamke silabi za sauti zinazokaribiana (f/v, s/z, l/r, th/dh) katika maneno na vitanzandimi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-sauti", "oanisha-vitanzandimi", "panga-sauti", "jaza-neno", "panga-mpangilio"] as const);

    if (branch === "tambua-sauti") {
      const neno = randChoice(rng, MANENO);
      const wote = ["f/v", "s/z", "l/r", "th/dh"] as const;
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "jozi ya sauti inayokaribiana kimatamshi")} Neno: "${neno.neno}".`,
        choices,
        correctIndex: choices.indexOf(neno.sauti),
        layout: "row",
        hint: `Tazama silabi ya "${neno.upande}" katika neno hili.`,
        explanation: `"${neno.neno}" lina sauti ya "${neno.upande}", ambayo ni sehemu ya jozi ya sauti ${neno.sauti}.`,
      };
    }

    if (branch === "oanisha-vitanzandimi") {
      const sautiZote = ["f/v", "s/z", "l/r", "th/dh"] as const;
      const chosen = sautiZote.map((s) => randChoice(rng, VITANZANDIMI.filter((v) => v.sauti === s)));
      const tokens = chosen.map((v, i) => ({ id: `${i}`, label: v.sentensi }));
      const targets = shuffle(rng, chosen).map((v) => ({ id: `${chosen.indexOf(v)}`, label: `Kitanzandimi cha sauti ${v.sauti}` }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_v, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "kitanzandimi na sauti kinachozingatia"),
        tokens,
        targets,
        correctMap,
        hint: "Tafuta ni sauti gani zinazorudiwa mara nyingi katika kila sentensi.",
        explanation: chosen.map((v) => `Kitanzandimi "${v.sentensi}" kinazingatia sauti ${v.sauti}.`).join(" "),
      };
    }

    if (branch === "panga-sauti") {
      const sauti = randChoice(rng, ["f/v", "s/z", "l/r", "th/dh"] as const);
      const [a, b] = sauti.split("/");
      const itemsA = shuffle(rng, MANENO.filter((n) => n.sauti === sauti && n.upande === a)).slice(0, 3);
      const itemsB = shuffle(rng, MANENO.filter((n) => n.sauti === sauti && n.upande === b)).slice(0, 3);
      const items = shuffle(rng, [...itemsA, ...itemsB]).map((n) => ({ id: n.neno, label: n.neno, bucket: n.upande }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, `iwapo neno lina sauti "${a}" au "${b}"`),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: a, label: `Sauti ya "${a}"` },
          { id: b, label: `Sauti ya "${b}"` },
        ],
        correctBucket,
        hint: `Tazama iwapo silabi ina "${a}" pekee au "${b}" iliyoungana.`,
        explanation: `Maneno haya yamepangwa kulingana na sauti "${a}" au "${b}" katika jozi ya ${sauti}.`,
      };
    }

    if (branch === "jaza-neno") {
      const v = randChoice(rng, VITANZANDIMI);
      const maneno = v.sentensi.replace(".", "").split(" ");
      const nenoIndex = randChoice(
        rng,
        maneno.map((_, i) => i).filter((i) => MANENO.some((m) => m.neno.toLowerCase() === maneno[i].toLowerCase()))
      );
      const kwaKujaza = maneno[nenoIndex];
      const before = maneno.slice(0, nenoIndex).join(" ") + (nenoIndex > 0 ? " " : "");
      const after = " " + maneno.slice(nenoIndex + 1).join(" ") + ".";
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before,
        after,
        correctAnswer: kwaKujaza,
        inputMode: "text",
        hint: `Neno linalokosekana lina sauti ya ${v.sauti}.`,
        explanation: `Sentensi kamili: "${v.sentensi}"`,
      };
    }

    const v = randChoice(rng, VITANZANDIMI);
    const maneno = v.sentensi.replace(".", "").split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, `maneno ili kuunda kitanzandimi sahihi cha sauti ${v.sauti}`),
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Soma kwa sauti ili kubaini mpangilio unaoleta maana.",
      explanation: `Kitanzandimi sahihi ni: "${v.sentensi}"`,
    };
  },
};
