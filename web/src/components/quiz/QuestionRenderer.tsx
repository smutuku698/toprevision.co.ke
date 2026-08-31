import type { Question } from "@/lib/types";
import type { AnswerValue } from "@/lib/validate";
import { MultipleChoiceView } from "./views/MultipleChoiceView";
import { FillBlankView } from "./views/FillBlankView";
import { ClickMatchView } from "./views/ClickMatchView";
import { CategorizeView } from "./views/CategorizeView";
import { OrderingView } from "./views/OrderingView";
import { HotspotView } from "./views/HotspotView";
import { NumberLineView } from "./views/NumberLineView";
import { ProtractorView } from "./views/ProtractorView";
import { CoordinatePlotView } from "./views/CoordinatePlotView";
import { SolidRotateView } from "./views/SolidRotateView";

export function QuestionRenderer({
  question,
  answer,
  onChange,
  submitted,
  correct,
}: {
  question: Question;
  answer: AnswerValue;
  onChange: (a: AnswerValue) => void;
  submitted: boolean;
  correct: boolean | null;
}) {
  switch (question.kind) {
    case "multiple-choice":
      return (
        <MultipleChoiceView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "multiple-choice" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
    case "fill-blank":
      return (
        <FillBlankView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "fill-blank" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
    case "click-match":
      return (
        <ClickMatchView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "click-match" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
    case "categorize":
      return (
        <CategorizeView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "categorize" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
    case "ordering":
      return (
        <OrderingView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "ordering" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
    case "hotspot":
      return (
        <HotspotView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "hotspot" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
    case "number-line":
      return (
        <NumberLineView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "number-line" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
    case "protractor":
      return (
        <ProtractorView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "protractor" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
    case "coordinate-plot":
      return (
        <CoordinatePlotView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "coordinate-plot" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
    case "solid-rotate":
      return (
        <SolidRotateView
          question={question}
          answer={answer as Extract<AnswerValue, { kind: "solid-rotate" }>}
          onChange={onChange}
          submitted={submitted}
          correct={correct}
        />
      );
  }
}
