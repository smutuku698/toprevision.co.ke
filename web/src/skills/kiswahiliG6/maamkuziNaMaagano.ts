import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

type Muktadha = "rasmi" | "isiyo-rasmi" | "kidini";
type Aina = "maamkuzi" | "maagano";

const MISEMO: { neno: string; jibu: string; aina: Aina; muktadha: Muktadha }[] = [
  { neno: "Habari za asubuhi?", jibu: "Nzuri, asante.", aina: "maamkuzi", muktadha: "isiyo-rasmi" },
  { neno: "Waambaje?", jibu: "Wasuri.", aina: "maamkuzi", muktadha: "isiyo-rasmi" },
  { neno: "Hujambo?", jibu: "Sijambo.", aina: "maamkuzi", muktadha: "rasmi" },
  { neno: "U hali gani?", jibu: "Njema, asante.", aina: "maamkuzi", muktadha: "rasmi" },
  { neno: "Unaendeleaje?", jibu: "Naendelea vizuri.", aina: "maamkuzi", muktadha: "isiyo-rasmi" },
  { neno: "Salamu Aleikum.", jibu: "Waalaikum Salaam.", aina: "maamkuzi", muktadha: "kidini" },
  { neno: "Shikamoo.", jibu: "Marahaba.", aina: "maamkuzi", muktadha: "rasmi" },
  { neno: "Habari za mchana?", jibu: "Nzuri sana.", aina: "maamkuzi", muktadha: "isiyo-rasmi" },
  { neno: "Habari za jioni?", jibu: "Njema.", aina: "maamkuzi", muktadha: "isiyo-rasmi" },
  { neno: "Vipi rafiki?", jibu: "Poa sana.", aina: "maamkuzi", muktadha: "isiyo-rasmi" },
  { neno: "Hodi hodi?", jibu: "Karibu.", aina: "maamkuzi", muktadha: "rasmi" },
  { neno: "Mambo vipi?", jibu: "Safi kabisa.", aina: "maamkuzi", muktadha: "isiyo-rasmi" },
  { neno: "Habari za nyumbani?", jibu: "Nzuri, wote ni wazima.", aina: "maamkuzi", muktadha: "isiyo-rasmi" },
  { neno: "Bwana/Bibi, hamjambo?", jibu: "Hatujambo.", aina: "maamkuzi", muktadha: "rasmi" },
  { neno: "Mchana mwema.", jibu: "Mchana mwema kwako pia.", aina: "maagano", muktadha: "rasmi" },
  { neno: "Buriani.", jibu: "Karibu tena.", aina: "maagano", muktadha: "isiyo-rasmi" },
  { neno: "Baki salama.", jibu: "Nenda salama pia.", aina: "maagano", muktadha: "isiyo-rasmi" },
  { neno: "Kwaheri ya kuonana.", jibu: "Kwaheri, tuonane tena.", aina: "maagano", muktadha: "rasmi" },
  { neno: "Usiku mwema.", jibu: "Usiku mwema kwako pia.", aina: "maagano", muktadha: "isiyo-rasmi" },
  { neno: "Tutaonana kesho.", jibu: "Sawa, kwaheri.", aina: "maagano", muktadha: "isiyo-rasmi" },
  { neno: "Safari njema.", jibu: "Asante, nitajaribu.", aina: "maagano", muktadha: "isiyo-rasmi" },
  { neno: "Mungu akubariki safarini.", jibu: "Amina, ahsante.", aina: "maagano", muktadha: "kidini" },
  { neno: "Nakuaga kwa sasa.", jibu: "Sawa, nenda salama.", aina: "maagano", muktadha: "rasmi" },
  { neno: "Wallahi, kwaheri.", jibu: "Wallahi, kwaheri pia.", aina: "maagano", muktadha: "kidini" },
  { neno: "Lala salama.", jibu: "Wewe pia lala salama.", aina: "maagano", muktadha: "isiyo-rasmi" },
  { neno: "Tuonane siku nyingine.", jibu: "Ndiyo, hakika.", aina: "maagano", muktadha: "isiyo-rasmi" },
  { neno: "Nenda kwa amani.", jibu: "Asante, baki kwa amani.", aina: "maagano", muktadha: "kidini" },
  { neno: "Habari za kazi?", jibu: "Njema, asante Mungu.", aina: "maamkuzi", muktadha: "rasmi" },
  { neno: "Karibu nyumbani.", jibu: "Asante kwa mwaliko.", aina: "maamkuzi", muktadha: "rasmi" },
  { neno: "Heko kwa kazi nzuri.", jibu: "Asante sana.", aina: "maamkuzi", muktadha: "rasmi" },
  { neno: "Pole na kazi.", jibu: "Asante, tunaendelea.", aina: "maamkuzi", muktadha: "isiyo-rasmi" },
];

