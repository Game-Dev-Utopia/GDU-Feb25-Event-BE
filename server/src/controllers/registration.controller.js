import { asyncHandler } from "../utils/asyncHandler.js";
import { Registration } from "../model/registration.model.js";
import { User } from "../model/users.model.js";
import { Event } from "../model/events.model.js";


const eventRegistration = asyncHandler(async (req, res) => {
    try {
        
        const eventId = req.query.eventId;
        if (!eventId) {
            return res.status(400).json({ message: "eventId is required" });
        }

      
        const teamEmail = Array.isArray(req.body.teamemail)
            ? req.body.teamemail
            : JSON.parse(req.body.teamemail);

        const memberIds = [];
        for (let i = 0; i < teamEmail.length; i++) {
            const email = teamEmail[i];

            const user = await User.findOne({ email });

            if (user) {
                memberIds.push(user._id);
            } else {
                console.log(`User not found for email: ${email}`);
            }
        }
        if (memberIds.length > 0) {
            await Event.findByIdAndUpdate(
                eventId,
                { $push: { members: { $each: memberIds } } },
                { new: true }
            );
        }

        const registration = await Registration.create({
            user: memberIds,
            event: eventId
        });

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


export {eventRegistration}