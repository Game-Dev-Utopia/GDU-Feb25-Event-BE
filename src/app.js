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
const allowedOrigins = ["https://glitched.gamedevutopia.in"];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, origin);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true, // ✅ Important for sending cookies
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);


app.use(cookieParser());


app.options("*", (req, res) => {
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    
    res.sendStatus(204);
});




// Handle Preflight Requests



app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}))



// app.use(cookieParser());


import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter)




import eventRouter from "./routes/event.routes.js"

app.use("/api/v1/events", eventRouter)

import registrationRouter from "./routes/registration.routes.js"

app.use("/api/v1/registration",  verifyJWT, registrationRouter)

import contactRouter from "./routes/contact.routes.js"
app.use("/api/v1/contact", contactRouter)


export {app};