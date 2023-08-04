import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import {
  loginValidation,
  registerValidation,
} from "./validations/validation.js";

import checkAuth from "./utils/checkAuth.js";
import {
  login,
  me,
  register,
  block,
  unblock,
  remove,
} from "./controllers/UserController.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";
//
const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
// consts
const pass = process.env.PASSWORD;
const port = process.env.PORT || 3001;
// DB
mongoose
  .connect(
    `mongodb+srv://alex:${pass}@cluster0.gle9jsl.mongodb.net/blog?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("DB is active!");
  })
  .catch((error) => {
    console.log(error, "DB error");
  });

// controllers
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  register
);
app.post(
  "/auth/login",
  loginValidation,
  // handleValidationErrors,
  login
);
app.get(
  "/auth/me",
  // checkAuth,
  me
);
app.post("/auth/block", block);
app.post("/auth/unblock", unblock);
app.post("/auth/remove", remove);

// запуск приложения
app.listen(port, (error) => {
  if (error) console.log(error, "err");
  else {
    console.log("3001 is running");
  }
});
