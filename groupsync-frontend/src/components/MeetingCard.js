import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MeetingCard({ meeting, groupId }) {
    const navigate = useNavigate();

    // Helper to format the date nicely
    const startTime = new Date(meeting.start_time).toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const isZoomLink = meeting.location_or_link?.startsWith('http');

    return (
        <div style={styles.card}>
            <div style={styles.content} onClick={() => navigate(`/groups/${groupId}/meetings/${meeting.id}`)}>
                <h4 style={styles.title}>{meeting.title}</h4>
                <p style={styles.detail}>📅 {startTime}</p>
                <p style={styles.detail}>📍 {meeting.location_or_link || 'No location set'}</p>
                <p style={styles.creator}>👤 Created by: {meeting.creator_name || 'Member'}</p>
            </div>

            {/* TASK: Add "Join" button for Zoom links */}
            {isZoomLink && (
                <a 
                    href={meeting.location_or_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.joinButton}
                >
                    Join Meeting
                </a>
            )}
        </div>
    );
}

const styles = {
    card: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s',
    },
    content: {
        flex: 1,
        cursor: 'pointer'
    },
    title: { margin: '0 0 5px 0', color: '#007bff' },
    detail: { margin: '2px 0', fontSize: '14px', color: '#555' },
    creator: { margin: '5px 0 0 0', fontSize: '12px', color: '#888', fontStyle: 'italic' },
    joinButton: {
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '14px',
        marginLeft: '15px'
    }
};