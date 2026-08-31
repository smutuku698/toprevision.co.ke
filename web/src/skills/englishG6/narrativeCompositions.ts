import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";
import { KENYAN_NAMES } from "./writingSharedA";

// Source: curriculum-reference/grade-6/english.json, Writing strand, sub-strand "Creative
// Writing — Narrative Compositions (merged: Cultural and Religious Celebrations 2.4.1, Our
// Tourist Attractions 5.4.1, The Farm - Animal Safety and Care 8.4.1)". The three
// learningExperiences entries (one per merged theme) are used below as three scenario families —
// cultural/religious celebrations, tourist attractions, and farm animal safety — so the skill
// carries real depth across all three source themes, not a single-theme narrow version.
//
// Theme 5's learningExperiences bullet explicitly quotes its own expressions (fixed phrase
// "catch fire", simile "as fast as lightning", metaphor "the boy was a fox — he was so cunning",
// proverb "prevention is better than cure", idiom "get into hot water", phrasal verb "care for")
// — used verbatim below. Themes 2 and 8's writing bullets ask for "creative language including
// proverbs/similes/idioms" without listing them inline, so their expressions are pulled from the
// same theme's own Listening & Speaking sub-strand (2.1.1 / 8.1.1) in this same design document —
// the same real-world theme, not invented content.

type Theme = "cultural" | "tourist" | "animal";
const THEME_LABEL: Record<Theme, string> = {
  cultural: "a cultural or religious celebration",
  tourist: "a visit to a tourist attraction",
  animal: "caring for animals on the farm",
};

type ExprType = "simile" | "metaphor" | "idiom" | "proverb" | "phrasal verb" | "fixed phrase";

const EXPRESSIONS: { theme: Theme; type: ExprType; text: string; meaning: string }[] = [
  // Theme 2 — Cultural and Religious Celebrations (from L&S 2.1.1, same theme)
  { theme: "cultural", type: "metaphor", text: "Peter is a giraffe — he is so tall", meaning: "describes someone who is very tall" },
  { theme: "cultural", type: "idiom", text: "a red letter day", meaning: "a very special and memorable day" },
  { theme: "cultural", type: "idiom", text: "kill two birds with one stone", meaning: "achieving two things with a single action" },
  { theme: "cultural", type: "idiom", text: "feel at home", meaning: "to feel comfortable, welcome, and relaxed" },
  { theme: "cultural", type: "proverb", text: "charity begins at home", meaning: "we should care for our own family and community first" },
  // Theme 5 — Our Tourist Attractions (quoted directly in the writing sub-strand's own text, plus
  // extra depth from L&S 5.1.1, same theme)
  { theme: "tourist", type: "fixed phrase", text: "catch fire", meaning: "to start burning" },
  { theme: "tourist", type: "simile", text: "as fast as lightning", meaning: "extremely fast" },
  { theme: "tourist", type: "metaphor", text: "the boy was a fox — he was so cunning", meaning: "describes someone very clever or sly" },
  { theme: "tourist", type: "proverb", text: "prevention is better than cure", meaning: "it is wiser to stop a problem before it happens than to fix it afterwards" },
  { theme: "tourist", type: "idiom", text: "get into hot water", meaning: "to get into trouble" },
  { theme: "tourist", type: "phrasal verb", text: "care for", meaning: "to look after someone or something" },
  { theme: "tourist", type: "simile", text: "as brave as a lion", meaning: "very brave" },
  { theme: "tourist", type: "proverb", text: "the early bird catches the worm", meaning: "those who act early gain an advantage" },
  { theme: "tourist", type: "idiom", text: "let the cat out of the bag", meaning: "to accidentally reveal a secret" },
  // Theme 8 — The Farm: Animal Safety and Care (from L&S 8.1.1, same theme)
  { theme: "animal", type: "simile", text: "as gentle as a lamb", meaning: "very calm and gentle" },
  { theme: "animal", type: "simile", text: "as mischievous as a monkey", meaning: "playfully naughty" },
  { theme: "animal", type: "metaphor", text: "the girl is a lamb — she is so gentle", meaning: "describes someone very gentle" },
  { theme: "animal", type: "idiom", text: "would not hurt a fly", meaning: "describes someone very gentle and harmless" },
  { theme: "animal", type: "idiom", text: "curiosity killed the cat", meaning: "being too curious can get you into trouble" },
  { theme: "animal", type: "proverb", text: "a barking dog never bites", meaning: "people who make a lot of noise or threats rarely act on them" },
  { theme: "animal", type: "proverb", text: "it is no use crying over spilt milk", meaning: "there is no point being upset about something that has already happened and cannot be changed" },
  { theme: "animal", type: "phrasal verb", text: "look after", meaning: "to take care of" },
];

