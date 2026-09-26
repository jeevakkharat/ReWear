const Review = require("../models/Review");

const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    return res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

const addReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body || {};

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: "Product, rating, and comment are required." });
    }

    const review = await Review.create({
      productId,
      userId: req.user?._id || "guest",
      userName: req.user?.fullName || "Guest User",
      rating: Number(rating),
      comment: String(comment).trim(),
    });

    return res.status(201).json({ success: true, message: "Review added successfully.", review });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (req.user && review.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const { rating, comment } = req.body || {};
    if (rating) review.rating = Number(rating);
    if (comment) review.comment = String(comment).trim();

    await review.save();

    return res.json({ success: true, message: "Review updated successfully.", review });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    if (req.user && review.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    await review.deleteOne();
    return res.json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
};
