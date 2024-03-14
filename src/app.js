import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"



const app = express()
//for middleware or config setting
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//data is coming from multiple sources
app.use(express.json({limit: "16kb"}))

//when we get data from URL
app.use(express.urlencoded({extended: true,
    limit: "16kb"}))

//to store images, pdfs, fevicon
app.use(express.static("public"))

app.use(cookieParser())

//routes import, for seggregation, use .js always
import userRouter from './routes/user.routes.js'

//routes declaration, since routes are defined in separate place, have to use middleware
// http://localhost:8000/api/v1/users/register
app.use("/api/v1/users", userRouter)

export { app } 