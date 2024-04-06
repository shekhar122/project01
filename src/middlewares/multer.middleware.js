import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //it tells Multer to save the uploaded files in the specified directory 
      //console.log(file);
      //cb(null, "./public/temp")  -- this is not correct path to temp folder from here
      cb(null, "./public/temp", function (err) {
        if (err) {
            console.error('Error storing file to temp dir :', err);
        }
    });
    },
    filename: function (req, file, cb) {
        //will keep basic as of now
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //TODO: change the filename
      //it tells Multer to use the original filename of the uploaded file when storing it on the server.
      cb(null, file.originalname)
      //printing file
      //console.log(file);
    }
  })
  
  export const upload = multer({ 
    storage, 
})