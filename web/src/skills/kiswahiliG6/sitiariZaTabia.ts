import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Kundi = "ujanja" | "uchoyo" | "uvivu" | "upole" | "ushupavu";

const KUNDI_LABEL: Record<Kundi, string> = {
  ujanja: "Ujanja",
  uchoyo: "Uchoyo",
  uvivu: "Uvivu",
  upole: "Upole",
  ushupavu: "Ushupavu",
};

const SITIARI: { mnyama: string; maana: string; kundi?: Kundi }[] = [
  { mnyama: "sungura", maana: "mjanja/mwerevu anayetumia akili kutatua matatizo", kundi: "ujanja" },
  { mnyama: "fisi", maana: "mchoyo/mlafi anayetamani kila kitu kwa ajili yake", kundi: "uchoyo" },
  { mnyama: "kasuku", maana: "anayerudia maneno bila kuyaelewa maana yake" },
  { mnyama: "kobe", maana: "mtu mwenye mwendo wa taratibu na uvumilivu mkubwa", kundi: "uvivu" },
  { mnyama: "simba", maana: "jasiri na shupavu, kiongozi asiyeogopa changamoto", kundi: "ushupavu" },
  { mnyama: "mbweha", maana: "mjanja mwenye hila za kificho", kundi: "ujanja" },
  { mnyama: "nyoka", maana: "mdanganyifu na msaliti asiyeaminika", kundi: "ujanja" },
  { mnyama: "punda", maana: "mkaidi asiyebadilisha msimamo hata akielezwa" },
  { mnyama: "tembo", maana: "mwenye nguvu na ushawishi mkubwa", kundi: "ushupavu" },
  { mnyama: "paka", maana: "mnafiki, mwenye kubembeleza kisha kudhuru" },
  { mnyama: "mbwa mwitu", maana: "mlafi na mkatili asiyejali wengine", kundi: "uchoyo" },
  { mnyama: "njiwa", maana: "mpole na mpenda amani", kundi: "upole" },
  { mnyama: "bundi", maana: "mwenye hekima na maarifa ya kina" },
  { mnyama: "chui", maana: "hatari isiyotarajiwa, mkali anapochokozwa", kundi: "ushupavu" },
  { mnyama: "twiga", maana: "mwenye kuona mbali na kutabiri yajayo" },
  { mnyama: "nyati", maana: "mkaidi na hatari akikasirishwa", kundi: "ushupavu" },
  { mnyama: "sokwe", maana: "mtundu na asiyetulia, mchezaji" },
  { mnyama: "mamba", maana: "mdanganyifu mwenye subira ya kuvizia mawindo", kundi: "ujanja" },
  { mnyama: "kuku", maana: "mwoga anayeogopa hatari ndogo" },
  { mnyama: "tausi", maana: "mwenye kiburi na kujivunia urembo wake" },
  { mnyama: "tai", maana: "mwangalifu na mwenye macho makali ya kuona mbali" },
  { mnyama: "konokono", maana: "mvivu sana, mwenye mwendo wa polepole kupindukia", kundi: "uvivu" },
  { mnyama: "chura", maana: "mwenye kujivuna uwezo asio nao" },
  { mnyama: "swala", maana: "mwepesi na mwenye kukimbia kwa kasi kuepuka hatari" },
  { mnyama: "kifaru", maana: "mgumu kubadili msimamo, mwenye nguvu ya kudumu", kundi: "ushupavu" },
  { mnyama: "mbuzi", maana: "mtundu, mkorofi mdogo asiyetulia" },
  { mnyama: "ng'ombe", maana: "mvumilivu na mtiifu katika kazi ngumu", kundi: "upole" },
  { mnyama: "mbwa", maana: "mwaminifu asiyemsaliti mmiliki wake" },
  { mnyama: "panya", maana: "mwoga lakini mjanja wa kujificha na kuepuka hatari", kundi: "ujanja" },
  { mnyama: "nyuki", maana: "mchapakazi mwenye bidii isiyochoka" },
  { mnyama: "nzige", maana: "mlafi anayeharibu kila kitu anachopita", kundi: "uchoyo" },
  { mnyama: "chatu", maana: "mvivu baada ya kupata anachotaka, hachangamki tena", kundi: "uvivu" },
  { mnyama: "kondoo", maana: "mpole na mtiifu, hafanyi ubishi", kundi: "upole" },
];

