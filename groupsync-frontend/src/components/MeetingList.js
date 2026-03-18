import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listGroupMeetings } from '../api/meetings';
import MeetingCard from './MeetingCard';

export default function MeetingList() {
    const { groupId } = useParams();
    const [meetings, setMeetings] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const getMeetings = async () => {
            try {
                setIsLoading(true);
                setError('');

                const params = filter === 'upcoming'
                    ? { upcoming: true }
                    : filter === 'past'
                        ? { past: true }
                        : {};

                const data = await listGroupMeetings(groupId, params);
                setMeetings(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err?.response?.data?.detail || err?.message || 'Failed to load meetings');
            } finally {
                setIsLoading(false);
            }
        };

        getMeetings();
    }, [groupId, filter]);

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Group Meetings</h2>
                {/* TASK: Add button to create new meeting */}
                <button 
                    onClick={() => navigate(`/groups/${groupId}/meetings/new`)}
                    style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    + Create New Meeting
                </button>
            </div>

            {/* TASK: Add filters for upcoming vs. past meetings */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => setFilter('all')} style={{ marginRight: 8 }}>All</button>
                <button onClick={() => setFilter('upcoming')} style={{ marginRight: 8 }}>Upcoming</button>
                <button onClick={() => setFilter('past')}>Past</button>
            </div>

            {/* TASK: Display meetings in list view */}
            {isLoading ? (
                <p>Loading meetings...</p>
            ) : error ? (
                <p style={{ color: '#b00020' }}>{error}</p>
            ) : meetings.length === 0 ? (
                <p>No meetings found for this filter.</p>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    {meetings.map(m => (<MeetingCard key={m.id} meeting={m} groupId={groupId} />))}
                </div>
            )}
        </div>
    );
}