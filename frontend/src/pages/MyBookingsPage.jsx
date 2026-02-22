import { useState } from 'react';
import { useBookings } from '../hooks/useData';

const StatusBadge = ({ status }) => (
  <span className={`status-badge status-${status}`}>{status}</span>
);

const formatDateTime = (date, time) => {
  const d = new Date(date + 'T00:00:00');
  const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return `${dateStr} at ${time}`;
};

export default function MyBookingsPage() {
  const [email, setEmail] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const { bookings, loading, error, fetchBookings } = useBookings();

  const handleSearch = () => {
    const trimmed = inputEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setEmail(trimmed);
    fetchBookings(trimmed);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

  const statusOrder = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
  const sorted = [...bookings].sort((a, b) =>
    statusOrder[a.status] - statusOrder[b.status] || new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Enter your email to view all your sessions</p>
      </div>

      <div className="email-lookup">
        <input
          type="email"
          className="search-input"
          placeholder="your@email.com"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      {loading && (
        <div className="loading-wrap">
          <div className="spinner" />
          <span>Loading bookings...</span>
        </div>
      )}

      {error && <div className="alert alert-error">⚠ {error}</div>}

      {!loading && email && bookings.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No bookings found</div>
          <p>No sessions found for <strong>{email}</strong></p>
        </div>
      )}

      {sorted.length > 0 && (
        <>
          <p className="results-count" style={{ marginBottom: 8 }}>
            {sorted.length} booking{sorted.length !== 1 ? 's' : ''} for <strong>{email}</strong>
          </p>
          <div className="bookings-list">
            {sorted.map((booking) => (
              <div key={booking._id} className="card booking-card">
                <div className="booking-info">
                  <div className="booking-expert">
                    Session with {booking.expertName}
                  </div>
                  <div className="booking-datetime">
                    📅 {formatDateTime(booking.date, booking.timeSlot)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {booking.expert?.category && <span>{booking.expert.category} · </span>}
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                  {booking.notes && (
                    <div className="booking-notes">"{booking.notes}"</div>
                  )}
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
