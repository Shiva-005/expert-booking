const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
    expertName: { type: String, required: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    userPhone: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    timeSlot: { type: String, required: true }, // HH:MM
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Compound index to prevent double booking at DB level
bookingSchema.index(
  { expert: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

bookingSchema.index({ userEmail: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
