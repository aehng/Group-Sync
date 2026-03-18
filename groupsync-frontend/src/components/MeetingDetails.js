import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMeeting, updateMeeting, deleteMeeting } from "../api/meetings";
import { Button, Card, Input, Loading, Error } from "./shared";

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

    if (!meeting) return <Loading label="Loading meeting..." />;

    const meetingTime = `${new Date(meeting.start_time).toLocaleString()}${meeting.end_time ? ` - ${new Date(meeting.end_time).toLocaleString()}` : ""}`;

    const formatErrors = (errorsObj) => {
        if (!errorsObj) return null;
        if (typeof errorsObj === "string") return errorsObj;
        if (errorsObj.detail) return errorsObj.detail;

        const messages = Object.values(errorsObj)
            .flatMap((val) => (Array.isArray(val) ? val : [val]))
            .filter(Boolean);

        return messages.join(" ");
    };

    const errorMessage = formatErrors(errors);
    const fieldError = (field) => {
        const fieldValue = errors?.[field];
        if (!fieldValue) return null;
        return Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
    };

    return (
        <div style={{ maxWidth: 720, margin: "20px auto", padding: 20 }}>
            {isEditing ? (
                <Card title="Edit Meeting" compact>
                    {errorMessage && <Error title="Could not save meeting" message={errorMessage} />}
                    <form onSubmit={handleUpdate}>
                        <Input
                            label="Title"
                            name="title"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            errorText={fieldError("title")}
                        />
                        <div className="field">
                            <label className="label" htmlFor="description">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="input"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>
                        <Input
                            label="Start Time"
                            name="start_time"
                            type="datetime-local"
                            value={formData.start_time?.slice(0, 16) || ""}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            required
                            errorText={fieldError("start_time")}
                        />
                        <Input
                            label="End Time (optional)"
                            name="end_time"
                            type="datetime-local"
                            value={formData.end_time?.slice(0, 16) || ""}
                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        />
                        <Input
                            label="Location or Link"
                            name="location_or_link"
                            value={formData.location_or_link || ""}
                            onChange={(e) => setFormData({ ...formData, location_or_link: e.target.value })}
                        />
                        <div className="card-actions">
                            <Button type="submit" variant="primary">
                                Save Changes
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            ) : (
                <Card title={meeting.title} subtitle={meetingTime}>
                    {meeting.description && (
                        <p>
                            <strong>Description:</strong> {meeting.description}
                        </p>
                    )}
                    <p>
                        <strong>Location/Link:</strong> {meeting.location_or_link || "No location provided"}
                    </p>
                    <p>
                        <strong>Agenda:</strong> {meeting.agenda || "No agenda set"}
                    </p>
                    <p>
                        <strong>Created by:</strong> {meeting.creator_name || "Group Member"}
                    </p>

                    <div className="card-actions" style={{ marginTop: 12 }}>
                        {user?.id === meeting.creator && (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Meeting
                                </Button>
                                <Button variant="danger" onClick={handleDelete}>
                                    Delete Meeting
                                </Button>
                            </>
                        )}
                        <Button variant="secondary" onClick={() => navigate(-1)}>
                            Back to List
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}