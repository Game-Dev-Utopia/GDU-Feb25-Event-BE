import mongoose, {Schema} from "mongoose";


const registrationSchema = new Schema ({
    teamname : {
         type : String,
    },
    user : [
        {
            type : String,
            ref : "User"
        }
    ],
    event : {
        type : Schema.Types.ObjectId,
        ref : "Event"
    }
}, {timestamps : true})


export const Registration = mongoose.model("Registration", registrationSchema)