function sitiariOf(mnyama: string) {
  return SITIARI.find((s) => s.mnyama === mnyama)!;
}

const MAJINA = ["Amina", "Baraka", "Chebet", "Dennis", "Esther", "Fatuma", "Grace", "Hassan", "Imani", "Kioko", "Lilian", "Mwangi", "Naliaka", "Otieno", "Peris", "Rehema", "Salim", "Wanjiku"];

const FILL_TABIA: { mnyama: string; build: (name: string) => { before: string; after: string } }[] = [
  { mnyama: "kasuku", build: (name) => ({ before: `Kila somo linapofundishwa, ${name} hurudia maneno ya mwalimu bila kuelewa maana yake. Wenzake humwambia, "Yeye ni`, after: '."' }) },
  { mnyama: "kobe", build: (name) => ({ before: `${name} huchukua muda mrefu sana kutembea hadi shuleni kila asubuhi. Rafiki zake humtania wakisema, "Yeye ni`, after: ' wa kweli."' }) },
  { mnyama: "simba", build: (name) => ({ before: `Wakati wa mashindano ya mazungumzo, ${name} alisimama mbele ya kila mtu bila woga wowote. Mwalimu alisema, "Yeye ni`, after: ' wa kweli darasani."' }) },
  { mnyama: "mbweha", build: (name) => ({ before: `${name} daima hupata njia za siri za kupata anachotaka bila mtu kutambua. Wenzake humwita`, after: "kwa sababu ya ujanja wake." }) },
  { mnyama: "nyoka", build: (name) => ({ before: `Ingawa alionekana rafiki mzuri, ${name} aliishia kumsaliti mwenzake kwa siri. Watu kijijini walisema, "Yeye ni`, after: ' asiyeaminika."' }) },
  { mnyama: "tembo", build: (name) => ({ before: `Katika kampuni hiyo kubwa, ${name} ana ushawishi na uzito mkubwa katika maamuzi yote. Wafanyakazi humsema, "Yeye ni`, after: ' wa kampuni hiyo."' }) },
  { mnyama: "njiwa", build: (name) => ({ before: `${name} huepuka ugomvi kila mara na hupenda kutuliza mizozo kwa upole. Marafiki humwita`, after: "wa kijiji chao." }) },
  { mnyama: "kuku", build: (name) => ({ before: `${name} huogopa hata kelele ndogo za mbwa akiwa nje usiku. Wenzake humdhihaki wakisema, "Yeye ni`, after: ' mwoga."' }) },
  { mnyama: "tausi", build: (name) => ({ before: `${name} hupenda kujionyesha na kuzungumzia sura yake mara kwa mara mbele ya wengine. Wanafunzi wenzake husema, "Yeye ni`, after: ' wa darasa hilo."' }) },
  { mnyama: "nyuki", build: (name) => ({ before: `Bila kuchoka, ${name} hufanya kazi za shambani asubuhi hadi jioni kila siku. Wazazi wake husema, "Yeye ni`, after: ' wa kweli nyumbani."' }) },
  { mnyama: "panya", build: (name) => ({ before: `${name} hujificha kila anapoona shida ikija lakini hupata njia ya kutoroka kwa werevu. Wenzake humwita`, after: "kwa jinsi anavyojificha." }) },
  { mnyama: "kifaru", build: (name) => ({ before: `Hata akishauriwa mara nyingi, ${name} hakubadilisha msimamo wake hata kidogo kuhusu mradi ule. Walimu walisema, "Yeye ni`, after: ' asiyebadilika."' }) },
  { mnyama: "mamba", build: (name) => ({ before: `${name} alisubiri kwa utulivu kabla ya kumshtukiza mpinzani wake katika mchezo huo. Wachezaji wenzake walisema, "Yeye ni`, after: ' wa uwanjani."' }) },
  { mnyama: "chui", build: (name) => ({ before: `Wakati hasira zake zinapomshika, ${name} huwa hatari isiyotarajiwa kwa yeyote karibu naye. Wenzake humwita`, after: "anapokasirika." }) },
];

