import {v2 as cloudinary} from "cloudinary"
import { Console } from "console";
import fs from "fs"

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
const uploadOnCloudinary = async (localFilePath) => {
    //console.log("debug: locaFilePath received is ", localFilePath)
    try {
        if(!localFilePath) {
            console.log("returning null_15")
            return null
        } 
        //upload the file on cloudinary
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto" //you can check with ctrl + space
        })
        //check the console.log of whole response
        //console.log("response received from cloudinary ", response);
        //file has been uploaded successfully
        // console.log("file is uploaded on cloudinary", response.url);
        /*
        After uploading the file to Cloudinary and obtaining the link, 
        you no longer need the file on your server since it's now stored remotely. 
        Therefore, you can safely delete the file from the local file system 
        */
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        } else {
            console.error('File does not exist:', localFilePath);
        }
        return response;

    } catch (error) {
        //remove the locally saved temp file as the upload operation got failed
        //console.log("returning null_39")
        fs.unlinkSync(localFilePath)
        return null
    }        
}

export { uploadOnCloudinary }


// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); }); 