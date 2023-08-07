import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { format } from "date-fns";
import UserModel from "../models/User.js";
import { validationResult } from "express-validator";

export const register = async (req, res) => {
  try {
    const { password, email, name } = req.body;

    const salt = await bcrypt.genSalt(10);
    const Hash = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      email: email,
      passwordHash: Hash,
      name: name,
      status: "active",
      key: Date.now(),
      dateOfCreate: format(new Date(), "dd.MM.yyyy HH:mm"),
      dateOfLastLogin: format(new Date(), "dd.MM.yyyy HH:mm"),
    });

    const user = await newUser.save();
    const token = jwt.sign({ _id: user._id }, "secret123", {
      expiresIn: "3d",
    });

    const allUsers = await UserModel.find().exec();
    const { passwordHash, ...userData } = user._doc;

    res.json({ userData, token, allUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: " fault during registration(register)",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user.status === "notActive") {
      return res.status(404).json({
        message: "User is disabled!",
      });
    }
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isValidPass = await bcrypt.compare(password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({
        message: "incorrect login or password",
      });
    }
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "3d",
      }
    );
    const allUsers = await UserModel.find().exec();
    const { passwordHash, ...userData } = user._doc;
    const updatedData = await UserModel.findOneAndUpdate(
      { _id: userData._id },
      { dateOfLastLogin: format(new Date(), "dd.MM.yyyy HH:mm") },
      { new: true }
    );

    res.json({
      updatedData,
      token,
      allUsers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to log in",
    });
  }
};

export const block = async (req, res) => {
  const status = "notActive";
  const userIDs = req.body;
  console.log(userIDs, "userIDs");
  try {
    const updatedUsers = await UserModel.updateMany(
      { _id: { $in: userIDs } },
      { $set: { status } }
    );
    const allUsers = await UserModel.find().exec();
    res.status(200).json({
      allUsers,
      message: "The status of the selected users has been successfully updated",
    });
  } catch (error) {
    res.status(500).json({ error: "Error when updating user status" });
  }
};
export const unblock = async (req, res) => {
  const status = "active";
  const userIDs = req.body;

  try {
    const updatedUsers = await UserModel.updateMany(
      { _id: { $in: userIDs } },
      { $set: { status } }
    );
    const allUsers = await UserModel.find().exec();

    res.status(200).json({
      updatedUsers,
      allUsers,
      message: "The status of the selected users has been successfully updated",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error when updating user status",
    });
  }
};
export const remove = async (req, res) => {
  const userIDs = req.body;

  try {
    const result = await UserModel.deleteMany({ _id: { $in: userIDs } });
    const allUsers = await UserModel.find().exec();
    if (result.deletedCount > 0) {
      res.status(200).json({
        result,
        allUsers,
        message: "users have been successfully deleted",
      });
    } else {
      res.status(404).json({ message: "No users found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error when deleting users" });
  }
};
