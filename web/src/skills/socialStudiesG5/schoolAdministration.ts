import { randChoice, shuffle } from "@/lib/rng";
import { fillBlankPrompt, identifyPrompt, matchPrompt, orderPrompt, sortPrompt } from "@/skills/socialStudiesG5/g5SsShared";
import type { Skill } from "@/lib/types";

// Source: KICD Grade 5 Social Studies design, sub-strand "School Administration".
// See curriculum-reference/grade-5/social-studies.json.

const ROLES: { id: string; role: string; duty: string; rank: number }[] = [
  { id: "head", role: "Headteacher", duty: "oversees the running of the whole school", rank: 1 },
  { id: "deputy", role: "Deputy Headteacher", duty: "assists the headteacher and often handles discipline and timetabling", rank: 2 },
  { id: "senior", role: "Senior Teacher", duty: "supports the administration in guiding other teachers", rank: 3 },
  { id: "class", role: "Class Teacher", duty: "manages the day-to-day needs of one specific class", rank: 4 },
  { id: "subject", role: "Subject Teacher", duty: "teaches a specific subject to learners", rank: 5 },
];

export const schoolAdministration: Skill = {
  id: "g5-ss-people-school-administration",
  code: "P.4",
  subjectId: "social-studies",
  strandId: "g5-ss-people",
  grade: 5,
  title: "School Administration",
  description: "Identifying administrative leaders in a school, their duties, and the school's administrative structure.",
  generate(rng) {
    const branch = randChoice(rng, ["identify-mc", "click-match", "categorize", "fill-blank", "ordering"] as const);

    if (branch === "identify-mc") {
      const r = randChoice(rng, ROLES);
      const choices = shuffle(rng, ROLES.map((x) => x.role));
      return {
        kind: "multiple-choice",
        prompt: `${identifyPrompt(rng, "school administrative role")} Duty: "${r.role.charAt(0).toLowerCase() + r.role.slice(1)}" ${r.duty}.`,
        choices,
        correctIndex: choices.indexOf(r.role),
        hint: "Think about who is responsible for that duty in a school.",
        explanation: `The ${r.role} ${r.duty}.`,
      };
    }

    if (branch === "click-match") {
      const chosen = shuffle(rng, ROLES).slice(0, 4);
      const tokens = chosen.map((r) => ({ id: r.id, label: r.role }));
      const targets = shuffle(rng, chosen).map((r) => ({ id: r.id, label: r.duty.charAt(0).toUpperCase() + r.duty.slice(1) }));
      const correctMap: Record<string, string> = {};
      for (const r of chosen) correctMap[r.id] = r.id;
      return {
        kind: "click-match",
        prompt: matchPrompt(rng, "school administrative role to its main duty"),
        tokens,
        targets,
        correctMap,
        hint: "Match each role to what it is mainly responsible for.",
        explanation: chosen.map((r) => `${r.role}: ${r.duty}.`).join(" "),
      };
    }

    if (branch === "categorize") {
      const schoolWide = ROLES.filter((r) => r.rank <= 2).map((r) => ({ id: r.id, label: r.role, bucket: "SCHOOL_WIDE" }));
      const classroomLevel = ROLES.filter((r) => r.rank >= 4).map((r) => ({ id: r.id, label: r.role, bucket: "CLASSROOM" }));
      const items = shuffle(rng, [...schoolWide, ...classroomLevel]);
      const correctBucket: Record<string, string> = {};
      for (const item of items) correctBucket[item.id] = item.bucket;
      return {
        kind: "categorize",
        prompt: sortPrompt(rng, "whether the role leads the whole school or works mainly at classroom level"),
        items: items.map(({ id, label }) => ({ id, label })),
        buckets: [
          { id: "SCHOOL_WIDE", label: "School-wide Leadership" },
          { id: "CLASSROOM", label: "Classroom-level Role" },
        ],
        correctBucket,
        hint: "The headteacher and deputy lead the whole school; class and subject teachers work more directly with learners.",
        explanation: "The Headteacher and Deputy Headteacher lead the whole school; the Class Teacher and Subject Teacher work mainly at classroom level.",
      };
    }

    if (branch === "fill-blank") {
      const templates = [
        () => ({ before: "The overall leader of a school, responsible for the whole school, is the", after: ".", correct: "Headteacher" }),
        () => ({ before: "The", after: "assists the headteacher and often handles discipline.", correct: "Deputy Headteacher" }),
        () => ({ before: "The teacher who manages the day-to-day needs of one specific class is the", after: ".", correct: "Class Teacher" }),
        () => ({ before: "A teacher who teaches one specific subject to learners is called a", after: ".", correct: "Subject Teacher" }),
        () => ({ before: "A learner's parents or guardians can find out school administrators' duties by asking a", after: ".", correct: "teacher" }),
      ];
      const t = randChoice(rng, templates)();
      return {
        kind: "fill-blank",
        prompt: fillBlankPrompt(rng),
        before: t.before,
        after: t.after,
        correctAnswer: t.correct,
        inputMode: "text",
        hint: "Recall the school administrative roles from Headteacher down to Subject Teacher.",
        explanation: `${t.before} ${t.correct}${t.after}`,
      };
    }

    const items = shuffle(rng, ROLES.map((r) => ({ id: r.id, label: r.role })));
    const correctOrder = [...ROLES].sort((a, b) => a.rank - b.rank).map((r) => r.id);
    return {
      kind: "ordering",
      prompt: orderPrompt(rng, "these school roles from the most senior to the least senior"),
      instruction: "Arrange the roles from most senior to least senior.",
      items,
      correctOrder,
      hint: "The Headteacher leads the school; Subject Teachers work most directly with one subject.",
      explanation: `From most senior to least senior: ${[...ROLES].sort((a, b) => a.rank - b.rank).map((r) => r.role).join(", ")}.`,
    };
  },
};
