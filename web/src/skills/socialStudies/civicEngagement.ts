import { randChoice, shuffle } from "@/lib/rng";
import type { Skill } from "@/lib/types";

const POSITIONS: { name: string; level: "national" | "county" }[] = [
  { name: "President", level: "national" },
  { name: "Member of National Assembly (MP)", level: "national" },
  { name: "Senator", level: "national" },
  { name: "Woman Representative", level: "national" },
  { name: "Governor", level: "county" },
  { name: "Member of County Assembly (MCA)", level: "county" },
];

const ACTIVITIES: { name: string; meaning: string; scope: "individual" | "collective" }[] = [
  { name: "Voting in an election", meaning: "Casting a ballot to choose leaders, a right and duty of every eligible citizen", scope: "individual" },
  { name: "Vying for elective office", meaning: "Standing as a candidate for a position such as MP, MCA, or Governor", scope: "individual" },
  { name: "Writing to a local leader about an issue", meaning: "Personally raising a concern directly with an elected representative", scope: "individual" },
  { name: "Monitoring a public project for accountability", meaning: "Individually checking that public funds are used properly on a project", scope: "individual" },
  { name: "Joining a political party", meaning: "Becoming a member of an organised group that contests elections and shapes policy", scope: "collective" },
  { name: "Attending a public participation forum", meaning: "Joining other citizens to give views on a proposed law, budget, or policy", scope: "collective" },
  { name: "Volunteering in a community clean-up project", meaning: "Working together with others to improve the shared environment", scope: "collective" },
  { name: "Joining a civil society or advocacy group", meaning: "Working with others in an organisation that campaigns for a cause or right", scope: "collective" },
  { name: "Participating in a referendum", meaning: "Joining fellow citizens in a direct vote on a specific national question", scope: "collective" },
  { name: "Forming a community-based organisation", meaning: "Coming together with neighbours to organise around a shared local need", scope: "collective" },
] as const;

const VALUES: { name: string; meaning: string }[] = [
  { name: "Social Justice", meaning: "Fair distribution of resources, opportunities, and treatment across society" },
  { name: "Integrity", meaning: "Being honest, consistent, and holding strong moral principles in public and civic life" },
  { name: "Peace", meaning: "Living harmoniously and resolving disagreements without violence, essential for stable governance" },
] as const;

const PARTY_QUESTIONS: { prompt: string; choices: string[]; correctIndex: number; explanation: string }[] = [
  {
    prompt: "What is a key role of political parties in Kenya's democratic governance?",
    choices: ["Nominating candidates and representing citizens' policy preferences in elections", "Directly appointing judges to the Supreme Court", "Collecting taxes on behalf of county governments", "Replacing the Independent Electoral and Boundaries Commission"],
    correctIndex: 0,
    explanation: "Political parties nominate candidates for election and represent the policy preferences and interests of the citizens who support them.",
  },
  {
    prompt: "A citizen believes political parties have no real role once an election is over. Is this accurate?",
    choices: ["No — parties, especially those in opposition, continue to hold government accountable between elections", "Yes — parties disband immediately after every election", "Yes — only the winning party's members remain citizens", "No — parties take over all judicial functions after winning"],
    correctIndex: 0,
    explanation: "Political parties, especially opposition parties, continue to play a role between elections by scrutinising and holding the government accountable.",
  },
  {
    prompt: "Why do political parties help voters make informed choices in a democracy?",
    choices: ["They present clear policy platforms voters can compare before voting", "They decide the outcome of elections without any voting", "They eliminate the need for the IEBC to conduct elections", "They ensure every candidate wins a position"],
    correctIndex: 0,
    explanation: "Parties present policy platforms and organise candidates, helping voters compare choices and make informed decisions before voting.",
  },
  {
    prompt: "A political party mobilises its supporters to register as voters ahead of an election. What civic function does this serve?",
    choices: ["Educating and mobilising citizens to participate in the democratic process", "Replacing the courts in resolving election disputes", "Removing the need for a fair and free election", "Reducing the number of registered voters"],
    correctIndex: 0,
    explanation: "Mobilising citizens to register and vote is a core civic-engagement function of political parties, strengthening democratic participation.",
  },
] as const;

