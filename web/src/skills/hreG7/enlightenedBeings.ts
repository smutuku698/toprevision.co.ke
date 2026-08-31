import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";
import { name, neighbour, place, type ScenarioMC } from "./shared";

// KICD Grade 7 HRE, Strand 1.0 → Sub-strand 1.1 "Enlightened Beings" (15 lessons).
// The design names five Enlightened Beings and five specific stories; all ten items are
// implemented below. The rubric grades three separate abilities — narrate the stories, explore the
// INTERRELATIONSHIPS, and illustrate the EVENTS — so this skill carries an ordering branch (events),
// a relationship click-match branch (interrelationships) and story-grounded scenarios (narration),
// not just name recall.
//
// Core Competencies box names "Critical Thinking and Problem Solving", so per RIGOR-STANDARDS.md an
// Evaluate-tier branch is mandatory here, not optional — see EVALUATE_TEMPLATES.
//
// Visual scope: declined. Assests-svg/ carries only animal/fruit/food cartoon icons and the root SVG
// design doc prescribes nothing for religious education; generating cartoon depictions of Lord
// Krishna, Lord Buddha, a Tirthankar or the Sikh Gurus would risk misrepresenting sacred figures.
// See curriculum-reference/grade-7/hindu-religious-education.json → visualCoverageDecision.

const STORY_ORDER_PROMPTS = (title: string) => [
  `Arrange the events of "${title}" in the order they happened.`,
  `Put the events of "${title}" into the order they occurred.`,
  `Sequence the events in "${title}" correctly, from first to last.`,
  `Order these events from "${title}" as they actually unfolded.`,
  `Sort the steps of "${title}" into the correct order.`,
  `Arrange these moments from "${title}" in the order they took place.`,
];

const TRADITION_SORT_PROMPTS = [
  "Sort each Enlightened Being into the faith tradition they belong to.",
  "Group each Enlightened Being under the faith tradition they come from.",
  "Sort these Enlightened Beings by their faith tradition.",
  "Place each Enlightened Being into the correct faith tradition.",
  "Decide which faith tradition each Enlightened Being belongs to, and sort them there.",
  "Categorise each Enlightened Being by faith tradition.",
];

const FACT_SORT_PROMPTS = [
  "Sort each statement under the Enlightened Being it describes.",
  "Group these statements under the Enlightened Being each one describes.",
  "Decide which Enlightened Being each statement is about, and sort it there.",
  "Sort each fact into the correct Enlightened Being's story.",
  "Place each statement under the Enlightened Being it belongs to.",
  "Read each fact and sort it under the matching Enlightened Being.",
];

const RELATIONSHIP_MATCH_PROMPTS = [
  "Match each pair to the interrelationship that connects them.",
  "Pair each set of figures with the relationship that links them.",
  "Connect each pair to the correct interrelationship.",
  "Link each pair below to the relationship that describes them.",
  "Match each pair of figures to how they are related.",
  "Choose the correct interrelationship for each pair.",
];

const VALUE_MATCH_PROMPTS = [
  "Match each Enlightened Being to the value their story teaches most directly.",
  "Pair each Enlightened Being with the value their story teaches.",
  "Connect each Enlightened Being to the value most clearly taught in their story.",
  "Link each Enlightened Being to the value that fits their story best.",
  "Match each figure below to the value their story teaches.",
  "Choose the value that each Enlightened Being's story teaches most directly.",
];

const FILL_BLANK_PROMPTS = [
  "Complete the sentence.",
  "Fill in the missing word.",
  "Which word completes this sentence?",
  "Complete the sentence with the correct word.",
  "Work out the missing word below.",
  "Fill in the blank to complete the sentence correctly.",
];

const BEINGS = [
  {
    id: "har-rai",
    label: "Guru Har Rai Ji",
    tradition: "Sikh",
    value: "Returning good for evil, and healing without asking who deserves it",
    linkedPerson: "Dara Shikoh, the Mughal emperor's son whom he healed with rare medicine",
  },
  {
    id: "krishna",
    label: "Lord Krishna",
    tradition: "Sanatan/Vedic",
    value: "Protecting those who turn to God in faith, and honouring the smallest offering",
    linkedPerson: "Draupadi, who prayed to him when Sage Durvasa arrived in the forest",
  },
  {
    id: "buddha",
    label: "Lord Buddha",
    tradition: "Buddhist",
    value: "Patient inquiry into the causes of suffering, and balance through the Middle Way",
    linkedPerson: "the five ascetics, to whom he preached his first sermon at Sarnath",
  },
  {
    id: "neminath",
    label: "Tirthankar Neminath",
    tradition: "Jain",
    value: "Ahimsa — compassion for animals even at great personal cost",
    linkedPerson: "Princess Rajul, the bride whose wedding he gave up, and who later renounced too",
  },
  {
    id: "har-krishan",
    label: "Guru Har Krishan Ji",
    tradition: "Sikh",
    value: "Humility and equality — grace does not depend on birth, age or learning",
    linkedPerson: "Chhajumal, the unlettered water-carrier who explained the Bhagavad Gita",
  },
] as const;