// Apply-tier: identifying which expression fits a specific narrative moment — the moment's detail
// is load-bearing (stripping it out leaves no way to pick the right expression from same-theme
// distractors, which all share the topic but not the meaning).
const SCENARIO_MOMENTS: { theme: Theme; build: (name: string) => string; correct: string }[] = [
  {
    theme: "cultural",
    build: (n) => `In your narrative about ${n}'s cousin's traditional wedding, two late-arriving aunties also happen to bring the extra chairs that were badly needed, solving the seating problem the moment they walk in. Which expression best describes what they did?`,
    correct: "kill two birds with one stone",
  },
  {
    theme: "cultural",
    build: (n) => `You want to describe the day ${n}'s grandmother's homecoming ceremony was held, calling it especially memorable because the whole extended family gathered for the first time in ten years. Which expression best fits this?`,
    correct: "a red letter day",
  },
  {
    theme: "cultural",
    build: (n) => `In your narrative, describe how ${n}, though visiting relatives for the first time, is made so welcome by the singing and food that they no longer feel like a stranger. Which expression fits best?`,
    correct: "feel at home",
  },
  {
    theme: "cultural",
    build: (n) => `You want to explain why ${n}'s family always helps their own relatives with school fees before helping others outside the family. Which proverb best fits this idea in your narrative?`,
    correct: "charity begins at home",
  },
  {
    theme: "tourist",
    build: (n) => `In ${n}'s narrative about a trip to a game park, describe the gazelle that bolted the instant it noticed the tourists' vehicle. Which simile best fits this moment?`,
    correct: "as fast as lightning",
  },
  {
    theme: "tourist",
    build: (n) => `${n}'s narrative describes a park ranger who notices the smouldering dry grass near the campsite before flames can spread. Which fixed phrase best completes 'the dry grass nearly ___'?`,
    correct: "catch fire",
  },
  {
    theme: "tourist",
    build: (n) => `In ${n}'s narrative, a mischievous character in the tour group tricks the guide with a false story, then quietly slips away with the last window seat on the bus. Which metaphor fits this cunning character?`,
    correct: "the boy was a fox — he was so cunning",
  },
  {
    theme: "tourist",
    build: (n) => `${n} wants the narrative to explain why the tour guide always checks each visitor's water bottle and sunscreen before a hike, rather than waiting for someone to fall ill. Which proverb fits this idea?`,
    correct: "prevention is better than cure",
  },
  {
    theme: "tourist",
    build: (n) => `In ${n}'s narrative, a tourist who ignores the ranger's warning and wanders off alone ends up needing to be rescued from an angry buffalo. Which idiom fits what happened to them?`,
    correct: "get into hot water",
  },
  {
    theme: "animal",
    build: (n) => `In ${n}'s narrative about the farm, describe the old sheepdog that never once snaps at the lambs, even when they tug at its ears. Which idiom best fits this dog's character?`,
    correct: "would not hurt a fly",
  },
  {
    theme: "animal",
    build: (n) => `You want to describe ${n}'s pet lamb, which always stands calmly and lets the children pet it. Which simile fits this lamb?`,
    correct: "as gentle as a lamb",
  },
  {
    theme: "animal",
    build: (n) => `In ${n}'s narrative, a character keeps sneaking into the barn to peek at the new calf, and one day gets nudged over by the protective mother cow. Which proverb fits what happened?`,
    correct: "curiosity killed the cat",
  },
];

