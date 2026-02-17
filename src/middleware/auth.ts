import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";
import { prisma } from "../config/database";
import { AppError } from "./errorHandler";

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.split("Bearer ")[1];

  let decodedToken;
  try {
    decodedToken = await firebaseAuth.verifyIdToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  let user = await prisma.user.findUnique({
    where: { firebaseUid: decodedToken.uid },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || "",
        displayName: decodedToken.name || null,
        avatarUrl: decodedToken.picture || null,
      },
    });
  }

  req.user = user;
  next();
}
