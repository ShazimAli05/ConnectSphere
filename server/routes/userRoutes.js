const express = require('express');
const router = express.Router();
const {
  searchUsers,
  getUserById,
  updateProfile,
  updatePassword,
  getAllUsers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/search', searchUsers);
router.get('/', getAllUsers);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.get('/:id', getUserById);

module.exports = router;
