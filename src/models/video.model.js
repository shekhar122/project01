import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from  "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose(
    {
        videoFile: {
            type: String,
            required: true
        },
        videoFile: {
            type: String, //cloudinary url
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number, //cloudinary will send this data
            required: true
        },
        views: {
            type: String,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId ,
            ref: "User"
        }, 
    },
    {
        timestamp: true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)