// Every one of the five stories the design lists by name is given a sequence here. The design's own
// outcome (c) is "illustrate the EVENTS mentioned in the lives of the Enlightened Beings", and the
// rubric penalises narrating "with major mix-ups" — so the order is curriculum content, not invented.
const STORY_SEQUENCES = [
  {
    id: "buddha-dukkha",
    title: "Lord Buddha's research on dukkha",
    hint: "It begins inside the palace and ends with his first sermon.",
    steps: [
      "Prince Siddhartha grows up sheltered inside his father's palace, kept away from all suffering",
      "Outside the palace he sees an old man, a sick man and a dead body, and then a calm wandering ascetic",
      "He leaves the palace to find out what causes dukkha (suffering) and whether it can end",
      "He practises six years of severe fasting and austerity, growing weak without finding the answer",
      "He accepts food again and chooses the Middle Way, avoiding both luxury and extreme self-denial",
      "He meditates under the Bodhi tree at Bodh Gaya and attains enlightenment",
      "He teaches the Four Noble Truths about dukkha in his first sermon at Sarnath",
    ],
  },
  {
    id: "neminath-animals",
    title: "Tirthankar Neminath's compassion for animals",
    hint: "It begins with a wedding procession and ends on Mount Girnar.",
    steps: [
      "Prince Neminath sets out in his wedding procession to marry Princess Rajul",
      "He hears the cries of animals penned near the wedding hall",
      "He asks his charioteer why they are there, and learns they are to be killed for the wedding feast",
      "Moved with compassion, he orders that every one of the animals be set free",
      "He turns his chariot back, giving up both the wedding and his princely life",
      "He becomes an ascetic and attains omniscience (kevalgyan) on Mount Girnar",
    ],
  },
  {
    id: "har-rai-dara",
    title: "Guru Har Rai Ji and Dara Shikoh",
    hint: "It begins with an illness and ends with a teaching about sandalwood.",
    steps: [
      "Dara Shikoh, the eldest son of the Mughal emperor, falls dangerously ill",
      "The physicians say only rare herbs, kept in Guru Har Rai Ji's medicine store, can cure him",
      "A request for those rare medicines is carried to Guru Har Rai Ji",
      "Although the Mughal rulers had persecuted the Sikhs, the Guru gives the medicines freely",
      "Dara Shikoh recovers from his illness",
      "The Guru teaches that good should be returned for evil, as sandalwood perfumes even the axe that cuts it",
    ],
  },
  {
    id: "har-krishan-chhajumal",
    title: "Guru Har Krishan Ji and Chhajumal",
    hint: "It begins with a proud challenge and ends with a proud man humbled.",
    steps: [
      "A proud pandit challenges the child Guru Har Krishan Ji to explain the meaning of the Bhagavad Gita",
      "The Guru tells him to bring any ordinary person from the village",
      "The pandit brings Chhajumal, an unlettered water-carrier who could barely speak",
      "The Guru touches Chhajumal and asks him to explain the Gita",
      "Chhajumal explains the meaning of the Gita beautifully",
      "The pandit is humbled, learning that God's grace does not depend on birth or learning",
    ],
  },
  {
    id: "krishna-pandavas",
    title: "Lord Krishna saving the honour of the Pandavas in the jungle",
    hint: "It begins with the Akshaya Patra already empty for the day.",
    steps: [
      "The Pandavas live in exile in the forest with the Akshaya Patra, which gives food each day until Draupadi has eaten",
      "Sage Durvasa arrives with thousands of disciples and asks to be fed, after Draupadi has already eaten",
      "Unable to offer hospitality, Draupadi prays to Lord Krishna for help",
      "Lord Krishna arrives and asks Draupadi for something to eat",
      "He finds one grain of rice with a leaf still stuck to the Akshaya Patra, and eats it",
      "Durvasa and all his disciples feel completely full, and the honour of the Pandavas is saved",
    ],
  },
] as const;

// 20 facts across the five beings — well past the 10-fact floor for a categorize/click-match pool.
const BEING_FACTS: { text: string; being: string }[] = [
  { text: "Kept a store of rare herbal medicines and a garden of healing plants, open to anyone in need", being: "har-rai" },
  { text: "Gave rare medicine to the son of the Mughal emperor, whose family had persecuted the Sikhs", being: "har-rai" },
  { text: "Taught that good should be returned for evil, as sandalwood perfumes even the axe that cuts it", being: "har-rai" },
  { text: "As a boy, learned to walk carefully through a garden after his flowing robe damaged some flowers", being: "har-rai" },
  { text: "Came to the aid of Draupadi and the Pandavas during their exile in the forest", being: "krishna" },
  { text: "Accepted a single grain of rice and satisfied the hunger of a sage and his thousands of disciples", being: "krishna" },
  { text: "Showed that the devotion behind an offering matters far more than the size of the offering", being: "krishna" },
  { text: "Is remembered in Jain tradition as the cousin of Tirthankar Neminath", being: "krishna" },
  { text: "Left a royal palace after seeing old age, sickness and death for the first time", being: "buddha" },
  { text: "Spent six years in extreme austerity before rejecting it in favour of the Middle Way", being: "buddha" },
  { text: "Attained enlightenment while meditating under the Bodhi tree at Bodh Gaya", being: "buddha" },
  { text: "Taught the Four Noble Truths: that dukkha exists, has a cause, can end, and has a path to its ending", being: "buddha" },
  { text: "Set free the animals penned for his own wedding feast and gave up the marriage", being: "neminath" },
  { text: "Is counted as the twenty-second Tirthankar", being: "neminath" },
  { text: "Attained omniscience (kevalgyan) on Mount Girnar", being: "neminath" },
  { text: "Turned his wedding chariot back after hearing the cries of animals waiting to be slaughtered", being: "neminath" },
  { text: "Became Guru while still a small child, and is remembered as 'Bala Pir', the child prophet", being: "har-krishan" },
  { text: "Enabled an unlettered water-carrier to explain the meaning of the Bhagavad Gita", being: "har-krishan" },
  { text: "Served people suffering in a smallpox epidemic in Delhi and caught the illness himself", being: "har-krishan" },
  { text: "Was the son of Guru Har Rai Ji", being: "har-krishan" },
];

