import { randChoice, shuffle } from "@/lib/rng";
import type { RNG } from "@/lib/rng";
import { buildChoicesFromStrings } from "@/skills/mathG8/mathUtils";
import type { Skill } from "@/lib/types";

// CH.2 "Role of the Church in Education and Health" has no natural sequence, spatial layout,
// or numeric quantity in its source content (unordered lists of contributions, barriers, and
// solutions) — so this skill genuinely supports only 4 QuestionKinds (multiple-choice,
// categorize, click-match, fill-blank), following the same documented-cap pattern as
// creativeArtsSportsG7/introduction.ts.

const CATEGORIZE_PROMPTS = [
  "Sort each statement as a barrier to effective church mission work, or a solution to such barriers.",
  "Decide whether each statement is a barrier or a solution, and sort it there.",
  "Group these statements under barrier or solution.",
  "Sort each statement below into the correct category.",
  "Place each statement into the bucket for barrier or solution.",
  "Read each statement and sort it under barrier or solution.",
];

const MATCH_PROMPTS = [
  "Match each term to its meaning.",
  "Pair each term below with its correct meaning.",
  "Connect each term to the meaning it fits.",
  "Match each term to the statement that explains it.",
  "Link each term below to its correct definition.",
  "Match each term to the description that fits it.",
];

const FILL_PROMPTS = [
  "Fill in the missing word.",
  "Complete the sentence with the correct word.",
  "Supply the word that completes this fact.",
  "Fill in the blank below.",
  "Read the sentence and fill in the missing word.",
  "Complete this fact about the church's role in education and health with the right word.",
];

const BARRIERS = [
  "Shortage of funding to build, staff, and maintain schools and hospitals",
  "Insecurity in some regions, making it hard to reach or serve communities",
  "Poor roads and infrastructure limiting access to remote mission facilities",
  "Understaffing of trained teachers, doctors, and nurses in mission institutions",
  "Cultural resistance to some church-led health or education programmes in certain communities",
  "Bureaucratic delays in government approvals for new schools or health facilities",
  "Competition and lack of coordination among different denominations doing similar work",
  "Corruption diverting resources meant for schools or hospitals",
] as const;

const SOLUTIONS = [
  "Partnering with the government to share resources for schools and hospitals",
  "Engaging local community leaders early to build trust and cooperation",
  "Mobilising local and international donors to fund mission projects",
  "Training and retaining local staff instead of relying only on outside personnel",
  "Using mobile clinics and outreach programmes to reach remote areas",
  "Coordinating between denominations to avoid duplicating the same services",
  "Advocating for faster, fairer government approval processes",
  "Using digital technology, such as telemedicine, to extend healthcare's reach",
] as const;

const TERMS: { term: string; meaning: string }[] = [
  { term: "Mission hospital", meaning: "A hospital established and run by a church or Christian mission organisation" },
  { term: "Mission school", meaning: "A school established and run by a church or Christian mission organisation" },
  { term: "Kenyatta National Hospital", meaning: "Kenya's largest referral hospital, which traces its origins to a mission-founded facility" },
  { term: "Tenwek Hospital", meaning: "A well-known mission hospital in Bomet County founded by a Christian mission organisation" },
  { term: "Chogoria Hospital", meaning: "A mission hospital in Tharaka-Nithi County founded by the Presbyterian Church of East Africa" },
  { term: "Barrier", meaning: "An obstacle that makes it harder for the church's mission work to succeed" },
  { term: "Outreach", meaning: "Extending church services, such as healthcare, out to underserved communities" },
  { term: "Telemedicine", meaning: "Using digital technology to provide medical advice or care remotely" },
  { term: "Resource mobilisation", meaning: "Gathering funding, staff, or materials needed to run a project" },
  { term: "Advocacy", meaning: "Speaking up in support of a cause, such as fairer approval processes for mission projects" },
];

interface ScenarioMC {
  prompt: string;
  correct: string;
  wrong: string[];
  explanation: string;
}

const KENYAN_NAMES = ["Amina", "Baraka", "Chebet", "Denis", "Fatuma", "Juma", "Kevin", "Lilian", "Mwangi", "Naliaka", "Otieno", "Wanjiru"] as const;
const KENYAN_PLACES = ["Kisumu", "Eldoret", "Nakuru", "Mombasa", "Kitengela", "Thika", "Nyeri", "Kitale", "Machakos", "Meru", "Bungoma", "Kericho"] as const;
function name(rng: RNG) { return randChoice(rng, KENYAN_NAMES); }
function place(rng: RNG) { return randChoice(rng, KENYAN_PLACES); }

