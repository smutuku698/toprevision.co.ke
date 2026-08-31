import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

interface ComprehensionQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface Passage {
  text: string;
  questions: ComprehensionQuestion[];
  trueFalse: { text: string; isTrue: boolean }[];
  fillBlank: { before: string; after: string; correctAnswer: string; acceptedAnswers?: string[] };
  events?: { id: string; label: string }[]; // only present for the sequential clean-up passage
}

const PASSAGES: Passage[] = [
  {
    text: "By the end of every Friday market day in Kibera, thin plastic bags and empty water sachets litter the ground between the stalls. When it rains, much of this litter is washed into the nearby drainage channel, where it blocks the flow of water and makes flooding worse during storms. Concerned traders recently agreed to hand out reusable cloth bags instead of plastic ones. Within a month, county workers noticed noticeably less litter after market day, and the drainage channel flowed more freely than before.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "Traders switching to reusable bags to reduce plastic litter and flooding near the market",
          "A market that sells only cloth bags",
          "County workers who refuse to clean the drainage channel",
          "A flood that destroyed the entire market",
        ],
        correctIndex: 0,
        explanation: "The passage centres on the litter problem and the traders' solution of switching to reusable bags — the other options are not what the passage focuses on.",
      },
      {
        prompt: "According to the passage, what problem did plastic litter cause?",
        choices: [
          "It blocked the drainage channel and made flooding worse",
          "It attracted more customers to the market",
          "It made the vegetables rot faster",
          "It caused the market to be shut down permanently",
        ],
        correctIndex: 0,
        explanation: "The passage states the litter \"blocked the flow of water and makes flooding worse during storms.\"",
      },
      {
        prompt: "In the passage, the word 'concerned' most nearly means",
        choices: ["worried and wanting to act about a problem", "excited and happy about a result", "confused about what was happening", "angry at the county workers"],
        correctIndex: 0,
        explanation: "The traders were \"concerned\" because they cared about the litter problem enough to change their habits and act on it.",
      },
    ],
    trueFalse: [
      { text: "Litter builds up near the market stalls every Friday.", isTrue: true },
      { text: "Traders agreed to switch to reusable cloth bags.", isTrue: true },
      { text: "The litter had no effect on the drainage channel.", isTrue: false },
      { text: "County workers noticed more litter after the change.", isTrue: false },
    ],
    fillBlank: { before: "Concerned traders recently agreed to hand out reusable", after: "bags instead of plastic ones.", correctAnswer: "cloth" },
  },
  {
    text: "Along the busy highway through Machakos town, drivers of old matatus and lorries release thick black smoke each time they pull away from a stop. Residents who live closest to the road say they cough more often and that their washing turns grey with soot within a day of being hung outside. A local health officer explained that vehicle exhaust contains tiny particles that can settle deep in the lungs. The county has now begun inspecting vehicle emissions before renewing road licences.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "Air pollution from vehicle exhaust affecting residents along a busy highway",
          "A new highway being built through Machakos town",
          "Residents who enjoy washing their clothes outside",
          "A health officer who dislikes matatus",
        ],
        correctIndex: 0,
        explanation: "The passage describes the smoke from vehicles, its effects on residents, and the county's response — all centred on air pollution.",
      },
      {
        prompt: "According to the passage, how does vehicle exhaust affect residents' health, according to the health officer?",
        choices: [
          "Tiny particles in the exhaust can settle deep in the lungs",
          "It makes residents grow taller over time",
          "It has no effect on their health at all",
          "It only affects people who work as drivers",
        ],
        correctIndex: 0,
        explanation: "The health officer explained that \"vehicle exhaust contains tiny particles that can settle deep in the lungs.\"",
      },
      {
        prompt: "In the passage, the word 'soot' most nearly means",
        choices: ["black powdery residue left by smoke", "clean white dust from the road", "a type of vehicle engine", "a kind of washing detergent"],
        correctIndex: 0,
        explanation: "Soot is described turning washing \"grey\" after being hung outside near smoke — it is the fine black residue produced by burning.",
      },
    ],
    trueFalse: [
      { text: "Old matatus and lorries release black smoke on the highway.", isTrue: true },
      { text: "The county began inspecting vehicle emissions.", isTrue: true },
      { text: "Residents say the smoke has no effect on their washing.", isTrue: false },
      { text: "The health officer said exhaust particles are harmless.", isTrue: false },
    ],
    fillBlank: { before: "A local health officer explained that vehicle exhaust contains tiny particles that can settle deep in the", after: ".", correctAnswer: "lungs" },
  },
  {
    text: "Fishermen near the mouth of the Nzoia River noticed dead fish floating on the surface early one morning. They traced the smell upstream to a small factory that had been discharging waste water directly into the river overnight. When the fishermen reported the matter, environmental officers tested the water and confirmed it contained harmful chemicals. The factory was ordered to install a proper treatment system before it could release any water into the river again.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A factory's waste water poisoning a river and killing fish",
          "Fishermen who caught an unusually large number of fish",
          "Environmental officers building a new factory",
          "A river that dried up completely during a drought",
        ],
        correctIndex: 0,
        explanation: "The passage's central event is the discovery of dead fish caused by the factory's waste water discharge.",
      },
      {
        prompt: "According to the passage, what did the environmental officers confirm after testing the water?",
        choices: [
          "It contained harmful chemicals",
          "It was completely safe to drink",
          "It contained no waste at all",
          "It came from a different river entirely",
        ],
        correctIndex: 0,
        explanation: "The passage states officers \"tested the water and confirmed it contained harmful chemicals.\"",
      },
      {
        prompt: "In the passage, the word 'discharging' most nearly means",
        choices: ["releasing or letting out", "storing safely", "purifying or cleaning", "measuring carefully"],
        correctIndex: 0,
        explanation: "The factory was \"discharging waste water\" into the river, meaning it was releasing the water into it.",
      },
    ],
    trueFalse: [
      { text: "Fishermen found dead fish floating near the river mouth.", isTrue: true },
      { text: "The factory was ordered to install a treatment system.", isTrue: true },
      { text: "The water tested completely free of chemicals.", isTrue: false },
      { text: "The fishermen caused the pollution themselves.", isTrue: false },
    ],
    fillBlank: { before: "They traced the smell upstream to a small factory that had been discharging waste water directly into the river", after: ".", correctAnswer: "overnight" },
  },
  {
    text: "For weeks, pupils at Mji Mpya Primary complained that they could not concentrate during lessons because of the constant drilling and hammering from a construction site next to the school fence. The head teacher measured the noise using an app on her phone and found it far above the recommended classroom level. She wrote to the site managers, who agreed to pause the loudest work — drilling and demolition — during exam weeks and class time whenever possible.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "Construction noise disrupting lessons at a primary school",
          "A school that closed permanently because of noise",
          "Pupils who enjoy the sound of construction work",
          "A head teacher who built a new construction site",
        ],
        correctIndex: 0,
        explanation: "The passage focuses on how the noise affected pupils' concentration and the steps taken to reduce it.",
      },
      {
        prompt: "According to the passage, what did the site managers agree to do?",
        choices: [
          "Pause the loudest work during exam weeks and class time when possible",
          "Stop all construction work permanently",
          "Move the construction site to another town",
          "Refuse to change their working hours at all",
        ],
        correctIndex: 0,
        explanation: "The passage states the managers \"agreed to pause the loudest work — drilling and demolition — during exam weeks and class time whenever possible.\"",
      },
      {
        prompt: "In the passage, the word 'concentrate' most nearly means",
        choices: ["focus one's attention fully on something", "relax completely and rest", "shout loudly to be heard", "leave the classroom quickly"],
        correctIndex: 0,
        explanation: "Pupils could not \"concentrate\" during lessons because of the noise, meaning they could not focus their attention.",
      },
    ],
    trueFalse: [
      { text: "Pupils complained they could not concentrate because of noise.", isTrue: true },
      { text: "The head teacher measured the noise using an app on her phone.", isTrue: true },
      { text: "The site managers refused to change anything at all.", isTrue: false },
      { text: "The noise was found to be below the recommended level.", isTrue: false },
    ],
    fillBlank: { before: "She wrote to the site managers, who agreed to pause the loudest work during exam weeks and class", after: "whenever possible.", correctAnswer: "time" },
  },
  {
    text: "Last Saturday, over sixty volunteers gathered at Riverside Park for a community clean-up day. First, organisers registered each volunteer and handed out gloves and rubbish bags. Next, teams spread out along the riverbank to collect litter, mostly plastic bottles and food wrappers. After that, volunteers sorted the collected waste into recyclable and non-recyclable piles at a central point. Finally, a truck arrived to carry the sorted waste away for proper disposal and recycling. By early afternoon, the riverbank looked cleaner than it had in years.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "Volunteers organising a community clean-up to clear litter from a riverbank",
          "A truck company advertising its recycling service",
          "A park that banned visitors for the day",
          "Organisers cancelling the clean-up at the last minute",
        ],
        correctIndex: 0,
        explanation: "The passage describes the whole clean-up event from registration to final disposal — that is its main focus.",
      },
      {
        prompt: "According to the passage, what did volunteers mostly collect along the riverbank?",
        choices: [
          "Plastic bottles and food wrappers",
          "Old furniture and broken glass",
          "Fallen tree branches",
          "Lost personal belongings",
        ],
        correctIndex: 0,
        explanation: "The passage states teams \"collect litter, mostly plastic bottles and food wrappers.\"",
      },
      {
        prompt: "In the passage, the word 'sorted' most nearly means",
        choices: ["separated into different groups", "thrown away without checking", "washed thoroughly with water", "counted one by one"],
        correctIndex: 0,
        explanation: "Volunteers \"sorted the collected waste into recyclable and non-recyclable piles,\" meaning they separated it into groups.",
      },
    ],
    trueFalse: [
      { text: "Over sixty volunteers took part in the clean-up.", isTrue: true },
      { text: "Waste was sorted into recyclable and non-recyclable piles.", isTrue: true },
      { text: "The clean-up made the riverbank dirtier than before.", isTrue: false },
      { text: "No truck came to carry away the sorted waste.", isTrue: false },
    ],
    fillBlank: { before: "First, organisers registered each volunteer and handed out gloves and rubbish", after: ".", correctAnswer: "bags" },
    events: [
      { id: "register", label: "Organisers register each volunteer and hand out gloves and rubbish bags" },
      { id: "collect", label: "Teams spread out along the riverbank to collect litter" },
      { id: "sort", label: "Volunteers sort the collected waste into recyclable and non-recyclable piles" },
      { id: "dispose", label: "A truck arrives to carry the sorted waste away for disposal and recycling" },
    ],
  },
];