const SAMPLE_PARAGRAPHS: { theme: Theme; better: string; worse: string }[] = [
  {
    theme: "cultural",
    better: "Early that Saturday morning, the whole family gathered at grandmother's compound for the traditional wedding ceremony. Aunties arranged the seats while the choir practised songs under the mango tree. By midday, drums were beating and everyone danced to welcome the bride.",
    worse: "The wedding was nice. I like mangoes. Later there was a football match at school and my friend scored a goal.",
  },
  {
    theme: "cultural",
    better: "On the morning of Idd-al-Fitr, we put on our best clothes and walked to the mosque together as a family. After prayers, we visited three neighbours' homes to share sweets and good wishes. In the evening, everyone gathered at our house for a big shared meal.",
    worse: "Idd is a holiday. My uncle has a car. We ate rice, and then it rained the next week and the maize grew taller.",
  },
  {
    theme: "cultural",
    better: "Our church choir had been practising the Christmas carols for weeks before the big day. When the service finally began, the whole congregation sang together and the children performed a short nativity play. Afterward, everyone shared a meal outside the church.",
    worse: "Christmas came. Some people like chicken more than beef. Our neighbour's cow gave birth in October, which was surprising.",
  },
  {
    theme: "cultural",
    better: "As the eulogy for our great-grandfather began, the whole family fell silent to listen. One by one, relatives stood to share memories of his kindness. By the time the reception began, there was as much laughter as there had been tears.",
    worse: "Funerals are sad sometimes. I have a cousin who lives in Mombasa. The reception had food, and my shoes were new.",
  },
  {
    theme: "tourist",
    better: "The safari van left the gate just as the sun was rising over the savannah. Within minutes, our guide pointed out a pride of lions resting under an acacia tree. By the end of the morning drive, we had spotted four of the Big Five.",
    worse: "Safaris are in national parks. My friend has a bicycle. Some lions are bigger than others, and I forgot my hat that day.",
  },
  {
    theme: "tourist",
    better: "We began our climb up the mountain slope just after breakfast, following the guide's steady pace. Halfway up, we stopped to rest and admire the valley stretching below us. By the time we reached the top, the whole group cheered together.",
    worse: "Mountains are tall. There was a shop near the gate. My sandals were uncomfortable, and later we watched television.",
  },
  {
    theme: "tourist",
    better: "At the museum, our first stop was the hall of traditional artefacts from different Kenyan communities. The guide explained how each carved stool told a story about the family that owned it. We left with pages of notes for our school project.",
    worse: "Museums have old things. My sister likes drawing. The bus was blue, and we ate lunch somewhere before going home.",
  },
  {
    theme: "tourist",
    better: "The boat ride to the coral reef began calmly, with clear blue water on every side. Halfway there, a pod of dolphins surfaced beside us, and everyone rushed to the edge of the boat to see. By the time we reached the reef, we could barely contain our excitement to snorkel.",
    worse: "Boats float on water. My uncle sells fish. It was hot that day, and someone's phone battery died.",
  },
  {
    theme: "animal",
    better: "Every morning before school, the herder checks that the goats' pen is properly latched and their water trough is full. Last week, a loose latch let two goats wander toward the road, so the check now happens twice. The lesson stuck: a few extra seconds of care prevent a dangerous morning.",
    worse: "Goats eat grass. My shoes are old. Yesterday it was cloudy, and someone in class forgot their pencil.",
  },
  {
    theme: "animal",
    better: "When the new calf was born, the family kept it separate from the herd for the first few days to keep it safe and warm. Slowly, they let it graze closer to its mother under careful watch. By the second week, the calf was strong enough to join the rest of the herd.",
    worse: "Cows are big animals. There is a shop near the farm. My cousin likes tea, and the fence needs paint.",
  },
  {
    theme: "animal",
    better: "The vet arrived early to check on the sick hen, examining its feathers and beak carefully before giving it medicine. The hen was kept separate from the rest of the flock for a week. By the following Sunday, it was back to pecking happily with the others.",
    worse: "Hens lay eggs. The market is far. My brother plays chess, and there was a strong wind on Tuesday.",
  },
  {
    theme: "animal",
    better: "Before letting the dog off its leash near the road, its owner always checks both directions for passing motorbikes. One careless afternoon without checking nearly ended badly, so now the habit never slips. A safe farm starts with small habits like this one.",
    worse: "Dogs bark loudly. My aunt visited last month. The gate is green, and the maize needs weeding soon.",
  },
];

