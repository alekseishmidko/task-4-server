import { body } from "express-validator";
//
export const loginValidation = [
  body("email", "Incorrect email!!!").isEmail(),
  body("password", "password length should be more then 1 symbol").isLength({
    min: 1,
  }),
];
export const registerValidation = [
  body("email", "Incorrect email!!!").isEmail(),
  body("password", "password length should be more then 1 symbol").isLength({
    min: 1,
  }),
  body("name", "fullname length should be more then 2 symbols").isLength({
    min: 2,
  }),
];
