import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/users.model.js";
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        // await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        res.status(401);
        throw new Error("Error in generating Token not found")
    }
}


const registerUser = asyncHandler(async (req, res) => {

    const {username, email, contact,  fullname, password, gender} = req.body

    if(
        [fullname, email, username, password, contact, gender].some((field) => 
            field?.trim() === "")
    ){
        res.status(401);
        throw new Error("All feilds are required")
    }

    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser){
        res.status(401);
        throw new Error("User with email or username already exist")
    }


    const user = await User.create({
        username,
        email,
        password,
        fullname,
        contact,
        gender

    })

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createduser){
        res.status(401);
        throw new Error("Something went wrong by registering User")
    }

    
    return res.status(201).json(
        res.status(200).send("User created successfully ....!!!")
    
    )

})




export {registerUser}