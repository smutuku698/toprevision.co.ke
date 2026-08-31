import { randChoice, shuffle } from "@/lib/rng";
import { tambuaPrompt, oanishaPrompt, pangaPrompt, mpangilioPrompt, kamilishaPrompt } from "./g5KswShared";
import type { Skill } from "@/lib/types";

// KICD Gredi ya 5 Kiswahili, Mada 1.4.1-2 Nomino za Pekee na Nomino za Kawaida (Mapishi).
// Ona curriculum-reference/grade-5/kiswahili.json.

type AinaPekee = "mji" | "mwezi" | "siku" | "jina";

const NOMINO_PEKEE: { neno: string; aina: AinaPekee }[] = [
  { neno: "Kisumu", aina: "mji" },
  { neno: "Nairobi", aina: "mji" },
  { neno: "Mombasa", aina: "mji" },
  { neno: "Nakuru", aina: "mji" },
  { neno: "Mei", aina: "mwezi" },
  { neno: "Januari", aina: "mwezi" },
  { neno: "Machi", aina: "mwezi" },
  { neno: "Alhamisi", aina: "siku" },
  { neno: "Jumatatu", aina: "siku" },
  { neno: "Jumapili", aina: "siku" },
  { neno: "Rabuka", aina: "jina" },
  { neno: "Yohana", aina: "jina" },
  { neno: "Amina", aina: "jina" },
  { neno: "Baraka", aina: "jina" },
];

const NOMINO_KAWAIDA = [
  "mtu", "mtoto", "darasa", "ukuta", "mwalimu", "meza", "kiti", "kitabu", "mlango", "dirisha", "shule",
] as const;

const AINA_LABELS: Record<AinaPekee, string> = {
  mji: "Jina la Mji",
  mwezi: "Jina la Mwezi",
  siku: "Jina la Siku",
  jina: "Jina la Mtu",
};

const SENTENSI_JAZA: { jibu: string; before: string; after: string }[] = [
  { jibu: "Kisumu", before: "Familia yetu ilisafiri hadi ", after: " wikendi iliyopita." },
  { jibu: "Nairobi", before: "Ofisi kuu ya kampuni hiyo iko ", after: "." },
  { jibu: "Mombasa", before: "Tulifurahia pwani tulipotembelea ", after: "." },
  { jibu: "Nakuru", before: "Babu yangu anaishi karibu na ", after: "." },
  { jibu: "Mei", before: "Shule yetu ilifunga muhula mwezi wa ", after: "." },
  { jibu: "Januari", before: "Mwaka mpya wa masomo huanza mwezi wa ", after: "." },
  { jibu: "Machi", before: "Mtihani wa muhula wa kwanza ulifanyika mwezi wa ", after: "." },
  { jibu: "Alhamisi", before: "Tutakutana tena siku ya ", after: " wiki ijayo." },
  { jibu: "Jumatatu", before: "Wiki ya masomo huanza siku ya ", after: "." },
  { jibu: "Jumapili", before: "Familia yangu huenda kanisani kila siku ya ", after: "." },
  { jibu: "Yohana", before: "", after: " alifika shuleni mapema leo." },
  { jibu: "Amina", before: "Mwalimu alimsifu ", after: " kwa bidii yake darasani." },
  { jibu: "Baraka", before: "", after: " na rafiki yake walicheza mpira baada ya shule." },
  { jibu: "mwalimu", before: "", after: " wetu alitufundisha somo jipya leo." },
  { jibu: "kitabu", before: "Niliweka ", after: " mezani baada ya kusoma." },
  { jibu: "mlango", before: "Tafadhali funga ", after: " unapotoka nje." },
  { jibu: "dirisha", before: "Upepo ulikuwa ukiingia kupitia ", after: " lililo wazi." },
  { jibu: "darasa", before: "", after: " letu lina wanafunzi arobaini." },
  { jibu: "kiti", before: "Mtoto aliketi kwenye ", after: " karibu na dirisha." },
  { jibu: "meza", before: "Vitabu vyote vimewekwa juu ya ", after: "." },
  { jibu: "shule", before: "Kila asubuhi mimi huenda ", after: " kwa miguu." },
  { jibu: "ukuta", before: "Picha nzuri ilining'inizwa kwenye ", after: " wa darasa." },
  { jibu: "mtoto", before: "", after: " mdogo alilia kwa njaa." },
  { jibu: "mtu", before: "Kulikuwa na ", after: " mmoja aliyesimama nje ya duka." },
];

