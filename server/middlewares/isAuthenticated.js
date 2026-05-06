import jwt from "jsonwebtoken";
import { sendError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return sendError(res, {
        status: 401,
        message: "User not authenticated",
      });
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return sendError(res, {
        status: 401,
        message: "Invalid token",
      });
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return sendError(res, {
        status: 401,
        message: "Invalid token",
      });
    }

    logger.error("Authentication error", { error: error.message });
    return sendError(res, {
      status: 500,
      message: "Internal server error during authentication",
    });
  }
};
export default isAuthenticated;
