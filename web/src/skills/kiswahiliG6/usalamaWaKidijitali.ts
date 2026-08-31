import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

// KICD Grade 6 Kiswahili, Kusoma (KS), mada 4.2.1 (mandhari: Misimu) na mada 10.2.1 (mandhari: Kukabiliana na
// Ugaidi) — usomaji mpana unaohusu usalama wa kidijitali: matumizi ya tovuti salama, kutoshiriki nywila,
// kumwambia mzazi/mwalimu ukiwasiliana na mtu usiyemfahamu mtandaoni, kufungua/kufunga faili kwa usalama, na
// kutambua mitandao salama. Maudhui ya ugaidi yamefumbatwa kama tahadhari ya jumla ya usalama mtandaoni pekee,
// bila maelezo yasiyofaa kwa umri wa mwanafunzi.

const KENYAN_NAMES = [
  "Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka",
  "Otieno", "Wanjiru", "Achieng", "Kamau", "Njeri", "Wafula", "Cherono", "Musyoka", "Akinyi", "Kiptoo",
] as const;
const KENYAN_PLACES = [
  "Nyeri", "Nakuru", "Kisumu", "Eldoret", "Machakos", "Kitale", "Kericho", "Kakamega", "Bungoma", "Meru",
] as const;
function name(rng: RNG): string {
  return randChoice(rng, KENYAN_NAMES);
}
function place(rng: RNG): string {
  return randChoice(rng, KENYAN_PLACES);
}

type Category = "tovuti" | "nywila" | "wageni" | "faili" | "mtandao" | "jumla";
interface Action {
  id: string;
  text: string;
  salama: boolean;
  category: Category;
}

