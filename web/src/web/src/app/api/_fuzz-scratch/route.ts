import { makeRng } from "@/lib/rng";
import { SKILLS } from "@/skills/index";
import type { Question } from "@/lib/types";

const TARGET_IDS = new Set([
  "eng-g-reported-speech",
  "eng-g-phrasal-verbs",
  "eng-r-comprehension",
  "eng-r-structure",
  "eng-w-formal-structure",
  "eng-w-formal-informal",
  "eng-ls-debate-publicspeaking",
  "eng-ls-active-listening",
]);

function checkQuestion(q: Question): string[] {
  const errs: string[] = [];
  if (!q.prompt || !q.prompt.trim()) errs.push("empty prompt");
  if (!q.explanation || !q.explanation.trim()) errs.push("empty explanation");

  if (q.kind === "multiple-choice") {
    if (q.choices.length < 2) errs.push("fewer than 2 choices");
    if (q.correctIndex < 0 || q.correctIndex >= q.choices.length) errs.push("correctIndex out of range");
    const dupes = q.choices.filter((c, i) => q.choices.indexOf(c) !== i);
    if (dupes.length > 0) errs.push(`duplicate choices: ${dupes.join(", ")}`);
  } else if (q.kind === "ordering") {
    const ids = q.items.map((i) => i.id);
    if (new Set(ids).size !== ids.length) errs.push("duplicate item ids");
    if (q.correctOrder.length !== ids.length) errs.push("correctOrder length mismatch");
    for (const id of q.correctOrder) if (!ids.includes(id)) errs.push(`correctOrder references unknown id ${id}`);
    if (new Set(q.correctOrder).size !== q.correctOrder.length) errs.push("correctOrder has duplicates");
  } else if (q.kind === "categorize") {
    const itemIds = q.items.map((i) => i.id);
    if (new Set(itemIds).size !== itemIds.length) errs.push("duplicate item ids");
    const bucketIds = new Set(q.buckets.map((b) => b.id));
    for (const id of itemIds) {
      if (!(id in q.correctBucket)) errs.push(`item ${id} missing from correctBucket`);
      else if (!bucketIds.has(q.correctBucket[id])) errs.push(`item ${id} maps to unknown bucket ${q.correctBucket[id]}`);
    }
  } else if (q.kind === "click-match") {
    const tokenIds = q.tokens.map((t) => t.id);
    const targetIds = q.targets.map((t) => t.id);
    if (new Set(tokenIds).size !== tokenIds.length) errs.push("duplicate token ids");
    if (new Set(targetIds).size !== targetIds.length) errs.push("duplicate target ids");
    for (const targetId of targetIds) {
      if (!(targetId in q.correctMap)) errs.push(`target ${targetId} missing from correctMap`);
      else if (!tokenIds.includes(q.correctMap[targetId])) errs.push(`target ${targetId} maps to unknown token ${q.correctMap[targetId]}`);
    }
  }

  return errs;
}

export async function GET() {
  const results: Record<string, { runs: number; errors: string[] }> = {};

  for (const skill of SKILLS) {
    if (!TARGET_IDS.has(skill.id)) continue;
    const errors: string[] = [];
    const rng = makeRng(42);
    for (let i = 0; i < 500; i++) {
      try {
        const q = skill.generate(rng);
        const errs = checkQuestion(q);
        if (errs.length > 0) errors.push(`run ${i}: ${errs.join("; ")}`);
      } catch (e) {
        errors.push(`run ${i} threw: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    results[skill.id] = { runs: 500, errors: errors.slice(0, 10) };
  }

  return Response.json(results);
}
