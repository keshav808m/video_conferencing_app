import { Router } from "express";

import { getUserHistory, addUserHistory } from "../controllers/history.controller.js";

const router = Router();

router.route("/add_to_activity").post(addUserHistory);
router.route("/get_to_activity").get(getUserHistory);

export default router;