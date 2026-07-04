import path from "path";
import express from "express";
import app from "./server/app";

const PORT = process.env.PORT || 3000;

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
