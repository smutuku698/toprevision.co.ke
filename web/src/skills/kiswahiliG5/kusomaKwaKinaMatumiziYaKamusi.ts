import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.2 Kusoma kwa Kina — Matumizi ya Kamusi (Huduma ya Kwanza). Mpangilio
// wa maneno kialfabeti kwenye kamusi + msamiati wa huduma ya kwanza. Ona curriculum-reference/grade-5/kiswahili.json.

const HUDUMA: { neno: string; maana: string }[] = [
  { neno: "bendeji", maana: "kitambaa cha kufunga jeraha ili kuzuia damu na uchafu" },
  { neno: "dawa", maana: "kitu kinachotumiwa kutibu au kupunguza maumivu" },
  { neno: "huduma", maana: "msaada unaotolewa kwa mtu mwenye uhitaji" },
  { neno: "jeraha", maana: "sehemu ya mwili iliyokatika au kuumia" },
  { neno: "joto", maana: "hali ya mwili kuwa na homa, inayopimwa kwa kipima joto" },
  { neno: "kuvimba", maana: "hali ya sehemu ya mwili kuongezeka ukubwa baada ya kuumia" },
  { neno: "mkasi", maana: "kifaa cha kukatia bendeji au plasta" },
  { neno: "pamba", maana: "kitu laini kinachotumiwa kusafisha jeraha" },
  { neno: "plasta", maana: "kipande kidogo cha kubandika kwenye jeraha dogo" },
  { neno: "sindano", maana: "kifaa chembamba chenye ncha kali kinachotumika kutoa dawa mwilini" },
];

const BOX_ITEMS = ["bendeji", "plasta", "dawa", "pamba", "mkasi", "sindano", "glavu za mpira", "kipima joto"];
const NOT_BOX_ITEMS = ["kisu kikali cha jikoni", "chuma cha moto", "mafuta ya gari", "nyundo ya ujenzi", "betri ya gari", "kamba ya kufungia mizigo"];

const SENTENZA: { neno: string; sentensi: string }[] = [
  { neno: "bendeji", sentensi: "Muuguzi alifunga jeraha kwa bendeji safi." },
  { neno: "plasta", sentensi: "Aliweka plasta juu ya mkwaruzo mdogo mkononi mwake." },
  { neno: "pamba", sentensi: "Tumia pamba kusafisha jeraha kabla ya kulifunga." },
  { neno: "mkasi", sentensi: "Muuguzi alitumia mkasi kukata bendeji iliyozidi." },
  { neno: "dawa", sentensi: "Daktari alimpa mgonjwa dawa ya kupunguza maumivu." },
  { neno: "jeraha", sentensi: "Alianguka na kupata jeraha dogo mguuni." },
  { neno: "sindano", sentensi: "Muuguzi alitumia sindano kumdunga mgonjwa dawa." },
  { neno: "kuvimba", sentensi: "Mguu wake ulianza kuvimba baada ya kuumia." },
];

const ALFABETI_MANENO = ["bendeji", "dawa", "huduma", "jeraha", "joto", "kuvimba", "mkasi", "pamba", "plasta", "sindano"];

export const kusomaKwaKinaMatumiziYaKamusi: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-kina-matumizi-ya-kamusi",
  code: "KS.2",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Kina — Matumizi ya Kamusi (Huduma ya Kwanza)",
  description: "Tambua mpangilio wa maneno kialfabeti kwenye kamusi na msamiati wa huduma ya kwanza.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-alfabeti", "oanisha-huduma", "panga-kisanduku", "jaza-huduma", "panga-alfabeti"] as const);

    if (branch === "tambua-alfabeti") {
      const nne = shuffle(rng, ALFABETI_MANENO).slice(0, 4);
      const kwanza = [...nne].sort((a, b) => a.localeCompare(b))[0];
      const choices = shuffle(rng, nne);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "neno linalotokea kwanza kikitafutwa kwenye kamusi (mpangilio wa alfabeti)")} Maneno: ${nne.join(", ")}.`,
        choices,
        correctIndex: choices.indexOf(kwanza),
        layout: "row",
        hint: "Linganisha herufi za kwanza za kila neno, kama ilivyo kwenye kamusi.",
        explanation: `"${kwanza}" hutokea kwanza kwa sababu herufi zake za mwanzo hutangulia kialfabeti.`,
      };
    }

    if (branch === "oanisha-huduma") {
      const chosen = shuffle(rng, HUDUMA).slice(0, 4);
      const tokens = chosen.map((m) => ({ id: m.neno, label: m.neno }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: m.neno, label: m.maana }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno la huduma ya kwanza na maana yake"),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Soma maana kwa makini kabla ya kuoanisha na neno lake.",
        explanation: chosen.map((m) => `"${m.neno}" maana yake ni ${m.maana}.`).join(" "),
      };
    }

    if (branch === "panga-kisanduku") {
      const box = shuffle(rng, BOX_ITEMS).slice(0, 5);
      const notBox = shuffle(rng, NOT_BOX_ITEMS).slice(0, 3);
      const items = shuffle(rng, [...box, ...notBox]).map((n, i) => ({ id: `${i}-${n}`, label: n }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = box.includes(it.label) ? "box" : "notbox";
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama kitu kiko kwenye kisanduku cha huduma ya kwanza kinachowekwa garini au la"),
        items,
        buckets: [
          { id: "box", label: "Kiko Kwenye Kisanduku cha Huduma ya Kwanza" },
          { id: "notbox", label: "Hakiko Kwenye Kisanduku cha Huduma ya Kwanza" },
        ],
        correctBucket,
        hint: "Fikiria ni vitu gani vinavyosaidia kutibu jeraha dogo.",
        explanation: `Vifaa vya kisanduku cha huduma ya kwanza ni: ${box.join(", ")}.`,
      };
    }

    if (branch === "jaza-huduma") {
      const s = randChoice(rng, SENTENZA);
      const maneno = s.sentensi.replace(".", "").split(" ");
      const idx = randChoice(
        rng,
        maneno.map((_w, i) => i).filter((i) => maneno[i].toLowerCase() === s.neno.toLowerCase())
      );
      const before = maneno.slice(0, idx).join(" ") + (idx > 0 ? " " : "");
      const after = " " + maneno.slice(idx + 1).join(" ") + ".";
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before,
        after,
        correctAnswer: s.neno,
        inputMode: "text",
        hint: "Fikiria neno la huduma ya kwanza linalofaa hapa.",
        explanation: `Sentensi kamili: "${s.sentensi}"`,
      };
    }

    const tano = shuffle(rng, ALFABETI_MANENO).slice(0, 5);
    const sorted = [...tano].sort((a, b) => a.localeCompare(b));
    const items = tano.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    const correctOrder = sorted.map((w) => items.find((it) => it.label === w)!.id);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "maneno haya kwa mpangilio wa alfabeti kama kwenye kamusi"),
      instruction: "Bofya maneno kwa mpangilio wa kialfabeti.",
      items: shuffle(rng, items),
      correctOrder,
      hint: "Anza na neno linaloanza na herufi inayotangulia kialfabeti.",
      explanation: `Mpangilio sahihi wa kialfabeti: ${sorted.join(", ")}.`,
    };
  },
};
