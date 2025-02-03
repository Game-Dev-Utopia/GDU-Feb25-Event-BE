import mongoose, { Schema } from "mongoose";

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // Converts email to lowercase
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      // match: [/^\d{10,15}$/, "Please enter a valid phone number"], // Validates phone numbers with 10-15 digits
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000, // Limits message length
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export const Contact = mongoose.model("Contact", contactSchema);
