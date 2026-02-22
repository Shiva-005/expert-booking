import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpert } from '../hooks/useData';
import { useSocket } from '../context/SocketContext';
import { Avatar, StarRating } from '../components/ExpertCard';

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function ExpertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expert, loading, error, updateSlot } = useExpert(id);
  const socketRef = useSocket();
  const updatedSlotsRef = useRef(new Set());

  // Real-time slot updates
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !id) return;

    socket.emit('joinExpertRoom', id);

    const handleSlotBooked = ({ expertId, date, timeSlot }) => {
      if (expertId !== id) return;
      updateSlot(date, timeSlot, true);
      // Add flash animation key
      const key = `${date}-${timeSlot}`;
      updatedSlotsRef.current.add(key);
      setTimeout(() => updatedSlotsRef.current.delete(key), 700);
    };

    const handleSlotFreed = ({ expertId, date, timeSlot }) => {
      if (expertId !== id) return;
      updateSlot(date, timeSlot, false);
    };

    socket.on('slotBooked', handleSlotBooked);
    socket.on('slotFreed', handleSlotFreed);

    return () => {
      socket.off('slotBooked', handleSlotBooked);
      socket.off('slotFreed', handleSlotFreed);
      socket.emit('leaveExpertRoom', id);
    };
  }, [id, socketRef, updateSlot]);

  if (loading) return <div className="loading-wrap"><div className="spinner"/><span>Loading expert...</span></div>;
  if (error) return <div className="error-wrap">⚠ {error}</div>;
  if (!expert) return null;

  const sortedDates = Object.keys(expert.slotsByDate || {}).sort();

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Experts
      </button>

      <div className="expert-detail-wrap">
        {/* Left: Expert Info */}
        <div>
          <div className="card expert-detail-hero">
            <div className="expert-detail-header">
              <Avatar name={expert.name} avatar={expert.avatar} size="lg" />
              <div>
                <span className="expert-category">{expert.category}</span>
                <h1 className="expert-detail-name">{expert.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRating rating={expert.rating} />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {expert.rating} · {expert.totalReviews} reviews
                  </span>
                </div>
              </div>
            </div>

            <p className="expert-detail-bio">{expert.bio}</p>

            <div className="detail-stats">
              <div className="detail-stat">
                <div className="detail-stat-value">{expert.experience}</div>
                <div className="detail-stat-label">Years Exp</div>
              </div>
              <div className="detail-stat">
                <div className="detail-stat-value">${expert.hourlyRate}</div>
                <div className="detail-stat-label">Per Hour</div>
              </div>
              <div className="detail-stat">
                <div className="detail-stat-value">{expert.rating}★</div>
                <div className="detail-stat-label">Rating</div>
              </div>
            </div>

            {expert.skills?.length > 0 && (
              <>
                <div className="section-title">Skills & Expertise</div>
                <div className="expert-skills">
                  {expert.skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Slots */}
        <div className="card slots-panel">
          <div className="slots-panel-title">
            Available Slots
            <span className="live-indicator">
              <span className="live-dot" />
              Live
            </span>
          </div>

          {sortedDates.length === 0 && (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">📅</div>
              <div className="empty-title">No slots available</div>
            </div>
          )}

          {sortedDates.map((date) => (
            <div key={date} className="date-group">
              <div className="date-label">{formatDate(date)}</div>
              <div className="slots-grid">
                {expert.slotsByDate[date].map((slot) => (
                  <button
                    key={slot._id}
                    className={`slot-btn ${slot.isBooked ? 'booked' : ''}`}
                    disabled={slot.isBooked}
                    onClick={() => !slot.isBooked && navigate(`/book/${id}`, {
                      state: { date, timeSlot: slot.time, expertName: expert.name }
                    })}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="divider" />

          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Slots update in real-time as others book. Click any available slot to proceed.
          </div>
        </div>
      </div>
    </div>
  );
}
