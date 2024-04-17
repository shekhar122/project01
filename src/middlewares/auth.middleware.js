//verify if User is there or not
//if no access to cookies, user maye be sending some suctom header 

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

//here req and next is getting used but res is not getting used, we can replace with _
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header
        ("Authorization")?.replace("Bearer ", "")
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).
        select("-password -refreshToken")
    
        if (!user) {
            //TODO: discuss about frontend - done
            throw new ApiError(401, "Invalid Access Token")
        }
    
         req.user = user 
         next()
    } catch (error) {
        throw new ApiError(401, error?.message ||
            "Invalid access token")
    }

})