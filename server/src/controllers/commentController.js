const Comment = require('../models/Comment');
const Post = require('../models/Post');
const sanitizeHtml = require('sanitize-html');

exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Comment content is required' });
  }

  const cleanContent = sanitizeHtml(content, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: {}
  });

  if (!cleanContent || cleanContent.trim().length === 0) {
    return res.status(400).json({
      message: 'Comment contains disallowed or unsafe content'
    });
  }

  if (cleanContent.length > 500) {
    return res.status(400).json({ message: 'Comment too long' });
  }
  console.log('Creating comment with content:', req.body, cleanContent);
  const comment = await Comment.create({
    content: cleanContent,
    post: postId,
    author: req.user.userId
  });
  // Link comment to post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id }
  });

  res.status(201).json(comment);
};
exports.getCommentsByPost = async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ post: postId }).populate('author', 'username');
  res.json(comments);
};
exports.updateComment = async (req, res) => {
  const { content } = req.body;
  req.comment.content = content;
  await req.comment.save();
  res.json(req.comment);
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;

  await Comment.deleteOne({ _id: commentId });

  // Remove reference from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId }
  });

  res.json({ message: 'Comment deleted' });
};
