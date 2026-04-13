import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import * as repliesController from "../controllers/replies.controller";

const router = Router();

router.put("/:id", authenticateToken, repliesController.updateReply);
router.delete("/:id", authenticateToken, repliesController.deleteReply);

export default router;