const ACTIONS: Action[] = [
  { id: "s1", text: "Kutumia tovuti zinazojulikana na za kuaminika pekee wakati wa kutafuta habari", salama: true, category: "tovuti" },
  { id: "s2", text: "Kumwuliza mzazi au mwalimu kabla ya kutembelea tovuti mpya", salama: true, category: "tovuti" },
  { id: "s3", text: "Kuweka nywila ngumu inayochanganya herufi kubwa, ndogo, nambari na alama", salama: true, category: "nywila" },
  { id: "s4", text: "Kutobadilishana nywila yako na mtu yeyote, hata rafiki wa karibu", salama: true, category: "nywila" },
  { id: "s5", text: "Kumwambia mzazi au mwalimu mara moja ukiwasiliana na mtu usiyemfahamu mtandaoni", salama: true, category: "wageni" },
  { id: "s6", text: "Kutokubali kukutana ana kwa ana na mtu uliyekutana naye mtandaoni pekee", salama: true, category: "wageni" },
  { id: "s7", text: "Kufunga faili baada ya kuitumia ili kulinda taarifa zilizomo", salama: true, category: "faili" },
  { id: "s8", text: "Kuchunguza chanzo cha faili kwa programu ya kuzuia virusi kabla ya kuifungua", salama: true, category: "faili" },
  { id: "s9", text: "Kutumia mtandao wa WiFi unaolindwa na nywila badala ya mtandao wazi", salama: true, category: "mtandao" },
  { id: "s10", text: "Kuzima au kukata muunganisho wa intaneti baada ya kumaliza kazi yako", salama: true, category: "mtandao" },
  { id: "s11", text: "Kuripoti ujumbe wa kutisha au wa ajabu kwa mzazi, mwalimu au polisi", salama: true, category: "wageni" },
  { id: "s12", text: "Kutobonyeza viungo (links) vinavyotoka kwa vyanzo visivyojulikana", salama: true, category: "faili" },
  { id: "s13", text: "Kutoshiriki picha za kibinafsi na watu usiowafahamu mtandaoni", salama: true, category: "jumla" },
  { id: "s14", text: "Kuuliza ruhusa ya mzazi kabla ya kupakua programu au faili mpya", salama: true, category: "faili" },
  { id: "s15", text: "Kutumia jina la utani, si jina kamili la nyumbani, kwenye majukwaa ya michezo ya mtandaoni", salama: true, category: "jumla" },
  { id: "h1", text: "Kushiriki nywila yako na mtu asiyemfahamu vizuri", salama: false, category: "nywila" },
  { id: "h2", text: "Kutembelea tovuti zisizojulikana zinazoahidi zawadi za bure", salama: false, category: "tovuti" },
  { id: "h3", text: "Kukubali ombi la urafiki kutoka kwa mtu usiyemfahamu bila kuuliza mzazi", salama: false, category: "wageni" },
  { id: "h4", text: "Kupanga kukutana ana kwa ana na mtu uliyekutana naye mtandaoni bila kumwambia mzazi", salama: false, category: "wageni" },
  { id: "h5", text: "Kufungua faili kutoka kwa chanzo kisichojulikana bila tahadhari yoyote", salama: false, category: "faili" },
  { id: "h6", text: "Kutumia mtandao wa WiFi wa umma usio na nywila kwa mambo ya siri kama benki", salama: false, category: "mtandao" },
  { id: "h7", text: "Kuacha kompyuta au simu wazi bila kuifunga baada ya kuitumia", salama: false, category: "jumla" },
  { id: "h8", text: "Kutuma taarifa zako za kibinafsi kama anwani ya nyumbani kwa mtu usiyemfahamu", salama: false, category: "jumla" },
  { id: "h9", text: "Kufuta ujumbe wa kutisha bila kumwambia mzazi au mwalimu", salama: false, category: "wageni" },
  { id: "h10", text: "Kubonyeza kiungo (link) kutoka kwa ujumbe usiotarajiwa bila kuuthibitisha", salama: false, category: "tovuti" },
  { id: "h11", text: "Kutumia nywila moja rahisi kwa akaunti zako zote", salama: false, category: "nywila" },
  { id: "h12", text: "Kupuuza onyo la kompyuta kuhusu faili hatari na kuendelea kuifungua", salama: false, category: "faili" },
  { id: "h13", text: "Kushiriki eneo lako (location) na wageni mtandaoni", salama: false, category: "jumla" },
  { id: "h14", text: "Kupakia picha za kibinafsi za marafiki mtandaoni bila ruhusa yao", salama: false, category: "jumla" },
  { id: "h15", text: "Kutochunguza kama tovuti ni salama kabla ya kuweka taarifa za kibinafsi", salama: false, category: "tovuti" },
];

interface OrderSet {
  title: string;
  steps: { id: string; label: string }[];
}
const ORDER_SETS: OrderSet[] = [
  {
    title: "Panga hatua za kushughulikia faili kwa usalama.",
    steps: [
      { id: "f1", label: "Chunguza chanzo cha faili kabla ya kuifungua" },
      { id: "f2", label: "Tumia programu ya kuzuia virusi kuichunguza faili" },
      { id: "f3", label: "Fungua faili tu ikiwa una uhakika ni salama" },
      { id: "f4", label: "Funga faili baada ya kuitumia" },
    ],
  },
  {
    title: "Panga hatua za kufanya ukiwasiliana na mtu usiyemfahamu mtandaoni.",
    steps: [
      { id: "g1", label: "Usimjibu ujumbe wa mtu usiyemfahamu" },
      { id: "g2", label: "Chukua picha ya skrini (screenshot) ya ujumbe huo, kama inawezekana" },
      { id: "g3", label: "Mwambie mzazi au mwalimu mara moja" },
      { id: "g4", label: "Usifute ujumbe kabla ya kumwonyesha mzazi au mwalimu" },
    ],
  },
  {
    title: "Panga hatua za kuunda nywila salama.",
    steps: [
      { id: "n1", label: "Chagua mchanganyiko wa herufi kubwa na ndogo" },
      { id: "n2", label: "Ongeza nambari na alama kwenye nywila" },
      { id: "n3", label: "Epuka kutumia taarifa zako binafsi kama tarehe ya kuzaliwa" },
      { id: "n4", label: "Weka nywila hiyo faragha, usimwambie yeyote" },
    ],
  },
  {
    title: "Panga hatua za kuthibitisha usalama wa tovuti kabla ya kuweka taarifa zako.",
    steps: [
      { id: "t1", label: "Angalia kama anwani ya tovuti inaanza na 'https'" },
      { id: "t2", label: "Thibitisha kuwa tovuti inajulikana au imependekezwa na mtu mzima" },
      { id: "t3", label: "Soma maoni au taarifa kuhusu tovuti hiyo" },
      { id: "t4", label: "Weka taarifa zako za kibinafsi tu ukiwa na uhakika wa usalama wake" },
    ],
  },
  {
    title: "Panga hatua za kuunganisha kwenye mtandao wa WiFi salama.",
    steps: [
      { id: "w1", label: "Chagua mtandao unaojulikana na kuaminika" },
      { id: "w2", label: "Hakikisha mtandao una nywila (umefungwa)" },
      { id: "w3", label: "Epuka kufanya miamala ya fedha kwenye WiFi ya umma" },
      { id: "w4", label: "Zima muunganisho wa intaneti baada ya kumaliza kazi" },
    ],
  },
];

