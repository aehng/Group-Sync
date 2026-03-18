import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createMeeting } from '../api/meetings';

export default function CreateMeeting() {
    const { groupId } = useParams();
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location_or_link: '',
        agenda: ''
    });

    // Error State for validation
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Clear old errors

        try {
            const payload = {
                ...formData,
                end_time: formData.end_time || null,
            };

            await createMeeting(groupId, payload);
            // Redirect back to the meeting list on success
            navigate(`/groups/${groupId}/meetings`);
        } catch (err) {
            // TASK: Display validation errors from Django
            if (err.response && err.response.data) {
                setErrors(err.response.data);
            } else {
                console.error("An unexpected error occurred:", err);
            }
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Create New Meeting</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Title:</label><br />
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%' }} />
                    {errors.title && <p style={{ color: 'red', fontSize: '12px' }}>{errors.title}</p>}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Description:</label><br />
                    <textarea name="description" value={formData.description} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Start Time:</label><br />
                    {/* TASK: Use datetime-local input */}
                    <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} required style={{ width: '100%' }} />
                    {errors.start_time && <p style={{ color: 'red', fontSize: '12px' }}>{errors.start_time}</p>}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>End Time (Optional):</label><br />
                    <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Location or Link:</label><br />
                    <input type="text" name="location_or_link" value={formData.location_or_link} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Agenda:</label><br />
                    <textarea name="agenda" value={formData.agenda} onChange={handleChange} style={{ width: '100%' }} />
                </div>

                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Save Meeting
                </button>
                <button type="button" onClick={() => navigate(-1)} style={{ marginLeft: '10px', background: 'none', border: '1px solid #ccc', padding: '10px' }}>
                    Cancel
                </button>
            </form>
        </div>
    );
}