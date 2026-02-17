import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Error, Loading } from "../shared";

/**
 * MessageBoard
 *
 * Backend:
 * - GET  /api/groups/<group_id>/messages/   (paginated results)
 * - POST /api/groups/<group_id>/messages/   { content: "..." }
 *
 * Serializer guarantees:
 * - msg.author.username exists (nested author object) :contentReference[oaicite:1]{index=1}
 *
 * Props:
 * - groupId (required)
 * - apiBaseUrl (optional) default ""
 * - tokenKey (optional) default "accessToken"
 * - pollMs (optional) default 4000
 */
export default function MessageBoard({
  groupId,
  apiBaseUrl = "",
  tokenKey = "accessToken",
  pollMs = 4000,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  // Track whether user is currently reading older messages (don’t force-scroll)
  const [stickToBottom, setStickToBottom] = useState(true);

  const listRef = useRef(null);
  const bottomRef = useRef(null);

  const token = useMemo(() => localStorage.getItem(tokenKey), [tokenKey]);

  // Optional: if you store username client-side after login
  const myUsername = useMemo(() => localStorage.getItem("username") || "", []);

  const messagesUrl = useMemo(() => {
    if (!groupId) return null;
    return `${apiBaseUrl}/api/groups/${groupId}/messages/`;
  }, [apiBaseUrl, groupId]);

  const authHeaders = useMemo(() => {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [token]);

  function scrollToBottom(behavior = "smooth") {
    bottomRef.current?.scrollIntoView({ behavior });
  }

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;

    // If user is near bottom, keep autoscrolling; otherwise stop forcing it.
    const threshold = 80; // px
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setStickToBottom(distanceFromBottom < threshold);
  }

  async function fetchAllPages(startUrl) {
    // DRF paginated: { count, next, previous, results } :contentReference[oaicite:2]{index=2}
    let url = startUrl;
    const all = [];

    while (url) {
      const res = await fetch(url, { headers: authHeaders });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed to load messages (${res.status}). ${t || ""}`.trim());
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        all.push(...data);
        break;
      }

      const pageItems = data?.results ?? [];
      all.push(...pageItems);
      url = data?.next || null;
    }

    // backend orders by created_at asc; sort defensively anyway
    all.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return all;
  }

  async function loadMessages({ initial = false } = {}) {
    if (!messagesUrl) return;

    if (initial) setIsLoading(true);
    setError("");

    try {
      const all = await fetchAllPages(messagesUrl);
      setMessages((prev) => {
        // Avoid re-render churn: only update if changed
        const prevLast = prev[prev.length - 1]?.id;
        const nextLast = all[all.length - 1]?.id;
        const prevLen = prev.length;
        const nextLen = all.length;

        if (prevLen === nextLen && prevLast === nextLast) return prev;
        return all;
      });

      // Only auto-scroll if user is already near bottom
      if (stickToBottom || initial) {
        // initial render: use auto to avoid “fly in”
        scrollToBottom(initial ? "auto" : "smooth");
      }
    } catch (e) {
      setError(e?.message || "Failed to load messages.");
    } finally {
      if (initial) setIsLoading(false);
    }
  }

  useEffect(() => {
    // Initial fetch on mount / group change
    loadMessages({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesUrl]);

  useEffect(() => {
    // Poll for new messages
    if (!messagesUrl) return;

    const id = setInterval(() => {
      loadMessages({ initial: false });
    }, pollMs);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesUrl, pollMs, stickToBottom]);

  async function handleSend(e) {
    e.preventDefault();
    const content = text.trim();
    if (!content || !messagesUrl) return;

    setIsSending(true);
    setError("");

    try {
      // Serializer: POST only needs { content } :contentReference[oaicite:3]{index=3}
      const res = await fetch(messagesUrl, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed to send message (${res.status}). ${t || ""}`.trim());
      }

      const created = await res.json();

      // Optimistic append
      setMessages((prev) => [...prev, created]);

      // Clear input after send ✅
      setText("");

      // After sending, always stick to bottom
      setStickToBottom(true);
      scrollToBottom("smooth");
    } catch (e) {
      setError(e?.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  }

  function formatTime(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "";
    }
  }

  function isMine(msg) {
    // Since serializer returns msg.author.username :contentReference[oaicite:4]{index=4}
    if (!myUsername) return false;
    return msg?.author?.username === myUsername;
  }

  return (
    <Card title="Message Board" subtitle="Group chat">
      {error ? <Error title="Message Board Error" message={error} /> : null}

      {isLoading ? (
        <Loading label="Loading messages…" />
      ) : (
        <>
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="message-list"
            aria-label="Messages"
            role="log"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <p className="message-empty">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => {
                const mine = isMine(msg);
                return (
                  <div key={msg.id} className={`message-row ${mine ? "mine" : ""}`}>
                    <div className="message-bubble">
                      <div className="message-meta">
                        <span className="message-sender">
                          {msg?.author?.username || "Unknown"}
                        </span>
                        <span className="message-time">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="message-text">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={bottomRef} />
          </div>

          <form className="message-form" onSubmit={handleSend}>
            <label className="label" htmlFor="messageText">
              New message
            </label>

            <textarea
              id="messageText"
              className="message-textarea"
              rows={3}
              placeholder="Type your message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSending}
            />

            <div className="message-actions">
              <Button
                variant="primary"
                type="submit"
                disabled={isSending || text.trim().length === 0}
              >
                {isSending ? "Sending…" : "Send"}
              </Button>
            </div>
          </form>
        </>
      )}
    </Card>
  );
}
