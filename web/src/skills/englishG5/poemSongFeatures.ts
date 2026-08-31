import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { choosePrompt, fillPrompt, sortPrompt, matchPrompt, orderPrompt, scenarioPrompt, mcFromCluster } from "./g5EngShared";

// KICD Grade 5 English, Theme 12.0 Environmental Pollution, sub-strand 12.2 Intensive Reading:
// Poems, Songs and Tongue Twisters. Focus: create mental images, infer meaning of words from context,
// factual and inferential questions, relate to experience. See curriculum-reference/grade-5/english.json.

const FEATURES: { name: string; def: string }[] = [
  { name: "stanza", def: "a group of lines in a poem, with a space before the next group" },
  { name: "line", def: "one row of words in a poem" },
  { name: "rhyme", def: "words that end with the same sound, like 'stream' and 'clean'" },
  { name: "rhythm", def: "the beat you feel when the poem is read aloud" },
  { name: "repetition", def: "a word or line said again for effect" },
  { name: "title", def: "the name of the poem, at the top" },
  { name: "mood", def: "the feeling the poem gives the reader, such as sad or hopeful" },
  { name: "message", def: "the main idea or lesson the poet wants you to take away" },
];

const POEM = `Keep Our River Clean
The river ran so bright and blue,
the fish could see the sky.
Then bottles came, and bags, and shoes,
and slowly it ran dry.
Keep our river clean, my friend,
keep our river clean.
For water is a gift to share,
the best we've ever seen.`;

const POEM_Q: { q: string; answer: string; wrong: string[]; kind: "factual" | "inferential" }[] = [
  { q: "How many stanzas does the poem have?", answer: "2", wrong: ["1", "4", "8"], kind: "factual" },
  { q: "Which line is repeated?", answer: "keep our river clean", wrong: ["the fish could see the sky", "and slowly it ran dry", "the river ran so bright and blue"], kind: "factual" },
  { q: "Which two words rhyme in the first stanza?", answer: "sky and dry", wrong: ["blue and shoes", "river and friend", "clean and share"], kind: "factual" },
  { q: "What does 'a gift to share' tell us about how the poet feels about water?", answer: "the poet thinks water is precious and belongs to everyone", wrong: ["the poet thinks water is worthless", "the poet wants to sell water", "the poet is afraid of water"], kind: "inferential" },
  { q: "What is the mood at the end of the poem?", answer: "hopeful and caring", wrong: ["angry and bitter", "bored and sleepy", "frightened"], kind: "inferential" },
  { q: "What is the poem's main message?", answer: "we should protect the river from pollution", wrong: ["fish can fly", "rivers should be filled with bottles", "swimming is dangerous"], kind: "inferential" },
];

const KINDS: { text: string; kind: "poem" | "song" | "tongue twister" }[] = [
  { text: "A short piece with a strong beat that is sung to a tune.", kind: "song" },
  { text: "A piece written in lines and stanzas, often with rhyme, meant to be read or recited.", kind: "poem" },
  { text: "A tricky phrase with many similar sounds, said fast to practise pronunciation: 'six slippery snails slid slowly'.", kind: "tongue twister" },
];

