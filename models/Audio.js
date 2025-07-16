const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    minlength: [3, 'Title must be at least 3 characters']
  },
  genre: {
    type: String,
    required: [true, 'Please provide a genre'],
    enum: ['education', 'religion', 'comedy', 'fiction', 'self-help']
  },
  audioFile: {
    type: String,
    required: [true, 'Audio file is required']
  },
  coverImage: {
    type: String,
    default: 'default-cover.jpg'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Audio must belong to a user']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Populate user data when querying audio
audioSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name profilePic'
  });
  next();
});

const Audio = mongoose.model('Audio', audioSchema);
module.exports = Audio;