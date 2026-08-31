# Group 5 sourcing log — Foreign Languages (French, German, Mandarin, Arabic), Grade 8

Retrieved 2026-08-14. Sourcing method: raw `curl` of
`https://kicd.ac.ke/cbc-materials/curriculum-designs/grade-eight-designs/` to get each subject's Google Drive
file id → WebFetch on the Drive `/preview` URL to confirm the exact official filename → third-party mirror
(doyenpublishers.com / easylearn.co.ke / teacher.co.ke) to actually retrieve PDF bytes (Drive direct download
is permission-locked) → Read tool on the locally-saved PDF for verbatim text extraction (not summarized).

## French — `french.json`
- Official Drive title (confirmed): `French Grade 8 - July 2024.pdf` (Drive file id `1wLw_tfQGzPV-uu8Ept6eg8onLSoJAYyP`)
- Mirror used: `https://doyenpublishers.com/wp-content/uploads/2025/04/Grade-8-French-Curriculum-Design.pdf`
- ISBN 978-9914-43-804-8, First published 2023, Revised 2024. Read verbatim via Read tool.
- **Confidence: high**
- Structure: **same pattern as Grade 9** — 3 strands (Listening & Speaking, Reading, Writing) × the same 9
  real-world themes (Greetings and Introductions, Family, My Surrounding, Time, Fun and Enjoyment, Foods and
  Drinks, My Body, Weather and Environment, Getting Around), in the same order = 27 sub-strands. Content
  differs from Grade 9 in register/grammar focus (formal *vous*-politeness, imperative mood for travel
  instructions) even though theme labels are identical.

## German — `german.json`
- Official Drive title (confirmed): `German Grade 8 - July 2024.pdf` (Drive file id `1irJwC6GArXWf934-_xCDiaGQYJQZHv5m`)
- Mirror used: `https://doyenpublishers.com/wp-content/uploads/2025/04/Grade-8-German-Curriculum-Design.pdf`
- ISBN 978-9914-43-803-1, First published 2023, Revised 2024. Read verbatim via Read tool.
- **Confidence: high**
- Structure: identical pattern to French Grade 8 — same 9 themes, same order, 3 strands × 9 = 27 sub-strands.
  Total lesson allocation 54 + 6 showcasing lessons, matching French exactly.

## Mandarin — `mandarin.json`
- Official Drive title (confirmed): `Mandarin Grade 8 Design - July 2024 - Revised.pdf` (Drive file id `1KxyvR6lreOFJQ8LcdFuWCQteJvSUGJrI`)
- Mirror used: `https://easylearn.co.ke/images/document/11752303/Mandarin-Grade-8-Design-July-2024-Revised.pdf`
- ISBN 978-9914-43-794-2, First published 2023, Revised 2024, CS Hon. Ezekiel Ombaki Machogu (current). Read
  verbatim via Read tool.
- **Confidence: high**
- Structure: identical pattern again — same 9 themes, same order, 3 strands × 9 = 27 sub-strands. Content in
  hanzi with pinyin supplied by the curriculum itself (unlike Grade 9 Mandarin, where pinyin had to be added
  independently).

## Arabic — `arabic.json`
- Official Drive title (confirmed): `FINAL ARABIC GRADE 8 CURRICULUM DESIGN.pdf` (Drive file id
  `1NfGYxAz5-4jS_uwouuhwT40ieEgQRs98`) — notably **undated**, unlike the other three languages' Drive titles
  which all explicitly say "July 2024"/"Revised".
- Mirror used: `https://teacher.co.ke/wp-content/uploads/2024/07/GRADE-8-CURRICULUM-DESIGNS-ARABIC2024-TEACHER.CO_.KE_.pdf`
  Read verbatim via Read tool (this is the only full-text Arabic Grade 8 source located this session; an
  easylearn.co.ke URL following the same naming pattern used successfully for French/German/Mandarin
  returned 404).
- **Confidence: medium — flagged for human review.** The mirror copy's title page reads "JUNIOR SECONDARY
  SCHOOL CURRICULUM DESIGN" (not "JUNIOR SCHOOL CURRICULUM DESIGN" as used by the other three 2024-revised
  designs), says "First Published in 2022" with **no** "Revised 2024" notice, and its Foreword is signed by
  then-CS Prof. George Magoha (who left office in 2022) rather than current CS Hon. Ezekiel Machogu who
  signed the other three languages' 2024-revised Grade 8 forewords. This strongly suggests the mirror hosts
  an older/pre-rationalization draft rather than the current design actually embedded on kicd.ac.ke today.
  ISBN in this copy: 978-9914-43-809-3.
- **Structure does NOT follow the shared 9-theme × 3-strand pattern used by French/German/Mandarin at Grade
  8** (or by all four languages at Grade 9). Instead: 4 strands — 1.0 Listening & Speaking, 2.0 Reading, 3.0
  Writing (each organized around 7 shared topical themes: School Routine, Bookshop, The Kitchen/My Home,
  Eating Etiquette, Diseases, Leisure Time, Air Transport = 21 sub-strands) **plus** a standalone 4.0
  Language Structures strand of 7 grammar sub-strands (adverbs of time/place, the accusative object, modal
  auxiliary verbs, abrogative articles/*inna wa akhawatuha*, active/passive verb, definite/indefinite
  articles, plural form) with no theme attached — 28 sub-strands total.
  It is genuinely unclear whether this reflects (a) Arabic's design having a different architecture that
  was never folded into the shared-theme pattern during the 2024 rationalization, or (b) an updated
  2024-dated Arabic document exists somewhere that simply wasn't located this session. **Recommend a
  follow-up sourcing pass specifically for a dated-2024 Arabic Grade 8 PDF before building quiz skills from
  this file.**

## Cross-subject observation
Three of the four Grade 8 foreign languages (French, German, Mandarin) preserve the exact "9 shared themes ×
3 strands = 27 sub-strands" structure seen at Grade 9, with the same 9 themes in the same order — this
appears to be a stable design pattern across grades for these three languages, not something that varies
by grade level as might otherwise be expected. Arabic is the outlier both in structure (4 strands including
a separate grammar strand, different theme set) and in sourcing confidence (version/date uncertain) — this
divergence could not be resolved with the mirrors available this session.
