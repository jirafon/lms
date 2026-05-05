import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      message: "Internal server error during authentication",
      success: false,
    });
  }
};
export default isAuthenticated;
