const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const commentOwnership = require('../middleware/authorizeCommentOwner');

router.get('/:postId/comments', commentController.getCommentsByPost);
router.post('/:postId/comments', auth, commentController.createComment);
router.put('/:postId/comments/:commentId', auth, commentOwnership, commentController.updateComment);
router.delete('/comments/:commentId', auth, commentOwnership, commentController.deleteComment);

module.exports = router;
