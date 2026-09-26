import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async ({
  name,
  email,
  phone,
  password,
}: RegisterInput) => {
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (existingUser) {
    if (existingUser.email === email) throw new Error("Email already registered");
    throw new Error("Phone number already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
  });

  const payload = { sub: user.id, email: user.email };

  const accessToken = jwt.sign(payload, process.env["JWT_SECRET"] as string, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    payload,
    process.env["JWT_REFRESH_SECRET"] as string,
    { expiresIn: "7d" },
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  };
};

export const refreshAccessToken = (refreshToken: string) => {
  try {
    const payload = jwt.verify(
      refreshToken,
      process.env["JWT_REFRESH_SECRET"] as string,
    ) as jwt.JwtPayload;

    const tokenPayload = { sub: payload["sub"], email: payload["email"] };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env["JWT_SECRET"] as string,
      { expiresIn: "15m" },
    );

    const newRefreshToken = jwt.sign(
      tokenPayload,
      process.env["JWT_REFRESH_SECRET"] as string,
      { expiresIn: "7d" },
    );

    return { accessToken, refreshToken: newRefreshToken };
  } catch {
    throw new Error("Invalid or expired refresh token");
  }
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }

  const payload = { sub: user.id, email: user.email };

  const accessToken = jwt.sign(payload, process.env["JWT_SECRET"] as string, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    payload,
    process.env["JWT_REFRESH_SECRET"] as string,
    { expiresIn: "7d" },
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};