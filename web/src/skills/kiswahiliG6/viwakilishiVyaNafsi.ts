import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type PronounKey = "mimi" | "wewe" | "yeye" | "sisi" | "nyinyi" | "wao";

const PRONOUNS: {
  id: PronounKey;
  marker: string;
  nafsi: "kwanza" | "pili" | "tatu";
  idadi: "umoja" | "wingi";
  maelezo: string;
}[] = [
  { id: "mimi", marker: "ni", nafsi: "kwanza", idadi: "umoja", maelezo: "mzungumzaji mwenyewe, mtu mmoja anayejitaja yeye binafsi" },
  { id: "wewe", marker: "u", nafsi: "pili", idadi: "umoja", maelezo: "mtu mmoja anayeongeleshwa moja kwa moja na mzungumzaji" },
  { id: "yeye", marker: "a", nafsi: "tatu", idadi: "umoja", maelezo: "mtu mmoja anayezungumziwa, si mzungumzaji wala msikilizaji" },
  { id: "sisi", marker: "tu", nafsi: "kwanza", idadi: "wingi", maelezo: "mzungumzaji pamoja na wenzake, kikundi kinachojumuisha yeye mwenyewe" },
  { id: "nyinyi", marker: "m", nafsi: "pili", idadi: "wingi", maelezo: "kikundi cha watu wanaoongeleshwa moja kwa moja na mzungumzaji" },
  { id: "wao", marker: "wa", nafsi: "tatu", idadi: "wingi", maelezo: "kikundi cha watu wanaozungumziwa, si wazungumzaji wala wasikilizaji" },
];

const PRONOUN_MAP: Record<PronounKey, (typeof PRONOUNS)[number]> = {
  mimi: PRONOUNS[0],
  wewe: PRONOUNS[1],
  yeye: PRONOUNS[2],
  sisi: PRONOUNS[3],
  nyinyi: PRONOUNS[4],
  wao: PRONOUNS[5],
};

