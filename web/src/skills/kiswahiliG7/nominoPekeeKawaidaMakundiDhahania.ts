import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type NgeliAina = "Pekee" | "Kawaida" | "Makundi" | "Dhahania";

const NOMINO: { neno: string; aina: NgeliAina }[] = [
  { neno: "Kericho", aina: "Pekee" },
  { neno: "Wanjiku", aina: "Pekee" },
  { neno: "Jumatatu", aina: "Pekee" },
  { neno: "Mto Tana", aina: "Pekee" },
  { neno: "mti", aina: "Kawaida" },
  { neno: "meza", aina: "Kawaida" },
  { neno: "gari", aina: "Kawaida" },
  { neno: "kundi la wanafunzi", aina: "Makundi" },
  { neno: "umati wa watu", aina: "Makundi" },
  { neno: "jamii ya wafugaji", aina: "Makundi" },
  { neno: "upendo", aina: "Dhahania" },
  { neno: "elimu", aina: "Dhahania" },
  { neno: "haki", aina: "Dhahania" },
  { neno: "uzuri", aina: "Dhahania" },
];

const MAELEZO_AINA: Record<NgeliAina, string> = {
  Pekee: "Jina la mtu, mahali, siku, au kitu mahususi kimoja pekee, huandikwa kwa herufi kubwa",
  Kawaida: "Jina la kitu chochote cha aina yake, si mahususi",
  Makundi: "Jina linalotaja kundi la vitu au watu wengi kama kitu kimoja",
  Dhahania: "Jina la kitu kisichoshikika, kama hali, hisia, au dhana",
};

const SENTENSI: { sentensi: string; neno: string; sahihi: NgeliAina; makosa: NgeliAina[] }[] = [
  { sentensi: "Wanafunzi wa Kericho walishinda mashindano ya mchezo wa mpira.", neno: "Kericho", sahihi: "Pekee", makosa: ["Kawaida", "Makundi", "Dhahania"] },
  { sentensi: "Kundi la wafanyabiashara lilikutana sokoni kujadili bei ya mahindi.", neno: "Kundi", sahihi: "Makundi", makosa: ["Pekee", "Kawaida", "Dhahania"] },
  { sentensi: "Elimu ni muhimu kwa maendeleo ya jamii yoyote.", neno: "Elimu", sahihi: "Dhahania", makosa: ["Pekee", "Kawaida", "Makundi"] },
  { sentensi: "Mwalimu aliweka kitabu juu ya meza darasani.", neno: "meza", sahihi: "Kawaida", makosa: ["Pekee", "Makundi", "Dhahania"] },
];

const PENGO_NOMINO = [
  { before: "Jina 'Wanjiku' ni nomino ya", after: " kwa sababu linamtaja mtu mmoja mahususi.", sahihi: "pekee" },
  { before: "Neno 'jamii' linaloonyesha kundi la watu wengi ni nomino ya", after: ".", sahihi: "makundi" },
  { before: "Neno 'haki' halishikiki kwa mkono, hivyo ni nomino ya", after: ".", sahihi: "dhahania" },
];

