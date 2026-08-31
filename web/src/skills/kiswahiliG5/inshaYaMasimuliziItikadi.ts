import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt, jina } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada ya Kuandika, mada ndogo "Insha ya Masimulizi (Kudhibiti Itikadi za
// Kidini na za Kijamii)" — mifano ya mada (verbatim): itikadi za kidini na za kijamii, sherehe, hadithi,
// ndoto, ndoa za lazima (zinazoshughulikiwa kwa mtazamo wa kuheshimu haki za watoto). Pia: kuzingatia aina
// mbalimbali za maneno, mnyambuliko wa vitenzi, na nyakati kujenga picha dhahiri. Mifano imeandikwa kwa
// mtazamo wenye heshima na unaofaa umri. Ona curriculum-reference/grade-5/kiswahili.json.

type Mada = "sherehe" | "hadithi" | "ndoto" | "desturi";

const MADA_JINA: Record<Mada, string> = {
  sherehe: "Sherehe",
  hadithi: "Hadithi",
  ndoto: "Ndoto",
  desturi: "Desturi/Itikadi za Kijamii",
};

const VIFUNGU: { sentensi: string; mada: Mada }[] = [
  { sentensi: "Kijiji kizima kilikusanyika kwa sherehe ya kuvuna mahindi mwezi wa Julai.", mada: "sherehe" },
  { sentensi: "Wanakijiji walicheza ngoma za kimila wakati wa sherehe ya harusi.", mada: "sherehe" },
  { sentensi: "Watoto walivalia mavazi ya kitamaduni kwa sherehe ya jamii.", mada: "sherehe" },
  { sentensi: "Familia zilikusanyika pamoja kwa karamu ya sherehe ya kuzaliwa kwa mtoto.", mada: "sherehe" },
  { sentensi: "Babu alisimulia hadithi ya sungura mjanja aliyemshinda fisi kwa akili.", mada: "hadithi" },
  { sentensi: "Hadithi ya chura na tembo ilifunza somo la kutokiukana wengine.", mada: "hadithi" },
  { sentensi: "Bibi alisimulia hadithi za jadi kuhusu jinsi jua na mwezi vilivyoumbwa.", mada: "hadithi" },
  { sentensi: "Hadithi hiyo ilikuwa na wahusika wa wanyama waliozungumza kama binadamu.", mada: "hadithi" },
  { sentensi: "Usiku huo, Chiku aliota ndoto ya kuwa daktari mkubwa jijini.", mada: "ndoto" },
  { sentensi: "Katika ndoto yake, Daudi aliona akifaulu mtihani kwa alama za juu.", mada: "ndoto" },
  { sentensi: "Amina aliamka akitokwa jasho baada ya ndoto ya kutisha.", mada: "ndoto" },
  { sentensi: "Ndoto yake ilimtia moyo aendelee kusoma kwa bidii.", mada: "ndoto" },
  { sentensi: "Wazee wa kijiji walijadili umuhimu wa kuwaacha wasichana wasome badala ya kuwaozesha wakiwa wadogo.", mada: "desturi" },
  { sentensi: "Kiongozi wa jamii alieleza kuwa desturi za zamani zinapaswa kubadilika ili kulinda haki za watoto.", mada: "desturi" },
  { sentensi: "Baraza la vijana lilijadili jinsi ya kuheshimu tamaduni bila kuathiri haki za wasichana.", mada: "desturi" },
  { sentensi: "Mwalimu alieleza wanafunzi kuhusu umuhimu wa kuheshimu itikadi za watu wengine bila ubaguzi.", mada: "desturi" },
];

type Mbinu = "mnyambuliko-wa-vitenzi" | "nyakati" | "aina-za-maneno";

const MBINU_JINA: Record<Mbinu, string> = {
  "mnyambuliko-wa-vitenzi": "Mnyambuliko wa Vitenzi",
  nyakati: "Nyakati",
  "aina-za-maneno": "Aina za Maneno",
};

