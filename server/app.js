const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const User = require("./models/User");
const Product = require("./models/Product");
const Category = require("./models/Category");
const Order = require("./models/Order");
const ReturnRequest = require("./models/ReturnRequest");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
app.locals.carts = {};

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@rewear.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const USER_EMAIL = (process.env.USER_EMAIL || "user@rewear.com").toLowerCase();
const USER_PASSWORD = process.env.USER_PASSWORD || "user123";

const seedProducts = [
  {
    name: "Urban Layer Jacket",
    category: "Men",
    price: 1999,
    stock: 18,
    status: "active",
    description: "Structured outerwear for everyday layering.",
    image: "https://images.unsplash.com/photo-1550967155-97a1ebf16bd2?q=80&w=1974&auto=format&fit=crop",
  },
  {
    name: "Blue Blossom",
    category: "Women",
    price: 1740,
    stock: 11,
    status: "active",
    description: "Soft statement dress with premium finish.",
    image: "https://images.unsplash.com/photo-1763294632421-84383bbb9dda?q=80&w=687&auto=format&fit=crop",
  },
  {
    name: "Mini Hoodie",
    category: "Kids",
    price: 1460,
    stock: 24,
    status: "featured",
    description: "Comfortable everyday hoodie for kids.",
    image: "https://plus.unsplash.com/premium_photo-1706151506322-f5d534b59263?w=600&auto=format&fit=crop&q=60",
  },
];

const seedCategories = [
  {
    name: "Men",
    description: "Smart essentials and casual layering for men.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=687&auto=format&fit=crop",
  },
  {
    name: "Women",
    description: "Premium dresses, fits, and everyday statement looks.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=687&auto=format&fit=crop",
  },
  {
    name: "Kids",
    description: "Comfortable, playful styles built for movement.",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=687&auto=format&fit=crop",
  },
];

const seedReturns = [
  {
    orderId: "RW-2048",
    customerEmail: "user@rewear.com",
    reason: "Wrong size received",
    status: "pending",
  },
  {
    orderId: "RW-1987",
    customerEmail: "demo@example.com",
    reason: "Defective item",
    status: "pending",
  },
];

async function seedDatabase() {
  try {
    const adminExists = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        fullName: "ReWear Admin",
        email: ADMIN_EMAIL,
        phone: "9999999999",
        password: ADMIN_PASSWORD,
        category: "admin",
        role: "admin",
        agreeTerms: true,
      });
    }

    const userExists = await User.findOne({ email: USER_EMAIL });
    if (!userExists) {
      await User.create({
        fullName: "Demo Customer",
        email: USER_EMAIL,
        phone: "8888888888",
        password: USER_PASSWORD,
        category: "women",
        role: "user",
        agreeTerms: true,
      });
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.insertMany(seedCategories);
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(seedProducts);
    }

    const generatedProducts = await Product.find().lean();
    const generatedCustomer = await User.findOne({ email: USER_EMAIL }).lean();

    if (generatedProducts.length > 0 && generatedCustomer) {
      const orderCount = await Order.countDocuments();
      if (orderCount === 0) {
        const firstProduct = generatedProducts[0];
        await Order.insertMany([
          {
            userId: generatedCustomer._id.toString(),
            customer: {
              fullName: generatedCustomer.fullName,
              email: generatedCustomer.email,
            },
            items: [{
              productId: firstProduct._id.toString(),
              name: firstProduct.name,
              price: firstProduct.price,
              quantity: 1,
            }],
            shippingAddress: {
              city: "Bengaluru",
              state: "Karnataka",
              country: "India",
            },
            paymentMethod: "COD",
            subtotal: firstProduct.price,
            shipping: 0,
            total: firstProduct.price,
            status: "Processing",
          },
          {
            userId: generatedCustomer._id.toString(),
            customer: {
              fullName: generatedCustomer.fullName,
              email: generatedCustomer.email,
            },
            items: [{
              productId: generatedProducts[1]._id.toString(),
              name: generatedProducts[1].name,
              price: generatedProducts[1].price,
              quantity: 2,
            }],
            shippingAddress: {
              city: "Mumbai",
              state: "Maharashtra",
              country: "India",
            },
            paymentMethod: "UPI",
            subtotal: generatedProducts[1].price * 2,
            shipping: 120,
            total: generatedProducts[1].price * 2 + 120,
            status: "Shipped",
          },
        ]);
      }
    }

    const returnCount = await ReturnRequest.countDocuments();
    if (returnCount === 0) {
      await ReturnRequest.insertMany(seedReturns);
    }
  } catch (error) {
    console.error("Seed error:", error);
  }
}

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }

  next();
};

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "ReWear server is running" });
});

app.get("/api/admin/dashboard", authMiddleware, requireAdmin, async (_req, res) => {
  const [totalProducts, pendingReturns, activeProducts] = await Promise.all([
    Product.countDocuments(),
    ReturnRequest.countDocuments({ status: "pending" }),
    Product.countDocuments({ status: { $ne: "archived" } }),
  ]);

  return res.json({
    success: true,
    stats: {
      inventoryCount: activeProducts,
      pendingReturns,
      totalProducts,
    },
    admin: {
      name: "ReWear Admin",
      role: "admin",
    },
  });
});

app.get("/api/admin/inventory", authMiddleware, requireAdmin, async (_req, res) => {
  const inventory = await Product.find().sort({ createdAt: -1 });
  return res.json({ success: true, inventory });
});

app.get("/api/admin/orders", authMiddleware, requireAdmin, async (_req, res) => {
  const Order = require("./models/Order");
  const orders = await Order.find().sort({ createdAt: -1 });
  return res.json({ success: true, orders });
});

app.get("/api/admin/users", authMiddleware, requireAdmin, async (_req, res) => {
  const UserModel = require("./models/User");
  const users = await UserModel.find().select("-password").sort({ createdAt: -1 });
  return res.json({ success: true, users });
});

app.get("/api/admin/returns", authMiddleware, requireAdmin, async (_req, res) => {
  const returns = await ReturnRequest.find().sort({ createdAt: -1 });
  return res.json({ success: true, returns });
});

app.patch("/api/admin/returns/:id/approve", authMiddleware, requireAdmin, async (req, res) => {
  const returnRequest = await ReturnRequest.findById(req.params.id);

  if (!returnRequest) {
    return res.status(404).json({ success: false, message: "Return request not found." });
  }

  returnRequest.status = "approved";
  returnRequest.approvedBy = req.user.email;
  returnRequest.approvedAt = new Date();
  await returnRequest.save();

  return res.json({ success: true, message: "Return request approved successfully.", returnRequest });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);

app.use(errorMiddleware);

app.seedDatabase = seedDatabase;

module.exports = app;
