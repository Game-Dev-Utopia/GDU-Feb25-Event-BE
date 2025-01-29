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
    // origin: "http://localhost:3000", // ✅ Must match exactly with frontend
    origin : "https://glitched.gamedevutopia.in",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ✅ Ensure all required methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Explicitly allow headers
    credentials: true // ✅ Required for cookies
}));

// ✅ Manually handle preflight (`OPTIONS`) requests
app.options("*", (req, res) => {
    // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Origin", "https://glitched.gamedevutopia.in");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.sendStatus(204); // ✅ Preflight request successful
});

// Handle Preflight Requests



app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}))



app.use(cookieParser());


import userRouter from "./routes/user.routes.js"

app.use("/api/v1/users", userRouter)




import eventRouter from "./routes/event.routes.js"

app.use("/api/v1/events", eventRouter)

import registrationRouter from "./routes/registration.routes.js"

app.use("/api/v1/registration",  verifyJWT, registrationRouter)

import contactRouter from "./routes/contact.routes.js"
app.use("/api/v1/contact", contactRouter)


export {app};