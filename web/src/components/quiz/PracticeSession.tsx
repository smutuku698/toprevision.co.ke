"use client";

import { useEffect, useRef, useState } from "react";
import { makeRng } from "@/lib/rng";
import { checkAnswer, emptyAnswer, isAnswerReady, type AnswerValue } from "@/lib/validate";
import { getSkillProgress, nextSmartScore, saveSkillProgress, useSkillProgress } from "@/lib/session";
import type { Question, Skill } from "@/lib/types";
import { QuestionRenderer } from "./QuestionRenderer";
import { SidebarStats } from "./SidebarStats";
import { SessionSummary } from "./SessionSummary";
import { Visual } from "@/components/visuals/Visual";
import { MathText } from "@/components/math/MathText";

const SESSION_LENGTH = 20;
const ENCOURAGEMENTS = ["Nice work!", "Great job!", "You've got it!", "Superb!", "Well done!", "Excellent!", "Keep it up!"];
const TRY_AGAIN = ["Not quite — see how to solve it below.", "Close! Check the explanation.", "Keep going, you'll get the next one."];

// A skill's generate() picks its branch (and therefore its QuestionKind)
// independently every call, so back-to-back identical kinds happen by pure
// chance — students perceive that as "it keeps asking me the same type of
// question" even when the skill has 4-5 kinds designed in. Re-roll (bounded)
// whenever the fresh draw matches the immediately preceding kind.
//
// That alone isn't enough: some branches are near-static templates (fixed
// prompt, fixed item pool, only the shuffle order varies — e.g. an ordering
// question over a fixed list of steps). Uniform branch selection means a
// 20-question session can land on the *exact same* template 3-4 times, which
// reads to a student as a blatant duplicate even though the "kind" rule was
// satisfied. Guard against that by also avoiding any signature seen earlier
// in this session, not just the immediately preceding kind.
//
// Deliberately unbounded for the whole session (not a trailing window): a
// bounded window only spaces repeats out (they can still recur once they
// age out of the window) rather than actually preventing them within a
// session. Now that every branch is required to carry 10+ (target 20+)
// distinct templates, and every prompt-wording pool separately targets 20+
// phrasings, a 20-question session only draws a handful of times per branch
// on average, so unbounded tracking is safe — content only ever repeats once
// a branch's entire distinct pool has genuinely been exhausted within the
// session, which is the true floor, not an arbitrary window size.
// Deliberately generic rather than an allowlist of known fields: different
// QuestionKinds carry their distinguishing content in different places
// (choices/tokens/targets/items for some, before/correctAnswer for
// fill-blank, etc.), and a curated field list silently drops whichever kind
// isn't covered — collapsing every instance of that kind to one signature
// and defeating the dedup entirely. Walking every leaf value sidesteps that.
function questionSignature(q: Question): string {
  const leaves: string[] = [];
  function walk(v: unknown) {
    if (v === null || v === undefined) return;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      leaves.push(String(v));
    } else if (Array.isArray(v)) {
      v.forEach(walk);
    } else if (typeof v === "object") {
      Object.values(v as Record<string, unknown>).forEach(walk);
    }
  }
  walk(q);
  return `${q.kind}::${leaves.sort().join("|")}`;
}

// A full-signature repeat is the obvious case, but it's not the only one a
// student notices: two questions can differ completely in content (different
// facts, different correct answer, different choices) and still both draw the
// exact same `prompt` string out of a skill's phrasing pool — the visible
// instruction line repeats even though nothing else does, which reads as "it
// keeps asking me the same question" just as strongly as a true duplicate.
// Track prompts seen this session separately from full signatures and treat
// an exact prompt repeat as its own rejection reason during the re-roll.
function generateFreshQuestion(
  skill: Skill,
  avoidKind: Question["kind"] | undefined,
  recentSignatures: string[],
  usedPrompts: string[]
): Question {
  let q = skill.generate(makeRng());
  let attempts = 0;
  while (
    attempts < 30 &&
    (q.kind === avoidKind || recentSignatures.includes(questionSignature(q)) || usedPrompts.includes(q.prompt))
  ) {
    q = skill.generate(makeRng());
    attempts++;
  }
  return q;
}

