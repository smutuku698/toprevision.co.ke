# Build Plan: French (Grade 9)

Source: `grade-9/french.json`, sourced from the real KICD Junior School Curriculum Design — French, Grade 9 (draft, first published 2024). See that file's `source` block for provenance.

## Standing rules (restated)
- One dedicated skill per sub-strand row below — never merged, never skipped without an explicit documented reason.
- Every skill should branch across 2+ `QuestionKind`s wherever content allows (see `SKILL-QUALITY-STANDARDS.md`).
- 20-question session structure, KaTeX not applicable (no math), worked explanation after every submission, custom pointer-events dragging for any drag view, fuzz-tested at 300+ generations before calling a skill done.
- Never invent facts to manufacture a second kind — re-present the same real vocabulary/content in a different interaction shape.

## Structural note
All 3 strands (Listening & Speaking, Reading, Writing) repeat the same 9 themes. Each theme's 3 skills are differentiated by modality, not duplicated:
- **LS (Listening & Speaking)** — oral vocabulary/expression recall: multiple-choice on meaning/appropriate response, click-match phrase↔meaning, categorize (e.g. formal vs informal).
- **R (Reading)** — a short original French passage/dialogue (via the `passage` field) + comprehension questions (multiple-choice and/or true/false categorize), mirroring `english/readingComprehension.ts`.
- **W (Writing)** — spelling/gap-fill (text-mode fill-blank), word-order (ordering), vocabulary-to-spelling click-match.

## Checklist (27 skills)

### 1.0 Listening and Speaking (strand id `fr-listening-speaking`)
- [x] 1.1 Greetings and Introductions — `fr-ls-greetings` (LS.1)
- [x] 1.2 Family — `fr-ls-family` (LS.2)
- [x] 1.3 The Countryside — `fr-ls-countryside` (LS.3)
- [x] 1.4 Routine — `fr-ls-routine` (LS.4)
- [x] 1.5 Making Plans and Dates — `fr-ls-plans` (LS.5)
- [x] 1.6 Eating Out — `fr-ls-eating-out` (LS.6)
- [x] 1.7 At the Doctor's — `fr-ls-health` (LS.7)
- [x] 1.8 My Environment — `fr-ls-environment` (LS.8)
- [x] 1.9 Directions and Locations — `fr-ls-directions` (LS.9)

### 2.0 Reading (strand id `fr-reading`)
- [x] 2.1 Greetings and Introductions — `fr-r-greetings` (R.1)
- [x] 2.2 Family — `fr-r-family` (R.2)
- [x] 2.3 The Countryside — `fr-r-countryside` (R.3)
- [x] 2.4 Daily Routine at Home — `fr-r-routine` (R.4)
- [x] 2.5 Making Plans and Dates — `fr-r-plans` (R.5)
- [x] 2.6 Eating Out — `fr-r-eating-out` (R.6)
- [x] 2.7 At the Doctor's — `fr-r-health` (R.7)
- [x] 2.8 My Environment — `fr-r-environment` (R.8)
- [x] 2.9 Directions and Locations — `fr-r-directions` (R.9)

### 3.0 Writing (strand id `fr-writing`)
- [x] 3.1 Greetings and Introductions — `fr-w-greetings` (W.1)
- [x] 3.2 Family — `fr-w-family` (W.2)
- [x] 3.3 The Countryside — `fr-w-countryside` (W.3)
- [x] 3.4 Routine — `fr-w-routine` (W.4)
- [x] 3.5 Making Plans and Dates — `fr-w-plans` (W.5)
- [x] 3.6 Eating Out — `fr-w-eating-out` (W.6)
- [x] 3.7 At the Doctor's — `fr-w-health` (W.7)
- [x] 3.8 My Environment — `fr-w-environment` (W.8)
- [x] 3.9 Directions and Locations — `fr-w-directions` (W.9)

## Dashboard registration
- `SubjectId` union in `src/lib/types.ts`: add `"french"`.
- `SUBJECTS` in `src/lib/curriculum.ts`: `{ id: "french", name: "French", color: "blue", icon: "chat" }`.
- `COLOR_MAP` in `src/app/page.tsx`: add `blue` entry (new color, not yet used by any subject).
- Icon reuses `chat` (speech bubble), same as Kiswahili — appropriate for a language subject, icons are not required to be unique.
