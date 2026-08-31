import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chiku", "Daudi", "Efrata", "Fatuma", "Gideon", "Halima",
  "Ibrahim", "Jelimo", "Kiptoo", "Leah", "Mwangi", "Njeri", "Otieno", "Peris",
] as const;

type Kikundi = "nguvu-ya-pamoja" | "kubeba-mzigo-pamoja" | "kuepuka-migawanyiko";

const METHALI: { msemo: string; maana: string; kikundi: Kikundi }[] = [
  { msemo: "Umoja ni nguvu, utengano ni udhaifu", maana: "watu wakiwa pamoja wana nguvu zaidi kuliko wakiwa peke yao", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Jifya moja haliinjiki chungu", maana: "kazi kubwa haiwezi kufanywa na mtu mmoja pekee, inahitaji ushirikiano", kikundi: "kubeba-mzigo-pamoja" },
  { msemo: "Kidole kimoja hakivunji chawa", maana: "mtu mmoja pekee hawezi kutimiza kazi inayohitaji watu wengi", kikundi: "kubeba-mzigo-pamoja" },
  { msemo: "Kinga na kinga ndio moto huwaka", maana: "watu wanapochangia kila mmoja sehemu yake, kazi kubwa hutimizwa", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Mkono mmoja hauchinji ng'ombe", maana: "kazi kubwa inahitaji watu wengi kushirikiana", kikundi: "kubeba-mzigo-pamoja" },
  { msemo: "Umoja ni nguvu", maana: "watu wakiungana wanaweza kufanya mambo makubwa", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Wengi wape", maana: "maamuzi ya wengi yanapaswa kuheshimiwa kwa manufaa ya wote", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Baraka za mkono huja kwa jasho la wengi", maana: "mafanikio makubwa hutokana na juhudi za watu wengi kwa pamoja", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Ukiona mwenzako ananyolewa, wewe tia maji", maana: "unapaswa kusaidia mwenzako kabla hatari haijakufikia wewe pia", kikundi: "kubeba-mzigo-pamoja" },
  { msemo: "Panapo wengi pana neema", maana: "mahali penye watu wengi wanaoshirikiana, kuna mafanikio", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Bendera hufuata upepo", maana: "mtu binafsi asiyeshikamana na wenzake hushindwa kusimama imara", kikundi: "kuepuka-migawanyiko" },
  { msemo: "Fimbo moja haiwezi kuua nyoka", maana: "juhudi za mtu mmoja peke yake mara nyingi hazitoshi", kikundi: "kubeba-mzigo-pamoja" },
  { msemo: "Mti mmoja hauwezi kuwa msitu", maana: "kitu kimoja peke yake hakitoshi kufanya jambo kubwa", kikundi: "kubeba-mzigo-pamoja" },
  { msemo: "Umoja hujenga, mfarakano huvunja", maana: "kushirikiana kunajenga jamii, ugomvi unaibomoa", kikundi: "kuepuka-migawanyiko" },
  { msemo: "Nyufa za nyumba huanzia darini", maana: "matatizo madogo yasiposhughulikiwa huweza kusababisha mgawanyiko mkubwa", kikundi: "kuepuka-migawanyiko" },
  { msemo: "Damu nzito kuliko maji", maana: "uhusiano wa kifamilia/kikundi una nguvu kubwa ya kuwaunganisha watu", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Wapiganao wawili, mshinda ni wa tatu", maana: "watu wanapogombana wao kwa wao, mtu wa nje ndiye anayefaidika", kikundi: "kuepuka-migawanyiko" },
  { msemo: "Asiyefunzwa na mamaye hufunzwa na ulimwengu", maana: "jamii nzima ina jukumu la kumlea mtoto pamoja", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Mchuma janga hula na wenzake", maana: "aliyefanikiwa anapaswa kushiriki mafanikio na wenzake", kikundi: "kubeba-mzigo-pamoja" },
  { msemo: "Haba na haba hujaza kibaba", maana: "michango midogo midogo ya watu wengi hujenga kitu kikubwa", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Mgema akisifiwa tembo hulitia maji", maana: "sifa za uongo huweza kuathiri ubora wa kazi ya pamoja", kikundi: "kuepuka-migawanyiko" },
  { msemo: "Wapishi wengi huharibu mchuzi", maana: "watu wengi mno wakijaribu kuongoza jambo moja bila mpangilio hulisababisha kuharibika", kikundi: "kuepuka-migawanyiko" },
  { msemo: "Bahati ya mwenzio usiilalie mlango wazi", maana: "kila mmoja ana wajibu wake katika ushirikiano, si kutegemea wenzake pekee", kikundi: "kuepuka-migawanyiko" },
  { msemo: "Kuungana ni nguvu, kugawanyika ni udhaifu", maana: "watu wanapoungana wana uwezo mkubwa zaidi kuliko wakiwa mbali mbali", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Mkono mtupu haulambwi", maana: "watu wanapaswa kusaidiana ili kila mmoja apate manufaa", kikundi: "kubeba-mzigo-pamoja" },
  { msemo: "Mgeni njoo mwenyeji apone", maana: "ushirikiano kati ya watu tofauti huleta manufaa kwa pande zote", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Ukistaajabu ya Musa utaona ya Firauni", maana: "kushirikiana kunazuia matatizo makubwa zaidi yasitokee", kikundi: "kuepuka-migawanyiko" },
  { msemo: "Asiyesikia la mkuu huvunjika guu", maana: "kutosikiliza ushauri wa pamoja kunaweza kusababisha madhara", kikundi: "kuepuka-migawanyiko" },
  { msemo: "Watu wawili wakikubaliana, jambo hutimia", maana: "makubaliano ya pamoja huwezesha kutimizwa kwa jambo", kikundi: "nguvu-ya-pamoja" },
  { msemo: "Ndugu wawili wakigombana, mgeni haingii kati", maana: "watu wa nje hawapaswi kuchochea migawanyiko ya wale wanaoshirikiana", kikundi: "kuepuka-migawanyiko" },
];

export const methaliUmojaNaUshirikiano: Skill = {
  id: "g6-ksw-kz-methali-umoja-na-ushirikiano",
  code: "KZ.5",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Methali (Umoja na Ushirikiano)",
  description: "Tambua, eleza maana na utumie methali zinazohusu umoja na ushirikiano katika mawasiliano.",
  generate(rng) {
    const branch = randChoice(rng, ["chagua-maana", "oanisha-maana", "panga-kikundi", "jaza-methali", "panga-methali"] as const);

    if (branch === "chagua-maana") {
      const m = randChoice(rng, METHALI);
      const makosaKikundi = shuffle(rng, METHALI.filter((x) => x.kikundi === m.kikundi && x.maana !== m.maana)).slice(0, 3).map((x) => x.maana);
      const makosaZiada = shuffle(rng, METHALI.filter((x) => x.maana !== m.maana)).slice(0, 3 - makosaKikundi.length).map((x) => x.maana);
      const choices = shuffle(rng, [m.maana, ...makosaKikundi, ...makosaZiada].slice(0, 4));
      return {
        kind: "multiple-choice",
        prompt: `Methali "${m.msemo}" ina maana gani?`,
        choices,
        correctIndex: choices.indexOf(m.maana),
        layout: "list",
        hint: "Fikiria kuhusu umoja na kushirikiana katika jamii.",
        explanation: `Methali "${m.msemo}" ina maana: ${m.maana}.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, METHALI).slice(0, 5);
      const tokens = chosen.map((m, i) => ({ id: `${i}`, label: m.msemo }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: `${chosen.indexOf(m)}`, label: m.maana }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_m, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: "Oanisha kila methali na maana yake.",
        tokens,
        targets,
        correctMap,
        hint: "Soma kila methali kwa makini na ufikirie maana yake ya ndani.",
        explanation: chosen.map((m) => `"${m.msemo}" ina maana: ${m.maana}.`).join(" "),
      };
    }

    if (branch === "panga-kikundi") {
      const items = shuffle(rng, METHALI).slice(0, 6).map((m, i) => ({ id: `${i}-${m.msemo}`, label: m.msemo, bucket: m.kikundi }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga methali hizi kulingana na kile zinachosisitiza kuhusu ushirikiano.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "nguvu-ya-pamoja", label: "Nguvu ya Kuungana" },
          { id: "kubeba-mzigo-pamoja", label: "Kubeba Mzigo Pamoja" },
          { id: "kuepuka-migawanyiko", label: "Kuepuka Migawanyiko" },
        ],
        correctBucket,
        hint: "Fikiria ni kipengele gani cha ushirikiano ambacho methali hii inasisitiza zaidi.",
        explanation: "Kila methali imewekwa katika kikundi kinachoendana zaidi na ujumbe wake.",
      };
    }

    if (branch === "jaza-methali") {
      const m = randChoice(rng, METHALI);
      const maneno = m.msemo.split(" ");
      const idxYaKujaza = Math.floor(maneno.length / 2);
      const kwaKujaza = maneno[idxYaKujaza];
      const before = maneno.slice(0, idxYaKujaza).join(" ") + (idxYaKujaza > 0 ? " " : "");
      const after = " " + maneno.slice(idxYaKujaza + 1).join(" ");
      return {
        kind: "fill-blank",
        prompt: "Kamilisha methali hii inayohusu umoja na ushirikiano.",
        before,
        after,
        correctAnswer: kwaKujaza,
        inputMode: "text",
        hint: `Methali hii ina maana: ${m.maana}`,
        explanation: `Methali kamili ni: "${m.msemo}"`,
      };
    }

    const m = randChoice(rng, METHALI);
    const jina = randChoice(rng, KENYAN_NAMES);
    const maneno = m.msemo.split(" ");
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: `${jina} anajaribu kukumbuka methali kuhusu umoja. Panga maneno haya kuunda methali sahihi.`,
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Methali hii ina maana: ${m.maana}`,
      explanation: `Methali sahihi ni: "${m.msemo}"`,
    };
  },
};
