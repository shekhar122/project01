// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB()

/*
//iffys
//use async, awit and try, catch, listener
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        application.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error
        })
        //listener
        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port
            {process.env.PORT}`);
        })

    } catch (error) {
       console.error("ERROR: ", error);
       throw error;
    }
}) ()
*/