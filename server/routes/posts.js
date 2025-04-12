import express from "express";
import { 
  getFeedPosts, 
  getUserPosts, 
  likePost,
  searchPosts, 
  getFriendsPosts, 
  deletePost, 
  editPost, 
  addComment
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);
router.get("/search", verifyToken, searchPosts);
router.get("/friends/:userId", verifyToken, getFriendsPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
router.patch("/:id", verifyToken, editPost);
router.delete("/:id", verifyToken, deletePost);

router.post("/:id/comment", verifyToken, addComment);

export default router;