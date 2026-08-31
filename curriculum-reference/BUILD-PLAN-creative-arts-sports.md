# Build plan: Creative Arts & Sports (subject id `creative-arts-sports`) — 2026-08-13

Rule restated (see `[[feedback_bonus_strand_pattern]]` / `curriculum-reference/README.md`): every quizzable
sub-strand in the reference JSON gets its own dedicated skill — never merge two sub-strands into one skill file,
never skip a sub-strand without explicitly documenting why. Reference JSON:
`curriculum-reference/grade-9/creative-arts-and-sports.json` (confidence: high, read verbatim from the official
68-page KICD PDF on 2026-08-13).

Context: strand metadata for `creative-arts-sports` was already corrected in `curriculum.ts` in an earlier pass
(3 strands: `cas-foundations`, `cas-creating-performing`, `cas-appreciation`) but 0 skills exist yet. This subject
is unusually practical/performance-heavy (music performance, sports skills, painting, pottery, weaving,
photography, drama) — every sub-strand mixes physical/artistic execution (which this app cannot grade) with at
least some knowledge/theory content (which it can). Per the reference JSON's per-sub-strand notes, every one of
the 15 sub-strands has *some* testable knowledge content, so none are skipped — each skill focuses on the
describe/identify/analyse/explain outcomes and terminology from its sub-strand, not the physical performance
outcomes.

## Strand 1 — Foundations of Creative Arts and Sports (`cas-foundations`)

- [x] `cas-careers` (code F.1) — 1.1 Careers in Creative Arts and Sports: career types, entrepreneurial
      opportunities in the field.
- [x] `cas-components` (code F.2) — 1.2 Components of Creative Arts and Sports: play elements (theme,
      characters, plot, conflict, resolution, setting, language), components of physical fitness (power,
      reaction time) as concepts, rhythm note values (dotted minim, dotted crotchet, quaver + rests), pitch
      naming on the grand stave, F major scale construction on treble/bass staff.

## Strand 2 — Creating and Performing in Creative Arts and Sports (`cas-creating-performing`)

- [x] `cas-drawing-painting` (code C.1) — 2.1 Drawing and Painting: colour harmony/unity, analogous colours on
      a colour wheel, warm/cool colour mood, texture terminology (dabbing).
- [x] `cas-rhythm` (code C.2) — 2.2 Rhythm: note values (dotted minim, dotted crotchet, quaver + rests) and
      the effect of note extension on rhythmic patterns.
- [x] `cas-athletics-mosaic` (code C.3) — 2.3 Athletics and Mosaic: phases of triple jump, long-distance
      race types and Kenya's distance-running reputation, characteristics of mosaic composition.
- [x] `cas-melody` (code C.4) — 2.4 Melody: rhythmic/melodic/dynamic variation types, note values in melody.
- [x] `cas-rugby` (code C.5) — 2.5 Rugby: pass types (spin, pop, basic), kick types (place, drop).
- [x] `cas-photography` (code C.6) — 2.6 Photography: viewpoints (normal, bird's-eye, worm's-eye), scenic
      points, photography ethics.
- [x] `cas-descant-recorder` (code C.7) — 2.7 Descant Recorder: F major fingering/scale on the recorder,
      dynamics terminology (crescendo, diminuendo), pinching technique concept.
- [x] `cas-play` (code C.8) — 2.8 Play: script format elements (title, playwright, characters, acts, scenes,
      setting, stage directions, dialogue), play elements (theme, characters, plot, conflict, setting,
      language).
- [x] `cas-basketball-logo` (code C.9) — 2.9 Basketball and Logo Design: pass types (overhead, bounce, chest),
      dribbling types (high, low), logo design principles.
- [x] `cas-indigenous-crafts` (code C.10) — 2.10 Indigenous Kenyan Crafts: pottery coil technique, why clay is
      used, frame-loom weaving and 2/1 twill technique.
- [x] `cas-swimming` (code C.11) — 2.11.1 Swimming (Optional): body position for standing dive and butterfly
      stroke, water safety.
