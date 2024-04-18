import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
//console.log("debug: incontroller")

//asyncHandler not needed here because we are not handling web requests here, it's internal
const generateAccessTokenAndRefreshToken = async(userID) => {
   try {
      //console.log("debug: userID received ",userID);
      const user = await User.findById(userID)
      //console.log("debug: User is: ", user);
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      //send the accessToken and save refreshToken in database
      user.refreshToken = refreshToken
      //here in this save method we need to set validation to fasle so that
      //it will not check for other fields
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}
   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating access and refresh Token")
   }
}
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
   const { fullName, email, Phone, username, password } = req.body
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
      [fullName, email, Phone, username, password].some((field) => 
      field?.trim() === "")
   ) {
    throw new ApiError(400, "fullName and other fields are required")
   }

   //to check user exists or not
   const existedUser = await User.findOne({
    $or: [{ Phone }, { email }]
   })

   if (existedUser) {
      throw new ApiError(409, "User with Phone or email already exist")
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
   Phone,
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
})
//TODOs for login
/* 
1. user enters the username and password
2. we will check with database
3. if correct we will allow him and create a accessToken
4. if failed we will send the error message
//by hitesh
1. get req->body
2. username or email
3. find the user
4. if exists password check
5. if match access and refresh token 
6. send cookies
7. send success message
*/
const loginUser = asyncHandler(async (req, res) => {
   const {email, Phone, username, password} = req.body
   //console.log("debug: req.body: ",req.body)
   //TODO: we are going aheah with phone Number
   if(!username && !email) {//if both not received then throw error
      throw new ApiError(400, "username or email is required")
   }
   // check if user is present in DB (mongodb)
   const user = await User.findOne({
      $or: [{username}, {email}]
   })
   //if user not present throw error
   if (!user) {
      throw new ApiError(404, "User doesn't exits")
   }
   // User gives us the function via mongoose
   // and the function which are created by us are accessed via user which we got 
   //if user exists and we got the email and pass, now check pass in db
   const isPasswordValid = await user.isPasswordCorrect(password)
   console.log("debug: isPasswordValid ", isPasswordValid)
   if (!isPasswordValid) {
      throw new ApiError(404, "Password is not correct")
   }
   //create access and Refresh Token
   const {accessToken, refreshToken} = await  generateAccessTokenAndRefreshToken(user._id)
   //console.log("debug: accessToken ", accessToken);
   //console.log("debug: refreshToken", refreshToken);

   //what all information we need to send to user
   /*
   we have the user access, we can send it directly. when we fetched user by User.findOne we got
   some unwanted feilds like password. refreshToken in user is empty. we can update with later 
   object or we can go ahead with one db query
   */
  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken")

  //console.log("debug: loggedInUser ", loggedInUser);
  const options = {
   httpOnly: true,  //by default cookies can be modified by anyone but when we set these vars true
   secure: true   // then can be modified by servers only not by frontend
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
     new ApiResponse(
      200,
      {
         user: loggedInUser, accessToken, refreshToken
      },
      "User logged In successfully"
     )
  )
  
})

const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      //now we have to tell him what to update
      //we have to use mongofb operator
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }

   )
   const options = {
      httpOnly: true,  //by default cookies can be modified by anyone but when we set these vars true
      secure: true   // then can be modified by servers only not by frontend
     }
   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
      new ApiResponse(
       200, {},
       "User logged out successfully"
      )
   )
})

const refreshAccessToken = asyncHandler( async(req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken
                            || req.body.refreshToken
   if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
   }

   try {
      //verify through jwt
      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      )
   
      const user = await User.findById(decodedToken?._id)
      if (!user) {
         throw new ApiError(401, "Invalid Refresh Token")
      }
   
      //match the incoming refresh and saved refresh token
      if(incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Refresh token is expired or used")
      }
      //now generate new Access and Refresh Token
      const options = {
         httpOnly: true,
         secure: true
      }
      const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
   
      return res
      .status(200)
      .clearCookie("accessToken", accessToken, options)
      .clearCookie("refreshToken", newRefreshToken, options)
      .json(
         new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
         )
      )
   } catch (error) {
      throw new ApiError(401, error?.message ||
         "Invalid refresh token")
   }
})

const changeCurrentPasssword = asyncHandler(async(req, res) => {
   const {oldPassword, newPassword} = req.body

   const user = await User.findById(req?._id)

   //use the function defined in user model file
   //and since this function is async, we need to use await
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect) {
      throw new ApiError(400, "invalid old password")
   }
   //here it is set only
   user.password = newPassword
   //save it and don't want to validate other fields
   await user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
   return res
   .status(200)
   .json(200, req.user, "current user fetched successfully")
})
//controller to update text based data
const updateAccountDetails = asyncHandler(async(req, res) => {
   const {fullName, email} = req.body

   if(!fullName || !email) {
      throw new ApiError(400, " All fields required")
   }

   const user = User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
         fullName,
         email
        }
      },
      {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200, user, "Account details updated successfully"))
})
//controller to update files based data
/* 
- we need to think about middleware
- first middleware should be multer so that we can accept files from authorized user
- only logged In user can update 
*/

const updateUserAvatar = asyncHandler (async(req, res) => {
   const avatarLocalPath = req.file?.path
   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
   }
   const avatar = await  uploadOnCloudinary(avatarLocalPath)
   if(!avatar.url) {
      throw new ApiError(400, "error while uploading avatar on cloudinary")
   }

   //update in database
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      {new: true}
   ).select("-password")

   return res.
   status(200)
   .json(new ApiResponse(200, user, "Avatar updated successfully"))

})

const updateCoverImage = asyncHandler (async(req, res) => {
   const coverImageLocalPath = req.file?.path
   if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover Image file is missing")
   }
   const coverImage = await  uploadOnCloudinary(coverImageLocalPath)
   if(!coverImage.url) {
      throw new ApiError(400, "error while uploading Cover image on cloudinary")
   }

   //update in database
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            coverImage: coverImage.url
         }
      },
      {new: true}
   ).select("-password")

   return res.
   status(200)
   .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})


export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPasssword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateCoverImage
}