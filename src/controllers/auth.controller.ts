import type { Request, Response } from "express";
import { registerUser, loginUser, refreshAccessToken } from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Name, email, phone and password are required",
      });
    }

    const user = await registerUser({ name, email, phone, password });

    return res.status(201).json({
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Email already registered" ||
        error.message === "Phone number already registered"
      ) {
        return res.status(409).json({ message: error.message });
      }
    }

    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      message: "Login successful",
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      return res.status(401).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const result = refreshAccessToken(refreshToken);

    return res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid or expired refresh token"
    ) {
      return res.status(401).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};