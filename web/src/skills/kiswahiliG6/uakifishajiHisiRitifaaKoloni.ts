import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Mark = "!" | "'" | ":";
type Kategoria = "hisi" | "ritifaa" | "koloni";

const MARK_INFO: Record<Mark, { jina: string; kategoria: Kategoria; kanuni: string }> = {
  "!": { jina: "Alama ya Hisi (!)", kategoria: "hisi", kanuni: "kuonyesha hisia kali kama mshangao, furaha, hatari, maumivu au amri" },
  "'": { jina: "Ritifaa (')", kategoria: "ritifaa", kanuni: "kuonyesha kuachwa kwa irabu inapounganisha maneno mawili yanayokutana kiirabu" },
  ":": { jina: "Koloni (:)", kategoria: "koloni", kanuni: "kutambulisha orodha ya vitu au maelezo/sababu inayofuata baada ya wazo kuu" },
};

const KATEGORIA_LABEL: Record<Kategoria, string> = {
  hisi: "Alama ya Hisi (!)",
  ritifaa: "Ritifaa (')",
  koloni: "Koloni (:)",
};

interface PunctItem {
  mark: Mark;
  before: string;
  after: string;
  maelezo: string;
}

const PUNCT_ITEMS: PunctItem[] = [
  // Alama ya hisi (!) — mshangao, furaha, hatari, amri, maumivu
  { mark: "!", before: "Tahadhari, gari linakuja kwa kasi sana", after: "", maelezo: "Sentensi hii inaonya hatari inayokuja, hivyo inahitaji alama ya hisi kuonyesha wasiwasi mkali." },
  { mark: "!", before: "Hongera, umefaulu mtihani wa Kiswahili", after: "", maelezo: "Sentensi hii inaonyesha furaha ya pongezi, hivyo inahitaji alama ya hisi." },
  { mark: "!", before: "Ondoka hapa sasa hivi", after: "", maelezo: "Hii ni amri kali, hivyo inahitaji alama ya hisi kuonyesha msisitizo." },
  { mark: "!", before: "Umenishtua kabisa", after: "", maelezo: "Sentensi hii inaonyesha mshangao, hivyo inahitaji alama ya hisi." },
  { mark: "!", before: "Pole sana, hukustahili kuumia hivyo", after: "", maelezo: "Sentensi hii inaonyesha huruma yenye hisia kali, hivyo inahitaji alama ya hisi." },
  { mark: "!", before: "Mtoto ameanguka ndani ya mto, tusaidieni", after: "", maelezo: "Hii ni wito wa dharura, hivyo inahitaji alama ya hisi kuonyesha hofu na uharaka." },
  { mark: "!", before: "Nyoka yuko karibu na mguu wako, jihadhari", after: "", maelezo: "Hii ni onyo la hatari, hivyo inahitaji alama ya hisi." },
  { mark: "!", before: "Umenikumbusha jambo muhimu sana", after: "", maelezo: "Sentensi hii inaonyesha mshangao wa ghafla, hivyo inahitaji alama ya hisi." },
  { mark: "!", before: "Timu yetu imeshinda mechi ile muhimu", after: "", maelezo: "Sentensi hii inaonyesha furaha kubwa, hivyo inahitaji alama ya hisi." },
  { mark: "!", before: "Nyamaza, mwalimu anazungumza", after: "", maelezo: "Hii ni amri, hivyo inahitaji alama ya hisi kuonyesha msisitizo." },
  { mark: "!", before: "Sikutarajia kukuona hapa leo", after: "", maelezo: "Sentensi hii inaonyesha mshangao wa kufurahisha, hivyo inahitaji alama ya hisi." },
  { mark: "!", before: "Basi linaondoka sasa hivi, harakisha", after: "", maelezo: "Hii ni wito wa uharaka, hivyo inahitaji alama ya hisi." },
  // Ritifaa (') — kuachwa kwa irabu maneno yanapokutana kiirabu
  { mark: "'", before: "Juma n", after: "Amina walienda sokoni.", maelezo: "Neno 'na' limepoteza irabu 'a' kwa sababu neno linalofuata 'Amina' huanza na irabu; ritifaa huweka alama mahali herufi ilipoachwa." },
  { mark: "'", before: "Wanafunzi n", after: "Otieno walicheza mpira.", maelezo: "Neno 'na' limepoteza irabu 'a' kabla ya jina 'Otieno' linaloanza na irabu; ritifaa huonyesha mahali herufi ilipoachwa." },
  { mark: "'", before: "Zawadi ilitolewa kw", after: "Akinyi jana.", maelezo: "Neno 'kwa' limepoteza irabu 'a' kabla ya 'Akinyi' linaloanza na irabu; ritifaa huweka alama pale." },
  { mark: "'", before: "Barua ilipelekwa kw", after: "Auma asubuhi.", maelezo: "Neno 'kwa' limepoteza irabu yake ya mwisho kabla ya 'Auma' linaloanza na irabu." },
  { mark: "'", before: "Mwalimu n", after: "Odhiambo walipanga mpango.", maelezo: "Neno 'na' limepoteza irabu 'a' kabla ya 'Odhiambo' linaloanza na irabu." },
  { mark: "'", before: "Jambo l", after: "elimu ni muhimu sana.", maelezo: "Neno 'la' limepoteza irabu 'a' kabla ya 'elimu' linaloanza na irabu." },
  { mark: "'", before: "Nyumba ya wazazi w", after: "Akinyi iko karibu.", maelezo: "Neno 'wa' limepoteza irabu 'a' kabla ya 'Akinyi' linaloanza na irabu." },
  { mark: "'", before: "Timu y", after: "Uganda ilifika jana.", maelezo: "Neno 'ya' limepoteza irabu 'a' kabla ya 'Uganda' linaloanza na irabu." },
  { mark: "'", before: "Mwalimu n", after: "Achieng walisafiri Kisumu.", maelezo: "Neno 'na' limepoteza irabu 'a' kabla ya 'Achieng' linaloanza na irabu." },
  { mark: "'", before: "Chakula kilipelekwa kw", after: "Onyango shuleni.", maelezo: "Neno 'kwa' limepoteza irabu 'a' kabla ya 'Onyango' linaloanza na irabu." },
  // Koloni (:) — kutambulisha orodha au maelezo
  { mark: ":", before: "Nilinunua matunda haya sokoni", after: " machungwa, ndizi na maembe.", maelezo: "Koloni hutambulisha orodha ya matunda yanayofuata baada ya wazo kuu." },
  { mark: ":", before: "Vifaa vya shule ni hivi", after: " kalamu, daftari na rula.", maelezo: "Koloni hutambulisha orodha ya vifaa vinavyofuata." },
  { mark: ":", before: "Sababu ya kuchelewa kwake ni hii", after: " gari lake liliharibika njiani.", maelezo: "Koloni hutambulisha maelezo/sababu inayofuata baada ya wazo kuu." },
  { mark: ":", before: "Wanyama tuliowaona mbugani ni hawa", after: " simba, tembo na twiga.", maelezo: "Koloni hutambulisha orodha ya wanyama inayofuata." },
  { mark: ":", before: "Anataka vitu vitatu tu", after: " chakula, maji na usingizi.", maelezo: "Koloni hutambulisha orodha fupi ya mahitaji." },
  { mark: ":", before: "Mahitaji ya safari ni haya", after: " pesa, chakula na ramani.", maelezo: "Koloni hutambulisha orodha ya mahitaji ya safari." },
  { mark: ":", before: "Timu ilishinda kwa sababu moja", after: " mazoezi ya kutosha.", maelezo: "Koloni hutambulisha maelezo/sababu inayofuata." },
  { mark: ":", before: "Rangi za bendera ya Kenya ni hizi", after: " nyeusi, nyekundu, kijani na nyeupe.", maelezo: "Koloni hutambulisha orodha ya rangi inayofuata." },
  { mark: ":", before: "Kuna sababu kuu mbili za mafuriko", after: " mvua kubwa na mifereji iliyoziba.", maelezo: "Koloni hutambulisha maelezo ya sababu mbili zinazofuata." },
  { mark: ":", before: "Michezo ninayoipenda ni hii", after: " mpira wa miguu, riadha na kuogelea.", maelezo: "Koloni hutambulisha orodha ya michezo inayofuata." },
];