- [x] `cas-indigenous-games` (code C.12) — 2.11.2 Kenyan Indigenous Games (Optional): types of Kenyan
      indigenous board games, their mental-health/relaxation value. Built alongside Swimming even though the
      curriculum has schools choose only one — the app is not tied to a single school's choice, so both are
      covered faithfully (same principle as recording both HRE/IRE optional content in prior builds).

## Strand 3 — Appreciation in Creative Arts and Sports (`cas-appreciation`)

- [x] `cas-analysis` (code A.1) — 3.1 Analysis of Creative Arts and Sports: key signatures (C major, G major,
      F major), anti-doping ethics in sports, time signatures (2/4, 3/4, 4/4), performance directions (repeat,
      dynamics), art catalogue conventions (gallery, artist, medium, subject matter, function).

## Not skipped, nothing declined

All 15 sub-strands get a dedicated skill (2 in Strand 1, 12 in Strand 2, 1 in Strand 3 = 15 total). Nothing is
merged or silently dropped, per the standing rule.

## Verification (same bar as HRE/IRE build)

- [x] 500-generation fuzz test per skill
- [x] `tsc --noEmit` clean
- [x] `npm run lint` clean
- [x] Browser-verified: dashboard skill count, subject page, and sample sessions across question kinds used

## Status