const REASONING_TEMPLATES: ((rng: RNG) => ScenarioMC)[] = [
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who}'s family in ${place(rng)} relies on a church-founded hospital for maternal healthcare that would otherwise be hours away. What does this best illustrate about the church's role in health?`,
      correct: "Church-founded health facilities often fill critical gaps, especially in underserved areas",
      wrong: ["Church-founded hospitals only ever serve members of that specific denomination", "The church has never played any historical role in Kenyan healthcare", "Church hospitals exist only in large cities, never in rural areas"],
      explanation: "Many mission hospitals, like Tenwek and Chogoria, were founded specifically to serve underserved rural areas, filling critical healthcare gaps government facilities had not yet reached.",
    };
  },
  (rng) => ({
    prompt: `A church wants to build a new mission hospital near ${place(rng)}, but poor roads make transporting building materials and later, patients, very difficult. What is this an example of?`,
    correct: "A barrier — poor infrastructure limiting access to remote mission facilities",
    wrong: ["A solution to the church's mission work", "An unrelated issue with no connection to mission work", "A benefit that makes the mission project easier"],
    explanation: "Poor roads and infrastructure are a genuine barrier to effective church mission work, particularly in reaching and serving remote communities.",
  }),
  (rng) => {
    const who = name(rng);
    return {
      prompt: `${who} suggests that a church struggling with a shortage of doctors in ${place(rng)} could train and retain local nursing and medical staff instead of relying only on visiting foreign volunteers. What is this an example of?`,
      correct: "A solution — training and retaining local staff strengthens mission work long-term",
      wrong: ["A barrier that makes mission work harder", "An action that has no effect on the hospital's operation", "A practice that is discouraged by effective mission organisations"],
      explanation: "Training and retaining local staff addresses the barrier of understaffing directly and sustainably, rather than depending on short-term outside help.",
    };
  },
  (rng) => ({
    prompt: `Two different denominations near ${place(rng)} are both trying to build separate schools in the same small community, straining limited resources. What would be the most effective solution?`,
    correct: "Coordinating between the denominations to avoid duplicating the same service",
    wrong: ["Each denomination should ignore the other and proceed exactly as planned", "The community should be discouraged from having any school at all", "Competition between denominations always produces the best outcome"],
    explanation: "Coordinating efforts between denominations avoids wasting limited resources on duplicated services, allowing more of the community's actual needs to be met.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} points out that some church health programmes struggle because community members are suspicious of outside organisations. What is the most effective response to this barrier?`,
    correct: "Engaging local community leaders early to build trust and cooperation",
    wrong: ["Ignoring the community's concerns and proceeding without their input", "Withdrawing the programme entirely without addressing the concern", "Assuming suspicion will disappear on its own with no action taken"],
    explanation: "Building genuine trust through early engagement with local leaders directly addresses cultural resistance, rather than ignoring it or giving up on the programme.",
  }),
  (rng) => ({
    prompt: `A rural clinic run by a church near ${place(rng)} starts using a mobile phone service to connect patients with specialist doctors in the city. What is this an example of?`,
    correct: "Telemedicine — using digital technology to extend healthcare's reach to remote areas",
    wrong: ["A barrier that makes healthcare harder to access", "An outdated method no longer used in modern mission work", "A practice unrelated to the church's role in health"],
    explanation: "Connecting rural patients with specialist doctors through digital technology is telemedicine — a modern solution that extends the church's healthcare reach into remote areas.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} is asked for a historical example of the church's contribution to education in Kenya. What is a genuine example?`,
    correct: "Many of Kenya's earliest schools were established by Christian missions before independence",
    wrong: ["The church has never been involved in establishing any school in Kenya", "All Kenyan schools were built exclusively by the government from the start", "Mission schools were established only after Kenya's independence in 1963"],
    explanation: "Many of Kenya's earliest schools were established by Christian missions well before independence, forming a foundational part of the country's education history.",
  }),
  (rng) => ({
    prompt: `${name(rng)} in ${place(rng)} notices that funding shortages are slowing down repairs at a church-run school. What would be the most direct solution?`,
    correct: "Mobilising local and international donors to fund the needed repairs",
    wrong: ["Closing the school permanently instead of seeking funding", "Ignoring the funding shortage until it resolves on its own", "Reducing the number of students without addressing the shortage itself"],
    explanation: "Actively mobilising donors directly addresses a funding shortage, rather than closing the institution or hoping the problem disappears.",
  }),
  (rng) => ({
    prompt: `${name(rng)} argues that bureaucratic delays in getting government approval are slowing down a new church clinic near ${place(rng)}. What is the most constructive response?`,
    correct: "Advocating for a faster, fairer approval process through the proper channels",
    wrong: ["Building the clinic secretly without seeking any approval at all", "Abandoning the clinic project immediately without further effort", "Assuming bureaucratic delays can never be addressed in any way"],
    explanation: "Advocacy — speaking up through proper channels for a fairer, faster process — is a constructive way to address bureaucratic barriers, rather than bypassing regulation or giving up.",
  }),
];

