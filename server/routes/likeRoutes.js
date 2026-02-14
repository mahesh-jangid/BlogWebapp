const express = require('express');
const {
  toggleLike,
  checkLike,
  getLikeCount,
} = require('../controllers/likeController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, toggleLike);
router.get('/check/:blogId', auth, checkLike);
router.get('/count/:blogId', getLikeCount);

module.exports = router;
