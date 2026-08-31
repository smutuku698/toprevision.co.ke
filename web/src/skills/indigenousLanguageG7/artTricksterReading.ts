import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const TRICKSTER_SKILLS: { skill: string; description: string }[] = [
  { skill: "Paraphrasing", description: "Retelling a trickster story's ideas in your own words rather than copying it" },
  { skill: "Analysing a narrative", description: "Examining a trickster story's characters, plot, and lesson closely" },
  { skill: "Reader's theatre", description: "Reading a narrative aloud together, with each learner taking on a character's part" },
  { skill: "Outlining plot", description: "Setting out the sequence of events and characters in a trickster narrative" },
  { skill: "Brainstorming trickster characters", description: "Listing figures commonly portrayed as tricksters in oral narratives" },
  { skill: "Composing a summary", description: "Writing a short, condensed account of a trickster story after listening to it" },
  { skill: "Staging a skit", description: "Acting out a trickster narrative creatively with peers" },
  { skill: "Valuing oral narratives", description: "Appreciating trickster stories as an enjoyable part of oral tradition" },
  { skill: "Collecting varied narratives", description: "Gathering trickster stories from different sources in the community" },
  { skill: "Organising a class portfolio", description: "Arranging collected trickster narratives together for the class to use" },
  { skill: "Identifying the trickster", description: "Recognising which character in the narrative is the recurring cunning figure" },
  { skill: "Brainstorming moral lessons", description: "Discussing the lesson or lessons a trickster narrative addresses" },
];

const FABLE_VS_TRICKSTER: { text: string; bucket: string }[] = [
  { text: "Centres on a recurring, cunning character who outwits others", bucket: "Trickster story" },
  { text: "Usually features whichever animal characters best suit the moral being taught", bucket: "Fable" },
  { text: "The plot is built around a scheme to trick or fool another character", bucket: "Trickster story" },
  { text: "Ends with a clearly stated moral lesson as its defining feature", bucket: "Fable" },
  { text: "A hare repeatedly uses cleverness to escape a stronger animal", bucket: "Trickster story" },
  { text: "Animal characters mainly stand in for human character traits", bucket: "Fable" },
  { text: "The story's centre is the outwitting itself, not a stated lesson", bucket: "Trickster story" },
  { text: "A tortoise's patience teaches that slow, steady effort wins", bucket: "Fable" },
  { text: "The same cunning character reappears across many different stories", bucket: "Trickster story" },
  { text: "A short animal story built mainly to deliver a moral at the end", bucket: "Fable" },
  { text: "A hyena tries to trick a hare out of food but is outwitted instead", bucket: "Trickster story" },
  { text: "Character traits like greed or pride are shown mainly to teach a lesson", bucket: "Fable" },
];

