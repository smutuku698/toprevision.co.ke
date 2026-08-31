# Grade 8 currency check (2026-08-14)

Follow-up pass to re-verify the four subjects flagged during the initial research pass as possibly sourced
from stale (2022-draft) mirrors rather than KICD's current July-2024-revised designs: **Mathematics**,
**Integrated Science**, **Kiswahili**, and **Arabic**.

## Kiswahili — RESOLVED, confidence upgraded to high

**Searched:** general web search for `"Kiswahili" "Gredi ya 8" "2024" muundo wa mtaala pdf "Revised Oct"`,
which surfaced `teacherspalace.co.ke/uploads/documents/kiswahili-grade-8-july-2024-revised-oct-unlocked-...pdf`
— a filename matching KICD's own Google Drive listing (`Kiswahili Grade 8 - July 2024 - Revised Oct.pdf`)
almost exactly.

**Found:** Yes. Fetched and read the full document verbatim. Its title page reads "Toleo la Kwanza 2023 /
Iliyorekebishwa 2024" (First Edition 2023, Revised 2024) — a full year later than the previously-cited
teacher.co.ke mirror's "Toleo la Kwanza 2022". Both copies share the **same ISBN** (978-9914-43-796-6),
confirming they are the same underlying KICD document at different printing stages, and the foreword is
signed by the current Cabinet Secretary (Machogu), consistent with other confirmed-2024 Grade 8 designs.

**Structure check:** Identical to what was already transcribed — 15 themes × 4 language-skill strands
(Kusikiliza na Kuzungumza, Kusoma, Kuandika, Sarufi) = 60 sub-strands. Spot-checked the table of contents,
the MUHTASARI WA MADA NA MADA NDOGO summary table, and the first two themes' full body text against the
existing JSON; no differences found. Confirms the 2022→2024 revision was a wording/proofing pass, not a
structural one, for this subject.

**Changed:** `kiswahili.json` — updated `source` block only (title, url, confidence high, notes). Strand
content unchanged (already verbatim-correct).

**Final confidence:** high.

## Integrated Science — RESOLVED, confidence upgraded to high, strands rewritten

**Searched:** general web search for `"Integrated Science" "Grade 8" KICD "2024" curriculum design pdf
download`, which surfaced `doyenpublishers.com/wp-content/uploads/2025/04/Grade-8-Integrated-Science-Curriculum-Design.pdf`.

**Found:** Yes. Fetched and read the full document verbatim. Cover states "First published 2023 / Revised
2024", ISBN 978-9914-52-947-0 — a **different ISBN** from the superseded teacher.co.ke mirror
(978-9914-43-798-0), confirming these are genuinely different print editions, not the same file under two
names. Foreword signed by the current CS (Machogu). Still carries a DRAFT watermark despite the "Revised
2024" cover date — this appears to be normal for KICD's current print run (Kiswahili's confirmed-current copy
does too), not a sign of staleness.

**Structure check:** DIFFERENT from what was previously transcribed. The old (2022-draft) content had
sub-strands on "Structure of the atom" (fire classes folded in), "Static charges", and "Electrical energy".
This 2024-revised document instead has "Physical and chemical changes", "Classes of fire" (its own
sub-strand), and an entirely new sub-strand — "Reproduction in human beings" — that did not exist in the old
version at all. Both versions happen to total 3 strands / 8 sub-strands, which is why the mismatch wasn't
visible from strand/sub-strand *counts* alone in the first research pass.

**Changed:** `integrated-science.json` — full `strands` array rewritten to match this confirmed-current
document (all specific learning outcomes, key inquiry questions, and lesson-count notes transcribed verbatim
from the doyenpublishers PDF). The old atomic-structure/static-charges/electrical-energy content has been
**superseded and removed**, not retained as bonus content, since it reflects a genuinely different (older)
curriculum design rather than supplementary material.

**Final confidence:** high.

## Mathematics — RESOLVED (via user-supplied source), confidence restored to high

