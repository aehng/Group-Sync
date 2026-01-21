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

  // Flip this to true once Django endpoints exist
  const USE_API = false;

  const gid = useMemo(() => String(groupId ?? ""), [groupId]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setError(null);
      setLoading(true);

      try {
        if (!USE_API) {
          // mock
          if (alive) setMessages(MOCK_MESSAGES.filter((m) => m.group_id === gid));
        } else {
          const data = await listGroupMessages(gid, { limit: 30 });
          if (alive) setMessages(data.results ?? []);
        }
      } catch (e) {
        if (alive) setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
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
    // MVP: placeholder. Later: use ?before=... pagination.
    // For mock mode, just no-op.
    return;
  }

  return { messages, isLoading, error, sendMessage, loadOlder };
}
