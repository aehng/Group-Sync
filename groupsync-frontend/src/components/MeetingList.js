import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listGroupMeetings } from "../api/meetings";
import MeetingCard from "./MeetingCard";
import { Button, Error, Loading } from "./shared";

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
        <div className="container">
            <div className="flex-between" style={{ marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>Group Meetings</h2>
                <Button
                    variant="primary"
                    onClick={() => navigate(`/groups/${groupId}/meetings/new`)}
                >
                    + Create Meeting
                </Button>
            </div>

            <div className="card-actions" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
                <Button
                    variant={filter === 'all' ? 'primary' : 'secondary'}
                    onClick={() => setFilter('all')}
                >
                    All
                </Button>
                <Button
                    variant={filter === 'upcoming' ? 'primary' : 'secondary'}
                    onClick={() => setFilter('upcoming')}
                >
                    Upcoming
                </Button>
                <Button
                    variant={filter === 'past' ? 'primary' : 'secondary'}
                    onClick={() => setFilter('past')}
                >
                    Past
                </Button>
            </div>

            {isLoading ? (
                <Loading label="Loading meetings..." />
            ) : error ? (
                <Error title="Unable to load meetings" message={error} />
            ) : meetings.length === 0 ? (
                <div className="card">
                    <p style={{ margin: 0, color: 'var(--color-muted)' }}>
                        No meetings found for this filter.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {meetings.map((m) => (
                        <MeetingCard key={m.id} meeting={m} groupId={groupId} />
                    ))}
                </div>
            )}
        </div>
    );
}