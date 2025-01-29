import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/users.model.js";
import { Event } from "../model/events.model.js";
import { Registration } from "../model/registration.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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


const registerUser = asyncHandler(async (req, res) => {
    const { username, email, contact, fullname, password, collegeName, year, dept, rollNo } = req.body;


    if ([fullname, email, username, password, contact, collegeName, year, dept, rollNo].some((field) => !field?.trim())) {
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
        dept,
        rollNo
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
        httpOnly :true,
        secure:true,
        sameSite: "None"
      }
    res.status(200).cookie("accessToken", accessToken, optionals).cookie("refreshToken", refreshToken, optionals).json({
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
            id: userExist._id,
            username: userExist.username,
            email: userExist.email,
            fullname: userExist.fullname,
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
        httpOnly: true, // ✅ Prevents JavaScript access (more secure)
        secure: true, // ✅ Required for HTTPS (ensure your domain is using HTTPS)
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
    // Extract the username from the request params
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

    // Find the user's registered events
    const profile = await User.aggregate([
        { $match: { username: username } },
        { $project: { eventsregistered: 1, _id: 0 } },
    ]);

    if (!profile?.length) {
        res.status(404);
        throw new Error("User profile does not exist");
    }

    const eventsregistered = profile[0].eventsregistered;

    if (!eventsregistered?.length) {
        return res.status(200).json({ message: "No events registered for the user." });
    }

    const eventdetail = [];

    for (let eventId of eventsregistered) {
        const event = await Event.findById(eventId);

        if (!event) {
            console.warn(`Event with ID ${eventId} does not exist.`);
            continue;
        }

        if (!event.date || event.date.length === 0) {
            console.warn(`Event with ID ${eventId} has no valid date.`);
            continue;
        }

        // Get the first date from the event's date array
        const currentDate = new Date();
        const eventDate = new Date(event.date[0]);

        // Calculate remaining time in days
        let remainingTime = "Date not available";
        if (!isNaN(eventDate.getTime())) {
            const diffMs = eventDate - currentDate;

            if (diffMs > 0) {
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                remainingTime = `${days}d ${hours}h ${minutes}m remaining`;
            } else {
                remainingTime = "Event has started or passed";
            }
        }

        // Add event details to response array
        eventdetail.push({
            eventid: eventId,
            eventname: event.name, // ✅ Event name
            eventdesc: event.description, // ✅ Event description
            remainingTime, // ✅ Time remaining till event
        });
    }

    // Send response
    return res.status(200).json({
        message: "Notifications processed successfully.",
        eventdetail
    });
});




const Admin = asyncHandler(async (req, res) => {
    const { entry, password } = req.body;

    if (!entry) {
        res.status(400);
        throw new Error("username or email require");
    }

    const profile = await User.aggregate([
        {
            $match: {
                $or: [
                    { username: entry },
                    { email: entry }
                ]
            },
        },
    ]);

    if (!profile?.length) {
        res.status(404);
        throw new Error("User profile does not exist");
    }

    const isadmin = profile[0].isAdmin;

    if (!isadmin) {
        res.status(404);
        throw new Error("User profile as Admin does not exist");
    }

    const result = await Registration.find();

    const registrationdetail = [];
    for (let r of result) {
        const event = await Event.findById(r.event);

        if (event != null) {
            registrationdetail.push({
                "eventname": event.name,
                "user": r.user

            })
        }

    }


    res.status(200).json(registrationdetail);

})




export { registerUser, loginUser, getUserProfile, getUserRegisteredEventList, notification, Admin, logout }