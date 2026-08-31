import type { Strand, Subject, SubjectId } from "./types";

// Grades with at least a picker entry. A grade need not have any skills yet —
// subject pages already render a graceful "coming soon" state for zero-skill subjects.
export const AVAILABLE_GRADES = [5, 6, 7, 8, 9, 10] as const;

// Sourced from the KICD Grade 9 CBC curriculum design breakdown.
export const SUBJECTS: Subject[] = [
  { id: "math", name: "Mathematics", color: "sky", icon: "math" },
  { id: "english", name: "English", color: "violet", icon: "book" },
  // "Integrated Science" is the correct KICD name from Grade 7 (Junior School) onward; Grade 6 (Upper Primary)
  // is officially "Science & Technology" — see curriculum-reference/grade-6/science-and-technology.json.
  // Grade 5's own "Lesson Allocation at Upper Primary" table (in this grade's Mathematics design PDF) lists
  // the exact same 8-subject Upper Primary line-up as Grade 6 (English, Kiswahili/KSL, Mathematics, Religious
  // Education, Science & Technology, Agriculture, Social Studies, Creative Arts, no Pre-Technical) — so the
  // same Grade-6 naming/visibility overrides below are extended to grade 5 too.
  { id: "science", name: "Integrated Science", namesByGrade: { 5: "Science & Technology", 6: "Science & Technology" }, color: "emerald", icon: "flask" },
  { id: "kiswahili", name: "Kiswahili / KSL", color: "amber", icon: "chat" },
  { id: "social-studies", name: "Social Studies", color: "rose", icon: "globe" },
  // Pre-Technical Studies does not exist at Grade 5/6 (Upper Primary) at all — confirmed absent from the Grade
  // 5 and Grade 6 "Lesson Allocation at Upper Primary" tables (8 subjects listed, no Pre-Technical); it is a
  // Junior School (Grade 7+) subject only. Hidden rather than shown as "coming soon".
  { id: "pre-technical", name: "Pre-Technical Studies", hiddenForGrades: [5, 6], color: "indigo", icon: "gear" },
  // Grade 5/6 (Upper Primary)'s official KICD title is "Agriculture" alone — "Agriculture & Nutrition" is
  // correct only from Grade 7 (Junior School) onward. Verified against the Grade 6 Agriculture design's own
  // cover page and Lesson Allocation table, and against Grade 5's own Mathematics-design Lesson Allocation
  // table, which lists the subject simply as "Agriculture" for both grades.
  { id: "agriculture-nutrition", name: "Agriculture & Nutrition", namesByGrade: { 5: "Agriculture", 6: "Agriculture" }, color: "lime", icon: "leaf" },
  // Same pattern — Grade 5/6's official title is "Creative Arts" alone; "Creative Arts & Sports" is correct
  // only from Grade 7 onward. Verified against the same Lesson Allocation at Upper Primary tables.
  { id: "creative-arts-sports", name: "Creative Arts & Sports", namesByGrade: { 5: "Creative Arts", 6: "Creative Arts" }, color: "fuchsia", icon: "palette" },
  { id: "cre", name: "CRE", color: "orange", icon: "heart" },
  { id: "hre", name: "HRE", color: "purple", icon: "heart" },
  { id: "ire", name: "IRE", color: "teal", icon: "heart" },
  { id: "french", name: "French", color: "blue", icon: "chat" },
  { id: "german", name: "German", color: "cyan", icon: "chat" },
  { id: "mandarin", name: "Mandarin", color: "red", icon: "chat" },
  { id: "indigenous-language", name: "Indigenous Language", color: "yellow", icon: "chat" },
  { id: "arabic", name: "Arabic", color: "green", icon: "chat" },
  // Music and Dance — Senior School (Grade 10+) elective under the Arts & Sports Science track, per the KICD
  // Grade 10 Senior School Curriculum Design (2025 draft). Does not exist below Grade 10 (Senior School only) —
  // hidden for Grades 5-9 rather than shown as "coming soon", since it will never have content there.
  { id: "music-and-dance", name: "Music and Dance", hiddenForGrades: [5, 6, 7, 8, 9], color: "pink", icon: "music" },
];

