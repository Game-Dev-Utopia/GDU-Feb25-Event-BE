import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Event } from "../model/events.model.js";

const eventDetail = asyncHandler(async (req, res) => {
    const { eventId } = req.query; 

    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
    }

    
    const event = await Event.findById(eventId);

    
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }

   
    res.status(200).json(event);
});

export { eventDetail };
