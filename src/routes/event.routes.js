import {Router} from "express"
import { eventDetail } from "../controllers/event.controller.js"
import express from "express"


const app = express()
const router = Router()
app.use(express.json())

router.route("/getevent").get(
    eventDetail
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