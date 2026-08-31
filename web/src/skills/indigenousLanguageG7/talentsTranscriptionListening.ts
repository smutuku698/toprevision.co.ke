import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const KENYAN_NAMES = ["Wanjiru", "Otieno", "Chebet", "Wafula", "Mumbi", "Kiptoo", "Nasirumbi", "Achieng", "Muthoni", "Kiprop", "Nekesa", "Karanja"] as const;
const KENYAN_PLACES = ["Nyeri", "Kisumu", "Kericho", "Bungoma", "Machakos", "Narok", "Kakamega", "Kitui", "Eldoret", "Meru", "Homa Bay", "Nakuru"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const TRANSCRIPTION_SKILLS: { skill: string; description: string }[] = [
  { skill: "Outlining target words", description: "Picking out key theme-related words from an oral text before transcribing it" },
  { skill: "Transcribing accurately", description: "Writing down exactly what is heard in a recorded paragraph, word for word" },
  { skill: "Using a digital device to listen", description: "Playing an audio recording so it can be paused and replayed while transcribing" },
  { skill: "Peer review of transcription", description: "Comparing a finished transcript with a classmate's to catch missed or wrong words" },
  { skill: "Portfolio organisation", description: "Filing finished transcriptions safely so they can be referred to later" },
  { skill: "Discussing talents and gifts", description: "Talking with peers about talents and gifts they have seen or possess" },
  { skill: "Picking out specific talents", description: "Identifying the particular talents and gifts named in an oral text" },
  { skill: "Replaying a recording", description: "Listening to a difficult section again so it can be transcribed correctly" },
  { skill: "Checking punctuation while transcribing", description: "Adding full stops and capital letters where the speaker's pauses suggest sentence breaks" },
  { skill: "Building vocabulary from transcription", description: "Noting new theme words, such as 'artist' or 'craft', met while transcribing" },
  { skill: "Sharing transcribed work", description: "Reading a completed transcription aloud to classmates for feedback" },
  { skill: "Recognising transcription's role in language growth", description: "Understanding that written records help preserve and grow an indigenous language" },
];

const THEME_VOCAB: { text: string; bucket: string }[] = [
  { text: "talent", bucket: "Talent and gift vocabulary" },
  { text: "gift", bucket: "Talent and gift vocabulary" },
  { text: "performance", bucket: "Talent and gift vocabulary" },
  { text: "sing", bucket: "Talent and gift vocabulary" },
  { text: "artist", bucket: "Talent and gift vocabulary" },
  { text: "artwork", bucket: "Talent and gift vocabulary" },
  { text: "stage", bucket: "Talent and gift vocabulary" },
  { text: "craft", bucket: "Talent and gift vocabulary" },
  { text: "transcript", bucket: "Transcription process vocabulary" },
  { text: "recording", bucket: "Transcription process vocabulary" },
  { text: "portfolio", bucket: "Transcription process vocabulary" },
  { text: "digital device", bucket: "Transcription process vocabulary" },
  { text: "paragraph", bucket: "Transcription process vocabulary" },
  { text: "peer review", bucket: "Transcription process vocabulary" },
];

const LISTENING_STEPS: { id: string; label: string }[] = [
  { id: "listen", label: "Listen to an oral text on talents and gifts and pick out specific talents and gifts" },
  { id: "transcribe", label: "Write a paragraph by transcribing an audio recorded story based on the theme and share with peers" },
  { id: "review", label: "Peer review each other's transcription for accuracy" },
  { id: "portfolio", label: "Organise the transcribed work in a portfolio" },
  { id: "discuss", label: "Work with peers to discuss talents and gifts they have seen or they possess" },
];

const FILLS: { before: string; after: string; answer: string; accepted?: string[] }[] = [
  { before: "Writing down exactly what is heard in an audio recording is called", after: ".", answer: "transcription" },
  { before: "A natural ability to do something well, such as singing or drawing, is called a", after: ".", answer: "talent" },
  { before: "An ability someone is naturally given, similar to a talent, is called a", after: ".", answer: "gift" },
  { before: "A person who practises a skill such as painting or music is called an", after: ".", answer: "artist" },
  { before: "A piece of created visual work, such as a painting or sculpture, is called", after: ".", answer: "artwork" },
  { before: "The raised platform where a performer stands to be seen by an audience is called the", after: ".", answer: "stage" },
  { before: "An activity done in front of an audience, such as singing or dancing, is called a", after: ".", answer: "performance" },
  { before: "A skill that involves making something by hand, such as weaving, is called a", after: ".", answer: "craft" },
  { before: "Before transcribing an audio recording, you should first outline the target", after: "related to the theme.", answer: "words" },
  { before: "Checking a completed transcription against a classmate's version for errors is called", after: ".", answer: "peer review", accepted: ["peer reviewing"] },
  { before: "A collection where finished transcriptions are safely organised and kept is called a", after: ".", answer: "portfolio" },
  { before: "Accurately transcribing oral texts over time helps indigenous languages to", after: ".", answer: "grow", accepted: ["develop"] },
];

interface ScenarioMC { prompt: string; correct: string; wrong: string[] }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} listens to an oral text on talents and gifts and needs to pick out only the specific talents mentioned before transcribing the paragraph. What should ${who} do first?`,
      correct: "Listen through fully and note down the specific talents and gifts mentioned",
      wrong: ["Start transcribing immediately without listening first", "Guess likely talents without listening to the recording", "Skip listening since transcription does not need it"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} is transcribing a recorded story from a digital device in ${where} and reaches a section spoken too quickly to catch every word. What is the best next step?`,
      correct: "Replay that section of the recording until it can be transcribed accurately",
      wrong: ["Leave that section out of the transcript", "Write down a guess for the missing words", "Stop the whole transcription task"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `After finishing a transcription in ${where}, ${who} exchanges it with a classmate to check for missed or incorrect words. What is this step called and why is it useful?`,
      correct: "Peer review — it helps catch errors one transcriber alone might miss",
      wrong: ["Portfolio organisation, which files work but does not check accuracy", "Proofreading an essay unrelated to the transcription task", "Editing the recording itself rather than the transcript"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} transcribes a recorded story but writes a short summary of the main points instead of the exact words spoken. What mistake has ${who} made?`,
      correct: "Summarising instead of transcribing the text word for word",
      wrong: ["Transcribing too accurately", "Listening too many times to the recording", "Writing the paragraph too neatly"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finishes several transcriptions during the term and wants to keep them safe and organised for later reference. What should ${who} do?`,
      correct: "File the transcriptions in a portfolio",
      wrong: ["Delete the recordings once transcribed", "Keep the transcriptions unsorted on loose paper", "Rewrite them from memory each time they are needed"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `In a group discussion on talents and gifts in ${where}, ${who} shares a talent seen in a family member and listens to what classmates have observed too. What value does this discussion mainly practise?`,
      correct: "Citizenship — engaging in constructive dialogue about talents and gifts with peers",
      wrong: ["Working entirely alone without discussing with peers", "Ignoring what peers have observed about talents", "Refusing to share opinions during the discussion"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is asked why accurate transcription matters for indigenous languages long after a story was recorded. What is the best answer?`,
      correct: "It helps preserve and grow the language by creating a written record of oral texts",
      wrong: ["It replaces the need to speak the language at all", "It only matters for languages that are already written", "It has no effect on the language once the transcript is complete"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} transcribes a recorded story about a young artist but forgets to add capital letters and full stops. What has ${who} overlooked?`,
      correct: "Following punctuation and sentence conventions that reflect the speaker's pauses",
      wrong: ["Choosing an interesting story to transcribe", "Using a digital device to listen to the recording", "Discussing the story's topic with a classmate"],
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `Before transcribing, ${who} is told to first outline the target words related to the theme from the oral text. Why is this step useful?`,
      correct: "It helps identify key theme vocabulary to listen for before writing the full transcription",
      wrong: ["It replaces the need to transcribe the text afterward", "It is only useful after the transcription is finished", "It has no connection to understanding the oral text"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} in ${where} plays a recording only once, transcribes what can be remembered, and never replays unclear sections. What risk does this create?`,
      correct: "Missed or inaccurate words in the transcript from parts not clearly heard",
      wrong: ["No risk, since one listen is always enough for accurate transcription", "The recording will automatically correct itself", "Peer review becomes unnecessary as a result"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who} and classmates discuss talents and gifts they have seen in their community in ${where} before transcribing an oral text on the theme. What is the purpose of this discussion?`,
      correct: "To build shared understanding of the theme's vocabulary and ideas before working with the text",
      wrong: ["To avoid having to listen to the oral text afterward", "To replace the transcription task entirely", "To test who can list the most talents fastest"],
    };
  },
  (rng) => {
    const who = name(rng), where = place(rng);
    return {
      prompt: `${who}'s transcription of a story recorded in ${where} contains the exact words spoken but places them in the wrong order, changing the meaning. What did ${who} do incorrectly?`,
      correct: "Failed to transcribe the words in the order they were actually spoken",
      wrong: ["Used punctuation correctly", "Chose a good recording to work from", "Shared the work with a peer for review"],
    };
  },
];

