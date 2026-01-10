const Comment = require('../models/Comment');

module.exports = async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  if (comment.author.toString() !== req.user.userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  req.comment = comment;
  next();
};
