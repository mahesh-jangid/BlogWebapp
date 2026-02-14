const express = require('express');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createComment);
router.get('/:blogId', getComments);
router.put('/:id', auth, updateComment);
router.delete('/:id', auth, deleteComment);
router.post('/:id/like', auth, likeComment);

module.exports = router;
