import express from "express";
import path from "path";
import helmet from "helmet";
import dotenv from "dotenv";

import { sanitizeRequestBody, csrfCheck, corsMiddleware } from "./server/middleware";
import emailRouter from "./server/routes/email";
import aiRouter from "./server/routes/ai";
import shareRouter from "./server/routes/share";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

async function configureStaticAndListen() {
  if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  configureStaticAndListen();
}

export default app;
