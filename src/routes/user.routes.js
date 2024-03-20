import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

//like app from express
const router = Router()

//control reach here from app.js
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "Coverimage",
            maxCount: 1
        }
    ]),
    registerUser
    )
//router.route("/login").post(login)

export default router