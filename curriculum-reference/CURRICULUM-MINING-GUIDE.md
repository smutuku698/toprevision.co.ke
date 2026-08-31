# Comprehensive curriculum mining guide

**Status: standing rule, effective 2026-08-15. Applies to every subject/grade build and every future audit,
without exception.** Referenced from the repo-root `CLAUDE.md` so it loads automatically in every session.

## Why this exists

Grade 7 Integrated Science, sub-strand SI.3 "Laboratory apparatus and instruments"
(`web/src/skills/scienceG7/labApparatusUnits.ts`) was audited on 2026-08-15 against the actual KICD design PDF
(`designs/GRADE.7.INTEGRATED.SCIENCE.pdf`, Strand 1.0 → Sub-strand 1.3). The design document specifies:

- **7 SI base units** (length, mass, time, electric current, temperature, amount of substance, light
  intensity) — the shipped skill only quizzed 5, missing amount of substance (mole) and light intensity
  (candela) entirely.
- **7 basic science process skills** (manipulative, observation, measurement, classification, prediction,
  communication, conclusion) — the shipped skill only quizzed 3.
- Explicit instruction to cover **use and care** of apparatus for heating, mass, temperature, length, volume,
  weight, magnification, and time, **"include parts, functions and care of a light microscope; and parts of a
  bunsen burner"** — the shipped skill only did generic identify/match-to-use, never parts or care.
- A **consumer-protection / labels-on-packaging** application outcome — entirely absent from the shipped
  skill.
- An instruction to **"carry out activities to determine derived units from basic units"** — i.e. learners
  should calculate a derived quantity, not just sort quantities into basic/derived buckets, which is all the
  shipped skill did.
- Explicit, official **cross-links to Mathematics and Agriculture and Nutrition** in a "Link to other learning
  area" box — unused.

None of this was a data problem. Every one of these facts was sitting in the design PDF the whole time. The
skill was narrower than the curriculum allows because the PDF was mined for the *headline* sub-strand outcome
("use SI units for basic and derived quantities") and not for the *full text underneath it* — the
parenthetical lists, the explicit inclusions, the assessment rubric, the cross-links. That gap is what this
guide exists to close, permanently, for every subject and grade — not just science, not just this one
sub-strand.

**The user will always provide (or point to) the design PDFs as the data source.** The designs live in
`designs/*.pdf` — see `[[reference_designs_folder]]`. This guide governs what "using them" means: full-depth
extraction, not headline extraction.

## The core rule

> Every fact, list, example, explicit inclusion, explicit exclusion, and cross-link the KICD design document
> states for a sub-strand is in scope for that sub-strand's skill(s). A skill may leave something out only for
> a stated, defensible reason (content is above/below this grade's intended depth, requires media we cannot
> generate, etc.) — never by default, and never because nobody checked whether the source listed more than
> what got built.

Randomizing over an incomplete pool does not satisfy this rule. Five SI units picked at random from a
hardcoded list of five still feels narrow after twenty practice questions if the curriculum actually names
seven. "The generator branches" and "the generator covers the sub-strand" are different claims — this guide
is about the second one.

## Where the content actually lives in a KICD design PDF

A sub-strand's full text block has up to eight parts. All eight must be read before writing or auditing a
skill — not just the first two, which is the mistake that produced the SI.3 gap.

1. **Strand / Sub-strand header + lesson count.** The lesson count is a rough proxy for how much depth KICD
   expects (SI.3 gets 16 lessons — that's a lot of instructional time for a sub-strand that shipped as 5 thin
   branches).
2. **Specific Learning Outcomes (a, b, c, ...).** The terse, verb-first target skills. Necessary but not
   sufficient — these almost never contain the actual enumerated content pool, just the verb that should be
   applied to it (e.g. "use the SI units for basic and derived quantities in science" — doesn't say which
   units).
