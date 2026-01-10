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
  const { title, content } = req.body;
  req.post.title = title;
  req.post.content = content;
  await req.post.save();
  res.json(req.post);
};

exports.deletePost = async (req, res) => {
  await req.post.deleteOne();
  res.json({ message: 'Post deleted' });
};
