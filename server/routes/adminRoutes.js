const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsersList,
  toggleUserStatus,
  updateUserRole,
  getReportsList,
  updateReportStatus,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsersList);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/reports', getReportsList);
router.put('/reports/:id', updateReportStatus);

module.exports = router;
