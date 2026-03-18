import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "./shared";

export default function MeetingCard({ meeting, groupId }) {
  const navigate = useNavigate();

  // Helper to format the date nicely
  const startTime = new Date(meeting.start_time).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isZoomLink = meeting.location_or_link?.startsWith("http");

  const openDetails = () => navigate(`/groups/${groupId}/meetings/${meeting.id}`);
  const openLink = (e) => {
    e.stopPropagation();
    window.open(meeting.location_or_link, "_blank", "noopener noreferrer");
  };

  return (
    <Card
      className="card-clickable"
      onClick={openDetails}
      title={meeting.title}
      subtitle={startTime}
    >
      <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "0.95rem" }}>
        📍 {meeting.location_or_link || "No location set"}
      </p>
      <p style={{ margin: "6px 0 0", color: "var(--color-muted)", fontSize: "0.9rem" }}>
        👤 Created by: {meeting.creator_name || "Member"}
      </p>

      {isZoomLink && (
        <div className="card-actions">
          <Button variant="secondary" onClick={openLink}>
            Join Meeting
          </Button>
        </div>
      )}
    </Card>
  );
}