const WHY_PLAN: { build: (name: string, theme: string) => string; correct: string; wrongs: string[] }[] = [
  {
    build: (n, t) => `Before writing a narrative about ${t}, ${n} spends five minutes listing the main events in order. Why does this help?`,
    correct: "It helps organise ideas logically before writing, so the story flows instead of jumping around.",
    wrongs: ["It makes the composition longer automatically.", "It guarantees perfect spelling in the final draft.", "It is only useful for very short compositions."],
  },
  {
    build: (n, t) => `${n} skips planning and starts writing the narrative about ${t} straight away. What is the most likely problem?`,
    correct: "The ideas may come out in a confused order, making the story hard to follow.",
    wrongs: ["The composition will definitely be shorter than 160 words.", "The teacher will not be able to tell it apart from a planned one.", "Skipping planning always makes the story more creative."],
  },
  {
    build: (n, t) => `During group discussion before writing about ${t}, ${n} and classmates share different ideas and experiences. Why is this step useful?`,
    correct: "It gives more ideas and details to choose from before drafting.",
    wrongs: ["It replaces the need to write a composition at all.", "It guarantees every group member writes the exact same story.", "It is only useful for correcting spelling mistakes."],
  },
  {
    build: (n, t) => `${n} writes guiding points before drafting the full narrative about ${t}. What is the purpose of these guiding points?`,
    correct: "They act as a simple outline so the composition stays organised and on topic.",
    wrongs: ["They are submitted instead of the final composition.", "They must use full, complete sentences like the final draft.", "They are only needed if the composition is a formal letter."],
  },
  {
    build: (n, t) => `After the class collaborates on the first paragraph of a narrative about ${t}, ${n} completes the rest individually. Why does the class write the first paragraph together?`,
    correct: "It models a strong, organised opening that everyone can build on independently.",
    wrongs: ["It means the whole class will get identical marks.", "It removes the need for anyone to plan the rest of the story.", "It is done only to save time, with no effect on quality."],
  },
  {
    build: (n, t) => `${n} proofreads the narrative about ${t} before handing it in. What is ${n} mainly checking for at this stage?`,
    correct: "Spelling, punctuation, and grammar mistakes, now that the ideas are already down.",
    wrongs: ["Whether the story is exactly the correct length.", "Whether classmates will enjoy the topic.", "Whether the ink colour matches the rest of the class."],
  },
  {
    build: (n, t) => `${n}'s partner peer-critiques the narrative about ${t} before the final copy is submitted. What should the partner mainly judge it on?`,
    correct: "Coherence, creativity, relevance to the topic, and accuracy of language.",
    wrongs: ["Only how neat the handwriting looks.", "Only how long the composition is.", "Only whether the same expressions were used as in the partner's own story."],
  },
  {
    build: (n, t) => `${n} organises the narrative about ${t} into a clear beginning, middle, and end instead of listing events randomly. Why does this matter?`,
    correct: "It helps the reader follow the story logically from start to finish.",
    wrongs: ["It is only required for compositions longer than 500 words.", "It has no real effect on how well the story is understood.", "It matters only if the story includes proverbs."],
  },
  {
    build: (n, t) => `${n} chooses to write about ${t}, a topic with a real personal connection, rather than an unfamiliar one. Why might this make the composition more interesting to read?`,
    correct: "Writing about familiar experiences gives more specific, believable details to include.",
    wrongs: ["Familiar topics are always shorter to write.", "Unfamiliar topics are never allowed in a narrative composition.", "It guarantees the composition will have no grammar mistakes."],
  },
  {
    build: (n, t) => `While planning the narrative about ${t}, ${n} decides in advance where to use a simile or proverb to make a moment more vivid. Why is planning this ahead of time useful?`,
    correct: "It ensures the expression fits naturally into the story instead of feeling forced in later.",
    wrongs: ["It is required so the composition reaches exactly 200 words.", "Expressions only count if they are decided before writing.", "It guarantees the expression will be spelled correctly."],
  },
];