All 15 skills built (2026-08-13): 2 in `cas-foundations` (F.1–F.2), 12 in `cas-creating-performing`
(C.1–C.12), 1 in `cas-appreciation` (A.1). Every skill focuses on the describe/identify/name/explain/analyse
outcomes and terminology from its sub-strand rather than the physical-performance outcomes (e.g. "perform a
standing dive," "play the scale on a recorder") that this app cannot grade. Question-kind mix: straightforward
`multiple-choice` banks for most skills, plus purposeful use of `categorize` (`cas-components` — 3-bucket
play-element/fitness-component/music-concept sort; `cas-rhythm` — note vs. rest; `cas-rugby` — pass vs. kick;
`cas-basketball-logo` — pass vs. dribble, mixed with a multiple-choice logo-design branch; `cas-analysis` —
key signature/time signature/art-catalogue-element sort, mixed with a multiple-choice branch) and `ordering`
(`cas-play` — script format elements in their typical order, mixed with a multiple-choice branch on
performance believability). All 15 files registered in `web/src/skills/index.ts` under a new
`web/src/skills/creativeArtsSports/` folder. A throwaway fuzz script (`npx tsx` from inside `web/`, deleted
after use) ran each skill's `generate(rng)` 500 times (7,500 generations total) with zero throws and zero
structural-validity failures (choice/bucket/order shape checks per question kind). `tsc --noEmit` and
`npm run lint` both came back clean for all new files (lint's one warning is pre-existing and unrelated, in
`web/src/skills/ire/surahHujurat.ts`). Browser-verified with a throwaway Playwright script (also deleted after
use) against the already-running dev server: dashboard card reads "Creative Arts & Sports — 3 strands ·
Grade 9 — 15 practice skills ready"; the subject page lists all 3 strand headers and all 15 skill cards with
correct F.1/F.2/C.1–C.12/A.1 codes (screenshot-confirmed); and sample sessions across `multiple-choice`,
`categorize`, and `ordering` question kinds (`cas-careers`, `cas-components`, `cas-rhythm`, `cas-play`,
`cas-basketball-logo`, `cas-photography`, `cas-analysis`) all rendered correctly with zero console/page errors.

## Grade 7 (2026-08-16)

Reference JSON: `curriculum-reference/grade-7/creative-arts-and-sports.json` (confidence: high, read verbatim
from the local `designs/GRADE 7 CREATIVE ARTS & SPORTS.pdf` — no web source needed). Uses the expanded schema
(`learningExperiences`, `linkedLearningAreas`, `scopeNotes`, `coreCompetencies`, `assessmentSignal`) per
`CURRICULUM-MINING-GUIDE.md`, not just the older `specificLearningOutcomes`/`keyInquiryQuestions` shape G8's
file used.

Grade 7 content is independently verified against its own PDF, not a reskin of G8/G9: different sports
(Javelin/Handball/Football vs G8's Middle Distance/Netball/Volleyball and G9's Triple Jump/Rugby/Basketball),
composes in **C major** (not G major, unlike G8/G9), different crafts (macrame net-weaving, stencil printing,
block printing vs G8's fabric decoration/basketry and G9's pottery/weaving/photography), and a different
narrative sub-strand (Storytelling + flip-book animation, not Verse or Play). Grade 7 has only ONE optional
sub-strand (2.8 Swimming, additive — no named second alternative), unlike G8/G9's paired "choose one of two"
Swimming-vs-Indigenous-Games structure; built anyway per the standing "nothing silently skipped" precedent.

### 1.0 Foundations of Creative Arts and Sports (strand id `g7-cas-foundations`)
- [x] 1.1 Introduction to Creative Arts and Sports — `g7-cas-introduction` (F.1)
- [x] 1.2 Components of Creative Arts and Sports — `g7-cas-components` (F.2)

### 2.0 Creating and Performing in Creative Arts and Sports (strand id `g7-cas-creating-performing`)
- [x] 2.1 Composing Rhythm — `g7-cas-rhythm` (C.1)
- [x] 2.2 Athletics (Javelin) — `g7-cas-athletics` (C.2)
- [x] 2.3 Composing Melody — `g7-cas-melody` (C.3)
- [x] 2.4 Handball — `g7-cas-handball` (C.4)
- [x] 2.5 Western Solo Instrument — `g7-cas-western-solo` (C.5)
- [x] 2.6 Football — `g7-cas-football` (C.6)
- [x] 2.7 Storytelling — `g7-cas-storytelling` (C.7)
- [x] 2.8 Swimming (Optional) — `g7-cas-swimming` (C.8)
- [x] 2.9 Kenyan Folk Song — `g7-cas-folk-song` (C.9)

### 3.0 Appreciation in Creative Arts and Sports (strand id `g7-cas-appreciation`)
- [x] 3.1 Analysis of Creative Arts and Sports — `g7-cas-analysis` (A.1)

### Not skipped, nothing declined
All 12 sub-strands get a dedicated skill (2 Foundations, 9 Creating/Performing including the optional Swimming
sub-strand, 1 Appreciation). Files live in `web/src/skills/creativeArtsSportsG7/`.

### Rigor and pool-size floor (applied from the start, unlike the G9/G8 builds which predate these rules)
Every skill was built against `RIGOR-STANDARDS.md`'s 2026-08-16 pool-size floor: categorize/click-match pools
combine well over 10 distinct facts each (verified by fuzz sampling below), multiple-choice branches carry
10-12 distinct question templates each with confusable-cluster distractors (e.g. `g7-cas-melody`'s "C major
vs G major vs F major vs D major" key-signature question directly exploits the real G7-vs-G8/G9 key
difference as a plausible misconception). Sub-strands naming "Critical thinking and problem solving" as a
core competency (`g7-cas-components`, `g7-cas-swimming`, `g7-cas-folk-song`) each carry a dedicated
Evaluate-tier branch (judging a described claim/technique against the correct facts), not just recall.
`g7-cas-rhythm` has a fully `rng`-computed Apply-tier beat-counting check (does a randomly combined pair of
notes fit inside one bar of 2/4 time?) rather than a fixed template bank.

### Question-kind mix — retrofitted to the 5+ bar (`[[feedback_content_depth_and_variety]]`, raised 2026-08-15)
Initial pass shipped most skills at 2-3 `QuestionKind`s (categorize + multiple-choice, some with ordering).
Caught before considering the subject done: the actual current standing bar (per memory, not yet reflected in
the checked-in `SKILL-QUALITY-STANDARDS.md`) is **5+ distinct QuestionKinds per skill**, raised from 4+ after
the Grade 7 Kiswahili round. Retrofitted all 12 skills with `click-match` and `fill-blank` branches (reusing
each skill's existing categorize fact pool as click-match term↔description pairs, plus 10-template fill-blank
pools per skill), and added `ordering`/`number-line` branches drawn either from a genuine curriculum sequence
or condensed directly from the design's own "Suggested Learning Experiences" order (e.g. `g7-cas-handball`'s
and `g7-cas-swimming`'s unit-stage orderings, `g7-cas-analysis`'s generic criteria→observe→analyse→judge
process) — never an invented sequence. Result: 11 of 12 skills hit 5 kinds. `g7-cas-introduction` is
deliberately capped at 4 (categorize, multiple-choice, click-match, fill-blank) — its content (4 unordered
categories + 9 unordered relationship dimensions) has no natural sequence, spatial angle, or numeric angle to
support a 5th kind honestly; forcing one would mean inventing a fact the curriculum doesn't state. This is
flagged explicitly in a code comment at the top of `introduction.ts`, per the standing rule that a sub-5 skill
must be an explicit, reasoned exception, not a silent gap.

