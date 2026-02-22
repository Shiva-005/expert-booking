# ExpertConnect — Real-Time Expert Session Booking System

A full-stack MERN application for booking expert sessions with real-time slot updates via Socket.io.

---

## 📁 Project Structure

```
expert-booking/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── expertController.js  # Expert listing + detail logic
│   │   └── bookingController.js # Booking creation, status updates
│   ├── middleware/
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── Expert.js            # Expert + availableSlots schema
│   │   └── Booking.js           # Booking schema (unique index)
│   ├── routes/
│   │   ├── expertRoutes.js      # GET /experts, GET /experts/:id
│   │   └── bookingRoutes.js     # POST/GET/PATCH /bookings
│   ├── socket/
│   │   └── socketManager.js     # Socket.io room management
│   ├── .env                     # Environment variables
│   ├── seed.js                  # Database seeder (8 experts)
│   └── server.js                # Express + Socket.io entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   └── ExpertCard.jsx
        ├── context/
        │   └── SocketContext.jsx  # Global Socket.io connection
        ├── hooks/
        │   └── useData.js         # useExperts, useExpert, useBookings
        ├── pages/
        │   ├── ExpertListPage.jsx  # Search, filter, pagination
        │   ├── ExpertDetailPage.jsx # Live slot updates
        │   ├── BookingPage.jsx     # Form with full validation
        │   └── MyBookingsPage.jsx  # Email-based booking lookup
        ├── services/
        │   └── api.js             # Centralized API calls
        ├── App.jsx
        └── App.css
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MONGODB_URI

# Seed the database with 8 sample experts
npm run seed

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🌐 API Reference

### Experts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experts` | List experts with pagination + filter |
| GET | `/api/experts/:id` | Expert details with slots grouped by date |

**Query params for GET /experts:**
- `page` (default: 1)
- `limit` (default: 6)
- `category` — Technology, Business, Design, etc.
- `search` — searches name and skills

### Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings?email=` | Get bookings by email |
| PATCH | `/api/bookings/:id/status` | Update booking status |

---

## ⚡ Key Technical Decisions

### 🔒 Double Booking Prevention (Race Condition Safe)

The booking flow uses two layers of protection:

**Layer 1 — Atomic MongoDB findOneAndUpdate:**
```js
Expert.findOneAndUpdate(
  { _id: expertId, availableSlots: { $elemMatch: { date, time: timeSlot, isBooked: false } } },
  { $set: { 'availableSlots.$[elem].isBooked': true } },
  { arrayFilters: [{ 'elem.date': date, 'elem.time': timeSlot, 'elem.isBooked': false }], session }
)
```
This atomically finds the expert only if the slot is free AND marks it as booked in a single operation inside a MongoDB transaction.

**Layer 2 — Unique Compound Index:**
```js
bookingSchema.index(
  { expert: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
)
```
Even if two requests race past Layer 1, MongoDB's unique index ensures only one booking persists.

### 📡 Real-Time Slot Updates (Socket.io)

- Each expert detail page **joins a room**: `expert:{expertId}`
- When a slot is booked, server **emits to that room**: `slotBooked` event
- Other users on the same expert page **instantly see the slot go grey/disabled**
- No polling — true push-based updates

---

## 🎨 Design System

- **Theme**: Dark, professional editorial
- **Fonts**: Syne (display) + DM Sans (body)
- **Accent**: `#7c6af7` — deep violet
- **Success**: `#22d3a0` — teal green

---

## 📋 Booking Status Flow

```
pending → confirmed → completed
    ↘               ↗
      cancelled ────
```

Status can be updated via `PATCH /api/bookings/:id/status`

---

## 🛡 Validation

**Backend (express-validator):**
- Name: required, 2–100 chars
- Email: valid format, normalized
- Phone: pattern `/^[+\d\s\-()]{7,20}$/`
- Date: `YYYY-MM-DD` format
- Time: `HH:MM` format
- Notes: max 500 chars

**Frontend:**
- Real-time field-level error display
- Submit blocked until valid
- API errors surfaced inline (including slot-conflict 409s)
