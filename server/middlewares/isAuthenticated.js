import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Token received:", token);

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decode);

    if (!decode) {
      console.log("Invalid token");
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      message: "Internal server error during authentication",
      success: false,
    });
  }
};
export default isAuthenticated;