`ordering` sub-strand sequences used: `g7-cas-athletics`'s 5 javelin-throw phases, `g7-cas-melody`'s 4-step
seasonal-card design, `g7-cas-storytelling`'s 6-step flip-book process, `g7-cas-football`'s 3 trapping
surfaces by ball height, `g7-cas-folk-song`'s 7-step block-printing process, `g7-cas-handball`'s and
`g7-cas-swimming`'s 5-stage unit progressions (from learning-experience order), `g7-cas-analysis`'s 4-step
analysis process. `number-line` used in `g7-cas-components` (note-beat values), `g7-cas-rhythm` (computed
beat-total of an rng-combined note pair), `g7-cas-western-solo` (C-major scale position 1-7, deliberately
excluding the repeated top C at position 8 to avoid an ambiguous two-answer question). Every branch has both
`hint` and `explanation`.

### Verification
- [x] `npx tsc --noEmit` clean (from `web/`), both before and after the kind-variety retrofit.
- [x] `npm run lint` clean for all 12 new files (remaining lint output is pre-existing and unrelated:
      `useSvgDragAngle.ts`/`useSvgDragPoint.ts`/`Visual.tsx`/two `englishG7` files).
- [x] Fuzz test (post-retrofit): a throwaway `npx tsx` script (deleted after use) called each of the 12
      skills' `generate(rng)` 800 times (9,600 generations total) with structural validity checks per
      `QuestionKind` (choice-array dedupe, `correctBucket`/`correctMap`/`correctOrder` referential integrity,
      `click-match` token/target count parity, `fill-blank` `correctAnswer` presence in `acceptedAnswers`,
      `number-line` bounds) and kind-count tracking — zero throws, zero structural-validity failures, 11/12
      skills confirmed at exactly 5 distinct kinds, `g7-cas-introduction` confirmed at its intentional 4.
      Categorize/click-match pools showed 100-200 distinct sampled item-sets per skill and multiple-choice/
      fill-blank showed 10-16 distinct texts per skill, confirming no branch returns static repeated text.
      `ordering` branches correctly show 1 distinct sequence each — they test recall of a single correct
      real-world order, not multiple valid orderings (same pattern as G9's `cas-play`).

### Registration
Strands added to `STRANDS` in `web/src/lib/curriculum.ts` (`g7-cas-foundations`, `g7-cas-creating-performing`,
`g7-cas-appreciation`, all `subjectId: "creative-arts-sports"`, `grade: 7` — no new `SubjectId`/`SUBJECTS`
entry needed since the subject id is already shared across grades). All 12 skills imported and registered in
`web/src/skills/index.ts`.

### SVG scope check
`Assests-svg/` (pre-primary/lower-primary counting objects — bottle tops, fruit, animals) and the root
`more about svg usage per cbc curriculum` design doc (generic per-grade-band SVG strategy) were both checked;
neither has anything relevant to Grade 7 Creative Arts & Sports content. Matches G8/G9 precedent for this
subject: `bar-chart` (`g7-cas-components`) is the only `VisualSpec` used, no `Assests-svg/` icons needed.
