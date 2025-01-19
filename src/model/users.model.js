import mongoose  , {Schema}  from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"



const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique : [true , "This username is already taken"],
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : [true , "This emailId already exist"],
        lowercase : true,
        trim : true
    },
    fullname : {
        type : String,
        required : true,
        trim : true,
        index : true
     },
     password: {
        type : String,
        required: [true, "Password is required"]
    },
    contact : {
        type : Number,
        required : true
    },
    collegeName : {
        type : String,
        required : true
    },
    year : {
        type : Number,
        required : true
    },
    dept : {
         type : String,
         required : true
    },
    rollNo : {
        type : Number,
        required : true
    },
    eventsregistered : [
        {
            type : Schema.Types.ObjectId,
            ref : "Event"
        }
    ],
    refreshToken : {
        type: String
    }
}, 
 {
    timestamps : true
 }
)


userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}



userSchema.methods.generateAccessToken = function () {
    const payload = {
        _id : this._id,
        email : this.email,
        name : this.name,
        fullname : this.fullname
    };

    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRE || '1h'
    };

    return jwt.sign(payload, secret, options);
}

userSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id : this._id
    };

    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d'
    };

    return jwt.sign(payload, secret, options);
}


export const User = mongoose.model("User", userSchema)