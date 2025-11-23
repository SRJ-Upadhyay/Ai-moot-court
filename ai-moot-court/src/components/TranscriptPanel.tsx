import React from "react";
import { Message } from "./types";

interface Props {
  messages: Message[];
}

const labelFor = (sender: Message["sender"]) =>
  sender === "student" ? "You" : sender === "judge" ? "Judge" : "Opponent";

const colorFor = (sender: Message["sender"]) => {
  switch (sender) {
    case "student":
      return "bg-indigo-500/20 border-indigo-500/60";
    case "judge":
      return "bg-rose-500/15 border-rose-500/60";
    case "opponent":
      return "bg-amber-500/15 border-amber-500/60";
  }
};

const alignFor = (sender: Message["sender"]) =>
  sender === "student" ? "items-end" : "items-start";

const TranscriptPanel: React.FC<Props> = ({ messages }) => {
  return (
    <div className="h-[420px] rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col overflow-y-auto gap-3">
      {messages.length === 0 && (
        <div className="text-sm text-slate-500 mt-10 text-center">
          No arguments yet. Start with your opening statement.
        </div>
      )}

      {messages.map((m) => (
        <div key={m.id} className={`flex ${alignFor(m.sender)}`}>
          <div
            className={`max-w-[80%] rounded-2xl border px-3 py-2 text-sm ${colorFor(
              m.sender
            )}`}
          >
            <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
              {labelFor(m.sender)}
            </div>
            <div className="whitespace-pre-wrap">{m.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptPanel;
