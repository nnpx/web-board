import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import * as postsController from "../controllers/posts.controller";

const router = Router();

router.post("/", authenticateToken, postsController.createPost);
router.get("/", postsController.getPosts);
router.get("/:id", postsController.getPostById);
router.post("/:id/view", postsController.viewPost);
router.delete("/:id", authenticateToken, postsController.deletePost);

// Replies endpoints
router.get("/:postId/replies", postsController.getPostReplies);
router.post("/:postId/replies", authenticateToken, postsController.createPostReply);

export default router;
