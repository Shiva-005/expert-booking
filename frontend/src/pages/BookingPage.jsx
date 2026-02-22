import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../services/api';

const validate = (fields) => {
  const errors = {};
  if (!fields.userName.trim()) errors.userName = 'Full name is required';
  else if (fields.userName.trim().length < 2) errors.userName = 'Name must be at least 2 characters';

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fields.userEmail) errors.userEmail = 'Email is required';
  else if (!emailRe.test(fields.userEmail)) errors.userEmail = 'Enter a valid email address';

  const phoneRe = /^[+\d\s\-()]{7,20}$/;
  if (!fields.userPhone) errors.userPhone = 'Phone number is required';
  else if (!phoneRe.test(fields.userPhone)) errors.userPhone = 'Enter a valid phone number';

  if (fields.notes && fields.notes.length > 500) errors.notes = 'Notes cannot exceed 500 characters';

  return errors;
};

export default function BookingPage() {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { date, timeSlot, expertName } = state || {};

  const [form, setForm] = useState({ userName: '', userEmail: '', userPhone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState(null);

  if (!date || !timeSlot) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <div className="empty-title">No slot selected</div>
        <p style={{ marginBottom: 24 }}>Please go back and select a time slot first.</p>
        <Link to={`/experts/${expertId}`}><button className="btn btn-primary">← Back to Expert</button></Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const result = await bookingApi.createBooking({
        expertId,
        ...form,
        date,
        timeSlot,
      });
      setBookingRef(result.data);
      setSuccess(true);
    } catch (err) {
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach(({ field, message }) => { fieldErrors[field] = message; });
        setErrors(fieldErrors);
      } else {
        setApiError(err.message || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <div className="card success-card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="success-icon">✓</div>
          <h2 className="success-title">Booking Confirmed!</h2>
          <p className="success-sub">
            Your session with <strong>{expertName}</strong> on {date} at {timeSlot} has been booked.
            You'll receive a confirmation at <strong>{bookingRef?.userEmail}</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
              View My Bookings
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Browse Experts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Expert
      </button>

      <div className="page-header">
        <h1 className="page-title">Book a Session</h1>
        <p className="page-subtitle">Fill in your details to confirm the booking</p>
      </div>

      {/* Booking Summary */}
      <div className="booking-summary">
        <div className="booking-summary-item">
          <span className="booking-summary-label">Expert</span>
          <span className="booking-summary-value">{expertName}</span>
        </div>
        <div className="booking-summary-item">
          <span className="booking-summary-label">Date</span>
          <span className="booking-summary-value">{date}</span>
        </div>
        <div className="booking-summary-item">
          <span className="booking-summary-label">Time</span>
          <span className="booking-summary-value">{timeSlot}</span>
        </div>
      </div>

      <div className="card booking-form-card">
        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="userName"
                className={`form-input ${errors.userName ? 'error' : ''}`}
                placeholder="John Doe"
                value={form.userName}
                onChange={handleChange}
              />
              {errors.userName && <span className="form-error-msg">{errors.userName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                name="userPhone"
                className={`form-input ${errors.userPhone ? 'error' : ''}`}
                placeholder="+1 555 000 0000"
                value={form.userPhone}
                onChange={handleChange}
              />
              {errors.userPhone && <span className="form-error-msg">{errors.userPhone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="userEmail"
              className={`form-input ${errors.userEmail ? 'error' : ''}`}
              placeholder="you@example.com"
              value={form.userEmail}
              onChange={handleChange}
            />
            {errors.userEmail && <span className="form-error-msg">{errors.userEmail}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              name="notes"
              className={`form-textarea ${errors.notes ? 'error' : ''}`}
              placeholder="What would you like to discuss? Any specific questions or topics?"
              value={form.notes}
              onChange={handleChange}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{form.notes.length}/500</span>
            {errors.notes && <span className="form-error-msg">{errors.notes}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Confirming...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
