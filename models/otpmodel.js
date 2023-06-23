import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
//create schema for database
const otpSchema = mongoose.Schema({
 userid:{
    type:String
 },
  otp: {
   type: String,
   required: true
  },
  is_Verified: {
    type: Number,
    default: 0,
  },
  createdAt:{
    type:Date
  },
  expiredAt:{
    type:Date
  }
});

//create model
const otpModel = mongoose.model("OtpDetails", otpSchema);

export default otpModel;

