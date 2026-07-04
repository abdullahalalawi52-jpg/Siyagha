import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";

import { sanitizeRequestBody, csrfCheck, corsMiddleware } from "./middleware";
import emailRouter from "./routes/email";
import aiRouter from "./routes/ai";
import shareRouter from "./routes/share";

dotenv.config();

const app = express();

// Enable Helmet with hardened Content Security Policy (CSP) directives
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        "https://generativelanguage.googleapis.com",
        "https://firestore.googleapis.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://*.firebaseio.com",
        "https://*.googleapis.com"
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Default body limit for standard routes (1MB) to prevent Denial of Service (DoS)
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeRequestBody);
app.use(csrfCheck);
app.use(corsMiddleware);

// API & Shared Routes
app.use('/api', emailRouter);
app.use('/api', aiRouter);
app.use(shareRouter);

export default app;
