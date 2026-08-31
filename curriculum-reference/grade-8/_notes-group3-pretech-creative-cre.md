# Sourcing log — Group 3: Pre-Technical Studies, Creative Arts and Sports, CRE (Grade 8)

All three subjects were sourced using the proven pattern: raw HTML of the KICD Grade 8 designs index page
(`https://kicd.ac.ke/cbc-materials/curriculum-designs/grade-eight-designs/`) was fetched via `curl.exe` to pull the
Google Drive file IDs and confirm exact official filenames via the `/preview` pages, then a third-party mirror was
used to actually retrieve PDF bytes (Google Drive itself blocks download), and the PDF text was read verbatim with
the Read tool after WebFetch reported "unable to extract text" but saved the file locally.

## 1. Pre-Technical Studies (`pre-technical-studies.json`)
- Official filename confirmed via KICD Google Drive: `Pre-Technical Studies Grade 8 - July 2024 - Revised.pdf`
- Mirror used: `https://www.teacherspalace.co.ke/uploads/documents/pre-technical-studies-grade-8-july-2024-revised-unlocked-2025-01-05-GPTL6iQdBX.pdf`
- Confidence: **high** — full PDF read verbatim via Read tool.
- Structure: 5 strands, 13 sub-strands, no sub-sub-strands (same granularity pattern as Grade 9's version of this
  subject — the design never breaks a sub-strand down further).
- Notable: content is entirely different from Grade 9's version of this subject (different sub-strand topics
  throughout — e.g. Fire Safety/Data Safety instead of Grade 9's Safety on Raised Platforms/Handling Hazardous
  Substances). Two minor internal lesson-count inconsistencies between the summary table and body section headings
  (Fire Safety: 7 vs 6 lessons; Data Safety: 11 vs 4 lessons; Plane Geometry: 4 vs 8; Dimensioning: 7 vs 10; Visual
  Programming: 14 vs 13; Computer Software: 6 vs 12) — flagged in the relevant sub-strand `notes` fields but not
  treated as a sourcing error, since this is a documented pattern (KICD's own summary tables are sometimes out of
  sync with body content, same issue seen in Grade 9 CRE).
- Nothing needed to be declined or flagged low-confidence.

## 2. Creative Arts and Sports (`creative-arts-and-sports.json`)
- The KICD index page's short category label for this subject is just "Creative Arts" (no "and Sports" in the
  `<h3>` text), which could look like Sports was dropped at Grade 8. Checking the Google Drive `/preview` page for
  that file ID confirmed the actual document title is **"Creative Arts & Sports Grade 8 - Revised.pdf"** — Sports
  is still merged into one design with Creative Arts at Grade 8, exactly as at Grade 9. The index page's short
  label is just a category-menu abbreviation, not a subject-content signal.
- Mirror used: `https://doyenpublishers.com/wp-content/uploads/2025/04/Grade-8-Creative-Arts-and-Sports-Curriculum-Design.pdf`
- Confidence: **high** — full PDF read verbatim via Read tool.
- Structure: 3 strands, 14 regular sub-strands + 1 optional pair (Swimming vs Kenyan Indigenous Games — the
  design instructs "Do One"), for 16 total sub-strand entries recorded (matching the same optional-pair pattern
  used in Grade 9's version of this subject).
- Notable structural quirk: strand 2's sub-strand "2.3" is labelled "Athletics and Montage" in the summary table
  but "Middle Distance Races and Montage" in the detailed body table heading — resolved by using the fuller body
  heading as canonical (same resolution approach as a similar Grade 9 CRE/CAS numbering inconsistency).
- Content (sports and crafts covered) is completely different from Grade 9's version of this subject — Grade 8
  covers Middle Distance Races/Netball/Volleyball/Fabric Decoration/Basketry/Tagging, vs Grade 9's Triple
  Jump/Rugby/Basketball/Pottery/Weaving/Photography/Board Games. This is not a re-run of Grade 9 content and each
  Grade 8 sub-strand needs independent skill-building.
- Same practical/performance-heavy caveat as Grade 9 applies: most sub-strands mix a knowledge-testable component
  (describing/classifying/identifying) with a physical-performance or artistic-execution component this app
  cannot grade directly — flagged per sub-strand in `notes`, gap-analysis left to the build phase.
- Nothing needed to be declined or flagged low-confidence.

## 3. CRE (`religious-education-cre.json`)
- Official filename confirmed via KICD Google Drive: `CRE Grade 8 - Revised.pdf`
- Mirror used: `https://easylearn.co.ke/images/document/11752335/CRE-Grade-8-Revised.pdf` (found via WebFetch on
  easylearn.co.ke's curriculum-design listing page, since a direct site-search didn't surface it — needed one
  extra WebFetch of the listing page itself to find the exact document path).
- Confidence: **high** — full PDF read verbatim via Read tool.
- Structure: 6 strands, 18 sub-strands, no sub-sub-strands.
- Notable structural quirk: the strand the document's own Table of Contents and body tables consistently call
  "STRAND 3.0 MIRACLES OF JESUS CHRIST" is instead labelled "3.0 The Life and Ministry of Jesus" (with an
  unnumbered "Selected Miracles of Jesus Christ" sub-header) in the SUMMARY OF STRANDS AND SUB-STRANDS table —
  resolved by using "Miracles of Jesus Christ" (the consistent body/TOC heading) as canonical.
- Strand set and every sub-strand's Bible narrative is completely different from Grade 9 CRE (which covered
  Creation/Work, Bible/Judge Deborah/Kings David and Solomon, Jesus' Life and Ministry as one combined strand,
  The Church, Christian Living Today) — Grade 8 has its own distinct strand breakdown (Creation, The Bible,
  Miracles of Jesus Christ, Teachings of Jesus Christ as a separate strand, The Church, Christian Living Today).
  Confirms Grade 8 is not a re-run of Grade 9 content.
- Two sub-strands cover sensitive topics that will need careful handling in a future build phase: 6.2 Human
  Sexuality (Responsible Sexual Behaviour) covers sexual abuse and teenage pregnancy; 6.3 Sacredness of Life
  covers suicide and abortion causes/consequences. Flagged in the relevant sub-strand `notes` fields — not
  declined, per instructions, but worth human review before building quiz content from them.
- Nothing needed to be declined or flagged low-confidence.

## Cross-subject observation
For all three subjects, Grade 8 content is entirely distinct from the corresponding Grade 9 design already in the
reference DB — no strand, sub-strand, or scripture/topic set is a repeat. Each subject also had at least one minor
internal-document naming/numbering inconsistency between its own summary table and body headings, which is a
recurring KICD authoring pattern already documented for Grade 9 CRE and Creative Arts and Sports.
