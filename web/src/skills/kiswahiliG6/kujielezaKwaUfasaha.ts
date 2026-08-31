import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Kusudi = "hisia" | "hadhira" | "ufahamu";

const KUSUDI_LABEL: Record<Kusudi, string> = {
  hisia: "Huwasilisha Hisia",
  hadhira: "Huvutia Hadhira",
  ufahamu: "Huwezesha Ufahamu na Heshima",
};

const TECHNIQUES: { neno: string; maelezo: string; kusudi: Kusudi; kusudiMaelezo: string }[] = [
  {
    neno: "Mtiririko wa Matukio",
    maelezo: "Kupanga matukio ya hadithi kwa mfuatano unaoeleweka kutoka mwanzo hadi mwisho",
    kusudi: "ufahamu",
    kusudiMaelezo: "Kusaidia hadhira kufuatilia hadithi kwa urahisi bila kuchanganyikiwa",
  },
  {
    neno: "Kupanda na Kushuka kwa Sauti",
    maelezo: "Kubadilisha kiwango cha sauti — juu au chini — kulingana na hisia za tukio linalosimuliwa",
    kusudi: "hisia",
    kusudiMaelezo: "Kuonyesha hisia na kuvutia hisia za hadhira wakati wa sehemu muhimu",
  },
  {
    neno: "Ishara za Uso",
    maelezo: "Kutumia mabadiliko ya uso — tabasamu, kukunja uso, mshangao — kuwasilisha hisia za wahusika",
    kusudi: "hisia",
    kusudiMaelezo: "Kuwasaidia hadhira kuelewa hisia za wahusika bila maneno",
  },
  {
    neno: "Viziada Lugha",
    maelezo: "Ishara na mienendo ya mwili kama vile mikono, kichwa, na mikao inayoambatana na maneno",
    kusudi: "hisia",
    kusudiMaelezo: "Kuimarisha na kusisitiza ujumbe unaowasilishwa kwa maneno",
  },
  {
    neno: "Tasfida",
    maelezo: "Kutumia maneno laini badala ya maneno makali au yasiyofaa kutajwa moja kwa moja",
    kusudi: "ufahamu",
    kusudiMaelezo: "Kuepuka kuudhi au kuvunjia heshima hadhira wakati wa kusimulia mambo nyeti",
  },
  {
    neno: "Kiimbo",
    maelezo: "Kubadilisha mkazo wa sauti kwenye maneno fulani ili kusisitiza maana",
    kusudi: "hisia",
    kusudiMaelezo: "Kuvuta usikivu wa hadhira kwenye sehemu muhimu za hadithi",
  },
  {
    neno: "Kutumia Vitendo/Maonyesho",
    maelezo: "Kuonyesha kwa vitendo halisi jinsi jambo lilivyotokea badala ya kulieleza tu kwa maneno",
    kusudi: "hadhira",
    kusudiMaelezo: "Kufanya hadithi ionekane halisi na kuvutia zaidi machoni mwa hadhira",
  },
  {
    neno: "Kunyamaza kwa Makusudi",
    maelezo: "Kunyamaza kwa muda mfupi kabla ya sehemu muhimu ya hadithi ili kuongeza hamu ya hadhira",
    kusudi: "hadhira",
    kusudiMaelezo: "Kuongeza mvuto na hamu ya hadhira kabla ya tukio kuu",
  },
  {
    neno: "Mawasiliano ya Macho",
    maelezo: "Kutazama hadhira machoni wakati wa kusimulia badala ya kuangalia karatasi tu",
    kusudi: "hadhira",
    kusudiMaelezo: "Kuunganisha msimuliaji na hadhira na kuongeza uaminifu wa masimulizi",
  },
];