3. **Suggested Learning Experiences.** *This is where the real content pools live*, almost always inside
   parentheses attached to a bullet. This is the section that got skipped for SI.3. Examples from Grade 7
   Integrated Science alone: `(length, mass, time, electric current, temperature, amount of substance, light
   intensity)`, `(area, volume, speed, density)`, `(hydro-electric power, geothermal, solar, wind power,
   nuclear, tidal-wave, fossil fuels, biomass, natural gas, electrical cells)`, `(pressure cooker, electric
   cooker, electric blender, electrical lamp and torch, electric iron box, electric kettle, electric guitar,
   electric fan, air conditioner, electric oven, television, electric speaker, washing machine and electric
   refrigerator)`. Every one of these parenthetical lists is a ready-made content pool for a `randChoice` /
   `categorize` / `click-match` branch — treat every such list as a hard floor on pool size, not a set of
   examples to pick a subset from.
4. **Suggested Key Inquiry Question(s).** Often a good source for a "why does this matter" / application-style
   `multiple-choice` or `fill-blank` question, and a check that at least one question branch addresses the
   sub-strand's actual framing question, not just its facts.
5. **Explicit inclusions and exclusions**, written inline as italicized asides or `Note:` lines — e.g. *"include
   parts, functions and care of a light microscope; and parts of a bunsen burner"* (a hard inclusion — build
   it) or *"Note: avoid details of the nephron and osmoregulation"* (a hard exclusion — never generate a
   question on it, even if it would otherwise be pedagogically natural, because KICD has deliberately deferred
   it to a later grade). Treat both kinds of note as binding, not advisory.
5b. **Core competencies to be developed.** Not optional flavor — this is KICD's own declaration of the
   intended cognitive/skill target for the sub-strand, and it governs how hard the questions built from it are
   allowed to be. Full rule and Bloom's-tier mapping in `RIGOR-STANDARDS.md`; in short, "Critical thinking and
   problem solving" as a named competency requires at least one Analyze-or-Evaluate-tier branch, not just
   recall.
6. **Link to other learning area.** A sanctioned, official cross-subject or cross-strand bridge (e.g. SI.3 →
   Mathematics for measurement, SI.3 → Agriculture and Nutrition for measuring ingredients). These are safe,
   curriculum-endorsed material for a "which skill applies here" or scenario-style question that bridges two
   skills — use them instead of inventing your own cross-links.
7. **Suggested Assessment Rubric** (appears at the end of each strand). The "Meets expectations" row often
   reveals a behavior beyond the bare outcome text — e.g. SI.3's rubric says "**uses and cares for** apparatus
   and instruments... correctly," confirming that *care* (not just identification) is part of the tested
   competency, which the shipped skill missed entirely.
8. **Appendix: Suggested Assessment Methods / Learning Resources / Non-Formal Activities.** The "Learning
   Resources" row lists legitimate props (e.g. "SEPU Kit," "Basic Laboratory Apparatus... including
   microscope," "Universal indicator, pH scale and pH chart") — useful for deciding what a visual should
   depict. The "Non-Formal Activities" row occasionally suggests a real-world framing worth turning into a
   scenario question (e.g. "writing articles... on units (SI) for basic and derived quantities" hints at a
   labels/packaging application question).

## The anti-pattern this guide exists to kill

**Representative sampling without checking the source for more.** The failure mode isn't laziness in the
generate() logic — SI.3's branching logic was fine, multi-kind, and matched `SKILL-QUALITY-STANDARDS.md`. The
failure was in the *data arrays feeding it*: `SI_UNITS` had 9 entries when the source names at least 11
(7 basic + the 4 named derived ones), `SKILL_QUESTIONS` covered 3 of 7 basic skills. Nobody deliberately
excluded mole, candela, manipulative, measurement, communication, or conclusion — they just weren't in the
first pass and nobody diffed the array against the source text afterward.

