import Post from "../models/Post.js";

export const createPost = async (req, res) => {
  const { content } = req.body;
  try {
    const post = new Post({
      author: req.user.id,
      content,
    });
    await post.save();
    await post.populate("author", "name profilePicture");
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "name profilePicture");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};