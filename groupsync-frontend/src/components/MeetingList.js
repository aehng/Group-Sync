import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MeetingCard from './MeetingCard';

export default function MeetingList() {
    const { groupId } = useParams();
    const { authToken } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [filter, setFilter] = useState(''); // State for filters
    const navigate = useNavigate();

    useEffect(() => {
        const getMeetings = async () => {
            try {
                // TASK: Fetch meetings with axios + JWT
                const res = await axios.get(`/api/groups/${groupId}/meetings/${filter}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setMeetings(res.data);
            } catch (err) { console.error(err); }
        };
        if (authToken) getMeetings();
    }, [groupId, authToken, filter]);

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
                <button onClick={() => setFilter('')} style={{ marginRight: 8 }}>All</button>
                <button onClick={() => setFilter('?upcoming=true')} style={{ marginRight: 8 }}>Upcoming</button>
                <button onClick={() => setFilter('?past=true')}>Past</button>
            </div>

            {/* TASK: Display meetings in list view */}
            {meetings.length === 0 ? (
                <p>No meetings found for this filter.</p>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    {meetings.map(m => (<MeetingCard key={m.id} meeting={m} groupId={groupId} />))}
                </div>
            )}
        </div>
    );
}