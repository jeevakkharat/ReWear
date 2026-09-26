const Payment = require("../models/Payment");

const createPaymentOrder = async (req, res, next) => {
  try {
    const { userId, orderId, amount, currency = "INR", method = "COD", gateway = "manual", metadata = {} } = req.body || {};

    if (!userId || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "userId, orderId, and amount are required.",
      });
    }

    const payment = await Payment.create({
      userId,
      orderId,
      amount: Number(amount),
      currency,
      method,
      gateway,
      metadata,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Payment record created successfully.",
      payment,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, orderId, status = "paid", signature = "" } = req.body || {};

    if (!paymentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "paymentId and orderId are required.",
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { paymentId: paymentId || orderId },
      {
        status,
        signature,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Payment verified successfully.",
      verified: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentDetails = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    return res.json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
};
