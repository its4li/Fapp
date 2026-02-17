import { Router } from "express";
import { getProfile, updateProfile, updateProfileSchema } from "../controllers/userController";
import { validate } from "../middleware/validate";

const router = Router();

router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);

export default router;
