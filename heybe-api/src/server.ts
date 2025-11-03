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

const developmentUrls = [
  "http://localhost:5173",
  "chrome-extension://chgineallhlahnpbaoceclhjohpndhlo",
  "safari-web-extension://1af61dc8-2b41-4175-95be-08411db2b2df",
];

// const corsOptions = {
//   origin: (
//     origin: string | undefined,
//     callback: (err: Error | null, allow?: boolean) => void
//   ) => {
//     // Geliştirme ortamında izin verilen URL'ler, şimdilik eklenti dışından da gelenleri kabul et
//     // if (!origin || developmentUrls.includes(origin)) {
//     //   return callback(null, true);
//     // }
//     if (!origin) {
//       return callback(null, true);
//     }
//     // Üretim ortamında yalnızca HTTPS kaynaklara izin ver
//     if (origin.startsWith("https://")) {
//       return callback(null, true);
//     }
//     // Diğer tüm durumlar için hata fırlat
//     callback(new Error(`Geçersiz kaynak: ${origin || "undefined"}`), false);
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//     "Accept",
//     "Origin",
//   ],
// };

// GÜVENLİ DEĞİL: Bu ayar, 'credentials: true' ile birlikte çalışması için
const corsOptions = {
  origin: "*", // Herkese açık
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
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
      console.log(`🚀 Server çalışıyor`);
      console.log(`📊 Health check: /health`);
    });
  })
  .catch((error) => {
    console.error("❌ Veritabanı bağlantı hatası:", error);
    process.exit(1);
  });
