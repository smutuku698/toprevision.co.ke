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
}

const PASSAGES: Passage[] = [
  {
    text: "Last Saturday, students at Green Hills Secondary School planted three hundred trees along the riverbank near their school. The head teacher explained that the trees would prevent soil erosion and provide shade for future students. Some pupils dug holes while others carried water from a nearby borehole. By midday, the entire team was tired but proud of what they had accomplished. The head teacher promised that the school would hold a similar activity every term.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "Students planting trees to protect their school environment",
          "A head teacher explaining how soil erosion happens",
          "Pupils fetching water from a borehole for drinking",
          "A competition to see which class could dig the most holes",
        ],
        correctIndex: 0,
        explanation: "The passage centers on the tree-planting activity and its purpose (preventing erosion, providing shade) — the other options are details, not the main idea.",
      },
      {
        prompt: "According to the passage, why did the students plant the trees?",
        choices: [
          "To prevent soil erosion and provide shade",
          "To win a school competition",
          "Because the borehole was broken",
          "To sell the trees later for money",
        ],
        correctIndex: 0,
        explanation: "The passage states the head teacher explained the trees \"would prevent soil erosion and provide shade for future students.\"",
      },
      {
        prompt: "In the passage, the word 'accomplished' most nearly means",
        choices: ["achieved or completed successfully", "failed to complete", "forgotten about", "postponed until later"],
        correctIndex: 0,
        explanation: "\"Accomplished\" describes something successfully achieved — here, the students felt proud of what they had achieved.",
      },
    ],
  },
  {
    text: "Every Wednesday, Naliaka's mother sells vegetables at the local market. Naliaka wakes up early to help her mother arrange tomatoes, onions, and kale on the wooden stall. Customers often haggle over prices, and Naliaka has learned to calculate change quickly in her head. Although the work is tiring, Naliaka enjoys meeting different people and hearing their stories. She hopes that one day she will study business so that she can help her mother expand the stall into a proper shop.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "Naliaka helping her mother sell vegetables and dreaming of a bigger future",
          "A market that sells only tomatoes and onions",
          "Naliaka refusing to help her mother on Wednesdays",
          "Customers who never haggle over prices",
        ],
        correctIndex: 0,
        explanation: "The passage follows Naliaka's role at the market and her hope to study business and grow the stall — that's the overall focus.",
      },
      {
        prompt: "What skill has Naliaka learned from helping at the market?",
        choices: ["Calculating change quickly in her head", "Growing vegetables from seed", "Driving a delivery van", "Speaking a foreign language"],
        correctIndex: 0,
        explanation: "The passage says Naliaka \"has learned to calculate change quickly in her head\" from dealing with customers.",
      },
      {
        prompt: "What can you infer about Naliaka's ambitions?",
        choices: [
          "She wants to study business and help expand the family stall",
          "She wants to stop helping her mother altogether",
          "She dislikes meeting new people at the market",
          "She wants to become a teacher instead",
        ],
        correctIndex: 0,
        explanation: "The last sentence states she hopes to study business so she can help expand the stall into a proper shop.",
      },
    ],
  },
  {
    text: "During the long dry season, many villages in the region struggled to find clean water. Boreholes ran low, and families had to walk long distances to fetch water from the few rivers that still flowed. A local youth group decided to teach households how to harvest rainwater using simple gutters and storage tanks. Within a few months, more families had a reliable supply of water even when the rains were unpredictable. Elders in the village praised the young people for their resourcefulness.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A youth group helping villagers cope with water shortage through rainwater harvesting",
          "Elders complaining about young people in the village",
          "A description of how boreholes are drilled",
          "Families moving away because of the drought",
        ],
        correctIndex: 0,
        explanation: "The passage's central event is the youth group teaching rainwater harvesting to solve the water shortage.",
      },
      {
        prompt: "What method did the youth group teach households to use?",
        choices: [
          "Harvesting rainwater with gutters and storage tanks",
          "Digging new boreholes",
          "Walking to more distant rivers",
          "Buying water from another village",
        ],
        correctIndex: 0,
        explanation: "The passage says the youth group \"decided to teach households how to harvest rainwater using simple gutters and storage tanks.\"",
      },
      {
        prompt: "In the passage, the word 'resourcefulness' most nearly means",
        choices: [
          "the ability to find clever ways to solve problems",
          "laziness and lack of effort",
          "wealth and material possessions",
          "confusion about what to do",
        ],
        correctIndex: 0,
        explanation: "The elders praised the youth for solving a real problem cleverly with limited means — that is resourcefulness.",
      },
    ],
  },
  {
    text: "Mobile money has changed how people in Kenya do business. A shopkeeper in a small town can now receive payments instantly from a customer's phone instead of handling cash. Farmers use mobile money to pay for fertilizer and receive payment for their produce without traveling to a bank. Even small children running errands can be sent money for bus fare in seconds. While some elderly people still prefer cash, most agree that mobile money has made transactions faster and safer.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "How mobile money has made transactions faster and more convenient in Kenya",
          "Why shopkeepers refuse to accept cash",
          "The history of banks in small towns",
          "How children spend their bus fare",
        ],
        correctIndex: 0,
        explanation: "Every example in the passage — shopkeepers, farmers, children — illustrates how mobile money has sped up transactions.",
      },
      {
        prompt: "According to the passage, how do farmers benefit from mobile money?",
        choices: [
          "They can pay for fertilizer and receive payment without traveling to a bank",
          "They receive free fertilizer from the government",
          "They no longer need to sell their produce",
          "They can only use mobile money during harvest season",
        ],
        correctIndex: 0,
        explanation: "The passage states farmers \"use mobile money to pay for fertilizer and receive payment for their produce without traveling to a bank.\"",
      },
      {
        prompt: "What can be inferred about elderly people's attitude toward mobile money?",
        choices: [
          "Some are more cautious and still prefer using cash",
          "All of them refuse to use phones entirely",
          "They find it faster than everyone else",
          "They invented the mobile money system",
        ],
        correctIndex: 0,
        explanation: "The passage notes \"some elderly people still prefer cash,\" suggesting more caution around the new system, not universal rejection.",
      },
    ],
  },
  {
    text: "Kiptoo had trained for months for the district cycling race. On race day, his chain snapped just two kilometers from the finish line. Instead of giving up, he got off his bicycle and pushed it the rest of the way, arriving long after the other racers. The crowd, surprised by his determination, cheered loudly as he crossed the line. Although he did not win a medal, the local newspaper featured his story the following week.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A cyclist showing determination even after his bicycle broke down",
          "A newspaper report about district cycling rules",
          "A crowd that booed a losing racer",
          "Kiptoo winning first place in the race",
        ],
        correctIndex: 0,
        explanation: "The passage focuses on Kiptoo's refusal to give up after his chain snapped, not on winning a medal or the rules of the race.",
      },
      {
        prompt: "What happened to Kiptoo's bicycle during the race?",
        choices: ["Its chain snapped two kilometers from the finish", "A wheel came off at the starting line", "It was stolen before the race began", "It got a flat tyre halfway through"],
        correctIndex: 0,
        explanation: "The passage states \"his chain snapped just two kilometers from the finish line.\"",
      },
      {
        prompt: "In the passage, the word 'determination' most nearly means",
        choices: ["firmness of purpose; refusing to give up", "fear of losing a race", "confusion about the rules", "anger at the other racers"],
        correctIndex: 0,
        explanation: "Kiptoo pushed his broken bicycle to the finish rather than quitting — that persistence is what \"determination\" describes.",
      },
    ],
  },
  {
    text: "Students at Mji Mpya Secondary School started a recycling club after noticing how much plastic waste collected around the compound. Members separate plastic bottles, paper, and food waste into different bins each day. Once a month, they sell the collected plastic to a recycling company and use the money to buy books for the school library. The club has grown from five members to over forty in just one year.",
    questions: [
      {
        prompt: "What is this passage mainly about?",
        choices: [
          "A school recycling club that turns waste into money for library books",
          "A school that banned plastic bottles completely",
          "A company that donates books to schools",
          "Students who refuse to separate their waste",
        ],
        correctIndex: 0,
        explanation: "The passage describes the recycling club's activity and how it funds library books — that's the main idea.",
      },
      {
        prompt: "What do club members do with the money from selling plastic?",
        choices: ["They buy books for the school library", "They share it among themselves", "They donate it to another school", "They use it to buy more plastic bottles"],
        correctIndex: 0,
        explanation: "The passage says they \"use the money to buy books for the school library.\"",
      },
      {
        prompt: "What does the passage suggest about the club's popularity?",
        choices: [
          "It has grown a lot, from five to over forty members in a year",
          "It has stayed the same size since it started",
          "It lost most of its members over the year",
          "It only accepts new members once a year",
        ],
        correctIndex: 0,
        explanation: "The passage states the club \"has grown from five members to over forty in just one year,\" showing rising popularity.",
      },
    ],
  },
];

