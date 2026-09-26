import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId: number;
  userEmail: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(
      token,
      process.env["JWT_SECRET"] as string,
    ) as jwt.JwtPayload;

    (req as AuthRequest).userId = Number(payload["sub"]);
    (req as AuthRequest).userEmail = payload["email"] as string;

    next();
  } catch {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};
