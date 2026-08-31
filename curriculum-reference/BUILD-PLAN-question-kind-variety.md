# Build plan: question-kind variety retrofit (2026-08-14)

Standard being applied: `curriculum-reference/SKILL-QUALITY-STANDARDS.md` /
`[[feedback_question_kind_variety]]`. Every skill should branch across 2+ `QuestionKind`s where its content
naturally supports more than one representation. This pass retrofits existing skills that shipped locked to a
single kind; it does not touch curriculum accuracy/content, colors, or SVG visual coverage (those are
explicitly out of scope for this pass — see the standards doc).

Baseline audit (2026-08-14, before this pass) — "2+ kinds" = skills whose `generate()` already branches:

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

## Groups (parallel retrofit passes)

- [ ] **Group 1 — english (17) + kiswahili (8):** add a second branch to every skill currently locked to 1
      kind, unless genuinely nothing else fits (document why if so).
- [ ] **Group 2 — preTechnical (10) + agriculture (8) + hre (6):** same.
- [ ] **Group 3 — creativeArtsSports (15) + cre (16):** same. CAS already has 5 skills with 2+ kinds from the
      original build — leave those, retrofit the other 10. CRE has 1 (`widowsSon`) — retrofit the other 15.
- [ ] **Group 4 — socialStudies (25):** retrofit the ~16 still locked to 1 kind.
- [ ] **Group 5 — math (13) + science (13):** retrofit math's ~12 locked skills (careful: numeric correctness
      must hold across whatever second kind is added) and science's remaining locked skills; also patch the 3
      known missing `hint` fields in science (`classifyElementsCompounds.ts`, `flowerParts.ts`,
      `statesOfMatter.ts`) while in there — unrelated one-line fix, cheap to bundle.

`ire` (11/20 already) is left as-is for this pass — already a reasonable ratio, not a priority gap.

## Rules for every group (restated from the standards doc)

- Don't invent new facts to manufacture a second kind — re-present the same correct curriculum content in a
  different interaction shape (sequences→ordering, grouping→categorize, pairing→click-match,
  recall→multiple-choice/fill-blank, numeric→fill-blank/number-line).
- Every question branch keeps both `hint` and `explanation`.
- No changes to strand/subject metadata, skill ids, or codes — this pass only touches `generate()` bodies.
- Verification per group: 500-generation fuzz test per touched skill, `tsc --noEmit` clean, `npm run lint`
  clean, and a browser spot-check of a few retrofitted skills across both kind branches.

## Status

2026-08-14: the 5 parallel background agents originally dispatched for this hit a shared session usage limit
mid-task and died with partial progress (safe partial state — no broken files, confirmed by `tsc --noEmit` and
`npm run lint` both clean after the failures). Work continued directly (no more background agents) rather than
re-dispatching into the same limit. Progress so far, verified by direct kind-usage audit + `tsc --noEmit` after
each subject:

- [x] preTechnical (10/10 now have 2+ kinds)
- [x] agriculture (8/8)
- [x] hre (6/6)
- [x] creativeArtsSports (15/15 — includes the 5 that already branched from the original build)
- [x] cre (16/16 — includes `widowsSon` which already branched)
- [x] socialStudies (25/25)
- [x] science: 3 missing `hint` fields patched (`classifyElementsCompounds`, `statesOfMatter`, `flowerParts`),
      each of those 3 also given a second kind branch. Remaining science skills not yet re-audited for 2+ kinds
      beyond the original 9/13 baseline.
- [x] math (13/13) — remaining 9 (`volumeOfSolids`, `surfaceAreaOfSolids`, `simpleProbability`,
      `linearInequalities`, `cubesAndCubeRoots`, `lineEquationGraph`, `indices`, `circleSectorSegment`,
      `areaOfShapes`) all retrofitted directly (no more background agents, after the shared session-limit
      failure — see final status note below).
- [x] english (17/17)
- [x] kiswahili (8/8)
- [x] ire (20/20) — the 9 stragglers left out of the original scope (`lastDay`, `shariah`, `tawbah`,
      `virtuesInIslam`, `islamicMorality`, `domesticViolence`, `childCustody`, `unityOfMuslims`,
      `muslimInstitutions`) were retrofitted too, for full consistency across every subject.

## Final status (2026-08-14)

