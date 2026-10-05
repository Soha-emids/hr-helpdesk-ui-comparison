import React, { useState } from "react";
import {
  Sparkles, MessageSquare, Ticket, BookOpen, Send, Search,
  ChevronRight, Tag, Users, Clock, ShieldCheck, FileText, CheckCircle2,
  CircleDot, Plus, X, Bot, Layers,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 *  HR Help Desk — "concierge green" people-first identity
 *  Warm = employee-facing (instant answers) · Cool = agent/ops layer
 * ------------------------------------------------------------------ */

const INK = "#1C2A29";
const TEAL = "#1E6E64";
const APRICOT = "#E8704A";
const IRIS = "#5D5F9E";
const HAIRLINE = "#E5DFD3";
const PAPER = "#F5F2EC";
const PAPER_TINT = "#EFEBE2";

const baseStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600;700&display=swap');
  .hd-font { font-family: 'Instrument Sans', system-ui, sans-serif; }
  .hd-display { font-family: 'Fraunces', serif; }
  .hd-fade { animation: hdFade .5s ease both; }
  @keyframes hdFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  .hd-pop { animation: hdPop .35s ease both; }
  @keyframes hdPop { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: scale(1); } }
  @media (prefers-reduced-motion: reduce) { .hd-fade, .hd-pop { animation: none; } }
  .hd-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
  .hd-scroll::-webkit-scrollbar-thumb { background: #D8D0C0; border-radius: 999px; }
  .hd-scroll::-webkit-scrollbar-track { background: transparent; }
  .typing-dot { width: 6px; height: 6px; border-radius: 999px; display: inline-block; animation: hdTyping 1.1s infinite ease-in-out; }
  .typing-dot:nth-child(2) { animation-delay: .15s; }
  .typing-dot:nth-child(3) { animation-delay: .3s; }
  @keyframes hdTyping { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-4px); opacity: 1; } }
