import type { AnswerValue } from "@/lib/validate";

export interface ViewProps<Q, A extends AnswerValue> {
  question: Q;
  answer: A;
  onChange: (a: A) => void;
  submitted: boolean;
  correct: boolean | null;
}