// Explicit stage order, condensed directly from Theme 2's own learningExperiences bullet text:
// "list topics/ideas; discuss experiences in groups; write points to guide... composition;
// collaborate on the first paragraph; complete individually; proofread; peer-critique for
// coherence/creativity/relevance/accuracy" — the source's own suggested teaching sequence.
const WRITING_STAGES: { id: string; label: string; description: string }[] = [
  { id: "plan", label: "Plan", description: "List topics and ideas, and discuss experiences about the theme in groups" },
  { id: "draft", label: "Draft guiding points", description: "Write guiding points for the narrative composition (160-200 words)" },
  { id: "collaborate", label: "Collaborate on the first paragraph", description: "Work with the class or a group to write the opening paragraph together" },
  { id: "complete", label: "Complete individually", description: "Finish the rest of the composition on your own" },
  { id: "proofread", label: "Proofread", description: "Check the composition for spelling, punctuation, and grammar mistakes" },
  { id: "critique", label: "Peer-critique", description: "Exchange with a partner and judge the composition for coherence, creativity, relevance, and accuracy" },
];

type EventPos = "beginning" | "middle" | "end";
const EVENT_SENTENCES: { theme: Theme; pos: EventPos; text: string }[] = [
  { theme: "cultural", pos: "beginning", text: "Early that morning, the family began preparing food for grandmother's homecoming ceremony." },
  { theme: "cultural", pos: "beginning", text: "Before the guests arrived, aunties decorated the compound with flowers and cloth." },
  { theme: "cultural", pos: "beginning", text: "As dawn broke on Idd, everyone put on their best clothes for the mosque." },
  { theme: "cultural", pos: "middle", text: "By midday, the choir was singing and everyone danced around the compound." },
  { theme: "cultural", pos: "middle", text: "Halfway through the ceremony, elders gave speeches welcoming the guests." },
  { theme: "cultural", pos: "middle", text: "During the reception, relatives shared stories and photographs from years past." },
  { theme: "cultural", pos: "end", text: "By evening, the last guests said their goodbyes and the compound grew quiet." },
  { theme: "cultural", pos: "end", text: "As the sun set, the family gathered for one final group photo." },
  { theme: "cultural", pos: "end", text: "After the meal was cleared away, everyone thanked the hosts before leaving." },
  { theme: "tourist", pos: "beginning", text: "At sunrise, the safari van left the gate for the morning game drive." },
  { theme: "tourist", pos: "beginning", text: "Before the boat left the jetty, the guide checked everyone's life jackets." },
  { theme: "tourist", pos: "beginning", text: "As the group arrived at the museum gate, the guide began explaining the day's plan." },
  { theme: "tourist", pos: "middle", text: "Halfway through the drive, the group spotted a pride of lions resting under a tree." },
  { theme: "tourist", pos: "middle", text: "In the middle of the hike, everyone stopped to admire the valley below." },
  { theme: "tourist", pos: "middle", text: "During the boat ride, a pod of dolphins surfaced beside the group." },
  { theme: "tourist", pos: "end", text: "By the end of the drive, the group had seen four of the Big Five." },
  { theme: "tourist", pos: "end", text: "As the sun set over the reef, the boat turned back toward the shore." },
  { theme: "tourist", pos: "end", text: "After the museum tour, the class left with pages of notes for their project." },
  { theme: "animal", pos: "beginning", text: "Every morning before school, the herder checks that the goat pen is properly latched." },
  { theme: "animal", pos: "beginning", text: "Before letting the calves graze, the family kept them close to the barn for warmth." },
  { theme: "animal", pos: "beginning", text: "As the vet arrived, the sick hen had already been separated from the rest of the flock." },
  { theme: "animal", pos: "middle", text: "Halfway through the week, the calf grew strong enough to graze closer to its mother." },
  { theme: "animal", pos: "middle", text: "During the check-up, the vet examined the hen's feathers and beak carefully." },
  { theme: "animal", pos: "middle", text: "In the middle of the afternoon, the dog was walked past the road on its leash." },
  { theme: "animal", pos: "end", text: "By the following Sunday, the hen was back pecking happily with the flock." },
  { theme: "animal", pos: "end", text: "After a week of care, the calf finally joined the rest of the herd." },
  { theme: "animal", pos: "end", text: "By evening, the goats were safely back in their pen with the latch checked twice." },
];

