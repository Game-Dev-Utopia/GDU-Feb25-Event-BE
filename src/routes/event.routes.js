import {Router} from "express"
import { eventDetail , getallevents} from "../controllers/event.controller.js"
import express from "express"


const app = express()
const router = Router()
app.use(express.json())

router.route("/getevent").get(
    eventDetail
)
router.route("/getallevents").get(
    getallevents
)

app.use((err, req, res, next) => {
    console.error(err.stack); 
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
});

export default router 