export function PracticeSession({ skill, backHref, backLabel }: { skill: Skill; backHref: string; backLabel: string }) {
  // Questions are generated with Math.random() under the hood, which must
  // never run during SSR — otherwise the server-rendered question and the
  // client's first render pick different random numbers and React throws a
  // hydration mismatch. So we start with `question: null` (renders the same
  // loading state on server and client) and only roll the dice client-side.
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<AnswerValue | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1); // 1..SESSION_LENGTH
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState<"playing" | "summary">("playing");
  const recentSignatures = useRef<string[]>([]);
  const usedPrompts = useRef<string[]>([]);

  function rememberSignature(q: Question) {
    recentSignatures.current = [...recentSignatures.current, questionSignature(q)];
    usedPrompts.current = [...usedPrompts.current, q.prompt];
  }

  // Persisted mastery lives outside React (localStorage); read it reactively
  // instead of copying it into local state on mount.
  const smartScore = useSkillProgress(skill.id).smartScore;

  function startSession() {
    recentSignatures.current = [];
    usedPrompts.current = [];
    const q = generateFreshQuestion(skill, undefined, recentSignatures.current, usedPrompts.current);
    rememberSignature(q);
    setQuestion(q);
    setAnswer(emptyAnswer(q));
    setSubmitted(false);
    setCorrect(null);
    setQuestionNumber(1);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setElapsed(0);
    setShowHint(false);
    setPhase("playing");
  }

  useEffect(() => {
    // startSession() rolls the first question via Math.random(), which must
    // never run during SSR — see the comment on `question` above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill]);

  useEffect(() => {
    if (phase !== "playing") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [skill.id, phase]);

  function handleSubmit() {
    if (!question || !answer || submitted || !isAnswerReady(question, answer)) return;
    const isCorrect = checkAnswer(question, answer);
    const newStreak = isCorrect ? streak + 1 : 0;
    const prev = getSkillProgress(skill.id);
    const newScore = nextSmartScore(prev.smartScore, isCorrect, streak);

    setCorrect(isCorrect);
    setSubmitted(true);
    if (isCorrect) setCorrectCount((c) => c + 1);
    setStreak(newStreak);
    setBestStreak((b) => Math.max(b, newStreak));

    saveSkillProgress({
      skillId: skill.id,
      smartScore: newScore,
      bestStreak: Math.max(newStreak, prev.bestStreak),
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswered: prev.correctAnswered + (isCorrect ? 1 : 0),
      lastPlayedAt: Date.now(),
    });
  }

  function handleNext() {
    if (questionNumber >= SESSION_LENGTH) {
      setPhase("summary");
      return;
    }
    const q = generateFreshQuestion(skill, question?.kind, recentSignatures.current, usedPrompts.current);
    rememberSignature(q);
    setQuestion(q);
    setAnswer(emptyAnswer(q));
    setSubmitted(false);
    setCorrect(null);
    setShowHint(false);
    setQuestionNumber((n) => n + 1);
  }

  if (phase === "summary") {
    return (
      <SessionSummary
        correctCount={correctCount}
        total={SESSION_LENGTH}
        elapsedSeconds={elapsed}
        bestStreak={bestStreak}
        smartScore={smartScore}
        onPracticeAgain={startSession}
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  const message =
    correct === true
      ? ENCOURAGEMENTS[questionNumber % ENCOURAGEMENTS.length]
      : correct === false
      ? TRY_AGAIN[questionNumber % TRY_AGAIN.length]
      : "";

  if (!question || !answer) {
    return (
      <div className="flex-1 bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex-1 space-y-4">
            <div className="h-64 animate-pulse rounded-2xl bg-white/70 p-5 shadow-sm sm:p-8" />
          </div>
          <div className="h-64 w-full shrink-0 animate-pulse rounded-2xl bg-white/70 sm:w-56" />
        </div>
      </div>
    );
  }

  const isLastQuestion = questionNumber >= SESSION_LENGTH;

  return (
    <div className="flex-1 bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Question {questionNumber} of {SESSION_LENGTH}
              </span>
              {question.hint && (
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700"
                >
                  💡 {showHint ? "Hide hint" : "Show a hint"}
                </button>
              )}
            </div>

            {question.passage && (
              <div className="mb-4 whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                {question.passage}
              </div>
            )}

            <div className="mb-5 flex items-start gap-2">
              {question.speakable && <span className="mt-0.5 text-sky-500">🔊</span>}
              <p className="whitespace-pre-line text-lg font-bold text-slate-800">
                <MathText text={question.prompt} />
              </p>
            </div>

            {showHint && question.hint && (
              <p className="mb-4 rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700">
                <MathText text={question.hint} />
              </p>
            )}

            {question.visual && question.kind !== "hotspot" && (
              <div className="mb-5 flex justify-center">
                <Visual spec={question.visual} />
              </div>
            )}

            <QuestionRenderer question={question} answer={answer} onChange={setAnswer} submitted={submitted} correct={correct} />

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {!submitted ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isAnswerReady(question, answer)}
                  className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-sky-700"
                >
                  {isLastQuestion ? "Finish session →" : "Next question →"}
                </button>
              )}

              {submitted && (
                <span
                  className={`animate-pop-in flex items-center gap-1.5 text-sm font-bold ${
                    correct ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {correct ? "🎉" : "❌"} {message}
                </span>
              )}
            </div>

            {submitted && question.explanation && (
              <div
                className={`mt-4 animate-pop-in rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                  correct ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                <p className="mb-1 font-bold">{correct ? "Why this works" : "How to solve it"}</p>
                <p>
                  <MathText text={question.explanation} />
                </p>
              </div>
            )}
          </div>

          <p className="px-1 text-xs text-slate-400">
            Every question is generated fresh from a math/language template — each of the 20 questions in this
            session uses new numbers and wording.
          </p>
        </div>

        <SidebarStats
          questionsAnswered={questionNumber}
          sessionTotal={SESSION_LENGTH}
          elapsedSeconds={elapsed}
          smartScore={smartScore}
          streak={streak}
        />
      </div>
    </div>
  );
}
