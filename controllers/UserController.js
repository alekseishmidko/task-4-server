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
      status: "notActive",
    });
    // создание самого пользователя в монгоДБ
    const user = await newUser.save();
    // создание токена в случае если получилось создать пользователя. 2й параметр это метод шифрации
    const token = jwt.sign({ _id: user._id }, "secret123", {
      expiresIn: "3d",
    });
    // избавление от параметра passwordHash в информации от юзера. она не нужна. _doc =
    const { passwordHash, ...userData } = user._doc;
    res.json({ ...userData, token });
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
    // const { passwordHash, ...userData } = user._doc;
    const userData = user._doc;
    const updatedData = await UserModel.findOneAndUpdate(
      { _id: userData._id },
      { lastLogin: new Date() },
      { new: true }
    );

    res.json({
      ...userData,
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
      message: " fault during registration(register)",
    });
  }
};

export const block = async (req, res) => {
  const status = "notActive";

  const users = req.body;
  const userIDs = users.map((item) => {
    return item._id;
  });

  try {
    await UserModel.updateMany({ _id: { $in: userIDs } }, { $set: { status } });

    res
      .status(200)
      .json({ message: "Статус выбранных пользователей успешно обновлен" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ошибка при обновлении статуса пользователей" });
  }
};
export const unblock = async (req, res) => {
  const status = "active";

  const users = req.body;
  const userIDs = users.map((item) => {
    return item._id;
  });

  try {
    await UserModel.updateMany({ _id: { $in: userIDs } }, { $set: { status } });

    res
      .status(200)
      .json({ message: "Статус выбранных пользователей успешно обновлен" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ошибка при обновлении статуса пользователей" });
  }
};
export const remove = async (req, res) => {
  const users = req.body;
  const userIDs = users.map((item) => {
    return item._id;
  });

  try {
    const result = await UserModel.deleteMany({ _id: { $in: userIDs } });

    // Проверяем, сколько документов было удалено
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Пользователи успешно удалены" });
    } else {
      res.status(404).json({ message: "Пользователи не найдены" });
    }
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении пользователей" });
  }
};
