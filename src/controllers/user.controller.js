import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
//console.log("debug: incontroller")
//create method to register, 
const registerUser = asyncHandler(async (req, res) => {
    //  res.status(200).json({
    //     message: "User registered now"
    // })

    //Steps of user registration
    /* 
    step1: user needs to enter the email password
    step2: we will store that in database
    step3: we will send the user a confirmation message after completing all task

    breakdown:
            > get user details from frontend : check in database models
            > validation, all the rules are followed or not, shouldn't be empty
            > check if user already exists : check with username , email
            > check for images, check for avatar
            > upload them to cloudinary, check if it is uploaded successfully or not : get the URL
            > create the user object - creation entry in db, db calls
            > remove password and refresh token field (don't send password and refresh token in response)
            > check for user creation: null creation or created
            > return res 
    
    */
   //data from URL (taken care letter)

   //data from
   const { fullName, email, username, password } = req.body
   //console.log("debug: body received : ", req.body)
   //console.log("debug: fullName is " , fullName);
/*
>> The .some() method iterates over each element of the array 
and returns true if at least one element satisfies the provided condition.
>> ?. operator is an optional chaining operator 
which ensures that the trim() method is only called if field is not null or undefined.
>> trim() method in JavaScript removes whitespace from both ends of a string
>> if any of the fields (fullName, email, username, or password) is empty (after trimming), 
 the condition in the if statement evaluates to true.
*/
   if (
      [fullName, email, username, password].some((field) => 
      field?.trim() === "")
   ) {
    throw new ApiError(400, "fullname is required")
   }

   //to check user exists or not
   const existedUser = await User.findOne({
    $or: [{ username }, { email }]
   })

   if (existedUser) {
      throw new ApiError(409, "User with email or username already exist")
   }
   //Image and avatar handling
   //console.log("debug: files we received: ",req.files)
/*
>> When handling file uploads in Express.js, middleware like Multer is often used to 
parse the uploaded files and make them accessible via req.files
>> ?. (optional chaining) operator is used here to guard against null or undefined errors.
>> req.files?.avatar attempts to access the avatar property of the req.files object. 
   If req.files is null or undefined, or if avatar property doesn't exist, it returns undefined.
>> .path attempts to access the path property of the first element of the avatar
>> If req.files exists and has the expected structure, and if the avatar file was uploaded successfully,
 avatarLocalPath will contain the path of the uploaded avatar image.
*/
   const avatarLocalPath = req.files?.avatar[0]?.path
   //const coverImageLocalPath = req.files?.coverImage[0]?.path
   //console.log("debug: avatarLocalPath is ",avatarLocalPath)
   //console.log("debug: coverImageLocalPath is ",coverImageLocalPath)
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) 
       && req.files.coverImage.length > 0) {
          coverImageLocalPath = req.files.coverImage[0].path
      }

   if (!avatarLocalPath) {
      throw new ApiError(400, " Avatar file is required")
   }
   //here it is possible that it will take time while uploading image/video, so using await
   //wait here till it upload
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage =  await uploadOnCloudinary(coverImageLocalPath)



   if(!avatar) {
    throw new ApiError(400, " Avatar file is required")
   }

   //creating object for db entry

 const user = await User.create({
   fullName,
   avatar: avatar.url,
   coverImage: coverImage?.url || "", // if cover image is present then send URL else keep it empty
   email, 
   password,
   username: username.toLowerCase()
    
})
//mongodb add _id with every entry
//what we don't want
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)
if(!createdUser) {
    throw new ApiError(500, "Something went wrong while regsitering the User")
}

//send res
return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
)

   //file handling
})

export {registerUser}