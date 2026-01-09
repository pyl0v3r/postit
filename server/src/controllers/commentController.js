const Comment = require('../models/Comment');

exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  const comment = await Comment.create({
    content,
    post: postId,
    author: req.user.userId
  });

  res.status(201).json(comment);
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;

  //  VULNERABILITY: No ownership check
  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  res.json({ message: 'Comment deleted' });
};
