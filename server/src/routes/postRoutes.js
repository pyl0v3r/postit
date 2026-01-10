const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const postOwnership = require('../middleware/authorizePostOwner');

router.post('/', auth,  postController.createPost);
router.get('/', postController.getAllPosts);
router.put('/:postId', auth, postOwnership, postController.updatePost);
router.delete('/:postId', auth, postOwnership, postController.deletePost);

module.exports = router;
