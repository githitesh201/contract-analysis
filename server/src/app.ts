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

// routes
import authRoute from "./routes/auth";
import contractsRoute from "./routes/contracts";
import paymentsRoute from "./routes/payments";
import { handleWebhook } from "./controllers/payment.controller";

const app = express();

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log("Connected to MongoDB");
    try {
      await ContractCache.syncIndexes();
      console.log("Contract cache TTL index verified");
    } catch (indexError) {
      console.error("Failed to verify contract cache TTL index", indexError);
    }
  })
  .catch((err) => console.error(err));

app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigin = process.env.CLIENT_URL;
      const allowedOrigins = new Set<string>([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ]);

      if (configuredOrigin) {
        allowedOrigins.add(configuredOrigin);
      }

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

app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI! }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoute);
app.use("/contracts", contractsRoute);
app.use("/payments", paymentsRoute);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
