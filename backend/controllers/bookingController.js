const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

// POST /api/bookings
exports.createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { expertId, userName, userEmail, userPhone, date, timeSlot, notes } = req.body;

    // 1. Find expert and lock the slot atomically
    const expert = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        availableSlots: {
          $elemMatch: { date, time: timeSlot, isBooked: false },
        },
      },
      {
        $set: { 'availableSlots.$[elem].isBooked': true },
      },
      {
        arrayFilters: [{ 'elem.date': date, 'elem.time': timeSlot, 'elem.isBooked': false }],
        new: true,
        session,
      }
    );

    if (!expert) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked or unavailable. Please select another slot.',
      });
    }

    // 2. Create the booking record
    const booking = new Booking({
      expert: expertId,
      expertName: expert.name,
      userName,
      userEmail,
      userPhone,
      date,
      timeSlot,
      notes,
    });

    await booking.save({ session });
    await session.commitTransaction();
    session.endSession();

    // 3. Emit real-time update via Socket.io
    req.io.to(`expert:${expertId}`).emit('slotBooked', {
      expertId,
      date,
      timeSlot,
      isBooked: true,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Handle MongoDB duplicate key error (double booking safety net)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot was just booked by someone else. Please select another slot.',
      });
    }
    next(error);
  }
};

// GET /api/bookings?email=
exports.getBookingsByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query parameter is required' });
    }

    const bookings = await Booking.find({ userEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .populate('expert', 'name category avatar');

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // If cancelled, free up the slot
    if (status === 'cancelled') {
      await Expert.updateOne(
        { _id: booking.expert },
        {
          $set: { 'availableSlots.$[elem].isBooked': false },
        },
        {
          arrayFilters: [{ 'elem.date': booking.date, 'elem.time': booking.timeSlot }],
        }
      );

      req.io.to(`expert:${booking.expert}`).emit('slotFreed', {
        expertId: booking.expert,
        date: booking.date,
        timeSlot: booking.timeSlot,
        isBooked: false,
      });
    }

    // Notify the booking update
    req.io.emit('bookingStatusUpdated', { bookingId: booking._id, status });

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
