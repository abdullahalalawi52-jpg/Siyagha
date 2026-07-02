export default async function handler(req: any, res: any) {
  try {
    const { default: app } = await import("../server.js");
    return app(req, res);
  } catch (error: any) {
    console.error("Failed to load backend server:", error);
    res.status(500).json({
      error: "Internal server error"
    });
  }
}
