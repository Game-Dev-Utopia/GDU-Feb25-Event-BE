import {Router} from "express"
import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { submitContact } from "../controllers/contact.controller.js"

const app = express()
const router = Router()
app.use(express.json())


router.route("/contact").post(
    submitContact
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