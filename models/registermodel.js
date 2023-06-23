import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
//create schema for database
const userSchema = mongoose.Schema({
  StudId: Number,
  fullname: {
    type: String,
    required: true,
    maxLength: 5,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  // tokens: [
  //   {
  //     token: {
  //       type: String,
  //       required: true,
  //     }
  //   },
  // ],
  token: {
    type: String,
  },
  refreshtoken: {
    type: String,
  },
  is_Verified: {
    type: Number,
    default: 0,
  },
  otp: {
    type: String,
    required: true
   },
   otpcreatedAt:{
     type:Date
   },
   otpexpiredAt:{
     type:Date
   }
});

//Generating Tokens
userSchema.methods.generateAuthToken = async function () {
  try {
    console.log(this._id);
    //create and assign a token
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.TOKEN_SECRET,
      { expiresIn: "20m" }
    );
    // this.tokens = this.tokens.concat({ token: token }); //if bothnames are same we can use {token}
    //await this.save();
    this.token = token;
    // await this.save();
    return token;
  } catch (error) {
    res.send("Error part" + error);
    console.log("Error part:-" + error);
  }
};

//Generating Refresh Token
userSchema.methods.generateRefreshToken = async function () {
  try {
    console.log(this._id);
    //create and assign a token
    const refreshtoken = jwt.sign(
      { _id: this._id.toString() },
      process.env.REFRESHTOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // this.tokens= this.tokens.concat({ refreshtoken: refreshtoken }); //if bothnames are same we can use {token}
    this.refreshtoken = refreshtoken;
    // await this.save();
    return refreshtoken;
  } catch (error) {
    res.send("Error part" + error);
    console.log("Error part:-" + error);
  }
};

//hash password
// const salt = await bcrypt.genSalt(10);
// const hashedpassword = await bcrypt.hash(req.body.password, salt);

//Converting password into hash
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmpassword = await bcrypt.hash(this.password, salt);
  }
 

  next();
});
//create model
const userModel = mongoose.model("UserDetails", userSchema);

// module.exports = userModel;
export default userModel;
