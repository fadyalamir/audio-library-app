const Audio = require('../models/Audio');
const fs = require('fs');
const path = require('path');
const { audioRules, validate } = require('../utils/validators');

// Upload new audio
exports.uploadAudio = async (req, res, next) => {
  try {
    await Promise.all(audioRules.map(validation => validation.run(req)));
    validate(req, res, async () => {
      const { title, genre, isPrivate } = req.body;
      
      // Check if audio file was uploaded
      if (!req.files || !req.files.audio) {
        return next(new Error('Audio file is required'));
      }
      
      const audioFile = req.files.audio[0].filename;
      const coverImage = req.files.cover ? req.files.cover[0].filename : undefined;
      
      // Create new audio document
      const newAudio = await Audio.create({
        title,
        genre,
        audioFile,
        coverImage,
        isPrivate: isPrivate || false,
        user: req.user.id
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          audio: newAudio
        }
      });
    });
  } catch (err) {
    next(err);
  }
};

// Get all public audios
exports.getAllAudios = async (req, res, next) => {
  try {
    const audios = await Audio.find({ isPrivate: false });
    
    res.status(200).json({
      status: 'success',
      results: audios.length,
      data: {
        audios
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get my audios (both public and private)
exports.getMyAudios = async (req, res, next) => {
  try {
    const audios = await Audio.find({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      results: audios.length,
      data: {
        audios
      }
    });
  } catch (err) {
    next(err);
  }
};

// Stream audio file
exports.streamAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    
    // Check if audio exists
    if (!audio) {
      return next(new Error('No audio found with that ID'));
    }
    
    // Check permissions
    if (audio.isPrivate && !audio.user.equals(req.user.id) && req.user.role !== 'admin') {
      return next(new Error('You do not have permission to access this audio'));
    }
    
    const filePath = path.join(__dirname, '../uploads/audio', audio.audioFile);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(new Error('Audio file not found'));
    }
    
    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // Handle range requests for streaming
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'audio/mpeg'
      });
      
      file.pipe(res);
    } else {
      // Send entire file if no range requested
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg'
      });
      
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
};

// Update audio
exports.updateAudio = async (req, res, next) => {
  try {
    await Promise.all(audioRules.map(validation => validation.run(req)));
    validate(req, res, async () => {
      const { title, genre, isPrivate } = req.body;
      
      // Find audio and check ownership
      const audio = await Audio.findById(req.params.id);
      if (!audio) {
        return next(new Error('No audio found with that ID'));
      }
      
      if (!audio.user.equals(req.user.id)) {
        return next(new Error('You can only update your own audios'));
      }
      
      // Handle cover image update
      if (req.files && req.files.cover) {
        // Delete old cover image if exists and not default
        if (audio.coverImage !== 'default-cover.jpg') {
          const oldCoverPath = path.join(__dirname, '../uploads/covers', audio.coverImage);
          if (fs.existsSync(oldCoverPath)) {
            fs.unlinkSync(oldCoverPath);
          }
        }
        
        audio.coverImage = req.files.cover[0].filename;
      }
      
      // Update fields
      if (title) audio.title = title;
      if (genre) audio.genre = genre;
      if (isPrivate !== undefined) audio.isPrivate = isPrivate;
      
      await audio.save();
      
      res.status(200).json({
        status: 'success',
        data: {
          audio
        }
      });
    });
  } catch (err) {
    next(err);
  }
};

// Delete audio
exports.deleteAudio = async (req, res, next) => {
  try {
    const audio = await Audio.findById(req.params.id);
    
    // Check if audio exists
    if (!audio) {
      return next(new Error('No audio found with that ID'));
    }
    
    // Check permissions (owner or admin)
    if (!audio.user.equals(req.user.id) && req.user.role !== 'admin') {
      return next(new Error('You can only delete your own audios'));
    }
    
    // Delete audio file
    const audioPath = path.join(__dirname, '../uploads/audio', audio.audioFile);
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    
    // Delete cover image if exists and not default
    if (audio.coverImage !== 'default-cover.jpg') {
      const coverPath = path.join(__dirname, '../uploads/covers', audio.coverImage);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    
    // Delete from database
    await Audio.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

// Admin - Get all audios
exports.adminGetAllAudios = async (req, res, next) => {
  try {
    const audios = await Audio.find();
    
    res.status(200).json({
      status: 'success',
      results: audios.length,
      data: {
        audios
      }
    });
  } catch (err) {
    next(err);
  }
};