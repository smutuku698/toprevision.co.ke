# Build plan: HRE + IRE as new subjects (2026-08-13)

Rule restated (see `[[feedback_bonus_strand_pattern]]` / `curriculum-reference/README.md`): every quizzable
sub-strand in the reference JSON gets its own dedicated skill — never merge two sub-strands into one skill file,
never skip a sub-strand without explicitly documenting why. Reference JSONs:
`curriculum-reference/grade-9/religious-education-hre.json`, `religious-education-ire.json`.

Context: CRE was renamed from the old combined `religious-education` subject id to `cre` (subject id `cre`,
strand ids `cre-*`) and rebuilt with 16 skills, one per real sub-strand (already done and verified this session).
HRE and IRE are brand-new subjects — not previously in `curriculum.ts` at all.

## HRE (subject id `hre`) — 6 strands, 1 sub-strand each = 6 skills

- [x] `hre-p-enlightened-beings` — Manifestation of Paramatma → Enlightened Beings (Tridev, Tirthankars/Ahimsa, Buddha, Guru's Khalsa Panth)
- [x] `hre-s-sikh-scriptures` — Scriptures → Sikh Scriptures (Sri Sukhmani Sahib, Ashtpadi 17-24)
- [x] `hre-d-principles-of-dharma` — Principles of Dharma → Sikh Principles of Dharma (Daya/Santokh/Sat/Nimrata/Pyaar/Naam Japnaa/Kirat Karni/Vand ke Chhakna)
- [x] `hre-r-rituals-and-protocols` — Religious Practises → Rituals and Protocols (Akhand Ramayan Path, Kalpa Sutra Recitation, Akhand path of SGGS, Katha)
- [x] `hre-y-gyan-yog` — Yog → Gyan/Jnan Yog (hearing/thinking/meditation; practitioners Nachiketa/Gautam Swami/Webu Sayadaw/Bhai Gurdas Ji)
- [x] `hre-sk-sikh-sanskaars` — Sanskaars → Sikh Sanskaars (naam karan, dastar bandhan, amrit shakna, anand karaj, antim sanskaar)

## IRE (subject id `ire`) — 7 strands, 20 sub-strands = 20 skills

- [x] `ire-q-ulum-alquran` — Qur'an 1.1 Ulum al-Qur'an (miraculous nature, language, styles)
- [x] `ire-q-surah-hujurat` — Qur'an 1.2 Surah Al-Hujurat (Q49)
- [x] `ire-h-ulum-alhadith` — Hadith 2.1 Ulum al-Hadith (books, classification, compilation)
- [x] `ire-h-selected-hadith` — Hadith 2.2 Selected Hadith (unity, avoidance of ill motives)
- [x] `ire-pi-last-day` — Pillars of Iman 3.1 Belief in the Last Day
- [x] `ire-pi-qadar` — Pillars of Iman 3.2 Belief in Qadar
- [x] `ire-da-shariah` — Devotional Acts 4.1 Shariah (Maqasid al-Shariah)
- [x] `ire-da-tawbah` — Devotional Acts 4.2 Tawbah (Repentance)
- [x] `ire-ak-virtues` — Akhlaq 5.1 Virtues in Islam (modesty, contentment, trustworthiness)
- [x] `ire-ak-morality` — Akhlaq 5.2 Significance of Islamic Morality
- [x] `ire-ak-prohibitions` — Akhlaq 5.3 Prohibitions in Islam (Zina)
- [x] `ire-mu-domestic-violence` — Muamalat 6.1 Domestic violence
- [x] `ire-mu-iddah` — Muamalat 6.2 Iddah
- [x] `ire-mu-child-custody` — Muamalat 6.3 Child custody
- [x] `ire-mu-polygamy` — Muamalat 6.4 Polygamy in Islam
- [x] `ire-mu-trade-finance` — Muamalat 6.5 Trade and Finance in Islam
- [x] `ire-mu-contemporary-issues` — Muamalat 6.6 Contemporary Issues (Jihad, terrorism, extremism)
- [x] `ire-ih-islam-in-kenya` — Islamic Heritage 7.1 Islam in Kenya
- [x] `ire-ih-unity-of-muslims` — Islamic Heritage 7.2 Unity of Muslims
- [x] `ire-ih-muslim-institutions` — Islamic Heritage 7.3 Muslim Institutions

**Status: all 26 skills built (2026-08-13), passed 500-generation fuzz test, clean `tsc --noEmit`, clean
`npm run lint`, and browser-verified via Playwright (dashboard, both subject pages, and 6 sample sessions across
multiple-choice / click-match / categorize (2-bucket, 3-bucket, and 5-bucket) / ordering) — zero console errors.**

## Sensitive-content note

Muamalat sub-strands 6.1 (domestic violence), 6.4 (polygamy), Akhlaq 5.3 (Zina), and Muamalat 6.6
(terrorism/extremism) are official, mandated Grade 9 IRE content — built as the curriculum design itself frames
them (Islamic teaching/rules on the topic: causes, effects, Islamic measures to curb harm), never editorialized,
softened, or replaced with unrelated content.
