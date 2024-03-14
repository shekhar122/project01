import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

//like app from express
const router = Router()

//control reach here from app.js
router.route("/register").post(registerUser)
//router.route("/login").post(login)

export default router