const TRUE_FALSE: { text: string; isTrue: boolean }[][] = [
  [
    { text: "The students planted trees along the riverbank.", isTrue: true },
    { text: "The head teacher said the trees would prevent soil erosion.", isTrue: true },
    { text: "The students planted the trees inside their classrooms.", isTrue: false },
    { text: "The head teacher said this would be a one-time activity, never repeated.", isTrue: false },
  ],
  [
    { text: "Naliaka helps her mother sell vegetables every Wednesday.", isTrue: true },
    { text: "Naliaka hopes to study business one day.", isTrue: true },
    { text: "Naliaka sells vegetables every single day of the week.", isTrue: false },
    { text: "Naliaka dislikes meeting customers at the market.", isTrue: false },
  ],
  [
    { text: "A youth group taught households to harvest rainwater.", isTrue: true },
    { text: "Families used gutters and storage tanks to collect water.", isTrue: true },
    { text: "The village solved the shortage by digging new boreholes.", isTrue: false },
    { text: "Elders criticized the young people for their idea.", isTrue: false },
  ],
  [
    { text: "Farmers use mobile money to pay for fertilizer.", isTrue: true },
    { text: "Mobile money has made transactions faster in Kenya.", isTrue: true },
    { text: "All elderly people refuse to use mobile money.", isTrue: false },
    { text: "Shopkeepers can only accept cash payments.", isTrue: false },
  ],
  [
    { text: "Kiptoo's bicycle chain snapped during the race.", isTrue: true },
    { text: "Kiptoo pushed his bicycle to the finish line.", isTrue: true },
    { text: "Kiptoo won first place in the race.", isTrue: false },
    { text: "Kiptoo gave up and left the race early.", isTrue: false },
  ],
  [
    { text: "The recycling club uses money from selling plastic to buy library books.", isTrue: true },
    { text: "The club grew from five to over forty members in a year.", isTrue: true },
    { text: "The school banned plastic bottles completely.", isTrue: false },
    { text: "The club lost most of its members over the year.", isTrue: false },
  ],
];

