import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 13.0 Money - Savings and Banking, sub-strand 13.2 Extensive Reading:
// Newspapers, magazines, class readers and poems. Focus: select suitable materials, skim and scan,
// judge a text by theme, interest and language. See curriculum-reference/grade-5/english.json.

const PARTS: { name: string; def: string; example: string }[] = [
  { name: "headline", def: "the large title at the top of a news story that tells you what it is about", example: "NEW SACCO OPENS IN TOWN" },
  { name: "byline", def: "the line that names the reporter who wrote the story", example: "By our business reporter" },
  { name: "dateline", def: "the place and date the report was written", example: "NAKURU, Tuesday" },
  { name: "lead", def: "the first sentence or paragraph, giving the most important facts", example: "A new community savings bank opened its doors on Monday, serving more than 500 members." },
  { name: "body", def: "the rest of the story, giving the details in order of importance", example: "The manager said members could open an account with as little as fifty shillings..." },
  { name: "caption", def: "the short line under a photograph that says what it shows", example: "Members queue to open their accounts on opening day." },
  { name: "editorial", def: "an article giving the newspaper's own opinion on an issue", example: "We believe every school should teach children how to save." },
  { name: "classified advert", def: "a small paid notice, such as something for sale or a job", example: "FOR SALE: bicycle, good condition, 3,500/=. Call 0722..." },
];

const MAG_SECTIONS: { section: string; use: string }[] = [
  { section: "cover story", use: "the main, most important article, shown on the front" },
  { section: "feature article", use: "a longer, detailed article about one topic" },
  { section: "column", use: "a regular piece by the same writer, often giving opinions or advice" },
  { section: "interview", use: "questions and answers with one person" },
  { section: "letters page", use: "letters sent in by readers" },
];

const LOOK_IN: { need: string; answer: string; wrong: string[] }[] = [
  { need: "You want to know quickly what a news story is about.", answer: "headline", wrong: ["classified advert", "caption", "byline"] },
  { need: "You want to find out who wrote a story.", answer: "byline", wrong: ["dateline", "lead", "editorial"] },
  { need: "You want the most important facts of a story fast.", answer: "lead", wrong: ["classified advert", "caption", "byline"] },
  { need: "You want to know what a photo in the paper shows.", answer: "caption", wrong: ["headline", "editorial", "dateline"] },
  { need: "You want to read the newspaper's opinion about school savings.", answer: "editorial", wrong: ["lead", "byline", "caption"] },
  { need: "You want to buy a second-hand bicycle.", answer: "classified advert", wrong: ["editorial", "headline", "dateline"] },
  { need: "You want to know where and when a report was written.", answer: "dateline", wrong: ["byline", "caption", "lead"] },
];

export const newspaperMagazineParts: Skill = {
  id: "g5-eng-reading-newspaper-magazine-parts",
  code: "R.13",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Parts of a Newspaper and a Magazine",
  description: "Name the parts of a news story (headline, byline, dateline, lead, body, caption, editorial, classified advert) and the sections of a magazine, and know where to look for particular information.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-lookin", "fill-part", "sort-part", "match", "order-article", "reason"] as const);

    if (branch === "mc-lookin") {
      const l = randChoice(rng, LOOK_IN);
      const { choices, correctIndex } = mcFromCluster(rng, l.answer, l.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: scenarioPrompt(rng, l.need, "Which part of the newspaper should you look at?"),
        choices,
        correctIndex,
        layout: "list",
        hint: "Each part of a newspaper has a different job — big title, writer's name, place/date, key facts, opinion, small notices.",
        explanation: `Look at the ${l.answer} — ${PARTS.find((p) => p.name === l.answer)?.def}.`,
      };
    }

    if (branch === "fill-part") {
      const p = randChoice(rng, PARTS);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the part of a news story described (one or two words)"),
        before: `${p.def} — this is the `,
        after: ".",
        correctAnswer: p.name,
        acceptedAnswers: [p.name, p.name.split(" ")[0]],
        inputMode: "text",
        hint: "Parts: headline, byline, dateline, lead, body, caption, editorial, classified advert.",
        explanation: `That is the ${p.name}. Example: "${p.example}"`,
      };
    }

    if (branch === "sort-part") {
      const pool = shuffle(rng, PARTS).slice(0, 6);
      const items = pool.map((p, i) => ({ id: `p${i}`, label: `"${p.example}"` }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((p, i) => (correctBucket[`p${i}`] = p.name));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "which part of a newspaper each snippet comes from"),
        items,
        buckets: pool.map((p) => ({ id: p.name, label: p.name })),
        correctBucket,
        hint: "A short shouting title = headline. 'By ...' = byline. 'PLACE, day' = dateline. A first key sentence = lead. 'For sale...' = classified advert.",
        explanation: pool.map((p) => `${p.name}: "${p.example}"`).join("  "),
      };
    }

    if (branch === "match") {
      const useMag = rng() < 0.5;
      const pool: { key: string; desc: string }[] = useMag
        ? shuffle(rng, MAG_SECTIONS).slice(0, 5).map((m) => ({ key: m.section, desc: m.use }))
        : shuffle(rng, PARTS).slice(0, 5).map((p) => ({ key: p.name, desc: p.def }));
      const tokens = shuffle(rng, pool.map((x) => ({ id: x.key, label: x.key })));
      const targets = shuffle(rng, pool.map((x) => ({ id: x.key, label: x.desc })));
      const correctMap: Record<string, string> = {};
      pool.forEach((x) => (correctMap[x.key] = x.key));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, `${useMag ? "magazine section" : "newspaper part"} to what it is`),
        tokens,
        targets,
        correctMap,
        hint: "Each part or section has one clear job.",
        explanation: pool.map((x) => `${x.key}: ${x.desc}`).join("  "),
      };
    }

    if (branch === "order-article") {
      const items = [
        { id: "headline", label: "Headline: NEW SACCO OPENS IN TOWN" },
        { id: "byline", label: "Byline: By our business reporter" },
        { id: "dateline", label: "Dateline: NAKURU, Tuesday" },
        { id: "lead", label: "Lead: A new community savings bank opened on Monday, serving over 500 members." },
        { id: "body", label: "Body: The manager said members could open an account with fifty shillings..." },
      ];
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the parts of a news story as they appear from top to bottom"),
        instruction: "Click the parts in the correct order.",
        items: shuffle(rng, items),
        correctOrder: ["headline", "byline", "dateline", "lead", "body"],
        hint: "The title comes first, then who wrote it, then where and when, then the key facts, then the details.",
        explanation: "Order: headline → byline → dateline → lead → body.",
      };
    }

    // reason — which magazine section to read?
    const scen = [
      { s: "You want the magazine's biggest, most important article this month.", answer: "cover story", wrong: ["letters page", "classified advert", "column"] },
      { s: "You want to read what other readers wrote in.", answer: "letters page", wrong: ["cover story", "interview", "feature article"] },
      { s: "You want a long, detailed article about how saving groups work.", answer: "feature article", wrong: ["letters page", "column", "interview"] },
      { s: "You want questions and answers with a bank manager.", answer: "interview", wrong: ["editorial", "cover story", "letters page"] },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.answer, sc.wrong, 3);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, "Which section should you turn to?"),
      choices,
      correctIndex,
      layout: "row",
      hint: "Match what you want to the section made for it.",
      explanation: `Turn to the ${sc.answer}.`,
    };
  },
};
