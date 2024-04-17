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
        Phone: {
            type: Number,
            required: true
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
userSchema.methods.generateAccessToken = function() {
    //console.log("debug: In generateAccessToken payload :",this._id, this.email,
    //                        this.username, this.fullName)
    return jwt.sign(
        {
            //payloadName: database field
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            //payloadName: database field
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)