The fix is procedural, not a one-time content patch: **every content pool array in a skill file must be
diffed against the enumerated list in its source sub-strand text before the skill is considered done.**

## Mandatory mining checklist — run before writing or auditing any skill's `generate()`

1. Open the relevant `designs/*.pdf` with the `Read` tool. **Do not pass a `pages` parameter** — this
   environment has no `pdftoppm`/poppler installed, so page-range rendering always fails with a tool error;
   a plain `Read` call (no `pages`) extracts full text natively and works reliably. This has been confirmed
   working in this environment as of 2026-08-15.
2. Locate the target strand and sub-strand. Read the **entire** block per the eight-part list above, not just
   the Specific Learning Outcomes column.
3. Write out (mentally or in a scratch note) the full enumerated content pool for every parenthetical list in
   the Suggested Learning Experiences column. Treat each list as a minimum required pool size.
4. Note every explicit inclusion ("include...") and exclusion ("Note: avoid...") verbatim. Exclusions are hard
   walls — no question should require knowledge the design has deliberately deferred to a later grade.
5. Note the Link to other learning area box, if present — this is your sanctioned cross-link material, if a
   skill-knowledge / bridge-style question branch makes sense for this sub-strand.
6. Read the Suggested Assessment Rubric's "Meets expectations" row for this sub-strand — check it doesn't
   imply a behavior (care, application, calculation) the outcomes column alone doesn't make obvious.
7. Check the Appendix row (Suggested Learning Resources / Non-Formal Activities) for legitimate visual props
   or real-world framings.
8. **Before or while writing `curriculum-reference/<grade>/<subject>.json`**, capture everything from steps
   3–7 using the expanded schema below — this is the durable record, so nobody has to re-open the PDF and
   re-derive the content pool from memory the next time this sub-strand is touched.
9. Build the skill so every item from step 3's pools is implemented (or explicitly declined with a reason,
   following the same "nothing silently skipped" discipline `curriculum-reference/README.md` already applies
   at the sub-strand level — this guide extends that discipline down to the item-within-a-list level).
10. Before marking the skill done, diff the implemented arrays against the enumerated lists one more time.
    Short of the full list without a stated reason = not done.

## How this interacts with the other standing checklists

Four independent axes of "is this skill actually done," all required, none of which implies the others:

| Axis | Governed by | Question it answers |
|---|---|---|
| **Content breadth** | This guide | Does the skill's fact pool cover everything the curriculum design enumerates for this sub-strand? |
| **Interaction-kind variety** | `curriculum-reference/SKILL-QUALITY-STANDARDS.md`, `[[feedback_question_kind_variety]]` | Does the skill branch across 2+ `QuestionKind`s? |
| **Visual coverage** | `Assests-svg/` + the SVG design doc, `[[reference_svg_asset_resources]]`, `[[feedback_svg_check_before_dispatch]]` | Where a visual would genuinely help, does one exist / get built? |
| **Cognitive rigor** | `curriculum-reference/RIGOR-STANDARDS.md` | Does the skill hit the Bloom's tier its Core Competencies box implies, with distractors that require real understanding to eliminate? |

A skill can pass some of these and still fail another — SI.3 passed interaction-kind variety cleanly
(4 `QuestionKind`s, matched the retrofit standard) while failing content breadth badly. Check all four,
separately, every time.

## Schema change: curriculum-reference JSON now captures learning experiences verbatim

The previous schema (`_schema-example.json`) captured `specificLearningOutcomes` and `keyInquiryQuestions`
only — exactly the two fields that, per the mining checklist above, are *not* where the enumerated content
pools live. That gap in the reference schema is very likely why SI.3 (and possibly other already-built
sub-strands) shipped narrow: even a careful pass against the old schema would not have surfaced the 7-unit /
7-skill lists, because the schema had nowhere to put them.

The schema now adds three fields (all optional, added going forward — see `_schema-example.json` for a fully
worked example using the real SI.3 text):

