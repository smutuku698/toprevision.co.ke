import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Sauti = "d/nd" | "ch/sh" | "j/nj" | "g/ng";

const MANENO: { neno: string; sauti: Sauti; upande: string }[] = [
  { neno: "dada", sauti: "d/nd", upande: "d" },
  { neno: "duka", sauti: "d/nd", upande: "d" },
  { neno: "dawa", sauti: "d/nd", upande: "d" },
  { neno: "daraja", sauti: "d/nd", upande: "d" },
  { neno: "deni", sauti: "d/nd", upande: "d" },
  { neno: "dirisha", sauti: "d/nd", upande: "d" },
  { neno: "ndizi", sauti: "d/nd", upande: "nd" },
  { neno: "ndege", sauti: "d/nd", upande: "nd" },
  { neno: "ndoo", sauti: "d/nd", upande: "nd" },
  { neno: "ndoto", sauti: "d/nd", upande: "nd" },
  { neno: "ndugu", sauti: "d/nd", upande: "nd" },
  { neno: "ndani", sauti: "d/nd", upande: "nd" },
  { neno: "choo", sauti: "ch/sh", upande: "ch" },
  { neno: "chai", sauti: "ch/sh", upande: "ch" },
  { neno: "chakula", sauti: "ch/sh", upande: "ch" },
  { neno: "chura", sauti: "ch/sh", upande: "ch" },
  { neno: "cheka", sauti: "ch/sh", upande: "ch" },
  { neno: "chelewa", sauti: "ch/sh", upande: "ch" },
  { neno: "shule", sauti: "ch/sh", upande: "sh" },
  { neno: "shamba", sauti: "ch/sh", upande: "sh" },
  { neno: "shati", sauti: "ch/sh", upande: "sh" },
  { neno: "shangazi", sauti: "ch/sh", upande: "sh" },
  { neno: "shukrani", sauti: "ch/sh", upande: "sh" },
  { neno: "sherehe", sauti: "ch/sh", upande: "sh" },
  { neno: "jua", sauti: "j/nj", upande: "j" },
  { neno: "jino", sauti: "j/nj", upande: "j" },
  { neno: "jiko", sauti: "j/nj", upande: "j" },
  { neno: "jibu", sauti: "j/nj", upande: "j" },
  { neno: "jasho", sauti: "j/nj", upande: "j" },
  { neno: "jani", sauti: "j/nj", upande: "j" },
  { neno: "njia", sauti: "j/nj", upande: "nj" },
  { neno: "njaa", sauti: "j/nj", upande: "nj" },
  { neno: "njiwa", sauti: "j/nj", upande: "nj" },
  { neno: "njoo", sauti: "j/nj", upande: "nj" },
  { neno: "njano", sauti: "j/nj", upande: "nj" },
  { neno: "nje", sauti: "j/nj", upande: "nj" },
  { neno: "gari", sauti: "g/ng", upande: "g" },
  { neno: "goti", sauti: "g/ng", upande: "g" },
  { neno: "giza", sauti: "g/ng", upande: "g" },
  { neno: "gogo", sauti: "g/ng", upande: "g" },
  { neno: "gunia", sauti: "g/ng", upande: "g" },
  { neno: "geuka", sauti: "g/ng", upande: "g" },
  { neno: "ngoma", sauti: "g/ng", upande: "ng" },
  { neno: "ngazi", sauti: "g/ng", upande: "ng" },
  { neno: "ngano", sauti: "g/ng", upande: "ng" },
  { neno: "ngamia", sauti: "g/ng", upande: "ng" },
  { neno: "ngozi", sauti: "g/ng", upande: "ng" },
];

