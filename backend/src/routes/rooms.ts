import { Router } from "express";
import * as roomsController from "../controllers/rooms.controller";

const router = Router();

router.get("/", roomsController.getRooms);

export default router;
