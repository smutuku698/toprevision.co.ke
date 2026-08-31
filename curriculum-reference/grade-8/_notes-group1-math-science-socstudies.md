# Sourcing log — Mathematics, Integrated Science, Social Studies (Grade 8)

Retrieved 2026-08-14. All three PDFs were located via KICD's own Grade 8 designs index page
(`https://kicd.ac.ke/cbc-materials/curriculum-designs/grade-eight-designs/`), whose raw HTML embeds
Google Drive `/preview` iframes per subject. WebFetching each Drive preview URL confirmed the exact
official filename before searching for a mirrored copy with matching content.

## Mathematics

- Official KICD Drive filename (confirmed via `/preview` fetch, file ID `1ttNvzuQbHUnABVcP-TAoix8-TVmehYph`):
  **"Mathematics Grade 8 - July 2024.pdf"** — notably, no "Revised" suffix.
- Mirror used: `teacher.co.ke` — `GRADE-8-CURRICULUM-DESIGNS-MATHEMATICS2024-TEACHER.CO_.KE_.pdf`.
  This copy's own cover page says "First Published in 2022" and is a watermarked "DRAFT" (not the
  July-2024 revision by title). WebFetch couldn't extract text but saved the file locally; Read parsed
  the full 62-page PDF text natively and verbatim.
- Confidence: **high** (verbatim Read of actual PDF text), but flagged with a caveat in `source.notes`
  because the mirror is a 2022 draft, not confirmed identical to the July-2024 official release — no
  July-2024-titled mirror could be found via the known-good mirror list (teacherspalace.co.ke,
  cbcelimu.com, teacherske.co.ke, easylearn.co.ke, doyenpublishers.com, arena.co.ke) in the time
  available; teacher.co.ke was used as a fallback and is not in the repo's previously known-good list,
  but the content read cleanly and matches the expected KICD structure/format precisely (National
  Goals of Education boilerplate, CBC core competencies, rubric structure) seen in other confirmed
  Grade 8 designs.
- Structure: 5 strands (Numbers, Algebra, Measurements, Geometry, Data Handling and Probability),
  13 sub-strands total. No sub-strand is broken down into subSubStrands in this design (Specific
  Learning Outcomes are lettered a), b), c)... directly under each sub-strand) — this differs from
  Grade 9 Mathematics, which sometimes used explicit subSubStrands.
- Nothing flagged as ambiguous within the sub-strand content itself.

## Integrated Science

- Official KICD Drive filename (confirmed via `/preview` fetch, file ID `1RpqZRmeMywbc1Tya0_x-tNJBs75Gy0-v`):
  **"Integrated Science Grade 8 - July 2024.pdf"** — also no "Revised" suffix (consistent with Grade 9
  Integrated Science, whose confirmed official filename also lacks "Revised" per this repo's README —
  so this appears to be a subject-specific pattern, not a discrepancy worth independent concern).
- Mirror used: `teacher.co.ke` — `GRADE-8-CURRICULUM-DESIGNS-INTEGRATED-SCIENCE2024-TEACHER.CO_.KE_.pdf`.
  Same "First published 2022" DRAFT-watermarked situation as Mathematics above. WebFetch saved it
  locally; Read parsed the full PDF text natively and verbatim.
- Confidence: **high**, with the same 2022-draft-vs-July-2024-official caveat as Mathematics.
- Structure: 3 strands (Mixtures Elements and Compounds; Living Things and their Environment; Force
  and Energy), 7 sub-strands total. Uses hour-based lesson allocations (e.g. "18 Hours", "32 Hours")
  rather than lesson counts. No subSubStrands anywhere in this design.
- Nothing flagged as ambiguous within the sub-strand content itself.

## Social Studies

- Official KICD Drive filename (confirmed via `/preview` fetch, file ID `1yx30v28nVLKYSByRB9G2Omalh76-ZL6h`):
  **"Social Studies Grade 8 - Revised.pdf"**.
- Mirror used: `teacherspalace.co.ke` — same mirror site that worked reliably for Pre-Technical Studies
  and Agriculture Grade 8 in the sibling research effort. Cover page and filename match exactly:
  "SOCIAL STUDIES GRADE 8", "First published 2023, Revised 2024", ISBN 978-9914-43-789-8. WebFetch
  couldn't parse the raw PDF stream but saved it locally; Read parsed the full 69-page PDF text
  natively and verbatim.
- Confidence: **high** — this is the cleanest source of the three (matches KICD's official Drive
  filename exactly, is the actual "Revised" version, no draft-watermark ambiguity).
- Structure: 5 strands (Social Studies and Personal Management; Community Service Learning; People
  and Relationships; Natural and Historic Built Environments; Political Developments and Governance),
  15 sub-strands total. Structurally different from Grade 9 Social Studies in that Grade 8 gives
  Community Service Learning its own numbered strand (2.0) with one sub-strand, rather than treating
  CSL only as an appendix.
- Four sub-strands carry a bulleted list of named topics directly under the sub-strand heading
  (treated as `subSubStrands`, following the precedent already used for Grade 9 Mathematics in this
  repo): Early Civilisation (Asia, Europe); Weather and Climate (Desert, Semi-desert, Tropical,
  Mediterranean, Mountain); Peaceful Conflict Resolution (Negotiation, Mediation, Arbitration);
  Historical Sites and Monuments in Africa (Fort Jesus, Kilwa, Great Zimbabwe, Giza pyramids, Meroe,
  Timbuktu, Robben Island).
- Two sub-strand names have a singular/plural mismatch between the Summary-of-Strands table (p.xii)
  and the detailed section headings: "Early Civilisations" vs "Early Civilisation", and "Peaceful
  Conflict Resolutions" vs "Peaceful Conflict Resolution". The singular detailed-section wording was
  used as canonical (matching the precedent set in this repo's Pre-Technical Studies Grade 8 file).
- One apparent typo in the source PDF itself: the "Citizenship" sub-strand (numbered 5.3) appears on
  p.53 under a strand heading printed as "4.0 Political Developments and Governance" — the correct
  strand number per the Table of Contents and Summary of Strands table is 5.0. Recorded as a note in
  the JSON; the correct 5.0 grouping was used.
- Nothing here required falling back to a lower-confidence source.

## Summary

All three subjects: confidence **high** across the board — every strand/sub-strand heading, Specific
Learning Outcome, and Key Inquiry Question was transcribed verbatim from the actual PDF text via the
Read tool, not summarized by an intermediate model. The main thing worth a human's attention is that
Mathematics and Integrated Science were sourced from 2022-dated DRAFT-watermarked mirror copies (not
confirmed identical to the July-2024 official revision that KICD's Drive currently hosts), whereas
Social Studies was sourced from the exact confirmed-current "Revised" 2024 official version.