function conjugate(marker: string, stem: string): string {
  return `${marker}na${stem}`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const VERBS: { stem: string; rest: string }[] = [
  { stem: "soma", rest: "kitabu maktabani" },
  { stem: "cheza", rest: "mpira uwanjani" },
  { stem: "imba", rest: "nyimbo za asili" },
  { stem: "lala", rest: "mapema kila usiku" },
  { stem: "kimbia", rest: "kwa kasi mashindanoni" },
  { stem: "pika", rest: "chakula jikoni" },
  { stem: "andika", rest: "insha ya Kiswahili" },
  { stem: "ogelea", rest: "kwenye bwawa la shule" },
  { stem: "lima", rest: "shambani asubuhi" },
  { stem: "saidia", rest: "wazazi nyumbani" },
  { stem: "cheka", rest: "kwa furaha darasani" },
  { stem: "chora", rest: "picha nzuri ubaoni" },
  { stem: "safisha", rest: "chumba chake kila wiki" },
  { stem: "penda", rest: "masomo ya sayansi" },
  { stem: "jua", rest: "jibu la swali gumu" },
  { stem: "taka", rest: "kwenda safari ya shule" },
  { stem: "ona", rest: "ndege wakiruka angani" },
  { stem: "sikia", rest: "habari njema redioni" },
  { stem: "fika", rest: "shuleni mapema kila siku" },
  { stem: "ondoka", rest: "nyumbani saa mbili asubuhi" },
  { stem: "rudi", rest: "shuleni baada ya likizo" },
  { stem: "fungua", rest: "dirisha la darasa" },
  { stem: "funga", rest: "kitabu chake taratibu" },
  { stem: "angalia", rest: "runinga jioni" },
  { stem: "gusa", rest: "ubao wa darasa" },
  { stem: "nunua", rest: "matunda sokoni" },
  { stem: "uza", rest: "mboga sokoni" },
  { stem: "panda", rest: "mti shuleni asubuhi" },
  { stem: "tembea", rest: "uwanjani kwa raha" },
  { stem: "ruka", rest: "kamba wakati wa mchezo" },
  { stem: "futa", rest: "ubao baada ya somo" },
  { stem: "shona", rest: "nguo mpya likizoni" },
];

const KENYAN_MAJINA = [
  "Wanjiru", "Otieno", "Amina", "Kiptoo", "Nasimiyu", "Mwangi", "Chebet", "Njeri",
  "Kamau", "Akinyi", "Wafula", "Naliaka", "Mutiso", "Cherono", "Odhiambo", "Wangari",
  "Kilonzo", "Nyambura", "Barasa", "Auma", "Rotich", "Achieng", "Kiplagat", "Mumbi",
  "Simiyu", "Wekesa", "Chepkoech", "Onyango", "Wairimu", "Korir",
];

function pickNames(rng: () => number, count: number): string[] {
  return shuffle(rng, KENYAN_MAJINA).slice(0, count);
}

type ScenarioCategory = { correct: PronounKey; build: (n: string[]) => string };

const SCENARIOS: ScenarioCategory[] = [
  {
    correct: "mimi",
    build: (n) => `${n[0]} anazungumza kuhusu yeye mwenyewe akisema, "Ninapenda kucheza mpira baada ya shule." Anatumia kiwakilishi kipi kujitaja yeye mwenyewe?`,
  },
  {
    correct: "mimi",
    build: (n) => `Wakati ${n[0]} anapojitambulisha darasani na kueleza mambo anayoyafanya yeye binafsi, hutumia kiwakilishi kipi?`,
  },
  {
    correct: "wewe",
    build: (n) => `${n[0]} anamwambia ${n[1]} moja kwa moja, "Umefanya vizuri sana katika mtihani wa Kiswahili." Ni kiwakilishi kipi ${n[0]} anachotumia kumwambia ${n[1]} moja kwa moja?`,
  },
  {
    correct: "wewe",
    build: (n) => `${n[0]} anazungumza uso kwa uso na ${n[1]}, akimwuliza swali kuhusu kazi yake mwenyewe ya nyumbani. Kiwakilishi kipi kinamrejelea ${n[1]} anayeongeleshwa moja kwa moja?`,
  },
  {
    correct: "yeye",
    build: (n) => `${n[0]} na ${n[1]} wanazungumza kuhusu ${n[2]} ambaye hayupo mahali hapo. Wanatumia kiwakilishi kipi kumtaja ${n[2]}?`,
  },
  {
    correct: "yeye",
    build: (n) => `Katika hadithi, msimulizi anaeleza mambo aliyoyafanya ${n[0]} bila ${n[0]} kuwepo kuzungumza mwenyewe. Kiwakilishi kipi kinamrejelea ${n[0]} katika hali hii?`,
  },
  {
    correct: "sisi",
    build: (n) => `${n[0]} anazungumza akiwa pamoja na wanafunzi wenzake akisema, "Tunasoma Kiswahili kila siku." Anatumia kiwakilishi kipi kujumuisha yeye na wenzake?`,
  },
  {
    correct: "sisi",
    build: (n) => `${n[0]} na ${n[1]} wanapozungumza na mtu mwingine kuhusu vitu wanavyofanya wao wawili pamoja, hutumia kiwakilishi kipi?`,
  },
  {
    correct: "nyinyi",
    build: (n) => `${n[0]} (mwalimu) anahutubia wanafunzi wote darasani moja kwa moja akiwaambia kazi yao ya nyumbani. Anatumia kiwakilishi kipi kuwaita wanafunzi wote?`,
  },
  {
    correct: "nyinyi",
    build: (n) => `${n[0]} anazungumza na kikundi cha wenzake wawili au zaidi moja kwa moja, akiwauliza swali kuhusu mchezo wao. Kiwakilishi kipi kinawarejelea wote wanaosikilizwa?`,
  },
  {
    correct: "wao",
    build: (n) => `${n[0]} na ${n[1]} wanazungumzia kikundi cha wanafunzi wengine ambao hawapo mahali hapo. Wanatumia kiwakilishi kipi kuwataja wanafunzi hao wote?`,
  },
  {
    correct: "wao",
    build: (n) => `${n[0]} (mtangazaji wa redio) anaeleza mambo waliyoyafanya wachezaji wa timu fulani bila wachezaji hao kuwepo studioni. Kiwakilishi kipi kinawarejelea wachezaji hao wote?`,
  },
];

export const viwakilishiVyaNafsi: Skill = {
  id: "g6-ksw-sarufi-viwakilishi-vya-nafsi",
  code: "SA.7",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Viwakilishi vya Nafsi",
  description: "Tambua na tumia viwakilishi vya nafsi (mimi, wewe, yeye, sisi, nyinyi, wao) kwa upatanisho sahihi wa kitenzi.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["mc-maelezo", "mc-upatanisho", "click-match", "categorize", "fill-blank", "mc-scenario", "ordering"] as const
    );

    if (branch === "mc-maelezo") {
      const p = randChoice(rng, PRONOUNS);
      const choices = shuffle(rng, PRONOUNS.map((x) => x.id));
      return {
        kind: "multiple-choice",
        prompt: `Ni kiwakilishi kipi cha nafsi kinachomrejelea ${p.maelezo}?`,
        choices,
        correctIndex: choices.indexOf(p.id),
        layout: "row",
        hint: `Fikiria ni nafsi ya ${p.nafsi} na idadi ya ${p.idadi}.`,
        explanation: `"${p.id}" ni kiwakilishi cha nafsi ya ${p.nafsi} (${p.idadi}) — kinarejelea ${p.maelezo}.`,
      };
    }

    if (branch === "mc-upatanisho") {
      const p = randChoice(rng, PRONOUNS);
      const v = randChoice(rng, VERBS);
      const correct = conjugate(p.marker, v.stem);
      const others = shuffle(rng, PRONOUNS.filter((x) => x.id !== p.id)).slice(0, 3);
      const distractors = others.map((o) => conjugate(o.marker, v.stem));
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Ni umbo lipi sahihi la kitenzi "-${v.stem}" linalokwenda na kiwakilishi "${p.id}"?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "row",
        hint: `Kiwakilishi "${p.id}" hutumia kiambishi "${p.marker}-" kwenye kitenzi.`,
        explanation: `Sentensi sahihi ni: "${cap(p.id)} ${correct} ${v.rest}." — kiwakilishi "${p.id}" huchukua kiambishi "${p.marker}-".`,
      };
    }

    if (branch === "click-match") {
      const tokens = shuffle(rng, PRONOUNS.map((p) => ({ id: p.id, label: p.id })));
      const targets = shuffle(
        rng,
        PRONOUNS.map((p) => ({ id: p.id, label: `kiambishi "${p.marker}-" (mfano: ${p.id} ${conjugate(p.marker, "soma")})` }))
      );
      const correctMap: Record<string, string> = {};
      for (const p of PRONOUNS) correctMap[p.id] = p.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kiwakilishi cha nafsi na kiambishi chake sahihi cha kitenzi.",
        tokens,
        targets,
        correctMap,
        hint: "Kila kiwakilishi cha nafsi kina kiambishi chake maalum kinachowekwa kabla ya '-na-' kwenye kitenzi.",
        explanation: PRONOUNS.map((p) => `"${p.id}" hutumia "${p.marker}-" (mfano: ${p.id} ${conjugate(p.marker, "soma")}).`).join(" "),
      };
    }

    if (branch === "categorize") {
      const mode = randChoice(rng, ["idadi", "nafsi"] as const);
      const items = shuffle(rng, PRONOUNS.map((p) => ({ id: p.id, label: p.id, bucket: mode === "idadi" ? p.idadi : p.nafsi })));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      const buckets =
        mode === "idadi"
          ? [
              { id: "umoja", label: "Umoja" },
              { id: "wingi", label: "Wingi" },
            ]
          : [
              { id: "kwanza", label: "Nafsi ya Kwanza" },
              { id: "pili", label: "Nafsi ya Pili" },
              { id: "tatu", label: "Nafsi ya Tatu" },
            ];
      return {
        kind: "categorize",
        prompt: mode === "idadi" ? "Panga viwakilishi hivi vya nafsi kulingana na umoja au wingi." : "Panga viwakilishi hivi vya nafsi kulingana na nafsi yake (kwanza, pili au tatu).",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets,
        correctBucket,
        hint: mode === "idadi" ? "Fikiria kama kiwakilishi kinarejelea mtu mmoja au watu wengi." : "Nafsi ya kwanza ni mzungumzaji, ya pili ni anayeongeleshwa, ya tatu ni anayezungumziwa.",
        explanation: PRONOUNS.map((p) => `"${p.id}" ni nafsi ya ${p.nafsi}, ${p.idadi}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const p = randChoice(rng, PRONOUNS);
      const v = randChoice(rng, VERBS);
      const blankPronoun = rng() > 0.5;
      if (blankPronoun) {
        return {
          kind: "fill-blank",
          prompt: "Kamilisha sentensi kwa kiwakilishi sahihi cha nafsi.",
          before: "",
          after: ` ${conjugate(p.marker, v.stem)} ${v.rest}.`,
          correctAnswer: cap(p.id),
          inputMode: "text",
          hint: `Kiwakilishi kinachoenda na "${conjugate(p.marker, v.stem)}" ni cha nafsi ya ${p.nafsi}, ${p.idadi}.`,
          explanation: `Sentensi kamili ni: "${cap(p.id)} ${conjugate(p.marker, v.stem)} ${v.rest}."`,
        };
      }
      return {
        kind: "fill-blank",
        prompt: "Kamilisha sentensi kwa umbo sahihi la kitenzi linaloendana na kiwakilishi kilichotolewa.",
        before: cap(p.id),
        after: ` ${v.rest}.`,
        correctAnswer: conjugate(p.marker, v.stem),
        inputMode: "text",
        hint: `Kiwakilishi "${p.id}" hutumia kiambishi "${p.marker}-" kwenye kitenzi "-${v.stem}".`,
        explanation: `Sentensi kamili ni: "${cap(p.id)} ${conjugate(p.marker, v.stem)} ${v.rest}."`,
      };
    }

    if (branch === "mc-scenario") {
      const scenario = randChoice(rng, SCENARIOS);
      const names = pickNames(rng, 3);
      const choices = shuffle(rng, PRONOUNS.map((p) => p.id));
      const correct = PRONOUN_MAP[scenario.correct];
      return {
        kind: "multiple-choice",
        prompt: scenario.build(names),
        choices,
        correctIndex: choices.indexOf(scenario.correct),
        layout: "row",
        hint: `Fikiria ni nani anayezungumza, anayeongeleshwa, au anayezungumziwa katika hali hii.`,
        explanation: `Jibu sahihi ni "${correct.id}" kwa sababu kinarejelea ${correct.maelezo}.`,
      };
    }

    const p = randChoice(rng, PRONOUNS);
    const v = randChoice(rng, VERBS);
    const sentence = `${cap(p.id)} ${conjugate(p.marker, v.stem)} ${v.rest}.`;
    const words = sentence.replace(".", "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye kiwakilishi cha nafsi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Kiwakilishi "${p.id}" huanza sentensi, kikifuatiwa na kitenzi chenye kiambishi "${p.marker}-".`,
      explanation: `Sentensi sahihi ni: "${sentence}"`,
    };
  },
};
