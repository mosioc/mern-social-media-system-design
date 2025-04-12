import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { broadcast } from '../index.js'; // Adjust the import path as needed

/* CREATE */
const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath, code } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      code: code ? JSON.parse(code) : null,
      likes: {},
      comments: [],
    });
    await newPost.save();
    broadcast({ type: 'NEW_POST', post: newPost });

    const posts = await Post.find();
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
const getFeedPosts = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();
    const hasMore = total > skip + posts.length;

    res.status(200).json({
      posts,
      hasMore
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ userId });
    const hasMore = total > skip + posts.length;

    res.status(200).json({
      posts,
      hasMore
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    const posts = await Post.find({
      $or: [
        { description: { $regex: query, $options: "i" } },
        // Add search in code content
        { "code.content": { $regex: query, $options: "i" } }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getFriendsPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get user's friends
    const user = await User.findById(userId);
    const friends = user.friends;

    // Get posts from friends
    const posts = await Post.find({ 
      userId: { $in: [...friends, userId] } 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ 
      userId: { $in: [...friends, userId] } 
    });
    const hasMore = total > skip + posts.length;

    res.status(200).json({
      posts,
      hasMore
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    // Broadcast the like update
    broadcast({ type: 'UPDATE_POST', post: updatedPost });
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid or missing post ID" });
    }
    const deletedPost = await Post.findByIdAndDelete(id);
    
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error deleting post:", err); // Add this line
    res.status(500).json({ message: err.message });
  }
};

const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { description },
      { new: true }
    );
    
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    broadcast({ type: 'UPDATE_POST', post: updatedPost });
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      text,
      userPicturePath: user.picturePath,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    const updatedPost = await post.save();
    
    broadcast({ type: 'UPDATE_POST', post: updatedPost });
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  deletePost,
  editPost,
  addComment,
  searchPosts,
  getFriendsPosts
};