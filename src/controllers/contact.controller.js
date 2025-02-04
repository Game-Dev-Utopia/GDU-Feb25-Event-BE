import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Contact } from "../model/contact.model.js";

const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log(name,email,phone,message);

  // Validate required fields
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ 
      error: "All fields are required.", 
      missingFields: { name: !name, email: !email, phone: !phone, message: !message }
    });
  }


    // Save the contact to the database
    const newContact = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    console.log(newContact);
    return res.status(201).json({
      message: "Contact created successfully.",
      contact: newContact,
    });
 
});


export { submitContact }