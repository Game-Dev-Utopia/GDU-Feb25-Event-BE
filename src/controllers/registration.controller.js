import { asyncHandler } from "../utils/asyncHandler.js";
import { Registration } from "../model/registration.model.js";
import { User } from "../model/users.model.js";
import { Event } from "../model/events.model.js";

// Event Registration Handler
const eventRegistration = asyncHandler(async (req, res) => {
    try {
        // console.log(req.body)
        const eventId = req.query.eventId;

        const teamname = req.body.teamName;
        // console.log("event reg", eventId, teamname)

       
        if (!eventId) {
            return res.status(400).json({ message: "eventId is required" });
        }

        const teamEmail = Array.isArray(req.body.teamemail)
            ? req.body.teamemail
            : JSON.parse(req.body.teamemail);

        if (teamEmail.length === 0) {
            return res.status(400).json({ message: "No team emails provided" });
        }

        // const memberIds = [];
        
        // Loop through emails and find corresponding users
        // for (let email of teamEmail) {
        //     const user = await User.findOne({ email });
            
        //     if (user) {
        //         memberIds.push(user._id);
        //     } else {
        //         console.log(`User not found for email: ${email}`);
        //     }
        // }

        // Proceed if there are valid users to register
        // if (memberIds.length > 0) {
        //     // Update event with team members
        //     await Event.findByIdAndUpdate(
        //         eventId,
        //         { $push: { members: { $each: memberIds } } },
        //         { new: true }
        //     );
        // }

        // Create registration entry
        const registration = await Registration.create({
            teamname : teamname,
            user: teamEmail,
            event: eventId
        });

        // console.log("registration", registration)

        for (let email of teamEmail) {
            const user = await User.findOne({ email });
            
            if (user) {
                console.log(eventId)
                user.eventsregistered.push(eventId);
                await user.save(); 
            } else {
                console.log(`User not found for email: ${email}`);
            }
        }

        if (registration) {
            return res.status(200).json({
                message: "Team registration successful",
            });
        } else {
            return res.status(400).json({
                message: "Failed to register the team. Please try again.",
            });
        }

    } catch (error) {
        console.error("Error during event registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Register for Event Handler (User Authentication)
const registerForEvent = asyncHandler(async (req, res) => {
    try {
        console.log("reqqqqqqqqqqqq", req)
        console.log("req.user", req.user); // Debugging user information

        // Check if the user is authenticated
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated. Please log in to continue."
            });
        }
        console.log(req.body)

        const { eventId } = req.body; // Extract eventId from request body

        if (!eventId) {
            return res.status(400).json({
                message: "Event ID is required."
            });
        }
        console.log("User Email:", req.user.email); // Ensure correct email is used
        console.log("Event ID:", eventId);

        // Convert eventId to ObjectId if necessary
        // const mongoose = require("mongoose");
        // const eventObjectId = mongoose.Types.ObjectId(eventId);

        // Check if the user is already registered for the event
        const isRegistered = await Registration.findOne({
            user: req.user.email, // ✅ Check by user email instead of `_id`
            event: eventId // ✅ Ensure eventId is stored as ObjectId
        });

        console.log("isRegistered:", isRegistered);

        if (isRegistered) {
            return res.status(400).json({
                message: "You have already registered for this event."
            });
        }

        // Return success response (User is authenticated but not registered yet)
        return res.status(200).json({
            message: "User is authenticated and not registered for this event.",
        });

    } catch (error) {
        console.error("Error in registerForEvent:", error);
        return res.status(500).json({
            message: "An internal server error occurred. Please try again later."
        });
    }
});


export { eventRegistration, registerForEvent };
