# CBC Curriculum Reference DB

Ground-truth reference for the official Kenyan KICD Competency-Based Curriculum (CBC), sourced directly from
official/mirrored KICD curriculum design PDFs. This is **not** consumed by the app at runtime — it's a
standing reference the dev (and Claude) checks against before building or auditing skills, so that no
sub-strand ever gets silently merged or skipped.

Format: plain JSON files (no real database — questions/answers are never stored server-side anyway, per the
app's generative architecture, so a heavy DB is unnecessary here either).

## Layout

```
curriculum-reference/
  grade-9/
    mathematics.json
    english.json
    kiswahili.json
    integrated-science.json
    social-studies.json
    pre-technical-studies.json
    agriculture-and-nutrition.json
    creative-arts-and-sports.json
    religious-education-cre.json
    religious-education-ire.json
    religious-education-hre.json
  grade-8/
    mathematics.json
    english.json
    kiswahili.json
    integrated-science.json
    social-studies.json
    pre-technical-studies.json
    agriculture-and-nutrition.json
    creative-arts-and-sports.json
    religious-education-cre.json
    religious-education-ire.json
    religious-education-hre.json
    french.json
    german.json
    mandarin.json
    arabic.json
    indigenous-language.json
    _notes-group1-math-science-socstudies.md
    _notes-group2-eng-kis.md
    _notes-group3-pretech-creative-cre.md
    _notes-group4-hre-ire-indigenous.md
    _notes-group5-languages.md
    _notes-currency-check.md
  grade-7/   (future)
  ...
```

## Rule this reference exists to enforce

Every strand → sub-strand (and sub-sub-strand, where the official design breaks a sub-strand down further)
in the official KICD design becomes **at least one** quiz skill. Nothing gets merged into a neighboring
sub-strand and nothing gets skipped. If a sub-strand is judged unbuildable (needs audio/images we can't
generate, needs a specific assigned text, etc.), it must be explicitly recorded as declined with a reason —
never silently dropped.

**See `CURRICULUM-MINING-GUIDE.md` for the companion rule, one level deeper:** once a sub-strand is in scope,
every fact/list/example *inside* it (not just the sub-strand itself) must be mined and accounted for too —
nothing gets silently sampled down to "a representative few" when the source names more. Mandatory reading
before writing or auditing any skill.

## JSON schema

See `_schema-example.json` for an annotated example. Every subject file has this shape:

```jsonc
{
  "subject": "Mathematics",           // human-readable subject name
  "subjectId": "math",                // matches SubjectId in web/src/lib/curriculum.ts where applicable
  "grade": 9,
  "source": {
    "title": "...",                   // exact title of the PDF/document used
    "url": "...",                     // direct URL actually used to retrieve it
    "publisher": "KICD" ,             // or the mirror site name if not fetched directly from kicd.ac.ke
    "retrievedDate": "YYYY-MM-DD",
    "confidence": "high" | "medium" | "low",  // see note below
    "notes": "any caveats, e.g. mirror used because kicd.ac.ke 404'd, or ambiguity in the source"
  },
  "lessonsPerWeek": 5,   // optional — from the design's "Lesson Allocation" table (front matter). Scheme-of-work pacing input.
  "assessmentMethods": ["Written tests and quizzes", "..."],  // optional — verbatim from Appendix "Suggested Assessment Methods and Tools". Usually subject-wide, not per-sub-strand, in the source.
  "strands": [
    {
      "name": "Strand name exactly as in the source document",
      "subStrands": [
        {
          "name": "Sub-strand name exactly as in the source document",
          "lessonCount": 16,                 // optional, if the design states a lesson count — rough proxy for expected depth
          "subSubStrands": ["...", "..."],   // OMIT this key entirely if the source doesn't break it down further
          "specificLearningOutcomes": ["By the end of the sub-strand, the learner should be able to...", "..."],
          "keyInquiryQuestions": ["...", "..."],   // optional, include if present in source
          "learningResources": ["...", "..."],     // optional — verbatim from Appendix "Suggested Resources", matched to this sub-strand's row
          "learningExperiences": ["...", "..."],   // see below — REQUIRED in practice, see note
          "linkedLearningAreas": ["...", "..."],   // optional, from the "Link to other learning area" box
          "scopeNotes": ["include: ...", "exclude: ..."],  // optional, explicit inclusion/exclusion asides
          "coreCompetencies": ["Critical thinking and problem solving", "..."],  // verbatim from "Core competencies to be developed" — governs required Bloom's tier, see RIGOR-STANDARDS.md
          "assessmentSignal": "optional freeform note on anything the rubric's 'Meets expectations' row implies beyond the outcomes text",
          "notes": "optional — flag anything unusual, e.g. needs audio/images we can't generate"
        }
      ]
    }
  ]
}
```

**`learningExperiences` (added 2026-08-15 — see `CURRICULUM-MINING-GUIDE.md`):** the Suggested Learning
Experiences bullets, **transcribed verbatim, including every parenthetical list in full** (never truncated
or summarized). This is where the real enumerated content pools live in a KICD design — almost never in
`specificLearningOutcomes`, which is usually just a terse verb phrase. Marked optional in the schema for
backward compatibility with grade-8/9 files written before this field existed, but it is **effectively
required on every sub-strand entry written from now on** — omitting it was the root cause of Grade 7 SI.3
shipping with 5 of 7 SI units and 3 of 7 basic skills. See `CURRICULUM-MINING-GUIDE.md` for the full mining
checklist and the worked SI.3 example in `_schema-example.json`.

**`lessonsPerWeek` / `assessmentMethods` (added 2026-08-30 — for the scheme-of-work generator in `web/src/app/tools/scheme-of-work/`):**
these two plus the per-sub-strand `learningResources` above close the gap between this reference DB and a real
Kenyan CBC scheme of work, which needs Week/Lesson pacing (`lessonsPerWeek` × `lessonCount` gives that),
Learning Resources, and Assessment Methods as real columns alongside the strand/sub-strand/SLO/KIQ/learning-
experience data already captured. Both are sourced from the design PDF's own front-matter/appendix tables, not
inferred — see `grade-6/mathematics.json` for the worked example (`_lessonsPerWeek_source` /
`_assessmentMethods_source` notes explain exactly which table each came from). Not yet backfilled for every
subject/grade — only mine these for a subject when it's actually needed by the scheme-of-work tool.

**`confidence` field:** mark `"high"` only if the PDF was fetched directly and its strand/sub-strand
headings were read verbatim (not summarized by an intermediate model). Mark `"medium"` if a summarization
tool (e.g. WebFetch's small model) extracted the structure and it looks internally consistent but wasn't
independently cross-checked. Mark `"low"` if sourced from a secondary blog/summary rather than the design
PDF itself, or if any part was inferred/guessed. **Low-confidence entries must be flagged back to the user
before anything is built from them** — this reference exists specifically to stop pedagogically-incorrect
guessing.

## Known-good sourcing pattern (from prior sessions, updated 2026-08-13)

**The official index page IS the authoritative source of truth for exact filenames/titles**, even though it
can't be used to download the content directly:
`https://kicd.ac.ke/cbc-materials/curriculum-designs/grade-nine-designs/` embeds each subject's PDF as a
Google Drive `/preview` iframe. A plain WebFetch on the page itself won't show these (JS-rendered accordion),
but a raw `curl` of the page HTML reveals `<h3 id="categoryN">Subject</h3><iframe src="https://drive.google.com/file/d/FILE_ID/preview">`
blocks for every subject — that's the fastest way to get the file IDs. Fetching
`https://drive.google.com/file/d/FILE_ID/preview` with WebFetch then reveals the **exact official filename**
(e.g. `"Mathematics Grade 9 - July 2024 - Revised.pdf"`), which is gold for verifying a mirror copy is the
authentic document and not a look-alike.

**However, KICD's Drive files are permission-locked by the owner — view-only, download disabled** (confirmed:
every `uc?export=download`, `drive.usercontent.google.com/download`, and `uc?export=view` variant returns
Google's "Sorry, the owner hasn't given you permission to download this file" HTML page, not the PDF bytes;
this is a hard account-level block, not a bypassable large-file warning). So actual text extraction still has
to go through a third-party mirror — just now with the official title in hand to confirm you found the real
document rather than a different year's/country's version.

Mirrors that host the same official KICD PDFs verbatim have worked reliably before: `cbcelimu.com`,
`teacherspalace.co.ke`, `teacherske.co.ke`, `arena.co.ke`. When WebFetch reports "unable to extract text" but
the tool output mentions it saved the file locally, use the Read tool directly on that local path — Read
parses PDF text natively even when WebFetch's own summarizer can't.

### Confirmed official Grade 9 filenames (from KICD's own Google Drive, 2026-08-13)
- Mathematics: `Mathematics Grade 9 - July 2024 - Revised.pdf`
- English: `English Grade 9 - Revised Oct.pdf`
- Kiswahili: `Kiswahili Gredi 9 -2024 - Revised Oct.pdf`
- Integrated Science: `Integrated Science Grade 9 - July 2024.pdf`
- Social Studies: `Social Studies Grade 9 - Revised.pdf`
- Pre-Technical Studies: `Pre-Technical Studies Grade 9 - July 2024 - Revised.pdf`
- Agriculture: `Agriculture Grade9 1.8.2024 -Proofread.pdf`
- Creative Arts & Sports: `Creative Arts & Sports Grade 9 - Revised.pdf` (confirms Sports is merged into one design with Creative Arts, not separate)
- CRE: `CRE Grade 9 - Revised.pdf`
- IRE: `Islamic Religious Education Grade 9 - July 2024.pdf`
- HRE: `HRE Grade 9 - July 2024 - Fin.pdf`

## Grade 8 (sourced 2026-08-14, all 16 subjects)

All 16 Grade 8 subject files are populated. Confidence is `"high"` for 14 subjects (verbatim, cross-checked
against a confirmed-current 2024-revised source). Two subjects are `"medium"`: **Mathematics** (no accessible
2024-revised mirror could be found after a dedicated search — see `_notes-currency-check.md` — content is a
verbatim 2022-draft transcription that may or may not match the still-unconfirmed July-2024 official release)
and **Arabic** (same situation — the only full-text source found is a 2022-branded mirror; no dated-2024
Arabic mirror exists on any known-good mirror site). Both are flagged for a human spot-check if a genuinely
2024-dated copy ever surfaces.

| Subject | `subjectId` | Source | Confidence |
|---|---|---|---|
| Mathematics | `math` | teacher.co.ke mirror (2022 draft; no 2024 mirror found) | medium |
| English | `english` | doyenpublishers.com (First published 2023, Revised 2024) | high |
| Kiswahili | `kiswahili` | teacherspalace.co.ke (Toleo la Kwanza 2023, Iliyorekebishwa 2024) | high |
| Integrated Science | `science` | doyenpublishers.com (First published 2023, Revised 2024) | high |
| Social Studies | `social-studies` | teacherspalace.co.ke (Revised 2024) | high |
| Pre-Technical Studies | `pre-technical` | teacherspalace.co.ke (July 2024 - Revised) | high |
| Agriculture & Nutrition | `agriculture-nutrition` | doyenpublishers.com | high |
| Creative Arts & Sports | `creative-arts-sports` | doyenpublishers.com (First published 2023, Revised 2024, ISBN 978-9914-43-983-0) | high |
| CRE | `cre` | easylearn.co.ke (First published 2023, Revised 2024, ISBN 978-9914-43-807-9) | high |
| IRE | `ire` | easylearn.co.ke (July 2024) | high |
| HRE | `hre` | easylearn.co.ke (July 2024) | high |
| French | `french` | doyenpublishers.com (First published 2023, Revised 2024) | high |
| German | `german` | doyenpublishers.com (First published 2023, Revised 2024) | high |
| Mandarin | `mandarin` | easylearn.co.ke (July 2024 Revised) | high |
| Arabic | `arabic` | teacher.co.ke mirror (2022 draft, JSS-branded; no 2024 mirror found) | medium |
| Indigenous Language | `indigenous-language` | easylearn.co.ke (Revised) | high |

See each file's `source.notes` for full sourcing detail, and `_notes-currency-check.md` for the dedicated
follow-up pass that re-verified Mathematics, Integrated Science, Kiswahili, and Arabic against fresher
sources (two of the four — Integrated Science and Kiswahili — turned out to need correction; Mathematics and
Arabic were confirmed to have no better source currently available).
