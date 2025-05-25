import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/responseHandler.js";
import bcrypt from "bcryptjs";

const generateToken = (userId) => { 
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { 
    expiresIn: "6d",
  });
};

const setCookieWithToken = (h, token) => {
  return h.state("jwt", token, {
    ttl: 6 * 24 * 60 * 60 * 1000,
    isSecure: false,
    isHttpOnly: true,
    encoding: "none",
    isSameSite: "Lax",
    path: "/",
  });
};

export const registerUser = async (request, h) => {
  try {
    const { name, email, password } = request.payload;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return h
        .response({
          status: "error",
          data: null,
          message: "Email sudah terdaftar",
        })
        .code(400);
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken(user._id.toString());

    const userObj = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    const response = h
      .response({
        status: "success",
        data: { user: userObj },
        message: "Registrasi berhasil",
      })
      .code(201);

    return setCookieWithToken(response, token);
  } catch (err) {
    console.error("Register error:", err);
    return errorHandler(request, h, err);
  }
};

export const loginUser = async (request, h) => {
  try {
    const { email, password } = request.payload;

    if (!email || !password) {
      return h
        .response({
          status: "error",
          data: null,
          message: "Email dan password harus diisi",
        })
        .code(400);
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return h
        .response({
          status: "error",
          data: null,
          message: "Kredensial tidak valid",
        })
        .code(401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return h
        .response({
          status: "error",
          data: null,
          message: "Kredensial tidak valid",
        })
        .code(401);
    }

    const token = generateToken(user._id.toString());

    const userObj = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    const response = h.response({
      status: "success",
      data: { user: userObj },
      message: "Login berhasil",
    });

    return setCookieWithToken(response, token);
  } catch (err) {
    console.error("Login error:", err);
    return errorHandler(request, h, err);
  }
};

export const logoutUser = (request, h) => {
  try {
    return h
      .response({
        status: "success",
        message: "Logout berhasil",
      })
      .unstate("jwt", {
        path: "/",
        isSecure: false,
        isSameSite: "Lax",
      });
  } catch (err) {
    console.error("Logout error:", err);
    return errorHandler(request, h, err);
  }
};

export const currentUser = async (request, h) => {
  try {
    if (!request.auth.credentials || !request.auth.credentials.id) {
      console.error("Missing auth credentials:", request.auth);
      return h
        .response({
          status: "error",
          data: null,
          message: "Kredensial tidak valid",
        })
        .code(401);
    }

    const user = await User.findById(request.auth.credentials.id).select("-password -__v");

    if (!user) {
      return h
        .response({
          status: "error",
          data: null,
          message: "User tidak ditemukan",
        })
        .code(404);
    }

    const userObj = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    return h.response({
      status: "success",
      data: { user: userObj },
      message: "User data berhasil diambil",
    });
  } catch (err) {
    console.error("currentUser error:", err);
    return errorHandler(request, h, err);
  }
};