const ELECTION_STEPS = [
  { id: "register", label: "Eligible citizens register as voters" },
  { id: "campaign", label: "Candidates and parties campaign to explain their policies" },
  { id: "vote", label: "Citizens cast their votes on election day" },
  { id: "count", label: "Votes are counted and tallied at polling stations" },
  { id: "declare", label: "The IEBC declares and announces the official results" },
] as const;

const FILL_BLANK_TEMPLATES = [
  { before: "Taking part in activities that shape decisions and leadership in government is called ", after: " engagement.", correctAnswer: "civic", accepted: ["civic"], explanation: "Civic engagement is participating in activities that shape government decisions and leadership, individually or collectively." },
  { before: "The value of fair distribution of resources, opportunities, and treatment across society is called social ", after: ".", correctAnswer: "justice", accepted: ["justice"], explanation: "Social justice means resources, opportunities, and treatment are fairly distributed across society." },
  { before: "Being honest, consistent, and holding strong moral principles in public life is called ", after: ".", correctAnswer: "integrity", accepted: ["integrity"], explanation: "Integrity means being honest, consistent, and principled, especially in public and civic conduct." },
  { before: "Living harmoniously and resolving disagreements without violence is called ", after: ".", correctAnswer: "peace", accepted: ["peace"], explanation: "Peace means resolving disagreements without violence, which is essential for stable, functioning governance." },
  { before: "A direct vote by citizens on a specific national question, such as a constitutional change, is called a ", after: ".", correctAnswer: "referendum", accepted: ["referendum"], explanation: "A referendum is a direct vote by citizens on a specific national question." },
  { before: "The body responsible for conducting and declaring the results of Kenya's general elections is the ", after: ".", correctAnswer: "IEBC", accepted: ["iebc", "independent electoral and boundaries commission"], explanation: "The Independent Electoral and Boundaries Commission (IEBC) conducts elections and declares official results." },
  { before: "The process of citizens giving their views on a proposed law, budget, or policy is called public ", after: ".", correctAnswer: "participation", accepted: ["participation"], explanation: "Public participation is the process through which citizens give their views on proposed laws, budgets, or policies." },
  { before: "An organised group of citizens that nominates candidates and contests elections is called a political ", after: ".", correctAnswer: "party", accepted: ["party"], explanation: "A political party is an organised group that nominates candidates and contests elections to shape government policy." },
  { before: "The person elected to lead a county government is the ", after: ".", correctAnswer: "Governor", accepted: ["governor"], explanation: "The Governor is the elected leader of a county government's executive." },
  { before: "Working with an organisation that campaigns for a cause or protects a right is called joining ", after: " society.", correctAnswer: "civil", accepted: ["civil"], explanation: "Civil society organisations campaign for causes or protect rights, and joining one is a collective form of civic engagement." },
] as const;

