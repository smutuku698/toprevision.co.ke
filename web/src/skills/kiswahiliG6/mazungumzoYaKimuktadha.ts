import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Rejista = "rasmi" | "isiyo rasmi";
type MuktadhaId = "ofisini" | "hospitalini" | "shuleni" | "ibada" | "nyumbani" | "sokoni";

const UTTERANCES: { matamshi: string; rejista: Rejista; muktadha: MuktadhaId }[] = [
  { matamshi: "Habari za asubuhi, daktari? Ningependa kuzungumza kuhusu hali yangu ya kiafya.", rejista: "rasmi", muktadha: "hospitalini" },
  { matamshi: "Samahani kwa kukuchelewesha; tafadhali naomba ratiba ya mkutano wa leo.", rejista: "rasmi", muktadha: "ofisini" },
  { matamshi: "Ningependa kuomba ruhusa ya kuondoka mapema kutokana na jambo la dharura.", rejista: "rasmi", muktadha: "ofisini" },
  { matamshi: "Mwalimu mkuu, tunaomba mwongozo wako kuhusu shughuli ya wiki ijayo.", rejista: "rasmi", muktadha: "shuleni" },
  { matamshi: "Karibuni sana katika ibada yetu ya leo; tutaanza kwa sala fupi.", rejista: "rasmi", muktadha: "ibada" },
  { matamshi: "Naomba unieleze bei ya bidhaa hii kabla sijanunua, tafadhali.", rejista: "rasmi", muktadha: "sokoni" },
  { matamshi: "Nashukuru kwa muda wako, daktari; naomba maelezo zaidi kuhusu dawa hii.", rejista: "rasmi", muktadha: "hospitalini" },
  { matamshi: "Tafadhali, ningependa tuzungumze faraghani kuhusu hisia zangu za wasiwasi.", rejista: "rasmi", muktadha: "shuleni" },
  { matamshi: "Ningeomba ushauri wako kama mshauri wa afya ya akili kuhusu msongo ninaopitia.", rejista: "rasmi", muktadha: "shuleni" },
  { matamshi: "Mkurugenzi, ningependa kujadili suala hili kwa njia rasmi zaidi.", rejista: "rasmi", muktadha: "ofisini" },
  { matamshi: "Naomba radhi kwa kuchelewa; gari nililokuwa nikitegemea lilikawia njiani.", rejista: "rasmi", muktadha: "shuleni" },
  { matamshi: "Tunakushukuru kwa mchango wako mkubwa katika sherehe ya leo.", rejista: "rasmi", muktadha: "ibada" },
  { matamshi: "Ningependa kufahamu ratiba ya saa za wageni kuwatembelea wagonjwa.", rejista: "rasmi", muktadha: "hospitalini" },
  { matamshi: "Tafadhali nieleze kwa kina dalili unazopitia ili nikusaidie ipasavyo.", rejista: "rasmi", muktadha: "hospitalini" },
  { matamshi: "Niaje kaka, umeamkaje leo?", rejista: "isiyo rasmi", muktadha: "nyumbani" },
  { matamshi: "Sasa buda, mambo si poa leo?", rejista: "isiyo rasmi", muktadha: "sokoni" },
  { matamshi: "Mambo vipi, umeshafika shuleni?", rejista: "isiyo rasmi", muktadha: "shuleni" },
  { matamshi: "Hebu njoo hapa nikuulize kitu.", rejista: "isiyo rasmi", muktadha: "nyumbani" },
  { matamshi: "Kwani leo mbona uko na huzuni sana, kuna nini?", rejista: "isiyo rasmi", muktadha: "nyumbani" },
  { matamshi: "Wewe, bei ya nyanya hizi ni ngapi?", rejista: "isiyo rasmi", muktadha: "sokoni" },
  { matamshi: "Achana na hayo, tuongee tu poa poa.", rejista: "isiyo rasmi", muktadha: "nyumbani" },
  { matamshi: "Umenidanganya wewe, sitaki tena!", rejista: "isiyo rasmi", muktadha: "nyumbani" },
  { matamshi: "Msee, leo tumechelewa mob, twende haraka!", rejista: "isiyo rasmi", muktadha: "shuleni" },
  { matamshi: "Bro, nasikia una msongo, tuongee tu.", rejista: "isiyo rasmi", muktadha: "nyumbani" },
  { matamshi: "Aki leo nimechoka sana, sitaki kufanya kitu.", rejista: "isiyo rasmi", muktadha: "nyumbani" },
  { matamshi: "Vipi rafiki, uko poa?", rejista: "isiyo rasmi", muktadha: "sokoni" },
  { matamshi: "Twende tukanunue mandazi haraka kabla soko halijafungwa.", rejista: "isiyo rasmi", muktadha: "sokoni" },
  { matamshi: "Mbona hujaniambia ulikuwa na huzuni, tungezungumza.", rejista: "isiyo rasmi", muktadha: "nyumbani" },
  { matamshi: "Si uje tu nyumbani jioni tuzungumze poa?", rejista: "isiyo rasmi", muktadha: "nyumbani" },
  { matamshi: "Wacha ufala, twende tu shuleni sasa.", rejista: "isiyo rasmi", muktadha: "shuleni" },
  { matamshi: "Eh bwana, hii dawa inauzwa ngapi?", rejista: "isiyo rasmi", muktadha: "hospitalini" },
  { matamshi: "Poa sana, tutaonana kesho kanisani.", rejista: "isiyo rasmi", muktadha: "ibada" },
];

