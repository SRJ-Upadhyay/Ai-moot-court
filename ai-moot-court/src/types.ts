// src/types.ts

export type JudgeStyle = "strict" | "neutral" | "lenient";
export type Role = "petitioner" | "respondent";

export interface CaseData {
  title: string;
  facts: string;
  issues: string[];
  precedents: string[];
}

export type Sender = "student" | "judge" | "opponent";

export interface Message {
  id: string;
  sender: Sender;
  text: string;
}

export interface EvaluationScores {
  legalReasoning: number;
  precedentUsage: number;
  clarity: number;
  responsiveness: number;
  overallPersuasiveness: number;
}

export interface EvaluationResponse {
  scores: EvaluationScores;
  suggestions: string[];
}