export const STRANDS: Strand[] = [
  // Mathematics
  { id: "math-numbers", subjectId: "math", grade: 9, name: "Numbers", description: "Integers, cubes & cube roots, indices & logarithms, compound proportion, rates of work." },
  { id: "math-algebra", subjectId: "math", grade: 9, name: "Algebra", description: "Linear inequalities, equations of straight lines, matrices, algebraic expansion." },
  { id: "math-measurement", subjectId: "math", grade: 9, name: "Measurement & Geometry", description: "Area/volume of complex shapes, angles, Pythagorean theorem." },
  { id: "math-data", subjectId: "math", grade: 9, name: "Data Handling & Probability", description: "Mean, median, mode, range, simple probability." },

  // Mathematics — Grade 5 (per the KICD Grade 5 Primary Mathematics curriculum design, revised 2024) — 4
  // strands / 19 sub-strands. A notch simpler than Grade 6: whole numbers stop at hundreds of thousands (no
  // squares/roots), fractions cap at denominators not exceeding 12 with only same-denominator/one-renaming
  // add-subtract, decimals stop at thousandths with no percentage conversions. Introduces Volume and Simple
  // Equations as brand-new sub-strands, and protractor-based degree measurement, none of which exist at
  // Grade 6. See curriculum-reference/grade-5/mathematics.json for the full mining record.
  { id: "g5-math-numbers", subjectId: "math", grade: 5, name: "Numbers", description: "Whole numbers to hundreds of thousands, addition, subtraction, multiplication, division, fractions, decimals, and simple equations." },
  { id: "g5-math-measurement", subjectId: "math", grade: 5, name: "Measurement", description: "Length (km/m), area (cm²), volume (cm³), capacity (l/ml), mass (kg/g), time (seconds), and money (budgets, tax, bank services)." },
  { id: "g5-math-geometry", subjectId: "math", grade: 5, name: "Geometry", description: "Horizontal/vertical/perpendicular/parallel lines, protractor-based angle measurement, and 3-D objects." },
  { id: "g5-math-data", subjectId: "math", grade: 5, name: "Data Handling", description: "Collecting data, tally marks, frequency tables, and interpreting data." },

  // Mathematics — Grade 6 (per the KICD Grade 6 Primary Mathematics curriculum design, revised 2024)
  { id: "g6-math-numbers", subjectId: "math", grade: 6, name: "Numbers", description: "Whole numbers to millions, multiplication, division, fractions, decimals, and simple inequalities." },
  { id: "g6-math-measurement", subjectId: "math", grade: 6, name: "Measurement", description: "Length (mm/cm), area, capacity, mass (kg/tonne), time (a.m./p.m., 12h/24h), and money (budgets, profit and loss, taxes)." },
  { id: "g6-math-geometry", subjectId: "math", grade: 6, name: "Geometry", description: "Lines (parallel, perpendicular, bisecting), angles (straight line, point, triangles), and 3-D objects." },
  { id: "g6-math-data", subjectId: "math", grade: 6, name: "Data Handling", description: "Frequency tables, pictographs, piling, and bar graphs." },

  // Mathematics — Grade 7 (per the KICD Grade 7 Junior School Mathematics curriculum design, revised 2024)
  { id: "g7-math-numbers", subjectId: "math", grade: 7, name: "Numbers", description: "Whole numbers, factors (divisibility, GCD/LCM), fractions, decimals, squares and square roots." },
  { id: "g7-math-algebra", subjectId: "math", grade: 7, name: "Algebra", description: "Algebraic expressions, linear equations in one unknown, linear inequalities." },
  { id: "g7-math-measurements", subjectId: "math", grade: 7, name: "Measurements", description: "Pythagorean relationship, length, area, volume and capacity, time/distance/speed, temperature, money." },
  { id: "g7-math-geometry", subjectId: "math", grade: 7, name: "Geometry", description: "Angles (straight line, point, transversal, polygons up to hexagon), geometrical constructions." },
  { id: "g7-math-data", subjectId: "math", grade: 7, name: "Data Handling and Probability", description: "Frequency tables, pictographs, bar graphs, pie charts, line graphs, travel graphs." },

  // Mathematics — Grade 8 (per the KICD Grade 8 Mathematics curriculum design, July 2024)
  { id: "g8-math-numbers", subjectId: "math", grade: 8, name: "Numbers", description: "Integers, fractions, decimals, squares and square roots, rates/ratio/proportions/percentages." },
  { id: "g8-math-algebra", subjectId: "math", grade: 8, name: "Algebra", description: "Algebraic expressions, linear equations in two unknowns." },
  { id: "g8-math-measurements", subjectId: "math", grade: 8, name: "Measurements", description: "Circles (circumference, arcs, sectors), area (including surface area), money (interest, hire purchase)." },
  { id: "g8-math-geometry", subjectId: "math", grade: 8, name: "Geometry", description: "Geometrical constructions, coordinates and graphs, scale drawing, common solids." },
  { id: "g8-math-data-probability", subjectId: "math", grade: 8, name: "Data Handling and Probability", description: "Data presentation and interpretation, probability." },

  // Music and Dance — Grade 10 (per the KICD Senior School Curriculum Design, Music and Dance, 2025 draft)
  // 3 strands / 15 sub-strands. See curriculum-reference/grade-10/music-and-dance.json for the full mining record.
  { id: "g10-mad-foundations", subjectId: "music-and-dance", grade: 10, name: "Foundations of Music and Dance", description: "Rhythm (semiquavers, triplets), melody in major keys, transposition, setting Kiswahili text to music, two-part harmony, music notation software, and dance production." },
  { id: "g10-mad-performing", subjectId: "music-and-dance", grade: 10, name: "Performing", description: "Kenyan folk songs, Western style solo songs, Kenyan indigenous musical instruments, Western musical instruments, and contemporary dance from Kenya." },
  { id: "g10-mad-appreciation", subjectId: "music-and-dance", grade: 10, name: "Critical Appreciation", description: "Kenyan folk songs, Classical (Medieval and Renaissance) music, and Music and Dance in socio-cultural context." },

  // English
  { id: "eng-listening-speaking", subjectId: "english", grade: 9, name: "Listening & Speaking", description: "Debate rules, active listening, public speaking." },
  { id: "eng-reading", subjectId: "english", grade: 9, name: "Reading", description: "Functional texts, comprehension, structural analysis." },
  { id: "eng-writing", subjectId: "english", grade: 9, name: "Writing", description: "Compositions, letters, resumes, formal emails." },
  { id: "eng-grammar", subjectId: "english", grade: 9, name: "Grammar in Use", description: "Tenses, active/passive voice, direct/indirect speech, phrasal verbs." },

  // English — Grade 8 (per the KICD Grade 8 English curriculum design, Revised 2024) — 4 strands / 75 sub-strands total, built in rounds
  { id: "g8-eng-listening-speaking", subjectId: "english", grade: 8, name: "Listening & Speaking", description: "Telephone etiquette, oral presentations, listening comprehension, pronunciation, conversational skills, oral narratives and reports." },
  { id: "g8-eng-grammar", subjectId: "english", grade: 8, name: "Grammar in Use", description: "Word classes (nouns, adjectives, adverbs, pronouns, prepositions, conjunctions), tense, phrasal verbs, sentence types, active/passive voice." },
  { id: "g8-eng-reading", subjectId: "english", grade: 8, name: "Reading", description: "Extensive and intensive reading, class-reader short stories, poetry, comprehension strategies, study skills, visual literacy." },
  { id: "g8-eng-writing", subjectId: "english", grade: 8, name: "Writing", description: "Handwriting, punctuation and spelling mechanics, paragraphing, functional letters and notes, narrative and descriptive composition, dialogue, journals." },

  // English — Grade 7 (per the KICD Grade 7 English curriculum design, Revised 2024) — 4 strands / 75 sub-strands across 15 CBC unit themes
  { id: "g7-eng-listening-speaking", subjectId: "english", grade: 7, name: "Listening & Speaking", description: "Polite language, oral narrative and speech performance, listening strategies, pronunciation and word stress, interviews, oral reports." },
  { id: "g7-eng-reading", subjectId: "english", grade: 7, name: "Reading", description: "Independent and class-reader reading, study skills, comprehension strategies, oral literature (trickster/monster/dilemma narratives, poetry), reading fluency." },
  { id: "g7-eng-grammar", subjectId: "english", grade: 7, name: "Grammar in Use", description: "Nouns, verbs and tense, adjectives and adverbs, pronouns, prepositions, conjunctions, determiners, phrasal verbs, sentence types, subject-verb agreement." },
  { id: "g7-eng-writing", subjectId: "english", grade: 7, name: "Writing", description: "Handwriting and punctuation, paragraphing, friendly letters, spelling, the writing process and dialogue, narrative and descriptive composition, functional writing." },

  // English — Grade 6 (per the KICD Grade 6 English Language curriculum design, Revised 2024) — 4 strands built
  // around 13 real-world themes (Child Labour, Cultural & Religious Celebrations, Etiquette, Emergency Rescue
  // Services, Tourist Attractions, Work Ethics, Scientific Innovations, Animal Safety, Lifestyle Diseases,
  // Leisure Time, Indoor Games, Environment Conservation, Money & Trade). See curriculum-reference/grade-6/english.json.
  { id: "g6-eng-listening-speaking", subjectId: "english", grade: 6, name: "Listening and Speaking", description: "Pronunciation of target sounds, theme vocabulary, polite/interactive listening, similes, proverbs, idioms and phrasal verbs across all 13 themes." },
  { id: "g6-eng-reading", subjectId: "english", grade: 6, name: "Reading", description: "Extensive reading, intensive reading comprehension, reading from visuals, dialogue reading, fluency, and stress/rhythm in poems and songs." },
  { id: "g6-eng-grammar", subjectId: "english", grade: 6, name: "Language Use", description: "Determiners, nouns, correlative conjunctions, pronouns, adjectives, phrasal quantifiers, future continuous tense, active/passive voice, adverbs, conjunctions, interrogatives, question tags, prepositions." },
  { id: "g6-eng-writing", subjectId: "english", grade: 6, name: "Writing", description: "Guided form-filling, narrative/pictorial/descriptive compositions, formal letters, personal journals, and writing mechanics (acronyms, punctuation, hyphen, synonyms/antonyms, affixes)." },

  // English — Grade 5 (per the KICD Grade 5 English Language curriculum design, First Published 2017, Revised 2024) —
  // 4 strands built around 13 real-world themes (Child Rights and Responsibilities, National Celebrations,
  // Etiquette-Table Manners, Road Accidents - Prevention, Traditional Foods, Jobs and Occupations, Learning Through
  // Technology, The Farm - Cash Crops, Communicable Diseases, Leisure Time Activities, Sports - Appreciating Talents,
  // Environmental Pollution, Money - Savings and Banking). Each theme carries exactly one Listening & Speaking /
  // Reading / Grammar in Use / Writing sub-strand = 52 sub-strands, 150 lessons. See curriculum-reference/grade-5/english.json.
  { id: "g5-eng-listening-speaking", subjectId: "english", grade: 5, name: "Listening and Speaking", description: "Target-sound pronunciation, word stress and intonation, theme vocabulary, polite and interactive listening, proverbs, sayings and similes, and speaking fluency across all 13 themes." },
  { id: "g5-eng-reading", subjectId: "english", grade: 5, name: "Reading", description: "Extensive reading and reference materials, intensive reading comprehension (narrative, poem, dialogue, visuals, descriptive and factual texts), comprehension strategies, and reading fluency." },
  { id: "g5-eng-grammar", subjectId: "english", grade: 5, name: "Language Use", description: "Demonstrative determiners, collective nouns and reflexive pronouns, 'too...to/for' and 'must/should + adverb' patterns, possessive pronouns, adjectives (comparatives/superlatives, order), quantifiers, future tense (will/shall), double imperatives and question tags, adverbs and modals, conjunctions, interrogatives, singular/plural-only nouns, and prepositions of time/place/direction." },
  { id: "g5-eng-writing", subjectId: "english", grade: 5, name: "Writing", description: "Filling forms, friendly letters, diaries and journals (functional); open-ended, narrative, pictorial and descriptive compositions (creative); and mechanics — cursive handwriting, commas and quotation marks, apostrophe and exclamation mark, and spelling (homophones, homonyms, double consonants and vowels)." },

  // Integrated Science (per the KICD Grade 9 Integrated Science curriculum design, First published 2024)
  { id: "sci-mec", subjectId: "science", grade: 9, name: "Mixtures, Elements, and Compounds", description: "Structure of the atom, metals & alloys, water hardness." },
  { id: "sci-lte", subjectId: "science", grade: 9, name: "Living Things and their Environment", description: "Nutrition in plants and animals, reproduction in plants, interdependence of life." },
  { id: "sci-fe", subjectId: "science", grade: 9, name: "Force and Energy", description: "Curved mirrors, waves and remote sensing." },
  { id: "sci-extra-practice", subjectId: "science", grade: 9, name: "Extra Practice", description: "Bonus skills from an earlier curriculum pass — not part of the official Grade 9 Integrated Science design, kept as additional mastery practice.", isBonus: true },

  // Integrated Science — Grade 7 (per the KICD Grade 7 Integrated Science curriculum design, Revised 2024)
  { id: "g7-sci-si", subjectId: "science", grade: 7, name: "Scientific Investigation", description: "Introduction to Integrated Science, laboratory safety and hazard symbols, laboratory apparatus/instruments and SI units." },
  { id: "g7-sci-mec", subjectId: "science", grade: 7, name: "Mixtures, Elements and Compounds", description: "Separating homogeneous mixtures, acids, bases and indicators." },
  { id: "g7-sci-lte", subjectId: "science", grade: 7, name: "Living Things and their Environment", description: "The human reproductive system and adolescence, the human excretory system (skin and kidneys)." },
  { id: "g7-sci-fe", subjectId: "science", grade: 7, name: "Force and Energy", description: "Electrical energy and simple circuits, magnetism." },

  // Science & Technology — Grade 5 (per the KICD Grade 5 Science & Technology curriculum design, Revised 2024).
  // Same 3-strand / 8-sub-strand / 120-lesson shape as Grade 6. See curriculum-reference/grade-5/science-and-technology.json.
  { id: "g5-sci-lte", subjectId: "science", grade: 5, name: "Living Things and their Environment", description: "Classification of plants (flowering/non-flowering), vertebrates, and the human breathing system." },
  { id: "g5-sci-matter", subjectId: "science", grade: 5, name: "Matter", description: "Mixtures (homogeneous/heterogeneous) and separation methods, and water pollution and treatment." },
  { id: "g5-sci-fe", subjectId: "science", grade: 5, name: "Force and Energy", description: "Floating and sinking, sound energy, and heat transfer." },

  // Science & Technology — Grade 6 (per the KICD Grade 6 Science & Technology curriculum design, Revised 2024).
  // Grade 6 is Upper Primary — the subject is "Science & Technology" (Integrated Science starts Grade 7), and its
  // design has only 3 strands / 8 sub-strands (120 total lessons), the smallest Science design mined so far.
  { id: "g6-sci-lte", subjectId: "science", grade: 6, name: "Living Things and their Environment", description: "Fungi, invertebrates, and the human circulatory system." },
  { id: "g6-sci-matter", subjectId: "science", grade: 6, name: "Matter", description: "Change of state of matter and the composition of air." },
  { id: "g6-sci-fe", subjectId: "science", grade: 6, name: "Force and Energy", description: "Light, levers as simple machines, and slopes as simple machines." },

  // Integrated Science — Grade 8 (per the KICD Grade 8 Integrated Science curriculum design, Revised 2024)
  { id: "g8-sci-mec", subjectId: "science", grade: 8, name: "Mixtures, Elements and Compounds", description: "Elements and compounds, physical & chemical changes, classes of fire." },
  { id: "g8-sci-lte", subjectId: "science", grade: 8, name: "Living Things and their Environment", description: "The cell, movement of materials in and out of the cell, reproduction in human beings." },
  { id: "g8-sci-fe", subjectId: "science", grade: 8, name: "Force and Energy", description: "Transformation of energy, pressure in solids and liquids." },

  // Kiswahili
  { id: "kis-kusikiliza", subjectId: "kiswahili", grade: 9, name: "Kusikiliza na Kuzungumza", description: "Hotuba, mazungumzo, mijadala." },
  { id: "kis-ufahamu", subjectId: "kiswahili", grade: 9, name: "Ufahamu na Kusoma", description: "Kusoma kwa kina, uchambuzi wa habari." },
  { id: "kis-sarufi", subjectId: "kiswahili", grade: 9, name: "Sarufi", description: "Ngeli za nomino, nyakati, uakifishi." },
  { id: "kis-insha", subjectId: "kiswahili", grade: 9, name: "Insha", description: "Wasifu, barua rasmi, insha za kubuni." },

  // Kiswahili — Grade 8 (per the KICD Grade 8 Kiswahili curriculum design, Revised 2024)
  { id: "g8-ksw-kz", subjectId: "kiswahili", grade: 8, name: "Kusikiliza na Kuzungumza", description: "Mahojiano, hadithi za mighani, visasili, hurafa na hekaya, sauti /g/, /k/ na /gh/, maagizo, kufasiri, usikilizaji husishi, uzungumzaji wa papo kwa papo." },
  { id: "g8-ksw-ks", subjectId: "kiswahili", grade: 8, name: "Kusoma", description: "Ufahamu wa vifungu vya simulizi, kusoma kwa mapana, tamthilia, ufasaha, maudhui na dhamira." },
  { id: "g8-ksw-ka", subjectId: "kiswahili", grade: 8, name: "Kuandika", description: "Viakifishi (alama ya hisi, ritifaa, mtajo, mshazari), barua ya kirafiki, insha za kubuni (masimulizi, maelekezo, mdokezo, maelezo)." },

  // Kiswahili — Grade 7 (per the KICD Grade 7 Kiswahili curriculum design, Revised 2024 — 15 mada, each with Kusikiliza na Kuzungumza/Kusoma/Kuandika/Sarufi sub-strands)
  { id: "g7-ksw-kz", subjectId: "kiswahili", grade: 7, name: "Kusikiliza na Kuzungumza", description: "Mazungumzo na maamkuzi, sauti dh/th/d/nd, tanzu za fasihi, nyimbo za jamii, kusikiliza kwa kufasiri na ufahamu, kuzungumza kupasha habari, kusikiliza kwa makini." },
  { id: "g7-ksw-ks", subjectId: "kiswahili", grade: 7, name: "Kusoma", description: "Ufahamu wa vifungu vya simulizi/kushawishi/mjadala, kusoma kwa mapana na ufasaha, novela (maudhui, dhamira, mandhari, ploti, wahusika, mbinu za lugha), ufupisho." },
  { id: "g7-ksw-ka", subjectId: "kiswahili", grade: 7, name: "Kuandika", description: "Viakifishi (herufi kubwa, kikomo, mabano, kistari kifupi), barua za kirafiki na rasmi, hotuba, baruapepe, insha za kubuni (masimulizi, maelekezo, picha, maelezo)." },
  { id: "g7-ksw-sarufi", subjectId: "kiswahili", grade: 7, name: "Sarufi", description: "Aina za nomino, nyakati na hali, vitenzi (vikuu, visaidizi, vishirikishi), ngeli na upatanisho wa kisarufi, vinyume, mnyambuliko wa vitenzi, aina za sentensi, ukanushaji, ukubwa wa nomino, usemi halisi na taarifa." },

  // Kiswahili — Grade 6 (per the KICD Grade 6 Kiswahili curriculum design, Chapisho la Pili 2024 — 11 mada, each with Kusikiliza na Kuzungumza/Kusoma/Kuandika/Sarufi sub-strands)
  // Kiswahili — Grade 5 (per the KICD Grade 5 Kiswahili curriculum design, Chapisho la Pili 2024) — 11 mada
  // (Mapishi, Huduma ya Kwanza, Mapambo, Saa na Majira, Kukabiliana na Umaskini, Maadili, Elimu ya Mazingira,
  // Ndege wa Porini, Magonjwa, Kudhibiti Itikadi za Kidini na za Kijamii, Uwekezaji), each with Kusikiliza na
  // Kuzungumza/Kusoma/Kuandika/Sarufi sub-strands — 44 mada ndogo, 120 vipindi. See
  // curriculum-reference/grade-5/kiswahili.json.
  { id: "g5-ksw-kz", subjectId: "kiswahili", grade: 5, name: "Kusikiliza na Kuzungumza", description: "Matamshi bora (f/v, s/z, l/r, th/dh), maamkuzi na maagano, vitendawili, maneno ya udugu, methali, ushairi, nahau, visawe, mazungumzo ya kimuktadha, tashbihi, masimulizi." },
  { id: "g5-ksw-ks", subjectId: "kiswahili", grade: 5, name: "Kusoma", description: "Kusoma kwa ufahamu, kina, ufasaha na mapana — matumizi ya kamusi, ushairi (vina na mizani), mchezo wa kuigiza, usalama mtandaoni, matini ya kujichagulia." },
  { id: "g5-ksw-ka", subjectId: "kiswahili", grade: 5, name: "Kuandika", description: "Insha za wasifu, masimulizi na maelezo, baruapepe, kuandika kwa tarakilishi." },
  { id: "g5-ksw-sarufi", subjectId: "kiswahili", grade: 5, name: "Sarufi", description: "Aina za nomino (pekee, kawaida, wingi, vitenzi-jina, makundi, ambata, dhahania), uakifishaji, ngeli (I-ZI, U-ZI, U-YA, KU-KU), mnyambuliko wa vitenzi, vinyume vya vitenzi, nyakati na hali, ukanushaji, ukubwa na udogo wa nomino." },

  { id: "g6-ksw-kz", subjectId: "kiswahili", grade: 6, name: "Kusikiliza na Kuzungumza", description: "Vitanzandimi na matamshi bora (d/nd, ch/sh, j/nj, g/ng), maamkuzi na maagano, vitendawili, heshima/adabu/vyeo, methali, nahau, visawe, mazungumzo ya kimuktadha, sitiari za tabia, kujieleza kwa ufasaha." },
  { id: "g6-ksw-ks", subjectId: "kiswahili", grade: 6, name: "Kusoma", description: "Kusoma kwa ufahamu, kina, ufasaha na mapana — matumizi ya kamusi, mashairi (tathnia/tathlitha/tarbia), mchezo wa kuigiza, usalama mtandaoni, uchaguzi wa matini maktabani." },
  { id: "g6-ksw-ka", subjectId: "kiswahili", grade: 6, name: "Kuandika", description: "Insha za wasifu, masimulizi na maelezo, barua rasmi, kuandika kwa tarakilishi." },
  { id: "g6-ksw-sarufi", subjectId: "kiswahili", grade: 6, name: "Sarufi", description: "Vivumishi (sifa, viashiria, vimilikishi, idadi, viulizi, kirejeshi amba-), viwakilishi (nafsi, viashiria, idadi), uakifishaji, ngeli (YA-YA, U-U, I-I, PA-KU-MU), mnyambuliko wa vitenzi, vinyume vya vivumishi, hali ya masharti (nge/ngali/ki), ukanushaji, ukubwa na udogo wa nomino." },

  // Social studies (per the KICD Grade 9 Social Studies curriculum design, First published 2024)
  { id: "ss-scd", subjectId: "social-studies", grade: 9, name: "Social Studies and Career Development", description: "Pathway choices, pre-career support systems." },
  { id: "ss-csl", subjectId: "social-studies", grade: 9, name: "Community Service-Learning", description: "A term-long, milestone-based community project (identify a problem, design and implement a solution, report) — practical, not covered by generated practice skills." },
  { id: "ss-pr", subjectId: "social-studies", grade: 9, name: "People and Relationships", description: "Early humans, indigenous knowledge, poverty reduction, population structure, conflict resolution, healthy relationships." },
  { id: "ss-nhbe", subjectId: "social-studies", grade: 9, name: "Natural and Historic Built Environments", description: "Topographical maps, land forming, river projects, environmental conservation, world heritage sites." },
  { id: "ss-pdg", subjectId: "social-studies", grade: 9, name: "Political Developments and Governance", description: "The Constitution of Kenya, civic engagement, bill of rights, cultural globalisation." },
  { id: "ss-extra-practice", subjectId: "social-studies", grade: 9, name: "Extra Practice", description: "Bonus skills from an earlier curriculum pass — not part of the official Grade 9 Social Studies design, kept as additional mastery practice.", isBonus: true },

  // Social studies — Grade 8 (per the KICD Grade 8 Social Studies curriculum design, Revised 2024)
  { id: "g8-ss-spm", subjectId: "social-studies", grade: 8, name: "Social Studies and Personal Management", description: "Self-improvement and self-esteem assessment." },
  { id: "g8-ss-csl", subjectId: "social-studies", grade: 8, name: "Community Service Learning", description: "A term-long, milestone-based community project (identify a problem, design and implement a solution, report) — practical, not covered by generated practice skills." },
  { id: "g8-ss-pr", subjectId: "social-studies", grade: 8, name: "People and Relationships", description: "Scientific theory of human origin, early civilisation, the Trans-Saharan slave trade, population growth, diversity and interpersonal skills, peaceful conflict resolution." },
  { id: "g8-ss-nhbe", subjectId: "social-studies", grade: 8, name: "Natural and Historic Built Environments", description: "Map reading, weather and climate, vegetation in Africa, historical sites and monuments in Africa." },
  { id: "g8-ss-pdg", subjectId: "social-studies", grade: 8, name: "Political Developments and Governance", description: "The Constitution of Kenya, human rights, citizenship." },

  // Social studies — Grade 7 (per the KICD Grade 7 Social Studies curriculum design, Revised 2024)
  { id: "g7-ss-spd", subjectId: "social-studies", grade: 7, name: "Social Studies and Personal Development", description: "Self-exploration (abilities, interests, values, managing emotions) and entrepreneurial opportunities in Social Studies." },
  { id: "g7-ss-csl", subjectId: "social-studies", grade: 7, name: "Community Service Learning", description: "A term-long, milestone-based community project (identify a problem, design and implement a solution, report) — practical, not covered by generated practice skills." },
  { id: "g7-ss-pr", subjectId: "social-studies", grade: 7, name: "People and Relationships", description: "Stories of human origin, early civilisation (ancient Egypt, Great Zimbabwe, Kingdom of Kongo), slavery and servitude, developments in the medium of trade, diversity and interpersonal relationships, peaceful coexistence." },
  { id: "g7-ss-nhbe", subjectId: "social-studies", grade: 7, name: "Natural and Historic Built Environments", description: "Sources of historical information, historical development of agriculture, maps and map work, Earth and the solar system, weather, fieldwork." },
  { id: "g7-ss-pdg", subjectId: "social-studies", grade: 7, name: "Political Development and Governance", description: "Political development in Africa (scramble and partition), the Constitution of Kenya, human rights, African diasporas, citizenship and globalisation." },

  // Social studies — Grade 6 (per the KICD Grade 6 Social Studies curriculum design, Revised 2024)
  { id: "g6-ss-environments", subjectId: "social-studies", grade: 6, name: "Natural and the Built Environments", description: "Position and size of countries in Eastern Africa, main physical features, climatic regions, vegetation, historic built environments." },
  { id: "g6-ss-people", subjectId: "social-studies", grade: 6, name: "People, Population and Social Organisations", description: "Language groups in Eastern Africa, population distribution, culture and social organisation, school and community." },
  { id: "g6-ss-resources", subjectId: "social-studies", grade: 6, name: "Resources and Economic Activities in Eastern Africa", description: "Beef farming, fishing, wildlife and tourism, transport, communication, mining." },
  { id: "g6-ss-political", subjectId: "social-studies", grade: 6, name: "Political Systems", description: "Traditional forms of government (the Buganda and the Nyamwezi), regional co-operations (the East African Community), citizenship, human rights." },
  { id: "g6-ss-governance", subjectId: "social-studies", grade: 6, name: "Governance", description: "Peace and conflict resolution, government revenue and expenditure, the preamble of the Constitution of Kenya." },

  // Pre-technical (per the KICD Grade 9 Pre-Technical Studies curriculum design, July 2024 revision)
  { id: "pt-foundations", subjectId: "pre-technical", grade: 9, name: "Foundations of Pre-Technical Studies", description: "Safety on raised platforms, handling hazardous substances, self-exploration and career development." },
  { id: "pt-communication", subjectId: "pre-technical", grade: 9, name: "Communication in Pre-Technical Studies", description: "Oblique projection (technical drawing), visual programming." },
  { id: "pt-materials", subjectId: "pre-technical", grade: 9, name: "Materials for Production", description: "Wood, handling waste materials." },
  { id: "pt-tools", subjectId: "pre-technical", grade: 9, name: "Tools and Production", description: "Holding tools, driving tools, hands-on project." },
  { id: "pt-entrepreneurship", subjectId: "pre-technical", grade: 9, name: "Entrepreneurship", description: "Financial services, government and business (taxation), business plans." },

  // Pre-technical — Grade 8 (per the KICD Grade 8 Pre-Technical Studies curriculum design, July 2024 revision)
  { id: "g8-pt-foundations", subjectId: "pre-technical", grade: 8, name: "Foundations of Pre-Technical Studies", description: "Fire safety, data safety." },
  { id: "g8-pt-communication", subjectId: "pre-technical", grade: 8, name: "Communication in Pre-Technical Studies", description: "Plane geometry, dimensioning, plain scale drawing, visual programming." },
  { id: "g8-pt-materials", subjectId: "pre-technical", grade: 8, name: "Materials for Production", description: "Composite materials, ceramic materials." },
  { id: "g8-pt-tools", subjectId: "pre-technical", grade: 8, name: "Tools and Production", description: "Cutting tools, computer software." },
  { id: "g8-pt-entrepreneurship", subjectId: "pre-technical", grade: 8, name: "Entrepreneurship", description: "Bookkeeping, income and budgeting, marketing and distribution of goods and services." },

  // Pre-technical — Grade 7 (per the KICD Grade 7 Pre-Technical Studies curriculum design, Revised 2024)
  { id: "g7-pt-foundations", subjectId: "pre-technical", grade: 7, name: "Foundations of Pre-Technical Studies", description: "Introduction to Pre-Technical Studies, safety in the work environment (physical and online threats), computer concepts and classification." },
  { id: "g7-pt-communication", subjectId: "pre-technical", grade: 7, name: "Communication", description: "Fundamentals of communication and ICT tools, introduction to technical drawing (lines, symbols, abbreviations), plane geometry (dimensioning combined shapes)." },
  { id: "g7-pt-materials", subjectId: "pre-technical", grade: 7, name: "Materials for Production", description: "Economic resources in Kenya, metallic materials, non-metallic materials." },
  { id: "g7-pt-tools", subjectId: "pre-technical", grade: 7, name: "Tools and Production", description: "Measuring and marking out tools, production of goods and services." },
  { id: "g7-pt-entrepreneurship", subjectId: "pre-technical", grade: 7, name: "Entrepreneurship", description: "Introduction to entrepreneurship, money and the Kenyan currency, setting financial goals." },

  // Agriculture & Nutrition (per the KICD Grade 9 Agriculture curriculum design, 2024 revision)
  { id: "ag-conservation", subjectId: "agriculture-nutrition", grade: 9, name: "Conservation of Resources", description: "Conserving animal feed (hay), conserving leftover food, integrated farming." },
  { id: "ag-food-production", subjectId: "agriculture-nutrition", grade: 9, name: "Food Production Processes", description: "Organic gardening, storage of crop produce, cooking using flour mixtures." },
  { id: "ag-hygiene", subjectId: "agriculture-nutrition", grade: 9, name: "Hygiene Practices", description: "Cleaning waste disposal facilities, disinfecting clothing and household articles." },
  { id: "ag-production-techniques", subjectId: "agriculture-nutrition", grade: 9, name: "Production Techniques", description: "Grafting in plants, homemade sun dryer." },

  // Agriculture & Nutrition — Grade 8 (per the KICD Grade 8 Agriculture curriculum design, Revised 2024)
  { id: "g8-ag-conservation", subjectId: "agriculture-nutrition", grade: 8, name: "Conservation of Resources", description: "Soil conservation measures, water harvesting and storage." },
  { id: "g8-ag-food-production", subjectId: "agriculture-nutrition", grade: 8, name: "Food Production Processes", description: "Kitchen and backyard gardening, poultry rearing in a fold, crop pest and disease control, preparation and preservation of animal products, cooking a balanced meal." },
  { id: "g8-ag-hygiene", subjectId: "agriculture-nutrition", grade: 8, name: "Hygiene Practices", description: "Cleaning the kitchen." },
  { id: "g8-ag-production-techniques", subjectId: "agriculture-nutrition", grade: 8, name: "Production Techniques", description: "Sewing skills for household items, constructing an innovative animal waterer, ICT support services." },

  // Agriculture — Grade 6 (per the KICD Grade 6 Agriculture curriculum design, First published 2017, Revised 2024)
  // Agriculture — Grade 5 (per the KICD Grade 5 Agriculture curriculum design, Revised 2024) — an integrated
  // agriculture + home science area (crop/animal production alongside hygiene, laundry and clothing repair).
  // See curriculum-reference/grade-5/agriculture.json.
  { id: "g5-ag-conservation", subjectId: "agriculture-nutrition", grade: 5, name: "Conservation of Resources", description: "Soil conservation with organic waste pits, water conservation (mulching, cover cropping, shading), and conserving wild animals with smoke/smell repellents." },
  { id: "g5-ag-food-production", subjectId: "agriculture-nutrition", grade: 5, name: "Food Production Processes", description: "Growing vegetables in a nursery bed, uses of 8 named domestic animals, preserving cereals and pulses, food nutrients, and cooking by dry fat frying and deep frying." },
  { id: "g5-ag-hygiene", subjectId: "agriculture-nutrition", grade: 5, name: "Hygiene Practices", description: "Good grooming (dressing and etiquette), cleaning surfaces made from different materials, and laundering white and fast-coloured cotton items." },
  { id: "g5-ag-production-techniques", subjectId: "agriculture-nutrition", grade: 5, name: "Production Techniques", description: "Repairing garments with back stitch and running stitch, and constructing horizontal and vertical innovative gardens." },

  { id: "g5-ss-environments", subjectId: "social-studies", grade: 5, name: "Natural and Historic Built Environments", description: "Elements of a map, location/position/size of Kenya, main physical features, weather and climate, the built environments (museums, monuments, cultural centres, historical buildings)." },
  { id: "g5-ss-people", subjectId: "social-studies", grade: 5, name: "People and Social Organisations", description: "Language groups in Kenya (Nilotes, Bantu, Cushites), population distribution, African traditional education, school administration." },
  { id: "g5-ss-resources", subjectId: "social-studies", grade: 5, name: "Resources and Economic Activities", description: "Resources in Kenya, mining, fishing, wildlife and tourism, development of transport, development of communication." },
  { id: "g5-ss-political", subjectId: "social-studies", grade: 5, name: "Political Systems", description: "Traditional leaders in Kenya (Kivoi wa Mwendwa, Mekatilili wa Menza), early forms of government (Maasai, Ameru), citizenship in Kenya." },
  { id: "g5-ss-governance", subjectId: "social-studies", grade: 5, name: "Governance", description: "National unity in Kenya, human rights, democracy in society, national government (Executive, Legislature, Judiciary)." },

  { id: "g6-ag-conservation", subjectId: "agriculture-nutrition", grade: 6, name: "Conservation of Resources", description: "Controlling soil erosion (gulley, rill, splash, sheet), conserving water with sunken seedbeds and shallow pits, conserving wild animals with physical deterrents." },
  { id: "g6-ag-food-production", subjectId: "agriculture-nutrition", grade: 6, name: "Food Production Processes", description: "Rearing small domestic animals (rabbits, guinea pigs), preserving fruits and vegetables by sun-drying, cooking food by stewing and baking (rubbing-in method)." },
  { id: "g6-ag-hygiene", subjectId: "agriculture-nutrition", grade: 6, name: "Hygiene Practices", description: "Good grooming and body cleanliness, identifying and removing common stains (blood, grass) from clothing and household articles." },
  { id: "g6-ag-production-techniques", subjectId: "agriculture-nutrition", grade: 6, name: "Production Techniques", description: "Crocheting stitches (single and double) and household articles, constructing sunken and raised moist bed gardens." },

  { id: "g7-ag-conservation", subjectId: "agriculture-nutrition", grade: 7, name: "Conservation of Resources", description: "Controlling soil pollution, constructing water retention structures, conserving food nutrients, growing trees." },
  { id: "g7-ag-food-production", subjectId: "agriculture-nutrition", grade: 7, name: "Food Production Processes", description: "Preparing planting site and establishing crop, selected crop management practices, preparing animal products (eggs and honey), cooking by grilling, roasting and steaming." },
  { id: "g7-ag-hygiene", subjectId: "agriculture-nutrition", grade: 7, name: "Hygiene Practices", description: "Hygiene in rearing animals, laundry of loose coloured items." },
  { id: "g7-ag-production-techniques", subjectId: "agriculture-nutrition", grade: 7, name: "Production Techniques", description: "Sewing skills (knitting), constructing framed suspended garden, adding value to crop produce, making homemade soap." },

  // Mandarin — Grade 7 (per the KICD Grade 7 Mandarin curriculum design, First published 2022, Revised 2024)
  { id: "g7-ma-listening-speaking", subjectId: "mandarin", grade: 7, name: "Listening and Speaking", description: "Casual greetings, family, my surroundings, time, fun and enjoyment, foods and drinks, my body, weather and environment, and getting around — oral vocabulary and expressions." },
  { id: "g7-ma-reading", subjectId: "mandarin", grade: 7, name: "Reading", description: "The same nine themes through short Mandarin passages/dialogues and reading comprehension." },
  { id: "g7-ma-writing", subjectId: "mandarin", grade: 7, name: "Writing", description: "The same nine themes through guided writing — pinyin spelling, gap-fill, word order, and punctuation." },

  // German — Grade 7 (per the KICD Grade 7 German curriculum design, First published 2022, Revised 2024)
  { id: "g7-de-listening-speaking", subjectId: "german", grade: 7, name: "Listening and Speaking", description: "Casual greetings, family, my surroundings, time, fun and enjoyment, foods and drinks, my body, weather and environment, and getting around — informal (du-form) oral vocabulary and expressions." },
  { id: "g7-de-reading", subjectId: "german", grade: 7, name: "Reading", description: "The same nine themes through short German passages/dialogues and reading comprehension." },
  { id: "g7-de-writing", subjectId: "german", grade: 7, name: "Writing", description: "The same nine themes through guided writing — spelling, gap-fill, word order, and functional writing." },

  // Creative arts & sports (per the KICD Grade 9 Creative Arts and Sports curriculum design, First published 2024)
  { id: "cas-foundations", subjectId: "creative-arts-sports", grade: 9, name: "Foundations of Creative Arts and Sports", description: "Careers in Creative Arts and Sports, basic components (fitness, play elements, music notation)." },
  { id: "cas-creating-performing", subjectId: "creative-arts-sports", grade: 9, name: "Creating and Performing in Creative Arts and Sports", description: "Drawing/painting, rhythm, athletics, melody, rugby, photography, recorder, drama, basketball, indigenous crafts, swimming or indigenous games." },
  { id: "cas-appreciation", subjectId: "creative-arts-sports", grade: 9, name: "Appreciation in Creative Arts and Sports", description: "Analysis and critique of Creative Arts and Sports works." },

  // Creative Arts — Grade 6 (per the KICD Grade 6 Creative Arts curriculum design, First published 2017, Revised 2024).
  // Official Grade 6 name is "Creative Arts" alone (namesByGrade on the subject entry) — an integrated Art and
  // Craft / Music / Physical Health Education area, using the design's own 3 strand names verbatim.
  { id: "g6-cas-creating-executing", subjectId: "creative-arts-sports", grade: 6, name: "Creating and Executing", description: "String instruments and stippling drawing, painting and collage, volleyball, rhythm and block-print pattern making, weaving, gymnastics, and melody." },
  { id: "g6-cas-performing-displaying", subjectId: "creative-arts-sports", grade: 6, name: "Performing and Displaying", description: "Athletics (long jump, high jump), descant recorder, indigenous Kenyan instrumental ensembles, indigenous Kenyan pottery, and swimming or indigenous Kenyan floor games." },
  { id: "g6-cas-appreciation", subjectId: "creative-arts-sports", grade: 6, name: "Appreciation in Creative Arts", description: "Cataloguing and analysing artworks, discussing elements of music and messages in songs, and appreciating sportsmanship." },

  // Creative Arts — Grade 5 (per the KICD Primary School Curriculum Design — Creative Arts, Grade 5, First
  // published 2017, Revised 2024). Official Grade 5 name is "Creative Arts" alone (namesByGrade on the subject
  // entry) — an integrated Art and Craft / Music / Physical Health Education area, using the design's own 3
  // strand names verbatim. See curriculum-reference/grade-5/creative-arts.json for the full mining record.
  { id: "g5-cas-creating-executing", subjectId: "creative-arts-sports", grade: 5, name: "Creating and Executing", description: "Wind instruments and crayon-etching drawing, football and papier mâché cones, rhythm and calligraphy, painting and mosaic, melody and card design, and rounders and bat carving." },
  { id: "g5-cas-performing-displaying", subjectId: "creative-arts-sports", grade: 5, name: "Performing and Displaying", description: "Athletics relays and rope plaiting, fabric decoration (tie and dye, appliqué), Kenyan folk dance and beadwork, glove puppetry, descant recorder (B A G C¹ D¹), and swimming or indigenous counting games." },
  { id: "g5-cas-appreciation", subjectId: "creative-arts-sports", grade: 5, name: "Appreciation in Creative Arts", description: "Showcasing artworks in a school gallery, discussing a Kenyan folk dance with correct terminology, the East African Community Anthem, and sportsmanship in games." },

  // Creative arts & sports — Grade 8 (per the KICD Grade 8 Creative Arts and Sports curriculum design, Revised 2024)
  { id: "g8-cas-foundations", subjectId: "creative-arts-sports", grade: 8, name: "Foundations of Creative Arts and Sports", description: "Roles of Creative Arts and Sports in society, storyboard planning, and verse/fitness/music components." },
  { id: "g8-cas-creating-performing", subjectId: "creative-arts-sports", grade: 8, name: "Creating and Performing in Creative Arts and Sports", description: "Drawing/painting, rhythm, middle distance races and montage, melody, netball, fabric decoration, descant recorder, verse, volleyball, folk dance, basketry, swimming or indigenous games." },
  { id: "g8-cas-appreciation", subjectId: "creative-arts-sports", grade: 8, name: "Appreciation in Creative Arts and Sports", description: "Analysing verse performances, examining sportsmanship, analysing folk dance, and showcasing artwork." },

  // Creative arts & sports — Grade 7 (per the KICD Grade 7 Creative Arts and Sports curriculum design, First published 2022, Revised 2024)
  { id: "g7-cas-foundations", subjectId: "creative-arts-sports", grade: 7, name: "Foundations of Creative Arts and Sports", description: "The four categories of Creative Arts and Sports and how they relate, plus Visual Arts/story/fitness/music components." },
  { id: "g7-cas-creating-performing", subjectId: "creative-arts-sports", grade: 7, name: "Creating and Performing in Creative Arts and Sports", description: "Composing rhythm and melody in C major, javelin, handball, a Western solo instrument, football, storytelling, Kenyan folk song, and swimming (optional)." },
  { id: "g7-cas-appreciation", subjectId: "creative-arts-sports", grade: 7, name: "Appreciation in Creative Arts and Sports", description: "Analysing a football game, a folk song, a storytelling performance, and a 2D artwork." },

  // CRE — Christian Religious Education (per the KICD Grade 9 CRE curriculum design, First published 2024)
  { id: "cre-creation", subjectId: "cre", grade: 9, name: "Creation", description: "Work — Christian work ethics, career paths based on gifts and talents." },
  { id: "cre-bible", subjectId: "cre", grade: 9, name: "The Bible", description: "Christian moral values (sexual purity), Judge Deborah, Kings David and Solomon." },
  { id: "cre-jesus", subjectId: "cre", grade: 9, name: "The Life and Ministry of Jesus Christ", description: "Miracles, parables, and Jesus' encounters, ministry, passion, death and resurrection." },
  { id: "cre-church", subjectId: "cre", grade: 9, name: "The Church", description: "The Early Church, the gifts of the Holy Spirit." },
  { id: "cre-living", subjectId: "cre", grade: 9, name: "Christian Living Today", description: "Courtship and marriage, responsible parenthood, leisure, wealth, money and poverty." },

  // CRE — Grade 8 (per the KICD Grade 8 CRE curriculum design, Revised 2024)
  { id: "g8-cre-cn", subjectId: "cre", grade: 8, name: "Creation", description: "Origin and consequences of sin, God's plan for redemption." },
  { id: "g8-cre-bi", subjectId: "cre", grade: 8, name: "The Bible", description: "Faith and God's promises to Abraham, the Abrahamic covenant, leadership in Israel under King Saul." },
  { id: "g8-cre-mi", subjectId: "cre", grade: 8, name: "Miracles of Jesus Christ", description: "Healing of blind Bartimaeus, calming the storm, healing of the paralytic." },
  { id: "g8-cre-te", subjectId: "cre", grade: 8, name: "Teachings of Jesus Christ", description: "Teachings on prayer, the parable of the lost sheep." },
  { id: "g8-cre-ch", subjectId: "cre", grade: 8, name: "The Church", description: "The Holy Spirit, acts of compassion." },
  { id: "g8-cre-cl", subjectId: "cre", grade: 8, name: "Christian Living Today", description: "Family relationships, responsible sexual behaviour, sacredness of life, bullying, talents and gifts, leisure." },

  // CRE — Grade 7 (per the KICD Grade 7 CRE curriculum design, First published 2022, Revised 2024) —
  // 6 strands, the only grade whose design includes a standalone "Overview of CRE" strand.
  { id: "g7-cre-overview", subjectId: "cre", grade: 7, name: "Overview of Christian Religious Education", description: "The importance of studying CRE and the values it helps learners build for responsible living." },
  { id: "g7-cre-creation", subjectId: "cre", grade: 7, name: "Creation", description: "The two accounts of creation, stewardship over animals/fish/birds, responsibility over plants, and the use of natural resources." },
  { id: "g7-cre-bible", subjectId: "cre", grade: 7, name: "The Bible", description: "Functions of the Bible, its divisions, Bible translation, and leadership in Israel through Moses." },
  { id: "g7-cre-jesus", subjectId: "cre", grade: 7, name: "The Early Life of Jesus Christ", description: "Old Testament prophecies about the Messiah, John the Baptist as a precursor to Jesus, and the birth and childhood of Jesus Christ." },
  { id: "g7-cre-church", subjectId: "cre", grade: 7, name: "The Church", description: "Selected forms of worship (praise, thanksgiving, prayer, fasting) and the role of the church in education and health." },
  { id: "g7-cre-living", subjectId: "cre", grade: 7, name: "Christian Living Today", description: "Human sexuality, Christian marriage and family, alcohol/drugs/substance use, gambling, and social media." },

  // CRE — Grade 6 (per the KICD Grade 6 CRE curriculum design, First published 2021, Revised 2024)
  { id: "g6-cre-creation", subjectId: "cre", grade: 6, name: "Creation", description: "My purpose (using God-given talents and abilities), marriage and family, and leisure." },
  { id: "g6-cre-bible", subjectId: "cre", grade: 6, name: "The Bible", description: "The Bible as the inspired Word of God, the Ten Commandments, Samson defeats the Philistines, faith in God through Elisha, and Jacob wrestles an angel." },
  { id: "g6-cre-jesus", subjectId: "cre", grade: 6, name: "The Life of Jesus Christ", description: "The call of the disciples, the temptations of Jesus Christ, miracles (the Roman officer's servant, healing of the bleeding woman), raising Lazarus from the dead, the parable of the hidden treasure, and the rich man and Lazarus." },
  { id: "g6-cre-church", subjectId: "cre", grade: 6, name: "The Church", description: "The Apostles' Creed, standing firm in faith through the example of Apostle Paul, and Church unity." },
  { id: "g6-cre-living", subjectId: "cre", grade: 6, name: "Christian Living Today", description: "Friendship formation, human sexuality, sanctity of life, and alcohol/drug/substance abuse." },

  // CRE — Grade 5 (per the KICD Grade 5 CRE curriculum design, First published 2017, Revised 2024). See
  // curriculum-reference/grade-5/religious-education-cre.json for the full mining record.
  { id: "g5-cre-creation", subjectId: "cre", grade: 5, name: "Creation", description: "My purpose (talents and abilities), work, the fall of man, and family unity." },
  { id: "g5-cre-bible", subjectId: "cre", grade: 5, name: "The Bible", description: "The Bible as a guide, Peter and John in the Temple, King Solomon the wise ruler, Noah and his sons, a hand writes on the wall, Mount Carmel contest, the birth of Moses, and the call of Moses." },
  { id: "g5-cre-jesus", subjectId: "cre", grade: 5, name: "The Life of Jesus Christ", description: "John the Baptist, the baptism of Jesus Christ, calming the storm, feeding the four thousand, healing the paralysed man, the parable of the lost sheep, the Sermon on the Mount, the rich young ruler, and a friend at midnight." },
  { id: "g5-cre-church", subjectId: "cre", grade: 5, name: "The Church", description: "The early Church, the Lord's Supper, the Holy Spirit, and Peter's miraculous rescue." },
  { id: "g5-cre-living", subjectId: "cre", grade: 5, name: "Christian Living", description: "Friendship formation, human sexuality, sanctity of life, alcohol/drugs/substance abuse, and social media." },

  // HRE — Hindu Religious Education (per the KICD Grade 9 HRE curriculum design, First published 2023)
  { id: "hre-paramatma", subjectId: "hre", grade: 9, name: "Manifestation of Paramatma", description: "Enlightened Beings — Tridev, the Tirthankars' way of non-violence, Buddha's gift to humanity, the Guru's way of life." },
  { id: "hre-scriptures", subjectId: "hre", grade: 9, name: "Scriptures", description: "Sikh Scriptures — Sri Sukhmani Sahib in Sri Guru Granth Sahib ji, Ashtpadi from 17-24." },
  { id: "hre-dharma", subjectId: "hre", grade: 9, name: "Principles of Dharma", description: "Sikh Principles of Dharma — compassion, satisfaction, truth, humility, love, honest livelihood, sharing." },
  { id: "hre-practises", subjectId: "hre", grade: 9, name: "Religious Practises", description: "Rituals and protocols during religious activities — Akhand Ramayan Path, Kalpa Sutra recitation, Akhand path of Sri Guru Granth Sahib ji, Katha." },
  { id: "hre-yog", subjectId: "hre", grade: 9, name: "Yog", description: "Gyan/Jnan Yog — hearing, thinking, meditation, and key practitioners from each faith." },
  { id: "hre-sanskaars", subjectId: "hre", grade: 9, name: "Sanskaars", description: "Sikh Sanskaars — naming ceremony, tying the turban, baptism, marriage, death rites." },

  // HRE — Grade 8 (per the KICD Grade 8 HRE curriculum design, Revised 2024) — four-faith rotation within each strand
  { id: "g8-hre-pa", subjectId: "hre", grade: 8, name: "Manifestation of Paramatma", description: "Enlightened Beings across Sanatan/Vedic, Jain, Buddhist, and Sikh traditions." },
  { id: "g8-hre-sc", subjectId: "hre", grade: 8, name: "Scriptures", description: "Scriptural texts from Sanatan/Vedic, Jain, Buddhist, and Sikh traditions." },
  { id: "g8-hre-pd", subjectId: "hre", grade: 8, name: "Principles of Dharma", description: "Fundamental principles across traditions, Buddhist principles of Dharma (the Noble Eightfold Path)." },
  { id: "g8-hre-rp", subjectId: "hre", grade: 8, name: "Religious Practices", description: "Protocols in Sanatan Dharma, protocols in Jain Dharma." },
  { id: "g8-hre-yo", subjectId: "hre", grade: 8, name: "Yoga", description: "Path of Action (Karma Yoga) and its practitioners across traditions." },
  { id: "g8-hre-sk", subjectId: "hre", grade: 8, name: "Sanskaars (Rite of Passage)", description: "Jain religious ceremonies, Buddhist Sanskaars." },

  // HRE — Grade 7 (per the KICD Grade 7 HRE curriculum design, Revised 2024) — 6 strands, 8 sub-strands.
  // Grade 7's structure does NOT mirror Grade 8/9 HRE — see curriculum-reference/grade-7/hindu-religious-education.json.
  { id: "g7-hre-pa", subjectId: "hre", grade: 7, name: "Manifestation of Supreme Being (Paramatma)", description: "Enlightened Beings — their stories and interrelationships across Sanatan/Vedic, Jain, Buddhist and Sikh traditions." },
  { id: "g7-hre-sc", subjectId: "hre", grade: 7, name: "Scriptures", description: "Four scriptural texts, one per faith, that promote peace and harmony: the Shanti Mantra, the Uttradhyan Sutra, the Sutta Nipata, and Sukhmani Sahib." },
  { id: "g7-hre-pd", subjectId: "hre", grade: 7, name: "Principles of Dharma (Dharmic Siddhant)", description: "Fundamental principles across the four faiths — Pranidaya, Purusharth, Ahimsa, Astey, Daya, Nimrata." },
  { id: "g7-hre-rp", subjectId: "hre", grade: 7, name: "Religious Practices", description: "The seven Buddhist daily scheduled practices, and festivals celebrated at places of worship across the four faiths." },
  { id: "g7-hre-yo", subjectId: "hre", grade: 7, name: "Yog", description: "The three concepts of Yog — devotion, knowledge, action — and the personal and communal elements of the Path of Devotion (Bhakti Yog)." },
  { id: "g7-hre-sk", subjectId: "hre", grade: 7, name: "Rites of Passage (Sanskaars)", description: "Religious ceremonies marking birth, naming and coming-of-age across the Sanatan/Vedic and Sikh traditions." },

  // HRE — Grade 6 (per the KICD Grade 6 HRE curriculum design, Revised 2024; full mining record at
  // curriculum-reference/grade-6/religious-education-hre.json) — leans heavily on Buddhist and Sikh content.
  { id: "g6-hre-cn", subjectId: "hre", grade: 6, name: "Creation", description: "Creation concepts in Buddh and Sikh faiths, and the seven Gifts of Nature: cow, peacock, horse, elephant, hawk, Garur, lion." },
  { id: "g6-hre-pa", subjectId: "hre", grade: 6, name: "Manifestations of Paramatma", description: "Enlightened Beings and social welfare — Raja Ram Mohan Rai, Atma Ram Ji Sarriputa, Sri Guru Hargobind Sahib ji." },
  { id: "g6-hre-sc", subjectId: "hre", grade: 6, name: "Scriptures", description: "Scriptures and moral values — Bhagwad Gita, Uttradhayaan (Ch. 13-18), Sutta Pitaka, Sri Guru Granth Sahib ji." },
  { id: "g6-hre-wo", subjectId: "hre", grade: 6, name: "Worship", description: "Basic chants/mantras in the Buddh faith (paying homage, tisarana, pancha sila) and Buddhist Vihaars in Africa." },
  { id: "g6-hre-se", subjectId: "hre", grade: 6, name: "Sadachaar (Social Ethics)", description: "Managing natural, financial, man-made, and time resources for harmonious living." },
  { id: "g6-hre-yo", subjectId: "hre", grade: 6, name: "Yoga (Holistic Wellness)", description: "Asanas and Pranayam breathing exercises, and the communal aspects of Yoga — wellness, harmony, environmental protection." },
  { id: "g6-hre-pd", subjectId: "hre", grade: 6, name: "Principles of Dharma", description: "Virtues and Principles of Dharma in the Buddhist faith, drawn from Scriptural stories." },
  { id: "g6-hre-ut", subjectId: "hre", grade: 6, name: "Utsav (Festivals)", description: "Festivals from other faiths — Christmas, Eid-ul-Fitr — and Indian traditional calendar days: Sankranti, Amavasya, Purnima." },

  // IRE — Islamic Religious Education (per the KICD Grade 9 IRE curriculum design, First published 2024)
  { id: "ire-quran", subjectId: "ire", grade: 9, name: "Qur'an", description: "Ulum al-Qur'an (its miraculous nature, language, styles), Surah Al-Hujurat (Q49)." },
  { id: "ire-hadith", subjectId: "ire", grade: 9, name: "Hadith", description: "Ulum al-Hadith (books, classification, compilation), selected Hadith on unity and avoiding ill motives." },
  { id: "ire-iman", subjectId: "ire", grade: 9, name: "Pillars of Iman", description: "Belief in the Last Day (Day of Judgement), belief in Qadar." },
  { id: "ire-devotional", subjectId: "ire", grade: 9, name: "Devotional Acts", description: "Shariah (Maqasid al-Shariah), Tawbah (repentance)." },
  { id: "ire-akhlaq", subjectId: "ire", grade: 9, name: "Akhlaq", description: "Virtues in Islam (modesty, contentment, trustworthiness), significance of Islamic morality, prohibitions in Islam (Zina)." },
  { id: "ire-muamalat", subjectId: "ire", grade: 9, name: "Muamalat", description: "Domestic violence, iddah, child custody, polygamy, trade and finance, contemporary issues (Jihad, terrorism, extremism)." },
  { id: "ire-heritage", subjectId: "ire", grade: 9, name: "Islamic Heritage and Civilisation", description: "Islam in Kenya, unity of Muslims, Muslim institutions (mosques, madrasa, Muslim NGOs)." },

  // IRE — Grade 8 (per the KICD Grade 8 IRE curriculum design, Revised 2024)
  { id: "g8-ire-qu", subjectId: "ire", grade: 8, name: "Qur'an", description: "Modes of preservation of the Qur'an, divisions of the Qur'an, selected verses (Al-Luqman 12-19)." },
  { id: "g8-ire-ha", subjectId: "ire", grade: 8, name: "Hadith", description: "Ulum al-Hadith, selected Hadith on accountability and respect for authority." },
  { id: "g8-ire-pi", subjectId: "ire", grade: 8, name: "Pillars of Iman", description: "Belief in revealed scriptures, Ulul-Azm Prophets." },
  { id: "g8-ire-da", subjectId: "ire", grade: 8, name: "Devotional Acts", description: "Prayers on special occasions, Hajj and Umrah." },
  { id: "g8-ire-ak", subjectId: "ire", grade: 8, name: "Akhlaq", description: "Commanding good and forbidding evil, virtues in Islam, prohibitions in Islam." },
  { id: "g8-ire-mu", subjectId: "ire", grade: 8, name: "Muamalat", description: "Divorce, types of divorce, trade and finance in Islam, human rights." },
  { id: "g8-ire-ih", subjectId: "ire", grade: 8, name: "Islamic Heritage and Civilisation", description: "The Rightly Guided Caliphs." },

  // IRE — Grade 7 (per the KICD Grade 7 IRE curriculum design, Revised 2024)
  { id: "g7-ire-quran", subjectId: "ire", grade: 7, name: "Qur'an", description: "Ulumul Qur'an (rationale and stages of revelation, the cave Hira incident), Surah Ad-Dhuha and Surah Al-Balad." },
  { id: "g7-ire-hadith", subjectId: "ire", grade: 7, name: "Hadith", description: "Ulumul Hadith (forms, components, types), selected Hadith on intention and on choice of friends." },
  { id: "g7-ire-iman", subjectId: "ire", grade: 7, name: "Pillars of Iman", description: "Significance of Tawheed, types and effects of shirk." },
  { id: "g7-ire-devotional", subjectId: "ire", grade: 7, name: "Devotional Acts", description: "Swalah (congregational, sunnah, and special-occasion prayers), Zakat, Saum." },
  { id: "g7-ire-akhlaq", subjectId: "ire", grade: 7, name: "Akhlaq", description: "Dimensions of morality in Islam, virtues (truthfulness and forgiveness), prohibitions in Islam (drug abuse)." },
  { id: "g7-ire-muamalat", subjectId: "ire", grade: 7, name: "Muamalat", description: "Marriage, trade and finance in Islam, contemporary issues (rights of women, HIV/AIDS and COVID-19)." },
  { id: "g7-ire-heritage", subjectId: "ire", grade: 7, name: "Islamic Heritage and Civilisation", description: "Socio-religious, political and economic reforms introduced by Prophet Muhammad (S.A.W.)." },

  // IRE — Grade 6 (per the KICD Grade 6 IRE curriculum design, Revised 2024; full mining record at curriculum-reference/grade-6/ire.json)
  { id: "g6-ire-quran", subjectId: "ire", grade: 6, name: "Qur'an", description: "Selected surah: Al-Humaza, Al-Asr, At-Takathur, Al-Qariah." },
  { id: "g6-ire-hadith", subjectId: "ire", grade: 6, name: "Hadith", description: "Hadith on purity of actions, dressing, planting, and responsible use of human capabilities and resources." },
  { id: "g6-ire-iman", subjectId: "ire", grade: 6, name: "Pillars of Iman", description: "Stories of prophets Ibrahim (A.S.) and Yusuf (A.S.), taqwa (God consciousness), tawakkul (reliance on Allah)." },
  { id: "g6-ire-devotional", subjectId: "ire", grade: 6, name: "Devotional Acts", description: "Twahara (purity, hadath, ghusl), zakat, saum (fasting exemptions), Hajj." },
  { id: "g6-ire-akhlaq", subjectId: "ire", grade: 6, name: "Akhlaq", description: "Work as ibadah, adalah (justice), prohibitions (intoxicants), israf (extravagance), dua for travelling." },
  { id: "g6-ire-muamalat", subjectId: "ire", grade: 6, name: "Muamalat", description: "Fair treatment of workers, relations with people of other faiths, corruption." },
  { id: "g6-ire-history", subjectId: "ire", grade: 6, name: "History of Islam", description: "Battles of Badr and Uhud, Treaty of Hudaibiya, Conquest of Makkah and Battle of Hunayn, Farewell Pilgrimage." },

  // IRE — Grade 5 (per the KICD Grade 5 IRE curriculum design, Revised 2024; full mining record at curriculum-reference/grade-5/ire.json)
  { id: "g5-ire-quran", subjectId: "ire", grade: 5, name: "Qur'an", description: "Selected surah: Al-Kauthar, Al-Maun, Al-Quraysh, Al-Fil." },
  { id: "g5-ire-hadith", subjectId: "ire", grade: 5, name: "Hadith", description: "Hadith on good behaviour, greetings, knowledge, and gratitude." },
  { id: "g5-ire-iman", subjectId: "ire", grade: 5, name: "Pillars of Iman", description: "Attributes of Allah, belief in angels, qualities of prophets, miracles of prophets Nuh, Musa and Issa." },
  { id: "g5-ire-devotional", subjectId: "ire", grade: 5, name: "Devotional Acts", description: "Nullifiers of swalah, Qabliyah and Ba'diyah, Taraweeh and witr, swadaqah, saum and its nullifiers." },
  { id: "g5-ire-akhlaq", subjectId: "ire", grade: 5, name: "Akhlaq", description: "Generosity, effects of social media, evils of gambling, dua on increase in knowledge." },
  { id: "g5-ire-muamalat", subjectId: "ire", grade: 5, name: "Muamalat", description: "Etiquette of Islamic wedding celebrations, rights of neighbours, Islamic rules on buying and selling." },
  { id: "g5-ire-history", subjectId: "ire", grade: 5, name: "History of Islam", description: "Al-Isra wal Miraj, Pledges of Aqabah, Hijra to Madina, Constitution of Madina." },

  // French (per the KICD Grade 9 French curriculum design, First published 2024)
  { id: "fr-listening-speaking", subjectId: "french", grade: 9, name: "Listening and Speaking", description: "Greetings, family, the countryside, routine, plans, eating out, health, environment, and directions — oral vocabulary and expressions." },
  { id: "fr-reading", subjectId: "french", grade: 9, name: "Reading", description: "The same nine themes through short French passages and reading comprehension." },
  { id: "fr-writing", subjectId: "french", grade: 9, name: "Writing", description: "The same nine themes through guided writing — spelling, gap-fill, and sentence structure." },

  // French — Grade 8 (per the KICD Grade 8 French curriculum design, Revised 2024) — same 9 themes as
  // Grade 9 (Greetings, Family, My Town, Time, Travel, In the Kitchen, Feelings, Weather/Environment,
  // Transport) but leans grammar/register-focused: formal "vous" politeness register, imperative mood for
  // travel/kitchen/transport instructions, word-order/orthography drills.
  { id: "g8-fr-listening-speaking", subjectId: "french", grade: 8, name: "Listening and Speaking", description: "Formal greetings, extended family, my town, time, travel, the kitchen, feelings, weather, and transport — oral vocabulary with a formal-register/imperative focus." },
  { id: "g8-fr-reading", subjectId: "french", grade: 8, name: "Reading", description: "The same nine themes through short, formally-registered French passages and reading comprehension." },
  { id: "g8-fr-writing", subjectId: "french", grade: 8, name: "Writing", description: "The same nine themes through guided writing — formal 'vous' conjugation, imperative-mood sentences, and orthography drills." },

  // French — Grade 7 (per the KICD Grade 7 French curriculum design, revised 2024) — same 9 themes as
  // German/Arabic Grade 7 (Greetings, Family, My Surroundings, Time, Fun and Enjoyment, Foods and Drinks,
  // My Body, Weather and Environment, Getting Around), informal "tu" register throughout.
  { id: "g7-fr-listening-speaking", subjectId: "french", grade: 7, name: "Listening and Speaking", description: "Greetings, family, my surroundings, time, fun and enjoyment, foods and drinks, my body, weather and environment, and getting around — oral vocabulary and expressions." },
  { id: "g7-fr-reading", subjectId: "french", grade: 7, name: "Reading", description: "The same nine themes through short French passages and reading comprehension." },
  { id: "g7-fr-writing", subjectId: "french", grade: 7, name: "Writing", description: "The same nine themes through guided writing — spelling, gap-fill, and sentence structure." },

  // French — Grade 6 (per the KICD Grade 6 French curriculum design, Revised 2024) — same 9 themes as
  // Grade 7 (Greetings and Introductions, Family, My Surroundings, Time, Fun and Enjoyment, Foods and
  // Drinks, My Body, Weather and Environment, Getting Around), informal "tu" register throughout, Upper
  // Primary basic (A1/YCT2-level) proficiency target.
  { id: "g6-fr-listening-speaking", subjectId: "french", grade: 6, name: "Listening and Speaking", description: "Greetings, family, my surroundings, time, fun and enjoyment, foods and drinks, my body, weather and environment, and getting around — oral vocabulary and expressions." },
  { id: "g6-fr-reading", subjectId: "french", grade: 6, name: "Reading", description: "The same nine themes through short French passages and reading comprehension." },
  { id: "g6-fr-writing", subjectId: "french", grade: 6, name: "Writing", description: "The same nine themes through guided writing — spelling, gap-fill, and sentence structure." },

  // French — Grade 5 (per the KICD Grade 5 French curriculum design, Revised 2024) — same 9 themes as
  // Grade 6/7 (Greetings and Introductions, Family, My Surroundings, Time, Fun and Enjoyment, Foods and
  // Drinks, My Body, Weather and Environment, Getting Around), informal "tu" register throughout, Upper
  // Primary basic (A1/YCT2-level) proficiency target.
  { id: "g5-fr-listening-speaking", subjectId: "french", grade: 5, name: "Listening and Speaking", description: "Greetings, family, my surroundings, time, fun and enjoyment, foods and drinks, my body, weather and environment, and getting around — oral vocabulary and expressions." },
  { id: "g5-fr-reading", subjectId: "french", grade: 5, name: "Reading", description: "The same nine themes through short French passages and reading comprehension." },
  { id: "g5-fr-writing", subjectId: "french", grade: 5, name: "Writing", description: "The same nine themes through guided writing — spelling, gap-fill, and sentence structure." },

  // German (per the KICD Grade 9 German curriculum design, First published 2024)
  { id: "de-listening-speaking", subjectId: "german", grade: 9, name: "Listening and Speaking", description: "Greetings, family, the countryside, routine, plans, eating out, health, environment, and directions — oral vocabulary and expressions." },
  { id: "de-reading", subjectId: "german", grade: 9, name: "Reading", description: "The same nine themes through short German passages and reading comprehension." },
  { id: "de-writing", subjectId: "german", grade: 9, name: "Writing", description: "The same nine themes through guided writing — spelling, gap-fill, and sentence structure." },

  // German — Grade 8 (per the KICD Grade 8 German curriculum design, Revised 2024) — same 9 themes as
  // Grade 9 (Greetings, Family, My Town, Time, Travel, In the Kitchen, Feelings, Weather/Environment,
  // Transport) but leans grammar/register-focused: formal "Sie" politeness register, imperative mood for
  // travel/kitchen/transport instructions, word-order/orthography drills.
  { id: "g8-de-listening-speaking", subjectId: "german", grade: 8, name: "Listening and Speaking", description: "Formal greetings, extended family, my surroundings, time, travel, the kitchen, feelings, weather, and getting around — oral vocabulary with a formal-register/imperative focus." },
  { id: "g8-de-reading", subjectId: "german", grade: 8, name: "Reading", description: "The same nine themes through short, formally-registered German passages and reading comprehension." },
  { id: "g8-de-writing", subjectId: "german", grade: 8, name: "Writing", description: "The same nine themes through guided writing — formal 'Sie' conjugation, imperative-mood sentences, and orthography drills." },

  // Mandarin (per the KICD Grade 9 Mandarin curriculum design, First published 2024)
  { id: "ma-listening-speaking", subjectId: "mandarin", grade: 9, name: "Listening and Speaking", description: "Greetings, family, the countryside, routine, plans, eating out, health, environment, and directions — oral vocabulary and expressions." },
  { id: "ma-reading", subjectId: "mandarin", grade: 9, name: "Reading", description: "The same nine themes through short Mandarin passages and reading comprehension." },
  { id: "ma-writing", subjectId: "mandarin", grade: 9, name: "Writing", description: "The same nine themes through guided writing — pinyin spelling, gap-fill, and sentence structure." },

  // Mandarin — Grade 8 (per the KICD Grade 8 Mandarin curriculum design, revised 2024) — 9 real-world
  // themes (Greetings, Family, My Surroundings, Time, Fun and Enjoyment, Foods and Drinks, My Body,
  // Weather and Environment, Getting Around).
  { id: "g8-ma-listening-speaking", subjectId: "mandarin", grade: 8, name: "Listening and Speaking", description: "Greetings, family, my surroundings, time, fun and enjoyment, foods and drinks, my body, weather and environment, and getting around — oral vocabulary and expressions." },
  { id: "g8-ma-reading", subjectId: "mandarin", grade: 8, name: "Reading", description: "The same nine themes through short Mandarin dialogues and reading comprehension." },
  { id: "g8-ma-writing", subjectId: "mandarin", grade: 8, name: "Writing", description: "The same nine themes through guided writing — pinyin spelling, gap-fill, and sentence structure." },

  // Mandarin — Grade 6 (per the KICD Grade 6 Mandarin curriculum design, revised 2024) — Upper Primary,
  // basic proficiency equivalent to A1/YCT 2 per the design's own Essence Statement. Same 9 real-world
  // themes as Grade 7/8/9 Mandarin (Greetings and Introduction, Family, My Surroundings, Time, Fun and
  // Enjoyment, Foods and Drinks, My Body, Weather and Environment, Getting Around). See
  // curriculum-reference/grade-6/mandarin.json for the full mining record.
  { id: "g6-ma-listening-speaking", subjectId: "mandarin", grade: 6, name: "Listening and Speaking", description: "Greetings, family, my surroundings, time, fun and enjoyment, foods and drinks, my body, weather and environment, and getting around — oral vocabulary and expressions." },
  { id: "g6-ma-reading", subjectId: "mandarin", grade: 6, name: "Reading", description: "The same nine themes through reading aloud (tones, pronunciation) and guided reading (vocabulary, fluency, comprehension)." },
  { id: "g6-ma-writing", subjectId: "mandarin", grade: 6, name: "Writing", description: "The same nine themes through guided writing — spelling, character recognition, stroke order, sentence structure, and handwriting." },

  // Indigenous Language (per the KICD Grade 9 Indigenous Languages curriculum design, revised 2024)
  { id: "il-listening-speaking", subjectId: "indigenous-language", grade: 9, name: "Listening and Speaking", description: "Nine real-world themes — community heroes, ICT & cyber security, serving the community, safety, cultural heritage, economic activities, first aid, indigenous literature, and Kenyan cultures — through grammar, presentation, and conversation skills." },
  { id: "il-reading", subjectId: "indigenous-language", grade: 9, name: "Reading", description: "The same nine themes through comprehension, poetry, library skills, plays, legends, and grade-appropriate texts." },
  { id: "il-writing", subjectId: "indigenous-language", grade: 9, name: "Writing", description: "The same nine themes through email and letter writing, poetry and play features, essays, homonyms, and narrative composition." },

  // Indigenous Language Grade 8 (per the KICD Grade 8 Indigenous Languages curriculum design, revised 2024) —
  // 9 real-world themes (Gender Roles, ICT/Netiquette, Wildlife, Safety at School, Common Community Values,
  // Indigenous Trade, Sports and Games, Indigenous Music, Inter-Ethnic Cohesion), each with genuinely distinct
  // content per theme, generic-English-medium since KICD doesn't prescribe a single mother tongue.
  { id: "g8-il-listening-speaking", subjectId: "indigenous-language", grade: 8, name: "Listening and Speaking", description: "Gender roles, netiquette, wildlife, school safety, community values, indigenous trade, sports and games, indigenous music, and inter-ethnic cohesion — through listening comprehension, impromptu speech, storytelling, interviews, and debate." },
  { id: "g8-il-reading", subjectId: "indigenous-language", grade: 8, name: "Reading", description: "The same nine themes through comprehension, extensive and intensive reading, library skills, poetry, and reading a play excerpt." },
  { id: "g8-il-writing", subjectId: "indigenous-language", grade: 8, name: "Writing", description: "The same nine themes through expository essays, social cards, paragraphs, process writing, poetry, dialogue, descriptive composition, songs, and posters." },

  // Indigenous Language Grade 7 (per the KICD Grade 7 Indigenous Languages curriculum design, revised 2024) —
  // 9 real-world themes (Indigenous Homes, ICT - Internet Access and Use, Safety at Home, Environmental
  // Conservation, Cultural Diversity, The Farm, Talents and Gifts, Indigenous Knowledge: Art, Patriotism),
  // each with genuinely distinct content per theme, generic-English-medium since KICD doesn't prescribe a
  // single mother tongue.
  { id: "g7-il-listening-speaking", subjectId: "indigenous-language", grade: 7, name: "Listening and Speaking", description: "Indigenous homes, ICT/internet use, safety at home, environmental conservation, cultural diversity, the farm, talents and gifts, indigenous art, and patriotism — through listening comprehension, conversational skills, riddles and tongue twisters, transcription, storytelling, and presentation skills." },
  { id: "g7-il-reading", subjectId: "indigenous-language", grade: 7, name: "Reading", description: "The same nine themes through comprehension, extensive and intensive reading, library skills, reading strategies (skimming/scanning), visuals, and trickster stories." },
  { id: "g7-il-writing", subjectId: "indigenous-language", grade: 7, name: "Writing", description: "The same nine themes through SMS and letter writing, essays, paragraphs, creative dialogue and narrative composition, and writing animal stories." },

  // Indigenous Language Grade 6 (per the KICD Grade 6 Indigenous Languages curriculum design, revised 2024) —
  // Upper Primary shape differs from Grades 7-9: 9 themes (Ceremonies and Festivals, Environmental Conservation,
  // Disaster Awareness, Peer Influence, Farm Tools, Health and Diseases, Careers and Professions, Technology,
  // Patriotism), each with exactly one Listening and Speaking / Reading / Writing sub-strand (27 total), generic-
  // English-medium since KICD doesn't prescribe a single mother tongue. See curriculum-reference/grade-6/
  // indigenous-languages.json for the full mining record.
  { id: "g6-il-listening-speaking", subjectId: "indigenous-language", grade: 6, name: "Listening and Speaking", description: "Ceremonies and festivals, environmental conservation, disaster awareness, peer influence, farm tools, health and diseases, careers and professions, technology, and patriotism — through attentive listening, active/passive voice, adjectives, pronunciation, giving directions, interrogatives, debates, direct object, and following instructions." },
  { id: "g6-il-reading", subjectId: "indigenous-language", grade: 6, name: "Reading", description: "The same nine themes through note making, reading fluency, proverbs/riddles/sayings, reading strategies, adverts, poetry composition, summarising, visuals, and extensive reading of dialogues." },
  { id: "g6-il-writing", subjectId: "indigenous-language", grade: 6, name: "Writing", description: "The same nine themes through handwriting, mechanics of writing, sequencing ideas, topical essays, creative language, poetry, narrative composition, formal letters, and apology letters." },

  // Arabic (per the KICD Grade 9 Arabic curriculum design, revised 2024)
  { id: "ar-listening-speaking", subjectId: "arabic", grade: 9, name: "Listening and Speaking", description: "Greetings, family, my surrounding, time, fun and enjoyment, food and drinks, my body, weather and environment, and getting around — oral vocabulary and expressions." },
  { id: "ar-reading", subjectId: "arabic", grade: 9, name: "Reading", description: "The same nine themes through short Arabic passages and reading comprehension." },
  { id: "ar-writing", subjectId: "arabic", grade: 9, name: "Writing", description: "The same nine themes through guided writing — romanized spelling, gap-fill, and sentence structure." },

  // Arabic — Grade 8 (per the KICD Grade 8 Arabic curriculum design, revised 2024)
  { id: "g8-ar-listening-speaking", subjectId: "arabic", grade: 8, name: "Listening and Speaking", description: "Greetings, family, my surrounding, time, fun and enjoyment, food and drinks, my body, weather and environment, and getting around — oral vocabulary and expressions." },
  { id: "g8-ar-reading", subjectId: "arabic", grade: 8, name: "Reading", description: "The same nine themes through short Arabic passages and reading comprehension." },
  { id: "g8-ar-writing", subjectId: "arabic", grade: 8, name: "Writing", description: "The same nine themes through guided writing — romanized spelling, gap-fill, and sentence structure." },

  // Arabic — Grade 7 (per the KICD Grade 7 Arabic curriculum design, revised 2024)
  { id: "g7-ar-listening-speaking", subjectId: "arabic", grade: 7, name: "Listening and Speaking", description: "Greetings, family, my surrounding, time, fun and enjoyment, food and drinks, my body, weather and environment, and getting around — oral vocabulary and expressions." },
  { id: "g7-ar-reading", subjectId: "arabic", grade: 7, name: "Reading", description: "The same nine themes through short Arabic passages and reading comprehension, including moon/sun letter pronunciation and library skills." },
  { id: "g7-ar-writing", subjectId: "arabic", grade: 7, name: "Writing", description: "The same nine themes through guided writing — spelling, punctuation, poetry, and coherent paragraphs." },

  // Arabic — Grade 6 (per the KICD Grade 6 Arabic curriculum design, Revised 2024) — same 9 themes as
  // Grade 7 (Greetings and Introduction, Family, My Surrounding, Time, Fun and Enjoyment, Food and Drinks,
  // Body Parts, Weather and Environment, Getting Around), confirmed directly from the full Grade 6 design
  // body (not just the summary table). Upper Primary basic/foundational (pre-A1, A1/YCT2-target) register:
  // Arabic signs (harakat), minimal pairs, nunation (tanween), shaddah and madda pronunciation, and simple
  // guided sentences/paragraphs rather than the more grammar-heavy Junior School treatment.
  { id: "g6-ar-listening-speaking", subjectId: "arabic", grade: 6, name: "Listening and Speaking", description: "Greetings, family, my surrounding, time, fun and enjoyment, food and drinks, body parts, weather and environment, and getting around — pronunciation, harakat signs, and simple oral vocabulary." },
  { id: "g6-ar-reading", subjectId: "arabic", grade: 6, name: "Reading", description: "The same nine themes through guided reading fluency, harakat/tanween recognition, and simple comprehension." },
  { id: "g6-ar-writing", subjectId: "arabic", grade: 6, name: "Writing", description: "The same nine themes through guided writing — handwriting, spelling, simple sentences, and short paragraphs using harakat signs." },

  // German — Grade 6 (per the KICD Grade 6 German curriculum design, Revised 2024) — same 9 themes as
  // Grade 6 French/Arabic (Greetings and Introduction, Family, My Surroundings, Time, Fun and Enjoyment,
  // Food and Drinks, My Body, Weather and Environment, Getting Around), informal "du"-form throughout.
  { id: "g6-de-listening-speaking", subjectId: "german", grade: 6, name: "Listening and Speaking", description: "Greetings, family, my surroundings, time, fun and enjoyment, food and drinks, my body, weather and environment, and getting around — oral vocabulary and simple structures (du-form)." },
  { id: "g6-de-reading", subjectId: "german", grade: 6, name: "Reading", description: "The same nine themes through guided reading fluency and simple comprehension." },
  { id: "g6-de-writing", subjectId: "german", grade: 6, name: "Writing", description: "The same nine themes through guided writing — spelling, gap-fill, and sentence structure." },
];

