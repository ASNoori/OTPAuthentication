import userModel from "../models/registermodel.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import generateOTP from "../middleware/OTPgeneration.js";

//EMAIL ACTIVATION WHEN SIGNUP USING OTP
const signup = async (req, res) => {
  // checking if the user is already in database
  const emailExist = await userModel.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exists");
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    const otpGenerated = generateOTP().toString();

    if (password === cpassword) {
      const registerUser = new userModel({
        fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
        role: req.body.role,
        otp: otpGenerated,
        otpcreatedAt: Date.now(),
        otpexpiredAt:Date.now()+3600000
      });
      console.log("the success part" + registerUser);

      const registered = await registerUser.save();
      console.log("the page part" + registered);
      // res.send({status:200,message:'User Added Successfully',registerUser:registerUser._id});
      // res.send("user added");

      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: "nooriameer12@outlook.com",
          pass: "thisismymicrosoftacc!",
        },
      });
      const data = {
        from: "nooriameer12@outlook.com",
        to: registerUser.email,
        subject: "Account Activation Link",
        text: "Wow that's simple",
        html: `
            <h2>'OTP to activate your account'</h2>
           <h1>${otpGenerated}</h1>
            `,
      };

      transporter.sendMail(data, function (err, info) {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Sent: " + info.response);
        return res.json({
          message:
            "OTP has been sent to your email, kindly Activate your account",
        });
      });
    } else {
      res.send("email not sent");
    }
  } catch (error) {
    res.status(400).send(error);
    console.log("error part:" + error);
  }
};

const activateAccount = async (req, res) => {
  const userdata = req.body;
  try {
    if (userdata.otp) {
      const user = await userModel.findOne({ email: userdata.email });
      if (user.otpexpiredAt < Date.now()) {
        await userModel.findByIdAndUpdate(user._id, { otp: "" });
        return res.send("OTP Expired");
      }
      const updateUserInfo = await userModel.findByIdAndUpdate(user._id, {
        is_Verified: 1,
      });
      console.log(updateUserInfo);
      return res.send("email verified");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const regenerateOTP = async (req, res) => {
  try {
    const useremail= await userModel.findOne({ email: req.body.email });
    if (!useremail) return res.status(400).send("Email not found");
    const otpGenerated = generateOTP();
    const salt = await bcrypt.genSalt(10);
  const hashotp = await bcrypt.hash(otpGenerated, salt);
    if (useremail) {
      const resendOTP = await userModel.findByIdAndUpdate(useremail._id, {
        otp: hashotp
      });
      console.log(resendOTP);
      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: "nooriameer12@outlook.com",
          pass: "thisismymicrosoftacc!",
        },
      });
      const data = {
        from: "nooriameer12@outlook.com",
        to: req.body.email,
        subject: "Account Activation Link",
        text: "Wow that's simple",
        html: `
        <h2>'OTP to activate your account'</h2>
       <h1>${otpGenerated}</h1>
        `,
      };

      transporter.sendMail(data, function (err, info) {
        if (err) {
          console.log(err);
          return;
        }
        console.log("Sent: " + info.response);
        return res.json({
          message:
            "OTP has been resent to your email, kindly Activate your account",
        });
      });
    } else {
      res.send("email not sent");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};
export { signup, activateAccount, regenerateOTP };
