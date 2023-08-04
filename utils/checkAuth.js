import jwt from "jsonwebtoken";

export default (req, res, next) => {
  // const token = req.headers.authorization;
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (token) {
    // расшифровка токена
    try {
      const decoded = jwt.verify(token, "secret123");
      req.userId = decoded._id;
      next();
    } catch (error) {
      return res.status(403).json({
        message: "Нет доступа(не расшифровался токен)",
      });
    }
  } else {
    return res.status(403).json({
      message: "Нет доступа 111",
    });
  }
  // res.send(token);
};
