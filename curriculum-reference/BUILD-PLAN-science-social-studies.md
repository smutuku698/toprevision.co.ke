# Build plan: Integrated Science + Social Studies rebuild (started 2026-08-13)

## Rules (do not deviate)
1. **Exactness**: every quizzable sub-strand in the reference JSON gets its own dedicated skill. Never merge two different-named sub-strands into one skill file. A skill *may* internally branch over a sub-strand's own `subSubStrands` (e.g. one skill covering multiple shapes/cases within a single sub-strand) — that is not merging.
2. **No skipping**: every sub-strand is accounted for below. The only sub-strands skipped are ones flagged `non-quizzable (practical/project)` — same precedent as Pre-Technical's "Project" sub-strand. Skip is documented in this file and in curriculum.ts strand description, never silent.
3. **Old skills are preserved, not touched**: the 4 existing `science` skills and 8 existing `socialStudies` skills stay exactly as they are (same files, same content). They are reassigned to a new `isBonus: true` strand per subject (`sci-extra-practice`, `ss-extra-practice`) instead of their old (now-deleted) strand ids. They are NOT reassigned into any real strand, even where topically close — clean separation only.
4. **Architecture**: follow existing patterns exactly — pure `generate(rng): Question` functions in `src/lib/types.ts`'s `Skill` shape, seeded RNG from `src/lib/rng.ts`, KaTeX for any math notation, `passage` field for reference text, explanation derived from that question's own generated values, `VisualSpec`/`Visual.tsx` additions only if a sub-strand genuinely needs a new diagram type (don't force visuals where a click-match/categorize/multiple-choice bank fits better).
5. **Verification**: after all new skills for a subject are written — 500-generation fuzz test (`npx tsx` scratch script), `npm run lint` / `tsc --noEmit`, then browser screenshot check of the dashboard + a couple of opened sessions.
6. **UI**: bonus strands are hidden by default on `/subject/[subjectId]`, revealed by a "Show extra practice skills" toggle button — additive to what's already visible, never replacing it.

## Data model change
`Strand` in `src/lib/types.ts` gains `isBonus?: boolean`. `subject/[subjectId]/page.tsx` filters bonus strands out of the main render and lists them behind a toggle.

## Integrated Science — real structure (3 strands, 9 sub-strands, all quizzable)
Source: `curriculum-reference/grade-9/integrated-science.json`

- [x] Strand: Mixtures, Elements, and Compounds (`sci-mec`)
  - [x] Structure of the atom → `sci-mec-atom-structure`
  - [x] Metals and Alloys → `sci-mec-metals-alloys`
  - [x] Water hardness → `sci-mec-water-hardness`
- [x] Strand: Living Things and their Environment (`sci-lte`)
  - [x] Nutrition in Plants → `sci-lte-nutrition-plants`
  - [x] Nutrition in animals → `sci-lte-nutrition-animals`
  - [x] Reproduction in plants → `sci-lte-reproduction-plants`
  - [x] The Interdependence of Life → `sci-lte-interdependence`
- [x] Strand: Force and Energy (`sci-fe`)
  - [x] Curved mirrors → `sci-fe-curved-mirrors`
  - [x] Waves → `sci-fe-waves`
- [x] Bonus strand `sci-extra-practice`: simpleCircuit, statesOfMatter, classifyElementsCompounds, flowerParts (reassigned strandId only, content untouched)

## Social Studies — real structure (5 strands, 18 sub-strands, 1 non-quizzable)
Source: `curriculum-reference/grade-9/social-studies.json`

- [x] Strand: Social Studies and Career Development (`ss-scd`)
  - [x] Pathway Choices → `ss-scd-pathway-choices`
  - [x] Pre-career Support Systems → `ss-scd-support-systems`
- [x] Strand: Community Service-Learning (`ss-csl`)
  - [x] Community Service-Learning Project → **SKIPPED, non-quizzable** (term-long milestone project against a real community problem — no generated quiz fits; documented in strand description, same treatment as Pre-Technical's "Project")
- [x] Strand: People and Relationships (`ss-pr`)
  - [x] Socio-Economic Practices of Early Humans → `ss-pr-stone-age`
  - [x] Indigenous Knowledge Systems in African Societies → `ss-pr-indigenous-knowledge`
  - [x] Poverty Reduction → `ss-pr-poverty-reduction`
  - [x] Population Structure → `ss-pr-population-structure`
  - [x] Peaceful Conflict Resolution → `ss-pr-conflict-resolution`
  - [x] Healthy Relationships → `ss-pr-healthy-relationships`
- [x] Strand: Natural and Historic Built Environments (`ss-nhbe`)
  - [x] Topographical Maps → `ss-nhbe-topographical-maps`
  - [x] Internal Land Forming Processes → `ss-nhbe-land-forming`
  - [x] Multipurpose River Projects in Africa → `ss-nhbe-river-projects`
  - [x] Management and Conservation of the Environment → `ss-nhbe-environment-conservation`
  - [x] World Heritage Sites in Africa → `ss-nhbe-heritage-sites`
- [x] Strand: Political Developments and Governance (`ss-pdg`)
  - [x] The Constitution of Kenya → `ss-pdg-constitution`
  - [x] Civic Engagement in Governance → `ss-pdg-civic-engagement`
  - [x] Kenya's Bill of Rights → `ss-pdg-bill-of-rights`
  - [x] Cultural Globalisation → `ss-pdg-cultural-globalisation`
- [x] Bonus strand `ss-extra-practice`: weatherInstruments, mapScale, migrationFactors, armsOfGovernment, nationalCountyFunctions, constitutionalTimeline, communicationStyle, stressCoping (reassigned strandId only, content untouched)

## Also cheap/zero-risk (no skills built yet, pure strand-metadata swap)
- [x] Creative Arts & Sports strands → Foundations / Creating and Performing / Appreciation (real, from `creative-arts-and-sports.json`)
- [x] Religious Education strands → Creation / The Bible / The Life and Ministry of Jesus Christ / The Church / Christian Living Today (real, from `religious-education-cre.json`)

## Progress log
- 2026-08-13: plan written, starting with data model + curriculum.ts rewrite.
- 2026-08-13: all 26 new skill files written and registered (9 Integrated Science + 17 Social Studies), all checklist items above checked off; curriculum.ts rewritten for all 4 subjects (Integrated Science, Social Studies, Creative Arts & Sports, Religious Education); old skills reassigned to `sci-extra-practice`/`ss-extra-practice` bonus strands; bonus-strand toggle UI added to subject page.
- 2026-08-13: verification complete — `tsc --noEmit` clean, `npm run lint` clean (exit 0), fuzz test (500 generations × 26 skills, structural validity checks per question kind) 100% pass, zero failures. Browser-verified via a temporary Playwright script (deleted after use) against the running dev server: Integrated Science and Social Studies subject pages both show the correct real strands, the "Extra Practice" bonus strand is hidden by default and reveals the old 4/8 skills correctly on toggle-click, Community Service-Learning strand correctly renders nothing (zero quizzable skills, as planned), and 5 sample sessions across different question kinds (fill-blank, click-match, ordering, categorize) all rendered with no console/page errors. **This build is DONE — all checklist items complete and verified.**
