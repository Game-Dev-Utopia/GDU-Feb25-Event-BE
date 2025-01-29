import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Contact } from "../model/contact.model.js";

const submitContact = asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Create a new contact
    const newContact = new Contact({
      name,
      email,
      phone,
      message,
    });

    // Save the contact to the database
    await newContact.save();

    // Respond with success
    return res.status(201).json({
      message: "Contact created successfully.",
      contact: newContact,
    });
})

export {submitContact}