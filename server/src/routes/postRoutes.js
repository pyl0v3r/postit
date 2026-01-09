const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

router.post('/', auth, postController.createPost);
router.get('/', postController.getAllPosts);
router.put('/:postId', auth, postController.updatePost);
router.delete('/:postId', auth, postController.deletePost);

module.exports = router;
