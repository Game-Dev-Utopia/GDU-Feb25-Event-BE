import mongoose from "mongoose"
import {DB_NAME} from './constant.js'
import {app} from './app.js'
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from 'dotenv'

dotenv.config({
    path : './env'
 });


import connectDB from "./db/db.js"

connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server is running on port : " + process.env.PORT)
    })
})
.catch((error) => {
    console.log("Connection Failed...!!", error)
})