`;

/* ================================================================== */
/*  DATA                                                              */
/* ================================================================== */

const TEAMS = {
  leave:   { name: "Leave & Absence", color: IRIS },
  payroll: { name: "Payroll & Benefits", color: APRICOT },
  travel:  { name: "Travel & Expenses", color: TEAL },
  people:  { name: "People & Culture", color: "#9A6A2F" },
  ops:     { name: "HR Operations", color: "#4F8D6D" },
};

const NAV = [
  { id: "ask", label: "Ask", icon: "ask" },
  { id: "tickets", label: "Tickets", icon: "ticket" },
  { id: "solutions", label: "Solutions", icon: "book" },
];

const ICONS = { ask: MessageSquare, ticket: Ticket, book: BookOpen };

/* ================================================================== */
/*  Reusable bits                                                      */
/* ================================================================== */

function Chip({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: PAPER_TINT, fg: INK, border: HAIRLINE },
    teal: { bg: "#E3EEEA", fg: TEAL, border: "#BFD9D1" },
    apricot: { bg: "#FBE7DD", fg: "#B7502F", border: "#EEC2AC" },
    iris: { bg: "#E9EAF4", fg: IRIS, border: "#C9CCE4" },
    grey: { bg: "#ECECE8", fg: "#5C6660", border: "#DFDFD8" },
    green: { bg: "#E4F0E7", fg: "#2E6C43", border: "#C4DCCB" },
  };
  const m = map[tone] || map.neutral;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px",
        borderRadius: 999, fontSize: 11.5, fontWeight: 600, letterSpacing: ".01em",
        background: m.bg, color: m.fg, border: `1px solid ${m.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function PriorityPill({ p }) {
  const map = { High: "apricot", Medium: "iris", Low: "grey" };
  return <Chip tone={map[p] || "grey"}>{p}</Chip>;
}

function StatusPill({ s }) {
  const map = {
    New: "iris", "Triaged": "teal", "In progress": "apricot",
    "Waiting on employee": "grey", Resolved: "green",
  };
  return <Chip tone={map[s] || "grey"}>{s}</Chip>;
}

/* ================================================================== */
/*  Seed data                                                          */
/* ================================================================== */

const seedConversation = [
  {
    id: 1, role: "user",
    text: "How many days of bereavement leave am I entitled to?",
  },
  {
    id: 2, role: "assistant", kind: "answer", time: "2s", confidence: "High",
    text:
      "You're entitled to 5 working days of paid bereavement leave for an immediate family member, and 3 days for an extended family member. You can take it any time within the 12 weeks following the bereavement, and you don't need to use annual leave first.",
    sources: [
      { label: "Employee Handbook", detail: "§7.2 · Bereavement & Compassionate Leave", src: "knowledge" },
      { label: "Solutions DB", detail: "Bereavement leave guidance", src: "solution" },
    ],
  },
  {
    id: 3, role: "user",
    text: "What about if my mother-in-law lives abroad — can I take the time without touching annual leave?",
  },
  {
    id: 4, role: "assistant", kind: "escalate", time: "1.4s",
    text:
      "I couldn't find a clear policy for dependants living outside the country, so I've handed this to a human concierge. I've classified it and opened a ticket so you can follow it end-to-end.",
    classify: { label: "Leave & Absence", team: "leave", priority: "Medium", ticket: "HR-2108" },
    trail: [
      { step: "Classify", detail: "Leave & Absence", done: true },
      { step: "Create ticket", detail: "HR-2108 · Medium", done: true },
      { step: "Route", detail: "Scarlett — Travel & Expenses", done: true },
      { step: "Track status", detail: "SLA 4h · Live", done: false, live: true },
    ],
  },
];

const TICKETS = [
  {
    id: "HR-2108", title: "Bereavement leave for dependant living abroad",
    category: "Leave & Absence", team: "leave", priority: "Medium",
    status: "In progress", requester: "Amara Okafor", created: "Today, 09:41",
    sla: "4h", unread: true,
  },
  {
    id: "HR-2104", title: "Request corrected payslip for March",
    category: "Payroll & Benefits", team: "payroll", priority: "High",
    status: "Triaged", requester: "Daniel Reyes", created: "Yesterday", sla: "2h", unread: true,
  },
  {
    id: "HR-2099", title: "Health insurance add dependent for newborn",
    category: "Payroll & Benefits", team: "payroll", priority: "Medium",
    status: "Waiting on employee", requester: "Priya Nair", created: "Mon", sla: "1d",
  },
  {
    id: "HR-2095", title: "Ergonomic chair request — home office",
    category: "Travel & Expenses", team: "travel", priority: "Low",
    status: "New", requester: "Jonas Weber", created: "Mon", sla: "2d",
  },
  {
    id: "HR-2091", title: "Policy question on parental leave top-up",
    category: "Leave & Absence", team: "leave", priority: "Low",
    status: "Resolved", requester: "Sofia Marino", created: "Fri", sla: "—",
  },
  {
    id: "HR-2086", title: "Updating next-of-kin and emergency contact",
    category: "HR Operations", team: "ops", priority: "Medium",
    status: "In progress", requester: "Liam Chen", created: "Fri", sla: "6h",
  },
];

const SOLUTIONS = [
  {
    title: "Bereavement leave guidance",
    category: "Leave & Absence",
    raised: "42× this quarter", author: "HR Team", updated: "Sep 2026",
    body:
      "Employees are entitled to 5 working days of paid leave for immediate family, 3 for extended family, within 12 weeks. Keep a note if the dependant lives abroad — escalate with supporting policy.",
    source: "→ Employee Handbook §7.2",
  },
  {
    title: "Claiming a corrected payslip",
    category: "Payroll & Benefits",
    raised: "31× this quarter", author: "Payroll", updated: "Sep 2026",
    body:
      "Requests under 30 days use the self-service pay portal. Older periods route to Payroll with a signed form. Add bank-detail changes as a separate ticket to avoid payout delays.",
    source: "→ Payroll standard reply 3",
  },
];

/* ================================================================== */
/*  Sidebar + Topbar                                                    */
/* ================================================================== */

function Sidebar({ active, onChange }) {
  return (
    <aside
      className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen"
      style={{ borderRight: `1px solid ${HAIRLINE}`, background: PAPER }}
    >
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ width: 40, height: 40, background: TEAL, color: "#fff" }}
        >
          <Layers size={20} strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="hd-display" style={{ fontSize: 19, fontWeight: 600, color: INK }}>
            Emids
          </div>
          <div style={{ fontSize: 11.5, color: "#71806E", letterSpacing: ".02em" }}>
            People Help Desk
          </div>
        </div>
      </div>

      <div className="px-3 flex flex-col gap-1">
        {NAV.map((n) => {
          const Icon = ICONS[n.icon];
          const is = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => onChange(n.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-colors"
              style={
                is
                  ? { background: TEAL, color: "#fff" }
                  : { color: "#4E5A50", background: "transparent" }
              }
            >
              <span className="flex items-center gap-3 flex-1">
                <Icon size={18} strokeWidth={2} />
                <span className="text-sm font-semibold">{n.label}</span>
              </span>
              {n.id === "tickets" && !is && (
                <span
                  className="text-[11px] font-bold rounded-full"
                  style={{ background: APRICOT, color: "#fff", padding: "1px 7px" }}
                >
                  2
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4">
        <div
          className="rounded-2xl p-4"
          style={{ background: PAPER_TINT, border: `1px solid ${HAIRLINE}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full text-white font-semibold"
              style={{ width: 36, height: 36, background: APRICOT }}
            >
              AO
            </div>
            <div className="leading-tight">
              <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>Amara Okafor</div>
              <div style={{ fontSize: 11.5, color: "#71806E" }}>Engineering</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, subtitle, onNew }) {
  return (
    <header
      className="flex items-center justify-between gap-4 px-5 md:px-8 py-5"
      style={{ borderBottom: `1px solid ${HAIRLINE}` }}
    >
      <div>
        <h1 className="hd-display" style={{ fontSize: 26, fontWeight: 600, color: INK }}>
          {title}
        </h1>
        <p style={{ fontSize: 13.5, color: "#71806E", marginTop: 2 }}>{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "#fff", border: `1px solid ${HAIRLINE}` }}
        >
          <Search size={16} color="#8A947F" />
          <input
            placeholder="Search everything…"
            style={{ border: "none", outline: "none", fontSize: 13.5, background: "transparent", width: 160, color: INK }}
          />
        </div>
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: TEAL }}
          onClick={onNew}
        >
          <Plus size={16} /> New ticket
        </button>
      </div>
    </header>
  );
}

function SourceChip({ src }) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-2.5 py-2"
      style={{ background: "#fff", border: `1px solid ${HAIRLINE}` }}
    >
      <span
        className="flex items-center justify-center rounded-md"
        style={{
          width: 26, height: 26, background: src.src === "knowledge" ? "#E3EEEA" : "#FBE7DD",
          color: src.src === "knowledge" ? TEAL : "#B7502F",
        }}
      >
        {src.src === "knowledge" ? <FileText size={14} /> : <Sparkles size={14} />}
      </span>
      <div className="leading-tight">
        <div style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>{src.label}</div>
        <div style={{ fontSize: 11, color: "#8A947F" }}>{src.detail}</div>
      </div>
    </div>
  );
}

function AnswerCard({ m }) {
  return (
    <div
      className="max-w-[640px] rounded-2xl px-5 py-5"
      style={{ background: "#fff", border: `1px solid ${HAIRLINE}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={15} color={TEAL} />
        <span style={{ fontSize: 12, fontWeight: 600, color: TEAL }}>
          Instant answer · {m.confidence} confidence
        </span>
        <span style={{ fontSize: 11, color: "#A5AD9F", marginLeft: "auto" }}>{m.time}</span>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: INK }}>{m.text}</p>
      {m.sources && (
        <div className="mt-4 pt-3" style={{ borderTop: `1px dashed ${HAIRLINE}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#8A947F", marginBottom: 8 }}>
            SOURCED FROM KNOWLEDGE BASE + SOLUTIONS DATABASE
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {m.sources.map((s, i) => (
              <SourceChip key={i} src={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EscalateCard({ m, onOpenTicket }) {
  return (
    <div
      className="max-w-[640px] rounded-2xl px-5 py-5"
      style={{ background: "#EEF0F7", border: `1px solid #D8DBEA` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Bot size={15} color={IRIS} />
        <span style={{ fontSize: 12, fontWeight: 600, color: IRIS }}>
          Escalated to a human concierge
        </span>
        <button
          onClick={() => onOpenTicket(m.classify.ticket)}
          className="flex items-center gap-1 ml-auto text-xs font-semibold"
          style={{ color: IRIS }}
        >
          View ticket <ChevronRight size={13} />
        </button>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: INK }}>{m.text}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ background: "#fff" }}>
          <Tag size={14} color={IRIS} />
          <div className="leading-tight">
            <div style={{ fontSize: 11, color: "#8A947F" }}>Classified</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{m.classify.label}</div>
          </div>
        </div>
        <div className="rounded-lg px-3 py-2.5 flex items-center gap-2" style={{ background: "#fff" }}>
          <Ticket size={14} color={IRIS} />
          <div className="leading-tight">
            <div style={{ fontSize: 11, color: "#8A947F" }}>Ticket</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{m.classify.ticket}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3" style={{ borderTop: `1px dashed #C9CCE4` }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#8A947F", marginBottom: 10 }}>
          AGENT WORKFLOW
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {m.trail.map((s, i) => (
            <div key={i} className="flex items-center" style={{ flex: 1 }}>
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 22, height: 22,
                    background: s.done ? IRIS : "#fff",
                    color: s.done ? "#fff" : "#A0A3C2",
                    border: s.done ? "none" : `1.5px solid #C9CCE4`,
                  }}
                >
                  {s.done ? <CheckCircle2 size={12} /> : <CircleDot size={11} />}
                </span>
                <div className="leading-tight">
                  <div style={{ fontSize: 12, fontWeight: 600, color: INK }}>{s.step}</div>
                  <div style={{ fontSize: 10.5, color: "#8A947F" }}>{s.detail}</div>
                </div>
              </div>
              {i < m.trail.length - 1 && (
                <div style={{ flex: 1, margin: "0 8px", height: 1, background: "#C9CCE4" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0"
      style={{ width: 36, height: 36, background: TEAL, color: "#fff" }}
    >
      <Sparkles size={18} />
    </div>
  );
}

function typingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <Avatar />
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
        style={{ background: "#fff", border: `1px solid ${HAIRLINE}` }}
      >
        <span className="typing-dot" style={{ background: "#B9BEAE" }} />
        <span className="typing-dot" style={{ background: "#B9BEAE" }} />
        <span className="typing-dot" style={{ background: "#B9BEAE" }} />
      </div>
    </div>
  );
}

function buildAnswer(text) {
  return {
    id: Date.now() + 1, role: "assistant", kind: "answer", time: "1.8s",
    confidence: "High",
    text:
      "You can request this in the self-service portal, and your remaining balance shows there net of anything already taken this year. I can summarise your balance, or raise a ticket if something looks off.",
    sources: [
      { label: "Employee Handbook", detail: "§4.1 · Leave accrual & requests", src: "knowledge" },
      { label: "Solutions DB", detail: "Answered · 12× this quarter", src: "solution" },
    ],
  };
}
function buildEscalate(text) {
  return {
    id: Date.now() + 1, role: "assistant", kind: "escalate", time: "1.3s",
    text:
      "That's a little more specific than our current policy covers, so I've handed it to a human concierge. I classified it and opened a ticket so you can follow it end-to-end — nothing gets lost.",
    classify: { label: "Leave & Absence", team: "leave", priority: "Medium", ticket: "HR-2108" },
    trail: [
      { step: "Classify", detail: "Leave & Absence", done: true },
      { step: "Create ticket", detail: "HR-2108 · Medium", done: true },
      { step: "Route", detail: "Scarlett · Leave & Absence", done: true },
      { step: "Track status", detail: "SLA 4h · Live", done: false, live: true },
    ],
  };
}

function AskView({ onOpenTicket }) {
  const [messages, setMessages] = useState(seedConversation);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const suggestions = [
    "How many days of bereavement leave do I get?",
    "Request a corrected payslip",
    "Add my newborn to health insurance",
    "Ergonomic chair for home office",
  ];

  const push = (m) => setMessages((prev) => [...prev, m]);

  const send = (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setInput("");
    push({ id: Date.now(), role: "user", text: t });
    setTyping(true);
    const escal = /abroad|outside|exception|custom|edge|not covered|special|abroad/i.test(t);
    setTimeout(() => {
      setTyping(false);
      push(escal ? buildEscalate(t) : buildAnswer(t));
    }, 1150);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="hd-scroll flex-1 overflow-y-auto px-5 md:px-8 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-4">
            <Avatar />
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Emids · People Help Desk</span>
                <span className="flex items-center" style={{ fontSize: 11, color: "#2E6C43" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: "#3FA06A", display: "inline-block" }} />
                  Online
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#8A947F" }}>
                Answers from the knowledge base + solutions database · usually under 3s
              </div>
            </div>
          </div>

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div
                  className="max-w-[560px] rounded-2xl rounded-br-md px-4 py-3"
                  style={{ background: "#E5EEE9", color: INK, fontSize: 15, lineHeight: 1.55 }}
                >
                  {m.text}
                </div>
              </div>
            ) : m.kind === "answer" ? (
              <div key={m.id} className="flex items-start gap-3 w-full">
                <Avatar />
                <div className="flex-1">
                  <AnswerCard m={m} />
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex items-start gap-3 w-full">
                <Avatar />
                <div className="flex-1">
                  <EscalateCard m={m} onOpenTicket={onOpenTicket} />
                </div>
              </div>
            )
          )}

          {typing && typingIndicator()}
        </div>
      </div>

      <div className="px-5 md:px-8 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full px-3.5 py-1.5 text-[12.5px]"
                style={{ background: "#fff", border: `1px solid ${HAIRLINE}`, color: "#5A665C" }}
              >
                {s}
              </button>
            ))}
          </div>
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "#fff", border: `1px solid ${HAIRLINE}`, boxShadow: "0 8px 30px rgba(28,42,41,.06)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything about leave, pay, benefits, expenses…"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 14.5, color: INK, background: "transparent" }}
            />
            <button
              onClick={() => send()}
              className="flex items-center justify-center rounded-xl text-white"
              style={{ width: 38, height: 38, background: TEAL }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketListItem({ t, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl px-4 py-3.5 transition-colors"
      style={{
        background: active ? "#fff" : "transparent",
        border: `1px solid ${active ? "#CDE0DA" : HAIRLINE}`,
        boxShadow: active ? "0 6px 20px rgba(28,42,41,.05)" : "none",
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ fontSize: 11.5, fontWeight: 700, color: t.unread ? TEAL : "#8A947F" }}>
          {t.id}
        </span>
        {t.unread && (
          <span style={{ width: 6, height: 6, borderRadius: 999, background: APRICOT, display: "inline-block" }} />
        )}
        <span style={{ marginLeft: "auto" }}>
          <PriorityPill p={t.priority} />
        </span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: INK, lineHeight: 1.35 }}>{t.title}</div>
      <div className="flex items-center gap-2 mt-2">
        <StatusPill s={t.status} />
        <span style={{ fontSize: 11.5, color: "#8A947F", marginLeft: "auto" }}>{t.created}</span>
      </div>
    </button>
  );
}