/** The name a subject should display as for a given grade — falls back to the subject's default `name` when
 * that grade has no override in `namesByGrade` (e.g. Grade 6 Science shows "Science & Technology", not
 * "Integrated Science"). */
export function subjectDisplayName(subject: Subject, grade?: number): string {
  if (grade != null) {
    const override = subject.namesByGrade?.[grade];
    if (override) return override;
  }
  return subject.name;
}

/** Whether a subject is actually part of the curriculum at a given grade — e.g. Pre-Technical Studies doesn't
 * exist at Grade 6 (Upper Primary), only from Grade 7 (Junior School) onward. */
export function subjectVisibleAtGrade(subject: Subject, grade?: number): boolean {
  if (grade == null) return true;
  return !subject.hiddenForGrades?.includes(grade);
}

/** Subjects to show for a given grade's nav/dashboard, with grade-appropriate display names applied. */
export function subjectsForGrade(grade: number): Subject[] {
  return SUBJECTS.filter((s) => subjectVisibleAtGrade(s, grade)).map((s) => ({ ...s, name: subjectDisplayName(s, grade) }));
}

export function subjectsWithStrands(grade: number) {
  return subjectsForGrade(grade).map((subject) => ({
    subject,
    strands: STRANDS.filter((st) => st.subjectId === subject.id && st.grade === grade),
  }));
}

export function getSubject(id: SubjectId | string, grade?: number) {
  const s = SUBJECTS.find((s) => s.id === id);
  if (!s) return undefined;
  if (grade != null && !subjectVisibleAtGrade(s, grade)) return undefined;
  return grade != null ? { ...s, name: subjectDisplayName(s, grade) } : s;
}

export function getStrand(id: string) {
  return STRANDS.find((s) => s.id === id);
}
