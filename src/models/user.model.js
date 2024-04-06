import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //url of cloudinary
            required: true,
        },
        coverImage: {
            type: String, //url of cloudinary
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        } 
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    //run only when there is a modification password field
    if(!this.isModified("password")) return next()
    //here processing pass will take time
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//customMethod
userSchema.methods.isPasswordCorrect = async function(password) {
   return await bcrypt.compare(password, this.password)
}

//both are JWT token
userSchema.methodsgenerateAccessToken = function() {
    return jwt.sign(
        {
            //payloadName: database field
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiration: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methodsgenerateAccessToken = function() {
    return jwt.sign(
        {
            //payloadName: database field
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiration: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)