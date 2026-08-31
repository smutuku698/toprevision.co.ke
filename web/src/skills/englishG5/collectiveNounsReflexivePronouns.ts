import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { name, choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 2.0 National Celebrations, sub-strand 2.3 Word Class: Collective Nouns /
// Reflexive Pronouns. See curriculum-reference/grade-5/english.json.

const REFLEXIVES = ["myself", "yourself", "himself", "herself", "itself", "ourselves", "yourselves", "themselves"] as const;
type Reflexive = typeof REFLEXIVES[number];

// group -> collective noun (Grade-5 common set)
const COLLECTIVES: { collective: string; group: string; example: string }[] = [
  { collective: "team", group: "players", example: "The football team ran onto the pitch." },
  { collective: "crowd", group: "people gathered", example: "A huge crowd watched the Jamhuri Day parade." },
  { collective: "class", group: "pupils", example: "The whole class sang the national anthem." },
  { collective: "herd", group: "cattle", example: "A herd of cattle crossed the road slowly." },
  { collective: "flock", group: "birds or sheep", example: "A flock of birds flew over the stadium." },
  { collective: "swarm", group: "bees or insects", example: "A swarm of bees settled on the tree." },
  { collective: "bunch", group: "bananas or flowers", example: "She carried a bunch of flowers to the ceremony." },
  { collective: "pride", group: "lions", example: "A pride of lions rested under the acacia tree." },
  { collective: "school", group: "fish", example: "A school of fish darted through the water." },
  { collective: "choir", group: "singers", example: "The school choir performed at the concert." },
  { collective: "committee", group: "organisers", example: "The committee planned the Labour Day event." },
  { collective: "family", group: "relatives", example: "The whole family gathered for the celebration." },
  { collective: "army", group: "soldiers", example: "The army marched past the guest of honour." },
  { collective: "fleet", group: "ships or vehicles", example: "A fleet of buses brought the visitors." },
  { collective: "band", group: "musicians", example: "The band played as the flag was raised." },
  { collective: "troop", group: "scouts or monkeys", example: "A troop of scouts led the march." },
];

const REFLEX_TPL: { answer: Reflexive; before: string; after: string }[] = [
  { answer: "myself", before: "I decorated the classroom ", after: " for the celebration." },
  { answer: "yourself", before: "You should be proud of ", after: " for reciting so well." },
  { answer: "himself", before: "Baraka carried the flag ", after: " during the parade." },
  { answer: "herself", before: "Amina prepared the speech ", after: " without any help." },
  { answer: "itself", before: "The old drum repaired ", after: " — actually, a carpenter fixed it." },
  { answer: "ourselves", before: "We organised the concert ", after: " as a class." },
  { answer: "yourselves", before: "You two can seat ", after: " in the front row." },
  { answer: "themselves", before: "The dancers taught ", after: " the new routine." },
  { answer: "myself", before: "I hurt ", after: " while hanging the ribbons." },
  { answer: "herself", before: "Wanjiru introduced ", after: " to the guest of honour." },
  { answer: "himself", before: "Otieno wrote the poem ", after: " for National Heroes Day." },
  { answer: "ourselves", before: "We enjoyed ", after: " at the Jamhuri Day parade." },
];

function reflexCluster(a: Reflexive): string[] {
  // confusable: wrong number (self/selves) and wrong person
  const map: Record<Reflexive, Reflexive[]> = {
    myself: ["yourself", "ourselves", "himself"],
    yourself: ["yourselves", "myself", "herself"],
    himself: ["herself", "themselves", "yourself"],
    herself: ["himself", "themselves", "myself"],
    itself: ["themselves", "himself", "herself"],
    ourselves: ["myself", "yourselves", "themselves"],
    yourselves: ["yourself", "ourselves", "themselves"],
    themselves: ["ourselves", "himself", "yourselves"],
  };
  return map[a];
}

export const collectiveNounsReflexivePronouns: Skill = {
  id: "g5-eng-grammar-collective-nouns-reflexive-pronouns",
  code: "LU.2",
  subjectId: "english",
  strandId: "g5-eng-grammar",
  grade: 5,
  title: "Collective Nouns and Reflexive Pronouns",
  description: "Identify and use collective nouns (team, crowd, herd, flock...) and reflexive pronouns (myself, herself, ourselves...) correctly in sentences.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-reflex", "fill-collective", "sort", "match", "order", "reason"] as const);

    if (branch === "mc-reflex") {
      const t = randChoice(rng, REFLEX_TPL);
      const { choices, correctIndex } = mcFromCluster(rng, t.answer, reflexCluster(t.answer));
      return {
        kind: "multiple-choice",
        prompt: `${choosePrompt(rng, "the correct reflexive pronoun")}\n"${t.before}____${t.after}"`,
        choices,
        correctIndex,
        layout: "row",
        hint: "Match the reflexive pronoun to the subject (I, you, he, she, we, they) — and check singular '-self' or plural '-selves'.",
        explanation: `"${t.answer}" is correct — it refers back to the subject of the sentence. Watch two common errors: wrong person (using "himself" when the subject is "she"), and wrong number ("themself" or "ourself" are not standard — use "themselves"/"ourselves").`,
      };
    }

    if (branch === "fill-collective") {
      const c = randChoice(rng, COLLECTIVES);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the collective noun for this group"),
        before: "a ",
        after: ` of ${c.group}`,
        correctAnswer: c.collective,
        acceptedAnswers: [c.collective],
        inputMode: "text",
        hint: `It is the special word for a group of ${c.group}.`,
        explanation: `"a ${c.collective} of ${c.group}" — a collective noun names a whole group as one thing. Example: ${c.example}`,
      };
    }

    if (branch === "sort") {
      const cols = shuffle(rng, COLLECTIVES).slice(0, 4).map((c) => c.collective);
      const refs = shuffle(rng, [...REFLEXIVES]).slice(0, 4);
      const items = shuffle(rng, [
        ...cols.map((w, i) => ({ id: `c${i}`, label: w, kind: "collective" })),
        ...refs.map((w, i) => ({ id: `r${i}`, label: w, kind: "reflexive" })),
      ]);
      const correctBucket: Record<string, string> = {};
      items.forEach((it) => (correctBucket[it.id] = it.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each word is a collective noun or a reflexive pronoun"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "collective", label: "Collective noun (names a group)" },
          { id: "reflexive", label: "Reflexive pronoun (ends in -self / -selves)" },
        ],
        correctBucket,
        hint: "Reflexive pronouns always end in -self or -selves. Collective nouns name a group of people, animals or things.",
        explanation: "Collective nouns: team, crowd, herd, flock... Reflexive pronouns: myself, yourself, himself, herself, itself, ourselves, yourselves, themselves.",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, COLLECTIVES).slice(0, 5);
      const tokens = shuffle(rng, pool.map((c) => ({ id: c.collective, label: c.collective })));
      const targets = shuffle(rng, pool.map((c) => ({ id: c.collective, label: `group of ${c.group}` })));
      const correctMap: Record<string, string> = {};
      pool.forEach((c) => (correctMap[c.collective] = c.collective));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "collective noun to the group it names"),
        tokens,
        targets,
        correctMap,
        hint: "Picture the animals or people the word describes.",
        explanation: pool.map((c) => `A ${c.collective} = a group of ${c.group}.`).join(" "),
      };
    }

    if (branch === "order") {
      const c = randChoice(rng, COLLECTIVES);
      const words = c.example.replace(/\.$/, "").split(" ");
      const items = words.map((w, i) => ({ id: `${i}-${w}`, label: w }));
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the words to make a correct sentence with a collective noun"),
        instruction: "Click the words in the correct order.",
        items: shuffle(rng, items),
        correctOrder: items.map((i) => i.id),
        hint: `The sentence uses the collective noun "${c.collective}".`,
        explanation: `Correct sentence: "${c.example}"`,
      };
    }

    // reason — Apply: did the person act alone (reflexive) or is a whole group meant (collective)?
    const scen: { s: string; q: string; answer: string; cluster: string[] }[] = [
      { s: `${name(rng)} planned the whole Jamhuri Day display without asking anyone for help.`, q: `Complete: "${name(rng)} planned it all by ___." Which word fits?`, answer: "herself", cluster: ["himself", "themselves", "myself"] },
      { s: `The pupils in Grade 5 sang together as one during the national anthem.`, q: `Which word names them as one group: "The whole ___ sang."?`, answer: "class", cluster: ["crowd", "team", "choir"] },
      { s: `Otieno cut the ribbon with no one holding it for him.`, q: `Complete: "Otieno cut the ribbon ___." Which word fits?`, answer: "himself", cluster: ["herself", "yourself", "themselves"] },
      { s: `Many singers stood together and performed at the concert.`, q: `Which word names them as one group: "The school ___ performed."?`, answer: "choir", cluster: ["band", "team", "committee"] },
      { s: `The Grade 5 dancers practised on their own, teaching each other.`, q: `Complete: "The dancers taught ___ the routine." Which word fits?`, answer: "themselves", cluster: ["ourselves", "himself", "yourselves"] },
      { s: `A large group of cattle moved across the field during the celebration.`, q: `Which word names the group: "A ___ of cattle crossed."?`, answer: "herd", cluster: ["flock", "pride", "swarm"] },
      { s: `We set up the whole classroom for the party with no help from the teacher.`, q: `Complete: "We decorated the room ___." Which word fits?`, answer: "ourselves", cluster: ["myself", "yourselves", "themselves"] },
      { s: `Many people gathered at the stadium to watch the parade.`, q: `Which word names them: "A huge ___ watched the parade."?`, answer: "crowd", cluster: ["class", "team", "choir"] },
      { s: `You alone finished writing the invitation cards.`, q: `Complete: "You wrote all the cards by ___." Which word fits?`, answer: "yourself", cluster: ["yourselves", "myself", "himself"] },
      { s: `A group of soldiers marched past the guest of honour.`, q: `Which word names them: "The ___ marched past."?`, answer: "army", cluster: ["fleet", "troop", "committee"] },
      { s: `The organisers met to decide the Labour Day programme.`, q: `Which word names them: "The ___ planned the programme."?`, answer: "committee", cluster: ["choir", "crowd", "band"] },
      { s: `The kitten cleaned its own fur while the family watched.`, q: `Complete: "The kitten cleaned ___." Which word fits?`, answer: "itself", cluster: ["himself", "themselves", "herself"] },
    ];
    const sc = randChoice(rng, scen);
    const { choices, correctIndex } = mcFromCluster(rng, sc.answer, sc.cluster);
    return {
      kind: "multiple-choice",
      prompt: scenarioPrompt(rng, sc.s, sc.q),
      choices,
      correctIndex,
      layout: "row",
      hint: "If the situation says someone acted alone, use a reflexive pronoun. If a whole group is meant, use a collective noun.",
      explanation: `"${sc.answer}" is correct here. ${REFLEXIVES.includes(sc.answer as Reflexive) ? "A reflexive pronoun shows the subject did the action to or by itself." : "A collective noun names the whole group as a single unit."}`,
    };
  },
};
