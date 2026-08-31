# CBC Quizmaster — repo-wide standing rules

The app itself lives in `web/` (see `web/CLAUDE.md` / `web/AGENTS.md` for Next.js-specific notes). The rules
below apply repo-wide, especially to any curriculum/content/skill-generation work, and must be followed
without being re-asked.

## Curriculum content generation — mandatory reading before any subject/grade work

1. **`designs/` holds the official KICD curriculum design PDFs — always the data source, provided by the
   user.** Check `designs/` before ever web-searching curriculum content for any subject/grade.
2. **`curriculum-reference/CURRICULUM-MINING-GUIDE.md` is mandatory reading before writing or auditing any
   skill's `generate()`, and before writing/updating any `curriculum-reference/<grade>/<subject>.json`.** It
   governs full-depth extraction from the design PDFs — every enumerated list, explicit inclusion/exclusion,
   cross-link, and assessment-rubric signal in a sub-strand, not just its headline outcome text. This was
   written after Grade 7 Integrated Science's SI.3 sub-strand shipped covering 5 of 7 SI units and 3 of 7
   basic science skills the source design actually names — a content-breadth gap, not a data-availability one.
3. **`curriculum-reference/SKILL-QUALITY-STANDARDS.md`** governs interaction-kind variety (every skill should
   branch across 2+ `QuestionKind`s where content allows) — a separate, equally mandatory axis from content
   breadth.
4. **`Assests-svg/` + the root "more about svg usage per cbc curriculum" design doc** must both be checked
   before any decision about SVG/visual scope for a skill.
