const express = require('express');
const router = express.Router();
const {
  getUserConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  getConversationById,
  updateGroup,
  addGroupMembers,
  removeGroupMember,
  deleteConversation,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUserConversations);
router.post('/direct', getOrCreateDirectConversation);
router.post('/group', createGroupConversation);
router.get('/:id', getConversationById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteConversation);
router.post('/:id/members', addGroupMembers);
router.delete('/:id/members/:memberId', removeGroupMember);

module.exports = router;