const TOPICS = [
  "Hadithi ya shujaa Dedan Kimathi na mapambano ya uhuru",
  "Hadithi ya shujaa Mekatilili wa Menza",
  "Hadithi ya shujaa Wangari Maathai na uhifadhi wa mazingira",
  "Hadithi ya shujaa Tom Mboya",
  "Shughuli za sherehe za Jamhuri",
  "Shughuli za sherehe za Madaraka",
  "Shughuli za sherehe za Mashujaa",
  "Usomaji wa bajeti ya taifa bungeni",
  "Ulipaji wa ushuru na umuhimu wake kwa maendeleo",
  "Hekaya ya Abunuwasi na ujanja wake",
  "Hekaya ya Sungura na Fisi",
  "Hadithi ya safari ndefu ya kutafuta maji wakati wa ukame",
  "Hadithi ya mvua ya kwanza baada ya kiangazi kirefu",
  "Hadithi ya siku ya kwanza shuleni",
  "Hadithi ya mchezo wa mwisho wa ligi ya shule",
  "Hadithi ya msiba katika familia na jinsi walivyostahimili",
  "Hadithi ya harusi ya kimila kijijini",
  "Hadithi ya safari ya kwanza ya ndege au treni",
  "Hadithi ya jinsi babu alivyookoa kijiji wakati wa mafuriko",
  "Hadithi ya mradi wa jamii wa kuchimba kisima",
  "Hadithi ya mgeni aliyepotea njiani na kusaidiwa na wenyeji",
  "Hadithi ya mavuno bora baada ya kazi ngumu shambani",
  "Hadithi ya mashindano ya sanaa na muziki shuleni",
  "Hadithi ya kuokoa mnyama aliyekwama mtoni",
  "Hadithi ya safari ya kutembelea Bunge la Kitaifa",
  "Hadithi ya siku ya uchaguzi kijijini",
  "Hadithi ya jinsi jamii ilivyoshirikiana kujenga daraja",
  "Hadithi ya likizo ya familia pwani",
  "Hadithi ya mradi wa upandaji miti shuleni",
  "Hadithi ya mchezo wa asili uliopotea kama bao au ajua",
  "Hadithi ya tukio la moto shuleni na jinsi lilivyozimwa",
  "Hadithi ya mashindano ya utamaduni kati ya shule",
];

const GOOD_OPENERS = [
  "Fikiria giza kuu la usiku ambapo kila sauti ilisikika kama tishio…",
  "Je, umewahi kushuhudia tukio lililobadilisha maisha yako ghafla?",
  "Mvua ilipiga ngoma kwenye paa huku mioyo yetu ikidunda kwa hofu…",
  "Sauti ya honi ilipasua ukimya wa asubuhi ile ambayo sitaisahau kamwe…",
  "Jua lilipochomoza siku hiyo, hakuna aliyejua kilichokuwa kikija…",
  "Miguu yangu ilitetemeka nilipoona kile kilichokuwa mbele yangu…",
  "Sote tulishikilia pumzi tulipongoja jibu ambalo lingebadilisha kila kitu…",
  "Harufu ya moshi ilijaa hewani kabla hata sauti ya kwanza ya kilio kusikika…",
  "Kelele za shangwe zilisikika mbali kabla sisi hata kufika mlangoni…",
  "Nakumbuka wazi jinsi mikono yangu ilivyotetemeka nilipogusa mlango ule…",
  "Kabla jua halijachomoza, tayari kijiji chote kilikuwa macho…",
  "Ukimya wa ghafla ndio uliotangulia tukio ambalo hadi leo hatujalisahau…",
];

const WEAK_OPENERS = [
  "Nitawaeleza kuhusu jambo moja.",
  "Hadithi hii ni kuhusu watu fulani.",
  "Kulikuwa na tukio fulani siku moja.",
  "Nitasema mambo kuhusu jambo hili sasa.",
  "Leo nitawaambia habari fulani.",
  "Kuna kitu kilitokea siku moja tu.",
  "Nitaanza kusimulia sasa hivi.",
  "Jambo hili lilitokea zamani sana.",
  "Nitawaeleza vitu vichache.",
  "Hii ni hadithi tu ya kawaida.",
];

const MUUNDO_HADITHI: { id: string; label: string }[] = [
  { id: "mwanzo", label: "Mwanzo — kuwatambulisha wahusika na mazingira ya hadithi" },
  { id: "tukio1", label: "Tukio la Kwanza — tatizo au mabadiliko yanayoanza kutokea" },
  { id: "tukiokuu", label: "Tukio Kuu — matukio yanayoongezeka na kusisimua zaidi" },
  { id: "kilele", label: "Kilele — hatua ya juu zaidi ya msisimko wa hadithi" },
  { id: "mwisho", label: "Mwisho — jinsi tatizo linavyotatuliwa na hadithi kuhitimishwa" },
];