function TicketDetail({ t }) {
  const steps = [
    { s: "Submitted", who: "Amara Okafor", detail: "Message the agent couldn't answer", done: true },
    { s: "Classified", who: "Agent", detail: t.category, done: true },
    { s: "Routed", who: "HR team", detail: TEAMS[t.team] ? TEAMS[t.team].name : t.category, done: true },
    { s: t.status === "Resolved" ? "Resolved" : "Pending", who: TEAMS[t.team] ? TEAMS[t.team].name : "HR", detail: t.status, done: t.status === "Resolved" },
  ];
  return (
    <div
      className="rounded-2xl px-6 py-6 h-full"
      style={{ background: "#fff", border: `1px solid ${HAIRLINE}` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: 12, fontWeight: 700, color: IRIS }}>{t.id}</span>
          <h2 className="hd-display" style={{ fontSize: 22, fontWeight: 600, color: INK, marginTop: 4 }}>
            {t.title}
          </h2>
        </div>
        <StatusPill s={t.status} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
        {[
          { k: "Requester", v: t.requester },
          { k: "Priority", v: t.priority },
          { k: "Assigned team", v: TEAMS[t.team] ? TEAMS[t.team].name : t.category },
          { k: "SLA", v: t.sla },
        ].map((x, i) => (
          <div key={i} className="rounded-xl px-3.5 py-3" style={{ background: PAPER_TINT }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: "#8A947F" }}>{x.k}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: INK, marginTop: 3 }}>{x.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div style={{ fontSize: 12, fontWeight: 700, color: "#8A947F", marginBottom: 12 }}>
          ROUTING & STATUS
        </div>
        <div className="flex flex-col">
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            return (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 26, height: 26,
                      background: s.done ? IRIS : "#fff",
                      color: s.done ? "#fff" : "#A0A3C2",
                      border: s.done ? "none" : `1.5px solid #C9CCE4`,
                    }}
                  >
                    {s.done ? <CheckCircle2 size={14} /> : <CircleDot size={12} />}
                  </span>
                  {!last && (
                    <span style={{ width: 2, flex: 1, background: s.done ? "#C9CCE4" : "#E4E5F0", minHeight: 26 }} />
                  )}
                </div>
                <div className={last ? "" : "pb-5"}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 14, fontWeight: 600, color: INK }}>{s.s}</span>
                    <span style={{ fontSize: 12, color: "#8A947F" }}>· {s.who}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#6A756A", marginTop: 2 }}>{s.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 flex flex-wrap gap-3" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: TEAL }}
        >
          <Users size={15} /> Assign to me
        </button>
        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ background: "#fff", border: `1px solid ${HAIRLINE}`, color: INK }}
        >
          <MessageSquare size={15} /> Reply
        </button>
      </div>
    </div>
  );
}

