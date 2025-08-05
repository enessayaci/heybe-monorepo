module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    console.log("🔍 [Test API] Environment check:");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("NODE_ENV:", process.env.NODE_ENV);

    res.status(200).json({
      success: true,
      message: "Test API working",
      timestamp: new Date().toISOString(),
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error("❌ [Test API] Error:", error);
    res.status(500).json({
      error: "Test API failed",
      details: error.message,
    });
  }
};
