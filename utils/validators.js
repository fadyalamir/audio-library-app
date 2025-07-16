const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');

// Reusable validation rules
exports.registerRules = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .custom(async email => {
      const user = await User.findOne({ email });
      if (user) throw new Error('Email already in use');
    }),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number')
];

exports.loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.audioRules = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  
  body('genre')
    .notEmpty().withMessage('Genre is required')
    .isIn(['education', 'religion', 'comedy', 'fiction', 'self-help'])
    .withMessage('Invalid genre selected'),
  
  body('isPrivate').optional().isBoolean()
];

// Validate request
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array()
    });
  }
  next();
};