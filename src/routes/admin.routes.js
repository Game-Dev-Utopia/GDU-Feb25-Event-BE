import {Router} from "express"
import {Admin} from "../controllers/user.controller.js"
import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { get } from "mongoose"


const app = express()
const router = Router()
app.use(express.json())


router.route("").get(
    Admin
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