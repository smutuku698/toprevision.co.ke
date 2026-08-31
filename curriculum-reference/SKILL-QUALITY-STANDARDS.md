# Skill quality standards — question-kind variety, colors, visuals

Standing checklist to apply to every skill, in every subject, from now on (existing and new). Confirmed
2026-08-14: skills should not stay locked to one interaction type — that reads as monotonous over repeated
practice, and it's the difference between this feeling like a real IXL-style system versus a flat quiz bank.

## Question-kind variety (bar raised twice since this section was first written — see below)

`QuestionKind` (`web/src/lib/types.ts`) has 7 values: `multiple-choice`, `fill-blank`, `click-match`,
`categorize`, `ordering`, `hotspot`, `number-line`.

**Current standing bar, effective 2026-08-15 (supersedes the "2+" text below, which is left for history):
every skill should branch across 5+ distinct `QuestionKind`s where content allows.** Raised from 2+ → 4+
(2026-08-14) → 5+ (2026-08-15, Grade 7 Kiswahili round — user feedback: even 4+ still read as "repetition of
almost the same kind of choices activity," too much multiple-choice specifically). 4 remains the floor only
when a skill's content is genuinely too narrow to support a 5th kind — rare, and must be flagged explicitly
in a code comment when it happens (see `web/src/skills/creativeArtsSportsG7/introduction.ts` for a worked
example: a sub-strand with no natural sequence/spatial/numeric angle, capped at 4 with the reason documented
inline). Full detail and history in memory `[[feedback_content_depth_and_variety]]` — this file is the
durable, checked-in copy of that memory's current number so a fresh session reading only the mandatory
`curriculum-reference/` docs (not memory) still gets the right bar.

**Per-skill rule (original 2026-08-14 text, numbers superseded above):** wherever a sub-strand's content
naturally supports more than one representation, a skill's `generate(rng)` should branch between multiple
different `QuestionKind`s (usually via `randChoice` picking which branch function to call), not always return
the same single kind. This is already the established pattern in several existing skills — use these as the
template rather than inventing a new branching style: `science/waterHardness.ts`, `creativeArtsSports/play.ts`,
`creativeArtsSports/basketballLogo.ts`, `creativeArtsSports/analysis.ts`, most of the `ire/` folder, and (for
a 5-kind worked example) any file in `web/src/skills/creativeArtsSportsG7/`.

**Reliable ways to add a kind without inventing facts, when a skill is short of the bar:**
- `click-match`: reuse an existing categorize fact pool's `label`/`reason` fields directly as token/meaning
  pairs — the same facts, a different interaction shape.
- `fill-blank`: turn existing recall facts into a "___" sentence; needs 10+ distinct templates per the
  pool-size floor (`RIGOR-STANDARDS.md`).
- `ordering`: only add where a genuine sequence exists in the source — either an explicit step list, or (a
  reusable trick) condensed directly from the design PDF's own "Suggested Learning Experiences" bullet order,
  which is itself already a suggested teaching sequence. Never invent an order the curriculum doesn't state.
- `number-line`: only where a genuine numeric quantity exists (beat counts, scale positions, etc.) — watch for
  ambiguous targets (e.g. a musical scale's repeated tonic note maps to two positions; exclude one).

**Picking a sensible second kind (don't force a bad fit):**
- Sequences / steps / processes → `ordering`
- Grouping / classification into buckets → `categorize`
- Term↔definition, item↔property pairing → `click-match`
- Recall / "which of these" / "why" → `multiple-choice` or `fill-blank`
- Numeric / measurement answers → `fill-blank` or `number-line`
- Spatial / diagram-based (needs a `visual`) → `hotspot` (rare — only when a visual genuinely helps)

It's fine for a skill to stay single-kind if nothing else genuinely fits the content — but that should be a
deliberate call, not the default. Never invent new facts to manufacture a second kind; branch by re-presenting
the *same* correct curriculum content in a different interaction shape.

**Subject-level rule:** across a whole subject's skill set, aim to collectively touch most of the 7 kinds, not
just 1–2 — so a learner moving through the subject's skill list sees variety even on skills that individually
stay single-kind.

**Non-negotiable regardless of kind:** every question branch has both `hint` and `explanation` — no exceptions.

**Kind-count variety is a separate axis from pool-depth-per-kind — passing one does not imply the other.**
This section governs how many different `QuestionKind`s a skill branches across. `RIGOR-STANDARDS.md`'s
"Minimum pool-size floor" section governs how many distinct templates/facts feed *each individual* branch
(10+ fill-blank templates, 10+ scenario templates for Apply/Analyze/Evaluate branches, 10+ facts in any
categorize/click-match pool, no branch ever returning static unrandomized text). A skill can branch across
5 `QuestionKind`s and still feel repetitive if each branch's underlying pool is thin — check both, every time.

**Retrofit status (2026-08-14 audit, before this pass):**

| Subject | Skills | Kinds used | Skills w/ 2+ kinds |
|---|---|---|---|
| math | 13 | 5 | 1 |
| english | 17 | 4 | 0 |
| science | 13 | 6 | 9 |
| kiswahili | 8 | 4 | 0 |
| socialStudies | 25 | 5 | 9 |
| preTechnical | 10 | 3 | 0 |
| agriculture | 8 | 3 | 0 |
| creativeArtsSports | 15 | 3 | 5 |
| cre | 16 | 5 | 1 |
| hre | 6 | 3 | 0 |
| ire | 20 | 5 | 11 |

Retrofit pass tracked in `curriculum-reference/BUILD-PLAN-question-kind-variety.md`.

## Colors

`SUBJECTS[].color` in `curriculum.ts` must stay a distinct Tailwind color name per subject (dashboard card
styling) — confirmed no duplicates across all 11 subjects as of 2026-08-14. Just keep it that way when adding
new subjects (languages); no other work needed here for now.

## SVG visuals

Deliberately **not** part of this retrofit pass. Visual coverage (`VisualSpec` in `types.ts` /
`web/src/components/visuals/Visual.tsx`) is currently concentrated in math + one science skill; expanding it
to more subjects is deferred and will be tackled together when image-capability work happens, not now — per
explicit user direction (2026-08-14: "well extend the branch kinds when we include images so this will sort
the color aspects... for now just sort the branch kinds").

## How to apply this to a brand-new subject build (e.g. the still-unbuilt languages)

Bake question-kind variety into the build plan from the start rather than retrofitting later: when drafting a
subject's `BUILD-PLAN-<subject>.md`, note a candidate second kind per skill up front using the picking-rule
above, same as content/strand assignment is already noted.
