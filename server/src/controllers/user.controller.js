import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/users.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";


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

    const {username, email, contact,  fullname, password, collegeName, year, dept, rollNo } = req.body

    if(
        [fullname, email, username, password, contact, collegeName, year, dept, rollNo].some((field) => 
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
        collegeName, 
        year,
        dept,
        rollNo

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


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }

    
    const userExist = await User.findOne({ email });

    if (!userExist) {
        res.status(401);
        throw new Error("User with this email does not exist");
    }

   
    const isMatch = await bcrypt.compare(password, userExist.password);

    if (isMatch) {
        res.status(200).json({ message: "Login successful!" });
    } else {
        res.status(401);
        throw new Error("Password does not match");
    }
});


const logout = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json("User Logged out successfully")
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshtoken = req.cookie.refreshToken
    || req.body.refreshToken

    if(!refreshAccessToken){
        res.status(400);
        throw new Error("Unauthorized Request");
    }

    const decode = jwt.verify(
        incomingrefreshtoken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decode?._id)

    if(!user){
        res.status(400);
        throw new Error("Invalid Refresh Token");
    }

    if(incomingrefreshtoken !== user?.refreshToken){
        res.status(400);
        throw new Error("Refresh Token expired");
    }

    const optionals = {
        httpOnly :true,
        secure:true
      }

      const {accesstoken, refreshtoken} = await generateAccessAndRefereshTokens(user._id);

      return res
      .status(200)
      .cookie("accesstoken" , accesstoken, optionals)
      .cookie("refreshtoken", refreshtoken, optionals )
      .json(
        "Token send successfully..!!"
      )
})


const getUserProfile = asyncHandler(async (req, res) => {
    // Extract the username from the request params
    const { username } = req.query;

    console.log(req.query)
    if (!username?.trim()) {
        res.status(400);
        throw new Error("No valid username");
    }
    

    const profile = await User.aggregate([
        {
            $match: {
                username: username
            },
        },
        {
            $project: {
                username: 1,
                email: 1,
                fullname: 1,
                contact: 1,
                collegeName: 1,
                year: 1,
                dept: 1,
                rollNo: 1,
            },
        },
    ]);

    // Check if profile exists
    if (!profile?.length) {
        res.status(400);
        throw new Error("Profile does not exist");
    }

    // Send the response with the profile data
    return res.status(200).json({
        message: "User fetched successfully!",
        profile,  // Sending the profile data
    });
});





export {registerUser, loginUser, getUserProfile}