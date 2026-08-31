# Build Plan: German (Grade 9)

Source: `grade-9/german.json`, sourced from the real KICD Junior School Curriculum Design — German, Grade 9 (draft, first published 2024). See that file's `source` block for provenance.

## Standing rules (restated)
- One dedicated skill per sub-strand row below — never merged, never skipped without an explicit documented reason.
- Every skill branches across 2+ `QuestionKind`s from the start (not retrofitted later) — see `SKILL-QUALITY-STANDARDS.md`.
- 20-question session structure, KaTeX not applicable (no math), worked explanation after every submission, custom pointer-events dragging for any drag view, fuzz-tested at 300+ generations before calling a skill done.
- Never invent facts to manufacture a second kind — re-present the same real vocabulary/content in a different interaction shape.
- Umlauts (ä/ö/ü) and ß are folded to ae/oe/ue/ss as an accepted-answer fallback for typed fill-blank answers (`germanUtils.ts`, mirrors French's `foldAccents`), so a learner without a German keyboard isn't blocked.

## Structural note
Identical structure to French (`BUILD-PLAN-french.md`) — confirmed directly against the KICD PDF, not assumed from the shared essence statement alone. All 3 strands (Listening & Speaking, Reading, Writing) repeat the same 9 themes. Each theme's 3 skills are differentiated by modality, not duplicated:
- **LS (Listening & Speaking)** — oral vocabulary/expression recall: click-match phrase↔meaning, multiple-choice on appropriate response, categorize (e.g. formal vs informal, or thematic sorting).
- **R (Reading)** — a short original German dialogue/passage (via the `passage` field) + comprehension questions (categorize true/false, multiple-choice), mirroring `french/greetingsReading.ts`.
- **W (Writing)** — spelling/gap-fill (text-mode fill-blank), word-order (ordering).

All example German phrases are pulled directly from the curriculum design's own "z.B." (zum Beispiel) suggested-learning-experience examples — see `german.json`'s `notes` field — not invented independently.

## Checklist (27 skills)

### 1.0 Listening and Speaking (strand id `de-listening-speaking`)
- [x] 1.1 Greetings and Introduction — `de-ls-greetings` (LS.1)
- [x] 1.2 Family — `de-ls-family` (LS.2)
- [x] 1.3 My Surroundings (Countryside) — `de-ls-countryside` (LS.3)
- [x] 1.4 Time (Daily Routine) — `de-ls-routine` (LS.4)
- [x] 1.5 Fun and Enjoyment (Making Plans) — `de-ls-plans` (LS.5)
- [x] 1.6 Food and Drinks (Eating Out) — `de-ls-eating-out` (LS.6)
- [x] 1.7 My Body (At the Doctor's) — `de-ls-health` (LS.7)
- [x] 1.8 Weather and Environment — `de-ls-environment` (LS.8)
- [x] 1.9 Getting Around (Direction and Location) — `de-ls-directions` (LS.9)

### 2.0 Reading (strand id `de-reading`)
- [x] 2.1 Greetings and Introductions — `de-r-greetings` (R.1)
- [x] 2.2 Family — `de-r-family` (R.2)
- [x] 2.3 The Countryside — `de-r-countryside` (R.3)
- [x] 2.4 Daily Routine — `de-r-routine` (R.4)
- [x] 2.5 Making Plans and Dates — `de-r-plans` (R.5)
- [x] 2.6 Eating Out — `de-r-eating-out` (R.6)
- [x] 2.7 At the Doctor's — `de-r-health` (R.7)
- [x] 2.8 My Environment — `de-r-environment` (R.8)
- [x] 2.9 Direction and Location — `de-r-directions` (R.9)

### 3.0 Writing (strand id `de-writing`)
- [x] 3.1 Greetings and Introduction — `de-w-greetings` (W.1)
- [x] 3.2 Family — `de-w-family` (W.2)
- [x] 3.3 The Countryside — `de-w-countryside` (W.3)
- [x] 3.4 Time (Daily Routine) — `de-w-routine` (W.4)
- [x] 3.5 Making Plans and Dates — `de-w-plans` (W.5)
- [x] 3.6 Eating Out (Menu) — `de-w-eating-out` (W.6)
- [x] 3.7 At the Doctor's — `de-w-health` (W.7)
- [x] 3.8 My Environment — `de-w-environment` (W.8)
- [x] 3.9 Direction and Location — `de-w-directions` (W.9)

## Dashboard registration
- `SubjectId` union in `src/lib/types.ts`: add `"german"`.
- `SUBJECTS` in `src/lib/curriculum.ts`: `{ id: "german", name: "German", color: "cyan", icon: "chat" }`.
- `COLOR_MAP` in `src/app/page.tsx`: add `cyan` entry (new color, not yet used by any subject — sky/violet/emerald/amber/rose/indigo/lime/fuchsia/orange/purple/teal/blue are all taken).
- Icon reuses `chat` (speech bubble), same as French/Kiswahili.