export const maamkuziNaMaagano: Skill = {
  id: "g6-ksw-kz-maamkuzi-na-maagano",
  code: "KZ.2",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Maamkuzi na Maagano",
  description: "Tambua na utumie aina mbalimbali za maamkuzi na maagano katika miktadha rasmi na isiyo rasmi.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-jibu", "oanisha-jibu", "panga-aina", "jaza-mazungumzo", "panga-mazungumzo"] as const);

    if (branch === "chagua-jibu") {
      const m = randChoice(rng, MISEMO);
      const makosaKundi = shuffle(rng, MISEMO.filter((x) => x.aina === m.aina && x.jibu !== m.jibu)).slice(0, 3).map((x) => x.jibu);
      const choices = shuffle(rng, [m.jibu, ...makosaKundi]);
      return {
        kind: "multiple-choice",
        prompt: `Ni jibu lipi sahihi kwa "${m.neno}"?`,
        choices,
        correctIndex: choices.indexOf(m.jibu),
        layout: "row",
        hint: `Hii ni ${m.aina} ya muktadha wa ${m.muktadha}.`,
        explanation: `Jibu sahihi kwa "${m.neno}" ni "${m.jibu}".`,
      };
    }

    if (branch === "oanisha-jibu") {
      const chosen = shuffle(rng, MISEMO).slice(0, 6);
      const tokens = chosen.map((m, i) => ({ id: `${i}`, label: m.neno }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: `${chosen.indexOf(m)}`, label: m.jibu }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_m, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: "Oanisha kila usemi na jibu lake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria mazungumzo halisi kati ya watu wawili.",
        explanation: chosen.map((m) => `"${m.neno}" hujibiwa kwa "${m.jibu}".`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const chosen = shuffle(rng, MISEMO).slice(0, 6);
      const items = chosen.map((m, i) => ({ id: `${i}-${m.neno}`, label: m.neno, bucket: m.aina }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga misemo hii: je, ni maamkuzi au maagano?",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "maamkuzi", label: "Maamkuzi" },
          { id: "maagano", label: "Maagano" },
        ],
        correctBucket,
        hint: "Maamkuzi hutumika mtu anapokutana na mwenzake; maagano hutumika wanapoachana.",
        explanation: chosen.map((m) => `"${m.neno}" ni ${m.aina}.`).join(" "),
      };
    }

    if (branch === "jaza-mazungumzo") {
      const m = randChoice(rng, MISEMO);
      const jina1 = randChoice(rng, KENYAN_NAMES);
      const jina2 = randChoice(rng, KENYAN_NAMES.filter((n) => n !== jina1));
      return {
        kind: "fill-blank",
        prompt: `${jina1} na ${jina2} wanazungumza. Kamilisha mazungumzo yao.`,
        before: `${jina1}: "${m.neno}"\n${jina2}: "`,
        after: `"`,
        correctAnswer: m.jibu,
        inputMode: "text",
        hint: `Fikiria jibu la kawaida kwa "${m.neno}".`,
        explanation: `Mazungumzo kamili: ${jina1}: "${m.neno}" — ${jina2}: "${m.jibu}"`,
      };
    }

    const m = randChoice(rng, MISEMO);
    const jina1 = randChoice(rng, KENYAN_NAMES);
    const jina2 = randChoice(rng, KENYAN_NAMES.filter((n) => n !== jina1));
    const kamili = `${jina1} alisema ${m.neno} ${jina2} akajibu ${m.jibu}`;
    const maneno = kamili.split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda mazungumzo sahihi ya maamkuzi/maagano.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `"${m.neno}" na "${m.jibu}" huenda pamoja katika mazungumzo.`,
      explanation: `Mpangilio sahihi: "${kamili}"`,
    };
  },
};
