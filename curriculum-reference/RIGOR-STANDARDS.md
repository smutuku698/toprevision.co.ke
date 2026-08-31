# Cognitive rigor standards — Bloom's tier, scenario structure, plausible distractors

**Status: standing rule, effective 2026-08-15. Applies to every subject/grade build and every future audit,
without exception. Companion to `CURRICULUM-MINING-GUIDE.md` — that guide governs WHAT content a skill must
cover; this one governs how HARD the questions built from that content are allowed to be.** Referenced from
the repo-root `CLAUDE.md`.

## Why this exists

User feedback, 2026-08-15: too many shipped questions are answerable by a "dumb person" through elimination —
the wrong choices are so obviously unrelated to the topic that no actual understanding is required to spot
the right one. The user supplied a prompting framework (originally written for live LLM item-generation —
persona-forcing, Bloom's-taxonomy enforcement, scenario+hook structuring, plausible-misconception distractors)
and asked for it to be adapted into this codebase's actual architecture and merged permanently into the
standing content-generation rules.

**Important architectural translation up front:** this app has no live LLM call at question-generation time —
every skill is a hand-written TypeScript `generate(rng)` function that assembles a `Question` object from
hardcoded data pools and templates (see `CURRICULUM-MINING-GUIDE.md` for why: no server, no per-session AI
cost, instant/offline-capable). So "prompt Claude to write high-tier items" doesn't mean a runtime API
integration — it means **I (Claude), as the one authoring or editing a skill file's templates and distractor
pools, hold myself to this rigor discipline while writing the code**, the same way the KNEC-item-writer persona
in the user's framework is meant to hold a human item-writer to a higher bar than their first draft. The
discipline is real and binding; it's just applied at authoring time, baked into static data, rather than at
request time.

## Root cause found in the existing codebase: `buildChoicesFromStrings`

`web/src/skills/mathG8/mathUtils.ts` — used across dozens of skills for multiple-choice distractors — works
like this:

```ts
export function buildChoicesFromStrings(rng, correctText, candidateTexts, count = 3) {
  // shuffles candidateTexts, takes the first `count` that aren't the correct answer
}
```

This draws wrong answers **at random from the entire candidate pool**, with no notion of which wrong answers
are actually confusable with the right one. For a small, tightly-clustered pool (e.g. 4 near-identical
apparatus) this accidentally still produces plausible distractors. For a large or heterogeneous pool — the
exact kind `CURRICULUM-MINING-GUIDE.md` now requires (7 SI units spanning totally different physical
quantities, 8+ apparatus items, 11 electricity sources) — it routinely produces distractors so unrelated to
the question's actual quantity/context that they're eliminable on sight, without any topic knowledge at all.
This is the mechanical cause of the "answerable by elimination" complaint. It is not a one-off bug in one
skill; it is the default distractor mechanism used almost everywhere.

**This guide does not mandate an immediate mass-retrofit of every skill using it** — that's a separate,
large, explicitly-scoped follow-up the user can direct later, the same way the question-kind-variety retrofit
was its own tracked pass. What changes *immediately*: every skill built or edited from now on must not rely
on blind random-sibling distractors for its recall-tier branches (see the distractor rule below), and any
already-shipped skill that gets reopened for any reason should have its distractor pools re-audited against
that rule as part of the touch — same "the bar applies the moment it's back open" discipline as the mining
guide.

## The Bloom's ladder, mapped onto this engine's actual `QuestionKind`s

Our engine is entirely closed-response (`multiple-choice`, `fill-blank`, `click-match`, `categorize`,
`ordering`, `hotspot`, `number-line`, plus the interactive-widget kinds `protractor`/`coordinate-plot`/
`solid-rotate`) — there is no free-text or essay grading. That's a real ceiling and this guide is honest
about it (see the Create-tier note below) rather than overclaiming a capability we don't have.

| Bloom's tier | What it demands | Best-fit `QuestionKind`s | Notes |
|---|---|---|---|
| **Remember** | Bare recall/definition | `multiple-choice`, `fill-blank` | Fine as a minority branch — every learner needs some vocabulary recall — but should not be the majority of a skill's branches, and per-item distractors must still follow the plausibility rule below. |
| **Understand** | Explain a relationship, pair concept↔meaning | `click-match`, `categorize`, `multiple-choice` | "Why" questions, not just "what." |
| **Apply** | Use the concept on a new, concrete, numbered scenario | `fill-blank` (calculation), `number-line`, `hotspot` (identify on a new specific case) | Requires the Scenario+Hook structure below — a real Kenyan-localized situation with rng-varied numbers, not an abstract restatement of the definition. |
| **Analyze** | Break down a small fictional dataset/observation set: spot a pattern, the odd one out, classify by criteria | `categorize`, `ordering`, `click-match` (data↔interpretation), `multiple-choice` reading a `bar-chart`/`line-graph`/table `VisualSpec` | The learner must extract something from the given data, not recall it from the topic in general. |
| **Evaluate** | Judge a claim, a procedure, or a decision against stated criteria; pick the best of several plausible options | `multiple-choice` with justification-quality distractors, `ordering` ("fix this flawed sequence"), `categorize` ("sort these actions as safe/unsafe **in this specific new scenario**") | The `explanation` field (already shown post-answer by the engine) should carry the pedagogical justification requested in the source framework — this is not a new engine feature, just a content-writing discipline to actually use it for *why the specific wrong answer is wrong*, not just restate the right one. |
| **Create** | Design/construct a novel solution | *No clean fit — documented ceiling, not solved* | Approximate only: "which of these three proposed designs best satisfies constraints A, B, C" (an Evaluate-flavored proxy) or `ordering` the steps of a newly-constructed procedure. Do not claim a skill hits true Create tier; say "Evaluate-proxy" if this is the best available. |

## The Scenario + Hook structure, adapted to `rng`-driven generation

Every Apply/Analyze/Evaluate branch should be built from three parts, matching the source framework but
expressed as code structure instead of one-shot prompt text:

1. **The Scenario** — a real, localized context. Reuse the pattern several skills already do well (e.g.
   `agricultureG8`'s Kenyan farm/garden framing, `englishG8/visualLiteracy.ts`'s wildlife-conservancy framing):
   vary place names, commodities, and actors via `rng` across generations, drawn from a Kenyan-context pool
   (Jua Kali workshops, county-level agriculture, local markets, county place names), not generic/placeless
   phrasing.
2. **The Data/Visual Hook** — a small `rng`-varied dataset, a described mini-experiment outcome, or a
   `VisualSpec` (`bar-chart`, `line-graph`, table-like `grid-shape`, etc.) that the question is actually built
   from.
3. **The Question** — must be unanswerable without the hook. **Self-test before shipping a branch:** could a
   learner strip out the scenario/data and still answer correctly from bare topic knowledge? If yes, it's
   Remember tier wearing an Apply-tier costume — rewrite it so the specific numbers/data in the hook are load
   -bearing to the answer, not decorative.

## The plausible-distractor rule

For every `multiple-choice` branch (this generalizes to `categorize`/`click-match` bucket design too — wrong
buckets/pairings should reflect real confusions, not arbitrary ones):

1. **Wrong answers must represent a specific, nameable misconception or partial understanding** — not "any
   other item from the full candidate pool." E.g. for "SI unit of electric current," good distractors are
   *volt* (mixes up current with voltage), *coulomb* (mixes up current with charge — a very common real
   confusion since both relate to electricity), *watt* (mixes up current with power) — not *metre* or
   *kilogram*, which are for unrelated quantities and are eliminable on sight.
2. **Practically, this means content pools for recall questions need an authored "confusable cluster,"** not
   just a flat array handed to `buildChoicesFromStrings`. When building or editing a pool: group items by what
   they're commonly mistaken for (e.g. SI base units split into "electricity-related: current/voltage/charge/
   power," "mass-related: mass/weight/density," etc.) and draw distractors from within the correct-answer's
   cluster, not the whole array. `buildChoicesFromStrings` itself doesn't need to change — what needs to
   change is what gets passed into `candidateTexts`: a curated confusable subset, not the full heterogeneous
   pool, whenever the full pool spans genuinely unrelated sub-topics.
3. **Use the `explanation` field to name the misconception**, not just restate the correct fact — e.g. "Volt
   is the unit of *voltage*, not current — don't confuse the push (voltage) with the flow (current)," rather
   than only "The SI unit of current is the ampere." This is exactly the "1-sentence pedagogical
   justification" the source framework asks for; our engine already surfaces `explanation` after every
   answer, so this is a content-writing discipline, not new engine work.

## Persona / authoring discipline (for me, not a runtime feature)

Whenever I am writing or editing a skill's question templates, scenario text, or distractor pools, I hold
myself to the KNEC-senior-item-writer standard the user described: assume the audience is a Grade 7–9 CBC
learner being assessed on **critical thinking, problem solving, and communication**, not just recall — and
default every new branch toward Apply-or-higher unless the underlying curriculum content is genuinely
definitional (vocabulary, unit names, apparatus names), in which case Remember/Understand tier is the correct
and honest choice, not a lazy one. The goal is matching rigor to what the content actually supports, not
inflating everything into artificial scenarios that don't fit.

## New mining-checklist addition: "Core competencies to be developed" is a required signal, not optional flavor

`CURRICULUM-MINING-GUIDE.md`'s 8-part mining checklist previously treated "Core competencies to be developed"
and "Values" as low-priority. **Correction, folded into that guide as of this rigor pass:** the Core
Competencies line in a KICD sub-strand block (e.g. "Critical thinking and problem solving," "Communication and
collaboration," "Self-efficacy," "Digital literacy," "Citizenship," "Learning to learn") is KICD's own
declaration of the intended cognitive/skill target for that sub-strand — read it and map it onto the Bloom's
ladder above:

- A sub-strand naming **"Critical thinking and problem solving"** as a core competency must have at least one
  Analyze-or-Evaluate-tier branch. Shipping only Remember-tier recall for such a sub-strand is a rigor gap,
  not a stylistic choice.
- A sub-strand whose only named competency is something like **"Communication and collaboration"** via group
  discussion may legitimately stay lighter on Analyze/Evaluate — KICD itself is framing that sub-strand as
  discussion-based, not analytical, so recall/understand-tier questions are the honest match, not a shortfall.

This is why `_schema-example.json` / the `curriculum-reference/<grade>/<subject>.json` schema now also
captures a `coreCompetencies: string[]` field per sub-strand (verbatim from the design's "Core competencies to
be developed" box) — same durable-record principle as `learningExperiences`.

## Minimum rigor bar (checkable, same spirit as the 2+ `QuestionKind` rule)

- **Every skill must have at least one Apply-or-higher branch**, unless the sub-strand is genuinely pure
  definitional content (rare — most sub-strands have at least one outcome verb like "apply," "explain,"
  "determine," "investigate," "outline applications," or "appreciate... in real life," all of which support
  at least an Apply-tier branch).
- **Any sub-strand whose Core Competencies box names "Critical thinking and problem solving" must have at
  least one Analyze-or-Evaluate branch.**
- **No `multiple-choice` branch may use an unconstrained random draw from a large/heterogeneous pool as its
  distractor source** — distractors must come from a curated confusable cluster (see the plausible-distractor
  rule).
- Run this alongside, not instead of, the other three standing axes — content breadth (`CURRICULUM-MINING-
  GUIDE.md`), interaction-kind variety (`SKILL-QUALITY-STANDARDS.md`), and visual coverage
  (`[[reference_svg_asset_resources]]`). Four independent axes now, all required, none implies the others.

## Minimum pool-size floor (added 2026-08-16 — closes the "curriculum-complete but still repetitive" gap)

Grade 7 Pre-Technical MAT.2 (`metallicMaterials.ts`) surfaced a *second*, distinct failure mode from the one
`CURRICULUM-MINING-GUIDE.md` was written for. That guide's case study (Integrated Science SI.3) was a skill
narrower than the curriculum actually allows. MAT.2 was different: its metal pool (steel, aluminium, copper)
and its four named physical properties (magnetism, heat conductivity, electrical conductivity, appearance)
already matched the KICD design exactly — full content-breadth marks. It still felt repetitive to a real
learner ("the same magnetism question 4+ times in one session") because the *number of distinct facts,
scenarios and templates drawing on that correctly-sized pool* was too small, and one branch (`fill-blank`) was
not randomized at all — it returned the literal same sentence every time that branch was picked. Content
breadth and question-authoring depth are different things; a skill can max out the first and still fail this
one. This section makes the second one checkable with actual numbers instead of "richer, please":

- **A branch may never return a single hardcoded template with no `rng`-driven variation.** If a branch's
  prompt/sentence text is byte-identical every time that branch is selected, it is not done — even if the
  `QuestionKind` itself varies session to session, that one branch's *content* is a guaranteed repeat every
  time the branch is drawn. (This was MAT.2's original `fill-blank` branch, verbatim.)
- **Absolute hard floor, non-negotiable: 5 distinct templates minimum for ANY single-template-style branch
  (fill-blank, or any other branch built around one static-text template), never below 5, no exceptions.**
  This is a blocking gate, not a target — a branch at 1-4 templates is not shippable under any circumstance,
  full stop, confirmed standing rule 2026-08-17 ("never below 5... make this the default now and forever").
  10+ (below) remains the actual aim for that branch type where content allows; 5 is the line that must never
  be crossed even when a skill's content is unusually thin, because a branch that thin will resurface
  frequently enough in real sessions to look broken to a learner and damage trust in the product.
- **Any fill-blank branch needs at least 10 distinct templates** (a `randChoice` over 10+ `{before, after,
  correctAnswer, explanation}` entries), not 3-6. If a sub-strand's fact pool genuinely cannot support 10
  distinct, non-overlapping fill-blank facts, drop the fill-blank branch from that skill entirely rather than
  shipping a thin one that will repeat — same "explicitly declined with a reason" discipline the mining guide
  already requires at the content level, applied here to a branch's template count. Note the reason in a code
  comment next to the branch (or its omission) so the next person to open the file doesn't have to re-derive
  why.
- **Any Apply/Analyze/Evaluate scenario/reasoning `multiple-choice` branch needs at least 10 distinct scenario
  templates** built from the Scenario+Hook structure above, where the curriculum content allows it (most
  sub-strands do — see the Bloom's ladder table). Layer `rng`-varied Kenyan place/actor names on top of the 10
  templates (per the Scenario+Hook rule) so the *effective* variety a learner sees is well beyond 10, not
  exactly 10.
- **Any fact pool feeding `categorize` / `click-match` / property-sort-style branches needs at least 10
  distinct facts across the whole pool combined** — not 10 per entity if the skill only has 2-3 entities
  (e.g. MAT.2's 3 metals), but 10+ total, so no single fact resurfaces every third question in a 20-question
  session.
- **A `categorize`/`click-match` branch must sample a *subset* of its fact pool each generation — never include
  every fact in the pool every time, even once the pool clears the 10+ floor above.** Grade 6 Science's
  `leversInEverydayLife.ts` `advantage-categorize` branch (2026-08-17) shipped with only 6 `ADVANTAGE_FACTS`
  and no subsampling — `shuffle(rng, ADVANTAGE_FACTS)` reordered all 6 but always included all 6, so every
  draw of that branch showed the user the identical 6 statements, just re-shuffled. This slipped past the
  session-level whole-session dedup (`PracticeSession.tsx`'s `questionSignature`) because that branch's
  `explanation` field is built by `.map(...).join(" ")` into one concatenated string — reordering the facts
  changes that string's exact text, so the computed signature looked "new" each time even though the visible
  question (same 6 statements sorted true/false) was identical to the learner. Reported by the user as the
  same sort-true/false question reappearing at Q11/14/16 in one session. Fixed by growing the pool to 12 facts
  and slicing a random 6-of-12 subset per generation (`shuffle(rng, ADVANTAGE_FACTS).slice(0, 6)`), matching
  the pattern `job-tool-match` already used elsewhere in the same file. **How to apply:** whenever a
  `categorize`/`click-match` branch's item list is the *entire* pool array with no `.slice(...)` after the
  `shuffle(...)`, that is a repeat risk indistinguishable from a single hardcoded template even if the pool
  itself is large enough — always slice to a subset strictly smaller than the pool once the pool is grown past
  the subset size, so both the visible content and the dedup signature genuinely vary between draws.
- **When the same rng-picked entity (a name, a place, an actor) appears more than once inside one template's
  prompt string, capture it in a local variable once and reuse that variable.** Calling the same picker
  function twice inside one template string draws two independent random values, not the same value twice —
  this was a real, shipped bug in MAT.2's first draft: two reasoning templates called `name(rng)` twice and
  produced two different names for what was meant to be the same person in one sentence (caught by sampling
  30 fresh generations and diffing the output, not by reading the code — this is why sampling matters, see
  below).
- **Verify pool depth by sampling, not by re-reading the array.** An array "looks" adequately sized on the
  page; whether it actually produces varied output only shows up by generating many outputs and diffing them.
  Before calling any skill done against this floor, generate 20-30 samples (either by driving the running app
  or by calling `generate(rng)` directly in a throwaway script) and confirm: no branch's text repeats
  verbatim across samples of that branch, and no cross-template bug like the name-mismatch above survives.
  This is now part of "done," the same way running `tsc` before calling a change done already is.
- **No named entity may be pinned to the exact same real-world example in every branch where it appears —
  ever, no exceptions.** A branch can pass the numeric floor above (10+ templates) and a skill can still
  repeat, in the way that actually damages trust, if one *entity* inside those templates (a tool, a fact, a
  named object) is always illustrated with the identical example every time it shows up, even across
  different branches. Concretely: if "tweezers" appears in a job-match list, a reasoning scenario, AND a
  fill-blank, and all three use "picking up a splinter or a bead," a learner who sees tweezers three times in
  one session sees the same fact three times even though three different `QuestionKind`s and three different
  template pools were technically involved — this is exactly as reputation-damaging as one branch repeating
  itself, and it slips past the per-branch floor check because each individual branch still has 10+ *other*
  templates. **When auditing or authoring a skill, identify every entity (tool/fact/named object) that
  recurs across 2+ branches, and confirm it is paired with at least 4 genuinely different real-world
  examples/jobs/framings across those appearances — never the same one copy-pasted into every branch.** Grade
  6 Science's `leversInEverydayLife.ts` tweezers case (2026-08-17) is the concrete example: "splinter/bead"
  was the only framing in all three appearances (job-match, one reasoning template, one fill-blank); fixed by
  adding two more reasoning templates (holding a screw during a toy repair, threading a bead onto a bracelet
  string) and two more fill-blanks (screw/nut/bolt during a repair; a seed placed precisely into a seed tray),
  so tweezers now carries 5 distinct real-world framings instead of 1, clearing the 4-minimum with a margin.
  This check is separate from, and in addition to, the per-branch template count — passing one does not imply
  the other.

- **A branch's `prompt` text itself needs its own pool, separate from the content/fact pool above — target
  20+ distinct phrasings, 10 as the absolute hard floor that may never be gone below (raised 2026-08-17,
  later the same session, from an initial 5+, once the user connected the number to `SESSION_LENGTH = 20` in
  `PracticeSession.tsx` and
  judged 5 too low).** Everything above in this section is about the *content* varying (facts, scenarios,
  correct answers) — none of it guarantees the *visible instruction line* varies. A branch can have a
  perfect 10+ content pool and still show the learner the identical sentence — e.g. "Sort each fact by the
  routine practice it describes." — every single time that branch is drawn, if the `prompt` field is one
  hardcoded string (or a template literal whose skeleton wording never changes despite interpolated
  content). Found 2026-08-17 via a user report on Grade 6 Agriculture's `rearingSmallDomesticAnimals.ts`:
  screenshots showed that exact stem recurring verbatim across a single 20-question session even though the
  sorted facts underneath genuinely varied. A related failure: a branch that already varies its wording
  across a small "frame" pool (a handful of scenario-narration templates) can still glue one fixed
  topic-anchor phrase into *every* frame (that file's reasoning frames all said "...animal care routine..."
  or "...small domestic animals..." regardless of frame) — so a single keyword dominates 100% of that
  branch's output. **Affordable way to reach 20+ without hand-authoring 20 full sentences:** compose two
  small orthogonal pools — a 5-6-entry "opener" pool (for frame branches: functions building the
  setup/situation clause) crossed with a 4-entry "closer" pool (a plain closing-question string), multiplying
  out to 20-24 combinations from ~10 authored pieces. `web/src/skills/agricultureG6/g6AgShared.ts`'s
  `combineFrames()` helper implements this and `rearingSmallDomesticAnimals.ts` is the worked, tsc-clean
  example (24 frames per scenario branch, from 6 openers x 4 closers). For plain flat-string prompt pools
  (no frame narration), just hand-author 20 varied phrasings directly — vary sentence form (imperative /
  question / "Work out..." / "Which... fits?"), not just synonym-swap one fixed skeleton.
- **Engine-level backstop, not a substitute for the authoring floor above:** `PracticeSession.tsx` tracks
  every exact `prompt` string shown so far in the current session (added 2026-08-17, same session, unbounded like the
  existing whole-question-signature dedup) and re-rolls rather than repeat one. This catches the case a
  content-pool-only check can't — two questions with completely different content still drawing the same
  `prompt` string — but it is a safety net under the 20+/10-floor bar above, not a replacement for it: a
  branch under-provisioned on phrasings will still exhaust the engine's re-roll budget and show a repeat once
  its pool runs out mid-session.

This is a numeric tightening of the "Minimum rigor bar" above, not a fifth axis — same four-axis framework,
sharper numbers, and it now applies to every branch kind, not just scenario-style ones.

## Knowledge-dimension checklist — distinguishing surface variation from genuine angle coverage (added 2026-08-16)

Context: a user-supplied framework proposed a formal JSON schema (`knowledge_units`, `conceptual_variations`,
`contexts`, `representations`, `reasoning_patterns`, `misconceptions`, `bloom_levels`, etc.) as the way to reach
"100-500+ distinguishable questions per skill." Audited against this codebase's actual architecture: the
*philosophy* already matches what's here and in `CURRICULUM-MINING-GUIDE.md` / `SKILL-QUALITY-STANDARDS.md` —
`QuestionKind` branches are representations, `place(rng)`/`name(rng)` are contexts/localization, the `reasoning`
branch is the reasoning-pattern mechanism, curated `wrong: [...]` arrays are misconceptions. **No new runtime
schema is needed** — `Skill.generate(rng)`'s lack of a formal `params` field is deliberate and should stay that
way; per-skill rng-template functions already achieve everything a declarative parameter-dimension array would,
just in code instead of data. Do not build a parallel JSON-schema engine layer on top of this.

What the audit *did* surface as a real gap: raw "distinguishable question" counts are inflated if they only
count `place(rng)`/`name(rng)` swaps as distinct questions. A reasoning template read with 12 different Kenyan
names is still testing the exact same fact from the exact same angle — real, useful surface variety (it defeats
rote answer-memorization), but it is not what actually prevents a skill from feeling thin. **What prevents
thinness is angle coverage**: whether the knowledge being tested is approached from genuinely different
cognitive angles, not just re-worded with a different name/place.

**Before authoring or expanding a skill, check angle coverage explicitly** — for each named fact/example/list
item mined per `CURRICULUM-MINING-GUIDE.md`, has it been tested from more than one of these angles across the
skill's branches?

- **Recognition** — "what is this" (identify from a visual/definition)
- **Classification** — "which category does this belong to" (categorize/click-match against a bucket set)
- **Application** — "use this fact in a new concrete situation" (the Scenario+Hook `reasoning` branch)
- **Interpretation** — "read a diagram/data and extract the fact" (a labelled `hotspot`, a chart-reading
  `multiple-choice`)
- **Prediction** — "given a changed condition, what happens" (e.g. "if X increases, what happens to Y")
- **Comparison** — "how do these two related things differ" (e.g. snail vs slug, millipede vs centipede — a
  pattern this codebase already uses well in places)
- **Error-analysis / Evaluate** — "is this claim/procedure/decision correct, and why" (`safety-evaluate`,
  `EVALUATE_TEMPLATES` branches)

A skill that hits Recognition + Classification + Application well but never Interpretation or Comparison for
its richest sub-topics has a real gap. Example found by the Grade 6 Science content-depth audit (2026-08-16):
`lightTravelAndReflection.ts` tested plane-mirror image characteristics (Recognition/Classification) but never
tested the underlying *law* (angle of incidence = angle of reflection) from any angle, and
`shadowsEclipsesRainbow.ts` showed a shadow/eclipse diagram but never used it as an actual Interpretation-tier
labelled-hotspot item, and never used the term "umbra" despite the design's assessment rubric explicitly
rewarding a labelled diagram. **A missing angle is a content gap, not a volume gap** — no amount of adding more
`place(rng)` values fixes it, because the underlying knowledge unit simply was never asked about that way.

This is not a fifth axis — it sharpens the existing content-breadth (`CURRICULUM-MINING-GUIDE.md`) and rigor
(this file's Bloom's ladder) axes together: content breadth asks "is every named item covered," this checklist
asks "is every named item covered from more than one angle." Apply it as an explicit step both during initial
authoring and during any Bloom's-tier audit pass — and, per the same "applies the moment it's reopened"
discipline as every other rule in this file, whenever an already-shipped skill is reopened for any reason.

## Gold-standard reference implementation (user-confirmed 2026-08-16 — "this must be the bar, forever")

`web/src/skills/preTechnicalG7/metallicMaterials.ts` (MAT.2, Grade 7 Pre-Technical) is the concrete worked
example for everything above — when auditing or building any skill and it's unclear whether a branch actually
clears the bar, open this file and compare against it directly, not just against the prose rules. What made it
land, specifically:

- **Questions carry real content, not a bare fact restated as a question.** Compare a thin version — "Which
  metal is magnetic?" — against the shipped version: *"A scrap-metal dealer in Kitale runs a magnet over a
  mixed pile of steel, aluminium and copper offcuts to sort them quickly. Why does this method work?"* Same
  underlying fact (steel is magnetic), but the second version makes the learner reason from a situation to the
  fact, not recall the fact directly — this is the difference between Remember-tier and Apply-tier dressed as
  the same topic.
- **Wrong answers are never filler.** Every distractor in the reasoning/evaluate templates states a specific,
  plausible, real misconception (e.g. "Aluminium — because it conducts electricity better than copper" — a
  genuinely common mix-up, since aluminium *is* used for power lines) and the `explanation` names that
  misconception explicitly rather than only restating the right answer.
- **Kenyan localization is structural, not decorative.** `place(rng)`/`name(rng)` pools get threaded through
  9 reasoning templates and 3 evaluate templates so the same underlying scenario reads differently every time
  it's drawn — this is what turns 9 templates into an effectively much larger pool.
- **Every `QuestionKind` used is content-appropriate, not forced.** `ordering` for density, `categorize` for
  both abstract facts and real-world items, `click-match` for property/use pairing, `fill-blank` for terse
  recall, `multiple-choice` carrying the Apply/Evaluate weight — nothing is shoehorned in just to hit a kind
  count.
- **A bug caught only by sampling, not by review** lives in this file's git history: two reasoning templates
  originally called the same `name(rng)` picker twice in one prompt, producing two different names for what
  was meant to be the same person. Re-derive this lesson before trusting any new skill's output on inspection
  alone — sample it.

## Bloom's-tier audit pass (required when a subject build is declared complete)

**Added 2026-08-16, user-confirmed as standing process.** The existing "done" checklist for a subject
(`tsc`, lint, fuzz-sample 20-30 generations per skill for structural validity/kind-variety/repeat-text) verifies
*structure*, not *tier* — nothing in the `Question` type stores a Bloom's tier, so no script can check it. Prior
to this, tier-correctness relied only on authoring-time discipline (the Scenario+Hook self-test applied while
writing), with no dedicated re-check afterward. That is now insufficient on its own.

**From now on, before declaring any subject build finished, run an explicit per-skill Bloom's-tier audit pass**,
separate from and in addition to the structural fuzz-test:

1. For every skill in the subject, re-read each branch in `generate(rng)` and classify it against the ladder
   table above (Remember / Understand / Apply / Analyze / Evaluate).
2. Apply the Scenario+Hook self-test explicitly per Apply/Analyze/Evaluate-labeled branch: strip the
   scenario/data out — is it still answerable from bare topic knowledge? If yes, it's mis-tiered (Remember
   wearing an Apply costume) and must be rewritten so the specific numbers/data are load-bearing.
3. Check the skill against the checkable minimum bar (at least one Apply-or-higher branch; an Analyze/Evaluate
   branch if the sub-strand's Core Competencies box names "Critical thinking and problem solving"; no
   `multiple-choice` branch drawing distractors from an unconstrained heterogeneous pool).
4. Note the result per skill (pass, or flagged with what's wrong) before moving on — don't silently skip a
   skill because it "looks fine" on a read-through; the tier claim needs to survive the strip-the-scenario test,
   not just a glance.

This is a fifth checkable step layered onto the existing four-axis discipline (mining/kind-variety/SVG/rigor) —
not a new axis, but closing the gap between "rigor bar exists in principle" and "rigor bar was actually verified
for every skill in this subject." Applies to every subject build from 2026-08-16 onward. Does not retroactively
mandate re-auditing already-finished subjects on its own — same "applies the moment it's reopened" discipline as
the other axes — but any subject reopened for other work should get this pass added if it hasn't had one yet.

## What this means for already-built skills

Same rule as the mining guide: **this numeric floor does not retroactively apply to every already-shipped
skill on its own** — that would be a large, explicitly-scoped mass-retrofit, tracked and paced the same way
the question-kind-variety retrofit was (see `SKILL-QUALITY-STANDARDS.md`'s `BUILD-PLAN-question-kind-variety.md`
precedent). From 2026-08-15 (rigor bar) / 2026-08-16 (pool-size floor) onward: any skill reopened for any
reason — a bug report, a kind-variety retrofit, a user question about a specific skill, an unrelated fix
nearby — gets checked against this floor as part of that touch, the same "the bar applies the moment it's
back open" discipline as the other three axes. It is binding on all new skill work unconditionally.
