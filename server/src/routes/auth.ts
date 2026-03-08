import express from "express";
import passport from "passport";
import User, { IUser } from "../models/user.model";
import { NextFunction, Request, Response } from "express";

const router = express.Router();
const hasGoogleOAuthConfig = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
const demoAuthEnabled =
  process.env.ENABLE_DEMO_AUTH === "true" || process.env.NODE_ENV !== "production";
const LOCAL_DEMO_EMAIL = process.env.LOCAL_DEMO_EMAIL || "demo@contractanalysis.local";
const LOCAL_DEMO_PASSWORD = process.env.LOCAL_DEMO_PASSWORD || "demo1234";

const completeLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
  user: IUser
) => {
  req.session.regenerate((sessionError: Error | null) => {
    if (sessionError) {
      return next(sessionError);
    }

    req.login(user, (loginError: Error | null) => {
      if (loginError) {
        return next(loginError);
      }

      req.session.save((saveError: Error | null) => {
        if (saveError) {
          return next(saveError);
        }
        res.json({ status: "ok", user });
      });
    });
  });
};

const assertDemoAuthEnabled = (req: Request, res: Response, next: NextFunction) => {
  if (!demoAuthEnabled) {
    res.status(403).json({ error: "Demo auth is disabled" });
    return;
  }
  next();
};

router.get(
  "/google",
  (req, res, next) => {
    if (!hasGoogleOAuthConfig) {
      res.status(503).json({ error: "Google auth is not configured" });
      return;
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!hasGoogleOAuthConfig) {
      res.status(503).json({ error: "Google auth is not configured" });
      return;
    }
    next();
  },
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

router.post("/demo-login", assertDemoAuthEnabled, async (req, res, next) => {
  try {
    const demoEmail = LOCAL_DEMO_EMAIL;

    let user = await User.findOne({ email: demoEmail });
    if (!user) {
      user = await User.create({
        googleId: "demo-local-user",
        email: demoEmail,
        displayName: "Demo User",
        profilePicture: "",
        isPremium: true,
        projectName: "My First Project",
        projectDescription: "Contract analysis workspace",
        defaultLanguage: "English",
        timezone: "Asia/Kolkata",
      });
    } else if (!user.isPremium) {
      user.isPremium = true;
      await user.save();
    }

    completeLogin(req, res, next, user);
  } catch (error) {
    next(error);
  }
});

router.post("/local-login", assertDemoAuthEnabled, async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (email !== LOCAL_DEMO_EMAIL.toLowerCase() || password !== LOCAL_DEMO_PASSWORD) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        googleId: "local-demo-user",
        email,
        displayName: "Local Demo User",
        profilePicture: "",
        isPremium: true,
        projectName: "My First Project",
        projectDescription: "Contract analysis workspace",
        defaultLanguage: "English",
        timezone: "Asia/Kolkata",
      });
    } else if (!user.isPremium) {
      user.isPremium = true;
      await user.save();
    }

    completeLogin(req, res, next, user);
  } catch (error) {
    next(error);
  }
});

router.get("/current-user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.get("/settings", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = req.user as IUser;
  res.json({
    projectName: user.projectName ?? "My First Project",
    projectDescription:
      user.projectDescription ?? "Contract analysis workspace",
    defaultLanguage: user.defaultLanguage ?? "English",
    timezone: user.timezone ?? "Asia/Kolkata",
  });
});

router.put("/settings", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = req.user as IUser;
  const {
    projectName,
    projectDescription,
    defaultLanguage,
    timezone,
  }: {
    projectName?: string;
    projectDescription?: string;
    defaultLanguage?: string;
    timezone?: string;
  } = req.body;

  const normalizeString = (value: string, maxLen: number) =>
    value.trim().replace(/\s+/g, " ").slice(0, maxLen);

  const updates: Partial<IUser> = {};
  if (typeof projectName === "string") {
    const normalized = normalizeString(projectName, 80);
    if (!normalized) {
      res.status(400).json({ error: "Project name cannot be empty" });
      return;
    }
    updates.projectName = normalized;
  }
  if (typeof projectDescription === "string") {
    updates.projectDescription = normalizeString(projectDescription, 300);
  }
  if (typeof defaultLanguage === "string") {
    updates.defaultLanguage = normalizeString(defaultLanguage, 50);
  }
  if (typeof timezone === "string") {
    updates.timezone = normalizeString(timezone, 60);
  }

  const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
    new: true,
  }).lean();

  if (!updatedUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    projectName: updatedUser.projectName,
    projectDescription: updatedUser.projectDescription,
    defaultLanguage: updatedUser.defaultLanguage,
    timezone: updatedUser.timezone,
  });
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ status: "ok" });
  });
});

export default router;
