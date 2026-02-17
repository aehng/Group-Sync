import { useEffect, useMemo, useState } from "react";
import { listGroupMessages, sendGroupMessage } from "../api/messages";

function nowIso() {
  return new Date().toISOString();
}

const MOCK_MESSAGES = [
  {
    id: "1",
    group_id: "1",
    sender: { id: "me", name: "You" },
    content: "Messaging UI is live ✅",
    created_at: nowIso(),
  },
  {
    id: "2",
    group_id: "1",
    sender: { id: "u2", name: "Teammate" },
    content: "Nice — next is the API!",
    created_at: nowIso(),
  },
];

export function useMessages(groupId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  // `nextUrl` stores the cursor pagination `next` URL from the API. When
  // present `loadOlder()` will fetch that URL to retrieve older messages.

// Toggle API usage; set to `true` to call the Django backend.
// Toggle API usage; set to `true` to call the Django backend.
// This flag is intentionally module-level so React hooks don't re-create
// the effect when it's toggled. If you need it reactive, move it inside
// the component and include it in effect dependencies.
const USE_API = true;

  const gid = useMemo(() => String(groupId ?? ""), [groupId]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setError(null);
      setLoading(true);

      try {
        if (!USE_API) {
          if (alive) setMessages(MOCK_MESSAGES.filter((m) => m.group_id === gid));
        } else {
          const data = await listGroupMessages(gid, { limit: 50 });
          // API returns newest-first; reverse so UI shows oldest->newest
          const list = (data.results ?? []).slice().reverse();
          if (alive) {
            setMessages(list);
            setNextUrl(data.next || null);
          }
        }
      } catch (e) {
        if (alive) setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    // Poll every 3 seconds for new messages
    let intervalId = null;
    if (USE_API) {
      intervalId = setInterval(() => {
        listGroupMessages(gid, { limit: 50 })
          .then((data) => {
            const list = (data.results ?? []).slice().reverse();
            if (alive) {
              setMessages(list);
              setNextUrl(data.next || null);
            }
          })
          .catch((e) => {
            if (alive) setError(e);
          });
      }, 3000);
    }

    return () => {
      alive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [gid]);

  async function sendMessage(content) {
    setError(null);

    // optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      group_id: gid,
      sender: { id: "me", name: "You" },
      content,
      created_at: nowIso(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      if (!USE_API) {
        // mock "success"
        return;
      }
      const created = await sendGroupMessage(gid, content);

      // replace temp with real
      setMessages((prev) => prev.map((m) => (m.id === tempId ? created : m)));
    } catch (e) {
      // rollback on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(e);
    }
  }

  async function loadOlder() {
    if (!USE_API) return;

    if (!nextUrl) return; // no older pages

    setLoading(true);
    setError(null);

    try {
      const data = await listGroupMessages(gid, { cursorUrl: nextUrl });
      const older = (data.results ?? []).slice().reverse();

      // Prepend older messages so UI order remains oldest->newest
      setMessages((prev) => [...older, ...prev]);
      setNextUrl(data.next || null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
    return;
  }

  return { messages, isLoading, error, sendMessage, loadOlder };
}
