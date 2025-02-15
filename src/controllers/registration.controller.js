import { asyncHandler } from "../utils/asyncHandler.js";
import { Registration } from "../model/registration.model.js";
import { User } from "../model/users.model.js";
import { Event } from "../model/events.model.js";


const eventRegistration = asyncHandler(async (req, res) => {
    try {
        const eventId = req.query.eventId;
        const teamname = req.body.teamName;

    
        if (!eventId) {
            return res.status(400).json({ message: "eventId is required" });
        }

        
        let teamEmail = req.body.teamemail;
        if (!Array.isArray(teamEmail)) {
            try {
                teamEmail = JSON.parse(teamEmail);
            } catch (err) {
                return res.status(400).json({ message: "Invalid team email format" });
            }
        }

       
        const cookiemail = req.cookies?.email;
        if (!cookiemail || teamEmail[0] !== cookiemail) {
            return res.status(400).json({
                message: "Failed to register the team. Team Email not found or does not match cookie email.",
            });
        }

        if (teamEmail.length === 0) {
            return res.status(400).json({ message: "No team emails provided" });
        }

    
        const registration = await Registration.create({
            teamname: teamname,
            user: teamEmail,
            event: eventId,
        });

        if (!registration) {
            return res.status(400).json({ message: "Failed to create registration. Please try again." });
        }

       
        for (let email of teamEmail) {
            const user = await User.findOne({ email });
            if (user) {
                user.eventsregistered.push(eventId);
                await user.save();
            } else {
                console.log(`User not found for email: ${email}`);
            }
        }

      

        return res.status(200).json({
            message: "Team registration successful",
        });

    } catch (error) {
        console.error("Error during event registration:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



const registerForEvent = asyncHandler(async (req, res) => {
    try {

        


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
        

        const isRegistered = await Registration.findOne({
            user: req.user.email,
            event: eventId
        });

        

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
