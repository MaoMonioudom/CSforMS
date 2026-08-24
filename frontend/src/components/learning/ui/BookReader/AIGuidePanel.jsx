import { useState } from "react";

const CANNED_REPLIES = [
  "Good question — let's break that down step by step.",
  "Think about what problem this concept solves before worrying about syntax.",
  "Try re-reading the section above, then attempt a small example yourself.",
  "That connects to what's covered in this lesson — check the key takeaways.",
  "Nice thinking! Here's a hint: focus on one part of the problem at a time.",
];

/**
 * AI guide panel for the Interactive path. When the course has an
 * `aiAgentUrl` (set in the course editor), the agent is embedded here in
 * an iframe. Without one, a demo chat with canned replies stands in so
 * the path's value is still visible.
 */
export default function AIGuidePanel({ lessonTitle, agentUrl }) {
  if (agentUrl?.trim()) {
    return (
      <div className="mx-auto mt-5 max-w-[1000px] overflow-hidden rounded-[10px] border border-gold/20 bg-navy font-body">
        <div className="flex items-center justify-between border-b border-gold/10 px-[18px] py-3">
          <span className="text-xs font-semibold text-gold">🤖 AI Guide</span>
          <span className="text-[10px] text-parchment/35">learn with ai-agent</span>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/30">
            <span className="text-2xl">💬</span>
          </div>

          <div>
            <h3 className="text-[15px] font-semibold text-parchment">
              Chat with your AI guide
            </h3>
            <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-relaxed text-parchment/60">
              Get help with "{lessonTitle}" from an AI trained on this course.
              Opens in a new tab — come back anytime.
            </p>
          </div>
            <a href={agentUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-1 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-[13px] font-semibold text-navy-deep transition-all duration-150 hover:bg-gold-light hover:shadow-[0_0_0_4px_rgba(212,175,55,0.15)]"
          >
            Start chatting
            <span className="transition-transform duration-150 group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        </div>
      </div>
    );
  }
  return <DemoGuidePanel lessonTitle={lessonTitle} />;
}

function DemoGuidePanel({ lessonTitle }) {
  const [messages, setMessages] = useState(() => [
    {
      from: "ai",
      text: `Hi! I'm your AI guide for "${lessonTitle}". Ask me anything about this lesson.`,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [replyIndex, setReplyIndex] = useState(0);

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const reply = CANNED_REPLIES[replyIndex % CANNED_REPLIES.length];
    setMessages((m) => [...m, { from: "user", text }, { from: "ai", text: reply }]);
    setReplyIndex((i) => i + 1);
    setDraft("");
  };

  return (
    <div className="mx-auto mt-5 max-w-[1000px] rounded-[10px] border border-gold/20 bg-navy px-[18px] py-4 font-body">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-gold">🤖 AI Guide</span>
        <span className="text-[10px] text-parchment/35">demo — canned responses</span>
      </div>

      <div className="mb-3 flex max-h-[220px] flex-col gap-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-[13px] leading-normal text-parchment/90 ${
              m.from === "ai" ? "self-start bg-gold/[0.12]" : "self-end bg-white/[0.08]"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <form className="flex gap-2" onSubmit={send}>
        <input
          className="flex-1 rounded-md border border-white/15 bg-white/5 px-3 py-[9px] font-body text-[13px] text-[#F7F5F0] focus:border-gold focus:outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about this lesson…"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-md border-none bg-gold px-4 py-[9px] text-[13px] font-semibold text-navy-deep transition-colors duration-150 hover:bg-gold-light"
        >
          Send
        </button>
      </form>
    </div>
  );
}
