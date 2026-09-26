const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect("mongodb://localhost:27017/rewear");
  console.log("Connected to MongoDB");
};

const seedData = async () => {
  await connectDB();

  const db = mongoose.connection.db;

  const collections = [
    "users",
    "categories",
    "products",
    "carts",
    "orders",
    "reviews",
    "payments",
  ];

  for (const collection of collections) {
    try {
      await db.collection(collection).deleteMany({});
      console.log(`Cleared ${collection}`);
    } catch (error) {
      console.log(`Collection ${collection} not found yet`);
    }
  }

  const users = await db.collection("users").insertMany([
    {
      fullName: "ReWear Admin",
      email: "admin@rewear.com",
      phone: "9999999999",
      password: "admin123",
      category: "admin",
      role: "admin",
      agreeTerms: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      fullName: "Demo Customer",
      email: "user@rewear.com",
      phone: "8888888888",
      password: "user123",
      category: "women",
      role: "user",
      agreeTerms: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const adminUser = await db.collection("users").findOne({ email: "admin@rewear.com" });
  const normalUser = await db.collection("users").findOne({ email: "user@rewear.com" });

  await db.collection("categories").insertMany([
    {
      name: "Men",
      description: "Smart essentials and casual layering for men.",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=687&auto=format&fit=crop",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Women",
      description: "Premium dresses, fits, and everyday statement looks.",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=687&auto=format&fit=crop",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Kids",
      description: "Comfortable, playful styles built for movement.",
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=687&auto=format&fit=crop",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const products = await db.collection("products").insertMany([
    {
      name: "Urban Layer Jacket",
      category: "Men",
      price: 1999,
      stock: 18,
      status: "active",
      description: "Structured outerwear for everyday layering.",
      image: "https://images.unsplash.com/photo-1550967155-97a1ebf16bd2?q=80&w=1974&auto=format&fit=crop",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Blue Blossom",
      category: "Women",
      price: 1740,
      stock: 11,
      status: "active",
      description: "Soft statement dress with premium finish.",
      image: "https://images.unsplash.com/photo-1763294632421-84383bbb9dda?q=80&w=687&auto=format&fit=crop",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Mini Hoodie",
      category: "Kids",
      price: 1460,
      stock: 24,
      status: "featured",
      description: "Comfortable everyday hoodie for kids.",
      image: "https://plus.unsplash.com/premium_photo-1706151506322-f5d534b59263?w=600&auto=format&fit=crop&q=60",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const product1 = await db.collection("products").findOne({ name: "Urban Layer Jacket" });
  const product2 = await db.collection("products").findOne({ name: "Blue Blossom" });

  await db.collection("carts").insertOne({
    userId: normalUser._id,
    items: [{ productId: product1._id, quantity: 1 }],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const orderInsert = await db.collection("orders").insertOne({
    userId: normalUser._id,
    customer: {
      fullName: normalUser.fullName,
      email: normalUser.email,
    },
    items: [
      {
        productId: product1._id,
        name: product1.name,
        price: product1.price,
        quantity: 1,
      },
      {
        productId: product2._id,
        name: product2.name,
        price: product2.price,
        quantity: 2,
      },
    ],
    shippingAddress: {
      fullName: normalUser.fullName,
      phone: normalUser.phone,
      address: "Test Address",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
    },
    paymentMethod: "COD",
    subtotal: product1.price + product2.price * 2,
    shipping: 120,
    total: product1.price + product2.price * 2 + 120,
    status: "Pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection("reviews").insertOne({
    productId: product1._id,
    userId: normalUser._id,
    userName: normalUser.fullName,
    rating: 5,
    comment: "Very nice product and good quality.",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection("payments").insertOne({
    userId: normalUser._id,
    orderId: orderInsert.insertedId,
    paymentId: "",
    signature: "",
    gateway: "manual",
    method: "UPI",
    amount: 1200,
    currency: "INR",
    status: "pending",
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seed completed successfully.");
  console.log({ adminUser: adminUser.email, customerUser: normalUser.email, productCount: products.insertedCount });

  await mongoose.disconnect();
};

seedData().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
