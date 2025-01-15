import mongoose, {Schema} from "mongoose";


const eventSchema = new Schema({
    name : {
        type : String,
        required : true,
        index : true
    },
    description : {
        type : String,
    },
    typeOfevent : {
        type : String,
        required : true
    },
    registrationFee : {
        type : Number,
        required : true
    },
    teamSize : {
        type : Number,
    }
}, {timestamps : true})


export const Event = mongoose.model("Event", eventSchema)