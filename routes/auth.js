// const router = require('express').Router();
// const express = require('express');
// const router = express.Router();
import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import userModel from "../models/registermodel.js";

import {
  auth,
  refreshauth,
  isAdmin,
  forgotPassword,
  resetPassword,
} from "../middleware/isAuth.js";
import { activateAccount, signup, regenerateOTP } from "../middleware/Signupactivation.js";
import generateOTP from "../middleware/OTPgeneration.js";
import {forgotPasswordOTP,resetPasswordOTP} from "../middleware/OTP-forgot-reset-password.js";
router.post("/signup", signup);
router.post("/account-activate", activateAccount);
router.post("/register", async (req, res) => {
  // checking if the user is already in database
  const emailExist = await userModel.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exists");

  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const registerUser = new userModel({
        fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password,
        confirmpassword: req.body.confirmpassword,
        role: req.body.role,
        
      });
      console.log("the success part" + registerUser);

      const token = await registerUser.generateAuthToken();
      console.log("token part:" + token);
      //Cookie
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 90000),
        httpOnly: true,
      });
      console.log(res.cookie);

      const registered = await registerUser.save();
      console.log("the page part" + registered);
      // res.send({status:200,message:'User Added Successfully',registerUser:registerUser._id});
      res.send("user added");
    } else {
      res.send("Passwords are not matching");
    }
  } catch (error) {
    res.status(400).send(error);
    console.log("error part:" + error);
  }
});
//Login

router.post("/login", async (req, res) => {
  try {
    // const email = req.body.email;
    // const password = req.body.password;
    const useremail = await userModel.findOne({ email: req.body.email });
    if (!useremail) return res.status(400).send("Email not found");

    const validPass = await bcrypt.compare(
      req.body.password,
      useremail.password.toString()
    );
    const token = await useremail.generateAuthToken();
    console.log("Access token part:" + token);
    res.cookie("jwt", token, {
      expiresIn: "1s",
      httpOnly: true,
    });
    console.log(res.cookie);
    const refreshtoken = await useremail.generateRefreshToken();

    console.log("refreshtoken part:" + refreshtoken);

    res.cookie("refreshjwt", refreshtoken, {
      httpOnly: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
      expiresIn: "1d",
    });
    if (validPass) {
      res.status(200).json({
        message: "login successful",
        token,
        refreshtoken,
      });
    } else {
      return res.status(400).send("invalid password");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log("error part:" + err);
  }
});
//refresh token
router.post("/refresh", refreshauth);
//Forgotpassword,resetpassword
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.put("/forgot-password-otp", forgotPasswordOTP);
router.put("/reset-password-otp", resetPasswordOTP);

//post
router.get("/post", auth, (req, res) => {
  res.json({
    posts: {
      title: "my first post",
      desc: "random data  access get by login",
    },
  });
  // res.send(req.user);
});
router.post("/edit", auth, isAdmin, (req, res) => {
  res.send("Access Granted for edit");
});

router.get("/userlist", auth, isAdmin, async (req, res) => {
  const userlist = await userModel.find();
  res.send(userlist);
});
router.get("/logout", auth, async (req, res) => {
  try {
    // console.log(req.user);
    // req.user.token = req.user.token.filter((currElement) => {
    //   return currElement.token !== req.token;
    // });
    res.clearCookie("jwt");
    res.clearCookie("refreshjwt");

    console.log("logout successfully");
    await req.user.save();
    res.send("logout Successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/getotp',generateOTP)
router.post('/resendotp',regenerateOTP)

// module.exports = router;
export default router;
