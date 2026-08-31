import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 6.4.1 Ngeli ya U-YA (Maadili).
// Ona curriculum-reference/grade-5/kiswahili.json.

const NOMINO_UYA: { neno: string; maana: string }[] = [
  { neno: "ubele", maana: "hali ya kuwa mbele au kiongozi" },
  { neno: "uovu", maana: "hali ya kutokuwa na maadili mema" },
  { neno: "ugonjwa", maana: "hali ya kutokuwa na afya njema" },
  { neno: "uzuri", maana: "hali ya kupendeza" },
  { neno: "ubaya", maana: "hali ya kutopendeza au kutokuwa vizuri" },
  { neno: "uchafu", maana: "hali ya kutokuwa safi" },
  { neno: "upya", maana: "hali ya kuwa mpya" },
  { neno: "udongo", maana: "ardhi laini itumiwayo kulima au kujenga" },
];

const NOMINO_NJE_YA_UYA = ["mtoto", "kiti", "nguo", "jicho"] as const;

const SENTENSI_UYA: { neno: string; before: string; after: string }[] = [
  { neno: "ubele", before: "Kiongozi huyo alionyesha ", after: " katika mradi wote." },
  { neno: "uovu", before: "Jamii inapaswa kuepuka ", after: " wa aina yoyote." },
  { neno: "ugonjwa", before: "Alilazwa hospitalini kwa sababu ya ", after: "." },
  { neno: "uzuri", before: "Bustani hiyo ina ", after: " wa kupendeza." },
  { neno: "ubaya", before: "Kufanya ", after: " kunaleta madhara kwa wengine." },
  { neno: "uchafu", before: "Tunapaswa kuepuka ", after: " katika mazingira yetu." },
  { neno: "upya", before: "Shule imepata vitabu vya ", after: "." },
  { neno: "udongo", before: "Wakulima walilima ", after: " kwa jembe." },
];

export const ngeliUYa: Skill = {
  id: "g5-ksw-sarufi-ngeli-u-ya",
  code: "SA.7",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Ngeli ya U-YA (Maadili)",
  description: "Tambua nomino za ngeli ya U-YA (mfano: ubele, uovu, ugonjwa) na uzitumie katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-maana", "oanisha-maana", "panga-ngeli", "jaza-neno", "panga-tabia"] as const);

    if (branch === "tambua-maana") {
      const n = randChoice(rng, NOMINO_UYA);
      const wote = shuffle(rng, NOMINO_UYA.map((x) => x.maana));
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "maana sahihi")} Neno la ngeli ya U-YA: "${n.neno}".`,
        choices: wote,
        correctIndex: wote.indexOf(n.maana),
        layout: "list",
        hint: "Nomino za ngeli ya U-YA huanza kwa 'u-' na mara nyingi hutaja hali.",
        explanation: `"${n.neno}" humaanisha ${n.maana}.`,
      };
    }

    if (branch === "oanisha-maana") {
      const chosen = shuffle(rng, NOMINO_UYA).slice(0, 4);
      const tokens = chosen.map((n) => ({ id: n.neno, label: n.neno }));
      const targets = shuffle(rng, chosen).map((n) => ({ id: n.neno, label: n.maana }));
      const correctMap: Record<string, string> = {};
      for (const n of chosen) correctMap[n.neno] = n.neno;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "nomino ya ngeli ya U-YA na maana yake"),
        tokens,
        targets,
        correctMap,
        hint: "Nomino hizi hutaja hali au tabia.",
        explanation: chosen.map((n) => `"${n.neno}" humaanisha ${n.maana}.`).join(" "),
      };
    }

    if (branch === "panga-ngeli") {
      const uya = shuffle(rng, NOMINO_UYA).slice(0, 4).map((n) => ({ id: n.neno, label: n.neno, bucket: "UYA" }));
      const nje = shuffle(rng, NOMINO_NJE_YA_UYA).slice(0, 4).map((n) => ({ id: n, label: n, bucket: "NYINGINE" }));
      const items = shuffle(rng, [...uya, ...nje]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo nomino ni ya ngeli ya U-YA au ngeli nyingine"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "UYA", label: "Ngeli ya U-YA" },
          { id: "NYINGINE", label: "Ngeli Nyingine" },
        ],
        correctBucket,
        hint: "Nomino za U-YA huanza kwa 'u-' na kwa kawaida hutaja hali au tabia dhahania.",
        explanation: "Nomino za ngeli ya U-YA ni pamoja na ubele, uovu, ugonjwa, uzuri, ubaya, uchafu, upya na udongo.",
      };
    }

    if (branch === "jaza-neno") {
      const s = randChoice(rng, SENTENSI_UYA);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: s.before,
        after: s.after,
        correctAnswer: s.neno,
        inputMode: "text",
        hint: "Neno linalokosekana ni nomino ya ngeli ya U-YA.",
        explanation: `Sentensi kamili: "${s.before}${s.neno}${s.after}"`,
      };
    }

    const chosen = shuffle(rng, [
      { id: "uzuri", label: "uzuri (tabia njema)" },
      { id: "uovu", label: "uovu (tabia mbaya)" },
      { id: "ubaya", label: "ubaya (tabia mbaya)" },
    ]).slice(0, 3);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "maneno haya ya U-YA kwa mpangilio wa alfabeti"),
      instruction: "Bofya maneno kwa mpangilio wa alfabeti.",
      items: shuffle(rng, chosen),
      correctOrder: [...chosen].sort((a, b) => a.id.localeCompare(b.id, "sw")).map((i) => i.id),
      hint: "Linganisha herufi ya kwanza ya kila neno.",
      explanation: `Mpangilio wa alfabeti: ${[...chosen].sort((a, b) => a.id.localeCompare(b.id, "sw")).map((i) => i.id).join(", ")}.`,
    };
  },
};