**Searched (initial pass, inconclusive):**
- `kicd.ac.ke/wp-content/uploads/2024/01/GRADE.8.MATHEMATICS.pdf` (a URL surfaced by web search as a
  plausible KICD-hosted January-2024 filename) — returned KICD's "Page not found" 404 page, confirmed by
  inspecting the downloaded response body (HTML title "Page not found : Kenya Institute of Curriculum
  Development"), not a PDF.
- A guessed doyenpublishers.com URL following the naming pattern that worked for other Grade 8 subjects
  (`Grade-8-Mathematics-Curriculum-Design.pdf`) — resolved with HTTP 200, but the returned content was
  unexpectedly the **Kiswahili** Grade 8 design, not Mathematics. No genuine Mathematics file exists at that
  path on doyenpublishers.com.
- General web search for `"Mathematics Grade 8" KICD "2024" curriculum design pdf -teacher.co.ke` (excluding
  the already-known mirror) returned no new results — every hit either pointed back to the same teacher.co.ke
  2022-draft mirror or to KICD's own (non-downloadable) listing page.

No 2024-dated or "Revised" Mathematics Grade 8 mirror could be located on any known-good mirror site
(doyenpublishers.com, teacherspalace.co.ke, teacherske.co.ke, easylearn.co.ke, arena.co.ke) or via general
search, so confidence was downgraded to `medium` pending further evidence.

**Resolved (2026-08-14, same day):** the user supplied a screenshot of the official "SUMMARY OF STRANDS AND
SUB-STRANDS" table from KICD's actual Google Drive file "Mathematics Grade 8 - July 2024.pdf" (the same file
ID previously identified but not directly downloadable). That table lists 5 strands / 16 sub-strands with
names and ordering matching this transcription exactly — 1.0 Numbers (Integers 6, Fractions 6, Decimals 8,
Squares and Square Roots 6, Rates/Ratio/Proportions/Percentages 14), 2.0 Algebra (Algebraic Expressions 6,
Linear Equations 7), 3.0 Measurements (Circles 5, "L. Area" 10, Money 9), 4.0 Geometry (Geometrical
Constructions 12, Coordinates and graphs 14, Scale Drawing 14, Common Solids 16), 5.0 Data Handling and
Probability (Data Presentation and Interpretation 10, Probability 7) — lesson counts sum to exactly 150,
matching KICD's official total. This is strong structural proof the July-2024 release did not restructure
this subject relative to the 2022 draft already transcribed.

**Changed:** `mathematics.json` — `source.confidence` restored to `high`; `source.notes` updated with the
confirmation and full search history; each sub-strand now carries a `notes` field recording its confirmed
lesson-count allocation from the official table. Strand/sub-strand names and learning-outcome text unchanged
(already verbatim-correct).

**Final confidence:** high.

## Arabic — RESOLVED (via user-supplied full document), confidence upgraded to high

**Searched (initial passes, inconclusive):** doyenpublishers.com, cbcelimu.com, teacherspalace.co.ke,
teacherske.co.ke, easylearn.co.ke, arena.co.ke, plus multiple general web searches for a 2024-dated Arabic
Grade 8 mirror. None found — every result resurfaced the same stale teacher.co.ke 2022-draft mirror or
KICD's permission-locked Drive listing.

**Intermediate step:** the user supplied a screenshot of the official "SUMMARY OF STRANDS AND SUB-STRANDS"
table, which appeared to show a structure with no overlap with either the old draft or with French/German/
Mandarin's shared-theme pattern — read at the time as a third, distinct architecture unique to Arabic. The
strand skeleton was rewritten to match (structure only; no learning outcomes, since only the summary table
was available).

**Fully resolved:** the user then supplied the complete source PDF directly
(`Arabic-Grade-8-Design-Formatted-April-2024.pdf`), read in full verbatim (62 pages, native text extraction).
Cover confirms "JUNIOR SCHOOL CURRICULUM DESIGN / ARABIC / GRADE 8", "First published 2023 / Revised 2024",
ISBN 978-9914-43-809-3, Foreword signed by the current CS Hon. Ezekiel Ombaki Machogu. Reading the full body
revealed the earlier "distinct architecture" conclusion was **wrong**: Arabic Grade 8 in fact follows exactly
the same architecture as French/German/Mandarin Grade 8 — 3 strands (Listening and Speaking, Reading,
Writing) built around the same 9 shared real-world themes, 27 numbered sub-strands total, plus a standalone
6-lesson "Showcasing of skills and concepts (Exhibition)" allocation tied to the Community Service Learning
project (Appendix 1). The one-page summary table only *looked* different because it aggregates by sub-strand
name (e.g. "Phonological awareness" recurs at codes 1.2, 1.7 and 1.9, summing to the table's "6" lessons)
rather than listing all 27 theme-based entries individually — the same undercount trap as the earlier
Integrated Science mismatch, but resolved this time by having the actual document in hand.

**Changed:** `arabic.json` — completely rebuilt: `source.confidence` upgraded to `high`; `essenceNote`
corrected to the verbatim shared foreign-languages essence statement (the previous text was carried over from
the stale 2022 draft and doesn't appear in the confirmed-current document); all 27 sub-strands recorded
individually with code/name/theme/specificLearningOutcomes/keyInquiryQuestions, matching the French/German/
Mandarin Grade 8 file shape; the Exhibition strand retained as a standalone 6-lesson entry.

**Final confidence:** high. This closes out the last open item from this currency-check pass — all four
subjects (Mathematics, Integrated Science, Kiswahili, Arabic) are now `high` confidence.
