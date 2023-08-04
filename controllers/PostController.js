import PostModel from "../models/Post.js";

// получение всех статей
export const getAll = async (req, res) => {
  try {
    // .populate("user")
    const allPosts = await PostModel.find().exec();
    res.json(allPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: " fault during getting  All posts (PostModel)",
    });
  }
};
// получение популярных
export const getPopular = async (req, res) => {
  try {
    // .populate("user")
    const popPosts = await PostModel.find().populate("viewsCount").exec();
    res.json(popPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: " fault during getting  popular posts (PostModel)",
    });
  }
};
// получение тегов
export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();
    const tags = posts.map((item) => item.tags.flat().slice(0, 5));
    res.json(tags);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: " fault during getting  last tags (PostModel)",
    });
  }
};

// получение одной статти

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedPost = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate("user");

    if (!updatedPost) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    res.json(updatedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Не удалось найти статью" });
  }
};
// удаление статьи
export const remove = async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedPost = await PostModel.findOneAndDelete({ _id: postId });

    if (!updatedPost) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Не удалось найти статью" });
  }
};

// создание статьи
export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(","),
      user: req.userId,
    });
    const post = await doc.save();
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: " fault during creating post (PostModel)",
    });
  }
};
// изменение статьи
export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedPost = await PostModel.updateOne(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags,
      }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "Статья не найдена" });
    }
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Не удалось изменить статью" });
  }
};