const FILTERS = ["All", "Open", "Resolved"];

function TicketsView({ selected, setSelected }) {
  const [filter, setFilter] = useState("All");
  const list = TICKETS.filter((t) =>
    filter === "All" ? true : filter === "Open" ? t.status !== "Resolved" : t.status === "Resolved"
  );
  const ticket = TICKETS.find((t) => t.id === selected) || TICKETS[0];
  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-5 px-5 md:px-8 py-6">
      <div className="lg:w-[350px] shrink-0 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>Queue</span>
          <span style={{ fontSize: 12, color: "#8A947F" }}>· {TICKETS.length} tickets</span>
          <div className="ml-auto flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                  background: filter === f ? "#fff" : "transparent",
                  border: `1px solid ${filter === f ? "#CDE0DA" : "transparent"}`,
                  color: filter === f ? TEAL : "#8A947F",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="hd-scroll flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {list.map((t) => (
            <TicketListItem key={t.id} t={t} active={t.id === ticket.id} onClick={() => setSelected(t.id)} />
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0 hd-scroll overflow-y-auto">
        <TicketDetail t={ticket} />
      </div>
    </div>
  );
}

function SolutionCard({ s }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{ background: "#fff", border: `1px solid ${HAIRLINE}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Chip tone="teal">{s.category}</Chip>
        <span style={{ marginLeft: "auto" }}>
          <Chip tone="grey">{s.raised}</Chip>
        </span>
      </div>
      <h3 className="hd-display" style={{ fontSize: 19, fontWeight: 600, color: INK, lineHeight: 1.25 }}>
        {s.title}
      </h3>
      <p className="flex-1" style={{ fontSize: 13.5, color: "#5A665C", lineHeight: 1.55, margin: "10px 0 14px" }}>
        {s.body}
      </p>
      <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>{s.author}</span>
          <span style={{ fontSize: 11.5, color: "#8A947F" }}>· {s.updated}</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "#8A947F" }}>{s.source}</span>
      </div>
    </div>
  );
}

function SolutionForm({ form, setForm, onSubmit, onClose }) {
  const cat = ["Leave & Absence", "Payroll & Benefits", "Travel & Expenses", "HR Operations"];
  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-50"
      style={{ background: "rgba(28,42,41,.4)" }}
    >
      <div className="w-full max-w-lg rounded-3xl p-6" style={{ background: "#fff" }}>
        <div className="flex items-start gap-3 mb-5">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: "#E9EAF4", color: IRIS }}
          >
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <h3 className="hd-display" style={{ fontSize: 20, fontWeight: 600, color: INK }}>
              Add a solution
            </h3>
            <p style={{ fontSize: 13, color: "#71806E" }}>
              Frequently raised issue → structured document → solutions database.
            </p>
          </div>
          <button onClick={onClose} style={{ color: "#8A947F" }}>
            <X size={18} />
          </button>
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: "#5A665C" }}>Issue</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Home-office internet allowance"
          style={{ width: "100%", border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: "10px 12px", fontSize: 14, color: INK, margin: "6px 0 14px", outline: "none" }}
        />
        <label style={{ fontSize: 12, fontWeight: 600, color: "#5A665C" }}>Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{ width: "100%", border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: "10px 12px", fontSize: 14, color: INK, margin: "6px 0 14px", background: "#fff", outline: "none" }}
        >
          {cat.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#5A665C" }}>Solution</label>
        <textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={4}
          placeholder="The standard answer we give employees for this issue…"
          style={{ width: "100%", border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: "10px 12px", fontSize: 14, color: INK, margin: "6px 0 16px", outline: "none", resize: "vertical" }}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            style={{ padding: "10px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600, color: INK, background: PAPER_TINT }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            style={{ padding: "10px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#fff", background: IRIS }}
          >
            <span className="flex items-center gap-2">
              <FileText size={15} /> Convert & save
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SolutionsView() {
  const [solutions, setSolutions] = useState(SOLUTIONS);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: "", category: "Leave & Absence", body: "" });

  const addSolution = () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSolutions((prev) => [
      {
        title: form.title, category: form.category, raised: "New",
        author: "You", updated: "Just now", body: form.body,
        source: "→ New submission",
      },
      ...prev,
    ]);
    setFormOpen(false);
    setForm({ title: "", category: "Leave & Absence", body: "" });
    setToast("Structured doc added to the solutions database");
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="flex-1 min-h-0 hd-scroll overflow-y-auto px-5 md:px-8 py-6 relative">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={15} color={APRICOT} />
          <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>
            Frequently raised issues
          </span>
          <span style={{ fontSize: 12, color: "#8A947F" }}>· turn answers into durable solutions</span>
          <button
            onClick={() => setFormOpen(true)}
            className="ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: "#E9EAF4", color: IRIS }}
          >
            <Plus size={16} /> Add solution
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {solutions.map((s, i) => (
            <SolutionCard key={i} s={s} />
          ))}
        </div>
      </div>

      {formOpen && (
        <SolutionForm
          form={form}
          setForm={setForm}
          onSubmit={addSolution}
          onClose={() => setFormOpen(false)}
        />
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-white"
          style={{ background: TEAL, boxShadow: "0 12px 30px rgba(28,42,41,.25)" }}
        >
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}

const VEIEW_META = {
  ask: { title: "Ask", subtitle: "Instant answers from the knowledge base + solutions database" },
  tickets: { title: "Tickets", subtitle: "Escalations the agent couldn't answer, routed to the right HR team" },
  solutions: { title: "Solutions", subtitle: "Durable answers to frequently raised issues" },
};

export default function HRHelpDesk() {
  const [view, setView] = useState("ask");
  const [selected, setSelected] = useState("HR-2108");
  const meta = VEIEW_META[view];

  const openTicket = () => {
    setSelected("HR-2108");
    setView("tickets");
  };

  const mobileNav = [
    { id: "ask", label: "Ask", icon: "ask" },
    { id: "tickets", label: "Tickets", icon: "ticket" },
    { id: "solutions", label: "Solutions", icon: "book" },
  ];

  return (
    <div className="flex h-screen w-full" style={{ background: PAPER, color: INK }}>
      <style>{baseStyle}</style>
      <Sidebar active={view} onChange={setView} />
      <main className="flex-1 min-w-0 flex flex-col">
        <Topbar title={meta.title} subtitle={meta.subtitle} onNew={() => setView("tickets")} />
        {view === "ask" && <AskView onOpenTicket={openTicket} />}
        {view === "tickets" && <TicketsView selected={selected} setSelected={setSelected} />}
        {view === "solutions" && <SolutionsView />}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t" style={{ background: PAPER, borderColor: HAIRLINE }}>
        {mobileNav.map((n) => {
          const Icon = ICONS[n.icon];
          const is = view === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3"
              style={{ color: is ? TEAL : "#8A947F" }}
            >
              <Icon size={19} />
              <span style={{ fontSize: 10.5, fontWeight: 600 }}>{n.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

