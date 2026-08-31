import { randChoice, randInt, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { g6Name, g6Place, expandScenarios, buildScenarioChoices, type ScenarioMC } from "./sharedG6Ag";

// KICD Grade 6 Agriculture P.2 "Crocheted Household Articles" (the second half of source
// sub-strand "4.1 Crocheting Stitches", split per the Grade-6 "split into deeper skills" rule;
// see crochetStitches.ts for the stitch-identification half). The source names exactly three
// articles — mats, cleaning rug, surface wipers — as the enumerated pool, and explicitly names
// financial literacy as the PCI ("learners save costs by constructing useable household articles
// using crocheting skills"), so a cost-comparison Apply/Evaluate branch is mandatory, not optional.

const MAKING_STEPS = [
  { id: "decide-need", label: "Decide which household need to meet", detail: "Identify a household need, such as a doormat, cleaning rug or surface wiper, that an article could meet" },
  { id: "choose-stitch", label: "Choose a suitable stitch", detail: "Choose single crochet for a firm, durable article or double crochet for a lighter, quicker one, based on that need" },
  { id: "gather-yarn", label: "Gather yarn and a hook", detail: "Gather enough yarn of a suitable colour and a crochet hook of the right size" },
  { id: "crochet-article", label: "Crochet the article", detail: "Work the chosen stitch, row by row, to construct the article to the size needed" },
  { id: "finish-edges", label: "Finish the edges", detail: "Finish and secure the edges so the article does not unravel with use" },
  { id: "showcase", label: "Showcase the finished article", detail: "Showcase the completed article to family or classmates to promote its adoption in daily routines" },
] as const;

type Article = "mat" | "rug" | "wiper";

const ARTICLE_LABEL: Record<Article, string> = {
  mat: "Mat",
  rug: "Cleaning rug",
  wiper: "Surface wiper",
};

interface ArticleFact {
  id: string;
  article: Article;
  label: string;
  reason: string;
}

const ARTICLE_FACTS: ArticleFact[] = [
  { id: "m1", article: "mat", label: "Usually crocheted mainly in single crochet", reason: "single crochet's dense, tight structure gives a mat the firmness needed to be walked on and hold its shape" },
  { id: "m2", article: "mat", label: "Placed at a doorway or beside a bed", reason: "a mat needs to lie flat and stay in place underfoot, which a dense fabric supports better than an open one" },
  { id: "m3", article: "mat", label: "Made larger and thicker than a surface wiper", reason: "a mat covers more floor area and must withstand more weight and friction than a small wiper" },
  { id: "m4", article: "mat", label: "Often worked in a spiral or round shape from the centre outward", reason: "a round or spiral construction produces an even, flat mat without a bulky seam" },
  { id: "m5", article: "mat", label: "Benefits from a firm edge so it does not fray or curl underfoot", reason: "an edge that is worked firmly keeps the mat lying flat and safe to walk on" },
  { id: "m6", article: "mat", label: "A practical household item that reduces the need to buy a shop-bought doormat", reason: "making a usable mat by hand saves the household the cost of purchasing one" },
  { id: "r1", article: "rug", label: "Crocheted densely so it can withstand scrubbing", reason: "a cleaning rug is rubbed repeatedly against surfaces, so it needs a tight, durable stitch such as single crochet" },
  { id: "r2", article: "rug", label: "Used for wiping floors or scrubbing dishes and surfaces", reason: "its main purpose is repeated contact with wet or dirty surfaces, which requires a sturdy fabric" },
  { id: "r3", article: "rug", label: "Made from yarn that can absorb and hold some moisture", reason: "absorbing water or soapy liquid is part of a cleaning rug's job during scrubbing" },
  { id: "r4", article: "rug", label: "Replaces a bought cleaning cloth, saving a small household expense", reason: "crocheting a rug from available yarn avoids the repeated cost of buying disposable cleaning cloths" },
  { id: "r5", article: "rug", label: "Often smaller than a mat but thicker in texture", reason: "a rug needs to be held comfortably in the hand while scrubbing, unlike a larger mat meant for the floor" },
  { id: "w1", article: "wiper", label: "Often crocheted with more double crochet for a lighter, softer texture", reason: "a surface wiper does not need to be as dense as a mat or rug, so an open, airy stitch suits it well" },
  { id: "w2", article: "wiper", label: "Used for wiping tables, counters or shelves", reason: "these surfaces need a light, soft cloth rather than a thick, heavy fabric" },
  { id: "w3", article: "wiper", label: "Made in a small, easy-to-handle size", reason: "a wiper is held and moved by hand often, so a compact size makes it practical to use" },
  { id: "w4", article: "wiper", label: "A quick project that uses less yarn than a mat or rug", reason: "its smaller size and often-lighter stitch mean it takes less yarn and time to finish" },
  { id: "w5", article: "wiper", label: "A low-cost alternative to buying disposable wiping cloths", reason: "reusing a crocheted wiper instead of buying paper towels or shop cloths saves money over time" },
];

const REASONING_FACTS: { situation: string; correct: string; wrong: string[] }[] = [
  {
    situation: "a family crochets a floor mat at home using leftover yarn instead of buying one from a shop",
    correct: "Making the mat with materials already available at home avoids spending money to purchase one, a direct financial-literacy benefit",
    wrong: [
      "Crocheting a mat always costs more than buying one from a shop, regardless of the yarn used",
      "Financial literacy only applies to money kept in a bank, never to household skills like crocheting",
      "A homemade mat can never be as functional as a shop-bought one",
    ],
  },
  {
    situation: "a cleaning rug crocheted densely in single crochet lasts through many months of scrubbing, while a rug made loosely in an open stitch wears out and needs replacing much sooner",
    correct: "Choosing a dense, durable stitch for an item that will face repeated friction makes it last longer, which saves the cost of replacing it often",
    wrong: [
      "The stitch used has no effect on how long a cleaning rug lasts",
      "A loosely stitched rug always lasts longer under scrubbing",
      "Replacing a rug often is unavoidable no matter which stitch is used",
    ],
  },
  {
    situation: "a surface wiper crocheted small and light is more practical for everyday table-wiping than a large, thick mat-style piece used for the same job",
    correct: "Matching the article's size and stitch to its actual use makes it more practical and comfortable to use than an oversized, overly dense alternative",
    wrong: [
      "A larger, thicker piece is always more practical for wiping a table",
      "The size of a household article makes no difference to how practical it is",
      "Only the colour of yarn used affects how practical an article feels to use",
    ],
  },
  {
    situation: "a household that regularly crochets its own mats, rugs and wipers spends noticeably less on buying these items from shops over a year",
    correct: "Producing usable household articles by hand repeatedly, instead of buying them, adds up to real savings over time",
    wrong: [
      "Crocheting household items has no real effect on a household's spending over time",
      "Buying shop items is always cheaper than crocheting the same item at home",
      "Savings from crocheting only apply to a single item, never add up over time",
    ],
  },
  {
    situation: "a maker chooses single crochet for a doormat but double crochet for a lightweight surface wiper made from the same ball of yarn",
    correct: "Matching the denser stitch to the item needing durability, and the lighter stitch to the item needing speed and softness, uses the same yarn more effectively for each purpose",
    wrong: [
      "The same stitch should always be used for every article regardless of its purpose",
      "Yarn choice matters more than stitch choice for every kind of household article",
      "Mixing stitch choices across different articles is never done in practice",
    ],
  },
  {
    situation: "a cleaning rug crocheted with an absorbent yarn soaks up soapy water better than one crocheted with a yarn that repels water",
    correct: "Choosing a yarn that can hold moisture matters for an article whose main job involves wiping up water or soapy liquid",
    wrong: [
      "The type of yarn used has no effect on how well a cleaning rug absorbs liquid",
      "All yarns absorb water equally well regardless of their material",
      "Absorbency only matters for mats, never for cleaning rugs",
    ],
  },
  {
    situation: "a mat worked in a spiral shape from the centre outward lies flatter underfoot than a mat pieced together from several separate rectangles sewn at the edges",
    correct: "A continuous spiral construction avoids bulky seams that can lift or curl, keeping the mat flatter and safer to walk on",
    wrong: [
      "How a mat is constructed has no effect on whether it lies flat",
      "Seams sewn between pieces always make a mat lie flatter",
      "A spiral shape is only used for decoration, never for practicality",
    ],
  },
  {
    situation: "a family saves for months to buy a shop-bought doormat, while a neighbouring family crochets an equally useful mat from yarn already at home within a week",
    correct: "Producing a usable article from available materials and skill can meet a household need faster and at lower cost than saving up to purchase one",
    wrong: [
      "Crocheting a mat always takes longer than saving up to buy one",
      "A crocheted mat is always less useful than a purchased one, regardless of how it is made",
      "Cost and time to obtain a household item are unrelated to whether it is made or bought",
    ],
  },
];

const REASONING_FRAMES: ((rng: RNG, fact: (typeof REASONING_FACTS)[number]) => ScenarioMC)[] = [
  (rng, fact) => {
    const who = g6Name(rng);
    const p = g6Place(rng);
    return {
      prompt: `${who}'s family in ${p} finds that ${fact.situation}. Why?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = g6Place(rng);
    return {
      prompt: `In a household near ${p}, ${fact.situation}. What is the best explanation?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    return {
      prompt: `${who} is deciding how to crochet a new household article and notices that ${fact.situation}. Why does this matter?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    return {
      prompt: `${who} is puzzled to find that ${fact.situation}. What is the reason for this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const p = g6Place(rng);
    const situation = fact.situation.charAt(0).toUpperCase() + fact.situation.slice(1);
    return {
      prompt: `${situation}, in a home near ${p}. What causes this?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
  (rng, fact) => {
    const who = g6Name(rng);
    const p = g6Place(rng);
    return {
      prompt: `While comparing crocheted articles near ${p}, ${who} works out that ${fact.situation}. What is going on here?`,
      correct: fact.correct,
      wrong: fact.wrong,
      explanation: fact.correct,
    };
  },
];

const REASONING_TEMPLATES = expandScenarios(REASONING_FACTS, REASONING_FRAMES);

const FILL_BLANK_TEMPLATES: { before: string; after: string; correctAnswer: string; acceptedAnswers: string[] }[] = [
  { before: "The three household articles named in this sub-strand are mats, cleaning rugs and surface ", after: ".", correctAnswer: "wipers", acceptedAnswers: ["wipers"] },
  { before: "A mat is usually crocheted mainly in single crochet because it needs to be ", after: " and hold its shape underfoot.", correctAnswer: "firm", acceptedAnswers: ["firm", "durable", "sturdy"] },
  { before: "A cleaning rug needs a dense stitch because it must withstand repeated ", after: ".", correctAnswer: "scrubbing", acceptedAnswers: ["scrubbing"] },
  { before: "A surface wiper is often crocheted with more double crochet for a lighter, softer ", after: ".", correctAnswer: "texture", acceptedAnswers: ["texture"] },
  { before: "Making a usable household article by hand instead of buying one saves ", after: ".", correctAnswer: "money", acceptedAnswers: ["money", "cost"] },
  { before: "The pertinent and contemporary issue explicitly linked to this sub-strand is financial ", after: ".", correctAnswer: "literacy", acceptedAnswers: ["literacy"] },
  { before: "Crocheting a mat in a spiral shape from the centre outward avoids bulky ", after: " that could lift or curl.", correctAnswer: "seams", acceptedAnswers: ["seams"] },
  { before: "A cleaning rug should be made from yarn that can ", after: " moisture well.", correctAnswer: "absorb", acceptedAnswers: ["absorb"] },
  { before: "A surface wiper is usually made smaller and lighter than a ", after: ".", correctAnswer: "mat", acceptedAnswers: ["mat"] },
  { before: "Choosing the right stitch and size for each article's purpose is a sign of ", after: " and imagination.", correctAnswer: "creativity", acceptedAnswers: ["creativity"] },
  { before: "Showcasing finished crocheted articles to family or classmates promotes their ", after: " in daily routines.", correctAnswer: "adoption", acceptedAnswers: ["adoption", "use"] },
  { before: "A firm edge on a crocheted mat helps stop it from fraying or ", after: " underfoot.", correctAnswer: "curling", acceptedAnswers: ["curling"] },
  { before: "Producing crocheted household articles connects to artistic skills learnt in ", after: ".", correctAnswer: "Creative Arts", acceptedAnswers: ["Creative Arts"] },
  { before: "A cleaning rug is often smaller than a mat but thicker in ", after: ".", correctAnswer: "texture", acceptedAnswers: ["texture"] },
  { before: "Crocheting a surface wiper uses less yarn and time than crocheting a full-sized ", after: ".", correctAnswer: "mat", acceptedAnswers: ["mat"] },
  { before: "Prudent use of yarn and other resources while crocheting reflects the value of ", after: ".", correctAnswer: "integrity", acceptedAnswers: ["integrity", "Integrity"] },
  { before: "A household that regularly crochets its own articles can spend noticeably less over a ", after: " on shop-bought equivalents.", correctAnswer: "year", acceptedAnswers: ["year"] },
  { before: "Matching a dense stitch to a durable article and a lighter stitch to a delicate one is an example of good ", after: "-making decisions.", correctAnswer: "article", acceptedAnswers: ["article", "design"] },
  { before: "A mat placed at a doorway or beside a bed needs to lie ", after: " and stay in place.", correctAnswer: "flat", acceptedAnswers: ["flat"] },
  { before: "A well-made cleaning rug can replace the repeated cost of buying disposable cleaning ", after: ".", correctAnswer: "cloths", acceptedAnswers: ["cloths"] },
  { before: "Choosing yarn and stitch to suit a specific household article is part of good production ", after: ".", correctAnswer: "technique", acceptedAnswers: ["technique", "techniques"] },
  { before: "Mats, rugs and wipers are all examples of usable ", after: " articles made through crocheting.", correctAnswer: "household", acceptedAnswers: ["household"] },
  { before: "A wiper that is too thick and heavy is less practical for everyday ", after: "-wiping than a light one.", correctAnswer: "table", acceptedAnswers: ["table", "counter"] },
  { before: "Crocheting articles from yarn already available at home is a resourceful, cost-saving ", after: ".", correctAnswer: "practice", acceptedAnswers: ["practice"] },
  { before: "A durable cleaning rug reduces how often a household needs to spend money ", after: " a replacement.", correctAnswer: "buying", acceptedAnswers: ["buying", "purchasing"] },
  { before: "Choosing single crochet for a mat and double crochet for a wiper shows understanding of how ", after: " suits different purposes.", correctAnswer: "stitch", acceptedAnswers: ["stitch", "each stitch"] },
  { before: "The overall goal of learning to crochet household articles is to reduce the cost of ", after: " them.", correctAnswer: "purchasing", acceptedAnswers: ["purchasing", "buying"] },
  { before: "A crocheted article that is well made and useful can be proudly ", after: " to family or classmates.", correctAnswer: "showcased", acceptedAnswers: ["showcased", "shown"] },
  { before: "Deciding which article to crochet first often depends on which household ", after: " it will meet.", correctAnswer: "need", acceptedAnswers: ["need"] },
  { before: "Learning to crochet useful articles gives a learner a practical, money-saving ", after: ".", correctAnswer: "skill", acceptedAnswers: ["skill"] },
];

const PROPERTIES_SORT_PROMPTS = [
  "Sort each description by which crocheted household article it best describes.",
  "Group these descriptions under the correct household article.",
  "Decide which article each description below relates to, and sort it there.",
  "Sort each statement into the article it best fits.",
  "Place each description into the bucket for the article it describes.",
  "Read each description and sort it under the matching household article.",
];

const PROPERTIES_MATCH_PROMPT_TEMPLATES = [
  (article: string) => `Match each fact about a ${article} to why it is true.`,
  (article: string) => `Pair each fact about a ${article} with the reason it is true.`,
  (article: string) => `Connect each fact about a ${article} to why it makes sense.`,
  (article: string) => `Link each fact about a ${article} to its correct reason.`,
  (article: string) => `Match each fact below about a ${article} to the reason it is recommended.`,
  (article: string) => `Pair each fact about a ${article} with the explanation of why it holds true.`,
];

const MAKING_ORDER_PROMPTS = [
  "Arrange the steps for planning and making a crocheted household article in the correct order.",
  "Put these steps for planning and crocheting a household article in the right sequence.",
  "Sequence the steps for making a crocheted household article correctly.",
  "Arrange these steps in the order a maker would actually carry them out.",
  "Order these planning and making steps from first to last.",
  "Sort these steps into the correct order for making a crocheted household article.",
];

const COST_SCENARIO_PROMPT_TEMPLATES = [
  (who: string, article: string, shopPrice: number, yarnCost: number) =>
    `A shop-bought ${article} costs KSh ${shopPrice}. ${who} crochets one at home using KSh ${yarnCost} worth of yarn instead. How much money does ${who} save?`,
  (who: string, article: string, shopPrice: number, yarnCost: number) =>
    `${who} can buy a ${article} for KSh ${shopPrice}, or crochet one using KSh ${yarnCost} worth of yarn. How much does ${who} save by crocheting it?`,
  (who: string, article: string, shopPrice: number, yarnCost: number) =>
    `A ${article} from a shop costs KSh ${shopPrice}. ${who} instead crochets one, spending KSh ${yarnCost} on yarn. What is ${who}'s saving?`,
  (who: string, article: string, shopPrice: number, yarnCost: number) =>
    `Work out ${who}'s saving: a shop ${article} costs KSh ${shopPrice}, while crocheting one at home costs KSh ${yarnCost} in yarn.`,
  (who: string, article: string, shopPrice: number, yarnCost: number) =>
    `${who} compares prices: KSh ${shopPrice} for a shop-bought ${article}, versus KSh ${yarnCost} of yarn to crochet one at home. How much is saved?`,
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence about crocheted household articles.",
  "Fill in the missing word about crocheted household articles.",
  "Complete this sentence about mats, rugs and wipers.",
  "Supply the missing word in this sentence about crocheted household articles.",
  "Fill in the blank to complete the fact about crocheted household articles.",
  "Complete the missing word in this statement about crocheted household articles.",
];

export const crochetedHouseholdArticles: Skill = {
  id: "g6-ag-p-crocheted-household-articles",
  code: "P.2",
  subjectId: "agriculture-nutrition",
  strandId: "g6-ag-production-techniques",
  grade: 6,
  title: "Crocheted Household Articles",
  description: "Making household articles by crocheting — mats, cleaning rugs and surface wipers — choosing the right stitch for each, and the financial-literacy benefit of making rather than buying.",
  generate(rng) {
    const branch = randChoice(rng, ["properties-sort", "properties-match", "making-order", "cost-scenario", "reasoning", "fill-blank"] as const);
    const hint = "Match the article to its purpose: a mat and cleaning rug need a dense, durable stitch; a surface wiper can use a lighter, more open one.";

    if (branch === "properties-sort") {
      const articles: Article[] = ["mat", "rug", "wiper"];
      const chosen = shuffle(rng, ARTICLE_FACTS).slice(0, 9);
      const items = chosen.map((f) => ({ id: f.id, label: f.label }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((f) => (correctBucket[f.id] = f.article));
      return {
        kind: "categorize",
        prompt: randChoice(rng, PROPERTIES_SORT_PROMPTS),
        items,
        buckets: articles.map((a) => ({ id: a, label: ARTICLE_LABEL[a] })),
        correctBucket,
        hint,
        explanation: chosen.map((f) => `"${f.label}" — ${ARTICLE_LABEL[f.article]}, because ${f.reason}.`).join(" "),
      };
    }

    if (branch === "properties-match") {
      const article = randChoice(rng, ["mat", "rug", "wiper"] as const);
      const pool = ARTICLE_FACTS.filter((f) => f.article === article);
      const chosen = shuffle(rng, pool).slice(0, Math.min(5, pool.length));
      const tokens = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.label })));
      const targets = shuffle(rng, chosen.map((f) => ({ id: f.id, label: f.reason.charAt(0).toUpperCase() + f.reason.slice(1) })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((f) => (correctMap[f.id] = f.id));
      return {
        kind: "click-match",
        prompt: randChoice(rng, PROPERTIES_MATCH_PROMPT_TEMPLATES)(ARTICLE_LABEL[article].toLowerCase()),
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((f) => `${f.label} — ${f.reason}.`).join(" "),
      };
    }

    if (branch === "making-order") {
      const shuffled = shuffle(rng, MAKING_STEPS);
      return {
        kind: "ordering",
        prompt: randChoice(rng, MAKING_ORDER_PROMPTS),
        instruction: "Click them in order.",
        items: shuffled.map((s) => ({ id: s.id, label: s.label })),
        correctOrder: MAKING_STEPS.map((s) => s.id),
        hint: "Decide what is needed first, then choose the matching stitch, gather materials, crochet, finish the edges, and showcase it last.",
        explanation: MAKING_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "cost-scenario") {
      // Explicit financial-literacy PCI branch, numeric so it is exempt from the text-template
      // pool floor by construction.
      const who = g6Name(rng);
      const shopPrice = randInt(rng, 300, 900);
      const yarnCost = randInt(rng, 80, 250);
      const savings = shopPrice - yarnCost;
      const article = randChoice(rng, ["mat", "rug", "wiper"] as const);
      return {
        kind: "fill-blank",
        prompt: randChoice(rng, COST_SCENARIO_PROMPT_TEMPLATES)(who, ARTICLE_LABEL[article].toLowerCase(), shopPrice, yarnCost),
        before: "KSh ",
        after: "",
        correctAnswer: String(savings),
        acceptedAnswers: [String(savings)],
        inputMode: "numeric",
        hint: `Subtract the cost of the yarn from the shop price: ${shopPrice} − ${yarnCost}.`,
        explanation: `${shopPrice} − ${yarnCost} = KSh ${savings} saved — crocheting a usable household article at home instead of buying one is a direct financial-literacy benefit of this skill.`,
      };
    }

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildScenarioChoices(rng, q);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_BLANK_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: fb.acceptedAnswers,
      inputMode: "text",
      hint,
      explanation: `The sentence reads: "${fb.before}${fb.correctAnswer}${fb.after}"`,
    };
  },
};
