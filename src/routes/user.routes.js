import {Router} from "express"
import { registerUser, loginUser , getUserProfile, getUserRegisteredEventList, notification,logout, Admin, sendOtp, verifyOtp} from "../controllers/user.controller.js"
import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { get } from "mongoose"

const app = express()
const router = Router()
app.use(express.json())


router.route("/register").post(
    registerUser
)

router.route("/login").post(
    loginUser
)

router.route("/logout").post(
    logout
)

router.route("/getuser").get(
    getUserProfile
)

router.route("/eventsregistered").get(
    getUserRegisteredEventList
)


router.route("/notification").get(
    notification
)


router.route("/admin").post(
    Admin
)

router.route("/send-otp").post(
    sendOtp
)

router.route("/verify-otp").post(
    verifyOtp
)



app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
});

export default router 