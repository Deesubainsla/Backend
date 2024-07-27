import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))
app.use(cookieParser())
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('Public'))

import userRouter from "./routes/user.routes.js";
//Routes declaration 
//good practice to also provide api and version details 
//whenever this route come use userRouter
app.use("/api/v1/user",userRouter)

export {app}