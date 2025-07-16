const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');
const authMiddleware = require('../middlewares/auth');

// Protect and restrict to admin
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/audios', audioController.adminGetAllAudios);

module.exports = router;