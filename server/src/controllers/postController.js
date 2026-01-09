const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  const { title, content } = req.body;

  const post = await Post.create({
    title,
    content,
    author: req.user.userId
  });

  res.status(201).json(post);
};

exports.getAllPosts = async (req, res) => {
  const posts = await Post.find().populate('author', 'username');
  res.json(posts);
};

exports.updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  //  VULNERABILITY: No ownership check (IDOR)
  const post = await Post.findByIdAndUpdate(
    postId,
    { title, content },
    { new: true }
  );

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  res.json(post);
};

exports.deletePost = async (req, res) => {
  const { postId } = req.params;

  //  VULNERABILITY: No ownership check (IDOR)
  const post = await Post.findByIdAndDelete(postId);

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  res.json({ message: 'Post deleted' });
};
