import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/users.model.js";
import { Event } from "../model/events.model.js";
import { Registration } from "../model/registration.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../utils/Nodemailer.js";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // Save the refreshToken to the database
        return { accessToken, refreshToken };

    } catch (error) {
        throw new Error(error.message || "Error in generating tokens");
    }
};


const otpStore = new Map();

const sendOtp = async (req, res) => {
    try {
        const { email, username } = req.body;
        if (!email && username) {
            return res.status(400).json({ message: "Please enter an email address" });
        }
        
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        });
    
        if (existedUser) {
            res.status(409);
            throw new Error("User with email or username already exists");
        }    


        const otp = Math.floor(100000 + Math.random() * 900000).toString();


        otpStore.set(email, otp);


        await sendVerificationEmail(email, otp);

        res.status(200).json({ message: "OTP sent successfully", email });
    } catch (error) {

        return res.status(500).json({
            message: error.message || "Error in sending Mail",
        });
    }

}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }


        if (otpStore.get(email) === otp) {
            otpStore.delete(email);
            return res.status(200).json({ message: "OTP verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error sending OTP:", error); 
        return res.status(500).json({
            message: error.message || "Error in sending Mail",
        });
    }
};



const registerUser = asyncHandler(async (req, res) => {
    const { username, email, contact, fullname, password, collegeName, year} = req.body;

    console.log(username, email, contact, fullname, password, collegeName, year)
    if ([fullname, email, username, password, contact, collegeName, year].some((field) => !field?.trim())) {
        res.status(400);
        throw new Error("All fields are required");
    }


    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        res.status(409);
        throw new Error("User with email or username already exists");
    }



    const user = await User.create({
        username,
        email,
        password,
        fullname,
        contact,
        collegeName,
        year,

    });

    if (!user) {
        res.status(500);
        throw new Error("Something went wrong while registering the user");
    }
    


    res.status(201).json({
        message: "User created successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
        }
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;


    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are required");
    }




    const userExist = await User.findOne({ email });
    if (!userExist) {
        res.status(404);
        throw new Error("User with this email does not exist");
    }



    const isMatch = await bcrypt.compare(password, userExist.password);
    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid email or password");
    }




    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(userExist._id);
    const isProduction = process.env.NODE_ENV === 'production';
    const optionals = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }
    res.status(200).cookie("accessToken", accessToken, optionals).cookie("refreshToken", refreshToken, optionals).cookie("email", email, optionals).json({
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
            id: userExist._id,
            username: userExist.username,
            email: userExist.email,
            fullname: userExist.fullname,
            isAdmin : userExist.isAdmin
        }
    });
});


const logout = asyncHandler(async (req, res) => {
    console.log(req)
    console.log(req.user)
    await User.findByIdAndUpdate(
        req.user,
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
        .clearCookie("user", options)
        .json("User Logged out successfully")
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshtoken = req.cookie.refreshToken
        || req.body.refreshToken

    if (!refreshAccessToken) {
        res.status(400);
        throw new Error("Unauthorized Request");
    }

    const decode = jwt.verify(
        incomingrefreshtoken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decode?._id)

    if (!user) {
        res.status(400);
        throw new Error("Invalid Refresh Token");
    }

    if (incomingrefreshtoken !== user?.refreshToken) {
        res.status(400);
        throw new Error("Refresh Token expired");
    }

    const optionals = {
        httpOnly: true, 
        secure: true, 
        sameSite: "None",
    }

    const { accesstoken, refreshtoken } = await generateAccessAndRefereshTokens(user._id);

    return res
        .status(200)
        .cookie("accesstoken", accesstoken, optionals)
        .cookie("refreshtoken", refreshtoken, optionals)
        .json(
            "Token send successfully..!!"
        )
})


const getUserProfile = asyncHandler(async (req, res) => {
    
    const { username } = req.query;

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
            },
        },
    ]);

   
    if (!profile?.length) {
        res.status(400);
        throw new Error("Profile does not exist");
    }

   
    return res.status(200).json({
        message: "User fetched successfully!",
        profile, 
    });
});


const getUserRegisteredEventList = asyncHandler(async (req, res) => {
    const { username } = req.query;

    if (!username?.trim()) {
        res.status(400);
        throw new Error("No valid username provided");
    }

    const profile = await User.aggregate([
        {
            $match: { username: username }
        },
        {
            $project: { eventsregistered: 1, _id: 0 }
        },
    ]);

    if (!profile?.length) {
        res.status(404);
        throw new Error("User profile does not exist");
    }


    return res.status(200).json({
        message: "List of event IDs the user has registered into:",
        events: profile[0].eventsregistered,
    });
});



const notification = asyncHandler(async (req, res) => {
    const { username } = req.query;

    if (!username?.trim()) {
        res.status(400);
        throw new Error("No valid username provided");
    }

   
    const profile = await User.aggregate([
        { $match: { username: username } },
        { $project: { eventsregistered: 1, _id: 0 } },
    ]);

    if (!profile?.length) {
        return res.status(404).json({ error: "User profile does not exist" });
    }

    const eventsregistered = profile[0].eventsregistered;

    if (!eventsregistered?.length) {
        return res.status(200).json({ message: "No events registered for the user." });
    }
    console.log("Registered events", eventsregistered)
    const eventdetail = [];

    for (let eventId of eventsregistered) {
        const event = await Event.findById(eventId);

        if (!event) {
            console.warn(`⚠️ Event with ID ${eventId} does not exist.`);
            continue;
        }

        let remainingTime = "Updated soon"; 

        if (event.date && Array.isArray(event.date) && event.date.length > 0) {
            const eventDate = new Date(event.date[0]);

            if (!isNaN(eventDate.getTime())) {
             
                const currentDate = new Date();

                if (eventDate > currentDate) {
                    const diffMs = eventDate - currentDate;
                    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                    remainingTime = `${days}d ${hours}h ${minutes}m remaining`;
                } else {
                    remainingTime = "Event has started or passed";
                }
            }
        }

     
        eventdetail.push({
            eventid: eventId,
            eventname: event.name,
            eventdesc: event.description,
            eventDate: event.date?.[0] || "TBD",
            remainingTime,
        });
    }

    console.log("📢 Event Notifications:", eventdetail);

    return res.status(200).json({
        message: "Notifications processed successfully.",
        eventdetail
    });
});





const Admin = asyncHandler(async (req, res) => {

    const result = await Registration.find();
   
    const registrationdetail = [];
    for (let r of result) {
        const event = await Event.findById(r.event);
        for(let u of r.user){

            const user = await User.findOne({
                $or: [
                    { username: u },
                    { email: u }
                ]
            }).select(
                "-password -refreshToken"
            );
        
        if (event != null) {
            registrationdetail.push({
                "eventname": event.name,
                "teamName" : r.teamname, 
                "email" : r.user,
                "user": user
            })
        }

    }

    }


    res.status(200).json(registrationdetail);

})




export { registerUser, loginUser, getUserProfile, getUserRegisteredEventList, notification, Admin, logout, sendOtp, verifyOtp }