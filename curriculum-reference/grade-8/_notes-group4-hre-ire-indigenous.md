# Sourcing log — Group 4 (HRE, IRE, Indigenous Language) — Grade 8

All three subjects sourced from KICD's official index page
(`https://kicd.ac.ke/cbc-materials/curriculum-designs/grade-eight-designs/`) → Google Drive `/preview`
filenames (confirmed authentic) → same file mirrored on `easylearn.co.ke` (used for actual text
extraction, since KICD's Drive files are permission-locked/view-only). All three PDFs were fetched via
WebFetch (which reported "unable to extract text" but saved the file locally each time), then the local
PDF path was read directly with the Read tool, which parses PDF text natively and gave full verbatim
text for every page. **Confidence: high** for all three subjects.

## 1. HRE (Hindu Religious Education)

- Official filename (confirmed via KICD Drive `/preview`, file id `17tep-A_DwMx7ZHQ_JTtCm6wH6HLISdIW`):
  `HRE Grade 8 - July 2024 - Fin.pdf`
- Mirror used: `https://easylearn.co.ke/images/document/11752319/HRE-Grade-8-July-2024-Fin.pdf`
- ISBN 978-9914-43-800-0, First Published 2023, Revised 2024.
- Saved as: `religious-education-hre.json`, `subjectId: "hre"`
- **Structure: 6 strands, 9 sub-strands total.**
- **Notable finding vs. Grade 9:** At Grade 9, the entire HRE design detailed only Sikh-specific content
  despite the subject's stated coverage of four faith traditions (Sanatan/Vedic, Jain, Buddhist, Sikh).
  At **Grade 8, the four-faith rotation happens at a finer grain — within each strand** rather than one
  faith per whole grade. E.g. Strand 1 "Enlightened Beings" covers one figure from each of the four
  traditions in a single sub-strand (Chaitanya Mahaprabhu / Tirthankar Mallinath / Lord Buddha / Sri Guru
  Tegh Bahadur Ji); Strand 3 "Principles of Dharma" splits into a mixed Sanatan/Jain/Sikh sub-strand and a
  separate Buddhist-only sub-strand; Strand 4 "Religious Practices" splits into Sanatan Dharma protocols
  and Jain Dharma protocols; Strand 6 "Sanskaars" splits into Jain ceremonies and Buddhist Sanskaars. This
  is a genuine structural difference worth flagging for the build phase — Grade 8 HRE is more
  multi-faith-integrated per strand than Grade 9 was.
- No sensitive-content caveats for this subject at this grade.

## 2. IRE (Islamic Religious Education)

- Official filename (confirmed via KICD Drive `/preview`, file id `10HXITblf3E9bwYFABlcbv_qA9ZGSSod1`):
  `Islamic Religious Education Grade 8 - July 2024.pdf`
- Mirror used: `https://easylearn.co.ke/images/document/11752310/Islamic-Religious-Education-Grade-8-July-2024.pdf`
- ISBN 978-9914-43-797-3, First Published 2023, Revised 2024.
- Saved as: `religious-education-ire.json`, `subjectId: "ire"`
- **Structure: 7 strands, 17 sub-strands total** (Qur'an: 3, Hadith: 2, Pillars of Iman: 2, Devotional
  Acts: 2, Akhlaq: 3, Muamalat: 4, Islamic Heritage and Civilisation: 1). This is a larger sub-strand
  count than Grade 9's 7 strands / 20 sub-strands but the strand set itself is the same 7 names.
- **Sensitive content, recorded verbatim per project policy:** Strand 5.0 "Akhlaq" (Moral Teachings),
  sub-strand 5.3 "Prohibitions in Islam" explicitly covers **deviant sexual behaviour: incest, bestiality,
  prostitution, and homosexuality** — their causes, effects on society, and the Islamic rationale for
  prohibition. This is officially mandated Grade 8 content and was recorded exactly as the curriculum
  frames it (not softened, reframed, or omitted), consistent with how Grade 9's IRE domestic-violence/
  polygamy/Jihad content was handled.
- **Notable structural difference vs. Grade 9:** the sensitive content sits in **Akhlaq** at Grade 8,
  not in Muamalat as it did at Grade 9. Grade 8's Muamalat strand (Divorce, Types of Divorce, Trade and
  Finance, Human Rights) is comparatively mild by comparison — there is **no Jihad/terrorism/extremism
  sub-strand at Grade 8** (that content appeared under Grade 9's Muamalat "Contemporary Issues"
  sub-strand instead). Flagging this for the build phase since it changes which strand needs careful,
  sensitive-but-accurate handling.

## 3. Indigenous Language

- Official filename (confirmed via KICD Drive `/preview`, file id `1WEG5wJplprPae9blpB9oVyI1UaVrq-xj`):
  `Indigenous Languages Grade 8 Design - Revised.pdf`
- Mirror used: `https://easylearn.co.ke/images/document/11752316/Indigenous-Languages-Grade-8-Design-Revised.pdf`
- ISBN 978-9914-43-936-6, First Published 2023, Revised 2024.
- Saved as: `indigenous-language.json`, `subjectId: "indigenous-language"`
- **Structure: 9 real-world themes, each with exactly 3 sub-strands (Listening & Speaking / Reading /
  Writing) = 27 sub-strands total.** Themes: Gender Roles, ICT/Netiquette, Wildlife, Safety at School,
  Common Community Values (Unity, Respect and Hard Work), Indigenous Trade, Sports and Games, Indigenous
  Music, Inter-Ethnic Cohesion (One Kenya, One Nation).
- **Ambiguous structural point, resolved and flagged:** the document's own front-matter "Summary of
  Strands and Sub Strands" table presents a *different* organisational view — three generic strands
  (Listening and Speaking / Reading / Writing, each with generic sub-strand categories like "Reading
  comprehension", "Extensive reading", "Intensive reading") plus a separate 6-lesson "Showcasing Concepts
  and Skills" line, totalling 60 lessons. But the actual body of the document (where all the real content,
  SLOs, and KIQs live) is organised by the 9 themes, each containing one instance of the three skill
  areas. I used the **theme-based structure** as `strand` in the JSON (matching what a future skill-build
  phase actually needs — one skill per theme × skill-area combination), since that is where all
  distinct, buildable content resides; the summary table's generic 3-strand view is noted in the JSON's
  `source.notes` for transparency but not used as the top-level JSON structure. This mirrors what the
  task background described as the confirmed Grade 9 pattern (9 themes, generic-English-medium content
  applied across themes, no single prescribed mother tongue) — confirmed to hold at Grade 8 too, with all
  9 themes carrying genuinely distinct content.
- No sensitive-content caveats for this subject.

## Summary table

| Subject | Strands | Sub-strands | Confidence | Notable flags |
|---|---|---|---|---|
| HRE | 6 | 9 | high | Four-faith rotation is within-strand at G8 (vs. whole-grade-Sikh at G9) |
| IRE | 7 | 17 | high | Sensitive content (deviant sexual behaviour) sits in Akhlaq, not Muamalat; no Jihad/terrorism sub-strand at G8 |
| Indigenous Language | 9 (themes) | 27 | high | Used theme-based body structure over the front-matter's generic 3-strand summary table |

No sub-strands were merged or skipped. Nothing required falling back to a lower-confidence source — all
three PDFs were read in full via the Read tool's native PDF parsing.