const STORY_EVENTS: { id: string; events: { id: string; label: string }[] }[] = [
  {
    id: "ukame",
    events: [
      { id: "a1", label: "Kijiji kilikumbwa na ukame mkali kwa miezi mitatu" },
      { id: "a2", label: "Wanakijiji walikutana kuzungumzia tatizo la maji" },
      { id: "a3", label: "Vijana walichaguliwa kutafuta chanzo kipya cha maji mbali na kijiji" },
      { id: "a4", label: "Walipata chemchemi nyuma ya mlima baada ya siku tatu za safari" },
      { id: "a5", label: "Kijiji kizima kilisherehekea kurudi kwa maji safi" },
    ],
  },
  {
    id: "mpira",
    events: [
      { id: "b1", label: "Timu ilianza mazoezi makali wiki sita kabla ya fainali" },
      { id: "b2", label: "Walishinda mechi za awali dhidi ya shule jirani" },
      { id: "b3", label: "Kocha aliwahamasisha wachezaji usiku wa kabla ya fainali" },
      { id: "b4", label: "Timu ilifunga bao la ushindi dakika ya mwisho ya mechi" },
      { id: "b5", label: "Wanafunzi wote walisherehekea ushindi shuleni kesho yake" },
    ],
  },
  {
    id: "madaraka",
    events: [
      { id: "c1", label: "Shule ilianza maandalizi ya maadhimisho ya Madaraka wiki mbili mapema" },
      { id: "c2", label: "Wanafunzi walijifunza nyimbo na ngoma za kitaifa" },
      { id: "c3", label: "Siku ya sherehe, gwaride la wanafunzi lilifanyika asubuhi" },
      { id: "c4", label: "Mgeni rasmi alitoa hotuba kuhusu umuhimu wa uhuru" },
      { id: "c5", label: "Sherehe ilihitimishwa kwa karamu na michezo ya jadi" },
    ],
  },
];

const OPENER_FILL: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "Kwa miezi mitatu, hakuna tone la", after: "lililoshuka kutoka angani, na ardhi ikawa kavu kabisa.", correctAnswer: "mvua" },
  { before: "Filimbi ya", after: "ilipopigwa, mioyo ya wachezaji wote ilianza kudunda kwa nguvu.", correctAnswer: "mwamuzi", acceptedAnswers: ["refa"] },
  { before: "Ngoma za", after: "zilisikika kutoka mbali, zikitangaza kuwa sherehe ya taifa imeanza.", correctAnswer: "asili", acceptedAnswers: ["kienyeji", "jadi"] },
  { before: "Harufu ya", after: "ilijaa hewani kabla hata kengele ya hatari kulia.", correctAnswer: "moshi" },
  { before: "Katika giza la", after: ", wapigania uhuru walijificha msituni wakisubiri ishara ya kushambulia.", correctAnswer: "usiku" },
  { before: "Sauti ya", after: "ilisikika mbali, ikiwaonya wanakijiji kukimbilia sehemu za juu.", correctAnswer: "radi" },
  { before: "Sauti ya", after: "ya mnyama huyo ilisikika kutoka ndani ya maji yanayotiririka kwa kasi.", correctAnswer: "kilio" },
  { before: "Moyo wangu ulikuwa ukidunda kwa", after: "nilipoingia geti la shule kwa mara ya kwanza.", correctAnswer: "hofu", acceptedAnswers: ["wasiwasi", "msisimko"] },
  { before: "Ukumbi wa bunge ulikuwa kimya kabisa, kila mtu akisubiri kwa", after: "kusikia mipango ya fedha ya taifa.", correctAnswer: "hamu", acceptedAnswers: ["shauku"] },
  { before: "Zamani za kale, katika kijiji kimoja mbali, aliishi mtu mmoja mjanja aliyeitwa", after: ", ambaye hadithi zake bado zinasimuliwa hadi leo.", correctAnswer: "Abunuwasi" },
  { before: "Ukimya mzito ulitanda nyumbani baada ya", after: "kufika kwamba babu hayupo tena.", correctAnswer: "habari" },
  { before: "Baada ya miezi ya jasho na uvumilivu, hatimaye shamba lilijaa", after: "ya kijani na matunda mengi.", correctAnswer: "mimea", acceptedAnswers: ["mazao"] },
];

