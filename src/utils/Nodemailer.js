import nodemailer from "nodemailer"



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
 });


 const sendVerificationEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: "Verify your email",
        text: `Your OTP for email verification is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
};



export {sendVerificationEmail};