import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMeeting, updateMeeting, deleteMeeting } from '../api/meetings';

export default function MeetingDetails() {
    const { groupId, meetingId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [meeting, setMeeting] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const data = await getMeeting(groupId, meetingId);
                setMeeting(data);
                setFormData(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMeeting();
    }, [groupId, meetingId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                end_time: formData.end_time || null,
            };

            const data = await updateMeeting(groupId, meetingId, payload);
            setMeeting(data);
            setIsEditing(false);
        } catch (err) { setErrors(err.response?.data || {}); }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this meeting?")) {
            try {
                await deleteMeeting(groupId, meetingId);
                navigate(`/groups/${groupId}/meetings`);
            } catch (err) { console.error(err); }
        }
    };

    if (!meeting) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd' }}>
            {isEditing ? (
                <form onSubmit={handleUpdate}>
                    <h3>Edit Meeting</h3>
                    <input type="text" name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{width: '100%', marginBottom: '10px'}} />
                    <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{width: '100%', marginBottom: '10px'}} />
                    <input type="datetime-local" name="start_time" value={formData.start_time?.slice(0,16)} onChange={(e) => setFormData({...formData, start_time: e.target.value})} style={{width: '100%', marginBottom: '10px'}} />
                    <button type="submit" style={{backgroundColor: 'green', color: 'white'}}>Save Changes</button>
                    <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                </form>
            ) : (
                <div>
                    {/* TASK: Display full meeting info */}
                    <h2>{meeting.title}</h2>
                    <p><strong>Description:</strong> {meeting.description}</p>
                    <p><strong>Time:</strong> {new Date(meeting.start_time).toLocaleString()} - {meeting.end_time ? new Date(meeting.end_time).toLocaleString() : 'N/A'}</p>
                    <p><strong>Location/Link:</strong> {meeting.location_or_link || 'No location provided'}</p>
                    <p><strong>Agenda:</strong> {meeting.agenda || 'No agenda set'}</p>
                    <p><strong>Created by:</strong> {meeting.creator_name || 'Group Member'}</p>

                    {/* Permissions Check: Only show Edit/Delete if user is creator */}
                    {user?.id === meeting.creator && (
                        <div style={{ marginTop: '20px' }}>
                            <button onClick={() => setIsEditing(true)} style={{ marginRight: '10px' }}>Edit Meeting</button>
                            <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>Delete Meeting</button>
                        </div>
                    )}
                    <button onClick={() => navigate(-1)} style={{ marginTop: '10px', display: 'block' }}>Back to List</button>
                </div>
            )}
        </div>
    );
}