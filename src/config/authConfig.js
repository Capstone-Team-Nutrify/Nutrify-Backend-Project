import jwt from "jsonwebtoken";

export const cookieStrategy = {
  name: "session",
  scheme: "cookie",
  options: {
    cookie: {
      name: "session-id",
      password: process.env.JWT_SECRET,
      isSecure: false,
      path: "/",
      ttl: 6 * 24 * 60 * 60 * 1000,
      clearInvalid: true,
    },
    validate: async (request, session) => {
      try {
        if (!session?.token) return { isValid: false };
        const decoded = jwt.verify(session.token, process.env.JWT_SECRET);
        return { isValid: true, credentials: { id: decoded.id } }; 
      } catch (err) {
        console.error("Session validation error:", err.message);
        return { isValid: false };
      }
    },
  }
};