export const talentsTranscriptionListening: Skill = {
  id: "g7-il-ls-talents-gifts",
  code: "LS.7",
  subjectId: "indigenous-language",
  strandId: "g7-il-listening-speaking",
  grade: 7,
  title: "Talents and gifts: intensive listening (transcription)",
  description: "Listen to oral texts about talents and gifts, outline target words, and transcribe a short paragraph from a digital device accurately.",
  generate(rng) {
    const branch = randChoice(rng, ["match", "categorize", "order", "fill", "mc"] as const);
    const hint = "Listen for the specific talents and gifts named, then transcribe exactly what is said — replay unclear parts before writing them down.";

    if (branch === "match") {
      const chosen = shuffle(rng, TRANSCRIPTION_SKILLS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.skill })));
      const targets = shuffle(rng, chosen.map((s) => ({ id: s.skill, label: s.description })));
      const correctMap: Record<string, string> = {};
      for (const s of chosen) correctMap[s.skill] = s.skill;
      return {
        kind: "click-match",
        prompt: "Match each transcription skill to its description.",
        tokens,
        targets,
        correctMap,
        hint,
        explanation: chosen.map((s) => `${s.skill} — ${s.description.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const chosen = shuffle(rng, THEME_VOCAB).slice(0, 7);
      const bucketNames = Array.from(new Set(chosen.map((c) => c.bucket)));
      const buckets = bucketNames.map((b) => ({ id: b, label: b }));
      const items = chosen.map((c, i) => ({ id: `w${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`w${i}`] = c.bucket));
      return {
        kind: "categorize",
        prompt: "Sort each word into the correct group.",
        items,
        buckets,
        correctBucket,
        hint: "Think about whether the word names a talent or gift, or part of the transcription process.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.bucket.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "order") {
      const items = shuffle(rng, LISTENING_STEPS);
      return {
        kind: "ordering",
        prompt: "Arrange the steps of transcribing an oral text on talents and gifts in the correct order.",
        instruction: "Click them in order.",
        items,
        correctOrder: LISTENING_STEPS.map((s) => s.id),
        hint: "Start by listening and picking out talents, then transcribe, review with a peer, file the work, and finally discuss talents and gifts.",
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
