// Shapes of the JSON the AI interview features ask Gemini to return.
// Every field is optional because the model's output is not guaranteed.

export interface ScoreBreakdown {
  overall?: number;
  content?: number;
  delivery?: number;
  structure?: number;
  confidence?: number;
}

export interface FeedbackPoint {
  category?: string;
  description?: string;
}

export interface ResponseFeedback {
  summary?: string;
  key_points?: string[];
  improvement_tips?: string[];
}

// Evaluation of a single answer (typed, spoken or on video)
export interface ResponseEvaluation {
  transcript?: string;
  score?: ScoreBreakdown;
  strengths?: FeedbackPoint[];
  weaknesses?: FeedbackPoint[];
  feedback?: ResponseFeedback;
  nonverbal_assessment?: Record<string, unknown> | string;
  visual_assessment?: Record<string, unknown> | string;
  processing_time_ms?: number;
  // Set when analysis failed and a fallback result was returned
  error?: string;
}

export interface QuestionFeedback {
  question_number?: number;
  highlights?: string;
  improvement?: string;
}

export interface OverallFeedback {
  overall_score?: {
    total?: number;
    technical_knowledge?: number;
    communication?: number;
    problem_solving?: number;
    culture_fit?: number;
  };
  summary?: string;
  key_strengths?: string[];
  key_weaknesses?: string[];
  technical_competence?: string;
  communication_skills?: string;
  visual_presentation?: string;
  question_specific_feedback?: QuestionFeedback[];
  interview_strategy_tips?: string[];
  preparation_recommendations?: string[];
  recommendations?: string[];
  hire_recommendation?: string;
}

export interface GeneratedQuestion {
  id: number;
  question: string;
  type: string;
}

// The model sometimes returns a bare number or string where an object is expected;
// normalize so the UI can rely on the object shapes above
type Loose = Record<string, unknown>;

export const normalizeEvaluation = (raw: unknown): ResponseEvaluation => {
  const e = (raw ?? {}) as Loose;
  return {
    ...(e as ResponseEvaluation),
    score: typeof e.score === "number" ? { overall: e.score } : (e.score as ScoreBreakdown | undefined),
    feedback: typeof e.feedback === "string" ? { summary: e.feedback } : (e.feedback as ResponseFeedback | undefined),
  };
};

export const normalizeOverallFeedback = (raw: unknown): OverallFeedback => {
  const f = (raw ?? {}) as Loose;
  return {
    ...(f as OverallFeedback),
    overall_score: typeof f.overall_score === "number" ? { total: f.overall_score } : (f.overall_score as OverallFeedback["overall_score"]),
  };
};
