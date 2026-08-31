# Build plan: Grade 8 Social Studies

Source: `curriculum-reference/grade-8/social-studies.json` (KICD Grade 8 Social Studies, revised 2024).
Rules: one dedicated skill per quizzable sub-strand, never merged, never silently skipped. Content bar per
`feedback_content_depth_and_variety` memory: 4+ QuestionKinds per skill, SVG where the content has a real
spatial/data angle (not forced), full topical breadth per sub-strand (not one repeated fact), real-world/Kenyan
framing, basic→advanced layering. Strand ids use `g8-ss-` prefix; skill ids `g8-ss-<strand>-<slug>`.

## Strand 1 — Social Studies and Personal Management (`g8-ss-spm`)
- [x] SPM.1 Self-Improvement — `selfImprovement.ts`
- [x] SPM.2 Self-Esteem Assessment — `selfEsteemAssessment.ts`

## Strand 2 — Community Service Learning (`g8-ss-csl`)
- [ ] CSL.1 Community Service Learning Project — **not quizzable**, term-long milestone community project
  (identify a problem, design/plan/implement a solution, report). Zero skills, same precedent as Grade 9
  Social Studies' `ss-csl` and Pre-Technical's "Project". Strand kept in `curriculum.ts` for completeness,
  flagged in its description.

## Strand 3 — People and Relationships (`g8-ss-pr`)
- [x] PR.1 Scientific Theory about Human Origin — `humanOrigin.ts`
- [x] PR.2 Early Civilisation (Asia, Europe, Swahili coast) — `earlyCivilisation.ts`
- [x] PR.3 Trans-Saharan Slave Trade — `transSaharanSlaveTrade.ts`
- [x] PR.4 Population Growth in Africa — `populationGrowth.ts`
- [x] PR.5 Diversity and Interpersonal Skills — `diversityInterpersonalSkills.ts`
- [x] PR.6 Peaceful Conflict Resolution (Negotiation, Mediation, Arbitration) — `peacefulConflictResolution.ts`

## Strand 4 — Natural and Historic Built Environments (`g8-ss-nhbe`)
- [x] NHBE.1 Map Reading and Interpretation — `mapReading.ts`
- [x] NHBE.2 Weather and Climate (Desert, Semi-desert, Tropical, Mediterranean, Mountain) — `weatherAndClimate.ts`
- [x] NHBE.3 Vegetation in Africa — `vegetationInAfrica.ts`
- [x] NHBE.4 Historical Sites and Monuments in Africa (Fort Jesus, Kilwa, Great Zimbabwe, Giza, Meroe,
      Timbuktu, Robben Island) — `historicalSites.ts`

## Strand 5 — Political Developments and Governance (`g8-ss-pdg`)
- [x] PDG.1 The Constitution of Kenya — `constitutionOfKenya.ts`
- [x] PDG.2 Human Rights — `humanRights.ts`
- [x] PDG.3 Citizenship — `citizenship.ts`

15 skills total across 4 skill-bearing strands (CSL is non-quizzable). Files live in
`web/src/skills/socialStudiesG8/`, registered in `curriculum.ts` (`g8-ss-*` strands) and `src/skills/index.ts`.

**Status confirmed done (2026-08-14/15):** all 15 files exist, all registered, all 4+ `QuestionKind`s per skill
(1500-gen fuzz test, 22,500 runs, zero structural failures), clean `tsc --noEmit`/`npm run lint`, and
Playwright-verified (all 4 skill-bearing strand headers + all 15 skill cards on the subject page, 9 sample
sessions across categorize/click-match/ordering/fill-blank/multiple-choice kinds including the `historicalSites`
bar-chart SVG branch, zero console errors). Note: an earlier pass of this file had already checked every box
above before the first 11 skills were actually registered in `curriculum.ts`/`index.ts` — the checklist had
drifted ahead of the real code. Don't trust this file's checkboxes as proof of registration; verify against
`curriculum.ts`/`index.ts`/the filesystem directly.