export const civicEngagement: Skill = {
  id: "ss-pdg-civic-engagement",
  code: "PDG.2",
  subjectId: "social-studies",
  strandId: "ss-pdg",
  grade: 9,
  title: "Civic engagement in governance",
  description: "Positions vied for in a Kenyan general election, sorted by level of government.",
  generate(rng) {
    const hint = "Kenya's general election fills six elective positions across the national and county levels.";
    const branch = randChoice(rng, ["level-mc", "level-categorize", "activity-match", "scope-categorize", "party-mc", "election-order", "fill-blank"] as const);

    if (branch === "level-mc") {
      const target = randChoice(rng, POSITIONS);
      const choices = shuffle(rng, ["National government", "County government"]);
      const correctLabel = target.level === "national" ? "National government" : "County government";

      return {
        kind: "multiple-choice",
        prompt: `Is the position of ${target.name} a national or county government position?`,
        choices,
        correctIndex: choices.indexOf(correctLabel),
        layout: "row",
        hint,
        explanation: `${target.name} is a ${target.level} government position.`,
      };
    }

    if (branch === "level-categorize") {
      const chosen = shuffle(rng, POSITIONS).slice(0, 6);
      const items = chosen.map((p) => ({ id: p.name, label: p.name }));
      const correctBucket: Record<string, string> = {};
      for (const p of chosen) correctBucket[p.name] = p.level;

      return {
        kind: "categorize",
        prompt: "Sort each elective position by whether it is a national or county government position.",
        items,
        buckets: [
          { id: "national", label: "National government" },
          { id: "county", label: "County government" },
        ],
        correctBucket,
        hint,
        explanation: chosen.map((p) => `${p.name} is a ${p.level} government position.`).join(" "),
      };
    }

    if (branch === "activity-match") {
      const pool = [...ACTIVITIES.map((a) => ({ name: a.name, meaning: a.meaning })), ...VALUES.map((v) => ({ name: v.name, meaning: v.meaning }))];
      const chosen = shuffle(rng, pool).slice(0, 4);
      const tokens = shuffle(rng, chosen.map((c) => ({ id: c.name, label: c.name })));
      const targets = shuffle(rng, chosen.map((c) => ({ id: c.name, label: c.meaning })));
      const correctMap: Record<string, string> = {};
      for (const c of chosen) correctMap[c.name] = c.name;

      return {
        kind: "click-match",
        prompt: "Match each civic engagement activity or value to what it means.",
        tokens,
        targets,
        correctMap,
        hint: "Civic engagement includes both individual actions and collective activities done together with others.",
        explanation: chosen.map((c) => `${c.name} — ${c.meaning.toLowerCase()}.`).join(" "),
      };
    }

    if (branch === "scope-categorize") {
      const chosen = shuffle(rng, ACTIVITIES).slice(0, 6);
      const items = chosen.map((a, i) => ({ id: `a${i}`, label: a.name }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((a, i) => (correctBucket[`a${i}`] = a.scope));
      return {
        kind: "categorize",
        prompt: "Sort each civic engagement activity as individual or collective.",
        items,
        buckets: [
          { id: "individual", label: "An individual civic engagement activity" },
          { id: "collective", label: "A collective civic engagement activity" },
        ],
        correctBucket,
        hint: "An individual activity is done alone; a collective activity is done together with other citizens or an organised group.",
        explanation: chosen.map((a) => `${a.name} — ${a.scope} civic engagement.`).join(" "),
      };
    }

    if (branch === "party-mc") {
      const q = randChoice(rng, PARTY_QUESTIONS);
      const choices = shuffle(rng, q.choices.map((c, i) => ({ c, correct: i === q.correctIndex })));
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices: choices.map((c) => c.c),
        correctIndex: choices.findIndex((c) => c.correct),
        hint: "Think about what political parties actually do: nominate candidates, represent citizens, and hold government accountable.",
        explanation: q.explanation,
      };
    }

    if (branch === "election-order") {
      const items = shuffle(rng, ELECTION_STEPS.map((s) => ({ id: s.id, label: s.label })));
      return {
        kind: "ordering",
        prompt: "Arrange the stages of a Kenyan general election in the order they happen.",
        instruction: "Drag to reorder from the first stage to the last stage.",
        items,
        correctOrder: ELECTION_STEPS.map((s) => s.id),
        hint: "Voters must register before campaigns matter, and votes must be cast before they can be counted or declared.",
        explanation: ELECTION_STEPS.map((s, i) => `${i + 1}. ${s.label}.`).join(" "),
      };
    }

    const fb = randChoice(rng, FILL_BLANK_TEMPLATES);
    return {
      kind: "fill-blank",
      prompt: "Complete the sentence about civic engagement in governance.",
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.correctAnswer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the vocabulary used to describe civic values, activities, and elections.",
      explanation: fb.explanation,
    };
  },
};