- **`learningExperiences`**: array of the Suggested Learning Experiences bullets, **verbatim, including every
  parenthetical list in full** — do not truncate or summarize a parenthetical list when transcribing it.
- **`linkedLearningAreas`**: array of strings from the "Link to other learning area" box, verbatim.
- **`scopeNotes`**: array of any explicit inclusion/exclusion asides or `Note:` lines, verbatim, tagged
  `include:` or `exclude:`.

`assessmentSignal` (optional, freeform) may also be used to capture anything the "Meets expectations" rubric
row implies beyond the stated outcomes, when it's non-obvious (as with SI.3's "uses and cares for").

## Process for every new subject/grade build, start to finish

1. User provides or points to the `designs/*.pdf` (already the standing rule per `[[reference_designs_folder]]`
   — check `designs/` before ever web-searching curriculum content).
2. Read the PDF directly (see step 1 of the mining checklist for the no-`pages` note).
3. For every strand → sub-strand (→ sub-sub-strand, if the design itself breaks a sub-strand down further —
   see `_schema-example.json`'s Indices and Logarithms example), run the full 10-step mining checklist above.
4. Write/update `curriculum-reference/<grade>/<subject>.json` with the expanded schema **before** writing any
   skill code for that subject — the JSON is the durable, checkable record of what the full content pool
   should be, so skill-writing becomes "implement this checklist" rather than "recall what the PDF said."
5. Build the skill(s). Every enumerated pool item is implemented or explicitly declined with a reason.
6. Run the interaction-kind-variety and SVG-coverage checks (see table above) before calling any skill done.

### Non-negotiable gate: no subject/grade is "done" without its `curriculum-reference/<grade>/<subject>.json`

**Confirmed recurring failure mode, 2026-08-17:** both Grade 6 Mathematics and Grade 6 Agriculture shipped their
full skill set (38 and 15 files respectively, both fuzz-tested and wired) with **no** `curriculum-reference/
grade-6/mathematics.json` or `agriculture.json` on disk — step 4 above was skipped both times. In both cases the
mining happened for real (the PDF was read in full, the content was mined correctly) but the mined text was
handed straight to a background build agent (or used directly) instead of being written to the durable JSON
first, so the "write it before skill code" instruction got silently bypassed under the pressure of getting a
large multi-file build moving quickly. The user caught the gap by noticing the file missing from the folder
afterward, not because any of this guide's other checks caught it — content breadth, kind variety, SVG coverage
and rigor were all fine; only the durable record was missing. A wider audit the same day found this is not
isolated to Grade 6: **Grade 7 is missing the JSON for 9 of its 16 shipped subjects (math, english, science,
kiswahili, social-studies, agriculture-nutrition, french, german, cre) and Grade 9 is missing 4 of 16 (kiswahili,
agriculture-nutrition, indigenous-language, arabic)** despite both grades being marked complete in project
memory — this has clearly been happening for a long time, not just in this one session.

**The fix, effective immediately and binding on every future subject/grade build:**

1. Step 4's ordering ("before writing any skill code") is the ideal, but is demonstrably not self-enforcing on
   its own — treat it as best-effort, not sufficient.
2. **Before declaring ANY subject/grade build done — the same moment `tsc --noEmit`/eslint/the fuzz sweep are
   run — also confirm `curriculum-reference/<grade>/<subject-file>.json` exists on disk and is valid JSON**
   (`Get-Content <file> -Raw | ConvertFrom-Json` on Windows, or any JSON parse) **and covers every sub-strand
   that has a shipped skill file.** This is now a required step in the standard "done" checklist, on the same
   footing as the structural fuzz check — a subject is not finished if this file is missing, full stop.
3. When content is mined and handed to a background build agent inline (the normal pattern for large parallel
   builds — see `[[project_grade6_rollout]]` for worked examples), **write the JSON immediately after mining and
   before dispatching the agent**, using the exact mined text already assembled for the agent prompt — it is the
   same content, so writing the JSON first costs no extra mining effort, only the file-write itself.
4. If this gate is ever reached and the JSON is missing for a subject that already shipped, **do not defer
   it as "a future cleanup"** — write it immediately from whatever mined content is still available (the skill
   files' own code comments usually carry enough verbatim source text to reconstruct it accurately, as they did
   for the Grade 6 Agriculture backfill), or re-read the source PDF if the content isn't recoverable from the
   code. A subject with shipped skills and no reference JSON is an open gap, not a closed one, regardless of how
   long ago the skills shipped.

## Photo-diagram images: convert, register, and reuse — never inline, never .png

Confirmed 2026-08-16, after the first nano banana image batch (Grade 7 Science/Pre-Technical/Agriculture, see
`curriculum-reference/grade-7/IMAGE-PROMPTS-nanobanana.json`) was wired into the app. Two standing rules for
every photo-diagram from now on:

1. **Always convert to WebP before wiring anything up.** Run `npm run images:webp` (from `web/`) — it walks
   `public/images/`, converts every PNG/JPG to `.webp` via `sharp`, and deletes the original in place. This is
   not optional polish: the first batch's PNGs were 650–1000KB each; the same images at WebP quality 85 came
   out at 20–65KB — a ~95% reduction. Never reference a `.png`/`.jpg` path in a `VisualSpec`; if one exists
   under `public/images/`, the conversion step was skipped.
2. **Register the image once in `web/src/lib/photoImages.ts` (the cross-skill/cross-subject shared registry),
   never inline a `{ type: "photo-diagram", ... }` spec or its part list directly inside a single skill file.**
   The whole reason a real photo is worth the cost of generating it is that the *same* image can back multiple
   different questions across multiple different skills — potentially in more than one strand, sub-strand, or
   even subject within the same grade (e.g. one lab-apparatus photo legitimately serves an Integrated Science
   identification skill AND, if a Pre-Technical sub-strand genuinely covers overlapping equipment, a
   Pre-Technical skill too — see `RIGOR-STANDARDS.md`'s point about only crossing subjects where the
   curriculum's own "Link to other learning area" box sanctions it, not by invented association). Inlining the
   image/part data in one skill file defeats that reuse and risks a second skill re-deriving a different
   letter→part mapping for the same photo. Import from the registry; never duplicate it.
3. **One image, many genuinely different questions — not one recall question repeated.** Per skill that uses
   a registered image, branch across Bloom's tiers the same way `labApparatusUnits.ts` does for its three
   images: a Remember-tier "what is labelled X" branch, at least one Apply-tier branch (a scenario that needs
   the right part/tool), and where the content supports it, an Evaluate-tier branch (judge a described
   practice against the part's correct use/care). This is the same rigor bar `RIGOR-STANDARDS.md` sets for
   every skill — photo-backed skills are not exempt just because the image itself is richer than an SVG.
4. **Every registry entry must record which printed letters were skipped and why** (`skippedLabels` field) —
   generated images sometimes duplicate or skip a letter; auditably skipping an ambiguous one is correct,
   silently guessing at its meaning is not (see the `microscope` and `bunsenBurner` entries in
   `photoImages.ts` for the pattern).

## What this means for already-built grades and subjects

This is not an instruction to mass-rebuild Grade 7, 8, or 9 content that has already shipped — see
`[[project_grade7_rollout]]` and `[[project_grade8_rollout]]` for what's already built and confirmed working.
But from 2026-08-15 onward: **any time an already-shipped skill is opened for any reason** (a bug report, a
kind-variety retrofit, a user question about a specific skill, an unrelated fix nearby) — re-run this mining
checklist against that skill's source sub-strand as part of that touch, the same way the SVG-check rule
already piggybacks on any visual-related touch. The bar doesn't apply retroactively on its own, but it applies
the moment a skill is back open for any reason.
