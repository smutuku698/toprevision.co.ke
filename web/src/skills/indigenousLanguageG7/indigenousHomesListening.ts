import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const LISTENING_SKILLS: { skill: string; description: string }[] = [
  { skill: "Listening for the main idea", description: "Identifying what the speaker's overall message is about" },
  { skill: "Listening for specific details", description: "Picking out names, facts, or examples the speaker mentions" },
  { skill: "Note-taking while listening", description: "Jotting down key points as the speaker talks" },
  { skill: "Peer review of notes", description: "Comparing notes with a classmate to check what was missed" },
  { skill: "Vocabulary building", description: "Collecting new words heard in a text so their meaning can be learnt" },
  { skill: "Avoiding distractions", description: "Keeping your attention on the speaker instead of on other things around you" },
  { skill: "Listening without interrupting", description: "Letting the speaker finish a point before you respond" },
  { skill: "Responding to questions accurately", description: "Answering based on what the speaker actually said, not on a guess" },
  { skill: "Constructing sentences from new vocabulary", description: "Using a newly learnt word correctly in a sentence of your own" },
  { skill: "Recognising the speaker's purpose", description: "Understanding why the speaker is sharing this information" },
];

const HOME_VOCAB: { text: string; bucket: string }[] = [
  { text: "home", bucket: "A structure at an indigenous home" },
  { text: "house", bucket: "A structure at an indigenous home" },
  { text: "granary", bucket: "A structure at an indigenous home" },
  { text: "store", bucket: "A structure at an indigenous home" },
  { text: "shed", bucket: "A structure at an indigenous home" },
  { text: "visitors", bucket: "People at an indigenous home" },
  { text: "elders", bucket: "People at an indigenous home" },
  { text: "family", bucket: "People at an indigenous home" },
  { text: "stool", bucket: "Furniture" },
  { text: "chairs", bucket: "Furniture" },
  { text: "kitchen", bucket: "Place or area around a home" },
  { text: "farm", bucket: "Place or area around a home" },
];