export const poemSongFeatures: Skill = {
  id: "g5-eng-reading-poem-song-features",
  code: "R.12",
  subjectId: "english",
  strandId: "g5-eng-reading",
  grade: 5,
  title: "Reading Poems, Songs and Tongue Twisters",
  description: "Name the features of a poem (stanza, line, rhyme, rhythm, repetition, title, mood, message), answer factual and inferential questions about a poem, and tell poems, songs and tongue twisters apart.",
  generate(rng) {
    const branch = randChoice(rng, ["mc-poemq", "fill-feature", "sort-kind", "match", "order-stanza", "reason-message"] as const);

    if (branch === "mc-poemq") {
      const q = randChoice(rng, POEM_Q.filter((x) => x.kind === "factual" || rng() < 0.6));
      const { choices, correctIndex } = mcFromCluster(rng, q.answer, q.wrong, 3);
      return {
        kind: "multiple-choice",
        passage: POEM,
        prompt: `${choosePrompt(rng, "the best answer")} ${q.q}`,
        choices,
        correctIndex,
        layout: "row",
        hint: q.kind === "factual" ? "Look back at the poem and count or find the answer." : "Think about the feeling and the idea behind the words.",
        explanation: `${q.answer}. ${q.kind === "inferential" ? "This is an inference — worked out from the words and the tone." : "This is stated or can be counted in the poem."}`,
      };
    }

    if (branch === "fill-feature") {
      const f = randChoice(rng, FEATURES);
      return {
        kind: "fill-blank",
        prompt: fillPrompt(rng, "the poem feature described (one word)"),
        before: `${f.def} — this feature is called a `,
        after: ".",
        correctAnswer: f.name,
        acceptedAnswers: [f.name],
        inputMode: "text",
        hint: "Features include: stanza, line, rhyme, rhythm, repetition, title, mood, message.",
        explanation: `That feature is the ${f.name}: ${f.def}.`,
      };
    }

    if (branch === "sort-kind") {
      const items = shuffle(rng, KINDS.map((k, i) => ({ id: `k${i}`, label: k.text })));
      const correctBucket: Record<string, string> = {};
      KINDS.forEach((k, i) => (correctBucket[`k${i}`] = k.kind));
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether each description is a poem, a song or a tongue twister"),
        items,
        buckets: [
          { id: "poem", label: "Poem" },
          { id: "song", label: "Song" },
          { id: "tongue twister", label: "Tongue twister" },
        ],
        correctBucket,
        hint: "A song has a tune. A poem has lines and stanzas. A tongue twister repeats similar sounds and is hard to say fast.",
        explanation: "Poem: read or recited, in lines and stanzas. Song: sung to a tune. Tongue twister: practises pronunciation with repeated sounds.",
      };
    }

    if (branch === "match") {
      const pool = shuffle(rng, FEATURES).slice(0, 5);
      const tokens = shuffle(rng, pool.map((f) => ({ id: f.name, label: f.name })));
      const targets = shuffle(rng, pool.map((f) => ({ id: f.name, label: f.def })));
      const correctMap: Record<string, string> = {};
      pool.forEach((f) => (correctMap[f.name] = f.name));
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "poem feature to its meaning"),
        tokens,
        targets,
        correctMap,
        hint: "Some features you can see (line, stanza, title); some you hear (rhyme, rhythm); some you feel (mood, message).",
        explanation: pool.map((f) => `${f.name}: ${f.def}`).join("  "),
      };
    }

    if (branch === "order-stanza") {
      const lines = [
        { id: "l1", label: "The river ran so bright and blue," },
        { id: "l2", label: "the fish could see the sky." },
        { id: "l3", label: "Then bottles came, and bags, and shoes," },
        { id: "l4", label: "and slowly it ran dry." },
      ];
      return {
        kind: "ordering",
        prompt: orderPrompt(rng, "the lines of the first stanza"),
        instruction: "Click the lines in the correct order.",
        items: shuffle(rng, lines),
        correctOrder: ["l1", "l2", "l3", "l4"],
        hint: "Follow the story: the river is clean, then rubbish arrives, then it dries up. Watch the rhyme (sky / dry).",
        explanation: "First stanza order: 'The river ran so bright and blue, / the fish could see the sky. / Then bottles came, and bags, and shoes, / and slowly it ran dry.'",
      };
    }

    // reason — infer the message / mood
    const q = randChoice(rng, POEM_Q.filter((x) => x.kind === "inferential"));
    const { choices, correctIndex } = mcFromCluster(rng, q.answer, q.wrong, 3);
    return {
      kind: "multiple-choice",
      passage: POEM,
      prompt: scenarioPrompt(rng, "Think about the poem as a whole.", q.q),
      choices,
      correctIndex,
      layout: "list",
      hint: "The message and mood come from the whole poem, especially the repeated line and the ending.",
      explanation: `${q.answer}.`,
    };
  },
};