const TRICKSTER_STEPS: { id: string; label: string }[] = [
  { id: "collect", label: "Work collaboratively to collect varied trickster narratives from the community" },
  { id: "organise", label: "Organise the collection of trickster narratives in a class portfolio" },
  { id: "brainstorm", label: "Brainstorm characters often portrayed as tricksters in oral narratives" },
  { id: "theatre", label: "Conduct a reader's theatre to read the trickster narrative in the class portfolio" },
  { id: "listen", label: "Listen to a resource person narrate a trickster story" },
  { id: "summary", label: "Compose a short summary of the trickster narrative listened to" },
  { id: "outline", label: "Outline the characters and plot in a trickster narrative" },
  { id: "skit", label: "Work collaboratively to stage a creative skit on a trickster narrative" },
  { id: "morals", label: "Brainstorm the moral lessons addressed in trickster narratives" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "Retelling a story's ideas in your own words, rather than copying them, is called", after: ".", answer: "paraphrasing", accepted: ["paraphrase"] },
  { before: "A narrative built around a recurring, cunning character who outwits others is called a", after: "story.", answer: "trickster" },
  { before: "Examining a narrative's characters, plot, and lesson closely is called", after: "it.", answer: "analysing", accepted: ["analyzing"] },
  { before: "Reading a narrative aloud together, with each learner taking a character's part, is called a reader's", after: ".", answer: "theatre", accepted: ["theater"] },
  { before: "A short, condensed account of a story you listened to is called a", after: ".", answer: "summary" },
  { before: "Setting out the sequence of events and characters in a narrative is called", after: "the plot.", answer: "outlining" },
  { before: "Acting out a narrative creatively with peers is called staging a", after: ".", answer: "skit" },
  { before: "Appreciating oral narratives as an enjoyable part of a community's tradition is called", after: "them.", answer: "valuing" },
  { before: "Unlike a fable, a trickster story centres on a recurring", after: "character who outwits others.", answer: "cunning", accepted: ["trickster"] },
  { before: "A trickster narrative collection kept together for the whole class to use is called a class", after: ".", answer: "portfolio" },
  { before: "Listing out characters commonly portrayed as tricksters in oral narratives is called", after: "characters.", answer: "brainstorming" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} listens to a resource person narrate a story about a hare who repeatedly tricks a hyena out of food. What kind of narrative is this?`,
      correct: "A trickster story — it centres on a recurring, cunning character who outwits others",
      wrong: ["A fable, since it simply has animal characters", "A letter of request, since it is spoken by a resource person", "A direct-question passage, since the events are stated plainly"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} is comparing a story about a boastful hare who loses a race, and a story about a hare who repeatedly outwits a hyena, in ${where}. What is the key difference between them?`,
      correct: "The first is a fable built around a moral lesson; the second is a trickster story built around a recurring cunning character",
      wrong: ["There is no real difference, since both stories feature a hare", "The first is longer, so it must be the trickster story", "The second must be a fable, since it also has a moral"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After listening to a trickster narrative in ${where}, ${who} writes a short account of it in their own summarised words instead of retelling every sentence. What has ${who} done?`,
      correct: "Paraphrased the narrative — retold its ideas in their own words rather than copying it",
      wrong: ["Copied the narrative word for word", "Analysed the narrative's grammar only", "Ignored the narrative's plot entirely"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s group in ${where} outlines the characters and events of a trickster narrative before staging a skit on it. Why is this outlining step useful?`,
      correct: "It makes the sequence of events and the trickster's actions clear before acting the story out",
      wrong: ["It replaces the need to read or listen to the narrative at all", "It is only useful for a written test, not a skit", "It changes the narrative's actual events to suit the group"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} brainstorms with peers about which animals are usually portrayed as tricksters in oral narratives. What is this activity mainly building?`,
      correct: "Recognition of recurring trickster characters across different community narratives",
      wrong: ["A list of every animal that appears in any story, trickster or not", "A moral lesson for a fable instead of a trickster story", "A reading passage with only direct questions"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} takes part in a reader's theatre, reading a character's lines from the class portfolio's trickster narrative aloud. What skill does this practise?`,
      correct: "Reading a narrative aloud with a character's voice, as part of analysing and enjoying it",
      wrong: ["Writing a brand-new trickster narrative from scratch", "Translating the narrative into a completely different language", "Memorising the narrative for a spelling test"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} collects several trickster narratives from different sources in ${where} and organises them in a class portfolio. Why collect narratives from varied sources?`,
      correct: "To gather a wider, more representative range of trickster narratives from the community",
      wrong: ["Because only one narrative is ever considered a real trickster story", "Because varied sources are required only for fables, not trickster stories", "Because collecting from one source alone is against the activity's rules"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} claims a story is a trickster story just because an animal appears in it. What is missing from this idea?`,
      correct: "A trickster story specifically needs a recurring, cunning character whose outwitting drives the plot, not just any animal appearing",
      wrong: ["Nothing — any story with an animal in it is automatically a trickster story", "A trickster story must always be written down, never told aloud", "A trickster story must always end with the trickster being punished"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After analysing a trickster narrative in ${where}, ${who} explains why it is valued and retold across generations. What has ${who} shown?`,
      correct: "Valuing oral narratives as an enjoyable and meaningful part of a community's tradition",
      wrong: ["Memorising the narrative with no understanding of its meaning", "Dismissing the narrative as unimportant compared to written stories", "Inventing a new ending the community never told"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} brainstorms the moral lessons addressed in a trickster narrative about a hare outwitting a lion. What is being examined here?`,
      correct: "The underlying lessons the trickster narrative's events point to, beyond just the outwitting itself",
      wrong: ["Only the exact words the narrator used", "The narrator's personal opinion of the lion", "The length of time the narration took"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s class in ${where} stages a creative skit based on a trickster narrative in their portfolio. What should the skit stay faithful to?`,
      correct: "The trickster character's cunning actions and the events as collected from the community",
      wrong: ["Nothing in particular, since a skit can invent an entirely new plot", "Only the narrator's exact tone of voice, not the events", "The moral lesson of a completely different fable instead"],
    };
  },
];

export const artTricksterReading: Skill = {
  id: "g7-il-r-indigenous-art",
  code: "R.8",
  subjectId: "indigenous-language",
  strandId: "g7-il-reading",
  grade: 7,
  title: "Trickster stories: intensive reading",
  description: "Paraphrase and analyse trickster stories from the community, distinguish them from fables, and value reading oral narratives.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "A trickster story centres on a recurring, cunning character who outwits others — a fable centres on animal characters whose actions teach a stated moral lesson.";

    if (branch === "match") {
      const chosen = shuffle(rng, TRICKSTER_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each trickster-story reading skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, FABLE_VS_TRICKSTER).slice(0, 8);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `d${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`d${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each description as belonging to a fable or a trickster story.",
        items,
        buckets,
        correctBucket,
        hint: "A trickster story centres on a recurring cunning character who outwits others; a fable centres on animal characters whose actions teach a stated moral.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, TRICKSTER_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of reading trickster stories from the community in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: TRICKSTER_STEPS.map((s) => s.id),
        hint: "Start by collecting, then organise, brainstorm characters, read together, listen to a resource person, summarise, outline, stage a skit, then brainstorm morals.",
        explanation: TRICKSTER_STEPS.map((s) => s.label).join(" → "),
      };
    }

    if (branch === "fill") {
      const entry = randChoice(rng, FILLS);
      return {
        kind: "fill-blank",
        prompt: "Fill in the missing word.",
        before: entry.before,
        after: entry.after,
        correctAnswer: entry.answer,
        acceptedAnswers: entry.accepted,
        inputMode: "text",
        hint,
        explanation: `${entry.before} ${entry.answer} ${entry.after}`.replace(/\s+/g, " ").trim(),
      };
    }

    const template = randChoice(rng, REASONING_TEMPLATES);
    const entry = template(rng);
    const choices = shuffle(rng, [entry.correct, ...entry.wrong]);
    return {
      kind: "multiple-choice",
      prompt: entry.prompt,
      choices,
      correctIndex: choices.indexOf(entry.correct),
      layout: "list",
      hint,
      explanation: `The correct answer is "${entry.correct}".`,
    };
  },
};
