import jwt from "jsonwebtoken";

const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const bearerToken =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return next();
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (decode?.userId) {
      req.id = decode.userId;
    }
  } catch {
    // Token inválido o expirado: continuar como visitante.
  }

  next();
};

export default optionalAuth;