5. **`curriculum-reference/RIGOR-STANDARDS.md` is mandatory reading before writing or editing any skill's
   question templates or distractor pools.** It governs cognitive rigor — Bloom's-tier targeting driven by
   each sub-strand's "Core competencies to be developed," a Scenario+Hook structure for Apply/Analyze/Evaluate
   questions, and a plausible-distractor rule (wrong answers must reflect a real, nameable misconception —
   never an unconstrained random draw from a large/heterogeneous pool, which is eliminable on sight without
   any topic knowledge). Written after user feedback that many shipped questions were answerable by
   elimination alone. **It also governs repetition, as a permanent, non-negotiable numeric standard (added
   2026-08-17, "the standard forever" — applies to every subject/grade built from now on, not just what's
   already shipped):** no branch may ever return a single static hardcoded template; every branch needs 10+
   distinct templates as the target and **5 as an absolute hard floor that may never be gone below**; and any
   named entity (a tool, fact, or object) that recurs across 2+ branches within a skill must be given **at
   least 4 genuinely different real-world framings**, never the same example copy-pasted into every branch it
   appears in. See that file's "Minimum pool-size floor" section for the full detail and the worked
   `leversInEverydayLife.ts` tweezers example. **Two further permanent sub-rules under this same standard
   (added 2026-08-17, same "forever" status, found via live browser testing that slipped past the rules
   above):**
   - **A `categorize`/`click-match` branch must sample a *subset* of its fact pool each generation — never
     `shuffle(rng, POOL)` with no `.slice(...)` after it, even once the pool clears the 10+ floor.** Including
     every entry every time means the question is the same set of facts re-ordered, which reads as an
     identical repeat to a learner and evades the session dedup (whose signature is order-sensitive for any
     field built by concatenating the pool into one string, e.g. `explanation: chosen.map(...).join(" ")`).
     Always slice to a subset strictly smaller than the pool.
   - **NO EXCEPTIONS, EVERY SKILL, FOREVER: a branch's `prompt` text must itself be drawn from a pool
     whenever it would otherwise be one fixed string — target 20+ distinct phrasings (matching
     `SESSION_LENGTH = 20` in `PracticeSession.tsx`, so a single session is very unlikely to exhaust a pool
     and land on a real repeat), with **10 as the absolute hard floor that may never be gone below** (raised
     2026-08-17, same session, from an initial 5+, which the user judged too low once they connected it to
     the 20-question session length). This is checked on every single skill written from this point forward,
     with zero exceptions, the same way the 10+/5-floor content pool is. Varying the facts inside a question
     is not sufficient if the question's own wording is byte-identical every time that branch is picked —
     that still "feels the same" on repeat viewing, which is exactly what defeats content variety from the
     learner's side even when the author did the content work correctly. Wrap static prompt strings in a
     small `randChoice(rng, [...])` pool of reworded variants — see `web/src/skills/agricultureG6/rearingSmallDomesticAnimals.ts`,
     already updated to this 20+/10-floor standard (its four flat prompt pools each carry 20 hand-authored
     phrasings; its two scenario branches use the composition technique below to reach 24 frame-skeletons
     each), for the current worked example.
     **Affordable way to reach 20+ without hand-writing 20 fully bespoke sentences:** compose two small
     orthogonal pools instead of one big flat one — e.g. a 5-phrasing "opener" pool × a 4-phrasing "closer"
     pool multiplies out to 20 combinations, or for scenario/frame-based branches, a small pool of narrative
     openers combined with a small pool of closing-question phrasings the same way. This is cheaper to author
     and review than 20 independently-invented sentences and is the preferred technique going forward,
     including for frame-template branches (which previously only targeted 5-6 frames — apply the same
     20+/10-floor numbers there too, via composition rather than 20 fully bespoke frame functions).
     A second, related failure mode found in the reference file: even branches that already vary their
     wording across a small frame pool can still glue one fixed topic-anchor phrase into *every* frame (e.g.
     every reasoning frame said "...is reviewing their **animal care routine**..." or "...keeps **small
     domestic animals**...") — so the same keyword recurs in 100% of that branch's output regardless of which
     underlying fact was picked. Vary the anchor phrasing itself across frames/openers (synonyms,
     restructured sentences, dropping the anchor phrase entirely in some), not just the name/place swapped
     into an otherwise-fixed lead-in. This is part of the "repetition-defense" axis in the five-checks summary
     below, not a separate axis — check it alongside the pool-size-floor and full-pool-subset rules every
     time, on every skill, no exceptions.
     **Belt-and-suspenders engine backstop (added 2026-08-17, same session, see the engine-level paragraph below):**
     `PracticeSession.tsx` now also tracks every `prompt` string shown so far this session and re-rolls
     (bounded, 30 attempts) rather than repeat one — so even a pool that isn't quite at 20 yet still won't
     produce a felt repeat within one sitting unless its branch is drawn more times than it has distinct
     phrasings for. This backstop does not lower the authoring bar above; it's a safety net under it, not a
     replacement for it.
     **Retroactive-sweep status (found 2026-08-17 via user report on Grade 6 Agriculture "Rearing Small
     Domestic Animals" — screenshots showed the exact stem "Sort each fact by the routine practice it
     describes." recurring verbatim across a single 20-question session even though the sorted content
     underneath genuinely varied; a repo-wide grep the same day found ~1,200 pre-existing skill files with
     this pattern): the retroactive fix across already-shipped skills is a deliberately paused, separate
     project — see [[project_prompt_stem_sweep_progress]] in memory for live status and how to resume it.
     User decision 2026-08-17: finish building the remaining subjects/grades first (with this rule applied
     from day one on every new skill, per the "no exceptions, forever" line above), then resume the
     retroactive sweep once the whole curriculum build is done — do not restart the sweep unprompted. Note
     the ~300 files already swept (waves 1-3, earlier the same day) were built to the original 5-8-phrasing
     bar, not the later-same-day 20+/10-floor raise — when the sweep resumes, either bump those to 20+ in a
     follow-up pass or accept them as already-adequate given the engine backstop; this hasn't been decided,
     ask the user.

These five checks (content breadth, kind variety, visual coverage, cognitive rigor, repetition-defense) are
independent — passing one does not imply the others. Run all five for every skill touched, whether newly built
or re-opened for any reason.

**Separately, at the engine level (not a per-skill check — structural, already live, must never regress):**
`web/src/components/quiz/PracticeSession.tsx` tracks, unbounded for the whole session (not a trailing
window), both (a) every full question signature shown so far and (b) every exact `prompt` string shown so
far, and re-rolls (bounded, 30 attempts) rather than repeat either one within that session. (b) was added
2026-08-17, same session as (a)'s unbounded-tracking fix: (a) alone lets two questions with completely different content still show the identical
instruction line, since a full-signature diff is dominated by the other content fields — the user reported
this as "the version/template/answer type all change but the main question stem keeps repeating," which (a)
does not catch but (b) does. This protects every skill automatically, including ones not yet swept for
20+-phrasing pools, and needs no per-skill work — but if this file is ever touched again: do not reintroduce
a bounded/trailing window (e.g. "last N questions") in place of whole-session tracking for either (a) or (b)
— that regresses to merely *spacing* repeats apart rather than actually preventing them within a sitting,
which was already tried for (a), found insufficient, and corrected once (2026-08-17); and do not drop (b) or
merge it back into (a) — they catch different failure modes and both are required.

When `designs/*.pdf` needs to be read directly: use the `Read` tool **without** a `pages` parameter. This
environment has no `pdftoppm`/poppler installed, so page-range rendering always fails; a plain `Read` call
extracts full page text natively and works reliably.
