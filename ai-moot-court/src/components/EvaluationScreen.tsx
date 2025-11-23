import React from "react";
import { CaseData, EvaluationResponse, Message } from "../types";
import TranscriptPanel from "./TranscriptPanel";

interface Props {
  evaluation: EvaluationResponse;
  caseData: CaseData;
  messages: Message[];
  onNewSession: () => void;
  loading: boolean;
}

const EvaluationScreen: React.FC<Props> = ({
  evaluation,
  caseData,
  messages,
  onNewSession,
  loading,
}) => {
  const { scores, suggestions } = evaluation;

  return (
    <div className="grid md:grid-cols-5 gap-5">
      <div className="md:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Performance Evaluation</h2>
          <button
            type="button"
            onClick={onNewSession}
            disabled={loading}
            className="text-xs rounded-xl border border-slate-700 px-3 py-1.5 hover:border-indigo-500 hover:text-indigo-300 disabled:opacity-60"
          >
            Start New Session
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold mb-3">Scorecard</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <ScoreRow label="Legal reasoning" value={scores.legalReasoning} />
            <ScoreRow label="Precedent usage" value={scores.precedentUsage} />
            <ScoreRow label="Clarity" value={scores.clarity} />
            <ScoreRow label="Responsiveness" value={scores.responsiveness} />
            <ScoreRow
              label="Overall persuasiveness"
              value={scores.overallPersuasiveness}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold mb-2">Suggestions</h3>
          {suggestions.length === 0 ? (
            <p className="text-xs text-slate-400">
              No suggestions returned from evaluator.
            </p>
          ) : (
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {suggestions.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Transcript</h3>
          <TranscriptPanel messages={messages} />
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold mb-2">Case Recap</h3>
          <p className="text-xs text-slate-300 mb-3">{caseData.facts}</p>
          <div className="mb-3">
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Issues
            </div>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {caseData.issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-1">
              Key Precedents
            </div>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {caseData.precedents.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScoreRow: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between rounded-xl bg-slate-900/80 border border-slate-800 px-3 py-2">
    <span className="text-slate-300">{label}</span>
    <span className="font-semibold text-indigo-300">{value}/10</span>
  </div>
);

export default EvaluationScreen;