const SCENARIO_RESPONSE: { scenario: string; response: string }[] = [
  { scenario: "Mtu usiyemfahamu anakutumia ujumbe wa kutisha mtandaoni", response: "Mwambie mzazi au mwalimu mara moja" },
  { scenario: "Umepokea barua pepe yenye kiungo cha kushangaza kutoka kwa mtu usiyemfahamu", response: "Usibonyeze kiungo hicho" },
  { scenario: "Rafiki anakuomba nywila yako ya akaunti", response: "Kataa kutoa nywila yako kwa yeyote" },
  { scenario: "Unataka kufungua faili kutoka chanzo kisichojulikana", response: "Kichunguze kwa programu ya kuzuia virusi kabla ya kukifungua" },
  { scenario: "Unataka kutumia WiFi ya umma dukani au stendi ya mabasi", response: "Epuka kufanya miamala ya fedha kwenye mtandao huo" },
  { scenario: "Tovuti isiyojulikana inaomba nambari yako ya simu na anwani ya nyumbani", response: "Usitoe taarifa hizo za kibinafsi" },
];

const FILL_BLANKS: { before: string; after: string; correctAnswer: string }[] = [
  { before: "Usimwambie yeyote ", after: " yako, hata rafiki wa karibu.", correctAnswer: "nywila" },
  { before: "Kabla ya kutembelea tovuti mpya, ni vyema kumwuliza ", after: " au mwalimu.", correctAnswer: "mzazi" },
  { before: "Ukiwasiliana na mtu usiyemfahamu mtandaoni, mwambie mzazi au ", after: " mara moja.", correctAnswer: "mwalimu" },
  { before: "Kabla ya kufungua faili, ni vyema kuichunguza kwa programu ya kuzuia ", after: ".", correctAnswer: "virusi" },
  { before: "Mtandao wa WiFi ulio na ", after: " ni salama zaidi kuliko mtandao wazi.", correctAnswer: "nywila" },
  { before: "Usikubali kukutana ana kwa ana na mtu uliyekutana naye ", after: " pekee.", correctAnswer: "mtandaoni" },
  { before: "Ukipokea ujumbe wa kutisha mtandaoni, usiu", after: ", bali umwonyeshe mzazi au mwalimu.", correctAnswer: "fute" },
  { before: "Baada ya kutumia faili au kompyuta, ni vyema ku", after: " ili kulinda taarifa zako.", correctAnswer: "funga" },
  { before: "Usibonyeze ", after: " zinazotoka kwa vyanzo usiyoyafahamu.", correctAnswer: "viungo" },
  { before: "Nywila salama huchanganya herufi kubwa, ndogo, ", after: " na alama.", correctAnswer: "nambari" },
  { before: "Usishiriki eneo lako (location) na ", after: " mtandaoni.", correctAnswer: "wageni" },
  { before: "Tovuti salama mara nyingi huanza na 'https' na hupendekezwa na ", after: ".", correctAnswer: "mtu mzima" },
];

