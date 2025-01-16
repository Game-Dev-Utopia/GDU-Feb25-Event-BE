import {Router} from "express"
import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { eventRegistration, registerForEvent } from "../controllers/registration.controller.js"

const app = express()
const router = Router()
app.use(express.json())


router.route("/register", verifyJWT).post(registerForEvent);

router.route("/eventregister").post(
    eventRegistration
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