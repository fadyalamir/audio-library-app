const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../config/multer');

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.get('/profile', userController.getMe);
router.put('/profile', upload.single('profilePic'), userController.updateMe);

module.exports = router;