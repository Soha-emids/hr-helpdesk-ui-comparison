import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Ticket, LayoutDashboard, Database, BookOpen, Send,
  Search, X, Check, ChevronRight, Clock, FileText,
  Bot, ArrowUpRight, CircleDashed
} from "lucide-react";

/* ---------------------------------------------------------------- palette */
// Brand tokens (inline styles keep exact hexes; Tailwind handles layout)
const C = {
  paper: "#F2F2F0", card: "#FFFFFF", ink: "#1C2B2D", faint: "#5A6B6D",
  hairline: "#E2E3DF",
  teal: "#47A2B0", tealDeep: "#2E6E7A", tealWash: "#E2EFF1", tealInk: "#0F3238",
  mauve: "#8E5F9E", mauveWash: "#F2EAF6",
  yellow: "#C9922B", yellowWash: "#FAF0DC",
  green: "#3D7F63", greenWash: "#E3F0E9",
  red: "#B8503F", redWash: "#F6E7E4",
};

const family = `-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

/* ---------------------------------------------------------------- helpers */
const Pill = ({ bg, color, children }) => (
  <span style={{ background: bg, color: color, fontSize: 12, fontWeight: 500,
    padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-flex",
    alignItems: "center", gap: 6, lineHeight: "18px" }}>{children}</span>
);

const Dot = ({ c }) => <span style={{ width: 7, height: 7, borderRadius: 999, background: c, display: "inline-block" }} />;

const statusPill = (s) => {
  if (s === "Resolved") return <Pill bg={C.greenWash} color={C.green}><Dot c={C.green} />Resolved</Pill>;
  if (s === "In review") return <Pill bg={C.yellowWash} color={C.yellow}><Dot c={C.yellow} />In review</Pill>;
  if (s === "Queued") return <Pill bg={C.mauveWash} color={C.mauve}><Dot c={C.mauve} />Queued</Pill>;
  return <Pill bg={C.tealWash} color={C.tealDeep}><Dot c={C.teal} />Open</Pill>;
};

const prioPill = (p) => {
  if (p === "High") return <Pill bg={C.redWash} color={C.red}>High</Pill>;
  if (p === "Low") return <Pill bg={C.hairline} color={C.faint}>Low</Pill>;
  return <Pill bg={C.hairline} color={C.ink}>Medium</Pill>;
};

const catPill = (t) => {
  const map = {
    "People": [C.mauveWash, C.mauve], "People-Ops": [C.mauveWash, C.mauve],
    "Compensation": [C.tealWash, C.tealDeep], "Compensation-Ops": [C.tealWash, C.tealDeep],
    "Coordination": [C.yellowWash, C.yellow], "Coordination-Ops": [C.yellowWash, "#9A711D"],
  };
  const m = map[t] || [C.hairline, C.ink];
  return <Pill bg={m[0]} color={m[1]}>{t}</Pill>;
};

const SourceChip = ({ name }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12,
    background: C.paper, border: `1px solid ${C.hairline}`, borderRadius: 8,
    padding: "4px 10px", color: C.tealDeep, fontWeight: 500 }}>
    <FileText size={13} />{name}
  </span>
);

/* ---------------------------------------------------------------- mock data */
const KB_DOCS = [
  { name: "Leave & Attendance Policy", version: "v2.3", sections: 34, indexed: "Oct 2, 2026", chunks: 412 },
  { name: "Insurance & Benefits Guide", version: "v1.8", sections: 21, indexed: "Sep 28, 2026", chunks: 335 },
  { name: "Payroll Calendar 2026–27", version: "v1.1", sections: 6, indexed: "Sep 30, 2026", chunks: 118 },
  { name: "Relocation Handbook", version: "v1.2", sections: 11, indexed: "Sep 12, 2026", chunks: 204 },
  { name: "Code of Conduct", version: "v3.0", sections: 18, indexed: "Aug 20, 2026", chunks: 290 },
  { name: "Onboarding Checklist", version: "v2.5", sections: 9, indexed: "Oct 1, 2026", chunks: 96 },
];

const TEAM = {
  "People-Ops": "Leave, insurance and personal-data requests",
  "Compensation-Ops": "Payroll, grades, EPF/ESI, flexible benefits",
  "Coordination-Ops": "Relocation logistics, desks, access, parking",
};

const initialTickets = [
  { id: "HR-2481", subject: "Packers-and-movers cost for office relocation", cat: "Coordination-Ops", team: "Coordination desk", prio: "Medium", status: "Queued",
    raised: "Today, 10:42", updated: "10:43", via: "Assistant hand-off",
    userText: "I'm moving from the Chennai office next month — can I claim packers-and-movers costs, and what receipts do you need?",
    aiNote: "The assistant had no verified answer, so the employee was offered three choices and picked \"Create a ticket\". Classification was suggested automatically.",
    confidence: 82,
    timeline: [
      ["Today, 10:42", "Assistant couldn't answer. Employee chose Create a ticket."],
      ["Today, 10:42", "Classified as Travel & relocation logistics (82% confidence), routed to Coordination desk."],
      ["Today, 10:43", "Queued for the Coordination desk — 2 tickets ahead of this one."],
    ],
    thread: [] },
  { id: "HR-2312", subject: "EPF contribution looks high in the March payslip", cat: "Compensation-Ops", team: "Payroll & benefits", prio: "High", status: "Resolved",
    raised: "Sep 10", updated: "Sep 12", via: "Ticket form",
    userText: "The EPF column in my March payslip jumped by about ₹1,900 compared with February. Same salary, no changes I made.",
    aiNote: "Assistant pre-filled category Payroll & statutory deductions (84%) before a coordinator opened the ticket.",
    confidence: 84,
    timeline: [
      ["Sep 10, 09:15", "Raised from the ticket form; assistant pre-filled category and priority."],
      ["Sep 10, 11:02", "Picked up by Priya M. (Payroll & benefits)."],
      ["Sep 11, 16:40", "Reply from Priya M. — see thread. Salary re-run scheduled."],
      ["Sep 12, 10:05", "Revised payslip published; ticket closed."],
    ],
    thread: [{ by: "Priya M. · Payroll & benefits", at: "Sep 11, 16:40",
      text: "You're right, and thanks for flagging it — the VDA component didn't flow into the EPF wage base in March. Payroll is re-running the month; your revised payslip will show in the portal on the 12th and the difference will be credited with the next cycle." }] },
  { id: "HR-2256", subject: "Update emergency contact and home address", cat: "People-Ops", team: "HR operations", prio: "Low", status: "Resolved",
    raised: "Sep 1", updated: "Sep 3", via: "Ticket form",
    userText: "Moved house last weekend — please update my emergency contact and home address in the HR system.",
    aiNote: "Assistant pre-filled category Personal data update (91%) and linked the self-service sheet, but the employee preferred a ticket.",
    confidence: 91,
    timeline: [
      ["Sep 1, 08:30", "Raised from the ticket form."],
      ["Sep 1, 08:31", "Classified as Personal data update (91%), routed to HR operations."],
      ["Sep 3, 14:12", "Confirmed updated in the HR system; ticket closed."],
    ],
    thread: [{ by: "Rahul V. · HR operations", at: "Sep 3, 14:12",
      text: "Both fields are updated. A quick tip: address changes also flow into the insurance portal overnight, so check the card tomorrow." }] },
];
const initialSolutions = [
  { id: "S-011", title: "Reimbursement for house-hunting trips", asked: "Asked 11×", source: "HR form · Nandini K.", team: "Compensation-Ops", published: "Sep 18, 2026",
    body: [
      ["Applies to", "Employees transferring offices across cities on an emids-initiated move."],
      ["Steps", ["Get the transfer letter from your delivery manager before booking travel.", "Book up to two round trips, economy class, within 60 days of the letter.", "File the claim in Expenses → Travel → House-hunting within 90 days."]],
      ["Limits", "₹40,000 per family per move; receipts required for stays over ₹1,500 per night."],
      ["Not covered", "Local conveyance during trips; spouse's separate travel bookings."],
    ] },
  { id: "S-008", title: "Adding a newborn to mediclaim within 90 days", asked: "Asked 19×", source: "HR form · Kavya S.", team: "People-Ops", published: "Aug 30, 2026",
    body: [
      ["Applies to", "All insured employees with family floater cover."],
      ["Steps", ["Add the child in the insurance portal within 90 days of birth — no documents at this stage.", "Upload the birth certificate within 30 days of adding, to hold coverage.", "Ayushman Bharat cards, if wanted, are requested in the same form."]],
      ["Limits", "Retroactive claims are accepted only after the upload step completes."],
    ] },
  { id: "S-004", title: "Swapping parking slots between blocks", asked: "Asked 26×", source: "HR form · Imran T.", team: "Coordination-Ops", published: "Jul 11, 2026",
    body: [
      ["Applies to", "Two-wheeler and four-wheeler slots in the same building only."],
      ["Steps", ["Both employees fill one swap form together (single request, not two).", "Security prints a fresh slot sticker within one working day.", "The old sticker must be peeled off before the new one is stuck."]],
      ["Limits", "Three swaps per employee per quarter; EV slots are excluded."],
    ] },
];

const frequentIssues = [
  { topic: "Relocation — are packers and movers covered when emids asks you to move office?", cat: "Coordination-Ops", count: 34, spark: [8, 10, 9, 14, 18, 21, 34], hasDoc: false, reloc: true, desk: "Imran T. · Coordination desk",
    note: "No solution on file. Requests land as tickets and each one is answered by hand." },
  { topic: "Flexible-benefit deductions missing from a payslip", cat: "Compensation-Ops", count: 21, spark: [12, 15, 13, 17, 16, 19, 21], hasDoc: false, received: true, desk: "Priya M. · Payroll & benefits",
    note: "Form went out three days ago; Priya replied this morning." },
  { topic: "Leave carry-forward at year end", cat: "People-Ops", count: 17, spark: [22, 20, 19, 16, 15, 14, 17], hasDoc: true,
    note: "Already covered by Leave & Attendance Policy § Carry-forward. Trending down." },
];
const chatSeed = [
  { role: "user", text: "I'm moving from the Chennai office to Bengaluru next month. Does my health insurance continue, or do I re-enrol?" },
  { role: "ai", text: "Cover continues through the move — the policy runs on the company year, not your location, so there is nothing to re-enrol. The one action the Relocation Handbook asks for: send your new address to People Ops within 30 days so the insurer's card reflects it.",
    sources: ["Insurance & Benefits Guide · § Relocation", "Relocation Handbook · § First 30 days"] },
  { role: "user", text: "And my six unused leave days — can I carry them into next year?" },
  { role: "ai", text: "Yes. Annual leave carries forward up to 8 days, accrued on March 31; anything above that lapses, and you can opt for one-time encashment at exit instead.",
    sources: ["Leave & Attendance Policy · § Carry-forward"] },
  { role: "user", text: "Last one — can I claim packers and movers for this move?" },
  { role: "ai", text: "I can't answer that one safely. The knowledge base and the solutions database cover house-hunting trips, insurance and leave — nothing verified on moving costs for office relocations. Rather than guess:",
    noAnswer: true },
];

const replyFor = (text, hasTicket) => {
  const t = text.toLowerCase();
  if (/packer|mover|moving cost|shifting/.test(t)) {
    if (hasTicket) return { role: "ai", text: "You already have HR-2481 open on exactly this — the Coordination desk replies there. If they publish a solution, it moves into the solutions database and I'll start answering it myself.", sources: ["Ticket HR-2481"] };
    return { role: "ai", text: "Still nothing verified on moving costs, I'm afraid. Your best routes are below.", noAnswer: true };
  }
  if (/insur|medic|cover/.test(t)) return { role: "ai", text: "Short version: the family floater follows you to any emids city. Send the new address to People Ops within 30 days of the move.", sources: ["Insurance & Benefits Guide · § Relocation"] };
  if (/leave|carry/.test(t)) return { role: "ai", text: "Up to 8 days carry forward each year, accrued March 31; more than that lapses unless you choose exit encashment.", sources: ["Leave & Attendance Policy · § Carry-forward"] };
  if (/park/.test(t)) return { role: "ai", text: "Slot swaps are covered — one joint form, both employees, new sticker within a working day. EV slots are excluded.", sources: ["Solutions database · Swapping parking slots between blocks"] };
  return { role: "ai", text: "I don't have a verified source for that. Where I can, I answer only from the knowledge base and the solutions database — for everything else, use Create a ticket below and I'll route it with a suggested category." };
};
/* ------------------------------------------------- structured solution doc */
const DocView = ({ doc }) => (
  <div>
    {doc.body.map(([h, t], i) => (
      <div key={i} style={{ borderTop: `1px solid ${C.hairline}`, padding: "14px 2px" }}>
        <div style={{ color: C.faint, fontSize: 12, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 14, color: C.mauve, fontSize: 11, fontWeight: 600 }}>{i + 1}</span>{h}
        </div>
        {Array.isArray(t) ? (
          <ol style={{ margin: 0, paddingLeft: 34, color: C.ink, fontSize: 13.5, lineHeight: 1.7 }}>
            {t.map((s, j) => <li key={j} style={{ marginBottom: 4 }}>{s}</li>)}
          </ol>
        ) : (
          <div style={{ color: C.ink, fontSize: 13.5, lineHeight: 1.55 }}>{t}</div>
        )}
      </div>
    ))}
  </div>
);

const Modal = ({ onClose, title, meta, children, footer, wide }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(20,30,32,.45)", fontFamily: family }} onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 14, width: wide ? 640 : 520,
      maxHeight: "82vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(15,40,44,.28)", overflow: "hidden" }}>
      <div style={{ padding: "18px 22px 14px", borderBottom: `1px solid ${C.hairline}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: C.ink, letterSpacing: "-0.01em", maxWidth: 460 }}>{title}</div>
            {meta && <div style={{ color: C.faint, fontSize: 12.5, marginTop: 3 }}>{meta}</div>}
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: C.faint, padding: 4, borderRadius: 8 }}>
            <X size={18} />
          </button>
        </div>
      </div>
      <div style={{ padding: "8px 22px 18px", overflowY: "auto" }}>{children}</div>
      {footer && <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.hairline}`, display: "flex", justifyContent: "flex-end", gap: 10, background: "#FBFBFA" }}>{footer}</div>}
    </div>
  </div>
);

const Toast = ({ msg }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 60, background: C.ink, color: "#fff",
    padding: "11px 16px", borderRadius: 10, fontSize: 13.5, display: "flex", gap: 9, alignItems: "center",
    boxShadow: "0 12px 30px rgba(15,40,44,.3)", fontFamily: family, animation: "none" }}>
    <Check size={15} color="#8FD4B8" />{msg}
  </div>
);
/* ------------------------------------------------------------- chat view */
const SortSteps = ({ text }) => {
  const steps = [
    "Read the request — moving costs for an emids-initiated office transfer.",
    "Classify — closest match: Travel & relocation logistics (82% confidence).",
    "Route — Coordination desk; 23 open there, median reply one working day.",
    "Create ticket — HR-2481, priority Medium, queued with today's other two.",
  ];
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v >= steps.length ? v : v + 1)), 620);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (n >= steps.length) { const t = setTimeout(() => window.__finishTicket && window.__finishTicket(), 850); return () => clearTimeout(t); } }, [n]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {text && <div style={{ background: C.paper, borderRadius: 10, padding: "10px 14px", color: C.faint, fontSize: 13, fontStyle: "italic" }}>“{text}”</div>}
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: i < n ? 1 : 0.25, transition: "opacity .3s" }}>
          {i < n ? <Check size={15} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} /> : <CircleDashed size={15} color={C.hairline} style={{ flexShrink: 0, marginTop: 2 }} />}
          <span style={{ fontSize: 13.5, color: i < n ? C.ink : C.faint, lineHeight: 1.45 }}>{s}</span>
        </div>
      ))}
    </div>
  );
};

const ChatView = ({ msgs, onSend, thinking, onEscalate, hasTicket }) => {
  const [draft, setDraft] = useState("");
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [msgs, thinking]);
  const send = () => { if (!draft.trim()) return; onSend(draft.trim()); setDraft(""); };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 292px", gap: 22, height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", background: C.card, border: `1px solid ${C.hairline}`,
        borderRadius: 14, overflow: "hidden", minHeight: 0 }}>
        <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: "22px 26px 10px", minHeight: 0 }}>
          {msgs.map((m, i) => m.role === "user" ? (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end", margin: "14px 0 6px" }}>
              <div style={{ background: C.teal, color: "#fff", maxWidth: "72%", padding: "10px 15px", borderRadius: "14px 14px 4px 14px", fontSize: 13.5, lineHeight: 1.5 }}>{m.text}</div>
            </div>
          ) : (
            <div key={i} style={{ margin: "10px 0" }}>
              <div style={{ display: "flex", gap: 11 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, background: C.tealWash, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <Bot size={16} color={C.tealDeep} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.ink, fontSize: 13.5, lineHeight: 1.6, maxWidth: 620 }}>{m.text}</div>
                  {m.sources && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
                      {m.sources.map((s, j) => <SourceChip key={j} name={s} />)}
                    </div>
                  )}
                  {m.noAnswer && !hasTicket && (
                    <button onClick={onEscalate} style={{ marginTop: 11, display: "inline-flex", alignItems: "center", gap: 8,
                      background: C.teal, color: "#fff", border: "none", borderRadius: 9, padding: "9px 15px",
                      fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <Ticket size={14} />Create a ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {thinking && (
            <div style={{ display: "flex", gap: 11, margin: "10px 0" }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: C.tealWash, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bot size={16} color={C.tealDeep} />
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center", height: 28 }}>
                {[0, 1, 2].map((d) => <span key={d} style={{ width: 5, height: 5, borderRadius: 999, background: C.teal, opacity: 0.55, animation: `none` }} />)}
              </div>
            </div>
          )}
        </div>
        <div style={{ borderTop: `1px solid ${C.hairline}`, padding: "12px 16px", background: "#FBFBFA" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about leave, payroll, insurance, relocation…"
              style={{ flex: 1, border: `1px solid ${C.hairline}`, background: "#fff", borderRadius: 10, padding: "11px 14px", fontSize: 13.5, color: C.ink, outline: "none", fontFamily: family }} />
            <button onClick={send} style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 10, padding: "11px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600 }}>
              <Send size={14} />Send
            </button>
          </div>
          <div style={{ color: C.faint, fontSize: 11.5, marginTop: 8, paddingLeft: 2 }}>Answers come only from the knowledge base and the solutions database — nothing is invented.</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", minHeight: 0 }}>
        <RailCard title="Frequently asked, already solved">
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
            {["Swapping parking slots between blocks", "Adding a newborn to mediclaim", "House-hunting trip reimbursable", "Leave carry-forward at year end"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, fontSize: 13, color: C.tealDeep, cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.tealWash; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                <ArrowUpRight size={13} style={{ flexShrink: 0, color: C.teal }} />{t}
              </div>
            ))}
          </div>
        </RailCard>
        <RailCard title="What happens when I can't answer">
          <ol style={{ margin: "4px 0 0", paddingLeft: 20, color: C.faint, fontSize: 12.5, lineHeight: 1.65 }}>
            <li>I classify the request and suggest a desk.</li>
            <li>Your ticket carries the whole conversation with it.</li>
            <li>When a desk answers often-asked questions, the solution moves into the database and I take over.</li>
          </ol>
        </RailCard>
      </div>
    </div>
  );
};
const RailCard = ({ title, children }) => (
  <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 12, padding: "13px 15px" }}>
    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, marginBottom: 7 }}>{title}</div>
    {children}
  </div>
);

/* ----------------------------------------------------------- tickets view */
const TicketsView = ({ tickets }) => {
  const [filter, setFilter] = useState("All");
  const [sel, setSel] = useState(tickets[0]?.id);
  const shown = tickets.filter((t) => filter === "All" || (filter === "Active" ? t.status !== "Resolved" : t.status === "Resolved"));
  const t = tickets.find((x) => x.id === sel) || shown[0];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "330px minmax(0,1fr)", gap: 20, height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
          {["All", "Active", "Resolved"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ border: filter === f ? "none" : `1px solid ${C.hairline}`,
              background: filter === f ? C.ink : C.card, color: filter === f ? "#fff" : C.faint, borderRadius: 999,
              padding: "6px 14px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: family }}>{f}</button>
          ))}
        </div>
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 9, minHeight: 0 }}>
          {shown.map((x) => (
            <div key={x.id} onClick={() => setSel(x.id)} style={{ background: C.card, border: `1px solid ${sel === x.id ? C.teal : C.hairline}`,
              borderLeft: `3px solid ${sel === x.id ? C.teal : "transparent"}`, borderRadius: 11, padding: "12px 14px",
              cursor: "pointer", boxShadow: sel === x.id ? "0 4px 14px rgba(15,50,56,.07)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.tealDeep }}>{x.id}</span>
                {statusPill(x.status)}
              </div>
              <div style={{ fontSize: 13.5, color: C.ink, marginTop: 5, lineHeight: 1.4 }}>{x.subject}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 7, color: C.faint, fontSize: 11.5, alignItems: "center" }}>
                <span>{x.cat}</span><span style={{ width: 3, height: 3, borderRadius: 99, background: C.hairline }} /><span>{x.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {t && (
        <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "22px 26px", overflowY: "auto", minHeight: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ maxWidth: 560 }}>
              <div style={{ color: C.faint, fontSize: 12.5 }}>Ticket {t.id} · raised {t.raised} · via {t.via}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: C.ink, letterSpacing: "-0.01em", marginTop: 4, lineHeight: 1.3 }}>{t.subject}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{statusPill(t.status)}{prioPill(t.prio)}{catPill(t.cat)}</div>
          </div>
          <div style={{ background: C.paper, border: `1px solid ${C.hairline}`, borderRadius: 11, padding: "13px 16px", marginTop: 16, color: C.ink, fontSize: 13.5, lineHeight: 1.55, maxWidth: 680 }}>
            “{t.userText}”
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <Bot size={15} color={C.tealDeep} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>Assistant's triage note</span>
                <Pill bg={C.tealWash} color={C.tealDeep}>{t.confidence}% confidence</Pill>
              </div>
              <div style={{ border: `1px solid ${C.hairline}`, background: "#FBFBFA", borderRadius: 11, padding: "13px 15px", fontSize: 13, color: C.faint, lineHeight: 1.6 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                  <span style={{ color: C.ink, fontWeight: 500 }}>Category</span><span>{t.cat}</span>
                  <span style={{ color: C.ink, fontWeight: 500 }}>Desk</span><span>{t.team}</span>
                </div>
                {t.aiNote}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, margin: "0 0 10px 0" }}>What has happened so far</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {t.timeline.map(([when, what], i) => (
                  <div key={i} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 9, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 7, height: 7, borderRadius: 99, background: i === t.timeline.length - 1 && t.status === "Resolved" ? C.green : C.teal, marginTop: 5 }} />
                      {i < t.timeline.length - 1 && <div style={{ flex: 1, width: 1.5, background: C.hairline }} />}
                    </div>
                    <div style={{ paddingBottom: 14 }}>
                      <div style={{ fontSize: 11.5, color: C.faint }}>{when}</div>
                      <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.45, marginTop: 1 }}>{what}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {t.thread.length > 0 && (
            <div style={{ borderTop: `1px solid ${C.hairline}`, marginTop: 6, paddingTop: 14 }}>
              {t.thread.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 99, background: C.mauveWash, color: C.mauve, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {r.by.split(" ")[0][0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, color: C.faint }}><b style={{ color: C.ink, fontWeight: 600 }}>{r.by}</b> · {r.at}</div>
                    <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55, marginTop: 3, maxWidth: 640 }}>{r.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
/* ----------------------------------------------------------- console view */
const extraTickets = [
  { id: "HR-2479", subject: "Flexible-benefit deduction absent in the September payslip", cat: "Compensation-Ops", team: "Payroll & benefits", prio: "High", status: "In review", via: "Ticket form", raised: "Yesterday", updated: "2h ago", userText: "", aiNote: "", confidence: 76, timeline: [], thread: [] },
  { id: "HR-2468", subject: "Change of desk — needs two monitors on standing unit", cat: "Coordination-Ops", team: "Coordination desk", prio: "Low", status: "Open", via: "Ticket form", raised: "Yesterday", updated: "yesterday", userText: "", aiNote: "", confidence: 88, timeline: [], thread: [] },
];

const StatStrip = () => (
  <div style={{ display: "flex", gap: 0, background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 13, padding: "16px 6px" }}>
    {[
      ["Open tickets", "3", "one slid in overnight from the assistant", C.ink],
      ["Answered with no ticket needed", "61%", "of assistant conversations, past 30 days", C.tealDeep],
      ["Median first reply", "6 hrs", "by desks with 5+ people on shift", C.ink],
      ["HR solution forms open", "2", "one request out, one answered and awaiting review", C.yellow],
    ].map(([label, value, sub, color], i) => (
      <div key={i} style={{ flex: 1, padding: "0 22px", borderLeft: i ? `1px solid ${C.hairline}` : "none" }}>
        <div style={{ fontSize: 12.5, color: C.faint }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 650, letterSpacing: "-0.02em", color: color, margin: "3px 0 2px", fontFamily: family }}>{value}</div>
        <div style={{ fontSize: 11.5, color: C.faint, lineHeight: 1.35 }}>{sub}</div>
      </div>
    ))}
  </div>
);

const ConsoleView = ({ tickets, solutions, frequent, setFrequent, addSolution, notify }) => {
  const all = [...tickets, ...extraTickets];
  const queue = all.filter((t) => t.status !== "Resolved");
  const publish = (idx) => {
    const row = frequent[idx];
    const doc = {
      id: "S-0" + (13 + idx), title: row.topic.length > 48 ? row.topic.slice(0, 46) + "…" : row.topic,
      asked: `Asked ${row.count}×`, source: "HR form · Imran T.", team: row.cat, published: "Just now",
      body: row.reloc ? [
        ["Applies to", "Employees asked by emids to transfer between offices."],
        ["Steps", ["Get written approval from your delivery manager.", "Book through the contracted movers; personal bookings aren't claimable.", "Collect two quotes when the estimate crosses ₹1,00,000.", "Claim in Expenses → Relocation within 60 days of the move."]],
        ["Receipts needed", "Movers' GST invoice; both quotes, if applicable."],
        ["Limits", "Up to 400 kg of household goods per family, one truckload per move."],
      ] : [
        ["Applies to", "Employees who opted for the flexible-benefit plan this year."],
        ["Steps", ["Set your benefit split in the Benefits portal before the 20th.", "Deductions appear from that cycle's payslip (the 25th run).", "A missed deadline defers the split to the next month — it is not a payroll error."]],
        ["Receipts needed", "None. Configuration is read straight from the portal."],
        ["Reviewed by", "Priya M. · Payroll & benefits · replied to the form yesterday"],
      ],
    };
    addSolution(doc);
    setFrequent(frequent.map((f, i) => (i === idx ? { ...f, hasDoc: true, note: "Covered from today — the assistant answers this directly." } : f)));
    notify("Published — the assistant takes this one from here");
  };
  const IssueRow = ({ row, idx }) => {
    const [stage, setStage] = useState(row.received ? "received" : "idle");
    const pid = row.desk ? row.desk.split(" · ")[0] : "the desk";
    const st = stage;
    return (
      <div style={{ borderBottom: `1px solid ${C.hairline}`, padding: "15px 2px", opacity: row.hasDoc ? 0.6 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div style={{ maxWidth: 330 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, lineHeight: 1.4 }}>{row.topic}</div>
            <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center", fontSize: 11.5, color: C.faint }}>
              {catPill(row.cat)}<span>{row.count} asks in 30 days</span>
            </div>
            {!row.hasDoc && <div style={{ fontSize: 12, color: C.faint, marginTop: 6, lineHeight: 1.4 }}>{row.note}</div>}
            {row.hasDoc && <Pill bg={C.greenWash} color={C.green}><Check size={11} />On file — assistant answers directly</Pill>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
            {row.spark.map((v, j) => (
              <div key={j} style={{ width: 6, height: 4 + (v / 34) * 22, borderRadius: 2, background: j === row.spark.length - 1 ? C.teal : C.hairline }} />
            ))}
          </div>
          <div style={{ width: 208, display: "flex", justifyContent: "flex-end", alignItems: "center", flexShrink: 0 }}>
            {row.hasDoc ? (
              <span style={{ color: C.faint, fontSize: 12 }} />
            ) : st === "idle" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                <span style={{ fontSize: 11.5, color: C.faint }}>goes to {pid}</span>
                <ActBtn label="Send solution request" onClick={() => setStage("sent")} />
              </div>
            ) : st === "sent" ? (
              <span style={{ display: "flex", gap: 7, alignItems: "center", color: C.yellow, fontSize: 12.5 }}><Clock size={13} />Form sent to {pid} — awaiting reply</span>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
                <Pill bg={C.greenWash} color={C.green}><Check size={11} />Form answered</Pill>
                <ActBtn label="Draft solution document" primary onClick={() => publish(idx)} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: 20, height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }}>
        <StatStrip />
        <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 13, padding: "4px 18px 10px", flex: 1, overflowY: "auto", minHeight: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0 10px" }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: C.ink }}>Desk queue</div>
            <div style={{ fontSize: 12, color: C.faint }}>3 open · the two resolved this week are filed away</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: C.faint, fontSize: 12, textAlign: "left" }}>
                {["Ticket", "Subject", "Category", "Desk", "", ""].map((h) => <th key={h} style={{ padding: "7px 10px 7px 0", fontWeight: 500, borderBottom: `1px solid ${C.hairline}` }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {queue.map((t) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                  <td style={{ padding: "11px 10px 11px 0", fontWeight: 600, color: C.tealDeep, fontSize: 12.5, whiteSpace: "nowrap" }}>{t.id}</td>
                  <td style={{ padding: "11px 10px", color: C.ink, maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.subject}</td>
                  <td style={{ padding: "11px 10px" }}>{catPill(t.cat)}</td>
                  <td style={{ padding: "11px 10px", color: C.faint, fontSize: 12.5, whiteSpace: "nowrap" }}>{t.team}</td>
                  <td style={{ padding: "11px 10px" }}>{prioPill(t.prio)}</td>
                  <td style={{ padding: "11px 0 11px 10px", textAlign: "right" }}>{statusPill(t.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 13, padding: "16px 18px", overflowY: "auto", minHeight: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: C.ink }}>Asked often, worth a solution</div>
        <div style={{ fontSize: 12, color: C.faint, margin: "4px 0 2px", lineHeight: 1.5 }}>The assistant watches what comes up repeatedly. Send HR a one-field form; the reply becomes a solution document the assistant answers from.</div>
        <div style={{ marginTop: 6 }}>
          {frequent.map((row, idx) => <IssueRow key={idx} row={row} idx={idx} />)}
        </div>
      </div>
    </div>
  );
};
const ActBtn = ({ label, primary, onClick }) => (
  <button onClick={onClick} style={{ border: primary ? "none" : `1px solid ${C.hairline}`, background: primary ? C.teal : "#fff",
    color: primary ? "#fff" : C.ink, borderRadius: 9, padding: "7px 12px", fontSize: 12.5, fontWeight: 600,
    cursor: "pointer", whiteSpace: "nowrap", fontFamily: family }}>{label}</button>
);

/* -------------------------------------------------------- database views */
const SolutionsView = ({ solutions }) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const shown = solutions.filter((s) => (s.title + s.team).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ maxWidth: 560, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 10, padding: "9px 13px" }}>
          <Search size={15} color={C.faint} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search solutions — every one came from an HR reply…"
            style={{ border: "none", outline: "none", flex: 1, fontSize: 13.5, color: C.ink, fontFamily: family, background: "transparent" }} />
        </div>
      </div>
      <div style={{ overflowY: "auto", minHeight: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 13, alignContent: "start" }}>
        {shown.map((s) => (
          <div key={s.id} onClick={() => setOpen(s)} style={{ background: C.card, border: `1px solid ${s.isNew ? C.teal : C.hairline}`, borderRadius: 12, padding: "15px 17px", cursor: "pointer",
            boxShadow: s.isNew ? "0 4px 16px rgba(71,162,176,.14)" : "none" }}>
            {s.isNew && <div style={{ fontSize: 11, fontWeight: 700, color: C.green, letterSpacing: ".02em", marginBottom: 7 }}>Published just now</div>}
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, lineHeight: 1.35, letterSpacing: "-0.005em" }}>{s.title}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>{catPill(s.team)}</div>
            <div style={{ color: C.faint, fontSize: 12, marginTop: 10, lineHeight: 1.55 }}>
              {s.asked}<br />From {s.source} · {s.published}
            </div>
            <div style={{ color: C.tealDeep, fontSize: 12.5, fontWeight: 600, marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>Read the solution <ChevronRight size={13} /></div>
          </div>
        ))}
      </div>
      {open && (
        <Modal onClose={() => setOpen(null)} title={open.title} meta={open.asked + " · from " + open.source + " · " + open.team}
          footer={<button onClick={() => setOpen(null)} style={{ border: `1px solid ${C.hairline}`, background: "#fff", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.ink, fontFamily: family }}>Close</button>}>
          <DocView doc={open} />
        </Modal>
      )}
    </div>
  );
};

const KBView = ({ notify }) => (
  <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
      <div style={{ maxWidth: 520, fontSize: 13, color: C.faint, lineHeight: 1.55 }}>
        These documents are the assistant's primary source. Sections are indexed nightly, so edits reach the chat within a day.
      </div>
      <ActBtn label="Add a document" onClick={() => notify("In the demo this opens Supabase storage — wire the bucket here")} />
    </div>
    <div style={{ overflowY: "auto", minHeight: 0, background: C.card, border: `1px solid ${C.hairline}`, borderRadius: 13, padding: "6px 20px 12px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr style={{ color: C.faint, fontSize: 12, textAlign: "left" }}>
          {["Document", "Sections", "Chunks indexed", "Last indexed", ""].map((h) => <th key={h} style={{ padding: "11px 10px 9px 0", fontWeight: 500, borderBottom: `1px solid ${C.hairline}` }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {KB_DOCS.map((d) => (
            <tr key={d.name} style={{ borderBottom: `1px solid ${C.hairline}` }}>
              <td style={{ padding: "12px 10px 12px 0", color: C.ink }}>
                <div style={{ fontWeight: 600 }}>{d.name}</div>
                <div style={{ color: C.faint, fontSize: 11.5, marginTop: 2 }}>{d.version}</div>
              </td>
              <td style={{ padding: "12px 10px", color: C.faint }}>{d.sections}</td>
              <td style={{ padding: "12px 10px", color: C.faint }}>{d.chunks}</td>
              <td style={{ padding: "12px 10px", color: C.faint }}>{d.indexed}</td>
              <td style={{ padding: "12px 0", textAlign: "right", color: C.tealDeep }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}><FileText size={14} />View sections</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
/* ----------------------------------------------------------------- shell */
const NAV = [
  ["Yourself", [
    ["chat", "Ask HR", MessageSquare],
    ["tickets", "My tickets", Ticket],
  ]],
  ["HR operations", [
    ["console", "Console", LayoutDashboard],
    ["solutions", "Solutions database", Database],
    ["kb", "Knowledge base", BookOpen],
  ]],
];

const VIEW_META = {
  chat: ["Ask HR", "Answers come from the knowledge base and the solutions database — tickets are created when neither can answer."],
  tickets: ["My tickets", "Everything you've raised, whether through the assistant or the form."],
  console: ["HR console", "Desk queue, plus the questions worth turning into durable solutions."],
  solutions: ["Solutions database", "Structured HR answers, each one sourced from a person's reply."],
  kb: ["Knowledge base", "The documents the assistant reads before it says anything."],
};

const newTicket = {
  id: "HR-2481", subject: "Packers-and-movers cost for office relocation", cat: "Coordination-Ops", team: "Coordination desk",
  prio: "Medium", status: "Queued", raised: "Today, just now", updated: "just now", via: "Assistant hand-off",
  userText: "I'm moving from the Chennai office next month — can I claim packers-and-movers costs, and what receipts do you need?",
  aiNote: "The assistant had no verified answer, so the employee was offered a ticket instead. Classification and desk assignment were suggested automatically.",
  confidence: 82,
  timeline: [
    ["Today, just now", "Assistant couldn't answer; employee chose Create a ticket."],
    ["Today, just now", "Classified as Travel & relocation logistics (82% confidence), routed to the Coordination desk."],
    ["Today, just now", "Queued — 2 tickets ahead of this one."],
  ], thread: [],
};

export default function App() {
  const [view, setView] = useState("chat");
  const [tickets, setTickets] = useState(initialTickets);
  const [solutions, setSolutions] = useState(initialSolutions);
  const [frequent, setFrequent] = useState(frequentIssues);
  const [msgs, setMsgs] = useState(chatSeed);
  const [thinking, setThinking] = useState(false);
  const [escOpen, setEscOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);
  const hasTicket = tickets.some((t) => t.via === "Assistant hand-off");

  const notify = (msg) => {
    clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 3400);
  };

  const onSend = (text) => {
    setMsgs((m) => [...m, { role: "user", text }]);
    setThinking(true);
    setTimeout(() => { setMsgs((m) => [...m, replyFor(text, hasTicket)]); setThinking(false); }, 950);
  };

  window.__finishTicket = () => {
    setEscOpen(false);
    setTickets((t) => [newTicket, ...t]);
    setMsgs((m) => [...m, { role: "ai", text: "Done — ticket HR-2481 is queued with the Coordination desk, priority Medium. Your entire conversation travels with it, so whoever picks it up sees what I couldn't resolve. The desk usually replies within a working day, and if they write up a solution, it moves into the solutions database for everyone after you.", sources: ["My tickets · HR-2481"] }]);
    notify("Ticket HR-2481 created and routed");
  };

  const [title, subtitle] = VIEW_META[view];
  return (
    <div style={{ display: "flex", height: "100vh", background: C.paper, fontFamily: family, color: C.ink, overflow: "hidden" }}>
      <div style={{ width: 226, flexShrink: 0, background: C.ink, display: "flex", flexDirection: "column", padding: "20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 20px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: C.teal, color: "#fff", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>e</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 650, fontSize: 15, letterSpacing: "-0.01em" }}>emids</div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: 12 }}>HR service desk</div>
          </div>
        </div>
        {NAV.map(([group, items]) => (
          <div key={group} style={{ marginBottom: 18 }}>
            <div style={{ color: "rgba(255,255,255,.42)", fontSize: 11.5, margin: "0 0 7px 10px", fontWeight: 500 }}>{group}</div>
            {items.map(([id, label, Icon]) => (
              <div key={id} onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, cursor: "pointer",
                marginBottom: 2, color: view === id ? "#fff" : "rgba(255,255,255,.66)", background: view === id ? "rgba(255,255,255,.09)" : "transparent",
                borderLeft: view === id ? `3px solid ${C.teal}` : "3px solid transparent", fontWeight: view === id ? 600 : 400, fontSize: 13.5,
                transition: "background .15s" }}>
                <Icon size={16} style={{ color: view === id ? "#7FC5CF" : "rgba(255,255,255,.55)", flexShrink: 0 }} />{label}
              </div>
            ))}
          </div>
        ))}
        <div style={{ marginTop: "auto", padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 99, background: "rgba(255,255,255,.14)", color: "#fff", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>S</div>
          <div>
            <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>Signed in</div>
            <div style={{ color: "rgba(255,255,255,.45)", fontSize: 11 }}>Bengaluru · BLR-1</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "20px 26px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14 }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontSize: 21, fontWeight: 650, letterSpacing: "-0.02em" }}>{title}</div>
            <div style={{ color: C.faint, fontSize: 12.5, marginTop: 3, lineHeight: 1.45 }}>{subtitle}</div>
          </div>
          <div style={{ color: C.faint, fontSize: 12.5, whiteSpace: "nowrap" }}>Monday, Oct 5</div>
        </div>
        <div style={{ flex: 1, minHeight: 0, padding: "0 26px 22px" }}>
          {view === "chat" && <ChatView msgs={msgs} onSend={onSend} thinking={thinking} onEscalate={() => setEscOpen(true)} hasTicket={hasTicket} />}
          {view === "tickets" && <TicketsView tickets={tickets} />}
          {view === "console" && <ConsoleView tickets={tickets} solutions={solutions} frequent={frequent} setFrequent={setFrequent}
            addSolution={(d) => setSolutions((s) => [{ ...d, isNew: true }, ...s])} notify={notify} />}
          {view === "solutions" && <SolutionsView solutions={solutions} />}
          {view === "kb" && <KBView notify={notify} />}
        </div>
      </div>
      {escOpen && (
        <Modal onClose={() => setEscOpen(false)} title="Turn this conversation into a ticket"
          meta="The assistant classifies and routes first; HR confirms the category on pickup."
          footer={<ActBtn label="Cancel" onClick={() => setEscOpen(false)} />}>
          <SortSteps text="Can I claim packers and movers for this move?" />
        </Modal>
      )}
      {toast && <Toast msg={toast} />}
    </div>
  );
}