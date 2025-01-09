import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {User} from "../model/users.model.js"

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            res.status(401);
            throw new Error("No token provided. Unauthorized access.");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        

        if(!user) {
            res.status(401);
            throw new Error("Unauthoirzed Request");
        }

        req.user = user
        next();
    }
    catch (error) {
        res.status(401);
        throw new Error("Invalid access token")
    }
})