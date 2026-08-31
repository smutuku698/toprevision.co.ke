import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const MATINI: {
  id: string;
  text: string;
  ujumbe: string;
  funzo: string;
  hatari: string;
  usalama: string;
  fillBefore: string;
  fillAfter: string;
  fillAnswer: string;
}[] = [
  {
    id: "waya",
    text: "Familia ya Juma ilikuwa na waya za umeme zilizoning'inia ovyo sebuleni. Siku moja, mtoto wao mdogo alijikwaa kwenye waya hizo na karibu aanguke kwenye jiko la umeme lililokuwa likiwaka. Baba yao alipofahamu hatari hiyo, aliajiri fundi kuziba na kuficha waya zote ukutani.",
    ujumbe: "Ni muhimu kuficha na kupanga vizuri waya za umeme nyumbani ili kuepusha ajali",
    funzo: "Tuzingatie usalama wa umeme nyumbani kwa kutengeneza waya zilizoharibika mapema",
    hatari: "Waya za umeme zilizoning'inia ovyo sebuleni",
    usalama: "Kuficha na kupanga vizuri waya za umeme ukutani",
    fillBefore: "Familia ya Juma iliajiri fundi kuficha na kupanga vizuri",
    fillAfter: "za umeme zilizokuwa zikining'inia ovyo sebuleni.",
    fillAnswer: "waya",
  },
  {
    id: "dawa",
    text: "Mama Neema aliweka chupa za dawa za kuua wadudu kwenye kabati la chini jikoni, karibu na chakula cha watoto. Siku moja, mtoto wake mdogo alikaribia kunywa dawa hiyo akidhani ni maji ya soda. Kwa bahati, dada yake mkubwa alimzuia mapema.",
    ujumbe: "Kemikali hatari zinapaswa kuhifadhiwa mbali na watoto, mahali pasipofikika kwa urahisi",
    funzo: "Kila mzazi anapaswa kuweka kemikali za nyumbani mahali pasipofikiwa na watoto wadogo",
    hatari: "Dawa za kuua wadudu ziliwekwa karibu na chakula cha watoto",
    usalama: "Kuhifadhi kemikali hatari mbali na watoto",
    fillBefore: "Mama Neema alipaswa kuhifadhi chupa za",
    fillAfter: "mbali na chakula cha watoto, si karibu nacho.",
    fillAnswer: "dawa",
  },
  {
    id: "moto",
    text: "Wakati wa kupika, sufuria ya mafuta ilishika moto ghafula jikoni mwa shule. Kwa sababu shule ilikuwa na kizima moto karibu na mwalimu mkuu alijua jinsi ya kukitumia, moto ulizimwa haraka kabla haujaenea.",
    ujumbe: "Kuwa na vifaa vya kuzima moto na kujua kuvitumia huokoa maisha wakati wa dharura",
    funzo: "Kila jengo linapaswa kuwa na kizima moto na watu wanaojua kukitumia",
    hatari: "Sufuria ya mafuta ilishika moto ghafula jikoni",
    usalama: "Kuwa na kizima moto karibu wakati wa kupika",
    fillBefore: "Shule iliokoa jikoni kwa kutumia kizima moto",
    fillAfter: "kilichokuwepo karibu wakati moto ulipozuka.",
    fillAnswer: "kizima moto",
  },
  {
    id: "ngazi",
    text: "Nyumba ya babu ilikuwa na ngazi za mawe zisizo na sakafu ya kuzuia kuteleza wala uzio wa kushikilia. Babu alipoteleza mara mbili, familia iliamua kuweka uzio wa chuma na kuweka mkeka usioteleza kwenye kila ngazi.",
    ujumbe: "Nyumba zinapaswa kurekebishwa ili kuwa salama kwa wazee na watu wenye changamoto za kutembea",
    funzo: "Tunapaswa kuangalia usalama wa ngazi nyumbani, hasa pale wanapoishi wazee",
    hatari: "Ngazi za mawe bila uzio wa kushikilia wala kizuia kuteleza",
    usalama: "Kuweka uzio wa chuma na mkeka usioteleza kwenye ngazi",
    fillBefore: "Familia ya babu iliweka",
    fillAfter: "wa chuma kwenye ngazi ili kuzuia kuteleza.",
    fillAnswer: "uzio",
  },
  {
    id: "visu",
    text: "Baba alikuwa akiacha visu vikali mezani baada ya kupika, hadi siku mtoto wake alijikata kidole akijaribu kuvishika. Tangu hapo, familia iliamua kuweka visu vyote kwenye droo yenye ufunguo, mbali na watoto.",
    ujumbe: "Vifaa vikali kama visu vinapaswa kuhifadhiwa mahali salama, mbali na watoto",
    funzo: "Tusiache vifaa vikali wazi mahali panapofikiwa na watoto wadogo",
    hatari: "Visu vikali viliachwa wazi mezani baada ya kupika",
    usalama: "Kuhifadhi visu vyote kwenye droo yenye ufunguo, mbali na watoto",
    fillBefore: "Familia iliamua kuhifadhi visu vyote kwenye droo yenye ufunguo, mbali na",
    fillAfter: ".",
    fillAnswer: "watoto",
  },
];

