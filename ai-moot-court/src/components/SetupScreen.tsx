import React, { useState } from "react";
import type{ JudgeStyle, Role } from "./types";

interface Props {
  loading: boolean;
  onStart: (caseId: string, role: Role, judgeStyle: JudgeStyle) => void;
}

const SetupScreen: React.FC<Props> = ({ loading, onStart }) => {
  const [caseId, setCaseId] = useState("case_1");
  const [role, setRole] = useState<Role>("petitioner");
  const [judgeStyle, setJudgeStyle] = useState<JudgeStyle>("neutral");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(caseId, role, judgeStyle);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Start a New Session</h2>
        <p className="text-slate-400 text-sm">
          Practice your advocacy with an AI Judge and AI Opponent. Choose a
          case, your role, and a judging style.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Case Scenario
          </label>
          <select
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
          >
            <option value="case_1">
              Case 1 – Reservation Policy Challenge
            </option>
            <option value="case_2">
              Case 2 – Free Speech vs Public Order
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your Role</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("petitioner")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                role === "petitioner"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-200"
                  : "border-slate-700 bg-slate-900 hover:border-slate-500"
              }`}
            >
              Petitioner
            </button>
            <button
              type="button"
              onClick={() => setRole("respondent")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                role === "respondent"
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-200"
                  : "border-slate-700 bg-slate-900 hover:border-slate-500"
              }`}
            >
              Respondent
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Judge Style
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(["strict", "neutral", "lenient"] as JudgeStyle[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setJudgeStyle(style)}
                className={`rounded-xl border px-2 py-2 capitalize ${
                  judgeStyle === style
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-200"
                    : "border-slate-700 bg-slate-900 hover:border-slate-500"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-sm font-medium py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Starting..." : "Start Session"}
        </button>
      </form>
    </div>
  );
};

export default SetupScreen;