// Outcome (b): "explore the interrelationships of the Enlightened Beings". These are the genuine
// links the traditions themselves record, not invented associations.
const RELATIONSHIPS = [
  { id: "father-son", pair: "Guru Har Rai Ji and Guru Har Krishan Ji", link: "Father and son — the son became the eighth Sikh Guru while still a small child" },
  { id: "cousins", pair: "Lord Krishna and Tirthankar Neminath", link: "Cousins, according to Jain tradition" },
  { id: "healer", pair: "Guru Har Rai Ji and Dara Shikoh", link: "Healer and patient — rare medicine given freely to the son of a persecuting ruler" },
  { id: "grace", pair: "Guru Har Krishan Ji and Chhajumal", link: "Guru and unlettered water-carrier, who explained the Bhagavad Gita by the Guru's grace" },
  { id: "prayer", pair: "Lord Krishna and Draupadi", link: "Devotee and Lord — she prayed in the forest and he came to save the family's honour" },
  { id: "bride", pair: "Tirthankar Neminath and Princess Rajul", link: "Bride and bridegroom whose wedding was given up, after which she too renounced worldly life" },
  { id: "sermon", pair: "Lord Buddha and the five ascetics", link: "Teacher and first listeners — they heard the first sermon on the Four Noble Truths at Sarnath" },
];

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A classmate who once spread hurtful rumours about ${who} falls ill and misses two weeks of school in ${place(rng)}. ${who} copies out her own notes for him and coaches him through what he missed, without being asked. Which Enlightened Being's example is ${who} following most closely?`,
      correct: "Guru Har Rai Ji, who gave rare healing medicine to Dara Shikoh even though the Mughal rulers had persecuted the Sikhs",
      wrong: [
        "Lord Buddha, who left the palace after seeing old age, sickness and death",
        "Tirthankar Neminath, who set free the animals penned for his wedding feast",
        "Lord Krishna, who accepted a single grain of rice from the Akshaya Patra",
      ],
      explanation:
        "The distinctive feature here is help given to someone who had done her harm — exactly Guru Har Rai Ji's example of returning good for evil. Buddha's palace departure is about investigating suffering, Neminath's about animal life, and Krishna's about the value of a small offering; all are real events, but none is about repaying harm with kindness.",
    };
  },
  (rng) => ({
    prompt: `A school in ${place(rng)} plans a fundraising dinner and buys three goats to be slaughtered for it. ${name(rng)} asks the committee to sell the goats on to a farmer instead and serve a vegetarian meal, and gives up her own place at the dinner to make up the cost. Which Enlightened Being's example is she following?`,
    correct: "Tirthankar Neminath, who freed the animals gathered for his wedding feast and gave up the wedding itself",
    wrong: [
      "Guru Har Krishan Ji, who gave his grace to Chhajumal the water-carrier",
      "Lord Buddha, who chose the Middle Way after six years of austerity",
      "Guru Har Rai Ji, who taught that good should be returned for evil",
    ],
    explanation:
      "Two things mark this out as Neminath's example: animals saved from slaughter, and a personal cost accepted to do it. Guru Har Krishan Ji's story is about equality and grace, Buddha's Middle Way about balance in spiritual effort, and Guru Har Rai Ji's about forgiving an enemy.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Guests arrive unexpectedly at ${who}'s home in ${place(rng)} and there is very little food left. ${who}'s grandmother serves the little there is on the best plates, with full attention and warmth. Which story from the sub-strand does her attitude echo?`,
      correct: "Lord Krishna eating a single grain of rice from the Akshaya Patra, satisfying Durvasa and all his disciples",
      wrong: [
        "Lord Buddha accepting food and rejecting extreme austerity",
        "Guru Har Rai Ji handing over rare medicines from his store",
        "Guru Har Krishan Ji serving the sick during the Delhi epidemic",
      ],
      explanation:
        "The point of the Akshaya Patra episode is that the smallest offering, given with devotion, is enough — the closest match to serving a little food with full honour. Buddha's meal marks a change of method, not hospitality; the other two are about healing the sick.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} decides to fast completely for a whole week to become more spiritual. By the fourth day ${who} is too weak to concentrate in class or help at ${place(rng)}'s community kitchen. Which Enlightened Being's experience most directly speaks to what ${who} has discovered?`,
      correct: "Lord Buddha, who found after six years that extreme austerity did not end dukkha, and taught the Middle Way instead",
      wrong: [
        "Tirthankar Neminath, who gave up his wedding out of compassion for animals",
        "Guru Har Krishan Ji, who became Guru while still a child",
        "Lord Krishna, who protected the Pandavas' honour in the forest",
      ],
      explanation:
        "Buddha tested extreme self-denial for six years and concluded it does not work, choosing the Middle Way — the precise lesson here. Neminath's renunciation was a response to violence against animals, not a claim that severe fasting brings insight.",
    };
  },
  (rng) => ({
    prompt: `A speaker at a community hall in ${place(rng)} tells young people that only those born into learned families can really understand scripture. Which story from this sub-strand most directly answers that claim?`,
    correct: "Guru Har Krishan Ji giving his grace to Chhajumal, an unlettered water-carrier, who then explained the Bhagavad Gita",
    wrong: [
      "Guru Har Rai Ji giving rare medicines to Dara Shikoh",
      "Lord Buddha attaining enlightenment under the Bodhi tree",
      "Tirthankar Neminath attaining kevalgyan on Mount Girnar",
    ],
    explanation:
      "Chhajumal's story exists precisely to refute the idea that scriptural understanding belongs to the learned by birth — a proud pandit was humbled by an unlettered water-carrier. The other three events are true, but none of them is about who is entitled to understand scripture.",
  }),
  (rng) => ({
    prompt: `${name(rng)} is drawing a diagram of how the Enlightened Beings in this sub-strand are connected. Which pair should be joined with the label "father and son"?`,
    correct: "Guru Har Rai Ji and Guru Har Krishan Ji",
    wrong: [
      "Lord Krishna and Tirthankar Neminath",
      "Guru Har Rai Ji and Dara Shikoh",
      "Lord Buddha and the five ascetics",
    ],
    explanation:
      "Guru Har Krishan Ji was the son of Guru Har Rai Ji. Krishna and Neminath are linked as cousins in Jain tradition, Guru Har Rai Ji and Dara Shikoh as healer and patient, and Buddha and the five ascetics as teacher and first listeners — real links, but not father and son.",
  }),
  (rng) => ({
    prompt: `The same diagram in ${place(rng)} needs a pair joined with the label "cousins, according to Jain tradition". Which pair is it?`,
    correct: "Lord Krishna and Tirthankar Neminath",
    wrong: [
      "Guru Har Rai Ji and Guru Har Krishan Ji",
      "Tirthankar Neminath and Princess Rajul",
      "Lord Buddha and Chhajumal",
    ],
    explanation:
      "Jain tradition records Tirthankar Neminath as the cousin of Lord Krishna. The Gurus in the list are father and son, Neminath and Rajul were betrothed, and Chhajumal belongs to Guru Har Krishan Ji's story, not the Buddha's.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `A disease outbreak fills the wards of a hospital in ${place(rng)}. ${who} and other members of the youth group volunteer daily to carry water, sit with patients and comfort families, knowing they could fall ill themselves. Which Enlightened Being's example does this most closely follow?`,
      correct: "Guru Har Krishan Ji, who served the sick during the smallpox epidemic in Delhi and contracted the illness himself",
      wrong: [
        "Lord Krishna, who came to Draupadi when she prayed in the forest",
        "Tirthankar Neminath, who freed the animals at his wedding",
        "Lord Buddha, who taught the Four Noble Truths at Sarnath",
      ],
      explanation:
        "Serving the sick at real risk to oneself is Guru Har Krishan Ji's example exactly — he caught smallpox while caring for the afflicted in Delhi. Krishna's forest episode answers a prayer for hospitality, not nursing the sick.",
    };
  },
  (rng) => {
    const who = name(rng);
    const friend = neighbour(rng);
    return {
      prompt: `${who} tells her friend ${friend} that Lord Buddha "simply gave up" when he stopped his six years of austerity. What is the better account of what he actually did?`,
      correct: "He abandoned a method he had thoroughly tested and found ineffective, and adopted the Middle Way to continue the same search",
      wrong: [
        "He abandoned the search for the causes of dukkha altogether and returned to palace life",
        "He decided that dukkha cannot be understood and that no path can end it",
        "He concluded that only extreme austerity works, but that he was too weak for it",
      ],
      explanation:
        "Stopping the austerities was a change of method, not of purpose: he had tested extreme self-denial for six years, found it did not end dukkha, and went on to enlightenment by the Middle Way. He neither returned to palace life nor gave up the search.",
    };
  },
  (rng) => ({
    prompt: `An HRE class in ${place(rng)} argues about the Akshaya Patra episode. One learner says the story is mainly about food running out. What does the story actually teach?`,
    correct: "That an offering made with genuine devotion is complete in itself, however small it looks",
    wrong: [
      "That the Pandavas were wealthy enough to feed any number of guests",
      "That unexpected guests should be turned away when there is not enough food",
      "That Sage Durvasa was wrong to visit the Pandavas in the forest",
    ],
    explanation:
      "One grain of rice offered to Krishna satisfied Durvasa and thousands of disciples — the teaching is about the devotion behind an offering, not the quantity. The Pandavas were in exile with almost nothing, and hospitality is honoured in the story, not refused.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked to name one value that the evidence in all five of these stories supports. Which answer is best supported by the stories themselves?`,
      correct: "Compassion shown through costly action for others, not compassion expressed only in words",
      wrong: [
        "That spiritual people should withdraw from society and avoid other people's problems",
        "That only adults with long training can act on religious values",
        "That kindness should be shown only to members of one's own faith community",
      ],
      explanation:
        "Every story turns on someone acting at real cost — a Guru giving medicine to a persecutor's family, a prince giving up his wedding, a child Guru nursing the sick. That directly contradicts withdrawal, an age requirement, or kindness limited to one's own community.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `An animal shelter near ${place(rng)} asks ${who}'s HRE club for help on Saturdays. Some members say animal welfare is not really a religious activity. Which reply is best supported by this sub-strand?`,
      correct: "Tirthankar Neminath's story makes compassion for animals a religious act, and the design itself lists animal-welfare service as a learning activity",
      wrong: [
        "Animal welfare is only a Jain concern, so members of other traditions should not take part",
        "Religious activity means worship at a place of worship, so shelter work does not count",
        "Only fundraising counts as service; physical work at a shelter does not",
      ],
      explanation:
        "Neminath gave up his own wedding to save penned animals, and the sub-strand explicitly asks learners to take part in community service promoting animal welfare and acts of kindness. Restricting it to one tradition, or to worship inside a building, misreads both the story and the design.",
    };
  },
];