export const nominoPekeeKawaidaMakundiDhahania: Skill = {
  id: "g7-ksw-sarufi-nomino-pekee-kawaida-makundi-dhahania",
  code: "SA.1",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Nomino: Pekee, Kawaida, Makundi na Dhahania",
  description: "Tambua na utumie ipasavyo nomino za pekee, za kawaida, za makundi, na za dhahania.",
  generate(rng) {
    const branch = randChoice(rng, ["panga-aina", "oanisha-maelezo", "aina-katika-sentensi", "pengo-nomino", "chagua-mfano", "panga-sentensi"] as const);

    if (branch === "panga-aina") {
      const chosen = [
        ...shuffle(rng, NOMINO.filter((n) => n.aina === "Pekee")).slice(0, 2),
        ...shuffle(rng, NOMINO.filter((n) => n.aina === "Kawaida")).slice(0, 2),
        ...shuffle(rng, NOMINO.filter((n) => n.aina === "Makundi")).slice(0, 2),
        ...shuffle(rng, NOMINO.filter((n) => n.aina === "Dhahania")).slice(0, 2),
      ];
      const items = chosen.map((n) => ({ id: n.neno, label: n.neno, bucket: n.aina }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila nomino katika kundi lake sahihi: Pekee, Kawaida, Makundi, au Dhahania.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Pekee", label: "Pekee" },
          { id: "Kawaida", label: "Kawaida" },
          { id: "Makundi", label: "Makundi" },
          { id: "Dhahania", label: "Dhahania" },
        ],
        correctBucket,
        hint: "Jiulize: je, nomino hii ni ya kitu mahususi kimoja, kitu cha kawaida, kundi la vitu, au dhana isiyoshikika?",
        explanation: chosen.map((n) => `"${n.neno}" ni nomino ya ${n.aina}.`).join(" "),
      };
    }

    if (branch === "oanisha-maelezo") {
      const aina: NgeliAina[] = ["Pekee", "Kawaida", "Makundi", "Dhahania"];
      const tokens = shuffle(rng, aina.map((a) => ({ id: a, label: a })));
      const targets = shuffle(rng, aina.map((a) => ({ id: a, label: MAELEZO_AINA[a] })));
      const correctMap: Record<string, string> = {};
      for (const a of aina) correctMap[a] = a;
      return {
        kind: "click-match",
        prompt: "Oanisha kila aina ya nomino na maelezo yake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kile kinachotofautisha kila aina ya nomino.",
        explanation: aina.map((a) => `Nomino ya ${a} — ${MAELEZO_AINA[a]}.`).join(" "),
      };
    }

    if (branch === "aina-katika-sentensi") {
      const entry = randChoice(rng, SENTENSI);
      const choices = shuffle(rng, [entry.sahihi, ...entry.makosa]);
      return {
        kind: "multiple-choice",
        prompt: `Katika sentensi "${entry.sentensi}", neno "${entry.neno}" ni nomino ya aina gani?`,
        choices,
        correctIndex: choices.indexOf(entry.sahihi),
        layout: "list",
        hint: "Zingatia jinsi neno hilo linavyotumika katika sentensi nzima.",
        explanation: `"${entry.neno}" ni nomino ya ${entry.sahihi} — ${MAELEZO_AINA[entry.sahihi]}.`,
      };
    }

    if (branch === "pengo-nomino") {
      const entry = randChoice(rng, PENGO_NOMINO);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa neno lifaalo.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.sahihi,
        inputMode: "text",
        hint: "Fikiria aina nne za nomino: pekee, kawaida, makundi, na dhahania.",
        explanation: `Sentensi kamili ni: "${entry.before} ${entry.sahihi}${entry.after}"`,
      };
    }

    if (branch === "chagua-mfano") {
      const targetAina = randChoice(rng, ["Pekee", "Kawaida", "Makundi", "Dhahania"] as const);
      const correctOption = randChoice(rng, NOMINO.filter((n) => n.aina === targetAina));
      const wrongOptions = shuffle(rng, NOMINO.filter((n) => n.aina !== targetAina)).slice(0, 3);
      const choices = shuffle(rng, [correctOption.neno, ...wrongOptions.map((n) => n.neno)]);
      return {
        kind: "multiple-choice",
        prompt: `Ni ipi kati ya hizi ni nomino ya ${targetAina.toLowerCase()}?`,
        choices,
        correctIndex: choices.indexOf(correctOption.neno),
        layout: "grid",
        hint: MAELEZO_AINA[targetAina],
        explanation: `"${correctOption.neno}" ni nomino ya ${targetAina} — ${MAELEZO_AINA[targetAina]}.`,
      };
    }

    const entry = randChoice(rng, SENTENSI);
    const words = entry.sentensi.replace(".", "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Neno "${entry.neno}" ni nomino ya ${entry.sahihi}.`,
      explanation: `Sentensi sahihi ni: "${entry.sentensi}"`,
    };
  },
};
