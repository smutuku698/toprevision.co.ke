import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

type Nyakati = "Uliopo" | "Uliopita" | "Ujao";

const UKANUSHAJI: { chanya: string; kanushi: string; nyakati: Nyakati }[] = [
  { chanya: "Ninasoma kitabu.", kanushi: "Sisomi kitabu.", nyakati: "Uliopo" },
  { chanya: "Nilisoma kitabu jana.", kanushi: "Sikusoma kitabu jana.", nyakati: "Uliopita" },
  { chanya: "Nitasoma kitabu kesho.", kanushi: "Sitasoma kitabu kesho.", nyakati: "Ujao" },
  { chanya: "Anacheza mpira.", kanushi: "Hachezi mpira.", nyakati: "Uliopo" },
  { chanya: "Alicheza mpira jana.", kanushi: "Hakucheza mpira jana.", nyakati: "Uliopita" },
  { chanya: "Atacheza mpira kesho.", kanushi: "Hatacheza mpira kesho.", nyakati: "Ujao" },
];

export const ukanushajiKwaNyakati: Skill = {
  id: "g7-ksw-sarufi-ukanushaji-kwa-nyakati",
  code: "SA.9",
  subjectId: "kiswahili",
  strandId: "g7-ksw-sarufi",
  grade: 7,
  title: "Ukanushaji kwa Kuzingatia Nyakati",
  description: "Badilisha sentensi chanya kuwa hasi (kanusha) katika wakati uliopo, uliopita, na ujao.",
  generate(rng) {
    const branch = randChoice(rng, ["oanisha-kanushi", "panga-nyakati-kanushi", "chagua-kanushi", "jaza-kanushi", "saa-kanushi", "panga-sentensi-kanushi"] as const);

    if (branch === "oanisha-kanushi") {
      const chosen = shuffle(rng, UKANUSHAJI).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((u) => ({ id: u.chanya, label: u.chanya })));
      const targets = shuffle(rng, chosen.map((u) => ({ id: u.chanya, label: u.kanushi })));
      const correctMap: Record<string, string> = {};
      for (const u of chosen) correctMap[u.chanya] = u.chanya;
      return {
        kind: "click-match",
        prompt: "Oanisha kila sentensi chanya na umbo lake hasi (lililokanushwa).",
        tokens,
        targets,
        correctMap,
        hint: "Ukanushaji hubadilisha kiambishi cha nafsi na wakati, na wakati mwingine mwisho wa kitenzi pia.",
        explanation: chosen.map((u) => `"${u.chanya}" hukanushwa kuwa "${u.kanushi}".`).join(" "),
      };
    }

    if (branch === "panga-nyakati-kanushi") {
      const items = UKANUSHAJI.map((u) => ({ id: u.kanushi, label: u.kanushi, bucket: u.nyakati }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: "Panga kila sentensi hasi kulingana na wakati wake: Uliopo, Uliopita, au Ujao.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "Uliopo", label: "Uliopo" },
          { id: "Uliopita", label: "Uliopita" },
          { id: "Ujao", label: "Ujao" },
        ],
        correctBucket,
        hint: "Uliopo hasi huishia kwa '-i' (mfano: sisomi); Uliopita hasi hutumia '-ku-' (sikusoma); Ujao hasi hutumia '-ta-' (sitasoma).",
        explanation: UKANUSHAJI.map((u) => `"${u.kanushi}" ni wakati ${u.nyakati} hasi.`).join(" "),
      };
    }

    if (branch === "chagua-kanushi") {
      const entry = randChoice(rng, UKANUSHAJI);
      const distractors = shuffle(rng, UKANUSHAJI.filter((u) => u.chanya !== entry.chanya).map((u) => u.kanushi)).slice(0, 3);
      const choices = shuffle(rng, [entry.kanushi, ...distractors]);
      return {
        kind: "multiple-choice",
        prompt: `Kanusha sentensi ifuatayo ipasavyo: "${entry.chanya}"`,
        choices,
        correctIndex: choices.indexOf(entry.kanushi),
        layout: "list",
        hint: `Sentensi hii iko katika wakati ${entry.nyakati} — zingatia jinsi wakati huo hukanushwa.`,
        explanation: `Umbo hasi sahihi ni: "${entry.kanushi}"`,
      };
    }

    if (branch === "jaza-kanushi") {
      const entry = randChoice(rng, UKANUSHAJI);
      const words = entry.kanushi.replace(".", "").split(" ");
      const kitenzi = words[0];
      const bakia = words.slice(1).join(" ");
      return {
        kind: "fill-blank",
        prompt: `Andika umbo hasi la kitenzi kinachofaa kukamilisha ukanushaji wa: "${entry.chanya}"`,
        before: "",
        after: ` ${bakia}.`,
        correctAnswer: kitenzi,
        inputMode: "text",
        hint: `Sentensi chanya "${entry.chanya}" iko katika wakati ${entry.nyakati}.`,
        explanation: `Umbo hasi sahihi ni: "${entry.kanushi}"`,
      };
    }

    if (branch === "saa-kanushi") {
      const hour = 5 + Math.floor(rng() * 15);
      const minute = randChoice(rng, [0, 15, 30, 45]);
      const sahihi = "Halima hasomi kazi yake ya nyumbani sasa hivi.";
      const makosa = ["Halima hakusoma kazi yake ya nyumbani jana.", "Halima hatasoma kazi yake ya nyumbani kesho.", "Halima anasoma kazi yake ya nyumbani sasa hivi."];
      const choices = shuffle(rng, [sahihi, ...makosa]);
      return {
        kind: "multiple-choice",
        prompt:
          "Saa iliyoonyeshwa ni 'sasa hivi'. Halima hajaanza kazi yake ya nyumbani. Ni sentensi ipi sahihi ya wakati uliopo hasi inayoeleza hali hii?",
        visual: { type: "clock", hour, minute },
        choices,
        correctIndex: choices.indexOf(sahihi),
        layout: "list",
        hint: "Wakati uliopo hasi huishia kwa '-i' badala ya '-a', na hutumia kiambishi hasi badala ya '-na-'.",
        explanation: `Sentensi sahihi ni: "${sahihi}" — inaonyesha kwamba kwa sasa Halima hafanyi kitendo hicho.`,
      };
    }

    const entry = randChoice(rng, UKANUSHAJI);
    const words = entry.kanushi.replace(".", "").split(" ");
    const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
    return {
      kind: "ordering",
      prompt: "Panga maneno haya kuunda sentensi hasi sahihi.",
      instruction: "Bofya maneno kwa mpangilio sahihi.",
      items: shuffle(rng, items),
      correctOrder: items.map((i) => i.id),
      hint: `Umbo hili hasi linatokana na sentensi chanya "${entry.chanya}".`,
      explanation: `Sentensi sahihi ni: "${entry.kanushi}"`,
    };
  },
};
