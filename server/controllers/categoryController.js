const Category = require("../models/Category");

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    return res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

const addCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body || {};

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    const category = await Category.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : "",
      image: image || "",
    });

    return res.status(201).json({ success: true, message: "Category created successfully.", category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body || {};
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    if (name) category.name = String(name).trim();
    if (description !== undefined) category.description = String(description).trim();
    if (image !== undefined) category.image = String(image);

    await category.save();

    return res.json({ success: true, message: "Category updated successfully.", category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    return res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};