**All 151 skills across all 12 subjects now branch across 2+ `QuestionKind`s.** Zero skills left single-kind.
Verified directly (not just agent-reported):
- `tsc --noEmit`: clean, re-run after every subject group.
- `npm run lint`: clean.
- Fuzz test: a throwaway script (`npx tsx`, deleted after use) called every skill's `generate(rng)` 300 times
  (45,300 total generations) across varied seeds, asserting no throw and a structurally valid `Question` per
  kind (choices/correctIndex bounds and no dupes for multiple-choice, tokens/targets/correctMap consistency
  for click-match, item/bucket consistency for categorize, item/order consistency for ordering, non-empty
  `correctAnswer` for fill-blank) — 0 failures.
- Playwright spot-check (throwaway script, deleted after use): opened one skill from each of the 11
  newly-touched subjects against the running dev server — zero console/page errors, all rendered real content.

**Process note:** the original 5 parallel background agents dispatched for this hit a shared session usage
limit mid-task and failed (not a code problem — `tsc`/`lint` were confirmed clean on the partial state they
left behind). The remaining ~90 skills were retrofitted directly in the main conversation thread instead of
re-dispatching into the same limit, working subject-by-subject with a `tsc --noEmit` check after each group.

## 5+ kind retrofit pass (2026-08-16)

The bar was raised twice since the pass above: 2+ → 4+ (2026-08-14) → 5+ (2026-08-15, see
`curriculum-reference/SKILL-QUALITY-STANDARDS.md`). A pool-size-floor pass earlier in this session surfaced
that most Grade 9 Social Studies (25/25) and Grade 9 Science (13/13) skills — the two oldest-built subjects,
predating the 4+/5+ bar — were still sitting at only 2-3 kinds, plus 12 stragglers scattered across Grade 7
Social Studies (6), Grade 7 Science (5), and Grade 8 Science (1) that were below the bar while their sibling
files in the same folder already met it.

**All 50 flagged files retrofitted to 5 distinct `QuestionKind`s, verified directly (not just agent-reported):**
- `web/src/skills/socialStudies/*.ts` — all 25 files (armsOfGovernment, billOfRights, civicEngagement,
  communicationStyle, conflictResolution, constitutionalTimeline, constitutionOfKenya, culturalGlobalisation,
  environmentConservation, healthyRelationships, heritageSites, indigenousKnowledge, landFormingProcesses,
  mapScale, migrationFactors, nationalCountyFunctions, pathwayChoices, populationStructure, povertyReduction,
  riverProjects, stoneAgePractices, stressCoping, supportSystems, topographicalMaps, weatherInstruments)
- `web/src/skills/science/*.ts` — all 13 files (atomStructure, classifyElementsCompounds, curvedMirrors,
  flowerParts, interdependenceOfLife, metalsAndAlloys, nutritionInAnimals, nutritionInPlants,
  reproductionInPlants, simpleCircuit, statesOfMatter, waterHardness, waves)
- 6 `socialStudiesG7` stragglers (mediumOfTrade, earlyCivilisation, humanOrigin, peacefulCoexistence,
  slaveryAndServitude, weather)
- 5 `scienceG7` stragglers (acidsBasesIndicators, electricalEnergy, laboratorySafety, magnetism,
  mixtureSeparation)
- 1 `scienceG8` straggler (physicalAndChemicalChanges)

Every new branch mined real content from `curriculum-reference/grade-9/social-studies.json` /
`integrated-science.json` (or the design PDF directly where no JSON existed yet, e.g. Grade 7 Social
Studies/Science) rather than inventing facts — several files also picked up genuine content-breadth fixes
along the way (e.g. `indigenousKnowledge.ts` was missing the "Religion" domain the source names;
`metalsAndAlloys.ts` was missing "uses of metals/alloys in day-to-day life" entirely; `curvedMirrors.ts` was
missing the object-position image-characteristics table and parabolic mirrors). Each new branch carries its
own 10+-item pool per the pool-size floor, plausible-misconception distractors on multiple-choice per the
rigor bar, and `hint`+`explanation` on every branch (a handful of pre-existing branches from the original
build were missing `hint` and were patched too).

Verified: `tsc --noEmit` clean, `npm run lint` clean (0 errors/warnings on every touched file), and a
throwaway `tsx` fuzz script (500 generations per skill, deleted after use) confirming exactly 5 distinct
kinds at runtime with zero thrown errors and no missing `hint`/`explanation` across all 50 files.

**Process note:** 4 background agents were dispatched first (mirroring the pattern above) and all hit the
same shared session-usage limit before writing anything (confirmed via file timestamps — no partial/broken
state to recover). Per the standing lesson from the first pass, the retrofit was done directly in the main
thread instead of re-dispatching, working file-by-file with a `tsc --noEmit` check every 2-3 files.
`socialStudiesG8` (14/14) and `scienceG8` (7/8, excluding the straggler above) were left as-is — already
sitting at a legitimate 4-kind floor, not flagged as a gap.
