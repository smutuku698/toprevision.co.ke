import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

const SOURCES = [
  { text: "An elder in Bungoma narrating the story of how his clan settled in the area, passed down by word of mouth", type: "primary", category: "Oral tradition" },
  { text: "A grandmother in Kericho recounting what she personally witnessed during a historic drought", type: "primary", category: "Oral tradition" },
  { text: "An original 1963 independence-day newspaper kept in the Kenya National Archives", type: "primary", category: "Written record" },
  { text: "A colonial district officer's handwritten diary describing daily events he witnessed", type: "primary", category: "Written record" },
  { text: "A clay pot and iron tools dug up at an archaeological site near Lake Turkana", type: "primary", category: "Artefact" },
  { text: "A black-and-white photograph taken during the 1950s Mau Mau uprising", type: "primary", category: "Photograph" },
  { text: "The stone ruins and pillar tombs found at Gedi near the Kenyan coast", type: "primary", category: "Monument / archaeological site" },
  { text: "A textbook chapter written today that explains the causes of the Mau Mau uprising using older documents", type: "secondary", category: "Textbook" },
  { text: "A documentary film made this year that interprets old photographs and eyewitness recordings about independence", type: "secondary", category: "Documentary" },
  { text: "A history teacher's lecture notes summarising several original sources about early trade routes", type: "secondary", category: "Interpretation" },
  { text: "A museum exhibition caption explaining the meaning of artefacts found at an archaeological dig", type: "secondary", category: "Interpretation" },
] as const;

const PRESERVATION = [
  { source: "Artefacts (pots, tools, weapons)", method: "Kept and displayed in museums under controlled conditions" },
  { source: "Written records (letters, official documents)", method: "Stored and catalogued in archives" },
  { source: "Oral traditions (stories, songs, proverbs)", method: "Passed down by word of mouth from one generation to the next" },
  { source: "Photographs and old documents", method: "Digitised and saved as scanned copies for wider, safer access" },
  { source: "Monuments and archaeological sites", method: "Protected and gazetted as heritage sites to prevent destruction" },
  { source: "Rock art and cave paintings", method: "Fenced off and monitored to prevent damage from weather or visitors" },
  { source: "Newspapers", method: "Bound into volumes and microfilmed or digitised for long-term storage" },
  { source: "Government records and gazette notices", method: "Filed and stored permanently in the Kenya National Archives" },
  { source: "Coins and old currency", method: "Kept in museum coin collections and catalogued by period" },
  { source: "Traditional songs and folklore", method: "Recorded as audio or video so future generations can still hear them" },
] as const;

const KENYAN_PLACES = [
  "Kisumu",
  "Nyeri",
  "Machakos",
  "Kilifi",
  "Bungoma",
  "Kericho",
  "Eldoret",
  "Nakuru",
  "Kitale",
  "Kajiado",
  "Meru",
  "Garissa",
] as const;

const KENYAN_NAMES = [
  "Wanjiru",
  "Otieno",
  "Chebet",
  "Mutua",
  "Amina",
  "Barasa",
  "Njeri",
  "Kiptoo",
  "Achieng",
  "Wekesa",
  "Naliaka",
  "Fatuma",
] as const;

