const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerRules, loginRules, validate } = require('../utils/validators');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    // Validate request body
    await Promise.all(registerRules.map(validation => validation.run(req)));
    validate(req, res, async () => {
      const { name, email, password, role } = req.body;

      const newUser = await User.create({
        name,
        email,
        password,
        role: role || 'user'
      });

      newUser.password = undefined;

      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        status: 'success',
        token,
        data: {
          user: newUser
        }
      });
    });
  } catch (err) {
    next(err);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    await Promise.all(loginRules.map(validation => validation.run(req)));
    validate(req, res, async () => {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new Error('Please provide email and password'));
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new Error('Incorrect email or password'));
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      user.password = undefined;

      res.status(200).json({
        status: 'success',
        token,
        data: {
          user
        }
      });
    });
  } catch (err) {
    next(err);
  }
};