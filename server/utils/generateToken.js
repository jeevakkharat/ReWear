const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "rewear_super_secret_key_change_this";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(
    {
      id: user._id ? user._id.toString() : user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

module.exports = generateToken;
