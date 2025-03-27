import Post from "../models/Post.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
  const { content, image, hashtags, taggedUsers } = req.body;
  if (!content) {
    return res.status(400).json({ message: "Post content is required" });
  }

  try {
    const post = new Post({
      author: req.user.id,
      content,
      image,
      hashtags: hashtags ? hashtags.split(",").map((tag) => tag.trim()) : [],
      taggedUsers: taggedUsers || [],
      likes: [],
      comments: [],
    });
    await post.save();
    await post.populate("author", "name profilePicture");
    await post.populate("taggedUsers", "name");

    if (taggedUsers && taggedUsers.length > 0) {
      const sender = await User.findById(req.user.id);
      for (const userId of taggedUsers) {
        const notification = new Notification({
          userId,
          message: `${sender.name} tagged you in a post.`,
          type: "post",
          relatedId: post._id,
        });
        await notification.save();
      }
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "name profilePicture")
      .populate("taggedUsers", "name")
      .populate("comments.author", "name profilePicture");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const likePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
      const sender = await User.findById(req.user.id);
      const notification = new Notification({
        userId: post.author,
        message: `${sender.name} liked your post.`,
        type: "post",
        relatedId: post._id,
      });
      await notification.save();
    }
    await post.save();
    await post.populate("author", "name profilePicture");
    await post.populate("taggedUsers", "name");
    await post.populate("comments.author", "name profilePicture");
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const commentOnPost = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.comments.push({
      author: req.user.id,
      content,
    });
    await post.save();
    await post.populate("author", "name profilePicture");
    await post.populate("taggedUsers", "name");
    await post.populate("comments.author", "name profilePicture");

    const sender = await User.findById(req.user.id);
    const notification = new Notification({
      userId: post.author,
      message: `${sender.name} commented on your post.`,
      type: "post",
      relatedId: post._id,
    });
    await notification.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};