const WRITING_TIPS: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] }[] = [
  { before: "Before drafting a narrative composition, a writer should first", after: "ideas about the topic so the story stays organised.", correctAnswer: "plan", acceptedAnswers: ["list", "brainstorm"] },
  { before: "A narrative composition at this level should be about 160 to", after: "words long.", correctAnswer: "200", acceptedAnswers: ["200 words"] },
  { before: "After completing a first draft, a writer should", after: "it to fix spelling, punctuation and grammar mistakes.", correctAnswer: "proofread" },
  { before: "Working with classmates to write the opening paragraph of a narrative together is called", after: "on the first paragraph.", correctAnswer: "collaborating", acceptedAnswers: ["collaborate", "collaboration"] },
  { before: "Once a partner reads a finished narrative and judges it for coherence, creativity, relevance and accuracy, this step is called peer", after: ".", correctAnswer: "critique", acceptedAnswers: ["critiquing", "criticism"] },
  { before: "Arranging events in a story so they follow a clear beginning, middle and end is called organising ideas", after: ".", correctAnswer: "logically" },
  { before: "A simile such as 'as fast as lightning' or a proverb such as 'prevention is better than cure' can make a narrative composition more", after: ".", correctAnswer: "interesting", acceptedAnswers: ["creative", "vivid"] },
  { before: "Listing topics and discussing experiences with classmates before writing is part of the", after: "stage of the writing process.", correctAnswer: "planning", acceptedAnswers: ["plan"] },
  { before: "A narrative composition that stays focused on the given topic, rather than wandering off it, is judged as", after: ".", correctAnswer: "relevant", acceptedAnswers: ["relevance"] },
  { before: "Finishing the rest of a narrative composition on your own, after the class has written the first paragraph together, is called completing it", after: ".", correctAnswer: "individually", acceptedAnswers: ["alone", "independently"] },
  { before: "A story that flows sensibly from one idea to the next, rather than jumping around confusingly, is judged as", after: ".", correctAnswer: "coherent", acceptedAnswers: ["coherence"] },
  { before: "Choosing which events to include and in what order before writing the full story is part of", after: "a narrative composition.", correctAnswer: "planning" },
];

