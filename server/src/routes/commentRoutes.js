const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/:postId/comments', auth, commentController.createComment);
router.delete('/comments/:commentId', auth, commentController.deleteComment);

module.exports = router;
