import { asyncHandler } from "../utils/asyncHandler.js";
import { Registration } from "../model/registration.model.js";
import { User } from "../model/users.model.js";
import { Event } from "../model/events.model.js";

// Event Registration Handler
const eventRegistration = asyncHandler(async (req, res) => {
    try {
        const eventId = req.query.eventId;

        const teamname = req.body.teamname;

       
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
        console.log(req.user);  // Debugging user information

        // Check if the user is authenticated
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated. Please log in to continue."
            });
        }

        // Return success response with user data
        return res.status(200).json({
            message: "User is authenticated and logged in successfully!",
        });
    } catch (error) {
        console.error("Error in registerForEvent:", error);
        return res.status(500).json({
            message: "An internal server error occurred. Please try again later."
        });
    }
});

export { eventRegistration, registerForEvent };
