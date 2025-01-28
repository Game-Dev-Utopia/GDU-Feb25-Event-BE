import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../model/users.model.js";

dotenv.config(); // Ensure environment variables are loaded

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Log the token from the Authorization header or cookies
        // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        let token = req.cookies?.accessToken;
        if (token?.startsWith("Bearer ")) {
            token = token.replace("Bearer ", "");
        }
        console.log("Token from header or cookies: ", token); // Debugging token
        
        if (!token) {
            return res.status(401).json({ message: "No token provided. Unauthorized access." });
        }
        
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded JWT: ", decoded); // Debugging decoded token
        
        // Fetch the user from the database using the decoded _id
        const user = await User.findById(decoded._id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized Request" });
        }

        req.user = user; // Set the user in the request object
        console.log("User found: ", req.user); // Debugging the user object
        next();
    } catch (error) {
        console.error("Error in JWT verification:", error); // Debugging error
        return res.status(401).json({ message: "Invalid access token" });
    }
});