export const nominoZaPekeeNaKawaida: Skill = {
  id: "g5-ksw-sarufi-nomino-pekee-kawaida",
  code: "SA.1",
  subjectId: "kiswahili",
  strandId: "g5-ksw-sarufi",
  grade: 5,
  title: "Nomino za Pekee na Nomino za Kawaida (Mapishi)",
  description: "Tambua na utumie nomino za pekee (mfano: Kisumu, Mei, Yohana) na nomino za kawaida (mfano: mtu, meza, shule) katika sentensi.",
  generate(rng) {
    const branch = randChoice(rng, ["tambua-aina", "oanisha-aina", "panga-pekee-kawaida", "jaza-nomino", "panga-alfabeti"] as const);

    if (branch === "tambua-aina") {
      const chagua = randChoice(rng, [
        ...NOMINO_PEKEE.map((n) => ({ neno: n.neno, pekee: true })),
        ...NOMINO_KAWAIDA.map((n) => ({ neno: n, pekee: false })),
      ]);
      const choices = shuffle(rng, ["Nomino ya Pekee", "Nomino ya Kawaida"]);
      const sahihi = chagua.pekee ? "Nomino ya Pekee" : "Nomino ya Kawaida";
      return {
        kind: "multiple-choice",
        prompt: `${tambuaPrompt(rng, "aina ya nomino")} Neno: "${chagua.neno}".`,
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "row",
        hint: chagua.pekee ? "Nomino za pekee huanza na herufi kubwa na hutaja kitu mahususi." : "Nomino za kawaida hutaja kundi la vitu kwa jumla, si kitu mahususi.",
        explanation: `"${chagua.neno}" ni ${sahihi.toLowerCase()}.`,
      };
    }

    if (branch === "oanisha-aina") {
      const aina: AinaPekee[] = ["mji", "mwezi", "siku", "jina"];
      const chosen = aina.map((a) => ({ aina: a, neno: randChoice(rng, NOMINO_PEKEE.filter((n) => n.aina === a)).neno }));
      const tokens = chosen.map((c) => ({ id: c.aina, label: c.neno }));
      const targets = shuffle(rng, chosen).map((c) => ({ id: c.aina, label: AINA_LABELS[c.aina] }));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.aina] = c.aina;
      return {
        kind: "click-match",
        prompt: oanishaPrompt(rng, "nomino ya pekee na aina yake"),
        tokens,
        targets,
        correctMap,
        hint: "Nomino za pekee hutaja miji, miezi, siku au majina ya watu.",
        explanation: chosen.map((c) => `"${c.neno}" ni ${AINA_LABELS[c.aina].toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "panga-pekee-kawaida") {
      const pekee = shuffle(rng, NOMINO_PEKEE).slice(0, 4).map((n) => ({ id: n.neno, label: n.neno, bucket: "PEKEE" }));
      const kawaida = shuffle(rng, NOMINO_KAWAIDA).slice(0, 4).map((n) => ({ id: n, label: n, bucket: "KAWAIDA" }));
      const items = shuffle(rng, [...pekee, ...kawaida]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: pangaPrompt(rng, "iwapo nomino ni ya pekee au ya kawaida"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "PEKEE", label: "Nomino ya Pekee" },
          { id: "KAWAIDA", label: "Nomino ya Kawaida" },
        ],
        correctBucket,
        hint: "Nomino za pekee huanza kwa herufi kubwa na hutaja kitu mahususi.",
        explanation: "Nomino za pekee hutaja vitu mahususi (miji, miezi, siku, watu); nomino za kawaida hutaja makundi ya vitu kwa jumla.",
      };
    }

    if (branch === "jaza-nomino") {
      const s = randChoice(rng, SENTENSI_JAZA);
      return {
        kind: "fill-blank",
        prompt: kamilishaPrompt(rng),
        before: s.before,
        after: s.after,
        correctAnswer: s.jibu,
        inputMode: "text",
        hint: /^[A-Z]/.test(s.jibu) ? "Neno linalokosekana ni nomino ya pekee — huanza na herufi kubwa." : "Neno linalokosekana ni nomino ya kawaida.",
        explanation: `Sentensi kamili: "${s.before}${s.jibu}${s.after}"`,
      };
    }

    const maneno = shuffle(rng, [...NOMINO_KAWAIDA, ...NOMINO_PEKEE.map((n) => n.neno)]).slice(0, 5);
    const items = maneno.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    const correctOrder = [...items].sort((a, b) => a.label.localeCompare(b.label, "sw")).map((i) => i.id);
    return {
      kind: "ordering",
      prompt: mpangilioPrompt(rng, "maneno haya kwa mpangilio wa alfabeti"),
      instruction: "Bofya maneno kwa mpangilio wa alfabeti.",
      items: shuffle(rng, items),
      correctOrder,
      hint: "Linganisha herufi ya kwanza ya kila neno.",
      explanation: `Mpangilio sahihi wa alfabeti ni: ${correctOrder.map((id) => items.find((i) => i.id === id)!.label).join(", ")}.`,
    };
  },
};
