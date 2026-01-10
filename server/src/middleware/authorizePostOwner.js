const Post = require('../models/Post');

module.exports = async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  if (post.author.toString() !== req.user.userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  req.post = post;
  next();
};
