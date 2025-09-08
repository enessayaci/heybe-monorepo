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

const developmentUrls = ["http://localhost:5173"];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Geliştirme ortamında izin verilen URL'ler
    if (!origin || developmentUrls.includes(origin)) {
      return callback(null, true);
    }
    // Üretim ortamında yalnızca HTTPS kaynaklara izin ver
    if (origin.startsWith("https://")) {
      return callback(null, true);
    }
    // Diğer tüm durumlar için hata fırlat
    callback(new Error(`Geçersiz kaynak: ${origin || "undefined"}`), false);
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

// Express.js kullanımı
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