const CONTEXTS: { id: MuktadhaId; label: string; maelezo: string }[] = [
  { id: "ofisini", label: "Ofisini", maelezo: "Rasmi — kwa mfano: \"Ningependa kuomba ruhusa ya kuondoka mapema.\"" },
  { id: "hospitalini", label: "Hospitalini", maelezo: "Rasmi — kwa mfano: \"Daktari, naomba maelezo zaidi kuhusu dawa hii.\"" },
  { id: "shuleni", label: "Shuleni (darasani)", maelezo: "Rasmi — kwa mfano: \"Mwalimu, naomba kuuliza swali.\"" },
  { id: "ibada", label: "Mahali pa Ibada", maelezo: "Rasmi — kwa mfano: \"Karibuni sana katika ibada ya leo.\"" },
  { id: "nyumbani", label: "Nyumbani", maelezo: "Isiyo Rasmi — kwa mfano: \"Niaje kaka, umeamkaje?\"" },
  { id: "sokoni", label: "Sokoni / Mtaani", maelezo: "Isiyo Rasmi — kwa mfano: \"Mambo vipi, bei ni ngapi?\"" },
];

const FILL_MAZUNGUMZO: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "Wakiwa ofisini, karani alimwambia mteja kwa heshima: '", after: ", tafadhali keti hapa nitakusaidia baada ya dakika chache.'", correctAnswer: "Samahani", acceptedAnswers: ["samahani", "Naomba radhi"] },
  { before: "Nyumbani, Baraka alimwambia kaka yake kwa lugha ya kawaida: '", after: ", nipe hiyo remote basi!'", correctAnswer: "Sasa", acceptedAnswers: ["Aki", "Bro"] },
  { before: "Daktari alimuuliza mgonjwa kwa lugha rasmi: 'Naomba", after: "kuhusu dalili unazohisi tangu jana.'", correctAnswer: "unieleze" },
  { before: "Sokoni, mteja alimwambia mchuuzi kwa lugha ya kawaida: '", after: ", punguza bei kidogo tu!'", correctAnswer: "Wewe", acceptedAnswers: ["Bwana", "Mambo"] },
  { before: "Mwanafunzi alimuuliza mwalimu mkuu kwa heshima: '", after: " ruhusa ya kutoka mapema leo?'", correctAnswer: "Ningeomba", acceptedAnswers: ["Naomba"] },
  { before: "Kanisani, kiongozi wa ibada aliwakaribisha waumini kwa heshima: '", after: " wote katika ibada ya leo.'", correctAnswer: "Karibuni", acceptedAnswers: ["Karibuni sana"] },
  { before: "Mtaani, rafiki mmoja alimwuliza mwenzake: '", after: ", umeamkaje leo?'", correctAnswer: "Niaje", acceptedAnswers: ["Vipi", "Mambo"] },
  { before: "Hospitalini, muuguzi alimweleza mgonjwa kwa heshima: '", after: " kunywa dawa hii mara tatu kwa siku.'", correctAnswer: "Tafadhali" },
  { before: "Nyumbani, kijana alimwomba dada yake kwa lugha ya kawaida: '", after: " unipe hiyo simu kidogo?'", correctAnswer: "Aki", acceptedAnswers: ["Sasa", "Bro"] },
  { before: "Ofisini kuu, mfanyakazi mpya alijitambulisha kwa meneja kwa heshima: 'Habari, mimi ni Chebet.", after: "kufahamiana nawe rasmi.'", correctAnswer: "Ningependa", acceptedAnswers: ["Ningefurahi"] },
  { before: "Sokoni, muuzaji alimwambia rafiki yake mteja kwa lugha ya kawaida: '", after: " leo umepitiaje, uko poa?'", correctAnswer: "Sasa", acceptedAnswers: ["Mambo", "Vipi"] },
  { before: "Kanisani, mwalimu wa shule ya jumapili aliwauliza watoto kwa heshima: '", after: " mtoto yeyote anataka kuuliza swali?'", correctAnswer: "Je", acceptedAnswers: ["Je,"] },
  { before: "Mshauri wa afya ya akili alimwambia mwanafunzi kwa heshima: '", after: " kunieleza zaidi kuhusu hisia zako za wasiwasi?'", correctAnswer: "Ungependa", acceptedAnswers: ["Je ungependa"] },
  { before: "Rafiki mmoja alimwambia mwenzake kwa lugha ya kawaida: '", after: ", nasikia huna raha, tuongee tu.'", correctAnswer: "Bro", acceptedAnswers: ["Aki", "Msee"] },
];