const EVALUATE_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => ({
    prompt: `An HRE club in ${place(rng)} must choose one project to mark what they have learnt about the Enlightened Beings. Proposal A: a one-day photo exhibition about the five beings' lives. Proposal B: a term-long partnership with a local animal shelter, plus monthly visits to a children's home. Which better fulfils what this sub-strand asks of learners, and why?`,
    correct: "Proposal B — the sub-strand asks learners to take part in community service promoting inclusivity, animal welfare and acts of kindness, which means practising the values, not only presenting them",
    wrong: [
      "Proposal A — knowing the stories accurately matters more than acting on them",
      "Proposal A — an exhibition reaches more people in one day, so it does more good",
      "Neither — school clubs should leave community service to adults",
    ],
    explanation:
      "The design's learning experiences move from researching the stories to participating in service that promotes animal welfare and kindness. An exhibition is a legitimate way to present findings, but only Proposal B meets the practising outcome — reach alone does not substitute for practice.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} argues that Guru Har Rai Ji should have refused the rare medicine, because the Mughal rulers had persecuted the Sikhs. Judge this argument against the story itself.`,
      correct: "It is unsound — the whole point of the episode is that the Guru healed a persecutor's son freely, teaching that good is returned for evil as sandalwood perfumes the axe",
      wrong: [
        "It is sound — the Guru's first duty was to protect his own community from its enemies",
        "It is sound — the medicines were rare and should have been saved for Sikh patients",
        "It is neither sound nor unsound — the story does not say why the Guru gave the medicine",
      ],
      explanation:
        "The episode is remembered precisely because the Guru gave freely to the family that had persecuted the Sikhs, and taught the sandalwood lesson from it. An argument for refusal reverses the story's meaning; the story does state the Guru's reason.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} claims Tirthankar Neminath acted wastefully, because freeing the animals ruined a wedding that many people had prepared for. Judge this claim.`,
    correct: "It is weak — it weighs one celebration against the lives of many animals, and Neminath accepted the greater personal loss himself rather than passing the cost to others",
    wrong: [
      "It is strong — a promise to marry outweighs concern for animals kept for food",
      "It is strong — he should have freed the animals quietly and gone ahead with the wedding",
      "It is neither — the story never says the animals were meant for the feast",
    ],
    explanation:
      "Neminath bore the cost himself: he lost the marriage and the princely life, not the guests. The suggestion that he could have freed the animals and still held the feast misses that the feast was the reason they were penned — which the story states plainly.",
  }),
  (rng) => ({
    prompt: `Two learners in ${place(rng)} explain the six years of austerity in Lord Buddha's story. ${name(rng)} says they were a wasted mistake best left out when the story is retold. Another says they were a necessary test that showed extremes cannot end dukkha, and led directly to the Middle Way. Which explanation is better, and why?`,
    correct: "The second — the austerity years are what gave the Middle Way its evidence, so removing them makes the teaching look like an untested preference",
    wrong: [
      "The first — a retelling should only include the parts that ended in success",
      "The first — the austerities show weakness and would confuse younger learners",
      "Neither — the six years have no bearing on the Four Noble Truths",
    ],
    explanation:
      "The Middle Way is a conclusion drawn from having tried both luxury and severe self-denial. Cut the six years out and the teaching loses the very experience that justifies it — which is why the design lists the whole sequence of events, not only the enlightenment.",
  }),
  (rng) => ({
    prompt: `A class in ${place(rng)} is preparing a skit on Guru Har Krishan Ji and Chhajumal. One group wants to play Chhajumal as a fool, for laughs. Another wants to play him as an ordinary, dignified man through whom grace worked. Which choice is better, and why?`,
    correct: "The second — the story's teaching is that grace does not depend on birth or learning, which is destroyed if the unlettered man is mocked",
    wrong: [
      "The first — comedy makes the story easier for classmates to remember",
      "The first — Chhajumal could not read, so playing him as foolish is accurate",
      "Neither — the skit should leave Chhajumal out and show only the pandit and the Guru",
    ],
    explanation:
      "Mocking Chhajumal reproduces exactly the pride the story humbles. Being unlettered is not the same as being foolish — and removing him removes the person through whom the whole lesson is delivered.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} says the five Enlightened Beings come from four different faiths, so studying them together in one HRE lesson confuses learners and should stop. Judge this against the subject's own aims.`,
      correct: "It should not stop — HRE is explicitly built on the four faiths together, and comparing the beings is how learners meet the aim of respect for religious diversity",
      wrong: [
        "It should stop — each faith's figures should only ever be taught to learners of that faith",
        "It should stop — comparing figures from different faiths means ranking them against each other",
        "It should continue, but only because there is not enough lesson time to teach them separately",
      ],
      explanation:
        "HRE's general outcomes name the Sanatan/Vedic, Jain, Buddhist and Sikh faiths together, and the essence statement makes mutual understanding across heritages a goal of the subject. Studying figures side by side is not ranking them, and the reason is educational, not a shortage of time.",
    };
  },
  (rng) => ({
    prompt: `A learner in ${place(rng)} argues that these stories are all from long ago and far away, so they cannot guide life in Kenya today. Judge this argument.`,
    correct: "It is unsound — each story turns on a decision a learner can face today: repaying harm with help, sparing an animal, serving the sick, or refusing to judge someone by their background",
    wrong: [
      "It is sound — the settings are ancient palaces and forests, which no longer exist",
      "It is sound — religious stories describe events, and events cannot teach values",
      "It is partly sound — only the two Sikh stories are recent enough to be relevant",
    ],
    explanation:
      "The sub-strand's own key inquiry question asks how these teachings uplift society today. Distance in time changes the setting, not the decisions — and events are exactly how these traditions transmit values.",
  }),
  (rng) => ({
    prompt: `Two posters are proposed for a notice board in ${place(rng)}. Poster A lists each Enlightened Being with dates and places. Poster B pairs each being with one action a learner could take that week. Which better meets the outcome "appreciate the values taught by the Enlightened Beings for holistic development"?`,
    correct: "Poster B — appreciating a value means carrying it into action, which is what the outcome and the service-based learning experiences describe",
    wrong: [
      "Poster A — appreciation begins with memorising accurate facts, dates and places",
      "Poster A — a poster of actions belongs in a life-skills lesson, not in HRE",
      "Neither — posters cannot show values at all",
    ],
    explanation:
      "The outcome is about appreciating values for holistic development, and the design's learning experiences end in community service. Accurate facts matter, but a list of dates does not itself show appreciation of a value.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} suggests that because Guru Har Krishan Ji was only a child, his example is not useful for Grade 7 learners, who should study adult figures instead. Judge this suggestion.`,
      correct: "It is backwards — his example is directly useful precisely because it shows that serving others and being respected do not wait for adulthood",
      wrong: [
        "It is correct — a child Guru's decisions cannot be compared with an adult's",
        "It is correct — Grade 7 learners should only study figures of their own age or older",
        "It is neither — his age is not recorded anywhere in the tradition",
      ],
      explanation:
        "Guru Har Krishan Ji became Guru as a small child and served the sick of Delhi at the cost of his own life — an example aimed squarely at young learners. His youth is well recorded and is central to why he is remembered as 'Bala Pir'.",
    };
  },
  (rng) => ({
    prompt: `Preparing for a presentation in ${place(rng)}, ${name(rng)} says the best way to "explore the interrelationships of the Enlightened Beings" is to memorise each one's dates of birth. Judge this method against what the outcome asks for.`,
    correct: "It misses the outcome — interrelationships means the links between them, such as father and son, cousins, or the people whose lives each one changed",
    wrong: [
      "It meets the outcome — a shared timeline is the only way figures from different faiths can be related",
      "It meets the outcome — dates of birth show which being influenced the others",
      "It misses the outcome, because interrelationships means ranking the beings by importance",
    ],
    explanation:
      "The rubric's 'exceeding' level for this indicator is exploring the interrelationships using diagrams — a relationship map, such as Guru Har Rai Ji and Guru Har Krishan Ji as father and son, or Krishna and Neminath as cousins. Interrelationship never means ranking.",
  }),
  (rng) => ({
    prompt: `A debate in ${place(rng)} takes the motion: "Real compassion usually costs the person who shows it." Which piece of evidence from these five stories best supports the motion?`,
    correct: "Tirthankar Neminath gave up his own wedding and princely life to free the animals penned for the feast",
    wrong: [
      "Sage Durvasa arrived in the forest with thousands of disciples",
      "A proud pandit challenged the child Guru to explain the Bhagavad Gita",
      "Prince Siddhartha was kept away from all suffering inside the palace",
    ],
    explanation:
      "Neminath's compassion cost him the marriage and his whole princely life — the clearest case of a personal price paid. The other three statements are accurate details of the stories, but none of them describes a cost borne by someone showing compassion.",
  }),
];

