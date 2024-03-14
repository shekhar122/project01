import { asyncHandler } from "../utils/asyncHandler.js";

//create method to register, 
const registerUser = asyncHandler(async (req, res) => {
     res.status(200).json({
        message: "User registered now"
    })
})

export {registerUser}