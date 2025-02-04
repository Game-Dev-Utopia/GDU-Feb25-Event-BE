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

        const cookiemail = await req.cookies?.email;
        console.log(cookiemail);
        console.log(teamEmail[0]);

        if (teamEmail[0] != cookiemail) {
            return res.status(400).json({
                message: "Failed to register the team. Team Email not found.",
            });

        }

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
            teamname: teamname,
            user: teamEmail,
            event: eventId
        });

        console.log("registration", registration)





        

        for (let email of teamEmail) {
            console.log(email)
            const user = await User.findOne({ email });
            if (user) {
                user.eventsregistered.push(eventId);
                await user.save();
            } 
            // else {
            //     console.log(`User not found for email: ${email}`);
            // }
        }

        console.log("done")

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

        console.log("req.user", req.user);


        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated. Please log in to continue."
            });
        }

        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({
                message: "Event ID is required."
            });
        }
        console.log("User Email:", req.user.email);
        console.log("Event ID:", eventId);

        const isRegistered = await Registration.findOne({
            user: req.user.email,
            event: eventId
        });

        console.log("isRegistered:", isRegistered);

        if (isRegistered) {
            return res.status(400).json({
                message: "You have already registered for this event."
            });
        }

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
