import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
    },
    date: [
        [
            {
                type: Date,
            }
        ]
    ], // Array of arrays of dates
    time: [
        {
            type: String,
        }
    ], // Array of strings for time
    typeOfevent: {
        type: String,
        required: true
    },
    registrationFee: {
        type: Number,
        required: true
    },
    teamSize: {
        type: Number,
    },
    venue: {
        type: String,
    },
    rule: [
        {
            type: String,
        }
    ],
    imageUrl: {
        type: String,
    }
}, { timestamps: true });

export const Event = mongoose.model("Event", eventSchema);
