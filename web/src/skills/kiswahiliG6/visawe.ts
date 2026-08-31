import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const CLUSTERS: { kichwa: string; visawe: string[] }[] = [
  { kichwa: "mwizi", visawe: ["luja", "mkupuzi", "pwagu", "pwaguzi", "mkwepuzi"] },
  { kichwa: "hongo", visawe: ["rushwa", "chai", "kadhongo", "mvugulio"] },
  { kichwa: "pesa", visawe: ["njenje", "ngwenje", "fedha", "hela"] },
  { kichwa: "lengo", visawe: ["dhamira", "nia", "azma", "kusudi"] },
  { kichwa: "maskini", visawe: ["mlalahoi", "fukara", "mkata", "fakiri"] },
  { kichwa: "haraka", visawe: ["mbio", "kasi", "upesi", "hima"] },
  { kichwa: "kazi", visawe: ["ajira", "shughuli", "jukumu", "wajibu"] },
  { kichwa: "chakula", visawe: ["mlo", "riziki", "posho", "msosi"] },
  { kichwa: "nyumba", visawe: ["makao", "makazi", "boma", "jumba"] },
  { kichwa: "shujaa", visawe: ["jasiri", "hodari", "mkakamavu", "thabiti"] },
  { kichwa: "rafiki", visawe: ["mwenzi", "sahibu", "mwandani", "jamaa"] },
  { kichwa: "furaha", visawe: ["shangwe", "raha", "nderemo", "msisimko"] },
];

function clusterOf(kichwa: string) {
  return CLUSTERS.find((c) => c.kichwa === kichwa)!;
}

const MAJINA = ["Amina", "Baraka", "Chebet", "Dennis", "Esther", "Fatuma", "Grace", "Hassan", "Imani", "Kioko", "Lilian", "Mwangi", "Naliaka", "Otieno", "Peris", "Rehema", "Salim", "Wanjiku"];
const MAENEO = ["Kisumu", "Nakuru", "Eldoret", "Machakos", "Nyeri", "Mombasa", "Kakamega", "Garissa", "Kericho", "Meru", "Kitui", "Bungoma", "Narok"];

const SENTENSI_VISAWE: { kichwa: string; build: (name: string, place: string) => { before: string; after: string } }[] = [
  { kichwa: "mwizi", build: (_n, place) => ({ before: `Polisi wa ${place} walimkamata`, after: "aliyekuwa akiiba pesa dukani." }) },
  { kichwa: "hongo", build: (_n, place) => ({ before: `Afisa mmoja wa ofisi ya ${place} alifukuzwa kazi kwa kuomba`, after: "kutoka kwa wananchi waliohitaji huduma." }) },
  { kichwa: "pesa", build: (name) => ({ before: `${name} aliweka`, after: "zake zote benki ili ziwe salama." }) },
  { kichwa: "lengo", build: (_n, place) => ({ before: `Timu ya mpira ya ${place} ilikuwa na`, after: "la kushinda kombe la kaunti mwaka huu." }) },
  { kichwa: "maskini", build: (_n, place) => ({ before: `Shirika moja la ${place} lilisaidia familia`, after: "kwa chakula na mavazi wakati wa ukame." }) },
  { kichwa: "haraka", build: (name) => ({ before: `${name} alikimbia kwa`, after: "ili asichelewe shuleni." }) },
  { kichwa: "kazi", build: (name) => ({ before: `Baba yake ${name} ana`, after: "nzuri katika hospitali ya wilaya." }) },
  { kichwa: "chakula", build: (_n, place) => ({ before: `Wageni wa harusi mjini ${place} walipewa`, after: "kitamu wakati wa sherehe." }) },
  { kichwa: "nyumba", build: (name) => ({ before: `Familia ya ${name} ilijenga`, after: "kubwa kijijini baada ya miaka ya kuweka akiba." }) },
  { kichwa: "shujaa", build: (_n, place) => ({ before: `Kila mwananchi wa ${place} alimwita askari huyo`, after: "kwa jinsi alivyowaokoa watoto motoni." }) },
  { kichwa: "rafiki", build: (name) => ({ before: `${name} ni`, after: "yangu wa karibu sana tangu shule ya msingi." }) },
  { kichwa: "furaha", build: () => ({ before: "Watoto walicheza kwa", after: "wakati wa likizo ya shule mjini." }) },
  { kichwa: "mwizi", build: (_n, place) => ({ before: `Kila mtu kijijini ${place} alimjua kama`, after: "baada ya kukamatwa mara tatu akiiba mifugo." }) },
  { kichwa: "pesa", build: (name) => ({ before: `${name} alichanga`, after: "nyingi kusaidia ujenzi wa kanisa." }) },
];

const HATUA_KAMUSI: { id: string; label: string }[][] = [
  [
    { id: "tambua", label: "Tambua neno unalotaka kupata kisawe chake" },
    { id: "tafuta", label: "Tafuta neno hilo kwenye kamusi ya visawe (thesaurus)" },
    { id: "soma", label: "Soma orodha ya visawe vilivyotolewa" },
    { id: "chagua", label: "Chagua kisawe kinachofaa muktadha wa sentensi yako" },
  ],
  [
    { id: "soma-sentensi", label: "Soma sentensi kwa makini kuelewa neno linalohitaji kisawe" },
    { id: "tafuta2", label: "Tafuta neno hilo kwenye kamusi ya visawe" },
    { id: "linganisha", label: "Linganisha visawe vilivyoorodheshwa na maana ya sentensi" },
    { id: "chagua2", label: "Chagua kisawe kinachofaa zaidi muktadha" },
  ],
];

