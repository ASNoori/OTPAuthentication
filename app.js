import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import createError from 'http-errors';

//add cors
// const cors = require('cors');

//import routes
import authRoute from "./routes/auth.js";
import { auth, refreshauth } from "./middleware/isAuth.js";

//connect DB
import mongoose from "mongoose";
mongoose.connect("mongodb://127.0.0.1:27017/UserDetails"); //last step.& Student is db name
import userModel from "./models/registermodel.js";

//middlewares
app.use(express.json());



//add cors
// app.use(cors({
//     origin: 'http://localhost:4200'
// }));

//middleware
app.use(cookieParser());



//Route middlewares
app.use("/api/user", authRoute);
app.use("", refreshauth);

//404 handler and pass to Error handler
app.use((req,res,next) =>{
  next(createError(404,"Not Found"));
});

//Error handler
app.use((err,req,res,next) =>{
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status ||500,
      message: err.message
    }
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server up and running");
});
