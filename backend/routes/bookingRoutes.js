const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  createBooking,
  getBookingsByEmail,
  updateBookingStatus,
} = require('../controllers/bookingController');

const bookingValidation = [
  body('expertId').notEmpty().withMessage('Expert ID is required'),
  body('userName')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2–100 characters'),
  body('userEmail').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('userPhone')
    .matches(/^[+\d\s\-()]{7,20}$/)
    .withMessage('Valid phone number is required'),
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('timeSlot')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Time slot must be in HH:MM format'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes max 500 characters'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

router.post('/', bookingValidation, validate, createBooking);
router.get('/', getBookingsByEmail);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