interface EvalScenario {
  prompt: string;
  correctChoice: string;
  otherChoices: string[];
  explanation: string;
}
const EVALUATE_SCENARIOS: ((rng: RNG) => EvalScenario)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anapata ujumbe wa mtandaoni kutoka kwa mtu asiyemfahamu akimwomba jina la shule yake na anwani ya nyumbani. ${who} anafikiria kujibu ujumbe huo bila kumwambia mzazi. Je, hatua hii ni salama?`,
      correctChoice: "Hatari, kwa sababu kutoa taarifa za kibinafsi kwa mtu usiyemfahamu mtandaoni bila kumshirikisha mzazi kunaweza kumweka hatarini",
      otherChoices: [
        "Salama, kwa sababu kutoa jina la shule pekee hakuna madhara yoyote",
        "Salama, kwa sababu mtu huyo anaweza kuwa rafiki mpya mzuri",
        "Hatari, lakini haihitaji kumwambia mzazi wala mwalimu",
      ],
      explanation: "Kutoa taarifa za kibinafsi kwa mtu usiyemfahamu mtandaoni ni hatari; mzazi au mwalimu anapaswa kushirikishwa mara moja.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anataka kupakua mchezo mpya kwenye simu ya nyumbani. Kabla ya kupakua, anamwuliza mzazi wake ruhusa na kuchunguza kama tovuti hiyo inaaminika. Je, hatua hii ni salama?`,
      correctChoice: "Salama, kwa sababu kuuliza ruhusa ya mzazi na kuchunguza uaminifu wa tovuti ni tahadhari muhimu kabla ya kupakua chochote",
      otherChoices: [
        "Hatari, kwa sababu kuuliza mzazi kunachukua muda mrefu bila sababu",
        "Salama, lakini hakuna haja ya kuchunguza tovuti kama mchezo unaonekana mzuri",
        "Hatari, kwa sababu michezo yote ya mtandaoni si salama kamwe",
      ],
      explanation: "Kuuliza ruhusa ya mzazi na kuchunguza uaminifu wa chanzo kabla ya kupakua programu ni hatua sahihi na salama.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `${who} anatumia WiFi ya bure kwenye kituo cha mabasi ${p} kuingia kwenye akaunti yake ya benki kulipia bidhaa. Je, hatua hii ni salama?`,
      correctChoice: "Hatari, kwa sababu mitandao ya WiFi ya umma mara nyingi si salama kwa miamala ya fedha au taarifa nyeti",
      otherChoices: [
        "Salama, kwa sababu WiFi ya bure huwa salama kila wakati",
        "Salama, kwa sababu benki huthibitisha usalama wa mtandao wowote",
        "Hatari, lakini haihusiani kabisa na taarifa za benki",
      ],
      explanation: "WiFi ya umma mara nyingi haina ulinzi wa kutosha, hivyo si salama kwa miamala ya fedha au taarifa za siri.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anapokea ujumbe wa ajabu kutoka kwa akaunti isiyojulikana ukimwomba abonyeze kiungo ili "kushinda zawadi". ${who} anaamua kutobonyeza kiungo hicho na kumwonyesha mwalimu wake. Je, hatua hii ni salama?`,
      correctChoice: "Salama, kwa sababu kutobonyeza viungo vya kushangaza na kumshirikisha mtu mzima ni njia sahihi ya kujilinda",
      otherChoices: [
        "Hatari, kwa sababu angepaswa kubonyeza kiungo ili kuthibitisha kama ni kweli",
        "Salama, lakini hakukuwa na haja ya kumwambia mwalimu",
        "Hatari, kwa sababu zawadi za mtandaoni ni za kweli kila wakati",
      ],
      explanation: "Kutobonyeza viungo vya kutiliwa shaka na kumshirikisha mtu mzima ni tabia salama ya kidijitali.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anaweka nywila inayofanana na jina lake la kwanza pekee kwenye akaunti zake zote za mtandaoni kwa sababu ni rahisi kukumbuka. Je, hii ni salama?`,
      correctChoice: "Hatari, kwa sababu nywila rahisi na inayotumika kwenye akaunti zote inaweza kuvunjwa kwa urahisi na mtu yeyote",
      otherChoices: [
        "Salama, kwa sababu jina ni jambo la kibinafsi kwa hivyo hakuna mtu atakayelijua",
        "Salama, kwa sababu nywila fupi huwa rahisi kulinda",
        "Hatari, lakini si tatizo kama akaunti hazina taarifa muhimu",
      ],
      explanation: "Nywila inayotokana na jina na inayotumika kila mahali ni rahisi kubashiriwa au kuvunjwa; nywila ngumu na tofauti kwa kila akaunti ni salama zaidi.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anapokea ombi la urafiki kutoka kwa mtu asiyemfahamu kwenye mtandao wa kijamii. Badala ya kukubali mara moja, anamwuliza mzazi wake kwanza. Je, hii ni salama?`,
      correctChoice: "Salama, kwa sababu kuuliza mzazi kabla ya kukubali maombi kutoka kwa watu usiowafahamu husaidia kuepuka hatari zinazoweza kutokea",
      otherChoices: [
        "Hatari, kwa sababu kumsubiri mzazi kunaweza kumkosesha rafiki mpya",
        "Salama, lakini kuuliza mzazi si muhimu sana",
        "Hatari, kwa sababu maombi yote ya urafiki mtandaoni ni salama",
      ],
      explanation: "Kushauriana na mzazi kabla ya kukubali maombi ya watu usiowafahamu mtandaoni ni tabia sahihi ya usalama wa kidijitali.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anapata faili lenye jina la ajabu kutoka kwa barua pepe isiyojulikana na anaamua kuifungua haraka kwa udadisi bila kuichunguza. Je, hii ni salama?`,
      correctChoice: "Hatari, kwa sababu kufungua faili kutoka chanzo kisichojulikana bila kukichunguza kwanza kunaweza kuingiza programu hasidi kwenye kifaa",
      otherChoices: [
        "Salama, kwa sababu udadisi ni jambo zuri kwa mwanafunzi",
        "Salama, kwa sababu faili zote za barua pepe ni salama",
        "Hatari, lakini hakuna njia ya kujilinda dhidi ya hilo",
      ],
      explanation: "Kufungua faili kisichojulikana bila kukichunguza kwanza kunaweza kudhuru kifaa; kuchunguza kwa programu ya kuzuia virusi ni muhimu.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anagundua kuwa ndugu yake mdogo anazungumza na mtu asiyemfahamu mtandaoni ambaye anamwomba wakutane. ${who} anamwambia mzazi mara moja. Je, hatua hii ni salama?`,
      correctChoice: "Salama, kwa sababu kumjulisha mzazi haraka kuhusu mawasiliano ya hatari na mtu usiyemfahamu ni jambo sahihi la kufanya",
      otherChoices: [
        "Hatari, kwa sababu ilikuwa siri ya ndugu yake pekee",
        "Salama, lakini haikuwa lazima kumwambia mzazi",
        "Hatari, kwa sababu angepaswa kumruhusu ndugu yake akutane na mtu huyo",
      ],
      explanation: "Kumjulisha mzazi mara moja kuhusu ombi la kukutana na mtu usiyemfahamu mtandaoni ni jambo la busara linalolinda usalama wa mtoto.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anaona tovuti inayoahidi simu ya bure ikiwa atatoa nambari yake ya siri ya benki. Anafikiria kutoa nambari hiyo haraka ili apate zawadi. Je, hii ni salama?`,
      correctChoice: "Hatari, kwa sababu tovuti halali hazihitaji taarifa za siri za benki ili kutoa zawadi — hii ni ishara ya udanganyifu",
      otherChoices: [
        "Salama, kwa sababu zawadi za bure daima ni za kweli",
        "Salama, kwa sababu tovuti zinazoahidi zawadi huwa zimethibitishwa",
        "Hatari, lakini hakuna madhara ya kutoa nambari ya siri ya benki",
      ],
      explanation: "Kuombwa taarifa za siri za benki ili kupata zawadi ni ishara ya kawaida ya udanganyifu wa kimtandao.",
    };
  },
  (rng) => {
    const who = name(rng);
    const p = place(rng);
    return {
      prompt: `Shuleni ${p}, mwalimu anawafunza wanafunzi kufunga kompyuta na kuzima intaneti baada ya kutumia maabara ya kompyuta. ${who} anafuata maagizo haya kila siku. Je, hii ni salama?`,
      correctChoice: "Salama, kwa sababu kufunga vifaa na kuzima muunganisho baada ya matumizi husaidia kulinda taarifa na kuepuka matumizi mabaya",
      otherChoices: [
        "Hatari, kwa sababu kuzima intaneti kunapoteza muda wa somo linalofuata",
        "Salama, lakini si muhimu kufunga kompyuta kila siku",
        "Hatari, kwa sababu kompyuta zinapaswa kubaki wazi kila wakati",
      ],
      explanation: "Kufunga vifaa na kuzima muunganisho baada ya matumizi ni tabia nzuri ya usalama wa kidijitali shuleni.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anashiriki eneo lake la sasa (location) kwenye programu ya mtandaoni na watu wote wanaomfuata, wakiwemo wasiowafahamu. Je, hii ni salama?`,
      correctChoice: "Hatari, kwa sababu kushiriki eneo lako na watu usiowafahamu kunaweza kuwaonyesha mahali ulipo hasa, jambo linaloweza kukuweka hatarini",
      otherChoices: [
        "Salama, kwa sababu marafiki wote mtandaoni wanaweza kuaminiwa",
        "Salama, kwa sababu programu za mtandaoni huwa salama kila wakati",
        "Hatari, lakini si tatizo kama akaunti ina picha nzuri tu",
      ],
      explanation: "Kushiriki eneo lako hasa na watu usiowafahamu mtandaoni ni hatari kwa usalama wako binafsi.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} anataka kutumia tovuti mpya kwa mradi wa shule. Kabla ya kuiamini, anaangalia kama anwani yake inaanza na 'https' na kuuliza mwalimu kama tovuti hiyo inafaa. Je, hii ni salama?`,
      correctChoice: "Salama, kwa sababu kuthibitisha usalama wa tovuti kabla ya kuitumia ni tahadhari nzuri ya kidijitali",
      otherChoices: [
        "Hatari, kwa sababu kuuliza mwalimu kunapoteza muda wa mradi",
        "Salama, lakini kuangalia 'https' si muhimu sana",
        "Hatari, kwa sababu tovuti zote za shule ni hatari",
      ],
      explanation: "Kuthibitisha usalama wa tovuti (kama anwani 'https' na ushauri wa mtu mzima) kabla ya kuitumia ni tabia salama.",
    };
  },
];