const MBINU_MFANO: { mbinu: Mbinu; maelezo: string }[] = [
  { mbinu: "mnyambuliko-wa-vitenzi", maelezo: "kubadilisha umbo la kitenzi, k.m. 'soma' huwa 'somesha' (kufanya asome) au 'somewa' (kusomewa)" },
  { mbinu: "mnyambuliko-wa-vitenzi", maelezo: "kubadilisha umbo la kitenzi, k.m. 'pika' huwa 'pikiana' (kupikiana) au 'pikwa' (kupikwa)" },
  { mbinu: "nyakati", maelezo: "kutumia 'aliota' (uliopita) dhidi ya 'anaota' (uliopo) kuonyesha wakati tofauti" },
  { mbinu: "nyakati", maelezo: "kutumia 'atasoma' (ujao) kuonyesha tukio litakalotokea baadaye" },
  { mbinu: "aina-za-maneno", maelezo: "kutumia kivumishi 'mrefu' pamoja na nomino 'mti' kuongeza taswira" },
  { mbinu: "aina-za-maneno", maelezo: "kutumia kielezi 'haraka' kuonyesha jinsi tendo lilivyofanyika" },
];

type Wakati = "uliopita" | "uliopo" | "ujao";

const WAKATI_JINA: Record<Wakati, string> = { uliopita: "Wakati Uliopita", uliopo: "Wakati Uliopo", ujao: "Wakati Ujao" };

const SENTENSI_NYAKATI: { sentensi: string; wakati: Wakati }[] = [
  { sentensi: "Babu alisimulia hadithi ya sungura jana usiku.", wakati: "uliopita" },
  { sentensi: "Wanakijiji walicheza ngoma wakati wa sherehe.", wakati: "uliopita" },
  { sentensi: "Chiku aliota ndoto ya kuwa daktari.", wakati: "uliopita" },
  { sentensi: "Wazee walijadili kuhusu haki za watoto kijijini.", wakati: "uliopita" },
  { sentensi: "Mwalimu alieleza wanafunzi kuhusu heshima ya tamaduni.", wakati: "uliopita" },
  { sentensi: "Babu anasimulia hadithi ya sungura sasa hivi.", wakati: "uliopo" },
  { sentensi: "Wanakijiji wanacheza ngoma wakati wa sherehe.", wakati: "uliopo" },
  { sentensi: "Chiku anaota ndoto ya kuwa daktari.", wakati: "uliopo" },
  { sentensi: "Wazee wanajadili kuhusu haki za watoto kijijini.", wakati: "uliopo" },
  { sentensi: "Mwalimu anaeleza wanafunzi kuhusu heshima ya tamaduni.", wakati: "uliopo" },
  { sentensi: "Babu atasimulia hadithi ya sungura kesho usiku.", wakati: "ujao" },
  { sentensi: "Wanakijiji watacheza ngoma wakati wa sherehe ijayo.", wakati: "ujao" },
  { sentensi: "Chiku ataota ndoto ya kuwa daktari.", wakati: "ujao" },
  { sentensi: "Wazee watajadili kuhusu haki za watoto kijijini wiki ijayo.", wakati: "ujao" },
  { sentensi: "Mwalimu ataeleza wanafunzi kuhusu heshima ya tamaduni kesho.", wakati: "ujao" },
];

const MFUATANO: { id: string; label: string }[] = [
  { id: "1", label: "Wazee wa kijiji walikutana kujadili desturi za jamii yao." },
  { id: "2", label: "Mmoja wao alieleza kuwa kuwaozesha wasichana wakiwa wadogo kunawanyima nafasi ya kusoma." },
  { id: "3", label: "Baada ya majadiliano marefu, wazee walikubaliana kuunga mkono elimu ya wasichana." },
  { id: "4", label: "Tangu siku hiyo, wasichana wengi wa kijiji hicho waliendelea na masomo yao." },
];