const LISTENING_STEPS: { id: string; label: string }[] = [
  { id: "listen", label: "Listen to the reading of a text or a recorded audio clip and respond to questions" },
  { id: "note", label: "Take notes from the oral or audio clip text" },
  { id: "share", label: "Share notes with peers in class for peer review" },
  { id: "vocab", label: "Make a list of new vocabulary from the listened-to text" },
  { id: "sentence", label: "Construct simple sentences using the new vocabulary" },
  { id: "design", label: "Team up to prepare a creative mosaic of a typical indigenous home design" },
  { id: "display", label: "Display the mosaic design during the class exhibition" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "The room where meals are cooked in a home is called the", after: ".", answer: "kitchen" },
  { before: "A small building used to store harvested grain is called a", after: ".", answer: "granary" },
  { before: "People who come to spend time at a home are called", after: ".", answer: "visitors" },
  { before: "Older members of a family who are respected for their wisdom are called", after: ".", answer: "elders" },
  { before: "A traditional low seat, often carved from a single piece of wood, is called a", after: ".", answer: "stool" },
  { before: "A simple roofed structure used for storing tools or firewood near a home is called a", after: ".", answer: "shed" },
  { before: "Writing down key points while someone is speaking is called", after: ".", answer: "note-taking", accepted: ["taking notes"] },
  { before: "Before you can share notes with a classmate for review, you must first listen", after: "and record what you heard.", answer: "carefully", accepted: ["attentively", "closely"] },
  { before: "A place near a home where crops are grown is called the", after: ".", answer: "farm" },
  { before: "Collecting new words heard in a text and learning their meanings builds your", after: ".", answer: "vocabulary" },
  { before: "A room or building used to keep food and household items safe is called a", after: ".", answer: "store" },
  { before: "The people who live together in one home, including parents and children, form a", after: ".", answer: "family" },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}, in ${where}, listens to a recorded description of a grandmother's homestead and only needs the names of the buildings mentioned. What should ${who} do?`,
      correct: "Listen for the specific details — the building names — rather than trying to remember everything word for word",
      wrong: ["Write down every single word the speaker says", "Skip the recording since names are not the main idea", "Guess the building names without listening"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} is taking notes while listening to a story about indigenous homes in ${where}. Which note-taking approach will help most when answering comprehension questions afterward?`,
      correct: "Jot down key points and new vocabulary while listening",
      wrong: ["Write the whole story word for word", "Wait until the recording ends before writing anything", "Only write down words already known beforehand"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After listening to an audio clip on indigenous homes, ${who} shares notes with a classmate in ${where} for peer review. Why is this step useful?`,
      correct: "It helps catch details that one listener alone may have missed",
      wrong: ["It removes the need to listen to the clip at all", "It is only useful when the notes are wrong", "It means only one learner needs to listen next time"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While listening to a description of a homestead in ${where}, ${who} correctly says the main idea is "a typical rural home has several separate structures for different purposes." What has ${who} demonstrated?`,
      correct: "Listening for the overall message of a text, not just isolated facts",
      wrong: ["Listening for one numeric detail only", "Copying the speaker's exact words", "Guessing the topic without listening"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} hears the word "granary" for the first time while listening to a text about homes in ${where}, then later uses it correctly in a new sentence about storing grain. What skill has ${who} shown?`,
      correct: "Building vocabulary from a listened-to text and applying it in a new sentence",
      wrong: ["Memorising a word without understanding what it means", "Ignoring unfamiliar words while listening", "Repeating the speaker's sentence exactly"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `During a group listening activity about indigenous homes in ${where}, ${who} keeps checking a phone instead of following the recording. What is the likely result?`,
      correct: `${who} will miss key information needed to answer the comprehension questions afterward`,
      wrong: ["It will not affect understanding since the recording can be replayed anytime", "It will make the listening activity finish faster", "It will help remember more details than usual"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After listening to a passage about a homestead in ${where}, ${who} is asked what materials were used to build the granary. What is the best way to answer?`,
      correct: "Answer based only on what the speaker actually said in the passage",
      wrong: ["Answer using outside general knowledge instead of the passage", "Guess an answer that sounds reasonable", "Skip the question since it was not the main idea"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} listens to a clip in which an elder from ${where} explains why certain rooms exist in a traditional home. What is the purpose of this kind of listening?`,
      correct: "To understand and later communicate the information accurately",
      wrong: ["To pass time until the next lesson begins", "To copy the elder's accent exactly", "To find mistakes in the elder's speech"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After listening carefully to a description of a typical indigenous home in ${where}, ${who}'s group must design a mosaic of the home for the class exhibition. What should the group do first?`,
      correct: "Review their notes on the structures mentioned so the mosaic reflects what was actually described",
      wrong: ["Design the mosaic without referring back to any notes", "Copy another group's mosaic instead of listening again", "Skip reviewing notes since the exhibition is not graded"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `While an audio clip about homes in ${where} is playing, ${who}'s classmate keeps pausing it to ask unrelated questions. How does this affect the listening activity?`,
      correct: "It breaks the flow of information and makes the main idea harder to follow",
      wrong: ["It has no effect on understanding the text", "It always improves comprehension of the text", "It removes the need for note-taking afterward"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} finishes listening to a text about homes in ${where} and immediately answers comprehension questions without checking the notes taken. What risk does this create?`,
      correct: `${who} may answer from memory alone and miss details that were actually noted down`,
      wrong: ["There is no risk, since listening once is always enough", "The notes become unnecessary once listening is finished", "Comprehension questions never relate to details from the text"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `In ${where}, ${who} is asked to recognise why a speaker is describing a homestead's layout on the radio. What is this an example of?`,
      correct: "Recognising the speaker's purpose for sharing the information",
      wrong: ["Listening only for entertainment value", "Ignoring the reason behind the broadcast", "Assuming every broadcast has the same purpose"],
    };
  },
];

export const indigenousHomesListening: Skill = {
  id: "g7-il-ls-indigenous-homes",
  code: "LS.1",
  subjectId: "indigenous-language",
  strandId: "g7-il-listening-speaking",
  grade: 7,
  title: "Indigenous homes: listening for information",
  description: "Listen purposefully to oral texts about indigenous homes, take notes, build vocabulary, and respond to comprehension questions.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen purposefully: focus on the main idea, note key details as they are said, and check your notes before answering.";

    if (branch === "match") {
      const chosen = shuffle(rng, LISTENING_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each purposeful listening skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, HOME_VOCAB).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each word from the indigenous homes vocabulary list into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the word names a structure, a person, a piece of furniture, or a place around the home.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LISTENING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of listening to a text about indigenous homes in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: LISTENING_STEPS.map((s) => s.id),
        hint: "Start by listening and responding, then note, share, build vocabulary, use it, and finally create and display the mosaic design.",
        explanation: LISTENING_STEPS.map((s) => s.label).join(" → "),
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