const SITIARI_SCENARIO: { mnyama: string; build: (name: string) => string }[] = [
  { mnyama: "sungura", build: (name) => `${name} daima hutafuta njia za busara za kutatua matatizo magumu darasani, hata pale wenzake wanaposhindwa. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "fisi", build: (name) => `Katika mgao wa chakula cha jioni, ${name} huchukua sehemu kubwa kuliko wote bila kuwaza kuhusu wenzake. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "kobe", build: (name) => `Katika mbio za shule, ${name} huwa wa mwisho kila mara kwa sababu ya mwendo wake wa taratibu sana. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "njiwa", build: (name) => `Wakati wa mabishano darasani, ${name} daima hujaribu kuwapatanisha wenzake kwa upole badala ya kuzidisha ugomvi. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "simba", build: (name) => `Katika mchezo wa mpira, ${name} husimama mbele kuwaongoza wenzake hata dhidi ya timu kali zaidi. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "mbweha", build: (name) => `${name} hupata njia za siri za kupata alichokitaka bila mtu yeyote kutambua mipango yake. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "kifaru", build: (name) => `Hata baada ya kushauriwa mara kadhaa na wazazi wake, ${name} aliendelea kufanya alichoamua bila kubadilika. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "tausi", build: (name) => `${name} hupenda kuvaa nguo za rangi za kupendeza na kuzitaja mbele ya kila mtu shuleni. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "nyuki", build: (name) => `Kutwa nzima, ${name} husaidia familia yake shambani bila kuchoka wala kulalamika. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "panya", build: (name) => `Kila mara akikosea, ${name} hupata njia za kujificha na kuepuka lawama za wazazi wake. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "nyoka", build: (name) => `Ingawa alijifanya rafiki mzuri, ${name} aliishia kumfichulia mwalimu siri ambazo mwenzake alimwambia kwa uaminifu. Ni sitiari ipi inayomfaa zaidi?` },
  { mnyama: "chui", build: (name) => `Kwa kawaida ni mtulivu, lakini ${name} hubadilika ghafla na kuwa hatari isiyotarajiwa akichokozwa. Ni sitiari ipi inayomfaa zaidi?` },
];

const HATUA_KUUNDA_SITIARI: { id: string; label: string }[] = [
  { id: "tambua-tabia", label: "Tambua tabia dhahiri ya mtu unayemwelezea" },
  { id: "fikiria-wanyama", label: "Fikiria wanyama wenye tabia zinazofanana na tabia hiyo" },
  { id: "chagua-mnyama", label: "Chagua mnyama anayewiana zaidi na tabia hiyo" },
  { id: "tunga-sentensi", label: "Tunga sentensi ukitumia muundo 'Yeye ni [mnyama]' kueleza tabia hiyo kwa ufasaha" },
];

