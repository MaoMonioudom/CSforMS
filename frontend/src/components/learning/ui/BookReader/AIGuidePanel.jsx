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
      <div className="mx-auto mt-5 max-w-[1000px] rounded-[10px] border border-gold/20 bg-navy px-[18px] py-4 font-body">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-gold">🤖 AI Guide</span>
          <a
            href={agentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-parchment/50 underline-offset-2 hover:text-gold hover:underline"
          >
            open in new tab ↗
          </a>
        </div>
        <iframe
          src={agentUrl}
          title={`AI guide for ${lessonTitle}`}
          className="h-[420px] w-full rounded-md border border-white/10 bg-white"
          allow="clipboard-write"
        />
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