export const inshaYaMasimuliziItikadi: Skill = {
  id: "g5-ksw-ka-insha-ya-masimulizi-itikadi",
  code: "KA.10",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ka",
  grade: 5,
  title: "Insha ya Masimulizi (Kudhibiti Itikadi za Kidini na za Kijamii)",
  description: "Tambua insha ya masimulizi kuhusu itikadi za kijamii kwa muundo, kisha uandike kwa kanuni zifaazo.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-mada", "oanisha-mbinu", "panga-wakati", "jaza-wakati", "panga-mfuatano"] as const);

    if (branch === "tambua-mada") {
      const v = randChoice(rng, VIFUNGU);
      const wote: Mada[] = ["sherehe", "hadithi", "ndoto", "desturi"];
      const choices = shuffle(rng, wote);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "aina ya mada inayolingana na kifungu hiki")} "${v.sentensi}"`,
        choices: choices.map((c) => MADA_JINA[c]),
        correctIndex: choices.indexOf(v.mada),
        layout: "row",
        hint: "Fikiria iwapo kifungu kinahusu tukio la kufurahisha, hadithi ya jadi, ndoto, au desturi za jamii.",
        explanation: `Kifungu hiki kinahusiana na mada ya ${MADA_JINA[v.mada]}.`,
      };
    }

    if (branch === "oanisha-mbinu") {
      const wote: Mbinu[] = ["mnyambuliko-wa-vitenzi", "nyakati", "aina-za-maneno"];
      const chosenPairs = wote.map((m) => randChoice(rng, MBINU_MFANO.filter((x) => x.mbinu === m)));
      const tokens = wote.map((m) => ({ id: m, label: MBINU_JINA[m] }));
      const targets = shuffle(rng, chosenPairs).map((p) => ({ id: p.mbinu, label: p.maelezo }));
      const correctMap: Record<string, string> = {};
      for (const m of wote) correctMap[m] = m;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "mbinu ya kiuandishi na mfano wa jinsi inavyojenga picha dhahiri katika kisa"),
        tokens,
        targets,
        correctMap,
        hint: "Fikiria mnyambuliko wa vitenzi, nyakati, na aina za maneno.",
        explanation: chosenPairs.map((p) => `${MBINU_JINA[p.mbinu]}: ${p.maelezo}.`).join(" "),
      };
    }

    if (branch === "panga-wakati") {
      const chosen = shuffle(rng, SENTENSI_NYAKATI).slice(0, 6);
      const items = chosen.map((s, i) => ({ id: `${i}-${s.sentensi}`, label: s.sentensi, bucket: s.wakati }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "wakati wa kitenzi (uliopita, uliopo au ujao) unaotumika katika sentensi hii"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "uliopita", label: WAKATI_JINA.uliopita },
          { id: "uliopo", label: WAKATI_JINA.uliopo },
          { id: "ujao", label: WAKATI_JINA.ujao },
        ],
        correctBucket,
        hint: "Tazama kiambishi cha wakati katika kitenzi: -li- (uliopita), -na- (uliopo), -ta- (ujao).",
        explanation: chosen.map((s) => `"${s.sentensi}" iko katika ${WAKATI_JINA[s.wakati]}.`).join(" "),
      };
    }

    if (branch === "jaza-wakati") {
      const j = jina(rng);
      const TEMPLATES = [
        { before: `Jana, babu "`, after: `" hadithi ya sungura mjanja.`, jibu: "alisimulia" },
        { before: `Sasa hivi, mwalimu "`, after: `" wanafunzi kuhusu heshima ya tamaduni.`, jibu: "anaeleza" },
        { before: `Kesho, wazee "`, after: `" kuhusu haki za watoto kijijini.`, jibu: "watajadili" },
        { before: `Usiku uliopita, ${j} "`, after: `" ndoto ya kufaulu mtihani.`, jibu: "aliota" },
        { before: `Wiki ijayo, wanakijiji "`, after: `" sherehe ya kuvuna.`, jibu: "watafanya" },
      ];
      const t = randChoice(rng, TEMPLATES);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.jibu,
        inputMode: "text",
        hint: "Tumia kiambishi sahihi cha wakati: -li- (uliopita), -na- (uliopo), -ta- (ujao).",
        explanation: `Sentensi kamili: "${t.before}${t.jibu}${t.after}"`,
      };
    }

    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "sentensi za kisa cha kijiji kinachojadili desturi na elimu ya wasichana"),
      instruction: "Bofya sentensi kwa mpangilio sahihi wa kisa.",
      items: shuffle(rng, MFUATANO),
      correctOrder: MFUATANO.map((m) => m.id),
      hint: "Fikiria mfuatano wa mazungumzo: mkutano, hoja, uamuzi, na matokeo.",
      explanation: "Mpangilio sahihi: " + MFUATANO.map((m) => m.label).join(" → "),
    };
  },
};
