import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.0 Magonjwa, mada ndogo 1.9 Mazungumzo ya Kimuktadha — Lugha Rasmi:
// miktadha rasmi ya ofisini, hospitalini, mahakamani, bungeni, pamoja na miktadha mingine rasmi
// inayoendana na muktadha wa somo. Ona curriculum-reference/grade-5/kiswahili.json.

const MIKTADHA: { muktadha: string; rasmi: string; isiyoRasmi: string; funguo: string }[] = [
  { muktadha: "ofisini", rasmi: "Karibu ofisini, tafadhali keti na tusubiri meneja.", isiyoRasmi: "Karibu, kaa tu hapo.", funguo: "meneja" },
  { muktadha: "hospitalini", rasmi: "Mgonjwa atapimwa na daktari kabla ya matibabu kuanza.", isiyoRasmi: "Daktari atakuangalia sasa hivi.", funguo: "daktari" },
  { muktadha: "mahakamani", rasmi: "Mahakama hii imeamua kesi hii kwa mujibu wa sheria.", isiyoRasmi: "Hukumu imetoka, umeshinda.", funguo: "sheria" },
  { muktadha: "bungeni", rasmi: "Waheshimiwa wabunge, tunaanza kikao chetu cha leo.", isiyoRasmi: "Tuanze mkutano wetu.", funguo: "wabunge" },
  { muktadha: "shuleni", rasmi: "Wanafunzi wote wanaombwa kuketi kimya kwa ajili ya mkutano wa shule.", isiyoRasmi: "Kaeni tu, tuzungumze kidogo.", funguo: "mkutano" },
  { muktadha: "kanisani", rasmi: "Waumini wote wanakaribishwa kusimama kwa wimbo wa ufunguzi.", isiyoRasmi: "Simameni tuimbe.", funguo: "waumini" },
  { muktadha: "msikitini", rasmi: "Waumini wanaalikwa kutulia kwa ajili ya swala.", isiyoRasmi: "Tulieni tu, tuswali.", funguo: "swala" },
  { muktadha: "sherehe za kitaifa", rasmi: "Wageni waalikwa wanaombwa kuchukua nafasi zao kabla ya sherehe kuanza.", isiyoRasmi: "Kaeni popote, tunaanza sasa.", funguo: "wageni" },
  { muktadha: "kituo cha polisi", rasmi: "Ripoti yako itashughulikiwa na afisa atakayekuhoji.", isiyoRasmi: "Mwambie afisa kilichotokea.", funguo: "ripoti" },
];

const MAZUNGUMZO_HOSPITALINI = [
  { id: "1", label: "Mgonjwa: Habari, ningependa kuonana na daktari." },
  { id: "2", label: "Muuguzi: Karibu, jaza fomu hii kwanza." },
  { id: "3", label: "Mgonjwa: Sawa, ninajaza sasa." },
  { id: "4", label: "Muuguzi: Asante, subiri jina lako litaitwa." },
  { id: "5", label: "Daktari: Karibu ndani, tuanze uchunguzi." },
];

export const mazungumzoKimuktadhaLughaRasmi: Skill = {
  id: "g5-ksw-kz-mazungumzo-kimuktadha-lugha-rasmi",
  code: "KZ.9",
  subjectId: "kiswahili",
  strandId: "g5-ksw-kz",
  grade: 5,
  title: "Mazungumzo ya Kimuktadha — Lugha Rasmi (Magonjwa)",
  description: "Tambua na utumie lugha rasmi katika miktadha mbalimbali kama ofisini, hospitalini, mahakamani na bungeni.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-muktadha", "oanisha-muktadha", "panga-usajili", "jaza-rasmi", "panga-mazungumzo"] as const);

    if (branch === "tambua-muktadha") {
      const m = randChoice(rng, MIKTADHA);
      const makosa = shuffle(rng, MIKTADHA.filter((x) => x.muktadha !== m.muktadha)).slice(0, 3).map((x) => x.muktadha);
      const choices = shuffle(rng, [m.muktadha, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "muktadha rasmi unaoendana na sentensi hii")} "${m.rasmi}"`,
        choices,
        correctIndex: choices.indexOf(m.muktadha),
        layout: "row",
        hint: "Fikiria ni wapi maneno haya ya heshima hutumika kwa kawaida.",
        explanation: `Sentensi "${m.rasmi}" hutumika ${m.muktadha}.`,
      };
    }

    if (branch === "oanisha-muktadha") {
      const chosen = shuffle(rng, MIKTADHA).slice(0, 6);
      const tokens = chosen.map((m, i) => ({ id: `${i}`, label: m.rasmi }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: `${chosen.indexOf(m)}`, label: m.muktadha }));
      const correctMap: Record<string, string> = {};
      chosen.forEach((_m, i) => (correctMap[`${i}`] = `${i}`));
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "usemi rasmi na muktadha unaoufaa"),
        tokens,
        targets,
        correctMap,
        hint: "Kila usemi rasmi hutumika mahali maalum.",
        explanation: chosen.map((m) => `"${m.rasmi}" hutumika ${m.muktadha}.`).join(" "),
      };
    }

    if (branch === "panga-usajili") {
      const vikundiMuktadha = shuffle(rng, MIKTADHA).slice(0, 4);
      const items = vikundiMuktadha.flatMap((m) => [
        { id: `r-${m.muktadha}`, label: m.rasmi, bucket: "rasmi" },
        { id: `k-${m.muktadha}`, label: m.isiyoRasmi, bucket: "kawaida" },
      ]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo sentensi imetumia lugha rasmi au lugha ya kawaida"),
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "rasmi", label: "Lugha Rasmi" },
          { id: "kawaida", label: "Lugha ya Kawaida" },
        ],
        correctBucket,
        hint: "Lugha rasmi hutumia maneno ya heshima na muundo sahihi zaidi wa sentensi.",
        explanation: "Kila sentensi imewekwa kulingana na iwapo ni ya lugha rasmi au lugha ya kawaida.",
      };
    }

    if (branch === "jaza-rasmi") {
      const m = randChoice(rng, MIKTADHA);
      const idx = m.rasmi.toLowerCase().indexOf(m.funguo.toLowerCase());
      const before = idx >= 0 ? m.rasmi.slice(0, idx) : m.rasmi;
      const after = idx >= 0 ? m.rasmi.slice(idx + m.funguo.length) : "";
      return {
        kind: "fill-blank",
        prompt: `${kamilishaPrompt(rng)} Muktadha: ${m.muktadha}.`,
        before,
        after,
        correctAnswer: m.funguo,
        inputMode: "text",
        hint: `Fikiria neno muhimu linalotumika ${m.muktadha}.`,
        explanation: `Sentensi kamili: "${m.rasmi}"`,
      };
    }

    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "mazungumzo haya ya hospitalini kwa lugha rasmi"),
      instruction: "Bofya sentensi kwa mpangilio sahihi.",
      items: shuffle(rng, MAZUNGUMZO_HOSPITALINI),
      correctOrder: MAZUNGUMZO_HOSPITALINI.map((h) => h.id),
      hint: "Fikiria hatua za kawaida za mgonjwa anapofika hospitalini.",
      explanation: "Mpangilio sahihi: " + MAZUNGUMZO_HOSPITALINI.map((h) => h.label).join(" → "),
    };
  },
};
