import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    method : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders : ['Content-Type', 'Authorization'],
    credentials: true
}))


app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}))



app.use(cookieParser());


import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter)




import eventRouter from "./routes/event.routes.js"

app.use("/api/v1/events", eventRouter)



export {app};