export const usalamaWaKidijitali: Skill = {
  id: "g6-ksw-ks-usalama-wa-kidijitali",
  code: "KS.4",
  subjectId: "kiswahili",
  strandId: "g6-ksw-ks",
  grade: 6,
  title: "Kusoma kwa Mapana: Usalama wa Kidijitali",
  description: "Tambua vitendo salama na hatari mtandaoni — tovuti salama, ulinzi wa nywila, mawasiliano na wageni mtandaoni, ufunguzi salama wa faili, na mitandao salama — na uhukumu hali mbalimbali za usalama wa kidijitali.",
  generate(rng) {
    const branch = randChoice(rng, ["salama-mc", "sort", "hatua", "match", "fill", "evaluate"] as const);
    const hint = "Fikiria kama kitendo hiki kinaweza kumweka mtumiaji hatarini mtandaoni au la.";

    if (branch === "salama-mc") {
      const wantSafe = rng() > 0.5;
      const category = randChoice(rng, ["tovuti", "nywila", "wageni", "faili", "mtandao", "jumla"] as const);
      const sameCatSame = ACTIONS.filter((a) => a.category === category && a.salama === wantSafe);
      const sameCatOpp = ACTIONS.filter((a) => a.category === category && a.salama !== wantSafe);
      const correct = sameCatSame.length > 0 ? randChoice(rng, sameCatSame) : randChoice(rng, ACTIONS.filter((a) => a.salama === wantSafe));
      let distractorPool = sameCatOpp.filter((a) => a.id !== correct.id);
      if (distractorPool.length < 3) {
        distractorPool = ACTIONS.filter((a) => a.salama !== wantSafe && a.id !== correct.id);
      }
      const distractors = shuffle(rng, distractorPool).slice(0, 3);
      const choices = shuffle(rng, [correct.text, ...distractors.map((d) => d.text)]);
      return {
        kind: "multiple-choice",
        prompt: wantSafe ? "Ni kitendo gani KINACHOFAA (salama) zaidi kwa usalama wa kidijitali?" : "Ni kitendo gani ni HATARI zaidi kwa usalama wa kidijitali?",
        choices,
        correctIndex: choices.indexOf(correct.text),
        layout: "list",
        hint,
        explanation: `"${correct.text}" ni kitendo cha ${correct.salama ? "salama" : "hatari"} kwa usalama wa kidijitali.`,
      };
    }

    if (branch === "sort") {
      const chosen = shuffle(rng, ACTIONS).slice(0, randInt(rng, 8, 10));
      const items = chosen.map((a) => ({ id: a.id, label: a.text }));
      const correctBucket: Record<string, string> = {};
      for (const a of chosen) correctBucket[a.id] = a.salama ? "salama" : "hatari";
      return {
        kind: "categorize",
        prompt: "Panga kila kitendo kama salama au hatari kwa usalama wa kidijitali.",
        items: shuffle(rng, items),
        buckets: [
          { id: "salama", label: "Salama" },
          { id: "hatari", label: "Hatari" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((a) => `"${a.text}" ni ${a.salama ? "salama" : "hatari"}.`).join(" "),
      };
    }

    if (branch === "hatua") {
      const set = randChoice(rng, ORDER_SETS);
      return {
        kind: "ordering",
        prompt: set.title,
        instruction: "Bofya hatua kwa mfuatano sahihi.",
        items: shuffle(rng, set.steps),
        correctOrder: set.steps.map((s) => s.id),
        hint: "Fikiria hatua ya kwanza ya tahadhari kabla ya kuchukua hatua kubwa zaidi.",
        explanation: set.steps.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, SCENARIO_RESPONSE).slice(0, randInt(rng, 4, 6));
      const tokens = shuffle(rng, chosen.map((sr, i) => ({ id: `r${i}`, label: sr.scenario })));
      const targets = shuffle(rng, chosen.map((sr, i) => ({ id: `r${i}`, label: sr.response })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_, i) => (correctMap[`r${i}`] = `r${i}`));
      return {
        kind: "click-match",
        prompt: "Oanisha kila hali ya hatari mtandaoni na hatua sahihi ya kuchukua.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((sr) => `"${sr.scenario}" → ${sr.response}.`).join(" "),
      };
    }

    if (branch === "fill") {
      const fb = randChoice(rng, FILL_BLANKS);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha kanuni hii ya usalama wa kidijitali.",
        before: fb.before,
        after: fb.after,
        correctAnswer: fb.correctAnswer,
        inputMode: "text",
        hint,
        explanation: `${fb.before}${fb.correctAnswer}${fb.after}`,
      };
    }

    const q = randChoice(rng, EVALUATE_SCENARIOS)(rng);
    const choices = shuffle(rng, [q.correctChoice, ...q.otherChoices]);
    return {
      kind: "multiple-choice",
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(q.correctChoice),
      layout: "list",
      hint: "Fikiria kama kitendo kinamweka mtu hatarini, na kwa nini.",
      explanation: q.explanation,
    };
  },
};
