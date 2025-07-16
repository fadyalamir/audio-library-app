const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../config/multer');

// Public routes
router.get('/', audioController.getAllAudios);

// Protected routes
router.use(authMiddleware.protect);

router.get('/mine', audioController.getMyAudios);
router.get('/stream/:id', audioController.streamAudio);

// Routes that require file uploads
router.post(
  '/',
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  audioController.uploadAudio
);

router.put(
  '/:id',
  upload.fields([{ name: 'cover', maxCount: 1 }]),
  audioController.updateAudio
);

router.delete('/:id', audioController.deleteAudio);

module.exports = router;