const VITANZANDIMI: { sauti: Sauti; sentensi: string }[] = [
  { sauti: "d/nd", sentensi: "Dada alicheza ndani ya ndoo iliyokuwa na ndizi." },
  { sauti: "d/nd", sentensi: "Ndugu yangu alinunua dawa dukani karibu na daraja." },
  { sauti: "ch/sh", sentensi: "Chura alichelewa shuleni kwa sababu ya sherehe shambani." },
  { sauti: "ch/sh", sentensi: "Shangazi alinipa shati baada ya kunywa chai na kula chakula." },
  { sauti: "j/nj", sentensi: "Njiwa alipita njiani akiwa na njaa kubwa asubuhi." },
  { sauti: "j/nj", sentensi: "Jua lilipoingia ndani, jibu la jino langu lilijulikana." },
  { sauti: "g/ng", sentensi: "Gari lilipita ngoma zikipigwa karibu na ngazi ngamia alipita." },
  { sauti: "g/ng", sentensi: "Gogo kubwa lilianguka ndani ya gunia lililokuwa na ngano." },
];

export const matamshiBoraNaVitanzandimi: Skill = {
  id: "g6-ksw-kz-matamshi-bora-na-vitanzandimi",
  code: "KZ.1",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Matamshi Bora na Vitanzandimi (d/nd, ch/sh, j/nj, g/ng)",
  description: "Tambua na utamke silabi za sauti zinazokaribiana (d/nd, ch/sh, j/nj, g/ng) katika maneno na vitanzandimi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-sauti", "oanisha-vitanzandimi", "panga-sauti", "jaza-neno", "panga-tanzandimi"] as const);

    if (branch === "tambua-sauti") {
      const neno = randChoice(rng, MANENO);
      const wote = ["d/nd", "ch/sh", "j/nj", "g/ng"] as const;
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `Neno "${neno.neno}" lina sauti gani inayokaribiana kimatamshi?`,
        choices,
        correctIndex: choices.indexOf(neno.sauti),
        layout: "row",
        hint: `Tazama silabi ya "${neno.upande}" katika neno hili.`,
        explanation: `"${neno.neno}" lina sauti ya "${neno.upande}", ambayo ni sehemu ya jozi ya sauti ${neno.sauti}.`,
      };
    }

    if (branch === "oanisha-vitanzandimi") {
      const chosen = shuffle(rng, VITANZANDIMI).slice(0, 4);
      const tokens = chosen.map((v, i) => ({ id: `${i}`, label: v.sentensi }));
      const targets = shuffle(rng, chosen).map((v) => ({ id: `${chosen.indexOf(v)}`, label: `Kitanzandimi cha sauti ${v.sauti}` }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_v, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: "Oanisha kila kitanzandimi na sauti kinachozingatia.",
        tokens,
        targets,
        correctMap,
        hint: "Tafuta ni sauti gani zinazorudiwa mara nyingi katika kila sentensi.",
        explanation: chosen.map((v) => `Kitanzandimi "${v.sentensi}" kinazingatia sauti ${v.sauti}.`).join(" "),
      };
    }

    if (branch === "panga-sauti") {
      const sauti = randChoice(rng, ["d/nd", "ch/sh", "j/nj", "g/ng"] as const);
      const [a, b] = sauti.split("/");
      const itemsA = shuffle(rng, MANENO.filter((n) => n.sauti === sauti && n.upande === a)).slice(0, 3);
      const itemsB = shuffle(rng, MANENO.filter((n) => n.sauti === sauti && n.upande === b)).slice(0, 3);
      const items = shuffle(rng, [...itemsA, ...itemsB]).map((n) => ({ id: n.neno, label: n.neno, bucket: n.upande }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: `Panga maneno haya kulingana na sauti yaliyo nayo: "${a}" au "${b}"?`,
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
        prompt: `Kamilisha kitanzandimi hiki cha sauti ${v.sauti}.`,
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
      prompt: `Panga maneno haya kuunda kitanzandimi sahihi cha sauti ${v.sauti}.`,
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Soma kwa sauti ili kubaini mpangilio unaoleta maana.",
      explanation: `Kitanzandimi sahihi ni: "${v.sentensi}"`,
    };
  },
};
