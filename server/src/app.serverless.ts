import dotenv from "dotenv";

dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import "./config/passport";
import ContractCache from "./models/contract-cache.model";
import { createRateLimiter } from "./middleware/rate-limit";

// routes
import authRoute from "./routes/auth";
import contractsRoute from "./routes/contracts";
import paymentsRoute from "./routes/payments";
import { handleWebhook } from "./controllers/payment.controller";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;

if (!mongoUri) {
  throw new Error("MONGODB_URI is required");
}

if (!sessionSecret) {
  throw new Error("SESSION_SECRET is required");
}

if (isProduction) {
  app.set("trust proxy", 1);
}

let mongoConnectionPromise: Promise<typeof mongoose> | null = null;

const ensureMongoConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(mongoUri)
      .then(async (connection) => {
        console.log("Connected to MongoDB");
        try {
          await ContractCache.syncIndexes();
          console.log("Contract cache TTL index verified");
        } catch (indexError) {
          console.error("Failed to verify contract cache TTL index", indexError);
        }
        return connection;
      })
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  await mongoConnectionPromise;
};

const globalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: "Rate limit exceeded. Try again in a minute.",
});
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 25 : 200,
  message: "Too many authentication attempts. Try again later.",
});
const analyzeRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 20 : 100,
  message: "Too many analysis requests. Please wait before retrying.",
});

const defaultAllowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const envOrigins = (process.env.CLIENT_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set<string>([
  ...defaultAllowedOrigins,
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ...envOrigins,
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(globalRateLimiter);
app.use(async (_req, _res, next) => {
  try {
    await ensureMongoConnection();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

app.use(express.json());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    store: MongoStore.create({ mongoUrl: mongoUri }),
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRateLimiter, authRoute);
app.use("/contracts", analyzeRateLimiter, contractsRoute);
app.use("/payments", paymentsRoute);

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
);

ensureMongoConnection().catch((error) => {
  console.error("Initial MongoDB connection failed", error);
});

export default app;
