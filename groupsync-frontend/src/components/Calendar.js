import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Essential styling
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CalendarView() {
    const { groupId } = useParams();
    const { authToken } = useAuth();
    const navigate = useNavigate();
    
    const [meetings, setMeetings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const res = await axios.get(`/api/groups/${groupId}/meetings/`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setMeetings(res.data);
            } catch (err) { console.error("Error loading calendar", err); }
        };
        if (authToken) fetchMeetings();
    }, [groupId, authToken]);

    // Helper: Find meetings for a specific day
    const getMeetingsForDate = (date) => {
        return meetings.filter(m => {
            const mDate = new Date(m.start_time);
            return mDate.toDateString() === date.toDateString();
        });
    };

    // TASK: Highlight dates that have meetings
    const tileClassName = ({ date, view }) => {
        if (view === 'month' && getMeetingsForDate(date).length > 0) {
            return 'has-meeting'; 
        }
        return null;
    };

    const dayMeetings = getMeetingsForDate(selectedDate);

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Group Calendar</h2>
                <button onClick={() => navigate(`/groups/${groupId}/meetings`)}>Back to List View</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
                <div>
                    <Calendar 
                        onChange={setSelectedDate} 
                        value={selectedDate}
                        tileClassName={tileClassName}
                    />
                </div>

                <div>
                    <h3>Meetings for {selectedDate.toLocaleDateString()}</h3>
                    {dayMeetings.length > 0 ? (
                        dayMeetings.map(m => (
                            <div 
                                key={m.id} 
                                onClick={() => navigate(`/groups/${groupId}/meetings/${m.id}`)}
                                style={{ 
                                    padding: '15px', 
                                    border: '1px solid #eee', 
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                <strong>{m.title}</strong>
                                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                    {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#999' }}>No meetings scheduled for this day.</p>
                    )}
                </div>
            </div>

            {/* Simple CSS to make the dots/highlights look good */}
            <style>{`
                .has-meeting {
                    background-color: #e6f7ff !important;
                    color: #007bff !important;
                    font-weight: bold;
                    border-radius: 4px;
                }
                .react-calendar {
                    width: 100%;
                    border: none;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    padding: 10px;
                    border-radius: 8px;
                }
            `}</style>
        </div>
    );
}