const POLLUTION_TYPES: { name: string; description: string }[] = [
  { name: "Plastic waste", description: "Litter such as bags and bottles that does not decompose and piles up in the environment" },
  { name: "Air pollution", description: "Smoke and fumes released by vehicles and factories that dirty the air" },
  { name: "Water pollution", description: "Waste or chemicals discharged into rivers, lakes, or oceans" },
  { name: "Noise pollution", description: "Loud, constant sound from construction, traffic, or machinery that disturbs people" },
];

export const comprehensionPollution: Skill = {
  id: "g8-eng-r-comprehension-pollution",
  code: "R.5",
  subjectId: "english",
  strandId: "g8-eng-reading",
  grade: 8,
  title: "Intensive Reading: Comprehension",
  description: "Read short passages about pollution and answer questions on main ideas, details, vocabulary in context, and sequence of events.",
  generate(rng) {
    const branch = randChoice(rng, ["mc", "truefalse", "fill", "match", "order"] as const);
    const hint = "Reread the passage carefully and look for the exact sentence that relates to the question before choosing an answer.";

    if (branch === "mc") {
      const p = randChoice(rng, PASSAGES);
      const q = randChoice(rng, p.questions);
      const correctText = q.choices[q.correctIndex];
      const choices = shuffle(rng, q.choices);
      return {
        kind: "multiple-choice",
        passage: p.text,
        prompt: q.prompt,
        choices,
        correctIndex: choices.indexOf(correctText),
        layout: "list",
        hint,
        explanation: q.explanation,
      };
    }

    if (branch === "truefalse") {
      const p = randChoice(rng, PASSAGES);
      const items = p.trueFalse.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        passage: p.text,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint,
        explanation: p.trueFalse.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the passage.`).join(" "),
      };
    }

    if (branch === "fill") {
      const p = randChoice(rng, PASSAGES);
      return {
        kind: "fill-blank",
        passage: p.text,
        prompt: "Fill in the missing word from the passage.",
        before: p.fillBlank.before,
        after: p.fillBlank.after,
        correctAnswer: p.fillBlank.correctAnswer,
        acceptedAnswers: p.fillBlank.acceptedAnswers,
        inputMode: "text",
        hint: "The exact word is stated directly in the passage above — look for the matching sentence.",
        explanation: `The passage reads: "${p.fillBlank.before} ${p.fillBlank.correctAnswer} ${p.fillBlank.after}"`,
      };
    }

    if (branch === "match") {
      const tokens = shuffle(rng, POLLUTION_TYPES.map((t) => ({ id: t.name, label: t.name })));
      const targets = shuffle(rng, POLLUTION_TYPES.map((t) => ({ id: t.name, label: t.description })));
      const correctMap: Record<string, string> = {};
      for (const t of POLLUTION_TYPES) correctMap[t.name] = t.name;
      return {
        kind: "click-match",
        prompt: "Match each type of pollution to its description.",
        tokens,
        targets,
        correctMap,
        hint: "Think about what is being polluted — land, air, water, or peaceful surroundings.",
        explanation: POLLUTION_TYPES.map((t) => `${t.name} — ${t.description.toLowerCase()}.`).join(" "),
      };
    }

    const p = PASSAGES.find((x) => x.events) as Passage;
    const events = p.events!;
    const items = shuffle(rng, events);
    return {
      kind: "ordering",
      prompt: "Arrange the steps of the community clean-up day in the correct order.",
      instruction: "Click them in order.",
      passage: p.text,
      items,
      correctOrder: events.map((e) => e.id),
      hint: "The clean-up moved from registering volunteers, to collecting litter, to sorting it, to finally disposing of it.",
      explanation: events.map((e) => e.label).join(" → "),
    };
  },
};
