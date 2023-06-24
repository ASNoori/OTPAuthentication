//Forgot password & Reset pasword Using OTP
import createError from "http-errors";
import userModel from "../models/registermodel.js";
import nodemailer from "nodemailer";
import generateOTP from "../middleware/OTPgeneration.js";


const forgotPasswordOTP = async (req, res, next) => {
  const { email } = req.body;
  try {
    console.log("email:", email);
    const user = await userModel.findOne({ email });
    if (!user) {
      throw createError(404, "User Not Found");
    }
    const otpGenerated = generateOTP().toString();
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "n@outlook.com",
        pass: "********",
      },
    });
    const data = {
      from: "n@outlook.com",
      to: email,
      subject: "OTP for Password Reset",
      text: "Wow that's simple",
      html: `
        <h2>'OTP to reset your password'</h2>
        <p>${otpGenerated}  </p> `,
    };
    await user.updateOne({ otp: otpGenerated });
    await transporter.sendMail(data);
    return res.json({
      message: "OTP has been sent to your email, kindly follow the instructions",
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
//Reset password using OTP
const resetPasswordOTP = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    if (!otp) {
      throw createError(401, "Authentication Error");
    }
    const user = await userModel.findOne({ otp});
    if (!user) {
      throw createError(400, "OTP Not Matched");
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "Your password has been changed" });
  } catch (error) {
    next(error);
  }
};

export {forgotPasswordOTP,resetPasswordOTP};

