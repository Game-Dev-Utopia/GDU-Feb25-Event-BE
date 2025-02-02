import mongoose  , {Schema}  from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"



const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: [true, "This username is already taken"],
        index: true,
        minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
        type: String,
        required: true,
        unique: [true, "This emailId already exists"],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
        minlength: [3, "Full name must be at least 3 characters long"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
    },
    contact: {
        type: String,
        required: true,
        unique: [true, "This contact number is already registered"],
        // match: [/^\d{10}$/, "Contact number must be a valid 10-digit number"]
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
    isAdmin: {
        type : Boolean,
        default: false 
    },
    // isVerified: { 
    //     type: Boolean,
    //      default: false
    // },
    // otp: { 
    //     type: String, 
    //     required: false 
    // },
    // otpExpires: { 
    //     type: Date,
    //     required: false 
    // },
    
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
        expiresIn : process.env.ACCESS_TOKEN_EXPIRE || '15m'
    };

    return jwt.sign(payload, secret, options);
}

userSchema.methods.generateRefreshToken = function () {
    const payload = {
        _id : this._id
    };

    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '1d'
    };

    return jwt.sign(payload, secret, options);
}


export const User = mongoose.model("User", userSchema)