export default async function handler(req: any, res: any) {
  try {
    const { default: app } = await import("../server");
    return app(req, res);
  } catch (error: any) {
    res.status(500).json({
      error: `Failed to load backend server: ${error.message || error}\nStack: ${error.stack || 'No stack trace available'}`,
      message: error.message,
      stack: error.stack
    });
  }
}