export const visawe: Skill = {
  id: "g6-ksw-kz-visawe",
  code: "KZ.7",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Visawe",
  description: "Tambua na utumie visawe (maneno yenye maana sawa au inayokaribiana) katika sentensi na muktadha mbalimbali.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-kisawe", "oanisha-visawe", "panga-vikundi", "badilisha-neno", "hatua-kamusi"] as const);

    if (branch === "chagua-kisawe") {
      const cluster = randChoice(rng, CLUSTERS);
      const wote = [cluster.kichwa, ...cluster.visawe];
      const neno = randChoice(rng, wote);
      const correctPool = wote.filter((w) => w !== neno);
      const correct = randChoice(rng, correctPool);
      const otherClusters = shuffle(rng, CLUSTERS.filter((c) => c.kichwa !== cluster.kichwa)).slice(0, 3);
      const distractors = otherClusters.map((c) => randChoice(rng, [c.kichwa, ...c.visawe]));
      const choices = shuffle(rng, [correct, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Ni lipi kati ya haya ni kisawe cha neno "${neno}"?`,
        choices,
        correctIndex: choices.indexOf(correct),
        layout: "list",
        hint: `Fikiria maneno mengine yenye maana sawa na "${cluster.kichwa}".`,
        explanation: `"${correct}" ni kisawe cha "${neno}" — maneno yote mawili yanahusiana na "${cluster.kichwa}".`,
      };
    }

    if (branch === "oanisha-visawe") {
      const chosen = shuffle(rng, CLUSTERS).slice(0, 5);
      const pairs = chosen.map((c) => ({ kichwa: c.kichwa, kisawe: randChoice(rng, c.visawe) }));
      const tokens = shuffle(rng, pairs.map((p) => ({ id: p.kichwa, label: p.kichwa })));
      const targets = shuffle(rng, pairs.map((p) => ({ id: p.kichwa, label: p.kisawe })));
      const correctMap: Record<string, string> = {};
      for (const p of pairs) correctMap[p.kichwa] = p.kichwa;
      return {
        kind: "click-match",
        prompt: "Oanisha kila neno na kisawe chake sahihi.",
        tokens,
        targets,
        correctMap,
        hint: "Kila jozi ina maneno mawili yenye maana inayokaribiana sana.",
        explanation: pairs.map((p) => `"${p.kichwa}" na "${p.kisawe}" ni visawe.`).join(" "),
      };
    }

    if (branch === "panga-vikundi") {
      const chosenClusters = shuffle(rng, CLUSTERS).slice(0, 3);
      const items = shuffle(
        rng,
        chosenClusters.flatMap((c) =>
          shuffle(rng, c.visawe)
            .slice(0, 2)
            .map((w) => ({ id: w, label: w, bucket: c.kichwa }))
        )
      );
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila neno katika kikundi cha visawe kinachofaa.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: chosenClusters.map((c) => ({ id: c.kichwa, label: c.kichwa })),
        correctBucket,
        hint: "Fikiria neno kuu ambalo maneno haya yote yana maana inayokaribiana nalo.",
        explanation: chosenClusters
          .map((c) => `Visawe vya "${c.kichwa}" ni pamoja na: ${c.visawe.join(", ")}.`)
          .join(" "),
      };
    }

    if (branch === "badilisha-neno") {
      const template = randChoice(rng, SENTENSI_VISAWE);
      const cluster = clusterOf(template.kichwa);
      const name = randChoice(rng, MAJINA);
      const place = randChoice(rng, MAENEO);
      const { before, after } = template.build(name, place);
      const [correct, ...rest] = cluster.visawe;
      return {
        kind: "fill-blank",
        prompt: `Badilisha neno "${cluster.kichwa}" katika sentensi ifuatayo kwa kisawe kinachofaa.`,
        before,
        after,
        correctAnswer: correct,
        acceptedAnswers: rest,
        inputMode: "text",
        hint: `Fikiria neno lenye maana sawa na "${cluster.kichwa}".`,
        explanation: `Visawe vya "${cluster.kichwa}" ni: ${cluster.visawe.join(", ")}. Lolote kati ya haya lingekubalika.`,
      };
    }

    const steps = randChoice(rng, HATUA_KAMUSI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za kutafuta kisawe cha neno kwa kutumia kamusi ya visawe (thesaurus).",
      instruction: "Bofya kwa mpangilio sahihi kuanzia hatua ya kwanza hadi ya mwisho.",
      items: shuffle(rng, steps),
      correctOrder: steps.map((s) => s.id),
      hint: "Anza kwa kutambua neno, kisha tafuta kamusini, soma visawe, na hatimaye chagua kinachofaa.",
      explanation: steps.map((s) => s.label).join(" → "),
    };
  },
};
