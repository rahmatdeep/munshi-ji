import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import {
  requestMagicLinkSchema,
  verifyMagicLinkSchema,
  registerSchema,
  UserPayload,
} from "../types/auth";
import {
  authMiddleware,
  AuthRequest,
  adminMiddleware,
} from "../middleware/auth";
import { prisma } from "@repo/db";
import { sendMagicLink } from "../lib/mail";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Normalizes and hashes the magic token for database storage/lookup
 */
const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

router.post(
  "/request-magic-link",
  async (req: Request, res: Response): Promise<Response | void> => {
    console.log("Magic link requested for:", req.body.email);
    const result = requestMagicLinkSchema.safeParse(req.body);

    if (!result.success) {
      console.log("Validation failed:", result.error.issues);
      return res.status(400).json({ errors: result.error.issues });
    }

    const { email } = result.data;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.log("User not found in DB for email:", email);
        return res.json({
          message: "If an account exists, a magic link has been sent.",
        });
      }

      console.log("User found:", user.id, "- generating token...");

      // Generate a random plain-text token
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Delete any existing magic tokens for this user to ensure only one magic link is active
      await prisma.magicToken.deleteMany({
        where: { userId: user.id },
      });

      await prisma.magicToken.create({
        data: {
          token: tokenHash, // Store the hash in the DB
          userId: user.id,
          expiresAt,
        },
      });

      // Send the raw token to the user's email
      console.log("Calling sendMagicLink...");
      await sendMagicLink(email, token);

      return res.json({
        message: "If an account exists, a magic link has been sent.",
      });
    } catch (error) {
      console.error("Magic link request error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/verify-magic-link",
  async (req: Request, res: Response): Promise<Response | void> => {
    const result = verifyMagicLinkSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { token } = result.data;
    const tokenHash = hashToken(token);

    try {
      const magicToken = await prisma.magicToken.findUnique({
        where: { token: tokenHash }, // Search by hash
        include: { user: true },
      });

      if (!magicToken || magicToken.expiresAt < new Date()) {
        return res.status(401).json({ error: "Invalid or expired magic link" });
      }

      const user = magicToken.user;

      const payload: UserPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        lawyerId: user.lawyerId,
        role: user.role as "ADMIN" | "USER",
      };

      const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

      // Delete the token after use
      await prisma.magicToken.delete({
        where: { id: magicToken.id },
      });

      return res.json({
        message: "Login successful",
        token: jwtToken,
        user: payload,
      });
    } catch (error) {
      console.error("Magic link verification error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.post(
  "/register",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }

    const { email, name, lawyerId, role } = result.data;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email already taken" });
      }

      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          lawyerId,
          role: role as any,
        },
      });

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          lawyerId: newUser.lawyerId,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
);

router.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
