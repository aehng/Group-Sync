import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createMeeting } from "../api/meetings";
import { Button, Card, Input, Error } from "./shared";

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

    const formatErrors = (errorsObj) => {
        if (!errorsObj) return null;
        if (typeof errorsObj === "string") return errorsObj;
        if (errorsObj.detail) return errorsObj.detail;

        const messages = Object.values(errorsObj)
            .flatMap((val) => (Array.isArray(val) ? val : [val]))
            .filter(Boolean);

        return messages.join(" ");
    };

    const fieldError = (field) => {
        const fieldValue = errors?.[field];
        if (!fieldValue) return null;
        return Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
    };

    const errorMessage = formatErrors(errors);

    return (
        <div style={{ maxWidth: 720, margin: "20px auto", padding: 20 }}>
            <Card title="Create New Meeting" compact>
                {errorMessage && (
                    <Error title="Unable to create meeting" message={errorMessage} />
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
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
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    <Input
                        label="Start Time"
                        name="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={handleChange}
                        required
                        errorText={fieldError("start_time")}
                    />

                    <Input
                        label="End Time (optional)"
                        name="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={handleChange}
                    />

                    <Input
                        label="Location or Link"
                        name="location_or_link"
                        value={formData.location_or_link}
                        onChange={handleChange}
                    />

                    <div className="field">
                        <label className="label" htmlFor="agenda">
                            Agenda
                        </label>
                        <textarea
                            id="agenda"
                            name="agenda"
                            className="input"
                            value={formData.agenda}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    <div className="card-actions">
                        <Button type="submit" variant="primary">
                            Save Meeting
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
