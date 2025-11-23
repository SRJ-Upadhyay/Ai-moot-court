import React, { useState, useEffect, useRef } from "react";
import { Gavel, Scale, Scroll, Send, User, Shield, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";

// --- CONFIGURATION ---
// In a real app, you would use import.meta.env.VITE_N8N_URL or process.env
// We are using a hardcoded string here to prevent build errors in the preview environment.
const BASE_URL = "https://YOUR_N8N_URL/webhook";

// --- TYPES (Inlined to ensure self-containment) ---

export type JudgeStyle = "strict" | "neutral" | "lenient";
export type Role = "petitioner" | "respondent";
export type Sender = "student" | "judge" | "opponent";

export interface CaseData {
  title: string;
  facts: string;
  issues: string[];
  precedents: string[];
}

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

type Phase = "setup" | "courtroom" | "evaluation";

// --- HELPER FUNCTIONS ---

const createSessionId = () =>
  `sess_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

const buildTranscript = (messages: Message[]): string =>
  messages
    .map((m) => {
      const label =
        m.sender === "student"
          ? "STUDENT"
          : m.sender === "judge"
          ? "JUDGE"
          : "OPPONENT";
      return `[${label}] ${m.text}`;
    })
    .join("\n");

// --- COMPONENTS ---

// 1. SETUP SCREEN COMPONENT
interface SetupScreenProps {
  loading: boolean;
  onStart: (caseId: string, role: Role, judgeStyle: JudgeStyle) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ loading, onStart }) => {
  const [caseId, setCaseId] = useState("case_001"); // Default or input
  const [role, setRole] = useState<Role>("petitioner");
  const [judgeStyle, setJudgeStyle] = useState<JudgeStyle>("neutral");

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-white">Configure Your Session</h2>
        <p className="text-slate-400">Select your case parameters to begin the simulation.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Case ID Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Case Identifier</label>
          <input
            type="text"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            placeholder="e.g. freedom_of_speech_v_state"
          />
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Your Role</label>
          <div className="grid grid-cols-2 gap-4">
            {(["petitioner", "respondent"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  role === r
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="capitalize">{r}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Judge Style Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Judge Persona</label>
          <div className="grid grid-cols-3 gap-3">
            {(["strict", "neutral", "lenient"] as JudgeStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setJudgeStyle(s)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  judgeStyle === s
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <span className="capitalize">{s}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStart(caseId, role, judgeStyle)}
          disabled={loading || !caseId}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Enter Courtroom</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// 2. COURTROOM SCREEN COMPONENT
interface CourtroomScreenProps {
  loading: boolean;
  caseData: CaseData;
  role: Role;
  judgeStyle: JudgeStyle;
  messages: Message[];
  onSendUtterance: (text: string) => void;
  onEndSession: () => void;
  onReset: () => void;
}

const CourtroomScreen: React.FC<CourtroomScreenProps> = ({
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
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendUtterance(input);
    setInput("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Sidebar: Case Info */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Scroll className="w-4 h-4 text-indigo-400" />
            Case File
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</h4>
            <p className="text-slate-200 font-medium">{caseData.title}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Facts</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{caseData.facts}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Precedents</h4>
            <ul className="space-y-2">
              {caseData.precedents.map((p, i) => (
                <li key={i} className="text-xs bg-slate-950 p-2 rounded border border-slate-800 text-slate-300">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
            <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Role: <strong className="text-slate-300 capitalize">{role}</strong></span>
                <span>Style: <strong className="text-slate-300 capitalize">{judgeStyle}</strong></span>
            </div>
        </div>
      </div>

      {/* Right: Chat Area */}
      <div className="lg:col-span-2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                    <Gavel className="w-12 h-12 mb-3 opacity-20" />
                    <p>The court is in session. Present your opening statement.</p>
                </div>
            )}
          {messages.map((msg) => {
            const isStudent = msg.sender === "student";
            return (
              <div
                key={msg.id}
                className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    isStudent
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : msg.sender === 'judge' 
                        ? "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
                        : "bg-red-900/30 text-red-200 border border-red-900/50 rounded-tl-none"
                  }`}
                >
                  <div className="text-xs font-bold mb-1 opacity-50 uppercase tracking-wide">
                    {msg.sender}
                  </div>
                  {msg.text}
                </div>
              </div>
            );
          })}
          {loading && (
             <div className="flex justify-start animate-pulse">
                <div className="bg-slate-800 h-10 w-24 rounded-2xl rounded-tl-none"></div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your argument..."
              disabled={loading}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-3 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3">
            <button onClick={onReset} className="text-xs text-slate-500 hover:text-slate-400">
                Abort Session
            </button>
            <button 
                onClick={onEndSession}
                className="text-xs flex items-center gap-1 bg-emerald-900/30 text-emerald-400 px-3 py-1.5 rounded border border-emerald-900/50 hover:bg-emerald-900/50 transition-colors"
            >
                <Gavel className="w-3 h-3" />
                Rest Case & Get Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. EVALUATION SCREEN COMPONENT
interface EvaluationScreenProps {
  evaluation: EvaluationResponse;
  caseData: CaseData;
  messages: Message[]; // Not used in UI but useful if we wanted to show transcript
  onNewSession: () => void;
  loading: boolean;
}

const EvaluationScreen: React.FC<EvaluationScreenProps> = ({
  evaluation,
  onNewSession,
}) => {
  const ScoreCard = ({ label, score }: { label: string; score: number }) => (
    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
      <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{score}<span className="text-sm text-slate-600 font-normal">/10</span></div>
      <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
        <div 
            className="bg-indigo-500 h-full rounded-full" 
            style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
       <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-white">Session Evaluation</h2>
        <p className="text-slate-400">Here is the judge's assessment of your performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ScoreCard label="Legal Reasoning" score={evaluation.scores.legalReasoning} />
        <ScoreCard label="Precedent Usage" score={evaluation.scores.precedentUsage} />
        <ScoreCard label="Clarity" score={evaluation.scores.clarity} />
        <ScoreCard label="Responsiveness" score={evaluation.scores.responsiveness} />
        <div className="md:col-span-2 lg:col-span-2 bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg flex items-center justify-between">
            <div>
                <div className="text-indigo-300 text-xs uppercase tracking-wider font-semibold mb-1">Overall Persuasiveness</div>
                <div className="text-3xl font-bold text-white">{evaluation.scores.overallPersuasiveness}<span className="text-lg text-indigo-400/60">/10</span></div>
            </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Feedback & Suggestions
        </h3>
        <ul className="space-y-3">
            {evaluation.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                    </span>
                    {suggestion}
                </li>
            ))}
        </ul>
      </div>

      <div className="flex justify-center">
        <button 
            onClick={onNewSession}
            className="bg-white text-slate-900 hover:bg-slate-200 font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
        >
            <RefreshCw className="w-4 h-4" />
            Start New Session
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [phase, setPhase] = useState<Phase>("setup");

  // State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [judgeStyle, setJudgeStyle] = useState<JudgeStyle | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- API calls ----

  const startSession = async (
    selectedCaseId: string,
    selectedRole: Role,
    selectedJudgeStyle: JudgeStyle
  ) => {
    try {
      setError(null);
      setLoading(true);

      // Using inlined BASE_URL
      const newSessionId = createSessionId();
      const res = await fetch(`${BASE_URL}/moot/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: newSessionId,
          caseId: selectedCaseId,
          role: selectedRole,
          judgeStyle: selectedJudgeStyle,
        }),
      });

      if (!res.ok) throw new Error(`Start session failed: ${res.status}`);

      const data = await res.json();

      setSessionId(data.sessionId);
      setCaseId(data.caseId);
      setCaseData(data.case);
      setRole(data.role);
      setJudgeStyle(data.judgeStyle);
      setMessages([]);
      setEvaluation(null);
      setPhase("courtroom");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  };

  const sendUtterance = async (studentText: string) => {
    if (!sessionId || !caseId || !role || !judgeStyle) return;

    const newStudentMessage: Message = {
      id: crypto.randomUUID(),
      sender: "student",
      text: studentText,
    };

    const updatedMessages = [...messages, newStudentMessage];
    setMessages(updatedMessages);

    try {
      setError(null);
      setLoading(true);

      const transcript = buildTranscript(updatedMessages);

      const res = await fetch(`${BASE_URL}/moot/utterance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          caseId,
          role,
          judgeStyle,
          transcript,
          lastStudentUtterance: studentText,
        }),
      });

      if (!res.ok) throw new Error(`Utterance failed: ${res.status}`);

      const data = await res.json();

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        sender: data.speaker === "judge" ? "judge" : "opponent",
        text: data.text,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send argument");
    } finally {
      setLoading(false);
    }
  };

  const getEvaluation = async () => {
    if (!sessionId || !caseId || !role) return;

    try {
      setError(null);
      setLoading(true);

      const transcript = buildTranscript(messages);

      const res = await fetch(`${BASE_URL}/moot/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          caseId,
          role,
          transcript,
        }),
      });

      if (!res.ok) throw new Error(`Evaluation failed: ${res.status}`);

      const data: EvaluationResponse = await res.json();
      setEvaluation(data);
      setPhase("evaluation");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to get evaluation");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setPhase("setup");
    setSessionId(null);
    setCaseId(null);
    setCaseData(null);
    setRole(null);
    setJudgeStyle(null);
    setMessages([]);
    setEvaluation(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-indigo-500/30">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight">
              AI Moot Court
            </h1>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Powered by n8n + GPT
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 px-4 py-3 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {phase === "setup" && (
          <SetupScreen loading={loading} onStart={startSession} />
        )}

        {phase === "courtroom" && caseData && role && judgeStyle && (
          <CourtroomScreen
            loading={loading}
            caseData={caseData}
            role={role}
            judgeStyle={judgeStyle}
            messages={messages}
            onSendUtterance={sendUtterance}
            onEndSession={getEvaluation}
            onReset={resetAll}
          />
        )}

        {phase === "evaluation" && evaluation && caseData && (
          <EvaluationScreen
            evaluation={evaluation}
            caseData={caseData}
            messages={messages}
            onNewSession={resetAll}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
};

export default App;