export const kujielezaKwaUfasaha: Skill = {
  id: "g6-ksw-kz-kujieleza-kwa-ufasaha",
  code: "KZ.10",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Kujieleza kwa Ufasaha: Kusimulia Visa",
  description: "Tambua vipengele vya usimulizi bora — mtiririko wa matukio, kiimbo, ishara za uso, viziada lugha, na tasfida — kisha uvitumie kusimulia visa kwa ufasaha.",
  generate(rng) {
    const branch = randChoice(rng, ["kipengele-au-mwanzo", "panga-muundo", "panga-kusudi", "oanisha-kusudi", "kamilisha-mwanzo"] as const);

    if (branch === "kipengele-au-mwanzo") {
      const useKipengele = rng() < 0.5;
      if (useKipengele) {
        const entry = randChoice(rng, TECHNIQUES);
        const distractors = shuffle(rng, TECHNIQUES.filter((t) => t.neno !== entry.neno))
          .slice(0, 3)
          .map((t) => t.neno);
        const choices = shuffle(rng, [entry.neno, ...distractors]);
        return {
          kind: "multiple-choice",
          prompt: `Ni kipengele kipi cha usimulizi kinachoelezwa hapa? "${entry.maelezo}"`,
          choices,
          correctIndex: choices.indexOf(entry.neno),
          layout: "list",
          hint: "Fikiria ni sehemu gani ya usimulizi (sauti, uso, mwili, au mpangilio wa matukio) inayoelezwa.",
          explanation: `Hii ni maelezo ya kipengele "${entry.neno}" — ${entry.maelezo}.`,
        };
      }
      const topic = randChoice(rng, TOPICS);
      const good = randChoice(rng, GOOD_OPENERS);
      const weak = shuffle(rng, WEAK_OPENERS).slice(0, 3);
      const choices = shuffle(rng, [good, ...weak]);
      return {
        kind: "multiple-choice",
        prompt: `Ni mwanzo upi unaofaa zaidi kuvutia hadhira wa hadithi kuhusu "${topic}"?`,
        choices,
        correctIndex: choices.indexOf(good),
        layout: "list",
        hint: "Mwanzo mzuri huamsha taswira, hisia, au udadisi wa hadhira badala ya kusema tu 'nitawaeleza jambo'.",
        explanation: `Mwanzo bora ni: "${good}" — huamsha taswira na hisia mara moja, tofauti na mianzo mingine iliyo ya kawaida na isiyovutia.`,
      };
    }

    if (branch === "panga-muundo") {
      const useAbstract = rng() < 0.4;
      if (useAbstract) {
        const items = shuffle(rng, MUUNDO_HADITHI);
        return {
          kind: "ordering",
          prompt: "Panga hatua za muundo wa hadithi kwa mpangilio unaofaa, kuanzia mwanzo hadi mwisho.",
          instruction: "Bofya kwa mpangilio sahihi.",
          items,
          correctOrder: MUUNDO_HADITHI.map((h) => h.id),
          hint: "Hadithi huanza kwa kuwatambulisha wahusika, kisha tatizo huongezeka hadi kilele, na mwisho tatizo hutatuliwa.",
          explanation: MUUNDO_HADITHI.map((h) => h.label).join(" → "),
        };
      }
      const story = randChoice(rng, STORY_EVENTS);
      const items = shuffle(rng, story.events);
      return {
        kind: "ordering",
        prompt: "Panga matukio haya ya hadithi kwa mpangilio sahihi wa jinsi yalivyotokea.",
        instruction: "Bofya matukio kwa mpangilio sahihi kuanzia la kwanza hadi la mwisho.",
        items,
        correctOrder: story.events.map((e) => e.id),
        hint: "Fikiria ni tukio gani lililosababisha tukio linalofuata.",
        explanation: story.events.map((e) => e.label).join(" → "),
      };
    }

    if (branch === "panga-kusudi") {
      const items = shuffle(rng, TECHNIQUES.map((t) => ({ id: t.neno, label: t.neno })));
      const correctBucket: Record<string, string> = {};
      for (const t of TECHNIQUES) correctBucket[t.neno] = t.kusudi;
      return {
        kind: "categorize",
        prompt: "Panga kila kipengele cha usimulizi kulingana na kusudi lake kuu.",
        items,
        buckets: (["hisia", "hadhira", "ufahamu"] as Kusudi[]).map((k) => ({ id: k, label: KUSUDI_LABEL[k] })),
        correctBucket,
        hint: "Jiulize: kipengele hiki husaidia zaidi kuwasilisha hisia, kuvutia hadhira, au kurahisisha ufahamu na heshima?",
        explanation: TECHNIQUES.map((t) => `"${t.neno}" ${t.kusudiMaelezo.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "oanisha-kusudi") {
      const chosen = shuffle(rng, TECHNIQUES).slice(0, 6);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.neno, label: t.neno })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.neno, label: t.kusudiMaelezo })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.neno] = t.neno;
      return {
        kind: "click-match",
        prompt: "Oanisha kila kipengele cha usimulizi na kusudi lake katika kuwasilisha hadithi.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria ni jambo gani hasa kipengele hiki humfanyia msikilizaji au msimuliaji.",
        explanation: chosen.map((t) => `"${t.neno}" — ${t.kusudiMaelezo}.`).join(" "),
      };
    }

    const entry = randChoice(rng, OPENER_FILL);
    return {
      kind: "fill-blank",
      prompt: "Kamilisha mwanzo huu wa hadithi kwa neno linalofaa zaidi kuvutia hadhira.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint: "Fikiria neno linaloamsha hisia au taswira sahihi kulingana na muktadha wa sentensi.",
      explanation: `Neno linalofaa hapa ni "${entry.correctAnswer}" — huamsha taswira sahihi kulingana na muktadha wa hadithi.`,
    };
  },
};