const HATUA_MAZUNGUMZO_RASMI: { id: string; label: string }[] = [
  { id: "salamu", label: "Salamu — kutoa maamkuzi rasmi mwanzoni" },
  { id: "kujitambulisha", label: "Kujitambulisha — kutaja jina na wadhifa wako" },
  { id: "kusudi", label: "Kueleza kusudi — kusema sababu ya mazungumzo" },
  { id: "kuomba", label: "Kuomba — kutoa ombi au swali lako kwa heshima" },
  { id: "kushukuru", label: "Kushukuru — kumshukuru mzungumzaji mwenzako" },
  { id: "kuaga", label: "Kuaga — kutoa maagano ya heshima mwishoni" },
];

export const mazungumzoYaKimuktadha: Skill = {
  id: "g6-ksw-kz-mazungumzo-ya-kimuktadha",
  code: "KZ.8",
  subjectId: "kiswahili",
  strandId: "g6-ksw-kz",
  grade: 6,
  title: "Mazungumzo ya Kimuktadha: Rasmi na Isiyo Rasmi",
  description: "Tambua na utumie lugha rasmi na isiyo rasmi ipasavyo kulingana na muktadha kama ofisini, hospitalini, shuleni, nyumbani, sokoni, na mahali pa ibada.",
  generate(rng) {
    const branch = randChoice(rng, ["rejista-au-muktadha", "panga-rejista", "oanisha-muktadha", "kamilisha-mazungumzo", "hatua-mazungumzo"] as const);

    if (branch === "rejista-au-muktadha") {
      const useRejista = rng() < 0.5;
      const entry = randChoice(rng, UTTERANCES);
      if (useRejista) {
        const choices = shuffle(rng, ["Rasmi", "Isiyo Rasmi"]);
        const correct = entry.rejista === "rasmi" ? "Rasmi" : "Isiyo Rasmi";
        return {
          kind: "multiple-choice",
          prompt: `Kauli ifuatayo ni ya rejista gani? "${entry.matamshi}"`,
          choices,
          correctIndex: choices.indexOf(correct),
          layout: "row",
          hint: "Zingatia maneno ya heshima kama 'tafadhali' na 'naomba' dhidi ya lugha ya kawaida kama 'sasa' au 'aki'.",
          explanation: `Kauli hii ni ya rejista ${correct === "Rasmi" ? "rasmi, kwa sababu inatumia lugha ya heshima na maombi ya wazi" : "isiyo rasmi, kwa sababu inatumia lugha ya kawaida ya kirafiki"}.`,
        };
      }
      const context = CONTEXTS.find((c) => c.id === entry.muktadha)!;
      const distractors = shuffle(rng, CONTEXTS.filter((c) => c.id !== context.id)).slice(0, 3);
      const choices = shuffle(rng, [context.label, ...distractors.map((c) => c.label)]);
      return {
        kind: "multiple-choice",
        prompt: `Kauli hii inafaa zaidi kutumika wapi? "${entry.matamshi}"`,
        choices,
        correctIndex: choices.indexOf(context.label),
        layout: "list",
        hint: "Fikiria ni mahali gani lugha kama hii huwa ya kawaida kutumika.",
        explanation: `Kauli hii inafaa zaidi ${context.label}, kwa sababu inaonyesha rejista ya ${entry.rejista} inayotumika mahali hapo.`,
      };
    }

    if (branch === "panga-rejista") {
      const rasmi = shuffle(rng, UTTERANCES.filter((u) => u.rejista === "rasmi")).slice(0, 3);
      const isiyoRasmi = shuffle(rng, UTTERANCES.filter((u) => u.rejista === "isiyo rasmi")).slice(0, 3);
      const items = shuffle(rng, [
        ...rasmi.map((u) => ({ id: u.matamshi, label: u.matamshi, bucket: "Rasmi" })),
        ...isiyoRasmi.map((u) => ({ id: u.matamshi, label: u.matamshi, bucket: "Isiyo Rasmi" })),
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila kauli katika kundi la Rasmi au Isiyo Rasmi.",
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Rasmi", label: "Rasmi" },
          { id: "Isiyo Rasmi", label: "Isiyo Rasmi" },
        ],
        correctBucket,
        hint: "Lugha rasmi hutumia heshima na maombi ya wazi; lugha isiyo rasmi hutumia msamiati wa kawaida wa kirafiki.",
        explanation: `Rasmi: ${rasmi.map((u) => `"${u.matamshi}"`).join(", ")}. Isiyo Rasmi: ${isiyoRasmi.map((u) => `"${u.matamshi}"`).join(", ")}.`,
      };
    }

    if (branch === "oanisha-muktadha") {
      const tokens = shuffle(rng, CONTEXTS.map((c) => ({ id: c.id, label: c.label })));
      const targets = shuffle(rng, CONTEXTS.map((c) => ({ id: c.id, label: c.maelezo })));
      const correctMap: Record<string, string> = {};
      for (const c of CONTEXTS) correctMap[c.id] = c.id;
      return {
        kind: "click-match",
        prompt: "Oanisha kila muktadha na rejista inayofaa kutumika mahali hapo.",
        tokens,
        targets,
        correctMap,
        hint: "Mazingira kama ofisi, hospitali, shule, na mahali pa ibada huhitaji lugha rasmi; nyumbani na sokoni na marafiki huruhusu lugha ya kawaida.",
        explanation: CONTEXTS.map((c) => `${c.label}: ${c.maelezo}`).join(" "),
      };
    }

    if (branch === "kamilisha-mazungumzo") {
      const entry = randChoice(rng, FILL_MAZUNGUMZO);
      return {
        kind: "fill-blank",
        prompt: "Kamilisha mazungumzo kwa neno linalofaa muktadha huu.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.correctAnswer,
        acceptedAnswers: entry.acceptedAnswers,
        inputMode: "text",
        hint: "Zingatia kama mazungumzo haya ni rasmi (heshima) au si rasmi (kirafiki) kutokana na muktadha ulioelezwa.",
        explanation: `Neno linalofaa hapa ni "${entry.correctAnswer}" kutokana na muktadha na rejista ya mazungumzo haya.`,
      };
    }

    const items = shuffle(rng, HATUA_MAZUNGUMZO_RASMI);
    return {
      kind: "ordering",
      prompt: "Panga hatua za mazungumzo rasmi kwa mpangilio unaofaa.",
      instruction: "Bofya kwa mpangilio sahihi kuanzia mwanzo hadi mwisho.",
      items,
      correctOrder: HATUA_MAZUNGUMZO_RASMI.map((h) => h.id),
      hint: "Mazungumzo rasmi huanza kwa salamu na kuishia kwa kuaga kwa heshima.",
      explanation: HATUA_MAZUNGUMZO_RASMI.map((h) => h.label).join(" → "),
    };
  },
};
