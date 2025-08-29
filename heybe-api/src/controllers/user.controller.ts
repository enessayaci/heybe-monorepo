import { Request, Response } from "express";
import {
  createUser,
  findUserByEmail,
  createGuestUser,
  findUserById,
  deleteUserById,
} from "../services/user.service";
import { generateToken } from "../utils/jwt.utils";
import { transferProductsFromGuestToUser } from "../services/product.service";
import { AuthRequest } from "@/types/auth.types";
import * as bcrypt from "bcryptjs";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email ve şifre gereklidir",
      });
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Geçerli bir email adresi giriniz",
      });
    }

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Bu email adresi zaten kullanılıyor",
      });
    }

    // Şifreyi hash'le
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Kullanıcıyı oluştur
    const newUser = await createUser({
      email,
      password: hashedPassword,
      is_guest: false,
    });

    // JWT token oluştur
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: "Kullanıcı başarıyla oluşturuldu",
      data: {
        user: {
          email: newUser.email,
          is_guest: newUser.is_guest,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Kullanıcı kayıt hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// Guest token ile register (ürün transferi ile)
export const registerUserWithGuestTransfer = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { email, password } = req.body;
    const guestUserId = req.user!.id; // Guest token'dan user_id

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email ve şifre gereklidir",
      });
    }

    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Geçerli bir email adresi giriniz",
      });
    }

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Bu email adresi zaten kullanılıyor",
      });
    }

    // Guest kullanıcının geçerliliğini kontrol et
    const guestUser = await findUserById(guestUserId);
    if (!guestUser || !guestUser.is_guest) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz guest token",
      });
    }

    // Şifreyi hash'le
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Kullanıcıyı oluştur
    const newUser = await createUser({
      email,
      password: hashedPassword,
      is_guest: false,
    });

    // Ürünleri transfer et
    try {
      await transferProductsFromGuestToUser(guestUserId, newUser.id);
      console.log(
        `✅ Ürünler başarıyla transfer edildi: ${guestUserId} → ${newUser.id}`
      );

      // Transfer başarılı olduktan sonra guest kullanıcıyı sil
      const deleted = await deleteUserById(guestUserId);
      if (deleted) {
        console.log(`🗑️ Guest kullanıcı silindi: ${guestUserId}`);
      }
    } catch (transferError) {
      console.error("Ürün transfer hatası:", transferError);
      // Transfer hatası olsa bile kullanıcı kaydı başarılı sayılır
    }

    // JWT token oluştur
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: "Kullanıcı başarıyla oluşturuldu ve ürünler transfer edildi",
      data: {
        user: {
          email: newUser.email,
          is_guest: newUser.is_guest,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Kullanıcı kayıt hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email ve şifre gereklidir",
      });
    }

    // Kullanıcıyı bul
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz email veya şifre",
      });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz email veya şifre",
      });
    }

    // JWT token oluştur
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: "Giriş başarılı",
      data: {
        user: {
          email: user.email,
          is_guest: user.is_guest,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Kullanıcı giriş hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

// Guest token ile login (ürün transferi ile)
export const loginUserWithGuestTransfer = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { email, password } = req.body;
    const guestUserId = req.user!.id; // Guest token'dan user_id

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email ve şifre gereklidir",
      });
    }

    // Kullanıcıyı bul
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz email veya şifre",
      });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Geçersiz email veya şifre",
      });
    }

    // Guest kullanıcının geçerliliğini kontrol et
    const guestUser = await findUserById(guestUserId);
    if (guestUser && guestUser.is_guest) {
      try {
        // Ürünleri transfer et
        await transferProductsFromGuestToUser(guestUserId, user.id);
        console.log(
          `✅ Ürünler başarıyla transfer edildi: ${guestUserId} → ${user.id}`
        );

        // Transfer başarılı olduktan sonra guest kullanıcıyı sil
        const deleted = await deleteUserById(guestUserId);
        if (deleted) {
          console.log(`🗑️ Guest kullanıcı silindi: ${guestUserId}`);
        }
      } catch (transferError) {
        console.error("Ürün transfer hatası:", transferError);
        // Transfer hatası olsa bile giriş başarılı sayılır
      }
    }

    // JWT token oluştur
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: "Giriş başarılı",
      data: {
        user: {
          email: user.email,
          is_guest: user.is_guest,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Kullanıcı giriş hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

export const createGuestToken = async (req: Request, res: Response) => {
  try {
    // Misafir kullanıcı oluştur
    const guestUser = await createGuestUser();

    // JWT token oluştur
    const token = generateToken(guestUser.id);

    res.status(201).json({
      success: true,
      message: "Misafir token başarıyla oluşturuldu",
      data: {
        user: {
          email: guestUser.email,
          is_guest: guestUser.is_guest,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Misafir token oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};

export const validateToken = async (req: AuthRequest, res: Response) => {
  try {
    // authenticateToken middleware'i zaten token'ı doğruladı ve req.user'ı set etti
    const user = req.user!;

    res.status(200).json({
      success: true,
      message: "Token geçerli",
      data: {
        email: user.email,
        is_guest: user.is_guest,
      },
    });
  } catch (error) {
    console.error("Token doğrulama hatası:", error);
    res.status(500).json({
      success: false,
      message: "Sunucu hatası",
    });
  }
};
