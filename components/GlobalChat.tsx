import React, { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Pencil, Trash2, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "@/components/Avatar";

const GlobalChat: React.FC = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; userName: string; message: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [olderMessages, setOlderMessages] = useState<any[]>([]);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = useMutation(api.chat.sendMessage);
  const editMessage = useMutation(api.chat.editMessage);
  const deleteMessage = useMutation(api.chat.deleteMessage);
  const result = useQuery(api.chat.getMessages, { cursor: undefined });
  const olderResult = useQuery(api.chat.getMessages, cursor ? { cursor } : "skip");

  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("toggle-global-chat", handler);
    return () => window.removeEventListener("toggle-global-chat", handler);
  }, []);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const liveMessages = result?.messages ?? [];
  const liveCount = liveMessages.length;
  const seenCountRef = useRef<number>(
    parseInt(localStorage.getItem("chat_last_seen_ts") || "0", 10)
  );
  const mountedRef = useRef(false);

  // Fire unread event when new messages arrive while chat is closed
  useEffect(() => {
    if (!liveMessages.length) return;
    const lastTs = liveMessages[liveMessages.length - 1]?._creationTime ?? 0;

    if (open) {
      seenCountRef.current = lastTs;
      localStorage.setItem("chat_last_seen_ts", String(lastTs));
      window.dispatchEvent(new CustomEvent("chat-unread", { detail: false }));
      return;
    }

    // Skip on first mount — only show dot for messages that arrive after page load
    if (!mountedRef.current) {
      mountedRef.current = true;
      seenCountRef.current = lastTs;
      localStorage.setItem("chat_last_seen_ts", String(lastTs));
      return;
    }

    if (lastTs > seenCountRef.current) {
      const newMsgs = liveMessages.filter((m: any) => m._creationTime > seenCountRef.current);
      const hasUser = newMsgs.some((m: any) => m.userEmail !== "codebysnorlax@gmail.com");
      const hasDev = newMsgs.some((m: any) => m.userEmail === "codebysnorlax@gmail.com");
      window.dispatchEvent(new CustomEvent("chat-unread", { detail: { user: hasUser, dev: hasDev } }));
    }
  }, [liveCount, open]);

  useEffect(() => {
    if (olderResult?.messages) {
      setOlderMessages((prev) => {
        const ids = new Set(prev.map((m) => m._id));
        return [...olderResult.messages.filter((m: any) => !ids.has(m._id)), ...prev];
      });
    }
  }, [olderResult]);

  const seen = new Set<string>();
  const messages = [...olderMessages, ...liveMessages].filter((m) => {
    if (seen.has(m._id)) return false;
    seen.add(m._id);
    return true;
  });

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [open, liveMessages.length]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loadingOlder || result?.isDone) return;
    if (el.scrollTop === 0 && result?.continueCursor) {
      const prevHeight = el.scrollHeight;
      setLoadingOlder(true);
      setCursor(result.continueCursor);
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - prevHeight;
        setLoadingOlder(false);
      });
    }
  }, [loadingOlder, result]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    await sendMessage({
      userId: user.id,
      userName: user.firstName || user.username || "User",
      userImage: user.imageUrl,
      userEmail: user.primaryEmailAddress?.emailAddress,
      message: text.trim(),
      replyTo: replyTo ?? undefined,
    });
    setText("");
    setReplyTo(null);
  };

  const handleEdit = async (id: string) => {
    if (!editText.trim() || !user) return;
    await editMessage({ id: id as any, userId: user.id, userEmail: user.primaryEmailAddress?.emailAddress, message: editText.trim() });
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteMessage({ id: id as any, userId: user.id, userEmail: user.primaryEmailAddress?.emailAddress });
  };

  const fmt = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat-panel"
          initial={{ opacity: 0, y: window.innerWidth < 1024 ? "100%" : 24, scale: window.innerWidth < 1024 ? 1 : 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: window.innerWidth < 1024 ? "100%" : 24, scale: window.innerWidth < 1024 ? 1 : 0.96 }}
          transition={window.innerWidth < 1024
            ? { type: "tween", duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }
            : { type: "spring", stiffness: 380, damping: 30 }}
          drag={window.innerWidth >= 1024}
          dragMomentum={false}
          dragElastic={0}
          className="fixed inset-0 lg:inset-auto lg:bottom-6 lg:right-6 z-50 w-full lg:w-[420px] lg:h-[560px] flex flex-col lg:rounded-2xl overflow-hidden shadow-2xl lg:cursor-default"
          style={{
            background: "#1E1E1E",
            border: "1px solid #2D2D2D",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 lg:cursor-grab lg:active:cursor-grabbing"
            style={{ borderBottom: "1px solid #2D2D2D", background: "#121212" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-orange/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-orange" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.477 2 2 6.253 2 11.5c0 2.304.87 4.41 2.306 6.038L3.05 21.15a.75.75 0 0 0 .943.943l3.773-1.22A10.12 10.12 0 0 0 12 21c5.523 0 10-4.253 10-9.5S17.523 2 12 2Z"
                    fill="currentColor" fillOpacity=".25" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="11.5" r="1" fill="currentColor"/>
                  <circle cx="12" cy="11.5" r="1" fill="currentColor"/>
                  <circle cx="15.5" cy="11.5" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Global Chat</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  <span className="text-[10px] text-gray-500">Live · wait for the community to reply</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-4"
            style={{ scrollbarWidth: "none" }}
          >
            {loadingOlder && (
              <p className="text-center text-[10px] text-gray-600 py-1 tracking-wide uppercase">Loading older...</p>
            )}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
                <svg className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.477 2 2 6.253 2 11.5c0 2.304.87 4.41 2.306 6.038L3.05 21.15a.75.75 0 0 0 .943.943l3.773-1.22A10.12 10.12 0 0 0 12 21c5.523 0 10-4.253 10-9.5S17.523 2 12 2Z" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                <p className="text-xs text-gray-600 text-center">No messages yet. Be the first to say hi!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.userId === user?.id;
              const isDeleted = msg.deleted;
              const isActive = activeMessageId === msg._id;
              return (
                <div 
                  key={msg._id} 
                  className={`flex items-end gap-2 group ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  onClick={() => {
                    if (isDeleted || editingId === msg._id) return;
                    setActiveMessageId(isActive ? null : msg._id);
                  }}
                >
                  <Avatar
                    src={msg.userImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.userName)}&background=random`}
                    alt={msg.userName}
                    className="w-6 h-6 rounded-full ring-1 ring-white/10"
                  />
                  <div className={`max-w-[72%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <div className="flex items-center gap-1.5 mb-1 ml-1">
                        <span className="text-[10px] font-medium text-gray-400">{msg.userName}</span>
                        {msg.userEmail === "codebysnorlax@gmail.com" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Developer</span>
                        )}
                      </div>
                    )}
                    {isMe && msg.userEmail === "codebysnorlax@gmail.com" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 mb-1 mr-1">Developer</span>
                    )}

                    {editingId === msg._id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEdit(msg._id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="text-sm px-3 py-1.5 rounded-xl outline-none ring-0 focus:outline-none focus:ring-0 w-36 text-gray-200"
                          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid #2D2D2D" }}
                        />
                        <button onClick={() => handleEdit(msg._id)}
                          className="w-6 h-6 rounded-lg bg-brand-orange/20 flex items-center justify-center text-brand-orange hover:bg-brand-orange/30 transition-colors">
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                          isDeleted
                            ? "italic text-gray-600"
                            : isMe
                            ? "text-white rounded-br-sm"
                            : "text-gray-200 rounded-bl-sm"
                        }`}
                        style={
                          isDeleted
                            ? { background: "#2D2D2D", border: "1px solid #2D2D2D" }
                            : isMe
                            ? { background: "#FF7A00", boxShadow: "0 2px 12px rgba(255,122,0,0.25)" }
                            : { background: "#2D2D2D" }
                        }
                      >
                        {msg.replyTo && !isDeleted && (
                          <div className="mb-1.5 px-2 py-1 rounded-lg text-[11px] border-l-2 border-white/40 bg-black/20">
                            <p className="font-semibold text-white/70 mb-0.5">{msg.replyTo.userName}</p>
                            <p className="text-white/50 truncate">{msg.replyTo.message}</p>
                          </div>
                        )}
                        {msg.message}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1 mx-1">
                      <span className="text-[10px] text-gray-600">{fmt(msg._creationTime)}</span>
                      {msg.edited && !isDeleted && (
                        <span className="text-[10px] text-gray-600">· {msg.actionBy === "developer" ? "edited by Developer" : "edited"}</span>
                      )}
                      {isDeleted && msg.actionBy === "developer" && (
                        <span className="text-[10px] text-blue-500/70">· removed by Developer</span>
                      )}
                      {(isMe || user?.primaryEmailAddress?.emailAddress === "codebysnorlax@gmail.com") && !isDeleted && editingId !== msg._id && (
                        <span className={`flex items-center gap-1 ml-0.5 overflow-hidden transition-all duration-150 ease-out delay-1000 group-hover:delay-0 ${confirmDeleteId === msg._id ? "max-w-[8rem]" : isActive ? "max-w-[4rem]" : "max-w-0 group-hover:max-w-[4rem]"}`}>
                          <button
                            onClick={() => setReplyTo({ id: msg._id, userName: msg.userName, message: msg.message })}
                            className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/10 transition-all"
                          >
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                          </button>
                          {(!msg.edited || user?.primaryEmailAddress?.emailAddress === "codebysnorlax@gmail.com") && (
                            <button
                              onClick={() => { setEditingId(msg._id); setEditText(msg.message); }}
                              className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/10 transition-all"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                          )}
                          {confirmDeleteId === msg._id ? (
                            <span className="flex items-center gap-1">
                              <span className="text-[10px] text-red-400">Sure?</span>
                              <button onClick={() => { handleDelete(msg._id); setConfirmDeleteId(null); }} className="text-[10px] text-red-400 hover:text-red-300 font-medium">Yes</button>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-[10px] text-gray-500 hover:text-gray-300">No</button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(msg._id)}
                              className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </span>
                      )}
                      {!(isMe || user?.primaryEmailAddress?.emailAddress === "codebysnorlax@gmail.com") && !isDeleted && (
                        <span className={`flex items-center gap-1 ml-0.5 overflow-hidden transition-all duration-150 ease-out delay-1000 group-hover:delay-0 ${isActive ? "max-w-[2rem]" : "max-w-0 group-hover:max-w-[2rem]"}`}>
                          <button
                            onClick={() => setReplyTo({ id: msg._id, userName: msg.userName, message: msg.message })}
                            className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/10 transition-all"
                          >
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid #2D2D2D" }}>
            {replyTo && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-lg border-l-2 border-brand-orange"
                style={{ background: "#2D2D2D" }}>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-brand-orange">Replying to {replyTo.userName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{replyTo.message}</p>
                </div>
                <button onClick={() => setReplyTo(null)} className="ml-2 text-gray-500 hover:text-white flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "#121212", border: "1px solid #2D2D2D" }}>
              <Avatar
                src={user?.imageUrl || `https://ui-avatars.com/api/?name=U&background=random`}
                alt="me"
                className="w-6 h-6 rounded-full"
              />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Message everyone..."
                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none ring-0 border-none focus:outline-none focus:ring-0"
              />
              <motion.button
                onClick={handleSend}
                disabled={!text.trim()}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.08 }}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-25"
                style={{ background: text.trim() ? "#FF7A00" : "#2D2D2D" }}
              >
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalChat;
