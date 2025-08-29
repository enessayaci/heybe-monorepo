import dotenv from "dotenv";

// En üstte dotenv'i yapılandır
dotenv.config();

import express from "express";
import cors from "cors";
import { connectToDatabase } from "./database/db";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // null origin (Postman, cURL) veya http:// ile başlayanları engelle
    if (!origin || origin.startsWith("http://")) {
      return callback(
        new Error("Yalnızca HTTPS kaynaklara izin verilir"),
        false
      );
    }
    // https:// ile başlayan tüm kaynaklara izin ver
    if (origin.startsWith("https://")) {
      return callback(null, true);
    }
    callback(new Error("Geçersiz kaynak"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
};

// Postman gibi araçları ek olarak engelle
const restrictPostman = (req: any, res: any, next: any) => {
  const userAgent = req.get("User-Agent") || "";
  if (userAgent.includes("Postman") || userAgent.includes("curl")) {
    return res.status(403).json({ error: "Yetkisiz istemci" });
  }
  next();
};

// Express.js kullanımı
app.use(restrictPostman);
app.use(cors(corsOptions));
app.use(express.json());

// Preflight OPTIONS istekleri için özel handler
app.options("*", cors(corsOptions));

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server çalışıyor" });
});

// Veritabanı bağlantısı
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server ${port} portunda çalışıyor`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔐 Auth API: http://localhost:${port}/api/auth`);
      console.log(`📦 Product API: http://localhost:${port}/api/products`);
    });
  })
  .catch((error) => {
    console.error("❌ Veritabanı bağlantı hatası:", error);
    process.exit(1);
  });
