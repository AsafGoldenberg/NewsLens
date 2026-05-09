export type PoliticalLean =
  | "Left"
  | "Center-Left"
  | "Center"
  | "Center-Right"
  | "Right"
  | "Unclear";

export type FlaggedTerm = {
  term: string;
  reason: string;
  intensity: number;
};

export type AnalysisResult = {
  title?: string | null;
  political_lean: PoliticalLean;
  political_lean_score: number;
  emotional_language_score: number;
  flagged_terms: FlaggedTerm[];
  framing_analysis: {
    quoted_sources: string[];
    centered_perspective: string;
    missing_perspectives: string[];
  };
  missing_context: string[];
  headline_body_consistency: {
    score: number;
    explanation: string;
  };
  summary: string;
  caveat: string;
};