const FILL_BLANK_TEMPLATES = [
  {
    before: "Guru Har Rai Ji gave rare healing medicine to ",
    after: ", the son of the Mughal emperor, even though the Mughal rulers had persecuted the Sikhs.",
    correctAnswer: "Dara Shikoh",
    acceptedAnswers: ["dara shikoh", "dara"],
    hint: "He was the emperor Shah Jahan's eldest son.",
    explanation: "Guru Har Rai Ji freely gave the rare medicines that cured Dara Shikoh, teaching that good should be returned for evil.",
  },
  {
    before: "Lord Buddha attained enlightenment while meditating under the ",
    after: " tree at Bodh Gaya.",
    correctAnswer: "Bodhi",
    acceptedAnswers: ["bodhi", "bodhi tree"],
    hint: "The tree takes its name from the word for awakening.",
    explanation: "After choosing the Middle Way, Lord Buddha attained enlightenment under the Bodhi tree at Bodh Gaya.",
  },
  {
    before: "In his first sermon at Sarnath, Lord Buddha taught the Four Noble ",
    after: ", which explain dukkha and how it can end.",
    correctAnswer: "Truths",
    acceptedAnswers: ["truths", "truth"],
    hint: "There are four of them, and they set out the problem, its cause, its ending and the path.",
    explanation: "The Four Noble Truths state that dukkha exists, that it has a cause, that it can end, and that there is a path to its ending.",
  },
  {
    before: "Tirthankar Neminath turned his wedding chariot back after hearing the cries of the ",
    after: " penned for the wedding feast.",
    correctAnswer: "animals",
    acceptedAnswers: ["animals", "animal"],
    hint: "They had been gathered to be slaughtered for food.",
    explanation: "Neminath ordered the penned animals freed and gave up both the wedding and his princely life — the sub-strand's clearest example of ahimsa.",
  },
  {
    before: "Tirthankar Neminath was on his way to marry Princess ",
    after: ", who later also renounced worldly life.",
    correctAnswer: "Rajul",
    acceptedAnswers: ["rajul", "rajimati", "rajmati"],
    hint: "Her name is also given as Rajimati.",
    explanation: "Princess Rajul was Neminath's intended bride; after he renounced the world, she followed the same path and became a nun.",
  },
  {
    before: "Guru Har Krishan Ji gave his grace to ",
    after: ", an unlettered water-carrier, who then explained the meaning of the Bhagavad Gita.",
    correctAnswer: "Chhajumal",
    acceptedAnswers: ["chhajumal", "chhaju", "chhajju"],
    hint: "A proud pandit brought him forward expecting the child Guru to fail.",
    explanation: "Chhajumal's explanation of the Gita humbled the proud pandit, showing that grace depends neither on birth nor on learning.",
  },
  {
    before: "Guru Har Krishan Ji became Guru while still a small child, and is remembered as 'Bala ",
    after: "', the child prophet.",
    correctAnswer: "Pir",
    acceptedAnswers: ["pir", "peer"],
    hint: "The title means a spiritual master — here, a child one.",
    explanation: "'Bala Pir' — the child prophet — is the title by which Guru Har Krishan Ji, who became Guru as a small child, is remembered.",
  },
  {
    before: "During the exile in the forest, Draupadi prayed to Lord ",
    after: " when Sage Durvasa arrived with thousands of disciples expecting to be fed.",
    correctAnswer: "Krishna",
    acceptedAnswers: ["krishna", "shri krishna", "sri krishna"],
    hint: "He came at once and asked her for something to eat.",
    explanation: "Lord Krishna answered Draupadi's prayer, and by eating one grain of rice from the Akshaya Patra saved the Pandavas' honour.",
  },
  {
    before: "Lord Krishna ate a single grain of ",
    after: " left in the Akshaya Patra, and Sage Durvasa and all his disciples at once felt completely full.",
    correctAnswer: "rice",
    acceptedAnswers: ["rice"],
    hint: "One grain, with a leaf still stuck to it.",
    explanation: "The single grain shows that an offering made with devotion is complete in itself, however small it appears.",
  },
  {
    before: "Guru Har Rai Ji taught that good should be returned for evil, just as sandalwood perfumes even the ",
    after: " that cuts it.",
    correctAnswer: "axe",
    acceptedAnswers: ["axe", "ax"],
    hint: "The tool that cuts down the tree.",
    explanation: "The sandalwood image is the Guru's own teaching on responding to harm with kindness — the lesson drawn from healing Dara Shikoh.",
  },
  {
    before: "The word ",
    after: " means the suffering and unsatisfactoriness whose cause and ending Lord Buddha set out to discover.",
    correctAnswer: "dukkha",
    acceptedAnswers: ["dukkha", "dukha", "duhkha"],
    hint: "It is the subject of the first of the Four Noble Truths.",
    explanation: "Dukkha — suffering or unsatisfactoriness — is what Lord Buddha investigated, and what the Four Noble Truths explain.",
  },
  {
    before: "Guru Har Krishan Ji was the son of Guru ",
    after: " Ji, which is why the two appear together in a diagram of the Enlightened Beings' interrelationships.",
    correctAnswer: "Har Rai",
    acceptedAnswers: ["har rai", "harrai", "har rai ji"],
    hint: "His father is the Guru remembered for his garden of healing herbs.",
    explanation: "Guru Har Rai Ji and Guru Har Krishan Ji are father and son — the clearest interrelationship among the five Enlightened Beings studied.",
  },
] as const;

