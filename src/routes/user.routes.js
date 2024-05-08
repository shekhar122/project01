import { Router } from "express";
import { loginUser,
         logoutUser,
         registerUser,
         refreshAccessToken,
         changeCurrentPasssword,
         getCurrentUser,
         updateAccountDetails,
         updateUserAvatar,
         updateCoverImage,
         getUserChannelProfile,
         getWatchHistory} 
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
router.route("/change-password").post(verifyJWT, changeCurrentPasssword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("/coverImage"), updateCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


export default router