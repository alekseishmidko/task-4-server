import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import { validationResult } from "express-validator";
//
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
    });
    // создание самого пользователя в монгоДБ
    const user = await newUser.save();
    // создание токена в случае если получилось создать пользователя. 2й параметр это метод шифрации
    const token = jwt.sign({ _id: user._id }, "secret123", {
      expiresIn: "3d",
    });
    // избавление от параметра passwordHash в информации от юзера. она не нужна. _doc =
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
        message: "Пользователь не найден",
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
    // const userData = user._doc;
    const updatedData = await UserModel.findOneAndUpdate(
      { _id: userData._id },
      { lastLogin: new Date() },
      { new: true }
    );

    res.json({
      // userData,
      updatedData,
      token,
      allUsers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
};

export const me = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: " dont find user",
      });
    }
    const { passwordHash, ...userData } = user._doc;
    // res.json(token);
    res.json(userData);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: " fault during fetch current user(me)",
    });
  }
};

export const block = async (req, res) => {
  const status = "notActive";

  // const users = req.body;
  // console.log(users);
  // const userIDs = users.map((item) => {
  //   return item._id;
  // });
  // const userData = req.body;
  const userIDs = req.body;
  console.log(userIDs, "userIDs");
  // console.log(userData, "userData");

  try {
    const updatedUsers = await UserModel.updateMany(
      { _id: { $in: userIDs } },
      { $set: { status } }
    );
    const allUsers = await UserModel.find().exec();
    // const updatedUser = await UserModel.findById(userData);
    // console.log(updatedUser);
    res.status(200).json({
      allUsers,
      // updatedUser,
      message: "Статус выбранных пользователей успешно обновлен",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ошибка при обновлении статуса пользователей" });
  }
};
export const unblock = async (req, res) => {
  const status = "active";

  // const users = req.body;
  // const userIDs = users.map((item) => {
  //   return item._id;
  // });
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
      message: "Статус выбранных пользователей успешно обновлен",
    });
  } catch (error) {
    res.status(500).json({
      error: "Ошибка при обновлении статуса пользователей",
    });
  }
};
export const remove = async (req, res) => {
  // const users = req.body;
  // console.log(users);
  // const userIDs = users.map((item) => {
  //   return item._id;
  // });
  const userIDs = req.body;

  try {
    const result = await UserModel.deleteMany({ _id: { $in: userIDs } });
    const allUsers = await UserModel.find().exec();
    // Проверяем, сколько документов было удалено
    if (result.deletedCount > 0) {
      res
        .status(200)
        .json({ result, allUsers, message: "Пользователи успешно удалены" });
    } else {
      res.status(404).json({ message: "Пользователи не найдены" });
    }
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении пользователей" });
  }
};