function fullSentence(item: PunctItem): string {
  return `${item.before}${item.mark}${item.after}`;
}

const OTHER_MARK_CHOICES: Mark[] = ["!", "'", ":"];

export const uakifishajiHisiRitifaaKoloni: Skill = {
  id: "g6-ksw-sarufi-uakifishaji-hisi-ritifaa-koloni",
  code: "SA.10",
  subjectId: "kiswahili",
  strandId: "g6-ksw-sarufi",
  grade: 6,
  title: "Uakifishaji: Alama ya Hisi, Ritifaa na Koloni",
  description: "Tambua na tumia ipasavyo alama ya hisi (!), ritifaa (') na koloni (:) katika sentensi mbalimbali.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["mc-recall", "click-match", "categorize", "fill-blank", "mc-scenario", "ordering"] as const
    );

    if (branch === "mc-recall") {
      const item = randChoice(rng, PUNCT_ITEMS);
      const wrongMarks = OTHER_MARK_CHOICES.filter((m) => m !== item.mark);
      const extra = randChoice(rng, [".", ","]);
      const choices = shuffle(rng, [item.mark, ...wrongMarks, extra]);
      return {
        kind: "multiple-choice",
        prompt: `Ni alama gani ya uakifishi inayokamilisha sentensi hii ipasavyo?\n"${item.before}___${item.after}"`,
        choices,
        correctIndex: choices.indexOf(item.mark),
        layout: "row",
        hint: MARK_INFO[item.mark].kanuni,
        explanation: `Alama sahihi ni "${item.mark}" (${MARK_INFO[item.mark].jina}) — ${item.maelezo}`,
      };
    }

    if (branch === "click-match") {
      const marks: Mark[] = ["!", "'", ":"];
      const tokens = shuffle(rng, marks.map((m) => ({ id: m, label: MARK_INFO[m].jina })));
      const targets = shuffle(rng, marks.map((m) => ({ id: m, label: cap(MARK_INFO[m].kanuni) })));
      const correctMap: Record<string, string> = {};
      for (const m of marks) correctMap[m] = m;
      return {
        kind: "click-match",
        prompt: "Oanisha kila alama ya uakifishi na kanuni yake sahihi ya matumizi.",
        tokens,
        targets,
        correctMap,
        hint: "Fikiria kama alama inaonyesha hisia kali, kuachwa kwa herufi, au utangulizi wa orodha/maelezo.",
        explanation: marks.map((m) => `${MARK_INFO[m].jina} — ${MARK_INFO[m].kanuni}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const marks: Mark[] = ["!", "'", ":"];
      const sample = marks.flatMap((m) => shuffle(rng, PUNCT_ITEMS.filter((it) => it.mark === m)).slice(0, 2));
      const items = shuffle(
        rng,
        sample.map((it, i) => ({ id: `${i}-${it.mark}`, label: fullSentence(it), bucket: MARK_INFO[it.mark].kategoria }))
      );
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga sentensi hizi kulingana na alama ya uakifishi inayotumika ndani yake.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "hisi", label: KATEGORIA_LABEL.hisi },
          { id: "ritifaa", label: KATEGORIA_LABEL.ritifaa },
          { id: "koloni", label: KATEGORIA_LABEL.koloni },
        ],
        correctBucket,
        hint: "Angalia alama iliyotumika: '!' ni hisi, ''' ni ritifaa, ':' ni koloni.",
        explanation: sample.map((it) => `"${fullSentence(it)}" hutumia ${MARK_INFO[it.mark].jina}.`).join(" "),
      };
    }

    if (branch === "fill-blank") {
      const item = randChoice(rng, PUNCT_ITEMS);
      return {
        kind: "fill-blank",
        prompt: "Weka alama sahihi ya uakifishi inayokosekana katika sentensi hii.",
        before: item.before,
        after: item.after,
        correctAnswer: item.mark,
        inputMode: "text",
        hint: MARK_INFO[item.mark].kanuni,
        explanation: `Sentensi kamili ni: "${fullSentence(item)}" — ${item.maelezo}`,
      };
    }

    if (branch === "mc-scenario") {
      const item = randChoice(rng, PUNCT_ITEMS);
      const wrongMark = randChoice(rng, OTHER_MARK_CHOICES.filter((m) => m !== item.mark));
      const thirdMark = OTHER_MARK_CHOICES.find((m) => m !== item.mark && m !== wrongMark)!;
      const wrongText = `${item.before}${wrongMark}${item.after}`;
      const correctChoice = `Kosa ni kutumia "${wrongMark}" badala ya "${item.mark}"; sentensi hii inahitaji ${MARK_INFO[item.mark].jina} kwa sababu ${item.maelezo.charAt(0).toLowerCase()}${item.maelezo.slice(1)}`;
      const distractor1 = `Kosa ni kutumia "${wrongMark}" badala ya "${thirdMark}"; sentensi hii inahitaji ${MARK_INFO[thirdMark].jina}.`;
      const distractor2 = `Hakuna kosa lolote katika sentensi hii; uakifishi wake ni sahihi kabisa.`;
      const distractor3 = `Kosa ni kutumia "${wrongMark}" mahali pasipofaa, lakini alama sahihi ni "${wrongMark}" yenyewe ikiwekwa mahali tofauti katika sentensi.`;
      const choices = shuffle(rng, [correctChoice, distractor1, distractor2, distractor3]);
      return {
        kind: "multiple-choice",
        prompt: `Mwanafunzi aliandika sentensi ifuatayo yenye kosa la uakifishi:\n"${wrongText}"\nNi nini kosa lililopo na alama gani sahihi inayopaswa kutumika?`,
        choices,
        correctIndex: choices.indexOf(correctChoice),
        layout: "list",
        hint: `Angalia kama sentensi inahitaji ${MARK_INFO[item.mark].jina.toLowerCase()} badala ya alama iliyotumika.`,
        explanation: `Sentensi sahihi ni: "${fullSentence(item)}" — ${item.maelezo}`,
      };
    }

    const item = randChoice(rng, PUNCT_ITEMS.filter((it) => it.mark !== "'"));
    const words = fullSentence(item)
      .replace(/[.,]/g, "")
      .split(" ")
      .filter(Boolean);
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi sahihi yenye alama ifaayo ya uakifishi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Sentensi hii inahitaji ${MARK_INFO[item.mark].jina.toLowerCase()}.`,
      explanation: `Sentensi sahihi ni: "${fullSentence(item)}"`,
    };
  },
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
