const Product = require("../models/Product");

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: { $ne: "archived" } }).sort({ createdAt: -1 });
    return res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    return res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const { name, category, price, stock, description, image, status } = req.body || {};

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, price, and stock are required.",
      });
    }

    const product = await Product.create({
      name: String(name).trim(),
      category: String(category).trim(),
      price: Number(price),
      stock: Number(stock),
      description: description ? String(description).trim() : "",
      image: image || "",
      status: status || "active",
    });

    return res.status(201).json({ success: true, message: "Product added successfully.", product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description, image, status } = req.body || {};
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (name) product.name = String(name).trim();
    if (category) product.category = String(category).trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (description !== undefined) product.description = String(description).trim();
    if (image !== undefined) product.image = String(image);
    if (status) product.status = String(status);

    await product.save();

    return res.json({ success: true, message: "Product updated successfully.", product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    return res.json({ success: true, message: "Product removed successfully.", product });
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const keyword = String(req.query.q || "").trim();

    if (!keyword) {
      return getAllProducts(req, res, next);
    }

    const products = await Product.find({
      status: { $ne: "archived" },
      name: { $regex: keyword, $options: "i" },
    }).sort({ createdAt: -1 });

    return res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      status: { $ne: "archived" },
    }).sort({ createdAt: -1 });

    return res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: "featured" }).sort({ createdAt: -1 });
    return res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
};
