const Expert = require('../models/Expert');

// GET /api/experts
exports.getExperts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 6,
      category,
      search,
    } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expert.countDocuments(query);
    const experts = await Expert.find(query)
      .select('-availableSlots')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: experts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/experts/:id
exports.getExpertById = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // Group available (not booked) slots by date
    const slotsByDate = {};
    expert.availableSlots.forEach((slot) => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push({
        _id: slot._id,
        time: slot.time,
        isBooked: slot.isBooked,
      });
    });

    // Sort each date's slots by time
    Object.keys(slotsByDate).forEach((date) => {
      slotsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    const expertObj = expert.toObject();
    expertObj.slotsByDate = slotsByDate;
    delete expertObj.availableSlots;

    res.json({ success: true, data: expertObj });
  } catch (error) {
    next(error);
  }
};
