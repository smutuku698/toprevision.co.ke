import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Kusoma KS.6 Kusoma kwa Kina — Makala ya Kujichagulia (Maadili). Msamiati ya
// maktaba na aina za makala. Ona curriculum-reference/grade-5/kiswahili.json.

const MAKTABA: { neno: string; maana: string }[] = [
  { neno: "maktaba", maana: "jengo au chumba chenye vitabu vingi vya kusoma" },
  { neno: "rafu", maana: "kabati refu la kuwekea vitabu maktabani" },
  { neno: "gazeti", maana: "karatasi za habari zinazochapishwa kila siku" },
  { neno: "jarida", maana: "kijitabu cha habari kinachotolewa mara kwa mara, kwa mfano kila mwezi" },
  { neno: "riwaya", maana: "hadithi ndefu ya kubuni yenye wahusika na visa vingi" },
  { neno: "mkopeshaji-vitabu", maana: "mtu anayewasaidia wasomaji kukopa na kurejesha vitabu maktabani" },
  { neno: "kitabu", maana: "maandishi yaliyokusanywa pamoja kwa mfumo wa kurasa kusomwa" },
  { neno: "mwandishi", maana: "mtu aliyeandika kitabu au makala" },
  { neno: "msomaji", maana: "mtu anayesoma kitabu au makala" },
  { neno: "kadi", maana: "karatasi ndogo ngumu inayotumika kukopa vitabu maktabani" },
];

const KUBUNI = ["riwaya", "hadithi ya kubuni", "hekaya", "ngano"];
const KWELI = ["gazeti", "jarida", "ripoti ya kweli", "wasifu wa kweli"];

const SENTENZA: { neno: string; sentensi: string }[] = [
  { neno: "maktaba", sentensi: "Wanafunzi walitembelea maktaba kusoma vitabu vya maadili." },
  { neno: "rafu", sentensi: "Vitabu vyote vimepangwa vizuri kwenye rafu." },
  { neno: "gazeti", sentensi: "Baba husoma gazeti kila asubuhi kupata habari." },
  { neno: "jarida", sentensi: "Mwalimu aliazima jarida la elimu ya maadili." },
  { neno: "riwaya", sentensi: "Nilisoma riwaya nzuri kuhusu urafiki na uaminifu." },
  { neno: "kitabu", sentensi: "Kila mwanafunzi anapaswa kusoma angalau kitabu kimoja kwa mwezi." },
  { neno: "mwandishi", sentensi: "Mwandishi wa hadithi hii anajulikana kwa maadili mema." },
  { neno: "msomaji", sentensi: "Msomaji makini huelewa ujumbe wa hadithi vizuri." },
];

const MICHAKATO: string[][] = [
  [
    "Ingia maktabani na uwe mtulivu.",
    "Tafuta rafu yenye mada unayotaka kusoma.",
    "Chagua makala au kitabu kinachokufaa.",
    "Tumia kadi yako ya maktaba kukiazima au kisome papo hapo.",
    "Rudisha kitabu kwa wakati baada ya kusoma.",
  ],
  [
    "Fikiria mada ya maadili unayotaka kujifunza.",
    "Muulize mkopeshaji-vitabu akusaidie kupata makala inayofaa.",
    "Soma kichwa na aya ya kwanza kuona kama inakufaa.",
    "Soma makala yote ukizingatia ujumbe wake.",
  ],
];

export const kusomaKwaKinaMakalaYaKujichagulia: Skill = {
  id: "g5-ksw-ks-kusoma-kwa-kina-makala-ya-kujichagulia",
  code: "KS.6",
  subjectId: "kiswahili",
  strandId: "g5-ksw-ks",
  grade: 5,
  title: "Kusoma kwa Kina — Makala ya Kujichagulia (Maadili)",
  description: "Tambua makala ya kusoma maktabani kuhusu maadili, na msamiati wa maktaba.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-neno", "oanisha-maktaba", "panga-aina", "jaza-maktaba", "panga-hatua"] as const);

    if (branch === "tambua-neno") {
      const m = randChoice(rng, MAKTABA);
      const wengine = shuffle(rng, MAKTABA.filter((x) => x.neno !== m.neno)).slice(0, 3);
      const choices = shuffle(rng, [m.neno, ...wengine.map((x) => x.neno)]);
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "neno la maktaba linalofaa maelezo haya")} Maelezo: ${m.maana}.`,
        choices,
        correctIndex: choices.indexOf(m.neno),
        layout: "row",
        hint: "Fikiria neno la maktaba linaloendana na maelezo hayo.",
        explanation: `"${m.neno}" ni ${m.maana}.`,
      };
    }

    if (branch === "oanisha-maktaba") {
      const chosen = shuffle(rng, MAKTABA).slice(0, 5);
      const tokens = chosen.map((m) => ({ id: m.neno, label: m.neno }));
      const targets = shuffle(rng, chosen).map((m) => ({ id: m.neno, label: m.maana }));
      const correctMap: Record<string, string> = {};
      for (const m of chosen) correctMap[m.neno] = m.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "neno la maktaba na maana yake"),
        tokens: shuffle(rng, tokens),
        targets,
        correctMap,
        hint: "Soma maana kwa makini kabla ya kuoanisha na neno lake.",
        explanation: chosen.map((m) => `"${m.neno}" ni ${m.maana}.`).join(" "),
      };
    }

    if (branch === "panga-aina") {
      const kubuni = shuffle(rng, KUBUNI).slice(0, 3);
      const kweli = shuffle(rng, KWELI).slice(0, 3);
      const items = shuffle(rng, [...kubuni, ...kweli]).map((n, i) => ({ id: `${i}-${n}`, label: n }));
      const correctBucket: Record<string, string> = {};
      for (const it of items) correctBucket[it.id] = kubuni.includes(it.label) ? "kubuni" : "kweli";
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "kama matini hii ni hadithi za kubuni au habari za kweli"),
        items,
        buckets: [
          { id: "kubuni", label: "Hadithi za Kubuni" },
          { id: "kweli", label: "Habari za Kweli" },
        ],
        correctBucket,
        hint: "Fikiria kama matini hii inasimulia visa vya kubuni au habari halisi.",
        explanation: `Hadithi za kubuni: ${kubuni.join(", ")}. Habari za kweli: ${kweli.join(", ")}.`,
      };
    }

    if (branch === "jaza-maktaba") {
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
        hint: "Fikiria neno la maktaba linalofaa hapa.",
        explanation: `Sentensi kamili: "${s.sentensi}"`,
      };
    }

    const hatua = randChoice(rng, MICHAKATO);
    const items = hatua.map((h, i) => ({ id: `${i}-hatua`, label: h }));
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "hatua za kutafuta na kusoma makala maktabani"),
      instruction: "Bofya hatua kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: "Fikiria hatua ya kwanza unapofika maktabani.",
      explanation: `Mpangilio sahihi: ${hatua.join(" ")}`,
    };
  },
};
