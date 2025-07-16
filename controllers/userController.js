const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Get current user profile
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update user profile
exports.updateMe = async (req, res, next) => {
  try {
    // Filter out unwanted fields
    const filteredBody = {};
    if (req.body.name) filteredBody.name = req.body.name;
    
    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture if exists and not default
      if (req.user.profilePic !== 'default.jpg') {
        const oldPicPath = path.join(__dirname, '../uploads/profiles', req.user.profilePic);
        if (fs.existsSync(oldPicPath)) {
          fs.unlinkSync(oldPicPath);
        }
      }
      
      filteredBody.profilePic = req.file.filename;
    }
    
    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};