export const narrativeCompositions: Skill = {
  id: "g6-eng-writing-narrative-compositions",
  code: "W.2",
  subjectId: "english",
  strandId: "g6-eng-writing",
  grade: 6,
  title: "Narrative Compositions",
  description: "Plan, organise, and judge open-ended narrative compositions (160-200 words) about cultural celebrations, tourist attractions, and farm animal safety, using well-chosen similes, metaphors, idioms and proverbs.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["order-stages", "categorize-events", "mc-expression", "mc-paragraph", "mc-why-plan", "click-match", "fill-blank"] as const
    );
    const hint = "A strong narrative composition is planned first, organised into a clear beginning-middle-end, stays on topic, and uses expressions like similes, metaphors, idioms or proverbs naturally.";

    if (branch === "order-stages") {
      return {
        kind: "ordering",
        prompt: "Arrange the stages of writing a narrative composition in the correct order.",
        instruction: "Click the stages in order, from first to last.",
        items: shuffle(rng, WRITING_STAGES.map((s) => ({ id: s.id, label: s.label }))),
        correctOrder: WRITING_STAGES.map((s) => s.id),
        hint,
        explanation: WRITING_STAGES.map((s) => `${s.label} — ${s.description.toLowerCase()}`).join(" → "),
      };
    }

    if (branch === "categorize-events") {
      const theme = randChoice(rng, ["cultural", "tourist", "animal"] as Theme[]);
      const pool = EVENT_SENTENCES.filter((e) => e.theme === theme);
      const beginning = shuffle(rng, pool.filter((e) => e.pos === "beginning")).slice(0, 2);
      const middle = shuffle(rng, pool.filter((e) => e.pos === "middle")).slice(0, 2);
      const end = shuffle(rng, pool.filter((e) => e.pos === "end")).slice(0, 2);
      const chosen = shuffle(rng, [...beginning, ...middle, ...end]);
      const items = chosen.map((e, i) => ({ id: `e${i}`, label: e.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((e, i) => (correctBucket[`e${i}`] = e.pos));
      return {
        kind: "categorize",
        prompt: `These sentences are from a narrative composition about ${THEME_LABEL[theme]}. Sort each one into Beginning, Middle, or End.`,
        items,
        buckets: [
          { id: "beginning", label: "Beginning" },
          { id: "middle", label: "Middle" },
          { id: "end", label: "End" },
        ],
        correctBucket,
        hint: "A narrative composition is organised logically: the beginning sets the scene, the middle develops the main events, and the end wraps the story up.",
        explanation: chosen.map((e) => `"${e.text}" — ${e.pos}.`).join(" "),
      };
    }

    if (branch === "mc-expression") {
      const entry = randChoice(rng, SCENARIO_MOMENTS);
      const name = randChoice(rng, KENYAN_NAMES);
      const sameTheme = EXPRESSIONS.filter((e) => e.theme === entry.theme && e.text !== entry.correct);
      const distractors = shuffle(rng, sameTheme).slice(0, 3).map((e) => e.text);
      const choices = shuffle(rng, [entry.correct, ...distractors]);
      const correctMeaning = EXPRESSIONS.find((e) => e.text === entry.correct)!.meaning;
      return {
        kind: "multiple-choice",
        prompt: entry.build(name),
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Match the meaning of the expression to what is actually happening in the narrative moment, not just the general topic.",
        explanation: `"${entry.correct}" fits because it means ${correctMeaning}.`,
      };
    }

    if (branch === "mc-paragraph") {
      const entry = randChoice(rng, SAMPLE_PARAGRAPHS);
      const choices = shuffle(rng, [entry.better, entry.worse]);
      return {
        kind: "multiple-choice",
        prompt: `This is an opening for a narrative composition about ${THEME_LABEL[entry.theme]}. Which version is better organised and stays on topic?`,
        choices,
        correctIndex: choices.indexOf(entry.better),
        layout: "list",
        hint: "The stronger paragraph follows events in a clear order and stays focused on the topic — the weaker one jumps between unrelated ideas.",
        explanation: "The stronger paragraph follows a clear sequence of events on the given topic. The other one jumps between unrelated, disconnected ideas, so it is not coherent.",
      };
    }

    if (branch === "mc-why-plan") {
      const entry = randChoice(rng, WHY_PLAN);
      const name = randChoice(rng, KENYAN_NAMES);
      const theme = randChoice(rng, ["cultural", "tourist", "animal"] as Theme[]);
      const choices = shuffle(rng, [entry.correct, ...entry.wrongs]);
      return {
        kind: "multiple-choice",
        prompt: entry.build(name, THEME_LABEL[theme]),
        choices,
        correctIndex: choices.indexOf(entry.correct),
        layout: "list",
        hint: "Think about what planning, drafting, or peer-critique actually achieves for the finished composition.",
        explanation: entry.correct,
      };
    }

    if (branch === "click-match") {
      const theme = randChoice(rng, ["cultural", "tourist", "animal"] as Theme[]);
      const chosen = shuffle(rng, EXPRESSIONS.filter((e) => e.theme === theme)).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((e) => ({ id: e.text, label: e.text })));
      const targets = shuffle(rng, chosen.map((e) => ({ id: e.text, label: e.meaning })));
      const correctMap: Record<string, string> = {};
      for (const e of chosen) correctMap[e.text] = e.text;
      return {
        kind: "click-match",
        prompt: `Match each expression used in narrative compositions about ${THEME_LABEL[theme]} to its meaning.`,
        tokens,
        targets,
        correctMap,
        hint: "Think about what each simile, metaphor, idiom, or proverb actually means, not just which words appear in it.",
        explanation: chosen.map((e) => `"${e.text}" means ${e.meaning}.`).join(" "),
      };
    }

    const entry = randChoice(rng, WRITING_TIPS);
    return {
      kind: "fill-blank",
      prompt: "Fill in the missing word to complete this tip about writing a narrative composition.",
      before: entry.before,
      after: entry.after,
      correctAnswer: entry.correctAnswer,
      acceptedAnswers: entry.acceptedAnswers,
      inputMode: "text",
      hint,
      explanation: `The complete sentence reads: "${entry.before} ${entry.correctAnswer} ${entry.after}"`,
    };
  },
};