export const roleOfChurchInEducationAndHealth: Skill = {
  id: "g7-cre-ch-role-of-church-in-education-and-health",
  code: "CH.2",
  subjectId: "cre",
  strandId: "g7-cre-church",
  grade: 7,
  title: "Role of the Church in Education and Health",
  description: "The church's contribution to education and health in Kenya, barriers to effective church mission work, and solutions to those barriers.",
  generate(rng) {
    const branch = randChoice(rng, ["reasoning", "categorize", "match", "fill-blank"] as const);

    if (branch === "reasoning") {
      const q = randChoice(rng, REASONING_TEMPLATES)(rng);
      const { choices, correctIndex } = buildChoicesFromStrings(rng, q.correct, q.wrong, 3);
      return {
        kind: "multiple-choice",
        prompt: q.prompt,
        choices,
        correctIndex,
        layout: "list",
        hint: "Think about the church's contribution to education and health, and what helps or hinders that mission work.",
        explanation: q.explanation,
      };
    }

    if (branch === "categorize") {
      const barriers = shuffle(rng, BARRIERS).slice(0, 4);
      const solutions = shuffle(rng, SOLUTIONS).slice(0, 4);
      const chosen = shuffle(rng, [...barriers.map((t) => ({ text: t, kind: "barrier" })), ...solutions.map((t) => ({ text: t, kind: "solution" }))]);
      const items = chosen.map((c, i) => ({ id: `c${i}`, label: c.text }));
      const correctBucket: Record<string, string> = {};
      chosen.forEach((c, i) => (correctBucket[`c${i}`] = c.kind));
      return {
        kind: "categorize",
        prompt: randChoice(rng, CATEGORIZE_PROMPTS),
        items,
        buckets: [
          { id: "barrier", label: "A barrier" },
          { id: "solution", label: "A solution" },
        ],
        correctBucket,
        hint: "Barriers make mission work harder; solutions are actions that address those obstacles.",
        explanation: chosen.map((c) => `"${c.text}" — ${c.kind === "barrier" ? "a barrier" : "a solution"}.`).join(" "),
      };
    }

    if (branch === "match") {
      const chosen = shuffle(rng, TERMS).slice(0, 5);
      const tokens = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.term })));
      const targets = shuffle(rng, chosen.map((t) => ({ id: t.term, label: t.meaning })));
      const correctMap: Record<string, string> = {};
      for (const t of chosen) correctMap[t.term] = t.term;
      return {
        kind: "click-match",
        prompt: randChoice(rng, MATCH_PROMPTS),
        tokens,
        targets,
        correctMap,
        hint: "Think about the church's role in education and health in Kenya, and the barriers and solutions involved.",
        explanation: chosen.map((t) => `${t.term} — ${t.meaning.toLowerCase()}.`).join(" "),
      };
    }

    const facts = [
      { before: "A hospital established and run by a church or Christian mission organisation is called a", after: "hospital.", answer: "mission", accepted: ["mission"] },
      { before: "Gathering funding, staff, or materials needed to run a project is called resource", after: ".", answer: "mobilisation", accepted: ["mobilisation", "mobilization"] },
      { before: "Speaking up in support of a cause, such as fairer approval processes, is called", after: ".", answer: "advocacy", accepted: ["advocacy"] },
      { before: "Using digital technology to provide medical care remotely is called", after: ".", answer: "telemedicine", accepted: ["telemedicine"] },
      { before: "Extending church services, such as healthcare, out to underserved communities is called", after: ".", answer: "outreach", accepted: ["outreach"] },
      { before: "An obstacle that makes it harder for church mission work to succeed is called a", after: ".", answer: "barrier", accepted: ["barrier"] },
      { before: "Tenwek Hospital, a well-known mission hospital, is located in", after: "County.", answer: "Bomet", accepted: ["bomet"] },
      { before: "Chogoria Hospital was founded by the Presbyterian Church of East", after: ".", answer: "Africa", accepted: ["africa"] },
      { before: "Poor roads and infrastructure limiting access to remote mission facilities is an example of a", after: ".", answer: "barrier", accepted: ["barrier"] },
      { before: "Coordinating between denominations to avoid duplicating services is an example of a", after: ".", answer: "solution", accepted: ["solution"] },
    ] as const;
    const fb = randChoice(rng, facts);
    return {
      kind: "fill-blank",
      prompt: randChoice(rng, FILL_PROMPTS),
      before: fb.before,
      after: fb.after,
      correctAnswer: fb.answer,
      acceptedAnswers: [...fb.accepted],
      inputMode: "text",
      hint: "Think about the church's role in education and health, and the barriers and solutions involved.",
      explanation: `${fb.before} ${fb.answer} ${fb.after}`,
    };
  },
};
