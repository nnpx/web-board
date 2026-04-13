import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticateToken, authController.getMe);

export default router;
