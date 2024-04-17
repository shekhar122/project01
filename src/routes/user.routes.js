import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken} 
from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

//like app from express
const router = Router()

//console.log("debug: in user route")
//control reach here from app.js
router.route("/register").post(
    //got upload from middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
//login verfication will be done by auth middleware
router.route("/login").post(loginUser);
//secured routes
//that's why we have added next in verifyJWT middleware function,
//after executing it will go to logoutUser
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router