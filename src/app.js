import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { verifyJWT } from "./middleware/auth.middleware.js"
import {rateLimit} from "express-rate-limit"
import {slowDown} from "express-slow-down"


const limiter = rateLimit({
    windowMs:  60 * 1000,
    max: 20,
  });

const speedLimiter = slowDown({
    windowMs:  60 * 1000,
    delayAfter: 1,
    delayMs: () => 2000,
    });  


const app = express()
app.use(limiter)  
app.use(speedLimiter)
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    method : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders : ['*'],
    credentials: true
}))


app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}))



app.use(cookieParser());


import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter)




import eventRouter from "./routes/event.routes.js"

app.use("/api/v1/events", eventRouter)

import registrationRouter from "./routes/registration.routes.js"


app.use("/api/v1/registration",  verifyJWT, registrationRouter)


export {app};