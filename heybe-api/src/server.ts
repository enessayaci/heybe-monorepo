import dotenv from 'dotenv';

// En üstte dotenv'i yapılandır
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './database/db';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';

const app = express();
const port = process.env.PORT || 3000;

// CORS ayarları - Chrome uzantısı için özel yapılandırma
const corsOptions = {
  origin: [
    'chrome-extension://*',
    'moz-extension://*',
    'safari-web-extension://*',
    'http://localhost:3000',
    'https://my-heybe.vercel.app',
    /^chrome-extension:\/\/[a-z]{32}$/,
    /^moz-extension:\/\/[a-f0-9-]{36}$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware'ler
app.use(cors(corsOptions));
app.use(express.json());

// Preflight OPTIONS istekleri için özel handler
app.options('*', cors(corsOptions));

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