export const sitiariZaTabia: Skill = {
  id: "g6-ksw-kz-sitiari-za-tabia",
  code: "KZ.9",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Sitiari za Tabia",
  description: "Tambua na utumie sitiari za wanyama zinazoelezea tabia za watu, kama vile 'yeye ni sungura' au 'yeye ni kobe safarini'.",
  generate(rng) {
    const branch = randChoice(rng, ["maana-sitiari", "oanisha-sitiari", "panga-tabia", "yeye-ni", "hatua-kuunda", "chagua-sitiari"] as const);

    if (branch === "maana-sitiari") {
      const entry = randChoice(rng, SITIARI);
      const pool = entry.kundi
        ? SITIARI.filter((s) => s.kundi === entry.kundi && s.mnyama !== entry.mnyama)
        : SITIARI.filter((s) => s.mnyama !== entry.mnyama);
      const distractors = shuffle(rng, pool)
        .slice(0, 3)
        .map((s) => s.maana);
      const choices = shuffle(rng, [entry.maana, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Sitiari "Yeye ni ${entry.mnyama}" ina maana gani?`,
        choices,
        correctIndex: choices.indexOf(entry.maana),
        layout: "list",
        hint: "Fikiria tabia halisi ya mnyama huyu katika mazingira yake.",
        explanation: `"Yeye ni ${entry.mnyama}" humaanisha mtu ${entry.maana}.`,
      };
    }

    if (branch === "oanisha-sitiari") {
      const chosen = shuffle(rng, SITIARI).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.mnyama, label: s.mnyama })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.mnyama, label: s.maana })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.mnyama] = s.mnyama;
      return {
        kind: "click-match",
        prompt: "Oanisha kila mnyama na tabia inayowakilishwa na sitiari 'Yeye ni...'.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria jinsi mnyama huyu anavyofahamika kuishi au kuishi kimaumbile.",
        explanation: chosen.map((s) => `"Yeye ni ${s.mnyama}" — ${s.maana}.`).join(" "),
      };
    }

    if (branch === "panga-tabia") {
      const kundiZote: Kundi[] = ["ujanja", "uchoyo", "uvivu", "upole", "ushupavu"];
      const chosen = kundiZote.flatMap((k) => shuffle(rng, SITIARI.filter((s) => s.kundi === k)).slice(0, 2));
      const items = shuffle(rng, chosen.map((s) => ({ id: s.mnyama, label: s.mnyama })));
      const correctBucket: Record<string, string> = {};
      for (const s of chosen) correctBucket[s.mnyama] = s.kundi!;
      return {
        kind: "categorize",
        prompt: "Panga kila mnyama katika aina ya tabia inayowakilishwa na sitiari yake.",
        items,
        buckets: kundiZote.map((k) => ({ id: k, label: KUNDI_LABEL[k] })),
        correctBucket,
        hint: "Fikiria kama tabia inayowakilishwa ni ujanja, uchoyo, uvivu, upole, au ushupavu.",
        explanation: chosen.map((s) => `"${s.mnyama}" huwakilisha tabia ya ${KUNDI_LABEL[s.kundi!].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "yeye-ni") {
      const template = randChoice(rng, FILL_TABIA);
      const entry = sitiariOf(template.mnyama);
      const name = randChoice(rng, MAJINA);
      const { before, after } = template.build(name);
      return {
        kind: "fill-blank",
        prompt: "Soma maelezo ya tabia kisha jaza pengo kwa mnyama anayefaa sitiari hiyo.",
        before,
        after,
        correctAnswer: entry.mnyama,
        inputMode: "text",
        hint: `Tabia hii inaelezwa kwa sitiari ya "Yeye ni ${entry.mnyama}" — ${entry.maana}.`,
        explanation: `Jibu sahihi ni "${entry.mnyama}" — sitiari hii humaanisha mtu ${entry.maana}.`,
      };
    }

    if (branch === "hatua-kuunda") {
      const items = shuffle(rng, HATUA_KUUNDA_SITIARI);
      return {
        kind: "ordering",
        prompt: "Panga hatua za kuunda sitiari inayofaa kuelezea tabia ya mtu.",
        instruction: "Bofya kwa mpangilio sahihi kuanzia hatua ya kwanza hadi ya mwisho.",
        items,
        correctOrder: HATUA_KUUNDA_SITIARI.map((h) => h.id),
        hint: "Anza kwa kutambua tabia, kisha linganisha na wanyama, chagua anayefaa, hatimaye tunga sentensi.",
        explanation: HATUA_KUUNDA_SITIARI.map((h) => h.label).join(" → "),
      };
    }

    const template = randChoice(rng, SITIARI_SCENARIO);
    const entry = sitiariOf(template.mnyama);
    const name = randChoice(rng, MAJINA);
    const prompt = template.build(name);
    const pool = entry.kundi
      ? SITIARI.filter((s) => s.kundi === entry.kundi && s.mnyama !== entry.mnyama)
      : SITIARI.filter((s) => s.mnyama !== entry.mnyama);
    const distractors = shuffle(rng, pool)
      .slice(0, 3)
      .map((s) => s.mnyama);
    const choices = shuffle(rng, [entry.mnyama, ...distractors]);
    return {
      kind: "multiple-choice",
      prompt,
      choices,
      correctIndex: choices.indexOf(entry.mnyama),
      layout: "row",
      hint: `Fikiria tabia inayoelezwa hapa inafanana zaidi na mnyama gani? (Kidokezo: inahusiana na ${entry.kundi ? KUNDI_LABEL[entry.kundi].toLowerCase() : "tabia hii maalum"}.)`,
      explanation: `Sitiari inayofaa zaidi ni "Yeye ni ${entry.mnyama}" — ${entry.maana}.`,
    };
  },
};