export const kusikilizaKwaKufasiri: Skill = {
  id: "g8-ksw-kz-kufasiri",
  code: "KZ.6",
  subjectId: "kiswahili",
  strandId: "g8-ksw-kz",
  grade: 8,
  title: "Kusikiliza kwa Kufasiri",
  description: "Sikiliza matini fupi kuhusu usalama nyumbani, ubaini ujumbe wake, na uuhusishe na maisha ya kila siku.",
  generate(rng) {
    const branch = randChoice(rng, ["ujumbe", "funzo", "oanisha", "panga", "hatua"] as const);

    if (branch === "ujumbe" || branch === "funzo") {
      const entry = randChoice(rng, MATINI);
      const others = MATINI.filter((m) => m.id !== entry.id);
      if (branch === "ujumbe") {
        const distractors = shuffle(rng, others).slice(0, 3).map((m) => m.ujumbe);
        const choices = shuffle(rng, [entry.ujumbe, ...distractors]);
        return {
          kind: "multiple-choice",
          passage: entry.text,
          prompt: "Ujumbe mkuu wa kifungu hiki ni upi?",
          choices,
          correctIndex: choices.indexOf(entry.ujumbe),
          layout: "list",
          hint: "Tafuta tatizo la usalama lililojitokeza na hatua iliyochukuliwa kulitatua.",
          explanation: `Ujumbe mkuu ni: "${entry.ujumbe}".`,
        };
      }
      const distractors = shuffle(rng, others).slice(0, 3).map((m) => m.funzo);
      const choices = shuffle(rng, [entry.funzo, ...distractors]);
      return {
        kind: "multiple-choice",
        passage: entry.text,
        prompt: "Ni funzo lipi tunalopata kutokana na kifungu hiki kuhusu maisha yetu ya kila siku?",
        choices,
        correctIndex: choices.indexOf(entry.funzo),
        layout: "list",
        hint: "Fikiria jinsi hali iliyoelezwa kwenye kifungu inavyoweza kutokea nyumbani kwako.",
        explanation: `Funzo tunalopata ni: "${entry.funzo}".`,
      };
    }

    if (branch === "oanisha") {
      const chosen = shuffle(rng, MATINI).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.hatari })));
      const targets = shuffle(rng, chosen.map((m) => ({ id: m.id, label: m.ujumbe })));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.id] = m.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila hali ya hatari nyumbani na ujumbe unaofaa kuihusu.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria ni tahadhari gani inayofaa hali hiyo ya hatari.",
        explanation: chosen.map((m) => `${m.hatari} — ${m.ujumbe.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga") {
      const chosen = shuffle(rng, MATINI).slice(0, 3);
      const items = shuffle(rng, [
        ...chosen.map((m) => ({ id: `hatari-${m.id}`, label: m.hatari, bucket: "hatari" })),
        ...chosen.map((m) => ({ id: `usalama-${m.id}`, label: m.usalama, bucket: "usalama" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kauli katika kundi la Hatari Nyumbani au Hatua za Usalama.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "hatari", label: "Hatari Nyumbani" },
          { id: "usalama", label: "Hatua za Usalama" },
        ],
        correctBucket,
        hint: "Hatari ni hali inayoweza kusababisha ajali; hatua za usalama ni marekebisho yaliyofanywa kuzuia ajali hiyo.",
        explanation: chosen.map((m) => `Hatari: "${m.hatari}" → Usalama: "${m.usalama}".`).join(" "),
      };
    }

    const entry = randChoice(rng, MATINI);
    return {
      kind: "fill-blank",
      passage: entry.text,
      prompt: "Kamilisha sentensi kwa neno linalotoka kwenye kifungu.",
      before: entry.fillBefore,
      after: entry.fillAfter,
      correctAnswer: entry.fillAnswer,
      inputMode: "text",
      hint: "Rejelea kifungu hapo juu kupata neno linalofaa.",
      explanation: `Neno sahihi ni "${entry.fillAnswer}", linalopatikana katika kifungu.`,
    };
  },
};