function place(rng: RNG) {
  return randChoice(rng, KENYAN_PLACES);
}
function name(rng: RNG) {
  return randChoice(rng, KENYAN_NAMES);
}

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const SIGNIFICANCE_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a researcher near ${place(rng)}, wants to know whether a community's oral account of a historic drought is accurate. Why would comparing it with a colonial district officer's written diary from the same period help?`,
      correct: "Comparing an oral account with an independent written record helps confirm details and spot any exaggeration or gaps in either source",
      wrong: [
        "Written records are always completely accurate and oral accounts are always false",
        "Comparing sources is unnecessary once a community elder has spoken about an event",
        "Only written sources count as real historical evidence",
      ],
      explanation: "Historians cross-check different sources — oral and written — because each can have gaps or bias; comparing them gives a fuller, more reliable picture of what actually happened.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a museum curator in ${place(rng)}, is cataloguing iron tools and clay pots dug up at a local archaeological site. What can these artefacts tell historians that a written account from the same period usually cannot?`,
      correct: "They provide direct physical evidence of the technology, skills, and daily life of a community, even if no one wrote about it",
      wrong: [
        "Artefacts can only be understood if a written document exists to explain them first",
        "Artefacts are less reliable than any written account of the same period",
        "Artefacts only matter if they are made of gold or other precious metal",
      ],
      explanation: "Many communities left no written records, so artefacts are often the only direct evidence of their technology and daily life — physical evidence that documents alone cannot provide.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is writing a school project on the Mau Mau uprising and finds a 1950s photograph. Why is this photograph considered a primary source, more valuable for this purpose than a documentary made about the uprising this year?`,
      correct: "The photograph was taken during the actual event, while the documentary only interprets old evidence long after it happened",
      wrong: [
        "Photographs are automatically more accurate than any written document",
        "The documentary cannot be trusted at all because it was made recently",
        "A source only counts as primary if it is in black and white",
      ],
      explanation: "A primary source comes directly from the time being studied; a secondary source, like a documentary, interprets primary sources later. Both are useful, but for evidence of the event itself, the primary source is closer to what actually happened.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a heritage officer near ${place(rng)}, notices that the stone ruins at a historic site are slowly crumbling from weather damage. Why does protecting and gazetting this site as a heritage site matter for future generations?`,
      correct: "Once a monument is destroyed, the physical evidence it holds about the past is lost forever and cannot be recreated",
      wrong: [
        "Monuments can always be rebuilt exactly as they were if they are damaged",
        "Protecting monuments is only about tourism revenue, not historical evidence",
        "Written descriptions of a monument are just as good as the monument itself",
      ],
      explanation: "Physical monuments are irreplaceable evidence of the past; once destroyed, no written description can fully substitute for the lost physical record.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is comparing two accounts of the same independence-day celebration: an original 1963 newspaper article and a textbook chapter written this year. Why might the two accounts differ, even though both describe the same event?`,
      correct: "The newspaper reflects what was known and felt at the time, while the textbook was written later with the benefit of hindsight and wider research",
      wrong: [
        "One of the two accounts must be completely fabricated and should be ignored",
        "Textbooks are always less accurate than newspapers from the same era",
        "The two accounts cannot possibly describe the same event if they differ at all",
      ],
      explanation: "A primary source captures a moment as it was experienced, while a secondary source is written later and can add analysis, context, or hindsight — differences between them are normal, not automatically a sign either is false.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, an elder's grandchild in ${place(rng)}, is recording her grandmother's stories about the clan's history before the grandmother's memory fades. Why is this recording considered historically significant?`,
      correct: "Oral traditions preserve knowledge that may never have been written down, and once the elder passes away, that first-hand memory is lost",
      wrong: [
        "Oral traditions are only useful once they are eventually written into a book",
        "Recording an elder's story is mainly a family activity with no real historical value",
        "Oral traditions are automatically less trustworthy than any written record",
      ],
      explanation: "Many communities' histories exist mainly through oral tradition; recording an elder's account before it is lost preserves evidence that would otherwise disappear.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} finds conflicting details between an eyewitness account of a historic event and a secondary textbook summary written decades later. What is the most sound way for ${who} to handle this conflict?`,
      correct: "Investigate both sources further, look for additional evidence, and note that historical accounts can genuinely differ without one being entirely wrong",
      wrong: [
        "Automatically trust the textbook because it was published more recently",
        "Automatically trust the eyewitness because they were present at the event",
        "Ignore both sources since any disagreement means neither can be used",
      ],
      explanation: "Historians do not automatically favour one type of source — they investigate further and weigh the evidence, since even genuine eyewitnesses and later writers can each have gaps or bias.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a genealogy researcher in ${place(rng)}, is trying to trace her family's history using both government birth records and family oral history. Why is using more than one type of source valuable here?`,
      correct: "Different sources can fill in gaps the other one is missing, giving a more complete and reliable picture of the family's history",
      wrong: [
        "Government records are always wrong and family oral history is always correct",
        "Using more than one source only makes the research more confusing, not more accurate",
        "Family oral history has no historical value compared with official records",
      ],
      explanation: "Combining written records with oral history lets a researcher cross-check dates and details, filling gaps that either source alone would leave.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} is studying how present-day county boundaries in ${place(rng)} came about, using old colonial administrative maps and documents. Why do historians say understanding sources like these helps explain the present, not just the past?`,
      correct: "Many present-day institutions, boundaries, and practices trace their origins to decisions and events recorded in historical sources",
      wrong: [
        "Historical sources only describe the past and have no connection to present-day life",
        "County boundaries were decided randomly and have no historical explanation",
        "Old administrative documents are irrelevant once independence was achieved",
      ],
      explanation: "Historical sources often explain why present-day boundaries, institutions, and practices exist the way they do — the past directly shapes the present.",
    };
  },
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}, a history student in ${place(rng)}, is told to always check who created a source and when, before trusting its content. Why is this step important, even for a source that looks official?`,
      correct: "Knowing the creator and date helps identify possible bias, purpose, or limitations, which affects how the source's evidence should be interpreted",
      wrong: [
        "This step is unnecessary busywork that does not affect how reliable a source is",
        "Only sources without any known creator can be trusted as unbiased",
        "The date a source was created never affects how it should be interpreted",
      ],
      explanation: "Understanding who created a source, when, and why helps a historian judge its possible bias or limitations — a key step before treating its content as reliable evidence.",
    };
  },
];

const DESCRIPTIONS = [
  { desc: "A first-hand account or object that comes directly from the time period being studied", answer: "primary source", accepted: ["primary source"] },
  { desc: "A source that interprets or comments on primary sources, often created much later", answer: "secondary source", accepted: ["secondary source"] },
  { desc: "Historical information passed down by word of mouth through storytelling, songs, or proverbs", answer: "oral tradition", accepted: ["oral tradition"] },
  { desc: "An object made or used by people in the past, such as a tool, pot, or weapon", answer: "artefact", accepted: ["artefact", "artifact"] },
  { desc: "A building or structure kept to honour and remember an important past event or person", answer: "monument", accepted: ["monument"] },
  { desc: "A place where written and official historical records are collected, stored, and catalogued", answer: "archive", accepted: ["archive", "archives"] },
  { desc: "A scientist who studies past human life by digging up and examining artefacts and sites", answer: "archaeologist", accepted: ["archaeologist"] },
  { desc: "A person who saw or experienced a historical event first-hand and can describe it", answer: "eyewitness", accepted: ["eyewitness", "witness"] },
  { desc: "The order in which events happened, arranged from earliest to most recent", answer: "chronology", accepted: ["chronology"] },
  { desc: "Traditional stories, customs, and beliefs passed down within a community, often orally", answer: "folklore", accepted: ["folklore"] },
] as const;

const VERIFY_STEPS = [
  { id: "locate", label: "Locate a possible historical source relevant to the topic" },
  { id: "check", label: "Check who created the source, and roughly when" },
  { id: "compare", label: "Compare the source with other independent sources on the same topic" },
  { id: "conclude", label: "Draw a conclusion that is supported by the strongest available evidence" },
] as const;

export const historicalInformation: Skill = {
  id: "g7-ss-nhbe-historical-information",
  code: "NHBE.1",
  subjectId: "social-studies",
  strandId: "g7-ss-nhbe",
  grade: 7,
  title: "Historical information",
  description: "Sources of historical information, distinguishing primary from secondary sources, how sources have been preserved, and why historical sources matter.",
  generate(rng) {
    const branch = randChoice(
      rng,
      ["primary-secondary", "preservation", "significance", "identify-term", "verify-order"] as const
    );

    if (branch === "primary-secondary") {
      const chosen = shuffle(rng, SOURCES).slice(0, 6);
      const buckets = [
        { id: "primary", label: "Primary source" },
        { id: "secondary", label: "Secondary source" },
      ];
      const items = chosen.map((s, i) => ({ id: `s${i}`, label: s.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((s, i) => (correctBucket[`s${i}`] = s.type));
      return {
        kind: "categorize",
        prompt: "Sort each example of historical information into primary source or secondary source.",
        items,
        buckets,
        correctBucket,
        hint: "A primary source comes directly from the time being studied (an eyewitness, an original document, an artefact). A secondary source interprets primary sources, usually much later.",
        explanation: chosen.map((s) => `"${s.text}" — this is a ${s.type} source.`).join(" "),
      };
    }

    if (branch === "preservation") {
      const chosen = shuffle(rng, [...PRESERVATION]).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.source })));
      const targets = shuffle(rng, chosen.map((p, i) => ({ id: `p${i}`, label: p.method })));
      const correctMap: Record<string, string> = {};
      chosen.forEach((p, i) => (correctMap[`p${i}`] = `p${i}`));
      return {
        kind: "click-match",
        prompt: "Match each type of historical source to how it has typically been preserved over the years.",
        tokens,
        targets,
        correctMap,
        hint: "Different sources need different methods of preservation to survive for future generations.",
        explanation: chosen.map((p) => `${p.source} — ${p.method.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "significance") {
      const q = randChoice(rng, SIGNIFICANCE_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about what historical sources actually give us access to that we could not otherwise know.",
        explanation: q.explanation,
      };
    }

    if (branch === "verify-order") {
      const items = shuffle(rng, VERIFY_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the steps a historian follows to verify and use a historical source, in the correct order.",
        instruction: "Drag to reorder from the first step to the last step.",
        items,
        correctOrder: VERIFY_STEPS.map((s) => s.id),
        hint: "You must first find a source, then check its origin, before comparing it with others and drawing a conclusion.",
        explanation: VERIFY_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    // identify-term
    const d = randChoice(rng, DESCRIPTIONS);
    return {
      kind: "fill-blank",
      prompt: `Read the description: "${d.desc}."`,
      before: "This describes a",
      after: ".",
      correctAnswer: d.answer,
      acceptedAnswers: [...d.accepted],
      inputMode: "text",
      hint: "Match the description to the correct term used when studying sources of historical information.",
      explanation: `${d.desc} — this is a(n) ${d.answer}.`,
    };
  },
};
