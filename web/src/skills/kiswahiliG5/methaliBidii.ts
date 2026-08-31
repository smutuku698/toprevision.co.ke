import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Kukabiliana na Umaskini, mada ndogo 1.5 Methali — methali
// zinazohusu bidii na uvumilivu katika kazi. Ona curriculum-reference/grade-5/kiswahili.json.

type Tema = "bidii" | "subira";

const METHALI: { methali: string; maana: string; tema: Tema; blankBefore: string; blankAfter: string; blank: string }[] = [
  {
    methali: "Mchagua jembe si mkulima",
    maana: "Mtu anayekataa kufanya kazi ngumu au kuchagua kazi hafanikiwi kama mkulima wa kweli",
    tema: "bidii",
    blankBefore: "Mchagua jembe si ",
    blankAfter: "",
    blank: "mkulima",
  },
  {
    methali: "Mgagaa na upwa hali wali mkavu",
    maana: "Mtu anayefanya kazi kwa bidii ufuoni hufaidika, tofauti na mvivu",
    tema: "bidii",
    blankBefore: "Mgagaa na upwa hali wali ",
    blankAfter: "",
    blank: "mkavu",
  },
  {
    methali: "Atafutaye hupata",
    maana: "Mtu anayejitahidi kutafuta jambo hufaulu mwishowe",
    tema: "bidii",
    blankBefore: "Atafutaye ",
    blankAfter: "",
    blank: "hupata",
  },
  {
    methali: "Anayejitahidi hufaidi",
    maana: "Bidii katika kazi huleta faida kwa mhusika",
    tema: "bidii",
    blankBefore: "Anayejitahidi ",
    blankAfter: "",
    blank: "hufaidi",
  },
  {
    methali: "Ukiona vyaelea, jua vimeundwa",
    maana: "Mafanikio yanayoonekana hadharani ni matokeo ya bidii na maandalizi ya siri",
    tema: "bidii",
    blankBefore: "Ukiona vyaelea, jua ",
    blankAfter: "",
    blank: "vimeundwa",
  },
  {
    methali: "Haba na haba hujaza kibaba",
    maana: "Bidii ndogo ndogo za kila siku hukusanyika na kuleta mafanikio makubwa",
    tema: "bidii",
    blankBefore: "Haba na haba hujaza ",
    blankAfter: "",
    blank: "kibaba",
  },
  {
    methali: "Kawia ufike",
    maana: "Ni bora kuchelewa kidogo lakini kufanya kazi vizuri kuliko kuharakisha na kukosea",
    tema: "subira",
    blankBefore: "Kawia ",
    blankAfter: "",
    blank: "ufike",
  },
  {
    methali: "Subira huvuta heri",
    maana: "Uvumilivu katika kazi na maisha huleta baraka mwishowe",
    tema: "subira",
    blankBefore: "Subira huvuta ",
    blankAfter: "",
    blank: "heri",
  },
  {
    methali: "Asiyefanya kazi hastahili kula",
    maana: "Mtu ambaye hafanyi bidii kazini hastahili kupata riziki",
    tema: "bidii",
    blankBefore: "Asiyefanya kazi hastahili ",
    blankAfter: "",
    blank: "kula",
  },
  {
    methali: "Mvumilivu hula mbivu",
    maana: "Mtu mstahimilivu hatimaye hufaidika na matunda ya subira yake",
    tema: "subira",
    blankBefore: "Mvumilivu hula ",
    blankAfter: "",
    blank: "mbivu",
  },
];

export const methaliBidii: Skill = {
  id: "g5-ksw-kz-methali-bidii",
  code: "KZ.5",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Methali — Bidii (Kukabiliana na Umaskini)",
  description: "Tambua na utumie methali zinazohusu bidii na uvumilivu katika mawasiliano.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-maana", "oanisha-maana", "panga-tema", "jaza-methali", "panga-maneno"] as const);

    if (branch === "tambua-maana") {
      const m = randChoice(rng, METHALI);
      const makosa = shuffle(rng, METHALI.filter((x) => x.maana !== m.maana)).slice(0, 3).map((x) => x.maana);
      const choices = shuffle(rng, [m.maana, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "maana sahihi ya methali hii")} "${m.methali}."`,
        choices,
        correctIndex: choices.indexOf(m.maana),
        layout: "list",
        hint: "Fikiria funzo linaloelekezwa na methali hii kuhusu bidii au subira.",
        explanation: `Methali "${m.methali}" ina maana: ${m.maana}.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, METHALI).slice(0, 6);
      const tokens = chosen.map((m, i) => ({ id: `${i}`, label: m.methali }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: `${chosen.indexOf(m)}`, label: m.maana }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_m, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "methali na maana yake sahihi"),
        tokens,
        targets,
        correctMap,
        hint: "Soma methali kwa makini na ufikirie funzo lake.",
        explanation: chosen.map((m) => `"${m.methali}" ina maana: ${m.maana}.`).join(" "),
      };
    }

    if (branch === "panga-tema") {
      const bidiiChagua = shuffle(rng, METHALI.filter((m) => m.tema === "bidii")).slice(0, 4).map((m, i) => ({ id: `b-${i}`, label: m.methali, bucket: "bidii" }));
      const subiraChagua = shuffle(rng, METHALI.filter((m) => m.tema === "subira")).slice(0, 3).map((m, i) => ({ id: `s-${i}`, label: m.methali, bucket: "subira" }));
      const items = shuffle(rng, [...bidiiChagua, ...subiraChagua]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo methali inasisitiza bidii ya kazi au subira/uvumilivu"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "bidii", label: "Bidii ya Kazi" },
          { id: "subira", label: "Subira/Uvumilivu" },
        ],
        correctBucket,
        hint: "Baadhi ya methali zinasisitiza kufanya kazi kwa bidii, zingine zinasisitiza kusubiri kwa uvumilivu.",
        explanation: "Kila methali imewekwa kulingana na tema inayosisitizwa zaidi: bidii au subira.",
      };
    }

    if (branch === "jaza-methali") {
      const m = randChoice(rng, METHALI);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: m.blankBefore,
        after: m.blankAfter,
        correctAnswer: m.blank,
        inputMode: "text",
        hint: `Maana ya methali hii ni: ${m.maana}.`,
        explanation: `Methali kamili: "${m.methali}."`,
      };
    }

    const m = randChoice(rng, METHALI);
    const maneno = m.methali.split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "maneno ili kuunda methali sahihi"),
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Methali hii inahusu ${m.tema === "bidii" ? "bidii ya kazi" : "subira na uvumilivu"}.`,
      explanation: `Methali sahihi: "${m.methali}."`,
    };
  },
};
