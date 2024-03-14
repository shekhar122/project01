import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        //will keep basic as of now
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //TODO: change the filename
      cb(null, file.originalname)
      //printing file
      console.log(file);
    }
  })
  
  export const upload = multer({ 
    storage: storage 
})