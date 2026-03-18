import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Essential styling
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Loading, Error } from './shared';

export default function CalendarView() {
    const { groupId } = useParams();
    const { authToken } = useAuth();
    const navigate = useNavigate();
    
    const [meetings, setMeetings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMeetings = async () => {
            setIsLoading(true);
            setError("");

            try {
                const res = await axios.get(`/api/groups/${groupId}/meetings/`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                setMeetings(res.data);
            } catch (err) {
                console.error("Error loading calendar", err);
                setError(err?.response?.data?.detail || err?.message || "Failed to load meetings");
            } finally {
                setIsLoading(false);
            }
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
        <div className="container">
            <div className="flex-between" style={{ marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Group Calendar</h2>
                <Button variant="secondary" onClick={() => navigate(`/groups/${groupId}/meetings`)}>
                    Back to meeting list
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
                <Card className="card" compact>
                    {isLoading ? (
                        <Loading label="Loading calendar..." />
                    ) : error ? (
                        <Error title="Calendar" message={error} />
                    ) : (
                        <Calendar 
                            onChange={setSelectedDate} 
                            value={selectedDate}
                            tileClassName={tileClassName}
                        />
                    )}
                </Card>

                <div>
                    <h3>Meetings for {selectedDate.toLocaleDateString()}</h3>
                    {dayMeetings.length > 0 ? (
                        dayMeetings.map((m) => (
                            <Card
                                key={m.id}
                                className="card-clickable"
                                onClick={() => navigate(`/groups/${groupId}/meetings/${m.id}`)}
                                compact
                                title={m.title}
                                subtitle={new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            />
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