# Build Plan: Mandarin (Grade 9)

Source: `grade-9/mandarin.json`, sourced from the real KICD Junior School Curriculum Design — Mandarin, Grade 9 (draft, first published 2024, ISBN 978-9914-43-432-3). See that file's `source` block for provenance.

## Standing rules (restated)
- One dedicated skill per sub-strand row below — never merged, never skipped without an explicit documented reason.
- Every skill branches across 2+ `QuestionKind`s from the start (not retrofitted later) — see `SKILL-QUALITY-STANDARDS.md`.
- 20-question session structure, KaTeX not applicable (no math), worked explanation after every submission, custom pointer-events dragging for any drag view, fuzz-tested at 1000+ generations before calling a skill done.
- Never invent facts to manufacture a second kind — re-present the same real vocabulary/content in a different interaction shape.
- All vocabulary is real, pulled directly from the curriculum design's own suggested-learning-experience "e.g." examples (see `mandarin.json`'s `notes` field) — never invented.

## Structural note
Identical structure to French (`BUILD-PLAN-french.md`) and German (`BUILD-PLAN-german.md`) — confirmed directly against the KICD PDF, not assumed from the shared essence statement alone. All 3 strands (Listening & Speaking, Reading, Writing) repeat the same 9 themes. Each theme's 3 skills are differentiated by modality, not duplicated:
- **LS (Listening & Speaking)** — oral vocabulary/expression recall: click-match hanzi+pinyin phrase ↔ English meaning, multiple-choice, categorize (e.g. nuclear vs extended family, pet vs farm vs wild animal).
- **R (Reading)** — a short original Mandarin dialogue/passage (via the `passage` field, given in hanzi with pinyin glosses) + comprehension questions (categorize true/false, multiple-choice), mirroring `french/greetingsReading.ts`.
- **W (Writing)** — spelling/gap-fill (text-mode fill-blank) + word-order (ordering).

## Mandarin-specific note: no Chinese keyboard/IME
Unlike French/German (Latin-script fill-blank answers), Mandarin content is in hanzi, which the learner cannot type without a Chinese IME. All typed fill-blank answers in the Writing skills ask for the **pinyin** (romanization) of the missing word, never the hanzi itself — hanzi is only ever used in click-to-select interactions (click-match, categorize, ordering, multiple-choice), never as required typed input. `mandarinUtils.ts` exports `foldPinyinTones()`/`pinyinAccepted()`, which strips pinyin tone diacritics (ā/á/ǎ/à → a, etc., via the same NFD-decompose-and-strip-combining-marks trick as French's `foldAccents` — Unicode NFD generically decomposes toned/umlauted Latin vowels into base + combining mark, so no per-vowel special-casing is needed) so a learner who types "nihao" for "nǐhǎo" is still marked correct.

## Checklist (27 skills)

### 1.0 Listening and Speaking (strand id `ma-listening-speaking`)
- [x] 1.1 Greetings and Introduction — `ma-ls-greetings` (LS.1)
- [x] 1.2 Family — `ma-ls-family` (LS.2)
- [x] 1.3 My Surrounding (animals) — `ma-ls-surroundings` (LS.3)
- [x] 1.4 Time (daily routine) — `ma-ls-routine` (LS.4)
- [x] 1.5 Fun and Enjoyment (making plans) — `ma-ls-plans` (LS.5)
- [x] 1.6 Foods and Drinks (eating out) — `ma-ls-eating-out` (LS.6)
- [x] 1.7 My Body (at the doctor's) — `ma-ls-health` (LS.7)
- [x] 1.8 Weather and Environment — `ma-ls-environment` (LS.8)
- [x] 1.9 Getting Around (directions) — `ma-ls-directions` (LS.9)

### 2.0 Reading (strand id `ma-reading`)
- [x] 2.1 Greetings and Introduction — `ma-r-greetings` (R.1)
- [x] 2.2 Family — `ma-r-family` (R.2)
- [x] 2.3 My Surroundings — `ma-r-surroundings` (R.3)
- [x] 2.4 Time — `ma-r-routine` (R.4)
- [x] 2.5 Fun and Enjoyment — `ma-r-plans` (R.5)
- [x] 2.6 Foods and Drinks — `ma-r-eating-out` (R.6)
- [x] 2.7 My Body — `ma-r-health` (R.7)
- [x] 2.8 Weather and Environment — `ma-r-environment` (R.8)
- [x] 2.9 Getting Around — `ma-r-directions` (R.9)

### 3.0 Writing (strand id `ma-writing`)
- [x] 3.1 Greetings and Introduction — `ma-w-greetings` (W.1)
- [x] 3.2 Family — `ma-w-family` (W.2)
- [x] 3.3 My Surroundings — `ma-w-surroundings` (W.3)
- [x] 3.4 Time — `ma-w-routine` (W.4)
- [x] 3.5 Fun and Enjoyment — `ma-w-plans` (W.5)
- [x] 3.6 Foods and Drinks — `ma-w-eating-out` (W.6)
- [x] 3.7 My Body — `ma-w-health` (W.7)
- [x] 3.8 Weather and Environment — `ma-w-environment` (W.8)
- [x] 3.9 Getting Around — `ma-w-directions` (W.9)

## Dashboard registration
- `SubjectId` union in `src/lib/types.ts`: add `"mandarin"`.
- `SUBJECTS` in `src/lib/curriculum.ts`: `{ id: "mandarin", name: "Mandarin", color: "red", icon: "chat" }`.
- `COLOR_MAP` in `src/app/page.tsx`: add `red` entry (new color, not yet used by any subject).
- Icon reuses `chat` (speech bubble), same as French/German/Kiswahili.