export const enlightenedBeings: Skill = {
  id: "g7-hre-pa-enlightened-beings",
  code: "PA.1",
  subjectId: "hre",
  strandId: "g7-hre-pa",
  grade: 7,
  title: "Enlightened Beings",
  description:
    "The five Enlightened Beings of the Grade 7 design — Guru Har Rai Ji, Lord Krishna, Lord Buddha, Tirthankar Neminath and Guru Har Krishan Ji — their listed stories, the events in order, their interrelationships, and the values they teach.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["story-order", "tradition-sort", "fact-sort", "relationship-match", "value-match", "reasoning", "evaluate", "fill-blank"] as const
    );

    if (branch === "story-order") {
      const story = randChoice(rng, STORY_SEQUENCES);
      const ordered = story.steps.map((label, i) => ({ id: `s${i}`, label }));
      return {
        kind: "ordering",
        prompt: randChoice(rng, STORY_ORDER_PROMPTS(story.title)),
        instruction: "Click the events in order, from first to last.",
        items: shuffle(rng, ordered),
        correctOrder: ordered.map((s) => s.id),
        hint: story.hint,
        explanation: story.steps.join(" → "),
      };
    }

    if (branch === "tradition-sort") {
      const items = shuffle(rng, BEINGS.map((b) => ({ id: b.id, label: b.label })));
      // Two of the five beings are Sikh, so the bucket list is deduped to four faiths.
      const buckets = Array.from(new Set(BEINGS.map((b) => b.tradition))).map((t) => ({ id: t, label: t }));
      const correctBucket: Record<string, string> = {};
      for (const b of BEINGS) correctBucket[b.id] = b.tradition;
      return {
        kind: "categorize",
        prompt: randChoice(rng, TRADITION_SORT_PROMPTS),
        items,
        buckets,
        correctBucket,
        hint: "Grade 7 HRE covers four faiths — Sanatan/Vedic, Jain, Buddhist and Sikh. Two of these five Enlightened Beings share one tradition.",
        explanation: BEINGS.map((b) => `${b.label} — ${b.tradition}.`).join(" "),
      };
    }

    if (branch === "fact-sort") {
      const chosen = shuffle(rng, BEINGS).slice(0, 3);
      const pool = shuffle(rng, BEING_FACTS.filter((f) => chosen.some((b) => b.id === f.being))).slice(0, 9);
      const items = pool.map((f, i) => ({ id: `f${i}`, label: f.text }));
      const correctBucket: Record<string, string> = {};
      pool.forEach((f, i) => (correctBucket[`f${i}`] = f.being));
      return {
        kind: "categorize",
        prompt: randChoice(rng, FACT_SORT_PROMPTS),
        items,
        buckets: chosen.map((b) => ({ id: b.id, label: b.label })),
        correctBucket,
        hint: "Look for the detail that only fits one story — a garden of herbs, a wedding chariot, a Bodhi tree, an Akshaya Patra, or a water-carrier.",
        explanation: pool.map((f) => `"${f.text}" — ${BEINGS.find((b) => b.id === f.being)!.label}.`).join(" "),
      };
    }

    if (branch === "relationship-match") {
      const chosen = shuffle(rng, RELATIONSHIPS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((r) => ({ id: r.id, label: r.pair })));
      const targets = shuffle(rng, chosen.map((r) => ({ id: r.id, label: r.link })));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, RELATIONSHIP_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Some links are family ties; others are between an Enlightened Being and the person whose life they changed.",
        explanation: chosen.map((r) => `${r.pair} — ${r.link.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "value-match") {
      const chosen = shuffle(rng, BEINGS).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((b) => ({ id: b.id, label: b.label })));
      const targets = shuffle(rng, chosen.map((b) => ({ id: b.id, label: b.value })));
      const correctMap: Record<string, string> = {};
      for (const b of chosen) correctMap[b.id] = b.id;
      return {
        kind: "click-match",
        prompt: randChoice(rng, VALUE_MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about what each one actually did, and what it cost them.",
        explanation: chosen.map((b) => `${b.label} — ${b.value.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "reasoning" || branch === "evaluate") {
      const q = randChoice(rng, branch === "reasoning" ? REASONING_TEMPLATES : EVALUATE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint:
          branch === "reasoning"
            ? "Ask which story turns on the same decision as the situation described — not simply which story you remember best."
            : "Weigh the option against what the sub-strand actually asks learners to do, not against what sounds most impressive.",
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
      acceptedAnswers: [...fb.acceptedAnswers],
      inputMode: "text",
      hint: fb.hint,
      explanation: fb.explanation,
    };
  },
};