export const readingComprehension: Skill = {
  id: "eng-r-comprehension",
  code: "R.1",
  subjectId: "english",
  strandId: "eng-reading",
  grade: 9,
  title: "Reading comprehension",
  description: "Read a short passage and answer questions about the main idea, details, and vocabulary in context.",
  generate(rng) {
    const index = Math.floor(rng() * PASSAGES.length);
    const passage = PASSAGES[index];

    if (rng() < 0.4) {
      const statements = TRUE_FALSE[index];
      const items = statements.map((s, i) => ({ id: `s${i}`, label: s.text, bucket: s.isTrue ? "True" : "False" }));
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;

      return {
        kind: "categorize",
        passage: passage.text,
        prompt: "Sort each statement as True or False, based on the passage.",
        items: shuffle(rng, items).map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "True", label: "True" },
          { id: "False", label: "False" },
        ],
        correctBucket,
        hint: "Reread the passage and check each statement carefully against what it actually says.",
        explanation: statements.map((s) => `"${s.text}" is ${s.isTrue ? "true" : "false"} according to the passage.`).join(" "),
      };
    }

    const q = randChoice(rng, passage.questions);
    const correctText = q.choices[q.correctIndex];
    const choices = shuffle(rng, q.choices);

    return {
      kind: "multiple-choice",
      passage: passage.text,
      prompt: q.prompt,
      choices,
      correctIndex: choices.indexOf(correctText),
      layout: "list",
      hint: "Reread the passage and look for the sentence that directly relates to the question.",
      explanation: q.explanation,
    };
  },
};
