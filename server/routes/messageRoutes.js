const express = require('express');
const router = express.Router();
const {
  getMessagesByConversation,
  sendMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:conversationId', getMessagesByConversation);
router.post('/', sendMessage);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.post('/:id/reactions', toggleReaction);

module.exports = router;
