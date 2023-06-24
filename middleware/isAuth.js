import jwt from "jsonwebtoken";
import userModel from "../models/registermodel.js";
import nodemailer from "nodemailer";
import _ from "lodash";

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log(req.cookies.jwt);

    const verifyUser = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = await userModel.findById(verifyUser._id);
    req.token = token;
    next();
  } catch (err) {
    if (err.name == "TokenExpiredError") {
      res.status(401).json({
        message: "Token Expired!",
      });
      return;
    } else res.status(401).send("Invalid Token,Authentication failed");
    return;
  }
};

const refreshauth = async (req, res, next) => {
  try {
    const refreshtoken = req.cookies.refreshjwt;
    console.log(req.cookies.refreshjwt);

    if (!refreshtoken) {
      return res.status(401).send({
        message: "No refresh token provided",
      });
    }
    const verifyUser = jwt.verify(
      refreshtoken,
      process.env.REFRESHTOKEN_SECRET
    );
    const user = await userModel.findById(verifyUser._id);
    req.refreshtoken = refreshtoken;
    // if (!user) {
    //   return res.status(401).send({
    //     message: "User not found",
    //   });
    // }
    await user.generateAuthToken();
    res.cookie("jwt", user.token, {
      expiresIn: "1s",
      httpOnly: true,
    });
    await user.generateRefreshToken();
    res.cookie("refreshjwt", user.refreshtoken, {
      httpOnly: true,
      sameSite: "None",
      expiresIn: "1d",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      "Access Token": user.token,
      "Refresh Token": user.refreshtoken,
      message: "Refresh token successful",
    });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error,
    });
  }
};

const isAdmin = function (req, res, next) {
  console.log(req.user.role);
  if (req.user.role === "user") {
    return res.status(401).send("Access Denied , you must be admin");
  }
  next();
};
//Forgot password & Reset pasword
const forgotPassword = (req, res) => {
  const { email } = req.body;
  userModel.findOne({ email: req.body.email }, (err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: "User with this email does not exists" });
    }
    const token = jwt.sign({ id: user._id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "20m",
    });
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "n@outlook.com",
        pass: "*********",
      },
    });

    const data = {
      from: "n@outlook.com",
      to: email,
      subject: "Password Reset Link",
      text: "Wow that's simple",
      html: `
      <h2>'Please click on given link to reset your password'</h2>
      <a>${process.env.CLIENT_URL}/authentication/forgotpassword/${token}</a>
      `,
    };
    return user.updateOne({ resetLink: token }, function (err, success) {
      if (err) {
        return res.status(400).json({ error: "reset password link error" });
      } else {
        transporter.sendMail(data, function (err, info) {
          if (err) {
            console.log(err);
            return;
          }
          console.log("Sent: " + info.response);
          return res.json({
            message: "Email has been sent, kindly follow the instructions",
          });
        });
      }
    });
  });
};
//Reset pasword
const resetPassword = (req, res) => {
  const { resetLink, newPassword } = req.body;
  if (resetLink) {
    jwt.verify(
      resetLink,
      process.env.RESET_PASSWORD_KEY,
      function (err, decodedData) {
        if (err) {
          return res.status(401).json({
            error: "Incorrect token or it is expired",
          });
        }
        userModel.findOne({ resetLink }, (err, user) => {
          if (err || !user) {
            return res
              .status(400)
              .json({ error: "user with this token does not exist" });
          }
          const obj = {
            password: newPassword,
          };
          user = _.extend(user, obj);
          user.save((err, result) => {
            if (err) {
              return res.status(400).json({ error: "reset password error" });
            } else {
              return res
                .status(200)
                .json({ message: "Your password has been changed" });
            }
          });
        });
      }
    );
  } else {
    return res.status(401).json({ error: "Authentication Error" });
  }
};
// module.exports = auth;
export { auth, refreshauth, isAdmin, forgotPassword, resetPassword };

// ?**************************?

//access token verification
// const auth1 = async (req,res,next) =>{
//   try{
//       const token = req.cookies.jwt;
//       const verifyUser = jwt.verify(token, process.env.TOKEN_SECRET);
//       req.user = await userModel.findById(verifyUser._id);
//       req.token = token;
//       next();
//     }catch(err){
//     res.status(401).send('Invalid Token');
//     }

//   }

//******************************************************************** */
//REFACTORED CODE OF RESET PASSWORD
// const resetPassword = async (req, res) => {
//   try {
//     const { resetLink, newPassword } = req.body;
//     if (!resetLink) {
//       throw createError(401, "Authentication Error");
//     }
//     const decodedData = await jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY);
//     const user = await userModel.findOne({ resetLink });
//     if (!user) {
//       throw createError(400, "user with this token does not exist");
//     }
//     user.password = newPassword;
//     await user.save();
//     return res.status(200).json({ message: "Your password has been changed" });
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ error: "Incorrect token or it is expired" });
//     }
//     return res.status(400).json({ error: "reset password error" });
//   }
// };
