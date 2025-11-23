import React, { useState } from "react";
import type { CaseData, JudgeStyle, Message, Role } from "./types";

import TranscriptPanel from "./TranscriptPanel";

interface Props {
  loading: boolean;
  caseData: CaseData;
  role: Role;
  judgeStyle: JudgeStyle;
  messages: Message[];
  onSendUtterance: (text: string) => Promise<void> | void;
  onEndSession: () => Promise<void> | void;
  onReset: () => void;
}

const CourtroomScreen: React.FC<Props> = ({
  loading,
  caseData,
  role,
  judgeStyle,
  messages,
  onSendUtterance,
  onEndSession,
  onReset,
}) => {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    await onSendUtterance(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="grid md:grid-cols-5 gap-5">
      <div className="md:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Live Courtroom</h2>
          <span className="text-xs text-slate-400">
            Role:{" "}
            <span className="capitalize text-slate-200 font-medium">
              {role}
            </span>{" "}
            • Judge:{" "}
            <span className="capitalize text-slate-200 font-medium">
              {judgeStyle}
            </span>
          </span>
        </div>

        <TranscriptPanel messages={messages} />

        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">
            Your argument (Ctrl+Enter to send)
          </label>
          <textarea
            className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
            placeholder="Address the Bench. Example: 'My Lords, the core issue in this case is...'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-sm font-medium py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Waiting for Bench..." : "Send Argument"}
            </button>

            <button
              type="button"
              onClick={() => onEndSession()}
              disabled={messages.length === 0 || loading}
              className="px-4 py-2 rounded-xl border border-slate-600 text-xs text-slate-200 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              End Session & Evaluate
            </button>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 space-y-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold mb-2">
            Case: {caseData.title}
          </h3>
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
              Suggested Precedents
            </div>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {caseData.precedents.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="w-full text-xs rounded-xl border border-slate-700 text-slate-300 py-2 hover:border-red-500 hover:text-red-300"
        >
          Abort Session & Start Over
        </button>
      </div>
    </div>
  );
};

export default CourtroomScreen;
